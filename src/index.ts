import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  getErrorReporter,
  constructLoginUrl,
  getCurrentUrl,
  getConstructorParams,
  removeHexPrefix,
  preLoadIframe,
  validateAppAddress,
  isClientId,
  getParamsFromClientId,
} from './utils'
import { getNetworkConfig } from './config'
import {
  AppConfig,
  AppMode,
  ConstructorParams,
  NetworkConfig,
  Position,
  Theme,
  ThemeConfig,
  UserInfo,
  InitStatus,
  Logins,
  EthereumProvider,
  WalletType,
} from './typings'
import { getAppInfo, getImageUrls } from './appInfo'
import { ErrorNotInitialized, ArcanaAuthError } from './errors'
import { LOG_LEVEL, setExceptionReporter, setLogLevel } from './logger'
import Popup from './popup'
import { ModalController } from './ui/modalController'

type ExtraParams = 'sessionId' | 'setToken' | 'email'

class AuthProvider {
  public appId: string
  private params: ConstructorParams
  private appConfig: AppConfig
  private iframeWrapper: IframeWrapper
  private networkConfig: NetworkConfig
  private initStatus: InitStatus = InitStatus.CREATED
  private initPromises: ((value: AuthProvider) => void)[] = []
  private _provider: ArcanaProvider
  private connectCtrl: ModalController
  constructor(clientId: string, p?: Partial<ConstructorParams>) {
    let network = p?.network
    let appAddress = clientId

    if (isClientId(clientId)) {
      const parts = getParamsFromClientId(clientId)
      network = parts.network
      appAddress = parts.address
    }

    validateAppAddress(appAddress)

    this.appId = removeHexPrefix(appAddress)

    this.params = getConstructorParams({ ...p, network })
    this.networkConfig = getNetworkConfig(this.params.network)

    preLoadIframe(this.networkConfig.walletUrl, this.appId)
    this._provider = new ArcanaProvider()

    if (this.params.debug) {
      setLogLevel(LOG_LEVEL.DEBUG)
      setExceptionReporter(getErrorReporter())
    } else {
      setLogLevel(LOG_LEVEL.NOLOGS)
    }
  }

  /**
   * A function to initialize the wallet, should be called before getting provider
   */
  public async init(): Promise<AuthProvider> {
    if (this.initStatus === InitStatus.CREATED) {
      this.initStatus = InitStatus.RUNNING

      const appMode = this.params.alwaysVisible ? AppMode.Full : AppMode.Widget

      if (this.iframeWrapper) {
        return this
      }

      await this.setAppConfig()

      this.iframeWrapper = new IframeWrapper({
        appId: this.appId,
        iframeUrl: this.networkConfig.walletUrl,
        appConfig: this.appConfig,
        position: this.params.position,
      })

      this.iframeWrapper.setWalletType(WalletType.UI, appMode)

      await this._provider.init(this.iframeWrapper, {
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
   * A function to open login plug n play modal
   */
  public async connect(): Promise<EthereumProvider> {
    if (this.initStatus !== InitStatus.DONE) {
      await this.init()
    }

    if (await this.isLoggedIn()) {
      return this._provider
    }

    const logins = await this.getLogins()

    if (!this.connectCtrl) {
      this.connectCtrl = new ModalController({
        loginWithLink: this.loginWithLink,
        loginWithSocial: this.loginWithSocial,
        loginList: logins,
        mode: this.theme,
        logo: this.logo.vertical,
      })
    }
    return new Promise((resolve, reject) => {
      this.connectCtrl.open((err?: Error) => {
        if (err) {
          return reject(err)
        }
      })

      this.waitForConnect()
        .then((p) => {
          this.connectCtrl.close()
          resolve(p)
        })
        .catch(reject)
    })
  }
  /**
   * A function to show wallet
   */
  public showWallet() {
    if (!this.connected) {
      throw new Error('no connection yet, cannot show wallet')
    }

    this.iframeWrapper.show()
  }

  /**
   * A function to trigger social login in the wallet
   */
  loginWithSocial = async (loginType: string): Promise<EthereumProvider> => {
    if (this.initStatus === InitStatus.DONE) {
      if (await this.isLoggedIn()) {
        return this._provider
      }
      if (!(await this._provider.isLoginAvailable(loginType))) {
        throw new Error(`${loginType} login is not available`)
      }
      const url = this.getLoginUrl(loginType)
      return this.beginLogin(url)
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to trigger passwordless login in the wallet
   */
  loginWithLink = async (email: string): Promise<EthereumProvider> => {
    if (this.initStatus === InitStatus.DONE) {
      if (await this.isLoggedIn()) {
        return this._provider
      }
      const params = await this._provider.initPasswordlessLogin(email)
      const url = this.getLoginUrl('passwordless', { ...params, email })
      return this.beginLogin(url)
    }
    throw ErrorNotInitialized
  }

  get connected() {
    return this._provider.connected
  }

  /**
   * A function to get user info for logged in user
   * @returns available user info
   */
  public getUser(): Promise<UserInfo> {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider.requestUserInfo()
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to determine whether user is logged in
   */
  public async isLoggedIn() {
    if (this.initStatus === InitStatus.DONE) {
      const isLoggedIn = this._provider.isLoggedIn()
      return isLoggedIn
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to logout the user
   */
  public logout() {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider.triggerLogout()
    }
    throw ErrorNotInitialized
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
    throw ErrorNotInitialized
  }

  /**
   * A function to request list of available logins
   */
  public async getLogins() {
    if (this.initStatus === InitStatus.DONE) {
      return await this._provider.getAvailableLogins()
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to get web3 provider
   * @deprecated use .provider instead
   */
  public getProvider() {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider
    }
    throw ErrorNotInitialized
  }

  /* Private functions */

  private getLoginUrl(
    loginType: string,
    params?: { [k in ExtraParams]: string }
  ) {
    return constructLoginUrl({
      loginType,
      appId: this.appId,
      authUrl: this.networkConfig.authUrl,
      parentUrl: getCurrentUrl(),
      ...params,
    })
  }
  /**
   * @internal
   */
  get chainId() {
    return this._provider.chainId
  }

  private async beginLogin(url: string): Promise<EthereumProvider> {
    const popup = new Popup(url)
    await popup.open()
    return await this.waitForConnect()
  }

  private waitForConnect(): Promise<EthereumProvider> {
    return new Promise((resolve) => {
      if (this.connected) {
        return resolve(this._provider)
      }
      this._provider.on('connect', () => {
        return resolve(this._provider)
      })
    })
  }

  private async setAppConfig() {
    const appInfo = await getAppInfo(this.appId, this.networkConfig.gatewayUrl)
    const appImageURLs = getImageUrls(
      this.appId,
      this.params.theme,
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
        theme: this.params.theme,
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
    throw ErrorNotInitialized
  }

  get logo() {
    if (this.initStatus === InitStatus.DONE) {
      return this.appConfig.themeConfig.assets.logo
    }
    throw ErrorNotInitialized
  }

  get theme() {
    if (this.initStatus === InitStatus.DONE) {
      return this.appConfig.themeConfig.theme
    }
    throw ErrorNotInitialized
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
  EthereumProvider,
  AppConfig,
  Theme,
  Position,
  Logins,
  UserInfo,
  ThemeConfig,
  NetworkConfig,
}
