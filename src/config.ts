let config = 'dev'

const DEV_CONFIG = {
  RPC_URL: 'https://blockchain-dev.arcana.network',
  GATEWAY_URL: 'https://gateway02.arcana.network',
  WALLET_URL: 'https://wallet.dev.arcana.network',
}

const TESTNET_CONFIG = {
  RPC_URL: 'https://blockchain-testnet.arcana.network',
  GATEWAY_URL: 'https://gateway-testnet.arcana.network',
  WALLET_URL: 'https://wallet.arcana.network',
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
