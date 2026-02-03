# Understanding `collection()` - A Beginner's Guide

## Quick Start (30 seconds)

Need a reactive list that automatically updates your UI? Here's how:

```js
// Create a reactive collection
const todos = collection([
  { id: 1, text: 'Learn reactive', done: false },
  { id: 2, text: 'Build app', done: false }
]);

// Auto-update UI when collection changes
effect(() => {
  const count = todos.length;
  document.getElementById('count').textContent = `${count} items`;
});

// Add item - UI updates automatically!
todos.add({ id: 3, text: 'Deploy', done: false });

// Remove item - UI updates automatically!
todos.remove(item => item.id === 1);
```

**That's it!** The `collection()` function creates a reactive array with powerful methods for managing lists. Add, remove, or update items, and your UI stays in sync automatically!

 

## What is `collection()`?

`collection()` is a specialized function for creating **reactive arrays** with built-in management methods. While `state()` is great for objects, `collection()` is designed specifically for **lists of items**.

**A reactive collection:**
- Wraps an array in a reactive container
- Provides convenient methods for managing items
- Detects when items are added, removed, or changed
- Automatically triggers updates throughout your application

Think of it as an **upgraded array** - it has all the power of regular JavaScript arrays, plus reactive superpowers and convenient methods for common list operations.

 

## Syntax

```js
// Using the shortcut
collection(initialItems)

// Using the full namespace
ReactiveUtils.collection(initialItems)

// Alias: list()
list(initialItems)
ReactiveUtils.list(initialItems)
```

**All styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`collection()` or `list()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.collection()`) - Explicit and clear

**Parameters:**
- `initialItems` - An array of initial items (optional, defaults to empty array)

**Returns:**
- A reactive collection object with an `items` array and many helper methods

 

## Why Does This Exist?

### The Problem with Plain Arrays in State

Let's say you have a list in reactive state:

```javascript
// Plain array in state
const todos = state({ items: [] });

// Add an item manually
todos.items.push({ text: 'Buy milk', done: false });

// Remove an item manually
const index = todos.items.findIndex(item => item.text === 'Buy milk');
todos.items.splice(index, 1);

// Update an item manually
const item = todos.items.find(item => item.text === 'Buy milk');
if (item) {
  item.done = true;
}
```

This works, but it's **verbose** and **error-prone**:

**What's the Real Issue?**

```
Plain Array Management:
┌─────────────────────┐
│ Find item           │
│ todos.items         │
│   .findIndex(...)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Check if found      │
│ if (index !== -1)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Splice manually     │
│ items.splice(...)   │
└──────────┬──────────┘
           │
           ▼
     Lots of steps!
     Easy to mess up!
```

**Problems:**
❌ Need to use `findIndex()`, `splice()`, `find()` manually
❌ Easy to forget edge cases (item not found, etc.)
❌ Verbose code for common operations
❌ No built-in convenience methods
❌ Have to remember array method syntax

### The Solution with `collection()`

When you use `collection()`, you get **built-in methods** for common operations:

```javascript
// Reactive collection with built-in methods
const todos = collection([]);

// Add an item - clean and simple
todos.add({ text: 'Buy milk', done: false });

// Remove an item - by predicate or value
todos.remove(item => item.text === 'Buy milk');

// Update an item - one method call
todos.update(
  item => item.text === 'Buy milk',
  { done: true }
);
```

**What Just Happened?**

```
collection() Management:
┌─────────────────────┐
│ todos.add(item)     │
└──────────┬──────────┘
           │
           ▼
     Handles everything
     automatically!
           │
           ▼
┌─────────────────────┐
│ todos.remove(pred)  │
└──────────┬──────────┘
           │
           ▼
     Finds and removes
     automatically!
```

With `collection()`:
- Clean, expressive method names
- Built-in convenience methods
- Handles edge cases for you
- Less code, fewer bugs
- Easy to read and understand

**Benefits:**
✅ Simple, expressive methods (add, remove, update, clear)
✅ Built-in search and filter operations
✅ Automatic reactivity for all changes
✅ Less boilerplate code
✅ Handles common patterns for you

 

## Mental Model

Think of `collection()` like a **smart playlist**:

```
Regular Array (Basic Playlist):
┌──────────────────────┐
│  Song 1              │
│  Song 2              │  ← You can add/remove
│  Song 3              │  ← But manually
└──────────────────────┘
     No smart features
     Manual management

Reactive Collection (Smart Playlist):
┌──────────────────────────────────┐
│   Smart Playlist                 │
│   ┌────────────────────┐         │
│   │ Song 1             │         │
│   │ Song 2             │         │
│   │ Song 3             │         │
│   └────────────────────┘         │
│                                  │
│   Built-in Controls:             │
│   ✓ Add songs                    │
│   ✓ Remove songs                 │
│   ✓ Search songs                 │
│   ✓ Filter by genre              │
│   ✓ Sort by rating               │
│   ✓ Toggle favorites             │
└──────────────────────────────────┘
         │
         ▼
   Manages list with
   smart features!
```

**Key Insight:** Just like a smart playlist that provides built-in controls for managing songs (add, remove, search, filter, sort), a `collection()` provides built-in methods for managing list items reactively.

 

## How Does It Work?

### The Magic: State + Array Methods

When you call `collection()`, here's what happens behind the scenes:

```javascript
// What you write:
const todos = collection([
  { id: 1, text: 'Task 1' }
]);

// What actually happens (simplified):
// 1. Create reactive state with items array
const todos = state({
  items: [{ id: 1, text: 'Task 1' }]
});

// 2. Add convenience methods
todos.add = function(item) { this.items.push(item); };
todos.remove = function(pred) { /* ... */ };
todos.clear = function() { this.items.length = 0; };
// ... and many more methods
```

**In other words:** `collection()` is a wrapper that:
1. Creates reactive state with an `items` array
2. Adds powerful methods for managing the array
3. Makes everything reactive automatically
4. Returns the enhanced object

### Under the Hood

```
collection([item1, item2])
        │
        ▼
┌───────────────────────┐
│  Step 1: Create State │
│  with items array     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 2: Add Methods  │
│  add, remove, update, │
│  find, filter, etc.   │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 3: Make Methods │
│  Reactive (trigger    │
│  updates on changes)  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 4: Return       │
│  Enhanced Collection  │
└───────────────────────┘
```

**What happens:**

1️⃣ When you **access** `todos.items`, you're reading the reactive array
2️⃣ When you **call** `todos.add()`, it modifies the array AND triggers updates
3️⃣ Any effects watching the collection automatically re-run
4️⃣ Your UI stays synchronized with your data!

 

## Basic Usage

### Creating a Collection

The simplest way to use `collection()` is with an empty or pre-filled array:

```js
// Empty collection
const todos = collection();

// Collection with initial items
const todos = collection([
  { id: 1, text: 'Learn React', done: false },
  { id: 2, text: 'Build App', done: false }
]);

// Or using the alias
const todos = list([
  { id: 1, text: 'Task 1' }
]);
```

### Accessing Items

The items are stored in the `.items` property:

```js
const todos = collection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' }
]);

// Access the items array
console.log(todos.items);        // [{ id: 1, ... }, { id: 2, ... }]
console.log(todos.items[0]);     // { id: 1, text: 'Task 1' }
console.log(todos.items.length); // 2
```

### Basic Operations

```js
const todos = collection([]);

// Add an item
todos.add({ id: 1, text: 'Buy milk', done: false });

// Remove an item
todos.remove(item => item.id === 1);

// Clear all items
todos.clear();
```

 

## Collection Properties

Collections have several convenient computed properties:

### `collection.items`

The reactive array containing all items:

```js
const todos = collection([
  { id: 1, text: 'Task 1' }
]);

console.log(todos.items); // [{ id: 1, text: 'Task 1' }]

// Can access like a normal array
todos.items.forEach(item => console.log(item.text));
```

### `collection.length`

The number of items in the collection:

```js
const todos = collection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' }
]);

console.log(todos.length); // 2

todos.add({ id: 3, text: 'Task 3' });
console.log(todos.length); // 3
```

### `collection.first`

The first item in the collection:

```js
const todos = collection([
  { id: 1, text: 'First' },
  { id: 2, text: 'Second' }
]);

console.log(todos.first); // { id: 1, text: 'First' }
```

### `collection.last`

The last item in the collection:

```js
const todos = collection([
  { id: 1, text: 'First' },
  { id: 2, text: 'Last' }
]);

console.log(todos.last); // { id: 2, text: 'Last' }
```

 

## Adding and Removing Items

### `add(item)`

Add a single item to the collection:

```js
const todos = collection([]);

todos.add({ id: 1, text: 'Buy milk', done: false });
todos.add({ id: 2, text: 'Walk dog', done: false });

console.log(todos.length); // 2
```

**Returns:** `this` (for chaining)

### `remove(predicate)`

Remove an item by predicate function or direct value:

```js
const todos = collection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' }
]);

// Remove by predicate function
todos.remove(item => item.id === 1);

// Or remove by direct value (finds first match)
const itemToRemove = todos.items[0];
todos.remove(itemToRemove);
```

**Returns:** `this` (for chaining)

### `clear()`

Remove all items from the collection:

```js
const todos = collection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' }
]);

todos.clear();
console.log(todos.length); // 0
```

**Returns:** `this` (for chaining)

### `update(predicate, updates)`

Update an item's properties:

```js
const todos = collection([
  { id: 1, text: 'Buy milk', done: false }
]);

// Find item by predicate and update properties
todos.update(
  item => item.id === 1,
  { done: true }
);

console.log(todos.items[0].done); // true
```

**Returns:** `this` (for chaining)

 

## Searching and Filtering

### `find(predicate)`

Find a single item:

```js
const todos = collection([
  { id: 1, text: 'Buy milk' },
  { id: 2, text: 'Walk dog' }
]);

const item = todos.find(item => item.id === 1);
console.log(item); // { id: 1, text: 'Buy milk' }
```

**Returns:** The found item or `undefined`

### `filter(predicate)`

Filter items and return a new array:

```js
const todos = collection([
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: true },
  { id: 3, text: 'Task 3', done: false }
]);

const incomplete = todos.filter(item => !item.done);
console.log(incomplete); // [{ id: 1, ... }, { id: 3, ... }]
```

**Returns:** A new plain array (not a collection)

### `map(fn)`

Map over items and return a new array:

```js
const todos = collection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' }
]);

const texts = todos.map(item => item.text);
console.log(texts); // ['Task 1', 'Task 2']
```

**Returns:** A new plain array

### `forEach(fn)`

Iterate over items:

```js
const todos = collection([
  { id: 1, text: 'Task 1' },
  { id: 2, text: 'Task 2' }
]);

todos.forEach(item => {
  console.log(item.text);
});
// Logs: "Task 1"
// Logs: "Task 2"
```

**Returns:** `this` (for chaining)

 

## Sorting and Ordering

### `sort(compareFn)`

Sort items in place:

```js
const todos = collection([
  { id: 3, text: 'C' },
  { id: 1, text: 'A' },
  { id: 2, text: 'B' }
]);

todos.sort((a, b) => a.id - b.id);

console.log(todos.items);
// [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]
```

**Returns:** `this` (for chaining)

### `reverse()`

Reverse the order of items:

```js
const todos = collection([
  { id: 1, text: 'First' },
  { id: 2, text: 'Second' },
  { id: 3, text: 'Third' }
]);

todos.reverse();

console.log(todos.first); // { id: 3, text: 'Third' }
```

**Returns:** `this` (for chaining)

 

## Array-Like Methods

Collections support standard array methods:

### `at(index)`

Get item at specific index:

```js
const todos = collection([
  { id: 1, text: 'First' },
  { id: 2, text: 'Second' }
]);

console.log(todos.at(0));  // { id: 1, text: 'First' }
console.log(todos.at(-1)); // { id: 2, text: 'Second' } (last item)
```

### `includes(item)`

Check if collection contains an item:

```js
const item = { id: 1, text: 'Task 1' };
const todos = collection([item]);

console.log(todos.includes(item)); // true
```

### `indexOf(item)`

Get index of an item:

```js
const item = { id: 1, text: 'Task 1' };
const todos = collection([item, { id: 2, text: 'Task 2' }]);

console.log(todos.indexOf(item)); // 0
```

### `slice(start, end)`

Get a slice of items:

```js
const todos = collection([
  { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
]);

const slice = todos.slice(1, 3);
console.log(slice); // [{ id: 2 }, { id: 3 }]
```

### Stack Operations (End)

**`push(...items)`** - Add items to end:
```js
todos.push({ id: 1 }, { id: 2 });
```

**`pop()`** - Remove item from end:
```js
const last = todos.pop();
```

### Queue Operations (Start)

**`unshift(...items)`** - Add items to start:
```js
todos.unshift({ id: 1 }, { id: 2 });
```

**`shift()`** - Remove item from start:
```js
const first = todos.shift();
```

### `splice(start, deleteCount, ...items)`

Advanced insertion/removal:

```js
const todos = collection([
  { id: 1 }, { id: 2 }, { id: 3 }
]);

// Remove 1 item at index 1
todos.splice(1, 1);

// Insert item at index 1
todos.splice(1, 0, { id: 4 });
```

 

## Advanced Operations

### `toggle(predicate, field)`

Toggle a boolean field on an item:

```js
const todos = collection([
  { id: 1, text: 'Task 1', done: false }
]);

// Toggle the 'done' field
todos.toggle(item => item.id === 1, 'done');

console.log(todos.items[0].done); // true

todos.toggle(item => item.id === 1, 'done');
console.log(todos.items[0].done); // false
```

### `toggleAll(predicate, field)`

Toggle a field on multiple items:

```js
const todos = collection([
  { id: 1, done: false },
  { id: 2, done: false },
  { id: 3, done: true }
]);

// Toggle all matching items
const count = todos.toggleAll(
  item => !item.done,
  'done'
);

console.log(count); // 2 (number of items toggled)
```

### `removeWhere(predicate)`

Remove all matching items:

```js
const todos = collection([
  { id: 1, done: true },
  { id: 2, done: false },
  { id: 3, done: true }
]);

// Remove all completed todos
todos.removeWhere(item => item.done);

console.log(todos.length); // 1 (only incomplete remains)
```

### `updateWhere(predicate, updates)`

Update all matching items:

```js
const todos = collection([
  { id: 1, category: 'work' },
  { id: 2, category: 'work' },
  { id: 3, category: 'personal' }
]);

// Update all work items
todos.updateWhere(
  item => item.category === 'work',
  { priority: 'high' }
);
```

### `reset(newItems)`

Replace all items with new array:

```js
const todos = collection([
  { id: 1 }, { id: 2 }
]);

todos.reset([
  { id: 3 }, { id: 4 }, { id: 5 }
]);

console.log(todos.length); // 3
```

### `toArray()`

Convert to plain JavaScript array:

```js
const todos = collection([
  { id: 1 }, { id: 2 }
]);

const plainArray = todos.toArray();
console.log(plainArray); // [{ id: 1 }, { id: 2 }]
```

### `isEmpty()`

Check if collection is empty:

```js
const todos = collection([]);

console.log(todos.isEmpty()); // true

todos.add({ id: 1 });
console.log(todos.isEmpty()); // false
```

 

## Working with Effects

Collections automatically trigger effects when they change:

```js
const todos = collection([]);

// Effect runs whenever collection changes
effect(() => {
  console.log(`You have ${todos.length} todos`);

  const completed = todos.filter(item => item.done).length;
  console.log(`${completed} completed`);
});

// Add item - effect re-runs
todos.add({ id: 1, text: 'Task 1', done: false });
// Logs: "You have 1 todos"
// Logs: "0 completed"

// Complete item - effect re-runs
todos.update(item => item.id === 1, { done: true });
// Logs: "You have 1 todos"
// Logs: "1 completed"
```

 

## Common Patterns

### Pattern: Todo List

```js
const todos = collection([]);

// Display count
effect(() => {
  document.getElementById('count').textContent = `${todos.length} items`;
});

// Display list
effect(() => {
  const list = document.getElementById('todoList');
  list.innerHTML = todos.items
    .map(todo => `<li>${todo.text}</li>`)
    .join('');
});

// Add todo
function addTodo(text) {
  todos.add({
    id: Date.now(),
    text,
    done: false
  });
}

// Complete todo
function completeTodo(id) {
  todos.update(
    item => item.id === id,
    { done: true }
  );
}

// Remove completed
function clearCompleted() {
  todos.removeWhere(item => item.done);
}
```

### Pattern: Shopping Cart

```js
const cart = collection([]);

// Calculate total
effect(() => {
  const total = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
});

// Add to cart
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    cart.update(
      item => item.id === product.id,
      { quantity: existing.quantity + 1 }
    );
  } else {
    cart.add({ ...product, quantity: 1 });
  }
}

// Remove from cart
function removeFromCart(productId) {
  cart.remove(item => item.id === productId);
}
```

### Pattern: Live Search Results

```js
const searchQuery = ref('');
const allItems = collection([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
]);

// Filtered results
effect(() => {
  const query = searchQuery.value.toLowerCase();
  const results = allItems.filter(item =>
    item.name.toLowerCase().includes(query)
  );

  displayResults(results);
});

// User types in search box
document.getElementById('search').addEventListener('input', (e) => {
  searchQuery.value = e.target.value;
});
```

### Pattern: Pagination

```js
const allItems = collection([/* ... many items ... */]);
const currentPage = ref(1);
const itemsPerPage = 10;

// Display current page
effect(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = allItems.slice(start, end);

  displayItems(pageItems);
});

function nextPage() {
  const maxPage = Math.ceil(allItems.length / itemsPerPage);
  if (currentPage.value < maxPage) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}
```

 

## Common Pitfalls

### Pitfall #1: Forgetting .items

❌ **Wrong:**
```js
const todos = collection([]);

// Trying to access collection like an array
console.log(todos[0]); // undefined
todos.push({ id: 1 }); // While this works, it's not clear
```

✅ **Correct:**
```js
const todos = collection([]);

// Access the items array
console.log(todos.items[0]);

// Or use collection methods
todos.add({ id: 1 });
```

 

### Pitfall #2: Mutating Returned Arrays

❌ **Wrong:**
```js
const todos = collection([
  { id: 1, done: false },
  { id: 2, done: true }
]);

// filter() returns a plain array, not reactive
const completed = todos.filter(item => item.done);
completed.push({ id: 3 }); // This doesn't affect the collection
```

✅ **Correct:**
```js
// If you need a reactive subset, create a new collection
const allTodos = collection([...]);
const completedTodos = collection(
  allTodos.filter(item => item.done)
);

// Or use computed values in effects
effect(() => {
  const completed = allTodos.filter(item => item.done);
  // Use completed here
});
```

 

### Pitfall #3: Direct Array Mutation

❌ **Wrong (unclear):**
```js
const todos = collection([]);

// Directly mutating items array
todos.items.push({ id: 1 }); // Works, but less clear
```

✅ **Correct (clear intent):**
```js
const todos = collection([]);

// Use collection methods
todos.add({ id: 1 }); // Clear and idiomatic
```

 

### Pitfall #4: Expecting Immutability

❌ **Wrong:**
```js
const todos = collection([{ id: 1, done: false }]);

const item = todos.first;
item.done = true; // This DOES mutate the collection!
```

Collections are mutable. If you need immutability:

✅ **Correct:**
```js
// Make a copy if you need immutability
const item = { ...todos.first };
item.done = true; // Only affects the copy
```

 

### Pitfall #5: Chaining Non-Chainable Methods

❌ **Wrong:**
```js
const todos = collection([]);

todos
  .add({ id: 1 })
  .find(item => item.id === 1)  // find() doesn't return collection
  .add({ id: 2 });  // ERROR!
```

Not all methods return `this`. Some return values.

✅ **Correct:**
```js
todos.add({ id: 1 });
const item = todos.find(item => item.id === 1);
todos.add({ id: 2 });
```

**Methods that return `this` (chainable):**
- `add()`, `remove()`, `update()`, `clear()`
- `sort()`, `reverse()`, `push()`, `unshift()`, `splice()`
- `toggle()`, `removeWhere()`, `updateWhere()`, `reset()`

**Methods that return values:**
- `find()`, `filter()`, `map()`, `at()`, `includes()`, `indexOf()`
- `pop()`, `shift()`, `slice()`, `toArray()`, `isEmpty()`

 

## Summary

**What is `collection()`?**

`collection()` creates a **reactive array** with built-in management methods. It's perfect for managing lists of items with automatic UI synchronization.

 

**Why use `collection()` instead of plain arrays in `state()`?**

- Built-in convenience methods (add, remove, update, clear)
- Less boilerplate code
- Handles common patterns for you
- Clear, expressive API
- Automatic reactivity

 

**Key Points to Remember:**

1️⃣ **Items are in `.items`** - the actual array is in the items property
2️⃣ **Many convenience methods** - add, remove, update, find, filter, etc.
3️⃣ **Chainable methods** - most methods return `this` for chaining
4️⃣ **Reactive by default** - all changes trigger effects automatically
5️⃣ **Array-like** - supports standard array methods

 

**Mental Model:** Think of `collection()` as a **smart playlist** - it manages a list of items with built-in controls for adding, removing, searching, filtering, and sorting.

 

**Quick Reference:**

```js
// Create
const todos = collection([{ id: 1, text: 'Task' }]);

// Properties
console.log(todos.length);  // Count
console.log(todos.first);   // First item
console.log(todos.last);    // Last item

// Add/Remove
todos.add({ id: 2, text: 'Task 2' });
todos.remove(item => item.id === 1);
todos.clear();

// Search/Filter
const item = todos.find(item => item.id === 1);
const filtered = todos.filter(item => !item.done);

// Update
todos.update(item => item.id === 1, { done: true });

// Sort/Reverse
todos.sort((a, b) => a.id - b.id);
todos.reverse();

// Advanced
todos.toggle(item => item.id === 1, 'done');
todos.removeWhere(item => item.done);
todos.reset([]);
```

 

**Remember:** `collection()` is your go-to tool for managing reactive lists. It combines the power of arrays with reactive tracking and convenient methods, making list management simple and automatic!
