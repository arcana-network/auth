import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  getWalletType,
  getSentryErrorReporter,
  isDefined,
  constructLoginUrl,
  getCurrentUrl,
  getConstructorParams,
  getInitParams,
  removeHexPrefix,
} from './utils'
import { getNetworkConfig, getRpcConfig } from './config'
import {
  AppConfig,
  AppMode,
  InitParams,
  ConstructorParams,
  ChainConfigInput,
  NetworkConfig,
  Position,
  RpcConfig,
  Theme,
  ThemeConfig,
  UserInfo,
  InitStatus,
  Logins,
} from './typings'
import { getAppInfo, getImageUrls } from './appInfo'
import { WalletNotInitializedError, ArcanaAuthError } from './errors'
import {
  getLogger,
  Logger,
  LOG_LEVEL,
  setExceptionReporter,
  setLogLevel,
} from './logger'
import { Chain } from './chainList'
import Popup from './popup'
import { ModalController } from './ui/modalController'

class AuthProvider {
  public appId: string
  private params: ConstructorParams
  private appConfig: AppConfig
  private logger: Logger
  private iframeWrapper: IframeWrapper
  private networkConfig: NetworkConfig
  private rpcConfig: RpcConfig
  private initStatus: InitStatus = InitStatus.CREATED
  private initPromises: ((value: AuthProvider) => void)[] = []
  private _provider: ArcanaProvider
  private connectCtrl: ModalController
  constructor(appId: string, p?: Partial<ConstructorParams>) {
    if (!isDefined(appId)) {
      throw new Error('appId is required')
    }
    this.appId = removeHexPrefix(appId)
    this.params = getConstructorParams(p)
    this.networkConfig = getNetworkConfig(this.params.network)
    this.rpcConfig = getRpcConfig(this.params.chainConfig, this.params.network)

    this.logger = getLogger('AuthProvider')
    if (this.params.debug) {
      setLogLevel(LOG_LEVEL.DEBUG)
      if (this.networkConfig.sentryDsn) {
        setExceptionReporter(
          getSentryErrorReporter(this.networkConfig.sentryDsn)
        )
      }
    } else {
      setLogLevel(LOG_LEVEL.NOLOGS)
    }
  }

  /**
   * A function to initialize the wallet, should be called before getting provider
   */
  public async init(input?: Partial<InitParams>): Promise<AuthProvider> {
    if (this.initStatus === InitStatus.CREATED) {
      this.initStatus = InitStatus.RUNNING
      const { appMode, position } = getInitParams(input)

      if (this.iframeWrapper) {
        return this
      }

      await this.setAppConfig()

      this.iframeWrapper = new IframeWrapper({
        appId: this.appId,
        iframeUrl: this.networkConfig.walletUrl,
        appConfig: this.appConfig,
        position: position,
      })

      const walletType = await getWalletType(
        this.appId,
        this.networkConfig.gatewayUrl
      )
      this.iframeWrapper.setWalletType(walletType, appMode)

      this._provider = new ArcanaProvider(this.iframeWrapper, this.rpcConfig)
      await this._provider.init({
        loginWithLink: this.loginWithLink,
        loginWithSocial: this.loginWithSocial,
      })
      this.setProviders()

      this.initStatus = InitStatus.DONE

      this.resolveInitPromises()
      return this
    } else if (this.initStatus === InitStatus.RUNNING) {
      return await this.waitForInit()
    }
    return this
  }

  /**
   * A function to open the modal and do the arcana login
   */
  public async connect(mode: 'dark' | 'light' = 'dark') {
    if (this.initStatus !== InitStatus.DONE) {
      await this.init()
    }
    if (!this.connectCtrl) {
      this.connectCtrl = new ModalController({
        loginWithLink: this.loginWithLink,
        loginWithSocial: this.loginWithSocial,
        loginList: await this.getLogins(),
        mode: mode,
      })
    }
    this.connectCtrl.open()
    const provider = await this.waitForConnect()
    this.connectCtrl.close()

    return provider
  }

  /**
   * A function to trigger social login in the wallet
   */
  loginWithSocial = async (loginType: string): Promise<ArcanaProvider> => {
    if (this.initStatus === InitStatus.DONE) {
      if (!(await this._provider.isLoginAvailable(loginType))) {
        throw new Error(`${loginType} login is not available`)
      }
      const url = this.getLoginUrl(loginType)
      return this.beginLogin(url)
    }
    this.logger.error('requestSocialLogin', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to trigger passwordless login in the wallet
   */
  loginWithLink = (email: string): Promise<ArcanaProvider> => {
    if (this.initStatus === InitStatus.DONE) {
      const url = this.getLoginUrl('passwordless', email)
      return this.beginLogin(url)
    }
    this.logger.error('requestPasswordlessLogin', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to get user info for logged in user
   * @returns available user info
   */
  public getUser(): Promise<UserInfo> {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider.requestUserInfo()
    }
    this.logger.error('requestUserInfo', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to determine whether user is logged in
   */
  public async isLoggedIn() {
    if (this.initStatus === InitStatus.DONE) {
      const isLoggedIn = this._provider.isLoggedIn()
      return isLoggedIn
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to logout the user
   */
  public logout() {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider.triggerLogout()
    }
    this.logger.error('logout', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to request public key of different users
   */
  public async getPublicKey(email: string) {
    if (this.initStatus === InitStatus.DONE) {
      if (!email || email === '') {
        throw new ArcanaAuthError(
          'email_required',
          `Email is required in getPublicKey, got ${email}`
        )
      }
      return await this._provider.getPublicKey(email, 'google')
    }
    this.logger.error('requestPublicKey', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to request list of available logins
   */
  public async getLogins() {
    if (this.initStatus === InitStatus.DONE) {
      return await this._provider.getAvailableLogins()
    }
    this.logger.error('getLogins', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to get web3 provider
   * @deprecated use .provider instead
   */
  public getProvider() {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider
    }
    this.logger.error('getProvider', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /* Private functions */

  private getLoginUrl(loginType: string, email?: string) {
    return constructLoginUrl({
      loginType,
      appId: this.appId,
      email,
      authUrl: this.networkConfig.authUrl,
      redirectUrl: this.params.redirectUrl
        ? this.params.redirectUrl
        : getCurrentUrl(),
    })
  }

  private async beginLogin(url: string): Promise<ArcanaProvider> {
    const popup = new Popup(url)
    await popup.open()
    return await this.waitForConnect()
  }

  private waitForConnect(): Promise<ArcanaProvider> {
    return new Promise((resolve) => {
      this._provider.on('connect', () => {
        return resolve(this._provider)
      })
    })
  }

  private async setAppConfig() {
    const appInfo = await getAppInfo(this.appId, this.networkConfig.gatewayUrl)
    const appImageURLs = getImageUrls(
      this.appId,
      appInfo.theme,
      this.networkConfig.gatewayUrl
    )
    this.appConfig = {
      name: appInfo.name,
      themeConfig: {
        assets: {
          logo: {
            horizontal: appImageURLs.horizontal,
            vertical: appImageURLs.vertical,
          },
        },
        theme: appInfo.theme,
      },
    }
  }

  private async waitForInit(): Promise<AuthProvider> {
    const promise = new Promise<AuthProvider>((resolve) => {
      this.initPromises.push(resolve)
    })
    return await promise
  }

  private async resolveInitPromises() {
    const list = this.initPromises
    this.initPromises = []

    for (const r of list) {
      r(this)
    }
  }

  /**
   * @internal
   */
  get provider() {
    if (this._provider) {
      return this._provider
    }
    this.logger.error('provider', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  get logo() {
    if (this.initStatus === InitStatus.DONE) {
      return this.appConfig.themeConfig.assets.logo
    }
    this.logger.error('logo', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  get theme() {
    if (this.initStatus === InitStatus.DONE) {
      return this.appConfig.themeConfig.theme
    }
    this.logger.error('theme', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private setProviders() {
    if (!(window as Record<string, any>).arcana) {
      ;(window as Record<string, any>).arcana = {}
    }
    ;(window as Record<string, any>).arcana.provider = this._provider
    if (!(window as Record<string, any>).ethereum) {
      ;(window as Record<string, any>).ethereum = {}
    }
    if (!(window as Record<string, any>).providers) {
      ;(window as Record<string, any>).ethereum.providers = []
    }
    ;(window as Record<string, any>).ethereum.providers.push(this._provider)
  }
  /* eslint-enable */
}

export {
  AuthProvider,
  ConstructorParams,
  ChainConfigInput,
  Chain as CHAIN,
  AppConfig,
  Theme,
  AppMode,
  Position,
  RpcConfig,
  Logins,
  UserInfo,
  ThemeConfig,
  InitParams,
  NetworkConfig,
}
