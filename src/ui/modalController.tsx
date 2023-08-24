import { Modal } from './modal'
import { ModalParams } from './typings'
import { render } from 'preact'

class ModalController {
  private params: ModalParams
  private container: HTMLDivElement
  private status: 'open' | 'closed' = 'closed'
  private onClose: (err?: Error) => unknown
  constructor(params: Omit<ModalParams, 'closeFunc'>) {
    this.params = {
      loginList: params.loginList.filter((l) => l !== 'passwordless'),
      loginWithSocial: params.loginWithSocial,
      loginWithLink: params.loginWithLink,
      mode: params.mode,
      closeFunc: this.close,
      logo: params.logo,
      options: params.options,
    }

    this.createContainer()
  }

  public open(onClose: (err?: Error) => unknown) {
    if (this.status !== 'open') {
      this.onClose = onClose
      this.status = 'open'
      render(<Modal {...this.params} />, this.container)
    }
  }

  close = (error?: Error) => {
    if (this.status !== 'closed') {
      this.onClose(error)
      this.status = 'closed'
      render(null, this.container)
    }
  }

  private createContainer() {
    const modeClass = this.params.options.compact ?'compact': 'full'
    this.container = document.createElement('div')
    this.container.setAttribute('id', 'xar-login-container')
    this.container.classList.add(`xar-${this.params.mode}-mode`)
    this.container.classList.add(modeClass)
    document.body.appendChild(this.container)
  }
}

export { ModalController }
