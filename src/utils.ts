import { ethers } from 'ethers'
import { getConfig } from './config'
import { IWalletPosition, IWalletSize, Position } from './interfaces'
import { AppMode, ModeWalletTypeRelation, WalletType } from './typings'
import * as Sentry from '@sentry/browser'
import { getLogger } from './logger'

const getContract = (rpcUrl: string, appAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const appContract = new ethers.Contract(
    appAddress,
    ['function walletType() view returns (uint)'],
    provider
  )
  return appContract
}

const getWalletType = async (appId: string) => {
  const config = getConfig()

  const appAddress = await getAppAddress(appId)
  if (!appAddress) {
    return null
  }
  const c = getContract(config.RPC_URL, appAddress)
  try {
    const res = await c.functions.walletType()
    const walletType = res[0].toNumber()
    return walletType
  } catch (e) {
    getLogger('WalletProvider').error('getWalletType', e)
    return null
  }
}

const getAppAddress = async (id: string) => {
  try {
    const config = getConfig()
    const u = new URL(`/get-address/?id=${id}`, config.GATEWAY_URL)
    const res = await fetch(u.toString())
    const json = await res.json()
    const address: string = json?.address
    return address
  } catch (e) {
    getLogger('WalletProvider').error('getAppAddress', e)
    throw e
  }
}

type elements = 'style' | 'src' | 'onclick' | 'id'

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

const setWalletSize = (element: HTMLElement, sizes: IWalletSize): void => {
  const { height, width } = sizes
  element.style.height = height
  element.style.width = width
}

const setWalletPosition = (
  element: HTMLElement,
  position: IWalletPosition
): void => {
  const { right, bottom, left } = position
  if (right) element.style.right = right
  if (left) element.style.left = left
  element.style.bottom = bottom
}

const getWalletSize = (isViewportSmall: boolean): IWalletSize => {
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
): IWalletPosition => {
  const positionDistance = isViewportSmall ? '20px' : '30px'
  return { bottom: positionDistance, [position]: positionDistance }
}

function verifyMode(w: WalletType, a: AppMode | undefined): AppMode {
  const allowedModes = ModeWalletTypeRelation[w]
  if (a !== undefined) {
    if (!allowedModes.includes(a)) {
      getLogger('WalletProvider').error('verifyMode-mismtch', {
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
  })
  return (msg: string) => {
    Sentry.captureMessage(msg)
  }
}

const isDefined = (arg: any) => arg !== undefined && arg !== null

const HEX_PREFIX = '0x'

const addHexPrefix = (i: string) =>
  i.startsWith(HEX_PREFIX) ? i : `${HEX_PREFIX}${i}`

const removeHexPrefix = (i: string) =>
  i.startsWith(HEX_PREFIX) ? i.substring(2) : i

export {
  createDomElement,
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
}
