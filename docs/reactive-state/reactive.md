# Understanding `reactive()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to build reactive state step-by-step with a fluent API? Here's how:

```js
// Build reactive state with method chaining
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  })
  .effect(() => {
    console.log('Count is:', counter.state.count);
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

// Use the built object
counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2

// Clean up when done
counter.destroy();
```

**That's it!** The `reactive()` function creates a builder that lets you construct reactive state step-by-step using a fluent API!

 

## What is `reactive()`?

`reactive()` is a **builder pattern function** for creating reactive state incrementally. Instead of passing a large configuration object, you build up your reactive state piece by piece using method chaining.

**A reactive builder:**
- Starts with initial state
- Adds computed properties via `.computed()`
- Adds watchers via `.watch()`
- Adds effects via `.effect()`
- Adds actions via `.action()` or `.actions()`
- Builds the final object via `.build()`
- Provides a fluent, chainable API

Think of it as a **step-by-step constructor** - you build your reactive object one feature at a time, and each step returns the builder so you can keep chaining.

 

## Syntax

```js
// Using the shortcut
reactive(initialState)

// Using the full namespace
ReactiveUtils.reactive(initialState)

// Alias: builder()
ReactiveUtils.builder(initialState)
```

**Both styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`reactive()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.reactive()` or `ReactiveUtils.builder()`) - Explicit and clear

**Parameters:**
- `initialState` - An object with initial state properties (required)

**Returns:**
- A builder object with chainable methods

 

## Why Does This Exist?

### Two Approaches to Building Reactive Components

The Reactive library offers flexible ways to create complex reactive objects, each suited to different coding preferences.

### Configuration Object Style

When you prefer **declarative, all-at-once definitions** and want to see the complete structure upfront:
```javascript
// Configuration-based component
const counter = component({
  state: {
    count: 0,
    step: 1
  },
  computed: {
    doubled() { return this.count * 2; },
    tripled() { return this.count * 3; }
  },
  watch: {
    count(newVal, oldVal) { console.log('Changed:', newVal); }
  },
  effects: {
    logCount() { console.log(this.count); }
  },
  actions: {
    increment(state) { state.count += state.step; },
    decrement(state) { state.count -= state.step; },
    reset(state) { state.count = 0; }
  }
});
```

**This approach is great when you need:**
✅ Complete component structure visible at once
✅ Familiar configuration object pattern
✅ All features grouped by type
✅ Single-object definition style

### When Step-by-Step Construction Fits Your Style

In scenarios where you prefer **incremental, fluent API patterns** and want to build components piece by piece, `reactive()` provides a more direct approach:
```javascript
// Builder pattern - construct step by step
const counter = reactive({ count: 0, step: 1 })
  .computed({
    doubled() { return this.state.count * 2; },
    tripled() { return this.state.count * 3; }
  })
  .watch({
    count(newVal, oldVal) { console.log('Changed:', newVal); }
  })
  .effect(() => {
    console.log(counter.state.count);
  })
  .action('increment', (state) => {
    state.count += state.step;
  })
  .action('decrement', (state) => {
    state.count -= state.step;
  })
  .action('reset', (state) => {
    state.count = 0;
  })
  .build();
```

**This method is especially useful when:**
```
Builder Pattern Flow:
┌──────────────────┐
│ reactive({...})  │
└────────┬─────────┘
         │
         ▼
   .computed({...})
         │
         ▼
   .watch({...})
         │
         ▼
   .effect(...)
         │
         ▼
   .build()
         │
         ▼
  ✅ Incremental & clear
```

**Where reactive() shines:**
✅ **Fluent API preference** - Method chaining for readability
✅ **Incremental construction** - Build features step by step
✅ **Conditional features** - Easy to add features based on conditions
✅ **Top-to-bottom flow** - Reads like a sequence of operations
✅ **Dynamic composition** - Programmatically add features in loops or conditions

**The Choice is Yours:**
- Use `component()` when you prefer declarative configuration objects
- Use `reactive()` when you prefer fluent builder patterns
- Both create the same reactive object with identical capabilities

**Benefits of the builder approach:**
✅ **Chainable methods** - Fluent API for step-by-step construction
✅ **Flexible composition** - Easy to conditionally add features
✅ **Linear reading** - Top-to-bottom flow matches execution
✅ **Progressive building** - Start simple, add complexity as needed
✅ **Same power** - All features of `component()` available
## Mental Model

Think of `reactive()` like an **assembly line**:

```
Large Config (Box of Parts):
┌────────────────────────┐
│   Box with all parts   │
│   ┌──────────────────┐ │
│   │ State            │ │
│   │ Computed         │ │
│   │ Watchers         │ │
│   │ Effects          │ │
│   │ Actions          │ │
│   └──────────────────┘ │
└────────────────────────┘
    Everything at once!
    Assemble yourself!

Builder (Assembly Line):
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Add      │  →   │ Add      │  →   │ Add      │
│ State    │      │ Computed │      │ Watchers │
└──────────┘      └──────────┘      └──────────┘
     │                 │                 │
     ▼                 ▼                 ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Add      │  →   │ Add      │  →   │ Final    │
│ Effects  │      │ Actions  │      │ Product! │
└──────────┘      └──────────┘      └──────────┘
    Step by step!
    Clear process!
```

**Key Insight:** Just like an assembly line that builds a product step by step at each station, `reactive()` builds your reactive object one feature at a time through method chaining.

 

## How Does It Work?

### The Magic: Builder Pattern

When you call `reactive()`, here's what happens behind the scenes:

```javascript
// What you write:
const myBuilder = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => { state.count++; })
  .build();

// What actually happens (simplified):
// 1. Create state
const state = createReactive({ count: 0 });

// 2. Create builder object
const builder = {
  state: state,
  cleanups: [],

  computed(defs) {
    computed(state, defs);
    return this; // Return builder for chaining
  },

  action(name, fn) {
    state[name] = function() { return fn(state, ...arguments); };
    return this; // Return builder for chaining
  },

  build() {
    state.destroy = () => this.cleanups.forEach(c => c());
    return state;
  }
};

// 3. Chain methods
builder.computed({ doubled() { return this.count * 2; } });
builder.action('increment', (state) => { state.count++; });

// 4. Build final object
const final = builder.build();
```

**In other words:** `reactive()` creates a builder that:
1. Stores the reactive state internally
2. Provides chainable methods for adding features
3. Each method modifies the state and returns the builder
4. `.build()` returns the final reactive state with a `destroy()` method

### Under the Hood

```
reactive({ count: 0 })
        │
        ▼
┌───────────────────────┐
│  Create Reactive      │
│  State                │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Create Builder       │
│  with state + methods │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  .computed()          │
│  Adds to state        │
│  Returns builder      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  .action()            │
│  Adds to state        │
│  Returns builder      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  .build()             │
│  Returns final state  │
└───────────────────────┘
```

**What happens:**

1️⃣ Each builder method **modifies the internal state**
2️⃣ Each builder method **returns the builder** for chaining
3️⃣ You can **chain as many methods** as you want
4️⃣ `.build()` returns the **final reactive state** object

 

## Basic Usage

### Creating a Builder

The simplest way to use `reactive()`:

```js
// Start with reactive()
const builder = reactive({ count: 0 });

// Access the state during building
console.log(builder.state.count); // 0

// Build to get the final object
const state = builder.build();

console.log(state.count); // 0
```

### Adding Features Before Building

```js
// Add features before building
const myObject = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

// Use the built object
myObject.increment();
console.log(myObject.count);   // 1
console.log(myObject.doubled); // 2
```

 

## Builder Methods

### `.computed(definitions)`

Add computed properties:

```js
const myBuilder = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    tripled() {
      return this.state.count * 3;
    }
  });
```

**Returns:** The builder (for chaining)

### `.watch(definitions)`

Add watchers:

```js
const myBuilder = reactive({ count: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  });
```

**Returns:** The builder (for chaining)

### `.effect(fn)`

Add a single effect:

```js
const myBuilder = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', myBuilder.state.count);
  });
```

**Returns:** The builder (for chaining)

### `.bind(bindingDefs)`

Add DOM bindings:

```js
const myBuilder = reactive({ count: 0 })
  .bind({
    '#counter': 'count'
  });
```

**Returns:** The builder (for chaining)

### `.action(name, fn)`

Add a single action:

```js
const myBuilder = reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++;
  });
```

**Returns:** The builder (for chaining)

### `.actions(definitions)`

Add multiple actions:

```js
const myBuilder = reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    }
  });
```

**Returns:** The builder (for chaining)

### `.build()`

Build and return the final reactive object:

```js
const myObject = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build();

// myObject is now the reactive state (not the builder)
myObject.increment();
```

**Returns:** The final reactive state object with a `destroy()` method

### `.destroy()`

Destroy the builder and clean up (before building):

```js
const myBuilder = reactive({ count: 0 })
  .effect(() => console.log('Effect'))
  .destroy(); // Clean up before building

// Builder is destroyed, effects stopped
```

 

## Chaining

The power of `reactive()` is in chaining methods:

```js
const counter = reactive({ count: 0, step: 1 })
  // Add computed properties
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    isPositive() {
      return this.state.count > 0;
    }
  })
  // Add watchers
  .watch({
    count(newVal) {
      if (newVal > 100) {
        console.warn('Count is high!');
      }
    }
  })
  // Add effects
  .effect(() => {
    document.getElementById('count').textContent = counter.state.count;
  })
  .effect(() => {
    document.title = `Count: ${counter.state.count}`;
  })
  // Add actions
  .action('increment', (state) => {
    state.count += state.step;
  })
  .action('decrement', (state) => {
    state.count -= state.step;
  })
  .actions({
    reset(state) {
      state.count = 0;
    },
    setStep(state, newStep) {
      state.step = newStep;
    }
  })
  // Add bindings
  .bind({
    '#counter': 'count',
    '#doubled': 'doubled'
  })
  // Build final object
  .build();

// Now use it
counter.increment();
console.log(counter.count); // 1
```

 

## Building the Final Object

### The `.build()` Method

Calling `.build()` returns the final reactive state:

```js
const builder = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => state.count++);

// Build the final object
const counter = builder.build();

// counter is now the reactive state
console.log(counter.count);   // 0
console.log(counter.doubled); // 0

counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2
```

### The Built Object Has `destroy()`

The built object has a `destroy()` method:

```js
const counter = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', counter.count);
  })
  .build();

counter.count = 5; // Effect logs: "Count: 5"

// Clean up
counter.destroy();

counter.count = 10; // Effect doesn't log (destroyed)
```

 

## reactive() vs component()

Both create reactive objects with similar features, but use different patterns:

### When to Use `reactive()`

Use `reactive()` when you prefer **builder pattern / method chaining**:

✅ Building incrementally
✅ Conditional feature addition
✅ Fluent API preference
✅ Step-by-step construction

```js
const myObject = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => state.count++)
  .build();
```

### When to Use `component()`

Use `component()` when you prefer **configuration object**:

✅ All features known upfront
✅ Configuration object preference
✅ Component-style pattern
✅ Lifecycle hooks needed

```js
const myComponent = component({
  state: { count: 0 },
  computed: {
    doubled() { return this.count * 2; }
  },
  actions: {
    increment(state) { state.count++; }
  }
});
```

### Quick Comparison

```javascript
// ✅ reactive() - Builder pattern
const obj1 = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => state.count++)
  .build();

// ✅ component() - Configuration object
const obj2 = component({
  state: { count: 0 },
  computed: {
    doubled() { return this.count * 2; }
  },
  actions: {
    increment(state) { state.count++; }
  }
});
```

**Both produce similar results!** Choose based on your preference.

 

## Common Patterns

### Pattern: Conditional Features

```js
const config = {
  enableLogging: true,
  enableValidation: false
};

let builder = reactive({ count: 0 })
  .action('increment', (state) => state.count++);

// Conditionally add logging
if (config.enableLogging) {
  builder = builder.effect(() => {
    console.log('Count:', builder.state.count);
  });
}

// Conditionally add validation
if (config.enableValidation) {
  builder = builder.watch({
    count(newVal) {
      if (newVal < 0) console.error('Negative count!');
    }
  });
}

const counter = builder.build();
```

### Pattern: Dynamic Action Addition

```js
const actions = {
  increment: (state) => state.count++,
  decrement: (state) => state.count--,
  reset: (state) => state.count = 0
};

let builder = reactive({ count: 0 });

// Add actions dynamically
Object.entries(actions).forEach(([name, fn]) => {
  builder = builder.action(name, fn);
});

const counter = builder.build();

counter.increment();
counter.decrement();
counter.reset();
```

### Pattern: Plugin System

```js
function addLoggingPlugin(builder) {
  return builder.effect(() => {
    console.log('State:', JSON.stringify(builder.state));
  });
}

function addPersistencePlugin(builder) {
  return builder
    .effect(() => {
      localStorage.setItem('state', JSON.stringify(builder.state));
    })
    .action('restore', (state) => {
      const saved = localStorage.getItem('state');
      if (saved) {
        Object.assign(state, JSON.parse(saved));
      }
    });
}

const myObject = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  // Apply plugins
  |> addLoggingPlugin
  |> addPersistencePlugin
  .build();
```

### Pattern: Reusable Builder Functions

```js
function withCounter(initialValue = 0) {
  return reactive({ count: initialValue })
    .computed({
      doubled() {
        return this.state.count * 2;
      }
    })
    .actions({
      increment(state) {
        state.count++;
      },
      decrement(state) {
        state.count--;
      },
      reset(state) {
        state.count = initialValue;
      }
    });
}

// Create multiple counters with the same features
const counter1 = withCounter(0).build();
const counter2 = withCounter(10).build();
const counter3 = withCounter(100).build();
```

 

## Common Pitfalls

### Pitfall #1: Forgetting to Call .build()

❌ **Wrong:**
```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++);

// counter is the BUILDER, not the final object
counter.increment(); // ERROR: builder doesn't have increment
```

✅ **Correct:**
```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build(); // Call .build()!

// Now counter is the final object
counter.increment(); // Works!
```

 

### Pitfall #2: Accessing Wrong State Reference

❌ **Wrong:**
```js
const builder = reactive({ count: 0 })
  .computed({
    // Accessing 'this.count' instead of 'this.state.count'
    doubled() {
      return this.count * 2; // undefined!
    }
  });
```

✅ **Correct:**
```js
const builder = reactive({ count: 0 })
  .computed({
    // Access via 'this.state'
    doubled() {
      return this.state.count * 2;
    }
  });
```

 

### Pitfall #3: Not Storing Builder for Chaining

❌ **Wrong:**
```js
let builder = reactive({ count: 0 });

builder.computed({ doubled() { return this.state.count * 2; } });

// .computed() returned a new builder, but we didn't save it
const counter = builder.build(); // Doesn't have 'doubled'!
```

✅ **Correct:**
```js
let builder = reactive({ count: 0 });

// Store the returned builder
builder = builder.computed({
  doubled() {
    return this.state.count * 2;
  }
});

const counter = builder.build(); // Has 'doubled'!

// Or chain directly:
const counter2 = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .build();
```

 

### Pitfall #4: Arrow Functions in Computed

❌ **Wrong:**
```js
reactive({ count: 0 })
  .computed({
    // Arrow function: 'this' is wrong!
    doubled: () => this.state.count * 2
  })
  .build();
```

✅ **Correct:**
```js
reactive({ count: 0 })
  .computed({
    // Regular function: 'this' works!
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();
```

 

## Summary

**What is `reactive()`?**

`reactive()` is a **builder pattern function** for creating reactive state incrementally using method chaining.

 

**Why use `reactive()` instead of `component()`?**

- Prefer builder pattern over config objects
- Build incrementally, step by step
- Conditional feature addition is easier
- Fluent, chainable API
- Same power as `component()`

 

**Key Points to Remember:**

1️⃣ **Builder pattern** - Chain methods to build incrementally
2️⃣ **Call .build()** - Returns the final reactive object
3️⃣ **Access via .state** - During building, use `this.state`
4️⃣ **Returns builder** - Each method returns builder for chaining
5️⃣ **Has destroy()** - Built object has a `destroy()` method

 

**Mental Model:** Think of `reactive()` as an **assembly line** - you build your reactive object step by step, and each station (method call) adds a new feature.

 

**Quick Reference:**

```js
// Create and build
const myObject = reactive({ count: 0 })
  // Add computed
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  // Add watchers
  .watch({
    count(newVal, oldVal) {
      console.log('Changed:', newVal);
    }
  })
  // Add effect
  .effect(() => {
    console.log(myObject.state.count);
  })
  // Add single action
  .action('increment', (state) => {
    state.count++;
  })
  // Add multiple actions
  .actions({
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    }
  })
  // Add bindings
  .bind({
    '#counter': 'count'
  })
  // Build final object
  .build();

// Use
myObject.increment();
console.log(myObject.count);

// Clean up
myObject.destroy();
```

 

**Remember:** `reactive()` is your builder pattern for creating reactive state. It gives you the same power as `component()` but with a fluent, step-by-step construction API!
