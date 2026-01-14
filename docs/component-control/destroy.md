# Understanding `ReactiveUtils.destroy(component)` - A Beginner's Guide

## Quick Start (30 seconds)

Need to destroy a component and clean up all its resources? Use `ReactiveUtils.destroy()`:

```js
// Create a component with effects and watchers
const counter = component({
  state: { count: 0 },
  effects: {
    logCount() {
      console.log('Count:', this.count);
    }
  },
  watch: {
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    }
  },
  actions: {
    increment(state) {
      state.count++;
    }
  }
});

// Logs: "Count: 0"

counter.increment();
// Logs: "Count: 0 → 1"
// Logs: "Count: 1"

// Destroy the component and clean up all resources
ReactiveUtils.destroy(counter);

// Now effects and watchers won't run
counter.increment();
// Nothing logged (component destroyed)
```

**That's it!** `ReactiveUtils.destroy()` destroys a component and cleans up all its effects, watchers, and bindings!

 

## What is `ReactiveUtils.destroy()`?

`ReactiveUtils.destroy()` is a **utility function** that **completely destroys a reactive component** created with `component()`, cleaning up all effects, watchers, bindings, and other resources. It's part of the ReactiveUtils namespace (Module 09).

**This function:**
- Takes a component as a parameter
- Stops all effects from running
- Removes all watchers
- Cleans up all DOM bindings
- Calls lifecycle `onDestroy` hook if defined
- Prevents memory leaks
- Makes the component unusable

Think of it as **decommissioning a component** - it shuts down all reactive systems, cleans up resources, and marks the component as destroyed.

 

## Syntax

```js
// Using the namespace
ReactiveUtils.destroy(component)

// Full example
const myComponent = component({
  state: { count: 0 },
  effects: {
    logCount() {
      console.log('Count:', this.count);
    }
  }
});

// Destroy the component
ReactiveUtils.destroy(myComponent);
```

**Parameters:**
- `component` - A reactive component created with `component()` (required)

**Returns:**
- Nothing (`undefined`)

**Important:**
- Works specifically with components from `component()`
- Stops all effects, watchers, and bindings
- Calls `onDestroy` lifecycle hook if present
- Component becomes unusable after destruction
- Safe to call multiple times

 

## Why Does This Exist?

### The Problem with Undestroyed Components

Let's say you create components but never destroy them:

```javascript
function createManyComponents() {
  for (let i = 0; i < 100; i++) {
    const comp = component({
      state: { id: i, count: 0 },
      effects: {
        logCount() {
          console.log(`Component ${this.id}: Count ${this.count}`);
        }
      }
    });

    // Oops! Never destroyed the component
    // Effects keep running forever!
  }
}

createManyComponents();
// 100 components with active effects
// Memory leak!
// Performance degradation!
```

**What's the Real Issue?**

```
Without destroy():
┌──────────────────────┐
│ Component 1          │
│  + Effect ───────────┼──→ Running forever
│  + Watchers ─────────┼──→ Active forever
└──────────────────────┘

┌──────────────────────┐
│ Component 2          │
│  + Effect ───────────┼──→ Running forever
│  + Watchers ─────────┼──→ Active forever
└──────────────────────┘

┌──────────────────────┐
│ Component 3          │
│  + Effect ───────────┼──→ Running forever
│  + Watchers ─────────┼──→ Active forever
└──────────────────────┘

All components active!
Memory leak!
CPU waste!
```

**Problems:**
❌ Components never clean up
❌ Effects run forever
❌ Watchers stay active
❌ Memory leaks
❌ Performance degradation
❌ No lifecycle management
❌ Resources not freed

### The Solution with `ReactiveUtils.destroy()`

When you use `ReactiveUtils.destroy()`, components are properly cleaned up:

```javascript
function createManyComponents() {
  const components = [];

  for (let i = 0; i < 100; i++) {
    const comp = component({
      state: { id: i, count: 0 },
      effects: {
        logCount() {
          console.log(`Component ${this.id}: Count ${this.count}`);
        }
      }
    });

    components.push(comp);
  }

  // Clean up all components when done
  components.forEach(comp => {
    ReactiveUtils.destroy(comp);
  });
}

createManyComponents();
// All components properly destroyed
// No memory leaks!
// Resources freed!
```

**What Just Happened?**

```
With destroy():
┌──────────────────────┐
│ Component 1          │
│  + Effect            │──→ Running
│  + Watchers          │──→ Active
└──────────┬───────────┘
           │ destroy(comp1)
           ▼
        Stopped ✓

┌──────────────────────┐
│ Component 2          │
│  + Effect            │──→ Running
│  + Watchers          │──→ Active
└──────────┬───────────┘
           │ destroy(comp2)
           ▼
        Stopped ✓

Clean memory!
No leaks!
Resources freed!
```

With `ReactiveUtils.destroy()`:
- Components properly cleaned up
- All effects stopped
- All watchers removed
- Memory freed
- Resources released
- Lifecycle hooks called
- Clean component lifecycle

**Benefits:**
✅ Complete component cleanup
✅ Prevents memory leaks
✅ Stops all reactive systems
✅ Calls lifecycle hooks
✅ Frees resources
✅ Proper component lifecycle
✅ Better performance

 

## Mental Model

Think of `ReactiveUtils.destroy()` like **decommissioning a factory**:

```
Active Factory (Component):
┌─────────────────────────┐
│  Factory                │
│  ⚙️  Machines Running   │
│  👷 Workers Active      │
│  🔌 Power On           │
│  💡 Lights On          │
│  📊 Monitoring Active  │
│  🚨 Alarms Active      │
└─────────────────────────┘
    Everything running!
    Using resources!

Decommission (destroy()):
┌─────────────────────────┐
│  Factory                │
└──────────┬──────────────┘
           │ destroy()
           │
           ├─→ Stop machines
           ├─→ Dismiss workers
           ├─→ Cut power
           ├─→ Turn off lights
           ├─→ Disable monitoring
           ├─→ Deactivate alarms
           │
           ▼
┌─────────────────────────┐
│  Decommissioned         │
│  ⚫ All systems OFF     │
│  🔒 Facility Closed     │
│  🧹 Cleaned up         │
└─────────────────────────┘
    Everything stopped!
    Resources freed!
    Clean shutdown!
```

**Key Insight:** Just like decommissioning a factory involves systematically shutting down all systems, cleaning up, and releasing resources, `ReactiveUtils.destroy()` systematically shuts down all reactive systems in a component and releases all resources!

 

## How Does It Work?

### The Magic: Complete Component Cleanup

When you call `ReactiveUtils.destroy()`, here's what happens behind the scenes:

```javascript
// What you write:
const counter = component({
  state: { count: 0 },
  effects: {
    logCount() {
      console.log('Count:', this.count);
    }
  },
  onDestroy() {
    console.log('Component destroyed');
  }
});

ReactiveUtils.destroy(counter);

// What actually happens (simplified):
function destroy(component) {
  // 1. Check if already destroyed
  if (component.__destroyed) {
    return; // Already destroyed, do nothing
  }

  // 2. Call onDestroy lifecycle hook
  if (component.onDestroy) {
    component.onDestroy.call(component);
  }

  // 3. Clean up all effects
  if (component.__cleanups) {
    component.__cleanups.forEach(cleanup => {
      cleanup(); // Stop each effect
    });
    component.__cleanups = [];
  }

  // 4. Remove all watchers
  if (component.__watchers) {
    component.__watchers.forEach(watcher => {
      watcher.stop(); // Stop each watcher
    });
    component.__watchers = [];
  }

  // 5. Clean up all bindings
  if (component.__bindings) {
    component.__bindings.forEach(binding => {
      binding.cleanup(); // Remove each binding
    });
    component.__bindings = [];
  }

  // 6. Mark as destroyed
  component.__destroyed = true;
}
```

**In other words:** `ReactiveUtils.destroy()`:
1. Checks if component is already destroyed
2. Calls `onDestroy` lifecycle hook
3. Stops all effects
4. Removes all watchers
5. Cleans up all bindings
6. Marks component as destroyed
7. Frees all resources

### Under the Hood

```
ReactiveUtils.destroy(component)
        │
        ▼
┌───────────────────────┐
│  Check if Destroyed   │
│  (Skip if yes)        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Call onDestroy Hook  │
│  (Lifecycle)          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Stop All Effects     │
│  (Run cleanups)       │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Remove All Watchers  │
│  (Stop watching)      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Clean Up Bindings    │
│  (Remove DOM sync)    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Mark as Destroyed    │
│  (__destroyed = true) │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Complete!            │
│  ✓ All cleaned up     │
│  ✓ Resources freed    │
└───────────────────────┘
```

**What happens:**

1️⃣ Function is **called** with component
2️⃣ **onDestroy** hook runs (if defined)
3️⃣ All **effects** are stopped
4️⃣ All **watchers** are removed
5️⃣ All **bindings** are cleaned up
6️⃣ Component is **marked** as destroyed

 

## Basic Usage

### Destroying a Simple Component

The simplest way to use `ReactiveUtils.destroy()`:

```js
// Create a component
const counter = component({
  state: { count: 0 },
  effects: {
    logCount() {
      console.log('Count:', this.count);
    }
  }
});

// Logs: "Count: 0"

counter.count = 5;
// Logs: "Count: 5"

// Destroy the component
ReactiveUtils.destroy(counter);

counter.count = 10;
// Nothing logged (component destroyed)
```

### Destroying with Lifecycle Hook

```js
const counter = component({
  state: { count: 0 },
  effects: {
    logCount() {
      console.log('Count:', this.count);
    }
  },
  onDestroy() {
    console.log('Component is being destroyed');
    // Perform cleanup
  }
});

ReactiveUtils.destroy(counter);
// Logs: "Component is being destroyed"
```

### Destroying Multiple Components

```js
const components = [];

// Create multiple components
for (let i = 0; i < 5; i++) {
  const comp = component({
    state: { id: i, value: 0 },
    effects: {
      logValue() {
        console.log(\`Component \${this.id}: \${this.value}\`);
      }
    }
  });
  components.push(comp);
}

// Destroy all components
components.forEach(comp => {
  ReactiveUtils.destroy(comp);
});
```

 

## What Gets Destroyed

### Effects

All effects defined in the component are stopped:

```js
const app = component({
  state: { count: 0 },
  effects: {
    effect1() {
      console.log('Effect 1:', this.count);
    },
    effect2() {
      console.log('Effect 2:', this.count * 2);
    }
  }
});

app.count = 5; // Both effects run

ReactiveUtils.destroy(app);

app.count = 10; // No effects run
```

### Watchers

All watchers are removed:

```js
const app = component({
  state: { count: 0 },
  watch: {
    count(newVal, oldVal) {
      console.log(\`Count: \${oldVal} → \${newVal}\`);
    }
  }
});

app.count = 5; // Watcher runs

ReactiveUtils.destroy(app);

app.count = 10; // Watcher doesn't run
```

### DOM Bindings

All DOM bindings are cleaned up:

```js
// HTML: <div id="counter"></div>

const app = component({
  state: { count: 0 },
  bindings: {
    '#counter': 'count'
  }
});

app.count = 5; // DOM updates

ReactiveUtils.destroy(app);

app.count = 10; // DOM doesn't update
```

### Lifecycle Hooks

The \`onDestroy\` hook is called:

```js
const app = component({
  state: { count: 0 },
  onMount() {
    console.log('Component mounted');
  },
  onDestroy() {
    console.log('Component destroyed');
    // Clean up subscriptions, timers, etc.
  }
});

ReactiveUtils.destroy(app);
// Logs: "Component destroyed"
```

### Computed Properties (Special Case)

Computed properties still exist but their internal tracking is cleaned up:

```js
const app = component({
  state: { count: 0 },
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
});

console.log(app.doubled); // Works before destroy

ReactiveUtils.destroy(app);

console.log(app.doubled); // Still accessible, but no longer reactive
```

 

## When to Use destroy()

### Component Unmounting in Frameworks

```js
// React example
function CounterComponent() {
  const [counter] = React.useState(() =>
    component({
      state: { count: 0 },
      effects: {
        updateTitle() {
          document.title = \`Count: \${this.count}\`;
        }
      }
    })
  );

  // Clean up when component unmounts
  React.useEffect(() => {
    return () => {
      ReactiveUtils.destroy(counter);
    };
  }, []);

  return <div>{counter.count}</div>;
}
```

### Single Page Application Navigation

```js
class Router {
  constructor() {
    this.currentComponent = null;
  }

  navigate(route) {
    // Destroy previous component
    if (this.currentComponent) {
      ReactiveUtils.destroy(this.currentComponent);
    }

    // Create new component for route
    this.currentComponent = this.createComponentForRoute(route);
  }

  createComponentForRoute(route) {
    return component({
      state: { route },
      effects: {
        render() {
          console.log('Rendering:', this.route);
        }
      }
    });
  }
}

const router = new Router();
router.navigate('/home');
router.navigate('/about'); // Destroys /home component
```

### Temporary Components

```js
function showModal(config) {
  const modal = component({
    state: { isOpen: true, ...config },
    effects: {
      render() {
        if (this.isOpen) {
          renderModalUI(this);
        }
      }
    },
    actions: {
      close(state) {
        state.isOpen = false;
        // Destroy modal after closing
        setTimeout(() => {
          ReactiveUtils.destroy(modal);
        }, 300); // Wait for animation
      }
    }
  });

  return modal;
}

const modal = showModal({ title: 'Confirm', message: 'Are you sure?' });
modal.close(); // Destroys modal after animation
```

### Component Pools

```js
class ComponentPool {
  constructor() {
    this.pool = [];
  }

  create(config) {
    const comp = component(config);
    this.pool.push(comp);
    return comp;
  }

  destroyAll() {
    this.pool.forEach(comp => {
      ReactiveUtils.destroy(comp);
    });
    this.pool = [];
  }

  destroy(comp) {
    ReactiveUtils.destroy(comp);
    this.pool = this.pool.filter(c => c !== comp);
  }
}

const pool = new ComponentPool();
const comp1 = pool.create({ state: { value: 1 } });
const comp2 = pool.create({ state: { value: 2 } });

// Destroy all components in pool
pool.destroyAll();
```

 

## ReactiveUtils.destroy() vs Other Destroy Methods

### When to Use \`ReactiveUtils.destroy()\`

Use \`ReactiveUtils.destroy()\` when working with **components from \`component()\`**:

✅ Components created with \`component()\`
✅ Full lifecycle hook support
✅ Complex components with many features
✅ Need centralized component cleanup
✅ Framework integration

```js
const myComponent = component({
  state: { count: 0 },
  effects: { logCount() { console.log(this.count); } },
  onDestroy() { console.log('Cleanup'); }
});

ReactiveUtils.destroy(myComponent); // ✅ Use this
```

### When to Use \`builtObject.destroy()\`

Use \`builtObject.destroy()\` when working with **builders**:

✅ Objects from \`reactive().build()\`
✅ Builder pattern approach
✅ Simpler reactive objects
✅ No lifecycle hooks needed
✅ Direct object cleanup

```js
const myObject = reactive({ count: 0 })
  .effect(() => console.log(myObject.state.count))
  .build();

myObject.destroy(); // ✅ Use this
```

### Quick Comparison

```javascript
// ✅ ReactiveUtils.destroy() - For components
const comp = component({
  state: { count: 0 },
  effects: { log() { console.log(this.count); } },
  onDestroy() { console.log('Destroyed'); }
});

ReactiveUtils.destroy(comp); // Calls onDestroy hook

// ✅ builtObject.destroy() - For builders
const obj = reactive({ count: 0 })
  .effect(() => console.log(obj.state.count))
  .build();

obj.destroy(); // No lifecycle hooks
```

**Simple Rule:**
- **Created with \`component()\`?** Use \`ReactiveUtils.destroy()\`
- **Created with \`reactive().build()\`?** Use \`builtObject.destroy()\`
- **Both work similarly** - just different contexts

 

## Common Patterns

### Pattern: Component Manager

```js
class ComponentManager {
  constructor() {
    this.components = new Map();
  }

  register(id, config) {
    const comp = component(config);
    this.components.set(id, comp);
    return comp;
  }

  destroy(id) {
    const comp = this.components.get(id);
    if (comp) {
      ReactiveUtils.destroy(comp);
      this.components.delete(id);
    }
  }

  destroyAll() {
    this.components.forEach((comp, id) => {
      ReactiveUtils.destroy(comp);
    });
    this.components.clear();
  }
}

const manager = new ComponentManager();
manager.register('counter', {
  state: { count: 0 },
  effects: { log() { console.log('Count:', this.count); } }
});

// Later...
manager.destroy('counter');
```

### Pattern: Cleanup on Error

```js
function createComponent(config) {
  let comp = null;

  try {
    comp = component(config);

    // Simulate error during initialization
    if (config.throwError) {
      throw new Error('Initialization failed');
    }

    return comp;
  } catch (error) {
    // Clean up on error
    if (comp) {
      ReactiveUtils.destroy(comp);
    }
    throw error;
  }
}

try {
  const comp = createComponent({
    state: { value: 0 },
    throwError: true
  });
} catch (error) {
  console.error('Failed to create component:', error.message);
  // Component was properly cleaned up
}
```

### Pattern: Automatic Cleanup After Timeout

```js
function createTemporaryComponent(config, lifetime = 5000) {
  const comp = component(config);

  // Auto-destroy after timeout
  setTimeout(() => {
    console.log('Component lifetime expired');
    ReactiveUtils.destroy(comp);
  }, lifetime);

  return comp;
}

const temp = createTemporaryComponent({
  state: { message: 'Temporary' },
  effects: {
    log() {
      console.log('Message:', this.message);
    }
  }
}, 3000); // Destroys after 3 seconds
```

### Pattern: Conditional Destruction

```js
class ComponentWithRefs {
  constructor() {
    this.refCount = 0;
    this.component = component({
      state: { value: 0 },
      effects: {
        log() {
          console.log('Value:', this.value);
        }
      }
    });
  }

  addRef() {
    this.refCount++;
  }

  removeRef() {
    this.refCount--;
    if (this.refCount <= 0) {
      console.log('No more references, destroying component');
      ReactiveUtils.destroy(this.component);
    }
  }
}

const comp = new ComponentWithRefs();
comp.addRef(); // ref count = 1
comp.addRef(); // ref count = 2
comp.removeRef(); // ref count = 1
comp.removeRef(); // ref count = 0, destroys component
```

### Pattern: Batch Destruction with Lifecycle

```js
function createComponentBatch(configs) {
  const components = configs.map(config =>
    component({
      ...config,
      onDestroy() {
        console.log(\`Destroying component: \${this.id}\`);
        if (config.onDestroy) {
          config.onDestroy.call(this);
        }
      }
    })
  );

  return {
    components,
    destroyAll() {
      console.log(\`Destroying \${components.length} components...\`);
      components.forEach(comp => {
        ReactiveUtils.destroy(comp);
      });
    }
  };
}

const batch = createComponentBatch([
  { state: { id: 1, value: 10 } },
  { state: { id: 2, value: 20 } },
  { state: { id: 3, value: 30 } }
]);

// Later...
batch.destroyAll();
// Logs: "Destroying 3 components..."
// Logs: "Destroying component: 1"
// Logs: "Destroying component: 2"
// Logs: "Destroying component: 3"
```

 

## Common Pitfalls

### Pitfall #1: Using Wrong Destroy Method

❌ **Wrong:**
```js
// Created with component()
const myComponent = component({
  state: { count: 0 },
  effects: { log() { console.log(this.count); } }
});

// Using wrong destroy method
myComponent.destroy(); // Might not exist or work correctly
```

✅ **Correct:**
```js
const myComponent = component({
  state: { count: 0 },
  effects: { log() { console.log(this.count); } }
});

// Use ReactiveUtils.destroy() for components
ReactiveUtils.destroy(myComponent);
```

 

### Pitfall #2: Forgetting to Destroy Components

❌ **Memory Leak:**
```js
function showNotification(message) {
  const notification = component({
    state: { message, visible: true },
    effects: {
      render() {
        if (this.visible) {
          console.log('Notification:', this.message);
        }
      }
    }
  });

  setTimeout(() => {
    notification.visible = false;
    // Oops! Forgot to destroy
  }, 3000);
}

// Each call creates a component that never gets destroyed
showNotification('Message 1'); // Memory leak
showNotification('Message 2'); // Memory leak
showNotification('Message 3'); // Memory leak
```

✅ **Correct:**
```js
function showNotification(message) {
  const notification = component({
    state: { message, visible: true },
    effects: {
      render() {
        if (this.visible) {
          console.log('Notification:', this.message);
        }
      }
    }
  });

  setTimeout(() => {
    notification.visible = false;
    // Properly destroy component
    ReactiveUtils.destroy(notification);
  }, 3000);
}
```

 

### Pitfall #3: Using Component After Destruction

⚠️ **Unexpected Behavior:**
```js
const counter = component({
  state: { count: 0 },
  effects: {
    log() {
      console.log('Count:', this.count);
    }
  }
});

ReactiveUtils.destroy(counter);

// Component still exists but effects don't run
counter.count = 5;
// Nothing logged (component destroyed)

console.log(counter.count); // 5 (state still accessible)
```

The component object still exists after destruction, but reactive features don't work.

✅ **Better Practice:**
```js
let counter = component({
  state: { count: 0 },
  effects: {
    log() {
      console.log('Count:', this.count);
    }
  }
});

ReactiveUtils.destroy(counter);

// Mark as destroyed
counter = null;
```

 

### Pitfall #4: Not Using onDestroy for Cleanup

❌ **Missing Cleanup:**
```js
const app = component({
  state: { count: 0 },
  effects: {
    startTimer() {
      // This timer keeps running even after destroy!
      this.timerId = setInterval(() => {
        console.log('Timer tick');
      }, 1000);
    }
  }
});

ReactiveUtils.destroy(app);
// Timer keeps running! Memory leak!
```

✅ **Correct:**
```js
const app = component({
  state: { count: 0, timerId: null },
  effects: {
    startTimer() {
      this.timerId = setInterval(() => {
        console.log('Timer tick');
      }, 1000);
    }
  },
  onDestroy() {
    // Clean up timer
    if (this.timerId) {
      clearInterval(this.timerId);
      console.log('Timer cleaned up');
    }
  }
});

ReactiveUtils.destroy(app);
// Logs: "Timer cleaned up"
// Timer properly stopped
```

 

### Pitfall #5: Destroying Component Multiple Times

✅ **Safe (No Error):**
```js
const counter = component({
  state: { count: 0 },
  effects: {
    log() {
      console.log('Count:', this.count);
    }
  }
});

ReactiveUtils.destroy(counter);
ReactiveUtils.destroy(counter); // Safe - checks if already destroyed
ReactiveUtils.destroy(counter); // Safe - does nothing
```

Calling \`destroy()\` multiple times is safe - it checks if already destroyed.

 

### Pitfall #6: Destroying in Wrong Order

❌ **Parent Before Children:**
```js
const parent = component({
  state: { children: [] }
});

const child1 = component({ state: { id: 1 } });
const child2 = component({ state: { id: 2 } });

parent.children.push(child1, child2);

// Destroying parent doesn't auto-destroy children
ReactiveUtils.destroy(parent);

// Children are still active! Memory leak!
```

✅ **Correct:**
```js
const parent = component({
  state: { children: [] },
  onDestroy() {
    // Destroy children first
    this.children.forEach(child => {
      ReactiveUtils.destroy(child);
    });
    this.children = [];
  }
});

const child1 = component({ state: { id: 1 } });
const child2 = component({ state: { id: 2 } });

parent.children.push(child1, child2);

// Destroys parent and all children
ReactiveUtils.destroy(parent);
```

 

## Summary

**What is \`ReactiveUtils.destroy()\`?**

\`ReactiveUtils.destroy()\` is a **utility function** that completely destroys a reactive component, cleaning up all effects, watchers, bindings, and calling lifecycle hooks.

 

**Why use \`ReactiveUtils.destroy()\`?**

- Complete component cleanup
- Prevents memory leaks
- Calls lifecycle hooks
- Stops all reactive systems
- Frees resources
- Proper component lifecycle

 

**Key Points to Remember:**

1️⃣ **For components only** - Use with components from \`component()\`
2️⃣ **Calls onDestroy** - Lifecycle hook is called if defined
3️⃣ **Stops everything** - All effects, watchers, and bindings stop
4️⃣ **Safe multiple calls** - Checks if already destroyed
5️⃣ **Use in frameworks** - Essential for component unmounting

 

**Mental Model:** Think of \`ReactiveUtils.destroy()\` as **decommissioning a factory** - systematically shutting down all systems, cleaning up, and releasing resources in a controlled manner!

 

**Quick Reference:**

```js
// CREATE COMPONENT
const counter = component({
  state: { count: 0 },
  effects: {
    log() {
      console.log('Count:', this.count);
    }
  },
  watch: {
    count(newVal) {
      console.log('Changed to:', newVal);
    }
  },
  onDestroy() {
    console.log('Cleaning up...');
  }
});

// DESTROY COMPONENT
ReactiveUtils.destroy(counter);
// Logs: "Cleaning up..."

// FRAMEWORK CLEANUP (React)
React.useEffect(() => {
  return () => ReactiveUtils.destroy(counter);
}, []);

// BATCH DESTROY
const components = [comp1, comp2, comp3];
components.forEach(comp => {
  ReactiveUtils.destroy(comp);
});

// WITH LIFECYCLE
const app = component({
  state: { timerId: null },
  onDestroy() {
    clearInterval(this.timerId);
    console.log('Timer stopped');
  }
});

// WHAT GETS DESTROYED
// ✓ All effects
// ✓ All watchers
// ✓ All bindings
// ✓ Lifecycle hooks called
// ✓ Component marked as destroyed

// COMPONENT vs BUILDER
component({...}) → ReactiveUtils.destroy() ✅
reactive().build() → builtObject.destroy() ✅
```

 

**Remember:** Always call \`ReactiveUtils.destroy()\` when you're done with a component to prevent memory leaks and ensure proper resource cleanup. It's especially important in component frameworks, single-page applications, and any scenario where components are created and removed dynamically!
