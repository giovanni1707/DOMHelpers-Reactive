# Reactive with Conditions: Smart Show/Hide & Conditional Rendering

## What You'll Learn 🎯

In this tutorial, you'll master **conditional rendering** — making elements appear, disappear, and change based on your reactive state:

- **Show/Hide Elements** — Display content based on conditions
- **Condition Matching** — True, false, ranges, patterns, and more
- **State-Based Rendering** — Different content for different states
- **Combining with DOM Helpers** — Powerful, reactive UIs

This is where your apps start to feel truly dynamic!

---

## Prerequisites

Make sure you're comfortable with:
- Creating state with `state()`
- Using effects with `effect()`
- Basic DOM Helpers (Elements, Collections)

New here? Start with [Getting Started](getting-started.md)!

---

## What is Conditional Rendering?

**Conditional rendering** means showing or hiding parts of your UI based on data. Think of it like:

- Show the "Login" button when user is **logged out**
- Show the "Welcome, Alice!" message when user is **logged in**
- Show "No items" when cart is **empty**
- Show item list when cart **has items**

Without conditions, your page would show everything at once — chaos! 🙈

---

## Part 1: Basic Show/Hide with Reactive State

### The Simple Approach

The most basic way to conditionally show/hide is with CSS:

```javascript
const modal = state({ isOpen: false });

effect(() => {
  // Show when isOpen is true, hide when false
  Elements.modalDialog.style.display = modal.isOpen ? 'flex' : 'none';
});

// Toggle the modal
Elements.openModalBtn.addEventListener('click', () => {
  modal.isOpen = true;
});

Elements.closeModalBtn.addEventListener('click', () => {
  modal.isOpen = false;
});
```

**What's happening:**
1. State tracks whether modal is open
2. Effect updates the display style when state changes
3. Buttons simply toggle the state

**The key insight:** You never manually show/hide. You just change the data!

---

### Multiple Conditional Elements

Let's handle logged-in vs logged-out views:

**HTML:**
```html
<nav>
  <div id="guestMenu">
    <button id="loginBtn">Log In</button>
    <button id="signupBtn">Sign Up</button>
  </div>
  <div id="userMenu">
    <span id="welcomeMsg">Welcome!</span>
    <button id="logoutBtn">Log Out</button>
  </div>
</nav>
```

**Reactive Code:**
```javascript
const auth = state({
  isLoggedIn: false,
  userName: ''
});

effect(() => {
  // Toggle visibility based on login state
  Elements.guestMenu.style.display = auth.isLoggedIn ? 'none' : 'flex';
  Elements.userMenu.style.display = auth.isLoggedIn ? 'flex' : 'none';
});

effect(() => {
  // Update welcome message when logged in
  if (auth.isLoggedIn) {
    Elements.welcomeMsg.textContent = `Welcome, ${auth.userName}!`;
  }
});

// Login handler
Elements.loginBtn.addEventListener('click', () => {
  // Simulate login
  auth.userName = 'Alice';
  auth.isLoggedIn = true;
});

// Logout handler
Elements.logoutBtn.addEventListener('click', () => {
  auth.userName = '';
  auth.isLoggedIn = false;
});
```

**The flow:**
```
auth.isLoggedIn = false
        ↓
guestMenu: display = 'flex'  ✓ visible
userMenu:  display = 'none'  ✗ hidden

───── User clicks Login ─────

auth.isLoggedIn = true
        ↓
guestMenu: display = 'none'  ✗ hidden
userMenu:  display = 'flex'  ✓ visible
```

---

## Part 2: The Conditions System

### Three Main Methods

DOM Helpers provides three methods for conditional rendering:

1. **`Conditions.whenState()`** - Auto-reactive (when using state functions)
2. **`Conditions.apply()`** - One-time static application
3. **`Conditions.watch()`** - Explicit reactive watching

### API Signature

```javascript
// Auto-reactive mode (recommended with state)
Conditions.whenState(
  () => state.property,  // Function returning value
  { /* conditions */ },   // Condition mappings
  '#selector',           // CSS selector
  { reactive: true }     // Optional config
);

// Static one-time application
Conditions.apply(
  currentValue,          // Direct value
  { /* conditions */ },   // Condition mappings
  '#selector'            // CSS selector
);

// Explicit reactive (requires reactive library)
Conditions.watch(
  () => state.property,  // Function returning value
  { /* conditions */ },   // Condition mappings
  '#selector'            // CSS selector
);
```

---

### Basic whenState Example

```javascript
const status = state({ value: 'loading' });

// ✅ Correct: Use function to get state value
Conditions.whenState(
  () => status.value,  // Function returning current value
  {
    'loading': {
      textContent: 'Loading...',
      style: { display: 'block', color: 'blue' }
    },
    'ready': {
      textContent: 'Ready!',
      style: { display: 'block', color: 'green' }
    },
    'error': {
      textContent: 'Error occurred',
      style: { display: 'block', color: 'red' }
    }
  },
  '#statusMessage'  // Selector goes here
);

// Change state and UI updates automatically
status.value = 'ready'; // ✨ Shows "Ready!" in green
status.value = 'error'; // ✨ Shows "Error occurred" in red
```

**The beauty:** One declaration handles all states!

---

### Using apply() for Static Values

When you don't need reactivity, use `apply()`:

```javascript
const currentTheme = 'dark';

Conditions.apply(
  currentTheme,  // Direct value, not a function
  {
    'light': {
      classList: { add: 'theme-light', remove: 'theme-dark' }
    },
    'dark': {
      classList: { add: 'theme-dark', remove: 'theme-light' }
    }
  },
  'body'
);
```

---

### Default Branch Support

You can provide a default case when no conditions match:

```javascript
Conditions.whenState(
  () => status.value,
  {
    'loading': { textContent: 'Loading...' },
    'ready': { textContent: 'Ready!' },
    default: { textContent: 'Unknown status' }  // Fallback
  },
  '#statusMessage'
);
```

---

## Part 3: Condition Matchers

The Conditions system understands many types of conditions:

### Boolean Conditions

```javascript
const user = state({ isActive: true });

Conditions.whenState(
  () => user.isActive,
  {
    'true': {
      textContent: 'Active',
      style: { color: 'green' }
    },
    'false': {
      textContent: 'Inactive',
      style: { color: 'gray' }
    }
  },
  '#status'
);
```

### Truthy/Falsy

```javascript
const cart = state({ items: [] });

Conditions.whenState(
  () => cart.items.length,
  {
    'truthy': {
      // When items array has values
      style: { display: 'flex' }
    },
    'falsy': {
      // When items is empty
      style: { display: 'none' }
    }
  },
  '#cartBadge'
);
```

### Empty Check

```javascript
const search = state({ query: '' });

Conditions.whenState(
  () => search.query,
  {
    'empty': {
      textContent: 'Start typing to search...',
      style: { display: 'block' }
    },
    default: {
      textContent: `Searching for: ${search.query}`,
      style: { display: 'block' }
    }
  },
  '#searchPlaceholder'
);
```

### Exact String Match

```javascript
const theme = state({ mode: 'light' });

// Light theme
Conditions.whenState(
  () => theme.mode,
  {
    'light': {
      classList: { add: 'theme-light', remove: 'theme-dark' }
    },
    'dark': {
      classList: { add: 'theme-dark', remove: 'theme-light' }
    }
  },
  'body'
);
```

### Numeric Comparisons

```javascript
const battery = state({ level: 100 });

Conditions.whenState(
  () => battery.level,
  {
    '>=80': {
      textContent: '🔋',
      style: { color: 'green' }
    },
    '>=40': {
      textContent: '🔋',
      style: { color: 'orange' }
    },
    '<40': {
      textContent: '🪫',
      style: { color: 'red' }
    }
  },
  '#batteryIcon'
);
```

### Numeric Ranges

```javascript
const score = state({ value: 0 });

Conditions.whenState(
  () => score.value,
  {
    '0-49': {
      textContent: 'F',
      style: { color: 'red' }
    },
    '50-69': {
      textContent: 'C',
      style: { color: 'orange' }
    },
    '70-89': {
      textContent: 'B',
      style: { color: 'blue' }
    },
    '90-100': {
      textContent: 'A',
      style: { color: 'green' }
    }
  },
  '#grade'
);
```

### String Pattern Matching

```javascript
const file = state({ name: 'document.pdf' });

Conditions.whenState(
  () => file.name,
  {
    'endsWith:.pdf': {
      textContent: '📄'
    },
    'endsWith:.jpg': {
      textContent: '🖼️'
    },
    'endsWith:.mp3': {
      textContent: '🎵'
    },
    'includes:backup': {
      innerHTML: '📄 <span class="badge">Backup</span>'
    }
  },
  '#fileIcon'
);
```

---

## Part 4: Working with Multiple Elements

### Applying to Multiple Elements at Once

When your selector matches multiple elements, conditions apply to ALL of them:

```javascript
const status = state({ value: 'active' });

// All .status-indicator elements will update
Conditions.whenState(
  () => status.value,
  {
    'active': {
      textContent: '●',
      style: { color: 'green' }
    },
    'inactive': {
      textContent: '○',
      style: { color: 'gray' }
    }
  },
  '.status-indicator'  // All elements with this class
);
```

### Array Distribution (Advanced)

You can distribute different values to different elements using arrays:

```javascript
Conditions.apply(
  'active',
  {
    'active': {
      textContent: ['First', 'Second', 'Third'],
      style: {
        color: ['red', 'blue', 'green']
      }
    }
  },
  '.items'  // If 3 elements match, they get different values
);
```

**How it works:**
- First `.items` element gets: `textContent = 'First'`, `color = 'red'`
- Second `.items` element gets: `textContent = 'Second'`, `color = 'blue'`
- Third `.items` element gets: `textContent = 'Third'`, `color = 'green'`

---

## Part 5: Batch Operations

### Updating Multiple States at Once

```javascript
// Using batch for better performance
Conditions.batch(() => {
  Conditions.apply(status.value, statusConditions, '#status');
  Conditions.apply(user.role, roleConditions, '#userRole');
  Conditions.apply(theme.mode, themeConditions, 'body');
});
```

### Batch Multiple whenState Calls

For multiple reactive conditions:

```javascript
const cleanup = Conditions.whenStates([
  [() => status.value, statusConditions, '#status'],
  [() => user.role, roleConditions, '#userRole'],
  [() => theme.mode, themeConditions, 'body']
]);

// Later, cleanup all watchers:
cleanup.destroy();
```

---

## Part 6: Global Shortcuts

If you load the shortcuts extension, you can use shorter names:

```javascript
// Instead of Conditions.whenState()
whenState(() => status.value, conditions, '#status');

// Instead of Conditions.apply()
whenApply(currentValue, conditions, '#status');

// Instead of Conditions.watch()
whenWatch(() => status.value, conditions, '#status');

// Batch version
whenStates([
  [() => status.value, statusConditions, '#status'],
  [() => user.role, roleConditions, '#userRole']
]);
```

---

## Part 7: Practical Patterns

### Pattern 1: Loading States

A common pattern for async operations:

```javascript
const dataLoader = state({
  status: 'idle', // idle, loading, success, error
  data: null,
  error: null
});

// Loader visibility
Conditions.whenState(
  () => dataLoader.status,
  {
    'idle': { style: { display: 'none' } },
    'loading': { style: { display: 'flex' } },
    'success': { style: { display: 'none' } },
    'error': { style: { display: 'none' } }
  },
  '#loader'
);

// Content visibility
Conditions.whenState(
  () => dataLoader.status,
  {
    'idle': { style: { display: 'none' } },
    'loading': { style: { display: 'none' } },
    'success': { style: { display: 'block' } },
    'error': { style: { display: 'none' } }
  },
  '#content'
);

// Error visibility
Conditions.whenState(
  () => dataLoader.status,
  {
    'idle': { style: { display: 'none' } },
    'loading': { style: { display: 'none' } },
    'success': { style: { display: 'none' } },
    'error': { style: { display: 'block' } }
  },
  '#error'
);

// Fetch data
async function loadData() {
  dataLoader.status = 'loading';

  try {
    const response = await fetch('/api/data');
    dataLoader.data = await response.json();
    dataLoader.status = 'success';
  } catch (err) {
    dataLoader.error = err.message;
    dataLoader.status = 'error';
  }
}
```

---

### Pattern 2: Form Validation Feedback

```javascript
const form = state({
  email: '',
  emailStatus: 'empty' // empty, valid, invalid
});

// Validate on change
effect(() => {
  if (form.email === '') {
    form.emailStatus = 'empty';
  } else if (form.email.includes('@') && form.email.includes('.')) {
    form.emailStatus = 'valid';
  } else {
    form.emailStatus = 'invalid';
  }
});

// Input styling
Conditions.whenState(
  () => form.emailStatus,
  {
    'empty': {
      classList: { remove: ['valid', 'invalid'] }
    },
    'valid': {
      classList: { add: 'valid', remove: 'invalid' }
    },
    'invalid': {
      classList: { add: 'invalid', remove: 'valid' }
    }
  },
  '#emailInput'
);

// Feedback message
Conditions.whenState(
  () => form.emailStatus,
  {
    'empty': {
      style: { display: 'none' }
    },
    'valid': {
      style: { display: 'block', color: 'green' },
      textContent: '✓ Valid email'
    },
    'invalid': {
      style: { display: 'block', color: 'red' },
      textContent: '✗ Please enter a valid email'
    }
  },
  '#emailFeedback'
);
```

---

### Pattern 3: Multi-Step Wizard

```javascript
const wizard = state({
  step: 1,
  maxSteps: 4
});

// Show correct step content
for (let i = 1; i <= wizard.maxSteps; i++) {
  Conditions.whenState(
    () => wizard.step,
    {
      [`${i}`]: { style: { display: 'block' } },
      default: { style: { display: 'none' } }
    },
    `#step${i}`
  );
}

// Update navigation buttons
effect(() => {
  Elements.prevBtn.disabled = wizard.step === 1;
  Elements.nextBtn.disabled = wizard.step === wizard.maxSteps;
  Elements.nextBtn.textContent = wizard.step === wizard.maxSteps ? 'Finish' : 'Next';
});

// Progress indicator
effect(() => {
  const progress = (wizard.step / wizard.maxSteps) * 100;
  Elements.progressBar.style.width = `${progress}%`;
  Elements.stepIndicator.textContent = `Step ${wizard.step} of ${wizard.maxSteps}`;
});

// Navigation
Elements.prevBtn.addEventListener('click', () => {
  if (wizard.step > 1) wizard.step--;
});

Elements.nextBtn.addEventListener('click', () => {
  if (wizard.step < wizard.maxSteps) wizard.step++;
});
```

---

### Pattern 4: Tab Interface

```javascript
const tabs = state({ activeTab: 'overview' });

// Tab highlighting
Conditions.whenState(
  () => tabs.activeTab,
  {
    'overview': { classList: { add: 'active' } },
    default: { classList: { remove: 'active' } }
  },
  '#overviewTab'
);

Conditions.whenState(
  () => tabs.activeTab,
  {
    'features': { classList: { add: 'active' } },
    default: { classList: { remove: 'active' } }
  },
  '#featuresTab'
);

Conditions.whenState(
  () => tabs.activeTab,
  {
    'pricing': { classList: { add: 'active' } },
    default: { classList: { remove: 'active' } }
  },
  '#pricingTab'
);

// Panel visibility
Conditions.whenState(
  () => tabs.activeTab,
  {
    'overview': { style: { display: 'block' } },
    default: { style: { display: 'none' } }
  },
  '#overviewPanel'
);

Conditions.whenState(
  () => tabs.activeTab,
  {
    'features': { style: { display: 'block' } },
    default: { style: { display: 'none' } }
  },
  '#featuresPanel'
);

Conditions.whenState(
  () => tabs.activeTab,
  {
    'pricing': { style: { display: 'block' } },
    default: { style: { display: 'none' } }
  },
  '#pricingPanel'
);

// Tab click handlers
Elements.overviewTab.addEventListener('click', () => tabs.activeTab = 'overview');
Elements.featuresTab.addEventListener('click', () => tabs.activeTab = 'features');
Elements.pricingTab.addEventListener('click', () => tabs.activeTab = 'pricing');
```

---

## Part 8: Cleanup and Memory Management

### Destroying Watchers

When using reactive conditions, always cleanup when done:

```javascript
// Create a watcher
const cleanup = Conditions.whenState(
  () => status.value,
  conditions,
  '#element'
);

// Later, when component is removed:
cleanup.destroy();  // Stops watching and removes event listeners
```

### Batch Cleanup

```javascript
const cleanup = Conditions.whenStates([
  [() => status.value, statusConditions, '#status'],
  [() => user.role, roleConditions, '#userRole']
]);

// Cleanup all at once
cleanup.destroy();
```

---

## Quick Reference Card

### Three Main Methods

```javascript
// 1. Auto-reactive (recommended)
Conditions.whenState(
  () => state.value,     // Function
  { /* conditions */ },
  '#selector'
);

// 2. Static one-time
Conditions.apply(
  currentValue,          // Direct value
  { /* conditions */ },
  '#selector'
);

// 3. Explicit reactive
Conditions.watch(
  () => state.value,     // Function
  { /* conditions */ },
  '#selector'
);
```

### Condition Types

```javascript
// Boolean
'true'           // value === true
'false'          // value === false
'truthy'         // !!value
'falsy'          // !value

// Empty/Null
'null'           // value === null
'undefined'      // value === undefined
'empty'          // empty string, array, or object

// Exact Match
'myValue'        // String equality
'"quoted"'       // Exact string with quotes

// Numeric
'42'             // Exact number
'>10'            // Greater than
'>=10'           // Greater than or equal
'<10'            // Less than
'<=10'           // Less than or equal
'10-20'          // Range (inclusive)

// String Patterns
'includes:text'    // Contains substring
'startsWith:pre'   // Starts with prefix
'endsWith:suf'     // Ends with suffix

// Default
default          // Fallback when nothing matches
```

### Property Updates

```javascript
{
  'condition': {
    textContent: 'Text',
    innerHTML: '<b>HTML</b>',
    style: { property: 'value' },
    classList: { add: 'class', remove: 'other' },
    dataset: { key: 'value' },
    attrs: { attribute: 'value' }
  }
}
```

---

## Best Practices

### 📌 Use Functions for Reactive Values

```javascript
// ✅ Good: Function returns reactive value
Conditions.whenState(() => status.value, conditions, '#element');

// ❌ Bad: Direct value won't update
Conditions.whenState(status.value, conditions, '#element');

// ✅ For static values, use apply()
Conditions.apply(status.value, conditions, '#element');
```

### 📌 Use Meaningful State Values

```javascript
// ✅ Good: Clear, descriptive states
const page = state({ status: 'loading' }); // loading, ready, error

// ❌ Bad: Cryptic values
const page = state({ status: 1 }); // What does 1 mean?
```

### 📌 Always Cleanup Reactive Watchers

```javascript
// ✅ Good: Store and cleanup
const cleanup = Conditions.whenState(...);
// Later:
cleanup.destroy();

// ❌ Bad: No cleanup (memory leak)
Conditions.whenState(...); // Lost reference!
```

### 📌 Use Default Branch for Safety

```javascript
// ✅ Good: Has fallback
Conditions.whenState(() => status.value, {
  'loading': { /* ... */ },
  'ready': { /* ... */ },
  default: { textContent: 'Unknown' }
}, '#status');
```

---

## What You've Learned 🎓

| Concept | What It Does |
|---------|--------------|
| `Conditions.whenState()` | Auto-reactive conditional rendering |
| `Conditions.apply()` | One-time static application |
| `Conditions.watch()` | Explicit reactive watching |
| Condition matchers | Boolean, numeric, string patterns |
| Default branch | Fallback when no match |
| Cleanup | Prevent memory leaks |

---

## Common Mistakes to Avoid

### ❌ Wrong: Passing state object directly
```javascript
Conditions.whenState(status, 'value', { ... }); // DOESN'T WORK
```

### ✅ Right: Pass a function
```javascript
Conditions.whenState(() => status.value, { ... }, '#element');
```

---

### ❌ Wrong: Selector inside conditions
```javascript
Conditions.whenState(() => status.value, {
  'loading': {
    '#element': { textContent: 'Loading' }  // Wrong!
  }
}, ...);
```

### ✅ Right: Selector as third argument
```javascript
Conditions.whenState(() => status.value, {
  'loading': {
    textContent: 'Loading'  // Correct!
  }
}, '#element');
```

---

## Practice Challenge 🚀

Build a **notification center** with:

1. State tracks: notifications array, filter (all/unread/read)
2. Show "No notifications" when empty
3. Show notification count badge when > 0
4. Filter tabs switch between all/unread/read
5. Mark as read changes the styling

Use `whenState()` for filter states and effects for dynamic content!

---

## Next Steps

You're almost there! Let's put everything together:

- [Building a Todo App](building-a-todo-app.md) — Complete hands-on project

You've got this! 🚀