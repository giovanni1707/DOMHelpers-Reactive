# Understanding `array.unshift()` in Reactive Arrays - A Beginner's Guide

## Quick Start (30 seconds)

Need to add items to the beginning of a reactive array? Just use `unshift()`:

```js
const app = state({
  notifications: ['Notification 2', 'Notification 3']
});

// Set up a watcher
effect(() => {
  console.log('Notifications:', app.notifications.join(', '));
});
// Logs: "Notifications: Notification 2, Notification 3"

// Add new notification to beginning
app.notifications.unshift('Notification 1');
// Logs: "Notifications: Notification 1, Notification 2, Notification 3"

// Add multiple to beginning
app.notifications.unshift('Alert!', 'Important!');
// Logs: "Notifications: Alert!, Important!, Notification 1, Notification 2, Notification 3"
```

**That's it!** `unshift()` adds items to the beginning of reactive arrays and automatically triggers updates!

 

## What is Reactive `unshift()`?

The reactive `unshift()` method is **an enhanced version of the standard array `unshift()` method** that **automatically triggers reactive updates** when items are added to the beginning of an array.

**This method:**
- Adds one or more items to the beginning of an array
- Returns the new length of the array
- Automatically triggers reactive effects, watchers, and bindings
- Works exactly like standard `Array.prototype.unshift()`
- Is available on all reactive array properties

Think of it as **`unshift()` with superpowers** - it does everything the normal `unshift()` does, but also notifies your reactive system that the array changed.

 

## Syntax

```js
// Add single item to beginning
array.unshift(item)

// Add multiple items to beginning
array.unshift(item1, item2, item3)

// Returns new length
const newLength = array.unshift(item)

// Full examples
const app = state({
  items: ['C', 'D']
});

app.items.unshift('B');           // Returns 3, array is ['B', 'C', 'D']
app.items.unshift('A');           // Returns 4, array is ['A', 'B', 'C', 'D']
```

**Parameters:**
- `...items` - One or more items to add to the beginning of the array

**Returns:**
- `number` - The new length of the array

 

## Why Does This Exist?

### The Real Issue

In standard JavaScript, array mutation methods don't notify anyone when they change the array:

```js
const items = ['B', 'C'];

items.unshift('A'); // Array changed, but no one knows!
// UI doesn't update, effects don't run
```

### What's the Real Issue?

```
STANDARD ARRAY MUTATION (No Reactivity):
┌─────────────────────────────────────────────────┐
│                                                 │
│  items = ['B', 'C']                            │
│      ↓                                          │
│  items.unshift('A')  ← Mutation happens        │
│      ↓                                          │
│  items = ['A', 'B', 'C']                       │
│                                                 │
│  ❌ Effects don't run                          │
│  ❌ Watchers don't trigger                     │
│  ❌ UI doesn't update                          │
│                                                 │
└─────────────────────────────────────────────────┘

REACTIVE ARRAY MUTATION (With Reactivity):
┌─────────────────────────────────────────────────┐
│                                                 │
│  items = ['B', 'C']  (reactive)                │
│      ↓                                          │
│  items.unshift('A')  ← Patched method          │
│      ↓                                          │
│  [Reactive system notified!]                    │
│      ↓                                          │
│  ✅ Effects re-run automatically               │
│  ✅ Watchers triggered                         │
│  ✅ UI updates automatically                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### The Solution

The Reactive system **patches the `unshift()` method** on reactive arrays so that:

1. The normal `unshift()` behavior happens (items added to beginning)
2. The reactive system is notified of the change
3. All effects, watchers, and bindings automatically update

You use `unshift()` exactly as you normally would - the reactivity happens automatically!

 

## Mental Model

Think of reactive `unshift()` like **adding urgent emails to the top of your inbox with automatic updates**:

**Standard Array (Manual Process):**
```
Urgent email arrives
→ Email added to top of inbox
→ You manually update the count
→ You manually refresh the display
→ You manually mark as unread
```

**Reactive Array (Automatic Process):**
```
Urgent email arrives
→ Email added to top of inbox
→ Count updates automatically
→ Display refreshes automatically
→ Unread badge updates automatically
→ Notifications sent automatically
```

The reactive `unshift()` handles all the "notification work" for you - you just add items to the beginning and everything else updates automatically!

 

## How Does It Work?

Under the hood, reactive `unshift()` works by **wrapping the native array method**:

```js
// Simplified implementation
function patchUnshift(array, state, key) {
  const originalUnshift = Array.prototype.unshift;
  
  array.unshift = function(...items) {
    // 1. Call the original unshift method
    const result = originalUnshift.apply(this, items);
    
    // 2. Notify the reactive system
    const updatedArray = [...this];
    state[key] = updatedArray; // Triggers reactivity!
    
    // 3. Return the new length (like normal unshift)
    return result;
  };
}
```

**The process:**

1. **You call `unshift()`** on a reactive array
2. **Original behavior happens** - Items added to beginning
3. **Reactive notification** - System detects the change
4. **Effects re-run** - Anything watching the array updates
5. **Returns new length** - Just like standard `unshift()`

All of this happens automatically when you use reactive arrays created with `state()`, `reactive()`, or after calling `ReactiveUtils.patchArray()`.

 

## Basic Usage

### Adding Single Items to Beginning

```js
const app = state({
  messages: ['Old message']
});

// Add new messages to beginning
app.messages.unshift('New message');
app.messages.unshift('Newest message');

console.log(app.messages);
// ['Newest message', 'New message', 'Old message']
```

### Adding Multiple Items

```js
const app = state({
  items: ['C', 'D']
});

// Add multiple items at once to beginning
app.items.unshift('A', 'B');

console.log(app.items);
// ['A', 'B', 'C', 'D']
```

### Using Return Value

```js
const app = state({
  items: ['C', 'D']
});

const newLength = app.items.unshift('A', 'B');
console.log(newLength);  // 4
console.log(app.items);  // ['A', 'B', 'C', 'D']
```

### With Effects

```js
const app = state({
  notifications: []
});

effect(() => {
  const first = app.notifications[0];
  if (first) {
    console.log('Latest notification:', first);
  } else {
    console.log('No notifications');
  }
});
// Logs: "No notifications"

app.notifications.unshift('Welcome!');
// Logs: "Latest notification: Welcome!"

app.notifications.unshift('New message received');
// Logs: "Latest notification: New message received"
```

 

## Advanced Usage

### Priority Notification System

```js
const notifications = state({
  list: []
});

function notify(message, priority = 'normal') {
  const notification = {
    id: Date.now(),
    message,
    priority,
    timestamp: new Date()
  };
  
  if (priority === 'high') {
    // High priority goes to beginning
    notifications.list.unshift(notification);
  } else {
    // Normal priority goes to end
    notifications.list.push(notification);
  }
}

effect(() => {
  const notifDiv = document.querySelector('#notifications');
  notifDiv.innerHTML = notifications.list
    .map(n => `<div class="${n.priority}">${n.message}</div>`)
    .join('');
});

notify('System updated', 'normal');
notify('Critical error!', 'high'); // Shows first
notify('Low disk space', 'high');  // Shows first
```

### Activity Feed (Newest First)

```js
const feed = state({
  activities: []
});

function logActivity(user, action) {
  // New activities appear at top
  feed.activities.unshift({
    user,
    action,
    timestamp: Date.now()
  });
  
  // Keep only last 100 activities
  if (feed.activities.length > 100) {
    feed.activities.pop(); // Remove oldest
  }
}

effect(() => {
  console.log('Latest activity:', feed.activities[0]);
});

logActivity('Alice', 'logged in');
logActivity('Bob', 'posted a comment');
logActivity('Charlie', 'liked a post');
// Latest activities appear first
```

### Prepending API Results

```js
const data = state({
  items: []
});

async function loadNewerItems() {
  const response = await fetch('/api/items/newer');
  const newItems = await response.json();
  
  // Add new items to beginning
  newItems.reverse().forEach(item => {
    data.items.unshift(item);
  });
  // Or use spread:
  // data.items.unshift(...newItems.reverse());
}

effect(() => {
  console.log(`Showing ${data.items.length} items`);
  console.log('First item:', data.items[0]);
});
```

### Undo/Redo Stack

```js
const editor = state({
  undoStack: [],
  redoStack: []
});

function performAction(action) {
  // Add to undo stack at beginning
  editor.undoStack.unshift(action);
  
  // Clear redo stack
  editor.redoStack = [];
  
  // Limit undo history
  if (editor.undoStack.length > 50) {
    editor.undoStack.pop();
  }
}

function undo() {
  if (editor.undoStack.length === 0) return;
  
  const action = editor.undoStack.shift();
  editor.redoStack.unshift(action);
  
  // Revert the action
  revertAction(action);
}

function redo() {
  if (editor.redoStack.length === 0) return;
  
  const action = editor.redoStack.shift();
  editor.undoStack.unshift(action);
  
  // Reapply the action
  applyAction(action);
}

effect(() => {
  console.log(`Undo: ${editor.undoStack.length}`);
  console.log(`Redo: ${editor.redoStack.length}`);
});
```

 

## Common Patterns

### 1. Adding Items to Beginning

```js
const app = state({
  items: []
});

function prependItem(item) {
  app.items.unshift(item);
}

prependItem('Third');
prependItem('Second');
prependItem('First');
// Array is now: ['First', 'Second', 'Third']
```

### 2. Recent Items First

```js
const history = state({
  recent: []
});

function addToHistory(item) {
  // Remove if already exists
  const index = history.recent.indexOf(item);
  if (index !== -1) {
    history.recent.splice(index, 1);
  }
  
  // Add to beginning
  history.recent.unshift(item);
  
  // Keep only 10 most recent
  if (history.recent.length > 10) {
    history.recent.pop();
  }
}

effect(() => {
  console.log('Most recent:', history.recent[0]);
});
```

### 3. Priority Queue

```js
const queue = state({
  items: []
});

function addItem(item, priority = false) {
  if (priority) {
    queue.items.unshift(item);  // High priority to front
  } else {
    queue.items.push(item);     // Normal to back
  }
}

addItem('Normal task 1');
addItem('Urgent task!', true);  // Goes to front
addItem('Normal task 2');

console.log(queue.items);
// ['Urgent task!', 'Normal task 1', 'Normal task 2']
```

### 4. Breadcrumb Navigation

```js
const navigation = state({
  breadcrumbs: ['Home']
});

function navigate(page) {
  navigation.breadcrumbs.push(page);
}

function navigateBack() {
  if (navigation.breadcrumbs.length > 1) {
    navigation.breadcrumbs.pop();
  }
}

effect(() => {
  document.querySelector('#breadcrumbs').textContent = 
    navigation.breadcrumbs.join(' > ');
});

navigate('Products');
navigate('Product Details');
// Home > Products > Product Details
```

### 5. Chat Messages (Newest First)

```js
const chat = state({
  messages: []
});

function receiveMessage(message) {
  // New messages at top
  chat.messages.unshift({
    text: message,
    timestamp: Date.now(),
    read: false
  });
}

effect(() => {
  const unread = chat.messages.filter(m => !m.read).length;
  console.log(`${unread} unread messages`);
});
```

 

## Common Pitfalls

### ❌ Pitfall 1: Performance with Large Arrays

```js
const app = state({
  items: Array(100000).fill().map((_, i) => i)
});

// ❌ unshift() is O(n) - re-indexes entire array!
app.items.unshift('New item');
```

**✅ Solution: Use push() if order doesn't matter or track index**
```js
// Option 1: Add to end instead (O(1))
app.items.push('New item');

// Option 2: Reverse the display logic
const app = state({
  items: []
});

// Add to end (fast)
app.items.push('Item 1');
app.items.push('Item 2');

// Display in reverse
const reversed = computed(() => [...app.items].reverse());
```

### ❌ Pitfall 2: Order of Multiple Items

```js
const app = state({
  items: ['C']
});

// ❌ Items appear in reverse order
app.items.unshift('A');
app.items.unshift('B');
console.log(app.items); // ['B', 'A', 'C']
```

**✅ Solution: unshift all at once or push in reverse**
```js
const app = state({
  items: ['C']
});

// Add both at once
app.items.unshift('A', 'B');
console.log(app.items); // ['A', 'B', 'C']
```

### ❌ Pitfall 3: Forgetting Return Value

```js
const app = state({
  items: ['B', 'C']
});

app.items.unshift('A');
// How many items now?
```

**✅ Solution: Use return value when needed**
```js
const app = state({
  items: ['B', 'C']
});

const newLength = app.items.unshift('A');
console.log(`Array now has ${newLength} items`); // 3
```

### ❌ Pitfall 4: Arrays Need Patching After Assignment

```js
const app = state({
  items: ['B', 'C']
});

// Replace with new array
app.items = ['Y', 'Z'];

// ❌ Won't trigger reactivity!
app.items.unshift('X');
```

**✅ Solution: Patch after assignment**
```js
const app = state({
  items: ['B', 'C']
});

// Replace with new array
app.items = ['Y', 'Z'];

// Patch the array
ReactiveUtils.patchArray(app, 'items');

// ✅ Now triggers reactivity!
app.items.unshift('X');
```

### ❌ Pitfall 5: Unshifting Reactive Objects

```js
const item = state({ name: 'Test' });

// ❌ Unshifting the proxy itself
app.items.unshift(item);
```

**✅ Solution: Unshift plain objects or use toRaw**
```js
// Option 1: Unshift plain object
app.items.unshift({ name: 'Test' });

// Option 2: Use toRaw if you have a reactive object
const item = state({ name: 'Test' });
app.items.unshift(toRaw(item));
```

 

## Summary

### Key Takeaways

1. **Reactive `unshift()` adds items to the beginning** of arrays and triggers updates automatically
2. **Returns the new length** of the array
3. **Works exactly like standard `unshift()`** - same syntax, same return value
4. **O(n) complexity** - slower than `push()` for large arrays (re-indexes everything)
5. **Perfect for priority items** or newest-first displays

### When to Use `unshift()`

- ✅ Adding priority items to queues
- ✅ Newest-first activity feeds
- ✅ Recent items lists
- ✅ Notification systems
- ✅ Prepending data from API

### Quick Reference

```js
// Basic usage
app.items.unshift('New item')

// Multiple items
app.items.unshift('A', 'B', 'C')

// With return value
const length = app.items.unshift('Item')

// Priority pattern
if (priority) {
  app.items.unshift(item)  // Add to beginning
} else {
  app.items.push(item)      // Add to end
}

// With effects
effect(() => {
  console.log('Latest:', app.items[0])
})
app.items.unshift('Newest') // Triggers effect

// After array replacement
app.items = ['X', 'Y', 'Z']
ReactiveUtils.patchArray(app, 'items')
app.items.unshift('W') // Now reactive
```

**Remember:** Reactive `unshift()` is just normal `unshift()` with automatic reactivity - use it naturally and your UI stays in sync! 🎯
