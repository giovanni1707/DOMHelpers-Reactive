# `createCollection(items)` - Create Reactive Collection

## Quick Start (30 seconds)

```javascript
// Create empty collection
const todos = createCollection([]);

// Add items
todos.add({ id: 1, text: 'Buy milk', done: false });
todos.add({ id: 2, text: 'Walk dog', done: false });

console.log(todos.length);  // 2
console.log(todos.items);   // [{ id: 1, ... }, { id: 2, ... }]

// Update item
todos.update(t => t.id === 1, { done: true });

// Remove item
todos.remove(t => t.done);

console.log(todos.length);  // 1

// Works reactively
effect(() => {
  console.log(`You have ${todos.length} todos`);
});

todos.add({ id: 3, text: 'Cook dinner', done: false });
// Automatically logs: "You have 2 todos" ✨
```

**What just happened?** You created a reactive collection with 30+ built-in methods that automatically updates your UI!

 

## What is `createCollection(items)`?

`createCollection()` is a **factory function** that creates a reactive array with superpowers.

Simply put: it's an array that:
- Tracks changes automatically
- Comes with 30+ helpful methods
- Updates your UI when data changes
- Makes list management easy

Think of it as **upgrading from a basic notepad to a smart notebook** that organizes itself, notifies you of changes, and has built-in tools for every task.

 

## Syntax

```javascript
createCollection(items = [])
```

**Available as:**
```javascript
// Global function (with Module 07)
const collection = createCollection([1, 2, 3]);

// ReactiveUtils namespace
const collection = ReactiveUtils.collection([1, 2, 3]);

// Alias
const collection = ReactiveUtils.list([1, 2, 3]);

// Collections namespace
const collection = Collections.create([1, 2, 3]);
```

**Parameters:**
- `items` (Array, optional) - Initial items. Default: `[]`

**Returns:** 
- Reactive collection object with `.items` array and 30+ methods

 

## Why Does This Exist?

### The Challenge: Managing Lists Without Help

When you need to manage a list in JavaScript, you face repetitive tasks:

```javascript
// Without createCollection
const state = ReactiveUtils.state({ 
  todos: [] 
});

// Adding is verbose
state.todos.push({ id: 1, text: 'Buy milk', done: false });

// Updating requires finding and modifying
const todoIndex = state.todos.findIndex(t => t.id === 1);
if (todoIndex !== -1) {
  Object.assign(state.todos[todoIndex], { done: true });
}

// Removing requires splice
const removeIndex = state.todos.findIndex(t => t.done);
if (removeIndex !== -1) {
  state.todos.splice(removeIndex, 1);
}

// Reactivity needs special handling
patchArray(state, 'todos');  // Don't forget this!
```

At first glance, this works. But there's a hidden cost.

**What's the Real Issue?**

```
Every List Operation
        ↓
Find index manually
        ↓
Check if found (-1)
        ↓
Perform operation (push/splice/assign)
        ↓
Ensure reactivity works
        ↓
Repeat for every operation ❌
```

**Problems:**
❌ **Verbose** - Too much boilerplate for simple tasks  
❌ **Error-prone** - Easy to forget index checks  
❌ **Repetitive** - Same patterns over and over  
❌ **Manual reactivity** - Must patch arrays manually  

### The Solution with `createCollection()`

```javascript
// With createCollection
const todos = createCollection([]);

// Adding is simple
todos.add({ id: 1, text: 'Buy milk', done: false });

// Updating is clear
todos.update(t => t.id === 1, { done: true });

// Removing is easy
todos.remove(t => t.done);

// Reactivity is automatic ✨
```

**What Just Happened?**

```
Every List Operation
        ↓
Call descriptive method
        ↓
Collection handles details
        ↓
Reactivity automatic
        ↓
Done! ✅
```

**Benefits:**
✅ **Concise** - One method call per operation  
✅ **Clear intent** - Method names explain what happens  
✅ **Safe** - Built-in error handling  
✅ **Reactive by default** - No manual setup needed  

 

## Mental Model

Think of collections as **managed containers with assistants**:

### Without createCollection (Basic Container)
```
Plain Array
┌─────────────────────────┐
│  [item1, item2, item3]  │
│                         │
│  You must:              │
│  - Find items manually  │
│  - Update manually      │
│  - Remove manually      │
│  - Track changes manual │
│                         │
│  = More work for you ❌ │
└─────────────────────────┘
```

### With createCollection (Smart Container)
```
Collection
┌─────────────────────────┐
│  items: [...]           │
│                         │
│  Built-in assistants:   │
│  ✓ add() - adds items   │
│  ✓ remove() - removes   │
│  ✓ update() - changes   │
│  ✓ find() - searches    │
│  ✓ filter() - filters   │
│  + 25 more helpers!     │
│                         │
│  = Less work for you ✅ │
└─────────────────────────┘
```

**Key Insight:** Collections wrap arrays with helpful methods so you can focus on your app logic instead of list manipulation details.

 

## How Does It Work?

### Internal Structure

When you call `createCollection()`:

```
1️⃣ Create base object
   { items: [...initial items] }
        ↓
2️⃣ Make it reactive
   ReactiveUtils.state({ items: [...] })
        ↓
3️⃣ Add collection methods
   add(), remove(), update(), etc.
        ↓
4️⃣ Return enhanced object
   { items: [...], add(), remove(), ... }
```

### What You Get

```javascript
const collection = createCollection([1, 2, 3]);

// Structure:
{
  items: [1, 2, 3],        // The actual array (reactive)
  
  // Add/Remove
  add: function,
  remove: function,
  removeWhere: function,
  clear: function,
  
  // Update
  update: function,
  updateWhere: function,
  toggle: function,
  toggleAll: function,
  
  // Query
  find: function,
  filter: function,
  indexOf: function,
  at: function,
  includes: function,
  
  // Properties
  length: 3,              // Computed
  first: 1,               // Computed
  last: 3,                // Computed
  isEmpty: function,
  
  // ... and 20+ more methods
}
```

### Reactivity Flow

```
Change items
     ↓
Collection method called
     ↓
items array modified
     ↓
Reactive system detects change
     ↓
Effects automatically run
     ↓
UI updates ✨
```

 

## Basic Usage

### Example 1: Creating Collections

```javascript
// Empty collection
const empty = createCollection([]);
console.log(empty.length);  // 0

// With initial items
const numbers = createCollection([1, 2, 3, 4, 5]);
console.log(numbers.length);  // 5
console.log(numbers.first);   // 1
console.log(numbers.last);    // 5

// With objects
const users = createCollection([
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false }
]);
console.log(users.length);  // 2
```

**What's happening?**
- Collections start with your initial items
- You can start empty or with data
- Works with any data type

 

### Example 2: Adding Items

```javascript
const todos = createCollection([]);

// Add single item
todos.add({ id: 1, text: 'Buy milk', done: false });
console.log(todos.length);  // 1

// Add another
todos.add({ id: 2, text: 'Walk dog', done: false });
console.log(todos.length);  // 2

// Chain additions
todos
  .add({ id: 3, text: 'Clean room', done: false })
  .add({ id: 4, text: 'Cook dinner', done: false });

console.log(todos.length);  // 4
```

**What's happening?**
- `add()` appends to the end
- Returns collection for chaining
- Automatically reactive

 

### Example 3: Removing Items

```javascript
const items = createCollection([
  { id: 1, text: 'Keep this', done: false },
  { id: 2, text: 'Remove this', done: true },
  { id: 3, text: 'Keep this too', done: false }
]);

// Remove by predicate (first match)
items.remove(item => item.done);

console.log(items.length);  // 2
console.log(items.items);
// [{ id: 1, ... }, { id: 3, ... }]

// Remove by value
const numbers = createCollection([1, 2, 3, 2, 4]);
numbers.remove(2);  // Removes first 2

console.log(numbers.items);  // [1, 3, 2, 4]
```

**What's happening?**
- `remove()` takes out first match
- Works with functions or direct values
- Doesn't error if nothing found

 

### Example 4: Updating Items

```javascript
const tasks = createCollection([
  { id: 1, text: 'Task 1', status: 'pending' },
  { id: 2, text: 'Task 2', status: 'pending' }
]);

// Update single item
tasks.update(
  t => t.id === 1,
  { status: 'done', completedAt: Date.now() }
);

console.log(tasks.items[0].status);  // 'done'

// Update keeps other properties
console.log(tasks.items[0].text);  // 'Task 1' (unchanged)
```

**What's happening?**
- `update()` merges new properties
- Finds item by predicate
- Other properties stay intact

 

### Example 5: Finding Items

```javascript
const users = createCollection([
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'user' }
]);

// Find by predicate
const admin = users.find(u => u.role === 'admin');
console.log(admin.name);  // 'Alice'

// Find returns undefined if not found
const moderator = users.find(u => u.role === 'moderator');
console.log(moderator);  // undefined

// Check if exists
if (users.includes(admin)) {
  console.log('Admin user exists');
}
```

**What's happening?**
- `find()` returns first matching item
- Returns `undefined` if not found
- `includes()` checks existence

 

## Real-World Examples

### Example 1: Todo List Manager

```javascript
const todoList = createCollection([]);

function addTodo(text) {
  todoList.add({
    id: Date.now(),
    text,
    done: false,
    createdAt: new Date()
  });
}

function completeTodo(id) {
  todoList.update(
    t => t.id === id,
    { done: true, completedAt: new Date() }
  );
}

function deleteTodo(id) {
  todoList.remove(t => t.id === id);
}

function clearCompleted() {
  todoList.removeWhere(t => t.done);
}

// Reactive UI update
effect(() => {
  const pending = todoList.items.filter(t => !t.done).length;
  document.getElementById('pending-count').textContent = pending;
});

// Usage
addTodo('Buy groceries');
addTodo('Finish project');
completeTodo(todoList.first.id);
clearCompleted();
```

 

### Example 2: Shopping Cart

```javascript
const cart = createCollection([]);

function addToCart(product, quantity = 1) {
  // Check if product already in cart
  const existing = cart.find(item => item.productId === product.id);
  
  if (existing) {
    // Update quantity
    cart.update(
      item => item.productId === product.id,
      { quantity: existing.quantity + quantity }
    );
  } else {
    // Add new item
    cart.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }
}

function removeFromCart(productId) {
  cart.remove(item => item.productId === productId);
}

function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    cart.update(
      item => item.productId === productId,
      { quantity }
    );
  }
}

// Reactive total
effect(() => {
  const total = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  
  document.getElementById('cart-total').textContent = 
    `$${total.toFixed(2)}`;
});

// Reactive count badge
effect(() => {
  const count = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  
  document.getElementById('cart-badge').textContent = count;
});
```

 

### Example 3: User Management

```javascript
const users = createCollection([]);

async function loadUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  
  users.reset(data);  // Replace all items
}

function activateUser(userId) {
  users.update(
    u => u.id === userId,
    { active: true, activatedAt: Date.now() }
  );
}

function deactivateUser(userId) {
  users.update(
    u => u.id === userId,
    { active: false }
  );
}

function deleteUser(userId) {
  const confirmed = confirm('Delete this user?');
  if (confirmed) {
    users.remove(u => u.id === userId);
  }
}

function searchUsers(query) {
  return users.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );
}

// Display active users count
effect(() => {
  const activeCount = users.items.filter(u => u.active).length;
  document.getElementById('active-users').textContent = 
    `${activeCount} active users`;
});
```

 

### Example 4: Message Inbox

```javascript
const messages = createCollection([]);

function receiveMessage(msg) {
  messages.add({
    id: msg.id,
    from: msg.from,
    subject: msg.subject,
    body: msg.body,
    read: false,
    timestamp: Date.now()
  });
  
  // Keep only last 100 messages
  if (messages.length > 100) {
    messages.items.shift();
  }
}

function markAsRead(messageId) {
  messages.update(
    m => m.id === messageId,
    { read: true, readAt: Date.now() }
  );
}

function markAllAsRead() {
  messages.updateWhere(
    m => !m.read,
    { read: true, readAt: Date.now() }
  );
}

function deleteMessage(messageId) {
  messages.remove(m => m.id === messageId);
}

function deleteOldMessages(daysOld = 30) {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  messages.removeWhere(m => m.timestamp < cutoff);
}

// Unread count badge
effect(() => {
  const unread = messages.items.filter(m => !m.read).length;
  
  const badge = document.getElementById('unread-badge');
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'block' : 'none';
});
```

 

### Example 5: Product Inventory

```javascript
const inventory = createCollection([]);

function addProduct(product) {
  inventory.add({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
    addedAt: Date.now()
  });
}

function updateStock(productId, quantity) {
  inventory.update(
    p => p.id === productId,
    { stock: quantity, lastUpdated: Date.now() }
  );
}

function removeOutOfStock() {
  inventory.removeWhere(p => p.stock === 0);
}

function applyDiscount(category, percentOff) {
  inventory.updateWhere(
    p => p.category === category,
    product => ({
      price: product.price * (1 - percentOff / 100),
      onSale: true
    })
  );
}

function getByCategory(category) {
  return inventory.filter(p => p.category === category);
}

function getLowStock(threshold = 10) {
  return inventory.filter(p => p.stock < threshold);
}

// Alert for low stock
effect(() => {
  const lowStock = inventory.items.filter(p => p.stock < 5);
  
  if (lowStock.length > 0) {
    console.warn(`${lowStock.length} products low on stock!`);
    lowStock.forEach(p => {
      console.warn(`- ${p.name}: ${p.stock} remaining`);
    });
  }
});
```

 

## Common Patterns

### Pattern 1: Auto-ID Generation

```javascript
function createCollectionWithIds() {
  const collection = createCollection([]);
  let nextId = 1;
  
  collection.addWithId = function(item) {
    return this.add({ ...item, id: nextId++ });
  };
  
  return collection;
}

const todos = createCollectionWithIds();
todos.addWithId({ text: 'Task 1', done: false });
// Automatically gets id: 1
```

 

### Pattern 2: Pagination

```javascript
function paginate(collection, page, pageSize = 10) {
  const start = page * pageSize;
  const end = start + pageSize;
  return collection.slice(start, end);
}

const items = createCollection(Array(100).fill(0).map((_, i) => i));

const page1 = paginate(items, 0);  // Items 0-9
const page2 = paginate(items, 1);  // Items 10-19
```

 

### Pattern 3: Filtering View

```javascript
const allTodos = createCollection([...]);

function getActiveTodos() {
  return allTodos.filter(t => !t.done);
}

function getCompletedTodos() {
  return allTodos.filter(t => t.done);
}

// Reactive filtered counts
effect(() => {
  console.log('Active:', getActiveTodos().length);
  console.log('Completed:', getCompletedTodos().length);
});
```

 

## Important Notes

### 1. Access Items via `.items`

```javascript
const collection = createCollection([1, 2, 3]);

// ✅ Correct
console.log(collection.items);  // [1, 2, 3]
console.log(collection.items[0]);  // 1

// ❌ Wrong
console.log(collection[0]);  // undefined
```

 

### 2. Returns Collection for Chaining

```javascript
// Most methods return collection
collection
  .add(item1)
  .add(item2)
  .remove(pred)
  .update(pred, data);

// Exception: toggleAll() returns count
const count = collection.toggleAll(pred, 'done');
console.log(typeof count);  // 'number'
```

 

### 3. Reactive by Default

```javascript
const collection = createCollection([]);

effect(() => {
  console.log('Length:', collection.length);
});

collection.add(1);  // Effect runs automatically
collection.add(2);  // Effect runs again
```

 

### 4. Array Methods Still Work

```javascript
const collection = createCollection([1, 2, 3]);

// Collection methods
collection.add(4);

// Array methods on .items
collection.items.push(5);
collection.items.sort((a, b) => b - a);

console.log(collection.items);  // [5, 4, 3, 2, 1]
```

 

## Summary

**What is `createCollection()`?**  
A factory function that creates reactive arrays with 30+ built-in methods for easy list management.

**Why use it?**
- ✅ Simplifies list operations
- ✅ Automatic reactivity
- ✅ Rich method API
- ✅ Less boilerplate

**Key Takeaway:**

```
Plain Array              Collection
     |                        |
Manual operations      Built-in methods
     |                        |
Manual reactivity      Auto-reactive
     |                        |
More code              Less code ✅
```

**One-Line Rule:** Use `createCollection()` when you need to manage a list with automatic UI updates.

**Remember:** Collections are reactive arrays with superpowers - use them for todos, carts, messages, or any list in your app! 🎉