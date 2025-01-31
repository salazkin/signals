export declare class Signal<T> {
    private listeners;
    private onceListeners;
    /**
     * Adds a listener to the signal.
     * @param listener - The listener function.
     * @param context - The context in which the listener is called. Defaults to the Signal instance.
     */
    add(listener: (data: T) => void, context?: unknown): void;
    /**
     * Adds a one-time listener to the signal.
     * The listener is automatically removed after being called once.
     * @param listener - The listener function.
     * @param context - The context in which the listener is called. Defaults to the Signal instance.
     */
    addOnce(listener: (data: T) => void, context?: unknown): void;
    private addListener;
    /**
     * Removes a listener from the signal.
     * @param listener - The listener function to remove.
     * @param context - The context in which the listener was added. Defaults to the Signal instance.
     */
    remove(listener: (data: T) => void, context?: unknown): void;
    private removeListener;
    /**
     * Removes all listeners from the signal.
     */
    removeAll(): void;
    /**
     * Dispatches the signal, calling all listeners with the provided data.
     * @param data - The data to pass to the listeners.
     */
    dispatch(data: T): void;
    /**
     * Checks if the signal has any listeners.
     * @returns `true` if no listeners are registered, otherwise `false`.
     */
    isEmpty(): boolean;
}
type WatchData<T> = {
    target: T;
    prop: keyof T;
    value: any;
};
type SignalSubscription<T> = {
    watch: (listener: (data: WatchData<T>) => void) => {
        unsubscribe: () => void;
    };
};
/**
 * Makes an object reactive by wrapping it in a Proxy.
 * @param data - The object to make reactive.
 * @returns The reactive object with a `watch` method for subscribing to changes.
 */
export declare const reactive: <T extends object>(data: T) => T & SignalSubscription<T>;
export {};
