# form.hasError()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Check if specific fields have errors
console.log(form.hasError('email')); // false (no error yet)

form.setError('email', 'Email already exists');

console.log(form.hasError('email')); // true
console.log(form.hasError('password')); // false
console.log(form.hasError('username')); // false

// Use in conditional logic
if (form.hasError('email')) {
  console.log('Email field has an error!');
}

// Clear the error
form.clearError('email');
console.log(form.hasError('email')); // false
```

**What just happened?** `hasError()` checks if a specific field has an error - perfect for conditional logic and UI updates!

 

## What is form.hasError()?

`form.hasError()` is a **field error checking method** that returns true if a specific field has a validation error.

Simply put, it's a clean way to ask "does this field have an error?"

**Key characteristics:**
- ✅ Returns boolean (true/false)
- ✅ Checks a single field
- ✅ Cleaner than checking `form.errors[field]` directly
- ✅ Perfect for conditional rendering
- ✅ Works great in reactive effects

 

## Syntax

```javascript
// Check if field has error
const hasError = form.hasError(fieldName)

// Use in conditions
if (form.hasError('email')) {
  // Show error UI
}

// Use in reactive effects
effect(() => {
  if (form.hasError('password')) {
    showPasswordError();
  }
});
```

**Parameters:**
- `fieldName` (string) - The name of the field to check

**Returns:** `boolean` - `true` if field has an error, `false` otherwise

 

## Why Does This Exist?

### Providing Clean Boolean Checks

While you can check errors directly, `hasError()` provides a cleaner, more explicit API.

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid email');

// Both work, but hasError() is cleaner:
if (form.errors.email) { }           // Truthy check
if (form.hasError('email')) { }      // ✅ Explicit boolean check

// Also handles edge cases better:
form.setError('email', '');          // Empty string (falsy)
console.log(!!form.errors.email);    // false
console.log(form.hasError('email')); // false (consistent)
```

**When to use hasError():**
✅ **Conditional rendering** - Show/hide error messages
✅ **Validation checks** - Check if specific fields are valid
✅ **UI state management** - Enable/disable buttons
✅ **Form logic** - Branch based on error state
✅ **Cleaner code** - More readable than `!!form.errors[field]`

 

## Mental Model

Think of `hasError()` as a **yes/no question** about a field's error state.

### Visual Representation

```
Form State:
┌──────────────────────────┐
│ email: "Invalid email"   │ → hasError('email') → true
│ password: ""             │ → hasError('password') → false
│ username: "Too short"    │ → hasError('username') → true
└──────────────────────────┘

Simple yes/no answer for each field!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.hasError('email');

// Here's what happens internally:
1️⃣ Get the error value for the field
   const error = form.errors[field]

2️⃣ Check if error is truthy (not empty string)
   return !!error

3️⃣ Return boolean result
   // true if error exists, false otherwise
```

### Equivalent Check

```javascript
// These are equivalent:
form.hasError('email')
!!form.errors.email
Boolean(form.errors.email)
form.errors.email !== ''
form.errors.email.length > 0
```

 

## Basic Usage

### Example 1: Conditional Error Display

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

effect(() => {
  const emailErrorEl = document.getElementById('email-error');

  if (form.hasError('email')) {
    emailErrorEl.textContent = form.errors.email;
    emailErrorEl.style.display = 'block';
  } else {
    emailErrorEl.style.display = 'none';
  }
});

// Set error
form.setError('email', 'Email is required');
// Error message shows automatically
```

 

### Example 2: Button State Management

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

const submitButton = document.getElementById('submit');

effect(() => {
  // Disable button if ANY field has an error
  const hasAnyError =
    form.hasError('username') ||
    form.hasError('email') ||
    form.hasError('password');

  submitButton.disabled = hasAnyError;
});
```

 

### Example 3: Field Styling

```javascript
const form = Forms.create({
  email: ''
});

const emailInput = document.getElementById('email');

effect(() => {
  if (form.hasError('email')) {
    emailInput.classList.add('error');
    emailInput.classList.remove('valid');
  } else if (form.touched.email) {
    emailInput.classList.add('valid');
    emailInput.classList.remove('error');
  } else {
    emailInput.classList.remove('error', 'valid');
  }
});
```

 

### Example 4: Show Error Only When Touched

```javascript
const form = Forms.create({
  email: ''
});

effect(() => {
  const errorEl = document.getElementById('email-error');

  // Only show error if field is touched AND has error
  if (form.touched.email && form.hasError('email')) {
    errorEl.textContent = form.errors.email;
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});
```

 

### Example 5: Multi-Field Validation Check

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

function canProceed() {
  // Check if all fields are error-free
  return !form.hasError('firstName') &&
         !form.hasError('lastName') &&
         !form.hasError('email');
}

nextButton.addEventListener('click', () => {
  if (canProceed()) {
    goToNextStep();
  } else {
    alert('Please fix all errors before proceeding');
  }
});
```

 

## Advanced Patterns

### Pattern 1: Error Icon Indicator

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function updateFieldIcon(fieldName) {
  const iconEl = document.querySelector(`#${fieldName}-icon`);

  if (form.hasError(fieldName)) {
    iconEl.innerHTML = '❌';
    iconEl.className = 'icon error';
  } else if (form.touched[fieldName]) {
    iconEl.innerHTML = '✅';
    iconEl.className = 'icon valid';
  } else {
    iconEl.innerHTML = '⚪';
    iconEl.className = 'icon untouched';
  }
}

// Update icons reactively
effect(() => {
  ['field1', 'field2', 'field3'].forEach(updateFieldIcon);
});
```

 

### Pattern 2: Progressive Error Display

```javascript
const form = Forms.create({
  password: '',
  confirmPassword: ''
});

effect(() => {
  const confirmErrorEl = document.getElementById('confirm-error');

  // Only show confirm password error if:
  // 1. Password field has no errors
  // 2. Confirm password has been touched
  // 3. Confirm password has an error
  if (!form.hasError('password') &&
      form.touched.confirmPassword &&
      form.hasError('confirmPassword')) {
    confirmErrorEl.textContent = form.errors.confirmPassword;
    confirmErrorEl.style.display = 'block';
  } else {
    confirmErrorEl.style.display = 'none';
  }
});
```

 

### Pattern 3: Error Summary Count

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

function getErrorSummary() {
  const fields = ['field1', 'field2', 'field3', 'field4'];

  const errorCount = fields.filter(field =>
    form.hasError(field)
  ).length;

  return {
    total: fields.length,
    errors: errorCount,
    valid: fields.length - errorCount,
    hasErrors: errorCount > 0
  };
}

effect(() => {
  const summary = getErrorSummary();
  const summaryEl = document.getElementById('error-summary');

  if (summary.hasErrors) {
    summaryEl.textContent = `${summary.errors} field(s) need attention`;
    summaryEl.style.color = 'red';
  } else {
    summaryEl.textContent = 'All fields valid!';
    summaryEl.style.color = 'green';
  }
});
```

 

### Pattern 4: Field Dependency Validation

```javascript
const form = Forms.create({
  shippingSameAsBilling: true,
  shippingAddress: '',
  billingAddress: ''
});

effect(() => {
  const shippingErrorEl = document.getElementById('shipping-error');
  const sameAsBilling = form.getValue('shippingSameAsBilling');

  // Only show shipping address error if not same as billing
  if (!sameAsBilling && form.hasError('shippingAddress')) {
    shippingErrorEl.textContent = form.errors.shippingAddress;
    shippingErrorEl.style.display = 'block';
  } else {
    shippingErrorEl.style.display = 'none';
  }
});
```

 

### Pattern 5: Smart Error Badge

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

function updateErrorBadge(section) {
  const fields = getSectionFields(section);
  const errorCount = fields.filter(field => form.hasError(field)).length;

  const badgeEl = document.querySelector(`#${section}-badge`);

  if (errorCount > 0) {
    badgeEl.textContent = errorCount;
    badgeEl.style.display = 'inline-block';
    badgeEl.className = 'badge error';
  } else {
    badgeEl.style.display = 'none';
  }
}

function getSectionFields(section) {
  const sections = {
    account: ['username', 'email'],
    security: ['password']
  };
  return sections[section] || [];
}

effect(() => {
  updateErrorBadge('account');
  updateErrorBadge('security');
});
```

 

### Pattern 6: Inline Validation Feedback

```javascript
const form = Forms.create({
  email: ''
});

effect(() => {
  const feedbackEl = document.getElementById('email-feedback');
  const emailValue = form.getValue('email');

  if (!emailValue) {
    // Empty - no feedback
    feedbackEl.textContent = '';
    feedbackEl.className = '';
  } else if (form.hasError('email')) {
    // Has error
    feedbackEl.textContent = `❌ ${form.errors.email}`;
    feedbackEl.className = 'feedback error';
  } else {
    // Valid
    feedbackEl.textContent = '✓ Looks good!';
    feedbackEl.className = 'feedback success';
  }
});
```

 

### Pattern 7: Multi-Step Form Progress

```javascript
const form = Forms.create({
  // Step 1
  firstName: '',
  lastName: '',

  // Step 2
  email: '',
  phone: '',

  // Step 3
  address: '',
  city: ''
});

const steps = {
  1: ['firstName', 'lastName'],
  2: ['email', 'phone'],
  3: ['address', 'city']
};

function isStepValid(stepNumber) {
  const fields = steps[stepNumber];
  return fields.every(field => !form.hasError(field));
}

function updateStepIndicator(stepNumber) {
  const indicatorEl = document.querySelector(`#step-${stepNumber}`);

  if (isStepValid(stepNumber)) {
    indicatorEl.classList.add('complete');
    indicatorEl.classList.remove('incomplete');
  } else {
    indicatorEl.classList.add('incomplete');
    indicatorEl.classList.remove('complete');
  }
}

effect(() => {
  [1, 2, 3].forEach(updateStepIndicator);
});
```

 

### Pattern 8: Conditional Field Requirements

```javascript
const form = Forms.create({
  accountType: 'personal',
  companyName: '',
  companyTaxId: ''
});

effect(() => {
  const isBusiness = form.getValue('accountType') === 'business';

  const companyNameEl = document.getElementById('company-name');
  const taxIdEl = document.getElementById('company-tax-id');

  // Show/hide required indicators based on account type
  if (isBusiness) {
    companyNameEl.classList.add('required');
    taxIdEl.classList.add('required');

    // Show errors if present
    if (form.hasError('companyName')) {
      showFieldError('companyName');
    }
    if (form.hasError('companyTaxId')) {
      showFieldError('companyTaxId');
    }
  } else {
    companyNameEl.classList.remove('required');
    taxIdEl.classList.remove('required');

    // Hide errors for optional fields
    hideFieldError('companyName');
    hideFieldError('companyTaxId');
  }
});
```

 

### Pattern 9: Error Severity Styling

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const errorSeverity = {
  field1: 'critical',
  field2: 'warning',
  field3: 'info'
};

function getErrorClass(field) {
  if (!form.hasError(field)) {
    return '';
  }

  const severity = errorSeverity[field] || 'error';
  return `error-${severity}`;
}

effect(() => {
  ['field1', 'field2', 'field3'].forEach(field => {
    const inputEl = document.querySelector(`[name="${field}"]`);
    const errorClass = getErrorClass(field);

    // Remove all error classes
    inputEl.classList.remove('error-critical', 'error-warning', 'error-info');

    // Add appropriate class
    if (errorClass) {
      inputEl.classList.add(errorClass);
    }
  });
});
```

 

### Pattern 10: Smart Submit Button Text

```javascript
const form = Forms.create({
  email: '',
  password: '',
  terms: false
});

const submitButton = document.getElementById('submit');

effect(() => {
  const errorFields = [];

  if (form.hasError('email')) errorFields.push('email');
  if (form.hasError('password')) errorFields.push('password');
  if (form.hasError('terms')) errorFields.push('terms');

  if (errorFields.length === 0) {
    submitButton.textContent = 'Submit';
    submitButton.disabled = false;
  } else if (errorFields.length === 1) {
    submitButton.textContent = `Fix ${errorFields[0]} to continue`;
    submitButton.disabled = true;
  } else {
    submitButton.textContent = `Fix ${errorFields.length} errors to continue`;
    submitButton.disabled = true;
  }
});
```

 

## Common Pitfalls

### Pitfall 1: Confusing with hasErrors (plural)

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

form.setError('email', 'Invalid');

// ❌ Wrong - hasErrors (plural) checks if ANY field has errors
console.log(form.hasErrors); // true (property, not method)

// ✅ Correct - hasError (singular) checks specific field
console.log(form.hasError('email')); // true
console.log(form.hasError('password')); // false
```

 

### Pitfall 2: Not Using with Touched State

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

// ❌ Shows error immediately (poor UX)
effect(() => {
  if (form.hasError('email')) {
    showError(form.errors.email);
  }
});

// ✅ Only show error after user touches field
effect(() => {
  if (form.touched.email && form.hasError('email')) {
    showError(form.errors.email);
  }
});
```

 

### Pitfall 3: Checking Non-Existent Fields

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ Field doesn't exist
console.log(form.hasError('username')); // false (but misleading)

// ✅ Check if field exists first
if ('username' in form.values && form.hasError('username')) {
  // Only runs if field exists
}
```

 

### Pitfall 4: Overusing in Loops

```javascript
const form = Forms.create({
  field1: '', field2: '', field3: ''
});

// ❌ Inefficient - multiple checks
const fields = ['field1', 'field2', 'field3'];
if (fields.some(field => form.hasError(field))) {
  // ...
}

// ✅ Better - use computed property
if (form.hasErrors) {
  // Checks if ANY field has error
}

// ✅ Or use errorFields array
if (form.errorFields.length > 0) {
  // More efficient
}
```

 

### Pitfall 5: Using Instead of Direct Error Access

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid email');

// ❌ Checking then accessing (two operations)
if (form.hasError('email')) {
  const error = form.errors.email;
  showError(error);
}

// ✅ Just access directly (truthy check)
if (form.errors.email) {
  showError(form.errors.email);
}

// hasError() is better for pure boolean checks:
submitButton.disabled = form.hasError('email'); // ✅ Clear intent
```

 

## Summary

### Key Takeaways

1. **`hasError()` returns boolean** - true if field has error, false otherwise.

2. **Checks single field** - not the whole form (that's `hasErrors` property).

3. **Cleaner than `!!form.errors[field]`** - explicit and readable.

4. **Perfect for conditional logic** - UI updates, validation checks, button states.

5. **Works with any field** - returns false for non-existent fields.

6. **Use with touched state** - for better UX (don't show errors too early).

### When to Use hasError()

✅ **Use hasError() for:**
- Conditional rendering (show/hide error messages)
- Boolean checks (enable/disable buttons)
- Field-specific validation status
- Clear, explicit intent in code
- Reactive effect conditions

❌ **Don't use hasError() when:**
- You need the error message (use `getError()` or `form.errors[field]`)
- Checking if form has ANY errors (use `form.hasErrors` property)
- Already accessing error for display (truthy check is fine)

### Comparison Table

| Check | Method/Property | Returns | Use Case |
|  -|     -|   |   -|
| Specific field | `hasError('email')` | `boolean` | Field-specific check ✅ |
| Get error message | `getError('email')` | `string` | Display error ✅ |
| Any field | `hasErrors` | `boolean` | Overall validation ✅ |
| All errors | `errorFields` | `array` | List of invalid fields ✅ |

### One-Line Rule

> **`form.hasError(field)` checks if a specific field has a validation error - use it for clean boolean checks in conditional logic and UI updates.**

 

**What's Next?**

- Learn about `form.getError()` for retrieving error messages
- Explore `form.hasErrors` property for overall validation state
- Master reactive error display patterns with effects
