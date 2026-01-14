# form.clearError()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Set some errors
form.setErrors({
  email: 'Email already exists',
  password: 'Too weak',
  username: 'Username taken'
});

console.log(form.errorFields); // ['email', 'password', 'username']

// Clear a specific error
form.clearError('email');

console.log(form.errors.email); // ''
console.log(form.errorFields); // ['password', 'username']

// Chain clearing multiple errors
form
  .clearError('password')
  .clearError('username');

console.log(form.hasErrors); // false
```

**What just happened?** `clearError()` removes a single field's error message - perfect for targeted error removal!

 

## What is form.clearError()?

`form.clearError()` is the **targeted error removal method** for clearing a single field's error message.

Simply put, it's a clean way to remove one specific error without affecting other errors in the form.

**Key characteristics:**
- ✅ Clears one field's error message
- ✅ Leaves other errors untouched
- ✅ More explicit than `setError(field, '')`
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Clear a single field error
form.clearError(field)

// Chain multiple clears
form
  .clearError('field1')
  .clearError('field2');
```

**Parameters:**
- `field` (string) - The name of the field whose error should be cleared

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### Providing Clear Intent

While you can clear errors using `setError(field, '')`, `clearError()` makes your intent more explicit.

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

form.setError('email', 'Email already exists');

// Both work, but clearError is more explicit:
form.setError('email', '');     // Clearing by setting empty string
form.clearError('email');       // ✅ Clear and explicit intent

console.log(form.errors.email); // '' (both result in empty string)
```

**When to use clearError():**
✅ **Intent clarity** - Makes it obvious you're removing an error
✅ **User input events** - Clear server errors when user types
✅ **Conditional clearing** - Clear specific errors based on logic
✅ **Step-by-step clearing** - Remove errors one at a time
✅ **Selective clearing** - Don't clear all, just specific ones

 

## Mental Model

Think of `clearError()` as a **precision eraser** - it removes one specific error while keeping others intact.

### Visual Representation

```
Before clearError('email'):
┌─────────────────────────┐
│ Errors:                 │
│ ✗ email: "Invalid"      │
│ ✗ password: "Too short" │
│ ✗ username: "Taken"     │
└─────────────────────────┘

After clearError('email'):
┌─────────────────────────┐
│ Errors:                 │
│ ✓ email: ""             │ ← Cleared
│ ✗ password: "Too short" │
│ ✗ username: "Taken"     │
└─────────────────────────┘
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.clearError('email');

// Here's what happens internally:
1️⃣ Set the error to empty string
   form.errors.email = ''

2️⃣ Trigger reactive updates
   - form.hasErrors recalculates
   - form.isValid recalculates
   - form.errorFields updates (removes 'email')

3️⃣ All reactive effects fire
   - Error message UI hides
   - Field styling changes
   - Submit button might enable

4️⃣ Return form instance for chaining
   return this
```

### Equivalent Operations

```javascript
// These are functionally equivalent:
form.clearError('email');
form.setError('email', '');

// But clearError() is more semantically clear
```

 

## Basic Usage

### Example 1: Clear Error on User Input

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Server returned error
form.setError('email', 'Email already exists');

// Clear the error when user starts typing
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);

  // Clear server error when user modifies field
  form.clearError('email');
});
```

 

### Example 2: Clear Error After Successful Action

```javascript
const form = Forms.create({
  username: ''
});

// Set error from server
form.setError('username', 'Username not available');

// User clicks "Try Different Name"
tryDifferentButton.addEventListener('click', () => {
  // Clear the error to let them try again
  form.clearError('username');

  // Focus the input
  usernameInput.focus();
});
```

 

### Example 3: Conditional Error Clearing

```javascript
const form = Forms.create({
  shippingRequired: true,
  address: '',
  city: '',
  zipCode: ''
});

// Set shipping errors
form.setErrors({
  address: 'Address required',
  city: 'City required',
  zipCode: 'ZIP code required'
});

// When shipping is disabled, clear related errors
effect(() => {
  const shippingRequired = form.getValue('shippingRequired');

  if (!shippingRequired) {
    form.clearError('address');
    form.clearError('city');
    form.clearError('zipCode');
  }
});
```

 

### Example 4: Chain Multiple Clears

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Set errors
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2',
  field3: 'Error 3'
});

// Clear specific errors in chain
form
  .clearError('field1')
  .clearError('field3');

console.log(form.errorFields); // ['field2']
```

 

### Example 5: Clear Error After Timeout

```javascript
const form = Forms.create({
  email: ''
});

// Show temporary error
form.setError('email', 'Please wait...');

// Clear after 2 seconds
setTimeout(() => {
  form.clearError('email');
}, 2000);
```

 

## Advanced Patterns

### Pattern 1: Smart Server Error Clearing

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

const serverErrors = new Set();

function setServerError(field, message) {
  form.setError(field, message);
  serverErrors.add(field);
}

function clearServerErrorsOnInput() {
  // Clear server errors when user modifies field
  Object.keys(form.values).forEach(field => {
    const inputEl = document.querySelector(`[name="${field}"]`);

    inputEl?.addEventListener('input', () => {
      if (serverErrors.has(field)) {
        form.clearError(field);
        serverErrors.delete(field);
      }
    });
  });
}

// Usage:
setServerError('email', 'Email already exists');
clearServerErrorsOnInput();
// Error clears when user types in email field
```

 

### Pattern 2: Progressive Error Clearing

```javascript
const form = Forms.create({
  password: '',
  confirmPassword: ''
});

function validatePasswordMatch() {
  const password = form.getValue('password');
  const confirm = form.getValue('confirmPassword');

  if (password && confirm && password !== confirm) {
    form.setError('confirmPassword', 'Passwords must match');
  } else {
    form.clearError('confirmPassword');
  }
}

// Clear error as user types
effect(() => {
  form.getValue('password');
  form.getValue('confirmPassword');
  validatePasswordMatch();
});
```

 

### Pattern 3: Debounced Error Clearing

```javascript
const form = Forms.create({
  searchQuery: ''
});

let clearTimeout;

function showTemporaryError(field, message, duration = 3000) {
  form.setError(field, message);

  clearTimeout(clearTimeout);
  clearTimeout = setTimeout(() => {
    form.clearError(field);
  }, duration);
}

// Usage:
showTemporaryError('searchQuery', 'No results found', 2000);
// Error clears after 2 seconds
```

 

### Pattern 4: Error Clearing with Validation

```javascript
const form = Forms.create(
  {
    email: '',
    username: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    username: (value) => value.length < 3 ? 'Too short' : ''
  }
);

async function clearServerErrorAndRevalidate(field) {
  // Clear any server error
  form.clearError(field);

  // Revalidate with client-side validator
  const validator = form.validators?.[field];
  if (validator) {
    const error = validator(form.getValue(field), form.values);
    if (error) {
      form.setError(field, error);
    }
  }
}

// Usage:
emailInput.addEventListener('input', () => {
  clearServerErrorAndRevalidate('email');
});
```

 

### Pattern 5: Selective Batch Clearing

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

function clearErrorsExcept(fieldsToKeep) {
  Object.keys(form.errors).forEach(field => {
    if (!fieldsToKeep.includes(field)) {
      form.clearError(field);
    }
  });
}

// Set multiple errors
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2',
  field3: 'Error 3',
  field4: 'Error 4'
});

// Clear all except field1 and field3
clearErrorsExcept(['field1', 'field3']);

console.log(form.errorFields); // ['field1', 'field3']
```

 

### Pattern 6: Clear Errors by Pattern

```javascript
const form = Forms.create({
  shipping_address: '',
  shipping_city: '',
  shipping_zip: '',
  billing_address: '',
  billing_city: ''
});

function clearErrorsByPrefix(prefix) {
  Object.keys(form.errors).forEach(field => {
    if (field.startsWith(prefix)) {
      form.clearError(field);
    }
  });
}

// Set errors
form.setErrors({
  shipping_address: 'Required',
  shipping_city: 'Required',
  billing_address: 'Required'
});

// Clear all shipping errors
clearErrorsByPrefix('shipping_');

console.log(form.errorFields); // ['billing_address']
```

 

### Pattern 7: Undo Error Clearing

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

const errorHistory = [];

// Save error before clearing
function clearErrorWithHistory(field) {
  const currentError = form.errors[field];

  if (currentError) {
    errorHistory.push({ field, error: currentError });
  }

  form.clearError(field);
}

function undoLastClear() {
  if (errorHistory.length > 0) {
    const { field, error } = errorHistory.pop();
    form.setError(field, error);
  }
}

// Usage:
form.setError('field1', 'Important error');
clearErrorWithHistory('field1'); // Clears but saves to history
undoLastClear(); // Restores the error
```

 

### Pattern 8: Throttled Error Clearing

```javascript
const form = Forms.create({
  email: ''
});

let lastClearTime = 0;
const THROTTLE_MS = 1000;

function throttledClearError(field) {
  const now = Date.now();

  if (now - lastClearTime >= THROTTLE_MS) {
    form.clearError(field);
    lastClearTime = now;
  }
}

// Usage: prevents clearing too frequently
emailInput.addEventListener('input', () => {
  throttledClearError('email');
});
```

 

### Pattern 9: Clear Dependent Errors

```javascript
const form = Forms.create({
  country: '',
  state: '',
  city: '',
  zipCode: ''
});

const errorDependencies = {
  country: ['state', 'city', 'zipCode'],
  state: ['city', 'zipCode'],
  city: ['zipCode']
};

function clearErrorAndDependents(field) {
  // Clear the field's error
  form.clearError(field);

  // Clear dependent field errors
  const dependents = errorDependencies[field] || [];
  dependents.forEach(dependent => {
    form.clearError(dependent);
  });
}

// When country changes, clear all location errors
countrySelect.addEventListener('change', () => {
  clearErrorAndDependents('country');
});
```

 

### Pattern 10: Animated Error Clearing

```javascript
const form = Forms.create({
  email: ''
});

function clearErrorWithAnimation(field) {
  const errorEl = document.querySelector(`#${field}-error`);

  if (errorEl && form.errors[field]) {
    // Add fade-out animation
    errorEl.classList.add('fade-out');

    // Wait for animation to complete
    setTimeout(() => {
      form.clearError(field);
      errorEl.classList.remove('fade-out');
    }, 300);
  } else {
    // No animation needed, clear immediately
    form.clearError(field);
  }
}

// CSS:
// .fade-out {
//   animation: fadeOut 300ms ease-out;
//   opacity: 0;
// }
```

 

## Common Pitfalls

### Pitfall 1: Clearing Non-Existent Errors

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Clearing error that doesn't exist (harmless but unnecessary)
form.clearError('email'); // No error was set

// ✅ Check if error exists first
if (form.hasError('email')) {
  form.clearError('email');
}

// OR just clear anyway (it's safe)
form.clearError('email'); // No harm done
```

 

### Pitfall 2: Clearing vs Setting Empty String Confusion

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid');

// ❌ Both work, but mixing styles is confusing
form.setError('email', '');   // Clearing via setError
form.clearError('email');     // Clearing via clearError

// ✅ Be consistent - prefer clearError for clarity
form.clearError('email');
```

 

### Pitfall 3: Forgetting to Revalidate

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : ''
  }
);

// Server error overrides validator error
form.setError('email', 'Email already exists');

// ❌ Clearing doesn't trigger validator
form.clearError('email');
console.log(form.errors.email); // '' (but field might still be invalid)

// ✅ Revalidate after clearing server error
form.clearError('email');
form.validateField('email');
```

 

### Pitfall 4: Clearing All Errors One-by-One

```javascript
const form = Forms.create({
  field1: '', field2: '', field3: ''
});

form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2',
  field3: 'Error 3'
});

// ❌ Inefficient for clearing all
form.clearError('field1');
form.clearError('field2');
form.clearError('field3');

// ✅ Use clearErrors() for all
form.clearErrors();
```

 

### Pitfall 5: Not Understanding Reactive Timing

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid');

effect(() => {
  if (form.errors.email) {
    console.log('Email has error');
  }
});

// ❌ Expecting synchronous console output
form.clearError('email');
// Effect fires after clearError completes

// ✅ Effects are synchronous in this system, so this works
form.clearError('email');
// Effect has already fired with empty error
```

 

## Summary

### Key Takeaways

1. **`clearError()` removes a single field's error** - targeted clearing.

2. **More explicit than `setError(field, '')`** - clearer intent.

3. **Leaves other errors untouched** - precision eraser.

4. **Updates all reactive properties** - `hasErrors`, `isValid`, `errorFields` recalculate.

5. **Returns form instance** - enables method chaining.

6. **Safe to call on non-existent errors** - no errors thrown.

### When to Use clearError()

✅ **Use clearError() for:**
- Clearing specific field errors
- Removing server errors when user types
- Conditional error clearing
- Step-by-step error removal
- Clear intent in code

❌ **Don't use clearError() for:**
- Clearing all errors (use `clearErrors()`)
- Clearing multiple errors (use `clearErrors()` or chain calls)
- Setting a new error (use `setError()`)

### Comparison Table

| Operation | Method | Use Case |
|   --|  --|   -|
| Clear one error | `clearError('email')` ✅ | User starts typing in field |
| Clear all errors | `clearErrors()` ✅ | Form reset or successful submit |
| Clear + set new | `setError('email', '')` | When also setting other errors |
| Clear multiple | Chain `clearError()` | Selective clearing |

### One-Line Rule

> **`form.clearError(field)` removes a single field's error message - use it when you need targeted, explicit error removal without affecting other errors.**

 

**What's Next?**

- Learn about `form.clearErrors()` for removing all errors at once
- Explore `form.hasError()` for checking if a field has an error
- Master `form.getError()` for retrieving error messages
