import { getModalStyleSheet } from './css'
import { Modal } from './modal'
import { ModalParams } from './typings'
import { render } from 'preact'
import './test.css'
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
    const stylesheet = getModalStyleSheet(this.params.mode)
    const head = document.getElementsByTagName('head')[0]
    head.appendChild(stylesheet)
    const link = document.createElement('link')

    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = './auth-style.css'
    head.appendChild(stylesheet)
    head.appendChild(link)
  }

  private createContainer() {
    this.container = document.createElement('div')
    this.container.setAttribute('id', 'xar-login-container')
    document.body.appendChild(this.container)
  }
}

export { ModalController }
