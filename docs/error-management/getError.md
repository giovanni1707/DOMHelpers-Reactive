# form.getError()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Get error messages
console.log(form.getError('email')); // '' (no error)

form.setError('email', 'Email already exists');
form.setError('password', 'Too weak');

console.log(form.getError('email')); // 'Email already exists'
console.log(form.getError('password')); // 'Too weak'
console.log(form.getError('username')); // '' (no error)

// Use in display logic
const emailError = form.getError('email');
if (emailError) {
  errorEl.textContent = emailError;
}
```

**What just happened?** `getError()` retrieves a field's error message - perfect for displaying errors in your UI!

 

## What is form.getError()?

`form.getError()` is a **error message retrieval method** that returns the error message for a specific field.

Simply put, it's a clean way to ask "what's the error message for this field?"

**Key characteristics:**
- ✅ Returns error message string
- ✅ Returns empty string if no error
- ✅ Cleaner than accessing `form.errors[field]` directly
- ✅ Perfect for displaying error messages
- ✅ Works great in reactive effects

 

## Syntax

```javascript
// Get error message
const errorMessage = form.getError(fieldName)

// Use in display logic
const error = form.getError('email');
if (error) {
  showError(error);
}

// Use in reactive effects
effect(() => {
  const error = form.getError('password');
  errorEl.textContent = error;
});
```

**Parameters:**
- `fieldName` (string) - The name of the field

**Returns:** `string` - The error message (empty string if no error)

 

## Why Does This Exist?

### Providing Clean API Symmetry

Just like `getValue()` pairs with `setValue()`, `getError()` pairs with `setError()` for a consistent API.

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid email');

// Both work, but getError() is more explicit:
console.log(form.errors.email);      // 'Invalid email'
console.log(form.getError('email')); // 'Invalid email' ✅ Symmetric API

// Also useful with dynamic field names:
const fieldName = 'email';
console.log(form.getError(fieldName)); // Clean
console.log(form.errors[fieldName]);   // Also works
```

**When to use getError():**
✅ **Consistent API** - Pairs with setError/hasError/clearError
✅ **Dynamic field names** - When field is in a variable
✅ **Programmatic access** - Building utilities and helpers
✅ **Code clarity** - Makes intent explicit
✅ **Safe access** - Returns empty string for missing fields

 

## Mental Model

Think of `getError()` as a **message getter** - it retrieves what went wrong with a field.

### Visual Representation

```
Form Errors:
┌────────────────────────────────┐
│ email: "Invalid format"        │ → getError('email') → "Invalid format"
│ password: "Too short"          │ → getError('password') → "Too short"
│ username: ""                   │ → getError('username') → ""
└────────────────────────────────┘

Returns the error message string!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.getError('email');

// Here's what happens internally:
1️⃣ Access the error value
   const error = form.errors[field]

2️⃣ Return the error string
   return error || ''

// It's essentially syntactic sugar for:
form.errors[field] || ''
```

### Equivalent Access

```javascript
// These are functionally equivalent:
form.getError('email')
form.errors.email
form.errors['email']

// But getError() is more explicit for dynamic access
const field = 'email';
form.getError(field)    // ✅ Clear
form.errors[field]      // Also works
```

 

## Basic Usage

### Example 1: Display Error Message

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

effect(() => {
  const emailError = form.getError('email');
  const errorEl = document.getElementById('email-error');

  if (emailError) {
    errorEl.textContent = emailError;
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});

// Set error
form.setError('email', 'Email is required');
// Error displays automatically
```

 

### Example 2: Dynamic Field Error Display

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const fields = ['field1', 'field2', 'field3'];

fields.forEach(fieldName => {
  const inputEl = document.querySelector(`[name="${fieldName}"]`);
  const errorEl = document.getElementById(`${fieldName}-error`);

  inputEl.addEventListener('blur', () => {
    const error = form.getError(fieldName);

    if (error) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  });
});
```

 

### Example 3: Error Message Formatting

```javascript
const form = Forms.create({
  email: ''
});

function getFormattedError(field) {
  const error = form.getError(field);

  if (!error) {
    return '';
  }

  // Format error with icon and styling
  return `❌ ${error}`;
}

effect(() => {
  const errorEl = document.getElementById('email-error');
  errorEl.textContent = getFormattedError('email');
});
```

 

### Example 4: Conditional Error Display

```javascript
const form = Forms.create({
  email: ''
});

effect(() => {
  const errorEl = document.getElementById('email-error');
  const error = form.getError('email');

  // Only show if field is touched and has error
  if (form.touched.email && error) {
    errorEl.textContent = error;
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});
```

 

### Example 5: Error List Generation

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function generateErrorList() {
  const errors = [];

  ['field1', 'field2', 'field3'].forEach(field => {
    const error = form.getError(field);
    if (error) {
      errors.push({ field, message: error });
    }
  });

  return errors;
}

effect(() => {
  const errorList = generateErrorList();
  const listEl = document.getElementById('error-list');

  if (errorList.length > 0) {
    const html = errorList.map(({ field, message }) =>
      `<li><strong>${field}:</strong> ${message}</li>`
    ).join('');

    listEl.innerHTML = `<ul>${html}</ul>`;
  } else {
    listEl.innerHTML = '';
  }
});
```

 

## Advanced Patterns

### Pattern 1: Error Message Translation

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

const errorTranslations = {
  en: {
    'REQUIRED': 'This field is required',
    'INVALID_EMAIL': 'Please enter a valid email',
    'TOO_SHORT': 'Value is too short'
  },
  es: {
    'REQUIRED': 'Este campo es obligatorio',
    'INVALID_EMAIL': 'Por favor ingrese un correo válido',
    'TOO_SHORT': 'El valor es demasiado corto'
  }
};

let currentLanguage = 'en';

function getTranslatedError(field) {
  const errorCode = form.getError(field);

  if (!errorCode) {
    return '';
  }

  return errorTranslations[currentLanguage][errorCode] || errorCode;
}

// Usage:
form.setError('email', 'INVALID_EMAIL');
console.log(getTranslatedError('email')); // 'Please enter a valid email'

currentLanguage = 'es';
console.log(getTranslatedError('email')); // 'Por favor ingrese un correo válido'
```

 

### Pattern 2: Error Message with Field Labels

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  emailAddress: ''
});

const fieldLabels = {
  firstName: 'First Name',
  lastName: 'Last Name',
  emailAddress: 'Email Address'
};

function getErrorWithLabel(field) {
  const error = form.getError(field);

  if (!error) {
    return '';
  }

  const label = fieldLabels[field] || field;
  return `${label}: ${error}`;
}

// Usage:
form.setError('firstName', 'Required');
console.log(getErrorWithLabel('firstName')); // 'First Name: Required'
```

 

### Pattern 3: Error Severity Indicator

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

function getErrorWithSeverity(field) {
  const error = form.getError(field);

  if (!error) {
    return null;
  }

  const severity = errorSeverity[field] || 'error';
  const icons = {
    critical: '🔴',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return {
    message: error,
    severity,
    icon: icons[severity],
    formatted: `${icons[severity]} ${error}`
  };
}

// Usage:
form.setError('field1', 'Database connection failed');
const error = getErrorWithSeverity('field1');
console.log(error.formatted); // '🔴 Database connection failed'
```

 

### Pattern 4: Error Message Truncation

```javascript
const form = Forms.create({
  description: ''
});

function getTruncatedError(field, maxLength = 50) {
  const error = form.getError(field);

  if (!error) {
    return '';
  }

  if (error.length <= maxLength) {
    return error;
  }

  return error.substring(0, maxLength - 3) + '...';
}

// Usage:
form.setError('description', 'This is a very long error message that needs to be truncated for display purposes');

console.log(getTruncatedError('description', 30));
// 'This is a very long error...'
```

 

### Pattern 5: Error History Tracking

```javascript
const form = Forms.create({
  email: ''
});

const errorHistory = {};

// Track error changes
effect(() => {
  const fields = Object.keys(form.values);

  fields.forEach(field => {
    const currentError = form.getError(field);
    const history = errorHistory[field] || [];

    // Only add if error changed
    const lastError = history[history.length - 1];
    if (currentError !== lastError) {
      history.push(currentError);
      errorHistory[field] = history.slice(-10); // Keep last 10
    }
  });
});

function getErrorHistory(field) {
  return errorHistory[field] || [];
}

// Usage:
form.setError('email', 'Required');
form.setError('email', 'Invalid format');
form.setError('email', 'Already exists');

console.log(getErrorHistory('email'));
// ['', 'Required', 'Invalid format', 'Already exists']
```

 

### Pattern 6: Contextual Error Messages

```javascript
const form = Forms.create({
  age: 0,
  country: ''
});

function getContextualError(field) {
  const error = form.getError(field);

  if (!error) {
    return '';
  }

  const country = form.getValue('country');

  // Customize error based on context
  if (field === 'age') {
    if (country === 'US') {
      return `${error} (Must be 21+ for US residents)`;
    } else {
      return `${error} (Must be 18+ for international residents)`;
    }
  }

  return error;
}

// Usage:
form.setValue('country', 'US');
form.setError('age', 'Age requirement not met');
console.log(getContextualError('age'));
// 'Age requirement not met (Must be 21+ for US residents)'
```

 

### Pattern 7: Error Message Templating

```javascript
const form = Forms.create({
  username: '',
  password: ''
});

const errorTemplates = {
  REQUIRED: 'The {{field}} field is required',
  TOO_SHORT: 'The {{field}} must be at least {{min}} characters',
  TOO_LONG: 'The {{field}} must not exceed {{max}} characters'
};

function setTemplatedError(field, template, params = {}) {
  let message = errorTemplates[template] || template;

  // Replace placeholders
  message = message.replace('{{field}}', field);
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{{${key}}}`, value);
  });

  form.setError(field, message);
}

// Usage:
setTemplatedError('username', 'TOO_SHORT', { min: 3 });
console.log(form.getError('username'));
// 'The username must be at least 3 characters'
```

 

### Pattern 8: Error Aggregation Report

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function getErrorReport() {
  const fields = Object.keys(form.values);
  const errors = [];

  fields.forEach(field => {
    const error = form.getError(field);
    if (error) {
      errors.push({
        field,
        message: error,
        touched: form.touched[field] || false
      });
    }
  });

  return {
    totalFields: fields.length,
    errorCount: errors.length,
    errors,
    hasErrors: errors.length > 0,
    summary: errors.length > 0
      ? `${errors.length} field(s) have errors`
      : 'All fields valid'
  };
}

// Usage:
form.setError('field1', 'Error 1');
form.setError('field2', 'Error 2');

console.log(getErrorReport());
// {
//   totalFields: 3,
//   errorCount: 2,
//   errors: [
//     { field: 'field1', message: 'Error 1', touched: false },
//     { field: 'field2', message: 'Error 2', touched: false }
//   ],
//   hasErrors: true,
//   summary: '2 field(s) have errors'
// }
```

 

### Pattern 9: Smart Error Display Priority

```javascript
const form = Forms.create({
  email: ''
});

const errorPriority = {
  client: 1,
  server: 2,
  network: 3
};

const errorMetadata = {};

function setErrorWithPriority(field, message, source = 'client') {
  errorMetadata[field] = {
    message,
    source,
    priority: errorPriority[source] || 1,
    timestamp: Date.now()
  };

  // Only set if higher priority than existing
  const existing = errorMetadata[field];
  const current = form.getError(field);

  if (!current || errorPriority[source] >= existing.priority) {
    form.setError(field, message);
  }
}

function getErrorWithMetadata(field) {
  const message = form.getError(field);
  const metadata = errorMetadata[field];

  if (!message || !metadata) {
    return null;
  }

  return {
    message,
    source: metadata.source,
    priority: metadata.priority,
    timestamp: metadata.timestamp
  };
}

// Usage:
setErrorWithPriority('email', 'Invalid format', 'client');
setErrorWithPriority('email', 'Already exists', 'server'); // Overrides client

const errorInfo = getErrorWithMetadata('email');
console.log(errorInfo);
// { message: 'Already exists', source: 'server', priority: 2, ... }
```

 

### Pattern 10: Error Message Markdown Support

```javascript
const form = Forms.create({
  password: ''
});

function getErrorAsHTML(field) {
  const error = form.getError(field);

  if (!error) {
    return '';
  }

  // Simple markdown-to-HTML conversion
  return error
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}

// Usage:
form.setError('password', 'Password must contain **at least 8 characters** and *one special character*');

console.log(getErrorAsHTML('password'));
// 'Password must contain <strong>at least 8 characters</strong> and <em>one special character</em>'
```

 

## Common Pitfalls

### Pitfall 1: Not Checking for Empty String

```javascript
const form = Forms.create({
  email: ''
});

const error = form.getError('email');

// ❌ This will run even if no error
if (error) {
  // But error is '' (empty string)
  showError(error); // Shows empty error!
}

// ✅ Empty string is falsy, so this works
if (error) { // Only runs if error has content
  showError(error);
}

// ✅ Explicit check
if (error !== '') {
  showError(error);
}
```

 

### Pitfall 2: Assuming getError() Returns null

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Returns empty string, not null
console.log(form.getError('email') === null); // false

// ✅ Check for empty string
console.log(form.getError('email') === ''); // true

// ✅ Or truthy check
if (form.getError('email')) {
  // Has error
}
```

 

### Pitfall 3: Using When hasError() is Better

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid');

// ❌ Getting error just to check if it exists
if (form.getError('email')) {
  submitButton.disabled = true;
}

// ✅ Use hasError() for boolean checks
if (form.hasError('email')) {
  submitButton.disabled = true;
}

// ✅ Use getError() when you need the message
const error = form.getError('email');
if (error) {
  errorEl.textContent = error; // Need the message
}
```

 

### Pitfall 4: Not Using for Non-Existent Fields

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ Field doesn't exist
const error = form.getError('username'); // Returns ''

// ✅ Check if field exists first
if ('username' in form.values) {
  const error = form.getError('username');
}

// OR just use it (returns '' safely)
const error = form.getError('username') || 'Field not found';
```

 

### Pitfall 5: Modifying Retrieved Error

```javascript
const form = Forms.create({
  email: ''
});

form.setError('email', 'Invalid email');

// ❌ Can't modify - returns a value, not a reference
let error = form.getError('email');
error = 'New error'; // Doesn't update form

console.log(form.getError('email')); // Still 'Invalid email'

// ✅ Use setError() to update
form.setError('email', 'New error');
```

 

## Summary

### Key Takeaways

1. **`getError()` returns error message string** - empty string if no error.

2. **Symmetric API with setError()** - get/set pattern for errors.

3. **Cleaner than `form.errors[field]`** - especially with dynamic field names.

4. **Perfect for displaying errors** - retrieve message for UI.

5. **Returns empty string for missing fields** - safe to use anywhere.

6. **Use with hasError() for best results** - check existence, then get message.

### When to Use getError()

✅ **Use getError() for:**
- Displaying error messages in UI
- Dynamic field name access
- Building error utilities and helpers
- Consistent API usage
- Programmatic error retrieval

❌ **Don't use getError() for:**
- Boolean checks (use `hasError()`)
- Checking if form has any errors (use `form.hasErrors`)
- When direct access is clearer (static field names)

### Comparison Table

| Task | Method | Returns | Use Case |
|  |  --|   |   -|
| Get error message | `getError('email')` | `string` | Display error ✅ |
| Check if has error | `hasError('email')` | `boolean` | Conditional logic ✅ |
| Set error | `setError('email', '...')` | `form` | Assign error ✅ |
| Clear error | `clearError('email')` | `form` | Remove error ✅ |

### One-Line Rule

> **`form.getError(field)` retrieves a field's error message - use it when you need to display or process the actual error text in your UI or logic.**

 

**What's Next?**

- Learn about error display patterns with reactive effects
- Explore form validation workflows
- Master combined error management strategies
