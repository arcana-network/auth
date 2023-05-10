import {
  IframeWrapperParams,
  AppMode,
  WalletType,
  ChildMethods,
  ParentMethods,
} from './typings'
import { connectToChild, Connection } from 'penpal'
import { createDomElement, verifyMode } from './utils'
import { WarningDupeIframe } from './errors'
import * as styles from './styles'

const ARCANA_WALLET_CLASS = 'xar-wallet'

export default class IframeWrapper {
  public widgetIframe: HTMLIFrameElement
  public appMode: AppMode
  private state: 'open' | 'closed'

  private iframeCommunication: Connection<ChildMethods>
  constructor(public params: IframeWrapperParams) {
    this.checkDuplicateIframe()
    this.checkSecureOrigin()
  }

  public async setConnectionMethods(methods: ParentMethods) {
    try {
      if (!this.iframeCommunication) {
        this.iframeCommunication = connectToChild<ChildMethods>({
          iframe: this.widgetIframe,
          methods: { ...methods },
          childOrigin: this.params.iframeUrl,
        })
        await this.iframeCommunication.promise
      }
      return {
        iframe: this.widgetIframe,
        communication: this.iframeCommunication,
      }
    } catch (error) {
      throw new Error('Could not set connection methods')
    }
  }

  public setWalletType(walletType: WalletType, appMode: AppMode | undefined) {
    this.appMode = verifyMode(walletType, appMode)
    this.initWalletUI()
  }

  public getState() {
    return this.state
  }

  public handleDisconnect() {
    this.widgetIframe.src = this.getIframeUrl()
  }

  public onReceivingPendingRequestCount(count: number) {
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

  setIframeStyle = (styles: CSSStyleDeclaration) => {
    for (const prop in styles) {
      this.widgetIframe.style[prop] = styles[prop]
    }
  }

  getWalletPlace = () => {
    return this.params.position
  }

  getAppConfig = () => {
    return this.params.appConfig
  }

  private getIframeUrl() {
    const u = new URL(`/${this.params.appId}/v2/login`, this.params.iframeUrl)
    return u.toString()
  }

  private createWidgetIframe() {
    return createDomElement('iframe', {
      style: styles.iFrameInitialStyle,
      src: this.getIframeUrl(),
      allow: 'clipboard-write',
      className: ARCANA_WALLET_CLASS,
    }) as HTMLIFrameElement
  }

  private checkDuplicateIframe() {
    const iframes: HTMLIFrameElement[] = [].slice.call(
      document.querySelectorAll(`.${ARCANA_WALLET_CLASS}`)
    )
    if (iframes.length > 0) {
      WarningDupeIframe.log()
    }
  }

  private initWalletUI() {
    this.widgetIframe = this.createWidgetIframe() as HTMLIFrameElement
    document.body.appendChild(this.widgetIframe)
  }

  // Todo: add remove event listener for "resize" event

  private checkSecureOrigin() {
    const isLocalhost =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    const isSecureOrigin = location.protocol === 'https:'
    const isSecure = isLocalhost || isSecureOrigin
    if (!isSecure) {
      throw new Error(`Insecure origin`)
    }
  }
}
