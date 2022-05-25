import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import { encryptWithPublicKey, cipher } from 'eth-crypto'
import { getWalletType } from './utils'
import { setNetwork, getConfig, setIframeDevUrl } from './config'
import {
  IAppConfig,
  Position,
  UserInfo,
  IWidgetThemeConfig,
  Theme,
} from './interfaces'
import { JsonRpcResponse } from 'json-rpc-engine'
import { InitParams, State, AppMode, EncryptInput } from './typings'
import { getAppInfo, getImageUrls } from './network'
import { WalletNotInitializedError, InvalidClassParams } from './errors'

interface InitInput {
  appMode: AppMode | undefined
  position?: Position
}

class WalletProvider {
  /**
   * A helper function to encrypt supplied message with supplied public key
   * @returns ciphertext of the message
   *
   */
  public static async encryptWithPublicKey(
    input: EncryptInput
  ): Promise<string> {
    const ciphertext = await encryptWithPublicKey(
      input.publicKey,
      input.message
    )
    return cipher.stringify(ciphertext)
  }

  private state: State
  private iframeWrapper: IframeWrapper | null
  private _provider: ArcanaProvider
  constructor(
    private params: InitParams = {
      ...params,
      network: 'testnet',
      inpageProvider: false,
    }
  ) {
    if (!params.appId) {
      throw InvalidClassParams
    }
    this.initializeState()
    if (this.params.network === 'testnet') {
      setNetwork(this.params.network)
    }
  }

  /**
   * A function to initialize the wallet, should be called before getting provider
   */
  public async init(input: InitInput) {
    const { appMode, position = 'right' } = input
    if (this.iframeWrapper) {
      return
    }

    const appId = this.params.appId

    const appInfo = await getAppInfo(appId)

    const appImageURLs = getImageUrls(appId, appInfo.theme)

    const appConfig: IAppConfig = {
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

    this.iframeWrapper = new IframeWrapper(
      {
        appId: appId,
        network: this.params.network,
      },
      this.state.iframeUrl,
      appConfig,
      position,
      this.destroyWalletUI
    )
    this._provider = new ArcanaProvider()
    const walletType = await getWalletType(appId)
    this.iframeWrapper.setWalletType(walletType, appMode)
    const { communication } = await this.iframeWrapper.getIframeInstance({
      onEvent: this.handleEvents,
      onMethodResponse: (
        method: string,
        response: JsonRpcResponse<unknown>
      ) => {
        this._provider.onResponse(method, response)
      },
      getAppConfig: () => {
        return appConfig
      },
      getAppMode: () => {
        return this.iframeWrapper?.appMode
      },
      sendPendingRequestCount: (count: number) => {
        this.onReceivingPendingRequestCount(count)
      },
      getParentUrl: this._provider.getCurrentUrl,
    })
    this._provider.setConnection(communication)
    this._provider.setHandlers(this.iframeWrapper.show, this.iframeWrapper.hide)
    if (this.params.inpageProvider) {
      this.setInpageProvider()
    }
  }

  private onReceivingPendingRequestCount(count: number) {
    const reqCountBadgeEl = document.getElementById('req-count-badge')
    if (!reqCountBadgeEl) {
      return
    }
    if (count > 0) {
      reqCountBadgeEl.style.display = 'flex'
      reqCountBadgeEl.textContent = `${count}`
    } else {
      reqCountBadgeEl.style.display = 'none'
    }
  }

  /**
   * @internal
   */
  destroyWalletUI = () => {
    if (this.iframeWrapper) {
      this.iframeWrapper.widgetBubble.remove()
      this.iframeWrapper.widgetIframeContainer.remove()
    }
    this.iframeWrapper = null
  }

  /**
   * @internal
   */
  handleEvents = (t: string, val: unknown) => {
    console.log({ t, val })
    switch (t) {
      case 'accountsChanged':
        this._provider.emit(t, [val])
        break
      case 'chainChanged':
        this._provider.emit('chainChanged', val)
        break
      case 'connect':
        this._provider.emit('connect', val)
        break
      case 'disconnect':
        this._provider.emit('disconnect', val)
        break
      case 'message':
        this._provider.emit('message', val)
        break
      default:
        break
    }
  }

  /**
   * A function to trigger social login in the wallet
   */
  public async requestSocialLogin(loginType: string) {
    if (this._provider) {
      const u = await this._provider.triggerSocialLogin(loginType)
      if (u) {
        setTimeout(() => (window.location.href = u), 50)
      }
      return
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to trigger passwordless login in the wallet
   */
  public requestPasswordlessLogin(email: string) {
    if (this._provider) {
      return this._provider.triggerPasswordlessLogin(email)
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to get user info for logged in user
   * @returns available user info
   */
  public requestUserInfo(): Promise<UserInfo> {
    if (this._provider) {
      return this._provider.requestUserInfo()
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to determine whether user is logged in
   */
  public isLoggedIn() {
    if (this._provider) {
      return this._provider.isLoggedIn()
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to logout the user
   */
  public logout() {
    if (this._provider) {
      return this._provider.triggerLogout()
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to request public key of different users
   */
  public async requestPublicKey(email: string, verifier = 'google') {
    if (this._provider) {
      return await this._provider.getPublicKey(email, verifier)
    }
    throw WalletNotInitializedError
  }

  /**
   * A function to get web3 provider
   * @deprecated
   */
  public getProvider() {
    if (this._provider) {
      return this._provider
    }
    throw WalletNotInitializedError
  }

  get provider() {
    if (this._provider) {
      return this._provider
    }
    throw WalletNotInitializedError
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private setInpageProvider() {
    if (!(window as Record<string, any>).ethereum) {
      ;(window as Record<string, any>).ethereum = this._provider
    }

    if (!(window as Record<string, any>).arcana) {
      ;(window as Record<string, any>).arcana = {}
    }
    ;(window as Record<string, any>).arcana.provider = this._provider
  }
  /* eslint-enable */

  private initializeState() {
    if (this.params.iframeUrl) {
      setIframeDevUrl(this.params.iframeUrl)
    }
    const iframeUrl = getConfig().WALLET_URL
    const redirectUri = `${iframeUrl}/${this.params.appId}/redirect`
    this.state = { iframeUrl, redirectUri }
  }
}

export {
  WalletProvider,
  InitParams,
  IAppConfig,
  Theme,
  AppMode,
  Position,
  EncryptInput,
  UserInfo,
  IWidgetThemeConfig,
  InitInput,
}
