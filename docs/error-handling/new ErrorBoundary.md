# new ErrorBoundary(options)

Create a new ErrorBoundary instance with custom error handling configuration.

## Quick Start (30 seconds)

```javascript
// Create error boundary with options
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`[${context.type}] Error:`, error.message);
  },
  fallback: (error, context) => {
    return { status: 'error', message: error.message };
  },
  retry: true,
  maxRetries: 3,
  retryDelay: 1000
});

// Now use it to wrap functions
const safeOperation = boundary.wrap(() => {
  // Your code here
});
```

**The magic:** `new ErrorBoundary()` creates a **configured error handler** that you can reuse across your application!

 

## What is new ErrorBoundary()?

`new ErrorBoundary(options)` is a **constructor call** that creates a new ErrorBoundary instance with your custom configuration for handling errors, retries, and fallbacks.

Simply put: **It's how you create a customized error handler that fits your needs.**

Think of it like this:
- You define how errors should be handled
- You configure retry behavior
- You provide fallback values
- You get back a boundary instance
- Use that instance to wrap any functions that need protection

 

## Syntax

```javascript
// Basic - with default options
const boundary = new ErrorBoundary();

// With custom error handler
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error('Error:', error);
  }
});

// With all options
const boundary = new ErrorBoundary({
  onError: (error, context) => { /* ... */ },
  fallback: (error, context) => { /* ... */ },
  retry: true,
  maxRetries: 3,
  retryDelay: 1000
});

// Access via ReactiveUtils
const boundary = new ReactiveUtils.ErrorBoundary(options);
```

**Parameters:**
- `options` (optional) - Configuration object

**Returns:**
- A new ErrorBoundary instance

 

## Why Does This Exist?

### The Challenge with Generic Error Handling

Without configuration, you'd need to write error handling for every function:

```javascript
// Function 1 - needs retry logic
async function fetchData() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const response = await fetch('/api/data');
      return response.json();
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts >= 3) {
        console.error('Max retries reached');
        return null;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// Function 2 - needs same retry logic
async function fetchUsers() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const response = await fetch('/api/users');
      return response.json();
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts >= 3) {
        console.error('Max retries reached');
        return [];
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// Duplicate code everywhere! 😰
```

At first glance, these functions work. But there are hidden problems.

**What's the Real Issue?**

```
Write error handling for Function 1
      ↓
Copy-paste for Function 2
      ↓
Copy-paste for Function 3
      ↓
Want to change retry logic?
      ↓
Must update ALL functions! 💥
      ↓
Error-prone and unmaintainable
```

**Problems:**
❌ Duplicate error handling code everywhere  
❌ Hard to maintain consistency  
❌ Changes require updating many places  
❌ Easy to forget error handling  
❌ No centralized configuration  

### The Solution with new ErrorBoundary()

Configure once, use everywhere:

```javascript
// Configure ONCE
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`[${context.type}] Attempt ${context.attempt}:`, error);
  },
  fallback: (error, context) => {
    if (context.type === 'fetch') return null;
    if (context.type === 'users') return [];
    return undefined;
  },
  retry: true,
  maxRetries: 3,
  retryDelay: 1000
});

// Use everywhere - NO duplicate code
const fetchData = boundary.wrap(async () => {
  const response = await fetch('/api/data');
  return response.json();
}, { type: 'fetch' });

const fetchUsers = boundary.wrap(async () => {
  const response = await fetch('/api/users');
  return response.json();
}, { type: 'users' });

// Want to change retry logic? Change ONE place! ✨
```

**What just happened?**

```
Create configured boundary
      ↓
Wrap Function 1 with boundary
Wrap Function 2 with boundary
Wrap Function 3 with boundary
      ↓
All functions share same error handling
      ↓
Change config → All functions updated ✨
      ↓
Maintainable and consistent
```

**Benefits:**
✅ Configure error handling once  
✅ Reuse across many functions  
✅ Consistent behavior  
✅ Easy to update  
✅ Clean, maintainable code  

 

## Mental Model

Think of `new ErrorBoundary()` like **setting up a security system**:

### Without Configuration (Manual Security)
```
House 1
├─ Install alarm yourself
├─ Set sensitivity yourself
├─ Configure response yourself
└─ Maintain yourself

House 2
├─ Install alarm yourself (again!)
├─ Set sensitivity yourself (again!)
├─ Configure response yourself (again!)
└─ Maintain yourself (again!)

Repeat for every house! 😰
```

### With Configuration (Configured Security System)
```
Security Company HQ
      ↓
Configure ONCE:
├─ Alarm sensitivity: High
├─ Response time: 5 minutes
├─ Alert method: Call + Text
└─ Auto-retry: 3 times
      ↓
Install in all houses
      ↓
All houses protected consistently! ✨
      ↓
Change settings at HQ → All updated
```

**Key insight:** Just like configuring a security system once and using it everywhere, `new ErrorBoundary(options)` lets you define error handling once and apply it to any function.

 

## How Does It Work?

### Under the Hood

The constructor stores your configuration and returns an instance:

```javascript
// Simplified implementation
class ErrorBoundary {
  constructor(options = {}) {
    // Store error handler (with default)
    this.onError = options.onError || ((error, context) => {
      console.error('[ErrorBoundary] Error in', context.type, ':', error);
    });
    
    // Store fallback function
    this.fallback = options.fallback;
    
    // Store retry settings
    this.retry = options.retry !== false; // Default true
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 0;
  }
  
  wrap(fn, context = {}) {
    // Use stored configuration to wrap function
    // (See wrap() documentation for details)
  }
}
```

**What's happening:**

```
1️⃣ Call new ErrorBoundary(options)
        ↓
2️⃣ Constructor runs
        ↓
3️⃣ Store onError handler
        ↓
4️⃣ Store fallback function
        ↓
5️⃣ Store retry configuration
        ↓
6️⃣ Return boundary instance
        ↓
7️⃣ Use instance.wrap() with stored config ✨
```

### Default Options

If you don't provide options, these defaults are used:

```javascript
const defaultOptions = {
  onError: (error, context) => {
    console.error('[ErrorBoundary] Error:', error);
  },
  fallback: undefined,      // No fallback by default
  retry: true,              // Retry enabled
  maxRetries: 3,            // Up to 3 retries
  retryDelay: 0             // Immediate retry (no delay)
};
```

 

## Basic Usage

### Example 1: Minimal Configuration

```javascript
// Just with error handler
const boundary = new ErrorBoundary({
  onError: (error) => {
    console.error('Something failed:', error.message);
  }
});

const safeFunction = boundary.wrap(() => {
  throw new Error('Oops!');
});

safeFunction();
// Logs: Something failed: Oops!
// Returns undefined (no fallback)
```

**What's happening?**
- Create boundary with just error handler
- Wrap a function that throws
- Error is caught and logged
- Uses default retry behavior (3 attempts)

 

### Example 2: With Fallback

```javascript
const boundary = new ErrorBoundary({
  onError: (error) => {
    console.error('Error:', error.message);
  },
  fallback: () => {
    return 'default value';
  }
});

const getValue = boundary.wrap(() => {
  throw new Error('Failed to get value');
});

const result = getValue();
// Logs: Error: Failed to get value
console.log(result); // 'default value'
```

**What's happening?**
- Error is caught
- Fallback function is called
- Returns fallback value instead of error

 

### Example 3: Disable Retry

```javascript
const boundary = new ErrorBoundary({
  retry: false,  // No retries
  onError: (error, context) => {
    console.error('Failed on first attempt:', error.message);
    console.log('Retries:', context.maxRetries); // 0
  },
  fallback: () => null
});

let attempts = 0;
const flaky = boundary.wrap(() => {
  attempts++;
  console.log('Attempt:', attempts);
  throw new Error('Fail');
});

flaky();
// Logs: Attempt: 1
// Logs: Failed on first attempt: Fail
// Only tries once!
```

**What's happening?**
- Retry disabled in options
- Function only called once
- Fallback returned immediately

 

## All Options Explained

### Option: `onError`

**Purpose:** Handle errors when they occur

**Type:** `(error: Error, context: Object) => void`

**Default:** Logs error to console

**Example:**
```javascript
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    // Log to console
    console.error(`[${context.type}] Error:`, error.message);
    
    // Send to error tracking
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, {
        tags: {
          type: context.type,
          attempt: context.attempt
        }
      });
    }
    
    // Show user notification
    if (context.attempt >= context.maxRetries) {
      showNotification('Operation failed. Please try again.');
    }
  }
});
```

**Context object includes:**
```javascript
{
  type: 'fetch',           // From wrap() call
  operation: 'load',       // From wrap() call
  attempt: 2,              // Current attempt (1-indexed)
  maxRetries: 3,           // Max retries from options
  willRetry: true          // Whether another retry will happen
}
```

 

### Option: `fallback`

**Purpose:** Provide default value when all retries fail

**Type:** `(error: Error, context: Object) => any`

**Default:** `undefined` (no fallback)

**Example:**
```javascript
const boundary = new ErrorBoundary({
  fallback: (error, context) => {
    // Different fallbacks for different operations
    switch (context.type) {
      case 'fetch-user':
        return { id: null, name: 'Guest' };
      
      case 'fetch-list':
        return [];
      
      case 'parse-json':
        return {};
      
      default:
        return null;
    }
  }
});
```

**When called:**
- After all retries are exhausted
- If retry is disabled
- Only if function didn't succeed

 

### Option: `retry`

**Purpose:** Enable or disable automatic retries

**Type:** `boolean`

**Default:** `true`

**Example:**
```javascript
// Retry enabled (default)
const boundary1 = new ErrorBoundary({
  retry: true,
  maxRetries: 3
});

// Retry disabled
const boundary2 = new ErrorBoundary({
  retry: false  // Fail immediately, no retries
});
```

**When to disable:**
- Client errors (4xx) that won't succeed on retry
- Parse errors that are deterministic
- Operations that should fail fast

 

### Option: `maxRetries`

**Purpose:** Maximum number of retry attempts

**Type:** `number`

**Default:** `3`

**Example:**
```javascript
// Few retries for fast operations
const quickBoundary = new ErrorBoundary({
  maxRetries: 2  // Try twice
});

// Many retries for important operations
const criticalBoundary = new ErrorBoundary({
  maxRetries: 10  // Try up to 10 times
});

// No retries
const noRetryBoundary = new ErrorBoundary({
  maxRetries: 0  // Equivalent to retry: false
});
```

**Considerations:**
- Higher values increase resilience but delay failure
- Lower values fail faster
- Consider operation importance and timeout constraints

 

### Option: `retryDelay`

**Purpose:** Milliseconds to wait between retry attempts

**Type:** `number`

**Default:** `0` (immediate retry)

**Example:**
```javascript
// Immediate retry (default)
const boundary1 = new ErrorBoundary({
  retryDelay: 0
});

// Wait 1 second between retries
const boundary2 = new ErrorBoundary({
  retryDelay: 1000
});

// Wait 5 seconds (for rate-limited APIs)
const boundary3 = new ErrorBoundary({
  retryDelay: 5000,
  onError: (error, context) => {
    console.log(`Waiting ${5000}ms before retry ${context.attempt + 1}...`);
  }
});
```

**When to use:**
- Rate-limited APIs
- Temporary server issues
- Network congestion
- Exponential backoff (calculate delay in onError)

 

## Common Configurations

### Configuration 1: Development Mode

```javascript
const devBoundary = new ErrorBoundary({
  onError: (error, context) => {
    // Verbose logging in development
    console.group(`🔴 Error in ${context.type}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.log('Context:', context);
    console.groupEnd();
  },
  retry: false,  // Fail fast in development
  fallback: (error, context) => {
    // Return debug info
    return {
      __error: true,
      message: error.message,
      context: context
    };
  }
});
```

 

### Configuration 2: Production Mode

```javascript
const prodBoundary = new ErrorBoundary({
  onError: (error, context) => {
    // Minimal console logging
    console.error(`[${context.type}] Error`);
    
    // Send to monitoring service
    sendToSentry(error, {
      tags: context,
      level: 'error'
    });
  },
  retry: true,
  maxRetries: 3,
  retryDelay: 1000,
  fallback: (error, context) => {
    // User-friendly defaults
    if (context.type === 'fetch') {
      return { error: 'Unable to load data. Please try again.' };
    }
    return null;
  }
});
```

 

### Configuration 3: API Calls

```javascript
const apiBoundary = new ErrorBoundary({
  onError: (error, context) => {
    const status = error.status || 0;
    
    if (status >= 500) {
      console.error('Server error - retrying...');
    } else if (status >= 400) {
      console.error('Client error - not retrying');
      context.maxRetries = 0; // Stop retrying
    }
  },
  retry: true,
  maxRetries: 5,
  retryDelay: 2000,  // Wait 2 seconds
  fallback: (error) => {
    return {
      success: false,
      error: error.message,
      status: error.status || 0
    };
  }
});
```

 

### Configuration 4: Parse Operations

```javascript
const parseBoundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`Parse error in ${context.source}:`, error.message);
  },
  retry: false,  // Parse errors won't fix themselves
  fallback: (error, context) => {
    // Return empty structure based on expected format
    if (context.format === 'json') {
      return {};
    }
    if (context.format === 'array') {
      return [];
    }
    return null;
  }
});
```

 

### Configuration 5: Silent Failures

```javascript
const silentBoundary = new ErrorBoundary({
  onError: (error, context) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Silent error:', error.message);
    }
    
    // Track but don't notify user
    trackError('silent', error, context);
  },
  retry: false,
  fallback: () => undefined  // Return undefined silently
});
```

 

## Edge Cases and Gotchas

### Gotcha 1: Options Are Stored, Not Copied

```javascript
const options = {
  maxRetries: 3,
  onError: (error) => console.error(error)
};

const boundary = new ErrorBoundary(options);

// Modifying original options doesn't affect boundary
options.maxRetries = 10;

// Boundary still uses 3 retries
```

**What's happening:**
- Options are read during construction
- Stored in the instance
- Changing original object doesn't affect boundary

 

### Gotcha 2: Fallback Called After All Retries

```javascript
let attemptCount = 0;

const boundary = new ErrorBoundary({
  maxRetries: 3,
  fallback: () => {
    console.log('Fallback called after attempts:', attemptCount);
    return 'fallback';
  }
});

const fn = boundary.wrap(() => {
  attemptCount++;
  throw new Error('Fail');
});

fn();
// Logs: Fallback called after attempts: 3
// Fallback only called after all retries exhausted
```

**What's happening:**
- Fallback is the last resort
- Only called after maxRetries reached
- Not called on each retry

 

### Gotcha 3: No Option Validation

```javascript
// Typo in option name
const boundary = new ErrorBoundary({
  maxRetrys: 5,  // Wrong! Should be 'maxRetries'
  onEror: () => {}  // Wrong! Should be 'onError'
});

// Boundary uses defaults (typos ignored)
// No error thrown!
```

**What's happening:**
- Constructor doesn't validate option names
- Typos are silently ignored
- Default values used instead
- Always double-check option names

 

### Gotcha 4: Async Fallback Functions

```javascript
const boundary = new ErrorBoundary({
  fallback: async () => {
    // This won't work as expected!
    await new Promise(r => setTimeout(r, 1000));
    return 'delayed';
  }
});

const fn = boundary.wrap(() => {
  throw new Error('Fail');
});

const result = fn();
console.log(result); // Promise { <pending> }
// Not the actual value!
```

**What's happening:**
- Fallback can be async
- But wrap() doesn't await it
- Returns Promise, not value
- Keep fallback functions synchronous

**Solution:**
```javascript
// Make the wrapped function async
const fn = boundary.wrap(async () => {
  throw new Error('Fail');
});

const result = await fn();
console.log(result); // 'delayed' ✓
```

 

## Summary

### Key Takeaways

✅ **`new ErrorBoundary(options)` creates a configured error handler**  
✅ **Options include:** `onError`, `fallback`, `retry`, `maxRetries`, `retryDelay`  
✅ **Configure once, use everywhere** via `boundary.wrap()`  
✅ **Defaults are sensible:** retry enabled, 3 max retries, no delay  
✅ **Different boundaries for different needs** (API, parse, etc.)  
✅ **Options are stored at construction** and can't be changed later  
✅ **No option validation** - check spelling carefully  

### Quick Reference

```javascript
// All options
const boundary = new ErrorBoundary({
  // Required: none (all optional)
  
  // Error handler
  onError: (error, context) => {
    console.error('Error:', error.message);
  },
  
  // Fallback value
  fallback: (error, context) => {
    return 'safe default';
  },
  
  // Retry configuration
  retry: true,          // Enable retries
  maxRetries: 3,        // Up to 3 retries
  retryDelay: 1000      // Wait 1s between retries
});

// Use the boundary
const safe = boundary.wrap(riskyFunction);
```

### One-Line Rule

> **Call `new ErrorBoundary(options)` to create a configured error handler that can be reused across your application—define your error strategy once and apply it everywhere.**

 

**Next Steps:**
- Learn about [`wrap()`](./wrap.md) to use your boundary
- Explore [ErrorBoundary class](./ErrorBoundary.md) overview
- Read about [error handling patterns](./error-patterns.md)