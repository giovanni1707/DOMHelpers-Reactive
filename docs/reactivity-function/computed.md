# Understanding `computed()` - A Beginner's Guide

## Quick Start (30 seconds)

Need values that automatically update based on other values? Here's how:

```js
// Create reactive state
const user = state({
  firstName: 'John',
  lastName: 'Doe'
});

// Add computed property that automatically updates
computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
});

// Use it just like a regular property!
console.log(user.fullName); // "John Doe"

// When source data changes, computed updates automatically
user.firstName = 'Jane';
console.log(user.fullName); // "Jane Doe" ✨
```

**That's it!** The `computed()` function adds derived properties that automatically recalculate when their dependencies change.

 

## What is `computed()`?

`computed()` is a function that **adds computed properties to reactive state objects**. A computed property is a **derived value** that automatically recalculates whenever the data it depends on changes.

**A computed property:**
- Derives its value from other properties
- Automatically tracks which properties it reads
- Recalculates only when dependencies change
- Caches its result for performance
- Appears as a regular property on your state object

Think of it as **upgrading your state with smart, self-updating properties** - values that automatically stay in sync with their source data.

 

## Syntax

```js
// Using the full namespace
computed(state, definitions)

// Or using ReactiveUtils namespace
ReactiveUtils.computed(state, definitions)
```

**Parameters:**
- `state` - The reactive state object to add computed properties to
- `definitions` - An object where each key is the computed property name, and each value is a function that returns the computed value

**Returns:**
- The same state object (for chaining)

**Example:**
```js
const state = ReactiveUtils.state({ count: 5 });

computed(state, {
  doubled() {
    return this.count * 2;
  },
  tripled() {
    return this.count * 3;
  }
});
```

 

## Why Does This Exist?

### The Challenge with Plain JavaScript

In vanilla JavaScript, when you have values that depend on other values, you must recalculate them manually:

```javascript
// Plain JavaScript approach
let price = 100;
let quantity = 3;
let taxRate = 0.1;

// Calculate derived values manually
let subtotal = price * quantity;        // 300
let tax = subtotal * taxRate;           // 30
let total = subtotal + tax;             // 330

console.log(total); // 330

// When source data changes, you must recalculate everything manually
price = 150;
subtotal = price * quantity;  // ❌ Must remember to update
tax = subtotal * taxRate;     // ❌ Must remember to update
total = subtotal + tax;       // ❌ Must remember to update

console.log(total); // 495
```

**Problems with this approach:**
❌ Manual recalculation required after every change
❌ Easy to forget to update derived values, causing incorrect results
❌ Must remember the calculation order (dependencies)
❌ Derived values can get out of sync with source data
❌ Code becomes repetitive and error-prone
❌ Adding new derived values means more manual updates

### What Situation Is This Designed For?

Applications frequently need values that are calculated from other values:
- Shopping cart totals based on items and quantities
- Full names derived from first and last names
- Formatted dates from timestamps
- Status indicators based on multiple conditions
- Calculations that depend on multiple inputs

Manually keeping these derived values synchronized is tedious and error-prone. `computed()` is designed specifically to solve this problem.

### How Does `computed()` Help?

With `computed()`, derived values automatically stay synchronized:

```javascript
const cart = state({
  price: 100,
  quantity: 3,
  taxRate: 0.1
});

// Add computed properties that automatically update
computed(cart, {
  subtotal() {
    return this.price * this.quantity;
  },
  tax() {
    return this.subtotal * this.taxRate;
  },
  total() {
    return this.subtotal + this.tax;
  }
});

console.log(cart.total); // 330

// Just change the source data—computed values update automatically! ✨
cart.price = 150;
console.log(cart.total); // 495 (automatically recalculated!)

cart.quantity = 2;
console.log(cart.total); // 330 (automatically recalculated!)
```

**Benefits:**
✅ Derived values automatically stay synchronized
✅ No manual recalculation needed
✅ Impossible to forget updates
✅ Dependencies are tracked automatically
✅ Values are cached for performance
✅ Clean, declarative code

### When Does `computed()` Shine?

This method is particularly well-suited when:
- You have values derived from other values
- Calculations need to stay synchronized automatically
- You want to avoid repetitive manual updates
- Performance matters (caching prevents unnecessary recalculations)
- You're building complex state with interdependent properties

 

## Mental Model

Think of `computed()` like a **spreadsheet formula**:

```
Regular Properties (Input Cells):
┌─────────────────┐
│ price: 100      │ ← You enter this
│ quantity: 3     │ ← You enter this
│ taxRate: 0.1    │ ← You enter this
└─────────────────┘

Computed Properties (Formula Cells):
┌─────────────────────────┐
│ subtotal: =price*qty    │ ← Automatically calculated
│ tax: =subtotal*taxRate  │ ← Automatically calculated
│ total: =subtotal+tax    │ ← Automatically calculated
└─────────────────────────┘
         │
         ▼
When you change price to 150:
         │
         ▼
All formulas recalculate automatically! ✨
┌─────────────────────────┐
│ subtotal: 450           │
│ tax: 45                 │
│ total: 495              │
└─────────────────────────┘
```

**Key Insight:** Just like spreadsheet formulas automatically recalculate when their input cells change, computed properties automatically update when their dependencies change. You never have to manually trigger the calculation.

 

## How Does It Work?

### The Magic: Automatic Dependency Tracking

When you define a computed property, the reactive system watches which properties you access inside the function:

```
1️⃣ Define computed property
   ↓
computed(cart, {
  total() {
    return this.subtotal + this.tax;  ← Reads subtotal and tax
  }
});

2️⃣ First access triggers calculation
   ↓
console.log(cart.total);
   ↓
Function runs → tracks dependencies:
"total depends on: subtotal, tax"
   ↓
Result is cached: 330

3️⃣ When dependency changes
   ↓
cart.subtotal = 450;  ← Change detected!
   ↓
System marks total as "dirty"
   ↓
Next access recalculates automatically
```

### Under the Hood

```
computed(state, { total() { ... } })
         │
         ▼
┌────────────────────────┐
│  Track Dependencies    │
│  During First Run      │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   Cache Result         │
│   total: 330           │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Listen for Changes    │
│  to Dependencies       │
└───────────┬────────────┘
            │
            ▼
When dependency changes:
  → Mark as dirty
  → Next access recalculates
  → Cache new result
```

**What happens:**

1️⃣ When you define a computed property, the function is not executed yet
2️⃣ When you first **read** the property, the function runs and tracks dependencies
3️⃣ The result is **cached** for performance
4️⃣ When a dependency **changes**, the computed is marked as "dirty"
5️⃣ Next time you read it, it **recalculates** and caches the new result

This is completely automatic - you just define the calculation, and the reactive system handles everything else!

 

## Basic Usage

### Creating a Single Computed Property

The simplest way to use `computed()` is to add one computed property:

```js
const user = state({
  firstName: 'John',
  lastName: 'Doe'
});

// Add a computed property
computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
});

// Use it like a regular property
console.log(user.fullName); // "John Doe"

// It updates automatically
user.firstName = 'Jane';
console.log(user.fullName); // "Jane Doe"
```

### Accessing Computed Properties

Once added, computed properties work just like regular properties:

```js
const product = state({
  price: 100,
  discount: 0.2
});

computed(product, {
  salePrice() {
    return this.price * (1 - this.discount);
  }
});

// Access like any property
console.log(product.salePrice); // 80

// Use in expressions
const message = `Sale price: $${product.salePrice}`;

// Use in conditions
if (product.salePrice < 90) {
  console.log('Great deal!');
}
```

**Important:** You access computed properties without calling them as functions. Just use `state.propertyName`, not `state.propertyName()`.

 

## Adding Multiple Computed Properties

You can add multiple computed properties in one call:

```js
const rectangle = state({
  width: 10,
  height: 20
});

computed(rectangle, {
  area() {
    return this.width * this.height;
  },
  perimeter() {
    return 2 * (this.width + this.height);
  },
  diagonal() {
    return Math.sqrt(this.width ** 2 + this.height ** 2);
  }
});

console.log(rectangle.area);      // 200
console.log(rectangle.perimeter); // 60
console.log(rectangle.diagonal);  // 22.36...

// All update automatically
rectangle.width = 15;
console.log(rectangle.area);      // 300
console.log(rectangle.perimeter); // 70
console.log(rectangle.diagonal);  // 25
```

 

## Computed Properties with Dependencies

### Simple Dependencies

Computed properties automatically track what they read:

```js
const counter = state({
  count: 0
});

computed(counter, {
  doubled() {
    return this.count * 2;  // Depends on: count
  },
  isEven() {
    return this.count % 2 === 0;  // Depends on: count
  }
});

counter.count = 5;
console.log(counter.doubled); // 10
console.log(counter.isEven);  // false
```

### Complex Dependencies

Computed properties can depend on multiple properties:

```js
const account = state({
  balance: 1000,
  monthlyIncome: 3000,
  monthlyExpenses: 2500
});

computed(account, {
  monthlySavings() {
    return this.monthlyIncome - this.monthlyExpenses;
  },
  projectedBalanceNextMonth() {
    return this.balance + this.monthlySavings;
  },
  savingsRate() {
    return (this.monthlySavings / this.monthlyIncome) * 100;
  }
});

console.log(account.monthlySavings);              // 500
console.log(account.projectedBalanceNextMonth);   // 1500
console.log(account.savingsRate);                 // 16.67%

// Change income—all related computeds update
account.monthlyIncome = 4000;
console.log(account.monthlySavings);              // 1500
console.log(account.projectedBalanceNextMonth);   // 2500
console.log(account.savingsRate);                 // 37.5%
```

### Computed Depending on Other Computed

Computed properties can depend on other computed properties:

```js
const circle = state({
  radius: 5
});

computed(circle, {
  diameter() {
    return this.radius * 2;
  },
  circumference() {
    return Math.PI * this.diameter;  // Depends on computed 'diameter'
  },
  area() {
    return Math.PI * this.radius ** 2;
  }
});

console.log(circle.diameter);       // 10
console.log(circle.circumference);  // 31.41...
console.log(circle.area);           // 78.53...

// Change radius—entire chain updates
circle.radius = 10;
console.log(circle.diameter);       // 20
console.log(circle.circumference);  // 62.83...
console.log(circle.area);           // 314.15...
```

**What's happening:**
- `diameter` depends on `radius`
- `circumference` depends on `diameter` (which depends on `radius`)
- When `radius` changes, both `diameter` and `circumference` update automatically in the correct order

 

## Computed Properties Are Cached

### Why Caching Matters

Computed properties only recalculate when their dependencies change:

```js
const data = state({
  items: [1, 2, 3, 4, 5]
});

let calculationCount = 0;

computed(data, {
  sum() {
    calculationCount++;
    console.log('Calculating sum...');
    return this.items.reduce((a, b) => a + b, 0);
  }
});

// First access: calculates and caches
console.log(data.sum); // Logs: "Calculating sum..." → 15
console.log(calculationCount); // 1

// Second access: uses cached value (no recalculation!)
console.log(data.sum); // 15 (no log!)
console.log(calculationCount); // Still 1

// Third access: still cached
console.log(data.sum); // 15 (no log!)
console.log(calculationCount); // Still 1

// Change dependency: recalculates on next access
data.items.push(6);
console.log(data.sum); // Logs: "Calculating sum..." → 21
console.log(calculationCount); // 2
```

**What's happening:**
1️⃣ First access: function runs, result cached
2️⃣ Subsequent accesses: cached result returned (no recalculation)
3️⃣ When dependency changes: marked as dirty
4️⃣ Next access: recalculates and caches new result

### Performance Benefits

Caching prevents expensive calculations from running unnecessarily:

```js
const dataset = state({
  numbers: Array.from({ length: 10000 }, (_, i) => i)
});

computed(dataset, {
  average() {
    // Expensive calculation
    const sum = this.numbers.reduce((a, b) => a + b, 0);
    return sum / this.numbers.length;
  }
});

// Access multiple times—calculation only runs once
for (let i = 0; i < 100; i++) {
  console.log(dataset.average); // Same cached result, no recalculation
}
```

 

## Chaining and Composition

### Method Chaining

`computed()` returns the state object, allowing method chaining:

```js
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  age: 30
});

computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
})
.computed({
  isAdult() {
    return this.age >= 18;
  }
});

// Or chain with other methods
watch(computed(user, {
  displayName() {
    return this.fullName.toUpperCase();
  }
}), {
  displayName(newVal) {
    console.log('Display name changed:', newVal);
  }
});
```

### Building Complex State

Combine multiple computed properties to build rich state:

```js
const order = state({
  items: [
    { name: 'Widget', price: 10, quantity: 2 },
    { name: 'Gadget', price: 25, quantity: 1 }
  ],
  taxRate: 0.08,
  shippingCost: 5
});

computed(order, {
  subtotal() {
    return this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  },
  tax() {
    return this.subtotal * this.taxRate;
  },
  total() {
    return this.subtotal + this.tax + this.shippingCost;
  },
  itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },
  averageItemPrice() {
    return this.itemCount > 0 ? this.subtotal / this.itemCount : 0;
  }
});

console.log(order.subtotal);          // 45
console.log(order.tax);               // 3.6
console.log(order.total);             // 53.6
console.log(order.itemCount);         // 3
console.log(order.averageItemPrice);  // 15
```

 

## Real-World Examples

### Example 1: Shopping Cart

```js
const cart = state({
  items: [
    { id: 1, name: 'Laptop', price: 999, quantity: 1 },
    { id: 2, name: 'Mouse', price: 25, quantity: 2 }
  ],
  discountCode: '',
  taxRate: 0.1
});

computed(cart, {
  itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },
  subtotal() {
    return this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  },
  discount() {
    if (this.discountCode === 'SAVE10') {
      return this.subtotal * 0.1;
    }
    return 0;
  },
  afterDiscount() {
    return this.subtotal - this.discount;
  },
  tax() {
    return this.afterDiscount * this.taxRate;
  },
  total() {
    return this.afterDiscount + this.tax;
  },
  isEmpty() {
    return this.items.length === 0;
  }
});

// Display cart info
effect(() => {
  console.log(`Items: ${cart.itemCount}`);
  console.log(`Subtotal: $${cart.subtotal}`);
  console.log(`Discount: $${cart.discount}`);
  console.log(`Tax: $${cart.tax.toFixed(2)}`);
  console.log(`Total: $${cart.total.toFixed(2)}`);
});

// Add discount code
cart.discountCode = 'SAVE10';
// All computed values update automatically!
```

### Example 2: User Profile

```js
const profile = state({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  birthYear: 1990,
  joined: new Date('2020-01-15'),
  posts: 42,
  followers: 150,
  following: 200
});

computed(profile, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  username() {
    return this.email.split('@')[0];
  },
  age() {
    return new Date().getFullYear() - this.birthYear;
  },
  membershipYears() {
    const years = (new Date() - this.joined) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  },
  engagementRatio() {
    return (this.followers / this.following).toFixed(2);
  },
  isActive() {
    return this.posts > 10 && this.followers > 50;
  },
  displayBadge() {
    if (this.followers > 1000) return 'Influencer';
    if (this.posts > 100) return 'Contributor';
    if (this.membershipYears > 5) return 'Veteran';
    return 'Member';
  }
});

console.log(profile.fullName);         // "John Doe"
console.log(profile.age);              // 34 (in 2024)
console.log(profile.displayBadge);     // "Member"
console.log(profile.engagementRatio);  // "0.75"
```

### Example 3: Form Validation

```js
const loginForm = state({
  email: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false
});

computed(loginForm, {
  emailValid() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  },
  passwordValid() {
    return this.password.length >= 8;
  },
  passwordsMatch() {
    return this.password === this.confirmPassword;
  },
  formValid() {
    return this.emailValid &&
           this.passwordValid &&
           this.passwordsMatch &&
           this.agreedToTerms;
  },
  emailError() {
    if (!this.email) return '';
    return this.emailValid ? '' : 'Invalid email format';
  },
  passwordError() {
    if (!this.password) return '';
    return this.passwordValid ? '' : 'Password must be at least 8 characters';
  },
  confirmError() {
    if (!this.confirmPassword) return '';
    return this.passwordsMatch ? '' : 'Passwords do not match';
  }
});

// Auto-update submit button
effect(() => {
  const button = document.getElementById('submit');
  button.disabled = !loginForm.formValid;
});

// Auto-display errors
effect(() => {
  document.getElementById('emailError').textContent = loginForm.emailError;
  document.getElementById('passwordError').textContent = loginForm.passwordError;
  document.getElementById('confirmError').textContent = loginForm.confirmError;
});
```

### Example 4: Data Dashboard

```js
const dashboard = state({
  sales: [100, 150, 200, 180, 220],
  expenses: [80, 90, 85, 95, 100],
  targetRevenue: 1000
});

computed(dashboard, {
  totalSales() {
    return this.sales.reduce((a, b) => a + b, 0);
  },
  totalExpenses() {
    return this.expenses.reduce((a, b) => a + b, 0);
  },
  profit() {
    return this.totalSales - this.totalExpenses;
  },
  profitMargin() {
    return ((this.profit / this.totalSales) * 100).toFixed(2);
  },
  averageSale() {
    return (this.totalSales / this.sales.length).toFixed(2);
  },
  targetProgress() {
    return ((this.totalSales / this.targetRevenue) * 100).toFixed(2);
  },
  onTrack() {
    return this.totalSales >= this.targetRevenue * 0.8;
  },
  status() {
    if (this.targetProgress >= 100) return 'Target achieved!';
    if (this.onTrack) return 'On track';
    return 'Behind target';
  }
});

// Display dashboard
effect(() => {
  console.log('=== DASHBOARD ===');
  console.log(`Total Sales: $${dashboard.totalSales}`);
  console.log(`Total Expenses: $${dashboard.totalExpenses}`);
  console.log(`Profit: $${dashboard.profit}`);
  console.log(`Profit Margin: ${dashboard.profitMargin}%`);
  console.log(`Target Progress: ${dashboard.targetProgress}%`);
  console.log(`Status: ${dashboard.status}`);
});
```

 

## Common Pitfalls

### Pitfall #1: Calling Computed Properties as Functions

❌ **Wrong:**
```js
const user = state({ firstName: 'John', lastName: 'Doe' });

computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
});

console.log(user.fullName()); // ERROR: fullName is not a function
```

✅ **Correct:**
```js
const user = state({ firstName: 'John', lastName: 'Doe' });

computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
});

console.log(user.fullName); // "John Doe" - access as property
```

**What's happening:**
- Computed properties are accessed like properties, not called as functions
- They automatically run when accessed, no need to call them

 

### Pitfall #2: Modifying Computed Properties

❌ **Wrong:**
```js
const cart = state({ price: 100, quantity: 2 });

computed(cart, {
  total() {
    return this.price * this.quantity;
  }
});

cart.total = 500; // This will not work as expected!
```

✅ **Correct:**
```js
const cart = state({ price: 100, quantity: 2 });

computed(cart, {
  total() {
    return this.price * this.quantity;
  }
});

// Change source properties instead
cart.price = 250;  // total automatically becomes 500
```

**What's happening:**
- Computed properties are read-only derived values
- To change them, modify the source properties they depend on
- The computed value will update automatically

 

### Pitfall #3: Not Using `this` to Access State Properties

❌ **Wrong:**
```js
const user = state({ firstName: 'John', lastName: 'Doe' });

computed(user, {
  fullName() {
    return `${firstName} ${lastName}`; // ERROR: variables not defined
  }
});
```

✅ **Correct:**
```js
const user = state({ firstName: 'John', lastName: 'Doe' });

computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`; // Use 'this'
  }
});
```

**What's happening:**
- Inside computed functions, use `this` to access state properties
- `this` refers to the state object
- This is how dependency tracking works

 

### Pitfall #4: Side Effects in Computed Properties

❌ **Wrong:**
```js
const counter = state({ count: 0 });

computed(counter, {
  doubled() {
    console.log('Calculating doubled'); // ❌ Side effect!
    document.title = `Count: ${this.count}`; // ❌ Side effect!
    return this.count * 2;
  }
});
```

✅ **Correct:**
```js
const counter = state({ count: 0 });

computed(counter, {
  doubled() {
    return this.count * 2; // Pure calculation only
  }
});

// Use effects for side effects
effect(() => {
  console.log('Count:', counter.count);
  document.title = `Count: ${counter.count}`;
});
```

**What's happening:**
- Computed properties should be pure functions (no side effects)
- They should only calculate and return values
- Use `effect()` for side effects like logging or DOM updates

 

### Pitfall #5: Infinite Loops with Circular Dependencies

❌ **Wrong:**
```js
const state = ReactiveUtils.state({ a: 1, b: 2 });

computed(state, {
  total() {
    return this.a + this.b + this.average; // Reads average
  },
  average() {
    return this.total / 2; // Reads total - CIRCULAR!
  }
});

console.log(state.total); // May cause infinite loop or error
```

✅ **Correct:**
```js
const state = ReactiveUtils.state({ a: 1, b: 2 });

computed(state, {
  total() {
    return this.a + this.b;
  },
  average() {
    return this.total / 2; // One-way dependency
  }
});

console.log(state.total);   // 3
console.log(state.average); // 1.5
```

**What's happening:**
- Avoid circular dependencies between computed properties
- Create one-way dependency chains
- If A depends on B, B should not depend on A

 

### Pitfall #6: Forgetting to Return a Value

❌ **Wrong:**
```js
const user = state({ firstName: 'John', lastName: 'Doe' });

computed(user, {
  fullName() {
    `${this.firstName} ${this.lastName}`; // Missing return!
  }
});

console.log(user.fullName); // undefined
```

✅ **Correct:**
```js
const user = state({ firstName: 'John', lastName: 'Doe' });

computed(user, {
  fullName() {
    return `${this.firstName} ${this.lastName}`; // Return the value
  }
});

console.log(user.fullName); // "John Doe"
```

 

## Summary

**What is `computed()`?**

`computed()` adds derived properties to reactive state that automatically recalculate when their dependencies change.

 

**Why use `computed()` instead of manual calculations?**

- Automatic synchronization with source data
- Intelligent caching for performance
- No manual update calls needed
- Impossible to forget to recalculate
- Clean, declarative code
- Dependency tracking handled automatically

 

**Key Points to Remember:**

1️⃣ **Access as properties, not functions** - Use `state.computed`, not `state.computed()`

2️⃣ **Read-only derived values** - Change source properties, not computed properties

3️⃣ **Use `this` to access state** - `this.propertyName` inside computed functions

4️⃣ **Pure functions only** - No side effects, only calculations

5️⃣ **Avoid circular dependencies** - Create one-way dependency chains

6️⃣ **Always return a value** - Computed functions must return the calculated result

7️⃣ **Automatically cached** - Recalculates only when dependencies change

 

**Mental Model:** Think of `computed()` like **spreadsheet formulas** - they automatically recalculate when their input cells change. You define the formula once, and it stays synchronized forever.

 

**Quick Reference:**

```js
// Create state
const state = ReactiveUtils.state({ price: 100, quantity: 2 });

// Add computed properties
computed(state, {
  total() {
    return this.price * this.quantity;
  },
  discount() {
    return this.total * 0.1;
  }
});

// Access as properties
console.log(state.total);    // 200
console.log(state.discount); // 20

// Changes propagate automatically
state.price = 150;
console.log(state.total);    // 300
console.log(state.discount); // 30
```

 

**Remember:** `computed()` is your tool for creating derived values that stay automatically synchronized with their source data. It eliminates manual recalculation and keeps your state consistent! ✨
