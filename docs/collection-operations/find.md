# `collection.find(predicate)` - Find First Matching Item

## Quick Start (30 seconds)

```javascript
const users = createCollection([
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'admin' }
]);

// Find by predicate function
const admin = users.find(user => user.role === 'admin');
console.log(admin);
// { id: 1, name: 'Alice', role: 'admin' }

// Find by ID
const user = users.find(u => u.id === 2);
console.log(user.name);  // "Bob"

// Find returns undefined if not found
const notFound = users.find(u => u.id === 999);
console.log(notFound);  // undefined

// With direct value match (primitives)
const numbers = createCollection([10, 20, 30, 40]);
const found = numbers.find(30);
console.log(found);  // 30

// Check if found before using
const result = users.find(u => u.name === 'David');
if (result) {
  console.log('Found:', result.name);
} else {
  console.log('User not found');
}
// "User not found" ✨
```

**What just happened?** You searched a collection and found the first matching item!

 

## What is `collection.find(predicate)`?

`find(predicate)` is a method that **returns the first item that matches your criteria**, or `undefined` if nothing matches.

Simply put: it searches through items and gives you the first one that passes your test.

Think of it as **searching through a filing cabinet** - you stop at the first document that matches what you're looking for.

 

## Syntax

```javascript
collection.find(predicate)
```

**Parameters:**
- `predicate` (Function | any) - Either:
  - **Function:** `(item, index, array) => boolean` - Returns true for item to find
  - **Value:** Direct value to match (uses strict equality `===`)

**Returns:** 
- The first matching item
- `undefined` if no match found

 

## Why Does This Exist?

### The Problem: Manual Search Logic

Without `find()`, searching requires manual iteration:

```javascript
const users = createCollection([...]);

// Manual search
let foundUser = null;
for (let i = 0; i < users.items.length; i++) {
  if (users.items[i].id === 2) {
    foundUser = users.items[i];
    break;
  }
}

// Or use array find
const user = users.items.find(u => u.id === 2);

// Must access .items
// Breaking collection abstraction
```

**What's the Real Issue?**

```
Need to find item
        |
        v
Loop manually or access .items
        |
        v
Check each item
        |
        v
Break abstraction ❌
```

**Problems:**
❌ **Manual loops** - Verbose and error-prone  
❌ **Break abstraction** - Must use `.items`  
❌ **Inconsistent API** - Mix collection and array methods  

### The Solution with `find()`

```javascript
const users = createCollection([...]);

// Direct collection API
const user = users.find(u => u.id === 2);

// Clean and simple
if (user) {
  console.log('Found:', user.name);
}

// Consistent collection API ✅
```

**What Just Happened?**

```
Call find(predicate)
        |
        v
Search items sequentially
        |
        v
Found match? ──No──→ Continue
        |
       Yes
        ▼
Return item immediately ✅
```

**Benefits:**
✅ **Clean API** - No `.items` needed  
✅ **Early exit** - Stops at first match  
✅ **Safe** - Returns undefined if not found  
✅ **Familiar** - Works like Array.find()  

 

## Mental Model

Think of `find()` as **searching a list**:

```
Collection Items         Search Process        Result
┌──────────────┐        ┌──────────────┐      ┌──────────────┐
│ { id: 1 }    │───X───→│ Check id=2?  │      │              │
│ { id: 2 } ←──┼───✓───→│ Match! ✓     │─────→│ { id: 2 }    │
│ { id: 3 }    │        │ Stop search  │      │ (found)      │
└──────────────┘        └──────────────┘      └──────────────┘
  (stops early)          (first match)
```

**Key Insight:** Stops immediately when first match is found.

 

## How It Works

The complete flow:

```
users.find(u => u.id === 2)
        |
        ▼
Loop through items
        |
        ▼
For each item:
  matches = predicate(item)
  If matches → return item
        |
        ▼
No match found
        |
        ▼
Return undefined
```

### Implementation

```javascript
// From 03_dh-reactive-collections.js
find(predicate) {
  return typeof predicate === 'function'
    ? this.items.find(predicate)
    : this.items.find(item => item === predicate);
}
```

Simple wrapper:
- If predicate is function: use it directly
- If predicate is value: compare with `===`
- Returns first match or undefined

 

## Basic Usage

### Example 1: Find by Property

```javascript
const products = createCollection([
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 75 }
]);

// Find by ID
const product = products.find(p => p.id === 2);
console.log(product.name);  // "Mouse"

// Find by name
const laptop = products.find(p => p.name === 'Laptop');
console.log(laptop.price);  // 999
```

 

### Example 2: Find by Condition

```javascript
const todos = createCollection([
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: true },
  { id: 3, text: 'Task 3', done: false }
]);

// Find first completed todo
const completed = todos.find(todo => todo.done);
console.log(completed.text);  // "Task 2"

// Find first incomplete todo
const pending = todos.find(todo => !todo.done);
console.log(pending.text);  // "Task 1"
```

 

### Example 3: Find Primitive Value

```javascript
const numbers = createCollection([10, 20, 30, 40, 50]);

// Direct value match
const found = numbers.find(30);
console.log(found);  // 30

const notFound = numbers.find(99);
console.log(notFound);  // undefined
```

 

### Example 4: Check if Found

```javascript
const users = createCollection([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

const user = users.find(u => u.id === 3);

if (user) {
  console.log('Found:', user.name);
} else {
  console.log('User not found');
}
// "User not found"
```

 

## Real-World Examples

### Example 1: Find User by Email

```javascript
const users = createCollection([
  { id: 1, email: 'alice@example.com', name: 'Alice' },
  { id: 2, email: 'bob@example.com', name: 'Bob' },
  { id: 3, email: 'charlie@example.com', name: 'Charlie' }
]);

function getUserByEmail(email) {
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }
  
  return user;
}

// Usage
try {
  const user = getUserByEmail('bob@example.com');
  console.log('Welcome,', user.name);
} catch (error) {
  console.error(error.message);
}
```

 

### Example 2: Find Product by SKU

```javascript
const inventory = createCollection([
  { sku: 'LAP-001', name: 'Laptop', qty: 15 },
  { sku: 'MOU-001', name: 'Mouse', qty: 50 },
  { sku: 'KEY-001', name: 'Keyboard', qty: 30 }
]);

function getProduct(sku) {
  const product = inventory.find(p => p.sku === sku);
  
  if (product && product.qty > 0) {
    return product;
  }
  
  return null;
}

const product = getProduct('MOU-001');
if (product) {
  console.log(`${product.name}: ${product.qty} in stock`);
}
```

 

### Example 3: Find Active Session

```javascript
const sessions = createCollection([
  { id: 's1', user: 'alice', active: false, expires: Date.now() - 1000 },
  { id: 's2', user: 'bob', active: true, expires: Date.now() + 3600000 },
  { id: 's3', user: 'charlie', active: true, expires: Date.now() + 7200000 }
]);

function findActiveSession(userId) {
  const now = Date.now();
  
  return sessions.find(session => 
    session.user === userId && 
    session.active && 
    session.expires > now
  );
}

const bobSession = findActiveSession('bob');
if (bobSession) {
  console.log('Session found:', bobSession.id);
}
```

 

### Example 4: Find Available Slot

```javascript
const timeSlots = createCollection([
  { time: '9:00 AM', available: false },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: false }
]);

function findNextAvailableSlot() {
  const slot = timeSlots.find(s => s.available);
  
  if (slot) {
    return `Next available: ${slot.time}`;
  }
  
  return 'No slots available';
}

console.log(findNextAvailableSlot());
// "Next available: 10:00 AM"
```

 

### Example 5: Find First Error

```javascript
const validationResults = createCollection([
  { field: 'email', valid: true, message: null },
  { field: 'password', valid: false, message: 'Too short' },
  { field: 'confirm', valid: false, message: 'Does not match' }
]);

function getFirstError() {
  const error = validationResults.find(r => !r.valid);
  
  if (error) {
    return `${error.field}: ${error.message}`;
  }
  
  return 'All valid';
}

console.log(getFirstError());
// "password: Too short"
```

 

## Common Patterns

### Pattern 1: Find with Default

```javascript
function findOrDefault(predicate, defaultValue) {
  const found = collection.find(predicate);
  return found !== undefined ? found : defaultValue;
}

// Usage
const user = findOrDefault(
  u => u.id === 99,
  { id: 0, name: 'Guest' }
);
```

 

### Pattern 2: Find and Update

```javascript
function findAndUpdate(predicate, updates) {
  const item = collection.find(predicate);
  
  if (item) {
    Object.assign(item, updates);
    return true;
  }
  
  return false;
}
```

 

### Pattern 3: Find or Create

```javascript
function findOrCreate(predicate, creator) {
  let item = collection.find(predicate);
  
  if (!item) {
    item = creator();
    collection.add(item);
  }
  
  return item;
}
```

 

## Important Notes

### 1. Returns First Match Only

```javascript
const items = createCollection([
  { type: 'A', value: 1 },
  { type: 'A', value: 2 },
  { type: 'A', value: 3 }
]);

// Only returns first match
const found = items.find(item => item.type === 'A');
console.log(found.value);  // 1

// To get all matches, use filter()
const all = items.filter(item => item.type === 'A');
console.log(all.length);  // 3
```

 

### 2. Returns undefined if Not Found

```javascript
const result = collection.find(item => item.id === 999);

// Always check before using
if (result) {
  console.log(result.name);
} else {
  console.log('Not found');
}

// Or use optional chaining
console.log(result?.name);  // undefined if not found
```

 

## When to Use

### Use `find()` For:

✅ **Get single item** - First match  
✅ **Search by criteria** - Complex conditions  
✅ **Early exit** - Stop when found  
✅ **Safe access** - Returns undefined  

### Don't Use For:

❌ **Get all matches** - Use `filter()`  
❌ **Get by index** - Use `at()`  
❌ **Check if includes** - Use `includes()`  

 

## Summary

**What is `collection.find(predicate)`?**  
Returns the first matching item or undefined.

**Why use it?**
- ✅ Clean API
- ✅ Early exit
- ✅ Safe (undefined)
- ✅ Works with functions or values

**Remember:** `find()` returns the first match or undefined! 🎉