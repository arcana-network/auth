import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  computeAddress,
  encryptWithPublicKey,
  getWalletType,
  getSentryErrorReporter,
  isDefined,
  constructLoginUrl,
  redirectTo,
  getCurrentUrl,
  getConstructorParams,
  getInitParams,
} from './utils'
import { getNetworkConfig, getRpcConfig } from './config'
import {
  AppConfig,
  AppMode,
  InitParams,
  ConstructorParams,
  EncryptInput,
  NetworkConfig,
  Position,
  RpcConfig,
  Theme,
  ThemeConfig,
  UserInfo,
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
import { Chains } from './chainList'
class AuthProvider {
  private appId: string
  private params: ConstructorParams
  private appConfig: AppConfig
  private logger: Logger
  private iframeWrapper: IframeWrapper
  private networkConfig: NetworkConfig
  private rpcConfig: RpcConfig
  private _provider: ArcanaProvider
  constructor(appId: string, p?: Partial<ConstructorParams>) {
    if (!isDefined(appId)) {
      throw new Error('appId is required')
    }
    this.appId = appId
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
  public async init(input?: Partial<InitParams>) {
    const { appMode, position } = getInitParams(input)

    if (this.iframeWrapper) {
      return
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
  }

  /**
   * A function to trigger social login in the wallet
   */
  loginWithSocial = async (loginType: string) => {
    if (this._provider) {
      if (!(await this._provider.isLoginAvailable(loginType))) {
        throw new Error(`${loginType} login is not available`)
      }

      const redirectUrl = constructLoginUrl({
        loginType,
        appId: this.appId,
        authUrl: this.networkConfig.authUrl,
        redirectUrl: this.params.redirectUrl
          ? this.params.redirectUrl
          : getCurrentUrl(),
      })

      redirectTo(redirectUrl)
      return
    }
    this.logger.error('requestSocialLogin', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /**
   * A function to trigger passwordless login in the wallet
   */
  loginWithLink = (email: string) => {
    if (this._provider) {
      const redirectUrl = constructLoginUrl({
        loginType: 'passwordless',
        appId: this.appId,
        email,
        authUrl: this.networkConfig.authUrl,
        redirectUrl: this.params.redirectUrl
          ? this.params.redirectUrl
          : getCurrentUrl(),
      })
      redirectTo(redirectUrl)
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
  get provider() {
    if (this._provider) {
      return this._provider
    }
    this.logger.error('provider', WalletNotInitializedError)
    throw WalletNotInitializedError
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private setProviders() {
    if (!(window as Record<string, any>).arcana) {
      ;(window as Record<string, any>).arcana = {}
    }
    ;(window as Record<string, any>).arcana.provider = this._provider
  }
  /* eslint-enable */
}

export {
  AuthProvider,
  ConstructorParams,
  Chains as CHAINS,
  AppConfig,
  Theme,
  AppMode,
  Position,
  RpcConfig,
  EncryptInput,
  UserInfo,
  ThemeConfig,
  InitParams,
  NetworkConfig,
  computeAddress,
  encryptWithPublicKey,
}
