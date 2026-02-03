# `collection.items` - The Reactive Array Property

## Quick Start (30 seconds)

```javascript
// Create a collection
const todos = createCollection([
  { id: 1, text: 'Learn collections', done: false },
  { id: 2, text: 'Build app', done: false }
]);

// Access the items array directly
console.log(todos.items);
// Output: [{ id: 1, text: '...', done: false }, { id: 2, ... }]

// The items array is reactive
effect(() => {
  console.log('Todo count:', todos.items.length);
});

// Direct array operations work
todos.items.push({ id: 3, text: 'Deploy', done: false });
// Effect automatically runs: "Todo count: 3" ✨

// Access specific items
const firstTodo = todos.items[0];
const lastTodo = todos.items[todos.items.length - 1];
```

**What just happened?** You accessed the underlying reactive array that powers the collection!

 

## What is `collection.items`?

`collection.items` is a **property that contains the actual reactive array** of items in your collection.

Simply put: it's the array that holds all your data, and you can work with it directly like any JavaScript array.

Think of it as **looking inside the box** - the collection is the box, `items` is what's inside.

 

## Syntax

```javascript
collection.items  // Array - The reactive array

// Read
const itemsArray = collection.items;

// Write (replace entire array)
collection.items = newArray;

// Modify (direct array operations)
collection.items.push(item);
collection.items[0] = newValue;
```

**Type:** Reactive Array

**Access:** Read and Write

 

## Why Does This Exist?

### The Problem: Need Direct Array Access

Sometimes you need to work with the array directly:

```javascript
const todos = createCollection([...]);

// Without .items - how to access the array?
// ❌ Can't iterate: todos.forEach() exists but what if you need map?
// ❌ Can't access by index: todos[0] doesn't work
// ❌ Can't use array methods: todos.reduce() doesn't exist
// ❌ Can't pass to other libraries: chart(todos) won't work
```

**Problems:**
❌ **No index access** - Can't do `collection[0]`  
❌ **Limited methods** - Not all array methods available  
❌ **Can't pass array** - Some APIs need plain arrays  
❌ **No array spread** - Can't do `[...collection]`  

### The Solution with `.items`

```javascript
const todos = createCollection([...]);

// Access by index
const first = todos.items[0]; // ✅ Works

// Use any array method
const total = todos.items.reduce((sum, t) => sum + t.value, 0); // ✅ Works

// Pass to libraries
renderChart(todos.items); // ✅ Works

// Spread operator
const copy = [...todos.items]; // ✅ Works
```

**Benefits:**
✅ **Full array access** - All array operations  
✅ **Standard JavaScript** - No learning curve  
✅ **Library compatibility** - Works everywhere  
✅ **Maximum flexibility** - Do anything with the array  

 

## Mental Model

Think of a collection as **a smart container**:

```
Collection (Smart Container)
┌─────────────────────────────┐
│  Methods:                   │
│  - add()                    │
│  - remove()                 │
│  - update()                 │
│  - find()                   │
│  etc...                     │
│                             │
│  ┌───────────────────────┐ │
│  │  items (The Array)    │ │ ← Direct access here!
│  │  ──────────────────   │ │
│  │  [0] { id: 1, ... }   │ │
│  │  [1] { id: 2, ... }   │ │
│  │  [2] { id: 3, ... }   │ │
│  └───────────────────────┘ │
└─────────────────────────────┘
```

**Key Insight:** Collections provide convenience methods, but `items` gives you the raw power of arrays.

 

## How It Works

The `items` property is the actual reactive array:

```
Create Collection
        |
        v
Reactive Array Created
        |
        v
Stored in .items property
        |
        v
Wrapped with collection methods
        |
        v
Both accessible ✨
```

### Under the Hood

```javascript
// Simplified implementation
function createCollection(initialItems = []) {
  const collection = state({
    items: [...initialItems]  // Reactive array
  });
  
  // Add collection methods
  collection.add = function(item) {
    this.items.push(item);  // Modifies .items
  };
  
  collection.remove = function(predicate) {
    const idx = this.items.findIndex(predicate);
    if (idx !== -1) this.items.splice(idx, 1);
  };
  
  // ... more methods
  
  return collection;
}
```

 

## Basic Usage

### Example 1: Read Access

```javascript
const products = createCollection([
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 29 },
  { id: 3, name: 'Keyboard', price: 79 }
]);

// Get the array
console.log(products.items);
// [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]

// Get count
console.log(products.items.length); // 3

// Access by index
console.log(products.items[0]); // { id: 1, name: 'Laptop', ... }
console.log(products.items[1]); // { id: 2, name: 'Mouse', ... }

// Get last item
const lastProduct = products.items[products.items.length - 1];
console.log(lastProduct); // { id: 3, name: 'Keyboard', ... }
```

 

### Example 2: Iteration

```javascript
const tasks = createCollection([
  { id: 1, text: 'Task 1', priority: 'high' },
  { id: 2, text: 'Task 2', priority: 'low' },
  { id: 3, text: 'Task 3', priority: 'medium' }
]);

// Standard for loop
for (let i = 0; i < tasks.items.length; i++) {
  console.log(tasks.items[i].text);
}

// For...of loop
for (const task of tasks.items) {
  console.log(task.text);
}

// Array forEach
tasks.items.forEach((task, index) => {
  console.log(`${index}: ${task.text}`);
});
```

 

### Example 3: Array Methods

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

// Map
const doubled = numbers.items.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Filter
const evens = numbers.items.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]

// Reduce
const sum = numbers.items.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// Find
const found = numbers.items.find(n => n > 3);
console.log(found); // 4

// Every/Some
const allPositive = numbers.items.every(n => n > 0);
const hasEven = numbers.items.some(n => n % 2 === 0);
```

 

### Example 4: Direct Modification

```javascript
const cart = createCollection([
  { id: 1, name: 'Item 1', qty: 1 }
]);

// Push (add to end)
cart.items.push({ id: 2, name: 'Item 2', qty: 2 });

// Unshift (add to start)
cart.items.unshift({ id: 0, name: 'Item 0', qty: 1 });

// Modify by index
cart.items[0].qty = 5;

// Splice (remove/insert)
cart.items.splice(1, 1); // Remove at index 1

// Pop (remove from end)
const lastItem = cart.items.pop();

// Shift (remove from start)
const firstItem = cart.items.shift();
```

 

### Example 5: Replacing Entire Array

```javascript
const list = createCollection([1, 2, 3]);

console.log(list.items); // [1, 2, 3]

// Replace entire array
list.items = [4, 5, 6, 7, 8];

console.log(list.items); // [4, 5, 6, 7, 8]

// This triggers reactivity
effect(() => {
  console.log('Items changed:', list.items);
});
// Logs immediately, then on every array replacement
```

 

## Real-World Examples

### Example 1: Display List in UI

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true }
]);

// Render to DOM
function renderTodos() {
  const container = document.getElementById('todo-list');
  
  container.innerHTML = todos.items.map(todo => `
    <div class="todo ${todo.done ? 'done' : ''}">
      <input type="checkbox" ${todo.done ? 'checked' : ''} />
      <span>${todo.text}</span>
    </div>
  `).join('');
}

// Re-render on changes
effect(() => {
  // Access .items to track changes
  const _ = todos.items.length;
  renderTodos();
});
```

 

### Example 2: Calculate Statistics

```javascript
const sales = createCollection([
  { product: 'Laptop', amount: 999, date: '2024-01-15' },
  { product: 'Mouse', amount: 29, date: '2024-01-15' },
  { product: 'Keyboard', amount: 79, date: '2024-01-16' }
]);

// Calculate total
const total = sales.items.reduce((sum, sale) => sum + sale.amount, 0);
console.log('Total sales:', total); // 1107

// Average sale amount
const average = total / sales.items.length;
console.log('Average:', average); // 369

// Highest sale
const highest = Math.max(...sales.items.map(s => s.amount));
console.log('Highest:', highest); // 999

// Group by date
const byDate = {};
sales.items.forEach(sale => {
  if (!byDate[sale.date]) byDate[sale.date] = [];
  byDate[sale.date].push(sale);
});
console.log('By date:', byDate);
```

 

### Example 3: Sort and Filter

```javascript
const students = createCollection([
  { name: 'Alice', grade: 85, age: 20 },
  { name: 'Bob', grade: 92, age: 19 },
  { name: 'Charlie', grade: 78, age: 21 },
  { name: 'Diana', grade: 95, age: 20 }
]);

// Filter passing students (grade >= 80)
const passing = students.items.filter(s => s.grade >= 80);
console.log('Passing:', passing.length); // 3

// Sort by grade (descending)
const sorted = [...students.items].sort((a, b) => b.grade - a.grade);
console.log('Top student:', sorted[0].name); // Diana

// Filter by age, then sort by grade
const age20 = students.items
  .filter(s => s.age === 20)
  .sort((a, b) => b.grade - a.grade);

console.log('Age 20, sorted by grade:', age20);
// [{ name: 'Diana', ... }, { name: 'Alice', ... }]
```

 

### Example 4: Pass to External Library

```javascript
const chartData = createCollection([
  { month: 'Jan', sales: 1200 },
  { month: 'Feb', sales: 1500 },
  { month: 'Mar', sales: 1800 }
]);

// Pass to charting library
renderChart({
  data: chartData.items,  // Pass the array
  xKey: 'month',
  yKey: 'sales'
});

// Update chart when data changes
effect(() => {
  const _ = chartData.items.length; // Track changes
  renderChart({
    data: chartData.items,
    xKey: 'month',
    yKey: 'sales'
  });
});
```

 

### Example 5: Export/Import Data

```javascript
const inventory = createCollection([
  { sku: 'A001', name: 'Widget', qty: 50 },
  { sku: 'A002', name: 'Gadget', qty: 30 }
]);

// Export to JSON
function exportData() {
  const json = JSON.stringify(inventory.items, null, 2);
  
  // Download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory.json';
  a.click();
}

// Import from JSON
function importData(jsonString) {
  const data = JSON.parse(jsonString);
  inventory.items = data; // Replace entire array
}

// Or use CSV
function exportCSV() {
  const headers = Object.keys(inventory.items[0]).join(',');
  const rows = inventory.items.map(item => 
    Object.values(item).join(',')
  );
  
  return [headers, ...rows].join('\n');
}
```

 

## Common Patterns

### Pattern 1: Reactive Computed from Items

```javascript
const products = createCollection([...]);

// Create computed based on items
const totalValue = computed(products, {
  total: function() {
    return this.items.reduce((sum, p) => sum + p.price, 0);
  }
});

// Or use effect
let total = 0;
effect(() => {
  total = products.items.reduce((sum, p) => sum + p.price, 0);
  console.log('Total:', total);
});
```

 

### Pattern 2: Safely Access by Index

```javascript
function getItemAt(collection, index) {
  if (index < 0 || index >= collection.items.length) {
    return null;
  }
  return collection.items[index];
}

// Usage
const item = getItemAt(todos, 5); // Returns null if out of bounds
```

 

### Pattern 3: Batch Array Operations

```javascript
const list = createCollection([1, 2, 3]);

// Multiple operations
batch(() => {
  list.items.push(4);
  list.items.push(5);
  list.items[0] = 10;
  list.items.sort();
});
// Only triggers reactivity once
```

 

### Pattern 4: Clone Array

```javascript
// Shallow clone
const original = createCollection([1, 2, 3]);
const clone = [...original.items];

// Deep clone (for objects)
const todos = createCollection([{ id: 1, text: '...' }]);
const deepClone = JSON.parse(JSON.stringify(todos.items));

// Or structured clone
const deepClone2 = structuredClone(todos.items);
```

 

### Pattern 5: Array Destructuring

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

// Destructure
const [first, second, ...rest] = numbers.items;

console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4, 5]

// Swap elements
[numbers.items[0], numbers.items[1]] = [numbers.items[1], numbers.items[0]];
```

 

### Pattern 6: Conditional Rendering

```javascript
const messages = createCollection([]);

effect(() => {
  const container = document.getElementById('messages');
  
  if (messages.items.length === 0) {
    container.innerHTML = '<p>No messages</p>';
  } else {
    container.innerHTML = messages.items.map(m => 
      `<div class="message">${m.text}</div>`
    ).join('');
  }
});
```

 

## Important Behaviors

### 1. It's a Reactive Array

```javascript
const list = createCollection([1, 2, 3]);

// Changes trigger reactivity
effect(() => {
  console.log('Length:', list.items.length);
});

list.items.push(4); // Effect runs: "Length: 4"
list.items.pop();   // Effect runs: "Length: 3"
```

 

### 2. Array Methods Work Naturally

```javascript
const todos = createCollection([...]);

// All standard array methods work
todos.items.map(...)
todos.items.filter(...)
todos.items.reduce(...)
todos.items.find(...)
todos.items.some(...)
todos.items.every(...)
todos.items.slice(...)
todos.items.concat(...)
// ... etc
```

 

### 3. Direct Mutations Trigger Reactivity

```javascript
const nums = createCollection([1, 2, 3]);

effect(() => {
  console.log('First:', nums.items[0]);
});

// Direct mutation triggers effect
nums.items[0] = 10; // Effect runs: "First: 10"
```

 

### 4. You Can Replace the Entire Array

```javascript
const list = createCollection([1, 2, 3]);

// Replace entire array
list.items = [4, 5, 6, 7];

// New array is also reactive
effect(() => {
  console.log('Items:', list.items);
});
```

 

## When to Use `.items` vs Collection Methods

### Use `.items` When:

✅ **Need specific array method** - reduce, every, some, etc.  
✅ **Access by index** - `collection.items[0]`  
✅ **Pass to external library** - chart(collection.items)  
✅ **Complex operations** - filter + map + reduce chains  
✅ **Standard JavaScript** - Familiar array operations  

### Use Collection Methods When:

✅ **Simple CRUD** - add(), remove(), update()  
✅ **Chainable operations** - `collection.add(x).remove(y)`  
✅ **Semantic clarity** - `todos.toggle(...)` is clearer  
✅ **Convenience** - Built-in helpers like `toggleAll()`  

 

## Common Use Cases

### Use Case 1: Index Access

```javascript
const playlist = createCollection([...songs]);

// First song
const first = playlist.items[0];

// Last song
const last = playlist.items[playlist.items.length - 1];

// Middle song
const middle = playlist.items[Math.floor(playlist.items.length / 2)];
```

 

### Use Case 2: Array Spreading

```javascript
const selected = createCollection([1, 2, 3]);

// Spread into new array
const copy = [...selected.items];

// Combine arrays
const combined = [...selected.items, 4, 5, 6];

// Pass to function
Math.max(...selected.items);
```

 

### Use Case 3: Complex Filtering

```javascript
const products = createCollection([...]);

// Multi-condition filter
const filtered = products.items
  .filter(p => p.price > 50)
  .filter(p => p.inStock)
  .filter(p => p.category === 'Electronics');
```

 

### Use Case 4: Aggregation

```javascript
const orders = createCollection([...]);

// Total revenue
const revenue = orders.items.reduce((sum, order) => 
  sum + order.total, 0
);

// Average order value
const average = revenue / orders.items.length;

// Group by status
const grouped = orders.items.reduce((acc, order) => {
  if (!acc[order.status]) acc[order.status] = [];
  acc[order.status].push(order);
  return acc;
}, {});
```

 

## Summary

**What is `collection.items`?**  
The reactive array property that contains all the collection's data.

**Why use it?**
- ✅ Direct array access
- ✅ Use any array method
- ✅ Access by index
- ✅ Pass to external libraries
- ✅ Standard JavaScript
- ✅ Maximum flexibility

**Key Takeaway:**

```
Collection Methods          .items Property
      |                          |
Convenience                Full Array Power
      |                          |
add(), remove()            map(), reduce(), []
      |                          |
Semantic ✅               Standard JS ✅
```

**One-Line Rule:** Use `.items` when you need the full power of JavaScript arrays.

**Best Practices:**
- Use collection methods for simple operations
- Use `.items` for complex array operations
- Access by index via `.items[index]`
- Pass `.items` to external libraries
- Remember: both are reactive!

**Remember:** `.items` gives you direct access to the reactive array! 🎉