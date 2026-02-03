# Understanding `bindings()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to automatically sync state with DOM elements? Here's how:

```js
// Create reactive state
const user = state({
  name: 'John',
  email: 'john@example.com',
  isOnline: true
});

// Bind state to DOM elements using CSS selectors
bindings({
  '#userName': () => user.name,
  '#userEmail': () => user.email,
  '#status': () => user.isOnline ? 'Online' : 'Offline'
});

// Changes automatically update the DOM!
user.name = 'Jane';
// #userName element now displays "Jane"

user.isOnline = false;
// #status element now displays "Offline"
```

**That's it!** The `bindings()` function creates automatic connections between reactive state and DOM elements using CSS selectors.

 

## What is `bindings()`?

`bindings()` is a function that **creates automatic two-way connections between reactive state and DOM elements**. It uses CSS selectors to find elements and keeps them synchronized with your reactive data.

**The `bindings()` function:**
- Uses CSS selectors to target DOM elements
- Automatically updates elements when state changes
- Supports text content, properties, attributes, and styles
- Works with multiple elements via class selectors
- Returns a cleanup function to stop all bindings

Think of it as **wiring your state directly to your HTML** - you define which elements should display which data, and they automatically stay synchronized.

 

## Syntax

```js
// Using the full namespace
bindings(definitions)

// Or using ReactiveUtils namespace
ReactiveUtils.bindings(definitions)
```

**Parameters:**
- `definitions` - An object where:
  - Keys are CSS selectors (e.g., `'#id'`, `'.class'`, `'div'`)
  - Values are either:
    - Functions that return values to display
    - Strings (property names from state)
    - Objects for multiple property bindings

**Returns:**
- A cleanup function that stops all bindings when called

**Example:**
```js
const cleanup = bindings({
  '#display': () => counter.count,
  '.status': () => app.isActive ? 'Active' : 'Inactive'
});

// Later, stop all bindings
cleanup();
```

 

## Why Does This Exist?

### The Challenge with Plain JavaScript

In vanilla JavaScript, keeping DOM elements synchronized with data requires manual updates:

```javascript
// Plain JavaScript approach
let count = 0;
let userName = 'John';
let isOnline = false;

function updateUI() {
  // Manually find and update each element
  document.getElementById('count').textContent = count;
  document.getElementById('userName').textContent = userName;

  const statusElement = document.getElementById('status');
  statusElement.textContent = isOnline ? 'Online' : 'Offline';
  statusElement.className = isOnline ? 'online' : 'offline';

  // Update all elements with class 'user-name'
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = userName;
  });
}

// You must call updateUI after every change
count = 5;
updateUI(); // ❌ Easy to forget

userName = 'Jane';
updateUI(); // ❌ Repetitive

isOnline = true;
updateUI(); // ❌ Tedious
```

**Problems with this approach:**
❌ Manual DOM queries for every update
❌ Must remember to call update function after each change
❌ Repetitive querySelector/getElementById calls
❌ Must update all affected elements manually
❌ Easy to forget elements, causing UI desynchronization
❌ Code becomes scattered and hard to maintain

### What Situation Is This Designed For?

Applications need to display reactive data in the DOM:
- Showing user information in multiple places
- Displaying live counters and statistics
- Updating status indicators
- Reflecting form data in preview areas
- Synchronizing settings across UI elements
- Any scenario where DOM elements need to stay in sync with data

Manually coordinating all these DOM updates is tedious and error-prone. `bindings()` is designed specifically to automate this synchronization.

### How Does `bindings()` Help?

With `bindings()`, you declare once which elements should display which data:

```javascript
const app = state({
  count: 0,
  userName: 'John',
  isOnline: false
});

// Define bindings with CSS selectors
bindings({
  '#count': () => app.count,
  '#userName': () => app.userName,
  '.user-name': () => app.userName, // All matching elements
  '#status': () => app.isOnline ? 'Online' : 'Offline'
});

// Just change the data—DOM updates automatically! ✨
app.count = 5;        // #count updates automatically
app.userName = 'Jane'; // #userName and .user-name update
app.isOnline = true;   // #status updates automatically
```

**Benefits:**
✅ Automatic DOM synchronization
✅ CSS selectors for clean, familiar syntax
✅ No manual querySelector calls needed
✅ Impossible to forget to update elements
✅ Declarative, easy to understand
✅ Works with multiple elements at once

### When Does `bindings()` Shine?

This method is particularly well-suited when:
- You need to display reactive data in the DOM
- You want automatic UI updates without manual DOM manipulation
- You're working with existing HTML and want to add reactivity
- You need to update multiple elements with the same data
- You want clean, declarative data-to-DOM connections
- You're building progressive enhancement on top of HTML

 

## Mental Model

Think of `bindings()` like **power outlets connecting appliances**:

```
Manual DOM Updates (Unplugged):
┌─────────────┐
│  Data: 5    │ Your data
└─────────────┘
       │
       ▼
[Manual wiring needed]
       │
       ▼
┌─────────────┐
│  <div>5</div>│ ← You must manually update
└─────────────┘

❌ Change data → manually update DOM
❌ Forget once → UI out of sync

Reactive Bindings (Plugged In):
┌─────────────────┐
│  count: 5       │ Your data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  '#counter'     │ ← Binding (like a power cord)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  <div id="counter">5</div>│ DOM element
└─────────────────┘

✅ Change data → DOM updates automatically
✅ Always in sync
✅ No manual work needed
```

**Key Insight:** Just like plugging an appliance into an outlet provides automatic power, creating a binding provides automatic data flow from state to DOM. You set it up once, and it works continuously.

 

## How Does It Work?

### The Magic: Effects + Selectors

When you call `bindings()`, it creates effects for each selector:

```
bindings({
  '#counter': () => count.value
})
      │
      ▼
┌────────────────────────┐
│  For Each Selector:    │
│  1. Find elements      │
│  2. Create effect      │
│  3. Update on change   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Effect watches state  │
│  Updates DOM elements  │
└───────────┬────────────┘
            │
            ▼
When state changes:
  → Effect runs
  → Reads new value
  → Updates element
```

**Under the hood (simplified):**
```js
function bindings(defs) {
  const cleanups = [];

  Object.entries(defs).forEach(([selector, binding]) => {
    // Find elements
    const elements = document.querySelectorAll(selector);

    // Create effect for each binding
    const cleanup = effect(() => {
      const value = typeof binding === 'function' ? binding() : binding;

      elements.forEach(el => {
        el.textContent = value; // Simplified
      });
    });

    cleanups.push(cleanup);
  });

  return () => cleanups.forEach(c => c());
}
```

**What happens:**

1️⃣ You provide selectors and binding functions
2️⃣ `bindings()` finds all matching DOM elements
3️⃣ For each binding, it creates an effect
4️⃣ The effect reads reactive state and updates the element
5️⃣ When state changes, effects re-run and update the DOM

This is automatic and continuous until you call the cleanup function!

 

## Basic Usage

### Binding to ID Selectors

The most common pattern is binding to element IDs:

```js
const counter = state({
  count: 0
});

bindings({
  '#display': () => counter.count
});

// <div id="display">0</div> initially
// Updates automatically when counter.count changes

counter.count = 5;
// <div id="display">5</div>
```

### Binding to Class Selectors

Bind to all elements with a class:

```js
const user = state({
  name: 'John'
});

bindings({
  '.user-name': () => user.name
});

// <span class="user-name">John</span>
// <div class="user-name">John</div>
// <p class="user-name">John</p>
// All update simultaneously!

user.name = 'Jane';
// All three elements now show "Jane"
```

### Binding to Tag Selectors

Bind to all elements of a type:

```js
const config = state({
  appName: 'MyApp'
});

bindings({
  'title': () => config.appName
});

// <title>MyApp</title>

config.appName = 'AwesomeApp';
// <title>AwesomeApp</title>
```

 

## Binding to Text Content

### Simple Text Display

By default, bindings set `textContent`:

```js
const message = state({
  text: 'Hello World'
});

bindings({
  '#message': () => message.text
});

// <div id="message">Hello World</div>

message.text = 'Goodbye';
// <div id="message">Goodbye</div>
```

### Computed Text

Use functions to compute display values:

```js
const cart = state({
  items: 5,
  total: 99.99
});

bindings({
  '#itemCount': () => `${cart.items} items`,
  '#total': () => `$${cart.total.toFixed(2)}`,
  '#summary': () => `${cart.items} items - Total: $${cart.total.toFixed(2)}`
});

cart.items = 3;
cart.total = 75.50;
// All elements update automatically
```

### Conditional Text

```js
const user = state({
  isLoggedIn: false,
  name: ''
});

bindings({
  '#greeting': () => user.isLoggedIn ? `Welcome, ${user.name}!` : 'Please log in'
});

user.isLoggedIn = true;
user.name = 'John';
// <div id="greeting">Welcome, John!</div>
```

 

## Binding to Element Properties

### Binding to Specific Properties

Use an object to bind to specific properties:

```js
const form = state({
  email: '',
  isValid: false
});

bindings({
  '#emailInput': {
    value: () => form.email,
    disabled: () => !form.isValid
  }
});

// <input id="emailInput" value="" disabled>

form.email = 'john@example.com';
form.isValid = true;
// <input id="emailInput" value="john@example.com">
```

### Binding to className

```js
const app = state({
  theme: 'light',
  isLoading: false
});

bindings({
  'body': {
    className: () => `theme-${app.theme} ${app.isLoading ? 'loading' : ''}`
  }
});

app.theme = 'dark';
app.isLoading = true;
// <body class="theme-dark loading">
```

### Binding to Styles

```js
const slider = state({
  value: 50
});

bindings({
  '#progress': {
    style: () => ({ width: `${slider.value}%` })
  }
});

slider.value = 75;
// <div id="progress" style="width: 75%;">
```

 

## Binding with Functions

### Dynamic Calculations

```js
const rect = state({
  width: 100,
  height: 50
});

bindings({
  '#area': () => rect.width * rect.height,
  '#perimeter': () => 2 * (rect.width + rect.height),
  '#aspectRatio': () => (rect.width / rect.height).toFixed(2)
});

rect.width = 200;
// All three elements update with new calculations
```

### Conditional Logic

```js
const account = state({
  balance: 100
});

bindings({
  '#status': () => {
    if (account.balance > 1000) return 'Premium';
    if (account.balance > 100) return 'Standard';
    return 'Basic';
  },

  '#statusClass': {
    className: () => {
      if (account.balance > 1000) return 'status-premium';
      if (account.balance > 100) return 'status-standard';
      return 'status-basic';
    }
  }
});
```

### Using Multiple State Objects

```js
const user = state({ name: 'John' });
const settings = state({ showFullName: true });

bindings({
  '#display': () => settings.showFullName ? user.name : user.name.charAt(0)
});

// Depends on both user.name AND settings.showFullName
```

 

## Multiple Bindings Per Element

### Binding Multiple Properties

```js
const input = state({
  value: '',
  placeholder: 'Enter text',
  isDisabled: false,
  maxLength: 100
});

bindings({
  '#myInput': {
    value: () => input.value,
    placeholder: () => input.placeholder,
    disabled: () => input.isDisabled,
    maxLength: () => input.maxLength
  }
});

input.placeholder = 'Type something...';
input.maxLength = 50;
// Element updates both properties
```

### Combining Text and Properties

```js
const button = state({
  text: 'Click Me',
  isDisabled: false,
  count: 0
});

bindings({
  '#actionButton': {
    textContent: () => `${button.text} (${button.count})`,
    disabled: () => button.isDisabled,
    className: () => button.isDisabled ? 'btn-disabled' : 'btn-active'
  }
});

button.count = 5;
button.text = 'Submit';
// <button id="actionButton" class="btn-active">Submit (5)</button>
```

 

## Selector Types

### ID Selectors (`#id`)

Most specific, fastest:

```js
bindings({
  '#header': () => app.title,
  '#footer': () => app.copyright
});
```

### Class Selectors (`.class`)

Update all matching elements:

```js
bindings({
  '.price': () => `$${product.price}`,
  '.discount': () => `${product.discount}%`
});

// Updates all elements with class="price"
// Updates all elements with class="discount"
```

### Tag Selectors (`tag`)

Update all elements of a type:

```js
bindings({
  'h1': () => site.title,
  'footer': () => site.footerText
});
```

### Complex Selectors

Use any valid CSS selector:

```js
bindings({
  'div.user > span.name': () => user.name,
  '[data-role="admin"]': () => user.isAdmin ? 'visible' : 'hidden',
  'nav ul li:first-child': () => menu.firstItem
});
```

 

## Real-World Examples

### Example 1: User Profile Card

```js
const user = state({
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'avatar.jpg',
  isOnline: true,
  lastSeen: new Date(),
  postsCount: 42,
  followersCount: 150
});

bindings({
  '#userName': () => user.name,
  '#userEmail': () => user.email,
  '#userAvatar': {
    src: () => user.avatar,
    alt: () => `${user.name}'s avatar`
  },
  '#onlineStatus': () => user.isOnline ? '🟢 Online' : '🔴 Offline',
  '.status-dot': {
    className: () => user.isOnline ? 'online' : 'offline'
  },
  '#lastSeen': () => user.isOnline
    ? 'Online now'
    : `Last seen: ${user.lastSeen.toLocaleString()}`,
  '#postsCount': () => user.postsCount.toLocaleString(),
  '#followersCount': () => user.followersCount.toLocaleString()
});

// Update user data
user.isOnline = false;
user.postsCount = 45;
// UI automatically updates
```

### Example 2: Shopping Cart

```js
const cart = state({
  items: [
    { id: 1, name: 'Laptop', price: 999, quantity: 1 },
    { id: 2, name: 'Mouse', price: 25, quantity: 2 }
  ],
  discountCode: '',
  taxRate: 0.1
});

// Add computed properties
computed(cart, {
  subtotal() {
    return this.items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    );
  },
  discount() {
    return this.discountCode === 'SAVE10' ? this.subtotal * 0.1 : 0;
  },
  tax() {
    return (this.subtotal - this.discount) * this.taxRate;
  },
  total() {
    return this.subtotal - this.discount + this.tax;
  }
});

bindings({
  '#itemCount': () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
  '#subtotal': () => `$${cart.subtotal.toFixed(2)}`,
  '#discount': () => cart.discount > 0
    ? `-$${cart.discount.toFixed(2)}`
    : '$0.00',
  '#tax': () => `$${cart.tax.toFixed(2)}`,
  '#total': () => `$${cart.total.toFixed(2)}`,
  '#emptyMessage': {
    style: () => ({ display: cart.items.length === 0 ? 'block' : 'none' })
  }
});

// Add item
cart.items.push({ id: 3, name: 'Keyboard', price: 75, quantity: 1 });
// All displays update automatically
```

### Example 3: Live Dashboard

```js
const dashboard = state({
  visitors: 0,
  pageViews: 0,
  avgSessionTime: 0,
  bounceRate: 0,
  topPage: '/home',
  lastUpdate: new Date()
});

bindings({
  '#visitors': () => dashboard.visitors.toLocaleString(),
  '#pageViews': () => dashboard.pageViews.toLocaleString(),
  '#sessionTime': () => `${dashboard.avgSessionTime}s`,
  '#bounceRate': () => `${dashboard.bounceRate.toFixed(1)}%`,
  '#bounceRateClass': {
    className: () => {
      if (dashboard.bounceRate < 40) return 'metric excellent';
      if (dashboard.bounceRate < 60) return 'metric good';
      return 'metric poor';
    }
  },
  '#topPage': () => dashboard.topPage,
  '#lastUpdate': () => dashboard.lastUpdate.toLocaleTimeString(),
  '.trend-indicator': () => {
    const growth = ((dashboard.pageViews / dashboard.visitors) - 1) * 100;
    return growth > 0 ? `📈 +${growth.toFixed(1)}%` : `📉 ${growth.toFixed(1)}%`;
  }
});

// Simulate live updates
setInterval(() => {
  dashboard.visitors += Math.floor(Math.random() * 10);
  dashboard.pageViews += Math.floor(Math.random() * 20);
  dashboard.avgSessionTime = Math.floor(Math.random() * 300);
  dashboard.bounceRate = 30 + Math.random() * 40;
  dashboard.lastUpdate = new Date();
}, 2000);
```

### Example 4: Form with Live Preview

```js
const form = state({
  title: '',
  description: '',
  category: 'general',
  tags: [],
  isPublished: false
});

bindings({
  // Live preview
  '#previewTitle': () => form.title || '(No title)',
  '#previewDescription': () => form.description || '(No description)',
  '#previewCategory': () => form.category.toUpperCase(),
  '#previewTags': () => form.tags.join(', ') || '(No tags)',
  '#previewStatus': () => form.isPublished ? '✅ Published' : '📝 Draft',

  // Form validation indicators
  '#titleCounter': () => `${form.title.length}/100`,
  '#titleWarning': {
    style: () => ({
      display: form.title.length > 80 ? 'block' : 'none'
    })
  },
  '#descCounter': () => `${form.description.length}/500`,

  // Submit button
  '#submitButton': {
    disabled: () => !form.title || !form.description,
    textContent: () => form.isPublished ? 'Update' : 'Publish'
  }
});

// User types in form
form.title = 'My Blog Post';
form.description = 'This is an interesting article about reactive programming.';
// Preview updates in real-time
```

### Example 5: Settings Panel

```js
const settings = state({
  theme: 'light',
  fontSize: 14,
  notifications: true,
  autoSave: true,
  language: 'en'
});

bindings({
  // Apply settings
  'body': {
    className: () => `theme-${settings.theme} font-${settings.fontSize}`
  },

  // Setting displays
  '#themeDisplay': () => settings.theme === 'light' ? '☀️ Light' : '🌙 Dark',
  '#fontSizeDisplay': () => `${settings.fontSize}px`,
  '#notificationStatus': () => settings.notifications ? 'Enabled' : 'Disabled',
  '#autoSaveStatus': () => settings.autoSave ? 'On' : 'Off',
  '#languageDisplay': () => settings.language.toUpperCase(),

  // Toggle buttons
  '#themeToggle': {
    textContent: () => settings.theme === 'light'
      ? 'Switch to Dark'
      : 'Switch to Light'
  },
  '#notificationToggle': {
    className: () => settings.notifications ? 'toggle-on' : 'toggle-off'
  },

  // Preview message
  '#settingsPreview': () =>
    `Your ${settings.theme} theme with ${settings.fontSize}px font is active.`
});

// Change settings
settings.theme = 'dark';
settings.fontSize = 16;
// Entire UI updates automatically
```

 

## Common Pitfalls

### Pitfall #1: Elements Not Found

❌ **Wrong:**
```js
bindings({
  '#myElement': () => state.value
});

// But #myElement doesn't exist in DOM yet
// Binding silently fails
```

✅ **Correct:**
```js
// Make sure DOM elements exist first
document.addEventListener('DOMContentLoaded', () => {
  bindings({
    '#myElement': () => state.value
  });
});

// Or check if element exists
if (document.getElementById('myElement')) {
  bindings({
    '#myElement': () => state.value
  });
}
```

**What's happening:**
- Bindings need elements to exist in the DOM
- Create bindings after DOM is ready
- Or use conditional checks

 

### Pitfall #2: Forgetting to Return Values in Functions

❌ **Wrong:**
```js
bindings({
  '#display': () => {
    state.count * 2; // Missing return!
  }
});

// Element shows "undefined"
```

✅ **Correct:**
```js
bindings({
  '#display': () => {
    return state.count * 2; // Return the value
  }
});

// Or use arrow function shorthand
bindings({
  '#display': () => state.count * 2
});
```

**What's happening:**
- Binding functions must return values
- Without return, the function returns undefined
- Use arrow function shorthand for simple returns

 

### Pitfall #3: Not Cleaning Up Bindings

❌ **Wrong:**
```js
function createWidget() {
  const state = ReactiveUtils.state({ value: 0 });

  bindings({
    '.widget': () => state.value
  });

  return state;
}

// Create many widgets
for (let i = 0; i < 100; i++) {
  createWidget();
}
// ❌ Memory leak: all bindings still active!
```

✅ **Correct:**
```js
function createWidget() {
  const state = ReactiveUtils.state({ value: 0 });

  const cleanup = bindings({
    '.widget': () => state.value
  });

  return {
    state,
    destroy: cleanup
  };
}

// Create and properly destroy
const widgets = [];
for (let i = 0; i < 100; i++) {
  widgets.push(createWidget());
}

// Later, clean up
widgets.forEach(widget => widget.destroy());
```

**What's happening:**
- Always save and call the cleanup function
- This stops the effects and prevents memory leaks
- Essential for dynamic content

 

### Pitfall #4: Expensive Computations in Bindings

❌ **Wrong:**
```js
const data = state({
  numbers: Array.from({ length: 100000 }, (_, i) => i)
});

bindings({
  '#result': () => {
    // ❌ Expensive calculation runs on every change
    return data.numbers.reduce((sum, n) => sum + n, 0);
  }
});
```

✅ **Correct:**
```js
const data = state({
  numbers: Array.from({ length: 100000 }, (_, i) => i)
});

// Use computed for expensive calculations (cached)
computed(data, {
  sum() {
    return this.numbers.reduce((sum, n) => sum + n, 0);
  }
});

bindings({
  '#result': () => data.sum // Use cached computed value
});
```

**What's happening:**
- Bindings create effects that run frequently
- Heavy computations should be in computed properties
- Computed properties are cached and only recalculate when needed

 

### Pitfall #5: Trying to Bind to Non-String Values Incorrectly

❌ **Wrong:**
```js
const data = state({
  items: [1, 2, 3]
});

bindings({
  '#list': () => data.items // Shows "[object Object]" or similar
});
```

✅ **Correct:**
```js
const data = state({
  items: [1, 2, 3]
});

bindings({
  '#list': () => data.items.join(', ') // Convert to string
});

// Or create proper HTML
bindings({
  '#list': {
    innerHTML: () => data.items.map(item => `<li>${item}</li>`).join('')
  }
});
```

**What's happening:**
- Text bindings need string values
- Convert arrays/objects to strings
- Or use innerHTML for HTML content

 

## Summary

**What is `bindings()`?**

`bindings()` creates automatic connections between reactive state and DOM elements using CSS selectors, keeping them synchronized without manual updates.

 

**Why use `bindings()` instead of manual DOM updates?**

- Automatic synchronization
- CSS selectors for familiar, clean syntax
- No manual querySelector/getElementById calls
- Declarative data-to-DOM connections
- Updates multiple elements at once
- Impossible to forget to update UI

 

**Key Points to Remember:**

1️⃣ **Uses CSS selectors** - `#id`, `.class`, `tag`, or complex selectors

2️⃣ **Automatic updates** - DOM stays synchronized with state

3️⃣ **Multiple bindings** - Can bind text, properties, styles, and attributes

4️⃣ **Returns cleanup** - Always save and call it when done

5️⃣ **Elements must exist** - Create bindings after DOM is ready

6️⃣ **Functions must return** - Binding functions need to return values

7️⃣ **Use computed for heavy calculations** - Keep bindings fast and simple

 

**Mental Model:** Think of `bindings()` like **power outlets** - they provide automatic, continuous flow from state to DOM. Plug them in once, and they keep everything synchronized.

 

**Quick Reference:**

```js
// Create state
const app = state({
  title: 'MyApp',
  count: 0,
  isActive: true
});

// Create bindings
const cleanup = bindings({
  // Simple text
  '#title': () => app.title,

  // Computed text
  '#count': () => `Count: ${app.count}`,

  // Multiple properties
  '#status': {
    textContent: () => app.isActive ? 'Active' : 'Inactive',
    className: () => app.isActive ? 'active' : 'inactive'
  },

  // All elements with class
  '.app-name': () => app.title
});

// Changes automatically update DOM
app.title = 'AwesomeApp';
app.count = 5;

// Clean up when done
cleanup();
```

 

**Remember:** `bindings()` is your tool for automatic state-to-DOM synchronization. It eliminates manual DOM updates and keeps your UI perfectly synchronized with your reactive data! ✨
