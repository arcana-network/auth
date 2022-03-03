import { iframeWrapperParams, IConnectionMethods, IWidgetThemeConfig } from "./interfaces";
import { connectToChild, Connection } from "penpal";
import { iframeStyle, closeButtonStyle, roundButtonStyle_theme } from "./styles";
import { WalletTypes } from "./typings"
import { createDomElement, getLogo } from "./utils"

export default class IframeWrapper {
  private iframe: HTMLIFrameElement;
  private widgetBubble: HTMLButtonElement;
  private iframeCommunication: Connection<IConnectionMethods>;
  private walletType: number;
  private opened = false;

  constructor(private params: iframeWrapperParams, private iframeUrl: string, private themeConfig: IWidgetThemeConfig) {
    this.checkSecureOrigin();
  }

  public async getIframeInstance(params: {
    [k: string]: (...args: any) => any;
  }) {
    const { iframe, communication } = await this.createOrGetInstance(params);
    return { iframe, communication };
  }

  public setWalletType(walletType: number) {
    this.walletType = walletType;
  }

  show = () => {
    switch(this.walletType) {
      case WalletTypes.Full:
        {
          this.openFrame();
          break;
        }
      case WalletTypes.Partial:
        {
          this.openFrame();
          break;
        }
      case WalletTypes.NoUI:
      case WalletTypes.Disabled:
      default:
        break;
    }
  }

  hide = () => {
    switch(this.walletType) {
      case WalletTypes.Full:
        {
          this.closeFrame();
          break;
        }
      case WalletTypes.Partial:
        {
          this.closeFrame();
          break;
        }
      case WalletTypes.NoUI:
      case WalletTypes.Disabled:
      default:
        break;
    }
  }

  private async createOrGetInstance(params: {
    [k: string]: (params: any) => any;
  }) {
    try {
      if (!this.iframe) {
        this.initWalletUI()
      }
      if (!this.iframeCommunication) {
        await this.createIframeCommunicationInstance(params);
      }
    } catch (error) {
      console.log({ error });
      throw new Error("Error during createOrGetInstance in IframeWrapper");
    }
    return { iframe: this.iframe, communication: this.iframeCommunication };
  }

  private closeFrame() {
    if (this.opened) {
      if(this.walletType === WalletTypes.Full) {
        this.widgetBubble.style.display = "flex";
      }
      this.opened = false;
    }
  }

  private openFrame() {
    if (!this.opened) {
      if(this.walletType === WalletTypes.Full) {
        this.widgetBubble.style.display = "none";
      }
      this.opened = true;
    }
  }

  private createWidgetIframe() {
    this.iframe = document.createElement("iframe");
    this.iframe.className = "wallet_iframe";
    this.iframe.src = `${this.iframeUrl}/${this.params.appId}/login`;
    this.iframe.style.display = "none";
  }

  private createWidgetBubble() {
    if(this.walletType === WalletTypes.Full) {
        const { themeConfig: { theme } } = this
        const buttonLogo = createDomElement("img", {src: getLogo(this.themeConfig, "vertical")})
        this.widgetBubble = createDomElement("button", {onclick: this.openFrame, style: roundButtonStyle_theme[theme]}, buttonLogo)
      }
  }

  private initWalletUI() {
    this.createWidgetIframe()
    this.createWidgetBubble()
    document.body.appendChild(this.widgetBubble);
    document.body.appendChild(this.iframe);
  }

  private async createIframeCommunicationInstance(params: {
    [k: string]: (params: any) => any;
  }) {
    const connection = connectToChild<IConnectionMethods>({
      iframe: this.iframe,
      methods: {
        ...params,
      },
      debug: true,
    });
    this.iframeCommunication = connection;
  }

  private checkSecureOrigin() {
    const isLocalhost =
      location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const isSecureOrigin = location.protocol === "https:";
    const isSecure = isLocalhost || isSecureOrigin;
    if (!isSecure) {
      throw new Error(`Insecure origin`);
    }
  }
}