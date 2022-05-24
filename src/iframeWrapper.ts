import {
  IframeWrapperParams,
  IConnectionMethods,
  IAppConfig,
  Position,
} from './interfaces'
import { connectToChild, Connection } from 'penpal'
import { widgetIframeStyle, widgetBubbleStyle } from './styles'
import { AppMode, WalletType } from './typings'
import {
  createDomElement,
  getWalletPosition,
  getWalletSize,
  setWalletPosition,
  setWalletSize,
  verifyMode,
} from './utils'
import { getConfig } from './config'
const BREAKPOINT_SMALL = 768

export default class IframeWrapper {
  private iframe: HTMLIFrameElement

  public widgetBubble: HTMLButtonElement
  public widgetIframeContainer: HTMLDivElement
  public appMode: AppMode

  private iframeCommunication: Connection<IConnectionMethods>
  constructor(
    private params: IframeWrapperParams,
    private iframeUrl: string,
    private appConfig: IAppConfig,
    private position: Position,
    private destroyWalletUI: () => void
  ) {
    this.checkSecureOrigin()
  }

  public async getIframeInstance(params: {
    [k: string]: (...args: any) => unknown
  }) {
    return await this.createOrGetInstance(params)
  }

  public setWalletType(walletType: WalletType, appMode: AppMode | undefined) {
    this.appMode = verifyMode(walletType, appMode)
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

  private async createOrGetInstance(params: {
    [k: string]: (params: unknown) => unknown
  }) {
    try {
      if (!this.iframe) {
        this.initWalletUI()
      }
      if (!this.iframeCommunication) {
        this.iframeCommunication = connectToChild<IConnectionMethods>({
          iframe: this.iframe,
          methods: {
            ...params,
          },
          childOrigin: getConfig().WALLET_URL,
        })
        await this.iframeCommunication.promise
      }
    } catch (error) {
      console.log({ error })
      throw new Error('Error during createOrGetInstance in IframeWrapper')
    }
    return { iframe: this.iframe, communication: this.iframeCommunication }
  }

  private constructWidgetIframeStructure(isFullMode: boolean) {
    const {
      appConfig: { themeConfig },
    } = this

    const { theme, assets } = themeConfig

    const appLogo = createDomElement('img', {
      src: assets.logo.horizontal,
      style: widgetIframeStyle.header.logo,
    })
    const closeButton = createDomElement('button', {
      onclick: () => this.closeWidgetIframe(),
      style: isFullMode
        ? widgetIframeStyle.header.closeButton[theme]
        : { display: 'none' },
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

  private createWidgetIframe(isFullMode: boolean) {
    this.iframe = createDomElement('iframe', {
      style: widgetIframeStyle.iframe,
      src: `${this.iframeUrl}/${this.params.appId}/login`,
    }) as HTMLIFrameElement

    const { widgetIframeHeader, widgetIframeBody } =
      this.constructWidgetIframeStructure(isFullMode)

    widgetIframeBody.appendChild(this.iframe)

    return createDomElement(
      'div',
      { style: widgetIframeStyle.container },
      widgetIframeHeader,
      widgetIframeBody
    )
  }

  private createWidgetBubble(isFullMode: boolean) {
    const {
      appConfig: { themeConfig },
    } = this

    const { theme, assets } = themeConfig

    const buttonLogo = createDomElement('img', {
      src: assets.logo.vertical,
      style: widgetBubbleStyle.bubbleLogo,
    })

    const reqCountBadge = createDomElement('p', {
      id: 'req-count-badge',
      style: { ...widgetBubbleStyle.reqCountBadge, display: 'none' },
    })

    const closeButton = createDomElement('button', {
      onclick: (event: Event) => {
        event.stopPropagation()
        this.onCloseBubbleClick()
      },
      style: widgetBubbleStyle.closeButton,
    })

    return createDomElement(
      'button',
      {
        onclick: () => this.openWidgetIframe(),
        style: isFullMode ? widgetBubbleStyle[theme] : { display: 'none' },
      },
      reqCountBadge,
      buttonLogo,
      closeButton
    )
  }

  private initWalletUI() {
    const isFullMode = this.appMode === AppMode.Full

    this.widgetIframeContainer = this.createWidgetIframe(
      isFullMode
    ) as HTMLDivElement

    this.widgetBubble = this.createWidgetBubble(isFullMode) as HTMLButtonElement

    this.resizeWidgetUI()

    window.addEventListener('resize', () => this.resizeWidgetUI())

    this.widgetIframeContainer.style.display = 'none'

    document.body.appendChild(this.widgetBubble)
    document.body.appendChild(this.widgetIframeContainer)
  }

  private onCloseBubbleClick() {
    this.destroyWalletUI()
  }

  // Todo: add remove event listener for "resize" event

  private resizeWidgetUI() {
    const { matches: isViewportSmall } = window.matchMedia(
      `(max-width: ${BREAKPOINT_SMALL}px)`
    )

    setWalletSize(this.widgetIframeContainer, getWalletSize(isViewportSmall))

    setWalletPosition(
      this.widgetBubble,
      getWalletPosition(isViewportSmall, this.position)
    )

    setWalletPosition(
      this.widgetIframeContainer,
      getWalletPosition(isViewportSmall, this.position)
    )
  }

  private closeWidgetIframe() {
    this.widgetBubble.style.display = 'flex'
    this.widgetIframeContainer.style.display = 'none'
  }

  private openWidgetIframe() {
    this.widgetBubble.style.display = 'none'
    this.widgetIframeContainer.style.display = 'flex'
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
