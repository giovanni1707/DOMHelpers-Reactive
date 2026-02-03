# Getting Started: Super Simple Setup

## No Installation. No Build Tools. Just Script Tags.

Seriously, it's **that simple**. Add a few `<script>` tags to your HTML, and you're ready to build reactive applications.

**No npm. No webpack. No complexity.**

Just copy, paste, and start coding.

---

## The Full Stack (4 Script Tags)

Want everything? Here's the complete setup:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <div id="app">
    <h1 id="message">Hello World</h1>
    <button id="btn">Click Me</button>
  </div>

  <!-- Just 4 script tags - that's it! -->
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/03_dh-conditions.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

  <!-- Now write your app -->
  <script>
    const app = state({ message: 'Hello World' });
    
    effect(() => {
      Elements.message.textContent = app.message;
    });
    
    Elements.btn.addEventListener('click', () => {
      app.message = 'You clicked the button!';
    });
  </script>
</body>
</html>
```

**Copy this. Open it in a browser. It works.**

No installation. No configuration. No build step.

---

## What You Just Got

With those 4 script tags, you now have:

✅ **Clean DOM access** - `Elements.myElement` instead of `document.getElementById('myElement')`  
✅ **Bulk property updaters** - Update multiple elements at once  
✅ **Reactive state** - State changes = automatic UI updates  
✅ **Computed properties** - Derived values that auto-update  
✅ **Declarative conditions** - Show/hide based on state  
✅ **Collection shortcuts** - `ClassName.btn`, `TagName.div`  

**Everything you need to build modern web apps.**

---

## Mix and Match: Load Only What You Need

Here's the beauty: **you don't have to load everything**.

Each script is independent. Pick what you need.

### Option 1: Just DOM Helpers (No Reactivity)

Want cleaner DOM manipulation without reactive state? Load just the first two:

```html
<!-- Just DOM Helpers - No reactive state -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>

<script>
  // Clean DOM manipulation
  Elements.textContent({
    title: 'My App',
    subtitle: 'Welcome!',
    footer: '© 2024'
  });
  
  // Bulk updates
  ClassName.btn.update({
    textContent: ['Save', 'Cancel', 'Delete'],
    disabled: [false, false, true]
  });
</script>
```

**Perfect for:**
- Simple websites
- Progressive enhancement
- Projects that don't need reactive state

---

### Option 2: Core + Reactive (Skip Enhancers & Conditions)

Want reactive state with basic DOM manipulation? Load just Core and Reactive:

```html
<!-- Core + Reactive only -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

<script>
  const app = state({ count: 0 });
  
  effect(() => {
    Elements.counter.textContent = app.count;
  });
  
  Elements.btn.addEventListener('click', () => {
    app.count++;
  });
</script>
```

**Perfect for:**
- Lightweight reactive apps
- When you don't need bulk updaters or conditions
- Minimal bundle size

---

### Option 3: Core + Enhancers (No Reactivity, No Conditions)

Want bulk operations without reactive state?

```html
<!-- Core + Enhancers only -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>

<script>
  // Bulk property updater
  Elements.textContent({
    name: user.name,
    email: user.email,
    role: user.role
  });
  
  // Bulk event listeners
  Elements.addEventListener('click', {
    saveBtn: handleSave,
    cancelBtn: handleCancel
  });
</script>
```

**Perfect for:**
- Form-heavy sites
- When you want cleaner code but not reactive state
- Server-rendered apps with light JavaScript

---

### Option 4: Core + Conditions (Conditional Rendering Only)

Want declarative conditions without full reactivity?

```html
<!-- Core + Conditions only -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/03_dh-conditions.js"></script>

<script>
  let status = 'loading';
  
  // Static conditional rendering
  whenApply(
    () => status,
    {
      loading: { textContent: 'Loading...', classList: { add: 'loading' } },
      success: { textContent: 'Success!', classList: { add: 'success' } },
      error: { textContent: 'Error!', classList: { add: 'error' } }
    },
    '#statusMessage'
  );
  
  // Manually trigger re-render when status changes
  function updateStatus(newStatus) {
    status = newStatus;
    whenApply(/* ... call again ... */);
  }
</script>
```

**Perfect for:**
- Multi-state UIs
- When you want declarative logic without reactivity
- Simple state machines

---

### Option 5: The Full Stack (Everything)

Want the complete power? Load all four:

```html
<!-- Everything! -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/03_dh-conditions.js"></script>
<script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

<script>
  const app = state({ status: 'idle' });
  
  // Reactive + Declarative conditions
  whenState(
    () => app.status,
    {
      idle: { textContent: 'Ready' },
      loading: { textContent: 'Loading...' },
      success: { textContent: 'Done!' }
    },
    '#status'
  );
  
  // Change state → UI updates automatically
  app.status = 'loading';
</script>
```

**Perfect for:**
- Full-featured web apps
- Maximum productivity
- When you want all the power

---

## Quick Reference: What Each Script Gives You

| Script | Size* | What You Get | When to Use |
|--------|-------|--------------|-------------|
| **01_dh-core.js** | ~5KB | `Elements.id`, `ClassName.btn`, `querySelector()` | **Always** - Foundation for everything |
| **02_dh-enhancers.js** | ~3KB | `Elements.textContent()`, bulk updaters, shortcuts | When you want less repetition |
| **03_dh-conditions.js** | ~4KB | `whenState()`, declarative conditions | When you have conditional UI logic |
| **04_dh-reactive.js** | ~6KB | `state()`, `effect()`, `computed()`, `watch()` | When you want reactive state |

**Total:** ~18KB for everything (minified + gzipped)

*Approximate sizes - actual may vary

---

## Decision Guide: What Should You Load?

### "I want the easiest, most powerful setup"
→ **Load all 4 scripts** (The Full Stack)

### "I just want cleaner DOM manipulation"
→ **Load Core + Enhancers** (Scripts 1-2)

### "I want reactive state management"
→ **Load Core + Reactive** (Scripts 1 + 4)

### "I need conditional rendering without reactivity"
→ **Load Core + Enhancers + Conditions** (Scripts 1-3)

### "I'm not sure what I need"
→ **Load all 4 scripts** - You can always remove what you don't use later

---

## Real Examples: What You Can Build

### Example 1: Simple Form (Core + Enhancers)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Form</title>
</head>
<body>
  <h1>Contact Us</h1>
  
  <input id="name" placeholder="Name">
  <input id="email" placeholder="Email">
  <input id="message" placeholder="Message">
  <button id="submit">Send</button>

  <!-- Just 2 scripts needed -->
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>

  <script>
    const form = {};
    
    // Bulk event listeners
    Elements.addEventListener('input', {
      name: (e) => form.name = e.target.value,
      email: (e) => form.email = e.target.value,
      message: (e) => form.message = e.target.value
    });
    
    Elements.submit.addEventListener('click', () => {
      console.log('Form data:', form);
    });
  </script>
</body>
</html>
```

**2 scripts. Clean code. Done.**

---

### Example 2: Reactive Counter (Core + Reactive)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Counter</title>
  <style>
    #count { font-size: 3rem; }
  </style>
</head>
<body>
  <h1>Counter</h1>
  <div id="count">0</div>
  <button id="increment">+1</button>

  <!-- Just 2 scripts needed -->
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

  <script>
    const app = state({ count: 0 });
    
    effect(() => {
      Elements.count.textContent = app.count;
    });
    
    Elements.increment.addEventListener('click', () => {
      app.count++;
    });
  </script>
</body>
</html>
```

**2 scripts. Reactive. Automatic updates.**

---

### Example 3: Full Featured App (All 4)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo App</title>
</head>
<body>
  <h1>Todo List</h1>
  
  <input id="newTodo" placeholder="Add todo...">
  <button id="addBtn">Add</button>
  
  <div id="todoList"></div>
  <div id="stats"></div>

  <!-- All 4 scripts for full power -->
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/03_dh-conditions.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

  <script>
    const todos = state({ items: [] });
    
    computed(todos, {
      count: function() { return this.items.length; }
    });
    
    // Render list
    effect(() => {
      Elements.todoList.innerHTML = todos.items
        .map(item => `<div>${item.text}</div>`)
        .join('');
    });
    
    // Update stats
    effect(() => {
      Elements.stats.textContent = `${todos.count} items`;
    });
    
    // Add todo
    Elements.addBtn.addEventListener('click', () => {
      const text = Elements.newTodo.value;
      if (text) {
        todos.items.push({ text });
        Elements.newTodo.value = '';
      }
    });
  </script>
</body>
</html>
```

**4 scripts. Complete reactive todo app. ~60 lines total.**

---

## Loading Order Matters

When you load multiple scripts, **order matters**:

✅ **Correct order:**
```html
<script src=".../01_dh-core.js"></script>        <!-- First -->
<script src=".../02_dh-enhancers.js"></script>   <!-- Second -->
<script src=".../03_dh-conditions.js"></script>  <!-- Third -->
<script src=".../04_dh-reactive.js"></script>    <!-- Fourth -->
```

❌ **Wrong order:**
```html
<script src=".../04_dh-reactive.js"></script>    <!-- NO! -->
<script src=".../01_dh-core.js"></script>
```

**Why?** Each script builds on the previous ones. The numbers tell you the order.

**Easy rule:** Load scripts in numerical order (01, 02, 03, 04).

---

## Common Combinations

Here are the most common setups:

### Minimal (Core Only)
```html
<script src=".../01_dh-core.js"></script>
```
**Use for:** Basic element access, no frills

---

### Standard (Core + Enhancers)
```html
<script src=".../01_dh-core.js"></script>
<script src=".../02_dh-enhancers.js"></script>
```
**Use for:** Clean DOM manipulation, forms, bulk operations

---

### Reactive (Core + Reactive)
```html
<script src=".../01_dh-core.js"></script>
<script src=".../04_dh-reactive.js"></script>
```
**Use for:** Reactive apps without bulk updaters

---

### Full Power (All Four)
```html
<script src=".../01_dh-core.js"></script>
<script src=".../02_dh-enhancers.js"></script>
<script src=".../03_dh-conditions.js"></script>
<script src=".../04_dh-reactive.js"></script>
```
**Use for:** Complete feature set, maximum productivity

---

## Comparison: Before vs After

### Before (Plain JavaScript)

```html
<!DOCTYPE html>
<html>
<body>
  <div id="count">0</div>
  <button id="btn">+1</button>

  <script>
    let count = 0;
    
    function update() {
      document.getElementById('count').textContent = count;
    }
    
    document.getElementById('btn').addEventListener('click', function() {
      count++;
      update(); // Must manually call update!
    });
  </script>
</body>
</html>
```

**Issues:**
- Manual updates (`update()`)
- Repetitive `document.getElementById()`
- Easy to forget to update UI

---

### After (DOM Helpers + Reactive)

```html
<!DOCTYPE html>
<html>
<body>
  <div id="count">0</div>
  <button id="btn">+1</button>

  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

  <script>
    const app = state({ count: 0 });
    
    effect(() => {
      Elements.count.textContent = app.count;
    });
    
    Elements.btn.addEventListener('click', () => {
      app.count++; // UI updates automatically!
    });
  </script>
</body>
</html>
```

**Benefits:**
- ✅ Automatic updates
- ✅ Clean element access
- ✅ Impossible to forget UI updates

---

## That's It!

**Seriously, that's the entire setup.**

1. Add script tags from CDN
2. Write your app code
3. Open in browser

**No:**
- ❌ npm install
- ❌ webpack config
- ❌ build step
- ❌ transpiling
- ❌ bundling
- ❌ complicated setup

**Just:**
- ✅ Script tags
- ✅ Your code
- ✅ Done

---

## Quick Start Template

Copy this to get started right now:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
</head>
<body>
  <!-- Your HTML -->
  <div id="app">
    <h1 id="title">Hello</h1>
    <button id="btn">Click</button>
  </div>

  <!-- CDN Scripts (pick what you need) -->
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/01_dh-core.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/02_dh-enhancers.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/03_dh-conditions.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/yourusername/dom-helpers@latest/04_dh-reactive.js"></script>

  <!-- Your Code -->
  <script>
    const app = state({ message: 'Hello' });
    
    effect(() => {
      Elements.title.textContent = app.message;
    });
    
    Elements.btn.addEventListener('click', () => {
      app.message = 'Clicked!';
    });
  </script>
</body>
</html>
```

**Copy. Paste. Build.**

---

## Summary

### The Setup is Simple
- **4 script tags** = Full power
- **2 script tags** = Still very powerful
- **1 script tag** = Basic improvements

### Load What You Need
- Need reactivity? Add script 4
- Need bulk updaters? Add script 2
- Need conditions? Add script 3
- Not sure? Add all 4

### No Build Tools Required
- No installation
- No configuration
- Just HTML + script tags

### Works Everywhere
- Modern browsers
- CodePen, JSFiddle
- Any web server
- Even local files

**It really is that simple.**

---

## What's Next?

Now that you know how easy setup is, learn what you can build:

✅ **Essential Patterns** - Common patterns you'll use every day  
✅ **Working Examples** - Real apps you can copy  
✅ **Best Practices** - How to structure your code  
