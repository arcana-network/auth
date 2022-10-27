import { getModalStyleSheet, getModeClass } from './css'
import { Modal } from './modal'
import { ModalParams } from './typings'
import { render } from 'preact'
class ModalController {
  private params: ModalParams
  private container: HTMLDivElement
  private status: 'open' | 'closed' = 'closed'
  constructor(params: Omit<ModalParams, 'closeFunc'>) {
    this.params = {
      loginList: params.loginList.filter((l) => l !== 'passwordless'),
      loginWithSocial: params.loginWithSocial,
      loginWithLink: params.loginWithLink,
      mode: params.mode,
      closeFunc: this.close,
    }

    this.createContainer()
    this.addModalStylesheet()
  }

  public open() {
    if (this.status !== 'open') {
      this.status = 'open'
      render(<Modal {...this.params} />, this.container)
    }
  }

  close = () => {
    if (this.status !== 'closed') {
      this.status = 'closed'
      render(null, this.container)
    }
  }

  private addModalStylesheet() {
    const stylesheet = getModalStyleSheet()
    const head = document.getElementsByTagName('head')[0]
    head.appendChild(stylesheet)
  }

  private createContainer() {
    this.container = document.createElement('div')
    this.container.setAttribute('id', 'xar-login-container')
    this.container.classList.add(getModeClass(this.params.mode))
    document.body.appendChild(this.container)
  }
}

export { ModalController }