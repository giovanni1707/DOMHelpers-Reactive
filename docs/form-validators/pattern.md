# Validators.pattern()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    phone: '',
    zipCode: '',
    username: ''
  },
  {
    phone: Forms.v.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be XXX-XXX-XXXX'),
    zipCode: Forms.v.pattern(/^\d{5}$/, 'Zip code must be 5 digits'),
    username: Forms.v.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  }
);

// Invalid pattern
form.setValue('phone', '1234567890');
form.validateField('phone');
console.log(form.getError('phone')); // "Phone must be XXX-XXX-XXXX"

// Valid pattern
form.setValue('phone', '123-456-7890');
form.validateField('phone');
console.log(form.hasError('phone')); // false
```

**What just happened?** `Validators.pattern()` created a validator that checks if the value matches a custom regular expression!

 

## What is Validators.pattern()?

`Validators.pattern()` is a **built-in validator that validates values against custom regex patterns**.

Simply put, it lets you enforce any custom format using regular expressions - phone numbers, zip codes, usernames, etc.

**Key characteristics:**
- ✅ Validates against regex pattern
- ✅ Custom error message
- ✅ Flexible format enforcement
- ✅ Allows empty values
- ✅ Works with any string pattern

 

## Syntax

```javascript
// Create pattern validator
const validator = Forms.v.pattern(/^\d{5}$/, 'Must be 5 digits');

// Use in form
const form = Forms.create(
  { zipCode: '' },
  { zipCode: Forms.v.pattern(/^\d{5}$/, 'Invalid zip code') }
);

// With flags (case-insensitive)
const validator = Forms.v.pattern(/^[A-Z]+$/i, 'Letters only');
```

**Parameters:**
- `regex` (RegExp) - Regular expression pattern to match
- `message` (string, optional) - Custom error message

**Returns:** `function(value) => string` - Validator function

 

## Why Does This Exist?

### The Challenge

```javascript
// ❌ Manual regex validation - repetitive
const form = Forms.create(
  {
    phone: '',
    ssn: '',
    creditCard: ''
  },
  {
    phone: (value) => {
      if (value && !/^\d{3}-\d{3}-\d{4}$/.test(value)) {
        return 'Invalid phone';
      }
      return '';
    },
    ssn: (value) => {
      if (value && !/^\d{3}-\d{2}-\d{4}$/.test(value)) {
        return 'Invalid SSN';
      }
      return '';
    },
    creditCard: (value) => {
      if (value && !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(value)) {
        return 'Invalid card';
      }
      return '';
    }
  }
);
```

### The Solution

```javascript
// ✅ Clean pattern validation
const form = Forms.create(
  {
    phone: '',
    ssn: '',
    creditCard: ''
  },
  {
    phone: Forms.v.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone'),
    ssn: Forms.v.pattern(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN'),
    creditCard: Forms.v.pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/, 'Invalid card')
  }
);
```

 

## How Does It Work?

```javascript
function pattern(regex, message = 'Invalid format') {
  return function(value) {
    if (!value) return ''; // Allow empty

    if (!regex.test(value)) {
      return message;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Phone Number Validation

```javascript
const form = Forms.create(
  { phone: '' },
  {
    phone: Forms.v.pattern(
      /^\d{3}-\d{3}-\d{4}$/,
      'Phone must be in format XXX-XXX-XXXX'
    )
  }
);

// Valid: "123-456-7890"
// Invalid: "1234567890", "(123) 456-7890"
```

 

### Example 2: Username Rules

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: Forms.v.pattern(
      /^[a-zA-Z0-9_]{3,15}$/,
      'Username: 3-15 characters, letters/numbers/underscore only'
    )
  }
);

// Valid: "john_doe", "user123", "JohnDoe"
// Invalid: "ab", "user-name", "verylongusername123"
```

 

### Example 3: Zip Code

```javascript
const form = Forms.create(
  { zipCode: '' },
  { zipCode: Forms.v.pattern(/^\d{5}(-\d{4})?$/, 'Invalid zip code') }
);

// Valid: "12345", "12345-6789"
// Invalid: "1234", "abcde"
```

 

### Example 4: Hexadecimal Color

```javascript
const form = Forms.create(
  { color: '' },
  {
    color: Forms.v.pattern(
      /^#[0-9A-F]{6}$/i,
      'Must be valid hex color (#RRGGBB)'
    )
  }
);

// Valid: "#FF0000", "#00ff00", "#ABCDEF"
// Invalid: "#FFF", "red", "#GGGGGG"
```

 

### Example 5: Alphanumeric Only

```javascript
const form = Forms.create(
  { code: '' },
  { code: Forms.v.pattern(/^[A-Z0-9]+$/i, 'Letters and numbers only') }
);

// Valid: "ABC123", "test", "123"
// Invalid: "test-123", "hello world", "test@123"
```

 

## Advanced Patterns

### Pattern 1: Credit Card Validation

```javascript
const cardPatterns = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  mastercard: /^5[1-5][0-9]{14}$/,
  amex: /^3[47][0-9]{13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
};

function creditCardValidator(message) {
  return (value) => {
    if (!value) return '';

    const cleaned = value.replace(/[\s-]/g, '');

    const isValid = Object.values(cardPatterns).some(pattern =>
      pattern.test(cleaned)
    );

    if (!isValid) {
      return message || 'Invalid credit card number';
    }

    return '';
  };
}

const form = Forms.create(
  { cardNumber: '' },
  { cardNumber: creditCardValidator('Invalid card number') }
);
```

 

### Pattern 2: Password Strength Pattern

```javascript
// Must contain: uppercase, lowercase, number, special char, min 8 chars
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.pattern(
      strongPasswordPattern,
      'Password must contain uppercase, lowercase, number, and special character'
    )
  }
);
```

 

### Pattern 3: URL Validation

```javascript
const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

const form = Forms.create(
  { website: '' },
  {
    website: Forms.v.pattern(
      urlPattern,
      'Must be a valid URL (e.g., https://example.com)'
    )
  }
);
```

 

### Pattern 4: IP Address Validation

```javascript
const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const form = Forms.create(
  { ipAddress: '' },
  {
    ipAddress: Forms.v.pattern(
      ipv4Pattern,
      'Must be a valid IPv4 address'
    )
  }
);

// Valid: "192.168.1.1", "10.0.0.1"
// Invalid: "256.1.1.1", "192.168.1"
```

 

### Pattern 5: Date Format Validation

```javascript
// YYYY-MM-DD format
const datePattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;

const form = Forms.create(
  { birthDate: '' },
  {
    birthDate: Forms.v.pattern(
      datePattern,
      'Date must be in YYYY-MM-DD format'
    )
  }
);

// Valid: "2024-01-15", "1990-12-31"
// Invalid: "2024-13-01", "24-01-15"
```

 

### Pattern 6: Slug Validation

```javascript
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const form = Forms.create(
  { slug: '' },
  {
    slug: Forms.v.pattern(
      slugPattern,
      'Slug must be lowercase letters, numbers, and hyphens only'
    )
  }
);

// Valid: "my-blog-post", "product-123"
// Invalid: "My Blog Post", "post_name", "-invalid-"
```

 

### Pattern 7: License Plate Validation

```javascript
const licensePlatePatterns = {
  us: /^[A-Z]{3}-\d{4}$/,
  uk: /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/,
  eu: /^[A-Z]{1,2}-[A-Z]{1,2}-\d{1,4}$/
};

function licensePlateValidator(country = 'us', message) {
  const pattern = licensePlatePatterns[country];

  return Forms.v.pattern(
    pattern,
    message || `Invalid ${country.toUpperCase()} license plate format`
  );
}

const form = Forms.create(
  { plate: '' },
  { plate: licensePlateValidator('us') }
);
```

 

### Pattern 8: Real-Time Pattern Formatting

```javascript
const form = Forms.create(
  { phone: '' },
  { phone: Forms.v.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone') }
);

phoneInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');

  // Auto-format as user types
  if (value.length >= 6) {
    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
  } else if (value.length >= 3) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`;
  }

  e.target.value = value;
  form.setValue('phone', value);
});
```

 

### Pattern 9: Multiple Pattern Options

```javascript
function multiPattern(patterns, message) {
  return (value) => {
    if (!value) return '';

    const isValid = patterns.some(pattern => pattern.test(value));

    if (!isValid) {
      return message || 'Invalid format';
    }

    return '';
  };
}

const form = Forms.create(
  { identifier: '' },
  {
    identifier: multiPattern(
      [
        /^\d{3}-\d{2}-\d{4}$/, // SSN
        /^[A-Z]{2}\d{6}[A-Z]$/, // Passport
        /^\d{9}$/              // Tax ID
      ],
      'Must be valid SSN, Passport, or Tax ID'
    )
  }
);
```

 

### Pattern 10: Case-Insensitive with Normalization

```javascript
const form = Forms.create(
  { hex: '' },
  {
    hex: Forms.v.pattern(
      /^[0-9A-F]+$/i,
      'Must be hexadecimal characters only'
    )
  }
);

hexInput.addEventListener('blur', (e) => {
  // Normalize to uppercase
  const normalized = e.target.value.toUpperCase();
  form.setValue('hex', normalized);
  e.target.value = normalized;
});
```

 

## Common Pitfalls

### Pitfall 1: Forgetting Anchors (^ and $)

```javascript
// ❌ Without anchors - matches substring
Forms.v.pattern(/\d{5}/, 'Invalid')
// "abc12345xyz" passes! (contains 5 digits)

// ✅ With anchors - matches entire string
Forms.v.pattern(/^\d{5}$/, 'Invalid')
// Only "12345" passes
```

 

### Pitfall 2: Not Escaping Special Characters

```javascript
// ❌ Unescaped dot matches any character
Forms.v.pattern(/^\d{3}.\d{3}.\d{4}$/, 'Invalid')
// Matches "123-456-7890" and "123a456b7890"

// ✅ Escaped dot matches literal dot
Forms.v.pattern(/^\d{3}\.\d{3}\.\d{4}$/, 'Invalid')
// Only matches "123.456.7890"
```

 

### Pitfall 3: Too Strict Patterns

```javascript
// ❌ Too strict - rejects valid inputs
Forms.v.pattern(/^[a-z]+$/, 'Lowercase only')
// Rejects "John", "test123", "hello-world"

// ✅ More flexible
Forms.v.pattern(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, dash, underscore')
```

 

### Pitfall 4: Not Showing Expected Format

```javascript
// ❌ Vague error message
Forms.v.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Invalid format')

// ✅ Clear expected format
Forms.v.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be XXX-XXX-XXXX')
```

 

### Pitfall 5: Client-Side Only Validation

```javascript
// ❌ Only validating on client
Forms.v.pattern(/^[A-Z0-9]+$/, 'Alphanumeric only')
// User can bypass in browser console

// ✅ Also validate on server
// Backend must have same regex validation
```

 

## Summary

### Key Takeaways

1. **Validates against regex patterns** - custom format enforcement
2. **Flexible and powerful** - supports any string pattern
3. **Allows empty values** - combine with `required()` if needed
4. **Use anchors** - `^` and `$` for exact matches
5. **Clear error messages** - show expected format

### When to Use pattern()

✅ **Use for:**
- Phone numbers
- Zip/postal codes
- Usernames with specific rules
- License plates
- Credit cards
- Custom format codes

❌ **Don't use when:**
- Email validation (use `email()`)
- Simple length checks (use `minLength()`/`maxLength()`)
- Number ranges (use `min()`/`max()`)

### Common Patterns

| Format | Pattern | Example |
|  --|   |   |
| US Phone | `/^\d{3}-\d{3}-\d{4}$/` | 123-456-7890 |
| US Zip | `/^\d{5}(-\d{4})?$/` | 12345 or 12345-6789 |
| Hex Color | `/^#[0-9A-F]{6}$/i` | #FF0000 |
| Username | `/^[a-zA-Z0-9_]{3,15}$/` | john_doe123 |
| SSN | `/^\d{3}-\d{2}-\d{4}$/` | 123-45-6789 |
| Date (ISO) | `/^\d{4}-\d{2}-\d{2}$/` | 2024-01-15 |
| Slug | `/^[a-z0-9-]+$/` | my-blog-post |

### Related Validators

- **`Validators.email()`** - Built-in email pattern
- **`Validators.custom()`** - Complex validation logic
- **`Validators.combine()`** - Multiple validations
- **`Validators.required()`** - Ensure value exists

### One-Line Rule

> **`Validators.pattern(regex, message)` creates a validator that checks if a value matches a custom regular expression pattern, enabling flexible format enforcement for phone numbers, codes, and custom string formats.**

 

**What's Next?**

- Learn regex patterns for common formats
- Combine with auto-formatting on input
- Add visual format hints to users
