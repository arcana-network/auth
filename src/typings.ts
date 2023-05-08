export type Theme = 'light' | 'dark'

export type Orientation = 'horizontal' | 'vertical'

export type Position = 'right' | 'left'

export type Network = 'dev' | 'testnet' | 'mainnet'

export type SDKVersion = 'v3'

/* json-rpc-engine types */
export declare type JsonRpcVersion = '2.0'
export declare type JsonRpcId = number | string | void

export interface JsonRpcRequest<T> {
  jsonrpc: JsonRpcVersion
  method: string
  id: JsonRpcId
  params?: T
}

interface JsonRpcResponseBase {
  jsonrpc: JsonRpcVersion
  id: JsonRpcId
}

export interface JsonRpcFailure extends JsonRpcResponseBase {
  error: JsonRpcError
}

export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
  stack?: string
}

declare type Maybe<T> = Partial<T> | null | undefined

export interface JsonRpcSuccess<T> extends JsonRpcResponseBase {
  result: Maybe<T>
}

export type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure
/* end of json-rpc-engine types */

export enum InitStatus {
  CREATED,
  RUNNING,
  DONE,
}

export interface IframeWrapperParams {
  appId: string
  iframeUrl: string
  appConfig: AppConfig
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
  address: string
  publicKey: string
}
export type Logins = 'google' | 'github' | 'discord' | 'twitch' | 'twitter'

export interface ChildMethods {
  isLoggedIn: () => Promise<boolean>
  isLoginAvailable: (type: string) => Promise<boolean>
  getAvailableLogins: () => Promise<Logins[]>
  triggerSocialLogin: (t: string, url: string) => Promise<string>
  triggerPasswordlessLogin: (email: string, url: string) => Promise<string>
  sendRequest: (req: JsonRpcRequest<unknown>) => Promise<void>
  getPublicKey: (email: string, verifier: string) => Promise<string>
  triggerLogout: (isV2?: boolean) => Promise<void>
  getUserInfo: () => Promise<UserInfo>
  initPasswordlessLogin: (email: string) => {
    sessionId: string
    setToken: string
  }
  expandWallet: () => Promise<void>
}

export interface ParentMethods {
  onEvent: (t: string, val: unknown) => void
  onMethodResponse: (method: string, response: JsonRpcResponse<unknown>) => void
  sendPendingRequestCount: (count: number) => void
  getAppConfig: () => AppConfig
  getAppMode: () => AppMode
  getParentUrl: () => string
  triggerSocialLogin: (kind: string) => void
  triggerPasswordlessLogin: (email: string) => void
  getPopupState: () => 'open' | 'closed'
  setIframeStyle: (styles: CSSStyleDeclaration) => void
  getWalletPosition: () => Position
  getSDKVersion: () => SDKVersion
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
  authUrl: string
  gatewayUrl: string
  walletUrl: string
}

export interface RpcConfig {
  rpcUrls: string[]
  chainId: string
  chainName?: string
  blockExplorerUrls?: string[]
  nativeCurrency?: {
    symbol: string
    decimals: number
  }
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

export interface ConstructorParams {
  network: ('testnet' | 'dev' | 'mainnet') | NetworkConfig
  debug: boolean
  alwaysVisible: boolean
  redirectUrl?: string
  theme: Theme
  position: Position
}

type RequestArguments = {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface EthereumProvider {
  request(args: RequestArguments): Promise<unknown>
  on(eventName: string | symbol, listener: (...args: any[]) => void): this
  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ): this
}
