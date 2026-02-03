# `collection.length` - Get Collection Length

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk' },
  { id: 2, text: 'Walk dog' },
  { id: 3, text: 'Clean room' }
]);

// Get length
console.log(todos.length);  // 3

// Use in conditionals
if (todos.length > 0) {
  console.log(`You have ${todos.length} todos`);
}

// Track changes
todos.add({ id: 4, text: 'New task' });
console.log(todos.length);  // 4

todos.remove(t => t.id === 1);
console.log(todos.length);  // 3

todos.clear();
console.log(todos.length);  // 0

// Reactive updates
effect(() => {
  const count = todos.length;
  document.getElementById('count').textContent = `${count} items`;
});
// Updates automatically when items change ✨
```

**What just happened?** You accessed the collection size with a clean getter property!

 

## What is `collection.length`?

`length` is a **getter property** that returns the number of items in the collection.

Simply put: it tells you how many items are in the collection.

Think of it as **counting items in a box** - you get the total count.

 

## Syntax

```javascript
collection.length
```

**Type:** Getter property (read-only)

**Returns:** Number - count of items (0 or more)

 

## Why Does This Exist?

### The Problem: Must Access items Array

Without `length`, you must use the items array:

```javascript
const todos = createCollection([...]);

// Must access .items
const count = todos.items.length;

// Breaking collection abstraction
```

**Problems:**
❌ **Break abstraction** - Must use `.items`  
❌ **Inconsistent API** - Mix collection and array access  

### The Solution with `length`

```javascript
const todos = createCollection([...]);

// Direct collection property
const count = todos.length;

// Clean and consistent ✅
```

**Benefits:**
✅ **Clean API** - No `.items` needed  
✅ **Consistent** - Part of collection interface  
✅ **Familiar** - Like array.length  

 

## Mental Model

Think of `length` as **the counter**:

```
Collection               Length
┌──────────────┐        ┌──────┐
│ [Item 1]     │        │      │
│ [Item 2]     │───────→│  5   │
│ [Item 3]     │        │      │
│ [Item 4]     │        └──────┘
│ [Item 5]     │
└──────────────┘
```

**Key Insight:** Always reflects current item count.

 

## How It Works

```javascript
// From 03_dh-reactive-collections.js
get length() {
  return this.items.length;
}
```

Simple getter:
- Returns items array length
- Always up-to-date
- Read-only property

 

## Basic Usage

### Example 1: Get Count

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

console.log(numbers.length);  // 5
```

 

### Example 2: Use in Conditionals

```javascript
const cart = createCollection([]);

if (cart.length === 0) {
  console.log('Cart is empty');
} else {
  console.log(`Cart has ${cart.length} items`);
}
```

 

### Example 3: Track Changes

```javascript
const items = createCollection([1, 2, 3]);

console.log('Initial:', items.length);  // 3

items.add(4);
console.log('After add:', items.length);  // 4

items.clear();
console.log('After clear:', items.length);  // 0
```

 

## Real-World Examples

### Example 1: Display Item Count

```javascript
const products = createCollection([...]);

effect(() => {
  const count = products.length;
  const label = count === 1 ? 'product' : 'products';
  document.getElementById('product-count').textContent = 
    `${count} ${label}`;
});
```

 

### Example 2: Pagination

```javascript
const items = createCollection([...]);
const pageSize = 10;

const totalPages = Math.ceil(items.length / pageSize);
console.log(`Total pages: ${totalPages}`);
```

 

### Example 3: Progress Tracking

```javascript
const tasks = createCollection([...]);

effect(() => {
  const total = tasks.length;
  const completed = tasks.items.filter(t => t.done).length;
  const percent = total > 0 ? (completed / total * 100).toFixed(0) : 0;
  
  document.getElementById('progress').textContent = 
    `${completed}/${total} (${percent}%)`;
});
```

 

### Example 4: Enable/Disable Buttons

```javascript
const selectedItems = createCollection([]);

effect(() => {
  const hasSelection = selectedItems.length > 0;
  document.getElementById('delete-btn').disabled = !hasSelection;
  document.getElementById('clear-btn').disabled = !hasSelection;
});
```

 

### Example 5: Batch Size Validation

```javascript
const batch = createCollection([]);

function addToBatch(item) {
  const MAX_BATCH_SIZE = 100;
  
  if (batch.length >= MAX_BATCH_SIZE) {
    throw new Error('Batch is full');
  }
  
  batch.add(item);
  console.log(`Batch: ${batch.length}/${MAX_BATCH_SIZE}`);
}
```

 

## Important Notes

### 1. Read-Only Property

```javascript
const items = createCollection([1, 2, 3]);

// ❌ Cannot set length directly
items.length = 5;  // Won't work

// ✓ Modify collection to change length
items.add(4);      // length becomes 4
items.clear();     // length becomes 0
```

 

### 2. Always Current

```javascript
const items = createCollection([1, 2, 3]);

console.log(items.length);  // 3

items.add(4);
console.log(items.length);  // 4 (automatically updated)
```

 

### 3. Zero for Empty Collection

```javascript
const empty = createCollection([]);
console.log(empty.length);  // 0
```

 

## When to Use

**Use `length` For:**
✅ Get item count  
✅ Check if empty (length === 0)  
✅ Display counts  
✅ Pagination calculations  
✅ Progress tracking  

**Don't Use For:**
❌ Setting collection size - Use add/remove/clear  
❌ Checking emptiness - Use `isEmpty()` for clarity  

 

## Summary

**What is `collection.length`?**  
A getter property that returns the number of items.

**Why use it?**
- ✅ Clean API
- ✅ Always current
- ✅ Familiar syntax
- ✅ Reactive-compatible

**Remember:** `length` is read-only and always up-to-date! 🎉