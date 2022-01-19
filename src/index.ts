import { ArcanaProvider } from "./arcanaProvider";
import IframeWrapper from "./iframeWrapper";
import { encryptWithPublicKey, cipher } from "eth-crypto";

interface LoginParams {
  appId: string;
}

interface State {
  iframeUrl: string;
  redirectUri?: string;
}

class WalletProvider {
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
      onConnect: (address: string) => {
        // this.emit("connect", { address });
      },
      onDisconnect: (err: string) => {
        // this.emit("disconnect", err);
      },
      onAccountChanged: (account: string) => {},
      onChainChanged: (chainId) => {},
      onMessage: (message: { type: string; data: string }) => {},
      onMethodResponse: (method: string, response: any) => {
        this.arcanaProvider.onResponse(method, response);
      },
    });
    this.arcanaProvider.setConnection(communication);
  }

  public requestLogin(loginType: string) {
    if (this.arcanaProvider) {
      this.arcanaProvider.triggerLogin(loginType);
    }
  }

  public emit() {}
  public async isLoggedIn() {
    return this.arcanaProvider.isLoggedIn();
  }

  public getProvider() {
    return this.arcanaProvider;
  }

  private initializeState() {
    const iframeUrl = "https://arcana-wallet-test.netlify.app";
    const redirectUri = `${iframeUrl}/${this.params.appId}/redirect`;
    this.state = { iframeUrl, redirectUri };
  }
}

export { WalletProvider };
