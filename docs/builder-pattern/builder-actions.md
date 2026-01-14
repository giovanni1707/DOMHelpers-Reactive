# Understanding `builder.actions(defs)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to add multiple methods at once? Use `builder.actions()`:

```js
// Create a reactive builder and add multiple actions
const counter = reactive({ count: 0, step: 1 })
  .actions({
    increment(state) {
      state.count += state.step;
    },
    decrement(state) {
      state.count -= state.step;
    },
    reset(state) {
      state.count = 0;
    },
    add(state, amount) {
      state.count += amount;
    }
  })
  .build();

// Call actions to modify state
counter.increment();
console.log(counter.count); // 1

counter.add(5);
console.log(counter.count); // 6

counter.reset();
console.log(counter.count); // 0
```

**That's it!** `builder.actions()` adds multiple named methods to your reactive object in one call and returns the builder for chaining!

 

## What is `builder.actions()`?

`builder.actions()` is a **builder method** that adds **multiple named methods** (actions) to your reactive state at once. It's a convenient way to define several actions together using an object.

**This method:**
- Accepts an object of action definitions
- Each key becomes a method name
- Each value is the action function
- All actions receive state as first parameter
- Can accept additional parameters
- Can return values

Think of it as **batch-adding behavior** to your reactive object - you define all your actions in one place, and they all become methods on your state.

 

## Syntax

```js
// Add multiple actions to a builder
builder.actions(definitions)

// Full example
reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    }
  })
  .build()
```

**Parameters:**
- `definitions` - An object where:
  - **Keys** are action names (become method names)
  - **Values** are functions that receive:
    - `state` - The reactive state (first parameter)
    - Additional parameters as needed

**Returns:**
- The builder (for method chaining)

**Important:**
- All action names must be valid JavaScript identifiers
- First parameter is always `state` for each action
- Can use arrow functions or regular functions
- The builder is returned, so you can chain more methods
- Actions become methods on the built object

 

## Why Does This Exist?

### The Problem with Individual Action Calls

Let's say you want to add several actions using `builder.action()`:

```javascript
// Adding actions one by one
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
  .action('add', (state, amount) => {
    state.count += amount;
  })
  .action('subtract', (state, amount) => {
    state.count -= amount;
  })
  .build();
```

This works, but can be verbose for many actions:

**What's the Real Issue?**

```
Multiple .action() Calls:
┌─────────────────────┐
│ .action('inc', fn)  │ ← Repetitive
│ .action('dec', fn)  │ ← Repetitive
│ .action('reset', fn)│ ← Repetitive
│ .action('add', fn)  │ ← Repetitive
│ .action('sub', fn)  │ ← Repetitive
└─────────────────────┘
    Lots of .action()!
    Verbose!
    Scattered!
```

**Problems:**
❌ Repetitive `.action()` calls
❌ Verbose for many actions
❌ Actions scattered across multiple lines
❌ Hard to see all actions at a glance
❌ More typing required

### The Solution with `builder.actions()`

When you use `builder.actions()`, you define all actions in one object:

```javascript
// Adding actions all at once
const counter = reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    },
    add(state, amount) {
      state.count += amount;
    },
    subtract(state, amount) {
      state.count -= amount;
    }
  })
  .build();
```

**What Just Happened?**

```
Single .actions() Call:
┌─────────────────────┐
│ .actions({          │
│   inc(state) {...}, │ ← All together
│   dec(state) {...}, │ ← Clear grouping
│   reset(state){...},│ ← Easy to see
│   add(state, n){...}│ ← Less repetition
│ })                  │
└─────────────────────┘
    One call!
    Concise!
    Grouped!
```

With `builder.actions()`:
- All actions in one place
- Less repetitive syntax
- Clear grouping of related actions
- Easy to see all available actions
- More concise code
- Same functionality as multiple `.action()` calls

**Benefits:**
✅ Add multiple actions at once
✅ Less repetitive syntax
✅ Clear grouping in one object
✅ Easy to see all actions
✅ Chainable with other builder methods
✅ More concise for many actions

 

## Mental Model

Think of `builder.actions()` like **a control panel with all buttons at once**:

```
Individual Buttons (One at a time):
┌─────────────────┐
│  Add Button 1   │ ← Install
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Add Button 2   │ ← Install
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Add Button 3   │ ← Install
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Add Button 4   │ ← Install
└─────────────────┘
    One at a time!
    Repetitive!

Complete Control Panel (All at once):
┌─────────────────────┐
│  Control Panel      │
│  ┌──────────────┐   │
│  │ [Button 1]   │   │
│  │ [Button 2]   │   │ ← Install all
│  │ [Button 3]   │   │   at once!
│  │ [Button 4]   │   │
│  └──────────────┘   │
└─────────────────────┘
    All together!
    Organized!
```

**Key Insight:** Just like installing a complete control panel with all buttons at once instead of adding buttons one by one, `builder.actions()` lets you add all your actions together in one organized object!

 

## How Does It Work?

### The Magic: Batch Method Addition

When you call `builder.actions()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    }
  })
  .build();

// What actually happens (simplified):
// 1. Builder receives actions object
builder.actions({
  increment(state) { state.count++; },
  decrement(state) { state.count--; }
});

// 2. For each key-value pair:
Object.entries(actionsObject).forEach(([name, fn]) => {
  // 3. Add method to state (same as builder.action())
  state[name] = function(...args) {
    return fn(state, ...args);
  };
});

// 4. All methods now available on state
// 5. Return builder for chaining
return builder;
```

**In other words:** `builder.actions()`:
1. Takes an object of action definitions
2. Loops through each key-value pair
3. For each pair, adds a method to state (like `builder.action()`)
4. All actions become methods on the built object
5. Returns the builder for chaining

### Under the Hood

```
.actions({ inc(state){...}, dec(state){...} })
        │
        ▼
┌───────────────────────┐
│  Receive Object       │
│  { inc: fn, dec: fn } │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Loop Through Entries │
│  ['inc', fn]          │
│  ['dec', fn]          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Create Methods       │
│  state.inc()          │
│  state.dec()          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Return Builder       │
│  (for chaining)       │
└───────────────────────┘
```

**What happens:**

1️⃣ You **pass** an object with action definitions
2️⃣ Builder **iterates** through each property
3️⃣ For each action, **creates a method** on state
4️⃣ **Same behavior** as calling `.action()` multiple times
5️⃣ Returns **builder** for further chaining

 

## Basic Usage

### Adding Multiple Actions

The simplest way to use `builder.actions()`:

```js
// Create builder with multiple actions
const counter = reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    }
  })
  .build();

counter.increment();
console.log(counter.count); // 1

counter.decrement();
console.log(counter.count); // 0

counter.reset();
console.log(counter.count); // 0
```

### Mixing with builder.action()

You can combine `builder.actions()` with individual `builder.action()` calls:

```js
const counter = reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    }
  })
  .action('double', (state) => {
    state.count *= 2;
  })
  .action('halve', (state) => {
    state.count = Math.floor(state.count / 2);
  })
  .build();

counter.increment();
counter.double();
console.log(counter.count); // 2
```

### Multiple builder.actions() Calls

You can call `builder.actions()` multiple times:

```js
const app = reactive({ count: 0, name: '' })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    }
  })
  .actions({
    setName(state, newName) {
      state.name = newName;
    },
    clearName(state) {
      state.name = '';
    }
  })
  .build();

app.increment();
app.setName('Counter');
console.log(app.count); // 1
console.log(app.name);  // "Counter"
```

 

## Actions with Parameters

### Single Parameter Actions

```js
const counter = reactive({ count: 0 })
  .actions({
    add(state, amount) {
      state.count += amount;
    },
    subtract(state, amount) {
      state.count -= amount;
    },
    multiply(state, factor) {
      state.count *= factor;
    }
  })
  .build();

counter.add(5);
console.log(counter.count); // 5

counter.multiply(2);
console.log(counter.count); // 10
```

### Multiple Parameter Actions

```js
const user = reactive({ firstName: '', lastName: '', age: 0 })
  .actions({
    setFullName(state, first, last) {
      state.firstName = first;
      state.lastName = last;
    },
    setProfile(state, first, last, age) {
      state.firstName = first;
      state.lastName = last;
      state.age = age;
    },
    update(state, updates) {
      Object.assign(state, updates);
    }
  })
  .build();

user.setFullName('John', 'Doe');
console.log(user.firstName); // "John"
console.log(user.lastName);  // "Doe"

user.setProfile('Jane', 'Smith', 25);
console.log(user.age); // 25
```

### Rest Parameters

```js
const list = reactive({ items: [] })
  .actions({
    addItems(state, ...newItems) {
      state.items.push(...newItems);
    },
    removeItems(state, ...itemsToRemove) {
      state.items = state.items.filter(
        item => !itemsToRemove.includes(item)
      );
    },
    setItems(state, ...items) {
      state.items = items;
    }
  })
  .build();

list.addItems('A', 'B', 'C');
console.log(list.items); // ['A', 'B', 'C']

list.removeItems('B');
console.log(list.items); // ['A', 'C']
```

 

## Actions with Return Values

### Returning Computed Values

```js
const calculator = reactive({ a: 5, b: 3 })
  .actions({
    sum(state) {
      return state.a + state.b;
    },
    product(state) {
      return state.a * state.b;
    },
    average(state) {
      return (state.a + state.b) / 2;
    }
  })
  .build();

console.log(calculator.sum());     // 8
console.log(calculator.product()); // 15
console.log(calculator.average()); // 4
```

### Returning Status Objects

```js
const form = reactive({ username: '', password: '', email: '' })
  .actions({
    validateUsername(state) {
      if (state.username.length < 3) {
        return { valid: false, error: 'Too short' };
      }
      return { valid: true };
    },
    validatePassword(state) {
      if (state.password.length < 8) {
        return { valid: false, error: 'Too short' };
      }
      return { valid: true };
    },
    validateAll(state) {
      const usernameResult = form.validateUsername();
      const passwordResult = form.validatePassword();

      return {
        valid: usernameResult.valid && passwordResult.valid,
        errors: {
          username: usernameResult.error,
          password: passwordResult.error
        }
      };
    }
  })
  .build();

form.username = 'jo';
form.password = '123';
const result = form.validateAll();
console.log(result.valid); // false
console.log(result.errors); // { username: 'Too short', password: 'Too short' }
```

### Returning Modified Data

```js
const cart = reactive({ items: [], tax: 0.1 })
  .actions({
    calculateSubtotal(state) {
      return state.items.reduce((sum, item) => sum + item.price, 0);
    },
    calculateTax(state) {
      return cart.calculateSubtotal() * state.tax;
    },
    calculateTotal(state) {
      return cart.calculateSubtotal() + cart.calculateTax();
    },
    getSummary(state) {
      return {
        subtotal: cart.calculateSubtotal(),
        tax: cart.calculateTax(),
        total: cart.calculateTotal()
      };
    }
  })
  .build();

cart.items = [
  { name: 'Item 1', price: 10 },
  { name: 'Item 2', price: 20 }
];

const summary = cart.getSummary();
console.log(summary);
// { subtotal: 30, tax: 3, total: 33 }
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
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    }
  })
  .build();

counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2
```

### Combining with Watch

```js
const app = reactive({ count: 0, changes: 0 })
  .watch({
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
      this.state.changes++;
    }
  })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    }
  })
  .build();

app.increment();
// Logs: "Count: 0 → 1"
console.log(app.changes); // 1
```

### Combining with Effects

```js
const app = reactive({ count: 0 })
  .effect(() => {
    console.log('Count is:', app.state.count);
  })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    }
  })
  .build();

// Logs: "Count is: 0"

app.increment();
// Logs: "Count is: 1"
```

### Full Chain Example

```js
const app = reactive({ count: 0, history: [] })
  .computed({
    doubled() {
      return this.state.count * 2;
    },
    historyLength() {
      return this.state.history.length;
    }
  })
  .watch({
    count(newVal) {
      this.state.history.push(newVal);
    }
  })
  .effect(() => {
    document.getElementById('count').textContent = app.state.count;
  })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
      state.history = [];
    },
    setCount(state, value) {
      state.count = value;
    }
  })
  .build();

app.increment();
console.log(app.count);         // 1
console.log(app.doubled);       // 2
console.log(app.historyLength); // 1
```

 

## builder.actions() vs builder.action()

Both add actions, but differ in syntax:

### When to Use `builder.actions()`

Use `builder.actions()` when adding **multiple actions together**:

✅ Multiple related actions
✅ Grouping actions by feature
✅ Prefer object syntax
✅ More concise for many actions

```js
const obj = reactive({ count: 0 })
  .actions({
    increment(state) { state.count++; },
    decrement(state) { state.count--; },
    reset(state) { state.count = 0; }
  })
  .build();
```

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
  .action('reset', (state) => state.count = 0)
  .build();
```

### Quick Comparison

```javascript
// ✅ builder.actions() - Object syntax
const obj1 = reactive({ count: 0 })
  .actions({
    increment(state) { state.count++; },
    decrement(state) { state.count--; },
    reset(state) { state.count = 0; }
  })
  .build();

// ✅ builder.action() - Separate calls
const obj2 = reactive({ count: 0 })
  .action('increment', (state) => state.count++)
  .action('decrement', (state) => state.count--)
  .action('reset', (state) => state.count = 0)
  .build();

// Both produce identical results!
```

**Simple Rule:**
- **Multiple actions?** `actions()` is more concise
- **One action?** `action()` is clearer
- **Mixed?** You can use both together
- **Both produce the same result** - choose based on preference

 

## Common Patterns

### Pattern: CRUD Operations

```js
const todos = reactive({ list: [] })
  .actions({
    create(state, todo) {
      state.list.push({ ...todo, id: Date.now() });
    },
    read(state, id) {
      return state.list.find(t => t.id === id);
    },
    update(state, id, updates) {
      const todo = state.list.find(t => t.id === id);
      if (todo) Object.assign(todo, updates);
    },
    delete(state, id) {
      state.list = state.list.filter(t => t.id !== id);
    },
    list(state) {
      return state.list;
    }
  })
  .build();

todos.create({ text: 'Learn Reactive', done: false });
const todo = todos.read(todos.list[0].id);
todos.update(todo.id, { done: true });
todos.delete(todo.id);
```

### Pattern: Form Actions

```js
const form = reactive({
  values: {},
  errors: {},
  touched: {},
  submitted: false
})
  .actions({
    setValue(state, field, value) {
      state.values[field] = value;
    },
    setError(state, field, error) {
      state.errors[field] = error;
    },
    touch(state, field) {
      state.touched[field] = true;
    },
    reset(state) {
      state.values = {};
      state.errors = {};
      state.touched = {};
      state.submitted = false;
    },
    submit(state) {
      state.submitted = true;
    }
  })
  .build();

form.setValue('email', 'test@example.com');
form.touch('email');
form.submit();
```

### Pattern: State Machine Actions

```js
const machine = reactive({ state: 'idle', data: null, error: null })
  .actions({
    startLoading(state) {
      state.state = 'loading';
      state.data = null;
      state.error = null;
    },
    loadSuccess(state, data) {
      state.state = 'success';
      state.data = data;
      state.error = null;
    },
    loadError(state, error) {
      state.state = 'error';
      state.data = null;
      state.error = error;
    },
    reset(state) {
      state.state = 'idle';
      state.data = null;
      state.error = null;
    }
  })
  .build();

machine.startLoading();
// ... fetch data ...
machine.loadSuccess({ items: [] });
```

### Pattern: Array Manipulation

```js
const list = reactive({ items: [] })
  .actions({
    push(state, item) {
      state.items.push(item);
    },
    pop(state) {
      return state.items.pop();
    },
    shift(state) {
      return state.items.shift();
    },
    unshift(state, item) {
      state.items.unshift(item);
    },
    remove(state, index) {
      state.items.splice(index, 1);
    },
    clear(state) {
      state.items = [];
    },
    filter(state, predicate) {
      state.items = state.items.filter(predicate);
    },
    map(state, mapper) {
      state.items = state.items.map(mapper);
    }
  })
  .build();

list.push('A');
list.push('B');
list.remove(0);
console.log(list.items); // ['B']
```

### Pattern: Async Operations

```js
const api = reactive({ data: null, loading: false, error: null })
  .actions({
    async fetch(state, url) {
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
    },
    async post(state, url, body) {
      state.loading = true;
      state.error = null;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        state.data = data;
      } catch (err) {
        state.error = err.message;
      } finally {
        state.loading = false;
      }
    },
    reset(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    }
  })
  .build();

await api.fetch('/api/data');
console.log(api.data);
```

 

## Common Pitfalls

### Pitfall #1: Forgetting state Parameter

❌ **Wrong:**
```js
reactive({ count: 0 })
  .actions({
    increment() {  // Missing state parameter!
      this.count++; // 'this' is not the state!
    }
  })
  .build();
```

✅ **Correct:**
```js
reactive({ count: 0 })
  .actions({
    increment(state) {  // Include state parameter!
      state.count++;
    }
  })
  .build();
```

 

### Pitfall #2: Action Name Conflicts

❌ **Wrong:**
```js
reactive({ count: 0 })
  .actions({
    count(state) {  // 'count' already exists as property!
      return state.count;
    }
  })
  .build();
```

This overwrites the `count` property.

✅ **Correct:**
```js
reactive({ count: 0 })
  .actions({
    getCount(state) {  // Use different name
      return state.count;
    }
  })
  .build();
```

 

### Pitfall #3: Using Arrow Functions with this

❌ **Wrong:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .actions({
    logDoubled: (state) => {
      console.log(this.state.doubled); // 'this' won't work in arrow function!
    }
  })
  .build();
```

✅ **Correct:**
```js
reactive({ count: 0 })
  .computed({
    doubled() {
      return this.state.count * 2;
    }
  })
  .actions({
    logDoubled(state) {  // Regular function
      // Access via the built object reference
      console.log(state.doubled);
    }
  })
  .build();
```

 

### Pitfall #4: Not Returning When Needed

❌ **Wrong:**
```js
reactive({ items: [] })
  .actions({
    getFirst(state) {
      state.items[0]; // No return!
    }
  })
  .build();

const first = obj.getFirst();
console.log(first); // undefined
```

✅ **Correct:**
```js
reactive({ items: [] })
  .actions({
    getFirst(state) {
      return state.items[0]; // Return the value!
    }
  })
  .build();

const first = obj.getFirst();
console.log(first); // Works!
```

 

### Pitfall #5: Duplicate Action Names

❌ **Wrong:**
```js
reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    }
  })
  .action('increment', (state) => {  // Duplicate name!
    state.count += 2;
  })
  .build();
```

The second `increment` overwrites the first.

✅ **Correct:**
```js
reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    incrementBy2(state) {  // Different name
      state.count += 2;
    }
  })
  .build();
```

 

## Summary

**What is `builder.actions()`?**

`builder.actions()` is a **builder method** that adds multiple named methods (actions) to your reactive state at once using an object.

 

**Why use `builder.actions()`?**

- Add multiple actions in one call
- Less repetitive syntax
- Clear grouping of related actions
- More concise for many actions
- Chainable with other builder methods

 

**Key Points to Remember:**

1️⃣ **Object of actions** - Pass an object with action definitions
2️⃣ **Keys are names** - Object keys become method names
3️⃣ **Values are functions** - Object values are action functions
4️⃣ **State parameter** - Each function receives `state` as first parameter
5️⃣ **Returns builder** - Chain with other methods

 

**Mental Model:** Think of `builder.actions()` as **installing a complete control panel** - all buttons added at once in one organized package!

 

**Quick Reference:**

```js
// MULTIPLE ACTIONS
reactive({ count: 0 })
  .actions({
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    }
  })
  .build();

// WITH PARAMETERS
reactive({ count: 0 })
  .actions({
    add(state, amount) {
      state.count += amount;
    },
    multiply(state, factor) {
      state.count *= factor;
    }
  })
  .build();

// WITH RETURN VALUES
reactive({ a: 5, b: 3 })
  .actions({
    sum(state) {
      return state.a + state.b;
    },
    product(state) {
      return state.a * state.b;
    }
  })
  .build();

// MIX WITH OTHER METHODS
reactive({ count: 0 })
  .computed({ doubled() { return this.state.count * 2; } })
  .watch({ count(n) { console.log(n); } })
  .actions({
    increment(state) { state.count++; },
    decrement(state) { state.count--; }
  })
  .build();

// USING THE ACTIONS
const counter = /* ... */.build();
counter.increment();
counter.add(5);
const sum = counter.sum();
```

 

**Remember:** `builder.actions()` lets you add multiple actions at once in a clean, organized way. It's the same as calling `builder.action()` multiple times, just more concise!
