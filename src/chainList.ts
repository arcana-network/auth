import { RpcConfig } from './typings'

export enum Chain {
  ETHEREUM_MAINNET = '0x1',
  ETHEREUM_SEPOLIA = '0xAA36A7',
  ETHEREUM_GOERLI = '0x5',
  POLYGON_MAINNET = '0x89',
  POLYGON_MUMBAI_TESTNET = '0x13881',
  ARCANA_TESTNET = '0x9DD5',
  ARCANA_DEV = '0x9DD4',
}

const ChainList: Record<Chain, RpcConfig> = {
  [Chain.ETHEREUM_MAINNET]: {
    chainId: Chain.ETHEREUM_MAINNET,
    rpcUrls: ['https://cloudflare-eth.com/'],
    chainName: 'Ethereum Mainnet',
    blockExplorerUrls: ['https://etherscan.io/'],
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [Chain.ETHEREUM_SEPOLIA]: {
    chainId: Chain.ETHEREUM_SEPOLIA,
    rpcUrls: ['https://rpc.sepolia.org'],
    chainName: 'Ethereum Sepolia (Testnet)',
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [Chain.ETHEREUM_GOERLI]: {
    chainId: Chain.ETHEREUM_GOERLI,
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Goerli (Testnet)',
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [Chain.POLYGON_MAINNET]: {
    chainId: Chain.POLYGON_MAINNET,
    rpcUrls: ['https://polygon-rpc.com'],
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com'],
    nativeCurrency: {
      symbol: 'matic',
      decimals: 18,
    },
  },
  [Chain.POLYGON_MUMBAI_TESTNET]: {
    chainId: Chain.POLYGON_MUMBAI_TESTNET,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    chainName: 'Polygon Mumbai (Testnet)',
    blockExplorerUrls: ['https://mumbai-explorer.matic.today'],
    nativeCurrency: {
      symbol: 'matic',
      decimals: 18,
    },
  },
  [Chain.ARCANA_TESTNET]: {
    chainId: Chain.ARCANA_TESTNET,
    rpcUrls: ['https://blockchain001-testnet.arcana.network/'],
    chainName: 'Arcana (Testnet)',
    blockExplorerUrls: ['https://explorer.beta.arcana.network/'],
  },
  [Chain.ARCANA_DEV]: {
    chainId: Chain.ARCANA_DEV,
    rpcUrls: ['https://blockchain-dev.arcana.network'],
    chainName: 'Arcana Dev',
    blockExplorerUrls: ['https://explorer.dev.arcana.network/'],
  },
}

export const getConfigFromChain = (c: Chain): RpcConfig => {
  if (ChainList[c]) {
    return ChainList[c]
  } else {
    throw new Error('Unsupported chainId!')
  }
}
