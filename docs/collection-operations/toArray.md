# `collection.toArray()` - Convert to Plain Array

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

// Convert to plain array
const array = todos.toArray();
console.log(array);
// [{ id: 1, text: 'Buy milk', done: false }, ...]

console.log(Array.isArray(array));  // true

// Now it's a regular array
array.push({ id: 4, text: 'New task' });
console.log(array.length);  // 4
console.log(todos.length);  // 3 (original unchanged)

// Use with array methods
const serialized = JSON.stringify(todos.toArray());
console.log(serialized);

// Send to API
fetch('/api/todos', {
  method: 'POST',
  body: JSON.stringify(todos.toArray())
});

// Spread into new array
const combined = [...todos.toArray(), ...otherItems]; ✨
```

**What just happened?** You converted a collection to a plain JavaScript array!

 

## What is `collection.toArray()`?

`toArray()` is a method that **creates a shallow copy** of the collection's items as a plain JavaScript array.

Simply put: it gives you a regular array copy of all items.

Think of it as **making a photocopy** - you get a duplicate that's independent from the original.

 

## Syntax

```javascript
collection.toArray()
```

**Parameters:** None

**Returns:** Array - A new plain array containing all items (shallow copy)

 

## Why Does This Exist?

### The Problem: Direct items Access

Without `toArray()`, getting a plain array requires accessing items directly:

```javascript
const todos = createCollection([...]);

// Direct access to items
const array = todos.items;  // Reference, not copy!

// Or manual copy
const copy = [...todos.items];

// Breaking abstraction
```

**Problems:**
❌ **Break abstraction** - Must know about `.items`  
❌ **Risk of mutation** - Direct reference  
❌ **Manual copying** - Must remember spread  

### The Solution with `toArray()`

```javascript
const todos = createCollection([...]);

// Clean method
const array = todos.toArray();

// Clear intent: get array copy ✅
```

**Benefits:**
✅ **Semantic** - Name expresses intent  
✅ **Safe copy** - Not a reference  
✅ **Clean API** - No `.items` needed  
✅ **Standard method** - Common pattern  

 

## Mental Model

Think of `toArray()` as **making a copy**:

```
Collection               toArray()           Plain Array
┌──────────────┐        ┌─────────┐        ┌──────────────┐
│ Items:       │        │ Copy    │        │ [Item 1]     │
│ [Item 1]     │───────→│ items   │───────→│ [Item 2]     │
│ [Item 2]     │        │ array   │        │ [Item 3]     │
│ [Item 3]     │        └─────────┘        └──────────────┘
└──────────────┘                           (independent)
  (unchanged)
```

**Key Insight:** Creates new array, original collection unchanged.

 

## How It Works

```javascript
// From 03_dh-reactive-collections.js
toArray() {
  return [...this.items];
}
```

Simple method:
- Spreads items into new array
- Shallow copy (references preserved)
- Returns plain array

 

## Basic Usage

### Example 1: Get Plain Array

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

const array = numbers.toArray();
console.log(array);  // [1, 2, 3, 4, 5]
console.log(Array.isArray(array));  // true
```

 

### Example 2: Independent Copy

```javascript
const items = createCollection([1, 2, 3]);

const array = items.toArray();
array.push(4);

console.log(array);        // [1, 2, 3, 4]
console.log(items.items);  // [1, 2, 3] - unchanged
```

 

### Example 3: Serialize to JSON

```javascript
const todos = createCollection([...]);

const json = JSON.stringify(todos.toArray());
localStorage.setItem('todos', json);
```

 

### Example 4: Combine Arrays

```javascript
const favorites = createCollection(['a', 'b']);
const recent = createCollection(['c', 'd']);

const combined = [...favorites.toArray(), ...recent.toArray()];
console.log(combined);  // ['a', 'b', 'c', 'd']
```

 

## Real-World Examples

### Example 1: API Submission

```javascript
const formFields = createCollection([
  { name: 'email', value: 'user@example.com' },
  { name: 'password', value: 'secret123' }
]);

async function submitForm() {
  const data = formFields.toArray();
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

 

### Example 2: Export Data

```javascript
const records = createCollection([...]);

function exportToCSV() {
  const data = records.toArray();
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  downloadFile(csv, 'export.csv');
}
```

 

### Example 3: Filter and Process

```javascript
const products = createCollection([...]);

function getActiveProducts() {
  const all = products.toArray();
  return all.filter(p => p.active && p.stock > 0);
}

const active = getActiveProducts();
console.log(`${active.length} active products`);
```

 

### Example 4: Clone for Modification

```javascript
const original = createCollection([...]);

function getModifiedCopy() {
  const copy = original.toArray();
  
  copy.forEach(item => {
    item.processed = true;
    item.timestamp = Date.now();
  });
  
  return copy;
}
```

 

### Example 5: Save to LocalStorage

```javascript
const settings = createCollection([
  { key: 'theme', value: 'dark' },
  { key: 'lang', value: 'en' }
]);

function saveSettings() {
  const data = settings.toArray();
  localStorage.setItem('settings', JSON.stringify(data));
  console.log('Settings saved');
}

function loadSettings() {
  const data = JSON.parse(localStorage.getItem('settings') || '[]');
  settings.reset(data);
  console.log('Settings loaded');
}
```

 

### Example 6: Merge Collections

```javascript
const list1 = createCollection([1, 2, 3]);
const list2 = createCollection([4, 5, 6]);

function mergeCollections(...collections) {
  const merged = collections.flatMap(col => col.toArray());
  return createCollection(merged);
}

const combined = mergeCollections(list1, list2);
console.log(combined.items);  // [1, 2, 3, 4, 5, 6]
```

 

### Example 7: Batch Processing

```javascript
const tasks = createCollection([...]);

async function processBatch() {
  const batch = tasks.toArray();
  
  console.log(`Processing ${batch.length} tasks...`);
  
  const results = await Promise.all(
    batch.map(task => processTask(task))
  );
  
  console.log(`Completed ${results.length} tasks`);
  return results;
}
```

 

### Example 8: Report Generation

```javascript
const sales = createCollection([...]);

function generateReport() {
  const data = sales.toArray();
  
  const total = data.reduce((sum, sale) => sum + sale.amount, 0);
  const average = total / data.length;
  
  return {
    totalSales: total,
    averageSale: average,
    count: data.length,
    data: data
  };
}
```

 

### Example 9: Create Backup

```javascript
const users = createCollection([...]);

function createBackup() {
  const backup = {
    timestamp: Date.now(),
    count: users.length,
    data: users.toArray()
  };
  
  localStorage.setItem('users_backup', JSON.stringify(backup));
  console.log('Backup created');
}

function restoreBackup() {
  const backup = JSON.parse(localStorage.getItem('users_backup'));
  
  if (backup && backup.data) {
    users.reset(backup.data);
    console.log(`Restored ${backup.count} users`);
  }
}
```

 

### Example 10: Table Export

```javascript
const tableData = createCollection([...]);

function exportTable() {
  const rows = tableData.toArray();
  
  const table = document.createElement('table');
  
  // Headers
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  Object.keys(rows[0]).forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  });
  
  // Body
  const tbody = table.createTBody();
  rows.forEach(row => {
    const tr = tbody.insertRow();
    Object.values(row).forEach(value => {
      const td = tr.insertCell();
      td.textContent = value;
    });
  });
  
  return table.outerHTML;
}
```

 

## Common Patterns

### Pattern 1: Clone for External Use

```javascript
function getDataCopy() {
  return collection.toArray();
}
```

 

### Pattern 2: Safe Mutation

```javascript
function modifyData(fn) {
  const copy = collection.toArray();
  fn(copy);
  return copy;
}
```

 

### Pattern 3: Serialize

```javascript
function serialize() {
  return JSON.stringify(collection.toArray());
}
```

 

### Pattern 4: Combine Multiple Collections

```javascript
const merged = [
  ...collection1.toArray(),
  ...collection2.toArray(),
  ...collection3.toArray()
];
```

 

## Important Notes

### 1. Shallow Copy

```javascript
const items = createCollection([
  { id: 1, data: { x: 1 } }
]);

const array = items.toArray();
array[0].data.x = 99;

console.log(items.first.data.x);  // 99 (nested object shared!)

// For deep copy, use structuredClone or library
const deepCopy = structuredClone(items.toArray());
```

 

### 2. Independent Array

```javascript
const items = createCollection([1, 2, 3]);

const array = items.toArray();
array.push(4);

console.log(array);        // [1, 2, 3, 4]
console.log(items.items);  // [1, 2, 3]
```

 

### 3. Not a Reference

```javascript
// toArray() creates new array
const arr1 = collection.toArray();
const arr2 = collection.toArray();

console.log(arr1 === arr2);  // false (different arrays)

// .items is a reference
console.log(collection.items === collection.items);  // true
```

 

### 4. No Parameters

```javascript
// ✓ Correct
collection.toArray()

// ❌ Wrong - doesn't take parameters
collection.toArray(start, end)  // Use slice() instead
```

 

## When to Use

**Use `toArray()` For:**
✅ API submissions  
✅ JSON serialization  
✅ Export/backup data  
✅ Array method chains  
✅ Combine collections  
✅ External library integration  

**Don't Use For:**
❌ Direct item access - Use `.items` if needed  
❌ Filtering - Use `filter()` which returns array  
❌ Mapping - Use `map()` which returns array  

 

## Comparison with Alternatives

```javascript
const items = createCollection([1, 2, 3]);

// toArray() - Semantic method
items.toArray();  // [1, 2, 3]

// Spread items - Manual
[...items.items];  // [1, 2, 3]

// Slice items - Verbose
items.items.slice();  // [1, 2, 3]

// Direct items - Reference!
items.items;  // Same reference
```

**Best:** Use `toArray()` for clarity and safety.

 

## Performance

`toArray()` creates a new array:

```javascript
// O(n) time - copies all items
// O(n) space - new array created
const array = collection.toArray();

// For read-only access, use .items
const ref = collection.items;  // O(1), but mutable!
```

 

## Summary

**What is `collection.toArray()`?**  
A method that creates a shallow copy as a plain array.

**Why use it?**
- ✅ Semantic clarity
- ✅ Safe copy
- ✅ Clean API
- ✅ Standard pattern

**Key Takeaway:**

```
Direct .items          toArray()
      |                    |
Reference             Copy ✓
      |                    |
Mutable               Safe ✅
```

**One-Line Rule:** Use `toArray()` to get a safe array copy for external use.

**Best Practices:**
- Use for API/serialization
- Remember it's shallow copy
- Independent from collection
- Creates new array each call
- No parameters

**Remember:** `toArray()` gives you a safe, independent array copy! 🎉