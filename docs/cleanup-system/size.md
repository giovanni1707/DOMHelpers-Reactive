# collector.size

Get the number of cleanup functions currently stored in a collector.

## Quick Start (30 seconds)

```javascript
// Create collector
const myCollector = collector();

console.log(myCollector.size); // 0 (empty)

// Add cleanups
myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));
myCollector.add(() => console.log('Cleanup 3'));

console.log(myCollector.size); // 3

// Run cleanup
myCollector.cleanup();

console.log(myCollector.size); // 0 (cleared)
```

**The magic:** `size` tells you **how many cleanup functions** are waiting to run—perfect for debugging and monitoring!

 

## What is collector.size?

`collector.size` is a **read-only getter property** on a collector instance that returns the number of cleanup functions currently stored in the collector.

Simply put: **It's a counter that tells you how many cleanups are registered.**

Think of it like this:
- You have a collector (a basket)
- You add cleanup functions (items) to it
- `size` tells you how many items are in the basket
- After cleanup, the basket is empty (size = 0)

 

## Syntax

```javascript
// Create collector
const myCollector = collector();

// Read size property
const count = myCollector.size;
console.log(count); // Number of cleanups

// Use directly
console.log(myCollector.size);

// Use in conditions
if (myCollector.size > 0) {
  // There are cleanups to run
}
```

**Type:**
- **Read-only getter property** (not a method—no parentheses)

**Returns:**
- A number representing the current cleanup count

**Important:** You cannot set `size`:
```javascript
myCollector.size = 5; // This does nothing (read-only)
```

 

## Why Does This Exist?

### The Challenge Without Size

Imagine building a feature manager without knowing how many cleanups exist:

```javascript
const myCollector = collector();

// Add some cleanups
myCollector.add(() => console.log('Cleanup A'));
myCollector.add(() => console.log('Cleanup B'));

// How many cleanups do we have? 🤷
// No way to know!

// Is it safe to cleanup? 🤷
// No way to check!

// Did we add all expected cleanups? 🤷
// No way to verify!
```

At first glance, this might seem fine. But when debugging or building robust applications, you need visibility.

**What's the Real Issue?**

```
Add cleanup functions
      ↓
No visibility into count
      ↓
Can't verify all are added
      ↓
Can't debug issues
      ↓
Can't make informed decisions
      ↓
Harder to maintain 😰
```

**Problems:**
❌ No way to check cleanup count  
❌ Can't verify expected cleanups were added  
❌ Difficult to debug cleanup issues  
❌ Can't make conditional decisions based on count  
❌ No visibility into collector state  

### The Solution with collector.size

With `size`, you have full visibility into the collector's state:

```javascript
const myCollector = collector();

console.log('Initial size:', myCollector.size); // 0

// Add cleanups
myCollector.add(() => console.log('Cleanup A'));
myCollector.add(() => console.log('Cleanup B'));

console.log('After adding:', myCollector.size); // 2

// Verify expected count
if (myCollector.size === 2) {
  console.log('✓ Both cleanups registered');
}

// Conditional cleanup
if (myCollector.size > 0) {
  console.log(`Running ${myCollector.size} cleanups...`);
  myCollector.cleanup();
}

console.log('After cleanup:', myCollector.size); // 0
```

**What just happened?**

```
Check initial size (0)
      ↓
Add cleanups
      ↓
Verify size (2)
      ↓
Make informed decision
      ↓
Run cleanup
      ↓
Verify cleared (0)
      ↓
Full visibility! ✨
```

**Benefits:**
✅ Know exactly how many cleanups exist  
✅ Verify expected cleanups were added  
✅ Debug issues easily  
✅ Make conditional decisions  
✅ Monitor collector state  

 

## Mental Model

Think of `collector.size` like a **shopping cart item counter**:

### Without size (Blind Shopping)
```
Shopping Cart
├─ Add item 1 → ???
├─ Add item 2 → ???
├─ Add item 3 → ???

How many items? 🤷
Ready to checkout? 🤷
```

### With size (Visible Counter)
```
Shopping Cart [3 items] 👈 Always visible!
├─ Add item 1 → [1 item]
├─ Add item 2 → [2 items]
├─ Add item 3 → [3 items]

✓ Know exactly how many items
✓ See count update in real-time
✓ Make informed decisions
```

**Key insight:** Just like a shopping cart shows how many items you have, `collector.size` shows how many cleanup functions are registered—instant visibility.

 

## How Does It Work?

### Under the Hood

`size` is implemented as a getter that returns the length of the internal array:

```javascript
// Simplified implementation
function collector() {
  const cleanups = []; // Internal array
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
      if (isDisposed) return;
      isDisposed = true;
      cleanups.forEach(fn => fn());
      cleanups.length = 0; // Size becomes 0
    },
    
    // Getter property
    get size() {
      return cleanups.length; // Return array length
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
   size = 0
        ↓
2️⃣ Add cleanup
        ↓
   cleanups = [fn1]
   size = 1
        ↓
3️⃣ Add cleanup
        ↓
   cleanups = [fn1, fn2]
   size = 2
        ↓
4️⃣ Call cleanup()
        ↓
   cleanups = []
   size = 0
```

### Read-Only Property

Because `size` is defined as a getter without a setter, it's read-only:

```javascript
get size() {
  return cleanups.length;
}
// No setter defined!
```

This means:
```javascript
myCollector.size = 100; // Does nothing
console.log(myCollector.size); // Still shows actual count
```

 

## Basic Usage

### Example 1: Tracking Additions

```javascript
const myCollector = collector();

console.log('Empty:', myCollector.size); // 0

myCollector.add(() => console.log('A'));
console.log('After 1st add:', myCollector.size); // 1

myCollector.add(() => console.log('B'));
console.log('After 2nd add:', myCollector.size); // 2

myCollector.add(() => console.log('C'));
console.log('After 3rd add:', myCollector.size); // 3
```

**What's happening?**
- Size starts at 0
- Each `add()` increments size by 1
- Real-time feedback on collector state

 

### Example 2: Verifying Cleanups

```javascript
const myCollector = collector();

// Expected: 3 cleanups
myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));
myCollector.add(() => console.log('Cleanup 3'));

// Verify
const expected = 3;
const actual = myCollector.size;

if (actual === expected) {
  console.log(`✓ All ${expected} cleanups registered`);
} else {
  console.error(`✗ Expected ${expected}, got ${actual}`);
}
```

**What's happening?**
- Define expected cleanup count
- Check actual count using `size`
- Verify they match

 

### Example 3: Conditional Cleanup

```javascript
const myCollector = collector();

// Add cleanups based on conditions
const enableFeatureA = true;
const enableFeatureB = false;

if (enableFeatureA) {
  myCollector.add(() => console.log('Feature A cleanup'));
}

if (enableFeatureB) {
  myCollector.add(() => console.log('Feature B cleanup'));
}

// Only cleanup if there are any
if (myCollector.size > 0) {
  console.log(`Running ${myCollector.size} cleanup(s)...`);
  myCollector.cleanup();
} else {
  console.log('No cleanups to run');
}
```

**What's happening?**
- Conditionally add cleanups
- Check if any cleanups exist before running
- Inform user of cleanup count

 

### Example 4: Size After Cleanup

```javascript
const myCollector = collector();

// Add cleanups
myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));

console.log('Before cleanup:', myCollector.size); // 2

// Run cleanup
myCollector.cleanup();

console.log('After cleanup:', myCollector.size); // 0

// Size is cleared!
```

**What's happening?**
- Size is 2 before cleanup
- `cleanup()` runs all functions and clears the array
- Size becomes 0 after cleanup

 

## Deep Dive: Tracking Cleanup Count

### Pattern 1: Progress Tracking

```javascript
function createFeatureWithProgress() {
  const myCollector = collector();
  const totalFeatures = 5;
  
  // Add features one by one
  for (let i = 1; i <= totalFeatures; i++) {
    myCollector.add(() => {
      console.log(`Cleanup feature ${i}`);
    });
    
    const progress = (myCollector.size / totalFeatures * 100).toFixed(0);
    console.log(`Setup progress: ${progress}% (${myCollector.size}/${totalFeatures})`);
  }
  
  return myCollector;
}

const features = createFeatureWithProgress();
// Logs:
// Setup progress: 20% (1/5)
// Setup progress: 40% (2/5)
// Setup progress: 60% (3/5)
// Setup progress: 80% (4/5)
// Setup progress: 100% (5/5)

features.cleanup();
```

 

### Pattern 2: Debugging Helper

```javascript
function debugCollector(myCollector, name = 'Collector') {
  console.log('─'.repeat(40));
  console.log(`${name} Status:`);
  console.log(`  Size: ${myCollector.size}`);
  console.log(`  Disposed: ${myCollector.disposed}`);
  console.log(`  Has cleanups: ${myCollector.size > 0}`);
  console.log('─'.repeat(40));
}

const myCollector = collector();

debugCollector(myCollector, 'Initial');
// ────────────────────────────────────────
// Initial Status:
//   Size: 0
//   Disposed: false
//   Has cleanups: false
// ────────────────────────────────────────

myCollector.add(() => console.log('Cleanup 1'));
myCollector.add(() => console.log('Cleanup 2'));

debugCollector(myCollector, 'After Adding');
// ────────────────────────────────────────
// After Adding Status:
//   Size: 2
//   Disposed: false
//   Has cleanups: true
// ────────────────────────────────────────

myCollector.cleanup();

debugCollector(myCollector, 'After Cleanup');
// ────────────────────────────────────────
// After Cleanup Status:
//   Size: 0
//   Disposed: true
//   Has cleanups: false
// ────────────────────────────────────────
```

 

### Pattern 3: Resource Quota

```javascript
function createResourceManager(maxResources = 10) {
  const myCollector = collector();
  
  function allocateResource(name) {
    if (myCollector.size >= maxResources) {
      console.error(`Cannot allocate ${name}: Limit reached (${maxResources})`);
      return false;
    }
    
    console.log(`Allocating ${name} (${myCollector.size + 1}/${maxResources})`);
    myCollector.add(() => {
      console.log(`Releasing ${name}`);
    });
    
    return true;
  }
  
  function getStatus() {
    return {
      used: myCollector.size,
      available: maxResources - myCollector.size,
      total: maxResources,
      percentage: (myCollector.size / maxResources * 100).toFixed(0) + '%'
    };
  }
  
  return {
    allocate: allocateResource,
    status: getStatus,
    cleanup: () => myCollector.cleanup()
  };
}

const manager = createResourceManager(3);

manager.allocate('Resource A'); // OK
manager.allocate('Resource B'); // OK
manager.allocate('Resource C'); // OK
manager.allocate('Resource D'); // ERROR: Limit reached

console.log('Status:', manager.status());
// Status: { used: 3, available: 0, total: 3, percentage: '100%' }
```

 

### Pattern 4: Warning System

```javascript
function createManagedCollector(warningThreshold = 10) {
  const myCollector = collector();
  
  function addWithWarning(cleanup) {
    myCollector.add(cleanup);
    
    const size = myCollector.size;
    
    if (size >= warningThreshold) {
      console.warn(`⚠️  High cleanup count: ${size} cleanups registered!`);
      console.warn('   Consider breaking into smaller components');
    }
    
    return myCollector;
  }
  
  return {
    add: addWithWarning,
    size: () => myCollector.size,
    cleanup: () => myCollector.cleanup()
  };
}

const managed = createManagedCollector(3);

managed.add(() => console.log('1'));
managed.add(() => console.log('2'));
managed.add(() => console.log('3'));
// ⚠️  High cleanup count: 3 cleanups registered!
//    Consider breaking into smaller components

managed.add(() => console.log('4'));
// ⚠️  High cleanup count: 4 cleanups registered!
//    Consider breaking into smaller components
```

 

## Common Patterns

### Pattern 1: Dashboard Statistics

```javascript
class ComponentManager {
  constructor() {
    this.collector = collector();
    this.componentCount = 0;
  }
  
  addComponent(name) {
    this.componentCount++;
    console.log(`Adding component: ${name}`);
    
    this.collector.add(() => {
      console.log(`Cleaning up component: ${name}`);
    });
  }
  
  getStats() {
    return {
      components: this.componentCount,
      cleanups: this.collector.size,
      average: (this.collector.size / this.componentCount).toFixed(2)
    };
  }
  
  destroy() {
    const stats = this.getStats();
    console.log('Manager Stats:', stats);
    console.log(`Destroying ${this.collector.size} resources...`);
    this.collector.cleanup();
  }
}

const manager = new ComponentManager();
manager.addComponent('Header');
manager.addComponent('Sidebar');
manager.addComponent('Content');

console.log(manager.getStats());
// { components: 3, cleanups: 3, average: '1.00' }

manager.destroy();
// Manager Stats: { components: 3, cleanups: 3, average: '1.00' }
// Destroying 3 resources...
// Cleaning up component: Header
// Cleaning up component: Sidebar
// Cleaning up component: Content
```

 

### Pattern 2: Batch Operations

```javascript
function batchAddCleanups(myCollector, cleanupArray) {
  const initialSize = myCollector.size;
  
  console.log(`Adding ${cleanupArray.length} cleanups...`);
  
  cleanupArray.forEach((cleanup, index) => {
    myCollector.add(cleanup);
    const progress = ((index + 1) / cleanupArray.length * 100).toFixed(0);
    console.log(`  Progress: ${progress}% (${myCollector.size - initialSize}/${cleanupArray.length})`);
  });
  
  console.log(`✓ Added ${myCollector.size - initialSize} cleanups`);
  console.log(`  Total cleanups: ${myCollector.size}`);
}

const myCollector = collector();

const cleanups = [
  () => console.log('Cleanup A'),
  () => console.log('Cleanup B'),
  () => console.log('Cleanup C')
];

batchAddCleanups(myCollector, cleanups);
// Adding 3 cleanups...
//   Progress: 33% (1/3)
//   Progress: 67% (2/3)
//   Progress: 100% (3/3)
// ✓ Added 3 cleanups
//   Total cleanups: 3
```

 

### Pattern 3: Size-Based Decisions

```javascript
function smartCleanup(myCollector) {
  const size = myCollector.size;
  
  if (size === 0) {
    console.log('No cleanups needed');
    return;
  }
  
  if (size < 5) {
    console.log(`Running ${size} cleanup(s)...`);
    myCollector.cleanup();
  } else {
    console.log(`Warning: ${size} cleanups detected`);
    console.log('This might take a while...');
    console.time('cleanup');
    myCollector.cleanup();
    console.timeEnd('cleanup');
  }
}

const small = collector();
small.add(() => console.log('A'));
smartCleanup(small); // Running 1 cleanup(s)...

const large = collector();
for (let i = 0; i < 10; i++) {
  large.add(() => console.log(`Cleanup ${i}`));
}
smartCleanup(large);
// Warning: 10 cleanups detected
// This might take a while...
// [all cleanups run]
// cleanup: 2.5ms
```

 

## Edge Cases and Gotchas

### Gotcha 1: Size is Read-Only

```javascript
const myCollector = collector();

console.log(myCollector.size); // 0

// Try to set size (does nothing)
myCollector.size = 100;

console.log(myCollector.size); // Still 0 (not changed)

// Size only changes via add() and cleanup()
myCollector.add(() => console.log('Cleanup'));
console.log(myCollector.size); // 1 ✓
```

**What's happening:**
- `size` is a getter property without a setter
- Assignment attempts are silently ignored
- Only `add()` and `cleanup()` change size

 

### Gotcha 2: Non-Functions Don't Count

```javascript
const myCollector = collector();

myCollector.add('not a function'); // Ignored
myCollector.add(123);               // Ignored
myCollector.add(null);              // Ignored

console.log(myCollector.size); // 0 (nothing added)

myCollector.add(() => console.log('Valid'));
console.log(myCollector.size); // 1 ✓
```

**What's happening:**
- Only functions are added to the collector
- Non-function values don't increase size
- Check `size` to verify additions succeeded

 

### Gotcha 3: Size After Partial Add

```javascript
const myCollector = collector();

myCollector.add(() => console.log('Valid 1'));
myCollector.add('invalid');           // Skipped
myCollector.add(() => console.log('Valid 2'));
myCollector.add(null);                // Skipped
myCollector.add(() => console.log('Valid 3'));

console.log(myCollector.size); // 3 (only valid functions)
```

**What's happening:**
- Invalid adds are silently skipped
- Size only reflects valid cleanup functions
- Use `size` to detect if expected count was reached

 

### Gotcha 4: Size During Cleanup

```javascript
const myCollector = collector();

myCollector.add(() => {
  console.log('Cleanup 1');
  console.log('Size during cleanup:', myCollector.size); // Still 3!
});

myCollector.add(() => {
  console.log('Cleanup 2');
});

myCollector.add(() => {
  console.log('Cleanup 3');
});

console.log('Before:', myCollector.size); // 3

myCollector.cleanup();
// Cleanup 1
// Size during cleanup: 3
// Cleanup 2
// Cleanup 3

console.log('After:', myCollector.size); // 0
```

**What's happening:**
- `size` isn't decremented during cleanup
- It only becomes 0 after all cleanups finish
- Don't rely on `size` changing during cleanup execution

 

## Summary

### Key Takeaways

✅ **`size` is a read-only getter property**—not a method, no parentheses  
✅ **Returns the cleanup count**—how many functions are registered  
✅ **Updates automatically**—increases with `add()`, becomes 0 after `cleanup()`  
✅ **Perfect for debugging**—instant visibility into collector state  
✅ **Enables smart decisions**—conditional logic based on cleanup count  
✅ **Non-functions don't count**—only valid function additions increase size  
✅ **Cannot be set manually**—read-only property  

### Quick Reference

```javascript
const myCollector = collector();

// Check size
console.log(myCollector.size); // 0

// Add cleanups
myCollector.add(() => console.log('A'));
console.log(myCollector.size); // 1

myCollector.add(() => console.log('B'));
console.log(myCollector.size); // 2

// Conditional logic
if (myCollector.size > 0) {
  console.log(`${myCollector.size} cleanups ready`);
  myCollector.cleanup();
}

console.log(myCollector.size); // 0
```

### One-Line Rule

> **Use `size` to check how many cleanup functions are registered—perfect for verification, debugging, and making informed decisions about when to run cleanup.**

 

**Next Steps:**
- Learn about [`collector.add()`](./collector.add.md) to add cleanup functions
- Learn about [`collector.cleanup()`](./collector.cleanup.md) to run cleanups
- Learn about [`collector.disposed`](./collector.disposed.md) to check disposal status