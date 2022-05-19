import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import { encryptWithPublicKey, cipher } from 'eth-crypto'
import { getWalletType } from './utils'
import { setNetwork, getConfig, setIframeDevUrl } from './config'
import { IAppConfig, Position } from './interfaces'
import { JsonRpcResponse } from 'json-rpc-engine'
import { InitParams, State } from './typings'
import { getAppInfo, getImageUrls } from './network'
import { WalletNotInitializedError } from './errors'

class WalletProvider {
  public static async encryptWithPublicKey({
    message,
    publicKey,
  }: {
    message: string
    publicKey: string
  }): Promise<string> {
    const ciphertext = await encryptWithPublicKey(publicKey, message)
    return cipher.stringify(ciphertext)
  }

  private state: State
  private iframeWrapper: IframeWrapper | null
  private provider: ArcanaProvider
  constructor(private params: InitParams) {
    this.initializeState()
    if (this.params.network === 'testnet') {
      setNetwork(this.params.network)
    }
  }

  public async init({ position }: { position: Position }) {
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
    this.provider = new ArcanaProvider()
    const walletType = await getWalletType(appId)
    this.iframeWrapper.setWalletType(walletType)
    const { communication } = await this.iframeWrapper.getIframeInstance({
      onEvent: this.handleEvents,
      onMethodResponse: (
        method: string,
        response: JsonRpcResponse<unknown>
      ) => {
        this.provider.onResponse(method, response)
      },
      getAppConfig: () => {
        return appConfig
      },
      sendPendingRequestCount: (count: number) => {
        this.onReceivingPendingRequestCount(count)
      },
      getParentUrl: this.provider.getCurrentUrl,
    })
    this.provider.setConnection(communication)
    this.provider.setHandlers(this.iframeWrapper.show, this.iframeWrapper.hide)
    if (this.params.inpageProvider) {
      this.setInpageProvider()
    }
  }

  onReceivingPendingRequestCount(count: number) {
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

  destroyWalletUI = () => {
    if (this.iframeWrapper) {
      this.iframeWrapper.widgetBubble.remove()
      this.iframeWrapper.widgetIframeContainer.remove()
    }
    this.iframeWrapper = null
  }

  handleEvents = (t: string, val: unknown) => {
    console.log({ t, val })
    switch (t) {
      case 'accountsChanged':
        this.provider.emit(t, [val])
        break
      case 'chainChanged':
        this.provider.emit('chainChanged', val)
        break
      case 'connect':
        this.provider.emit('connect', val)
        break
      case 'disconnect':
        this.provider.emit('disconnect', val)
        break
      case 'message':
        this.provider.emit('message', val)
        break
      default:
        break
    }
  }

  public async requestSocialLogin(loginType: string) {
    if (this.provider) {
      const u = await this.provider.triggerSocialLogin(loginType)
      if (u) {
        setTimeout(() => (window.location.href = u), 50)
      }
      return
    }
    throw WalletNotInitializedError
  }

  public requestPasswordlessLogin(email: string) {
    if (this.provider) {
      return this.provider.triggerPasswordlessLogin(email)
    }
    throw WalletNotInitializedError
  }

  public requestUserInfo() {
    if (this.provider) {
      return this.provider.requestUserInfo()
    }
    throw WalletNotInitializedError
  }

  public isLoggedIn() {
    if (this.provider) {
      return this.provider.isLoggedIn()
    }
    throw WalletNotInitializedError
  }

  public logout() {
    if (this.provider) {
      return this.provider.triggerLogout()
    }
    throw WalletNotInitializedError
  }

  public async requestPublicKey(email: string, verifier = 'google') {
    if (this.provider) {
      return await this.provider.getPublicKey(email, verifier)
    }
    throw WalletNotInitializedError
  }

  public getProvider() {
    return this.provider
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private setInpageProvider() {
    if (!(window as Record<string, any>).ethereum) {
      ;(window as Record<string, any>).ethereum = this.provider
    }

    if (!(window as Record<string, any>).arcana) {
      ;(window as Record<string, any>).arcana = {}
    }
    ;(window as Record<string, any>).arcana.provider = this.provider
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

export { WalletProvider, InitParams, IAppConfig }
