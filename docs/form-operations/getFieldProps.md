# form.getFieldProps()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

// Get all props for binding in one call
const emailProps = form.getFieldProps('email');

// Spread onto input - complete binding!
emailInput.name = emailProps.name;
emailInput.value = emailProps.value;
emailInput.addEventListener('input', emailProps.onChange);
emailInput.addEventListener('blur', emailProps.onBlur);

// Or with React/frameworks:
// <input {...form.getFieldProps('email')} />
```

**What just happened?** `getFieldProps()` returned everything needed to bind an input - name, value, onChange, and onBlur - in one object!

 

## What is form.getFieldProps()?

`form.getFieldProps()` is a **convenience method that returns all props needed to bind an input field** to form state.

Simply put, it's a one-stop-shop for getting everything an input needs - name, value, and event handlers - all at once.

**Key characteristics:**
- ✅ Returns `{ name, value, onChange, onBlur }` object
- ✅ Complete field binding in one call
- ✅ Perfect for framework integration (React, Vue, etc.)
- ✅ Handles both value updates and touch tracking
- ✅ Reduces boilerplate dramatically
- ✅ Type-safe and consistent

 

## Syntax

```javascript
// Get props for a field
const props = form.getFieldProps('fieldName');

// Returns object:
// {
//   name: 'fieldName',
//   value: currentValue,
//   onChange: form.handleChange,
//   onBlur: form.handleBlur
// }

// Use with vanilla JS
inputElement.name = props.name;
inputElement.value = props.value;
inputElement.addEventListener('input', props.onChange);
inputElement.addEventListener('blur', props.onBlur);

// Use with React
<input {...form.getFieldProps('email')} />

// Use with Vue
<input v-bind="form.getFieldProps('email')" />
```

**Parameters:**
- `field` (string) - Name of the form field

**Returns:** Object with properties:
- `name` (string) - Field name
- `value` (any) - Current field value
- `onChange` (function) - Change event handler (form.handleChange)
- `onBlur` (function) - Blur event handler (form.handleBlur)

 

## Why Does This Exist?

### The Challenge: Repetitive Field Binding

Without `getFieldProps()`, binding each field requires multiple lines of repetitive code.

```javascript
const form = Forms.create({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
});

// ❌ Manual binding - repetitive pattern
emailInput.name = 'email';
emailInput.value = form.values.email;
emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', form.handleBlur);

usernameInput.name = 'username';
usernameInput.value = form.values.username;
usernameInput.addEventListener('input', form.handleChange);
usernameInput.addEventListener('blur', form.handleBlur);

passwordInput.name = 'password';
passwordInput.value = form.values.password;
passwordInput.addEventListener('input', form.handleChange);
passwordInput.addEventListener('blur', form.handleBlur);

confirmPasswordInput.name = 'confirmPassword';
confirmPasswordInput.value = form.values.confirmPassword;
confirmPasswordInput.addEventListener('input', form.handleChange);
confirmPasswordInput.addEventListener('blur', form.handleBlur);

// 4 inputs × 4 lines each = 16 lines of boilerplate!
```

**Problems:**
❌ **Highly repetitive** - Same 4 lines for every field
❌ **Error-prone** - Easy to forget a line or mistype field name
❌ **Maintenance burden** - Update pattern everywhere when changing
❌ **No reactivity** - Value doesn't update automatically
❌ **Framework integration** - Hard to use with React/Vue

### The Solution with getFieldProps()

```javascript
const form = Forms.create({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
});

// ✅ One-line binding per field
const emailProps = form.getFieldProps('email');
const usernameProps = form.getFieldProps('username');
const passwordProps = form.getFieldProps('password');
const confirmPasswordProps = form.getFieldProps('confirmPassword');

// Apply props (or use with frameworks)
applyProps(emailInput, emailProps);
applyProps(usernameInput, usernameProps);
applyProps(passwordInput, passwordProps);
applyProps(confirmPasswordInput, confirmPasswordProps);

function applyProps(input, props) {
  input.name = props.name;
  input.value = props.value;
  input.addEventListener('input', props.onChange);
  input.addEventListener('blur', props.onBlur);
}

// Or with React - even simpler:
// <input {...form.getFieldProps('email')} />
```

**Benefits:**
✅ **One call per field** - All props in one object
✅ **Framework-friendly** - Perfect for React/Vue spread syntax
✅ **Consistent pattern** - Same approach for all fields
✅ **Less error-prone** - Single source of truth
✅ **Easier maintenance** - Change once, affects all fields
✅ **Cleaner code** - Dramatic reduction in boilerplate

 

## Mental Model

Think of `getFieldProps()` as a **field binding kit** - it gives you everything you need to wire up an input in one package.

### Visual Flow

```
form.getFieldProps('email')
         ↓
Assembles binding kit:
         ↓
┌────────────────────────┐
│ Field Binding Kit      │
│ ✓ name: 'email'        │
│ ✓ value: current value │
│ ✓ onChange: handler    │
│ ✓ onBlur: handler      │
└────────────────────────┘
         ↓
Apply to input
         ↓
Fully connected field!
```

### Real-World Analogy

**Without getFieldProps** (Assembly Required):
```
You buy furniture from a store
They give you:
- Screws (in one bag)
- Wood panels (in another box)
- Instructions (separate paper)
- Tools (you need to find)

You spend hours assembling
```

**With getFieldProps** (Pre-Assembled):
```
You call getFieldProps('chair')
You receive a complete, ready-to-use chair
Everything is already connected
Just place it and sit!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
const props = form.getFieldProps('email');

// Here's what happens internally:
function getFieldProps(field) {
  1️⃣ Extract current value
     const value = form.values[field]; // 'user@example.com'

  2️⃣ Assemble props object
     return {
       name: field,              // 'email'
       value: value,              // 'user@example.com'
       onChange: form.handleChange, // Bound handler
       onBlur: form.handleBlur     // Bound handler
     };

  3️⃣ Return object ready for spreading
     // { name: 'email', value: '...', onChange: fn, onBlur: fn }
}
```

### Reactivity Flow Diagram

```
getFieldProps('email')
         ↓
Read current value
         ↓
Create props object
         ↓
┌────────────────────────┐
│ Props Object           │
│ name: 'email'          │
│ value: (reactive)      │
│ onChange: handler      │
│ onBlur: handler        │
└────────────────────────┘
         ↓
Spread onto input
         ↓
User types
         ↓
onChange(event) fires
         ↓
form.handleChange(event)
         ↓
form.values.email updates
         ↓
Input value updates (if reactive)
```

**Key Insight:** In frameworks with reactivity (React, Vue), when `form.values.email` changes, the component re-renders and `getFieldProps()` returns the new value, keeping the input in sync!

 

## Basic Usage

### Example 1: Vanilla JavaScript

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Get props
const emailProps = form.getFieldProps('email');
const passwordProps = form.getFieldProps('password');

// Apply to inputs
emailInput.name = emailProps.name;
emailInput.value = emailProps.value;
emailInput.addEventListener('input', emailProps.onChange);
emailInput.addEventListener('blur', emailProps.onBlur);

passwordInput.name = passwordProps.name;
passwordInput.value = passwordProps.value;
passwordInput.addEventListener('input', passwordProps.onChange);
passwordInput.addEventListener('blur', passwordProps.onBlur);

// Update inputs when form values change
effect(() => {
  emailInput.value = form.values.email;
  passwordInput.value = form.values.password;
});
```

 

### Example 2: Helper Function for Vanilla JS

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

// Reusable helper
function bindInput(input, fieldName) {
  const props = form.getFieldProps(fieldName);

  input.name = props.name;
  input.addEventListener('input', props.onChange);
  input.addEventListener('blur', props.onBlur);

  // Keep value in sync reactively
  effect(() => {
    input.value = form.values[fieldName];
  });
}

// Bind all inputs
bindInput(firstNameInput, 'firstName');
bindInput(lastNameInput, 'lastName');
bindInput(emailInput, 'email');
```

 

### Example 3: React Integration

```javascript
function LoginForm() {
  const form = Forms.create(
    {
      email: '',
      password: ''
    },
    {
      email: (value) => !value.includes('@') ? 'Invalid email' : '',
      password: (value) => value.length < 8 ? 'Too short' : ''
    }
  );

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const result = await form.submit(handleLogin);
      if (result.success) navigate('/dashboard');
    }}>
      {/* Spread props - complete binding! */}
      <input type="email" {...form.getFieldProps('email')} />
      {form.shouldShowError('email') && (
        <span className="error">{form.getError('email')}</span>
      )}

      <input type="password" {...form.getFieldProps('password')} />
      {form.shouldShowError('password') && (
        <span className="error">{form.getError('password')}</span>
      )}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

 

### Example 4: Vue Integration

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Bind using v-bind -->
    <input type="email" v-bind="form.getFieldProps('email')" />
    <span v-if="form.shouldShowError('email')" class="error">
      {{ form.getError('email') }}
    </span>

    <input type="password" v-bind="form.getFieldProps('password')" />
    <span v-if="form.shouldShowError('password')" class="error">
      {{ form.getError('password') }}
    </span>

    <button type="submit" :disabled="form.isSubmitting">
      {{ form.isSubmitting ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script>
export default {
  setup() {
    const form = Forms.create(
      { email: '', password: '' },
      {
        email: (value) => !value.includes('@') ? 'Invalid' : '',
        password: (value) => value.length < 8 ? 'Too short' : ''
      }
    );

    async function handleSubmit() {
      const result = await form.submit(loginUser);
      if (result.success) router.push('/dashboard');
    }

    return { form, handleSubmit };
  }
};
</script>
```

 

### Example 5: Dynamic Form Builder

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const fields = ['field1', 'field2', 'field3'];

// Build form dynamically
fields.forEach(fieldName => {
  const input = document.createElement('input');
  const props = form.getFieldProps(fieldName);

  input.name = props.name;
  input.type = 'text';
  input.addEventListener('input', props.onChange);
  input.addEventListener('blur', props.onBlur);

  // Keep in sync
  effect(() => {
    input.value = form.values[fieldName];
  });

  formContainer.appendChild(input);
});
```

 

## Advanced Patterns

### Pattern 1: Custom Props Extension

```javascript
const form = Forms.create({ email: '' });

function getExtendedFieldProps(field, extraProps = {}) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    ...extraProps,
    className: form.shouldShowError(field) ? 'error' : '',
    'aria-invalid': form.hasError(field),
    'aria-describedby': `${field}-error`
  };
}

// Use extended props
const emailProps = getExtendedFieldProps('email', {
  type: 'email',
  placeholder: 'Enter your email',
  autoComplete: 'email'
});

Object.assign(emailInput, emailProps);
emailInput.addEventListener('input', emailProps.onChange);
emailInput.addEventListener('blur', emailProps.onBlur);
```

 

### Pattern 2: Checkbox Field Props

```javascript
const form = Forms.create({
  newsletter: false,
  terms: false
});

function getCheckboxProps(field) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    type: 'checkbox',
    checked: baseProps.value, // Use 'checked' instead of 'value'
    value: undefined // Remove value
  };
}

// Use with checkboxes
const newsletterProps = getCheckboxProps('newsletter');

newsletterCheckbox.name = newsletterProps.name;
newsletterCheckbox.type = newsletterProps.type;
newsletterCheckbox.addEventListener('change', newsletterProps.onChange);
newsletterCheckbox.addEventListener('blur', newsletterProps.onBlur);

effect(() => {
  newsletterCheckbox.checked = form.values.newsletter;
});
```

 

### Pattern 3: Select Field Props

```javascript
const form = Forms.create({ country: 'us' });

function getSelectProps(field) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    onChange: (e) => {
      baseProps.onChange(e);
      // Additional logic for selects
      console.log('Selected:', e.target.value);
    }
  };
}

const countryProps = getSelectProps('country');

countrySelect.name = countryProps.name;
countrySelect.addEventListener('change', countryProps.onChange);
countrySelect.addEventListener('blur', countryProps.onBlur);

effect(() => {
  countrySelect.value = form.values.country;
});
```

 

### Pattern 4: Field Props with Transformers

```javascript
const form = Forms.create({
  phone: '',
  price: 0
});

function getTransformedFieldProps(field, transformer) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    onChange: (e) => {
      // Transform before updating
      const transformed = transformer(e.target.value);
      e.target.value = transformed;
      baseProps.onChange(e);
    }
  };
}

// Phone number transformer
const phoneProps = getTransformedFieldProps('phone', (value) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
});

phoneInput.name = phoneProps.name;
phoneInput.addEventListener('input', phoneProps.onChange);
phoneInput.addEventListener('blur', phoneProps.onBlur);
```

 

### Pattern 5: Disabled Field Props

```javascript
const form = Forms.create({
  email: '',
  confirmEmail: ''
});

function getConditionalFieldProps(field, isDisabled) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    disabled: isDisabled(),
    onChange: isDisabled() ? null : baseProps.onChange,
    onBlur: isDisabled() ? null : baseProps.onBlur
  };
}

// Disable confirmEmail until email is valid
const confirmEmailProps = getConditionalFieldProps(
  'confirmEmail',
  () => !form.values.email || form.hasError('email')
);

effect(() => {
  confirmEmailInput.disabled = !form.values.email || form.hasError('email');
});
```

 

### Pattern 6: Field Props with Validation Feedback

```javascript
const form = Forms.create(
  { password: '' },
  { password: (value) => value.length < 8 ? 'Too short' : '' }
);

function getValidatedFieldProps(field) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    onBlur: (e) => {
      baseProps.onBlur(e);

      // Show validation feedback
      setTimeout(() => {
        if (form.shouldShowError(field)) {
          showValidationTooltip(e.target, form.getError(field));
        } else if (form.values[field]) {
          showSuccessIndicator(e.target);
        }
      }, 0);
    }
  };
}

const passwordProps = getValidatedFieldProps('password');
```

 

### Pattern 7: Multi-Field Component

```javascript
function createFormField(config) {
  const { label, field, type = 'text', form } = config;

  const container = document.createElement('div');
  container.className = 'form-field';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.htmlFor = field;

  const input = document.createElement('input');
  const props = form.getFieldProps(field);

  input.id = field;
  input.name = props.name;
  input.type = type;
  input.addEventListener('input', props.onChange);
  input.addEventListener('blur', props.onBlur);

  const errorEl = document.createElement('span');
  errorEl.className = 'error';

  // Reactive updates
  effect(() => {
    input.value = form.values[field];

    if (form.shouldShowError(field)) {
      errorEl.textContent = form.getError(field);
      errorEl.style.display = 'block';
      input.classList.add('error');
    } else {
      errorEl.style.display = 'none';
      input.classList.remove('error');
    }
  });

  container.appendChild(labelEl);
  container.appendChild(input);
  container.appendChild(errorEl);

  return container;
}

// Use it
const emailField = createFormField({
  label: 'Email',
  field: 'email',
  type: 'email',
  form
});

formContainer.appendChild(emailField);
```

 

### Pattern 8: Field Props with Analytics

```javascript
const form = Forms.create({ email: '', password: '' });

function getAnalyticsFieldProps(field) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    onChange: (e) => {
      baseProps.onChange(e);
      analytics.track('field_changed', { field, value: e.target.value });
    },
    onBlur: (e) => {
      baseProps.onBlur(e);
      analytics.track('field_blurred', {
        field,
        hasError: form.hasError(field),
        isEmpty: !form.values[field]
      });
    }
  };
}

const emailProps = getAnalyticsFieldProps('email');
```

 

### Pattern 9: Field Props with Autocomplete

```javascript
const form = Forms.create({ city: '' });

function getAutocompleteFieldProps(field, fetchSuggestions) {
  const baseProps = form.getFieldProps(field);

  return {
    ...baseProps,
    onChange: async (e) => {
      baseProps.onChange(e);

      // Fetch autocomplete suggestions
      if (e.target.value.length >= 2) {
        const suggestions = await fetchSuggestions(e.target.value);
        showSuggestions(e.target, suggestions);
      }
    }
  };
}

async function fetchCities(query) {
  const response = await fetch(`/api/cities?q=${query}`);
  return await response.json();
}

const cityProps = getAutocompleteFieldProps('city', fetchCities);
```

 

### Pattern 10: Form Generator from Schema

```javascript
const schema = [
  { field: 'firstName', label: 'First Name', type: 'text' },
  { field: 'lastName', label: 'Last Name', type: 'text' },
  { field: 'email', label: 'Email', type: 'email' },
  { field: 'age', label: 'Age', type: 'number' }
];

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  age: 0
};

const form = Forms.create(initialValues);

// Generate form from schema
schema.forEach(({ field, label, type }) => {
  const wrapper = document.createElement('div');

  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = type;

  // Apply field props
  const props = form.getFieldProps(field);
  input.name = props.name;
  input.addEventListener('input', props.onChange);
  input.addEventListener('blur', props.onBlur);

  effect(() => {
    input.value = form.values[field];
  });

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);
  formContainer.appendChild(wrapper);
});
```

 

## Common Pitfalls

### Pitfall 1: Not Updating Value Reactively

```javascript
const form = Forms.create({ email: '' });

const props = form.getFieldProps('email');

// ❌ Setting value once - doesn't update
emailInput.value = props.value;
emailInput.addEventListener('input', props.onChange);

// User types, form updates, but input value doesn't sync

// ✅ Keep value in sync reactively
effect(() => {
  emailInput.value = form.values.email;
});

emailInput.addEventListener('input', props.onChange);
```

 

### Pitfall 2: Spreading in Vanilla JS

```javascript
const form = Forms.create({ email: '' });

// ❌ Spread doesn't work in vanilla JS
const props = form.getFieldProps('email');
emailInput = { ...props }; // This creates new object, doesn't set on input

// ✅ Assign properties individually
emailInput.name = props.name;
emailInput.value = props.value;
emailInput.addEventListener('input', props.onChange);
emailInput.addEventListener('blur', props.onBlur);
```

 

### Pitfall 3: Calling on Non-Existent Field

```javascript
const form = Forms.create({ email: '' });

// ❌ Field doesn't exist in form
const props = form.getFieldProps('username');
// Returns props but field not in form.values

// ✅ Ensure field exists
if ('username' in form.values) {
  const props = form.getFieldProps('username');
}
```

 

### Pitfall 4: Forgetting Event Listeners

```javascript
const form = Forms.create({ email: '' });

const props = form.getFieldProps('email');

// ❌ Only setting name and value
emailInput.name = props.name;
emailInput.value = props.value;
// Input won't update form!

// ✅ Add event listeners
emailInput.addEventListener('input', props.onChange);
emailInput.addEventListener('blur', props.onBlur);
```

 

### Pitfall 5: Reusing Props Object

```javascript
const form = Forms.create({ email: '' });

// ❌ Reusing same props object
const props = form.getFieldProps('email');

emailInput1.name = props.name;
emailInput2.name = props.name;
// Both inputs control same field - might be confusing

// ✅ Use unique field names
const email1Props = form.getFieldProps('email1');
const email2Props = form.getFieldProps('email2');
```

 

## Summary

### Key Takeaways

1. **`getFieldProps()` returns complete binding object** - name, value, onChange, onBlur.

2. **Perfect for frameworks** - works seamlessly with React/Vue spread syntax.

3. **Reduces boilerplate** - one call replaces 4+ lines of code.

4. **Consistent pattern** - same approach for all fields.

5. **Extensible** - wrap to add custom behavior.

6. **Combines handleChange and handleBlur** - complete field binding.

### When to Use getFieldProps()

✅ **Use getFieldProps() for:**
- Framework integration (React, Vue)
- Reducing boilerplate
- Consistent field binding
- Quick form setup
- Component libraries

❌ **Don't use getFieldProps() when:**
- Need highly custom event handlers
- Not using name/onChange/onBlur pattern
- Binding non-standard inputs

### Comparison: Manual vs getFieldProps()

| Aspect | Manual | getFieldProps() |
|  --|  --|     --|
| **Lines per field** | 4+ lines | 1 line |
| **Boilerplate** | High | Very low |
| **Framework integration** | Complex | Native (spread) |
| **Consistency** | Manual | Automatic |
| **Error-prone** | Yes | No |
| **Extensibility** | Limited | Easy to wrap |

### Returned Object Structure

```javascript
form.getFieldProps('email')
// Returns:
{
  name: 'email',
  value: 'current@value.com',
  onChange: form.handleChange,
  onBlur: form.handleBlur
}
```

### Typical Usage Pattern

```javascript
// 1. Create form
const form = Forms.create({ email: '' });

// 2. Get props
const props = form.getFieldProps('email');

// 3. Apply to input (vanilla JS)
emailInput.name = props.name;
emailInput.addEventListener('input', props.onChange);
emailInput.addEventListener('blur', props.onBlur);
effect(() => {
  emailInput.value = form.values.email;
});

// Or with React - even simpler:
<input type="email" {...form.getFieldProps('email')} />
```

### Related Methods

- **`handleChange(event)`** - Update field value
- **`handleBlur(event)`** - Mark field as touched
- **`setValue(field, value)`** - Manual value updates
- **`setTouched(field, touched)`** - Manual touch updates

### One-Line Rule

> **`form.getFieldProps(field)` returns everything needed to bind an input - name, value, onChange, and onBlur - in a single object, perfect for spreading in React/Vue or applying in vanilla JS.**

 

**What's Next?**

- Master framework integration patterns
- Build reusable form components
- Explore advanced field binding techniques
