# Understanding `builder.computed(defs)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to add computed properties to your reactive builder? Use `builder.computed()`:

```js
// Create a reactive builder and add computed properties
const counter = reactive({ count: 0, multiplier: 2 })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    multiplied() {
      return this.state.count * this.state.multiplier;
    }
  })
  .build();

// Use computed properties
console.log(counter.count);      // 0
console.log(counter.doubled);    // 0
console.log(counter.multiplied); // 0

// Update state - computed properties update automatically
counter.count = 5;
console.log(counter.doubled);    // 10
console.log(counter.multiplied); // 10
```

**That's it!** `builder.computed()` adds reactive computed properties to your builder and returns the builder for chaining!

 

## What is `builder.computed()`?

`builder.computed()` is a **builder method** that adds **computed properties** to your reactive state. These are properties whose values are automatically calculated based on other state properties, and they update automatically when their dependencies change.

**A computed property:**
- Is defined as a function that returns a value
- Automatically tracks which state properties it reads
- Recalculates when any dependency changes
- Is cached until dependencies change
- Appears as a regular property (not a function) on the built object

Think of it as **adding automatic calculations** to your reactive state - you define the formula once, and the value updates automatically whenever the inputs change.

 

## Syntax

```js
// Add computed properties to a builder
builder.computed(definitions)

// Full example
reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    tripled() {
      return this.state.count * 3;
    }
  })
  .build()
```

**Parameters:**
- `definitions` - An object where:
  - **Keys** are computed property names
  - **Values** are functions that return the computed value
  - Functions receive `this.state` for accessing reactive state

**Returns:**
- The builder (for method chaining)

**Important:**
- Use `this.state` to access reactive properties inside computed functions
- Use regular functions (not arrow functions) to preserve `this` context
- The builder is returned, so you can chain more methods

 

## Why Does This Exist?

### The Problem with Manual Calculations

Let's say you have a counter and want to display its doubled value:

```javascript
// Create reactive state
const app = state({ count: 0 });

// Manually calculate doubled value every time
console.log(app.count * 2); // 0

app.count = 5;
console.log(app.count * 2); // 10

// Every time you need doubled, you must recalculate
const doubled = app.count * 2; // Repetitive!
```

This approach has several challenges:

**What's the Real Issue?**

```
Manual Calculation Pattern:
┌─────────────────┐
│ State           │
│  count: 5       │
└─────────────────┘
        │
        ▼
   Need doubled?
        │
        ▼
┌─────────────────┐
│ count * 2       │  ← Calculate manually
└─────────────────┘
        │
        ▼
   Need it again?
        │
        ▼
┌─────────────────┐
│ count * 2       │  ← Calculate again
└─────────────────┘
    Repetitive!
    Error-prone!
```

**Problems:**
❌ Must recalculate every time you need the value
❌ Same calculation repeated throughout code
❌ Easy to forget to recalculate after updates
❌ No automatic updates
❌ Can't treat derived values as properties
❌ Hard to track dependencies

### The Solution with `builder.computed()`

When you use `builder.computed()`, you define the calculation once:

```javascript
// Create builder with computed property
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();

// Use it like a regular property
console.log(counter.doubled); // 0

// Update state - doubled updates automatically
counter.count = 5;
console.log(counter.doubled); // 10 (automatically calculated!)

// No manual recalculation needed
console.log(counter.doubled); // Still 10
console.log(counter.doubled); // Still 10 (cached!)
```

**What Just Happened?**

```
Computed Property Pattern:
┌─────────────────────┐
│ State               │
│  count: 5           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Computed: doubled   │
│  () => count * 2    │ ← Defined once
└──────────┬──────────┘
           │
           ▼
  Automatically updates
  when count changes
           │
           ▼
┌─────────────────────┐
│ Access as property  │
│  counter.doubled    │ ← Just use it!
└─────────────────────┘
    Automatic!
    Cached!
    Clean!
```

With `builder.computed()`:
- Define calculation once
- Access as a regular property
- Automatically updates when dependencies change
- Cached for performance
- Clean, declarative code
- No repetition

**Benefits:**
✅ Define once, use everywhere
✅ Automatic dependency tracking
✅ Automatic recalculation
✅ Cached for performance
✅ Chainable with other builder methods
✅ Clean, declarative syntax

 

## Mental Model

Think of `builder.computed()` like **Excel formulas**:

```
Manual Calculations (Calculator):
┌─────────────────────┐
│  A1: 5              │  ← You enter a number
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Calculator         │
│  5 × 2 = ?          │  ← You calculate
│  Result: 10         │  ← You write result
└─────────────────────┘
        │
    A1 changes?
        │
        ▼
┌─────────────────────┐
│  Calculator         │
│  8 × 2 = ?          │  ← Calculate again
│  Result: 16         │  ← Write again
└─────────────────────┘
    Manual work!
    Easy to forget!

Computed Properties (Excel Formula):
┌─────────────────────┐
│  A1: 5              │  ← You enter a number
│  B1: =A1*2          │  ← You write formula once
│      10             │  ← Excel calculates
└─────────────────────┘
        │
    A1 changes to 8
        │
        ▼
┌─────────────────────┐
│  A1: 8              │
│  B1: =A1*2          │  ← Same formula
│      16             │  ← Auto-updates!
└─────────────────────┘
    Automatic!
    Always correct!
```

**Key Insight:** Just like Excel formulas automatically recalculate when their inputs change, computed properties automatically update when the state they depend on changes. You write the formula once, and the system handles keeping it up-to-date!

 

## How Does It Work?

### The Magic: Reactive Dependency Tracking

When you call `builder.computed()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();

// What actually happens (simplified):
// 1. Builder receives computed definitions
builder.computed({
  doubled() { return this.state.count * 2; }
});

// 2. For each computed property:
Object.defineProperty(state, 'doubled', {
  get() {
    // 3. Run the function in a computed context
    return computed(() => {
      // 4. When this runs, it tracks that it reads 'count'
      return state.count * 2;
    });
  }
});

// 5. When you access counter.doubled:
//    - The function runs
//    - It reads counter.count (tracked!)
//    - Returns the calculated value
//    - Caches the result

// 6. When counter.count changes:
//    - The reactive system knows 'doubled' depends on 'count'
//    - It marks 'doubled' as stale
//    - Next access to 'doubled' recalculates
```

**In other words:** `builder.computed()`:
1. Takes your computed property definitions
2. Adds them to the reactive state as special getters
3. Tracks which state properties each computed property reads
4. Automatically recalculates when dependencies change
5. Caches results until dependencies change
6. Returns the builder for chaining

### Under the Hood

```
.computed({ doubled() { return this.state.count * 2; } })
        │
        ▼
┌───────────────────────┐
│  Parse Definitions    │
│  doubled: function    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Add to State as      │
│  Computed Property    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Track Dependencies   │
│  doubled → count      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return Builder       │
│  (for chaining)       │
└───────────────────────┘
```

**What happens:**

1️⃣ When you **define** a computed property, it's added to the state
2️⃣ When you **access** a computed property, it runs the function
3️⃣ The function **reads** state properties (dependency tracking happens automatically)
4️⃣ The **result is cached** until a dependency changes
5️⃣ When a **dependency changes**, the cached value is invalidated
6️⃣ Next access **recalculates** the value

 

## Basic Usage

### Adding a Single Computed Property

The simplest way to use `builder.computed()`:

```js
// Create builder with one computed property
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();

// Access the computed property
console.log(counter.doubled); // 0

// Update state
counter.count = 5;

// Computed property updates automatically
console.log(counter.doubled); // 10
```

### Adding Multiple Computed Properties

Add multiple computed properties in one call:

```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    tripled() {
      return this.state.count * 3;
    },
    squared() {
      return this.state.count * this.state.count;
    }
  })
  .build();

counter.count = 5;
console.log(counter.doubled); // 10
console.log(counter.tripled); // 15
console.log(counter.squared); // 25
```

### Computed Properties with Multiple Dependencies

Computed properties can depend on multiple state properties:

```js
const calculator = reactive({ a: 5, b: 3 })
  .computed({
    sum() {
      return this.state.a + this.state.b;
    },
    product() {
      return this.state.a * this.state.b;
    },
    average() {
      return (this.state.a + this.state.b) / 2;
    }
  })
  .build();

console.log(calculator.sum);     // 8
console.log(calculator.product); // 15
console.log(calculator.average); // 4

calculator.a = 10;
console.log(calculator.sum);     // 13 (auto-updated!)
```

 

## Multiple Computed Properties

### Calling .computed() Multiple Times

You can call `.computed()` multiple times to add properties incrementally:

```js
const builder = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .computed({
    tripled() {
      return this.state.count * 3;
    }
  });

const counter = builder.build();

console.log(counter.doubled); // 0
console.log(counter.tripled); // 0
```

### Computed Properties Depending on Other Computed Properties

Computed properties can depend on other computed properties:

```js
const counter = reactive({ count: 5 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .computed({
    // This depends on the 'doubled' computed property
    doubledPlusTen() {
      return this.doubled + 10; // Access computed via this
    }
  })
  .build();

console.log(counter.count);          // 5
console.log(counter.doubled);        // 10
console.log(counter.doubledPlusTen); // 20

counter.count = 10;
console.log(counter.doubled);        // 20
console.log(counter.doubledPlusTen); // 30 (auto-updated!)
```

 

## Computed Dependencies

### Automatic Dependency Tracking

Computed properties automatically track their dependencies:

```js
const app = reactive({ firstName: 'John', lastName: 'Doe' })
  .computed({
    fullName() {
      // Automatically tracks: firstName, lastName
      return `${this.state.firstName} ${this.state.lastName}`;
    }
  })
  .build();

console.log(app.fullName); // "John Doe"

// Change firstName - fullName updates
app.firstName = 'Jane';
console.log(app.fullName); // "Jane Doe"

// Change lastName - fullName updates
app.lastName = 'Smith';
console.log(app.fullName); // "Jane Smith"
```

### Conditional Dependencies

Dependencies are tracked dynamically based on what the function actually reads:

```js
const app = reactive({ showAge: false, age: 25, name: 'John' })
  .computed({
    display() {
      // Dependencies change based on showAge
      if (this.state.showAge) {
        // When showAge is true: depends on name AND age
        return `${this.state.name} (${this.state.age})`;
      } else {
        // When showAge is false: depends only on name
        return this.state.name;
      }
    }
  })
  .build();

console.log(app.display); // "John" (only name)

app.showAge = true;
console.log(app.display); // "John (25)" (name and age)

// Now changing age will update display
app.age = 30;
console.log(app.display); // "John (30)"
```

### Complex Computations

Computed properties can perform any calculation:

```js
const cart = reactive({ items: [10, 20, 30], taxRate: 0.1 })
  .computed({
    subtotal() {
      return this.state.items.reduce((sum, price) => sum + price, 0);
    },
    tax() {
      return this.subtotal * this.state.taxRate;
    },
    total() {
      return this.subtotal + this.tax;
    }
  })
  .build();

console.log(cart.subtotal); // 60
console.log(cart.tax);      // 6
console.log(cart.total);    // 66

// Update items
cart.items.push(15);
console.log(cart.subtotal); // 75
console.log(cart.tax);      // 7.5
console.log(cart.total);    // 82.5
```

 

## Chaining with Other Methods

### Combining with Actions

```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

console.log(counter.doubled); // 0
counter.increment();
console.log(counter.doubled); // 2
```

### Combining with Watch

```js
const app = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    // Watch the computed property
    doubled(newVal, oldVal) {
      console.log(`Doubled changed: ${oldVal} → ${newVal}`);
    }
  })
  .build();

app.count = 5; // Logs: "Doubled changed: 0 → 10"
```

### Combining with Effects

```js
const app = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .effect(() => {
    // Effect can use computed properties
    console.log('Doubled is:', app.state.doubled);
  })
  .build();

// Logs: "Doubled is: 0"
app.count = 5;
// Logs: "Doubled is: 10"
```

### Full Chain Example

```js
const counter = reactive({ count: 0, step: 1 })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    isEven() {
      return this.state.count % 2 === 0;
    }
  })
  .watch({
    count(newVal) {
      if (newVal > 10) {
        console.warn('Count is high!');
      }
    }
  })
  .action('increment', (state) => {
    state.count += state.step;
  })
  .action('decrement', (state) => {
    state.count -= state.step;
  })
  .build();

counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2
console.log(counter.isEven);  // false
```

 

## Common Patterns

### Pattern: Derived State

```js
const user = reactive({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
})
  .computed({
    fullName() {
      return `${this.state.firstName} ${this.state.lastName}`;
    },
    initials() {
      return `${this.state.firstName[0]}${this.state.lastName[0]}`;
    },
    emailDomain() {
      return this.state.email.split('@')[1];
    }
  })
  .build();

console.log(user.fullName);    // "John Doe"
console.log(user.initials);    // "JD"
console.log(user.emailDomain); // "example.com"
```

### Pattern: Formatting and Display

```js
const product = reactive({
  price: 29.99,
  quantity: 3,
  currency: 'USD'
})
  .computed({
    formattedPrice() {
      return `$${this.state.price.toFixed(2)}`;
    },
    total() {
      return this.state.price * this.state.quantity;
    },
    formattedTotal() {
      return `$${this.total.toFixed(2)}`;
    }
  })
  .build();

console.log(product.formattedPrice); // "$29.99"
console.log(product.formattedTotal); // "$89.97"
```

### Pattern: Validation State

```js
const form = reactive({
  username: '',
  password: '',
  email: ''
})
  .computed({
    isUsernameValid() {
      return this.state.username.length >= 3;
    },
    isPasswordValid() {
      return this.state.password.length >= 8;
    },
    isEmailValid() {
      return this.state.email.includes('@');
    },
    isFormValid() {
      return this.isUsernameValid &&
             this.isPasswordValid &&
             this.isEmailValid;
    }
  })
  .build();

form.username = 'john';
form.password = 'secret123';
form.email = 'john@example.com';

console.log(form.isFormValid); // true
```

### Pattern: Conditional Display

```js
const app = reactive({
  user: null,
  isLoading: false,
  error: null
})
  .computed({
    showLogin() {
      return !this.state.user && !this.state.isLoading;
    },
    showDashboard() {
      return this.state.user && !this.state.isLoading;
    },
    showSpinner() {
      return this.state.isLoading;
    },
    showError() {
      return this.state.error !== null;
    }
  })
  .build();

app.isLoading = true;
console.log(app.showSpinner); // true
console.log(app.showLogin);   // false
```

### Pattern: Computed Collections

```js
const todoList = reactive({
  todos: [
    { id: 1, text: 'Learn React', done: true },
    { id: 2, text: 'Build app', done: false },
    { id: 3, text: 'Deploy', done: false }
  ]
})
  .computed({
    completedTodos() {
      return this.state.todos.filter(t => t.done);
    },
    pendingTodos() {
      return this.state.todos.filter(t => !t.done);
    },
    completionRate() {
      const total = this.state.todos.length;
      const completed = this.completedTodos.length;
      return total > 0 ? (completed / total) * 100 : 0;
    }
  })
  .build();

console.log(todoList.completedTodos.length); // 1
console.log(todoList.pendingTodos.length);   // 2
console.log(todoList.completionRate);        // 33.33
```

 

## Common Pitfalls

### Pitfall #1: Using Arrow Functions

❌ **Wrong:**
```js
reactive({ count: 0 })
  .computed({
    // Arrow function - 'this' is wrong!
    doubled: () => this.state.count * 2
  })
  .build();
```

Arrow functions don't bind `this` correctly, so `this.state` won't work.

✅ **Correct:**
```js
reactive({ count: 0 })
  .computed({
    // Regular function - 'this' works!
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();
```

 

### Pitfall #2: Forgetting to Return a Value

❌ **Wrong:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      this.state.count * 2; // No return!
    }
  })
  .build();

// counter.doubled is undefined
```

✅ **Correct:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2; // Return the value!
    }
  })
  .build();
```

 

### Pitfall #3: Accessing this Instead of this.state

❌ **Wrong:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      return this.count * 2; // this.count is undefined!
    }
  })
  .build();
```

State properties are on `this.state`, not directly on `this`.

✅ **Correct:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2; // Use this.state!
    }
  })
  .build();
```

 

### Pitfall #4: Side Effects in Computed Properties

❌ **Wrong:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      console.log('Computing...'); // Side effect!
      this.state.count++; // Mutation!
      return this.state.count * 2;
    }
  })
  .build();
```

Computed properties should be **pure functions** - no side effects, no mutations.

✅ **Correct:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      // Pure calculation only
      return this.state.count * 2;
    }
  })
  .effect(() => {
    // Side effects go in effects, not computed
    console.log('Count changed:', this.state.count);
  })
  .build();
```

 

### Pitfall #5: Expecting Computed to Update Without Accessing It

❌ **Wrong Expectation:**
```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      console.log('Calculating doubled...');
      return this.state.count * 2;
    }
  })
  .build();

counter.count = 5;
// Nothing logged yet! Computed is lazy.
```

Computed properties are **lazy** - they only recalculate when accessed.

✅ **Correct Understanding:**
```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      console.log('Calculating doubled...');
      return this.state.count * 2;
    }
  })
  .build();

counter.count = 5;
console.log(counter.doubled); // NOW it logs "Calculating doubled..."
```

If you need immediate updates, use an effect instead:

```js
const counter = reactive({ count: 0 })
  .effect(() => {
    // This runs immediately when count changes
    const doubled = counter.state.count * 2;
    console.log('Doubled:', doubled);
  })
  .build();

counter.count = 5; // Logs immediately: "Doubled: 10"
```

 

## Summary

**What is `builder.computed()`?**

`builder.computed()` is a **builder method** that adds reactive computed properties to your state. These properties automatically recalculate when their dependencies change.

 

**Why use `builder.computed()`?**

- Define derived values once, use everywhere
- Automatic dependency tracking
- Automatic recalculation when dependencies change
- Cached for performance
- Chainable with other builder methods

 

**Key Points to Remember:**

1️⃣ **Use regular functions** - Not arrow functions (need `this` binding)
2️⃣ **Access via this.state** - State properties are on `this.state`
3️⃣ **Always return a value** - Computed properties must return something
4️⃣ **Keep them pure** - No side effects, no mutations
5️⃣ **Returns builder** - Chain with other builder methods

 

**Mental Model:** Think of `builder.computed()` as **Excel formulas** - you write the formula once, and it automatically recalculates when the cells it depends on change.

 

**Quick Reference:**

```js
// ADD SINGLE COMPUTED PROPERTY
const obj = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .build();

// ADD MULTIPLE COMPUTED PROPERTIES
const obj = reactive({ a: 5, b: 3 })
  .computed({
    sum() {
      return this.state.a + this.state.b;
    },
    product() {
      return this.state.a * this.state.b;
    }
  })
  .build();

// COMPUTED DEPENDING ON COMPUTED
const obj = reactive({ count: 5 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .computed({
    quadrupled() {
      return this.doubled * 2; // Access via this
    }
  })
  .build();

// CHAIN WITH OTHER METHODS
const obj = reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .action('increment', (state) => state.count++)
  .watch({ count(n) { console.log('Count:', n); } })
  .build();

// USE THE COMPUTED PROPERTIES
console.log(obj.doubled); // Access like a property (not a function)
obj.count = 10;
console.log(obj.doubled); // 20 (auto-updated!)
```

 

**Remember:** `builder.computed()` lets you define automatic calculations that stay in sync with your reactive state. Define once, use everywhere, and let the reactive system handle keeping everything up-to-date!
