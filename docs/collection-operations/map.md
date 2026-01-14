# `collection.map(fn)` - Transform Collection Items to Array

## Quick Start (30 seconds)

```javascript
const products = createCollection([
  { name: 'Laptop', price: 999 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 }
]);

// Extract prices
const prices = products.map(p => p.price);
console.log(prices);  // [999, 25, 75]

// Transform to HTML
const html = products.map(p => {
  return `<div>${p.name}: $${p.price}</div>`;
});
console.log(html);
// ['<div>Laptop: $999</div>', '<div>Mouse: $25</div>', ...]

// Transform with index
const numbered = products.map((p, i) => {
  return `${i + 1}. ${p.name}`;
});
console.log(numbered);
// ['1. Laptop', '2. Mouse', '3. Keyboard']

// Chain transformations
const doubled = products
  .map(p => p.price)
  .map(price => price * 2);
console.log(doubled);  // [1998, 50, 150] ✨
```

**What just happened?** You transformed collection items into a new array!

 

## What is `collection.map(fn)`?

`map(fn)` is a method that **transforms each item in a collection** and returns a new array of results.

Simply put: it creates a new array by running a function on every item.

Think of it as **a transformation assembly line** - each item goes in, gets transformed, and comes out as something new.

 

## Syntax

```javascript
collection.map(fn)
```

**Parameters:**
- `fn` (Function) - Transform function called for each item: `(item, index, array) => any`
  - `item` - Current item
  - `index` - Current index (0-based)
  - `array` - The items array
  - Returns transformed value

**Returns:** New array of transformed values

 

## Why Does This Exist?

### The Problem: Must Access items Array

Without `map()`, you must use the items array directly:

```javascript
const products = createCollection([...]);

// Must access .items
const prices = products.items.map(p => p.price);

// Can't chain smoothly
const result = products.items
  .map(p => p.price)
  .filter(price => price > 50);

// Breaking collection abstraction
```

**What's the Real Issue?**

```
Need to transform
        |
        v
Access .items array
        |
        v
Use array.map()
        |
        v
Break abstraction ❌
```

**Problems:**
❌ **Break abstraction** - Must expose `.items`  
❌ **Inconsistent API** - Mix collection and array methods  
❌ **Less clean** - Extra `.items` everywhere  

### The Solution with `map()`

```javascript
const products = createCollection([...]);

// Direct collection API
const prices = products.map(p => p.price);

// Clean and consistent
const result = products
  .map(p => p.price)
  .filter(price => price > 50);

// Consistent collection API ✅
```

**What Just Happened?**

```
Call map(fn)
        |
        v
Transform each item
        |
        v
Collect in new array
        |
        v
Return array ✅
```

**Benefits:**
✅ **Clean API** - No `.items` needed  
✅ **Consistent** - Part of collection API  
✅ **Familiar** - Works like Array.map()  
✅ **Chainable** - With array methods  

 

## Mental Model

Think of `map()` as **a transformation factory**:

```
Collection Items        Transform          New Array
┌──────────────┐       ┌──────────┐      ┌──────────────┐
│ { price: 10 }│──────→│ Extract  │─────→│ 10           │
│ { price: 20 }│──────→│ price    │─────→│ 20           │
│ { price: 15 }│──────→│ value    │─────→│ 15           │
└──────────────┘       └──────────┘      └──────────────┘
  Original items       (fn)               Transformed array
  (unchanged)                             (new array)
```

**Key Insight:** Original items unchanged, returns new array.

 

## How It Works

The complete flow:

```
products.map(fn)
        |
        ▼
Loop through items
        |
        ▼
For each item:
  result = fn(item, index, items)
  Add to new array
        |
        ▼
All items transformed
        |
        ▼
Return new array
```

### Implementation

```javascript
// From 03_dh-reactive-collections.js
map(fn) {
  return this.items.map(fn);
}
```

Simple wrapper:
- Calls native array map on items
- Passes function directly
- Returns the new array

 

## Basic Usage

### Example 1: Extract Property

```javascript
const users = createCollection([
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 }
]);

// Extract names
const names = users.map(u => u.name);
console.log(names);  // ['Alice', 'Bob', 'Charlie']

// Extract IDs
const ids = users.map(u => u.id);
console.log(ids);  // [1, 2, 3]
```

 

### Example 2: Transform Values

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

// Double each number
const doubled = numbers.map(n => n * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// Square each number
const squared = numbers.map(n => n * n);
console.log(squared);  // [1, 4, 9, 16, 25]
```

 

### Example 3: Create Objects

```javascript
const fruits = createCollection(['apple', 'banana', 'orange']);

// Create objects from strings
const fruitObjects = fruits.map((fruit, index) => ({
  id: index + 1,
  name: fruit,
  inStock: true
}));

console.log(fruitObjects);
// [
//   { id: 1, name: 'apple', inStock: true },
//   { id: 2, name: 'banana', inStock: true },
//   { id: 3, name: 'orange', inStock: true }
// ]
```

 

### Example 4: Generate HTML

```javascript
const todos = createCollection([
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: true }
]);

const htmlElements = todos.map(todo => {
  return `
    <div class="todo ${todo.done ? 'done' : ''}">
      ${todo.text}
    </div>
  `;
});

console.log(htmlElements);
// ['<div class="todo">Buy milk</div>', '<div class="todo done">Walk dog</div>']

// Join and render
document.getElementById('todos').innerHTML = htmlElements.join('');
```

 

## Real-World Examples

### Example 1: Format Currency

```javascript
const prices = createCollection([
  { product: 'Laptop', amount: 999.99 },
  { product: 'Mouse', amount: 25.50 },
  { product: 'Keyboard', amount: 75.00 }
]);

const formatted = prices.map(item => ({
  product: item.product,
  price: `$${item.amount.toFixed(2)}`
}));

console.log(formatted);
// [
//   { product: 'Laptop', price: '$999.99' },
//   { product: 'Mouse', price: '$25.50' },
//   { product: 'Keyboard', price: '$75.00' }
// ]
```

 

### Example 2: Build API Payload

```javascript
const formData = createCollection([
  { field: 'name', value: 'John Doe' },
  { field: 'email', value: 'john@example.com' },
  { field: 'age', value: '30' }
]);

// Transform to API format
const payload = formData.map(item => ({
  key: item.field,
  data: item.value,
  timestamp: Date.now()
}));

console.log(payload);
// [
//   { key: 'name', data: 'John Doe', timestamp: ... },
//   { key: 'email', data: 'john@example.com', timestamp: ... },
//   ...
// ]
```

 

### Example 3: Calculate Totals

```javascript
const orderItems = createCollection([
  { name: 'Widget', price: 10, qty: 2 },
  { name: 'Gadget', price: 25, qty: 1 },
  { name: 'Tool', price: 15, qty: 3 }
]);

const itemTotals = orderItems.map(item => ({
  name: item.name,
  subtotal: item.price * item.qty
}));

console.log(itemTotals);
// [
//   { name: 'Widget', subtotal: 20 },
//   { name: 'Gadget', subtotal: 25 },
//   { name: 'Tool', subtotal: 45 }
// ]

// Get grand total
const grandTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
console.log('Total:', grandTotal);  // 90
```

 

### Example 4: Normalize Data

```javascript
const rawData = createCollection([
  { firstName: 'Alice', lastName: 'Smith', country: 'US' },
  { firstName: 'Bob', lastName: 'Jones', country: 'UK' },
  { firstName: 'Charlie', lastName: 'Brown', country: 'CA' }
]);

const normalized = rawData.map(person => ({
  fullName: `${person.firstName} ${person.lastName}`,
  location: person.country.toUpperCase(),
  id: `${person.firstName.toLowerCase()}_${person.lastName.toLowerCase()}`
}));

console.log(normalized);
// [
//   { fullName: 'Alice Smith', location: 'US', id: 'alice_smith' },
//   { fullName: 'Bob Jones', location: 'UK', id: 'bob_jones' },
//   { fullName: 'Charlie Brown', location: 'CA', id: 'charlie_brown' }
// ]
```

 

### Example 5: Create Select Options

```javascript
const countries = createCollection([
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' }
]);

const options = countries.map(country => 
  `<option value="${country.code}">${country.name}</option>`
);

document.querySelector('#country-select').innerHTML = options.join('');
```

 

### Example 6: Add Timestamps

```javascript
const events = createCollection([
  { type: 'login', user: 'alice' },
  { type: 'purchase', user: 'bob' },
  { type: 'logout', user: 'alice' }
]);

const withTimestamps = events.map(event => ({
  ...event,
  timestamp: new Date().toISOString(),
  id: Math.random().toString(36).substr(2, 9)
}));

console.log(withTimestamps);
// [
//   { type: 'login', user: 'alice', timestamp: '2024-...', id: 'x7k2m...' },
//   ...
// ]
```

 

### Example 7: Extract URLs from Objects

```javascript
const images = createCollection([
  { id: 1, src: '/img/photo1.jpg', alt: 'Photo 1' },
  { id: 2, src: '/img/photo2.jpg', alt: 'Photo 2' },
  { id: 3, src: '/img/photo3.jpg', alt: 'Photo 3' }
]);

// Preload images
const urls = images.map(img => img.src);

urls.forEach(url => {
  const img = new Image();
  img.src = url;
});

console.log('Preloading:', urls);
```

 

### Example 8: Calculate Age from Birthdate

```javascript
const people = createCollection([
  { name: 'Alice', birthYear: 1990 },
  { name: 'Bob', birthYear: 1985 },
  { name: 'Charlie', birthYear: 2000 }
]);

const currentYear = new Date().getFullYear();

const withAges = people.map(person => ({
  name: person.name,
  age: currentYear - person.birthYear
}));

console.log(withAges);
// [
//   { name: 'Alice', age: 34 },
//   { name: 'Bob', age: 39 },
//   { name: 'Charlie', age: 24 }
// ]
```

 

### Example 9: Format Dates

```javascript
const logs = createCollection([
  { action: 'login', timestamp: 1704067200000 },
  { action: 'purchase', timestamp: 1704153600000 },
  { action: 'logout', timestamp: 1704240000000 }
]);

const formatted = logs.map(log => ({
  action: log.action,
  date: new Date(log.timestamp).toLocaleDateString(),
  time: new Date(log.timestamp).toLocaleTimeString()
}));

console.log(formatted);
// [
//   { action: 'login', date: '1/1/2024', time: '12:00:00 AM' },
//   ...
// ]
```

 

### Example 10: Create Table Rows

```javascript
const employees = createCollection([
  { name: 'Alice', role: 'Engineer', salary: 90000 },
  { name: 'Bob', role: 'Designer', salary: 75000 },
  { name: 'Charlie', role: 'Manager', salary: 95000 }
]);

const rows = employees.map((emp, index) => `
  <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
    <td>${emp.name}</td>
    <td>${emp.role}</td>
    <td>$${emp.salary.toLocaleString()}</td>
  </tr>
`);

document.querySelector('#employees tbody').innerHTML = rows.join('');
```

 

## Common Patterns

### Pattern 1: Chain with Array Methods

```javascript
const result = collection
  .map(item => item.value)
  .filter(value => value > 10)
  .sort((a, b) => a - b);
```

 

### Pattern 2: Transform and Reduce

```javascript
const total = collection
  .map(item => item.price * item.qty)
  .reduce((sum, subtotal) => sum + subtotal, 0);
```

 

### Pattern 3: Extract Multiple Properties

```javascript
const data = collection.map(item => ({
  id: item.id,
  name: item.name,
  status: item.active ? 'Active' : 'Inactive'
}));
```

 

### Pattern 4: Add Computed Properties

```javascript
const enhanced = collection.map(item => ({
  ...item,
  fullName: `${item.firstName} ${item.lastName}`,
  isAdult: item.age >= 18
}));
```

 

### Pattern 5: Convert to Lookup Object

```javascript
const lookup = Object.fromEntries(
  collection.map(item => [item.id, item])
);

// Access by ID
const item = lookup[5];
```

 

## Important Notes

### 1. Returns New Array

```javascript
const original = createCollection([1, 2, 3]);

const doubled = original.map(n => n * 2);

console.log(original.items);  // [1, 2, 3] - unchanged
console.log(doubled);          // [2, 4, 6] - new array
```

 

### 2. Returns Array, Not Collection

```javascript
const collection = createCollection([1, 2, 3]);

const result = collection.map(n => n * 2);

console.log(Array.isArray(result));     // true
console.log(result.add);                // undefined (not a collection)

// To continue with collection methods, create new collection
const newCollection = createCollection(result);
newCollection.add(8);
```

 

### 3. Callback Gets Index and Array

```javascript
collection.map((item, index, array) => {
  console.log('Item:', item);
  console.log('Index:', index);
  console.log('Total:', array.length);
  return item * 2;
});
```

 

### 4. Always Returns Array of Same Length

```javascript
const items = createCollection([1, 2, 3]);

// map always returns 3 items
const result = items.map(n => n > 1 ? n * 2 : null);
console.log(result);  // [null, 4, 6] - still 3 items

// To filter, chain with filter()
const filtered = items
  .map(n => n * 2)
  .filter(n => n > 2);
console.log(filtered);  // [4, 6]
```

 

## When to Use

### Use `map()` For:

✅ **Transform items** - Create new array from collection  
✅ **Extract properties** - Get specific fields  
✅ **Format data** - Change structure or format  
✅ **Generate HTML** - Create markup from data  
✅ **Calculate values** - Derive new values  
✅ **Chain operations** - Combine with filter/reduce  

### Don't Use For:

❌ **Side effects only** - Use `forEach()` instead  
❌ **No transformation** - Just iterate  
❌ **Filtering** - Use `filter()` instead  
❌ **Single value** - Use `reduce()` instead  

 

## Comparison with forEach()

```javascript
const numbers = createCollection([1, 2, 3]);

// forEach - side effects, returns collection
numbers.forEach(n => console.log(n));
// Returns: collection

// map - transformation, returns new array
const doubled = numbers.map(n => n * 2);
// Returns: [2, 4, 6]
```

**Use `map()` when:** You need a transformed array  
**Use `forEach()` when:** You need side effects without transformation  

 

## Performance

`map()` creates a new array:

```javascript
// O(n) time - processes each item once
// O(n) space - creates new array
const result = collection.map(fn);
```

For large collections, consider if transformation is needed:
```javascript
// If just iterating - use forEach (no new array)
collection.forEach(item => process(item));

// If transforming - use map
const transformed = collection.map(item => transform(item));
```

 

## Summary

**What is `collection.map(fn)`?**  
A method that transforms each item in a collection and returns a new array.

**Why use it?**
- ✅ Clean collection API
- ✅ Returns transformed array
- ✅ Original collection unchanged
- ✅ Chainable with array methods
- ✅ Familiar array-like syntax

**Key Takeaway:**

```
forEach()                map()
    |                      |
Side effects          Transformation
    |                      |
Returns collection    Returns array ✅
```

**One-Line Rule:** Use `map()` to transform collection items into a new array.

**Best Practices:**
- Use for transformations, not side effects
- Remember it returns an array, not a collection
- Chain with filter/reduce for complex operations
- Original collection remains unchanged
- Returns array of same length as collection

**Remember:** `map()` transforms items and returns a new array! 🎉