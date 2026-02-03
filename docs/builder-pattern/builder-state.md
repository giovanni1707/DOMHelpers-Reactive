# Understanding `builder.state` - A Beginner's Guide

## Quick Start (30 seconds)

Need to access your reactive state while building? Use `builder.state`:

```js
// Create a reactive builder
const builder = reactive({ count: 0, name: 'Counter' });

// Access state during building using builder.state
console.log(builder.state.count); // 0
console.log(builder.state.name);  // "Counter"

// Use builder.state in computed properties
builder.computed({
  doubled() {
    return this.state.count * 2; // Access via this.state
  }
});

// Build the final object
const counter = builder.build();

// After building, access directly
console.log(counter.count);   // 0
console.log(counter.doubled); // 0
```

**That's it!** `builder.state` gives you access to the reactive state while you're still building your object!

 

## What is `builder.state`?

`builder.state` is a **read-only property** on the reactive builder that provides **access to the underlying reactive state** during the building process.

**In simple terms:** When you create a reactive builder with `reactive()`, you get back a builder object - not the state itself. `builder.state` lets you peek inside and access the actual reactive state before calling `.build()`.

Think of it as a **window into your reactive state** while you're still constructing it - you can read values, use them in computations, or reference them in effects, all before the building process is complete.

 

## Syntax

```js
// Access state on the builder
builder.state

// Common usage patterns
const value = builder.state.propertyName
const computed = builder.state.someProperty * 2
```

**Access pattern:**
- `builder.state` - The reactive state object
- `builder.state.propertyName` - Specific property values

**Important:**
- `builder.state` is **read-only during building**
- After `.build()`, you access properties directly on the returned object
- Use `this.state` inside computed properties, watchers, and effects

 

## Why Does This Exist?

### The Problem with Direct Builder Access

When you create a reactive builder, what you get back is a **builder object**, not the state itself:

```javascript
// Create a builder
const builder = reactive({ count: 0, name: 'Counter' });

// What is 'builder'?
console.log(typeof builder); // "object"

// Try to access count directly
console.log(builder.count); // undefined ❌

// The builder is NOT the state!
// It's a construction tool with methods like .computed(), .action(), etc.
```

This creates a challenge. During the building process, you might need to:

❌ Read initial state values
❌ Use state in conditional logic
❌ Reference state in computed properties
❌ Access state in effects during setup

**What's the Real Issue?**

```
Without builder.state:
┌─────────────────┐
│ Builder Object  │
│  .computed()    │
│  .watch()       │
│  .effect()      │
│  .action()      │
│  .build()       │
└─────────────────┘
        │
        ▼
   Where's my state?
   How do I access it?
   Can't see my data!
```

**Problems:**
❌ State is hidden inside the builder
❌ Can't access values during construction
❌ Hard to write computed properties
❌ Can't reference state in setup logic
❌ Confusing developer experience

### The Solution with `builder.state`

When you use `builder.state`, you get a clear, direct reference to the reactive state:

```javascript
// Create a builder
const builder = reactive({ count: 0, name: 'Counter' });

// Access state through builder.state
console.log(builder.state.count); // 0 ✅
console.log(builder.state.name);  // "Counter" ✅

// Use it in computed properties
builder.computed({
  displayName() {
    return `${this.state.name}: ${this.state.count}`;
  }
});

// Use it in conditional logic
if (builder.state.count === 0) {
  builder.action('initialize', (state) => {
    state.count = 1;
  });
}
```

**What Just Happened?**

```
With builder.state:
┌─────────────────────┐
│ Builder Object      │
│  .state ──────────┐ │
│  .computed()      │ │
│  .watch()         │ │
│  .effect()        │ │
│  .build()         │ │
└───────────────────┼─┘
                    │
                    ▼
           ┌────────────────┐
           │ Reactive State │
           │  count: 0      │
           │  name: 'Ctr'   │
           └────────────────┘
             Clear access!
             Easy to use!
```

With `builder.state`:
- State is accessible during building
- Clear, explicit access pattern
- Easy to reference in computed properties
- Natural developer experience
- State remains separate from builder methods

**Benefits:**
✅ Clear separation: builder vs state
✅ Access state during construction
✅ Use state in computed/watch/effect definitions
✅ Conditional building based on state values
✅ Intuitive and predictable

 

## Mental Model

Think of `builder.state` like **looking through a window while construction is happening**:

```
Regular Construction (No Window):
┌─────────────────────────┐
│   CONSTRUCTION SITE     │
│   (Builder)             │
│                         │
│   🏗️  Building...       │
│                         │
│   [Walls up]            │
│   [No way to see in]    │
└─────────────────────────┘
     Can't see inside!
     Wait until done!

With builder.state (Window):
┌─────────────────────────┐
│   CONSTRUCTION SITE     │
│   (Builder)             │
│                         │
│   🏗️  Building...       │
│   ┌───────────┐         │
│   │  WINDOW   │ ← builder.state
│   │  👀       │         │
│   └───────────┘         │
│   You can see:          │
│   - Current state       │
│   - Values inside       │
│   - What's happening    │
└─────────────────────────┘
     See inside anytime!
     Make informed decisions!
```

**Key Insight:** Just like a window lets you see inside a building under construction without entering it, `builder.state` lets you see and access your reactive state while you're still building your reactive object.

 

## How Does It Work?

### The Magic: Reference to Internal State

When you call `reactive()`, here's what happens behind the scenes:

```javascript
// What you write:
const builder = reactive({ count: 0 });

// What actually happens (simplified):
function reactive(initialState) {
  // 1. Create reactive state
  const reactiveState = state(initialState);

  // 2. Create builder object
  const builder = {
    // Expose state as a property
    state: reactiveState,

    // Builder methods
    computed(defs) {
      // Use reactiveState internally
      addComputedProps(reactiveState, defs);
      return this; // Return builder for chaining
    },

    build() {
      // Return the state (not the builder)
      return reactiveState;
    }
  };

  return builder;
}
```

**In other words:** `builder.state` is a **reference to the reactive state** that exists inside the builder. It's not a copy - it's the actual reactive object that will be returned when you call `.build()`.

### Under the Hood

```
reactive({ count: 0 })
        │
        ▼
┌───────────────────────┐
│  Create reactive()    │
│  state({ count: 0 })  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Create Builder       │
│  {                    │
│    state: <ref>,  ←───┼─── This is builder.state
│    computed(),        │
│    build()            │
│  }                    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return Builder       │
│  (with .state ref)    │
└───────────────────────┘
```

**What happens:**

1️⃣ `reactive()` creates the reactive state using `state()`
2️⃣ Builder object is created with `state` property pointing to reactive state
3️⃣ You access `builder.state` to read/reference the reactive state
4️⃣ When you call `.build()`, it returns this same `state` object

**Important:** `builder.state` and the object returned by `.build()` are **the same object** - just accessed at different times!

 

## Basic Usage

### Accessing State Properties

The simplest way to use `builder.state` is to read properties:

```js
// Create builder with initial state
const builder = reactive({
  count: 0,
  name: 'My Counter',
  isActive: true
});

// Access properties through builder.state
console.log(builder.state.count);    // 0
console.log(builder.state.name);     // "My Counter"
console.log(builder.state.isActive); // true

// Use in expressions
const doubled = builder.state.count * 2;
const message = `${builder.state.name} is active: ${builder.state.isActive}`;
```

### Using in Conditional Logic

```js
const builder = reactive({
  count: 0,
  enableLogging: true
});

// Conditionally add features based on state
if (builder.state.enableLogging) {
  builder.effect(() => {
    console.log('Count changed:', builder.state.count);
  });
}

if (builder.state.count === 0) {
  builder.action('initialize', (state) => {
    state.count = 10;
  });
}
```

### Using in Method Definitions

Inside computed properties, watchers, and effects, use `this.state`:

```js
const builder = reactive({ count: 0, multiplier: 2 })
  .computed({
    // Inside computed, use this.state
    result() {
      return this.state.count * this.state.multiplier;
    }
  })
  .watch({
    count(newVal, oldVal) {
      // Access other state properties
      console.log(`Count changed from ${oldVal} to ${newVal}`);
      console.log(`Multiplier is: ${this.state.multiplier}`);
    }
  });
```

 

## Reading State During Building

### Pattern: Inspect Before Building

You can inspect state values before adding features:

```js
const builder = reactive({
  mode: 'development',
  count: 0
});

// Check state before deciding what to add
console.log('Mode:', builder.state.mode);

if (builder.state.mode === 'development') {
  // Add debugging features
  builder
    .effect(() => {
      console.log('[DEBUG] Count:', builder.state.count);
    })
    .action('debug', (state) => {
      console.log('[DEBUG] Full state:', state);
    });
}

const app = builder.build();
```

### Pattern: Dynamic Computed Based on State

```js
const builder = reactive({
  temperature: 20,
  unit: 'celsius'
});

// Add computed property based on current unit
builder.computed({
  display() {
    if (this.state.unit === 'celsius') {
      return `${this.state.temperature}°C`;
    } else {
      return `${this.state.temperature * 9/5 + 32}°F`;
    }
  }
});

const temp = builder.build();
console.log(temp.display); // "20°C"
```

### Pattern: Validation During Setup

```js
const builder = reactive({
  min: 0,
  max: 100,
  value: 50
});

// Validate initial state
if (builder.state.value < builder.state.min) {
  console.warn('Value below minimum, resetting');
  builder.state.value = builder.state.min;
}

if (builder.state.value > builder.state.max) {
  console.warn('Value above maximum, resetting');
  builder.state.value = builder.state.max;
}

// Add validation watcher
builder.watch({
  value(newVal) {
    if (newVal < this.state.min || newVal > this.state.max) {
      console.error('Value out of range!');
    }
  }
});
```

 

## When to Use builder.state

### Use `builder.state` When:

✅ **During building** - Accessing state before calling `.build()`

```js
const builder = reactive({ count: 0 });
console.log(builder.state.count); // ✅ During building
```

✅ **In conditional logic** - Deciding what features to add

```js
if (builder.state.debug) {
  builder.effect(() => console.log('Debug mode'));
}
```

✅ **Reading initial values** - Inspecting what you started with

```js
const initialCount = builder.state.count;
```

### Use `this.state` When:

✅ **Inside computed properties** - Accessing state in computations

```js
builder.computed({
  doubled() {
    return this.state.count * 2; // ✅ Use this.state
  }
});
```

✅ **Inside watchers** - Accessing state in watch callbacks

```js
builder.watch({
  count(newVal) {
    console.log(this.state.name); // ✅ Use this.state
  }
});
```

✅ **Inside effects** - Accessing state in effect functions

```js
builder.effect(() => {
  console.log(this.state.count); // ✅ Use this.state
});
```

### Don't Use After `.build()`:

❌ **After building** - Access properties directly on the built object

```js
const counter = builder.build();

// ❌ Wrong
console.log(counter.state.count);

// ✅ Correct
console.log(counter.count);
```

 

## builder.state vs Direct State Access

### During Building (Use builder.state)

When working with the builder **before calling `.build()`**, use `builder.state`:

```js
// ✅ During building - use builder.state
const builder = reactive({ count: 0 });

console.log(builder.state.count); // ✅ Correct
console.log(builder.count);       // ❌ undefined

// Use in conditional setup
if (builder.state.count === 0) {
  // Add features
}
```

### After Building (Direct Access)

After calling `.build()`, access properties directly:

```js
// ✅ After building - direct access
const builder = reactive({ count: 0 });
const counter = builder.build();

console.log(counter.count);       // ✅ Correct: 0
console.log(counter.state.count); // ❌ Wrong: undefined
```

### Inside Methods (Use this.state)

Inside computed, watch, and effect functions, use `this.state`:

```js
const builder = reactive({ count: 0 })
  .computed({
    doubled() {
      // ✅ Use this.state inside methods
      return this.state.count * 2;
    }
  });
```

### Quick Reference

```javascript
// DURING BUILDING
const builder = reactive({ count: 0 });
builder.state.count        // ✅ Correct

// INSIDE METHODS
builder.computed({
  doubled() {
    this.state.count       // ✅ Correct
  }
});

// AFTER BUILDING
const counter = builder.build();
counter.count              // ✅ Correct
counter.state.count        // ❌ Wrong
```

 

## Common Patterns

### Pattern: Inspect and Configure

```js
const config = reactive({
  environment: 'production',
  debugMode: false,
  apiUrl: 'https://api.example.com'
});

// Inspect initial configuration
console.log('Environment:', config.state.environment);
console.log('Debug mode:', config.state.debugMode);

// Configure based on environment
if (config.state.environment === 'development') {
  config.state.debugMode = true;
  config.state.apiUrl = 'http://localhost:3000';
}

// Add computed properties based on config
config.computed({
  isProduction() {
    return this.state.environment === 'production';
  },
  endpoint() {
    return `${this.state.apiUrl}/v1`;
  }
});

const app = config.build();
```

### Pattern: State-Based Feature Addition

```js
const builder = reactive({
  features: {
    logging: true,
    analytics: false,
    caching: true
  },
  count: 0
});

// Add features based on state
if (builder.state.features.logging) {
  builder.effect(() => {
    console.log('[LOG] Count:', builder.state.count);
  });
}

if (builder.state.features.analytics) {
  builder.effect(() => {
    // Send to analytics
    track('count_changed', builder.state.count);
  });
}

if (builder.state.features.caching) {
  builder.effect(() => {
    localStorage.setItem('count', builder.state.count);
  });
}

const app = builder.build();
```

### Pattern: Computed Property Dependencies

```js
const builder = reactive({
  firstName: 'John',
  lastName: 'Doe',
  title: 'Mr.'
});

// Use builder.state to inspect initial values
console.log('Initial name:', builder.state.firstName, builder.state.lastName);

// Add computed properties that depend on multiple state properties
builder.computed({
  fullName() {
    return `${this.state.firstName} ${this.state.lastName}`;
  },
  formalName() {
    return `${this.state.title} ${this.state.firstName} ${this.state.lastName}`;
  }
});

const person = builder.build();
console.log(person.fullName);   // "John Doe"
console.log(person.formalName); // "Mr. John Doe"
```

### Pattern: Initial Value Logging

```js
const builder = reactive({
  count: 0,
  multiplier: 2,
  enabled: true
});

// Log initial state for debugging
console.log('Initial state:', {
  count: builder.state.count,
  multiplier: builder.state.multiplier,
  enabled: builder.state.enabled
});

// Build with actions
builder.action('calculate', (state) => {
  return state.count * state.multiplier;
});

const calculator = builder.build();
```

 

## Common Pitfalls

### Pitfall #1: Accessing builder.state After .build()

❌ **Wrong:**
```js
const builder = reactive({ count: 0 });
const counter = builder.build();

// Trying to access .state on the built object
console.log(counter.state.count); // undefined ❌
```

The built object doesn't have a `.state` property - it **is** the state!

✅ **Correct:**
```js
const builder = reactive({ count: 0 });
const counter = builder.build();

// Access properties directly on the built object
console.log(counter.count); // 0 ✅
```

 

### Pitfall #2: Forgetting this.state in Methods

❌ **Wrong:**
```js
const builder = reactive({ count: 0 })
  .computed({
    doubled() {
      // Trying to access count directly
      return this.count * 2; // undefined! ❌
    }
  });
```

Inside methods, properties aren't directly on `this` - they're on `this.state`.

✅ **Correct:**
```js
const builder = reactive({ count: 0 })
  .computed({
    doubled() {
      // Access via this.state
      return this.state.count * 2; // Works! ✅
    }
  });
```

 

### Pitfall #3: Confusing Builder and State

❌ **Wrong:**
```js
const builder = reactive({ count: 0 });

// Trying to access count directly on builder
console.log(builder.count); // undefined ❌

// Trying to call .build() on the state
console.log(builder.state.build()); // Error! ❌
```

Remember: `builder` has methods, `builder.state` has your data.

✅ **Correct:**
```js
const builder = reactive({ count: 0 });

// Access data through builder.state
console.log(builder.state.count); // 0 ✅

// Call .build() on the builder
const counter = builder.build(); // ✅
```

 

### Pitfall #4: Modifying State During Building (Advanced)

⚠️ **Be Careful:**
```js
const builder = reactive({ count: 0 });

// Modifying state before building
builder.state.count = 10; // This works, but...

// If you've already added watchers/effects, they'll trigger!
builder
  .watch({
    count(newVal) {
      console.log('Count changed:', newVal);
    }
  });

// This triggers the watcher immediately
builder.state.count = 20; // Logs: "Count changed: 20"
```

While you *can* modify `builder.state`, remember that watchers and effects are active immediately after being added.

✅ **Better Practice:**
```js
// Set up your state first
const builder = reactive({ count: 10 }); // Initialize with final value

// Then add watchers/effects
builder.watch({
  count(newVal) {
    console.log('Count changed:', newVal);
  }
});

const counter = builder.build();
```

 

### Pitfall #5: Expecting builder.state to Change After .build()

❌ **Wrong Mental Model:**
```js
const builder = reactive({ count: 0 });
const counter = builder.build();

counter.count = 5;

// Expecting builder.state to still be accessible
console.log(builder.state.count); // Still works, but confusing
```

While `builder.state` is technically the same object as `counter`, continuing to use `builder.state` after building is confusing.

✅ **Correct:**
```js
const builder = reactive({ count: 0 });
const counter = builder.build();

counter.count = 5;

// Use the built object, not builder.state
console.log(counter.count); // 5 ✅
```

**Best practice:** Once you call `.build()`, forget about the builder and use only the returned object.

 

## Summary

**What is `builder.state`?**

`builder.state` is a **read-only property** that provides access to the reactive state while you're building your reactive object.

 

**Why use `builder.state`?**

- Access state during the building process
- Use state values in conditional logic
- Inspect initial values before building
- Reference state in computed/watch/effect definitions

 

**Key Points to Remember:**

1️⃣ **During building** - Use `builder.state` to access properties
2️⃣ **Inside methods** - Use `this.state` in computed/watch/effect
3️⃣ **After building** - Access properties directly on the built object
4️⃣ **Same object** - `builder.state` and the built object are the same
5️⃣ **Clear separation** - Builder has methods, state has data

 

**Mental Model:** Think of `builder.state` as a **window into your construction site** - it lets you see inside and access your reactive state while you're still building, without having to wait until construction is complete.

 

**Quick Reference:**

```js
// CREATE BUILDER
const builder = reactive({ count: 0, name: 'Counter' });

// DURING BUILDING - Use builder.state
console.log(builder.state.count);    // ✅ 0
console.log(builder.state.name);     // ✅ "Counter"

// INSIDE METHODS - Use this.state
builder.computed({
  display() {
    return `${this.state.name}: ${this.state.count}`; // ✅
  }
});

// CONDITIONAL SETUP - Use builder.state
if (builder.state.count === 0) {
  builder.action('init', (state) => state.count = 1);
}

// BUILD
const counter = builder.build();

// AFTER BUILDING - Direct access
console.log(counter.count);   // ✅ 0
console.log(counter.name);    // ✅ "Counter"
console.log(counter.display); // ✅ "Counter: 0"

// ❌ Don't use builder.state after building
console.log(counter.state.count); // undefined
```

 

**Remember:** `builder.state` is your window into the reactive state during construction. Use it while building, use `this.state` inside methods, and use direct access after building. It's all the same reactive object, just accessed at different stages!
