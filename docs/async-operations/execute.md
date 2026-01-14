# Documentation: `execute(asyncState, fn)`

## Quick Start (30 seconds)

**Fetch data with automatic loading states and race condition protection:**

```javascript
// Create async state
const userData = asyncState(null);

// Execute API call
await execute(userData, async (signal) => {
  const response = await fetch('/api/user', { signal });
  return response.json();
});

// Use the results
console.log(userData.data);    // { name: 'John', email: '...' }
console.log(userData.loading); // false
console.log(userData.error);   // null
```

**That's it!** Loading states, error handling, and cancellation are automatic.

 

## What is execute()?

`execute()` is a function that **runs async operations** (like API calls) on async state objects while automatically managing loading, error, and success states.

Simply put: **It handles the messy parts of async operations so you don't have to.**

```javascript
// Instead of manually tracking loading/error/data...
const userData = asyncState(null);

// Just execute your async function
await execute(userData, async (signal) => {
  // Your async code here
  return await fetchUserData();
});

// Everything is handled automatically!
```

 

## Syntax

### Shorthand (Recommended)
```javascript
execute(asyncState, asyncFunction)
```

### Full Namespace
```javascript
ReactiveUtils.execute(asyncState, asyncFunction)
```

### Parameters
- **`asyncState`** - An async state object created with `asyncState()`
- **`asyncFunction`** - An async function that receives an `AbortSignal`

### Returns
- **Promise** that resolves to a result object:
  ```javascript
  {
    success: true,
    data: yourData
  }
  // OR
  {
    success: false,
    error: errorObject
  }
  ```

 

## Why Does This Exist?

### The Challenge with Async Operations

When you fetch data in JavaScript, several things need to happen:

```javascript
// Regular fetch - you handle everything manually
let loading = false;
let error = null;
let data = null;

loading = true;
try {
  const response = await fetch('/api/data');
  data = await response.json();
  error = null;
} catch (err) {
  error = err;
  data = null;
} finally {
  loading = false;
}
```

**What's tedious about this?**

❌ Manual loading state management  
❌ Manual error handling  
❌ No automatic cancellation  
❌ Race conditions if multiple requests happen  
❌ Boilerplate code repeated everywhere  

### The Solution with execute()

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  const response = await fetch('/api/data', { signal });
  return response.json();
});

// Loading, error, and data are all handled automatically!
```

**What's better about this?**

✅ Automatic loading state (`data.loading`)  
✅ Automatic error handling (`data.error`)  
✅ Built-in cancellation via AbortSignal  
✅ Race condition prevention  
✅ Clean, readable code  

This method is **especially useful when** you need reliable async operations with proper state management and want to avoid common pitfalls like race conditions.

 

## Mental Model

Think of `execute()` as a **smart delivery service** for async operations.

### Regular Fetch (DIY Delivery)
```
You → Order Package
You → Track delivery status manually
You → Handle delivery failures manually
You → Check if package arrived
You → Store the package yourself
```

### execute() (Professional Delivery Service)
```
You → execute(state, fetchFunction)
     ↓
  Service automatically:
     • Updates "delivering" status
     • Handles delivery failures
     • Cancels outdated deliveries
     • Stores package when it arrives
     • Notifies you of completion
```

**Key Insight:** You just say what to fetch, and `execute()` handles all the logistics.

 

## How Does It Work?

When you call `execute()`, here's what happens behind the scenes:

```
Step 1: Setup
   ↓
[Create AbortController]
[Set requestId for race protection]
   ↓
Step 2: Start
   ↓
[Set loading = true]
[Clear previous error]
   ↓
Step 3: Execute
   ↓
[Run your async function]
[Pass AbortSignal]
   ↓
Step 4: Handle Result
   ↓
[Check if still latest request]
   ↓
   Success → [Set data, clear error]
   Error   → [Set error, clear data]
   Aborted → [Mark as cancelled]
   ↓
Step 5: Cleanup
   ↓
[Set loading = false]
[Clear AbortController]
```

**Race Condition Prevention:**
Each request gets a unique ID. If a newer request starts, older results are ignored.

 

## Basic Usage

### Example 1: Simple API Fetch

```javascript
// Create async state
const posts = asyncState(null);

// Fetch data
await execute(posts, async (signal) => {
  const response = await fetch('/api/posts', { signal });
  return response.json();
});

// Check results
if (posts.isSuccess) {
  console.log('Got posts:', posts.data);
}

if (posts.isError) {
  console.error('Failed:', posts.error);
}
```

**What's happening?**

1️⃣ `posts.loading` becomes `true` automatically  
2️⃣ Your fetch runs with cancellation support  
3️⃣ On success, `posts.data` gets the result  
4️⃣ On error, `posts.error` gets the error  
5️⃣ `posts.loading` becomes `false` automatically  

 

### Example 2: With Loading UI

```javascript
const userData = asyncState(null);

// Show loading state in UI
effect(() => {
  if (userData.loading) {
    console.log('Loading user...');
  } else if (userData.isSuccess) {
    console.log('User loaded:', userData.data.name);
  } else if (userData.isError) {
    console.log('Error:', userData.error.message);
  }
});

// Fetch user
await execute(userData, async (signal) => {
  const response = await fetch('/api/user/123', { signal });
  return response.json();
});
```

**Output:**
```
Loading user...
User loaded: John Doe
```

 

### Example 3: Handling Errors

```javascript
const data = asyncState(null);

const result = await execute(data, async (signal) => {
  const response = await fetch('/api/data', { signal });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
});

// Check the result
if (result.success) {
  console.log('Data:', result.data);
} else {
  console.log('Failed:', result.error);
}

// Or check the state
if (data.isError) {
  console.log('Error stored in state:', data.error);
}
```

 

### Example 4: Using the AbortSignal

The `signal` parameter lets you cancel requests:

```javascript
const search = asyncState(null);

await execute(search, async (signal) => {
  // Pass signal to fetch
  const response = await fetch('/api/search?q=react', { signal });
  
  // You can also check if cancelled
  if (signal.aborted) {
    console.log('Request was cancelled');
    return;
  }
  
  return response.json();
});
```

**Why use the signal?**  
If a new request starts, the old one is automatically cancelled via this signal.

 

## Deep Dive

### Race Condition Protection

**The Problem:**
```javascript
// User types fast: "abc"
search('a');   // Request 1 starts
search('ab');  // Request 2 starts
search('abc'); // Request 3 starts

// Requests finish out of order:
// Request 3 finishes → shows 'abc' results ✓
// Request 1 finishes → shows 'a' results ✗ (wrong!)
```

**The Solution:**
```javascript
const results = asyncState(null);

// Each execute() gets a unique requestId
await execute(results, async (signal) => {
  return await fetch('/api/search?q=a');
});

await execute(results, async (signal) => {
  return await fetch('/api/search?q=abc');
});

// Only the LATEST request updates the data
// Older requests are ignored automatically
```

**How it works internally:**
```javascript
// Simplified internal logic
let requestId = 0;

function execute(state, fn) {
  const thisRequestId = ++requestId;
  
  const result = await fn(signal);
  
  // Only update if still the latest request
  if (thisRequestId === requestId) {
    state.data = result;
  }
}
```

 

### Automatic Cancellation

When a new request starts, the previous one is cancelled:

```javascript
const data = asyncState(null);

// Start first request
execute(data, async (signal) => {
  await delay(2000);
  return 'First';
});

// Start second request immediately
// → First request is automatically cancelled
execute(data, async (signal) => {
  await delay(1000);
  return 'Second';
});

// Result: data.data === 'Second'
```

**Behind the scenes:**
```
Request 1: [AbortController created]
           ↓
Request 2: [New AbortController created]
           [Previous AbortController.abort() called]
           ↓
Request 1: [Cancelled via signal.aborted]
Request 2: [Continues normally]
```

 

### Return Value Structure

`execute()` returns a promise with a result object:

```javascript
const result = await execute(data, async (signal) => {
  return await fetchData();
});

// Success case:
{
  success: true,
  data: yourData
}

// Error case:
{
  success: false,
  error: errorObject
}

// Aborted case:
{
  success: false,
  aborted: true
}

// Stale case (newer request already ran):
{
  success: false,
  stale: true
}
```

**Using the result:**
```javascript
if (result.success) {
  console.log('Success!', result.data);
} else if (result.aborted) {
  console.log('Cancelled by user');
} else if (result.stale) {
  console.log('Superseded by newer request');
} else {
  console.error('Failed:', result.error);
}
```

 

### Working with Callbacks

You can pass success/error callbacks:

```javascript
const data = asyncState(null, {
  onSuccess: (result) => {
    console.log('✅ Success!', result);
  },
  onError: (error) => {
    console.error('❌ Error!', error);
  }
});

await execute(data, async (signal) => {
  return await fetch('/api/data', { signal }).then(r => r.json());
});

// Callbacks fire automatically on success/error
```

 

## Common Patterns

### Pattern 1: Search with Debouncing

```javascript
const searchResults = asyncState(null);
let searchTimeout;

function search(query) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    execute(searchResults, async (signal) => {
      const response = await fetch(`/api/search?q=${query}`, { signal });
      return response.json();
    });
  }, 300); // Wait 300ms after user stops typing
}

// User types: a... b... c
// Only searches for 'abc' after 300ms pause
```

 

### Pattern 2: Retry on Failure

```javascript
async function executeWithRetry(state, fn, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const result = await execute(state, fn);
    
    if (result.success) {
      return result;
    }
    
    attempt++;
    console.log(`Retry ${attempt}/${maxRetries}...`);
    await delay(1000 * attempt); // Exponential backoff
  }
  
  throw new Error('Max retries exceeded');
}

// Use it
await executeWithRetry(data, async (signal) => {
  return await fetch('/api/data', { signal }).then(r => r.json());
});
```

 

### Pattern 3: Parallel Requests

```javascript
const user = asyncState(null);
const posts = asyncState(null);

// Execute both at the same time
await Promise.all([
  execute(user, async (signal) => {
    const response = await fetch('/api/user', { signal });
    return response.json();
  }),
  execute(posts, async (signal) => {
    const response = await fetch('/api/posts', { signal });
    return response.json();
  })
]);

console.log('Both loaded!', user.data, posts.data);
```

 

### Pattern 4: Conditional Execution

```javascript
const data = asyncState(null);

// Only fetch if not already loaded
if (!data.data && !data.loading) {
  await execute(data, async (signal) => {
    return await fetchData(signal);
  });
}
```

 

### Pattern 5: With Authentication

```javascript
const userPosts = asyncState(null);

await execute(userPosts, async (signal) => {
  const response = await fetch('/api/user/posts', {
    signal,
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (response.status === 401) {
    throw new Error('Unauthorized - please login');
  }
  
  return response.json();
});

if (userPosts.isError && userPosts.error.message.includes('Unauthorized')) {
  console.log('Redirect to login...');
}
```

 

## Summary

**What is execute()?**  
A function that runs async operations with automatic state management, error handling, and race condition prevention.

**Key Features:**
- ✅ Automatic loading/error/data state management
- ✅ Built-in request cancellation via AbortSignal
- ✅ Race condition prevention with request IDs
- ✅ Clean, readable async code
- ✅ Works with any Promise-based async function

**When to use it:**
- API calls and data fetching
- Any async operation needing state tracking
- When you want reliable request management
- When you need automatic cancellation

**Remember:**
```javascript
execute(asyncState, async (signal) => {
  // Your async code here
  // Use 'signal' for cancellation support
  return yourData;
});
```

**Next Steps:**
- Learn `abort()` to cancel requests manually
- Learn `refetch()` to re-run requests
- Learn `reset()` to clear state

 
