# Understanding `set()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to update state with functions that receive previous values? Here's how:

```js
const counter = state({ count: 0, multiplier: 2 });

// Update with functions (previous value)
set(counter, {
  count: prev => prev + 1,        // Increment
  multiplier: prev => prev * 2    // Double
});

console.log(counter.count);      // 1
console.log(counter.multiplier); // 4

// Mix functions and values
set(counter, {
  count: prev => prev + 5,  // Functional
  multiplier: 10            // Direct value
});

console.log(counter.count);      // 6
console.log(counter.multiplier); // 10
```

**That's it!** The `set()` function updates state with functional updates that receive the previous value!

 

## What is `set()`?

`set()` is a **functional update method** that allows you to update reactive state properties using functions that receive the current value. It's perfect for updates that depend on the previous state.

**Functional updates:**
- Functions receive previous value as parameter
- Return new value from function
- Can mix functions and direct values
- All updates are batched automatically
- Available as `stateset()` or `ReactiveUtils.set()`

Think of it as **update based on current** - you get the old value and return the new value.

 

## Syntax

```js
// Using the namespace
ReactiveUtils.set(state, updates)

// Using instance method
stateset(updates)

// Using global shortcut (if available)
set(state, updates)
```

**All styles are valid!** Choose whichever you prefer:
- **Namespace style** (`ReactiveUtils.set()`) - Explicit and clear
- **Instance method** (`stateset()`) - Object-oriented style
- **Global shortcut** (`set()`) - Clean and concise

**Parameters:**
- `state` - The reactive state object (required for non-instance calls)
- `updates` - Object with property names as keys and values or functions as values (required)
  - Value can be any value (sets directly)
  - Value can be a function `(prev) => newValue`

**Returns:**
- The updated state object

 

## Why Does This Exist?

### The Problem with State Updates Based on Previous Value

Let's say you need to update state based on its current value:

```javascript
const counter = state({ count: 0 });

// Want to increment - need current value
counter.count = counter.count + 1;

// Multiple updates - repetitive
counter.count = counter.count + 5;
counter.count = counter.count * 2;
counter.count = counter.count - 3;
```

This works, but has problems:

**What's the Real Issue?**

```
Direct Updates:
┌─────────────────────┐
│ Read current value  │ ← counter.count
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Calculate new value │ ← counter.count + 1
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Assign new value    │ ← counter.count = ...
└──────────┬──────────┘
           │
           ▼
  Verbose and repetitive!
  Easy to make mistakes!
```

**Problems:**
❌ Repetitive property access (`counter.count` appears twice)
❌ Verbose for simple updates
❌ Easy to mistype property names
❌ Hard to see the update pattern
❌ Not intuitive for functional programming
❌ Can't easily batch multiple functional updates

### The Solution with `set()`

When you use `set()`, updates are clean and functional:

```javascript
const counter = state({ count: 0 });

// Clean functional update
set(counter, {
  count: prev => prev + 1
});

// Multiple updates - clean and clear
set(counter, {
  count: prev => prev + 5
});

set(counter, {
  count: prev => prev * 2
});

set(counter, {
  count: prev => prev - 3
});

// Or batch them all
set(counter, {
  count: prev => {
    let val = prev;
    val = val + 5;
    val = val * 2;
    val = val - 3;
    return val;
  }
});
```

**What Just Happened?**

```
Functional Updates:
┌─────────────────────┐
│ set(state, {        │
│   count: prev =>    │
│     prev + 1        │
│ })                  │
└──────────┬──────────┘
           │
           ▼
  Function receives
  previous value
           │
           ▼
  Returns new value
           │
           ▼
  ✅ Clean!
     Functional!
     Clear intent!
```

With `set()`:
- Functions receive previous value automatically
- Clear, functional update pattern
- Less repetition
- Batched automatically
- Easier to read and understand

**Benefits:**
✅ Functional updates with previous value
✅ Less repetitive code
✅ Clear update intent
✅ Automatically batched
✅ Mix functions and direct values
✅ Easier to read and maintain

 

## Mental Model

Think of `set()` like a **calculator with memory**:

```
Direct Assignment (Basic Calculator):
┌──────────────┐
│ counter.count│ ← Read display
│     = 5      │
└──────────────┘
  You manually read
  and write the value


Functional Update (Calculator with Memory):
┌─────────────────────┐
│ set(counter, {      │
│   count: prev => {  │ ← Previous value in memory
│     return prev + 5 │ ← Add to memory value
│   }                 │
│ })                  │
└─────────────────────┘
  Calculator remembers
  previous value for you
```

**Key Insight:** Just like a calculator with memory that recalls the previous result, `set()` automatically provides the previous value to your function.

 

## How Does It Work?

### The Magic: Function Detection and Execution

When you call `set()`, here's what happens behind the scenes:

```javascript
// What you write:
set(counter, {
  count: prev => prev + 1
});

// What actually happens (simplified):
function set(state, updates) {
  return batch(() => {
    Object.entries(updates).forEach(([key, value]) => {
      // Check if value is a function
      if (typeof value === 'function') {
        // Call function with current value
        const currentValue = state[key];
        const newValue = value(currentValue);
        state[key] = newValue;
      } else {
        // Direct assignment
        state[key] = value;
      }
    });
    return state;
  });
}
```

**In other words:** `set()`:
1. Wraps everything in `batch()` for performance
2. Iterates through all update entries
3. Checks if value is a function
4. If function: calls it with current value, uses returned value
5. If not function: assigns value directly
6. Returns the state

 

## Basic Usage

### Simple Functional Update

```js
const app = state({ count: 0 });

// Increment
set(app, {
  count: prev => prev + 1
});

console.log(app.count); // 1
```

### Multiple Properties

```js
const user = state({
  age: 25,
  score: 100
});

set(user, {
  age: prev => prev + 1,
  score: prev => prev + 10
});

console.log(user.age);   // 26
console.log(user.score); // 110
```

### Mix Functions and Values

```js
const app = state({
  count: 0,
  status: 'idle'
});

set(app, {
  count: prev => prev + 1,  // Function
  status: 'active'           // Direct value
});

console.log(app.count);  // 1
console.log(app.status); // 'active'
```

 

## Functional Updates

### Incrementing

```js
set(counter, {
  count: prev => prev + 1
});
```

### Decrementing

```js
set(counter, {
  count: prev => prev - 1
});
```

### Multiplying

```js
set(counter, {
  count: prev => prev * 2
});
```

### Toggle Boolean

```js
set(app, {
  isActive: prev => !prev
});
```

### Append to String

```js
set(app, {
  message: prev => prev + '!'
});
```

### Append to Array

```js
set(app, {
  items: prev => [...prev, newItem]
});
```

### Update Object

```js
set(app, {
  user: prev => ({ ...prev, name: 'John' })
});
```

 

## When to Use set()

### ✅ Good Use Cases

**1. Updates Based on Previous Value**

```js
set(counter, {
  count: prev => prev + 1
});
```

**2. Toggle States**

```js
set(app, {
  isOpen: prev => !prev
});
```

**3. Accumulation**

```js
set(cart, {
  total: prev => prev + item.price
});
```

**4. Array Operations**

```js
set(app, {
  items: prev => prev.filter(item => item.id !== removeId)
});
```

### ❌ Not Needed

**1. Simple Value Assignment**

```js
// Don't use set for simple assignments
❌ set(app, { count: 5 });

// Just assign directly
✅ app.count = 5;
```

**2. When Previous Value Not Needed**

```js
// Don't use function if not using previous value
❌ set(app, { status: prev => 'active' });

// Just assign value
✅ app.status = 'active';
```

 

## Real-World Examples

### Example 1: Shopping Cart

```js
const cart = state({
  items: [],
  total: 0,
  itemCount: 0
});

function addToCart(product) {
  set(cart, {
    items: prev => [...prev, product],
    total: prev => prev + product.price,
    itemCount: prev => prev + 1
  });
}

function removeFromCart(productId) {
  set(cart, {
    items: prev => prev.filter(item => item.id !== productId),
    total: prev => prev - prev.find(item => item.id === productId).price,
    itemCount: prev => prev - 1
  });
}
```

### Example 2: Form Validation

```js
const form = state({
  errors: {},
  touched: {},
  submitCount: 0
});

function addError(field, message) {
  set(form, {
    errors: prev => ({ ...prev, [field]: message })
  });
}

function markTouched(field) {
  set(form, {
    touched: prev => ({ ...prev, [field]: true })
  });
}

function handleSubmit() {
  set(form, {
    submitCount: prev => prev + 1
  });
}
```

### Example 3: Todo List

```js
const todos = state({
  items: [],
  filter: 'all',
  completedCount: 0
});

function addTodo(text) {
  set(todos, {
    items: prev => [...prev, { id: Date.now(), text, done: false }]
  });
}

function toggleTodo(id) {
  set(todos, {
    items: prev => prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ),
    completedCount: prev => {
      const todo = todos.items.find(t => t.id === id);
      return todo && !todo.done ? prev + 1 : prev - 1;
    }
  });
}
```

 

## Common Patterns

### Pattern: Increment/Decrement

```js
function increment(state, key, amount = 1) {
  set(state, {
    [key]: prev => prev + amount
  });
}

function decrement(state, key, amount = 1) {
  set(state, {
    [key]: prev => prev - amount
  });
}
```

### Pattern: Toggle

```js
function toggle(state, key) {
  set(state, {
    [key]: prev => !prev
  });
}
```

### Pattern: Append

```js
function append(state, key, value) {
  set(state, {
    [key]: prev => [...prev, value]
  });
}
```

### Pattern: Merge Object

```js
function merge(state, key, updates) {
  set(state, {
    [key]: prev => ({ ...prev, ...updates })
  });
}
```

 

## Common Pitfalls

### Pitfall #1: Forgetting to Return New Value

❌ **Wrong:**
```js
set(app, {
  count: prev => {
    prev + 1;  // Forgot to return!
  }
});

console.log(app.count); // undefined
```

✅ **Correct:**
```js
set(app, {
  count: prev => prev + 1  // Returns value
});

// Or with explicit return
set(app, {
  count: prev => {
    return prev + 1;
  }
});
```

 

### Pitfall #2: Using Function When Not Needed

❌ **Wrong:**
```js
// Using function that doesn't use previous value
set(app, {
  status: prev => 'active'
});
```

✅ **Correct:**
```js
// Just assign directly
app.status = 'active';
```

 

### Pitfall #3: Mutating Previous Value

❌ **Wrong:**
```js
set(app, {
  items: prev => {
    prev.push(newItem);  // Mutates!
    return prev;
  }
});
```

✅ **Correct:**
```js
set(app, {
  items: prev => [...prev, newItem]  // New array
});
```

 

## Summary

**What is `set()`?**

`set()` is a **functional update method** that allows you to update state using functions that receive the current value and return the new value.

 

**Why use `set()`?**

- Updates based on previous value
- Clean functional update pattern
- Less repetitive code
- Automatically batched
- Mix functions and direct values
- Easier to read and maintain

 

**Key Points to Remember:**

1️⃣ **Functional updates** - Functions receive previous value
2️⃣ **Must return** - Functions must return new value
3️⃣ **Mixed values** - Can mix functions and direct values
4️⃣ **Batched** - All updates batched automatically
5️⃣ **Immutable** - Don't mutate previous value, return new value

 

**Mental Model:** Think of `set()` as a **calculator with memory** - it remembers the previous value and lets you compute the new value based on it.

 

**Quick Reference:**

```js
// Simple increment
set(counter, {
  count: prev => prev + 1
});

// Multiple properties
set(state, {
  count: prev => prev + 1,
  total: prev => prev + 10
});

// Mix functions and values
set(state, {
  count: prev => prev + 1,
  status: 'active'
});

// Instance method
stateset({
  count: prev => prev + 1
});

// Common patterns
set(app, {
  isOpen: prev => !prev,                    // Toggle
  items: prev => [...prev, newItem],        // Append
  user: prev => ({ ...prev, name: 'John' }) // Merge
});
```

 

**Remember:** `set()` is your functional update tool for state changes that depend on the previous value. Use it for increments, toggles, and any update that builds on the current state!
