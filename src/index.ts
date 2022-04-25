import { ArcanaProvider } from './provider'
import IframeWrapper from './iframeWrapper'
import { encryptWithPublicKey, cipher } from 'eth-crypto'
import { getWalletType } from './utils'
import { setNetwork } from './config'
import { IWidgetThemeConfig } from './interfaces'

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
  private arcanaProvider: ArcanaProvider
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
    this.arcanaProvider = new ArcanaProvider()
    const walletType = await getWalletType(this.params.appId)
    this.iframeWrapper.setWalletType(walletType)
    const { communication } = await this.iframeWrapper.getIframeInstance({
      onEvent: this.handleEvents,
      onMethodResponse: (method: string, response: any) => {
        this.arcanaProvider.onResponse(method, response)
      },
      getThemeConfig: () => {
        return themeConfig
      },
      sendPendingRequestCount: (count: number) => {
        this.onReceivingPendingRequestCount(count)
      },
    })
    this.arcanaProvider.setConnection(communication)
    this.arcanaProvider.setHandlers(
      this.iframeWrapper.show,
      this.iframeWrapper.hide
    )
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
        this.arcanaProvider.emit(t, [val])
        break
      case 'chainChanged':
        this.arcanaProvider.emit('chainChanged', val)
        break
      case 'connect':
        this.arcanaProvider.emit('connect', val)
        break
      case 'disconnect':
        this.arcanaProvider.emit('disconnect', val)
        break
      case 'message':
        this.arcanaProvider.emit('message', val)
        break
      default:
        break
    }
  }

  public requestLogin(loginType: string) {
    if (this.arcanaProvider) {
      this.arcanaProvider.triggerLogin(loginType)
    }
  }

  public getProvider() {
    return this.arcanaProvider
  }

  private setProvider() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as Record<string, any>).ethereum) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as Record<string, any>).ethereum = this.arcanaProvider
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as Record<string, any>).arcana.provider = this.arcanaProvider
  }

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
