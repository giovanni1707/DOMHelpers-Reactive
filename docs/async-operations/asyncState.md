# asyncState()

Create an enhanced async state with automatic loading, error handling, and race condition prevention.

 

## Quick Start (30 seconds)

```javascript
// Create async state
const userState = asyncState(null);

// Execute async operation
await execute(userState, async (signal) => {
  const response = await fetch('/api/user', { signal });
  return response.json();
});

// Check results
console.log(userState.data);      // { id: 1, name: 'Alice' }
console.log(userState.loading);   // false
console.log(userState.isSuccess); // true
```

**The magic:** `asyncState()` creates a smart container that automatically manages loading, errors, and data—no manual tracking needed!

 

## What is asyncState()?

`asyncState()` is a **factory function** that creates a reactive state object specifically designed for async operations. It includes automatic state management, computed properties, and race condition prevention.

**Key points:**
- Creates reactive state with loading/error/data properties
- Includes computed properties (isSuccess, isError, isIdle)
- Automatic race condition prevention
- Optional callbacks for success/error
- Works with execute(), abort(), reset(), refetch()

 

## Syntax

```javascript
// Basic - no initial value
const state = asyncState();

// With initial value
const state = asyncState({ default: 'data' });

// With callbacks
const state = asyncState(null, {
  onSuccess: (data) => console.log('Success!', data),
  onError: (error) => console.error('Error!', error)
});

// Via ReactiveUtils
const state = asyncState(initialValue, options);
```

**Parameters:**
- `initialValue` (optional) - Initial data value (default: `null`)
- `options` (optional) - Configuration object

**Options:**
- `onSuccess` - Callback when operation succeeds
- `onError` - Callback when operation fails

**Returns:**
- Reactive async state object

 

## Why Does This Exist?

### Without asyncState

```javascript
// Manual async state management
const state = ReactiveUtils.state({
  data: null,
  loading: false,
  error: null
});

async function fetchUser() {
  state.loading = true;
  state.error = null;
  
  try {
    const response = await fetch('/api/user');
    state.data = await response.json();
  } catch (error) {
    state.error = error;
  } finally {
    state.loading = false;
  }
}

// No race condition protection!
// Must manually track everything!
```

**Problems:** Manual tracking, no race protection, boilerplate everywhere.

### With asyncState

```javascript
const userState = asyncState(null);

await execute(userState, async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// Everything automatic!
// Race conditions prevented!
// Clean code!
```

**Solution:** Automatic state management, built-in safety, minimal code.

 

## Parameters

### Parameter 1: initialValue

**Type:** Any

**Default:** `null`

**Purpose:** Initial value for the `data` property

**Examples:**

```javascript
// Null (most common)
const state1 = asyncState(null);
console.log(state1.data); // null
console.log(state1.isIdle); // true

// Object
const state2 = asyncState({ user: 'Guest' });
console.log(state2.data); // { user: 'Guest' }
console.log(state2.isIdle); // false (has data)

// Array
const state3 = asyncState([]);
console.log(state3.data); // []

// Primitive
const state4 = asyncState(0);
console.log(state4.data); // 0
```

 

### Parameter 2: options

**Type:** Object (optional)

**Properties:**
- `onSuccess`: Function called when operation succeeds
- `onError`: Function called when operation fails

**Examples:**

```javascript
const state = asyncState(null, {
  onSuccess: (data) => {
    console.log('✓ Loaded:', data);
    showNotification('Data loaded successfully');
  },
  onError: (error) => {
    console.error('✗ Failed:', error.message);
    showNotification('Failed to load data');
  }
});

await execute(state, async () => {
  const response = await fetch('/api/data');
  return response.json();
});
// Logs: ✓ Loaded: { ... }
```

 

## Return Value

Returns a **reactive async state object** with:

### Properties

```javascript
const state = asyncState(null);

// Data properties
state.data           // Result data (any)
state.loading        // Loading state (boolean)
state.error          // Error object (Error | null)
state.requestId      // Request counter (number)
state.abortController // AbortController (AbortController | null)

// Computed properties
state.isSuccess      // Has data, no error (boolean, read-only)
state.isError        // Has error, not loading (boolean, read-only)
state.isIdle         // No data, no error, not loading (boolean, read-only)
```

### Usage with Namespace Functions

```javascript
// Execute async operation
execute(state, asyncFn)

// Abort current operation
abort(state)

// Reset to initial state
reset(state)

// Re-run last operation
refetch(state)

// Clean up reactivity
cleanup(state)
```

 

## Basic Usage

### Example 1: Simple Fetch

```javascript
const postsState = asyncState(null);

async function loadPosts() {
  await execute(postsState, async () => {
    const response = await fetch('/api/posts');
    return response.json();
  });
}

await loadPosts();

if (postsState.isSuccess) {
  console.log('Posts:', postsState.data);
}
```

 

### Example 2: With Initial Value

```javascript
const configState = asyncState({
  theme: 'light',
  language: 'en'
});

console.log('Default:', configState.data);
// { theme: 'light', language: 'en' }

await execute(configState, async () => {
  const response = await fetch('/api/config');
  return response.json();
});

console.log('Loaded:', configState.data);
// Server config replaces defaults
```

 

### Example 3: With Callbacks

```javascript
const dataState = asyncState(null, {
  onSuccess: (data) => {
    console.log('Data loaded!');
    updateUI(data);
    logEvent('data_loaded');
  },
  onError: (error) => {
    console.error('Load failed:', error.message);
    showErrorDialog(error.message);
    logEvent('data_error', { error: error.message });
  }
});

await execute(dataState, async () => {
  const response = await fetch('/api/data');
  return response.json();
});
// Callbacks fire automatically
```

 

## Common Patterns

### Pattern 1: API Service

```javascript
class UserService {
  constructor() {
    this.userState = asyncState(null, {
      onSuccess: (user) => {
        console.log('User loaded:', user.name);
      },
      onError: (error) => {
        console.error('Failed to load user:', error);
      }
    });
  }
  
  async loadUser(id) {
    await execute(this.userState, async (signal) => {
      const response = await fetch(`/api/users/${id}`, { signal });
      return response.json();
    });
    
    return this.userState.data;
  }
  
  get user() {
    return this.userState.data;
  }
  
  get loading() {
    return this.userState.loading;
  }
}

const service = new UserService();
await service.loadUser(123);
console.log(service.user);
```

 

### Pattern 2: Component State

```javascript
class DataComponent {
  constructor() {
    this.state = asyncState(null, {
      onSuccess: () => this.render(),
      onError: () => this.renderError()
    });
  }
  
  async mount() {
    await execute(this.state, async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  }
  
  render() {
    if (this.state.loading) {
      return '<div>Loading...</div>';
    }
    
    if (this.state.isSuccess) {
      return `<div>Data: ${this.state.data}</div>`;
    }
  }
  
  renderError() {
    return `<div>Error: ${this.state.error.message}</div>`;
  }
  
  destroy() {
    abort(this.state);
    cleanup(this.state);
  }
}
```

 

### Pattern 3: Multiple States

```javascript
const states = {
  users: asyncState(null),
  posts: asyncState(null),
  comments: asyncState(null)
};

async function loadAll() {
  await Promise.all([
    execute(states.users, () => 
      fetch('/api/users').then(r => r.json())
    ),
    execute(states.posts, () => 
      fetch('/api/posts').then(r => r.json())
    ),
    execute(states.comments, () => 
      fetch('/api/comments').then(r => r.json())
    )
  ]);
}

const allLoaded = computed(() => {
  return states.users.isSuccess && 
         states.posts.isSuccess && 
         states.comments.isSuccess;
});
```

 

### Pattern 4: Paginated Data

```javascript
function createPaginatedState() {
  return asyncState({
    items: [],
    page: 1,
    totalPages: 1,
    hasMore: false
  }, {
    onSuccess: (data) => {
      console.log(`Loaded page ${data.page} of ${data.totalPages}`);
    }
  });
}

const paginatedState = createPaginatedState();

async function loadPage(page) {
  await execute(paginatedState, async () => {
    const response = await fetch(`/api/items?page=${page}`);
    const data = await response.json();
    
    return {
      items: data.items,
      page: data.page,
      totalPages: data.totalPages,
      hasMore: data.page < data.totalPages
    };
  });
}

await loadPage(1);
console.log(paginatedState.data.items.length);
```

 

### Pattern 5: Cached State

```javascript
const cache = new Map();

function createCachedState(key) {
  const state = asyncState(null);
  
  // Check cache first
  if (cache.has(key)) {
    state.data = cache.get(key);
  }
  
  return state;
}

async function loadWithCache(key, url) {
  const state = createCachedState(key);
  
  if (!state.data) {
    await execute(state, async () => {
      const response = await fetch(url);
      const data = await response.json();
      cache.set(key, data);
      return data;
    });
  }
  
  return state.data;
}

const data = await loadWithCache('users', '/api/users');
```

 

## Advanced Usage

### Custom State Shape

```javascript
function createCustomAsyncState(initialData) {
  const state = asyncState({
    data: initialData,
    metadata: {
      fetchedAt: null,
      fetchCount: 0
    }
  });
  
  // Wrap execute to track metadata
  const originalExecute = execute;
  const customExecute = async (fn) => {
    await originalExecute(state, async (signal) => {
      const result = await fn(signal);
      return {
        data: result,
        metadata: {
          fetchedAt: Date.now(),
          fetchCount: state.data.metadata.fetchCount + 1
        }
      };
    });
  };
  
  return { state, execute: customExecute };
}
```

 

### State with Validation

```javascript
function createValidatedState(validator) {
  return asyncState(null, {
    onSuccess: (data) => {
      const errors = validator(data);
      if (errors.length > 0) {
        console.warn('Data validation warnings:', errors);
      }
    }
  });
}

const userState = createValidatedState((user) => {
  const errors = [];
  if (!user.email) errors.push('Missing email');
  if (!user.name) errors.push('Missing name');
  return errors;
});
```

 

## Edge Cases

### Gotcha 1: Callbacks Fire Once Per Execute

```javascript
let successCount = 0;

const state = asyncState(null, {
  onSuccess: () => {
    successCount++;
    console.log('Success count:', successCount);
  }
});

await execute(state, async () => 'data 1');
// Logs: Success count: 1

await execute(state, async () => 'data 2');
// Logs: Success count: 2

// Each execute fires callback once
```

 

### Gotcha 2: Initial Value Doesn't Trigger Callbacks

```javascript
const state = asyncState({ initial: 'data' }, {
  onSuccess: (data) => {
    console.log('Success:', data);
  }
});

// No log (initial value doesn't trigger callback)

await execute(state, async () => ({ loaded: 'data' }));
// Logs: Success: { loaded: 'data' }
```

 

### Gotcha 3: Callbacks Not Called on Abort

```javascript
const state = asyncState(null, {
  onSuccess: () => console.log('Success'),
  onError: () => console.log('Error')
});

execute(state, async () => {
  await new Promise(r => setTimeout(r, 5000));
  return 'data';
});

setTimeout(() => abort(state), 1000);

// Neither callback fires (abort is not error or success)
```

 

## When to Use

**Use `asyncState()` for:**
- ✅ API calls and data fetching
- ✅ Form submissions
- ✅ File uploads
- ✅ Any async operation needing state tracking
- ✅ Operations requiring race condition prevention

**Don't use for:**
- ❌ Synchronous state (use regular `state()`)
- ❌ Simple boolean flags (use `state()`)
- ❌ Non-async operations

 

## Summary

**What it is:** Factory function creating enhanced async state

**Parameters:**
- `initialValue` - Initial data (default: `null`)
- `options` - Callbacks and config

**Returns:** Reactive async state object with properties and computed values

**Use with:** `execute()`, `abort()`, `reset()`, `refetch()`

**Features:** Automatic loading/error management, race condition prevention, computed states

### Quick Reference

```javascript
// Create async state
const state = asyncState(initialValue, {
  onSuccess: (data) => { /* ... */ },
  onError: (error) => { /* ... */ }
});

// Properties
state.data           // Result data
state.loading        // Loading state
state.error          // Error object
state.requestId      // Request counter
state.isSuccess      // Success computed
state.isError        // Error computed
state.isIdle         // Idle computed

// Usage
await execute(state, asyncFn);
abort(state);
reset(state);
await refetch(state);
cleanup(state);
```

**One-Line Rule:** Use `asyncState()` to create a smart async container that automatically manages loading, errors, and data—with built-in race condition prevention.