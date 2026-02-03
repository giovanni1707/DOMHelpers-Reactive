# `proxy.get()` - Reactive Storage Proxy Get Method

## Quick Start (30 seconds)

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Store a value
storage.set('username', 'Alice');

// Get it back - simple!
const username = storage.get('username');
console.log(username); // 'Alice'

// Use inside effect - automatic tracking!
effect(() => {
  const user = storage.get('username');
  document.getElementById('greeting').textContent = `Hello, ${user}!`;
});
// Changes to 'username' now update the UI automatically! ✨
```

**What just happened?** You retrieved data from storage, and when used inside an effect, it automatically tracks changes!

  

## What is `proxy.get()`?

`proxy.get()` is a method that **retrieves a value from browser storage and automatically tracks it for reactivity**.

Simply put: it's like a regular storage getter, but with awareness. When you read a value inside an effect or computed property, that code will automatically re-run when the value changes.

Think of it as a **smart retrieval system** that not only gives you data but also remembers you asked for it.

  

## Syntax

```javascript
// Basic usage
const value = proxy.get(key)
```

**Parameters:**
- `key` (string) - The storage key to retrieve

**Returns:** 
- The stored value (automatically parsed from JSON)
- `null` if the key doesn't exist or the value has expired

  

## Why Does This Exist?

### The Challenge with Regular Storage Reads

Here's how you'd traditionally work with localStorage:

```javascript
// Read a value
const theme = localStorage.getItem('theme');

// Use it
document.body.className = theme;

// Problem: If theme changes, nothing updates automatically!
localStorage.setItem('theme', 'dark');
// UI still shows old theme ❌

// You have to manually read and update again
const newTheme = localStorage.getItem('theme');
document.body.className = newTheme;
```

**What's the Issue?**

```
Read from storage
        |
        v
    Use value
        |
        v
Value changes in storage
        |
        v
   [NOTHING HAPPENS] ❌
        |
        v
Your code still has old value
```

**Problems:**
❌ **No automatic updates** - Changes don't propagate to existing code  
❌ **Manual polling** - You'd need to check storage repeatedly  
❌ **Stale data** - Your variables hold outdated information  
❌ **Disconnected code** - No link between storage changes and your logic  

### The Solution with `proxy.get()`

```javascript
const storage = reactiveStorage('localStorage');

// Read inside an effect
effect(() => {
  const theme = storage.get('theme');
  document.body.className = theme;
});
// UI shows current theme

// When storage changes...
storage.set('theme', 'dark');
// Effect automatically re-runs!
// UI updates! ✨
```

**What Just Happened?**

```
proxy.get('theme') inside effect
        |
        v
Tracks dependency on 'theme'
        |
        v
storage.set('theme', 'dark')
        |
        v
Detects 'theme' changed
        |
        v
Re-runs all effects watching 'theme'
        |
        v
They call get() again
        |
        v
Get new value & update! ✅
```

**Benefits:**
✅ **Automatic tracking** - Reading a value creates a reactive connection  
✅ **Zero configuration** - Just use `get()` inside effects  
✅ **Always fresh** - Your code always sees the latest value  
✅ **Connected updates** - Storage changes flow to all dependent code  

  

## Mental Model

Think of regular `localStorage.getItem()` as **reading a book from a library**:

```
Regular localStorage.getItem()
┌────────────────────┐
│  Go to library     │
│                    │
│  Find book         │
│                    │
│  Read it           │
│                    │
│  [DONE]            │
│                    │
│  If book updates,  │
│  you don't know    │
└────────────────────┘
```

Now think of `proxy.get()` as **subscribing to a book with notifications**:

```
proxy.get() (Smart Subscription)
┌────────────────────┐
│  Read book         │
│                    │
│  Sign up for       │
│  notifications 🔔  │
│                    │
│  When book         │
│  updates...        │
│        |           │
│        v           │
│  You get alert     │
│        |           │
│        v           │
│  Auto re-read! ✨  │
└────────────────────┘
```

**Key Insight:** `proxy.get()` doesn't just retrieve - it **creates a subscription** so you're notified of changes.

  

## How Does It Work?

Let's look under the hood at what happens when you call `proxy.get()`:

### Step-by-Step Process

**1️⃣ Read from Storage**
```javascript
const value = storage.get('theme');
```

First, it retrieves the actual value from browser storage:

```
Browser Storage (localStorage)
        |
        v
Get 'myApp:theme'
        |
        v
Parse JSON
        |
        v
Check expiration
        |
        v
Return value or null
```

**2️⃣ Track Dependency (if in effect)**
```
Is this call inside an effect?
        |
    YES |  NO
        |   └──> Just return value
        v
Track dependency on _version
        |
        v
Store reference to current effect
        |
        v
Return value
```

**3️⃣ Automatic Re-run on Change**
```
Later: storage.set() called
        |
        v
_version incremented
        |
        v
Effects tracking _version re-run
        |
        v
They call get() again
        |
        v
Get new value! ✨
```

### The Magic: Version Tracking

Here's how tracking works:

```javascript
// Inside reactiveStorage()
const reactiveState = state({
  _version: 0,     // Changes on every set()
  _keys: new Set()
});

// When you call get() inside an effect
proxy.get = function(key) {
  // ✨ This line tracks the dependency!
  const _ = reactiveState._version;
  
  // Now get the actual value
  return actualStorage.get(key);
}
```

**What's happening?**
- Reading `_version` inside an effect **tracks** that effect
- When `set()` changes `_version`, all tracked effects re-run
- Those effects call `get()` again and receive the new value!

**Visual representation:**

```
effect(() => {
  const theme = storage.get('theme');  // Reads _version (tracks!)
  useTheme(theme);
})
        |
        v
Tracked on _version
        |
        v
storage.set('theme', 'dark')  // Changes _version
        |
        v
Effect re-runs automatically ✨
```

  

## Basic Usage

### Example 1: Read Simple Values

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store some values first
storage.set('username', 'Alice');
storage.set('score', 100);
storage.set('isActive', true);

// Read them back
const username = storage.get('username');
console.log(username); // 'Alice'

const score = storage.get('score');
console.log(score); // 100

const isActive = storage.get('isActive');
console.log(isActive); // true
```

**What's happening?**
- Values are automatically parsed from JSON
- Original types are preserved (string, number, boolean)
- If key doesn't exist, returns `null`

  

### Example 2: Read Non-Existent Keys

```javascript
const storage = reactiveStorage('localStorage');

// Try to read a key that doesn't exist
const missing = storage.get('doesNotExist');
console.log(missing); // null

// Safe to use with default values
const theme = storage.get('theme') || 'light';
console.log(theme); // 'light' (the default)
```

  

### Example 3: Read Complex Objects

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store an object
storage.set('user', {
  name: 'Alice',
  email: 'alice@example.com',
  preferences: {
    theme: 'dark',
    language: 'en'
  }
});

// Read it back
const user = storage.get('user');
console.log(user.name); // 'Alice'
console.log(user.preferences.theme); // 'dark'

// Arrays too!
storage.set('tags', ['javascript', 'react', 'vue']);
const tags = storage.get('tags');
console.log(tags[0]); // 'javascript'
```

**What's happening?**
- Objects and arrays are automatically serialized/deserialized
- Nested structures are preserved
- You get back the same structure you stored

  

## Reactive Tracking

### Example 1: Basic Reactive Read

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Set initial value
storage.set('count', 0);

// Create reactive effect
effect(() => {
  const count = storage.get('count');
  console.log('Count is:', count);
});
// Immediately logs: "Count is: 0"

// Update the value
storage.set('count', 5);
// Automatically logs: "Count is: 5" ✨

storage.set('count', 10);
// Automatically logs: "Count is: 10" ✨
```

**What just happened?**
1. `get()` inside effect creates a subscription
2. When `set()` updates the value, effect re-runs
3. Effect calls `get()` again and sees new value
4. Console logs automatically!

  

### Example 2: Multiple Reactive Reads

```javascript
const storage = reactiveStorage('localStorage', 'app');

storage.set('firstName', 'Alice');
storage.set('lastName', 'Johnson');

// Effect watching both values
effect(() => {
  const first = storage.get('firstName');
  const last = storage.get('lastName');
  const full = `${first} ${last}`;
  
  document.getElementById('name').textContent = full;
});
// Shows: "Alice Johnson"

// Change first name
storage.set('firstName', 'Bob');
// Shows: "Bob Johnson" ✨

// Change last name
storage.set('lastName', 'Smith');
// Shows: "Bob Smith" ✨
```

**What's happening?**
- Effect tracks both storage keys
- Changing either one re-runs the effect
- UI always shows the current combination

  

### Example 3: Computed Values from Storage

```javascript
const storage = reactiveStorage('localStorage', 'shop');

storage.set('price', 100);
storage.set('quantity', 3);

// Computed total
const orderState = state({});

computed(orderState, {
  total: function() {
    const price = storage.get('price');
    const quantity = storage.get('quantity');
    return price * quantity;
  }
});

// Watch the computed total
effect(() => {
  console.log('Total:', orderState.total);
});
// Logs: "Total: 300"

// Change price
storage.set('price', 120);
// Logs: "Total: 360" ✨

// Change quantity
storage.set('quantity', 5);
// Logs: "Total: 600" ✨
```

**What's happening?**
- Computed property reads from storage
- Storage changes trigger computed recalculation
- Watchers see the updated computed value

  

## Reading Different Data Types

### Strings

```javascript
const storage = reactiveStorage('localStorage');

storage.set('message', 'Hello World');
const message = storage.get('message');
console.log(typeof message); // 'string'
console.log(message); // 'Hello World'
```

  

### Numbers

```javascript
const storage = reactiveStorage('localStorage');

storage.set('age', 25);
const age = storage.get('age');
console.log(typeof age); // 'number'
console.log(age); // 25
```

  

### Booleans

```javascript
const storage = reactiveStorage('localStorage');

storage.set('isLoggedIn', true);
const isLoggedIn = storage.get('isLoggedIn');
console.log(typeof isLoggedIn); // 'boolean'
console.log(isLoggedIn); // true
```

  

### Objects

```javascript
const storage = reactiveStorage('localStorage');

storage.set('config', {
  theme: 'dark',
  fontSize: 16,
  showSidebar: true
});

const config = storage.get('config');
console.log(typeof config); // 'object'
console.log(config.theme); // 'dark'
console.log(config.fontSize); // 16
```

  

### Arrays

```javascript
const storage = reactiveStorage('localStorage');

storage.set('colors', ['red', 'green', 'blue']);

const colors = storage.get('colors');
console.log(Array.isArray(colors)); // true
console.log(colors.length); // 3
console.log(colors[0]); // 'red'
```

  

### Null Values

```javascript
const storage = reactiveStorage('localStorage');

// Store null explicitly
storage.set('optional', null);
const optional = storage.get('optional');
console.log(optional); // null

// Non-existent key also returns null
const missing = storage.get('notThere');
console.log(missing); // null
```

  

## Real-World Examples

### Example 1: User Authentication Status

```javascript
const storage = reactiveStorage('localStorage', 'auth');

// Check login status and update UI
effect(() => {
  const token = storage.get('authToken');
  
  const loginButton = document.getElementById('login-btn');
  const logoutButton = document.getElementById('logout-btn');
  const userPanel = document.getElementById('user-panel');
  
  if (token) {
    // User is logged in
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    userPanel.style.display = 'block';
  } else {
    // User is logged out
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    userPanel.style.display = 'none';
  }
});

// Login sets the token
function login(username, password) {
  const token = authenticateUser(username, password);
  storage.set('authToken', token);
  // UI updates automatically! ✨
}

// Logout removes the token
function logout() {
  storage.remove('authToken');
  // UI updates automatically! ✨
}
```

  

### Example 2: Shopping Cart Total

```javascript
const storage = reactiveStorage('localStorage', 'shop');

// Display cart total
effect(() => {
  const cart = storage.get('cart') || [];
  
  const total = cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cart-count').textContent = cart.length;
});

// Add item to cart
function addToCart(product) {
  const cart = storage.get('cart') || [];
  cart.push(product);
  storage.set('cart', cart);
  // Total and count update automatically! ✨
}

// Remove item
function removeFromCart(index) {
  const cart = storage.get('cart') || [];
  cart.splice(index, 1);
  storage.set('cart', cart);
  // Total and count update automatically! ✨
}
```

  

### Example 3: Multi-Language Support

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Translation strings
const translations = {
  en: {
    welcome: 'Welcome',
    goodbye: 'Goodbye'
  },
  es: {
    welcome: 'Bienvenido',
    goodbye: 'Adiós'
  },
  fr: {
    welcome: 'Bienvenue',
    goodbye: 'Au revoir'
  }
};

// Update all text automatically when language changes
effect(() => {
  const lang = storage.get('language') || 'en';
  const strings = translations[lang];
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = strings[key];
  });
});

// Change language
function setLanguage(lang) {
  storage.set('language', lang);
  // All text updates automatically! ✨
}
```

  

### Example 4: Form Auto-Restore

```javascript
const storage = reactiveStorage('localStorage', 'forms');

// Save form as user types
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');

nameInput.oninput = (e) => {
  const draft = storage.get('contactDraft') || {};
  draft.name = e.target.value;
  storage.set('contactDraft', draft);
};

emailInput.oninput = (e) => {
  const draft = storage.get('contactDraft') || {};
  draft.email = e.target.value;
  storage.set('contactDraft', draft);
};

// Restore form on page load
window.onload = () => {
  const draft = storage.get('contactDraft');
  
  if (draft) {
    nameInput.value = draft.name || '';
    emailInput.value = draft.email || '';
    
    console.log('Form restored from storage! ✨');
  }
};
```

  

## Common Patterns

### Pattern 1: Safe Reading with Defaults

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Provide fallback if key doesn't exist
const theme = storage.get('theme') || 'light';
const lang = storage.get('language') || 'en';
const fontSize = storage.get('fontSize') || 16;

console.log(theme); // 'light' (if not set)
```

  

### Pattern 2: Destructuring Objects

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store user settings
storage.set('settings', {
  theme: 'dark',
  notifications: true,
  language: 'en'
});

// Read and destructure
effect(() => {
  const settings = storage.get('settings') || {};
  const { theme, notifications, language } = settings;
  
  applyTheme(theme);
  toggleNotifications(notifications);
  setLanguage(language);
});
```

  

### Pattern 3: Type Checking

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Safe type checking
effect(() => {
  const count = storage.get('count');
  
  if (typeof count === 'number') {
    console.log('Count is:', count);
  } else {
    console.log('Count not set or invalid');
  }
});
```

  

### Pattern 4: Array Operations

```javascript
const storage = reactiveStorage('localStorage', 'app');

effect(() => {
  const items = storage.get('items') || [];
  
  // Safe array operations
  if (Array.isArray(items)) {
    console.log('Total items:', items.length);
    
    const active = items.filter(item => item.active);
    console.log('Active items:', active.length);
  }
});
```

  

### Pattern 5: Nested Property Access

```javascript
const storage = reactiveStorage('localStorage', 'app');

effect(() => {
  const user = storage.get('user');
  
  // Safe nested access
  const email = user?.profile?.email || 'No email';
  const theme = user?.preferences?.theme || 'light';
  
  console.log('User email:', email);
  console.log('User theme:', theme);
});
```

  

### Pattern 6: Combining Multiple Storage Keys

```javascript
const storage = reactiveStorage('localStorage', 'app');

effect(() => {
  const user = storage.get('user');
  const settings = storage.get('settings');
  const cart = storage.get('cart') || [];
  
  // Combine data from multiple keys
  const display = {
    username: user?.name || 'Guest',
    theme: settings?.theme || 'light',
    cartCount: cart.length
  };
  
  updateUI(display);
});
```

  

## Summary

**What is `proxy.get()`?**  
A method that retrieves values from browser storage and automatically tracks them for reactivity when used inside effects or computed properties.

**Why use it?**
- ✅ Automatic dependency tracking
- ✅ Always returns fresh data
- ✅ Type preservation (string, number, object, array)
- ✅ Null-safe (returns null for missing keys)
- ✅ Works seamlessly with effects and computed properties

**Key Takeaway:**

```
localStorage.getItem()        proxy.get()
         |                         |
    Read value              Read value
         |                         |
      [DONE]               Track dependency
                                  |
                                  v
                          Auto-update on change! ✨
```

**One-Line Rule:** `proxy.get()` = localStorage.getItem() + automatic reactivity tracking.

**When to use `proxy.get()`:**
- Reading user preferences in reactive UI
- Displaying stored data that might change
- Building dashboard metrics from storage
- Any time you want automatic updates when storage changes

**Remember:** Read once, stay updated forever! 🎉