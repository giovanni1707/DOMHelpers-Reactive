# `options.onError` - Error Handler Callback

## Quick Start (30 seconds)

```javascript
const userData = state({ name: '', data: {} });

// Without onError - errors logged to console only
autoSave(userData, 'user');

// With onError - custom error handling
autoSave(userData, 'user', {
  onError: (error, context) => {
    console.error('AutoSave error:', error.message);
    
    if (context === 'quota') {
      showToast('Storage full! Please free up space.');
    } else if (context === 'save') {
      showToast('Failed to save. Check your connection.');
    }
  }
});

// Now errors are handled gracefully ✨
```

**What just happened?** You added custom error handling - errors are caught and handled your way!

  

## What is `options.onError`?

`options.onError` is a callback function that **handles errors that occur during save, load, or sync operations**.

Simply put: it's like a safety net that catches problems and lets you handle them gracefully instead of crashing.

Think of it as **error insurance** for your storage operations.

  

## Syntax

```javascript
autoSave(state, key, {
  onError: (error, context) => {
    // Handle the error
  }
});
```

**Parameters:**
- `error` - The Error object with details
- `context` - String indicating where error occurred ('save', 'load', 'sync', 'quota', etc.)

**Returns:**
- Nothing (void function)

**Default:** `null` (errors logged to console)

  

## Why Does This Exist?

### The Problem: Silent Failures

Without error handling, storage operations can fail silently:

```javascript
const userData = state({ data: {} });
autoSave(userData, 'user');

// User makes changes
userData.data = generateLargeObject(); // 10MB of data

// Save fails (quota exceeded) but...
// - No user notification ❌
// - User thinks it saved ❌
// - Data lost on page reload ❌
// - Confusing experience ❌
```

**What's the Real Issue?**

```
Storage operation fails
        |
        v
Error logged to console
        |
        v
User not notified ❌
        |
        v
User thinks it worked ❌
        |
        v
Data loss, confusion ❌
```

**Problems:**
❌ **Silent failures** - User unaware of problems  
❌ **Data loss** - Users think data saved when it didn't  
❌ **No recovery** - Can't handle or retry failures  
❌ **Poor UX** - Confusing experience  

### The Solution with `options.onError`

```javascript
const userData = state({ data: {} });

autoSave(userData, 'user', {
  onError: (error, context) => {
    if (context === 'quota') {
      // Storage full
      showDialog({
        title: 'Storage Full',
        message: 'Please clear some space and try again.',
        actions: ['Clear Cache', 'Dismiss']
      });
    } else if (context === 'save') {
      // Save failed
      showToast('Failed to save. Your changes are not saved.');
      
      // Offer retry
      setTimeout(() => {
        userData.$save();
      }, 5000);
    }
  }
});
```

**What Just Happened?**

```
Storage operation fails
        |
        v
onError callback fires
        |
        v
User notified ✅
        |
        v
Recovery options offered ✅
        |
        v
Better experience ✅
```

**Benefits:**
✅ **User awareness** - Notified of failures  
✅ **Recovery options** - Can retry or fix issues  
✅ **Better UX** - Clear error messages  
✅ **Data protection** - Prevent silent data loss  

  

## Mental Model

Think of storage without onError as **driving without insurance**:

```
No onError (No Safety Net)
┌─────────────────────┐
│  Operation fails    │
│                     │
│  Error in console   │
│                     │
│  User unaware       │
│                     │
│  Data lost ❌       │
└─────────────────────┘
```

Think of onError as **having insurance and airbags**:

```
With onError (Safety Net)
┌─────────────────────┐
│  Operation fails    │
│       ↓             │
│  onError catches it │
│       ↓             │
│  User notified      │
│       ↓             │
│  Recovery offered   │
│       ↓             │
│  Problem handled ✅ │
└─────────────────────┘
```

**Key Insight:** onError prevents silent failures.

  

## How Does It Work?

The onError callback catches all storage-related errors:

### Error Flow

```
Try to save/load/sync
        |
        v
    Operation
        |
    [SUCCESS] → Continue
        |
    [FAILURE] → Catch error
                     |
                     v
                Call onError ✨
                     |
                     v
                Your handling
```

### Implementation

```javascript
// Inside autoSave
function save() {
  try {
    const data = onSave ? onSave(state) : state;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    if (options.onError) {
      const context = error.name === 'QuotaExceededError' ? 'quota' : 'save';
      options.onError(error, context);
    } else {
      console.error('[autoSave] Error:', error);
    }
  }
}
```

  

## Error Contexts

### Common Error Contexts

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    switch(context) {
      case 'save':
        // Failed to save to storage
        break;
        
      case 'load':
        // Failed to load from storage
        break;
        
      case 'quota':
        // Storage quota exceeded
        break;
        
      case 'sync':
        // Cross-tab sync failed
        break;
        
      case 'getValue':
        // Error getting state value
        break;
        
      case 'setValue':
        // Error setting state value
        break;
    }
  }
});
```

  

## Basic Usage

### Example 1: Simple Error Logging

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    console.error(`Storage error [${context}]:`, error.message);
  }
});
```

  

### Example 2: User Notifications

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    if (context === 'quota') {
      showToast('Storage full! Clear some data.');
    } else {
      showToast('Failed to save changes.');
    }
  }
});
```

  

### Example 3: Retry Logic

```javascript
let retryCount = 0;
const MAX_RETRIES = 3;

autoSave(state, 'data', {
  onError: (error, context) => {
    if (context === 'save' && retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retry ${retryCount}/${MAX_RETRIES}...`);
      
      setTimeout(() => {
        state.$save();
      }, 1000 * retryCount); // Exponential backoff
    } else {
      showError('Failed to save after multiple attempts');
      retryCount = 0;
    }
  }
});
```

  

## Real-World Examples

### Example 1: Storage Quota Management

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    if (context === 'quota') {
      showDialog({
        title: 'Storage Full',
        message: 'Your browser storage is full.',
        buttons: [
          {
            text: 'Clear Cache',
            onClick: () => {
              clearCache();
              state.$save(); // Retry
            }
          },
          {
            text: 'Clear Old Data',
            onClick: () => {
              clearOldData();
              state.$save(); // Retry
            }
          },
          {
            text: 'Cancel',
            onClick: () => {}
          }
        ]
      });
    }
  }
});
```

  

### Example 2: Network Error Handling

```javascript
autoSave(state, 'data', {
  storage: 'sessionStorage',
  onError: (error, context) => {
    if (context === 'sync') {
      // Cross-tab sync failed
      console.warn('Sync failed, likely due to storage unavailability');
      
      showToast('Real-time sync unavailable', {
        action: 'Reload',
        onAction: () => window.location.reload()
      });
    }
  }
});
```

  

### Example 3: Corrupted Data Recovery

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    if (context === 'load') {
      console.error('Failed to load data:', error);
      
      // Attempt recovery
      if (confirm('Data corrupted. Reset to defaults?')) {
        state.$clear();
        loadDefaults();
      }
    }
  }
});
```

  

### Example 4: Analytics and Monitoring

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    // Log to analytics
    analytics.track('storage_error', {
      context,
      errorMessage: error.message,
      errorType: error.name,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
    
    // Also log to error monitoring service
    if (window.Sentry) {
      Sentry.captureException(error, {
        tags: { context, feature: 'autoSave' }
      });
    }
    
    // Show user-friendly message
    showToast('An error occurred. Support has been notified.');
  }
});
```

  

### Example 5: Graceful Degradation

```javascript
let storageAvailable = true;

autoSave(state, 'data', {
  onError: (error, context) => {
    if (context === 'save' || context === 'load') {
      storageAvailable = false;
      
      showWarning(
        'Storage unavailable. Changes will not be saved. ' +
        'Enable cookies/storage in browser settings.'
      );
      
      // Switch to in-memory only
      state.$stopAutoSave();
    }
  }
});

// Check if storage is working
if (!storageAvailable) {
  showBanner('App is running in temporary mode. Data will not persist.');
}
```

  

## Common Patterns

### Pattern 1: Error Classification

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    const severity = classifyError(error, context);
    
    if (severity === 'critical') {
      showError('Critical error: ' + error.message);
      sendToErrorTracking(error);
    } else if (severity === 'warning') {
      console.warn('Warning:', error.message);
    } else {
      console.log('Minor issue:', error.message);
    }
  }
});

function classifyError(error, context) {
  if (context === 'quota') return 'critical';
  if (context === 'save') return 'warning';
  return 'info';
}
```

  

### Pattern 2: User-Friendly Messages

```javascript
const ERROR_MESSAGES = {
  quota: 'Your storage is full. Please free up space.',
  save: 'Changes could not be saved. Please try again.',
  load: 'Could not load your data. Starting fresh.',
  sync: 'Real-time sync is unavailable.'
};

autoSave(state, 'data', {
  onError: (error, context) => {
    const message = ERROR_MESSAGES[context] || 'An error occurred.';
    showToast(message);
  }
});
```

  

### Pattern 3: Fallback Storage

```javascript
autoSave(state, 'data', {
  storage: 'localStorage',
  onError: (error, context) => {
    if (context === 'quota' || context === 'save') {
      console.warn('localStorage failed, trying sessionStorage...');
      
      // Try sessionStorage as fallback
      try {
        sessionStorage.setItem('data_backup', JSON.stringify(state));
        showToast('Saved to temporary storage');
      } catch (e) {
        showError('All storage options failed');
      }
    }
  }
});
```

  

### Pattern 4: Error Recovery Queue

```javascript
const errorQueue = [];

autoSave(state, 'data', {
  onError: (error, context) => {
    errorQueue.push({
      error,
      context,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(state))
    });
    
    // Try to recover periodically
    if (errorQueue.length === 1) {
      startRecoveryProcess();
    }
  }
});

function startRecoveryProcess() {
  const interval = setInterval(() => {
    if (errorQueue.length === 0) {
      clearInterval(interval);
      return;
    }
    
    const item = errorQueue[0];
    try {
      localStorage.setItem('data', JSON.stringify(item.data));
      errorQueue.shift(); // Success - remove from queue
      showToast('Recovered unsaved data');
    } catch (e) {
      // Still failing, try again later
    }
  }, 5000);
}
```

  

### Pattern 5: Debug Mode

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

autoSave(state, 'data', {
  onError: (error, context) => {
    if (DEBUG) {
      // Detailed logging in development
      console.group('Storage Error');
      console.error('Context:', context);
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      console.error('State:', state);
      console.groupEnd();
    } else {
      // Simple logging in production
      console.error(`[${context}] ${error.message}`);
    }
  }
});
```

  

### Pattern 6: Circuit Breaker

```javascript
let failureCount = 0;
const MAX_FAILURES = 5;
let circuitOpen = false;

autoSave(state, 'data', {
  onError: (error, context) => {
    failureCount++;
    
    if (failureCount >= MAX_FAILURES) {
      circuitOpen = true;
      state.$stopAutoSave();
      
      showError(
        'Storage system unavailable. Auto-save disabled. ' +
        'Please save manually or refresh the page.'
      );
    } else {
      showToast(`Save failed (${failureCount}/${MAX_FAILURES})`);
    }
  }
});

// Reset circuit after time
setInterval(() => {
  if (circuitOpen) {
    failureCount = 0;
    circuitOpen = false;
    state.$startAutoSave();
    showToast('Auto-save re-enabled');
  }
}, 60000); // Reset every minute
```

  

## Common Error Types

### QuotaExceededError

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded');
      // Handle quota issues
    }
  }
});
```

### SecurityError

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    if (error.name === 'SecurityError') {
      console.error('Storage blocked by browser settings');
      showWarning('Please enable storage in browser settings');
    }
  }
});
```

### SyntaxError (JSON parsing)

```javascript
autoSave(state, 'data', {
  onError: (error, context) => {
    if (error.name === 'SyntaxError' && context === 'load') {
      console.error('Corrupted data detected');
      state.$clear();
      showToast('Data corrupted. Starting fresh.');
    }
  }
});
```

  

## Summary

**What is `options.onError`?**  
A callback function that handles errors during save, load, and sync operations.

**Why use it?**
- ✅ Catch and handle failures gracefully
- ✅ Notify users of problems
- ✅ Provide recovery options
- ✅ Prevent silent data loss
- ✅ Better user experience

**Key Takeaway:**

```
Without onError         With onError
      |                      |
Silent failures        Caught errors
      |                      |
User unaware ❌        User notified ✅
```

**One-Line Rule:** Use onError to handle storage failures gracefully and keep users informed.

**Common Error Contexts:**
- **save**: Save operation failed
- **load**: Load operation failed
- **quota**: Storage quota exceeded
- **sync**: Cross-tab sync failed

**Best Practices:**
- Always provide user feedback
- Offer recovery options
- Log errors for debugging
- Send critical errors to monitoring
- Implement retry logic
- Have fallback strategies

**Remember:** onError turns failures into manageable situations! 🎉