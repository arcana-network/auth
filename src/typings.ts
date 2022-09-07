import { JsonRpcRequest, JsonRpcResponse } from 'json-rpc-engine'
import { Chain } from './chainList'
export type Theme = 'light' | 'dark'

export type Orientation = 'horizontal' | 'vertical'

export type Position = 'right' | 'left'

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

export interface InitParams {
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
  address: string
  publicKey: string
}

export interface ChildMethods {
  isLoggedIn: () => Promise<boolean>
  isLoginAvailable: (type: string) => Promise<boolean>
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
  sendPendingRequestCount: (count: number) => void
  getAppConfig: () => AppConfig
  getAppMode: () => AppMode
  getParentUrl: () => string
  getRpcConfig: () => RpcConfig
  triggerSocialLogin: (kind: string) => void
  triggerPasswordlessLogin: (email: string) => void
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
  sentryDsn?: string
}

export interface ChainConfigInput {
  rpcUrl: string
  chainId: Chain
}

export interface RpcConfig {
  rpcUrls: string[]
  chainId: number
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
  network: ('testnet' | 'dev') | NetworkConfig
  debug: boolean
  chainConfig?: ChainConfigInput
  redirectUrl?: string
}

export interface EncryptInput {
  message: string
  publicKey: string
}
