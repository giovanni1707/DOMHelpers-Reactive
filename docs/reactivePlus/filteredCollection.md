# `filteredCollection()` - Filtered Views of Collections

## Quick Start (30 seconds)

```javascript
// Create source collection
const allTodos = createCollection([
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: true },
  { text: 'Read book', done: false }
]);

// Create filtered view (only active todos)
const activeTodos = filteredCollection(
  allTodos,
  (todo) => !todo.done
);

console.log(activeTodos.items.length); // 2 (Buy milk, Read book)

// Change source collection
allTodos.items[0].done = true;
console.log(activeTodos.items.length); // 1 (auto-updated!)
```

**That's it.** Create a filtered view of a collection that automatically updates when the source collection changes.

---

## What is `filteredCollection()`?

`filteredCollection()` creates **reactive filtered views of collections**. It's a read-only collection that automatically stays in sync with a source collection based on a filter predicate.

Think of it as **a live filter or view in a database** — you define the filter once, and the view automatically updates when the source data changes.

**In practical terms:** Instead of manually filtering arrays and keeping views in sync, you create a filtered collection that automatically reflects changes to the source.

---

## Syntax

```javascript
// Create filtered collection
const filtered = filteredCollection(sourceCollection, predicate);

// Access filtered items
console.log(filtered.items); // Array of filtered items
console.log(filtered.length); // Count of filtered items

// Example
const allTodos = createCollection([...]);

const activeTodos = filteredCollection(
  allTodos,
  (todo) => !todo.done
);

const completedTodos = filteredCollection(
  allTodos,
  (todo) => todo.done
);

// Both views auto-update when allTodos changes
```

**Parameters:**
- `sourceCollection` - Source reactive collection
- `predicate` - Filter function `(item) => boolean`

**Returns:**
- Reactive collection with filtered items (auto-updates)

**Important:** Filtered collections are **read-only views**. Modify the source collection to change the data.

---

## Why Does This Exist?

### The Problem Without filteredCollection

```javascript
// ❌ Vanilla JavaScript - manual filtering and updates
let allTodos = [
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: true },
  { text: 'Read book', done: false }
];

function getActiveTodos() {
  return allTodos.filter(t => !t.done);
}

function getCompletedTodos() {
  return allTodos.filter(t => t.done);
}

function updateDisplay() {
  const active = getActiveTodos();
  const completed = getCompletedTodos();

  document.getElementById('active-list').innerHTML = active
    .map(t => `<li>${t.text}</li>`).join('');

  document.getElementById('completed-list').innerHTML = completed
    .map(t => `<li>${t.text}</li>`).join('');

  document.getElementById('active-count').textContent = active.length;
  document.getElementById('completed-count').textContent = completed.length;
}

// Mark todo as done
allTodos[0].done = true;
updateDisplay(); // Must manually recalculate and update!
```

**Problems:**
❌ **Manual filtering** - Must call filter functions repeatedly
❌ **Manual updates** - Must call `updateDisplay()` after every change
❌ **Recalculation overhead** - Filters run on every update
❌ **No caching** - Same filter applied multiple times

### The Solution with `filteredCollection()`

```javascript
// ✅ DOM Helpers + Reactive State with filteredCollection() - automatic
const allTodos = createCollection([
  { text: 'Buy milk', done: false },
  { text: 'Walk dog', done: true },
  { text: 'Read book', done: false }
]);

// Create filtered views
const activeTodos = filteredCollection(allTodos, t => !t.done);
const completedTodos = filteredCollection(allTodos, t => t.done);

// Auto-update DOM using bulk updates
effect(() => {
  Elements.update({
    activeList: {
      innerHTML: activeTodos.items
        .map(t => `<li>${t.text}</li>`)
        .join('')
    },
    completedList: {
      innerHTML: completedTodos.items
        .map(t => `<li>${t.text}</li>`)
        .join('')
    },
    activeCount: { textContent: activeTodos.length },
    completedCount: { textContent: completedTodos.length }
  });
});

// Just modify the source
allTodos.items[0].done = true;
// ✨ Both filtered views update automatically!
```

**Benefits:**
✅ **Automatic filtering** - Views update when source changes
✅ **No manual sync** - Effects handle updates automatically
✅ **Multiple views** - Create multiple filters of same source
✅ **Clean code** - Define filter once, stays in sync
✅ **Read-only safety** - Views can't accidentally modify source

---

## Basic Usage

### Example 1: Todo List with Active/Completed Views

```javascript
const todos = createCollection([]);

const activeTodos = filteredCollection(todos, t => !t.done);
const completedTodos = filteredCollection(todos, t => t.done);

effect(() => {
  Elements.update({
    activeList: {
      innerHTML: activeTodos.items
        .map(t => `<li>${t.text}</li>`)
        .join('')
    },
    completedList: {
      innerHTML: completedTodos.items
        .map(t => `<li>${t.text}</li>`)
        .join('')
    },
    activeCount: { textContent: `${activeTodos.length} active` },
    completedCount: { textContent: `${completedTodos.length} completed` }
  });
});

// Add todo
todos.add({ text: 'Buy milk', done: false });
// ✨ activeTodos view updates

// Mark as done
todos.items[0].done = true;
// ✨ activeTodos and completedTodos both update
```

---

### Example 2: Product Filter by Category

```javascript
const products = createCollection([
  { name: 'Laptop', price: 999, category: 'electronics' },
  { name: 'Mouse', price: 29, category: 'electronics' },
  { name: 'Desk', price: 299, category: 'furniture' },
  { name: 'Chair', price: 199, category: 'furniture' }
]);

const electronics = filteredCollection(
  products,
  p => p.category === 'electronics'
);

const furniture = filteredCollection(
  products,
  p => p.category === 'furniture'
);

effect(() => {
  Elements.update({
    electronicsCount: { textContent: electronics.length },
    furnitureCount: { textContent: furniture.length }
  });
});
```

---

### Example 3: Priority Task Filter

```javascript
const tasks = createCollection([
  { title: 'Fix bug', priority: 'high', done: false },
  { title: 'Update docs', priority: 'low', done: false },
  { title: 'Review PR', priority: 'high', done: true }
]);

const highPriority = filteredCollection(
  tasks,
  t => t.priority === 'high' && !t.done
);

effect(() => {
  Elements.update({
    highPriorityList: {
      innerHTML: highPriority.items
        .map(t => `<li>${t.title}</li>`)
        .join(''),
      style: { display: highPriority.length > 0 ? 'block' : 'none' }
    },
    urgentBadge: {
      textContent: highPriority.length,
      style: { display: highPriority.length > 0 ? 'inline' : 'none' }
    }
  });
});
```

---

### Example 4: Search Results

```javascript
const allItems = createCollection([
  { name: 'Apple' },
  { name: 'Banana' },
  { name: 'Cherry' }
]);

const searchQuery = ref('');

// Create dynamic filtered view based on search
let searchResults = null;

effect(() => {
  // Recreate filtered collection when query changes
  searchResults = filteredCollection(
    allItems,
    item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

effect(() => {
  if (searchResults) {
    Elements.update({
      resultCount: { textContent: `${searchResults.length} results` },
      resultList: {
        innerHTML: searchResults.items
          .map(item => `<li>${item.name}</li>`)
          .join('')
      }
    });
  }
});
```

---

### Example 5: Price Range Filter

```javascript
const products = createCollection([...]);

const minPrice = ref(0);
const maxPrice = ref(1000);

let filteredProducts = null;

effect(() => {
  filteredProducts = filteredCollection(
    products,
    p => p.price >= minPrice.value && p.price <= maxPrice.value
  );
});

effect(() => {
  if (filteredProducts) {
    Elements.update({
      productList: {
        innerHTML: filteredProducts.items
          .map(p => `<li>${p.name} - $${p.price}</li>`)
          .join('')
      },
      resultCount: { textContent: `${filteredProducts.length} products` }
    });
  }
});
```

---

## Key Differences from Manual Filtering

### Manual Filtering
```javascript
const active = todos.items.filter(t => !t.done);
// ❌ Static snapshot - doesn't update
```

### Filtered Collection
```javascript
const active = filteredCollection(todos, t => !t.done);
// ✅ Live view - auto-updates when todos change
```

---

## Common Patterns

### Pattern 1: Multiple Views of Same Data

```javascript
const tasks = createCollection([...]);

const byStatus = {
  todo: filteredCollection(tasks, t => t.status === 'todo'),
  inProgress: filteredCollection(tasks, t => t.status === 'inProgress'),
  done: filteredCollection(tasks, t => t.status === 'done')
};

effect(() => {
  Elements.update({
    todoCount: { textContent: byStatus.todo.length },
    inProgressCount: { textContent: byStatus.inProgress.length },
    doneCount: { textContent: byStatus.done.length }
  });
});
```

### Pattern 2: Nested Filters

```javascript
const all = createCollection([...]);
const active = filteredCollection(all, t => !t.done);
const highPriorityActive = filteredCollection(active, t => t.priority === 'high');
// ✨ Changes to 'all' flow through both filters
```

---

## Key Takeaways

✅ **Live views** - Auto-updates when source changes
✅ **Multiple views** - Create many filters of one source
✅ **Read-only** - Can't accidentally modify through view
✅ **Reactive** - Works with effects and bindings
✅ **Efficient** - Only recalculates when source changes

---

## What's Next?

- **`createCollection()`** - Create source collections
- **`computedCollection()`** - Collections with computed properties
- **`effect()`** - React to filtered collection changes

---

## Summary

`filteredCollection()` creates **reactive filtered views** that automatically stay in sync with a source collection.

**The magic formula:**
```
filteredCollection(source, predicate) =
  Live filtered view that auto-updates
───────────────────────────────────────
Set filter once, stays in sync forever
```

Think of it as **a database view** — you define the filter criteria, and the view automatically reflects changes to the source data. Perfect for showing different slices of the same data without manual synchronization.
