# asyncState.data

The property that holds the result data from successful async operations.

 

## Quick Start (30 seconds)

```javascript
const userState = asyncState(null);

console.log(userState.data); // null (initial)

await execute(userState, async () => {
  const response = await fetch('/api/user');
  return response.json();
});

console.log(userState.data); // { id: 1, name: 'Alice' }

// Access the data
const userName = userState.data.name; // 'Alice'
```

**The magic:** `data` stores your async results—initially null, set automatically when operations succeed!

 

## What is asyncState.data?

`data` is a **reactive property** on async state that contains the result of successful async operations. It's `null` initially and gets updated when `execute()` succeeds.

**Key points:**
- Read/write property (can be set manually)
- Starts as `null` or your initial value
- Automatically updated by `execute()`
- Remains unchanged when operations fail
- Reactive—watchers and effects track it

 

## Why Does This Exist?

### The Problem Without Dedicated Data Property

```javascript
// Manual data management
let userData = null;
let loading = false;
let error = null;

async function fetchUser() {
  loading = true;
  try {
    const response = await fetch('/api/user');
    userData = await response.json(); // Manually set
  } catch (e) {
    error = e;
  } finally {
    loading = false;
  }
}
```

**Problems:** Must manually track separate variables, easy to forget to update, no automatic reactivity.

### The Solution

```javascript
const userState = asyncState(null);

await execute(userState, async () => {
  const response = await fetch('/api/user');
  return response.json(); // Automatically sets data
});

console.log(userState.data); // Data available automatically
```

**Benefits:** Automatic updates, reactive, centralized state, no manual tracking needed.

 

## Basic Usage

### Example 1: Reading Data

```javascript
const state = asyncState(null);

await execute(state, async () => {
  return { message: 'Hello!', count: 42 };
});

// Access data properties
console.log(state.data.message); // 'Hello!'
console.log(state.data.count);   // 42
```

 

### Example 2: Initial Value

```javascript
// Start with default data
const state = asyncState({ name: 'Guest', score: 0 });

console.log(state.data); // { name: 'Guest', score: 0 }

// After fetch, data is replaced
await execute(state, async () => {
  return { name: 'Alice', score: 100 };
});

console.log(state.data); // { name: 'Alice', score: 100 }
```

 

### Example 3: Data Persists After Error

```javascript
const state = asyncState(null);

// First successful fetch
await execute(state, async () => {
  return { value: 'success' };
});

console.log(state.data); // { value: 'success' }

// Second fetch fails
await execute(state, async () => {
  throw new Error('Failed!');
});

console.log(state.data); // { value: 'success' } (still there!)
console.log(state.error); // Error: Failed!
```

**Key insight:** Failed operations don't clear `data`—old data remains accessible.

 

### Example 4: Manual Updates

```javascript
const state = asyncState(null);

// Set data manually
state.data = { manual: 'data' };

console.log(state.data); // { manual: 'data' }

// You can modify it directly
state.data.manual = 'updated';
console.log(state.data); // { manual: 'updated' }
```

 

## Watching Data Changes

```javascript
const state = asyncState(null);

watch(state, {
  data: (newData, oldData) => {
    console.log('Data changed from', oldData, 'to', newData);
  }
});

await execute(state, async () => {
  return { id: 1, name: 'Alice' };
});
// Logs: Data changed from null to { id: 1, name: 'Alice' }
```

 

## Common Patterns

### Pattern 1: Conditional Rendering

```javascript
const postsState = asyncState(null);

function render() {
  if (postsState.loading) {
    return 'Loading posts...';
  }
  
  if (postsState.error) {
    return 'Failed to load posts';
  }
  
  if (!postsState.data) {
    return 'No posts yet';
  }
  
  return `Posts: ${postsState.data.length}`;
}
```

 

### Pattern 2: Data Transformation

```javascript
const apiState = asyncState(null);

await execute(apiState, async () => {
  const response = await fetch('/api/items');
  const data = await response.json();
  
  // Transform before storing
  return {
    items: data.items,
    total: data.items.length,
    timestamp: Date.now()
  };
});

console.log(apiState.data.total); // Computed total
console.log(apiState.data.timestamp); // When fetched
```

 

### Pattern 3: Fallback with Computed

```javascript
const state = asyncState(null);

state.$computed('displayValue', function() {
  return this.data || 'No data available';
});

console.log(state.displayValue); // 'No data available'

await execute(state, async () => 'Hello!');

console.log(state.displayValue); // 'Hello!'
```

 

### Pattern 4: Data Merging

```javascript
const state = asyncState({ items: [] });

async function loadMore() {
  await execute(state, async () => {
    const response = await fetch('/api/items?page=2');
    const newItems = await response.json();
    
    // Merge with existing data
    return {
      items: [...state.data.items, ...newItems]
    };
  });
}
```

 

## Edge Cases

### Gotcha 1: Data is Reactive

```javascript
const state = asyncState({ count: 0 });

watch(state, {
  data: () => console.log('Data changed!')
});

state.data = { count: 1 }; // Logs: Data changed!
state.data.count = 2;      // No log (nested mutation)
```

**Solution:** Reassign the entire object to trigger reactivity:
```javascript
state.data = { ...state.data, count: 2 }; // Triggers watcher
```

 

### Gotcha 2: Null vs Undefined

```javascript
const state1 = asyncState(null);
console.log(state1.data); // null

const state2 = asyncState(undefined);
console.log(state2.data); // undefined

// Both are "falsy" but different
console.log(state1.data === null);      // true
console.log(state2.data === undefined); // true
```

 

### Gotcha 3: Reference vs Value

```javascript
const state = asyncState({ value: 1 });

const ref = state.data;
ref.value = 2;

console.log(state.data.value); // 2 (reference modified!)

// To avoid: use spread or clone
const copy = { ...state.data };
copy.value = 3;
console.log(state.data.value); // Still 2
```

 

## When to Use

**Use `data` for:**
- ✅ Storing API response data
- ✅ Caching fetched results
- ✅ Sharing data across components
- ✅ Conditional rendering based on data availability

**Don't use for:**
- ❌ Intermediate loading states (use `loading`)
- ❌ Error information (use `error`)
- ❌ Request tracking (use `requestId`)

 

## Summary

**What it is:** Reactive property holding async operation results

**Initial value:** `null` or provided initial value

**Updated by:** `execute()` on success, manual assignment

**Type:** Any (null, object, array, string, number, etc.)

**Reactive:** Yes—watchers and effects track changes

**Read/write:** Both (can read and modify)

### Quick Reference

```javascript
// Create with initial value
const state = asyncState({ default: 'value' });

// Read data
console.log(state.data);

// Set data manually
state.data = { new: 'value' };

// After execute
await execute(state, async () => {
  return { fetched: 'data' };
});

console.log(state.data); // { fetched: 'data' }

// Check if has data
if (state.data !== null) {
  console.log('Has data:', state.data);
}
```

**One-Line Rule:** `data` holds your async results—initially null, automatically updated on success, and remains even after errors.