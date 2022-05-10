export const WalletTypes = {
  Full: 0,
  Partial: 1,
  NoUI: 2,
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
