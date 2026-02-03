# asyncState.requestId

Internal counter that prevents race conditions by tracking request sequence numbers.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.requestId); // 0

await execute(state, async () => 'first');
console.log(state.requestId); // 1

await execute(state, async () => 'second');
console.log(state.requestId); // 2

await execute(state, async () => 'third');
console.log(state.requestId); // 3
```

**The magic:** `requestId` increments with each request—ensures only the latest response updates state!

 

## What is asyncState.requestId?

`requestId` is a **reactive number property** that increments with each `execute()` call. It's used internally to prevent race conditions where slower requests overwrite faster ones.

**Key points:**
- Read/write property (managed automatically)
- Starts at `0`
- Increments with each `execute()` call
- Used to detect stale responses
- Prevents race conditions automatically
- Reactive—can be watched

 

## Why Does This Exist?

### The Race Condition Problem

```javascript
// Without requestId tracking
const state = ReactiveUtils.state({ data: null });

async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  state.data = data; // Problem: might overwrite newer data!
}

// Slow request
fetchUser(1); // Takes 2 seconds

// Fast request
fetchUser(2); // Takes 0.5 seconds

// Result: User 1 overwrites User 2! 💥
```

**Problem:** Responses arrive out of order, slower requests overwrite newer ones.

### The Solution with requestId

```javascript
const state = asyncState(null);

async function fetchUser(id) {
  await execute(state, async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });
}

fetchUser(1); // requestId = 1, slow
fetchUser(2); // requestId = 2, fast

// Only User 2 is stored (requestId 2 > 1) ✓
```

**Solution:** Only responses with the latest requestId update the state.

 

## Basic Usage

### Example 1: Tracking Requests

```javascript
const state = asyncState(null);

console.log('Initial:', state.requestId); // 0

await execute(state, async () => 'request 1');
console.log('After 1st:', state.requestId); // 1

await execute(state, async () => 'request 2');
console.log('After 2nd:', state.requestId); // 2

await execute(state, async () => 'request 3');
console.log('After 3rd:', state.requestId); // 3
```

 

### Example 2: Race Condition Prevention

```javascript
const searchState = asyncState(null);

async function search(query) {
  await execute(searchState, async () => {
    console.log(`Searching: ${query}, requestId: ${searchState.requestId}`);
    
    // Simulate random delay
    await new Promise(r => setTimeout(r, Math.random() * 2000));
    
    return { query, results: [`Result for ${query}`] };
  });
}

// User types quickly
search('a');   // requestId: 1, slow (2s)
search('ab');  // requestId: 2, fast (0.5s)
search('abc'); // requestId: 3, medium (1s)

// Only 'abc' results are shown, regardless of response order!
```

 

### Example 3: Watching Request Changes

```javascript
const state = asyncState(null);

watch(state, {
  requestId: (newId, oldId) => {
    console.log(`Request ${oldId} → ${newId}`);
  }
});

await execute(state, async () => 'data 1');
// Logs: Request 0 → 1

await execute(state, async () => 'data 2');
// Logs: Request 1 → 2
```

 

## Common Patterns

### Pattern 1: Debounced Search

```javascript
const searchState = asyncState(null);

let searchTimeout;

function debouncedSearch(query) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    console.log(`Search requestId: ${searchState.requestId + 1}`);
    
    execute(searchState, async () => {
      const response = await fetch(`/api/search?q=${query}`);
      return response.json();
    });
  }, 300);
}

// User types: "hello"
debouncedSearch('h');
debouncedSearch('he');
debouncedSearch('hel');
debouncedSearch('hell');
debouncedSearch('hello'); // Only this executes
```

 

### Pattern 2: Request Logging

```javascript
const state = asyncState(null);

watch(state, {
  requestId: (newId) => {
    console.log(`[${new Date().toISOString()}] Request #${newId} started`);
  }
});

watch(state, {
  loading: (isLoading, wasLoading) => {
    if (wasLoading && !isLoading) {
      console.log(`[${new Date().toISOString()}] Request #${state.requestId} completed`);
    }
  }
});

await execute(state, async () => {
  await new Promise(r => setTimeout(r, 1000));
  return 'data';
});
// Logs: Request #1 started
// Logs: Request #1 completed
```

 

### Pattern 3: Concurrent Request Detection

```javascript
const state = asyncState(null);

let lastCompletedId = 0;

async function fetchData() {
  const startId = state.requestId + 1;
  
  await execute(state, async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
  
  if (state.requestId === startId) {
    lastCompletedId = startId;
    console.log('This was the latest request');
  } else {
    console.log('A newer request superseded this one');
  }
}
```

 

### Pattern 4: Request History

```javascript
const state = asyncState(null);
const requestHistory = [];

watch(state, {
  requestId: (newId) => {
    requestHistory.push({
      id: newId,
      timestamp: Date.now()
    });
  }
});

await execute(state, async () => 'req 1');
await execute(state, async () => 'req 2');
await execute(state, async () => 'req 3');

console.log('History:', requestHistory);
// [
//   { id: 1, timestamp: 1609459200000 },
//   { id: 2, timestamp: 1609459201000 },
//   { id: 3, timestamp: 1609459202000 }
// ]
```

 

## How Race Prevention Works

### Internal Mechanism

```javascript
// Simplified implementation
async function execute(state, fn) {
  const requestId = ++state.requestId; // Increment first
  
  state.loading = true;
  state.error = null;
  
  try {
    const result = await fn(abortSignal);
    
    // Only update if still the latest request
    if (requestId === state.requestId) {
      state.data = result;
    } else {
      console.log('Stale request ignored:', requestId);
    }
  } catch (error) {
    if (requestId === state.requestId) {
      state.error = error;
    }
  } finally {
    if (requestId === state.requestId) {
      state.loading = false;
    }
  }
}
```

 

### Visual Example

```
Request A starts → requestId = 1
      ↓
Request B starts → requestId = 2 (supersedes A)
      ↓
Request B completes → requestId matches (2 === 2) → Update state ✓
      ↓
Request A completes → requestId doesn't match (1 !== 2) → Ignore ✗
```

 

## Advanced Usage

### Manual Reset

```javascript
const state = asyncState(null);

await execute(state, async () => 'data 1');
console.log(state.requestId); // 1

await execute(state, async () => 'data 2');
console.log(state.requestId); // 2

// Manual reset (rarely needed)
state.requestId = 0;
console.log(state.requestId); // 0

// Next execute continues from reset value
await execute(state, async () => 'data 3');
console.log(state.requestId); // 1
```

 

### Custom Validation

```javascript
const state = asyncState(null);

async function validatedExecute(fn) {
  const expectedId = state.requestId + 1;
  
  await execute(state, fn);
  
  if (state.requestId === expectedId) {
    console.log('Request completed successfully');
    return state.data;
  } else {
    console.log('Request was superseded');
    return null;
  }
}
```

 

## Edge Cases

### Gotcha 1: requestId Increments Immediately

```javascript
const state = asyncState(null);

console.log(state.requestId); // 0

execute(state, async () => {
  console.log('Inside:', state.requestId); // 1 (already incremented)
  return 'data';
});

console.log('Outside:', state.requestId); // 1 (incremented before running)
```

 

### Gotcha 2: Reset Also Resets requestId

```javascript
const state = asyncState(null);

await execute(state, async () => 'data 1');
console.log(state.requestId); // 1

await execute(state, async () => 'data 2');
console.log(state.requestId); // 2

reset(state);
console.log(state.requestId); // 0 (reset)
```

 

### Gotcha 3: Manual Changes Can Break Race Protection

```javascript
const state = asyncState(null);

// Start request 1
execute(state, async () => {
  await new Promise(r => setTimeout(r, 1000));
  return 'slow';
});

// Start request 2
execute(state, async () => {
  return 'fast';
});

// DON'T DO THIS - breaks race protection
state.requestId = 0;

// Now race protection is broken!
```

**Key insight:** Don't manually modify `requestId` while requests are pending.

 

## When to Use

**Use `requestId` for:**
- ✅ Debugging race conditions
- ✅ Request history tracking
- ✅ Custom race condition logic
- ✅ Request logging and monitoring

**Don't manually modify for:**
- ❌ Normal async operations (automatic)
- ❌ While requests are pending
- ❌ Race protection (handled automatically)

 

## Summary

**What it is:** Counter tracking request sequence numbers

**Initial value:** `0`

**Incremented when:** `execute()` is called

**Reset when:** `reset()` is called

**Purpose:** Prevent race conditions—only latest request updates state

**Type:** Number

**Reactive:** Yes—can be watched

**Read/write:** Both (typically automatic)

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// Check requestId
console.log(state.requestId); // 0

// After execute
await execute(state, async () => 'data');
console.log(state.requestId); // 1

// Multiple requests
execute(state, async () => 'req 1'); // requestId: 1
execute(state, async () => 'req 2'); // requestId: 2
// Only req 2 updates state (race protection)

// Watch requests
watch(state, {
  requestId: (id) => console.log('Request:', id)
});
```

**One-Line Rule:** `requestId` increments with each request and ensures only the latest response updates state—automatic race condition prevention.