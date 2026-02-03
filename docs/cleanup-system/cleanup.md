# collector.cleanup()

Execute all cleanup functions stored in a collector and mark it as disposed.

## Quick Start (30 seconds)

```javascript
// Create collector and add cleanups
const myCollector = collector();
myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));
myCollector.add(() => console.log('Cleanup 3'));

// Execute all cleanups
myCollector.cleanup();
// Logs: Cleanup 1, Cleanup 2, Cleanup 3

// Collector is now disposed
console.log(myCollector.disposed); // true
console.log(myCollector.size);     // 0
```

**The magic:** `cleanup()` **runs all cleanup functions** you've added and **marks the collector as disposed**—one call to clean everything!

 

## What is collector.cleanup()?

`collector.cleanup()` is an **instance method** on a collector object that executes all registered cleanup functions in the order they were added, then marks the collector as disposed.

Simply put: **It's the "run everything and shut down" button for your collector.**

Think of it like this:
- You've added cleanup functions throughout your code
- They're sitting in the collector, waiting
- You call `cleanup()` when you're done
- All cleanups run, resources are freed, and the collector shuts down

 

## Syntax

```javascript
// Create collector and add cleanups
const myCollector = collector();
myCollector.add(cleanup1);
myCollector.add(cleanup2);

// Execute all cleanups
myCollector.cleanup();
```

**Parameters:**
- None—`cleanup()` takes no parameters

**Returns:**
- `undefined` (returns nothing)

**Side Effects:**
- Executes all cleanup functions in order
- Sets the `disposed` flag to `true`
- Clears the internal cleanup array (sets `size` to 0)
- Further `add()` calls will be ignored

 

## Why Does This Exist?

### The Challenge with Manual Cleanup

Imagine you've created multiple features, each with its own cleanup:

```javascript
const state = ReactiveUtils.state({ count: 0 });

// Feature 1
const unwatch1 = watch(state, { count: (v) => console.log('Watcher 1:', v) });

// Feature 2
const unwatch2 = watch(state, { count: (v) => console.log('Watcher 2:', v) });

// Feature 3
const stopEffect = effect(() => console.log('Effect:', state.count));

// Feature 4
const timer = setInterval(() => state.count++, 1000);

// Now cleanup manually - must remember all 4! 😰
unwatch1();
unwatch2();
stopEffect();
clearInterval(timer);
```

At first glance, this seems straightforward. But there are hidden problems.

**What's the Real Issue?**

```
Create 4 features
      ↓
Get 4 cleanup functions
      ↓
Must remember to call ALL 4
      ↓
In the RIGHT order
      ↓
Forget one = memory leak 💥
Forget order = potential bugs 💥
```

**Problems:**
❌ Must manually call each cleanup  
❌ Easy to forget one  
❌ Must remember correct order  
❌ Tedious and error-prone  
❌ Hard to maintain as features grow  

### The Solution with collector.cleanup()

With a collector, you add cleanups as you create features, then call `cleanup()` once:

```javascript
const state = ReactiveUtils.state({ count: 0 });
const myCollector = collector();

// Feature 1
myCollector.add(watch(state, { count: (v) => console.log('Watcher 1:', v) }));

// Feature 2
myCollector.add(watch(state, { count: (v) => console.log('Watcher 2:', v) }));

// Feature 3
myCollector.add(effect(() => console.log('Effect:', state.count)));

// Feature 4
const timer = setInterval(() => state.count++, 1000);
myCollector.add(() => clearInterval(timer));

// One call to cleanup everything! 🎉
myCollector.cleanup();
```

**What just happened?**

```
Create features
      ↓
Add each cleanup to collector
      ↓
Call cleanup() ONCE
      ↓
All cleanups run automatically
      ↓
In correct order
      ↓
Everything disposed! ✨
```

**Benefits:**
✅ Single call cleans everything  
✅ Can't forget individual cleanups  
✅ Correct execution order guaranteed  
✅ Clean, maintainable code  
✅ Scales as features grow  

 

## Mental Model

Think of `collector.cleanup()` like **end-of-day cleanup at a restaurant**:

### Without cleanup() (Manual Cleanup)
```
Restaurant Closing
├─ Turn off oven (remember!)
├─ Lock freezer (remember!)
├─ Clean grill (remember!)
├─ Turn off lights (remember!)
├─ Set alarm (remember!)
└─ Lock door (remember!)

Staff must remember all 6 tasks! 😰
Forget one = problem!
```

### With cleanup() (Checklist System)
```
Restaurant Closing
│
Press "Close Restaurant" button
      ↓
  [Checklist Runs]
      ├─ ✓ Turn off oven
      ├─ ✓ Lock freezer
      ├─ ✓ Clean grill
      ├─ ✓ Turn off lights
      ├─ ✓ Set alarm
      └─ ✓ Lock door
      ↓
All tasks done automatically! 🎉
```

**Key insight:** Instead of remembering every cleanup task, you have a single "close restaurant" button (`cleanup()`) that runs through a checklist and does everything for you.

 

## How Does It Work?

### Under the Hood

When you call `cleanup()`, it iterates through all cleanup functions and executes them:

```javascript
// Simplified implementation
function collector() {
  const cleanups = [];
  let isDisposed = false;
  
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
      // 1. Check if already disposed (prevent double cleanup)
      if (isDisposed) return;
      
      // 2. Mark as disposed
      isDisposed = true;
      
      // 3. Execute each cleanup function
      cleanups.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('[Cleanup] Collector error:', error);
        }
      });
      
      // 4. Clear the array
      cleanups.length = 0;
    },
    
    get size() { return cleanups.length; },
    get disposed() { return isDisposed; }
  };
}
```

**What's happening:**

```
1️⃣ Call cleanup()
        ↓
2️⃣ Check if already disposed
   (if yes, return early)
        ↓
3️⃣ Set disposed flag to true
        ↓
4️⃣ Loop through cleanups array
        ↓
5️⃣ Execute each function (with error handling)
        ↓
6️⃣ Clear the array (set size to 0)
        ↓
7️⃣ Collector is now disposed
```

### Execution Order

Cleanups run in the **order they were added**:

```javascript
myCollector.add(() => console.log('First'));
myCollector.add(() => console.log('Second'));
myCollector.add(() => console.log('Third'));

myCollector.cleanup();
// Output:
// First
// Second
// Third
```

This is usually what you want—resources are cleaned up in FIFO (first-in, first-out) order.

 

## Basic Usage

### Example 1: Simple Cleanup

```javascript
const myCollector = collector();

// Add cleanups
myCollector.add(() => console.log('Step 1: Close connections'));
myCollector.add(() => console.log('Step 2: Save state'));
myCollector.add(() => console.log('Step 3: Clear cache'));

console.log('Before cleanup - size:', myCollector.size); // 3
console.log('Before cleanup - disposed:', myCollector.disposed); // false

// Run cleanup
myCollector.cleanup();
// Logs:
// Step 1: Close connections
// Step 2: Save state
// Step 3: Clear cache

console.log('After cleanup - size:', myCollector.size); // 0
console.log('After cleanup - disposed:', myCollector.disposed); // true
```

**What's happening?**
1. Add three cleanup functions
2. Check status before cleanup
3. Call `cleanup()` to run all functions
4. Check status after cleanup—size is 0, disposed is true

 

### Example 2: Cleaning Up Watchers

```javascript
const state = ReactiveUtils.state({ count: 0, name: 'Alice' });
const myCollector = collector();

// Add watchers
myCollector.add(
  watch(state, {
    count: (val) => console.log('Count changed to:', val)
  })
);

myCollector.add(
  watch(state, {
    name: (val) => console.log('Name changed to:', val)
  })
);

// Test watchers
state.count = 5;     // Logs: Count changed to: 5
state.name = 'Bob';  // Logs: Name changed to: Bob

// Clean up
console.log('Cleaning up', myCollector.size, 'watchers...');
myCollector.cleanup();

// Watchers are now stopped
state.count = 10;       // Nothing logged
state.name = 'Charlie'; // Nothing logged

console.log('Watchers stopped!');
```

**What's happening?**
- Watchers work normally before cleanup
- `cleanup()` stops all watchers
- State changes after cleanup don't trigger watchers

 

### Example 3: Component Lifecycle

```javascript
class Dashboard {
  constructor() {
    this.collector = collector();
    this.state = state({ 
      data: [],
      loading: false
    });
    
    // Add watcher
    this.collector.add(
      watch(this.state, {
        loading: (val) => {
          console.log('Loading:', val);
          this.updateUI();
        }
      })
    );
    
    // Add effect
    this.collector.add(
      effect(() => {
        console.log('Data items:', this.state.data.length);
      })
    );
    
    // Add timer
    const timer = setInterval(() => {
      this.state.data.push({ id: Date.now() });
    }, 2000);
    
    this.collector.add(() => {
      console.log('Stopping timer');
      clearInterval(timer);
    });
    
    console.log('Dashboard initialized with', this.collector.size, 'cleanups');
  }
  
  updateUI() {
    console.log('UI updated');
  }
  
  destroy() {
    console.log('Destroying dashboard...');
    this.collector.cleanup();
    console.log('Dashboard destroyed!');
  }
}

// Usage
const dashboard = new Dashboard();
// Dashboard initialized with 3 cleanups
// Data items: 0

setTimeout(() => {
  dashboard.destroy();
  // Destroying dashboard...
  // Stopping timer
  // Dashboard destroyed!
}, 5000);
```

**What's happening?**
- Constructor creates features and adds cleanups
- Each feature works normally
- `destroy()` calls `cleanup()` to dispose everything
- One call stops all watchers, effects, and timers

 

## Deep Dive: Cleanup Execution

### Synchronous Execution

All cleanups run **synchronously** in sequence:

```javascript
const myCollector = collector();

myCollector.add(() => {
  console.log('Cleanup 1 start');
  // Some work...
  console.log('Cleanup 1 end');
});

myCollector.add(() => {
  console.log('Cleanup 2 start');
  // Some work...
  console.log('Cleanup 2 end');
});

console.log('Before cleanup');
myCollector.cleanup();
console.log('After cleanup');

// Output:
// Before cleanup
// Cleanup 1 start
// Cleanup 1 end
// Cleanup 2 start
// Cleanup 2 end
// After cleanup
```

**Key insight:** `cleanup()` blocks until all functions finish. No async/await needed.

 

### Async Cleanups (Not Recommended)

While cleanup functions can be async, `cleanup()` doesn't await them:

```javascript
const myCollector = collector();

myCollector.add(async () => {
  console.log('Async cleanup start');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Async cleanup end (1 second later)');
});

myCollector.add(() => {
  console.log('Sync cleanup');
});

console.log('Before cleanup');
myCollector.cleanup();
console.log('After cleanup (immediate)');

// Output:
// Before cleanup
// Async cleanup start
// Sync cleanup
// After cleanup (immediate)
// Async cleanup end (1 second later) ← Still runs!
```

**What's happening:**
- Async cleanup starts but doesn't block
- Sync cleanup runs immediately
- `cleanup()` returns before async finishes
- Async cleanup completes in background

**Best practice:** Keep cleanup functions synchronous when possible.

 

### Order-Dependent Cleanup

Sometimes cleanup order matters:

```javascript
const myCollector = collector();

// Database connection
let dbConnection = null;

myCollector.add(() => {
  console.log('Opening database...');
  dbConnection = { connected: true };
});

// Database operations
myCollector.add(() => {
  if (dbConnection && dbConnection.connected) {
    console.log('Closing database...');
    dbConnection.connected = false;
    dbConnection = null;
  }
});

// File operations (depend on database)
myCollector.add(() => {
  console.log('Cleaning up files...');
  // Files use database, so this should run first
});

// PROBLEM: Wrong order!
myCollector.cleanup();
// Cleaning up files... (tries to use database)
// Closing database... (database closed too late!)
// Opening database... (this shouldn't run!)
```

**Solution:** Add in reverse order:

```javascript
const myCollector = collector();
let dbConnection = null;

// Add in reverse order of what you want to happen

// 3. Last to cleanup (opened first)
myCollector.add(() => {
  console.log('Opening database...');
  dbConnection = { connected: true };
});

// 2. Second to cleanup
myCollector.add(() => {
  if (dbConnection && dbConnection.connected) {
    console.log('Closing database...');
    dbConnection.connected = false;
    dbConnection = null;
  }
});

// 1. First to cleanup (opened last)
myCollector.add(() => {
  console.log('Cleaning up files...');
});

myCollector.cleanup();
// Opening database...
// Closing database...
// Cleaning up files... ✓ Correct order!
```

 

## Error Handling

### Errors Don't Stop Other Cleanups

If one cleanup throws an error, others still run:

```javascript
const myCollector = collector();

myCollector.add(() => {
  console.log('Cleanup 1: OK');
});

myCollector.add(() => {
  console.log('Cleanup 2: ERROR!');
  throw new Error('Something went wrong!');
});

myCollector.add(() => {
  console.log('Cleanup 3: OK (still runs!)');
});

myCollector.cleanup();
// Output:
// Cleanup 1: OK
// Cleanup 2: ERROR!
// [Error logged to console]
// Cleanup 3: OK (still runs!)
```

**What's happening:**
- Each cleanup is wrapped in a try-catch
- Errors are logged but don't stop execution
- All cleanups get a chance to run

**Why this is good:**
- One broken cleanup doesn't prevent others
- More resilient to errors
- Better for debugging (all cleanups attempt to run)

 

### Handling Errors Gracefully

Best practice: Handle errors inside your cleanup functions:

```javascript
const myCollector = collector();

myCollector.add(() => {
  try {
    console.log('Risky cleanup...');
    // Something that might fail
    if (Math.random() > 0.5) {
      throw new Error('Failed!');
    }
    console.log('Success!');
  } catch (error) {
    console.log('Handled error:', error.message);
  }
});

myCollector.cleanup();
// Either:
// Risky cleanup... Success!
// Or:
// Risky cleanup... Handled error: Failed!
```

 

## Common Patterns

### Pattern 1: Cleanup on Unmount

```javascript
function createComponent() {
  const myCollector = collector();
  const state = ReactiveUtils.state({ visible: true });
  
  // Setup
  myCollector.add(
    watch(state, {
      visible: (val) => console.log('Visibility:', val)
    })
  );
  
  return {
    state,
    unmount() {
      console.log('Component unmounting...');
      myCollector.cleanup();
      console.log('Component unmounted!');
    }
  };
}

const component = createComponent();
component.state.visible = false; // Logs: Visibility: false
component.unmount();
// Logs: Component unmounting... Component unmounted!
```

 

### Pattern 2: Auto-Cleanup After Timeout

```javascript
function createTemporaryFeature(duration = 5000) {
  const myCollector = collector();
  
  console.log('Feature started');
  
  // Add some features
  myCollector.add(() => console.log('Cleanup A'));
  myCollector.add(() => console.log('Cleanup B'));
  
  // Auto-cleanup after duration
  setTimeout(() => {
    console.log('Auto-cleanup triggered');
    myCollector.cleanup();
  }, duration);
  
  return {
    manualCleanup: () => myCollector.cleanup()
  };
}

const feature = createTemporaryFeature(3000);
// Feature started
// ... 3 seconds later ...
// Auto-cleanup triggered
// Cleanup A
// Cleanup B
```

 

### Pattern 3: Conditional Cleanup

```javascript
function createFeature(options) {
  const myCollector = collector();
  let cleanedUp = false;
  
  myCollector.add(() => console.log('Cleanup 1'));
  myCollector.add(() => console.log('Cleanup 2'));
  
  return {
    cleanup(force = false) {
      if (cleanedUp) {
        console.log('Already cleaned up');
        return;
      }
      
      if (!force && !options.allowCleanup) {
        console.log('Cleanup not allowed');
        return;
      }
      
      console.log('Cleaning up...');
      myCollector.cleanup();
      cleanedUp = true;
    }
  };
}

const feature = createFeature({ allowCleanup: false });
feature.cleanup();       // Logs: Cleanup not allowed
feature.cleanup(true);   // Logs: Cleaning up... Cleanup 1, Cleanup 2
feature.cleanup();       // Logs: Already cleaned up
```

 

### Pattern 4: Cleanup with Logging

```javascript
function createMonitoredFeature() {
  const myCollector = collector();
  const startTime = Date.now();
  
  myCollector.add(() => {
    console.log('Cleanup: Resource 1');
  });
  
  myCollector.add(() => {
    console.log('Cleanup: Resource 2');
  });
  
  myCollector.add(() => {
    console.log('Cleanup: Resource 3');
  });
  
  return {
    cleanup() {
      const elapsed = Date.now() - startTime;
      console.log(`Starting cleanup after ${elapsed}ms`);
      console.log(`Cleaning up ${myCollector.size} resources`);
      
      myCollector.cleanup();
      
      console.log('Cleanup complete');
    }
  };
}

const feature = createMonitoredFeature();
setTimeout(() => feature.cleanup(), 2000);
// Starting cleanup after 2003ms
// Cleaning up 3 resources
// Cleanup: Resource 1
// Cleanup: Resource 2
// Cleanup: Resource 3
// Cleanup complete
```

 

## Edge Cases and Gotchas

### Gotcha 1: Multiple Calls (Safe)

```javascript
const myCollector = collector();
myCollector.add(() => console.log('Cleanup'));

myCollector.cleanup(); // Runs cleanup
// Logs: Cleanup

myCollector.cleanup(); // Does nothing (already disposed)
myCollector.cleanup(); // Does nothing
myCollector.cleanup(); // Does nothing

console.log(myCollector.disposed); // true
```

**What's happening:**
- First `cleanup()` runs cleanups and sets `disposed` flag
- Subsequent calls check `disposed` and return early
- Safe to call multiple times—no double cleanup

 

### Gotcha 2: Empty Collector

```javascript
const myCollector = collector();
// Nothing added

myCollector.cleanup(); // Runs fine, does nothing

console.log(myCollector.size); // 0
console.log(myCollector.disposed); // true
```

**What's happening:**
- Calling `cleanup()` on empty collector is fine
- Sets `disposed` flag even with no cleanups
- No errors or warnings

 

### Gotcha 3: Adding After Cleanup

```javascript
const myCollector = collector();
myCollector.add(() => console.log('Cleanup 1'));

myCollector.cleanup();
// Logs: Cleanup 1

// Try to add after cleanup
myCollector.add(() => console.log('Cleanup 2'));
// Warning: Cannot add to disposed collector

console.log(myCollector.size); // 0 (not added)
```

**What's happening:**
- Once disposed, no more cleanups can be added
- `add()` calls are ignored with a warning
- Check `disposed` before adding

 

### Gotcha 4: Cleanup Within Cleanup

```javascript
const myCollector = collector();

myCollector.add(() => {
  console.log('Cleanup 1');
  
  // Don't do this!
  myCollector.cleanup();
});

myCollector.add(() => {
  console.log('Cleanup 2 (never runs!)');
});

myCollector.cleanup();
// Logs: Cleanup 1
// Cleanup 2 never runs because cleanup() was called recursively
```

**What's happening:**
- Calling `cleanup()` inside a cleanup sets the `disposed` flag
- Remaining cleanups are skipped
- **Never call `cleanup()` from within a cleanup function**

 

## Summary

### Key Takeaways

✅ **`cleanup()` is an instance method** that runs all cleanup functions  
✅ **Executes in order**—cleanups run in the sequence they were added  
✅ **Marks collector as disposed**—further adds are rejected  
✅ **Clears the cleanup array**—size becomes 0 after cleanup  
✅ **Error-safe**—one cleanup error doesn't prevent others from running  
✅ **Safe to call multiple times**—subsequent calls do nothing  
✅ **Synchronous execution**—blocks until all cleanups finish  

### Quick Reference

```javascript
// Create and populate collector
const myCollector = collector();
myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));
myCollector.add(() => console.log('Cleanup 3'));

// Execute all cleanups
myCollector.cleanup();
// Logs: Cleanup 1, Cleanup 2, Cleanup 3

// Check status
console.log(myCollector.size);     // 0 (cleared)
console.log(myCollector.disposed); // true

// Safe to call again
myCollector.cleanup(); // Does nothing
```

### One-Line Rule

> **Call `cleanup()` when you're done with a feature to run all cleanup functions, free resources, and mark the collector as disposed—one call handles everything.**

 

**Next Steps:**
- Learn about [`collector.add()`](./collector.add.md) to add cleanup functions
- Learn about [`collector.size`](./collector.size.md) to check cleanup count
- Learn about [`collector.disposed`](./collector.disposed.md) to check if disposed