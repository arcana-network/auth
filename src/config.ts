let config = 'dev'

const DEV_CONFIG = {
  RPC_URL: 'https://blockchain-dev.arcana.network',
  CHAIN_ID: '0x9dd4',
  NET_VERSION: '40404',
  GATEWAY_URL: 'https://gateway-dev.arcana.network',
  WALLET_URL: 'https://wallet.dev.arcana.network',
  SENTRY_DSN:
    'https://68615fda056a4337bcc9b7e3062562c3@o1011868.ingest.sentry.io/6449849',
}

const TESTNET_CONFIG = {
  RPC_URL: 'https://blockchain001-testnet.arcana.network/',
  CHAIN_ID: '0x9dd5',
  NET_VERSION: '40405',
  GATEWAY_URL: 'https://gateway001-testnet.arcana.network/',
  WALLET_URL: 'https://wallet.beta.arcana.network',
  SENTRY_DSN:
    'https://4e27545e4faf43318301625d79a6dc34@o1011868.ingest.sentry.io/6451353',
}

const getConfig = () => {
  if (config === 'dev') {
    return DEV_CONFIG
  }
  return TESTNET_CONFIG
}

const setIframeDevUrl = (url: string) => {
  DEV_CONFIG.WALLET_URL = url
}
const setNetwork = (network: 'testnet' | 'dev') => {
  config = network
}
export { getConfig, setNetwork, setIframeDevUrl }
