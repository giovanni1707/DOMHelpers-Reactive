# Migration Guide - From Vanilla JS to Reactive

## Quick Overview

This guide helps you migrate from vanilla JavaScript DOM manipulation to the DOM Helpers Reactive library. The transition is gradual — you can adopt reactive patterns piece by piece.

**Before (Vanilla JS):**
```javascript
let count = 0;
document.getElementById('counter').textContent = count;

document.getElementById('incrementBtn').addEventListener('click', () => {
  count++;
  document.getElementById('counter').textContent = count;
});
```

**After (Reactive):**
```javascript
const counter = state({ value: 0 });

effect(() => {
  Elements.counter.textContent = counter.value;
});

Elements.incrementBtn.addEventListener('click', () => {
  counter.value++;
});
```

 

## Why Migrate?

### Vanilla JavaScript Challenges

| Challenge | Vanilla JS | Reactive |
|-----------|-----------|----------|
| Manual DOM updates | Must call update after every change | Automatic updates |
| Scattered update logic | Update functions everywhere | Centralized effects |
| Forgetting updates | Easy to miss | Impossible to miss |
| Computed values | Manual recalculation | Auto-cached computed |
| State consistency | Hard to maintain | Guaranteed consistency |

 

## Migration Steps

### Step 1: Replace Variables with State

**Before:**
```javascript
let userName = 'John';
let userEmail = 'john@example.com';
let isLoggedIn = false;
```

**After:**
```javascript
const user = state({
  name: 'John',
  email: 'john@example.com',
  isLoggedIn: false
});
```

**Key changes:**
- Group related variables into state objects
- Use `state()` to make them reactive
- Access with dot notation: `user.name`

 

### Step 2: Replace getElementById with Elements

**Before:**
```javascript
const counterEl = document.getElementById('counter');
const messageEl = document.getElementById('message');
const buttonEl = document.getElementById('submitBtn');

counterEl.textContent = '0';
messageEl.innerHTML = '<p>Hello</p>';
buttonEl.disabled = true;
```

**After:**
```javascript
Elements.counter.textContent = '0';
Elements.message.innerHTML = '<p>Hello</p>';
Elements.submitBtn.disabled = true;
```

**Key changes:**
- No need for `document.getElementById()`
- Access elements directly by ID via `Elements`
- Cleaner, shorter code

 

### Step 3: Replace Manual Updates with Effects

**Before:**
```javascript
let counter = 0;

function updateDisplay() {
  document.getElementById('counter').textContent = counter;
  document.getElementById('doubleCounter').textContent = counter * 2;
  document.getElementById('isEven').textContent = counter % 2 === 0 ? 'Yes' : 'No';
}

// Must remember to call this after every change!
function increment() {
  counter++;
  updateDisplay(); // Easy to forget!
}

function reset() {
  counter = 0;
  updateDisplay(); // Must remember here too!
}
```

**After:**
```javascript
const counter = state({ value: 0 });

// Declare ONCE — runs automatically on any change
effect(() => {
  Elements.counter.textContent = counter.value;
  Elements.doubleCounter.textContent = counter.value * 2;
  Elements.isEven.textContent = counter.value % 2 === 0 ? 'Yes' : 'No';
});

// Just change state — no manual updates needed!
function increment() {
  counter.value++;
}

function reset() {
  counter.value = 0;
}
```

 

### Step 4: Replace Calculated Values with Computed

**Before:**
```javascript
let items = [];

function getTotal() {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getTax() {
  return getTotal() * 0.08;
}

function getGrandTotal() {
  return getTotal() + getTax();
}

// Must recalculate every time items change
function addItem(item) {
  items.push(item);
  document.getElementById('total').textContent = getTotal();
  document.getElementById('tax').textContent = getTax();
  document.getElementById('grandTotal').textContent = getGrandTotal();
}
```

**After:**
```javascript
const cart = state({ items: [] });

// Computed values — auto-cached, auto-updated
computed(cart, {
  total: function() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },
  tax: function() {
    return this.total * 0.08;
  },
  grandTotal: function() {
    return this.total + this.tax;
  }
});

// UI automatically updates
effect(() => {
  Elements.total.textContent = `$${cart.total.toFixed(2)}`;
  Elements.tax.textContent = `$${cart.tax.toFixed(2)}`;
  Elements.grandTotal.textContent = `$${cart.grandTotal.toFixed(2)}`;
});

// Just add item — everything updates!
function addItem(item) {
  cart.items.push(item);
}
```

 

### Step 5: Replace Multiple Updates with Batch

**Before:**
```javascript
function loadUserData(data) {
  userName = data.name;      // Triggers update
  userEmail = data.email;    // Triggers update
  userRole = data.role;      // Triggers update
  userAvatar = data.avatar;  // Triggers update
  // 4 separate updates!
}
```

**After:**
```javascript
function loadUserData(data) {
  batch(() => {
    user.name = data.name;
    user.email = data.email;
    user.role = data.role;
    user.avatar = data.avatar;
  });
  // Only 1 update! ✨
}
```

 

### Step 6: Replace Conditional DOM with Effects

**Before:**
```javascript
function updateAuthUI() {
  if (isLoggedIn) {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('userPanel').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = `Welcome, ${userName}!`;
  } else {
    document.getElementById('loginPanel').style.display = 'block';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('welcomeMessage').textContent = '';
  }
}

// Must call after login/logout
function login(name) {
  isLoggedIn = true;
  userName = name;
  updateAuthUI(); // Don't forget!
}

function logout() {
  isLoggedIn = false;
  userName = '';
  updateAuthUI(); // Don't forget!
}
```

**After:**
```javascript
const auth = state({
  isLoggedIn: false,
  userName: ''
});

// Declare ONCE — handles all cases automatically
effect(() => {
  Elements.style({
    loginPanel: { display: auth.isLoggedIn ? 'none' : 'block' },
    userPanel: { display: auth.isLoggedIn ? 'block' : 'none' }
  });

  Elements.welcomeMessage.textContent = auth.isLoggedIn
    ? `Welcome, ${auth.userName}!`
    : '';
});

// Just change state — UI updates automatically!
function login(name) {
  auth.isLoggedIn = true;
  auth.userName = name;
}

function logout() {
  auth.isLoggedIn = false;
  auth.userName = '';
}
```

 

## Common Migration Patterns

### Pattern 1: Simple Counter

**Before:**
```javascript
let count = 0;

document.getElementById('count').textContent = count;

document.getElementById('increment').onclick = () => {
  count++;
  document.getElementById('count').textContent = count;
};

document.getElementById('decrement').onclick = () => {
  count--;
  document.getElementById('count').textContent = count;
};
```

**After:**
```javascript
const counter = state({ value: 0 });

effect(() => {
  Elements.count.textContent = counter.value;
});

Elements.increment.onclick = () => counter.value++;
Elements.decrement.onclick = () => counter.value--;
```

 

### Pattern 2: Form Handling

**Before:**
```javascript
let formData = {
  email: '',
  password: '',
  errors: {}
};

document.getElementById('email').oninput = (e) => {
  formData.email = e.target.value;
  validateEmail();
  updateErrorDisplay();
};

function validateEmail() {
  if (!formData.email.includes('@')) {
    formData.errors.email = 'Invalid email';
  } else {
    delete formData.errors.email;
  }
}

function updateErrorDisplay() {
  document.getElementById('emailError').textContent = formData.errors.email || '';
  document.getElementById('emailError').style.display = formData.errors.email ? 'block' : 'none';
}
```

**After:**
```javascript
const formData = state({
  email: '',
  password: '',
  errors: {}
});

// Validation in a watch
watch(formData, 'email', (email) => {
  formData.errors.email = email.includes('@') ? '' : 'Invalid email';
});

// UI binding in an effect
effect(() => {
  Elements.emailError.textContent = formData.errors.email || '';
  Elements.emailError.style.display = formData.errors.email ? 'block' : 'none';
});

// Input handler just sets state
Elements.email.oninput = (e) => {
  formData.email = e.target.value;
};
```

 

### Pattern 3: List Rendering

**Before:**
```javascript
let todos = [];

function renderTodos() {
  const list = document.getElementById('todoList');
  list.innerHTML = todos.map(todo => `
    <li class="${todo.done ? 'done' : ''}">
      <input type="checkbox" ${todo.done ? 'checked' : ''}
             onchange="toggleTodo(${todo.id})">
      ${todo.text}
      <button onclick="deleteTodo(${todo.id})">Delete</button>
    </li>
  `).join('');
}

function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false });
  renderTodos(); // Don't forget!
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.done = !todo.done;
  renderTodos(); // Don't forget!
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos(); // Don't forget!
}
```

**After:**
```javascript
const todoState = state({ items: [] });

// Render automatically on any change
effect(() => {
  Elements.todoList.innerHTML = todoState.items.map(todo => `
    <li class="${todo.done ? 'done' : ''}">
      <input type="checkbox" ${todo.done ? 'checked' : ''}
             onchange="toggleTodo(${todo.id})">
      ${todo.text}
      <button onclick="deleteTodo(${todo.id})">Delete</button>
    </li>
  `).join('');
});

// Just modify state — no render calls needed!
function addTodo(text) {
  todoState.items.push({ id: Date.now(), text, done: false });
}

function toggleTodo(id) {
  const todo = todoState.items.find(t => t.id === id);
  if (todo) todo.done = !todo.done;
}

function deleteTodo(id) {
  todoState.items = todoState.items.filter(t => t.id !== id);
}
```

 

### Pattern 4: Async Data Loading

**Before:**
```javascript
let users = [];
let isLoading = false;
let error = null;

async function fetchUsers() {
  isLoading = true;
  updateLoadingUI();

  try {
    const response = await fetch('/api/users');
    users = await response.json();
    error = null;
  } catch (e) {
    error = e.message;
  } finally {
    isLoading = false;
    updateLoadingUI();
    renderUsers();
    updateErrorUI();
  }
}

function updateLoadingUI() {
  document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}

function renderUsers() {
  document.getElementById('userList').innerHTML = users
    .map(u => `<li>${u.name}</li>`)
    .join('');
}

function updateErrorUI() {
  document.getElementById('error').textContent = error || '';
  document.getElementById('error').style.display = error ? 'block' : 'none';
}
```

**After:**
```javascript
const usersData = asyncState(null);

// All UI bindings declared once
effect(() => {
  Elements.style({
    loading: { display: usersData.isLoading ? 'block' : 'none' },
    error: { display: usersData.error ? 'block' : 'none' }
  });

  Elements.error.textContent = usersData.error || '';
});

effect(() => {
  if (usersData.data) {
    Elements.userList.innerHTML = usersData.data
      .map(u => `<li>${u.name}</li>`)
      .join('');
  }
});

// Fetch is simple
async function fetchUsers() {
  await execute(usersData, async () => {
    const response = await fetch('/api/users');
    return response.json();
  });
}
```

 

### Pattern 5: Multi-Component Communication

**Before:**
```javascript
// Header component
let cartItemCount = 0;

function updateCartBadge() {
  document.getElementById('cartBadge').textContent = cartItemCount;
}

// Cart component
let cartItems = [];

function addToCart(item) {
  cartItems.push(item);
  cartItemCount = cartItems.length;
  updateCartBadge();  // Must update header
  renderCart();       // Must update cart
}

// Multiple components need to know about cart changes
function removeFromCart(id) {
  cartItems = cartItems.filter(i => i.id !== id);
  cartItemCount = cartItems.length;
  updateCartBadge();  // Don't forget!
  renderCart();       // Don't forget!
  updateTotals();     // Don't forget this either!
}
```

**After:**
```javascript
// Shared state — single source of truth
const cart = state({ items: [] });

// Computed count
computed(cart, {
  itemCount: function() {
    return this.items.length;
  }
});

// Header effect — automatically updates
effect(() => {
  Elements.cartBadge.textContent = cart.itemCount;
});

// Cart effect — automatically updates
effect(() => {
  Elements.cartList.innerHTML = cart.items
    .map(item => `<li>${item.name} - $${item.price}</li>`)
    .join('');
});

// Simple functions — no manual updates needed
function addToCart(item) {
  cart.items.push(item);
}

function removeFromCart(id) {
  cart.items = cart.items.filter(i => i.id !== id);
}
```

 

## Migration Checklist

### Phase 1: Setup

- [ ] Include DOM Helpers library
- [ ] Include Reactive library modules
- [ ] Test that `state()`, `effect()`, `Elements` work

### Phase 2: Replace Variables

- [ ] Identify related variables
- [ ] Group into state objects
- [ ] Replace direct access with state properties

### Phase 3: Replace DOM Access

- [ ] Replace `document.getElementById()` with `Elements`
- [ ] Replace `document.getElementsByClassName()` with `Collections`
- [ ] Replace `document.querySelector()` with `Selector`

### Phase 4: Replace Update Functions

- [ ] Identify all manual update functions
- [ ] Convert to `effect()` declarations
- [ ] Remove manual update calls

### Phase 5: Add Computed Properties

- [ ] Identify calculated/derived values
- [ ] Convert to `computed()`
- [ ] Remove manual recalculation calls

### Phase 6: Optimize

- [ ] Use `batch()` for multiple state changes
- [ ] Use `watch()` for specific property reactions
- [ ] Add `cleanup()` for proper memory management

 

## Before and After Summary

| Vanilla JS | Reactive | Benefit |
|------------|----------|---------|
| `let x = value` | `state({ x: value })` | Reactive updates |
| `document.getElementById('x')` | `Elements.x` | Cleaner access |
| `updateDisplay()` calls | `effect(() => { ... })` | Automatic updates |
| Manual calculations | `computed()` | Auto-cached |
| Multiple update calls | `batch()` | Single update |
| `addEventListener` scattered | `watch()` | Organized reactions |

 

## Tips for Successful Migration

### 1. Migrate Gradually

Don't rewrite everything at once. Start with one component or feature:

```javascript
// Start with one reactive state
const counter = state({ value: 0 });

// Keep other code vanilla for now
let someOtherValue = 'still vanilla';
```

### 2. Keep State Close to Usage

```javascript
// ✅ Good - state near its UI
function createCounter() {
  const counter = state({ value: 0 });

  effect(() => {
    Elements.count.textContent = counter.value;
  });

  return counter;
}
```

### 3. Use Computed for Derived Data

```javascript
// ❌ Before - manual calculation
effect(() => {
  const total = cart.items.reduce((sum, i) => sum + i.price, 0);
  Elements.total.textContent = total;
});

// ✅ After - computed property
computed(cart, {
  total: function() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  }
});

effect(() => {
  Elements.total.textContent = cart.total;
});
```

### 4. Remember Cleanup

```javascript
// Store cleanup functions
const cleanups = [];

cleanups.push(effect(() => { /* ... */ }));
cleanups.push(watch(state, 'prop', () => { /* ... */ }));

// Clean up when done
function destroy() {
  cleanups.forEach(cleanup => cleanup());
}
```

 

## Summary

**Migration is about:**
1. Replacing variables with `state()`
2. Replacing `getElementById` with `Elements`
3. Replacing update functions with `effect()`
4. Replacing calculations with `computed()`
5. Using `batch()` for performance
6. Using `cleanup()` for memory management

**The key insight:**
Vanilla JS is **imperative** — you tell it what to do step by step.
Reactive is **declarative** — you describe what should happen, and it happens automatically.

**Start small, migrate gradually, and enjoy the benefits of reactive programming!**
