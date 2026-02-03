# Understanding `builder.build()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to finalize your reactive builder? Use `builder.build()`:

```js
// Create and configure a reactive builder
const builder = reactive({ count: 0, name: 'Counter' })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  });

// Build the final reactive object
const counter = builder.build();

// Now use it as a normal reactive object
console.log(counter.count);   // 0
console.log(counter.doubled); // 0
console.log(counter.name);    // "Counter"

counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2

// Clean up when done
counter.destroy();
```

**That's it!** `builder.build()` finalizes the builder and returns the reactive state object with a `destroy()` method!

 

## What is `builder.build()`?

`builder.build()` is a **builder method** that **finalizes the building process** and returns the **final reactive state object**. It's the last step in the builder pattern - you configure your state with chainable methods, then call `.build()` to get the finished product.

**This method:**
- Finalizes the building process
- Returns the reactive state object (not the builder)
- Adds a `destroy()` method for cleanup
- Should be called last in the chain
- Returns an object you can actually use

Think of it as **finishing construction** - after adding all your features with the builder, you call `.build()` to get the completed reactive object ready to use.

 

## Syntax

```js
// Finalize the builder
builder.build()

// Full example
const myObject = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => state.count++)
  .build()  // ← Finalize and get the reactive object
```

**Parameters:**
- None - `.build()` takes no parameters

**Returns:**
- The reactive state object with all configured features
- Includes a `destroy()` method for cleanup

**Important:**
- Should be the last method called in the chain
- Returns the state object (not the builder)
- The returned object has all state properties, computed properties, and actions
- The returned object has a `destroy()` method for cleanup

 

## Why Does This Exist?

### The Problem with Just the Builder

Let's say you configure a reactive builder but forget to call `.build()`:

```javascript
// Configure a builder
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  });
  // Oops! Forgot to call .build()

// Try to use it
console.log(counter.count);   // undefined ❌
console.log(counter.doubled); // undefined ❌
counter.increment();          // undefined (not a function) ❌

// What happened?
console.log(counter);         // It's the BUILDER, not the state!
```

**What's the Real Issue?**

```
Without .build():
┌─────────────────────┐
│ Builder Object      │
│  .state (internal)  │ ← State is hidden
│  .computed()        │ ← These are builder methods
│  .action()          │ ← Not the final object
│  .build()           │
└─────────────────────┘
        │
        ▼
   Can't use it directly!
   Properties not accessible!
   Actions not available!
```

**Problems:**
❌ Builder is not the final object
❌ Can't access state properties directly
❌ Actions aren't methods yet
❌ Computed properties not accessible
❌ No `destroy()` method
❌ Confusing to work with

### The Solution with `builder.build()`

When you call `builder.build()`, you get the final reactive object:

```javascript
// Configure and build
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build(); // ← Get the final object

// Now use it normally
console.log(counter.count);   // 0 ✅
console.log(counter.doubled); // 0 ✅
counter.increment();          // Works! ✅
console.log(counter.count);   // 1 ✅
```

**What Just Happened?**

```
With .build():
┌─────────────────────┐
│ Builder Object      │
│  (configuration)    │
└──────────┬──────────┘
           │
           ▼ .build()
┌─────────────────────┐
│ Final State Object  │
│  count: 0           │ ← Direct access
│  doubled (computed) │ ← Computed property
│  increment()        │ ← Action method
│  destroy()          │ ← Cleanup method
└─────────────────────┘
        │
        ▼
   Ready to use!
   Everything accessible!
   Clean API!
```

With `builder.build()`:
- Get the final reactive object
- Direct access to state properties
- Computed properties available
- Actions as methods
- `destroy()` method for cleanup
- Clean, usable API

**Benefits:**
✅ Finalizes the building process
✅ Returns the usable reactive object
✅ Adds `destroy()` for cleanup
✅ Clean separation: configure vs use
✅ Clear API boundary
✅ Proper resource management

 

## Mental Model

Think of `builder.build()` like **finishing a house and getting the keys**:

```
Building Phase (Builder):
┌─────────────────────┐
│  Construction Site  │
│  🏗️ Under Construction
│                     │
│  - Adding walls     │
│  - Installing roof  │
│  - Wiring electric  │
│  - Plumbing         │
└─────────────────────┘
    Not ready to use!
    Still building!

Calling .build() (Get Keys):
┌─────────────────────┐
│  Construction Site  │
└──────────┬──────────┘
           │ .build()
           │ 🔨 Finalize
           │ 🧹 Clean up
           │ 🔑 Hand over keys
           ▼
┌─────────────────────┐
│  Finished House     │
│  🏠 Ready to Live In │
│                     │
│  - Enter home       │
│  - Use rooms        │
│  - Turn on lights   │
│  - Run water        │
└─────────────────────┘
    Ready to use!
    Move in!
```

**Key Insight:** Just like a house under construction isn't ready to live in until it's finished and you get the keys, a builder isn't ready to use until you call `.build()` to get the final reactive object!

 

## How Does It Work?

### The Magic: Finalizing and Returning State

When you call `builder.build()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => state.count++)
  .build();

// What actually happens (simplified):
class Builder {
  constructor(initialState) {
    this.state = reactive(initialState);
    this.cleanups = [];
  }

  computed(defs) {
    // Add computed properties
    addComputedToState(this.state, defs);
    return this; // Return builder for chaining
  }

  action(name, fn) {
    // Add action method
    this.state[name] = (...args) => fn(this.state, ...args);
    return this; // Return builder for chaining
  }

  build() {
    // 1. Add destroy() method
    this.state.destroy = () => {
      // 2. Run all cleanup functions
      this.cleanups.forEach(cleanup => cleanup());
      // 3. Clear cleanups array
      this.cleanups = [];
    };

    // 4. Return the state (not the builder!)
    return this.state;
  }
}
```

**In other words:** `builder.build()`:
1. Adds a `destroy()` method to the state
2. `destroy()` runs all stored cleanup functions
3. Returns the reactive state object
4. The builder's job is done

### Under the Hood

```
.build()
   │
   ▼
┌───────────────────────┐
│  Add destroy()        │
│  to state object      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  destroy() contains   │
│  all cleanup logic    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return State Object  │
│  (not builder!)       │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Ready to Use!        │
│  - State properties   │
│  - Computed props     │
│  - Actions            │
│  - destroy()          │
└───────────────────────┘
```

**What happens:**

1️⃣ `.build()` is **called**
2️⃣ `destroy()` method is **added** to state
3️⃣ State object is **returned** (not builder)
4️⃣ You can **use** the returned object
5️⃣ Call `destroy()` when **done** to cleanup

 

## Basic Usage

### Simple Build

The simplest way to use `builder.build()`:

```js
// Create and build
const builder = reactive({ count: 0 });
const counter = builder.build();

// Use the built object
console.log(counter.count); // 0
counter.count = 5;
console.log(counter.count); // 5
```

### Build After Chaining

Most commonly, you build after adding features:

```js
// Chain methods, then build
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .action('decrement', (state) => {
    state.count--;
  })
  .build(); // ← Build at the end

// Use all features
console.log(counter.count);   // 0
console.log(counter.doubled); // 0
counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2
```

### Build Without Extra Features

You can build immediately without adding anything:

```js
// Just basic state
const app = reactive({ name: 'App', version: '1.0' })
  .build();

console.log(app.name);    // "App"
console.log(app.version); // "1.0"
```

 

## What build() Returns

### The Returned Object Has:

1. **All state properties**

```js
const obj = reactive({ count: 0, name: 'Test' })
  .build();

console.log(obj.count); // 0
console.log(obj.name);  // "Test"
```

2. **All computed properties**

```js
const obj = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();

console.log(obj.doubled); // 0 (computed property)
```

3. **All actions as methods**

```js
const obj = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build();

obj.increment(); // Method available
```

4. **A destroy() method**

```js
const obj = reactive({ count: 0 })
  .build();

obj.destroy(); // Cleanup method available
```

### Complete Example

```js
const app = reactive({ count: 0, name: 'Counter' })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    count(newVal) {
      console.log('Count:', newVal);
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

// The returned object has:
console.log(app.count);      // State property
console.log(app.name);       // State property
console.log(app.doubled);    // Computed property
app.increment();             // Action method
app.destroy();               // Cleanup method
```

 

## The destroy() Method

### What is destroy()?

`destroy()` is a method added to the built object that **cleans up all effects, watchers, and bindings**.

```js
const app = reactive({ count: 0 })
  .effect(() => {
    console.log('Count:', app.state.count);
  })
  .build();

// Logs: "Count: 0"

app.count = 5;
// Logs: "Count: 5"

// Clean up all effects
app.destroy();

app.count = 10;
// Nothing logged (effects destroyed)
```

### When to Call destroy()

Call `destroy()` when:
- Component unmounts (in frameworks)
- User navigates away
- Cleaning up temporary objects
- Preventing memory leaks
- Stopping all reactive updates

```js
// Example: Component lifecycle
class MyComponent {
  constructor() {
    this.state = reactive({ count: 0 })
      .effect(() => {
        this.render();
      })
      .build();
  }

  render() {
    console.log('Rendering...', this.state.count);
  }

  destroy() {
    // Clean up when component is removed
    this.state.destroy();
  }
}

const component = new MyComponent();
component.state.count = 5; // Renders

component.destroy(); // Clean up
component.state.count = 10; // Doesn't render
```

### What destroy() Cleans Up

```js
const app = reactive({ count: 0 })
  // This effect will be cleaned up
  .effect(() => {
    console.log('Effect:', app.state.count);
  })
  // This watcher will be cleaned up
  .watch({
    count(newVal) {
      console.log('Watch:', newVal);
    }
  })
  // This binding will be cleaned up
  .bind({
    '#counter': 'count'
  })
  .build();

// All effects, watchers, and bindings are active
app.count = 5;

// Clean up everything
app.destroy();

// No effects, watchers, or bindings run anymore
app.count = 10;
```

 

## Common Patterns

### Pattern: One-Line Build

```js
// Configure and build in one statement
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build();

counter.increment();
```

### Pattern: Separate Configure and Build

```js
// Configure separately
let builder = reactive({ count: 0 });

builder = builder.computed({
  doubled() {
    return this.state.count * 2;
  }
});

builder = builder.action('increment', (state) => {
  state.count++;
});

// Build later
const counter = builder.build();
```

### Pattern: Conditional Building

```js
const config = { enableDebug: true };

let builder = reactive({ count: 0 })
  .action('increment', (state) => state.count++);

if (config.enableDebug) {
  builder = builder.effect(() => {
    console.log('Debug:', builder.state.count);
  });
}

const counter = builder.build();
```

### Pattern: Factory Function

```js
function createCounter(initialCount = 0) {
  return reactive({ count: initialCount })
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
        state.count = initialCount;
      }
    })
    .build();
}

const counter1 = createCounter(0);
const counter2 = createCounter(10);
const counter3 = createCounter(100);
```

### Pattern: Cleanup on Unmount

```js
// React-style component
function useCounter() {
  const [counter] = React.useState(() =>
    reactive({ count: 0 })
      .action('increment', (state) => state.count++)
      .build()
  );

  // Cleanup when component unmounts
  React.useEffect(() => {
    return () => counter.destroy();
  }, []);

  return counter;
}
```

### Pattern: Temporary Reactive Objects

```js
function processData(data) {
  // Create temporary reactive object
  const processor = reactive({ progress: 0, result: null })
    .effect(() => {
      document.getElementById('progress').textContent = processor.state.progress;
    })
    .build();

  // Process data
  for (let i = 0; i < data.length; i++) {
    processor.progress = (i / data.length) * 100;
    // ... process data[i] ...
  }

  processor.progress = 100;

  // Clean up when done
  processor.destroy();

  return processor.result;
}
```

 

## Common Pitfalls

### Pitfall #1: Forgetting to Call .build()

❌ **Wrong:**
```js
// Forgot to call .build()
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++);

// This is the BUILDER, not the final object
console.log(counter.count);   // undefined
counter.increment();          // undefined (not a function)
```

✅ **Correct:**
```js
// Call .build() to get the final object
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build(); // ← Don't forget this!

console.log(counter.count);   // 0 ✅
counter.increment();          // Works! ✅
```

 

### Pitfall #2: Trying to Chain After .build()

❌ **Wrong:**
```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build()
  .action('decrement', (state) => state.count--); // Error!
```

`.build()` returns the state object, not the builder, so you can't chain builder methods after it.

✅ **Correct:**
```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .action('decrement', (state) => state.count--) // Before .build()
  .build(); // ← .build() is last
```

 

### Pitfall #3: Using builder.state After .build()

❌ **Wrong:**
```js
const counter = reactive({ count: 0 })
  .build();

// Trying to access via .state
console.log(counter.state.count); // undefined
```

After building, access properties directly on the returned object.

✅ **Correct:**
```js
const counter = reactive({ count: 0 })
  .build();

// Access properties directly
console.log(counter.count); // 0 ✅
```

 

### Pitfall #4: Not Calling destroy() When Done

⚠️ **Memory Leak:**
```js
function createAndUseCounter() {
  const counter = reactive({ count: 0 })
    .effect(() => {
      console.log('Count:', counter.state.count);
    })
    .build();

  counter.count = 5;

  // Oops! Forgot to call destroy()
  // Effect keeps running forever!
}

createAndUseCounter(); // Creates effect that never gets cleaned up
```

✅ **Correct:**
```js
function createAndUseCounter() {
  const counter = reactive({ count: 0 })
    .effect(() => {
      console.log('Count:', counter.state.count);
    })
    .build();

  counter.count = 5;

  // Clean up when done
  counter.destroy(); // ✅
}

createAndUseCounter(); // Effect is properly cleaned up
```

 

### Pitfall #5: Calling .build() Multiple Times

❌ **Unnecessary:**
```js
const builder = reactive({ count: 0 })
  .action('increment', (state) => state.count++);

const counter1 = builder.build();
const counter2 = builder.build(); // Same as counter1

// Both reference the same state
counter1.count = 5;
console.log(counter2.count); // 5 (same object)
```

Calling `.build()` multiple times on the same builder returns the same state object.

✅ **Better:**
```js
// Build once
const builder = reactive({ count: 0 })
  .action('increment', (state) => state.count++);

const counter = builder.build();

// If you need multiple instances, create multiple builders
const counter1 = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build();

const counter2 = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build();

// Now they're independent
counter1.count = 5;
console.log(counter2.count); // 0 (different objects)
```

 

## Summary

**What is `builder.build()`?**

`builder.build()` is a **builder method** that finalizes the building process and returns the final reactive state object with all configured features and a `destroy()` method.

 

**Why use `builder.build()`?**

- Finalizes the builder
- Returns the usable reactive object
- Adds `destroy()` for cleanup
- Marks the end of configuration
- Necessary to actually use the object

 

**Key Points to Remember:**

1️⃣ **Call last** - `.build()` should be the last method in the chain
2️⃣ **Returns state** - Returns the state object, not the builder
3️⃣ **Adds destroy()** - The returned object has a `destroy()` method
4️⃣ **Can't chain after** - Can't call builder methods after `.build()`
5️⃣ **Must be called** - Builder is not usable until you call `.build()`

 

**Mental Model:** Think of `builder.build()` as **finishing construction and getting the keys** - you can't live in the house until construction is complete and you receive the keys!

 

**Quick Reference:**

```js
// BASIC BUILD
const obj = reactive({ count: 0 })
  .build();

// BUILD AFTER CONFIGURATION
const obj = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .watch({ count(n) { console.log(n); } })
  .action('increment', (state) => state.count++)
  .build(); // ← Must be last

// USE THE BUILT OBJECT
console.log(obj.count);      // State property
console.log(obj.doubled);    // Computed property
obj.increment();             // Action method

// CLEANUP WHEN DONE
obj.destroy(); // Clean up all effects/watchers/bindings

// ❌ DON'T DO THIS
const wrong = reactive({ count: 0 })
  .build()
  .action('inc', (state) => state.count++); // Error!

// ❌ DON'T FORGET THIS
const builder = reactive({ count: 0 })
  .action('inc', (state) => state.count++);
// Forgot .build()!
builder.increment(); // Won't work!

// ✅ DO THIS
const correct = reactive({ count: 0 })
  .action('inc', (state) => state.count++)
  .build(); // Don't forget!
correct.increment(); // Works!
```

 

**Remember:** `builder.build()` is the final step that transforms your configured builder into a usable reactive object. Always call it last, and always call `destroy()` when you're done to clean up!
