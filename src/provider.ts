import {
  ChainConfigInput,
  ChildMethods,
  EthereumProvider,
  JsonRpcError,
  JsonRpcId,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccess,
} from './typings'
import { Connection } from 'penpal'
import { ethErrors } from 'eth-rpc-errors'
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { ArcanaAuthError, ErrorNotLoggedIn } from './errors'
import { getLogger, Logger } from './logger'
import IframeWrapper from './iframeWrapper'
import { RequestPopupHandler } from './popup'
import {
  encodeJSONToBase64,
  getCurrentUrl,
  getHexFromNumber,
  getUniqueId,
} from './utils'

interface RequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

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

const permissionedMethod = [
  'eth_sendTransaction',
  'eth_signTransaction',
  'eth_sign',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'personal_sign',
  'eth_decrypt',
]

interface AuthProvider {
  loginWithSocial(loginType: string): void
  loginWithLink(email: string): void
  connect(): Promise<EthereumProvider>
  appId: string
}

export class ArcanaProvider
  extends SafeEventEmitter
  implements EthereumProvider
{
  public chainId: string
  public connected = false
  private auth: AuthProvider
  private communication: Connection<ChildMethods>
  private subscriber: SafeEventEmitter
  private iframe: IframeWrapper
  private logger: Logger = getLogger()
  private popup: RequestPopupHandler
  constructor(
    private authUrl: string,
    private rpcConfig: ChainConfigInput | undefined
  ) {
    super()
    this.subscriber = new SafeEventEmitter()
  }

  public isArcana() {
    return true
  }

  public async init(iframe: IframeWrapper, auth: AuthProvider) {
    this.auth = auth
    this.popup = new RequestPopupHandler(this.createRequestUrl(auth.appId))
    this.iframe = iframe
    const { communication } = await this.iframe.setConnectionMethods({
      onEvent: this.handleEvents,
      onMethodResponse: this.onResponse,
      getParentUrl: getCurrentUrl,
      getAppMode: () => this.iframe.appMode,
      getAppConfig: this.iframe.getAppConfig,
      getWalletPosition: this.iframe.getWalletPlace,
      getRpcConfig: () => this.rpcConfig,
      sendPendingRequestCount: this.iframe.onReceivingPendingRequestCount,
      triggerSocialLogin: auth.loginWithSocial,
      triggerPasswordlessLogin: auth.loginWithLink,
      getPopupState: () => this.iframe.getState(),
      setIframeStyle: this.iframe.setIframeStyle,
      setSessionID: this.iframe.setSessionID,
      getSDKVersion: () => 'v3',
    })
    this.communication = communication
  }

  private onResponse = (method: string, response: JsonRpcResponse<unknown>) => {
    this.subscriber.emit(`result:${method}:${response.id}`, response)
  }

  public async isLoggedIn() {
    try {
      const c = await this.getCommunication('isLoggedIn')
      return c.isLoggedIn()
    } catch (e) {
      this.logger.error('isLoggedIn', e)
      return false
    }
  }

  public connect() {
    return this.auth.connect()
  }

  public async isConnected() {
    return this.connected
  }

  public async isLoginAvailable(type: string) {
    const c = await this.getCommunication('isLoginAvailable')
    const available = await c.isLoginAvailable(type)
    this.logger.debug('loginAvailable', { [type]: available })
    return available
  }

  public async requestUserInfo() {
    const c = await this.getCommunication('getUserInfo')
    const isLoggedIn = await c.isLoggedIn()
    if (!isLoggedIn) {
      throw ErrorNotLoggedIn
    }
    const info = await c.getUserInfo()
    return info
  }

  public async getReconnectionUrl() {
    const c = await this.getCommunication('getReconnectionUrl')
    const url = await c.getReconnectionUrl()
    return url
  }

  public async getPublicKey(email: string, verifier: string) {
    const c = await this.getCommunication('getPublicKey')
    return c.getPublicKey(email, verifier)
  }

  public async getAvailableLogins() {
    const c = await this.getCommunication('getAvailableLogins')
    const logins = await c.getAvailableLogins()
    return logins
  }

  public async triggerLogout() {
    const c = await this.getCommunication('triggerLogout')
    await c.triggerLogout(true)
  }

  public async initPasswordlessLogin(email: string) {
    const c = await this.getCommunication('initPasswordlessLogin')
    return await c.initPasswordlessLogin(email)
  }

  public async initSocialLogin(kind: string) {
    const c = await this.getCommunication('initSocialLogin')
    return await c.initSocialLogin(kind)
  }

  public async expandWallet() {
    const c = await this.getCommunication('expandWallet')
    return await c.expandWallet()
  }

  private async getKeySpaceConfigType() {
    const c = await this.getCommunication('getKeySpaceConfigType')
    return await c.getKeySpaceConfigType()
  }

  private async getCommunication(
    expectedFn: keyof ChildMethods = 'sendRequest'
  ) {
    if (this.communication) {
      const c = await this.communication.promise
      if (!c[expectedFn]) {
        throw new ArcanaAuthError(
          'fn_not_available',
          `The requested fn ${expectedFn} is not available in this context`
        )
      }
      return c
    }
    throw new ArcanaAuthError(
      'connection_not_available',
      'The connection is not available yet'
    )
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

    const req: JsonRpcRequest<unknown> = {
      method,
      params,
      jsonrpc: '2.0',
      id: getUniqueId(),
    }

    const keySpaceType = await this.getKeySpaceConfigType()
    const c = await this.getCommunication('addToActivity')

    return new Promise((resolve, reject) => {
      if (permissionedMethod.includes(method) && keySpaceType === 'global') {
        this.popup
          .sendRequest({
            chainId: this.chainId,
            request: req,
          })
          .then((value: JsonRpcResponse<unknown>) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore-next-line
            const error = value.error
            if (error) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore-next-line
              c.addToActivity({
                req,
                error,
                chainId: this.chainId,
              })
              if (error !== 'user_closed_popup') {
                return reject(getError(error))
              }
            } else {
              const result = (<JsonRpcSuccess<unknown>>value).result
              c.addToActivity({
                req,
                result,
                chainId: this.chainId,
              })
              return resolve(result)
            }
          })
      } else {
        this.getCommunication().then(async (c) => {
          this.getResponse<string>(method, req.id).then(resolve, reject)
          await c.sendRequest(req)
        }, reject)
      }
    })
  }

  getResponse<U>(method: string, id: JsonRpcId): Promise<U> {
    return new Promise((resolve, reject) => {
      this.subscriber.once(
        `result:${method}:${id}`,
        (params: { error: string; result: U }) => {
          if (params.error) {
            return reject(getError(params.error))
          }
          return resolve(params.result)
        }
      )
    })
  }

  private createRequestUrl(appId: string) {
    const u = new URL(`/${appId}/permission/`, this.authUrl)
    return u.href
  }

  setChainId(val: unknown) {
    if (
      val &&
      typeof val === 'object' &&
      'chainId' in val &&
      typeof (val as { chainId: number }).chainId === 'number'
    ) {
      this.chainId = getHexFromNumber((val as { chainId: number }).chainId)
    }
  }

  handleEvents = (t: string, val: unknown) => {
    switch (t) {
      case EVENTS.ACCOUNTS_CHANGED:
        this.emit(t, [val])
        break
      case EVENTS.CHAIN_CHANGED:
        this.setChainId(val)
        this.emit(t, getHexFromNumber((val as { chainId: number }).chainId))
        break
      case EVENTS.CONNECT:
        this.chainId =
          typeof val === 'object' ? (val as { chainId: string }).chainId : ''
        this.connected = true
        this.emit(t, val)
        break
      case EVENTS.DISCONNECT:
        this.iframe.handleDisconnect()
        this.connected = false
        this.emit(t, val)
        break
      case EVENTS.MESSAGE:
        this.emit(t, val)
        break
      default:
        break
    }
  }
}

const EVENTS = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
}

type ErrorObj = {
  code: number
  message: string
  data?: string
}

const getError = (error: string | ErrorObj) => {
  getLogger().error('getError', error)
  switch (error) {
    case 'user_deny':
      return new ProviderError(4001, 'User rejected the request.')
    case 'user_closed_popup':
      return new ProviderError(4001, 'User closed the popup.')
    case 'operation_not_supported':
      return new ProviderError(
        4200,
        'The requested method is not supported by this provider.'
      )
    case 'all_disconnected':
      return new ProviderError(
        4900,
        'The provider is disconnected from all chains. Login is pending.'
      )
    default:
      if (!(typeof error === 'string')) {
        return new ProviderError(error.code, error.message, error.data)
      }
      return ethErrors.rpc.internal(error)
  }
}
