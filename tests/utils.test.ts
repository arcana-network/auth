import { getLoginHandler, parseHash, handleRedirectPage } from '../src/utils';
import { LoginType } from '../src/types';
import {
  DiscordHandler,
  GithubHandler,
  GoogleHandler,
  RedditHandler,
  TwitchHandler,
  TwitterHandler,
} from '../src/oauthHandlers';
import { freezeLogLevel, LOG_LEVEL, setLogLevel } from '../src/logger';

setLogLevel(LOG_LEVEL.NOLOGS);
freezeLogLevel();

function createMockWindow(href: string) {
  const postMessage = jest.fn();
  const originalWindow = { ...window };
  const windowSpy = jest.spyOn(global, 'window', 'get');
  windowSpy.mockImplementation(() => ({
    ...originalWindow,
    opener: {
      postMessage,
    },
    location: { href },
  }));
  return {
    spy: windowSpy,
    postMessage,
  };
}

describe('getInfoHandler', () => {
  test('returns correct handler depending on login type', () => {
    const clientID = 'clientID';
    const gh = getLoginHandler(LoginType.google, '', clientID);
    expect(gh instanceof GoogleHandler).toBe(true);
    const dh = getLoginHandler(LoginType.discord, '', clientID);
    expect(dh instanceof DiscordHandler).toBe(true);
    const rh = getLoginHandler(LoginType.reddit, '', clientID);
    expect(rh instanceof RedditHandler).toBe(true);
    const th = getLoginHandler(LoginType.twitch, '', clientID);
    expect(th instanceof TwitchHandler).toBe(true);
    const twh = getLoginHandler(LoginType.twitter, '', clientID);
    expect(twh instanceof TwitterHandler).toBe(true);
    const gih = getLoginHandler(LoginType.github, '', clientID);
    expect(gih instanceof GithubHandler).toBe(true);
  });
});

describe('parseHash', () => {
  test('returns expected hash params from url', () => {
    const url = new URL(
      'http://localhost:8080/examples/redirect#state=_jf5too8sv&access_token=some_access_token&token_type=Bearer&expires_in=3599&scope=email%20profile%20openid&id_token=some_id_token&authuser=0&hd=newfang.io&prompt=consent'
    );
    const params = parseHash(url);
    expect(params.state).toBe('_jf5too8sv');
    expect(params.token_type).toBe('Bearer');
    expect(params.expires_in).toBe('3599');
    expect(params.id_token).toBe('some_id_token');
    expect(params.scope).toBe('email profile openid');
    expect(params.access_token).toBe('some_access_token');
  });
});

describe('parseAndSendRedirectParams', () => {
  test('should send success redirect params', () => {
    const { postMessage } = createMockWindow(
      'https://example.com/#state=some_state'
    );
    handleRedirectPage('*');
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith(
      { params: { state: 'some_state' }, status: 'success' },
      '*'
    );
  });

  test('should send error redirect params', () => {
    const { postMessage } = createMockWindow(
      'https://example.com/#error=some_error'
    );
    handleRedirectPage('*');
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith(
      { error: 'some_error', params: { error: 'some_error' }, status: 'error' },
      '*'
    );
  });
  test('should send error on empty valid params', () => {
    const { postMessage } = createMockWindow(
      'https://example.com/#something=some_error'
    );
    handleRedirectPage('*');
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith(
      { error: 'paramater list is empty', params: {}, status: 'error' },
      '*'
    );
  });

  test('should be called with specified origin', () => {
    const { postMessage } = createMockWindow(
      'https://example.com/#error=some_error'
    );
    handleRedirectPage('https://some_url');
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith(
      { error: 'some_error', params: { error: 'some_error' }, status: 'error' },
      'https://some_url'
    );
  });
});
