# `collection()` - Reactive Arrays Made Easy

## Quick Start (30 seconds)

```javascript
// Create a reactive collection
const todos = collection([
  { id: 1, text: 'Learn JavaScript', done: false },
  { id: 2, text: 'Build an app', done: false }
]);

// Add an item
add(todos, { id: 3, text: 'Deploy', done: false });

// Remove an item
remove(todos, item => item.id === 1);

// Update an item
update(todos, item => item.id === 2, { done: true });

// Clear all items
clear(todos);
```

**That's it.** A reactive array with convenient helper methods for common operations.

 

## What is `collection()`?

`collection()` creates a **reactive wrapper for arrays** with built-in methods for adding, removing, updating, and clearing items. It's perfect for lists, todos, shopping carts, and any array-based data.

Think of it as **an array with superpowers** — it's reactive (effects track it) and has convenient methods for common operations.

 

## Syntax

```javascript
// Create an empty collection
const myList = collection();

// Create with initial items
const myList = collection([item1, item2, item3]);

// Access the items array
console.log(myList.items); // [item1, item2, item3]
```

**Parameters:**
- `initialItems` (optional) - An array of initial items (defaults to empty array)

**Returns:**
- A reactive state object with an `items` property and helper methods

 

## Collection Methods

### `add(collection, item)` - Add an Item

```javascript
const fruits = collection(['apple', 'banana']);

add(fruits, 'orange');

console.log(fruits.items); // ['apple', 'banana', 'orange']
```

 

### `remove(collection, predicate)` - Remove an Item

```javascript
const users = collection([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

// Remove by predicate function
remove(users, user => user.id === 1);

// Or remove by exact value (for simple items)
const tags = collection(['react', 'vue', 'angular']);
remove(tags, 'vue');

console.log(tags.items); // ['react', 'angular']
```

 

### `update(collection, predicate, updates)` - Update an Item

```javascript
const tasks = collection([
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: false }
]);

// Update the item matching the predicate
update(tasks, task => task.id === 1, { done: true });

console.log(tasks.items[0]); // { id: 1, text: 'Task 1', done: true }
```

 

### `clear(collection)` - Remove All Items

```javascript
const notifications = collection(['msg1', 'msg2', 'msg3']);

clear(notifications);

console.log(notifications.items); // []
```

 

## Why Does This Exist?

### The Problem with Plain Arrays

Using plain arrays in reactive state requires manual array manipulation:

```javascript
// Plain array approach
const todos = state({ items: [] });

// Adding requires spread or push + reassign
todos.items = [...todos.items, newTodo];
// or
todos.items.push(newTodo);
todos.items = [...todos.items]; // Force reactivity

// Removing is verbose
todos.items = todos.items.filter(t => t.id !== idToRemove);

// Updating requires finding and spreading
const index = todos.items.findIndex(t => t.id === targetId);
if (index !== -1) {
  todos.items[index] = { ...todos.items[index], done: true };
  todos.items = [...todos.items];
}
```

**Problems:**
- ❌ Verbose and repetitive
- ❌ Easy to forget reactivity triggers
- ❌ Inconsistent patterns

### The Solution with collection()

```javascript
// Collection approach
const todos = collection([]);

// Adding is simple
add(todos, newTodo);

// Removing is clean
remove(todos, t => t.id === idToRemove);

// Updating is straightforward
update(todos, t => t.id === targetId, { done: true });
```

**Benefits:**
- ✅ Clean, readable API
- ✅ Automatic reactivity
- ✅ Consistent patterns
- ✅ Less code, fewer bugs

 

## Basic Usage

### Example 1: Simple String List

```javascript
const tags = collection(['javascript', 'react']);

// Add a tag
add(tags, 'typescript');

// Remove a tag
remove(tags, 'react');

// Display
effect(() => {
  Elements.tagList.innerHTML = tags.items
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');
});
```

 

### Example 2: Todo List

```javascript
const todos = collection([]);

// Add a todo
function addTodo(text) {
  add(todos, {
    id: Date.now(),
    text: text,
    done: false,
    createdAt: new Date()
  });
}

// Toggle done status
function toggleTodo(id) {
  const todo = todos.items.find(t => t.id === id);
  if (todo) {
    update(todos, t => t.id === id, { done: !todo.done });
  }
}

// Delete a todo
function deleteTodo(id) {
  remove(todos, t => t.id === id);
}

// Render
effect(() => {
  Elements.todoList.innerHTML = todos.items
    .map(todo => `
      <li class="${todo.done ? 'completed' : ''}">
        <input type="checkbox" ${todo.done ? 'checked' : ''}>
        <span>${todo.text}</span>
        <button data-id="${todo.id}">Delete</button>
      </li>
    `)
    .join('');
});
```

 

### Example 3: Shopping Cart

```javascript
const cart = collection([]);

// Add item to cart
function addToCart(product) {
  const existing = cart.items.find(item => item.productId === product.id);

  if (existing) {
    // Increase quantity if already in cart
    update(cart, item => item.productId === product.id, {
      quantity: existing.quantity + 1
    });
  } else {
    // Add new item
    add(cart, {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
}

// Remove from cart
function removeFromCart(productId) {
  remove(cart, item => item.productId === productId);
}

// Update quantity
function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    update(cart, item => item.productId === productId, { quantity });
  }
}

// Clear cart
function emptyCart() {
  clear(cart);
}
```

 

### Example 4: Notification Queue

```javascript
const notifications = collection([]);

// Show a notification
function notify(message, type = 'info', duration = 3000) {
  const id = Date.now();

  add(notifications, {
    id,
    message,
    type,
    createdAt: new Date()
  });

  // Auto-dismiss
  setTimeout(() => {
    remove(notifications, n => n.id === id);
  }, duration);
}

// Dismiss a notification
function dismiss(id) {
  remove(notifications, n => n.id === id);
}

// Dismiss all
function dismissAll() {
  clear(notifications);
}

// Render notifications
effect(() => {
  Elements.notificationArea.innerHTML = notifications.items
    .map(n => `
      <div class="notification notification-${n.type}">
        ${n.message}
        <button onclick="dismiss(${n.id})">×</button>
      </div>
    `)
    .join('');
});

// Usage
notify('Item added to cart!', 'success');
notify('Connection lost', 'error', 5000);
```

 

## Combining with Computed

Collections work great with computed properties:

```javascript
const todos = collection([
  { id: 1, text: 'Task 1', done: true },
  { id: 2, text: 'Task 2', done: false },
  { id: 3, text: 'Task 3', done: false }
]);

// Add computed properties
computed(todos, {
  // Count of all todos
  totalCount: function() {
    return this.items.length;
  },

  // Count of completed
  doneCount: function() {
    return this.items.filter(t => t.done).length;
  },

  // Count of remaining
  remainingCount: function() {
    return this.items.filter(t => !t.done).length;
  },

  // Completed todos
  completedTodos: function() {
    return this.items.filter(t => t.done);
  },

  // Active todos
  activeTodos: function() {
    return this.items.filter(t => !t.done);
  },

  // Progress percentage
  progressPercent: function() {
    if (this.items.length === 0) return 0;
    return Math.round((this.doneCount / this.totalCount) * 100);
  }
});

// Use in effects
effect(() => {
  Elements.progress.textContent = `${todos.progressPercent}% complete`;
  Elements.remaining.textContent = `${todos.remainingCount} items left`;
});
```

 

## Real-World Examples

### Example 1: Kanban Board

```javascript
const columns = {
  todo: collection([]),
  inProgress: collection([]),
  done: collection([])
};

// Add a task
function addTask(text) {
  add(columns.todo, {
    id: Date.now(),
    text,
    createdAt: new Date()
  });
}

// Move task between columns
function moveTask(taskId, fromColumn, toColumn) {
  const task = columns[fromColumn].items.find(t => t.id === taskId);

  if (task) {
    remove(columns[fromColumn], t => t.id === taskId);
    add(columns[toColumn], task);
  }
}

// Render each column
Object.keys(columns).forEach(columnName => {
  effect(() => {
    Elements[`${columnName}Column`].innerHTML = columns[columnName].items
      .map(task => `<div class="task" data-id="${task.id}">${task.text}</div>`)
      .join('');
  });
});
```

 

### Example 2: Playlist Manager

```javascript
const playlist = collection([]);

// Add song
function addSong(song) {
  add(playlist, {
    id: Date.now(),
    title: song.title,
    artist: song.artist,
    duration: song.duration,
    addedAt: new Date()
  });
}

// Remove song
function removeSong(id) {
  remove(playlist, song => song.id === id);
}

// Reorder songs (move up)
function moveUp(id) {
  const index = playlist.items.findIndex(s => s.id === id);
  if (index > 0) {
    const items = [...playlist.items];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    playlist.items = items;
  }
}

// Computed: total duration
computed(playlist, {
  totalDuration: function() {
    return this.items.reduce((sum, song) => sum + song.duration, 0);
  },
  formattedDuration: function() {
    const mins = Math.floor(this.totalDuration / 60);
    const secs = this.totalDuration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
});

// Display
effect(() => {
  Elements.playlistDuration.textContent = playlist.formattedDuration;
  Elements.songCount.textContent = `${playlist.items.length} songs`;
});
```

 

### Example 3: Search Results with Filters

```javascript
const searchResults = collection([]);
const filters = state({
  category: 'all',
  minPrice: 0,
  maxPrice: 1000,
  sortBy: 'relevance'
});

// Fetch and populate results
async function search(query) {
  const response = await fetch(`/api/search?q=${query}`);
  const results = await response.json();

  // Clear and add new results
  clear(searchResults);
  results.forEach(item => add(searchResults, item));
}

// Computed: filtered and sorted results
computed(searchResults, {
  filteredResults: function() {
    return this.items
      .filter(item => {
        if (filters.category !== 'all' && item.category !== filters.category) {
          return false;
        }
        if (item.price < filters.minPrice || item.price > filters.maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'name': return a.name.localeCompare(b.name);
          default: return 0; // relevance (original order)
        }
      });
  },
  resultCount: function() {
    return this.filteredResults.length;
  }
});

// Render filtered results
effect(() => {
  Elements.resultCount.textContent = `${searchResults.resultCount} results`;
  Elements.resultList.innerHTML = searchResults.filteredResults
    .map(item => `
      <div class="result">
        <h3>${item.name}</h3>
        <p>$${item.price}</p>
      </div>
    `)
    .join('');
});
```

 

### Example 4: Form with Dynamic Fields

```javascript
const formFields = collection([
  { id: 1, name: 'email', type: 'email', value: '', required: true }
]);

// Add a custom field
function addField(name, type = 'text') {
  add(formFields, {
    id: Date.now(),
    name,
    type,
    value: '',
    required: false
  });
}

// Remove a field
function removeField(id) {
  remove(formFields, f => f.id === id);
}

// Update field value
function updateFieldValue(id, value) {
  update(formFields, f => f.id === id, { value });
}

// Computed: form data object
computed(formFields, {
  formData: function() {
    const data = {};
    this.items.forEach(field => {
      data[field.name] = field.value;
    });
    return data;
  },
  isValid: function() {
    return this.items.every(field => {
      if (field.required && !field.value) return false;
      return true;
    });
  }
});

// Render dynamic form
effect(() => {
  Elements.dynamicForm.innerHTML = formFields.items
    .map(field => `
      <div class="form-field">
        <label>${field.name}</label>
        <input
          type="${field.type}"
          value="${field.value}"
          ${field.required ? 'required' : ''}
          data-id="${field.id}"
        >
        <button type="button" onclick="removeField(${field.id})">Remove</button>
      </div>
    `)
    .join('');

  Elements.submitBtn.disabled = !formFields.isValid;
});
```

 

## Working with the Items Array

The `items` property is a regular array, so you can use all array methods:

```javascript
const items = collection([1, 2, 3, 4, 5]);

// Reading (doesn't modify)
items.items.length;           // 5
items.items[0];               // 1
items.items.includes(3);      // true
items.items.indexOf(4);       // 3

// Finding
items.items.find(x => x > 3);     // 4
items.items.filter(x => x > 2);   // [3, 4, 5]

// Transforming (creates new array, doesn't modify)
items.items.map(x => x * 2);      // [2, 4, 6, 8, 10]

// To modify, use collection methods or reassign:
add(items, 6);                    // Adds 6
remove(items, 1);                 // Removes 1
items.items = items.items.map(x => x * 2);  // Replaces all
```

 

## Common Patterns

### Pattern 1: Toggle Item in Collection

```javascript
function toggleItem(collection, item, key = 'id') {
  const exists = collection.items.find(i => i[key] === item[key]);

  if (exists) {
    remove(collection, i => i[key] === item[key]);
  } else {
    add(collection, item);
  }
}

// Usage
toggleItem(favorites, { id: 123, name: 'Product' });
```

 

### Pattern 2: Upsert (Update or Insert)

```javascript
function upsert(collection, item, key = 'id') {
  const exists = collection.items.find(i => i[key] === item[key]);

  if (exists) {
    update(collection, i => i[key] === item[key], item);
  } else {
    add(collection, item);
  }
}

// Usage
upsert(users, { id: 1, name: 'Alice Updated' });
```

 

### Pattern 3: Batch Operations

```javascript
function addMany(collection, items) {
  batch(() => {
    items.forEach(item => add(collection, item));
  });
}

function removeMany(collection, predicate) {
  batch(() => {
    const toRemove = collection.items.filter(predicate);
    toRemove.forEach(item => remove(collection, i => i === item));
  });
}

// Or more efficiently:
function removeWhere(collection, predicate) {
  collection.items = collection.items.filter(item => !predicate(item));
}
```

 

## Summary

**What is `collection()`?**
A reactive array wrapper with convenient methods for managing lists.

**Methods:**
| Method | Purpose |
|--------|---------|
| `add(collection, item)` | Add an item |
| `remove(collection, predicate)` | Remove matching item |
| `update(collection, predicate, updates)` | Update matching item |
| `clear(collection)` | Remove all items |

**Why use it?**
- ✅ Cleaner code for array operations
- ✅ Automatic reactivity
- ✅ Works with computed and effects
- ✅ Consistent API

**Key Takeaway:**

```javascript
// Create
const list = collection([]);

// Add
add(list, item);

// Remove
remove(list, item => item.id === targetId);

// Update
update(list, item => item.id === targetId, { changes });

// Clear
clear(list);

// Access items
list.items.forEach(/* ... */);
```

**Remember:** `collection()` returns a state object with an `items` array. Use the helper methods for modifications, and access `.items` for reading!
