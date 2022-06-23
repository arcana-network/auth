import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  computeAddress,
  encryptWithPublicKey,
  getWalletType,
  getSentryErrorReporter,
  isDefined,
} from './utils'
import { getNetworkConfig, getRpcConfig } from './config'
import {
  AppConfig,
  AppMode,
  EncryptInput,
  InitInput,
  InitParams,
  NetworkConfig,
  NetworkEnum,
  Position,
  RpcConfig,
  Theme,
  ThemeConfig,
  UserInfo,
} from './typings'
import { getAppInfo, getImageUrls } from './appConfig'
import { WalletNotInitializedError } from './errors'
import {
  getLogger,
  Logger,
  LOG_LEVEL,
  setExceptionReporter,
  setLogLevel,
} from './logger'

class AuthProvider {
  private appId: string
  private appConfig: AppConfig
  private logger: Logger
  private iframeWrapper: IframeWrapper | null
  private _provider: ArcanaProvider
  private networkConfig: NetworkConfig
  private rpcConfig: RpcConfig
  constructor(
    appId: string,
    private params: InitParams = {
      network: NetworkEnum.testnet,
      inpageProvider: false,
      debug: false,
    }
  ) {
    if (!isDefined(appId)) {
      throw new Error('appId is required in params')
    }
    this.appId = appId
    this.networkConfig = getNetworkConfig(params.network)
    this.rpcConfig = getRpcConfig(params.rpcConfig, params.network)

    this.logger = getLogger('AuthProvider')
    if (params.debug) {
      setLogLevel(LOG_LEVEL.DEBUG)
      const dsn = this.networkConfig.sentryDsn
      if (dsn) {
        setExceptionReporter(getSentryErrorReporter(dsn))
      }
    } else {
      setLogLevel(LOG_LEVEL.NOLOGS)
    }
  }

  /**
   * A function to initialize the wallet, should be called before getting provider
   */
  public async init(
    input: InitInput = { appMode: AppMode.NoUI, position: 'right' }
  ) {
    const { appMode, position } = input
    if (this.iframeWrapper) {
      return
    }

    await this.setAppConfig()

    this.iframeWrapper = new IframeWrapper({
      appId: this.appId,
      iframeUrl: this.networkConfig.walletUrl,
      appConfig: this.appConfig,
      position: position,
      destroyWalletUI: this.destroyWalletUI,
    })

    const walletType = await getWalletType(
      this.appId,
      this.networkConfig.gatewayUrl
    )
    this.iframeWrapper.setWalletType(walletType, appMode)

    this._provider = new ArcanaProvider(this.iframeWrapper, this.rpcConfig)
    await this._provider.init()
    this.setProviders()
  }

  /**
   * A function to trigger social login in the wallet
   */
  public async loginWithSocial(loginType: string) {
    if (this._provider) {
      const redirectUrl = await this._provider.triggerSocialLogin(loginType)
      this.redirectTo(redirectUrl)
      return
    }
    this.logger.error('requestSocialLogin', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to trigger passwordless login in the wallet
   */
  public async loginWithLink(email: string) {
    if (this._provider) {
      const redirectUrl = await this._provider.triggerPasswordlessLogin(email)
      this.redirectTo(redirectUrl)
      return
    }
    this.logger.error('requestPasswordlessLogin', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to get user info for logged in user
   * @returns available user info
   */
  public getUser(): Promise<UserInfo> {
    if (this._provider) {
      return this._provider.requestUserInfo()
    }
    this.logger.error('requestUserInfo', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to determine whether user is logged in
   */
  public isLoggedIn() {
    if (this._provider) {
      return this._provider.isLoggedIn()
    }
    this.logger.error('isLoggedIn', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to logout the user
   */
  public logout() {
    if (this._provider) {
      return this._provider.triggerLogout()
    }
    this.logger.error('logout', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to request public key of different users
   */
  public async getPublicKey(email: string) {
    if (this._provider) {
      return await this._provider.getPublicKey(email, 'google')
    }
    this.logger.error('requestPublicKey', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to get web3 provider
   * @deprecated use .provider instead
   */
  public getProvider() {
    if (this._provider) {
      return this._provider
    }
    this.logger.error('getProvider', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  private redirectTo(url: string) {
    if (url) {
      setTimeout(() => (window.location.href = url), 50)
    }
    return
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

  /**
   * @internal
   */
  destroyWalletUI = () => {
    if (this.iframeWrapper) {
      this.iframeWrapper.destroyUIElements()
    }
    this.iframeWrapper = null
  }

  get provider() {
    if (this._provider) {
      return this._provider
    }
    this.logger.error('provider', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private setProviders() {
    if (this.params.inpageProvider) {
      if (!(window as Record<string, any>).ethereum) {
        ;(window as Record<string, any>).ethereum = this._provider
      }
    }

    if (!(window as Record<string, any>).arcana) {
      ;(window as Record<string, any>).arcana = {}
    }
    ;(window as Record<string, any>).arcana.provider = this._provider
  }
  /* eslint-enable */
}

export {
  AuthProvider,
  InitParams,
  AppConfig,
  Theme,
  AppMode,
  Position,
  EncryptInput,
  UserInfo,
  ThemeConfig,
  InitInput,
  NetworkConfig,
  NetworkEnum,
  computeAddress,
  encryptWithPublicKey,
}
