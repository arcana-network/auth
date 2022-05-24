export enum LoginType {
  google = 'google',
  reddit = 'reddit',
  discord = 'discord',
  twitch = 'twitch',
  github = 'github',
  twitter = 'twitter',
  passwordless = 'passwordless',
}

export enum PublicKeyOutput {
  point = 'point',
  compressed = 'compressed',
  uncompressed = 'uncompressed',
}

export interface OtpOptions {
  withUI?: boolean;
}

export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface GetInfoOutput {
  loginType: LoginType;
  userInfo: UserInfo;
  privateKey: string;
}

export interface InitParams {
  appId: string;
  appAddress?: string;
  redirectUri?: string;
  network?: 'dev' | 'testnet';
  rpcUrl?: string;
  flow?: 'popup' | 'redirect';
  debug?: boolean;
  autoRedirect: boolean;
}

export interface StateParams {
  autoRedirect: boolean;
  appId: string;
  redirectUri: string;
  network: 'dev' | 'testnet';
  rpcUrl?: string;
  flow: 'popup' | 'redirect';
}

export enum StoreIndex {
  LOGGED_IN = 'arc.user',
  LOGIN_TYPE = 'login_type',
  STATE = 'state',
}

export interface Store {
  set(key: string, value: string, expiresAt?: Date | number): void;
  get(key: string): string | null;
  delete(key: string): void;
  clear(): void;
  unload(): void;
}

export interface OAuthFetcher {
  getClientID(loginType: LoginType): Promise<string>;
  getLogins(): Promise<string[]>;
}

export interface InternalConfig {
  signatureUrl: string;
  gatewayUrl: string;
  passwordlessUrl: string;
  sentryDsn: string;
}

export interface KeystoreInput {
  id: string;
  verifier: LoginType;
}
