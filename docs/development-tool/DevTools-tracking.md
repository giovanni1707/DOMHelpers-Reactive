# `DevTools Tracking` - Monitor States & Effects

## Quick Start (30 seconds)

```javascript
// 1. Enable DevTools first
DevTools.enable();

// 2. Track a state
const todos = state({ 
  items: [],
  filter: 'all' 
});

DevTools.trackState(todos, 'TodoList');

// 3. Track an effect
const cleanup = effect(() => {
  console.log('Items:', todos.items.length);
});

DevTools.trackEffect(cleanup, 'TodoCounter');

// 4. Make changes
todos.items.push({ text: 'Buy milk', done: false });
todos.filter = 'active';

// 5. Review tracking
console.log('Tracked states:', DevTools.states.size);     // 1
console.log('Tracked effects:', DevTools.effects.size);   // 1
console.log('State changes:', DevTools.getHistory().length); // 2

// Effect metadata
DevTools.effects.forEach((meta, effect) => {
  console.log(`${meta.name} ran ${meta.runs} times`);
});
// Output: "TodoCounter ran 3 times" (initial + 2 changes) ✨
```

**What just happened?** You registered states and effects for tracking, and DevTools recorded everything!

 

## Overview

Tracking is **how you tell DevTools what to monitor**. It's a two-step process:

```
Step 1: Enable DevTools
        ↓
Step 2: Track what matters
        ↓
DevTools records everything ✨
```

Think of it as **installing security cameras** - you choose where to put them (what to track), and they record everything that happens.

### Tracking Methods

| Method | Purpose | What It Tracks |
|--------|---------|----------------|
| `trackState(state, name)` | Monitor state object | All property changes |
| `trackEffect(effect, name)` | Monitor effect function | Execution count |

 

## trackState() Method

### What It Does

`trackState()` **registers a reactive state object** for monitoring, recording all property changes.

```javascript
DevTools.trackState(state, name)
```

**Parameters:**
- `state` (Object) - Reactive state object to track
- `name` (String) - Friendly name for identification

**Returns:** `undefined`

**What Gets Tracked:**
- ✅ Every property change
- ✅ Old and new values
- ✅ Timestamps
- ✅ Change count

 

### How trackState() Works

```
1️⃣ Verify DevTools enabled
   if (!DevTools.enabled) → ignore
        ↓
2️⃣ Assign unique ID
   id = nextId++
        ↓
3️⃣ Create metadata
   {
     id: 1,
     name: 'TodoList',
     created: Date.now(),
     updates: []
   }
        ↓
4️⃣ Register in states Map
   DevTools.states.set(state, metadata)
        ↓
5️⃣ Start monitoring
   All changes now recorded ✓
```

 

### trackState() Basic Examples

**Example 1: Single State**
```javascript
DevTools.enable();

const counter = state({ count: 0 });
DevTools.trackState(counter, 'Counter');

counter.count = 1;
counter.count = 2;
counter.count = 3;

const history = DevTools.getHistory();
console.log(`Tracked ${history.length} changes`);  // 3
```

**Example 2: Multiple States**
```javascript
DevTools.enable();

const user = state({ name: '', email: '' });
const cart = state({ items: [], total: 0 });
const settings = state({ theme: 'light', lang: 'en' });

DevTools.trackState(user, 'User');
DevTools.trackState(cart, 'Cart');
DevTools.trackState(settings, 'Settings');

console.log('Tracking', DevTools.states.size, 'states');  // 3
```

**Example 3: Nested State**
```javascript
DevTools.enable();

const app = state({
  user: {
    profile: { name: 'Alice', age: 30 },
    preferences: { theme: 'dark' }
  },
  data: {
    items: [],
    loading: false
  }
});

DevTools.trackState(app, 'AppState');

// Tracks deep changes
app.user.profile.name = 'Bob';
app.data.loading = true;

const history = DevTools.getHistory();
console.log('Nested changes tracked:', history);
```

 

## trackEffect() Method

### What It Does

`trackEffect()` **registers an effect function** for monitoring, recording how many times it executes.

```javascript
DevTools.trackEffect(effect, name)
```

**Parameters:**
- `effect` (Function) - Effect function to track
- `name` (String) - Friendly name for identification

**Returns:** `undefined`

**What Gets Tracked:**
- ✅ Execution count
- ✅ Creation time
- ✅ Effect metadata

 

### How trackEffect() Works

```
1️⃣ Verify DevTools enabled
   if (!DevTools.enabled) → ignore
        ↓
2️⃣ Assign unique ID
   id = nextId++
        ↓
3️⃣ Create metadata
   {
     id: 1,
     name: 'Logger',
     created: Date.now(),
     runs: 0
   }
        ↓
4️⃣ Register in effects Map
   DevTools.effects.set(effect, metadata)
        ↓
5️⃣ Start counting
   Increment runs on each execution ✓
```

 

### trackEffect() Basic Examples

**Example 1: Single Effect**
```javascript
DevTools.enable();

const state = ReactiveUtils.state({ count: 0 });
DevTools.trackState(state, 'Counter');

const cleanup = effect(() => {
  console.log('Count is:', state.count);
});

DevTools.trackEffect(cleanup, 'CountLogger');

state.count++;
state.count++;

// Check runs
DevTools.effects.forEach((meta, eff) => {
  console.log(`${meta.name}: ${meta.runs} runs`);
});
// Output: "CountLogger: 3 runs" (initial + 2 changes)
```

**Example 2: Multiple Effects**
```javascript
DevTools.enable();

const state = ReactiveUtils.state({ count: 0, name: '' });
DevTools.trackState(state, 'AppState');

const effect1 = effect(() => {
  document.title = `Count: ${state.count}`;
});
DevTools.trackEffect(effect1, 'TitleUpdater');

const effect2 = effect(() => {
  console.log('Name:', state.name);
});
DevTools.trackEffect(effect2, 'NameLogger');

const effect3 = effect(() => {
  localStorage.setItem('count', state.count);
});
DevTools.trackEffect(effect3, 'CountPersister');

console.log('Tracking', DevTools.effects.size, 'effects');  // 3
```

 

## Tracking Patterns

### Pattern 1: Auto-Track States

```javascript
function createTrackedState(initialState, name) {
  const newState = state(initialState);
  
  if (DevTools.enabled) {
    DevTools.trackState(newState, name);
    console.log(`Created and tracked: ${name}`);
  }
  
  return newState;
}

// Usage
const todos = createTrackedState({ items: [] }, 'TodoList');
const user = createTrackedState({ name: '' }, 'User');
```

 

### Pattern 2: Namespace Tracking

```javascript
function createNamespacedTracker(namespace) {
  return {
    trackState(state, name) {
      const fullName = `${namespace}:${name}`;
      DevTools.trackState(state, fullName);
    },
    
    trackEffect(effect, name) {
      const fullName = `${namespace}:${name}`;
      DevTools.trackEffect(effect, fullName);
    }
  };
}

// Usage
const appTracker = createNamespacedTracker('App');
const userTracker = createNamespacedTracker('User');

appTracker.trackState(appState, 'Main');     // 'App:Main'
userTracker.trackState(userState, 'Profile'); // 'User:Profile'
```

 

### Pattern 3: Selective Tracking

```javascript
function trackCriticalStates() {
  DevTools.enable();
  
  // Only track important states
  const criticalStates = [
    { state: userState, name: 'User' },
    { state: authState, name: 'Auth' },
    { state: paymentState, name: 'Payment' }
  ];
  
  criticalStates.forEach(({ state, name }) => {
    DevTools.trackState(state, name);
    console.log(`Tracking critical state: ${name}`);
  });
}
```

 

## Real-World Examples

### Example 1: Todo App Complete Tracking

```javascript
class TodoApp {
  constructor() {
    DevTools.enable();
    
    this.state = state({
      todos: [],
      filter: 'all',
      stats: { total: 0, completed: 0 }
    });
    
    DevTools.trackState(this.state, 'TodoApp');
    this.setupEffects();
  }
  
  setupEffects() {
    const renderEffect = effect(() => {
      this.render(this.state.todos, this.state.filter);
    });
    DevTools.trackEffect(renderEffect, 'RenderEffect');
    
    const statsEffect = effect(() => {
      this.state.stats.total = this.state.todos.length;
      this.state.stats.completed = 
        this.state.todos.filter(t => t.done).length;
    });
    DevTools.trackEffect(statsEffect, 'StatsCalculator');
  }
  
  addTodo(text) {
    this.state.todos.push({
      id: Date.now(),
      text,
      done: false
    });
  }
}
```

 

### Example 2: E-Commerce Cart Tracking

```javascript
function setupCartTracking() {
  DevTools.enable();
  
  const cart = state({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });
  
  DevTools.trackState(cart, 'ShoppingCart');
  
  const calcEffect = effect(() => {
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + (item.price * item.qty), 0
    );
    cart.tax = cart.subtotal * 0.08;
    cart.total = cart.subtotal + cart.tax;
  });
  DevTools.trackEffect(calcEffect, 'CartCalculations');
  
  return cart;
}
```

 

### Example 3: Form Validation Tracking

```javascript
function setupFormTracking(form) {
  DevTools.enable();
  DevTools.trackState(form, 'RegistrationForm');
  
  const validationEffect = effect(() => {
    if (form.values.email && !form.values.email.includes('@')) {
      form.setError('email', 'Invalid email');
    } else {
      form.clearError('email');
    }
  });
  DevTools.trackEffect(validationEffect, 'FormValidation');
}
```

 

## Advanced Tracking

### 1. Automatic Tracking Setup

```javascript
function autoTrackReactiveObjects() {
  const originalState = window.state;
  let stateCounter = 0;
  
  window.state = function(initialState, debugName) {
    const newState = originalState(initialState);
    
    if (DevTools.enabled) {
      const name = debugName || `State_${++stateCounter}`;
      DevTools.trackState(newState, name);
    }
    
    return newState;
  };
}
```

 

### 2. Tracking Metrics

```javascript
class TrackingMetrics {
  static collect() {
    const states = DevTools.getStates();
    const effects = Array.from(DevTools.effects.values());
    
    return {
      totalStates: states.length,
      totalEffects: effects.length,
      avgEffectRuns: effects.reduce((sum, e) => sum + e.runs, 0) / effects.length
    };
  }
}
```

 

## Best Practices

### ✅ Do This

```javascript
// 1. Enable before tracking
DevTools.enable();
DevTools.trackState(state, 'MyState');

// 2. Use descriptive names
DevTools.trackState(userProfile, 'UserProfile');
DevTools.trackEffect(titleEffect, 'PageTitleUpdater');

// 3. Track important items only
DevTools.trackState(authState, 'Authentication');

// 4. Check if enabled
if (DevTools.enabled) {
  DevTools.trackState(state, 'Debug');
}
```

### ❌ Don't Do This

```javascript
// 1. Track before enabling
DevTools.trackState(state, 'Test');  // Ignored!

// 2. Use generic names
DevTools.trackState(state1, 'state');

// 3. Track everything blindly
allStates.forEach(s => DevTools.trackState(s, 'State'));
```

 

## Common Pitfalls

### Pitfall 1: Wrong Order

```javascript
// ❌ Won't work
DevTools.trackState(state, 'MyState');
DevTools.enable();

// ✅ Correct
DevTools.enable();
DevTools.trackState(state, 'MyState');
```

 

### Pitfall 2: Poor Names

```javascript
// ❌ Hard to understand
DevTools.trackState(state1, 'data');

// ✅ Clear and descriptive
DevTools.trackState(userData, 'UserProfile');
```

 

## Summary

**Tracking Methods:**
- `trackState(state, name)` - Monitor state changes
- `trackEffect(effect, name)` - Monitor effect runs

**Key Points:**
- ✅ Enable before tracking
- ✅ Use descriptive names
- ✅ Track important items only
- ✅ Check metadata for insights

**Tracking Flow:**

```
enable()
   ↓
trackState(state, 'Name')
   ↓
trackEffect(effect, 'Name')
   ↓
Changes recorded automatically ✨
```

**One-Line Rule:** Track states and effects with descriptive names to monitor what matters.

**Remember:** Good tracking names make debugging easy - be descriptive! 🎉