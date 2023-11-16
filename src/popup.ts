import SafeEventEmitter from '@metamask/safe-event-emitter'
import { JsonRpcRequest, JsonRpcResponse } from './typings'

class Popup {
  private window: Window | null
  constructor(public url: string) {}

  public open() {
    const windowFeatures = getWindowFeatures()
    this.window = window.open(this.url, '_blank', windowFeatures)
    return this.getWindowResponse()
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

class RequestPopupHandler {
  private window: Window | null
  private requestCount = 0
  private emitter = new SafeEventEmitter()
  private ready = false
  private cleanExit = false
  constructor(public url: string) {}
  public async sendRequest(r: {
    chainId: string
    request: JsonRpcRequest<unknown>
  }) {
    if (!this.window) {
      this.ready = false
      this.requestCount = 0
      this.window = window.open(this.url, '_blank', getWindowFeatures())
      await waitForLoad()
      window.addEventListener('message', this.handler, false)
    }

    if (this.window) {
      this.requestCount++
      this.window.postMessage({ type: 'json_rpc_request', data: r }, this.url)

      this.requestHandler(String(r.request.id))
      const response = await new Promise<JsonRpcResponse<unknown>>((resolve) =>
        this.emitter.once(
          String(r.request.id),
          (response: JsonRpcResponse<unknown>) => {
            this.requestCount--
            if (this.requestCount <= 0) {
              window.removeEventListener('message', this.handler)
              this.window?.close()
              this.window = null
            }
            return resolve(response)
          }
        )
      )
      return response
    } else {
      throw Error('error while opening popup')
    }
  }

  requestHandler = (requestId: string): Promise<any> => {
    return new Promise((resolve) => {
      this.cleanExit = false
      const id = window.setInterval(() => {
        try {
          if (this.window?.closed) {
            if (!this.cleanExit) {
              this.emitter.emit(requestId, {
                id: requestId,
                jsonrpc: '2.0',
                error: 'user_closed_popup',
              })
            }
            window.clearInterval(id)
            resolve('ok')
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }, 500)
    })
  }

  handler = async (
    event: MessageEvent<{ type?: 'json_rpc_response'; response: any }>
  ) => {
    if (event.data.type == 'json_rpc_response') {
      this.cleanExit = true
      this.emitter.emit(event.data.response.id, event.data.response)
    }
  }
}

const waitForLoad = () => {
  return new Promise((resolve) => {
    const handler = (ev: MessageEvent) => {
      if (ev.data.type === 'READY_TO_RECEIVE') {
        window.removeEventListener('message', handler)
        resolve('ok')
      }
    }
    window.addEventListener('message', handler, false)
  })
}

export { RequestPopupHandler }

export default Popup
