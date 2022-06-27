import { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-engine'

export type Theme = 'light' | 'dark'

export type Orientation = 'horizontal' | 'vertical'

export type Position = 'right' | 'left'

export interface IframeWrapperParams {
  appId: string
  iframeUrl: string
  appConfig: AppConfig
  position: Position
}

export interface InitInput {
  appMode: AppMode
  position: Position
}

export interface ThemeConfig {
  assets: {
    logo: {
      horizontal: string
      vertical: string
    }
  }
  theme: Theme
}

export interface AppInfo {
  name: string
  theme: Theme
}

export interface AppConfig {
  name: string
  themeConfig: ThemeConfig
}

export interface UserInfo {
  id: string
  email?: string
  name?: string
  picture?: string
}

export interface ChildMethods {
  isLoggedIn: () => Promise<boolean>
  triggerSocialLogin: (t: string, url: string) => Promise<string>
  triggerPasswordlessLogin: (email: string, url: string) => Promise<string>
  sendRequest: (req: JsonRpcRequest<unknown>) => Promise<void>
  getPublicKey: (email: string, verifier: string) => Promise<string>
  triggerLogout: () => Promise<void>
  getUserInfo: () => Promise<UserInfo>
}

export interface ParentMethods {
  onEvent: (t: string, val: unknown) => void
  onMethodResponse: (method: string, response: JsonRpcResponse<unknown>) => void
  getAppConfig: () => AppConfig
  getAppMode: () => AppMode
  sendPendingRequestCount: (count: number) => void
  getParentUrl: () => string
}

export interface TypedDataMessage {
  name: string
  type: string
  value: string
}

export interface WalletSize {
  height: string
  width: string
}

export interface WalletPosition {
  right?: string
  left?: string
  bottom: string
}

export interface NetworkConfig {
  RPC_URL: string
  CHAIN_ID: string
  NET_VERSION: string
  GATEWAY_URL: string
  WALLET_URL: string
  SENTRY_DSN: string
}

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
  network: ('testnet' | 'dev') | NetworkConfig
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
