export class Signal<T> {
  private listeners: Map<unknown, Set<(data: T) => void>> = new Map();
  private onceListeners: Map<unknown, Set<(data: T) => void>> = new Map();

  /**
   * Adds a listener to the signal.
   * @param listener - The listener function.
   * @param context - The context in which the listener is called. Defaults to the Signal instance.
   */
  public add(listener: (data: T) => void, context?: unknown): void {
    this.addListener(this.listeners, listener, context || this);
  }

  /**
   * Adds a one-time listener to the signal.
   * The listener is automatically removed after being called once.
   * @param listener - The listener function.
   * @param context - The context in which the listener is called. Defaults to the Signal instance.
   */
  public addOnce(listener: (data: T) => void, context?: unknown): void {
    this.addListener(this.onceListeners, listener, context || this);
  }

  private addListener(
    target: Map<unknown, Set<(data: T) => void>>,
    listener: (data: T) => void,
    context: unknown = this
  ): void {
    if (!target.has(context)) {
      target.set(context, new Set());
    }
    target.get(context)?.add(listener);
  }

  /**
   * Removes a listener from the signal.
   * @param listener - The listener function to remove.
   * @param context - The context in which the listener was added. Defaults to the Signal instance.
   */
  public remove(listener: (data: T) => void, context?: unknown): void {
    this.removeListener(this.listeners, listener, context || this);
    this.removeListener(this.onceListeners, listener, context || this);
  }

  private removeListener(
    target: Map<unknown, Set<(data: T) => void>>,
    listener: (data: T) => void,
    context: unknown = this
  ): void {
    const listenerSet = target.get(context);
    if (listenerSet) {
      listenerSet.delete(listener);
      if (listenerSet.size === 0) {
        target.delete(context);
      }
    }
  }

  /**
   * Removes all listeners from the signal.
   */
  public removeAll(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  /**
   * Dispatches the signal, calling all listeners with the provided data.
   * @param data - The data to pass to the listeners.
   */
  public dispatch(data: T): void {
    this.listeners.forEach((listeners, key) => {
      listeners.forEach(listener => listener.call(key, data));
    });
    this.onceListeners.forEach((listeners, key) => {
      listeners.forEach(listener => listener.call(key, data));
    });
    this.onceListeners.clear();
  }

  /**
   * Checks if the signal has any listeners.
   * @returns `true` if no listeners are registered, otherwise `false`.
   */
  public isEmpty(): boolean {
    return this.listeners.size === 0 && this.onceListeners.size === 0;
  }
}

export type WatchData<T> = { target: T; prop: keyof T; value: any };
export type WatchSubscription<T> = {
  watch: (listener: (data: WatchData<T>) => void) => { unsubscribe: () => void };
};

/**
 * Makes an object reactive by wrapping it in a Proxy.
 * @param data - The object to make reactive.
 * @returns The reactive object with a `watch` method for subscribing to changes.
 */
export const reactive = <T extends object>(
  data: T
): T & WatchSubscription<T> => {
  const signal = new Signal<WatchData<T>>();

  const observeHandler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      if (prop === "__proto__" || prop === "constructor" || prop === "prototype") {
        throw new Error("Access to prototype properties is not allowed");
      }
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "object" && value !== null) {
        return new Proxy(value, observeHandler);
      }
      return value;
    },
    set(target, prop: any, value, receiver) {
      if (prop === "__proto__" || prop === "constructor" || prop === "prototype") {
        throw new Error("Modification of prototype properties is not allowed");
      }
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) {
        signal.dispatch({ target, prop, value });
      }
      return result;
    },
  };

  const proxy = new Proxy(data, observeHandler);

  (proxy as any).watch = (listener: (data: WatchData<T>) => void) => {
    signal.add(listener);
    return {
      unsubscribe: () => signal.remove(listener),
    };
  };

  return proxy as T & WatchSubscription<T>;
};