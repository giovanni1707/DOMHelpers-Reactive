# collector.disposed

Check whether a collector has been disposed (cleanup has been called).

## Quick Start (30 seconds)

```javascript
// Create collector
const myCollector = collector();

console.log(myCollector.disposed); // false (active)

// Add and run cleanups
myCollector.add(() => console.log('Cleanup'));
myCollector.cleanup();

console.log(myCollector.disposed); // true (disposed)

// Try to add after disposal
myCollector.add(() => console.log('Will not be added'));
console.log(myCollector.size); // 0 (rejected)
```

**The magic:** `disposed` tells you **whether cleanup has been called**—use it to prevent double-cleanup and ensure proper state!

 

## What is collector.disposed?

`collector.disposed` is a **read-only getter property** on a collector instance that returns `true` if `cleanup()` has been called, and `false` otherwise.

Simply put: **It's a boolean flag that tells you "has this collector been shut down?"**

Think of it like this:
- You have a collector managing resources
- While active, `disposed = false`
- After `cleanup()` is called, `disposed = true`
- Once disposed, the collector rejects new additions

 

## Syntax

```javascript
// Create collector
const myCollector = collector();

// Check disposed status
const isDisposed = myCollector.disposed;
console.log(isDisposed); // true or false

// Use in conditions
if (myCollector.disposed) {
  console.log('Already disposed');
} else {
  console.log('Still active');
}

// Cannot set (read-only)
myCollector.disposed = true; // Does nothing
```

**Type:**
- **Read-only getter property** (not a method—no parentheses)

**Returns:**
- `false` - Collector is active, can accept new cleanups
- `true` - Collector is disposed, rejects new cleanups

 

## Why Does This Exist?

### The Challenge Without Disposal Tracking

Imagine managing a collector without knowing if it's been disposed:

```javascript
const myCollector = collector();

myCollector.add(() => console.log('Cleanup 1'));
myCollector.cleanup();

// Later in the code...
// Should I add more cleanups? 🤷
myCollector.add(() => console.log('Cleanup 2'));
// Gets ignored, but you don't know why!

// Can I cleanup again? 🤷
myCollector.cleanup();
// Does nothing, but you don't know why!

// Is this collector still usable? 🤷
// No way to check!
```

At first glance, this might seem manageable. But in complex applications with multiple cleanup calls, you need to track state.

**What's the Real Issue?**

```
Call cleanup()
      ↓
No way to know it was called
      ↓
Code tries to add() or cleanup() again
      ↓
Operations silently fail
      ↓
Confusion and bugs 😰
```

**Problems:**
❌ Can't tell if cleanup has been called  
❌ Can't prevent double-cleanup  
❌ Can't check before adding cleanups  
❌ Silent failures confuse developers  
❌ No way to verify collector state  

### The Solution with collector.disposed

With `disposed`, you can check the collector's state before operations:

```javascript
const myCollector = collector();

myCollector.add(() => console.log('Cleanup 1'));

console.log('Before cleanup:', myCollector.disposed); // false

myCollector.cleanup();

console.log('After cleanup:', myCollector.disposed); // true

// Check before adding
if (!myCollector.disposed) {
  myCollector.add(() => console.log('Cleanup 2'));
  console.log('✓ Added');
} else {
  console.log('✗ Cannot add - already disposed');
}
// Output: ✗ Cannot add - already disposed

// Prevent double-cleanup
if (!myCollector.disposed) {
  myCollector.cleanup();
} else {
  console.log('Already cleaned up');
}
// Output: Already cleaned up
```

**What just happened?**

```
Check disposed (false)
      ↓
Run cleanup
      ↓
Check disposed (true)
      ↓
Guard operations with check
      ↓
Prevent errors
      ↓
Full control! ✨
```

**Benefits:**
✅ Know if cleanup has been called  
✅ Prevent double-cleanup  
✅ Check before adding cleanups  
✅ Explicit state management  
✅ Easier debugging  

 

## Mental Model

Think of `collector.disposed` like a **store's "CLOSED" sign**:

### Without disposed Flag (No Sign)
```
Store
├─ Try to enter → Door locked? Open? 🤷
├─ Try to shop → Still open? 🤷
└─ Try to checkout → Working? 🤷

No way to know store status!
```

### With disposed Flag (Clear Sign)
```
Store [OPEN] 👈 disposed = false
├─ ✓ Enter freely
├─ ✓ Add items to cart
└─ ✓ Checkout available

         [Closing time]
              ↓
Store [CLOSED] 👈 disposed = true
├─ ✗ Cannot enter
├─ ✗ Cannot add items
└─ ✗ Checkout unavailable

Clear status at all times! ✨
```

**Key insight:** Just like a store sign tells you whether you can shop, `disposed` tells you whether you can use the collector—instant clarity!

 

## How Does It Work?

### Under the Hood

`disposed` is implemented as a getter that returns an internal flag:

```javascript
// Simplified implementation
function collector() {
  const cleanups = [];
  let isDisposed = false; // Internal flag
  
  return {
    add(cleanup) {
      // Check disposed flag
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
      // Check disposed flag (prevent double cleanup)
      if (isDisposed) return;
      
      // Set flag BEFORE running cleanups
      isDisposed = true;
      
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('[Cleanup] Collector error:', error);
        }
      });
      
      cleanups.length = 0;
    },
    
    get size() {
      return cleanups.length;
    },
    
    // Getter property
    get disposed() {
      return isDisposed; // Return flag
    }
  };
}
```

**What's happening:**

```
1️⃣ Create collector
        ↓
   isDisposed = false
   disposed = false
        ↓
2️⃣ Add cleanups
        ↓
   isDisposed = false
   disposed = false
        ↓
3️⃣ Call cleanup()
        ↓
   isDisposed = true ← Set immediately
   disposed = true
        ↓
4️⃣ Run cleanup functions
        ↓
   isDisposed = true
   disposed = true
        ↓
5️⃣ Future add() calls rejected
   Future cleanup() calls ignored
```

### Flag is Set BEFORE Cleanups Run

Important detail: the `isDisposed` flag is set to `true` **before** cleanup functions execute:

```javascript
cleanup() {
  if (isDisposed) return;
  
  isDisposed = true; // ← Set first
  
  cleanups.forEach(fn => fn()); // ← Then run cleanups
  
  cleanups.length = 0;
}
```

This prevents issues if cleanup functions try to add new cleanups or call `cleanup()` again.

 

## Basic Usage

### Example 1: Check Before Operations

```javascript
const myCollector = collector();

function safeAdd(cleanup) {
  if (myCollector.disposed) {
    console.log('✗ Cannot add: Collector disposed');
    return false;
  }
  
  myCollector.add(cleanup);
  console.log('✓ Added successfully');
  return true;
}

safeAdd(() => console.log('Cleanup 1')); // ✓ Added successfully

myCollector.cleanup();

safeAdd(() => console.log('Cleanup 2')); // ✗ Cannot add: Collector disposed
```

**What's happening?**
- Check `disposed` before adding
- Provide clear feedback to user
- Prevent silent failures

 

### Example 2: Prevent Double Cleanup

```javascript
const myCollector = collector();

myCollector.add(() => console.log('Cleanup'));

function safeCleanup() {
  if (myCollector.disposed) {
    console.log('Already disposed');
    return;
  }
  
  console.log('Running cleanup...');
  myCollector.cleanup();
}

safeCleanup(); // Running cleanup... Cleanup
safeCleanup(); // Already disposed
safeCleanup(); // Already disposed
```

**What's happening?**
- Check `disposed` before cleanup
- Prevent redundant cleanup calls
- Provide clear status messages

 

### Example 3: Lifecycle States

```javascript
const myCollector = collector();

function getState() {
  if (myCollector.disposed) {
    return 'DISPOSED';
  } else if (myCollector.size === 0) {
    return 'EMPTY';
  } else {
    return 'ACTIVE';
  }
}

console.log('State:', getState()); // EMPTY

myCollector.add(() => console.log('Cleanup'));
console.log('State:', getState()); // ACTIVE

myCollector.cleanup();
console.log('State:', getState()); // DISPOSED
```

**What's happening?**
- Combine `disposed` and `size` to determine state
- Provide clear lifecycle visibility
- Make state-based decisions

 

### Example 4: Component Status

```javascript
class Component {
  constructor() {
    this.collector = collector();
    this.setupComplete = false;
  }
  
  setup() {
    if (this.collector.disposed) {
      console.error('Cannot setup: Component already destroyed');
      return;
    }
    
    console.log('Setting up component...');
    
    this.collector.add(() => {
      console.log('Cleanup: Remove event listeners');
    });
    
    this.collector.add(() => {
      console.log('Cleanup: Clear timers');
    });
    
    this.setupComplete = true;
    console.log('Setup complete');
  }
  
  destroy() {
    if (this.collector.disposed) {
      console.log('Already destroyed');
      return;
    }
    
    console.log('Destroying component...');
    this.collector.cleanup();
    this.setupComplete = false;
    console.log('Component destroyed');
  }
  
  getStatus() {
    return {
      setup: this.setupComplete,
      disposed: this.collector.disposed,
      cleanups: this.collector.size
    };
  }
}

const component = new Component();

console.log('Status:', component.getStatus());
// { setup: false, disposed: false, cleanups: 0 }

component.setup();
// Setting up component...
// Setup complete

console.log('Status:', component.getStatus());
// { setup: true, disposed: false, cleanups: 2 }

component.destroy();
// Destroying component...
// Cleanup: Remove event listeners
// Cleanup: Clear timers
// Component destroyed

console.log('Status:', component.getStatus());
// { setup: false, disposed: true, cleanups: 0 }

component.destroy();
// Already destroyed
```

**What's happening?**
- Use `disposed` to prevent re-initialization
- Prevent double-destruction
- Provide status information

 

## Deep Dive: Disposal State

### State Transitions

A collector goes through these states:

```
CREATED (disposed: false, size: 0)
   ↓
   add() → ACTIVE (disposed: false, size: 1+)
   ↓
   cleanup() → DISPOSED (disposed: true, size: 0)
   ↓
   [Final state - no more transitions]
```

Once disposed, the collector stays disposed forever.

 

### Pattern 1: State Machine

```javascript
function createStateMachine() {
  const myCollector = collector();
  
  const states = {
    IDLE: 'IDLE',
    ACTIVE: 'ACTIVE',
    DISPOSED: 'DISPOSED'
  };
  
  function getState() {
    if (myCollector.disposed) {
      return states.DISPOSED;
    } else if (myCollector.size > 0) {
      return states.ACTIVE;
    } else {
      return states.IDLE;
    }
  }
  
  function transition(action) {
    const currentState = getState();
    console.log(`[${currentState}] Action: ${action}`);
    
    switch (action) {
      case 'ADD':
        if (currentState === states.DISPOSED) {
          console.log('  ✗ Rejected: Already disposed');
          return false;
        }
        myCollector.add(() => console.log('Cleanup'));
        console.log(`  ✓ Transition: ${currentState} → ${getState()}`);
        return true;
        
      case 'CLEANUP':
        if (currentState === states.DISPOSED) {
          console.log('  ✗ Rejected: Already disposed');
          return false;
        }
        myCollector.cleanup();
        console.log(`  ✓ Transition: ${currentState} → ${getState()}`);
        return true;
        
      default:
        console.log('  ✗ Unknown action');
        return false;
    }
  }
  
  return { getState, transition };
}

const sm = createStateMachine();

console.log('Initial state:', sm.getState()); // IDLE

sm.transition('ADD');
// [IDLE] Action: ADD
//   ✓ Transition: IDLE → ACTIVE

sm.transition('ADD');
// [ACTIVE] Action: ADD
//   ✓ Transition: ACTIVE → ACTIVE

sm.transition('CLEANUP');
// [ACTIVE] Action: CLEANUP
//   ✓ Transition: ACTIVE → DISPOSED

sm.transition('ADD');
// [DISPOSED] Action: ADD
//   ✗ Rejected: Already disposed

sm.transition('CLEANUP');
// [DISPOSED] Action: CLEANUP
//   ✗ Rejected: Already disposed
```

 

### Pattern 2: Disposal Guards

```javascript
function createGuardedCollector() {
  const myCollector = collector();
  
  function guardedAdd(cleanup, label = 'cleanup') {
    if (myCollector.disposed) {
      throw new Error(`Cannot add ${label}: Collector disposed`);
    }
    myCollector.add(cleanup);
  }
  
  function guardedCleanup() {
    if (myCollector.disposed) {
      throw new Error('Collector already disposed');
    }
    myCollector.cleanup();
  }
  
  return {
    add: guardedAdd,
    cleanup: guardedCleanup,
    get disposed() { return myCollector.disposed; },
    get size() { return myCollector.size; }
  };
}

const guarded = createGuardedCollector();

guarded.add(() => console.log('Cleanup 1'), 'timer');
guarded.cleanup();

try {
  guarded.add(() => console.log('Cleanup 2'), 'watcher');
} catch (error) {
  console.error('Error:', error.message);
  // Error: Cannot add watcher: Collector disposed
}
```

 

### Pattern 3: Conditional Reuse (Anti-Pattern)

```javascript
// ❌ ANTI-PATTERN: Don't try to "reuse" a disposed collector
function reuseCollector(myCollector) {
  if (myCollector.disposed) {
    console.log('Collector disposed, creating new one...');
    myCollector = collector(); // This doesn't work!
    // The original reference is not updated
  }
  
  myCollector.add(() => console.log('Cleanup'));
  return myCollector;
}

// ✅ CORRECT: Create a new collector if needed
function getOrCreateCollector(existingCollector) {
  if (!existingCollector || existingCollector.disposed) {
    console.log('Creating new collector...');
    return collector();
  }
  
  return existingCollector;
}

let myCollector = collector();
myCollector.add(() => console.log('Cleanup 1'));
myCollector.cleanup();

myCollector = getOrCreateCollector(myCollector);
myCollector.add(() => console.log('Cleanup 2'));
```

 

## Common Patterns

### Pattern 1: Cleanup Manager

```javascript
class CleanupManager {
  constructor() {
    this.collector = collector();
  }
  
  register(name, cleanupFn) {
    if (this.collector.disposed) {
      console.error(`Cannot register ${name}: Manager disposed`);
      return false;
    }
    
    this.collector.add(cleanupFn);
    console.log(`✓ Registered: ${name}`);
    return true;
  }
  
  dispose() {
    if (this.collector.disposed) {
      console.log('Already disposed');
      return;
    }
    
    console.log('Disposing manager...');
    this.collector.cleanup();
    console.log('Manager disposed');
  }
  
  get isActive() {
    return !this.collector.disposed;
  }
  
  get status() {
    return {
      active: this.isActive,
      disposed: this.collector.disposed,
      registeredCleanups: this.collector.size
    };
  }
}

const manager = new CleanupManager();

console.log('Status:', manager.status);
// { active: true, disposed: false, registeredCleanups: 0 }

manager.register('Timer', () => console.log('Stop timer'));
manager.register('Listener', () => console.log('Remove listener'));

console.log('Status:', manager.status);
// { active: true, disposed: false, registeredCleanups: 2 }

manager.dispose();
// Disposing manager...
// Stop timer
// Remove listener
// Manager disposed

console.log('Status:', manager.status);
// { active: false, disposed: true, registeredCleanups: 0 }

manager.register('New cleanup', () => console.log('Never added'));
// Cannot register New cleanup: Manager disposed
```

 

### Pattern 2: Lifecycle Hooks

```javascript
function createWithLifecycle() {
  const myCollector = collector();
  const hooks = {
    beforeDispose: [],
    afterDispose: []
  };
  
  function on(event, callback) {
    if (hooks[event]) {
      hooks[event].push(callback);
    }
  }
  
  function dispose() {
    if (myCollector.disposed) {
      console.log('Already disposed');
      return;
    }
    
    // Run before hooks
    hooks.beforeDispose.forEach(fn => fn());
    
    // Run cleanup
    myCollector.cleanup();
    
    // Run after hooks
    hooks.afterDispose.forEach(fn => fn());
  }
  
  return {
    collector: myCollector,
    on,
    dispose,
    get disposed() { return myCollector.disposed; }
  };
}

const lifecycle = createWithLifecycle();

lifecycle.on('beforeDispose', () => {
  console.log('Before: Saving state...');
});

lifecycle.on('afterDispose', () => {
  console.log('After: Cleanup complete!');
});

lifecycle.collector.add(() => {
  console.log('Cleanup: Resource released');
});

lifecycle.dispose();
// Before: Saving state...
// Cleanup: Resource released
// After: Cleanup complete!

console.log('Disposed?', lifecycle.disposed); // true
```

 

### Pattern 3: Assertion Helpers

```javascript
function assertActive(myCollector, operation = 'operation') {
  if (myCollector.disposed) {
    throw new Error(`Cannot perform ${operation}: Collector disposed`);
  }
}

function assertDisposed(myCollector, operation = 'operation') {
  if (!myCollector.disposed) {
    throw new Error(`Cannot perform ${operation}: Collector still active`);
  }
}

const myCollector = collector();

// Use assertions
try {
  assertActive(myCollector, 'add cleanup');
  myCollector.add(() => console.log('Cleanup'));
  console.log('✓ Added');
} catch (error) {
  console.error(error.message);
}

myCollector.cleanup();

// Now disposed
try {
  assertDisposed(myCollector, 'verify disposal');
  console.log('✓ Collector properly disposed');
} catch (error) {
  console.error(error.message);
}

// Try to add after disposal
try {
  assertActive(myCollector, 'add cleanup');
  myCollector.add(() => console.log('Never added'));
} catch (error) {
  console.error(error.message);
  // Cannot perform add cleanup: Collector disposed
}
```

 

## Edge Cases and Gotchas

### Gotcha 1: disposed is Read-Only

```javascript
const myCollector = collector();

console.log(myCollector.disposed); // false

// Try to set disposed (does nothing)
myCollector.disposed = true;

console.log(myCollector.disposed); // Still false (not changed)

// Only cleanup() changes disposed
myCollector.cleanup();
console.log(myCollector.disposed); // true ✓
```

**What's happening:**
- `disposed` is a getter property without a setter
- Assignment attempts are silently ignored
- Only `cleanup()` can set disposed to true

 

### Gotcha 2: Empty Collector Can Be Disposed

```javascript
const myCollector = collector();
// No cleanups added

console.log(myCollector.size); // 0
console.log(myCollector.disposed); // false

// Cleanup empty collector
myCollector.cleanup();

console.log(myCollector.size); // Still 0
console.log(myCollector.disposed); // true ✓
```

**What's happening:**
- `disposed` reflects whether `cleanup()` was called
- Not whether there were any cleanups to run
- Empty collector can still be disposed

 

### Gotcha 3: disposed Set Before Cleanups Run

```javascript
const myCollector = collector();

myCollector.add(() => {
  console.log('Cleanup running');
  console.log('disposed inside cleanup:', myCollector.disposed);
  // true! (set before cleanups execute)
});

console.log('Before cleanup:', myCollector.disposed); // false

myCollector.cleanup();
// Cleanup running
// disposed inside cleanup: true

console.log('After cleanup:', myCollector.disposed); // true
```

**What's happening:**
- `disposed` is set to `true` immediately when `cleanup()` is called
- Before any cleanup functions run
- Cleanup functions see `disposed = true`

 

### Gotcha 4: Cannot "Un-dispose"

```javascript
const myCollector = collector();

myCollector.add(() => console.log('Cleanup'));
myCollector.cleanup();

console.log(myCollector.disposed); // true

// No way to "reset" or "un-dispose"
// Collector is permanently disposed

// Must create new collector
const newCollector = collector();
console.log(newCollector.disposed); // false
newCollector.add(() => console.log('New cleanup'));
```

**What's happening:**
- Once disposed, always disposed
- No way to reset a collector
- Must create a new collector instance if needed

 

## Summary

### Key Takeaways

✅ **`disposed` is a read-only boolean property**—not a method, no parentheses  
✅ **Returns disposal status**—`false` when active, `true` after cleanup  
✅ **Set by `cleanup()`**—only way to change from false to true  
✅ **Prevents operations**—`add()` is rejected when disposed  
✅ **Permanent state**—once disposed, always disposed  
✅ **Set before cleanups run**—flag changes immediately when cleanup starts  
✅ **Use for guards**—check before operations to prevent errors  

### Quick Reference

```javascript
const myCollector = collector();

// Check if disposed
console.log(myCollector.disposed); // false (active)

// Guard operations
if (!myCollector.disposed) {
  myCollector.add(() => console.log('Cleanup'));
}

// Run cleanup
myCollector.cleanup();

// Check again
console.log(myCollector.disposed); // true (disposed)

// Prevent double cleanup
if (!myCollector.disposed) {
  myCollector.cleanup();
} else {
  console.log('Already disposed');
}
```

### One-Line Rule

> **Check `disposed` before operations to know if the collector has been shut down—essential for preventing errors and ensuring proper lifecycle management.**

 

**Next Steps:**
- Learn about [`collector.add()`](./collector.add.md) to add cleanup functions
- Learn about [`collector.cleanup()`](./collector.cleanup.md) to dispose the collector
- Learn about [`collector.size`](./collector.size.md) to check cleanup count