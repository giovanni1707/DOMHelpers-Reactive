# `ref()` - Reactive Primitives

## Quick Start (30 seconds)

```javascript
// Create a reactive primitive value
const count = ref(0);

// Auto-update DOM when value changes
effect(() => {
  Elements.update({
    counterDisplay: { textContent: count.value }
  });
});

count.value++; // ✨ DOM updates automatically!
```

**That's it.** `ref()` wraps a single value (number, string, boolean) in a reactive container. Change `.value` and all effects re-run automatically.

---

## What is `ref()`?

`ref()` is **the reactive wrapper for primitive values**. While `state()` is for objects, `ref()` is for single values like numbers, strings, and booleans.

Think of it as **putting a value in a smart container** that can be tracked and observed. The container (ref) is reactive, even though primitives themselves can't be tracked directly in JavaScript.

**In practical terms:** You need a ref when you want a single reactive value, not a whole object. Instead of `state({ count: 0 })` where you access `count.count`, you use `ref(0)` and access `count.value`.

---

## Syntax

```javascript
// Create a ref
const myRef = ref(initialValue);

// Read the value
console.log(myRef.value);

// Update the value
myRef.value = newValue;

// Use in effects
effect(() => {
  console.log(myRef.value); // Tracks this ref
});

// Examples
const count = ref(0);
const name = ref('Alice');
const isActive = ref(true);
const price = ref(29.99);
```

**Parameters:**
- `initialValue` - Any primitive value (number, string, boolean, null, etc.)

**Returns:**
- Reactive ref object with `.value` property

**Properties:**
- `.value` - Get or set the current value (reactive)

---

## Why Does This Exist?

### The Problem Without ref()

Let's create a simple counter with just a primitive value:

```javascript
// ❌ Vanilla JavaScript - no reactivity for primitives
let count = 0;

function updateDisplay() {
  document.getElementById('counter-display').textContent = count;
  document.getElementById('counter-badge').textContent = count;
  document.getElementById('counter-label').textContent =
    count === 1 ? '1 click' : `${count} clicks`;
}

// Event handlers must manually update DOM
document.getElementById('increment-btn').addEventListener('click', () => {
  count++;
  updateDisplay(); // Must remember to call!
});

document.getElementById('decrement-btn').addEventListener('click', () => {
  count--;
  updateDisplay(); // Easy to forget!
});

// Initial render
updateDisplay();
```

**What's the Real Issue?**

```
Primitive Value (let count = 0)
    ↓
No way to track changes
    ↓
Must manually call update function
    ↓
Easy to forget
    ↓
Bugs and stale UI
```

**Problems:**
❌ **No reactivity** - JavaScript primitives can't be tracked
❌ **Manual updates** - Must call `updateDisplay()` every time
❌ **Error-prone** - Easy to forget update calls
❌ **Boilerplate** - Repetitive update function calls
❌ **Hard to maintain** - Changes require updating multiple places

### The Solution with `ref()`

```javascript
// ✅ DOM Helpers + Reactive State with ref() - automatic reactivity
const count = ref(0);

// Set up automatic DOM updates using bulk updates
effect(() => {
  Elements.update({
    counterDisplay: { textContent: count.value },
    counterBadge: { textContent: count.value },
    counterLabel: {
      textContent: count.value === 1 ? '1 click' : `${count.value} clicks`
    }
  });
});

// Event handlers using bulk event binding - just update the value
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => {
      count.value++;
      // ✨ DOM updates automatically!
    }]
  },
  decrementBtn: {
    addEventListener: ['click', () => {
      count.value--;
      // ✨ DOM updates automatically!
    }]
  }
});
```

**What Just Happened?**

```
Ref Wrapper (ref(0))
    ↓
Value changes are tracked
    ↓
Effects run automatically
    ↓
DOM updates automatically
    ↓
No manual calls needed
```

**Benefits:**
✅ **Reactive primitive** - Single values become trackable
✅ **Automatic updates** - Change `.value`, effects run
✅ **Clean API** - Simple `.value` access
✅ **No manual sync** - UI updates automatically
✅ **Less code** - 80% less boilerplate than vanilla JS

---

## Mental Model: Smart Box

Think of `ref()` like **putting a value in a smart box with a viewing window**:

**Without ref() (Plain Value):**
```
┌─────────────────────────────┐
│  Plain Variable             │
│                             │
│  let count = 5              │
│                             │
│  No tracking                │
│  No notifications           │
│  Manual updates required    │
│                             │
│  Change it → nothing happens│
└─────────────────────────────┘
```

**With ref() (Smart Box):**
```
┌─────────────────────────────┐
│  Smart Box (Ref)            │
│                             │
│  ┌──────────────┐           │
│  │   value: 5   │  ← Window │
│  └──────────────┘           │
│                             │
│  ✓ Tracks changes           │
│  ✓ Notifies watchers        │
│  ✓ Auto-updates UI          │
│                             │
│  Change it → everything     │
│  updates automatically!     │
└─────────────────────────────┘
```

You access the value through the **window** (`.value` property), and the box **notifies everyone** when it changes.

---

## How Does It Work?

A ref is just **a reactive object with a single `value` property**:

```
Your Call
    ↓
ref(initialValue)
    ↓
Internally Creates:
    ↓
state({ value: initialValue })
    ↓
Returns: Reactive object with .value
```

**Step-by-step:**

1️⃣ **You create a ref:**
```javascript
const count = ref(0);
```

2️⃣ **Internally creates reactive state:**
```javascript
// Like: state({ value: 0 })
```

3️⃣ **You access via .value:**
```javascript
console.log(count.value); // 0
```

4️⃣ **Effects track .value access:**
```javascript
effect(() => {
  console.log(count.value); // Tracks count.value
});
```

5️⃣ **Updates trigger effects:**
```javascript
count.value = 5; // Effect re-runs
```

**Key Insight:**
`ref()` is just **syntactic sugar** for `state({ value: ... })`. It makes working with single primitive values cleaner and more intuitive.

---

## Basic Usage

### Example 1: Simple Counter

```javascript
const count = ref(0);

effect(() => {
  Elements.update({
    display: { textContent: count.value }
  });
});

// Update using bulk event binding
Elements.update({
  incrementBtn: {
    addEventListener: ['click', () => {
      count.value++;
    }]
  }
});
```

---

### Example 2: Text Input Sync

```javascript
const username = ref('');

effect(() => {
  Elements.update({
    usernameDisplay: { textContent: username.value },
    usernameLength: { textContent: `${username.value.length} characters` }
  });
});

// Sync input using bulk event binding
Elements.update({
  usernameInput: {
    addEventListener: ['input', (e) => {
      username.value = e.target.value;
    }]
  }
});
```

---

### Example 3: Boolean Toggle

```javascript
const isVisible = ref(false);

effect(() => {
  Elements.update({
    panel: {
      style: { display: isVisible.value ? 'block' : 'none' }
    },
    toggleBtn: {
      textContent: isVisible.value ? 'Hide' : 'Show'
    }
  });
});

// Toggle using bulk event binding
Elements.update({
  toggleBtn: {
    addEventListener: ['click', () => {
      isVisible.value = !isVisible.value;
    }]
  }
});
```

---

### Example 4: Number Input with Validation

```javascript
const age = ref(0);

effect(() => {
  const isValid = age.value >= 18 && age.value <= 120;

  Elements.update({
    ageDisplay: { textContent: age.value },
    ageError: {
      textContent: isValid ? '' : 'Age must be between 18 and 120',
      style: { display: isValid ? 'none' : 'block' }
    },
    submitBtn: {
      disabled: !isValid
    }
  });
});

// Input handler using bulk event binding
Elements.update({
  ageInput: {
    addEventListener: ['input', (e) => {
      age.value = parseInt(e.target.value) || 0;
    }]
  }
});
```

---

### Example 5: Progress Tracker

```javascript
const progress = ref(0);

effect(() => {
  Elements.update({
    progressBar: {
      style: { width: `${progress.value}%` },
      setAttribute: ['aria-valuenow', progress.value]
    },
    progressText: { textContent: `${progress.value}%` },
    progressStatus: {
      textContent: progress.value === 100 ? '✓ Complete' : 'In progress...'
    }
  });
});

// Simulate progress
const interval = setInterval(() => {
  if (progress.value < 100) {
    progress.value += 10;
  } else {
    clearInterval(interval);
  }
}, 500);
```

---

### Example 6: Search Query

```javascript
const searchQuery = ref('');

const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

effect(() => {
  const filtered = items.filter(item =>
    item.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  Elements.update({
    searchInput: { value: searchQuery.value },
    resultCount: { textContent: `${filtered.length} results` },
    resultList: {
      innerHTML: filtered.map(item => `<li>${item}</li>`).join('')
    }
  });
});

// Search input using bulk event binding
Elements.update({
  searchInput: {
    addEventListener: ['input', (e) => {
      searchQuery.value = e.target.value;
    }]
  }
});
```

---

### Example 7: Timer/Countdown

```javascript
const seconds = ref(60);

effect(() => {
  const minutes = Math.floor(seconds.value / 60);
  const secs = seconds.value % 60;

  Elements.update({
    timerDisplay: {
      textContent: `${minutes}:${secs.toString().padStart(2, '0')}`
    },
    timerStatus: {
      textContent: seconds.value === 0 ? 'Time\'s up!' : 'Running...'
    }
  });
});

// Start countdown
const timer = setInterval(() => {
  if (seconds.value > 0) {
    seconds.value--;
  } else {
    clearInterval(timer);
  }
}, 1000);
```

---

### Example 8: Color Picker

```javascript
const color = ref('#007bff');

effect(() => {
  Elements.update({
    colorPicker: { value: color.value },
    colorDisplay: {
      style: { backgroundColor: color.value }
    },
    colorLabel: { textContent: color.value.toUpperCase() }
  });
});

// Color picker using bulk event binding
Elements.update({
  colorPicker: {
    addEventListener: ['input', (e) => {
      color.value = e.target.value;
    }]
  }
});
```

---

### Example 9: Font Size Adjuster

```javascript
const fontSize = ref(16);

effect(() => {
  Elements.update({
    sampleText: {
      style: { fontSize: `${fontSize.value}px` }
    },
    fontSizeDisplay: { textContent: `${fontSize.value}px` },
    decreaseBtn: { disabled: fontSize.value <= 12 },
    increaseBtn: { disabled: fontSize.value >= 24 }
  });
});

// Controls using bulk event binding
Elements.update({
  increaseBtn: {
    addEventListener: ['click', () => {
      if (fontSize.value < 24) fontSize.value++;
    }]
  },
  decreaseBtn: {
    addEventListener: ['click', () => {
      if (fontSize.value > 12) fontSize.value--;
    }]
  },
  resetBtn: {
    addEventListener: ['click', () => {
      fontSize.value = 16;
    }]
  }
});
```

---

### Example 10: Temperature Converter

```javascript
const celsius = ref(0);

effect(() => {
  const fahrenheit = (celsius.value * 9/5) + 32;
  const kelvin = celsius.value + 273.15;

  Elements.update({
    celsiusInput: { value: celsius.value },
    fahrenheitDisplay: { textContent: `${fahrenheit.toFixed(1)}°F` },
    kelvinDisplay: { textContent: `${kelvin.toFixed(1)}K` }
  });
});

// Input using bulk event binding
Elements.update({
  celsiusInput: {
    addEventListener: ['input', (e) => {
      celsius.value = parseFloat(e.target.value) || 0;
    }]
  }
});
```

---

## Deep Dive: Understanding ref() Internals

### How Reactivity Works Under the Hood

When you create a `ref()`, here's what happens internally:

```javascript
// When you write:
const count = ref(0);

// Internally, something like this happens:
function ref(initialValue) {
  // Create a reactive state object with a single property
  const wrapper = state({ value: initialValue });

  // Add helper methods
  wrapper.valueOf = () => wrapper.value;
  wrapper.toString = () => String(wrapper.value);

  return wrapper;
}
```

**Why does this work?**

1. **Proxy trapping**: The `state()` function returns a Proxy that intercepts property access
2. **Dependency tracking**: When you read `.value` inside an effect, the effect is registered as a dependent
3. **Change notification**: When you write to `.value`, all registered effects are notified and re-run

### The Tracking Flow

```
┌─────────────────────────────────────────────────────┐
│  effect(() => {                                     │
│    console.log(count.value);  // ← READ happens     │
│  });                                                │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Proxy intercepts .value read                       │
│  → Adds this effect to dependency list              │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  count.value = 5;  // ← WRITE happens               │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Proxy intercepts .value write                      │
│  → Notifies all effects in dependency list          │
│  → Each effect re-runs automatically                │
└─────────────────────────────────────────────────────┘
```

### Memory Considerations

Refs are lightweight because they're just proxy-wrapped objects:

```javascript
// Each ref is essentially:
{
  value: yourValue,
  valueOf: [Function],
  toString: [Function]
}
```

For most applications, you can create many refs without performance concerns. However:

- **Prefer `state()` for related values** - 5 refs vs 1 state object with 5 properties
- **Don't create refs inside loops** - Create outside, update inside
- **Clean up effects** - Unused effects that track refs can prevent garbage collection

### Common Edge Cases

**Edge Case 1: Ref with undefined**
```javascript
const maybeValue = ref(undefined);

effect(() => {
  // This will log 'undefined' on first run
  console.log(maybeValue.value);
});

maybeValue.value = 'now defined'; // Effect re-runs
```

**Edge Case 2: Ref with null**
```javascript
const nullableRef = ref(null);

effect(() => {
  // Safe to use optional chaining
  const length = nullableRef.value?.length ?? 0;
  console.log(length);
});
```

**Edge Case 3: Ref with object (not recommended)**
```javascript
// This WORKS but is not recommended
const objRef = ref({ count: 0 });

// Updating nested property WON'T trigger effect!
objRef.value.count = 5; // ❌ No reactivity

// You must reassign the whole value
objRef.value = { count: 5 }; // ✅ Triggers effect

// Better: Use state() for objects
const obj = state({ count: 0 });
obj.count = 5; // ✅ Triggers effect
```

---

## Advanced Usage: Computed with Refs

You can use refs with computed properties:

```javascript
const price = ref(29.99);
const quantity = ref(1);

const total = computed(
  { price: price.value, quantity: quantity.value },
  {
    total: function() {
      return this.price * this.quantity;
    }
  }
);

effect(() => {
  Elements.update({
    totalDisplay: { textContent: `$${(price.value * quantity.value).toFixed(2)}` }
  });
});
```

**Note:** For multiple related values, consider using `state()` instead of multiple refs.

---

## Advanced Usage: Watchers with Refs

```javascript
const score = ref(0);

watch(score, (newValue, oldValue) => {
  console.log(`Score changed from ${oldValue} to ${newValue}`);

  if (newValue > 100) {
    console.log('High score!');
  }
});

score.value = 50;  // Console: "Score changed from 0 to 50"
score.value = 150; // Console: "Score changed from 50 to 150", "High score!"
```

**Note:** `watch()` on a ref requires special handling. Check the watch() documentation for details.

---

## Advanced Usage: Refs in Arrays

```javascript
const refs = [ref(1), ref(2), ref(3)];

effect(() => {
  const sum = refs.reduce((acc, r) => acc + r.value, 0);
  Elements.update({
    sumDisplay: { textContent: `Sum: ${sum}` }
  });
});

refs[0].value = 10; // Effect runs, sum updates
```

---

## ref() vs state()

### Using ref() (Single Value)
```javascript
const count = ref(0);
console.log(count.value); // 0
count.value = 5;
```

### Using state() (Object)
```javascript
const counter = state({ count: 0 });
console.log(counter.count); // 0
counter.count = 5;
```

**When to use ref():**
✅ Single primitive value (number, string, boolean)
✅ Simple counters, flags, inputs
✅ You want `.value` API
✅ Cleaner than `state({ value: ... })`

**When to use state():**
✅ Multiple related values
✅ Objects or complex data
✅ Nested properties
✅ You prefer direct property access

---

## Refs with Bindings

```javascript
const count = ref(0);

bindings({
  '#counter': () => count.value,
  '#double': () => count.value * 2,
  '#message': () => count.value > 10 ? 'High!' : 'Low'
});

count.value = 15; // ✨ All bindings update
```

---

## Combining Multiple Refs

```javascript
const firstName = ref('Alice');
const lastName = ref('Johnson');

effect(() => {
  const fullName = `${firstName.value} ${lastName.value}`;
  Elements.update({
    fullNameDisplay: { textContent: fullName }
  });
});

firstName.value = 'Bob'; // Effect runs
lastName.value = 'Smith'; // Effect runs again
```

**Better approach:** Use `state()` for related values:
```javascript
const user = state({
  firstName: 'Alice',
  lastName: 'Johnson'
});

effect(() => {
  const fullName = `${user.firstName} ${user.lastName}`;
  Elements.update({
    fullNameDisplay: { textContent: fullName }
  });
});
```

---

## valueOf() and toString()

Refs have special methods for automatic conversion:

```javascript
const count = ref(5);

console.log(+count);        // 5 (valueOf)
console.log(`Count: ${count}`); // "Count: 5" (toString)

// Useful in expressions
const double = ref(10);
const result = double * 2;   // 20 (uses valueOf)
```

**Note:** While convenient, explicitly using `.value` is clearer and recommended.

---

## Common Patterns

### Pattern 1: Loading Indicator

```javascript
const isLoading = ref(false);

effect(() => {
  Elements.update({
    spinner: {
      style: { display: isLoading.value ? 'block' : 'none' }
    },
    content: {
      style: { opacity: isLoading.value ? '0.5' : '1' }
    }
  });
});

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetch('/api/data');
    // Process data...
  } finally {
    isLoading.value = false;
  }
}
```

### Pattern 2: Form Dirty Flag

```javascript
const isDirty = ref(false);

Elements.update({
  formInput: {
    addEventListener: ['input', () => {
      isDirty.value = true;
    }]
  },
  saveBtn: {
    addEventListener: ['click', async () => {
      // Save form...
      isDirty.value = false;
    }]
  }
});

effect(() => {
  Elements.update({
    saveBtn: { disabled: !isDirty.value }
  });
});
```

### Pattern 3: Active Item Index

```javascript
const activeIndex = ref(0);

const items = ['Home', 'About', 'Contact'];

effect(() => {
  Elements.update({
    activeItem: { textContent: items[activeIndex.value] }
  });

  // Update all nav items using Collections
  Collections.ClassName.navItem.forEach((el, i) => {
    el.classList.toggle('active', i === activeIndex.value);
  });
});

// Navigation using bulk event binding
Elements.update({
  nextBtn: {
    addEventListener: ['click', () => {
      activeIndex.value = (activeIndex.value + 1) % items.length;
    }]
  },
  prevBtn: {
    addEventListener: ['click', () => {
      activeIndex.value =
        (activeIndex.value - 1 + items.length) % items.length;
    }]
  }
});
```

---

## Common Pitfalls

### Pitfall 1: Forgetting .value

```javascript
const count = ref(0);

// ❌ Wrong - comparing ref object, not value
if (count === 0) { ... }

// ✅ Correct - access .value
if (count.value === 0) { ... }
```

### Pitfall 2: Using Ref for Objects

```javascript
// ❌ Suboptimal - ref for objects
const user = ref({ name: 'Alice', age: 30 });
user.value.name = 'Bob'; // Awkward

// ✅ Better - use state() for objects
const user = state({ name: 'Alice', age: 30 });
user.name = 'Bob'; // Cleaner
```

### Pitfall 3: Multiple Related Refs

```javascript
// ❌ Verbose - many separate refs
const firstName = ref('Alice');
const lastName = ref('Johnson');
const email = ref('alice@example.com');
const age = ref(30);

// ✅ Better - single state object
const user = state({
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice@example.com',
  age: 30
});
```

---

## Key Takeaways

✅ **Reactive primitives** - Wraps single values to make them reactive
✅ **Simple API** - Access via `.value` property
✅ **Automatic updates** - Change `.value`, effects run
✅ **Works everywhere** - Can be used with effects, bindings, watchers
✅ **Use for single values** - For objects, prefer `state()`
✅ **Clean and simple** - Perfect for counters, flags, simple inputs

---

## What's Next?

Now that you understand `ref()`, explore:

- **[state()](state-creation.md)** - For objects and complex data structures
- **[computed()](../reactivity-function/computed.md)** - Create derived values from refs
- **[watch()](../reactivity-function/watch.md)** - React to ref value changes
- **[effect()](../reactivity-function/effect.md)** - Run side effects when refs change
- **[builder()](builder.md)** - Chainable API for creating reactive state

**Related Documentation:**
- [What is ReactivePlus?](what-is-ReactivePlus.md) - Understanding the reactive system
- [Essential Patterns](essential-patterns.md) - Common patterns and best practices

---

## Summary

`ref()` is the **reactive wrapper for primitive values**. It puts a single value (number, string, boolean) in a reactive container that can be tracked and observed.

**The magic formula:**
```
ref(value) = state({ value: value })
────────────────────────────────────
Reactive primitive with .value access
```

Think of it as **putting a value in a smart box** — you access it through the `.value` window, and the box notifies everyone when the value changes. Perfect for simple, single-value reactivity.
