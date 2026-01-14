
#  `load(state)`

## Quick Start (30 seconds)

**Reload your state from localStorage:**

```javascript
const settings = state({ theme: 'dark', fontSize: 14 });
autoSave(settings, 'appSettings', { autoLoad: false });

// Later: load from storage
load(settings);

console.log(settings.theme);    // Whatever was saved
console.log(settings.fontSize); // Whatever was saved
```

**That's it!** Your state is refreshed from localStorage.

 

## What is load()?

`load()` is a function that **reads data from localStorage and updates your state**.

Simply put: **It's the "load from disk" button.**

```javascript
const userPrefs = state({ lang: 'en' });
autoSave(userPrefs, 'prefs');

// User changes computer
// Reload their preferences
load(userPrefs);
console.log(userPrefs.lang); // Their saved preference
```

 

## Syntax

### Shorthand (Recommended)
```javascript
load(state)
```

### Full Namespace
```javascript
ReactiveUtils.load(state)
```

### Parameters
- **`state`** - A reactive state object with storage enabled

### Returns
- **`boolean`** - `true` if loaded successfully, `false` if nothing to load or error

 

## Why Does This Exist?

### The Challenge with Storage

Sometimes you need to reload data from storage:

**Without load():**
```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings', { autoLoad: false });

// Manually reload from localStorage
try {
  const saved = localStorage.getItem('settings');
  if (saved) {
    const data = JSON.parse(saved);
    Object.assign(settings, data);
  }
} catch (error) {
  console.error('Load failed');
}
```

**What's tedious about this?**

❌ Manual localStorage access  
❌ Manual JSON parsing  
❌ Manual error handling  
❌ Manual state updating  

### The Solution with load()

```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings', { autoLoad: false });

// Reload with one line
load(settings);
```

**What's better about this?**

✅ One simple function call  
✅ Automatic error handling  
✅ Safe data parsing  
✅ Clean code  

This method is **especially useful when** you need manual control over when data loads or want to reload data on demand.

 

## Mental Model

Think of `load()` as **opening a saved game file**.

### Without load() (Manual Load)
```
Find save file
   ↓
Open file
   ↓
Parse the data
   ↓
Check if valid
   ↓
Update game state
   ↓
Handle errors
```

### With load() (One Button)
```
Press [LOAD GAME]
   ↓
Everything handled automatically
   ↓
Game state restored
```

**Key Insight:** All the complexity is hidden—just press load.

 

## How Does It Work?

When you call `load()`:

```
Step 1: Check
   ↓
[Does state have $load method?]
   ↓
   Yes → Continue
   No  → Return false
   ↓
Step 2: Read
   ↓
[Read from localStorage]
   ↓
   Found → Continue
   Not Found → Return false
   ↓
Step 3: Parse
   ↓
[Parse JSON data]
   ↓
Step 4: Update
   ↓
[Update state with loaded data]
   ↓
Step 5: Return
   ↓
[Return true if success]
```

 

## Basic Usage

### Example 1: Manual Load

```javascript
const prefs = state({ lang: 'en', notifications: true });
autoSave(prefs, 'userPrefs', { autoLoad: false });

// Load when user clicks button
document.querySelector('#loadBtn').addEventListener('click', () => {
  const success = load(prefs);
  
  if (success) {
    alert('Preferences loaded!');
  } else {
    alert('No saved preferences found');
  }
});
```

 

### Example 2: Reload on Demand

```javascript
const cart = state({ items: [] });
autoSave(cart, 'shoppingCart');

// Reload cart (maybe from another tab)
function refreshCart() {
  load(cart);
  console.log('Cart reloaded:', cart.items.length, 'items');
}
```

 

### Example 3: Conditional Load

```javascript
const gameState = state({
  level: 1,
  score: 0
});

autoSave(gameState, 'savegame', { autoLoad: false });

// Ask user if they want to load
if (confirm('Continue from last save?')) {
  if (load(gameState)) {
    console.log('Game loaded from level', gameState.level);
  } else {
    console.log('No save found, starting new game');
  }
}
```

 

### Example 4: Refresh After External Change

```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings');

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'settings') {
    load(settings);
    console.log('Settings updated from another tab');
  }
});
```

 

## Deep Dive

### Return Value Meaning

```javascript
const data = state({ value: 0 });
autoSave(data, 'myData', { autoLoad: false });

const loaded = load(data);

if (loaded) {
  console.log('✅ Data loaded from storage');
  console.log('Value:', data.value);
} else {
  console.log('❌ Nothing in storage or error occurred');
}
```

**Returns false when:**
- No data exists in storage
- Data is corrupted/invalid
- Storage is unavailable
- State doesn't have $load method

 

### load() vs autoLoad Option

**autoLoad: true** (default):
```javascript
// Loads automatically on creation
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings', { autoLoad: true });
// settings.theme is already loaded from storage
```

**autoLoad: false** + manual `load()`:
```javascript
// Doesn't load automatically
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings', { autoLoad: false });
console.log(settings.theme); // 'dark' (initial value)

// Load manually when ready
load(settings);
console.log(settings.theme); // Loaded from storage
```

**Use autoLoad:false + load() when:**
- You want user confirmation before loading
- You need to check something first
- You want to load at a specific time
- You're implementing custom load logic

 

### What Gets Loaded?

`load()` restores the data that was saved:

```javascript
const user = state({
  name: 'John',
  age: 25,
  email: 'john@example.com'
});

autoSave(user, 'user');

// Later, state is reset to defaults
user.name = 'Default';
user.age = 0;
user.email = '';

// Load from storage
load(user);

console.log(user.name);  // 'John' (from storage)
console.log(user.age);   // 25 (from storage)
console.log(user.email); // 'john@example.com' (from storage)
```

 

### Safe Loading

`load()` handles errors gracefully:

```javascript
const data = state({ value: 0 });
autoSave(data, 'data');

// Even if storage has bad data
localStorage.setItem('data', 'INVALID JSON{{{');

const success = load(data);
console.log(success); // false
console.log(data.value); // 0 (unchanged)
// No crash!
```

 

## Common Patterns

### Pattern 1: Load with Confirmation

```javascript
const editor = state({ document: '' });
autoSave(editor, 'draft', { autoLoad: false });

function startEditor() {
  if (exists(editor)) {
    if (confirm('Load saved draft?')) {
      load(editor);
      console.log('Draft loaded');
    } else {
      console.log('Starting fresh');
    }
  }
}
```

 

### Pattern 2: Reload Button

```javascript
const data = state({ items: [] });
autoSave(data, 'data');

document.querySelector('#reloadBtn').addEventListener('click', () => {
  const icon = document.querySelector('#reloadIcon');
  icon.classList.add('spinning');
  
  if (load(data)) {
    console.log('Data reloaded');
  }
  
  icon.classList.remove('spinning');
});
```

 

### Pattern 3: Sync Across Tabs

```javascript
const sharedState = state({ count: 0 });
autoSave(sharedState, 'shared');

// Listen for changes in other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'shared') {
    load(sharedState);
    console.log('Synced from another tab:', sharedState.count);
  }
});
```

 

### Pattern 4: Load with Fallback

```javascript
const config = state({
  apiUrl: 'https://api.example.com',
  timeout: 5000
});

autoSave(config, 'config', { autoLoad: false });

function loadConfig() {
  if (!load(config)) {
    console.log('No config found, using defaults');
    // Optionally save defaults
    save(config);
  }
}
```

 

### Pattern 5: Refresh on Focus

```javascript
const notifications = state({ list: [] });
autoSave(notifications, 'notifications');

// Reload when user returns to tab
window.addEventListener('focus', () => {
  load(notifications);
  console.log('Notifications refreshed');
});
```

 

## Summary

**What is load()?**  
A function that reads data from localStorage and updates your state.

**Key Features:**
- ✅ One-line reload
- ✅ Safe error handling
- ✅ Returns success status
- ✅ Works with any saved state

**When to use it:**
- Manual load control
- Reload buttons
- Cross-tab synchronization
- After external changes
- User confirmation before loading

**Remember:**
```javascript
// Setup storage
autoSave(state, 'key', { autoLoad: false });

// Load when ready
if (load(state)) {
  console.log('Loaded!');
}
```

**Related Methods:**
- `autoSave()` - Enable storage
- `save()` - Save to storage
- `exists()` - Check if saved data exists
- `clear()` - Remove from storage

 
