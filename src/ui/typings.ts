import { Theme } from '../typings'

type ModalParams = {
  loginWithLink: (email: string) => Promise<unknown>
  loginWithSocial: (type: string) => Promise<unknown>
  closeFunc: () => unknown
  loginList: string[]
  mode: Theme
  logo: string
}

export { ModalParams }
