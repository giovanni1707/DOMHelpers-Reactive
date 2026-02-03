# `options.onSync` - Cross-Tab Sync Event Callback

## Quick Start (30 seconds)

```javascript
const userState = state({ theme: 'light', notifications: true });

autoSave(userState, 'settings', {
  sync: true,
  onSync: (newData) => {
    // Called when another tab changes the data
    console.log('Settings synced from another tab:', newData);
    showToast('Settings updated!');
  }
});

// Open two tabs:
// Tab 1: Change theme to 'dark'
// Tab 2: onSync fires with { theme: 'dark', ... } ✨
```

**What just happened?** You added a callback that fires whenever data is synced from another browser tab!

  

## What is `options.onSync`?

`options.onSync` is a callback function that **fires when data is synchronized from another browser tab/window**.

Simply put: it's like a doorbell that rings when someone else makes a delivery. You're notified when data changes in another tab.

Think of it as **a cross-tab notification system**.

  

## Syntax

```javascript
autoSave(state, key, {
  sync: true,  // Must be enabled
  onSync: (newData) => {
    // Handle synced data
  }
});
```

**Parameters:**
- `newData` - The new data that was synced from another tab

**Returns:**
- Nothing (void function)

**Default:** `null` (no callback)

  

## Why Does This Exist?

### The Challenge: Silent Updates

With sync enabled but no callback, updates happen silently:

```javascript
const settings = state({ theme: 'light' });

autoSave(settings, 'settings', {
  sync: true
  // No onSync callback
});

// Tab 1: User changes theme
settings.theme = 'dark';

// Tab 2: Theme updates automatically BUT
// - User doesn't know
// - No visual feedback
// - Confusing UX ❌
```

**What's the Real Issue?**

```
Tab 1 changes data
        |
        v
Tab 2 receives update
        |
        v
State changes silently
        |
        v
User confused ❌
```

**Problems:**
❌ **Silent updates** - No user feedback  
❌ **Confusing** - UI changes without explanation  
❌ **No logging** - Can't track sync events  
❌ **No custom handling** - Can't add special logic  

### The Solution with `options.onSync`

```javascript
const settings = state({ theme: 'light' });

autoSave(settings, 'settings', {
  sync: true,
  onSync: (newData) => {
    // Notify user
    showToast(`Settings updated: ${newData.theme} theme`);
    
    // Log event
    console.log('Synced from another tab', newData);
    
    // Custom handling
    if (newData.theme === 'dark') {
      playSound('theme-change.mp3');
    }
  }
});

// Tab 2 user sees: "Settings updated: dark theme" ✨
```

**What Just Happened?**

```
Tab 1 changes data
        |
        v
Tab 2 receives update
        |
        v
onSync callback fires
        |
        v
Show notification ✅
Custom logic runs ✅
User informed ✅
```

**Benefits:**
✅ **User feedback** - Visual notification of changes  
✅ **Custom logic** - Add special handling  
✅ **Logging** - Track sync events  
✅ **Better UX** - Users understand what happened  

  

## Mental Model

Think of sync without onSync as **surprise room makeover**:

```
No onSync (Silent Update)
┌─────────────────────┐
│  You leave room     │
│                     │
│  Someone redecorates│
│                     │
│  You return         │
│  "Why is this       │
│   different??" ❌   │
└─────────────────────┘
```

Think of onSync as **notification of changes**:

```
With onSync (You're Informed)
┌─────────────────────┐
│  You leave room     │
│                     │
│  Someone redecorates│
│                     │
│  You get text: 📱   │
│  "Changed to blue   │
│   theme!"           │
│                     │
│  You return         │
│  "Oh cool!" ✅      │
└─────────────────────┘
```

**Key Insight:** onSync turns silent updates into communicated changes.

  

## How Does It Work?

The onSync callback is triggered by the storage event:

### The Sync Flow

```
Tab 1: state.theme = 'dark'
        |
        v
Save to localStorage
        |
        v
Browser fires 'storage' event
        |
        v
Tab 2: Event listener catches it
        |
        v
Update local state
        |
        v
Call onSync(newData) ✨
        |
        v
Your custom logic runs
```

### Implementation

```javascript
// Inside autoSave with sync enabled
window.addEventListener('storage', (event) => {
  if (event.key === storageKey) {
    const newData = JSON.parse(event.newValue);
    
    // Update state
    Object.assign(state, newData);
    
    // Call onSync callback
    if (options.onSync) {
      options.onSync(newData);
    }
  }
});
```

  

## Basic Usage

### Example 1: Toast Notification

```javascript
const settings = state({ theme: 'light' });

autoSave(settings, 'settings', {
  sync: true,
  onSync: (data) => {
    showToast('Settings synced from another tab');
  }
});
```

  

### Example 2: Console Logging

```javascript
const userState = state({ name: '', status: '' });

autoSave(userState, 'user', {
  sync: true,
  onSync: (data) => {
    console.log('User data synced:', data);
    console.log('Updated at:', new Date().toLocaleTimeString());
  }
});
```

  

### Example 3: Conditional Actions

```javascript
const cart = state({ items: [] });

autoSave(cart, 'cart', {
  sync: true,
  onSync: (data) => {
    if (data.items.length > cart.items.length) {
      showNotification('Item added to cart in another tab');
    } else if (data.items.length < cart.items.length) {
      showNotification('Item removed from cart');
    }
  }
});
```

  

## Real-World Examples

### Example 1: Authentication Sync

```javascript
const auth = state({
  isLoggedIn: false,
  user: null
});

autoSave(auth, 'auth', {
  sync: true,
  onSync: (data) => {
    if (!data.isLoggedIn && auth.isLoggedIn) {
      // User logged out in another tab
      showDialog({
        title: 'Logged Out',
        message: 'You were logged out in another tab',
        onOk: () => redirectToLogin()
      });
    } else if (data.isLoggedIn && !auth.isLoggedIn) {
      // User logged in
      showToast('Logged in from another tab');
      loadUserData();
    }
  }
});
```

  

### Example 2: Shopping Cart Updates

```javascript
const cart = state({ items: [], total: 0 });

autoSave(cart, 'cart', {
  sync: true,
  debounce: 500,
  onSync: (data) => {
    // Show indicator
    const indicator = document.getElementById('sync-indicator');
    indicator.textContent = '🔄 Cart updated';
    indicator.classList.add('show');
    
    // Calculate differences
    const newItems = data.items.length - cart.items.length;
    if (newItems > 0) {
      showToast(`${newItems} item(s) added in another tab`);
    }
    
    // Hide indicator after 3 seconds
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 3000);
  }
});
```

  

### Example 3: Collaborative Feature Flags

```javascript
const features = state({
  newUI: false,
  betaFeatures: false
});

autoSave(features, 'features', {
  sync: true,
  onSync: (data) => {
    // Check what changed
    const changes = [];
    
    Object.keys(data).forEach(key => {
      if (data[key] !== features[key]) {
        changes.push(`${key}: ${features[key]} → ${data[key]}`);
      }
    });
    
    if (changes.length > 0) {
      console.log('Feature flags updated:', changes);
      
      if (confirm('Features updated. Reload to apply changes?')) {
        window.location.reload();
      }
    }
  }
});
```

  

### Example 4: Live Dashboard Sync

```javascript
const dashboard = state({
  widgets: [],
  layout: {}
});

autoSave(dashboard, 'dashboard', {
  sync: true,
  onSync: (data) => {
    // Show sync animation
    document.body.classList.add('syncing');
    
    // Log change
    const timestamp = new Date().toLocaleTimeString();
    const log = document.getElementById('sync-log');
    log.insertAdjacentHTML('afterbegin', 
      `<div>${timestamp}: Dashboard synced</div>`
    );
    
    // Remove animation
    setTimeout(() => {
      document.body.classList.remove('syncing');
    }, 500);
  }
});
```

  

### Example 5: Notification Center

```javascript
const notifications = state({ items: [] });

autoSave(notifications, 'notifications', {
  sync: true,
  onSync: (data) => {
    // Check for new notifications
    const oldCount = notifications.items.length;
    const newCount = data.items.length;
    
    if (newCount > oldCount) {
      const newNotifs = newCount - oldCount;
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Notification', {
          body: `You have ${newNotifs} new notification(s)`,
          icon: '/icon.png'
        });
      }
      
      // Play sound
      const audio = new Audio('/notification.mp3');
      audio.play();
      
      // Update badge
      document.getElementById('notif-badge').textContent = newNotifs;
    }
  }
});
```

  

## Common Patterns

### Pattern 1: Sync Indicator

```javascript
autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    const indicator = document.getElementById('sync-status');
    
    // Show syncing
    indicator.textContent = '🔄 Syncing...';
    indicator.className = 'syncing';
    
    // Change to synced after animation
    setTimeout(() => {
      indicator.textContent = '✓ Synced';
      indicator.className = 'synced';
      
      // Hide after 2 seconds
      setTimeout(() => {
        indicator.className = 'hidden';
      }, 2000);
    }, 500);
  }
});
```

  

### Pattern 2: Track Sync History

```javascript
const syncHistory = [];

autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    syncHistory.push({
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data))
    });
    
    // Keep last 10 syncs
    if (syncHistory.length > 10) {
      syncHistory.shift();
    }
    
    console.log('Sync history:', syncHistory);
  }
});
```

  

### Pattern 3: Conflict Detection

```javascript
let lastModified = Date.now();

autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    const timeSinceLastEdit = Date.now() - lastModified;
    
    if (timeSinceLastEdit < 5000) {
      // Recent local edit - potential conflict
      console.warn('Potential conflict detected');
      
      if (confirm('Data changed in another tab. Accept changes?')) {
        // Accept synced data
        lastModified = Date.now();
      } else {
        // Keep local data
        save(myState);
      }
    } else {
      // No conflict - accept sync
      lastModified = Date.now();
    }
  }
});
```

  

### Pattern 4: Selective Reload

```javascript
autoSave(state, 'config', {
  sync: true,
  onSync: (data) => {
    // Check what changed
    const criticalFields = ['apiUrl', 'apiKey'];
    const changed = criticalFields.some(field => 
      data[field] !== state[field]
    );
    
    if (changed) {
      showWarning('Critical settings changed. Page will reload in 3 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      showToast('Settings updated');
    }
  }
});
```

  

### Pattern 5: Analytics Tracking

```javascript
autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    // Track sync event
    analytics.track('cross_tab_sync', {
      dataType: 'user_settings',
      timestamp: Date.now(),
      itemCount: Object.keys(data).length
    });
  }
});
```

  

### Pattern 6: Rate Limiting

```javascript
let lastSyncNotification = 0;
const NOTIFICATION_COOLDOWN = 5000; // 5 seconds

autoSave(state, 'data', {
  sync: true,
  onSync: (data) => {
    const now = Date.now();
    
    if (now - lastSyncNotification > NOTIFICATION_COOLDOWN) {
      showToast('Data synchronized');
      lastSyncNotification = now;
    }
    
    // Always log, even if notification suppressed
    console.log('Sync received', data);
  }
});
```

  

## Important Notes

### 1. Only Fires in Other Tabs

```javascript
// ⚠️ onSync does NOT fire in the tab that made the change

// Tab 1: Changes data
state.value = 'new';
// onSync does NOT fire in Tab 1

// Tab 2, 3, etc: Receive the sync
// onSync DOES fire in Tab 2, 3, etc.
```

### 2. Requires sync: true

```javascript
// ❌ Won't work - sync not enabled
autoSave(state, 'data', {
  onSync: (data) => console.log(data)
});

// ✅ Correct - sync enabled
autoSave(state, 'data', {
  sync: true,
  onSync: (data) => console.log(data)
});
```

### 3. State Already Updated

```javascript
autoSave(state, 'data', {
  sync: true,
  onSync: (newData) => {
    // State is already updated by the time onSync fires
    console.log(state.value === newData.value); // true
    
    // onSync is for notifications, not for updating state
    // (state is already updated automatically)
  }
});
```

  

## Summary

**What is `options.onSync`?**  
A callback function that fires when data is synchronized from another browser tab.

**Why use it?**
- ✅ Notify users of changes
- ✅ Log sync events
- ✅ Add custom logic on sync
- ✅ Handle conflicts
- ✅ Better user experience

**Key Takeaway:**

```
Without onSync          With onSync
      |                      |
Silent updates         Notified updates
      |                      |
User confused ❌       User informed ✅
```

**One-Line Rule:** Use onSync to handle and respond to cross-tab synchronization events.

**Common Use Cases:**
- **Notifications**: Toast messages for changes
- **Logging**: Track sync events
- **Reloading**: Reload page for critical changes
- **Conflicts**: Detect and resolve conflicts
- **Analytics**: Track cross-tab usage

**Best Practices:**
- Always enable `sync: true`
- Show visual feedback to users
- Rate limit notifications
- Log sync events for debugging
- Handle conflicts gracefully

**Remember:** onSync keeps users informed across tabs! 🎉