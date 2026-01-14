# Understanding `effect()` - A Beginner's Guide

## Quick Start (30 seconds)

Need code that automatically runs when reactive data changes? Here's how:

```js
// Create reactive state
const counter = state({
  count: 0
});

// Effect automatically runs whenever counter.count changes
effect(() => {
  document.getElementById('display').textContent = counter.count;
  console.log(`Count is now: ${counter.count}`);
});
// Runs immediately: displays 0 and logs "Count is now: 0"

// Change the data—effect runs automatically!
counter.count = 5;
// Displays 5 and logs "Count is now: 5"

counter.count++;
// Displays 6 and logs "Count is now: 6"
```

**That's it!** The `effect()` function creates reactive side effects that automatically re-run when the data they depend on changes.

 

## What is `effect()`?

`effect()` is a function that **creates reactive side effects** - code that automatically re-runs whenever the reactive data it reads changes. It's the foundation of automatic UI updates and reactive behavior.

**An effect:**
- Automatically tracks which reactive data it reads
- Re-runs whenever any of that data changes
- Runs immediately when created
- Can perform any side effects (DOM updates, logging, API calls, etc.)
- Returns a cleanup function to stop the effect

Think of it as **connecting your code to reactive data** - whenever the data changes, your code automatically runs again to stay synchronized.

 

## Syntax

```js
// Using the full namespace
effect(function)

// Or using ReactiveUtils namespace
effect(function)
```

**Parameters:**
- `function` - A function that will run immediately and re-run when reactive data it reads changes

**Returns:**
- A cleanup function that stops the effect when called

**Example:**
```js
const cleanup = effect(() => {
  console.log(`Count: ${counter.count}`);
});

// Later, stop the effect
cleanup();
```

 

## Why Does This Exist?

### The Challenge with Plain JavaScript

In vanilla JavaScript, when data changes, you must manually update everything that depends on it:

```javascript
// Plain JavaScript approach
let count = 0;

function updateUI() {
  // Manual UI updates
  document.getElementById('display').textContent = count;
  document.getElementById('doubled').textContent = count * 2;

  // Manual logging
  console.log(`Count: ${count}`);

  // Manual conditional logic
  if (count > 10) {
    document.getElementById('status').textContent = 'High';
  } else {
    document.getElementById('status').textContent = 'Low';
  }
}

// You must remember to call updateUI after every change
count = 5;
updateUI(); // ❌ Easy to forget

count++;
updateUI(); // ❌ Repetitive and error-prone

count = count * 2;
updateUI(); // ❌ Tedious manual synchronization
```

**Problems with this approach:**
❌ Must manually call update functions after every change
❌ Easy to forget, causing UI to get out of sync
❌ Must remember which functions to call for which changes
❌ Adding new UI elements means updating the function and all call sites
❌ Code becomes scattered and hard to maintain
❌ No automatic dependency tracking

### What Situation Is This Designed For?

Applications need code that stays synchronized with data:
- UI elements that display current data
- Calculations that depend on multiple values
- Side effects that should run when data changes (logging, analytics, API calls)
- Conditional rendering based on state
- Animations that respond to data
- Any logic that needs to stay up-to-date automatically

Manually coordinating all these updates is tedious and error-prone. `effect()` is designed specifically to make this automatic and reliable.

### How Does `effect()` Help?

With `effect()`, you declare what should happen, and it automatically happens whenever relevant data changes:

```javascript
const counter = state({
  count: 0
});

// Set up automatic effects
effect(() => {
  document.getElementById('display').textContent = counter.count;
  document.getElementById('doubled').textContent = counter.count * 2;
});

effect(() => {
  console.log(`Count: ${counter.count}`);
});

effect(() => {
  const status = counter.count > 10 ? 'High' : 'Low';
  document.getElementById('status').textContent = status;
});

// Just change the data—everything updates automatically! ✨
counter.count = 5;   // All effects run automatically
counter.count++;     // All effects run automatically
counter.count *= 2;  // All effects run automatically
```

**Benefits:**
✅ Automatic synchronization with reactive data
✅ No manual update calls needed
✅ Impossible to forget updates
✅ Dependencies tracked automatically
✅ Clean, declarative code
✅ Centralized effect logic

### When Does `effect()` Shine?

This method is particularly well-suited when:
- You need automatic UI updates
- Code should run whenever data changes
- You want automatic dependency tracking
- You're building reactive user interfaces
- You need side effects that stay synchronized with data
- You want to eliminate manual update coordination

 

## Mental Model

Think of `effect()` like a **smart assistant that watches and responds**:

```
Regular Code (Manual Work):
┌─────────────────┐
│  count = 5      │ You change data
└─────────────────┘
         │
         ▼
[Your responsibility]
         │
         ▼
Call updateUI()     ← ❌ You must remember
Call logChange()    ← ❌ You must remember
Call saveData()     ← ❌ You must remember

Reactive Effect (Automatic Assistant):
┌─────────────────────┐
│  counter.count = 5  │ You change data
└─────────────────────┘
         │
         ▼
   ┌──────────┐
   │  Effect  │ ← Watches automatically
   │ Function │
   └─────┬────┘
         │
         ▼
Automatically executes:
  ✓ Updates UI
  ✓ Logs changes
  ✓ Saves data
  ✓ Everything in sync!
```

**Key Insight:** Just like a smart assistant who watches what you're doing and automatically handles related tasks, effects watch reactive data and automatically execute when that data changes. You set them up once, and they work continuously.

 

## How Does It Work?

### The Magic: Automatic Dependency Tracking

When an effect runs, the reactive system tracks which reactive properties it accesses:

```
1️⃣ Create effect
   ↓
effect(() => {
  console.log(counter.count);  ← Reads counter.count
});
   ↓
Effect runs immediately
Tracks: "This effect depends on counter.count"
Logs: Count is now: 0

2️⃣ Data changes
   ↓
counter.count = 5;
   ↓
Reactive system checks: "Which effects depend on count?"
Finds: The effect we created
   ↓
Effect re-runs automatically!
Logs: Count is now: 5

3️⃣ More changes
   ↓
counter.count = 10;
   ↓
Effect re-runs again automatically!
Logs: Count is now: 10
```

### Under the Hood

```
effect(() => { ... })
      │
      ▼
┌─────────────────────┐
│  Run Function       │
│  Track Which Props  │
│  Are Read           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Register Effect    │
│  as Dependent On    │
│  Those Props        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  When Any Prop      │
│  Changes, Re-run    │
│  Effect             │
└─────────────────────┘
```

**What happens:**

1️⃣ When you create an effect, the function runs immediately
2️⃣ While running, the reactive system tracks which properties are read
3️⃣ The effect is registered as a dependent of those properties
4️⃣ When any of those properties change, the effect automatically re-runs
5️⃣ On re-run, dependencies are re-tracked (they can change dynamically)

This is completely automatic - you just write the code you want to run, and the reactive system handles the rest!

 

## Basic Usage

### Creating a Simple Effect

The simplest way to use `effect()` is to pass a function:

```js
const message = state({
  text: 'Hello'
});

effect(() => {
  console.log(message.text);
});
// Immediately logs: "Hello"

message.text = 'Hello World';
// Automatically logs: "Hello World"

message.text = 'Goodbye';
// Automatically logs: "Goodbye"
```

### Updating the DOM

Effects are perfect for keeping the DOM synchronized with state:

```js
const user = state({
  name: 'John',
  age: 25
});

effect(() => {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userAge').textContent = user.age;
});

// Changes automatically update the DOM
user.name = 'Jane';
user.age = 26;
```

### Conditional Logic in Effects

Effects can contain any logic, including conditionals:

```js
const account = state({
  balance: 100
});

effect(() => {
  const statusElement = document.getElementById('status');

  if (account.balance > 1000) {
    statusElement.textContent = 'Premium Account';
    statusElement.className = 'status-premium';
  } else if (account.balance > 100) {
    statusElement.textContent = 'Standard Account';
    statusElement.className = 'status-standard';
  } else {
    statusElement.textContent = 'Basic Account';
    statusElement.className = 'status-basic';
  }
});

account.balance = 1500;
// Status automatically updates to "Premium Account"
```

 

## Automatic Dependency Tracking

### Effects Track What They Read

Effects automatically track which reactive properties they access:

```js
const data = state({
  a: 1,
  b: 2,
  c: 3
});

effect(() => {
  // This effect only reads 'a' and 'b'
  console.log(`Sum: ${data.a + data.b}`);
});
// Dependencies: a, b

data.a = 10;
// Effect re-runs (depends on 'a')

data.b = 20;
// Effect re-runs (depends on 'b')

data.c = 30;
// Effect does NOT re-run (doesn't depend on 'c')
```

### Dynamic Dependencies

Dependencies can change based on conditions:

```js
const app = state({
  showDetails: false,
  name: 'John',
  details: 'Developer'
});

effect(() => {
  console.log(app.name);

  if (app.showDetails) {
    console.log(app.details); // Only read when showDetails is true
  }
});

// Initially depends on: name
// When showDetails is true, depends on: name, details

app.name = 'Jane';
// Effect re-runs

app.details = 'Designer';
// Effect does NOT re-run (showDetails is false, so details isn't read)

app.showDetails = true;
// Effect re-runs (showDetails changed)
// Now it reads 'details' too

app.details = 'Manager';
// NOW effect re-runs (because it's now reading details)
```

 

## Effects Run Immediately

### Initial Execution

Unlike watchers, effects run immediately when created:

```js
const counter = state({
  count: 0
});

console.log('Before effect');

effect(() => {
  console.log(`Count: ${counter.count}`);
});
// Immediately logs: "Count: 0"

console.log('After effect');

// Output:
// Before effect
// Count: 0
// After effect
```

### Why This Matters

Immediate execution is useful for initializing UI:

```js
const user = state({
  name: 'John',
  isOnline: false
});

// UI is initialized immediately
effect(() => {
  document.getElementById('userName').textContent = user.name;

  const statusDot = document.getElementById('statusDot');
  statusDot.className = user.isOnline ? 'online' : 'offline';
});

// UI already shows initial state, no manual initialization needed!
```

 

## Multiple Dependencies

### Effects Can Depend on Multiple Properties

```js
const rect = state({
  width: 10,
  height: 20
});

effect(() => {
  const area = rect.width * rect.height;
  console.log(`Area: ${area}`);
});
// Logs: "Area: 200"

rect.width = 15;
// Logs: "Area: 300" (15 * 20)

rect.height = 30;
// Logs: "Area: 450" (15 * 30)
```

### Effects Can Depend on Multiple Objects

```js
const cart = state({
  items: [
    { price: 10, quantity: 2 }
  ]
});

const settings = state({
  taxRate: 0.1
});

effect(() => {
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const tax = subtotal * settings.taxRate;
  const total = subtotal + tax;

  console.log(`Total: $${total.toFixed(2)}`);
});
// Depends on both cart.items AND settings.taxRate

cart.items.push({ price: 25, quantity: 1 });
// Effect re-runs

settings.taxRate = 0.15;
// Effect re-runs
```

### Effects Can Depend on Computed Properties

```js
const user = state({
  firstName: 'John',
  lastName: 'Doe'
});

computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
});

effect(() => {
  document.title = user.fullName;
});

user.firstName = 'Jane';
// Effect re-runs, title updates
```

 

## Effects with Side Effects

### Logging and Debugging

```js
const app = state({
  currentPage: '/home',
  user: null
});

effect(() => {
  console.log('=== State Update ===');
  console.log('Page:', app.currentPage);
  console.log('User:', app.user);
  console.log('Timestamp:', new Date().toISOString());
});

// Every state change is automatically logged
```

### API Calls

```js
const search = state({
  query: '',
  results: []
});

effect(() => {
  if (search.query) {
    fetch(`/api/search?q=${search.query}`)
      .then(res => res.json())
      .then(data => {
        search.results = data;
      });
  }
});

// Typing triggers automatic searches
search.query = 'react';
// Automatically fetches search results
```

### Local Storage Synchronization

```js
const preferences = state({
  theme: 'light',
  fontSize: 14,
  language: 'en'
});

effect(() => {
  localStorage.setItem('preferences', JSON.stringify({
    theme: preferences.theme,
    fontSize: preferences.fontSize,
    language: preferences.language
  }));
});

// Changes automatically save to localStorage
preferences.theme = 'dark';
```

### Analytics Tracking

```js
const analytics = state({
  pageViews: 0,
  currentPage: '/home',
  user: null
});

effect(() => {
  if (analytics.user) {
    trackEvent('page_view', {
      page: analytics.currentPage,
      userId: analytics.user.id,
      timestamp: Date.now()
    });
  }
});

// Page changes automatically tracked
analytics.currentPage = '/products';
```

 

## Cleanup and Disposal

### Stopping Effects

`effect()` returns a cleanup function that stops the effect:

```js
const counter = state({
  count: 0
});

const stopEffect = effect(() => {
  console.log(`Count: ${counter.count}`);
});

counter.count = 1;
// Logs: "Count: 1"

// Stop the effect
stopEffect();

counter.count = 2;
// Nothing logged - effect is stopped
```

### Cleanup in Components

This is useful for component lifecycle management:

```js
function createTimer() {
  const timer = state({
    seconds: 0
  });

  // Start interval
  const interval = setInterval(() => {
    timer.seconds++;
  }, 1000);

  // Update UI
  const stopEffect = effect(() => {
    document.getElementById('timer').textContent = timer.seconds;
  });

  // Return cleanup
  return () => {
    clearInterval(interval);
    stopEffect();
  };
}

const cleanup = createTimer();

// Later, when removing the timer
cleanup();
```

### Multiple Effects Cleanup

```js
const app = state({
  user: null,
  products: [],
  cart: []
});

const cleanups = [];

cleanups.push(effect(() => {
  if (app.user) {
    document.getElementById('userName').textContent = app.user.name;
  }
}));

cleanups.push(effect(() => {
  document.getElementById('productCount').textContent = app.products.length;
}));

cleanups.push(effect(() => {
  document.getElementById('cartCount').textContent = app.cart.length;
}));

// Later, stop all effects
function cleanup() {
  cleanups.forEach(fn => fn());
}
```

 

## Real-World Examples

### Example 1: Live Counter

```js
const counter = state({
  count: 0,
  step: 1
});

// Update display
effect(() => {
  document.getElementById('count').textContent = counter.count;
});

// Update step display
effect(() => {
  document.getElementById('step').textContent = counter.step;
});

// Update doubled value
effect(() => {
  document.getElementById('doubled').textContent = counter.count * 2;
});

// Button handlers
document.getElementById('increment').onclick = () => {
  counter.count += counter.step;
};

document.getElementById('decrement').onclick = () => {
  counter.count -= counter.step;
};

document.getElementById('changeStep').onclick = () => {
  counter.step = counter.step === 1 ? 10 : 1;
};
```

### Example 2: Todo List

```js
const todos = state({
  items: [
    { id: 1, text: 'Learn Reactive', done: false },
    { id: 2, text: 'Build App', done: false }
  ]
});

// Render todo list
effect(() => {
  const container = document.getElementById('todoList');

  container.innerHTML = todos.items.map(todo => `
    <div class="todo ${todo.done ? 'done' : ''}">
      <input
        type="checkbox"
        ${todo.done ? 'checked' : ''}
        data-id="${todo.id}"
      />
      <span>${todo.text}</span>
    </div>
  `).join('');
});

// Update counts
effect(() => {
  const total = todos.items.length;
  const done = todos.items.filter(t => t.done).length;
  const remaining = total - done;

  document.getElementById('stats').textContent =
    `${remaining} remaining / ${total} total`;
});

// Add todo
function addTodo(text) {
  todos.items.push({
    id: Date.now(),
    text: text,
    done: false
  });
}

// Toggle todo
function toggleTodo(id) {
  const todo = todos.items.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
  }
}
```

### Example 3: Form Validation Display

```js
const form = state({
  email: '',
  password: ''
});

const validation = state({
  emailError: '',
  passwordError: ''
});

// Validate email
effect(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.email) {
    validation.emailError = '';
  } else if (!emailRegex.test(form.email)) {
    validation.emailError = 'Please enter a valid email';
  } else {
    validation.emailError = '';
  }
});

// Validate password
effect(() => {
  if (!form.password) {
    validation.passwordError = '';
  } else if (form.password.length < 8) {
    validation.passwordError = 'Password must be at least 8 characters';
  } else {
    validation.passwordError = '';
  }
});

// Display errors
effect(() => {
  document.getElementById('emailError').textContent = validation.emailError;
});

effect(() => {
  document.getElementById('passwordError').textContent = validation.passwordError;
});

// Enable/disable submit button
effect(() => {
  const isValid = !validation.emailError && !validation.passwordError &&
                  form.email && form.password;

  document.getElementById('submit').disabled = !isValid;
});
```

### Example 4: Dark Mode Toggle

```js
const settings = state({
  darkMode: false
});

// Apply theme
effect(() => {
  if (settings.darkMode) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }
});

// Update toggle button
effect(() => {
  const button = document.getElementById('themeToggle');
  button.textContent = settings.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Save preference
effect(() => {
  localStorage.setItem('darkMode', settings.darkMode);
});

// Toggle function
function toggleTheme() {
  settings.darkMode = !settings.darkMode;
}

// Load saved preference on startup
settings.darkMode = localStorage.getItem('darkMode') === 'true';
```

### Example 5: Real-Time Dashboard

```js
const dashboard = state({
  sales: 0,
  visitors: 0,
  conversionRate: 0
});

// Update sales display
effect(() => {
  document.getElementById('sales').textContent = `$${dashboard.sales.toLocaleString()}`;
});

// Update visitors display
effect(() => {
  document.getElementById('visitors').textContent = dashboard.visitors.toLocaleString();
});

// Update conversion rate with color coding
effect(() => {
  const element = document.getElementById('conversion');
  element.textContent = `${dashboard.conversionRate.toFixed(2)}%`;

  if (dashboard.conversionRate > 5) {
    element.className = 'metric excellent';
  } else if (dashboard.conversionRate > 2) {
    element.className = 'metric good';
  } else {
    element.className = 'metric poor';
  }
});

// Update trend indicator
effect(() => {
  const trend = dashboard.sales / dashboard.visitors;
  const indicator = document.getElementById('trend');

  if (trend > 50) {
    indicator.textContent = '📈 Trending Up';
  } else if (trend > 20) {
    indicator.textContent = '➡️ Steady';
  } else {
    indicator.textContent = '📉 Needs Attention';
  }
});

// Simulate real-time updates
setInterval(() => {
  dashboard.sales += Math.floor(Math.random() * 1000);
  dashboard.visitors += Math.floor(Math.random() * 50);
  dashboard.conversionRate = (dashboard.sales / dashboard.visitors) * 0.1;
}, 2000);
```

### Example 6: Auto-Save Document

```js
const document = state({
  title: '',
  content: '',
  lastSaved: null,
  isDirty: false
});

let saveTimeout;

// Mark as dirty when changed
effect(() => {
  // Read title and content to track changes
  const _ = document.title + document.content;
  document.isDirty = true;
});

// Auto-save after 2 seconds of inactivity
effect(() => {
  if (document.isDirty) {
    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
      console.log('Saving...');

      await saveToServer({
        title: document.title,
        content: document.content
      });

      document.lastSaved = new Date();
      document.isDirty = false;

      console.log('Saved!');
    }, 2000);
  }
});

// Display save status
effect(() => {
  const status = document.getElementById('saveStatus');

  if (document.isDirty) {
    status.textContent = '● Unsaved changes';
    status.className = 'unsaved';
  } else if (document.lastSaved) {
    const time = document.lastSaved.toLocaleTimeString();
    status.textContent = `✓ Saved at ${time}`;
    status.className = 'saved';
  }
});
```

 

## Common Pitfalls

### Pitfall #1: Infinite Loops

❌ **Wrong:**
```js
const counter = state({
  count: 0
});

effect(() => {
  // ❌ This creates an infinite loop!
  counter.count++;
  console.log(counter.count);
});

// Effect reads count, increments it, which triggers the effect again, etc.
```

✅ **Correct:**
```js
const counter = state({
  count: 0
});

effect(() => {
  // ✅ Just read, don't modify
  console.log(counter.count);
});

// Modify outside the effect
counter.count++;
```

**What's happening:**
- Don't modify reactive state inside effects that read that same state
- This creates infinite loops
- Effects should generally be for side effects, not state mutations

 

### Pitfall #2: Not Understanding Immediate Execution

❌ **Wrong Expectation:**
```js
console.log('Before');

effect(() => {
  console.log('Effect');
});

console.log('After');

// Expected: Before, After, Effect
// Actual:   Before, Effect, After
```

✅ **Correct Understanding:**
```js
console.log('Before');

effect(() => {
  console.log('Effect runs immediately');
});
// ← Effect has already run by this point

console.log('After');
```

**What's happening:**
- Effects run immediately when created
- They don't wait for the next state change
- If you need delayed execution, use watchers or conditional logic

 

### Pitfall #3: Forgetting Dependencies

❌ **Wrong:**
```js
const data = state({
  value: 10
});

let multiplier = 2; // Regular variable, not reactive

effect(() => {
  console.log(data.value * multiplier);
});
// Logs: 20

multiplier = 3;
// Nothing happens - multiplier isn't reactive

data.value = 20;
// Logs: 60 (uses updated multiplier, but didn't track the change)
```

✅ **Correct:**
```js
const data = state({
  value: 10,
  multiplier: 2 // Make it reactive
});

effect(() => {
  console.log(data.value * data.multiplier);
});
// Logs: 20

data.multiplier = 3;
// Logs: 30 (effect re-runs)

data.value = 20;
// Logs: 60
```

**What's happening:**
- Effects only track reactive state
- Regular variables don't trigger re-runs
- Make sure all dependencies are reactive

 

### Pitfall #4: Heavy Computations in Effects

❌ **Wrong:**
```js
const data = state({
  numbers: Array.from({ length: 1000000 }, (_, i) => i)
});

effect(() => {
  // ❌ Expensive computation runs on every change
  const sorted = [...data.numbers].sort((a, b) => b - a);
  console.log('Sorted:', sorted[0]);
});
```

✅ **Correct:**
```js
const data = state({
  numbers: Array.from({ length: 1000000 }, (_, i) => i)
});

// Use computed for expensive calculations
computed(data, {
  largestNumber() {
    return Math.max(...this.numbers);
  }
});

effect(() => {
  // ✅ Just use the cached computed value
  console.log('Largest:', data.largestNumber);
});
```

**What's happening:**
- Effects run frequently
- Heavy computations should be in computed properties (cached)
- Effects should use computed values, not recalculate

 

### Pitfall #5: Not Cleaning Up Effects

❌ **Wrong:**
```js
function createWidget() {
  const state = ReactiveUtils.state({ value: 0 });

  // Create effect but never clean it up
  effect(() => {
    updateDOM(state.value);
  });

  return state;
}

// Create many widgets
for (let i = 0; i < 100; i++) {
  createWidget();
}
// ❌ Memory leak: 100 effects still running!
```

✅ **Correct:**
```js
function createWidget() {
  const state = ReactiveUtils.state({ value: 0 });

  // Save cleanup function
  const cleanup = effect(() => {
    updateDOM(state.value);
  });

  return {
    state,
    destroy: cleanup
  };
}

// Create and destroy properly
const widgets = [];
for (let i = 0; i < 100; i++) {
  widgets.push(createWidget());
}

// Later, clean up
widgets.forEach(widget => widget.destroy());
```

**What's happening:**
- Always clean up effects when they're no longer needed
- Save and call the cleanup function
- This prevents memory leaks

 

## Summary

**What is `effect()`?**

`effect()` creates reactive side effects that automatically run when the reactive data they depend on changes. It's the foundation of automatic UI updates.

 

**Why use `effect()` instead of manual updates?**

- Automatic dependency tracking
- No manual update calls needed
- Runs immediately for initialization
- Impossible to forget updates
- Clean, declarative code
- Automatic synchronization

 

**Key Points to Remember:**

1️⃣ **Effects run immediately** - They execute when created, not just on changes

2️⃣ **Automatic dependency tracking** - Effects track what they read automatically

3️⃣ **Returns cleanup function** - Always save and call it when done

4️⃣ **Avoid infinite loops** - Don't modify state you're reading in the effect

5️⃣ **Use for side effects** - DOM updates, logging, API calls, etc.

6️⃣ **Keep effects focused** - Each effect should have a clear, single purpose

7️⃣ **Clean up when done** - Prevent memory leaks by stopping effects

 

**Mental Model:** Think of `effect()` like a **smart assistant that watches and responds** - it monitors reactive data and automatically executes your code whenever that data changes. You tell it what to do once, and it handles the rest.

 

**Quick Reference:**

```js
// Create state
const counter = state({ count: 0 });

// Create effect (runs immediately)
const cleanup = effect(() => {
  console.log(`Count: ${counter.count}`);
  document.getElementById('display').textContent = counter.count;
});
// Immediately logs and updates DOM

// Changes trigger effect automatically
counter.count = 5;
counter.count++;

// Stop effect when done
cleanup();
```

 

**Remember:** `effect()` is the foundation of reactive programming. It automatically keeps your UI, logs, and side effects synchronized with your reactive data! ✨
