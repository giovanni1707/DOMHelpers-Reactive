
#  `exists(state)`

## Quick Start (30 seconds)

**Check if saved data exists in localStorage:**

```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'appSettings');

// Check if data is saved
if (exists(settings)) {
  console.log('Settings found in storage!');
} else {
  console.log('No saved settings');
}
```

**That's it!** Returns `true` if data exists, `false` if not.

 

## What is exists()?

`exists()` is a function that **checks if your data is saved in localStorage**.

Simply put: **It's the "is there a save file?" check.**

```javascript
const user = state({ name: '' });
autoSave(user, 'user', { autoLoad: false });

if (exists(user)) {
  load(user); // Load it
} else {
  console.log('New user, starting fresh');
}
```

 

## Syntax

### Shorthand (Recommended)
```javascript
exists(state)
```

### Full Namespace
```javascript
ReactiveUtils.exists(state)
```

### Parameters
- **`state`** - A reactive state object with storage enabled

### Returns
- **`boolean`** - `true` if data exists in storage, `false` if not

 

## Why Does This Exist?

### The Challenge

You need to check if data is saved before loading:

**Without exists():**
```javascript
const draft = state({ text: '' });
autoSave(draft, 'draft', { autoLoad: false });

// Manually check localStorage
let hasDraft = false;
try {
  const saved = localStorage.getItem('draft');
  hasDraft = saved !== null;
} catch (error) {
  hasDraft = false;
}

if (hasDraft) {
  load(draft);
}
```

**What's tedious about this?**

❌ Manual localStorage access  
❌ Need to know exact key  
❌ Error handling needed  
❌ Verbose code  

### The Solution with exists()

```javascript
const draft = state({ text: '' });
autoSave(draft, 'draft', { autoLoad: false });

if (exists(draft)) {
  load(draft);
}
```

**What's better about this?**

✅ One simple function  
✅ Returns true/false  
✅ Safe error handling  
✅ Clean readable code  

This method is **especially useful when** you need to check before loading or show different UI based on saved data.

 

## Mental Model

Think of `exists()` as **checking if a save file exists** before loading a game.

### Without Check
```
Try to load save
   ↓
File not found → ERROR!
```

### With exists()
```
Check if save exists
   ↓
   Yes → Load it
   No  → Start new game
```

**Key Insight:** Check first, then decide what to do.

 

## How Does It Work?

When you call `exists()`:

```
Step 1: Check Method
   ↓
[Does state have $exists method?]
   ↓
   Yes → Continue
   No  → Return false
   ↓
Step 2: Check Storage
   ↓
[Check localStorage for key]
   ↓
   Found → Return true
   Not Found → Return false
```

 

## Basic Usage

### Example 1: Load if Exists

```javascript
const preferences = state({ theme: 'light' });
autoSave(preferences, 'prefs', { autoLoad: false });

if (exists(preferences)) {
  load(preferences);
  console.log('Loaded saved preferences');
} else {
  console.log('Using default preferences');
}
```

 

### Example 2: Show Different UI

```javascript
const draft = state({ text: '' });
autoSave(draft, 'draft', { autoLoad: false });

if (exists(draft)) {
  document.querySelector('#continueBtn').style.display = 'block';
  document.querySelector('#newBtn').style.display = 'none';
} else {
  document.querySelector('#continueBtn').style.display = 'none';
  document.querySelector('#newBtn').style.display = 'block';
}
```

 

### Example 3: Conditional Save

```javascript
const tempData = state({ value: 0 });
autoSave(tempData, 'temp');

function saveIfNeeded() {
  if (!exists(tempData)) {
    save(tempData);
    console.log('First save created');
  } else {
    console.log('Already saved');
  }
}
```

 

### Example 4: Migration Check

```javascript
const settings = state({ version: 2 });
autoSave(settings, 'settings', { autoLoad: false });

if (exists(settings)) {
  load(settings);
  
  // Check version
  if (settings.version < 2) {
    console.log('Migrating old settings...');
    migrateSettings(settings);
  }
} else {
  console.log('New installation');
}
```

 

## Deep Dive

### exists() is Non-Destructive

```javascript
const data = state({ value: 42 });
autoSave(data, 'data');

// Check multiple times
console.log(exists(data)); // true
console.log(exists(data)); // still true
console.log(exists(data)); // still true
// Checking doesn't affect storage
```

 

### Before and After clear()

```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings');

console.log(exists(settings)); // true

clear(settings);

console.log(exists(settings)); // false
```

 

### exists() vs load()

**exists()** just checks:
```javascript
const data = state({ value: 0 });
autoSave(data, 'data', { autoLoad: false });

const hasData = exists(data);
console.log(hasData); // true/false
console.log(data.value); // Still 0 (unchanged)
```

**load()** actually loads:
```javascript
const data = state({ value: 0 });
autoSave(data, 'data', { autoLoad: false });

load(data);
console.log(data.value); // Loaded from storage
```

**Use exists() when:** You just need to know if data is there  
**Use load() when:** You want to actually load the data

 

### With Different States

```javascript
const user = state({ name: '' });
const cart = state({ items: [] });
const settings = state({ theme: 'dark' });

autoSave(user, 'user');
autoSave(cart, 'cart');
autoSave(settings, 'settings');

console.log('User saved:', exists(user));
console.log('Cart saved:', exists(cart));
console.log('Settings saved:', exists(settings));
```

 

## Common Patterns

### Pattern 1: Welcome Back Message

```javascript
const user = state({ name: '', lastVisit: null });
autoSave(user, 'user', { autoLoad: false });

if (exists(user)) {
  load(user);
  console.log(`Welcome back, ${user.name}!`);
  console.log(`Last visit: ${user.lastVisit}`);
} else {
  console.log('Welcome, new user!');
}
```

 

### Pattern 2: Resume or Start New

```javascript
const game = state({ level: 1, score: 0 });
autoSave(game, 'savegame', { autoLoad: false });

function startGame() {
  if (exists(game)) {
    const resume = confirm('Continue from last save?');
    if (resume) {
      load(game);
      console.log('Resuming from level', game.level);
    } else {
      clear(game);
      console.log('Starting new game');
    }
  } else {
    console.log('Starting new game');
  }
}
```

 

### Pattern 3: Storage Health Check

```javascript
const states = [
  { state: user, name: 'user' },
  { state: settings, name: 'settings' },
  { state: cache, name: 'cache' }
];

function checkStorage() {
  states.forEach(({ state, name }) => {
    const status = exists(state) ? '✓' : '✗';
    console.log(`${status} ${name}`);
  });
}
```

 

### Pattern 4: Smart Loading

```javascript
const config = state({ api: '', timeout: 5000 });
autoSave(config, 'config', { autoLoad: false });

function loadConfig() {
  if (exists(config)) {
    load(config);
    console.log('Loaded saved config');
  } else {
    // Use defaults and save them
    console.log('Using default config');
    save(config);
  }
}
```

 

### Pattern 5: Data Migration

```javascript
const oldKey = state({ data: null });
const newKey = state({ data: null });

autoSave(oldKey, 'oldData', { autoLoad: false });
autoSave(newKey, 'newData', { autoLoad: false });

function migrate() {
  if (exists(oldKey) && !exists(newKey)) {
    console.log('Migrating old data...');
    load(oldKey);
    newKey.data = oldKey.data;
    save(newKey);
    clear(oldKey);
    console.log('Migration complete');
  }
}
```

 

## Summary

**What is exists()?**  
A function that checks if your data is saved in localStorage.

**Key Features:**
- ✅ Returns simple true/false
- ✅ Non-destructive (doesn't change anything)
- ✅ Safe to call anytime
- ✅ Handles namespaces automatically

**When to use it:**
- Before loading data
- Show "resume" vs "new" options
- Check if first-time user
- Conditional logic based on saved data
- Data migration checks

**Remember:**
```javascript
// Setup
autoSave(state, 'key', { autoLoad: false });

// Check before loading
if (exists(state)) {
  load(state);
} else {
  console.log('No saved data');
}
```

**Related Methods:**
- `load()` - Load from storage
- `save()` - Save to storage
- `clear()` - Remove from storage
- `storageInfo()` - Get storage details

 
