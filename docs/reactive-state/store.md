# Understanding `store()` - A Beginner's Guide

## Quick Start (30 seconds)

Need centralized state management with computed values and actions? Here's how:

```js
// Create a store with state, getters, and actions
const counterStore = store(
  { count: 0 },  // State
  {
    getters: {
      // Computed properties
      doubled() {
        return this.count * 2;
      },
      isEven() {
        return this.count % 2 === 0;
      }
    },
    actions: {
      // Methods to modify state
      increment(state) {
        state.count++;
      },
      decrement(state) {
        state.count--;
      },
      reset(state) {
        state.count = 0;
      }
    }
  }
);

// Use the store
counterStore.increment();
console.log(counterStore.count);   // 1
console.log(counterStore.doubled); // 2
console.log(counterStore.isEven);  // false
```

**That's it!** The `store()` function creates a centralized state container with computed properties (getters) and methods (actions) for managing state!

 

## What is `store()`?

`store()` is a function for creating a **centralized state container** with built-in computed properties (getters) and action methods. It's inspired by Vuex/Pinia store patterns and provides a structured way to manage application state.

**A reactive store:**
- Manages centralized state
- Provides computed properties (getters)
- Defines action methods for state changes
- All properties are reactive
- Getters are automatically computed

Think of it as a **state management pattern** - it gives you a standardized structure for organizing your application's state, computed values, and state-modifying functions.

 

## Syntax

```js
// Using the shortcut
store(initialState, options)

// Using the full namespace
ReactiveUtils.store(initialState, options)
```

**Both styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`store()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.store()`) - Explicit and clear

**Parameters:**
- `initialState` - An object with initial state properties (required)
- `options` - Configuration object (optional):
  - `getters` - Object with getter functions (computed properties)
  - `actions` - Object with action functions (methods)

**Returns:**
- A reactive store object with state properties, getters, and action methods

 

## Why Does This Exist?

### The Problem with Scattered State

Let's say you have application state scattered across your code:

```javascript
// State scattered everywhere
const count = ref(0);

// Computed values defined separately
const doubled = computed(() => count.value * 2);
const isEven = computed(() => count.value % 2 === 0);

// Functions scattered around
function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}

function reset() {
  count.value = 0;
}
```

This works, but it's **unorganized** and **hard to maintain**:

**What's the Real Issue?**

```
Scattered State:
┌──────────────┐
│ State here   │ ← count
└──────────────┘

┌──────────────┐
│ Getters here │ ← doubled, isEven
└──────────────┘

┌──────────────┐
│ Actions here │ ← increment, decrement
└──────────────┘

     Scattered!
     Hard to find!
     No structure!
```

**Problems:**
❌ State, getters, and actions scattered across files
❌ No clear organizational structure
❌ Hard to find related code
❌ Difficult to test in isolation
❌ No single source of truth
❌ Naming conflicts possible

### The Solution with `store()`

When you use `store()`, everything is in one place:

```javascript
// Everything organized in one store
const counterStore = store(
  { count: 0 },  // State
  {
    getters: {
      // Computed properties
      doubled() { return this.count * 2; },
      isEven() { return this.count % 2 === 0; }
    },
    actions: {
      // Methods
      increment(state) { state.count++; },
      decrement(state) { state.count--; },
      reset(state) { state.count = 0; }
    }
  }
);
```

**What Just Happened?**

```
store() Organization:
┌──────────────────────┐
│   Counter Store      │
│                      │
│  State:              │
│  ├─ count            │
│                      │
│  Getters:            │
│  ├─ doubled          │
│  └─ isEven           │
│                      │
│  Actions:            │
│  ├─ increment        │
│  ├─ decrement        │
│  └─ reset            │
└──────────────────────┘
    Everything together!
    Clear structure!
```

With `store()`:
- All related state in one place
- Clear separation of concerns
- Easy to find and understand
- Testable in isolation
- Single source of truth

**Benefits:**
✅ Centralized state management
✅ Clear organizational structure
✅ Computed properties (getters) built-in
✅ Actions co-located with state
✅ Easy to test and maintain
✅ Single source of truth

 

## Mental Model

Think of `store()` like a **bank vault**:

```
Scattered State (Money Everywhere):
┌──────────┐  ┌──────────┐  ┌──────────┐
│ $100 in  │  │ $50 in   │  │ $200 in  │
│ wallet   │  │ drawer   │  │ safe     │
└──────────┘  └──────────┘  └──────────┘
    Hard to track!
    Easy to lose!

Store (Bank Vault):
┌────────────────────────────────┐
│   Bank Vault (Store)           │
│                                │
│  Current Balance: $350         │ ← State
│                                │
│  Computed Values:              │ ← Getters
│  ├─ In Savings: $280           │
│  └─ In Checking: $70           │
│                                │
│  Operations:                   │ ← Actions
│  ├─ Deposit(amount)            │
│  ├─ Withdraw(amount)           │
│  └─ Transfer(from, to, amount) │
└────────────────────────────────┘
    Everything tracked!
    Organized!
```

**Key Insight:** Just like a bank vault keeps all your money in one secure, organized place with clear operations for deposits and withdrawals, a `store()` keeps all your state in one place with clear getters and actions.

 

## How Does It Work?

### The Magic: State + Computed + Methods

When you call `store()`, here's what happens behind the scenes:

```javascript
// What you write:
const myStore = store(
  { count: 0 },
  {
    getters: {
      doubled() { return this.count * 2; }
    },
    actions: {
      increment(state) { state.count++; }
    }
  }
);

// What actually happens (simplified):
// 1. Create reactive state
const myStore = state({ count: 0 });

// 2. Add computed properties (getters)
computed(myStore, {
  doubled() { return this.count * 2; }
});

// 3. Add action methods
myStore.increment = function() {
  this.count++;
};
```

**In other words:** `store()` is an organizer that:
1. Creates reactive state for your data
2. Adds computed properties for derived values
3. Attaches action methods for state modification
4. Returns a complete, structured store object

### Under the Hood

```
store({ count: 0 }, { getters, actions })
        │
        ▼
┌───────────────────────┐
│  Step 1: Create State │
│  Reactive state obj   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 2: Add Getters  │
│  As computed props    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 3: Add Actions  │
│  As bound methods     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 4: Return       │
│  Complete Store       │
└───────────────────────┘
```

**What happens:**

1️⃣ When you **access state**, it's reactive and tracked
2️⃣ When you **access a getter**, it's computed and cached
3️⃣ When you **call an action**, it modifies state and triggers updates
4️⃣ Everything is **reactive** - effects re-run automatically!

 

## Basic Usage

### Creating a Store

The simplest way to use `store()`:

```js
// Basic store with just state
const userStore = store({
  name: 'John',
  age: 25
});

// Store with state and getters
const counterStore = store(
  { count: 0 },
  {
    getters: {
      doubled() {
        return this.count * 2;
      }
    }
  }
);

// Complete store with state, getters, and actions
const todoStore = store(
  { todos: [] },
  {
    getters: {
      completedCount() {
        return this.todos.filter(t => t.done).length;
      },
      activeCount() {
        return this.todos.filter(t => !t.done).length;
      }
    },
    actions: {
      addTodo(state, text) {
        state.todos.push({
          id: Date.now(),
          text,
          done: false
        });
      },
      toggleTodo(state, id) {
        const todo = state.todos.find(t => t.id === id);
        if (todo) todo.done = !todo.done;
      }
    }
  }
);
```

 

## Store Structure

A store typically has three parts:

### 1. State (Required)

The reactive data:

```js
const myStore = store({
  // State properties
  count: 0,
  user: null,
  isLoading: false
});
```

### 2. Getters (Optional)

Computed properties derived from state:

```js
{
  getters: {
    // Getter functions
    doubled() {
      return this.count * 2;
    },
    userName() {
      return this.user ? this.user.name : 'Guest';
    }
  }
}
```

### 3. Actions (Optional)

Methods that modify state:

```js
{
  actions: {
    // Action functions
    increment(state) {
      state.count++;
    },
    setUser(state, user) {
      state.user = user;
    }
  }
}
```

 

## State

State is the reactive data in your store:

```js
const userStore = store({
  name: 'John',
  email: 'john@example.com',
  isLoggedIn: false
});

// Access state directly
console.log(userStore.name);      // "John"
console.log(userStore.isLoggedIn); // false

// Modify state directly (or use actions)
userStore.name = 'Jane';
userStore.isLoggedIn = true;
```

**Best Practice:** Use actions to modify state instead of direct modification.

 

## Getters (Computed Properties)

Getters are computed properties derived from state:

### Basic Getters

```js
const counterStore = store(
  { count: 0 },
  {
    getters: {
      doubled() {
        return this.count * 2;
      },
      tripled() {
        return this.count * 3;
      },
      isPositive() {
        return this.count > 0;
      }
    }
  }
);

console.log(counterStore.doubled);    // 0
console.log(counterStore.isPositive); // false

counterStore.count = 5;

console.log(counterStore.doubled);    // 10
console.log(counterStore.isPositive); // true
```

### Getters Using Other Getters

```js
const cartStore = store(
  {
    items: [
      { id: 1, name: 'Book', price: 10, quantity: 2 },
      { id: 2, name: 'Pen', price: 2, quantity: 5 }
    ],
    taxRate: 0.1
  },
  {
    getters: {
      subtotal() {
        return this.items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );
      },
      tax() {
        return this.subtotal * this.taxRate;
      },
      total() {
        return this.subtotal + this.tax;
      }
    }
  }
);

console.log(cartStore.subtotal); // 30
console.log(cartStore.tax);      // 3
console.log(cartStore.total);    // 33
```

### Complex Getters

```js
const todoStore = store(
  { todos: [] },
  {
    getters: {
      completedTodos() {
        return this.todos.filter(t => t.done);
      },
      activeTodos() {
        return this.todos.filter(t => !t.done);
      },
      completedCount() {
        return this.completedTodos.length;
      },
      activeCount() {
        return this.activeTodos.length;
      },
      progress() {
        const total = this.todos.length;
        if (total === 0) return 0;
        return (this.completedCount / total) * 100;
      }
    }
  }
);
```

 

## Actions

Actions are methods that modify state:

### Basic Actions

```js
const counterStore = store(
  { count: 0 },
  {
    actions: {
      increment(state) {
        state.count++;
      },
      decrement(state) {
        state.count--;
      },
      reset(state) {
        state.count = 0;
      }
    }
  }
);

// Call actions
counterStore.increment();
console.log(counterStore.count); // 1

counterStore.decrement();
console.log(counterStore.count); // 0
```

### Actions with Parameters

```js
const counterStore = store(
  { count: 0 },
  {
    actions: {
      incrementBy(state, amount) {
        state.count += amount;
      },
      setCount(state, value) {
        state.count = value;
      }
    }
  }
);

counterStore.incrementBy(5);
console.log(counterStore.count); // 5

counterStore.setCount(100);
console.log(counterStore.count); // 100
```

### Async Actions

```js
const userStore = store(
  { user: null, loading: false },
  {
    actions: {
      async fetchUser(state, userId) {
        state.loading = true;

        try {
          const response = await fetch(`/api/users/${userId}`);
          const data = await response.json();
          state.user = data;
        } catch (error) {
          console.error('Failed to fetch user:', error);
        } finally {
          state.loading = false;
        }
      }
    }
  }
);

// Call async action
await userStore.fetchUser(123);
```

### Actions Calling Other Actions

```js
const todoStore = store(
  { todos: [], filter: 'all' },
  {
    actions: {
      addTodo(state, text) {
        state.todos.push({
          id: Date.now(),
          text,
          done: false
        });
      },
      removeTodo(state, id) {
        const index = state.todos.findIndex(t => t.id === id);
        if (index !== -1) {
          state.todos.splice(index, 1);
        }
      },
      clearCompleted(state) {
        // Filter in place
        state.todos = state.todos.filter(t => !t.done);
      }
    }
  }
);
```

 

## Using Stores with Effects

Stores automatically trigger effects when state changes:

```js
const counterStore = store(
  { count: 0 },
  {
    getters: {
      doubled() {
        return this.count * 2;
      }
    },
    actions: {
      increment(state) {
        state.count++;
      }
    }
  }
);

// Effect watches state
effect(() => {
  console.log('Count:', counterStore.count);
});

// Effect watches getter
effect(() => {
  console.log('Doubled:', counterStore.doubled);
});

// Effect watches both
effect(() => {
  document.getElementById('count').textContent = counterStore.count;
  document.getElementById('doubled').textContent = counterStore.doubled;
});

// Trigger effects
counterStore.increment();
// Logs: "Count: 1"
// Logs: "Doubled: 2"
// Updates DOM
```

 

## Common Patterns

### Pattern: User Authentication Store

```js
const authStore = store(
  {
    user: null,
    token: null,
    loading: false,
    error: null
  },
  {
    getters: {
      isAuthenticated() {
        return this.user !== null && this.token !== null;
      },
      userName() {
        return this.user ? this.user.name : 'Guest';
      },
      userEmail() {
        return this.user ? this.user.email : '';
      }
    },
    actions: {
      async login(state, credentials) {
        state.loading = true;
        state.error = null;

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          const data = await response.json();

          state.user = data.user;
          state.token = data.token;

          // Store token in localStorage
          localStorage.setItem('token', data.token);
        } catch (error) {
          state.error = error.message;
        } finally {
          state.loading = false;
        }
      },

      logout(state) {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      },

      async checkAuth(state) {
        const token = localStorage.getItem('token');

        if (!token) return;

        try {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          const user = await response.json();
          state.user = user;
          state.token = token;
        } catch (error) {
          // Invalid token
          state.user = null;
          state.token = null;
          localStorage.removeItem('token');
        }
      }
    }
  }
);

// Check auth on page load
authStore.checkAuth();

// Display based on auth state
effect(() => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userName = document.getElementById('userName');

  if (authStore.isAuthenticated) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userName.textContent = authStore.userName;
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userName.textContent = 'Guest';
  }
});
```

### Pattern: Shopping Cart Store

```js
const cartStore = store(
  {
    items: [],
    taxRate: 0.1,
    shippingCost: 10
  },
  {
    getters: {
      itemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      subtotal() {
        return this.items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );
      },
      tax() {
        return this.subtotal * this.taxRate;
      },
      shipping() {
        return this.subtotal > 50 ? 0 : this.shippingCost;
      },
      total() {
        return this.subtotal + this.tax + this.shipping;
      },
      isEmpty() {
        return this.items.length === 0;
      }
    },
    actions: {
      addItem(state, product) {
        const existingItem = state.items.find(item => item.id === product.id);

        if (existingItem) {
          existingItem.quantity++;
        } else {
          state.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
          });
        }
      },

      removeItem(state, productId) {
        const index = state.items.findIndex(item => item.id === productId);
        if (index !== -1) {
          state.items.splice(index, 1);
        }
      },

      updateQuantity(state, { productId, quantity }) {
        const item = state.items.find(item => item.id === productId);

        if (item) {
          if (quantity <= 0) {
            // Remove item if quantity is 0
            this.removeItem(state, productId);
          } else {
            item.quantity = quantity;
          }
        }
      },

      clear(state) {
        state.items = [];
      }
    }
  }
);

// Display cart summary
effect(() => {
  document.getElementById('itemCount').textContent = cartStore.itemCount;
  document.getElementById('subtotal').textContent = `$${cartStore.subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${cartStore.tax.toFixed(2)}`;
  document.getElementById('shipping').textContent = `$${cartStore.shipping.toFixed(2)}`;
  document.getElementById('total').textContent = `$${cartStore.total.toFixed(2)}`;
});
```

### Pattern: Pagination Store

```js
const paginationStore = store(
  {
    items: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  },
  {
    getters: {
      totalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
      },
      pageItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.items.slice(start, end);
      },
      hasNextPage() {
        return this.currentPage < this.totalPages;
      },
      hasPrevPage() {
        return this.currentPage > 1;
      },
      startIndex() {
        return (this.currentPage - 1) * this.itemsPerPage + 1;
      },
      endIndex() {
        return Math.min(
          this.currentPage * this.itemsPerPage,
          this.totalItems
        );
      }
    },
    actions: {
      setItems(state, items) {
        state.items = items;
        state.totalItems = items.length;
      },

      nextPage(state) {
        if (state.currentPage < this.totalPages) {
          state.currentPage++;
        }
      },

      prevPage(state) {
        if (state.currentPage > 1) {
          state.currentPage--;
        }
      },

      goToPage(state, page) {
        if (page >= 1 && page <= this.totalPages) {
          state.currentPage = page;
        }
      },

      setItemsPerPage(state, count) {
        state.itemsPerPage = count;
        state.currentPage = 1; // Reset to first page
      }
    }
  }
);
```

 

## Common Pitfalls

### Pitfall #1: Modifying State Directly (Inconsistent)

❌ **Inconsistent:**
```js
const myStore = store(
  { count: 0 },
  {
    actions: {
      increment(state) {
        state.count++;
      }
    }
  }
);

// Sometimes using actions
myStore.increment();

// Sometimes modifying directly
myStore.count++;
```

✅ **Consistent (Pick one approach):**
```js
// Option 1: Always use actions
myStore.increment();

// Option 2: Always modify directly (if no actions needed)
myStore.count++;
```

**Best Practice:** If you define actions, always use them for consistency.

 

### Pitfall #2: Wrong `this` Context in Getters

❌ **Wrong:**
```js
const myStore = store(
  { count: 0 },
  {
    getters: {
      // Arrow function: 'this' is wrong!
      doubled: () => {
        return this.count * 2; // undefined!
      }
    }
  }
);
```

✅ **Correct:**
```js
const myStore = store(
  { count: 0 },
  {
    getters: {
      // Regular function: 'this' works!
      doubled() {
        return this.count * 2;
      }
    }
  }
);
```

 

### Pitfall #3: Mutating State Parameter in Actions

❌ **Wrong:**
```js
{
  actions: {
    addItem(state, item) {
      // Trying to reassign parameter
      state = { ...state, items: [...state.items, item] };
      // This doesn't work!
    }
  }
}
```

✅ **Correct:**
```js
{
  actions: {
    addItem(state, item) {
      // Mutate properties, don't reassign
      state.items.push(item);
    }
  }
}
```

 

### Pitfall #4: Async Actions Without Error Handling

❌ **Wrong:**
```js
{
  actions: {
    async fetchData(state) {
      const response = await fetch('/api/data');
      state.data = await response.json();
      // If fetch fails, error goes unhandled
    }
  }
}
```

✅ **Correct:**
```js
{
  actions: {
    async fetchData(state) {
      state.loading = true;
      state.error = null;

      try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Fetch failed');
        state.data = await response.json();
      } catch (error) {
        state.error = error.message;
      } finally {
        state.loading = false;
      }
    }
  }
}
```

 

## Summary

**What is `store()`?**

`store()` creates a **centralized state container** with state, computed properties (getters), and action methods. It provides a structured pattern for state management.

 

**Why use `store()` instead of scattered state?**

- Centralized state management
- Clear organizational structure
- Computed properties (getters) built-in
- Actions co-located with state
- Single source of truth
- Easier to test and maintain

 

**Key Points to Remember:**

1️⃣ **Three parts** - State, getters (computed), actions (methods)
2️⃣ **Getters use `this`** - Use regular functions, not arrow functions
3️⃣ **Actions modify state** - Use actions for consistency
4️⃣ **Reactive by default** - All properties trigger effects
5️⃣ **Centralized pattern** - Everything related in one place

 

**Mental Model:** Think of `store()` as a **bank vault** - it keeps all your state (money) in one secure, organized place with computed values (account totals) and clear operations (deposit/withdraw).

 

**Quick Reference:**

```js
// Create
const myStore = store(
  {
    // State
    count: 0,
    user: null
  },
  {
    // Getters (computed)
    getters: {
      doubled() {
        return this.count * 2;
      },
      userName() {
        return this.user ? this.user.name : 'Guest';
      }
    },

    // Actions (methods)
    actions: {
      increment(state) {
        state.count++;
      },
      setUser(state, user) {
        state.user = user;
      },
      async fetchUser(state, id) {
        const response = await fetch(`/api/users/${id}`);
        state.user = await response.json();
      }
    }
  }
);

// Access state
console.log(myStore.count);

// Access getters
console.log(myStore.doubled);

// Call actions
myStore.increment();
myStore.setUser({ name: 'John' });
await myStore.fetchUser(123);

// Use in effects
effect(() => {
  console.log(myStore.count, myStore.doubled);
});
```

 

**Remember:** `store()` is your pattern for organized state management. It gives you a structured way to manage state, derived values, and state-changing operations all in one centralized location!
