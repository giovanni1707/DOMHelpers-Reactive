# `patchArray(state, key)` - Manually Patch Array Property

## Quick Start (30 seconds)

```javascript
// Create reactive state with array
const state = ReactiveUtils.state({
  items: [1, 2, 3],
  name: 'My State'
});

// Array methods don't trigger reactivity by default!
state.items.push(4);  // ❌ No reactivity

// Manually patch the array
patchArray(state, 'items');

// Now array methods ARE reactive! ✨
state.items.push(5);  // ✓ Triggers reactivity
state.items.pop();    // ✓ Triggers reactivity
state.items.sort();   // ✓ Triggers reactivity

// Track changes reactively
effect(() => {
  console.log('Items:', state.items);
  console.log('Count:', state.items.length);
});

state.items.push(6);  // Effect runs!
```

**What just happened?** You made array methods reactive by manually patching them!

 

## What is `patchArray(state, key)`?

`patchArray()` is a **utility function** that makes array mutation methods reactive on a specific state property.

Simply put: it patches array methods (push, pop, etc.) to trigger reactivity.

Think of it as **upgrading array methods** - they become reactive-aware.

 

## Syntax

```javascript
patchArray(state, key)
```

**Available as:**
- `patchArray(state, key)` - Global function
- `ReactiveUtils.patchArray(state, key)` - Namespace method
- `patchReactiveArray(state, key)` - Legacy alias

**Parameters:**
- `state` (Object) - The reactive state object
- `key` (String) - The property name containing the array

**Returns:** `undefined` (patches in place)

 

## Why Does This Exist?

### The Problem: Array Methods Don't Trigger Reactivity

Without patching, array mutations are invisible to the reactive system:

```javascript
const state = ReactiveUtils.state({
  items: [1, 2, 3]
});

effect(() => {
  console.log('Items:', state.items);
});
// Logs: "Items: [1, 2, 3]"

state.items.push(4);  // ❌ Effect doesn't run!
// No log - reactivity not triggered
```

**What's the Real Issue?**

```
Array mutation (push, pop, etc.)
        |
        v
Mutates array in place
        |
        v
Proxy doesn't see the change
        |
        v
No reactivity triggered ❌
```

**Problems:**
❌ **Silent mutations** - Changes don't trigger effects  
❌ **Broken reactivity** - UI won't update  
❌ **Confusing** - Works sometimes, not others  

### The Solution with `patchArray()`

```javascript
const state = ReactiveUtils.state({
  items: [1, 2, 3]
});

// Patch the array
patchArray(state, 'items');

effect(() => {
  console.log('Items:', state.items);
});
// Logs: "Items: [1, 2, 3]"

state.items.push(4);  // ✓ Effect runs!
// Logs: "Items: [1, 2, 3, 4]"
```

**What Just Happened?**

```
Call patchArray(state, 'items')
        |
        v
Override array methods (push, pop, etc.)
        |
        v
Methods now trigger reactivity
        |
        v
Reassign array after mutation
        |
        v
Reactivity works! ✅
```

**Benefits:**
✅ **Array methods reactive** - push, pop work  
✅ **Automatic updates** - Effects run  
✅ **UI synced** - Changes reflected  
✅ **Natural syntax** - Use normal array methods  

 

## Mental Model

Think of `patchArray()` as **installing reactive upgrades**:

```
Before Patching              After Patching
┌─────────────────┐         ┌─────────────────┐
│ Array Methods   │         │ Array Methods   │
│ push()   ────── │         │ push()   ────── │─→ Triggers
│ pop()    ────── │         │ pop()    ────── │─→ Reactivity
│ splice() ────── │         │ splice() ────── │─→ Updates
└─────────────────┘         └─────────────────┘
   (silent)                    (reactive)
```

**Key Insight:** Patches array methods to trigger reactivity on mutation.

 

## How It Works

### Internal Mechanism

```javascript
// From 02_dh-reactive-array-patch.js
function patchArray(state, key) {
  const arr = state[key];
  
  // Override mutation methods
  ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
    arr[method] = function(...args) {
      // Call original method
      const result = Array.prototype[method].apply(this, args);
      
      // Trigger reactivity by reassigning
      state[key] = [...this];
      
      return result;
    };
  });
}
```

**Key steps:**
1. Get the array from state
2. Override mutation methods
3. Call original method
4. Reassign array to trigger reactivity
5. Return original result

 

## Basic Usage

### Example 1: Simple Array Patching

```javascript
const state = ReactiveUtils.state({
  numbers: [1, 2, 3]
});

// Patch the array
patchArray(state, 'numbers');

// Now reactive
effect(() => {
  console.log('Numbers:', state.numbers);
});

state.numbers.push(4);  // Effect runs
state.numbers.pop();    // Effect runs
```

 

### Example 2: Todo List

```javascript
const state = ReactiveUtils.state({
  todos: []
});

patchArray(state, 'todos');

effect(() => {
  document.getElementById('count').textContent = 
    `${state.todos.length} todos`;
});

// Add todo - UI updates automatically
state.todos.push({ text: 'Buy milk', done: false });
```

 

### Example 3: Shopping Cart

```javascript
const cart = ReactiveUtils.state({
  items: []
});

patchArray(cart, 'items');

effect(() => {
  const total = cart.items.reduce((sum, item) => 
    sum + item.price * item.qty, 0
  );
  
  document.getElementById('total').textContent = 
    `$${total.toFixed(2)}`;
});

// Add to cart - total updates
cart.items.push({ name: 'Widget', price: 10, qty: 2 });
```

 

### Example 4: Multiple Arrays

```javascript
const state = ReactiveUtils.state({
  active: [],
  completed: []
});

// Patch both arrays
patchArray(state, 'active');
patchArray(state, 'completed');

// Both are now reactive
state.active.push({ task: 'Do laundry' });
state.completed.push({ task: 'Buy groceries' });
```

 

## Real-World Examples

### Example 1: Live Message Feed

```javascript
const chat = ReactiveUtils.state({
  messages: []
});

patchArray(chat, 'messages');

effect(() => {
  const container = document.getElementById('messages');
  container.innerHTML = chat.messages.map(msg => `
    <div class="message">
      <strong>${msg.user}:</strong> ${msg.text}
    </div>
  `).join('');
});

// Add message - UI updates
function addMessage(user, text) {
  chat.messages.push({ user, text, time: Date.now() });
}
```

 

### Example 2: Dynamic Form Fields

```javascript
const form = ReactiveUtils.state({
  fields: [
    { name: 'email', value: '' }
  ]
});

patchArray(form, 'fields');

effect(() => {
  renderFormFields(form.fields);
});

function addField(name) {
  form.fields.push({ name, value: '' });
  // Form re-renders automatically
}

function removeField(index) {
  form.fields.splice(index, 1);
  // Form re-renders automatically
}
```

 

### Example 3: Leaderboard

```javascript
const game = ReactiveUtils.state({
  scores: []
});

patchArray(game, 'scores');

effect(() => {
  const sorted = [...game.scores].sort((a, b) => b.score - a.score);
  displayLeaderboard(sorted);
});

function addScore(player, score) {
  game.scores.push({ player, score, timestamp: Date.now() });
}
```

 

### Example 4: Activity Log

```javascript
const app = ReactiveUtils.state({
  logs: []
});

patchArray(app, 'logs');

effect(() => {
  const logList = document.getElementById('activity-log');
  logList.innerHTML = app.logs.slice(-10).map(log => `
    <li>${log.time}: ${log.message}</li>
  `).join('');
});

function log(message) {
  app.logs.push({
    message,
    time: new Date().toLocaleTimeString()
  });
  
  // Keep only last 100
  if (app.logs.length > 100) {
    app.logs.shift();
  }
}
```

 

### Example 5: Notification Queue

```javascript
const notifications = ReactiveUtils.state({
  queue: []
});

patchArray(notifications, 'queue');

effect(() => {
  const container = document.getElementById('notifications');
  container.innerHTML = notifications.queue.map(n => `
    <div class="notification ${n.type}">
      ${n.message}
    </div>
  `).join('');
});

function notify(message, type = 'info') {
  notifications.queue.push({ message, type });
  
  setTimeout(() => {
    notifications.queue.shift();
  }, 3000);
}
```

 

## Important Notes

### 1. Patch After Creating State

```javascript
// ✓ Correct order
const state = ReactiveUtils.state({ items: [] });
patchArray(state, 'items');

// ❌ Wrong - no state yet
patchArray(state, 'items');
const state = ReactiveUtils.state({ items: [] });
```

 

### 2. Only Works on Arrays

```javascript
const state = ReactiveUtils.state({
  items: [],
  name: 'test'
});

patchArray(state, 'items');  // ✓ Works
patchArray(state, 'name');   // ❌ Not an array
```

 

### 3. Re-Patch If Array Replaced

```javascript
const state = ReactiveUtils.state({ items: [1, 2] });
patchArray(state, 'items');

// Replace array
state.items = [3, 4, 5];

// Need to re-patch!
patchArray(state, 'items');
```

 

### 4. Patches These Methods

```javascript
// Patched mutation methods:
- push()
- pop()
- shift()
- unshift()
- splice()
- sort()
- reverse()
- fill()
- copyWithin()

// Not patched (return new array):
- map()
- filter()
- slice()
- concat()
```

 

## When to Use

**Use `patchArray()` For:**
✅ Arrays in reactive state  
✅ Need push/pop to trigger reactivity  
✅ Dynamic lists  
✅ Real-time updates  
✅ Array mutations  

**Don't Use For:**
❌ Collections - Use `createCollection()` instead  
❌ Non-reactive state  
❌ Objects - Not needed  

 

## Alternative: Use Collections

For better array handling, consider using collections:

```javascript
// Instead of patching arrays
const state = ReactiveUtils.state({ items: [] });
patchArray(state, 'items');

// Use collections (reactive by default)
const items = createCollection([]);
items.add(item);  // Already reactive!
```

**Collections provide:**
- Built-in reactivity
- Rich API (add, remove, update, etc.)
- No patching needed

 

## Troubleshooting

### Problem: Effect Not Running

```javascript
// Did you forget to patch?
const state = ReactiveUtils.state({ items: [] });
// patchArray(state, 'items');  // ← Missing!

state.items.push(1);  // Won't trigger
```

**Solution:** Call `patchArray()` after creating state.

 

### Problem: Array Replaced

```javascript
patchArray(state, 'items');
state.items = newArray;  // Replaces patched array!
```

**Solution:** Re-patch after replacement or use `state.items.length = 0; newArray.forEach(...)`.

 

## Summary

**What is `patchArray(state, key)`?**  
A utility that makes array mutation methods reactive.

**Why use it?**
- ✅ Array methods trigger reactivity
- ✅ push, pop, splice work
- ✅ UI updates automatically
- ✅ Natural array syntax

**Key Takeaway:**

```
Without Patching         With Patching
      |                       |
Silent mutations        Reactive mutations
      |                       |
No effects run         Effects run ✓
      |                       |
UI stale ❌           UI synced ✅
```

**One-Line Rule:** Use `patchArray()` to make array methods reactive on state properties.

**Best Practices:**
- Patch immediately after creating state
- Only for arrays in reactive state
- Consider collections for better API
- Re-patch if array replaced
- Patches mutation methods only

**Remember:** `patchArray()` makes your array methods reactive! 🎉