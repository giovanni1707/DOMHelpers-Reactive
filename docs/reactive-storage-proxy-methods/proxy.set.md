
# `proxy.set()` - Reactive Storage Proxy Set Method

## Quick Start (30 seconds)

```javascript
// Create a reactive storage proxy
const storage = reactiveStorage('localStorage', 'myApp');

// Set a value - automatically triggers reactivity!
storage.set('theme', 'dark');

// Watch it update in real-time
effect(() => {
  const theme = storage.get('theme');
  console.log('Theme changed to:', theme); // Logs: "Theme changed to: dark"
});

// Change it again - effect runs automatically
storage.set('theme', 'light'); // Logs: "Theme changed to: light"
```

**What just happened?** You stored data AND got automatic reactivity - any code watching that storage key will update instantly! ✨

  

## What is `proxy.set()`?

`proxy.set()` is a method that **stores a value in browser storage (localStorage or sessionStorage) and automatically triggers reactivity**. 

Simply put: it's like a regular storage setter, but with superpowers. When you set a value, any reactive code watching that storage key will automatically re-run.

Think of it as a **smart storage system** that not only saves your data but also notifies everyone who cares about it.

  

## Syntax

```javascript
// Basic usage
proxy.set(key, value)

// With options
proxy.set(key, value, options)
```

**Parameters:**
- `key` (string) - The storage key to set
- `value` (any) - The value to store (will be JSON.stringify'd)
- `options` (object, optional) - Configuration options
  - `expires` (number) - Time in seconds until the value expires

**Returns:** `boolean` - `true` if successful, `false` if failed

  

## Why Does This Exist?

### The Problem with Regular Storage

Here's how you'd normally work with localStorage:

```javascript
// Setting a value
localStorage.setItem('theme', 'dark');

// Manually updating UI
function updateTheme() {
  const theme = localStorage.getItem('theme');
  document.body.className = theme;
}

// You have to call updateTheme() manually every time!
localStorage.setItem('theme', 'light');
updateTheme(); // Don't forget this!

localStorage.setItem('theme', 'dark');
updateTheme(); // And this!

localStorage.setItem('theme', 'blue');
updateTheme(); // And this too!
```

**What's the Real Issue?**

```
Set value in storage
        |
        v
    [NOTHING HAPPENS] ❌
        |
        v
You must manually update UI
        |
        v
Easy to forget = Bugs!
```

**Problems:**
❌ **Manual synchronization** - You must manually update everything that depends on that value  
❌ **Easy to forget** - One missed update call = broken UI  
❌ **Scattered updates** - Update code lives far from storage code  
❌ **Not scalable** - More storage keys = more manual update calls  

### The Solution with `proxy.set()`

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Set up automatic UI updates
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
});

// Now just set - UI updates automatically!
storage.set('theme', 'light'); // UI updates ✨
storage.set('theme', 'dark');  // UI updates ✨
storage.set('theme', 'blue');  // UI updates ✨
```

**What Just Happened?**

```
proxy.set('theme', 'dark')
        |
        v
Stores in localStorage
        |
        v
Triggers reactivity ✨
        |
        v
All effects watching 'theme' re-run
        |
        v
UI updates automatically! ✅
```

**Benefits:**
✅ **Automatic updates** - Everything watching the value updates automatically  
✅ **Zero manual work** - Set once, forget about UI updates  
✅ **Centralized logic** - Update logic lives in effects, not scattered everywhere  
✅ **Scales perfectly** - Add more watchers without changing storage code  

  

## Mental Model

Think of regular `localStorage` as a **simple filing cabinet**:

```
Regular localStorage (Filing Cabinet)
┌─────────────────────┐
│  Put file in        │
│  drawer             │
│                     │
│  [DONE]             │
│                     │
│  Nobody knows       │
│  you added it       │
└─────────────────────┘
```

Now think of `proxy.set()` as a **smart filing system with notifications**:

```
proxy.set() (Smart Filing System)
┌─────────────────────┐
│  Put file in        │
│  drawer             │
│         |           │
│         v           │
│  Ring bell 🔔       │
│         |           │
│         v           │
│  Alert everyone     │
│  who subscribed     │
│         |           │
│         v           │
│  They all update!   │
└─────────────────────┘
```

**Key Insight:** `proxy.set()` doesn't just store - it **announces the change** so everyone interested can react automatically.

  

## How Does It Work?

Let's look under the hood at what happens when you call `proxy.set()`:

### Step-by-Step Process

**1️⃣ Store the Value**
```javascript
storage.set('theme', 'dark');
```

The method first stores your value in the actual browser storage:

```
User Data
    |
    v
JSON.stringify(value)
    |
    v
localStorage.setItem('myApp:theme', '{"value":"dark","timestamp":...}')
```

**2️⃣ Update Internal State**
```
Internal Reactive State:
{
  _version: 5,      // Incremented!
  _keys: Set(['theme', 'user', ...])  // Updated!
}
```

**3️⃣ Trigger Reactivity**
```
_version changed
    |
    v
All effects tracking _version re-run
    |
    v
They call storage.get('theme')
    |
    v
Get new value
    |
    v
Update UI! ✨
```

### The Magic: Version Tracking

Here's the clever trick:

```javascript
// Inside reactiveStorage()
const reactiveState = state({
  _version: 0,           // Changed every time set() is called
  _keys: new Set()       // Changed when keys are added/removed
});

// When you call proxy.get()
proxy.get = function(key) {
  const _ = reactiveState._version;  // ✨ Tracks dependency!
  return actualStorage.getItem(key);
}

// When you call proxy.set()
proxy.set = function(key, value) {
  actualStorage.setItem(key, value);
  reactiveState._version++;  // ✨ Triggers all watchers!
}
```

**What's happening?**
- Every `get()` call **tracks** the `_version` number
- Every `set()` call **increments** the `_version` number
- When `_version` changes, all effects that read it re-run
- Those effects call `get()` again and see the new value!

  

## Basic Usage

### Example 1: Store a Simple Value

```javascript
const storage = reactiveStorage('localStorage');

// Store a string
storage.set('username', 'Alice');

// Store a number
storage.set('score', 100);

// Store a boolean
storage.set('isDarkMode', true);

// Store an object (automatically JSON.stringify'd)
storage.set('user', {
  name: 'Alice',
  email: 'alice@example.com'
});

// Store an array
storage.set('favorites', ['apple', 'banana', 'orange']);
```

**What's happening?**
- Values are automatically serialized to JSON
- They're stored in the browser's storage
- The storage key is used as-is (no namespace in this example)

  

### Example 2: Store with Namespace

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// All keys are automatically prefixed with 'myApp:'
storage.set('theme', 'dark');
// Actually stores as: 'myApp:theme'

storage.set('language', 'en');
// Actually stores as: 'myApp:language'

console.log(localStorage.getItem('myApp:theme')); // '{"value":"dark",...}'
```

**Why use namespaces?**
- Prevents conflicts with other apps/libraries
- Makes it easy to clear all your app's data
- Organizes storage keys logically

  

### Example 3: Reactive UI Updates

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store initial value
storage.set('count', 0);

// Set up automatic UI update
effect(() => {
  const count = storage.get('count');
  document.getElementById('display').textContent = count;
});
// Display shows: 0

// Update value - UI updates automatically!
storage.set('count', 5);
// Display shows: 5 ✨

storage.set('count', 10);
// Display shows: 10 ✨
```

**What just happened?**
1. We set an initial value
2. We created an effect that reads the value
3. Every time we set a new value, the effect re-runs
4. The UI updates automatically without manual work!

  

## Setting Values with Options

### Expiring Values

You can set values that automatically expire after a certain time:

```javascript
const storage = reactiveStorage('localStorage');

// This value expires in 60 seconds
storage.set('sessionToken', 'abc123', {
  expires: 60  // seconds
});

// Check immediately
console.log(storage.get('sessionToken')); // 'abc123'

// Wait 61 seconds...
setTimeout(() => {
  console.log(storage.get('sessionToken')); // null (expired!)
}, 61000);
```

**How expiration works:**

```
storage.set('token', 'abc', { expires: 60 })
    |
    v
Stores: {
  value: 'abc',
  timestamp: 1704123456789,
  expires: 1704123456789 + 60000  // Current time + 60 seconds
}
    |
    v
When you get():
    |
    v
Check: Now > expires?
    |
    +  > YES: Return null, delete from storage
    |
    +  > NO: Return value
```

### Real-World Use Case: Temporary Tokens

```javascript
const storage = reactiveStorage('localStorage', 'auth');

function login(username, password) {
  const token = authenticateUser(username, password);
  
  // Store token that expires in 1 hour
  storage.set('authToken', token, {
    expires: 3600  // 1 hour in seconds
  });
}

// Later, check if user is still logged in
effect(() => {
  const token = storage.get('authToken');
  
  if (token) {
    console.log('User is logged in');
  } else {
    console.log('Session expired - please log in');
  }
});
```

  

## Reactive Updates

### Example 1: Multiple Watchers

One storage key can trigger multiple effects:

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Watcher 1: Update header
effect(() => {
  const theme = storage.get('theme');
  document.querySelector('header').className = theme;
});

// Watcher 2: Update body
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
});

// Watcher 3: Log changes
effect(() => {
  const theme = storage.get('theme');
  console.log('Theme changed to:', theme);
});

// One set() triggers all three effects!
storage.set('theme', 'dark');
// Header updates ✅
// Body updates ✅
// Console logs ✅
```

  

### Example 2: Cross-Component Synchronization

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Component 1: Settings Panel
function SettingsPanel() {
  effect(() => {
    const fontSize = storage.get('fontSize');
    document.getElementById('font-size-slider').value = fontSize;
  });
  
  document.getElementById('font-size-slider').oninput = (e) => {
    storage.set('fontSize', e.target.value);
  };
}

// Component 2: Article Display
function ArticleDisplay() {
  effect(() => {
    const fontSize = storage.get('fontSize');
    document.getElementById('article').style.fontSize = fontSize + 'px';
  });
}

// Change in settings panel automatically updates article!
// No manual coordination needed between components
```

  

### Example 3: Undo/Redo with Storage History

```javascript
const storage = reactiveStorage('localStorage', 'editor');
const history = [];
let historyIndex = -1;

// Track changes
effect(() => {
  const content = storage.get('content');
  if (content !== history[historyIndex]) {
    history.push(content);
    historyIndex++;
  }
});

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    storage.set('content', history[historyIndex]);
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    storage.set('content', history[historyIndex]);
  }
}

// Usage
storage.set('content', 'Hello');
storage.set('content', 'Hello World');
storage.set('content', 'Hello World!');

undo(); // Back to 'Hello World'
undo(); // Back to 'Hello'
redo(); // Forward to 'Hello World'
```

  

## Real-World Examples

### Example 1: Dark Mode Toggle

```javascript
const storage = reactiveStorage('localStorage', 'theme');

// Initialize with saved preference or default
if (!storage.has('darkMode')) {
  storage.set('darkMode', false);
}

// Apply theme automatically
effect(() => {
  const isDark = storage.get('darkMode');
  document.body.classList.toggle('dark-mode', isDark);
  
  // Update button text
  const button = document.getElementById('theme-toggle');
  button.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Toggle button
document.getElementById('theme-toggle').onclick = () => {
  const current = storage.get('darkMode');
  storage.set('darkMode', !current);
  // Everything updates automatically! ✨
};
```

  

### Example 2: Shopping Cart

```javascript
const storage = reactiveStorage('localStorage', 'shop');

// Initialize empty cart
if (!storage.has('cart')) {
  storage.set('cart', []);
}

// Update cart display automatically
effect(() => {
  const cart = storage.get('cart') || [];
  
  // Update count badge
  document.getElementById('cart-count').textContent = cart.length;
  
  // Update total
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
});

// Add to cart
function addToCart(product) {
  const cart = storage.get('cart') || [];
  cart.push(product);
  storage.set('cart', cart);
  // UI updates automatically! ✨
}

// Remove from cart
function removeFromCart(productId) {
  const cart = storage.get('cart') || [];
  const filtered = cart.filter(item => item.id !== productId);
  storage.set('cart', filtered);
  // UI updates automatically! ✨
}
```

  

### Example 3: Form Auto-Save

```javascript
const storage = reactiveStorage('localStorage', 'forms');

// Auto-save form data
const formState = state({
  name: '',
  email: '',
  message: ''
});

// Save to storage on every change
effect(() => {
  const data = {
    name: formState.name,
    email: formState.email,
    message: formState.message
  };
  storage.set('contactForm', data);
});

// Restore form data on page load
const saved = storage.get('contactForm');
if (saved) {
  formState.name = saved.name;
  formState.email = saved.email;
  formState.message = saved.message;
}

// Now user can refresh page and data is restored! ✨
```

  

## Common Patterns

### Pattern 1: Initialize If Missing

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Safe initialization
if (!storage.has('settings')) {
  storage.set('settings', {
    theme: 'light',
    language: 'en',
    notifications: true
  });
}
```

  

### Pattern 2: Update Object Properties

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Get current settings
const settings = storage.get('settings') || {};

// Update one property
settings.theme = 'dark';

// Save back
storage.set('settings', settings);
```

  

### Pattern 3: Batch Updates

```javascript
const storage = reactiveStorage('localStorage', 'app');

batch(() => {
  storage.set('firstName', 'John');
  storage.set('lastName', 'Doe');
  storage.set('email', 'john@example.com');
});
// All three updates trigger effects only once!
```

  

### Pattern 4: Conditional Storage

```javascript
const storage = reactiveStorage('localStorage', 'app');

function saveUserPreference(key, value) {
  // Only save if user is logged in
  const isLoggedIn = storage.get('isLoggedIn');
  
  if (isLoggedIn) {
    storage.set(key, value);
  } else {
    console.log('Not logged in - preference not saved');
  }
}
```

  

### Pattern 5: Validation Before Storage

```javascript
const storage = reactiveStorage('localStorage', 'app');

function setUserAge(age) {
  // Validate before storing
  if (typeof age !== 'number') {
    console.error('Age must be a number');
    return false;
  }
  
  if (age < 0 || age > 150) {
    console.error('Age must be between 0 and 150');
    return false;
  }
  
  return storage.set('userAge', age);
}
```

  

## Summary

**What is `proxy.set()`?**  
A method that stores values in browser storage AND triggers automatic reactivity - any code watching that storage key will update instantly.

**Why use it?**
- ✅ Automatic UI updates when storage changes
- ✅ No manual synchronization needed
- ✅ Multiple components can watch the same storage key
- ✅ Built-in expiration support for temporary data
- ✅ Namespace support to organize keys

**Key Takeaway:**

```
Regular Storage          proxy.set()
     |                       |
Set value              Set value
     |                       |
  [DONE]          Trigger all watchers
                            |
                    Everything updates! ✨
```

**One-Line Rule:** `proxy.set()` = localStorage + automatic notifications to all interested parties.

**When to use `proxy.set()`:**
- Storing user preferences that affect UI
- Shopping carts, wishlists, or other user data
- Form auto-save functionality
- Theme/language settings
- Any data that needs to stay synced across multiple UI components

**Remember:** Set once, update everywhere automatically! 🎉