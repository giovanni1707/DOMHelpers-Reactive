# `collection.clear()` - Clear All Items from Collection

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

console.log(todos.length);  // 3

// Clear all items
todos.clear();

console.log(todos.length);  // 0
console.log(todos.items);   // []
console.log(todos.isEmpty());  // true ✨

// Reactive updates
effect(() => {
  const count = todos.length;
  document.getElementById('count').textContent = 
    count === 0 ? 'No tasks' : `${count} tasks`;
});

todos.add({ text: 'Task 1' });  // "1 tasks"
todos.clear();                   // "No tasks" (UI updates automatically)

// Method chaining
todos
  .add({ text: 'Task 1' })
  .add({ text: 'Task 2' })
  .clear()  // Removes both
  .add({ text: 'Fresh start' });

console.log(todos.length);  // 1 (only new item)
```

**What just happened?** You removed all items from a collection in one simple call!

 

## What is `collection.clear()`?

`clear()` is a method that **removes all items from a reactive collection**.

Simply put: it empties the collection completely, resetting it to an empty state.

Think of it as **dumping out a box** - everything inside gets removed, leaving it empty.

 

## Syntax

```javascript
collection.clear()
```

**Parameters:** None

**Returns:** The collection itself (for chaining)

 

## Why Does This Exist?

### The Problem: Manual Array Clearing

Without `clear()`, emptying a collection requires manual array manipulation:

```javascript
const todos = createCollection([...]);

// Option 1: Set length to 0
todos.items.length = 0;

// Option 2: Reassign empty array
todos.items = [];

// Option 3: Splice everything
todos.items.splice(0, todos.items.length);

// All verbose and unclear
```

**What's the Real Issue?**

```
Need to clear collection
        |
        v
Multiple ways to do it
        |
        v
Not obvious which is best
        |
        v
Intent unclear ❌
```

**Problems:**
❌ **Multiple approaches** - Confusing  
❌ **Unclear intent** - What's happening?  
❌ **No chaining** - Can't chain operations  
❌ **Manual** - Have to remember syntax  

### The Solution with `clear()`

```javascript
const todos = createCollection([...]);

// Clean, obvious API
todos.clear();

// Method chaining
todos
  .clear()
  .add({ text: 'New task' });

// Clear intent: "empty the collection" ✅
```

**What Just Happened?**

```
Call clear()
        |
        v
Array length set to 0
        |
        v
Collection emptied
        |
        v
Reactivity triggered
        |
        v
Return collection for chaining ✅
```

**Benefits:**
✅ **One method** - Clear and obvious  
✅ **Chainable** - Fluent API  
✅ **Semantic** - Intent is clear  
✅ **Reliable** - Always works the same  

 

## Mental Model

Think of `clear()` as **emptying a container**:

```
Before clear()              After clear()
┌─────────────┐            ┌─────────────┐
│  Items:     │            │  Items:     │
│  [Item 1]   │            │             │
│  [Item 2]   │  clear()   │   (empty)   │
│  [Item 3]   │  ────────→ │             │
│  [Item 4]   │            │             │
└─────────────┘            └─────────────┘
   4 items                    0 items
```

**Key Insight:** Everything is removed - collection becomes empty array `[]`.

 

## How It Works

The complete flow when you call `clear()`:

```
todos.clear()
        |
        ▼
this.items.length = 0
        |
        ▼
All items removed
        |
        ▼
Array is now []
        |
        ▼
Reactivity triggered
        |
        ▼
Effects re-run
        |
        ▼
UI updates
        |
        ▼
return this (for chaining)
```

### Implementation

```javascript
// From 03_dh-reactive-collections.js
clear() {
  this.items.length = 0;
  return this;
}
```

Simple and effective:
- Sets array length to 0 (fastest way to clear)
- Triggers reactivity automatically
- Returns collection for chaining

 

## Basic Usage

### Example 1: Clear Todo List

```javascript
const todos = createCollection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' },
  { id: 3, text: 'Task 3' }
]);

console.log(todos.length);  // 3

todos.clear();

console.log(todos.length);  // 0
console.log(todos.items);   // []
```

 

### Example 2: Clear and Repopulate

```javascript
const items = createCollection([1, 2, 3, 4, 5]);

// Clear old data
items.clear();

// Add new data
items.add(10).add(20).add(30);

console.log(items.items);  // [10, 20, 30]
```

 

### Example 3: Method Chaining

```javascript
const cart = createCollection([
  { product: 'A', qty: 1 },
  { product: 'B', qty: 2 }
]);

// Clear and start fresh
cart
  .clear()
  .add({ product: 'C', qty: 5 })
  .add({ product: 'D', qty: 1 });

console.log(cart.length);  // 2 (new items only)
```

 

## Real-World Examples

### Example 1: Clear Cart on Checkout

```javascript
const cart = createCollection([...]);

async function checkout() {
  try {
    // Process payment
    await processPayment(cart.items);
    
    // Success - clear cart
    cart.clear();
    
    showNotification('Order placed successfully!');
    redirectTo('/order-confirmation');
  } catch (error) {
    showError('Payment failed. Cart preserved.');
  }
}

// Button handler
document.getElementById('checkout-btn').onclick = checkout;
```

 

### Example 2: Reset Form Fields

```javascript
const formFields = createCollection([
  { name: 'email', value: 'user@example.com', error: null },
  { name: 'password', value: 'secret123', error: null },
  { name: 'confirm', value: 'secret123', error: null }
]);

function resetForm() {
  formFields.clear();
  
  // Re-add with default values
  formFields
    .add({ name: 'email', value: '', error: null })
    .add({ name: 'password', value: '', error: null })
    .add({ name: 'confirm', value: '', error: null });
  
  console.log('Form reset');
}

// Button handler
document.getElementById('reset-btn').onclick = resetForm;
```

 

### Example 3: Clear Search Results

```javascript
const searchResults = createCollection([...]);

// Show results in UI
effect(() => {
  const container = document.getElementById('results');
  
  if (searchResults.isEmpty()) {
    container.innerHTML = '<p>No results</p>';
  } else {
    container.innerHTML = searchResults.items.map(r => 
      `<div class="result">${r.title}</div>`
    ).join('');
  }
});

function clearSearch() {
  searchResults.clear();
  document.getElementById('search-input').value = '';
}

// Clear button handler
document.getElementById('clear-search').onclick = clearSearch;
```

 

### Example 4: Clear Notifications

```javascript
const notifications = createCollection([
  { id: 1, message: 'Welcome!', type: 'info' },
  { id: 2, message: 'Update available', type: 'warning' },
  { id: 3, message: 'Action required', type: 'error' }
]);

function clearAllNotifications() {
  const confirmed = confirm(
    `Clear all ${notifications.length} notifications?`
  );
  
  if (confirmed) {
    notifications.clear();
    showToast('All notifications cleared');
  }
}

// UI button
document.getElementById('clear-all').onclick = clearAllNotifications;
```

 

### Example 5: Clear Cache

```javascript
const cache = createCollection([]);

// Add items to cache
function addToCache(key, value) {
  cache.add({
    key,
    value,
    timestamp: Date.now()
  });
}

// Clear expired cache
function clearExpiredCache() {
  const EXPIRY = 5 * 60 * 1000;  // 5 minutes
  const cutoff = Date.now() - EXPIRY;
  
  const hasExpired = cache.items.some(
    item => item.timestamp < cutoff
  );
  
  if (hasExpired) {
    console.log('Clearing expired cache...');
    cache.clear();
  }
}

// Clear all cache
function clearAllCache() {
  cache.clear();
  console.log('Cache cleared');
}
```

 

### Example 6: Clear Selection

```javascript
const selectedItems = createCollection([]);

// Add items when selected
function selectItem(item) {
  selectedItems.add(item);
  updateUI();
}

// Clear all selections
function clearSelection() {
  selectedItems.clear();
  updateUI();
}

function updateUI() {
  const count = selectedItems.length;
  document.getElementById('selected-count').textContent = 
    count === 0 ? 'None selected' : `${count} selected`;
}

// Button handlers
document.getElementById('select-all').onclick = selectAll;
document.getElementById('clear-selection').onclick = clearSelection;
```

 

### Example 7: Clear Logs

```javascript
const activityLog = createCollection([]);

function logActivity(action) {
  activityLog.add({
    action,
    timestamp: new Date(),
    user: currentUser.name
  });
  
  // Keep only last 100 entries
  if (activityLog.length > 100) {
    activityLog.items.shift();  // Remove oldest
  }
}

function clearLogs() {
  const confirmed = confirm('Clear all activity logs?');
  
  if (confirmed) {
    activityLog.clear();
    console.log('Logs cleared');
  }
}
```

 

### Example 8: Reset Game State

```javascript
const gameItems = createCollection([]);

function startNewGame() {
  // Clear old game items
  gameItems.clear();
  
  // Add initial items
  gameItems
    .add({ type: 'player', x: 0, y: 0, health: 100 })
    .add({ type: 'enemy', x: 10, y: 10, health: 50 })
    .add({ type: 'powerup', x: 5, y: 5, value: 25 });
  
  console.log('New game started');
}

document.getElementById('new-game').onclick = startNewGame;
```

 

### Example 9: Clear Filters

```javascript
const activeFilters = createCollection([]);

// Add filter
function addFilter(filter) {
  activeFilters.add(filter);
  applyFilters();
}

// Clear all filters
function clearFilters() {
  activeFilters.clear();
  applyFilters();  // Show all items
}

function applyFilters() {
  const items = getAllItems();
  
  let filtered = items;
  activeFilters.items.forEach(filter => {
    filtered = filtered.filter(filter.fn);
  });
  
  displayItems(filtered);
}

document.getElementById('clear-filters').onclick = clearFilters;
```

 

### Example 10: Clear Undo History

```javascript
const undoHistory = createCollection([]);
const redoHistory = createCollection([]);

function performAction(action) {
  undoHistory.add(action);
  redoHistory.clear();  // Clear redo when new action
}

function undo() {
  if (undoHistory.length > 0) {
    const action = undoHistory.items.pop();
    redoHistory.add(action);
    revertAction(action);
  }
}

function redo() {
  if (redoHistory.length > 0) {
    const action = redoHistory.items.pop();
    undoHistory.add(action);
    applyAction(action);
  }
}

function clearHistory() {
  undoHistory.clear();
  redoHistory.clear();
  console.log('History cleared');
}
```

 

## Common Patterns

### Pattern 1: Clear and Reload

```javascript
async function refreshData() {
  // Clear old data
  collection.clear();
  
  // Show loading
  showLoading();
  
  try {
    // Fetch new data
    const data = await fetchData();
    
    // Add new items
    data.forEach(item => collection.add(item));
    
    hideLoading();
  } catch (error) {
    showError('Failed to load data');
  }
}
```

 

### Pattern 2: Conditional Clear

```javascript
function clearIf(condition) {
  if (condition) {
    collection.clear();
    return true;
  }
  return false;
}

// Usage
if (clearIf(userConfirmed)) {
  console.log('Collection cleared');
}
```

 

### Pattern 3: Clear with Confirmation

```javascript
function clearWithConfirm(message) {
  if (collection.isEmpty()) {
    console.log('Already empty');
    return false;
  }
  
  const confirmed = confirm(
    message || `Clear all ${collection.length} items?`
  );
  
  if (confirmed) {
    collection.clear();
    return true;
  }
  
  return false;
}
```

 

### Pattern 4: Clear and Reset to Defaults

```javascript
const defaultItems = [
  { id: 1, name: 'Default 1' },
  { id: 2, name: 'Default 2' }
];

function resetToDefaults() {
  collection.clear();
  defaultItems.forEach(item => {
    collection.add({ ...item });
  });
}
```

 

## Important Notes

### 1. Removes ALL Items

```javascript
const items = createCollection([1, 2, 3, 4, 5]);

items.clear();

console.log(items.items);    // []
console.log(items.length);   // 0
console.log(items.isEmpty()); // true

// Everything is gone ✅
```

 

### 2. Returns Collection for Chaining

```javascript
// Can chain operations
collection
  .clear()
  .add({ text: 'New item' })
  .add({ text: 'Another item' });

console.log(collection.length);  // 2
```

 

### 3. Safe to Call on Empty Collection

```javascript
const items = createCollection([]);

// Safe - no error
items.clear();

console.log(items.isEmpty());  // true
```

 

### 4. Triggers Reactivity

```javascript
const items = createCollection([1, 2, 3]);

let updateCount = 0;
effect(() => {
  const _ = items.length;
  updateCount++;
});

items.clear();  // Effect runs

console.log(updateCount);  // 2 (initial + after clear)
```

 

## When to Use

### Use `clear()` For:

✅ **Reset collections** - Start fresh  
✅ **Remove all items** - Empty completely  
✅ **Cart checkout** - Clear after purchase  
✅ **Form reset** - Clear all fields  
✅ **Cache clearing** - Remove old data  
✅ **Filter reset** - Remove all filters  
✅ **Method chaining** - Part of fluent API  

### Don't Use For:

❌ **Remove some items** - Use `remove()` or `removeWhere()`  
❌ **Replace data** - Just assign `items = newData`  
❌ **Remove specific items** - Use targeted removal  

 

## Comparison with Alternatives

```javascript
const items = createCollection([1, 2, 3, 4, 5]);

// clear() - Chainable, semantic
items.clear();

// Setting length - Works but not chainable
items.items.length = 0;

// Reassignment - Works but different reference
items.items = [];

// splice - Verbose
items.items.splice(0, items.items.length);
```

**Best:** Use `clear()` for clarity and chaining.

 

## Performance

`clear()` is very efficient:

```javascript
// O(1) operation - instant
collection.clear();

// Works the same for any size
const small = createCollection([1, 2, 3]);
const large = createCollection(Array(1000000).fill(0));

small.clear();  // Instant
large.clear();  // Also instant
```

 

## Summary

**What is `collection.clear()`?**  
A method that removes all items from a reactive collection.

**Why use it?**
- ✅ Simple and obvious
- ✅ Method chaining support
- ✅ Semantic clarity
- ✅ Automatic reactivity
- ✅ O(1) performance

**Key Takeaway:**

```
Manual Clearing         clear() Method
      |                       |
Multiple options        One method
      |                       |
Unclear intent         Obvious intent
      |                       |
Verbose ❌            Semantic ✅
```

**One-Line Rule:** Use `clear()` to empty a collection completely in one semantic call.

**Best Practices:**
- Use for complete resets
- Confirm before clearing important data
- Chain with add() to reset with new data
- Safe to call on empty collections
- Triggers reactivity automatically

**Remember:** `clear()` empties collections completely and instantly! 🎉