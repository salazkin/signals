# Simple Observer Class and Reactive Wrapper

A lightweight implementation of the Observer pattern using a `Signal` class. Also `reactive` wrapper for creating reactive objects.

---

## Signal

The `Signal` class implements the Observer pattern, allowing you to register listeners that are triggered when the signal is dispatched.

### API

**`add(listener, context?)`**: Registers a listener to be called on dispatch.  
**`addOnce(listener, context?)`**: Registers a one-time listener, auto-removed after dispatch.  
**`remove(listener, context?)`**: Removes a listener.  
**`removeAll()`**: Removes all listeners.  
**`dispatch(data)`**: Triggers the signal, passing `data` to all listeners.  
**`isEmpty()`**: Returns `true` if no listeners are registered, otherwise `false`.

### Example

```javascript
import { Signal } from "@salazkin/signals";

const signal = new Signal();

signal.add(message => {
  console.log(`Received: ${message}`);
});

signal.dispatch("Hello, World!"); // Output: "Received: Hello, World!"
```

---

## Reactive

The `reactive` function wraps an object in a `Proxy` to make it reactive. Any changes to the object's properties trigger a signal, allowing you to watch for changes.

### Example

```javascript
import { reactive } from "@salazkin/signals";

const user = reactive({
  name: "Alice",
  age: 25
});

const subscription = user.watch(({ prop, value }) => {
  console.log(`Property "${prop}" changed to ${value}`);
});

user.name = "Bob"; // Output: `Property "name" changed to Bob`
user.age = 30; // Output: `Property "age" changed to 30`

// Unsubscribe from changes
subscription.unsubscribe();
user.name = "Charlie"; // No output (unsubscribed)
```

---

### Installation

```bash
npm install @salazkin/signals
```

---

## License

MIT
