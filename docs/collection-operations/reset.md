# `collection.reset(newItems)` - Reset Collection with New Items

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true }
]);

console.log(todos.length);  // 2

// Reset with new items
todos.reset([
  { id: 3, text: 'Clean room', done: false },
  { id: 4, text: 'Cook dinner', done: false },
  { id: 5, text: 'Read book', done: false }
]);

console.log(todos.length);  // 3
console.log(todos.first.text);  // "Clean room" ✨

// Reset to empty
todos.reset([]);
console.log(todos.length);  // 0

// Reset with defaults
todos.reset([
  { text: 'Default task 1', done: false },
  { text: 'Default task 2', done: false }
]);

// Reactive updates
effect(() => {
  console.log(`Collection has ${todos.length} items`);
});

todos.reset([{ text: 'New task' }]);
// Effect runs with new count
```

**What just happened?** You replaced all items in the collection at once!

 

## What is `collection.reset(newItems)`?

`reset(newItems)` **replaces all current items** with a new set of items.

Simply put: it clears the collection and adds new items in one operation.

 

## Syntax

```javascript
collection.reset(newItems = [])
```

**Parameters:**
- `newItems` (Array, optional) - New items to set, default: `[]`

**Returns:** The collection (for chaining)

 

## Basic Usage

```javascript
const items = createCollection([1, 2, 3]);

// Reset with new items
items.reset([4, 5, 6]);
console.log(items.items);  // [4, 5, 6]

// Reset to empty
items.reset([]);
console.log(items.length);  // 0

// Reset to defaults
items.reset([1, 2, 3]);
console.log(items.items);  // [1, 2, 3]
```

 

## Real-World Examples

### Example 1: Load Fresh Data

```javascript
const products = createCollection([]);

async function loadProducts() {
  showLoading();
  
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    
    products.reset(data);
    
    console.log(`Loaded ${products.length} products`);
  } catch (error) {
    console.error('Failed to load products:', error);
  } finally {
    hideLoading();
  }
}
```

 

### Example 2: Filter and Reset

```javascript
const allItems = [...];  // Original data
const filtered = createCollection(allItems);

function applyFilters(filters) {
  let result = allItems;
  
  if (filters.category) {
    result = result.filter(item => item.category === filters.category);
  }
  
  if (filters.minPrice) {
    result = result.filter(item => item.price >= filters.minPrice);
  }
  
  filtered.reset(result);
  
  console.log(`${filtered.length} items match filters`);
}
```

 

### Example 3: Reset Form

```javascript
const formFields = createCollection([
  { name: 'email', value: 'user@example.com', error: null },
  { name: 'password', value: 'secret', error: null }
]);

function resetForm() {
  formFields.reset([
    { name: 'email', value: '', error: null },
    { name: 'password', value: '', error: null }
  ]);
  
  console.log('Form reset to defaults');
}
```

 

### Example 4: Reload from Storage

```javascript
const settings = createCollection([]);

function loadSettings() {
  const stored = localStorage.getItem('settings');
  
  if (stored) {
    const data = JSON.parse(stored);
    settings.reset(data);
    console.log('Settings loaded from storage');
  } else {
    // Use defaults
    settings.reset([
      { key: 'theme', value: 'light' },
      { key: 'language', value: 'en' }
    ]);
    console.log('Using default settings');
  }
}

function saveSettings() {
  localStorage.setItem('settings', JSON.stringify(settings.toArray()));
  console.log('Settings saved');
}
```

 

### Example 5: Pagination Reset

```javascript
const displayedItems = createCollection([]);
const allData = [...];  // All items

function goToPage(pageNum, pageSize = 10) {
  const start = pageNum * pageSize;
  const end = start + pageSize;
  const pageData = allData.slice(start, end);
  
  displayedItems.reset(pageData);
  
  console.log(`Page ${pageNum + 1}: showing ${displayedItems.length} items`);
}

// Navigate
goToPage(0);  // First page
goToPage(1);  // Second page
```

 

## Important Notes

### 1. Clears Then Adds (Two Steps Internally)

```javascript
// Internally:
// 1. Clear: items.length = 0
// 2. Add all: items.push(...newItems)

collection.reset([1, 2, 3]);

// Same as:
collection.clear();
newItems.forEach(item => collection.add(item));
```

 

### 2. Triggers Reactivity Once

```javascript
let runCount = 0;

effect(() => {
  const _ = collection.items;
  runCount++;
});

// Only triggers once (not twice)
collection.reset([1, 2, 3]);
console.log(runCount);  // 1
```

 

### 3. Default is Empty Array

```javascript
// These are equivalent
collection.reset();
collection.reset([]);
collection.clear();
```

 

### 4. Returns Collection (Chainable)

```javascript
collection
  .reset([1, 2, 3])
  .add(4)
  .removeWhere(n => n > 2);
```

 

## When to Use

**Use `reset()` For:**
✅ Load new data  
✅ Refresh from API  
✅ Apply filters  
✅ Restore defaults  
✅ Reload from storage  

**Don't Use For:**
❌ Just clearing - Use `clear()`  
❌ Adding to existing - Use `add()`  

 

## Comparison with Alternatives

```javascript
const items = createCollection([1, 2, 3]);

// reset() - Replace all at once
items.reset([4, 5, 6]);

// clear() then add - Two operations
items.clear();
items.add(4);
items.add(5);
items.add(6);

// Direct assignment - Breaks reactivity!
items.items = [4, 5, 6];  // ❌ Don't do this
```

 

## Common Patterns

### Pattern 1: Reset with Validation

```javascript
function safeReset(newItems) {
  if (!Array.isArray(newItems)) {
    console.error('reset() requires an array');
    return;
  }
  
  collection.reset(newItems);
  console.log(`Reset to ${collection.length} items`);
}
```

 

### Pattern 2: Reset and Report

```javascript
function resetAndReport(newItems) {
  const oldCount = collection.length;
  collection.reset(newItems);
  const newCount = collection.length;
  
  console.log(`Reset: ${oldCount} → ${newCount} items`);
}
```

 

### Pattern 3: Conditional Reset

```javascript
function resetIfDifferent(newItems) {
  const current = JSON.stringify(collection.toArray());
  const incoming = JSON.stringify(newItems);
  
  if (current !== incoming) {
    collection.reset(newItems);
    return true;
  }
  
  return false;
}
```

 

## Performance

Efficient for bulk replacement:

```javascript
// O(n) where n is new items length
collection.reset(newItems);

// Better than:
collection.clear();
newItems.forEach(item => collection.add(item));
// (triggers reactivity multiple times)
```

 

## Summary

**What is `collection.reset(newItems)`?**  
Replaces all items with new ones.

**Why use it?**
- ✅ Bulk replacement
- ✅ Load fresh data
- ✅ One operation
- ✅ Chainable

**Key Takeaway:**

```
clear() + add()         reset()
      |                    |
Two steps             One step
      |                    |
Multiple triggers     Single trigger ✅
```

**Remember:** Replaces all items efficiently in one operation! 🎉