# DevTools Methods Reference

## `DevTools.disable()` - Disable Development Tools

### Quick Start
```javascript
// Disable DevTools
DevTools.disable();

console.log(DevTools.enabled); // false
console.log(window.__REACTIVE_DEVTOOLS__); // undefined

// Tracking stops working
DevTools.trackState(state, 'Test'); // No effect
```

### What It Does
Deactivates DevTools and removes global window reference.

### When to Use
- Clean up after debugging session
- Programmatically disable based on conditions
- Reset DevTools state

  

## `DevTools.trackState(state, name)` - Track State Object

### Quick Start
```javascript
DevTools.enable();

const todoState = state({ items: [], count: 0 });
DevTools.trackState(todoState, 'TodoList');

// Changes now logged
todoState.count = 5;

DevTools.getHistory();
// Shows: TodoList.count changed from 0 to 5 ✨
```

### Parameters
- `state` - The reactive state object to track
- `name` - Descriptive name for this state (appears in logs)

### What It Does
Registers a state object for tracking. All changes to this state will be logged with the given name.

### Best Practices
```javascript
// ✅ Good: Descriptive names
DevTools.trackState(userState, 'UserProfile');
DevTools.trackState(cartState, 'ShoppingCart');

// ❌ Bad: Generic names
DevTools.trackState(state1, 'State');
DevTools.trackState(state2, 'Data');
```

  

## `DevTools.trackEffect(effect, name)` - Track Effect Function

### Quick Start
```javascript
DevTools.enable();

const counterEffect = effect(() => {
  console.log('Count:', state.count);
});

DevTools.trackEffect(counterEffect, 'CounterLogger');

// Effect runs tracked in DevTools
```

### Parameters
- `effect` - The effect function to track
- `name` - Descriptive name for this effect

### What It Does
Registers an effect for tracking. Records when effect runs and how many times.

### Example
```javascript
DevTools.enable();

// Track effect
const syncEffect = effect(() => {
  syncedState.value = localState.value;
});

DevTools.trackEffect(syncEffect, 'StateSynchronizer');

// View effect info
DevTools.effects.forEach((info, effect) => {
  console.log(`${info.name}: ran ${info.runs} times`);
});
```

  

## `DevTools.getStates()` - Get All Tracked States

### Quick Start
```javascript
DevTools.enable();

DevTools.trackState(state1, 'User');
DevTools.trackState(state2, 'Cart');

const states = DevTools.getStates();
console.log(states);
// [
//   { id: 1, name: 'User', created: 1234567890, state: {...} },
//   { id: 2, name: 'Cart', created: 1234567891, state: {...} }
// ]
```

### Returns
Array of tracked state objects with metadata:
- `id` - Unique state ID
- `name` - State name
- `created` - Timestamp when tracked
- `state` - The actual state object
- `updates` - Array of changes to this state

### Use Cases
```javascript
// List all tracked states
const states = DevTools.getStates();
console.log(`Tracking ${states.length} states`);

// Find specific state
const userState = states.find(s => s.name === 'User');

// Count updates per state
states.forEach(s => {
  console.log(`${s.name}: ${s.updates.length} updates`);
});
```

  

## `DevTools.getHistory()` - Get Change History

### Quick Start
```javascript
DevTools.enable();

const state = state({ count: 0, name: 'Test' });
DevTools.trackState(state, 'AppState');

state.count = 1;
state.count = 2;
state.name = 'Updated';

const history = DevTools.getHistory();
console.table(history);
// Shows all 3 changes with timestamps
```

### Returns
Array of change objects:
- `stateId` - ID of the state that changed
- `stateName` - Name of the state
- `key` - Property that changed
- `oldValue` - Previous value
- `newValue` - New value  
- `timestamp` - When change occurred

### Use Cases
```javascript
// Get recent changes
const recent = DevTools.getHistory().slice(-5);

// Filter by state name
const userChanges = DevTools.getHistory()
  .filter(h => h.stateName === 'User');

// Find when property changed
const themeChanges = DevTools.getHistory()
  .filter(h => h.key === 'theme');

// Timeline analysis
DevTools.getHistory().forEach(change => {
  const time = new Date(change.timestamp).toLocaleTimeString();
  console.log(`${time}: ${change.stateName}.${change.key} = ${change.newValue}`);
});
```

  

## `DevTools.clearHistory()` - Clear Change History

### Quick Start
```javascript
DevTools.enable();

// Make some changes...
state.value = 1;
state.value = 2;
state.value = 3;

console.log(DevTools.getHistory().length); // 3

// Clear history
DevTools.clearHistory();

console.log(DevTools.getHistory().length); // 0
```

### What It Does
Clears all logged state changes. Tracked states remain tracked.

### When to Use
```javascript
// Clear after each test
afterEach(() => {
  DevTools.clearHistory();
});

// Clear periodically to save memory
setInterval(() => {
  if (DevTools.history.length > 100) {
    DevTools.clearHistory();
    console.log('History cleared');
  }
}, 60000);

// Clear before important operations
function criticalOperation() {
  DevTools.clearHistory();
  // Now only this operation's changes logged
  performOperation();
  const changes = DevTools.getHistory();
  console.log('Operation made these changes:', changes);
}
```

  

## Complete Workflow Example

```javascript
// 1. Enable DevTools
DevTools.enable();

// 2. Track states
const user = state({ name: '', email: '' });
DevTools.trackState(user, 'UserProfile');

const settings = state({ theme: 'light' });
DevTools.trackState(settings, 'AppSettings');

// 3. Track effects
const themeEffect = effect(() => {
  document.body.className = settings.theme;
});
DevTools.trackEffect(themeEffect, 'ThemeApplicator');

// 4. Make changes
user.name = 'Alice';
user.email = 'alice@example.com';
settings.theme = 'dark';

// 5. Inspect results
console.log('Tracked states:', DevTools.getStates());
console.log('Change history:', DevTools.getHistory());

// 6. Analyze specific state
const userHistory = DevTools.getHistory()
  .filter(h => h.stateName === 'UserProfile');
console.table(userHistory);

// 7. Clear history
DevTools.clearHistory();

// 8. Disable when done
DevTools.disable();
```

  

## Properties Reference

### `DevTools.enabled`
```javascript
console.log(DevTools.enabled); // true/false
```

### `DevTools.states`
```javascript
// Direct access to states Map
DevTools.states.forEach((info, state) => {
  console.log(info.name, info.id);
});
```

### `DevTools.effects`
```javascript
// Direct access to effects Map
DevTools.effects.forEach((info, effect) => {
  console.log(info.name, info.runs);
});
```

### `DevTools.history`
```javascript
// Direct access to history array
console.log(DevTools.history.length);
console.log(DevTools.history[0]);
```

### `DevTools.maxHistory`
```javascript
// Get/set max history size
console.log(DevTools.maxHistory); // 50 (default)
DevTools.maxHistory = 100; // Increase limit
```

  

## Summary

**DevTools Methods:**
- `enable()` - Turn on DevTools
- `disable()` - Turn off DevTools
- `trackState(state, name)` - Track a state object
- `trackEffect(effect, name)` - Track an effect
- `getStates()` - Get all tracked states
- `getHistory()` - Get change history
- `clearHistory()` - Clear logged changes

**Key Takeaway:**
```
Enable → Track → Use App → Inspect → Clear → Disable
```

**Best Practices:**
- Enable early in development
- Use descriptive names for tracking
- Clear history periodically
- Disable in production
- Inspect via browser console

**Remember:** DevTools makes reactive debugging simple! 🎉