# `store()` - Global State with Getters and Actions

## Quick Start (30 seconds)

```javascript
// Create store with state, getters, and actions
const counterStore = store(
  { count: 0, step: 1 },
  {
    getters: {
      double: function() { return this.count * 2; },
      triple: function() { return this.count * 3; }
    },
    actions: {
      increment: function() { this.count += this.step; },
      decrement: function() { this.count -= this.step; },
      reset: function() { this.count = 0; }
    }
  }
);

// Auto-update UI
effect(() => {
  Elements.textContent({
    count: counterStore.count,
    double: counterStore.double // ✨ Computed!
  });
});


// Use actions using bulk event binding
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => counterStore.increment()]
  }
});
```

**That's it.** Create global state stores with computed getters and action methods. Perfect for application-level state management.

---

## What is `store()`?

`store()` creates **global state with computed getters and action methods**. It's a pattern for organizing application state with clear separation between data, computed values, and mutations.

Think of it as **a mini Redux/Vuex** — centralized state with getters (computed properties) and actions (methods that modify state).

**In practical terms:** Instead of scattering state logic throughout your app, you create a store that holds all state, computed values, and methods to modify that state in one place.

---

## Syntax

```javascript
// Create store
const myStore = store(initialState, options);

// Options
const options = {
  getters: {
    // Computed properties
    propertyName: function() { return /* computed value */; }
  },
  actions: {
    // Methods that modify state
    methodName: function(/* args */) { this.property = newValue; }
  }
};

// Example
const todoStore = store(
  { todos: [], filter: 'all' },
  {
    getters: {
      activeTodos: function() {
        return this.todos.filter(t => !t.done);
      },
      completedTodos: function() {
        return this.todos.filter(t => t.done);
      },
      filteredTodos: function() {
        if (this.filter === 'active') return this.activeTodos;
        if (this.filter === 'completed') return this.completedTodos;
        return this.todos;
      }
    },
    actions: {
      addTodo: function(text) {
        this.todos.push({ id: Date.now(), text, done: false });
      },
      toggleTodo: function(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) todo.done = !todo.done;
      },
      setFilter: function(filter) {
        this.filter = filter;
      }
    }
  }
);

// Use getters (computed)
console.log(todoStore.activeTodos);

// Use actions
todoStore.addTodo('Buy milk');
todoStore.toggleTodo(123);
```

**Parameters:**
- `initialState` - Object with initial state properties
- `options.getters` (optional) - Computed properties
- `options.actions` (optional) - Methods to modify state

**Returns:**
- Reactive store with state, getters (computed), and actions (methods)

---

## Why Does This Exist?

### The Problem Without store()

Managing global application state manually becomes messy:

```javascript
// ❌ Vanilla JavaScript - scattered global state
let appTodos = [];
let appFilter = 'all';
let appUser = null;

// Computed values scattered
function getActiveTodos() {
  return appTodos.filter(t => !t.done);
}

function getCompletedTodos() {
  return appTodos.filter(t => !t.done);
}

// Actions scattered
function addTodo(text) {
  appTodos.push({ id: Date.now(), text, done: false });
  updateAllTodoDisplays(); // Manual update
}

function toggleTodo(id) {
  const todo = appTodos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    updateAllTodoDisplays(); // Manual update
  }
}

// Manual UI updates everywhere
function updateAllTodoDisplays() {
  document.getElementById('active-count').textContent = getActiveTodos().length;
  document.getElementById('completed-count').textContent = getCompletedTodos().length;
  // ... more manual updates
}
```

**Problems:**
❌ **Scattered state** - Global variables everywhere
❌ **Scattered logic** - Getters and actions not organized
❌ **Manual updates** - Must call update functions everywhere
❌ **Hard to maintain** - No clear structure
❌ **No reactivity** - Manual DOM sync required

### The Solution with `store()`

```javascript
// ✅ DOM Helpers + Reactive State with store() - organized and automatic
const todoStore = store(
  {
    todos: [],
    filter: 'all',
    user: null
  },
  {
    getters: {
      activeTodos: function() {
        return this.todos.filter(t => !t.done);
      },
      completedTodos: function() {
        return this.todos.filter(t => t.done);
      },
      filteredTodos: function() {
        if (this.filter === 'active') return this.activeTodos;
        if (this.filter === 'completed') return this.completedTodos;
        return this.todos;
      }
    },
    actions: {
      addTodo: function(text) {
        this.todos.push({ id: Date.now(), text, done: false });
      },
      toggleTodo: function(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) todo.done = !todo.done;
      },
      removeTodo: function(id) {
        this.todos = this.todos.filter(t => t.id !== id);
      },
      setFilter: function(filter) {
        this.filter = filter;
      },
      setUser: function(user) {
        this.user = user;
      }
    }
  }
);

// Auto-update UI using bulk updates
effect(() => {
  Elements.update({
    todoList: {
      innerHTML: todoStore.filteredTodos
        .map(t => `<li class="${t.done ? 'done' : ''}">${t.text}</li>`)
        .join('')
    },
    activeCount: { textContent: `${todoStore.activeTodos.length} active` },
    completedCount: { textContent: `${todoStore.completedTodos.length} completed` },
    currentFilter: { textContent: todoStore.filter }
  });
});

// Use actions with bulk event binding
Elements.update({
  addTodoBtn: {
    addEventListener: ['click', () => {
      const text = Elements.todoInput.value;
      if (text) {
        todoStore.addTodo(text);
        Elements.todoInput.value = '';
      }
    }]
  }
});
```

**Benefits:**
✅ **Organized state** - All state in one place
✅ **Computed getters** - Cached, auto-updating computed values
✅ **Clear actions** - Methods that modify state
✅ **Automatic updates** - Effects handle DOM sync
✅ **Easy to test** - Isolated state logic

---

## Mental Model: Central Database

Think of `store()` like **a central database with views and procedures**:

**Without store() (Scattered Data):**
```
┌─────────────────────────────┐
│  Data Scattered Everywhere  │
│                             │
│  let todos = []             │
│  let filter = 'all'         │
│  let user = null            │
│                             │
│  function getActive() {...} │
│  function addTodo() {...}   │
│  function toggle() {...}    │
│                             │
│  Hard to find and maintain! │
└─────────────────────────────┘
```

**With store() (Central Database):**
```
┌─────────────────────────────┐
│  Central Store              │
│                             │
│  State (Tables)             │
│  ├─ todos: []               │
│  ├─ filter: 'all'           │
│  └─ user: null              │
│                             │
│  Getters (Views)            │
│  ├─ activeTodos             │
│  └─ completedTodos          │
│                             │
│  Actions (Procedures)       │
│  ├─ addTodo()               │
│  └─ toggleTodo()            │
│                             │
│  Everything organized!      │
└─────────────────────────────┘
```

The store is your **single source of truth** with clear structure.

---

## Basic Usage

### Example 1: Counter Store

```javascript
const counterStore = store(
  { count: 0, step: 1, history: [] },
  {
    getters: {
      double: function() {
        return this.count * 2;
      },
      isEven: function() {
        return this.count % 2 === 0;
      },
      lastChange: function() {
        return this.history[this.history.length - 1] || 'No changes yet';
      }
    },
    actions: {
      increment: function() {
        this.count += this.step;
        this.history.push(`+${this.step}`);
      },
      decrement: function() {
        this.count -= this.step;
        this.history.push(`-${this.step}`);
      },
      setStep: function(step) {
        this.step = step;
      },
      reset: function() {
        this.count = 0;
        this.history = [];
      }
    }
  }
);

// UI updates using bulk updates
effect(() => {
  Elements.update({
    count: { textContent: counterStore.count },
    double: { textContent: `Double: ${counterStore.double}` },
    parity: { textContent: counterStore.isEven ? 'Even' : 'Odd' },
    lastChange: { textContent: counterStore.lastChange }
  });
});

// Actions using bulk event binding
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => counterStore.increment()]
  },
  decrementBtn: {
    addEventListener: ['click', () => counterStore.decrement()]
  },
  resetBtn: {
    addEventListener: ['click', () => counterStore.reset()]
  }
});
```

---

### Example 2: Shopping Cart Store

```javascript
const cartStore = store(
  { items: [], discountCode: '', taxRate: 0.08 },
  {
    getters: {
      itemCount: function() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
      },
      subtotal: function() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      },
      discount: function() {
        if (this.discountCode === 'SAVE10') return this.subtotal * 0.1;
        if (this.discountCode === 'SAVE20') return this.subtotal * 0.2;
        return 0;
      },
      tax: function() {
        return (this.subtotal - this.discount) * this.taxRate;
      },
      total: function() {
        return this.subtotal - this.discount + this.tax;
      }
    },
    actions: {
      addItem: function(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
          existing.qty++;
        } else {
          this.items.push({ ...product, qty: 1 });
        }
      },
      removeItem: function(id) {
        this.items = this.items.filter(i => i.id !== id);
      },
      updateQty: function(id, qty) {
        const item = this.items.find(i => i.id === id);
        if (item) {
          if (qty <= 0) {
            this.removeItem(id);
          } else {
            item.qty = qty;
          }
        }
      },
      applyDiscount: function(code) {
        this.discountCode = code;
      },
      clear: function() {
        this.items = [];
        this.discountCode = '';
      }
    }
  }
);

// UI updates using bulk updates
effect(() => {
  Elements.update({
    itemCount: { textContent: `${cartStore.itemCount} items` },
    subtotal: { textContent: `$${cartStore.subtotal.toFixed(2)}` },
    discount: {
      textContent: cartStore.discount > 0 ? `-$${cartStore.discount.toFixed(2)}` : '',
      style: { display: cartStore.discount > 0 ? 'block' : 'none' }
    },
    tax: { textContent: `$${cartStore.tax.toFixed(2)}` },
    total: { textContent: `$${cartStore.total.toFixed(2)}` }
  });
});
```

---

### Example 3: User Authentication Store

```javascript
const authStore = store(
  { user: null, token: null, isLoading: false },
  {
    getters: {
      isAuthenticated: function() {
        return this.user !== null && this.token !== null;
      },
      userName: function() {
        return this.user?.name || 'Guest';
      },
      userInitials: function() {
        if (!this.user) return '?';
        const names = this.user.name.split(' ');
        return names.map(n => n[0]).join('');
      }
    },
    actions: {
      login: async function(credentials) {
        this.isLoading = true;
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          const data = await response.json();
          this.user = data.user;
          this.token = data.token;

          localStorage.setItem('token', data.token);
        } finally {
          this.isLoading = false;
        }
      },
      logout: function() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
      },
      loadFromStorage: function() {
        const token = localStorage.getItem('token');
        if (token) {
          this.token = token;
          // Fetch user data...
        }
      }
    }
  }
);

// UI updates using bulk updates
effect(() => {
  Elements.update({
    loginPanel: {
      style: { display: authStore.isAuthenticated ? 'none' : 'block' }
    },
    userPanel: {
      style: { display: authStore.isAuthenticated ? 'block' : 'none' }
    },
    userName: { textContent: authStore.userName },
    userAvatar: { textContent: authStore.userInitials }
  });
});
```

---

See full documentation for 10+ comprehensive examples covering todo lists, theme stores, notification systems, and more.

---

## store() vs state()

### Using state() (Simple Reactive State)
```javascript
const todos = state({ items: [], filter: 'all' });

// Computed added separately
computed(todos, {
  active: function() { return this.items.filter(t => !t.done); }
});

// Actions are just functions
function addTodo(text) {
  todos.items.push({ text, done: false });
}
```

### Using store() (Organized Structure)
```javascript
const todoStore = store(
  { items: [], filter: 'all' },
  {
    getters: {
      active: function() { return this.items.filter(t => !t.done); }
    },
    actions: {
      addTodo: function(text) {
        this.items.push({ text, done: false });
      }
    }
  }
);

// Everything in one place
todoStore.addTodo('Buy milk');
```

**When to use store():**
✅ Application-level state
✅ Complex state with many getters and actions
✅ Need organized structure
✅ Team collaboration (clear patterns)

**When to use state():**
✅ Component-level state
✅ Simple reactive data
✅ Flexible, ad-hoc patterns

---

## Key Takeaways

✅ **Organized structure** - State, getters, actions in one place
✅ **Computed getters** - Cached computed properties
✅ **Clear actions** - Methods that modify state
✅ **Reactive** - Works with effects and bindings
✅ **Global state pattern** - Single source of truth

---

## What's Next?

- **`component()`** - Component pattern with lifecycle
- **`state()`** - For simple reactive state
- **`computed()`** - Add computed properties

---

## Summary

`store()` creates **global state stores with getters and actions**. Perfect for organizing application-level state with clear separation between data, computed values, and mutations.

**The magic formula:**
```
store(state, { getters, actions }) =
  state(initialState) +
  computed(getters) +
  action methods
───────────────────────────────────
Organized global state management
```

Think of it as **a mini Redux/Vuex** — centralized, structured, reactive state management without the complexity. Perfect for medium to large applications that need organized state patterns.
