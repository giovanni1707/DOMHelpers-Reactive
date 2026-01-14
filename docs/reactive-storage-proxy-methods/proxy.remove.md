
# `proxy.remove()` - Reactive Storage Proxy Remove Method

## Quick Start (30 seconds)

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Store a value
storage.set('username', 'Alice');

// Remove it - triggers reactivity!
storage.remove('username');

// Watch for removal
effect(() => {
  const user = storage.get('username');
  
  if (user) {
    console.log('User:', user);
  } else {
    console.log('No user logged in');
  }
});

storage.set('username', 'Bob');  // Logs: "User: Bob"
storage.remove('username');      // Logs: "No user logged in" ✨
```

**What just happened?** You deleted data from storage AND all watching code automatically updated to reflect the removal!

  

## What is `proxy.remove()`?

`proxy.remove()` is a method that **deletes a key-value pair from browser storage and automatically triggers reactivity**.

Simply put: it's like regular storage deletion, but smart. When you remove a value, any code watching that key will automatically update to handle the absence of data.

Think of it as a **smart cleanup system** that not only deletes data but also notifies everyone who was using it.

  

## Syntax

```javascript
// Remove a key
proxy.remove(key)
```

**Parameters:**
- `key` (string) - The storage key to remove

**Returns:** 
- `boolean` - `true` if removal was successful, `false` if it failed

  

## Why Does This Exist?

### The Problem with Regular Storage Deletion

Here's the traditional approach:

```javascript
// Set up UI that depends on a value
const token = localStorage.getItem('authToken');

if (token) {
  document.getElementById('user-panel').style.display = 'block';
  document.getElementById('login-btn').style.display = 'none';
}

// Later, remove the token
localStorage.removeItem('authToken');

// Problem: UI doesn't update! ❌
// User panel still visible
// Login button still hidden
// Your code still thinks user is logged in!

// You have to manually update everything
document.getElementById('user-panel').style.display = 'none';
document.getElementById('login-btn').style.display = 'block';
// Easy to forget some updates = bugs!
```

**What's the Real Issue?**

```
Remove from storage
        |
        v
    [NOTHING HAPPENS] ❌
        |
        v
Code still uses old value
        |
        v
UI shows stale state
        |
        v
Manual updates required everywhere
```

**Problems:**
❌ **Silent deletion** - Removal doesn't notify dependent code  
❌ **Stale state** - Variables still hold the old (now deleted) value  
❌ **Manual cleanup** - Must manually update every place that used the value  
❌ **Easy to miss** - Forget one update = broken UI  

### The Solution with `proxy.remove()`

```javascript
const storage = reactiveStorage('localStorage', 'auth');

// Set up reactive UI
effect(() => {
  const token = storage.get('authToken');
  
  const userPanel = document.getElementById('user-panel');
  const loginBtn = document.getElementById('login-btn');
  
  if (token) {
    userPanel.style.display = 'block';
    loginBtn.style.display = 'none';
  } else {
    userPanel.style.display = 'none';
    loginBtn.style.display = 'block';
  }
});

// Remove the token
storage.remove('authToken');
// Effect automatically re-runs!
// UI updates correctly! ✨
```

**What Just Happened?**

```
proxy.remove('authToken')
        |
        v
Deletes from storage
        |
        v
Triggers reactivity ✨
        |
        v
All effects watching 'authToken' re-run
        |
        v
They call get() and receive null
        |
        v
They update to handle absence! ✅
```

**Benefits:**
✅ **Automatic updates** - All dependent code updates when value is removed  
✅ **Zero manual work** - No need to update UI in multiple places  
✅ **Consistent state** - Everything always reflects current storage state  
✅ **Safer deletions** - Can't forget to update dependent code  

  

## Mental Model

Think of regular `localStorage.removeItem()` as **throwing away a document**:

```
Regular localStorage.removeItem()
┌─────────────────────┐
│  Find document      │
│                     │
│  Throw it away      │
│                     │
│  [DONE]             │
│                     │
│  People who had     │
│  copies don't       │
│  know it's gone     │
└─────────────────────┘
```

Now think of `proxy.remove()` as **canceling a subscription**:

```
proxy.remove() (Smart Cancellation)
┌─────────────────────┐
│  Delete document    │
│                     │
│  Send notification  │
│  to all subscribers │
│        |            │
│        v            │
│  "This is gone!"    │
│        |            │
│        v            │
│  Everyone updates   │
│  their records ✨   │
└─────────────────────┘
```

**Key Insight:** `proxy.remove()` doesn't just delete - it **announces the deletion** so everyone can respond appropriately.

  

## How Does It Work?

Let's look under the hood at what happens when you call `proxy.remove()`:

### Step-by-Step Process

**1️⃣ Delete from Storage**
```javascript
storage.remove('authToken');
```

First, it deletes from the actual browser storage:

```
Browser Storage (localStorage)
        |
        v
Delete 'myApp:authToken'
        |
        v
Key no longer exists
```

**2️⃣ Update Internal State**
```
Internal Reactive State:
{
  _version: 10,     // Incremented!
  _keys: Set(['theme', 'user'])  // 'authToken' removed!
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
They call storage.get('authToken')
        |
        v
Returns null (key deleted)
        |
        v
Effects handle absence! ✨
```

### The Implementation

Here's the magic behind `proxy.remove()`:

```javascript
// Inside reactiveStorage()
const reactiveState = state({
  _version: 0,
  _keys: new Set(store.keys())
});

function notify() {
  batch(() => {
    reactiveState._version++;           // ✨ Triggers all watchers!
    reactiveState._keys = new Set(store.keys());  // Updates key list
  });
}

// The remove method
const originalRemove = store.remove.bind(store);
proxy.remove = function(key) {
  const result = originalRemove(key);  // Delete from storage
  
  if (result) {
    notify();  // ✨ Trigger reactivity!
  }
  
  return result;
};
```

**What's happening?**
- `remove()` deletes from actual storage
- Then increments `_version` to trigger watchers
- Updates `_keys` set to reflect current keys
- All effects that read `_version` automatically re-run
- They call `get()` and receive `null` for the deleted key

  

## Basic Usage

### Example 1: Remove a Single Key

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store some data
storage.set('username', 'Alice');
storage.set('email', 'alice@example.com');

console.log(storage.get('username')); // 'Alice'

// Remove username
const success = storage.remove('username');
console.log(success); // true

// It's gone!
console.log(storage.get('username')); // null

// Email is still there
console.log(storage.get('email')); // 'alice@example.com'
```

  

### Example 2: Remove Non-Existent Key

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Try to remove a key that doesn't exist
const result = storage.remove('doesNotExist');
console.log(result); // true (no error, just returns true)

// Confirm it's not there
console.log(storage.get('doesNotExist')); // null
```

  

### Example 3: Conditional Removal

```javascript
const storage = reactiveStorage('localStorage', 'app');

storage.set('tempData', 'some value');

// Remove only if it exists
if (storage.has('tempData')) {
  storage.remove('tempData');
  console.log('Temp data removed');
} else {
  console.log('Nothing to remove');
}
```

  

## Reactive Deletion

### Example 1: UI Updates on Removal

```javascript
const storage = reactiveStorage('localStorage', 'app');

storage.set('notification', 'You have a new message');

// Display notification
effect(() => {
  const msg = storage.get('notification');
  const el = document.getElementById('notification');
  
  if (msg) {
    el.textContent = msg;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
});
// Notification shows: "You have a new message"

// Dismiss notification
function dismissNotification() {
  storage.remove('notification');
  // Notification automatically hides! ✨
}
```

  

### Example 2: Multiple Effects React to Removal

```javascript
const storage = reactiveStorage('localStorage', 'auth');

storage.set('authToken', 'abc123');

// Effect 1: Update header
effect(() => {
  const token = storage.get('authToken');
  const header = document.querySelector('header');
  header.className = token ? 'logged-in' : 'logged-out';
});

// Effect 2: Update navigation
effect(() => {
  const token = storage.get('authToken');
  const nav = document.querySelector('nav');
  nav.innerHTML = token ? '<a>Profile</a>' : '<a>Login</a>';
});

// Effect 3: Log status
effect(() => {
  const token = storage.get('authToken');
  console.log(token ? 'User logged in' : 'User logged out');
});

// Logout removes token - all three effects update!
function logout() {
  storage.remove('authToken');
  // Header class changes ✅
  // Nav changes to Login ✅
  // Console logs "User logged out" ✅
}
```

  

### Example 3: Cleanup on Removal

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Set up watchers that clean up when data is removed
effect(() => {
  const sessionId = storage.get('sessionId');
  
  if (sessionId) {
    // Session exists - start heartbeat
    const interval = setInterval(() => {
      console.log('Heartbeat:', sessionId);
    }, 5000);
    
    // Cleanup when session is removed
    return () => {
      clearInterval(interval);
      console.log('Heartbeat stopped');
    };
  }
});

// Later: remove session
storage.remove('sessionId');
// Heartbeat stops automatically! ✨
```

  

## Real-World Examples

### Example 1: Logout Flow

```javascript
const storage = reactiveStorage('localStorage', 'auth');

// Track authentication state
effect(() => {
  const token = storage.get('authToken');
  const user = storage.get('userData');
  
  const app = document.getElementById('app');
  
  if (token && user) {
    // Show authenticated UI
    app.innerHTML = `
      <div class="user-panel">
        <h2>Welcome, ${user.name}</h2>
        <button onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    // Show login UI
    app.innerHTML = `
      <div class="login-panel">
        <button onclick="showLogin()">Login</button>
      </div>
    `;
  }
});

// Logout clears all auth data
function logout() {
  storage.remove('authToken');
  storage.remove('userData');
  // UI automatically switches to login screen! ✨
}
```

  

### Example 2: Dismiss Notifications

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Display all notifications
effect(() => {
  const notifications = storage.get('notifications') || [];
  const container = document.getElementById('notifications');
  
  if (notifications.length === 0) {
    container.innerHTML = '<p>No notifications</p>';
    return;
  }
  
  container.innerHTML = notifications.map((n, i) => `
    <div class="notification">
      ${n.message}
      <button onclick="dismissNotification(${i})">✕</button>
    </div>
  `).join('');
});

// Dismiss individual notification
function dismissNotification(index) {
  const notifications = storage.get('notifications') || [];
  notifications.splice(index, 1);
  
  if (notifications.length === 0) {
    storage.remove('notifications');  // Remove entirely if empty
  } else {
    storage.set('notifications', notifications);
  }
  // UI updates automatically! ✨
}

// Clear all notifications
function clearAllNotifications() {
  storage.remove('notifications');
  // Shows "No notifications" message automatically! ✨
}
```

  

### Example 3: Clear Form Draft

```javascript
const storage = reactiveStorage('localStorage', 'forms');

// Auto-save form draft
const form = document.getElementById('contact-form');

form.oninput = () => {
  const draft = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };
  storage.set('contactDraft', draft);
};

// Show draft indicator
effect(() => {
  const draft = storage.get('contactDraft');
  const indicator = document.getElementById('draft-indicator');
  
  if (draft) {
    indicator.textContent = 'Draft saved';
    indicator.style.display = 'block';
  } else {
    indicator.style.display = 'none';
  }
});

// Submit form - clear draft
form.onsubmit = async (e) => {
  e.preventDefault();
  
  await submitForm(new FormData(form));
  
  // Clear draft after successful submission
  storage.remove('contactDraft');
  form.reset();
  // Draft indicator hides automatically! ✨
};
```

  

### Example 4: Session Expiry

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store session with expiration
function startSession(userId) {
  storage.set('session', {
    userId,
    startTime: Date.now()
  }, {
    expires: 3600  // 1 hour
  });
}

// Check session and auto-logout on expiry
effect(() => {
  const session = storage.get('session');
  
  if (!session) {
    // No session or expired
    showLoginScreen();
    return;
  }
  
  // Session exists
  showDashboard(session.userId);
  
  // Set timeout to check expiry
  const timeRemaining = 3600000 - (Date.now() - session.startTime);
  
  if (timeRemaining > 0) {
    setTimeout(() => {
      storage.remove('session');
      // Will trigger effect and show login screen ✨
    }, timeRemaining);
  }
});
```

  

### Example 5: Shopping Cart Cleanup

```javascript
const storage = reactiveStorage('localStorage', 'shop');

// Display cart
effect(() => {
  const cart = storage.get('cart') || [];
  
  const cartEl = document.getElementById('cart');
  const checkoutBtn = document.getElementById('checkout');
  
  if (cart.length === 0) {
    cartEl.innerHTML = '<p>Your cart is empty</p>';
    checkoutBtn.disabled = true;
  } else {
    cartEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        ${item.name} - $${item.price}
      </div>
    `).join('');
    checkoutBtn.disabled = false;
  }
});

// Checkout clears cart
async function checkout() {
  const cart = storage.get('cart') || [];
  
  await processOrder(cart);
  
  storage.remove('cart');
  // Cart UI shows "empty" message automatically! ✨
  
  showSuccessMessage('Order placed!');
}

// Clear cart button
function clearCart() {
  if (confirm('Clear your cart?')) {
    storage.remove('cart');
    // Cart empties immediately ✨
  }
}
```

  

## Common Patterns

### Pattern 1: Safe Removal with Check

```javascript
const storage = reactiveStorage('localStorage', 'app');

function safeRemove(key) {
  if (storage.has(key)) {
    storage.remove(key);
    console.log(`Removed ${key}`);
  } else {
    console.log(`${key} doesn't exist`);
  }
}

safeRemove('tempData');
```

  

### Pattern 2: Remove Multiple Keys

```javascript
const storage = reactiveStorage('localStorage', 'app');

function removeMultiple(keys) {
  batch(() => {
    keys.forEach(key => storage.remove(key));
  });
  // All removals batched - effects run once! ✨
}

removeMultiple(['temp1', 'temp2', 'temp3']);
```

  

### Pattern 3: Conditional Removal

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearExpiredData() {
  const data = storage.get('data');
  
  if (data && data.timestamp < Date.now() - 86400000) {
    storage.remove('data');
    console.log('Expired data removed');
  }
}
```

  

### Pattern 4: Remove with Confirmation

```javascript
const storage = reactiveStorage('localStorage', 'app');

function removeWithConfirm(key, message) {
  if (confirm(message || `Remove ${key}?`)) {
    storage.remove(key);
    return true;
  }
  return false;
}

document.getElementById('clear-btn').onclick = () => {
  removeWithConfirm('userData', 'Clear all user data?');
};
```

  

### Pattern 5: Remove and Notify

```javascript
const storage = reactiveStorage('localStorage', 'app');

function removeAndNotify(key, message) {
  storage.remove(key);
  
  // Show notification
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

removeAndNotify('cache', 'Cache cleared successfully');
```

  

### Pattern 6: Remove All Keys in Namespace

```javascript
const storage = reactiveStorage('localStorage', 'temp');

function clearNamespace() {
  const keys = storage.keys();
  
  batch(() => {
    keys.forEach(key => storage.remove(key));
  });
  
  console.log(`Cleared ${keys.length} items`);
}

clearNamespace();
```

  

## Summary

**What is `proxy.remove()`?**  
A method that deletes a key from browser storage AND automatically triggers reactivity, causing all dependent code to update.

**Why use it?**
- ✅ Automatic UI updates when data is deleted
- ✅ No manual cleanup needed
- ✅ All effects watching the key automatically handle removal
- ✅ Safer deletions - impossible to forget to update UI
- ✅ Consistent state across your app

**Key Takeaway:**

```
localStorage.removeItem()      proxy.remove()
         |                          |
    Delete key               Delete key
         |                          |
      [DONE]                Trigger watchers
                                   |
                                   v
                           Everything updates! ✨
```

**One-Line Rule:** `proxy.remove()` = localStorage.removeItem() + automatic notifications to all watchers.

**When to use `proxy.remove()`:**
- Logging out users (removing auth tokens)
- Clearing temporary data
- Dismissing notifications
- Clearing shopping carts after checkout
- Any deletion that should update UI immediately

**Remember:** Delete once, update everywhere automatically! 🎉