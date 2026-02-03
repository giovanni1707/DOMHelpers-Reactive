# form.errors

## Quick Start (30 seconds)

```javascript
const { v } = Forms;

// Create form with validators
const form = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: v.email('Invalid email'),
      password: v.minLength(8, 'Min 8 characters')
    }
  }
);

// Set invalid value
form.setValue('email', 'notanemail');

// Check errors
console.log(form.errors);
// { email: 'Invalid email' }

console.log(form.errors.email);
// 'Invalid email'

// Fix it
form.setValue('email', 'user@example.com');

console.log(form.errors.email);
// undefined ✅ (no error)
```

**What just happened?** `form.errors` stores validation error messages. When validation fails, the error appears here. When it passes, the error is removed!

 

## What is form.errors?

`form.errors` is a **reactive object property** that stores validation error messages for each form field.

Simply put, when a field's validation fails, the error message goes into `form.errors`. When validation passes, the error is removed.

Think of `form.errors` as a **warning board** that displays what's wrong with your form. When everything is valid, the board is empty!

 

## Syntax

### Reading Errors

```javascript
// Read all errors
const allErrors = form.errors;

// Read specific field error
const emailError = form.errors.email;
const passwordError = form.errors.password;

// Check if field has error
if (form.errors.username) {
  console.log('Username has error:', form.errors.username);
}
```

### Setting Errors Manually

```javascript
// Set a single error
form.setError('email', 'This email is already taken');

// Clear a single error
form.clearError('email');

// Set multiple errors
form.setErrors({
  email: 'Invalid email',
  password: 'Too weak'
});

// Clear all errors
form.clearErrors();
```

**Type:** `Object` (read/write via methods)

**Structure:** `{ fieldName: errorMessage, ... }`

 

## Why Does This Exist?

### The Problem Without Centralized Error Tracking

Managing validation errors manually is messy:

```javascript
// Manual error management (chaos!)
let emailError = null;
let passwordError = null;
let usernameError = null;

function validateEmail(value) {
  if (!value) {
    emailError = 'Email required';
  } else if (!value.includes('@')) {
    emailError = 'Invalid email';
  } else {
    emailError = null;
  }
  updateUIErrors();
}

function validatePassword(value) {
  if (!value) {
    passwordError = 'Password required';
  } else if (value.length < 8) {
    passwordError = 'Min 8 characters';
  } else {
    passwordError = null;
  }
  updateUIErrors();
}

// Check if form is valid
function isFormValid() {
  return !emailError && !passwordError && !usernameError;
}

// Get all errors
function getAllErrors() {
  const errors = {};
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (usernameError) errors.username = usernameError;
  return errors;
}
```

**What's the Real Issue?**

```
Scattered Error Variables
         ↓
Manual Error Tracking
         ↓
Hard to Check Overall Validity
         ↓
Repetitive Code
         ↓
Easy to Forget Fields
```

**Problems:**
❌ Separate variable for each field's error
❌ Manual validity checking
❌ Hard to display all errors
❌ Easy to forget to clear errors
❌ Repetitive error management code

### The Solution with form.errors

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '', username: '' },
  {
    validators: {
      email: v.combine(v.required('Email required'), v.email('Invalid email')),
      password: v.combine(v.required('Password required'), v.minLength(8, 'Min 8 chars')),
      username: v.combine(v.required('Username required'), v.minLength(3, 'Min 3 chars'))
    }
  }
);

// Set values - errors update automatically!
form.setValue('email', 'invalid');
// form.errors.email = 'Invalid email'

form.setValue('password', 'short');
// form.errors.password = 'Min 8 chars'

// Check all errors at once
console.log(form.errors);
// { email: 'Invalid email', password: 'Min 8 chars' }

// Check if valid (automatic!)
console.log(form.isValid); // false

// Fix the issues
form.setValue('email', 'user@example.com');
form.setValue('password', 'secret123');

console.log(form.errors);
// {} (empty - no errors!)

console.log(form.isValid); // true ✅
```

**Benefits:**
✅ All errors in one object
✅ Automatic error updates on validation
✅ Easy to check overall validity
✅ Easy to display all error messages
✅ Errors cleared automatically when fixed

 

## Mental Model

Think of `form.errors` like a **teacher's correction sheet**:

### Without form.errors (Sticky Notes)
```
Student Paper 1: "Missing comma" [sticky note]
Student Paper 2: "Wrong answer" [sticky note]
Student Paper 3: "Incomplete" [sticky note]

Teacher: "How many errors total?"
         *Counts sticky notes manually*
         "Are there any errors left?"
         *Checks each paper again*
```

### With form.errors (Grading Sheet)
```
┌─────────────────────────────────┐
│ Grading Sheet                   │
├─────────────────────────────────┤
│ Paper 1: Missing comma          │
│ Paper 2: Wrong answer           │
│ Paper 3: Incomplete             │
├─────────────────────────────────┤
│ Total Errors: 3                 │
│ Status: Needs Revision          │
└─────────────────────────────────┘

Teacher: "How many errors?" → Look at sheet: 3
         "Any errors left?" → Sheet empty? No
```

**Key Insight:** `form.errors` collects all validation problems in one organized location for easy inspection and management.

 

## How Does It Work?

### Automatic Error Updates

```
User calls form.setValue('email', 'invalid')
                ↓
        Triggers validator
                ↓
    Validator returns 'Invalid email'
                ↓
    form.errors.email = 'Invalid email'
                ↓
        form.isValid = false
                ↓
    UI updates automatically (if bound)
```

### Error Lifecycle

```
Initial State
form.errors = {}

      ↓ setValue with invalid data

Validation Fails
form.errors = { field: 'Error message' }

      ↓ setValue with valid data

Validation Passes
form.errors = {} (error removed)
```

### Visual Structure

```
form
├── values
│   ├── email: 'invalid'
│   └── password: 'short'
├── errors              ← form.errors
│   ├── email: 'Invalid email'
│   └── password: 'Min 8 chars'
└── isValid: false      (computed from errors)
```

 

## Basic Usage

### Example 1: Checking for Errors

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: v.email('Invalid email format')
    }
  }
);

// Invalid input
form.setValue('email', 'notanemail');

// Check if field has error
if (form.errors.email) {
  console.log('Error:', form.errors.email);
  // "Error: Invalid email format"
}

// Check all errors
console.log(Object.keys(form.errors).length > 0);
// true (has errors)
```

 

### Example 2: Displaying Error Messages

```javascript
const { v } = Forms;

const form = Forms.create(
  { username: '', email: '', password: '' },
  {
    validators: {
      username: v.required('Username required'),
      email: v.email('Invalid email'),
      password: v.minLength(8, 'Min 8 characters')
    }
  }
);

// Submit with empty fields
form.submit();

// Display all errors
Object.entries(form.errors).forEach(([field, error]) => {
  console.log(`${field}: ${error}`);
});
// username: Username required
// email: Invalid email
// password: Min 8 characters
```

 

### Example 3: Conditional Error Display

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: v.combine(
        v.required('Email required'),
        v.email('Invalid email')
      )
    }
  }
);

// Show error only if field is touched
function shouldShowError(field) {
  return form.touched[field] && form.errors[field];
}

form.setValue('email', 'invalid');

if (shouldShowError('email')) {
  console.log('Show error:', form.errors.email);
  // "Show error: Invalid email"
}
```

 

### Example 4: Error Count

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '', username: '' },
  {
    validators: {
      email: v.required('Required'),
      password: v.required('Required'),
      username: v.required('Required')
    }
  }
);

// Try to submit empty
form.submit();

// Count errors
const errorCount = Object.keys(form.errors).length;
console.log(`You have ${errorCount} errors`);
// "You have 3 errors"
```

 

## Reading Errors

### Pattern 1: Get First Error

```javascript
const form = Forms.create(
  { email: '', password: '', username: '' },
  { /* validators */ }
);

form.submit(); // Trigger all validations

// Get first error message
const firstError = Object.values(form.errors)[0];
console.log('First error:', firstError);
```

 

### Pattern 2: Check Specific Field

```javascript
const form = Forms.create(
  { email: '' },
  { /* validators */ }
);

form.setValue('email', 'invalid');

// Safe check with optional chaining
const emailError = form.errors.email;

if (emailError) {
  document.getElementById('email-error').textContent = emailError;
}
```

 

### Pattern 3: Get All Error Messages

```javascript
const form = Forms.create(
  { email: '', password: '', username: '' },
  { /* validators */ }
);

form.submit();

// Get array of error messages
const errorMessages = Object.values(form.errors);
console.log(errorMessages);
// ['Invalid email', 'Password too short', 'Username required']

// Display in alert
if (errorMessages.length > 0) {
  alert('Errors:\n' + errorMessages.join('\n'));
}
```

 

### Pattern 4: Check Error Existence

```javascript
const form = Forms.create(
  { email: '' },
  { /* validators */ }
);

// Method 1: Direct check
const hasEmailError = !!form.errors.email;

// Method 2: Use hasError() method
const hasError = form.hasError('email');

// Method 3: Check if any errors exist
const hasAnyErrors = Object.keys(form.errors).length > 0;

// Method 4: Use computed property
const hasErrors = form.hasErrors;
```

 

## Setting Errors

### Pattern 1: Manual Server Validation

```javascript
const form = Forms.create(
  { email: '' },
  {
    onSubmit: async (values) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const { field, message } = await response.json();

        // Set error from server
        form.setError(field, message);
        throw new Error('Validation failed');
      }

      return response.json();
    }
  }
);

// Try to submit
await form.submit();
// If email already exists:
// form.errors.email = 'Email already taken'
```

 

### Pattern 2: Custom Async Validation

```javascript
const { v } = Forms;

const form = Forms.create(
  { username: '' },
  {
    validators: {
      username: v.combine(
        v.required('Required'),
        v.minLength(3, 'Too short')
      )
    }
  }
);

// Async check after sync validation
form.setValue('username', 'alice');

// Sync validation passes
if (!form.errors.username) {
  // Now do async check
  const response = await fetch(`/api/check-username?name=alice`);
  const { available } = await response.json();

  if (!available) {
    form.setError('username', 'Username already taken');
  }
}

console.log(form.errors.username);
// 'Username already taken'
```

 

### Pattern 3: Conditional Errors

```javascript
const form = Forms.create({
  agreeToTerms: false,
  age: ''
});

// Custom validation on submit
async function handleSubmit() {
  form.clearErrors();

  // Custom checks
  if (!form.values.agreeToTerms) {
    form.setError('agreeToTerms', 'You must accept the terms');
  }

  if (Number(form.values.age) < 18) {
    form.setError('age', 'Must be 18 or older');
  }

  if (Object.keys(form.errors).length > 0) {
    console.log('Validation failed:', form.errors);
    return;
  }

  // Proceed with submission
  await form.submit();
}
```

 

### Pattern 4: Batch Error Setting

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Server returns multiple errors
const serverErrors = {
  email: 'Email already exists',
  username: 'Username taken',
  password: 'Password too common'
};

// Set all errors at once
form.setErrors(serverErrors);

console.log(form.errors);
// {
//   email: 'Email already exists',
//   username: 'Username taken',
//   password: 'Password too common'
// }
```

 

## Advanced Patterns

### Pattern 1: Error Summary Component

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '', username: '' },
  {
    validators: {
      email: v.email('Invalid email'),
      password: v.minLength(8, 'Min 8 chars'),
      username: v.minLength(3, 'Min 3 chars')
    }
  }
);

// Create error summary
function renderErrorSummary() {
  const errorCount = Object.keys(form.errors).length;

  if (errorCount === 0) {
    return '<p class="success">Form is valid! ✓</p>';
  }

  const errorList = Object.entries(form.errors)
    .map(([field, message]) => `<li>${field}: ${message}</li>`)
    .join('');

  return `
    <div class="error-summary">
      <h3>Please fix ${errorCount} error(s):</h3>
      <ul>${errorList}</ul>
    </div>
  `;
}

// Update on change
effect(() => {
  const _ = form.errors; // Track changes
  document.getElementById('summary').innerHTML = renderErrorSummary();
});
```

 

### Pattern 2: Error Toast Notifications

```javascript
const form = Forms.create(
  { email: '' },
  { /* validators */ }
);

// Watch for new errors
let previousErrors = {};

effect(() => {
  const currentErrors = { ...form.errors };

  // Check for new errors
  Object.entries(currentErrors).forEach(([field, message]) => {
    if (!previousErrors[field]) {
      // New error - show toast
      showToast(`${field}: ${message}`, 'error');
    }
  });

  previousErrors = currentErrors;
});

function showToast(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // Your toast notification library
}
```

 

### Pattern 3: Field-Level Error Display

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: v.email('Invalid'),
      password: v.minLength(8, 'Too short')
    }
  }
);

// Bind errors to specific fields
function bindErrorToField(fieldName, errorElementId) {
  effect(() => {
    const error = form.errors[fieldName];
    const errorEl = document.getElementById(errorElementId);

    if (error && form.touched[fieldName]) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    } else {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  });
}

bindErrorToField('email', 'email-error');
bindErrorToField('password', 'password-error');
```

 

### Pattern 4: Error Analytics

```javascript
const form = Forms.create(
  { email: '', password: '', username: '' },
  { /* validators */ }
);

// Track which fields fail most often
const errorStats = {};

effect(() => {
  Object.keys(form.errors).forEach(field => {
    errorStats[field] = (errorStats[field] || 0) + 1;
  });
});

// On form unmount
function getErrorStats() {
  console.log('Fields with most errors:', errorStats);
  // { email: 5, password: 3, username: 2 }
  // Email had 5 validation failures
}
```

 

### Pattern 5: Progressive Error Display

```javascript
const { v } = Forms;

const form = Forms.create(
  { password: '' },
  {
    validators: {
      password: (value) => {
        if (!value) return 'Password required';
        if (value.length < 8) return 'At least 8 characters needed';
        if (!/[A-Z]/.test(value)) return 'Need uppercase letter';
        if (!/[0-9]/.test(value)) return 'Need number';
        return null;
      }
    }
  }
);

// Show progressively as user types
form.setValue('password', '');
console.log(form.errors.password); // 'Password required'

form.setValue('password', 'short');
console.log(form.errors.password); // 'At least 8 characters needed'

form.setValue('password', 'lowercase');
console.log(form.errors.password); // 'Need uppercase letter'

form.setValue('password', 'Password');
console.log(form.errors.password); // 'Need number'

form.setValue('password', 'Password1');
console.log(form.errors.password); // undefined ✅
```

 

## Common Pitfalls

### Pitfall 1: Checking Errors Before Setting Value

❌ **Wrong:**
```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.email('Invalid') } }
);

// Check error before setting value
if (form.errors.email) {
  console.log('Has error'); // Won't run - no error yet!
}

form.setValue('email', 'invalid');
// NOW it has an error
```

✅ **Correct:**
```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.email('Invalid') } }
);

form.setValue('email', 'invalid');

// Now check
if (form.errors.email) {
  console.log('Has error:', form.errors.email); // Works!
}
```

 

### Pitfall 2: Direct Mutation of Errors Object

❌ **Wrong:**
```javascript
const form = Forms.create({ email: '' });

// Don't mutate directly!
form.errors.email = 'Custom error';
// May not trigger reactivity
```

✅ **Correct:**
```javascript
const form = Forms.create({ email: '' });

// Use the method
form.setError('email', 'Custom error');
// Triggers reactivity ✅
```

 

### Pitfall 3: Assuming Empty Errors Means Valid

❌ **Wrong:**
```javascript
const form = Forms.create(
  { email: '' },
  { validators: { email: v.email('Invalid') } }
);

// Check if valid
if (Object.keys(form.errors).length === 0) {
  console.log('Valid!');
  // Might be true even if not validated yet!
}
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { email: '' },
  { validators: { email: v.email('Invalid') } }
);

// Use the computed property
if (form.isValid) {
  console.log('Valid!');
  // Properly checks validation state ✅
}

// Or validate first
const isValid = form.validate();
if (isValid && Object.keys(form.errors).length === 0) {
  console.log('Valid!');
}
```

 

### Pitfall 4: Not Clearing Errors After Fix

❌ **Wrong:**
```javascript
const form = Forms.create({ email: '' });

// Manually set error
form.setError('email', 'Email taken');

// User fixes it
form.setValue('email', 'newemail@example.com');

// Error still there! (manual errors don't auto-clear)
console.log(form.errors.email); // 'Email taken'
```

✅ **Correct:**
```javascript
const form = Forms.create({ email: '' });

form.setError('email', 'Email taken');

// Clear when user changes value
form.setValue('email', 'newemail@example.com');
form.clearError('email'); // Clear manual error

console.log(form.errors.email); // undefined ✅
```

 

### Pitfall 5: Displaying Errors for Untouched Fields

❌ **Wrong:**
```javascript
const form = Forms.create(
  { email: '', password: '' },
  { /* validators */ }
);

// Show all errors immediately
Object.entries(form.errors).forEach(([field, error]) => {
  document.getElementById(`${field}-error`).textContent = error;
});
// Shows errors for fields user hasn't touched yet!
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { email: '', password: '' },
  { /* validators */ }
);

// Show errors only for touched fields
Object.entries(form.errors).forEach(([field, error]) => {
  if (form.touched[field]) {
    document.getElementById(`${field}-error`).textContent = error;
  }
});
// Only shows errors for fields user interacted with ✅
```

 

## Summary

### Key Takeaways

1. **`form.errors` stores validation error messages** for each field that fails validation.

2. **It's automatically updated** when validators run during `setValue()` or `validate()`.

3. **Errors are removed automatically** when validation passes for a field.

4. **Read it to display error messages** to users in your UI.

5. **Use `setError()` for manual/server errors** - validator errors update automatically.

6. **Use `clearError()` to remove manual errors** - validator errors clear when validation passes.

7. **Check `form.isValid` for overall validity** instead of manually checking if errors is empty.

8. **Combine with `form.touched`** to show errors only for fields the user has interacted with.

9. **`form.errorFields` computed property** gives you an array of fields that have errors.

10. **It's reactive** - changes trigger effects and UI updates automatically.

### One-Line Rule

> **`form.errors` tracks validation failures - read it to display messages, use methods to set/clear manual errors, and rely on automatic updates for validator errors.**

 

**What's Next?**

- Learn about `form.touched` to track user interaction
- Explore `form.isValid` to check overall form validity
- Master `form.hasErrors` computed property
- Discover error display patterns and best practices
