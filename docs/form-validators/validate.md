# form.validate()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    username: '',
    age: 0
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : '',
    username: (value) => !value ? 'Required' : '',
    age: (value) => value < 18 ? 'Must be 18+' : ''
  }
);

// Set some values (some valid, some invalid)
form.setValue('email', 'invalid');
form.setValue('password', '123');
form.setValue('username', 'alice');
form.setValue('age', 25);

// Validate ALL fields at once
form.validate();

console.log(form.errors);
// {
//   email: 'Invalid email',
//   password: 'Too short',
//   username: '',
//   age: ''
// }

console.log(form.isValid); // false (has 2 errors)
console.log(form.errorFields); // ['email', 'password']

// Fix errors and revalidate
form.setValue('email', 'user@example.com');
form.setValue('password', 'secure123');
form.validate();

console.log(form.isValid); // true (all valid now)
```

**What just happened?** `validate()` runs validation on ALL fields at once - perfect for form submission!

 

## What is form.validate()?

`form.validate()` is the **complete form validation method** that validates all fields simultaneously.

Simply put, it runs every validator function and updates all error states in one efficient operation.

**Key characteristics:**
- ✅ Validates all fields at once
- ✅ Runs all validator functions
- ✅ Updates all error states
- ✅ More efficient than validating individually
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Validate all fields
form.validate()

// With chaining
form
  .validate()
  .touchAll();

// Common usage pattern
submitButton.addEventListener('click', () => {
  form.validate();

  if (form.isValid) {
    handleSubmit();
  }
});
```

**Parameters:** None

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Individual Validation

When submitting a form, you need to validate ALL fields. Calling `validateField()` for each one is tedious and inefficient.

```javascript
const form = Forms.create(
  {
    field1: '', field2: '', field3: '', field4: '', field5: ''
  },
  {
    field1: (value) => !value ? 'Required' : '',
    field2: (value) => !value ? 'Required' : '',
    field3: (value) => !value ? 'Required' : '',
    field4: (value) => !value ? 'Required' : '',
    field5: (value) => !value ? 'Required' : ''
  }
);

// ❌ Tedious - validate each field individually
form.validateField('field1');
form.validateField('field2');
form.validateField('field3');
form.validateField('field4');
form.validateField('field5');

// ❌ Or loop (still verbose)
Object.keys(form.values).forEach(field => {
  form.validateField(field);
});

// ✅ Simple - validate all at once
form.validate();
```

**When to use validate():**
✅ **Form submission** - Validate everything before submitting
✅ **Manual validation trigger** - "Validate All" button
✅ **Step completion** - Multi-step form final check
✅ **Initial validation** - Check form state on load
✅ **Batch validation** - Validate all after data changes

 

## Mental Model

Think of `validate()` as **pressing the validate button for the entire form** - it checks everything at once.

### Visual Flow

```
Before validate():
┌─────────────────────────────────┐
│ email: value="invalid"          │
│        error="" (not validated) │
│ password: value="123"            │
│           error="" (not validated)│
│ username: value="alice"         │
│           error="" (not validated)│
└─────────────────────────────────┘
         ↓
   form.validate()
         ↓
   Run ALL validators
         ↓
After validate():
┌─────────────────────────────────┐
│ email: value="invalid"          │
│        error="Invalid email" ✓  │
│ password: value="123"            │
│           error="Too short" ✓   │
│ username: value="alice"         │
│           error="" ✓            │
└─────────────────────────────────┘
  All fields validated!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.validate();

// Here's what happens internally:
1️⃣ Loop through all fields
   Object.keys(form.values).forEach(field => {
     ...
   })

2️⃣ For each field, run its validator (if exists)
   if (validators[field]) {
     const error = validators[field](
       form.values[field],  // Current value
       form.values          // All values
     )
     form.errors[field] = error
   }

3️⃣ Trigger reactive updates (once)
   - form.hasErrors recalculates
   - form.isValid recalculates
   - form.errorFields updates

4️⃣ All reactive effects fire (once)
   - All error displays update
   - Submit button state changes
   - Field styling updates

5️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
validate()
    ↓
Loop through all fields
    ↓
Run each validator function
    ↓
Update all error values
    ↓
Reactive properties update (once):
- hasErrors
- isValid
- errorFields
    ↓
All effects fire once
    ↓
All UI updates in one batch
```

 

## Basic Usage

### Example 1: Validate on Submit

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

submitButton.addEventListener('click', (e) => {
  e.preventDefault();

  // Validate all fields
  form.validate();

  if (form.isValid) {
    handleSubmit();
  } else {
    alert(`Please fix ${form.errorFields.length} error(s)`);
  }
});
```

 

### Example 2: Validate All Button

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

validateAllButton.addEventListener('click', () => {
  // Validate all fields
  form.validate();

  // Touch all to show errors
  form.touchAll();

  // Show summary
  if (form.isValid) {
    showNotification('All fields are valid!', 'success');
  } else {
    showNotification(
      `${form.errorFields.length} field(s) have errors`,
      'error'
    );
  }
});
```

 

### Example 3: Validate Before Save

```javascript
const form = Forms.create(
  {
    title: '',
    content: ''
  },
  {
    title: (value) => !value ? 'Title required' : '',
    content: (value) => value.length < 10 ? 'Content too short' : ''
  }
);

async function saveDraft() {
  // Validate all fields
  form.validate();

  if (form.isValid) {
    await fetch('/api/drafts', {
      method: 'POST',
      body: JSON.stringify(form.values)
    });
    showNotification('Draft saved!');
  } else {
    showNotification('Cannot save draft with errors', 'error');
  }
}
```

 

### Example 4: Multi-Step Form Final Validation

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

function finalizeSubmission() {
  // Validate everything
  form.validate();

  // Touch all to show errors
  form.touchAll();

  if (form.isValid) {
    submitForm();
  } else {
    // Find first step with errors
    const firstError = form.errorFields[0];
    const stepNumber = getStepForField(firstError);

    goToStep(stepNumber);
    alert(`Please fix errors in step ${stepNumber}`);
  }
}
```

 

### Example 5: Validate on Initial Load

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

// Load saved data
async function loadSavedData() {
  const data = await fetchSavedData();

  // Set values without marking as touched
  Object.entries(data).forEach(([field, value]) => {
    form.setValue(field, value);
    form.setTouched(field, false);
  });

  // Validate to check if saved data is still valid
  form.validate();

  if (!form.isValid) {
    showWarning('Saved data has validation errors');
  }
}
```

 

## Advanced Patterns

### Pattern 1: Validate with Progress Indicator

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
});

async function validateWithProgress() {
  const fields = Object.keys(form.values);
  let validated = 0;

  showProgressModal();

  for (const field of fields) {
    // Validate one field at a time (for visual feedback)
    form.validateField(field);

    validated++;
    updateProgress((validated / fields.length) * 100);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  hideProgressModal();

  // Show results
  if (form.isValid) {
    showNotification('All fields valid!');
  } else {
    showNotification(`${form.errorFields.length} errors found`);
  }
}

// Or just use validate() for instant validation
function validateInstantly() {
  form.validate();
  form.touchAll();
}
```

 

### Pattern 2: Validate with Error Summary

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function validateAndShowSummary() {
  form.validate();
  form.touchAll();

  if (form.isValid) {
    showSuccessSummary();
    return;
  }

  // Build error summary
  const errorSummary = form.errorFields.map(field => ({
    field,
    message: form.getError(field),
    value: form.getValue(field)
  }));

  showErrorModal({
    title: `${errorSummary.length} Validation Errors`,
    errors: errorSummary
  });
}
```

 

### Pattern 3: Conditional Validation

```javascript
const form = Forms.create(
  {
    accountType: 'personal',
    companyName: '',
    taxId: '',
    personalId: ''
  },
  {
    companyName: (value, allValues) =>
      allValues.accountType === 'business' && !value ? 'Required' : '',
    taxId: (value, allValues) =>
      allValues.accountType === 'business' && !value ? 'Required' : '',
    personalId: (value, allValues) =>
      allValues.accountType === 'personal' && !value ? 'Required' : ''
  }
);

submitButton.addEventListener('click', () => {
  // Validate all - validators handle conditional logic
  form.validate();

  if (form.isValid) {
    handleSubmit();
  }
});
```

 

### Pattern 4: Validate with Retry

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

let validationAttempts = 0;
const MAX_ATTEMPTS = 3;

function validateWithRetry() {
  validationAttempts++;

  form.validate();
  form.touchAll();

  if (form.isValid) {
    validationAttempts = 0; // Reset on success
    handleSubmit();
  } else if (validationAttempts >= MAX_ATTEMPTS) {
    showHelpDialog(form.errorFields);
  } else {
    showNotification(
      `Please fix errors (Attempt ${validationAttempts}/${MAX_ATTEMPTS})`
    );
  }
}
```

 

### Pattern 5: Validate with Analytics

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function validateWithAnalytics() {
  const startTime = Date.now();
  const valuesBefore = { ...form.values };

  form.validate();

  const duration = Date.now() - startTime;
  const errorCount = form.errorFields.length;

  analytics.track('form_validated', {
    duration,
    totalFields: Object.keys(form.values).length,
    errorCount,
    isValid: form.isValid,
    errorFields: form.errorFields,
    filledFields: Object.values(form.values).filter(Boolean).length
  });

  return form.isValid;
}
```

 

### Pattern 6: Async Batch Validation

```javascript
const form = Forms.create({
  username: '',
  email: '',
  domain: ''
});

async function validateWithServer() {
  // First, run local validation
  form.validate();

  if (!form.isValid) {
    return false; // Stop if local validation fails
  }

  // Run server validations in parallel
  const [usernameCheck, emailCheck, domainCheck] = await Promise.all([
    fetch(`/api/check-username?username=${form.getValue('username')}`).then(r => r.json()),
    fetch(`/api/check-email?email=${form.getValue('email')}`).then(r => r.json()),
    fetch(`/api/check-domain?domain=${form.getValue('domain')}`).then(r => r.json())
  ]);

  // Update errors based on server response
  if (!usernameCheck.available) {
    form.setError('username', 'Username taken');
  }

  if (!emailCheck.valid) {
    form.setError('email', emailCheck.message);
  }

  if (!domainCheck.allowed) {
    form.setError('domain', 'Domain not allowed');
  }

  return form.isValid;
}
```

 

### Pattern 7: Validate with State Persistence

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function validateAndSaveState() {
  // Save pre-validation state
  const stateBeforeValidation = {
    values: { ...form.values },
    errors: { ...form.errors },
    touched: { ...form.touched }
  };

  // Validate
  form.validate();

  // Save post-validation state
  const stateAfterValidation = {
    values: { ...form.values },
    errors: { ...form.errors },
    isValid: form.isValid,
    errorCount: form.errorFields.length
  };

  // Persist validation result
  localStorage.setItem('lastValidation', JSON.stringify({
    timestamp: Date.now(),
    before: stateBeforeValidation,
    after: stateAfterValidation
  }));

  return form.isValid;
}
```

 

### Pattern 8: Prioritized Error Display

```javascript
const form = Forms.create({
  critical1: '',
  critical2: '',
  warning1: '',
  info1: ''
});

const fieldPriority = {
  critical1: 1,
  critical2: 1,
  warning1: 2,
  info1: 3
};

function validateAndPrioritizeErrors() {
  form.validate();

  if (form.isValid) {
    return [];
  }

  // Group errors by priority
  const errorsByPriority = form.errorFields.reduce((acc, field) => {
    const priority = fieldPriority[field] || 3;

    if (!acc[priority]) {
      acc[priority] = [];
    }

    acc[priority].push({
      field,
      message: form.getError(field)
    });

    return acc;
  }, {});

  // Show critical errors first
  if (errorsByPriority[1]) {
    showCriticalErrors(errorsByPriority[1]);
  } else if (errorsByPriority[2]) {
    showWarnings(errorsByPriority[2]);
  } else {
    showInfo(errorsByPriority[3]);
  }

  return errorsByPriority;
}
```

 

### Pattern 9: Validate with Confirmation

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

async function validateWithConfirmation() {
  form.validate();

  if (form.isValid) {
    return true;
  }

  // Show confirmation dialog with errors
  const confirmed = await showConfirmDialog({
    title: 'Validation Errors Found',
    message: `Found ${form.errorFields.length} error(s). Fix them now?`,
    errors: form.errorFields.map(field => ({
      field,
      message: form.getError(field)
    }))
  });

  if (confirmed) {
    form.touchAll();
    focusFirstError();
    return false;
  }

  return false;
}

function focusFirstError() {
  const firstError = form.errorFields[0];
  document.querySelector(`[name="${firstError}"]`)?.focus();
}
```

 

### Pattern 10: Validate with Healing

```javascript
const form = Forms.create({
  email: '',
  phone: '',
  zipCode: ''
});

function validateAndAttemptHeal() {
  form.validate();

  if (form.isValid) {
    return true;
  }

  // Attempt to auto-fix common issues
  let healed = false;

  form.errorFields.forEach(field => {
    const value = form.getValue(field);

    if (field === 'email') {
      // Fix common email typos
      const healed = healEmail(value);
      if (healed !== value) {
        form.setValue(field, healed);
        healed = true;
      }
    } else if (field === 'phone') {
      // Format phone number
      const healed = formatPhone(value);
      if (healed !== value) {
        form.setValue(field, healed);
        healed = true;
      }
    }
  });

  if (healed) {
    // Revalidate after healing
    form.validate();
    showNotification('Auto-fixed some fields');
  }

  return form.isValid;
}

function healEmail(email) {
  return email
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/,/g, '.');
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return phone;
}
```

 

## Common Pitfalls

### Pitfall 1: Not Touching Fields Before Showing Errors

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

submitButton.addEventListener('click', () => {
  // ❌ Validates but doesn't show errors
  form.validate();

  // Errors exist but aren't displayed (fields not touched)
  if (!form.isValid) {
    alert('Form has errors'); // User doesn't see which ones!
  }
});

// ✅ Touch all to show errors
submitButton.addEventListener('click', () => {
  form.validate();
  form.touchAll(); // Now errors are visible

  if (!form.isValid) {
    // User can see the errors
  }
});
```

 

### Pitfall 2: Assuming validate() Marks Fields as Touched

```javascript
const form = Forms.create({
  email: ''
});

// ❌ validate() doesn't touch fields
form.validate();
console.log(form.isTouched('email')); // false

// ✅ Touch manually if needed
form.validate();
form.touchAll();
console.log(form.isTouched('email')); // true
```

 

### Pitfall 3: Validating Empty Form

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

// ❌ Validating before user fills anything
window.addEventListener('load', () => {
  form.validate(); // All fields show errors immediately!
  form.touchAll(); // Bad UX
});

// ✅ Only validate on submit or user action
submitButton.addEventListener('click', () => {
  form.validate();
  form.touchAll();
});
```

 

### Pitfall 4: Not Checking isValid After validate()

```javascript
const form = Forms.create({
  email: ''
});

submitButton.addEventListener('click', () => {
  // ❌ Validates but doesn't check result
  form.validate();
  handleSubmit(); // Submits even if invalid!
});

// ✅ Check isValid
submitButton.addEventListener('click', () => {
  form.validate();

  if (form.isValid) {
    handleSubmit();
  } else {
    showErrors();
  }
});
```

 

### Pitfall 5: Over-Validating

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

// ❌ Validating on every input (expensive)
input1.addEventListener('input', () => {
  form.validate(); // Validates ALL fields on every keystroke!
});

// ✅ Validate only the field that changed
input1.addEventListener('input', () => {
  form.validateField('field1'); // Only validate this field
});

// ✅ Or validate all only on submit
submitButton.addEventListener('click', () => {
  form.validate(); // Appropriate time
});
```

 

## Summary

### Key Takeaways

1. **`validate()` validates all fields** in one efficient operation.

2. **Runs all validator functions** - updates all error states.

3. **Single reactive update** - UI updates once, not per field.

4. **Perfect for form submission** - check everything before submitting.

5. **Returns form instance** - enables method chaining.

6. **Doesn't touch fields** - combine with `touchAll()` to show errors.

### When to Use validate()

✅ **Use validate() for:**
- Form submission handlers
- "Validate All" button functionality
- Multi-step form final validation
- Before saving data
- Initial validation on data load

❌ **Don't use validate() when:**
- Single field changes (use `validateField()`)
- On every keystroke (expensive)
- Before form is filled (bad UX)
- Fields are auto-validating via setValue()

### Comparison Table

| Method | Scope | When to Use |
|  --|  -|    -|
| `setValue()` | One field (auto) | User input ✅ |
| `validateField('email')` | One field (manual) | Blur, dependencies ✅ |
| `validate()` | All fields | Submit, validate all ✅ |

### One-Line Rule

> **`form.validate()` runs validation on all fields at once - use it before form submission or when you need to check the entire form's validity.**

 

**What's Next?**

- Explore form submission patterns
- Master async validation strategies
- Learn validation timing best practices
