import { RpcConfig } from './typings'

export enum Chain {
  ETHEREUM_MAINNET = '0x1',
  ETHEREUM_ROPSTEN = '0x3',
  ETHEREUM_RINKEBY = '0x4',
  ETHEREUM_GOERLI = '0x5',
  POLYGON_MAINNET = '0x89',
  POLYGON_MUMBAI_TESTNET = '0x13881',
}

const ChainList: Record<Chain, RpcConfig> = {
  [Chain.ETHEREUM_MAINNET]: {
    chainId: 1,
    rpcUrls: ['https://cloudflare-eth.com/'],
    chainName: 'Ethereum Mainnet',
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  [Chain.ETHEREUM_ROPSTEN]: {
    chainId: 3,
    rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Ropsten (Testnet)',
    blockExplorerUrls: ['https://ropsten.etherscan.io/'],
  },
  [Chain.ETHEREUM_RINKEBY]: {
    chainId: 4,
    rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Rinkeby (Testnet)',
    blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
  },
  [Chain.ETHEREUM_GOERLI]: {
    chainId: 5,
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    chainName: 'Ethereum Goerli (Testnet)',
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
  },
  [Chain.POLYGON_MAINNET]: {
    chainId: 137,
    rpcUrls: ['https://polygon-rpc.com'],
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  [Chain.POLYGON_MUMBAI_TESTNET]: {
    chainId: 80001,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    chainName: 'Polygon Mumbai (Testnet)',
    blockExplorerUrls: ['https://mumbai-explorer.matic.today'],
  },
}

export const getConfigFromChain = (c: Chain): RpcConfig => {
  if (ChainList[c]) {
    return ChainList[c]
  } else {
    throw new Error('Unsupported chainId!')
  }
}
