# `collection.slice(start, end)` - Get Slice of Items

## Quick Start (30 seconds)

```javascript
const items = createCollection([10, 20, 30, 40, 50]);

// Get slice
const slice = items.slice(1, 3);
console.log(slice);  // [20, 30]

// From index to end
const fromTwo = items.slice(2);
console.log(fromTwo);  // [30, 40, 50]

// Negative indices
const lastTwo = items.slice(-2);
console.log(lastTwo);  // [40, 50]

// Get copy of all
const copy = items.slice();
console.log(copy);  // [10, 20, 30, 40, 50]

// Original unchanged
console.log(items.items);  // [10, 20, 30, 40, 50] ✨
```

**What just happened?** You extracted a portion of the collection as a new array!

 

## What is `collection.slice(start, end)`?

`slice(start, end)` returns a **shallow copy** of a portion of items as a new array.

Simply put: it extracts a section without modifying the original.

Think of it as **cutting a piece of paper** - you get a section, the original stays whole.

 

## Syntax

```javascript
collection.slice(start, end)
```

**Parameters:**
- `start` (number, optional) - Start index (inclusive), default 0
  - Negative: count from end
- `end` (number, optional) - End index (exclusive), default length
  - Negative: count from end

**Returns:** Array - New array with sliced items

 

## Basic Usage

```javascript
const nums = createCollection([1, 2, 3, 4, 5]);

nums.slice(1, 3);   // [2, 3]
nums.slice(2);      // [3, 4, 5]
nums.slice(-2);     // [4, 5]
nums.slice(0, 2);   // [1, 2]
nums.slice();       // [1, 2, 3, 4, 5] (copy all)
```

 

## Real-World Examples

### Example 1: Pagination

```javascript
const products = createCollection([...]);  // 100 items
const pageSize = 10;

function getPage(pageNum) {
  const start = pageNum * pageSize;
  const end = start + pageSize;
  return products.slice(start, end);
}

const page1 = getPage(0);  // Items 0-9
const page2 = getPage(1);  // Items 10-19
```

 

### Example 2: Recent Items

```javascript
const logs = createCollection([...]);

function getRecentLogs(count = 10) {
  return logs.slice(-count);  // Last 10 items
}

const recent = getRecentLogs(5);
console.log(`Last 5 logs:`, recent);
```

 

### Example 3: Skip First Item

```javascript
const queue = createCollection(['first', 'second', 'third']);

const remaining = queue.slice(1);
console.log(remaining);  // ['second', 'third']
```

 

### Example 4: First N Items

```javascript
const todos = createCollection([...]);

function getTopPriority(n = 5) {
  return todos.slice(0, n);
}

const top3 = getTopPriority(3);
```

 

## Important Notes

### 1. Returns Array, Not Collection

```javascript
const result = collection.slice(0, 2);
console.log(Array.isArray(result));  // true
console.log(result.add);  // undefined (not a collection)
```

 

### 2. Original Unchanged

```javascript
const items = createCollection([1, 2, 3]);
const slice = items.slice(0, 2);

console.log(slice);        // [1, 2]
console.log(items.items);  // [1, 2, 3] - unchanged
```

 

### 3. Shallow Copy

```javascript
const items = createCollection([{ x: 1 }, { x: 2 }]);
const slice = items.slice(0, 1);

slice[0].x = 99;
console.log(items.first.x);  // 99 (object shared!)
```

 

## When to Use

**Use `slice()` For:**
✅ Pagination  
✅ Get subset of items  
✅ Recent/first N items  
✅ Range extraction  

**Don't Use For:**
❌ Full copy - Use `toArray()`  
❌ Filtering - Use `filter()`  

 

## Summary

**What is `slice(start, end)`?**  
Returns a shallow copy of a portion as an array.

**Remember:** Returns array, original unchanged, supports negative indices! 🎉