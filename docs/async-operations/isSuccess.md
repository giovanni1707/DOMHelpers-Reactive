# asyncState.isSuccess

Computed property indicating successful data load—has data, not loading, no error.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.isSuccess); // false (no data yet)

await execute(state, async () => {
  const response = await fetch('/api/data');
  return response.json();
});

console.log(state.isSuccess); // true (loaded successfully)

// Use for conditional rendering
if (state.isSuccess) {
  console.log('Data:', state.data);
}
```

**The magic:** `isSuccess` is `true` only when data is loaded successfully—perfect for conditional rendering!

 

## What is asyncState.isSuccess?

`isSuccess` is a **computed read-only property** that returns `true` when the async state has successfully loaded data. It checks three conditions: data exists, not loading, and no error.

**Key points:**
- Read-only computed property
- True when: `data !== null` AND `loading === false` AND `error === null`
- False otherwise
- Updates automatically when dependencies change
- Reactive—can be watched

 

## Why Does This Exist?

### Without isSuccess

```javascript
const state = asyncState(null);

// Must check multiple conditions
if (state.data !== null && !state.loading && state.error === null) {
  console.log('Success!');
}

// Easy to forget a condition
if (state.data) { // Wrong! Doesn't check error
  console.log('Might not be successful!');
}
```

**Problem:** Must remember to check three conditions, easy to get wrong.

### With isSuccess

```javascript
const state = asyncState(null);

// Single, clear check
if (state.isSuccess) {
  console.log('Success!');
}
```

**Solution:** One property that checks all conditions correctly.

 

## Basic Usage

### Example 1: Simple Check

```javascript
const state = asyncState(null);

console.log(state.isSuccess); // false

await execute(state, async () => {
  return { message: 'Hello!' };
});

console.log(state.isSuccess); // true
console.log(state.data);      // { message: 'Hello!' }
```

 

### Example 2: Conditional Rendering

```javascript
const postsState = asyncState(null);

function render() {
  if (postsState.loading) {
    return '<div>Loading...</div>';
  }
  
  if (postsState.isError) {
    return '<div>Error loading posts</div>';
  }
  
  if (postsState.isSuccess) {
    return `<div>Posts: ${postsState.data.length}</div>`;
  }
  
  return '<button>Load Posts</button>';
}
```

 

### Example 3: Success Actions

```javascript
const state = asyncState(null);

watch(state, {
  isSuccess: (success) => {
    if (success) {
      console.log('Data loaded successfully!');
      showNotification('Data loaded');
      updateUI();
    }
  }
});

await execute(state, async () => {
  const response = await fetch('/api/data');
  return response.json();
});
// Logs: Data loaded successfully!
```

 

## Common Patterns

### Pattern 1: Success-Only Actions

```javascript
const userState = asyncState(null);

await execute(userState, async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// Only proceed if successful
if (userState.isSuccess) {
  const user = userState.data;
  updateProfile(user);
  logEvent('user_loaded', { userId: user.id });
}
```

 

### Pattern 2: Multi-State Success

```javascript
const usersState = asyncState(null);
const postsState = asyncState(null);

// Check if all loaded successfully
const allLoaded = computed(() => {
  return usersState.isSuccess && postsState.isSuccess;
});

// Load both
execute(usersState, async () => {
  return fetch('/api/users').then(r => r.json());
});

execute(postsState, async () => {
  return fetch('/api/posts').then(r => r.json());
});

// Wait for both
watch(allLoaded, (loaded) => {
  if (loaded) {
    console.log('All data loaded!');
    renderDashboard();
  }
});
```

 

### Pattern 3: Success with Validation

```javascript
const state = asyncState(null);

await execute(state, async () => {
  const response = await fetch('/api/data');
  return response.json();
});

if (state.isSuccess) {
  const data = state.data;
  
  // Additional validation
  if (data && Array.isArray(data.items)) {
    console.log('Valid data:', data.items.length, 'items');
  } else {
    console.warn('Success but invalid data structure');
  }
}
```

 

### Pattern 4: Retry Until Success

```javascript
const state = asyncState(null);

async function loadUntilSuccess(maxAttempts = 3) {
  let attempts = 0;
  
  while (attempts < maxAttempts && !state.isSuccess) {
    attempts++;
    console.log(`Attempt ${attempts}...`);
    
    await execute(state, async () => {
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    });
    
    if (!state.isSuccess) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  return state.isSuccess;
}

const success = await loadUntilSuccess();
console.log('Final result:', success ? 'Success!' : 'Failed');
```

 

## Understanding the Conditions

### All Three Must Be True

```javascript
const state = asyncState(null);

// Condition 1: data !== null
console.log(state.data !== null);    // false
// Condition 2: loading === false  
console.log(state.loading === false); // true
// Condition 3: error === null
console.log(state.error === null);   // true
// Result: isSuccess
console.log(state.isSuccess);        // false (data is null)

await execute(state, async () => 'data');

console.log(state.data !== null);    // true ✓
console.log(state.loading === false); // true ✓
console.log(state.error === null);   // true ✓
console.log(state.isSuccess);        // true ✓
```

 

### Why Each Condition Matters

```javascript
const state = asyncState(null);

// Scenario 1: Has data but still loading (superseded request)
state.data = 'old data';
state.loading = true;
console.log(state.isSuccess); // false (still loading)

// Scenario 2: Has data but has error (failed retry)
state.data = 'old data';
state.loading = false;
state.error = new Error('Failed');
console.log(state.isSuccess); // false (has error)

// Scenario 3: No data, not loading, no error (idle)
state.data = null;
state.loading = false;
state.error = null;
console.log(state.isSuccess); // false (no data)
```

 

## Edge Cases

### Gotcha 1: Initial Data Doesn't Count

```javascript
const state = asyncState({ initial: 'value' });

console.log(state.data);      // { initial: 'value' }
console.log(state.isSuccess); // false (not from execute)

await execute(state, async () => ({ loaded: 'value' }));

console.log(state.isSuccess); // true (now from execute)
```

**Key insight:** `isSuccess` requires successful `execute()`, not just having data.

 

### Gotcha 2: Success Persists After Error

```javascript
const state = asyncState(null);

// First successful load
await execute(state, async () => 'success');
console.log(state.isSuccess); // true

// Second load fails
await execute(state, async () => {
  throw new Error('Failed');
});

console.log(state.data);      // 'success' (persists)
console.log(state.error);     // Error: Failed
console.log(state.isSuccess); // false (error takes precedence)
```

 

### Gotcha 3: Success Changes Immediately

```javascript
const state = asyncState(null);

await execute(state, async () => 'data');
console.log(state.isSuccess); // true

// New execute immediately clears success
execute(state, async () => {
  console.log('Inside:', state.isSuccess); // false (loading)
  return 'new data';
});

console.log('Outside:', state.isSuccess); // false (loading)
```

 

## isSuccess vs Manual Checks

### ❌ Manual (Verbose & Error-Prone)

```javascript
// Must remember all conditions
if (state.data && state.data !== null && !state.loading && !state.error) {
  console.log('Success');
}

// Easy to forget one
if (state.data && !state.loading) { // Missing error check!
  console.log('Might not be success');
}
```

### ✅ With isSuccess (Clean & Correct)

```javascript
if (state.isSuccess) {
  console.log('Success');
}
```

 

## When to Use

**Use `isSuccess` for:**
- ✅ Conditional rendering after load
- ✅ Enabling actions that need data
- ✅ Success notifications
- ✅ Form submission results
- ✅ Multi-state coordination

**Don't use for:**
- ❌ Checking if has any data (use `data !== null`)
- ❌ Checking if idle (use `isIdle`)
- ❌ Checking if errored (use `isError`)

 

## Summary

**What it is:** Computed property indicating successful data load

**Formula:** `data !== null AND loading === false AND error === null`

**Returns:** Boolean

**Read-only:** Yes (computed, cannot be set)

**Reactive:** Yes—updates when dependencies change

**Use for:** Success-state conditional logic

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// Check success
console.log(state.isSuccess); // false

// After successful execute
await execute(state, async () => 'data');
console.log(state.isSuccess); // true

// Conditional logic
if (state.isSuccess) {
  console.log('Data:', state.data);
}

// Watch success changes
watch(state, {
  isSuccess: (success) => {
    if (success) {
      console.log('Load succeeded!');
    }
  }
});
```

**One-Line Rule:** `isSuccess` is `true` when data is loaded successfully (has data, not loading, no error)—perfect for success-state UI.