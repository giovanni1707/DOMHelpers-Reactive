
# Documentation: `abort(asyncState)`

## Quick Start (30 seconds)

**Cancel a running request with one function call:**

```javascript
const data = asyncState(null);

// Start a long request
execute(data, async (signal) => {
  const response = await fetch('/api/large-file', { signal });
  return response.json();
});

// User clicks "Cancel" button
abort(data);

console.log(data.loading); // false (stopped immediately)
```

**That's it!** The request is cancelled and loading state is cleared.

 

## What is abort()?

`abort()` is a function that **stops a running async operation** immediately and cleans up the loading state.

Simply put: **It's the emergency stop button for your requests.**

```javascript
const search = asyncState(null);

// Start searching
execute(search, async (signal) => {
  return await fetch('/api/search?q=query', { signal });
});

// User changed their mind? Cancel it!
abort(search);
```

 

## Syntax

### Shorthand (Recommended)
```javascript
abort(asyncState)
```

### Full Namespace
```javascript
ReactiveUtils.abort(asyncState)
```

### Parameters
- **`asyncState`** - The async state object with a running operation

### Returns
- **`void`** (nothing)

 

## Why Does This Exist?

### The Challenge with Async Operations

When you start an async operation, sometimes you need to cancel it:

**Without abort():**
```javascript
const data = asyncState(null);
let controller = null;

// Start request - manually track AbortController
controller = new AbortController();
execute(data, async (signal) => {
  return await fetch('/api/data', { signal: controller.signal });
});

// Cancel - manual cleanup required
if (controller) {
  controller.abort();
  data.loading = false; // Must manually update state
  controller = null;
}
```

**What's tedious about this?**

❌ Manually create and track AbortController  
❌ Manually update loading state  
❌ Easy to forget cleanup  
❌ Boilerplate code everywhere  

### The Solution with abort()

```javascript
const data = asyncState(null);

// Start request
execute(data, async (signal) => {
  return await fetch('/api/data', { signal });
});

// Cancel - everything is handled
abort(data);
```

**What's better about this?**

✅ One simple function call  
✅ Automatic loading state cleanup  
✅ No manual AbortController management  
✅ Clean, readable code  

This method is **especially useful when** users need to cancel operations (like closing a dialog, switching tabs, or clicking a cancel button).

 

## Mental Model

Think of `abort()` as **pressing the stop button** on a running machine.

### Without abort() (Manual Stop)
```
Machine Running
   ↓
You find the power cord
   ↓
You unplug it
   ↓
You reset the "running" indicator manually
   ↓
You clean up the workspace
```

### With abort() (One-Button Stop)
```
Machine Running
   ↓
Press [STOP] button
   ↓
Everything handled automatically:
   • Power cuts off
   • "Running" indicator clears
   • Workspace cleaned up
```

**Key Insight:** You don't manage the details—just press stop.

 

## How Does It Work?

When you call `abort()`, here's what happens:

```
Step 1: Check
   ↓
[Is there a running operation?]
   ↓
   Yes → Continue
   No  → Do nothing
   ↓
Step 2: Cancel
   ↓
[Call AbortController.abort()]
   ↓
Step 3: Cleanup
   ↓
[Set loading = false]
[Clear AbortController reference]
```

**Behind the scenes:**
```javascript
// Simplified internal logic
function abort(asyncState) {
  if (asyncState.abortController) {
    asyncState.abortController.abort(); // Cancel the request
    asyncState.loading = false;          // Clear loading state
    asyncState.abortController = null;   // Clean up
  }
}
```

 

## Basic Usage

### Example 1: Cancel Button

```javascript
const data = asyncState(null);

// Start loading
execute(data, async (signal) => {
  const response = await fetch('/api/slow-endpoint', { signal });
  return response.json();
});

// User clicks "Cancel"
document.querySelector('#cancelBtn').addEventListener('click', () => {
  abort(data);
  console.log('Request cancelled');
});
```

 

### Example 2: Component Cleanup

```javascript
const posts = asyncState(null);

// Start loading posts
execute(posts, async (signal) => {
  const response = await fetch('/api/posts', { signal });
  return response.json();
});

// Component is unmounting? Cancel any pending requests
function cleanup() {
  abort(posts);
}
```

 

### Example 3: Search Cancellation

```javascript
const searchResults = asyncState(null);

function search(query) {
  // Cancel previous search if still running
  abort(searchResults);
  
  // Start new search
  execute(searchResults, async (signal) => {
    const response = await fetch(`/api/search?q=${query}`, { signal });
    return response.json();
  });
}

// User types: "r", "re", "rea", "reac", "react"
// Each keystroke cancels the previous search
search('r');
search('re');
search('rea');
search('reac');
search('react'); // Only this one completes
```

 

### Example 4: Conditional Cancellation

```javascript
const fileUpload = asyncState(null);

execute(fileUpload, async (signal) => {
  // Uploading large file...
  await uploadFile(file, signal);
});

// Cancel only if still uploading
if (fileUpload.loading) {
  abort(fileUpload);
  console.log('Upload cancelled');
} else {
  console.log('Upload already completed');
}
```

 

## Deep Dive

### What Happens to the Request?

When you call `abort()`, the fetch request is cancelled via the AbortSignal:

```javascript
const data = asyncState(null);

execute(data, async (signal) => {
  try {
    const response = await fetch('/api/data', { signal });
    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
      // This is normal when abort() is called
    } else {
      throw error; // Re-throw other errors
    }
  }
});

// Cancel the request
abort(data);
// → Fetch throws AbortError
// → Error is caught and handled
// → State is cleaned up
```

**What gets cancelled:**
- ✅ The fetch request itself
- ✅ Any pending Promise chains
- ✅ Network activity stops
- ✅ Loading state is cleared

 

### Multiple Calls to abort()

It's safe to call `abort()` multiple times:

```javascript
const data = asyncState(null);

execute(data, async (signal) => {
  return await fetch('/api/data', { signal });
});

// Call abort multiple times
abort(data); // Cancels the request
abort(data); // Does nothing (no operation running)
abort(data); // Does nothing (no operation running)

// No errors, no problems
```

 

### abort() vs. Automatic Cancellation

**Automatic cancellation** happens when you start a new `execute()`:

```javascript
const data = asyncState(null);

// Request 1 starts
execute(data, async (signal) => {
  return await fetch('/api/data1', { signal });
});

// Request 2 starts → Request 1 is automatically cancelled
execute(data, async (signal) => {
  return await fetch('/api/data2', { signal });
});
```

**Manual cancellation** with `abort()` is for stopping the operation entirely:

```javascript
const data = asyncState(null);

// Request starts
execute(data, async (signal) => {
  return await fetch('/api/data', { signal });
});

// User wants to stop completely (not start a new request)
abort(data);
```

**When to use which:**
- **Automatic:** When starting a newer operation (search, pagination)
- **Manual abort():** When user wants to stop completely (cancel button, close dialog)

 

### Checking if Aborted

Inside your async function, you can check the signal:

```javascript
const data = asyncState(null);

execute(data, async (signal) => {
  // Step 1: Fetch data
  const response = await fetch('/api/data', { signal });
  
  // Check if cancelled after fetch
  if (signal.aborted) {
    console.log('Cancelled after fetch');
    return null;
  }
  
  const json = await response.json();
  
  // Step 2: Process data
  const processed = await processData(json);
  
  // Check again
  if (signal.aborted) {
    console.log('Cancelled after processing');
    return null;
  }
  
  return processed;
});

// Call abort() at any time
abort(data);
```

 

## Common Patterns

### Pattern 1: Cancel on Component Unmount

```javascript
function MyComponent() {
  const userData = asyncState(null);
  
  // Load user data
  execute(userData, async (signal) => {
    const response = await fetch('/api/user', { signal });
    return response.json();
  });
  
  // Clean up when component unmounts
  return () => {
    abort(userData);
  };
}
```

 

### Pattern 2: Cancel on Route Change

```javascript
const pageData = asyncState(null);

function loadPage(pageId) {
  // Cancel any previous page load
  abort(pageData);
  
  // Load new page
  execute(pageData, async (signal) => {
    const response = await fetch(`/api/pages/${pageId}`, { signal });
    return response.json();
  });
}

// User navigates: Page 1 → Page 2 → Page 3
loadPage(1); // Starts loading
loadPage(2); // Cancels page 1, loads page 2
loadPage(3); // Cancels page 2, loads page 3
```

 

### Pattern 3: Timeout with Abort

```javascript
const data = asyncState(null);

// Start request
execute(data, async (signal) => {
  const response = await fetch('/api/slow-endpoint', { signal });
  return response.json();
});

// Cancel after 5 seconds if not done
setTimeout(() => {
  if (data.loading) {
    abort(data);
    console.log('Request timed out');
  }
}, 5000);
```

 

### Pattern 4: User Confirmation

```javascript
const deleteData = asyncState(null);

async function deleteItem(id) {
  // Start deletion
  execute(deleteData, async (signal) => {
    await delay(3000); // Simulated delay
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      signal
    });
    return response.json();
  });
  
  // Give user 2 seconds to cancel
  setTimeout(() => {
    if (deleteData.loading) {
      const confirm = window.confirm('Deletion in progress. Cancel?');
      if (confirm) {
        abort(deleteData);
        console.log('Deletion cancelled by user');
      }
    }
  }, 2000);
}
```

 

### Pattern 5: Cancel All Requests

```javascript
const requests = [
  asyncState(null),
  asyncState(null),
  asyncState(null)
];

// Start multiple requests
requests.forEach((state, i) => {
  execute(state, async (signal) => {
    const response = await fetch(`/api/data${i}`, { signal });
    return response.json();
  });
});

// Cancel all at once
function cancelAll() {
  requests.forEach(state => abort(state));
  console.log('All requests cancelled');
}
```

 

## Summary

**What is abort()?**  
A function that immediately cancels a running async operation and cleans up the loading state.

**Key Features:**
- ✅ One-line cancellation
- ✅ Automatic state cleanup
- ✅ Safe to call multiple times
- ✅ No manual AbortController management

**When to use it:**
- User clicks cancel button
- Component unmounts
- User navigates away
- Request timeout
- Any time you need to stop an operation

**Remember:**
```javascript
// Start
execute(state, async (signal) => { ... });

// Stop
abort(state);
```

**Related Methods:**
- `execute()` - Start async operations
- `reset()` - Clear state completely
- `refetch()` - Re-run last operation

 
