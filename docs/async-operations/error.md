# asyncState.error

Property that holds error information when async operations fail.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.error); // null

await execute(state, async () => {
  throw new Error('Something went wrong!');
});

console.log(state.error);         // Error: Something went wrong!
console.log(state.error.message); // 'Something went wrong!'

// Clear error
reset(state);
console.log(state.error); // null
```

**The magic:** `error` automatically captures exceptions—`null` when OK, Error object when failed!

 

## What is asyncState.error?

`error` is a **reactive property** that stores error objects when async operations fail. It's automatically managed by `execute()`.

**Key points:**
- Read/write property
- Starts as `null` (no error)
- Set to Error object when `execute()` throws
- Cleared to `null` when new `execute()` starts
- Remains after error until cleared
- Reactive—watchers and effects track it

 

## Why Does This Exist?

### Without Error Property

```javascript
// Manual error management
let errorMessage = null;

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return response.json();
  } catch (e) {
    errorMessage = e.message; // Manually track
  }
}
```

**Problems:** Must manually catch/clear, no automatic reactivity, separate from state.

### With asyncState

```javascript
const state = asyncState(null);

await execute(state, async () => {
  const response = await fetch('/api/data');
  return response.json();
});

if (state.error) {
  console.error('Failed:', state.error.message);
}
```

**Benefits:** Automatic error capture, centralized with other state, reactive.

 

## Basic Usage

### Example 1: Error Handling

```javascript
const state = asyncState(null);

await execute(state, async () => {
  const response = await fetch('/api/nonexistent');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
});

if (state.error) {
  console.error('Error occurred:', state.error.message);
  console.error('Stack:', state.error.stack);
}
```

 

### Example 2: Display Error Message

```javascript
const state = asyncState(null);

function render() {
  if (state.loading) {
    return 'Loading...';
  }
  
  if (state.error) {
    return `
      <div class="error">
        <h3>Error</h3>
        <p>${state.error.message}</p>
        <button onclick="retry()">Retry</button>
      </div>
    `;
  }
  
  if (state.data) {
    return `<div>Data: ${state.data}</div>`;
  }
  
  return '<button>Load</button>';
}
```

 

### Example 3: Error Cleared on Retry

```javascript
const state = asyncState(null);

// First attempt fails
await execute(state, async () => {
  throw new Error('Failed!');
});

console.log(state.error); // Error: Failed!

// Retry clears error automatically
await execute(state, async () => {
  return 'success';
});

console.log(state.error); // null (cleared)
console.log(state.data);  // 'success'
```

 

## Common Patterns

### Pattern 1: Error Notification

```javascript
const state = asyncState(null);

watch(state, {
  error: (newError, oldError) => {
    if (newError) {
      showNotification({
        type: 'error',
        message: newError.message,
        duration: 5000
      });
    }
  }
});

await execute(state, async () => {
  throw new Error('Network timeout');
});
// Shows notification automatically
```

 

### Pattern 2: Error Types

```javascript
const state = asyncState(null);

await execute(state, async () => {
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    error.type = 'http';
    throw error;
  }
  
  return response.json();
});

if (state.error) {
  switch (state.error.type) {
    case 'http':
      console.error('HTTP error:', state.error.status);
      break;
    default:
      console.error('Unknown error:', state.error.message);
  }
}
```

 

### Pattern 3: Retry with Error Check

```javascript
const state = asyncState(null);

async function fetchWithRetry(maxRetries = 3) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    await execute(state, async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
    
    if (!state.error) {
      return state.data; // Success
    }
    
    attempts++;
    console.log(`Attempt ${attempts} failed:`, state.error.message);
    
    if (attempts < maxRetries) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts`);
}
```

 

### Pattern 4: Error Logging

```javascript
const state = asyncState(null, {
  onError: (error) => {
    // Custom error logging
    console.error('Operation failed:', error);
    
    // Send to error tracking service
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error);
    }
    
    // Log to analytics
    logEvent('async_error', {
      message: error.message,
      stack: error.stack
    });
  }
});

await execute(state, async () => {
  throw new Error('Something broke');
});
// Error automatically logged
```

 

## Advanced Usage

### Custom Error Objects

```javascript
class APIError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

const state = asyncState(null);

await execute(state, async () => {
  const response = await fetch('/api/users');
  
  if (!response.ok) {
    throw new APIError(
      'Failed to fetch users',
      response.status,
      '/api/users'
    );
  }
  
  return response.json();
});

if (state.error instanceof APIError) {
  console.error(`API Error ${state.error.status} at ${state.error.endpoint}`);
}
```

 

### Validation Errors

```javascript
class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

const state = asyncState(null);

await execute(state, async () => {
  const formData = { email: 'invalid', age: -5 };
  
  const errors = {};
  if (!formData.email.includes('@')) {
    errors.email = 'Invalid email';
  }
  if (formData.age < 0) {
    errors.age = 'Age cannot be negative';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
  
  return formData;
});

if (state.error instanceof ValidationError) {
  console.error('Validation errors:', state.error.fields);
}
```

 

## Edge Cases

### Gotcha 1: Error Persists Until Cleared

```javascript
const state = asyncState(null);

await execute(state, async () => {
  throw new Error('Failed');
});

console.log(state.error); // Error: Failed

// Error still there after time passes
await new Promise(r => setTimeout(r, 5000));
console.log(state.error); // Still Error: Failed

// Cleared by new execute or reset
reset(state);
console.log(state.error); // null
```

 

### Gotcha 2: AbortError Not Captured

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  await new Promise(r => setTimeout(r, 5000));
  return 'data';
});

// Abort after 1 second
setTimeout(() => abort(state), 1000);

setTimeout(() => {
  console.log(state.error); // null (abort not an error)
  console.log(state.data);  // null
}, 2000);
```

**Key insight:** Aborted operations don't set `error` because abort is intentional.

 

### Gotcha 3: Synchronous Errors

```javascript
const state = asyncState(null);

await execute(state, () => {
  // Synchronous function that throws
  throw new Error('Sync error');
});

console.log(state.error); // Error: Sync error
```

**Key insight:** Both sync and async errors are captured.

 

## When to Use

**Use `error` for:**
- ✅ Displaying error messages to users
- ✅ Conditional rendering based on error state
- ✅ Error logging and tracking
- ✅ Retry logic decisions
- ✅ Error-specific UI (error pages, banners)

**Don't use for:**
- ❌ Success/failure boolean (use `isError` or `isSuccess`)
- ❌ Loading state (use `loading`)
- ❌ Data storage (use `data`)

 

## Summary

**What it is:** Property holding error objects from failed operations

**Initial value:** `null`

**Set when:** `execute()` throws an error

**Cleared when:** New `execute()` starts, or `reset()` is called

**Type:** Error | null

**Reactive:** Yes—watchers and effects track changes

**Read/write:** Both (typically set by `execute()`)

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// After failed execute
await execute(state, async () => {
  throw new Error('Failed!');
});

// Check error
if (state.error) {
  console.error(state.error.message);
  console.error(state.error.stack);
}

// Watch errors
watch(state, {
  error: (err) => {
    if (err) {
      console.error('Error:', err.message);
    }
  }
});

// Clear error
reset(state);
console.log(state.error); // null
```

**One-Line Rule:** `error` holds exceptions from failed operations—`null` when OK, Error object when failed, and cleared when retrying.