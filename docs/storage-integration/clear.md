
#  `clear(state)`

## Quick Start (30 seconds)

**Delete your saved data from localStorage:**

```javascript
const settings = state({ theme: 'dark', fontSize: 14 });
autoSave(settings, 'appSettings');

// Delete from storage
clear(settings);

console.log(exists(settings)); // false
// Storage is now empty, but state still has its current values
```

**That's it!** The saved data is gone from localStorage.

 

## What is clear()?

`clear()` is a function that **deletes your saved data from localStorage**.

Simply put: **It's the "delete save file" button.**

```javascript
const cart = state({ items: [] });
autoSave(cart, 'cart');

// Empty the cart and remove from storage
cart.items = [];
clear(cart);
// Storage is now clean
```

 

## Syntax

### Shorthand (Recommended)
```javascript
clear(state)
```

### Full Namespace
```javascript
ReactiveUtils.clear(state)
```

### Parameters
- **`state`** - A reactive state object with storage enabled

### Returns
- **`boolean`** - `true` if cleared successfully, `false` if failed

 

## Why Does This Exist?

### The Challenge

You need a way to remove saved data:

**Without clear():**
```javascript
const userData = state({ name: 'John' });
autoSave(userData, 'user');

// Manually remove from localStorage
localStorage.removeItem('user');
// But what was the exact key? Namespace? Manual work!
```

**What's tedious about this?**

❌ Need to remember the exact storage key  
❌ Manual localStorage access  
❌ Might forget namespace prefix  
❌ Error-prone  

### The Solution with clear()

```javascript
const userData = state({ name: 'John' });
autoSave(userData, 'user');

// Remove with one line
clear(userData);
```

**What's better about this?**

✅ One simple function  
✅ Handles namespaces automatically  
✅ Returns success status  
✅ Clean code  

This method is **especially useful when** users log out, reset settings, or clear cached data.

 

## Mental Model

Think of `clear()` as **deleting a save file**.

### Manual Delete
```
Find save file location
   ↓
Remember exact filename
   ↓
Delete the file
   ↓
Hope you got it right
```

### clear() (One Button)
```
Press [DELETE SAVE]
   ↓
Save file deleted ✅
```

**Key Insight:** You don't worry about filenames or locations—just delete.

 

## How Does It Work?

When you call `clear()`:

```
Step 1: Check
   ↓
[Does state have $clear method?]
   ↓
   Yes → Continue
   No  → Return false
   ↓
Step 2: Get Key
   ↓
[Get storage key (with namespace)]
   ↓
Step 3: Remove
   ↓
[Call localStorage.removeItem(key)]
   ↓
Step 4: Return
   ↓
[Return true if success]
```

 

## Basic Usage

### Example 1: Logout

```javascript
const user = state({ name: '', email: '' });
autoSave(user, 'currentUser');

function logout() {
  // Clear saved user data
  clear(user);
  
  // Reset state
  user.name = '';
  user.email = '';
  
  console.log('User logged out');
}
```

 

### Example 2: Reset Settings

```javascript
const settings = state({ theme: 'dark', lang: 'en' });
autoSave(settings, 'settings');

document.querySelector('#resetBtn').addEventListener('click', () => {
  if (confirm('Reset to defaults?')) {
    // Remove saved settings
    clear(settings);
    
    // Reset to defaults
    settings.theme = 'light';
    settings.lang = 'en';
    
    alert('Settings reset!');
  }
});
```

 

### Example 3: Clear Cache

```javascript
const cache = state({ data: null, timestamp: 0 });
autoSave(cache, 'apiCache');

function clearCache() {
  clear(cache);
  cache.data = null;
  cache.timestamp = 0;
  console.log('Cache cleared');
}
```

 

### Example 4: Clear Old Data

```javascript
const draft = state({ text: '' });
autoSave(draft, 'draft');

document.querySelector('#discardBtn').addEventListener('click', () => {
  if (confirm('Discard draft?')) {
    clear(draft);
    draft.text = '';
    console.log('Draft discarded');
  }
});
```

 

## Deep Dive

### clear() vs reset()

**clear()** removes from storage only:
```javascript
const data = state({ value: 42 });
autoSave(data, 'data');

clear(data);

console.log(data.value);    // Still 42 (in memory)
console.log(exists(data));  // false (not in storage)
```

**reset()** clears storage AND resets state:
```javascript
const data = asyncState(42);
autoSave(data, 'data');

reset(data);

console.log(data.value);    // null (reset to initial)
console.log(exists(data));  // false (not in storage)
```

**Use clear() when:** You want to remove from storage but keep current values  
**Use reset() when:** You want to clear everything and start over

 

### State After clear()

```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings');

settings.theme = 'light';
console.log(settings.theme); // 'light'

clear(settings); // Remove from storage

console.log(settings.theme); // Still 'light' (unchanged in memory)
console.log(exists(settings)); // false (gone from storage)
```

**Important:** `clear()` only removes from storage, doesn't change your state values!

 

### Multiple clear() Calls

Safe to call multiple times:

```javascript
const data = state({ value: 0 });
autoSave(data, 'data');

clear(data); // Removes from storage
clear(data); // Does nothing (already gone)
clear(data); // Does nothing (already gone)
// No errors!
```

 

### clear() with Namespace

```javascript
const user = state({ name: 'John' });
autoSave(user, 'user', { namespace: 'myApp' });

// Storage key is actually: 'myApp:user'

clear(user); // Handles namespace automatically ✅
// Removes 'myApp:user' from storage
```

 

## Common Patterns

### Pattern 1: Clear All Data

```javascript
const user = state({ name: '' });
const settings = state({ theme: 'dark' });
const cart = state({ items: [] });

autoSave(user, 'user');
autoSave(settings, 'settings');
autoSave(cart, 'cart');

function clearAll() {
  clear(user);
  clear(settings);
  clear(cart);
  console.log('All data cleared');
}
```

 

### Pattern 2: Clear on Logout

```javascript
const session = state({
  token: '',
  userId: null
});

autoSave(session, 'session');

function logout() {
  // Remove session data
  clear(session);
  
  // Reset state
  session.token = '';
  session.userId = null;
  
  // Redirect
  window.location = '/login';
}
```

 

### Pattern 3: Temporary Data

```javascript
const tempData = state({ processing: false });
autoSave(tempData, 'temp');

// Clear when done
function finishProcessing() {
  tempData.processing = false;
  clear(tempData);
  console.log('Temp data cleaned up');
}
```

 

### Pattern 4: Clear with Confirmation

```javascript
const important = state({ data: '...' });
autoSave(important, 'important');

function clearData() {
  if (!confirm('Are you sure? This cannot be undone.')) {
    return;
  }
  
  const success = clear(important);
  
  if (success) {
    alert('Data deleted');
    important.data = '';
  } else {
    alert('Failed to delete');
  }
}
```

 

### Pattern 5: Clear Expired Data

```javascript
const cache = state({
  data: null,
  expiresAt: 0
});

autoSave(cache, 'cache');

function checkExpiry() {
  if (Date.now() > cache.expiresAt) {
    clear(cache);
    cache.data = null;
    console.log('Expired cache cleared');
  }
}
```

 

## Summary

**What is clear()?**  
A function that removes your saved data from localStorage.

**Key Features:**
- ✅ One-line deletion
- ✅ Handles namespaces automatically
- ✅ Returns success status
- ✅ Safe to call multiple times
- ✅ Doesn't change in-memory state

**When to use it:**
- User logout
- Reset to defaults
- Clear cache
- Discard drafts
- Delete temporary data

**Remember:**
```javascript
// Setup
autoSave(state, 'key');

// Clear storage
clear(state); // Storage deleted, state unchanged

// Or clear + reset
clear(state);
state.value = defaultValue;
```

**Related Methods:**
- `autoSave()` - Enable storage
- `save()` - Save to storage
- `load()` - Load from storage
- `exists()` - Check if exists

 
