# `DevTools` - Development Tools Object

## Quick Start (30 seconds)

```javascript
// Enable DevTools
DevTools.enable();

// Track your state
const todoState = state({ items: [], filter: 'all' });
DevTools.trackState(todoState, 'TodoList');

// Make changes
todoState.items.push({ id: 1, text: 'Learn DevTools', done: false });
todoState.filter = 'active';

// Inspect in browser console
console.log(DevTools.getHistory());
// Shows:
// [
//   { stateName: 'TodoList', key: 'items', oldValue: [], newValue: [...], timestamp: ... },
//   { stateName: 'TodoList', key: 'filter', oldValue: 'all', newValue: 'active', timestamp: ... }
// ]

// Access globally in browser DevTools
window.__REACTIVE_DEVTOOLS__.getStates();
// Returns array of all tracked states with metadata ✨
```

**What just happened?** You enabled a powerful debugging tool that tracks every state change, provides inspection capabilities, and helps you understand your reactive data flow!

---

## What is `DevTools`?

`DevTools` is a **comprehensive development-only debugging toolkit** designed specifically for reactive state management systems. It provides visibility into state changes, effect executions, and data flow patterns that are otherwise invisible.

Simply put: it's like Chrome DevTools but specifically built for your reactive state - showing you exactly what's changing, when it's changing, why it's changing, and how your effects are responding.

Think of it as **a flight data recorder, microscope, and time machine** all combined into one debugging tool for your application's state.

---

## The Complete DevTools API

### Core Methods

```javascript
// Lifecycle
DevTools.enable()                    // Turn on DevTools
DevTools.disable()                   // Turn off DevTools

// Tracking
DevTools.trackState(state, name)     // Register state for tracking
DevTools.trackEffect(effect, name)   // Register effect for tracking

// Inspection
DevTools.getStates()                 // Get all tracked states
DevTools.getHistory()                // Get change history
DevTools.clearHistory()              // Clear logged changes
```

### Properties

```javascript
// Status
DevTools.enabled          // Boolean - is DevTools active?

// Data Stores
DevTools.states           // Map<state, metadata> - tracked states
DevTools.effects          // Map<effect, metadata> - tracked effects
DevTools.history          // Array<change> - all logged changes

// Configuration
DevTools.maxHistory       // Number - maximum history entries (default: 50)
```

### Global Access

```javascript
// When enabled, available as:
window.__REACTIVE_DEVTOOLS__   // Global reference for console access
```

---

## Why Does This Exist?

### The Debugging Challenge

Reactive systems are powerful but create unique debugging challenges:

**Problem 1: Invisible Changes**
```javascript
const state = state({ count: 0, user: { name: 'Alice' } });

// Something changes the count... but where? when? why?
// Without DevTools:
console.log(state.count); // 5
// How did it become 5? 
// What changed it?
// When did it change?
// No answers! ❌
```

**Problem 2: Effect Mystery**
```javascript
effect(() => {
  // This runs... but when? how many times?
  console.log('Effect running');
});

// Without DevTools:
// - Can't see effect executions
// - Can't track how many times it ran
// - Can't see what triggered it
// Total mystery! ❌
```

**Problem 3: Complex Data Flow**
```javascript
// State A changes
stateA.value = 10;

// Which triggers effect that updates State B
// Which triggers another effect that updates State C
// Which triggers...

// Without DevTools:
// - Can't visualize the cascade
// - Can't see the order
// - Can't debug the chain
// Total confusion! ❌
```

**Problem 4: Race Conditions**
```javascript
// Multiple rapid changes
state.value = 1;
state.value = 2;
state.value = 3;

// Without DevTools:
// - Can't see all intermediate values
// - Can't see timing
// - Can't reproduce issues
// Impossible to debug! ❌
```

### The Solution: DevTools

DevTools solves all these problems by providing complete visibility:

```javascript
// Enable DevTools
DevTools.enable();

// Track state
const state = state({ count: 0, user: { name: 'Alice' } });
DevTools.trackState(state, 'AppState');

// Make changes
state.count = 1;
state.count = 2;
state.count = 3;

// Now you can see EVERYTHING:
const history = DevTools.getHistory();
// [
//   { stateName: 'AppState', key: 'count', oldValue: 0, newValue: 1, timestamp: 1234 },
//   { stateName: 'AppState', key: 'count', oldValue: 1, newValue: 2, timestamp: 1235 },
//   { stateName: 'AppState', key: 'count', oldValue: 2, newValue: 3, timestamp: 1236 }
// ]

// You can see:
// ✅ What changed (count)
// ✅ From what (0, 1, 2)
// ✅ To what (1, 2, 3)
// ✅ When (timestamps)
// ✅ All intermediate values
```

**Benefits:**
✅ **Complete visibility** - See every state change  
✅ **Time travel** - View previous values  
✅ **Debugging power** - Understand data flow  
✅ **Effect tracking** - Monitor reactive updates  
✅ **Performance insights** - Identify bottlenecks  

---

## Mental Models

### The Flight Recorder Analogy

Think of your app without DevTools as **flying without a black box**:

```
No DevTools (No Flight Recorder)
┌─────────────────────────────────┐
│  Plane takes off                │
│  Something happens              │
│  Plane behaves strangely        │
│  No record of events            │
│  Can't investigate              │
│  Can't prevent future issues    │
│                                 │
│  Mystery forever ❌             │
└─────────────────────────────────┘
```

Think of DevTools as **a comprehensive flight data recorder**:

```
With DevTools (Flight Recorder Active)
┌─────────────────────────────────┐
│  Plane takes off                │
│  ✓ Logged: Altitude 0→1000ft    │
│                                 │
│  Something happens              │
│  ✓ Logged: Speed change         │
│  ✓ Logged: Direction change     │
│  ✓ Logged: Altitude change      │
│                                 │
│  Can review complete timeline   │
│  Can identify root cause        │
│  Can prevent future issues      │
│                                 │
│  Full understanding ✅          │
└─────────────────────────────────┘
```

### The Microscope Analogy

DevTools is like **a microscope for your state**:

```
Without DevTools (Naked Eye)
┌─────────────────────┐
│  State: { ... }     │
│                     │
│  Can see surface    │
│  Can't see inside   │
│  Can't see changes  │
│  Can't see details  │
│                     │
│  Limited view ❌    │
└─────────────────────┘

With DevTools (Microscope)
┌─────────────────────┐
│  State: { ... }     │
│       ↓             │
│  [Magnified view]   │
│                     │
│  See all properties │
│  See all changes    │
│  See timestamps     │
│  See relationships  │
│                     │
│  Complete view ✅   │
└─────────────────────┘
```

### The Time Machine Analogy

DevTools provides **time-travel debugging**:

```
State Timeline
═══════════════════════════════════════

Past         Now          Future
  │           │              │
  ▼           ▼              ▼
count: 0 → 5 → 10 → 15 → 20
       ↑   ↑    ↑    ↑    ↑
       │   │    │    │    │
    DevTools records all values
    
    Can review any point in time:
    - What was count at timestamp X?
    - How many times did it change?
    - What triggered each change?
```

**Key Insight:** DevTools transforms reactive debugging from guesswork to science.

---

## How Does It Work?

### Architecture Overview

DevTools uses a combination of interception, logging, and metadata tracking:

```
┌─────────────────────────────────────────────────────┐
│                   Your Application                  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ State A  │  │ State B  │  │ State C  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │               │
│       │ changes     │ changes     │ changes       │
│       ▼             ▼             ▼               │
│  ┌────────────────────────────────────┐           │
│  │         DevTools Layer            │           │
│  │  - Intercepts changes             │           │
│  │  - Logs metadata                  │           │
│  │  - Tracks relationships           │           │
│  └────────────┬───────────────────────┘           │
│               ▼                                   │
│  ┌────────────────────────────────┐               │
│  │    Storage & History           │               │
│  │  - states Map                  │               │
│  │  - effects Map                 │               │
│  │  - history Array               │               │
│  └────────────────────────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
         window.__REACTIVE_DEVTOOLS__
         (Global console access)
```

### Change Logging Process

When a state change occurs:

```
Step 1: State Property Changes
        │
        ▼
Step 2: DevTools Detects Change
        │
        ▼
Step 3: Capture Metadata
        - State ID
        - State name
        - Property key
        - Old value
        - New value
        - Timestamp
        │
        ▼
Step 4: Create Change Record
        {
          stateId: 1,
          stateName: 'TodoList',
          key: 'items',
          oldValue: [],
          newValue: [{ id: 1, text: '...' }],
          timestamp: 1704123456789
        }
        │
        ▼
Step 5: Add to History
        history.push(changeRecord)
        │
        ▼
Step 6: Enforce History Limit
        if (history.length > maxHistory) {
          history.shift()
        }
        │
        ▼
Step 7: Update State Metadata
        states.get(state).updates.push(changeRecord)
```

### State Tracking System

When you track a state:

```javascript
DevTools.trackState(myState, 'MyState');

// Internally:
{
  // Assign unique ID
  id: 1,
  
  // Store provided name
  name: 'MyState',
  
  // Record creation time
  created: Date.now(),
  
  // Initialize update array
  updates: [],
  
  // Store reference to state
  state: myState
}
```

### Effect Tracking System

When you track an effect:

```javascript
DevTools.trackEffect(myEffect, 'MyEffect');

// Internally:
{
  // Assign unique ID
  id: 1,
  
  // Store provided name
  name: 'MyEffect',
  
  // Record creation time
  created: Date.now(),
  
  // Track execution count
  runs: 0,
  
  // Store reference to effect
  effect: myEffect
}
```

---

## Complete API Reference

### DevTools.enable()

**Purpose:** Activates DevTools and exposes it globally

**Syntax:**
```javascript
DevTools.enable()
```

**Parameters:** None

**Returns:** `DevTools` object (for chaining)

**What It Does:**
1. Sets `DevTools.enabled = true`
2. Exposes `window.__REACTIVE_DEVTOOLS__`
3. Logs confirmation to console
4. Enables tracking functionality

**Example:**
```javascript
// Enable DevTools
DevTools.enable();

// Console output:
// "[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__"

// Now active
console.log(DevTools.enabled); // true

// Globally accessible
console.log(window.__REACTIVE_DEVTOOLS__); // DevTools object
```

**When to Use:**
- At app startup in development
- When debugging mode is enabled
- Before tracking any states
- Never in production builds

**Common Pattern:**
```javascript
// Environment-based enabling
if (process.env.NODE_ENV === 'development') {
  DevTools.enable();
}

// Or with URL parameter
const params = new URLSearchParams(window.location.search);
if (params.has('debug')) {
  DevTools.enable();
}
```

---

### DevTools.disable()

**Purpose:** Deactivates DevTools and removes global reference

**Syntax:**
```javascript
DevTools.disable()
```

**Parameters:** None

**Returns:** `DevTools` object (for chaining)

**What It Does:**
1. Sets `DevTools.enabled = false`
2. Removes `window.__REACTIVE_DEVTOOLS__`
3. Stops all tracking
4. Keeps existing history (doesn't clear)

**Example:**
```javascript
// Disable DevTools
DevTools.disable();

// Now inactive
console.log(DevTools.enabled); // false

// No longer global
console.log(window.__REACTIVE_DEVTOOLS__); // undefined

// Tracking stops working
DevTools.trackState(state, 'Test'); // No effect
```

**When to Use:**
- After debugging session
- When switching to production mode
- To clean up resources
- To stop tracking temporarily

**Important Note:**
```javascript
// History is preserved
DevTools.enable();
// ... make changes ...
const history = DevTools.getHistory(); // Has entries

DevTools.disable();

// History still exists
console.log(DevTools.history.length); // Still has entries

// But can't be accessed via methods
DevTools.getHistory(); // Returns [] (disabled)

// To clear history:
DevTools.clearHistory();
```

---

### DevTools.trackState(state, name)

**Purpose:** Register a reactive state object for tracking

**Syntax:**
```javascript
DevTools.trackState(state, name)
```

**Parameters:**
- `state` (Object) - The reactive state object to track
- `name` (String) - Descriptive name for identification in logs

**Returns:** Nothing (void)

**What It Does:**
1. Validates DevTools is enabled
2. Assigns unique ID to state
3. Stores state with metadata
4. Begins logging all changes to this state

**Example:**
```javascript
DevTools.enable();

// Track a state
const todoState = state({
  items: [],
  filter: 'all',
  count: 0
});

DevTools.trackState(todoState, 'TodoList');

// Now all changes logged:
todoState.count = 5;
// Logged: TodoList.count changed from 0 to 5

todoState.filter = 'active';
// Logged: TodoList.filter changed from 'all' to 'active'
```

**State Metadata Structure:**
```javascript
{
  id: 1,                    // Unique identifier
  name: 'TodoList',         // Your provided name
  created: 1704123456789,   // Timestamp when tracked
  updates: [],              // Array of changes to this state
  state: <StateObject>      // Reference to actual state
}
```

**Best Practices:**

✅ **Good Names:**
```javascript
DevTools.trackState(userProfile, 'UserProfile');
DevTools.trackState(shoppingCart, 'ShoppingCart');
DevTools.trackState(appSettings, 'AppSettings');
```

❌ **Bad Names:**
```javascript
DevTools.trackState(state1, 'state');
DevTools.trackState(data, 'data');
DevTools.trackState(obj, 'obj');
```

**Error Handling:**
```javascript
// If DevTools not enabled
DevTools.trackState(state, 'Test');
// Console error: "[Reactive] Cannot track state - DevTools not enabled"

// If state is not reactive
const plainObject = { value: 1 };
DevTools.trackState(plainObject, 'Plain');
// May not track changes correctly
```

**Multiple States:**
```javascript
DevTools.enable();

// Track multiple different states
const user = state({ name: '', email: '' });
DevTools.trackState(user, 'User');

const cart = state({ items: [], total: 0 });
DevTools.trackState(cart, 'Cart');

const settings = state({ theme: 'light', lang: 'en' });
DevTools.trackState(settings, 'Settings');

// Each tracked independently
// Changes logged with their respective names
```

---

### DevTools.trackEffect(effect, name)

**Purpose:** Register an effect function for monitoring

**Syntax:**
```javascript
DevTools.trackEffect(effect, name)
```

**Parameters:**
- `effect` (Function) - The effect function to track
- `name` (String) - Descriptive name for the effect

**Returns:** Nothing (void)

**What It Does:**
1. Validates DevTools is enabled
2. Assigns unique ID to effect
3. Stores effect with metadata
4. Monitors effect executions

**Example:**
```javascript
DevTools.enable();

const state = state({ count: 0 });
DevTools.trackState(state, 'Counter');

// Create and track effect
const logEffect = effect(() => {
  console.log('Count is:', state.count);
});

DevTools.trackEffect(logEffect, 'CountLogger');

// Change state
state.count = 1;
state.count = 2;

// View effect info
DevTools.effects.forEach((info, effect) => {
  console.log(`${info.name}: ran ${info.runs} times`);
});
// Output: "CountLogger: ran 3 times" (initial + 2 changes)
```

**Effect Metadata Structure:**
```javascript
{
  id: 1,                    // Unique identifier
  name: 'CountLogger',      // Your provided name
  created: 1704123456789,   // Timestamp when tracked
  runs: 3,                  // Number of times executed
  effect: <EffectFunction>  // Reference to effect
}
```

**Multiple Effects:**
```javascript
DevTools.enable();

const state = state({ count: 0, name: '' });
DevTools.trackState(state, 'AppState');

// Track multiple effects
const effect1 = effect(() => {
  console.log('Count:', state.count);
});
DevTools.trackEffect(effect1, 'CountLogger');

const effect2 = effect(() => {
  document.title = state.name;
});
DevTools.trackEffect(effect2, 'TitleUpdater');

const effect3 = effect(() => {
  localStorage.setItem('count', state.count);
});
DevTools.trackEffect(effect3, 'CountPersister');

// All tracked independently
```

---

### DevTools.getStates()

**Purpose:** Retrieve information about all tracked states

**Syntax:**
```javascript
DevTools.getStates()
```

**Parameters:** None

**Returns:** Array of state info objects

**Return Structure:**
```javascript
[
  {
    id: 1,
    name: 'TodoList',
    created: 1704123456789,
    updates: [ /* array of changes */ ],
    state: <StateObject>
  },
  // ... more states
]
```

**Example:**
```javascript
DevTools.enable();

DevTools.trackState(state1, 'User');
DevTools.trackState(state2, 'Cart');
DevTools.trackState(state3, 'Settings');

const states = DevTools.getStates();

console.log(`Tracking ${states.length} states`);
// Output: "Tracking 3 states"

states.forEach(s => {
  console.log(`${s.name}: ${s.updates.length} updates`);
});
// Output:
// "User: 5 updates"
// "Cart: 12 updates"
// "Settings: 3 updates"
```

**Common Use Cases:**

**List All States:**
```javascript
const states = DevTools.getStates();
console.table(states.map(s => ({
  Name: s.name,
  ID: s.id,
  Updates: s.updates.length,
  Created: new Date(s.created).toLocaleTimeString()
})));
```

**Find Specific State:**
```javascript
const userState = DevTools.getStates()
  .find(s => s.name === 'User');

if (userState) {
  console.log('User state found:', userState);
}
```

**Get Most Active State:**
```javascript
const states = DevTools.getStates();
const mostActive = states.reduce((max, s) => 
  s.updates.length > max.updates.length ? s : max
);

console.log(`Most active: ${mostActive.name} (${mostActive.updates.length} updates)`);
```

**Export State Info:**
```javascript
function exportStateInfo() {
  const states = DevTools.getStates();
  
  const info = states.map(s => ({
    name: s.name,
    id: s.id,
    created: s.created,
    totalUpdates: s.updates.length,
    lastUpdate: s.updates[s.updates.length - 1]
  }));
  
  console.log(JSON.stringify(info, null, 2));
}
```

---

### DevTools.getHistory()

**Purpose:** Retrieve complete change history

**Syntax:**
```javascript
DevTools.getHistory()
```

**Parameters:** None

**Returns:** Array of change records

**Change Record Structure:**
```javascript
{
  stateId: 1,              // ID of changed state
  stateName: 'TodoList',   // Name of changed state
  key: 'count',            // Property that changed
  oldValue: 0,             // Previous value
  newValue: 5,             // New value
  timestamp: 1704123456789 // When change occurred
}
```

**Example:**
```javascript
DevTools.enable();

const state = state({ count: 0, name: 'Test' });
DevTools.trackState(state, 'AppState');

state.count = 1;
state.count = 2;
state.name = 'Updated';

const history = DevTools.getHistory();

console.log(`Total changes: ${history.length}`);
// Output: "Total changes: 3"

console.table(history);
// Shows formatted table of all changes
```

**Filtering History:**

**By State Name:**
```javascript
const userChanges = DevTools.getHistory()
  .filter(h => h.stateName === 'User');

console.log(`User state changes: ${userChanges.length}`);
```

**By Property:**
```javascript
const themeChanges = DevTools.getHistory()
  .filter(h => h.key === 'theme');

console.log('Theme change history:', themeChanges);
```

**By Time Range:**
```javascript
const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

const recentChanges = DevTools.getHistory()
  .filter(h => h.timestamp > fiveMinutesAgo);

console.log(`Changes in last 5 minutes: ${recentChanges.length}`);
```

**Get Last N Changes:**
```javascript
const last10 = DevTools.getHistory().slice(-10);
console.log('Last 10 changes:', last10);
```

**Timeline Analysis:**
```javascript
function printTimeline() {
  DevTools.getHistory().forEach(change => {
    const time = new Date(change.timestamp).toLocaleTimeString();
    console.log(
      `${time}: ${change.stateName}.${change.key} ` +
      `changed from ${change.oldValue} to ${change.newValue}`
    );
  });
}

printTimeline();
// Output:
// "10:30:15: TodoList.count changed from 0 to 1"
// "10:30:16: TodoList.count changed from 1 to 2"
// "10:30:17: TodoList.filter changed from all to active"
```

**Export History:**
```javascript
function exportHistory() {
  const history = DevTools.getHistory();
  const json = JSON.stringify(history, null, 2);
  
  // Create downloadable file
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devtools-history-${Date.now()}.json`;
  a.click();
}
```

**Statistics:**
```javascript
function getStatistics() {
  const history = DevTools.getHistory();
  
  const stats = {
    totalChanges: history.length,
    states: {},
    properties: {},
    timeRange: {
      first: history[0]?.timestamp,
      last: history[history.length - 1]?.timestamp
    }
  };
  
  history.forEach(change => {
    // Count per state
    stats.states[change.stateName] = 
      (stats.states[change.stateName] || 0) + 1;
    
    // Count per property
    stats.properties[change.key] = 
      (stats.properties[change.key] || 0) + 1;
  });
  
  return stats;
}

console.log(getStatistics());
```

---

### DevTools.clearHistory()

**Purpose:** Clear all logged state changes

**Syntax:**
```javascript
DevTools.clearHistory()
```

**Parameters:** None

**Returns:** Nothing (void)

**What It Does:**
1. Empties the history array
2. Does NOT remove tracked states
3. Does NOT remove tracked effects
4. Only clears change logs

**Example:**
```javascript
DevTools.enable();

const state = state({ count: 0 });
DevTools.trackState(state, 'Counter');

state.count = 1;
state.count = 2;
state.count = 3;

console.log(DevTools.getHistory().length); // 3

DevTools.clearHistory();

console.log(DevTools.getHistory().length); // 0

// State still tracked
console.log(DevTools.getStates().length); // 1

// New changes still logged
state.count = 4;
console.log(DevTools.getHistory().length); // 1
```

**Common Use Cases:**

**Clear Between Tests:**
```javascript
describe('My Tests', () => {
  beforeEach(() => {
    DevTools.clearHistory();
  });
  
  it('should track changes', () => {
    // Start with clean history
    expect(DevTools.getHistory().length).toBe(0);
  });
});
```

**Periodic Cleanup:**
```javascript
// Clear history every minute to save memory
setInterval(() => {
  if (DevTools.enabled && DevTools.history.length > 100) {
    console.log('Clearing DevTools history...');
    DevTools.clearHistory();
  }
}, 60000);
```

**Before Critical Operations:**
```javascript
function criticalOperation() {
  // Clear history to isolate this operation
  DevTools.clearHistory();
  
  // Perform operation
  performComplexStateChanges();
  
  // Now history only contains this operation's changes
  const changes = DevTools.getHistory();
  console.log('Operation made these changes:', changes);
}
```

**Manual Cleanup:**
```javascript
// User-triggered cleanup
document.getElementById('clear-devtools').addEventListener('click', () => {
  DevTools.clearHistory();
  console.log('DevTools history cleared');
});
```

---

## Properties Reference

### DevTools.enabled

**Type:** Boolean

**Description:** Indicates whether DevTools is currently active

**Read/Write:** Read-only (use `enable()` / `disable()` to change)

**Example:**
```javascript
console.log(DevTools.enabled); // false

DevTools.enable();
console.log(DevTools.enabled); // true

DevTools.disable();
console.log(DevTools.enabled); // false
```

**Use Cases:**
```javascript
// Conditional tracking
if (DevTools.enabled) {
  DevTools.trackState(state, 'MyState');
}

// Feature detection
function debugLog(message) {
  if (DevTools.enabled) {
    console.log('[DEBUG]', message);
  }
}
```

---

### DevTools.states

**Type:** Map<State, Metadata>

**Description:** Map of all tracked state objects with their metadata

**Structure:**
```javascript
Map {
  <StateObject1> => {
    id: 1,
    name: 'TodoList',
    created: 1704123456789,
    updates: [...]
  },
  <StateObject2> => {
    id: 2,
    name: 'UserProfile',
    created: 1704123456790,
    updates: [...]
  }
}
```

**Direct Access Example:**
```javascript
DevTools.states.forEach((info, state) => {
  console.log(`State "${info.name}": ${info.updates.length} updates`);
});

// Check if specific state is tracked
const isTracked = DevTools.states.has(myState);

// Get info for specific state
const info = DevTools.states.get(myState);
if (info) {
  console.log(`State ID: ${info.id}, Name: ${info.name}`);
}
```

---

### DevTools.effects

**Type:** Map<Effect, Metadata>

**Description:** Map of all tracked effect functions with their metadata

**Structure:**
```javascript
Map {
  <EffectFunction1> => {
    id: 1,
    name: 'CountLogger',
    created: 1704123456789,
    runs: 5
  },
  <EffectFunction2> => {
    id: 2,
    name: 'TitleUpdater',
    created: 1704123456790,
    runs: 3
  }
}
```

**Direct Access Example:**
```javascript
DevTools.effects.forEach((info, effect) => {
  console.log(`Effect "${info.name}" ran ${info.runs} times`);
});

// Find most-run effect
let maxRuns = 0;
let mostActive = null;

DevTools.effects.forEach((info, effect) => {
  if (info.runs > maxRuns) {
    maxRuns = info.runs;
    mostActive = info;
  }
});

console.log(`Most active effect: ${mostActive.name} (${maxRuns} runs)`);
```

---

### DevTools.history

**Type:** Array<ChangeRecord>

**Description:** Array of all logged state changes

**Structure:**
```javascript
[
  {
    stateId: 1,
    stateName: 'TodoList',
    key: 'count',
    oldValue: 0,
    newValue: 1,
    timestamp: 1704123456789
  },
  // ... more changes
]
```

**Direct Access Example:**
```javascript
// Get total changes
console.log(`Total changes: ${DevTools.history.length}`);

// Access specific change
const firstChange = DevTools.history[0];
console.log('First change:', firstChange);

// Iterate through history
DevTools.history.forEach((change, index) => {
  console.log(`#${index + 1}: ${change.stateName}.${change.key} changed`);
});
```

---

### DevTools.maxHistory

**Type:** Number

**Description:** Maximum number of history entries to keep

**Default:** 50

**Read/Write:** Yes (can be changed)

**Example:**
```javascript
console.log(DevTools.maxHistory); // 50

// Increase limit
DevTools.maxHistory = 100;

// Decrease limit
DevTools.maxHistory = 20;

// Unlimited (not recommended!)
DevTools.maxHistory = Infinity;
```

**How It Works:**
```javascript
// When history exceeds maxHistory:
if (DevTools.history.length > DevTools.maxHistory) {
  // Oldest entry is removed
  DevTools.history.shift();
}

// This keeps memory usage under control
```

**Use Cases:**
```javascript
// Large app - more history needed
DevTools.maxHistory = 200;

// Small app - less history needed
DevTools.maxHistory = 25;

// Testing - unlimited history
DevTools.maxHistory = Infinity; // Be careful!

// Memory-constrained - minimal history
DevTools.maxHistory = 10;
```

---

## Global Console Access

When DevTools is enabled, it's exposed on the window object for easy console access:

### Accessing from Console

```javascript
// In your code:
DevTools.enable();

// Then in browser console:
const dt = window.__REACTIVE_DEVTOOLS__;

// Now you can use it:
dt.getStates();
dt.getHistory();
dt.clearHistory();
dt.enabled;
```

### Quick Console Commands

**List All States:**
```javascript
window.__REACTIVE_DEVTOOLS__.getStates().forEach(s => {
  console.log(`${s.name}: ${s.updates.length} updates`);
});
```

**View Recent Changes:**
```javascript
console.table(
  window.__REACTIVE_DEVTOOLS__.getHistory().slice(-10)
);
```

**Find State by Name:**
```javascript
const state = window.__REACTIVE_DEVTOOLS__.getStates()
  .find(s => s.name === 'TodoList');
console.log(state);
```

**Clear History:**
```javascript
window.__REACTIVE_DEVTOOLS__.clearHistory();
console.log('History cleared');
```

### Console Shortcuts

You can create global shortcuts:

```javascript
// In your app initialization:
if (DevTools.enabled) {
  window.dt = window.__REACTIVE_DEVTOOLS__;
  window.dumpState = () => console.table(DevTools.getStates());
  window.dumpHistory = () => console.table(DevTools.getHistory());
  window.clearDev = () => DevTools.clearHistory();
  
  console.log('DevTools shortcuts available:');
  console.log('  dt            - DevTools object');
  console.log('  dumpState()   - Show all states');
  console.log('  dumpHistory() - Show history');
  console.log('  clearDev()    - Clear history');
}

// Usage in console:
// > dumpState()
// > dumpHistory()
// > clearDev()
```

---

## Complete Workflow Examples

### Example 1: Basic Debugging Session

```javascript
// 1. Enable DevTools
DevTools.enable();

// 2. Create and track state
const todoState = state({
  items: [],
  filter: 'all',
  count: 0
});

DevTools.trackState(todoState, 'TodoList');

// 3. Use your app normally
todoState.items.push({ id: 1, text: 'Learn DevTools', done: false });
todoState.count = 1;
todoState.filter = 'active';

// 4. Inspect what happened
const history = DevTools.getHistory();

console.log('Changes:', history.length);
// Output: "Changes: 3"

history.forEach(change => {
  console.log(
    `${change.key}: ${change.oldValue} → ${change.newValue}`
  );
});
// Output:
// "items: [] → [...]"
// "count: 0 → 1"
// "filter: all → active"

// 5. Clean up
DevTools.clearHistory();
DevTools.disable();
```

### Example 2: Debugging Complex Data Flow

```javascript
DevTools.enable();

// Set up states
const source = state({ value: 0 });
DevTools.trackState(source, 'Source');

const derived = state({ doubled: 0 });
DevTools.trackState(derived, 'Derived');

const final = state({ quadrupled: 0 });
DevTools.trackState(final, 'Final');

// Set up effects
const effect1 = effect(() => {
  derived.doubled = source.value * 2;
});
DevTools.trackEffect(effect1, 'Doubler');

const effect2 = effect(() => {
  final.quadrupled = derived.doubled * 2;
});
DevTools.trackEffect(effect2, 'Quadrupler');

// Trigger cascade
source.value = 5;

// Analyze what happened
console.log('=== Change Timeline ===');
DevTools.getHistory().forEach(change => {
  const time = new Date(change.timestamp).toLocaleTimeString();
  console.log(
    `${time}: ${change.stateName}.${change.key} ` +
    `changed to ${change.newValue}`
  );
});

// Output:
// "10:30:15.123: Source.value changed to 5"
// "10:30:15.124: Derived.doubled changed to 10"
// "10:30:15.125: Final.quadrupled changed to 20"

console.log('=== Effect Executions ===');
DevTools.effects.forEach((info) => {
  console.log(`${info.name}: ${info.runs} runs`);
});

// Output:
// "Doubler: 2 runs"  (initial + change)
// "Quadrupler: 2 runs"  (initial + change)
```

### Example 3: Performance Analysis

```javascript
DevTools.enable();
DevTools.maxHistory = 1000; // Increase for performance testing

const state = state({ items: [] });
DevTools.trackState(state, 'DataStore');

// Perform bulk operation
console.time('BulkInsert');

for (let i = 0; i < 100; i++) {
  state.items.push({ id: i, value: Math.random() });
}

console.timeEnd('BulkInsert');

// Analyze performance
const history = DevTools.getHistory();

console.log(`Total changes: ${history.length}`);

// Calculate change frequency
const timeSpan = 
  history[history.length - 1].timestamp - 
  history[0].timestamp;

const changesPerSecond = (history.length / timeSpan) * 1000;

console.log(`Changes per second: ${changesPerSecond.toFixed(2)}`);

// Find slowest changes (if timestamps show delays)
const withDelays = history.map((change, i) => {
  if (i === 0) return null;
  return {
    index: i,
    delay: change.timestamp - history[i - 1].timestamp,
    change
  };
}).filter(Boolean).sort((a, b) => b.delay - a.delay);

console.log('Top 5 slowest changes:');
console.table(withDelays.slice(0, 5));
```

### Example 4: State Comparison

```javascript
DevTools.enable();

// Track multiple states
const stateA = state({ count: 0 });
DevTools.trackState(stateA, 'StateA');

const stateB = state({ count: 0 });
DevTools.trackState(stateB, 'StateB');

// Make different changes
stateA.count = 1;
stateA.count = 2;
stateA.count = 3;

stateB.count = 5;
stateB.count = 10;

// Compare activity
const states = DevTools.getStates();

states.forEach(s => {
  console.log(`${s.name}:`);
  console.log(`  Total updates: ${s.updates.length}`);
  
  const values = s.updates.map(u => u.newValue);
  console.log(`  Values: ${values.join(' → ')}`);
});

// Output:
// "StateA:"
// "  Total updates: 3"
// "  Values: 1 → 2 → 3"
// "StateB:"
// "  Total updates: 2"
// "  Values: 5 → 10"
```

### Example 5: Auto-Tracking Pattern

```javascript
// Enable and set up auto-tracking
DevTools.enable();

// Wrap state creation
const originalState = state;
let stateCounter = 0;

window.state = function(initialState, debugName) {
  const s = originalState(initialState);
  
  if (DevTools.enabled) {
    const name = debugName || `State_${++stateCounter}`;
    DevTools.trackState(s, name);
    console.log(`📊 Tracking: ${name}`);
  }
  
  return s;
};

// Now all states auto-tracked
const user = state({ name: 'Alice' }, 'User');
// Console: "📊 Tracking: User"

const cart = state({ items: [] }, 'Cart');
// Console: "📊 Tracking: Cart"

const settings = state({ theme: 'light' });
// Console: "📊 Tracking: State_3"

// All changes automatically logged!
```

---

## Advanced Patterns

### Pattern 1: Change Detection with Alerts

```javascript
// Alert when specific property changes
function watchProperty(stateName, property, callback) {
  const checkHistory = () => {
    const history = DevTools.getHistory();
    const lastChange = history[history.length - 1];
    
    if (lastChange && 
        lastChange.stateName === stateName && 
        lastChange.key === property) {
      callback(lastChange.newValue, lastChange.oldValue);
    }
  };
  
  // Check periodically or use MutationObserver pattern
  return setInterval(checkHistory, 100);
}

// Usage
const stopWatching = watchProperty('User', 'email', (newEmail, oldEmail) => {
  console.log(`Email changed from ${oldEmail} to ${newEmail}`);
});

// Clean up
clearInterval(stopWatching);
```

### Pattern 2: State Snapshots

```javascript
// Take snapshot of all states
function takeSnapshot() {
  const states = DevTools.getStates();
  
  return states.map(s => ({
    name: s.name,
    snapshot: JSON.parse(JSON.stringify(s.state)),
    timestamp: Date.now()
  }));
}

// Compare snapshots
function compareSnapshots(before, after) {
  const changes = [];
  
  before.forEach((beforeState, i) => {
    const afterState = after[i];
    
    if (JSON.stringify(beforeState.snapshot) !== 
        JSON.stringify(afterState.snapshot)) {
      changes.push({
        state: beforeState.name,
        before: beforeState.snapshot,
        after: afterState.snapshot
      });
    }
  });
  
  return changes;
}

// Usage
const snapshot1 = takeSnapshot();
// ... make changes ...
const snapshot2 = takeSnapshot();

const diff = compareSnapshots(snapshot1, snapshot2);
console.log('Changes:', diff);
```

### Pattern 3: History Replay

```javascript
// Capture initial state
function captureInitialStates() {
  return DevTools.getStates().map(s => ({
    name: s.name,
    initial: JSON.parse(JSON.stringify(s.state))
  }));
}

// Replay history
function replayHistory(initialStates, history) {
  console.log('=== Replaying History ===');
  
  // Start with initial states
  console.log('Initial states:', initialStates);
  
  // Apply each change in sequence
  history.forEach((change, i) => {
    console.log(
      `Step ${i + 1}: ${change.stateName}.${change.key} ` +
      `= ${change.newValue}`
    );
  });
}

// Usage
const initial = captureInitialStates();
// ... app runs ...
const history = DevTools.getHistory();

replayHistory(initial, history);
```

### Pattern 4: Export/Import Sessions

```javascript
// Export entire DevTools session
function exportSession() {
  return {
    version: '1.0',
    exported: Date.now(),
    states: DevTools.getStates().map(s => ({
      id: s.id,
      name: s.name,
      created: s.created,
      currentState: s.state
    })),
    history: DevTools.getHistory(),
    effects: Array.from(DevTools.effects.values())
  };
}

// Save to file
function saveSession() {
  const session = exportSession();
  const json = JSON.stringify(session, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `devtools-session-${Date.now()}.json`;
  a.click();
}

// Load from file
function loadSession(sessionData) {
  console.log('Session from:', new Date(sessionData.exported));
  console.log('States:', sessionData.states);
  console.log('History:', sessionData.history);
  console.log('Effects:', sessionData.effects);
  
  // Could restore state, replay history, etc.
}
```

### Pattern 5: Real-Time Monitoring Dashboard

```javascript
// Create live monitoring display
function createMonitoringDashboard() {
  const dashboard = document.createElement('div');
  dashboard.id = 'devtools-dashboard';
  dashboard.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #1e1e1e;
    color: #fff;
    padding: 15px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    max-width: 300px;
    z-index: 10000;
  `;
  
  function update() {
    const states = DevTools.getStates();
    const history = DevTools.getHistory();
    const effects = Array.from(DevTools.effects.values());
    
    dashboard.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">DevTools Monitor</h3>
      <div><strong>States:</strong> ${states.length}</div>
      <div><strong>Effects:</strong> ${effects.length}</div>
      <div><strong>History:</strong> ${history.length}/${DevTools.maxHistory}</div>
      <hr style="margin: 10px 0;">
      <div><strong>Recent Changes:</strong></div>
      ${history.slice(-5).reverse().map(h => `
        <div style="font-size: 10px; margin-top: 5px;">
          ${h.stateName}.${h.key} = ${JSON.stringify(h.newValue)}
        </div>
      `).join('')}
      <hr style="margin: 10px 0;">
      <button onclick="DevTools.clearHistory()" style="width: 100%;">
        Clear History
      </button>
    `;
  }
  
  document.body.appendChild(dashboard);
  
  // Update every second
  setInterval(update, 1000);
  update();
}

// Usage
if (DevTools.enabled) {
  createMonitoringDashboard();
}
```

---

## Production Considerations

### Never Enable in Production

```javascript
// ✅ Good: Environment check
if (process.env.NODE_ENV !== 'production') {
  DevTools.enable();
}

// ✅ Good: Webpack DefinePlugin
if (__DEV__) {  // Removed by webpack in production
  DevTools.enable();
}

// ✅ Good: Conditional build
if (IS_DEVELOPMENT) {
  DevTools.enable();
}

// ❌ Bad: Always enabled
DevTools.enable();
```

### Tree Shaking

Ensure DevTools code is removed from production builds:

```javascript
// In your bundler config (webpack, rollup, etc.)
// Mark DevTools as side-effect-free
// Or use conditional imports

// development.js
export { DevTools } from './devtools';

// production.js  
export const DevTools = {
  enable: () => {},
  disable: () => {},
  trackState: () => {},
  // ... no-op implementations
};
```

### Performance Impact

DevTools has minimal performance impact when used correctly:

```javascript
// ✅ Good: Limited history
DevTools.maxHistory = 50;

// ❌ Bad: Unlimited history
DevTools.maxHistory = Infinity;

// ✅ Good: Periodic cleanup
setInterval(() => {
  if (DevTools.history.length > 100) {
    DevTools.clearHistory();
  }
}, 60000);

// ✅ Good: Selective tracking
// Only track states you're debugging
DevTools.trackState(suspectState, 'SuspectState');

// ❌ Bad: Track everything
// Creates overhead
allStates.forEach(s => DevTools.trackState(s, 'State'));
```

---

## Summary

**What is DevTools?**  
A comprehensive development-only debugging toolkit that provides complete visibility into reactive state changes, effect executions, and data flow patterns.

**Core Capabilities:**
- ✅ Track state changes with timestamps
- ✅ Monitor effect executions  
- ✅ Inspect data flow
- ✅ Export debugging sessions
- ✅ Console access for live inspection

**Key Methods:**
- `enable()` / `disable()` - Control DevTools
- `trackState()` / `trackEffect()` - Register for tracking
- `getStates()` / `getHistory()` - Inspect data
- `clearHistory()` - Clean up logs

**Best Practices:**
- Only enable in development
- Use descriptive names when tracking
- Clear history periodically
- Limit history size
- Never ship enabled in production
- Use console access for live debugging

**Remember:** DevTools transforms reactive debugging from guesswork into science! 🎉