# collector.add()

Add a cleanup function to a collector instance for later disposal.

## Quick Start (30 seconds)

```javascript
// Create a collector
const myCollector = collector();

// Add cleanup functions
myCollector.add(() => console.log('First cleanup'));
myCollector.add(() => console.log('Second cleanup'));
myCollector.add(() => console.log('Third cleanup'));

// Later, run all cleanups
myCollector.cleanup();
// Logs: First cleanup, Second cleanup, Third cleanup
```

**The magic:** `add()` lets you **add cleanup functions one at a time** to a collector—they'll all run when you call `cleanup()`!

 

## What is collector.add()?

`collector.add()` is an **instance method** on a collector object that adds a cleanup function to the collector's internal list.

Simply put: **It's how you tell the collector "remember to run this function later when cleanup happens."**

Think of it like this:
- You have a collector (a basket)
- You create features that need cleanup (pieces of paper with cleanup instructions)
- You use `add()` to toss those instructions into the basket
- Later, the collector reads all instructions and executes them

 

## Syntax

```javascript
// Create collector first
const myCollector = collector();

// Add cleanup function
myCollector.add(cleanupFunction);

// Chainable - returns the collector
myCollector
  .add(cleanup1)
  .add(cleanup2)
  .add(cleanup3);
```

**Parameters:**
- `cleanupFunction`: A function to execute when `cleanup()` is called
  - Must be a function
  - Non-function values are silently ignored

**Returns:**
- The collector instance (for method chaining)

 

## Why Does This Exist?

### The Challenge with Manual Cleanup Tracking

When building features, you often create multiple things that need cleanup:

```javascript
const state = ReactiveUtils.state({ count: 0 });

// Create watcher
const unwatch = watch(state, { count: (val) => console.log(val) });

// Create effect  
const stopEffect = effect(() => console.log(state.count));

// Create timer
const timer = setInterval(() => state.count++, 1000);

// Now you have 3 cleanup functions to track! 😰
// What if you create more features?
// What if cleanup is conditional?
```

At first glance, tracking these manually seems fine. But there are hidden challenges.

**What's the Real Issue?**

```
Create Feature 1
      ↓
Store cleanup1 in variable
      ↓
Create Feature 2
      ↓
Store cleanup2 in variable
      ↓
Create Feature 3
      ↓
Store cleanup3 in variable
      ↓
Must remember ALL variables! 😵
      ↓
Forget one = memory leak 💥
```

**Problems:**
❌ Must create a variable for each cleanup  
❌ Hard to track as features grow  
❌ Easy to lose track of cleanup functions  
❌ No organized way to manage them  
❌ Difficult to clean up conditionally  

### The Solution with collector.add()

With `add()`, you register each cleanup as you create it—no variables needed:

```javascript
const state = ReactiveUtils.state({ count: 0 });
const myCollector = collector();

// Add watcher cleanup
myCollector.add(
  watch(state, { count: (val) => console.log(val) })
);

// Add effect cleanup
myCollector.add(
  effect(() => console.log(state.count))
);

// Add timer cleanup
const timer = setInterval(() => state.count++, 1000);
myCollector.add(() => clearInterval(timer));

// One call to clean everything!
myCollector.cleanup();
```

**What just happened?**

```
Create collector
      ↓
Create Feature 1 → add cleanup
Create Feature 2 → add cleanup
Create Feature 3 → add cleanup
      ↓
All cleanups stored in collector
      ↓
Call cleanup() once
      ↓
Everything disposed! ✨
```

**Benefits:**
✅ No need to track multiple variables  
✅ Add cleanups as you create features  
✅ All cleanups organized in one place  
✅ Can check how many with `size` property  
✅ Clear, maintainable code  

 

## Mental Model

Think of `collector.add()` like **putting items in a shopping cart**:

### Without add() (Carrying Items)
```
Store
├─ Pick up Item 1 (hold in left hand)
├─ Pick up Item 2 (hold in right hand)  
├─ Pick up Item 3 (tuck under arm)
└─ Pick up Item 4 (hold between teeth? 😰)

Problem: You run out of hands!
```

### With add() (Using a Cart)
```
Store
├─ Pick up Item 1 → add() → [Cart]
├─ Pick up Item 2 → add() → [Cart]
├─ Pick up Item 3 → add() → [Cart]
└─ Pick up Item 4 → add() → [Cart]
                              ↓
                       Everything in cart!
                       Easy to checkout 🎉
```

**Key insight:** Instead of juggling cleanup functions in your hands (variables), you toss them into a cart (collector) using `add()`. When you're ready, you checkout (cleanup) everything at once.

 

## How Does It Work?

### Under the Hood

When you call `add()`, it pushes the cleanup function into an internal array:

```javascript
// Simplified implementation
function collector() {
  const cleanups = [];      // Internal array
  let isDisposed = false;
  
  return {
    add(cleanup) {
      // Check if already disposed
      if (isDisposed) {
        console.warn('[Cleanup] Cannot add to disposed collector');
        return this;
      }
      
      // Only add if it's a function
      if (typeof cleanup === 'function') {
        cleanups.push(cleanup);  // Add to array
      }
      
      return this;  // Return collector for chaining
    },
    
    cleanup() {
      isDisposed = true;
      cleanups.forEach(fn => fn());  // Run all
      cleanups.length = 0;           // Clear array
    },
    
    get size() { return cleanups.length; },
    get disposed() { return isDisposed; }
  };
}
```

**What's happening:**

```
1️⃣ Create collector
        ↓
   cleanups = []
        ↓
2️⃣ Call add(fn1)
        ↓
   cleanups = [fn1]
        ↓
3️⃣ Call add(fn2)
        ↓
   cleanups = [fn1, fn2]
        ↓
4️⃣ Call add(fn3)
        ↓
   cleanups = [fn1, fn2, fn3]
        ↓
5️⃣ Call cleanup()
        ↓
   Run fn1(), fn2(), fn3()
   Clear cleanups array
```

### Type Checking

Notice the type check? `add()` only accepts functions:

```javascript
if (typeof cleanup === 'function') {
  cleanups.push(cleanup);
}
```

This means:
```javascript
myCollector.add(() => console.log('OK'));  // ✓ Added
myCollector.add('not a function');          // ✗ Ignored
myCollector.add(123);                       // ✗ Ignored
myCollector.add(null);                      // ✗ Ignored
```

### Returns this (Chainable)

The method returns the collector itself:

```javascript
return this;
```

This enables method chaining:

```javascript
myCollector
  .add(cleanup1)
  .add(cleanup2)
  .add(cleanup3);
```

 

## Basic Usage

### Example 1: Simple Add

```javascript
// Create collector
const myCollector = collector();

// Add first cleanup
myCollector.add(() => {
  console.log('Cleaning up feature 1');
});

// Add second cleanup
myCollector.add(() => {
  console.log('Cleaning up feature 2');
});

// Check size
console.log('Total cleanups:', myCollector.size); // 2

// Run cleanups
myCollector.cleanup();
// Logs:
// Cleaning up feature 1
// Cleaning up feature 2
```

**What's happening?**
1. Create an empty collector
2. Add two cleanup functions
3. Check the size (2 cleanups)
4. Call `cleanup()` to run them all

 

### Example 2: Adding Watchers

```javascript
const state = ReactiveUtils.state({ count: 0, name: 'Alice' });
const myCollector = collector();

// Add watcher cleanups
myCollector.add(
  watch(state, {
    count: (val) => console.log('Count:', val)
  })
);

myCollector.add(
  watch(state, {
    name: (val) => console.log('Name:', val)
  })
);

console.log('Watching', myCollector.size, 'properties');
// Watching 2 properties

// Test watchers
state.count = 5;     // Logs: Count: 5
state.name = 'Bob';  // Logs: Name: Bob

// Clean up all watchers
myCollector.cleanup();
```

**What's happening?**
- We add two watcher cleanup functions
- Both watchers work normally
- We can check how many watchers exist
- One `cleanup()` call stops all watchers

 

### Example 3: Adding Mixed Cleanups

```javascript
const state = ReactiveUtils.state({ count: 0 });
const myCollector = collector();

// Add effect cleanup
myCollector.add(
  effect(() => {
    console.log('Count is:', state.count);
  })
);

// Add timer cleanup
const timer = setInterval(() => {
  state.count++;
}, 1000);

myCollector.add(() => {
  console.log('Stopping timer...');
  clearInterval(timer);
});

// Add event listener cleanup
const handleClick = () => console.log('Clicked!');
document.addEventListener('click', handleClick);

myCollector.add(() => {
  console.log('Removing listener...');
  document.removeEventListener('click', handleClick);
});

console.log('Total cleanups:', myCollector.size); // 3

// Clean up everything
myCollector.cleanup();
// Logs:
// Count is: 0
// Stopping timer...
// Removing listener...
```

**What's happening?**
- We add three different types of cleanups
- Effect cleanup (returned function)
- Timer cleanup (inline function)
- Event listener cleanup (inline function)
- All disposed with one call

 

## Deep Dive: Adding Cleanups

### Pattern 1: Add as You Create

The most common pattern is to add cleanup immediately after creating a feature:

```javascript
const myCollector = collector();
const state = ReactiveUtils.state({ count: 0 });

// Create → Add
myCollector.add(
  watch(state, { count: (val) => console.log(val) })
);

// Create → Add
myCollector.add(
  effect(() => console.log(state.count))
);

// Create → Add
const timer = setInterval(() => state.count++, 1000);
myCollector.add(() => clearInterval(timer));
```

**Why this works:**
- Cleanup is defined next to the feature
- Easy to see what cleanup does
- Hard to forget cleanup

 

### Pattern 2: Store Then Add

Sometimes you need to keep a reference:

```javascript
const myCollector = collector();

// Store reference
const unwatch = watch(state, { count: (val) => console.log(val) });

// Add to collector
myCollector.add(unwatch);

// You can still call manually if needed
// unwatch();  // Manual cleanup

// Or let collector handle it
// myCollector.cleanup();  // Automatic cleanup
```

**Why this works:**
- Flexibility to clean up manually or automatically
- Useful when cleanup depends on conditions

 

### Pattern 3: Conditional Adding

Add cleanups based on conditions:

```javascript
const myCollector = collector();
const options = { enableWatcher: true, enableTimer: false };

if (options.enableWatcher) {
  myCollector.add(
    watch(state, { count: (val) => console.log(val) })
  );
}

if (options.enableTimer) {
  const timer = setInterval(() => state.count++, 1000);
  myCollector.add(() => clearInterval(timer));
}

console.log('Added', myCollector.size, 'cleanups');
// Added 1 cleanups (only watcher)
```

**Why this works:**
- Only add what you actually use
- Keeps collector lean
- Easy to debug what's registered

 

### Pattern 4: Add in Loops

Add multiple similar cleanups:

```javascript
const myCollector = collector();
const elements = document.querySelectorAll('.button');

elements.forEach(button => {
  const handleClick = () => {
    console.log('Button clicked:', button.id);
  };
  
  button.addEventListener('click', handleClick);
  
  myCollector.add(() => {
    button.removeEventListener('click', handleClick);
  });
});

console.log('Added', myCollector.size, 'click listeners');
// Added 5 click listeners (if 5 buttons exist)
```

**Why this works:**
- All listeners cleaned up together
- No need to track each listener separately
- Scales with number of elements

 

## Method Chaining

Because `add()` returns the collector, you can chain multiple calls:

### Example 1: Basic Chaining

```javascript
const myCollector = collector();

myCollector
  .add(() => console.log('First'))
  .add(() => console.log('Second'))
  .add(() => console.log('Third'));

myCollector.cleanup();
// Logs: First, Second, Third
```

 

### Example 2: Chaining with Features

```javascript
const state = ReactiveUtils.state({ count: 0, name: 'Alice' });

const myCollector = collector()
  .add(watch(state, { count: (v) => console.log('Count:', v) }))
  .add(watch(state, { name: (v) => console.log('Name:', v) }))
  .add(effect(() => console.log('State:', state.count)));

console.log('Cleanups:', myCollector.size); // 3
```

 

### Example 3: Mixing Chained and Non-Chained

```javascript
const myCollector = collector();

// Chained
myCollector
  .add(() => console.log('A'))
  .add(() => console.log('B'));

// Non-chained (still works!)
myCollector.add(() => console.log('C'));

// More chained
myCollector
  .add(() => console.log('D'))
  .add(() => console.log('E'));

console.log('Total:', myCollector.size); // 5
```

**Key insight:** Chaining is optional—use it when it makes your code more readable.

 

## Common Patterns

### Pattern 1: Component Lifecycle

```javascript
class TodoList {
  constructor() {
    this.collector = collector();
    this.state = state({ todos: [] });
    
    // Add all reactive features
    this.collector
      .add(watch(this.state, {
        todos: (val) => this.render()
      }))
      .add(effect(() => {
        console.log('Todo count:', this.state.todos.length);
      }));
  }
  
  addTodo(text) {
    this.state.todos.push({ text, done: false });
  }
  
  render() {
    // ... render logic ...
  }
  
  destroy() {
    this.collector.cleanup();
  }
}

// Usage
const list = new TodoList();
list.addTodo('Buy milk');
list.destroy(); // All cleanups run
```

 

### Pattern 2: Resource Manager

```javascript
function createResourceManager() {
  const myCollector = collector();
  const resources = [];
  
  function allocateResource(name) {
    console.log('Allocating:', name);
    resources.push(name);
    
    // Add cleanup for this resource
    myCollector.add(() => {
      console.log('Releasing:', name);
      const index = resources.indexOf(name);
      if (index > -1) resources.splice(index, 1);
    });
  }
  
  function getResources() {
    return [...resources];
  }
  
  function cleanup() {
    console.log('Cleaning up', myCollector.size, 'resources');
    myCollector.cleanup();
  }
  
  return { allocateResource, getResources, cleanup };
}

// Usage
const manager = createResourceManager();
manager.allocateResource('Database Connection');
manager.allocateResource('File Handle');
manager.allocateResource('Network Socket');

console.log('Active:', manager.getResources());
// Active: ['Database Connection', 'File Handle', 'Network Socket']

manager.cleanup();
// Logs:
// Cleaning up 3 resources
// Releasing: Database Connection
// Releasing: File Handle
// Releasing: Network Socket
```

 

### Pattern 3: Event Bus

```javascript
function createEventBus() {
  const listeners = new Map();
  const myCollector = collector();
  
  function on(event, handler) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(handler);
    
    // Return cleanup function and add to collector
    const cleanup = () => {
      const handlers = listeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
    
    myCollector.add(cleanup);
    return cleanup;
  }
  
  function emit(event, data) {
    const handlers = listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
  
  function destroy() {
    console.log('Destroying event bus with', myCollector.size, 'listeners');
    myCollector.cleanup();
    listeners.clear();
  }
  
  return { on, emit, destroy };
}

// Usage
const bus = createEventBus();

bus.on('user:login', (user) => console.log('User logged in:', user));
bus.on('user:logout', () => console.log('User logged out'));
bus.on('data:update', (data) => console.log('Data updated:', data));

bus.emit('user:login', { name: 'Alice' });
// Logs: User logged in: { name: 'Alice' }

bus.destroy();
// Logs: Destroying event bus with 3 listeners
// All listeners removed
```

 

### Pattern 4: Animation Controller

```javascript
function createAnimationController() {
  const myCollector = collector();
  const state = ReactiveUtils.state({ 
    running: false,
    frame: 0
  });
  
  function start() {
    if (state.running) return;
    
    state.running = true;
    let animationId;
    
    const animate = () => {
      state.frame++;
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    // Add cleanup for animation
    myCollector.add(() => {
      cancelAnimationFrame(animationId);
      state.running = false;
      state.frame = 0;
    });
  }
  
  function stop() {
    myCollector.cleanup();
  }
  
  return { state, start, stop };
}

// Usage
const animation = createAnimationController();
animation.start();
// Animation running...
animation.stop(); // Animation stopped and cleaned up
```

 

## Edge Cases and Gotchas

### Gotcha 1: Adding After Disposal

```javascript
const myCollector = collector();

myCollector.add(() => console.log('Cleanup 1'));
myCollector.cleanup(); // Disposed

// Try to add after disposal
myCollector.add(() => console.log('Cleanup 2'));
// Warning: Cannot add to disposed collector

console.log(myCollector.size); // 0 (not added)
```

**What's happening:**
- Once `cleanup()` is called, the collector is disposed
- Further `add()` calls are ignored with a warning
- Check `disposed` property to avoid this

**Solution:**
```javascript
if (!myCollector.disposed) {
  myCollector.add(() => console.log('Cleanup'));
}
```

 

### Gotcha 2: Adding Non-Functions

```javascript
const myCollector = collector();

myCollector.add('not a function');    // Ignored
myCollector.add(123);                  // Ignored
myCollector.add(null);                 // Ignored
myCollector.add(undefined);            // Ignored
myCollector.add({ cleanup: true });    // Ignored (not a function)

console.log(myCollector.size); // 0

// Only functions are added
myCollector.add(() => console.log('OK'));
console.log(myCollector.size); // 1
```

**What's happening:**
- Only actual functions are added
- Non-functions are silently ignored (no error)
- Always pass functions to `add()`

 

### Gotcha 3: Adding Same Function Multiple Times

```javascript
const myCollector = collector();

const cleanup = () => console.log('Cleanup');

myCollector.add(cleanup);
myCollector.add(cleanup);
myCollector.add(cleanup);

console.log(myCollector.size); // 3 (same function added 3 times!)

myCollector.cleanup();
// Logs: Cleanup, Cleanup, Cleanup
```

**What's happening:**
- The collector doesn't deduplicate functions
- Adding the same function multiple times means it runs multiple times
- Usually not what you want

**Solution:**
```javascript
const myCollector = collector();
const cleanup = () => console.log('Cleanup');

// Only add once
myCollector.add(cleanup);

// Or check before adding
if (myCollector.size === 0) {
  myCollector.add(cleanup);
}
```

 

### Gotcha 4: Order Matters

```javascript
const myCollector = collector();

myCollector.add(() => console.log('First'));
myCollector.add(() => console.log('Second'));
myCollector.add(() => console.log('Third'));

myCollector.cleanup();
// Logs in order: First, Second, Third
```

**What's happening:**
- Cleanups run in the order they were added
- If cleanup order matters, add them in the right sequence
- This is usually what you want

 

## Summary

### Key Takeaways

✅ **`add()` is an instance method** on a collector—call it as `myCollector.add()`  
✅ **Adds cleanup functions** to the collector's internal list  
✅ **Returns the collector** for method chaining  
✅ **Only accepts functions**—non-functions are silently ignored  
✅ **Cannot add after disposal**—check `disposed` property first  
✅ **Cleanups run in order**—they execute in the sequence they were added  
✅ **Most common pattern:** Add cleanup right after creating a feature  

### Quick Reference

```javascript
// Create collector
const myCollector = collector();

// Add cleanup functions
myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));

// Chain multiple adds
myCollector
  .add(() => console.log('Cleanup 3'))
  .add(() => console.log('Cleanup 4'));

// Check size
console.log(myCollector.size); // 4

// Run all cleanups
myCollector.cleanup();

// Check if disposed
console.log(myCollector.disposed); // true
```

### One-Line Rule

> **Use `add()` to register cleanup functions as you create features—they'll all run when you call `cleanup()`, keeping your code organized and leak-free.**

 

**Next Steps:**
- Learn about [`collector.cleanup()`](./collector.cleanup.md) to run the cleanups
- Learn about [`collector.size`](./collector.size.md) to track cleanup count
- Learn about [`collector.disposed`](./collector.disposed.md) to check disposal status