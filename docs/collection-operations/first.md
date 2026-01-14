# `collection.first` - Get First Item

## Quick Start (30 seconds)

```javascript
const todos = createCollection([
  { id: 1, text: 'Buy milk', priority: 'high' },
  { id: 2, text: 'Walk dog', priority: 'medium' },
  { id: 3, text: 'Clean room', priority: 'low' }
]);

// Get first item
const first = todos.first;
console.log(first);
// { id: 1, text: 'Buy milk', priority: 'high' }

console.log(first.text);  // "Buy milk"

// Check if exists
if (todos.first) {
  console.log('First todo:', todos.first.text);
}

// Empty collection
const empty = createCollection([]);
console.log(empty.first);  // undefined

// Reactive updates
effect(() => {
  const firstItem = todos.first;
  if (firstItem) {
    document.getElementById('top-priority').textContent = firstItem.text;
  }
});
// Updates when first item changes ✨
```

**What just happened?** You accessed the first item with a clean getter property!

 

## What is `collection.first`?

`first` is a **getter property** that returns the first item in the collection, or `undefined` if empty.

Simply put: it gives you the item at position 0.

Think of it as **peeking at the top card in a deck** - you see what's first without removing it.

 

## Syntax

```javascript
collection.first
```

**Type:** Getter property (read-only)

**Returns:** 
- First item in collection
- `undefined` if collection is empty

 

## Why Does This Exist?

### The Problem: Array Access Syntax

Without `first`, you need array access:

```javascript
const todos = createCollection([...]);

// Array bracket notation
const first = todos.items[0];

// Breaking collection abstraction
```

**Problems:**
❌ **Break abstraction** - Must use `.items`  
❌ **Not semantic** - `[0]` doesn't express intent  

### The Solution with `first`

```javascript
const todos = createCollection([...]);

// Semantic property
const first = todos.first;

// Clear intent ✅
```

**Benefits:**
✅ **Semantic** - Name expresses intent  
✅ **Clean API** - No `.items` or `[0]`  
✅ **Safe** - Returns undefined if empty  

 

## Mental Model

Think of `first` as **the front of a queue**:

```
Collection Items         First
┌──────────────┐        ┌──────────────┐
│ [Item 1] ←───┼───────→│ Item 1       │
│ [Item 2]     │        │ (first)      │
│ [Item 3]     │        └──────────────┘
│ [Item 4]     │
└──────────────┘
```

**Key Insight:** Always the item at index 0, or undefined.

 

## How It Works

```javascript
// From 03_dh-reactive-collections.js
get first() {
  return this.items[0];
}
```

Simple getter:
- Returns items[0]
- Undefined if empty
- Read-only property

 

## Basic Usage

### Example 1: Access First Item

```javascript
const numbers = createCollection([10, 20, 30]);

console.log(numbers.first);  // 10
```

 

### Example 2: Check Before Using

```javascript
const items = createCollection([]);

if (items.first) {
  console.log('First:', items.first);
} else {
  console.log('Collection is empty');
}
```

 

### Example 3: Get First Property

```javascript
const users = createCollection([
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
]);

console.log(users.first?.name);  // "Alice"

// Safe even if empty
const empty = createCollection([]);
console.log(empty.first?.name);  // undefined
```

 

## Real-World Examples

### Example 1: Display Top Item

```javascript
const leaderboard = createCollection([
  { player: 'Alice', score: 1500 },
  { player: 'Bob', score: 1200 },
  { player: 'Charlie', score: 1000 }
]);

effect(() => {
  const leader = leaderboard.first;
  if (leader) {
    document.getElementById('leader').textContent = 
      `🏆 ${leader.player} - ${leader.score} points`;
  }
});
```

 

### Example 2: Queue Management

```javascript
const queue = createCollection([]);

function addToQueue(person) {
  queue.add(person);
  console.log(`Added ${person}. Next: ${queue.first}`);
}

function serveNext() {
  const person = queue.first;
  if (person) {
    queue.remove(person);
    console.log(`Serving: ${person}`);
  }
}
```

 

### Example 3: Latest Notification

```javascript
const notifications = createCollection([]);

function addNotification(message) {
  // Add to front
  notifications.items.unshift({ message, time: Date.now() });
}

effect(() => {
  const latest = notifications.first;
  if (latest) {
    showToast(latest.message);
  }
});
```

 

### Example 4: Current Task

```javascript
const taskQueue = createCollection([
  { task: 'Process data', status: 'pending' },
  { task: 'Send email', status: 'pending' }
]);

function getCurrentTask() {
  return taskQueue.first;
}

const current = getCurrentTask();
if (current) {
  console.log('Working on:', current.task);
}
```

 

### Example 5: First Available Slot

```javascript
const slots = createCollection([
  { time: '9:00 AM', available: false },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true }
]);

// Filter then get first
const available = createCollection(
  slots.items.filter(s => s.available)
);

console.log('First available:', available.first?.time);
// "10:00 AM"
```

 

## Important Notes

### 1. Returns undefined if Empty

```javascript
const items = createCollection([]);
console.log(items.first);  // undefined

// Always check
if (items.first) {
  console.log(items.first.name);
}
```

 

### 2. Read-Only Property

```javascript
const items = createCollection([1, 2, 3]);

// ❌ Cannot set first directly
items.first = 99;  // Won't work

// ✓ Modify collection
items.items[0] = 99;  // Works
```

 

### 3. Updates Automatically

```javascript
const items = createCollection([1, 2, 3]);

console.log(items.first);  // 1

items.items[0] = 99;
console.log(items.first);  // 99

items.remove(99);
console.log(items.first);  // 2 (now first)
```

 

## When to Use

**Use `first` For:**
✅ Get first item  
✅ Queue operations  
✅ Display top item  
✅ Check what's next  

**Don't Use For:**
❌ Modifying first item - Access items[0]  
❌ Removing first - Use remove() or shift()  

 

## Comparison with Alternatives

```javascript
const items = createCollection([10, 20, 30]);

// collection.first
items.first;  // 10

// collection.at(0)
items.at(0);  // 10

// collection.items[0]
items.items[0];  // 10
```

**Best:** Use `first` for semantic clarity.

 

## Summary

**What is `collection.first`?**  
A getter property that returns the first item or undefined.

**Why use it?**
- ✅ Semantic clarity
- ✅ Clean API
- ✅ Safe (undefined if empty)
- ✅ Familiar syntax

**Remember:** `first` is a cleaner way to access items[0]! 🎉