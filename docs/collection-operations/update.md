# `collection.update(predicate, updates)` - Update Item in Collection

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: false },
  { id: 3, text: 'Clean room', done: false }
]);

// Update by predicate function
todos.update(
  todo => todo.id === 2,
  { done: true }
);

console.log(todos.items[1]);
// { id: 2, text: 'Walk dog', done: true } ✨

// Update by direct value match
const numbers = createCollection([
  { value: 1, label: 'One' },
  { value: 2, label: 'Two' },
  { value: 3, label: 'Three' }
]);

numbers.update({ value: 2 }, { label: 'TWO' });

console.log(numbers.items[1]);
// { value: 2, label: 'TWO' }

// Method chaining
todos
  .update(t => t.id === 1, { done: true })
  .update(t => t.id === 3, { text: 'Clean room NOW' });

// UI updates automatically
effect(() => {
  const done = todos.items.filter(t => t.done).length;
  document.getElementById('done-count').textContent = `${done} completed`;
});
```

**What just happened?** You updated items in a collection by finding and modifying the first match!

 

## What is `collection.update(predicate, updates)`?

`update(predicate, updates)` is a method that **finds the first matching item and merges in your updates**.

Simply put: it locates an item and changes specific properties without replacing the entire object.

Think of it as **editing a document** - you change what needs changing but keep everything else the same.

 

## Syntax

```javascript
collection.update(predicate, updates)
```

**Parameters:**
- `predicate` (Function | any) - Either:
  - **Function:** `(item, index) => boolean` - Returns true for item to update
  - **Value:** Direct value/object to match (uses `indexOf`)
- `updates` (Object) - Properties to merge into the found item

**Returns:** The collection itself (for chaining)

 

## Why Does This Exist?

### The Problem: Manual Object Updates

Without `update()`, modifying items is tedious:

```javascript
const todos = createCollection([...]);

// Must find item manually
const todo = todos.items.find(t => t.id === 2);

if (todo) {
  // Manually merge properties
  todo.done = true;
  todo.updatedAt = Date.now();
  // What if you forget a property?
}

// Or find index and update
const idx = todos.items.findIndex(t => t.id === 2);
if (idx !== -1) {
  todos.items[idx] = { ...todos.items[idx], done: true };
}

// Verbose, error-prone
```

**What's the Real Issue?**

```
Need to update item
        |
        v
Find item manually
        |
        v
Check if found
        |
        v
Update each property
        |
        v
Multi-step process ❌
```

**Problems:**
❌ **Find and update separately** - Two operations  
❌ **Easy to forget check** - Crashes if not found  
❌ **Manual merging** - Error-prone  
❌ **No chaining** - Can't chain operations  

### The Solution with `update()`

```javascript
const todos = createCollection([...]);

// Clean, one-step API
todos.update(
  t => t.id === 2,
  { done: true, updatedAt: Date.now() }
);

// Method chaining
todos
  .update(t => t.id === 1, { priority: 'high' })
  .update(t => t.id === 3, { status: 'urgent' });

// Clear intent: "update this item with these properties" ✅
```

**What Just Happened?**

```
Call update(predicate, updates)
        |
        v
Find first match
        |
        v
Merge updates (Object.assign)
        |
        v
Reactivity triggered
        |
        v
Return collection for chaining ✅
```

**Benefits:**
✅ **One-step** - Find and update together  
✅ **Safe** - Handles not-found automatically  
✅ **Merge** - Only change what you specify  
✅ **Chainable** - Fluent API  

 

## Mental Model

Think of `update()` as **finding and editing**:

```
Before update()                     After update(x => x.id === 2, { done: true })
┌─────────────────────┐            ┌─────────────────────┐
│  Items:             │            │  Items:             │
│  { id: 1, done: F } │            │  { id: 1, done: F } │
│  { id: 2, done: F } │  update()  │  { id: 2, done: T } │ ← Changed!
│  { id: 3, done: F } │  ────────→ │  { id: 3, done: F } │
└─────────────────────┘            └─────────────────────┘
```

**Key Insight:** Uses `Object.assign()` to merge - only specified properties change.

 

## How It Works

The complete flow when you call `update()`:

```
todos.update(t => t.id === 2, { done: true })
        |
        ▼
Find first matching item
        |
        ▼
Found? ──No──→ Do nothing
  |
 Yes
  ▼
Object.assign(item, updates)
        |
        ▼
Item properties updated
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
update(predicate, updates) {
  const idx = typeof predicate === 'function'
    ? this.items.findIndex(predicate)
    : this.items.indexOf(predicate);
    
  if (idx !== -1) {
    Object.assign(this.items[idx], updates);
  }
  
  return this;
}
```

**How it works:**
- If predicate is a function: use `findIndex()`
- If predicate is a value: use `indexOf()`
- If found: merge updates with `Object.assign()`
- Always returns collection for chaining

 

## Basic Usage

### Example 1: Update by Predicate

```javascript
const todos = createCollection([
  { id: 1, text: 'Task 1', done: false, priority: 'low' },
  { id: 2, text: 'Task 2', done: false, priority: 'medium' },
  { id: 3, text: 'Task 3', done: false, priority: 'high' }
]);

// Update specific todo
todos.update(
  todo => todo.id === 2,
  { done: true, priority: 'low' }
);

console.log(todos.items[1]);
// { id: 2, text: 'Task 2', done: true, priority: 'low' }
```

 

### Example 2: Update Single Property

```javascript
const products = createCollection([
  { id: 'A', name: 'Widget', price: 10 },
  { id: 'B', name: 'Gadget', price: 20 },
  { id: 'C', name: 'Tool', price: 15 }
]);

// Update only price
products.update(
  p => p.id === 'B',
  { price: 25 }
);

console.log(products.items[1]);
// { id: 'B', name: 'Gadget', price: 25 }
// name unchanged ✅
```

 

### Example 3: Update Multiple Properties

```javascript
const users = createCollection([
  { id: 1, name: 'Alice', status: 'offline', lastSeen: null }
]);

// Update multiple properties
users.update(
  u => u.id === 1,
  { 
    status: 'online',
    lastSeen: new Date(),
    loginCount: 5
  }
);

console.log(users.items[0]);
// { id: 1, name: 'Alice', status: 'online', lastSeen: ..., loginCount: 5 }
```

 

### Example 4: Method Chaining

```javascript
const tasks = createCollection([
  { id: 1, text: 'Task 1', status: 'todo' },
  { id: 2, text: 'Task 2', status: 'todo' },
  { id: 3, text: 'Task 3', status: 'todo' }
]);

// Chain multiple updates
tasks
  .update(t => t.id === 1, { status: 'in-progress' })
  .update(t => t.id === 2, { status: 'done' })
  .add({ id: 4, text: 'Task 4', status: 'todo' });

console.log(tasks.items);
// All updates applied ✅
```

 

## Real-World Examples

### Example 1: Toggle Todo Completion

```javascript
const todos = createCollection([...]);

function toggleTodo(id) {
  const todo = todos.items.find(t => t.id === id);
  
  if (todo) {
    todos.update(
      t => t.id === id,
      { done: !todo.done }
    );
  }
}

// Button click handler
document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
  checkbox.onclick = (e) => {
    const id = parseInt(e.target.dataset.id);
    toggleTodo(id);
  };
});
```

 

### Example 2: Update Shopping Cart Quantity

```javascript
const cart = createCollection([
  { productId: 'A', name: 'Laptop', qty: 1, price: 999 },
  { productId: 'B', name: 'Mouse', qty: 2, price: 25 }
]);

function updateQuantity(productId, newQty) {
  if (newQty <= 0) {
    cart.remove(item => item.productId === productId);
  } else {
    cart.update(
      item => item.productId === productId,
      { qty: newQty }
    );
  }
}

// Usage
updateQuantity('A', 3);  // Update to 3
updateQuantity('B', 0);  // Remove (qty 0)
```

 

### Example 3: Update User Status

```javascript
const users = createCollection([
  { id: 1, name: 'Alice', status: 'offline', typing: false },
  { id: 2, name: 'Bob', status: 'online', typing: false }
]);

function setUserTyping(userId, isTyping) {
  users.update(
    u => u.id === userId,
    { 
      typing: isTyping,
      lastActivity: Date.now()
    }
  );
}

// WebSocket message handler
socket.on('user-typing', ({ userId, typing }) => {
  setUserTyping(userId, typing);
});
```

 

### Example 4: Update with Timestamp

```javascript
const posts = createCollection([
  { id: 1, title: 'Post 1', likes: 0, updatedAt: null }
]);

function likePost(postId) {
  const post = posts.items.find(p => p.id === postId);
  
  if (post) {
    posts.update(
      p => p.id === postId,
      { 
        likes: post.likes + 1,
        updatedAt: new Date()
      }
    );
  }
}

likePost(1);
console.log(posts.items[0].likes);  // 1
```

 

### Example 5: Increment Counter

```javascript
const counters = createCollection([
  { id: 'views', count: 0 },
  { id: 'clicks', count: 0 },
  { id: 'shares', count: 0 }
]);

function increment(counterId, amount = 1) {
  const counter = counters.items.find(c => c.id === counterId);
  
  if (counter) {
    counters.update(
      c => c.id === counterId,
      { count: counter.count + amount }
    );
  }
}

increment('views');       // +1
increment('clicks', 5);   // +5
```

 

### Example 6: Update Form Field

```javascript
const formFields = createCollection([
  { name: 'email', value: '', error: null },
  { name: 'password', value: '', error: null }
]);

function updateField(fieldName, newValue) {
  // Clear error when user types
  formFields.update(
    f => f.name === fieldName,
    { 
      value: newValue,
      error: null
    }
  );
}

// Input handler
document.getElementById('email').oninput = (e) => {
  updateField('email', e.target.value);
};
```

 

### Example 7: Mark as Read

```javascript
const notifications = createCollection([
  { id: 1, message: 'New message', read: false },
  { id: 2, message: 'Update available', read: false },
  { id: 3, message: 'Welcome!', read: false }
]);

function markAsRead(notificationId) {
  notifications.update(
    n => n.id === notificationId,
    { 
      read: true,
      readAt: new Date()
    }
  );
}

// Click handler
function handleNotificationClick(id) {
  markAsRead(id);
  showNotificationDetail(id);
}
```

 

### Example 8: Update Score

```javascript
const players = createCollection([
  { id: 1, name: 'Alice', score: 0, level: 1 },
  { id: 2, name: 'Bob', score: 0, level: 1 }
]);

function addScore(playerId, points) {
  const player = players.items.find(p => p.id === playerId);
  
  if (player) {
    const newScore = player.score + points;
    const newLevel = Math.floor(newScore / 100) + 1;
    
    players.update(
      p => p.id === playerId,
      { 
        score: newScore,
        level: newLevel
      }
    );
  }
}

addScore(1, 50);   // Alice: score=50, level=1
addScore(1, 75);   // Alice: score=125, level=2
```

 

### Example 9: Edit Item with Validation

```javascript
const inventory = createCollection([...]);

function updateInventory(sku, updates) {
  // Validation
  if (updates.qty !== undefined && updates.qty < 0) {
    throw new Error('Quantity cannot be negative');
  }
  
  // Update
  inventory.update(
    item => item.sku === sku,
    { 
      ...updates,
      lastModified: new Date()
    }
  );
}

// Usage
updateInventory('A001', { qty: 50, price: 29.99 });
```

 

### Example 10: Reactive UI Update

```javascript
const items = createCollection([
  { id: 1, name: 'Item 1', selected: false },
  { id: 2, name: 'Item 2', selected: false }
]);

// Auto-update UI when selection changes
effect(() => {
  const selectedCount = items.items.filter(i => i.selected).length;
  document.getElementById('selected').textContent = 
    `${selectedCount} selected`;
});

function toggleSelection(itemId) {
  const item = items.items.find(i => i.id === itemId);
  
  if (item) {
    items.update(
      i => i.id === itemId,
      { selected: !item.selected }
    );
    // Effect runs automatically ✨
  }
}
```

 

## Common Patterns

### Pattern 1: Update or Add

```javascript
function upsert(predicate, updates) {
  const exists = collection.items.some(predicate);
  
  if (exists) {
    collection.update(predicate, updates);
  } else {
    collection.add({ ...updates });
  }
  
  return collection;
}

// Usage
upsert(u => u.id === 5, { id: 5, name: 'New User' });
```

 

### Pattern 2: Conditional Update

```javascript
function updateIf(predicate, updates, condition) {
  if (condition) {
    collection.update(predicate, updates);
  }
  return collection;
}

// Usage
updateIf(
  item => item.id === 5,
  { status: 'approved' },
  userHasPermission('approve')
);
```

 

### Pattern 3: Update with Callback

```javascript
function updateWith(predicate, updateFn) {
  const item = collection.items.find(predicate);
  
  if (item) {
    const updates = updateFn(item);
    collection.update(predicate, updates);
  }
  
  return collection;
}

// Usage
updateWith(
  t => t.id === 1,
  (todo) => ({
    done: !todo.done,
    updatedAt: Date.now()
  })
);
```

 

### Pattern 4: Batch Update Properties

```javascript
function batchUpdate(id, ...updates) {
  const merged = Object.assign({}, ...updates);
  
  collection.update(
    item => item.id === id,
    merged
  );
  
  return collection;
}

// Usage
batchUpdate(
  1,
  { name: 'Updated' },
  { status: 'active' },
  { timestamp: Date.now() }
);
```

 

## Important Notes

### 1. Only Updates First Match

```javascript
const items = createCollection([
  { id: 1, status: 'pending' },
  { id: 2, status: 'pending' },
  { id: 3, status: 'pending' }
]);

// Only updates first pending item
items.update(
  i => i.status === 'pending',
  { status: 'done' }
);

console.log(items.items);
// [{ id: 1, status: 'done' }, ← Updated
//  { id: 2, status: 'pending' },
//  { id: 3, status: 'pending' }]

// To update all, use updateWhere()
items.updateWhere(
  i => i.status === 'pending',
  { status: 'done' }
);
```

 

### 2. Uses Object.assign() - Shallow Merge

```javascript
const items = createCollection([
  { id: 1, data: { x: 1, y: 2 } }
]);

// Shallow merge - nested objects replaced
items.update(
  i => i.id === 1,
  { data: { z: 3 } }
);

console.log(items.items[0].data);
// { z: 3 }  ← x and y are gone!

// To merge nested, spread manually
items.update(
  i => i.id === 1,
  { data: { ...items.items[0].data, z: 3 } }
);
```

 

### 3. Safe If Not Found

```javascript
const items = createCollection([1, 2, 3]);

// Updating non-existent item is safe
items.update(99, { value: 'new' });  // No error

console.log(items.items);  // [1, 2, 3] - unchanged
```

 

### 4. Can Add New Properties

```javascript
const items = createCollection([
  { id: 1, name: 'Item' }
]);

// Can add new properties
items.update(
  i => i.id === 1,
  { 
    description: 'New property',
    tags: ['new', 'updated']
  }
);

console.log(items.items[0]);
// { id: 1, name: 'Item', description: '...', tags: [...] }
```

 

## When to Use

### Use `update()` For:

✅ **Modify single item** - Change properties  
✅ **Toggle states** - done, selected, active  
✅ **Increment counters** - likes, views, clicks  
✅ **Edit forms** - Update field values  
✅ **Status changes** - Update workflow states  
✅ **Method chaining** - Fluent operations  

### Don't Use For:

❌ **Update all matches** - Use `updateWhere()` instead  
❌ **Replace entire object** - Remove and add new  
❌ **Deep merging** - Handle nested objects manually  

 

## Comparison with Related Methods

```javascript
const items = createCollection([
  { id: 1, status: 'pending' },
  { id: 2, status: 'pending' }
]);

// update() - Updates first match
items.update(i => i.status === 'pending', { status: 'done' });
// Result: [{ id: 1, status: 'done' }, { id: 2, status: 'pending' }]

// updateWhere() - Updates all matches
items.updateWhere(i => i.status === 'pending', { status: 'done' });
// Result: [{ id: 1, status: 'done' }, { id: 2, status: 'done' }]
```

 

## Summary

**What is `collection.update(predicate, updates)`?**  
A method that finds the first matching item and merges in your property updates.

**Why use it?**
- ✅ One-step find and update
- ✅ Safe property merging
- ✅ Handles not-found gracefully
- ✅ Method chaining support
- ✅ Automatic reactivity

**Key Takeaway:**

```
Manual Update           update() Method
      |                       |
Find item               Find & merge
Check found             Auto-handled
Merge props             Built-in
      |                       |
Multi-step ❌          One-step ✅
```

**One-Line Rule:** Use `update()` to modify the first matching item's properties in one clean step.

**Best Practices:**
- Use for single-item updates
- Use `updateWhere()` for multiple items
- Remember: shallow merge only
- Check item exists if showing errors
- Chain for multiple updates
- Add timestamps in updates

**Remember:** `update()` finds and modifies items automatically with Object.assign()! 🎉