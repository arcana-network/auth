export interface iframeWrapperParams {
  appId: string;
  network: string;
}

export interface IConnectionMethods {
  isLoggedIn: () => Promise<boolean>;
  triggerLogin: (t: string) => Promise<void>;
  sendRequest: (req: any) => Promise<void>;
}

export interface ITypedDataMessage {
  name: string;
  type: string;
  value: string;
}

export interface IMessageParams {
  from: string;
  data: string | ITypedDataMessage[];
}
