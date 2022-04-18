import {
  iframeWrapperParams,
  IConnectionMethods,
  IWidgetThemeConfig,
} from "./interfaces"
import { connectToChild, Connection } from "penpal"
import { widgetIframeStyle, widgetBubbleStyle } from "./styles"
import { WalletTypes } from "./typings"
import {
  createDomElement,
  getLogo,
  getWalletPosition,
  getWalletSize,
  setWalletPosition,
  setWalletSize,
} from "./utils"

const BREAKPOINT_SMALL = 768

export default class IframeWrapper {
  private iframe: HTMLIFrameElement

  private widgetBubble: HTMLButtonElement
  private widgetIframeContainer: HTMLDivElement

  private iframeCommunication: Connection<IConnectionMethods>
  private walletType: number

  constructor(
    private params: iframeWrapperParams,
    private iframeUrl: string,
    private themeConfig: IWidgetThemeConfig,
    private destroyWalletUI: () => void
  ) {
    this.checkSecureOrigin()
  }

  public async getIframeInstance(params: {
    [k: string]: (...args: any) => any
  }) {
    return await this.createOrGetInstance(params)
  }

  public setWalletType(walletType: number) {
    this.walletType = walletType
  }

  show = () => {
    switch (this.walletType) {
      case WalletTypes.Full: {
        this.openWidgetIframe()
        break
      }
      case WalletTypes.Partial: {
        this.openWidgetIframe()
        break
      }
      case WalletTypes.NoUI:
      case WalletTypes.Disabled:
      default:
        break
    }
  }

  hide = () => {
    switch (this.walletType) {
      case WalletTypes.Full: {
        this.closeWidgetIframe()
        break
      }
      case WalletTypes.Partial: {
        this.closeWidgetIframe()
        break
      }
      case WalletTypes.NoUI:
      case WalletTypes.Disabled:
      default:
        break
    }
  }

  private async createOrGetInstance(params: {
    [k: string]: (params: any) => any
  }) {
    try {
      if (!this.iframe) {
        this.initWalletUI()
      }
      if (!this.iframeCommunication) {
        this.iframeCommunication = await this.createIframeCommunicationInstance(
          params
        )
      }
    } catch (error) {
      console.log({ error })
      throw new Error("Error during createOrGetInstance in IframeWrapper")
    }
    return { iframe: this.iframe, communication: this.iframeCommunication }
  }

  private constructWidgetIframeStructure() {
    const {
      themeConfig: { theme },
    } = this

    const appLogo = createDomElement("img", {
      src: getLogo(this.themeConfig, "horizontal"),
      style: widgetIframeStyle.header.logo,
    })
    const closeButton = createDomElement("button", {
      onclick: () => this.closeWidgetIframe(),
      style: widgetIframeStyle.header.closeButton[theme],
    })

    const widgetIframeHeader = createDomElement(
      "div",
      { style: widgetIframeStyle.header.container[theme] },
      appLogo,
      closeButton
    )
    const widgetIframeBody = createDomElement("div", {
      style: widgetIframeStyle.body,
    })

    return { widgetIframeHeader, widgetIframeBody }
  }

  private createWidgetIframe() {
    this.iframe = createDomElement("iframe", {
      style: widgetIframeStyle.iframe,
      src: `${this.iframeUrl}/${this.params.appId}/login`,
    })

    const { widgetIframeHeader, widgetIframeBody } =
      this.constructWidgetIframeStructure()

    widgetIframeBody.appendChild(this.iframe)

    return createDomElement(
      "div",
      { style: widgetIframeStyle.container },
      widgetIframeHeader,
      widgetIframeBody
    )
  }

  private createWidgetBubble() {
    if (this.walletType === WalletTypes.Full) {
      const {
        themeConfig: { theme },
      } = this
      const buttonLogo = createDomElement("img", {
        src: getLogo(this.themeConfig, "vertical"),
      })

      const reqCountBadge = createDomElement("p", {
        id: "req-count-badge",
        style: {...widgetBubbleStyle.reqCountBadge, display: "none"},
      })

      const closeButton = createDomElement("button", {
        onclick: (event: Event) => {
          event.stopPropagation()
          this.onCloseBubbleClick()
        },
        style: widgetBubbleStyle.closeButton,
      })

      return createDomElement(
        "button",
        {
          onclick: () => this.openWidgetIframe(),
          style: widgetBubbleStyle[theme],
        },
        reqCountBadge,
        buttonLogo,
        closeButton
      )
    }
  }

  private initWalletUI() {
    this.widgetIframeContainer = this.createWidgetIframe()
    this.widgetBubble = this.createWidgetBubble()

    this.resizeWidgetUI()

    window.addEventListener("resize", () => this.resizeWidgetUI())

    this.widgetIframeContainer.style.display = "none"

    document.body.appendChild(this.widgetBubble)
    document.body.appendChild(this.widgetIframeContainer)
  }

  private onCloseBubbleClick() {
    this.destroyWalletUI()
  }

  // Todo: add remove event listener for "resize" event

  private resizeWidgetUI() {
    const { matches: isViewPortSmall } = window.matchMedia(
      `(max-width: ${BREAKPOINT_SMALL}px)`
    )

    setWalletSize(this.widgetIframeContainer, getWalletSize(isViewPortSmall))
    setWalletPosition(this.widgetBubble, getWalletPosition(isViewPortSmall))

    setWalletPosition(
      this.widgetIframeContainer,
      getWalletPosition(isViewPortSmall)
    )
  }

  private closeWidgetIframe() {
    this.widgetBubble.style.display = "flex"
    this.widgetIframeContainer.style.display = "none"
  }

  private openWidgetIframe() {
    this.widgetBubble.style.display = "none"
    this.widgetIframeContainer.style.display = "flex"
  }

  private async createIframeCommunicationInstance(params: {
    [k: string]: (params: any) => any
  }) {
    return connectToChild<IConnectionMethods>({
      iframe: this.iframe,
      methods: {
        ...params,
      },
      debug: true,
    })
  }

  private checkSecureOrigin() {
    const isLocalhost =
      location.hostname === "localhost" || location.hostname === "127.0.0.1"
    const isSecureOrigin = location.protocol === "https:"
    const isSecure = isLocalhost || isSecureOrigin
    if (!isSecure) {
      throw new Error(`Insecure origin`)
    }
  }
}
