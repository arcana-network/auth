import type {
  BearerAuthentication,
  ChildMethods,
  FirebaseBearer,
  IframeWrapperParams,
  ParentMethods,
} from './typings'
import { AppMode } from './typings'
import { Connection, connectToChild } from 'penpal'
import { createDomElement, encodeJSON } from './utils'
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

  public async setConnectionMethods(methods: Omit<ParentMethods, 'uiEvent'>) {
    try {
      if (!this.iframeCommunication) {
        this.iframeCommunication = connectToChild<ChildMethods>({
          iframe: this.widgetIframe,
          methods: {
            ...methods,
            uiEvent: (ev: string, data: unknown) => {
              if (this.params.standaloneMode?.handler) {
                this.params.standaloneMode.handler(ev, data)
              }
            },
          },
          childOrigin: this.params.iframeUrl,
          debug: true,
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

  public async triggerBearerAuthentication(
    type: BearerAuthentication,
    data: FirebaseBearer
  ) {
    return (await this.iframeCommunication.promise).triggerBearerLogin(
      type,
      data
    )
  }

  public getSessionID = () => {
    return window.localStorage.getItem(
      `arcana-auth-${this.params.iframeUrl}-sessionID`
    )
  }

  public setSessionID = (sessionID: string) => {
    window.localStorage.setItem(
      `arcana-auth-${this.params.iframeUrl}-sessionID`,
      sessionID
    )
  }

  public notifyNoStorage = () => {
    if (this.getSessionID() != null) {
      console.log('Session ID != null!')
    }
  }

  public setWalletType(appMode: AppMode | undefined) {
    this.appMode = appMode ?? AppMode.Full
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
    if (this.params.standaloneMode?.mode == 1) {
      this.widgetIframe.style.height = styles['height']
        ? styles['height']
        : '80vh'
      this.widgetIframe.style.maxWidth = '100%'
      this.widgetIframe.style.width = '430px'
      this.widgetIframe.style.bottom = '0'
      this.widgetIframe.style.right = '0'
    } else {
      for (const prop in styles) {
        this.widgetIframe.style[prop] = styles[prop]
      }
    }
  }

  getWalletPlace = () => {
    return this.params.position
  }

  getAppConfig = () => {
    return this.params.appConfig
  }

  private getIframeUrl() {
    const hash = encodeJSON({
      standaloneMode: this.params.standaloneMode?.mode
        ? this.params.standaloneMode?.mode
        : 0,
    })
    const u = new URL(`/${this.params.appId}/v2/login`, this.params.iframeUrl)
    u.hash = hash
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
