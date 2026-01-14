# form.clearErrors()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

// Set multiple errors
form.setErrors({
  username: 'Username taken',
  email: 'Email exists',
  password: 'Too weak'
});

console.log(form.hasErrors); // true
console.log(form.errorFields); // ['username', 'email', 'password']

// Clear ALL errors at once
form.clearErrors();

console.log(form.hasErrors); // false
console.log(form.errorFields); // []
console.log(form.errors); // { username: '', email: '', password: '' }

// Chain with other methods
form
  .setError('email', 'Server error')
  .clearErrors(); // Clears immediately
```

**What just happened?** `clearErrors()` removes ALL error messages from the form in one operation!

 

## What is form.clearErrors()?

`form.clearErrors()` is the **complete error removal method** for clearing all field errors at once.

Simply put, it's the "reset button" for your form's error state.

**Key characteristics:**
- ✅ Clears all field errors simultaneously
- ✅ More efficient than clearing individually
- ✅ Perfect for form resets or successful submissions
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Clear all errors
form.clearErrors()

// With chaining
form
  .clearErrors()
  .setValue('email', 'new@example.com');
```

**Parameters:** None

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Manual Clearing

When you need to clear all errors, doing it manually is tedious and error-prone.

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
});

// ❌ Tedious - clear each error individually
form.clearError('field1');
form.clearError('field2');
form.clearError('field3');
form.clearError('field4');
form.clearError('field5');

// ❌ Or loop through fields
Object.keys(form.errors).forEach(field => {
  form.clearError(field);
});

// ✅ Simple - clear all at once
form.clearErrors();
```

**When to use clearErrors():**
✅ **Form reset** - Starting fresh
✅ **Successful submission** - Clear errors after success
✅ **Modal/dialog close** - Reset state when closing
✅ **Step completion** - Clear errors moving to next step
✅ **Cancel action** - Discard error state

 

## Mental Model

Think of `clearErrors()` as a **clean slate** - it wipes all errors from the form.

### Visual Representation

```
Before clearErrors():
┌─────────────────────────────┐
│ Form Errors:                │
│ ✗ username: "Taken"         │
│ ✗ email: "Invalid"          │
│ ✗ password: "Too short"     │
│ ✗ phone: "Required"         │
└─────────────────────────────┘
           ↓
   form.clearErrors()
           ↓
After clearErrors():
┌─────────────────────────────┐
│ Form Errors:                │
│ ✓ username: ""              │
│ ✓ email: ""                 │
│ ✓ password: ""              │
│ ✓ phone: ""                 │
└─────────────────────────────┘
  All errors cleared!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.clearErrors();

// Here's what happens internally:
1️⃣ Clear all error values
   Object.keys(form.errors).forEach(field => {
     form.errors[field] = ''
   })

2️⃣ Trigger reactive updates (once)
   - form.hasErrors → false
   - form.isValid → true (if no errors)
   - form.errorFields → []

3️⃣ All reactive effects fire (once)
   - All error message UIs hide
   - Submit button might enable
   - All field styling resets

4️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
clearErrors()
     ↓
Clear all error values at once
     ↓
Reactive properties update:
- hasErrors → false
- isValid → true
- errorFields → []
     ↓
All effects fire once
     ↓
UI updates in one batch
```

 

## Basic Usage

### Example 1: Form Reset

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

// User fills form and gets errors
form.setErrors({
  username: 'Username taken',
  email: 'Invalid email'
});

// Reset button clears everything
resetButton.addEventListener('click', () => {
  form.clearErrors();
  form.setValues({
    username: '',
    email: '',
    password: ''
  });
});
```

 

### Example 2: Clear Errors After Successful Submit

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
    // Success! Clear all errors
    form.clearErrors();

    // Clear form values too
    form.setValues({
      email: '',
      message: ''
    });

    alert('Message sent successfully!');
  } else {
    // Set server errors
    const { errors } = await response.json();
    form.setErrors(errors);
  }
}
```

 

### Example 3: Modal Close

```javascript
const form = Forms.create({
  name: '',
  email: ''
});

// Open modal
openModalButton.addEventListener('click', () => {
  modal.show();
});

// Close modal - clear errors
closeModalButton.addEventListener('click', () => {
  form.clearErrors(); // Reset error state
  modal.hide();
});
```

 

### Example 4: Step Navigation

```javascript
const form = Forms.create({
  // Step 1
  firstName: '',
  lastName: '',

  // Step 2
  email: '',
  phone: ''
});

let currentStep = 1;

function goToNextStep() {
  // Clear errors from previous step
  form.clearErrors();

  currentStep++;
  showStep(currentStep);
}

function goToPreviousStep() {
  // Clear errors from current step
  form.clearErrors();

  currentStep--;
  showStep(currentStep);
}
```

 

### Example 5: Cancel Action

```javascript
const form = Forms.create({
  title: '',
  content: ''
});

// User starts editing
editButton.addEventListener('click', () => {
  editMode = true;
  showEditForm();
});

// User cancels - revert and clear errors
cancelButton.addEventListener('click', () => {
  form.clearErrors();
  form.setValues(originalValues); // Restore original
  editMode = false;
  hideEditForm();
});
```

 

## Advanced Patterns

### Pattern 1: Smart Form Reset

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const initialValues = { ...form.values };

function resetForm() {
  // Clear all errors
  form.clearErrors();

  // Reset to initial values
  form.setValues(initialValues);

  // Reset touched state
  Object.keys(form.touched).forEach(field => {
    form.touched[field] = false;
  });

  // Reset submission state
  form.isSubmitting = false;
  form.submitCount = 0;
}

resetButton.addEventListener('click', resetForm);
```

 

### Pattern 2: Conditional Error Clearing

```javascript
const form = Forms.create({
  accountType: 'personal',
  companyName: '',
  taxId: '',
  personalId: ''
});

function switchAccountType(newType) {
  // Clear all errors when switching types
  form.clearErrors();

  // Set the new account type
  form.setValue('accountType', newType);

  // Clear irrelevant fields
  if (newType === 'personal') {
    form.setValues({
      companyName: '',
      taxId: ''
    });
  } else {
    form.setValue('personalId', '');
  }
}

accountTypeSelect.addEventListener('change', (e) => {
  switchAccountType(e.target.value);
});
```

 

### Pattern 3: Retry Mechanism

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

let attemptCount = 0;
const MAX_ATTEMPTS = 3;

async function handleSubmit() {
  attemptCount++;

  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (response.ok) {
    // Success - reset attempt counter
    attemptCount = 0;
    form.clearErrors();
    redirectToDashboard();

  } else {
    const { errors } = await response.json();
    form.setErrors(errors);

    if (attemptCount >= MAX_ATTEMPTS) {
      form.clearErrors();
      form.setError('email', 'Too many failed attempts. Please try again later.');
    }
  }
}

// Retry button clears errors and allows new attempt
retryButton.addEventListener('click', () => {
  attemptCount = 0;
  form.clearErrors();
});
```

 

### Pattern 4: Progressive Validation Clear

```javascript
const form = Forms.create({
  step1_field1: '',
  step1_field2: '',
  step2_field1: '',
  step2_field2: ''
});

function clearStepErrors(stepNumber) {
  const stepPrefix = `step${stepNumber}_`;

  // Clear only errors for current step fields
  Object.keys(form.errors).forEach(field => {
    if (field.startsWith(stepPrefix)) {
      form.clearError(field);
    }
  });
}

function clearAllStepsErrors() {
  // Clear all errors across all steps
  form.clearErrors();
}

// Moving to next step - clear current step errors
nextStepButton.addEventListener('click', () => {
  clearStepErrors(currentStep);
  currentStep++;
});

// Starting over - clear everything
startOverButton.addEventListener('click', () => {
  clearAllStepsErrors();
  currentStep = 1;
});
```

 

### Pattern 5: Debounced Error Clearing

```javascript
const form = Forms.create({
  searchQuery: ''
});

let clearDebounce;

function showTemporaryErrors(errors, duration = 3000) {
  form.setErrors(errors);

  clearTimeout(clearDebounce);
  clearDebounce = setTimeout(() => {
    form.clearErrors();
  }, duration);
}

// Usage: show error briefly then auto-clear
searchButton.addEventListener('click', async () => {
  const results = await search(form.getValue('searchQuery'));

  if (results.length === 0) {
    showTemporaryErrors({ searchQuery: 'No results found' }, 2000);
  }
});
```

 

### Pattern 6: Error Clear with Animation

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

async function clearErrorsWithAnimation() {
  // Add fade-out class to all error elements
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.add('fade-out');
  });

  // Wait for animation
  await new Promise(resolve => setTimeout(resolve, 300));

  // Clear errors after animation
  form.clearErrors();

  // Remove animation class
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('fade-out');
  });
}

// CSS:
// .fade-out {
//   animation: fadeOut 300ms ease-out;
//   opacity: 0;
// }
```

 

### Pattern 7: Clear Errors with Confirmation

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function clearErrorsWithConfirmation() {
  const errorCount = form.errorFields.length;

  if (errorCount === 0) {
    alert('No errors to clear');
    return;
  }

  const confirmed = confirm(
    `Clear ${errorCount} error(s)? This cannot be undone.`
  );

  if (confirmed) {
    form.clearErrors();
    console.log('All errors cleared');
  }
}

clearAllButton.addEventListener('click', clearErrorsWithConfirmation);
```

 

### Pattern 8: Clear Errors with History

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

const errorStateHistory = [];

function clearErrorsWithHistory() {
  // Save current error state
  errorStateHistory.push({ ...form.errors });

  // Limit history size
  if (errorStateHistory.length > 10) {
    errorStateHistory.shift();
  }

  // Clear all errors
  form.clearErrors();
}

function restoreLastErrorState() {
  if (errorStateHistory.length > 0) {
    const lastState = errorStateHistory.pop();
    form.setErrors(lastState);
  }
}

// Usage:
clearButton.addEventListener('click', clearErrorsWithHistory);
undoButton.addEventListener('click', restoreLastErrorState);
```

 

### Pattern 9: Selective Clear by Error Type

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Track error sources
const errorSources = {
  email: 'client',
  password: 'server',
  username: 'server'
};

function clearErrorsBySource(source) {
  if (source === 'all') {
    form.clearErrors();
    return;
  }

  // Clear only errors from specific source
  Object.entries(errorSources).forEach(([field, fieldSource]) => {
    if (fieldSource === source) {
      form.clearError(field);
    }
  });
}

// Clear only server errors
clearServerErrorsButton.addEventListener('click', () => {
  clearErrorsBySource('server');
});

// Clear all errors
clearAllButton.addEventListener('click', () => {
  clearErrorsBySource('all');
});
```

 

### Pattern 10: Auto-Clear on Success

```javascript
const form = Forms.create({
  email: '',
  message: ''
});

// Automatically clear errors when form becomes valid
effect(() => {
  const isValid = form.isValid;

  if (isValid && form.hasErrors) {
    // Form is valid but still has old errors - clear them
    form.clearErrors();
  }
});

// This ensures errors don't linger after user fixes them
```

 

## Common Pitfalls

### Pitfall 1: Clearing Errors Before Validation

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

async function handleSubmit() {
  // ❌ Clearing before validation hides validation errors
  form.clearErrors();

  // Validate all fields
  form.validateAllFields();

  if (form.isValid) {
    await submitForm();
  }
}

// ✅ Clear after successful submission
async function handleSubmit() {
  form.validateAllFields();

  if (form.isValid) {
    await submitForm();
    form.clearErrors(); // Clear after success
  }
}
```

 

### Pitfall 2: Not Clearing Touch State

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Set errors and touch
form.setValue('email', 'test');
form.setError('email', 'Invalid');

// ❌ Clears errors but field is still marked as touched
form.clearErrors();
console.log(form.touched.email); // true (still touched)

// ✅ Clear both errors and touch state if needed
form.clearErrors();
Object.keys(form.touched).forEach(field => {
  form.touched[field] = false;
});
```

 

### Pitfall 3: Clearing Too Frequently

```javascript
const form = Forms.create({
  searchQuery: ''
});

// ❌ Clearing on every input prevents errors from showing
searchInput.addEventListener('input', (e) => {
  form.setValue('searchQuery', e.target.value);
  form.clearErrors(); // Errors never stick around
});

// ✅ Clear only when appropriate
searchInput.addEventListener('input', (e) => {
  form.setValue('searchQuery', e.target.value);
  // Only clear if there's a specific server error
  if (form.errors.searchQuery?.includes('server')) {
    form.clearError('searchQuery');
  }
});
```

 

### Pitfall 4: Assuming clearErrors() Revalidates

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

form.setValue('email', ''); // Empty, validator sets error

// ❌ Clearing doesn't trigger revalidation
form.clearErrors();
console.log(form.errors.email); // '' (cleared)
console.log(form.isValid); // true (but email is actually invalid!)

// ✅ Revalidate if needed after clearing
form.clearErrors();
form.validateAllFields();
```

 

### Pitfall 5: Not Checking if Errors Exist

```javascript
const form = Forms.create({
  field1: ''
});

// ❌ Calling when no errors (harmless but unnecessary)
form.clearErrors(); // Nothing to clear

// ✅ Check first if you're concerned about performance
if (form.hasErrors) {
  form.clearErrors();
}

// Note: In practice, calling clearErrors() is so cheap
// that checking first is usually unnecessary
```

 

## Summary

### Key Takeaways

1. **`clearErrors()` removes ALL field errors** in one operation.

2. **More efficient than clearing individually** - single reactive update.

3. **Perfect for form resets** - clean slate for error state.

4. **No parameters needed** - clears everything.

5. **Returns form instance** - enables method chaining.

6. **Safe to call anytime** - works even if no errors exist.

### When to Use clearErrors()

✅ **Use clearErrors() for:**
- Resetting form to initial state
- After successful form submission
- Closing modals/dialogs
- Switching form modes
- Cancel/discard actions
- Starting a new workflow

❌ **Don't use clearErrors() when:**
- You only need to clear one error (use `clearError()`)
- You need to preserve some errors (clear selectively)
- Before validation (will hide validation results)

### Comparison Table

| Scenario | Method | Reason |
|   -|  --|  --|
| Clear all errors | `clearErrors()` ✅ | Efficient, one call |
| Clear one error | `clearError('field')` ✅ | Targeted removal |
| Clear some errors | Loop + `clearError()` | Selective clearing |
| Reset form | `clearErrors()` ✅ | Part of full reset |

### One-Line Rule

> **`form.clearErrors()` removes all error messages from the form - use it when you need a complete error state reset, like after successful submission or form reset.**

 

**What's Next?**

- Learn about `form.hasError()` for checking if a field has an error
- Explore `form.getError()` for retrieving specific error messages
- Master error display patterns with reactive effects
