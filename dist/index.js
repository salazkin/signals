class Signal {
    listeners = new Map();
    onceListeners = new Map();
    /**
     * Adds a listener to the signal.
     * @param listener - The listener function.
     * @param context - The context in which the listener is called. Defaults to the Signal instance.
     */
    add(listener, context) {
        this.addListener(this.listeners, listener, context || this);
    }
    /**
     * Adds a one-time listener to the signal.
     * The listener is automatically removed after being called once.
     * @param listener - The listener function.
     * @param context - The context in which the listener is called. Defaults to the Signal instance.
     */
    addOnce(listener, context) {
        this.addListener(this.onceListeners, listener, context || this);
    }
    addListener(target, listener, context = this) {
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
    remove(listener, context) {
        this.removeListener(this.listeners, listener, context || this);
        this.removeListener(this.onceListeners, listener, context || this);
    }
    removeListener(target, listener, context = this) {
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
    removeAll() {
        this.listeners.clear();
        this.onceListeners.clear();
    }
    /**
     * Dispatches the signal, calling all listeners with the provided data.
     * @param data - The data to pass to the listeners.
     */
    dispatch(data) {
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
    isEmpty() {
        return this.listeners.size === 0 && this.onceListeners.size === 0;
    }
}
/**
 * Makes an object reactive by wrapping it in a Proxy.
 * @param data - The object to make reactive.
 * @returns The reactive object with a `watch` method for subscribing to changes.
 */
const reactive = (data) => {
    const signal = new Signal();
    const observeHandler = {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === "object" && value !== null) {
                return new Proxy(value, observeHandler);
            }
            return value;
        },
        set(target, prop, value, receiver) {
            const oldValue = target[prop];
            const result = Reflect.set(target, prop, value, receiver);
            if (oldValue !== value) {
                signal.dispatch({ target, prop, value });
            }
            return result;
        },
    };
    const proxy = new Proxy(data, observeHandler);
    proxy.watch = (listener) => {
        signal.add(listener);
        return {
            unsubscribe: () => signal.remove(listener),
        };
    };
    return proxy;
};

export { Signal, reactive };
//# sourceMappingURL=index.js.map
