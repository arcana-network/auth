import { Theme } from '../typings'

type ModalParams = {
  loginWithLink: (email: string, emailSentHook?: () => void) => Promise<unknown>
  loginWithSocial: (type: string) => Promise<unknown>
  closeFunc: () => unknown
  loginList: string[]
  mode: Theme
  logo: string
  compactMode: boolean
}

export { ModalParams }
