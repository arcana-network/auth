import EthCrypto from 'eth-crypto'
import { ethers } from 'ethers'
import {
  AppMode,
  ConstructorParams,
  ModeWalletTypeRelation,
  WalletType,
  EncryptInput,
  WalletPosition,
  WalletSize,
  Position,
  InitParams,
  Theme,
} from './typings'
import * as Sentry from '@sentry/browser'
import { getLogger } from './logger'
import { InvalidAppId } from './errors'

const fallbackLogo = {
  light:
    "data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1_14)'%3E%3Cpath d='M2.54488 38.9495L14.4645 23.3044C15.524 21.9141 16.0526 21.2188 16.6813 20.9682C17.233 20.7481 17.8379 20.7529 18.3867 20.9815C19.0123 21.2421 19.532 21.9453 20.5743 23.3522L27.2401 32.3514C28.2127 33.6644 28.6979 34.3209 29.2894 34.5847C29.809 34.8167 30.3845 34.8458 30.9207 34.6678C31.531 34.4653 32.0681 33.861 33.1422 32.6524L34.385 31.2545C35.4787 30.024 36.0255 29.4089 36.6444 29.208C37.188 29.0314 37.7681 29.0676 38.2911 29.3106C38.8866 29.5872 39.3707 30.2668 40.3368 31.6255L47.5449 41.7621M47.5438 11.3867V38.3867C47.5438 41.537 47.5442 43.1125 46.9994 44.3157C46.52 45.3741 45.7541 46.2343 44.8134 46.7736C43.7438 47.3868 42.3446 47.3868 39.5444 47.3868H10.5452C7.74502 47.3868 6.34389 47.3868 5.27434 46.7736C4.33347 46.2343 3.56912 45.3741 3.08976 44.3157C2.54488 43.1125 2.54488 41.537 2.54488 38.3867V11.3867C2.54488 8.23641 2.54488 6.66135 3.08976 5.45825C3.56912 4.39974 4.33347 3.53912 5.27434 2.99983C6.34389 2.38682 7.74502 2.38682 10.5452 2.38682H39.5444C42.3446 2.38682 43.7438 2.38682 44.8134 2.99983C45.7541 3.53912 46.52 4.39974 46.9994 5.45825C47.5442 6.66135 47.5438 8.23641 47.5438 11.3867ZM32.5441 19.2618C31.1634 19.2618 30.0443 18.0026 30.0443 16.4494C30.0443 14.896 31.1634 13.6368 32.5441 13.6368C33.9249 13.6368 35.044 14.896 35.044 16.4494C35.044 18.0026 33.9249 19.2618 32.5441 19.2618Z' stroke='black' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M32.5 19C33.8807 19 35 17.8807 35 16.5C35 15.1193 33.8807 14 32.5 14C31.1193 14 30 15.1193 30 16.5C30 17.8807 31.1193 19 32.5 19Z' fill='black'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_1_14'%3E%3Crect width='50' height='50' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A",
  dark: "data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_2_17)'%3E%3Cpath d='M2.54488 38.9495L14.4645 23.3044C15.524 21.9141 16.0526 21.2188 16.6813 20.9682C17.233 20.7481 17.8379 20.7529 18.3867 20.9815C19.0123 21.2421 19.532 21.9453 20.5743 23.3522L27.2401 32.3514C28.2127 33.6644 28.6979 34.3209 29.2894 34.5847C29.809 34.8167 30.3845 34.8458 30.9207 34.6678C31.531 34.4653 32.0681 33.861 33.1422 32.6524L34.385 31.2545C35.4787 30.024 36.0255 29.4089 36.6444 29.208C37.188 29.0314 37.7681 29.0676 38.2911 29.3106C38.8866 29.5872 39.3707 30.2668 40.3368 31.6255L47.5449 41.7621M47.5438 11.3867V38.3867C47.5438 41.537 47.5442 43.1125 46.9994 44.3157C46.52 45.3741 45.7541 46.2343 44.8134 46.7736C43.7438 47.3868 42.3446 47.3868 39.5444 47.3868H10.5452C7.74502 47.3868 6.34389 47.3868 5.27434 46.7736C4.33347 46.2343 3.56912 45.3741 3.08976 44.3157C2.54488 43.1125 2.54488 41.537 2.54488 38.3867V11.3867C2.54488 8.23641 2.54488 6.66135 3.08976 5.45825C3.56912 4.39974 4.33347 3.53912 5.27434 2.99983C6.34389 2.38682 7.74502 2.38682 10.5452 2.38682H39.5444C42.3446 2.38682 43.7438 2.38682 44.8134 2.99983C45.7541 3.53912 46.52 4.39974 46.9994 5.45825C47.5442 6.66135 47.5438 8.23641 47.5438 11.3867ZM32.5441 19.2618C31.1634 19.2618 30.0443 18.0026 30.0443 16.4494C30.0443 14.896 31.1634 13.6368 32.5441 13.6368C33.9249 13.6368 35.044 14.896 35.044 16.4494C35.044 18.0026 33.9249 19.2618 32.5441 19.2618Z' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M32.5 19C33.8807 19 35 17.8807 35 16.5C35 15.1193 33.8807 14 32.5 14C31.1193 14 30 15.1193 30 16.5C30 17.8807 31.1193 19 32.5 19Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_2_17'%3E%3Crect width='50' height='50' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A",
}

const getContract = (rpcUrl: string, appAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const appContract = new ethers.Contract(
    appAddress,
    ['function walletType() view returns (uint)'],
    provider
  )
  return appContract
}

const getWalletType = async (appId: string, gatewayUrl: string) => {
  const arcanaRpcUrl = await getArcanaRpc(gatewayUrl)
  const appAddress = await getAppAddress(appId, gatewayUrl)
  if (!appAddress) {
    throw InvalidAppId
  }

  const c = getContract(arcanaRpcUrl, appAddress)
  try {
    const res = await c.functions.walletType()
    const walletType: WalletType = res[0].toNumber()
    return walletType
  } catch (e) {
    getLogger('WalletProvider').error('getWalletType', e)
    throw new Error('Error occurred during getting wallet type')
  }
}

const getAppAddress = async (id: string, gatewayUrl: string) => {
  try {
    const u = new URL(`/api/v1/get-address/?id=${id}`, gatewayUrl)
    const res = await fetch(u.toString())
    const json = await res.json()
    const address: string = json?.address
    return address
  } catch (e) {
    getLogger('WalletProvider').error('getAppAddress', e)
    throw new Error('Error occurred during getting app address')
  }
}

const getArcanaRpc = async (gatewayUrl: string) => {
  try {
    const u = new URL('/api/v1/get-config/', gatewayUrl)
    const res = await fetch(u.toString())
    if (res.status < 400) {
      const json: { RPC_URL: string } = await res.json()
      return json.RPC_URL
    } else {
      const err = await res.text()
      getLogger('AuthProvider').error('getArcanaRpc', { err })
      throw new Error('Error during fetching config from gateway url')
    }
  } catch (e) {
    getLogger('WalletProvider').error('getAppAddress', e)
    throw new Error('Error occurred during getting arcana RPC url')
  }
}

type elements = 'style' | 'src' | 'onclick' | 'id' | 'onerror' | 'allow'

const createDomElement = (
  type: string,
  props: Partial<{ [key in elements]: object | string | (() => void) }>,
  ...children: (string | HTMLElement)[]
): HTMLElement => {
  const dom = document.createElement(type)
  if (props) {
    Object.assign(dom, props)
    if (props.style) Object.assign(dom.style, props.style)
  }
  for (const child of children) {
    if (typeof child != 'string') dom.appendChild(child)
    else dom.appendChild(document.createTextNode(child))
  }
  return dom
}

const setWalletSize = (element: HTMLElement, sizes: WalletSize): void => {
  element.style.height = sizes.height
  element.style.width = sizes.width
}

const setWalletPosition = (
  element: HTMLElement,
  position: WalletPosition
): void => {
  if (position.right) {
    element.style.right = position.right
  }
  if (position.left) {
    element.style.left = position.left
  }
  element.style.bottom = position.bottom
}

const getWalletSize = (isViewportSmall: boolean): WalletSize => {
  const sizes = { height: '', width: '' }
  if (isViewportSmall) {
    sizes.height = '375px'
    sizes.width = '235px'
  } else {
    sizes.height = '540px'
    sizes.width = '360px'
  }
  return sizes
}

const getWalletPosition = (
  isViewportSmall: boolean,
  position: Position
): WalletPosition => {
  const positionDistance = isViewportSmall ? '20px' : '30px'
  return { bottom: positionDistance, [position]: positionDistance }
}

function verifyMode(w: WalletType, a: AppMode | undefined): AppMode {
  const allowedModes = ModeWalletTypeRelation[w]
  if (a !== undefined) {
    if (!allowedModes.includes(a)) {
      getLogger('WalletProvider').warn('verifyMode-mismatch', {
        a,
        allowedModes,
      })
      return allowedModes[0]
    }
    return a
  } else {
    return allowedModes[0]
  }
}

const getSentryErrorReporter = (dsn: string): ((m: string) => void) => {
  Sentry.init({
    dsn,
    maxBreadcrumbs: 5,
    debug: true,
    defaultIntegrations: false,
  })
  return (msg: string) => {
    Sentry.captureMessage(msg)
  }
}

const constructLoginUrl = (params: {
  loginType: string
  email?: string
  appId: string
  authUrl: string
  redirectUrl: string
}) => {
  const url = new URL('/init', params.authUrl)
  const queryParams = new URLSearchParams()
  queryParams.append('loginType', params.loginType)
  queryParams.append('appId', params.appId)
  queryParams.append('parentUrl', encodeURIComponent(params.redirectUrl))
  if (params.email) {
    queryParams.append('email', params.email)
  }
  url.hash = queryParams.toString()
  return url.toString()
}

const redirectTo = (url: string) => {
  if (url) {
    setTimeout(() => (window.location.href = url), 50)
  }
  return
}

const isDefined = (arg: unknown) => arg !== undefined && arg !== null

const HEX_PREFIX = '0x'

const addHexPrefix = (i: string) =>
  i.startsWith(HEX_PREFIX) ? i : `${HEX_PREFIX}${i}`

const removeHexPrefix = (i: string) =>
  i.startsWith(HEX_PREFIX) ? i.substring(2) : i

const getHexFromNumber = (n: number, prefix = true): string => {
  const h = n.toString(16)
  return prefix ? addHexPrefix(h) : removeHexPrefix(h)
}
/**
 * A function to ECIES encrypt message using public key
 */
const encryptWithPublicKey = async (input: EncryptInput): Promise<string> => {
  const ciphertext = await EthCrypto.encryptWithPublicKey(
    removeHexPrefix(input.publicKey),
    input.message
  )
  return EthCrypto.cipher.stringify(ciphertext)
}

/**
 * A function to compute address from public key
 */
const computeAddress = (publicKey: string): string => {
  return ethers.utils.computeAddress(addHexPrefix(publicKey))
}

const setFallbackImage = (e: Event, theme: Theme): void => {
  const target = e.target as HTMLImageElement
  target.src = fallbackLogo[theme]
}

const getCurrentUrl = () => {
  const url = window.location.origin + window.location.pathname
  return url
}

const getConstructorParams = (initParams?: Partial<ConstructorParams>) => {
  const p: ConstructorParams = {
    network: 'testnet',
    debug: false,
  }
  if (initParams?.network) {
    p.network = initParams.network
  }
  if (initParams?.debug !== undefined) {
    p.debug = initParams.debug
  }
  if (initParams?.chainConfig) {
    p.chainConfig = initParams.chainConfig
  }
  if (initParams?.redirectUrl) {
    p.redirectUrl = initParams.redirectUrl
  }
  return p
}

const getInitParams = (input?: Partial<InitParams>): InitParams => {
  const p: InitParams = {
    appMode: AppMode.NoUI,
    position: 'right',
  }

  if (input?.appMode !== undefined) {
    p.appMode = input.appMode
  }
  if (input?.position !== undefined) {
    p.position = input.position
  }
  return p
}

export {
  computeAddress,
  constructLoginUrl,
  createDomElement,
  encryptWithPublicKey,
  getWalletType,
  setWalletSize,
  getWalletSize,
  setWalletPosition,
  getWalletPosition,
  verifyMode,
  getSentryErrorReporter,
  isDefined,
  addHexPrefix,
  removeHexPrefix,
  redirectTo,
  setFallbackImage,
  getHexFromNumber,
  getCurrentUrl,
  getConstructorParams,
  getInitParams,
}
