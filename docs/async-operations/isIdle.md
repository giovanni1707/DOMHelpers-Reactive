# asyncState.isIdle

Computed property indicating idle state—no data, no error, not loading.

 

## Quick Start (30 seconds)

```javascript
const state = asyncState(null);

console.log(state.isIdle); // true (initial state)

execute(state, async () => {
  console.log('During:', state.isIdle); // false (loading)
  return 'data';
});

await new Promise(r => setTimeout(r, 100));
console.log(state.isIdle); // false (has data now)

reset(state);
console.log(state.isIdle); // true (back to idle)
```

**The magic:** `isIdle` is `true` when nothing has happened yet—perfect for initial state UI!

 

## What is asyncState.isIdle?

`isIdle` is a **computed read-only property** that returns `true` when the async state is in its initial idle state: no data, no error, and not loading.

**Key points:**
- Read-only computed property
- True when: `data === null` AND `error === null` AND `loading === false`
- False otherwise
- Updates automatically when dependencies change
- Reactive—can be watched

 

## Why Does This Exist?

### Without isIdle

```javascript
const state = asyncState(null);

// Must check three conditions for idle
if (state.data === null && state.error === null && !state.loading) {
  console.log('Idle state');
}

// Easy to miss one condition
if (!state.data && !state.error) { // Wrong! Doesn't check loading
  console.log('Might not be idle');
}
```

**Problem:** Must check three negative conditions, easy to get wrong.

### With isIdle

```javascript
const state = asyncState(null);

// Single, clear check
if (state.isIdle) {
  console.log('Idle state');
}
```

**Solution:** One property that checks all conditions correctly.

 

## Basic Usage

### Example 1: Initial State

```javascript
const state = asyncState(null);

console.log(state.isIdle);  // true
console.log(state.data);    // null
console.log(state.error);   // null
console.log(state.loading); // false

// After execute, no longer idle
await execute(state, async () => 'data');

console.log(state.isIdle); // false
```

 

### Example 2: UI States

```javascript
const state = asyncState(null);

function render() {
  if (state.isIdle) {
    return '<button>Click to Load Data</button>';
  }
  
  if (state.loading) {
    return '<div>Loading...</div>';
  }
  
  if (state.isError) {
    return '<div>Error: ' + state.error.message + '</div>';
  }
  
  if (state.isSuccess) {
    return '<div>Data: ' + state.data + '</div>';
  }
}

console.log(render());
// '<button>Click to Load Data</button>'
```

 

### Example 3: First Load Detection

```javascript
const state = asyncState(null);

watch(state, {
  isIdle: (idle, wasIdle) => {
    if (wasIdle && !idle) {
      console.log('First load initiated!');
    }
  }
});

execute(state, async () => 'data');
// Logs: First load initiated!
```

 

## Common Patterns

### Pattern 1: Onboarding UI

```javascript
const dataState = asyncState(null);

function renderOnboarding() {
  if (dataState.isIdle) {
    return `
      <div class="onboarding">
        <h2>Welcome!</h2>
        <p>Click below to get started</p>
        <button onclick="loadData()">Get Started</button>
      </div>
    `;
  }
  
  // Already loaded or loading
  return renderMainUI();
}
```

 

### Pattern 2: Empty State vs Idle

```javascript
const state = asyncState(null);

function render() {
  if (state.isIdle) {
    // Never loaded
    return '<div>Click to load data</div>';
  }
  
  if (state.isSuccess && state.data.length === 0) {
    // Loaded but empty
    return '<div>No items found</div>';
  }
  
  if (state.isSuccess) {
    // Has data
    return '<div>Items: ' + state.data.length + '</div>';
  }
}
```

 

### Pattern 3: Lazy Loading

```javascript
const imageState = asyncState(null);

function LazyImage({ src }) {
  // Only load when scrolled into view
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && imageState.isIdle) {
      console.log('Loading image...');
      execute(imageState, async () => {
        const response = await fetch(src);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      });
    }
  });
  
  // Observe image element
  observer.observe(imageElement);
}
```

 

### Pattern 4: Multi-Step Flow

```javascript
const step1State = asyncState(null);
const step2State = asyncState(null);
const step3State = asyncState(null);

function getCurrentStep() {
  if (step1State.isIdle) return 1;
  if (step2State.isIdle) return 2;
  if (step3State.isIdle) return 3;
  return 4; // All complete
}

function renderFlow() {
  const step = getCurrentStep();
  return `
    <div>Step ${step} of 3</div>
    ${step === 1 ? '<button>Start</button>' : ''}
    ${step === 2 ? '<button>Continue</button>' : ''}
    ${step === 3 ? '<button>Finish</button>' : ''}
  `;
}
```

 

## Understanding the Conditions

### All Three Must Be True

```javascript
const state = asyncState(null);

// Condition 1: data === null
console.log(state.data === null);    // true ✓
// Condition 2: error === null
console.log(state.error === null);   // true ✓
// Condition 3: loading === false
console.log(state.loading === false); // true ✓
// Result: isIdle
console.log(state.isIdle);           // true ✓

await execute(state, async () => 'data');

console.log(state.data === null);    // false (has data)
console.log(state.error === null);   // true
console.log(state.loading === false); // true
console.log(state.isIdle);           // false (no longer idle)
```

 

### State Transitions from Idle

```javascript
const state = asyncState(null);

console.log('Initial:', state.isIdle); // true

// Start loading → leaves idle
execute(state, async () => {
  console.log('Loading:', state.isIdle); // false
  return 'data';
});

console.log('After start:', state.isIdle); // false (loading)

await new Promise(r => setTimeout(r, 100));
console.log('After complete:', state.isIdle); // false (has data)

// Only reset returns to idle
reset(state);
console.log('After reset:', state.isIdle); // true
```

 

## Edge Cases

### Gotcha 1: Initial Value Affects isIdle

```javascript
// With null initial value
const state1 = asyncState(null);
console.log(state1.isIdle); // true

// With non-null initial value
const state2 = asyncState({ default: 'data' });
console.log(state2.isIdle); // false (has data)

console.log(state2.data);    // { default: 'data' }
console.log(state2.loading); // false
console.log(state2.error);   // null
// Not idle because data !== null
```

 

### Gotcha 2: Error Prevents Idle

```javascript
const state = asyncState(null);

await execute(state, async () => {
  throw new Error('Failed');
});

console.log(state.data);    // null
console.log(state.error);   // Error: Failed
console.log(state.loading); // false
console.log(state.isIdle);  // false (has error)

// Only reset clears error and returns to idle
reset(state);
console.log(state.isIdle); // true
```

 

### Gotcha 3: Loading Prevents Idle

```javascript
const state = asyncState(null);

execute(state, async () => {
  console.log('Inside execute:');
  console.log('  data:', state.data);       // null
  console.log('  error:', state.error);     // null
  console.log('  loading:', state.loading); // true
  console.log('  isIdle:', state.isIdle);   // false (loading)
  
  return 'data';
});

console.log('Outside:', state.isIdle); // false
```

 

## isIdle vs Other States

### State Comparison

```javascript
const state = asyncState(null);

// Initial: Idle
console.log({
  isIdle: state.isIdle,      // true
  isSuccess: state.isSuccess, // false
  isError: state.isError,     // false
  loading: state.loading      // false
});

// After successful load
await execute(state, async () => 'data');
console.log({
  isIdle: state.isIdle,      // false
  isSuccess: state.isSuccess, // true
  isError: state.isError,     // false
  loading: state.loading      // false
});

// After failed load
await execute(state, async () => {
  throw new Error('Failed');
});
console.log({
  isIdle: state.isIdle,      // false
  isSuccess: state.isSuccess, // false
  isError: state.isError,     // true
  loading: state.loading      // false
});
```

 

### Mutually Exclusive States

```javascript
// Only ONE of these can be true at a time:
// - isIdle
// - loading
// - isSuccess
// - isError

const state = asyncState(null);

console.log(state.isIdle); // true
console.log(state.loading); // false
console.log(state.isSuccess); // false
console.log(state.isError); // false
```

 

## When to Use

**Use `isIdle` for:**
- ✅ Initial/onboarding UI
- ✅ "Click to load" buttons
- ✅ Lazy loading detection
- ✅ Multi-step flow tracking
- ✅ Empty vs never-loaded distinction

**Don't use for:**
- ❌ Checking if loading (use `loading`)
- ❌ Checking success (use `isSuccess`)
- ❌ Checking error (use `isError`)
- ❌ Checking if has data (use `data !== null`)

 

## Summary

**What it is:** Computed property indicating idle state

**Formula:** `data === null AND error === null AND loading === false`

**Returns:** Boolean

**Read-only:** Yes (computed, cannot be set)

**Reactive:** Yes—updates when dependencies change

**Use for:** Initial-state UI and never-loaded detection

### Quick Reference

```javascript
// Create async state
const state = asyncState(null);

// Check idle
console.log(state.isIdle); // true (initial)

// After execute
await execute(state, async () => 'data');
console.log(state.isIdle); // false

// Return to idle
reset(state);
console.log(state.isIdle); // true

// Conditional UI
if (state.isIdle) {
  return '<button>Load Data</button>';
}

// Watch idle changes
watch(state, {
  isIdle: (idle) => {
    if (!idle) {
      console.log('No longer idle');
    }
  }
});
```

**One-Line Rule:** `isIdle` is `true` when nothing has happened yet (no data, no error, not loading)—perfect for initial state UI.