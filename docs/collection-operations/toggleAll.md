# `collection.toggleAll(predicate, field)` - Toggle Boolean on All Matching Items

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Task 1', done: false, priority: 'high' },
  { id: 2, text: 'Task 2', done: false, priority: 'high' },
  { id: 3, text: 'Task 3', done: true, priority: 'low' }
]);

// Toggle ALL high priority todos
const count = todos.toggleAll(t => t.priority === 'high', 'done');

console.log(count);  // 2 (number of items toggled)
console.log(todos.items[0].done);  // true (was false)
console.log(todos.items[1].done);  // true (was false)
console.log(todos.items[2].done);  // true (unchanged) ✨

// Toggle ALL items
const allCount = todos.toggleAll(t => true, 'done');
console.log(allCount);  // 3 (all toggled)

// Default field is 'done'
todos.toggleAll(t => t.priority === 'low');
// Toggles 'done' on all low priority items

// Works with any boolean field
const items = createCollection([
  { type: 'A', active: false },
  { type: 'A', active: false },
  { type: 'B', active: true }
]);

const toggled = items.toggleAll(i => i.type === 'A', 'active');
console.log(toggled);  // 2
// Both type 'A' items now active: true
```

**What just happened?** You toggled a boolean field on ALL matching items at once!

 

## What is `collection.toggleAll(predicate, field)`?

`toggleAll(predicate, field)` **flips a boolean field** on **ALL items that match** the predicate.

Simply put: it's bulk toggle - find all matches and flip their boolean together.

 

## Syntax

```javascript
collection.toggleAll(predicate, field = 'done')
```

**Parameters:**
- `predicate` (Function) - Test function: `(item, index) => boolean`
- `field` (String, optional) - Field name to toggle, default: `'done'`

**Returns:** Number - Count of items toggled

 

## Basic Usage

```javascript
const tasks = createCollection([
  { id: 1, text: 'Task 1', done: false, urgent: false },
  { id: 2, text: 'Task 2', done: false, urgent: false },
  { id: 3, text: 'Task 3', done: true, urgent: true }
]);

// Toggle 'done' on all incomplete tasks
const count = tasks.toggleAll(t => !t.done, 'done');
console.log(count);  // 2

// Toggle 'urgent' on all tasks
tasks.toggleAll(t => true, 'urgent');
// All 3 items have urgent flipped
```

 

## Real-World Examples

### Example 1: Select/Deselect All

```javascript
const items = createCollection([...]);

function toggleSelectAll() {
  const allSelected = items.items.every(i => i.selected);
  
  if (allSelected) {
    // Deselect all
    items.toggleAll(i => i.selected, 'selected');
  } else {
    // Select all
    items.toggleAll(i => !i.selected, 'selected');
  }
}

// Checkbox handler
document.getElementById('select-all').onchange = toggleSelectAll;
```

 

### Example 2: Toggle Category

```javascript
const products = createCollection([...]);

function toggleCategory(category) {
  const count = products.toggleAll(
    p => p.category === category,
    'visible'
  );
  
  showToast(`Toggled visibility for ${count} ${category} products`);
}
```

 

### Example 3: Bulk Archive

```javascript
const messages = createCollection([...]);

function archiveRead() {
  const count = messages.toggleAll(
    m => m.read && !m.archived,
    'archived'
  );
  
  console.log(`Archived ${count} read messages`);
}
```

 

### Example 4: Toggle Completion by Priority

```javascript
const todos = createCollection([...]);

function completeHighPriority() {
  const highPriority = todos.items.filter(t => 
    t.priority === 'high' && !t.done
  );
  
  if (highPriority.length === 0) {
    alert('No high priority tasks to complete');
    return;
  }
  
  const count = todos.toggleAll(
    t => t.priority === 'high' && !t.done,
    'done'
  );
  
  showNotification(`Completed ${count} high priority tasks`);
}
```

 

### Example 5: Bulk Enable/Disable

```javascript
const features = createCollection([
  { name: 'Dark Mode', enabled: false, beta: true },
  { name: 'Notifications', enabled: true, beta: false },
  { name: 'AI Assistant', enabled: false, beta: true }
]);

function toggleBetaFeatures() {
  const count = features.toggleAll(
    f => f.beta,
    'enabled'
  );
  
  const state = features.find(f => f.beta).enabled ? 'enabled' : 'disabled';
  console.log(`${count} beta features ${state}`);
}
```

 

## Important Notes

### 1. Toggles ALL Matches (Not Just First)

```javascript
const items = createCollection([
  { type: 'A', done: false },
  { type: 'A', done: false },
  { type: 'B', done: false }
]);

// Toggles BOTH type 'A' items
const count = items.toggleAll(i => i.type === 'A', 'done');
console.log(count);  // 2

console.log(items.items[0].done);  // true
console.log(items.items[1].done);  // true
console.log(items.items[2].done);  // false (no match)

// vs toggle() - only first match
items.toggle(i => i.type === 'A', 'done');  // Only first
```

 

### 2. Returns Count (Not Collection)

```javascript
// Returns number of items toggled
const count = collection.toggleAll(predicate, 'done');
console.log(typeof count);  // "number"

// Cannot chain like other methods
collection.toggleAll(...).add(...)  // ❌ Error
```

 

### 3. Default Field is 'done'

```javascript
// These are equivalent
collection.toggleAll(predicate);
collection.toggleAll(predicate, 'done');
```

 

### 4. Safe if No Matches

```javascript
const count = collection.toggleAll(i => i.id === 999, 'done');
console.log(count);  // 0 (no items matched)
```

 

## When to Use

**Use `toggleAll()` For:**
✅ Bulk toggle operations  
✅ Select/deselect all  
✅ Toggle category/group  
✅ Toggle all matching  

**Don't Use For:**
❌ Single item - Use `toggle()`  
❌ Non-boolean fields  
❌ Need chaining - Returns number  

 

## Comparison with Related Methods

```javascript
const items = createCollection([
  { type: 'A', done: false },
  { type: 'A', done: false },
  { type: 'B', done: false }
]);

// toggle() - First match only, returns collection
items.toggle(i => i.type === 'A', 'done');
// items[0].done = true, items[1].done = false

// toggleAll() - ALL matches, returns count
const count = items.toggleAll(i => i.type === 'A', 'done');
// items[0].done = true, items[1].done = true
// count = 2

// updateWhere() - Update all matches
items.updateWhere(i => i.type === 'A', { done: true });
// Sets done=true (doesn't toggle)
```

 

## Common Patterns

### Pattern 1: Toggle with Feedback

```javascript
function toggleAllWithFeedback(predicate, field) {
  const count = collection.toggleAll(predicate, field);
  
  if (count > 0) {
    showToast(`Toggled ${count} items`);
  } else {
    showToast('No items matched');
  }
  
  return count;
}
```

 

### Pattern 2: Conditional Toggle All

```javascript
function toggleIfAny(predicate, field) {
  const matching = collection.items.filter(predicate);
  
  if (matching.length === 0) {
    console.log('No items to toggle');
    return 0;
  }
  
  return collection.toggleAll(predicate, field);
}
```

 

### Pattern 3: Toggle and Count States

```javascript
function toggleAndReport(predicate, field) {
  const before = collection.items.filter(predicate).filter(i => i[field]).length;
  
  const toggled = collection.toggleAll(predicate, field);
  
  const after = collection.items.filter(predicate).filter(i => i[field]).length;
  
  console.log(`Before: ${before}, After: ${after}, Toggled: ${toggled}`);
}
```

 

## Performance

Efficient for bulk operations:

```javascript
// O(n) time - single pass through items
collection.toggleAll(predicate, field);

// Better than manual loop for multiple items
for (let item of collection.items) {
  if (predicate(item)) {
    item[field] = !item[field];  // No reactivity triggers
  }
}
```

 

## Summary

**What is `toggleAll(predicate, field)`?**  
Toggles a boolean field on ALL matching items.

**Why use it?**
- ✅ Bulk toggle
- ✅ Returns count
- ✅ All matches
- ✅ Efficient

**Key Takeaway:**

```
toggle()                toggleAll()
    |                       |
First match            All matches
    |                       |
Returns collection     Returns count
    |                       |
Single toggle          Bulk toggle ✅
```

**Remember:** Toggles ALL matches, returns count, default field is 'done'! 🎉