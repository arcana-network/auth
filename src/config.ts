import { InternalConfig } from './types'

const getConfig = (env: "dev" | "testnet"): InternalConfig => {
  if(env === "testnet") {
    return TESTNET_CONFIG;
  }
  return DEV_CONFIG
}

export { getConfig };

const DEV_CONFIG: InternalConfig = {
  signatureUrl: 'https://oauth.arcana.network/oauth',
  gatewayUrl: 'https://gateway02.arcana.network',
  passwordlessUrl: 'https://passwordless.dev.arcana.network',
};


const TESTNET_CONFIG: InternalConfig = {
  signatureUrl: 'https://oauth01-pro-testnet.arcana.network/oauth',
  gatewayUrl: 'https://gateway-testnet.arcana.network',
  passwordlessUrl: 'https://passwordless.dev.arcana.network',
};