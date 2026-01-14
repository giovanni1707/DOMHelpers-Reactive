# `DevTools Inspection` - Review & Clear Data

## Quick Start (30 seconds)

```javascript
// Setup
DevTools.enable();

const todos = state({ items: [], filter: 'all' });
DevTools.trackState(todos, 'TodoList');

todos.items.push({ text: 'Buy milk' });
todos.filter = 'active';

// 1. Get all tracked states
const states = DevTools.getStates();
console.log('States:', states);
// [{ id: 1, name: 'TodoList', created: ..., updates: [...], state: {...} }]

// 2. Get change history
const history = DevTools.getHistory();
console.log('History:', history);
// [
//   { stateName: 'TodoList', key: 'items', oldValue: [], newValue: [...] },
//   { stateName: 'TodoList', key: 'filter', oldValue: 'all', newValue: 'active' }
// ]

// 3. Clear history
DevTools.clearHistory();
console.log('After clear:', DevTools.getHistory().length);  // 0

// States still tracked, but history empty ✨
```

**What just happened?** You inspected tracked states and history, then cleared the log!

 

## Overview

Inspection methods let you **review what DevTools has recorded**:

```
getStates()    → View tracked states
getHistory()   → View change log
clearHistory() → Clear change log
```

Think of it as **reviewing security footage** - you can see what was recorded and clear old recordings.

 

## getStates() Method

### What It Does

`getStates()` **returns an array of all tracked states** with their metadata.

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
    updates: [...],
    state: <StateObject>
  }
]
```

### Examples

**Example 1: List All States**
```javascript
DevTools.enable();

DevTools.trackState(user, 'User');
DevTools.trackState(cart, 'Cart');

const states = DevTools.getStates();
console.log(`Tracking ${states.length} states`);

states.forEach(s => {
  console.log(`- ${s.name}: ${s.updates.length} updates`);
});
```

**Example 2: Find Specific State**
```javascript
const userState = DevTools.getStates()
  .find(s => s.name === 'User');

if (userState) {
  console.log('User state found:', userState);
}
```

**Example 3: Most Active State**
```javascript
const states = DevTools.getStates();
const mostActive = states.reduce((max, s) => 
  s.updates.length > max.updates.length ? s : max
);

console.log(`Most active: ${mostActive.name} (${mostActive.updates.length} updates)`);
```

 

## getHistory() Method

### What It Does

`getHistory()` **returns an array of all logged state changes**.

```javascript
DevTools.getHistory()
```

**Parameters:** None

**Returns:** Array of change records (last 50 by default)

**Return Structure:**
```javascript
[
  {
    stateId: 1,
    stateName: 'TodoList',
    key: 'items',
    oldValue: [],
    newValue: [{ id: 1, text: 'Buy milk' }],
    timestamp: 1704123456789
  }
]
```

### Examples

**Example 1: View All Changes**
```javascript
DevTools.enable();
DevTools.trackState(state, 'Counter');

state.count = 1;
state.count = 2;
state.count = 3;

const history = DevTools.getHistory();
console.log(`Total changes: ${history.length}`);  // 3

history.forEach(change => {
  console.log(
    `${change.stateName}.${change.key}: ` +
    `${change.oldValue} → ${change.newValue}`
  );
});
```

**Example 2: Filter By State**
```javascript
const todoChanges = DevTools.getHistory()
  .filter(h => h.stateName === 'TodoList');

console.log(`TodoList changes: ${todoChanges.length}`);
```

**Example 3: Recent Changes**
```javascript
const last10 = DevTools.getHistory().slice(-10);
console.log('Last 10 changes:', last10);
```

**Example 4: Time-Based Filtering**
```javascript
const fiveMinAgo = Date.now() - (5 * 60 * 1000);
const recent = DevTools.getHistory()
  .filter(c => c.timestamp > fiveMinAgo);

console.log(`Changes in last 5 minutes: ${recent.length}`);
```

 

## clearHistory() Method

### What It Does

`clearHistory()` **clears all logged state changes**.

```javascript
DevTools.clearHistory()
```

**Parameters:** None

**Returns:** `undefined`

**What It Does:**
- ✅ Empties the history array
- ✅ Preserves tracked states
- ✅ Preserves tracked effects
- ✅ Frees memory

### Examples

**Example 1: Simple Clear**
```javascript
DevTools.enable();
DevTools.trackState(state, 'Counter');

state.count++;
console.log(DevTools.getHistory().length);  // 1

DevTools.clearHistory();
console.log(DevTools.getHistory().length);  // 0

// States still tracked
console.log(DevTools.getStates().length);  // 1
```

**Example 2: Periodic Cleanup**
```javascript
// Clear every minute
setInterval(() => {
  if (DevTools.history.length > 100) {
    console.log('Clearing DevTools history...');
    DevTools.clearHistory();
  }
}, 60000);
```

**Example 3: Between Tests**
```javascript
describe('My Tests', () => {
  beforeEach(() => {
    DevTools.clearHistory();
  });
  
  it('should track changes', () => {
    expect(DevTools.getHistory().length).toBe(0);
  });
});
```

 

## Inspection Patterns

### Pattern 1: State Summary

```javascript
function summarizeStates() {
  const states = DevTools.getStates();
  
  console.log('=== State Summary ===');
  states.forEach(s => {
    console.log(`${s.name}:`);
    console.log(`  ID: ${s.id}`);
    console.log(`  Created: ${new Date(s.created).toLocaleTimeString()}`);
    console.log(`  Updates: ${s.updates.length}`);
  });
}
```

 

### Pattern 2: History Timeline

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
```

 

### Pattern 3: Change Statistics

```javascript
function getStatistics() {
  const history = DevTools.getHistory();
  
  const stats = {
    totalChanges: history.length,
    byState: {},
    byProperty: {}
  };
  
  history.forEach(change => {
    // Count per state
    stats.byState[change.stateName] = 
      (stats.byState[change.stateName] || 0) + 1;
    
    // Count per property
    stats.byProperty[change.key] = 
      (stats.byProperty[change.key] || 0) + 1;
  });
  
  return stats;
}
```

 

## Real-World Examples

### Example 1: Debug Dashboard

```javascript
function createDebugDashboard() {
  const states = DevTools.getStates();
  const history = DevTools.getHistory();
  
  console.clear();
  console.log('=== Debug Dashboard ===');
  console.log(`States: ${states.length}`);
  console.log(`History: ${history.length}/${DevTools.maxHistory}`);
  console.log('');
  
  states.forEach(s => {
    console.log(`${s.name}: ${s.updates.length} updates`);
  });
  
  console.log('');
  console.log('Recent changes:');
  history.slice(-5).forEach(c => {
    console.log(`  ${c.stateName}.${c.key} = ${c.newValue}`);
  });
}

// Run periodically
setInterval(createDebugDashboard, 5000);
```

 

### Example 2: Export Report

```javascript
function exportDebugReport() {
  const report = {
    timestamp: Date.now(),
    states: DevTools.getStates().map(s => ({
      name: s.name,
      id: s.id,
      updates: s.updates.length
    })),
    history: DevTools.getHistory(),
    statistics: getStatistics()
  };
  
  const json = JSON.stringify(report, null, 2);
  console.log(json);
  
  // Or download as file
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debug-report-${Date.now()}.json`;
  a.click();
}
```

 

### Example 3: Find Bottlenecks

```javascript
function findBottlenecks() {
  const states = DevTools.getStates();
  
  console.log('=== Potential Bottlenecks ===');
  
  states.forEach(s => {
    if (s.updates.length > 100) {
      console.warn(
        `⚠️  ${s.name} has ${s.updates.length} updates - ` +
        `consider optimization`
      );
    }
  });
  
  const effects = Array.from(DevTools.effects.values());
  effects.forEach(e => {
    if (e.runs > 100) {
      console.warn(
        `⚠️  Effect "${e.name}" ran ${e.runs} times - ` +
        `may be expensive`
      );
    }
  });
}
```

 

## Advanced Inspection

### 1. Console Shortcuts

```javascript
// Create global shortcuts
window.dumpStates = () => {
  console.table(DevTools.getStates());
};

window.dumpHistory = () => {
  console.table(DevTools.getHistory().slice(-20));
};

window.clearDev = () => {
  DevTools.clearHistory();
  console.log('History cleared');
};

// Usage in console:
// > dumpStates()
// > dumpHistory()
// > clearDev()
```

 

### 2. Live Monitoring

```javascript
class LiveMonitor {
  constructor() {
    this.interval = null;
  }
  
  start(intervalMs = 1000) {
    this.interval = setInterval(() => {
      console.clear();
      
      const states = DevTools.getStates();
      const history = DevTools.getHistory();
      
      console.log('=== Live Monitor ===');
      console.log(`Time: ${new Date().toLocaleTimeString()}`);
      console.log(`States: ${states.length}`);
      console.log(`History: ${history.length}`);
      
      if (history.length > 0) {
        const latest = history[history.length - 1];
        console.log('\nLatest change:');
        console.log(`  ${latest.stateName}.${latest.key} = ${latest.newValue}`);
      }
    }, intervalMs);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

const monitor = new LiveMonitor();
monitor.start();
```

 

## Best Practices

### ✅ Do This

```javascript
// 1. Check history before operations
if (DevTools.getHistory().length > 100) {
  DevTools.clearHistory();
}

// 2. Use for debugging
const recent = DevTools.getHistory().slice(-10);
console.log('Recent changes:', recent);

// 3. Filter by relevance
const userChanges = DevTools.getHistory()
  .filter(c => c.stateName === 'User');

// 4. Clear periodically
setInterval(() => DevTools.clearHistory(), 60000);

// 5. Export for analysis
const report = {
  states: DevTools.getStates(),
  history: DevTools.getHistory()
};
```

### ❌ Don't Do This

```javascript
// 1. Don't assume history is empty
const history = DevTools.getHistory();
// Check length before using

// 2. Don't forget to clear in long sessions
// Memory builds up

// 3. Don't modify returned arrays
const states = DevTools.getStates();
states[0].name = 'NewName';  // Don't mutate
```

 

## Summary

**Inspection Methods:**
- `getStates()` - View tracked states
- `getHistory()` - View change log
- `clearHistory()` - Clear change log

**Key Points:**
- ✅ Use getStates() to see what's tracked
- ✅ Use getHistory() to review changes
- ✅ Clear history periodically
- ✅ Filter and analyze data
- ✅ Export for reporting

**Inspection Flow:**

```
getStates()     → See what's tracked
      ↓
getHistory()    → Review changes
      ↓
Analyze data    → Find patterns
      ↓
clearHistory()  → Free memory
```

**One-Line Rule:** Inspect tracked data regularly and clear history to prevent memory buildup.

**Remember:** Inspection methods show you what DevTools has recorded! 🎉