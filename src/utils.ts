import { LoginType } from './types';
import {
  OauthHandler,
  GoogleHandler,
  TwitchHandler,
  DiscordHandler,
  RedditHandler,
  GithubHandler,
  TwitterHandler,
  PasswordlessHandler,
} from './oauth';
import * as Sentry from '@sentry/browser';
import { getLogger } from './logger';

export class ArcanaException extends Error {}

export function getLoginHandler(
  loginType: LoginType,
  appID: string
): OauthHandler {
  switch (loginType) {
    case LoginType.google: {
      return new GoogleHandler(appID);
    }
    case LoginType.twitch: {
      return new TwitchHandler(appID);
    }
    case LoginType.discord: {
      return new DiscordHandler(appID);
    }
    case LoginType.reddit: {
      return new RedditHandler(appID);
    }
    case LoginType.github: {
      return new GithubHandler(appID);
    }
    case LoginType.twitter: {
      return new TwitterHandler(appID);
    }
    case LoginType.passwordless: {
      return new PasswordlessHandler(appID);
    }
  }
}

export const parseHash = (url: URL): RedirectParams => {
  let params: RedirectParams = {};
  const queryParams = url.searchParams;
  const hashParams = new URLSearchParams(url.hash.substring(1));
  for (const key in RedirectParamsList) {
    let val = hashParams.get(key);
    if (!val) {
      val = queryParams.get(key);
    }
    if (val) {
      params = { ...params, [key]: val };
    }
  }
  return params;
};

enum RedirectParamsList {
  state = 'state',
  access_token = 'access_token',
  error = 'error',
  error_uri = 'error_uri',
  error_description = 'error_description',
  id_token = 'id_token',
  token_type = 'token_type',
  scope = 'scope',
  expires_in = 'expires_in',
  code = 'code',
  oauth_token = 'oauth_token',
  oauth_token_secret = 'oauth_token_secret',
  oauth_verifier = 'oauth_verifier',
}

export type RedirectParams = { [key in RedirectParamsList]?: string };

export interface RedirectResponse {
  status: 'success' | 'error';
  error?: string;
  params: RedirectParams;
}
export const handleRedirectPage = (origin = '*'): void => {
  try {
    parseAndSendRedirectParams(window.location, origin);
  } catch (error) {
    const logger = getLogger('handleRedirectPage');
    logger.error('could not parse and send redirect params', { error });
  }
};

export const parseAndSendRedirectParams = (
  location: Location,
  origin: string
): void => {
  const params = parseHash(new URL(location.href));
  const returnParams: RedirectResponse = { status: 'success', params };

  if (isParamsEmpty(returnParams.params)) {
    returnParams.status = 'error';
    returnParams.error = 'paramater list is empty';
  } else if (params.error) {
    returnParams.status = 'error';
    returnParams.error = params.error;
  }
  window.opener?.postMessage(returnParams, origin);
  return;
};

export const isParamsEmpty = (params: RedirectParams): boolean => {
  return Object.keys(params).length === 0;
};

export const validateParams = (
  params: RedirectParams,
  state: string | null
): Error | null => {
  if (params.error) {
    const e = new Error(params.error_description);
    e.name = params.error;
    return e;
  }
  if (params.state && params.state !== state) {
    const e = new Error('State did not match');
    e.name = 'StateMismatch';
    return e;
  }
  return null;
};

export const generateID = (): string => {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};

export const getSentryErrorReporter = (): ((m: string) => void) => {
  Sentry.init({
    dsn:
      'https://d36bd0cc31cb46feb91a0c39e9b5178a@o1011868.ingest.sentry.io/6005958',
    maxBreadcrumbs: 5,
    debug: true,
  });
  return (msg: string) => {
    Sentry.captureMessage(msg);
  };
};
