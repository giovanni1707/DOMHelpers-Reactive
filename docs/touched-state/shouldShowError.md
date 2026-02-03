# form.shouldShowError()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    username: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : '',
    username: (value) => !value ? 'Required' : ''
  }
);

// Check if should show error for each field
console.log(form.shouldShowError('email')); // false (not touched yet)
console.log(form.shouldShowError('password')); // false
console.log(form.shouldShowError('username')); // false

// User interacts with email field with invalid value
form.setValue('email', 'invalid');

console.log(form.shouldShowError('email')); // true (touched + has error)
console.log(form.shouldShowError('password')); // false (not touched)

// Use in error display
effect(() => {
  if (form.shouldShowError('email')) {
    errorEl.textContent = form.getError('email');
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});
```

**What just happened?** `shouldShowError()` combines touched state AND error check - the perfect helper for smart error display!

 

## What is form.shouldShowError()?

`form.shouldShowError()` is a **convenience helper method** that checks if a field should display its error message.

Simply put, it returns `true` only when BOTH conditions are met:
1. The field has been touched by the user
2. The field has a validation error

**Key characteristics:**
- ✅ Combines two common checks in one
- ✅ Returns boolean (true/false)
- ✅ Prevents showing errors on untouched fields (better UX)
- ✅ Perfect for error display logic
- ✅ Cleaner than manual `isTouched() && hasError()` checks

 

## Syntax

```javascript
// Check if should show error
const shouldShow = form.shouldShowError(fieldName)

// Use in conditional rendering
if (form.shouldShowError('email')) {
  showError(form.getError('email'));
}

// Use in reactive effects
effect(() => {
  if (form.shouldShowError('password')) {
    errorEl.textContent = form.getError('password');
  }
});
```

**Parameters:**
- `fieldName` (string) - The name of the field to check

**Returns:** `boolean` - `true` if field is touched AND has error, `false` otherwise

 

## Why Does This Exist?

### The Challenge with Manual Checks

Best practice for form UX is to only show errors after users interact with fields. This requires checking both touched state AND error state.

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

// ❌ Shows error immediately (poor UX)
if (form.hasError('email')) {
  showError(form.getError('email'));
}

// ❌ Verbose manual check
if (form.isTouched('email') && form.hasError('email')) {
  showError(form.getError('email'));
}

// ✅ Clean and clear
if (form.shouldShowError('email')) {
  showError(form.getError('email'));
}
```

**Benefits of shouldShowError():**
✅ **Cleaner code** - One method instead of two checks
✅ **Better UX** - Automatically follows best practice
✅ **Consistent logic** - Same check everywhere
✅ **Self-documenting** - Name clearly states intent
✅ **Less error-prone** - Can't forget to check touched state

 

## Mental Model

Think of `shouldShowError()` as a **gatekeeper** - it only allows errors to show after user interaction.

### Visual Flow

```
Field State Analysis:
┌─────────────────────────────────────┐
│ Field: email                        │
│ Touched: false                      │
│ Has Error: true                     │
│                                     │
│ shouldShowError('email') → false    │
│ (Don't show error yet - not touched)│
└─────────────────────────────────────┘

After user interaction:
┌─────────────────────────────────────┐
│ Field: email                        │
│ Touched: true  ✓                    │
│ Has Error: true  ✓                  │
│                                     │
│ shouldShowError('email') → true     │
│ (Show error - both conditions met) │
└─────────────────────────────────────┘
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.shouldShowError('email');

// Here's what happens internally:
1️⃣ Check if field is touched
   const isTouched = form.touched[field]

2️⃣ Check if field has error
   const hasError = form.errors[field] && form.errors[field] !== ''

3️⃣ Combine checks with AND
   return isTouched && hasError

4️⃣ Return boolean result
   // true only if BOTH are true
```

### Equivalent Manual Check

```javascript
// These are equivalent:
form.shouldShowError('email')

// Manual check:
form.isTouched('email') && form.hasError('email')

// Or even more verbose:
!!form.touched.email && !!form.errors.email
```

 

## Basic Usage

### Example 1: Simple Error Display

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : ''
  }
);

effect(() => {
  const errorEl = document.getElementById('email-error');

  if (form.shouldShowError('email')) {
    errorEl.textContent = form.getError('email');
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});
```

 

### Example 2: Multiple Field Error Display

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    username: ''
  },
  {
    email: (value) => !value ? 'Required' : '',
    password: (value) => value.length < 8 ? 'Too short' : '',
    username: (value) => !value ? 'Required' : ''
  }
);

effect(() => {
  ['email', 'password', 'username'].forEach(field => {
    const errorEl = document.getElementById(`${field}-error`);

    if (form.shouldShowError(field)) {
      errorEl.textContent = form.getError(field);
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  });
});
```

 

### Example 3: Field Styling Based on Error

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : ''
  }
);

effect(() => {
  const inputEl = document.getElementById('email');

  if (form.shouldShowError('email')) {
    inputEl.classList.add('error');
    inputEl.classList.remove('valid');
  } else if (form.isTouched('email')) {
    inputEl.classList.add('valid');
    inputEl.classList.remove('error');
  } else {
    inputEl.classList.remove('error', 'valid');
  }
});
```

 

### Example 4: Error Summary

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function getVisibleErrors() {
  return Object.keys(form.values)
    .filter(field => form.shouldShowError(field))
    .map(field => ({
      field,
      message: form.getError(field)
    }));
}

effect(() => {
  const errors = getVisibleErrors();
  const summaryEl = document.getElementById('error-summary');

  if (errors.length > 0) {
    summaryEl.textContent = `${errors.length} field(s) need attention`;
  } else {
    summaryEl.textContent = '';
  }
});
```

 

### Example 5: Accessible Error Announcements

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

const announcedErrors = new Set();

effect(() => {
  if (form.shouldShowError('email')) {
    const error = form.getError('email');

    // Announce to screen reader (once)
    if (!announcedErrors.has('email')) {
      announceToScreenReader(`Error in email field: ${error}`);
      announcedErrors.add('email');
    }
  } else {
    // Clear announcement flag when error is fixed
    announcedErrors.delete('email');
  }
});

function announceToScreenReader(message) {
  const liveRegion = document.getElementById('aria-live-region');
  liveRegion.textContent = message;
}
```

 

## Advanced Patterns

### Pattern 1: Universal Error Display Helper

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

function setupErrorDisplay(field) {
  const inputEl = document.querySelector(`[name="${field}"]`);
  const errorEl = document.getElementById(`${field}-error`);

  effect(() => {
    if (form.shouldShowError(field)) {
      // Show error
      errorEl.textContent = form.getError(field);
      errorEl.style.display = 'block';
      errorEl.setAttribute('role', 'alert');

      // Style input
      inputEl.setAttribute('aria-invalid', 'true');
      inputEl.setAttribute('aria-describedby', `${field}-error`);
      inputEl.classList.add('error');
    } else {
      // Hide error
      errorEl.style.display = 'none';
      errorEl.removeAttribute('role');

      // Clear input styling
      inputEl.removeAttribute('aria-invalid');
      inputEl.removeAttribute('aria-describedby');
      inputEl.classList.remove('error');
    }
  });
}

// Setup for all fields
Object.keys(form.values).forEach(setupErrorDisplay);
```

 

### Pattern 2: Error Display with Icons

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function getFieldIcon(field) {
  if (!form.isTouched(field)) {
    return '⚪'; // Untouched
  }

  if (form.shouldShowError(field)) {
    return '❌'; // Error
  }

  return '✅'; // Valid
}

effect(() => {
  Object.keys(form.values).forEach(field => {
    const iconEl = document.getElementById(`${field}-icon`);
    iconEl.textContent = getFieldIcon(field);
  });
});
```

 

### Pattern 3: Inline Error Messages

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: (value) => value.length < 8 ? 'Too short' : '',
    confirmPassword: (value, allValues) =>
      value !== allValues.password ? 'Must match' : ''
  }
);

effect(() => {
  const passwordFeedbackEl = document.getElementById('password-feedback');

  if (form.shouldShowError('password')) {
    passwordFeedbackEl.innerHTML = `
      <span class="error-icon">❌</span>
      <span class="error-text">${form.getError('password')}</span>
    `;
    passwordFeedbackEl.className = 'feedback error';
  } else if (form.isTouched('password')) {
    passwordFeedbackEl.innerHTML = `
      <span class="success-icon">✓</span>
      <span class="success-text">Looks good!</span>
    `;
    passwordFeedbackEl.className = 'feedback success';
  } else {
    passwordFeedbackEl.innerHTML = `
      <span class="help-text">Must be at least 8 characters</span>
    `;
    passwordFeedbackEl.className = 'feedback help';
  }
});
```

 

### Pattern 4: Error List with shouldShowError()

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

function generateErrorList() {
  const errors = Object.keys(form.values)
    .filter(field => form.shouldShowError(field))
    .map(field => ({
      field,
      message: form.getError(field)
    }));

  return errors;
}

effect(() => {
  const errorListEl = document.getElementById('error-list');
  const errors = generateErrorList();

  if (errors.length === 0) {
    errorListEl.style.display = 'none';
    return;
  }

  const html = `
    <div class="error-summary">
      <h3>Please fix the following errors:</h3>
      <ul>
        ${errors.map(({ field, message }) =>
          `<li>
            <a href="#${field}">${field}:</a>
            ${message}
          </li>`
        ).join('')}
      </ul>
    </div>
  `;

  errorListEl.innerHTML = html;
  errorListEl.style.display = 'block';
});
```

 

### Pattern 5: Smart Error Timing

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

const errorDisplayMode = {
  email: 'onBlur',      // Show error when field loses focus
  password: 'onChange'  // Show error as user types (after first touch)
};

function shouldShowErrorForField(field) {
  const mode = errorDisplayMode[field] || 'onBlur';

  if (mode === 'onBlur') {
    // Standard: show error when touched and has error
    return form.shouldShowError(field);
  } else if (mode === 'onChange') {
    // Aggressive: show error immediately after first touch
    return form.isTouched(field) && form.hasError(field);
  }

  return false;
}

effect(() => {
  Object.keys(form.values).forEach(field => {
    const errorEl = document.getElementById(`${field}-error`);

    if (shouldShowErrorForField(field)) {
      errorEl.textContent = form.getError(field);
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  });
});
```

 

### Pattern 6: Error Display with Animation

```javascript
const form = Forms.create({
  email: ''
});

let previousErrorState = false;

effect(() => {
  const errorEl = document.getElementById('email-error');
  const currentErrorState = form.shouldShowError('email');

  if (currentErrorState && !previousErrorState) {
    // Error just appeared - animate in
    errorEl.textContent = form.getError('email');
    errorEl.style.display = 'block';
    errorEl.classList.add('slide-in');

    setTimeout(() => {
      errorEl.classList.remove('slide-in');
    }, 300);
  } else if (!currentErrorState && previousErrorState) {
    // Error just disappeared - animate out
    errorEl.classList.add('slide-out');

    setTimeout(() => {
      errorEl.style.display = 'none';
      errorEl.classList.remove('slide-out');
    }, 300);
  } else if (currentErrorState) {
    // Error still showing
    errorEl.textContent = form.getError('email');
    errorEl.style.display = 'block';
  } else {
    // No error
    errorEl.style.display = 'none';
  }

  previousErrorState = currentErrorState;
});

// CSS:
// .slide-in { animation: slideIn 300ms ease-out; }
// .slide-out { animation: slideOut 300ms ease-out; }
```

 

### Pattern 7: Context-Aware Error Messages

```javascript
const form = Forms.create({
  age: 0,
  country: ''
});

function getContextualErrorMessage(field) {
  if (!form.shouldShowError(field)) {
    return '';
  }

  const error = form.getError(field);
  const country = form.getValue('country');

  // Customize error based on context
  if (field === 'age' && country) {
    const minAge = country === 'US' ? 21 : 18;
    return `${error} (${country} requires ${minAge}+)`;
  }

  return error;
}

effect(() => {
  const ageErrorEl = document.getElementById('age-error');
  const message = getContextualErrorMessage('age');

  if (message) {
    ageErrorEl.textContent = message;
    ageErrorEl.style.display = 'block';
  } else {
    ageErrorEl.style.display = 'none';
  }
});
```

 

### Pattern 8: Error Tooltip Display

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function setupErrorTooltip(field) {
  const inputEl = document.querySelector(`[name="${field}"]`);
  const tooltipEl = document.getElementById(`${field}-tooltip`);

  effect(() => {
    if (form.shouldShowError(field)) {
      // Position tooltip near input
      const rect = inputEl.getBoundingClientRect();
      tooltipEl.style.top = `${rect.bottom + 5}px`;
      tooltipEl.style.left = `${rect.left}px`;

      // Show tooltip
      tooltipEl.textContent = form.getError(field);
      tooltipEl.classList.add('visible');
    } else {
      tooltipEl.classList.remove('visible');
    }
  });
}

Object.keys(form.values).forEach(setupErrorTooltip);
```

 

### Pattern 9: Error Density Indicator

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
});

function getErrorDensity() {
  const touchedFields = Object.keys(form.values).filter(f =>
    form.isTouched(f)
  );

  if (touchedFields.length === 0) {
    return { percentage: 0, severity: 'none' };
  }

  const errorsShown = touchedFields.filter(f =>
    form.shouldShowError(f)
  ).length;

  const percentage = (errorsShown / touchedFields.length) * 100;

  let severity = 'low';
  if (percentage > 50) severity = 'high';
  else if (percentage > 25) severity = 'medium';

  return { percentage, severity, errorsShown, touchedFields: touchedFields.length };
}

effect(() => {
  const density = getErrorDensity();
  const indicatorEl = document.getElementById('error-density');

  if (density.severity === 'none') {
    indicatorEl.textContent = 'No errors yet';
    indicatorEl.className = 'density none';
  } else {
    indicatorEl.textContent =
      `${density.errorsShown}/${density.touchedFields} fields have errors`;
    indicatorEl.className = `density ${density.severity}`;
  }
});
```

 

### Pattern 10: Progressive Error Revelation

```javascript
const form = Forms.create({
  step1_field: '',
  step2_field: '',
  step3_field: ''
});

let currentStep = 1;

function shouldShowErrorInCurrentStep(field) {
  const fieldStep = parseInt(field.match(/step(\d+)_/)?.[1] || '0');

  // Only show errors for current step or earlier
  if (fieldStep <= currentStep) {
    return form.shouldShowError(field);
  }

  return false;
}

effect(() => {
  Object.keys(form.values).forEach(field => {
    const errorEl = document.getElementById(`${field}-error`);

    if (shouldShowErrorInCurrentStep(field)) {
      errorEl.textContent = form.getError(field);
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  });
});

// Move to next step
nextButton.addEventListener('click', () => {
  currentStep++;
});
```

 

## Common Pitfalls

### Pitfall 1: Forgetting It Combines Two Checks

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Redundant check
if (form.shouldShowError('email') && form.hasError('email')) {
  // hasError is already checked by shouldShowError!
}

// ✅ shouldShowError is enough
if (form.shouldShowError('email')) {
  showError(form.getError('email'));
}
```

 

### Pitfall 2: Using for Non-Error Display Logic

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Wrong use case
if (form.shouldShowError('email')) {
  enableSubmitButton(); // This is about errors, not submission
}

// ✅ Use appropriate checks
if (form.isValid) {
  enableSubmitButton();
}
```

 

### Pitfall 3: Not Understanding Touch Requirement

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

// Field has error but not touched
console.log(form.hasError('email')); // true
console.log(form.shouldShowError('email')); // false (not touched!)

// ❌ Expecting error to show
// It won't show until user touches the field

// ✅ To show all errors immediately
form.touchAll();
console.log(form.shouldShowError('email')); // true
```

 

### Pitfall 4: Assuming It Runs Validation

```javascript
const form = Forms.create({
  email: ''
});

// ❌ shouldShowError doesn't trigger validation
const shouldShow = form.shouldShowError('email');

// ✅ Validation happens automatically when:
// - setValue() is called
// - validateField() is called manually
// - validateAllFields() is called
```

 

### Pitfall 5: Using for Success State

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Wrong - this checks for errors
if (!form.shouldShowError('email')) {
  showSuccess(); // This could mean untouched OR valid
}

// ✅ Check touched and no error separately
if (form.isTouched('email') && !form.hasError('email')) {
  showSuccess(); // Now we know it's touched AND valid
}
```

 

## Summary

### Key Takeaways

1. **`shouldShowError()` combines two checks** - touched AND has error.

2. **Returns true only when both conditions met** - best practice for UX.

3. **Cleaner than manual checks** - one method instead of two.

4. **Perfect for error display logic** - exactly what you need 90% of the time.

5. **Self-documenting code** - name clearly states intent.

6. **Prevents showing errors too early** - respects user interaction.

### When to Use shouldShowError()

✅ **Use shouldShowError() for:**
- Error message display logic
- Field error styling
- Error list generation
- Validation feedback UI
- Accessibility announcements

❌ **Don't use shouldShowError() for:**
- Checking if field is valid (use `!hasError()`)
- Checking if field is touched (use `isTouched()`)
- Form submission validation (use `isValid`)
- Success state display (check touched + no error)

### Comparison Table

| Check | Code | Result |
|  -|  |  --|
| Has error (any time) | `hasError('email')` | True if error exists |
| Is touched | `isTouched('email')` | True if user interacted |
| **Should show error** | `shouldShowError('email')` | **True if both ✅** |
| Manual equivalent | `isTouched('email') && hasError('email')` | Same as above |

### One-Line Rule

> **`form.shouldShowError(field)` returns true when a field is both touched AND has an error - use it for all error display logic to follow UX best practices.**

 

**What's Next?**

- Explore complete form validation workflows
- Master error display patterns and accessibility
- Learn advanced touch state management strategies
