# `watchStorage() options.storage` - Storage Type Configuration

## Quick Start (30 seconds)

```javascript
// Watch localStorage key (default)
watchStorage('theme', (newValue, oldValue) => {
  console.log('Theme changed:', newValue);
});

// Watch sessionStorage key
watchStorage('sessionData', (newValue, oldValue) => {
  console.log('Session data changed:', newValue);
}, {
  storage: 'sessionStorage'
});

// Changes in any tab trigger the callback ✨
```

**What just happened?** You set up a watcher that monitors a specific storage key for changes!

  

## What is `options.storage`?

`options.storage` is a configuration option for `watchStorage()` that **specifies which browser storage mechanism to monitor**.

Simply put: it tells the watcher whether to watch localStorage (permanent storage) or sessionStorage (tab-only storage).

Think of it as **choosing which filing cabinet to monitor**.

  

## Syntax

```javascript
watchStorage(key, callback, {
  storage: 'localStorage' | 'sessionStorage'
})
```

**Value:**
- `'localStorage'` (default) - Monitor permanent storage
- `'sessionStorage'` - Monitor tab-specific storage

**Default:** `'localStorage'`

  

## Why Does This Exist?

### The Problem: Need to Watch Different Storage Types

Different data lives in different places:

```javascript
// Some data in localStorage
localStorage.setItem('theme', 'dark');

// Some data in sessionStorage
sessionStorage.setItem('activeTab', 'home');

// Want to watch both?
// Need to specify which storage to monitor!
```

**What's the Real Issue?**

```
Want to watch storage changes
        |
        v
But data in different storages
        |
        v
Need to specify which one ❌
```

**Problems:**
❌ **Ambiguity** - Which storage to watch?  
❌ **Can't mix** - Need separate watchers  
❌ **No default clarity** - Must specify type  

### The Solution with `options.storage`

```javascript
// Watch permanent preferences
watchStorage('theme', (value) => {
  applyTheme(value);
}, {
  storage: 'localStorage'
});

// Watch temporary session data
watchStorage('activeTab', (value) => {
  switchToTab(value);
}, {
  storage: 'sessionStorage'
});

// Each watcher monitors the right storage ✅
```

**What Just Happened?**

```
Specify storage type
        |
        v
Watch correct storage
        |
        v
Respond to right changes ✅
```

**Benefits:**
✅ **Clear intent** - Specify which storage to watch  
✅ **Flexible** - Can watch either type  
✅ **Correct behavior** - React to right changes  

  

## Mental Model

Think of localStorage and sessionStorage as **different mailboxes**:

```
Two Mailboxes
┌─────────────────────┐  ┌─────────────────────┐
│  localStorage       │  │  sessionStorage     │
│  (Permanent Box)    │  │  (Temp Box)         │
│                     │  │                     │
│  - theme            │  │  - activeTab        │
│  - preferences      │  │  - tempData         │
│  - savedData        │  │  - sessionId        │
└─────────────────────┘  └─────────────────────┘

watchStorage must know which mailbox to check!
```

**Key Insight:** Specify which storage to watch to get the right notifications.

  

## How Does It Work?

The storage option determines which storage API to monitor:

### Monitoring Process

```
watchStorage('key', callback, { storage: 'localStorage' })
        |
        v
Listen to window 'storage' event
        |
        v
Filter events by storage type
        |
        v
If localStorage['key'] changes
        |
        v
Call callback ✨
```

### Implementation

```javascript
function watchStorage(key, callback, options = {}) {
  const storageType = options.storage || 'localStorage';
  const storage = window[storageType];
  
  // Listen to storage events
  window.addEventListener('storage', (event) => {
    // Check if right storage and key
    if (event.storageArea === storage && event.key === key) {
      callback(event.newValue, event.oldValue);
    }
  });
}
```

  

## Basic Usage

### Example 1: Watch localStorage (Default)

```javascript
// Default - watches localStorage
watchStorage('userPreferences', (newValue) => {
  const prefs = JSON.parse(newValue);
  applyPreferences(prefs);
});

// Explicit localStorage
watchStorage('settings', (newValue) => {
  console.log('Settings changed:', newValue);
}, {
  storage: 'localStorage'
});
```

  

### Example 2: Watch sessionStorage

```javascript
// Watch sessionStorage
watchStorage('currentUser', (newValue) => {
  const user = JSON.parse(newValue);
  updateUserPanel(user);
}, {
  storage: 'sessionStorage'
});

// Changes only in this session trigger callback
```

  

### Example 3: Watch Both Storages

```javascript
// Watch localStorage for permanent data
watchStorage('theme', (theme) => {
  document.body.className = theme;
}, {
  storage: 'localStorage'
});

// Watch sessionStorage for temporary data
watchStorage('activeTab', (tab) => {
  switchToTab(tab);
}, {
  storage: 'sessionStorage'
});
```

  

## Real-World Examples

### Example 1: Multi-Tab Theme Sync

```javascript
// Watch theme changes across tabs
watchStorage('theme', (newTheme) => {
  // Apply theme when changed in another tab
  document.body.className = newTheme;
  
  // Update theme toggle UI
  const toggle = document.getElementById('theme-toggle');
  toggle.checked = newTheme === 'dark';
  
  showToast(`Theme changed to ${newTheme} in another tab`);
}, {
  storage: 'localStorage'  // Permanent, cross-tab
});

// User changes theme in Tab 1
localStorage.setItem('theme', 'dark');
// Tab 2 automatically updates ✨
```

  

### Example 2: Session Activity Monitor

```javascript
// Monitor session activity
watchStorage('lastActivity', (timestamp) => {
  const lastActive = parseInt(timestamp);
  const now = Date.now();
  const idle = now - lastActive;
  
  if (idle > 300000) { // 5 minutes
    showIdleWarning();
  }
}, {
  storage: 'sessionStorage'  // Session-specific
});

// Update activity in this tab
setInterval(() => {
  sessionStorage.setItem('lastActivity', Date.now().toString());
}, 10000);
```

  

### Example 3: Shopping Cart Sync

```javascript
// Watch cart changes across tabs
watchStorage('shoppingCart', (cartJson) => {
  if (!cartJson) {
    updateCartUI([]);
    return;
  }
  
  const cart = JSON.parse(cartJson);
  
  // Update cart count badge
  document.getElementById('cart-count').textContent = cart.items.length;
  
  // Update cart total
  const total = cart.items.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('cart-total').textContent = `$${total}`;
  
  showToast('Cart updated in another tab');
}, {
  storage: 'localStorage'
});
```

  

### Example 4: Feature Flag Changes

```javascript
// Watch for feature flag updates
watchStorage('featureFlags', (flagsJson) => {
  const flags = JSON.parse(flagsJson);
  
  // Check if important flags changed
  const criticalFlags = ['newPaymentFlow', 'maintenanceMode'];
  const changed = criticalFlags.some(flag => flags[flag] !== currentFlags[flag]);
  
  if (changed) {
    if (confirm('Important features changed. Reload to apply?')) {
      window.location.reload();
    }
  } else {
    applyFeatureFlags(flags);
  }
}, {
  storage: 'localStorage'
});
```

  

### Example 5: Session Transfer Warning

```javascript
// Watch for session changes
watchStorage('authToken', (newToken, oldToken) => {
  if (oldToken && !newToken) {
    // Logged out in another tab
    showDialog({
      title: 'Logged Out',
      message: 'You were logged out in another tab.',
      onClose: () => {
        window.location.href = '/login';
      }
    });
  } else if (!oldToken && newToken) {
    // Logged in
    showToast('Logged in from another tab');
    loadUserData();
  }
}, {
  storage: 'sessionStorage'  // Session-specific auth
});
```

  

## Common Patterns

### Pattern 1: Storage Type by Data Type

```javascript
// Permanent data → localStorage
const permanentKeys = ['preferences', 'savedData', 'settings'];

permanentKeys.forEach(key => {
  watchStorage(key, (value) => {
    handleUpdate(key, value);
  }, {
    storage: 'localStorage'
  });
});

// Temporary data → sessionStorage
const tempKeys = ['activeTab', 'scrollPosition', 'filters'];

tempKeys.forEach(key => {
  watchStorage(key, (value) => {
    handleTempUpdate(key, value);
  }, {
    storage: 'sessionStorage'
  });
});
```

  

### Pattern 2: Unified Watcher Function

```javascript
function createStorageWatcher(key, callback, isPermanent = true) {
  return watchStorage(key, callback, {
    storage: isPermanent ? 'localStorage' : 'sessionStorage'
  });
}

// Usage
createStorageWatcher('theme', applyTheme, true);        // localStorage
createStorageWatcher('sessionId', updateSession, false); // sessionStorage
```

  

### Pattern 3: Conditional Storage Selection

```javascript
function watchData(key, callback, options = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  
  return watchStorage(key, callback, {
    // Use sessionStorage in dev, localStorage in prod
    storage: isProd ? 'localStorage' : 'sessionStorage',
    ...options
  });
}
```

  

### Pattern 4: Storage Availability Check

```javascript
function safeWatchStorage(key, callback, options = {}) {
  const storageType = options.storage || 'localStorage';
  
  // Check if storage is available
  try {
    const storage = window[storageType];
    const test = '__test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    
    // Storage available - set up watcher
    return watchStorage(key, callback, options);
  } catch (e) {
    console.warn(`${storageType} not available, watcher disabled`);
    return () => {}; // Return no-op cleanup function
  }
}
```

  

### Pattern 5: Watch Multiple Keys in Same Storage

```javascript
function watchMultipleKeys(keys, callback, storageType = 'localStorage') {
  const cleanups = keys.map(key => {
    return watchStorage(key, (newValue, oldValue) => {
      callback(key, newValue, oldValue);
    }, {
      storage: storageType
    });
  });
  
  // Return cleanup function that removes all watchers
  return () => {
    cleanups.forEach(cleanup => cleanup());
  };
}

// Usage
const cleanup = watchMultipleKeys(
  ['theme', 'language', 'fontSize'],
  (key, value) => {
    console.log(`${key} changed to ${value}`);
  },
  'localStorage'
);
```

  

## Important Behavior Differences

### localStorage

```javascript
watchStorage('key', callback, {
  storage: 'localStorage'
});

// ✅ Fires across all tabs/windows
// ✅ Persists forever
// ✅ Data survives browser restart
// ✅ Shared across all tabs
```

### sessionStorage

```javascript
watchStorage('key', callback, {
  storage: 'sessionStorage'
});

// ⚠️ Only fires within same tab
// ⚠️ Cleared when tab closes
// ⚠️ Not shared across tabs
// ⚠️ Each tab has separate sessionStorage
```

  

## When to Use Each

### Use `storage: 'localStorage'` For:

✅ **User preferences** - Theme, language, font size  
✅ **Saved data** - Shopping cart, favorites  
✅ **Cross-tab sync** - Settings that should sync  
✅ **Persistent state** - Data that survives browser restart  

### Use `storage: 'sessionStorage'` For:

✅ **Tab-specific state** - Active tab, current page  
✅ **Temporary data** - Session ID, temp filters  
✅ **Security** - Sensitive data that shouldn't persist  
✅ **Per-tab behavior** - Each tab has different state  

  

## Summary

**What is `watchStorage() options.storage`?**  
A configuration option that specifies which browser storage mechanism to monitor.

**Why use it?**
- ✅ Watch the right storage type
- ✅ Handle permanent vs temporary data
- ✅ Control cross-tab behavior
- ✅ Match storage to data lifetime

**Key Takeaway:**

```
localStorage              sessionStorage
     |                         |
Permanent data           Temporary data
     |                         |
Cross-tab sync          Tab-specific
     |                         |
Survives restart ✅     Auto-clears ✅
```

**One-Line Rule:** Specify storage type to watch the right data for the right lifetime.

**Best Practices:**
- Use localStorage for permanent, cross-tab data
- Use sessionStorage for temporary, tab-specific data
- Check storage availability before watching
- Default to localStorage for most use cases

**Remember:** Choose the storage that matches your data's lifetime! 🎉