# `proxy.clear()` - Reactive Storage Proxy Clear Method

## Quick Start (30 seconds)

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Store some data
storage.set('username', 'Alice');
storage.set('theme', 'dark');
storage.set('language', 'en');

console.log(storage.keys().length); // 3

// Clear all data - triggers reactivity!
storage.clear();

console.log(storage.keys().length); // 0

// Watch for clearing
effect(() => {
  const count = storage.keys().length;
  
  if (count === 0) {
    console.log('Storage is empty');
  } else {
    console.log(`Storage has ${count} items`);
  }
});

storage.set('user', 'Bob');  // Logs: "Storage has 1 items"
storage.clear();             // Logs: "Storage is empty" ✨
```

**What just happened?** You cleared all storage data AND all watching code automatically updated to reflect the empty state!

  

## What is `proxy.clear()`?

`proxy.clear()` is a method that **removes all key-value pairs from the namespace in browser storage and automatically triggers reactivity**.

Simply put: it's like emptying a folder, but smart. When you clear storage, any code watching storage keys will automatically update to handle the empty state.

Think of it as a **smart reset button** that not only deletes everything but also notifies all dependent code.

  

## Syntax

```javascript
// Clear all keys in the namespace
proxy.clear()
```

**Parameters:**
- None

**Returns:** 
- `boolean` - `true` if successful, `false` if it failed

  

## Why Does This Exist?

### The Problem with Manual Clearing

Here's the traditional approach:

```javascript
// Manual clearing with regular localStorage
const keys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('myApp:')) {
    keys.push(key);
  }
}

// Remove each key
keys.forEach(key => {
  localStorage.removeItem(key);
});

// Problem: UI doesn't update! ❌
// Components still showing old data
// Lists still displaying items
// Must manually refresh everything

// Manual updates everywhere
updateUserPanel();
updateSettings();
updateCache();
// Easy to miss some!
```

**What's the Real Issue?**

```
Loop through keys
        |
        v
Remove each one
        |
        v
    [NOTHING HAPPENS] ❌
        |
        v
UI still shows old data
        |
        v
Must manually update everything
        |
        v
Easy to miss updates = bugs
```

**Problems:**
❌ **Silent clearing** - No notification to dependent code  
❌ **Complex logic** - Must find and filter keys manually  
❌ **Scattered updates** - Must update UI in many places  
❌ **Namespace leaks** - Easy to accidentally clear other apps' data  

### The Solution with `proxy.clear()`

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Set up reactive UI
effect(() => {
  const keys = storage.keys();
  const list = document.getElementById('items');
  
  if (keys.length === 0) {
    list.innerHTML = '<p>No items</p>';
  } else {
    list.innerHTML = keys.map(key => 
      `<div>${key}: ${storage.get(key)}</div>`
    ).join('');
  }
});

// Add some data
storage.set('username', 'Alice');
storage.set('theme', 'dark');
// List shows 2 items

// Clear everything
storage.clear();
// Effect automatically re-runs!
// List shows "No items" ✨
```

**What Just Happened?**

```
proxy.clear()
        |
        v
Deletes all keys in namespace
        |
        v
Triggers reactivity ✨
        |
        v
All effects watching storage re-run
        |
        v
They see empty storage
        |
        v
Update to empty state! ✅
```

**Benefits:**
✅ **Automatic updates** - All dependent code updates when cleared  
✅ **Namespace-safe** - Only clears your namespace, not others  
✅ **Single operation** - One call clears everything  
✅ **Consistent state** - Everything reflects empty storage immediately  

  

## Mental Model

Think of manual clearing as **emptying a folder by hand**:

```
Manual localStorage clearing
┌─────────────────────┐
│  Find each file     │
│  that's yours       │
│                     │
│  Delete one by one  │
│  (tedious loop)     │
│                     │
│  Hope you got them  │
│  all                │
│                     │
│  [DONE]             │
│                     │
│  People still think │
│  files exist        │
└─────────────────────┘
```

Now think of `proxy.clear()` as **hitting the master reset button**:

```
proxy.clear() (Master Reset)
┌─────────────────────┐
│  Press reset        │
│  button             │
│                     │
│  All files deleted  │
│  (in your space)    │
│                     │
│  Broadcast 📢       │
│  "Everything gone!" │
│        |            │
│        v            │
│  Everyone updates   │
│  to empty state ✨  │
└─────────────────────┘
```

**Key Insight:** `proxy.clear()` doesn't just delete - it **announces the mass deletion** so everyone can respond appropriately.

  

## How Does It Work?

Let's look under the hood at what happens when you call `proxy.clear()`:

### Step-by-Step Process

**1️⃣ Delete All Keys**
```javascript
storage.clear();
```

First, it removes all keys in the namespace:

```
Browser Storage (localStorage)
        |
        v
Find all 'myApp:*' keys
        |
        v
Delete each one
        |
        v
Namespace now empty
```

**2️⃣ Update Internal State**
```
Internal Reactive State:
{
  _version: 15,     // Incremented!
  _keys: Set([])    // Now empty!
}
```

**3️⃣ Trigger Reactivity**
```
_version changed AND _keys changed
        |
        v
All effects tracking storage re-run
        |
        v
They call keys() and get []
        |
        v
They call has() and get false
        |
        v
They call get() and get null
        |
        v
Everything updates to empty! ✨
```

### The Implementation

Here's the magic behind `proxy.clear()`:

```javascript
// Inside reactiveStorage()
const reactiveState = state({
  _version: 0,
  _keys: new Set(store.keys())
});

function notify() {
  batch(() => {
    reactiveState._version++;                    // ✨ Triggers watchers
    reactiveState._keys = new Set(store.keys()); // Now empty set!
  });
}

// The clear method
proxy.clear = function() {
  // Clear only keys in this namespace
  if (namespace) {
    const keys = store.keys();
    keys.forEach(key => store.remove(key));
  } else {
    store.storage.clear();
  }
  
  notify();  // ✨ Trigger reactivity!
  return true;
};
```

**What's happening?**
- `clear()` removes all keys in the namespace
- Updates `_version` and `_keys` to trigger watchers
- All effects that read from storage automatically re-run
- They see empty storage and update accordingly

  

## Basic Usage

### Example 1: Simple Clear

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store some data
storage.set('username', 'Alice');
storage.set('email', 'alice@example.com');
storage.set('theme', 'dark');

console.log(storage.keys().length); // 3

// Clear everything
storage.clear();

console.log(storage.keys().length); // 0
console.log(storage.get('username')); // null
```

  

### Example 2: Clear with Confirmation

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearWithConfirm() {
  if (confirm('Clear all data? This cannot be undone.')) {
    const success = storage.clear();
    
    if (success) {
      console.log('Storage cleared successfully');
    } else {
      console.error('Failed to clear storage');
    }
  }
}

document.getElementById('clear-btn').onclick = clearWithConfirm;
```

  

### Example 3: Clear and Reinitialize

```javascript
const storage = reactiveStorage('localStorage', 'app');

function resetToDefaults() {
  // Clear everything
  storage.clear();
  
  // Set default values
  storage.set('theme', 'light');
  storage.set('language', 'en');
  storage.set('notifications', true);
  
  console.log('Reset to defaults');
}
```

  

## Reactive Clearing

### Example 1: Empty State Display

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Show empty state when storage is cleared
effect(() => {
  const keys = storage.keys();
  const container = document.getElementById('content');
  
  if (keys.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No Data</h2>
        <p>Start by adding some items</p>
        <button onclick="addSampleData()">Add Sample Data</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <h2>${keys.length} Items</h2>
      <button onclick="clearAll()">Clear All</button>
    `;
  }
});

function clearAll() {
  storage.clear();
  // UI automatically shows empty state! ✨
}
```

  

### Example 2: Multi-Component Clearing

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Component 1: Header
effect(() => {
  const count = storage.keys().length;
  document.getElementById('item-count').textContent = 
    `${count} items`;
});

// Component 2: List
effect(() => {
  const keys = storage.keys();
  const list = document.getElementById('items-list');
  
  if (keys.length === 0) {
    list.innerHTML = '<li>No items</li>';
  } else {
    list.innerHTML = keys.map(key => 
      `<li>${key}</li>`
    ).join('');
  }
});

// Component 3: Actions
effect(() => {
  const count = storage.keys().length;
  const clearBtn = document.getElementById('clear-btn');
  
  clearBtn.disabled = count === 0;
  clearBtn.textContent = count > 0 
    ? `Clear ${count} items`
    : 'Nothing to clear';
});

// Clear - all three components update automatically!
function clearAll() {
  storage.clear();
  // Header shows 0 items ✅
  // List shows "No items" ✅
  // Button becomes disabled ✅
}
```

  

### Example 3: Progress During Clear

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Show progress while clearing large storage
async function clearWithProgress() {
  const keys = storage.keys();
  const total = keys.length;
  
  if (total === 0) {
    alert('Nothing to clear');
    return;
  }
  
  const progress = document.getElementById('progress');
  progress.style.display = 'block';
  progress.max = total;
  progress.value = 0;
  
  // Clear in batches for large datasets
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    
    batch.forEach(key => storage.remove(key));
    progress.value = Math.min(i + batchSize, total);
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  progress.style.display = 'none';
  // UI updates throughout the process! ✨
}
```

  

## Real-World Examples

### Example 1: Complete Logout

```javascript
const storage = reactiveStorage('localStorage', 'auth');

// Track authentication state
effect(() => {
  const count = storage.keys().length;
  const isLoggedIn = count > 0;
  
  const app = document.getElementById('app');
  
  if (isLoggedIn) {
    app.innerHTML = `
      <div class="user-area">
        <h2>Welcome!</h2>
        <p>You have ${count} items stored</p>
        <button onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    app.innerHTML = `
      <div class="login-area">
        <h2>Please Login</h2>
        <button onclick="login()">Login</button>
      </div>
    `;
  }
});

function login() {
  storage.set('authToken', 'abc123');
  storage.set('userId', '12345');
  storage.set('sessionStart', Date.now());
  // UI shows user area ✨
}

function logout() {
  storage.clear();
  // UI switches to login ✨
}
```

  

### Example 2: Clear Cache

```javascript
const storage = reactiveStorage('localStorage', 'cache');

// Show cache status
effect(() => {
  const keys = storage.keys();
  const status = document.getElementById('cache-status');
  
  // Calculate total size
  let totalSize = 0;
  keys.forEach(key => {
    const value = storage.get(key);
    totalSize += JSON.stringify(value).length;
  });
  
  const sizeKB = (totalSize / 1024).toFixed(2);
  
  status.innerHTML = `
    <p>Cache: ${keys.length} items (${sizeKB} KB)</p>
    <button 
      onclick="clearCache()" 
      ${keys.length === 0 ? 'disabled' : ''}>
      Clear Cache
    </button>
  `;
});

function clearCache() {
  storage.clear();
  showToast('Cache cleared successfully');
  // Status updates automatically! ✨
}
```

  

### Example 3: Reset Application

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Monitor app state
effect(() => {
  const keys = storage.keys();
  const isInitialized = keys.length > 0;
  
  if (!isInitialized) {
    showOnboarding();
  } else {
    showMainApp();
  }
});

// Complete reset
function resetApplication() {
  const confirmed = confirm(
    'Reset application to defaults? All data will be lost.'
  );
  
  if (confirmed) {
    // Clear all data
    storage.clear();
    
    // Set defaults
    storage.set('version', '1.0.0');
    storage.set('firstRun', Date.now());
    storage.set('settings', {
      theme: 'light',
      language: 'en'
    });
    
    // App restarts with defaults! ✨
  }
}
```

  

### Example 4: Session Expiry

```javascript
const storage = reactiveStorage('sessionStorage', 'session');

// Monitor session
effect(() => {
  const count = storage.keys().length;
  const sessionActive = count > 0;
  
  const indicator = document.getElementById('session-indicator');
  
  if (sessionActive) {
    indicator.textContent = '🟢 Active';
    indicator.className = 'active';
  } else {
    indicator.textContent = '🔴 Expired';
    indicator.className = 'expired';
  }
});

// Start session
function startSession(userData) {
  storage.set('user', userData);
  storage.set('startTime', Date.now());
  storage.set('token', generateToken());
  // Indicator shows active ✨
}

// End session (timeout or manual)
function endSession() {
  storage.clear();
  showLoginScreen();
  // Indicator shows expired ✨
}

// Auto-expire after 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;
setInterval(() => {
  if (storage.has('startTime')) {
    const startTime = storage.get('startTime');
    if (Date.now() - startTime > SESSION_TIMEOUT) {
      endSession();
    }
  }
}, 60000); // Check every minute
```

  

### Example 5: Shopping Cart Reset

```javascript
const storage = reactiveStorage('localStorage', 'cart');

// Display cart
effect(() => {
  const keys = storage.keys();
  const cart = document.getElementById('shopping-cart');
  
  if (keys.length === 0) {
    cart.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Add some items to get started</p>
      </div>
    `;
  } else {
    let total = 0;
    const items = keys.map(key => {
      const item = storage.get(key);
      total += item.price * item.quantity;
      return `
        <div class="cart-item">
          ${item.name} x${item.quantity} - $${item.price * item.quantity}
        </div>
      `;
    }).join('');
    
    cart.innerHTML = `
      <div class="cart-items">${items}</div>
      <div class="cart-total">Total: $${total.toFixed(2)}</div>
      <button onclick="checkout()">Checkout</button>
      <button onclick="clearCart()">Clear Cart</button>
    `;
  }
});

function addToCart(product) {
  storage.set(product.id, {
    name: product.name,
    price: product.price,
    quantity: 1
  });
  // Cart updates ✨
}

function clearCart() {
  if (confirm('Remove all items from cart?')) {
    storage.clear();
    // Cart shows empty state ✨
  }
}

async function checkout() {
  const items = storage.keys().map(key => storage.get(key));
  
  await processOrder(items);
  
  // Clear cart after successful checkout
  storage.clear();
  showSuccessMessage('Order placed!');
  // Cart shows empty state ✨
}
```

  

## Common Patterns

### Pattern 1: Safe Clear with Backup

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearWithBackup() {
  // Create backup
  const backup = {};
  storage.keys().forEach(key => {
    backup[key] = storage.get(key);
  });
  
  // Store backup
  localStorage.setItem('app:backup', JSON.stringify(backup));
  
  // Clear
  storage.clear();
  
  console.log('Cleared with backup');
}
```

  

### Pattern 2: Conditional Clear

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearIfOld(maxAge) {
  const lastClear = storage.get('lastClear');
  
  if (!lastClear || Date.now() - lastClear > maxAge) {
    storage.clear();
    storage.set('lastClear', Date.now());
    console.log('Storage cleared due to age');
  }
}

// Clear if data is older than 7 days
clearIfOld(7 * 24 * 60 * 60 * 1000);
```

  

### Pattern 3: Clear Specific Prefix

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearByPrefix(prefix) {
  const keys = storage.keys().filter(key => 
    key.startsWith(prefix)
  );
  
  batch(() => {
    keys.forEach(key => storage.remove(key));
  });
  
  return keys.length;
}

// Clear only temp data
clearByPrefix('temp_');
```

  

### Pattern 4: Clear with Notification

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearAndNotify(message) {
  const count = storage.keys().length;
  
  storage.clear();
  
  showToast(`${message || 'Storage cleared'} (${count} items)`);
}

clearAndNotify('Cache invalidated');
```

  

### Pattern 5: Clear and Redirect

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearAndRestart() {
  storage.clear();
  
  // Redirect to home/onboarding
  window.location.href = '/welcome';
}
```

  

### Pattern 6: Selective Preserve

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearExcept(preserve) {
  const toPreserve = {};
  
  preserve.forEach(key => {
    if (storage.has(key)) {
      toPreserve[key] = storage.get(key);
    }
  });
  
  storage.clear();
  
  Object.entries(toPreserve).forEach(([key, value]) => {
    storage.set(key, value);
  });
}

// Clear everything except settings
clearExcept(['settings', 'preferences']);
```

  

## Summary

**What is `proxy.clear()`?**  
A method that removes all key-value pairs from the storage namespace AND automatically triggers reactivity, causing all dependent code to update.

**Why use it?**
- ✅ Automatic UI updates when storage is cleared
- ✅ Namespace-safe (only clears your data)
- ✅ Single operation clears everything
- ✅ All effects see empty storage immediately
- ✅ Perfect for logout, reset, cache clearing

**Key Takeaway:**

```
Manual Clear                proxy.clear()
     |                           |
Find all keys              One method call
     |                           |
Loop and delete           Deletes all in namespace
     |                           |
  [DONE]                  Trigger all watchers
                                 |
                                 v
                         Everything updates! ✨
```

**One-Line Rule:** `proxy.clear()` = delete all namespace keys + automatic notifications to all watchers.

**When to use `proxy.clear()`:**
- User logout (clear all auth data)
- Application reset
- Cache invalidation
- Shopping cart clearing after checkout
- Session expiry
- Test cleanup

**Remember:** Clear once, update everywhere automatically! 🎉