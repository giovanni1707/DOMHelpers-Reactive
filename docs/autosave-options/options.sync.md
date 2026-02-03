# `options.sync` - Cross-Tab Synchronization Configuration

## Quick Start (30 seconds)

```javascript
const userState = state({ theme: 'light', notifications: true });

// Without sync - changes don't sync across tabs
autoSave(userState, 'settings');

// With sync - changes sync automatically across tabs!
autoSave(userState, 'settings', {
  sync: true
});

// Now open two browser tabs:
// Tab 1: Change theme to 'dark'
// Tab 2: Automatically updates to 'dark' ✨
```

**What just happened?** You enabled real-time synchronization across all browser tabs!

  

## What is `options.sync`?

`options.sync` is a configuration option that **enables automatic synchronization of state changes across all open browser tabs/windows**.

Simply put: when you change data in one tab, all other tabs automatically update to match.

Think of it as **live collaboration mode** - like Google Docs but for your app's state across tabs.

  

## Syntax

```javascript
autoSave(state, key, {
  sync: boolean
})
```

**Value:**
- `true` - Enable cross-tab synchronization
- `false` - Each tab is independent

**Default:** `false` (no synchronization)

  

## Why Does This Exist?

### The Problem: Tabs Out of Sync

Without synchronization, each tab has its own isolated state:

```javascript
const settings = state({ theme: 'light' });
autoSave(settings, 'settings');

// User opens app in two tabs

// Tab 1: User changes theme to dark
settings.theme = 'dark';  // Saves to localStorage

// Tab 2: Still shows light theme ❌
// Even though localStorage was updated!
// Tab doesn't know about the change
```

**What's the Real Issue?**

```
Tab 1: Change theme → Save
        |
        v
    localStorage updated
        |
        v
Tab 2: Doesn't know! ❌
        |
        v
Shows stale data
```

**Problems:**
❌ **Inconsistent state** - Tabs show different data  
❌ **Confusing UX** - User changes something, other tab doesn't reflect it  
❌ **Data conflicts** - Tabs can overwrite each other  
❌ **Manual refresh needed** - User must reload to see changes  

### The Solution with `options.sync`

```javascript
const settings = state({ theme: 'light' });

autoSave(settings, 'settings', {
  sync: true  // Enable synchronization
});

// Tab 1: Change theme
settings.theme = 'dark';
// Saves AND broadcasts to other tabs

// Tab 2: Automatically updates! ✨
// settings.theme becomes 'dark'
// UI updates automatically
```

**What Just Happened?**

```
Tab 1: Change theme → Save
        |
        v
    localStorage updated
        |
        v
    Browser fires 'storage' event
        |
        v
Tab 2: Receives event
        |
        v
Tab 2: Updates state automatically ✨
```

**Benefits:**
✅ **Consistent state** - All tabs always in sync  
✅ **Better UX** - Changes reflect everywhere instantly  
✅ **No conflicts** - Last write wins automatically  
✅ **Real-time** - Updates happen immediately  

  

## Mental Model

Think of sync disabled as **separate notepads**:

```
sync: false (Separate Notepads)
┌─────────────┐  ┌─────────────┐
│   Tab 1     │  │   Tab 2     │
│             │  │             │
│ theme:dark  │  │ theme:light │
│             │  │             │
│ Independent │  │ Independent │
└─────────────┘  └─────────────┘
```

Think of sync enabled as **shared whiteboard**:

```
sync: true (Shared Whiteboard)
┌─────────────┐  ┌─────────────┐
│   Tab 1     │  │   Tab 2     │
│      ↓      │  │      ↓      │
└─────────────┘  └─────────────┘
        ↓              ↓
   ┌─────────────────────┐
   │  Shared Storage     │
   │  theme: dark        │
   │  (synced live)      │
   └─────────────────────┘
```

**Key Insight:** Sync creates a shared, real-time data layer across all tabs.

  

## How Does It Work?

Cross-tab sync uses the browser's `storage` event:

### The Synchronization Process

**1️⃣ Tab 1 Makes Change**
```javascript
// Tab 1
settings.theme = 'dark';
```

**2️⃣ Save to Storage**
```
autoSave detects change
        |
        v
Save to localStorage
        |
        v
Browser fires 'storage' event
```

**3️⃣ Tab 2 Receives Event**
```
Tab 2's storage listener
        |
        v
Detects storage change
        |
        v
Loads new value from storage
        |
        v
Updates state reactively ✨
```

**4️⃣ Tab 2's UI Updates**
```
State changed in Tab 2
        |
        v
Effects re-run
        |
        v
UI updates automatically ✨
```

### Under the Hood

```javascript
// Inside autoSave with sync: true
window.addEventListener('storage', (event) => {
  // Only listen to our key
  if (event.key === fullStorageKey) {
    // New value available
    const newValue = JSON.parse(event.newValue);
    
    // Update state (triggers reactivity)
    batch(() => {
      Object.assign(state, newValue);
    });
    
    // Call onSync callback if provided
    if (options.onSync) {
      options.onSync(newValue);
    }
  }
});
```

  

## Basic Usage

### Example 1: Enable Sync

```javascript
const preferences = state({
  theme: 'light',
  language: 'en'
});

autoSave(preferences, 'prefs', {
  sync: true
});

// Changes sync across all tabs automatically
```

  

### Example 2: Multi-Tab Shopping Cart

```javascript
const cart = state({ items: [] });

autoSave(cart, 'cart', {
  sync: true
});

// User adds item in Tab 1
cart.items.push({ id: 1, name: 'Laptop' });

// Tab 2 immediately shows the item in cart ✨
```

  

### Example 3: Sync with Callback

```javascript
const userState = state({ name: '', status: 'online' });

autoSave(userState, 'user', {
  sync: true,
  onSync: (data) => {
    console.log('Synced from another tab:', data);
    showToast('Settings updated in another tab');
  }
});
```

  

## Real-World Examples

### Example 1: Multi-Tab Settings Panel

```javascript
const settings = state({
  theme: 'light',
  notifications: true,
  fontSize: 16
});

autoSave(settings, 'settings', {
  sync: true,
  debounce: 300
});

// Apply settings reactively
effect(() => {
  document.body.className = settings.theme;
  document.body.style.fontSize = settings.fontSize + 'px';
});

// User has settings panel open in Tab 1 and Tab 2
// Changes theme in Tab 1 → Tab 2 instantly updates ✨
```

  

### Example 2: Authentication Status Sync

```javascript
const auth = state({
  isLoggedIn: false,
  user: null,
  token: null
});

autoSave(auth, 'auth', {
  sync: true,
  onSync: (data) => {
    if (!data.isLoggedIn) {
      // User logged out in another tab
      showLoginScreen();
    }
  }
});

function logout() {
  auth.isLoggedIn = false;
  auth.user = null;
  auth.token = null;
  // All tabs automatically redirect to login ✨
}
```

  

### Example 3: Shopping Cart Across Tabs

```javascript
const cart = state({ items: [], total: 0 });

autoSave(cart, 'shoppingCart', {
  sync: true
});

// Update cart count badge
effect(() => {
  document.getElementById('cart-count').textContent = cart.items.length;
  document.getElementById('cart-total').textContent = `$${cart.total}`;
});

// User browses products in multiple tabs
// Adds item in Tab 1 → All tabs show updated count ✨
// Removes item in Tab 2 → All tabs reflect the change ✨
```

  

### Example 4: Live Notifications

```javascript
const notifications = state({ items: [] });

autoSave(notifications, 'notifications', {
  sync: true,
  storage: 'localStorage',
  onSync: (data) => {
    // New notification arrived
    if (data.items.length > notifications.items.length) {
      showNotificationToast('New notification!');
    }
  }
});

// Background worker adds notification
// All open tabs immediately show it ✨
```

  

### Example 5: Feature Flag Sync

```javascript
const features = state({
  newUI: false,
  darkMode: false,
  beta: false
});

autoSave(features, 'features', {
  sync: true,
  onSync: () => {
    // Features changed - reload to apply
    if (confirm('Features updated. Reload to apply?')) {
      window.location.reload();
    }
  }
});

// Admin enables feature in Tab 1
// All tabs get notification to reload ✨
```

  

## Common Patterns

### Pattern 1: Sync with Visual Feedback

```javascript
const state = state({ data: {} });

autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    // Show sync indicator
    const indicator = document.getElementById('sync-indicator');
    indicator.textContent = '🔄 Synced from another tab';
    indicator.classList.add('show');
    
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }
});
```

  

### Pattern 2: Conflict Resolution

```javascript
const doc = state({
  content: '',
  version: 0,
  lastModified: null
});

autoSave(doc, 'document', {
  sync: true,
  onSync: (incoming) => {
    // Check versions to prevent conflicts
    if (incoming.version > doc.version) {
      // Incoming is newer - accept it
      Object.assign(doc, incoming);
    } else if (doc.lastModified > incoming.lastModified) {
      // Local is newer - save it
      doc.$save();
    }
  }
});
```

  

### Pattern 3: Selective Sync

```javascript
const appState = state({
  // These should sync
  theme: 'light',
  language: 'en',
  
  // These should NOT sync (tab-specific)
  currentPage: 'home',
  scrollPosition: 0
});

autoSave(appState, 'app', {
  sync: true,
  onSave: (data) => {
    // Remove tab-specific data before saving
    const { currentPage, scrollPosition, ...toSync } = data;
    return toSync;
  },
  onSync: (data) => {
    // Keep tab-specific data when syncing
    const tabSpecific = {
      currentPage: appState.currentPage,
      scrollPosition: appState.scrollPosition
    };
    Object.assign(appState, data, tabSpecific);
  }
});
```

  

### Pattern 4: Rate Limit Sync Updates

```javascript
const liveData = state({ metrics: {} });

let lastSync = 0;
const SYNC_THROTTLE = 1000; // Max 1 sync per second

autoSave(liveData, 'metrics', {
  sync: true,
  onSync: (data) => {
    const now = Date.now();
    
    if (now - lastSync > SYNC_THROTTLE) {
      // Update state
      Object.assign(liveData, data);
      lastSync = now;
    }
  }
});
```

  

### Pattern 5: Sync with Undo History

```javascript
const editor = state({ content: '', history: [] });

autoSave(editor, 'editor', {
  sync: true,
  onSync: (data) => {
    // Another tab made changes
    if (data.content !== editor.content) {
      // Save current content to history
      editor.history.push({
        content: editor.content,
        timestamp: Date.now(),
        source: 'local'
      });
      
      // Apply synced content
      editor.content = data.content;
      
      showToast('Content synced from another tab');
    }
  }
});
```

  

### Pattern 6: Broadcast to Other Tabs Only

```javascript
const state = state({ value: '' });

let isUpdatingFromSync = false;

autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    isUpdatingFromSync = true;
    Object.assign(state, data);
    isUpdatingFromSync = false;
  }
});

// Custom broadcast without saving locally
function broadcastChange(data) {
  if (!isUpdatingFromSync) {
    localStorage.setItem('data', JSON.stringify(data));
    // This triggers sync in other tabs but not this one
  }
}
```

  

## Important Limitations

### 1. Storage Event Limitations

```javascript
// ⚠️ The 'storage' event does NOT fire in the tab that made the change

// Tab 1: Changes data
state.value = 'new';  // Saves to localStorage

// Tab 1: Does NOT receive its own storage event
// Tab 2, 3, etc: DO receive storage event

// This is browser behavior, not a bug
```

### 2. Same-Origin Only

```javascript
// ✅ Works: Same origin
// https://myapp.com/page1 ↔️ https://myapp.com/page2

// ❌ Doesn't work: Different origins
// https://myapp.com ❌ https://anotherapp.com
```

### 3. localStorage Only

```javascript
// ✅ Works with localStorage
autoSave(state, 'data', {
  storage: 'localStorage',
  sync: true
});

// ⚠️ Doesn't work with sessionStorage
// sessionStorage is tab-specific by design
autoSave(state, 'data', {
  storage: 'sessionStorage',
  sync: true  // Won't sync - sessionStorage is isolated
});
```

  

## When to Use Sync

### Use sync: true For:

✅ **User preferences** - Want consistent settings across tabs  
✅ **Authentication state** - Logout in one tab = logout everywhere  
✅ **Shopping cart** - Unified cart across all tabs  
✅ **Notifications** - Show new notifications in all tabs  
✅ **Feature flags** - Enable features everywhere  

### Don't Use sync For:

❌ **Tab-specific state** - Current page, scroll position  
❌ **Large, frequently changing data** - Performance issues  
❌ **Sensitive operations** - May cause race conditions  
❌ **sessionStorage data** - Won't sync anyway  

  

## Summary

**What is `options.sync`?**  
A configuration option that enables automatic synchronization of state changes across all open browser tabs.

**Why use it?**
- ✅ Consistent state across tabs
- ✅ Better user experience
- ✅ Real-time updates
- ✅ No manual refresh needed
- ✅ Automatic conflict resolution

**Key Takeaway:**

```
sync: false              sync: true
     |                        |
Isolated tabs           Connected tabs
     |                        |
Independent             Real-time sync
     |                        |
Stale data ❌          Always current ✅
```

**One-Line Rule:** Enable sync for data that should be consistent across all browser tabs.

**Best Practices:**
- Use for user preferences and settings
- Use for authentication state
- Add `onSync` callback for notifications
- Don't sync tab-specific data
- Consider performance with frequent updates

**Remember:** Sync keeps all your tabs on the same page! 🎉