# Understanding `batch()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to update multiple reactive properties without triggering effects repeatedly? Here's how:

```js
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  age: 25
});

effect(() => {
  console.log(`${user.firstName} ${user.lastName}, age ${user.age}`);
});
// Logs: "John Doe, age 25"

// ❌ Without batch - effect runs 3 times
user.firstName = 'Jane';  // Logs: "Jane Doe, age 25"
user.lastName = 'Smith';  // Logs: "Jane Smith, age 25"
user.age = 30;            // Logs: "Jane Smith, age 30"

// ✅ With batch - effect runs once
batch(() => {
  user.firstName = 'Bob';
  user.lastName = 'Johnson';
  user.age = 35;
});
// Logs only once: "Bob Johnson, age 35"
```

**That's it!** The `batch()` function groups multiple state updates together so effects only run once at the end!

 

## What is `batch()`?

`batch()` is a **performance optimization function** that groups multiple state updates together. Instead of triggering effects, watchers, and computed properties after each individual change, it waits until all changes are complete and then triggers them once.

**Batching:**
- Defers effect execution during updates
- Runs all effects once after all changes complete
- Prevents unnecessary re-renders and re-computations
- Improves performance for bulk updates

Think of it as **bundling multiple notifications into one** - instead of sending an alert for each change, it sends one alert after all changes are done.

 

## Syntax

```js
// Using the shortcut
batch(fn)

// Using the full namespace
ReactiveUtils.batch(fn)
```

**Both styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`batch()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.batch()`) - Explicit and clear

**Parameters:**
- `fn` - A function that performs multiple state updates (required)

**Returns:**
- The return value of the function `fn`

 

## Why Does This Exist?

### The Problem with Multiple State Updates

Let's say you need to update several reactive properties:

```javascript
// Create reactive state with an effect
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  age: 25,
  city: 'New York'
});

effect(() => {
  console.log(`${user.firstName} ${user.lastName}, age ${user.age}, lives in ${user.city}`);
  // Imagine this is an expensive DOM update or API call
});
// Logs: "John Doe, age 25, lives in New York"

// Update multiple properties
user.firstName = 'Jane';  // Effect runs!
user.lastName = 'Smith';  // Effect runs!
user.age = 30;            // Effect runs!
user.city = 'Boston';     // Effect runs!
```

This works, but it's **inefficient**. The effect runs **4 times** - once for each property change!

**What's the Real Issue?**

```
Normal Updates Flow:
┌─────────────────┐
│ user.firstName  │
│    = 'Jane'     │
└────────┬────────┘
         │
         ▼
    Effect runs! 📢
         │
         ▼
┌─────────────────┐
│ user.lastName   │
│    = 'Smith'    │
└────────┬────────┘
         │
         ▼
    Effect runs! 📢
         │
         ▼
┌─────────────────┐
│ user.age = 30   │
└────────┬────────┘
         │
         ▼
    Effect runs! 📢
         │
         ▼
┌─────────────────┐
│ user.city       │
│    = 'Boston'   │
└────────┬────────┘
         │
         ▼
    Effect runs! 📢
         │
         ▼
    4 executions!
    Wasteful!
```

**Problems:**
❌ Effect runs multiple times for related changes
❌ Expensive operations (DOM updates, calculations) happen repeatedly
❌ Intermediate states are visible (firstName changes but lastName hasn't yet)
❌ Performance degrades with many updates
❌ UI flickers during multi-step updates
❌ Wasted computation and resources

**Why This Becomes a Problem:**

Imagine the effect does something expensive:
- Updates multiple DOM elements
- Makes API calls
- Performs complex calculations
- Triggers animations

Running it 4 times when you only need it once is wasteful!

### The Solution with `batch()`

When you use `batch()`, all updates are grouped together:

```javascript
// Same state and effect setup
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  age: 25,
  city: 'New York'
});

effect(() => {
  console.log(`${user.firstName} ${user.lastName}, age ${user.age}, lives in ${user.city}`);
});
// Logs: "John Doe, age 25, lives in New York"

// Update multiple properties in a batch
batch(() => {
  user.firstName = 'Jane';
  user.lastName = 'Smith';
  user.age = 30;
  user.city = 'Boston';
});
// Logs only once: "Jane Smith, age 30, lives in Boston"
```

**What Just Happened?**

```
Batched Updates Flow:
┌──────────────────┐
│  batch(() => {   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ firstName='Jane'│ ← Change tracked
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│lastName='Smith' │ ← Change tracked
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ age = 30        │ ← Change tracked
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ city = 'Boston' │ ← Change tracked
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  })             │
└────────┬────────┘
         │
         ▼
    Effect runs
    ONCE! 🎯
```

With `batch()`:
- All updates happen inside the function
- Effects are deferred until the function completes
- Effects run once with the final state
- No intermediate states visible
- Much better performance

**Benefits:**
✅ Effects run once instead of multiple times
✅ Better performance for bulk updates
✅ No intermediate states visible
✅ Cleaner, more predictable behavior
✅ Prevents UI flicker
✅ Reduces wasted computation

 

## Mental Model

Think of `batch()` like **sending a group email**:

```
Normal Updates (Individual Emails):
┌──────────────┐
│ Send email 1 │ → Recipient gets notification
└──────────────┘
┌──────────────┐
│ Send email 2 │ → Recipient gets notification
└──────────────┘
┌──────────────┐
│ Send email 3 │ → Recipient gets notification
└──────────────┘
┌──────────────┐
│ Send email 4 │ → Recipient gets notification
└──────────────┘
    4 notifications!
    Annoying!

Batched Updates (Group Email):
┌──────────────────────┐
│  Draft email 1       │
│  Draft email 2       │
│  Draft email 3       │
│  Draft email 4       │
│                      │
│  Send all at once    │
└──────────┬───────────┘
           │
           ▼
   1 notification!
   Efficient!
```

**Key Insight:** Just like drafting multiple emails and sending them all at once creates one notification instead of many, `batch()` groups multiple state changes and triggers effects once instead of repeatedly.

 

## How Does It Work?

### The Magic: Batching Depth Counter

When you call `batch()`, here's what happens behind the scenes:

```javascript
// What you write:
batch(() => {
  user.firstName = 'Jane';
  user.lastName = 'Smith';
  user.age = 30;
});

// What actually happens (simplified):
// 1. Increment batch depth counter
batchDepth = 1;

// 2. Run your function
user.firstName = 'Jane';   // Effect queued, not run
user.lastName = 'Smith';   // Effect queued, not run
user.age = 30;             // Effect queued, not run

// 3. Decrement batch depth counter
batchDepth = 0;

// 4. Flush all queued effects (batch depth is now 0)
runAllQueuedEffects();  // Effects run now!
```

**In other words:** `batch()` uses a counter:
1. Increments counter before running your function
2. While counter > 0, effects are queued instead of run
3. Decrements counter after your function completes
4. When counter reaches 0, all queued effects run at once

### Under the Hood

```
Before batch():
batchDepth = 0
┌──────────────┐
│ State change │
└──────┬───────┘
       │
       ▼
  Run effect
  immediately

Inside batch():
batchDepth = 1
┌──────────────┐
│ State change │
└──────┬───────┘
       │
       ▼
  Queue effect
  (don't run yet)

After batch():
batchDepth = 0
┌──────────────┐
│ Flush queue  │
└──────┬───────┘
       │
       ▼
  Run all queued
  effects once
```

**What happens:**

1️⃣ `batch()` **increments** the batch depth counter
2️⃣ Inside `batch()`, state changes **queue** effects instead of running them
3️⃣ `batch()` **decrements** the counter when done
4️⃣ When counter reaches 0, **all queued effects run once**

 

## Basic Usage

### Batching Multiple Updates

The simplest way to use `batch()`:

```js
const app = state({
  count: 0,
  multiplier: 1,
  offset: 0
});

effect(() => {
  console.log('Result:', app.count * app.multiplier + app.offset);
});
// Logs: "Result: 0"

// Without batch - effect runs 3 times
app.count = 10;       // Logs: "Result: 10"
app.multiplier = 2;   // Logs: "Result: 20"
app.offset = 5;       // Logs: "Result: 25"

// With batch - effect runs once
batch(() => {
  app.count = 100;
  app.multiplier = 3;
  app.offset = 10;
});
// Logs only once: "Result: 310"
```

### Returning Values from batch()

`batch()` returns whatever your function returns:

```js
const user = state({ score: 0, bonus: 0 });

const total = batch(() => {
  user.score = 100;
  user.bonus = 50;
  return user.score + user.bonus;
});

console.log(total); // 150
```

### Nested Batching

Batches can be nested:

```js
const app = state({ a: 0, b: 0, c: 0 });

effect(() => {
  console.log(`a=${app.a}, b=${app.b}, c=${app.c}`);
});

batch(() => {
  app.a = 1;

  batch(() => {
    app.b = 2;
    app.c = 3;
  }); // Inner batch completes, but effects still queued

  app.a = 10;
}); // Outer batch completes, effects run once
// Logs: "a=10, b=2, c=3"
```

 

## Performance Impact

### Measuring the Difference

Let's compare performance:

```js
const items = state({ list: [] });

effect(() => {
  // Expensive operation: update all DOM elements
  document.getElementById('count').textContent = items.list.length;
  items.list.forEach((item, i) => {
    const el = document.getElementById(`item-${i}`);
    if (el) el.textContent = item;
  });
});

// ❌ Without batch - effect runs 100 times
console.time('without batch');
for (let i = 0; i < 100; i++) {
  items.list.push(`Item ${i}`);
}
console.timeEnd('without batch');
// Output: "without batch: 45ms"

items.list = []; // Reset

// ✅ With batch - effect runs once
console.time('with batch');
batch(() => {
  for (let i = 0; i < 100; i++) {
    items.list.push(`Item ${i}`);
  }
});
console.timeEnd('with batch');
// Output: "with batch: 2ms"
```

**Performance gain: 20x faster!**

 

## When to Use batch()

### ✅ Good Use Cases

**1. Bulk Updates**

```js
batch(() => {
  todos.items.forEach(todo => {
    todo.completed = false;
  });
});
```

**2. Form Resets**

```js
batch(() => {
  loginForm.email = '';
  loginForm.password = '';
  loginForm.errors = {};
  loginForm.touched = {};
});
```

**3. Data Initialization**

```js
batch(() => {
  app.user = userData;
  app.preferences = preferencesData;
  app.settings = settingsData;
  app.isLoaded = true;
});
```

**4. Multi-Step Calculations**

```js
batch(() => {
  cart.subtotal = calculateSubtotal();
  cart.tax = calculateTax(cart.subtotal);
  cart.shipping = calculateShipping();
  cart.total = cart.subtotal + cart.tax + cart.shipping;
});
```

### ❌ Not Needed

**1. Single Updates**

```js
// Don't use batch for single updates
❌ batch(() => {
  user.name = 'John';
});

// Just update directly
✅ user.name = 'John';
```

**2. Already Batched**

Many operations are already batched internally:

```js
// These are often already optimized
userset({ name: 'John', age: 30 });  // Already batched internally
```

 

## Real-World Examples

### Example 1: Todo List Bulk Actions

```js
const todoApp = state({
  todos: [
    { id: 1, text: 'Task 1', done: false },
    { id: 2, text: 'Task 2', done: false },
    { id: 3, text: 'Task 3', done: false }
  ]
});

effect(() => {
  const completed = todoApp.todos.filter(t => t.done).length;
  const total = todoApp.todos.length;
  console.log(`Progress: ${completed}/${total}`);
  document.getElementById('progress').textContent = `${completed}/${total}`;
});

// Mark all as complete - single effect run
function completeAll() {
  batch(() => {
    todoApp.todos.forEach(todo => {
      todo.done = true;
    });
  });
}

completeAll();
// Logs once: "Progress: 3/3"
```

### Example 2: Shopping Cart Calculations

```js
const cart = state({
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0
});

effect(() => {
  // Expensive: Update multiple DOM elements
  document.getElementById('subtotal').textContent = `$${cart.subtotal}`;
  document.getElementById('tax').textContent = `$${cart.tax}`;
  document.getElementById('shipping').textContent = `$${cart.shipping}`;
  document.getElementById('total').textContent = `$${cart.total}`;
});

function addToCart(product, quantity) {
  batch(() => {
    // Add item
    cart.items.push({ product, quantity, price: product.price * quantity });

    // Recalculate everything
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.tax = cart.subtotal * 0.08;
    cart.shipping = cart.subtotal > 50 ? 0 : 5.99;
    cart.total = cart.subtotal + cart.tax + cart.shipping;
  });
  // Effect runs once with all updates
}

addToCart({ name: 'Book', price: 29.99 }, 2);
```

### Example 3: Animation Frame Updates

```js
const animation = state({
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1
});

effect(() => {
  const element = document.getElementById('animated');
  element.style.transform =
    `translate(${animation.x}px, ${animation.y}px) ` +
    `rotate(${animation.rotation}deg) ` +
    `scale(${animation.scale})`;
});

// Animation loop - batch all updates per frame
function animate() {
  batch(() => {
    animation.x += 1;
    animation.y += 0.5;
    animation.rotation += 2;
    animation.scale = 1 + Math.sin(Date.now() / 1000) * 0.1;
  });
  // Single DOM update per frame

  requestAnimationFrame(animate);
}

animate();
```

### Example 4: Form Validation and Update

```js
const registrationForm = state({
  email: '',
  password: '',
  confirmPassword: '',
  errors: {}
});

effect(() => {
  // Update all error messages in UI
  Object.entries(registrationForm.errors).forEach(([field, error]) => {
    const el = document.getElementById(`error-${field}`);
    if (el) el.textContent = error;
  });
});

function validateAndUpdate(formData) {
  batch(() => {
    // Update all fields
    registrationForm.email = formData.email;
    registrationForm.password = formData.password;
    registrationForm.confirmPassword = formData.confirmPassword;

    // Validate all
    const errors = {};
    if (!formData.email.includes('@')) {
      errors.email = 'Invalid email';
    }
    if (formData.password.length < 6) {
      errors.password = 'Too short';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }

    registrationForm.errors = errors;
  });
  // UI updates once with all errors
}
```

 

## Common Patterns

### Pattern: Batch with Conditional Logic

```js
function updateUserProfile(updates) {
  batch(() => {
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.age) user.age = updates.age;

    // Always update timestamp
    user.lastModified = Date.now();
  });
}
```

### Pattern: Batch with Error Handling

```js
function safeUpdate(updates) {
  try {
    batch(() => {
      Object.assign(state, updates);
    });
  } catch (error) {
    console.error('Update failed:', error);
    // State is still consistent (atomic update)
  }
}
```

### Pattern: Batch with Return Value

```js
function calculateAndUpdate(values) {
  return batch(() => {
    calculator.input1 = values[0];
    calculator.input2 = values[1];
    calculator.operation = values[2];

    const result = calculator.input1 + calculator.input2;
    calculator.result = result;

    return result;
  });
}

const sum = calculateAndUpdate([10, 20, '+']);
console.log(sum); // 30
```

### Pattern: Nested Batches for Complex Updates

```js
function importData(data) {
  batch(() => {
    // Phase 1: Clear old data
    batch(() => {
      app.users = [];
      app.posts = [];
      app.comments = [];
    });

    // Phase 2: Import new data
    batch(() => {
      app.users = data.users;
      app.posts = data.posts;
      app.comments = data.comments;
    });

    // Phase 3: Update metadata
    app.lastImport = Date.now();
    app.importedCount = data.users.length;
  });
}
```

 

## Common Pitfalls

### Pitfall #1: Async Functions in batch()

❌ **Wrong:**
```js
// Async functions don't work as expected
batch(async () => {
  user.name = 'Loading...';
  const data = await fetchUser();  // batch() returns here!
  user.name = data.name;  // This runs OUTSIDE the batch!
});
```

✅ **Correct:**
```js
// Separate the async parts
const data = await fetchUser();

batch(() => {
  user.name = data.name;
  user.email = data.email;
  user.age = data.age;
});
```

**Why?** `batch()` completes as soon as your function returns, which happens immediately with async functions (they return a Promise).

 

### Pitfall #2: Forgetting to Return Values

❌ **Wrong:**
```js
const result = batch(() => {
  calculate.a = 10;
  calculate.b = 20;
  calculate.a + calculate.b; // Forgot to return!
});

console.log(result); // undefined
```

✅ **Correct:**
```js
const result = batch(() => {
  calculate.a = 10;
  calculate.b = 20;
  return calculate.a + calculate.b;
});

console.log(result); // 30
```

 

### Pitfall #3: Over-Batching Simple Updates

❌ **Wrong:**
```js
// Don't batch single updates
batch(() => {
  user.name = 'John';
});
```

✅ **Correct:**
```js
// Just update directly
user.name = 'John';
```

**Why?** Batching has a tiny overhead. For single updates, it's unnecessary.

 

### Pitfall #4: Expecting Immediate Effect Updates Inside Batch

❌ **Wrong:**
```js
const log = [];

effect(() => {
  log.push(counter.count);
});

batch(() => {
  counter.count = 1;
  console.log(log); // Still [0] - effect hasn't run yet!
  counter.count = 2;
});
// Effect runs here, log becomes [0, 2]
```

✅ **Correct:**
```js
batch(() => {
  counter.count = 1;
  counter.count = 2;
});
// Effect runs here
console.log(log); // [0, 2]
```

**Why?** Effects don't run until the batch completes.

 

## Summary

**What is `batch()`?**

`batch()` is a **performance optimization function** that groups multiple state updates together so effects only run once at the end instead of after each change.

 

**Why use `batch()` instead of individual updates?**

- Better performance for bulk updates
- Effects run once instead of multiple times
- No intermediate states visible
- Prevents UI flicker
- Reduces wasted computation
- More predictable behavior

 

**Key Points to Remember:**

1️⃣ **Groups updates** - Multiple changes trigger effects once
2️⃣ **Performance boost** - Especially important for expensive effects
3️⃣ **Returns value** - Can return a value from the batch function
4️⃣ **Nestable** - Batches can be nested safely
5️⃣ **Synchronous only** - Don't use with async functions

 

**Mental Model:** Think of `batch()` as **sending a group email** - instead of sending individual notifications for each change, it bundles them all into one notification.

 

**Quick Reference:**

```js
// Without batch - effect runs 3 times
user.firstName = 'Jane';
user.lastName = 'Smith';
user.age = 30;

// With batch - effect runs once
batch(() => {
  user.firstName = 'Jane';
  user.lastName = 'Smith';
  user.age = 30;
});

// With return value
const total = batch(() => {
  cart.subtotal = 100;
  cart.tax = 8;
  cart.shipping = 5;
  return cart.subtotal + cart.tax + cart.shipping;
});

console.log(total); // 113
```

 

**Remember:** `batch()` is your performance optimization tool for bulk updates. Use it whenever you need to update multiple reactive properties and want effects to run only once at the end!
