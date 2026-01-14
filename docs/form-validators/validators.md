# Forms.validators

## Quick Start (30 seconds)

```javascript
// Access built-in validators
const { validators } = Forms;

// Use in your form
const signupForm = Forms.create(
  {
    email: '',
    password: '',
    age: ''
  },
  {
    validators: {
      email: validators.email('Please enter a valid email'),
      password: validators.minLength(8, 'Password must be at least 8 characters'),
      age: validators.min(18, 'Must be 18 or older')
    }
  }
);

// Test it
signupForm.setValue('email', 'invalid');
console.log(signupForm.errors.email);
// "Please enter a valid email"

signupForm.setValue('email', 'user@example.com');
console.log(signupForm.errors.email);
// undefined ✅
```

**What just happened?** You used pre-built validators instead of writing validation logic yourself. `Forms.validators` provides ready-to-use validation functions!

 

## What is Forms.validators?

`Forms.validators` is an **object containing pre-built validation functions** that you can use in your forms.

Simply put, instead of writing validation logic from scratch every time, you can use these ready-made validators for common scenarios like:
- Required fields
- Email format
- Password strength
- Number ranges
- Pattern matching
- Cross-field validation

Think of `Forms.validators` as a **toolbox of validation tools**. Just like you wouldn't build a hammer every time you need to hang a picture, you shouldn't write the same email validator every time you need one!

 

## Syntax

### Accessing Validators

```javascript
// From Forms namespace
Forms.validators.required('This field is required')
Forms.validators.email('Invalid email format')
Forms.validators.minLength(5, 'Too short')

// Shorthand alias
Forms.v.required('This field is required')
Forms.v.email('Invalid email')

// From ReactiveUtils (if available)
ReactiveUtils.validators.required('Required')
```

### Common Pattern

```javascript
const form = Forms.create(
  { fieldName: '' },
  {
    validators: {
      fieldName: Forms.validators.validatorName(options)
    }
  }
);
```

 

## Why Does This Exist?

### The Problem with Writing Validators from Scratch

Let's say you need to validate an email field:

```javascript
// Manual email validation (repetitive!)
const loginForm = Forms.create(
  { email: '' },
  {
    validators: {
      email: (value) => {
        if (!value) return 'Email is required';

        // Write regex yourself
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Invalid email format';
        }

        return null;
      }
    }
  }
);

// Now you need another email validator in a different form
const signupForm = Forms.create(
  { email: '' },
  {
    validators: {
      email: (value) => {
        // Copy-paste the same logic again? 😫
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Invalid email format';
        }
        return null;
      }
    }
  }
);
```

**What's the Real Issue?**

```
Write validation logic
         ↓
Copy-paste to other forms
         ↓
Inconsistent regex patterns
         ↓
Hard to maintain
         ↓
Bugs everywhere
```

**Problems:**
❌ Copy-pasting validation logic across forms
❌ Inconsistent validation rules
❌ Hard to update (change in 10 places)
❌ Easy to make mistakes with regex
❌ Verbose and repetitive code

### The Solution with Forms.validators

```javascript
// Use built-in validators (clean!)
const loginForm = Forms.create(
  { email: '' },
  {
    validators: {
      email: Forms.validators.email('Invalid email')
    }
  }
);

// Reuse in another form - same consistent logic
const signupForm = Forms.create(
  { email: '' },
  {
    validators: {
      email: Forms.validators.email('Please enter a valid email')
    }
  }
);

// Need to combine with required? Easy!
const contactForm = Forms.create(
  { email: '' },
  {
    validators: {
      email: Forms.validators.combine(
        Forms.validators.required('Email is required'),
        Forms.validators.email('Invalid email format')
      )
    }
  }
);
```

**What Just Happened?**

```
Forms.validators
       ↓
Pre-built functions
       ↓
Reusable validation
       ↓
Consistent across forms
       ↓
Easy to maintain
```

**Benefits:**
✅ No more copy-pasting validation logic
✅ Consistent validation rules everywhere
✅ One place to update if logic changes
✅ Battle-tested regex patterns
✅ Concise, readable code
✅ Easy to combine multiple validators

 

## Mental Model

Think of `Forms.validators` like a **hardware store** for validation:

### Without Forms.validators (DIY Store)
```
You: "I need to validate an email"
DIY Store: "Here's some metal and tools. Build your own validator!"
You: *Spends 30 minutes crafting a regex*
You: "Now I need another email validator for a different form..."
DIY Store: "Build it again from scratch!"
You: 😫
```

### With Forms.validators (Hardware Store)
```
You: "I need to validate an email"
Hardware Store: "Here's a pre-made email validator, ready to use!"
You: Forms.validators.email('Invalid email')
You: "Perfect! I need another one."
Hardware Store: "Use the same one! It's reusable."
You: 😊
```

**Key Insight:** `Forms.validators` provides **ready-made, tested, reusable validation tools** instead of making you build them from scratch every time.

 

## How Does It Work?

### Validator Factory Pattern

Each validator is a **factory function** that returns a validator function:

```javascript
// This is what happens internally:

Forms.validators.minLength = function(min, message) {
  // Factory function - returns a validator
  return function(value) {
    // Actual validator function
    if (!value) return null; // Skip if empty

    const msg = message || `Must be at least ${min} characters`;
    return value.length >= min ? null : msg;
  };
};
```

### Visual Flow

```
Forms.validators.minLength(8, 'Too short')
         ↓
   Factory Function Called
         ↓
   Returns Validator Function
         ↓
   (value) => { /* validation logic */ }
         ↓
   Used in form definition
```

 

## Built-in Validators

### Complete List

| Validator | Purpose | Example |
|   --|   |   |
| `required(message)` | Ensure field has a value | `validators.required('Required')` |
| `email(message)` | Validate email format | `validators.email('Invalid email')` |
| `minLength(min, message)` | Minimum string length | `validators.minLength(5, 'Too short')` |
| `maxLength(max, message)` | Maximum string length | `validators.maxLength(20, 'Too long')` |
| `min(min, message)` | Minimum numeric value | `validators.min(18, 'Must be 18+')` |
| `max(max, message)` | Maximum numeric value | `validators.max(100, 'Too high')` |
| `pattern(regex, message)` | Match regex pattern | `validators.pattern(/^\d+$/, 'Numbers only')` |
| `match(fieldName, message)` | Match another field | `validators.match('password', 'Passwords must match')` |
| `custom(validatorFn)` | Use custom logic | `validators.custom((v) => /* logic */)` |
| `combine(...validators)` | Combine multiple validators | `validators.combine(v1, v2, v3)` |

 

## Deep Dive: Each Validator

### validators.required()

Ensures a field has a value (not empty, not null, not undefined).

**Signature:**
```javascript
validators.required(message = 'This field is required')
```

**Examples:**

```javascript
// Basic usage
const form = Forms.create(
  { username: '' },
  {
    validators: {
      username: Forms.validators.required('Username is required')
    }
  }
);

form.setValue('username', '');
console.log(form.errors.username);
// "Username is required"

form.setValue('username', 'alice');
console.log(form.errors.username);
// undefined ✅
```

```javascript
// Works with different types
const form = Forms.create(
  {
    text: '',
    number: '',
    checkbox: false
  },
  {
    validators: {
      text: Forms.validators.required('Required'),
      number: Forms.validators.required('Required'),
      checkbox: Forms.validators.required('You must agree')
    }
  }
);

// Empty string
form.setValue('text', '');
console.log(form.hasError('text')); // true

// Whitespace-only (trimmed)
form.setValue('text', '   ');
console.log(form.hasError('text')); // true

// Valid
form.setValue('text', 'hello');
console.log(form.hasError('text')); // false

// Checkbox (falsy value)
form.setValue('checkbox', false);
console.log(form.hasError('checkbox')); // true

form.setValue('checkbox', true);
console.log(form.hasError('checkbox')); // false
```

**What it checks:**
- Empty string (`''`)
- Whitespace-only string (`'   '`)
- `null`
- `undefined`
- Falsy values (for checkboxes)

 

### validators.email()

Validates email format using regex.

**Signature:**
```javascript
validators.email(message = 'Invalid email address')
```

**Examples:**

```javascript
const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: Forms.validators.email('Please enter a valid email')
    }
  }
);

// Invalid formats
form.setValue('email', 'notanemail');
console.log(form.errors.email);
// "Please enter a valid email"

form.setValue('email', 'missing@domain');
console.log(form.errors.email);
// "Please enter a valid email"

form.setValue('email', '@example.com');
console.log(form.errors.email);
// "Please enter a valid email"

// Valid formats
form.setValue('email', 'user@example.com');
console.log(form.errors.email);
// undefined ✅

form.setValue('email', 'user.name+tag@example.co.uk');
console.log(form.errors.email);
// undefined ✅
```

**Regex used:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**What it checks:**
- Has at least one character before `@`
- Has `@` symbol
- Has at least one character after `@`
- Has a `.` with at least one character after it
- No whitespace anywhere

**Note:** Returns `null` if value is empty (use `required` to enforce presence).

 

### validators.minLength()

Validates minimum string length.

**Signature:**
```javascript
validators.minLength(min, message)
```

**Examples:**

```javascript
const form = Forms.create(
  {
    username: '',
    password: ''
  },
  {
    validators: {
      username: Forms.validators.minLength(3, 'Username must be at least 3 characters'),
      password: Forms.validators.minLength(8)
      // Default message: "Must be at least 8 characters"
    }
  }
);

// Too short
form.setValue('username', 'ab');
console.log(form.errors.username);
// "Username must be at least 3 characters"

// Just right
form.setValue('username', 'abc');
console.log(form.errors.username);
// undefined ✅

// Longer is fine
form.setValue('username', 'alice123');
console.log(form.errors.username);
// undefined ✅
```

**What it checks:**
- `value.length >= min`
- Returns `null` if value is empty (combine with `required` if needed)

 

### validators.maxLength()

Validates maximum string length.

**Signature:**
```javascript
validators.maxLength(max, message)
```

**Examples:**

```javascript
const form = Forms.create(
  {
    bio: '',
    tweet: ''
  },
  {
    validators: {
      bio: Forms.validators.maxLength(500, 'Bio must be 500 characters or less'),
      tweet: Forms.validators.maxLength(280)
      // Default message: "Must be no more than 280 characters"
    }
  }
);

// Too long
const longBio = 'a'.repeat(501);
form.setValue('bio', longBio);
console.log(form.errors.bio);
// "Bio must be 500 characters or less"

// Just right
const goodBio = 'a'.repeat(500);
form.setValue('bio', goodBio);
console.log(form.errors.bio);
// undefined ✅

// Shorter is fine
form.setValue('bio', 'Hello');
console.log(form.errors.bio);
// undefined ✅
```

**What it checks:**
- `value.length <= max`
- Returns `null` if value is empty

 

### validators.min()

Validates minimum numeric value.

**Signature:**
```javascript
validators.min(min, message)
```

**Examples:**

```javascript
const form = Forms.create(
  {
    age: '',
    price: '',
    quantity: ''
  },
  {
    validators: {
      age: Forms.validators.min(18, 'Must be 18 or older'),
      price: Forms.validators.min(0, 'Price cannot be negative'),
      quantity: Forms.validators.min(1)
      // Default message: "Must be at least 1"
    }
  }
);

// Too low
form.setValue('age', '17');
console.log(form.errors.age);
// "Must be 18 or older"

// Just right
form.setValue('age', '18');
console.log(form.errors.age);
// undefined ✅

// Higher is fine
form.setValue('age', '25');
console.log(form.errors.age);
// undefined ✅

// Handles decimals
form.setValue('price', '9.99');
console.log(form.errors.price);
// undefined ✅
```

**What it checks:**
- Converts value to number: `Number(value)`
- Checks: `Number(value) >= min`
- Returns `null` if value is empty or `null`

 

### validators.max()

Validates maximum numeric value.

**Signature:**
```javascript
validators.max(max, message)
```

**Examples:**

```javascript
const form = Forms.create(
  {
    age: '',
    percentage: '',
    quantity: ''
  },
  {
    validators: {
      age: Forms.validators.max(120, 'Age must be realistic'),
      percentage: Forms.validators.max(100, 'Cannot exceed 100%'),
      quantity: Forms.validators.max(999)
      // Default message: "Must be no more than 999"
    }
  }
);

// Too high
form.setValue('age', '150');
console.log(form.errors.age);
// "Age must be realistic"

// Just right
form.setValue('age', '120');
console.log(form.errors.age);
// undefined ✅

// Lower is fine
form.setValue('age', '30');
console.log(form.errors.age);
// undefined ✅
```

**What it checks:**
- Converts value to number: `Number(value)`
- Checks: `Number(value) <= max`
- Returns `null` if value is empty or `null`

 

### validators.pattern()

Validates against a regex pattern.

**Signature:**
```javascript
validators.pattern(regex, message = 'Invalid format')
```

**Examples:**

```javascript
const form = Forms.create(
  {
    zipCode: '',
    phoneNumber: '',
    hexColor: ''
  },
  {
    validators: {
      zipCode: Forms.validators.pattern(/^\d{5}$/, 'ZIP code must be 5 digits'),
      phoneNumber: Forms.validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Format: 123-456-7890'),
      hexColor: Forms.validators.pattern(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    }
  }
);

// Invalid patterns
form.setValue('zipCode', '1234'); // Too short
console.log(form.errors.zipCode);
// "ZIP code must be 5 digits"

form.setValue('phoneNumber', '1234567890'); // Missing dashes
console.log(form.errors.phoneNumber);
// "Format: 123-456-7890"

// Valid patterns
form.setValue('zipCode', '12345');
console.log(form.errors.zipCode);
// undefined ✅

form.setValue('phoneNumber', '555-123-4567');
console.log(form.errors.phoneNumber);
// undefined ✅

form.setValue('hexColor', '#FF5733');
console.log(form.errors.hexColor);
// undefined ✅
```

**What it checks:**
- Tests value against regex: `regex.test(value)`
- Returns `null` if value is empty

 

### validators.match()

Validates that a field matches another field's value (useful for password confirmation).

**Signature:**
```javascript
validators.match(fieldName, message)
```

**Examples:**

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: '',
    email: '',
    confirmEmail: ''
  },
  {
    validators: {
      confirmPassword: Forms.validators.match('password', 'Passwords must match'),
      confirmEmail: Forms.validators.match('email')
      // Default message: "Must match email"
    }
  }
);

// Set password
form.setValue('password', 'secret123');

// Mismatched confirmation
form.setValue('confirmPassword', 'secret456');
console.log(form.errors.confirmPassword);
// "Passwords must match"

// Matched confirmation
form.setValue('confirmPassword', 'secret123');
console.log(form.errors.confirmPassword);
// undefined ✅

// Works with email too
form.setValue('email', 'user@example.com');
form.setValue('confirmEmail', 'user@example.com');
console.log(form.errors.confirmEmail);
// undefined ✅
```

**What it checks:**
- Compares `value === allValues[fieldName]`
- Receives all form values as second parameter
- Returns `null` if values match

 

### validators.custom()

Wraps a custom validator function (for consistency).

**Signature:**
```javascript
validators.custom(validatorFn)
```

**Examples:**

```javascript
const form = Forms.create(
  {
    username: '',
    couponCode: ''
  },
  {
    validators: {
      username: Forms.validators.custom((value) => {
        if (!value) return null; // Optional field

        // Custom rule: No spaces allowed
        if (value.includes(' ')) {
          return 'Username cannot contain spaces';
        }

        // Custom rule: Must start with letter
        if (!/^[a-zA-Z]/.test(value)) {
          return 'Username must start with a letter';
        }

        return null;
      }),

      couponCode: Forms.validators.custom((value, allValues) => {
        if (!value) return null;

        // Access other fields
        const validCoupons = ['SAVE20', 'WELCOME', 'VIP'];

        if (!validCoupons.includes(value.toUpperCase())) {
          return 'Invalid coupon code';
        }

        return null;
      })
    }
  }
);

form.setValue('username', 'alice smith'); // Has space
console.log(form.errors.username);
// "Username cannot contain spaces"

form.setValue('username', '123alice'); // Starts with number
console.log(form.errors.username);
// "Username must start with a letter"

form.setValue('username', 'alice');
console.log(form.errors.username);
// undefined ✅
```

**What it does:**
- Simply returns your custom validator function
- Mainly for consistency when mixing built-in and custom validators
- Your function receives `(value, allValues)` parameters

 

### validators.combine()

Combines multiple validators into one, running them in sequence and returning the first error.

**Signature:**
```javascript
validators.combine(...validators)
```

**Examples:**

```javascript
const { validators: v } = Forms;

const form = Forms.create(
  {
    password: '',
    username: '',
    email: ''
  },
  {
    validators: {
      // Combine required + minLength
      password: v.combine(
        v.required('Password is required'),
        v.minLength(8, 'Password must be at least 8 characters')
      ),

      // Combine required + minLength + maxLength
      username: v.combine(
        v.required('Username is required'),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(20, 'Username must be no more than 20 characters')
      ),

      // Combine required + email
      email: v.combine(
        v.required('Email is required'),
        v.email('Invalid email format')
      )
    }
  }
);

// Empty password - fails first validator
form.setValue('password', '');
console.log(form.errors.password);
// "Password is required"

// Short password - passes required, fails minLength
form.setValue('password', 'abc');
console.log(form.errors.password);
// "Password must be at least 8 characters"

// Valid password - passes all
form.setValue('password', 'secret123');
console.log(form.errors.password);
// undefined ✅
```

**How it works:**
```javascript
// Internally:
function combine(...validators) {
  return (value, allValues) => {
    for (const validator of validators) {
      const error = validator(value, allValues);
      if (error) return error; // Return first error found
    }
    return null; // All passed
  };
}
```

**Order matters:**
```javascript
// Check required BEFORE minLength
v.combine(
  v.required('Required'),
  v.minLength(5, 'Too short')
)
// ✅ Good: Shows "Required" for empty, "Too short" for short

v.combine(
  v.minLength(5, 'Too short'),
  v.required('Required')
)
// ❌ Bad: Shows "Too short" for empty (confusing!)
```

 

## Combining Validators

### Basic Combination

```javascript
const { validators: v } = Forms;

const form = Forms.create(
  { field: '' },
  {
    validators: {
      field: v.combine(
        v.required('Required'),
        v.minLength(5, 'Min 5 chars'),
        v.maxLength(20, 'Max 20 chars')
      )
    }
  }
);
```

 

### Complex Combination with Custom Logic

```javascript
const { validators: v } = Forms;

const form = Forms.create(
  {
    username: '',
    password: '',
    confirmPassword: ''
  },
  {
    validators: {
      username: v.combine(
        v.required('Username required'),
        v.minLength(3, 'Min 3 chars'),
        v.maxLength(20, 'Max 20 chars'),
        v.pattern(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscore only')
      ),

      password: v.combine(
        v.required('Password required'),
        v.minLength(8, 'Min 8 chars'),
        v.custom((value) => {
          // Custom: Must contain at least one number
          if (!/\d/.test(value)) {
            return 'Password must contain at least one number';
          }
          return null;
        }),
        v.custom((value) => {
          // Custom: Must contain at least one uppercase letter
          if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
          }
          return null;
        })
      ),

      confirmPassword: v.combine(
        v.required('Confirmation required'),
        v.match('password', 'Passwords must match')
      )
    }
  }
);
```

 

## Custom Validators

### Creating Reusable Custom Validators

```javascript
// Define custom validators
const myValidators = {
  // URL validator
  url: (message = 'Invalid URL') => (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },

  // Phone number validator (US format)
  phone: (message = 'Invalid phone number') => (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10 ? null : message;
  },

  // Strong password validator
  strongPassword: (message = 'Password not strong enough') => (value) => {
    if (!value) return null;

    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const isLongEnough = value.length >= 12;

    if (hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough) {
      return null;
    }

    return message;
  }
};

// Use them
const form = Forms.create(
  {
    website: '',
    phone: '',
    password: ''
  },
  {
    validators: {
      website: myValidators.url('Please enter a valid URL'),
      phone: myValidators.phone('Phone must be 10 digits'),
      password: Forms.validators.combine(
        Forms.validators.required('Required'),
        myValidators.strongPassword('Password must have lowercase, uppercase, number, special char, and 12+ characters')
      )
    }
  }
);
```

 

## Advanced Patterns

### Pattern 1: Conditional Validation

```javascript
const form = Forms.create(
  {
    shippingMethod: 'pickup',
    shippingAddress: ''
  },
  {
    validators: {
      shippingAddress: (value, allValues) => {
        // Only validate if shipping method is 'delivery'
        if (allValues.shippingMethod !== 'delivery') {
          return null; // Not required for pickup
        }

        // Required for delivery
        if (!value) {
          return 'Shipping address is required for delivery';
        }

        if (value.length < 10) {
          return 'Please enter a complete address';
        }

        return null;
      }
    }
  }
);

// Pickup - address not required
form.setValue('shippingMethod', 'pickup');
form.setValue('shippingAddress', '');
console.log(form.isValid); // true ✅

// Delivery - address required
form.setValue('shippingMethod', 'delivery');
console.log(form.isValid); // false ❌
console.log(form.errors.shippingAddress);
// "Shipping address is required for delivery"
```

 

### Pattern 2: Async Validation (Manual)

```javascript
const { validators: v } = Forms;

const form = Forms.create(
  { username: '' },
  {
    validators: {
      username: v.combine(
        v.required('Required'),
        v.minLength(3, 'Too short')
      )
    }
  }
);

// Async check after sync validation
async function checkUsernameAvailability(username) {
  // Only check if sync validation passed
  if (form.errors.username) {
    return;
  }

  const response = await fetch(`/api/check-username?name=${username}`);
  const { available } = await response.json();

  if (!available) {
    form.setError('username', 'Username is already taken');
  } else {
    form.clearError('username');
  }
}

// Usage
form.setValue('username', 'alice');
// Sync validation happens immediately

// Then do async check
await checkUsernameAvailability('alice');
```

 

### Pattern 3: Reusable Validator Library

```javascript
// validators-library.js
export const extendedValidators = {
  // Credit card number (Luhn algorithm)
  creditCard: (message = 'Invalid credit card') => (value) => {
    if (!value) return null;

    const cleaned = value.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return message;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0 ? null : message;
  },

  // Password strength meter
  passwordStrength: (minStrength, message) => (value) => {
    if (!value) return null;

    let strength = 0;

    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;

    return strength >= minStrength ? null : message;
  }
};

// Use in forms
import { extendedValidators } from './validators-library';

const form = Forms.create(
  { cardNumber: '', password: '' },
  {
    validators: {
      cardNumber: extendedValidators.creditCard('Invalid card number'),
      password: extendedValidators.passwordStrength(4, 'Password too weak (need 4/6 strength)')
    }
  }
);
```

 

## Common Pitfalls

### Pitfall 1: Forgetting to Return a Validator Function

❌ **Wrong:**
```javascript
const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: Forms.validators.email // Missing ()!
    }
  }
);

form.setValue('email', 'invalid');
// Error! validators.email is a factory, not a validator
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: Forms.validators.email() // Call the factory!
    }
  }
);
```

 

### Pitfall 2: Wrong Order in combine()

❌ **Wrong:**
```javascript
const form = Forms.create(
  { field: '' },
  {
    validators: {
      field: Forms.validators.combine(
        Forms.validators.minLength(5, 'Too short'),
        Forms.validators.required('Required')
      )
    }
  }
);

form.setValue('field', '');
console.log(form.errors.field);
// "Too short" (confusing for empty field!)
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { field: '' },
  {
    validators: {
      field: Forms.validators.combine(
        Forms.validators.required('Required'), // Check required FIRST
        Forms.validators.minLength(5, 'Too short')
      )
    }
  }
);

form.setValue('field', '');
console.log(form.errors.field);
// "Required" ✅
```

 

### Pitfall 3: Not Handling Empty Values in Custom Validators

❌ **Wrong:**
```javascript
const customValidator = (value) => {
  // Doesn't handle empty!
  return value.length >= 5 ? null : 'Too short';
  // Crashes if value is undefined or null
};
```

✅ **Correct:**
```javascript
const customValidator = (value) => {
  if (!value) return null; // Handle empty
  return value.length >= 5 ? null : 'Too short';
};
```

 

### Pitfall 4: Incorrect min/max for Strings

❌ **Wrong:**
```javascript
const form = Forms.create(
  { age: '' },
  {
    validators: {
      age: Forms.validators.minLength(18) // WRONG! minLength is for string length
    }
  }
);

form.setValue('age', '25');
// This checks if '25'.length >= 18, which is false!
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { age: '' },
  {
    validators: {
      age: Forms.validators.min(18) // Correct! min is for numeric values
    }
  }
);
```

**Remember:**
- `minLength` / `maxLength` → String length
- `min` / `max` → Numeric value

 

## Summary

### Key Takeaways

1. **`Forms.validators` provides pre-built validation functions** for common use cases like email, required fields, and length checks.

2. **Each validator is a factory function** that returns a validator function - always call them with `()`.

3. **Use `validators.combine()` to chain multiple validators** - they run in order and return the first error.

4. **Built-in validators return `null` for valid values** and a string error message for invalid values.

5. **Most built-in validators skip empty values** - combine with `required()` if the field is mandatory.

6. **`validators.match()` enables cross-field validation** by receiving all form values as the second parameter.

7. **Create custom validators with the same pattern** - return `null` for valid, string for error.

8. **Order matters in `combine()`** - check `required` before other validators for better error messages.

9. **Use shorthand `Forms.v`** instead of `Forms.validators` for less typing.

10. **Validators are reusable** - define once, use across multiple forms for consistency.

### One-Line Rule

> **Use `Forms.validators` to access pre-built, battle-tested validation functions instead of writing the same regex and logic from scratch every time.**

 

**What's Next?**

- Explore individual form methods (`setValue`, `validate`, `submit`)
- Learn about form properties (`isValid`, `isDirty`, `errors`)
- Master advanced validation patterns (async, conditional, cross-field)
- Create your own custom validator library
