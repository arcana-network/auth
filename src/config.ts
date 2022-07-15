import { NetworkConfig, RpcConfig } from './typings'

type Network = 'dev' | 'testnet'

const DEV_NETWORK_CONFIG: NetworkConfig = {
  gatewayUrl: 'https://gateway-dev.arcana.network',
  walletUrl: 'https://wallet.dev.arcana.network',
  sentryDsn:
    'https://68615fda056a4337bcc9b7e3062562c3@o1011868.ingest.sentry.io/6449849',
}

const TESTNET_NETWORK_CONFIG: NetworkConfig = {
  gatewayUrl: 'https://gateway001-testnet.arcana.network',
  walletUrl: 'https://wallet.beta.arcana.network',
  sentryDsn:
    'https://4e27545e4faf43318301625d79a6dc34@o1011868.ingest.sentry.io/6451353',
}

const DEV_RPC_CONFIG: RpcConfig = {
  rpcUrls: ['https://blockchain-dev.arcana.network'],
  chainId: 40404,
  chainName: 'Arcana Dev',
}

const TESTNET_RPC_CONFIG: RpcConfig = {
  rpcUrls: ['https://blockchain001-testnet.arcana.network/'],
  chainId: 40405,
  chainName: 'Arcana testnet',
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

const getRpcConfig = (c: RpcConfig | undefined, n: Network | NetworkConfig) => {
  if (isRpcConfig(c)) {
    return c
  }

  if (typeof n === 'string' && isNetworkEnum(n)) {
    switch (n) {
      case 'testnet':
        return TESTNET_RPC_CONFIG
      case 'dev':
        return DEV_RPC_CONFIG
    }
  }

  return TESTNET_RPC_CONFIG
}

function isRpcConfig(c: RpcConfig | undefined): c is RpcConfig {
  if (typeof c === 'undefined') {
    return false
  }
  if (
    !(
      typeof c == 'object' &&
      c.rpcUrls &&
      Array.isArray(c.rpcUrls) &&
      c.rpcUrls.length > 0
    )
  ) {
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
  return true
}

export { getNetworkConfig, getRpcConfig }
