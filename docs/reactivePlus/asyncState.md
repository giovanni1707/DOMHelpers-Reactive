# `asyncState()` - Managing Async Operations

## Quick Start (30 seconds)

```javascript
// Create async state for data fetching
const users = asyncState(null);

// Execute an async operation
execute(users, async () => {
  const response = await fetch('/api/users');
  return response.json();
});

// Track loading, data, and error states
effect(() => {
  if (users.loading) {
    showSpinner();
  } else if (users.error) {
    showError(users.error.message);
  } else if (users.data) {
    displayUsers(users.data);
  }
});
```

**That's it.** Async operations with automatic loading, data, and error state management.

 

## What is `asyncState()`?

`asyncState()` creates a **specialized reactive state for handling asynchronous operations** like API calls, file uploads, or any Promise-based work. It automatically manages:

- **Loading state** — Is the operation in progress?
- **Data** — The successful result
- **Error** — Any error that occurred

Think of it as **a smart container for async operations** that handles all the common patterns automatically.

 

## Syntax

```javascript
// Create async state with initial value
const myAsync = asyncState(initialValue);

// Access properties
myAsync.data       // The result data (or initial value)
myAsync.loading    // Boolean: is operation in progress?
myAsync.error      // Error object if operation failed

// Computed properties
myAsync.isSuccess  // true if: not loading, no error, data exists
myAsync.isError    // true if: not loading, error exists
```

**Parameters:**
- `initialValue` - Initial value for `data` (usually `null`)

**Returns:**
- A reactive state object with loading/data/error tracking

 

## Async State Methods

### `execute(asyncState, fn)` - Run an Async Operation

```javascript
const userData = asyncState(null);

// Execute returns the result (or throws)
try {
  const result = await execute(userData, async () => {
    const response = await fetch('/api/user/123');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  });

  console.log('Got user:', result);
} catch (error) {
  console.log('Failed:', error.message);
}
```

**What happens during execute:**
1. `loading` becomes `true`
2. `error` is cleared to `null`
3. Your async function runs
4. On success: `data` is set, `loading` becomes `false`
5. On failure: `error` is set, `loading` becomes `false`

 

### `reset(asyncState)` - Reset to Initial State

```javascript
const searchResults = asyncState([]);

// After some operations...
reset(searchResults);

// State is now:
// { data: [], loading: false, error: null }
```

 

## Built-in Computed Properties

### `isSuccess`

Returns `true` when the operation completed successfully:

```javascript
myAsync.isSuccess
// true when: !loading && !error && data !== null
```

### `isError`

Returns `true` when the operation failed:

```javascript
myAsync.isError
// true when: !loading && error !== null
```

 

## Why Does This Exist?

### The Problem Without asyncState()

Managing async operations manually is repetitive:

```javascript
// Manual approach
const data = state({ value: null });
const loading = state({ value: false });
const error = state({ value: null });

async function fetchData() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/data');
    data.value = await response.json();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}

// Checking state
if (loading.value) { /* ... */ }
else if (error.value) { /* ... */ }
else if (data.value) { /* ... */ }
```

**Problems:**
- ❌ Three separate state objects
- ❌ Must remember to set loading/error correctly
- ❌ Easy to forget edge cases
- ❌ Repeated pattern in every async operation

### The Solution with asyncState()

```javascript
// Everything in one place
const data = asyncState(null);

async function fetchData() {
  await execute(data, async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
}

// Clean state checks
if (data.loading) { /* ... */ }
else if (data.isError) { /* ... */ }
else if (data.isSuccess) { /* ... */ }
```

**Benefits:**
- ✅ Single state object
- ✅ Automatic loading/error management
- ✅ Built-in computed helpers
- ✅ Consistent pattern everywhere

 

## Basic Usage

### Example 1: Simple Data Fetching

```javascript
const posts = asyncState([]);

async function loadPosts() {
  await execute(posts, async () => {
    const response = await fetch('/api/posts');
    return response.json();
  });
}

// Display based on state
effect(() => {
  if (posts.loading) {
    Elements.postList.innerHTML = '<div class="spinner">Loading...</div>';
  } else if (posts.isError) {
    Elements.postList.innerHTML = `<div class="error">${posts.error.message}</div>`;
  } else {
    Elements.postList.innerHTML = posts.data
      .map(post => `<article><h2>${post.title}</h2></article>`)
      .join('');
  }
});

// Load on page start
loadPosts();
```

 

### Example 2: Form Submission

```javascript
const submission = asyncState(null);

async function submitForm(formData) {
  await execute(submission, async () => {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    return response.json();
  });
}

// Update UI based on submission state
effect(() => {
  Elements.submitBtn.disabled = submission.loading;
  Elements.submitBtn.textContent = submission.loading ? 'Submitting...' : 'Submit';

  if (submission.isSuccess) {
    Elements.successMessage.style.display = 'block';
    Elements.successMessage.textContent = 'Form submitted successfully!';
  }

  if (submission.isError) {
    Elements.errorMessage.style.display = 'block';
    Elements.errorMessage.textContent = submission.error.message;
  }
});

// Handle form submit
Elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await submitForm(Object.fromEntries(formData));
});
```

 

### Example 3: Search with Loading State

```javascript
const searchResults = asyncState({ results: [], total: 0 });

async function search(query) {
  if (!query.trim()) {
    reset(searchResults);
    return;
  }

  await execute(searchResults, async () => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return response.json();
  });
}

// Debounced search input
let searchTimeout;
Elements.searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    search(e.target.value);
  }, 300);
});

// Display results
effect(() => {
  // Show/hide loading indicator
  Elements.searchSpinner.style.display = searchResults.loading ? 'block' : 'none';

  // Show error
  if (searchResults.isError) {
    Elements.searchError.textContent = 'Search failed. Please try again.';
    Elements.searchError.style.display = 'block';
  } else {
    Elements.searchError.style.display = 'none';
  }

  // Show results
  if (searchResults.isSuccess) {
    Elements.resultCount.textContent = `${searchResults.data.total} results`;
    Elements.resultList.innerHTML = searchResults.data.results
      .map(r => `<li>${r.title}</li>`)
      .join('');
  }
});
```

 

### Example 4: File Upload with Progress

```javascript
const upload = asyncState(null);

async function uploadFile(file) {
  await execute(upload, () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          Elements.uploadProgress.value = percent;
          Elements.uploadPercent.textContent = `${percent}%`;
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  });
}

// Update UI
effect(() => {
  Elements.uploadBtn.disabled = upload.loading;

  if (upload.loading) {
    Elements.uploadStatus.textContent = 'Uploading...';
    Elements.progressContainer.style.display = 'block';
  } else {
    Elements.progressContainer.style.display = 'none';
  }

  if (upload.isSuccess) {
    Elements.uploadStatus.textContent = 'Upload complete!';
    Elements.uploadedFile.href = upload.data.url;
  }

  if (upload.isError) {
    Elements.uploadStatus.textContent = `Error: ${upload.error.message}`;
  }
});

// Handle file selection
Elements.fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    uploadFile(e.target.files[0]);
  }
});
```

 

## Real-World Examples

### Example 1: User Authentication

```javascript
const authState = asyncState(null);

async function login(email, password) {
  return execute(authState, async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    // Store token
    localStorage.setItem('token', data.token);

    return data.user;
  });
}

async function logout() {
  localStorage.removeItem('token');
  reset(authState);
}

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return;

  await execute(authState, async () => {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      throw new Error('Session expired');
    }

    return response.json();
  });
}

// Update UI based on auth state
effect(() => {
  if (authState.loading) {
    Elements.authStatus.textContent = 'Checking authentication...';
  } else if (authState.isSuccess) {
    Elements.loginForm.style.display = 'none';
    Elements.userProfile.style.display = 'block';
    Elements.userName.textContent = authState.data.name;
  } else {
    Elements.loginForm.style.display = 'block';
    Elements.userProfile.style.display = 'none';
  }

  if (authState.isError) {
    Elements.loginError.textContent = authState.error.message;
    Elements.loginError.style.display = 'block';
  } else {
    Elements.loginError.style.display = 'none';
  }
});

// Check auth on page load
checkAuth();
```

 

### Example 2: Infinite Scroll

```javascript
const feed = asyncState({ items: [], hasMore: true, page: 1 });

async function loadMore() {
  if (feed.loading || !feed.data.hasMore) return;

  const currentPage = feed.data.page;
  const currentItems = feed.data.items;

  await execute(feed, async () => {
    const response = await fetch(`/api/feed?page=${currentPage}`);
    const data = await response.json();

    return {
      items: [...currentItems, ...data.items],
      hasMore: data.hasMore,
      page: currentPage + 1
    };
  });
}

// Render feed
effect(() => {
  // Show loading indicator
  Elements.loadingMore.style.display = feed.loading ? 'block' : 'none';

  // Render items
  Elements.feedList.innerHTML = feed.data.items
    .map(item => `<div class="feed-item">${item.content}</div>`)
    .join('');

  // Show/hide "Load More" or "No more items"
  if (!feed.data.hasMore) {
    Elements.endOfFeed.style.display = 'block';
  }
});

// Infinite scroll detection
window.addEventListener('scroll', () => {
  const scrollBottom = window.innerHeight + window.scrollY;
  const docHeight = document.documentElement.offsetHeight;

  if (scrollBottom >= docHeight - 200) {
    loadMore();
  }
});

// Initial load
loadMore();
```

 

### Example 3: Dashboard with Multiple Data Sources

```javascript
const dashboardData = {
  stats: asyncState(null),
  recentOrders: asyncState([]),
  topProducts: asyncState([]),
  notifications: asyncState([])
};

async function loadDashboard() {
  // Load all data in parallel
  await Promise.all([
    execute(dashboardData.stats, () =>
      fetch('/api/dashboard/stats').then(r => r.json())
    ),
    execute(dashboardData.recentOrders, () =>
      fetch('/api/dashboard/orders').then(r => r.json())
    ),
    execute(dashboardData.topProducts, () =>
      fetch('/api/dashboard/products').then(r => r.json())
    ),
    execute(dashboardData.notifications, () =>
      fetch('/api/dashboard/notifications').then(r => r.json())
    )
  ]);
}

// Computed: all data loaded
const dashboard = state({});
computed(dashboard, {
  isFullyLoaded: function() {
    return Object.values(dashboardData).every(s => s.isSuccess);
  },
  hasAnyError: function() {
    return Object.values(dashboardData).some(s => s.isError);
  },
  isLoading: function() {
    return Object.values(dashboardData).some(s => s.loading);
  }
});

// Individual widget updates
effect(() => {
  if (dashboardData.stats.isSuccess) {
    Elements.update({
      totalRevenue: { textContent: `$${dashboardData.stats.data.revenue}` },
      totalOrders: { textContent: dashboardData.stats.data.orders },
      totalCustomers: { textContent: dashboardData.stats.data.customers }
    });
  }
});

effect(() => {
  if (dashboardData.recentOrders.isSuccess) {
    Elements.ordersList.innerHTML = dashboardData.recentOrders.data
      .slice(0, 5)
      .map(order => `<li>#${order.id} - $${order.total}</li>`)
      .join('');
  }
});

// Refresh button
Elements.refreshBtn.addEventListener('click', loadDashboard);

// Initial load
loadDashboard();
```

 

### Example 4: Retry on Failure

```javascript
const apiData = asyncState(null);

async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await execute(apiData, async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      });
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError;
}

// UI with retry button
effect(() => {
  if (apiData.isError) {
    Elements.retryBtn.style.display = 'block';
    Elements.errorMsg.textContent = `Failed: ${apiData.error.message}`;
  } else {
    Elements.retryBtn.style.display = 'none';
  }
});

Elements.retryBtn.addEventListener('click', () => {
  fetchWithRetry('/api/data');
});
```

 

## Common Patterns

### Pattern 1: Conditional Fetching

```javascript
const userProfile = asyncState(null);

async function loadProfile(userId) {
  if (!userId) {
    reset(userProfile);
    return;
  }

  await execute(userProfile, async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  });
}
```

 

### Pattern 2: Polling

```javascript
const liveData = asyncState(null);
let pollInterval;

function startPolling(intervalMs = 5000) {
  // Initial fetch
  fetchLiveData();

  // Start polling
  pollInterval = setInterval(fetchLiveData, intervalMs);
}

function stopPolling() {
  clearInterval(pollInterval);
}

async function fetchLiveData() {
  await execute(liveData, async () => {
    const response = await fetch('/api/live-data');
    return response.json();
  });
}
```

 

### Pattern 3: Optimistic Updates

```javascript
const todos = asyncState([]);

async function toggleTodo(todoId) {
  // Save current state for rollback
  const previousData = [...todos.data];

  // Optimistic update
  todos.data = todos.data.map(todo =>
    todo.id === todoId ? { ...todo, done: !todo.done } : todo
  );

  try {
    await fetch(`/api/todos/${todoId}/toggle`, { method: 'POST' });
  } catch (error) {
    // Rollback on failure
    todos.data = previousData;
    todos.error = error;
  }
}
```

 

### Pattern 4: Caching

```javascript
const cache = new Map();

async function fetchCached(url, ttlMs = 60000) {
  const cached = cache.get(url);

  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();

  cache.set(url, { data, timestamp: Date.now() });

  return data;
}

const cachedData = asyncState(null);

async function loadCachedData() {
  await execute(cachedData, () => fetchCached('/api/data'));
}
```

 

## Summary

**What is `asyncState()`?**
A specialized reactive state for managing async operations with loading, data, and error tracking.

**Methods:**
| Method | Purpose |
|--------|---------|
| `execute(state, fn)` | Run async operation with automatic state management |
| `reset(state)` | Reset to initial state |

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `data` | Any | The result data |
| `loading` | Boolean | Operation in progress |
| `error` | Error/null | Error if operation failed |
| `isSuccess` | Computed | Not loading, no error, has data |
| `isError` | Computed | Not loading, has error |

**Why use it?**
- ✅ Unified loading/data/error state
- ✅ Automatic state transitions
- ✅ Built-in computed helpers
- ✅ Cleaner async code

**Key Takeaway:**

```javascript
// Create
const myData = asyncState(null);

// Execute async operation
await execute(myData, async () => {
  return await fetchSomething();
});

// Check state
if (myData.loading) { /* show spinner */ }
if (myData.isError) { /* show error */ }
if (myData.isSuccess) { /* show data */ }

// Reset
reset(myData);
```

**Remember:** `asyncState()` handles the loading/error/data dance so you can focus on your actual async logic!
