
# Documentation: `refetch(asyncState)`

## Quick Start (30 seconds)

**Re-run the last async operation with one function call:**

```javascript
const userData = asyncState(null);

// Load user data
await execute(userData, async (signal) => {
  const response = await fetch('/api/user/123', { signal });
  return response.json();
});

console.log(userData.data); // { name: 'John', ... }

// Later: refresh the data
await refetch(userData);

console.log(userData.data); // { name: 'John', email: 'updated@...' }
```

**That's it!** The same fetch runs again without rewriting the function.

 

## What is refetch()?

`refetch()` is a function that **re-executes the last async operation** you ran with `execute()`.

Simply put: **It's the refresh button for your data.**

```javascript
const posts = asyncState(null);

// First load
await execute(posts, async (signal) => {
  return await fetch('/api/posts', { signal }).then(r => r.json());
});

// Refresh
await refetch(posts); // Runs the same fetch again
```

 

## Syntax

### Shorthand (Recommended)
```javascript
refetch(asyncState)
```

### Full Namespace
```javascript
ReactiveUtils.refetch(asyncState)
```

### Parameters
- **`asyncState`** - The async state that has a previous operation

### Returns
- **Promise** that resolves to a result object (same as `execute()`)

 

## Why Does This Exist?

### The Challenge with Refreshing Data

When you want to refresh data, you typically have to repeat code:

**Without refetch():**
```javascript
const userData = asyncState(null);

// First load
async function loadUser() {
  await execute(userData, async (signal) => {
    const response = await fetch('/api/user', { signal });
    return response.json();
  });
}

// Initial load
await loadUser();

// Later: refresh
await loadUser(); // Have to call the same function again
```

**Or store the function separately:**
```javascript
const userData = asyncState(null);
const userFetchFn = async (signal) => {
  const response = await fetch('/api/user', { signal });
  return response.json();
};

// First load
await execute(userData, userFetchFn);

// Later: refresh
await execute(userData, userFetchFn); // Verbose
```

**What's tedious about this?**

❌ Duplicate function calls  
❌ Or extra variables to store functions  
❌ Repetitive code  
❌ Easy to forget what to call  

### The Solution with refetch()

```javascript
const userData = asyncState(null);

// First load
await execute(userData, async (signal) => {
  const response = await fetch('/api/user', { signal });
  return response.json();
});

// Later: refresh - just one line
await refetch(userData);
```

**What's better about this?**

✅ No duplicate code  
✅ No extra variables needed  
✅ One simple call  
✅ The function is remembered automatically  

This method is **especially useful when** you need refresh buttons, pull-to-refresh, polling, or any scenario where data needs to reload.

 

## Mental Model

Think of `refetch()` as **the replay button** for your async operation.

### Without refetch() (Manual Replay)
```
Operation runs
   ↓
You save the operation instructions
   ↓
Later: You look up the instructions
   ↓
You run them manually again
```

### With refetch() (One-Button Replay)
```
Operation runs → [Saved automatically]
   ↓
Later: Press [REFETCH]
   ↓
Same operation runs automatically
```

**Key Insight:** The last operation is remembered for you—just hit replay.

 

## How Does It Work?

When you call `execute()`, the function is saved:

```javascript
// When you do this...
await execute(userData, async (signal) => {
  return await fetch('/api/user', { signal }).then(r => r.json());
});

// Internally, the function is stored
userData.lastFn = async (signal) => {
  return await fetch('/api/user', { signal }).then(r => r.json());
};
```

When you call `refetch()`:

```
Step 1: Check
   ↓
[Is there a lastFn stored?]
   ↓
   Yes → Continue
   No  → Return error
   ↓
Step 2: Execute
   ↓
[Call execute(state, lastFn)]
   ↓
Step 3: Return Result
   ↓
[Same result as execute()]
```

**Behind the scenes:**
```javascript
// Simplified internal logic
function refetch(asyncState) {
  if (asyncState.lastFn) {
    return execute(asyncState, asyncState.lastFn);
  } else {
    return Promise.resolve({
      success: false,
      error: new Error('No function to refetch')
    });
  }
}
```

 

## Basic Usage

### Example 1: Refresh Button

```javascript
const products = asyncState(null);

// Load products
await execute(products, async (signal) => {
  const response = await fetch('/api/products', { signal });
  return response.json();
});

// User clicks "Refresh"
document.querySelector('#refreshBtn').addEventListener('click', async () => {
  await refetch(products);
  console.log('Products refreshed!');
});
```

 

### Example 2: Pull to Refresh

```javascript
const feed = asyncState(null);

// Load feed
await execute(feed, async (signal) => {
  const response = await fetch('/api/feed', { signal });
  return response.json();
});

// Pull-to-refresh gesture
async function onPullToRefresh() {
  console.log('Refreshing feed...');
  await refetch(feed);
  console.log('Feed refreshed!');
}
```

 

### Example 3: Polling/Auto-Refresh

```javascript
const liveData = asyncState(null);

// Initial load
await execute(liveData, async (signal) => {
  const response = await fetch('/api/live-data', { signal });
  return response.json();
});

// Refresh every 5 seconds
setInterval(async () => {
  await refetch(liveData);
  console.log('Data updated');
}, 5000);
```

 

### Example 4: Retry After Error

```javascript
const apiData = asyncState(null);

// Try to load
await execute(apiData, async (signal) => {
  const response = await fetch('/api/data', { signal });
  if (!response.ok) throw new Error('Failed');
  return response.json();
});

// If error, show retry button
if (apiData.isError) {
  document.querySelector('#retryBtn').addEventListener('click', async () => {
    console.log('Retrying...');
    await refetch(apiData);
  });
}
```

 

## Deep Dive

### What if There's No Function to Refetch?

If you call `refetch()` before ever calling `execute()`, it fails gracefully:

```javascript
const data = asyncState(null);

// Try to refetch without executing first
const result = await refetch(data);

console.log(result);
// {
//   success: false,
//   error: Error('No function to refetch')
// }
```

**Safe handling:**
```javascript
const result = await refetch(data);

if (!result.success && result.error.message.includes('No function')) {
  console.log('Nothing to refetch - load data first');
}
```

 

### refetch() vs New execute()

**refetch()** uses the saved function:

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  return await fetch('/api/endpoint1', { signal }).then(r => r.json());
});

// This uses endpoint1 again
await refetch(data);
```

**New execute()** replaces the saved function:

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  return await fetch('/api/endpoint1', { signal }).then(r => r.json());
});

// This replaces endpoint1 with endpoint2
await execute(data, async (signal) => {
  return await fetch('/api/endpoint2', { signal }).then(r => r.json());
});

// Now refetch uses endpoint2
await refetch(data);
```
**When to use refetch():**
- User explicitly requests refresh
- You want to reload without changing the query
- Polling at intervals
- Retry after failure

**When to use new execute():**
- Different endpoint or parameters
- Different operation entirely
- First-time load

 

### Return Value

`refetch()` returns the same result object as `execute()`:

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  return { value: 'data' };
});

const result = await refetch(data);

// Success case
console.log(result);
// {
//   success: true,
//   data: { value: 'data' }
// }

// Error case (if fetch fails)
// {
//   success: false,
//   error: Error(...)
// }
```

 

### Loading State During Refetch

Just like `execute()`, `refetch()` updates loading states:

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  return await fetchData();
});

// Before refetch
console.log(data.loading); // false

// Start refetch
const promise = refetch(data);
console.log(data.loading); // true

// After refetch completes
await promise;
console.log(data.loading); // false
```

**Show loading UI:**
```javascript
effect(() => {
  if (data.loading) {
    console.log('Refreshing...');
  } else {
    console.log('Refresh complete');
  }
});

await refetch(data);
```

 

## Common Patterns

### Pattern 1: Refresh with Cooldown

```javascript
const data = asyncState(null);
let lastRefresh = 0;

async function refreshWithCooldown() {
  const now = Date.now();
  
  // Only allow refresh every 5 seconds
  if (now - lastRefresh < 5000) {
    console.log('Please wait before refreshing again');
    return;
  }
  
  lastRefresh = now;
  await refetch(data);
}
```

 

### Pattern 2: Conditional Refetch

```javascript
const userData = asyncState(null);

// Only refetch if data is stale (older than 1 minute)
let lastFetch = Date.now();

async function refetchIfStale() {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  if (now - lastFetch > oneMinute) {
    await refetch(userData);
    lastFetch = now;
  } else {
    console.log('Data is still fresh');
  }
}
```

 

### Pattern 3: Background Refresh

```javascript
const notifications = asyncState(null);

// Initial load
await execute(notifications, async (signal) => {
  const response = await fetch('/api/notifications', { signal });
  return response.json();
});

// Silent background refresh every 30 seconds
setInterval(async () => {
  // Refetch without showing loading UI
  const oldData = notifications.data;
  await refetch(notifications);
  
  if (notifications.data.length > oldData.length) {
    console.log('New notifications!');
  }
}, 30000);
```

 

### Pattern 4: Refresh All

```javascript
const user = asyncState(null);
const posts = asyncState(null);
const comments = asyncState(null);

// Load all data
await execute(user, async (signal) => fetchUser(signal));
await execute(posts, async (signal) => fetchPosts(signal));
await execute(comments, async (signal) => fetchComments(signal));

// Refresh everything at once
async function refreshAll() {
  await Promise.all([
    refetch(user),
    refetch(posts),
    refetch(comments)
  ]);
  
  console.log('Everything refreshed!');
}
```

 

### Pattern 5: Smart Retry

```javascript
const apiData = asyncState(null);

async function loadWithSmartRetry() {
  await execute(apiData, async (signal) => {
    return await fetchData(signal);
  });
  
  // Retry up to 3 times on failure
  let retries = 0;
  
  while (apiData.isError && retries < 3) {
    retries++;
    console.log(`Retry ${retries}/3...`);
    await delay(1000 * retries); // Exponential backoff
    await refetch(apiData);
  }
  
  if (apiData.isSuccess) {
    console.log('Success after', retries, 'retries');
  } else {
    console.log('Failed after 3 retries');
  }
}
```

 

## Summary

**What is refetch()?**  
A function that re-runs the last async operation executed on an async state.

**Key Features:**
- ✅ One-line refresh
- ✅ Automatically uses last function
- ✅ No duplicate code needed
- ✅ Returns same result object as execute()

**When to use it:**
- Refresh buttons
- Pull-to-refresh
- Polling/auto-refresh
- Retry after errors
- Any time you need to reload data

**Remember:**
```javascript
// First: execute saves the function
await execute(data, async (signal) => {
  return await fetchData(signal);
});

// Later: refetch uses that saved function
await refetch(data);
```

**Common Pattern:**
```javascript
// Setup
const data = asyncState(null);
await execute(data, fetchFunction);

// In UI
<button onClick={() => refetch(data)}>
  Refresh
</button>
```

**Related Methods:**
- `execute()` - Start async operation (saves function)
- `abort()` - Cancel current operation
- `reset()` - Clear all state

 

