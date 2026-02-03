# Understanding `form()` - A Beginner's Guide

## Quick Start (30 seconds)

Need reactive form management with validation? Here's how:

```js
// Create a form with validation
const loginForm = form(
  { email: '', password: '' },  // Initial values
  {
    validators: {
      email: validators.email('Invalid email'),
      password: validators.minLength(6, 'Too short')
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      return response.json();
    }
  }
);

// Auto-update display
effect(() => {
  document.getElementById('status').textContent =
    loginForm.isValid ? 'Ready' : 'Invalid';
});

// Submit form
loginForm.submit();
```

**That's it!** The `form()` function creates reactive form state with built-in validation, error tracking, and submission handling!

 

## What is `form()`?

`form()` is a specialized function for creating **reactive form state** with built-in validation, error tracking, touched state management, and submission handling. It takes care of all the common form patterns so you don't have to.

**A reactive form:**
- Manages field values reactively
- Tracks which fields have been touched
- Validates fields automatically
- Manages error messages
- Handles form submission
- Provides computed properties (isValid, isDirty, etc.)

Think of it as a **smart form manager** - it handles all the tedious form state management automatically, so you can focus on building your UI.

 

## Syntax

```js
// Using the shortcut
form(initialValues, options)

// Using the full namespace
ReactiveUtils.form(initialValues, options)

// Alias: createForm()
createForm(initialValues, options)
ReactiveUtils.createForm(initialValues, options)
```

**All styles are valid!** Choose whichever you prefer:
- **Shortcut style** (`form()` or `createForm()`) - Clean and concise
- **Namespace style** (`ReactiveUtils.form()`) - Explicit and clear

**Parameters:**
- `initialValues` - An object with initial field values (required)
- `options` - Configuration object (optional):
  - `validators` - Object mapping field names to validator functions
  - `onSubmit` - Function called when form is submitted

**Returns:**
- A reactive form object with values, errors, validation, and methods

 


## Why Does This Exist?

### Two Approaches to Form State Management

The Reactive library offers flexible ways to manage form data, validation, and submission, each suited to different complexity levels.

### Manual Form State Management

When you need **complete control** over every aspect of form behavior and want to implement custom validation flows:

```javascript
// Explicit form state management
const formState = state({
  values: { email: '', password: '' },
  errors: {},
  touched: {},
  isSubmitting: false
});

// Custom field change handlers
function handleEmailChange(value) {
  formState.values.email = value;
  formState.touched.email = true;

  // Custom validation logic
  if (!value.includes('@')) {
    formState.errors.email = 'Invalid email';
  } else {
    delete formState.errors.email;
  }
}

// Custom validation checks
function isFormValid() {
  return Object.keys(formState.errors).length === 0;
}

// Custom submission handling
async function handleSubmit() {
  // Manual touch tracking
  Object.keys(formState.values).forEach(key => {
    formState.touched[key] = true;
  });

  // Custom validation
  // ... validation logic ...

  if (isFormValid()) {
    formState.isSubmitting = true;
    // ... submit logic ...
    formState.isSubmitting = false;
  }
}


**This approach is great when you need:**
✅ Full control over validation timing and logic
✅ Custom field-specific behavior
✅ Integration with existing form patterns
✅ Specific error handling requirements

### When Standardized Form Patterns Fit Your Needs

In scenarios where you want **structured form management** with automatic validation, error tracking, and submission handling, `form()` provides a more direct approach:

```javascript
// Structured form with built-in management
const loginForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.email('Invalid email'),
      password: validators.minLength(6, 'Too short')
    },
    onSubmit: async (values) => {
      // Focus on submission logic
      return await api.login(values);
    }
  }
);

// Computed properties available automatically
console.log(loginForm.isValid);    // Auto-computed
console.log(loginForm.isDirty);    // Auto-computed
console.log(loginForm.errors);     // Auto-managed
```

**This method is especially useful when:**

```
form() Management:
┌──────────────────┐
│  form()          │
└────────┬─────────┘
         │
         ▼
   Structured tracking:
   • values
   • errors
   • touched
   • validation
   • submission
         │
         ▼
  ✅ Integrated system
```

**Where form() shines:**
✅ **Built-in validation** - Automatic validation on field changes
✅ **Error management** - Error tracking and display helpers
✅ **Computed helpers** - `isValid`, `isDirty`, `hasErrors` automatically calculated
✅ **Touch tracking** - Knows which fields user has interacted with
✅ **Submission handling** - Built-in loading state and error handling
✅ **Common validators** - Email, minLength, required, pattern, etc. included

**The Choice is Yours:**
- Use manual form state when you need custom validation flows and specific control
- Use `form()` when you want standardized form patterns with built-in features
- Both approaches work seamlessly with reactive state

**Benefits of the form approach:**
✅ **Declarative validators** - Define validation rules upfront
✅ **Automatic error tracking** - Errors managed and updated automatically
✅ **Computed properties** - `isValid`, `isDirty`, `hasErrors` always current
✅ **Built-in helpers** - `setValue()`, `setError()`, `reset()`, `submit()` methods
✅ **Less boilerplate** - Focus on validation rules and submission logic
✅ **Consistent patterns** - Same structure across all forms in your app

## Mental Model

Think of `form()` like a **smart clipboard assistant**:

```
Regular Form State (Manual Clipboard):
┌──────────────────────┐
│  Paper 1: Values     │  ← Track manually
│  Paper 2: Errors     │  ← Track manually
│  Paper 3: Touched    │  ← Track manually
│  Paper 4: Valid?     │  ← Calculate manually
└──────────────────────┘
     You do everything
     manually!

Reactive Form (Smart Assistant):
┌──────────────────────────────────┐
│   Smart Clipboard Assistant      │
│   ┌────────────────────┐         │
│   │ Values             │ ✓       │
│   │ Errors             │ ✓       │
│   │ Touched            │ ✓       │
│   │ isValid            │ ✓       │
│   │ isDirty            │ ✓       │
│   └────────────────────┘         │
│                                  │
│   Automatic Features:            │
│   ✓ Validates on change          │
│   ✓ Tracks touched fields        │
│   ✓ Computes validity            │
│   ✓ Manages errors               │
│   ✓ Handles submission           │
└──────────────────────────────────┘
         │
         ▼
   Everything tracked
   and managed for you!
```

**Key Insight:** Just like a smart assistant that keeps track of everything on your clipboard and tells you when something's wrong, `form()` manages all your form state and tells you when it's valid or invalid.

 

## How Does It Work?

### The Magic: State + Computed + Methods

When you call `form()`, here's what happens behind the scenes:

```javascript
// What you write:
const myForm = form(
  { email: '' },
  {
    validators: {
      email: validators.required('Required')
    }
  }
);

// What actually happens (simplified):
// 1. Create reactive state
const myForm = state({
  values: { email: '' },
  errors: {},
  touched: {},
  isSubmitting: false,
  submitCount: 0
});

// 2. Add computed properties
myForm.isValid = computed(() => /* check errors */);
myForm.isDirty = computed(() => /* check touched */);

// 3. Add methods
myForm.setValue = function(field, value) { /* ... */ };
myForm.validate = function() { /* ... */ };
myForm.submit = async function() { /* ... */ };
// ... and many more
```

**In other words:** `form()` is a complete package that:
1. Creates reactive state for all form data
2. Adds computed properties for validation status
3. Attaches methods for common operations
4. Wires up validators automatically
5. Returns a fully-functional form manager

### Under the Hood

```
form({ email: '' }, { validators: {...} })
        │
        ▼
┌───────────────────────┐
│  Step 1: Create State │
│  values, errors,      │
│  touched, etc.        │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 2: Add Computed │
│  isValid, isDirty,    │
│  hasErrors, etc.      │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 3: Store        │
│  Validators           │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 4: Add Methods  │
│  setValue, validate,  │
│  submit, etc.         │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  Step 5: Return       │
│  Complete Form Object │
└───────────────────────┘
```

**What happens:**

1️⃣ When you **change a value**, it validates automatically
2️⃣ When you **touch a field**, it marks it as touched
3️⃣ When you **submit**, it validates all fields and calls your handler
4️⃣ Everything is **reactive** - effects re-run when state changes!

 

## Basic Usage

### Creating a Form

The simplest way to use `form()`:

```js
// Basic form without validation
const contactForm = form({
  name: '',
  email: '',
  message: ''
});

// Form with validation
const loginForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.email('Invalid email'),
      password: validators.required('Password required')
    }
  }
);
```

### Accessing Values

Values are stored in the `.values` property:

```js
const myForm = form({
  username: 'john',
  email: 'john@example.com'
});

console.log(myForm.values.username); // "john"
console.log(myForm.values.email);    // "john@example.com"
```

### Setting Values

Use the `setValue()` method:

```js
const myForm = form({ email: '' });

// Set a value (also marks field as touched and validates)
myForm.setValue('email', 'john@example.com');

console.log(myForm.values.email); // "john@example.com"
console.log(myForm.touched.email); // true
```

 

## Form Properties

Forms have several reactive properties:

### `form.values`

Object containing all field values:

```js
const myForm = form({ name: '', email: '' });

console.log(myForm.values);
// { name: '', email: '' }

myForm.setValue('name', 'John');
console.log(myForm.values);
// { name: 'John', email: '' }
```

### `form.errors`

Object containing error messages:

```js
const myForm = form(
  { email: '' },
  {
    validators: {
      email: validators.email('Invalid')
    }
  }
);

myForm.setValue('email', 'invalid');
console.log(myForm.errors);
// { email: 'Invalid' }
```

### `form.touched`

Object tracking which fields have been touched:

```js
const myForm = form({ name: '', email: '' });

myForm.setValue('name', 'John');
console.log(myForm.touched);
// { name: true }
```

### `form.isSubmitting`

Boolean indicating if form is currently submitting:

```js
const myForm = form({ email: '' });

console.log(myForm.isSubmitting); // false

// During submission, this becomes true
```

### `form.submitCount`

Number of times form has been submitted:

```js
const myForm = form({ email: '' });

console.log(myForm.submitCount); // 0

await myForm.submit();
console.log(myForm.submitCount); // 1
```

### `form.isValid` (Computed)

Automatically computed - true if no errors:

```js
const myForm = form(
  { email: '' },
  {
    validators: {
      email: validators.required('Required')
    }
  }
);

console.log(myForm.isValid); // false (empty = error)

myForm.setValue('email', 'john@example.com');
console.log(myForm.isValid); // true (valid email)
```

### `form.isDirty` (Computed)

Automatically computed - true if any field has been touched:

```js
const myForm = form({ name: '', email: '' });

console.log(myForm.isDirty); // false

myForm.setValue('name', 'John');
console.log(myForm.isDirty); // true
```

### `form.hasErrors` (Computed)

Automatically computed - true if any errors exist:

```js
const myForm = form(
  { email: '' },
  {
    validators: {
      email: validators.email('Invalid')
    }
  }
);

myForm.setValue('email', 'invalid');
console.log(myForm.hasErrors); // true
```

### `form.touchedFields` (Computed)

Array of touched field names:

```js
const myForm = form({ name: '', email: '', phone: '' });

myForm.setValue('name', 'John');
myForm.setValue('email', 'john@example.com');

console.log(myForm.touchedFields);
// ['name', 'email']
```

### `form.errorFields` (Computed)

Array of field names with errors:

```js
const myForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.required('Required'),
      password: validators.required('Required')
    }
  }
);

console.log(myForm.errorFields);
// ['email', 'password']
```

 

## Value Management

### `setValue(field, value)`

Set a single field value:

```js
const myForm = form({ email: '' });

myForm.setValue('email', 'john@example.com');

// Automatically:
// - Updates values.email
// - Marks touched.email = true
// - Validates the field
```

**Returns:** `this` (for chaining)

### `setValues(values)`

Set multiple field values at once:

```js
const myForm = form({ name: '', email: '' });

myForm.setValues({
  name: 'John',
  email: 'john@example.com'
});
```

**Returns:** `this` (for chaining)

### `getValue(field)`

Get a field's value:

```js
const myForm = form({ email: 'john@example.com' });

const email = myForm.getValue('email');
console.log(email); // "john@example.com"
```

 

## Validation

### `validateField(field)`

Validate a single field:

```js
const myForm = form(
  { email: '' },
  {
    validators: {
      email: validators.email('Invalid email')
    }
  }
);

myForm.setValue('email', 'invalid');
const isValid = myForm.validateField('email');

console.log(isValid); // false
console.log(myForm.errors.email); // "Invalid email"
```

**Returns:** `true` if valid, `false` if invalid

### `validate()`

Validate all fields:

```js
const myForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.required('Required'),
      password: validators.minLength(6, 'Too short')
    }
  }
);

const isValid = myForm.validate();

console.log(isValid); // false
console.log(myForm.errors);
// { email: 'Required', password: 'Too short' }
```

**Returns:** `true` if all fields valid, `false` otherwise

 

## Built-in Validators

The library provides common validators:

### `validators.required(message)`

Field must have a value:

```js
validators.required('This field is required')
```

### `validators.email(message)`

Field must be a valid email:

```js
validators.email('Invalid email address')
```

### `validators.minLength(min, message)`

String must be at least `min` characters:

```js
validators.minLength(6, 'Must be at least 6 characters')
```

### `validators.maxLength(max, message)`

String must be no more than `max` characters:

```js
validators.maxLength(100, 'Must be less than 100 characters')
```

### `validators.min(min, message)`

Number must be at least `min`:

```js
validators.min(18, 'Must be at least 18')
```

### `validators.max(max, message)`

Number must be no more than `max`:

```js
validators.max(100, 'Must be less than 100')
```

### `validators.pattern(regex, message)`

String must match regex pattern:

```js
validators.pattern(/^[A-Z]/, 'Must start with uppercase letter')
```

### `validators.match(fieldName, message)`

Field must match another field:

```js
// Password confirmation
validators: {
  password: validators.required('Required'),
  confirmPassword: validators.match('password', 'Passwords must match')
}
```

### `validators.custom(validatorFn)`

Custom validation function:

```js
validators.custom((value, allValues) => {
  if (value.includes('admin')) {
    return 'Cannot use "admin" in username';
  }
  return null; // null means valid
})
```

### `validators.combine(...validators)`

Combine multiple validators:

```js
validators.combine(
  validators.required('Required'),
  validators.minLength(6, 'Too short'),
  validators.pattern(/[A-Z]/, 'Must have uppercase')
)
```

 

## Error Management

### `setError(field, error)`

Set an error for a field:

```js
const myForm = form({ email: '' });

myForm.setError('email', 'Email already exists');

console.log(myForm.errors.email); // "Email already exists"
```

**Returns:** `this` (for chaining)

### `setErrors(errors)`

Set multiple errors:

```js
const myForm = form({ email: '', password: '' });

myForm.setErrors({
  email: 'Invalid email',
  password: 'Too weak'
});
```

**Returns:** `this` (for chaining)

### `clearError(field)`

Clear an error:

```js
myForm.clearError('email');

console.log(myForm.errors.email); // undefined
```

**Returns:** `this` (for chaining)

### `clearErrors()`

Clear all errors:

```js
myForm.clearErrors();

console.log(myForm.errors); // {}
```

**Returns:** `this` (for chaining)

### `hasError(field)`

Check if field has an error:

```js
const hasError = myForm.hasError('email');
console.log(hasError); // true or false
```

### `getError(field)`

Get error message for a field:

```js
const error = myForm.getError('email');
console.log(error); // Error message or null
```

### `shouldShowError(field)`

Check if error should be shown (touched + has error):

```js
// Only show errors for fields user has interacted with
if (myForm.shouldShowError('email')) {
  displayError(myForm.getError('email'));
}
```

 

## Touched State

### `setTouched(field, touched)`

Mark a field as touched or untouched:

```js
myForm.setTouched('email', true);
myForm.setTouched('password', false);
```

**Returns:** `this` (for chaining)

### `touchAll()`

Mark all fields as touched:

```js
// Useful before submission
myForm.touchAll();
```

**Returns:** `this` (for chaining)

### `isTouched(field)`

Check if a field is touched:

```js
const touched = myForm.isTouched('email');
```

 

## Form Submission

### `submit(customHandler)`

Submit the form:

```js
const myForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.required('Required'),
      password: validators.required('Required')
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      return response.json();
    }
  }
);

// Submit form
const result = await myForm.submit();

if (result.success) {
  console.log('Success:', result.result);
} else {
  console.log('Error:', result.error);
}
```

**What happens during submit:**
1. Marks all fields as touched
2. Validates all fields
3. If invalid, returns `{ success: false, errors: {...} }`
4. If valid, sets `isSubmitting = true`
5. Calls your submit handler
6. Sets `isSubmitting = false`
7. Returns `{ success: true, result: ... }` or `{ success: false, error: ... }`

### `reset(newValues)`

Reset form to initial or new values:

```js
const myForm = form({ email: '', password: '' });

myForm.setValue('email', 'john@example.com');
myForm.setValue('password', 'secret');

// Reset to initial values
myForm.reset();

console.log(myForm.values);
// { email: '', password: '' }

// Or reset to new values
myForm.reset({ email: 'jane@example.com', password: '' });
```

**Returns:** `this` (for chaining)

### `resetField(field)`

Reset a single field:

```js
myForm.resetField('email');
```

**Returns:** `this` (for chaining)

 

## Event Handlers

### `handleChange(event)`

Handle input change events:

```js
const myForm = form({ email: '' });

// Connect to input
document.getElementById('email').addEventListener('input', (e) => {
  myForm.handleChange(e);
});

// Automatically:
// - Extracts field name from input's name/id
// - Gets value (handles checkboxes)
// - Calls setValue()
```

### `handleBlur(event)`

Handle input blur events:

```js
document.getElementById('email').addEventListener('blur', (e) => {
  myForm.handleBlur(e);
});

// Automatically:
// - Marks field as touched
// - Validates the field
```

### `getFieldProps(field)`

Get props for an input (React-style):

```js
const emailProps = myForm.getFieldProps('email');

// Returns:
// {
//   name: 'email',
//   value: <current value>,
//   onChange: <handler function>,
//   onBlur: <handler function>
// }

// Spread onto input:
// <input {...emailProps} />
```

 

## DOM Binding

### `bindToInputs(selector)`

Automatically bind form to DOM inputs:

```js
// HTML:
// <input name="email" id="email">
// <input name="password" id="password">

const myForm = form({ email: '', password: '' });

// Bind to all inputs in form
myForm.bindToInputs('#myForm input');

// Now inputs automatically sync with form state!
```

 

## Common Patterns

### Pattern: Login Form

```js
const loginForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.combine(
        validators.required('Email required'),
        validators.email('Invalid email')
      ),
      password: validators.combine(
        validators.required('Password required'),
        validators.minLength(6, 'Minimum 6 characters')
      )
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      return response.json();
    }
  }
);

// Show errors
effect(() => {
  if (loginForm.shouldShowError('email')) {
    document.getElementById('emailError').textContent =
      loginForm.getError('email');
  }
});

// Show submit button state
effect(() => {
  const btn = document.getElementById('submitBtn');
  btn.disabled = !loginForm.isValid || loginForm.isSubmitting;
  btn.textContent = loginForm.isSubmitting ? 'Logging in...' : 'Login';
});

// Handle form submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const result = await loginForm.submit();

  if (result.success) {
    console.log('Logged in!', result.result);
  } else {
    console.error('Login error:', result.error);
  }
});
```

### Pattern: Registration Form

```js
const registerForm = form(
  {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  {
    validators: {
      username: validators.combine(
        validators.required('Username required'),
        validators.minLength(3, 'Too short'),
        validators.pattern(/^[a-zA-Z0-9_]+$/, 'Invalid characters')
      ),
      email: validators.combine(
        validators.required('Email required'),
        validators.email('Invalid email')
      ),
      password: validators.combine(
        validators.required('Password required'),
        validators.minLength(8, 'Minimum 8 characters'),
        validators.pattern(/[A-Z]/, 'Need uppercase letter'),
        validators.pattern(/[0-9]/, 'Need a number')
      ),
      confirmPassword: validators.combine(
        validators.required('Confirm password'),
        validators.match('password', 'Passwords must match')
      )
    }
  }
);

// Bind to inputs
registerForm.bindToInputs('#registerForm input');

// Show validation state
effect(() => {
  Object.keys(registerForm.values).forEach(field => {
    const errorEl = document.getElementById(`${field}Error`);
    if (registerForm.shouldShowError(field)) {
      errorEl.textContent = registerForm.getError(field);
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  });
});
```

### Pattern: Dynamic Validation

```js
const checkoutForm = form(
  {
    paymentMethod: 'card',
    cardNumber: '',
    bankAccount: ''
  },
  {
    validators: {
      cardNumber: (value, allValues) => {
        // Only validate if payment method is card
        if (allValues.paymentMethod === 'card') {
          if (!value) return 'Card number required';
          if (!/^\d{16}$/.test(value)) return 'Invalid card number';
        }
        return null;
      },
      bankAccount: (value, allValues) => {
        // Only validate if payment method is bank
        if (allValues.paymentMethod === 'bank') {
          if (!value) return 'Bank account required';
        }
        return null;
      }
    }
  }
);

// Re-validate when payment method changes
effect(() => {
  const method = checkoutForm.values.paymentMethod;
  checkoutForm.validate();
});
```

### Pattern: Auto-Save Draft

```js
const draftForm = form({
  title: '',
  content: ''
});

// Auto-save every 3 seconds when dirty
let saveTimer;
effect(() => {
  if (draftForm.isDirty) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveDraft(draftForm.values);
    }, 3000);
  }
});

async function saveDraft(values) {
  await fetch('/api/drafts', {
    method: 'POST',
    body: JSON.stringify(values)
  });
  console.log('Draft saved!');
}
```

 

## Common Pitfalls

### Pitfall #1: Not Awaiting Submit

❌ **Wrong:**
```js
myForm.submit(); // Fire and forget

// Code continues immediately
console.log('Done!'); // Too early!
```

✅ **Correct:**
```js
const result = await myForm.submit();

if (result.success) {
  console.log('Done!');
}
```

 

### Pitfall #2: Modifying values Directly

❌ **Wrong:**
```js
// Direct modification doesn't trigger validation
myForm.values.email = 'john@example.com';
```

✅ **Correct:**
```js
// Use setValue to trigger validation
myForm.setValue('email', 'john@example.com');
```

 

### Pitfall #3: Showing Errors Too Early

❌ **Wrong:**
```js
// Shows errors immediately, even for untouched fields
effect(() => {
  if (myForm.hasError('email')) {
    showError(myForm.getError('email'));
  }
});
```

✅ **Correct:**
```js
// Only show errors for touched fields
effect(() => {
  if (myForm.shouldShowError('email')) {
    showError(myForm.getError('email'));
  }
});
```

 

### Pitfall #4: Not Handling Submit Errors

❌ **Wrong:**
```js
const result = await myForm.submit();
// Assuming success
redirect('/dashboard');
```

✅ **Correct:**
```js
const result = await myForm.submit();

if (result.success) {
  redirect('/dashboard');
} else {
  showError(result.error || 'Submission failed');
}
```

 

### Pitfall #5: Forgetting to Validate Before Manual Submit

❌ **Wrong:**
```js
// Submitting without validation
const values = myForm.values;
await api.submit(values); // Might send invalid data
```

✅ **Correct:**
```js
// Always validate first
if (myForm.validate()) {
  const values = myForm.values;
  await api.submit(values);
} else {
  console.log('Form has errors:', myForm.errors);
}
```

 

## Summary

**What is `form()`?**

`form()` creates **reactive form state** with built-in validation, error tracking, touched state, and submission handling. It's a complete form management solution.

 

**Why use `form()` instead of manual state management?**

- Automatic validation
- Built-in error tracking
- Touch state management
- Computed properties (isValid, isDirty)
- Less boilerplate (90% code reduction!)
- Standard form patterns handled for you

 

**Key Points to Remember:**

1️⃣ **Use setValue()** - Don't modify values directly
2️⃣ **Built-in validators** - Use provided validators or create custom ones
3️⃣ **shouldShowError()** - Only show errors for touched fields
4️⃣ **Await submit()** - Always await and check result
5️⃣ **Automatic validation** - Happens on setValue, validateField, and submit

 

**Mental Model:** Think of `form()` as a **smart clipboard assistant** - it keeps track of all your form data, validates it automatically, tells you what's wrong, and handles submission for you.

 

**Quick Reference:**

```js
// Create
const myForm = form(
  { email: '', password: '' },
  {
    validators: {
      email: validators.email('Invalid'),
      password: validators.minLength(6, 'Too short')
    },
    onSubmit: async (values) => {
      return await api.submit(values);
    }
  }
);

// Properties
myForm.isValid      // Computed
myForm.isDirty      // Computed
myForm.hasErrors    // Computed
myForm.values       // Object
myForm.errors       // Object
myForm.touched      // Object

// Value management
myForm.setValue('email', 'john@example.com');
myForm.setValues({ email: '...', password: '...' });

// Validation
myForm.validate();
myForm.validateField('email');

// Errors
myForm.setError('email', 'Already exists');
myForm.clearErrors();
myForm.shouldShowError('email');

// Submit
const result = await myForm.submit();

// Reset
myForm.reset();
myForm.resetField('email');

// Events
myForm.handleChange(event);
myForm.handleBlur(event);
myForm.getFieldProps('email');

// DOM Binding
myForm.bindToInputs('form input');
```

 

**Remember:** `form()` is your complete form management solution. It handles validation, errors, touched state, and submission automatically, so you can focus on building your UI instead of managing form state!
