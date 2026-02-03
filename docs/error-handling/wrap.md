# boundary.wrap()

Wrap a function with error handling, retry logic, and fallback values using an ErrorBoundary instance.

## Quick Start (30 seconds)

```javascript
// Create boundary
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`[${context.type}] Error:`, error.message);
  }
});

// Wrap a risky function
const safeFetch = boundary.wrap(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  { type: 'api', operation: 'fetch-data' }
);

// Call wrapped function - errors are caught
const data = await safeFetch();
```

**The magic:** `wrap()` turns any risky function into a **safe version** that catches errors and handles them gracefully!

 

## What is boundary.wrap()?

`boundary.wrap()` is an **instance method** on ErrorBoundary that wraps a function with error handling, using the configuration from the boundary instance.

Simply put: **It's how you protect a function from crashing your app.**

Think of it like this:
- You have a function that might throw errors
- You have a boundary with error handling configured
- Call `boundary.wrap(fn)` to get a safe version
- The safe version catches errors using the boundary's configuration
- Your app stays stable even when things go wrong

 

## Syntax

```javascript
// Basic wrap
const safeFunction = boundary.wrap(riskyFunction);

// With context
const safeFunction = boundary.wrap(
  riskyFunction,
  { type: 'api', operation: 'fetch' }
);

// Call wrapped function normally
const result = safeFunction(arg1, arg2);

// Async functions work too
const result = await safeFetch();
```

**Parameters:**
- `fn` - Function to wrap (sync or async)
- `context` (optional) - Object with context information for error tracking

**Returns:**
- A wrapped function with the same signature as the original

 

## Why Does This Exist?

### The Challenge Without Wrapping

When functions throw errors, they can crash your entire application:

```javascript
function parseConfig(jsonString) {
  // This might throw!
  return JSON.parse(jsonString);
}

function loadUserData(userId) {
  // This might throw!
  const response = fetch(`/api/users/${userId}`);
  return response.json();
}

// Using them directly is risky
const config = parseConfig(invalidJson);  // 💥 Crashes app
const user = await loadUserData(999);     // 💥 Crashes app

// Every call site needs try-catch
try {
  const config = parseConfig(jsonString);
} catch (error) {
  console.error(error);
  // Handle error...
}

// Repeat everywhere! 😰
```

At first glance, you might think "just use try-catch everywhere." But that's the problem.

**What's the Real Issue?**

```
Risky Function 1
      ↓
Every caller needs try-catch
      ↓
Risky Function 2
      ↓
Every caller needs try-catch
      ↓
Duplicate error handling everywhere 💥
      ↓
Easy to forget
      ↓
One missing try-catch = app crash
```

**Problems:**
❌ Must wrap every call in try-catch  
❌ Duplicate error handling code  
❌ Easy to forget  
❌ Inconsistent error handling  
❌ Can't reuse error logic  

### The Solution with boundary.wrap()

Wrap once, use safely everywhere:

```javascript
// Create boundary with error handling
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`[${context.type}] Error:`, error.message);
    logToService(error, context);
  },
  fallback: (error, context) => {
    if (context.type === 'parse') return {};
    if (context.type === 'fetch') return null;
    return undefined;
  }
});

// Wrap functions ONCE
const parseConfig = boundary.wrap(
  (jsonString) => JSON.parse(jsonString),
  { type: 'parse' }
);

const loadUserData = boundary.wrap(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  { type: 'fetch' }
);

// Use safely ANYWHERE - no try-catch needed! ✨
const config = parseConfig(invalidJson);  // Returns {} (fallback)
const user = await loadUserData(999);     // Returns null (fallback)

// Error handling is consistent and centralized
```

**What just happened?**

```
Create boundary with config
      ↓
Wrap risky functions once
      ↓
Use everywhere safely
      ↓
Errors caught automatically
      ↓
Error handler runs
      ↓
Fallback returned
      ↓
App keeps running ✨
```

**Benefits:**
✅ Wrap once, use everywhere  
✅ No try-catch at call sites  
✅ Consistent error handling  
✅ Centralized configuration  
✅ Can't forget to handle errors  

 

## Mental Model

Think of `boundary.wrap()` like **gift wrapping**:

### Without Wrapping (Fragile Item)
```
Fragile Item (Risky Function)
      ↓
Hand it to someone → might drop it! 💥
      ↓
Hand it to someone else → might drop it! 💥
      ↓
Must be careful every time! 😰
```

### With Wrapping (Protected Item)
```
Fragile Item (Risky Function)
      ↓
Wrap with bubble wrap (boundary.wrap)
      ↓
[Protected Package]
      ↓
Hand to anyone → safe! ✓
      ↓
Drop it? → bubble wrap protects it! ✓
      ↓
Always safe to handle! ✨
```

**Key insight:** Just like bubble wrap protects a fragile item from damage, `boundary.wrap()` protects your function from crashing—it adds a safety layer that catches errors no matter where the function is called.

 

## How Does It Work?

### Under the Hood

`wrap()` returns a new function that wraps your original function in try-catch with retry logic:

```javascript
// Simplified implementation
class ErrorBoundary {
  // ... constructor ...
  
  wrap(fn, context = {}) {
    let retries = 0;
    
    return (...args) => {
      const attempt = () => {
        try {
          // Call original function
          return fn(...args);
        } catch (error) {
          retries++;
          
          const shouldRetry = this.retry && retries < this.maxRetries;
          
          // Call error handler
          this.onError(error, {
            ...context,
            attempt: retries,
            maxRetries: this.maxRetries,
            willRetry: shouldRetry
          });
          
          // Retry if configured
          if (shouldRetry) {
            if (this.retryDelay > 0) {
              setTimeout(attempt, this.retryDelay);
            } else {
              return attempt(); // Immediate retry
            }
          } else if (this.fallback) {
            // Return fallback
            return this.fallback(error, context);
          }
          // Otherwise returns undefined
        }
      };
      
      return attempt();
    };
  }
}
```

**What's happening:**

```
1️⃣ Call boundary.wrap(fn, context)
        ↓
2️⃣ Return new wrapper function
        ↓
3️⃣ Call wrapper(...args)
        ↓
4️⃣ Try to call original fn(...args)
        ↓
5️⃣ If error: catch it
        ↓
6️⃣ Call onError with context
        ↓
7️⃣ Retry if configured
        ↓
8️⃣ Or return fallback
        ↓
9️⃣ App continues safely ✨
```

### Preserving Function Signature

The wrapped function accepts the same arguments as the original:

```javascript
// Original function
function add(a, b) {
  return a + b;
}

// Wrapped function
const safeAdd = boundary.wrap(add);

// Call with same arguments
const result = safeAdd(2, 3); // 5
```

 

## Basic Usage

### Example 1: Simple Wrap

```javascript
const boundary = new ErrorBoundary({
  onError: (error) => {
    console.error('Error:', error.message);
  }
});

// Original function that throws
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// Wrap it
const safeDivide = boundary.wrap(divide);

// Use it - errors are caught
console.log(safeDivide(10, 2));  // 5
console.log(safeDivide(10, 0));  // undefined (error caught)
// Logs: Error: Division by zero
```

**What's happening?**
1. Create boundary with error handler
2. Wrap divide function
3. First call succeeds (returns 5)
4. Second call fails but is caught (returns undefined)

 

### Example 2: With Context

```javascript
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`[${context.operation}] ${error.message}`);
  }
});

const parseJSON = boundary.wrap(
  (text) => JSON.parse(text),
  { operation: 'json-parse', format: 'json' }
);

const parseXML = boundary.wrap(
  (text) => {
    // Fake XML parser that might fail
    if (!text.includes('<')) throw new Error('Invalid XML');
    return { parsed: true };
  },
  { operation: 'xml-parse', format: 'xml' }
);

parseJSON('invalid');
// Logs: [json-parse] Unexpected token i in JSON...

parseXML('invalid');
// Logs: [xml-parse] Invalid XML
```

**What's happening?**
- Each wrapped function has unique context
- Error handler receives context
- Can differentiate between different operations

 

### Example 3: Async Function

```javascript
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error('Fetch error:', error.message);
  },
  fallback: () => {
    return { error: true, data: null };
  }
});

const fetchUser = boundary.wrap(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  },
  { type: 'fetch-user' }
);

// Use with await
const user = await fetchUser(123);

if (user.error) {
  console.log('Failed to load user');
} else {
  console.log('User:', user.name);
}
```

**What's happening?**
- Wrap async function
- Use with await as normal
- Errors are caught
- Fallback returned on failure

 

## Deep Dive: Context Parameter

The context parameter provides information about the wrapped function for error tracking and handling.

### Basic Context

```javascript
const safeFn = boundary.wrap(
  () => { /* ... */ },
  { type: 'operation' }
);
```

The context is passed to `onError` and `fallback`:

```javascript
onError: (error, context) => {
  // context.type === 'operation'
}
```

 

### Rich Context for Tracking

```javascript
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    // Use context for detailed logging
    console.group('Error Details');
    console.log('Type:', context.type);
    console.log('Operation:', context.operation);
    console.log('User:', context.userId);
    console.log('Attempt:', context.attempt);
    console.log('Error:', error.message);
    console.groupEnd();
  }
});

const fetchUserData = boundary.wrap(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  {
    type: 'api',
    operation: 'fetch-user-data',
    endpoint: '/api/users/:id',
    userId: 123  // Can include dynamic data
  }
);
```

 

### Context for Different Fallbacks

```javascript
const boundary = new ErrorBoundary({
  fallback: (error, context) => {
    // Different fallbacks based on context
    switch (context.type) {
      case 'fetch-user':
        return { id: null, name: 'Guest', email: '' };
      
      case 'fetch-list':
        return [];
      
      case 'parse-json':
        return {};
      
      case 'parse-number':
        return 0;
      
      default:
        return null;
    }
  }
});
```

 

### Context for Conditional Retry

```javascript
const boundary = new ErrorBoundary({
  maxRetries: 3,
  onError: (error, context) => {
    // Stop retrying for certain errors
    if (error.status === 404) {
      context.maxRetries = 0; // Stop retrying
      console.log('Resource not found - not retrying');
    }
    
    if (error.status >= 500) {
      console.log(`Server error - retry ${context.attempt}/${context.maxRetries}`);
    }
  }
});
```

 

### Context Properties Available

In `onError` and `fallback`, context includes:

```javascript
{
  // Your custom context (from wrap call)
  type: 'api',
  operation: 'fetch',
  userId: 123,
  
  // Added by ErrorBoundary
  attempt: 2,          // Current attempt number (1, 2, 3, ...)
  maxRetries: 3,       // Max retries from boundary config
  willRetry: true      // Whether another retry will happen
}
```

 

## Sync vs Async Functions

### Synchronous Functions

```javascript
// Wrap sync function
const safeParse = boundary.wrap(
  (text) => JSON.parse(text)
);

// Call sync
const result = safeParse('{"key":"value"}');
console.log(result); // { key: 'value' }
```

 

### Asynchronous Functions

```javascript
// Wrap async function
const safeFetch = boundary.wrap(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  }
);

// Call with await
const result = await safeFetch();
console.log(result);
```

 

### Mixing Both

```javascript
const boundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`[${context.name}] Error:`, error.message);
  }
});

// Sync function
const parseNumber = boundary.wrap(
  (str) => {
    const num = parseInt(str, 10);
    if (isNaN(num)) throw new Error('Not a number');
    return num;
  },
  { name: 'parseNumber' }
);

// Async function
const fetchData = boundary.wrap(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  { name: 'fetchData' }
);

// Use both
const count = parseNumber('42');      // Sync
const data = await fetchData();       // Async
```

 

## Common Patterns

### Pattern 1: Wrap All API Calls

```javascript
// Create API boundary
const apiBoundary = new ErrorBoundary({
  retry: true,
  maxRetries: 3,
  retryDelay: 1000,
  onError: (error, context) => {
    console.error(`API Error [${context.endpoint}]:`, error.message);
  },
  fallback: (error, context) => {
    return {
      success: false,
      error: error.message,
      endpoint: context.endpoint
    };
  }
});

// Wrap all API functions
const api = {
  getUser: apiBoundary.wrap(
    async (id) => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    },
    { endpoint: '/api/users/:id', type: 'fetch' }
  ),
  
  getPosts: apiBoundary.wrap(
    async () => {
      const response = await fetch('/api/posts');
      return response.json();
    },
    { endpoint: '/api/posts', type: 'fetch' }
  ),
  
  createPost: apiBoundary.wrap(
    async (data) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    { endpoint: '/api/posts', type: 'create' }
  )
};

// Use safely
const user = await api.getUser(123);
const posts = await api.getPosts();
```

 

### Pattern 2: Wrap Effects

```javascript
const effectBoundary = new ErrorBoundary({
  onError: (error, context) => {
    console.error(`Effect "${context.name}" error:`, error.message);
  }
});

const state = ReactiveUtils.state({ count: 0, data: null });

// Wrap effect functions
effect(effectBoundary.wrap(
  () => {
    console.log('Count:', state.count);
  },
  { name: 'count-logger', type: 'effect' }
));

effect(effectBoundary.wrap(
  () => {
    const parsed = JSON.parse(state.data); // Might fail
    console.log('Parsed:', parsed);
  },
  { name: 'data-parser', type: 'effect' }
));

// If one effect fails, others continue
state.count = 5;  // Works ✓
state.data = 'invalid'; // Parser fails, but count-logger still works
```

 

### Pattern 3: Method Wrapping in Classes

```javascript
class UserService {
  constructor() {
    this.boundary = new ErrorBoundary({
      onError: (error, context) => {
        console.error(`[UserService.${context.method}] Error:`, error.message);
      },
      fallback: () => null
    });
    
    // Wrap all methods
    this.load = this.boundary.wrap(
      this._load.bind(this),
      { method: 'load' }
    );
    
    this.save = this.boundary.wrap(
      this._save.bind(this),
      { method: 'save' }
    );
    
    this.delete = this.boundary.wrap(
      this._delete.bind(this),
      { method: 'delete' }
    );
  }
  
  async _load(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
  
  async _save(user) {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
    return response.json();
  }
  
  async _delete(id) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
  }
}

const service = new UserService();
await service.load(123);   // Safe
await service.save(user);  // Safe
await service.delete(123); // Safe
```

 

### Pattern 4: Higher-Order Wrapper

```javascript
function createSafeAPI(boundary) {
  return {
    wrap: (fn, options = {}) => {
      return boundary.wrap(fn, {
        type: 'api',
        timestamp: Date.now(),
        ...options
      });
    }
  };
}

const boundary = new ErrorBoundary({
  retry: true,
  maxRetries: 3,
  onError: (error, context) => {
    console.error('API call failed:', context);
  }
});

const safeAPI = createSafeAPI(boundary);

// Use the helper
const getUser = safeAPI.wrap(
  async (id) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  { endpoint: '/users/:id' }
);
```

 

## Edge Cases and Gotchas

### Gotcha 1: Wrapped Function Creates New Instance

```javascript
const boundary = new ErrorBoundary();

const fn = () => { throw new Error('Fail'); };

const safe1 = boundary.wrap(fn);
const safe2 = boundary.wrap(fn);

console.log(safe1 === safe2); // false
// Each wrap() call creates a NEW function
```

**What's happening:**
- `wrap()` always returns a new function
- Wrapping the same function twice gives two different wrapped versions
- Each has its own retry counter

**Solution:**
```javascript
// Wrap once, reuse
const safeFn = boundary.wrap(fn);
// Use safeFn everywhere
```

 

### Gotcha 2: Context is Copied, Not Referenced

```javascript
const context = { count: 0 };

const boundary = new ErrorBoundary({
  onError: (error, ctx) => {
    console.log('Count:', ctx.count);
  }
});

const fn = boundary.wrap(() => {
  throw new Error('Fail');
}, context);

// Modify original context
context.count = 5;

fn();
// Logs: Count: 0 (not 5!)
```

**What's happening:**
- Context is copied when `wrap()` is called
- Modifying original doesn't affect wrapped function
- Context is frozen at wrap time

 

### Gotcha 3: Retry Counter Persists

```javascript
const boundary = new ErrorBoundary({
  maxRetries: 3,
  onError: (error, context) => {
    console.log('Attempt:', context.attempt);
  }
});

let callCount = 0;
const fn = boundary.wrap(() => {
  callCount++;
  if (callCount <= 3) throw new Error('Fail');
  return 'Success';
});

fn(); // Attempts 1, 2, 3, 4 - returns 'Success'
console.log('Call count:', callCount); // 4

fn(); // Attempts 5, 6, 7, 8 - returns 'Success'
console.log('Call count:', callCount); // 8
```

**What's happening:**
- Retry counter is created once per wrap() call
- It persists across all calls to the wrapped function
- Each call continues from the last retry count

**Solution:**
```javascript
// If you need fresh retries each call, create a new wrapper
function wrapFresh(fn) {
  return () => boundary.wrap(fn)();
}
```

 

### Gotcha 4: Arrow Function `this` Binding

```javascript
class MyClass {
  constructor() {
    this.value = 42;
    
    // ❌ Wrong - loses `this` context
    this.method = boundary.wrap(() => {
      console.log(this.value); // undefined!
    });
  }
}

// ✓ Solution 1: Use bind
class MyClass {
  constructor() {
    this.value = 42;
    this.method = boundary.wrap(function() {
      console.log(this.value); // 42 ✓
    }.bind(this));
  }
}

// ✓ Solution 2: Wrap in constructor
class MyClass {
  constructor() {
    this.value = 42;
    this.method = boundary.wrap(this._method.bind(this));
  }
  
  _method() {
    console.log(this.value); // 42 ✓
  }
}
```

 

## Summary

### Key Takeaways

✅ **`boundary.wrap()` wraps functions** with error handling from the boundary  
✅ **Same signature** - wrapped function accepts same arguments as original  
✅ **Works with sync and async** - handles both seamlessly  
✅ **Context parameter** provides error tracking information  
✅ **Returns new function** each time - wrap once, use everywhere  
✅ **Retry counter persists** across calls to same wrapped function  
✅ **Use for effects, API calls, parsing** - anywhere errors might occur  

### Quick Reference

```javascript
// Create boundary
const boundary = new ErrorBoundary({ /* options */ });

// Wrap function
const safeFunction = boundary.wrap(
  riskyFunction,
  { type: 'operation', name: 'my-operation' }
);

// Call wrapped function
const result = safeFunction(arg1, arg2);

// Async functions
const result = await safeAsyncFunction();

// Context in handlers
onError: (error, context) => {
  console.log(context.type);       // 'operation'
  console.log(context.name);       // 'my-operation'
  console.log(context.attempt);    // 1, 2, 3, ...
  console.log(context.maxRetries); // From boundary config
}
```

### One-Line Rule

> **Use `boundary.wrap(fn, context)` to create a safe version of any risky function—errors are caught, retries happen automatically, and your app stays stable.**

 

**Next Steps:**
- Learn about [ErrorBoundary class](./ErrorBoundary.md) overview
- Learn about [new ErrorBoundary()](./new-ErrorBoundary.md) constructor
- Explore [error handling patterns](./error-patterns.md)