# Understanding `builder.watch(defs)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to react to specific state changes? Use `builder.watch()`:

```js
// Create a reactive builder and add watchers
const counter = reactive({ count: 0, name: 'Counter' })
  .watch({
    count(newValue, oldValue) {
      console.log(`Count changed: ${oldValue} → ${newValue}`);
    },
    name(newValue, oldValue) {
      console.log(`Name changed: ${oldValue} → ${newValue}`);
    }
  })
  .build();

// Update state - watchers fire automatically
counter.count = 5;
// Logs: "Count changed: 0 → 5"

counter.name = 'My Counter';
// Logs: "Name changed: Counter → My Counter"
```

**That's it!** `builder.watch()` adds watchers to specific properties and returns the builder for chaining!

 

## What is `builder.watch()`?

`builder.watch()` is a **builder method** that adds **watchers** to specific properties in your reactive state. Watchers are callbacks that run automatically when a specific property changes, receiving both the new and old values.

**A watcher:**
- Monitors a specific property for changes
- Runs a callback when that property changes
- Receives the new value and old value as arguments
- Is useful for side effects in response to specific changes
- Can access other state properties via `this.state`

Think of it as **setting up listeners for specific properties** - whenever a watched property changes, your callback runs automatically with information about what changed.

 

## Syntax

```js
// Add watchers to a builder
builder.watch(definitions)

// Full example
reactive({ count: 0, name: 'Counter' })
  .watch({
    count(newValue, oldValue) {
      console.log(`Count: ${oldValue} → ${newValue}`);
    },
    name(newValue, oldValue) {
      console.log(`Name: ${oldValue} → ${newValue}`);
    }
  })
  .build()
```

**Parameters:**
- `definitions` - An object where:
  - **Keys** are property names to watch
  - **Values** are callback functions with signature: `(newValue, oldValue) => {}`
  - Callbacks can access other state via `this.state`

**Returns:**
- The builder (for method chaining)

**Important:**
- Watchers fire **after** the property changes
- Watchers receive **new value first**, then **old value**
- Use `this.state` to access other reactive properties
- The builder is returned, so you can chain more methods

 

## Why Does This Exist?

### The Problem with Manual Change Tracking

Let's say you want to log whenever a counter changes:

```javascript
// Create reactive state
const app = state({ count: 0 });

// You need to manually track changes
let previousCount = app.count;

// Every time you update, you must manually check
app.count = 5;
console.log(`Count changed: ${previousCount} → ${app.count}`);
previousCount = app.count;

// Somewhere else in code...
app.count = 10;
// Oops! Forgot to log the change!
```

This approach has several challenges:

**What's the Real Issue?**

```
Manual Change Tracking:
┌─────────────────┐
│ State           │
│  count: 0       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Update value    │
│  count = 5      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Remember to log │ ← Easy to forget!
│ Remember to save│ ← Manual work!
│ Remember to sync│ ← Error-prone!
└─────────────────┘
        │
        ▼
   Somewhere else...
        │
        ▼
┌─────────────────┐
│ Update value    │
│  count = 10     │
└─────────────────┘
        │
        ▼
   Forgot to log! ❌
```

**Problems:**
❌ Must manually track each change
❌ Easy to forget side effects
❌ No previous value tracking
❌ Scattered logic throughout code
❌ Hard to maintain
❌ Inconsistent behavior

### The Solution with `builder.watch()`

When you use `builder.watch()`, you declare what should happen when properties change:

```javascript
// Create builder with watcher
const counter = reactive({ count: 0 })
  .watch({
    count(newValue, oldValue) {
      console.log(`Count changed: ${oldValue} → ${newValue}`);
    }
  })
  .build();

// Update state - watcher fires automatically
counter.count = 5;
// Automatically logs: "Count changed: 0 → 5"

counter.count = 10;
// Automatically logs: "Count changed: 5 → 10"

// Works everywhere, every time!
counter.count++;
// Automatically logs: "Count changed: 10 → 11"
```

**What Just Happened?**

```
Watcher Pattern:
┌─────────────────────┐
│ State + Watcher     │
│  count: 0           │
│  watch: count →     │
│    log changes      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update value        │
│  count = 5          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Watcher auto-fires  │
│  log(0 → 5)         │ ← Automatic!
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update again        │
│  count = 10         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Watcher auto-fires  │
│  log(5 → 10)        │ ← Always works!
└─────────────────────┘
```

With `builder.watch()`:
- Declare once, runs automatically
- Never forget side effects
- Previous value tracked automatically
- Centralized logic
- Consistent behavior
- Clean, declarative code

**Benefits:**
✅ Automatic change detection
✅ Previous and new values provided
✅ Centralized side effect logic
✅ Never forget to run callbacks
✅ Chainable with other builder methods
✅ Clean, declarative syntax

 

## Mental Model

Think of `builder.watch()` like **motion-sensor lights**:

```
Manual Approach (Wall Switch):
┌─────────────────────┐
│  Room               │
│                     │
│  [Dark]             │
└─────────────────────┘
        │
   Someone enters
        │
        ▼
┌─────────────────────┐
│  Remember to flip   │
│  the switch!        │  ← Manual!
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Room               │
│  [Lit] 💡          │
└─────────────────────┘
        │
   Someone leaves
        │
        ▼
┌─────────────────────┐
│  Remember to flip   │
│  the switch!        │  ← Easy to forget!
└─────────────────────┘

Watcher Approach (Motion Sensor):
┌─────────────────────┐
│  Room + Sensor      │
│  [Dark] 👁️          │
│  watch: motion →    │
│    turn on light    │
└─────────────────────┘
        │
   Someone enters
        │
        ▼
┌─────────────────────┐
│  Sensor detects!    │
│  Auto-turn on 💡    │ ← Automatic!
└─────────────────────┘
        │
   Someone leaves
        │
        ▼
┌─────────────────────┐
│  Sensor detects!    │
│  Auto-turn off      │ ← Always works!
└─────────────────────┘
```

**Key Insight:** Just like motion sensors automatically turn lights on/off when they detect movement, watchers automatically run your callbacks when they detect property changes. You set them up once, and they work consistently forever!

 

## How Does It Work?

### The Magic: Property-Specific Callbacks

When you call `builder.watch()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = reactive({ count: 0 })
  .watch({
    count(newValue, oldValue) {
      console.log(`Count: ${oldValue} → ${newValue}`);
    }
  })
  .build();

// What actually happens (simplified):
// 1. Builder receives watch definitions
builder.watch({
  count(newValue, oldValue) { /* ... */ }
});

// 2. For each property to watch:
watch(
  // Function that reads the property to watch
  () => state.count,

  // Callback to run when it changes
  (newValue, oldValue) => {
    console.log(`Count: ${oldValue} → ${newValue}`);
  }
);

// 3. The reactive system:
//    - Tracks when count is read
//    - Detects when count is written
//    - Calls your callback with (new, old)

// 4. When counter.count = 5:
//    - Reactive system detects the change
//    - Stores old value: 0
//    - Applies new value: 5
//    - Calls callback(5, 0)
```

**In other words:** `builder.watch()`:
1. Takes your watcher definitions
2. For each property, sets up a reactive watcher
3. The watcher monitors that specific property
4. When the property changes, the callback runs
5. Callback receives new and old values
6. Returns the builder for chaining

### Under the Hood

```
.watch({ count(newVal, oldVal) { console.log(...) } })
        │
        ▼
┌───────────────────────┐
│  Parse Definitions    │
│  count: callback      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Create Watcher       │
│  for 'count' property │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Store Cleanup        │
│  (for later destroy)  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return Builder       │
│  (for chaining)       │
└───────────────────────┘
```

**What happens when a property changes:**

1️⃣ You **write** to the property: `counter.count = 5`
2️⃣ Reactive system **captures old value**: `0`
3️⃣ Reactive system **applies new value**: `5`
4️⃣ Reactive system **calls watcher**: `callback(5, 0)`
5️⃣ Your callback **runs** with both values
6️⃣ You can **perform side effects** in the callback

 

## Basic Usage

### Watching a Single Property

The simplest way to use `builder.watch()`:

```js
// Create builder with one watcher
const counter = reactive({ count: 0 })
  .watch({
    count(newValue, oldValue) {
      console.log(`Count changed from ${oldValue} to ${newValue}`);
    }
  })
  .build();

// Update state - watcher fires
counter.count = 5;
// Logs: "Count changed from 0 to 5"

counter.count = 10;
// Logs: "Count changed from 5 to 10"
```

### Watching Multiple Properties

Watch multiple properties in one call:

```js
const user = reactive({
  name: 'John',
  age: 25,
  email: 'john@example.com'
})
  .watch({
    name(newValue, oldValue) {
      console.log(`Name: ${oldValue} → ${newValue}`);
    },
    age(newValue, oldValue) {
      console.log(`Age: ${oldValue} → ${newValue}`);
    },
    email(newValue, oldValue) {
      console.log(`Email: ${oldValue} → ${newValue}`);
    }
  })
  .build();

user.name = 'Jane';
// Logs: "Name: John → Jane"

user.age = 26;
// Logs: "Age: 25 → 26"
```

### Accessing Other State Properties

Watchers can access other state properties via `this.state`:

```js
const app = reactive({ count: 0, multiplier: 2 })
  .watch({
    count(newValue, oldValue) {
      console.log(`Count: ${oldValue} → ${newValue}`);
      console.log(`Multiplied: ${newValue * this.state.multiplier}`);
    }
  })
  .build();

app.count = 5;
// Logs: "Count: 0 → 5"
// Logs: "Multiplied: 10"
```

 

## Multiple Watchers

### Calling .watch() Multiple Times

You can call `.watch()` multiple times to add watchers incrementally:

```js
const builder = reactive({ count: 0, name: 'Counter' })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  })
  .watch({
    name(newVal, oldVal) {
      console.log(`Name: ${oldVal} → ${newVal}`);
    }
  });

const counter = builder.build();

counter.count = 5;
// Logs: "Count: 0 → 5"

counter.name = 'My Counter';
// Logs: "Name: Counter → My Counter"
```

### Multiple Watchers on Same Property

You can add multiple watchers to the same property:

```js
const counter = reactive({ count: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log('Watcher 1:', newVal);
    }
  })
  .watch({
    count(newVal, oldVal) {
      console.log('Watcher 2:', newVal);
    }
  })
  .build();

counter.count = 5;
// Logs: "Watcher 1: 5"
// Logs: "Watcher 2: 5"
```

 

## Watching Computed Properties

You can watch computed properties just like regular properties:

```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    // Watch the computed property
    doubled(newVal, oldVal) {
      console.log(`Doubled changed: ${oldVal} → ${newVal}`);
    }
  })
  .build();

counter.count = 5;
// Logs: "Doubled changed: 0 → 10"

counter.count = 10;
// Logs: "Doubled changed: 10 → 20"
```

### Watching Multiple Computed Properties

```js
const calculator = reactive({ a: 5, b: 3 })
  .computed({
    sum() {
      return this.state.a + this.state.b;
    },
    product() {
      return this.state.a * this.state.b;
    }
  })
  .watch({
    sum(newVal, oldVal) {
      console.log(`Sum: ${oldVal} → ${newVal}`);
    },
    product(newVal, oldVal) {
      console.log(`Product: ${oldVal} → ${newVal}`);
    }
  })
  .build();

calculator.a = 10;
// Logs: "Sum: 8 → 13"
// Logs: "Product: 15 → 30"
```

 

## Chaining with Other Methods

### Combining with Computed

```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    count(newVal) {
      console.log('Count changed to:', newVal);
    },
    doubled(newVal) {
      console.log('Doubled changed to:', newVal);
    }
  })
  .build();

counter.count = 5;
// Logs: "Count changed to: 5"
// Logs: "Doubled changed to: 10"
```

### Combining with Actions

```js
const counter = reactive({ count: 0, changes: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
      // Track number of changes
      this.state.changes++;
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

counter.increment();
// Logs: "Count: 0 → 1"
console.log(counter.changes); // 1

counter.increment();
// Logs: "Count: 1 → 2"
console.log(counter.changes); // 2
```

### Full Chain Example

```js
const app = reactive({ count: 0, maxReached: false })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    count(newVal) {
      if (newVal >= 10) {
        this.state.maxReached = true;
        console.warn('Maximum count reached!');
      }
    }
  })
  .action('increment', (state) => {
    if (!state.maxReached) {
      state.count++;
    }
  })
  .build();

// Increment until max
for (let i = 0; i < 12; i++) {
  app.increment();
}
// Logs warning at count = 10
// Stops incrementing after max reached
```

 

## Common Patterns

### Pattern: Validation

```js
const form = reactive({
  email: '',
  emailError: null
})
  .watch({
    email(newValue) {
      // Validate on every change
      if (!newValue.includes('@')) {
        this.state.emailError = 'Invalid email';
      } else {
        this.state.emailError = null;
      }
    }
  })
  .build();

form.email = 'invalid';
console.log(form.emailError); // "Invalid email"

form.email = 'valid@example.com';
console.log(form.emailError); // null
```

### Pattern: Logging and Analytics

```js
const app = reactive({ page: 'home', user: null })
  .watch({
    page(newPage, oldPage) {
      // Track page views
      console.log(`Navigation: ${oldPage} → ${newPage}`);
      analytics.track('page_view', { page: newPage });
    },
    user(newUser, oldUser) {
      if (newUser && !oldUser) {
        console.log('User logged in:', newUser.name);
        analytics.identify(newUser.id);
      } else if (!newUser && oldUser) {
        console.log('User logged out');
        analytics.reset();
      }
    }
  })
  .build();

app.page = 'dashboard';
// Logs: "Navigation: home → dashboard"
// Sends analytics event
```

### Pattern: Persistence

```js
const settings = reactive({
  theme: 'light',
  language: 'en',
  notifications: true
})
  .watch({
    theme(newValue) {
      localStorage.setItem('theme', newValue);
      document.body.className = `theme-${newValue}`;
    },
    language(newValue) {
      localStorage.setItem('language', newValue);
      i18n.setLocale(newValue);
    },
    notifications(newValue) {
      localStorage.setItem('notifications', newValue);
    }
  })
  .build();

settings.theme = 'dark';
// Saves to localStorage
// Updates document body class
```

### Pattern: Derived State Synchronization

```js
const app = reactive({
  items: [],
  itemCount: 0,
  isEmpty: true
})
  .watch({
    items(newItems) {
      // Sync derived state
      this.state.itemCount = newItems.length;
      this.state.isEmpty = newItems.length === 0;
    }
  })
  .build();

app.items.push('Item 1');
console.log(app.itemCount); // 1
console.log(app.isEmpty);   // false

app.items = [];
console.log(app.itemCount); // 0
console.log(app.isEmpty);   // true
```

### Pattern: Conditional Side Effects

```js
const counter = reactive({ count: 0, debug: false })
  .watch({
    count(newVal, oldVal) {
      // Only log if debug mode is on
      if (this.state.debug) {
        console.log(`[DEBUG] Count: ${oldVal} → ${newVal}`);
      }

      // Always check thresholds
      if (newVal > 100) {
        console.warn('Count exceeded 100!');
      }
    }
  })
  .build();

counter.debug = true;
counter.count = 5;
// Logs: "[DEBUG] Count: 0 → 5"

counter.count = 101;
// Logs: "[DEBUG] Count: 5 → 101"
// Logs: "Count exceeded 100!"
```

### Pattern: Cross-Property Updates

```js
const app = reactive({
  celsius: 0,
  fahrenheit: 32,
  updatingFromCelsius: false
})
  .watch({
    celsius(newVal) {
      if (!this.state.updatingFromCelsius) {
        this.state.fahrenheit = (newVal * 9/5) + 32;
      }
    },
    fahrenheit(newVal) {
      this.state.updatingFromCelsius = true;
      this.state.celsius = (newVal - 32) * 5/9;
      this.state.updatingFromCelsius = false;
    }
  })
  .build();

app.celsius = 100;
console.log(app.fahrenheit); // 212

app.fahrenheit = 32;
console.log(app.celsius);    // 0
```

 

## Common Pitfalls

### Pitfall #1: Parameter Order Confusion

❌ **Wrong:**
```js
reactive({ count: 0 })
  .watch({
    count(oldValue, newValue) { // Wrong order!
      console.log(`From ${oldValue} to ${newValue}`);
    }
  })
  .build();
```

The parameters are **newValue first**, then oldValue.

✅ **Correct:**
```js
reactive({ count: 0 })
  .watch({
    count(newValue, oldValue) { // Correct order!
      console.log(`From ${oldValue} to ${newValue}`);
    }
  })
  .build();
```

 

### Pitfall #2: Infinite Loops

❌ **Wrong:**
```js
reactive({ count: 0 })
  .watch({
    count(newValue) {
      // This triggers the watcher again!
      this.state.count = newValue + 1; // Infinite loop!
    }
  })
  .build();
```

Modifying the same property in its own watcher creates an infinite loop.

✅ **Correct:**
```js
reactive({ count: 0, doubled: 0 })
  .watch({
    count(newValue) {
      // Update a different property
      this.state.doubled = newValue * 2; // Safe!
    }
  })
  .build();
```

Or use a guard:

```js
reactive({ count: 0 })
  .watch({
    count(newValue, oldValue) {
      // Only update if needed
      if (newValue > 100 && oldValue <= 100) {
        this.state.count = 100; // Only runs once
      }
    }
  })
  .build();
```

 

### Pitfall #3: Using Arrow Functions

❌ **Wrong:**
```js
reactive({ count: 0, multiplier: 2 })
  .watch({
    // Arrow function - 'this' won't work!
    count: (newVal) => {
      console.log(this.state.multiplier); // undefined!
    }
  })
  .build();
```

✅ **Correct:**
```js
reactive({ count: 0, multiplier: 2 })
  .watch({
    // Regular function - 'this' works!
    count(newVal) {
      console.log(this.state.multiplier); // 2
    }
  })
  .build();
```

 

### Pitfall #4: Expecting Immediate Execution

❌ **Wrong Expectation:**
```js
const counter = reactive({ count: 0 })
  .watch({
    count(newVal) {
      console.log('Count changed:', newVal);
    }
  })
  .build();

// Expecting it to log immediately
// Nothing logged yet! Watcher only fires on changes.
```

Watchers only fire when the property **changes**, not on initial setup.

✅ **Correct Understanding:**
```js
const counter = reactive({ count: 0 })
  .watch({
    count(newVal) {
      console.log('Count changed:', newVal);
    }
  })
  .build();

// Now change the property
counter.count = 5;
// Logs: "Count changed: 5"
```

If you need immediate execution:

```js
const counter = reactive({ count: 0 })
  .watch({
    count(newVal) {
      console.log('Count:', newVal);
    }
  })
  .build();

// Manually call for initial state
console.log('Count:', counter.count); // Log initial value
```

 

### Pitfall #5: Forgetting this.state

❌ **Wrong:**
```js
reactive({ count: 0, max: 10 })
  .watch({
    count(newVal) {
      if (newVal > this.max) { // undefined!
        console.log('Over max!');
      }
    }
  })
  .build();
```

Other state properties are on `this.state`, not directly on `this`.

✅ **Correct:**
```js
reactive({ count: 0, max: 10 })
  .watch({
    count(newVal) {
      if (newVal > this.state.max) { // Correct!
        console.log('Over max!');
      }
    }
  })
  .build();
```

 

## Summary

**What is `builder.watch()`?**

`builder.watch()` is a **builder method** that adds watchers to specific properties. Watchers automatically run callbacks when those properties change, receiving both new and old values.

 

**Why use `builder.watch()`?**

- Run side effects when specific properties change
- Get both new and old values automatically
- Centralize change-handling logic
- Never forget to handle changes
- Chainable with other builder methods

 

**Key Points to Remember:**

1️⃣ **Parameters: new, then old** - Callback receives `(newValue, oldValue)`
2️⃣ **Use regular functions** - Not arrow functions (need `this` binding)
3️⃣ **Access via this.state** - Other properties are on `this.state`
4️⃣ **Watch fires on change** - Not on initial setup
5️⃣ **Avoid infinite loops** - Don't modify the watched property in its own watcher

 

**Mental Model:** Think of `builder.watch()` as **motion-sensor lights** - they automatically respond when they detect changes, running your callback every time without you having to remember.

 

**Quick Reference:**

```js
// WATCH SINGLE PROPERTY
const obj = reactive({ count: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`${oldVal} → ${newVal}`);
    }
  })
  .build();

// WATCH MULTIPLE PROPERTIES
const obj = reactive({ a: 1, b: 2 })
  .watch({
    a(newVal) { console.log('A:', newVal); },
    b(newVal) { console.log('B:', newVal); }
  })
  .build();

// ACCESS OTHER STATE
const obj = reactive({ count: 0, max: 10 })
  .watch({
    count(newVal) {
      if (newVal > this.state.max) {
        console.log('Over max!');
      }
    }
  })
  .build();

// WATCH COMPUTED PROPERTIES
const obj = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .watch({ doubled(newVal) { console.log('Doubled:', newVal); } })
  .build();

// CHAIN WITH OTHER METHODS
const obj = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .watch({ count(n) { console.log(n); } })
  .action('inc', (state) => state.count++)
  .build();
```

 

**Remember:** `builder.watch()` lets you respond automatically to specific property changes with both new and old values at your fingertips. Set it up once, and it works reliably every time the property changes!
