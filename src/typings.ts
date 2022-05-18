export enum WalletTypes {
  UI = 1,
  NoUI = 2,
}

export enum AppMode {
  Full = 0,
  Widget = 1,
  NoUI = 2,
}

export const ModeWalletTypeRelation = {
  [WalletTypes.UI]: [AppMode.Widget, AppMode.Full],
  [WalletTypes.NoUI]: [AppMode.NoUI],
}

export interface InitParams {
  appId: string
  network: 'testnet' | 'dev'
  iframeUrl?: string
  inpageProvider: boolean
}

export interface State {
  iframeUrl: string
  redirectUri?: string
}
