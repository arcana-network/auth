import { NetworkConfig } from './typings'

let network: 'dev' | 'testnet' | 'custom' = 'dev'

let customConfig: NetworkConfig

const DEFAULT_SENTRY_DSN =
  'https://4e27545e4faf43318301625d79a6dc34@o1011868.ingest.sentry.io/6451353'

const DEV_CONFIG: NetworkConfig = {
  AUTH_URL: 'https://verify.dev.arcana.network',
  RPC_URL: 'https://blockchain-dev.arcana.network',
  CHAIN_ID: '0x9dd4',
  NET_VERSION: '40404',
  GATEWAY_URL: 'https://gateway-dev.arcana.network',
  WALLET_URL: 'https://wallet.dev.arcana.network',
  SENTRY_DSN:
    'https://68615fda056a4337bcc9b7e3062562c3@o1011868.ingest.sentry.io/6449849',
}

const TESTNET_CONFIG: NetworkConfig = {
  AUTH_URL: 'https://verify.beta.arcana.network',
  RPC_URL: 'https://blockchain001-testnet.arcana.network/',
  CHAIN_ID: '0x9dd5',
  NET_VERSION: '40405',
  GATEWAY_URL: 'https://gateway001-testnet.arcana.network',
  WALLET_URL: 'https://wallet.beta.arcana.network',
  SENTRY_DSN:
    'https://4e27545e4faf43318301625d79a6dc34@o1011868.ingest.sentry.io/6451353',
}

const getConfig = () => {
  switch (network) {
    case 'dev':
      return DEV_CONFIG
    case 'testnet':
      return TESTNET_CONFIG
    case 'custom':
      return customConfig
  }
}

function setCustomConfig(n: NetworkConfig) {
  network = 'custom'
  customConfig = n
  customConfig.SENTRY_DSN = DEFAULT_SENTRY_DSN
}

const setIframeDevUrl = (url: string) => {
  DEV_CONFIG.WALLET_URL = url
}

const setNetwork = (n: 'testnet' | 'dev') => {
  network = n
}

function isNetworkConfig(
  network: string | NetworkConfig
): network is NetworkConfig {
  if (typeof network === 'string') {
    return false
  }
  if (!(typeof network == 'object' && network.RPC_URL)) {
    return false
  }
  if (!(typeof network == 'object' && network.CHAIN_ID)) {
    return false
  }
  if (!(typeof network == 'object' && network.NET_VERSION)) {
    return false
  }
  if (!(typeof network == 'object' && network.GATEWAY_URL)) {
    return false
  }
  if (!(typeof network == 'object' && network.WALLET_URL)) {
    return false
  }
  if (!(typeof network == 'object' && network.AUTH_URL)) {
    return false
  }
  return true
}

export {
  getConfig,
  setCustomConfig,
  setNetwork,
  setIframeDevUrl,
  isNetworkConfig,
}
