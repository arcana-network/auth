import { iframeWrapperParams, IConnectionMethods } from "./interfaces";
import { connectToChild, Connection } from "penpal";
import { iframeStyle, closeButtonStyle, roundButtonStyle } from "./styles";
import { WalletTypes } from "./typings"
export default class IframeWrapper {
  private iframe: HTMLIFrameElement;
  private button: HTMLDivElement;
  private closeButton: HTMLDivElement;
  private iframeCommunication: Connection<IConnectionMethods>;
  private walletType: number;
  private opened = false;
  constructor(private params: iframeWrapperParams, private iframeUrl: string) {
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
    console.log(`show(${this.walletType}) called`)
    switch(this.walletType) {
      case WalletTypes.Full:
        {
          console.log('opening')
          this.openFrame();
          break;
        }
      case WalletTypes.Partial:
        {
          console.log('opening')
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
    console.log(`hide(${this.walletType}) called`)
    switch(this.walletType) {
      case WalletTypes.Full:
        {
          console.log('closing')
          this.closeFrame();
          break;
        }
      case WalletTypes.Partial:
        {
          console.log('closing')
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
        this.initIframe();
        this.createButton();
        this.display();
      }
      console.log("Going to display iframe");
      if (!this.iframeCommunication) {
        await this.createIframeCommunicationInstance(params);
      }
    } catch (error) {
      console.log({ error });
      throw new Error("Error during createOrGetInstance in IframeWrapper");
    }
    return { iframe: this.iframe, communication: this.iframeCommunication };
  }
  private initIframe() {
    this.iframe = document.createElement("iframe");
    this.iframe.className = "wallet_iframe";
    this.iframe.src = `${this.iframeUrl}/${this.params.appId}/login`;
    this.iframe.style.display = "none";
    console.log({ initIframe: this.iframe });
  }


  private closeFrame() {
    if (this.opened) {
      this.iframe.style.display = "none";
      if(this.walletType === WalletTypes.Full) {
        this.closeButton.style.display = "none";
        this.button.style.display = "flex";
      }
      this.opened = false;
    }
  }

  private openFrame() {
    if (!this.opened) {
      this.iframe.style.display = "block";
      if(this.walletType === WalletTypes.Full) {
        this.closeButton.style.display = "flex";
        this.button.style.display = "none";
      }
      this.opened = true;
    }
  }
  private display() {
    Object.assign(this.iframe.style, iframeStyle);
    document.body.appendChild(this.iframe);
    return;
  }

  private createCloseButton() {
    this.closeButton = document.createElement("div");
    Object.assign(this.closeButton.style, closeButtonStyle)
    this.closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeFrame();
    });

    const text = document.createElement("div");
    text.innerHTML = "x";
    text.style.width = "100%";

    this.closeButton.appendChild(text);
    document.body.appendChild(this.closeButton);
  }

  private createButton() {
    if(this.walletType === WalletTypes.Full) {
        this.button = document.createElement("div");
        Object.assign(this.button.style, roundButtonStyle)
        this.button.addEventListener("click", (e) => {
          e.preventDefault();
          this.openFrame();
        });
    
        const text = document.createElement("div");
        text.innerHTML = "A";
        text.style.width = "100%";
    
        this.button.appendChild(text);
    
        this.createCloseButton();
        document.body.appendChild(this.button);
      }
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