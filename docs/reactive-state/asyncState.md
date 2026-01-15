# Understanding `async()` / `asyncState()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to manage async data with loading and error states? Here's how:

```js
// Create async state
const userData = asyncState(null);

// Auto-update UI based on state
effect(() => {
  if (userData.loading) {
    document.getElementById('status').textContent = 'Loading...';
  } else if (userData.error) {
    document.getElementById('status').textContent = 'Error: ' + userData.error;
  } else if (userData.data) {
    document.getElementById('status').textContent = 'Loaded!';
    displayUser(userData.data);
  }
});

// Execute async operation - loading/error managed automatically!
await execute(userData, async () => {
  const response = await fetch('/api/user');
  return response.json();
});
```

**That's it!** The `asyncState()` function creates reactive state that automatically manages loading, data, and error states for async operations!

 

## What is `async()`?

`async()` (also called `asyncState()`) is a specialized function for managing **asynchronous operations** with built-in loading and error state management. It takes care of the common async patterns so you don't have to.

**A reactive async state:**
- Manages data, loading, and error states automatically
- Provides computed properties (isSuccess, isError)
- Handles async operation execution
- Supports request cancellation
- Tracks operation status

Think of it as a **smart async operation manager** - it handles all the tedious async state management (loading flags, error handling, data storage) automatically.

 

## Syntax

```js
// Using the shortcut
asyncState(initialValue)

// Using the full namespace
ReactiveUtils.async(initialValue)
```

**Both styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`asyncState()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.async()`) - Explicit and clear

**Parameters:**
- `initialValue` - Initial value for the data property (defaults to `null`)

**Returns:**
- A reactive async state object with data, loading, error properties and methods

 

## Why Does This Exist?

### Two Approaches to Async State Management

The Reactive library offers flexible ways to handle asynchronous operations, each suited to different control needs.

### Manual Async State Control

When you need **explicit control** over each step of the async flow and want to customize loading/error handling:
```javascript
// Explicit async state management
const apiState = state({
  data: null,
  loading: false,
  error: null
});

async function fetchUser() {
  // Explicitly manage loading state
  apiState.loading = true;
  apiState.error = null;

  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    
    // Custom success handling
    apiState.data = data;
  } catch (err) {
    // Custom error handling
    apiState.error = err.message;
  } finally {
    // Explicitly clear loading
    apiState.loading = false;
  }
}
```

**This approach is great when you need:**
✅ Full control over each state transition
✅ Custom logic during loading/success/error phases
✅ Specific error handling patterns
✅ Integration with existing async patterns

### When Standardized Async Patterns Fit Your Needs

In scenarios where you want **consistent async state management** with automatic loading/error/data handling, `asyncState()` provides a more direct approach:
```javascript
// Structured async state with automatic management
const userData = asyncState(null);

// Execute with automatic state handling
await execute(userData, async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// Loading, error, data all managed automatically
```

**This method is especially useful when:**
```
asyncState() Flow:
┌──────────────────┐
│ execute()        │
└────────┬─────────┘
         │
         ▼
   Automatic management:
   • loading = true
   • error cleared
   • runs function
   • updates data/error
   • loading = false
         │
         ▼
  ✅ Consistent pattern
```

**Where asyncState() shines:**
✅ **Standardized patterns** - Same structure for all async operations
✅ **Automatic state tracking** - Loading, error, data managed for you
✅ **Computed helpers** - `isSuccess`, `isError`, `isIdle` built-in
✅ **Request cancellation** - Built-in AbortSignal support
✅ **Reduced boilerplate** - No manual try/catch/finally needed
✅ **Consistent error handling** - Same pattern across your app

**The Choice is Yours:**
- Use manual async state when you need custom control over state transitions
- Use `asyncState()` when you want standardized async patterns
- Both approaches work seamlessly with reactive state

**Benefits of the asyncState approach:**
✅ **Automatic lifecycle** - Loading, success, and error states managed
✅ **Built-in helpers** - Computed properties for common checks
✅ **Cancellation support** - Easy request cancellation with AbortSignal
✅ **Less code** - Focus on the async logic, not the state management
✅ **Consistent API** - Same pattern for all async operations in your app
## Mental Model

Think of `asyncState()` like a **package delivery tracker**:

```
Manual Async State (DIY Tracking):
┌──────────────────────┐
│  You track manually: │
│  ✓ Is it shipped?    │  ← Track manually
│  ✓ Where is it?      │  ← Track manually
│  ✓ Any errors?       │  ← Track manually
│  ✓ Has it arrived?   │  ← Track manually
└──────────────────────┘
     You do everything!

Async State (Smart Tracker):
┌──────────────────────────────────┐
│   Package Tracker                │
│   ┌────────────────────┐         │
│   │ Status: In Transit │ ✓       │
│   │ Location: City X   │ ✓       │
│   │ Errors: None       │ ✓       │
│   │ Delivered: No      │ ✓       │
│   └────────────────────┘         │
│                                  │
│   Automatic Updates:             │
│   ✓ Shipped → loading = true     │
│   ✓ Delivered → data = package   │
│   ✓ Lost → error = message       │
│   ✓ Done → loading = false       │
└──────────────────────────────────┘
         │
         ▼
   Everything tracked
   automatically!
```

**Key Insight:** Just like a package tracker that automatically updates as your package moves through different stages, `asyncState()` automatically updates as your async operation progresses through loading, success, and error states.

 

## How Does It Work?

### The Magic: State + Execution Wrapper

When you call `asyncState()`, here's what happens behind the scenes:

```javascript
// What you write:
const userData = asyncState(null);

// What actually happens (simplified):
// 1. Create reactive state
const userData = state({
  data: null,
  loading: false,
  error: null
});

// 2. Add computed properties
userData.isSuccess = computed(() =>
  !userData.loading && !userData.error && userData.data !== null
);

userData.isError = computed(() =>
  !userData.loading && userData.error !== null
);

// 3. Add execution method
// (provided via Module 09: execute(userData, fn))
```

**In other words:** `asyncState()` is a package that:
1. Creates reactive state with data/loading/error properties
2. Adds computed properties for checking status
3. Works with `execute()` function to run async operations
4. Manages all state transitions automatically
5. Returns a fully-functional async state manager

### Under the Hood

```
asyncState(null)
        │
        ▼
┌───────────────────────┐
│  Step 1: Create State │
│  data, loading, error │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 2: Add Computed │
│  isSuccess, isError   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 3: Return       │
│  Async State Object   │
└───────────────────────┘
```

**When you execute:**

```
execute(asyncState, fn)
        │
        ▼
┌───────────────────────┐
│  Set loading = true   │
│  Set error = null     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Run your async       │
│  function             │
└──────────┬────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
 Success        Error
    │             │
    ▼             ▼
Set data     Set error
    │             │
    └──────┬──────┘
           │
           ▼
┌───────────────────────┐
│  Set loading = false  │
└───────────────────────┘
```

 

## Basic Usage

### Creating Async State

The simplest way to use `asyncState()`:

```js
// Create with null initial value
const userData = asyncState(null);

// Or with a default value
const userData = asyncState({ name: 'Guest' });
```

### Executing Async Operations

Use the `execute()` function (from Module 09) to run async operations:

```js
const userData = asyncState(null);

// Execute an async operation
await execute(userData, async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// Data is now available
console.log(userData.data);
```

 

## Async State Properties

### `asyncState.data`

The data returned from the async operation:

```js
const userData = asyncState(null);

console.log(userData.data); // null (initial)

await execute(userData, async () => {
  return { name: 'John', age: 25 };
});

console.log(userData.data);
// { name: 'John', age: 25 }
```

### `asyncState.loading`

Boolean indicating if operation is in progress:

```js
const userData = asyncState(null);

console.log(userData.loading); // false

const promise = execute(userData, async () => {
  await delay(2000);
  return { name: 'John' };
});

console.log(userData.loading); // true

await promise;
console.log(userData.loading); // false
```

### `asyncState.error`

Error message if operation failed:

```js
const userData = asyncState(null);

await execute(userData, async () => {
  throw new Error('Network error');
});

console.log(userData.error); // "Network error"
```

### `asyncState.isSuccess` (Computed)

Automatically computed - true if data loaded successfully:

```js
const userData = asyncState(null);

console.log(userData.isSuccess); // false (no data yet)

await execute(userData, async () => {
  return { name: 'John' };
});

console.log(userData.isSuccess); // true
```

**Formula:** `!loading && !error && data !== null`

### `asyncState.isError` (Computed)

Automatically computed - true if operation failed:

```js
const userData = asyncState(null);

console.log(userData.isError); // false

await execute(userData, async () => {
  throw new Error('Failed');
});

console.log(userData.isError); // true
```

**Formula:** `!loading && error !== null`

 

## Executing Async Operations

### `execute(asyncState, fn)`

Execute an async function and manage state:

```js
const userData = asyncState(null);

await execute(userData, async () => {
  // Your async logic here
  const response = await fetch('/api/user');

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  return response.json();
});

// State is automatically managed:
// - loading set to true at start
// - error cleared at start
// - data set on success
// - error set on failure
// - loading set to false at end
```

**Returns:** Promise that resolves to the result

### With Parameters

```js
const userDetails = asyncState(null);

async function fetchUser(userId) {
  await execute(userDetails, async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  });
}

await fetchUser(123);
```

### Enhanced Execute (Module 06)

If Module 06 is loaded, `execute()` supports AbortSignal:

```js
const userData = asyncState(null);

await execute(userData, async (signal) => {
  const response = await fetch('/api/user', { signal });
  return response.json();
});

// Can abort:
abort(userData);
```

 

## Handling Loading States

### Display Loading Indicator

```js
const posts = asyncState(null);

// Show loading spinner
effect(() => {
  const spinner = document.getElementById('spinner');
  spinner.style.display = posts.loading ? 'block' : 'none';
});

// Fetch posts
await execute(posts, async () => {
  const response = await fetch('/api/posts');
  return response.json();
});
```

### Disable Buttons During Loading

```js
const userData = asyncState(null);

effect(() => {
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = userData.loading;
  submitBtn.textContent = userData.loading ? 'Loading...' : 'Submit';
});
```

### Show Different Content Based on State

```js
const articles = asyncState(null);

effect(() => {
  const container = document.getElementById('content');

  if (articles.loading) {
    container.innerHTML = '<div>Loading articles...</div>';
  } else if (articles.isSuccess) {
    container.innerHTML = articles.data
      .map(article => `<div>${article.title}</div>`)
      .join('');
  }
});
```

 

## Error Handling

### Display Error Messages

```js
const userData = asyncState(null);

effect(() => {
  const errorDiv = document.getElementById('error');

  if (userData.isError) {
    errorDiv.textContent = userData.error;
    errorDiv.style.display = 'block';
  } else {
    errorDiv.style.display = 'none';
  }
});

// Execute with potential error
await execute(userData, async () => {
  const response = await fetch('/api/user');

  if (!response.ok) {
    throw new Error('Failed to load user');
  }

  return response.json();
});
```

### Retry on Error

```js
const userData = asyncState(null);

async function fetchWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    await execute(userData, async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed');
      return response.json();
    });

    if (userData.isSuccess) break;

    // Wait before retry
    await delay(1000 * (i + 1));
  }
}
```

### Custom Error Handling

```js
const userData = asyncState(null);

await execute(userData, async () => {
  try {
    const response = await fetch('/api/user');
    return response.json();
  } catch (err) {
    // Transform error before it's stored
    throw new Error(`Network error: ${err.message}`);
  }
});
```

 

## Aborting Requests

### `abort(asyncState)` (Module 09)

Abort an in-progress operation:

```js
const searchResults = asyncState(null);

// Start long search
execute(searchResults, async (signal) => {
  const response = await fetch('/api/search?q=test', { signal });
  return response.json();
});

// User changes search query - abort previous request
abort(searchResults);

// Start new search
execute(searchResults, async (signal) => {
  const response = await fetch('/api/search?q=new', { signal });
  return response.json();
});
```

### Auto-Abort on New Request

```js
const searchResults = asyncState(null);

async function search(query) {
  // Abort previous search
  abort(searchResults);

  // Start new search
  await execute(searchResults, async (signal) => {
    const response = await fetch(`/api/search?q=${query}`, { signal });
    return response.json();
  });
}

// Only the last search completes
search('test1');
search('test2');
search('test3'); // Previous two are aborted
```

 

## Resetting and Refetching

### `reset(asyncState)` (Module 09)

Reset state to initial values:

```js
const userData = asyncState(null);

// Fetch data
await execute(userData, async () => {
  return { name: 'John' };
});

console.log(userData.data); // { name: 'John' }

// Reset
reset(userData);

console.log(userData.data);      // null
console.log(userData.loading);   // false
console.log(userData.error);     // null
```

### `refetch(asyncState)` (Module 09)

Re-run the last async function:

```js
const userData = asyncState(null);

// First fetch
await execute(userData, async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// Later, refetch with the same function
await refetch(userData);
```

**Note:** `refetch()` only works if the state was created with Module 06 (Enhanced) which stores the last function.

 

## Working with Effects

Async state automatically triggers effects when it changes:

```js
const userData = asyncState(null);

// Effect runs whenever any property changes
effect(() => {
  console.log('Loading:', userData.loading);
  console.log('Data:', userData.data);
  console.log('Error:', userData.error);
});

// Execute - effect re-runs multiple times:
// 1. When loading becomes true
// 2. When data is set and loading becomes false
await execute(userData, async () => {
  return { name: 'John' };
});
```

### Separate Effects for Each State

```js
const userData = asyncState(null);

// Effect for loading
effect(() => {
  if (userData.loading) {
    showSpinner();
  } else {
    hideSpinner();
  }
});

// Effect for success
effect(() => {
  if (userData.isSuccess) {
    displayUser(userData.data);
  }
});

// Effect for error
effect(() => {
  if (userData.isError) {
    displayError(userData.error);
  }
});
```

 

## Common Patterns

### Pattern: Data Fetching

```js
const articles = asyncState(null);

// Fetch on page load
document.addEventListener('DOMContentLoaded', async () => {
  await execute(articles, async () => {
    const response = await fetch('/api/articles');
    return response.json();
  });
});

// Display based on state
effect(() => {
  const container = document.getElementById('articles');

  if (articles.loading) {
    container.innerHTML = '<div class="spinner">Loading...</div>';
  } else if (articles.isError) {
    container.innerHTML = `<div class="error">${articles.error}</div>`;
  } else if (articles.isSuccess) {
    container.innerHTML = articles.data
      .map(article => `
        <article>
          <h2>${article.title}</h2>
          <p>${article.excerpt}</p>
        </article>
      `)
      .join('');
  }
});
```

### Pattern: Search with Debounce

```js
const searchResults = asyncState(null);
const searchQuery = ref('');

let searchTimer;

// Watch search query
effect(() => {
  const query = searchQuery.value;

  clearTimeout(searchTimer);

  if (!query) {
    reset(searchResults);
    return;
  }

  // Debounce search
  searchTimer = setTimeout(async () => {
    await execute(searchResults, async (signal) => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
        { signal }
      );
      return response.json();
    });
  }, 300);
});

// Connect to input
document.getElementById('search').addEventListener('input', (e) => {
  searchQuery.value = e.target.value;
});
```

### Pattern: Pagination

```js
const articles = asyncState(null);
const currentPage = ref(1);

// Fetch when page changes
effect(() => {
  const page = currentPage.value;

  execute(articles, async () => {
    const response = await fetch(`/api/articles?page=${page}`);
    return response.json();
  });
});

function nextPage() {
  currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}
```

### Pattern: Dependent Requests

```js
const userId = ref(null);
const userDetails = asyncState(null);
const userPosts = asyncState(null);

// Fetch user details when userId changes
effect(() => {
  const id = userId.value;

  if (!id) {
    reset(userDetails);
    reset(userPosts);
    return;
  }

  execute(userDetails, async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });
});

// Fetch user posts when userDetails loads successfully
effect(() => {
  if (userDetails.isSuccess) {
    const id = userDetails.data.id;

    execute(userPosts, async () => {
      const response = await fetch(`/api/users/${id}/posts`);
      return response.json();
    });
  }
});
```

### Pattern: Infinite Scroll

```js
const articles = asyncState([]);
const page = ref(1);
const hasMore = ref(true);

async function loadMore() {
  if (!hasMore.value || articles.loading) return;

  await execute(articles, async () => {
    const response = await fetch(`/api/articles?page=${page.value}`);
    const newArticles = await response.json();

    // Append to existing data
    const currentData = articles.data || [];
    const combined = [...currentData, ...newArticles];

    // Check if more pages
    hasMore.value = newArticles.length > 0;
    page.value++;

    return combined;
  });
}

// Trigger on scroll
window.addEventListener('scroll', () => {
  const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

  if (bottom) {
    loadMore();
  }
});
```

 

## Common Pitfalls

### Pitfall #1: Not Awaiting execute()

❌ **Wrong:**
```js
execute(userData, async () => {
  return await fetchUser();
}); // Not awaited

// Code continues immediately
console.log(userData.data); // Still null!
```

✅ **Correct:**
```js
await execute(userData, async () => {
  return await fetchUser();
});

// Now data is available
console.log(userData.data);
```

 

### Pitfall #2: Forgetting to Return Data

❌ **Wrong:**
```js
await execute(userData, async () => {
  const response = await fetch('/api/user');
  const data = await response.json();
  // Forgot to return!
});

console.log(userData.data); // undefined
```

✅ **Correct:**
```js
await execute(userData, async () => {
  const response = await fetch('/api/user');
  return response.json(); // Return the data
});

console.log(userData.data); // Data is set
```

 

### Pitfall #3: Checking loading Instead of isSuccess

❌ **Wrong:**
```js
effect(() => {
  // This shows "No data" while loading!
  if (!userData.loading && !userData.data) {
    console.log('No data');
  }
});
```

✅ **Correct:**
```js
effect(() => {
  // Use isSuccess to check if data loaded
  if (userData.isSuccess) {
    displayData(userData.data);
  } else if (userData.isError) {
    displayError(userData.error);
  } else if (userData.loading) {
    showSpinner();
  }
});
```

 

### Pitfall #4: Not Handling Errors

❌ **Wrong:**
```js
await execute(userData, async () => {
  const response = await fetch('/api/user');
  // If fetch fails, error is caught but not shown
  return response.json();
});

// User sees nothing!
```

✅ **Correct:**
```js
await execute(userData, async () => {
  const response = await fetch('/api/user');

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
});

// Show error to user
if (userData.isError) {
  alert(userData.error);
}
```

 

### Pitfall #5: Modifying data Directly

❌ **Wrong:**
```js
// Modifying data doesn't trigger loading/error reset
userData.data = newData;
```

✅ **Correct:**
```js
// Always use execute() to update data
await execute(userData, async () => {
  return newData;
});

// Or use reset() then execute()
reset(userData);
await execute(userData, async () => {
  return await fetchNewData();
});
```

 

## Summary

**What is `asyncState()`?**

`asyncState()` creates **reactive async state** with built-in loading and error management. It automatically handles the common async operation patterns.

 

**Why use `asyncState()` instead of manual state management?**

- Automatic loading state management
- Automatic error handling
- Computed properties (isSuccess, isError)
- Less boilerplate (80% code reduction!)
- Request cancellation support
- Standard async patterns handled for you

 

**Key Points to Remember:**

1️⃣ **Use execute()** - Don't modify properties directly
2️⃣ **Always return data** - The returned value becomes the data
3️⃣ **Check isSuccess/isError** - Use computed properties for state
4️⃣ **Await execute()** - Always await to get result
5️⃣ **Handle errors** - Show errors to users

 

**Mental Model:** Think of `asyncState()` as a **package delivery tracker** - it automatically updates as your async operation progresses through loading, success, and error states.

 

**Quick Reference:**

```js
// Create
const userData = asyncState(null);

// Properties
userData.data        // The loaded data
userData.loading     // Boolean: is loading
userData.error       // Error message if failed
userData.isSuccess   // Computed: loaded successfully
userData.isError     // Computed: has error

// Execute (Module 09)
await execute(userData, async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// With AbortSignal (Module 06)
await execute(userData, async (signal) => {
  const response = await fetch('/api/data', { signal });
  return response.json();
});

// Abort (Module 09)
abort(userData);

// Reset (Module 09)
reset(userData);

// Refetch (Module 09 + Module 06)
await refetch(userData);

// Use in effects
effect(() => {
  if (userData.loading) {
    showSpinner();
  } else if (userData.isSuccess) {
    displayData(userData.data);
  } else if (userData.isError) {
    displayError(userData.error);
  }
});
```

 

**Remember:** `asyncState()` is your complete async operation manager. It handles loading, errors, and data automatically, so you can focus on building your UI instead of managing async state!
