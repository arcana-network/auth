import {
  IframeWrapperParams,
  AppMode,
  WalletType,
  ChildMethods,
  ParentMethods,
} from './typings'
import { connectToChild, Connection } from 'penpal'
import {
  widgetIframeStyle,
  widgetBubbleStyle,
  arrowButtonImage,
} from './styles'
import {
  createDomElement,
  getWalletPosition,
  getWalletSize,
  setWalletPosition,
  setWalletSize,
  verifyMode,
  setFallbackImage,
} from './utils'
import { WarningDupeIframe } from './errors'

const BREAKPOINT_SMALL = 768
const ARCANA_WALLET_CLASS = 'xar-wallet'

export default class IframeWrapper {
  private iframe: HTMLIFrameElement
  public widgetBubble: HTMLButtonElement
  public widgetIframeContainer: HTMLDivElement
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
          iframe: this.iframe,
          methods: { ...methods },
          childOrigin: this.params.iframeUrl,
        })
        await this.iframeCommunication.promise
      }
      return { iframe: this.iframe, communication: this.iframeCommunication }
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

  public showWidgetBubble() {
    if (this.appMode === AppMode.Full) {
      this.widgetBubble.style.display = 'flex'
    }
  }

  public handleDisconnect() {
    this.widgetIframeContainer.style.display = 'none'
    this.widgetBubble.style.display = 'none'
    this.iframe.src = this.getIframeUrl()
  }

  public hideWidgetBubble() {
    if (this.appMode === AppMode.Full) {
      this.widgetBubble.style.display = 'none'
    }
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

  getAppConfig = () => {
    return this.params.appConfig
  }

  show = () => {
    switch (this.appMode) {
      case AppMode.Full: {
        this.openWidgetIframe()
        break
      }
      case AppMode.Widget: {
        this.openWidgetIframe()
        break
      }
      case AppMode.NoUI:
      default:
        break
    }
  }

  hide = () => {
    switch (this.appMode) {
      case AppMode.Full: {
        this.closeWidgetIframe()
        break
      }
      case AppMode.Widget: {
        this.closeWidgetIframe()
        break
      }
      case AppMode.NoUI:
      default:
        break
    }
  }

  private constructWidgetIframeStructure() {
    const {
      appConfig: { themeConfig },
    } = this.params

    const { theme, assets } = themeConfig

    const appLogo = createDomElement('img', {
      src: assets.logo.horizontal,
      style: widgetIframeStyle.header.logo,
      onerror: (e: Event) => setFallbackImage(e, theme),
    })

    const closeButton = createDomElement('button', {
      onclick: () => this.closeWidgetIframe(),
      style: widgetIframeStyle.header.closeButton[theme],
    })

    const widgetIframeHeader = createDomElement(
      'div',
      { style: widgetIframeStyle.header.container[theme] },
      appLogo,
      closeButton
    )

    const widgetIframeBody = createDomElement('div', {
      style: widgetIframeStyle.body,
    })

    return { widgetIframeHeader, widgetIframeBody }
  }

  private getIframeUrl() {
    const u = new URL(`/${this.params.appId}/v2/login`, this.params.iframeUrl)
    return u.toString()
  }

  private createWidgetIframe() {
    this.iframe = createDomElement('iframe', {
      style: widgetIframeStyle.iframe,
      src: this.getIframeUrl(),
      allow: 'clipboard-write',
      className: ARCANA_WALLET_CLASS,
    }) as HTMLIFrameElement

    const { widgetIframeHeader, widgetIframeBody } =
      this.constructWidgetIframeStructure()

    widgetIframeBody.appendChild(this.iframe)

    return createDomElement(
      'div',
      { style: widgetIframeStyle.container },
      widgetIframeHeader,
      widgetIframeBody
    )
  }

  private checkDuplicateIframe() {
    const iframes: HTMLIFrameElement[] = [].slice.call(
      document.querySelectorAll(`.${ARCANA_WALLET_CLASS}`)
    )
    if (iframes.length > 0) {
      WarningDupeIframe.log()
    }
  }

  private createWidgetBubble() {
    const {
      appConfig: { themeConfig },
    } = this.params

    const { theme } = themeConfig

    const buttonLogo = createDomElement('img', {
      src:
        this.params.appConfig.themeConfig.theme === 'dark'
          ? arrowButtonImage.dark
          : arrowButtonImage.light,
      style:
        this.params.position === 'left'
          ? widgetBubbleStyle.bubbleLogo.left
          : '',
      onerror: (e: Event) => setFallbackImage(e, theme),
    })

    const reqCountBadge = createDomElement('p', {
      id: 'req-count-badge',
      style: { ...widgetBubbleStyle.reqCountBadge, display: 'none' },
    })

    return createDomElement(
      'button',
      {
        onclick: () => this.openWidgetIframe(),
        style: widgetBubbleStyle[theme],
      },
      reqCountBadge,
      buttonLogo
    )
  }

  private initWalletUI() {
    this.widgetIframeContainer = this.createWidgetIframe() as HTMLDivElement

    this.widgetBubble = this.createWidgetBubble() as HTMLButtonElement

    this.resizeWidgetUI()

    window.addEventListener('resize', () => this.resizeWidgetUI())

    this.widgetIframeContainer.style.display = 'none'

    document.body.appendChild(this.widgetBubble)
    document.body.appendChild(this.widgetIframeContainer)
  }

  // Todo: add remove event listener for "resize" event

  private resizeWidgetUI() {
    const { matches: isViewportSmall } = window.matchMedia(
      `(max-width: ${BREAKPOINT_SMALL}px)`
    )

    setWalletSize(this.widgetIframeContainer, getWalletSize(isViewportSmall))

    setWalletPosition(
      this.widgetBubble,
      getWalletPosition(isViewportSmall, this.params.position, true)
    )

    this.widgetBubble.style.borderRadius =
      this.params.position === 'right'
        ? widgetBubbleStyle.borderRadius.right
        : widgetBubbleStyle.borderRadius.left

    setWalletPosition(
      this.widgetIframeContainer,
      getWalletPosition(isViewportSmall, this.params.position, false)
    )
  }

  private closeWidgetIframe() {
    const isFullMode = this.appMode === AppMode.Full
    this.widgetBubble.style.display = isFullMode ? 'flex' : 'none'
    this.widgetIframeContainer.style.display = 'none'
    this.state = 'closed'
  }

  private openWidgetIframe() {
    this.widgetBubble.style.display = 'none'
    this.widgetIframeContainer.style.display = 'flex'
    this.state = 'open'
  }

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
