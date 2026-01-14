# Understanding `builder.bind(defs)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to automatically sync state with DOM elements? Use `builder.bind()`:

```js
// HTML:
// <div id="counter"></div>
// <div id="message"></div>

// Create a reactive builder with DOM bindings
const app = reactive({ count: 0, message: 'Hello' })
  .bind({
    '#counter': 'count',        // Bind #counter to count
    '#message': 'message'        // Bind #message to message
  })
  .build();

// Elements automatically show initial values:
// #counter: "0"
// #message: "Hello"

// Update state - DOM updates automatically
app.count = 5;        // #counter shows "5"
app.message = 'Hi';   // #message shows "Hi"
```

**That's it!** `builder.bind()` creates automatic DOM bindings and returns the builder for chaining!

 

## What is `builder.bind()`?

`builder.bind()` is a **builder method** that creates **automatic DOM bindings** between your reactive state and HTML elements. When state changes, the bound elements update automatically.

**A DOM binding:**
- Connects a CSS selector to a state property
- Updates the element's `textContent` automatically
- Can bind to property values or computed functions
- Can bind multiple properties to the same element
- Works with any valid CSS selector

Think of it as **automatic UI synchronization** - you declare once how state maps to DOM, and updates happen automatically forever.

 

## Syntax

```js
// Add DOM bindings to a builder
builder.bind(definitions)

// Full example
reactive({ count: 0 })
  .bind({
    '#counter': 'count'  // selector: propertyName or function
  })
  .build()
```

**Parameters:**
- `definitions` - An object where:
  - **Keys** are CSS selectors (e.g., `#id`, `.class`, `[attr]`)
  - **Values** can be:
    - Property names (string)
    - Functions that return values
    - Objects mapping element properties to state

**Returns:**
- The builder (for method chaining)

**Important:**
- DOM elements must exist when `.bind()` is called
- Bindings create effects automatically
- The builder is returned, so you can chain more methods
- Uses `ReactiveUtils.set()` internally with bindings

 

## Why Does This Exist?

### The Problem with Manual DOM Updates

Let's say you want to display reactive state in the DOM:

```javascript
// Create reactive state
const app = state({ count: 0 });

// Manually update DOM with an effect
effect(() => {
  document.getElementById('counter').textContent = app.count;
});

// This works, but...
app.count = 5; // DOM updates, but you wrote boilerplate code
```

For multiple bindings, this becomes repetitive:

**What's the Real Issue?**

```
Manual DOM Binding:
┌─────────────────┐
│ Create state    │
│  count: 0       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Write effect    │ ← Boilerplate
│ querySelector   │ ← Repetitive
│ set textContent │ ← Manual
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Another binding │ ← Repeat for
│ Write effect    │ ← each element
│ querySelector   │ ← tedious!
│ set textContent │
└─────────────────┘
    Lots of code!
    Easy to forget!
```

**Problems:**
❌ Repetitive `effect()` calls for each binding
❌ Manual DOM queries scattered everywhere
❌ Easy to forget to bind some elements
❌ Hard to see what's connected to what
❌ More code = more bugs

### The Solution with `builder.bind()`

When you use `builder.bind()`, you declare bindings upfront:

```javascript
// Create builder with DOM bindings
const app = reactive({ count: 0, message: 'Hello' })
  .bind({
    '#counter': 'count',
    '#message': 'message'
  })
  .build();

// DOM automatically shows values:
// #counter: "0"
// #message: "Hello"

// Update state - DOM updates automatically
app.count = 5;
app.message = 'Hi';
// #counter: "5"
// #message: "Hi"
```

**What Just Happened?**

```
Automatic Binding Pattern:
┌──────────────────────┐
│ reactive()           │
│  count: 0            │
│  message: 'Hello'    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ .bind()              │
│  #counter: count     │ ← Declare once
│  #message: message   │ ← Clear mapping
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Auto-creates effects │ ← Automatic
│ Queries DOM          │ ← Automatic
│ Sets up sync         │ ← Automatic
└──────────┬───────────┘
           │
           ▼
    Everything connected!
    Clean, declarative!
```

With `builder.bind()`:
- Declare all bindings in one place
- Clear mapping of state → DOM
- Automatic effect creation
- Automatic DOM queries
- Less code, fewer bugs
- Easy to maintain

**Benefits:**
✅ Declarative binding syntax
✅ Automatic DOM synchronization
✅ Less boilerplate code
✅ Clear state → UI mapping
✅ Chainable with other builder methods
✅ Easy to see all connections

 

## Mental Model

Think of `builder.bind()` like **a control panel with labeled lights**:

```
Manual Wiring (Electrician):
┌─────────────────────┐
│  Power Source       │
│  (State)            │
└─────────────────────┘
         │
         │ You must wire each light:
         │
         ├→ Wire to Light 1
         │  - Run cable
         │  - Connect terminals
         │  - Test connection
         │
         ├→ Wire to Light 2
         │  - Run cable
         │  - Connect terminals
         │  - Test connection
         │
         └→ Wire to Light 3
            Manual work!
            Error-prone!

Pre-Wired Control Panel (Plug & Play):
┌─────────────────────────┐
│  Control Panel          │
│  (Builder with .bind()) │
│                         │
│  Power    →  [Light 1]  │ ← Labeled
│  (count)  →  [Light 2]  │ ← Pre-wired
│  (message)→  [Light 3]  │ ← Automatic
└─────────────────────────┘
         │
         ▼
  Everything connected!
  Just plug in state!
```

**Key Insight:** Just like a pre-wired control panel where each switch is already connected to its light, `builder.bind()` pre-wires your state to DOM elements. You declare the connections, and everything works automatically!

 

## How Does It Work?

### The Magic: Declarative DOM Bindings

When you call `builder.bind()`, here's what happens behind the scenes:

```javascript
// What you write:
const app = reactive({ count: 0 })
  .bind({
    '#counter': 'count'
  })
  .build();

// What actually happens (simplified):
// 1. Builder receives binding definitions
builder.bind({
  '#counter': 'count'
});

// 2. For each binding:
const element = document.querySelector('#counter');

// 3. Create an effect that updates the element
effect(() => {
  element.textContent = state.count;
});

// 4. Effect runs immediately (sets initial value)
// 5. Effect re-runs whenever count changes
// 6. Cleanup stored for destroy()

// 7. Return builder for chaining
return builder;
```

**In other words:** `builder.bind()`:
1. Takes your binding definitions
2. Queries the DOM for each selector
3. Creates effects that update each element
4. Effects run immediately (initial values)
5. Effects re-run when dependencies change
6. Stores cleanup functions
7. Returns the builder for chaining

### Under the Hood

```
.bind({ '#counter': 'count' })
        │
        ▼
┌───────────────────────┐
│  Parse Definitions    │
│  #counter → count     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Query DOM            │
│  document.querySelector│
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Create Effect        │
│  el.textContent = val │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Effect Runs          │
│  Sets initial value   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Store Cleanup        │
│  (for destroy)        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return Builder       │
│  (for chaining)       │
└───────────────────────┘
```

**What happens when state changes:**

1️⃣ You **write** to state: `app.count = 5`
2️⃣ Reactive system **detects change**
3️⃣ Binding **effect re-runs**
4️⃣ Effect **updates DOM element**: `element.textContent = 5`
5️⃣ **DOM synchronized** automatically

 

## Basic Usage

### Simple Property Binding

The simplest way to use `builder.bind()`:

```js
// HTML: <div id="counter"></div>

const builder = reactive({ count: 0 });

builder.bind({
  '#counter': 'count'
});

const counter = builder.build();

// DOM shows: 0

counter.count = 5;
// DOM shows: 5
```

### Multiple Property Bindings

Bind multiple elements in one call:

```js
// HTML:
// <div id="username"></div>
// <div id="email"></div>
// <div id="age"></div>

const user = reactive({ name: 'John', email: 'john@example.com', age: 25 })
  .bind({
    '#username': 'name',
    '#email': 'email',
    '#age': 'age'
  })
  .build();

// DOM shows:
// #username: "John"
// #email: "john@example.com"
// #age: "25"

user.name = 'Jane';
// #username: "Jane"
```

### Function Binding (Computed Display)

Bind to a function for computed values:

```js
// HTML: <div id="fullName"></div>

const user = reactive({ firstName: 'John', lastName: 'Doe' })
  .bind({
    '#fullName': function() {
      return this.state.firstName + ' ' + this.state.lastName;
    }
  })
  .build();

// DOM shows: "John Doe"

user.firstName = 'Jane';
// DOM shows: "Jane Doe"
```

 

## Binding Patterns

### Pattern 1: ID Selectors

```js
// HTML: <div id="message"></div>

reactive({ text: 'Hello World' })
  .bind({
    '#message': 'text'
  })
  .build();
```

### Pattern 2: Class Selectors (Multiple Elements)

```js
// HTML:
// <div class="counter"></div>
// <div class="counter"></div>

reactive({ count: 0 })
  .bind({
    '.counter': 'count'  // Binds to ALL .counter elements
  })
  .build();
```

### Pattern 3: Attribute Selectors

```js
// HTML: <div data-display="count"></div>

reactive({ count: 0 })
  .bind({
    '[data-display="count"]': 'count'
  })
  .build();
```

### Pattern 4: Multiple Properties on Same Element

```js
// HTML: <div id="display"></div>

reactive({ count: 0, name: 'Counter' })
  .bind({
    '#display': {
      textContent: 'count',
      title: 'name'
    }
  })
  .build();

// <div id="display" title="Counter">0</div>
```

### Pattern 5: Computed Functions

```js
reactive({ count: 0 })
  .bind({
    '#doubled': function() {
      return this.state.count * 2;
    },
    '#status': function() {
      return this.state.count > 5 ? 'High' : 'Low';
    }
  })
  .build();
```

 

## Advanced Binding Examples

### Example 1: Conditional Display

```js
// HTML:
// <div id="count"></div>
// <div id="status"></div>

const counter = reactive({ value: 0 })
  .bind({
    '#count': 'value',
    '#status': function() {
      if (this.state.value === 0) return 'Zero';
      if (this.state.value > 0) return 'Positive';
      return 'Negative';
    }
  })
  .build();

counter.value = 5;
// #count: "5"
// #status: "Positive"
```

### Example 2: Formatted Values

```js
// HTML:
// <div id="price"></div>
// <div id="date"></div>

const app = reactive({ price: 29.99, timestamp: Date.now() })
  .bind({
    '#price': function() {
      return '$' + this.state.price.toFixed(2);
    },
    '#date': function() {
      return new Date(this.state.timestamp).toLocaleDateString();
    }
  })
  .build();

// #price: "$29.99"
// #date: "1/2/2026"
```

### Example 3: List Display

```js
// HTML: <div id="items"></div>

const app = reactive({ items: ['Apple', 'Banana', 'Cherry'] })
  .bind({
    '#items': function() {
      return this.state.items.join(', ');
    }
  })
  .build();

// #items: "Apple, Banana, Cherry"

app.items.push('Date');
// #items: "Apple, Banana, Cherry, Date"
```

### Example 4: Multiple Element Properties

```js
// HTML: <div id="box"></div>

const app = reactive({ width: 100, color: 'blue' })
  .bind({
    '#box': {
      textContent: function() {
        return this.state.width + 'px';
      },
      style: function() {
        return {
          width: this.state.width + 'px',
          height: this.state.width + 'px',
          backgroundColor: this.state.color
        };
      }
    }
  })
  .build();

app.width = 200;
app.color = 'red';
// Box resizes and changes color
```

### Example 5: Computed from Computed

```js
const app = reactive({ count: 5 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .bind({
    '#count': 'count',
    '#doubled': 'doubled',
    '#quadrupled': function() {
      return this.state.doubled * 2;
    }
  })
  .build();

// #count: "5"
// #doubled: "10"
// #quadrupled: "20"
```

 

## Chaining with Other Methods

### Combining with Computed

```js
const app = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .bind({
    '#count': 'count',
    '#doubled': 'doubled'
  })
  .build();

app.count = 5;
// #count: "5"
// #doubled: "10"
```

### Combining with Actions

```js
// HTML:
// <div id="count"></div>
// <button id="inc">+</button>

const counter = reactive({ count: 0 })
  .bind({
    '#count': 'count'
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

document.getElementById('inc').onclick = () => {
  counter.increment();
};
// Clicking button updates DOM automatically
```

### Full Chain Example

```js
// HTML:
// <div id="count"></div>
// <div id="doubled"></div>
// <div id="status"></div>

const app = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .bind({
    '#count': 'count',
    '#doubled': 'doubled',
    '#status': function() {
      return this.state.count > 5 ? 'High' : 'Low';
    }
  })
  .watch({
    count(newVal) {
      if (newVal > 10) {
        console.warn('Count very high!');
      }
    }
  })
  .action('increment', (state) => state.count++)
  .action('reset', (state) => state.count = 0)
  .build();

app.increment();
// DOM updates automatically
```

 

## Common Patterns

### Pattern: Form Display Sync

```js
// HTML:
// <input id="nameInput" type="text">
// <div id="nameDisplay"></div>

const form = reactive({ name: '' })
  .bind({
    '#nameDisplay': 'name'
  })
  .build();

document.getElementById('nameInput').addEventListener('input', (e) => {
  form.name = e.target.value;
});
// As user types, display updates automatically
```

### Pattern: Dashboard with Live Data

```js
// HTML:
// <div id="temp"></div>
// <div id="humidity"></div>
// <div id="status"></div>

const dashboard = reactive({ temp: 20, humidity: 45 })
  .bind({
    '#temp': function() {
      return this.state.temp + '°C';
    },
    '#humidity': function() {
      return this.state.humidity + '%';
    },
    '#status': function() {
      if (this.state.temp > 25 && this.state.humidity > 60) {
        return 'Hot & Humid';
      }
      return 'Comfortable';
    }
  })
  .build();

// Update from API
setInterval(() => {
  dashboard.temp = Math.round(Math.random() * 30);
  dashboard.humidity = Math.round(Math.random() * 100);
}, 5000);
// Dashboard updates automatically
```

### Pattern: Shopping Cart Display

```js
// HTML:
// <div id="itemCount"></div>
// <div id="total"></div>

const cart = reactive({ items: [], itemPrice: 10 })
  .bind({
    '#itemCount': function() {
      return this.state.items.length + ' items';
    },
    '#total': function() {
      return '$' + (this.state.items.length * this.state.itemPrice).toFixed(2);
    }
  })
  .build();

cart.items.push({ id: 1, name: 'Product 1' });
// #itemCount: "1 items"
// #total: "$10.00"
```

### Pattern: Status Indicators

```js
// HTML:
// <div id="indicator"></div>

const app = reactive({ isOnline: true, errorCount: 0 })
  .bind({
    '#indicator': {
      textContent: function() {
        if (!this.state.isOnline) return 'Offline';
        if (this.state.errorCount > 0) return 'Errors';
        return 'Online';
      },
      className: function() {
        if (!this.state.isOnline) return 'status-offline';
        if (this.state.errorCount > 0) return 'status-error';
        return 'status-online';
      }
    }
  })
  .build();

app.isOnline = false;
// <div id="indicator" class="status-offline">Offline</div>
```

 

## Common Pitfalls

### Pitfall #1: Element Not Found

❌ **Wrong:**
```js
// Element doesn't exist yet
reactive({ count: 0 })
  .bind({
    '#counter': 'count'  // Fails silently if element not found
  })
  .build();

// Later in HTML:
// <div id="counter"></div>
```

The binding fails if the element doesn't exist when `.bind()` is called.

✅ **Correct:**
```js
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  reactive({ count: 0 })
    .bind({
      '#counter': 'count'
    })
    .build();
});

// Or place script at end of body
```

 

### Pitfall #2: Wrong Selector Syntax

❌ **Wrong:**
```js
// HTML: <div id="counter"></div>

reactive({ count: 0 })
  .bind({
    'counter': 'count'  // Missing # for ID
  })
  .build();
```

Without `#`, it looks for a `<counter>` tag, not an ID.

✅ **Correct:**
```js
reactive({ count: 0 })
  .bind({
    '#counter': 'count'  // Correct # for ID
  })
  .build();
```

 

### Pitfall #3: Binding to Non-Existent Property

❌ **Wrong:**
```js
reactive({ count: 0 })
  .bind({
    '#display': 'number'  // 'number' doesn't exist
  })
  .build();
```

This displays `undefined` because the property doesn't exist.

✅ **Correct:**
```js
reactive({ count: 0 })
  .bind({
    '#display': 'count'  // Use existing property
  })
  .build();
```

 

### Pitfall #4: Arrow Functions Losing this

❌ **Wrong:**
```js
reactive({ count: 0 })
  .bind({
    '#doubled': () => this.state.count * 2  // 'this' is wrong!
  })
  .build();
```

✅ **Correct:**
```js
reactive({ count: 0 })
  .bind({
    '#doubled': function() {
      return this.state.count * 2;  // Regular function works!
    }
  })
  .build();
```

 

### Pitfall #5: Forgetting Multiple Bindings Apply to All Matches

⚠️ **Unexpected Behavior:**
```js
// HTML:
// <div class="display"></div>
// <div class="display"></div>
// <div class="display"></div>

reactive({ count: 0 })
  .bind({
    '.display': 'count'  // Binds to ALL three elements
  })
  .build();
```

Class selectors bind to **all** matching elements, not just the first.

✅ **This is actually correct!** Just be aware that all matching elements will show the same value.

 

## Summary

**What is `builder.bind()`?**

`builder.bind()` is a **builder method** that creates automatic DOM bindings between reactive state and HTML elements. Changes to state automatically update the bound elements.

 

**Why use `builder.bind()`?**

- Automatic DOM synchronization
- Declarative binding syntax
- Less boilerplate code
- Clear state → UI mapping
- Chainable with other builder methods

 

**Key Points to Remember:**

1️⃣ **Elements must exist** - DOM must be ready when binding
2️⃣ **Use correct selectors** - `#id`, `.class`, `[attr]`, etc.
3️⃣ **Property or function** - Bind to property names or functions
4️⃣ **Regular functions** - Not arrow functions (for `this` binding)
5️⃣ **Returns builder** - Chain with other methods

 

**Mental Model:** Think of `builder.bind()` as a **pre-wired control panel** - you declare which state connects to which elements, and the system automatically keeps everything synchronized!

 

**Quick Reference:**

```js
// SIMPLE BINDING
reactive({ count: 0 })
  .bind({ '#counter': 'count' })
  .build();

// MULTIPLE BINDINGS
reactive({ name: 'John', age: 25 })
  .bind({
    '#name': 'name',
    '#age': 'age'
  })
  .build();

// FUNCTION BINDING
reactive({ firstName: 'John', lastName: 'Doe' })
  .bind({
    '#fullName': function() {
      return this.state.firstName + ' ' + this.state.lastName;
    }
  })
  .build();

// MULTIPLE PROPERTIES ON ELEMENT
reactive({ count: 0 })
  .bind({
    '#display': {
      textContent: 'count',
      title: function() {
        return 'Count: ' + this.state.count;
      }
    }
  })
  .build();

// CHAIN WITH OTHER METHODS
reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .bind({
    '#count': 'count',
    '#doubled': 'doubled'
  })
  .action('inc', (state) => state.count++)
  .build();
```

 

**Remember:** `builder.bind()` gives you declarative DOM bindings that automatically keep your UI synchronized with your reactive state. Declare once, and it works forever!
