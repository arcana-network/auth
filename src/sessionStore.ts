import { b64, utf8 } from './codec';
import { ArcanaAuthException } from './errors';

interface StoreValue {
  version: 1;
  readonly value: string;
  readonly expiresAt?: number;
}

class SessionStore {
  private name: string;
  private sessionKey: string;
  private store: Map<string, StoreValue>;
  constructor(name = '') {
    this.name = name || 'default';
    this.sessionKey = `session-keystore-${this.name}`;
    this.store = new Map();
    if (typeof window !== 'undefined') {
      this.rehydrate();
      this.addHookForUnload();
    }
  }

  public set(key: string, value: string, expiresAt?: Date | number): void {
    let d: number | undefined;
    if (expiresAt !== undefined) {
      d = typeof expiresAt === 'number' ? expiresAt : expiresAt.valueOf();
    }

    const item: StoreValue = {
      version: 1,
      value,
      expiresAt: d,
    };
    this.store.set(key, item);
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  public get(key: string): string | null {
    const now = Date.now();
    const item = this.store.get(key);
    if (!item) {
      return null;
    }
    if (item.expiresAt !== undefined && item.expiresAt <= now) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  public clear(): void {
    this.store = new Map();
  }

  public unload(): void {
    this.persist();
  }

  private addHookForUnload() {
    window.addEventListener('unload', this.persist.bind(this));
  }

  private persist() {
    if (typeof window === 'undefined') {
      throw new ArcanaAuthException(
        'SessionKeystore.persist is only available in the browser.'
      );
    }
    const json = JSON.stringify(Array.from(this.store.entries()));
    const [a, b] = split(json);
    this.saveToWindowName(this.sessionKey, a);
    this.saveToSessionStorage(b);
  }

  private rehydrate(): void {
    const a = this.loadFromWindowName(this.sessionKey);
    const b = this.loadFromSessionStorage(this.sessionKey);
    this.deleteFromSessionStorage(this.sessionKey);
    if (!a || !b) {
      return;
    }
    const json = join(a, b);
    if (!json) {
      return;
    }
    const entries: [string, StoreValue][] = JSON.parse(json);
    this.store = new Map(
      entries.map(([key, item]) => {
        return [key, item];
      })
    );
  }

  private saveToWindowName(name: string, val: string) {
    const obj: Record<string, string> = {};
    obj[name] = val;
    window.name = JSON.stringify(obj);
  }

  private saveToSessionStorage(val: string) {
    window.sessionStorage.setItem(this.sessionKey, val);
  }

  private loadFromWindowName(name: string) {
    if (!window.name) {
      return null;
    }
    const saved = JSON.parse(window.name);
    if (!(name in saved)) {
      return null;
    }
    const { [name]: out, ...safe } = saved;
    const json = JSON.stringify(safe);
    window.name = json === '{}' ? '' : json;
    return out || null;
  }

  private loadFromSessionStorage(key: string) {
    return window.sessionStorage.getItem(key);
  }

  private deleteFromSessionStorage(key: string) {
    window.sessionStorage.removeItem(key);
  }
}

export const split = (secret: string): string[] => {
  const buff = utf8.encode(secret);
  const rand1 = randomBytes(buff.length);
  const rand2 = new Uint8Array(rand1);
  for (const i in buff) {
    rand2[i] = rand2[i] ^ buff[i];
  }
  return [b64.encode(rand1), b64.encode(rand2)];
};

export const join = (a: string, b: string): string | null => {
  if (a.length !== b.length) {
    return null;
  }
  const aBuff = b64.decode(a);
  const bBuff = b64.decode(b);
  const output = new Uint8Array(aBuff.length);
  for (const i in output) {
    output[i] = aBuff[i] ^ bBuff[i];
  }
  return utf8.decode(output);
};

const randomBytes = (length: number): Uint8Array => {
  return window.crypto.getRandomValues(new Uint8Array(length));
};

export default SessionStore;
