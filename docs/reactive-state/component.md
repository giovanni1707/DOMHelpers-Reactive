# Understanding `component()` - A Beginner's Guide

## Quick Start (30 seconds)

Need a complete component with state, computed values, effects, and lifecycle? Here's how:

```js
// Create a counter component
const counter = component({
  state: {
    count: 0
  },
  computed: {
    doubled() {
      return this.count * 2;
    }
  },
  effects: {
    logCount() {
      console.log('Count:', this.count);
    }
  },
  actions: {
    increment(state) {
      state.count++;
    }
  },
  bindings: {
    '#count': 'count',
    '#doubled': 'doubled'
  },
  mounted() {
    console.log('Component mounted!');
  }
});

// Use the component
counter.increment();
console.log(counter.count);   // 1
console.log(counter.doubled); // 2

// Clean up when done
destroy(counter);
```

**That's it!** The `component()` function creates a complete reactive component with state, computed properties, effects, actions, bindings, and lifecycle hooks!

 

## What is `component()`?

`component()` is a function for creating **self-contained reactive components** with a complete lifecycle. It combines state, computed properties, watchers, effects, actions, DOM bindings, and lifecycle hooks into one organized unit.

**A reactive component:**
- Manages its own state
- Has computed properties
- Watches for changes
- Runs side effects
- Defines action methods
- Binds to DOM elements
- Has mounted/unmounted lifecycle hooks
- Can be destroyed and cleaned up

Think of it as a **mini application** - it's a complete, self-contained unit with everything it needs to function.

 

## Syntax

```js
// Using the shortcut
component(config)

// Using the full namespace
ReactiveUtils.component(config)
```

**Both styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`component()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.component()`) - Explicit and clear

**Parameters:**
- `config` - Configuration object with:
  - `state` - Initial state object
  - `computed` - Computed property definitions
  - `watch` - Watcher definitions
  - `effects` - Effect definitions
  - `actions` - Action method definitions
  - `bindings` - DOM binding definitions
  - `mounted` - Lifecycle hook called after creation
  - `unmounted` - Lifecycle hook called before destruction

**Returns:**
- A reactive component object with all features and a `destroy()` method (via Module 09)

 

## Why Does This Exist?

### Two Approaches to Building Components

The Reactive library offers flexible ways to create reactive components, each suited to different organizational preferences.

### Incremental Component Building

When you need **granular control** over component creation and prefer to compose features step-by-step:
```javascript
// Build component incrementally
const counter = state({ count: 0 });

// Add computed properties as needed
computed(counter, {
  doubled() { return this.count * 2; }
});

// Add watchers when required
const cleanup1 = watch(counter, {
  count(newVal, oldVal) {
    console.log('Count changed:', newVal);
  }
});

// Add effects for specific behaviors
const cleanup2 = effect(() => {
  document.getElementById('count').textContent = counter.count;
});

// Define actions directly
counter.increment = function() {
  this.count++;
};

// Manage cleanup yourself
const cleanups = [cleanup1, cleanup2];
function destroyCounter() {
  cleanups.forEach(c => c());
}
```

**This approach is great when you need:**
✅ Step-by-step feature composition
✅ Granular control over what gets added
✅ Flexibility to mix and match features
✅ Direct access to individual reactive utilities

### When Structured, All-in-One Definitions Fit Your Style

In scenarios where you want **organized, self-contained components** with all features declared together, `component()` provides a more direct approach:
```javascript
// Structured component with all features declared
const counter = component({
  state: { count: 0 },

  computed: {
    doubled() { return this.count * 2; }
  },

  watch: {
    count(newVal, oldVal) {
      console.log('Count changed:', newVal);
    }
  },

  effects: {
    updateDOM() {
      document.getElementById('count').textContent = this.count;
    }
  },

  actions: {
    increment(state) {
      state.count++;
    }
  },

  mounted() {
    console.log('Counter ready!');
  }
});

// Automatic cleanup tracking
destroy(counter);
```

**This method is especially useful when:**
```
Component Structure:
┌──────────────────────┐
│   component({...})   │
└──────────┬───────────┘
           │
           ▼
   All features organized:
   • State
   • Computed
   • Watchers
   • Effects
   • Actions
   • Lifecycle
           │
           ▼
  ✅ Self-contained & clear
```

**Where component() shines:**
✅ **Organized structure** - All features grouped in one object
✅ **Lifecycle hooks** - Built-in `mounted()` and cleanup via `$destroy()`
✅ **Automatic cleanup** - Tracks and manages all effects and watchers
✅ **Self-contained** - Everything about the component in one place
✅ **Portable** - Easy to move or reuse complete components

**The Choice is Yours:**
- Use incremental building when you need granular control and flexibility
- Use `component()` when you prefer structured, all-in-one declarations
- Both approaches create fully reactive components with the same capabilities

**Benefits of the component approach:**
✅ **Single declaration** - All features defined in one object
✅ **Clear organization** - Features grouped by type (state, computed, actions, etc.)
✅ **Built-in lifecycle** - `mounted()` and `$destroy()` hooks included
✅ **Automatic cleanup** - No need to manually track cleanup functions
✅ **Self-documenting** - Component structure is immediately clear
## Mental Model

Think of `component()` like a **smart appliance**:

```
Manual Setup (DIY Assembly):
┌──────────────┐
│ Buy parts    │ ← State
│ Wire circuits│ ← Computed
│ Add sensors  │ ← Watchers
│ Connect power│ ← Effects
│ Add controls │ ← Actions
│ Read manual  │ ← Lifecycle
└──────────────┘
  Assembly required!
  Easy to mess up!

Component (Ready-to-Use):
┌────────────────────────────────┐
│   Smart Appliance              │
│   ┌──────────────────┐         │
│   │ Pre-assembled    │         │
│   │ Pre-wired        │         │
│   │ Pre-configured   │         │
│   └──────────────────┘         │
│                                │
│   Features:                    │
│   ✓ Power switch (mounted)     │
│   ✓ Auto-controls (computed)   │
│   ✓ Sensors (watchers)         │
│   ✓ Display (effects)          │
│   ✓ Buttons (actions)          │
│   ✓ Auto-shutdown (destroy)    │
└────────────────────────────────┘
         │
         ▼
   Plug and play!
   Everything works!
```

**Key Insight:** Just like a smart appliance that comes pre-assembled with all features ready to use, `component()` creates a complete, ready-to-use reactive component with all features integrated.

 

## How Does It Work?

### The Magic: Complete Integration

When you call `component()`, here's what happens behind the scenes:

```javascript
// What you write:
const myComponent = component({
  state: { count: 0 },
  computed: { doubled() { return this.count * 2; } },
  watch: { count(newVal) { console.log(newVal); } },
  effects: { logCount() { console.log(this.count); } },
  actions: { increment(state) { state.count++; } },
  mounted() { console.log('Mounted!'); }
});

// What actually happens (simplified):
// 1. Create state
const myComponent = state({ count: 0 });

// 2. Add computed
computed(myComponent, {
  doubled() { return this.count * 2; }
});

// 3. Add watchers
const watchCleanup = watch(myComponent, {
  count(newVal) { console.log(newVal); }
});

// 4. Add effects
const effectCleanup = effect(() => {
  console.log(myComponent.count);
});

// 5. Add actions
myComponent.increment = function() { this.count++; };

// 6. Track cleanups
const cleanups = [watchCleanup, effectCleanup];

// 7. Call mounted
if (config.mounted) config.mounted.call(myComponent);

// 8. Add destroy method (Module 09)
myComponent.destroy = () => cleanups.forEach(c => c());
```

**In other words:** `component()` is an orchestrator that:
1. Creates reactive state
2. Adds all computed properties
3. Sets up all watchers
4. Creates all effects
5. Attaches action methods
6. Sets up DOM bindings
7. Calls lifecycle hooks
8. Tracks cleanups for destruction
9. Returns a complete, ready-to-use component

 

## Basic Usage

### Creating a Component

The simplest way to use `component()`:

```js
// Minimal component
const simpleComponent = component({
  state: {
    message: 'Hello'
  }
});

// Component with computed
const counterComponent = component({
  state: { count: 0 },
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
});

// Full-featured component
const todoComponent = component({
  state: {
    todos: [],
    filter: 'all'
  },
  computed: {
    filteredTodos() {
      if (this.filter === 'all') return this.todos;
      if (this.filter === 'active') return this.todos.filter(t => !t.done);
      return this.todos.filter(t => t.done);
    }
  },
  actions: {
    addTodo(state, text) {
      state.todos.push({ id: Date.now(), text, done: false });
    },
    toggleTodo(state, id) {
      const todo = state.todos.find(t => t.id === id);
      if (todo) todo.done = !todo.done;
    }
  },
  mounted() {
    console.log('Todo component ready!');
  }
});
```

 

## Component Structure

A component can have these parts (all optional except state):

### 1. State (Typically Required)

The reactive data:

```js
{
  state: {
    count: 0,
    message: 'Hello'
  }
}
```

### 2. Computed (Optional)

Derived values:

```js
{
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
}
```

### 3. Watch (Optional)

React to state changes:

```js
{
  watch: {
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  }
}
```

### 4. Effects (Optional)

Side effects:

```js
{
  effects: {
    updateTitle() {
      document.title = `Count: ${this.count}`;
    }
  }
}
```

### 5. Actions (Optional)

Methods:

```js
{
  actions: {
    increment(state) {
      state.count++;
    }
  }
}
```

### 6. Bindings (Optional)

DOM bindings:

```js
{
  bindings: {
    '#count': 'count',
    '#doubled': 'doubled'
  }
}
```

### 7. Mounted (Optional)

Lifecycle hook:

```js
{
  mounted() {
    console.log('Component ready!');
  }
}
```

### 8. Unmounted (Optional)

Cleanup hook:

```js
{
  unmounted() {
    console.log('Component destroyed!');
  }
}
```

 

## State

State is the reactive data in your component:

```js
const myComponent = component({
  state: {
    count: 0,
    name: 'John',
    isActive: true
  }
});

// Access state
console.log(myComponent.count); // 0
console.log(myComponent.name);  // "John"

// Modify state
myComponent.count = 5;
myComponent.name = 'Jane';
```

 

## Computed Properties

Computed properties are derived from state:

```js
const userComponent = component({
  state: {
    firstName: 'John',
    lastName: 'Doe',
    age: 25
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
    isAdult() {
      return this.age >= 18;
    },
    greeting() {
      return `Hello, ${this.fullName}!`;
    }
  }
});

console.log(userComponent.fullName); // "John Doe"
console.log(userComponent.isAdult);  // true
console.log(userComponent.greeting); // "Hello, John Doe!"
```

 

## Watchers

Watchers react to state changes:

```js
const formComponent = component({
  state: {
    email: '',
    password: ''
  },
  watch: {
    email(newVal, oldVal) {
      console.log(`Email changed: ${oldVal} → ${newVal}`);
    },
    password(newVal) {
      if (newVal.length < 6) {
        console.warn('Password too short!');
      }
    }
  }
});

formComponent.email = 'john@example.com';
// Logs: "Email changed:  → john@example.com"

formComponent.password = '123';
// Warns: "Password too short!"
```

 

## Effects

Effects run side effects when dependencies change:

```js
const appComponent = component({
  state: {
    count: 0,
    theme: 'light'
  },
  effects: {
    updateTitle() {
      document.title = `Count: ${this.count}`;
    },
    updateTheme() {
      document.body.className = this.theme;
    },
    logChanges() {
      console.log(`Count: ${this.count}, Theme: ${this.theme}`);
    }
  }
});

appComponent.count = 5;
// Title updates to "Count: 5"
// Console logs: "Count: 5, Theme: light"

appComponent.theme = 'dark';
// Body className becomes "dark"
// Console logs: "Count: 5, Theme: dark"
```

 

## Actions

Actions are methods that modify state:

```js
const counterComponent = component({
  state: { count: 0 },
  actions: {
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    incrementBy(state, amount) {
      state.count += amount;
    },
    reset(state) {
      state.count = 0;
    }
  }
});

counterComponent.increment();
console.log(counterComponent.count); // 1

counterComponent.incrementBy(5);
console.log(counterComponent.count); // 6

counterComponent.reset();
console.log(counterComponent.count); // 0
```

 

## Bindings

Bindings automatically sync state to DOM:

```js
// HTML:
// <div id="count"></div>
// <div id="message"></div>

const myComponent = component({
  state: {
    count: 0,
    message: 'Hello'
  },
  bindings: {
    '#count': 'count',
    '#message': 'message'
  }
});

// DOM automatically shows:
// #count: "0"
// #message: "Hello"

myComponent.count = 5;
// #count automatically updates to "5"

myComponent.message = 'Hi';
// #message automatically updates to "Hi"
```

 

## Lifecycle Hooks

### `mounted()`

Called after component is created:

```js
const appComponent = component({
  state: { data: null },

  async mounted() {
    console.log('Component mounted!');

    // Fetch initial data
    const response = await fetch('/api/data');
    this.data = await response.json();

    // Set up listeners
    window.addEventListener('resize', this.handleResize);
  }
});
```

### `unmounted()`

Called before component is destroyed:

```js
const appComponent = component({
  state: { timer: null },

  mounted() {
    this.timer = setInterval(() => {
      console.log('Tick');
    }, 1000);
  },

  unmounted() {
    console.log('Component unmounting!');

    // Clean up timer
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
});

// Later, destroy the component
destroy(appComponent);
// Logs: "Component unmounting!"
// Timer is cleaned up
```

 

## Cleanup

### `destroy(component)` (Module 09)

Destroy a component and clean up all resources:

```js
const myComponent = component({
  state: { count: 0 },

  effects: {
    logCount() {
      console.log(this.count);
    }
  },

  mounted() {
    console.log('Mounted!');
  },

  unmounted() {
    console.log('Destroyed!');
  }
});

// Component is active
myComponent.count = 5; // Effect logs: "5"

// Destroy component
destroy(myComponent);
// Logs: "Destroyed!"
// All effects, watchers cleaned up

myComponent.count = 10; // Effect doesn't log (destroyed)
```

 

## Common Patterns

### Pattern: Counter Component

```js
const counterComponent = component({
  state: {
    count: 0,
    step: 1
  },

  computed: {
    doubled() {
      return this.count * 2;
    },
    isPositive() {
      return this.count > 0;
    }
  },

  watch: {
    count(newVal) {
      if (newVal > 100) {
        console.warn('Count is getting high!');
      }
    }
  },

  effects: {
    updateDisplay() {
      document.getElementById('count').textContent = this.count;
      document.getElementById('doubled').textContent = this.doubled;
    }
  },

  actions: {
    increment(state) {
      state.count += state.step;
    },
    decrement(state) {
      state.count -= state.step;
    },
    reset(state) {
      state.count = 0;
    },
    setStep(state, newStep) {
      state.step = newStep;
    }
  },

  bindings: {
    '#count': 'count',
    '#doubled': 'doubled'
  },

  mounted() {
    console.log('Counter ready!');
  }
});

// Wire up buttons
document.getElementById('increment').onclick = () => counterComponent.increment();
document.getElementById('decrement').onclick = () => counterComponent.decrement();
document.getElementById('reset').onclick = () => counterComponent.reset();
```

### Pattern: Form Component

```js
const loginComponent = component({
  state: {
    email: '',
    password: '',
    errors: {},
    isSubmitting: false
  },

  computed: {
    isValid() {
      return this.email && this.password.length >= 6;
    },
    hasErrors() {
      return Object.keys(this.errors).length > 0;
    }
  },

  watch: {
    email(newVal) {
      if (newVal && !newVal.includes('@')) {
        this.errors = { ...this.errors, email: 'Invalid email' };
      } else {
        const { email, ...rest } = this.errors;
        this.errors = rest;
      }
    },
    password(newVal) {
      if (newVal && newVal.length < 6) {
        this.errors = { ...this.errors, password: 'Too short' };
      } else {
        const { password, ...rest } = this.errors;
        this.errors = rest;
      }
    }
  },

  actions: {
    async submit(state) {
      if (!this.isValid) return;

      state.isSubmitting = true;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.email,
            password: state.password
          })
        });

        const data = await response.json();
        console.log('Login success:', data);
      } catch (error) {
        state.errors = { submit: error.message };
      } finally {
        state.isSubmitting = false;
      }
    },

    reset(state) {
      state.email = '';
      state.password = '';
      state.errors = {};
    }
  },

  effects: {
    updateSubmitButton() {
      const btn = document.getElementById('submitBtn');
      btn.disabled = !this.isValid || this.isSubmitting;
      btn.textContent = this.isSubmitting ? 'Logging in...' : 'Login';
    }
  }
});
```

### Pattern: Timer Component

```js
const timerComponent = component({
  state: {
    seconds: 0,
    isRunning: false,
    intervalId: null
  },

  computed: {
    formattedTime() {
      const mins = Math.floor(this.seconds / 60);
      const secs = this.seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  },

  actions: {
    start(state) {
      if (state.isRunning) return;

      state.isRunning = true;
      state.intervalId = setInterval(() => {
        state.seconds++;
      }, 1000);
    },

    stop(state) {
      if (!state.isRunning) return;

      state.isRunning = false;
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    },

    reset(state) {
      this.stop(state);
      state.seconds = 0;
    }
  },

  bindings: {
    '#timer': 'formattedTime'
  },

  unmounted() {
    // Clean up interval on destroy
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
});
```

 

## Common Pitfalls

### Pitfall #1: Arrow Functions in Computed/Effects

❌ **Wrong:**
```js
component({
  state: { count: 0 },
  computed: {
    // Arrow function: 'this' is wrong!
    doubled: () => this.count * 2
  }
});
```

✅ **Correct:**
```js
component({
  state: { count: 0 },
  computed: {
    // Regular function: 'this' works!
    doubled() {
      return this.count * 2;
    }
  }
});
```

 

### Pitfall #2: Forgetting to Call destroy()

❌ **Wrong:**
```js
const myComponent = component({ state: { count: 0 } });

// Component keeps running forever
// Memory leak!
```

✅ **Correct:**
```js
const myComponent = component({ state: { count: 0 } });

// Clean up when done
destroy(myComponent);
```

 

### Pitfall #3: Modifying State in Computed

❌ **Wrong:**
```js
component({
  state: { count: 0, doubled: 0 },
  computed: {
    doubled() {
      // Don't modify state in computed!
      this.doubled = this.count * 2;
      return this.doubled;
    }
  }
});
```

✅ **Correct:**
```js
component({
  state: { count: 0 },
  computed: {
    // Just return the computed value
    doubled() {
      return this.count * 2;
    }
  }
});
```

 

### Pitfall #4: Not Cleaning Up in unmounted

❌ **Wrong:**
```js
component({
  state: { intervalId: null },
  mounted() {
    this.intervalId = setInterval(() => {
      console.log('Tick');
    }, 1000);
  }
  // Forgot to clean up!
});
```

✅ **Correct:**
```js
component({
  state: { intervalId: null },
  mounted() {
    this.intervalId = setInterval(() => {
      console.log('Tick');
    }, 1000);
  },
  unmounted() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
});
```

 

## Summary

**What is `component()`?**

`component()` creates a **self-contained reactive component** with state, computed properties, watchers, effects, actions, bindings, and lifecycle hooks.

 

**Why use `component()` instead of manual setup?**

- All-in-one declaration
- Clear, organized structure
- Automatic cleanup tracking
- Built-in lifecycle hooks
- Self-contained and portable
- Everything in one place

 

**Key Points to Remember:**

1️⃣ **All-in-one** - State, computed, watch, effects, actions, bindings
2️⃣ **Use regular functions** - Not arrow functions for `this` context
3️⃣ **Lifecycle hooks** - mounted() and unmounted()
4️⃣ **Always destroy** - Call destroy() when done
5️⃣ **Clean up resources** - Use unmounted() hook

 

**Mental Model:** Think of `component()` as a **smart appliance** - it comes pre-assembled with all features integrated and ready to use.

 

**Quick Reference:**

```js
// Create
const myComponent = component({
  // State
  state: {
    count: 0
  },

  // Computed
  computed: {
    doubled() {
      return this.count * 2;
    }
  },

  // Watchers
  watch: {
    count(newVal, oldVal) {
      console.log('Changed:', newVal);
    }
  },

  // Effects
  effects: {
    logCount() {
      console.log(this.count);
    }
  },

  // Actions
  actions: {
    increment(state) {
      state.count++;
    }
  },

  // Bindings
  bindings: {
    '#count': 'count'
  },

  // Lifecycle
  mounted() {
    console.log('Ready!');
  },

  unmounted() {
    console.log('Destroyed!');
  }
});

// Use
myComponent.increment();

// Destroy (Module 09)
destroy(myComponent);
```

 

**Remember:** `component()` is your complete component pattern. It gives you everything you need in one organized, self-contained unit with automatic lifecycle management!
