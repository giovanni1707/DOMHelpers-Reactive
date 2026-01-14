# `DevTools` - Development Tools for Reactive System

## Quick Start (30 seconds)

```javascript
// Enable DevTools
DevTools.enable();
// Logs: "[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__"

// Track state
const todos = state({ items: [] });
DevTools.trackState(todos, 'TodoState');

// Track effect
const cleanup = effect(() => {
  console.log('Items:', todos.items);
});
DevTools.trackEffect(cleanup, 'TodoLogger');

// Access in console
console.log(window.__REACTIVE_DEVTOOLS__);

// View tracked states
DevTools.getStates();
// Returns array with: [{id: 1, name: 'TodoState', created: ..., updates: []}]

// View history
DevTools.getHistory();
// Returns array with: [{stateId: 1, stateName: 'TodoState', key: 'items', ...}]

// Disable when done
DevTools.disable();
// DevTools removed from window ✨
```

**What just happened?** You enabled powerful debugging tools for reactive state!

---

## What is `DevTools`?

`DevTools` is a **debugging and monitoring system** for reactive state that helps you understand what's happening in your application.

Simply put: it's like browser DevTools but for your reactive system.

Think of it as **x-ray vision for your state** - see what changes, when, and why.

---

## Main Object

```javascript
DevTools
```

**Available as:**
- `DevTools` - Global object
- `ReactiveUtils.DevTools` - Namespace access
- `ReactiveEnhancements.DevTools` - Enhancement module

**Properties:**
- `enabled` (Boolean) - Whether DevTools is active
- `states` (Map) - Tracked states registry
- `effects` (Map) - Tracked effects registry
- `history` (Array) - Change history (max 50)
- `maxHistory` (Number) - History limit

---

## Why Does This Exist?

### The Problem: Invisible State Changes

Without DevTools, debugging reactive systems is hard:

```javascript
const state = ReactiveUtils.state({ count: 0 });

effect(() => {
  console.log('Count:', state.count);
});

state.count = 1;
// Why did this run?
// What else depends on count?
// When was it last changed?
// No way to know! ❌
```

**Problems:**
❌ **No visibility** - Can't see what's happening  
❌ **Hard to debug** - No change history  
❌ **No tracking** - Don't know what depends on what  

### The Solution with DevTools

```javascript
DevTools.enable();
DevTools.trackState(state, 'Counter');

state.count = 1;
// DevTools logs the change
// History is recorded
// Can inspect anytime ✅

DevTools.getHistory();
// See exactly what changed and when
```

**Benefits:**
✅ **Visibility** - See all changes  
✅ **History** - Track what happened  
✅ **Debugging** - Find issues fast  
✅ **Monitoring** - Watch state live  

---

## Mental Model

Think of DevTools as **a security camera system**:

```
Your App                DevTools
┌─────────────┐        ┌─────────────┐
│ State       │        │ Monitor     │
│ Changes ────┼───────→│ Record      │
│ Effects     │        │ Track       │
│ Updates     │        │ Report      │
└─────────────┘        └─────────────┘
  (runs)               (observes)
```

**Key Insight:** DevTools watches without interfering.

---

## Core Methods

### 1. `DevTools.enable()`

**Purpose:** Activates DevTools and exposes it globally

```javascript
DevTools.enable()
```

**Parameters:** None

**Returns:** `undefined`

**What it does:**
- Sets `enabled` to `true`
- Exposes as `window.__REACTIVE_DEVTOOLS__`
- Starts tracking changes
- Logs confirmation message

**Example:**
```javascript
DevTools.enable();
// Console: "[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__"

console.log(DevTools.enabled);  // true
console.log(window.__REACTIVE_DEVTOOLS__);  // DevTools object
```

---

### 2. `DevTools.disable()`

**Purpose:** Deactivates DevTools and removes global reference

```javascript
DevTools.disable()
```

**Parameters:** None

**Returns:** `undefined`

**What it does:**
- Sets `enabled` to `false`
- Removes `window.__REACTIVE_DEVTOOLS__`
- Stops tracking changes
- Clears references

**Example:**
```javascript
DevTools.disable();

console.log(DevTools.enabled);  // false
console.log(window.__REACTIVE_DEVTOOLS__);  // undefined
```

---

### 3. `DevTools.trackState(state, name)`

**Purpose:** Register a state for tracking and monitoring

```javascript
DevTools.trackState(state, name)
```

**Parameters:**
- `state` (Object) - Reactive state object to track
- `name` (String) - Friendly name for the state

**Returns:** `undefined`

**What it does:**
- Assigns unique ID to state
- Records creation time
- Tracks all changes to state
- Makes state inspectable

**Example:**
```javascript
const todos = state({ items: [] });
DevTools.trackState(todos, 'TodoState');

// Now changes are logged
todos.items.push({ text: 'Buy milk' });
// DevTools records this change

// View in console
const states = DevTools.getStates();
console.log(states[0]);
// {id: 1, name: 'TodoState', created: 1234567890, updates: [...]}
```

---

### 4. `DevTools.trackEffect(effect, name)`

**Purpose:** Register an effect for tracking

```javascript
DevTools.trackEffect(effect, name)
```

**Parameters:**
- `effect` (Function) - Effect function to track
- `name` (String) - Friendly name for the effect

**Returns:** `undefined`

**What it does:**
- Assigns unique ID to effect
- Records creation time
- Counts how many times it runs
- Makes effect inspectable

**Example:**
```javascript
const cleanup = effect(() => {
  console.log('Items:', todos.items);
});

DevTools.trackEffect(cleanup, 'TodoLogger');

// Now runs are tracked
todos.items.push({ text: 'Walk dog' });
// DevTools records that effect ran

// View tracked effects
const effects = DevTools.effects;
console.log(effects.get(cleanup));
// {id: 1, name: 'TodoLogger', created: 1234567890, runs: 2}
```

---

## Inspection Methods

### 5. `DevTools.getStates()`

**Purpose:** Get all tracked states

```javascript
DevTools.getStates()
```

**Returns:** Array of state info objects

**Example:**
```javascript
const states = DevTools.getStates();
console.log(states);
// [
//   {id: 1, name: 'TodoState', created: ..., state: {...}, updates: [...]},
//   {id: 2, name: 'UserState', created: ..., state: {...}, updates: [...]}
// ]
```

---

### 6. `DevTools.getHistory()`

**Purpose:** Get change history

```javascript
DevTools.getHistory()
```

**Returns:** Array of change records (last 50)

**Example:**
```javascript
const history = DevTools.getHistory();
console.log(history);
// [
//   {stateId: 1, stateName: 'TodoState', key: 'items', 
//    oldValue: [], newValue: [{...}], timestamp: ...},
//   ...
// ]
```

---

### 7. `DevTools.clearHistory()`

**Purpose:** Clear change history

```javascript
DevTools.clearHistory()
```

**Returns:** `undefined`

**Example:**
```javascript
DevTools.clearHistory();

console.log(DevTools.getHistory().length);  // 0
```

---

## Real-World Examples

### Example 1: Debug State Changes

```javascript
// Enable DevTools
DevTools.enable();

// Create and track state
const app = state({
  user: null,
  loading: false,
  error: null
});

DevTools.trackState(app, 'AppState');

// Make changes
app.loading = true;
app.user = { id: 1, name: 'Alice' };
app.loading = false;

// Inspect what happened
const history = DevTools.getHistory();
console.log('Changes:', history);
// See all three changes with timestamps
```

---

### Example 2: Track Effect Runs

```javascript
DevTools.enable();

const counter = state({ count: 0 });
DevTools.trackState(counter, 'Counter');

// Track effect
const cleanup = effect(() => {
  console.log('Count is:', counter.count);
  
  if (counter.count > 10) {
    console.warn('Count is high!');
  }
});

DevTools.trackEffect(cleanup, 'CountLogger');

// Trigger changes
counter.count = 5;
counter.count = 15;

// Check how many times effect ran
console.log(window.__REACTIVE_DEVTOOLS__.effects);
// See effect ran twice
```

---

### Example 3: Monitor Multiple States

```javascript
DevTools.enable();

// Create multiple states
const todos = state({ items: [] });
const user = state({ name: '', email: '' });
const settings = state({ theme: 'light', lang: 'en' });

// Track all
DevTools.trackState(todos, 'Todos');
DevTools.trackState(user, 'User');
DevTools.trackState(settings, 'Settings');

// Make changes
todos.items.push({ text: 'Task 1' });
user.name = 'Alice';
settings.theme = 'dark';

// View all states
const allStates = DevTools.getStates();
console.log(`Tracking ${allStates.length} states`);

// View combined history
const history = DevTools.getHistory();
console.log('All changes:', history);
```

---

### Example 4: Production Debugging

```javascript
// Only enable in development
if (import.meta.env.DEV) {
  DevTools.enable();
}

// Or enable via URL parameter
if (new URLSearchParams(location.search).has('debug')) {
  DevTools.enable();
  console.log('Debug mode enabled');
}

// Or expose via window for manual enable
window.enableDebug = () => DevTools.enable();
window.disableDebug = () => DevTools.disable();
```

---

### Example 5: Performance Monitoring

```javascript
DevTools.enable();

const data = state({ items: [] });
DevTools.trackState(data, 'DataState');

let effectRunCount = 0;

const cleanup = effect(() => {
  effectRunCount++;
  renderList(data.items);
});

DevTools.trackEffect(cleanup, 'RenderEffect');

// Load data
data.items = Array(1000).fill(0).map((_, i) => ({id: i}));

// Check performance
console.log(`Effect ran ${effectRunCount} times`);

const history = DevTools.getHistory();
console.log(`${history.length} changes recorded`);
```

---

### Example 6: Auto-Enable in Development

```javascript
// In your app initialization
function initDevTools() {
  // Auto-enable on localhost
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    DevTools.enable();
    console.log('🔧 DevTools enabled for localhost');
  }
}

// Call on app start
initDevTools();
```

---

### Example 7: State Comparison Tool

```javascript
DevTools.enable();

const state = ReactiveUtils.state({ count: 0 });
DevTools.trackState(state, 'Counter');

// Capture initial state
const initial = JSON.stringify(state.$raw);

// Make changes
state.count = 5;
state.count = 10;

// Compare
const current = JSON.stringify(state.$raw);
const changed = initial !== current;

console.log('State changed:', changed);
console.log('History:', DevTools.getHistory());
```

---

### Example 8: Effect Dependency Tracking

```javascript
DevTools.enable();

const stateA = state({ value: 1 });
const stateB = state({ value: 2 });

DevTools.trackState(stateA, 'StateA');
DevTools.trackState(stateB, 'StateB');

let runCount = 0;

const cleanup = effect(() => {
  const sum = stateA.value + stateB.value;
  console.log('Sum:', sum);
  runCount++;
});

DevTools.trackEffect(cleanup, 'SumEffect');

// Trigger
stateA.value = 10;
stateB.value = 20;

console.log('Effect ran:', runCount, 'times');
```

---

### Example 9: Custom Logging

```javascript
DevTools.enable();

// Extend DevTools with custom logging
const originalLogChange = DevTools.logChange;

DevTools.logChange = function(state, key, oldValue, newValue) {
  // Call original
  if (originalLogChange) {
    originalLogChange.call(this, state, key, oldValue, newValue);
  }
  
  // Custom logging
  console.log(`[Custom] ${state} changed ${key}: ${oldValue} → ${newValue}`);
};
```

---

### Example 10: Integration with External Tools

```javascript
DevTools.enable();

// Send to external monitoring
function sendToMonitoring(data) {
  fetch('/api/monitoring', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Hook into DevTools
setInterval(() => {
  if (DevTools.enabled) {
    const stats = {
      states: DevTools.getStates().length,
      changes: DevTools.getHistory().length,
      timestamp: Date.now()
    };
    
    sendToMonitoring(stats);
  }
}, 60000);  // Every minute
```

---

## Common Patterns

### Pattern 1: Conditional Enabling

```javascript
// Only enable in specific conditions
if (process.env.NODE_ENV === 'development') {
  DevTools.enable();
}
```

---

### Pattern 2: Track All States

```javascript
function createTrackedState(initialState, name) {
  const newState = state(initialState);
  DevTools.trackState(newState, name);
  return newState;
}

const todos = createTrackedState({ items: [] }, 'Todos');
```

---

### Pattern 3: Performance Monitoring

```javascript
DevTools.enable();

const performanceState = state({ renderCount: 0 });
DevTools.trackState(performanceState, 'Performance');

effect(() => {
  performanceState.renderCount++;
  render();
});

// Monitor
setInterval(() => {
  console.log('Renders:', performanceState.renderCount);
}, 1000);
```

---

### Pattern 4: Change Notification

```javascript
DevTools.enable();

// Watch for specific changes
const originalLogChange = DevTools.logChange;
DevTools.logChange = function(state, key, oldValue, newValue) {
  originalLogChange?.call(this, state, key, oldValue, newValue);
  
  if (key === 'error' && newValue) {
    console.error('Error detected:', newValue);
    alert(`Error: ${newValue}`);
  }
};
```

---

## Important Notes

### 1. Auto-Enable in Development

```javascript
// From 06_dh-reactive-enhancements.js
// DevTools auto-enables on localhost
if (typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1')) {
  DevTools.enable();
}
```

---

### 2. History Limit

```javascript
// Only keeps last 50 changes
DevTools.maxHistory = 50;

// Can be changed
DevTools.maxHistory = 100;
```

---

### 3. WeakMaps Prevent Direct Counting

```javascript
// Can't directly count all states
// But can get tracked states
DevTools.getStates().length;  // Number tracked
```

---

### 4. Disable in Production

```javascript
// Always disable in production builds
if (process.env.NODE_ENV === 'production') {
  DevTools.disable();
}
```

---

## When to Use

**Use DevTools For:**
✅ Development debugging  
✅ Understanding state flow  
✅ Performance monitoring  
✅ Change tracking  
✅ Effect dependency analysis  

**Don't Use For:**
❌ Production (performance overhead)  
❌ User-facing features  
❌ Critical path code  

---

## Performance Impact

DevTools has minimal overhead when enabled:

```javascript
// Adds logging and tracking
// ~1-2% performance impact
// Negligible for development

// Always disable in production!
```

---

## API Summary

```javascript
// Enable/Disable
DevTools.enable()
DevTools.disable()

// Track
DevTools.trackState(state, name)
DevTools.trackEffect(effect, name)

// Inspect
DevTools.getStates()
DevTools.getHistory()
DevTools.clearHistory()

// Access
window.__REACTIVE_DEVTOOLS__  // When enabled
```

---

## Browser Console Usage

```javascript
// Enable DevTools
DevTools.enable()

// Track something
const myState = state({ count: 0 })
DevTools.trackState(myState, 'MyState')

// In browser console:
const dt = window.__REACTIVE_DEVTOOLS__

dt.getStates()
dt.getHistory()
dt.clearHistory()

// Check status
dt.enabled  // true
```

---

## Summary

**What is `DevTools`?**  
A debugging and monitoring system for reactive state.

**Why use it?**
- ✅ See state changes
- ✅ Track effect runs
- ✅ Debug issues
- ✅ Monitor performance
- ✅ Understand dependencies

**Key Takeaway:**

```
No DevTools              With DevTools
      |                       |
Blind debugging         Visibility ✓
      |                       |
No history             History tracked
      |                       |
Hard to debug          Easy debugging ✅
```

**One-Line Rule:** Use DevTools in development to see what's happening in your reactive system.

**Best Practices:**
- Enable in development only
- Track important states
- Name states clearly
- Check history for debugging
- Disable in production
- Use for performance monitoring
- Auto-enable on localhost

**Remember:** DevTools is x-ray vision for your reactive system! 🎉