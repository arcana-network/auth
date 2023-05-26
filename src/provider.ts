import {
  JsonRpcId,
  JsonRpcRequest,
  JsonRpcError,
  JsonRpcResponse,
  ChildMethods,
  EthereumProvider,
  ChainConfigInput,
} from './typings'
import { Connection } from 'penpal'
import { ethErrors } from 'eth-rpc-errors'
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { ArcanaAuthError, ErrorNotLoggedIn } from './errors'
import { getLogger, Logger } from './logger'
import IframeWrapper from './iframeWrapper'
import { getCurrentUrl, getHexFromNumber, getUniqueId } from './utils'

interface RequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

// const permissionedCalls = [
//   'eth_sign',
//   'personal_sign',
//   'eth_decrypt',
//   'eth_signTypedData_v4',
//   'eth_signTransaction',
//   'eth_sendTransaction',
//   'wallet_switchEthereumChain',
//   'wallet_addEthereumChain',
// ]

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

interface TriggerLoginFuncs {
  loginWithSocial(loginType: string): void
  loginWithLink(email: string): void
}

export class ArcanaProvider
  extends SafeEventEmitter
  implements EthereumProvider
{
  public chainId: string
  public connected = false
  private communication: Connection<ChildMethods>
  private subscriber: SafeEventEmitter
  private iframe: IframeWrapper
  private logger: Logger = getLogger('ArcanaProvider')
  constructor(private rpcConfig: ChainConfigInput | undefined) {
    super()
    this.subscriber = new SafeEventEmitter()
  }

  public isArcana() {
    return true
  }

  public async init(iframe: IframeWrapper, loginFuncs: TriggerLoginFuncs) {
    this.iframe = iframe
    const { communication } = await this.iframe.setConnectionMethods({
      onEvent: this.handleEvents,
      onMethodResponse: (
        method: string,
        response: JsonRpcResponse<unknown>
      ) => {
        this.onResponse(method, response)
      },
      getParentUrl: getCurrentUrl,
      getAppMode: () => this.iframe?.appMode,
      getAppConfig: this.iframe.getAppConfig,
      getWalletPosition: this.iframe.getWalletPlace,
      getRpcConfig: () => this.rpcConfig,
      sendPendingRequestCount: this.iframe.onReceivingPendingRequestCount,
      triggerSocialLogin: loginFuncs.loginWithSocial,
      triggerPasswordlessLogin: loginFuncs.loginWithLink,
      getPopupState: () => this.iframe.getState(),
      setIframeStyle: this.iframe.setIframeStyle,
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

  public async isConnected() {
    return this.connected
  }

  public async isLoginAvailable(type: string) {
    const c = await this.getCommunication('isLoginAvailable')
    const available = await c.isLoginAvailable(type)
    this.logger.info('loginAvailable', { [type]: available })
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

  public async getPublicKey(email: string, verifier: string) {
    const c = await this.getCommunication('getPublicKey')
    const pk = await c.getPublicKey(email, verifier)
    return pk
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

  public async expandWallet() {
    const c = await this.getCommunication('expandWallet')
    return await c.expandWallet()
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

    return new Promise((resolve, reject) => {
      this.getCommunication().then(async (c) => {
        this.getResponse<string>(method, req.id).then(resolve, reject)
        await c.sendRequest(req)
      }, reject)
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
      case 'accountsChanged':
        this.emit(t, [val])
        break
      case 'chainChanged':
        this.setChainId(val)
        this.emit(
          'chainChanged',
          getHexFromNumber((val as { chainId: number }).chainId)
        )
        break
      case 'connect':
        this.chainId =
          typeof val === 'object' ? (val as { chainId: string }).chainId : ''
        this.connected = true
        this.emit('connect', val)
        break
      case 'disconnect':
        this.iframe.handleDisconnect()
        this.connected = false
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

type ErrorObj = {
  code: number
  message: string
  data?: string
}

const getError = (error: string | ErrorObj) => {
  getLogger('ArcanaProvider').error('getError', error)
  switch (error) {
    case 'user_deny':
      return new ProviderError(4001, 'User rejected the request.')
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
