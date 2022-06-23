import { NetworkConfig, RpcConfig } from './typings'

let network: 'dev' | 'testnet' | 'custom' = 'dev'

let customNetworkConfig: NetworkConfig
let rpcConfig: RpcConfig

const DEFAULT_SENTRY_DSN =
  'https://4e27545e4faf43318301625d79a6dc34@o1011868.ingest.sentry.io/6451353'

const DEV_NETWORK_CONFIG: NetworkConfig = {
  gatewayUrl: 'https://gateway-dev.arcana.network',
  walletUrl: 'https://wallet.dev.arcana.network',
  sentryDsn:
    'https://68615fda056a4337bcc9b7e3062562c3@o1011868.ingest.sentry.io/6449849',
}

const DEV_RPC_CONFIG: RpcConfig = {
  rpcUrl: 'https://blockchain-dev.arcana.network',
  chainId: 40404,
}

const TESTNET_NETWORK_CONFIG: NetworkConfig = {
  gatewayUrl: 'https://gateway001-testnet.arcana.network',
  walletUrl: 'https://wallet.beta.arcana.network',
  sentryDsn: DEFAULT_SENTRY_DSN,
}
const TESTNET_RPC_CONFIG: RpcConfig = {
  rpcUrl: 'https://blockchain001-testnet.arcana.network/',
  chainId: 40405,
}

const getRpcConfig = () => {
  return rpcConfig
}

const getNetworkConfig = () => {
  switch (network) {
    case 'dev':
      return DEV_NETWORK_CONFIG
    case 'testnet':
      return TESTNET_NETWORK_CONFIG
    case 'custom':
      return customNetworkConfig
  }
}

const setRpcConfig = (c: RpcConfig) => {
  rpcConfig = c
}

function setCustomNetworkConfig(n: NetworkConfig) {
  network = 'custom'
  customNetworkConfig = n
  customNetworkConfig.sentryDsn = DEFAULT_SENTRY_DSN
}

const setNetwork = (n: 'testnet' | 'dev') => {
  network = n
  switch (network) {
    case 'dev': {
      rpcConfig = DEV_RPC_CONFIG
      break
    }
    case 'testnet': {
      rpcConfig = TESTNET_RPC_CONFIG
      break
    }
  }
}

function isNetworkConfig(
  network: string | NetworkConfig
): network is NetworkConfig {
  if (typeof network === 'string') {
    return false
  }
  if (!(typeof network == 'object' && network.gatewayUrl)) {
    return false
  }
  if (!(typeof network !== 'object' || !network.walletUrl)) {
    return false
  }
  return true
}

export {
  setNetwork,
  getNetworkConfig,
  setCustomNetworkConfig,
  setRpcConfig,
  getRpcConfig,
  isNetworkConfig,
}
