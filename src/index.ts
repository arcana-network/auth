import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import {
  computeAddress,
  encryptWithPublicKey,
  getWalletType,
  getSentryErrorReporter,
  isDefined,
} from './utils'
import {
  isNetworkConfig,
  setCustomConfig,
  setNetwork,
  getConfig,
} from './config'
import {
  AppConfig,
  AppMode,
  InitInput,
  InitParams,
  NetworkConfig,
  Position,
  State,
  Theme,
  ThemeConfig,
  UserInfo,
} from './typings'
import { getAppInfo, getImageUrls } from './network'
import { WalletNotInitializedError, ArcanaAuthError } from './errors'
import {
  getLogger,
  Logger,
  LOG_LEVEL,
  setExceptionReporter,
  setLogLevel,
} from './logger'

const getDefaultInitParams = (initParams?: InitParams) => {
  const p: InitParams = {
    network: 'testnet',
    debug: false,
  }
  if (initParams?.network) {
    p.network = initParams.network
  }
  if (initParams?.debug !== undefined) {
    p.debug = initParams.debug
  }
  return p
}

class AuthProvider {
  private appId: string
  private params: InitParams
  private appConfig: AppConfig
  private state: State
  private logger: Logger
  private iframeWrapper: IframeWrapper | null
  private _provider: ArcanaProvider
  constructor(appId: string, p?: InitParams) {
    if (!isDefined(appId)) {
      throw new Error('appId is required')
    }
    this.appId = appId
    this.params = getDefaultInitParams(p)
    if (isNetworkConfig(this.params.network)) {
      setCustomConfig(this.params.network)
    } else if (!['dev', 'testnet'].includes(this.params.network)) {
      throw new Error('network is invalid in params')
    } else {
      setNetwork(this.params.network)
    }

    this.logger = getLogger('AuthProvider')
    this.initializeState()
    if (this.params.debug) {
      setLogLevel(LOG_LEVEL.DEBUG)
      const sentryDsn = getConfig().SENTRY_DSN
      if (sentryDsn) {
        setExceptionReporter(getSentryErrorReporter(sentryDsn))
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
      iframeUrl: this.state.iframeUrl,
      appConfig: this.appConfig,
      position: position,
    })

    const walletType = await getWalletType(this.appId)
    this.iframeWrapper.setWalletType(walletType, appMode)

    this._provider = new ArcanaProvider(this.iframeWrapper)
    await this._provider.init()
    this.setProviders()
  }

  /**
   * A function to trigger social login in the wallet
   */
  public async loginWithSocial(loginType: string) {
    if (this._provider) {
      this._provider.triggerSocialLogin(loginType)
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
      this._provider.triggerPasswordlessLogin(email)
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
    const appInfo = await getAppInfo(this.appId)
    const appImageURLs = getImageUrls(this.appId, appInfo.theme)
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

  private initializeState() {
    const iframeUrl = getConfig().WALLET_URL
    const redirectUri = `${iframeUrl}/${this.appId}/redirect`
    this.state = { iframeUrl, redirectUri }
  }
}

export {
  AuthProvider,
  InitParams,
  AppConfig,
  Theme,
  AppMode,
  Position,
  UserInfo,
  ThemeConfig,
  InitInput,
  NetworkConfig,
  computeAddress,
  encryptWithPublicKey,
}
