# `batch()` - Group Multiple State Changes

## Quick Start (30 seconds)

```javascript
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 25
});

// Without batch: effects run 4 times
user.firstName = 'Jane';
user.lastName = 'Smith';
user.email = 'jane@example.com';
user.age = 30;

// With batch: effects run only ONCE
batch(() => {
  user.firstName = 'Jane';
  user.lastName = 'Smith';
  user.email = 'jane@example.com';
  user.age = 30;
});
```

**That's it.** Wrap multiple state changes in `batch()` and effects only run once at the end.

 

## What is `batch()`?

`batch()` is a **performance optimization tool** that groups multiple state changes together. Instead of triggering effects after each individual change, it waits until all changes are complete and then triggers effects just once.

Think of it as **collecting all your mail before walking to the mailbox** instead of making a separate trip for each letter.

 

## Syntax

```javascript
// Basic usage
batch(() => {
  state1.value = newValue1;
  state2.value = newValue2;
  state3.value = newValue3;
});

// With return value
const result = batch(() => {
  counter.value += 10;
  return counter.value;
});
console.log(result); // The new value
```

**Parameters:**
- `fn` - A function containing your state changes

**Returns:**
- Whatever your function returns

 

## Why Does This Exist?

### The Problem Without batch()

Every state change triggers its dependent effects:

```javascript
const profile = state({
  name: 'Alice',
  title: 'Developer',
  company: 'TechCorp'
});

effect(() => {
  console.log('Effect running...');
  Elements.profileCard.innerHTML = `
    <h2>${profile.name}</h2>
    <p>${profile.title} at ${profile.company}</p>
  `;
});

// Update all fields
profile.name = 'Bob';      // Effect runs (1)
profile.title = 'Designer'; // Effect runs (2)
profile.company = 'DesignCo'; // Effect runs (3)

// The effect ran 3 times!
// User might see flickering as DOM updates 3 times
```

**What's happening:**

```
profile.name = 'Bob'
       ↓
Effect runs → DOM updates (shows "Bob, Developer at TechCorp")
       ↓
profile.title = 'Designer'
       ↓
Effect runs → DOM updates (shows "Bob, Designer at TechCorp")
       ↓
profile.company = 'DesignCo'
       ↓
Effect runs → DOM updates (shows "Bob, Designer at DesignCo")
```

**Problems:**
- ❌ Effect runs 3 times instead of 1
- ❌ DOM updates 3 times (potential flicker)
- ❌ Intermediate states visible to user
- ❌ Wasted CPU cycles

### The Solution with batch()

```javascript
batch(() => {
  profile.name = 'Bob';
  profile.title = 'Designer';
  profile.company = 'DesignCo';
});

// Effect runs only ONCE with final values!
```

**What's happening now:**

```
batch(() => {
  profile.name = 'Bob'        → Queued
  profile.title = 'Designer'  → Queued
  profile.company = 'DesignCo' → Queued
})
       ↓
All changes complete
       ↓
Effect runs ONCE → DOM updates ONCE
       ↓
User sees final state immediately ✨
```

**Benefits:**
- ✅ Effect runs only once
- ✅ Single DOM update
- ✅ No intermediate states visible
- ✅ Better performance

 

## Mental Model: The Shopping List

Think of `batch()` like **making a shopping list**:

**Without batch() (Multiple Trips):**
```
┌─────────────────────────────────────┐
│  Need milk → Drive to store         │
│  Need bread → Drive to store again  │
│  Need eggs → Drive to store again   │
│                                     │
│  3 trips to the store! 🚗🚗🚗       │
└─────────────────────────────────────┘
```

**With batch() (Single Trip):**
```
┌─────────────────────────────────────┐
│  batch(() => {                      │
│    Add milk to list                 │
│    Add bread to list                │
│    Add eggs to list                 │
│  })                                 │
│                                     │
│  1 trip to the store! 🚗           │
└─────────────────────────────────────┘
```

 

## How Does It Work?

Under the hood, batch uses a counter to track nesting:

```
batch(() => {                    ← batchDepth becomes 1
  state.a = 1                    ← Change queued (not applied yet)
  state.b = 2                    ← Change queued
  state.c = 3                    ← Change queued
})                               ← batchDepth becomes 0, flush all updates
        ↓
All queued effects run now
```

**Key insight:** Effects are deferred until the outermost batch completes.

 

## Basic Usage

### Example 1: Form Data Update

```javascript
const form = state({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Update all form fields at once
function setFormData(data) {
  batch(() => {
    form.username = data.username;
    form.email = data.email;
    form.password = data.password;
    form.confirmPassword = data.confirmPassword;
  });
}

// Load saved form data
setFormData({
  username: 'alice',
  email: 'alice@example.com',
  password: '********',
  confirmPassword: '********'
});
// Effects run only once!
```

 

### Example 2: Reset State

```javascript
const game = state({
  score: 0,
  level: 1,
  lives: 3,
  powerUps: [],
  isPlaying: true
});

function resetGame() {
  batch(() => {
    game.score = 0;
    game.level = 1;
    game.lives = 3;
    game.powerUps = [];
    game.isPlaying = true;
  });
  // All UI updates happen once
}
```

 

### Example 3: API Response Handling

```javascript
const dashboard = state({
  users: [],
  orders: [],
  revenue: 0,
  lastUpdated: null,
  isLoading: false
});

async function fetchDashboardData() {
  dashboard.isLoading = true;

  const response = await fetch('/api/dashboard');
  const data = await response.json();

  // Update all data at once
  batch(() => {
    dashboard.users = data.users;
    dashboard.orders = data.orders;
    dashboard.revenue = data.revenue;
    dashboard.lastUpdated = new Date();
    dashboard.isLoading = false;
  });
}
```

 

### Example 4: Nested Batches

Batches can be nested — effects only run when the outermost batch completes:

```javascript
const app = state({ a: 1, b: 2, c: 3 });

effect(() => {
  console.log('Effect:', app.a, app.b, app.c);
});

batch(() => {
  app.a = 10;

  batch(() => {
    app.b = 20;
    app.c = 30;
  });
  // Inner batch completes, but we're still in outer batch
  // Effects don't run yet

  app.a = 100;
});
// Outer batch completes
// Effect runs ONCE: "Effect: 100 20 30"
```

 

### Example 5: Return Values

`batch()` returns whatever your function returns:

```javascript
const counter = state({ value: 0 });

const newValue = batch(() => {
  counter.value += 10;
  counter.value *= 2;
  return counter.value;
});

console.log(newValue); // 20
```

 

## Real-World Examples

### Example 1: Shopping Cart Update

```javascript
const cart = state({
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0
});

function updateCartTotals() {
  batch(() => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    cart.subtotal = subtotal;
    cart.tax = subtotal * 0.08;
    cart.shipping = subtotal > 50 ? 0 : 5.99;
    cart.total = cart.subtotal + cart.tax + cart.shipping;
  });
}

// All cart displays update once, not four times
```

 

### Example 2: User Login Flow

```javascript
const auth = state({
  user: null,
  token: null,
  isAuthenticated: false,
  permissions: [],
  lastLogin: null
});

async function login(credentials) {
  const response = await authService.login(credentials);

  batch(() => {
    auth.user = response.user;
    auth.token = response.token;
    auth.isAuthenticated = true;
    auth.permissions = response.permissions;
    auth.lastLogin = new Date();
  });

  // All auth-dependent UI updates at once
}

async function logout() {
  await authService.logout();

  batch(() => {
    auth.user = null;
    auth.token = null;
    auth.isAuthenticated = false;
    auth.permissions = [];
    auth.lastLogin = null;
  });
}
```

 

### Example 3: Theme Change

```javascript
const theme = state({
  mode: 'light',
  primaryColor: '#3498db',
  secondaryColor: '#2ecc71',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontSize: 16
});

const themes = {
  light: {
    mode: 'light',
    primaryColor: '#3498db',
    secondaryColor: '#2ecc71',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontSize: 16
  },
  dark: {
    mode: 'dark',
    primaryColor: '#9b59b6',
    secondaryColor: '#1abc9c',
    backgroundColor: '#1a1a2e',
    textColor: '#eaeaea',
    fontSize: 16
  }
};

function applyTheme(themeName) {
  const newTheme = themes[themeName];

  batch(() => {
    Object.keys(newTheme).forEach(key => {
      theme[key] = newTheme[key];
    });
  });

  // All 6 properties change, but effects run once
}
```

 

### Example 4: Data Table Sort & Filter

```javascript
const table = state({
  data: [],
  sortColumn: 'name',
  sortDirection: 'asc',
  filterText: '',
  currentPage: 1,
  pageSize: 10
});

function resetTableState() {
  batch(() => {
    table.sortColumn = 'name';
    table.sortDirection = 'asc';
    table.filterText = '';
    table.currentPage = 1;
  });
  // Table re-renders once, not four times
}

function applyPreset(preset) {
  batch(() => {
    table.sortColumn = preset.sortColumn;
    table.sortDirection = preset.sortDirection;
    table.filterText = preset.filterText;
    table.currentPage = 1;
    table.pageSize = preset.pageSize;
  });
}
```

 

## When to Use batch()

### ✅ Use batch() when:

1. **Updating multiple related properties**
   ```javascript
   batch(() => {
     user.firstName = 'Jane';
     user.lastName = 'Doe';
   });
   ```

2. **Loading data from API**
   ```javascript
   batch(() => {
     data.items = response.items;
     data.total = response.total;
     data.isLoading = false;
   });
   ```

3. **Resetting state**
   ```javascript
   batch(() => {
     form.field1 = '';
     form.field2 = '';
     form.errors = {};
   });
   ```

4. **Applying presets or themes**
   ```javascript
   batch(() => {
     Object.assign(settings, preset);
   });
   ```

### ❌ Don't need batch() when:

1. **Single property change**
   ```javascript
   counter.value++;  // Just one change, no batch needed
   ```

2. **Independent state objects**
   ```javascript
   // These trigger different effects anyway
   userState.name = 'Alice';
   cartState.total = 100;
   ```

 

## Common Patterns

### Pattern 1: Batch Helper Function

```javascript
function updateState(stateObj, updates) {
  batch(() => {
    Object.entries(updates).forEach(([key, value]) => {
      stateObj[key] = value;
    });
  });
}

// Usage
updateState(user, {
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
});
```

 

### Pattern 2: Conditional Batch

```javascript
function updateIfChanged(stateObj, updates) {
  const changes = Object.entries(updates).filter(
    ([key, value]) => stateObj[key] !== value
  );

  if (changes.length > 0) {
    batch(() => {
      changes.forEach(([key, value]) => {
        stateObj[key] = value;
      });
    });
  }
}
```

 

### Pattern 3: Async Batch

```javascript
async function fetchAndUpdate() {
  const [users, orders, stats] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/orders').then(r => r.json()),
    fetch('/api/stats').then(r => r.json())
  ]);

  batch(() => {
    dashboard.users = users;
    dashboard.orders = orders;
    dashboard.stats = stats;
    dashboard.lastFetch = Date.now();
  });
}
```

 

## Important Notes

### 1. Batch Doesn't Delay — It Groups

```javascript
batch(() => {
  state.value = 1;
  console.log(state.value); // 1 — value IS changed
});
// Effects run here, after batch
```

The state changes immediately inside the batch. Only the effects are deferred.

 

### 2. Errors Inside Batch

If an error occurs, the batch still completes for changes made before the error:

```javascript
batch(() => {
  state.a = 1;  // This change happens
  state.b = 2;  // This change happens
  throw new Error('Oops');
  state.c = 3;  // This doesn't happen
});
// Effects run for a and b changes
```

 

### 3. Batch Across Multiple States

```javascript
const user = state({ name: '' });
const prefs = state({ theme: 'light' });
const ui = state({ sidebar: true });

// Works across multiple state objects
batch(() => {
  user.name = 'Alice';
  prefs.theme = 'dark';
  ui.sidebar = false;
});
// All effects run once
```

 

## Summary

**What is `batch()`?**
A way to group multiple state changes so effects run only once.

**Why use it?**
- ✅ Better performance (fewer effect runs)
- ✅ Prevents UI flicker
- ✅ No intermediate states visible
- ✅ Cleaner state transitions

**Key Takeaway:**

```
Without batch()              With batch()
      |                           |
Change 1 → Effect runs      batch(() => {
Change 2 → Effect runs        Change 1
Change 3 → Effect runs        Change 2
      |                         Change 3
3 effect runs                 })
                                  |
                             1 effect run ✅
```

**One-Line Rule:** When changing multiple state properties at once, wrap them in `batch()`.

**Remember:** State changes still happen immediately inside batch — only the effects are deferred until the batch completes!
