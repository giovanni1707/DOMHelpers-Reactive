# Understanding `builder.effect(fn)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to run side effects that automatically track dependencies? Use `builder.effect()`:

```js
// Create a reactive builder and add effects
const counter = reactive({ count: 0, multiplier: 2 })
  .effect(() => {
    // This effect automatically tracks count and multiplier
    console.log(`Count is ${counter.state.count}`);
    console.log(`Multiplied: ${counter.state.count * counter.state.multiplier}`);
  })
  .build();

// Effect runs immediately on creation
// Logs: "Count is 0"
// Logs: "Multiplied: 0"

// Update state - effect re-runs automatically
counter.count = 5;
// Logs: "Count is 5"
// Logs: "Multiplied: 10"

counter.multiplier = 3;
// Logs: "Count is 5"
// Logs: "Multiplied: 15"
```

**That's it!** `builder.effect()` adds a side effect that runs immediately and re-runs whenever any state it accesses changes!

 

## What is `builder.effect()`?

`builder.effect()` is a **builder method** that adds **reactive effects** to your builder. An effect is a function that runs immediately and automatically re-runs whenever any reactive state it accesses changes.

**An effect:**
- Runs immediately when added
- Automatically tracks which state properties it reads
- Re-runs automatically when any dependency changes
- Is useful for side effects like DOM updates, logging, API calls
- Can access state via the builder's `state` property or the built object

Think of it as **automatic side effects** - you write the code once, and it automatically re-runs whenever the data it depends on changes.

 

## Syntax

```js
// Add an effect to a builder
builder.effect(function)

// Full example
const builder = reactive({ count: 0 });

builder.effect(() => {
  console.log('Count is:', builder.state.count);
});

const counter = builder.build();
```

**Parameters:**
- `function` - A function containing side effects
  - Runs immediately
  - Automatically tracks reactive dependencies
  - Re-runs when dependencies change

**Returns:**
- The builder (for method chaining)

**Important:**
- Effect runs **immediately** when added
- Effect **tracks dependencies** automatically
- Access state via `builder.state` (during building) or the built object name
- Can use arrow functions or regular functions
- The builder is returned, so you can chain more methods

 

## Why Does This Exist?

### The Problem with Manual Side Effects

Let's say you want to update the DOM whenever state changes:

```javascript
// Create reactive state
const app = state({ count: 0 });

// Manually update DOM
function updateDOM() {
  document.getElementById('display').textContent = app.count;
}

// Initial update
updateDOM();

// Update state
app.count = 5;
// Oops! Must remember to update DOM manually
updateDOM();

// Update again
app.count = 10;
// Forgot to call updateDOM()! DOM is out of sync ❌
```

This approach has several challenges:

**What's the Real Issue?**

```
Manual Side Effects:
┌─────────────────┐
│ State           │
│  count: 0       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Update DOM      │
│ manually        │  ← Must remember!
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Update state    │
│  count = 5      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Update DOM      │
│ manually        │  ← Must remember again!
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Update state    │
│  count = 10     │
└─────────────────┘
        │
        ▼
   Forgot to update! ❌
   DOM out of sync! ❌
```

**Problems:**
❌ Must manually call side effects after every state change
❌ Easy to forget
❌ Side effects scattered throughout code
❌ Hard to track which side effects need to run
❌ Leads to bugs and inconsistencies
❌ Not scalable

### The Solution with `builder.effect()`

When you use `builder.effect()`, you declare side effects that run automatically:

```javascript
// Create builder with effect
const builder = reactive({ count: 0 });

builder.effect(() => {
  // This runs immediately AND whenever count changes
  document.getElementById('display').textContent = builder.state.count;
});

const counter = builder.build();

// Effect already ran once on creation
// DOM shows: 0

// Update state - effect re-runs automatically
counter.count = 5;
// DOM automatically updates to: 5

counter.count = 10;
// DOM automatically updates to: 10

// No manual calls needed!
```

**What Just Happened?**

```
Automatic Effect Pattern:
┌─────────────────────┐
│ State + Effect      │
│  count: 0           │
│  effect: () =>      │
│    update DOM       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Effect runs         │
│ immediately         │
│  DOM ← 0            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update state        │
│  count = 5          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Effect auto-reruns  │
│  DOM ← 5            │ ← Automatic!
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update state        │
│  count = 10         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Effect auto-reruns  │
│  DOM ← 10           │ ← Always works!
└─────────────────────┘
```

With `builder.effect()`:
- Declare once, runs automatically
- Never forget side effects
- Tracks dependencies automatically
- Runs immediately on setup
- Consistent behavior
- Clean, declarative code

**Benefits:**
✅ Automatic dependency tracking
✅ Runs immediately on creation
✅ Re-runs automatically on changes
✅ Never forget to update
✅ Chainable with other builder methods
✅ Centralized side effect logic

 

## Mental Model

Think of `builder.effect()` like **a smart thermostat**:

```
Manual Approach (Check Thermometer):
┌─────────────────────┐
│  Room               │
│  Temperature: 20°C  │
└─────────────────────┘
        │
   You check thermometer
        │
        ▼
┌─────────────────────┐
│  Too cold!          │
│  Turn on heater     │  ← Manual action
└─────────────────────┘
        │
   Temperature changes
        │
        ▼
┌─────────────────────┐
│  Check again        │
│  Adjust heater      │  ← Must remember!
└─────────────────────┘
        │
   Temperature changes
        │
        ▼
   Forgot to check! ❌
   Room uncomfortable ❌

Smart Thermostat (Automatic):
┌─────────────────────┐
│  Room + Thermostat  │
│  Temperature: 20°C  │
│  effect: () =>      │
│    if temp < 21°C   │
│      turn on heater │
└──────────┬──────────┘
           │
   Checks immediately
           │
           ▼
┌─────────────────────┐
│  Too cold!          │
│  Auto-heat          │ ← Automatic!
└─────────────────────┘
           │
   Temperature changes
           │
           ▼
┌─────────────────────┐
│  Auto-adjusts       │ ← Always works!
└─────────────────────┘
```

**Key Insight:** Just like a smart thermostat continuously monitors temperature and automatically adjusts heating, effects continuously monitor reactive state and automatically run side effects when dependencies change!

 

## How Does It Work?

### The Magic: Automatic Dependency Tracking

When you call `builder.effect()`, here's what happens behind the scenes:

```javascript
// What you write:
const builder = reactive({ count: 0 });

builder.effect(() => {
  console.log('Count is:', builder.state.count);
});

const counter = builder.build();

// What actually happens (simplified):
// 1. Effect is added to the builder
builder.effect(() => {
  console.log('Count is:', builder.state.count);
});

// 2. Effect runs immediately:
//    - Tracks that it reads builder.state.count
//    - Registers as a dependency of 'count'
//    - Logs: "Count is: 0"

// 3. Dependency map is created:
//    count → [this effect, ...]

// 4. When counter.count = 5:
//    - Reactive system detects write to 'count'
//    - Finds all effects depending on 'count'
//    - Re-runs those effects
//    - Logs: "Count is: 5"

// 5. Cleanup function stored for later:
//    - When counter.destroy() is called
//    - All effects are cleaned up
```

**In other words:** `builder.effect()`:
1. Takes your effect function
2. Runs it immediately
3. Tracks which state properties it reads
4. Registers the effect as a dependency of those properties
5. Re-runs the effect when any dependency changes
6. Stores cleanup function for destruction
7. Returns the builder for chaining

### Under the Hood

```
.effect(() => { console.log(builder.state.count); })
        │
        ▼
┌───────────────────────┐
│  Create Effect        │
│  Store function       │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Run Immediately      │
│  Track dependencies   │
│  count is read        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Register Effect      │
│  count → [effect]     │
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

**What happens when dependencies change:**

1️⃣ You **write** to a property: `counter.count = 5`
2️⃣ Reactive system **finds all effects** that depend on `count`
3️⃣ Each effect **re-runs automatically**
4️⃣ During re-run, **dependencies are re-tracked** (they can change)
5️⃣ Side effects **execute** (DOM updates, logs, etc.)
6️⃣ System **waits** for next change

 

## Basic Usage

### Adding a Single Effect

The simplest way to use `builder.effect()`:

```js
// Create builder with one effect
const builder = reactive({ count: 0 });

builder.effect(() => {
  console.log('Count is:', builder.state.count);
});
// Logs immediately: "Count is: 0"

const counter = builder.build();

// Update state - effect re-runs
counter.count = 5;
// Logs: "Count is: 5"

counter.count = 10;
// Logs: "Count is: 10"
```

### Effect with Multiple Dependencies

Effects automatically track all state properties they read:

```js
const builder = reactive({ count: 0, multiplier: 2 });

builder.effect(() => {
  // Automatically tracks both count and multiplier
  const result = builder.state.count * builder.state.multiplier;
  console.log(`${builder.state.count} × ${builder.state.multiplier} = ${result}`);
});
// Logs: "0 × 2 = 0"

const calculator = builder.build();

calculator.count = 5;
// Logs: "5 × 2 = 10"

calculator.multiplier = 3;
// Logs: "5 × 3 = 15"
```

### Effect with DOM Updates

```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // Update DOM automatically
  document.getElementById('counter').textContent = builder.state.count;
});

const counter = builder.build();

// DOM shows: 0

counter.count = 5;
// DOM automatically updates to: 5
```

 

## Multiple Effects

### Adding Multiple Effects

You can call `.effect()` multiple times:

```js
const builder = reactive({ count: 0 });

// First effect
builder.effect(() => {
  console.log('Effect 1: Count is', builder.state.count);
});

// Second effect
builder.effect(() => {
  console.log('Effect 2: Count doubled is', builder.state.count * 2);
});

// Both effects run immediately
// Logs: "Effect 1: Count is 0"
// Logs: "Effect 2: Count doubled is 0"

const counter = builder.build();

counter.count = 5;
// Both effects re-run
// Logs: "Effect 1: Count is 5"
// Logs: "Effect 2: Count doubled is 10"
```

### Chaining Multiple Effects

```js
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.state.count);
  })
  .effect(() => {
    document.title = `Count: ${counter.state.count}`;
  })
  .effect(() => {
    localStorage.setItem('count', counter.state.count);
  })
  .build();

// All three effects run on every count change
counter.count = 5;
// Logs to console
// Updates document title
// Saves to localStorage
```

 

## Effect Dependencies

### Automatic Dependency Tracking

Effects automatically track which properties they read:

```js
const builder = reactive({
  firstName: 'John',
  lastName: 'Doe',
  age: 25
});

builder.effect(() => {
  // This effect only depends on firstName and lastName
  // (It doesn't read age, so age changes won't trigger it)
  console.log('Name:', builder.state.firstName, builder.state.lastName);
});

const user = builder.build();

user.firstName = 'Jane';
// Logs: "Name: Jane Doe" ✅

user.age = 26;
// Effect doesn't run (doesn't depend on age) ✅
```

### Dynamic Dependencies

Dependencies are tracked each time the effect runs, so they can change:

```js
const builder = reactive({ showDetails: false, name: 'John', age: 25 });

builder.effect(() => {
  console.log('Name:', builder.state.name);

  if (builder.state.showDetails) {
    // Age is only tracked when showDetails is true
    console.log('Age:', builder.state.age);
  }
});
// Logs: "Name: John"

const user = builder.build();

// When showDetails is false, age changes don't trigger effect
user.age = 26;
// Effect doesn't run ✅

// Enable details
user.showDetails = true;
// Logs: "Name: John"
// Logs: "Age: 26"

// Now age changes trigger the effect
user.age = 27;
// Logs: "Name: John"
// Logs: "Age: 27"
```

### Conditional Effects

```js
const builder = reactive({ count: 0, enabled: true });

builder.effect(() => {
  if (builder.state.enabled) {
    console.log('Count:', builder.state.count);
  }
});

const app = builder.build();

app.count = 5;
// Logs: "Count: 5"

app.enabled = false;
// Effect runs but doesn't log

app.count = 10;
// Effect runs but still doesn't log (enabled is false)

app.enabled = true;
// Logs: "Count: 10"
```

 

## builder.effect() vs builder.watch()

Both run side effects, but they work differently:

### When to Use `builder.effect()`

Use `builder.effect()` when you need **automatic dependency tracking**:

✅ Multiple dependencies
✅ Dynamic dependencies
✅ Runs immediately
✅ Don't need old values

```js
const app = reactive({ a: 1, b: 2, c: 3 })
  .effect(() => {
    // Automatically tracks a, b, and c
    const sum = app.state.a + app.state.b + app.state.c;
    console.log('Sum:', sum);
  })
  .build();
```

### When to Use `builder.watch()`

Use `builder.watch()` when you need **specific property watching**:

✅ Watch specific properties
✅ Need both new and old values
✅ Don't need it to run immediately
✅ Explicit dependencies

```js
const app = reactive({ count: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count changed: ${oldVal} → ${newVal}`);
    }
  })
  .build();
```

### Quick Comparison

```javascript
// ✅ builder.effect() - Automatic tracking
const obj1 = reactive({ a: 1, b: 2 })
  .effect(() => {
    // Tracks whatever it reads
    console.log(obj1.state.a + obj1.state.b);
  })
  .build();

// ✅ builder.watch() - Explicit property
const obj2 = reactive({ a: 1, b: 2 })
  .watch({
    // Only watches 'a'
    a(newVal, oldVal) {
      console.log(`A: ${oldVal} → ${newVal}`);
    }
  })
  .build();
```

**Simple Rule:**
- **Need automatic multi-property tracking?** Use `effect()`
- **Need to watch a specific property?** Use `watch()`
- **Need old values?** Use `watch()`
- **Need it to run immediately?** Use `effect()`

 

## Chaining with Other Methods

### Combining with Computed

```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .effect(() => {
    // Effect can use computed properties
    console.log('Doubled:', counter.state.doubled);
  })
  .build();

// Logs: "Doubled: 0"
counter.count = 5;
// Logs: "Doubled: 10"
```

### Combining with Watch

```js
const app = reactive({ count: 0, name: 'Counter' })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  })
  .effect(() => {
    console.log(`${app.state.name}: ${app.state.count}`);
  })
  .build();

app.count = 5;
// Logs: "Count: 0 → 5" (from watch)
// Logs: "Counter: 5" (from effect)
```

### Combining with Actions

```js
const counter = reactive({ count: 0, lastAction: null })
  .effect(() => {
    console.log('Count is now:', counter.state.count);
  })
  .action('increment', (state) => {
    state.count++;
    state.lastAction = 'increment';
  })
  .action('decrement', (state) => {
    state.count--;
    state.lastAction = 'decrement';
  })
  .build();

// Logs: "Count is now: 0"

counter.increment();
// Logs: "Count is now: 1"

counter.decrement();
// Logs: "Count is now: 0"
```

### Full Chain Example

```js
const app = reactive({ count: 0, threshold: 10 })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    isOverThreshold() {
      return this.state.count > this.state.threshold;
    }
  })
  .watch({
    count(newVal) {
      if (newVal > this.state.threshold) {
        console.warn('Over threshold!');
      }
    }
  })
  .effect(() => {
    document.getElementById('count').textContent = app.state.count;
    document.getElementById('doubled').textContent = app.state.doubled;
  })
  .action('increment', (state) => state.count++)
  .action('decrement', (state) => state.count--)
  .build();

// Effect runs immediately, updates DOM
app.increment();
// Watcher checks threshold
// Effect updates DOM
```

 

## Common Patterns

### Pattern: DOM Synchronization

```js
const app = reactive({
  count: 0,
  message: 'Hello'
})
  .effect(() => {
    document.getElementById('count').textContent = app.state.count;
  })
  .effect(() => {
    document.getElementById('message').textContent = app.state.message;
  })
  .build();

app.count = 5;
// DOM automatically updates

app.message = 'Hi there!';
// DOM automatically updates
```

### Pattern: Logging and Debugging

```js
const app = reactive({ count: 0, user: null })
  .effect(() => {
    console.log('[DEBUG] State:', {
      count: app.state.count,
      user: app.state.user
    });
  })
  .build();

// Logs state on every change
app.count = 5;
app.user = { name: 'John' };
```

### Pattern: Persistence

```js
const settings = reactive({
  theme: 'light',
  language: 'en'
})
  .effect(() => {
    // Auto-save to localStorage
    localStorage.setItem('settings', JSON.stringify({
      theme: settings.state.theme,
      language: settings.state.language
    }));
  })
  .build();

settings.theme = 'dark';
// Automatically saved to localStorage
```

### Pattern: Conditional Side Effects

```js
const app = reactive({ count: 0, debug: false })
  .effect(() => {
    if (app.state.debug) {
      console.log('[DEBUG] Count:', app.state.count);
    }
  })
  .build();

app.count = 5;
// No log (debug is false)

app.debug = true;
// Logs: "[DEBUG] Count: 5"

app.count = 10;
// Logs: "[DEBUG] Count: 10"
```

### Pattern: Derived DOM Updates

```js
const cart = reactive({
  items: [],
  taxRate: 0.1
})
  .effect(() => {
    const subtotal = cart.state.items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * cart.state.taxRate;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
  })
  .build();

cart.items.push({ name: 'Item 1', price: 10 });
// DOM automatically updates with new totals
```

### Pattern: API Calls on Changes

```js
const search = reactive({ query: '', results: [] })
  .effect(() => {
    if (search.state.query.length > 2) {
      // Auto-search when query changes
      fetch(`/api/search?q=${search.state.query}`)
        .then(res => res.json())
        .then(data => {
          search.state.results = data;
        });
    }
  })
  .build();

search.query = 'javascript';
// Automatically triggers search
```

 

## Common Pitfalls

### Pitfall #1: Infinite Loops

❌ **Wrong:**
```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // This modifies count, which triggers the effect again!
  builder.state.count++; // Infinite loop! ❌
});
```

Modifying reactive state inside an effect that depends on that state creates an infinite loop.

✅ **Correct:**
```js
const builder = reactive({ count: 0, doubled: 0 });

builder.effect(() => {
  // Update a different property
  builder.state.doubled = builder.state.count * 2; // Safe! ✅
});
```

Or use a guard:

```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // Only modify once
  if (builder.state.count === 0) {
    builder.state.count = 1; // Runs only once
  }
});
```

 

### Pitfall #2: Not Accessing State During Building

❌ **Wrong:**
```js
const counter = reactive({ count: 0 })
  .effect(() => {
    // Trying to access counter.count before building
    console.log(counter.count); // undefined!
  })
  .build();
```

During building, use `builder.state`, not the final object name.

✅ **Correct:**
```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // Access via builder.state
  console.log(builder.state.count); // Works!
});

const counter = builder.build();
```

Or reference the built object (but need to define variable first):

```js
let counter;
counter = reactive({ count: 0 })
  .effect(() => {
    console.log(counter.state.count); // Works!
  })
  .build();
```

 

### Pitfall #3: Expecting Effects to Not Run Immediately

❌ **Wrong Expectation:**
```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // Expecting this NOT to run immediately
  console.log('Count:', builder.state.count);
});
// It DOES run immediately! Logs: "Count: 0"
```

Effects **always run immediately** when added.

✅ **Correct Understanding:**
```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // This runs immediately AND on every change
  console.log('Count:', builder.state.count);
});
// Logs immediately: "Count: 0"

const counter = builder.build();

counter.count = 5;
// Logs again: "Count: 5"
```

 

### Pitfall #4: Side Effects Without State Access

❌ **Wrong:**
```js
reactive({ count: 0 })
  .effect(() => {
    // This doesn't access any state!
    console.log('Hello'); // Runs once, never again
  })
  .build();
```

If an effect doesn't read any reactive state, it won't re-run.

✅ **Correct:**
```js
const builder = reactive({ count: 0 });

builder.effect(() => {
  // Access state to create dependency
  console.log('Count:', builder.state.count);
  // Now it re-runs when count changes
});
```

 

### Pitfall #5: Async Effects Not Tracking Dependencies

⚠️ **Be Careful:**
```js
const builder = reactive({ userId: 1 });

builder.effect(async () => {
  // Dependencies are only tracked in the synchronous part
  const id = builder.state.userId; // ✅ Tracked

  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // This is async, but still works for assignment
  builder.state.user = data; // ✅ Works
});
```

Dependency tracking happens synchronously. Only state accessed before the first `await` is tracked.

✅ **Better Practice:**
```js
const builder = reactive({ userId: 1, user: null });

builder.effect(() => {
  // All tracking happens here (synchronously)
  const id = builder.state.userId;

  // Async operation
  fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => {
      builder.state.user = data;
    });
});
```

 

## Summary

**What is `builder.effect()`?**

`builder.effect()` is a **builder method** that adds reactive effects. Effects run immediately and automatically re-run when any reactive state they access changes.

 

**Why use `builder.effect()`?**

- Automatic side effects (DOM updates, logging, etc.)
- Runs immediately on setup
- Automatic dependency tracking
- Re-runs automatically on changes
- Chainable with other builder methods

 

**Key Points to Remember:**

1️⃣ **Runs immediately** - Effects execute right away when added
2️⃣ **Automatic tracking** - Dependencies are tracked automatically
3️⃣ **Re-runs on changes** - Automatically re-executes when dependencies change
4️⃣ **Access via builder.state** - During building, use `builder.state`
5️⃣ **Avoid infinite loops** - Don't modify dependencies inside effects

 

**Mental Model:** Think of `builder.effect()` as a **smart thermostat** - it continuously monitors reactive state and automatically runs side effects when anything it depends on changes!

 

**Quick Reference:**

```js
// SINGLE EFFECT
const builder = reactive({ count: 0 });

builder.effect(() => {
  console.log('Count:', builder.state.count);
});
// Runs immediately, re-runs on count changes

// MULTIPLE EFFECTS
const obj = reactive({ a: 1, b: 2 })
  .effect(() => console.log('A:', obj.state.a))
  .effect(() => console.log('B:', obj.state.b))
  .build();

// MULTIPLE DEPENDENCIES
const obj = reactive({ a: 1, b: 2 })
  .effect(() => {
    // Automatically tracks both a and b
    console.log('Sum:', obj.state.a + obj.state.b);
  })
  .build();

// WITH COMPUTED
const obj = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .effect(() => {
    console.log('Doubled:', obj.state.doubled);
  })
  .build();

// CHAIN WITH OTHER METHODS
const obj = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .watch({ count(n) { console.log('Watch:', n); } })
  .effect(() => console.log('Effect:', obj.state.count))
  .action('inc', (state) => state.count++)
  .build();
```

 

**Remember:** `builder.effect()` gives you automatic side effects that run immediately and stay synchronized with your reactive state. Write them once, and they work reliably forever!
