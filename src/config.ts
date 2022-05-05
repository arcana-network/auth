let config = 'dev'

const DEV_CONFIG = {
  RPC_URL: 'https://blockchain-dev.arcana.network',
  GATEWAY_URL: 'https://gateway02.arcana.network',
}

const TESTNET_CONFIG = {
  RPC_URL: 'https://blockchain-testnet.arcana.network',
  GATEWAY_URL: 'https://gateway-testnet.arcana.network',
}

const getConfig = () => {
  if (config === 'dev') {
    return DEV_CONFIG
  }
  return TESTNET_CONFIG
}

const setNetwork = (network: 'testnet' | 'dev') => {
  config = network
}
export { getConfig, setNetwork }
