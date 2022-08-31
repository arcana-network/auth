class Popup {
  private window: Window | null
  constructor(public url: string) {}

  public open() {
    const windowFeatures = getWindowFeatures()
    this.window = window.open(this.url, '_blank', windowFeatures)
    return this.getWindowResponse()
  }

  public getWindowResponse() {
    return new Promise((resolve, reject) => {
      let expectedExit = false
      const exitPoll = setInterval(() => {
        if (!expectedExit && this.window?.closed) {
          reject('User closed the popup')
        }
      }, 500)
      const handler = async (event: MessageEvent) => {
        if (!event?.data?.status) {
          return
        }
        const data = event.data as MessageData
        expectedExit = true
        clearInterval(exitPoll)
        this.clear(handler)

        if (data.status === 'success') {
          return resolve('success')
        } else if (data.status == 'error') {
          return reject(data.error)
        } else {
          console.log('Unexpected event')
        }
      }
      window.addEventListener('message', handler, false)
    })
  }

  private clear(handler: (ev: MessageEvent) => void): void {
    window.removeEventListener('message', handler)
    this.window?.close()
  }
}

interface MessageData {
  status: 'success' | 'error'
  error?: string
}

const popupFeatures: { [key: string]: number } = {
  titlebar: 0,
  toolbar: 0,
  status: 0,
  menubar: 0,
  resizable: 0,
  height: 700,
  width: 1200,
  popup: 1,
}

const getWindowFeatures = (): string => {
  const f: string[] = []
  for (const feature in popupFeatures) {
    f.push(`${feature}=${popupFeatures[feature]}`)
  }
  return f.join(',')
}

export default Popup
