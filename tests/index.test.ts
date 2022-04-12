/**
 * @jest-environment ./tests/setupEnv.js
 */
import { FetchMock } from 'jest-fetch-mock';
import { AuthProvider } from '../src/index';
import { LoginType, StoreIndex } from '../src/types';

const fetchMock = fetch as FetchMock;

beforeEach(() => {
  fetchMock.resetMocks();
});

let setItemSpy, getItemSpy;
const mockStorage = {};
beforeAll(() => {
  setItemSpy = jest
    .spyOn(global.Storage.prototype, 'setItem')
    .mockImplementation((key, value) => {
      mockStorage[key] = value;
    });
  getItemSpy = jest
    .spyOn(global.Storage.prototype, 'getItem')
    .mockImplementation((key) => mockStorage[key]);
});

afterEach(() => {
  getItemSpy.mockRestore();
  setItemSpy.mockRestore();
});
function createMockWindow(href: string, params) {
  const postMessage = jest.fn();
  const addEventListener = jest
    .fn()
    .mockImplementation((_: string, callback) => {
      callback(params);
    });
  const removeEventListener = jest
    .fn()
    .mockImplementation((_: string, callback) => {
      callback();
    });
  const originalWindow = { ...window };
  const windowSpy = jest.spyOn(global, 'window', 'get');
  windowSpy.mockImplementation(() => ({
    ...originalWindow,
    opener: {
      postMessage,
    },
    location: { href },
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
  }));
  return {
    spy: windowSpy,
    postMessage,
    add: addEventListener,
    remove: removeEventListener,
  };
}

const assignMock = jest.fn();

delete window.location;
window.location = { assign: assignMock };

afterEach(() => {
  assignMock.mockClear();
});
const mockGetPrivate = jest.fn();
const mockGetPublic = jest.fn();
jest.mock('@arcana/keystore', () => {
  return {
    KeyReconstructor: jest.fn().mockImplementation(() => {
      return {
        getPrivateKey: mockGetPrivate,
        getPublicKey: mockGetPublic,
      };
    }),
  };
});

jest.mock('../src/oauthMeta', () => {
  return {
    OAuthContractMeta: function () {
      return {
        getClientID: () => {
          return 'google_client_id';
        },
      };
    },
  };
});

const getGatewayAPIMockResponse = () => {
  const rpcResponse = { RPC_URL: 'http://localhost:8545' };
  const appAddressResponse = { address: '0xAddress' };
  return { rpcResponse, appAddressResponse };
};

describe('AuthProvider', () => {
  const appId = 'appID_1';
  const email = 'abc@example.com';
  const state = '_jf5too8sv';
  const samplePrivateKey = 'pk_pk_pk';
  test('inits with only required params', async () => {
    const { rpcResponse, appAddressResponse } = getGatewayAPIMockResponse();
    fetchMock.mockResponseOnce(JSON.stringify(rpcResponse));
    fetchMock.mockResponseOnce(JSON.stringify(appAddressResponse));
    const auth = await AuthProvider.init({ appId, flow: 'redirect' });

    expect(fetchMock).toBeCalledTimes(2);
    expect(auth['params'].appId).toEqual(appId);
    expect(auth['params'].rpcUrl).toEqual(rpcResponse.RPC_URL);
    expect(auth['appAddress']).toEqual(appAddressResponse.address);
  });

  test('init on redirect mode with redirect params should fetch private key', async () => {
    localStorage.setItem(
      `${appId}:${StoreIndex.LOGIN_TYPE}`,
      JSON.stringify(LoginType.google)
    );
    localStorage.setItem(`${appId}:state`, JSON.stringify(state));

    const { rpcResponse, appAddressResponse } = getGatewayAPIMockResponse();
    fetchMock.mockResponseOnce(JSON.stringify(rpcResponse));
    fetchMock.mockResponseOnce(JSON.stringify(appAddressResponse));
    fetchMock.mockResponseOnce(JSON.stringify({ email }));
    const { spy } = createMockWindow(
      'http://localhost:8080/examples/redirect#state=_jf5too8sv&access_token=some_access_token&token_type=Bearer&expires_in=3599&scope=email%20profile%20openid&id_token=some_id_token&authuser=0&hd=newfang.io&prompt=consent',
      {}
    );
    mockGetPrivate.mockResolvedValueOnce({ privateKey: samplePrivateKey });
    const auth = await AuthProvider.init({ appId, flow: 'redirect' });

    expect(mockGetPrivate).toBeCalledWith({
      id: email,
      verifier: LoginType.google,
      idToken: 'some_id_token',
    });
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.getUserInfo()).toStrictEqual({
      privateKey: samplePrivateKey,
      loginType: LoginType.google,
      userInfo: { id: email, email: email },
    });
    spy.mockRestore();
  });

  test('login with social should work as expected', async () => {
    const { rpcResponse, appAddressResponse } = getGatewayAPIMockResponse();
    fetchMock.mockResponseOnce(JSON.stringify(rpcResponse));
    fetchMock.mockResponseOnce(JSON.stringify(appAddressResponse));
    // fetchMock.mockResponseOnce(JSON.stringify({ email }));
    const auth = await AuthProvider.init({
      appId,
      flow: 'redirect',
      redirectUri: 'http://localhost/redirect',
    });
    await auth.loginWithSocial(LoginType.google);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const ur = new URL(window.location.href);
    expect(ur.searchParams.get('client_id')).toBe('google_client_id');
    expect(ur.searchParams.get('redirect_uri')).toBe(
      'http://localhost/redirect'
    );
    expect(ur.searchParams.get('scope')).toBe('profile email openid');
    expect(ur.searchParams.get('response_type')).toBe('token id_token');
    expect(ur.searchParams.get('prompt')).toBe('consent select_account');
  });
});
