# `computedCollection()` - Collections with Computed Properties

## Quick Start (30 seconds)

```javascript
// Create collection with computed properties
const products = computedCollection(
  [
    { name: 'Laptop', price: 999, qty: 2 },
    { name: 'Mouse', price: 29, qty: 5 }
  ],
  {
    totalValue: function() {
      return this.items.reduce((sum, p) => sum + (p.price * p.qty), 0);
    },
    averagePrice: function() {
      return this.totalValue / this.items.length;
    }
  }
);

console.log(products.totalValue);    // 2143 (automatically calculated)
console.log(products.averagePrice);  // 1071.5

products.add({ name: 'Keyboard', price: 79, qty: 3 });
console.log(products.totalValue);    // 2380 (auto-updated!)
```

**That's it.** Create collections with computed properties that automatically recalculate when the collection changes.

---

## What is `computedCollection()`?

`computedCollection()` creates **reactive collections with cached computed properties**. It combines `createCollection()` with computed values that automatically update when items change.

Think of it as **a smart spreadsheet** — you define formulas (computed properties) that automatically recalculate when the data changes.

**In practical terms:** Instead of manually calculating totals, averages, or filtered counts, you define them once as computed properties and they stay in sync automatically.

---

## Syntax

```javascript
// Create collection with computed properties
const myCollection = computedCollection(initialItems, computedDefs);

// Access items and computed values
console.log(myCollection.items);        // Array of items
console.log(myCollection.computedProp); // Computed value

// Example
const cart = computedCollection(
  [{ name: 'Item', price: 10, qty: 2 }],
  {
    subtotal: function() {
      return this.items.reduce((sum, item) =>
        sum + (item.price * item.qty), 0
      );
    },
    tax: function() {
      return this.subtotal * 0.08;
    },
    total: function() {
      return this.subtotal + this.tax;
    }
  }
);

console.log(cart.total); // Automatically calculated
```

**Parameters:**
- `initialItems` (optional) - Array of initial items
- `computedDefs` (optional) - Object of computed property functions

**Returns:**
- Reactive collection with all `createCollection()` methods plus computed properties

---

## Why Does This Exist?

### The Problem Without computedCollection

```javascript
// ❌ Vanilla JavaScript - manual calculations
let cartItems = [
  { name: 'Laptop', price: 999, qty: 1 },
  { name: 'Mouse', price: 29, qty: 2 }
];

function calculateSubtotal() {
  return cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function calculateTax() {
  return calculateSubtotal() * 0.08;
}

function calculateTotal() {
  return calculateSubtotal() + calculateTax();
}

function updateDisplay() {
  document.getElementById('subtotal').textContent = `$${calculateSubtotal().toFixed(2)}`;
  document.getElementById('tax').textContent = `$${calculateTax().toFixed(2)}`;
  document.getElementById('total').textContent = `$${calculateTotal().toFixed(2)}`;
}

// Add item
cartItems.push({ name: 'Keyboard', price: 79, qty: 1 });
updateDisplay(); // Must recalculate and update manually!
```

**Problems:**
❌ **Manual recalculation** - Must call functions after every change
❌ **Repetitive calculations** - Same values calculated multiple times
❌ **No caching** - Expensive calculations run repeatedly
❌ **Manual DOM sync** - Must update display manually

### The Solution with `computedCollection()`

```javascript
// ✅ DOM Helpers + Reactive State with computedCollection() - automatic
const cart = computedCollection(
  [
    { name: 'Laptop', price: 999, qty: 1 },
    { name: 'Mouse', price: 29, qty: 2 }
  ],
  {
    subtotal: function() {
      return this.items.reduce((sum, item) =>
        sum + (item.price * item.qty), 0
      );
    },
    tax: function() {
      return this.subtotal * 0.08;
    },
    total: function() {
      return this.subtotal + this.tax;
    }
  }
);

// Auto-update DOM using bulk updates
effect(() => {
  Elements.update({
    subtotal: { textContent: `$${cart.subtotal.toFixed(2)}` },
    tax: { textContent: `$${cart.tax.toFixed(2)}` },
    total: { textContent: `$${cart.total.toFixed(2)}` }
  });
});

// Just modify the collection
cart.add({ name: 'Keyboard', price: 79, qty: 1 });
// ✨ Computed values recalculate, DOM updates automatically!
```

**Benefits:**
✅ **Automatic recalculation** - Computed values update when items change
✅ **Cached results** - Computed only when dependencies change
✅ **Clean code** - Define calculations once
✅ **No manual sync** - Effects run automatically

---

## Basic Usage

### Example 1: Shopping Cart with Totals

```javascript
const cart = computedCollection(
  [],
  {
    subtotal: function() {
      return this.items.reduce((sum, item) =>
        sum + (item.price * item.qty), 0
      );
    },
    tax: function() {
      return this.subtotal * 0.08;
    },
    total: function() {
      return this.subtotal + this.tax;
    },
    itemCount: function() {
      return this.items.reduce((sum, item) => sum + item.qty, 0);
    }
  }
);

effect(() => {
  Elements.update({
    itemCount: { textContent: `${cart.itemCount} items` },
    subtotal: { textContent: `$${cart.subtotal.toFixed(2)}` },
    tax: { textContent: `$${cart.tax.toFixed(2)}` },
    total: { textContent: `$${cart.total.toFixed(2)}` }
  });
});

cart.add({ name: 'Laptop', price: 999, qty: 1 });
cart.add({ name: 'Mouse', price: 29, qty: 2 });
// ✨ All totals update automatically
```

---

### Example 2: Todo List with Stats

```javascript
const todos = computedCollection(
  [],
  {
    activeCount: function() {
      return this.items.filter(t => !t.done).length;
    },
    completedCount: function() {
      return this.items.filter(t => t.done).length;
    },
    progress: function() {
      if (this.items.length === 0) return 0;
      return (this.completedCount / this.items.length) * 100;
    },
    isEmpty: function() {
      return this.items.length === 0;
    }
  }
);

effect(() => {
  Elements.update({
    activeCount: { textContent: `${todos.activeCount} active` },
    completedCount: { textContent: `${todos.completedCount} completed` },
    progress: { textContent: `${todos.progress.toFixed(0)}% complete` },
    progressBar: {
      style: { width: `${todos.progress}%` }
    }
  });
});

todos.add({ text: 'Buy milk', done: false });
todos.add({ text: 'Walk dog', done: true });
// ✨ Stats update automatically
```

---

### Example 3: Product Inventory

```javascript
const inventory = computedCollection(
  [
    { name: 'Laptop', price: 999, stock: 5, reorderPoint: 10 },
    { name: 'Mouse', price: 29, stock: 15, reorderPoint: 20 }
  ],
  {
    totalValue: function() {
      return this.items.reduce((sum, p) => sum + (p.price * p.stock), 0);
    },
    lowStockItems: function() {
      return this.items.filter(p => p.stock < p.reorderPoint);
    },
    lowStockCount: function() {
      return this.lowStockItems.length;
    },
    averageValue: function() {
      if (this.items.length === 0) return 0;
      return this.totalValue / this.items.length;
    }
  }
);

effect(() => {
  Elements.update({
    totalValue: { textContent: `$${inventory.totalValue.toLocaleString()}` },
    lowStockCount: {
      textContent: `${inventory.lowStockCount} items need reordering`,
      style: { color: inventory.lowStockCount > 0 ? 'red' : 'green' }
    },
    lowStockList: {
      innerHTML: inventory.lowStockItems
        .map(p => `<li>${p.name} (${p.stock} left)</li>`)
        .join('')
    }
  });
});
```

---

## Key Takeaways

✅ **Computed properties** - Auto-calculated from collection items
✅ **Cached results** - Only recalculates when items change
✅ **Clean syntax** - Define calculations once as methods
✅ **All collection methods** - Includes all `createCollection()` features
✅ **Reactive** - Works with effects and bindings

---

## What's Next?

- **`createCollection()`** - Basic reactive collections
- **`filteredCollection()`** - Filtered views of collections
- **`computed()`** - Add computed properties to any state

---

## Summary

`computedCollection()` creates **reactive collections with computed properties** that automatically recalculate when items change.

**The magic formula:**
```
computedCollection(items, computed) =
  createCollection(items) + computed properties
─────────────────────────────────────────────
Smart collection with auto-calculated values
```

Think of it as **a spreadsheet with formulas** — define your calculations once, and they stay in sync with your data automatically.
