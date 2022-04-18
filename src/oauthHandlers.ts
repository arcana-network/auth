import { getLogger } from './logger';
import { LoginType, UserInfo } from './types';
import { generateID, RedirectParams } from './utils';
import { getConfig } from './config';
import { ArcanaAuthException } from './errors';

const config = getConfig();

interface OauthParams {
  redirectUri: string;
  state: string;
  nonce?: string;
  extraParams?: { [k: string]: string };
}

export interface OauthHandler {
  getAuthUrl(params: OauthParams): Promise<string>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
  handleRedirectParams(params: RedirectParams): Promise<RedirectParams>;
  cleanup(): Promise<void>;
  loginType: LoginType;
}

export const request = async <T>(
  url: string,
  headers: { [key: string]: string } = {}
): Promise<T> => {
  const response = await fetch(url, { headers });
  const data = await response.json();

  const logger = getLogger('request');
  if (response.status < 400) {
    return data as T;
  } else {
    logger.error('error_during_request', { err: data });
    throw new ArcanaAuthException(
      `Error during API call: ${JSON.stringify(data)}`
    );
  }
};

interface GoogleUserInfoResponse {
  email: string;
  name: string;
  id: string;
  picture: string;
}

export class GoogleHandler implements OauthHandler {
  public readonly loginType = LoginType.google;
  private oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private responseType = 'token id_token';
  private scope = 'profile email openid';
  private prompt = 'consent select_account';
  private userInfoUrl = 'https://www.googleapis.com/userinfo/v2/me';

  constructor(private appID: string, private clientId: string) {
    return;
  }

  public async getAuthUrl({
    redirectUri,
    state,
    nonce,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    url.searchParams.append('prompt', this.prompt);
    url.searchParams.append('nonce', nonce ? nonce : generateID());
    return url.toString();
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  };

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<GoogleUserInfoResponse>(this.userInfoUrl, {
        Authorization: `Bearer ${accessToken}`,
      });
      return {
        id: data.email,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async cleanup(): Promise<void> {
    return;
  }
}

interface RedditUserInfoResponse {
  name: string;
  id: string;
  icon_img: string;
}

export class RedditHandler implements OauthHandler {
  public readonly loginType = LoginType.reddit;
  private userInfoUrl = 'https://oauth.reddit.com/api/v1/me';
  private scope = 'identity';
  private responseType = 'token';
  private oauthUrl = 'https://www.reddit.com/api/v1/authorize';
  constructor(private appID: string, private clientId: string) {
    return;
  }

  public async getAuthUrl({
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    return url.toString();
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  };

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<RedditUserInfoResponse>(this.userInfoUrl, {
        Authorization: `Bearer ${accessToken}`,
      });
      return { id: data.name, name: data.name, picture: data.icon_img };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async cleanup(): Promise<void> {
    return;
  }
}

interface DiscordUserInfoResponse {
  id: string;
  avatar: string;
  username: string;
  email?: string;
  verified: boolean;
}

export class DiscordHandler implements OauthHandler {
  public readonly loginType = LoginType.discord;
  private oauthUrl = 'https://discord.com/api/oauth2/authorize';
  private responseType = 'token';
  private scope = 'identify email';
  private userInfoUrl = 'https://discordapp.com/api/users/@me';

  constructor(private appID: string, private clientId: string) {
    return;
  }

  public async getAuthUrl({
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    return url.toString();
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  };

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<DiscordUserInfoResponse>(this.userInfoUrl, {
        Authorization: `Bearer ${accessToken}`,
      });
      if (data.verified && data.email) {
        return {
          id: data.email,
          name: data.username,
          picture: data.avatar,
        };
      }
      return {
        id: data.id,
        name: data.username,
        picture: data.avatar,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async cleanup(): Promise<void> {
    return;
  }
}

interface TwitchUserInfoResponse {
  id: string;
  email: string;
  display_name: string;
  profile_image_url: string;
}

export class TwitchHandler implements OauthHandler {
  public readonly loginType = LoginType.twitch;
  private userInfoUrl = 'https://api.twitch.tv/helix/users';
  private oauthUrl = 'https://id.twitch.tv/oauth2/authorize';
  private scope = 'openid user:read:email';
  private responseType = 'token';
  private claims = JSON.stringify({
    id_token: { email: null, email_verified: null },
    userinfo: { email: null, email_verified: null },
  });

  constructor(private appID: string, private clientId: string) {
    return;
  }

  public async getAuthUrl({
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    url.searchParams.append('claims', this.claims);
    url.searchParams.append('force_verify', 'true');
    return url.toString();
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  };

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<{ data: TwitchUserInfoResponse[] }>(
        this.userInfoUrl,
        {
          Authorization: `Bearer ${accessToken}`,
          'Client-ID': this.clientId,
        }
      );
      return {
        id: data.data[0]?.email ? data.data[0]?.email : data.data[0]?.id,
        name: data.data[0]?.display_name,
        picture: data.data[0]?.profile_image_url,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async cleanup(): Promise<void> {
    return;
  }
}

interface GithubUserInfoResponse {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
}

export class GithubHandler implements OauthHandler {
  public readonly loginType = LoginType.github;
  private url = 'https://api.github.com/user';
  private oauthUrl = 'https://github.com/login/oauth/authorize';
  private sigUrl = `${config.signatureUrl}/github`;
  private responseType = 'token id_token';
  private scope = 'read:user user:email';
  constructor(private appID: string, private clientId: string) {
    return;
  }

  public async getAuthUrl({
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    return url.toString();
  }

  private async getTokenFromCode(appID: string, code: string): Promise<string> {
    const data = await request<{ accessToken: string }>(
      `${this.sigUrl}/${appID}/${code}`
    );
    return data.accessToken;
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (!params.code) {
      throw new ArcanaAuthException('Expected `code` from github hash params');
    }
    const accessToken = await this.getTokenFromCode(this.appID, params.code);

    return { ...params, access_token: accessToken, id_token: accessToken };
  };

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<GithubUserInfoResponse>(this.url, {
        Authorization: `token ${accessToken}`,
      });
      return {
        id: data.email ? data.email : String(data.id),
        email: data.email,
        name: data.name,
        picture: data.avatar_url,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async cleanup(): Promise<void> {
    return;
  }
}

interface TwitterUserInfoResponse {
  id_str: string;
  profile_image_url_https: string;
  name: string;
  email?: string;
}

interface TwitterInternalResponse {
  oauth_token: string;
  oauth_token_secret: string;
  user_id?: string;
  screen_name?: string;
}

export class TwitterHandler implements OauthHandler {
  public readonly loginType = LoginType.twitter;
  private oauthToken: string;
  private sigUrl = `${config.signatureUrl}/twitter`;
  private oauthTokenSecret: string;
  private oauthUrl = 'https://api.twitter.com/oauth/authorize?oauth_token=';

  constructor(private appID: string, private clientId: string) {}

  public async getRequestToken(): Promise<TwitterInternalResponse> {
    const url = new URL(`${this.sigUrl}/${this.appID}/requestToken`);
    const response = await request<TwitterInternalResponse>(url.toString());
    return response;
  }

  public async getAuthUrl(): Promise<string> {
    const params = await this.getRequestToken();
    this.oauthToken = params.oauth_token;
    this.oauthTokenSecret = params.oauth_token;
    if (!this.oauthToken) {
      throw new ArcanaAuthException('Error did not have token when expected!');
    }
    return this.oauthUrl + this.oauthToken;
  }
  public async getAccessToken({
    oauth_token,
    oauth_verifier,
  }: {
    oauth_token: string;
    oauth_verifier: string;
  }): Promise<TwitterInternalResponse> {
    if (!oauth_token || !oauth_verifier) {
      throw new ArcanaAuthException(`Missing token or verifier`);
    }
    const url = new URL(`${this.sigUrl}/accessToken`);
    url.searchParams.append('oauth_token', oauth_token);
    url.searchParams.append('oauth_verifier', oauth_verifier);
    const response = await request<TwitterInternalResponse>(url.toString());
    return response;
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const url = new URL(`${this.sigUrl}/${this.appID}/user`);
      url.searchParams.append('oauth_token', accessToken);
      url.searchParams.append('oauth_token_secret', this.oauthTokenSecret);
      const data = await request<TwitterUserInfoResponse>(url.toString());
      return {
        id: data.email ? data.email : data.id_str,
        email: data.email,
        name: data.name,
        picture: data.profile_image_url_https,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (params.oauth_token && params.oauth_verifier) {
      const oauthTokenVerified = await this.getAccessToken({
        oauth_token: params.oauth_token,
        oauth_verifier: params.oauth_verifier,
      });
      this.oauthToken = oauthTokenVerified.oauth_token;
      this.oauthTokenSecret = oauthTokenVerified.oauth_token_secret;
      params.id_token = [
        this.oauthToken,
        this.oauthTokenSecret,
        this.appID,
      ].join(':');
      return {
        ...params,
        access_token: this.oauthToken,
        ...oauthTokenVerified,
      };
    } else {
      return { ...params };
    }
  };

  public async cleanup(): Promise<void> {
    try {
      const url = new URL(`${this.sigUrl}/${this.appID}/invalidateToken`);
      url.searchParams.append('oauth_token', this.oauthToken);
      url.searchParams.append('oauth_token_secret', this.oauthTokenSecret);
      await request<{ success: boolean }>(url.toString());
    } catch (err) {
      const logger = getLogger('twitter');

      logger.error('error_cleanup_twitter', { err });
    }
  }
}

export interface OtpLoginResponse {
  success: boolean;
}

export async function passwordlessAuthorizeWrapper(
  url: string
): Promise<OtpLoginResponse> {
  try {
    const response = await request<OtpLoginResponse>(url);
    return response as OtpLoginResponse;
  } catch (e) {
    const error = new ArcanaAuthException(
      `Error during authorize: ${(e as Error).message}`
    );
    return Promise.reject(error);
  }
}

interface PasswordlessInfoResponse {
  name?: string;
  email: string;
}

export class PasswordlessHandler implements OauthHandler {
  public readonly loginType = LoginType.passwordless;
  private oauthUrl = `${config.passwordlessUrl}/oauth/authorize`;
  private userInfoUrl = `${config.passwordlessUrl}/api/token/verify`;

  constructor(private appID: string, private clientId: string) {
    return;
  }

  public async getAuthUrl({
    redirectUri,
    state,
    extraParams,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('json', extraParams?.json || 'false');
    if (extraParams?.email) {
      url.searchParams.append('email', extraParams.email);
    }
    return url.toString();
  }

  public handleRedirectParams = async (
    params: RedirectParams
  ): Promise<RedirectParams> => {
    if (!params.access_token && params.id_token) {
      return {
        ...params,
        access_token: params.id_token,
      };
    } else {
      return { ...params };
    }
  };

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<PasswordlessInfoResponse>(this.userInfoUrl, {
        Authorization: `Bearer ${accessToken}`,
      });
      return {
        id: data.email,
        email: data.email,
        name: data.name,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async cleanup(): Promise<void> {
    return;
  }
}
