# Declarative DOM Bindings - Connect State to UI

## Quick Start (30 seconds)

```javascript
const user = state({ name: 'John', email: 'john@example.com' });

// Bind state to DOM elements using effect
effect(() => {
  Elements.textContent({
    userName: user.name,
    userEmail: user.email
  });
});

// Change state — UI updates automatically!
user.name = 'Jane';
// userName element now shows "Jane" ✨
```

**That's it.** Use `effect()` with DOM Helpers to create declarative bindings between your state and the UI.

 

## What are DOM Bindings?

**DOM Bindings** connect your reactive state to DOM elements. When state changes, the DOM automatically updates — no manual `querySelector` or `innerHTML` manipulation needed.

Think of it as **wiring up your UI**. You declare what should happen, and the reactive system handles when it happens.

**In practical terms:** Instead of writing event handlers that manually update the DOM, you describe the relationship between state and UI, and the library keeps them in sync.

 

## The Three DOM Helpers

Before diving into bindings, let's understand the three namespaces for accessing DOM elements:

### 1. `Elements` - Access by ID

```javascript
// HTML: <div id="message">Hello</div>
Elements.message.textContent = 'Hi';

// Bulk updates
Elements.textContent({
  message: 'Hello',
  title: 'Welcome'
});
```

### 2. `Collections` - Access by Class

```javascript
// HTML: <div class="card">...</div> (multiple elements)
Collections.card.forEach(el => el.style.display = 'block');

// Bulk updates
Collections.style({
  card: { display: 'block' },
  button: { opacity: '1' }
});
```

### 3. `Selector` - Access by CSS Selector

```javascript
// Any CSS selector
Selector('[data-active="true"]').style.color = 'green';

// Bulk updates
Selector.textContent({
  '.header-title': 'My App',
  '#footer-text': '© 2024'
});
```

 

## Syntax

### Basic Binding Pattern

```javascript
// Create reactive state
const myState = state({ property: value });

// Bind to DOM with effect
effect(() => {
  Elements.elementId.property = myState.property;
});
```

### Bulk Update Pattern

```javascript
effect(() => {
  Elements.textContent({
    element1: myState.prop1,
    element2: myState.prop2
  });
});
```

### Conditional Binding Pattern

```javascript
effect(() => {
  Elements.style({
    element: {
      display: myState.isVisible ? 'block' : 'none'
    }
  });
});
```

 

## Why Does This Exist?

### The Problem Without Declarative Bindings

```javascript
// ❌ Manual DOM updates - scattered and error-prone
let userName = 'John';
let userEmail = 'john@example.com';
let isLoggedIn = false;

// Update functions scattered everywhere
function updateUserDisplay() {
  document.getElementById('userName').textContent = userName;
  document.getElementById('userEmail').textContent = userEmail;
}

function updateLoginStatus() {
  document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('userPanel').style.display = isLoggedIn ? 'block' : 'none';
}

// Must remember to call these manually
function login() {
  isLoggedIn = true;
  userName = 'Jane';
  userEmail = 'jane@example.com';

  updateUserDisplay();    // Easy to forget!
  updateLoginStatus();    // Must call manually!
}
```

**Problems:**
- ❌ Manual DOM queries everywhere
- ❌ Must remember to call update functions
- ❌ Easy to forget updates
- ❌ Code scattered across many functions
- ❌ Hard to track what updates what

### The Solution with Declarative Bindings

```javascript
// ✅ Declarative bindings - automatic and centralized
const auth = state({
  userName: 'John',
  userEmail: 'john@example.com',
  isLoggedIn: false
});

// Declare the bindings ONCE
effect(() => {
  Elements.textContent({
    userName: auth.userName,
    userEmail: auth.userEmail
  });
});

effect(() => {
  Elements.style({
    loginBtn: { display: auth.isLoggedIn ? 'none' : 'block' },
    logoutBtn: { display: auth.isLoggedIn ? 'block' : 'none' },
    userPanel: { display: auth.isLoggedIn ? 'block' : 'none' }
  });
});

// Just change state — UI updates automatically!
function login() {
  auth.isLoggedIn = true;
  auth.userName = 'Jane';
  auth.userEmail = 'jane@example.com';
  // No manual DOM updates needed! ✨
}
```

**Benefits:**
- ✅ Automatic DOM updates
- ✅ Centralized binding declarations
- ✅ No manual update calls
- ✅ Clear state-to-UI mapping
- ✅ Less code, fewer bugs

 

## Mental Model: The Spreadsheet

Think of declarative bindings like **a spreadsheet with formulas**:

**Without Bindings (Calculator):**
```
┌─────────────────────────────────────┐
│  Cell A1: 10                        │
│  Cell B1: 20                        │
│  Cell C1: ?                         │
│                                     │
│  To get sum, you must:              │
│  1. Read A1                         │
│  2. Read B1                         │
│  3. Calculate A1 + B1               │
│  4. Write to C1                     │
│  5. Remember to redo when A1/B1     │
│     changes!                        │
└─────────────────────────────────────┘
```

**With Bindings (Spreadsheet Formula):**
```
┌─────────────────────────────────────┐
│  Cell A1: 10                        │
│  Cell B1: 20                        │
│  Cell C1: =A1+B1  → 30             │
│                                     │
│  Change A1 to 15?                   │
│  C1 automatically becomes 35! ✨    │
│                                     │
│  The formula IS the binding!        │
└─────────────────────────────────────┘
```

Your `effect()` is like a spreadsheet formula — it declares the relationship, and updates happen automatically.

 

## How Does It Work?

```
State Change
     ↓
Reactive System Detects Change
     ↓
Finds Effects That Depend On This State
     ↓
Runs Those Effects
     ↓
Effects Update DOM Elements
     ↓
UI Reflects New State
```

**Under the hood:**

```javascript
const counter = state({ value: 0 });

effect(() => {
  // This effect is "subscribed" to counter.value
  Elements.count.textContent = counter.value;
});

// When this happens:
counter.value = 5;

// The reactive system:
// 1. Detects counter.value changed
// 2. Finds the effect that reads counter.value
// 3. Re-runs the effect
// 4. Effect updates Elements.count.textContent to "5"
```

 

## Basic Usage

### Example 1: Text Content Binding

```javascript
const profile = state({
  name: 'Alice',
  title: 'Developer',
  bio: 'I build things.'
});

// Bind text content
effect(() => {
  Elements.textContent({
    profileName: profile.name,
    profileTitle: profile.title,
    profileBio: profile.bio
  });
});

// Update any property — UI updates automatically
profile.name = 'Bob';
profile.title = 'Designer';
```

 

### Example 2: Style Bindings

```javascript
const theme = state({
  primaryColor: '#3498db',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontSize: 16
});

effect(() => {
  Selector.style({
    ':root': {
      '--primary-color': theme.primaryColor,
      '--bg-color': theme.backgroundColor,
      '--text-color': theme.textColor,
      '--font-size': `${theme.fontSize}px`
    }
  });
});

// Change theme
theme.primaryColor = '#e74c3c';
theme.backgroundColor = '#1a1a2e';
// CSS variables update automatically!
```

 

### Example 3: Class Bindings

```javascript
const ui = state({
  isDarkMode: false,
  isMenuOpen: false,
  isLoading: false
});

effect(() => {
  // Add/remove classes based on state
  const body = document.body;
  body.classList.toggle('dark-mode', ui.isDarkMode);
  body.classList.toggle('menu-open', ui.isMenuOpen);
  body.classList.toggle('loading', ui.isLoading);
});

// Toggle dark mode
ui.isDarkMode = true;
// body now has 'dark-mode' class
```

 

### Example 4: Visibility Bindings

```javascript
const modal = state({
  isOpen: false,
  title: 'Confirm',
  message: 'Are you sure?'
});

effect(() => {
  Elements.style({
    modalOverlay: {
      display: modal.isOpen ? 'flex' : 'none'
    }
  });

  Elements.textContent({
    modalTitle: modal.title,
    modalMessage: modal.message
  });
});

// Show modal
modal.isOpen = true;
modal.title = 'Warning';
modal.message = 'This action cannot be undone.';
```

 

### Example 5: Attribute Bindings

```javascript
const form = state({
  isSubmitting: false,
  isValid: false
});

effect(() => {
  // Disable submit button when submitting or invalid
  Elements.submitBtn.disabled = form.isSubmitting || !form.isValid;

  // Update button text
  Elements.submitBtn.textContent = form.isSubmitting ? 'Submitting...' : 'Submit';
});

// Start submission
form.isSubmitting = true;
// Button is now disabled with "Submitting..." text
```

 

## Real-World Examples

### Example 1: Shopping Cart Display

```javascript
const cart = state({
  items: [],
  total: 0,
  itemCount: 0
});

// Bind cart display
effect(() => {
  Elements.textContent({
    cartCount: cart.itemCount,
    cartTotal: `$${cart.total.toFixed(2)}`
  });

  // Show/hide empty cart message
  Elements.style({
    emptyCartMessage: { display: cart.itemCount === 0 ? 'block' : 'none' },
    cartItems: { display: cart.itemCount > 0 ? 'block' : 'none' }
  });
});

// Render cart items
effect(() => {
  Elements.cartItemsList.innerHTML = cart.items
    .map(item => `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>$${item.price.toFixed(2)} x ${item.qty}</span>
      </div>
    `)
    .join('');
});

// Add item to cart
function addToCart(product) {
  cart.items.push({ ...product, qty: 1 });
  cart.itemCount++;
  cart.total += product.price;
  // All UI updates happen automatically!
}
```

 

### Example 2: Form Validation Display

```javascript
const loginForm = state({
  email: '',
  password: '',
  errors: {},
  isSubmitting: false
});

// Computed validation
computed(loginForm, {
  isValid: function() {
    return this.email.includes('@') && this.password.length >= 8;
  }
});

// Bind validation messages
effect(() => {
  Elements.textContent({
    emailError: loginForm.errors.email || '',
    passwordError: loginForm.errors.password || ''
  });

  Elements.style({
    emailError: { display: loginForm.errors.email ? 'block' : 'none' },
    passwordError: { display: loginForm.errors.password ? 'block' : 'none' }
  });
});

// Bind form state
effect(() => {
  Elements.submitBtn.disabled = !loginForm.isValid || loginForm.isSubmitting;
  Elements.submitBtn.textContent = loginForm.isSubmitting ? 'Logging in...' : 'Login';
});

// Validate email on input
Elements.emailInput.addEventListener('input', (e) => {
  loginForm.email = e.target.value;
  loginForm.errors.email = e.target.value.includes('@') ? '' : 'Invalid email';
});
```

 

### Example 3: Real-Time Search Results

```javascript
const search = state({
  query: '',
  results: [],
  isSearching: false,
  noResults: false
});

// Bind search UI
effect(() => {
  Elements.style({
    searchSpinner: { display: search.isSearching ? 'block' : 'none' },
    searchResults: { display: !search.isSearching && search.results.length > 0 ? 'block' : 'none' },
    noResultsMessage: { display: search.noResults ? 'block' : 'none' }
  });
});

// Bind results list
effect(() => {
  if (search.results.length > 0) {
    Elements.searchResults.innerHTML = search.results
      .map(result => `<li class="search-result">${result.title}</li>`)
      .join('');
  }
});

// Debounced search
let searchTimeout;
Elements.searchInput.addEventListener('input', (e) => {
  search.query = e.target.value;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (search.query.length < 2) return;

    search.isSearching = true;
    const results = await fetchSearchResults(search.query);
    search.results = results;
    search.isSearching = false;
    search.noResults = results.length === 0;
  }, 300);
});
```

 

### Example 4: Tab Navigation

```javascript
const tabs = state({
  activeTab: 'home',
  tabs: ['home', 'products', 'about', 'contact']
});

// Bind tab active states
effect(() => {
  tabs.tabs.forEach(tab => {
    const tabBtn = Elements[`${tab}Tab`];
    const tabContent = Elements[`${tab}Content`];

    if (tabBtn) {
      tabBtn.classList.toggle('active', tabs.activeTab === tab);
    }
    if (tabContent) {
      tabContent.style.display = tabs.activeTab === tab ? 'block' : 'none';
    }
  });
});

// Switch tab
function switchTab(tabName) {
  tabs.activeTab = tabName;
  // All tab buttons and content update automatically!
}
```

 

### Example 5: Data Table with Sorting

```javascript
const table = state({
  data: [],
  sortColumn: 'name',
  sortDirection: 'asc',
  currentPage: 1,
  pageSize: 10
});

// Computed sorted data
computed(table, {
  sortedData: function() {
    return [...this.data].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];
      const direction = this.sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }
      return (aVal - bVal) * direction;
    });
  },
  paginatedData: function() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedData.slice(start, start + this.pageSize);
  },
  totalPages: function() {
    return Math.ceil(this.data.length / this.pageSize);
  }
});

// Bind table content
effect(() => {
  Elements.tableBody.innerHTML = table.paginatedData
    .map(row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.email}</td>
        <td>${row.status}</td>
      </tr>
    `)
    .join('');
});

// Bind pagination
effect(() => {
  Elements.textContent({
    pageInfo: `Page ${table.currentPage} of ${table.totalPages}`,
    resultCount: `${table.data.length} results`
  });

  Elements.prevBtn.disabled = table.currentPage === 1;
  Elements.nextBtn.disabled = table.currentPage === table.totalPages;
});

// Sort by column
function sortBy(column) {
  if (table.sortColumn === column) {
    table.sortDirection = table.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    table.sortColumn = column;
    table.sortDirection = 'asc';
  }
  // Table re-renders automatically!
}
```

 

## Common Patterns

### Pattern 1: Conditional Classes

```javascript
const ui = state({ status: 'idle' });

effect(() => {
  const element = Elements.statusIndicator;

  // Remove all status classes
  element.classList.remove('status-idle', 'status-loading', 'status-success', 'status-error');

  // Add current status class
  element.classList.add(`status-${ui.status}`);
});
```

 

### Pattern 2: Dynamic Content Rendering

```javascript
const notifications = state({ items: [] });

effect(() => {
  Elements.notificationList.innerHTML = notifications.items
    .map(notification => `
      <div class="notification notification-${notification.type}">
        <span class="notification-icon">${getIcon(notification.type)}</span>
        <span class="notification-message">${notification.message}</span>
        <button onclick="dismissNotification('${notification.id}')">×</button>
      </div>
    `)
    .join('');
});

function addNotification(type, message) {
  notifications.items.push({
    id: Date.now(),
    type,
    message
  });
}

function dismissNotification(id) {
  notifications.items = notifications.items.filter(n => n.id !== id);
}
```

 

### Pattern 3: Two-Way Bindings

```javascript
const form = state({ username: '', email: '' });

// Bind state to inputs
effect(() => {
  Elements.usernameInput.value = form.username;
  Elements.emailInput.value = form.email;
});

// Bind inputs to state
Elements.usernameInput.addEventListener('input', (e) => {
  form.username = e.target.value;
});

Elements.emailInput.addEventListener('input', (e) => {
  form.email = e.target.value;
});
```

 

### Pattern 4: Bulk Event Binding

```javascript
const counter = state({ value: 0 });

// Bind display
effect(() => {
  Elements.count.textContent = counter.value;
});

// Bind events using bulk updates
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => counter.value++]
  },
  decrementBtn: {
    addEventListener: ['click', () => counter.value--]
  },
  resetBtn: {
    addEventListener: ['click', () => counter.value = 0]
  }
});
```

 

### Pattern 5: Animation State Binding

```javascript
const animation = state({
  isPlaying: false,
  progress: 0
});

effect(() => {
  Elements.progressBar.style.width = `${animation.progress}%`;
  Elements.playBtn.textContent = animation.isPlaying ? 'Pause' : 'Play';
});

function toggleAnimation() {
  animation.isPlaying = !animation.isPlaying;

  if (animation.isPlaying) {
    const interval = setInterval(() => {
      animation.progress += 1;
      if (animation.progress >= 100 || !animation.isPlaying) {
        clearInterval(interval);
        animation.isPlaying = false;
      }
    }, 50);
  }
}
```

 

## Tips and Best Practices

### 1. Group Related Bindings

```javascript
// ✅ Good - related bindings together
effect(() => {
  Elements.textContent({
    userName: user.name,
    userEmail: user.email,
    userRole: user.role
  });
});

// ❌ Avoid - separate effects for related data
effect(() => { Elements.userName.textContent = user.name; });
effect(() => { Elements.userEmail.textContent = user.email; });
effect(() => { Elements.userRole.textContent = user.role; });
```

 

### 2. Use Batch for Multiple Updates

```javascript
// ✅ Good - batch multiple state changes
function updateProfile(data) {
  batch(() => {
    user.name = data.name;
    user.email = data.email;
    user.role = data.role;
  });
  // Effects run once, not three times
}
```

 

### 3. Keep Effects Focused

```javascript
// ✅ Good - separate concerns
effect(() => {
  // Only handles visibility
  Elements.style({
    userPanel: { display: auth.isLoggedIn ? 'block' : 'none' }
  });
});

effect(() => {
  // Only handles content
  Elements.textContent({
    userName: auth.userName
  });
});
```

 

### 4. Avoid Heavy Computation in Effects

```javascript
// ❌ Avoid - heavy computation in effect
effect(() => {
  const sorted = data.items.sort((a, b) => a.name.localeCompare(b.name));
  Elements.list.innerHTML = sorted.map(/* ... */).join('');
});

// ✅ Good - use computed for heavy work
computed(data, {
  sortedItems: function() {
    return [...this.items].sort((a, b) => a.name.localeCompare(b.name));
  }
});

effect(() => {
  Elements.list.innerHTML = data.sortedItems.map(/* ... */).join('');
});
```

 

## Summary

**What are DOM Bindings?**
Declarative connections between reactive state and DOM elements that update automatically.

**The Three Namespaces:**
- `Elements` - Access by ID
- `Collections` - Access by class
- `Selector` - Access by CSS selector

**Key Pattern:**
```javascript
const myState = state({ value: 'Hello' });

effect(() => {
  Elements.elementId.textContent = myState.value;
});

// Change state — UI updates automatically!
myState.value = 'World';
```

**Benefits:**
- ✅ Automatic DOM updates
- ✅ Centralized binding declarations
- ✅ No manual querySelector calls
- ✅ Clear state-to-UI mapping
- ✅ Less code, fewer bugs

**Key Takeaway:**
Declare how state maps to UI once with `effect()` — the reactive system handles all the updates automatically. Think of it as writing spreadsheet formulas for your UI.
