# `collection.removeWhere(predicate)` - Remove All Matching Items

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: true },
  { id: 4, text: 'Cook dinner', done: false }
]);

// Remove ALL completed todos
todos.removeWhere(todo => todo.done);

console.log(todos.items);
// [{ id: 1, text: 'Buy milk', done: false },
//  { id: 4, text: 'Cook dinner', done: false }]
// Both completed todos removed ✨

// Remove by condition
const numbers = createCollection([1, 2, 3, 4, 5, 6]);
numbers.removeWhere(n => n % 2 === 0);

console.log(numbers.items);  // [1, 3, 5] (all even numbers removed)

// Remove all with specific value
const items = createCollection(['a', 'b', 'a', 'c', 'a']);
items.removeWhere(item => item === 'a');

console.log(items.items);  // ['b', 'c'] (all 'a' removed)

// Chainable
todos
  .removeWhere(t => t.done)
  .add({ text: 'New task', done: false });
```

**What just happened?** You removed ALL items matching a condition in one call!

 

## What is `collection.removeWhere(predicate)`?

`removeWhere(predicate)` is a method that **removes ALL items that match your criteria** from the collection.

Simply put: it's a bulk delete - find all matches and remove them at once.

Think of it as **clearing out everything that matches** - not just the first one, but every single match.

 

## Syntax

```javascript
collection.removeWhere(predicate)
```

**Parameters:**
- `predicate` (Function) - Test function: `(item, index) => boolean`
  - Returns `true` to remove item
  - Returns `false` to keep item

**Returns:** The collection itself (for chaining)

 

## Why Does This Exist?

### The Problem: Removing Multiple Items is Tedious

Without `removeWhere()`, removing multiple items requires loops:

```javascript
const todos = createCollection([...]);

// Manual loop (error-prone!)
for (let i = todos.items.length - 1; i >= 0; i--) {
  if (todos.items[i].done) {
    todos.items.splice(i, 1);
  }
}

// Or filter and reassign
todos.items = todos.items.filter(t => !t.done);

// Verbose and confusing
```

**What's the Real Issue?**

```
Need to remove multiple items
        |
        v
Loop backwards (confusing!)
        |
        v
Check and splice each
        |
        v
Error-prone ❌
```

**Problems:**
❌ **Backwards loop** - Must iterate in reverse  
❌ **Manual splicing** - Easy to mess up  
❌ **Verbose** - Too much code  
❌ **Not chainable** - Can't chain operations  

### The Solution with `removeWhere()`

```javascript
const todos = createCollection([...]);

// Simple, clear, one line
todos.removeWhere(t => t.done);

// Removes ALL matches ✅
```

**What Just Happened?**

```
Call removeWhere(predicate)
        |
        v
Loop backwards through items
        |
        v
For each item:
  If matches → remove
        |
        v
All matches removed
        |
        v
Return collection for chaining ✅
```

**Benefits:**
✅ **One call** - Removes all matches  
✅ **Clear intent** - Obvious what it does  
✅ **Safe** - Handles removal correctly  
✅ **Chainable** - Returns collection  

 

## Mental Model

Think of `removeWhere()` as **bulk deletion**:

```
Before removeWhere()                After removeWhere(x => x.done)
┌─────────────────────┐            ┌─────────────────────┐
│ { id: 1, done: F }  │            │ { id: 1, done: F }  │
│ { id: 2, done: T }  │ remove     │ { id: 4, done: F }  │
│ { id: 3, done: T }  │ ─────────→ │                     │
│ { id: 4, done: F }  │            │                     │
└─────────────────────┘            └─────────────────────┘
     4 items                            2 items
   (2 match done=true)              (both removed)
```

**Key Insight:** Removes ALL matches, not just first one.

 

## How It Works

The complete flow:

```
todos.removeWhere(t => t.done)
        |
        ▼
Loop backwards (length-1 to 0)
        |
        ▼
For each item:
  matches = predicate(item, index)
  If matches → splice(index, 1)
        |
        ▼
All matches removed
        |
        ▼
return this (for chaining)
```

### Implementation

```javascript
// From 03_dh-reactive-collections.js
removeWhere(predicate) {
  for (let i = this.items.length - 1; i >= 0; i--) {
    if (predicate(this.items[i], i)) {
      this.items.splice(i, 1);
    }
  }
  return this;
}
```

**How it works:**
- Loops backwards (safe for removal)
- Calls predicate for each item
- Splices matching items
- Returns collection for chaining

 

## Basic Usage

### Example 1: Remove Completed Todos

```javascript
const todos = createCollection([
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: true },
  { id: 3, text: 'Task 3', done: true },
  { id: 4, text: 'Task 4', done: false }
]);

// Remove all completed
todos.removeWhere(todo => todo.done);

console.log(todos.length);  // 2 (only incomplete remain)
```

 

### Example 2: Remove by Value

```javascript
const numbers = createCollection([1, 2, 3, 2, 4, 2, 5]);

// Remove all 2's
numbers.removeWhere(n => n === 2);

console.log(numbers.items);  // [1, 3, 4, 5]
```

 

### Example 3: Remove by Threshold

```javascript
const scores = createCollection([45, 78, 92, 55, 88, 35, 95]);

// Remove all failing scores (< 60)
scores.removeWhere(score => score < 60);

console.log(scores.items);  // [78, 92, 88, 95]
```

 

### Example 4: Method Chaining

```javascript
const items = createCollection([...]);

items
  .removeWhere(item => item.invalid)
  .removeWhere(item => item.expired)
  .add({ name: 'New item', valid: true });
```

 

## Real-World Examples

### Example 1: Clear Completed Tasks

```javascript
const tasks = createCollection([...]);

function clearCompleted() {
  const count = tasks.items.filter(t => t.done).length;
  
  tasks.removeWhere(t => t.done);
  
  showNotification(`Removed ${count} completed tasks`);
}

// Button handler
document.getElementById('clear-completed').onclick = clearCompleted;
```

 

### Example 2: Remove Expired Items

```javascript
const notifications = createCollection([...]);

function removeExpired() {
  const EXPIRY = 5 * 60 * 1000;  // 5 minutes
  const cutoff = Date.now() - EXPIRY;
  
  const removed = notifications.items.filter(
    n => n.timestamp < cutoff
  ).length;
  
  notifications.removeWhere(n => n.timestamp < cutoff);
  
  console.log(`Removed ${removed} expired notifications`);
}

// Run periodically
setInterval(removeExpired, 60000);
```

 

### Example 3: Delete Selected Items

```javascript
const files = createCollection([...]);

function deleteSelected() {
  const count = files.items.filter(f => f.selected).length;
  
  if (count === 0) {
    alert('No files selected');
    return;
  }
  
  const confirmed = confirm(`Delete ${count} files?`);
  
  if (confirmed) {
    files.removeWhere(f => f.selected);
    showToast(`${count} files deleted`);
  }
}
```

 

### Example 4: Remove Out of Stock Products

```javascript
const inventory = createCollection([...]);

function removeOutOfStock() {
  const before = inventory.length;
  
  inventory.removeWhere(product => product.stock === 0);
  
  const removed = before - inventory.length;
  console.log(`Removed ${removed} out of stock products`);
}
```

 

### Example 5: Clear Invalid Entries

```javascript
const formEntries = createCollection([...]);

function validateAndClean() {
  // Remove entries with invalid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  formEntries.removeWhere(entry => 
    !emailRegex.test(entry.email)
  );
  
  // Remove duplicates
  const seen = new Set();
  formEntries.removeWhere(entry => {
    if (seen.has(entry.email)) {
      return true;  // Duplicate
    }
    seen.add(entry.email);
    return false;
  });
  
  console.log(`${formEntries.length} valid entries remaining`);
}
```

 

### Example 6: Remove Old Messages

```javascript
const messages = createCollection([...]);

function cleanupOldMessages(daysToKeep = 30) {
  const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  const before = messages.length;
  messages.removeWhere(msg => msg.timestamp < cutoff);
  const removed = before - messages.length;
  
  console.log(`Removed ${removed} messages older than ${daysToKeep} days`);
}
```

 

### Example 7: Remove by Multiple Conditions

```javascript
const products = createCollection([...]);

function removeInactive() {
  products.removeWhere(product => 
    !product.active || 
    product.stock === 0 || 
    product.price <= 0
  );
  
  console.log(`${products.length} active products remaining`);
}
```

 

### Example 8: Batch Delete with Confirmation

```javascript
const records = createCollection([...]);

async function batchDelete(criteria) {
  const toDelete = records.items.filter(criteria);
  
  if (toDelete.length === 0) {
    alert('No matching records');
    return;
  }
  
  const confirmed = confirm(
    `Delete ${toDelete.length} records?\nThis cannot be undone.`
  );
  
  if (confirmed) {
    records.removeWhere(criteria);
    
    // Log the action
    await logAction('batch_delete', {
      count: toDelete.length,
      timestamp: Date.now()
    });
    
    showSuccess(`Deleted ${toDelete.length} records`);
  }
}
```

 

### Example 9: Remove Blacklisted Items

```javascript
const comments = createCollection([...]);
const bannedWords = ['spam', 'scam', 'fake'];

function moderateComments() {
  const before = comments.length;
  
  comments.removeWhere(comment => {
    const text = comment.text.toLowerCase();
    return bannedWords.some(word => text.includes(word));
  });
  
  const removed = before - comments.length;
  
  if (removed > 0) {
    console.log(`Removed ${removed} inappropriate comments`);
  }
}
```

 

### Example 10: Clean Up Cache

```javascript
const cache = createCollection([...]);

function cleanCache() {
  const now = Date.now();
  
  // Remove expired
  cache.removeWhere(entry => 
    entry.expiresAt && entry.expiresAt < now
  );
  
  // Remove if cache too large
  const MAX_SIZE = 100;
  if (cache.length > MAX_SIZE) {
    // Sort by last accessed and remove oldest
    const sorted = [...cache.items].sort((a, b) => 
      a.lastAccessed - b.lastAccessed
    );
    
    const toRemove = cache.length - MAX_SIZE;
    const cutoff = sorted[toRemove].lastAccessed;
    
    cache.removeWhere(entry => entry.lastAccessed <= cutoff);
  }
  
  console.log(`Cache cleaned: ${cache.length} entries`);
}
```

 

## Common Patterns

### Pattern 1: Remove and Count

```javascript
function removeAndCount(predicate) {
  const before = collection.length;
  collection.removeWhere(predicate);
  const removed = before - collection.length;
  
  console.log(`Removed ${removed} items`);
  return removed;
}
```

 

### Pattern 2: Conditional Bulk Delete

```javascript
function clearIf(predicate, condition) {
  if (condition) {
    collection.removeWhere(predicate);
    return true;
  }
  return false;
}
```

 

### Pattern 3: Remove with Confirmation

```javascript
function removeWithConfirm(predicate, message) {
  const count = collection.items.filter(predicate).length;
  
  if (count === 0) return false;
  
  const confirmed = confirm(message || `Remove ${count} items?`);
  
  if (confirmed) {
    collection.removeWhere(predicate);
    return true;
  }
  
  return false;
}
```

 

### Pattern 4: Remove and Archive

```javascript
function removeAndArchive(predicate, archiveCollection) {
  const toRemove = collection.items.filter(predicate);
  
  toRemove.forEach(item => archiveCollection.add(item));
  collection.removeWhere(predicate);
  
  return toRemove.length;
}
```

 

## Important Notes

### 1. Removes ALL Matches

```javascript
const items = createCollection(['a', 'b', 'a', 'c', 'a']);

// Removes ALL occurrences
items.removeWhere(item => item === 'a');
console.log(items.items);  // ['b', 'c']

// vs remove() - removes only first
items.remove('a');  // Removes first 'a' only
```

 

### 2. Loops Backwards Internally

```javascript
// Safe - loops backwards
collection.removeWhere(item => item.invalid);

// This is why index in predicate might seem odd
collection.removeWhere((item, index) => {
  console.log(index);  // May not be sequential
  return item.invalid;
});
```

 

### 3. Returns Collection for Chaining

```javascript
collection
  .removeWhere(item => item.done)
  .add(newItem)
  .removeWhere(item => item.expired);

// All operations chained
```

 

### 4. Safe to Remove Nothing

```javascript
// No matches - no error
collection.removeWhere(item => item.id === 999);

// Collection unchanged
```

 

## When to Use

### Use `removeWhere()` For:

✅ **Remove multiple items** - All matches  
✅ **Bulk deletion** - Clear category  
✅ **Cleanup operations** - Remove expired/invalid  
✅ **Filter in place** - Keep only what you want  
✅ **Batch operations** - Delete selected  

### Don't Use For:

❌ **Remove single item** - Use `remove()` instead  
❌ **Clear all** - Use `clear()` instead  
❌ **Get filtered copy** - Use `filter()` instead  

 

## Comparison with Related Methods

```javascript
const items = createCollection([1, 2, 3, 2, 4, 2, 5]);

// removeWhere() - Removes ALL matches
items.removeWhere(n => n === 2);
// items.items: [1, 3, 4, 5]

// remove() - Removes FIRST match only
items.remove(n => n === 2);
// items.items: [1, 3, 2, 4, 2, 5] (only first 2 removed)

// clear() - Removes EVERYTHING
items.clear();
// items.items: []
```

 

## Performance

`removeWhere()` is efficient:

```javascript
// O(n) time - processes each item once
// Removes in place - no new array
collection.removeWhere(predicate);

// For large collections, still efficient
const large = createCollection(Array(10000).fill(0));
large.removeWhere(n => n === 0);  // Fast
```

 

## Summary

**What is `collection.removeWhere(predicate)`?**  
A method that removes ALL items matching the predicate.

**Why use it?**
- ✅ Bulk deletion
- ✅ Clear intent
- ✅ Safe removal
- ✅ Chainable

**Key Takeaway:**

```
remove()                removeWhere()
    |                         |
First match             All matches
    |                         |
Single delete          Bulk delete ✅
```

**One-Line Rule:** Use `removeWhere()` to remove ALL matching items in one call.

**Best Practices:**
- Use for bulk deletion
- Count before/after to track removals
- Confirm before large deletions
- Chain with other operations
- Returns collection for chaining

**Remember:** `removeWhere()` removes ALL matches, not just the first! 🎉