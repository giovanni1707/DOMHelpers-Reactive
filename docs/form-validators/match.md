# Validators.match()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: '',
    email: '',
    confirmEmail: ''
  },
  {
    password: Forms.v.minLength(8, 'Password too short'),
    confirmPassword: Forms.v.match('password', 'Passwords must match'),
    email: Forms.v.email('Invalid email'),
    confirmEmail: Forms.v.match('email', 'Email addresses must match')
  }
);

// Passwords don't match
form.setValue('password', 'secret123');
form.setValue('confirmPassword', 'secret456');
form.validateField('confirmPassword');
console.log(form.getError('confirmPassword')); // "Passwords must match"

// Passwords match
form.setValue('confirmPassword', 'secret123');
form.validateField('confirmPassword');
console.log(form.hasError('confirmPassword')); // false
```

**What just happened?** `Validators.match()` ensured the confirmation field matches the original field value!

 

## What is Validators.match()?

`Validators.match()` is a **built-in validator that ensures one field matches another field's value**.

Simply put, it's perfect for confirmation fields - password confirmation, email confirmation, etc.

**Key characteristics:**
- ✅ Compares two field values
- ✅ Custom error message
- ✅ References another field by name
- ✅ Commonly used for confirmations
- ✅ Works with any value type

 

## Syntax

```javascript
// Create match validator
const validator = Forms.v.match('password', 'Passwords must match');

// Use in form
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

// Default message
const validator = Forms.v.match('email'); // "Must match email"
```

**Parameters:**
- `fieldName` (string) - Name of field to match against
- `message` (string, optional) - Custom error message

**Returns:** `function(value, allValues) => string` - Validator function

 

## Why Does This Exist?

### The Challenge

```javascript
// ❌ Manual match validation - error-prone
const form = Forms.create(
  {
    password: '',
    confirmPassword: '',
    email: '',
    confirmEmail: ''
  },
  {
    confirmPassword: (value, allValues) => {
      if (value !== allValues.password) {
        return 'Passwords must match';
      }
      return '';
    },
    confirmEmail: (value, allValues) => {
      if (value !== allValues.email) {
        return 'Emails must match';
      }
      return '';
    }
  }
);
```

### The Solution

```javascript
// ✅ Clean match validation
const form = Forms.create(
  {
    password: '',
    confirmPassword: '',
    email: '',
    confirmEmail: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match'),
    confirmEmail: Forms.v.match('email', 'Emails must match')
  }
);
```

 

## How Does It Work?

```javascript
function match(fieldName, message) {
  const defaultMessage = `Must match ${fieldName}`;

  return function(value, allValues) {
    if (!value) return ''; // Allow empty

    if (value !== allValues[fieldName]) {
      return message || defaultMessage;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Password Confirmation

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: Forms.v.minLength(8, 'Password too short'),
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

// Show match status
effect(() => {
  if (form.values.confirmPassword && !form.hasError('confirmPassword')) {
    confirmIcon.textContent = '✓';
    confirmIcon.classList.add('match');
  } else {
    confirmIcon.textContent = '';
    confirmIcon.classList.remove('match');
  }
});
```

 

### Example 2: Email Confirmation

```javascript
const form = Forms.create(
  {
    email: '',
    confirmEmail: ''
  },
  {
    email: Forms.v.email('Invalid email'),
    confirmEmail: Forms.v.combine(
      Forms.v.email('Invalid email'),
      Forms.v.match('email', 'Email addresses must match')
    )
  }
);
```

 

### Example 3: Username Change Confirmation

```javascript
const form = Forms.create(
  {
    newUsername: '',
    confirmUsername: ''
  },
  {
    newUsername: Forms.v.minLength(3, 'Username too short'),
    confirmUsername: Forms.v.match('newUsername', 'Usernames must match')
  }
);
```

 

### Example 4: Account Deletion Confirmation

```javascript
const form = Forms.create(
  {
    accountName: 'john_doe', // Pre-filled
    confirmDeletion: ''
  },
  {
    confirmDeletion: Forms.v.match(
      'accountName',
      'Please type your account name to confirm deletion'
    )
  }
);
```

 

### Example 5: Real-Time Match Indicator

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

confirmPasswordInput.addEventListener('input', form.handleChange);

effect(() => {
  const password = form.values.password;
  const confirm = form.values.confirmPassword;

  if (!confirm) {
    matchIndicator.textContent = '';
    return;
  }

  if (password === confirm) {
    matchIndicator.textContent = '✓ Passwords match';
    matchIndicator.className = 'match';
  } else {
    matchIndicator.textContent = '✗ Passwords do not match';
    matchIndicator.className = 'no-match';
  }
});
```

 

## Advanced Patterns

### Pattern 1: Cross-Validation (Both Fields)

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: (value, allValues) => {
      const minError = Forms.v.minLength(8, 'Too short')(value);
      if (minError) return minError;

      // Revalidate confirm if it's been touched
      if (allValues.confirmPassword && form.touched.confirmPassword) {
        setTimeout(() => form.validateField('confirmPassword'), 0);
      }

      return '';
    },
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);
```

 

### Pattern 2: Case-Insensitive Match

```javascript
function matchIgnoreCase(fieldName, message) {
  return (value, allValues) => {
    if (!value) return '';

    const fieldValue = allValues[fieldName];

    if (value.toLowerCase() !== fieldValue.toLowerCase()) {
      return message || `Must match ${fieldName}`;
    }

    return '';
  };
}

const form = Forms.create(
  {
    email: '',
    confirmEmail: ''
  },
  {
    confirmEmail: matchIgnoreCase('email', 'Email addresses must match')
  }
);
```

 

### Pattern 3: Progressive Match Feedback

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

effect(() => {
  const password = form.values.password;
  const confirm = form.values.confirmPassword;

  if (!confirm) {
    feedback.textContent = 'Enter password confirmation';
    feedback.className = 'neutral';
    return;
  }

  // Calculate match percentage
  let matchCount = 0;
  const minLength = Math.min(password.length, confirm.length);

  for (let i = 0; i < minLength; i++) {
    if (password[i] === confirm[i]) matchCount++;
  }

  const matchPercentage = minLength > 0
    ? (matchCount / password.length) * 100
    : 0;

  if (password === confirm) {
    feedback.textContent = '✓ Perfect match';
    feedback.className = 'match';
  } else if (matchPercentage > 75) {
    feedback.textContent = 'Almost there...';
    feedback.className = 'close';
  } else if (matchPercentage > 0) {
    feedback.textContent = 'Keep typing...';
    feedback.className = 'partial';
  } else {
    feedback.textContent = '✗ Does not match';
    feedback.className = 'no-match';
  }
});
```

 

### Pattern 4: Confirmation with Copy-Paste Prevention

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

confirmPasswordInput.addEventListener('paste', (e) => {
  e.preventDefault();
  showNotification('Please type your password to confirm', 'warning');
});
```

 

### Pattern 5: Multi-Field Match

```javascript
function matchMultiple(fieldNames, message) {
  return (value, allValues) => {
    if (!value) return '';

    const allMatch = fieldNames.every(
      fieldName => allValues[fieldName] === value
    );

    if (!allMatch) {
      return message || `All fields must match`;
    }

    return '';
  };
}

const form = Forms.create(
  {
    password: '',
    confirmPassword1: '',
    confirmPassword2: ''
  },
  {
    confirmPassword1: Forms.v.match('password', 'Must match password'),
    confirmPassword2: matchMultiple(
      ['password', 'confirmPassword1'],
      'All passwords must match'
    )
  }
);
```

 

### Pattern 6: Delayed Match Validation

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

let validateTimeout;

confirmPasswordInput.addEventListener('input', (e) => {
  form.setValue('confirmPassword', e.target.value);

  // Delay validation until user stops typing
  clearTimeout(validateTimeout);
  validateTimeout = setTimeout(() => {
    form.validateField('confirmPassword');
  }, 500);
});
```

 

### Pattern 7: Visual Match Progress Bar

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('password', 'Passwords must match')
  }
);

effect(() => {
  const password = form.values.password;
  const confirm = form.values.confirmPassword;

  if (!confirm) {
    progressBar.style.width = '0%';
    return;
  }

  let matchCount = 0;
  for (let i = 0; i < Math.min(password.length, confirm.length); i++) {
    if (password[i] === confirm[i]) matchCount++;
  }

  const progress = password.length > 0
    ? (matchCount / password.length) * 100
    : 0;

  progressBar.style.width = `${progress}%`;

  if (progress === 100 && password.length === confirm.length) {
    progressBar.classList.add('complete');
  } else {
    progressBar.classList.remove('complete');
  }
});
```

 

### Pattern 8: Match with Strength Requirements

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: Forms.v.combine(
      Forms.v.minLength(8, 'At least 8 characters'),
      Forms.v.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must include uppercase, lowercase, and number'
      )
    ),
    confirmPassword: (value, allValues) => {
      // First check if password is valid
      if (form.hasError('password')) {
        return 'Please fix password first';
      }

      // Then check if they match
      return Forms.v.match('password', 'Passwords must match')(value, allValues);
    }
  }
);
```

 

### Pattern 9: Confirmation Before Action

```javascript
const DANGEROUS_ACTION_PHRASE = 'DELETE MY ACCOUNT';

const form = Forms.create(
  {
    confirmationPhrase: ''
  },
  {
    confirmationPhrase: (value) => {
      if (!value) return '';

      if (value !== DANGEROUS_ACTION_PHRASE) {
        return `Please type "${DANGEROUS_ACTION_PHRASE}" to confirm`;
      }

      return '';
    }
  }
);

effect(() => {
  deleteButton.disabled =
    form.values.confirmationPhrase !== DANGEROUS_ACTION_PHRASE;
});
```

 

### Pattern 10: Two-Way Match Validation

```javascript
const form = Forms.create(
  {
    field1: '',
    field2: ''
  },
  {
    field1: (value, allValues) => {
      if (!value) return '';

      // Validate field2 if it's been touched
      if (allValues.field2 && form.touched.field2) {
        if (value !== allValues.field2) {
          // Also mark field2 as having error
          setTimeout(() => form.validateField('field2'), 0);
        }
      }

      return '';
    },
    field2: (value, allValues) => {
      if (!value) return '';

      if (value !== allValues.field1) {
        return 'Fields must match';
      }

      // If they match now, revalidate field1 to clear its error
      if (form.hasError('field1')) {
        setTimeout(() => form.validateField('field1'), 0);
      }

      return '';
    }
  }
);
```

 

## Common Pitfalls

### Pitfall 1: Not Revalidating When Source Changes

```javascript
// ❌ Confirm doesn't revalidate when password changes
passwordInput.addEventListener('input', form.handleChange);
confirmInput.addEventListener('input', form.handleChange);

// User types "abc" in password
// User types "abc" in confirm → Match!
// User changes password to "xyz"
// Confirm still shows "abc" but no error (not revalidated)

// ✅ Revalidate confirm when password changes
passwordInput.addEventListener('input', (e) => {
  form.handleChange(e);

  if (form.touched.confirmPassword) {
    form.validateField('confirmPassword');
  }
});
```

 

### Pitfall 2: Validating Before Value Exists

```javascript
// ❌ Showing error before user types anything
confirmPassword: Forms.v.match('password', 'Must match')

// User hasn't typed in confirm field yet
// Error shows immediately!

// ✅ Only show error after touched
effect(() => {
  if (form.shouldShowError('confirmPassword')) {
    errorDiv.textContent = form.getError('confirmPassword');
  }
});
```

 

### Pitfall 3: Case Sensitivity Issues

```javascript
// ❌ Case-sensitive match for emails
email: 'user@EXAMPLE.com'
confirmEmail: 'user@example.com'
// These don't match!

// ✅ Normalize before comparison
emailInput.addEventListener('blur', (e) => {
  const normalized = e.target.value.toLowerCase();
  form.setValue('email', normalized);
});
```

 

### Pitfall 4: Wrong Field Name

```javascript
// ❌ Typo in field name
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    confirmPassword: Forms.v.match('pasword', 'Must match')
    //                                ^^ typo!
  }
);

// Always undefined, never matches

// ✅ Use constants or check field exists
const FIELDS = {
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword'
};

confirmPassword: Forms.v.match(FIELDS.PASSWORD, 'Must match')
```

 

### Pitfall 5: Not Handling Empty Values

```javascript
// ❌ Shows error even when both empty
confirmPassword: (value, allValues) => {
  if (value !== allValues.password) {
    return 'Must match';
  }
  return '';
}

// Both empty → '' !== '' is false, but error shows

// ✅ Allow empty (match validator handles this)
confirmPassword: Forms.v.match('password', 'Must match')
// Built-in allows empty values
```

 

## Summary

### Key Takeaways

1. **Cross-field validation** - compares two field values
2. **Perfect for confirmations** - password, email, username
3. **Allows empty values** - only validates when value exists
4. **Revalidation needed** - revalidate when source field changes
5. **Common UX pattern** - prevents typos in critical fields

### When to Use match()

✅ **Use for:**
- Password confirmation
- Email confirmation
- Account deletion confirmation
- Critical field verification
- Any two-field comparison

❌ **Don't use when:**
- Comparing more than two fields (use custom validator)
- Need case-insensitive match (use custom validator)
- Fields aren't related

### Common Match Scenarios

| Original Field | Confirm Field | Purpose |
|     -|     |   |
| password | confirmPassword | Prevent password typos |
| email | confirmEmail | Ensure correct email |
| newPassword | confirmNewPassword | Password change |
| accountName | confirmDeletion | Destructive action |
| transferAmount | confirmAmount | Financial verification |

### Related Validators

- **`Validators.custom()`** - Complex match logic
- **`Validators.combine()`** - Match + other validators
- **`Validators.required()`** - Ensure both fields filled

### One-Line Rule

> **`Validators.match(fieldName, message)` creates a validator that ensures a field's value exactly matches another field's value, perfect for confirmation fields like password confirmation.**

 

**What's Next?**

- Implement real-time match indicators
- Add copy-paste prevention for security
- Create two-way validation patterns
