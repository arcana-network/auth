import { iframeWrapperParams, IConnectionMethods } from "./interfaces";
import { connectToChild, Connection } from "penpal";

export default class IframeWrapper {
  private iframe: HTMLIFrameElement;
  private button: HTMLDivElement;
  private closeButton: HTMLDivElement;
  private iframeCommunication: Connection<IConnectionMethods>;
  private open = false;
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
        this.createButton();
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

  private closeFrame() {
    if (this.open) {
      this.iframe.style.display = "none";
      this.closeButton.style.display = "none";
      this.button.style.display = "flex";
      this.open = false;
    }
  }

  private openFrame() {
    if (!this.open) {
      this.iframe.style.display = "block";
      this.closeButton.style.display = "flex";
      this.button.style.display = "none";
      this.open = true;
    }
  }
  private display() {
    if (this.iframe.style.display !== "block") {
      const style = {
        display: "block",
        height: "500px",
        width: "400px",
        top: "auto",
        left: "auto",
        right: "10px",
        bottom: "10px",
      };

      Object.assign(this.iframe.style, style);
      console.log("Appending iframe");
      document.body.appendChild(this.iframe);
      this.openFrame();
    }
    return;
  }

  private createCloseButton() {
    this.closeButton = document.createElement("div");
    this.closeButton.style.position = "absolute";
    this.closeButton.style.textAlign = "center";
    this.closeButton.style.display = "flex";
    this.closeButton.style.color = "white";
    this.closeButton.style.backgroundColor = "black";
    this.closeButton.style.alignItems = "center";
    this.closeButton.style.width = "25px";
    this.closeButton.style.height = "25px";
    this.closeButton.style.borderRadius = "50%";
    this.closeButton.style.right = "0";
    this.closeButton.style.bottom = "500px";
    this.closeButton.style.margin = "0 auto";
    this.closeButton.style.cursor = "pointer";
    this.closeButton.style.zIndex = "200";
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
    this.button = document.createElement("div");
    this.button.style.position = "absolute";
    this.button.style.textAlign = "center";
    this.button.style.display = "flex";
    this.button.style.color = "white";
    this.button.style.backgroundColor = "black";
    this.button.style.alignItems = "center";
    this.button.style.width = "60px";
    this.button.style.height = "60px";
    this.button.style.borderRadius = "50%";
    this.button.style.right = "10px";
    this.button.style.bottom = "10px";
    this.button.style.margin = "0 auto";
    this.button.style.cursor = "pointer";
    this.button.style.zIndex = "200";
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
