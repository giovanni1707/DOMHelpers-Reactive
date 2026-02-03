# `Storage Availability Functions`

## Quick Start (30 seconds)

```javascript
// Check if localStorage is available
if (isStorageAvailable('localStorage')) {
  localStorage.setItem('key', 'value');
  console.log('localStorage works!');
} else {
  console.log('localStorage not available');
}

// Use boolean flags
if (hasLocalStorage) {
  // Use localStorage
  autoSave(state, 'data', { storage: 'localStorage' });
} else if (hasSessionStorage) {
  // Fallback to sessionStorage
  autoSave(state, 'data', { storage: 'sessionStorage' });
} else {
  // No storage available
  console.warn('Storage not available - data won\'t persist');
}
```

**What just happened?** You safely checked storage availability before using it!

  

## Overview

Three utilities for checking browser storage availability:

1. **`isStorageAvailable(type)`** - Function to test any storage type
2. **`hasLocalStorage`** - Boolean flag for localStorage
3. **`hasSessionStorage`** - Boolean flag for sessionStorage

  

## `isStorageAvailable(type)` - Check Storage Type

### What It Is

A function that **safely tests whether a specific storage type is available and working**.

Simply put: it checks if you can actually use localStorage, sessionStorage, or other storage without errors.

Think of it as **testing the water before diving in**.

  

### Syntax

```javascript
isStorageAvailable(type)
```

**Parameters:**
- `type` (String) - Storage type name: `'localStorage'` or `'sessionStorage'`

**Returns:** Boolean - `true` if available, `false` if not

  

### Why Does This Exist?

**The Problem:**

```javascript
// Direct usage can fail
try {
  localStorage.setItem('test', 'value');
} catch (e) {
  // Storage not available or blocked
  // - Private browsing mode
  // - Storage disabled in browser
  // - Security restrictions
  // - Quota exceeded
}
```

**The Solution:**

```javascript
if (isStorageAvailable('localStorage')) {
  // Safe to use
  localStorage.setItem('test', 'value');
} else {
  // Handle gracefully
  console.warn('localStorage not available');
}
```

  

### How It Works

```javascript
// Simplified implementation
function isStorageAvailable(type) {
  try {
    const storage = window[type];
    const test = '__storage_test__';
    
    // Try to write
    storage.setItem(test, test);
    
    // Try to read
    storage.getItem(test);
    
    // Clean up
    storage.removeItem(test);
    
    return true;
  } catch (e) {
    return false;
  }
}
```

  

## Basic Usage 1

**Check localStorage:**
```javascript
if (isStorageAvailable('localStorage')) {
  console.log('localStorage available ✅');
} else {
  console.log('localStorage not available ❌');
}
```

**Check sessionStorage:**
```javascript
if (isStorageAvailable('sessionStorage')) {
  console.log('sessionStorage available ✅');
} else {
  console.log('sessionStorage not available ❌');
}
```

  

### Real-World Examples

**Example 1: Graceful Fallback**

```javascript
function getStorage() {
  if (isStorageAvailable('localStorage')) {
    return localStorage;
  } else if (isStorageAvailable('sessionStorage')) {
    return sessionStorage;
  } else {
    // In-memory fallback
    return new Map();
  }
}

const storage = getStorage();
```

  

**Example 2: Safe Auto-Save Setup**

```javascript
function setupAutoSave(state, key) {
  let storageType = 'localStorage';
  
  if (!isStorageAvailable('localStorage')) {
    if (isStorageAvailable('sessionStorage')) {
      storageType = 'sessionStorage';
      console.warn('Using sessionStorage (localStorage unavailable)');
    } else {
      console.error('No storage available');
      return;
    }
  }
  
  autoSave(state, key, { storage: storageType });
}
```

  

**Example 3: User Warning**

```javascript
if (!isStorageAvailable('localStorage')) {
  showDialog({
    title: 'Storage Unavailable',
    message: 'Your browser settings prevent data storage. ' +
             'Please enable cookies/storage or use a different browser.',
    type: 'warning'
  });
}
```

  

### When Storage Might Be Unavailable

❌ **Private/Incognito Mode** - Some browsers disable storage  
❌ **Browser Settings** - User disabled cookies/storage  
❌ **Security Policies** - Corporate/school restrictions  
❌ **Quota Exceeded** - Storage is full  
❌ **Browser Support** - Very old browsers  
❌ **Cross-Origin** - Restrictions in iframes  

  

## `hasLocalStorage` - Boolean Flag

### What It Is

A **pre-computed boolean flag** indicating localStorage availability.

Simply put: a ready-to-use true/false value you can check immediately.

Think of it as **a quick answer to "can I use localStorage?"**

  

### Syntax

```javascript
hasLocalStorage  // Boolean
```

**Type:** Boolean  
**Value:** `true` if localStorage available, `false` if not

  

## Basic Usage 2

```javascript
if (hasLocalStorage) {
  // Use localStorage
  localStorage.setItem('key', 'value');
} else {
  // Can't use localStorage
  console.warn('localStorage not available');
}
```

  

### Real-World Examples

**Example 1: Conditional Feature**

```javascript
// Only enable persistence if available
if (hasLocalStorage) {
  document.getElementById('save-btn').disabled = false;
  showFeature('data-persistence');
} else {
  document.getElementById('save-btn').disabled = true;
  hideFeature('data-persistence');
  showWarning('Persistence unavailable');
}
```

  

**Example 2: Storage Strategy**

```javascript
const STORAGE_STRATEGY = hasLocalStorage 
  ? 'persistent'
  : hasSessionStorage 
    ? 'session' 
    : 'memory';

console.log(`Storage strategy: ${STORAGE_STRATEGY}`);
```

  

**Example 3: Feature Detection**

```javascript
const features = {
  localStorage: hasLocalStorage,
  sessionStorage: hasSessionStorage,
  notifications: 'Notification' in window,
  geolocation: 'geolocation' in navigator
};

console.log('Available features:', features);
```

  

## `hasSessionStorage` - Boolean Flag

### What It Is

A **pre-computed boolean flag** indicating sessionStorage availability.

Simply put: a ready-to-use true/false value for sessionStorage.

Think of it as **a quick answer to "can I use sessionStorage?"**

  

### Syntax

```javascript
hasSessionStorage  // Boolean
```

**Type:** Boolean  
**Value:** `true` if sessionStorage available, `false` if not

  

## Basic Usage 3

```javascript
if (hasSessionStorage) {
  // Use sessionStorage
  sessionStorage.setItem('key', 'value');
} else {
  // Can't use sessionStorage
  console.warn('sessionStorage not available');
}
```

  

### Real-World Examples

**Example 1: Session Tracking**

```javascript
if (hasSessionStorage) {
  // Track user session
  sessionStorage.setItem('sessionId', generateId());
  sessionStorage.setItem('startTime', Date.now());
} else {
  // Use cookies or in-memory tracking
  console.warn('Session tracking limited');
}
```

  

**Example 2: Temporary State**

```javascript
function saveTemporaryState(data) {
  if (hasSessionStorage) {
    sessionStorage.setItem('tempState', JSON.stringify(data));
  } else {
    // Keep in memory (lost on refresh)
    window.tempState = data;
  }
}
```

  

## Combined Usage Patterns

### Pattern 1: Progressive Storage Selection

```javascript
function selectStorage() {
  if (hasLocalStorage) {
    return {
      type: 'localStorage',
      storage: localStorage,
      persistent: true
    };
  } else if (hasSessionStorage) {
    return {
      type: 'sessionStorage', 
      storage: sessionStorage,
      persistent: false
    };
  } else {
    return {
      type: 'memory',
      storage: new Map(),
      persistent: false
    };
  }
}

const storage = selectStorage();
console.log(`Using: ${storage.type}`);
```

  

### Pattern 2: Availability Report

```javascript
function checkStorageAvailability() {
  return {
    localStorage: {
      available: hasLocalStorage,
      tested: isStorageAvailable('localStorage')
    },
    sessionStorage: {
      available: hasSessionStorage,
      tested: isStorageAvailable('sessionStorage')
    }
  };
}

console.table(checkStorageAvailability());
```

  

### Pattern 3: Safe Storage Wrapper

```javascript
class SafeStorage {
  constructor() {
    this.hasLocal = hasLocalStorage;
    this.hasSession = hasSessionStorage;
    
    this.storage = this.hasLocal 
      ? localStorage 
      : this.hasSession 
        ? sessionStorage 
        : null;
  }
  
  set(key, value) {
    if (!this.storage) {
      console.warn('No storage available');
      return false;
    }
    
    try {
      this.storage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }
  
  get(key) {
    if (!this.storage) return null;
    
    try {
      return this.storage.getItem(key);
    } catch (e) {
      return null;
    }
  }
}

const storage = new SafeStorage();
```

  

### Pattern 4: Warning System

```javascript
function checkAndWarn() {
  if (!hasLocalStorage && !hasSessionStorage) {
    showCriticalWarning(
      'Browser storage is completely disabled. ' +
      'Your data will not be saved.'
    );
    return false;
  }
  
  if (!hasLocalStorage && hasSessionStorage) {
    showWarning(
      'localStorage unavailable. Using sessionStorage. ' +
      'Data will be lost when you close this tab.'
    );
    return true;
  }
  
  return true;
}

// Check on app start
if (!checkAndWarn()) {
  disablePersistence();
}
```

  

## Comparison Table

```
┌────────────────────┬─────────────────┬──────────────────┐
│ Function/Flag      │ When to Use     │ Performance      │
├────────────────────┼─────────────────┼──────────────────┤
│ isStorageAvailable │ Dynamic check   │ Slower (test)    │
│ hasLocalStorage    │ Quick check     │ Faster (cached)  │
│ hasSessionStorage  │ Quick check     │ Faster (cached)  │
└────────────────────┴─────────────────┴──────────────────┘
```

**Use `isStorageAvailable(type)` when:**
- Need to test custom storage types
- Want fresh verification
- Testing in specific scenarios

**Use `hasLocalStorage` / `hasSessionStorage` when:**
- Need quick true/false check
- Checking repeatedly
- Performance matters

  

## Best Practices

### ✅ Always Check Before Using

```javascript
// ✅ Good
if (hasLocalStorage) {
  localStorage.setItem('key', 'value');
}

// ❌ Bad
localStorage.setItem('key', 'value'); // Might throw error
```

  

### ✅ Provide Fallbacks

```javascript
// ✅ Good - Multiple fallbacks
if (hasLocalStorage) {
  // Use localStorage
} else if (hasSessionStorage) {
  // Use sessionStorage
} else {
  // Use in-memory storage
}

// ❌ Bad - No fallback
if (hasLocalStorage) {
  localStorage.setItem('key', 'value');
}
// Fails silently if unavailable
```

  

### ✅ Inform Users

```javascript
// ✅ Good
if (!hasLocalStorage) {
  showNotification(
    'Storage unavailable. Your changes may not be saved.',
    'warning'
  );
}

// ❌ Bad - Silent failure
// User has no idea storage isn't working
```

  

### ✅ Handle Gracefully

```javascript
// ✅ Good
function saveData(key, data) {
  if (!hasLocalStorage) {
    console.warn('Cannot save - storage unavailable');
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}
```

  

## Testing Storage Availability

You can test these functions:

```javascript
// Test localStorage
console.log('localStorage available?', isStorageAvailable('localStorage'));
console.log('hasLocalStorage:', hasLocalStorage);

// Test sessionStorage  
console.log('sessionStorage available?', isStorageAvailable('sessionStorage'));
console.log('hasSessionStorage:', hasSessionStorage);

// Compare results
console.log('Flags match tests:', 
  hasLocalStorage === isStorageAvailable('localStorage') &&
  hasSessionStorage === isStorageAvailable('sessionStorage')
);
```

  

## Summary

**Three Storage Availability Tools:**

1. **`isStorageAvailable(type)`** - Function to test any storage
2. **`hasLocalStorage`** - Quick boolean for localStorage
3. **`hasSessionStorage`** - Quick boolean for sessionStorage

**Why Use Them:**
- ✅ Avoid runtime errors
- ✅ Provide fallbacks
- ✅ Handle restrictions gracefully
- ✅ Inform users of limitations

**Key Takeaway:**

```
Don't Assume Storage Works
         |
         ▼
    Check First
         |
         ▼
  Handle Gracefully
         |
         ▼
    Better UX ✅
```

**Remember:** Always check storage availability before using it! 🎉