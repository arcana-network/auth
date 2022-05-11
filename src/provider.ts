import { IConnectionMethods, IMessageParams } from './interfaces'
import {
  JsonRpcId,
  JsonRpcEngine,
  JsonRpcRequest,
  JsonRpcError,
  getUniqueId,
  PendingJsonRpcResponse,
  JsonRpcResponse,
} from 'json-rpc-engine'
import {
  providerFromEngine,
  createFetchMiddleware,
  providerFromMiddleware,
  createBlockRefMiddleware,
} from 'eth-json-rpc-middleware'
import {
  createWalletMiddleware,
  MessageParams,
  TransactionParams,
  TypedMessageParams,
} from './walletMiddleware'
import { PollingBlockTracker, Provider } from 'eth-block-tracker'
import { Connection } from 'penpal'
import { ethErrors } from 'eth-rpc-errors'
import { SafeEventEmitterProvider } from 'eth-json-rpc-middleware/dist/utils/cache'
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { getConfig } from './config'

interface RequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

const permissionedCalls = [
  'eth_sign',
  'personal_sign',
  'eth_decrypt',
  'eth_signTypedData_v4',
  'eth_signTransaction',
  'eth_sendTransaction',
]

class ProviderError extends Error implements JsonRpcError {
  code: number
  message: string
  data: string
  constructor(code: number, message: string, data = '') {
    super(message)
    this.code = code
    this.message = message
    this.data = data
  }
}

export class ArcanaProvider extends SafeEventEmitter {
  private jsonRpcEngine: JsonRpcEngine
  private provider: SafeEventEmitterProvider
  private subscriber: SafeEventEmitter
  private communication: Connection<IConnectionMethods>
  private iframeOpenHandler: () => void
  private iframeCloseHandler: () => void
  constructor() {
    super()
    this.initProvider()
    this.subscriber = new SafeEventEmitter()
  }

  public setConnection(connection: Connection<IConnectionMethods>) {
    this.communication = connection
  }

  public setHandlers(openHandler: () => void, closeHandler: () => void) {
    this.iframeOpenHandler = openHandler
    this.iframeCloseHandler = closeHandler
  }

  public onResponse = (method: string, response: JsonRpcResponse<unknown>) => {
    this.subscriber.emit(`result:${method}:${response.id}`, response)
  }

  public getProvider() {
    if (!this.provider) {
      this.initProvider()
    }
    return this.provider
  }

  public async isLoggedIn() {
    try {
      const c = await this.communication.promise
      return c.isLoggedIn()
    } catch (e) {
      console.log({ e })
      return false
    }
  }

  public async isConnected() {
    return await this.isLoggedIn()
  }

  getCurrentUrl() {
    const url = window.location.origin + window.location.pathname
    return url
  }

  public async triggerSocialLogin(loginType: string): Promise<string> {
    const c = await this.communication.promise
    const url = this.getCurrentUrl()
    const redirectUrl = await c.triggerSocialLogin(loginType, url)
    return redirectUrl
  }

  public async triggerPasswordlessLogin(email: string) {
    const c = await this.communication.promise
    const url = this.getCurrentUrl()
    const redirectUrl = await c.triggerPasswordlessLogin(email, url)
    return redirectUrl
  }

  public async getPublicKey(email: string, verifier: string) {
    const c = await this.communication.promise
    const pk = await c.getPublicKey(email, verifier)
    return pk
  }

  public async triggerLogout() {
    const c = await this.communication.promise
    await c.triggerLogout()
  }

  private initProvider() {
    this.initEngine()
    this.provider = providerFromEngine(this.jsonRpcEngine)
  }

  private openPermissionScreen(method: string) {
    if (permissionedCalls.includes(method)) {
      this.iframeOpenHandler()
    }
  }

  private closePermissionScreen(method: string) {
    if (permissionedCalls.includes(method)) {
      this.iframeCloseHandler()
    }
  }

  async request(args: RequestArguments) {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: 'Invalid request arguments',
        data: args,
      })
    }
    console.log({ args })

    const { method, params } = args
    if (!method) {
      throw ethErrors.rpc.invalidRequest({
        message: 'Invalid method argument',
        data: args,
      })
    }

    this.openPermissionScreen(method)
    const req: JsonRpcRequest<unknown> = {
      method,
      params,
      jsonrpc: '2.0',
      id: getUniqueId(),
    }

    return new Promise((resolve, reject) => {
      this.rpcRequest(
        req,
        (
          error: Error,
          response: PendingJsonRpcResponse<{ result: string; error: string }>
        ): void => {
          if (error || response.error) {
            reject(error || response.error)
          } else {
            if (Array.isArray(response)) {
              resolve(response)
            }
            if (response.result?.error) {
              reject(error || response.result?.error)
            } else if (response.result?.result) {
              resolve(response.result.result)
            } else {
              resolve(response.result)
            }
          }
        }
      )
    })
  }

  protected rpcRequest(
    req: JsonRpcRequest<unknown> | JsonRpcRequest<unknown>[],
    callback: (...args: any[]) => void
  ) {
    if (!Array.isArray(req)) {
      return this.jsonRpcEngine.handle<
        unknown,
        JsonRpcResponse<{ result: string; error: string }>
      >(req as JsonRpcRequest<unknown>, callback)
    }

    return this.jsonRpcEngine.handle(req as JsonRpcRequest<unknown>[], callback)
  }

  private createRequest(method: string, params: unknown) {
    return {
      id: getUniqueId(),
      method,
      params: params,
      jsonrpc: '2.0',
    } as JsonRpcRequest<unknown>
  }

  private initEngine() {
    this.jsonRpcEngine = new JsonRpcEngine()
    this.jsonRpcEngine.push(this.getWalletMiddleware())
    this.jsonRpcEngine.push(this.getBlockRefMiddleware())
  }

  private getWalletMiddleware() {
    const walletMiddleware = createWalletMiddleware({
      getAccounts: this.getAccounts,
      processEthSignMessage: this.ethSign,
      processPersonalMessage: this.personalSign,
      processSignTransaction: this.signTransaction,
      processEncryptionPublicKey: this.getEncryptionPublicKey,
      processDecryptMessage: this.decrypt,
      processTypedMessageV4: this.processTypedMessageV4,
      processTransaction: this.processTransaction,
    })
    return walletMiddleware
  }

  private getBlockRefMiddleware() {
    const fetchMiddleware = createFetchMiddleware({
      rpcUrl: getConfig().RPC_URL,
    })
    const blockProvider = providerFromMiddleware(fetchMiddleware)
    const blockTracker = new PollingBlockTracker({
      provider: blockProvider as Provider,
    })
    return createBlockRefMiddleware({ blockTracker, provider: blockProvider })
  }

  getAccounts = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_accounts'
      this.communication.promise.then(async (c) => {
        const r = this.createRequest(method, undefined)
        this.getResponse<string[]>(method, r.id).then(resolve, reject)
        await c.sendRequest(r)
      })
    })
  }

  processTransaction = async (
    _: TransactionParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_sendTransaction'
      this.communication.promise.then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  processTypedMessageV4 = async (
    _: TypedMessageParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    console.log({ req })
    return new Promise((resolve, reject) => {
      const method = 'eth_signTypedData_v4'
      this.communication.promise.then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  ethSign = async (
    _: TransactionParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_sign'
      this.communication.promise.then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  getEncryptionPublicKey = async (
    _: string,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    console.log({ req })
    return new Promise((resolve, reject) => {
      this.communication.promise.then(async (c) => {
        this.getResponse<string>('eth_getEncryptionPublicKey', req.id).then(
          resolve,
          reject
        )
        await c.sendRequest(req)
      })
    })
  }

  signTransaction = async (
    _: TransactionParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_signTransaction'
      this.communication.promise.then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  personalSign = async (
    params: MessageParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    console.log({ params, req })
    return new Promise((resolve, reject) => {
      this.communication.promise.then(async (c) => {
        this.getResponse<string>('personal_sign', req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  decrypt = async (
    _: IMessageParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    console.log({ req })
    return new Promise((resolve, reject) => {
      this.communication.promise.then(async (c) => {
        this.getResponse<string>('eth_decrypt', req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  getResponse<U>(method: string, id: JsonRpcId): Promise<U> {
    return new Promise((resolve, reject) => {
      this.subscriber.once(
        `result:${method}:${id}`,
        (params: { error: string; result: U }) => {
          this.closePermissionScreen(method)
          console.log('Get response: ', { params })
          if (params.error) {
            return reject(getError(params.error))
          }
          return resolve(params.result)
        }
      )
    })
  }
}

const getError = (message: string) => {
  switch (message) {
    case 'user_deny':
      return new ProviderError(4001, 'The request was denied by the user')
    case 'operation_not_supported':
      return new ProviderError(4200, 'The request is not supported currently')
    default:
      return new ProviderError(-32603, 'Internal error')
  }
}
