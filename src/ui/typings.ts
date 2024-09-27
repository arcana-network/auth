import { ConnectOptions, Theme } from '../typings'

type ModalParams = {
  loginWithOTPStart: (
    email: string
  ) => Promise<{ begin: () => Promise<void>; isCompleteRequired: boolean }>
  loginWithOTPComplete: (otp: string) => Promise<unknown>
  loginWithSocial: (type: string) => Promise<unknown>
  loginWithPasskey: () => Promise<void>
  closeFunc: () => unknown
  loginList: string[]
  mode: Theme
  logo: string
  options: ConnectOptions
}

export { ModalParams }
