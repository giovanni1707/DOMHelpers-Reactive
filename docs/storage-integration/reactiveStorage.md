
# `reactiveStorage`

## Quick Start (30 seconds)

```javascript
// Create reactive storage
const storage = ReactiveUtils.reactiveStorage('localStorage', 'myapp');

// Set values
storage.set('theme', 'dark');
storage.set('count', 42);

// Get values
console.log(storage.get('theme')); // 'dark'

// Use in effects - automatically re-runs when storage changes
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
});

// Update from anywhere - effect runs automatically
storage.set('theme', 'light'); // Effect runs → body.className = 'light'
```

**What just happened?**
- ✅ Created a reactive wrapper around localStorage
- ✅ Effects track storage reads automatically
- ✅ Storage changes trigger effects to re-run
- ✅ Works across browser tabs!

 

## What is reactiveStorage?

**Simply put:** `reactiveStorage()` turns browser storage (localStorage/sessionStorage) into a reactive data store, just like reactive state.

Think of it as **localStorage with superpowers**:
- 🔄 Effects automatically track storage reads
- ✨ Storage changes trigger effects to re-run
- 🌐 Works across browser tabs
- 🎯 Namespace support to organize keys
- 📦 Automatic JSON serialization

**Regular localStorage:**
```javascript
// Manual, non-reactive
localStorage.setItem('count', '5');
const count = localStorage.getItem('count');
// Effects don't track this
```

**Reactive storage:**
```javascript
// Automatic, reactive
const storage = ReactiveUtils.reactiveStorage();
storage.set('count', 5);
const count = storage.get('count');
// Effects track this and re-run on changes!
```

 

## Why Does This Exist?

### The Problem: localStorage is Not Reactive

Regular localStorage doesn't integrate with reactive effects:

```javascript
const storage = localStorage;

// Create effect that depends on theme
effect(() => {
  const theme = storage.getItem('theme');
  document.body.className = theme;
});

// Update theme
storage.setItem('theme', 'dark');

// ❌ Effect doesn't run! DOM not updated!
```

**What's happening:**

```
User updates localStorage
   ↓
[No tracking mechanism]
   ↓
Effect doesn't know anything changed
   ↓
❌ UI not updated
```

**Problems:**
❌ Effects don't track localStorage reads  
❌ localStorage changes don't trigger effects  
❌ Must manually update UI after storage changes  
❌ No automatic cross-tab sync for effects  
❌ Manual polling required to detect changes  

### The Solution: reactiveStorage() Makes Storage Reactive

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Create effect
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
});

// Update theme
storage.set('theme', 'dark');

// ✅ Effect automatically runs! DOM updated!
```

**What's happening:**

```
User updates reactiveStorage
   ↓
[Reactive tracking system]
   ↓
Notifies all effects that depend on 'theme'
   ↓
Effect re-runs
   ↓
✅ UI updated automatically
```

**Benefits:**
✅ Effects track storage reads automatically  
✅ Storage changes trigger effects  
✅ Works like reactive state  
✅ Cross-tab sync built-in  
✅ Namespace support  

 

## Mental Model

Think of `reactiveStorage()` as **reactive state that lives in browser storage**:

### Regular Storage (Dumb)
```
localStorage
├─ Set value → No tracking
├─ Get value → No tracking
└─ Effects don't know about changes

❌ Manual UI updates needed
❌ No automatic reactivity
```

### Reactive Storage (Smart)
```
reactiveStorage()
├─ Set value → Tracks dependencies
├─ Get value → Registers effect
└─ Effects auto-run on changes

✅ Automatic UI updates
✅ Full reactivity
✅ Works like state()
```

**Key Insight:**  
`reactiveStorage()` makes browser storage behave like reactive state, so you can use it in effects and have UI update automatically.

 

## How Does It Work?

### Internal Architecture

```
Your Code                reactiveStorage            Browser Storage
────────────────────────────────────────────────────────────────────
storage.get('theme')  →  [Tracks in effect]    →  localStorage.getItem
        ↓                         ↓
[Effect registered]          [Proxy wrapper]
        ↓                         ↓
storage.set('theme') →  [Notifies effects]     →  localStorage.setItem
        ↓                         ↓
[Effect re-runs]            [Updates internal version]
```

### Tracking Mechanism

```javascript
const storage = ReactiveUtils.reactiveStorage();

// 1. Effect accesses storage
effect(() => {
  const theme = storage.get('theme'); // ← Tracks dependency
  console.log('Theme:', theme);
});

// 2. Storage updated
storage.set('theme', 'dark'); // ← Triggers notification

// 3. Effect re-runs
// → console.log('Theme: dark')
```

**Behind the scenes:**

```javascript
// Simplified internal structure
{
  _version: 0,                    // Increments on changes
  _keys: Set(['theme']),          // All stored keys
  _storage: localStorage,         // Actual storage
  _reactive: ReactiveState({...}) // Reactive wrapper
}
```

 

## Basic Usage

### Example 1: Theme Switcher

```javascript
const storage = ReactiveUtils.reactiveStorage('localStorage', 'myapp');

// Set initial theme
storage.set('theme', 'dark');

// Effect updates UI automatically
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
  console.log('Applied theme:', theme);
});

// Change theme - effect runs automatically
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = storage.get('theme');
  storage.set('theme', current === 'dark' ? 'light' : 'dark');
});
```

 

### Example 2: Live Counter

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Initialize counter
if (!storage.has('count')) {
  storage.set('count', 0);
}

// Display updates automatically
effect(() => {
  const count = storage.get('count');
  document.getElementById('counter').textContent = count;
});

// Increment button
document.getElementById('increment').addEventListener('click', () => {
  const current = storage.get('count');
  storage.set('count', current + 1);
});

// Effect automatically updates display!
```

 

### Example 3: User Preferences

```javascript
const prefs = ReactiveUtils.reactiveStorage('localStorage', 'user-prefs');

// Set defaults
prefs.set('fontSize', 16);
prefs.set('lineHeight', 1.5);
prefs.set('fontFamily', 'Arial');

// Apply preferences automatically
effect(() => {
  const fontSize = prefs.get('fontSize');
  const lineHeight = prefs.get('lineHeight');
  const fontFamily = prefs.get('fontFamily');
  
  document.body.style.fontSize = fontSize + 'px';
  document.body.style.lineHeight = lineHeight;
  document.body.style.fontFamily = fontFamily;
});

// Update preference
prefs.set('fontSize', 18); // Effect runs → UI updates
```

 

### Example 4: Multi-Key Effects

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Effect depends on multiple keys
effect(() => {
  const name = storage.get('name') || 'Guest';
  const score = storage.get('score') || 0;
  const level = storage.get('level') || 1;
  
  console.log(`${name} - Level ${level} - Score: ${score}`);
});

// Update any key - effect runs
storage.set('name', 'Alice');  // Effect runs
storage.set('score', 100);     // Effect runs
storage.set('level', 2);       // Effect runs
```

 

## API Reference

### Creating Reactive Storage

**Syntax:**
```javascript
ReactiveUtils.reactiveStorage(storageType?, namespace?)
```

**Parameters:**
- `storageType` (optional) - `'localStorage'` or `'sessionStorage'` (default: `'localStorage'`)
- `namespace` (optional) - String prefix for all keys (default: `''`)

**Returns:** Reactive storage proxy object

**Examples:**

```javascript
// Default (localStorage, no namespace)
const storage = ReactiveUtils.reactiveStorage();

// sessionStorage
const session = ReactiveUtils.reactiveStorage('sessionStorage');

// With namespace
const appStorage = ReactiveUtils.reactiveStorage('localStorage', 'myapp');
```

 

### set()

**Syntax:** `storage.set(key, value, options?)`

**Parameters:**
- `key` - Storage key (string)
- `value` - Any JSON-serializable value
- `options` (optional) - Object with:
  - `expires` - Expiration time in seconds

**Returns:** `boolean` (success status)

Set a value in storage:

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Basic set
storage.set('theme', 'dark');

// Set with expiration
storage.set('token', 'abc123', { expires: 3600 }); // 1 hour

// Set complex values
storage.set('user', { name: 'Alice', age: 30 });
storage.set('items', [1, 2, 3]);
```

**What gets stored:**
```javascript
// Internal format
{
  value: 'dark',
  timestamp: 1704470400000
}
```

**With expiration:**
```javascript
{
  value: 'abc123',
  timestamp: 1704470400000,
  expires: 1704474000000 // timestamp + 3600 seconds
}
```

 

### get()

**Syntax:** `storage.get(key)`

**Parameters:**
- `key` - Storage key (string)

**Returns:** Stored value or `null` if not found/expired

Get a value from storage:

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Get simple value
const theme = storage.get('theme'); // 'dark'

// Get complex value
const user = storage.get('user'); // { name: 'Alice', age: 30 }

// Get non-existent key
const missing = storage.get('nonexistent'); // null

// Get expired value
storage.set('temp', 'data', { expires: 1 });
// Wait 2 seconds...
const expired = storage.get('temp'); // null (automatically deleted)
```

**Reactive tracking:**
```javascript
// Accessing storage.get() in effect registers dependency
effect(() => {
  const theme = storage.get('theme'); // ← Effect tracks 'theme'
  console.log(theme);
});

// Effect re-runs when 'theme' changes
storage.set('theme', 'light'); // → Effect runs
```

 

### remove()

**Syntax:** `storage.remove(key)`

**Parameters:**
- `key` - Storage key (string)

**Returns:** `boolean` (success status)

Remove a value from storage:

```javascript
const storage = ReactiveUtils.reactiveStorage();

storage.set('temp', 'data');
console.log(storage.get('temp')); // 'data'

storage.remove('temp');
console.log(storage.get('temp')); // null
```

**Triggers effects:**
```javascript
effect(() => {
  const value = storage.get('key');
  console.log('Value:', value);
});

storage.set('key', 'data');  // Effect runs → 'Value: data'
storage.remove('key');       // Effect runs → 'Value: null'
```

 

### has()

**Syntax:** `storage.has(key)`

**Parameters:**
- `key` - Storage key (string)

**Returns:** `boolean`

Check if a key exists in storage:

```javascript
const storage = ReactiveUtils.reactiveStorage();

storage.set('theme', 'dark');

console.log(storage.has('theme'));      // true
console.log(storage.has('nonexistent')); // false

// Remove and check
storage.remove('theme');
console.log(storage.has('theme')); // false
```

**Also reactive:**
```javascript
effect(() => {
  if (storage.has('user')) {
    console.log('User is logged in');
  } else {
    console.log('User is logged out');
  }
});

storage.set('user', { name: 'Alice' }); // → 'User is logged in'
storage.remove('user');                 // → 'User is logged out'
```

 

### keys()

**Syntax:** `storage.keys()`

**Returns:** Array of all keys (strings)

Get all keys in storage:

```javascript
const storage = ReactiveUtils.reactiveStorage('localStorage', 'app');

storage.set('theme', 'dark');
storage.set('lang', 'en');
storage.set('fontSize', 16);

console.log(storage.keys());
// ['theme', 'lang', 'fontSize']
```

**With namespace:**
```javascript
// Only returns keys from this namespace
const appStorage = ReactiveUtils.reactiveStorage('localStorage', 'app');
appStorage.set('theme', 'dark');

const otherStorage = ReactiveUtils.reactiveStorage('localStorage', 'other');
otherStorage.set('data', 'value');

console.log(appStorage.keys());   // ['theme']
console.log(otherStorage.keys()); // ['data']
```

**Reactive tracking:**
```javascript
effect(() => {
  const allKeys = storage.keys();
  console.log('Keys:', allKeys);
});

storage.set('new', 'value'); // Effect runs → shows updated keys
storage.remove('old');       // Effect runs → shows updated keys
```

 

### clear()

**Syntax:** `storage.clear()`

**Returns:** `boolean` (success status)

Remove all keys from storage (respects namespace):

```javascript
const storage = ReactiveUtils.reactiveStorage('localStorage', 'myapp');

storage.set('a', 1);
storage.set('b', 2);
storage.set('c', 3);

console.log(storage.keys()); // ['a', 'b', 'c']

storage.clear();

console.log(storage.keys()); // []
```

**Only clears namespace:**
```javascript
const app1 = ReactiveUtils.reactiveStorage('localStorage', 'app1');
const app2 = ReactiveUtils.reactiveStorage('localStorage', 'app2');

app1.set('data', 'value1');
app2.set('data', 'value2');

app1.clear(); // Only clears 'app1' namespace

console.log(app1.get('data')); // null
console.log(app2.get('data')); // 'value2' ← Still exists
```

**Triggers effects:**
```javascript
effect(() => {
  const count = storage.keys().length;
  console.log(`Storage has ${count} keys`);
});

storage.clear(); // Effect runs → 'Storage has 0 keys'
```

 

## Reactive Behavior

### How Effects Track Storage

When you access storage in an effect, that effect automatically tracks the key:

```javascript
const storage = ReactiveUtils.reactiveStorage();

effect(() => {
  // Accessing storage.get() registers dependency
  const theme = storage.get('theme');
  console.log('Theme:', theme);
  
  // This effect now tracks the 'theme' key
});

// Updating 'theme' triggers the effect
storage.set('theme', 'dark'); // Effect runs
```

### Multiple Keys in One Effect

Effects can track multiple storage keys:

```javascript
effect(() => {
  const theme = storage.get('theme');     // Tracks 'theme'
  const lang = storage.get('lang');       // Tracks 'lang'
  const fontSize = storage.get('fontSize'); // Tracks 'fontSize'
  
  console.log(`${lang}: ${theme} theme, ${fontSize}px`);
});

// Updating ANY tracked key triggers the effect
storage.set('theme', 'dark');    // Effect runs
storage.set('lang', 'es');       // Effect runs
storage.set('fontSize', 18);     // Effect runs
```

### Computed Properties with Storage

You can create computed values based on storage:

```javascript
const storage = ReactiveUtils.reactiveStorage();
const app = state({});

// Computed property depends on storage
computed(app, {
  displayName: function() {
    const firstName = storage.get('firstName') || '';
    const lastName = storage.get('lastName') || '';
    return `${firstName} ${lastName}`.trim() || 'Guest';
  }
});

effect(() => {
  console.log('Display name:', app.displayName);
});

storage.set('firstName', 'Alice'); // Effect runs
storage.set('lastName', 'Smith');  // Effect runs
```

### Cross-Tab Reactivity

Effects automatically respond to storage changes from other tabs:

```javascript
const storage = ReactiveUtils.reactiveStorage();

effect(() => {
  const message = storage.get('message');
  console.log('Message:', message);
});

// Tab 1: storage.set('message', 'Hello from Tab 1');
// Tab 2: Effect automatically runs → 'Message: Hello from Tab 1'
```

**How it works:**

```
Tab 1                    localStorage                Tab 2
───────────────────────────────────────────────────────────────
set('message', ...)  →  [Saves to storage]   →  [Storage event]
                                                       ↓
                                                [reactiveStorage detects]
                                                       ↓
                                                [Notifies effects]
                                                       ↓
                                                [Effects re-run]
```

 

## Advanced Patterns

### Pattern 1: Derived Storage Values

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Store separate values
storage.set('cartItems', [
  { id: 1, price: 10 },
  { id: 2, price: 20 },
  { id: 3, price: 30 }
]);

// Compute total in effect
effect(() => {
  const items = storage.get('cartItems') || [];
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  document.getElementById('total').textContent = `$${total}`;
});

// Update items - total updates automatically
const items = storage.get('cartItems');
items.push({ id: 4, price: 15 });
storage.set('cartItems', items);
```

 

### Pattern 2: Storage-Backed State

Combine reactive state with storage:

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Create state that syncs with storage
const settings = state({
  theme: storage.get('theme') || 'dark',
  lang: storage.get('lang') || 'en'
});

// Sync state to storage
effect(() => {
  storage.set('theme', settings.theme);
});

effect(() => {
  storage.set('lang', settings.lang);
});

// Update state - automatically saves to storage
settings.theme = 'light'; // Saves to storage
settings.lang = 'es';     // Saves to storage
```

 

### Pattern 3: Conditional Storage Access

```javascript
const storage = ReactiveUtils.reactiveStorage();

effect(() => {
  const isLoggedIn = storage.get('isLoggedIn');
  
  if (isLoggedIn) {
    // Only access user data if logged in
    const user = storage.get('user');
    console.log('Welcome,', user.name);
  } else {
    console.log('Please log in');
  }
});

// Effect only tracks keys that were accessed
storage.set('isLoggedIn', false);
// Effect runs, doesn't access 'user'

storage.set('user', { name: 'Alice' });
// Effect doesn't run (not tracking 'user' because isLoggedIn is false)

storage.set('isLoggedIn', true);
// Effect runs, now accesses 'user'
```

 

### Pattern 4: Storage Namespaces for Multi-User

```javascript
function createUserStorage(userId) {
  return ReactiveUtils.reactiveStorage('localStorage', `user-${userId}`);
}

// Each user has isolated storage
const alice = createUserStorage('alice');
const bob = createUserStorage('bob');

alice.set('theme', 'dark');
bob.set('theme', 'light');

console.log(alice.get('theme')); // 'dark'
console.log(bob.get('theme'));   // 'light'

// Effects track per-user storage
effect(() => {
  const theme = alice.get('theme');
  console.log("Alice's theme:", theme);
});

alice.set('theme', 'auto'); // Effect runs
bob.set('theme', 'dark');   // Effect doesn't run (different namespace)
```

 

### Pattern 5: Storage-Powered Router

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Store current route
storage.set('route', '/home');

// Update UI based on route
effect(() => {
  const route = storage.get('route');
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });
  
  // Show current page
  const currentPage = document.querySelector(`[data-route="${route}"]`);
  if (currentPage) {
    currentPage.style.display = 'block';
  }
});

// Navigate
function navigate(route) {
  storage.set('route', route);
}

// Click link
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(link.getAttribute('href'));
  });
});

// Route persists across refreshes!
```

 

### Pattern 6: Feature Flags

```javascript
const flags = ReactiveUtils.reactiveStorage('localStorage', 'features');

// Set feature flags
flags.set('darkMode', true);
flags.set('betaFeatures', false);
flags.set('notifications', true);

// Conditionally show features
effect(() => {
  const darkMode = flags.get('darkMode');
  document.body.classList.toggle('dark', darkMode);
});

effect(() => {
  const beta = flags.get('betaFeatures');
  const betaPanel = document.getElementById('beta-features');
  betaPanel.style.display = beta ? 'block' : 'none';
});

// Toggle features
function toggleFeature(name) {
  const current = flags.get(name);
  flags.set(name, !current);
}
```

 

### Pattern 7: Synchronized Timers

```javascript
const storage = ReactiveUtils.reactiveStorage();

// Store timer state
storage.set('timerStart', null);
storage.set('timerRunning', false);

// Display timer in all tabs
effect(() => {
  const start = storage.get('timerStart');
  const running = storage.get('timerRunning');
  
  if (running && start) {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    document.getElementById('timer').textContent = `${elapsed}s`;
  } else {
    document.getElementById('timer').textContent = 'Stopped';
  }
});

// Start timer (syncs across tabs)
function startTimer() {
  storage.set('timerStart', Date.now());
  storage.set('timerRunning', true);
}

// Stop timer (syncs across tabs)
function stopTimer() {
  storage.set('timerRunning', false);
}

// Update display every second
setInterval(() => {
  if (storage.get('timerRunning')) {
    // Trigger effect update
    storage.set('timerRunning', true);
  }
}, 1000);
```

 

## Common Pitfalls

### Pitfall 1: Forgetting Namespaces Lead to Conflicts

```javascript
// ❌ Different apps share same keys
const app1Storage = ReactiveUtils.reactiveStorage();
const app2Storage = ReactiveUtils.reactiveStorage();

app1Storage.set('user', 'Alice');
app2Storage.set('user', 'Bob'); // Overwrites Alice!

console.log(app1Storage.get('user')); // 'Bob' (unexpected!)

// ✅ Use namespaces
const app1Storage = ReactiveUtils.reactiveStorage('localStorage', 'app1');
const app2Storage = ReactiveUtils.reactiveStorage('localStorage', 'app2');

app1Storage.set('user', 'Alice');
app2Storage.set('user', 'Bob');

console.log(app1Storage.get('user')); // 'Alice' ✓
console.log(app2Storage.get('user')); // 'Bob' ✓
```

 

### Pitfall 2: Not Handling Null Values

```javascript
// ❌ Assumes value exists
effect(() => {
  const user = storage.get('user');
  console.log(user.name); // Error if user is null!
});

// ✅ Check for null
effect(() => {
  const user = storage.get('user');
  if (user) {
    console.log(user.name);
  } else {
    console.log('No user');
  }
});

// ✅ Or provide default
effect(() => {
  const user = storage.get('user') || { name: 'Guest' };
  console.log(user.name);
});
```

 

### Pitfall 3: Storing Non-Serializable Data

```javascript
// ❌ Functions can't be stored
storage.set('handler', function() { console.log('hi'); });
console.log(storage.get('handler')); // null

// ❌ Circular references
const obj = { name: 'Alice' };
obj.self = obj;
storage.set('circular', obj); // Error!

// ✅ Store serializable data only
storage.set('config', {
  theme: 'dark',
  fontSize: 16,
  options: ['a', 'b', 'c']
});
```

 

### Pitfall 4: sessionStorage Doesn't Sync Across Tabs

```javascript
// ❌ Trying to sync sessionStorage
const session = ReactiveUtils.reactiveStorage('sessionStorage');

session.set('data', 'value');
// Tab 2 won't see this update (sessionStorage is per-tab)

// ✅ Use localStorage for cross-tab sync
const storage = ReactiveUtils.reactiveStorage('localStorage');

storage.set('data', 'value');
// Tab 2 will see this update
```

 

### Pitfall 5: Infinite Loops

```javascript
// ❌ Effect modifies same key it reads
const storage = ReactiveUtils.reactiveStorage();

effect(() => {
  const count = storage.get('count') || 0;
  storage.set('count', count + 1); // Triggers effect again → infinite loop!
});

// ✅ Only read in effects, write elsewhere
const storage = ReactiveUtils.reactiveStorage();

effect(() => {
  const count = storage.get('count') || 0;
  document.getElementById('display').textContent = count;
});

// Update from event handler, not effect
document.getElementById('increment').addEventListener('click', () => {
  const count = storage.get('count') || 0;
  storage.set('count', count + 1);
});
```

 

## Summary

**reactiveStorage() makes browser storage reactive, so effects automatically track and respond to storage changes.**

**Key Takeaways:**

1. **Create Reactive Storage:**
   ```javascript
   const storage = ReactiveUtils.reactiveStorage(storageType, namespace);
   ```

2. **Basic Operations:**
   - `set(key, value)` - Store value
   - `get(key)` - Retrieve value
   - `remove(key)` - Delete value
   - `has(key)` - Check existence
   - `keys()` - List all keys
   - `clear()` - Remove all

3. **Automatic Reactivity:**
   ```javascript
   effect(() => {
     const value = storage.get('key'); // Tracks 'key'
     // ... use value ...
   });
   
   storage.set('key', 'new'); // Effect runs automatically
   ```

4. **Cross-Tab Sync:**
   - Works automatically with localStorage
   - Effects in all tabs respond to changes
   - sessionStorage is per-tab only

5. **Namespaces:**
   ```javascript
   ReactiveUtils.reactiveStorage('localStorage', 'myapp');
   // Keys: 'myapp:key1', 'myapp:key2', etc.
   ```

**Quick Mental Model:**  
reactiveStorage() = localStorage + reactive state. Storage changes trigger effects, just like state changes do.

**Best Practices:**
- ✅ Use namespaces to avoid key conflicts
- ✅ Handle null values from `get()`
- ✅ Only store JSON-serializable data
- ✅ Use localStorage for cross-tab sync
- ✅ Don't modify storage in effects that read it

**Common Pattern:**
```javascript
const storage = ReactiveUtils.reactiveStorage('localStorage', 'myapp');

// Initialize
if (!storage.has('theme')) {
  storage.set('theme', 'dark');
}

// React to changes
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
});

// Update
storage.set('theme', 'light'); // UI updates automatically
```

reactiveStorage() turns browser storage into a reactive data store! 🎉
```

 
