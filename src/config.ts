import { InternalConfig } from './types';

let env = 'dev';

const getConfig = (): InternalConfig => {
  if (env === 'testnet') {
    return TESTNET_CONFIG;
  }
  return DEV_CONFIG;
};

const setConfigEnv = (e: 'dev' | 'testnet'): void => {
  env = e;
};

export { getConfig, setConfigEnv };

const sentryDsn =
  'https://d36bd0cc31cb46feb91a0c39e9b5178a@o1011868.ingest.sentry.io/6005958';

const DEV_CONFIG: InternalConfig = {
  signatureUrl: 'https://oauth.arcana.network/oauth',
  gatewayUrl: 'https://gateway02.arcana.network',
  passwordlessUrl: 'https://passwordless.dev.arcana.network',
  sentryDsn,
};

const TESTNET_CONFIG: InternalConfig = {
  signatureUrl: 'https://oauth01-pro-testnet.arcana.network/oauth',
  gatewayUrl: 'https://gateway-testnet.arcana.network',
  passwordlessUrl: 'https://passwordless.dev.arcana.network',
  sentryDsn,
};
