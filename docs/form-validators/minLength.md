# Validators.minLength()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    username: '',
    password: '',
    bio: ''
  },
  {
    username: Forms.v.minLength(3, 'Username must be at least 3 characters'),
    password: Forms.v.minLength(8, 'Password must be at least 8 characters'),
    bio: Forms.v.minLength(10, 'Bio must be at least 10 characters')
  }
);

// Too short
form.setValue('username', 'ab');
form.validateField('username');
console.log(form.getError('username')); // "Username must be at least 3 characters"

// Valid length
form.setValue('username', 'abc');
form.validateField('username');
console.log(form.hasError('username')); // false
```

**What just happened?** `Validators.minLength()` ensured the field has at least the specified number of characters!

 

## What is Validators.minLength()?

`Validators.minLength()` is a **built-in validator that checks if a value meets minimum length requirement**.

Simply put, it ensures strings, arrays, or other length-having values have at least N characters/items.

**Key characteristics:**
- ✅ Validates minimum length
- ✅ Works with strings, arrays
- ✅ Custom error message with length placeholder
- ✅ Allows empty values (combine with `required()`)
- ✅ Commonly used for passwords, usernames

 

## Syntax

```javascript
// Create minLength validator
const validator = Forms.v.minLength(8, 'Must be at least 8 characters');

// Use in form
const form = Forms.create(
  { password: '' },
  { password: Forms.v.minLength(8, 'Password too short (min 8 chars)') }
);

// Default message includes the min value
const validator = Forms.v.minLength(5); // "Must be at least 5 characters"
```

**Parameters:**
- `min` (number) - Minimum required length
- `message` (string, optional) - Custom error message. Use `{min}` placeholder for min value

**Returns:** `function(value) => string` - Validator function

 

## Why Does This Exist?

### The Challenge

```javascript
// ❌ Manual length validation - repetitive
const form = Forms.create(
  {
    password: '',
    username: '',
    pin: ''
  },
  {
    password: (value) => {
      if (value && value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      return '';
    },
    username: (value) => {
      if (value && value.length < 3) {
        return 'Username must be at least 3 characters';
      }
      return '';
    },
    pin: (value) => {
      if (value && value.length < 4) {
        return 'PIN must be at least 4 characters';
      }
      return '';
    }
  }
);
```

### The Solution

```javascript
// ✅ Clean and consistent
const form = Forms.create(
  {
    password: '',
    username: '',
    pin: ''
  },
  {
    password: Forms.v.minLength(8, 'Password too short'),
    username: Forms.v.minLength(3, 'Username too short'),
    pin: Forms.v.minLength(4, 'PIN too short')
  }
);
```

 

## How Does It Work?

```javascript
function minLength(min, message) {
  const defaultMessage = `Must be at least ${min} characters`;

  return function(value) {
    if (!value) return ''; // Allow empty

    const length = value.length;

    if (length < min) {
      return message || defaultMessage;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Password Minimum Length

```javascript
const form = Forms.create(
  { password: '' },
  { password: Forms.v.minLength(8, 'Password must be at least 8 characters') }
);

form.setValue('password', '1234');
console.log(form.hasError('password')); // true

form.setValue('password', '12345678');
console.log(form.hasError('password')); // false
```

 

### Example 2: Username Validation

```javascript
const form = Forms.create(
  { username: '' },
  { username: Forms.v.minLength(3, 'Username must be at least 3 characters') }
);
```

 

### Example 3: With Character Counter

```javascript
const form = Forms.create(
  { bio: '' },
  { bio: Forms.v.minLength(10, 'Bio must be at least 10 characters') }
);

effect(() => {
  const length = form.values.bio.length;
  const remaining = Math.max(0, 10 - length);

  charCounter.textContent = remaining > 0
    ? `${remaining} more characters needed`
    : `${length} characters`;
});
```

 

### Example 4: Array Validation

```javascript
const form = Forms.create(
  { tags: [] },
  {
    tags: (value) => {
      if (!value || value.length < 3) {
        return 'Please select at least 3 tags';
      }
      return '';
    }
  }
);
```

 

### Example 5: Combined with Required

```javascript
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Password required'),
      Forms.v.minLength(8, 'Password must be at least 8 characters')
    )
  }
);
```

 

## Advanced Patterns

### Pattern 1: Visual Length Indicator

```javascript
const form = Forms.create(
  { password: '' },
  { password: Forms.v.minLength(8) }
);

effect(() => {
  const length = form.values.password.length;
  const percentage = Math.min(100, (length / 8) * 100);

  progressBar.style.width = `${percentage}%`;

  if (length >= 8) {
    progressBar.classList.add('valid');
  } else {
    progressBar.classList.remove('valid');
  }
});
```

 

### Pattern 2: Dynamic Min Length

```javascript
const form = Forms.create(
  {
    securityLevel: 'normal',
    password: ''
  },
  {
    password: (value, allValues) => {
      const minLengths = {
        low: 6,
        normal: 8,
        high: 12
      };

      const min = minLengths[allValues.securityLevel];
      return Forms.v.minLength(min, `Password must be at least ${min} characters`)(value);
    }
  }
);
```

 

### Pattern 3: Strength Meter

```javascript
const form = Forms.create(
  { password: '' },
  { password: Forms.v.minLength(8) }
);

effect(() => {
  const password = form.values.password;
  let strength = 'weak';

  if (password.length >= 12) strength = 'strong';
  else if (password.length >= 8) strength = 'medium';

  strengthMeter.textContent = `Strength: ${strength}`;
  strengthMeter.className = `strength-${strength}`;
});
```

 

### Pattern 4: Incremental Validation Messages

```javascript
function minLengthWithProgress(min, fieldName) {
  return (value) => {
    if (!value) return '';

    const length = value.length;

    if (length === 0) {
      return `${fieldName} is required`;
    } else if (length < min) {
      const remaining = min - length;
      return `${remaining} more character${remaining > 1 ? 's' : ''} needed`;
    }

    return '';
  };
}

const form = Forms.create(
  { username: '' },
  { username: minLengthWithProgress(3, 'Username') }
);
```

 

### Pattern 5: Word Count Validator

```javascript
function minWordCount(minWords, message) {
  return (value) => {
    if (!value) return '';

    const words = value.trim().split(/\s+/).filter(w => w.length > 0);

    if (words.length < minWords) {
      return message || `Must contain at least ${minWords} words`;
    }

    return '';
  };
}

const form = Forms.create(
  { essay: '' },
  { essay: minWordCount(100, 'Essay must be at least 100 words') }
);
```

 

### Pattern 6: Real-Time Length Feedback

```javascript
const form = Forms.create(
  { comment: '' },
  { comment: Forms.v.minLength(10) }
);

commentInput.addEventListener('input', (e) => {
  const length = e.target.value.length;
  const min = 10;

  if (length < min) {
    feedback.textContent = `${min - length} more characters required`;
    feedback.className = 'warning';
  } else {
    feedback.textContent = 'Looks good!';
    feedback.className = 'success';
  }
});
```

 

### Pattern 7: Different Minimums for Different Fields

```javascript
const passwordRules = {
  admin: 12,
  user: 8,
  guest: 6
};

function createUserForm(userType) {
  return Forms.create(
    { password: '' },
    {
      password: Forms.v.minLength(
        passwordRules[userType],
        `Password must be at least ${passwordRules[userType]} characters`
      )
    }
  );
}

const adminForm = createUserForm('admin'); // Requires 12 chars
const userForm = createUserForm('user'); // Requires 8 chars
```

 

### Pattern 8: Trimmed Length Validation

```javascript
function minLengthTrimmed(min, message) {
  return (value) => {
    if (!value) return '';

    const trimmed = value.trim();

    if (trimmed.length < min) {
      return message || `Must be at least ${min} characters (excluding spaces)`;
    }

    return '';
  };
}

const form = Forms.create(
  { name: '' },
  { name: minLengthTrimmed(2, 'Name too short') }
);

// "  a  " fails (trimmed to "a", length 1)
// "  ab  " passes (trimmed to "ab", length 2)
```

 

### Pattern 9: Contextual Min Length Messages

```javascript
function smartMinLength(min, fieldName) {
  return (value) => {
    if (!value) return '';

    const length = value.length;

    if (length < min) {
      const diff = min - length;

      if (diff === 1) {
        return `Just ${diff} more character needed for ${fieldName}`;
      } else if (diff <= 3) {
        return `Almost there! ${diff} more characters`;
      } else {
        return `${fieldName} must be at least ${min} characters (currently ${length})`;
      }
    }

    return '';
  };
}
```

 

### Pattern 10: Multi-Language Support

```javascript
const messages = {
  en: (min) => `Must be at least ${min} characters`,
  es: (min) => `Debe tener al menos ${min} caracteres`,
  fr: (min) => `Doit contenir au moins ${min} caractères`
};

function minLengthI18n(min, language = 'en') {
  return Forms.v.minLength(min, messages[language](min));
}

const form = Forms.create(
  { password: '' },
  { password: minLengthI18n(8, 'es') }
);
```

 

## Common Pitfalls

### Pitfall 1: Not Handling Empty Values

```javascript
// ❌ minLength allows empty by default
const form = Forms.create(
  { password: '' },
  { password: Forms.v.minLength(8) }
);

form.validate();
console.log(form.isValid); // true! Empty is allowed

// ✅ Combine with required
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required(),
      Forms.v.minLength(8)
    )
  }
);
```

 

### Pitfall 2: Counting Whitespace

```javascript
// ❌ Allows "        " (8 spaces)
form.setValue('password', '        ');
console.log(form.hasError('password')); // false (length is 8)

// ✅ Trim before validation
function minLengthTrimmed(min, message) {
  return (value) => {
    if (!value) return '';
    if (value.trim().length < min) return message;
    return '';
  };
}
```

 

### Pitfall 3: Wrong Error Message

```javascript
// ❌ Generic message
Forms.v.minLength(8, 'Too short')

// ✅ Specific, helpful message
Forms.v.minLength(8, 'Password must be at least 8 characters for security')
```

 

### Pitfall 4: Not Showing Current Length

```javascript
// ❌ User doesn't know how close they are
errorDiv.textContent = 'Too short';

// ✅ Show progress
effect(() => {
  const length = form.values.password.length;
  const min = 8;

  if (form.shouldShowError('password')) {
    errorDiv.textContent = `Password must be ${min} characters (currently ${length})`;
  }
});
```

 

### Pitfall 5: Hardcoded Length Requirements

```javascript
// ❌ Hardcoded everywhere
Forms.v.minLength(8, 'Password must be at least 8 characters')
Forms.v.minLength(8, 'Too short, need 8')

// ✅ Use constant
const MIN_PASSWORD_LENGTH = 8;

Forms.v.minLength(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
```

 

## Summary

### Key Takeaways

1. **Validates minimum length** - ensures value has at least N characters
2. **Allows empty values** - combine with `required()` for mandatory fields
3. **Works with strings and arrays** - checks `.length` property
4. **Dynamic messages** - can show current vs required length
5. **Common for passwords** - security best practice

### When to Use minLength()

✅ **Use for:**
- Password fields
- Username fields
- Text areas (comments, descriptions)
- Security codes/PINs
- Array minimum size

❌ **Don't use when:**
- Field is optional and can be any length
- Need exact length (use pattern instead)
- Validating numbers (use `min()` instead)

### Example Scenarios

| Field | Min Length | Reason |
|  -|    |  --|
| Password | 8-12 | Security standard |
| Username | 3-5 | Avoid too-short names |
| Bio | 10-50 | Meaningful description |
| Comment | 5-10 | Avoid spam |
| PIN | 4-6 | Security |
| Tag list | 1-3 | Ensure categorization |

### Related Validators

- **`Validators.maxLength()`** - Maximum length
- **`Validators.required()`** - Ensure field is filled
- **`Validators.pattern()`** - Exact length with regex
- **`Validators.combine()`** - Combine multiple validators

### One-Line Rule

> **`Validators.minLength(min, message)` creates a validator that ensures a value has at least the specified number of characters or items, allowing empty values unless combined with `required()`.**

 

**What's Next?**

- Combine with `maxLength()` for length range
- Add visual length indicators
- Implement password strength meters
