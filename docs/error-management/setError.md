# form.setError()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Set a custom error manually
form.setError('email', 'This email is already taken');

console.log(form.errors.email); // 'This email is already taken'
console.log(form.hasErrors); // true
console.log(form.errorFields); // ['email']

// Clear the error
form.setError('email', '');

console.log(form.errors.email); // ''
console.log(form.hasErrors); // false

// Chain multiple error assignments
form
  .setError('email', 'Invalid email')
  .setError('password', 'Too weak');
```

**What just happened?** `setError()` manually sets error messages - perfect for server-side validation or custom checks!

 

## What is form.setError()?

`form.setError()` is the **manual error assignment method** for setting custom validation errors on individual fields.

Simply put, it's how you tell the form "this field has an error" when automatic validation isn't enough.

**Key characteristics:**
- ✅ Sets custom error message for a field
- ✅ Bypasses automatic validators
- ✅ Perfect for server-side validation errors
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Set an error
form.setError(field, errorMessage)

// Clear an error
form.setError(field, '')

// Chain multiple errors
form
  .setError('field1', 'Error 1')
  .setError('field2', 'Error 2');
```

**Parameters:**
- `field` (string) - The name of the field
- `errorMessage` (string) - The error message (empty string clears the error)

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Automatic Validation

Built-in validators run client-side and can't handle server-side checks like:
- Username/email uniqueness
- Database constraints
- External API validation
- Business rules requiring server data

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid format' : ''
    // ❌ Can't check if email exists in database
  }
);

// ✅ setError() handles server-side validation
async function checkEmailAvailability(email) {
  const response = await fetch(`/api/check-email?email=${email}`);
  const { available } = await response.json();

  if (!available) {
    form.setError('email', 'This email is already registered');
  }
}
```

**When to use setError():**
✅ Server-side validation responses
✅ Async validation results
✅ Custom business logic errors
✅ Conditional validation based on external data
✅ Manual error injection for testing

 

## Mental Model

Think of `setError()` as **manual override** for the error system.

### Automatic Validation Flow
```
User types → setValue() → Validator runs → Error set automatically
                              ↓
                    Client-side rules only
```

### Manual Error Setting Flow
```
User submits → Server validates → Response contains error
                                         ↓
                                  setError() → Error displayed
                                         ↓
                              Server-side rules included
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.setError('email', 'This email is taken');

// Here's what happens internally:
1️⃣ Update the errors object
   form.errors.email = 'This email is taken'

2️⃣ Trigger reactive updates
   - form.hasErrors recalculates → true
   - form.isValid recalculates → false
   - form.errorFields updates → includes 'email'

3️⃣ All reactive effects fire
   - Error message UI updates
   - Submit button might disable
   - Field styling changes to error state

4️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
setError('email', 'Email taken')
         ↓
    Update form.errors.email
         ↓
    Reactive properties update:
    - hasErrors → true
    - isValid → false
    - errorFields → ['email', ...]
         ↓
    All effects fire automatically
         ↓
    UI updates (error displays, styling, etc.)
```

 

## Basic Usage

### Example 1: Server-Side Validation

```javascript
const form = Forms.create({
  username: '',
  email: ''
});

async function handleSubmit() {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  if (!response.ok) {
    const { errors } = await response.json();

    // Set server errors
    if (errors.username) {
      form.setError('username', errors.username);
    }
    if (errors.email) {
      form.setError('email', errors.email);
    }

    return;
  }

  console.log('Registration successful!');
}

// Server responds with: { errors: { email: 'Email already exists' } }
// Form now shows: form.errors.email = 'Email already exists'
```

 

### Example 2: Async Field Validation

```javascript
const form = Forms.create({
  username: ''
});

let checkTimeout;

async function checkUsernameAvailability(username) {
  // Clear previous timeout
  clearTimeout(checkTimeout);

  // Debounce the check
  checkTimeout = setTimeout(async () => {
    const response = await fetch(`/api/check-username?username=${username}`);
    const { available } = await response.json();

    if (!available) {
      form.setError('username', 'Username is already taken');
    } else {
      form.setError('username', ''); // Clear error
    }
  }, 500);
}

// Connect to input
usernameInput.addEventListener('input', (e) => {
  form.setValue('username', e.target.value);
  checkUsernameAvailability(e.target.value);
});
```

 

### Example 3: Custom Business Rules

```javascript
const form = Forms.create({
  age: 0,
  parentalConsent: false
});

function validateAge() {
  const age = form.getValue('age');
  const hasConsent = form.getValue('parentalConsent');

  if (age < 18 && !hasConsent) {
    form.setError('parentalConsent', 'Parental consent required for users under 18');
  } else {
    form.setError('parentalConsent', '');
  }
}

// Validate on changes
effect(() => {
  form.getValue('age');
  form.getValue('parentalConsent');
  validateAge();
});
```

 

### Example 4: Clear Errors on Field Change

```javascript
const form = Forms.create({
  email: ''
});

// Set server error
form.setError('email', 'Email already exists');

// Clear error when user modifies the field
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);

  // Clear server error when user types
  form.setError('email', '');
});
```

 

### Example 5: Display Error Messages

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Reactive error display
effect(() => {
  const emailError = form.errors.email;
  const emailErrorEl = document.getElementById('email-error');

  if (emailError) {
    emailErrorEl.textContent = emailError;
    emailErrorEl.style.display = 'block';
  } else {
    emailErrorEl.style.display = 'none';
  }
});

// Later: server returns error
form.setError('email', 'Email format not accepted by our system');
// Error displays automatically
```

 

## Advanced Patterns

### Pattern 1: Multi-Field Cross-Validation

```javascript
const form = Forms.create({
  startDate: '',
  endDate: ''
});

function validateDateRange() {
  const start = new Date(form.getValue('startDate'));
  const end = new Date(form.getValue('endDate'));

  if (start > end) {
    form.setError('endDate', 'End date must be after start date');
  } else {
    form.setError('endDate', '');
  }
}

// Validate whenever dates change
effect(() => {
  form.getValue('startDate');
  form.getValue('endDate');
  validateDateRange();
});
```

 

### Pattern 2: Rate Limiting Error

```javascript
const form = Forms.create({
  email: ''
});

let requestCount = 0;
const MAX_REQUESTS = 5;

async function handleSubmit() {
  requestCount++;

  if (requestCount > MAX_REQUESTS) {
    form.setError('email', 'Too many requests. Please try again later.');
    return;
  }

  // Proceed with submission
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email: form.getValue('email') })
  });

  if (response.ok) {
    requestCount = 0; // Reset on success
  }
}
```

 

### Pattern 3: Conditional Error Based on Other Fields

```javascript
const form = Forms.create({
  paymentMethod: 'credit_card',
  creditCardNumber: '',
  paypalEmail: ''
});

effect(() => {
  const method = form.getValue('paymentMethod');

  if (method === 'credit_card') {
    const cardNumber = form.getValue('creditCardNumber');

    if (!cardNumber) {
      form.setError('creditCardNumber', 'Credit card number required');
    } else {
      form.setError('creditCardNumber', '');
    }

    // Clear PayPal errors
    form.setError('paypalEmail', '');

  } else if (method === 'paypal') {
    const email = form.getValue('paypalEmail');

    if (!email) {
      form.setError('paypalEmail', 'PayPal email required');
    } else {
      form.setError('paypalEmail', '');
    }

    // Clear credit card errors
    form.setError('creditCardNumber', '');
  }
});
```

 

### Pattern 4: Password Strength Validator

```javascript
const form = Forms.create({
  password: ''
});

function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('one special character');
  }

  if (errors.length > 0) {
    form.setError('password', `Password must contain ${errors.join(', ')}`);
  } else {
    form.setError('password', '');
  }
}

passwordInput.addEventListener('input', (e) => {
  const password = e.target.value;
  form.setValue('password', password);
  validatePasswordStrength(password);
});
```

 

### Pattern 5: API Error Mapping

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

async function handleSubmit() {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(form.values)
    });

    if (!response.ok) {
      const data = await response.json();

      // Map API error codes to user-friendly messages
      const errorMap = {
        'EMAIL_EXISTS': 'This email is already registered',
        'USERNAME_TAKEN': 'This username is not available',
        'WEAK_PASSWORD': 'Password is too weak',
        'INVALID_EMAIL': 'Email format is invalid'
      };

      if (data.errors) {
        Object.entries(data.errors).forEach(([field, errorCode]) => {
          const message = errorMap[errorCode] || 'Invalid value';
          form.setError(field, message);
        });
      }

      return;
    }

    console.log('Success!');

  } catch (error) {
    form.setError('email', 'Network error. Please try again.');
  }
}
```

 

### Pattern 6: Real-Time Validation Feedback

```javascript
const form = Forms.create({
  promoCode: ''
});

let validateTimeout;

async function validatePromoCode(code) {
  clearTimeout(validateTimeout);

  if (!code) {
    form.setError('promoCode', '');
    return;
  }

  validateTimeout = setTimeout(async () => {
    // Show loading state
    form.setError('promoCode', 'Validating...');

    const response = await fetch(`/api/validate-promo?code=${code}`);
    const { valid, message } = await response.json();

    if (valid) {
      form.setError('promoCode', ''); // Clear error
      showSuccessMessage('Promo code applied!');
    } else {
      form.setError('promoCode', message || 'Invalid promo code');
    }
  }, 500);
}

promoInput.addEventListener('input', (e) => {
  form.setValue('promoCode', e.target.value);
  validatePromoCode(e.target.value);
});
```

 

### Pattern 7: File Upload Validation

```javascript
const form = Forms.create({
  avatar: null
});

function validateFile(file) {
  if (!file) {
    form.setError('avatar', 'Please select a file');
    return false;
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    form.setError('avatar', 'File size must be less than 5MB');
    return false;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    form.setError('avatar', 'Only JPEG, PNG, and GIF files are allowed');
    return false;
  }

  // All checks passed
  form.setError('avatar', '');
  return true;
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  form.setValue('avatar', file);
  validateFile(file);
});
```

 

### Pattern 8: Dependency Chain Validation

```javascript
const form = Forms.create({
  country: '',
  state: '',
  city: ''
});

effect(() => {
  const country = form.getValue('country');
  const state = form.getValue('state');
  const city = form.getValue('city');

  // Clear all location errors first
  form.setError('country', '');
  form.setError('state', '');
  form.setError('city', '');

  if (!country) {
    form.setError('country', 'Country is required');
    return; // Stop cascade
  }

  if (!state) {
    form.setError('state', 'State is required');
    return; // Stop cascade
  }

  if (!city) {
    form.setError('city', 'City is required');
  }
});
```

 

### Pattern 9: Debounced Uniqueness Check

```javascript
const form = Forms.create({
  companyName: ''
});

let uniquenessCheck;

async function checkCompanyNameUnique(name) {
  clearTimeout(uniquenessCheck);

  if (!name || name.length < 3) {
    form.setError('companyName', '');
    return;
  }

  uniquenessCheck = setTimeout(async () => {
    const response = await fetch(`/api/check-company?name=${encodeURIComponent(name)}`);
    const { unique, suggestions } = await response.json();

    if (!unique) {
      let errorMsg = 'This company name is already registered';

      if (suggestions && suggestions.length > 0) {
        errorMsg += `. Suggestions: ${suggestions.join(', ')}`;
      }

      form.setError('companyName', errorMsg);
    } else {
      form.setError('companyName', '');
    }
  }, 800);
}

companyInput.addEventListener('input', (e) => {
  form.setValue('companyName', e.target.value);
  checkCompanyNameUnique(e.target.value);
});
```

 

### Pattern 10: Error Priority System

```javascript
const form = Forms.create({
  email: ''
});

const errorPriority = {
  required: 1,
  format: 2,
  availability: 3,
  server: 4
};

const currentErrors = {
  email: []
};

function addError(field, type, message) {
  currentErrors[field] = currentErrors[field] || [];
  currentErrors[field].push({ type, message, priority: errorPriority[type] });
  updateDisplayedError(field);
}

function updateDisplayedError(field) {
  const errors = currentErrors[field];

  if (!errors || errors.length === 0) {
    form.setError(field, '');
    return;
  }

  // Show highest priority error
  const highestPriority = errors.reduce((prev, curr) =>
    prev.priority < curr.priority ? prev : curr
  );

  form.setError(field, highestPriority.message);
}

function clearErrorType(field, type) {
  if (currentErrors[field]) {
    currentErrors[field] = currentErrors[field].filter(e => e.type !== type);
    updateDisplayedError(field);
  }
}

// Usage:
addError('email', 'required', 'Email is required');
addError('email', 'format', 'Invalid email format');
// Shows: 'Email is required' (higher priority)

clearErrorType('email', 'required');
// Now shows: 'Invalid email format'
```

 

## Common Pitfalls

### Pitfall 1: Forgetting to Clear Errors

```javascript
const form = Forms.create({
  email: ''
});

// Set server error
form.setError('email', 'Email already exists');

// ❌ User changes email but error persists
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
  // Error still shows "Email already exists"
});

// ✅ Clear error when user types
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
  form.setError('email', ''); // Clear old server error
});
```

 

### Pitfall 2: Overwriting Validator Errors

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid format' : ''
  }
);

// ❌ setError() can overwrite validator errors
form.setValue('email', 'bad-email'); // Validator sets error
form.setError('email', ''); // Oops, cleared validator error

// ✅ Be aware of validator/manual error interaction
// Consider using different fields or clear patterns
```

 

### Pitfall 3: Not Handling Empty Strings vs Null

```javascript
const form = Forms.create({
  field: ''
});

// ❌ Both clear the error, but be consistent
form.setError('field', '');
form.setError('field', null); // Works but inconsistent

// ✅ Use empty string consistently
form.setError('field', '');
```

 

### Pitfall 4: Setting Errors on Non-Existent Fields

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ Field doesn't exist in form
form.setError('username', 'Username taken');
// Error is set but field doesn't exist

// ✅ Ensure field exists
if ('username' in form.values) {
  form.setError('username', 'Username taken');
}
```

 

### Pitfall 5: Batch Errors One-by-One

```javascript
const form = Forms.create({
  field1: '', field2: '', field3: ''
});

// ❌ Less efficient
form.setError('field1', 'Error 1');
form.setError('field2', 'Error 2');
form.setError('field3', 'Error 3');

// ✅ Better for multiple errors - use setErrors()
form.setErrors({
  field1: 'Error 1',
  field2: 'Error 2',
  field3: 'Error 3'
});
```

 

## Summary

### Key Takeaways

1. **`setError()` manually sets error messages** for individual fields.

2. **Perfect for server-side validation** - handles errors that can't be checked client-side.

3. **Bypasses automatic validators** - gives you full control over error messages.

4. **Updates all reactive properties** - `hasErrors`, `isValid`, `errorFields` all update automatically.

5. **Returns form instance** - enables method chaining.

6. **Use empty string to clear** - `form.setError('field', '')` removes the error.

### When to Use setError()

✅ **Use setError() for:**
- Server-side validation responses
- Async validation (uniqueness checks, API calls)
- Custom business logic errors
- Cross-field validation
- File upload validation
- Real-time external validation

❌ **Don't use setError() for:**
- Simple format validation (use validators instead)
- Batch error updates (use `setErrors()`)
- Basic required field checks (use validators)

### One-Line Rule

> **`form.setError(field, message)` manually sets a custom error message - essential for server-side validation and complex async checks that automatic validators can't handle.**

 

**What's Next?**

- Learn about `form.setErrors()` for batch error updates
- Explore `form.clearError()` for removing specific errors
- Master `form.hasError()` for conditional error checking
