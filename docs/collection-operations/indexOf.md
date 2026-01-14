# `collection.indexOf(item)` - Get Index of Item

## Quick Start (30 seconds)

```javascript
const fruits = createCollection(['apple', 'banana', 'orange', 'banana']);

// Find index
const index = fruits.indexOf('banana');
console.log(index);  // 1

// Not found returns -1
const notFound = fruits.indexOf('grape');
console.log(notFound);  // -1

// Find index to remove
const idx = fruits.indexOf('orange');
if (idx !== -1) {
  fruits.items.splice(idx, 1);
}

// Check if item exists
if (fruits.indexOf('apple') !== -1) {
  console.log('We have apples!');
} ✨
```

**What just happened?** You found the position of an item in the collection!

 

## What is `collection.indexOf(item)`?

`indexOf(item)` returns the **first index where the item is found**, or `-1` if not found.

Simply put: it tells you the position of an item in the collection.

Think of it as **finding a page number in a book** - you get the location or `-1` if it's not there.

 

## Syntax

```javascript
collection.indexOf(item)
```

**Parameters:**
- `item` (any) - The item to search for (uses strict equality `===`)

**Returns:** 
- Index (number) - Position of first match (0-based)
- `-1` if not found

 

## Why Does This Exist?

**The Problem:**
```javascript
// Must access .items
const index = collection.items.indexOf('apple');
```

**The Solution:**
```javascript
// Direct collection API
const index = collection.indexOf('apple');
```

 

## Basic Usage

```javascript
const numbers = createCollection([10, 20, 30, 40, 30]);

numbers.indexOf(30);  // 2 (first occurrence)
numbers.indexOf(99);  // -1 (not found)
```

 

## Real-World Examples

### Example 1: Remove by Value
```javascript
const tags = createCollection(['js', 'react', 'vue']);

function removeTag(tag) {
  const idx = tags.indexOf(tag);
  if (idx !== -1) {
    tags.items.splice(idx, 1);
  }
}

removeTag('react');
```

### Example 2: Check Position
```javascript
const queue = createCollection(['alice', 'bob', 'charlie']);

function getPosition(name) {
  const idx = queue.indexOf(name);
  return idx !== -1 ? `Position: ${idx + 1}` : 'Not in queue';
}

console.log(getPosition('bob'));  // "Position: 2"
```

 

## Important Notes

### 1. Returns First Index Only
```javascript
const items = createCollection(['a', 'b', 'a', 'c']);
items.indexOf('a');  // 0 (first occurrence)
```

### 2. Uses Strict Equality
```javascript
const nums = createCollection([1, 2, 3]);
nums.indexOf('2');  // -1 (string !== number)
nums.indexOf(2);    // 1 ✓
```

### 3. Returns -1 if Not Found
```javascript
if (collection.indexOf(item) !== -1) {
  console.log('Found!');
}
```

 

## When to Use

**Use `indexOf()` For:**
✅ Get item position  
✅ Check if exists  
✅ Remove by value  

**Don't Use For:**
❌ Complex searches - Use `find()`  
❌ Get item - Use `at()` or `find()`  

 

## Summary

**What is `indexOf(item)`?**  
Returns the index of the first matching item or -1.

**Remember:** Returns -1 if not found, uses strict equality! 🎉