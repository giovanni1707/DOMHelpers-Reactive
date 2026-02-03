# asyncState.abortController

Property holding the current AbortController instance for canceling async operations.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.abortController); // null

// Start long operation
execute(state, async (signal) => {
  console.log('AbortController exists:', state.abortController !== null); // true
  await new Promise(r => setTimeout(r, 5000));
  return 'done';
});

// Abort after 1 second
setTimeout(() => {
  console.log('Aborting...');
  abort(state); // Uses state.abortController internally
}, 1000);
```

**The magic:** `abortController` is created automatically and lets you cancel pending operations!

 

## What is asyncState.abortController?

`abortController` is a **reactive property** that holds the current [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) instance. It's created when `execute()` starts and used to cancel operations via `abort()`.

**Key points:**
- Read/write property (managed by `execute()`)
- `null` when no operation is running
- Set to new AbortController when `execute()` starts
- Used by `abort()` to cancel operations
- Cleared when operation completes
- Reactive—can be watched

 

## Why Does This Exist?

### Without AbortController

```javascript
// Can't cancel once started!
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

const promise = fetchData();
// No way to cancel! Must wait for completion or error
```

**Problem:** No way to cancel async operations in flight.

### With asyncState.abortController

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  const response = await fetch('/api/data', { signal });
  return response.json();
});

// Cancel anytime!
abort(state); // Uses state.abortController
```

**Solution:** Built-in cancellation support via AbortController.

 

## Basic Usage

### Example 1: Checking AbortController

```javascript
const state = asyncState(null);

console.log('Before:', state.abortController); // null

execute(state, async (signal) => {
  console.log('During:', state.abortController); // AbortController {}
  await new Promise(r => setTimeout(r, 1000));
  return 'data';
});

await new Promise(r => setTimeout(r, 1500));
console.log('After:', state.abortController); // null
```

 

### Example 2: Using AbortSignal

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  // signal comes from state.abortController.signal
  const response = await fetch('/api/data', { signal });
  
  // Check if aborted during fetch
  if (signal.aborted) {
    console.log('Request was aborted');
    return null;
  }
  
  return response.json();
});

setTimeout(() => abort(state), 500);
```

 

### Example 3: Manual Abort

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  console.log('Starting...');
  await new Promise(r => setTimeout(r, 5000));
  console.log('Done!'); // Won't reach if aborted
  return 'result';
});

// Abort using the property directly
setTimeout(() => {
  if (state.abortController) {
    state.abortController.abort();
    console.log('Aborted manually');
  }
}, 1000);
```

 

## Common Patterns

### Pattern 1: Timeout with Abort

```javascript
const state = asyncState(null);

async function fetchWithTimeout(url, timeout = 5000) {
  const timeoutId = setTimeout(() => {
    if (state.abortController) {
      console.log('Timeout reached, aborting...');
      abort(state);
    }
  }, timeout);
  
  await execute(state, async (signal) => {
    const response = await fetch(url, { signal });
    return response.json();
  });
  
  clearTimeout(timeoutId);
  return state.data;
}

try {
  const data = await fetchWithTimeout('/api/slow', 3000);
  console.log('Data:', data);
} catch (error) {
  console.log('Timed out or failed');
}
```

 

### Pattern 2: Multiple Fetch with Single Abort

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  // Use same signal for multiple fetches
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users', { signal }).then(r => r.json()),
    fetch('/api/posts', { signal }).then(r => r.json()),
    fetch('/api/comments', { signal }).then(r => r.json())
  ]);
  
  return { users, posts, comments };
});

// One abort cancels all three fetches!
setTimeout(() => abort(state), 1000);
```

 

### Pattern 3: Abort on Route Change

```javascript
const pageState = asyncState(null);

function loadPage(pageId) {
  // Abort previous page load
  if (pageState.abortController) {
    console.log('Aborting previous page load');
    abort(pageState);
  }
  
  execute(pageState, async (signal) => {
    const response = await fetch(`/api/pages/${pageId}`, { signal });
    return response.json();
  });
}

loadPage(1); // Start loading page 1
loadPage(2); // Abort page 1, load page 2
loadPage(3); // Abort page 2, load page 3
```

 

### Pattern 4: Abort on Component Unmount

```javascript
class DataComponent {
  constructor() {
    this.state = asyncState(null);
    this.loadData();
  }
  
  async loadData() {
    await execute(this.state, async (signal) => {
      const response = await fetch('/api/data', { signal });
      return response.json();
    });
  }
  
  destroy() {
    // Cancel pending requests on unmount
    if (this.state.abortController) {
      console.log('Cleaning up: aborting pending request');
      abort(this.state);
    }
  }
}

const component = new DataComponent();
// ... later ...
component.destroy(); // Cancels any pending requests
```

 

## Advanced Usage

### Custom Abort Handling

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  try {
    const response = await fetch('/api/data', { signal });
    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
      // Custom abort handling
      return { aborted: true, data: null };
    }
    throw error;
  }
});

setTimeout(() => abort(state), 500);
```

 

### Abort Event Listener

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  // Listen for abort event
  signal.addEventListener('abort', () => {
    console.log('Abort signal received!');
    // Cleanup custom resources
  });
  
  const response = await fetch('/api/data', { signal });
  return response.json();
});

setTimeout(() => {
  console.log('Aborting...');
  abort(state);
}, 1000);
// Logs: Aborting...
// Logs: Abort signal received!
```

 

### Check Abort Status

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  console.log('Initial aborted:', signal.aborted); // false
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Check periodically
  if (signal.aborted) {
    console.log('Aborted during wait');
    return null;
  }
  
  const response = await fetch('/api/data', { signal });
  return response.json();
});

setTimeout(() => abort(state), 500);
// Logs: Initial aborted: false
// Logs: Aborted during wait
```

 

## Edge Cases

### Gotcha 1: AbortController is Null When Idle

```javascript
const state = asyncState(null);

console.log(state.abortController); // null (no operation)

execute(state, async (signal) => {
  console.log(state.abortController); // AbortController {}
  return 'data';
});

await new Promise(r => setTimeout(r, 100));
console.log(state.abortController); // null (completed)
```

 

### Gotcha 2: New AbortController Each Execute

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  const controller1 = state.abortController;
  console.log('First:', controller1);
  return 'first';
});

await new Promise(r => setTimeout(r, 100));

execute(state, async (signal) => {
  const controller2 = state.abortController;
  console.log('Second:', controller2);
  return 'second';
});

// controller1 !== controller2 (different instances)
```

 

### Gotcha 3: Abort Doesn't Throw in State

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  const response = await fetch('/api/data', { signal });
  return response.json();
});

setTimeout(() => abort(state), 100);

await new Promise(r => setTimeout(r, 200));

console.log(state.error); // null (abort is not an error)
console.log(state.data);  // null
console.log(state.loading); // false
```

**Key insight:** Aborted operations don't set `error` because abort is intentional.

 

### Gotcha 4: Can't Reuse Aborted Controller

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  await new Promise(r => setTimeout(r, 1000));
  return 'data';
});

const controller = state.abortController;

abort(state); // Aborts and clears controller

// Can't reuse the same controller
state.abortController = controller; // Don't do this!
```

 

## When to Use

**Use `abortController` for:**
- ✅ Canceling fetch requests
- ✅ Implementing timeouts
- ✅ Cleanup on component unmount
- ✅ Canceling on route changes
- ✅ User-initiated cancellation

**Don't use for:**
- ❌ Checking if operation is running (use `loading`)
- ❌ Normal operation completion (automatic)
- ❌ Reusing across operations (new controller each time)

 

## Summary

**What it is:** Current AbortController instance for cancellation

**Initial value:** `null`

**Set when:** `execute()` starts

**Cleared when:** Operation completes or is aborted

**Purpose:** Enable cancellation of async operations

**Type:** AbortController | null

**Reactive:** Yes—can be watched

**Read/write:** Both (managed by `execute()`)

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// Check abort controller
console.log(state.abortController); // null (idle)

// During execute
execute(state, async (signal) => {
  console.log(state.abortController); // AbortController {}
  
  // Use signal for cancellation
  const response = await fetch('/api/data', { signal });
  return response.json();
});

// Abort operation
if (state.abortController) {
  abort(state); // Uses controller internally
}

// After completion
console.log(state.abortController); // null
```

**One-Line Rule:** `abortController` is created automatically during `execute()` and enables operation cancellation via `abort()`—`null` when idle.