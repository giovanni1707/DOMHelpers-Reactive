# scope()

Create a cleanup scope that collects cleanup functions and returns a single disposal function.

## Quick Start (30 seconds)

```javascript
// Create a cleanup scope
const dispose = scope((collect) => {
  // Add cleanup functions using collect()
  collect(() => console.log('Cleanup 1'));
  collect(() => console.log('Cleanup 2'));
  collect(() => console.log('Cleanup 3'));
});

// Later, dispose everything with one call
dispose();
// Logs: Cleanup 1, Cleanup 2, Cleanup 3
```

**The magic:** `scope()` gives you a **callback-based way** to collect cleanups—you add them inside the scope function, and get back a single `dispose()` function!

 

## What is scope()?

`scope()` is a function that creates a **cleanup scope**—a temporary context where you can collect multiple cleanup functions. It returns a single disposal function that runs all the cleanups.

Simply put: **It's a pattern where you define all your cleanups in one place, and get back one function to clean them all up.**

Think of it like this:
- You have a function that sets up multiple features
- Each feature needs cleanup
- Instead of returning multiple cleanup functions, you collect them in a scope
- You get back ONE function that cleans everything up

 

## Syntax

```javascript
// Create a scope
const dispose = scope((collect) => {
  // Inside here, use collect() to add cleanup functions
  collect(cleanupFn1);
  collect(cleanupFn2);
  collect(cleanupFn3);
});

// Later, dispose everything
dispose();
```

**Or via ReactiveUtils:**

```javascript
const dispose = ReactiveUtils.scope((collect) => {
  collect(() => console.log('Cleanup!'));
});
```

**Parameters:**
- `fn`: A function that receives a `collect` callback
  - Inside `fn`, call `collect(cleanupFn)` to register cleanup functions

**Returns:**
- A disposal function that runs all collected cleanups when called

 

## Why Does This Exist?

### The Challenge with Multiple Return Values

Imagine you're creating a feature that sets up multiple things:

```javascript
function setupDashboard() {
  const state = ReactiveUtils.state({ count: 0, name: 'Alice' });
  
  // Create watcher
  const unwatch = watch(state, { count: (val) => console.log(val) });
  
  // Create effect
  const stopEffect = effect(() => console.log(state.name));
  
  // Create timer
  const timer = setInterval(() => state.count++, 1000);
  
  // Now what? Return all three cleanup functions?
  return {
    unwatchCount: unwatch,
    stopEffect: stopEffect,
    stopTimer: () => clearInterval(timer)
  };
}

// Usage - must remember to call all three!
const dashboard = setupDashboard();
dashboard.unwatchCount();
dashboard.stopEffect();
dashboard.stopTimer();
```

At first glance, this seems organized. But there are hidden issues.

**What's the Real Issue?**

```
Setup Feature
      ↓
Create Cleanup 1
Create Cleanup 2
Create Cleanup 3
      ↓
Return object with 3 methods
      ↓
User must remember to call all 3! 😰
      ↓
Forget one = memory leak 💥
```

**Problems:**
❌ Must return multiple cleanup functions  
❌ User must remember to call each one  
❌ Easy to forget one cleanup  
❌ Awkward API—what if you have 10 cleanups?  
❌ No single "dispose everything" function  

### The Solution with scope()

With `scope()`, you collect all cleanups inside the setup function and return ONE disposal function:

```javascript
function setupDashboard() {
  return scope((collect) => {
    const state = ReactiveUtils.state({ count: 0, name: 'Alice' });
    
    // Collect watcher cleanup
    collect(
      watch(state, { count: (val) => console.log(val) })
    );
    
    // Collect effect cleanup
    collect(
      effect(() => console.log(state.name))
    );
    
    // Collect timer cleanup
    const timer = setInterval(() => state.count++, 1000);
    collect(() => clearInterval(timer));
  });
}

// Usage - ONE function call!
const dispose = setupDashboard();
// ... use dashboard ...
dispose(); // Everything cleaned up! 🎉
```

**What just happened?**

```
Setup Feature
      ↓
Create scope with collect()
      ↓
Add Cleanup 1 via collect()
Add Cleanup 2 via collect()
Add Cleanup 3 via collect()
      ↓
Return single dispose function
      ↓
User calls dispose() once
      ↓
All cleanups run automatically ✨
```

**Benefits:**
✅ Single disposal function—simple API  
✅ Can't forget cleanups—they're all collected in one place  
✅ Cleanups are defined where features are created  
✅ Clear scope—all setup and cleanup logic together  
✅ User-friendly—just call `dispose()` once  

 

## Mental Model

Think of `scope()` like organizing a **surprise party**:

### Without scope() (Tasks Scattered)
```
Party Planning
├─ Task 1: Buy cake → cleanup: return cake if not used
├─ Task 2: Rent venue → cleanup: cancel venue rental
├─ Task 3: Invite guests → cleanup: send cancellation notices
└─ Task 4: Order food → cleanup: cancel food order

Cleanup = remember all 4 tasks! 😰
```

### With scope() (Organized Checklist)
```
Party Planning Scope
│
├─ [Checklist]
│   ├─ ✓ Buy cake
│   │   └─ cleanup: return cake
│   ├─ ✓ Rent venue
│   │   └─ cleanup: cancel venue
│   ├─ ✓ Invite guests
│   │   └─ cleanup: send notices
│   └─ ✓ Order food
│       └─ cleanup: cancel food
│
└─ [Dispose Button]
    Click once → all cleanups happen! 🎉
```

**Key insight:** Instead of tracking each cleanup separately, you create a scope where all cleanups are collected. You get back a single "dispose button" that handles everything.

 

## How Does It Work?

### Under the Hood

When you call `scope()`, it creates a collector and passes its `add()` method to your function:

```javascript
function scope(fn) {
  const collector = collector(); // Create a collector
  
  fn((cleanup) => collector.add(cleanup)); // Pass collect function
  
  return () => collector.cleanup(); // Return disposal function
}
```

**What's happening:**

```
1️⃣ Call scope(fn)
        ↓
2️⃣ Create internal collector
        ↓
3️⃣ Call fn with collect callback
        ↓
4️⃣ Inside fn, collect() adds cleanups to collector
        ↓
5️⃣ Return disposal function
        ↓
6️⃣ User calls dispose() → runs collector.cleanup()
```

### The collect() Callback

The `collect()` callback is just a wrapper around `collector.add()`:

```javascript
const collect = (cleanup) => collector.add(cleanup);
```

So when you do this:

```javascript
const dispose = scope((collect) => {
  collect(() => console.log('Cleanup A'));
  collect(() => console.log('Cleanup B'));
});
```

It's equivalent to:

```javascript
const collector = collector();
collector.add(() => console.log('Cleanup A'));
collector.add(() => console.log('Cleanup B'));
const dispose = () => collector.cleanup();
```

But with `scope()`, the collector is **hidden**—you only interact with `collect()` and `dispose()`.

 

## Basic Usage

### Example 1: Simple Scope

```javascript
// Create a scope with three cleanups
const dispose = scope((collect) => {
  collect(() => console.log('First cleanup'));
  collect(() => console.log('Second cleanup'));
  collect(() => console.log('Third cleanup'));
});

// Run all cleanups
dispose();
// Logs:
// First cleanup
// Second cleanup
// Third cleanup
```

**What's happening?**
1. Create scope and get `collect()` callback
2. Use `collect()` to register three cleanup functions
3. Get back `dispose()` function
4. Call `dispose()` to run all cleanups

 

### Example 2: Scope with Watchers

```javascript
const state = ReactiveUtils.state({ count: 0, name: 'Alice' });

const dispose = scope((collect) => {
  // Collect watcher cleanups
  collect(
    watch(state, {
      count: (val) => console.log('Count:', val)
    })
  );
  
  collect(
    watch(state, {
      name: (val) => console.log('Name:', val)
    })
  );
});

// Test watchers
state.count = 5;    // Logs: Count: 5
state.name = 'Bob'; // Logs: Name: Bob

// Clean up all watchers
dispose();

// Now watchers are stopped
state.count = 10;       // Nothing logged
state.name = 'Charlie'; // Nothing logged
```

**What's happening?**
- We create two watchers inside the scope
- Both watchers work normally
- When we call `dispose()`, both watchers are stopped
- Further state changes don't trigger the watchers

 

### Example 3: Scope with Effects and Timers

```javascript
const state = ReactiveUtils.state({ seconds: 0 });

const dispose = scope((collect) => {
  // Collect effect cleanup
  collect(
    effect(() => {
      console.log('Seconds:', state.seconds);
    })
  );
  // Logs immediately: Seconds: 0
  
  // Collect timer cleanup
  const timer = setInterval(() => {
    state.seconds++;
  }, 1000);
  
  collect(() => clearInterval(timer));
});

// After 3 seconds, clean up everything
setTimeout(() => {
  console.log('Disposing...');
  dispose();
  // Effect stops
  // Timer stops
}, 3000);
```

**What's happening?**
1. Effect runs immediately and watches `state.seconds`
2. Timer increments seconds every second
3. After 3 seconds, `dispose()` stops both the effect and timer
4. No more reactions or timer ticks

 

## Deep Dive: Scope Pattern

### Pattern Structure

The scope pattern follows this structure:

```javascript
function createFeature() {
  return scope((collect) => {
    // 1. Create resources
    const resource1 = createResource1();
    const resource2 = createResource2();
    
    // 2. Collect their cleanups
    collect(() => resource1.cleanup());
    collect(() => resource2.cleanup());
    
    // 3. Optionally return public API
    // (but the main return is the dispose function)
  });
}

// Usage
const dispose = createFeature();
dispose(); // Cleans up everything
```

 

### Collecting Different Types of Cleanups

```javascript
const dispose = scope((collect) => {
  const state = ReactiveUtils.state({ count: 0 });
  
  // 1. Collect watcher cleanup (returns function)
  collect(
    watch(state, { count: (val) => console.log(val) })
  );
  
  // 2. Collect effect cleanup (returns function)
  collect(
    effect(() => console.log('Effect:', state.count))
  );
  
  // 3. Collect timer cleanup (inline function)
  const timer = setInterval(() => state.count++, 1000);
  collect(() => clearInterval(timer));
  
  // 4. Collect event listener cleanup (inline function)
  const handler = () => console.log('Clicked!');
  document.addEventListener('click', handler);
  collect(() => document.removeEventListener('click', handler));
  
  // 5. Collect custom cleanup (inline function)
  collect(() => {
    console.log('Custom cleanup logic here');
    state.count = 0;
  });
});
```

**What's happening?**
- Different types of cleanups all get collected the same way
- Some cleanups come from functions (watchers, effects)
- Some cleanups are inline functions (timers, events)
- All are disposed with one `dispose()` call

 

### Nested Scopes

```javascript
function createApp() {
  return scope((collectApp) => {
    console.log('App setup');
    
    // Create child feature 1
    const disposeFeature1 = scope((collectFeature) => {
      console.log('Feature 1 setup');
      collectFeature(() => console.log('Feature 1 cleanup'));
    });
    
    // Collect feature 1 disposal
    collectApp(disposeFeature1);
    
    // Create child feature 2
    const disposeFeature2 = scope((collectFeature) => {
      console.log('Feature 2 setup');
      collectFeature(() => console.log('Feature 2 cleanup'));
    });
    
    // Collect feature 2 disposal
    collectApp(disposeFeature2);
    
    // App-level cleanup
    collectApp(() => console.log('App cleanup'));
  });
}

// Usage
const disposeApp = createApp();
// Logs: App setup, Feature 1 setup, Feature 2 setup

disposeApp();
// Logs:
// Feature 1 cleanup
// Feature 2 cleanup
// App cleanup
```

**What's happening?**
- Outer scope creates child scopes
- Each child scope has its own cleanups
- Child disposal functions are collected by parent scope
- Calling parent `dispose()` cleans up everything hierarchically

 

## scope() vs collector()

Both `scope()` and `collector()` help manage multiple cleanups, but they have different use cases:

### When to Use scope()

**Use `scope()` when:**
- You want a **callback-based** pattern
- You're creating a function that returns a disposal function
- All cleanups are defined in one place
- You want to hide the collector implementation

**Example:**

```javascript
function createTimer() {
  return scope((collect) => {
    const state = ReactiveUtils.state({ time: 0 });
    
    const interval = setInterval(() => state.time++, 1000);
    collect(() => clearInterval(interval));
    
    collect(effect(() => console.log(state.time)));
  });
}

const dispose = createTimer(); // Get disposal function
dispose(); // Clean up
```

 

### When to Use collector()

**Use `collector()` when:**
- You want an **object-based** pattern
- You need to check `size` or `disposed` status
- You're adding cleanups conditionally over time
- You need explicit control over the collector

**Example:**

```javascript
function createTimer() {
  const collector = collector();
  const state = ReactiveUtils.state({ time: 0 });
  
  const interval = setInterval(() => state.time++, 1000);
  collector.add(() => clearInterval(interval));
  
  collector.add(effect(() => console.log(state.time)));
  
  return {
    state,
    dispose: () => collector.cleanup(),
    cleanupCount: () => collector.size,
    isDisposed: () => collector.disposed
  };
}

const timer = createTimer();
console.log(timer.cleanupCount()); // 2
timer.dispose(); // Clean up
console.log(timer.isDisposed()); // true
```

 

### Quick Comparison

| Feature | `scope()` | `collector()` |
|   |   --|     |
| Pattern | Callback-based | Object-based |
| Returns | Disposal function | Collector object |
| When to add cleanups | Inside callback | Anytime via `add()` |
| Check status | No | Yes (size, disposed) |
| Typical use | Simple disposal | Complex lifecycle |
| Chaining | No | Yes (via `add()`) |
| Conditional adding | Less convenient | More convenient |

 

### Choosing Between Them

```javascript
// Use scope() for simple "setup and dispose" patterns
const dispose = scope((collect) => {
  // All setup here
});

// Use collector() when you need more control
const collector = collector();
if (condition) collector.add(cleanup1);
if (otherCondition) collector.add(cleanup2);
console.log('Cleanups:', collector.size);
```

**Key insight:** Both achieve the same goal—managing multiple cleanups. Choose based on your preferred pattern and needs.

 

## Advanced Patterns

### Pattern 1: Factory Function

```javascript
function createCounter(initialValue = 0) {
  return scope((collect) => {
    const state = ReactiveUtils.state({ count: initialValue });
    
    // Add effect
    collect(
      effect(() => {
        console.log('Count is:', state.count);
      })
    );
    
    // Add watcher
    collect(
      watch(state, {
        count: (val) => {
          if (val >= 10) {
            console.log('Count reached 10!');
          }
        }
      })
    );
    
    // Return public API (optional)
    // Note: this doesn't interfere with the dispose function
    return {
      get value() { return state.count; },
      increment() { state.count++; },
      decrement() { state.count--; }
    };
  });
}

// Usage
const dispose = createCounter(5);
// Returns dispose function, but also logs count changes
// Call dispose() when done
dispose();
```

 

### Pattern 2: Scope with Async Cleanup

```javascript
function createAsyncFeature() {
  return scope((collect) => {
    const state = ReactiveUtils.state({ data: null, loading: false });
    const abortController = new AbortController();
    
    // Collect abort cleanup
    collect(() => {
      console.log('Aborting requests...');
      abortController.abort();
    });
    
    // Collect state reset cleanup
    collect(() => {
      console.log('Resetting state...');
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
  });
}

// Usage
const dispose = createAsyncFeature();
// ... wait a bit ...
dispose(); // Aborts fetch and resets state
```

 

### Pattern 3: Conditional Scope

```javascript
function createDashboard(options = {}) {
  return scope((collect) => {
    const state = ReactiveUtils.state({ data: [], notifications: [] });
    
    // Always add data watcher
    collect(
      watch(state, {
        data: (val) => console.log('Data updated:', val.length)
      })
    );
    
    // Conditionally add auto-refresh
    if (options.autoRefresh) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing...');
        // ... fetch new data ...
      }, options.refreshInterval || 5000);
      
      collect(() => clearInterval(interval));
    }
    
    // Conditionally add notifications
    if (options.showNotifications) {
      collect(
        watch(state, {
          notifications: (val) => {
            if (val.length > 0) {
              console.log('New notification!');
            }
          }
        })
      );
    }
  });
}

// Usage with auto-refresh
const dispose1 = createDashboard({ autoRefresh: true, refreshInterval: 3000 });

// Usage without auto-refresh
const dispose2 = createDashboard({ showNotifications: true });

// Both can be disposed the same way
dispose1();
dispose2();
```

 

### Pattern 4: Scope with Error Handling

```javascript
function createSafeFeature() {
  return scope((collect) => {
    const state = ReactiveUtils.state({ value: 0 });
    
    // Add effect with error handling
    collect(
      effect(() => {
        try {
          console.log('Value:', state.value);
          if (state.value < 0) {
            throw new Error('Value cannot be negative!');
          }
        } catch (error) {
          console.error('Effect error:', error.message);
        }
      })
    );
    
    // Add cleanup with error handling
    collect(() => {
      try {
        console.log('Cleaning up...');
        // Some cleanup that might fail
        if (state.value === 999) {
          throw new Error('Cannot cleanup at 999!');
        }
      } catch (error) {
        console.error('Cleanup error:', error.message);
      }
    });
  });
}

// Usage
const dispose = createSafeFeature();
dispose(); // Even if cleanup fails, it's handled
```

 

## Common Use Cases

### Use Case 1: Modal Dialog

```javascript
function createModal(content) {
  return scope((collect) => {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Collect DOM cleanup
    collect(() => {
      modal.remove();
    });
    
    // Add close button listener
    const closeButton = modal.querySelector('.close');
    const handleClose = () => {
      console.log('Modal closed via button');
      dispose(); // Self-dispose
    };
    closeButton.addEventListener('click', handleClose);
    
    // Collect event cleanup
    collect(() => {
      closeButton.removeEventListener('click', handleClose);
    });
    
    // Add escape key listener
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        console.log('Modal closed via Escape');
        dispose(); // Self-dispose
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    // Collect escape cleanup
    collect(() => {
      window.removeEventListener('keydown', handleEscape);
    });
  });
}

// Usage
const dispose = createModal('<h2>Hello!</h2><button class="close">X</button>');
// Modal appears
// Click X or press Escape to close
// Or manually: dispose();
```

 

### Use Case 2: WebSocket Connection

```javascript
function createWebSocket(url) {
  return scope((collect) => {
    const state = ReactiveUtils.state({
      connected: false,
      messages: [],
      error: null
    });
    
    // Create WebSocket
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      state.connected = true;
    };
    
    ws.onmessage = (event) => {
      state.messages.push(event.data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      state.error = error;
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed');
      state.connected = false;
    };
    
    // Collect WebSocket cleanup
    collect(() => {
      console.log('Closing WebSocket...');
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    
    // Add message watcher
    collect(
      watch(state, {
        messages: (val) => {
          console.log('New message count:', val.length);
        }
      })
    );
    
    return { state, send: (msg) => ws.send(msg) };
  });
}

// Usage
const dispose = createWebSocket('ws://localhost:8080');
// WebSocket connects and tracks messages
// ... use connection ...
dispose(); // Closes WebSocket and cleans up watchers
```

 

### Use Case 3: Form Validation

```javascript
function createValidatedForm(formId) {
  return scope((collect) => {
    const formElement = document.getElementById(formId);
    const state = ReactiveUtils.state({
      values: {},
      errors: {},
      isValid: false
    });
    
    // Collect input listeners
    const inputs = formElement.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      const handleInput = () => {
        state.values[input.name] = input.value;
        validateField(input.name);
      };
      
      input.addEventListener('input', handleInput);
      collect(() => {
        input.removeEventListener('input', handleInput);
      });
    });
    
    // Validation logic
    function validateField(fieldName) {
      const value = state.values[fieldName];
      
      if (!value || value.trim() === '') {
        state.errors[fieldName] = 'Required';
      } else {
        delete state.errors[fieldName];
      }
      
      state.isValid = Object.keys(state.errors).length === 0;
    }
    
    // Collect validation watcher
    collect(
      watch(state, {
        isValid: (val) => {
          const submitBtn = formElement.querySelector('[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = !val;
          }
        }
      })
    );
    
    return { state };
  });
}

// Usage
const dispose = createValidatedForm('myForm');
// Form validates as user types
// ... user fills form ...
dispose(); // Removes all listeners and watchers
```

 

### Use Case 4: Drag and Drop

```javascript
function createDraggable(elementId) {
  return scope((collect) => {
    const element = document.getElementById(elementId);
    const state = ReactiveUtils.state({
      isDragging: false,
      position: { x: 0, y: 0 },
      offset: { x: 0, y: 0 }
    });
    
    // Mouse down handler
    const handleMouseDown = (e) => {
      state.isDragging = true;
      state.offset.x = e.clientX - state.position.x;
      state.offset.y = e.clientY - state.position.y;
      element.style.cursor = 'grabbing';
    };
    element.addEventListener('mousedown', handleMouseDown);
    collect(() => {
      element.removeEventListener('mousedown', handleMouseDown);
    });
    
    // Mouse move handler
    const handleMouseMove = (e) => {
      if (state.isDragging) {
        state.position.x = e.clientX - state.offset.x;
        state.position.y = e.clientY - state.offset.y;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    collect(() => {
      window.removeEventListener('mousemove', handleMouseMove);
    });
    
    // Mouse up handler
    const handleMouseUp = () => {
      state.isDragging = false;
      element.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', handleMouseUp);
    collect(() => {
      window.removeEventListener('mouseup', handleMouseUp);
    });
    
    // Update element position effect
    collect(
      effect(() => {
        element.style.transform = 
          `translate(${state.position.x}px, ${state.position.y}px)`;
      })
    );
    
    // Initial cursor
    element.style.cursor = 'grab';
    
    return { state };
  });
}

// Usage
const dispose = createDraggable('myElement');
// Element is now draggable
// ... user drags element ...
dispose(); // Removes all listeners and stops dragging
```

 

## Summary

### Key Takeaways

✅ **`scope()` creates a cleanup scope** with a callback pattern  
✅ **Use `collect()`** inside the callback to register cleanup functions  
✅ **Returns a disposal function** that runs all cleanups when called  
✅ **Perfect for factory functions** that return disposal functions  
✅ **Hides implementation details**—users only see `dispose()`  
✅ **All setup and cleanup logic in one place**—easy to understand  
✅ **Choose `scope()` for simplicity**, `collector()` for control  

### Quick Reference

```javascript
// Create scope
const dispose = scope((collect) => {
  // Setup features
  const state = ReactiveUtils.state({ count: 0 });
  
  // Collect cleanups
  collect(watch(state, { count: (v) => console.log(v) }));
  collect(effect(() => console.log(state.count)));
  
  const timer = setInterval(() => state.count++, 1000);
  collect(() => clearInterval(timer));
});

// Dispose everything
dispose();
```

### One-Line Rule

> **Use `scope()` when you want a clean callback-based pattern that collects cleanups in one place and returns a single disposal function—perfect for setup/teardown logic.**

 

**Next Steps:**
- Compare with [`collector()`](./collector.md) to understand the differences
- Learn about [cleanup best practices](./cleanup-patterns.md)
- Explore [component lifecycle patterns](./component-patterns.md)