# `effect()` - Reactive Side Effects

## Quick Start (30 seconds)

```javascript
const counter = state({ count: 0 });

// Create an effect - it runs automatically when state changes
effect(() => {
  Elements.counterDisplay.textContent = counter.count;
});

counter.count = 5; // ✨ DOM updates automatically!
```

**That's it.** The effect runs once immediately, then re-runs automatically whenever `counter.count` changes. No manual updates needed.

 

## What is `effect()`?

`effect()` is **the bridge between reactive state and the outside world**. It creates a function that automatically re-runs whenever any reactive value it reads changes.

Think of it as **setting up an automatic response system**. You define what should happen, and the system ensures it happens every time the relevant data changes.

**In practical terms:** Effects are how you make things happen when state changes — updating the DOM, logging, making API calls, or any other side effect.

 

## Syntax

```javascript
// Basic effect
effect(() => {
  // Your code here - runs when dependencies change
});

// Effect with cleanup
const stopEffect = effect(() => {
  // Your reactive code
});

// Later: stop the effect
stopEffect();
```

**Parameters:**
- `fn` - A function that reads reactive values and performs side effects

**Returns:**
- A cleanup function that stops the effect when called

 

## Why Does This Exist?

### The Problem Without effect()

Let's say you want to update the DOM when state changes:

```javascript
// ❌ The manual way (plain JavaScript)
let count = 0;

function updateDisplay() {
  document.getElementById('counter').textContent = count;
  document.getElementById('doubled').textContent = count * 2;

  if (count > 10) {
    document.getElementById('warning').style.display = 'block';
  } else {
    document.getElementById('warning').style.display = 'none';
  }
}

// Every time count changes, you must remember to call updateDisplay
count = 5;
updateDisplay(); // Must call manually!

count = 15;
updateDisplay(); // Must call manually again!

// What if you forget? The UI gets out of sync ❌
```

**What's the Real Issue?**

```
Change data
    ↓
Nothing happens automatically
    ↓
Must remember to call update function
    ↓
Easy to forget
    ↓
UI out of sync with data ❌
```

**Problems:**
❌ **Manual updates** - Must call update function every time
❌ **Easy to forget** - One missed call = broken UI
❌ **Scattered code** - Update calls everywhere data changes
❌ **Hard to maintain** - Adding new UI elements means updating all locations

### The Solution with `effect()`

```javascript
// ✅ The reactive way
const counter = state({ count: 0 });

// Set up effects once - they run automatically
effect(() => {
  Elements.counter.textContent = counter.count;
  Elements.doubled.textContent = counter.count * 2;
});

effect(() => {
  Elements.warning.style.display = counter.count > 10 ? 'block' : 'none';
});

// Just change the data - effects handle the rest
counter.count = 5;  // ✨ Both effects run automatically
counter.count = 15; // ✨ Both effects run automatically
```

**What Just Happened?**

```
Change counter.count
    ↓
System detects the change
    ↓
Finds all effects that read counter.count
    ↓
Re-runs those effects automatically
    ↓
UI always in sync ✅
```

**Benefits:**
✅ **Automatic updates** - Effects run when their dependencies change
✅ **Impossible to forget** - System handles it for you
✅ **Centralized logic** - Define once, runs everywhere
✅ **Easy to maintain** - Add new effects without touching existing code

 

## Mental Model: The Automatic Responder

Think of `effect()` like **setting up automatic responses in a smart home**:

**Without effect() (Manual Responses):**
```
┌─────────────────────────────────┐
│  Manual Home                    │
│                                 │
│  Temperature changes            │
│       ↓                         │
│  You notice eventually          │
│       ↓                         │
│  You manually adjust AC         │
│       ↓                         │
│  You manually close blinds      │
│       ↓                         │
│  Easy to forget something! ❌   │
└─────────────────────────────────┘
```

**With effect() (Automatic Responses):**
```
┌─────────────────────────────────┐
│  Smart Home with Effects        │
│                                 │
│  effect(() => {                 │
│    if (temp > 75) turnOnAC();   │
│  });                            │
│                                 │
│  effect(() => {                 │
│    if (temp > 80) closeBlinds();│
│  });                            │
│                                 │
│  Temperature changes            │
│       ↓                         │
│  ✨ AC adjusts automatically    │
│  ✨ Blinds close automatically  │
│                                 │
│  Nothing to remember! ✅        │
└─────────────────────────────────┘
```

**Key Insight:** Effects are like sensors + automated responses. They watch for changes and react automatically.

 

## How Does It Work?

Under the hood, `effect()` uses dependency tracking:

```
effect(() => console.log(counter.count))
                    ↓
┌─────────────────────────────────────────────────────┐
│ 1. Effect runs immediately                          │
│    → Reads counter.count                            │
│    → System tracks: "This effect depends on count"  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. Later: counter.count = 5                         │
│    → System: "count changed!"                       │
│    → System: "Which effects depend on count?"       │
│    → System: "Found one! Re-run it."                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. Effect runs again                                │
│    → console.log(5)                                 │
│    → Dependencies re-tracked (might be different!)  │
└─────────────────────────────────────────────────────┘
```

**Step-by-step:**

1️⃣ **You create an effect:**
```javascript
effect(() => {
  console.log(counter.count);
});
```

2️⃣ **Effect runs immediately:**
```javascript
// The function executes right away
// Console logs: 0
```

3️⃣ **During execution, dependencies are tracked:**
```javascript
// System notes: "This effect read counter.count"
// Adds effect to counter.count's dependency list
```

4️⃣ **When you change the tracked value:**
```javascript
counter.count = 5;
// System checks: "Who depends on count?"
// Finds the effect, schedules it to re-run
```

5️⃣ **Effect re-runs:**
```javascript
// Console logs: 5
// Dependencies re-tracked for next time
```

 

## Basic Usage

### Example 1: Simple DOM Update

```javascript
const user = state({ name: 'Alice' });

effect(() => {
  Elements.userName.textContent = user.name;
});

user.name = 'Bob'; // ✨ DOM updates to "Bob"
```

**What's happening?**
- Effect runs once, sets textContent to "Alice"
- When `user.name` changes, effect re-runs
- DOM always shows current name

 

### Example 2: Multiple Properties

```javascript
const product = state({
  name: 'Laptop',
  price: 999,
  quantity: 1
});

effect(() => {
  Elements.update({
    productName: { textContent: product.name },
    productPrice: { textContent: `$${product.price}` },
    productQty: { textContent: product.quantity }
  });
});

product.price = 899; // ✨ Only price updates in DOM
product.quantity = 2; // ✨ Only quantity updates in DOM
```

 

### Example 3: Conditional Logic

```javascript
const auth = state({
  isLoggedIn: false,
  userName: ''
});

effect(() => {
  if (auth.isLoggedIn) {
    Elements.loginBtn.style.display = 'none';
    Elements.logoutBtn.style.display = 'block';
    Elements.welcomeMsg.textContent = `Welcome, ${auth.userName}!`;
  } else {
    Elements.loginBtn.style.display = 'block';
    Elements.logoutBtn.style.display = 'none';
    Elements.welcomeMsg.textContent = '';
  }
});

// Login
auth.isLoggedIn = true;
auth.userName = 'Alice';
// ✨ Effect runs: hides login, shows logout, displays welcome
```

 

### Example 4: Working with Collections

```javascript
const todoList = state({
  items: ['Buy milk', 'Walk dog', 'Read book']
});

effect(() => {
  // Update all elements with class 'todo-count'
  Collections.ClassName.todoCount.update({
    textContent: `${todoList.items.length} items`
  });
});

todoList.items.push('New task'); // ✨ All todo-count elements update
```

 

### Example 5: Computed Display Values

```javascript
const cart = state({
  items: [
    { name: 'Shirt', price: 29.99 },
    { name: 'Pants', price: 49.99 }
  ]
});

effect(() => {
  const total = cart.items.reduce((sum, item) => sum + item.price, 0);
  Elements.cartTotal.textContent = `Total: $${total.toFixed(2)}`;
});

cart.items.push({ name: 'Hat', price: 19.99 });
// ✨ Total recalculates and displays: "Total: $99.97"
```

 

### Example 6: Class Toggle Based on State

```javascript
const theme = state({ isDark: false });

effect(() => {
  document.body.classList.toggle('dark-mode', theme.isDark);
});

// Toggle theme
theme.isDark = true;  // ✨ Adds 'dark-mode' class
theme.isDark = false; // ✨ Removes 'dark-mode' class
```

 

### Example 7: Form Validation Display

```javascript
const form = state({
  email: '',
  password: ''
});

effect(() => {
  // Email validation
  const isEmailValid = form.email.includes('@');
  Elements.emailError.textContent = isEmailValid ? '' : 'Invalid email';
  Elements.emailError.style.display = form.email && !isEmailValid ? 'block' : 'none';
});

effect(() => {
  // Password validation
  const isPasswordValid = form.password.length >= 8;
  Elements.passwordError.textContent = isPasswordValid ? '' : 'Min 8 characters';
  Elements.passwordError.style.display = form.password && !isPasswordValid ? 'block' : 'none';
});

effect(() => {
  // Submit button state
  const isFormValid = form.email.includes('@') && form.password.length >= 8;
  Elements.submitBtn.disabled = !isFormValid;
});
```

 

## Deep Dive: Effect Lifecycle

### When Effects Run

```
┌─────────────────────────────────────┐
│  Effect Lifecycle                   │
│                                     │
│  1. Created with effect(() => ...) │
│       ↓                             │
│  2. Runs immediately (first time)   │
│       ↓                             │
│  3. Dependencies tracked            │
│       ↓                             │
│  4. Waits for dependency changes    │
│       ↓                             │
│  5. Dependency changes → Re-runs    │
│       ↓                             │
│  6. Back to step 3 (repeat)         │
│       ↓                             │
│  7. stopEffect() called → Stops     │
└─────────────────────────────────────┘
```

### Stopping Effects

Every effect returns a cleanup function:

```javascript
const counter = state({ count: 0 });

// Create effect and store cleanup function
const stopEffect = effect(() => {
  console.log('Count is:', counter.count);
});

counter.count = 1; // Logs: "Count is: 1"
counter.count = 2; // Logs: "Count is: 2"

// Stop the effect
stopEffect();

counter.count = 3; // Nothing logged - effect stopped
counter.count = 4; // Nothing logged - effect stopped
```

 

### Multiple Effects Are Independent

```javascript
const data = state({ a: 1, b: 2 });

const stopA = effect(() => {
  console.log('A changed:', data.a);
});

const stopB = effect(() => {
  console.log('B changed:', data.b);
});

data.a = 10; // Only first effect runs
data.b = 20; // Only second effect runs

stopA(); // Stop only the first effect

data.a = 100; // Nothing - first effect stopped
data.b = 200; // Second effect still runs
```

 

## Effect with DOM Helpers Integration

### Using Elements.update()

```javascript
const dashboard = state({
  users: 1250,
  revenue: 45000,
  orders: 328
});

effect(() => {
  Elements.update({
    userCount: { textContent: dashboard.users.toLocaleString() },
    revenueAmount: { textContent: `$${dashboard.revenue.toLocaleString()}` },
    orderCount: { textContent: dashboard.orders }
  });
});

// Update any stat - DOM reflects it instantly
dashboard.revenue = 50000;
```

 

### Using Collections for Multiple Elements

```javascript
const notification = state({
  message: '',
  type: 'info'
});

effect(() => {
  // Update all notification elements
  Collections.ClassName.notification.update({
    textContent: notification.message,
    className: `notification ${notification.type}`
  });
});

notification.message = 'Success!';
notification.type = 'success';
// ✨ All .notification elements update
```

 

### Using Selector for Complex Queries

```javascript
const highlight = state({ active: false });

effect(() => {
  // Query all buttons in the sidebar
  Selector.queryAll('.sidebar button').forEach(btn => {
    btn.classList.toggle('highlighted', highlight.active);
  });
});
```

 

## Real-World Examples

### Example 1: Live Search Results

```javascript
const search = state({
  query: '',
  results: []
});

// Update results display
effect(() => {
  if (search.results.length === 0) {
    Elements.resultsList.innerHTML = '<li>No results found</li>';
  } else {
    Elements.resultsList.innerHTML = search.results
      .map(r => `<li>${r.title}</li>`)
      .join('');
  }
});

// Update result count
effect(() => {
  Elements.resultCount.textContent = `${search.results.length} results`;
});

// Perform search when query changes
effect(() => {
  if (search.query.length >= 3) {
    // Simulate search
    fetch(`/api/search?q=${search.query}`)
      .then(res => res.json())
      .then(data => {
        search.results = data;
      });
  } else {
    search.results = [];
  }
});
```

 

### Example 2: Progress Tracker

```javascript
const progress = state({
  current: 0,
  total: 100
});

effect(() => {
  const percentage = (progress.current / progress.total) * 100;

  Elements.update({
    progressBar: {
      style: { width: `${percentage}%` }
    },
    progressText: {
      textContent: `${Math.round(percentage)}% complete`
    }
  });

  // Show completion message
  if (percentage >= 100) {
    Elements.completionMessage.style.display = 'block';
  }
});

// Simulate progress
setInterval(() => {
  if (progress.current < progress.total) {
    progress.current += 10;
  }
}, 1000);
```

 

### Example 3: Real-Time Form Preview

```javascript
const profile = state({
  name: '',
  bio: '',
  avatar: 'default.png'
});

// Live preview effect
effect(() => {
  Elements.update({
    previewName: { textContent: profile.name || 'Your Name' },
    previewBio: { textContent: profile.bio || 'Your bio will appear here...' },
    previewAvatar: { src: profile.avatar }
  });
});

// Character count effect
effect(() => {
  const remaining = 150 - profile.bio.length;
  Elements.charCount.textContent = `${remaining} characters remaining`;
  Elements.charCount.classList.toggle('warning', remaining < 20);
});

// Wire up inputs
Elements.update({
  nameInput: {
    addEventListener: ['input', (e) => {
      profile.name = e.target.value;
    }]
  },
  bioInput: {
    addEventListener: ['input', (e) => {
      profile.bio = e.target.value;
    }]
  }
});
```

 

### Example 4: Shopping Cart Badge

```javascript
const cart = state({ items: [] });

effect(() => {
  const count = cart.items.length;

  Elements.cartBadge.textContent = count;
  Elements.cartBadge.style.display = count > 0 ? 'flex' : 'none';

  // Animate on change
  if (count > 0) {
    Elements.cartBadge.classList.add('bounce');
    setTimeout(() => {
      Elements.cartBadge.classList.remove('bounce');
    }, 300);
  }
});

// Add to cart
function addToCart(item) {
  cart.items.push(item);
  // ✨ Badge updates automatically with animation
}
```

 

### Example 5: Tab Navigation State

```javascript
const tabs = state({ activeTab: 'home' });

effect(() => {
  // Update tab buttons
  Collections.ClassName.tab.forEach(tab => {
    const isActive = tab.dataset.tab === tabs.activeTab;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  // Update tab panels
  Collections.ClassName.tabPanel.forEach(panel => {
    const isVisible = panel.dataset.tab === tabs.activeTab;
    panel.style.display = isVisible ? 'block' : 'none';
    panel.setAttribute('aria-hidden', !isVisible);
  });
});

// Handle tab clicks
Collections.ClassName.tab.on('click', (e) => {
  tabs.activeTab = e.target.dataset.tab;
});
```

 

## Common Patterns

### Pattern 1: Cleanup Previous State

```javascript
const modal = state({ isOpen: false });

effect(() => {
  if (modal.isOpen) {
    document.body.style.overflow = 'hidden';
    Elements.modalOverlay.style.display = 'flex';
  } else {
    document.body.style.overflow = '';
    Elements.modalOverlay.style.display = 'none';
  }
});
```

 

### Pattern 2: Logging State Changes

```javascript
const appState = state({
  user: null,
  page: 'home'
});

// Debug effect - logs all changes
effect(() => {
  console.log('App state:', {
    user: appState.user,
    page: appState.page
  });
});
```

 

### Pattern 3: Syncing with External Systems

```javascript
const settings = state({
  volume: 50,
  brightness: 100
});

effect(() => {
  // Sync with audio system
  audioPlayer.setVolume(settings.volume / 100);
});

effect(() => {
  // Sync with display system
  screen.setBrightness(settings.brightness / 100);
});
```

 

### Pattern 4: Conditional Effect Logic

```javascript
const app = state({
  isOnline: navigator.onLine,
  pendingSync: []
});

effect(() => {
  if (app.isOnline && app.pendingSync.length > 0) {
    // Sync pending data when back online
    syncPendingData(app.pendingSync);
    app.pendingSync = [];
  }
});
```

 

### Pattern 5: Multiple Elements with Same Update

```javascript
const time = state({
  value: new Date().toLocaleTimeString()
});

effect(() => {
  // Update all clock elements
  document.querySelectorAll('.clock').forEach(el => {
    el.textContent = time.value;
  });
});

// Update every second
setInterval(() => {
  time.value = new Date().toLocaleTimeString();
}, 1000);
```

 

## Important Notes

### 1. Effects Run Immediately

```javascript
const data = state({ value: 0 });

effect(() => {
  console.log('Effect ran!', data.value);
});
// Console immediately logs: "Effect ran! 0"

data.value = 1;
// Console logs: "Effect ran! 1"
```

 

### 2. Only Tracked Properties Trigger Re-runs

```javascript
const obj = state({ a: 1, b: 2 });

effect(() => {
  console.log('A is:', obj.a);
  // Only reads 'a', not 'b'
});

obj.a = 10; // ✅ Effect runs (a was read)
obj.b = 20; // ❌ Effect doesn't run (b wasn't read)
```

 

### 3. Dynamic Dependencies

```javascript
const flag = state({ show: true });
const data = state({ a: 1, b: 2 });

effect(() => {
  if (flag.show) {
    console.log('A:', data.a);
  } else {
    console.log('B:', data.b);
  }
});

// Initially depends on: flag.show, data.a

flag.show = false;
// Now depends on: flag.show, data.b

data.a = 100; // Effect doesn't run (a not in current dependencies)
data.b = 200; // Effect runs (b is now a dependency)
```

 

### 4. Avoid Infinite Loops

```javascript
const counter = state({ value: 0 });

// ❌ BAD - Infinite loop!
effect(() => {
  counter.value++; // Writing to value triggers effect again!
});

// ✅ GOOD - Read only, or use conditions
effect(() => {
  console.log(counter.value); // Read only
});
```

 

## Summary

**What is `effect()`?**
A function that creates automatic reactions to state changes.

**Why use it?**
- ✅ Automatic DOM updates when state changes
- ✅ No manual update calls needed
- ✅ Dependencies tracked automatically
- ✅ Clean separation of state and side effects
- ✅ Cleanup with returned function

**Key Takeaway:**

```
Without effect()            With effect()
      |                          |
Manual update calls        Automatic reactions
      |                          |
Easy to forget ❌          Impossible to forget ✅
```

**One-Line Rule:** Use `effect()` to make things happen automatically when state changes.

**The Magic Formula:**
```
state() + effect() = Automatic Reactivity
─────────────────────────────────────────
Change data → Effects run → UI updates
```

**Best Practices:**
- Keep effects focused on one responsibility
- Store cleanup functions if you need to stop effects
- Don't modify tracked state inside effects (unless conditional)
- Use multiple small effects instead of one large one
- Combine with DOM Helpers for clean, declarative UI updates

**Remember:** Effects are your automatic responders — set them up once, and they handle the rest!
