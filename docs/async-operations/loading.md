# asyncState.loading

Boolean property indicating whether an async operation is currently in progress.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.loading); // false

const promise = execute(state, async () => {
  console.log('Inside:', state.loading); // true
  await new Promise(r => setTimeout(r, 1000));
  return 'done';
});

console.log('During:', state.loading); // true

await promise;
console.log('After:', state.loading); // false
```

**The magic:** `loading` automatically becomes `true` during async operations and `false` when complete!

 

## What is asyncState.loading?

`loading` is a **reactive boolean property** that indicates whether an async operation is currently running. It's managed automatically by `execute()`.

**Key points:**
- Read/write property (though typically set by `execute()`)
- Starts as `false`
- Set to `true` when `execute()` starts
- Set to `false` when operation completes (success or error)
- Reactive—watchers and effects track it

 

## Why Does This Exist?

### Without Loading State

```javascript
// Manual loading management
let isLoading = false;

async function fetchData() {
  isLoading = true; // Must remember to set
  try {
    const response = await fetch('/api/data');
    return response.json();
  } finally {
    isLoading = false; // Must remember to clear
  }
}
```

**Problems:** Must manually set/clear, easy to forget, no automatic reactivity.

### With asyncState

```javascript
const state = asyncState(null);

await execute(state, async () => {
  // loading automatically true
  const response = await fetch('/api/data');
  return response.json();
  // loading automatically false
});
```

**Benefits:** Automatic management, no forgotten flags, reactive updates.

 

## Basic Usage

### Example 1: UI Loading Indicator

```javascript
const state = asyncState(null);

// Watch loading for UI updates
watch(state, {
  loading: (isLoading) => {
    if (isLoading) {
      showSpinner();
    } else {
      hideSpinner();
    }
  }
});

await execute(state, async () => {
  await fetch('/api/data').then(r => r.json());
});
```

 

### Example 2: Disable During Load

```javascript
const state = asyncState(null);

function getButtonState() {
  return {
    disabled: state.loading,
    text: state.loading ? 'Loading...' : 'Load Data'
  };
}

console.log(getButtonState()); // { disabled: false, text: 'Load Data' }

execute(state, async () => {
  console.log(getButtonState()); // { disabled: true, text: 'Loading...' }
  await new Promise(r => setTimeout(r, 1000));
  return 'done';
});
```

 

### Example 3: Multiple Operations

```javascript
const state = asyncState(null);

// First operation
execute(state, async () => {
  console.log('Op 1 loading:', state.loading); // true
  await new Promise(r => setTimeout(r, 500));
  return 'first';
});

// Second operation (supersedes first)
await execute(state, async () => {
  console.log('Op 2 loading:', state.loading); // true
  await new Promise(r => setTimeout(r, 500));
  return 'second';
});

console.log('Final loading:', state.loading); // false
```

 

## Common Patterns

### Pattern 1: Conditional Rendering

```javascript
const postsState = asyncState(null);

function render() {
  if (postsState.loading) {
    return '<div class="spinner">Loading posts...</div>';
  }
  
  if (postsState.error) {
    return '<div class="error">Failed to load</div>';
  }
  
  if (postsState.data) {
    return `<div>Posts: ${postsState.data.length}</div>`;
  }
  
  return '<button>Load Posts</button>';
}
```

 

### Pattern 2: Prevent Double Submission

```javascript
const submitState = asyncState(null);

async function handleSubmit(formData) {
  if (submitState.loading) {
    console.log('Already submitting...');
    return;
  }
  
  await execute(submitState, async () => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    return response.json();
  });
}

// Multiple rapid clicks are ignored
handleSubmit({ data: 'a' });
handleSubmit({ data: 'b' }); // Ignored (already loading)
```

 

### Pattern 3: Loading Progress

```javascript
const state = asyncState(null);

let loadingStartTime = 0;

watch(state, {
  loading: (isLoading) => {
    if (isLoading) {
      loadingStartTime = Date.now();
      console.log('Loading started...');
    } else {
      const duration = Date.now() - loadingStartTime;
      console.log(`Loading finished in ${duration}ms`);
    }
  }
});

await execute(state, async () => {
  await new Promise(r => setTimeout(r, 1000));
  return 'data';
});
// Logs: Loading started...
// Logs: Loading finished in 1000ms
```

 

### Pattern 4: Multiple States

```javascript
const usersState = asyncState(null);
const postsState = asyncState(null);

// Computed: any loading
const isAnyLoading = computed(() => {
  return usersState.loading || postsState.loading;
});

// Load both
execute(usersState, async () => {
  return fetch('/api/users').then(r => r.json());
});

execute(postsState, async () => {
  return fetch('/api/posts').then(r => r.json());
});

console.log('Any loading:', isAnyLoading.value); // true
```

 

## Advanced Usage

### Manual Control (Rare)

```javascript
const state = asyncState(null);

// Manually set loading (not recommended)
state.loading = true;
console.log(state.loading); // true

// Do work...
await new Promise(r => setTimeout(r, 1000));

// Manually clear
state.loading = false;
console.log(state.loading); // false
```

**Note:** Rarely needed—`execute()` handles this automatically.

 

### Loading with Abort

```javascript
const state = asyncState(null);

execute(state, async (signal) => {
  console.log('Loading:', state.loading); // true
  
  await new Promise(r => setTimeout(r, 5000));
  return 'data';
});

// Abort after 1 second
setTimeout(() => {
  console.log('Before abort:', state.loading); // true
  abort(state);
  console.log('After abort:', state.loading);  // false
}, 1000);
```

 

## Edge Cases

### Gotcha 1: Loading True Inside Execute

```javascript
const state = asyncState(null);

await execute(state, async () => {
  console.log('Inside execute:', state.loading); // true
  return 'done';
});

console.log('Outside execute:', state.loading); // false
```

**Key insight:** `loading` is `true` while the async function runs, `false` after.

 

### Gotcha 2: Synchronous Execute

```javascript
const state = asyncState(null);

execute(state, () => {
  // Synchronous function (no async/await)
  console.log('Sync loading:', state.loading); // true
  return 'sync result';
});

console.log('After sync:', state.loading); // false
```

**Key insight:** Even synchronous functions get loading state.

 

### Gotcha 3: Error Still Clears Loading

```javascript
const state = asyncState(null);

try {
  await execute(state, async () => {
    throw new Error('Failed!');
  });
} catch (error) {
  console.log('Error loading:', state.loading); // false
  console.log('Has error:', state.error !== null); // true
}
```

**Key insight:** Errors clear `loading` just like success.

 

## When to Use

**Use `loading` for:**
- ✅ Showing loading spinners/indicators
- ✅ Disabling buttons during operations
- ✅ Preventing double submissions
- ✅ Conditional UI rendering
- ✅ Loading progress tracking

**Don't use for:**
- ❌ Checking if data exists (use `data !== null`)
- ❌ Error state (use `error !== null`)
- ❌ Success state (use `isSuccess`)

 

## Summary

**What it is:** Boolean indicating if async operation is running

**Initial value:** `false`

**Set to true:** When `execute()` starts

**Set to false:** When operation completes (success or error) or is aborted

**Type:** Boolean

**Reactive:** Yes—watchers and effects track changes

**Read/write:** Both (typically managed by `execute()`)

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// Check loading
console.log(state.loading); // false

// During execute
execute(state, async () => {
  console.log(state.loading); // true
  return 'data';
});

// Watch loading changes
watch(state, {
  loading: (isLoading) => {
    console.log('Loading:', isLoading);
  }
});

// Prevent double submit
if (!state.loading) {
  execute(state, fetchData);
}
```

**One-Line Rule:** `loading` is `true` during async operations and `false` when complete—perfect for showing spinners and preventing double submissions.