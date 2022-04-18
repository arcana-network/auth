import {
  LoginType,
  OAuthFetcher,
  Store,
  StoredUserInfo,
  InitParams,
  StateParams,
  StoreIndex,
  InternalConfig,
  OtpOptions,
} from './types';
import {
  handleRedirectPage,
  getLoginHandler,
  RedirectParams,
  generateID,
  getSentryErrorReporter,
  parseHash,
  validateParams,
  isParamsEmpty,
  ArcanaException,
} from './utils';
import {
  OauthHandler,
  passwordlessAuthorizeWrapper,
  OtpLoginResponse,
} from './oauthHandlers';
import SessionStore from './sessionStore';
import Popup from './popup';
import { KeyReconstructor } from '@arcana/keystore';
import {
  getLogger,
  Logger,
  LOG_LEVEL,
  setExceptionReporter,
  setLogLevel,
} from './logger';
import { getConfig, setConfigEnv } from './config';
import { OAuthContractMeta } from './oauthMeta';
import { LocalStore } from './localStore';
import { ArcanaAuthException } from './errors';

type PublicKeyOutput = 'point' | 'compressed' | 'uncompressed';

class AuthProvider {
  public static async init(params: InitParams): Promise<AuthProvider> {
    const provider = new AuthProvider(params);
    if (provider.params.flow == 'redirect') {
      await provider.checkRedirectMode();
    }
    return provider;
  }
  public static handleRedirectPage = handleRedirectPage;
  private params: StateParams;
  private oauthStore: OAuthFetcher;
  private store: Store;
  private localstore: LocalStore;
  private keyReconstructor: KeyReconstructor;
  private logger: Logger;
  private config: InternalConfig;
  private appAddress = '';
  constructor(params: InitParams) {
    this.params = this.getParams(params);
    setConfigEnv(this.params.network);
    this.config = getConfig();
    this.logger = getLogger('AuthProvider');
    this.store = new SessionStore(this.params.appId);
    this.localstore = new LocalStore(this.params.appId);
    if (params.appAddress) {
      this.appAddress = params.appAddress;
    }
    if (params.debug) {
      setLogLevel(LOG_LEVEL.DEBUG);
      setExceptionReporter(getSentryErrorReporter(this.config.sentryDsn));
    } else {
      setLogLevel(LOG_LEVEL.NOLOGS);
    }
  }

  public async loginWithSocial(loginType: LoginType): Promise<void> {
    if (this.checkAlreadyLoggedIn(loginType)) {
      return;
    }

    await this.init();

    const clientId = await this.fetchClientID(loginType);

    this.logger.info('clientID', clientId);

    const loginHandler = getLoginHandler(loginType, this.appAddress, clientId);

    const state = generateID();

    const url = await loginHandler.getAuthUrl({
      redirectUri: this.params.redirectUri,
      state,
    });

    if (this.params.flow == 'redirect') {
      this.localstore.set<LoginType>(StoreIndex.LOGIN_TYPE, loginType);
      this.localstore.set<string>(StoreIndex.STATE, state);
      this.redirectTo(url);
      return;
    }

    const popup = new Popup(url, state);
    popup.open();

    const params = await popup.getWindowResponse(
      loginHandler.handleRedirectParams
    );

    await this.fetchInfoAndKey(loginHandler, params);
  }

  public async loginWithOtp(
    email: string,
    options: OtpOptions = { withUI: true }
  ): Promise<void | OtpLoginResponse> {
    if (this.checkAlreadyLoggedIn(LoginType.passwordless)) {
      return;
    }

    await this.init();

    const loginHandler = getLoginHandler(
      LoginType.passwordless,
      this.appAddress,
      ''
    );

    const state = generateID();

    const json = !options.withUI;
    const url = await loginHandler.getAuthUrl({
      redirectUri: this.params.redirectUri,
      state,
      extraParams: { email, json: json.toString() },
    });

    this.localstore.set<LoginType>(
      StoreIndex.LOGIN_TYPE,
      LoginType.passwordless
    );
    this.localstore.set<string>(StoreIndex.STATE, state);
    if (json) {
      const response = await passwordlessAuthorizeWrapper(url);
      return response;
    } else {
      this.redirectTo(url);
      return;
    }
  }

  public async getAvailableLogins(): Promise<string[]> {
    await this.init();
    return this.oauthStore.getLogins();
  }

  public getUserInfo(): StoredUserInfo {
    const userInfo = this.store.get(StoreIndex.LOGGED_IN);
    if (userInfo) {
      const info: StoredUserInfo = JSON.parse(userInfo);
      return info;
    } else {
      this.logger.error('Error: getUserInfo');
      throw new ArcanaAuthException(
        'Please initialize the sdk before fetching user info.'
      );
    }
  }

  public isLoggedIn(): boolean {
    const userExists = this.store.get(StoreIndex.LOGGED_IN);
    return userExists ? true : false;
  }

  public logout(): void {
    this.store.clear();
  }

  public unload(): void {
    this.store.unload();
  }

  public async getPublicKey(
    {
      id,
      verifier,
    }: {
      id: string;
      verifier: LoginType;
    },
    output: PublicKeyOutput = 'uncompressed'
  ): Promise<{ x: string; y: string } | string> {
    await this.initKeyReconstructor();
    const { X, Y } = await this.keyReconstructor.getPublicKey({ id, verifier });
    if (output == 'point') {
      return { x: X.padStart(64, '0'), y: Y.padStart(64, '0') };
    } else if (output == 'compressed') {
      return '03' + X.padStart(64, '0');
    } else {
      return '04' + X.padStart(64, '0') + Y.padStart(64, '0');
    }
  }

  public async checkRedirectMode(): Promise<void> {
    await this.init();
    const loginType = this.localstore.get<LoginType>(StoreIndex.LOGIN_TYPE);
    if (!loginType) {
      return;
    }

    const clientId = await this.fetchClientID(loginType);
    const loginHandler = getLoginHandler(loginType, this.appAddress, clientId);
    let params = parseHash(new URL(window.location.href));

    if (isParamsEmpty(params)) {
      return;
    }

    const state = this.localstore.get<string>(StoreIndex.STATE);
    const err = validateParams(params, state);
    if (err) {
      throw err;
    }

    params = await loginHandler.handleRedirectParams(params);

    await this.fetchInfoAndKey(loginHandler, params);
    this.cleanupUrlParams();
  }

  private getParams(p: InitParams): StateParams {
    const params = {
      ...p,
      redirectUri: p.redirectUri
        ? p.redirectUri
        : window.location.origin + window.location.pathname,
      flow: p.flow ? p.flow : 'popup',
      network: p.network ? p.network : 'testnet',
    };
    return params;
  }

  private cleanupUrlParams() {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);
    this.localstore.delete(StoreIndex.LOGIN_TYPE);
  }

  private async fetchInfoAndKey(
    handler: OauthHandler,
    params: RedirectParams
  ): Promise<void> {
    try {
      const userInfo = await this.getInfoFromHandler(handler, params);
      this.logger.info('fetchInfoAndKey', {
        id: userInfo.id,
        token: params.id_token,
      });
      const privateKey = await this.getUserPrivateKey(
        userInfo.id,
        params.id_token,
        handler.loginType
      );
      this.setKeyAndUserInfo({
        privateKey,
        userInfo,
        loginType: handler.loginType,
      });
    } catch (err) {
      return Promise.reject(err);
    } finally {
      await handler.cleanup();
    }
  }

  private async initConfig(): Promise<string> {
    try {
      const rpcUrl = await getCurrentConfig(this.config.gatewayUrl);
      return rpcUrl;
    } catch (e) {
      this.logger.error('Error during config init', e);
      throw e;
    }
  }

  private redirectTo(url: string) {
    const w = window.parent ? window.parent : window;
    setTimeout(() => (w.location.href = url), 50);
  }

  private async initKeyReconstructor(): Promise<void> {
    await this.setAppAddress();
    let fetcher;
    if (this.params.network === 'dev') {
      fetcher = {
        getNodes: async () => {
          return {
            nodes: [1, 2, 3, 4, 5, 6].map(
              (p) => `https://dkgnode${p}.arcana.network/rpc`
            ),
            indexes: [1, 2, 3, 4, 5, 6],
          };
        },
      };
    }
    if (!this.keyReconstructor) {
      this.keyReconstructor = new KeyReconstructor(
        {
          appID: this.appAddress,
          network: 'testnet',
        },
        fetcher
      );
    }
  }

  private async init(): Promise<void> {
    if (!this.params.rpcUrl) {
      const rpcUrl = await this.initConfig();
      this.params.rpcUrl = rpcUrl;
    }
    await this.initKeyReconstructor();
    this.oauthStore = new OAuthContractMeta(
      this.appAddress,
      this.params.rpcUrl
    );
  }

  private async fetchClientID(loginType: LoginType): Promise<string> {
    const clientID = await this.oauthStore.getClientID(loginType);
    if (!clientID) {
      throw new ArcanaAuthException(`Client ID not found for ${loginType}`);
    }
    return clientID;
  }

  private async setAppAddress(): Promise<void> {
    if (!this.appAddress) {
      const appAddress = await getAppAddress(
        this.params.appId,
        this.config.gatewayUrl
      );
      if (appAddress.length === 0) {
        throw new ArcanaAuthException(
          'Address non-existent or invalid, are you sure the App ID referenced exists?'
        );
      }
      this.appAddress = appAddress;
    }
  }

  private checkAlreadyLoggedIn(loginType: LoginType): boolean {
    if (this.isLoggedIn()) {
      const storedUserInfo = this.getUserInfo();
      if (storedUserInfo.loginType === loginType) {
        return true;
      }
    }
    return false;
  }

  private setKeyAndUserInfo(userInfo: StoredUserInfo) {
    this.store.set(StoreIndex.LOGGED_IN, JSON.stringify(userInfo));
  }

  private async getInfoFromHandler(
    handler: OauthHandler,
    params: RedirectParams
  ) {
    if (params.access_token) {
      const userInfo = await handler.getUserInfo(params.access_token);
      return userInfo;
    } else {
      throw new ArcanaAuthException('access token missing');
    }
  }

  private async getUserPrivateKey(
    id: string,
    token: string | undefined,
    loginType: LoginType
  ): Promise<string> {
    if (!id || !token || !loginType) {
      return Promise.reject('Invalid params');
    }
    try {
      const data = await this.keyReconstructor.getPrivateKey({
        id,
        idToken: token,
        verifier: loginType,
      });
      const logger = getLogger('getUserPrivateKey');
      logger.info('return_data', data);
      return data.privateKey;
    } catch (e) {
      this.logger.error(`Error during getting pvt key`, e);
      return Promise.reject(
        new ArcanaException('Error during getting user key')
      );
    }
  }
}

const getAppAddress = async (
  appId: string,
  gatewayUrl: string
): Promise<string> => {
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/get-address/?id=${appId}`);
    const json: { address: string } = await res.json();
    let address = json?.address;
    if (!address) {
      throw new ArcanaException(`Invalid appId: ${appId}`);
    }
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    return address;
  } catch (e) {
    getLogger('getAppAddress').error('error during fetching', e);
    throw new ArcanaException(`Invalid appId: ${appId}`);
  }
};

const getCurrentConfig = async (gatewayUrl: string): Promise<string> => {
  try {
    const res = await fetch(`${gatewayUrl}/api/v1/get-config/`);
    const json: { RPC_URL: string } = await res.json();
    if (!json.RPC_URL) {
      throw new ArcanaException('Error during fetching config');
    }
    return json.RPC_URL;
  } catch (e) {
    getLogger('getCurrentConfig').error('error during fetching', e);
    throw new ArcanaException(`Error during fetching config`);
  }
};

export { AuthProvider, LoginType as SocialLoginType };
