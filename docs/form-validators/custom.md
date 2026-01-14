# Validators.custom()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    username: '',
    age: 0,
    website: ''
  },
  {
    username: Forms.v.custom(async (value) => {
      if (!value) return '';

      // Check if username is available
      const response = await fetch(`/api/check-username?u=${value}`);
      const { available } = await response.json();

      return available ? '' : 'Username already taken';
    }),

    age: Forms.v.custom((value, allValues) => {
      if (!value) return '';

      if (value < 13) {
        return 'Must be 13 or older';
      }

      if (value > 100) {
        return 'Please enter a valid age';
      }

      return '';
    })
  }
);
```

**What just happened?** `Validators.custom()` let you create completely custom validation logic - async API calls, complex business rules, anything!

 

## What is Validators.custom()?

`Validators.custom()` is a **wrapper that converts any validation function into a proper validator**.

Simply put, it lets you write any custom validation logic you need, including async operations.

**Key characteristics:**
- ✅ Accepts custom validation function
- ✅ Supports async/await
- ✅ Access to all form values
- ✅ Unlimited flexibility
- ✅ Perfect for business logic

 

## Syntax

```javascript
// Synchronous custom validator
const validator = Forms.v.custom((value, allValues) => {
  if (/* invalid */) {
    return 'Error message';
  }
  return '';
});

// Async custom validator
const validator = Forms.v.custom(async (value, allValues) => {
  const result = await apiCall(value);
  return result.valid ? '' : result.message;
});

// Use in form
const form = Forms.create(
  { field: '' },
  { field: Forms.v.custom(customValidationFn) }
);
```

**Parameters:**
- `validatorFn` (function) - Custom validation function
  - Receives: `(value, allValues)`
  - Returns: `string` (error message) or `''` (valid)
  - Can be async

**Returns:** `function(value, allValues) => string | Promise<string>` - Validator function

 

## Why Does This Exist?

### The Challenge

Built-in validators don't cover all scenarios:

```javascript
// Need to:
// - Check username availability (API call)
// - Validate based on multiple fields
// - Apply complex business rules
// - Use external services

// ❌ Can't use built-in validators for these
```

### The Solution

```javascript
// ✅ custom() enables any validation logic
const form = Forms.create(
  { username: '' },
  {
    username: Forms.v.custom(async (value) => {
      if (!value) return '';

      const available = await checkUsernameAvailability(value);
      return available ? '' : 'Username taken';
    })
  }
);
```

 

## How Does It Work?

```javascript
function custom(validatorFn) {
  // Simply returns the validator function
  // Reactive system handles calling it
  return validatorFn;
}

// It's just a pass-through for clarity
// You could use the function directly, but custom() makes intent clear
```

 

## Basic Usage

### Example 1: Username Availability Check

```javascript
async function checkUsername(value) {
  if (!value) return '';

  const response = await fetch(`/api/check-username?username=${value}`);
  const { available } = await response.json();

  return available ? '' : 'Username already taken';
}

const form = Forms.create(
  { username: '' },
  { username: Forms.v.custom(checkUsername) }
);
```

 

### Example 2: Complex Age Validation

```javascript
const form = Forms.create(
  { age: 0 },
  {
    age: Forms.v.custom((value) => {
      if (!value) return '';

      if (value < 0) return 'Age cannot be negative';
      if (value < 13) return 'Must be 13 or older';
      if (value > 120) return 'Please enter a valid age';

      return '';
    })
  }
);
```

 

### Example 3: Cross-Field Validation

```javascript
const form = Forms.create(
  {
    startDate: '',
    endDate: ''
  },
  {
    endDate: Forms.v.custom((value, allValues) => {
      if (!value || !allValues.startDate) return '';

      const start = new Date(allValues.startDate);
      const end = new Date(value);

      if (end <= start) {
        return 'End date must be after start date';
      }

      return '';
    })
  }
);
```

 

### Example 4: Business Rule Validation

```javascript
const form = Forms.create(
  {
    orderAmount: 0,
    couponCode: ''
  },
  {
    couponCode: Forms.v.custom((value, allValues) => {
      if (!value) return '';

      const amount = allValues.orderAmount;

      if (value === 'SAVE20' && amount < 100) {
        return 'This coupon requires minimum $100 order';
      }

      if (value === 'PREMIUM' && !isPremiumUser()) {
        return 'This coupon is for premium members only';
      }

      return '';
    })
  }
);
```

 

### Example 5: External API Validation

```javascript
const form = Forms.create(
  { zipCode: '' },
  {
    zipCode: Forms.v.custom(async (value) => {
      if (!value) return '';

      try {
        const response = await fetch(`/api/validate-zip?zip=${value}`);
        const data = await response.json();

        return data.valid ? '' : 'Invalid zip code for delivery';
      } catch (error) {
        return 'Unable to validate zip code';
      }
    })
  }
);
```

 

## Advanced Patterns

### Pattern 1: Debounced API Validation

```javascript
function createDebouncedValidator(asyncFn, delay = 500) {
  let timeout;
  let lastValue = null;
  let lastResult = '';

  return async (value, allValues) => {
    if (!value) return '';

    // Return cached result for same value
    if (value === lastValue) {
      return lastResult;
    }

    return new Promise((resolve) => {
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        lastValue = value;
        lastResult = await asyncFn(value, allValues);
        resolve(lastResult);
      }, delay);
    });
  };
}

const form = Forms.create(
  { username: '' },
  {
    username: Forms.v.custom(
      createDebouncedValidator(async (value) => {
        const response = await fetch(`/api/check-username?u=${value}`);
        const { available } = await response.json();
        return available ? '' : 'Username taken';
      }, 1000)
    )
  }
);
```

 

### Pattern 2: Cached Validation Results

```javascript
const validationCache = new Map();

function createCachedValidator(asyncFn, ttl = 60000) {
  return async (value, allValues) => {
    if (!value) return '';

    const cacheKey = JSON.stringify({ value, allValues });
    const cached = validationCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result;
    }

    const result = await asyncFn(value, allValues);

    validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  };
}

const form = Forms.create(
  { email: '' },
  {
    email: Forms.v.custom(
      createCachedValidator(async (value) => {
        const response = await fetch(`/api/check-email?email=${value}`);
        const { exists } = await response.json();
        return exists ? 'Email already registered' : '';
      })
    )
  }
);
```

 

### Pattern 3: Multi-Step Validation

```javascript
const form = Forms.create(
  { password: '' },
  {
    password: Forms.v.custom((value) => {
      if (!value) return '';

      // Step 1: Length check
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }

      // Step 2: Uppercase check
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain an uppercase letter';
      }

      // Step 3: Lowercase check
      if (!/[a-z]/.test(value)) {
        return 'Password must contain a lowercase letter';
      }

      // Step 4: Number check
      if (!/\d/.test(value)) {
        return 'Password must contain a number';
      }

      // Step 5: Special char check
      if (!/[@$!%*?&]/.test(value)) {
        return 'Password must contain a special character';
      }

      return '';
    })
  }
);
```

 

### Pattern 4: Conditional Validation

```javascript
const form = Forms.create(
  {
    accountType: 'personal',
    taxId: '',
    companyName: ''
  },
  {
    taxId: Forms.v.custom((value, allValues) => {
      // Only required for business accounts
      if (allValues.accountType !== 'business') {
        return '';
      }

      if (!value) {
        return 'Tax ID required for business accounts';
      }

      if (!/^\d{9}$/.test(value)) {
        return 'Tax ID must be 9 digits';
      }

      return '';
    }),

    companyName: Forms.v.custom((value, allValues) => {
      if (allValues.accountType !== 'business') {
        return '';
      }

      if (!value) {
        return 'Company name required for business accounts';
      }

      return '';
    })
  }
);
```

 

### Pattern 5: Composite Validator

```javascript
function createCompositeValidator(...validators) {
  return async (value, allValues) => {
    for (const validator of validators) {
      const error = await validator(value, allValues);
      if (error) return error;
    }
    return '';
  };
}

const form = Forms.create(
  { email: '' },
  {
    email: Forms.v.custom(
      createCompositeValidator(
        // Check format
        (value) => {
          return Forms.v.email('Invalid email format')(value);
        },
        // Check domain
        (value) => {
          const domain = value.split('@')[1];
          const allowedDomains = ['company.com', 'company.co.uk'];

          if (!allowedDomains.includes(domain)) {
            return 'Must use company email';
          }

          return '';
        },
        // Check availability
        async (value) => {
          const response = await fetch(`/api/check-email?email=${value}`);
          const { exists } = await response.json();
          return exists ? 'Email already registered' : '';
        }
      )
    )
  }
);
```

 

### Pattern 6: Validation with External Services

```javascript
const form = Forms.create(
  { address: '' },
  {
    address: Forms.v.custom(async (value) => {
      if (!value) return '';

      try {
        // Validate with Google Maps API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(value)}&key=${API_KEY}`
        );

        const data = await response.json();

        if (data.status !== 'OK') {
          return 'Invalid address. Please enter a valid address.';
        }

        // Check if address is in delivery zone
        const { lat, lng } = data.results[0].geometry.location;

        if (!isInDeliveryZone(lat, lng)) {
          return 'Sorry, we don\'t deliver to this address';
        }

        return '';
      } catch (error) {
        return 'Unable to validate address';
      }
    })
  }
);
```

 

### Pattern 7: Luhn Algorithm (Credit Card)

```javascript
function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

const form = Forms.create(
  { cardNumber: '' },
  {
    cardNumber: Forms.v.custom((value) => {
      if (!value) return '';

      const cleaned = value.replace(/\D/g, '');

      if (cleaned.length < 13 || cleaned.length > 19) {
        return 'Invalid card number length';
      }

      if (!luhnCheck(cleaned)) {
        return 'Invalid card number';
      }

      return '';
    })
  }
);
```

 

### Pattern 8: File Validation

```javascript
const form = Forms.create(
  { resume: null },
  {
    resume: Forms.v.custom((file) => {
      if (!file) return '';

      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        return 'Only PDF and DOC files allowed';
      }

      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return 'File size must be less than 5MB';
      }

      // Check filename
      if (!/^[a-zA-Z0-9_\-\.]+$/.test(file.name)) {
        return 'Invalid filename. Use only letters, numbers, dash, and underscore';
      }

      return '';
    })
  }
);
```

 

### Pattern 9: Rate Limiting Validator

```javascript
function createRateLimitedValidator(asyncFn, maxRequests = 5, window = 60000) {
  const requests = [];

  return async (value, allValues) => {
    if (!value) return '';

    // Clean old requests
    const now = Date.now();
    while (requests.length > 0 && now - requests[0] > window) {
      requests.shift();
    }

    // Check rate limit
    if (requests.length >= maxRequests) {
      return 'Too many validation attempts. Please try again later.';
    }

    requests.push(now);

    return await asyncFn(value, allValues);
  };
}

const form = Forms.create(
  { promocode: '' },
  {
    promocode: Forms.v.custom(
      createRateLimitedValidator(async (value) => {
        const response = await fetch(`/api/validate-promo?code=${value}`);
        const { valid } = await response.json();
        return valid ? '' : 'Invalid promo code';
      }, 5, 60000) // Max 5 attempts per minute
    )
  }
);
```

 

### Pattern 10: Chained Async Validators

```javascript
const form = Forms.create(
  { domain: '' },
  {
    domain: Forms.v.custom(async (value) => {
      if (!value) return '';

      // Step 1: Format check
      if (!/^[a-z0-9-]+\.[a-z]{2,}$/i.test(value)) {
        return 'Invalid domain format';
      }

      // Step 2: DNS check
      try {
        const dnsResponse = await fetch(`/api/check-dns?domain=${value}`);
        const { exists } = await dnsResponse.json();

        if (!exists) {
          return 'Domain does not exist';
        }
      } catch {
        return 'Unable to verify domain';
      }

      // Step 3: Availability check
      try {
        const availResponse = await fetch(`/api/check-domain-available?domain=${value}`);
        const { available } = await availResponse.json();

        if (!available) {
          return 'Domain already in use';
        }
      } catch {
        return 'Unable to check domain availability';
      }

      return '';
    })
  }
);
```

 

## Common Pitfalls

### Pitfall 1: Not Handling Empty Values

```javascript
// ❌ Throws error on empty
Forms.v.custom((value) => {
  return value.length > 5 ? '' : 'Too short';
  // TypeError if value is undefined/null
});

// ✅ Check for empty first
Forms.v.custom((value) => {
  if (!value) return '';
  return value.length > 5 ? '' : 'Too short';
});
```

 

### Pitfall 2: Not Handling Async Errors

```javascript
// ❌ Unhandled promise rejection
Forms.v.custom(async (value) => {
  const response = await fetch(`/api/check?v=${value}`);
  const { valid } = await response.json();
  // What if fetch fails?
  return valid ? '' : 'Invalid';
});

// ✅ Handle errors
Forms.v.custom(async (value) => {
  try {
    const response = await fetch(`/api/check?v=${value}`);
    const { valid } = await response.json();
    return valid ? '' : 'Invalid';
  } catch (error) {
    return 'Validation failed. Please try again.';
  }
});
```

 

### Pitfall 3: Forgetting to Return Empty String

```javascript
// ❌ Returns undefined when valid
Forms.v.custom((value) => {
  if (value.length < 5) {
    return 'Too short';
  }
  // Missing return ''
});

// ✅ Always return empty string for valid
Forms.v.custom((value) => {
  if (!value) return '';
  if (value.length < 5) return 'Too short';
  return ''; // Explicitly return empty string
});
```

 

### Pitfall 4: Not Debouncing API Calls

```javascript
// ❌ API call on every keystroke
Forms.v.custom(async (value) => {
  const response = await fetch(`/api/check?v=${value}`);
  // Hundreds of API calls!
});

// ✅ Use debouncing
Forms.v.custom(
  createDebouncedValidator(async (value) => {
    const response = await fetch(`/api/check?v=${value}`);
    // ...
  }, 500)
);
```

 

### Pitfall 5: Blocking UI on Slow Validation

```javascript
// ❌ No loading indicator
Forms.v.custom(async (value) => {
  const result = await slowApiCall(value);
  // User sees nothing while waiting
  return result;
});

// ✅ Show loading state
const form = Forms.create({ field: '' });

let isValidating = false;

Forms.v.custom(async (value) => {
  if (!value) return '';

  isValidating = true;
  loadingIndicator.style.display = 'block';

  try {
    const result = await slowApiCall(value);
    return result;
  } finally {
    isValidating = false;
    loadingIndicator.style.display = 'none';
  }
});
```

 

## Summary

### Key Takeaways

1. **Unlimited flexibility** - create any validation logic
2. **Supports async** - API calls, external services
3. **Access all form values** - cross-field validation
4. **Same function signature** - `(value, allValues) => string | Promise<string>`
5. **Perfect for business rules** - complex, domain-specific validation

### When to Use custom()

✅ **Use for:**
- API validation (username, email availability)
- Complex business rules
- Cross-field validation
- External service integration
- File validation
- Custom algorithms

❌ **Don't use when:**
- Built-in validator exists (use that instead)
- Simple validation (use pattern, min, max, etc.)
- No custom logic needed

### Related Validators

- **`Validators.combine()`** - Combine multiple validators
- **All built-in validators** - Use when possible
- **Direct function** - custom() is just a wrapper for clarity

### One-Line Rule

> **`Validators.custom(fn)` wraps any custom validation function - synchronous or async - enabling unlimited validation logic including API calls, complex business rules, and external service integration.**

 

**What's Next?**

- Implement debouncing for async validators
- Add caching for expensive operations
- Create reusable custom validators
