# form.validateField()

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

// Set some values
form.setValue('email', 'invalid-email');
form.setValue('password', '123');

// Manually validate specific field
form.validateField('email');

console.log(form.errors.email); // 'Invalid email'
console.log(form.errors.password); // 'Too short' (from setValue)
console.log(form.errors.username); // '' (not validated yet)

// Validate another field
form.validateField('username');

console.log(form.errors.username); // 'Required'

// Fix and revalidate
form.setValue('email', 'user@example.com');
form.validateField('email');

console.log(form.errors.email); // '' (now valid)
```

**What just happened?** `validateField()` manually runs validation on a specific field - perfect for on-demand validation!

 

## What is form.validateField()?

`form.validateField()` is the **single field validation method** that manually triggers validation for a specific field.

Simply put, it runs the validator function for one field and updates its error state.

**Key characteristics:**
- ✅ Validates a single specific field
- ✅ Runs the field's validator function
- ✅ Updates the field's error state
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Validate single field
form.validateField(fieldName)

// Chain multiple validations
form
  .validateField('email')
  .validateField('password');
```

**Parameters:**
- `fieldName` (string) - The name of the field to validate

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Automatic Validation

While `setValue()` automatically runs validation, sometimes you need manual control:

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

// setValue() auto-validates
form.setValue('email', 'user@example.com'); // ✓ Validates automatically

// But what if you need to:
// - Revalidate after external data changes?
// - Validate on blur instead of on change?
// - Validate dependent fields?

// validateField() gives you manual control
form.validateField('email'); // ✓ Manual validation
```

**When to use validateField():**
✅ **Blur validation** - Validate when user leaves field
✅ **Dependent validation** - Revalidate when related field changes
✅ **Manual triggers** - Button clicks, checkboxes, etc.
✅ **Async validation** - After server checks complete
✅ **Custom validation timing** - Control exactly when validation runs

 

## Mental Model

Think of `validateField()` as **pressing the validate button** for a specific field.

### Visual Flow

```
Before validateField('email'):
┌─────────────────────────────────┐
│ Field: email                    │
│ Value: "invalid"                │
│ Error: "" (not validated)       │
└─────────────────────────────────┘
         ↓
   validateField('email')
         ↓
   Run validator function
         ↓
After validateField('email'):
┌─────────────────────────────────┐
│ Field: email                    │
│ Value: "invalid"                │
│ Error: "Invalid email" ✓        │
└─────────────────────────────────┘
  Error state updated!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.validateField('email');

// Here's what happens internally:
1️⃣ Get the validator for the field
   const validator = validators.email

2️⃣ Run the validator with current value
   const error = validator(
     form.values.email,  // Current field value
     form.values         // All form values
   )

3️⃣ Update the error state
   form.errors.email = error

4️⃣ Trigger reactive updates
   - form.hasErrors recalculates
   - form.isValid recalculates
   - form.errorFields updates

5️⃣ All reactive effects fire
   - Error display updates
   - Field styling changes
   - Submit button state updates

6️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
validateField('email')
         ↓
    Get validator function
         ↓
    Run validator(value, allValues)
         ↓
    Update form.errors.email
         ↓
    Reactive properties update:
    - hasErrors
    - isValid
    - errorFields
         ↓
    All effects fire
         ↓
    UI updates automatically
```

 

## Basic Usage

### Example 1: Validate on Blur

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : ''
  }
);

const emailInput = document.getElementById('email');

// Update value on input (don't validate yet)
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
  form.setTouched('email', false); // Override auto-touch
});

// Validate on blur
emailInput.addEventListener('blur', () => {
  form.setTouched('email', true);
  form.validateField('email');
});
```

 

### Example 2: Validate Dependent Fields

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: (value) => value.length < 8 ? 'Too short' : '',
    confirmPassword: (value, allValues) =>
      value !== allValues.password ? 'Passwords must match' : ''
  }
);

// When password changes, revalidate confirm
passwordInput.addEventListener('input', (e) => {
  form.setValue('password', e.target.value);

  // Revalidate confirm if it's been touched
  if (form.isTouched('confirmPassword')) {
    form.validateField('confirmPassword');
  }
});
```

 

### Example 3: Validate Button

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

validateButton.addEventListener('click', () => {
  // Validate specific field
  form.validateField('email');

  if (form.hasError('email')) {
    alert(`Email error: ${form.getError('email')}`);
  } else {
    alert('Email is valid!');
  }
});
```

 

### Example 4: Async Validation Trigger

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: (value) => value.length < 3 ? 'Too short' : ''
  }
);

let checkTimeout;

usernameInput.addEventListener('input', (e) => {
  const username = e.target.value;
  form.setValue('username', username);

  // Clear previous check
  clearTimeout(checkTimeout);

  // Debounce async check
  checkTimeout = setTimeout(async () => {
    // First, run local validation
    form.validateField('username');

    if (!form.hasError('username')) {
      // If local validation passes, check with server
      const available = await checkUsernameAvailability(username);

      if (!available) {
        form.setError('username', 'Username already taken');
      }
    }
  }, 500);
});
```

 

### Example 5: Conditional Validation

```javascript
const form = Forms.create(
  {
    accountType: 'personal',
    companyName: ''
  },
  {
    companyName: (value, allValues) => {
      if (allValues.accountType === 'business' && !value) {
        return 'Company name required for business accounts';
      }
      return '';
    }
  }
);

// Revalidate companyName when accountType changes
accountTypeSelect.addEventListener('change', (e) => {
  form.setValue('accountType', e.target.value);
  form.validateField('companyName'); // Revalidate dependent field
});
```

 

## Advanced Patterns

### Pattern 1: Smart Validation Timing

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : ''
  }
);

let hasBeenValidated = false;

emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);

  // Only validate on change after first blur
  if (hasBeenValidated) {
    form.validateField('email');
  }
});

emailInput.addEventListener('blur', () => {
  hasBeenValidated = true;
  form.validateField('email');
});
```

 

### Pattern 2: Validation with Loading State

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid format' : ''
  }
);

async function validateEmailWithServer(email) {
  // Show loading
  const loadingEl = document.getElementById('email-loading');
  loadingEl.style.display = 'block';

  try {
    // Run local validation first
    form.validateField('email');

    if (form.hasError('email')) {
      return; // Don't check server if local validation fails
    }

    // Check server
    const response = await fetch(`/api/check-email?email=${email}`);
    const { available } = await response.json();

    if (!available) {
      form.setError('email', 'Email already registered');
    }
  } finally {
    loadingEl.style.display = 'none';
  }
}
```

 

### Pattern 3: Field Dependency Chain

```javascript
const form = Forms.create(
  {
    country: '',
    state: '',
    city: ''
  },
  {
    country: (value) => !value ? 'Required' : '',
    state: (value, allValues) =>
      allValues.country && !value ? 'Required' : '',
    city: (value, allValues) =>
      allValues.state && !value ? 'Required' : ''
  }
);

function validateLocationChain() {
  // Validate in order, stop at first error
  form.validateField('country');

  if (!form.hasError('country')) {
    form.validateField('state');

    if (!form.hasError('state')) {
      form.validateField('city');
    }
  }
}

// Revalidate chain when any location field changes
[countrySelect, stateSelect, citySelect].forEach(el => {
  el.addEventListener('change', validateLocationChain);
});
```

 

### Pattern 4: Validation with Debouncing

```javascript
const form = Forms.create(
  { searchQuery: '' },
  {
    searchQuery: (value) => value.length < 3 ? 'Too short' : ''
  }
);

let validateTimeout;

searchInput.addEventListener('input', (e) => {
  form.setValue('searchQuery', e.target.value);

  // Debounce validation
  clearTimeout(validateTimeout);
  validateTimeout = setTimeout(() => {
    form.validateField('searchQuery');
  }, 300);
});
```

 

### Pattern 5: Conditional Revalidation

```javascript
const form = Forms.create(
  {
    shippingSameAsBilling: true,
    shippingAddress: '',
    billingAddress: ''
  },
  {
    shippingAddress: (value, allValues) => {
      if (!allValues.shippingSameAsBilling && !value) {
        return 'Shipping address required';
      }
      return '';
    }
  }
);

sameAsBillingCheckbox.addEventListener('change', (e) => {
  form.setValue('shippingSameAsBilling', e.target.checked);

  // Revalidate shipping address
  form.validateField('shippingAddress');
});
```

 

### Pattern 6: Multi-Field Cross Validation

```javascript
const form = Forms.create(
  {
    startDate: '',
    endDate: ''
  },
  {
    startDate: (value) => !value ? 'Required' : '',
    endDate: (value, allValues) => {
      if (!value) return 'Required';

      const start = new Date(allValues.startDate);
      const end = new Date(value);

      if (end < start) {
        return 'End date must be after start date';
      }

      return '';
    }
  }
);

startDateInput.addEventListener('change', () => {
  form.validateField('startDate');

  // Revalidate end date if it's been filled
  if (form.getValue('endDate')) {
    form.validateField('endDate');
  }
});

endDateInput.addEventListener('change', () => {
  form.validateField('endDate');
});
```

 

### Pattern 7: Validation History Tracking

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : ''
  }
);

const validationHistory = {};

// Wrap validateField to track history
const originalValidateField = form.validateField.bind(form);
form.validateField = function(field) {
  if (!validationHistory[field]) {
    validationHistory[field] = [];
  }

  const before = form.getError(field);

  originalValidateField(field);

  const after = form.getError(field);

  validationHistory[field].push({
    timestamp: Date.now(),
    value: form.getValue(field),
    before,
    after,
    becameValid: before && !after,
    becameInvalid: !before && after
  });

  return this;
};

function getValidationStats(field) {
  const history = validationHistory[field] || [];

  return {
    totalValidations: history.length,
    becameValid: history.filter(h => h.becameValid).length,
    becameInvalid: history.filter(h => h.becameInvalid).length
  };
}
```

 

### Pattern 8: Throttled Validation

```javascript
const form = Forms.create(
  { field: '' },
  {
    field: (value) => !value ? 'Required' : ''
  }
);

let lastValidationTime = 0;
const THROTTLE_MS = 1000;

function throttledValidateField(field) {
  const now = Date.now();

  if (now - lastValidationTime >= THROTTLE_MS) {
    form.validateField(field);
    lastValidationTime = now;
  }
}

// Usage
input.addEventListener('input', () => {
  throttledValidateField('field');
});
```

 

### Pattern 9: Validation with Analytics

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : ''
  }
);

function validateFieldWithAnalytics(field) {
  const startTime = Date.now();
  const valueBefore = form.getValue(field);
  const errorBefore = form.getError(field);

  form.validateField(field);

  const errorAfter = form.getError(field);
  const duration = Date.now() - startTime;

  analytics.track('field_validated', {
    field,
    value: valueBefore,
    hadError: !!errorBefore,
    hasError: !!errorAfter,
    duration,
    validationChanged: errorBefore !== errorAfter
  });
}
```

 

### Pattern 10: Priority Validation Queue

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

const validationQueue = [];
let isValidating = false;

async function queueValidation(field, priority = 0) {
  validationQueue.push({ field, priority });
  validationQueue.sort((a, b) => b.priority - a.priority);

  if (!isValidating) {
    processValidationQueue();
  }
}

async function processValidationQueue() {
  if (validationQueue.length === 0) {
    isValidating = false;
    return;
  }

  isValidating = true;
  const { field } = validationQueue.shift();

  // Simulate async validation
  await new Promise(resolve => setTimeout(resolve, 100));

  form.validateField(field);

  processValidationQueue();
}

// Usage:
queueValidation('field1', 10); // High priority
queueValidation('field2', 5);
queueValidation('field3', 1);
```

 

## Common Pitfalls

### Pitfall 1: Forgetting setValue() Auto-Validates

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

// ❌ Redundant - setValue already validates
form.setValue('email', 'user@example.com');
form.validateField('email'); // Unnecessary!

// ✅ setValue() already validated
form.setValue('email', 'user@example.com'); // Done ✓

// ✅ Only use validateField() when needed
// e.g., after external data changes
someExternalData.onChange(() => {
  form.validateField('email'); // Now it makes sense
});
```

 

### Pitfall 2: Validating Non-Existent Field

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

// ❌ Field doesn't exist
form.validateField('username'); // No error, but does nothing

// ✅ Check if field exists first
if ('username' in form.values && validators.username) {
  form.validateField('username');
}
```

 

### Pitfall 3: Validating Field Without Validator

```javascript
const form = Forms.create(
  { email: '', name: '' },
  {
    email: (value) => !value ? 'Required' : ''
    // No validator for 'name'
  }
);

// ❌ No validator defined for 'name'
form.validateField('name'); // Does nothing

// ✅ Only validate fields with validators
if (validators.name) {
  form.validateField('name');
}
```

 

### Pitfall 4: Not Chaining Properly

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

// ❌ Missing return value awareness
form.validateField('field1');
form.validateField('field2');

// ✅ Can chain if desired
form
  .validateField('field1')
  .validateField('field2');

// Both work, but chaining is more concise
```

 

### Pitfall 5: Over-Validating

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : ''
  }
);

// ❌ Validating on every keystroke (expensive)
emailInput.addEventListener('input', () => {
  form.validateField('email');
  form.validateField('email');
  form.validateField('email'); // Why so many times?
});

// ✅ Validate once per change, or debounce
emailInput.addEventListener('input', debounce(() => {
  form.validateField('email');
}, 300));
```

 

## Summary

### Key Takeaways

1. **`validateField()` manually validates a single field** - runs its validator function.

2. **Updates error state** - sets `form.errors[field]` based on validator result.

3. **Triggers reactive updates** - `hasErrors`, `isValid`, `errorFields` recalculate.

4. **Returns form instance** - enables method chaining.

5. **Use for manual validation timing** - blur events, dependent fields, custom triggers.

6. **Complements automatic validation** - setValue() validates automatically, this gives you control.

### When to Use validateField()

✅ **Use validateField() for:**
- Blur validation (validate when user leaves field)
- Dependent field revalidation (when related field changes)
- Manual validation triggers (buttons, checkboxes)
- Async validation follow-up (after server checks)
- Custom validation timing control

❌ **Don't use validateField() when:**
- setValue() already handles it (automatic validation)
- Field has no validator defined
- Field doesn't exist in form
- You need to validate all fields (use `validate()`)

### Comparison Table

| Method | Scope | Trigger | Use Case |
|  --|  -|   |   -|
| `setValue()` | One field | Automatic | Normal input ✅ |
| `validateField('email')` | One field | Manual | Blur, dependencies ✅ |
| `validate()` | All fields | Manual | Submit validation ✅ |

### One-Line Rule

> **`form.validateField(field)` manually runs validation for a specific field - use it when you need control over validation timing beyond automatic setValue() validation.**

 

**What's Next?**

- Learn about `form.validate()` for validating all fields at once
- Explore async validation patterns
- Master validation timing strategies
