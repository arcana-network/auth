import { ArcanaProvider } from "./arcanaProvider";
import IframeWrapper from "./iframeWrapper";
import { encryptWithPublicKey, cipher } from "eth-crypto";
import SafeEventEmitter from "@metamask/safe-event-emitter";

interface LoginParams {
  appId: string;
}

interface State {
  iframeUrl: string;
  redirectUri?: string;
}

class WalletProvider extends SafeEventEmitter {
  public static async encryptWithPublicKey({
    message,
    publicKey,
  }: {
    message: string;
    publicKey: string;
  }): Promise<string> {
    const ciphertext = await encryptWithPublicKey(publicKey, message);
    return cipher.stringify(ciphertext);
  }
  private state: State;
  private iframe: HTMLIFrameElement;
  private iframeWrapper: IframeWrapper;
  private arcanaProvider: ArcanaProvider;
  constructor(private params: LoginParams) {
    super();
    this.initializeState();
  }

  public async init() {
    this.iframeWrapper = new IframeWrapper(
      {
        appId: this.params.appId,
        network: "test",
      },
      this.state.iframeUrl
    );
    this.arcanaProvider = new ArcanaProvider();
    const { communication } = await this.iframeWrapper.getIframeInstance({
      onEvent: this.handleEvents,
      onMethodResponse: (method: string, response: any) => {
        this.arcanaProvider.onResponse(method, response);
      },
    });
    this.arcanaProvider.setConnection(communication);
  }

  handleEvents = (t: string, val: unknown) => {
    switch (t) {
      case "accountsChanged":
        this.emit(t, [val]);
        break;
      case "chainChanged":
        this.emit("chainChanged", val);
        break;
      case "connect":
        this.emit("connect", val);
        break;
      case "disconnect":
        this.emit("disconnect", val);
        break;
      case "message":
        this.emit("message", val);
        break;
      default:
        break;
    }
  };

  public requestLogin(loginType: string) {
    if (this.arcanaProvider) {
      this.arcanaProvider.triggerLogin(loginType);
    }
  }

  public async isLoggedIn() {
    return this.arcanaProvider.isLoggedIn();
  }

  public getProvider() {
    return this.arcanaProvider;
  }

  private initializeState() {
    // const iframeUrl = "http://localhost:3000";
    const iframeUrl = "https://arcana-wallet-test.netlify.app";
    const redirectUri = `${iframeUrl}/${this.params.appId}/redirect`;
    this.state = { iframeUrl, redirectUri };
  }
}

export { WalletProvider };
