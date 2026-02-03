# `collection.remove(predicate)` - Remove Item from Collection

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

// Remove by predicate function
todos.remove(todo => todo.done);

console.log(todos.items);
// [
//   { id: 1, text: 'Buy milk', done: false },
//   { id: 3, text: 'Clean room', done: false }
// ]
// Item with id: 2 removed ✨

// Remove by direct value match
const numbers = createCollection([1, 2, 3, 4, 5]);
numbers.remove(3);  // Removes the number 3

console.log(numbers.items);  // [1, 2, 4, 5]

// Method chaining
todos
  .remove(todo => todo.id === 1)
  .add({ id: 4, text: 'New task', done: false });

console.log(todos.length);  // 2
```

**What just happened?** You removed items from a collection using either a function or direct value match!

 

## What is `collection.remove(predicate)`?

`remove(predicate)` is a method that **removes the first item that matches your criteria** from a reactive collection.

Simply put: it finds and deletes the first matching item, then returns the collection for chaining.

Think of it as **plucking one specific item out of a box** - you specify what to look for, and it removes the first match.

 

## Syntax

```javascript
collection.remove(predicate)
```

**Parameters:**
- `predicate` (Function | any) - Either:
  - **Function:** `(item, index) => boolean` - Returns true for item to remove
  - **Value:** Direct value to match (uses `===` comparison)

**Returns:** The collection itself (for chaining)

 

## Why Does This Exist?

### The Problem: Manual Array Manipulation

Without `remove()`, deletion is verbose:

```javascript
const todos = createCollection([...]);

// Must find index manually
const index = todos.items.findIndex(todo => todo.id === 2);

if (index !== -1) {
  todos.items.splice(index, 1);
}

// Or filter and reassign
todos.items = todos.items.filter(todo => todo.id !== 2);

// Can't chain
// Intent unclear
```

**What's the Real Issue?**

```
Need to remove item
        |
        v
Find index manually
        |
        v
Check if found
        |
        v
Use splice
        |
        v
Verbose and error-prone ❌
```

**Problems:**
❌ **Multi-step process** - Find, check, remove  
❌ **No chaining** - splice returns removed items  
❌ **Easy to forget** - Index check needed  

### The Solution with `remove()`

```javascript
const todos = createCollection([...]);

// Clean, expressive API
todos.remove(todo => todo.id === 2);

// Method chaining
todos
  .remove(todo => todo.done)
  .add({ text: 'New task' });

// Clear intent: "remove matching item" ✅
```

**What Just Happened?**

```
Call remove(predicate)
        |
        v
Find first match
        |
        v
Remove if found
        |
        v
Return collection
        |
        v
Can chain more ✅
```

**Benefits:**
✅ **One-step** - Find and remove together  
✅ **Chainable** - Returns collection  
✅ **Safe** - Handles not-found automatically  
✅ **Clear** - Obvious intent  

 

## Mental Model

Think of `remove()` as **searching and plucking**:

```
Before remove()                After remove(x => x.id === 2)
┌─────────────┐               ┌─────────────┐
│  Items:     │               │  Items:     │
│  [id: 1]    │  remove()     │  [id: 1]    │
│  [id: 2] ←  │  ─────────→   │  [id: 3]    │
│  [id: 3]    │               │             │
└─────────────┘               └─────────────┘
     3 items                       2 items
```

**Key Insight:** Only removes the **first** matching item, not all matches.

 

## How It Works

The complete flow when you call `remove()`:

```
todos.remove(t => t.done)
        |
        ▼
Find first matching item
        |
        ▼
Found? ──No──→ Do nothing
  |
 Yes
  ▼
Remove from array (splice)
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
remove(predicate) {
  const idx = typeof predicate === 'function'
    ? this.items.findIndex(predicate)
    : this.items.indexOf(predicate);
    
  if (idx !== -1) {
    this.items.splice(idx, 1);
  }
  
  return this;
}
```

**How it works:**
- If predicate is a function: use `findIndex()`
- If predicate is a value: use `indexOf()`
- If found (idx !== -1): remove with `splice()`
- Always returns collection for chaining

 

## Basic Usage

### Example 1: Remove by Predicate Function

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

// Remove first completed todo
todos.remove(todo => todo.done);

console.log(todos.length);  // 2
console.log(todos.items);
// [{ id: 1, ... }, { id: 3, ... }]
```

 

### Example 2: Remove by Direct Value

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

// Remove the number 3
numbers.remove(3);

console.log(numbers.items);  // [1, 2, 4, 5]

// Remove by string value
const fruits = createCollection(['apple', 'banana', 'orange']);
fruits.remove('banana');

console.log(fruits.items);  // ['apple', 'orange']
```

 

### Example 3: Remove by ID

```javascript
const users = createCollection([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]);

// Remove user by ID
users.remove(user => user.id === 2);

console.log(users.items);
// [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]
```

 

### Example 4: Method Chaining

```javascript
const tasks = createCollection([
  { id: 1, text: 'Task 1', priority: 'low' },
  { id: 2, text: 'Task 2', priority: 'high' },
  { id: 3, text: 'Task 3', priority: 'medium' }
]);

// Chain multiple operations
tasks
  .remove(t => t.priority === 'low')
  .add({ id: 4, text: 'Task 4', priority: 'high' })
  .remove(t => t.id === 2);

console.log(tasks.length);  // 2
```

 

## Real-World Examples

### Example 1: Remove Completed Todo

```javascript
const todos = createCollection([...]);

function deleteCompleted() {
  // Remove first completed todo
  todos.remove(todo => todo.done);
  
  // Show remaining
  console.log(`${todos.length} todos remaining`);
}

// Button click handler
document.getElementById('delete-completed').onclick = deleteCompleted;
```

 

### Example 2: Remove by User Selection

```javascript
const items = createCollection([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
]);

function deleteItem(itemId) {
  items.remove(item => item.id === itemId);
  
  showNotification(`Item ${itemId} deleted`);
}

// Usage
deleteItem(2);  // Removes item with id: 2
```

 

### Example 3: Remove from Cart

```javascript
const cart = createCollection([
  { productId: 'A', name: 'Laptop', qty: 1 },
  { productId: 'B', name: 'Mouse', qty: 2 },
  { productId: 'C', name: 'Keyboard', qty: 1 }
]);

function removeFromCart(productId) {
  const removed = cart.items.find(item => item.productId === productId);
  
  if (removed) {
    cart.remove(item => item.productId === productId);
    console.log(`Removed ${removed.name} from cart`);
  }
}

removeFromCart('B');  // Removes Mouse
```

 

### Example 4: Remove Expired Items

```javascript
const notifications = createCollection([
  { id: 1, message: 'Hello', timestamp: Date.now() - 60000 },
  { id: 2, message: 'World', timestamp: Date.now() - 120000 },
  { id: 3, message: 'New', timestamp: Date.now() }
]);

function removeExpired() {
  const EXPIRY = 5 * 60 * 1000;  // 5 minutes
  const cutoff = Date.now() - EXPIRY;
  
  // Remove first expired notification
  notifications.remove(n => n.timestamp < cutoff);
}

// Run periodically
setInterval(removeExpired, 60000);  // Every minute
```

 

### Example 5: Remove Duplicate

```javascript
const emails = createCollection([
  'alice@example.com',
  'bob@example.com',
  'alice@example.com',  // Duplicate
  'charlie@example.com'
]);

function removeDuplicate() {
  const seen = new Set();
  
  // Remove first duplicate found
  emails.remove(email => {
    if (seen.has(email)) {
      return true;  // Found duplicate
    }
    seen.add(email);
    return false;
  });
}

removeDuplicate();
console.log(emails.items);
// ['alice@example.com', 'bob@example.com', 'charlie@example.com']
```

 

### Example 6: Remove First Match

```javascript
const inventory = createCollection([
  { sku: 'A001', qty: 5 },
  { sku: 'A002', qty: 0 },  // Out of stock
  { sku: 'A003', qty: 10 },
  { sku: 'A004', qty: 0 }   // Out of stock
]);

// Remove first out-of-stock item
inventory.remove(item => item.qty === 0);

console.log(inventory.items);
// [{ sku: 'A001', ... }, { sku: 'A003', ... }, { sku: 'A004', ... }]
// Only A002 removed (first match)
```

 

### Example 7: Conditional Remove

```javascript
const queue = createCollection([
  { id: 1, status: 'pending' },
  { id: 2, status: 'processing' },
  { id: 3, status: 'completed' }
]);

function processNext() {
  // Remove first pending item
  const removed = queue.items.find(item => item.status === 'pending');
  
  if (removed) {
    queue.remove(item => item.status === 'pending');
    processItem(removed);
  } else {
    console.log('No pending items');
  }
}
```

 

### Example 8: Remove with Confirmation

```javascript
const contacts = createCollection([...]);

async function deleteContact(contactId) {
  const contact = contacts.items.find(c => c.id === contactId);
  
  if (!contact) {
    alert('Contact not found');
    return;
  }
  
  const confirmed = confirm(`Delete ${contact.name}?`);
  
  if (confirmed) {
    contacts.remove(c => c.id === contactId);
    showToast('Contact deleted');
  }
}
```

 

### Example 9: Remove and Update UI

```javascript
const messages = createCollection([...]);

effect(() => {
  const container = document.getElementById('messages');
  
  if (messages.isEmpty()) {
    container.innerHTML = '<p>No messages</p>';
  } else {
    container.innerHTML = messages.items.map(m => `
      <div class="message">
        ${m.text}
        <button onclick="deleteMessage(${m.id})">Delete</button>
      </div>
    `).join('');
  }
});

function deleteMessage(id) {
  messages.remove(m => m.id === id);
  // Effect automatically updates UI ✨
}
```

 

### Example 10: Remove with Index Access

```javascript
const playlist = createCollection([
  { id: 1, title: 'Song 1' },
  { id: 2, title: 'Song 2' },
  { id: 3, title: 'Song 3' }
]);

function removeByIndex(index) {
  if (index >= 0 && index < playlist.length) {
    const song = playlist.items[index];
    playlist.remove(s => s.id === song.id);
  }
}

removeByIndex(1);  // Removes 'Song 2'
```

 

## Common Patterns

### Pattern 1: Remove and Get Reference

```javascript
function removeAndReturn(predicate) {
  const item = collection.items.find(predicate);
  
  if (item) {
    collection.remove(predicate);
    return item;
  }
  
  return null;
}

// Usage
const removed = removeAndReturn(t => t.id === 5);
if (removed) {
  console.log('Removed:', removed);
}
```

 

### Pattern 2: Safe Remove by ID

```javascript
function removeById(id) {
  const exists = collection.items.some(item => item.id === id);
  
  if (exists) {
    collection.remove(item => item.id === id);
    return true;
  }
  
  return false;
}

// Usage
if (removeById(42)) {
  console.log('Item removed');
} else {
  console.log('Item not found');
}
```

 

### Pattern 3: Remove with Side Effect

```javascript
function removeWithLog(predicate) {
  const item = collection.items.find(predicate);
  
  if (item) {
    console.log('Removing:', item);
    collection.remove(predicate);
    console.log('Removed successfully');
  }
  
  return collection;
}
```

 

### Pattern 4: Conditional Remove

```javascript
function removeIf(predicate, condition) {
  if (condition) {
    collection.remove(predicate);
  }
  return collection;
}

// Usage
removeIf(
  item => item.id === 5,
  userHasPermission('delete')
);
```

 

## Important Notes

### 1. Only Removes First Match

```javascript
const numbers = createCollection([1, 2, 3, 2, 4]);

// Only removes first occurrence of 2
numbers.remove(2);

console.log(numbers.items);  // [1, 3, 2, 4]
//                                    ↑ Still here

// To remove all matches, use removeWhere()
numbers.removeWhere(n => n === 2);
console.log(numbers.items);  // [1, 3, 4]
```

 

### 2. Safe If Not Found

```javascript
const items = createCollection([1, 2, 3]);

// Removing non-existent item is safe
items.remove(99);  // No error

console.log(items.items);  // [1, 2, 3] - unchanged
```

 

### 3. Predicate Function Receives Index

```javascript
const items = createCollection(['a', 'b', 'c']);

// Predicate gets (item, index)
items.remove((item, index) => {
  console.log(`Checking index ${index}: ${item}`);
  return item === 'b';
});

// Output:
// "Checking index 0: a"
// "Checking index 1: b"  ← Stops here (found)
```

 

### 4. Returns Collection for Chaining

```javascript
// Can chain operations
collection
  .remove(item => item.done)
  .add({ text: 'New item' })
  .remove(item => item.old);

// All operations return collection
```

 

## When to Use

### Use `remove()` For:

✅ **Remove single item** - Delete first match  
✅ **User deletions** - Click to remove  
✅ **Conditional removal** - Based on criteria  
✅ **Method chaining** - Fluent operations  
✅ **Simple cleanup** - Remove one at a time  

### Don't Use For:

❌ **Remove all matches** - Use `removeWhere()` instead  
❌ **Clear everything** - Use `clear()` instead  
❌ **Remove by index** - Access via `items` array  

 

## Comparison with Related Methods

```javascript
const items = createCollection([1, 2, 3, 2, 4]);

// remove() - Removes first match
items.remove(2);
// Result: [1, 3, 2, 4]

// removeWhere() - Removes all matches
items.removeWhere(n => n === 2);
// Result: [1, 3, 4]

// clear() - Removes everything
items.clear();
// Result: []
```

 

## Summary

**What is `collection.remove(predicate)`?**  
A method that removes the first item matching your criteria from a collection.

**Why use it?**
- ✅ Simple one-step removal
- ✅ Works with functions or values
- ✅ Method chaining support
- ✅ Safe if item not found
- ✅ Automatic reactivity

**Key Takeaway:**

```
Manual Removal          remove() Method
      |                       |
Find index              Find & remove
Check found             Auto-handled
Call splice             Built-in
      |                       |
Multi-step ❌          One-step ✅
```

**One-Line Rule:** Use `remove()` to delete the first matching item with a clean, safe API.

**Best Practices:**
- Use predicate functions for objects
- Use direct values for primitives
- Remember: only removes first match
- Use `removeWhere()` for multiple items
- Chain for multiple operations
- Check if item exists before showing errors

**Remember:** `remove()` finds and deletes the first match automatically! 🎉