import { ConnectOptions, Theme, ThemeSettings } from '../typings'

type ModalParams = {
  loginWithOTPStart: (
    email: string
  ) => Promise<{ begin: () => Promise<void>; isCompleteRequired: boolean }>
  loginWithOTPComplete: (otp: string) => Promise<unknown>
  loginWithSocial: (type: string) => Promise<unknown>
  closeFunc: () => unknown
  loginList: string[]
  mode: Theme
  logo: string
  options: ConnectOptions
  theme_settings: ThemeSettings
}

export { ModalParams }
