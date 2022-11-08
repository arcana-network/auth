import { NetworkConfig, RpcConfig, ChainConfigInput } from './typings'
import { Chain, getConfigFromChain } from './chainList'
type Network = 'dev' | 'testnet'

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

const getNetworkConfig = (n: Network | NetworkConfig) => {
  if (typeof n === 'string' && n == 'testnet') {
    return TESTNET_NETWORK_CONFIG
  }

  if (typeof n === 'string' && n == 'dev') {
    return DEV_NETWORK_CONFIG
  }

  if (isNetworkConfig(n)) {
    return n
  } else {
    throw new Error('Invalid network config passed')
  }
}

const getRpcConfig = (
  c: ChainConfigInput | undefined,
  n: Network | NetworkConfig
): RpcConfig => {
  if (isRpcConfigInput(c)) {
    const config = getConfigFromChain(c.chainId)
    if (c.rpcUrl) {
      config.rpcUrls = [c.rpcUrl]
    }
    return config
  }

  if (typeof n === 'string' && isNetworkEnum(n)) {
    switch (n) {
      case 'testnet':
        return getConfigFromChain(Chain.ARCANA_TESTNET)
      case 'dev':
        return getConfigFromChain(Chain.ARCANA_DEV)
    }
  }

  return getConfigFromChain(Chain.ARCANA_TESTNET)
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

function isNetworkEnum(n: string): n is Network {
  return typeof n === 'string' && (n == 'testnet' || n == 'dev')
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
