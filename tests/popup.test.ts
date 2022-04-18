import Popup from '../src/popup';
import { RedirectParams } from '../src/utils';
import { freezeLogLevel, LOG_LEVEL, setLogLevel } from '../src/logger';

setLogLevel(LOG_LEVEL.NOLOGS);
freezeLogLevel();

function createMockWindowResponse(params) {
  const mockedOpen = jest.fn();
  const originalWindow = { ...window };
  const windowSpy = jest.spyOn(global, 'window', 'get');
  const addEventListener = jest
    .fn()
    .mockImplementationOnce((_: string, callback) => {
      callback(params);
    });
  const removeEventListener = jest
    .fn()
    .mockImplementationOnce((_: string, callback) => {
      callback();
    });
  windowSpy.mockImplementation(() => ({
    ...originalWindow,
    open: mockedOpen,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
  }));
  return {
    spy: windowSpy,
    open: mockedOpen,
    add: addEventListener,
    remove: removeEventListener,
  };
}
describe('Popup handler', () => {
  const popup = new Popup('url', 'state');
  const modifier = async (p: RedirectParams) => {
    return p;
  };
  test('should call window open function', () => {
    const { open } = createMockWindowResponse({});
    popup.open();
    expect(open).toBeCalled();
    expect(open).toBeCalledWith(
      'url',
      '_blank',
      'titlebar=0,toolbar=0,status=0,menubar=0,resizable=0,height=700,width=1200'
    );
    open.mockRestore();
  });

  test('should register then remove event listener', () => {
    const { spy, add, remove } = createMockWindowResponse({
      data: {
        status: 'success',
        params: { id_token: 'token' },
        state: 'some_state',
      },
    });
    popup.getWindowResponse(modifier);
    expect(add).toBeCalledTimes(1);
    expect(add).toBeCalledWith('message', expect.any(Function), false);
    expect(remove).toBeCalledTimes(1);
    expect(remove).toBeCalledWith('message', expect.any(Function));

    add.mockRestore();
    remove.mockRestore();
    spy.mockRestore();
  });

  test('should succeed on correct state', () => {
    const { spy, add, remove } = createMockWindowResponse({
      data: {
        status: 'success',
        params: {
          state: popup['id'],
          id_token: 'token',
        },
      },
    });
    expect(popup.getWindowResponse(modifier)).resolves.toEqual({
      state: popup['id'],
      id_token: 'token',
    });
    expect(add).toBeCalledTimes(1);
    expect(add).toBeCalledWith('message', expect.any(Function), false);
    expect(remove).toBeCalledTimes(1);
    expect(remove).toBeCalledWith('message', expect.any(Function));

    add.mockRestore();
    remove.mockRestore();
    spy.mockRestore();
  });

  test('should error on invalid state', () => {
    const { spy, add, remove } = createMockWindowResponse({
      data: {
        status: 'success',
        params: {
          state: 'invalid_state',
          id_token: 'token',
        },
      },
    });
    expect(popup.getWindowResponse(modifier)).rejects.toEqual('state mismatch');
    expect(add).toBeCalledTimes(1);
    expect(add).toBeCalledWith('message', expect.any(Function), false);
    expect(remove).toBeCalledTimes(1);
    expect(remove).toBeCalledWith('message', expect.any(Function));

    add.mockRestore();
    remove.mockRestore();
    spy.mockRestore();
  });

  test('should return expected response', () => {
    const { spy, add, remove } = createMockWindowResponse({
      data: {
        status: 'success',
        params: { id_token: 'token' },
        state: 'some_state',
      },
    });
    expect(popup.getWindowResponse(modifier)).resolves.toEqual({
      id_token: 'token',
    });
    expect(add).toBeCalledTimes(1);
    expect(add).toBeCalledWith('message', expect.any(Function), false);
    expect(remove).toBeCalledTimes(1);
    expect(remove).toBeCalledWith('message', expect.any(Function));

    add.mockRestore();
    remove.mockRestore();
    spy.mockRestore();
  });

  test('should return expected response on error', () => {
    const { spy, add, remove } = createMockWindowResponse({
      data: {
        status: 'error',
        params: { error: 'error', error_description: 'error_desc' },
        state: 'some_state',
      },
    });
    expect(popup.getWindowResponse(modifier)).rejects.toEqual(
      'error: error_desc'
    );
    expect(add).toBeCalledTimes(1);
    expect(add).toBeCalledWith('message', expect.any(Function), false);
    expect(remove).toBeCalledTimes(1);
    expect(remove).toBeCalledWith('message', expect.any(Function));

    add.mockRestore();
    remove.mockRestore();
    spy.mockRestore();
  });

  test('should return expected error on popup closed by user', async () => {
    const { spy, add, remove, open } = createMockWindowResponse({ data: {} });
    open.mockReturnValue({ closed: true });
    popup.open();
    try {
      await popup.getWindowResponse(modifier);
    } catch (e) {
      expect(e).toEqual('popup closed by user');
    }
    expect(add).toBeCalledTimes(1);
    expect(add).toBeCalledWith('message', expect.any(Function), false);

    add.mockRestore();
    remove.mockRestore();
    spy.mockRestore();
  });
});
