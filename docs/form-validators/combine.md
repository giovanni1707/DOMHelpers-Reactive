# Validators.combine()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    username: ''
  },
  {
    email: Forms.v.combine(
      Forms.v.required('Email is required'),
      Forms.v.email('Invalid email format')
    ),

    password: Forms.v.combine(
      Forms.v.required('Password is required'),
      Forms.v.minLength(8, 'Password must be at least 8 characters'),
      Forms.v.pattern(/^(?=.*[A-Z])/, 'Must contain uppercase letter')
    ),

    username: Forms.v.combine(
      Forms.v.required('Username is required'),
      Forms.v.minLength(3, 'Username must be at least 3 characters'),
      Forms.v.maxLength(20, 'Username must be 20 characters or less'),
      Forms.v.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    )
  }
);
```

**What just happened?** `Validators.combine()` ran multiple validators in order, returning the first error found!

 

## What is Validators.combine()?

`Validators.combine()` is a **utility that combines multiple validators into one**.

Simply put, it runs validators sequentially and returns the first error message it finds.

**Key characteristics:**
- ✅ Runs validators in order
- ✅ Returns first error found
- ✅ Short-circuits on error
- ✅ Supports sync and async validators
- ✅ Perfect for multi-rule fields

 

## Syntax

```javascript
// Combine multiple validators
const combined = Forms.v.combine(
  validator1,
  validator2,
  validator3
);

// Use in form
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Required'),
      Forms.v.minLength(8, 'Too short'),
      Forms.v.pattern(/[A-Z]/, 'Need uppercase')
    )
  }
);
```

**Parameters:**
- `...validators` (function[]) - Variable number of validator functions

**Returns:** `function(value, allValues) => string | Promise<string>` - Combined validator

**Behavior:**
- Runs validators in order
- Returns first error message
- Stops at first error (short-circuit)
- Returns `''` if all pass

 

## Why Does This Exist?

### The Challenge

Without `combine()`, multi-rule validation is messy:

```javascript
// ❌ Manual combination - verbose and error-prone
const form = Forms.create(
  { password: '' },
  {
    password: (value) => {
      // Check required
      if (!value) {
        return 'Password is required';
      }

      // Check min length
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }

      // Check uppercase
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain uppercase letter';
      }

      // Check lowercase
      if (!/[a-z]/.test(value)) {
        return 'Password must contain lowercase letter';
      }

      // Check number
      if (!/\d/.test(value)) {
        return 'Password must contain a number';
      }

      return '';
    }
  }
);
```

### The Solution

```javascript
// ✅ Clean combination with combine()
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Password is required'),
      Forms.v.minLength(8, 'Password must be at least 8 characters'),
      Forms.v.pattern(/[A-Z]/, 'Must contain uppercase letter'),
      Forms.v.pattern(/[a-z]/, 'Must contain lowercase letter'),
      Forms.v.pattern(/\d/, 'Must contain a number')
    )
  }
);
```

 

## How Does It Work?

```javascript
function combine(...validators) {
  return async function(value, allValues) {
    for (const validator of validators) {
      const error = await validator(value, allValues);

      if (error) {
        return error; // Return first error, stop checking
      }
    }

    return ''; // All validators passed
  };
}
```

### Execution Flow

```
combine(v1, v2, v3)
         ↓
Run v1(value) → Error? ──YES──> Return error
         ↓
        NO
         ↓
Run v2(value) → Error? ──YES──> Return error
         ↓
        NO
         ↓
Run v3(value) → Error? ──YES──> Return error
         ↓
        NO
         ↓
Return '' (all passed)
```

 

## Basic Usage

### Example 1: Email with Required

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

// Empty → "Email is required"
// "notvalid" → "Invalid email format"
// "user@example.com" → Valid
```

 

### Example 2: Password Rules

```javascript
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Password is required'),
      Forms.v.minLength(8, 'Password must be at least 8 characters'),
      Forms.v.maxLength(100, 'Password too long'),
      Forms.v.pattern(/[A-Z]/, 'Must contain uppercase letter'),
      Forms.v.pattern(/[a-z]/, 'Must contain lowercase letter'),
      Forms.v.pattern(/\d/, 'Must contain a number'),
      Forms.v.pattern(/[@$!%*?&]/, 'Must contain special character')
    )
  }
);
```

 

### Example 3: Username Constraints

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: Forms.v.combine(
      Forms.v.required('Username is required'),
      Forms.v.minLength(3, 'Username must be at least 3 characters'),
      Forms.v.maxLength(20, 'Username must be 20 characters or less'),
      Forms.v.pattern(/^[a-zA-Z]/, 'Username must start with a letter'),
      Forms.v.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    )
  }
);
```

 

### Example 4: Numeric Range

```javascript
const form = Forms.create(
  { age: 0 },
  {
    age: Forms.v.combine(
      Forms.v.required('Age is required'),
      Forms.v.min(18, 'You must be at least 18 years old'),
      Forms.v.max(120, 'Please enter a valid age')
    )
  }
);
```

 

### Example 5: Bio with Multiple Rules

```javascript
const form = Forms.create(
  { bio: '' },
  {
    bio: Forms.v.combine(
      Forms.v.required('Bio is required'),
      Forms.v.minLength(10, 'Bio must be at least 10 characters'),
      Forms.v.maxLength(500, 'Bio must be 500 characters or less'),
      Forms.v.custom((value) => {
        if (value && value.includes('http')) {
          return 'Bio cannot contain URLs';
        }
        return '';
      })
    )
  }
);
```

 

## Advanced Patterns

### Pattern 1: Async Validators in Combination

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: Forms.v.combine(
      // Sync validators first (faster)
      Forms.v.required('Username is required'),
      Forms.v.minLength(3, 'Too short'),
      Forms.v.pattern(/^[a-zA-Z0-9_]+$/, 'Invalid characters'),

      // Async validator last (slower)
      Forms.v.custom(async (value) => {
        if (!value) return '';

        const response = await fetch(`/api/check-username?u=${value}`);
        const { available } = await response.json();

        return available ? '' : 'Username already taken';
      })
    )
  }
);

// Order matters! Async validator only runs if sync validators pass
```

 

### Pattern 2: Conditional Validator Combination

```javascript
function createPasswordValidator(securityLevel) {
  const baseValidators = [
    Forms.v.required('Password is required'),
    Forms.v.minLength(8, 'Minimum 8 characters')
  ];

  const strictValidators = [
    Forms.v.minLength(12, 'Minimum 12 characters'),
    Forms.v.pattern(/[A-Z]/, 'Must contain uppercase'),
    Forms.v.pattern(/[a-z]/, 'Must contain lowercase'),
    Forms.v.pattern(/\d/, 'Must contain number'),
    Forms.v.pattern(/[@$!%*?&]/, 'Must contain special character')
  ];

  const validators = securityLevel === 'high'
    ? [...baseValidators, ...strictValidators]
    : baseValidators;

  return Forms.v.combine(...validators);
}

const adminForm = Forms.create(
  { password: '' },
  { password: createPasswordValidator('high') }
);

const userForm = Forms.create(
  { password: '' },
  { password: createPasswordValidator('normal') }
);
```

 

### Pattern 3: Progressive Validation Messages

```javascript
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Password is required'),

      Forms.v.custom((value) => {
        if (!value) return '';

        const checks = {
          length: value.length >= 8,
          uppercase: /[A-Z]/.test(value),
          lowercase: /[a-z]/.test(value),
          number: /\d/.test(value),
          special: /[@$!%*?&]/.test(value)
        };

        const failed = Object.entries(checks)
          .filter(([_, passed]) => !passed)
          .map(([check]) => check);

        if (failed.length === 0) return '';

        return `Password missing: ${failed.join(', ')}`;
      })
    )
  }
);
```

 

### Pattern 4: Reusable Validator Sets

```javascript
const commonValidators = {
  requiredEmail: Forms.v.combine(
    Forms.v.required('Email is required'),
    Forms.v.email('Invalid email format')
  ),

  strongPassword: Forms.v.combine(
    Forms.v.required('Password is required'),
    Forms.v.minLength(8, 'Minimum 8 characters'),
    Forms.v.pattern(/[A-Z]/, 'Need uppercase'),
    Forms.v.pattern(/[a-z]/, 'Need lowercase'),
    Forms.v.pattern(/\d/, 'Need number')
  ),

  username: Forms.v.combine(
    Forms.v.required('Username is required'),
    Forms.v.minLength(3, 'Minimum 3 characters'),
    Forms.v.maxLength(20, 'Maximum 20 characters'),
    Forms.v.pattern(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscore only')
  )
};

const form = Forms.create(
  {
    email: '',
    password: '',
    username: ''
  },
  {
    email: commonValidators.requiredEmail,
    password: commonValidators.strongPassword,
    username: commonValidators.username
  }
);
```

 

### Pattern 5: Validation with Side Effects

```javascript
let passwordStrength = 0;

const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Password is required'),

      Forms.v.custom((value) => {
        if (!value) {
          passwordStrength = 0;
          return '';
        }

        // Calculate strength as side effect
        let strength = 0;
        if (value.length >= 8) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[a-z]/.test(value)) strength++;
        if (/\d/.test(value)) strength++;
        if (/[@$!%*?&]/.test(value)) strength++;

        passwordStrength = strength;

        updateStrengthMeter(strength);

        if (strength < 3) {
          return 'Password is too weak';
        }

        return '';
      })
    )
  }
);
```

 

### Pattern 6: Cascading Validation

```javascript
const form = Forms.create(
  {
    email: '',
    confirmEmail: ''
  },
  {
    email: Forms.v.combine(
      Forms.v.required('Email is required'),
      Forms.v.email('Invalid email'),

      // Revalidate confirm email if it exists
      Forms.v.custom((value, allValues) => {
        if (allValues.confirmEmail && form.touched.confirmEmail) {
          setTimeout(() => form.validateField('confirmEmail'), 0);
        }
        return '';
      })
    ),

    confirmEmail: Forms.v.combine(
      Forms.v.required('Please confirm email'),
      Forms.v.email('Invalid email'),
      Forms.v.match('email', 'Emails must match')
    )
  }
);
```

 

### Pattern 7: Early Exit for Performance

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: Forms.v.combine(
      // Fast checks first
      Forms.v.required('Required'),
      Forms.v.minLength(3, 'Too short'),
      Forms.v.pattern(/^[a-zA-Z0-9_]+$/, 'Invalid chars'),

      // Slow API check last (only if fast checks pass)
      Forms.v.custom(async (value) => {
        console.log('Checking availability...'); // Only logs if previous validators pass

        const response = await fetch(`/api/check-username?u=${value}`);
        const { available } = await response.json();

        return available ? '' : 'Username taken';
      })
    )
  }
);
```

 

### Pattern 8: Validation with Warnings

```javascript
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      Forms.v.required('Password required'),
      Forms.v.minLength(8, 'Minimum 8 characters'),

      // Warning (not error)
      Forms.v.custom((value) => {
        if (!value) return '';

        // Check against common passwords
        const commonPasswords = ['password', '12345678', 'qwerty'];

        if (commonPasswords.includes(value.toLowerCase())) {
          // Return as error, but could also set a separate warning state
          return '⚠️ This password is commonly used and not recommended';
        }

        return '';
      })
    )
  }
);
```

 

### Pattern 9: Internationalized Validators

```javascript
function createI18nValidators(locale = 'en') {
  const messages = {
    en: {
      required: 'This field is required',
      email: 'Invalid email format',
      minLength: (min) => `Minimum ${min} characters required`
    },
    es: {
      required: 'Este campo es obligatorio',
      email: 'Formato de correo inválido',
      minLength: (min) => `Mínimo ${min} caracteres requeridos`
    },
    fr: {
      required: 'Ce champ est requis',
      email: 'Format d\'email invalide',
      minLength: (min) => `Minimum ${min} caractères requis`
    }
  };

  const msg = messages[locale];

  return {
    requiredEmail: Forms.v.combine(
      Forms.v.required(msg.required),
      Forms.v.email(msg.email)
    ),

    requiredUsername: Forms.v.combine(
      Forms.v.required(msg.required),
      Forms.v.minLength(3, msg.minLength(3))
    )
  };
}

const validators = createI18nValidators('es');

const form = Forms.create(
  { email: '' },
  { email: validators.requiredEmail }
);
```

 

### Pattern 10: Validator Pipeline with Logging

```javascript
function createLoggingValidator(name, validator) {
  return async (value, allValues) => {
    console.log(`[${name}] Validating:`, value);

    const error = await validator(value, allValues);

    if (error) {
      console.log(`[${name}] ❌ Error:`, error);
    } else {
      console.log(`[${name}] ✅ Valid`);
    }

    return error;
  };
}

const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.combine(
      createLoggingValidator('Required', Forms.v.required('Password required')),
      createLoggingValidator('MinLength', Forms.v.minLength(8, 'Too short')),
      createLoggingValidator('Uppercase', Forms.v.pattern(/[A-Z]/, 'Need uppercase')),
      createLoggingValidator('Lowercase', Forms.v.pattern(/[a-z]/, 'Need lowercase')),
      createLoggingValidator('Number', Forms.v.pattern(/\d/, 'Need number'))
    )
  }
);

// Console output shows validation pipeline:
// [Required] Validating: secret
// [Required] ✅ Valid
// [MinLength] Validating: secret
// [MinLength] ❌ Error: Too short
```

 

## Common Pitfalls

### Pitfall 1: Wrong Validator Order

```javascript
// ❌ Expensive async validator runs first
Forms.v.combine(
  Forms.v.custom(async (value) => {
    const response = await fetch(`/api/check?v=${value}`);
    // Runs even on empty value!
  }),
  Forms.v.required('Required'), // Should be first!
  Forms.v.minLength(3, 'Too short')
);

// ✅ Fast validators first, expensive last
Forms.v.combine(
  Forms.v.required('Required'),
  Forms.v.minLength(3, 'Too short'),
  Forms.v.custom(async (value) => {
    // Only runs if required and minLength pass
    const response = await fetch(`/api/check?v=${value}`);
    // ...
  })
);
```

 

### Pitfall 2: Too Many Validators

```javascript
// ❌ Overwhelming number of validators
Forms.v.combine(
  v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12
  // User sees errors one at a time, gets frustrated
);

// ✅ Group related checks
Forms.v.combine(
  Forms.v.required('Required'),
  Forms.v.custom((value) => {
    // Combine related checks, return helpful message
    if (!value) return '';

    const issues = [];
    if (value.length < 8) issues.push('8 characters');
    if (!/[A-Z]/.test(value)) issues.push('uppercase');
    if (!/[a-z]/.test(value)) issues.push('lowercase');
    if (!/\d/.test(value)) issues.push('number');

    if (issues.length > 0) {
      return `Password must include: ${issues.join(', ')}`;
    }

    return '';
  })
);
```

 

### Pitfall 3: Not Handling Async Properly

```javascript
// ❌ Mixing sync and async without await
Forms.v.combine(
  Forms.v.required('Required'),
  (value) => {
    fetch(`/api/check?v=${value}`); // Forgot await!
    return ''; // Always returns valid
  }
);

// ✅ Use async/await properly
Forms.v.combine(
  Forms.v.required('Required'),
  Forms.v.custom(async (value) => {
    const response = await fetch(`/api/check?v=${value}`);
    const { valid } = await response.json();
    return valid ? '' : 'Invalid';
  })
);
```

 

### Pitfall 4: Duplicate Validation Logic

```javascript
// ❌ Redundant validators
Forms.v.combine(
  Forms.v.minLength(8, 'Too short'),
  Forms.v.custom((value) => {
    if (value.length < 8) return 'Too short'; // Duplicate!
    // ...
  })
);

// ✅ Remove duplication
Forms.v.combine(
  Forms.v.minLength(8, 'Too short'),
  Forms.v.custom((value) => {
    // Other validation logic
  })
);
```

 

### Pitfall 5: Not Short-Circuiting

```javascript
// ❌ Manual combination doesn't short-circuit
(value) => {
  const errors = [];

  const required = Forms.v.required('Required')(value);
  if (required) errors.push(required);

  const minLength = Forms.v.minLength(8, 'Too short')(value);
  if (minLength) errors.push(minLength);

  // Still runs minLength even when value is empty!

  return errors[0] || '';
}

// ✅ combine() short-circuits automatically
Forms.v.combine(
  Forms.v.required('Required'),
  Forms.v.minLength(8, 'Too short') // Only runs if required passes
);
```

 

## Summary

### Key Takeaways

1. **Combines multiple validators** - runs them in sequence
2. **Short-circuits on error** - returns first error found
3. **Preserves order** - validators run in the order specified
4. **Supports async** - handles async validators automatically
5. **Performance optimization** - put fast validators first

### When to Use combine()

✅ **Use for:**
- Fields with multiple validation rules
- Required + format validation
- Progressive validation (fast → slow)
- Reusable validator sets

❌ **Don't use when:**
- Only one validator needed
- Need all error messages at once
- Complex conditional logic (use custom instead)

### Best Practices

| Practice | Reason |
|   -|  --|
| Put `required()` first | Avoid validating empty values |
| Fast validators before slow | Better performance |
| Sync before async | Minimize async calls |
| Logical order | Better UX - show most important error |
| Limit total count | Too many rules overwhelm users |

### Related Validators

- **All built-in validators** - Use with combine()
- **`Validators.custom()`** - Create complex validators
- **Direct function** - Can be used without combine()

### One-Line Rule

> **`Validators.combine(...validators)` runs multiple validators in sequence, returning the first error message found and short-circuiting for performance.**

 

**What's Next?**

- Create reusable validator combinations
- Optimize validator order for performance
- Build validator libraries for your app
