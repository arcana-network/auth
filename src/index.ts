import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  getConstructorParams,
  getErrorReporter,
  getParamsFromClientId,
  isClientId,
  preLoadIframe,
  removeHexPrefix,
  validateAppAddress,
} from './utils'
import { getNetworkConfig } from './config'
import {
  AppConfig,
  AppMode,
  BearerAuthentication,
  ChainConfigInput,
  ConstructorParams,
  EthereumProvider,
  FirebaseBearer,
  InitStatus,
  Logins,
  NetworkConfig,
  Position,
  Theme,
  ThemeConfig,
  UserInfo,
} from './typings'
import { getAppInfo, getImageUrls } from './appInfo'
import { ArcanaAuthError, ErrorNotInitialized } from './errors'
import { LOG_LEVEL, setExceptionReporter, setLogLevel } from './logger'
import Popup from './popup'
import { ModalController } from './ui/modalController'

class AuthProvider {
  public appId: string
  private params: ConstructorParams
  private appConfig: AppConfig
  private iframeWrapper: IframeWrapper
  private networkConfig: NetworkConfig
  private rpcConfig: ChainConfigInput | undefined
  private initStatus: InitStatus = InitStatus.CREATED
  private initPromises: ((value: AuthProvider) => void)[] = []
  private _provider: ArcanaProvider
  private connectCtrl: ModalController
  private _standaloneMode: {
    mode: 1 | 2
    handler: (...args: any) => void | undefined
  }
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
    this.rpcConfig = this.params.chainConfig
    this._provider = new ArcanaProvider(this.rpcConfig)

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

      if (this.iframeWrapper) {
        return this
      }

      await this.setAppConfig()

      this.iframeWrapper = new IframeWrapper({
        appId: this.appId,
        iframeUrl: this.networkConfig.walletUrl,
        appConfig: this.appConfig,
        position: this.params.position,
        standaloneMode: this._standaloneMode,
      })

      this.iframeWrapper.setWalletType(
        this.params.appMode ??
          (this.params.alwaysVisible ? AppMode.Full : AppMode.Widget)
      )

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
    this._provider.expandWallet()
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
      const url = await this._provider.initSocialLogin(loginType)
      return this.beginLogin(url)
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to trigger passwordless login in the wallet
   */
  loginWithLink = async (
    email: string,
    emailSentHook?: () => void
  ): Promise<EthereumProvider> => {
    if (this.initStatus === InitStatus.DONE) {
      if (await this.isLoggedIn()) {
        return this._provider
      }
      await this._provider.initPasswordlessLogin(email)
      if (emailSentHook) {
        emailSentHook()
      }
      return await this.waitForConnect()
    }
    throw ErrorNotInitialized
  }

  loginWithBearer = async (
    type: BearerAuthentication,
    data: FirebaseBearer
  ): Promise<boolean> => {
    if (this.initStatus !== InitStatus.DONE) {
      throw ErrorNotInitialized
    }
    return await this.iframeWrapper.triggerBearerAuthentication(type, data)
  }

  get connected() {
    return this._provider.connected
  }

  /**
   * A function to get user info for the logged-in user
   * @returns available user info
   */
  public getUser(): Promise<UserInfo> {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider.requestUserInfo()
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to determine whether the user is logged in
   */
  public async isLoggedIn() {
    if (this.initStatus === InitStatus.DONE) {
      const isLoggedIn = this._provider.isLoggedIn()
      return isLoggedIn
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to log out the user
   */
  public logout() {
    if (this.initStatus === InitStatus.DONE) {
      return this._provider.triggerLogout()
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to request public key of other users
   *
   * **NOTE**: Currently does not work by default for most applications.
   *  MFA availability (which is enabled by default) has to be disabled for this to work.
   */
  public async getPublicKey(email: string, verifier: Logins = 'google') {
    if (this.initStatus === InitStatus.DONE) {
      if (!email || email === '') {
        throw new ArcanaAuthError(
          'email_required',
          `Email is required in getPublicKey, got ${email}`
        )
      }
      return await this._provider.getPublicKey(email, verifier)
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

  /**
   * A function to to be called before trying to .reconnect()
   */
  public canReconnect() {
    const session = this.iframeWrapper.getSessionID()
    if (!session) {
      return false
    }

    if (session.exp < Date.now()) {
      return false
    }

    return true
  }

  /**
   * A function to try to reconnect to last login session.
   * Should be called on event of click function as it opens a popup.
   */
  public async reconnect() {
    if (this.initStatus !== InitStatus.DONE) {
      await this.init()
    }
    if (await this.isLoggedIn()) {
      await this.waitForConnect()
      return
    }
    const session = this.iframeWrapper.getSessionID()
    if (session) {
      if (session.exp < Date.now()) {
        throw new Error('cannot reconnect, session expired')
      }
      const u = new URL(await this._provider.getReconnectionUrl())
      u.searchParams.set('sessionID', session.id)

      const popup = new Popup(u.toString())
      await popup.open()
      await this.waitForConnect()
      return
    }
    throw new Error('cannot reconnect, no session found')
  }

  /* Private functions */
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
    const horizontalLogo =
      appInfo.logo.dark_horizontal || appInfo.logo.light_horizontal
    const verticalLogo =
      appInfo.logo.dark_vertical || appInfo.logo.light_vertical
    this.appConfig = {
      name: appInfo.name,
      themeConfig: {
        assets: {
          logo: {
            horizontal: horizontalLogo ? appImageURLs.horizontal : '',
            vertical: verticalLogo ? appImageURLs.vertical : '',
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

  private resolveInitPromises() {
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

  private setProviders() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as Record<string, any>
    try {
      w.arcana = w.arcana ?? {}
      w.arcana.provider = this._provider
      // eslint-disable-next-line no-empty
    } catch {}
    if (this.params.setWindowProvider) {
      try {
        w.ethereum = w.ethereum ?? this._provider
        w.ethereum.providers = w.ethereum.providers ?? []
        w.ethereum.providers.push(this._provider)
      } catch (e) {
        console.error(e)
      }
    }
  }

  private standaloneMode(
    mode: 1 | 2,
    handler: (eventName: string, data: any) => void
  ) {
    this._standaloneMode = {
      mode,
      handler,
    }
  }
}

export {
  AuthProvider,
  ConstructorParams,
  EthereumProvider,
  BearerAuthentication,
  AppConfig,
  Theme,
  Position,
  Logins,
  UserInfo,
  ThemeConfig,
  NetworkConfig,
}
