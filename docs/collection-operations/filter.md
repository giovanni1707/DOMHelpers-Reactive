# `collection.filter(predicate)` - Filter Items to New Array

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

// Filter by condition
const pending = todos.filter(todo => !todo.done);
console.log(pending);
// [{ id: 1, text: 'Buy milk', done: false }, { id: 3, ... }]

const completed = todos.filter(todo => todo.done);
console.log(completed);  // [{ id: 2, ... }]

// Chain with array methods
const texts = todos
  .filter(t => !t.done)
  .map(t => t.text);
console.log(texts);  // ['Buy milk', 'Clean room']

// Numbers
const numbers = createCollection([1, 2, 3, 4, 5]);
const even = numbers.filter(n => n % 2 === 0);
console.log(even);  // [2, 4] ✨
```

**What just happened?** You filtered items and got a new array matching your criteria!

 

## What is `collection.filter(predicate)`?

`filter(predicate)` returns a **new array** containing only items that pass the test.

Simply put: it keeps items that match your condition.

Think of it as **sifting through items** - you keep what matches, discard what doesn't.

 

## Syntax

```javascript
collection.filter(predicate)
```

**Parameters:**
- `predicate` (Function) - Test function: `(item, index, array) => boolean`
  - Returns `true` to keep item
  - Returns `false` to exclude item

**Returns:** Array - New array with matching items

 

## Basic Usage

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

// Filter even numbers
const even = numbers.filter(n => n % 2 === 0);
console.log(even);  // [2, 4]

// Filter by threshold
const large = numbers.filter(n => n > 3);
console.log(large);  // [4, 5]
```

 

## Real-World Examples

### Example 1: Active Users

```javascript
const users = createCollection([
  { name: 'Alice', active: true },
  { name: 'Bob', active: false },
  { name: 'Charlie', active: true }
]);

const activeUsers = users.filter(u => u.active);
console.log(`${activeUsers.length} active users`);
```

 

### Example 2: In Stock Products

```javascript
const products = createCollection([...]);

const available = products.filter(p => p.stock > 0 && p.active);

renderProducts(available);
```

 

### Example 3: Price Range

```javascript
const items = createCollection([...]);

function getInPriceRange(min, max) {
  return items.filter(item => 
    item.price >= min && item.price <= max
  );
}

const affordable = getInPriceRange(0, 50);
```

 

### Example 4: Search Results

```javascript
const data = createCollection([...]);

function search(query) {
  const lowerQuery = query.toLowerCase();
  
  return data.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  );
}

const results = search('laptop');
```

 

### Example 5: Complex Filter

```javascript
const orders = createCollection([...]);

const urgent = orders.filter(order => 
  order.priority === 'high' &&
  order.status === 'pending' &&
  new Date(order.dueDate) < new Date()
);

console.log(`${urgent.length} urgent orders`);
```

 

## Important Notes

### 1. Returns Array, Not Collection

```javascript
const result = collection.filter(x => x > 2);
console.log(Array.isArray(result));  // true
console.log(result.add);  // undefined
```

 

### 2. Original Unchanged

```javascript
const items = createCollection([1, 2, 3, 4]);
const filtered = items.filter(n => n > 2);

console.log(filtered);      // [3, 4]
console.log(items.items);   // [1, 2, 3, 4] - unchanged
```

 

### 3. Can Return Empty Array

```javascript
const none = collection.filter(item => false);
console.log(none);  // []
```

 

## When to Use

**Use `filter()` For:**
✅ Get subset matching criteria  
✅ Search/query results  
✅ Active/valid items  
✅ Price ranges  
✅ Complex conditions  

**Don't Use For:**
❌ Find single item - Use `find()`  
❌ Remove from collection - Use `removeWhere()`  

 

## Comparison

```javascript
const items = createCollection([1, 2, 3, 4, 5]);

// filter() - Returns array of all matches
items.filter(n => n > 2);  // [3, 4, 5]

// find() - Returns first match
items.find(n => n > 2);    // 3
```

 

## Summary

**What is `filter(predicate)`?**  
Returns new array with items passing the test.

**Remember:** Returns array, original unchanged, keeps all matches! 🎉