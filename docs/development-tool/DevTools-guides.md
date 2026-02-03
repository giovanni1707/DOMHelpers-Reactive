# `DevTools Complete Guides` - Real-World Workflows

## Quick Start (30 seconds)

```javascript
// Complete workflow example
class DebugWorkflow {
  static start() {
    // 1. Enable
    DevTools.enable();
    
    // 2. Track states
    DevTools.trackState(appState, 'App');
    DevTools.trackState(userState, 'User');
    
    // 3. Track effects
    const effect1 = effect(() => updateUI(appState));
    DevTools.trackEffect(effect1, 'UIUpdater');
    
    console.log('Debug mode active');
  }
  
  static inspect() {
    // 4. Review data
    console.log('States:', DevTools.getStates().length);
    console.log('Changes:', DevTools.getHistory().length);
    
    // 5. Analyze
    DevTools.getHistory().forEach(c => {
      console.log(`${c.stateName}.${c.key} = ${c.newValue}`);
    });
  }
  
  static end() {
    // 6. Clean up
    const report = {
      states: DevTools.getStates(),
      history: DevTools.getHistory()
    };
    
    console.log('Report:', report);
    DevTools.disable();
    DevTools.clearHistory();
  }
}

// Usage
DebugWorkflow.start();
// ... app runs ...
DebugWorkflow.inspect();
DebugWorkflow.end();
```

**What just happened?** You followed a complete debugging workflow from start to finish!

 

## Overview

This guide covers **complete real-world workflows** using DevTools for:

```
✅ Application debugging
✅ Performance analysis
✅ State flow tracking
✅ Effect monitoring
✅ Bug investigation
✅ Production debugging
```

Think of these as **debugging recipes** - proven patterns for common scenarios.

 

## Complete Workflows

### Workflow 1: Basic Debugging Session

**Goal:** Debug a simple app issue

```javascript
// Step 1: Start debugging
DevTools.enable();

// Step 2: Track relevant states
const counter = state({ count: 0, multiplier: 1 });
DevTools.trackState(counter, 'Counter');

// Step 3: Reproduce issue
counter.count = 5;
counter.multiplier = 2;

// Step 4: Inspect changes
const history = DevTools.getHistory();
console.log('What changed:', history);

// Step 5: Analyze
history.forEach(change => {
  console.log(
    `${change.key}: ${change.oldValue} → ${change.newValue}`
  );
});

// Step 6: Found issue? Disable
DevTools.disable();
```

 

### Workflow 2: Multi-State Investigation

**Goal:** Track interactions between multiple states

```javascript
// Step 1: Enable and clear
DevTools.enable();
DevTools.clearHistory();

// Step 2: Track all related states
DevTools.trackState(userState, 'User');
DevTools.trackState(cartState, 'Cart');
DevTools.trackState(orderState, 'Order');

// Step 3: Perform actions
userState.loggedIn = true;
cartState.items.push({ id: 1, name: 'Product' });
orderState.status = 'pending';

// Step 4: Review timeline
const timeline = DevTools.getHistory();
console.log('=== Timeline ===');
timeline.forEach((change, i) => {
  const time = new Date(change.timestamp).toLocaleTimeString();
  console.log(`${i + 1}. [${time}] ${change.stateName}.${change.key}`);
});

// Step 5: Find patterns
const userChanges = timeline.filter(c => c.stateName === 'User');
const cartChanges = timeline.filter(c => c.stateName === 'Cart');

console.log(`User changes: ${userChanges.length}`);
console.log(`Cart changes: ${cartChanges.length}`);
```

 

### Workflow 3: Effect Performance Analysis

**Goal:** Find expensive effects

```javascript
// Step 1: Setup tracking
DevTools.enable();

const state = ReactiveUtils.state({ value: 0 });
DevTools.trackState(state, 'TestState');

// Step 2: Track all effects
const effect1 = effect(() => console.log(state.value));
const effect2 = effect(() => document.title = state.value);
const effect3 = effect(() => localStorage.setItem('val', state.value));

DevTools.trackEffect(effect1, 'Logger');
DevTools.trackEffect(effect2, 'TitleUpdater');
DevTools.trackEffect(effect3, 'Storage');

// Step 3: Trigger many changes
for (let i = 0; i < 100; i++) {
  state.value = i;
}

// Step 4: Analyze effect runs
console.log('=== Effect Analysis ===');
DevTools.effects.forEach((meta) => {
  console.log(`${meta.name}: ${meta.runs} runs`);
  
  if (meta.runs > 50) {
    console.warn(`⚠️  ${meta.name} may be expensive`);
  }
});
```

 

## Scenario-Based Guides

### Scenario 1: Todo App Debugging

**Problem:** Todos not updating correctly

```javascript
class TodoDebugger {
  constructor() {
    DevTools.enable();
    
    this.todos = state({
      items: [],
      filter: 'all',
      stats: { total: 0, done: 0 }
    });
    
    DevTools.trackState(this.todos, 'Todos');
    this.setupTracking();
  }
  
  setupTracking() {
    // Track UI update
    const uiEffect = effect(() => {
      this.renderTodos(this.todos.items, this.todos.filter);
    });
    DevTools.trackEffect(uiEffect, 'UIRenderer');
    
    // Track stats calculation
    const statsEffect = effect(() => {
      this.todos.stats.total = this.todos.items.length;
      this.todos.stats.done = 
        this.todos.items.filter(t => t.done).length;
    });
    DevTools.trackEffect(statsEffect, 'StatsCalc');
  }
  
  addTodo(text) {
    console.log('Adding todo:', text);
    
    this.todos.items.push({
      id: Date.now(),
      text,
      done: false
    });
    
    // Check what happened
    this.inspect();
  }
  
  toggleTodo(id) {
    console.log('Toggling todo:', id);
    
    const todo = this.todos.items.find(t => t.id === id);
    if (todo) {
      todo.done = !todo.done;
    }
    
    this.inspect();
  }
  
  inspect() {
    const recent = DevTools.getHistory().slice(-5);
    console.log('Recent changes:', recent);
    
    DevTools.effects.forEach((meta) => {
      console.log(`${meta.name}: ${meta.runs} runs`);
    });
  }
  
  renderTodos(items, filter) {
    // Render logic
    console.log(`Rendering ${items.length} todos with filter: ${filter}`);
  }
}

// Debug session
const app = new TodoDebugger();
app.addTodo('Buy milk');
app.addTodo('Walk dog');
app.toggleTodo(app.todos.items[0].id);
```

 

### Scenario 2: Shopping Cart Bug

**Problem:** Cart total not calculating correctly

```javascript
function debugCart() {
  DevTools.enable();
  DevTools.clearHistory();
  
  const cart = state({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
  });
  
  DevTools.trackState(cart, 'Cart');
  
  // Track calculation effect
  const calcEffect = effect(() => {
    console.log('Calculating totals...');
    
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + (item.price * item.qty),
      0
    );
    
    cart.tax = cart.subtotal * 0.08;
    cart.total = cart.subtotal + cart.tax;
    
    console.log(`Subtotal: ${cart.subtotal}, Tax: ${cart.tax}, Total: ${cart.total}`);
  });
  
  DevTools.trackEffect(calcEffect, 'CartCalculator');
  
  // Reproduce issue
  console.log('=== Adding items ===');
  cart.items.push({ id: 1, name: 'Item 1', price: 10, qty: 2 });
  cart.items.push({ id: 2, name: 'Item 2', price: 15, qty: 1 });
  
  // Update quantity
  console.log('=== Updating quantity ===');
  cart.items[0].qty = 3;
  
  // Review what happened
  console.log('\n=== Change History ===');
  DevTools.getHistory().forEach(change => {
    console.log(
      `${change.key}: ${JSON.stringify(change.oldValue)} → ` +
      `${JSON.stringify(change.newValue)}`
    );
  });
  
  // Check effect runs
  console.log('\n=== Effect Runs ===');
  const meta = Array.from(DevTools.effects.values())[0];
  console.log(`Calculator ran ${meta.runs} times`);
  
  // Expected: 3 runs (initial + 2 item additions)
  // If different, we found the bug!
}

debugCart();
```

 

### Scenario 3: Form Validation Issue

**Problem:** Validation not triggering

```javascript
function debugFormValidation() {
  DevTools.enable();
  
  const form = ReactiveUtils.form(
    { email: '', password: '' },
    {
      validators: {
        email: (value) => {
          if (!value.includes('@')) return 'Invalid email';
          return null;
        },
        password: (value) => {
          if (value.length < 8) return 'Too short';
          return null;
        }
      }
    }
  );
  
  DevTools.trackState(form, 'RegistrationForm');
  
  // Track validation effect
  const validationEffect = effect(() => {
    console.log('Validation running...');
    console.log('Errors:', form.errors);
    console.log('Is valid:', form.isValid);
  });
  
  DevTools.trackEffect(validationEffect, 'Validation');
  
  // Reproduce issue
  console.log('=== Filling form ===');
  form.setValue('email', 'test');
  form.setValue('password', '123');
  
  console.log('\n=== Fixing values ===');
  form.setValue('email', 'test@example.com');
  form.setValue('password', 'password123');
  
  // Review
  console.log('\n=== Analysis ===');
  console.log('Form state:', form.values);
  console.log('Errors:', form.errors);
  
  const history = DevTools.getHistory();
  console.log(`Total changes: ${history.length}`);
  
  // Check validation runs
  const meta = Array.from(DevTools.effects.values())[0];
  console.log(`Validation ran ${meta.runs} times`);
}

debugFormValidation();
```

 

## Integration Patterns

### Pattern 1: Development Mode Toggle

```javascript
class DevMode {
  static init() {
    // Auto-enable in development
    if (import.meta.env.DEV) {
      this.enable();
    }
  }
  
  static enable() {
    DevTools.enable();
    
    // Track main app states
    if (window.appStates) {
      Object.entries(window.appStates).forEach(([name, state]) => {
        DevTools.trackState(state, name);
      });
    }
    
    // Create UI toggle
    this.createToggle();
    
    console.log('Development mode enabled');
  }
  
  static createToggle() {
    const button = document.createElement('button');
    button.textContent = '🐛 DevTools';
    button.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 99999;
    `;
    
    button.onclick = () => this.showDashboard();
    document.body.appendChild(button);
  }
  
  static showDashboard() {
    console.clear();
    console.log('=== DevTools Dashboard ===');
    console.log('States:', DevTools.getStates().length);
    console.log('History:', DevTools.getHistory().length);
    
    console.table(DevTools.getStates());
    console.table(DevTools.getHistory().slice(-10));
  }
}

// Initialize
DevMode.init();
```

 

### Pattern 2: Test Helper Integration

```javascript
class TestDevTools {
  static beforeEach() {
    DevTools.enable();
    DevTools.clearHistory();
  }
  
  static afterEach() {
    DevTools.disable();
  }
  
  static trackState(state, name) {
    if (DevTools.enabled) {
      DevTools.trackState(state, name);
    }
  }
  
  static assertChanges(expectedCount) {
    const actual = DevTools.getHistory().length;
    if (actual !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} changes, got ${actual}`
      );
    }
  }
  
  static assertStateChanged(stateName, key) {
    const change = DevTools.getHistory()
      .find(c => c.stateName === stateName && c.key === key);
    
    if (!change) {
      throw new Error(
        `Expected ${stateName}.${key} to change`
      );
    }
    
    return change;
  }
}

// In tests
describe('Counter', () => {
  beforeEach(() => TestDevTools.beforeEach());
  afterEach(() => TestDevTools.afterEach());
  
  it('should increment', () => {
    const counter = state({ count: 0 });
    TestDevTools.trackState(counter, 'Counter');
    
    counter.count++;
    
    TestDevTools.assertChanges(1);
    const change = TestDevTools.assertStateChanged('Counter', 'count');
    
    expect(change.newValue).toBe(1);
  });
});
```

 

## Debugging Strategies

### Strategy 1: Timeline Analysis

```javascript
function analyzeTimeline() {
  const history = DevTools.getHistory();
  
  console.log('=== Change Timeline ===');
  
  history.forEach((change, index) => {
    const time = new Date(change.timestamp).toLocaleTimeString();
    const timeSinceLast = index > 0 
      ? change.timestamp - history[index - 1].timestamp 
      : 0;
    
    console.log(
      `${index + 1}. [${time}] (+${timeSinceLast}ms) ` +
      `${change.stateName}.${change.key}: ` +
      `${change.oldValue} → ${change.newValue}`
    );
  });
}
```

 

### Strategy 2: State Comparison

```javascript
function compareStates(state1Name, state2Name) {
  const changes = DevTools.getHistory();
  
  const state1Changes = changes.filter(c => c.stateName === state1Name);
  const state2Changes = changes.filter(c => c.stateName === state2Name);
  
  console.log('=== State Comparison ===');
  console.log(`${state1Name}: ${state1Changes.length} changes`);
  console.log(`${state2Name}: ${state2Changes.length} changes`);
  
  // Find correlated changes
  state1Changes.forEach(c1 => {
    const nearbyChange = state2Changes.find(c2 => 
      Math.abs(c2.timestamp - c1.timestamp) < 100
    );
    
    if (nearbyChange) {
      console.log(`Correlated: ${c1.key} affects ${nearbyChange.key}`);
    }
  });
}
```

 

## Performance Optimization

### Finding Performance Issues

```javascript
function findPerformanceIssues() {
  console.log('=== Performance Analysis ===');
  
  // Check states with many updates
  const states = DevTools.getStates();
  states.forEach(s => {
    if (s.updates.length > 100) {
      console.warn(
        `⚠️  ${s.name}: ${s.updates.length} updates - ` +
        `Consider batching or optimization`
      );
    }
  });
  
  // Check effects with many runs
  DevTools.effects.forEach((meta) => {
    if (meta.runs > 100) {
      console.warn(
        `⚠️  Effect "${meta.name}": ${meta.runs} runs - ` +
        `May be too reactive`
      );
    }
  });
  
  // Check rapid changes
  const history = DevTools.getHistory();
  for (let i = 1; i < history.length; i++) {
    const timeDiff = history[i].timestamp - history[i - 1].timestamp;
    
    if (timeDiff < 10) {
      console.warn(
        `⚠️  Rapid changes detected: ` +
        `${history[i - 1].stateName} and ${history[i].stateName} ` +
        `changed within ${timeDiff}ms`
      );
    }
  }
}
```

 

## Production Debugging

### Safe Production Debug Mode

```javascript
class ProductionDebug {
  static PASSWORD = 'secure_debug_2024';
  static timeout = null;
  
  static enable(password) {
    if (password !== this.PASSWORD) {
      console.error('Invalid password');
      return false;
    }
    
    DevTools.enable();
    console.log('🔒 Secure debug mode enabled');
    
    // Auto-disable after 10 minutes
    this.timeout = setTimeout(() => {
      this.disable();
      console.log('Debug session expired');
    }, 10 * 60 * 1000);
    
    // Track critical states only
    this.trackCriticalStates();
    
    return true;
  }
  
  static disable() {
    DevTools.disable();
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
  
  static trackCriticalStates() {
    // Only track essential states
    const critical = [
      { state: window.authState, name: 'Auth' },
      { state: window.paymentState, name: 'Payment' },
      { state: window.errorState, name: 'Errors' }
    ];
    
    critical.forEach(({ state, name }) => {
      if (state) {
        DevTools.trackState(state, name);
      }
    });
  }
  
  static getReport() {
    return {
      timestamp: Date.now(),
      states: DevTools.getStates(),
      recentChanges: DevTools.getHistory().slice(-20),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }
}

// Admin can enable via console:
// > ProductionDebug.enable('secure_debug_2024')
```

 

## Best Practices

### ✅ Complete Workflow Checklist

```javascript
// 1. Start with clean slate
DevTools.enable();
DevTools.clearHistory();

// 2. Track relevant states
DevTools.trackState(criticalState, 'CriticalState');

// 3. Track key effects
DevTools.trackEffect(importantEffect, 'ImportantEffect');

// 4. Reproduce issue
// ... perform actions ...

// 5. Inspect results
const history = DevTools.getHistory();
const states = DevTools.getStates();

// 6. Analyze data
console.log('Analysis:', {
  totalChanges: history.length,
  statesTracked: states.length
});

// 7. Export if needed
const report = { history, states };

// 8. Clean up
DevTools.disable();
DevTools.clearHistory();
```

 

## Summary

**Complete Workflows Covered:**
- ✅ Basic debugging
- ✅ Multi-state investigation
- ✅ Effect performance analysis
- ✅ Scenario-based debugging
- ✅ Integration patterns
- ✅ Performance optimization
- ✅ Production debugging

**Key Takeaways:**

```
1. Enable → Track → Reproduce → Inspect → Analyze → Clean up
2. Use descriptive names
3. Track selectively
4. Clear history regularly
5. Export data when needed
6. Disable when done
```

**One-Line Rule:** Follow proven workflows to debug efficiently and thoroughly.

**Remember:** DevTools is most powerful when used systematically! 🎉