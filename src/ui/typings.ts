import { ConnectOptions, Logins, Theme } from '../typings'

type ModalParams = {
  loginWithOTPStart: (
    email: string
  ) => Promise<{ begin: () => Promise<void>; isCompleteRequired: boolean }>
  loginWithOTPComplete: (otp: string) => Promise<unknown>
  loginWithSocial: (type: string) => Promise<unknown>
  closeFunc: () => unknown
  loginList: (Logins | 'passwordless')[]
  mode: Theme
  logo: string
  options: ConnectOptions
  allowedProviders: (Logins | 'passwordless')[]
}

export { ModalParams }
