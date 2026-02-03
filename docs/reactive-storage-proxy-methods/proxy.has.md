# `proxy.has()` - Reactive Storage Proxy Has Method

## Quick Start (30 seconds)

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Check if a key exists
storage.set('username', 'Alice');
console.log(storage.has('username')); // true

// Use reactively - automatic tracking!
effect(() => {
  if (storage.has('authToken')) {
    console.log('User is logged in');
  } else {
    console.log('User is logged out');
  }
});

storage.set('authToken', 'abc123');  // Logs: "User is logged in"
storage.remove('authToken');         // Logs: "User is logged out" ✨
```

**What just happened?** You checked if data exists AND automatically tracked its presence - code updates when the key appears or disappears!

  

## What is `proxy.has()`?

`proxy.has()` is a method that **checks if a key exists in browser storage and automatically tracks that existence for reactivity**.

Simply put: it's like checking if a file exists, but reactive. When you check inside an effect, your code will automatically re-run when that key is added or removed.

Think of it as a **smart existence detector** that not only tells you if something is there but also watches for when it appears or disappears.

  

## Syntax

```javascript
// Check if key exists
const exists = proxy.has(key)
```

**Parameters:**
- `key` (string) - The storage key to check

**Returns:** 
- `boolean` - `true` if the key exists, `false` if it doesn't

  

## Why Does This Exist?

### The Challenge with Regular Existence Checks

Here's the traditional way:

```javascript
// Check if user is logged in
const hasToken = localStorage.getItem('authToken') !== null;

if (hasToken) {
  showDashboard();
} else {
  showLoginScreen();
}

// Later, user logs in
localStorage.setItem('authToken', 'abc123');

// Problem: UI doesn't update! ❌
// Still showing login screen
// hasToken variable still false
// Must manually check again and update UI

if (localStorage.getItem('authToken') !== null) {
  showDashboard();  // Manual update required!
}
```

**What's the Real Issue?**

```
Check if key exists
        |
        v
Store result in variable
        |
        v
Key added/removed from storage
        |
        v
    [NOTHING HAPPENS] ❌
        |
        v
Variable still has old value
        |
        v
Must manually re-check everywhere
```

**Problems:**
❌ **Stale checks** - Boolean result doesn't update when storage changes  
❌ **Manual re-checking** - Must explicitly check again after every change  
❌ **Scattered logic** - Existence checks duplicated throughout code  
❌ **Race conditions** - Easy to miss storage changes between checks  

### The Solution with `proxy.has()`

```javascript
const storage = reactiveStorage('localStorage', 'auth');

// Reactive existence check
effect(() => {
  if (storage.has('authToken')) {
    showDashboard();
  } else {
    showLoginScreen();
  }
});
// Shows login screen initially

// User logs in
storage.set('authToken', 'abc123');
// Effect automatically re-runs!
// Dashboard shows! ✨

// User logs out
storage.remove('authToken');
// Effect automatically re-runs!
// Login screen shows! ✨
```

**What Just Happened?**

```
storage.has('authToken') inside effect
        |
        v
Tracks key existence
        |
        v
storage.set('authToken', ...) called
        |
        v
Detects key now exists
        |
        v
Re-runs all effects watching existence
        |
        v
They call has() and get true
        |
        v
Update to show key exists! ✅
```

**Benefits:**
✅ **Automatic tracking** - Existence changes trigger dependent code  
✅ **Always current** - Check result always reflects current state  
✅ **Zero manual work** - No need to re-check manually  
✅ **Centralized logic** - One check, automatic everywhere  

  

## Mental Model

Think of regular existence checking as **looking in a drawer once**:

```
Regular localStorage check
┌─────────────────────┐
│  Open drawer        │
│                     │
│  Is item there?     │
│                     │
│  Yes/No             │
│                     │
│  [DONE]             │
│                     │
│  If item added/     │
│  removed later,     │
│  you don't know     │
└─────────────────────┘
```

Now think of `proxy.has()` as **installing a motion sensor**:

```
proxy.has() (Smart Sensor)
┌─────────────────────┐
│  Check drawer       │
│                     │
│  Install sensor 📡  │
│                     │
│  Item added?        │
│       |             │
│       v             │
│  Alert! ✨          │
│                     │
│  Item removed?      │
│       |             │
│       v             │
│  Alert! ✨          │
└─────────────────────┘
```

**Key Insight:** `proxy.has()` doesn't just check once - it **monitors** for when the key appears or disappears.

  

## How Does It Work?

Let's look under the hood at what happens when you call `proxy.has()`:

### Step-by-Step Process

**1️⃣ Check Storage**
```javascript
const exists = storage.has('authToken');
```

First, it checks the actual browser storage:

```
Browser Storage (localStorage)
        |
        v
Look for key 'myApp:authToken'
        |
        v
Key found? → Return true
Key missing? → Return false
```

**2️⃣ Track Dependency (if in effect)**
```
Is this call inside an effect?
        |
    YES |  NO
        |   └──> Just return boolean
        v
Track dependency on _keys
        |
        v
Store reference to current effect
        |
        v
Return boolean
```

**3️⃣ Automatic Re-run on Change**
```
Later: storage.set() or remove() called
        |
        v
_keys set updated
        |
        v
Effects tracking _keys re-run
        |
        v
They call has() again
        |
        v
Get new existence status! ✨
```

### The Magic: Keys Tracking

Here's how `has()` tracks changes:

```javascript
// Inside reactiveStorage()
const reactiveState = state({
  _version: 0,
  _keys: new Set(store.keys())  // Set of all current keys
});

// When you call has()
proxy.has = function(key) {
  // ✨ This line tracks the _keys set!
  const _ = reactiveState._keys;
  
  // Now check if key exists
  return actualStorage.has(key);
}

// When keys change
function notify() {
  batch(() => {
    reactiveState._version++;
    reactiveState._keys = new Set(store.keys());  // ✨ Triggers watchers!
  });
}
```

**What's happening?**
- `has()` reads `_keys` set to track it
- When `set()` or `remove()` changes keys, `_keys` updates
- All effects that read `_keys` automatically re-run
- They call `has()` again and see if key exists now

  

## Basic Usage

### Example 1: Simple Existence Check

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Set a value
storage.set('username', 'Alice');

// Check if it exists
console.log(storage.has('username')); // true
console.log(storage.has('email'));    // false

// Remove it
storage.remove('username');
console.log(storage.has('username')); // false
```

  

### Example 2: Check Before Reading

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Safe reading with existence check
if (storage.has('settings')) {
  const settings = storage.get('settings');
  console.log('Settings:', settings);
} else {
  console.log('No settings found - using defaults');
}
```

  

### Example 3: Multiple Key Checks

```javascript
const storage = reactiveStorage('localStorage', 'app');

storage.set('firstName', 'Alice');
storage.set('lastName', 'Johnson');

// Check multiple keys
const hasFirstName = storage.has('firstName');
const hasLastName = storage.has('lastName');
const hasEmail = storage.has('email');

console.log(hasFirstName); // true
console.log(hasLastName);  // true
console.log(hasEmail);     // false
```

  

## Reactive Existence Checks

### Example 1: Show/Hide Based on Existence

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Show welcome banner only if user hasn't dismissed it
effect(() => {
  const banner = document.getElementById('welcome-banner');
  
  if (!storage.has('bannerDismissed')) {
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
});

// Dismiss button
document.getElementById('dismiss-banner').onclick = () => {
  storage.set('bannerDismissed', true);
  // Banner hides automatically! ✨
};
```

  

### Example 2: Authentication State

```javascript
const storage = reactiveStorage('localStorage', 'auth');

// Reactive auth check
effect(() => {
  const isLoggedIn = storage.has('authToken');
  
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userPanel = document.getElementById('user-panel');
  
  if (isLoggedIn) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userPanel.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userPanel.style.display = 'none';
  }
});

// Login
function login(username, password) {
  const token = authenticate(username, password);
  storage.set('authToken', token);
  // UI updates automatically! ✨
}

// Logout
function logout() {
  storage.remove('authToken');
  // UI updates automatically! ✨
}
```

  

### Example 3: Feature Flags

```javascript
const storage = reactiveStorage('localStorage', 'features');

// Enable features based on flags
effect(() => {
  const hasNewUI = storage.has('enableNewUI');
  const hasDarkMode = storage.has('enableDarkMode');
  const hasDebug = storage.has('enableDebug');
  
  // Apply features
  document.body.classList.toggle('new-ui', hasNewUI);
  document.body.classList.toggle('dark-mode', hasDarkMode);
  console.debug = hasDebug ? console.log : () => {};
});

// Toggle features
function toggleFeature(feature) {
  if (storage.has(feature)) {
    storage.remove(feature);
  } else {
    storage.set(feature, true);
  }
  // Features update automatically! ✨
}

toggleFeature('enableDarkMode');
```

  

### Example 4: Conditional Rendering

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Render different content based on existence
effect(() => {
  const app = document.getElementById('app');
  
  if (storage.has('userData')) {
    const user = storage.get('userData');
    app.innerHTML = `
      <h1>Welcome back, ${user.name}!</h1>
      <button onclick="clearUserData()">Logout</button>
    `;
  } else {
    app.innerHTML = `
      <h1>Welcome!</h1>
      <button onclick="showLoginForm()">Login</button>
    `;
  }
});

function clearUserData() {
  storage.remove('userData');
  // UI switches to login automatically! ✨
}
```

  

## Real-World Examples

### Example 1: First-Time User Experience

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Show tutorial only for new users
effect(() => {
  if (!storage.has('tutorialCompleted')) {
    showTutorial();
  } else {
    showMainApp();
  }
});

function completeTutorial() {
  storage.set('tutorialCompleted', true);
  // Main app shows automatically! ✨
}

function resetTutorial() {
  storage.remove('tutorialCompleted');
  // Tutorial shows again! ✨
}
```

  

### Example 2: Shopping Cart Indicator

```javascript
const storage = reactiveStorage('localStorage', 'shop');

// Show cart badge only when cart has items
effect(() => {
  const badge = document.getElementById('cart-badge');
  
  if (storage.has('cart')) {
    const cart = storage.get('cart');
    badge.textContent = cart.length;
    badge.style.display = cart.length > 0 ? 'block' : 'none';
  } else {
    badge.style.display = 'none';
  }
});

// Add to cart
function addToCart(item) {
  const cart = storage.get('cart') || [];
  cart.push(item);
  storage.set('cart', cart);
  // Badge appears/updates automatically! ✨
}

// Clear cart
function clearCart() {
  storage.remove('cart');
  // Badge disappears automatically! ✨
}
```

  

### Example 3: Draft Detection

```javascript
const storage = reactiveStorage('localStorage', 'editor');

// Show "Continue Draft" button when draft exists
effect(() => {
  const continueBtn = document.getElementById('continue-draft');
  const newBtn = document.getElementById('new-document');
  
  if (storage.has('documentDraft')) {
    continueBtn.style.display = 'block';
    continueBtn.onclick = () => loadDraft();
  } else {
    continueBtn.style.display = 'none';
  }
});

function saveDraft(content) {
  storage.set('documentDraft', {
    content,
    timestamp: Date.now()
  });
  // "Continue Draft" button appears! ✨
}

function publishDocument(content) {
  // Save the published document
  saveToServer(content);
  
  // Clear draft
  storage.remove('documentDraft');
  // "Continue Draft" button disappears! ✨
}
```

  

### Example 4: Settings Initialization

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Initialize settings if they don't exist
effect(() => {
  if (!storage.has('settings')) {
    // Set defaults
    storage.set('settings', {
      theme: 'light',
      language: 'en',
      notifications: true
    });
  }
  
  // Now use settings
  const settings = storage.get('settings');
  applySettings(settings);
});

// Reset to defaults
function resetSettings() {
  storage.remove('settings');
  // Effect runs and sets defaults again! ✨
}
```

  

### Example 5: Session Management

```javascript
const storage = reactiveStorage('sessionStorage', 'app');

// Track active session
effect(() => {
  const hasSession = storage.has('activeSession');
  const sessionBar = document.getElementById('session-bar');
  
  if (hasSession) {
    const session = storage.get('activeSession');
    sessionBar.innerHTML = `
      Session active: ${session.username}
      <button onclick="endSession()">End</button>
    `;
    sessionBar.style.display = 'block';
  } else {
    sessionBar.style.display = 'none';
  }
});

function startSession(username) {
  storage.set('activeSession', {
    username,
    startTime: Date.now()
  });
  // Session bar appears! ✨
}

function endSession() {
  storage.remove('activeSession');
  // Session bar disappears! ✨
}
```

  

## Common Patterns

### Pattern 1: Check and Initialize

```javascript
const storage = reactiveStorage('localStorage', 'app');

function ensureExists(key, defaultValue) {
  if (!storage.has(key)) {
    storage.set(key, defaultValue);
  }
}

ensureExists('settings', { theme: 'light' });
ensureExists('favorites', []);
```

  

### Pattern 2: Toggle Pattern

```javascript
const storage = reactiveStorage('localStorage', 'app');

function toggle(key, value = true) {
  if (storage.has(key)) {
    storage.remove(key);
    return false;
  } else {
    storage.set(key, value);
    return true;
  }
}

toggle('darkMode');  // Turns on
toggle('darkMode');  // Turns off
```

  

### Pattern 3: Required Keys Check

```javascript
const storage = reactiveStorage('localStorage', 'app');

function hasRequiredData() {
  const required = ['username', 'email', 'settings'];
  return required.every(key => storage.has(key));
}

if (hasRequiredData()) {
  console.log('All required data present');
} else {
  console.log('Missing required data');
}
```

  

### Pattern 4: Conditional Defaults

```javascript
const storage = reactiveStorage('localStorage', 'app');

function getOrDefault(key, defaultValue) {
  return storage.has(key) 
    ? storage.get(key)
    : defaultValue;
}

const theme = getOrDefault('theme', 'light');
const lang = getOrDefault('language', 'en');
```

  

### Pattern 5: Batch Existence Check

```javascript
const storage = reactiveStorage('localStorage', 'app');

function checkMultiple(keys) {
  const results = {};
  keys.forEach(key => {
    results[key] = storage.has(key);
  });
  return results;
}

const status = checkMultiple(['user', 'settings', 'cache']);
console.log(status);
// { user: true, settings: true, cache: false }
```

  

### Pattern 6: Existence-Based Rendering

```javascript
const storage = reactiveStorage('localStorage', 'app');

const components = {
  onboarding: () => !storage.has('onboardingComplete'),
  dashboard: () => storage.has('userData'),
  settings: () => storage.has('preferences')
};

effect(() => {
  const app = document.getElementById('app');
  
  // Render first available component
  for (const [name, shouldShow] of Object.entries(components)) {
    if (shouldShow()) {
      app.innerHTML = renderComponent(name);
      return;
    }
  }
  
  // Fallback
  app.innerHTML = renderComponent('welcome');
});
```

  

## Summary

**What is `proxy.has()`?**  
A method that checks if a key exists in browser storage and automatically tracks that existence for reactivity when used in effects.

**Why use it?**
- ✅ Automatic tracking of key existence
- ✅ Updates when keys are added or removed
- ✅ Simplifies conditional logic
- ✅ Perfect for feature flags and toggles
- ✅ Clean way to handle optional data

**Key Takeaway:**

```
Regular Existence Check     proxy.has()
         |                       |
Check once                  Check once
         |                       |
     Get boolean           Track existence
         |                       |
      [DONE]              Monitor changes
                                 |
                                 v
                          Auto-update! ✨
```

**One-Line Rule:** `proxy.has()` = check if key exists + automatic tracking of appearance/disappearance.

**When to use `proxy.has()`:**
- Checking authentication state
- Feature flag systems
- Showing/hiding optional UI elements
- Detecting first-time users
- Shopping cart presence detection
- Draft existence indicators

**Remember:** Check once, stay informed forever! 🎉