## Installation Guide

# Quick Start (Recommended)

**The simplest way to get started** is to load the complete library with a single script tag:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Reactive App</title>
</head>
<body>
  <!-- Load the complete library (recommended) -->
  <script src="dh-reactive.min.js"></script>
  
  <script>
    // You now have access to all features!
    const state = state({ count: 0 });
    
    effect(() => {
      console.log('Count:', state.count);
    });
    
    state.count++; // Logs: Count: 1
  </script>
</body>
</html>
```

**That's it!** This single file gives you:
- ✅ All reactive features
- ✅ All enhancements
- ✅ All utilities
- ✅ Optimized and minified
- ✅ Ready to use immediately

**When to use this approach:**
- 🎯 You're just getting started
- 🎯 You want all features available
- 🎯 You don't want to worry about dependencies
- 🎯 You're building a full-featured app

 

## Understanding the Module System

The DOM Helpers Reactive library follows a **modular architecture**:

```
📦 Complete Library (dh-reactive.min.js)
├─→ ✨ ALL features included
├─→ ✨ Optimized bundle
└─→ ✨ Single file, zero configuration

OR

📦 Modular System (individual files)
├─→ 01_dh-reactive.min.js (CORE - required)
├─→ 02-09 modules (OPTIONAL - add features)
└─→ Load only what you need
```

**Think of it like building blocks:**
- The **core module** (`01_dh-reactive.min.js`) is the foundation
- The **optional modules** (02-09) are enhancements you can add

 

## Installation Methods

### Method 1: Complete Library (Recommended)

**Best for:** Everyone, especially beginners

```html
<script src="dh-reactive.min.js"></script>
```

**Pros:**
- ✅ One file, done
- ✅ All features available
- ✅ No dependency management
- ✅ Minified and optimized

**Cons:**
- ❌ Slightly larger file size (if you only need core features)

**File size:** ~33KB minified

 

### Method 2: Modular Loading (Advanced)

**Best for:** Intermediate/advanced users who want precise control

```html
<!-- CORE (Required) -->
<script src="01_dh-reactive.min.js"></script>

<!-- OPTIONAL: Add only the features you need -->
<script src="02_dh-reactive-array-patch.min.js"></script>
<script src="03_dh-reactive-collection.min.js"></script>
<!-- ... more modules as needed -->
```

**Pros:**
- ✅ Load only what you need
- ✅ Smaller initial payload
- ✅ Fine-grained control

**Cons:**
- ❌ Must manage dependencies
- ❌ Must load in correct order
- ❌ More complex setup

 

## Strategic Loading (Advanced)

This section is for users who understand the library well and want to optimize their bundle size.

### The Module Breakdown

```
📦 Modular System
├─→ 01_dh-reactive.min.js (8KB) - CORE ⚠️ REQUIRED
│    ├─ Reactive state (state, ref, refs)
│    ├─ Effects & watchers
│    ├─ Computed properties
│    ├─ Batching system
│    ├─ DOM bindings
│    ├─ Collections, forms, async state
│    ├─ Store & component patterns
│    └─ Reactive builder
│
├─→ 02_dh-reactive-array-patch.min.js (2KB) - OPTIONAL
│    └─ Makes array methods reactive
│        (push, pop, sort, etc. trigger updates)
│
├─→ 03_dh-reactive-collection.min.js (3KB) - OPTIONAL
│    └─ Rich collection API (40+ methods)
│        (add, remove, update, filter, map, etc.)
│
├─→ 04_dh-reactive-form.min.js (4KB) - OPTIONAL
│    └─ Form management & validation
│        (form state, validators, submit handling)
│
├─→ 05_dh-reactive-cleanup.min.js (3KB) - OPTIONAL
│    └─ Memory leak prevention & cleanup
│        (automatic cleanup, lifecycle management)
│
├─→ 06_dh-reactive-enhancements.min.js (5KB) - OPTIONAL
│    ├─ Error boundaries
│    ├─ Async effects with cancellation
│    ├─ Safe effects with retry
│    └─ DevTools integration
│
├─→ 07_dh-reactive-storage.min.js (4KB) - OPTIONAL
│    ├─ Auto-save (localStorage/sessionStorage)
│    ├─ Cross-tab sync
│    └─ Reactive storage API
│
├─→ 08_dh-reactive-namespace-methods.min.js (2KB) - OPTIONAL
│    └─ Alternative API styles
│        (use set(state, updates) instead of state.$set(updates))
│
└─→ 09_dh-reactiveUtils-shortcut.min.js (2KB) - OPTIONAL
     └─ Global shortcuts (no namespace required)
         (use state() instead of ReactiveUtils.state())
```

### Example: Minimal Setup (Core Only)

**Use case:** Simple counter app, no forms, no storage, no collections

```html
<!-- Just the core - 8KB -->
<script src="01_dh-reactive.min.js"></script>

<script>
  // You have:
  // ✅ state(), ref(), refs()
  // ✅ effect(), computed(), watch()
  // ✅ batch()
  // ✅ DOM bindings
  
  const state = ReactiveUtils.state({ count: 0 });
  
  ReactiveUtils.effect(() => {
    console.log(state.count);
  });
</script>
```

**Total size:** 8KB

 

### Example: Basic App (Core + Shortcuts)

**Use case:** Small app, want cleaner syntax, no storage

```html
<!-- Core + shortcuts - 10KB total -->
<script src="01_dh-reactive.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>

<script>
  // Now you can use shortcuts!
  const myState = state({ count: 0 }); // No ReactiveUtils prefix
  
  effect(() => {
    console.log(myState.count);
  });
</script>
```

**Total size:** 10KB

 

### Example: Full-Featured App (Core + Common Modules)

**Use case:** Todo app with forms, storage, and collections

```html
<!-- Core -->
<script src="01_dh-reactive.min.js"></script>

<!-- Array reactivity -->
<script src="02_dh-reactive-array-patch.min.js"></script>

<!-- Rich collections API -->
<script src="03_dh-reactive-collection.min.js"></script>

<!-- Forms & validation -->
<script src="04_dh-reactive-form.min.js"></script>

<!-- Memory cleanup -->
<script src="05_dh-reactive-cleanup.min.js"></script>

<!-- Auto-save to localStorage -->
<script src="07_dh-reactive-storage.min.js"></script>

<!-- Alternative API -->
<script src="08_dh-reactive-namespace-methods.min.js"></script>

<!-- Global shortcuts -->
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>

<script>
  // Full-featured todo app
  const todos = collection([]);
  
  // Arrays are reactive (module 02)
  todos.items.push({ text: 'Learn Reactive', done: false });
  
  // Auto-save enabled (module 07)
  autoSave(todos, 'my-todos', {
    storage: 'localStorage',
    debounce: 300
  });
  
  // Rich API available (module 03)
  todos.add({ text: 'Build something', done: false });
  todos.toggle(t => t.text === 'Learn Reactive', 'done');
</script>
```

**Total size:** ~29KB (all optional modules)

 

### Example: Production App (Core + Enhancements)

**Use case:** Production app with error handling and DevTools

```html
<!-- Core -->
<script src="01_dh-reactive.min.js"></script>

<!-- Production enhancements -->
<script src="05_dh-reactive-cleanup.min.js"></script>
<script src="06_dh-reactive-enhancements.min.js"></script>

<!-- Shortcuts -->
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>

<script>
  // Error boundaries (module 06)
  safeEffect(() => {
    // This won't crash the app if it errors
    riskyOperation();
  }, {
    errorBoundary: {
      onError: (error) => {
        console.error('Caught error:', error);
      },
      retry: true,
      maxRetries: 3
    }
  });
  
  // Async with cancellation (module 06)
  asyncEffect(async (signal) => {
    const data = await fetch('/api/data', { signal });
    // Auto-cancels if effect re-runs
  });
  
  // DevTools (module 06)
  DevTools.enable();
</script>
```

**Total size:** ~18KB

 

## Module Dependencies

### Dependency Tree

```
01_dh-reactive.min.js (CORE)
├─→ No dependencies (loads first)
└─→ Required by ALL other modules

02_dh-reactive-array-patch.min.js
└─→ Depends on: 01_dh-reactive.min.js

03_dh-reactive-collection.min.js
└─→ Depends on: 01_dh-reactive.min.js

04_dh-reactive-form.min.js
└─→ Depends on: 01_dh-reactive.min.js

05_dh-reactive-cleanup.min.js
└─→ Depends on: 01_dh-reactive.min.js

06_dh-reactive-enhancements.min.js
├─→ Depends on: 01_dh-reactive.min.js
└─→ Enhanced by: 05_dh-reactive-cleanup.min.js (optional)

07_dh-reactive-storage.min.js
└─→ Depends on: 01_dh-reactive.min.js

08_dh-reactive-namespace-methods.min.js
└─→ Depends on: 01_dh-reactive.min.js

09_dh-reactiveUtils-shortcut.min.js
└─→ Depends on: 01_dh-reactive.min.js
    (Works best when loaded AFTER all other modules)
```

 

## Load Order Rules

**Critical Rule:** Always load modules in numerical order (01 → 02 → 03 → ... → 09)

### ✅ Correct Order

```html
<script src="01_dh-reactive.min.js"></script>
<script src="02_dh-reactive-array-patch.min.js"></script>
<script src="03_dh-reactive-collection.min.js"></script>
<script src="04_dh-reactive-form.min.js"></script>
<script src="05_dh-reactive-cleanup.min.js"></script>
<script src="06_dh-reactive-enhancements.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>
<script src="08_dh-reactive-namespace-methods.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>
```

### ❌ Incorrect Order

```html
<!-- WRONG: Loading shortcuts before core -->
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>
<script src="01_dh-reactive.min.js"></script>

<!-- WRONG: Loading enhancements before cleanup -->
<script src="06_dh-reactive-enhancements.min.js"></script>
<script src="05_dh-reactive-cleanup.min.js"></script>
```

### Special Case: Module 09 (Shortcuts)

**Best practice:** Load `09_dh-reactiveUtils-shortcut.min.js` **LAST** (after all other modules you're using)

**Why?** It creates global shortcuts for all available methods, so it should see the complete API.

```html
<!-- Recommended order for shortcuts -->
<script src="01_dh-reactive.min.js"></script>
<script src="03_dh-reactive-collection.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script> <!-- LAST -->
```

 

## Common Installation Patterns

### Pattern 1: "Just Getting Started"

```html
<!-- Simple: Just use the complete library -->
<script src="dh-reactive.min.js"></script>
```

**Use when:**
- Learning the library
- Prototyping
- Don't want to think about modules

 

### Pattern 2: "I Only Need State Management"

```html
<!-- Minimal: Core only -->
<script src="01_dh-reactive.min.js"></script>
```

**Use when:**
- Building simple reactive UI
- No forms, no storage, no collections
- Want smallest possible bundle

 

### Pattern 3: "I'm Building a Todo App"

```html
<!-- Core features -->
<script src="01_dh-reactive.min.js"></script>
<script src="02_dh-reactive-array-patch.min.js"></script>
<script src="03_dh-reactive-collection.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>
```

**Use when:**
- Working with lists/arrays
- Need localStorage persistence
- Want rich collection methods

 

### Pattern 4: "I'm Building a Form-Heavy App"

```html
<!-- Core + forms -->
<script src="01_dh-reactive.min.js"></script>
<script src="04_dh-reactive-form.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>
```

**Use when:**
- Lots of forms
- Need validation
- Want form state persistence

 

### Pattern 5: "Production App with Full Features"

```html
<!-- Everything -->
<script src="01_dh-reactive.min.js"></script>
<script src="02_dh-reactive-array-patch.min.js"></script>
<script src="03_dh-reactive-collection.min.js"></script>
<script src="04_dh-reactive-form.min.js"></script>
<script src="05_dh-reactive-cleanup.min.js"></script>
<script src="06_dh-reactive-enhancements.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>
<script src="08_dh-reactive-namespace-methods.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script> <!-- LAST -->
```

**Or just use:**

```html
<script src="dh-reactive.min.js"></script>
```

**Use when:**
- Production application
- Need all features
- Want error handling, cleanup, DevTools

 

## Troubleshooting

### Problem: "ReactiveUtils is not defined"

**Cause:** You're trying to use the library before loading it.

**Solution:**

```html
<!-- ❌ Wrong -->
<script>
  const state = ReactiveUtils.state({ count: 0 });
</script>
<script src="01_dh-reactive.min.js"></script>

<!-- ✅ Correct -->
<script src="01_dh-reactive.min.js"></script>
<script>
  const state = ReactiveUtils.state({ count: 0 });
</script>
```

 

### Problem: "Cannot read property 'patchArray' of undefined"

**Cause:** You're using a feature from a module you haven't loaded.

**Solution:** Load the required module:

```html
<!-- ❌ Missing module 02 -->
<script src="01_dh-reactive.min.js"></script>
<script>
  patchArray(state, 'items'); // Error!
</script>

<!-- ✅ Correct -->
<script src="01_dh-reactive.min.js"></script>
<script src="02_dh-reactive-array-patch.min.js"></script>
<script>
  patchArray(state, 'items'); // Works!
</script>
```

 

### Problem: "Array push() doesn't trigger reactivity"

**Cause:** You haven't loaded the array patch module.

**Solution:**

```html
<script src="01_dh-reactive.min.js"></script>
<script src="02_dh-reactive-array-patch.min.js"></script> <!-- Add this -->
```

 

### Problem: "Global shortcuts not working"

**Cause:** Module 09 is loaded before other modules.

**Solution:** Load module 09 **LAST**:

```html
<!-- ❌ Wrong order -->
<script src="01_dh-reactive.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>

<!-- ✅ Correct order -->
<script src="01_dh-reactive.min.js"></script>
<script src="07_dh-reactive-storage.min.js"></script>
<script src="09_dh-reactiveUtils-shortcut.min.js"></script> <!-- LAST -->
```

 

### Problem: "Module features not available in ReactiveUtils"

**Cause:** Loading modules in wrong order.

**Solution:** Always load in numerical order (01 → 02 → 03 → ... → 09):

```html
<!-- ✅ Always numerical order -->
<script src="01_dh-reactive.min.js"></script>
<script src="02_dh-reactive-array-patch.min.js"></script>
<script src="03_dh-reactive-collection.min.js"></script>
<!-- etc. -->
```

 

## Quick Decision Guide

**"Which installation method should I use?"**

```
Start here: Do you want all features?
├─→ YES → Use dh-reactive.min.js (single file)
│         ✅ Easiest
│         ✅ Complete
│         ✅ Optimized
│
└─→ NO → Are you experienced with the library?
    ├─→ NO → Use dh-reactive.min.js anyway
    │         (Don't optimize prematurely)
    │
    └─→ YES → Load individual modules
              ├─→ Always load 01_dh-reactive.min.js first
              ├─→ Add only what you need (02-09)
              └─→ Load in numerical order
```

 

## Summary

### For Beginners:

```html
<!-- Just use this -->
<script src="dh-reactive.min.js"></script>
```

### For Advanced Users:

```html
<!-- Load strategically -->
<script src="01_dh-reactive.min.js"></script> <!-- Required -->
<script src="0X_module.min.js"></script>      <!-- Add features -->
<script src="09_dh-reactiveUtils-shortcut.min.js"></script> <!-- Load LAST -->
```

### Remember:

1. **Complete library** = Single file, all features (recommended)
2. **Modular loading** = Advanced users only
3. **Always load 01** = Core module is required
4. **Numerical order** = 01 → 02 → 03 → ... → 09
5. **Module 09 last** = Shortcuts see complete API

**When in doubt:** Use `dh-reactive.min.js` and get everything! 🎉