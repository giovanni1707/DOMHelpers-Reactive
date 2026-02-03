# form.reset()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// User fills the form
form.setValue('email', 'user@example.com');
form.setValue('password', 'secret123');
form.setValue('username', 'alice');

console.log(form.values);
// { email: 'user@example.com', password: 'secret123', username: 'alice' }
console.log(form.isDirty); // true (fields touched)

// Reset to initial values
form.reset();

console.log(form.values);
// { email: '', password: '', username: '' }
console.log(form.isDirty); // false (all cleared)
console.log(form.touchedFields); // [] (all untouched)
console.log(form.errorFields); // [] (all errors cleared)

// Reset to new values
form.reset({
  email: 'new@example.com',
  password: 'newpass',
  username: 'bob'
});

console.log(form.values);
// { email: 'new@example.com', password: 'newpass', username: 'bob' }
```

**What just happened?** `reset()` restores the form to a clean state - either to initial values or to new values you provide!

 

## What is form.reset()?

`form.reset()` is the **complete form reset method** that restores the form to its initial state or sets new initial values.

Simply put, it's the "start fresh" button that clears all values, errors, and touch states.

**Key characteristics:**
- ✅ Resets all field values to initial state
- ✅ Clears all errors
- ✅ Clears all touched states
- ✅ Optionally accepts new initial values
- ✅ Resets submission state
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Reset to original initial values
form.reset()

// Reset to new values
form.reset(newValues)

// With chaining
form
  .reset()
  .validateAllFields();
```

**Parameters:**
- `newValues` (object, optional) - New values to set as the form's initial state

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Manual Reset

Resetting a form manually requires clearing values, errors, touched states, and submission states - easy to forget something.

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// User fills and submits
form.setValue('email', 'user@example.com');
form.setValue('password', 'secret');
form.setError('email', 'Server error');

// ❌ Incomplete manual reset
form.setValues({ email: '', password: '' });
// Forgot to clear errors, touched state, submission state!

// ✅ Complete reset
form.reset();
// Clears everything in one call ✓
```

**When to use reset():**
✅ **Cancel button** - Discard changes and start over
✅ **After submission** - Clear form for next entry
✅ **Modal close** - Reset form when closing dialog
✅ **Tab switch** - Reset when switching form modes
✅ **Data reload** - Reset to new data state

 

## Mental Model

Think of `reset()` as **the master reset button** - it returns the form to factory settings.

### Visual Representation

```
Before reset():
┌─────────────────────────────────────┐
│ Values:                             │
│ - email: "user@example.com"         │
│ - password: "secret123"             │
│                                     │
│ Errors:                             │
│ - email: "Server error"             │
│                                     │
│ Touched:                            │
│ - email: true                       │
│ - password: true                    │
│                                     │
│ State:                              │
│ - isSubmitting: false               │
│ - submitCount: 2                    │
└─────────────────────────────────────┘
         ↓
   form.reset()
         ↓
After reset():
┌─────────────────────────────────────┐
│ Values:                             │
│ - email: ""                         │
│ - password: ""                      │
│                                     │
│ Errors:                             │
│ - email: ""                         │
│                                     │
│ Touched:                            │
│ - email: false                      │
│ - password: false                   │
│                                     │
│ State:                              │
│ - isSubmitting: false               │
│ - submitCount: 0                    │
└─────────────────────────────────────┘
  Everything cleared!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.reset();
// Or:
form.reset({ email: 'new@example.com' });

// Here's what happens internally:
1️⃣ Determine reset values
   const resetValues = newValues || initialValues

2️⃣ Reset all field values
   Object.keys(form.values).forEach(field => {
     form.values[field] = resetValues[field] || ''
   })

3️⃣ Clear all errors
   Object.keys(form.errors).forEach(field => {
     form.errors[field] = ''
   })

4️⃣ Clear all touched states
   Object.keys(form.touched).forEach(field => {
     form.touched[field] = false
   })

5️⃣ Reset submission state
   form.isSubmitting = false
   form.submitCount = 0

6️⃣ Trigger reactive updates (once)
   - form.isValid → true (no errors)
   - form.isDirty → false (not touched)
   - form.hasErrors → false
   - form.errorFields → []
   - form.touchedFields → []

7️⃣ All reactive effects fire (once)
   - All UI updates
   - Form appears pristine

8️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
reset(newValues)
    ↓
Clear all values, errors, touched
    ↓
Reset submission state
    ↓
Reactive properties update:
- isValid → true
- isDirty → false
- hasErrors → false
- errorFields → []
- touchedFields → []
    ↓
All effects fire once
    ↓
UI resets completely
```

 

## Basic Usage

### Example 1: Cancel Button

```javascript
const form = Forms.create({
  title: '',
  content: ''
});

// User fills form
form.setValue('title', 'Draft Title');
form.setValue('content', 'Draft content...');

// Cancel button resets everything
cancelButton.addEventListener('click', () => {
  form.reset();
  hideForm();
});
```

 

### Example 2: Reset After Successful Submit

```javascript
const form = Forms.create({
  email: '',
  message: ''
});

async function handleSubmit() {
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (response.ok) {
    showNotification('Message sent!');
    form.reset(); // Clear for next message
  } else {
    const { errors } = await response.json();
    form.setErrors(errors);
  }
}
```

 

### Example 3: Reset Modal on Close

```javascript
const form = Forms.create({
  name: '',
  email: ''
});

// Open modal
openModalButton.addEventListener('click', () => {
  modal.show();
});

// Close modal - reset form
closeModalButton.addEventListener('click', () => {
  form.reset();
  modal.hide();
});

// Also reset on backdrop click
modal.addEventListener('close', () => {
  form.reset();
});
```

 

### Example 4: Reset to New Data

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

// Load user data for editing
async function loadUser(userId) {
  const user = await fetchUser(userId);

  // Reset form to user data (becomes new "initial" state)
  form.reset(user);
  // { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' }
}

// Cancel brings back to this loaded state
cancelButton.addEventListener('click', () => {
  form.reset(); // Back to Alice's data
});
```

 

### Example 5: Reset Between Tabs

```javascript
const form = Forms.create({
  mode: 'login',
  email: '',
  password: '',
  confirmPassword: ''
});

const formModes = {
  login: {
    mode: 'login',
    email: '',
    password: '',
    confirmPassword: ''
  },
  register: {
    mode: 'register',
    email: '',
    password: '',
    confirmPassword: ''
  }
};

// Switch mode - reset to mode defaults
modeSelect.addEventListener('change', (e) => {
  const mode = e.target.value;
  form.reset(formModes[mode]);
});
```

 

## Advanced Patterns

### Pattern 1: Reset with Confirmation

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

async function resetWithConfirmation() {
  if (form.isDirty) {
    const confirmed = await showConfirmDialog({
      title: 'Discard Changes?',
      message: 'You have unsaved changes. Are you sure you want to reset?',
      confirmText: 'Yes, Reset',
      cancelText: 'Keep Editing'
    });

    if (!confirmed) {
      return false;
    }
  }

  form.reset();
  return true;
}

cancelButton.addEventListener('click', resetWithConfirmation);
```

 

### Pattern 2: Reset with Animation

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

async function resetWithAnimation() {
  // Fade out form
  formElement.classList.add('fade-out');

  await new Promise(resolve => setTimeout(resolve, 300));

  // Reset form
  form.reset();

  // Fade back in
  formElement.classList.remove('fade-out');
  formElement.classList.add('fade-in');

  setTimeout(() => {
    formElement.classList.remove('fade-in');
  }, 300);
}

// CSS:
// .fade-out { opacity: 0; transition: opacity 300ms; }
// .fade-in { opacity: 1; transition: opacity 300ms; }
```

 

### Pattern 3: Selective Reset

```javascript
const form = Forms.create({
  searchQuery: '',
  filters: {},
  selectedItems: []
});

function resetFilters() {
  // Reset only specific fields
  form.reset({
    ...form.values,
    filters: {},
    selectedItems: []
    // Keep searchQuery
  });
}

function resetAll() {
  // Reset everything
  form.reset();
}

resetFiltersButton.addEventListener('click', resetFilters);
resetAllButton.addEventListener('click', resetAll);
```

 

### Pattern 4: Reset with Undo

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

let stateBeforeReset = null;

function resetWithUndo() {
  // Save current state
  stateBeforeReset = {
    values: { ...form.values },
    errors: { ...form.errors },
    touched: { ...form.touched }
  };

  // Reset
  form.reset();

  // Show undo notification
  showNotification('Form reset', {
    action: 'Undo',
    onAction: undoReset
  });
}

function undoReset() {
  if (stateBeforeReset) {
    form.setValues(stateBeforeReset.values);
    form.setErrors(stateBeforeReset.errors);

    Object.entries(stateBeforeReset.touched).forEach(([field, touched]) => {
      form.setTouched(field, touched);
    });

    stateBeforeReset = null;
  }
}
```

 

### Pattern 5: Auto-Reset After Inactivity

```javascript
const form = Forms.create({
  searchQuery: '',
  results: []
});

let inactivityTimeout;
const INACTIVITY_MS = 300000; // 5 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);

  inactivityTimeout = setTimeout(() => {
    if (form.isDirty) {
      showNotification('Form reset due to inactivity');
      form.reset();
    }
  }, INACTIVITY_MS);
}

// Reset timer on any user activity
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);

resetInactivityTimer(); // Start timer
```

 

### Pattern 6: Reset with State Persistence

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

function saveFormState() {
  localStorage.setItem('formState', JSON.stringify({
    values: form.values,
    timestamp: Date.now()
  }));
}

function resetToSaved() {
  const saved = localStorage.getItem('formState');

  if (saved) {
    const { values, timestamp } = JSON.parse(saved);

    // Only restore if less than 1 hour old
    if (Date.now() - timestamp < 3600000) {
      form.reset(values);
      showNotification('Restored saved state');
      return;
    }
  }

  // Otherwise reset to defaults
  form.reset();
}

// Auto-save on changes
effect(() => {
  JSON.stringify(form.values); // Track changes
  saveFormState();
});
```

 

### Pattern 7: Conditional Reset Based on Mode

```javascript
const form = Forms.create({
  mode: 'create',
  id: null,
  name: '',
  email: ''
});

const resetDefaults = {
  create: {
    mode: 'create',
    id: null,
    name: '',
    email: ''
  },
  edit: {
    mode: 'edit',
    id: null,
    name: '',
    email: ''
  }
};

function resetForMode(mode) {
  form.reset(resetDefaults[mode]);
}

modeToggle.addEventListener('change', (e) => {
  const mode = e.target.value;
  resetForMode(mode);
});
```

 

### Pattern 8: Reset with Analytics

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

function resetWithAnalytics(reason = 'user_action') {
  const resetData = {
    reason,
    fieldsFilled: Object.values(form.values).filter(Boolean).length,
    hadErrors: form.hasErrors,
    wasDirty: form.isDirty,
    submitAttempts: form.submitCount,
    timestamp: Date.now()
  };

  analytics.track('form_reset', resetData);

  form.reset();
}

cancelButton.addEventListener('click', () => {
  resetWithAnalytics('cancel_button');
});

window.addEventListener('beforeunload', () => {
  if (form.isDirty) {
    resetWithAnalytics('page_unload');
  }
});
```

 

### Pattern 9: Multi-Template Reset

```javascript
const form = Forms.create({
  templateId: null,
  field1: '',
  field2: '',
  field3: ''
});

const templates = {
  blank: {
    templateId: null,
    field1: '',
    field2: '',
    field3: ''
  },
  basic: {
    templateId: 'basic',
    field1: 'Default Value 1',
    field2: 'Default Value 2',
    field3: ''
  },
  advanced: {
    templateId: 'advanced',
    field1: 'Advanced Value 1',
    field2: 'Advanced Value 2',
    field3: 'Advanced Value 3'
  }
};

function loadTemplate(templateId) {
  const template = templates[templateId];

  if (template) {
    form.reset(template);
    showNotification(`Loaded ${templateId} template`);
  }
}

templateSelect.addEventListener('change', (e) => {
  loadTemplate(e.target.value);
});
```

 

### Pattern 10: Smart Reset with Validation

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => !value ? 'Required' : '',
    password: (value) => !value ? 'Required' : ''
  }
);

async function smartReset(newValues = null) {
  // Reset form
  form.reset(newValues);

  // Validate if new values provided
  if (newValues) {
    form.validate();

    if (form.hasErrors) {
      showWarning('Loaded data has validation errors');

      // Optionally show errors
      form.touchAll();
    } else {
      showNotification('Data loaded successfully');
    }
  }
}

// Usage:
// Reset to defaults
smartReset();

// Reset to specific data (and validate)
smartReset({
  email: 'user@example.com',
  password: '' // This will cause validation error
});
```

 

## Common Pitfalls

### Pitfall 1: Forgetting reset() Clears Errors

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Server error');

// ❌ Forgetting reset clears errors
form.reset();
console.log(form.errors.email); // '' (cleared)

// If you want to keep errors, don't use reset()
// Or save and restore them:
const savedErrors = { ...form.errors };
form.reset();
form.setErrors(savedErrors);
```

 

### Pitfall 2: Not Saving Initial Values

```javascript
const form = Forms.create({
  email: ''
});

// Load user data
form.reset({ email: 'user@example.com' });

// Later: try to reset to original empty state
// ❌ Can't get back to empty - no reference saved
form.reset(); // Resets to 'user@example.com', not ''

// ✅ Save original initial values
const originalInitial = {
  email: ''
};

// Load data
form.reset({ email: 'user@example.com' });

// Reset to original
form.reset(originalInitial);
```

 

### Pitfall 3: Using reset() Instead of Clearing Specific Fields

```javascript
const form = Forms.create({
  searchQuery: '',
  filters: {},
  userPreferences: {}
});

// ❌ Clears everything (including preferences)
clearButton.addEventListener('click', () => {
  form.reset();
  // User preferences lost!
});

// ✅ Clear only specific fields
clearButton.addEventListener('click', () => {
  form.setValues({
    searchQuery: '',
    filters: {}
    // Keep userPreferences
  });
});
```

 

### Pitfall 4: Assuming reset() Restores Original Initial Values

```javascript
const form = Forms.create({
  email: ''
});

// Reset to new values
form.reset({ email: 'new@example.com' });

// ❌ Expecting this to go back to ''
form.reset(); // Still 'new@example.com'!

// reset() without arguments uses last reset values
// To reset to true original, save them first
```

 

### Pitfall 5: Not Handling Async State

```javascript
const form = Forms.create({
  field: ''
});

async function loadData() {
  const data = await fetchData();

  // ❌ Race condition if multiple loads
  form.reset(data);
}

// ✅ Handle concurrent loads
let loadCounter = 0;

async function loadData() {
  const currentLoad = ++loadCounter;
  const data = await fetchData();

  // Only reset if this is still the latest load
  if (currentLoad === loadCounter) {
    form.reset(data);
  }
}
```

 

## Summary

### Key Takeaways

1. **`reset()` restores form to initial state** - clears values, errors, touched states.

2. **Accepts optional new values** - `reset(newValues)` sets new initial state.

3. **Resets everything** - values, errors, touched, submission state.

4. **Single reactive update** - UI updates once, efficiently.

5. **Returns form instance** - enables method chaining.

6. **Perfect for clean slate** - cancel, post-submit, modal close.

### When to Use reset()

✅ **Use reset() for:**
- Cancel button functionality
- Clearing form after submission
- Closing modals/dialogs
- Loading new data for editing
- Switching form modes
- Starting fresh workflow

❌ **Don't use reset() when:**
- Only clearing specific fields (use `setValue()`)
- Want to keep errors (they get cleared)
- Want to keep touched state (it gets cleared)
- Need partial reset (manually set specific fields)

### Comparison Table

| Operation | Method | What It Does |
|   --|  --|    --|
| Clear all | `reset()` | Values, errors, touched, submission ✅ |
| Clear values only | `setValues({...})` | Just values, keeps errors/touched |
| Clear errors only | `clearErrors()` | Just errors |
| Clear one field | `setValue('field', '')` | One field value |

### One-Line Rule

> **`form.reset(newValues?)` restores the form to a clean initial state - clearing all values, errors, touched states, and submission state in one operation.**

 

**What's Next?**

- Learn about `form.resetField()` for resetting individual fields
- Explore form lifecycle management
- Master state persistence patterns
