# `state()` - Create Reactive State
 
## Quick Start (30 seconds)
 
```javascript
// Create reactive state
const counter = state({ count: 0 });
 
// Update it
counter.count++;
 
// It just works - automatically reactive!
effect(() => {
  Elements.display.textContent = counter.count;
});
```
 
**That's it.** Change `counter.count`, and the DOM updates automatically. No `setState()`, no manual updates, no framework needed.
 
 
 
## What is `state()`?
 
`state()` is **the foundation of reactivity**. It takes a regular JavaScript object and makes it "smart" — meaning it automatically tracks when values change and notifies anything watching those values.
 
Think of it as **upgrading a regular object into a smart home system**. A regular object is like a light switch you have to manually flip. A reactive state is like a smart light that responds to motion sensors, timers, and app commands automatically.
 
**In practical terms:** When you create state with `state()`, you get back a special version of your object. This object looks and acts like a normal object, but behind the scenes it's watching every property change and can trigger automatic updates to your UI, computed values, and side effects.
 
 
 
## Syntax
 
```javascript
// Simple state
const myState = state(initialObject);
 
// Example
const user = state({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
});
```
 
**Parameters:**
- `initialObject` - A plain JavaScript object with your initial state values
 
**Returns:**
- A reactive proxy that wraps your object with automatic change tracking
 
 
 
## Why Does This Exist?
 
### The Problem Without Reactive State
 
Let's say you want to build a simple counter that updates the DOM:
 
```javascript
// ❌ The manual way (plain JavaScript)
let count = 0;
 
function updateCounter() {
  document.getElementById('counterDisplay').textContent = count;
  document.getElementById('counterBadge').textContent = count;
 
  if (count > 0) {
    document.getElementById('resetButton').style.display = 'block';
  } else {
    document.getElementById('resetButton').style.display = 'none';
  }
}
 
document.getElementById('incrementBtn').addEventListener('click', () => {
  count++;
  updateCounter(); // Must remember to call this!
});
 
document.getElementById('decrementBtn').addEventListener('click', () => {
  count--;
  updateCounter(); // And this!
});
 
// Initial render
updateCounter();
```
 
**What's the Real Issue?**
 
```
User Clicks Button
    ↓
Update count variable
    ↓
❌ NOTHING HAPPENS (forgot to call updateCounter)
    ↓
Manual function call required
    ↓
DOM updates
```
 
**Problems:**
❌ **Easy to forget updates** - Every time you change `count`, you must remember to call `updateCounter()`
❌ **Scattered logic** - Update logic is separated from the data
❌ **Hard to scale** - What if 10 different parts of your UI need to react to count changes?
❌ **Lots of boilerplate** - You're constantly writing "update this element when that changes"
❌ **No single source of truth** - The variable and the DOM can get out of sync
 
### The Solution with `state()`
 
```javascript
// ✅ The reactive way
const counter = state({ count: 0 });
 
// Set up automatic reactions once
effect(() => {
  Elements.update({
    counterDisplay: { textContent: counter.count },
    counterBadge: { textContent: counter.count }
  });
});
 
effect(() => {
  Elements.resetButton.style.display = counter.count > 0 ? 'block' : 'none';
});
 
// Just update the state - everything else happens automatically
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => {
      counter.count++; // ✨ DOM updates automatically!
    }]
  },
  decrementBtn: {
    addEventListener: ['click', () => {
      counter.count--; // ✨ DOM updates automatically!
    }]
  }
});
```
 
**What Just Happened?**
 
```
User Clicks Button
    ↓
Update counter.count
    ↓
✨ State detects the change automatically
    ↓
✨ All effects that use counter.count re-run
    ↓
✨ DOM updates automatically
```
 
**Benefits:**
✅ **Automatic updates** - Change the data, UI updates automatically
✅ **Single source of truth** - State is always in sync with UI
✅ **Declarative** - Say "what" should happen, not "how" to update
✅ **Scales easily** - Add 100 reactions to the same state, no problem
✅ **Less code** - Write the update logic once, it runs whenever needed
 
 
 
## Mental Model: The Smart House
 
Think of reactive state like a **smart home system**:
 
**Regular Object (Dumb House):**
```
┌─────────────────────────────┐
│  Regular Object             │
│  { temperature: 20 }        │
│                             │
│  - You set temperature      │
│  - You manually adjust AC   │
│  - You manually open window │
│  - You manually turn on fan │
└─────────────────────────────┘
```
 
**Reactive State (Smart House):**
```
┌─────────────────────────────┐
│  Reactive State             │
│  state({ temperature: 20 }) │
│                             │
│  You set: temperature = 25  │
│         ↓                   │
│  ✨ AC adjusts automatically│
│  ✨ Windows adjust          │
│  ✨ Fans adjust             │
│  ✨ Display updates         │
└─────────────────────────────┘
```
 
When you change the temperature in a smart home, **sensors detect it** and **trigger automated responses**. That's exactly what reactive state does with your data!
 
 
 
## How Does It Work?
 
Under the hood, `state()` uses JavaScript **Proxies** to wrap your object:
 
```
Your Object          Proxy Wrapper           Effect System
┌──────────┐        ┌──────────────┐        ┌──────────────┐
│ count: 0 │   →    │ Intercepts   │   →    │ Tracks who   │
│          │        │ ALL access   │        │ reads count  │
└──────────┘        └──────────────┘        └──────────────┘
                           ↓
                    When count changes:
                           ↓
                    Notifies all effects
                           ↓
                    They re-run automatically
```
 
**Step-by-step:**
 
1️⃣ **You create state:**
```javascript
const counter = state({ count: 0 });
```
 
2️⃣ **State wraps your object in a Proxy:**
```javascript
// Simplified internal behavior
return new Proxy(yourObject, {
  get(target, key) {
    track(target, key); // "Who's reading this?"
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key); // "Notify everyone watching!"
    return true;
  }
});
```
 
3️⃣ **When an effect reads a property:**
```javascript
effect(() => {
  console.log(counter.count); // Reading counter.count
});
// State remembers: "This effect depends on counter.count"
```
 
4️⃣ **When you change that property:**
```javascript
counter.count++; // State says: "counter.count changed, notify its effects!"
```
 
5️⃣ **Effects automatically re-run:**
```javascript
// Effect runs again automatically
console.log(counter.count); // Logs new value
```
 
 
 
## Basic Usage
 
### Example 1: Simple Counter State
 
```javascript
// Create state
const counter = state({
  count: 0
});
 
// Use it like a normal object
counter.count++; // 1
counter.count += 5; // 6
 
console.log(counter.count); // 6
```
 
**What's happening?**
- State looks and acts like a regular object
- You can read and write properties normally
- Behind the scenes, every change is tracked
 
 
 
### Example 2: User Profile with DOM Updates
 
```javascript
// Create user state
const user = state({
  name: 'Alice',
  avatar: '👩',
  status: 'online'
});
 
// Auto-update DOM when state changes
effect(() => {
  Elements.update({
    userName: { textContent: user.name },
    userAvatar: { textContent: user.avatar },
    userStatus: {
      textContent: user.status,
      classList: {
        toggle: user.status === 'online' ? 'online' : 'offline'
      }
    }
  });
});
 
// Later, update the user
user.name = 'Bob';      // ✨ DOM updates automatically
user.avatar = '👨';     // ✨ DOM updates automatically
user.status = 'away';   // ✨ DOM updates automatically
```
 
 
 
### Example 3: Nested Objects Work Too
 
```javascript
// State handles nested objects automatically
const app = state({
  user: {
    profile: {
      name: 'Alice',
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  }
});
 
// Deep changes are reactive
effect(() => {
  document.body.className = app.user.profile.settings.theme;
});
 
// This triggers the effect
app.user.profile.settings.theme = 'light'; // ✨ Body class updates
```
 
**What's happening?**
- Reactive state automatically makes nested objects reactive too
- You can change deep properties and effects still track them
- No special syntax needed
 
 
 
### Example 4: Multiple Properties in One State
 
```javascript
// Todo app state
const todos = state({
  items: ['Buy milk', 'Walk dog'],
  filter: 'all',
  darkMode: false
});
 
// Each effect watches different properties
effect(() => {
  // This effect only re-runs when 'items' or 'filter' changes
  const filtered = todos.items.filter(item => {
    if (todos.filter === 'all') return true;
    // ... filtering logic
  });
 
  Collections.ClassName.todoItem.update({
    style: { display: 'block' }
  });
});
 
effect(() => {
  // This effect only re-runs when 'darkMode' changes
  document.body.classList.toggle('dark', todos.darkMode);
});
 
// Update items - only first effect re-runs
todos.items.push('Read book'); // ✨ First effect runs
 
// Update darkMode - only second effect re-runs
todos.darkMode = true; // ✨ Second effect runs
```
 
**Key Insight:**
Effects are **smart** — they only re-run when properties **they actually read** change. This is called **fine-grained reactivity**.
 
 
 
### Example 5: Working with Arrays
 
```javascript
// State with arrays
const playlist = state({
  songs: ['Song A', 'Song B', 'Song C'],
  currentIndex: 0
});
 
// Auto-update DOM
effect(() => {
  Elements.songList.innerHTML = playlist.songs
    .map((song, i) => `<li class="${i === playlist.currentIndex ? 'active' : ''}">${song}</li>`)
    .join('');
});
 
// Array mutations work!
playlist.songs.push('Song D');           // ✨ DOM updates
playlist.songs[0] = 'New Song A';        // ✨ DOM updates
playlist.currentIndex = 1;               // ✨ DOM updates
```
 
**Note:** For more advanced array operations, check out `collection()` which provides array-specific reactive methods.
 
 
 
### Example 6: Form State with DOM Helpers
 
```javascript
// Form state
const formData = state({
  username: '',
  email: '',
  agreed: false
});
 
// Sync state with DOM inputs
effect(() => {
  Elements.update({
    usernameInput: { value: formData.username },
    emailInput: { value: formData.email },
    agreeCheckbox: { checked: formData.agreed }
  });
});
 
// Enable submit button when form is valid
effect(() => {
  const isValid = formData.username.length > 0
    && formData.email.includes('@')
    && formData.agreed;
 
  Elements.submitBtn.disabled = !isValid;
});
 
// Update state from inputs
Elements.update({
  usernameInput: {
    addEventListener: ['input', (e) => {
      formData.username = e.target.value; // ✨ Effects run automatically
    }]
  },
  emailInput: {
    addEventListener: ['input', (e) => {
      formData.email = e.target.value; // ✨ Effects run automatically
    }]
  },
  agreeCheckbox: {
    addEventListener: ['change', (e) => {
      formData.agreed = e.target.checked; // ✨ Effects run automatically
    }]
  }
});
```
 
 
 
### Example 7: Conditional DOM Updates
 
```javascript
// App state
const app = state({
  isLoggedIn: false,
  userName: '',
  unreadMessages: 0
});
 
// Show/hide based on login status
effect(() => {
  Elements.update({
    loginForm: {
      style: { display: app.isLoggedIn ? 'none' : 'block' }
    },
    dashboard: {
      style: { display: app.isLoggedIn ? 'block' : 'none' }
    }
  });
});
 
// Update welcome message
effect(() => {
  if (app.isLoggedIn) {
    Elements.welcomeMessage.textContent = `Welcome back, ${app.userName}!`;
  }
});
 
// Show notification badge
effect(() => {
  Elements.notificationBadge.update({
    textContent: app.unreadMessages,
    style: {
      display: app.unreadMessages > 0 ? 'inline-block' : 'none'
    }
  });
});
 
// Simulate login
setTimeout(() => {
  app.isLoggedIn = true;        // ✨ All effects run
  app.userName = 'Alice';       // ✨ Welcome message updates
  app.unreadMessages = 3;       // ✨ Badge appears
}, 1000);
```
 
 
 
### Example 8: Computed-Like Patterns (Before Learning `computed()`)
 
```javascript
// Shopping cart state
const cart = state({
  items: [
    { name: 'Laptop', price: 999, quantity: 1 },
    { name: 'Mouse', price: 29, quantity: 2 }
  ]
});
 
// Calculate total in an effect
effect(() => {
  const total = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
 
  Elements.cartTotal.textContent = `$${total}`;
});
 
// Update quantity
cart.items[1].quantity = 3; // ✨ Total recalculates and DOM updates
```
 
**Note:** This works, but `computed()` provides a more elegant solution for derived values.
 
 
 
### Example 9: Multiple States Working Together
 
```javascript
// User preferences
const prefs = state({
  theme: 'light',
  fontSize: 16
});
 
// App data
const data = state({
  items: ['Item 1', 'Item 2', 'Item 3']
});
 
// Effects can depend on multiple states
effect(() => {
  document.body.className = prefs.theme;
  document.body.style.fontSize = `${prefs.fontSize}px`;
});
 
effect(() => {
  Elements.itemList.innerHTML = data.items
    .map(item => `<li>${item}</li>`)
    .join('');
});
 
// Change either state - only relevant effects run
prefs.theme = 'dark';           // Only first effect runs
data.items.push('Item 4');      // Only second effect runs
```
 
 
 
### Example 10: Realistic Dashboard Example
 
```javascript
// Dashboard state
const dashboard = state({
  stats: {
    users: 1250,
    revenue: 45780,
    orders: 328
  },
  period: 'today',
  loading: false
});
 
// Update stats display
effect(() => {
  Elements.update({
    userCount: { textContent: dashboard.stats.users.toLocaleString() },
    revenueAmount: { textContent: `$${dashboard.stats.revenue.toLocaleString()}` },
    orderCount: { textContent: dashboard.stats.orders }
  });
});
 
// Update period selector
effect(() => {
  Collections.ClassName.periodOption.forEach(option => {
    option.classList.toggle('active',
      option.dataset.period === dashboard.period
    );
  });
});
 
// Show loading state
effect(() => {
  Elements.update({
    dashboardContent: {
      style: { opacity: dashboard.loading ? 0.5 : 1 }
    },
    loadingSpinner: {
      style: { display: dashboard.loading ? 'block' : 'none' }
    }
  });
});
 
// Simulate data fetch
async function fetchStats(period) {
  dashboard.loading = true;
 
  const response = await fetch(`/api/stats?period=${period}`);
  const newStats = await response.json();
 
  dashboard.stats = newStats;
  dashboard.loading = false;
}
 
// Handle period change
Collections.ClassName.periodOption.on('click', (e) => {
  dashboard.period = e.target.dataset.period;
  fetchStats(dashboard.period);
});
```
 
 
 
## Deep Dive: Understanding State Behavior
 
### State is a Proxy, Not a Copy
 
```javascript
const original = { count: 0 };
const reactive = state(original);
 
// They're different objects
console.log(reactive === original); // false
 
// But changes to reactive don't affect original
reactive.count = 5;
console.log(original.count); // Still 0
 
// Reactive state wraps the data, doesn't modify it
```
 
**Key Takeaway:** State creates a new reactive wrapper around your data. The original object is preserved.
 
 
 
### State Makes Nested Objects Reactive Automatically
 
```javascript
const app = state({
  user: {
    profile: {
      name: 'Alice'
    }
  }
});
 
// Deep changes are tracked
effect(() => {
  console.log(app.user.profile.name);
});
 
app.user.profile.name = 'Bob'; // ✨ Effect runs
```
 
**What's happening?**
- When you access `app.user`, state wraps it in a proxy
- When you access `app.user.profile`, that gets wrapped too
- Every level of nesting is automatically reactive
- This is called **deep reactivity**
 
 
 
### State Doesn't Wrap Everything
 
Some objects are **not made reactive** for good reasons:
 
```javascript
const app = state({
  count: 0,
  element: document.getElementById('myButton'),  // DOM elements stay as-is
  date: new Date(),                              // Dates stay as-is
  regex: /test/,                                 // RegEx stays as-is
  promise: fetch('/api/data')                    // Promises stay as-is
});
 
// These work normally, not reactively
app.element.click();               // Regular DOM element
app.date.getTime();                // Regular Date object
```
 
**Why?**
Built-in objects like DOM elements, Dates, and Promises have special behavior that would break if wrapped in a Proxy. State is smart enough to leave them alone.
 
 
 
### Comparing State to Plain JavaScript
 
**Before (Plain JavaScript + Manual Updates):**
```javascript
// Plain object
const user = {
  name: 'Alice',
  age: 25
};
 
// Manual DOM updates everywhere
function updateProfile() {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userAge').textContent = user.age;
}
 
user.name = 'Bob';
updateProfile(); // Must remember this!
 
user.age = 26;
updateProfile(); // And this!
 
// In 10 different files...
updateProfile(); // Repetitive and error-prone
```
 
**After (Reactive State + DOM Helpers):**
```javascript
// Reactive state
const user = state({
  name: 'Alice',
  age: 25
});
 
// Automatic DOM updates
effect(() => {
  Elements.update({
    userName: { textContent: user.name },
    userAge: { textContent: user.age }
  });
});
 
user.name = 'Bob';  // ✨ DOM updates automatically
user.age = 26;      // ✨ DOM updates automatically
 
// Anywhere in your app
user.name = 'Charlie'; // ✨ Still works!
```
 
**Result:**
- 50% less code
- Zero manual update calls
- Impossible to forget updates
- Scales to any complexity
 
 
 
### Working with Arrays in State
 
```javascript
const todos = state({
  items: ['Task 1', 'Task 2']
});
 
// Array methods trigger reactivity
effect(() => {
  Elements.todoCount.textContent = todos.items.length;
});
 
todos.items.push('Task 3');        // ✨ Effect runs
todos.items[0] = 'Updated Task';   // ✨ Effect runs
todos.items.splice(1, 1);          // ✨ Effect runs
```
 
**For even better array handling**, use `collection()` which adds methods like `.add()`, `.remove()`, `.toggle()` specifically designed for reactive arrays.
 
 
 
### State with DOM Helpers: A Perfect Match
 
```javascript
// Counter with DOM Helpers
const counter = state({ count: 0 });
 
// Update multiple elements at once
effect(() => {
  Elements.update({
    counterDisplay: { textContent: counter.count },
    counterBadge: { textContent: counter.count },
    resetBtn: {
      style: { display: counter.count > 0 ? 'block' : 'none' }
    }
  });
});
 
// Or use Collections for multiple elements
effect(() => {
  Collections.ClassName.counter.update({
    textContent: counter.count
  });
});
 
// Update state from DOM Helpers events
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => {
      counter.count++;
    }]
  }
});
```
 
**Why This is Powerful:**
- **State** handles the data and reactivity
- **DOM Helpers** handles the DOM manipulation elegantly
- Together they feel like a lightweight framework
- But it's just JavaScript!
 
 
 
## Common Patterns
 
### Pattern 1: Toggle Booleans
 
```javascript
const ui = state({
  menuOpen: false,
  darkMode: false
});
 
// Toggle with simple negation
Elements.update({
  menuToggle: {
    addEventListener: ['click', () => {
      ui.menuOpen = !ui.menuOpen;
    }]
  },
  themeToggle: {
    addEventListener: ['click', () => {
      ui.darkMode = !ui.darkMode;
    }]
  }
});
```
 
 
 
### Pattern 2: Increment/Decrement
 
```javascript
const counter = state({ count: 0 });
 
Elements.update({
  increment: {
    addEventListener: ['click', () => {
      counter.count++;
    }]
  },
  decrement: {
    addEventListener: ['click', () => {
      counter.count--;
    }]
  },
  reset: {
    addEventListener: ['click', () => {
      counter.count = 0;
    }]
  }
});
```
 
 
 
### Pattern 3: Batch Multiple Updates
 
```javascript
const user = state({
  firstName: '',
  lastName: '',
  email: ''
});
 
// Update multiple properties at once
function updateUser(data) {
  user.firstName = data.firstName;
  user.lastName = data.lastName;
  user.email = data.email;
  // All effects run after all changes (batched automatically)
}
```
 
**Note:** For even better batching control, use `batch()` which we'll cover in its own documentation.
 
 
 
### Pattern 4: Reset to Initial State
 
```javascript
const initialState = {
  count: 0,
  name: '',
  items: []
};
 
const app = state({ ...initialState });
 
// Reset function
function reset() {
  Object.assign(app, initialState);
}
 
Elements.update({
  resetBtn: {
    addEventListener: ['click', reset]
  }
});
```
 
 
 
## Key Takeaways
 
✅ **`state()` makes objects reactive** - Changes are tracked automatically
✅ **Works with nested objects** - Deep reactivity out of the box
✅ **Looks like normal JavaScript** - No special syntax, just regular object access
✅ **Pairs perfectly with DOM Helpers** - State handles data, DOM Helpers handles UI
✅ **Foundation for everything else** - `effect()`, `computed()`, `watch()` all build on state
✅ **No manual updates needed** - Change the data, effects run automatically
 
 
 
## What's Next?

Now that you understand `state()`, you're ready for:

- **[effect()](../reactivity-function/effect.md)** - Make your UI react to state changes automatically
- **[computed()](../reactivity-function/computed.md)** - Create derived values that update automatically
- **[watch()](../reactivity-function/watch.md)** - Run code when specific properties change
- **[ref()](ref.md)** - Reactive wrapper for primitive values (numbers, strings, booleans)
- **[builder()](builder.md)** - Chainable API for creating and enhancing state

**Related Documentation:**
- [What is ReactivePlus?](what-is-ReactivePlus.md) - Understanding the reactive system
- [Essential Patterns](essential-patterns.md) - Common patterns and best practices
- [collection()](../reactivity-function/collection.md) - Enhanced arrays with reactive methods
 
 
 
## Summary
 
`state()` transforms regular JavaScript objects into reactive data sources. When you change a property, anything depending on that property automatically updates.
 
**The magic formula:**
```
state() + effect() + DOM Helpers = Feels like a framework, but it's just JavaScript
```
 
Think of `state()` as the **foundation**. Everything else in the reactive system builds on this simple concept: **make objects smart enough to notify when they change**.
