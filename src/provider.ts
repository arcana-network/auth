import { ChildMethods } from './typings'
import {
  JsonRpcId,
  JsonRpcEngine,
  JsonRpcRequest,
  JsonRpcError,
  getUniqueId,
  PendingJsonRpcResponse,
  JsonRpcResponse,
  createScaffoldMiddleware,
  JsonRpcMiddleware,
} from 'json-rpc-engine'
import {
  providerFromEngine,
  createFetchMiddleware,
  providerFromMiddleware,
  createBlockRefMiddleware,
  createRetryOnEmptyMiddleware,
  createInflightCacheMiddleware,
  createBlockCacheMiddleware,
  createBlockTrackerInspectorMiddleware,
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
import { SafeEventEmitterProvider } from 'eth-json-rpc-middleware'
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { getConfig } from './config'
import { UserNotLoggedInError } from './errors'
import { getLogger, Logger } from './logger'
import IframeWrapper from './iframeWrapper'

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
  private communication: Connection<ChildMethods>
  private logger: Logger = getLogger('ArcanaProvider')
  constructor(private iframe: IframeWrapper) {
    super()
    this.initProvider()
    this.subscriber = new SafeEventEmitter()
  }

  public async init() {
    const { communication } = await this.iframe.setConnectionMethods({
      onEvent: this.handleEvents,
      onMethodResponse: (
        method: string,
        response: JsonRpcResponse<unknown>
      ) => {
        this.onResponse(method, response)
      },
      getParentUrl: this.getCurrentUrl,
      getAppMode: () => {
        return this.iframe?.appMode
      },
      getAppConfig: this.iframe.getAppConfig,
      sendPendingRequestCount: this.iframe.onReceivingPendingRequestCount,
      triggerSocialLogin: this.triggerSocialLogin,
      triggerPasswordlessLogin: this.triggerPasswordlessLogin,
    })
    this.communication = communication
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
      this.logger.error('isLoggedIn', e)
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

  triggerSocialLogin = async (loginType: string) => {
    if (!(await this.isLoginAvailable(loginType))) {
      throw new Error(`${loginType} login is not available`)
    }

    const redirectUrl = this.constructLoginUrl({
      loginType,
      appId: this.iframe.params.appId,
    })

    this.redirectTo(redirectUrl)
    return
  }

  private redirectTo(url: string) {
    if (url) {
      setTimeout(() => (window.location.href = url), 50)
    }
    return
  }

  triggerPasswordlessLogin = async (email: string) => {
    const redirectUrl = this.constructLoginUrl({
      loginType: 'passwordless',
      appId: this.iframe.params.appId,
      email,
    })
    this.redirectTo(redirectUrl)
    return
  }

  private constructLoginUrl(params: {
    loginType: string
    email?: string
    appId: string
  }) {
    const url = new URL('/init', getConfig().AUTH_URL)
    const queryParams = new URLSearchParams()
    queryParams.append('loginType', params.loginType)
    queryParams.append('appId', params.appId)
    queryParams.append('parentUrl', encodeURIComponent(this.getCurrentUrl()))
    if (params.email) {
      queryParams.append('email', params.email)
    }
    url.hash = queryParams.toString()
    return url.toString()
  }

  public async isLoginAvailable(type: string) {
    const c = await this.communication.promise
    const available = await c.isLoginAvailable(type)
    this.logger.info('loginAvailable', { [type]: available })
    return available
  }

  public async requestUserInfo() {
    const c = await this.communication.promise
    const isLoggedIn = await c.isLoggedIn()
    if (!isLoggedIn) {
      this.logger.error('requestUserInfo', UserNotLoggedInError)
      throw UserNotLoggedInError
    }
    const info = await c.getUserInfo()
    return info
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

  private throwDisconnectedMessage() {
    throw getError('all_disconnected')
  }

  private async getCommunication() {
    const c = await this.communication.promise
    if (!c.sendRequest) {
      this.throwDisconnectedMessage()
    }
    return c
  }

  private openPermissionScreen(method: string) {
    if (permissionedCalls.includes(method)) {
      this.iframe.show()
    }
  }

  private closePermissionScreen(method: string) {
    if (permissionedCalls.includes(method)) {
      this.iframe.hide()
    }
  }

  async request(args: RequestArguments) {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: 'Invalid request arguments',
        data: args,
      })
    }

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
    this.jsonRpcEngine = this.getRpcEngine()
  }

  private getWalletMiddleware() {
    const walletMiddleware = createWalletMiddleware({
      requestAccounts: this.requestAccounts,
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

  private getRpcEngine() {
    const engine = new JsonRpcEngine()

    const networkMiddleware = this.getNetAndChainMiddleware()
    engine.push(networkMiddleware)

    const walletMiddleware = this.getWalletMiddleware()
    engine.push(walletMiddleware)

    const fetchMiddleware = createFetchMiddleware({
      rpcUrl: getConfig().RPC_URL,
    })
    engine.push(fetchMiddleware)

    const blockProvider = providerFromMiddleware(fetchMiddleware)
    const blockTracker = new PollingBlockTracker({
      provider: blockProvider as Provider,
      pollingInterval: 1000,
    })

    const blockRefMiddleware = createBlockRefMiddleware({
      blockTracker,
      provider: blockProvider,
    })
    engine.push(blockRefMiddleware)

    const blockRetryOnEmptyMiddleware = createRetryOnEmptyMiddleware({
      blockTracker,
      provider: blockProvider,
    })
    engine.push(blockRetryOnEmptyMiddleware)

    const cacheMiddleware = createInflightCacheMiddleware()
    engine.push(cacheMiddleware)

    const blockCacheMiddleware = createBlockCacheMiddleware({ blockTracker })
    engine.push(blockCacheMiddleware)

    const blockTrackMiddleware = createBlockTrackerInspectorMiddleware({
      blockTracker,
    })
    engine.push(blockTrackMiddleware)

    return engine
  }

  private getNetAndChainMiddleware() {
    return createScaffoldMiddleware({
      eth_chainId: getConfig().CHAIN_ID,
      net_version: getConfig().NET_VERSION,
    }) as JsonRpcMiddleware<string, unknown>
  }

  getAccounts = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_accounts'
      this.getCommunication().then(async (c) => {
        const r = this.createRequest(method, undefined)
        this.getResponse<string[]>(method, r.id).then(resolve, reject)
        await c.sendRequest(r)
      })
    })
  }

  requestAccounts = (): Promise<string[]> => {
    return new Promise((resolve) => {
      const accounts = this.getAccounts()
      resolve(accounts)
    })
  }

  processTransaction = async (
    _: TransactionParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_sendTransaction'
      this.getCommunication().then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  processTypedMessageV4 = async (
    _: TypedMessageParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const method = 'eth_signTypedData_v4'
      this.getCommunication().then(async (c) => {
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
      this.getCommunication().then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  getEncryptionPublicKey = async (
    _: string,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.getCommunication().then(async (c) => {
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
      this.getCommunication().then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  personalSign = async (
    _: MessageParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.getCommunication().then(async (c) => {
        this.getResponse<string>('personal_sign', req.id).then(resolve, reject)
        await c.sendRequest(req)
      })
    })
  }

  decrypt = async (
    _: MessageParams,
    req: JsonRpcRequest<unknown>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.getCommunication().then(async (c) => {
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
          if (params.error) {
            return reject(getError(params.error))
          }
          return resolve(params.result)
        }
      )
    })
  }

  handleEvents = (t: string, val: unknown) => {
    switch (t) {
      case 'accountsChanged':
        this.emit(t, [val])
        break
      case 'chainChanged':
        this.emit('chainChanged', val)
        break
      case 'connect':
        this.emit('connect', val)
        break
      case 'disconnect':
        this.emit('disconnect', val)
        break
      case 'message':
        this.emit('message', val)
        break
      default:
        break
    }
  }
}

const getError = (message: string) => {
  getLogger('ArcanaProvider').error('getError', message)
  switch (message) {
    case 'user_deny':
      return new ProviderError(4001, 'The request was denied by the user')
    case 'operation_not_supported':
      return new ProviderError(4200, 'The request is not supported currently')
    case 'all_disconnected':
      return new ProviderError(
        4900,
        'The provider is disconnected from all chains, login pending'
      )
    default:
      return new ProviderError(-32603, 'Internal error')
  }
}
