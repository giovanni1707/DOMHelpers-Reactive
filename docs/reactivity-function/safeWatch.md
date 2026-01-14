# `safeWatch()` - Error-Safe Watchers That Never Break Your App

## Quick Start (30 seconds)

```javascript
const state = ReactiveUtils.state({ user: { name: 'Alice', email: null } });

// Regular watch - ONE error crashes the watcher
watch(state, {
  email: (newVal, oldVal) => {
    sendEmail(newVal.toLowerCase()); // 💥 Error if email is null
  }
});

// Safe watch - errors are contained and handled gracefully
safeWatch(state, 'email', (newVal, oldVal) => {
  sendEmail(newVal.toLowerCase()); // ✅ Error caught, watcher keeps running
}, {
  errorBoundary: {
    onError: (error) => console.error('Email watcher error:', error)
  }
});
```

**What just happened?** When `email` is `null`, the regular watcher crashes. The safe watcher catches the error, logs it, and continues working.

 

## What is safeWatch()?

`safeWatch()` creates a reactive watcher that **automatically catches and handles errors** instead of letting them crash your application.

It's exactly like `watch()`, but with a **safety net** around your callback function. If something goes wrong, the error gets caught, handled gracefully, and your watcher stays alive.

### Simple Definition

**Regular `watch()`**: If your callback throws an error, the watcher breaks and stops responding to changes.

**`safeWatch()`**: If your callback throws an error, it's caught, handled according to your rules, and the watcher keeps working.

 

## Syntax

### Shorthand (Recommended)
```javascript
safeWatch(state, keyOrFn, callback, options)
```

### Full Namespace Style
```javascript
ReactiveUtils.safeWatch(state, keyOrFn, callback, options)
```

### Parameters

| Parameter | Type | Description |
|   --|  |    -|
| `state` | Object | The reactive state to watch |
| `keyOrFn` | String/Function | Property name or computed function to watch |
| `callback` | Function | Function called when value changes: `(newVal, oldVal) => {}` |
| `options` | Object | Configuration for error handling (optional) |

### Options Object

```javascript
{
  errorBoundary: {
    onError: (error, context) => { /* Handle error */ },
    fallback: (error, context) => { /* Return fallback value */ },
    retry: true,           // Should retry on error? (default: true)
    maxRetries: 3,         // Maximum retry attempts (default: 3)
    retryDelay: 0          // Delay between retries in ms (default: 0)
  }
}
```

### Returns

- **Cleanup function** - Call this to stop watching and prevent memory leaks

 

## Why Does This Exist?

### The Problem with Regular Watchers

Let's say you're building a user profile editor that syncs changes to a server:

```javascript
const state = ReactiveUtils.state({
  user: {
    name: 'Alice',
    email: 'alice@example.com',
    phone: null
  }
});

// Regular watch - looks safe
watch(state, {
  phone: (newVal, oldVal) => {
    // Format and send to server
    const formatted = newVal.replace(/\D/g, '');
    syncToServer('phone', formatted);
  }
});
```

This works fine... until `phone` becomes `null`:

```
💥 TypeError: Cannot read property 'replace' of null
```

**What's the Real Issue?**

```
State Changes: phone = null
    ↓
Watcher Triggers
    ↓
Callback Runs
    ↓
newVal.replace() → 💥 ERROR
    ↓
Watcher BREAKS
    ↓
❌ Future changes to phone are ignored
❌ User thinks changes are saving (they're not)
❌ Silent failure - no feedback
```

**Problems:**

❌ **Watcher dies silently** - Stops responding to all future changes  
❌ **No user feedback** - They don't know sync failed  
❌ **Defensive code everywhere** - Need null checks for everything  
❌ **Hard to debug** - Silent failures are invisible  

### The Solution with safeWatch()

```javascript
const state = ReactiveUtils.state({
  user: {
    name: 'Alice',
    email: 'alice@example.com',
    phone: null
  }
});

// Safe watch - errors handled gracefully
safeWatch(state, 'phone', (newVal, oldVal) => {
  const formatted = newVal.replace(/\D/g, '');
  syncToServer('phone', formatted);
}, {
  errorBoundary: {
    onError: (error) => {
      console.error('Phone sync failed:', error.message);
      showNotification('Unable to save phone number', 'error');
    }
  }
});

// Watcher stays alive! Future changes still work! ✅
```

**What Just Happened?**

```
State Changes: phone = null
    ↓
Watcher Triggers
    ↓
Callback Runs
    ↓
newVal.replace() → 💥 ERROR
    ↓
Error Boundary CATCHES IT
    ↓
onError() runs → Shows user notification
    ↓
✅ Watcher stays alive
✅ Future changes still work
✅ User gets feedback
```

**Benefits:**

✅ **Resilient watchers** - Errors don't kill your watcher  
✅ **User feedback** - Show clear error messages  
✅ **Automatic recovery** - Can retry failed operations  
✅ **Clean code** - No defensive null checks everywhere  
✅ **Better UX** - Users know when something goes wrong  

 

## Mental Model

Think of `safeWatch()` as the difference between a **security guard with no backup** versus a **security team with protocols**.

### Regular Watch (Lone Guard)

```
Guard Watching Door
  ↓
Suspicious Person Arrives
  ↓
Guard Confronts Them
  ↓
Fight Breaks Out 💥
  ↓
❌ Guard Knocked Out
❌ Door Now Unguarded
❌ Everyone Can Enter
```

**One problem = complete failure.**

### Safe Watch (Security Team)

```
Team Watching Door
  ↓
Suspicious Person Arrives
  ↓
Guard 1 Confronts Them
  ↓
Fight Breaks Out 💥
  ↓
✅ Guard 2 Steps In
✅ Incident Logged
✅ Manager Notified
✅ Door Still Guarded
```

**Problems are handled without abandoning the post.**

 

## How Does It Work?

Under the hood, `safeWatch()` wraps your callback in an **ErrorBoundary** and passes it to the regular watcher.

### Step-by-Step Internal Flow

1️⃣ **Watcher Creation**
```
safeWatch() called
    ↓
Creates ErrorBoundary instance
    ↓
Wraps your callback with error catching
    ↓
Passes to state.$watch()
    ↓
Watcher activated
```

2️⃣ **When Value Changes**
```
Watched property changes
    ↓
Watcher detects change
    ↓
Try Block:
  → Call your callback
  → Pass (newVal, oldVal)
  → Everything works? Done!
    ↓
Catch Block (if error):
  → Catch the error
  → Run onError callback
  → Maybe retry
  → Watcher stays alive!
```

3️⃣ **Error Handling Flow**

```
Callback Throws Error
    ↓
ErrorBoundary Catches It
    ↓
Check: Should retry?
    ├─→ YES: Attempt < maxRetries?
    │         ├─→ YES: Wait → Retry callback
    │         └─→ NO: Run fallback
    │
    └─→ NO: Run fallback or just log
    ↓
Watcher Continues Working ✅
```

 

## Basic Usage

### Example 1: Basic Error Handling

```javascript
const state = ReactiveUtils.state({ 
  count: 0,
  status: 'idle'
});

// Watch count with error handling
const cleanup = safeWatch(state, 'count', (newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} → ${newVal}`);
  
  // This might fail if external service is down
  reportToAnalytics('count_changed', newVal);
}, {
  errorBoundary: {
    onError: (error) => {
      console.error('Analytics reporting failed:', error);
      state.status = 'analytics_error';
    }
  }
});

// Later: clean up when done
cleanup();
```

### Example 2: Watching Nested Properties

```javascript
const state = ReactiveUtils.state({ 
  user: {
    profile: {
      email: 'alice@example.com'
    }
  }
});

// Watch nested property safely
safeWatch(state, function() {
  return this.user.profile.email;
}, (newEmail, oldEmail) => {
  // Validate and send
  if (!isValidEmail(newEmail)) {
    throw new Error('Invalid email format');
  }
  sendVerificationEmail(newEmail);
}, {
  errorBoundary: {
    onError: (error) => {
      console.error('Email validation failed:', error.message);
      showErrorMessage('Please enter a valid email');
    }
  }
});
```

### Example 3: Watch with Retries

```javascript
const state = ReactiveUtils.state({ apiEndpoint: '/api/settings' });

// Watch API endpoint changes with automatic retries
safeWatch(state, 'apiEndpoint', (newUrl, oldUrl) => {
  // Might fail due to network issues
  const response = fetch(newUrl);
  if (!response.ok) {
    throw new Error('API request failed');
  }
}, {
  errorBoundary: {
    retry: true,
    maxRetries: 3,
    retryDelay: 2000,
    
    onError: (error, context) => {
      if (context.willRetry) {
        console.log(`Retry ${context.attempt}/${context.maxRetries}...`);
      } else {
        console.error('All retries failed:', error);
        showErrorMessage('Unable to connect to API');
      }
    }
  }
});
```

### Example 4: Multiple Properties with Shared Handler

```javascript
const state = ReactiveUtils.state({
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com'
});

// Shared error handler
const handleSyncError = (field) => (error, context) => {
  console.error(`Failed to sync ${field}:`, error.message);
  showNotification(`${field} update failed`, 'error');
};

// Watch multiple properties safely
safeWatch(state, 'firstName', (val) => {
  syncToServer('firstName', val);
}, { errorBoundary: { onError: handleSyncError('firstName') }});

safeWatch(state, 'lastName', (val) => {
  syncToServer('lastName', val);
}, { errorBoundary: { onError: handleSyncError('lastName') }});

safeWatch(state, 'email', (val) => {
  syncToServer('email', val);
}, { errorBoundary: { onError: handleSyncError('email') }});
```

 

## Deep Dive: Error Handling in Watchers

### Understanding Error Context

The `onError` callback receives detailed context about what went wrong:

```javascript
safeWatch(state, 'data', (newVal) => {
  processData(newVal);
}, {
  errorBoundary: {
    onError: (error, context) => {
      console.log('Error:', error.message);
      console.log('Context:', context);
      // context = {
      //   type: 'watch',
      //   key: 'data',
      //   created: 1704672000000,
      //   attempt: 1,
      //   maxRetries: 3,
      //   willRetry: true
      // }
    }
  }
});
```

**Context properties:**

- `type` - Always `'watch'` (vs 'effect')
- `key` - The property name or `'function'` if watching a computed function
- `created` - Timestamp when watcher was created
- `attempt` - Current retry attempt number
- `maxRetries` - Maximum allowed retries
- `willRetry` - Will another retry happen?

### Conditional Error Handling

```javascript
const state = ReactiveUtils.state({ 
  environment: 'production',
  userData: null 
});

safeWatch(state, 'userData', (newData) => {
  validateAndProcess(newData);
}, {
  errorBoundary: {
    onError: (error, context) => {
      // Different handling per environment
      if (state.environment === 'development') {
        console.error('Full error:', error);
        debugger; // Pause for debugging
      } else {
        // Production: log silently
        errorTracker.log(error);
      }
      
      // Different handling per retry
      if (context.attempt === 1) {
        showNotification('Processing...', 'info');
      } else if (!context.willRetry) {
        showNotification('Failed to process data', 'error');
      }
    }
  }
});
```

 

## Deep Dive: Watching Functions vs Properties

### Watching a Property (String)

```javascript
const state = ReactiveUtils.state({ 
  count: 0 
});

// Watch property by name
safeWatch(state, 'count', (newVal, oldVal) => {
  console.log(`Count: ${oldVal} → ${newVal}`);
}, {
  errorBoundary: {
    onError: (error, context) => {
      console.log('Property:', context.key); // 'count'
    }
  }
});
```

### Watching a Computed Function

```javascript
const state = ReactiveUtils.state({
  firstName: 'Alice',
  lastName: 'Smith'
});

// Watch computed value
safeWatch(state, function() {
  // This function re-runs when firstName or lastName change
  return `${this.firstName} ${this.lastName}`;
}, (newName, oldName) => {
  console.log(`Full name: ${oldName} → ${newName}`);
  updateDisplayName(newName);
}, {
  errorBoundary: {
    onError: (error, context) => {
      console.log('Type:', context.key); // 'function'
      console.error('Name update failed:', error);
    }
  }
});
```

### When to Use Each

**Watch Property (String):**
- ✅ Simpler syntax
- ✅ Clear what's being watched
- ✅ Best for single properties

**Watch Function:**
- ✅ Watch multiple properties
- ✅ Watch computed values
- ✅ Watch complex expressions
- ✅ More flexible

 

## Common Patterns

### Pattern 1: Debounced Save with Error Handling

```javascript
const state = ReactiveUtils.state({ searchQuery: '' });

let saveTimeout;

safeWatch(state, 'searchQuery', (query) => {
  // Debounce the save
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    // This might fail
    saveSearchQuery(query);
  }, 300);
}, {
  errorBoundary: {
    retry: false,
    onError: (error) => {
      console.error('Failed to save search query:', error);
    }
  }
});
```

### Pattern 2: Validation Pipeline

```javascript
const state = ReactiveUtils.state({ 
  email: '',
  emailValid: false,
  emailError: null
});

safeWatch(state, 'email', (email) => {
  // Validation pipeline
  if (!email) {
    throw new Error('Email is required');
  }
  if (!email.includes('@')) {
    throw new Error('Email must contain @');
  }
  if (email.length < 5) {
    throw new Error('Email too short');
  }
  
  // All checks passed
  state.emailValid = true;
  state.emailError = null;
}, {
  errorBoundary: {
    retry: false,
    onError: (error) => {
      state.emailValid = false;
      state.emailError = error.message;
    }
  }
});
```

### Pattern 3: Sync with Fallback

```javascript
const state = ReactiveUtils.state({ 
  preferences: { theme: 'light' },
  syncStatus: 'idle'
});

safeWatch(state, function() {
  return this.preferences;
}, (newPrefs) => {
  state.syncStatus = 'syncing';
  syncToServer(newPrefs);
  state.syncStatus = 'synced';
}, {
  errorBoundary: {
    retry: true,
    maxRetries: 3,
    retryDelay: 1000,
    
    fallback: () => {
      // Use local storage as fallback
      localStorage.setItem('preferences', JSON.stringify(state.preferences));
      state.syncStatus = 'offline';
    },
    
    onError: (error, context) => {
      if (!context.willRetry) {
        showNotification('Syncing to local storage', 'warning');
      }
    }
  }
});
```

 

## Real-World Examples

### Example 1: Form Auto-Save

```javascript
const form = form({
  title: '',
  content: '',
  draft: true
});

// Auto-save draft every time content changes
safeWatch(form, function() {
  return this.values.content;
}, (newContent, oldContent) => {
  if (newContent.length > 0) {
    saveDraft({
      title: form.values.title,
      content: newContent,
      timestamp: Date.now()
    });
  }
}, {
  errorBoundary: {
    retry: true,
    maxRetries: 3,
    retryDelay: 2000,
    
    onError: (error, context) => {
      if (!context.willRetry) {
        showNotification('Failed to save draft', 'error');
      }
    },
    
    fallback: () => {
      // Fallback to localStorage
      localStorage.setItem('draft', JSON.stringify(form.values));
      showNotification('Draft saved locally', 'info');
    }
  }
});
```

### Example 2: Real-Time Collaboration

```javascript
const document = state({
  content: '',
  collaborators: [],
  cursorPosition: 0
});

// Sync content changes to other users
safeWatch(document, 'content', (newContent, oldContent) => {
  if (document.collaborators.length > 0) {
    broadcastChange({
      type: 'content',
      content: newContent,
      diff: computeDiff(oldContent, newContent)
    });
  }
}, {
  errorBoundary: {
    retry: true,
    maxRetries: 5,
    retryDelay: 500,
    
    onError: (error, context) => {
      if (context.attempt === 1) {
        showConnectionWarning();
      }
      if (!context.willRetry) {
        showDisconnectedState();
      }
    }
  }
});

// Sync cursor position (less critical)
safeWatch(document, 'cursorPosition', (pos) => {
  broadcastCursor(pos);
}, {
  errorBoundary: {
    retry: false, // Don't retry cursor updates
    onError: () => {
      // Fail silently - not critical
    }
  }
});
```

### Example 3: Shopping Cart Sync

```javascript
const cart = state({
  items: [],
  total: 0,
  lastSync: null
});

// Watch cart items
safeWatch(cart, function() {
  return this.items.length;
}, () => {
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Sync to server
  syncCartToServer(cart.items, cart.total);
  cart.lastSync = Date.now();
}, {
  errorBoundary: {
    retry: true,
    maxRetries: 3,
    retryDelay: 1000,
    
    onError: (error, context) => {
      if (!context.willRetry) {
        showNotification(
          'Unable to sync cart. Your items are saved locally.',
          'warning'
        );
      }
    },
    
    fallback: () => {
      // Save to localStorage as backup
      localStorage.setItem('cart', JSON.stringify({
        items: cart.items,
        total: cart.total,
        timestamp: Date.now()
      }));
    }
  }
});
```

 

## Summary

### Key Takeaways

✅ **`safeWatch()` wraps watchers in an error boundary** - Errors don't kill your watcher

✅ **Automatic retry logic** - Failed callbacks can retry with configurable settings

✅ **Fallback handling** - Provide alternative behavior when operations fail

✅ **Resilient applications** - One failing watcher doesn't break others

✅ **Clean code** - No try-catch clutter in every callback

✅ **Better UX** - Users get feedback when things go wrong

### When to Use `safeWatch()`

**Use `safeWatch()` when:**
- Syncing to external services (APIs, databases)
- Processing user input that might be invalid
- Working with network operations
- Handling third-party integrations
- Building production-ready applications

**Use regular `watch()` when:**
- You want errors to propagate (debugging)
- Operations are simple and safe
- You're in development mode
- You need absolute minimal overhead

### Quick Reference

```javascript
// Basic
safeWatch(state, 'property', (newVal, oldVal) => { });

// With error handler
safeWatch(state, 'property', callback, {
  errorBoundary: {
    onError: (error, context) => { }
  }
});

// With retries
safeWatch(state, 'property', callback, {
  errorBoundary: {
    retry: true,
    maxRetries: 3,
    retryDelay: 1000
  }
});

// Watch function with fallback
safeWatch(state, function() { return this.computed; }, callback, {
  errorBoundary: {
    fallback: (error) => { /* handle */ }
  }
});
```

 

**That's `safeWatch()`!** Build resilient reactive watchers that never quit. 🎉