# `builder()` - Chainable State Builder

## Quick Start (30 seconds)

```javascript
// Build complex reactive state with chainable API
const app = builder({ count: 0, name: '' })
  .computed({ double: function() { return this.count * 2; } })
  .watch({ count: (newVal) => console.log('Count:', newVal) })
  .bind({ '#counter': () => app.state.count })
  .action('increment', function() { this.count++; })
  .build();

app.increment(); // ✨ Runs action, updates computed, triggers watch, updates DOM!
```

**That's it.** Chain your state configuration, call `.build()`, and get a fully-wired reactive state with computed properties, watchers, effects, bindings, and custom actions.

---

## What is `builder()`?

`builder()` is **the chainable constructor for complex reactive state**. Instead of setting up state piece-by-piece with separate calls, you chain methods together for a clean, fluent API.

Think of it as **using a construction blueprint where you specify every feature upfront**, then build the final product. You describe what you want (computed properties, watchers, actions, bindings), then `.build()` assembles it all.

**In practical terms:** Instead of calling `state()`, then `computed()`, then `watch()`, then `bindings()` separately, you chain them all together in one readable flow.

---

## Syntax

```javascript
// Basic pattern
const myBuilder = builder(initialState)
  .computed(computedDefs)
  .watch(watchDefs)
  .effect(effectFn)
  .bind(bindingDefs)
  .action(name, fn)
  .actions(actionDefs)
  .build();

// Access the state
myBuilder.state.property = value;

// Simple example
const counter = builder({ count: 0 })
  .computed({ double: function() { return this.count * 2; } })
  .build();

console.log(counter.state.count);  // 0
console.log(counter.state.double); // 0 (computed)

counter.state.count = 5;
console.log(counter.state.double); // 10 (auto-updated)

// Complex example
const app = builder({ user: 'Alice', points: 0 })
  .computed({
    greeting: function() { return `Hello, ${this.user}!`; },
    level: function() { return Math.floor(this.points / 100); }
  })
  .watch({
    points: (newVal) => console.log('Points changed:', newVal)
  })
  .bind({
    '#user-name': () => app.state.user,
    '#points': () => app.state.points,
    '#level': () => app.state.level
  })
  .action('addPoints', function(amount) {
    this.points += amount;
  })
  .build();

// Use it
app.state.addPoints(50); // ✨ Updates state, triggers watch, updates DOM
```

**Methods:**
- `.computed(defs)` - Add computed properties
- `.watch(defs)` - Add watchers for properties
- `.effect(fn)` - Add a reactive effect
- `.bind(defs)` - Add DOM bindings
- `.action(name, fn)` - Add single action method
- `.actions(defs)` - Add multiple action methods
- `.build()` - Build and return the final state
- `.destroy()` - Clean up all effects and watchers

**Returns:**
- Builder object with `.state` property containing the reactive state

---

## Why Does This Exist?

### The Problem Without builder()

Let's create a user dashboard with computed values, watchers, and actions:

```javascript
// ❌ Vanilla JavaScript - manual everything, no reactivity
const userData = {
  firstName: 'Alice',
  lastName: 'Johnson',
  points: 150,
  level: 0
};

// Manual computed value calculation
function getFullName() {
  return `${userData.firstName} ${userData.lastName}`;
}

function getLevel() {
  return Math.floor(userData.points / 100);
}

// Manual watcher simulation
let previousPoints = userData.points;
function checkPointsChange() {
  if (userData.points !== previousPoints) {
    console.log('Points changed:', userData.points);
    previousPoints = userData.points;
  }
}

// Manual DOM updates
function updateDisplay() {
  document.getElementById('full-name').textContent = getFullName();
  document.getElementById('points').textContent = userData.points;
  document.getElementById('level').textContent = getLevel();
}

// Manual action
function addPoints(amount) {
  userData.points += amount;
  userData.level = getLevel(); // Manual recompute
  checkPointsChange(); // Manual watch trigger
  updateDisplay(); // Manual DOM sync
}

// Must call manually
addPoints(50);
```

**What's the Real Issue?**

```
Create Plain Data
    ↓
Write Computed Functions
    ↓
Write Manual Watchers
    ↓
Write Update Functions
    ↓
Wire Everything Together
    ↓
Remember to Call Everything
    ↓
Lots of Boilerplate + Easy to Forget
```

**Problems:**
❌ **No reactivity** - Everything is manual
❌ **Scattered setup** - Computed, watchers, actions all separate
❌ **Manual synchronization** - Must call update functions
❌ **Hard to maintain** - Changes require updating multiple functions
❌ **Error-prone** - Easy to forget a manual call

### The Solution with `builder()`

```javascript
// ✅ DOM Helpers + Reactive State with builder() - automatic everything
const dashboard = builder({
  firstName: 'Alice',
  lastName: 'Johnson',
  points: 150
})
.computed({
  fullName: function() {
    return `${this.firstName} ${this.lastName}`;
  },
  level: function() {
    return Math.floor(this.points / 100);
  }
})
.watch({
  points: (newVal) => {
    console.log('Points changed:', newVal);
  }
})
.bind({
  '#full-name': () => dashboard.state.fullName,
  '#points': () => dashboard.state.points,
  '#level': () => dashboard.state.level
})
.action('addPoints', function(amount) {
  this.points += amount;
  // ✨ Computed values recalculate automatically
  // ✨ Watchers trigger automatically
  // ✨ DOM updates automatically
})
.build();

// Just call the action
dashboard.state.addPoints(50);
// Everything else happens automatically!
```

**What Just Happened?**

```
One Builder Chain
    ↓
Define State + Computed + Watch + Bindings + Actions
    ↓
Call .build()
    ↓
Get Fully-Wired Reactive State
    ↓
All Updates Automatic
```

**Benefits:**
✅ **Fluent API** - Readable, chainable configuration
✅ **All-in-one** - State, computed, watchers, bindings, actions in one place
✅ **Automatic reactivity** - Everything wired together automatically
✅ **Clean code** - Declarative setup, no manual wiring
✅ **Easy cleanup** - Single `.destroy()` call removes everything

---

## Mental Model: Factory Assembly Line

Think of `builder()` like **a factory assembly line** where you specify all the features, then assemble the final product:

**Without builder() (Manual Assembly):**
```
┌─────────────────────────────┐
│  Manual Assembly            │
│                             │
│  Create base object         │
│  ↓                          │
│  Add computed separately    │
│  ↓                          │
│  Add watchers separately    │
│  ↓                          │
│  Add bindings separately    │
│  ↓                          │
│  Add actions separately     │
│  ↓                          │
│  Wire everything manually   │
│                             │
│  Lots of separate steps!    │
└─────────────────────────────┘
```

**With builder() (Assembly Line):**
```
┌─────────────────────────────┐
│  Assembly Line              │
│                             │
│  Specify All Features       │
│  ├─ State                   │
│  ├─ Computed                │
│  ├─ Watchers                │
│  ├─ Bindings                │
│  └─ Actions                 │
│  ↓                          │
│  Press BUILD Button         │
│  ↓                          │
│  Get Complete Product       │
│                             │
│  Everything wired together! │
└─────────────────────────────┘
```

You **specify the blueprint**, then **build once** to get a complete, working reactive state.

---

## How Does It Work?

The builder pattern accumulates configuration, then builds the final state:

```
Your Chain
    ↓
builder(state)
  .computed(...)
  .watch(...)
  .bind(...)
  .actions(...)
  .build()
    ↓
Internally:
1. Creates reactive state
2. Adds computed properties
3. Sets up watchers
4. Creates bindings
5. Attaches action methods
6. Tracks cleanup functions
    ↓
Returns: Object with .state property
```

**Step-by-step:**

1️⃣ **You start the chain:**
```javascript
const app = builder({ count: 0 });
```

2️⃣ **You add features (each returns builder):**
```javascript
app.computed({ double: function() { return this.count * 2; } });
app.watch({ count: (val) => console.log(val) });
```

3️⃣ **You call .build():**
```javascript
const result = app.build();
```

4️⃣ **You get the reactive state:**
```javascript
result.state.count = 5; // Everything reacts automatically
```

**Key Insight:**
Each builder method returns `this`, allowing you to chain calls. The `.build()` method finalizes everything and returns an object with the reactive `state` and a `destroy()` method for cleanup.

---

## Basic Usage

### Example 1: Simple Counter with Computed

```javascript
const counter = builder({ count: 0 })
  .computed({
    double: function() { return this.count * 2; },
    triple: function() { return this.count * 3; }
  })
  .build();

console.log(counter.state.count);  // 0
console.log(counter.state.double); // 0
console.log(counter.state.triple); // 0

counter.state.count = 5;
console.log(counter.state.double); // 10 (auto-updated)
console.log(counter.state.triple); // 15 (auto-updated)
```

---

### Example 2: With Watchers

```javascript
const user = builder({
  name: 'Alice',
  email: 'alice@example.com'
})
.watch({
  name: (newVal, oldVal) => {
    console.log(`Name changed from ${oldVal} to ${newVal}`);
  },
  email: (newVal) => {
    console.log(`Email updated to: ${newVal}`);
  }
})
.build();

user.state.name = 'Bob';
// Console: "Name changed from Alice to Bob"

user.state.email = 'bob@example.com';
// Console: "Email updated to: bob@example.com"
```

---

### Example 3: With DOM Bindings

```javascript
const app = builder({
  title: 'My App',
  version: '1.0.0'
})
.bind({
  '#app-title': () => app.state.title,
  '#app-version': () => app.state.version,
  '#full-info': () => `${app.state.title} v${app.state.version}`
})
.build();

app.state.version = '2.0.0';
// ✨ All bindings update automatically
```

---

### Example 4: With Actions

```javascript
const counter = builder({ count: 0 })
  .action('increment', function() {
    this.count++;
  })
  .action('decrement', function() {
    this.count--;
  })
  .action('reset', function() {
    this.count = 0;
  })
  .bind({
    '#counter': () => counter.state.count
  })
  .build();

// Wire up buttons using bulk event binding
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => counter.state.increment()]
  },
  decrementBtn: {
    addEventListener: ['click', () => counter.state.decrement()]
  },
  resetBtn: {
    addEventListener: ['click', () => counter.state.reset()]
  }
});
```

---

### Example 5: Complete Builder Chain

```javascript
const todo = builder({
  items: [],
  filter: 'all'
})
.computed({
  filteredItems: function() {
    if (this.filter === 'active') return this.items.filter(t => !t.done);
    if (this.filter === 'completed') return this.items.filter(t => t.done);
    return this.items;
  },
  activeCount: function() {
    return this.items.filter(t => !t.done).length;
  },
  completedCount: function() {
    return this.items.filter(t => t.done).length;
  }
})
.watch({
  items: (newItems) => {
    console.log(`Todo list updated: ${newItems.length} items`);
  }
})
.bind({
  '#active-count': () => todo.state.activeCount,
  '#completed-count': () => todo.state.completedCount,
  '#total-count': () => todo.state.items.length
})
.action('addTodo', function(text) {
  this.items.push({ text, done: false });
})
.action('toggleTodo', function(index) {
  this.items[index].done = !this.items[index].done;
})
.action('clearCompleted', function() {
  this.items = this.items.filter(t => !t.done);
})
.build();

// Use actions
todo.state.addTodo('Buy milk');
todo.state.addTodo('Walk dog');
// ✨ Computed values update, watchers trigger, DOM syncs
```

---

### Example 6: User Profile with Validation

```javascript
const profile = builder({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})
.computed({
  fullName: function() {
    return `${this.firstName} ${this.lastName}`.trim();
  },
  isEmailValid: function() {
    return this.email.includes('@') && this.email.includes('.');
  },
  isPhoneValid: function() {
    return /^\d{10}$/.test(this.phone.replace(/\D/g, ''));
  },
  isValid: function() {
    return this.firstName.length > 0 &&
           this.lastName.length > 0 &&
           this.isEmailValid &&
           this.isPhoneValid;
  }
})
.bind({
  '#full-name-display': () => profile.state.fullName,
  '#email-error': () => {
    return profile.state.email && !profile.state.isEmailValid
      ? 'Invalid email'
      : '';
  },
  '#phone-error': () => {
    return profile.state.phone && !profile.state.isPhoneValid
      ? 'Invalid phone (10 digits required)'
      : '';
  }
})
.action('submit', function() {
  if (this.isValid) {
    console.log('Submitting:', this.fullName, this.email, this.phone);
  } else {
    console.log('Form is invalid');
  }
})
.build();

// Input handlers using bulk event binding
Elements.update({
  firstNameInput: {
    addEventListener: ['input', (e) => {
      profile.state.firstName = e.target.value;
    }]
  },
  lastNameInput: {
    addEventListener: ['input', (e) => {
      profile.state.lastName = e.target.value;
    }]
  },
  emailInput: {
    addEventListener: ['input', (e) => {
      profile.state.email = e.target.value;
    }]
  },
  phoneInput: {
    addEventListener: ['input', (e) => {
      profile.state.phone = e.target.value;
    }]
  },
  submitBtn: {
    addEventListener: ['click', () => profile.state.submit()]
  }
});
```

---

### Example 7: Shopping Cart

```javascript
const cart = builder({
  items: [],
  taxRate: 0.08
})
.computed({
  subtotal: function() {
    return this.items.reduce((sum, item) =>
      sum + (item.price * item.qty), 0
    );
  },
  tax: function() {
    return this.subtotal * this.taxRate;
  },
  total: function() {
    return this.subtotal + this.tax;
  },
  itemCount: function() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }
})
.watch({
  items: (newItems) => {
    console.log(`Cart updated: ${newItems.length} unique items`);
  }
})
.bind({
  '#item-count': () => `${cart.state.itemCount} items`,
  '#subtotal': () => `$${cart.state.subtotal.toFixed(2)}`,
  '#tax': () => `$${cart.state.tax.toFixed(2)}`,
  '#total': () => `$${cart.state.total.toFixed(2)}`
})
.action('addItem', function(item) {
  const existing = this.items.find(i => i.id === item.id);
  if (existing) {
    existing.qty++;
  } else {
    this.items.push({ ...item, qty: 1 });
  }
})
.action('removeItem', function(id) {
  this.items = this.items.filter(i => i.id !== id);
})
.action('updateQty', function(id, qty) {
  const item = this.items.find(i => i.id === id);
  if (item) item.qty = qty;
})
.action('clear', function() {
  this.items = [];
})
.build();

// Use actions
cart.state.addItem({ id: 1, name: 'Laptop', price: 999 });
cart.state.addItem({ id: 2, name: 'Mouse', price: 29 });
// ✨ All totals recalculate automatically
```

---

### Example 8: Search with Filters

```javascript
const products = builder({
  items: [
    { name: 'Laptop', price: 999, category: 'electronics' },
    { name: 'Mouse', price: 29, category: 'electronics' },
    { name: 'Desk', price: 299, category: 'furniture' },
    { name: 'Chair', price: 199, category: 'furniture' }
  ],
  searchQuery: '',
  categoryFilter: 'all',
  minPrice: 0,
  maxPrice: 10000
})
.computed({
  filteredProducts: function() {
    return this.items.filter(item => {
      const matchesSearch = item.name.toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.categoryFilter === 'all' ||
        item.category === this.categoryFilter;
      const matchesPrice = item.price >= this.minPrice &&
        item.price <= this.maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  },
  resultCount: function() {
    return this.filteredProducts.length;
  }
})
.bind({
  '#result-count': () => `${products.state.resultCount} results`,
  '#product-list': () => {
    return products.state.filteredProducts
      .map(p => `<li>${p.name} - $${p.price}</li>`)
      .join('');
  }
})
.action('clearFilters', function() {
  this.searchQuery = '';
  this.categoryFilter = 'all';
  this.minPrice = 0;
  this.maxPrice = 10000;
})
.build();
```

---

### Example 9: Game Score Tracker

```javascript
const game = builder({
  score: 0,
  highScore: 0,
  lives: 3,
  level: 1
})
.computed({
  isGameOver: function() {
    return this.lives === 0;
  },
  nextLevelScore: function() {
    return this.level * 1000;
  },
  scoreProgress: function() {
    return (this.score / this.nextLevelScore) * 100;
  }
})
.watch({
  score: (newScore, oldScore) => {
    if (newScore > game.state.highScore) {
      game.state.highScore = newScore;
    }
    if (newScore >= game.state.nextLevelScore) {
      game.state.levelUp();
    }
  },
  lives: (newLives) => {
    if (newLives === 0) {
      console.log('Game Over!');
    }
  }
})
.bind({
  '#score': () => game.state.score,
  '#high-score': () => game.state.highScore,
  '#lives': () => '❤️'.repeat(game.state.lives),
  '#level': () => `Level ${game.state.level}`,
  '#progress': () => `${game.state.scoreProgress.toFixed(0)}%`
})
.action('addPoints', function(points) {
  this.score += points;
})
.action('loseLife', function() {
  if (this.lives > 0) this.lives--;
})
.action('levelUp', function() {
  this.level++;
  console.log(`Level Up! Now at level ${this.level}`);
})
.action('restart', function() {
  this.score = 0;
  this.lives = 3;
  this.level = 1;
})
.build();
```

---

### Example 10: Theme Manager

```javascript
const theme = builder({
  mode: 'light',
  primaryColor: '#007bff',
  fontSize: 16,
  fontFamily: 'Arial'
})
.computed({
  isDark: function() {
    return this.mode === 'dark';
  },
  cssVars: function() {
    return {
      '--primary-color': this.primaryColor,
      '--font-size': `${this.fontSize}px`,
      '--font-family': this.fontFamily
    };
  }
})
.watch({
  mode: (newMode) => {
    console.log(`Theme changed to ${newMode} mode`);
  }
})
.effect(() => {
  // Apply CSS variables using bulk updates
  const vars = theme.state.cssVars;
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.body.classList.toggle('dark-mode', theme.state.isDark);
})
.bind({
  '#theme-label': () => theme.state.isDark ? 'Dark Mode' : 'Light Mode',
  '#font-size': () => `${theme.state.fontSize}px`
})
.action('toggleMode', function() {
  this.mode = this.isDark ? 'light' : 'dark';
})
.action('setFontSize', function(size) {
  this.fontSize = Math.max(12, Math.min(24, size));
})
.action('reset', function() {
  this.mode = 'light';
  this.primaryColor = '#007bff';
  this.fontSize = 16;
  this.fontFamily = 'Arial';
})
.build();
```

---

## Advanced Usage: Multiple Effects

```javascript
const logger = builder({ events: [] })
  .effect(() => {
    console.log('Effect 1: Events changed');
  })
  .effect(() => {
    console.log('Effect 2: Event count:', logger.state.events.length);
  })
  .build();

logger.state.events.push('New event');
// Both effects run automatically
```

---

## Advanced Usage: Chaining Actions

```javascript
const app = builder({ value: 0 })
  .actions({
    increment: function() {
      this.value++;
      return this; // Return this for chaining
    },
    double: function() {
      this.value *= 2;
      return this;
    },
    log: function() {
      console.log('Value:', this.value);
      return this;
    }
  })
  .build();

// Chain action calls
app.state
  .increment()
  .double()
  .log(); // Value: 2
```

---

## Advanced Usage: Complex Computed Dependencies

```javascript
const analytics = builder({
  pageViews: 1000,
  uniqueVisitors: 450,
  bounceRate: 0.42,
  avgSessionDuration: 125 // seconds
})
.computed({
  engagementScore: function() {
    return (
      (this.uniqueVisitors / this.pageViews) * 0.3 +
      (1 - this.bounceRate) * 0.4 +
      (this.avgSessionDuration / 300) * 0.3
    );
  },
  engagementGrade: function() {
    const score = this.engagementScore;
    if (score >= 0.8) return 'A';
    if (score >= 0.6) return 'B';
    if (score >= 0.4) return 'C';
    return 'D';
  },
  qualityRating: function() {
    return `${this.engagementGrade} (${(this.engagementScore * 100).toFixed(1)}%)`;
  }
})
.bind({
  '#page-views': () => analytics.state.pageViews.toLocaleString(),
  '#unique-visitors': () => analytics.state.uniqueVisitors.toLocaleString(),
  '#bounce-rate': () => `${(analytics.state.bounceRate * 100).toFixed(1)}%`,
  '#session-duration': () => `${analytics.state.avgSessionDuration}s`,
  '#engagement-score': () => analytics.state.qualityRating
})
.build();
```

---

## Cleanup and Disposal

The builder creates a `destroy()` method that cleans up all effects, watchers, and bindings:

```javascript
const temp = builder({ value: 0 })
  .watch({ value: (val) => console.log(val) })
  .bind({ '#display': () => temp.state.value })
  .build();

temp.state.value = 5; // Watch triggers, binding updates

// Later: cleanup everything
temp.destroy();

temp.state.value = 10; // Nothing happens (cleaned up)
```

---

## builder() vs Other Approaches

### Approach 1: builder() (Fluent API)
```javascript
const app = builder({ count: 0 })
  .computed({ double: function() { return this.count * 2; } })
  .bind({ '#count': () => app.state.count })
  .build();
```

### Approach 2: Separate Calls
```javascript
const app = state({ count: 0 });
computed(app, { double: function() { return this.count * 2; } });
bindings({ '#count': () => app.count });
```

### Approach 3: createState()
```javascript
const app = createState(
  { count: 0 },
  { '#count': () => app.count }
);
computed(app, { double: function() { return this.count * 2; } });
```

**When to use builder():**
✅ Complex state with computed + watch + actions + bindings
✅ You prefer fluent/chainable APIs
✅ You want all configuration in one readable flow
✅ You need organized, self-documenting code

**When NOT to use builder():**
❌ Simple state with just data (use `state()`)
❌ Only need bindings (use `createState()`)
❌ Prefer functional composition over chaining

---

## Key Takeaways

✅ **Fluent API** - Chainable methods for clean, readable configuration
✅ **All-in-one** - State, computed, watchers, effects, bindings, actions in one chain
✅ **Organized** - All state configuration in one place
✅ **Automatic cleanup** - `.destroy()` removes all effects and watchers
✅ **Flexible** - Use only the methods you need, skip the rest
✅ **Access via .state** - Final state accessible via `result.state`

---

## What's Next?

Now that you understand `builder()`, explore:

- **`component()`** - Higher-level component pattern with lifecycle
- **`store()`** - Global state management with getters and actions
- **`computed()`** - Add computed properties to existing state

---

## Summary

`builder()` is the **fluent, chainable constructor** for complex reactive state. Instead of separate function calls, you chain configuration methods and call `.build()` to get a fully-wired reactive state.

**The magic formula:**
```
builder(state)
  .computed(...)
  .watch(...)
  .bind(...)
  .actions(...)
  .build()
────────────────────────────
Complete reactive state, ready to use
```

Think of it as **filling out a blueprint**, then pressing the **BUILD button** to get your custom-configured reactive state with all features wired together automatically.
