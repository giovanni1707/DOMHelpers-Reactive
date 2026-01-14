# form.setTouched()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Check initial touched state
console.log(form.touched.email); // false (not touched)

// Mark field as touched
form.setTouched('email', true);

console.log(form.touched.email); // true
console.log(form.isTouched('email')); // true

// Mark as untouched
form.setTouched('email', false);

console.log(form.touched.email); // false

// Chain multiple calls
form
  .setTouched('email', true)
  .setTouched('password', true)
  .setTouched('username', true);

console.log(form.touchedFields); // ['email', 'password', 'username']
```

**What just happened?** `setTouched()` manually controls whether a field is marked as "touched" - perfect for custom UX flows!

 

## What is form.setTouched()?

`form.setTouched()` is the **manual touch state control method** for marking individual fields as touched or untouched.

Simply put, it's how you tell the form "the user has interacted with this field" (or hasn't).

**Key characteristics:**
- ✅ Sets touched state for a single field
- ✅ Can mark as touched (true) or untouched (false)
- ✅ Useful for custom validation UX
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Mark field as touched
form.setTouched(field, true)

// Mark field as untouched
form.setTouched(field, false)

// Chain multiple calls
form
  .setTouched('field1', true)
  .setTouched('field2', true);
```

**Parameters:**
- `field` (string) - The name of the field
- `touched` (boolean) - `true` to mark as touched, `false` for untouched

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Automatic Touch Tracking

By default, `setValue()` automatically marks fields as touched. But sometimes you need manual control:

```javascript
const form = Forms.create({
  email: ''
});

// setValue() automatically marks as touched
form.setValue('email', 'user@example.com');
console.log(form.touched.email); // true (automatic)

// But what if you're programmatically loading data?
// You don't want to show validation errors immediately!

// setTouched() gives you control
form.setValue('email', 'user@example.com');
form.setTouched('email', false); // Keep as untouched
console.log(form.touched.email); // false (manual control)
```

**When to use setTouched():**
✅ **Loading saved data** - Don't show errors on load
✅ **Programmatic updates** - Control when errors appear
✅ **Custom UX flows** - Mark fields touched on submit
✅ **Reset functionality** - Mark all fields as untouched
✅ **Multi-step forms** - Control touched state per step

 

## Mental Model

Think of `setTouched()` as a **manual interaction flag** - you're telling the form whether the user has engaged with a field.

### Visual Representation

```
Default Behavior (setValue):
User types → setValue('email', 'text')
                    ↓
            touched = true (automatic)
                    ↓
            Show validation errors

Manual Control (setTouched):
Load data → setValue('email', 'text')
                    ↓
            setTouched('email', false)
                    ↓
            touched = false (override)
                    ↓
            Hide validation errors until user actually touches field
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.setTouched('email', true);

// Here's what happens internally:
1️⃣ Update the touched state
   form.touched.email = true

2️⃣ Trigger reactive updates
   - form.isDirty recalculates
   - form.touchedFields updates

3️⃣ All reactive effects fire
   - Error display logic updates
   - Field styling changes
   - UI responds to touched state

4️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
setTouched('email', true)
         ↓
    Update touched.email = true
         ↓
    Reactive properties update:
    - isDirty
    - touchedFields
         ↓
    Effects fire (error display, styling, etc.)
         ↓
    UI updates automatically
```

 

## Basic Usage

### Example 1: Mark Field as Touched on Blur

```javascript
const form = Forms.create({
  email: ''
});

const emailInput = document.getElementById('email');

// Mark as touched when user leaves field
emailInput.addEventListener('blur', () => {
  form.setTouched('email', true);
});

// Now errors show after user leaves the field
effect(() => {
  if (form.isTouched('email') && form.hasError('email')) {
    showError(form.getError('email'));
  }
});
```

 

### Example 2: Don't Mark as Touched on Data Load

```javascript
const form = Forms.create({
  username: '',
  email: '',
  bio: ''
});

async function loadUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();

  // Load data without marking as touched
  Object.entries(data).forEach(([field, value]) => {
    form.setValue(field, value);
    form.setTouched(field, false); // Override automatic touch
  });

  // Errors won't show until user actually touches fields
}
```

 

### Example 3: Mark All Fields as Touched on Submit

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

submitButton.addEventListener('click', (e) => {
  e.preventDefault();

  // Mark all fields as touched to show all errors
  Object.keys(form.values).forEach(field => {
    form.setTouched(field, true);
  });

  // Now all validation errors are visible
  if (form.isValid) {
    handleSubmit();
  }
});
```

 

### Example 4: Reset Touched State

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

function resetForm() {
  // Reset values
  form.setValues({
    email: '',
    password: ''
  });

  // Reset touched state
  Object.keys(form.values).forEach(field => {
    form.setTouched(field, false);
  });

  // Form is now completely clean
}

resetButton.addEventListener('click', resetForm);
```

 

### Example 5: Conditional Touch State

```javascript
const form = Forms.create({
  agreeToTerms: false,
  email: ''
});

// Only mark email as touched if user agreed to terms
effect(() => {
  const agreed = form.getValue('agreeToTerms');

  if (!agreed) {
    // User hasn't agreed - keep email untouched
    form.setTouched('email', false);
  }
});
```

 

## Advanced Patterns

### Pattern 1: Smart Data Loading

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

async function loadFormData(data, options = {}) {
  const { markAsTouched = false } = options;

  Object.entries(data).forEach(([field, value]) => {
    form.setValue(field, value);

    if (!markAsTouched) {
      form.setTouched(field, false);
    }
  });
}

// Usage:
// Load draft - don't show errors
await loadFormData(draftData, { markAsTouched: false });

// Load for editing - show errors
await loadFormData(editData, { markAsTouched: true });
```

 

### Pattern 2: Progressive Touch Tracking

```javascript
const form = Forms.create({
  step1_field1: '',
  step1_field2: '',
  step2_field1: '',
  step2_field2: ''
});

let currentStep = 1;

function markStepFieldsAsTouched(stepNumber) {
  const stepPrefix = `step${stepNumber}_`;

  Object.keys(form.values).forEach(field => {
    if (field.startsWith(stepPrefix)) {
      form.setTouched(field, true);
    }
  });
}

// When moving to next step, mark current step as touched
nextButton.addEventListener('click', () => {
  markStepFieldsAsTouched(currentStep);

  if (isStepValid(currentStep)) {
    currentStep++;
  }
});
```

 

### Pattern 3: Debounced Touch Marking

```javascript
const form = Forms.create({
  searchQuery: ''
});

let touchTimeout;

searchInput.addEventListener('input', (e) => {
  form.setValue('searchQuery', e.target.value);

  // Don't mark as touched immediately
  form.setTouched('searchQuery', false);

  // Mark as touched after user stops typing
  clearTimeout(touchTimeout);
  touchTimeout = setTimeout(() => {
    form.setTouched('searchQuery', true);
  }, 1000);
});
```

 

### Pattern 4: Conditional Field Touch Reset

```javascript
const form = Forms.create({
  accountType: 'personal',
  companyName: '',
  taxId: '',
  personalId: ''
});

effect(() => {
  const accountType = form.getValue('accountType');

  if (accountType === 'personal') {
    // Reset business field touch states
    form.setTouched('companyName', false);
    form.setTouched('taxId', false);
  } else {
    // Reset personal field touch states
    form.setTouched('personalId', false);
  }
});
```

 

### Pattern 5: Touch State Persistence

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Save touch state to localStorage
function saveTouchState() {
  const touchState = { ...form.touched };
  localStorage.setItem('formTouchState', JSON.stringify(touchState));
}

// Restore touch state
function restoreTouchState() {
  const saved = localStorage.getItem('formTouchState');

  if (saved) {
    const touchState = JSON.parse(saved);

    Object.entries(touchState).forEach(([field, touched]) => {
      form.setTouched(field, touched);
    });
  }
}

// Auto-save touch state
effect(() => {
  JSON.stringify(form.touched); // Track changes
  saveTouchState();
});

// Restore on load
restoreTouchState();
```

 

### Pattern 6: Smart Validation Trigger

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

let validationMode = 'onBlur'; // or 'onChange'

function setupValidationTrigger(field) {
  const inputEl = document.querySelector(`[name="${field}"]`);

  if (validationMode === 'onBlur') {
    inputEl.addEventListener('blur', () => {
      form.setTouched(field, true);
      form.validateField(field);
    });
  } else {
    inputEl.addEventListener('input', () => {
      if (form.isTouched(field)) {
        form.validateField(field);
      }
    });

    inputEl.addEventListener('blur', () => {
      form.setTouched(field, true);
      form.validateField(field);
    });
  }
}

// Setup for all fields
Object.keys(form.values).forEach(setupValidationTrigger);
```

 

### Pattern 7: Touch State Analytics

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const touchAnalytics = {
  firstTouch: {},
  lastTouch: {},
  touchCount: {}
};

// Track touch analytics
const originalSetTouched = form.setTouched.bind(form);
form.setTouched = function(field, touched) {
  if (touched) {
    const now = Date.now();

    if (!touchAnalytics.firstTouch[field]) {
      touchAnalytics.firstTouch[field] = now;
    }

    touchAnalytics.lastTouch[field] = now;
    touchAnalytics.touchCount[field] = (touchAnalytics.touchCount[field] || 0) + 1;
  }

  return originalSetTouched(field, touched);
};

function getTouchReport() {
  return {
    touchCounts: touchAnalytics.touchCount,
    mostTouchedField: Object.entries(touchAnalytics.touchCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0],
    averageTouchCount: Object.values(touchAnalytics.touchCount)
      .reduce((sum, count) => sum + count, 0) / Object.keys(form.values).length
  };
}
```

 

### Pattern 8: Dependent Field Touch Cascading

```javascript
const form = Forms.create({
  country: '',
  state: '',
  city: '',
  zipCode: ''
});

const fieldDependencies = {
  country: ['state', 'city', 'zipCode'],
  state: ['city', 'zipCode'],
  city: ['zipCode']
};

function setTouchedWithDependents(field, touched) {
  form.setTouched(field, touched);

  // If marking as untouched, cascade to dependents
  if (!touched) {
    const dependents = fieldDependencies[field] || [];
    dependents.forEach(dependent => {
      form.setTouched(dependent, false);
    });
  }
}

// When country changes, reset dependent fields' touch state
countrySelect.addEventListener('change', () => {
  setTouchedWithDependents('country', true);
});
```

 

### Pattern 9: Touch State with Undo/Redo

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

const touchHistory = [];
let historyIndex = -1;

function saveTouchState() {
  const state = { ...form.touched };

  // Remove future history
  touchHistory.splice(historyIndex + 1);

  // Add new state
  touchHistory.push(state);
  historyIndex++;

  // Limit history size
  if (touchHistory.length > 50) {
    touchHistory.shift();
    historyIndex--;
  }
}

function undoTouchState() {
  if (historyIndex > 0) {
    historyIndex--;
    const state = touchHistory[historyIndex];

    Object.entries(state).forEach(([field, touched]) => {
      form.setTouched(field, touched);
    });
  }
}

function redoTouchState() {
  if (historyIndex < touchHistory.length - 1) {
    historyIndex++;
    const state = touchHistory[historyIndex];

    Object.entries(state).forEach(([field, touched]) => {
      form.setTouched(field, touched);
    });
  }
}
```

 

### Pattern 10: Automatic Touch on Focus Duration

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

const focusStartTimes = {};
const TOUCH_THRESHOLD_MS = 2000; // Mark as touched after 2 seconds

function setupAutoTouch(field) {
  const inputEl = document.querySelector(`[name="${field}"]`);

  inputEl.addEventListener('focus', () => {
    focusStartTimes[field] = Date.now();
  });

  inputEl.addEventListener('blur', () => {
    const focusDuration = Date.now() - (focusStartTimes[field] || 0);

    if (focusDuration >= TOUCH_THRESHOLD_MS) {
      form.setTouched(field, true);
    }

    delete focusStartTimes[field];
  });
}

// Setup for all fields
Object.keys(form.values).forEach(setupAutoTouch);
```

 

## Common Pitfalls

### Pitfall 1: Forgetting setValue() Auto-Touches

```javascript
const form = Forms.create({
  email: ''
});

// ❌ setValue() automatically marks as touched
form.setValue('email', 'user@example.com');
console.log(form.touched.email); // true (automatic)

// If you don't want this, override immediately
form.setValue('email', 'user@example.com');
form.setTouched('email', false); // Override

// ✅ Or use this helper pattern
function setValueUntouched(field, value) {
  form.setValue(field, value);
  form.setTouched(field, false);
}
```

 

### Pitfall 2: Not Resetting Touch State on Form Reset

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

// Set some data and touch state
form.setValue('field1', 'value1');
form.setTouched('field1', true);

// ❌ Only resetting values
form.setValues({
  field1: '',
  field2: ''
});
// Touch state still shows field1 as touched!

// ✅ Reset both values and touch state
function resetForm() {
  form.setValues({ field1: '', field2: '' });

  Object.keys(form.values).forEach(field => {
    form.setTouched(field, false);
  });
}
```

 

### Pitfall 3: Setting Touched on Non-Existent Fields

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ Field doesn't exist
form.setTouched('username', true);
// Sets touched state but field doesn't exist in form

// ✅ Check if field exists first
if ('username' in form.values) {
  form.setTouched('username', true);
}
```

 

### Pitfall 4: Confusing Touched with Dirty

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Touched ≠ Dirty (different concepts)
form.setTouched('email', true);
console.log(form.isDirty); // true (because email was touched)

// Touched = user interacted with field
// Dirty = at least one field is touched

// ✅ Understand the difference
console.log(form.isTouched('email')); // true (this field touched)
console.log(form.isDirty); // true (form has touched fields)
```

 

### Pitfall 5: Overusing Manual Touch Control

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Manually controlling every interaction (unnecessary)
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
  form.setTouched('email', false); // Why?
});

emailInput.addEventListener('blur', () => {
  form.setTouched('email', true);
});

// ✅ Let setValue() handle it automatically
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
  // Automatically marked as touched ✓
});

// Only use setTouched for special cases (loading data, etc.)
```

 

## Summary

### Key Takeaways

1. **`setTouched()` manually controls touched state** for individual fields.

2. **Can mark as touched or untouched** - `true` or `false`.

3. **Overrides automatic touch tracking** from `setValue()`.

4. **Perfect for data loading** - load data without showing errors.

5. **Returns form instance** - enables method chaining.

6. **Updates reactive properties** - `isDirty`, `touchedFields` recalculate.

### When to Use setTouched()

✅ **Use setTouched() for:**
- Loading saved/draft data (mark as untouched)
- Programmatic field updates (control touch state)
- Custom validation UX (mark all touched on submit)
- Form reset functionality (reset touch state)
- Multi-step forms (control touch per step)

❌ **Don't use setTouched() when:**
- Normal user input (let setValue() handle it)
- You want default behavior (automatic is better)
- Just checking touched state (use `isTouched()`)

### Comparison Table

| Operation | Method | Use Case |
|   --|  --|   -|
| Mark field touched | `setTouched('email', true)` | Manual control ✅ |
| Mark field untouched | `setTouched('email', false)` | Override auto-touch ✅ |
| Check if touched | `isTouched('email')` | Boolean check ✅ |
| Mark all touched | `touchAll()` | Validate on submit ✅ |

### One-Line Rule

> **`form.setTouched(field, boolean)` manually controls whether a field is marked as touched - essential for loading data without showing errors and custom validation UX flows.**

 

**What's Next?**

- Learn about `form.setTouchedFields()` for batch touch operations
- Explore `form.touchAll()` for marking all fields as touched
- Master `form.shouldShowError()` for smart error display logic
