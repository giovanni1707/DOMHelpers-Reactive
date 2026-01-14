# asyncState.isError

Computed property indicating error state—has error and not currently loading.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.isError); // false

await execute(state, async () => {
  throw new Error('Something went wrong!');
});

console.log(state.isError); // true
console.log(state.error.message); // 'Something went wrong!'

// Use for error handling
if (state.isError) {
  showErrorMessage(state.error.message);
}
```

**The magic:** `isError` is `true` when operation failed—perfect for error UI!

 

## What is asyncState.isError?

`isError` is a **computed read-only property** that returns `true` when the async state has an error and is not currently loading. It checks two conditions: error exists and not loading.

**Key points:**
- Read-only computed property
- True when: `error !== null` AND `loading === false`
- False otherwise
- Updates automatically when dependencies change
- Reactive—can be watched

 

## Why Does This Exist?

### Without isError

```javascript
const state = asyncState(null);

// Must check multiple conditions
if (state.error !== null && !state.loading) {
  console.log('Error occurred');
}

// Easy to show error while still loading
if (state.error) { // Wrong! Might still be loading
  console.log('Premature error display');
}
```

**Problem:** Must check both error and loading, easy to get wrong.

### With isError

```javascript
const state = asyncState(null);

// Single, clear check
if (state.isError) {
  console.log('Error occurred');
}
```

**Solution:** One property that checks both conditions correctly.

 

## Basic Usage

### Example 1: Simple Error Check

```javascript
const state = asyncState(null);

console.log(state.isError); // false

await execute(state, async () => {
  throw new Error('Failed to load');
});

console.log(state.isError); // true
console.log(state.error);   // Error: Failed to load
```

 

### Example 2: Error Display

```javascript
const state = asyncState(null);

function render() {
  if (state.loading) {
    return '<div>Loading...</div>';
  }
  
  if (state.isError) {
    return `
      <div class="error">
        <h3>Error</h3>
        <p>${state.error.message}</p>
        <button onclick="retry()">Retry</button>
      </div>
    `;
  }
  
  if (state.isSuccess) {
    return `<div>Data loaded</div>`;
  }
  
  return '<button>Load</button>';
}
```

 

### Example 3: Error Actions

```javascript
const state = asyncState(null);

watch(state, {
  isError: (hasError) => {
    if (hasError) {
      console.error('Error occurred:', state.error.message);
      showNotification({
        type: 'error',
        message: state.error.message
      });
      logErrorToService(state.error);
    }
  }
});

await execute(state, async () => {
  throw new Error('Network timeout');
});
// Shows notification automatically
```

 

## Common Patterns

### Pattern 1: Error Recovery

```javascript
const state = asyncState(null);

async function loadWithRecovery() {
  await execute(state, async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
  
  if (state.isError) {
    console.log('Primary source failed, trying backup...');
    
    await execute(state, async () => {
      const response = await fetch('/api/backup/data');
      return response.json();
    });
  }
  
  return state.isSuccess;
}
```

 

### Pattern 2: Error Type Handling

```javascript
const state = asyncState(null);

await execute(state, async () => {
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  
  return response.json();
});

if (state.isError) {
  const error = state.error;
  
  if (error.status === 404) {
    console.log('Resource not found');
  } else if (error.status >= 500) {
    console.log('Server error, please try again');
  } else {
    console.log('Request error:', error.message);
  }
}
```

 

### Pattern 3: Multiple State Errors

```javascript
const usersState = asyncState(null);
const postsState = asyncState(null);

const hasAnyError = computed(() => {
  return usersState.isError || postsState.isError;
});

const allErrors = computed(() => {
  const errors = [];
  if (usersState.isError) errors.push(usersState.error);
  if (postsState.isError) errors.push(postsState.error);
  return errors;
});

// Load both
execute(usersState, async () => {
  return fetch('/api/users').then(r => r.json());
});

execute(postsState, async () => {
  return fetch('/api/posts').then(r => r.json());
});

watch(hasAnyError, (hasError) => {
  if (hasError) {
    console.error('Errors occurred:', allErrors.value);
  }
});
```

 

### Pattern 4: Error Boundary

```javascript
const state = asyncState(null);

async function safeExecute(fn) {
  await execute(state, fn);
  
  if (state.isError) {
    console.error('Operation failed:', state.error.message);
    
    // Prevent error propagation
    return {
      success: false,
      error: state.error.message
    };
  }
  
  return {
    success: true,
    data: state.data
  };
}

const result = await safeExecute(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

console.log(result); // { success: false, error: '...' }
```

 

## Understanding the Conditions

### Both Conditions Must Be True

```javascript
const state = asyncState(null);

// Condition 1: error !== null
console.log(state.error !== null);   // false
// Condition 2: loading === false
console.log(state.loading === false); // true
// Result: isError
console.log(state.isError);          // false (no error)

await execute(state, async () => {
  throw new Error('Failed');
});

console.log(state.error !== null);   // true ✓
console.log(state.loading === false); // true ✓
console.log(state.isError);          // true ✓
```

 

### Why Loading Check Matters

```javascript
const state = asyncState(null);

// Start request that will fail
execute(state, async () => {
  await new Promise(r => setTimeout(r, 1000));
  throw new Error('Failed');
});

// Immediately check (while loading)
console.log(state.error);   // null
console.log(state.loading); // true
console.log(state.isError); // false (still loading)

// After completion
await new Promise(r => setTimeout(r, 1500));
console.log(state.error);   // Error: Failed
console.log(state.loading); // false
console.log(state.isError); // true (now errored)
```

**Key insight:** `isError` waits for loading to finish before becoming `true`.

 

## Edge Cases

### Gotcha 1: Error Cleared on Retry

```javascript
const state = asyncState(null);

await execute(state, async () => {
  throw new Error('First error');
});

console.log(state.isError); // true

// Retry clears error immediately
execute(state, async () => {
  console.log('Inside:', state.isError); // false (loading)
  return 'success';
});

console.log('Outside:', state.isError); // false (loading)
```

 

### Gotcha 2: Error Persists with Old Data

```javascript
const state = asyncState(null);

// First successful load
await execute(state, async () => 'old data');
console.log(state.isSuccess); // true

// Second load fails
await execute(state, async () => {
  throw new Error('Failed');
});

console.log(state.data);    // 'old data' (still there)
console.log(state.isError); // true
console.log(state.isSuccess); // false (error takes precedence)
```

 

### Gotcha 3: Aborted Operations Don't Set Error

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  await fetch('/api/data', { signal });
  return 'data';
});

setTimeout(() => abort(state), 100);

await new Promise(r => setTimeout(r, 200));

console.log(state.error);   // null (abort not an error)
console.log(state.isError); // false
```

**Key insight:** Aborted operations don't count as errors.

 

## isError vs Manual Checks

### ❌ Manual (Verbose)

```javascript
// Must check both conditions
if (state.error && state.error !== null && !state.loading) {
  console.log('Error occurred');
}

// Easy to forget loading check
if (state.error) { // Wrong! Might still be loading
  console.log('Premature error display');
}
```

### ✅ With isError (Clean)

```javascript
if (state.isError) {
  console.log('Error occurred');
}
```

 

## When to Use

**Use `isError` for:**
- ✅ Error UI display
- ✅ Error notifications
- ✅ Retry logic
- ✅ Error logging
- ✅ Fallback handling

**Don't use for:**
- ❌ Checking if has error while loading (use `error !== null`)
- ❌ Checking success state (use `isSuccess`)
- ❌ Checking idle state (use `isIdle`)

 

## Summary

**What it is:** Computed property indicating error state

**Formula:** `error !== null AND loading === false`

**Returns:** Boolean

**Read-only:** Yes (computed, cannot be set)

**Reactive:** Yes—updates when dependencies change

**Use for:** Error-state conditional logic

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// Check error
console.log(state.isError); // false

// After failed execute
await execute(state, async () => {
  throw new Error('Failed!');
});

console.log(state.isError); // true

// Conditional logic
if (state.isError) {
  console.error('Error:', state.error.message);
}

// Watch error changes
watch(state, {
  isError: (hasError) => {
    if (hasError) {
      showErrorNotification(state.error);
    }
  }
});
```

**One-Line Rule:** `isError` is `true` when operation failed (has error and not loading)—perfect for error-state UI.