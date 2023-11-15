import { JsonRpcResponse } from './typings'

class Popup {
  private window: Window | null
  private url: string
  private requestCount: number
  constructor(url: string) {
    this.url = url
  }

  public open(type: 'login'): Promise<unknown>
  public open(type: 'request'): Promise<JsonRpcResponse<unknown>>
  public open(type: 'login' | 'request' = 'login') {
    const windowFeatures = getWindowFeatures()
    if (type === 'request' && this.window && !this.window.closed) {
      this.requestCount += 1
      this.window.postMessage(
        { type: 'request', data: this.url },
        'http://localhost:8080'
      )
      this.window.focus()
    } else {
      if (type === 'request') this.requestCount = 1
      this.window = window.open(this.url, '_blank', windowFeatures)
    }
    if (type == 'login') {
      return this.getWindowResponse()
    } else {
      return this.requestHandler()
    }
  }

  public setUrl(url: string) {
    this.url = url
  }

  private getWindowResponse() {
    return new Promise((resolve, reject) => {
      let cleanExit = false
      const id = window.setInterval(() => {
        if (!cleanExit && this.window?.closed) {
          reject('User closed the popup')
        }
      }, 500)
      const handler = async (event: MessageEvent) => {
        if (!event?.data?.status) {
          return
        }
        const data = event.data as MessageData
        cleanExit = true
        this.clear(handler, id)

        if (data.status === 'success') {
          this.window?.close()
          return resolve('success')
        } else if (data.status == 'error') {
          this.window?.close()
          return reject(data.error)
        } else if (data.status === 'done') {
          return resolve('done')
        } else {
          console.log('Unexpected event')
        }
      }
      window.addEventListener('message', handler, false)
    })
  }

  requestHandler = (): Promise<any> => {
    return new Promise((resolve) => {
      let cleanExit = false
      const id = window.setInterval(() => {
        try {
          if (!cleanExit && this.window?.closed) {
            return resolve({
              id: 1,
              jsonrpc: '2.0',
              error: 'user_closed_popup',
            })
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }, 500)
      const handler = async (
        event: MessageEvent<{ type?: 'json_rpc_response'; response: any }>
      ) => {
        if (event.data.type == 'json_rpc_response') {
          cleanExit = true
          this.clear(handler, id)
          if (this.requestCount <= 1) {
            this.window?.close()
          }
          this.requestCount -= 1
          return resolve(event.data.response)
        }
      }
      window.addEventListener('message', handler, false)
    })
  }

  private clear(handler: (ev: MessageEvent) => void, id: number): void {
    window.removeEventListener('message', handler)
    window.clearInterval(id)
  }
}

// success for when login is complete - social
// done is for when popup work is over but shouldn't be closed - link
interface MessageData {
  status: 'success' | 'error' | 'done'
  error?: string
}

const popupFeatures: { [key: string]: number } = {
  titlebar: 0,
  toolbar: 0,
  status: 0,
  menubar: 0,
  resizable: 0,
  height: 1200,
  width: 700,
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
