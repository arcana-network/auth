class Popup {
  private window: Window | null
  constructor(public url: string) {}

  public open(shouldPoll = false) {
    const windowFeatures = getWindowFeatures()
    this.window = window.open(this.url, '_blank', windowFeatures)
    return this.getWindowResponse(shouldPoll)
  }

  private getWindowResponse(shouldPoll = false) {
    return new Promise((resolve, reject) => {
      let cleanExit = false
      let pollId: number
      if (shouldPoll) {
        pollId = window.setInterval(() => {
          if (!cleanExit && this.window?.closed) {
            reject('User closed the popup')
          }
        }, 500)
      }
      const handler = async (event: MessageEvent) => {
        if (!event?.data?.status) {
          return
        }

        const data = event.data as MessageData
        cleanExit = true

        if (data.status === 'close') {
          this.window?.close()
          return
        }

        if (shouldPoll) {
          clearInterval(pollId)
        }
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
  status: 'success' | 'error' | 'close'
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
