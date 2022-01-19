type ListenerFn = (params: any) => void;

class EventEmitter {
  private listeners: {
    [k: string]: { listener: ListenerFn; once: boolean };
  } = {};
  constructor() {
    this.listeners = {};
  }

  once(eventName: string, listener: ListenerFn) {
    this.listeners[eventName] = { once: true, listener };
  }
  addListener(eventName: string, listener: ListenerFn) {
    this.listeners[eventName] = { once: false, listener };
  }

  emit(eventName: string, params: any) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].listener(params);
      if (this.listeners[eventName].once) {
        delete this.listeners[eventName];
      }
    }
  }
}

export { EventEmitter };
