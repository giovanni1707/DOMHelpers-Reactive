# `asyncEffect()` - Async Effects with Built-In Cancellation

## Quick Start (30 seconds)

```javascript
const state = ReactiveUtils.state({ userId: 123 });

// Regular effect - no way to cancel ongoing async work
effect(() => {
  fetch(`/api/users/${state.userId}`)
    .then(res => res.json())
    .then(data => console.log(data));
  // ❌ If userId changes, old request still completes
});

// Async effect - automatically cancels previous requests
asyncEffect(async (signal) => {
  const res = await fetch(`/api/users/${state.userId}`, { signal });
  const data = await res.json();
  console.log(data);
  // ✅ Old request automatically cancelled when userId changes
});
```

**What just happened?** When `userId` changes, the old fetch is automatically cancelled. No race conditions, no stale data.

 

## What is asyncEffect()?

`asyncEffect()` creates a reactive effect that **automatically cancels async operations** when dependencies change or the effect re-runs.

Think of it as a **self-cleaning async effect**. Every time it runs, it cancels the previous run automatically using the browser's `AbortSignal` API.

### Simple Definition

**Regular `effect()`**: Async operations continue running even after the effect re-runs. You get race conditions and memory leaks.

**`asyncEffect()`**: Previous async operations are automatically cancelled when the effect re-runs. Clean, predictable async behavior.

 

## Syntax

### Shorthand (Recommended)
```javascript
asyncEffect(fn, options)
```

### Full Namespace Style
```javascript
ReactiveUtils.asyncEffect(fn, options)
```

### Parameters

| Parameter | Type | Description |
|   --|  |    -|
| `fn` | Function | Async function that receives `AbortSignal`: `async (signal) => {}` |
| `options` | Object | Configuration (optional) |

### Options Object

```javascript
{
  onError: (error) => { /* Handle errors (except AbortError) */ }
}
```

### Returns

- **Cleanup function** - Call this to cancel the effect and any ongoing async work

 

## Why Does This Exist?

### The Problem with Regular Async Effects

Let's say you're building a search box that fetches results as the user types:

```javascript
const state = ReactiveUtils.state({ query: '' });

// Regular effect with async operation
effect(() => {
  const query = state.query;
  
  fetch(`/api/search?q=${query}`)
    .then(res => res.json())
    .then(results => {
      state.results = results;
    });
});
```

**What happens when the user types quickly?**

```
User types: "h"
  ↓
Effect runs → fetch('/api/search?q=h') [Request A starts]
  ↓
User types: "he"
  ↓
Effect runs → fetch('/api/search?q=he') [Request B starts]
  ↓
User types: "hel"
  ↓
Effect runs → fetch('/api/search?q=hel') [Request C starts]
  ↓
Request A completes → state.results = results for "h" ❌ WRONG!
  ↓
Request C completes → state.results = results for "hel" ✅ Correct
  ↓
Request B completes → state.results = results for "he" ❌ STALE!
```

**Problems:**

❌ **Race conditions** - Slow requests overwrite newer results  
❌ **Wasted resources** - Old requests keep running  
❌ **Memory leaks** - References held by old promises  
❌ **Wrong data** - UI shows stale or incorrect results  
❌ **Manual cleanup** - You need complex cancellation logic  

### The Solution with asyncEffect()

```javascript
const state = ReactiveUtils.state({ query: '' });

// Async effect with automatic cancellation
asyncEffect(async (signal) => {
  const query = state.query;
  
  const res = await fetch(`/api/search?q=${query}`, { signal });
  const results = await res.json();
  state.results = results;
});
```

**What happens now?**

```
User types: "h"
  ↓
Effect runs → fetch('/api/search?q=h', { signal }) [Request A]
  ↓
User types: "he"
  ↓
✅ Request A CANCELLED automatically
  ↓
Effect runs → fetch('/api/search?q=he', { signal }) [Request B]
  ↓
User types: "hel"
  ↓
✅ Request B CANCELLED automatically
  ↓
Effect runs → fetch('/api/search?q=hel', { signal }) [Request C]
  ↓
Request C completes → state.results = results for "hel" ✅ Always correct!
```

**Benefits:**

✅ **No race conditions** - Old requests are cancelled  
✅ **Better performance** - No wasted network requests  
✅ **No memory leaks** - Everything cleaned up automatically  
✅ **Always correct data** - Only the latest result shows  
✅ **Automatic cleanup** - Built-in cancellation logic  

 

## Mental Model

Think of `asyncEffect()` as the difference between **multiple delivery drivers** vs **one driver with a recall button**.

### Regular Effect (Multiple Drivers)

```
Order 1: "Pizza" → Driver 1 dispatched
  ↓
Order 2: "Burger" → Driver 2 dispatched
  ↓
Order 3: "Salad" → Driver 3 dispatched
  ↓
All 3 drivers arrive at different times
  ↓
❌ Customer confused - which order is current?
❌ Wasted fuel - drivers 1 & 2 not needed
```

### Async Effect (Driver with Recall)

```
Order 1: "Pizza" → Driver dispatched
  ↓
Order 2: "Burger" → ✅ Recall Driver, new dispatch
  ↓
Order 3: "Salad" → ✅ Recall Driver, new dispatch
  ↓
Only Driver 3 arrives with Salad
  ↓
✅ Customer gets exactly what they want
✅ No wasted resources
```

 

## How Does It Work?

Under the hood, `asyncEffect()` uses the browser's `AbortController` API to manage cancellation.

### Step-by-Step Internal Flow

1️⃣ **Effect Creation**
```
asyncEffect() called
    ↓
Creates wrapped effect function
    ↓
Passes to regular effect()
    ↓
Effect activated
```

2️⃣ **First Run**
```
Dependencies accessed
    ↓
Effect triggers
    ↓
Create new AbortController
    ↓
Get signal from controller
    ↓
Pass signal to your async function
    ↓
Your async work starts (with signal)
```

3️⃣ **Re-run (Dependencies Changed)**
```
Dependencies change
    ↓
Effect about to re-run
    ↓
✅ Call cleanup from previous run
    ↓
✅ Abort previous controller (cancels async work)
    ↓
Create NEW AbortController
    ↓
Pass NEW signal to function
    ↓
Your async work starts (old work cancelled!)
```

### Visual: Automatic Cancellation Flow

```
Run 1:
[Effect Triggers] → [AbortController1 created] → [Async Work A starts]
                                                        ↓
                                                   [Work continuing...]
                                                        ↓
Run 2:                                            [Still running...]
[Dependencies Change] → [controller1.abort() ✅] → [Work A CANCELLED]
                              ↓
                        [AbortController2 created]
                              ↓
                        [Async Work B starts]
                              ↓
                        [Work B completes ✅]
```

 

## Basic Usage

### Example 1: Basic Async Fetch

```javascript
const state = ReactiveUtils.state({ 
  userId: 1,
  userData: null
});

// Fetch user data with automatic cancellation
const cleanup = asyncEffect(async (signal) => {
  const response = await fetch(`/api/users/${state.userId}`, { signal });
  const data = await response.json();
  state.userData = data;
});

// Later: stop the effect
cleanup();
```

**What's happening?**
- When `userId` changes, the previous fetch is cancelled automatically
- The `signal` is passed to `fetch()` to enable cancellation
- If cancelled, the promise rejects with an `AbortError` (handled silently)

 

### Example 2: With Error Handling

```javascript
const state = ReactiveUtils.state({ query: '' });

asyncEffect(async (signal) => {
  const res = await fetch(`/api/search?q=${state.query}`, { signal });
  
  if (!res.ok) {
    throw new Error('Search failed');
  }
  
  const results = await res.json();
  state.results = results;
}, {
  onError: (error) => {
    // AbortError is NOT passed here (handled automatically)
    console.error('Search error:', error);
    state.results = [];
  }
});
```

**Note:** `AbortError` is automatically filtered out. Your `onError` only receives actual errors.

 

### Example 3: Multiple Async Operations

```javascript
const state = ReactiveUtils.state({ 
  productId: 123,
  product: null,
  reviews: null
});

asyncEffect(async (signal) => {
  // Both requests use the same signal
  const [productRes, reviewsRes] = await Promise.all([
    fetch(`/api/products/${state.productId}`, { signal }),
    fetch(`/api/products/${state.productId}/reviews`, { signal })
  ]);
  
  state.product = await productRes.json();
  state.reviews = await reviewsRes.json();
});
```

**What's happening?**
- Both fetches share the same `signal`
- If `productId` changes, BOTH requests are cancelled
- New requests start with the new ID

 

### Example 4: Cleanup Function Return

```javascript
asyncEffect(async (signal) => {
  const ws = new WebSocket('/api/stream');
  
  // Cleanup function returned
  return () => {
    ws.close();
    console.log('WebSocket closed');
  };
});
```

Your async function can return a cleanup function that runs when:
- The effect re-runs
- The effect is stopped
- The signal is aborted

 

## Deep Dive: AbortSignal

### What is AbortSignal?

`AbortSignal` is a browser API that provides a standard way to cancel async operations.

```javascript
// Manual example (what asyncEffect does for you):
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/data', { signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Fetch was cancelled');
    }
  });

// Cancel it
controller.abort(); // Fetch stops immediately
```

### Using the Signal

Your async function receives the `signal` as its first parameter. Pass it to:

**1. Fetch API:**
```javascript
asyncEffect(async (signal) => {
  const res = await fetch(url, { signal }); // ✅
});
```

**2. Axios:**
```javascript
asyncEffect(async (signal) => {
  const res = await axios.get(url, { signal }); // ✅
});
```

**3. Custom Async Functions:**
```javascript
asyncEffect(async (signal) => {
  await delay(1000, signal); // Pass signal to your functions
});

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
```

### Checking if Aborted

```javascript
asyncEffect(async (signal) => {
  const data1 = await fetch('/api/data1', { signal });
  
  // Check before continuing
  if (signal.aborted) {
    return; // Stop early
  }
  
  const data2 = await fetch('/api/data2', { signal });
  
  // Or listen for abort
  signal.addEventListener('abort', () => {
    console.log('Operation cancelled');
  });
});
```

 

## Deep Dive: Cleanup on Re-run

### Automatic Cleanup

Every time the effect re-runs, previous cleanup happens automatically:

```javascript
asyncEffect(async (signal) => {
  console.log('Effect running');
  
  const ws = new WebSocket('/api/stream');
  
  // Return cleanup
  return () => {
    console.log('Cleanup running');
    ws.close();
  };
});

// Logs when state changes:
// "Effect running"
// ... state changes ...
// "Cleanup running"  ← Previous run cleaned up
// "Effect running"   ← New run starts
```

### Cleanup Order

```
Effect Re-run Triggered
    ↓
1️⃣ Previous cleanup function called (if exists)
    ↓
2️⃣ Previous AbortController.abort() called
    ↓
3️⃣ New AbortController created
    ↓
4️⃣ New effect function called
```

 

## Common Patterns

### Pattern 1: Debounced Search

```javascript
const state = ReactiveUtils.state({ searchQuery: '' });

asyncEffect(async (signal) => {
  const query = state.searchQuery;
  
  if (!query) {
    state.results = [];
    return;
  }
  
  // Wait before searching
  await delay(300, signal);
  
  const res = await fetch(`/api/search?q=${query}`, { signal });
  state.results = await res.json();
}, {
  onError: (error) => {
    console.error('Search failed:', error);
    state.results = [];
  }
});
```

### Pattern 2: Polling with Cancellation

```javascript
const state = ReactiveUtils.state({ 
  autoRefresh: true,
  data: null 
});

asyncEffect(async (signal) => {
  while (state.autoRefresh && !signal.aborted) {
    try {
      const res = await fetch('/api/data', { signal });
      state.data = await res.json();
      
      // Wait 5 seconds before next poll
      await delay(5000, signal);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Poll error:', error);
      }
      break;
    }
  }
});

// Stop polling
state.autoRefresh = false; // Automatically cancels
```

### Pattern 3: Sequential Operations

```javascript
const state = ReactiveUtils.state({ 
  step: 1,
  data: null 
});

asyncEffect(async (signal) => {
  // Step 1: Auth
  const auth = await fetch('/api/auth', { signal }).then(r => r.json());
  
  if (signal.aborted) return;
  
  // Step 2: User data
  const user = await fetch('/api/user', { 
    signal,
    headers: { Authorization: auth.token }
  }).then(r => r.json());
  
  if (signal.aborted) return;
  
  // Step 3: User preferences
  const prefs = await fetch(`/api/users/${user.id}/prefs`, { signal })
    .then(r => r.json());
  
  state.data = { auth, user, prefs };
});
```

 

## Real-World Examples

### Example 1: Live Search with Autocomplete

```javascript
const search = state({
  query: '',
  suggestions: [],
  loading: false
});

asyncEffect(async (signal) => {
  const query = search.query.trim();
  
  if (query.length < 2) {
    search.suggestions = [];
    search.loading = false;
    return;
  }
  
  search.loading = true;
  
  await delay(300, signal); // Debounce
  
  const res = await fetch(`/api/autocomplete?q=${query}`, { signal });
  const suggestions = await res.json();
  
  search.suggestions = suggestions;
  search.loading = false;
}, {
  onError: () => {
    search.suggestions = [];
    search.loading = false;
  }
});
```

### Example 2: Real-Time Dashboard

```javascript
const dashboard = state({
  metrics: null,
  refreshInterval: 10000,
  active: true
});

asyncEffect(async (signal) => {
  while (dashboard.active && !signal.aborted) {
    try {
      const res = await fetch('/api/metrics', { signal });
      dashboard.metrics = await res.json();
      
      await delay(dashboard.refreshInterval, signal);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Metrics fetch failed:', error);
        await delay(5000, signal); // Retry after 5s
      }
    }
  }
});
```

### Example 3: Image Lazy Loading

```javascript
const images = state({
  visible: [],
  loaded: new Set()
});

asyncEffect(async (signal) => {
  for (const imageId of images.visible) {
    if (images.loaded.has(imageId)) continue;
    
    try {
      const res = await fetch(`/api/images/${imageId}`, { signal });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      displayImage(imageId, url);
      images.loaded.add(imageId);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Failed to load image ${imageId}:`, error);
      }
    }
  }
});
```

 

## Summary

### Key Takeaways

✅ **Automatic cancellation** - Previous async work stops when effect re-runs  
✅ **AbortSignal support** - Standard browser API for cancellation  
✅ **No race conditions** - Always get the latest result  
✅ **Better performance** - No wasted network requests  
✅ **Clean code** - No manual cancellation logic needed  
✅ **Memory safe** - Everything cleaned up automatically  

### When to Use `asyncEffect()`

**Use `asyncEffect()` when:**
- Making fetch/API requests that depend on reactive state
- Implementing search, autocomplete, or filtering
- Polling or real-time updates
- Any async operation that might become stale
- Sequential async operations

**Use regular `effect()` when:**
- Sync operations only
- Fire-and-forget async (rare)
- You need special cancellation logic

### Quick Reference

```javascript
// Basic
asyncEffect(async (signal) => {
  const res = await fetch(url, { signal });
  const data = await res.json();
});

// With error handling
asyncEffect(async (signal) => {
  // ... async work
}, {
  onError: (error) => {
    console.error(error);
  }
});

// With cleanup
asyncEffect(async (signal) => {
  const ws = new WebSocket(url);
  return () => ws.close();
});

// Check abort status
asyncEffect(async (signal) => {
  await step1(signal);
  if (signal.aborted) return;
  await step2(signal);
});
```

**That's `asyncEffect()`!** Async operations that clean up after themselves. 🎉