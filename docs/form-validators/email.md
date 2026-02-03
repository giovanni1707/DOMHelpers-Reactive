# Validators.email()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    workEmail: ''
  },
  {
    email: Forms.v.email('Please enter a valid email address'),
    workEmail: Forms.v.email('Work email is invalid')
  }
);

// Invalid email
form.setValue('email', 'notanemail');
form.validateField('email');
console.log(form.getError('email')); // "Please enter a valid email address"

// Valid email
form.setValue('email', 'user@example.com');
form.validateField('email');
console.log(form.getError('email')); // "" (no error)
```

**What just happened?** `Validators.email()` created a validator that checks if the value is a valid email format!

 

## What is Validators.email()?

`Validators.email()` is a **built-in validator that checks if a value matches valid email format**.

Simply put, it ensures the field contains a properly formatted email address with `@` and domain.

**Key characteristics:**
- ✅ Validates email format (user@domain.com)
- ✅ Custom error message
- ✅ Uses standard email regex pattern
- ✅ Allows empty values (combine with `required()` if needed)
- ✅ Case-insensitive validation
- ✅ Handles common email formats

 

## Syntax

```javascript
// Create email validator with custom message
const validator = Forms.v.email('Invalid email address');

// Use in form
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Please enter a valid email') }
);

// With default message
const validator = Forms.v.email(); // "Please enter a valid email address"
```

**Parameters:**
- `message` (string, optional) - Custom error message. Default: `'Please enter a valid email address'`

**Returns:** `function(value) => string` - Validator function

**Validation Pattern:**
- Must contain `@` symbol
- Must have characters before and after `@`
- Must have domain with `.` (e.g., `example.com`)
- Common formats: `user@domain.com`, `user.name@sub.domain.co.uk`

 

## Why Does This Exist?

### The Challenge: Manual Email Validation

```javascript
const form = Forms.create(
  { email: '' },
  {
    // ❌ Manual email validation - error-prone
    email: (value) => {
      if (!value) return '';

      // Easy to get regex wrong
      const regex = /^[a-z0-9]+@[a-z]+\.[a-z]+$/;
      if (!regex.test(value)) {
        return 'Invalid email';
      }
      return '';
    }
  }
);

// This regex is too strict! Rejects valid emails like:
// - user.name@example.com (dots in name)
// - user+tag@example.com (plus signs)
// - user@sub.domain.com (subdomains)
```

**Problems:**
❌ **Complex regex** - Hard to get right
❌ **Inconsistent** - Different validation in different places
❌ **Incomplete** - Misses valid email formats
❌ **Too strict** - Rejects legitimate emails

### The Solution with Validators.email()

```javascript
const form = Forms.create(
  { email: '' },
  {
    // ✅ Battle-tested email validation
    email: Forms.v.email('Please enter a valid email')
  }
);

// Handles all common formats correctly!
```

 

## Mental Model

Think of `Validators.email()` as an **email format checker** - it verifies the structure looks like a real email address.

### Validation Flow

```
Value entered
      ↓
Check if empty → YES → Valid (allows empty)
      ↓
     NO
      ↓
Has @ symbol? → NO → ❌ Invalid
      ↓
    YES
      ↓
Has local part (before @)? → NO → ❌ Invalid
      ↓
    YES
      ↓
Has domain (after @)? → NO → ❌ Invalid
      ↓
    YES
      ↓
Domain has .? → NO → ❌ Invalid
      ↓
    YES
      ↓
✅ Valid email format
```

 

## How Does It Work?

### Internal Process

```javascript
function email(message = 'Please enter a valid email address') {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return function(value) {
    // Allow empty (combine with required() if needed)
    if (!value) return '';

    // Test against regex
    if (!emailRegex.test(value)) {
      return message;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Simple Email Validation

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid email') }
);

// Invalid formats
form.setValue('email', 'notemail');
console.log(form.hasError('email')); // true

form.setValue('email', '@example.com');
console.log(form.hasError('email')); // true

form.setValue('email', 'user@');
console.log(form.hasError('email')); // true

// Valid format
form.setValue('email', 'user@example.com');
console.log(form.hasError('email')); // false
```

 

### Example 2: Email with Required

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: Forms.v.combine(
      Forms.v.required('Email is required'),
      Forms.v.email('Invalid email format')
    )
  }
);

// Empty - required error
form.validate();
console.log(form.getError('email')); // "Email is required"

// Invalid format
form.setValue('email', 'notvalid');
form.validateField('email');
console.log(form.getError('email')); // "Invalid email format"

// Valid
form.setValue('email', 'user@example.com');
form.validateField('email');
console.log(form.hasError('email')); // false
```

 

### Example 3: Multiple Email Fields

```javascript
const form = Forms.create(
  {
    personalEmail: '',
    workEmail: '',
    recoveryEmail: ''
  },
  {
    personalEmail: Forms.v.email('Invalid personal email'),
    workEmail: Forms.v.email('Invalid work email'),
    recoveryEmail: Forms.v.email('Invalid recovery email')
  }
);
```

 

### Example 4: Email with Visual Feedback

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid email') }
);

emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', form.handleBlur);

effect(() => {
  if (form.shouldShowError('email')) {
    emailInput.classList.add('error');
    errorSpan.textContent = form.getError('email');
  } else if (form.values.email) {
    emailInput.classList.add('success');
    errorSpan.textContent = '';
  } else {
    emailInput.classList.remove('error', 'success');
    errorSpan.textContent = '';
  }
});
```

 

### Example 5: Email Case Normalization

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid email') }
);

emailInput.addEventListener('blur', (e) => {
  // Normalize to lowercase
  const normalized = e.target.value.toLowerCase();
  form.setValue('email', normalized);
  e.target.value = normalized;
});
```

 

## Advanced Patterns

### Pattern 1: Domain Whitelist

```javascript
function emailWithDomain(allowedDomains, message) {
  return (value) => {
    // First check basic email format
    const emailError = Forms.v.email('Invalid email format')(value);
    if (emailError) return emailError;

    if (!value) return '';

    // Check domain
    const domain = value.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(domain)) {
      return message || `Email must be from: ${allowedDomains.join(', ')}`;
    }

    return '';
  };
}

const form = Forms.create(
  { workEmail: '' },
  {
    workEmail: emailWithDomain(
      ['company.com', 'company.co.uk'],
      'Please use your company email'
    )
  }
);
```

 

### Pattern 2: Email Existence Check

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: async (value) => {
      // Basic format check
      const formatError = Forms.v.email('Invalid email')(value);
      if (formatError) return formatError;

      if (!value) return '';

      // Check if email exists (debounced)
      const response = await fetch(`/api/check-email?email=${value}`);
      const { exists } = await response.json();

      if (exists) {
        return 'This email is already registered';
      }

      return '';
    }
  }
);
```

 

### Pattern 3: Email with Auto-Complete Suggestions

```javascript
const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

emailInput.addEventListener('input', (e) => {
  form.handleChange(e);

  const value = e.target.value;
  const atIndex = value.indexOf('@');

  if (atIndex > 0) {
    const domain = value.substring(atIndex + 1);

    if (domain && domain.length >= 1) {
      const suggestions = commonDomains
        .filter(d => d.startsWith(domain.toLowerCase()))
        .map(d => value.substring(0, atIndex + 1) + d);

      showSuggestions(suggestions);
    }
  }
});
```

 

### Pattern 4: Email with Typo Detection

```javascript
function suggestEmailCorrection(email) {
  const typos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'outlok.com': 'outlook.com'
  };

  const [local, domain] = email.split('@');

  if (typos[domain]) {
    return `${local}@${typos[domain]}`;
  }

  return null;
}

emailInput.addEventListener('blur', (e) => {
  const value = form.values.email;
  const suggestion = suggestEmailCorrection(value);

  if (suggestion) {
    const shouldFix = confirm(`Did you mean: ${suggestion}?`);
    if (shouldFix) {
      form.setValue('email', suggestion);
      e.target.value = suggestion;
    }
  }
});
```

 

### Pattern 5: Disposable Email Blocker

```javascript
const disposableDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com'
];

function blockDisposableEmail(message) {
  return (value) => {
    const emailError = Forms.v.email('Invalid email')(value);
    if (emailError) return emailError;

    if (!value) return '';

    const domain = value.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return message || 'Disposable email addresses are not allowed';
    }

    return '';
  };
}

const form = Forms.create(
  { email: '' },
  { email: blockDisposableEmail('Please use a permanent email address') }
);
```

 

### Pattern 6: Email Confirmation Match

```javascript
const form = Forms.create(
  {
    email: '',
    confirmEmail: ''
  },
  {
    email: Forms.v.email('Invalid email'),
    confirmEmail: (value, allValues) => {
      const emailError = Forms.v.email('Invalid email')(value);
      if (emailError) return emailError;

      if (value !== allValues.email) {
        return 'Emails must match';
      }

      return '';
    }
  }
);
```

 

### Pattern 7: Email with Real-Time Format Hints

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid email') }
);

emailInput.addEventListener('input', (e) => {
  const value = e.target.value;

  if (!value) {
    hintDiv.textContent = 'Example: user@example.com';
  } else if (!value.includes('@')) {
    hintDiv.textContent = 'Email must contain @';
  } else if (!value.split('@')[1]?.includes('.')) {
    hintDiv.textContent = 'Email must include domain (e.g., .com)';
  } else {
    hintDiv.textContent = '';
  }
});
```

 

### Pattern 8: Email Validation with Loading State

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: async (value) => {
      const formatError = Forms.v.email('Invalid email')(value);
      if (formatError) return formatError;

      if (!value) return '';

      emailLoadingIndicator.style.display = 'block';

      try {
        const response = await fetch(`/api/validate-email?email=${value}`);
        const { valid, message } = await response.json();

        return valid ? '' : message;
      } finally {
        emailLoadingIndicator.style.display = 'none';
      }
    }
  }
);
```

 

### Pattern 9: Internationalized Email Support

```javascript
function internationalEmail(message) {
  // More permissive regex for international emails
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (value) => {
    if (!value) return '';

    if (!regex.test(value)) {
      return message || 'Invalid email format';
    }

    // Additional checks for international characters
    const [local, domain] = value.split('@');

    if (local.length > 64 || domain.length > 255) {
      return 'Email address is too long';
    }

    return '';
  };
}
```

 

### Pattern 10: Email Normalization Pipeline

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid email') }
);

function normalizeEmail(email) {
  let normalized = email.toLowerCase().trim();

  // Remove dots from Gmail addresses (they're ignored)
  const [local, domain] = normalized.split('@');
  if (domain === 'gmail.com') {
    const cleanLocal = local.split('+')[0].replace(/\./g, '');
    normalized = `${cleanLocal}@${domain}`;
  }

  return normalized;
}

emailInput.addEventListener('blur', (e) => {
  const normalized = normalizeEmail(e.target.value);
  form.setValue('email', normalized);
  e.target.value = normalized;
});
```

 

## Common Pitfalls

### Pitfall 1: Not Combining with Required

```javascript
// ❌ Email validator allows empty values
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid') }
);

form.validate();
console.log(form.isValid); // true (empty is valid!)

// ✅ Combine with required
const form = Forms.create(
  { email: '' },
  {
    email: Forms.v.combine(
      Forms.v.required('Email required'),
      Forms.v.email('Invalid email')
    )
  }
);
```

 

### Pitfall 2: Over-Strict Validation

```javascript
// ❌ Custom regex that's too strict
const strictEmail = (value) => {
  if (!/^[a-z]+@[a-z]+\.com$/.test(value)) {
    return 'Invalid';
  }
  return '';
};

// Rejects valid emails:
// - user.name@example.com
// - user@example.co.uk
// - User@Example.COM (uppercase)

// ✅ Use the built-in validator
Forms.v.email('Invalid email')
```

 

### Pitfall 3: Not Normalizing Case

```javascript
// ❌ Case-sensitive storage
form.setValue('email', 'User@Example.COM');
// Stored as-is, may cause duplicate account issues

// ✅ Normalize to lowercase
emailInput.addEventListener('blur', (e) => {
  const normalized = e.target.value.toLowerCase();
  form.setValue('email', normalized);
});
```

 

### Pitfall 4: Validating on Every Keystroke

```javascript
// ❌ Shows error while user is still typing
emailInput.addEventListener('input', (e) => {
  form.handleChange(e);
  form.validateField('email'); // Annoying!
});

// ✅ Validate only on blur
emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e);
  // Validation happens automatically
});
```

 

### Pitfall 5: Trusting Client-Side Validation Only

```javascript
// ❌ Only client-side validation
const form = Forms.create(
  { email: '' },
  { email: Forms.v.email('Invalid') }
);

// User can bypass this!

// ✅ Always validate server-side too
async function register(values) {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    form.setErrors(errors); // Server validation errors
  }
}
```

 

## Summary

### Key Takeaways

1. **Validates email format** - checks for `user@domain.com` pattern
2. **Allows empty values** - combine with `required()` if field is mandatory
3. **Uses standard regex** - handles common email formats
4. **Custom error messages** - provide user-friendly feedback
5. **Case-insensitive** - validates regardless of letter case

### When to Use Validators.email()

✅ **Use for:**
- Email input fields
- Contact forms
- Registration/login forms
- Newsletter signups

❌ **Don't use when:**
- Field accepts non-email text
- Need custom email format rules
- Validating phone numbers or other formats

### Valid Email Examples

| Email | Valid? |
|  -|  --|
| `user@example.com` | ✅ Yes |
| `user.name@example.com` | ✅ Yes |
| `user+tag@example.com` | ✅ Yes |
| `user@sub.domain.com` | ✅ Yes |
| `USER@EXAMPLE.COM` | ✅ Yes |
| `notanemail` | ❌ No |
| `@example.com` | ❌ No |
| `user@` | ❌ No |
| `user@domain` | ❌ No (no TLD) |

### Related Validators

- **`Validators.required()`** - Ensure email is provided
- **`Validators.pattern()`** - Custom email regex
- **`Validators.combine()`** - Combine multiple validators
- **`Validators.custom()`** - Advanced email validation

### One-Line Rule

> **`Validators.email(message)` creates a validator that checks if a value matches standard email format (user@domain.com), allowing empty values unless combined with `required()`.**

 

**What's Next?**

- Combine with `Validators.required()` for mandatory emails
- Add server-side email existence validation
- Implement email normalization on submit
