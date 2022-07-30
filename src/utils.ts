import EthCrypto from 'eth-crypto'
import { ethers } from 'ethers'
import { getConfig } from './config'
import { EncryptInput, WalletPosition, WalletSize, Position } from './typings'
import { AppMode, ModeWalletTypeRelation, WalletType } from './typings'
import * as Sentry from '@sentry/browser'
import { getLogger } from './logger'
import { InvalidAppId } from './errors'

const fallbackLogo =
  'https://arcana-front.s3.ap-south-1.amazonaws.com/fallback-logo.svg'

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
    throw InvalidAppId
  }
  const c = getContract(config.RPC_URL, appAddress)
  try {
    const res = await c.functions.walletType()
    const walletType: WalletType = res[0].toNumber()
    return walletType
  } catch (e) {
    getLogger('WalletProvider').error('getWalletType', e)
    throw new Error('Wallet Type not found in contract')
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

type elements = 'style' | 'src' | 'onclick' | 'id' | 'onerror'

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
    defaultIntegrations: false,
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

const setFallbackImage = (e: Event): void => {
  const target = e.target as HTMLImageElement
  target.src = fallbackLogo
}

export {
  computeAddress,
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
  setFallbackImage,
}
