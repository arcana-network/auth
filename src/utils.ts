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
    "data:image/svg+xml,%3Csvg fill='none' height='70' viewBox='0 0 70 70' width='70' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23dbdbdb' height='70' rx='35' width='70'/%3E%3Cpath d='m20.75 42.9169 7.5493-8.8076c.671-.7827 1.0058-1.1741 1.404-1.3152.3494-.1239.7325-.1212 1.0801.0075.3962.1467.7254.5426 1.3855 1.3346l4.2218 5.0662c.616.7392.9233 1.1088 1.2979 1.2573.3291.1306.6936.147 1.0332.0468.3865-.114.7267-.4542 1.407-1.1346l.7871-.787c.6927-.6927 1.039-1.039 1.431-1.1521.3443-.0994.7117-.079 1.0429.0578.3772.1557.6838.5383 1.2957 1.3032l4.5652 5.7065m-.0007-17.1002v15.2c0 1.7735.0003 2.6604-.3448 3.3378-.3036.5958-.7887 1.0801-1.3845 1.3837-.6774.3452-1.5636.3452-3.3371.3452h-18.3666c-1.7735 0-2.6609 0-3.3383-.3452-.5959-.3036-1.08-.7879-1.3836-1.3837-.3451-.6774-.3451-1.5643-.3451-3.3378v-15.2c0-1.7735 0-2.6602.3451-3.3375.3036-.5959.7877-1.0804 1.3836-1.384.6774-.3451 1.5648-.3451 3.3383-.3451h18.3666c1.7735 0 2.6597 0 3.3371.3451.5958.3036 1.0809.7881 1.3845 1.384.3451.6773.3448 1.564.3448 3.3375zm-9.5 4.4334c-.8745 0-1.5833-.7089-1.5833-1.5833 0-.8745.7088-1.5834 1.5833-1.5834s1.5833.7089 1.5833 1.5834c0 .8744-.7088 1.5833-1.5833 1.5833z' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'/%3E%3Ccircle cx='40' cy='30' fill='%23000' r='2'/%3E%3C/svg%3E%0A",
  dark: "data:image/svg+xml,%3Csvg fill='none' height='70' viewBox='0 0 70 70' width='70' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23161616' height='70' rx='35' width='70'/%3E%3Cpath d='m20.75 42.9169 7.5493-8.8076c.671-.7827 1.0058-1.1741 1.404-1.3152.3494-.1239.7325-.1212 1.0801.0075.3962.1467.7254.5426 1.3855 1.3346l4.2218 5.0662c.616.7392.9233 1.1088 1.2979 1.2573.3291.1306.6936.147 1.0332.0468.3865-.114.7267-.4542 1.407-1.1346l.7871-.787c.6927-.6927 1.039-1.039 1.431-1.1521.3443-.0994.7117-.079 1.0429.0578.3772.1557.6838.5383 1.2957 1.3032l4.5652 5.7065m-.0007-17.1002v15.2c0 1.7735.0003 2.6604-.3448 3.3378-.3036.5958-.7887 1.0801-1.3845 1.3837-.6774.3452-1.5636.3452-3.3371.3452h-18.3666c-1.7735 0-2.6609 0-3.3383-.3452-.5959-.3036-1.08-.7879-1.3836-1.3837-.3451-.6774-.3451-1.5643-.3451-3.3378v-15.2c0-1.7735 0-2.6602.3451-3.3375.3036-.5959.7877-1.0804 1.3836-1.384.6774-.3451 1.5648-.3451 3.3383-.3451h18.3666c1.7735 0 2.6597 0 3.3371.3451.5958.3036 1.0809.7881 1.3845 1.384.3451.6773.3448 1.564.3448 3.3375zm-9.5 4.4334c-.8745 0-1.5833-.7089-1.5833-1.5833 0-.8745.7088-1.5834 1.5833-1.5834s1.5833.7089 1.5833 1.5834c0 .8744-.7088 1.5833-1.5833 1.5833z' stroke='%23f7f7f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'/%3E%3Ccircle cx='40' cy='30' fill='%23f7f7f7' r='2'/%3E%3C/svg%3E",
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
