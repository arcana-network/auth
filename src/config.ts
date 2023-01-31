import { NetworkConfig, RpcConfig, ChainConfigInput } from './typings'
import { Chain, getConfigFromChain } from './chainList'
type Network = 'dev' | 'testnet' | 'mainnet'

const DEV_NETWORK_CONFIG: NetworkConfig = {
  authUrl: 'https://verify.dev.arcana.network',
  gatewayUrl: 'https://gateway-dev.arcana.network',
  walletUrl: 'https://wallet.dev.arcana.network',
}

const TESTNET_NETWORK_CONFIG: NetworkConfig = {
  authUrl: 'https://verify.beta.arcana.network',
  gatewayUrl: 'https://gateway001-testnet.arcana.network',
  walletUrl: 'https://wallet.beta.arcana.network',
}

const MAINNET_NETWORK_CONFIG: NetworkConfig = {
  authUrl: 'https://auth.arcana.network',
  gatewayUrl: 'https://gateway.arcana.network',
  walletUrl: 'https://wallet.arcana.network',
}

const getNetworkConfig = (n: Network | NetworkConfig) => {
  if (typeof n === 'string' && n == 'testnet') {
    return TESTNET_NETWORK_CONFIG
  }

  if (typeof n === 'string' && n == 'dev') {
    return DEV_NETWORK_CONFIG
  }

  if (typeof n === 'string' && n == 'mainnet') {
    return MAINNET_NETWORK_CONFIG
  }

  if (isNetworkConfig(n)) {
    return n
  } else {
    throw new Error('Invalid network config passed')
  }
}

const getRpcConfig = (c: ChainConfigInput | undefined): RpcConfig => {
  if (isRpcConfigInput(c)) {
    const config = getConfigFromChain(c.chainId)
    if (c.rpcUrl) {
      config.rpcUrls = [c.rpcUrl]
    }
    return config
  }

  return getConfigFromChain(Chain.ETHEREUM_MAINNET)
}

function isRpcConfigInput(
  c: ChainConfigInput | undefined
): c is ChainConfigInput {
  if (typeof c === 'undefined') {
    return false
  }
  if (!(typeof c == 'object' && c.chainId)) {
    return false
  }
  return true
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
  if (!(typeof network == 'object' && network.walletUrl)) {
    return false
  }
  if (!(typeof network == 'object' && network.authUrl)) {
    return false
  }
  return true
}

export { getNetworkConfig, getRpcConfig }
