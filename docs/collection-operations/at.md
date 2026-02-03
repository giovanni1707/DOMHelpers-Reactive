# `collection.at(index)` - Get Item at Specific Index

## Quick Start (30 seconds)

```javascript
const items = createCollection(['apple', 'banana', 'orange', 'grape']);

// Get by index
const first = items.at(0);
console.log(first);  // "apple"

const second = items.at(1);
console.log(second);  // "banana"

// Negative indices (from end)
const last = items.at(-1);
console.log(last);  // "grape"

const secondLast = items.at(-2);
console.log(secondLast);  // "orange"

// Out of bounds returns undefined
const outOfBounds = items.at(10);
console.log(outOfBounds);  // undefined ✨
```

**What just happened?** You accessed items by position with support for negative indices!

 

## What is `collection.at(index)`?

`at(index)` returns the **item at the specified index**, with support for negative indices.

Simply put: it gets an item by its position, counting from start (positive) or end (negative).

Think of it as **picking a book from a shelf** - you can count from the left or from the right.

 

## Syntax

```javascript
collection.at(index)
```

**Parameters:**
- `index` (number) - Position of item
  - Positive: from start (0-based)
  - Negative: from end (-1 = last)

**Returns:** 
- Item at index
- `undefined` if out of bounds

 

## Why Does This Exist?

**The Problem:**
```javascript
// Direct array access breaks abstraction
const last = collection.items[collection.items.length - 1];
```

**The Solution:**
```javascript
// Clean collection API with negative index
const last = collection.at(-1);
```

 

## Basic Usage

```javascript
const colors = createCollection(['red', 'green', 'blue']);

colors.at(0);   // "red"
colors.at(1);   // "green"
colors.at(2);   // "blue"
colors.at(-1);  // "blue" (last)
colors.at(-2);  // "green" (second from end)
colors.at(10);  // undefined
```

 

## Real-World Examples

### Example 1: Get First and Last
```javascript
const scores = createCollection([85, 92, 78, 95, 88]);

console.log('First score:', scores.at(0));   // 85
console.log('Last score:', scores.at(-1));   // 88
console.log('Average:', (scores.at(0) + scores.at(-1)) / 2);
```

### Example 2: Access Recent Items
```javascript
const logs = createCollection([...activityLogs]);

// Get 3 most recent logs
const recent = [
  logs.at(-1),
  logs.at(-2),
  logs.at(-3)
].filter(Boolean);

recent.forEach(log => console.log(log.message));
```

### Example 3: Pagination
```javascript
const items = createCollection([...products]);
const pageSize = 10;

function getPage(pageNum) {
  const start = pageNum * pageSize;
  const page = [];
  
  for (let i = 0; i < pageSize; i++) {
    const item = items.at(start + i);
    if (item) page.push(item);
  }
  
  return page;
}
```

 

## Important Notes

### 1. Negative Indices Count from End
```javascript
const items = createCollection([1, 2, 3, 4, 5]);

items.at(-1);  // 5 (last)
items.at(-2);  // 4 (second from end)
items.at(-5);  // 1 (first)
```

### 2. Returns undefined for Out of Bounds
```javascript
const items = createCollection([1, 2, 3]);

items.at(10);   // undefined
items.at(-10);  // undefined
```

### 3. Use length Property for Bounds
```javascript
const lastIndex = collection.length - 1;
const last = collection.at(lastIndex);
```

 

## When to Use

**Use `at()` For:**
✅ Access by index  
✅ Get first/last items  
✅ Negative indices  

**Don't Use For:**
❌ Search by value - Use `find()`  
❌ Get index - Use `indexOf()`  

 

## Summary

**What is `at(index)`?**  
Returns item at index with negative index support.

**Remember:** Negative indices count from end, returns undefined if out of bounds! 🎉