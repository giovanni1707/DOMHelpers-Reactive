# Architecture Overview: How the Pieces Fit Together

## The Big Picture

Before diving into specific patterns and examples, it's crucial to understand **how Reactive and DOM Helpers work together as a system**.

Think of building a web application as **managing two distinct concerns**:

1. **What the data is** (State)
2. **How the UI reflects that data** (DOM)

**The Reactive system handles concern #1.**  
**DOM Helpers handles concern #2.**  
**Together, they create a seamless flow from state to screen.**

This section explains the architecture, the role of each component, and how data flows through the system.

---

## The Four Components

When you pair Reactive with DOM Helpers, you get **four distinct components** working together:

### 1. **Reactive System** - The State Layer
### 2. **DOM Helpers Core** - The Access Layer  
### 3. **Enhancers** - The Convenience Layer
### 4. **Conditions** - The Logic Layer

Each component has a **clear, focused responsibility**. Let's break them down.

---

## Component #1: Reactive System (State Layer)

### Responsibility: Manage Application State

The Reactive system is responsible for:

✅ **Storing application data** - Your single source of truth  
✅ **Tracking dependencies** - Know what depends on what  
✅ **Triggering reactions** - Automatically run effects when state changes  
✅ **Computing derived values** - Calculate values based on state  

**Key APIs:**
- `state()` - Create reactive state
- `computed()` - Define derived values
- `effect()` - Run side effects when state changes
- `watch()` - Watch specific properties
- `batch()` - Optimize multiple updates

**Example:**
```javascript
// Define state
const user = state({
  firstName: 'Sarah',
  lastName: 'Chen',
  age: 28
});

// Computed value (derived state)
computed(user, {
  fullName: function() {
    return `${this.firstName} ${this.lastName}`;
  },
  isAdult: function() {
    return this.age >= 18;
  }
});

// Effect (reaction to state changes)
effect(() => {
  console.log('User changed:', user.fullName);
});
```

**What the Reactive system does NOT do:**
- ❌ It doesn't know about the DOM
- ❌ It doesn't select elements
- ❌ It doesn't update UI directly

**That's intentional.** The Reactive system is **purely about state**. This keeps it simple, testable, and framework-agnostic.

---

## Component #2: DOM Helpers Core (Access Layer)

### Responsibility: Clean DOM Access and Updates

DOM Helpers Core provides **clean, expressive ways** to access and update DOM elements.

✅ **Element selection** - Access elements without repetitive code  
✅ **Bulk updates** - Update multiple elements at once  
✅ **Bulk property updaters** - Update one property across many elements  
✅ **Collection access** - Work with groups of elements  

**Key APIs:**
- `Elements.id` - Access element by ID
- `ClassName.name` - Access elements by class
- `TagName.tag` - Access elements by tag
- `querySelector()` / `querySelectorAll()` - CSS selector queries
- `Elements.update()` - Bulk update multiple elements
- `Elements.propertyName()` - Bulk property updaters

**Example:**
```javascript
// Element access (clean)
const header = Elements.header;
const buttons = ClassName.btn;

// Bulk property updater (same property, multiple elements)
Elements.textContent({
  title: 'Welcome',
  subtitle: 'Get started',
  footer: '© 2024'
});

// Bulk update (different properties, multiple elements)
Elements.update({
  header: { textContent: 'Dashboard', style: { color: 'blue' } },
  sidebar: { classList: { add: 'active' } }
});

// Collection update (arrays distribute automatically)
ClassName.btn.update({
  textContent: ['Home', 'About', 'Contact'],
  disabled: [false, false, true]
});
```

**What DOM Helpers Core does NOT do:**
- ❌ It doesn't manage state
- ❌ It doesn't know when state changes
- ❌ It doesn't trigger automatically

**That's the Reactive system's job.** Core just provides the **tools to update the DOM cleanly**.

---

## Component #3: Enhancers (Convenience Layer)

### Responsibility: Extend and Simplify

Enhancers provide **shortcuts and enhancements** that make common patterns easier.

✅ **Bulk property updaters** - Update properties across multiple elements  
✅ **Collection shortcuts** - Global access to element collections  
✅ **Array distribution** - Automatically map arrays to collections  
✅ **Indexed updates** - Update specific elements by index  

**Key APIs:**
- `Elements.textContent()` - Bulk text updates
- `Elements.style()` - Bulk style updates
- `Elements.classList()` - Bulk class updates
- `ClassName.name` - Collection shortcut
- `TagName.name` - Collection shortcut

**Example:**
```javascript
// Bulk property updater - update textContent for many elements
Elements.textContent({
  userName: user.name,
  userEmail: user.email,
  userRole: user.role
});

// Collection with array distribution
ClassName['nav-item'].update({
  textContent: ['Home', 'About', 'Services', 'Contact'],
  classList: { add: ['active', '', '', ''] }
});

// Indexed updates - target specific elements
ClassName.btn.update({
  [0]: { textContent: 'First', style: { color: 'red' } },
  [1]: { textContent: 'Second', style: { color: 'blue' } }
});
```

**Enhancers are optional but highly recommended.** They eliminate boilerplate and make your code more expressive.

---

## Component #4: Conditions (Logic Layer)

### Responsibility: Declarative Conditional Rendering

Conditions replace imperative if-else chains with **declarative state mappings**.

✅ **Declarative logic** - Map states to UI configurations  
✅ **Automatic reactivity** - Integrate seamlessly with Reactive  
✅ **Clean conditionals** - No verbose if-else chains  
✅ **Extensible** - Custom matchers and handlers  

**Key APIs:**
- `whenState()` - Apply conditions based on reactive state
- `whenWatch()` - Explicit reactive watching
- `whenApply()` - One-time static application
- `registerMatcher()` - Custom condition matchers
- `registerHandler()` - Custom property handlers

**Example:**
```javascript
// Declarative conditional rendering
whenState(
  () => request.status,
  {
    loading: { 
      textContent: 'Loading...',
      classList: { add: 'loading' },
      disabled: true
    },
    success: { 
      textContent: 'Success!',
      classList: { add: 'success' },
      disabled: false
    },
    error: { 
      textContent: 'Error!',
      classList: { add: 'error' },
      disabled: false
    }
  },
  '#submitBtn'
);
```

**Conditions are powerful for:**
- State-based UI changes
- Show/hide logic
- Dynamic styling based on conditions
- Complex conditional behaviors

---

## How Data Flows Through the System

Understanding the **data flow** is key to understanding the architecture.

Here's how state changes flow to the DOM:

```
┌─────────────────────┐
│  Reactive State     │  ← You modify state
│  (state, computed)  │
└──────────┬──────────┘
           │
           │ State changes trigger...
           ↓
┌─────────────────────┐
│  Reactions/Effects  │  ← Effects run automatically
│  (effect, watch)    │
└──────────┬──────────┘
           │
           │ Effects use...
           ↓
┌─────────────────────┐
│  DOM Helpers Core   │  ← Clean element access
│  (Elements, etc.)   │
└──────────┬──────────┘
           │
           │ Core uses...
           ↓
┌─────────────────────┐
│ Enhancers &         │  ← Bulk updates, conditions
│ Conditions          │
└──────────┬──────────┘
           │
           │ Finally updates...
           ↓
┌─────────────────────┐
│      The DOM        │  ← User sees changes
└─────────────────────┘
```

**Let's trace a real example through this flow:**

---

## Complete Example: Data Flow in Action

Let's build a **simple counter** and trace how data flows through the system.

### Step 1: Define State (Reactive System)

```javascript
const counter = state({
  count: 0
});

computed(counter, {
  doubled: function() {
    return this.count * 2;
  },
  isEven: function() {
    return this.count % 2 === 0;
  }
});
```

**State layer established:**
- `counter.count` - Raw state
- `counter.doubled` - Computed (derived)
- `counter.isEven` - Computed (derived)

---

### Step 2: Create Effects (Reactive System)

```javascript
// Effect 1: Update count displays
effect(() => {
  Elements.textContent({
    countDisplay: counter.count,
    doubledDisplay: counter.doubled
  });
});

// Effect 2: Toggle even/odd styling
whenState(
  () => counter.isEven,
  {
    true: { classList: { add: 'even', remove: 'odd' } },
    false: { classList: { add: 'odd', remove: 'even' } }
  },
  '#countDisplay'
);
```

**Reactions established:**
- Effect tracks `counter.count` and `counter.doubled`
- Condition tracks `counter.isEven`

---

### Step 3: The HTML Structure

```html
<div id="counter-app">
  <div id="countDisplay">0</div>
  <div id="doubledDisplay">0</div>
  <button id="incrementBtn">+1</button>
</div>
```

**Structure in place.** Now let's see the flow.

---

### Step 4: User Interaction (The Trigger)

```javascript
// User clicks increment button
Elements.incrementBtn.addEventListener('click', () => {
  counter.count++;  // ← This triggers everything
});
```

**What happens when `counter.count++` runs?**

---

### Step 5: Data Flow Breakdown

**1. State Changes (Reactive System)**
```
counter.count = 0 → 1
```
- State updates
- Reactive system detects the change
- Dependencies are tracked

**2. Computed Values Recalculate (Reactive System)**
```
counter.doubled = 0 → 2  (auto-recomputed)
counter.isEven = true → false  (auto-recomputed)
```

**3. Effects Trigger (Reactive System)**
```
Effect 1 queued for execution
Condition queued for re-evaluation
```

**4. DOM Helpers Core Executes Updates**
```javascript
// Effect 1 runs:
Elements.textContent({
  countDisplay: 1,      // ← Bulk property updater
  doubledDisplay: 2
});
```

**5. Enhancers Apply Changes**
```
Elements.countDisplay.textContent = 1
Elements.doubledDisplay.textContent = 2
```

**6. Conditions Apply Logic**
```javascript
// Condition evaluates counter.isEven (now false)
// Applies 'odd' configuration:
Elements.countDisplay.classList.add('odd');
Elements.countDisplay.classList.remove('even');
```

**7. DOM Updates (Browser)**
```html
<!-- Before -->
<div id="countDisplay" class="even">0</div>
<div id="doubledDisplay">0</div>

<!-- After -->
<div id="countDisplay" class="odd">1</div>
<div id="doubledDisplay">2</div>
```

**User sees the updated UI! ✨**

---

## The Flow in Plain English

Let's describe the same flow in simple terms:

1. **You change state** → `counter.count++`
2. **Reactive notices** → "count changed!"
3. **Computed recalculates** → `doubled` and `isEven` update
4. **Effects run** → Your effect functions execute
5. **DOM Helpers accesses elements** → Clean, cached access
6. **Enhancers apply updates** → Bulk property updaters work
7. **Conditions evaluate** → Declarative logic applies
8. **DOM updates** → Browser renders changes

**All automatically. All efficiently. All declaratively.**

---

## Mental Model: The Three Zones

Think of the architecture as **three distinct zones**:

### Zone 1: State (Reactive System)
**"What is true about my application?"**

```javascript
const app = state({
  user: { name: 'Sarah', role: 'admin' },
  todos: [],
  loading: false
});

computed(app, {
  todoCount: function() { return this.todos.length; }
});
```

**This zone:**
- Knows nothing about the DOM
- Pure data and logic
- Testable in isolation

---

### Zone 2: Behavior (Effects + DOM Helpers)
**"How does the UI respond to state?"**

```javascript
effect(() => {
  Elements.textContent({
    userName: app.user.name,
    userRole: app.user.role,
    todoCount: app.todoCount
  });
});

whenState(
  () => app.loading,
  {
    true: { classList: { add: 'loading' } },
    false: { classList: { remove: 'loading' } }
  },
  '#app'
);
```

**This zone:**
- Connects state to DOM
- Uses DOM Helpers for clean updates
- Declarative, not imperative

---

### Zone 3: Structure (HTML)
**"What is the UI layout?"**

```html
<div id="app">
  <h1 id="userName"></h1>
  <span id="userRole"></span>
  <div id="todoCount"></div>
</div>
```

**This zone:**
- Static structure
- No embedded logic
- Designer-friendly

---

## Why This Architecture Works

### 1. Clear Separation of Concerns

Each zone has **one job**:
- State zone: Manage data
- Behavior zone: Connect state to UI
- Structure zone: Define layout

**No mixing. No confusion.**

---

### 2. Unidirectional Data Flow

Data flows **one way**:
```
State → Effects → DOM Helpers → DOM
```

**Benefits:**
- Easy to trace bugs (follow the flow)
- Predictable updates (no circular dependencies)
- Simple mental model (always flows down)

---

### 3. Reactive by Default, Manual When Needed

**Reactive mode** (automatic):
```javascript
effect(() => {
  Elements.userName.textContent = user.name;
});
// Updates automatically when user.name changes
```

**Manual mode** (explicit):
```javascript
function updateUserName() {
  Elements.userName.textContent = user.name;
}
// Only updates when you call it
```

**You choose the right tool for the job.**

---

### 4. Testable Components

Each zone can be **tested independently**:

**Test state:**
```javascript
const app = state({ count: 0 });
app.count++;
assert(app.count === 1); // ✓
```

**Test computed:**
```javascript
computed(app, {
  doubled: function() { return this.count * 2; }
});
assert(app.doubled === 2); // ✓
```

**Test DOM updates** (mock DOM):
```javascript
Elements.textContent({ display: app.count });
assert(Elements.display.textContent === '1'); // ✓
```

---

## Real-World Example: Login Form

Let's see the complete architecture in a realistic scenario.

### HTML Structure (Zone 3)
```html
<form id="loginForm">
  <input id="emailInput" type="email" placeholder="Email">
  <input id="passwordInput" type="password" placeholder="Password">
  <button id="submitBtn" type="submit">Login</button>
  <div id="errorMsg"></div>
</form>
```

---

### State Layer (Zone 1 - Reactive)
```javascript
const loginState = state({
  email: '',
  password: '',
  loading: false,
  error: null
});

computed(loginState, {
  isValid: function() {
    return this.email.length > 0 && this.password.length >= 6;
  },
  canSubmit: function() {
    return this.isValid && !this.loading;
  }
});
```

---

### Behavior Layer (Zone 2 - Effects + DOM Helpers)

```javascript
// Update button state
whenState(
  () => loginState.canSubmit,
  {
    true: { disabled: false, style: { opacity: '1' } },
    false: { disabled: true, style: { opacity: '0.5' } }
  },
  '#submitBtn'
);

// Show/hide loading state
whenState(
  () => loginState.loading,
  {
    true: { textContent: 'Logging in...' },
    false: { textContent: 'Login' }
  },
  '#submitBtn'
);

// Display errors
whenState(
  () => loginState.error !== null,
  {
    true: { 
      textContent: loginState.error,
      style: { display: 'block', color: 'red' }
    },
    false: { 
      style: { display: 'none' }
    }
  },
  '#errorMsg'
);

// Handle form submission
Elements.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  loginState.loading = true;
  loginState.error = null;
  
  try {
    await loginUser(loginState.email, loginState.password);
    // Success! Redirect or update UI
  } catch (err) {
    loginState.error = err.message;
  } finally {
    loginState.loading = false;
  }
});

// Sync inputs with state
Elements.emailInput.addEventListener('input', (e) => {
  loginState.email = e.target.value;
});

Elements.passwordInput.addEventListener('input', (e) => {
  loginState.password = e.target.value;
});
```

---

### The Flow When User Types Email

1. **User types** → Input event fires
2. **Event handler runs** → `loginState.email = 'user@example.com'`
3. **State updates** → Reactive system detects change
4. **Computed recalculates** → `isValid` and `canSubmit` update
5. **Conditions re-evaluate** → Button enable/disable condition checks
6. **DOM updates** → Button becomes enabled, opacity changes

**All automatic. All efficient.**

---

## Key Architectural Principles

### Principle 1: Single Source of Truth
**State is the only source of truth.**

```javascript
// ✅ Good: State drives UI
const app = state({ darkMode: false });
whenState(() => app.darkMode, { true: {...}, false: {...} }, 'body');

// ❌ Bad: UI state separate from app state
const darkMode = false; // State
body.classList.add('dark'); // Separate UI state (out of sync!)
```

---

### Principle 2: Unidirectional Flow
**Data flows one direction: State → DOM**

```javascript
// ✅ Good: Clear flow
counter.count++; // Change state
// → Effect runs
// → DOM updates

// ❌ Bad: Bidirectional flow (confusing)
counter.count++;
Element.display.textContent = counter.count;
counter.count = parseInt(Element.display.textContent); // Reading back from DOM!
```

---

### Principle 3: Declarative Over Imperative
**Describe what, not how.**

```javascript
// ✅ Good: Declarative
whenState(
  () => user.status,
  {
    active: { classList: { add: 'active' } },
    inactive: { classList: { remove: 'active' } }
  },
  '#userBadge'
);

// ❌ Bad: Imperative
if (user.status === 'active') {
  document.getElementById('userBadge').classList.add('active');
} else {
  document.getElementById('userBadge').classList.remove('active');
}
```

---

### Principle 4: Separation of Concerns
**Each layer has one responsibility.**

```javascript
// ✅ Good: Separated
// State
const cart = state({ items: [] });
computed(cart, { total: function() { /* calculate */ } });

// Behavior
effect(() => {
  Elements.cartTotal.textContent = cart.total;
});

// ❌ Bad: Mixed
const cart = state({ items: [] });
effect(() => {
  const total = cart.items.reduce(/*...*/); // Calculation in effect!
  document.getElementById('cartTotal').textContent = total; // Manual DOM!
});
```

---

## Summary: The Architecture

| Component | Purpose | Example |
|-----------|---------|---------|
| **Reactive System** | Manage state and reactions | `state()`, `computed()`, `effect()` |
| **DOM Helpers Core** | Clean DOM access and updates | `Elements.id`, `ClassName.name` |
| **Enhancers** | Convenience and shortcuts | Bulk property updaters, array distribution |
| **Conditions** | Declarative conditional logic | `whenState()`, matchers, handlers |

**Data Flow:**
```
State → Computed → Effects → DOM Helpers → Enhancers/Conditions → DOM
```

**Zones:**
```
State (Reactive) ↔ Behavior (Effects + DOM Helpers) ↔ Structure (HTML)
```

---

## What You've Learned

✅ **How Reactive and DOM Helpers work together**  
✅ **The role of each component**  
✅ **How data flows through the system**  
✅ **Why this architecture is clean and scalable**  
✅ **Mental models for understanding the system**

---

## What's Next?

Now that you understand the **architecture and data flow**, you're ready to dive into **practical patterns**.

