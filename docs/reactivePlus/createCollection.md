# `createCollection()` - Reactive Arrays with Built-in Methods

## Quick Start (30 seconds)

```javascript
// Create reactive collection with array methods
const todos = createCollection([
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: false }
]);

// Auto-update DOM when collection changes
effect(() => {
  Elements.update({
    todoList: {
      innerHTML: todos.items
        .map(t => `<li class="${t.done ? 'done' : ''}">${t.text}</li>`)
        .join('')
    },
    todoCount: { textContent: `${todos.length} tasks` }
  });
});

// Use built-in methods
todos.add({ text: 'Read book', done: false });
// ✨ DOM updates automatically!
```

**That's it.** Create reactive arrays with built-in methods like `.add()`, `.remove()`, `.update()`, `.clear()` that automatically trigger updates.

---

## What is `createCollection()`?

`createCollection()` creates **reactive arrays with convenience methods**. Instead of manually managing arrays and triggering updates, you get a collection with built-in operations.

Think of it as **an array with superpowers** — it tracks changes automatically and provides helpful methods for common array operations like adding, removing, and updating items.

**In practical terms:** Instead of `state({ items: [] })` where you manually push/splice, you get a collection with `.add()`, `.remove()`, `.update()` methods that handle everything.

---

## Syntax

```javascript
// Create collection
const myCollection = createCollection(initialItems);

// Access items
console.log(myCollection.items); // Array of items
console.log(myCollection.length); // Item count
console.log(myCollection.first);  // First item
console.log(myCollection.last);   // Last item

// Methods
myCollection.add(item);              // Add item
myCollection.remove(predicate);      // Remove item
myCollection.update(predicate, updates); // Update item
myCollection.clear();                // Remove all
myCollection.toggle(predicate, field); // Toggle boolean field
myCollection.push(...items);         // Add multiple
myCollection.pop();                  // Remove last
myCollection.shift();                // Remove first
myCollection.unshift(...items);      // Add to beginning
myCollection.sort(compareFn);        // Sort items
myCollection.reverse();              // Reverse order
myCollection.reset(newItems);        // Replace all items
```

**Parameters:**
- `initialItems` (optional) - Array of initial items (default: `[]`)

**Returns:**
- Reactive collection with `.items` array and built-in methods

---

## Why Does This Exist?

### The Problem Without createCollection

Managing an array in vanilla JavaScript requires manual DOM updates:

```javascript
// ❌ Vanilla JavaScript - manual array management
let todos = [
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: false }
];

function updateDisplay() {
  const list = document.getElementById('todo-list');
  list.innerHTML = todos
    .map(t => `<li class="${t.done ? 'done' : ''}">${t.text}</li>`)
    .join('');

  document.getElementById('todo-count').textContent = `${todos.length} tasks`;
}

// Add todo
function addTodo(text) {
  todos.push({ text, done: false });
  updateDisplay(); // Must call manually!
}

// Remove todo
function removeTodo(index) {
  todos.splice(index, 1);
  updateDisplay(); // Must call manually!
}

// Toggle todo
function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  updateDisplay(); // Must call manually!
}

// Initial render
updateDisplay();
```

**Problems:**
❌ **Manual updates** - Must call `updateDisplay()` after every change
❌ **Verbose** - Lots of boilerplate for simple operations
❌ **Error-prone** - Easy to forget update calls
❌ **Scattered logic** - Array operations and UI updates mixed together

### The Solution with `createCollection()`

```javascript
// ✅ DOM Helpers + Reactive State with createCollection() - automatic
const todos = createCollection([
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: false }
]);

// Auto-update DOM using bulk updates
effect(() => {
  Elements.update({
    todoList: {
      innerHTML: todos.items
        .map(t => `<li class="${t.done ? 'done' : ''}">${t.text}</li>`)
        .join('')
    },
    todoCount: { textContent: `${todos.length} tasks` },
    activeCount: {
      textContent: `${todos.items.filter(t => !t.done).length} active`
    }
  });
});

// Clean, simple operations
todos.add({ text: 'Read book', done: false });
todos.remove(t => t.text === 'Buy milk');
todos.toggle(t => t.text === 'Walk dog', 'done');
// ✨ All updates trigger effect automatically!
```

**Benefits:**
✅ **Automatic updates** - Change collection, DOM updates automatically
✅ **Built-in methods** - `.add()`, `.remove()`, `.update()` included
✅ **Clean API** - Expressive, chainable methods
✅ **No manual sync** - Effects run automatically
✅ **Less code** - 70% less boilerplate

---

## Built-in Methods Overview

### Adding Items
- `.add(item)` - Add single item
- `.push(...items)` - Add multiple items to end
- `.unshift(...items)` - Add multiple items to beginning

### Removing Items
- `.remove(predicate)` - Remove first matching item
- `.removeWhere(predicate)` - Remove all matching items
- `.pop()` - Remove and return last item
- `.shift()` - Remove and return first item
- `.clear()` - Remove all items

### Updating Items
- `.update(predicate, updates)` - Update first matching item
- `.updateWhere(predicate, updates)` - Update all matching items
- `.toggle(predicate, field)` - Toggle boolean field
- `.toggleAll(predicate, field)` - Toggle field on all matching items

### Querying Items
- `.find(predicate)` - Find first matching item
- `.filter(predicate)` - Get filtered array
- `.map(fn)` - Map over items
- `.forEach(fn)` - Iterate over items
- `.includes(item)` - Check if item exists
- `.indexOf(item)` - Get item index
- `.at(index)` - Get item at index

### Array Operations
- `.sort(compareFn)` - Sort items in place
- `.reverse()` - Reverse order
- `.splice(start, deleteCount, ...items)` - Splice items
- `.slice(start, end)` - Get slice (returns array)
- `.reset(newItems)` - Replace all items

### Getters
- `.length` - Number of items
- `.first` - First item
- `.last` - Last item
- `.isEmpty()` - Check if empty
- `.toArray()` - Get copy as plain array

---

## Basic Usage

### Example 1: Todo List

```javascript
const todos = createCollection();

effect(() => {
  Elements.update({
    todoList: {
      innerHTML: todos.items
        .map((t, i) => `
          <li>
            <input type="checkbox" ${t.done ? 'checked' : ''}
                   data-index="${i}">
            <span>${t.text}</span>
            <button data-index="${i}">Delete</button>
          </li>
        `)
        .join('')
    },
    todoCount: { textContent: `${todos.length} tasks` }
  });
});

// Add todo using bulk event binding
Elements.update({
  addTodoBtn: {
    addEventListener: ['click', () => {
      const text = Elements.todoInput.value.trim();
      if (text) {
        todos.add({ text, done: false });
        Elements.todoInput.value = '';
      }
    }]
  },
  todoList: {
    addEventListener: ['click', (e) => {
      const index = parseInt(e.target.dataset.index);

      if (e.target.type === 'checkbox') {
        todos.toggle(t => t === todos.at(index), 'done');
      }

      if (e.target.tagName === 'BUTTON') {
        todos.remove(t => t === todos.at(index));
      }
    }]
  }
});
```

---

### Example 2: Shopping Cart

```javascript
const cart = createCollection();

effect(() => {
  const total = cart.items.reduce((sum, item) =>
    sum + (item.price * item.qty), 0
  );

  Elements.update({
    cartItems: {
      innerHTML: cart.items
        .map(item => `
          <li>
            ${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}
          </li>
        `)
        .join('')
    },
    itemCount: { textContent: `${cart.length} items` },
    totalPrice: { textContent: `$${total.toFixed(2)}` }
  });
});

// Add to cart
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    cart.update(item => item.id === product.id, {
      qty: existing.qty + 1
    });
  } else {
    cart.add({ ...product, qty: 1 });
  }
}

// Update quantity
function updateQty(productId, qty) {
  if (qty <= 0) {
    cart.remove(item => item.id === productId);
  } else {
    cart.update(item => item.id === productId, { qty });
  }
}
```

See the full documentation for more examples including message lists, tag managers, playlists, inventory systems, and more.

---

## Key Takeaways

✅ **Reactive arrays** - Changes automatically trigger updates
✅ **Built-in methods** - 40+ convenience methods included
✅ **Clean API** - Expressive `.add()`, `.remove()`, `.update()` operations
✅ **Chainable** - Most methods return `this` for chaining
✅ **Automatic updates** - Works seamlessly with effects and bindings

---

## What's Next?

- **`computedCollection()`** - Collections with computed properties
- **`filteredCollection()`** - Filtered views of collections
- **`state()`** - For objects and complex data

---

## Summary

`createCollection()` creates **reactive arrays with built-in methods** for managing lists of data. It combines array reactivity with convenience methods for common operations.

**The magic formula:**
```
createCollection(items) = state({ items }) + 40+ methods
────────────────────────────────────────────────────────
Reactive array with superpowers
```

Think of it as **an array that manages itself** — add, remove, update items with clean methods, and the UI updates automatically.
