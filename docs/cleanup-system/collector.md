# collector()

Create a cleanup collector that manages multiple cleanup functions and disposes them all at once.

## Quick Start (30 seconds)

```javascript
// Create a collector
const collector = collector();

// Add cleanup functions
collector.add(() => console.log('Cleanup 1'));
collector.add(() => console.log('Cleanup 2'));
collector.add(() => console.log('Cleanup 3'));

// Check how many cleanups
console.log(collector.size); // 3

// Run all cleanups at once
collector.cleanup();
// Logs: Cleanup 1, Cleanup 2, Cleanup 3

// Check if disposed
console.log(collector.disposed); // true
```

**The magic:** `collector()` lets you **collect multiple cleanup functions** and run them all with a single call—perfect for managing component lifecycles!

 

## What is collector()?

`collector()` is a function that creates a **cleanup collector**—an object that stores multiple cleanup functions and can dispose of them all at once.

Simply put: **It's a basket that holds cleanup functions. When you're done, dump the basket and everything gets cleaned up.**

Think of it like this:
- You create features that need cleanup (watchers, effects, timers)
- Each feature returns a cleanup function
- Instead of tracking them individually, you add them all to a collector
- When finished, call `collector.cleanup()` and everything is disposed

 

## Syntax

```javascript
// Create collector
const collector = collector();

// Or via ReactiveUtils
const collector = ReactiveUtils.collector();

// Add cleanup functions
collector.add(cleanupFn);

// Run all cleanups
collector.cleanup();

// Check status
collector.size      // Number of cleanup functions
collector.disposed  // Boolean: has cleanup been called?
```

**Parameters:**
- None—`collector()` takes no parameters

**Returns:** Collector object with:
- `add(cleanup)` - Add cleanup function (chainable)
- `cleanup()` - Execute all cleanups
- `size` - Number of collected cleanups
- `disposed` - Whether collector has been disposed

 

## Why Does This Exist?

### The Problem with Multiple Cleanups

Imagine you're building a component with multiple reactive features:

```javascript
function createDashboard() {
  const state = ReactiveUtils.state({ 
    users: [],
    posts: [],
    notifications: []
  });

  // Create multiple watchers
  const unwatch1 = watch(state, { users: (val) => updateUI(val) });
  const unwatch2 = watch(state, { posts: (val) => updateUI(val) });
  const unwatch3 = watch(state, { notifications: (val) => updateUI(val) });

  // Create effects
  const stopEffect1 = effect(() => console.log(state.users.length));
  const stopEffect2 = effect(() => console.log(state.posts.length));

  // Set up timers
  const timer1 = setInterval(() => state.users++, 1000);
  const timer2 = setInterval(() => state.posts++, 2000);

  // Now you have 7 things to clean up! 😰
  return function destroy() {
    unwatch1();
    unwatch2();
    unwatch3();
    stopEffect1();
    stopEffect2();
    clearInterval(timer1);
    clearInterval(timer2);
  };
}
```

At first glance, this looks organized. But there are hidden problems.

**What's the Real Issue?**

```
Create Feature 1 → cleanup1
      ↓
Create Feature 2 → cleanup2
      ↓
Create Feature 3 → cleanup3
      ↓
Create Feature 4 → cleanup4
      ↓
You have to remember ALL of them! 😵
      ↓
One forgotten cleanup = memory leak 💥
```

**Problems:**
❌ Must track every cleanup function manually  
❌ Easy to forget one when adding new features  
❌ Destroy function gets messy with many cleanups  
❌ No way to check how many cleanups exist  
❌ No protection against calling cleanup twice  
❌ Hard to debug cleanup issues  

### The Solution with collector()

With `collector()`, you add cleanups to a single collector and dispose them all at once:

```javascript
function createDashboard() {
  const state = ReactiveUtils.state({ 
    users: [],
    posts: [],
    notifications: []
  });

  // Create collector
  const collector = collector();

  // Add all cleanup functions as you create features
  collector.add(watch(state, { users: (val) => updateUI(val) }));
  collector.add(watch(state, { posts: (val) => updateUI(val) }));
  collector.add(watch(state, { notifications: (val) => updateUI(val) }));
  
  collector.add(effect(() => console.log(state.users.length)));
  collector.add(effect(() => console.log(state.posts.length)));

  const timer1 = setInterval(() => state.users++, 1000);
  const timer2 = setInterval(() => state.posts++, 2000);
  collector.add(() => clearInterval(timer1));
  collector.add(() => clearInterval(timer2));

  // Clean destroy function! 🎉
  return function destroy() {
    collector.cleanup(); // One call, everything cleaned up!
  };
}
```

**What just happened?**

```
Create collector
      ↓
Add cleanup1 → [collector]
Add cleanup2 → [collector]
Add cleanup3 → [collector]
      ↓
Call collector.cleanup()
      ↓
All cleanups run automatically ✨
      ↓
No memory leaks! 🎉
```

**Benefits:**
✅ Single place to manage all cleanups  
✅ Can't forget to call cleanup—they're all in the collector  
✅ Can check `collector.size` to see how many cleanups exist  
✅ Automatically prevents double-cleanup  
✅ Much cleaner, more maintainable code  
✅ Easy to debug—just inspect the collector  

 

## Mental Model

Think of `collector()` like a **recycling bin** in an office:

### Without Collector (Trash Everywhere)
```
Office
├─ Desk 1 → trash pile
├─ Desk 2 → trash pile
├─ Desk 3 → trash pile
└─ Desk 4 → trash pile

Cleanup time = visit each desk individually 😰
```

### With Collector (One Bin)
```
Office
├─ Desk 1 → throws trash in bin
├─ Desk 2 → throws trash in bin
├─ Desk 3 → throws trash in bin
└─ Desk 4 → throws trash in bin
            ↓
       [Recycling Bin]
         (collector)
            ↓
    Cleanup time = empty bin once! 🎉
```

**Key insight:** Instead of tracking each piece of trash separately, everyone tosses it into one bin. When cleanup time comes, you empty the bin once and everything is disposed.

 

## How Does It Work?

### Under the Hood

When you call `collector()`, it creates an object with an internal array to store cleanup functions:

```javascript
function collector() {
  const cleanups = [];      // Array to store cleanup functions
  let isDisposed = false;   // Flag to track if already cleaned up

  return {
    add(cleanup) {
      if (isDisposed) {
        console.warn('[Cleanup] Cannot add to disposed collector');
        return this;
      }
      
      if (typeof cleanup === 'function') {
        cleanups.push(cleanup);
      }
      return this;
    },
    
    cleanup() {
      if (isDisposed) return; // Already cleaned up
      
      isDisposed = true;
      cleanups.forEach(cleanup => {
        try {
          cleanup(); // Run each cleanup
        } catch (error) {
          console.error('[Cleanup] Collector error:', error);
        }
      });
      cleanups.length = 0; // Clear array
    },
    
    get size() {
      return cleanups.length;
    },
    
    get disposed() {
      return isDisposed;
    }
  };
}
```

**What's happening:**

```
1️⃣ Create collector
        ↓
   cleanups = []
   isDisposed = false
        ↓
2️⃣ Add cleanup functions
        ↓
   cleanups = [fn1, fn2, fn3]
        ↓
3️⃣ Call collector.cleanup()
        ↓
   Run fn1(), fn2(), fn3()
   Set isDisposed = true
   Clear cleanups array
```

### Error Safety

Notice the `try-catch` block? This ensures that if one cleanup function throws an error, the others still run:

```javascript
collector.add(() => { throw new Error('Oops!'); });
collector.add(() => console.log('This still runs!'));
collector.cleanup();
// Logs error, but continues to next cleanup
```

 

## Basic Usage

### Example 1: Simple Collector

```javascript
// Create a collector
const collector = collector();

// Add some cleanup functions
collector.add(() => console.log('Cleaning up A'));
collector.add(() => console.log('Cleaning up B'));
collector.add(() => console.log('Cleaning up C'));

// Check how many cleanups are registered
console.log('Total cleanups:', collector.size); // 3

// Run all cleanups
collector.cleanup();
// Logs:
// Cleaning up A
// Cleaning up B
// Cleaning up C

// Check if disposed
console.log('Is disposed?', collector.disposed); // true
console.log('Size after cleanup:', collector.size); // 0
```

**What's happening?**
1. Create an empty collector
2. Add three cleanup functions
3. Call `cleanup()` to run them all
4. Collector is now disposed and empty

 

### Example 2: Collector with Watchers

```javascript
const state = ReactiveUtils.state({ count: 0, name: 'Alice' });
const collector = collector();

// Add watchers to collector
collector.add(
  watch(state, {
    count: (val) => console.log('Count:', val)
  })
);

collector.add(
  watch(state, {
    name: (val) => console.log('Name:', val)
  })
);

// Test watchers
state.count = 5;  // Logs: Count: 5
state.name = 'Bob'; // Logs: Name: Bob

// Clean up all watchers
collector.cleanup();

// Now watchers are stopped
state.count = 10;   // Nothing logged
state.name = 'Charlie'; // Nothing logged
```

**What's happening?**
- We add two watchers to the collector
- Both watchers work normally
- After `cleanup()`, both watchers are stopped
- The collector prevents further reactions

 

### Example 3: Collector with Effects and Timers

```javascript
const state = ReactiveUtils.state({ count: 0 });
const collector = collector();

// Add effect
collector.add(
  effect(() => {
    console.log('Count is:', state.count);
  })
);
// Logs immediately: Count is: 0

// Add interval timer
const interval = setInterval(() => {
  state.count++;
  console.log('Timer tick:', state.count);
}, 1000);

collector.add(() => clearInterval(interval));

// After 3 seconds, clean up everything
setTimeout(() => {
  console.log('Cleaning up...');
  collector.cleanup();
  // Effect stops
  // Timer stops
}, 3000);
```

**What's happening?**
1. Effect runs immediately and watches `state.count`
2. Timer increments count every second
3. After 3 seconds, `cleanup()` stops both the effect and timer
4. No more reactions or timer ticks

 

## Deep Dive: Collector API

### The `add()` Method

```javascript
collector.add(cleanupFunction)
```

**What it does:**
- Adds a cleanup function to the collector
- Returns the collector (for chaining)
- Only accepts functions—ignores other types

**Example: Chaining**

```javascript
const collector = collector()
  .add(() => console.log('First'))
  .add(() => console.log('Second'))
  .add(() => console.log('Third'));

collector.cleanup();
// Logs: First, Second, Third
```

**Example: Conditional Adding**

```javascript
const collector = collector();

if (needsWatcher) {
  collector.add(watch(state, { count: (val) => console.log(val) }));
}

if (needsEffect) {
  collector.add(effect(() => console.log(state.count)));
}
```

**Example: Invalid Adds (Silently Ignored)**

```javascript
collector.add('not a function');  // Ignored
collector.add(123);                // Ignored
collector.add(null);               // Ignored
collector.add(() => 'valid!');     // Added ✓
```

 

### The `cleanup()` Method

```javascript
collector.cleanup()
```

**What it does:**
- Runs all cleanup functions in order
- Sets `disposed` flag to `true`
- Clears the cleanup array
- Safe to call multiple times (only runs once)

**Example: Multiple Calls (Safe)**

```javascript
const collector = collector();
collector.add(() => console.log('Cleanup'));

collector.cleanup(); // Logs: Cleanup
collector.cleanup(); // Does nothing (already disposed)
collector.cleanup(); // Does nothing (already disposed)
```

**Example: Error Handling**

```javascript
const collector = collector();

collector.add(() => {
  throw new Error('Cleanup error!');
});

collector.add(() => {
  console.log('This still runs!');
});

collector.cleanup();
// Logs error to console
// But still runs the second cleanup
```

 

### The `size` Property

```javascript
collector.size
```

**What it does:**
- Returns the number of cleanup functions currently in the collector
- Updates as you add functions
- Becomes 0 after `cleanup()` is called

**Example: Tracking Size**

```javascript
const collector = collector();

console.log(collector.size); // 0

collector.add(() => console.log('A'));
console.log(collector.size); // 1

collector.add(() => console.log('B'));
console.log(collector.size); // 2

collector.add(() => console.log('C'));
console.log(collector.size); // 3

collector.cleanup();
console.log(collector.size); // 0
```

**Example: Conditional Behavior**

```javascript
const collector = collector();

// Add some cleanups
collector.add(() => console.log('Cleanup 1'));
collector.add(() => console.log('Cleanup 2'));

// Only cleanup if there are any
if (collector.size > 0) {
  console.log(`Running ${collector.size} cleanups...`);
  collector.cleanup();
}
```

 

### The `disposed` Property

```javascript
collector.disposed
```

**What it does:**
- Returns `true` if `cleanup()` has been called
- Returns `false` if collector is still active
- Read-only property

**Example: Check Before Adding**

```javascript
const collector = collector();

console.log(collector.disposed); // false

collector.add(() => console.log('Cleanup 1'));

if (!collector.disposed) {
  collector.add(() => console.log('Cleanup 2'));
  // ✓ Added successfully
}

collector.cleanup();
console.log(collector.disposed); // true

if (!collector.disposed) {
  collector.add(() => console.log('Cleanup 3'));
  // ✗ Won't be added
}
```

**Example: Prevent Double Cleanup**

```javascript
function safeCleanup(collector) {
  if (collector.disposed) {
    console.log('Already disposed!');
    return;
  }
  
  console.log('Cleaning up...');
  collector.cleanup();
}

const collector = collector();
collector.add(() => console.log('Cleanup'));

safeCleanup(collector); // Logs: Cleaning up... Cleanup
safeCleanup(collector); // Logs: Already disposed!
```

 

## Advanced Patterns

### Pattern 1: Component Lifecycle

```javascript
class Component {
  constructor() {
    this.collector = collector();
    this.state = state({ count: 0 });
    
    // Add all reactive features to collector
    this.collector.add(
      watch(this.state, {
        count: (val) => this.render()
      })
    );
    
    this.collector.add(
      effect(() => {
        console.log('Count:', this.state.count);
      })
    );
  }
  
  render() {
    document.getElementById('count').textContent = this.state.count;
  }
  
  destroy() {
    console.log('Destroying component...');
    this.collector.cleanup();
    console.log('All cleanups done!');
  }
}

// Usage
const component = new Component();
// ... use component ...
component.destroy(); // One call cleans everything
```

 

### Pattern 2: Nested Collectors

```javascript
function createApp() {
  const appCollector = collector();
  
  function createFeature() {
    const featureCollector = collector();
    
    // Feature-specific cleanups
    featureCollector.add(() => console.log('Feature cleanup 1'));
    featureCollector.add(() => console.log('Feature cleanup 2'));
    
    // Add feature's cleanup to app collector
    appCollector.add(() => featureCollector.cleanup());
    
    return featureCollector;
  }
  
  const feature1 = createFeature();
  const feature2 = createFeature();
  
  return {
    destroy() {
      console.log('Destroying app...');
      appCollector.cleanup();
      // Cleans up all features automatically!
    }
  };
}
```

 

### Pattern 3: Conditional Cleanup

```javascript
function createDashboard(options) {
  const collector = collector();
  const state = ReactiveUtils.state({ data: [] });
  
  // Always add data watcher
  collector.add(
    watch(state, { data: (val) => renderData(val) })
  );
  
  // Conditionally add auto-refresh
  if (options.autoRefresh) {
    const interval = setInterval(() => {
      fetchData().then(data => state.data = data);
    }, options.refreshInterval || 5000);
    
    collector.add(() => clearInterval(interval));
  }
  
  // Conditionally add notifications
  if (options.notifications) {
    collector.add(
      watch(state, {
        data: (val) => showNotification('Data updated!')
      })
    );
  }
  
  return {
    destroy: () => collector.cleanup()
  };
}

// Usage
const dashboard = createDashboard({ 
  autoRefresh: true, 
  notifications: true 
});
// Later...
dashboard.destroy(); // Cleans up everything that was added
```

 

### Pattern 4: Async Cleanup

```javascript
async function createAsyncFeature() {
  const collector = collector();
  const state = ReactiveUtils.state({ data: null, loading: false });
  
  // Add async operation
  const abortController = new AbortController();
  
  collector.add(() => {
    console.log('Aborting async operations...');
    abortController.abort();
  });
  
  // Add cleanup for async state
  collector.add(() => {
    console.log('Cleaning up async state...');
    state.data = null;
    state.loading = false;
  });
  
  // Start async operation
  fetch('/api/data', { signal: abortController.signal })
    .then(res => res.json())
    .then(data => state.data = data)
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
      }
    });
  
  return {
    state,
    destroy: () => collector.cleanup()
  };
}

// Usage
const feature = await createAsyncFeature();
// ... use feature ...
feature.destroy(); // Aborts fetch and cleans up state
```

 

## Common Use Cases

### Use Case 1: React-like Component

```javascript
function Component(props) {
  const collector = collector();
  const state = ReactiveUtils.state({ 
    count: props.initialCount || 0,
    name: props.name || 'Guest'
  });
  
  // Mount lifecycle
  console.log('Component mounted');
  
  // Add watchers
  collector.add(
    watch(state, {
      count: (val) => {
        console.log('Count changed:', val);
        updateDOM();
      }
    })
  );
  
  // Add effects
  collector.add(
    effect(() => {
      document.title = `${state.name}: ${state.count}`;
    })
  );
  
  function updateDOM() {
    const el = document.getElementById('component');
    if (el) {
      el.innerHTML = `
        <h2>${state.name}</h2>
        <p>Count: ${state.count}</p>
        <button onclick="increment()">+</button>
      `;
    }
  }
  
  // Public API
  return {
    state,
    increment() {
      state.count++;
    },
    setName(newName) {
      state.name = newName;
    },
    unmount() {
      console.log('Component unmounting');
      collector.cleanup();
      console.log('Component unmounted');
    }
  };
}

// Usage
const component = Component({ initialCount: 5, name: 'Alice' });
component.increment(); // Works
component.setName('Bob'); // Works
component.unmount(); // Cleans everything
```

 

### Use Case 2: Event Listeners Management

```javascript
function setupEventListeners(element) {
  const collector = collector();
  
  // Click handler
  const handleClick = (e) => {
    console.log('Clicked!', e.target);
  };
  element.addEventListener('click', handleClick);
  collector.add(() => {
    element.removeEventListener('click', handleClick);
  });
  
  // Mouse move handler
  const handleMouseMove = (e) => {
    console.log('Mouse at:', e.clientX, e.clientY);
  };
  element.addEventListener('mousemove', handleMouseMove);
  collector.add(() => {
    element.removeEventListener('mousemove', handleMouseMove);
  });
  
  // Keyboard handler
  const handleKeydown = (e) => {
    console.log('Key pressed:', e.key);
  };
  window.addEventListener('keydown', handleKeydown);
  collector.add(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
  
  return () => {
    console.log('Removing all event listeners...');
    collector.cleanup();
  };
}

// Usage
const removeListeners = setupEventListeners(document.body);
// ... interact with page ...
removeListeners(); // All listeners removed!
```

 

### Use Case 3: Multiple Timers

```javascript
function createAnimationController() {
  const collector = collector();
  const state = ReactiveUtils.state({ 
    frame: 0,
    fps: 0,
    running: false
  });
  
  let animationFrame;
  let fpsInterval;
  
  function start() {
    if (state.running) return;
    state.running = true;
    
    // Animation loop
    const animate = () => {
      state.frame++;
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    
    collector.add(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    });
    
    // FPS counter
    let lastTime = Date.now();
    fpsInterval = setInterval(() => {
      const now = Date.now();
      state.fps = Math.round(1000 / (now - lastTime));
      lastTime = now;
    }, 1000);
    
    collector.add(() => {
      if (fpsInterval) {
        clearInterval(fpsInterval);
      }
    });
  }
  
  function stop() {
    collector.cleanup();
    state.running = false;
    state.frame = 0;
    state.fps = 0;
  }
  
  return { state, start, stop };
}

// Usage
const animation = createAnimationController();
animation.start(); // Starts animation and FPS counter
// ... animation runs ...
animation.stop(); // Stops everything cleanly
```

 

### Use Case 4: API Polling

```javascript
function createPollingService(url, interval = 5000) {
  const collector = collector();
  const state = ReactiveUtils.state({
    data: null,
    loading: false,
    error: null,
    lastUpdate: null
  });
  
  let pollInterval;
  let abortController;
  
  async function poll() {
    abortController = new AbortController();
    state.loading = true;
    
    try {
      const response = await fetch(url, { 
        signal: abortController.signal 
      });
      const data = await response.json();
      
      state.data = data;
      state.error = null;
      state.lastUpdate = new Date();
    } catch (error) {
      if (error.name !== 'AbortError') {
        state.error = error;
      }
    } finally {
      state.loading = false;
    }
  }
  
  function start() {
    // Initial poll
    poll();
    
    // Set up interval
    pollInterval = setInterval(poll, interval);
    
    // Add cleanups
    collector.add(() => {
      if (pollInterval) clearInterval(pollInterval);
    });
    
    collector.add(() => {
      if (abortController) abortController.abort();
    });
  }
  
  function stop() {
    console.log('Stopping polling service...');
    collector.cleanup();
  }
  
  return { state, start, stop };
}

// Usage
const service = createPollingService('/api/data', 3000);
service.start(); // Polls every 3 seconds
// ... use service.state.data ...
service.stop(); // Stops polling and cleans up
```

 

## Summary

### Key Takeaways

✅ **`collector()` creates a cleanup collector** that manages multiple cleanup functions  
✅ **Use `add()`** to add cleanup functions as you create features  
✅ **Use `cleanup()`** to run all cleanups at once  
✅ **Check `size`** to see how many cleanups are registered  
✅ **Check `disposed`** to see if cleanup has been called  
✅ **Perfect for component lifecycles** where you have many reactive features  
✅ **Error-safe:** One cleanup error won't prevent others from running  

### Quick Reference

```javascript
// Create collector
const collector = collector();

// Add cleanups (chainable)
collector.add(() => console.log('Cleanup 1'));
collector.add(() => console.log('Cleanup 2'));

// Check status
console.log(collector.size);      // Number of cleanups
console.log(collector.disposed);  // Has cleanup been called?

// Run all cleanups
collector.cleanup();
```

### One-Line Rule

> **Use `collector()` when you have multiple cleanup functions and want to dispose them all with a single call—perfect for component lifecycles and resource management.**

 

**Next Steps:**
- Learn about [`scope()`](./scope.md) for another cleanup pattern
- Read about [cleanup best practices](./cleanup-patterns.md)
- Explore [component lifecycle patterns](./component-patterns.md)