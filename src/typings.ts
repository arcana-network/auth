import SafeEventEmitter from '@metamask/safe-event-emitter'

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

export enum ChainType {
  evm_secp256k1 = 'evm_secp256k1',
  solana_cv25519 = 'solana_cv25519',
}

export interface IframeWrapperParams {
  appId: string
  iframeUrl: string
  appConfig: AppConfig
  position: Position
  standaloneMode?: { mode: 1 | 2; handler: (t: string, val: unknown) => void }
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

export interface AppThemeInfo {
  theme: Theme
  logo: {
    dark_horizontal?: string
    dark_vertical?: string
    light_horizontal?: string
    light_vertical?: string
  }
}

export interface ThemeSettings {
  accent_color: string
  font_pairing: string
  font_size: string
  font_color: string
  radius: string
}
export interface AppInfo {
  name: string
  chain_type: 'evm' | 'solana'
  theme_settings: ThemeSettings
}

export interface AppConfig {
  name: string
  chainType: ChainType
  themeConfig: ThemeConfig
  theme_settings: ThemeSettings
}

export interface UserInfo {
  loginType: Logins | 'passwordless'
  id: string
  email?: string
  name?: string
  picture?: string
  address: string
  publicKey: string
  loginToken: string
  userDIDToken: string
}
export type Logins =
  | 'google'
  | 'github'
  | 'discord'
  | 'twitch'
  | 'twitter'
  | 'aws'
  | 'firebase'
  | 'steam'
export enum BearerAuthentication {
  firebase = 'firebase',
}
export type FirebaseBearer = {
  uid: string
  token: string
}

export interface ChildMethods {
  isLoggedIn: () => Promise<boolean>
  isLoginAvailable: (type: string) => Promise<boolean>
  getAvailableLogins: () => Promise<Logins[]>
  triggerSocialLogin: (t: string, url: string) => Promise<string>
  triggerPasswordlessLogin: (email: string, url: string) => Promise<string>
  triggerBearerLogin: (
    type: BearerAuthentication,
    data: FirebaseBearer
  ) => Promise<boolean>
  sendRequest: (
    req: JsonRpcRequest<unknown>,
    requestOrigin?: string
  ) => Promise<void>
  addToActivity: (req: object) => Promise<void>
  getPublicKey: (email: string, verifier: string) => Promise<string>
  triggerLogout: (isV2?: boolean) => Promise<void>
  logout: () => Promise<void>
  triggerCustomLogin: (params: {
    token: string
    userID: string
    provider: string
  }) => Promise<string>
  getUserInfo: () => Promise<UserInfo>
  initSocialLogin(kind: string): Promise<string>
  initPasswordlessLogin: (email: string) =>
    | {
        sessionId: string
        setToken: string
      }
    | string
  initOTPLogin: (email: string) => Promise<void | string>
  completeOTPLogin: (otp: string) => Promise<void>
  expandWallet: () => Promise<void>
  getReconnectionUrl: () => Promise<string>
  getKeySpaceConfigType: () => Promise<string>
}

export interface ParentMethods {
  onEvent: (t: string, val: unknown) => void
  uiEvent: (t: string, val: unknown) => void
  onMethodResponse: (method: string, response: JsonRpcResponse<unknown>) => void
  sendPendingRequestCount: (count: number) => void
  getAppConfig: () => AppConfig
  getAppMode: () => AppMode
  getParentUrl: () => string
  getRpcConfig: () => undefined
  triggerSocialLogin: (kind: string) => void
  triggerPasswordlessLogin: (email: string) => void
  getPopupState: () => 'open' | 'closed'
  setIframeStyle: (styles: CSSStyleDeclaration) => void
  getWalletPosition: () => Position
  getSDKVersion: () => SDKVersion
  setSessionID: (id: string, exp: number) => void
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

export enum AppMode {
  NoUI = 0,
  Widget = 1,
  Full = 2,
}

export interface ConnectOptions {
  compact: boolean
}

export interface ConstructorParams {
  network: ('testnet' | 'dev' | 'mainnet') | NetworkConfig
  debug: boolean
  alwaysVisible: boolean
  theme: Theme
  position: Position
  setWindowProvider: boolean
  appMode?: AppMode
  useEIP6963: boolean
  connectOptions: ConnectOptions
}

type RequestArguments = {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface EthereumProvider extends SafeEventEmitter {
  request(args: RequestArguments): Promise<unknown>
}

export type EIP6963ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export type CustomProviderParams = {
  provider: string
  userID: string
  token: string
}
