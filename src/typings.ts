export enum WalletType {
  NoUI = 0,
  UI = 1,
}

export enum AppMode {
  NoUI = 0,
  Widget = 1,
  Full = 2,
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
