# `options.namespace` - Namespace Prefix Configuration

## Quick Start (30 seconds)

```javascript
const userState = state({ name: 'Alice' });

// Without namespace - key stored as 'userData'
autoSave(userState, 'userData');

// With namespace - key stored as 'myApp:userData'
autoSave(userState, 'userData', {
  namespace: 'myApp'
});

// Multiple apps can coexist safely!
autoSave(userState, 'settings', { namespace: 'myApp' });
autoSave(userState, 'settings', { namespace: 'otherApp' });
// 'myApp:settings' and 'otherApp:settings' don't conflict ✨
```

**What just happened?** You added a prefix to your storage keys to prevent naming conflicts!

  

## What is `options.namespace`?

`options.namespace` is a configuration option that **adds a prefix to all storage keys to organize and isolate your app's data**.

Simply put: it's like having your own folder in a shared filing cabinet. Your data stays separate from everyone else's.

Think of it as **putting your app's name on all your stuff** so it doesn't get mixed up with others.

  

## Syntax

```javascript
autoSave(state, key, {
  namespace: string
})
```

**Value:**
- Any string (typically your app name)
- Becomes a prefix: `namespace:key`

**Default:** `''` (empty string - no namespace)

  

## Why Does This Exist?

### The Problem: Storage Key Collisions

Without namespaces, different apps/libraries can overwrite each other's data:

```javascript
// Your app
const userState = state({ name: 'Alice' });
autoSave(userState, 'settings');
// Stores as 'settings' in localStorage

// Another library also uses 'settings'
someLibrary.saveSettings({ theme: 'dark' });
// Overwrites your 'settings'! ❌

// Your app's settings are gone!
console.log(localStorage.getItem('settings'));
// Shows library's data, not yours ❌
```

**What's the Real Issue?**

```
Multiple apps/libraries
        |
        v
Use same key names
        |
        v
Last write wins
        |
        v
Data loss! ❌
```

**Problems:**
❌ **Key collisions** - Different apps use same keys  
❌ **Data loss** - One app overwrites another's data  
❌ **No isolation** - Can't tell which data belongs to whom  
❌ **Hard to debug** - Mysterious data corruption  

### The Solution with `options.namespace`

```javascript
// Your app
const userState = state({ name: 'Alice' });
autoSave(userState, 'settings', {
  namespace: 'myApp'
});
// Stores as 'myApp:settings'

// Another library
someLibrary.saveSettings({ theme: 'dark' });
// Stores as 'settings' (or 'otherApp:settings')

// No conflict! Both coexist safely ✅
console.log(localStorage.getItem('myApp:settings'));  // Your data
console.log(localStorage.getItem('settings'));         // Library's data
```

**What Just Happened?**

```
Add namespace prefix
        |
        v
'settings' → 'myApp:settings'
        |
        v
Each app has its own space
        |
        v
No collisions! ✅
```

**Benefits:**
✅ **Prevents collisions** - Each namespace is isolated  
✅ **Clean organization** - Easy to see what belongs to your app  
✅ **Safe to use common names** - 'settings', 'data', 'user' etc.  
✅ **Easy cleanup** - Clear all keys with specific prefix  

  

## Mental Model

Think of localStorage without namespaces as a **messy shared drawer**:

```
No Namespace (Shared Drawer)
┌─────────────────────┐
│  settings (yours?)  │
│  user (theirs?)     │
│  data (mine?)       │
│  config (?)         │
│                     │
│  Everything mixed!  │
│  Who owns what? ❌  │
└─────────────────────┘
```

Think of namespaces as **labeled folders**:

```
With Namespace (Organized Folders)
┌─────────────────────┐
│  myApp:             │
│    ├─ settings      │
│    ├─ user          │
│    └─ data          │
│                     │
│  otherApp:          │
│    ├─ settings      │
│    └─ config        │
│                     │
│  Everything clear ✅│
└─────────────────────┘
```

**Key Insight:** Namespaces give your app its own labeled space in shared storage.

  

## How Does It Work?

When you specify a namespace, autoSave prefixes all storage keys:

### Step-by-Step Process

**1️⃣ Configuration**
```javascript
autoSave(state, 'userData', {
  namespace: 'myApp'
});
```

**2️⃣ Key Transformation**
```
Original key: 'userData'
        |
        v
Add namespace prefix
        |
        v
Final key: 'myApp:userData'
        |
        v
Store with prefixed key
```

**3️⃣ Storage Operations**
```
Save:
  localStorage.setItem('myApp:userData', json)

Load:
  localStorage.getItem('myApp:userData')

Remove:
  localStorage.removeItem('myApp:userData')
```

**4️⃣ Key Listing**
```
Get all keys:
        |
        v
Filter by namespace
        |
        v
Return only 'myApp:*' keys
        |
        v
Strip prefix for display
```

  

## Basic Usage

### Example 1: Single Namespace

```javascript
const state1 = state({ count: 0 });
const state2 = state({ name: 'Alice' });

// All your app's data under 'myApp'
autoSave(state1, 'counter', { namespace: 'myApp' });
autoSave(state2, 'user', { namespace: 'myApp' });

// Storage:
// 'myApp:counter' → { count: 0 }
// 'myApp:user' → { name: 'Alice' }
```

  

### Example 2: Multiple Namespaces

```javascript
// Main app data
const appState = state({ theme: 'dark' });
autoSave(appState, 'settings', { namespace: 'app' });

// Plugin data
const pluginState = state({ enabled: true });
autoSave(pluginState, 'settings', { namespace: 'plugin' });

// Storage:
// 'app:settings' → { theme: 'dark' }
// 'plugin:settings' → { enabled: true }
// No conflict!
```

  

### Example 3: No Namespace (Global)

```javascript
const globalState = state({ apiUrl: 'https://api.example.com' });

// No namespace - stored as-is
autoSave(globalState, 'config');

// Storage:
// 'config' → { apiUrl: '...' }
```

  

## Real-World Examples

### Example 1: Multi-Tenant Application

```javascript
// Each customer gets their own namespace
function createCustomerData(customerId) {
  const customerState = state({
    name: '',
    preferences: {}
  });
  
  autoSave(customerState, 'data', {
    namespace: `customer_${customerId}`
  });
  
  return customerState;
}

// Customer A
const customerA = createCustomerData('123');
// Stores as 'customer_123:data'

// Customer B
const customerB = createCustomerData('456');
// Stores as 'customer_456:data'

// Data isolated per customer ✨
```

  

### Example 2: Plugin System

```javascript
// Core app
const coreState = state({ version: '1.0' });
autoSave(coreState, 'app', { namespace: 'core' });

// Plugin 1
const plugin1State = state({ enabled: true });
autoSave(plugin1State, 'config', { namespace: 'plugin1' });

// Plugin 2
const plugin2State = state({ theme: 'custom' });
autoSave(plugin2State, 'config', { namespace: 'plugin2' });

// Each plugin isolated:
// 'core:app'
// 'plugin1:config'
// 'plugin2:config'
```

  

### Example 3: Environment-Based Namespaces

```javascript
const env = process.env.NODE_ENV; // 'development' or 'production'

const appState = state({ settings: {} });

autoSave(appState, 'data', {
  namespace: `myApp_${env}`
});

// Development: 'myApp_development:data'
// Production: 'myApp_production:data'
// No conflict between environments!
```

  

### Example 4: Version-Based Namespaces

```javascript
const APP_VERSION = '2.0';

const userState = state({ preferences: {} });

autoSave(userState, 'user', {
  namespace: `myApp_v${APP_VERSION}`
});

// 'myApp_v2.0:user'

// When you update to v3.0:
// Old data: 'myApp_v2.0:user'
// New data: 'myApp_v3.0:user'
// Can migrate or start fresh!
```

  

### Example 5: Clear Namespace

```javascript
// Utility to clear all data in a namespace
function clearNamespace(namespace) {
  const prefix = `${namespace}:`;
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} keys from ${namespace}`);
}

// Usage
clearNamespace('myApp');
// Removes all 'myApp:*' keys
```

  

## Common Patterns

### Pattern 1: App-Wide Namespace

```javascript
const APP_NAMESPACE = 'myApp';

function createSavedState(key, initialData) {
  const stateObj = state(initialData);
  autoSave(stateObj, key, { namespace: APP_NAMESPACE });
  return stateObj;
}

// Use throughout app
const user = createSavedState('user', { name: '' });
const settings = createSavedState('settings', { theme: 'light' });
```

  

### Pattern 2: User-Specific Namespace

```javascript
function getUserNamespace(userId) {
  return `user_${userId}`;
}

function saveUserData(userId, data) {
  const userState = state(data);
  
  autoSave(userState, 'data', {
    namespace: getUserNamespace(userId)
  });
  
  return userState;
}

// Different users, isolated data
saveUserData('alice', { preferences: {} });
saveUserData('bob', { preferences: {} });
```

  

### Pattern 3: Feature Namespaces

```javascript
const namespaces = {
  auth: 'auth',
  cart: 'shopping',
  settings: 'preferences'
};

// Auth data
const authState = state({ token: '' });
autoSave(authState, 'session', { namespace: namespaces.auth });

// Cart data
const cartState = state({ items: [] });
autoSave(cartState, 'data', { namespace: namespaces.cart });
```

  

### Pattern 4: Nested Namespaces

```javascript
function createNestedNamespace(...parts) {
  return parts.join(':');
}

const namespace = createNestedNamespace('myApp', 'user', '123');
// 'myApp:user:123'

const userData = state({ name: 'Alice' });
autoSave(userData, 'profile', { namespace });
// Stores as 'myApp:user:123:profile'
```

  

### Pattern 5: Debug Namespace

```javascript
const namespace = process.env.NODE_ENV === 'development'
  ? 'myApp_dev'
  : 'myApp';

// Development: 'myApp_dev:*'
// Production: 'myApp:*'

// Can safely test without affecting production data
```

  

### Pattern 6: List All Namespace Keys

```javascript
function listNamespaceKeys(namespace) {
  const prefix = `${namespace}:`;
  const keys = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key.replace(prefix, ''));
    }
  }
  
  return keys;
}

const appKeys = listNamespaceKeys('myApp');
console.log('App storage keys:', appKeys);
// ['user', 'settings', 'cache']
```

  

## Summary

**What is `options.namespace`?**  
A configuration option that adds a prefix to all storage keys to organize and isolate your app's data from other apps and libraries.

**Why use it?**
- ✅ Prevents key name collisions
- ✅ Organizes storage by app/feature
- ✅ Enables safe use of common key names
- ✅ Makes bulk operations easier (clear all app data)
- ✅ Supports multi-tenant applications

**Key Takeaway:**

```
Without Namespace          With Namespace
       |                        |
   'settings'              'myApp:settings'
       |                        |
Name collisions            Isolated space
       |                        |
   Conflicts ❌             Safe storage ✅
```

**One-Line Rule:** Always use a namespace to give your app its own labeled space in storage.

**Best Practices:**
- Use your app name as namespace: `'myApp'`
- Keep namespaces short and lowercase
- Use consistent naming across your app
- Consider environment-specific namespaces for development

**Remember:** Namespace everything to avoid storage chaos! 🎉