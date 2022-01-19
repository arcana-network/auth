import { iframeWrapperParams, IConnectionMethods } from "./interfaces";
import { AsyncMethodReturns, connectToChild, Connection } from "penpal";

export default class IframeWrapper {
  private iframe: HTMLIFrameElement;
  private iframeCommunication: Connection<IConnectionMethods>;
  constructor(private params: iframeWrapperParams, private iframeUrl: string) {
    this.checkSecureOrigin();
  }

  public async getIframeInstance(params: {
    [k: string]: (...args: any) => any;
  }) {
    const { iframe, communication } = await this.createOrGetInstance(params);
    return { iframe, communication };
  }

  private async createOrGetInstance(params: {
    [k: string]: (params: any) => any;
  }) {
    try {
      if (!this.iframe) {
        this.initIframe();
      }

      this.display();
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
    // this.iframe.src = `${this.iframeUrl}/login`;
    this.iframe.src = `${this.iframeUrl}/${this.params.appId}/login`;
    this.iframe.style.display = "none";
    this.iframe.style.position = "fixed";
    this.iframe.style.bottom = "0";
    this.iframe.style.right = "0";
    this.iframe.style.width = "100%";
    this.iframe.style.border = "1px solid black";
    this.iframe.style.borderRadius = "5px";
    this.iframe.style.zIndex = "100";
    this.iframe.height = "500px";
    console.log({ initIframe: this.iframe });
  }

  private display() {
    if (this.iframe.style.display !== "block") {
      const style = {
        display: "block",
        height: "500px",
        width: "400px",
        top: "auto",
        left: "auto",
        right: "0",
        bottom: "0",
      };

      Object.assign(this.iframe.style, style);
      console.log("Appending iframe");
      document.body.appendChild(this.iframe);
    }
    return;
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
