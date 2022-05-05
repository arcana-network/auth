import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import { encryptWithPublicKey, cipher } from 'eth-crypto'
import { getWalletType } from './utils'
import { setNetwork } from './config'
import { IWidgetThemeConfig } from './interfaces'
import { JsonRpcResponse } from 'json-rpc-engine'

interface InitParams {
  appId: string
  network: 'testnet' | 'dev'
  iframeUrl?: string
  inpageProvider: boolean
}

interface State {
  iframeUrl: string
  redirectUri?: string
}

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

  public async init(themeConfig: IWidgetThemeConfig) {
    if (this.iframeWrapper) {
      return
    }
    this.iframeWrapper = new IframeWrapper(
      {
        appId: this.params.appId,
        network: this.params.network,
      },
      this.state.iframeUrl,
      themeConfig,
      this.destroyWalletUI
    )
    this.provider = new ArcanaProvider()
    const walletType = await getWalletType(this.params.appId)
    this.iframeWrapper.setWalletType(walletType)
    const { communication } = await this.iframeWrapper.getIframeInstance({
      onEvent: this.handleEvents,
      onMethodResponse: (
        method: string,
        response: JsonRpcResponse<unknown>
      ) => {
        this.provider.onResponse(method, response)
      },
      getThemeConfig: () => {
        return themeConfig
      },
      sendPendingRequestCount: (count: number) => {
        this.onReceivingPendingRequestCount(count)
      },
    })
    this.provider.setConnection(communication)
    this.provider.setHandlers(this.iframeWrapper.show, this.iframeWrapper.hide)
    if (this.params.inpageProvider) {
      this.setProvider()
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
      console.log({ u })
      if (u) {
        setTimeout(() => (window.location.href = u), 50)
      }
    }
  }

  public requestPasswordlessLogin(email: string) {
    if (this.provider) {
      this.provider.triggerPasswordlessLogin(email)
    }
  }

  public async getPublicKey(email: string, verifier = 'google') {
    if (this.provider) {
      return await this.provider.getPublicKey(email, verifier)
    }
  }

  public getProvider() {
    return this.provider
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private setProvider() {
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
    let iframeUrl = 'http://localhost:3000'
    if (this.params.iframeUrl) {
      iframeUrl = this.params.iframeUrl
    }
    // const iframeUrl = "https://arcana-wallet-test.netlify.app";
    const redirectUri = `${iframeUrl}/${this.params.appId}/redirect`
    this.state = { iframeUrl, redirectUri }
  }
}

export { WalletProvider }
