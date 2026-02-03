# `computed()` - Derived Reactive Values

## Quick Start (30 seconds)

```javascript
const cart = state({
  items: [
    { name: 'Laptop', price: 999 },
    { name: 'Mouse', price: 29 }
  ],
  taxRate: 0.08
});

// Add computed properties
computed(cart, {
  subtotal: function() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },
  tax: function() {
    return this.subtotal * this.taxRate;
  },
  total: function() {
    return this.subtotal + this.tax;
  }
});

console.log(cart.total); // 1110.24 ✨

cart.items.push({ name: 'Keyboard', price: 79 });
console.log(cart.total); // 1195.56 ✨ (auto-updated!)
```

**That's it.** Computed values automatically recalculate when their dependencies change. No manual updates needed.

---

## What is `computed()`?

`computed()` creates **derived values that automatically stay in sync with their source data**. When any value they depend on changes, they recalculate automatically.

Think of it as **a formula in a spreadsheet**. When you write `=A1+B1`, the cell automatically updates whenever A1 or B1 changes. That's exactly what computed does for your state.

**In practical terms:** Instead of manually calculating values every time you need them, you define the formula once and the system keeps it up to date.

---

## Syntax

```javascript
// Add computed properties to existing state
computed(state, {
  propertyName: function() {
    return /* calculation using this.propertyX, this.propertyY */;
  }
});

// Access computed like regular properties
console.log(state.propertyName);
```

**Parameters:**
- `state` - The reactive state object to add computed properties to
- `definitions` - Object where keys are property names and values are getter functions

**Returns:**
- The same state object (for chaining)

---

## Why Does This Exist?

### The Problem Without computed()

Let's calculate a shopping cart total:

```javascript
// ❌ The manual way
const cart = {
  items: [
    { name: 'Laptop', price: 999 },
    { name: 'Mouse', price: 29 }
  ],
  taxRate: 0.08
};

function getSubtotal() {
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}

function getTax() {
  return getSubtotal() * cart.taxRate;
}

function getTotal() {
  return getSubtotal() + getTax();
}

// Display total
console.log('Total: $' + getTotal()); // 1110.24

// Add item
cart.items.push({ name: 'Keyboard', price: 79 });

// Must remember to recalculate!
console.log('Total: $' + getTotal()); // 1195.56

// What if you cache the total? It gets stale!
let cachedTotal = getTotal();
cart.items.push({ name: 'Monitor', price: 299 });
console.log('Cached: $' + cachedTotal); // ❌ Wrong! Still 1195.56
```

**What's the Real Issue?**

```
Calculate derived value
    ↓
Store/cache result
    ↓
Source data changes
    ↓
Cached value is STALE ❌
    ↓
Must manually recalculate
    ↓
Easy to forget → Bugs
```

**Problems:**
❌ **Manual recalculation** - Must call getTotal() every time
❌ **Stale values** - Cached results become outdated
❌ **Redundant computation** - Recalculates even when nothing changed
❌ **Scattered logic** - Calculation code repeated in multiple places

### The Solution with `computed()`

```javascript
// ✅ The reactive way
const cart = state({
  items: [
    { name: 'Laptop', price: 999 },
    { name: 'Mouse', price: 29 }
  ],
  taxRate: 0.08
});

computed(cart, {
  subtotal: function() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },
  tax: function() {
    return this.subtotal * this.taxRate;
  },
  total: function() {
    return this.subtotal + this.tax;
  }
});

console.log(cart.total); // 1110.24

// Add item - total updates automatically
cart.items.push({ name: 'Keyboard', price: 79 });
console.log(cart.total); // 1195.56 ✨

// Change tax rate - total updates automatically
cart.taxRate = 0.10;
console.log(cart.total); // 1217.70 ✨
```

**What Just Happened?**

```
Access computed value
    ↓
Check if dependencies changed
    ↓
[Changed] → Recalculate, cache new result
[Unchanged] → Return cached result
    ↓
Always correct, always efficient ✅
```

**Benefits:**
✅ **Auto-updates** - Values recalculate when dependencies change
✅ **Cached** - Only recalculates when necessary
✅ **Always correct** - Never stale or outdated
✅ **Clean code** - Define once, use everywhere

---

## Mental Model: The Spreadsheet Formula

Think of `computed()` like **formulas in a spreadsheet**:

**Without computed() (Manual Cells):**
```
┌─────────────────────────────────┐
│  A1: 100   (price)              │
│  B1: 2     (quantity)           │
│  C1: 200   (you typed this)     │
│                                 │
│  A1 changes to 150              │
│       ↓                         │
│  C1 still shows 200 ❌          │
│  (You must update it manually)  │
└─────────────────────────────────┘
```

**With computed() (Formula Cells):**
```
┌─────────────────────────────────┐
│  A1: 100   (price)              │
│  B1: 2     (quantity)           │
│  C1: =A1*B1  (formula)          │
│      └→ Shows: 200              │
│                                 │
│  A1 changes to 150              │
│       ↓                         │
│  C1 automatically shows 300 ✅  │
│  (The formula recalculates)     │
└─────────────────────────────────┘
```

**Key Insight:** Computed values are like spreadsheet formulas — they express relationships between data and automatically maintain those relationships.

---

## How Does It Work?

Under the hood, computed uses lazy evaluation with caching:

```
computed(state, { total: function() {...} })
                    ↓
┌─────────────────────────────────────────────────────┐
│ 1. Creates a getter for 'total' property            │
│    → Marked as "dirty" (needs calculation)          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. First access: state.total                        │
│    → Runs the function                              │
│    → Tracks which properties were read              │
│    → Caches the result                              │
│    → Marked as "clean"                              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. Later: Dependency changes                        │
│    → Computed marked as "dirty"                     │
│    → Next access will recalculate                   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. Next access: state.total                         │
│    → Sees "dirty" flag                              │
│    → Recalculates and caches new result             │
│    → Marked as "clean" again                        │
└─────────────────────────────────────────────────────┘
```

**Key Features:**

1️⃣ **Lazy Evaluation:**
```javascript
computed(cart, {
  expensiveCalculation: function() {
    console.log('Calculating...');
    return heavyComputation(this.data);
  }
});

// Nothing logged yet - calculation hasn't run

console.log(cart.expensiveCalculation); // "Calculating..." logged
console.log(cart.expensiveCalculation); // Nothing logged - cached!
```

2️⃣ **Automatic Dependency Tracking:**
```javascript
computed(state, {
  result: function() {
    return this.a + this.b; // System tracks: depends on a and b
  }
});

state.a = 10; // Marks 'result' as dirty
state.c = 20; // Doesn't affect 'result' (c not a dependency)
```

3️⃣ **Chained Computed Properties:**
```javascript
computed(cart, {
  subtotal: function() { return /* sum of items */; },
  tax: function() { return this.subtotal * this.taxRate; },  // Uses subtotal!
  total: function() { return this.subtotal + this.tax; }     // Uses both!
});

// Changing items → subtotal dirty → tax dirty → total dirty
// All three recalculate correctly!
```

---

## Basic Usage

### Example 1: Simple Derived Value

```javascript
const rectangle = state({
  width: 10,
  height: 5
});

computed(rectangle, {
  area: function() {
    return this.width * this.height;
  },
  perimeter: function() {
    return 2 * (this.width + this.height);
  }
});

console.log(rectangle.area);      // 50
console.log(rectangle.perimeter); // 30

rectangle.width = 20;
console.log(rectangle.area);      // 100 ✨
console.log(rectangle.perimeter); // 50 ✨
```

---

### Example 2: String Formatting

```javascript
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

computed(user, {
  fullName: function() {
    return `${this.firstName} ${this.lastName}`;
  },
  displayName: function() {
    return `${this.fullName} <${this.email}>`;
  },
  initials: function() {
    return `${this.firstName[0]}${this.lastName[0]}`;
  }
});

console.log(user.fullName);    // "John Doe"
console.log(user.displayName); // "John Doe <john@example.com>"
console.log(user.initials);    // "JD"

user.firstName = 'Jane';
console.log(user.fullName);    // "Jane Doe" ✨
console.log(user.initials);    // "JD" ✨
```

---

### Example 3: Array Aggregations

```javascript
const scores = state({
  values: [85, 92, 78, 95, 88]
});

computed(scores, {
  count: function() {
    return this.values.length;
  },
  sum: function() {
    return this.values.reduce((a, b) => a + b, 0);
  },
  average: function() {
    return this.count > 0 ? this.sum / this.count : 0;
  },
  highest: function() {
    return Math.max(...this.values);
  },
  lowest: function() {
    return Math.min(...this.values);
  }
});

console.log(scores.average); // 87.6
console.log(scores.highest); // 95

scores.values.push(100);
console.log(scores.average); // 89.67 ✨
console.log(scores.highest); // 100 ✨
```

---

### Example 4: Filtering and Counting

```javascript
const todos = state({
  items: [
    { text: 'Learn JavaScript', done: true },
    { text: 'Build an app', done: false },
    { text: 'Deploy to production', done: false }
  ]
});

computed(todos, {
  completedItems: function() {
    return this.items.filter(item => item.done);
  },
  pendingItems: function() {
    return this.items.filter(item => !item.done);
  },
  completedCount: function() {
    return this.completedItems.length;
  },
  pendingCount: function() {
    return this.pendingItems.length;
  },
  progressPercent: function() {
    const total = this.items.length;
    return total > 0 ? (this.completedCount / total) * 100 : 0;
  }
});

console.log(todos.pendingCount);     // 2
console.log(todos.progressPercent);  // 33.33

todos.items[1].done = true;
console.log(todos.pendingCount);     // 1 ✨
console.log(todos.progressPercent);  // 66.67 ✨
```

---

### Example 5: Conditional Values

```javascript
const subscription = state({
  plan: 'pro',
  billingCycle: 'annual',
  basePrice: 20
});

computed(subscription, {
  discount: function() {
    if (this.billingCycle === 'annual') return 0.20;
    if (this.plan === 'enterprise') return 0.15;
    return 0;
  },
  finalPrice: function() {
    return this.basePrice * (1 - this.discount);
  },
  displayPrice: function() {
    return `$${this.finalPrice.toFixed(2)}/month`;
  }
});

console.log(subscription.displayPrice); // "$16.00/month"

subscription.billingCycle = 'monthly';
console.log(subscription.displayPrice); // "$20.00/month" ✨
```

---

## Computed with DOM Helpers

### Example 1: Auto-Updating Display

```javascript
const product = state({
  name: 'Premium Widget',
  basePrice: 99,
  quantity: 1
});

computed(product, {
  lineTotal: function() {
    return this.basePrice * this.quantity;
  },
  formattedTotal: function() {
    return `$${this.lineTotal.toFixed(2)}`;
  }
});

// Effect uses computed values
effect(() => {
  Elements.update({
    productName: { textContent: product.name },
    lineTotal: { textContent: product.formattedTotal }
  });
});

product.quantity = 3;
// ✨ DOM automatically shows "$297.00"
```

---

### Example 2: Form Validation Status

```javascript
const form = state({
  email: '',
  password: '',
  confirmPassword: ''
});

computed(form, {
  isEmailValid: function() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  },
  isPasswordValid: function() {
    return this.password.length >= 8;
  },
  doPasswordsMatch: function() {
    return this.password === this.confirmPassword;
  },
  isFormValid: function() {
    return this.isEmailValid && this.isPasswordValid && this.doPasswordsMatch;
  },
  validationMessage: function() {
    if (!this.isEmailValid) return 'Please enter a valid email';
    if (!this.isPasswordValid) return 'Password must be at least 8 characters';
    if (!this.doPasswordsMatch) return 'Passwords do not match';
    return 'Ready to submit!';
  }
});

effect(() => {
  Elements.submitBtn.disabled = !form.isFormValid;
  Elements.validationMsg.textContent = form.validationMessage;
});
```

---

### Example 3: Dynamic Styling Based on State

```javascript
const theme = state({
  hue: 200,
  saturation: 70,
  lightness: 50
});

computed(theme, {
  primaryColor: function() {
    return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
  },
  primaryColorDark: function() {
    return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness - 20}%)`;
  },
  primaryColorLight: function() {
    return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness + 20}%)`;
  }
});

effect(() => {
  document.documentElement.style.setProperty('--primary', theme.primaryColor);
  document.documentElement.style.setProperty('--primary-dark', theme.primaryColorDark);
  document.documentElement.style.setProperty('--primary-light', theme.primaryColorLight);
});

// Color picker updates
theme.hue = 280; // ✨ All CSS variables update
```

---

## Real-World Examples

### Example 1: E-Commerce Cart Summary

```javascript
const cart = state({
  items: [],
  couponCode: '',
  shippingMethod: 'standard'
});

const SHIPPING_RATES = {
  standard: 5.99,
  express: 12.99,
  overnight: 24.99
};

const COUPONS = {
  'SAVE10': 0.10,
  'SAVE20': 0.20,
  'FREESHIP': 'free_shipping'
};

computed(cart, {
  itemCount: function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },
  subtotal: function() {
    return this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  },
  couponDiscount: function() {
    const coupon = COUPONS[this.couponCode];
    if (typeof coupon === 'number') {
      return this.subtotal * coupon;
    }
    return 0;
  },
  hasFreeShipping: function() {
    return COUPONS[this.couponCode] === 'free_shipping' || this.subtotal >= 50;
  },
  shippingCost: function() {
    if (this.hasFreeShipping) return 0;
    return SHIPPING_RATES[this.shippingMethod];
  },
  total: function() {
    return this.subtotal - this.couponDiscount + this.shippingCost;
  },
  savings: function() {
    const regularShipping = SHIPPING_RATES[this.shippingMethod];
    return this.couponDiscount + (this.hasFreeShipping ? regularShipping : 0);
  }
});

// Update cart display
effect(() => {
  Elements.update({
    itemCount: { textContent: `${cart.itemCount} items` },
    subtotal: { textContent: `$${cart.subtotal.toFixed(2)}` },
    shipping: { textContent: cart.hasFreeShipping ? 'FREE' : `$${cart.shippingCost.toFixed(2)}` },
    discount: { textContent: cart.savings > 0 ? `-$${cart.savings.toFixed(2)}` : '-' },
    total: { textContent: `$${cart.total.toFixed(2)}` }
  });
});
```

---

### Example 2: Data Table with Sorting and Filtering

```javascript
const table = state({
  data: [
    { name: 'Alice', age: 28, role: 'Developer' },
    { name: 'Bob', age: 35, role: 'Designer' },
    { name: 'Charlie', age: 42, role: 'Manager' }
  ],
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc'
});

computed(table, {
  filteredData: function() {
    if (!this.searchQuery) return this.data;

    const query = this.searchQuery.toLowerCase();
    return this.data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
  },
  sortedData: function() {
    const data = [...this.filteredData];
    const multiplier = this.sortOrder === 'asc' ? 1 : -1;

    return data.sort((a, b) => {
      const aVal = a[this.sortBy];
      const bVal = b[this.sortBy];

      if (typeof aVal === 'number') {
        return (aVal - bVal) * multiplier;
      }
      return String(aVal).localeCompare(String(bVal)) * multiplier;
    });
  },
  resultCount: function() {
    return this.sortedData.length;
  },
  isEmpty: function() {
    return this.resultCount === 0;
  }
});

effect(() => {
  Elements.resultCount.textContent = `${table.resultCount} results`;

  if (table.isEmpty) {
    Elements.tableBody.innerHTML = '<tr><td colspan="3">No results found</td></tr>';
  } else {
    Elements.tableBody.innerHTML = table.sortedData
      .map(row => `<tr><td>${row.name}</td><td>${row.age}</td><td>${row.role}</td></tr>`)
      .join('');
  }
});
```

---

### Example 3: Time and Duration Calculator

```javascript
const timer = state({
  startTime: null,
  endTime: null,
  isRunning: false
});

computed(timer, {
  durationMs: function() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return end - this.startTime;
  },
  durationSeconds: function() {
    return Math.floor(this.durationMs / 1000);
  },
  durationMinutes: function() {
    return Math.floor(this.durationSeconds / 60);
  },
  displayTime: function() {
    const mins = this.durationMinutes;
    const secs = this.durationSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },
  status: function() {
    if (!this.startTime) return 'Ready';
    if (this.isRunning) return 'Running';
    return 'Stopped';
  }
});

effect(() => {
  Elements.timerDisplay.textContent = timer.displayTime;
  Elements.timerStatus.textContent = timer.status;
});
```

---

## Common Patterns

### Pattern 1: Chained Computations

```javascript
computed(state, {
  step1: function() { return this.raw * 2; },
  step2: function() { return this.step1 + 10; },
  step3: function() { return this.step2 * this.multiplier; },
  final: function() { return Math.round(this.step3); }
});
```

---

### Pattern 2: Conditional Formatting

```javascript
computed(state, {
  statusClass: function() {
    if (this.value > 80) return 'status-good';
    if (this.value > 50) return 'status-warning';
    return 'status-danger';
  },
  statusIcon: function() {
    if (this.value > 80) return '✓';
    if (this.value > 50) return '⚠';
    return '✗';
  }
});
```

---

### Pattern 3: Plural/Singular Text

```javascript
computed(state, {
  itemText: function() {
    return this.count === 1 ? 'item' : 'items';
  },
  displayText: function() {
    return `${this.count} ${this.itemText}`;
  }
});
```

---

### Pattern 4: Derived Booleans

```javascript
computed(state, {
  isEmpty: function() { return this.items.length === 0; },
  hasItems: function() { return !this.isEmpty; },
  isFull: function() { return this.items.length >= this.maxItems; },
  canAdd: function() { return !this.isFull && this.isEnabled; }
});
```

---

### Pattern 5: Memoized Expensive Operations

```javascript
computed(state, {
  processedData: function() {
    // Only recalculates when rawData changes
    return this.rawData.map(item => expensiveTransform(item));
  },
  summary: function() {
    // Uses already-processed data
    return generateSummary(this.processedData);
  }
});
```

---

## Important Notes

### 1. Use Regular Functions, Not Arrow Functions

```javascript
// ❌ WRONG - Arrow function doesn't have correct 'this'
computed(state, {
  total: () => this.a + this.b  // 'this' is wrong!
});

// ✅ CORRECT - Regular function has correct 'this'
computed(state, {
  total: function() { return this.a + this.b; }
});
```

---

### 2. Computed Values Are Read-Only

```javascript
const state = state({ value: 10 });

computed(state, {
  doubled: function() { return this.value * 2; }
});

console.log(state.doubled); // 20

// ❌ Can't set computed values
state.doubled = 50; // Won't work as expected!

// ✅ Set the source value instead
state.value = 25;
console.log(state.doubled); // 50
```

---

### 3. Avoid Side Effects in Computed

```javascript
// ❌ BAD - Side effects in computed
computed(state, {
  total: function() {
    console.log('Calculating...'); // Side effect!
    document.title = 'Updated';    // Side effect!
    return this.a + this.b;
  }
});

// ✅ GOOD - Pure calculation only
computed(state, {
  total: function() {
    return this.a + this.b;
  }
});

// Put side effects in an effect
effect(() => {
  console.log('Total is:', state.total);
  document.title = `Total: ${state.total}`;
});
```

---

### 4. Computed Can Depend on Other Computed

```javascript
computed(state, {
  subtotal: function() { return this.price * this.quantity; },
  tax: function() { return this.subtotal * 0.08; },         // Uses subtotal
  shipping: function() { return this.subtotal > 50 ? 0 : 5; }, // Uses subtotal
  total: function() { return this.subtotal + this.tax + this.shipping; } // Uses all
});
```

---

## Summary

**What is `computed()`?**
A way to create derived values that automatically update when their dependencies change.

**Why use it?**
- ✅ Automatic recalculation when dependencies change
- ✅ Cached values (only recalculates when needed)
- ✅ Clean, declarative derived state
- ✅ Chainable computations
- ✅ Works seamlessly with effects and DOM Helpers

**Key Takeaway:**

```
Without computed()           With computed()
        |                          |
Manual recalculation       Automatic updates
        |                          |
Values get stale ❌        Always current ✅
```

**One-Line Rule:** Use `computed()` for any value that can be calculated from other values.

**The Magic Formula:**
```
state({ source data }) + computed({ derived values })
─────────────────────────────────────────────────────
Change source → Computed updates → Effects react → UI updates
```

**Best Practices:**
- Use regular functions (not arrow functions) for correct `this` binding
- Keep computed functions pure (no side effects)
- Chain computed values for complex calculations
- Combine with effects for DOM updates
- Use for formatting, filtering, aggregating, and transforming data

**Remember:** Computed values are like spreadsheet formulas — define the relationship once, and it stays in sync forever!
