# form.setErrors()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

// Set multiple errors at once
form.setErrors({
  username: 'Username already taken',
  email: 'Email already registered',
  password: 'Password too weak'
});

console.log(form.errors);
// {
//   username: 'Username already taken',
//   email: 'Email already registered',
//   password: 'Password too weak'
// }

console.log(form.hasErrors); // true
console.log(form.errorFields); // ['username', 'email', 'password']

// Clear all errors
form.setErrors({});

console.log(form.hasErrors); // false
```

**What just happened?** `setErrors()` updates multiple error messages in one efficient batch operation!

 

## What is form.setErrors()?

`form.setErrors()` is the **batch error assignment method** for setting multiple custom validation errors at once.

Simply put, it's like calling `setError()` multiple times, but more efficient and cleaner.

**Key characteristics:**
- ✅ Sets multiple errors in one operation
- ✅ More performant than multiple setError() calls
- ✅ Perfect for server-side validation responses
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Set multiple errors
form.setErrors(errorsObject)

// Set specific errors
form.setErrors({
  field1: 'Error message 1',
  field2: 'Error message 2'
})

// Clear all errors
form.setErrors({})

// With chaining
form
  .setErrors({ field1: 'Error 1' })
  .setErrors({ field2: 'Error 2' });
```

**Parameters:**
- `errorsObject` (object) - An object containing field-error message pairs

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Multiple Server Errors

When the server returns validation errors for multiple fields, setting them one-by-one is inefficient.

```javascript
// ❌ Inefficient - triggers reactive updates multiple times
form.setError('username', 'Username taken');
form.setError('email', 'Email exists');
form.setError('password', 'Too weak');
// UI updates 3 times! ⚡⚡⚡

// ✅ Efficient - single reactive update cycle
form.setErrors({
  username: 'Username taken',
  email: 'Email exists',
  password: 'Too weak'
});
// UI updates once! ⚡
```

**Benefits of setErrors():**
✅ **Performance** - Single reactive update instead of multiple
✅ **Cleaner code** - One call instead of many
✅ **Atomic updates** - All errors update together
✅ **Better UX** - UI updates once instead of flickering
✅ **Server-friendly** - Matches API error response format

 

## Mental Model

Think of `setErrors()` as **batch error processing** - just like `setValues()` but for errors.

### Individual Error Setting
```
setError('field1', 'Error 1') → Update UI
setError('field2', 'Error 2') → Update UI
setError('field3', 'Error 3') → Update UI

Total: 3 UI updates
```

### Batch Error Setting
```
setErrors({ field1: 'Error 1', field2: 'Error 2', field3: 'Error 3' })
              ↓
    Update all errors at once
              ↓
       Update UI once

Total: 1 UI update
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.setErrors({
  email: 'Email exists',
  password: 'Too weak'
});

// Here's what happens internally:
1️⃣ Loop through provided errors
   for (const [field, error] of Object.entries(errors)) {
     form.errors[field] = error
   }

2️⃣ Reactive properties update (once)
   - form.hasErrors recalculates
   - form.isValid recalculates
   - form.errorFields updates

3️⃣ All reactive effects fire (once)
   - Error message UI updates
   - Submit button state changes
   - Field styling updates

4️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
setErrors({ email: '...', password: '...' })
         ↓
    [Batch Update]
         ↓
    Update all error values
         ↓
    Computed properties update (once):
    - hasErrors
    - isValid
    - errorFields
         ↓
    Fire all reactive effects (once)
         ↓
    UI updates in one batch
```

 

## Basic Usage

### Example 1: Server Validation Response

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

async function handleSubmit() {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    // Server responds: { errors: { username: '...', email: '...' } }

    // Set all errors at once
    form.setErrors(errors);

    return;
  }

  console.log('Registration successful!');
}

// Server response example:
// {
//   errors: {
//     username: 'Username already taken',
//     email: 'Email already registered'
//   }
// }
```

 

### Example 2: Clear All Errors

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Set some errors
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2',
  field3: 'Error 3'
});

console.log(form.hasErrors); // true

// Clear all errors
form.setErrors({});

console.log(form.hasErrors); // false
console.log(form.errorFields); // []
```

 

### Example 3: Partial Error Updates

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

// Set initial errors
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2'
});

// Later: update only specific errors
form.setErrors({
  field3: 'Error 3',
  field4: 'Error 4'
});

console.log(form.errors);
// {
//   field1: 'Error 1',  // Still there
//   field2: 'Error 2',  // Still there
//   field3: 'Error 3',  // New
//   field4: 'Error 4'   // New
// }
```

 

### Example 4: Replace All Errors

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Set initial errors
form.setErrors({
  field1: 'Old error 1',
  field2: 'Old error 2'
});

// Replace with new errors
form.setErrors({
  field2: 'New error 2',
  field3: 'New error 3'
});

console.log(form.errors);
// {
//   field1: 'Old error 1',  // Not replaced (not in new object)
//   field2: 'New error 2',  // Replaced
//   field3: 'New error 3'   // Added
// }
```

 

### Example 5: Form Revalidation

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    confirmPassword: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : '',
    confirmPassword: (value, allValues) =>
      value !== allValues.password ? 'Passwords must match' : ''
  }
);

// Manually trigger revalidation and set errors
function revalidateAll() {
  const errors = {};

  Object.keys(form.values).forEach(field => {
    const validator = form.validators?.[field];
    if (validator) {
      const error = validator(form.values[field], form.values);
      if (error) {
        errors[field] = error;
      }
    }
  });

  form.setErrors(errors);
}
```

 

## Advanced Patterns

### Pattern 1: API Error Translation

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

const errorTranslations = {
  'FIELD_REQUIRED': 'This field is required',
  'FIELD_TOO_SHORT': 'Value is too short',
  'FIELD_TOO_LONG': 'Value is too long',
  'USERNAME_TAKEN': 'Username is not available',
  'EMAIL_EXISTS': 'Email is already registered',
  'WEAK_PASSWORD': 'Password is too weak'
};

async function handleSubmit() {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    // errors: { username: 'USERNAME_TAKEN', email: 'EMAIL_EXISTS' }

    // Translate error codes to messages
    const translatedErrors = {};
    Object.entries(errors).forEach(([field, errorCode]) => {
      translatedErrors[field] = errorTranslations[errorCode] || 'Invalid value';
    });

    form.setErrors(translatedErrors);
  }
}
```

 

### Pattern 2: Merge Server and Client Errors

```javascript
const form = Forms.create(
  {
    username: '',
    email: '',
    password: ''
  },
  {
    password: (value) => value.length < 8 ? 'Too short (client)' : ''
  }
);

async function handleSubmit() {
  // Get client-side validation errors
  const clientErrors = { ...form.errors };

  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (!response.ok) {
    const { errors: serverErrors } = await response.json();

    // Merge client and server errors
    const allErrors = {
      ...clientErrors,
      ...serverErrors // Server errors take precedence
    };

    form.setErrors(allErrors);
  }
}
```

 

### Pattern 3: Conditional Error Clearing

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
    // Clear business-related errors
    form.setErrors({
      ...form.errors,
      companyName: '',
      taxId: ''
    });
  } else if (accountType === 'business') {
    // Clear personal-related errors
    form.setErrors({
      ...form.errors,
      personalId: ''
    });
  }
});
```

 

### Pattern 4: Multi-Step Form Validation

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

const stepFields = {
  1: ['firstName', 'lastName'],
  2: ['email', 'phone'],
  3: ['address', 'city']
};

function validateStep(stepNumber) {
  const fields = stepFields[stepNumber];
  const errors = {};

  fields.forEach(field => {
    const value = form.getValue(field);
    if (!value || value.trim() === '') {
      errors[field] = 'This field is required';
    }
  });

  form.setErrors(errors);

  return Object.keys(errors).length === 0;
}

nextButton.addEventListener('click', () => {
  if (validateStep(currentStep)) {
    goToNextStep();
  }
});
```

 

### Pattern 5: Async Batch Validation

```javascript
const form = Forms.create({
  username: '',
  email: '',
  domain: ''
});

async function validateAllAsync() {
  const [usernameResult, emailResult, domainResult] = await Promise.all([
    fetch(`/api/check-username?username=${form.getValue('username')}`).then(r => r.json()),
    fetch(`/api/check-email?email=${form.getValue('email')}`).then(r => r.json()),
    fetch(`/api/check-domain?domain=${form.getValue('domain')}`).then(r => r.json())
  ]);

  const errors = {};

  if (!usernameResult.available) {
    errors.username = 'Username already taken';
  }

  if (!emailResult.valid) {
    errors.email = emailResult.message || 'Email is invalid';
  }

  if (!domainResult.allowed) {
    errors.domain = 'Domain not allowed';
  }

  form.setErrors(errors);

  return Object.keys(errors).length === 0;
}

submitButton.addEventListener('click', async () => {
  const valid = await validateAllAsync();
  if (valid) {
    handleSubmit();
  }
});
```

 

### Pattern 6: Error Priority/Severity Levels

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const errorSeverity = {
  field1: 'error',
  field2: 'warning',
  field3: 'info'
};

function setErrorsWithSeverity(errors) {
  // Store severity separately if needed
  form.errorSeverity = {};

  const formErrors = {};

  Object.entries(errors).forEach(([field, message]) => {
    const severity = errorSeverity[field] || 'error';
    form.errorSeverity[field] = severity;

    // Prefix message with severity icon
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    formErrors[field] = `${icons[severity]} ${message}`;
  });

  form.setErrors(formErrors);
}

setErrorsWithSeverity({
  field1: 'Critical error',
  field2: 'Please review',
  field3: 'Helpful tip'
});

// Displays:
// field1: ❌ Critical error
// field2: ⚠️ Please review
// field3: ℹ️ Helpful tip
```

 

### Pattern 7: Error Aggregation from Multiple Sources

```javascript
const form = Forms.create({
  email: '',
  password: '',
  terms: false
});

async function validateFromMultipleSources() {
  const errors = {};

  // Source 1: Client-side validation
  if (!form.getValue('email').includes('@')) {
    errors.email = 'Invalid email format';
  }

  if (form.getValue('password').length < 8) {
    errors.password = 'Password too short';
  }

  if (!form.getValue('terms')) {
    errors.terms = 'You must accept terms';
  }

  // Source 2: Server validation
  const serverResponse = await fetch('/api/validate', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (!serverResponse.ok) {
    const { errors: serverErrors } = await serverResponse.json();
    Object.assign(errors, serverErrors);
  }

  // Source 3: External service (e.g., spam check)
  const spamCheck = await fetch(`/api/spam-check?email=${form.getValue('email')}`);
  const { isSpam } = await spamCheck.json();

  if (isSpam) {
    errors.email = 'Email appears to be spam';
  }

  // Set all errors from all sources
  form.setErrors(errors);

  return Object.keys(errors).length === 0;
}
```

 

### Pattern 8: Localized Error Messages

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

const translations = {
  en: {
    'USERNAME_REQUIRED': 'Username is required',
    'EMAIL_INVALID': 'Email is invalid',
    'PASSWORD_WEAK': 'Password is too weak'
  },
  es: {
    'USERNAME_REQUIRED': 'El nombre de usuario es obligatorio',
    'EMAIL_INVALID': 'El correo electrónico no es válido',
    'PASSWORD_WEAK': 'La contraseña es demasiado débil'
  },
  fr: {
    'USERNAME_REQUIRED': 'Le nom d\'utilisateur est requis',
    'EMAIL_INVALID': 'L\'e-mail est invalide',
    'PASSWORD_WEAK': 'Le mot de passe est trop faible'
  }
};

let currentLocale = 'en';

function setLocalizedErrors(errorCodes) {
  const localizedErrors = {};

  Object.entries(errorCodes).forEach(([field, code]) => {
    localizedErrors[field] = translations[currentLocale][code] || code;
  });

  form.setErrors(localizedErrors);
}

// Server returns error codes
const serverErrors = {
  username: 'USERNAME_REQUIRED',
  email: 'EMAIL_INVALID'
};

setLocalizedErrors(serverErrors);
// Shows English messages by default

currentLocale = 'es';
setLocalizedErrors(serverErrors);
// Shows Spanish messages
```

 

### Pattern 9: Error History Tracking

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const errorHistory = [];

// Wrap setErrors to track history
const originalSetErrors = form.setErrors.bind(form);
form.setErrors = function(errors) {
  errorHistory.push({
    timestamp: new Date().toISOString(),
    errors: { ...errors }
  });

  // Limit history size
  if (errorHistory.length > 20) {
    errorHistory.shift();
  }

  return originalSetErrors(errors);
};

function getErrorReport() {
  const frequentErrors = {};

  errorHistory.forEach(entry => {
    Object.keys(entry.errors).forEach(field => {
      frequentErrors[field] = (frequentErrors[field] || 0) + 1;
    });
  });

  return {
    totalErrorSets: errorHistory.length,
    frequentErrors,
    recentErrors: errorHistory.slice(-5)
  };
}
```

 

### Pattern 10: Smart Error Reset

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

let serverErrors = {};
let clientErrors = {};

function setClientErrors(errors) {
  clientErrors = errors;
  mergeErrors();
}

function setServerErrors(errors) {
  serverErrors = errors;
  mergeErrors();
}

function mergeErrors() {
  // Server errors take precedence
  const merged = {
    ...clientErrors,
    ...serverErrors
  };

  form.setErrors(merged);
}

function clearServerErrors() {
  serverErrors = {};
  mergeErrors();
}

// Usage:
setClientErrors({ field1: 'Client error 1' });
setServerErrors({ field1: 'Server error 1', field2: 'Server error 2' });

// Shows:
// field1: 'Server error 1' (server takes precedence)
// field2: 'Server error 2'

// User modifies field1
clearServerErrors();

// Now shows:
// field1: 'Client error 1'
```

 

## Common Pitfalls

### Pitfall 1: Not Understanding Merge Behavior

```javascript
const form = Forms.create({
  field1: '', field2: '', field3: ''
});

// Set initial errors
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2'
});

// ❌ This doesn't clear field1 and field2
form.setErrors({
  field3: 'Error 3'
});

console.log(form.errors);
// {
//   field1: 'Error 1',  // Still there!
//   field2: 'Error 2',  // Still there!
//   field3: 'Error 3'
// }

// ✅ To replace all errors, explicitly clear old ones
form.setErrors({
  field1: '',
  field2: '',
  field3: 'Error 3'
});

// OR use clearErrors() first
form.clearErrors();
form.setErrors({ field3: 'Error 3' });
```

 

### Pitfall 2: Forgetting Empty Object Clears Nothing

```javascript
const form = Forms.create({
  field1: '', field2: ''
});

form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2'
});

// ❌ This looks like it clears, but doesn't
form.setErrors({});
// Errors still exist!

// ✅ Explicitly clear each field
form.setErrors({
  field1: '',
  field2: ''
});

// ✅ Or use clearErrors()
form.clearErrors();
```

 

### Pitfall 3: Mutating Error Object

```javascript
const form = Forms.create({
  field1: '', field2: ''
});

const errors = { field1: 'Error 1' };

// ❌ Don't mutate then setErrors
errors.field2 = 'Error 2';
form.setErrors(errors);

// ✅ Create new object
form.setErrors({
  ...errors,
  field2: 'Error 2'
});
```

 

### Pitfall 4: Setting Errors on Non-Existent Fields

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ These fields don't exist
form.setErrors({
  username: 'Error',
  phone: 'Error'
});

// Errors are set but fields don't exist in form

// ✅ Validate fields exist first
const errors = {
  username: 'Error',
  email: 'Email error'
};

const validErrors = {};
Object.entries(errors).forEach(([field, error]) => {
  if (field in form.values) {
    validErrors[field] = error;
  }
});

form.setErrors(validErrors);
```

 

### Pitfall 5: Overusing setErrors for Single Field

```javascript
const form = Forms.create({
  field1: '', field2: ''
});

// ❌ Inefficient for single field
form.setErrors({ field1: 'Error 1' });

// ✅ Use setError for single field
form.setError('field1', 'Error 1');

// ✅ Use setErrors for multiple fields
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2'
});
```

 

## Summary

### Key Takeaways

1. **`setErrors()` sets multiple errors** in a single efficient operation.

2. **More performant than multiple setError() calls** - UI updates once.

3. **Perfect for server responses** - directly map API error objects.

4. **Merges with existing errors** - doesn't replace unless explicitly cleared.

5. **Returns form instance** - enables method chaining.

6. **Use empty strings to clear** - `{ field: '' }` removes that error.

### When to Use setErrors()

✅ **Use setErrors() for:**
- Server-side validation responses
- Multiple related errors at once
- Batch error clearing
- Multi-step form validation
- Error state initialization

❌ **Don't use setErrors() for:**
- Single field errors (use `setError()`)
- Adding one error to existing errors (use `setError()`)
- Complete error clearing (use `clearErrors()`)

### Comparison with setError()

| Scenario | setError() | setErrors() |
|   -|   --|    -|
| Single field | ✅ Preferred | Works but overkill |
| Multiple fields | Verbose | ✅ Preferred |
| Server response | Manual loop | ✅ Direct mapping |
| Performance | Multiple updates | ✅ Single update |

### One-Line Rule

> **`form.setErrors(object)` is the batch error method - use it when you need to set multiple error messages efficiently, especially when handling server validation responses.**

 

**What's Next?**

- Learn about `form.clearErrors()` for removing all errors
- Explore `form.hasError()` for checking specific field errors
- Master `form.getError()` for retrieving error messages
