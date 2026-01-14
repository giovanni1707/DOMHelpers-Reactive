# `collection.updateWhere(predicate, updates)` - Update All Matching Items

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Task 1', done: false, priority: 'low' },
  { id: 2, text: 'Task 2', done: false, priority: 'low' },
  { id: 3, text: 'Task 3', done: true, priority: 'high' }
]);

// Update ALL incomplete todos
todos.updateWhere(
  t => !t.done,
  { priority: 'high', urgent: true }
);

console.log(todos.items);
// All incomplete todos now have priority: 'high', urgent: true ✨

// Update by value
const items = createCollection([
  { type: 'A', status: 'pending' },
  { type: 'A', status: 'pending' },
  { type: 'B', status: 'pending' }
]);

items.updateWhere(
  item => item.type === 'A',
  { status: 'approved' }
);
// Both type 'A' items updated

// Chainable
todos
  .updateWhere(t => t.done, { archived: true })
  .add({ text: 'New task', done: false });
```

**What just happened?** You updated ALL matching items at once!

 

## What is `collection.updateWhere(predicate, updates)`?

`updateWhere(predicate, updates)` **updates ALL items that match** by merging in the updates object.

Simply put: it's bulk update - find all matches and update them together.

 

## Syntax

```javascript
collection.updateWhere(predicate, updates)
```

**Parameters:**
- `predicate` (Function) - `(item, index) => boolean` - Returns true for items to update
- `updates` (Object) - Properties to merge into matching items

**Returns:** The collection (for chaining)

 

## Basic Usage

```javascript
const tasks = createCollection([
  { id: 1, status: 'pending' },
  { id: 2, status: 'pending' },
  { id: 3, status: 'done' }
]);

// Update all pending tasks
tasks.updateWhere(
  t => t.status === 'pending',
  { status: 'in-progress', startedAt: Date.now() }
);

console.log(tasks.items);
// Both pending tasks updated
```

 

## Real-World Examples

### Example 1: Approve All Pending

```javascript
const submissions = createCollection([...]);

function approveAll() {
  const count = submissions.items.filter(s => s.status === 'pending').length;
  
  submissions.updateWhere(
    s => s.status === 'pending',
    { 
      status: 'approved',
      approvedAt: Date.now(),
      approvedBy: currentUser.id
    }
  );
  
  showNotification(`Approved ${count} submissions`);
}
```

 

### Example 2: Mark as Read

```javascript
const notifications = createCollection([...]);

function markAllAsRead() {
  notifications.updateWhere(
    n => !n.read,
    { 
      read: true,
      readAt: Date.now()
    }
  );
}
```

 

### Example 3: Apply Discount

```javascript
const products = createCollection([...]);

function applyDiscount(category, percent) {
  products.updateWhere(
    p => p.category === category,
    updates => {
      const product = products.items.find(p => p.category === category);
      return {
        originalPrice: product.price,
        price: product.price * (1 - percent / 100),
        onSale: true
      };
    }
  );
}
```

 

### Example 4: Bulk Status Change

```javascript
const orders = createCollection([...]);

function cancelPendingOrders() {
  const count = orders.items.filter(o => o.status === 'pending').length;
  
  if (count === 0) {
    alert('No pending orders');
    return;
  }
  
  const confirmed = confirm(`Cancel ${count} pending orders?`);
  
  if (confirmed) {
    orders.updateWhere(
      o => o.status === 'pending',
      { 
        status: 'cancelled',
        cancelledAt: Date.now(),
        reason: 'Bulk cancellation'
      }
    );
  }
}
```

 

## Important Notes

### 1. Updates ALL Matches

```javascript
// Updates all matching items
collection.updateWhere(predicate, updates);

// vs update() - updates only first
collection.update(predicate, updates);
```

 

### 2. Uses Object.assign (Shallow Merge)

```javascript
const items = createCollection([
  { id: 1, data: { x: 1, y: 2 } }
]);

// Shallow merge - nested objects replaced
items.updateWhere(
  i => i.id === 1,
  { data: { z: 3 } }
);

// data is now { z: 3 } - x and y lost!
```

 

### 3. Returns Collection

```javascript
collection
  .updateWhere(predicate1, updates1)
  .updateWhere(predicate2, updates2);
```

 

## When to Use

**Use `updateWhere()` For:**
✅ Bulk updates  
✅ Update all matching  
✅ Status changes  
✅ Apply properties to group  

**Don't Use For:**
❌ Single item - Use `update()`  
❌ Deep merging - Handle manually  

 

## Summary

**What is `updateWhere(predicate, updates)`?**  
Updates ALL matching items with the provided properties.

**Remember:** Updates all matches, uses Object.assign, chainable! 🎉