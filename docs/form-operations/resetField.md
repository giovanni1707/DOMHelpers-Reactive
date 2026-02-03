# form.resetField()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: '',
  bio: ''
});

// User fills the form
form.setValue('email', 'user@example.com');
form.setValue('password', 'secret123');
form.setValue('username', 'alice');
form.setValue('bio', 'Developer');

console.log(form.values);
// { email: 'user@example.com', password: 'secret123', username: 'alice', bio: 'Developer' }

// Reset only the email field
form.resetField('email');

console.log(form.values);
// { email: '', password: 'secret123', username: 'alice', bio: 'Developer' }
console.log(form.isTouched('email')); // false (cleared)
console.log(form.getError('email')); // '' (cleared)

// Chain multiple field resets
form
  .resetField('password')
  .resetField('username');

console.log(form.values);
// { email: '', password: '', username: '', bio: 'Developer' }
```

**What just happened?** `resetField()` resets a single field to its initial state - perfect for targeted reset actions!

 

## What is form.resetField()?

`form.resetField()` is the **single field reset method** that restores one specific field to its initial state.

Simply put, it's like a mini-reset that only affects one field, clearing its value, error, and touched state.

**Key characteristics:**
- ✅ Resets one specific field
- ✅ Clears field value to initial state
- ✅ Clears field error
- ✅ Clears field touched state
- ✅ Leaves other fields unchanged
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Reset single field
form.resetField(fieldName)

// Chain multiple resets
form
  .resetField('email')
  .resetField('password');
```

**Parameters:**
- `fieldName` (string) - The name of the field to reset

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Full Reset

Sometimes you only want to reset one field, not the entire form. Using `reset()` clears everything, which is overkill.

```javascript
const form = Forms.create({
  searchQuery: '',
  filters: { category: 'all', price: 'any' },
  results: []
});

// User searches and gets results
form.setValue('searchQuery', 'laptop');
form.setValue('filters', { category: 'electronics', price: 'under-500' });
form.setValue('results', [...laptopResults]);

// ❌ Reset entire form (loses filters and results)
form.reset();
// Everything cleared!

// ✅ Reset only search query
form.resetField('searchQuery');
// Only searchQuery cleared, filters and results preserved ✓
```

**When to use resetField():**
✅ **Clear input button** - Clear specific field without affecting others
✅ **Conditional reset** - Reset dependent fields when condition changes
✅ **Error recovery** - Reset field with error while keeping others
✅ **Selective clearing** - Clear some fields, keep others
✅ **Field-level actions** - Undo changes to one field

 

## Mental Model

Think of `resetField()` as a **precision eraser** - it only erases one specific field, leaving everything else intact.

### Visual Representation

```
Before resetField('email'):
┌─────────────────────────────────────┐
│ email: "user@example.com" ✗         │
│ password: "secret123"               │
│ username: "alice"                   │
│ bio: "Developer"                    │
└─────────────────────────────────────┘
         ↓
   resetField('email')
         ↓
After resetField('email'):
┌─────────────────────────────────────┐
│ email: "" ✓                         │
│ password: "secret123" (unchanged)   │
│ username: "alice" (unchanged)       │
│ bio: "Developer" (unchanged)        │
└─────────────────────────────────────┘
  Only email cleared!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.resetField('email');

// Here's what happens internally:
1️⃣ Get the initial value for the field
   const initialValue = initialValues.email || ''

2️⃣ Reset the field value
   form.values.email = initialValue

3️⃣ Clear the field error
   form.errors.email = ''

4️⃣ Clear the field touched state
   form.touched.email = false

5️⃣ Trigger reactive updates
   - form.isValid recalculates
   - form.isDirty recalculates
   - form.hasErrors recalculates
   - form.errorFields updates
   - form.touchedFields updates

6️⃣ Reactive effects fire
   - Field UI updates
   - Error display clears
   - Field styling resets

7️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
resetField('email')
    ↓
Clear value, error, touched for 'email'
    ↓
Reactive properties update:
- isValid (if errors changed)
- isDirty (if touched changed)
- errorFields
- touchedFields
    ↓
Effects fire
    ↓
UI updates for this field
```

 

## Basic Usage

### Example 1: Clear Button for Search

```javascript
const form = Forms.create({
  searchQuery: '',
  results: []
});

searchInput.addEventListener('input', (e) => {
  form.setValue('searchQuery', e.target.value);
  performSearch(e.target.value);
});

// Clear button
clearButton.addEventListener('click', () => {
  form.resetField('searchQuery');
  searchInput.value = '';
  searchInput.focus();
});
```

 

### Example 2: Reset Dependent Field

```javascript
const form = Forms.create({
  country: '',
  state: '',
  city: ''
});

countrySelect.addEventListener('change', (e) => {
  form.setValue('country', e.target.value);

  // Reset dependent fields
  form.resetField('state');
  form.resetField('city');

  // Reload state options for new country
  loadStatesForCountry(e.target.value);
});
```

 

### Example 3: Clear Field with Error

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : ''
  }
);

// User enters invalid email
form.setValue('email', 'invalid');
console.log(form.errors.email); // 'Invalid email'

// Clear button resets field
clearButton.addEventListener('click', () => {
  form.resetField('email');
  console.log(form.errors.email); // '' (cleared)
});
```

 

### Example 4: Undo Single Field Edit

```javascript
const form = Forms.create({
  title: '',
  content: '',
  tags: []
});

// Load initial data
form.reset({
  title: 'Original Title',
  content: 'Original content...',
  tags: ['tag1', 'tag2']
});

// User edits title
form.setValue('title', 'Modified Title');

// Undo title change only
undoTitleButton.addEventListener('click', () => {
  form.resetField('title');
  // title back to 'Original Title'
  // content and tags unchanged
});
```

 

### Example 5: Conditional Field Clear

```javascript
const form = Forms.create({
  wantNewsletter: false,
  email: ''
});

newsletterCheckbox.addEventListener('change', (e) => {
  form.setValue('wantNewsletter', e.target.checked);

  // Clear email if newsletter unchecked
  if (!e.target.checked) {
    form.resetField('email');
  }
});
```

 

## Advanced Patterns

### Pattern 1: Smart Field Clear with Confirmation

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

async function clearFieldWithConfirmation(field) {
  const value = form.getValue(field);

  if (value) {
    const confirmed = await showConfirmDialog({
      title: 'Clear Field?',
      message: `Clear ${field}? This cannot be undone.`,
      confirmText: 'Clear',
      cancelText: 'Keep'
    });

    if (!confirmed) {
      return false;
    }
  }

  form.resetField(field);
  return true;
}

clearButton.addEventListener('click', () => {
  clearFieldWithConfirmation('field1');
});
```

 

### Pattern 2: Reset Field with Animation

```javascript
const form = Forms.create({
  email: ''
});

async function resetFieldWithAnimation(field) {
  const inputEl = document.querySelector(`[name="${field}"]`);

  // Animate out
  inputEl.classList.add('clearing');

  await new Promise(resolve => setTimeout(resolve, 200));

  // Reset field
  form.resetField(field);
  inputEl.value = '';

  // Animate in
  inputEl.classList.remove('clearing');
  inputEl.classList.add('cleared');

  setTimeout(() => {
    inputEl.classList.remove('cleared');
  }, 500);
}

// CSS:
// .clearing { opacity: 0.3; transition: opacity 200ms; }
// .cleared { background: #e8f5e9; transition: background 500ms; }
```

 

### Pattern 3: Reset with Undo Stack

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

const fieldUndoStack = {};

function resetFieldWithUndo(field) {
  // Save current value for undo
  if (!fieldUndoStack[field]) {
    fieldUndoStack[field] = [];
  }

  fieldUndoStack[field].push({
    value: form.getValue(field),
    error: form.getError(field),
    touched: form.isTouched(field),
    timestamp: Date.now()
  });

  // Limit stack size
  if (fieldUndoStack[field].length > 10) {
    fieldUndoStack[field].shift();
  }

  // Reset field
  form.resetField(field);

  // Show undo notification
  showNotification(`${field} cleared`, {
    action: 'Undo',
    onAction: () => undoFieldReset(field)
  });
}

function undoFieldReset(field) {
  const stack = fieldUndoStack[field];

  if (stack && stack.length > 0) {
    const state = stack.pop();

    form.setValue(field, state.value);
    form.setTouched(field, state.touched);

    if (state.error) {
      form.setError(field, state.error);
    }
  }
}
```

 

### Pattern 4: Cascading Reset

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

function resetFieldAndDependents(field) {
  form.resetField(field);

  const dependents = fieldDependencies[field] || [];
  dependents.forEach(dependent => {
    form.resetField(dependent);
  });
}

// When country changes, reset all location fields
countrySelect.addEventListener('change', () => {
  resetFieldAndDependents('country');
});
```

 

### Pattern 5: Selective Multi-Field Reset

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
});

function resetFields(fieldNames) {
  fieldNames.forEach(field => {
    form.resetField(field);
  });
}

// Reset specific group
resetSearchButton.addEventListener('click', () => {
  resetFields(['field1', 'field2', 'field3']);
  // field4 and field5 unchanged
});
```

 

### Pattern 6: Reset with Value Comparison

```javascript
const form = Forms.create({
  email: ''
});

const originalValues = {
  email: ''
};

function resetIfChanged(field) {
  const current = form.getValue(field);
  const original = originalValues[field];

  if (current !== original) {
    form.resetField(field);
    showNotification(`${field} reset to original value`);
    return true;
  }

  showNotification(`${field} already at original value`);
  return false;
}

revertButton.addEventListener('click', () => {
  resetIfChanged('email');
});
```

 

### Pattern 7: Field Reset Analytics

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

function resetFieldWithAnalytics(field, reason = 'user_action') {
  const resetData = {
    field,
    reason,
    valueBefore: form.getValue(field),
    hadError: form.hasError(field),
    wasTouched: form.isTouched(field),
    timestamp: Date.now()
  };

  analytics.track('field_reset', resetData);

  form.resetField(field);
}

clearButton.addEventListener('click', () => {
  resetFieldWithAnalytics('field1', 'clear_button');
});
```

 

### Pattern 8: Smart Reset Based on Field State

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

function smartResetField(field) {
  const hasValue = Boolean(form.getValue(field));
  const hasError = form.hasError(field);
  const isTouched = form.isTouched(field);

  if (!hasValue && !hasError && !isTouched) {
    // Already pristine
    showNotification(`${field} is already clear`);
    return;
  }

  form.resetField(field);

  if (hasError) {
    showNotification(`${field} cleared and error removed`);
  } else if (hasValue) {
    showNotification(`${field} cleared`);
  }
}
```

 

### Pattern 9: Throttled Reset

```javascript
const form = Forms.create({
  searchQuery: ''
});

let lastResetTime = 0;
const THROTTLE_MS = 1000;

function throttledResetField(field) {
  const now = Date.now();

  if (now - lastResetTime >= THROTTLE_MS) {
    form.resetField(field);
    lastResetTime = now;
  } else {
    showNotification('Please wait before clearing again');
  }
}

// Prevent rapid clearing
clearButton.addEventListener('click', () => {
  throttledResetField('searchQuery');
});
```

 

### Pattern 10: Reset with Auto-Focus

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function resetFieldAndFocus(field) {
  form.resetField(field);

  // Find and focus the input
  const inputEl = document.querySelector(`[name="${field}"]`);

  if (inputEl) {
    inputEl.value = ''; // Clear visual value
    inputEl.focus();

    // Optional: scroll into view
    inputEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

// Usage
clearButton.addEventListener('click', () => {
  resetFieldAndFocus('field1');
});
```

 

## Common Pitfalls

### Pitfall 1: Forgetting to Clear Input Element

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Resets form state but input still shows value
form.resetField('email');
// Visual input still displays old value!

// ✅ Clear both form state and input element
form.resetField('email');
emailInput.value = '';

// OR use reactive binding
effect(() => {
  emailInput.value = form.getValue('email');
});
// Now resetField automatically updates input
```

 

### Pitfall 2: Resetting Non-Existent Field

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ Field doesn't exist
form.resetField('username'); // No error, but does nothing

// ✅ Check if field exists first
if ('username' in form.values) {
  form.resetField('username');
}
```

 

### Pitfall 3: Expecting resetField to Restore Old Value

```javascript
const form = Forms.create({
  email: ''
});

// Load data
form.reset({ email: 'user@example.com' });

// User edits
form.setValue('email', 'new@example.com');

// ❌ Expecting this to restore 'user@example.com'
form.resetField('email');
console.log(form.getValue('email')); // '' (not 'user@example.com')

// resetField() goes to initial empty value, not last reset value
```

 

### Pitfall 4: Using resetField Instead of setValue

```javascript
const form = Forms.create({
  searchQuery: 'initial search'
});

// ❌ Using resetField to set a value
form.resetField('searchQuery'); // Clears to initial, not what you want

// ✅ Use setValue to change value
form.setValue('searchQuery', 'new search');

// resetField is for clearing to initial, not changing
```

 

### Pitfall 5: Not Handling Dependent Fields

```javascript
const form = Forms.create({
  country: 'US',
  state: 'CA'
});

// ❌ Resetting country but not state
form.resetField('country');
console.log(form.getValue('state')); // Still 'CA' (might be invalid)

// ✅ Reset dependent fields too
form.resetField('country');
form.resetField('state');

// OR
function resetFieldAndDependents(field) {
  form.resetField(field);
  // Reset dependent fields based on your logic
}
```

 

## Summary

### Key Takeaways

1. **`resetField()` resets one specific field** - value, error, touched state.

2. **Precision reset** - only affects one field, leaves others unchanged.

3. **Clears to initial value** - restores field to its original state.

4. **Returns form instance** - enables method chaining.

5. **Perfect for targeted actions** - clear buttons, dependent fields, error recovery.

6. **Complements reset()** - use reset() for whole form, resetField() for specific fields.

### When to Use resetField()

✅ **Use resetField() for:**
- Clear button for specific input
- Resetting dependent fields
- Clearing fields with errors
- Selective field reset
- Undo single field changes

❌ **Don't use resetField() when:**
- Need to reset entire form (use `reset()`)
- Want to set new value (use `setValue()`)
- Want to clear all errors (use `clearErrors()`)
- Resetting multiple fields (chain or use `reset()`)

### Comparison Table

| Operation | Method | Scope | Use Case |
|   --|  --|  -|   -|
| Reset one field | `resetField('email')` | Single field | Clear button ✅ |
| Reset all fields | `reset()` | All fields | Cancel, submit ✅ |
| Clear value only | `setValue('email', '')` | Value only | Keep error/touched |
| Clear error only | `clearError('email')` | Error only | Remove server error |

### One-Line Rule

> **`form.resetField(field)` resets a single field to its initial state - clearing its value, error, and touched state while leaving all other fields unchanged.**

 

**What's Next?**

- Explore complete form lifecycle management
- Master form state persistence patterns
- Learn advanced reset and undo strategies
