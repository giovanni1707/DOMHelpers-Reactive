# `collection.forEach(fn)` - Iterate Over Collection Items

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: true },
  { id: 3, text: 'Clean room', done: false }
]);

// Simple iteration
todos.forEach(todo => {
  console.log(todo.text);
});
// Output:
// "Buy milk"
// "Walk dog"
// "Clean room"

// With index
todos.forEach((todo, index) => {
  console.log(`${index + 1}. ${todo.text}`);
});
// Output:
// "1. Buy milk"
// "2. Walk dog"
// "3. Clean room"

// Render to DOM
todos.forEach(todo => {
  const div = document.createElement('div');
  div.className = todo.done ? 'done' : 'pending';
  div.textContent = todo.text;
  document.getElementById('todo-list').appendChild(div);
});

// Returns collection for chaining ✨
todos
  .forEach(t => console.log(t.text))
  .add({ id: 4, text: 'New task', done: false });
```

**What just happened?** You iterated over collection items with a clean, chainable API!

 

## What is `collection.forEach(fn)`?

`forEach(fn)` is a method that **executes a function for each item** in a reactive collection.

Simply put: it's the standard array forEach, but on a collection with method chaining support.

Think of it as **visiting each item in a box** - you get to do something with each one.

 

## Syntax

```javascript
collection.forEach(fn)
```

**Parameters:**
- `fn` (Function) - Callback executed for each item: `(item, index, array) => void`
  - `item` - Current item
  - `index` - Current index (0-based)
  - `array` - The items array (reference to `collection.items`)

**Returns:** The collection itself (for chaining)

 

## Why Does This Exist?

### The Problem: Must Access items Array

Without `forEach()`, you must use the items array directly:

```javascript
const todos = createCollection([...]);

// Must access .items
todos.items.forEach(todo => {
  console.log(todo.text);
});

// Can't chain with collection methods
todos.items.forEach(...);  // Returns undefined
todos.add(newItem);        // Separate line

// Breaking the collection abstraction
```

**What's the Real Issue?**

```
Need to iterate
        |
        v
Access .items array
        |
        v
Use array.forEach()
        |
        v
Can't chain ❌
```

**Problems:**
❌ **Break abstraction** - Must use `.items`  
❌ **No chaining** - forEach returns undefined  
❌ **Inconsistent API** - Mix collection and array methods  

### The Solution with `forEach()`

```javascript
const todos = createCollection([...]);

// Direct collection API
todos.forEach(todo => {
  console.log(todo.text);
});

// Method chaining works
todos
  .forEach(t => console.log(t.text))
  .add(newItem)
  .forEach(t => updateUI(t));

// Consistent collection API ✅
```

**What Just Happened?**

```
Call forEach(fn)
        |
        v
Iterate items internally
        |
        v
Call fn for each item
        |
        v
Return collection
        |
        v
Can chain more ✅
```

**Benefits:**
✅ **Clean API** - No `.items` needed  
✅ **Chainable** - Returns collection  
✅ **Consistent** - Part of collection API  
✅ **Familiar** - Works like Array.forEach()  

 

## Mental Model

Think of `forEach()` as **processing each item on a conveyor belt**:

```
Collection Items         Process Each        Return Collection
┌──────────────┐        ┌──────────────┐    ┌──────────────┐
│ [Item 1] ────┼───────→│ fn(item1)    │    │              │
│ [Item 2] ────┼───────→│ fn(item2)    │───→│ Collection   │
│ [Item 3] ────┼───────→│ fn(item3)    │    │ (chainable)  │
└──────────────┘        └──────────────┘    └──────────────┘
```

**Key Insight:** Processes all items, returns collection for chaining.

 

## How It Works

The complete flow:

```
todos.forEach(fn)
        |
        ▼
Loop through items array
        |
        ▼
For each item:
  Call fn(item, index, items)
        |
        ▼
All items processed
        |
        ▼
return this (for chaining)
```

### Implementation

```javascript
// From 03_dh-reactive-collections.js
forEach(fn) {
  this.items.forEach(fn);
  return this;
}
```

Simple wrapper:
- Calls native array forEach on items
- Passes function directly
- Returns collection for chaining

 

## Basic Usage

### Example 1: Simple Logging

```javascript
const numbers = createCollection([1, 2, 3, 4, 5]);

numbers.forEach(num => {
  console.log(num);
});

// Output:
// 1
// 2
// 3
// 4
// 5
```

 

### Example 2: With Index

```javascript
const fruits = createCollection(['apple', 'banana', 'orange']);

fruits.forEach((fruit, index) => {
  console.log(`${index}: ${fruit}`);
});

// Output:
// "0: apple"
// "1: banana"
// "2: orange"
```

 

### Example 3: DOM Manipulation

```javascript
const items = createCollection([
  { name: 'Item 1', price: 10 },
  { name: 'Item 2', price: 20 },
  { name: 'Item 3', price: 15 }
]);

const container = document.getElementById('items');

items.forEach(item => {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${item.name}</strong>: $${item.price}`;
  container.appendChild(div);
});
```

 

### Example 4: Method Chaining

```javascript
const tasks = createCollection([
  { text: 'Task 1', done: false },
  { text: 'Task 2', done: true }
]);

tasks
  .forEach(t => console.log('Processing:', t.text))
  .add({ text: 'Task 3', done: false })
  .forEach(t => console.log('After add:', t.text));

// All operations chained ✅
```

 

## Real-World Examples

### Example 1: Send Notifications

```javascript
const users = createCollection([
  { id: 1, email: 'alice@example.com', name: 'Alice' },
  { id: 2, email: 'bob@example.com', name: 'Bob' },
  { id: 3, email: 'charlie@example.com', name: 'Charlie' }
]);

function sendWelcomeEmails() {
  users.forEach(user => {
    sendEmail({
      to: user.email,
      subject: 'Welcome!',
      body: `Hello ${user.name}, welcome to our platform!`
    });
    
    console.log(`Email sent to ${user.name}`);
  });
}

sendWelcomeEmails();
```

 

### Example 2: Validate Form Fields

```javascript
const formFields = createCollection([
  { name: 'email', value: 'test@example.com', required: true },
  { name: 'password', value: '', required: true },
  { name: 'newsletter', value: true, required: false }
]);

let isValid = true;

formFields.forEach(field => {
  if (field.required && !field.value) {
    console.error(`Field "${field.name}" is required`);
    isValid = false;
  }
});

console.log('Form valid:', isValid);
```

 

### Example 3: Update Prices

```javascript
const products = createCollection([
  { id: 1, name: 'Widget', price: 10 },
  { id: 2, name: 'Gadget', price: 20 },
  { id: 3, name: 'Tool', price: 15 }
]);

// Apply 10% discount
products.forEach(product => {
  product.price = product.price * 0.9;
});

console.log('Discounts applied');
```

 

### Example 4: Build HTML List

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy groceries', done: false },
  { id: 2, text: 'Call mom', done: true },
  { id: 3, text: 'Finish report', done: false }
]);

const list = document.getElementById('todo-list');
list.innerHTML = ''; // Clear existing

todos.forEach((todo, index) => {
  const li = document.createElement('li');
  li.className = todo.done ? 'completed' : 'pending';
  li.innerHTML = `
    <input type="checkbox" 
           ${todo.done ? 'checked' : ''} 
           onchange="toggleTodo(${todo.id})">
    <span>${todo.text}</span>
  `;
  list.appendChild(li);
});
```

 

### Example 5: Calculate Statistics

```javascript
const scores = createCollection([85, 92, 78, 95, 88, 91]);

let sum = 0;
let min = Infinity;
let max = -Infinity;

scores.forEach(score => {
  sum += score;
  min = Math.min(min, score);
  max = Math.max(max, score);
});

const average = sum / scores.length;

console.log('Average:', average);  // 88.17
console.log('Min:', min);          // 78
console.log('Max:', max);          // 95
```

 

### Example 6: Save to LocalStorage

```javascript
const settings = createCollection([
  { key: 'theme', value: 'dark' },
  { key: 'language', value: 'en' },
  { key: 'notifications', value: true }
]);

// Save all settings
settings.forEach(setting => {
  localStorage.setItem(setting.key, JSON.stringify(setting.value));
});

console.log('Settings saved to localStorage');
```

 

### Example 7: Render Table Rows

```javascript
const employees = createCollection([
  { id: 1, name: 'Alice', department: 'Engineering', salary: 90000 },
  { id: 2, name: 'Bob', department: 'Marketing', salary: 75000 },
  { id: 3, name: 'Charlie', department: 'Sales', salary: 80000 }
]);

const tbody = document.querySelector('#employees tbody');
tbody.innerHTML = '';

employees.forEach((emp, index) => {
  const tr = document.createElement('tr');
  tr.className = index % 2 === 0 ? 'even' : 'odd';
  tr.innerHTML = `
    <td>${emp.name}</td>
    <td>${emp.department}</td>
    <td>$${emp.salary.toLocaleString()}</td>
  `;
  tbody.appendChild(tr);
});
```

 

### Example 8: Log Activity

```javascript
const activities = createCollection([
  { user: 'Alice', action: 'login', timestamp: Date.now() - 3600000 },
  { user: 'Bob', action: 'purchase', timestamp: Date.now() - 1800000 },
  { user: 'Charlie', action: 'logout', timestamp: Date.now() - 900000 }
]);

// Log each activity
activities.forEach((activity, index) => {
  const time = new Date(activity.timestamp).toLocaleTimeString();
  console.log(`[${index + 1}] ${time} - ${activity.user}: ${activity.action}`);
});

// Output:
// "[1] 10:30:00 AM - Alice: login"
// "[2] 11:00:00 AM - Bob: purchase"
// "[3] 11:45:00 AM - Charlie: logout"
```

 

### Example 9: Attach Event Listeners

```javascript
const buttons = createCollection([
  { id: 'btn-save', action: 'save' },
  { id: 'btn-cancel', action: 'cancel' },
  { id: 'btn-delete', action: 'delete' }
]);

buttons.forEach(btn => {
  const element = document.getElementById(btn.id);
  
  if (element) {
    element.addEventListener('click', () => {
      console.log(`Action: ${btn.action}`);
      handleAction(btn.action);
    });
  }
});
```

 

### Example 10: Copy Items to Another Collection

```javascript
const sourceItems = createCollection([1, 2, 3, 4, 5]);
const targetItems = createCollection([]);

sourceItems.forEach(item => {
  targetItems.add(item * 2);  // Double and add
});

console.log(targetItems.items);  // [2, 4, 6, 8, 10]
```

 

## Common Patterns

### Pattern 1: Accumulate Values

```javascript
let total = 0;

prices.forEach(price => {
  total += price;
});

console.log('Total:', total);
```

 

### Pattern 2: Filter and Process

```javascript
todos.forEach(todo => {
  if (!todo.done) {
    console.log('Pending:', todo.text);
    sendReminder(todo);
  }
});
```

 

### Pattern 3: Build Data Structure

```javascript
const byCategory = {};

products.forEach(product => {
  if (!byCategory[product.category]) {
    byCategory[product.category] = [];
  }
  byCategory[product.category].push(product);
});
```

 

### Pattern 4: Chain with Other Methods

```javascript
collection
  .add(newItem)
  .forEach(item => console.log(item))
  .remove(item => item.invalid)
  .forEach(item => validate(item));
```

 

## Important Notes

### 1. Returns Collection, Not Undefined

```javascript
// Standard array forEach returns undefined
const result1 = [1, 2, 3].forEach(x => console.log(x));
console.log(result1);  // undefined

// Collection forEach returns collection
const result2 = collection.forEach(x => console.log(x));
console.log(result2 === collection);  // true ✅
```

 

### 2. Can Modify Items Directly

```javascript
const items = createCollection([
  { value: 1 },
  { value: 2 },
  { value: 3 }
]);

// Modify items in place
items.forEach(item => {
  item.value *= 2;
});

console.log(items.items);
// [{ value: 2 }, { value: 4 }, { value: 6 }]
```

 

### 3. Has Access to Index and Array

```javascript
collection.forEach((item, index, array) => {
  console.log('Item:', item);
  console.log('Index:', index);
  console.log('Total items:', array.length);
});
```

 

### 4. Cannot Break or Return Early

```javascript
// ❌ Cannot break from forEach
items.forEach(item => {
  if (item.value > 5) {
    break;  // Syntax error!
  }
});

// ✅ Use find() or some() for early exit
const found = items.find(item => item.value > 5);
```

 

## When to Use

### Use `forEach()` For:

✅ **Side effects** - DOM updates, logging, I/O  
✅ **Processing each item** - Validation, transformation  
✅ **Building HTML** - Create elements  
✅ **Method chaining** - Part of fluent API  
✅ **Simple iteration** - When map isn't needed  

### Don't Use For:

❌ **Transforming to new array** - Use `map()` instead  
❌ **Filtering items** - Use `filter()` instead  
❌ **Early exit needed** - Use `find()` or `some()`  
❌ **Async operations** - Use `for...of` with await  

 

## Comparison with map()

```javascript
const numbers = createCollection([1, 2, 3]);

// forEach - side effects, returns collection
numbers.forEach(n => console.log(n));
// Logs: 1, 2, 3
// Returns: collection

// map - transformation, returns new array
const doubled = numbers.map(n => n * 2);
// Returns: [2, 4, 6]
```

**Use `forEach()` when:** You need side effects, not a new array  
**Use `map()` when:** You need to transform items to a new array  

 

## Performance

`forEach()` is efficient for iteration:

```javascript
// O(n) time complexity - processes each item once
collection.forEach(item => {
  processItem(item);  // O(1) per item
});

// Total: O(n)
```

 

## Summary

**What is `collection.forEach(fn)`?**  
A method that executes a function for each item in a collection.

**Why use it?**
- ✅ Clean collection API
- ✅ Method chaining support
- ✅ Side effects and processing
- ✅ Familiar array-like syntax
- ✅ Access to index and array

**Key Takeaway:**

```
Array forEach           Collection forEach
      |                        |
Returns undefined       Returns collection
      |                        |
Can't chain            Chainable ✅
```

**One-Line Rule:** Use `forEach()` to process each item with side effects while maintaining chainability.

**Best Practices:**
- Use for side effects, not transformations
- Use `map()` if you need a new array
- Don't try to break or return early
- Modify items directly if needed
- Chain with other collection methods

**Remember:** `forEach()` processes items and returns the collection for chaining! 🎉