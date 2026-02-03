# Understanding `builder.destroy()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to clean up a reactive builder or built object? Use `destroy()`:

```js
// Create a reactive builder with effects
const builder = reactive({ count: 0 })
  .effect(() => {
    console.log('Count is:', builder.state.count);
  })
  .watch({
    count(newVal) {
      console.log('Count changed to:', newVal);
    }
  });

// Logs immediately: "Count is: 0"

// Update state - effects and watchers run
builder.state.count = 5;
// Logs: "Count changed to: 5"
// Logs: "Count is: 5"

// Clean up all effects and watchers
builder.destroy();

// Now effects and watchers won't run
builder.state.count = 10;
// Nothing logged (destroyed)

// Or with a built object:
const counter = reactive({ count: 0 })
  .effect(() => console.log('Count:', counter.state.count))
  .build();

counter.count = 5; // Effect runs
counter.destroy(); // Clean up
counter.count = 10; // Effect doesn't run
```

**That's it!** `builder.destroy()` stops all effects, watchers, and bindings!

 

## What is `builder.destroy()`?

`builder.destroy()` is a **method** that **stops all reactive effects, watchers, and bindings** created during the building process. It's available both on the builder (before calling `.build()`) and on the built object (after calling `.build()`).

**This method:**
- Stops all effects from running
- Removes all watchers
- Cleans up all DOM bindings
- Prevents memory leaks
- Should be called when you're done with the object
- Can be called on builder or built object

Think of it as **turning off the power** - all the reactive connections stop working, effects stop running, and everything is cleaned up.

 

## Syntax

```js
// On a builder (before .build())
builder.destroy()

// On a built object (after .build())
builtObject.destroy()

// Full example
const builder = reactive({ count: 0 })
  .effect(() => console.log(builder.state.count));

builder.destroy(); // Clean up the builder

// Or after building:
const counter = reactive({ count: 0 })
  .effect(() => console.log(counter.state.count))
  .build();

counter.destroy(); // Clean up the built object
```

**Parameters:**
- None - `destroy()` takes no parameters

**Returns:**
- Nothing (`undefined`)

**Important:**
- Stops all effects, watchers, and bindings
- Can be called on builder or built object
- Safe to call multiple times
- Irreversible - effects won't restart

 

## Why Does This Exist?

### The Problem with Endless Effects

Let's say you create reactive effects but never clean them up:

```javascript
function createCounter() {
  const counter = reactive({ count: 0 })
    .effect(() => {
      console.log('Count:', counter.state.count);
      // This effect keeps running FOREVER!
    })
    .build();

  counter.count = 5;
  return counter;
}

// Create multiple counters
const counter1 = createCounter(); // Creates effect
const counter2 = createCounter(); // Creates another effect
const counter3 = createCounter(); // Creates another effect

// All effects are still running, consuming memory!
// This causes a memory leak!
```

**What's the Real Issue?**

```
Without destroy():
┌─────────────────────┐
│ Create Object 1     │
│  + Effect 1 ────────┼──→ Running forever
└─────────────────────┘

┌─────────────────────┐
│ Create Object 2     │
│  + Effect 2 ────────┼──→ Running forever
└─────────────────────┘

┌─────────────────────┐
│ Create Object 3     │
│  + Effect 3 ────────┼──→ Running forever
└─────────────────────┘

All effects keep running!
Memory leak!
Performance degrades!
```

**Problems:**
❌ Effects run forever
❌ Memory leaks
❌ Wasted CPU cycles
❌ Performance degradation
❌ Can't stop unwanted updates
❌ No way to clean up

### The Solution with `destroy()`

When you call `destroy()`, all effects stop:

```javascript
function createCounter() {
  const counter = reactive({ count: 0 })
    .effect(() => {
      console.log('Count:', counter.state.count);
    })
    .build();

  counter.count = 5;

  // Clean up when done
  counter.destroy(); // ← Stop the effect

  return counter;
}

// Create multiple counters
const counter1 = createCounter(); // Effect runs, then cleaned up
const counter2 = createCounter(); // Effect runs, then cleaned up
const counter3 = createCounter(); // Effect runs, then cleaned up

// No memory leaks!
// All effects properly cleaned up!
```

**What Just Happened?**

```
With destroy():
┌─────────────────────┐
│ Create Object 1     │
│  + Effect 1         │──→ Running
└──────────┬──────────┘
           │ .destroy()
           ▼
        Stopped ✓

┌─────────────────────┐
│ Create Object 2     │
│  + Effect 2         │──→ Running
└──────────┬──────────┘
           │ .destroy()
           ▼
        Stopped ✓

Clean memory!
No leaks!
Good performance!
```

With `destroy()`:
- Effects stop running
- Memory is freed
- No performance degradation
- Clean, proper resource management
- No memory leaks
- Full control over lifecycle

**Benefits:**
✅ Stops all effects and watchers
✅ Prevents memory leaks
✅ Frees up resources
✅ Better performance
✅ Proper lifecycle management
✅ Clean shutdown

 

## Mental Model

Think of `destroy()` like **turning off the power in a building**:

```
Without destroy() (Power On Forever):
┌─────────────────────┐
│  Building           │
│  ⚡ Power ON        │
│                     │
│  💡 Lights on       │
│  🌡️  AC running     │
│  🔊 Systems active  │
│  💻 Computers on    │
└─────────────────────┘
    Running forever!
    Wasting energy!
    Costs money!

With destroy() (Turn Off Power):
┌─────────────────────┐
│  Building           │
│  🔌 Power OFF       │
│                     │
│  ⚫ Lights off      │
│  ❄️  AC stopped     │
│  🔇 Systems off     │
│  ⏻  Computers off   │
└─────────────────────┘
    Everything stopped!
    Energy saved!
    Clean shutdown!
```

**Key Insight:** Just like turning off the power in a building stops all electrical systems from running, `destroy()` stops all reactive effects, watchers, and bindings from running!

 

## How Does It Work?

### The Magic: Cleanup Functions

When you call `destroy()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .build();

counter.destroy();

// What actually happens (simplified):
class Builder {
  constructor(initialState) {
    this.state = reactive(initialState);
    this.cleanups = []; // Array to store cleanup functions
  }

  effect(fn) {
    // Create effect and get cleanup function
    const cleanup = createEffect(() => {
      fn();
    });

    // Store cleanup for later
    this.cleanups.push(cleanup);

    return this; // Return builder for chaining
  }

  destroy() {
    // Run all cleanup functions
    this.cleanups.forEach(cleanup => {
      cleanup(); // Stops the effect
    });

    // Clear the cleanups array
    this.cleanups = [];
  }

  build() {
    // Add destroy() to the built object
    this.state.destroy = () => this.destroy();
    return this.state;
  }
}
```

**In other words:** `destroy()`:
1. Loops through all stored cleanup functions
2. Calls each cleanup function
3. Each cleanup stops its effect/watcher/binding
4. Clears the cleanups array
5. Everything stops running

### Under the Hood

```
.destroy()
   │
   ▼
┌───────────────────────┐
│  Loop Through         │
│  Cleanup Functions    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Call Cleanup #1      │
│  (Stop Effect #1)     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Call Cleanup #2      │
│  (Stop Watcher #1)    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Call Cleanup #3      │
│  (Stop Binding #1)    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Clear Cleanups Array │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  All Stopped!         │
│  ✓ No effects         │
│  ✓ No watchers        │
│  ✓ No bindings        │
└───────────────────────┘
```

**What happens:**

1️⃣ `destroy()` is **called**
2️⃣ **All cleanup functions** are executed
3️⃣ Each cleanup **stops** its effect/watcher/binding
4️⃣ Cleanups array is **cleared**
5️⃣ **Everything stops** running

 

## Basic Usage

### Destroy a Builder

Call `destroy()` on a builder before building:

```js
// Create builder with effect
const builder = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', builder.state.count);
  });

// Logs: "Count: 0"

builder.state.count = 5;
// Logs: "Count: 5"

// Destroy before building
builder.destroy();

builder.state.count = 10;
// Nothing logged (destroyed)
```

### Destroy a Built Object

Call `destroy()` on a built object:

```js
// Create and build
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .build();

// Logs: "Count: 0"

counter.count = 5;
// Logs: "Count: 5"

// Destroy the built object
counter.destroy();

counter.count = 10;
// Nothing logged (destroyed)
```

### Multiple Effects

`destroy()` stops all effects:

```js
const app = reactive({ count: 0 })
  .effect(() => {
    console.log('Effect 1:', app.state.count);
  })
  .effect(() => {
    console.log('Effect 2:', app.state.count * 2);
  })
  .effect(() => {
    console.log('Effect 3:', app.state.count + 10);
  })
  .build();

// All 3 effects log

app.count = 5;
// All 3 effects log again

app.destroy();

app.count = 10;
// No effects log (all destroyed)
```

 

## What Gets Destroyed

### Effects

All effects created with `.effect()` are stopped:

```js
const app = reactive({ count: 0 })
  .effect(() => {
    console.log('Effect:', app.state.count);
  })
  .build();

app.count = 5; // Effect runs
app.destroy();
app.count = 10; // Effect doesn't run
```

### Watchers

All watchers created with `.watch()` are removed:

```js
const app = reactive({ count: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`Watch: ${oldVal} → ${newVal}`);
    }
  })
  .build();

app.count = 5; // Watcher runs
app.destroy();
app.count = 10; // Watcher doesn't run
```

### DOM Bindings

All DOM bindings created with `.bind()` are removed:

```js
// HTML: <div id="counter"></div>

const app = reactive({ count: 0 })
  .bind({
    '#counter': 'count'
  })
  .build();

app.count = 5; // DOM updates
app.destroy();
app.count = 10; // DOM doesn't update
```

### Computed Properties (Special Case)

Computed properties themselves aren't "destroyed", but their internal effects are cleaned up:

```js
const app = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();

console.log(app.doubled); // Works before destroy

app.destroy();

// Computed property still exists, but its internal tracking is cleaned up
console.log(app.doubled); // Still accessible, but no longer reactive
```

 

## When to Call destroy()

### Component Unmounting

```js
// React example
function Counter() {
  const [counter] = React.useState(() =>
    reactive({ count: 0 })
      .effect(() => {
        document.title = `Count: ${counter.state.count}`;
      })
      .build()
  );

  // Clean up when component unmounts
  React.useEffect(() => {
    return () => {
      counter.destroy(); // ← Important!
    };
  }, []);

  return <div>{counter.count}</div>;
}
```

### Temporary Objects

```js
function processData(items) {
  // Create temporary reactive object
  const processor = reactive({ progress: 0 })
    .effect(() => {
      console.log('Progress:', processor.state.progress + '%');
    })
    .build();

  // Process items
  items.forEach((item, index) => {
    // Process item...
    processor.progress = ((index + 1) / items.length) * 100;
  });

  // Clean up when done
  processor.destroy(); // ← Important!
}
```

### Navigation

```js
// Single Page App routing
const routes = {
  '/home': () => {
    const page = reactive({ data: null })
      .effect(() => {
        renderHomePage(page.state.data);
      })
      .build();

    // Return cleanup function
    return () => page.destroy();
  },
  '/about': () => {
    const page = reactive({ data: null })
      .effect(() => {
        renderAboutPage(page.state.data);
      })
      .build();

    return () => page.destroy();
  }
};

let currentCleanup = null;

function navigate(route) {
  // Clean up previous page
  if (currentCleanup) {
    currentCleanup(); // Destroys old page
  }

  // Create new page
  currentCleanup = routes[route]();
}
```

### Testing

```js
describe('Counter', () => {
  let counter;

  beforeEach(() => {
    counter = reactive({ count: 0 })
      .effect(() => {
        console.log('Count:', counter.state.count);
      })
      .build();
  });

  afterEach(() => {
    // Clean up after each test
    counter.destroy(); // ← Important!
  });

  it('increments', () => {
    counter.count = 5;
    expect(counter.count).toBe(5);
  });
});
```

 

## destroy() on Built Objects

### Available on Built Objects

When you call `.build()`, a `destroy()` method is automatically added:

```js
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .build();

// The built object has destroy()
counter.destroy(); // ✅ Available
```

### Same as Builder destroy()

The `destroy()` on the built object does the same thing as the builder's `destroy()`:

```js
// These are equivalent:

// Option 1: Destroy builder
const builder = reactive({ count: 0 })
  .effect(() => console.log('Count:', builder.state.count));

builder.destroy();

// Option 2: Destroy built object
const counter = reactive({ count: 0 })
  .effect(() => console.log('Count:', counter.state.count))
  .build();

counter.destroy();

// Both stop all effects
```

 

## Common Patterns

### Pattern: Component Lifecycle

```js
class Component {
  constructor() {
    this.state = reactive({ count: 0 })
      .effect(() => this.render())
      .build();
  }

  render() {
    console.log('Rendering...', this.state.count);
  }

  unmount() {
    this.state.destroy(); // Clean up
  }
}

const component = new Component();
component.state.count = 5;
component.unmount(); // Clean up when done
```

### Pattern: Scoped Reactive Objects

```js
function withScope(fn) {
  const scope = reactive({ data: null })
    .effect(() => {
      console.log('Data:', scope.state.data);
    })
    .build();

  fn(scope);

  // Auto-cleanup when scope ends
  scope.destroy();
}

withScope((scope) => {
  scope.data = 'Hello';
  scope.data = 'World';
});
// Automatically cleaned up after function
```

### Pattern: Subscription Management

```js
class EventBus {
  constructor() {
    this.subscriptions = new Map();
  }

  subscribe(event, handler) {
    const subscription = reactive({ active: true })
      .effect(() => {
        if (subscription.state.active) {
          handler();
        }
      })
      .build();

    this.subscriptions.set(event, subscription);

    return () => {
      subscription.destroy();
      this.subscriptions.delete(event);
    };
  }
}

const bus = new EventBus();
const unsubscribe = bus.subscribe('update', () => {
  console.log('Update event');
});

// Later...
unsubscribe(); // Destroys subscription
```

### Pattern: Temporary State

```js
async function fetchUserData(userId) {
  // Create temporary reactive state
  const fetcher = reactive({ loading: true, data: null, error: null })
    .effect(() => {
      if (fetcher.state.loading) {
        showSpinner();
      } else {
        hideSpinner();
      }
    })
    .build();

  try {
    const data = await fetch(`/api/users/${userId}`);
    fetcher.data = await data.json();
  } catch (error) {
    fetcher.error = error.message;
  } finally {
    fetcher.loading = false;
  }

  const result = { data: fetcher.data, error: fetcher.error };

  // Clean up temporary state
  fetcher.destroy();

  return result;
}
```

### Pattern: Resource Pool

```js
class ResourcePool {
  constructor() {
    this.resources = [];
  }

  create() {
    const resource = reactive({ inUse: false, data: null })
      .effect(() => {
        console.log('Resource:', resource.state.data);
      })
      .build();

    this.resources.push(resource);
    return resource;
  }

  destroyAll() {
    this.resources.forEach(resource => {
      resource.destroy();
    });
    this.resources = [];
  }
}

const pool = new ResourcePool();
const r1 = pool.create();
const r2 = pool.create();

// Clean up all resources
pool.destroyAll();
```

 

## Common Pitfalls

### Pitfall #1: Forgetting to Call destroy()

❌ **Memory Leak:**
```js
function createManyCounters() {
  for (let i = 0; i < 1000; i++) {
    const counter = reactive({ count: 0 })
      .effect(() => {
        console.log('Counter', i, ':', counter.state.count);
      })
      .build();

    // Oops! Never called destroy()
    // All 1000 effects keep running forever!
  }
}

createManyCounters(); // Memory leak!
```

✅ **Correct:**
```js
function createManyCounters() {
  const counters = [];

  for (let i = 0; i < 1000; i++) {
    const counter = reactive({ count: 0 })
      .effect(() => {
        console.log('Counter', i, ':', counter.state.count);
      })
      .build();

    counters.push(counter);
  }

  // Clean up all counters when done
  counters.forEach(counter => counter.destroy());
}
```

 

### Pitfall #2: Using Object After destroy()

⚠️ **Unexpected Behavior:**
```js
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .build();

counter.destroy();

// Object still exists, but effects don't run
counter.count = 5;
// Nothing logged (effects destroyed)

console.log(counter.count); // 5 (state still works)
```

The object still exists after `destroy()`, but effects/watchers/bindings don't run.

✅ **Better Practice:**
```js
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .build();

counter.destroy();

// Don't use the object after destroying
// counter = null; // Mark as destroyed if needed
```

 

### Pitfall #3: Calling destroy() Multiple Times

✅ **Safe (No Error):**
```js
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .build();

counter.destroy();
counter.destroy(); // Safe - no error
counter.destroy(); // Safe - does nothing
```

Calling `destroy()` multiple times is safe but unnecessary.

 

### Pitfall #4: Not Destroying in Frameworks

❌ **React Memory Leak:**
```js
function Counter() {
  const counter = reactive({ count: 0 })
    .effect(() => {
      document.title = `Count: ${counter.state.count}`;
    })
    .build();

  // Oops! No cleanup when component unmounts
  return <div>{counter.count}</div>;
}
```

✅ **Correct:**
```js
function Counter() {
  const [counter] = React.useState(() =>
    reactive({ count: 0 })
      .effect(() => {
        document.title = `Count: ${counter.state.count}`;
      })
      .build()
  );

  // Clean up on unmount
  React.useEffect(() => {
    return () => counter.destroy();
  }, []);

  return <div>{counter.count}</div>;
}
```

 

### Pitfall #5: Destroying Too Early

❌ **Wrong:**
```js
function process() {
  const app = reactive({ progress: 0 })
    .effect(() => {
      console.log('Progress:', app.state.progress);
    })
    .build();

  app.destroy(); // Too early!

  // Effect won't run
  app.progress = 50; // Nothing logged
  app.progress = 100; // Nothing logged
}
```

✅ **Correct:**
```js
function process() {
  const app = reactive({ progress: 0 })
    .effect(() => {
      console.log('Progress:', app.state.progress);
    })
    .build();

  app.progress = 50; // Effect runs
  app.progress = 100; // Effect runs

  app.destroy(); // Destroy when done
}
```

 

## Summary

**What is `builder.destroy()`?**

`builder.destroy()` is a **method** that stops all reactive effects, watchers, and bindings to prevent memory leaks and free up resources.

 

**Why use `destroy()`?**

- Stop all effects and watchers
- Prevent memory leaks
- Free up resources
- Proper lifecycle management
- Clean shutdown

 

**Key Points to Remember:**

1️⃣ **Stops everything** - All effects, watchers, and bindings stop
2️⃣ **Prevents leaks** - Essential for avoiding memory leaks
3️⃣ **Call when done** - Call when you're finished with the object
4️⃣ **Safe to call multiple times** - No error if called repeatedly
5️⃣ **Available on both** - Works on builder and built object

 

**Mental Model:** Think of `destroy()` as **turning off the power** - all the reactive systems stop running, effects stop executing, and everything is cleanly shut down!

 

**Quick Reference:**

```js
// DESTROY BUILDER
const builder = reactive({ count: 0 })
  .effect(() => console.log('Count:', builder.state.count));

builder.destroy(); // Stop all effects

// DESTROY BUILT OBJECT
const counter = reactive({ count: 0 })
  .effect(() => console.log('Count:', counter.state.count))
  .build();

counter.destroy(); // Stop all effects

// COMPONENT CLEANUP
React.useEffect(() => {
  return () => counter.destroy(); // Clean up on unmount
}, []);

// TEMPORARY OBJECT
function process() {
  const temp = reactive({ data: null })
    .effect(() => console.log(temp.state.data))
    .build();

  // ... use temp ...

  temp.destroy(); // Clean up when done
}

// WHAT GETS DESTROYED
// ✓ All effects
// ✓ All watchers
// ✓ All bindings
// ✓ Internal cleanup functions

// AFTER DESTROY
counter.count = 5; // State still works
console.log(counter.count); // 5
// But effects/watchers/bindings don't run
```

 

**Remember:** Always call `destroy()` when you're done with a reactive object to prevent memory leaks and ensure proper resource cleanup. It's especially important in component frameworks, temporary objects, and long-running applications!
