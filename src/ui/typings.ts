type ModalParams = {
  loginWithLink: (email: string) => Promise<unknown>
  loginWithSocial: (type: string) => Promise<unknown>
  closeFunc: () => unknown
  loginList: string[]
  mode: Theme
}

type Theme = 'dark' | 'light'

export { ModalParams, Theme }