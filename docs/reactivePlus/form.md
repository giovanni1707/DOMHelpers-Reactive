# `form()` - Reactive Form State Management

## Quick Start (30 seconds)

```javascript
// Create a reactive form
const loginForm = form({
  email: '',
  password: ''
});

// Set field values
setValue(loginForm, 'email', 'user@example.com');

// Set field errors
setError(loginForm, 'password', 'Password is required');

// Check form state
console.log(loginForm.values);    // { email: 'user@example.com', password: '' }
console.log(loginForm.errors);    // { password: 'Password is required' }
console.log(loginForm.isValid);   // false (has errors)
console.log(loginForm.isDirty);   // true (fields touched)

// Reset the form
reset(loginForm);
```

**That's it.** A complete form state manager with values, errors, touched tracking, and validation helpers.

 

## What is `form()`?

`form()` creates a **specialized reactive state for handling forms**. It manages:

- **Field values** — The data entered by users
- **Validation errors** — Error messages for invalid fields
- **Touched state** — Which fields have been interacted with
- **Submission state** — Whether the form is being submitted

Think of it as **a smart form assistant** that tracks everything about your form automatically.

 

## Syntax

```javascript
// Create a form with initial values
const myForm = form({
  fieldName: initialValue,
  anotherField: anotherValue
});

// Access form properties
myForm.values        // Object with all field values
myForm.errors        // Object with field errors
myForm.touched       // Object tracking touched fields
myForm.isSubmitting  // Boolean for submission state
myForm.isValid       // Computed: true if no errors
myForm.isDirty       // Computed: true if any field touched
```

**Parameters:**
- `initialValues` - Object with field names and their initial values

**Returns:**
- A reactive form state object with built-in computed properties

 

## Form Methods

### `setValue(form, field, value)` - Set Field Value

```javascript
const contactForm = form({
  name: '',
  email: '',
  message: ''
});

// Set a single field
setValue(contactForm, 'name', 'Alice');
setValue(contactForm, 'email', 'alice@example.com');

// Field is automatically marked as touched
console.log(contactForm.touched); // { name: true, email: true }
```

 

### `setError(form, field, error)` - Set Field Error

```javascript
// Set an error message
setError(contactForm, 'email', 'Please enter a valid email');

// Clear an error (pass null or undefined)
setError(contactForm, 'email', null);

console.log(contactForm.errors); // {}
```

 

### `reset(form, newValues?)` - Reset the Form

```javascript
// Reset to initial values
reset(contactForm);

// Or reset to new values
reset(contactForm, {
  name: 'Bob',
  email: 'bob@example.com',
  message: ''
});
```

 

## Built-in Computed Properties

### `isValid`

Returns `true` if there are no errors:

```javascript
const myForm = form({ email: '' });

setError(myForm, 'email', 'Required');
console.log(myForm.isValid); // false

setError(myForm, 'email', null);
console.log(myForm.isValid); // true
```

### `isDirty`

Returns `true` if any field has been touched:

```javascript
const myForm = form({ name: '', email: '' });

console.log(myForm.isDirty); // false

setValue(myForm, 'name', 'Alice');
console.log(myForm.isDirty); // true
```

 

## Why Does This Exist?

### The Problem Without form()

Managing form state manually is tedious:

```javascript
// Manual approach
const formValues = state({ email: '', password: '' });
const formErrors = state({ email: '', password: '' });
const formTouched = state({ email: false, password: false });
const isSubmitting = state({ value: false });

// Setting a value
formValues.email = 'test@example.com';
formTouched.email = true;

// Checking validity
const isValid = !formErrors.email && !formErrors.password;

// Resetting
formValues.email = '';
formValues.password = '';
formErrors.email = '';
formErrors.password = '';
formTouched.email = false;
formTouched.password = false;

// So much manual work!
```

### The Solution with form()

```javascript
// Everything managed in one place
const myForm = form({ email: '', password: '' });

// Setting a value (also marks as touched)
setValue(myForm, 'email', 'test@example.com');

// Checking validity
console.log(myForm.isValid);

// Resetting
reset(myForm);

// Clean and simple!
```

 

## Basic Usage

### Example 1: Login Form

```javascript
const loginForm = form({
  email: '',
  password: '',
  rememberMe: false
});

// Validate email
function validateEmail() {
  const email = loginForm.values.email;

  if (!email) {
    setError(loginForm, 'email', 'Email is required');
  } else if (!email.includes('@')) {
    setError(loginForm, 'email', 'Please enter a valid email');
  } else {
    setError(loginForm, 'email', null);
  }
}

// Validate password
function validatePassword() {
  const password = loginForm.values.password;

  if (!password) {
    setError(loginForm, 'password', 'Password is required');
  } else if (password.length < 8) {
    setError(loginForm, 'password', 'Password must be at least 8 characters');
  } else {
    setError(loginForm, 'password', null);
  }
}

// Handle input changes
Elements.emailInput.addEventListener('input', (e) => {
  setValue(loginForm, 'email', e.target.value);
  validateEmail();
});

Elements.passwordInput.addEventListener('input', (e) => {
  setValue(loginForm, 'password', e.target.value);
  validatePassword();
});

// Update UI
effect(() => {
  Elements.emailError.textContent = loginForm.errors.email || '';
  Elements.passwordError.textContent = loginForm.errors.password || '';
  Elements.submitBtn.disabled = !loginForm.isValid || loginForm.isSubmitting;
});
```

 

### Example 2: Registration Form with Validation

```javascript
const registerForm = form({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
});

// Validation rules
const validators = {
  username: (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores';
    return null;
  },
  email: (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return null;
  },
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain an uppercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain a number';
    return null;
  },
  confirmPassword: (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== registerForm.values.password) return 'Passwords do not match';
    return null;
  },
  agreeToTerms: (value) => {
    if (!value) return 'You must agree to the terms';
    return null;
  }
};

// Validate a single field
function validateField(field) {
  const error = validators[field](registerForm.values[field]);
  setError(registerForm, field, error);
}

// Validate all fields
function validateAll() {
  Object.keys(validators).forEach(validateField);
  return registerForm.isValid;
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  if (!validateAll()) return;

  registerForm.isSubmitting = true;

  try {
    await api.register(registerForm.values);
    alert('Registration successful!');
    reset(registerForm);
  } catch (error) {
    setError(registerForm, 'email', error.message);
  } finally {
    registerForm.isSubmitting = false;
  }
}
```

 

### Example 3: Contact Form with Real-time Validation

```javascript
const contactForm = form({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// Character limit for message
const MESSAGE_MAX_LENGTH = 500;

// Add computed for message length
computed(contactForm, {
  messageLength: function() {
    return this.values.message.length;
  },
  messageRemaining: function() {
    return MESSAGE_MAX_LENGTH - this.messageLength;
  },
  isMessageTooLong: function() {
    return this.messageLength > MESSAGE_MAX_LENGTH;
  }
});

// Real-time validation effect
effect(() => {
  // Name validation
  if (contactForm.touched.name) {
    if (!contactForm.values.name) {
      setError(contactForm, 'name', 'Name is required');
    } else {
      setError(contactForm, 'name', null);
    }
  }

  // Email validation
  if (contactForm.touched.email) {
    const email = contactForm.values.email;
    if (!email) {
      setError(contactForm, 'email', 'Email is required');
    } else if (!email.includes('@')) {
      setError(contactForm, 'email', 'Invalid email');
    } else {
      setError(contactForm, 'email', null);
    }
  }

  // Message validation
  if (contactForm.touched.message) {
    if (!contactForm.values.message) {
      setError(contactForm, 'message', 'Message is required');
    } else if (contactForm.isMessageTooLong) {
      setError(contactForm, 'message', 'Message is too long');
    } else {
      setError(contactForm, 'message', null);
    }
  }
});

// Update character counter
effect(() => {
  Elements.charCounter.textContent = `${contactForm.messageRemaining} characters remaining`;
  Elements.charCounter.classList.toggle('warning', contactForm.messageRemaining < 50);
  Elements.charCounter.classList.toggle('error', contactForm.messageRemaining < 0);
});

// Update submit button
effect(() => {
  Elements.submitBtn.disabled = !contactForm.isValid || contactForm.isSubmitting;
  Elements.submitBtn.textContent = contactForm.isSubmitting ? 'Sending...' : 'Send Message';
});
```

 

### Example 4: Multi-Step Form

```javascript
const wizardForm = form({
  // Step 1: Personal Info
  firstName: '',
  lastName: '',
  dateOfBirth: '',

  // Step 2: Contact Info
  email: '',
  phone: '',
  address: '',

  // Step 3: Preferences
  newsletter: false,
  notifications: 'email',
  theme: 'light'
});

const wizard = state({
  currentStep: 1,
  totalSteps: 3
});

// Validation per step
const stepValidators = {
  1: () => {
    let valid = true;

    if (!wizardForm.values.firstName) {
      setError(wizardForm, 'firstName', 'Required');
      valid = false;
    }
    if (!wizardForm.values.lastName) {
      setError(wizardForm, 'lastName', 'Required');
      valid = false;
    }

    return valid;
  },
  2: () => {
    let valid = true;

    if (!wizardForm.values.email) {
      setError(wizardForm, 'email', 'Required');
      valid = false;
    }

    return valid;
  },
  3: () => true // No validation for preferences
};

// Navigation
function nextStep() {
  if (stepValidators[wizard.currentStep]()) {
    wizard.currentStep = Math.min(wizard.currentStep + 1, wizard.totalSteps);
  }
}

function prevStep() {
  wizard.currentStep = Math.max(wizard.currentStep - 1, 1);
}

// Update step display
effect(() => {
  Elements.stepIndicator.textContent = `Step ${wizard.currentStep} of ${wizard.totalSteps}`;

  // Show/hide step content
  for (let i = 1; i <= wizard.totalSteps; i++) {
    Elements[`step${i}`].style.display = i === wizard.currentStep ? 'block' : 'none';
  }

  // Update navigation buttons
  Elements.prevBtn.disabled = wizard.currentStep === 1;
  Elements.nextBtn.textContent = wizard.currentStep === wizard.totalSteps ? 'Submit' : 'Next';
});
```

 

## Real-World Examples

### Example 1: Checkout Form

```javascript
const checkoutForm = form({
  // Billing
  billingName: '',
  billingAddress: '',
  billingCity: '',
  billingZip: '',
  billingCountry: 'US',

  // Payment
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',

  // Options
  sameAsShipping: true,
  saveCard: false
});

// Format card number as user types
function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ').substr(0, 19);
}

// Format expiry date
function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
  }
  return cleaned;
}

// Card number input
Elements.cardNumberInput.addEventListener('input', (e) => {
  const formatted = formatCardNumber(e.target.value);
  e.target.value = formatted;
  setValue(checkoutForm, 'cardNumber', formatted);

  // Validate
  const digits = formatted.replace(/\s/g, '');
  if (digits.length < 16) {
    setError(checkoutForm, 'cardNumber', 'Card number must be 16 digits');
  } else {
    setError(checkoutForm, 'cardNumber', null);
  }
});

// Expiry input
Elements.cardExpiryInput.addEventListener('input', (e) => {
  const formatted = formatExpiry(e.target.value);
  e.target.value = formatted;
  setValue(checkoutForm, 'cardExpiry', formatted);

  // Validate
  if (formatted.length === 5) {
    const [month, year] = formatted.split('/').map(Number);
    const now = new Date();
    const expiry = new Date(2000 + year, month - 1);

    if (expiry < now) {
      setError(checkoutForm, 'cardExpiry', 'Card has expired');
    } else {
      setError(checkoutForm, 'cardExpiry', null);
    }
  }
});
```

 

### Example 2: Search Filter Form

```javascript
const filterForm = form({
  query: '',
  category: 'all',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  sortBy: 'relevance'
});

// Debounced search
let searchTimeout;

effect(() => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    performSearch(filterForm.values);
  }, 300);
});

// Reset filters
function resetFilters() {
  reset(filterForm, {
    query: filterForm.values.query, // Keep the search query
    category: 'all',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'relevance'
  });
}

// Apply preset
function applyPreset(preset) {
  batch(() => {
    Object.entries(preset).forEach(([field, value]) => {
      setValue(filterForm, field, value);
    });
  });
}
```

 

### Example 3: Profile Settings Form

```javascript
const profileForm = form({
  displayName: '',
  bio: '',
  website: '',
  location: '',
  isPublic: true
});

// Load initial data
async function loadProfile() {
  const profile = await api.getProfile();

  batch(() => {
    setValue(profileForm, 'displayName', profile.displayName);
    setValue(profileForm, 'bio', profile.bio || '');
    setValue(profileForm, 'website', profile.website || '');
    setValue(profileForm, 'location', profile.location || '');
    setValue(profileForm, 'isPublic', profile.isPublic);
  });

  // Clear touched state (we just loaded, not edited)
  profileForm.touched = {};
}

// Check if form has changes
computed(profileForm, {
  hasChanges: function() {
    return this.isDirty;
  }
});

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', (e) => {
  if (profileForm.hasChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// Save profile
async function saveProfile() {
  if (!profileForm.isValid) return;

  profileForm.isSubmitting = true;

  try {
    await api.updateProfile(profileForm.values);
    profileForm.touched = {}; // Clear dirty state
    showNotification('Profile saved!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    profileForm.isSubmitting = false;
  }
}
```

 

## Connecting to DOM Inputs

### Pattern 1: Simple Input Binding

```javascript
function bindInput(form, fieldName, element) {
  // Update state when input changes
  element.addEventListener('input', (e) => {
    setValue(form, fieldName, e.target.value);
  });

  // Update input when state changes
  effect(() => {
    element.value = form.values[fieldName];
  });
}

// Usage
bindInput(myForm, 'email', Elements.emailInput);
bindInput(myForm, 'password', Elements.passwordInput);
```

 

### Pattern 2: Checkbox Binding

```javascript
function bindCheckbox(form, fieldName, element) {
  element.addEventListener('change', (e) => {
    setValue(form, fieldName, e.target.checked);
  });

  effect(() => {
    element.checked = form.values[fieldName];
  });
}
```

 

### Pattern 3: Select Binding

```javascript
function bindSelect(form, fieldName, element) {
  element.addEventListener('change', (e) => {
    setValue(form, fieldName, e.target.value);
  });

  effect(() => {
    element.value = form.values[fieldName];
  });
}
```

 

### Pattern 4: Complete Form Binding

```javascript
function bindForm(formState, formElement) {
  // Find all inputs
  const inputs = formElement.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    if (!fieldName) return;

    // Bind based on type
    if (input.type === 'checkbox') {
      input.addEventListener('change', (e) => {
        setValue(formState, fieldName, e.target.checked);
      });
    } else {
      input.addEventListener('input', (e) => {
        setValue(formState, fieldName, e.target.value);
      });
    }
  });

  // Handle form submission
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    // Trigger custom submit handler
    formElement.dispatchEvent(new CustomEvent('formSubmit', {
      detail: formState.values
    }));
  });
}

// Usage
bindForm(loginForm, Elements.loginFormElement);

Elements.loginFormElement.addEventListener('formSubmit', (e) => {
  console.log('Form submitted:', e.detail);
});
```

 

## Summary

**What is `form()`?**
A specialized reactive state for managing form data, errors, and submission state.

**Methods:**
| Method | Purpose |
|--------|---------|
| `setValue(form, field, value)` | Set field value (marks as touched) |
| `setError(form, field, error)` | Set/clear field error |
| `reset(form, values?)` | Reset form to initial/new values |

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `values` | Object | All field values |
| `errors` | Object | All field errors |
| `touched` | Object | Which fields are touched |
| `isSubmitting` | Boolean | Submission in progress |
| `isValid` | Computed | No errors present |
| `isDirty` | Computed | Any field touched |

**Why use it?**
- ✅ All form state in one place
- ✅ Built-in validation support
- ✅ Touched/dirty tracking
- ✅ Submission state management
- ✅ Easy reset functionality

**Key Takeaway:**

```javascript
// Create
const myForm = form({ field: '' });

// Update
setValue(myForm, 'field', 'value');

// Validate
setError(myForm, 'field', 'Error message');

// Check
myForm.isValid && myForm.isDirty

// Reset
reset(myForm);
```

**Remember:** `form()` handles the boring parts of form management so you can focus on your logic!
