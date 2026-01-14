
# `autoSave`

## Quick Start (30 seconds)

```javascript
// Create reactive state
const user = state({ name: 'Alice', score: 0 });

// Add auto-save
ReactiveUtils.autoSave(user, 'user-profile');

// That's it! Every change now saves automatically
user.name = 'Bob';  // ✅ Saved to localStorage
user.score = 100;   // ✅ Saved to localStorage

// Refresh page - data persists!
console.log(user.name);  // 'Bob' (loaded automatically)
console.log(user.score); // 100
```

**What just happened?**
- ✅ State automatically saves to localStorage on every change
- ✅ State automatically loads on page refresh
- ✅ Zero manual storage code needed

 

## What is autoSave?

**Simply put:** `autoSave()` connects your reactive state to browser storage (localStorage or sessionStorage) so data persists automatically across page refreshes.

Think of it as giving your reactive state a **permanent memory**:
- 💾 Every change automatically saves to storage
- 🔄 Data loads automatically when page reloads
- 🎯 No manual `localStorage.setItem()` or `localStorage.getItem()` needed
- ✨ Works with any reactive object (state, ref, collection, form)

**What it does:**
- Watches reactive state for changes
- Saves changes to browser storage automatically
- Loads saved data when creating the state
- Provides methods to manually save, load, or clear
- Supports cross-tab synchronization

 

## Why Does This Exist?

### The Manual Way is Tedious

Without `autoSave()`, persisting state requires manual storage code:

```javascript
// Create state
const settings = state({ theme: 'dark', volume: 50 });

// Load from storage manually
const saved = localStorage.getItem('settings');
if (saved) {
  const data = JSON.parse(saved);
  settings.theme = data.theme;
  settings.volume = data.volume;
}

// Save on every change manually
effect(() => {
  const data = { theme: settings.theme, volume: settings.volume };
  localStorage.setItem('settings', JSON.stringify(data));
});

// Update state
settings.theme = 'light'; // Must manually trigger save
```

**What's tedious here?**

```
User changes state
   ↓
[Manual JSON.stringify]
   ↓
[Manual localStorage.setItem]
   ↓
Page reloads
   ↓
[Manual localStorage.getItem]
   ↓
[Manual JSON.parse]
   ↓
[Manual state update]
```

**Problems:**
❌ Must write storage code for every state  
❌ Must manually serialize/deserialize JSON  
❌ Must handle loading and saving separately  
❌ Must create effects for auto-save  
❌ Easy to forget to save after updates  
❌ No built-in error handling  

### The autoSave() Way is Automatic

With `autoSave()`, persistence becomes one line:

```javascript
// Create state
const settings = state({ theme: 'dark', volume: 50 });

// Add auto-save
ReactiveUtils.autoSave(settings, 'settings');

// That's it! Everything else is automatic
settings.theme = 'light'; // ✅ Automatically saves
// Page reload → ✅ Automatically loads
```

**What's happening behind the scenes:**

```
User changes state
   ↓
[autoSave detects change automatically]
   ↓
[Serializes to JSON automatically]
   ↓
[Saves to localStorage automatically]
   ↓
Page reloads
   ↓
[autoSave loads data automatically]
   ↓
[Deserializes JSON automatically]
   ↓
[Updates state automatically]
```

**Benefits:**
✅ One line to enable persistence  
✅ Automatic serialization/deserialization  
✅ Automatic loading on creation  
✅ Automatic saving on changes  
✅ Built-in error handling  
✅ Works with all reactive types  

 

## Mental Model

Think of `autoSave()` as a **Smart Cloud Backup** for your state:

### Without autoSave (Manual Backup)
```
Your State (RAM only)
├─ Change data
├─ Manually click "Save"
├─ Manually type filename
└─ Hope you remembered to save!

❌ Lose data on refresh
❌ Must remember to save
❌ Tedious workflow
```

### With autoSave (Automatic Backup)
```
Your State + autoSave
├─ Change data  ──→  💾 Auto-saves immediately
├─ Close app    ──→  💾 Data preserved
└─ Reopen app   ──→  🔄 Data restored

✅ Never lose data
✅ Zero manual work
✅ Seamless experience
```

**Key Insight:**  
`autoSave()` makes your reactive state behave like it has **permanent memory**, even though it's JavaScript that normally forgets everything on refresh.

 

## How Does It Work?

### Internal Architecture

```
Your Reactive State          autoSave           Browser Storage
────────────────────────────────────────────────────────────────
state({ count: 0 })      →  [Loads saved data]  →  localStorage
        ↓                          ↓
counter.count = 5        →  [Detects change]    →  [Saves JSON]
        ↓                          ↓
Page refreshes           ←  [Restores data]     ←  localStorage
```

### What autoSave Tracks

**1. Initial Load:**
```javascript
const user = state({ name: 'Alice' });

// Before autoSave
console.log(user.name); // 'Alice' (default)

// After autoSave with existing data
ReactiveUtils.autoSave(user, 'user-profile');
console.log(user.name); // 'Bob' (loaded from storage!)
```

**2. Automatic Saves:**
```javascript
const user = state({ name: 'Alice', score: 0 });
ReactiveUtils.autoSave(user, 'user-profile');

// Every change triggers save
user.name = 'Bob';   // autoSave → saves { name: 'Bob', score: 0 }
user.score = 100;    // autoSave → saves { name: 'Bob', score: 100 }
```

**3. Data Structure in Storage:**
```javascript
// What gets stored in localStorage:
{
  "value": { "name": "Bob", "score": 100 },
  "timestamp": 1704470400000
}
```

 

## Basic Usage

### Example 1: Simple State Persistence

```javascript
// Create reactive state
const counter = state({ count: 0 });

// Enable auto-save
ReactiveUtils.autoSave(counter, 'my-counter');

// Update state
counter.count = 5;
// ✅ Automatically saved to localStorage['my-counter']

// Refresh the page and run this again:
const counter = state({ count: 0 });
ReactiveUtils.autoSave(counter, 'my-counter');
console.log(counter.count); // 5 (loaded automatically!)
```

### Example 2: Form State Persistence

```javascript
// Create form
const contactForm = form({
  name: '',
  email: '',
  message: ''
});

// Auto-save form data
ReactiveUtils.autoSave(contactForm, 'contact-form-draft');

// User types in form
contactForm.values.name = 'Alice';
contactForm.values.email = 'alice@example.com';

// User accidentally closes tab
// When they return:
const contactForm = form({
  name: '',
  email: '',
  message: ''
});
ReactiveUtils.autoSave(contactForm, 'contact-form-draft');

// Their draft is restored!
console.log(contactForm.values.name);  // 'Alice'
console.log(contactForm.values.email); // 'alice@example.com'
```

### Example 3: Collection Persistence

```javascript
// Create todo list
const todos = collection([
  { id: 1, text: 'Buy milk', done: false }
]);

// Auto-save todos
ReactiveUtils.autoSave(todos, 'my-todos');

// Add todo
todos.add({ id: 2, text: 'Walk dog', done: false });
// ✅ Saved automatically

// Mark as done
todos.items[0].done = true;
// ✅ Saved automatically

// Page refresh → todos persist!
```

### Example 4: Ref Persistence

```javascript
// Create ref
const username = ref('Guest');

// Auto-save
ReactiveUtils.autoSave(username, 'current-user');

// Update
username.value = 'Alice';
// ✅ Saved

// Page refresh
const username = ref('Guest');
ReactiveUtils.autoSave(username, 'current-user');
console.log(username.value); // 'Alice'
```

 

## Options Reference

### Full Syntax

```javascript
ReactiveUtils.autoSave(reactiveObj, key, {
  storage: 'localStorage',      // 'localStorage' or 'sessionStorage'
  namespace: '',                 // Prefix for storage key
  debounce: 0,                   // Delay before saving (ms)
  autoLoad: true,                // Load on creation
  autoSave: true,                // Save on changes
  sync: false,                   // Cross-tab sync
  expires: null,                 // Expiration time (seconds)
  onSave: (data) => data,        // Transform before saving
  onLoad: (data) => data,        // Transform after loading
  onSync: (data) => {},          // Called on cross-tab sync
  onError: (error, context) => {} // Error handler
});
```

### Option Details

#### `storage` (string)

**Default:** `'localStorage'`  
**Options:** `'localStorage'` | `'sessionStorage'`

Where to store the data:
- `localStorage` - Data persists forever (or until manually cleared)
- `sessionStorage` - Data persists only for current tab session

```javascript
// Persist forever
ReactiveUtils.autoSave(state, 'settings', {
  storage: 'localStorage'
});

// Persist only for tab session
ReactiveUtils.autoSave(state, 'temp-data', {
  storage: 'sessionStorage'
});
```

 

#### `namespace` (string)

**Default:** `''` (empty string)

Prefix added to storage key to prevent collisions:

```javascript
// Without namespace
ReactiveUtils.autoSave(user, 'profile');
// Stored as: localStorage['profile']

// With namespace
ReactiveUtils.autoSave(user, 'profile', {
  namespace: 'myapp'
});
// Stored as: localStorage['myapp:profile']
```

**When to use:**
- When multiple apps share same domain
- To organize related data
- To prevent key conflicts

```javascript
// Organize by feature
ReactiveUtils.autoSave(userState, 'profile', { namespace: 'user' });
ReactiveUtils.autoSave(cartState, 'items', { namespace: 'cart' });
ReactiveUtils.autoSave(settingsState, 'prefs', { namespace: 'settings' });

// Storage keys:
// 'user:profile'
// 'cart:items'
// 'settings:prefs'
```

 

#### `debounce` (number)

**Default:** `0` (save immediately)  
**Unit:** milliseconds

Delay before saving to reduce storage writes:

```javascript
// Save immediately (default)
ReactiveUtils.autoSave(state, 'data', {
  debounce: 0
});

// Wait 500ms before saving
ReactiveUtils.autoSave(state, 'data', {
  debounce: 500
});
```

**Example: High-frequency updates**

```javascript
const editor = state({ content: '' });

// Without debounce - saves on every keystroke
ReactiveUtils.autoSave(editor, 'draft'); // ❌ Too many saves

// With debounce - waits for typing to pause
ReactiveUtils.autoSave(editor, 'draft', {
  debounce: 1000 // Save 1 second after user stops typing
}); // ✅ Efficient
```

**Visual flow:**

```
User types: h
   ↓
[Start 1s timer]

User types: e
   ↓
[Reset timer]

User types: l
   ↓
[Reset timer]

User types: l
   ↓
[Reset timer]

User types: o
   ↓
[Reset timer]
   ↓
[1 second passes]
   ↓
💾 SAVE: "hello"
```

 

#### `autoLoad` (boolean)

**Default:** `true`

Whether to load saved data when `autoSave()` is called:

```javascript
// Load saved data automatically (default)
const user = state({ name: 'Default' });
ReactiveUtils.autoSave(user, 'user', {
  autoLoad: true
});
console.log(user.name); // Saved value (if exists)

// Don't load - keep initial values
const user = state({ name: 'Default' });
ReactiveUtils.autoSave(user, 'user', {
  autoLoad: false
});
console.log(user.name); // 'Default'
```

**When to disable:**
- When you want to manually control loading
- When initial values should always be used
- When loading should happen later

```javascript
// Manual load pattern
const settings = state({ theme: 'dark' });

ReactiveUtils.autoSave(settings, 'settings', {
  autoLoad: false
});

// Load only if user is logged in
if (userIsLoggedIn) {
  settings.load();
}
```

 

#### `autoSave` (boolean)

**Default:** `true`

Whether to automatically save on state changes:

```javascript
// Auto-save enabled (default)
ReactiveUtils.autoSave(state, 'data', {
  autoSave: true
});
state.value = 5; // ✅ Saves automatically

// Auto-save disabled
ReactiveUtils.autoSave(state, 'data', {
  autoSave: false
});
state.value = 5; // ❌ Doesn't save
state.save();    // ✅ Must save manually
```

**When to disable:**
- When you want manual control over saving
- When saving should happen at specific times
- For batch updates before saving

```javascript
const form = form({ /* ... */ });

ReactiveUtils.autoSave(form, 'draft', {
  autoSave: false
});

// Make multiple changes
form.values.name = 'Alice';
form.values.email = 'alice@example.com';
form.values.message = 'Hello';

// Save once at the end
form.save();
```

 

#### `sync` (boolean)

**Default:** `false`

Enable cross-tab synchronization (changes in one tab update other tabs):

```javascript
const counter = state({ count: 0 });

ReactiveUtils.autoSave(counter, 'shared-counter', {
  sync: true // Enable cross-tab sync
});

// Tab 1: counter.count = 5
// Tab 2: counter.count automatically becomes 5 ✨
```

**How it works:**

```
Tab 1                     localStorage                Tab 2
─────────────────────────────────────────────────────────────
counter.count = 5    →    [Updates]           →    [Detects change]
                                                         ↓
                                                    [Updates counter]
                                                         ↓
                                                    counter.count = 5
```

**See [Cross-Tab Synchronization](#cross-tab-synchronization) for details.**

 

#### `expires` (number)

**Default:** `null` (never expires)  
**Unit:** seconds

Set expiration time for stored data:

```javascript
// Expire after 1 hour
ReactiveUtils.autoSave(sessionData, 'session', {
  expires: 3600 // 60 * 60 = 1 hour
});

// Expire after 1 day
ReactiveUtils.autoSave(tempData, 'temp', {
  expires: 86400 // 60 * 60 * 24 = 1 day
});
```

**How expiration works:**

```javascript
// Save with expiration
const data = state({ token: 'abc123' });
ReactiveUtils.autoSave(data, 'auth', {
  expires: 3600 // 1 hour
});

// 30 minutes later
console.log(data.token); // 'abc123' (still valid)

// 2 hours later
const data = state({ token: '' });
ReactiveUtils.autoSave(data, 'auth', {
  expires: 3600
});
console.log(data.token); // '' (expired, not loaded)
```

**Common durations:**
```javascript
// 1 minute
expires: 60

// 1 hour
expires: 3600

// 1 day
expires: 86400

// 1 week
expires: 604800
```

 

#### `onSave` (function)

**Default:** `null`

Transform data before saving:

```javascript
const user = state({ password: '12345', email: 'test@example.com' });

ReactiveUtils.autoSave(user, 'user', {
  onSave: (data) => {
    // Remove sensitive data before saving
    const { password, ...safe } = data;
    return safe;
  }
});

// Saved data: { email: 'test@example.com' }
// password is NOT saved
```

**Use cases:**

1. **Remove sensitive data:**
```javascript
onSave: (data) => {
  const { password, creditCard, ...safe } = data;
  return safe;
}
```

2. **Add metadata:**
```javascript
onSave: (data) => {
  return {
    ...data,
    savedAt: new Date().toISOString(),
    version: '1.0'
  };
}
```

3. **Compress data:**
```javascript
onSave: (data) => {
  // Only save IDs, not full objects
  return {
    ...data,
    items: data.items.map(item => item.id)
  };
}
```

 

#### `onLoad` (function)

**Default:** `null`

Transform data after loading:

```javascript
const todos = collection([]);

ReactiveUtils.autoSave(todos, 'todos', {
  onLoad: (data) => {
    // Convert date strings to Date objects
    return data.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt)
    }));
  }
});
```

**Use cases:**

1. **Parse dates:**
```javascript
onLoad: (data) => {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  };
}
```

2. **Add default values:**
```javascript
onLoad: (data) => {
  return {
    version: '1.0',
    ...data
  };
}
```

3. **Migrate old data:**
```javascript
onLoad: (data) => {
  // Migrate v1 to v2 format
  if (!data.version) {
    return {
      ...data,
      version: 2,
      newField: 'default'
    };
  }
  return data;
}
```

 

#### `onSync` (function)

**Default:** `null`

Called when data syncs from another tab:

```javascript
const counter = state({ count: 0 });

ReactiveUtils.autoSave(counter, 'counter', {
  sync: true,
  onSync: (data) => {
    console.log('Synced from another tab!', data);
    // Show notification to user
    showNotification(`Counter updated to ${data.count}`);
  }
});
```

**Use cases:**

1. **Show notifications:**
```javascript
onSync: (data) => {
  toast('Data synced from another tab');
}
```

2. **Log sync events:**
```javascript
onSync: (data) => {
  console.log('[Sync]', new Date(), data);
}
```

3. **Handle conflicts:**
```javascript
onSync: (data) => {
  if (hasUnsavedChanges()) {
    if (confirm('Another tab updated data. Reload?')) {
      location.reload();
    }
  }
}
```

 

#### `onError` (function)

**Default:** `null`

Handle storage errors:

```javascript
const data = state({ /* ... */ });

ReactiveUtils.autoSave(data, 'data', {
  onError: (error, context) => {
    console.error(`Storage error during ${context}:`, error);
    
    if (error.name === 'QuotaExceededError') {
      alert('Storage full! Please clear some data.');
    }
  }
});
```

**Error contexts:**
- `'save'` - Error while saving
- `'load'` - Error while loading
- `'sync'` - Error during cross-tab sync
- `'quota'` - Storage quota exceeded
- `'getValue'` - Error getting value from state
- `'setValue'` - Error setting value to state

**Common error handling:**

```javascript
onError: (error, context) => {
  switch (error.name) {
    case 'QuotaExceededError':
      console.error('Storage full!');
      // Clear old data
      localStorage.clear();
      break;
      
    case 'SecurityError':
      console.error('Storage blocked (private browsing?)');
      break;
      
    default:
      console.error(`Error during ${context}:`, error);
  }
}
```

 

## Storage Methods

After calling `autoSave()`, your reactive object gains these methods:

### save()

**Syntax:** `reactiveObj.save()`  
**Returns:** `boolean` (success status)

Manually save current state immediately:

```javascript
const settings = state({ theme: 'dark' });
ReactiveUtils.autoSave(settings, 'settings', {
  autoSave: false // Disable auto-save
});

// Make changes
settings.theme = 'light';

// Manually save
const success = settings.save();
console.log(success); // true
```

**When to use:**
- When `autoSave: false`
- Before critical operations
- To force immediate save (bypass debounce)

 

### load()

**Syntax:** `reactiveObj.load()`  
**Returns:** `boolean` (success status)

Manually load data from storage:

```javascript
const settings = state({ theme: 'dark' });
ReactiveUtils.autoSave(settings, 'settings', {
  autoLoad: false
});

// Manually load
const success = settings.load();
console.log(success); // true if data existed
```

**When to use:**
- When `autoLoad: false`
- To reload data from storage
- To refresh after external changes

 

### clear()

**Syntax:** `reactiveObj.clear()`  
**Returns:** `boolean` (success status)

Remove data from storage:

```javascript
const user = state({ name: 'Alice' });
ReactiveUtils.autoSave(user, 'user');

// Clear storage
user.clear();

// Data removed from storage
// State in memory unchanged
console.log(user.name); // Still 'Alice'
```

**When to use:**
- On logout
- To reset persisted data
- To free storage space

 

### exists()

**Syntax:** `reactiveObj.exists()`  
**Returns:** `boolean`

Check if data exists in storage:

```javascript
const settings = state({ theme: 'dark' });
ReactiveUtils.autoSave(settings, 'settings');

if (settings.exists()) {
  console.log('Settings found in storage');
} else {
  console.log('No saved settings');
}
```

 

### stopAutoSave()

**Syntax:** `reactiveObj.stopAutoSave()`  
**Returns:** `reactiveObj` (for chaining)

Stop automatic saving:

```javascript
const data = state({ value: 0 });
ReactiveUtils.autoSave(data, 'data');

// Stop auto-saving
data.stopAutoSave();

// Changes no longer save automatically
data.value = 5; // ❌ Not saved

// Must save manually
data.save(); // ✅ Saved
```

 

### startAutoSave()

**Syntax:** `reactiveObj.startAutoSave()`  
**Returns:** `reactiveObj` (for chaining)

Resume automatic saving:

```javascript
const data = state({ value: 0 });
ReactiveUtils.autoSave(data, 'data');

data.stopAutoSave();
// ... do some work ...
data.startAutoSave();

// Auto-saving resumed
data.value = 5; // ✅ Saved automatically
```

 

### storageInfo()

**Syntax:** `reactiveObj.storageInfo()`  
**Returns:** `object` with storage metadata

Get information about stored data:

```javascript
const user = state({ name: 'Alice', bio: '...' });
ReactiveUtils.autoSave(user, 'user');

const info = user.storageInfo();
console.log(info);
// {
//   key: 'user',
//   namespace: '',
//   storage: 'localStorage',
//   exists: true,
//   size: 1234,
//   sizeKB: 1.2
// }
```

**Use cases:**

```javascript
// Check storage size
const info = state.storageInfo();
if (info.sizeKB > 100) {
  console.warn('State is taking up a lot of space!');
}

// Monitor storage usage
const states = [user, settings, cache];
const totalSize = states.reduce((sum, s) => 
  sum + s.storageInfo().sizeKB, 0
);
console.log(`Total storage: ${totalSize.toFixed(2)} KB`);
```

 

## Advanced Patterns

### Pattern 1: Save on User Action

```javascript
const form = form({ name: '', email: '' });

ReactiveUtils.autoSave(form, 'draft', {
  autoSave: false // Don't auto-save
});

// Save on "Save Draft" button
document.getElementById('save-btn').addEventListener('click', () => {
  form.save();
  alert('Draft saved!');
});
```

 

### Pattern 2: Periodic Auto-Save

```javascript
const editor = state({ content: '' });

ReactiveUtils.autoSave(editor, 'document', {
  autoSave: false
});

// Save every 30 seconds
setInterval(() => {
  editor.save();
  console.log('Auto-saved at', new Date());
}, 30000);
```

 

### Pattern 3: Save Before Unload

```javascript
const data = state({ /* ... */ });

ReactiveUtils.autoSave(data, 'data', {
  debounce: 1000
});

// Force save before page unload
window.addEventListener('beforeunload', () => {
  data.save(); // Bypass debounce
});
```

 

### Pattern 4: Conditional Persistence

```javascript
const settings = state({ theme: 'dark', savePreferences: true });

ReactiveUtils.autoSave(settings, 'settings', {
  onSave: (data) => {
    // Only save if user wants to
    return data.savePreferences ? data : null;
  }
});
```

 

### Pattern 5: Multiple States, One Key

```javascript
// Save multiple states to one storage key
const app = state({
  user: { name: 'Alice' },
  settings: { theme: 'dark' },
  cache: { lastVisit: Date.now() }
});

ReactiveUtils.autoSave(app, 'app-state');

// All sub-states persist together
app.user.name = 'Bob';
app.settings.theme = 'light';
// Both saved in one operation
```

 

### Pattern 6: Migration Between Versions

```javascript
const data = state({ value: 0 });

ReactiveUtils.autoSave(data, 'data', {
  onLoad: (loaded) => {
    // Detect old version
    if (!loaded.version) {
      console.log('Migrating from v1 to v2');
      return {
        version: 2,
        value: loaded.value || 0,
        newField: 'default'
      };
    }
    return loaded;
  },
  
  onSave: (data) => {
    // Always save with version
    return {
      ...data,
      version: 2
    };
  }
});
```

 

### Pattern 7: Encrypted Storage

```javascript
// Simple XOR encryption (use real crypto in production!)
function encrypt(data, key) {
  return btoa(JSON.stringify(data).split('').map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join(''));
}

function decrypt(encrypted, key) {
  const decrypted = atob(encrypted).split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
  return JSON.parse(decrypted);
}

const secret = state({ apiKey: 'abc123' });

ReactiveUtils.autoSave(secret, 'secret', {
  onSave: (data) => encrypt(data, 'my-secret-key'),
  onLoad: (data) => decrypt(data, 'my-secret-key')
});
```

 

## Cross-Tab Synchronization

### What is Cross-Tab Sync?

Cross-tab sync keeps state synchronized across multiple browser tabs:

```javascript
const counter = state({ count: 0 });

ReactiveUtils.autoSave(counter, 'counter', {
  sync: true
});

// Tab 1: counter.count = 5
// Tab 2: counter.count automatically updates to 5 ✨
// Tab 3: counter.count automatically updates to 5 ✨
```

### How It Works

```
Tab 1                  localStorage              Tab 2
───────────────────────────────────────────────────────────
counter.count = 5  →  [Saves: count=5]    →  [Storage event fired]
                                                     ↓
                                              [Reads: count=5]
                                                     ↓
                                              counter.count = 5
```

### Basic Example

```javascript
// In all tabs, run this same code:
const sharedState = state({ message: 'Hello' });

ReactiveUtils.autoSave(sharedState, 'shared', {
  sync: true,
  onSync: (data) => {
    console.log('Synced from another tab:', data);
  }
});

// In Tab 1:
sharedState.message = 'Hello from Tab 1';

// In Tab 2 (automatically):
console.log(sharedState.message); // 'Hello from Tab 1'
```

### Use Cases

**1. Shared Shopping Cart:**
```javascript
const cart = collection([]);

ReactiveUtils.autoSave(cart, 'shopping-cart', {
  sync: true
});

// Add to cart in Tab 1
cart.add({ id: 1, name: 'Product A' });

// Cart updates in Tab 2 automatically
```

**2. Live Collaboration:**
```javascript
const document = state({ 
  title: '', 
  content: '',
  lastEditor: ''
});

ReactiveUtils.autoSave(document, 'shared-doc', {
  sync: true,
  debounce: 500,
  onSync: (data) => {
    if (data.lastEditor !== currentUser) {
      showNotification(`${data.lastEditor} made changes`);
    }
  }
});
```

**3. Synchronized Settings:**
```javascript
const settings = state({ theme: 'dark', fontSize: 14 });

ReactiveUtils.autoSave(settings, 'app-settings', {
  sync: true
});

// Change theme in Tab 1
settings.theme = 'light';

// All tabs switch to light theme automatically
```

### Handling Sync Conflicts

```javascript
const editor = state({ 
  content: '',
  isDirty: false
});

ReactiveUtils.autoSave(editor, 'doc', {
  sync: true,
  onSync: (data) => {
    if (editor.isDirty) {
      // User has unsaved changes
      const choice = confirm(
        'Another tab updated this document. ' +
        'Reload and lose your changes?'
      );
      
      if (choice) {
        editor.content = data.content;
        editor.isDirty = false;
      }
    } else {
      // No conflict, update safely
      editor.content = data.content;
    }
  }
});

// Mark as dirty on edit
effect(() => {
  if (editor.content) {
    editor.isDirty = true;
  }
});
```

### Important Notes

**⚠️ Sync only works with localStorage:**
```javascript
// ✅ Works
ReactiveUtils.autoSave(state, 'data', {
  storage: 'localStorage',
  sync: true
});

// ❌ Doesn't work (sessionStorage is per-tab)
ReactiveUtils.autoSave(state, 'data', {
  storage: 'sessionStorage',
  sync: true
});
```

**⚠️ Prevent infinite loops:**

autoSave automatically prevents sync loops, but be careful with `onSync`:

```javascript
// ❌ BAD - Creates infinite loop
ReactiveUtils.autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    state.value = data.value + 1; // Triggers save → triggers sync → loops forever!
  }
});

// ✅ GOOD - Only reads synced data
ReactiveUtils.autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    console.log('Synced:', data); // Just log, don't modify
  }
});
```

 

## Common Pitfalls

### Pitfall 1: Forgetting to Handle Load Errors

```javascript
// ❌ Assumes data always loads
const user = state({ name: 'Guest' });
ReactiveUtils.autoSave(user, 'user');
console.log(user.name); // Might still be 'Guest' if load failed

// ✅ Check if loaded
const user = state({ name: 'Guest' });
ReactiveUtils.autoSave(user, 'user');

if (!user.exists()) {
  console.log('No saved user, showing onboarding');
  showOnboarding();
}
```

 

### Pitfall 2: Storing Too Much Data

```javascript
// ❌ Saving huge objects
const cache = state({ 
  responses: [] // Could get very large
});
ReactiveUtils.autoSave(cache, 'api-cache');

// ✅ Limit stored data
const cache = state({ responses: [] });
ReactiveUtils.autoSave(cache, 'api-cache', {
  onSave: (data) => {
    // Keep only last 50 responses
    return {
      responses: data.responses.slice(-50)
    };
  }
});
```

 

### Pitfall 3: Not Setting Expiration for Temporary Data

```javascript
// ❌ Session token persists forever
const auth = state({ token: 'abc123' });
ReactiveUtils.autoSave(auth, 'auth');

// ✅ Set expiration
const auth = state({ token: 'abc123' });
ReactiveUtils.autoSave(auth, 'auth', {
  expires: 3600 // 1 hour
});
```

 

### Pitfall 4: Debounce Too Short for High-Frequency Updates

```javascript
// ❌ Still saves too often
const cursor = state({ x: 0, y: 0 });
ReactiveUtils.autoSave(cursor, 'cursor', {
  debounce: 10 // Too short for mousemove
});

document.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

// ✅ Use longer debounce or disable auto-save
const cursor = state({ x: 0, y: 0 });
ReactiveUtils.autoSave(cursor, 'cursor', {
  autoSave: false
});

// Save on mouse stop only
let saveTimer;
document.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => cursor.save(), 1000);
});
```

 

### Pitfall 5: Not Cleaning Up on Logout

```javascript
// ❌ User data persists after logout
function logout() {
  window.location = '/login';
}

// ✅ Clear persisted data
function logout() {
  user.clear();
  session.clear();
  preferences.clear();
  window.location = '/login';
}
```

 

## Summary

**autoSave() makes reactive state persist automatically across page refreshes.**

**Key Takeaways:**

1. **One-Line Persistence:**
   ```javascript
   ReactiveUtils.autoSave(state, 'key');
   ```

2. **Automatic Loading:**
   - Data loads when `autoSave()` is called
   - Use `autoLoad: false` to disable

3. **Automatic Saving:**
   - Saves on every state change
   - Use `debounce` for high-frequency updates
   - Use `autoSave: false` for manual control

4. **Storage Options:**
   - `localStorage` - Persists forever
   - `sessionStorage` - Persists for tab session
   - `namespace` - Organize keys
   - `expires` - Auto-delete old data

5. **Transformations:**
   - `onSave` - Transform before saving
   - `onLoad` - Transform after loading

6. **Cross-Tab Sync:**
   ```javascript
   ReactiveUtils.autoSave(state, 'key', { sync: true });
   ```

7. **Storage Methods:**
   - `save()` - Manual save
   - `load()` - Manual load
   - `clear()` - Delete from storage
   - `exists()` - Check if exists
   - `storageInfo()` - Get metadata

**Quick Mental Model:**  
autoSave = Auto-sync between reactive state and browser storage. Like iCloud for your JavaScript state.

**Best Practices:**
- ✅ Use namespaces to organize keys
- ✅ Set expiration for temporary data
- ✅ Clear storage on logout
- ✅ Use debounce for high-frequency updates
- ✅ Transform data with `onSave`/`onLoad`
- ✅ Handle errors with `onError`

**Common Pattern:**
```javascript
const settings = state({ theme: 'dark', lang: 'en' });

ReactiveUtils.autoSave(settings, 'app-settings', {
  namespace: 'myapp',
  debounce: 500,
  expires: 86400 * 30, // 30 days
  onError: (error) => console.error('Storage error:', error)
});
```

autoSave() eliminates 90% of storage boilerplate code! 🎉

 