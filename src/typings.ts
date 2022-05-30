export enum WalletType {
  UI = 0,
  NoUI = 1,
}

export enum AppMode {
  Full = 0,
  Widget = 1,
  NoUI = 2,
}

export const ModeWalletTypeRelation = {
  [WalletType.UI]: [AppMode.Widget, AppMode.Full],
  [WalletType.NoUI]: [AppMode.NoUI],
}

export interface InitParams {
  appId: string
  network: 'testnet' | 'dev'
  iframeUrl?: string
  inpageProvider: boolean
  debug: boolean
}

export interface State {
  iframeUrl: string
  redirectUri?: string
}

export interface EncryptInput {
  message: string
  publicKey: string
}
