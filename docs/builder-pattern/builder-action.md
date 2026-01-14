# Understanding `builder.action(name, fn)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to add methods that modify state? Use `builder.action()`:

```js
// Create a reactive builder and add actions
const counter = reactive({ count: 0, step: 1 })
  .action('increment', (state) => {
    state.count += state.step;
  })
  .action('decrement', (state) => {
    state.count -= state.step;
  })
  .action('reset', (state) => {
    state.count = 0;
  })
  .build();

// Call actions to modify state
counter.increment();
console.log(counter.count); // 1

counter.increment();
console.log(counter.count); // 2

counter.decrement();
console.log(counter.count); // 1

counter.reset();
console.log(counter.count); // 0
```

**That's it!** `builder.action()` adds a named method to your reactive object and returns the builder for chaining!

 

## What is `builder.action()`?

`builder.action()` is a **builder method** that adds **named methods** (actions) to your reactive state. Actions are functions that can modify state, perform operations, and optionally return values.

**An action:**
- Is a named method on the final built object
- Receives the state as its first parameter
- Can accept additional parameters
- Can modify state safely
- Can return values
- Appears as a regular method on the built object

Think of it as **adding behavior to your reactive object** - you define what the action does once, and it becomes a reusable method on your state.

 

## Syntax

```js
// Add a single action to a builder
builder.action(name, function)

// Full example
reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++;
  })
  .build()
```

**Parameters:**
- `name` - String name for the action (becomes a method name)
- `function` - Function that receives:
  - `state` - The reactive state (first parameter)
  - Additional parameters as needed

**Returns:**
- The builder (for method chaining)

**Important:**
- Action name must be a valid JavaScript identifier
- First parameter is always `state`
- Can use arrow functions or regular functions
- The builder is returned, so you can chain more methods
- Action becomes a method on the built object

 

## Why Does This Exist?

### The Problem with External Functions

Let's say you want to modify state through reusable functions:

```javascript
// Create reactive state
const app = state({ count: 0 });

// External function to increment
function increment(stateObj) {
  stateObj.count++;
}

// External function to decrement
function decrement(stateObj) {
  stateObj.count--;
}

// Use them
increment(app);
console.log(app.count); // 1

decrement(app);
console.log(app.count); // 0
```

This works, but has several challenges:

**What's the Real Issue?**

```
External Functions Pattern:
┌─────────────────┐
│ State           │
│  count: 0       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ External Funcs  │
│ increment(app)  │ ← Must pass state
│ decrement(app)  │ ← Repetitive
│ reset(app)      │ ← Not attached
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Call functions  │
│ increment(app)  │ ← Verbose
│ decrement(app)  │ ← Must remember
└─────────────────┘
    Scattered logic!
    Not object-oriented!
```

**Problems:**
❌ Functions separated from state
❌ Must pass state to every function
❌ Verbose function calls
❌ Not object-oriented
❌ Hard to discover available operations
❌ Functions can be called on wrong object

### The Solution with `builder.action()`

When you use `builder.action()`, actions become methods on your object:

```javascript
// Create builder with actions
const counter = reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++;
  })
  .action('decrement', (state) => {
    state.count--;
  })
  .action('reset', (state) => {
    state.count = 0;
  })
  .build();

// Use them as methods
counter.increment();
console.log(counter.count); // 1

counter.decrement();
console.log(counter.count); // 0

counter.reset();
console.log(counter.count); // 0
```

**What Just Happened?**

```
Action Pattern:
┌─────────────────────┐
│ State + Actions     │
│  count: 0           │
│  increment()        │ ← Method
│  decrement()        │ ← Method
│  reset()            │ ← Method
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Call as methods     │
│  counter.increment()│ ← Clean!
│  counter.decrement()│ ← Discoverable!
│  counter.reset()    │ ← Object-oriented!
└─────────────────────┘
    Clean API!
    Easy to use!
```

With `builder.action()`:
- Actions attached to state
- Clean method calls
- No need to pass state
- Object-oriented API
- Easy to discover
- State and behavior together

**Benefits:**
✅ Actions as methods on the object
✅ Clean, object-oriented API
✅ State automatically available
✅ Easy to discover available operations
✅ Chainable with other builder methods
✅ Encapsulates behavior with data

 

## Mental Model

Think of `builder.action()` like **adding buttons to a device**:

```
External Functions (Remote Control):
┌─────────────────┐
│   TV            │
│   (State)       │
│   volume: 50    │
└─────────────────┘
        ↑
        │
┌─────────────────┐
│  Remote Control │
│  (Functions)    │
│                 │
│  volumeUp(tv)   │ ← Must specify TV
│  volumeDown(tv) │ ← Separate device
└─────────────────┘
    Need remote!
    Can use on wrong TV!

Built-In Buttons (Actions):
┌─────────────────┐
│   TV            │
│   volume: 50    │
│                 │
│   [Volume +]    │ ← Built-in button
│   [Volume -]    │ ← Built-in button
│   [Power]       │ ← Built-in button
└─────────────────┘
    No remote needed!
    Buttons always work!
    Can't use on wrong TV!
```

**Key Insight:** Just like built-in buttons on a device are always there and always work with that specific device, actions are built-in methods that are always available and always work with that specific state!

 

## How Does It Work?

### The Magic: Methods Added to State

When you call `builder.action()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

// What actually happens (simplified):
// 1. Builder receives action name and function
builder.action('increment', (state) => {
  state.count++;
});

// 2. Add method to the state object
state.increment = function(...args) {
  // Call the action function with state as first parameter
  return actionFunction(state, ...args);
};

// 3. Method is now available on state
// 4. When you call counter.increment():
//    - Calls the action function
//    - Passes state as first parameter
//    - Passes any additional arguments

// 5. Return builder for chaining
return builder;
```

**In other words:** `builder.action()`:
1. Takes a name and function
2. Creates a method on the state object
3. Method calls your function with state as first parameter
4. Any additional arguments are passed through
5. Returns the builder for chaining

### Under the Hood

```
.action('increment', (state) => { state.count++; })
        │
        ▼
┌───────────────────────┐
│  Receive Name + Func  │
│  'increment'          │
│  (state) => {...}     │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Create Method        │
│  state.increment()    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Method Wrapper       │
│  Calls func(state)    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return Builder       │
│  (for chaining)       │
└───────────────────────┘
```

**What happens when you call the action:**

1️⃣ You **call** the method: `counter.increment()`
2️⃣ Method **wrapper** receives the call
3️⃣ Wrapper **calls** your function with `state` as first parameter
4️⃣ Your function **modifies** state as needed
5️⃣ Any **return value** is passed back to caller

 

## Basic Usage

### Adding a Single Action

The simplest way to use `builder.action()`:

```js
// Create builder with one action
const counter = reactive({ count: 0 });

counter.action('increment', (state) => {
  state.count++;
});

const built = counter.build();

built.increment();
console.log(built.count); // 1

built.increment();
console.log(built.count); // 2
```

### Adding Multiple Actions

Add multiple actions by chaining:

```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++;
  })
  .action('decrement', (state) => {
    state.count--;
  })
  .action('reset', (state) => {
    state.count = 0;
  })
  .build();

counter.increment();
console.log(counter.count); // 1

counter.reset();
console.log(counter.count); // 0
```

### Actions That Modify Multiple Properties

```js
const user = reactive({ name: '', email: '', lastUpdate: null })
  .action('updateProfile', (state, name, email) => {
    state.name = name;
    state.email = email;
    state.lastUpdate = new Date();
  })
  .build();

user.updateProfile('John Doe', 'john@example.com');
console.log(user.name);       // "John Doe"
console.log(user.email);      // "john@example.com"
console.log(user.lastUpdate); // Date object
```

 

## Actions with Parameters

### Single Parameter

```js
const counter = reactive({ count: 0 })
  .action('add', (state, amount) => {
    state.count += amount;
  })
  .build();

counter.add(5);
console.log(counter.count); // 5

counter.add(3);
console.log(counter.count); // 8
```

### Multiple Parameters

```js
const calculator = reactive({ result: 0 })
  .action('calculate', (state, a, b, operation) => {
    switch (operation) {
      case 'add':
        state.result = a + b;
        break;
      case 'multiply':
        state.result = a * b;
        break;
      default:
        state.result = 0;
    }
  })
  .build();

calculator.calculate(5, 3, 'add');
console.log(calculator.result); // 8

calculator.calculate(5, 3, 'multiply');
console.log(calculator.result); // 15
```

### Object Parameters

```js
const user = reactive({ name: '', age: 0, email: '' })
  .action('update', (state, userData) => {
    Object.assign(state, userData);
  })
  .build();

user.update({
  name: 'John',
  age: 25,
  email: 'john@example.com'
});

console.log(user.name);  // "John"
console.log(user.age);   // 25
console.log(user.email); // "john@example.com"
```

### Rest Parameters

```js
const list = reactive({ items: [] })
  .action('addItems', (state, ...newItems) => {
    state.items.push(...newItems);
  })
  .build();

list.addItems('Apple', 'Banana', 'Cherry');
console.log(list.items); // ['Apple', 'Banana', 'Cherry']
```

 

## Actions with Return Values

### Returning Computed Values

```js
const calculator = reactive({ a: 5, b: 3 })
  .action('sum', (state) => {
    return state.a + state.b;
  })
  .action('product', (state) => {
    return state.a * state.b;
  })
  .build();

const sum = calculator.sum();
console.log(sum); // 8

const product = calculator.product();
console.log(product); // 15
```

### Returning Success/Failure

```js
const form = reactive({ username: '', password: '' })
  .action('validate', (state) => {
    if (state.username.length < 3) {
      return { valid: false, error: 'Username too short' };
    }
    if (state.password.length < 8) {
      return { valid: false, error: 'Password too short' };
    }
    return { valid: true };
  })
  .build();

form.username = 'jo';
const result = form.validate();
console.log(result); // { valid: false, error: 'Username too short' }
```

### Returning Modified Data

```js
const cart = reactive({ items: [], discount: 0.1 })
  .action('calculateTotal', (state) => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price, 0);
    const discount = subtotal * state.discount;
    const total = subtotal - discount;

    return {
      subtotal,
      discount,
      total
    };
  })
  .build();

cart.items = [
  { name: 'Item 1', price: 10 },
  { name: 'Item 2', price: 20 }
];

const totals = cart.calculateTotal();
console.log(totals);
// { subtotal: 30, discount: 3, total: 27 }
```

 

## Chaining with Other Methods

### Combining with Computed

```js
const counter = reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

console.log(counter.doubled); // 0
counter.increment();
console.log(counter.doubled); // 2
```

### Combining with Watch

```js
const app = reactive({ count: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

app.increment();
// Logs: "Count: 0 → 1"
```

### Combining with Effects

```js
const app = reactive({ count: 0 })
  .effect(() => {
    console.log('Count is:', app.state.count);
  })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

// Logs: "Count is: 0"

app.increment();
// Logs: "Count is: 1"
```

### Full Chain Example

```js
const counter = reactive({ count: 0, history: [] })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .watch({
    count(newVal) {
      this.state.history.push(newVal);
    }
  })
  .effect(() => {
    document.getElementById('count').textContent = counter.state.count;
  })
  .action('increment', (state) => {
    state.count++;
  })
  .action('decrement', (state) => {
    state.count--;
  })
  .action('reset', (state) => {
    state.count = 0;
    state.history = [];
  })
  .build();

counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2
console.log(counter.history); // [1]
```

 

## builder.action() vs builder.actions()

Both add actions, but differ in how you define them:

### When to Use `builder.action()`

Use `builder.action()` when adding **one action at a time**:

✅ Adding actions incrementally
✅ Conditional action addition
✅ Clear, linear flow
✅ Prefer separate calls

```js
const obj = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .action('decrement', (state) => state.count--)
  .build();
```

### When to Use `builder.actions()`

Use `builder.actions()` when adding **multiple actions at once**:

✅ Multiple actions together
✅ Grouping related actions
✅ More concise for many actions
✅ Prefer object syntax

```js
const obj = reactive({ count: 0 })
  .actions({
    increment(state) { state.count++; },
    decrement(state) { state.count--; },
    reset(state) { state.count = 0; }
  })
  .build();
```

### Quick Comparison

```javascript
// ✅ builder.action() - One at a time
const obj1 = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .action('decrement', (state) => state.count--)
  .action('reset', (state) => state.count = 0)
  .build();

// ✅ builder.actions() - Multiple at once
const obj2 = reactive({ count: 0 })
  .actions({
    increment(state) { state.count++; },
    decrement(state) { state.count--; },
    reset(state) { state.count = 0; }
  })
  .build();
```

**Simple Rule:**
- **Adding one action?** Use `action()`
- **Adding multiple actions?** Consider `actions()`
- **Both produce the same result** - choose based on preference

 

## Common Patterns

### Pattern: CRUD Operations

```js
const users = reactive({ list: [], currentUser: null })
  .action('create', (state, user) => {
    state.list.push({ ...user, id: Date.now() });
  })
  .action('read', (state, id) => {
    return state.list.find(u => u.id === id);
  })
  .action('update', (state, id, updates) => {
    const user = state.list.find(u => u.id === id);
    if (user) Object.assign(user, updates);
  })
  .action('delete', (state, id) => {
    state.list = state.list.filter(u => u.id !== id);
  })
  .build();

users.create({ name: 'John', email: 'john@example.com' });
const user = users.read(users.list[0].id);
users.update(user.id, { name: 'Jane' });
users.delete(user.id);
```

### Pattern: Toggle Actions

```js
const app = reactive({ isOpen: false, isDark: false })
  .action('toggle', (state, property) => {
    state[property] = !state[property];
  })
  .action('toggleOpen', (state) => {
    state.isOpen = !state.isOpen;
  })
  .action('toggleDark', (state) => {
    state.isDark = !state.isDark;
  })
  .build();

app.toggleOpen();
console.log(app.isOpen); // true

app.toggle('isDark');
console.log(app.isDark); // true
```

### Pattern: Validation with Actions

```js
const form = reactive({ email: '', password: '', errors: {} })
  .action('validateEmail', (state) => {
    if (!state.email.includes('@')) {
      state.errors.email = 'Invalid email';
      return false;
    }
    delete state.errors.email;
    return true;
  })
  .action('validatePassword', (state) => {
    if (state.password.length < 8) {
      state.errors.password = 'Password too short';
      return false;
    }
    delete state.errors.password;
    return true;
  })
  .action('validate', (state) => {
    const emailValid = form.validateEmail();
    const passwordValid = form.validatePassword();
    return emailValid && passwordValid;
  })
  .build();

form.email = 'invalid';
form.password = '123';
const isValid = form.validate();
console.log(isValid); // false
console.log(form.errors); // { email: '...', password: '...' }
```

### Pattern: Async Actions

```js
const app = reactive({ data: null, loading: false, error: null })
  .action('fetchData', async (state, url) => {
    state.loading = true;
    state.error = null;

    try {
      const response = await fetch(url);
      const data = await response.json();
      state.data = data;
    } catch (err) {
      state.error = err.message;
    } finally {
      state.loading = false;
    }
  })
  .build();

await app.fetchData('/api/data');
console.log(app.data);
console.log(app.loading); // false
```

### Pattern: Undo/Redo

```js
const editor = reactive({ content: '', history: [], historyIndex: -1 })
  .action('edit', (state, newContent) => {
    state.content = newContent;
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(newContent);
    state.historyIndex++;
  })
  .action('undo', (state) => {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      state.content = state.history[state.historyIndex];
    }
  })
  .action('redo', (state) => {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      state.content = state.history[state.historyIndex];
    }
  })
  .build();

editor.edit('Hello');
editor.edit('Hello World');
editor.undo();
console.log(editor.content); // "Hello"
editor.redo();
console.log(editor.content); // "Hello World"
```

 

## Common Pitfalls

### Pitfall #1: Forgetting the state Parameter

❌ **Wrong:**
```js
reactive({ count: 0 })
  .action('increment', () => {
    this.count++; // 'this' is not the state!
  })
  .build();
```

✅ **Correct:**
```js
reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++; // Use state parameter!
  })
  .build();
```

 

### Pitfall #2: Action Name Conflicts

❌ **Wrong:**
```js
reactive({ count: 0 })
  .action('count', (state) => { // 'count' already exists!
    return state.count;
  })
  .build();
```

This overwrites the `count` property with a method.

✅ **Correct:**
```js
reactive({ count: 0 })
  .action('getCount', (state) => { // Use different name
    return state.count;
  })
  .build();
```

 

### Pitfall #3: Modifying State Outside Action

⚠️ **Not Wrong, But Less Clear:**
```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .build();

// Modifying directly instead of using action
counter.count = 5; // Works, but bypasses action
```

✅ **Better Practice:**
```js
const counter = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .action('setCount', (state, value) => state.count = value)
  .build();

// Use action for modifications
counter.setCount(5); // Clear intent
```

 

### Pitfall #4: Not Returning Values When Needed

❌ **Wrong:**
```js
const calculator = reactive({ a: 5, b: 3 })
  .action('sum', (state) => {
    state.a + state.b; // No return!
  })
  .build();

const result = calculator.sum();
console.log(result); // undefined
```

✅ **Correct:**
```js
const calculator = reactive({ a: 5, b: 3 })
  .action('sum', (state) => {
    return state.a + state.b; // Return the result!
  })
  .build();

const result = calculator.sum();
console.log(result); // 8
```

 

### Pitfall #5: Expecting this to be State

❌ **Wrong:**
```js
reactive({ count: 0 })
  .action('increment', function() {
    this.count++; // 'this' is NOT the state!
  })
  .build();
```

Even with a regular function, `this` is not automatically bound to state.

✅ **Correct:**
```js
reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++; // Use state parameter
  })
  .build();
```

 

## Summary

**What is `builder.action()`?**

`builder.action()` is a **builder method** that adds named methods (actions) to your reactive state. Actions can modify state, accept parameters, and return values.

 

**Why use `builder.action()`?**

- Encapsulate behavior with data
- Clean, object-oriented API
- Actions as methods on the object
- State automatically available
- Chainable with other builder methods

 

**Key Points to Remember:**

1️⃣ **Name + Function** - Provide action name and function
2️⃣ **State parameter** - First parameter is always `state`
3️⃣ **Additional parameters** - Can accept any number of parameters
4️⃣ **Can return values** - Actions can return computed results
5️⃣ **Returns builder** - Chain with other methods

 

**Mental Model:** Think of `builder.action()` as **adding buttons to a device** - the buttons are built-in, always available, and always work with that specific device!

 

**Quick Reference:**

```js
// SINGLE ACTION
reactive({ count: 0 })
  .action('increment', (state) => {
    state.count++;
  })
  .build();

// WITH PARAMETERS
reactive({ count: 0 })
  .action('add', (state, amount) => {
    state.count += amount;
  })
  .build();

// WITH RETURN VALUE
reactive({ a: 5, b: 3 })
  .action('sum', (state) => {
    return state.a + state.b;
  })
  .build();

// MULTIPLE ACTIONS
reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .action('decrement', (state) => state.count--)
  .action('reset', (state) => state.count = 0)
  .build();

// CHAIN WITH OTHER METHODS
reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .watch({ count(n) { console.log(n); } })
  .action('increment', (state) => state.count++)
  .build();

// USING THE ACTION
const counter = /* ... */.build();
counter.increment();
counter.add(5);
const sum = counter.sum();
```

 

**Remember:** `builder.action()` lets you add behavior to your reactive state as clean, reusable methods. Define once, use everywhere, with state automatically available!
