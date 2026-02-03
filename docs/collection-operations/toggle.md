# `collection.toggle(predicate, field)` - Toggle Boolean on Single Item

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

// Toggle done status on first match
todos.toggle(t => t.id === 1, 'done');

console.log(todos.first.done);  // true (was false)

// Toggle again
todos.toggle(t => t.id === 1, 'done');
console.log(todos.first.done);  // false (back to false) ✨

// Default field is 'done'
todos.toggle(t => t.id === 2);  // Toggles 'done' field
console.log(todos.items[1].done);  // false (was true)

// Works with any boolean field
const items = createCollection([
  { id: 1, active: false, featured: false }
]);

items.toggle(i => i.id === 1, 'active');
console.log(items.first.active);  // true

items.toggle(i => i.id === 1, 'featured');
console.log(items.first.featured);  // true
```

**What just happened?** You toggled a boolean field on the first matching item!

 

## What is `collection.toggle(predicate, field)`?

`toggle(predicate, field)` **flips a boolean field** from true to false or false to true on the **first matching item**.

Simply put: it finds one item and toggles a boolean property.

 

## Syntax

```javascript
collection.toggle(predicate, field = 'done')
```

**Parameters:**
- `predicate` (Function | any) - Find function or value
- `field` (String, optional) - Field name to toggle, default: `'done'`

**Returns:** The collection (for chaining)

 

## Basic Usage

```javascript
const tasks = createCollection([
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: true }
]);

// Toggle 'done' (default field)
tasks.toggle(t => t.id === 1);
console.log(tasks.first.done);  // true

// Toggle custom field
tasks.toggle(t => t.id === 2, 'archived');
console.log(tasks.items[1].archived);  // true
```

 

## Real-World Examples

### Example 1: Toggle Todo Completion

```javascript
const todos = createCollection([...]);

function toggleTodo(id) {
  todos.toggle(t => t.id === id, 'done');
  
  const todo = todos.find(t => t.id === id);
  console.log(`${todo.text}: ${todo.done ? 'completed' : 'pending'}`);
}

// Checkbox handler
document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
  checkbox.onclick = (e) => {
    const id = parseInt(e.target.dataset.id);
    toggleTodo(id);
  };
});
```

 

### Example 2: Toggle Item Selection

```javascript
const items = createCollection([...]);

function toggleSelection(itemId) {
  items.toggle(i => i.id === itemId, 'selected');
}

// Click handler
document.querySelectorAll('.item').forEach(el => {
  el.onclick = () => {
    const id = parseInt(el.dataset.id);
    toggleSelection(id);
    el.classList.toggle('selected');
  };
});
```

 

### Example 3: Toggle Active Status

```javascript
const users = createCollection([...]);

function toggleActive(userId) {
  users.toggle(u => u.id === userId, 'active');
  
  const user = users.find(u => u.id === userId);
  
  showToast(
    `${user.name} ${user.active ? 'activated' : 'deactivated'}`
  );
}
```

 

## Important Notes

### 1. Toggles First Match Only

```javascript
const items = createCollection([
  { type: 'A', done: false },
  { type: 'A', done: false }
]);

// Only toggles first match
items.toggle(i => i.type === 'A', 'done');

console.log(items.items[0].done);  // true
console.log(items.items[1].done);  // false (unchanged)

// Use toggleAll() for all matches
items.toggleAll(i => i.type === 'A', 'done');
```

 

### 2. Default Field is 'done'

```javascript
// These are equivalent
collection.toggle(predicate);
collection.toggle(predicate, 'done');
```

 

### 3. Creates Field if Missing

```javascript
const item = createCollection([{ id: 1 }]);

item.toggle(i => i.id === 1, 'active');

console.log(item.first.active);  // true (created and set)
```

 

## When to Use

**Use `toggle()` For:**
✅ Toggle checkboxes  
✅ Toggle single item  
✅ On/off states  
✅ First match only  

**Don't Use For:**
❌ Toggle all - Use `toggleAll()`  
❌ Non-boolean fields  

 

## Summary

**What is `toggle(predicate, field)`?**  
Toggles a boolean field on the first matching item.

**Remember:** First match only, default field is 'done', chainable! 🎉