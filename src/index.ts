import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  getConstructorParams,
  getErrorReporter,
  getParamsFromClientId,
  isClientId,
  onWindowReady,
  preLoadIframe,
  removeHexPrefix,
  validateAppAddress,
} from './utils'
import { getNetworkConfig } from './config'
import {
  AppConfig,
  AppMode,
  BearerAuthentication,
  ChainType,
  ConstructorParams,
  EIP6963ProviderInfo,
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
import { getAppInfo, getAppThemeInfo, getImageUrls } from './appInfo'
import { ArcanaAuthError, ErrorNotInitialized } from './errors'
import { LOG_LEVEL, setExceptionReporter, setLogLevel } from './logger'
import Popup from './popup'
import { ModalController } from './ui/modalController'
import { ArcanaSolanaAPI } from './solana'

import isEmail from 'validator/es/lib/isEmail'

class AuthProvider {
  public appId: string
  private params: ConstructorParams
  private providerInfo: EIP6963ProviderInfo
  private appConfig: AppConfig
  private iframeWrapper: IframeWrapper
  private networkConfig: NetworkConfig
  private initStatus: InitStatus = InitStatus.CREATED
  private initPromises: ((value: AuthProvider) => void)[] = []

  private readonly _provider: ArcanaProvider
  private _solanaAPI: ArcanaSolanaAPI

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
    this._provider = new ArcanaProvider(this.networkConfig.authUrl)

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

      await this._provider.init(this.iframeWrapper, this)
      this.setProviders()

      switch (this.appConfig.chainType) {
        case ChainType.solana_cv25519: {
          this._solanaAPI = await ArcanaSolanaAPI.create(this._provider)
        }
      }

      this.initStatus = InitStatus.DONE
      this.resolveInitPromises()

      return this
    } else if (this.initStatus === InitStatus.RUNNING) {
      return await this.waitForInit()
    }

    return this
  }

  /**
   * A function to perform otp login
   * @example
   * Local Keyspace:
   * ```
   * const login = await auth.loginWithOtp("abc@example.com");
   * await login.begin();
   *
   * // On user input of OTP
   * const onSubmitClick = () => {
   *  const userInput = ... // Get user input from input element
   *  await login.complete(userInput);
   * }
   * ```
   *
   * @example
   * Global Keyspace:
   * ```
   * const login = await auth.loginWithOtp("abc@example.com");
   * await login.begin();
   * ```
   */

  public loginWithOTP = async (email: string) => {
    await this.init()
    return {
      begin: () => this._loginWithOTPStart(email),
      isCompleteRequired: !(
        (await this._provider.getKeySpaceConfigType()) === 'global'
      ),
      complete: this._loginWithOTPComplete.bind(this),
    }
  }

  /**
   * A function to start otp login
   */

  public loginWithOTPStart = async (email: string) => {
    await this.init()
    return {
      begin: () => this._loginWithOTPStart(email),
      isCompleteRequired: !(
        (await this._provider.getKeySpaceConfigType()) === 'global'
      ),
    }
  }

  /**
   * A function to finish otp login
   */

  public loginWithOTPComplete = async (otp: string, onMFAFlow?: () => void) => {
    if ((await this._provider.getKeySpaceConfigType()) === 'global') {
      throw new Error('complete is not required for global login')
    }
    await this._loginWithOTPComplete(otp, onMFAFlow)
  }

  /**
   * A function to open login plug n play modal
   * @example
   * ```
   * const auth = new AuthProvider('xar_xxx_...')
   * window.onload = () => {
   *  try {
   *    await auth.connect();
   *    // User is logged in, use auth.provider
   *  } catch(e){
   *    // Login failed due to some error or user closed login popup
   *  }
   * }
   * ```
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
        loginWithOTPStart: this.loginWithOTPStart,
        loginWithOTPComplete: this.loginWithOTPComplete,
        loginWithSocial: this.loginWithSocial,
        loginList: logins,
        mode: this.theme,
        logo: this.logo.vertical,
        options: this.params.connectOptions,
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
    await this.init()
    if (await this.isLoggedIn()) {
      return this._provider
    }
    if (!(await this._provider.isLoginAvailable(loginType))) {
      throw new Error(`${loginType} login is not available`)
    }
    const url = await this._provider.initSocialLogin(loginType)
    return this.beginLogin(url)
  }

  /**
   * A function to trigger passwordless login in the wallet
   * @deprecated use loginWithOTPStart and loginWithOTPComplete instead
   */
  loginWithLink = async (
    email: string,
    emailSentHook?: () => void
  ): Promise<EthereumProvider> => {
    await this.init()
    if (await this.isLoggedIn()) {
      return this._provider
    }

    if (!isEmail(email)) {
      throw new Error('Invalid email')
    }
    const url = await this._provider.initPasswordlessLogin(email)
    if (url && typeof url === 'string') {
      return this.beginLogin(url)
    }

    if (emailSentHook) {
      emailSentHook()
    }
    return await this.waitForConnect()
  }

  private _loginWithOTPStart = async (email: string) => {
    await this.init()
    if (await this.isLoggedIn()) {
      return
    }

    if (!isEmail(email)) {
      throw new Error('Invalid email')
    }

    const url = await this._provider.initOTPLogin(email)
    if (url && typeof url === 'string') {
      await this.beginLogin(url)
    }
  }

  private _loginWithOTPComplete = async (
    otp: string,
    onMFAFlow?: () => void
  ) => {
    await this.init()
    if (await this.isLoggedIn()) {
      return this._provider
    }

    this._provider.once('message', (msg) => {
      if (msg === 'mfa_flow') {
        if (onMFAFlow) {
          onMFAFlow()
        }
      }
    })

    await this._provider.completeOTPLogin(otp)
    return await this.waitForConnect()
  }

  loginWithBearer = async (
    type: BearerAuthentication,
    data: FirebaseBearer
  ): Promise<boolean> => {
    await this.init()
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
      const isLoggedIn = await this._provider.isLoggedIn()
      return isLoggedIn
    }
    throw ErrorNotInitialized
  }

  /**
   * A function to log out the user
   */
  public logout() {
    return new Promise((resolve, reject) => {
      if (this.initStatus === InitStatus.DONE) {
        this._provider.once('disconnect', resolve)
        this._provider.triggerLogout()
      } else {
        return reject(ErrorNotInitialized)
      }
    })
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
   * A function to be called before trying to .reconnect()
   */
  public async canReconnect() {
    await this.init()

    if (await this.isLoggedIn()) {
      return false
    }

    const session = this.iframeWrapper.getSessionID()
    if (!session) {
      return false
    }

    if (session.expiry < Date.now()) {
      return false
    }

    return true
  }

  /**
   * A function to try to reconnect to last login session.
   * Should be called on event of click function as it opens a popup.
   */
  public async reconnect() {
    await this.init()

    if (await this.isLoggedIn()) {
      await this.waitForConnect()
      return
    }

    const session = this.iframeWrapper.getSessionID()
    if (session) {
      if (session.expiry < Date.now()) {
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
      this._provider.once('connect', () => {
        return resolve(this._provider)
      })
    })
  }

  private async setAppConfig() {
    const [appThemeInfo, appInfo] = await Promise.all([
      getAppThemeInfo(this.appId, this.networkConfig.gatewayUrl),
      getAppInfo(this.appId, this.networkConfig.gatewayUrl),
    ])
    const appImageURLs = getImageUrls(
      this.appId,
      this.params.theme,
      this.networkConfig.gatewayUrl
    )
    const horizontalLogo =
      appThemeInfo.logo.dark_horizontal || appThemeInfo.logo.light_horizontal
    const verticalLogo =
      appThemeInfo.logo.dark_vertical || appThemeInfo.logo.light_vertical
    this.appConfig = {
      name: appInfo.name,
      chainType:
        appInfo.chain_type.toLowerCase() === 'evm'
          ? ChainType.evm_secp256k1
          : ChainType.solana_cv25519,
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

  get solana() {
    if (this._solanaAPI) {
      return this._solanaAPI
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
    if (typeof window !== undefined) {
      this.providerInfo = {
        uuid: window.crypto.randomUUID(),
        name: 'Arcana Wallet',
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>", // TODO: Fix this
        rdns: 'network.arcana.wallet',
      }
      onWindowReady(() => {
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

        this.announceProvider()
        window.addEventListener('eip6963:requestProvider', () => {
          this.announceProvider()
        })
      })
    }
  }

  private announceProvider() {
    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({
          info: this.providerInfo,
          provider: this._provider,
        }),
      })
    )
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
