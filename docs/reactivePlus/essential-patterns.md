# Essential Patterns: The Core Techniques You'll Use Every Day

## Introduction: Master These, Build Anything

These are the **fundamental patterns** you'll use in 90% of your applications. They're not advanced techniques—they're the **bread and butter** of building reactive UIs with DOM Helpers.

Master these patterns, and you can build:
- ✅ Dynamic forms with validation
- ✅ Interactive lists and tables
- ✅ Conditional UI based on state
- ✅ Real-time computed values
- ✅ Complex multi-step workflows

**This section is organized by use case**, not by API. Each pattern shows **complete, working examples** you can copy and adapt.

Let's dive in.

---

## Pattern 1: State → DOM Updates

The most fundamental pattern: **state changes, DOM updates automatically**.

### Single Element Updates

When one piece of state controls one element.

#### Basic Example: Display User Name

```javascript
// State
const user = state({
  name: 'Sarah Chen'
});

// Effect: Connect state to DOM
effect(() => {
  Elements.userName.textContent = user.name;
});

// Change state → DOM updates automatically
user.name = 'Alex Johnson'; // userName element updates instantly
```

**What's happening:**
1. `effect()` runs immediately when created
2. Reactive system tracks that this effect reads `user.name`
3. When `user.name` changes, effect runs again
4. DOM updates automatically

---

#### Multiple Properties, Single Element

When one element needs multiple state properties:

```javascript
const user = state({
  name: 'Sarah',
  role: 'Admin',
  status: 'Active'
});

// Single element, multiple properties
effect(() => {
  Elements.userCard.update({
    textContent: `${user.name} (${user.role})`,
    classList: { 
      add: user.status === 'Active' ? 'active' : 'inactive' 
    }
  });
});
```

---

### Bulk Property Updaters: Multiple Elements, Same Property

When multiple elements need the **same property** updated.

#### Example: Update Multiple Text Elements

**❌ Don't do this (repetitive):**
```javascript
effect(() => {
  Elements.firstName.textContent = user.firstName;
  Elements.lastName.textContent = user.lastName;
  Elements.email.textContent = user.email;
  Elements.role.textContent = user.role;
});
```

**✅ Do this (bulk property updater):**
```javascript
const user = state({
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah@example.com',
  role: 'Admin'
});

effect(() => {
  // Bulk property updater - all textContent at once
  Elements.textContent({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  });
});
```

**Why better:**
- ✅ Less repetition
- ✅ Clear intent: "Update text for these elements"
- ✅ One operation instead of four

---

#### Example: Update Multiple Styles

```javascript
const theme = state({
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6'
});

effect(() => {
  // Bulk property updater for styles
  Elements.style({
    header: { backgroundColor: theme.primaryColor },
    sidebar: { borderColor: theme.primaryColor },
    button: { backgroundColor: theme.accentColor },
    link: { color: theme.accentColor }
  });
});
```

---

### When to Use `effect()` vs `whenState()`

This is a common question. Here's the clear answer:

#### Use `effect()` when:
✅ You need **direct control** over the update logic  
✅ You're updating **multiple elements** based on state  
✅ You need to **call functions** or perform **calculations**  
✅ You're working with **non-conditional** updates  

**Example:**
```javascript
effect(() => {
  // Calculate and update
  const total = cart.items.reduce((sum, item) => sum + item.price, 0);
  
  Elements.textContent({
    subtotal: `$${total.toFixed(2)}`,
    tax: `$${(total * 0.1).toFixed(2)}`,
    total: `$${(total * 1.1).toFixed(2)}`
  });
});
```

---

#### Use `whenState()` when:
✅ You have **clear state branches** (loading/success/error, active/inactive, etc.)  
✅ You want **declarative** conditional logic  
✅ Updates are based on **specific state values**  
✅ You want **self-documenting** code  

**Example:**
```javascript
whenState(
  () => request.status,
  {
    loading: { 
      textContent: 'Loading...',
      disabled: true,
      classList: { add: 'loading' }
    },
    success: { 
      textContent: 'Success!',
      disabled: false,
      classList: { add: 'success' }
    },
    error: { 
      textContent: 'Failed',
      disabled: false,
      classList: { add: 'error' }
    }
  },
  '#submitBtn'
);
```

---

#### Quick Decision Guide

| Scenario | Use |
|----------|-----|
| Simple value display | `effect()` with bulk property updater |
| Conditional states (loading/success/error) | `whenState()` |
| Calculations and derived values | `effect()` |
| Show/hide based on boolean | `whenState()` |
| Multiple elements, same logic | `effect()` with bulk updater |
| Different UI per state value | `whenState()` |

**Rule of thumb:** If you'd write an if-else chain, use `whenState()`. Otherwise, use `effect()`.

---

## Pattern 2: Form Input Binding

Forms are everywhere. These patterns handle the most common scenarios.

### Two-Way Sync: State ↔ Input

State updates input, input updates state.

#### Text Input Binding

```javascript
const form = state({
  email: '',
  password: ''
});

// Input → State
Elements.emailInput.addEventListener('input', (e) => {
  form.email = e.target.value;
});

Elements.passwordInput.addEventListener('input', (e) => {
  form.password = e.target.value;
});

// State → Input
effect(() => {
  Elements.emailInput.value = form.email;
  Elements.passwordInput.value = form.password;
});
```

**Wait, why update input from state?** Because state might change from other sources (reset button, API data, etc.).

---

#### Checkbox Binding

```javascript
const settings = state({
  darkMode: false,
  notifications: true
});

// Checkbox → State
Elements.darkModeCheckbox.addEventListener('change', (e) => {
  settings.darkMode = e.target.checked;
});

// State → Checkbox
effect(() => {
  Elements.darkModeCheckbox.checked = settings.darkMode;
});
```

---

#### Select/Dropdown Binding

```javascript
const user = state({
  country: 'US'
});

// Select → State
Elements.countrySelect.addEventListener('change', (e) => {
  user.country = e.target.value;
});

// State → Select
effect(() => {
  Elements.countrySelect.value = user.country;
});
```

---

### Input Validation Patterns

Real forms need validation. Here's how to do it reactively.

#### Basic Validation with Computed

```javascript
const form = state({
  email: '',
  password: ''
});

// Computed validation
computed(form, {
  emailValid: function() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  },
  
  passwordValid: function() {
    return this.password.length >= 8;
  },
  
  formValid: function() {
    return this.emailValid && this.passwordValid;
  }
});

// Show validation errors
whenState(
  () => form.emailValid,
  {
    true: { style: { display: 'none' } },
    false: { 
      style: { display: 'block' },
      textContent: 'Please enter a valid email'
    }
  },
  '#emailError'
);

whenState(
  () => form.passwordValid,
  {
    true: { style: { display: 'none' } },
    false: { 
      style: { display: 'block' },
      textContent: 'Password must be at least 8 characters'
    }
  },
  '#passwordError'
);

// Enable/disable submit based on validation
whenState(
  () => form.formValid,
  {
    true: { disabled: false },
    false: { disabled: true }
  },
  '#submitBtn'
);
```

**What's great about this:**
- ✅ Validation logic in computed (single source of truth)
- ✅ Declarative error display with `whenState()`
- ✅ Submit button state managed automatically

---

#### Validation on Blur (Touch-based)

Show errors only after user has interacted:

```javascript
const form = state({
  email: '',
  emailTouched: false
});

computed(form, {
  emailValid: function() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  },
  
  showEmailError: function() {
    return this.emailTouched && !this.emailValid;
  }
});

// Mark as touched on blur
Elements.emailInput.addEventListener('blur', () => {
  form.emailTouched = true;
});

// Show error only if touched and invalid
whenState(
  () => form.showEmailError,
  {
    true: { 
      style: { display: 'block' },
      textContent: 'Please enter a valid email'
    },
    false: { style: { display: 'none' } }
  },
  '#emailError'
);
```

---

### Complete Form State Management

Real-world form with all the pieces together:

```javascript
const loginForm = state({
  // Form data
  email: '',
  password: '',
  
  // UI state
  emailTouched: false,
  passwordTouched: false,
  submitting: false,
  error: null,
  success: false
});

// Validation computed properties
computed(loginForm, {
  emailValid: function() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  },
  
  passwordValid: function() {
    return this.password.length >= 8;
  },
  
  formValid: function() {
    return this.emailValid && this.passwordValid;
  },
  
  canSubmit: function() {
    return this.formValid && !this.submitting;
  },
  
  showEmailError: function() {
    return this.emailTouched && !this.emailValid;
  },
  
  showPasswordError: function() {
    return this.passwordTouched && !this.passwordValid;
  }
});

// Input → State bindings
Elements.emailInput.addEventListener('input', (e) => {
  loginForm.email = e.target.value;
});

Elements.passwordInput.addEventListener('input', (e) => {
  loginForm.password = e.target.value;
});

// Blur tracking
Elements.emailInput.addEventListener('blur', () => {
  loginForm.emailTouched = true;
});

Elements.passwordInput.addEventListener('blur', () => {
  loginForm.passwordTouched = true;
});

// Validation error display
whenState(
  () => loginForm.showEmailError,
  {
    true: { 
      style: { display: 'block' },
      textContent: 'Please enter a valid email'
    },
    false: { style: { display: 'none' } }
  },
  '#emailError'
);

whenState(
  () => loginForm.showPasswordError,
  {
    true: { 
      style: { display: 'block' },
      textContent: 'Password must be at least 8 characters'
    },
    false: { style: { display: 'none' } }
  },
  '#passwordError'
);

// Submit button state
whenState(
  () => loginForm.submitting,
  {
    true: { 
      textContent: 'Logging in...',
      disabled: true
    },
    false: { 
      textContent: 'Login',
      disabled: !loginForm.canSubmit
    }
  },
  '#submitBtn'
);

// Form submission
Elements.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!loginForm.canSubmit) return;
  
  loginForm.submitting = true;
  loginForm.error = null;
  
  try {
    await loginUser(loginForm.email, loginForm.password);
    loginForm.success = true;
    // Redirect or show success message
  } catch (err) {
    loginForm.error = err.message;
  } finally {
    loginForm.submitting = false;
  }
});
```

**This pattern handles:**
- ✅ Two-way data binding
- ✅ Validation with computed properties
- ✅ Touch-based error display
- ✅ Submit button state management
- ✅ Loading states
- ✅ Error handling

---

## Pattern 3: Collections & Lists

Working with arrays of data is fundamental. Here's how to do it reactively.

### Rendering Lists from Arrays

#### Basic List Rendering

```javascript
const todos = state({
  items: [
    { id: 1, text: 'Buy groceries', done: false },
    { id: 2, text: 'Walk the dog', done: true },
    { id: 3, text: 'Write code', done: false }
  ]
});

// Update list display
effect(() => {
  const html = todos.items
    .map(item => `
      <li class="todo-item ${item.done ? 'done' : ''}" data-id="${item.id}">
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span>${item.text}</span>
        <button class="delete-btn">Delete</button>
      </li>
    `)
    .join('');
  
  Elements.todoList.innerHTML = html;
});
```

**Note:** This recreates the entire list on every change. For small lists, this is fine. For large lists, see the performance section.

---

### Array Distribution to Collections

When you have existing elements and want to update them with array data.

#### HTML Structure

```html
<div class="stat-card" id="stat1">
  <h3 class="stat-title"></h3>
  <div class="stat-value"></div>
</div>
<div class="stat-card" id="stat2">
  <h3 class="stat-title"></h3>
  <div class="stat-value"></div>
</div>
<div class="stat-card" id="stat3">
  <h3 class="stat-title"></h3>
  <div class="stat-value"></div>
</div>
```

#### Array Distribution

```javascript
const stats = state({
  data: [
    { title: 'Users', value: 1234 },
    { title: 'Revenue', value: '$56,789' },
    { title: 'Orders', value: 432 }
  ]
});

effect(() => {
  // Arrays automatically distribute across collections!
  ClassName['stat-title'].update({
    textContent: stats.data.map(s => s.title)
  });
  
  ClassName['stat-value'].update({
    textContent: stats.data.map(s => s.value)
  });
});
```

**What happened:**
- ✅ `stats.data.map(s => s.title)` creates `['Users', 'Revenue', 'Orders']`
- ✅ Array automatically distributes: element[0] gets 'Users', element[1] gets 'Revenue', etc.
- ✅ No manual loops needed!

---

#### Multiple Properties with Array Distribution

```javascript
const products = state({
  items: [
    { name: 'Laptop', price: '$999', stock: 5 },
    { name: 'Mouse', price: '$29', stock: 0 },
    { name: 'Keyboard', price: '$79', stock: 12 }
  ]
});

effect(() => {
  ClassName['product-card'].update({
    // Multiple properties, all use array distribution
    textContent: products.items.map(p => p.name),
    style: {
      opacity: products.items.map(p => p.stock > 0 ? '1' : '0.5')
    },
    classList: {
      add: products.items.map(p => p.stock > 0 ? 'in-stock' : 'out-of-stock')
    }
  });
});
```

---

### Dynamic List Updates (Add/Remove Items)

#### Adding Items

```javascript
const todos = state({
  items: [],
  nextId: 1
});

// Add new item
function addTodo(text) {
  todos.items.push({
    id: todos.nextId++,
    text: text,
    done: false
  });
}

// Usage
Elements.addBtn.addEventListener('click', () => {
  const text = Elements.newTodoInput.value.trim();
  if (text) {
    addTodo(text);
    Elements.newTodoInput.value = '';
  }
});

// List updates automatically via effect
effect(() => {
  Elements.todoList.innerHTML = todos.items
    .map(item => `<li data-id="${item.id}">${item.text}</li>`)
    .join('');
});
```

---

#### Removing Items

```javascript
function removeTodo(id) {
  const index = todos.items.findIndex(item => item.id === id);
  if (index !== -1) {
    todos.items.splice(index, 1);
  }
}

// Handle delete clicks (event delegation)
Elements.todoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const li = e.target.closest('li');
    const id = parseInt(li.dataset.id);
    removeTodo(id);
  }
});
```

---

#### Updating Items

```javascript
function toggleTodo(id) {
  const todo = todos.items.find(item => item.id === id);
  if (todo) {
    todo.done = !todo.done;
  }
}

// Handle checkbox clicks
Elements.todoList.addEventListener('click', (e) => {
  if (e.target.type === 'checkbox') {
    const li = e.target.closest('li');
    const id = parseInt(li.dataset.id);
    toggleTodo(id);
  }
});
```

---

#### Complete CRUD List Example

```javascript
const todoApp = state({
  items: [],
  nextId: 1,
  filter: 'all' // 'all' | 'active' | 'completed'
});

// Computed: Filtered items
computed(todoApp, {
  visibleItems: function() {
    if (this.filter === 'active') {
      return this.items.filter(item => !item.done);
    }
    if (this.filter === 'completed') {
      return this.items.filter(item => item.done);
    }
    return this.items;
  },
  
  activeCount: function() {
    return this.items.filter(item => !item.done).length;
  }
});

// Render list
effect(() => {
  Elements.todoList.innerHTML = todoApp.visibleItems
    .map(item => `
      <li class="todo-item ${item.done ? 'done' : ''}" data-id="${item.id}">
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span class="todo-text">${item.text}</span>
        <button class="delete-btn">×</button>
      </li>
    `)
    .join('');
});

// Update counters
effect(() => {
  Elements.textContent({
    activeCount: todoApp.activeCount,
    totalCount: todoApp.items.length
  });
});

// Add todo
Elements.addTodoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = Elements.newTodoInput.value.trim();
  
  if (text) {
    todoApp.items.push({
      id: todoApp.nextId++,
      text: text,
      done: false
    });
    
    Elements.newTodoInput.value = '';
  }
});

// Toggle done
Elements.todoList.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') {
    const li = e.target.closest('li');
    const id = parseInt(li.dataset.id);
    const todo = todoApp.items.find(item => item.id === id);
    
    if (todo) {
      todo.done = e.target.checked;
    }
  }
});

// Delete todo
Elements.todoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const li = e.target.closest('li');
    const id = parseInt(li.dataset.id);
    const index = todoApp.items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      todoApp.items.splice(index, 1);
    }
  }
});

// Filter controls
ClassName['filter-btn'].forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const filters = ['all', 'active', 'completed'];
    todoApp.filter = filters[index];
  });
});
```

---

## Pattern 4: Conditional Rendering

Show, hide, and change UI based on state.

### Show/Hide Based on Boolean State

#### Basic Visibility Toggle

```javascript
const ui = state({
  menuOpen: false
});

// Toggle visibility
whenState(
  () => ui.menuOpen,
  {
    true: { style: { display: 'block' } },
    false: { style: { display: 'none' } }
  },
  '#mobileMenu'
);

// Toggle button
Elements.menuToggle.addEventListener('click', () => {
  ui.menuOpen = !ui.menuOpen;
});
```

---

#### Multiple Elements Based on One State

```javascript
const auth = state({
  isLoggedIn: false
});

// Show login button when logged out
whenState(
  () => auth.isLoggedIn,
  {
    true: { style: { display: 'none' } },
    false: { style: { display: 'block' } }
  },
  '#loginBtn'
);

// Show logout button when logged in
whenState(
  () => auth.isLoggedIn,
  {
    true: { style: { display: 'block' } },
    false: { style: { display: 'none' } }
  },
  '#logoutBtn'
);

// Show user menu when logged in
whenState(
  () => auth.isLoggedIn,
  {
    true: { style: { display: 'flex' } },
    false: { style: { display: 'none' } }
  },
  '#userMenu'
);
```

---

### Multiple State Branches

When you have more than two states.

#### Loading/Success/Error Pattern

```javascript
const request = state({
  status: 'idle' // 'idle' | 'loading' | 'success' | 'error'
});

whenState(
  () => request.status,
  {
    idle: { 
      textContent: 'Submit',
      disabled: false,
      classList: { remove: ['loading', 'success', 'error'] }
    },
    loading: { 
      textContent: 'Loading...',
      disabled: true,
      classList: { add: 'loading', remove: ['success', 'error'] }
    },
    success: { 
      textContent: 'Success!',
      disabled: false,
      classList: { add: 'success', remove: ['loading', 'error'] }
    },
    error: { 
      textContent: 'Try Again',
      disabled: false,
      classList: { add: 'error', remove: ['loading', 'success'] }
    }
  },
  '#submitBtn'
);
```

---

#### Status-Based UI Sections

```javascript
const app = state({
  view: 'loading' // 'loading' | 'empty' | 'data' | 'error'
});

// Show loading spinner
whenState(
  () => app.view,
  {
    loading: { style: { display: 'flex' } },
    default: { style: { display: 'none' } }
  },
  '#loadingSpinner'
);

// Show empty state
whenState(
  () => app.view,
  {
    empty: { style: { display: 'block' } },
    default: { style: { display: 'none' } }
  },
  '#emptyState'
);

// Show data view
whenState(
  () => app.view,
  {
    data: { style: { display: 'block' } },
    default: { style: { display: 'none' } }
  },
  '#dataView'
);

// Show error message
whenState(
  () => app.view,
  {
    error: { style: { display: 'block' } },
    default: { style: { display: 'none' } }
  },
  '#errorView'
);
```

---

### Default Fallbacks

Use `default` for all other cases.

```javascript
const user = state({
  role: 'guest' // 'admin' | 'editor' | 'viewer' | 'guest' | anything else
});

whenState(
  () => user.role,
  {
    admin: { 
      textContent: 'Full Access',
      classList: { add: 'badge-admin' }
    },
    editor: { 
      textContent: 'Edit Access',
      classList: { add: 'badge-editor' }
    },
    viewer: { 
      textContent: 'View Only',
      classList: { add: 'badge-viewer' }
    },
    default: { 
      textContent: 'No Access',
      classList: { add: 'badge-guest' }
    }
  },
  '#roleBadge'
);
```

**The `default` branch catches any value not explicitly defined.**

---

### Complex Conditional Logic

#### Combining Multiple State Values

```javascript
const cart = state({
  items: [],
  couponValid: false
});

computed(cart, {
  isEmpty: function() {
    return this.items.length === 0;
  },
  
  showCheckout: function() {
    return !this.isEmpty;
  },
  
  showDiscount: function() {
    return this.couponValid && !this.isEmpty;
  }
});

// Show checkout button
whenState(
  () => cart.showCheckout,
  {
    true: { style: { display: 'block' } },
    false: { style: { display: 'none' } }
  },
  '#checkoutBtn'
);

// Show discount badge
whenState(
  () => cart.showDiscount,
  {
    true: { 
      style: { display: 'inline-block' },
      textContent: 'Discount Applied!'
    },
    false: { style: { display: 'none' } }
  },
  '#discountBadge'
);

// Show empty state
whenState(
  () => cart.isEmpty,
  {
    true: { style: { display: 'block' } },
    false: { style: { display: 'none' } }
  },
  '#emptyCart'
);
```

**Key technique:** Use computed properties to combine multiple state values into clear boolean flags.

---

## Pattern 5: Computed Values

Derived state that updates automatically.

### Basic Derived State

```javascript
const order = state({
  subtotal: 0,
  taxRate: 0.1
});

computed(order, {
  tax: function() {
    return this.subtotal * this.taxRate;
  },
  
  total: function() {
    return this.subtotal + this.tax;
  }
});

// Display computed values
effect(() => {
  Elements.textContent({
    subtotal: `$${order.subtotal.toFixed(2)}`,
    tax: `$${order.tax.toFixed(2)}`,
    total: `$${order.total.toFixed(2)}`
  });
});

// Change subtotal → tax and total auto-update
order.subtotal = 100; // tax becomes 10, total becomes 110
```

---

### Chaining Computed Properties

Computed can depend on other computed properties.

```javascript
const cart = state({
  items: [
    { price: 29.99, quantity: 2 },
    { price: 49.99, quantity: 1 }
  ],
  shippingMethod: 'standard', // 'standard' | 'express'
  couponCode: ''
});

computed(cart, {
  // Level 1: Basic calculations
  subtotal: function() {
    return this.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  },
  
  // Level 2: Depends on Level 1
  shipping: function() {
    if (this.subtotal > 50) return 0; // Free shipping
    return this.shippingMethod === 'express' ? 15 : 5;
  },
  
  discount: function() {
    if (this.couponCode === 'SAVE10') {
      return this.subtotal * 0.1;
    }
    return 0;
  },
  
  // Level 3: Depends on Level 2
  total: function() {
    return this.subtotal + this.shipping - this.discount;
  },
  
  // Another Level 2
  savings: function() {
    return this.discount + (this.subtotal > 50 ? this.shipping : 0);
  }
});

// Display all computed values
effect(() => {
  Elements.textContent({
    subtotal: `$${cart.subtotal.toFixed(2)}`,
    shipping: cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}`,
    discount: `$${cart.discount.toFixed(2)}`,
    total: `$${cart.total.toFixed(2)}`,
    savings: `$${cart.savings.toFixed(2)}`
  });
});
```

**What's powerful here:**
- ✅ Computed properties depend on each other
- ✅ Change one value, all dependencies update automatically
- ✅ No manual recalculation needed
- ✅ Business logic centralized in computed properties

---

### Performance Considerations

#### Good: Computed Properties Cache

```javascript
const app = state({
  users: [...] // Large array
});

computed(app, {
  // This only recalculates when `users` changes
  activeUsers: function() {
    return this.users.filter(u => u.active);
  }
});

// Called multiple times, but activeUsers only computes once per change
effect(() => {
  Elements.count.textContent = app.activeUsers.length;
  Elements.list.innerHTML = app.activeUsers.map(/*...*/).join('');
  console.log('Active:', app.activeUsers.length);
});
```

**Computed properties are cached.** They only recalculate when their dependencies change.

---

#### Bad: Calculating in Effects

**❌ Don't do this:**
```javascript
// Recalculates on EVERY render, even if users didn't change
effect(() => {
  const activeUsers = app.users.filter(u => u.active);
  Elements.count.textContent = activeUsers.length;
});

effect(() => {
  const activeUsers = app.users.filter(u => u.active); // Duplicate calculation!
  Elements.list.innerHTML = activeUsers.map(/*...*/).join('');
});
```

**✅ Do this instead:**
```javascript
// Calculate once in computed
computed(app, {
  activeUsers: function() {
    return this.users.filter(u => u.active);
  }
});

// Use in effects
effect(() => {
  Elements.count.textContent = app.activeUsers.length;
});

effect(() => {
  Elements.list.innerHTML = app.activeUsers.map(/*...*/).join('');
});
```

---

#### When to Use Computed vs Effects

| Use Computed When | Use Effect When |
|-------------------|-----------------|
| Deriving data from state | Updating the DOM |
| Calculations needed in multiple places | Calling APIs or side effects |
| Value depends on other state | Logging or analytics |
| Filtering/sorting/transforming data | Imperatively updating external systems |

**Rule:** If it's a **value derived from state**, use computed. If it's a **side effect**, use effect.

---

## Summary: The Essential Patterns

You've learned the **5 core patterns** that cover 90% of use cases:

### 1. **State → DOM Updates**
- Single element updates with `effect()`
- Bulk property updaters for multiple elements
- When to use `effect()` vs `whenState()`

### 2. **Form Input Binding**
- Two-way sync between state and inputs
- Validation with computed properties
- Touch-based error display
- Complete form state management

### 3. **Collections & Lists**
- Array distribution to existing elements
- Dynamic CRUD operations
- Event delegation for list interactions

### 4. **Conditional Rendering**
- Show/hide with `whenState()`
- Multiple state branches
- Default fallbacks for edge cases

### 5. **Computed Values**
- Derived state that auto-updates
- Chaining computed properties
- Performance through caching

---

## Quick Reference: Pattern Cheat Sheet

```javascript
// State → DOM (single element)
effect(() => {
  Elements.title.textContent = state.title;
});

// State → DOM (bulk property updater)
effect(() => {
  Elements.textContent({
    firstName: user.firstName,
    lastName: user.lastName
  });
});

// Form binding (input → state)
Elements.emailInput.addEventListener('input', (e) => {
  form.email = e.target.value;
});

// Validation (computed)
computed(form, {
  isValid: function() {
    return this.email.length > 0;
  }
});

// Conditional rendering
whenState(
  () => state.status,
  {
    loading: { textContent: 'Loading...' },
    success: { textContent: 'Done!' },
    default: { textContent: 'Ready' }
  },
  '#display'
);

// Array distribution
ClassName.card.update({
  textContent: items.map(item => item.name)
});

// Computed values
computed(cart, {
  total: function() {
    return this.subtotal + this.tax;
  }
});
```

---

## What's Next?

Now that you've mastered the **essential patterns**, you're ready to build real applications.

In the next section, you'll see these patterns in action with **complete, working examples**:

✅ **Todo App** - CRUD operations and filtering  
✅ **Login Form** - Validation and async submission  
✅ **Shopping Cart** - Computed totals and item management  
✅ **Dashboard** - Multiple components working together  

**Let's build something real! →**