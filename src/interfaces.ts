export type Theme = 'light' | 'dark'

export type Orientation = 'horizontal' | 'vertical'

export interface IframeWrapperParams {
  appId: string
  network: string
}

export interface IWidgetThemeConfig {
  assets: {
    logo: {
      dark: {
        horizontal: string
        vertical: string
      }
      light: {
        horizontal: string
        vertical: string
      }
    }
  }
  theme: Theme
}

export interface IConnectionMethods {
  isLoggedIn: () => Promise<boolean>
  triggerSocialLogin: (t: string, url: string) => Promise<string>
  triggerPasswordlessLogin: (email: string, url: string) => Promise<string>
  sendRequest: (req: any) => Promise<void>
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
  right: string
  bottom: string
}
