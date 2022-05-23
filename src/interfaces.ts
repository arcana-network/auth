import { JsonRpcRequest } from 'json-rpc-engine'

export type Theme = 'light' | 'dark'

export type Orientation = 'horizontal' | 'vertical'

export type Position = 'right' | 'left'

export interface IframeWrapperParams {
  appId: string
  network: string
}

export interface IWidgetThemeConfig {
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

export interface IAppConfig {
  name: string
  themeConfig: IWidgetThemeConfig
}

export interface UserInfo {
  id: string
  email?: string
  name?: string
  picture?: string
}

export interface IConnectionMethods {
  isLoggedIn: () => Promise<boolean>
  triggerSocialLogin: (t: string, url: string) => Promise<string>
  triggerPasswordlessLogin: (email: string, url: string) => Promise<string>
  sendRequest: (req: JsonRpcRequest<unknown>) => Promise<void>
  getPublicKey: (email: string, verifier: string) => Promise<string>
  triggerLogout: () => Promise<void>
  getUserInfo: () => Promise<UserInfo>
}

export interface ITypedDataMessage {
  name: string
  type: string
  value: string
}

export interface IMessageParams {
  from: string
  data: string | ITypedDataMessage[]
}

export interface IWalletSize {
  height: string
  width: string
}

export interface IWalletPosition {
  right?: string
  left?: string
  bottom: string
}
