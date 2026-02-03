
# Documentation: `reset(asyncState)`

## Quick Start (30 seconds)

**Clear all async state back to initial values:**

```javascript
const userData = asyncState(null);

// After loading data
execute(userData, async (signal) => {
  const response = await fetch('/api/user', { signal });
  return response.json();
});

console.log(userData.data);    // { name: 'John', ... }
console.log(userData.loading); // false
console.log(userData.error);   // null

// Reset everything
reset(userData);

console.log(userData.data);    // null (back to initial)
console.log(userData.loading); // false
console.log(userData.error);   // null
```

**That's it!** Everything is cleared and back to the starting state.

 

## What is reset()?

`reset()` is a function that **clears all async state** and returns it to initial values—like hitting a reset button.

Simply put: **It wipes the slate clean.**

```javascript
const data = asyncState(null);

// Load some data
await execute(data, async () => fetchData());
console.log(data.data); // { ... }

// Clear it all
reset(data);
console.log(data.data); // null (initial value)
```

 

## Syntax

### Shorthand (Recommended)
```javascript
reset(asyncState)
```

### Full Namespace
```javascript
ReactiveUtils.reset(asyncState)
```

### Parameters
- **`asyncState`** - The async state object to reset

### Returns
- **`void`** (nothing)

 

## Why Does This Exist?

### The Challenge with State Cleanup

After loading data, you often need to clear it:

**Without reset():**
```javascript
const userData = asyncState(null);

// Load user
await execute(userData, async (signal) => {
  return await fetchUser();
});

// User logs out - manually clear everything
abort(userData);              // Cancel if running
userData.data = null;         // Clear data
userData.error = null;        // Clear error
userData.loading = false;     // Clear loading
userData.requestId = 0;       // Reset request ID
```

**What's tedious about this?**

❌ Must remember all properties to clear  
❌ Multiple lines of cleanup code  
❌ Easy to forget something  
❌ Verbose and repetitive  

### The Solution with reset()

```javascript
const userData = asyncState(null);

// Load user
await execute(userData, async (signal) => {
  return await fetchUser();
});

// User logs out - one line
reset(userData);
```

**What's better about this?**

✅ Single function call  
✅ All properties cleared automatically  
✅ Cancels running requests  
✅ Clean, readable code  

This method is **especially useful when** you need to clear state completely (logout, form reset, switching accounts, etc.).

 

## Mental Model

Think of `reset()` as **the undo button** that takes you back to the beginning.

### Manual Reset (Eraser Method)
```
State with data
   ↓
Erase data field
   ↓
Erase error field
   ↓
Erase loading field
   ↓
Erase requestId field
   ↓
Remember initial values
```

### reset() (Time Machine)
```
State with data
   ↓
Press [RESET]
   ↓
Instantly back to:
   • data = initial value
   • error = null
   • loading = false
   • requestId = 0
```

**Key Insight:** It's a complete reset, not a partial clear.

 

## How Does It Work?

When you call `reset()`, here's what happens:

```
Step 1: Cancel
   ↓
[Call abort() to stop any running request]
   ↓
Step 2: Reset Data
   ↓
[data = initialValue]
   ↓
Step 3: Reset Flags
   ↓
[loading = false]
[error = null]
   ↓
Step 4: Reset Tracking
   ↓
[requestId = 0]
```

**Behind the scenes:**
```javascript
// Simplified internal logic
function reset(asyncState) {
  // 1. Cancel any running operation
  abort(asyncState);

  // 2. Reset to initial values
  asyncState.data = initialValue;
  asyncState.loading = false;
  asyncState.error = null;
  asyncState.requestId = 0;
}
```

 

## Basic Usage

### Example 1: User Logout

```javascript
const currentUser = asyncState(null);

// User logs in
await execute(currentUser, async (signal) => {
  const response = await fetch('/api/auth/user', { signal });
  return response.json();
});

console.log(currentUser.data); // { id: 123, name: 'John' }

// User logs out - clear everything
function logout() {
  reset(currentUser);
  console.log(currentUser.data); // null
}
```

 

### Example 2: Form Reset

```javascript
const formData = asyncState(null);

// Submit form
await execute(formData, async (signal) => {
  const response = await fetch('/api/form', {
    method: 'POST',
    body: JSON.stringify(data),
    signal
  });
  return response.json();
});

if (formData.isSuccess) {
  console.log('Submitted!', formData.data);
  
  // Reset for next submission
  reset(formData);
}
```

 

### Example 3: Switching Accounts

```javascript
const accountData = asyncState(null);

async function loadAccount(accountId) {
  // Clear previous account data
  reset(accountData);
  
  // Load new account
  await execute(accountData, async (signal) => {
    const response = await fetch(`/api/accounts/${accountId}`, { signal });
    return response.json();
  });
}

// Switch accounts
loadAccount(1);
// ... later
loadAccount(2); // Previous data cleared first
```

 

### Example 4: Error Recovery

```javascript
const userData = asyncState(null);

// Failed to load
await execute(userData, async (signal) => {
  throw new Error('Network error');
});

console.log(userData.isError); // true
console.log(userData.error);   // Error: Network error

// Clear error and try again
function retry() {
  reset(userData); // Clears the error
  
  execute(userData, async (signal) => {
    return await fetchUser();
  });
}
```

 

## Deep Dive

### What Gets Reset?

Every property goes back to initial state:

```javascript
const data = asyncState('initial');

// After some operations
data.data = 'loaded data';
data.error = new Error('Something failed');
data.loading = true;
data.requestId = 5;

// Reset
reset(data);

// All properties restored
console.log(data.data);      // 'initial' (the initial value)
console.log(data.error);     // null
console.log(data.loading);   // false
console.log(data.requestId); // 0
```

**Complete reset includes:**
- ✅ `data` → initial value
- ✅ `error` → `null`
- ✅ `loading` → `false`
- ✅ `requestId` → `0`
- ✅ Cancels running request
- ✅ Cleans up AbortController

 

### reset() vs abort()

**abort()** stops the request but keeps the data:

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  return { value: 'loaded' };
});

console.log(data.data); // { value: 'loaded' }

abort(data);
console.log(data.data);    // Still { value: 'loaded' }
console.log(data.loading); // false (cancelled)
```

**reset()** clears everything:

```javascript
const data = asyncState(null);

await execute(data, async (signal) => {
  return { value: 'loaded' };
});

console.log(data.data); // { value: 'loaded' }

reset(data);
console.log(data.data);    // null (cleared!)
console.log(data.loading); // false
console.log(data.error);   // null
```

**Use abort() when:** You want to cancel but keep existing data  
**Use reset() when:** You want to clear everything and start fresh

 

### Initial Value Matters

The initial value you pass to `asyncState()` is what `reset()` restores to:

```javascript
// Initial value: null
const data1 = asyncState(null);
data1.data = 'something';
reset(data1);
console.log(data1.data); // null

// Initial value: []
const data2 = asyncState([]);
data2.data = [1, 2, 3];
reset(data2);
console.log(data2.data); // []

// Initial value: { empty: true }
const data3 = asyncState({ empty: true });
data3.data = { items: [...] };
reset(data3);
console.log(data3.data); // { empty: true }
```

**Key Insight:** Always choose an initial value that makes sense for your use case.

 

### Computed Properties Still Work

After reset, computed properties recalculate:

```javascript
const userData = asyncState(null);

// Check success state
effect(() => {
  if (userData.isSuccess) {
    console.log('User loaded!');
  } else if (userData.data === null && !userData.loading) {
    console.log('No user data');
  }
});

// Load user
await execute(userData, async (signal) => {
  return { name: 'John' };
});
// Logs: "User loaded!"

// Reset
reset(userData);
// Logs: "No user data"
// isSuccess is now false automatically
```

 

## Common Patterns

### Pattern 1: Multi-Step Form Reset

```javascript
const step1 = asyncState(null);
const step2 = asyncState(null);
const step3 = asyncState(null);

function resetForm() {
  reset(step1);
  reset(step2);
  reset(step3);
  console.log('Form reset to beginning');
}

// User cancels - reset everything
document.querySelector('#cancel').addEventListener('click', resetForm);
```

 

### Pattern 2: Conditional Reset

```javascript
const searchResults = asyncState(null);

function clearSearch() {
  // Only reset if there's data or an error
  if (searchResults.data || searchResults.error) {
    reset(searchResults);
    console.log('Search cleared');
  }
}
```

 

### Pattern 3: Reset Before New Load

```javascript
const products = asyncState(null);

async function loadProducts(category) {
  // Clear old data first
  reset(products);
  
  // Then load new data
  await execute(products, async (signal) => {
    const response = await fetch(`/api/products?cat=${category}`, { signal });
    return response.json();
  });
}

// No stale data between category switches
loadProducts('electronics');
loadProducts('clothing'); // Old data cleared first
```

 

### Pattern 4: Logout Cleanup

```javascript
const user = asyncState(null);
const posts = asyncState(null);
const notifications = asyncState(null);

function logout() {
  // Clear all user-related data
  reset(user);
  reset(posts);
  reset(notifications);
  
  console.log('User logged out, all data cleared');
}
```

 

### Pattern 5: Error Retry with Clean State

```javascript
const apiData = asyncState(null);

async function loadWithRetry() {
  // First attempt
  await execute(apiData, async (signal) => {
    return await fetchData(signal);
  });
  
  if (apiData.isError) {
    console.log('Failed, resetting and retrying...');
    
    // Clean slate for retry
    reset(apiData);
    
    // Second attempt
    await execute(apiData, async (signal) => {
      return await fetchData(signal);
    });
  }
}
```

 

## Summary

**What is reset()?**  
A function that clears all async state and returns it to initial values.

**Key Features:**
- ✅ Clears data, error, loading, and requestId
- ✅ Cancels any running request
- ✅ Returns to initial value
- ✅ One simple function call

**When to use it:**
- User logs out
- Form submission complete
- Switching between items
- Clearing search results
- Starting over after errors

**Remember:**
```javascript
// Create with initial value
const data = asyncState(initialValue);

// Reset returns to that initial value
reset(data);
console.log(data.data); // initialValue
```

**Related Methods:**
- `abort()` - Cancel request but keep data
- `execute()` - Start new operation
- `refetch()` - Re-run last operation

 
