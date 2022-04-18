import { FetchMock } from 'jest-fetch-mock';
import {
  GoogleHandler,
  RedditHandler,
  DiscordHandler,
  TwitchHandler,
  TwitterHandler,
  GithubHandler,
  PasswordlessHandler,
} from '../src/oauthHandlers';
import { freezeLogLevel, LOG_LEVEL, setLogLevel } from '../src/logger';
import { ArcanaAuthException } from '../src/errors';
import { OauthHandler } from '../src/oauthHandlers';

setLogLevel(LOG_LEVEL.NOLOGS);
freezeLogLevel();

const fetchMock = fetch as FetchMock;

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('GoogleHandler', () => {
  const h = new GoogleHandler('', 'clientID');

  test('returns expected user info', async () => {
    const email = 'foo@bar.com';
    fetchMock.mockResponse(JSON.stringify({ email }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(email);
  });

  test('returns expected auth url', async () => {
    const res = await h.getAuthUrl({
      state: 'a',
      redirectUri: 'redirectUri',
      nonce: 'n',
    });
    expect(res).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=clientID&redirect_uri=redirectUri&state=a&scope=profile+email+openid&response_type=token+id_token&prompt=consent+select_account&nonce=n'
    );
  });

  test('returns expected redirect params', async () => {
    const input = {
      access_token: 'access_token',
      id_token: 'id_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual(input);
  });

  test('returns expected redirect params on id token missing', async () => {
    const input = {
      access_token: 'access_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual({ ...input, id_token: input.access_token });
  });
});

describe('RedditHandler', () => {
  const h = new RedditHandler('', 'clientID');
  test('returns expected user info', async () => {
    const name = '/u/qwertyuiop';
    fetchMock.mockResponse(JSON.stringify({ name }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(name);
  });

  test('returns expected auth url', async () => {
    const res = await h.getAuthUrl({
      state: 'a',
      redirectUri: 'redirectUri',
    });
    expect(res).toBe(
      'https://www.reddit.com/api/v1/authorize?client_id=clientID&redirect_uri=redirectUri&state=a&scope=identity&response_type=token'
    );
  });

  test('returns expected redirect params', async () => {
    const input = {
      access_token: 'access_token',
      id_token: 'id_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual(input);
  });

  test('returns expected redirect params on id token missing', async () => {
    const input = {
      access_token: 'access_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual({ ...input, id_token: input.access_token });
  });
});

describe('TwitchHandler', () => {
  const h: OauthHandler = new TwitchHandler('appId', 'clientID');

  test('returns expected user info', async () => {
    const id = 'foo@bar.com';
    fetchMock.mockResponse(JSON.stringify({ data: [{ id }] }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(id);
  });

  test('send expected params in header on info', async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        data: [
          {
            display_name: 'ABC',
            email: 'abc@example.com',
            profile_image_url: 'picture',
          },
        ],
      })
    );
    const res = await h.getUserInfo('test_access_token');
    expect(res).toStrictEqual({
      id: 'abc@example.com',
      name: 'ABC',
      picture: 'picture',
    });
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.twitch.tv/helix/users',
      {
        headers: {
          Authorization: 'Bearer test_access_token',
          'Client-ID': 'clientID',
        },
      }
    );
  });
  test('returns expected auth url', async () => {
    const res = await h.getAuthUrl({
      state: 'a',
      redirectUri: 'redirectUri',
    });
    expect(res).toBe(
      'https://id.twitch.tv/oauth2/authorize?client_id=clientID&redirect_uri=redirectUri&state=a&scope=openid+user%3Aread%3Aemail&response_type=token&claims=%7B%22id_token%22%3A%7B%22email%22%3Anull%2C%22email_verified%22%3Anull%7D%2C%22userinfo%22%3A%7B%22email%22%3Anull%2C%22email_verified%22%3Anull%7D%7D&force_verify=true'
    );
  });

  test('returns expected redirect params', async () => {
    const input = {
      access_token: 'access_token',
      id_token: 'id_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual(input);
  });

  test('returns expected redirect params on id token missing', async () => {
    const input = {
      access_token: 'access_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual({ ...input, id_token: input.access_token });
  });
});

describe('DiscordHandler', () => {
  const h = new DiscordHandler('', 'clientID');

  test('returns expected email id if verified', async () => {
    const email = 'foo@bar.com';
    fetchMock.mockResponse(JSON.stringify({ verified: true, email, id: 1 }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(email);
  });
  test('returns expected user id if no email or not verified', async () => {
    const email = 'foo@bar.com';
    fetchMock.mockResponse(JSON.stringify({ verified: false, email, id: 1 }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(1);
  });

  test('returns expected auth url', async () => {
    const res = await h.getAuthUrl({
      state: 'a',
      redirectUri: 'redirectUri',
    });
    expect(res).toBe(
      'https://discord.com/api/oauth2/authorize?client_id=clientID&redirect_uri=redirectUri&state=a&scope=identify+email&response_type=token'
    );
  });

  test('returns expected redirect params', async () => {
    const input = {
      access_token: 'access_token',
      id_token: 'id_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual(input);
  });

  test('returns expected redirect params on id token missing', async () => {
    const input = {
      access_token: 'access_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual({ ...input, id_token: input.access_token });
  });
});
describe('TwitterHandler', () => {
  const h = new TwitterHandler('appID', 'clientID');
  test('returns expected user info', async () => {
    const id_str = 'foo@bar.com';
    fetchMock.mockResponse(JSON.stringify({ id_str }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(id_str);
  });

  test('returns expected redirect params', async () => {
    const input = {
      oauth_token: 'access_token',
      oauth_verifier: 'id_token',
    };
    const res = {
      oauth_token: 'oauth_token',
      oauth_token_secret: 'oauth_token_secret',
    };
    fetchMock.mockResponse(JSON.stringify(res));
    const r = await h.handleRedirectParams(input);
    expect(r).toStrictEqual({
      ...input,
      oauth_token: 'oauth_token',
      access_token: 'oauth_token',
      oauth_token_secret: 'oauth_token_secret',
      id_token: 'oauth_token:oauth_token_secret:appID',
    });
  });

  test('returns expected redirect params on id token missing', async () => {
    const input = {};
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual(input);
  });
});

describe('GithubHandler', () => {
  const h = new GithubHandler('app', 'clientID');

  test('returns expected auth url', async () => {
    const res = await h.getAuthUrl({
      state: 'a',
      redirectUri: 'redirectUri',
    });
    expect(res).toBe(
      'https://github.com/login/oauth/authorize?client_id=clientID&redirect_uri=redirectUri&state=a&scope=read%3Auser+user%3Aemail&response_type=token+id_token'
    );
  });

  test('returns expected user info', async () => {
    const id = 1;
    fetchMock.mockResponse(JSON.stringify({ id }));
    const res = await h.getUserInfo('test_access_token');
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(String(id));
  });

  test('returns expected redirect params', async () => {
    const input = {
      code: 'code',
    };
    fetchMock.mockResponse(JSON.stringify({ accessToken: 'access_token' }));
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual({
      ...input,
      access_token: 'access_token',
      id_token: 'access_token',
    });
  });

  test('throws error on `code` missing', async () => {
    const input = {
      access_token: 'access_token',
    };
    const res = h.handleRedirectParams(input);
    expect(res).rejects.toEqual(
      new ArcanaAuthException('Expected `code` from github hash params')
    );
  });
});

describe('PasswordlessHandler', () => {
  const h = new PasswordlessHandler('app', 'clientID');

  test('returns expected auth url', async () => {
    const res = await h.getAuthUrl({
      state: 'a',
      redirectUri: 'redirectUri',
    });
    expect(res).toBe(
      'https://passwordless.dev.arcana.network/oauth/authorize?client_id=clientID&redirect_uri=redirectUri&state=a&json=false'
    );
  });

  test('returns expected user info', async () => {
    const email = 'abc@example.com';
    fetchMock.mockResponse(JSON.stringify({ email }));
    const res = await h.getUserInfo('test_access_token');
    console.log({ res });
    expect(fetchMock).toHaveBeenCalled();
    expect(res.id).toBe(email);
  });

  test('returns expected redirect params', async () => {
    const input = {
      id_token: 'access_token',
    };
    const res = await h.handleRedirectParams(input);
    expect(res).toStrictEqual({
      ...input,
      access_token: 'access_token',
      id_token: 'access_token',
    });
  });
});
