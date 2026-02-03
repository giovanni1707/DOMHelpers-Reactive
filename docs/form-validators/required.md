# Validators.required()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    username: '',
    age: ''
  },
  {
    email: Forms.validators.required('Email is required'),
    username: Forms.validators.required('Username is required'),
    age: Forms.validators.required('Age is required')
  }
);

// User leaves field empty
form.setValue('email', '');
form.validateField('email');

console.log(form.getError('email')); // "Email is required"

// User enters value
form.setValue('email', 'user@example.com');
form.validateField('email');

console.log(form.getError('email')); // "" (no error)
```

**What just happened?** `Validators.required()` created a validator that checks if the field has a value and shows your custom error message when it's empty!

 

## What is Validators.required()?

`Validators.required()` is a **built-in validator factory that creates a required field validator**.

Simply put, it ensures a field is not empty, returning an error message when the value is missing.

**Key characteristics:**
- ✅ Returns validator function
- ✅ Checks for empty/null/undefined values
- ✅ Custom error message
- ✅ Trims whitespace for strings
- ✅ Works with all field types
- ✅ Most commonly used validator

 

## Syntax

```javascript
// Create required validator with custom message
const validator = Forms.validators.required('This field is required');

// Use in form
const form = Forms.create(
  { email: '' },
  { email: Forms.validators.required('Email is required') }
);

// Shorthand alias
const validator = Forms.v.required('Required');
```

**Parameters:**
- `message` (string, optional) - Custom error message. Default: `'This field is required'`

**Returns:** `function(value) => string` - Validator function that returns error message or empty string

**Validation Logic:**
```javascript
// Returns error if:
- value === undefined
- value === null
- value === '' (empty string)
- value === '   ' (only whitespace)
- value === 0 (number zero is valid!)
- value === false (boolean false is valid!)
```

 

## Why Does This Exist?

### The Challenge: Manual Required Validation

Without `Validators.required()`, you need to write validation logic repeatedly.

```javascript
const form = Forms.create(
  {
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  },
  {
    // ❌ Repetitive validation logic
    email: (value) => {
      if (!value || value.trim() === '') {
        return 'Email is required';
      }
      return '';
    },
    username: (value) => {
      if (!value || value.trim() === '') {
        return 'Username is required';
      }
      return '';
    },
    password: (value) => {
      if (!value || value.trim() === '') {
        return 'Password is required';
      }
      return '';
    },
    firstName: (value) => {
      if (!value || value.trim() === '') {
        return 'First name is required';
      }
      return '';
    },
    lastName: (value) => {
      if (!value || value.trim() === '') {
        return 'Last name is required';
      }
      return '';
    }
  }
);

// 5 fields × 6 lines each = 30 lines of repetitive code!
```

**Problems:**
❌ **Highly repetitive** - Same logic copied everywhere
❌ **Inconsistent** - Easy to forget edge cases in some fields
❌ **Maintenance burden** - Update logic in multiple places
❌ **Error-prone** - Might handle whitespace differently
❌ **Verbose** - 6+ lines per field

### The Solution with Validators.required()

```javascript
const form = Forms.create(
  {
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  },
  {
    // ✅ One line per field
    email: Forms.v.required('Email is required'),
    username: Forms.v.required('Username is required'),
    password: Forms.v.required('Password is required'),
    firstName: Forms.v.required('First name is required'),
    lastName: Forms.v.required('Last name is required')
  }
);

// 5 fields × 1 line each = 5 lines total!
```

**Benefits:**
✅ **Consistent validation** - Same logic everywhere
✅ **Less code** - One line per field
✅ **Maintainable** - Update validator in one place
✅ **Clear intent** - Code reads like documentation
✅ **Fewer bugs** - Battle-tested implementation

 

## Mental Model

Think of `Validators.required()` as a **bouncer at a club** - nobody gets in without a valid entry ticket (value).

### Visual Flow

```
User submits field
         ↓
Validators.required(message)
         ↓
Check value:
         ↓
Empty? ──YES──> Return error message
   │
   NO
   ↓
Return '' (valid)
```

### Validation Decision Tree

```
Value Check
    ↓
undefined? ──YES──> ❌ Error
    │
    NO
    ↓
null? ──YES──> ❌ Error
    │
    NO
    ↓
Empty string ''? ──YES──> ❌ Error
    │
    NO
    ↓
Only whitespace '  '? ──YES──> ❌ Error
    │
    NO
    ↓
✅ Valid (has content)
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
Forms.v.required('Email is required')

// Here's what happens internally:
function required(message = 'This field is required') {
  1️⃣ Store the custom message
     const errorMessage = message;

  2️⃣ Return validator function
     return function(value) {

       3️⃣ Check if value is missing
          if (value === undefined || value === null) {
            return errorMessage;
          }

       4️⃣ Handle string values (trim whitespace)
          if (typeof value === 'string') {
            if (value.trim() === '') {
              return errorMessage;
            }
          }

       5️⃣ Value exists and is not empty
          return ''; // Valid
     };
}
```

### Validation Flow Diagram

```
Validators.required('Required')
         ↓
Creates validator function
         ↓
Form calls validator(value)
         ↓
┌────────────────────────┐
│ Check Value            │
│ - undefined/null?      │
│ - Empty string?        │
│ - Whitespace only?     │
└────────────────────────┘
         ↓
Return error or ''
         ↓
form.errors updates
         ↓
UI shows error if needed
```

 

## Basic Usage

### Example 1: Simple Required Fields

```javascript
const form = Forms.create(
  {
    name: '',
    email: ''
  },
  {
    name: Forms.v.required('Name is required'),
    email: Forms.v.required('Email is required')
  }
);

// Test validation
form.validate();

console.log(form.errors);
// {
//   name: 'Name is required',
//   email: 'Email is required'
// }

// Fill in fields
form.setValue('name', 'John');
form.setValue('email', 'john@example.com');
form.validate();

console.log(form.isValid); // true
console.log(form.errors); // {}
```

 

### Example 2: Required with Default Message

```javascript
const form = Forms.create(
  {
    username: ''
  },
  {
    // Use default message
    username: Forms.v.required()
  }
);

form.validate();
console.log(form.getError('username')); // "This field is required"
```

 

### Example 3: Required Checkbox

```javascript
const form = Forms.create(
  {
    acceptTerms: false
  },
  {
    acceptTerms: Forms.v.required('You must accept the terms')
  }
);

// Checkbox unchecked
form.validate();
console.log(form.getError('acceptTerms')); // "You must accept the terms"

// Checkbox checked
form.setValue('acceptTerms', true);
form.validate();
console.log(form.getError('acceptTerms')); // "" (valid)
```

 

### Example 4: Required Number

```javascript
const form = Forms.create(
  {
    age: null,
    quantity: ''
  },
  {
    age: Forms.v.required('Age is required'),
    quantity: Forms.v.required('Quantity is required')
  }
);

// Note: 0 is a valid value!
form.setValue('age', 0);
form.validateField('age');
console.log(form.getError('age')); // "" (0 is valid)

form.setValue('quantity', 5);
form.validateField('quantity');
console.log(form.getError('quantity')); // "" (valid)
```

 

### Example 5: Whitespace Handling

```javascript
const form = Forms.create(
  { name: '' },
  { name: Forms.v.required('Name is required') }
);

// Empty string
form.setValue('name', '');
form.validateField('name');
console.log(form.hasError('name')); // true

// Only whitespace
form.setValue('name', '   ');
form.validateField('name');
console.log(form.hasError('name')); // true (trimmed to empty)

// Valid value
form.setValue('name', 'John');
form.validateField('name');
console.log(form.hasError('name')); // false
```

 

## Advanced Patterns

### Pattern 1: Conditional Required Fields

```javascript
const form = Forms.create(
  {
    country: 'us',
    state: '',
    province: ''
  },
  {
    country: Forms.v.required('Country is required'),

    // State required only for US
    state: (value, allValues) => {
      if (allValues.country === 'us') {
        return Forms.v.required('State is required')(value);
      }
      return '';
    },

    // Province required only for Canada
    province: (value, allValues) => {
      if (allValues.country === 'ca') {
        return Forms.v.required('Province is required')(value);
      }
      return '';
    }
  }
);

// US selected - state required
form.setValue('country', 'us');
form.validate();
console.log(form.hasError('state')); // true
console.log(form.hasError('province')); // false

// Canada selected - province required
form.setValue('country', 'ca');
form.validate();
console.log(form.hasError('state')); // false
console.log(form.hasError('province')); // true
```

 

### Pattern 2: Dynamic Error Messages

```javascript
function requiredWithContext(fieldLabel) {
  return Forms.v.required(`${fieldLabel} is required`);
}

const form = Forms.create(
  {
    firstName: '',
    lastName: '',
    email: ''
  },
  {
    firstName: requiredWithContext('First name'),
    lastName: requiredWithContext('Last name'),
    email: requiredWithContext('Email address')
  }
);

form.validate();
console.log(form.getError('firstName')); // "First name is required"
console.log(form.getError('email')); // "Email address is required"
```

 

### Pattern 3: Required with Visual Indicator

```javascript
const form = Forms.create(
  {
    name: '',
    email: ''
  },
  {
    name: Forms.v.required('Required'),
    email: Forms.v.required('Required')
  }
);

// Add asterisk to required field labels
document.querySelectorAll('label').forEach(label => {
  const fieldName = label.getAttribute('for');

  // Check if field has required validator
  if (form.values.hasOwnProperty(fieldName)) {
    label.innerHTML += ' <span class="required">*</span>';
  }
});
```

 

### Pattern 4: Required with Trim Utility

```javascript
const form = Forms.create(
  {
    username: ''
  },
  {
    username: Forms.v.required('Username is required')
  }
);

// Auto-trim on blur
usernameInput.addEventListener('blur', (e) => {
  const trimmed = e.target.value.trim();
  form.setValue('username', trimmed);
  e.target.value = trimmed;
});
```

 

### Pattern 5: Required Array/Multi-Select

```javascript
const form = Forms.create(
  {
    interests: []
  },
  {
    interests: (value) => {
      if (!value || value.length === 0) {
        return 'Please select at least one interest';
      }
      return '';
    }
  }
);

// Handle multi-select
checkboxGroup.addEventListener('change', (e) => {
  const checked = Array.from(
    checkboxGroup.querySelectorAll('input:checked')
  ).map(cb => cb.value);

  form.setValue('interests', checked);
});
```

 

### Pattern 6: Required with Auto-Focus

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: Forms.v.required('Email is required'),
    password: Forms.v.required('Password is required')
  }
);

submitButton.addEventListener('click', () => {
  form.validate();
  form.touchAll();

  if (!form.isValid) {
    // Focus first required field with error
    const firstError = form.errorFields[0];
    const input = document.querySelector(`[name="${firstError}"]`);
    if (input) input.focus();
  }
});
```

 

### Pattern 7: Required with Character Count

```javascript
const form = Forms.create(
  {
    bio: ''
  },
  {
    bio: Forms.v.required('Bio is required')
  }
);

bioInput.addEventListener('input', () => {
  const length = form.values.bio.length;
  charCount.textContent = `${length} characters`;

  if (length === 0) {
    charCount.classList.add('error');
  } else {
    charCount.classList.remove('error');
  }
});
```

 

### Pattern 8: Required with Placeholder Fallback

```javascript
const form = Forms.create(
  {
    name: ''
  },
  {
    name: Forms.v.required()
  }
);

// Show placeholder as error hint
effect(() => {
  if (form.shouldShowError('name')) {
    nameInput.placeholder = 'This field is required';
    nameInput.classList.add('error-placeholder');
  } else {
    nameInput.placeholder = 'Enter your name';
    nameInput.classList.remove('error-placeholder');
  }
});
```

 

### Pattern 9: Required with Accessibility

```javascript
const form = Forms.create(
  {
    email: ''
  },
  {
    email: Forms.v.required('Email is required')
  }
);

// Add ARIA attributes
effect(() => {
  if (form.shouldShowError('email')) {
    emailInput.setAttribute('aria-invalid', 'true');
    emailInput.setAttribute('aria-describedby', 'email-error');
  } else {
    emailInput.removeAttribute('aria-invalid');
    emailInput.removeAttribute('aria-describedby');
  }
});
```

 

### Pattern 10: Batch Required Validation

```javascript
function createRequiredFields(fields) {
  const values = {};
  const validators = {};

  fields.forEach(({ name, label }) => {
    values[name] = '';
    validators[name] = Forms.v.required(`${label} is required`);
  });

  return Forms.create(values, validators);
}

const form = createRequiredFields([
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' }
]);

form.validate();
console.log(form.errors);
// {
//   firstName: 'First Name is required',
//   lastName: 'Last Name is required',
//   email: 'Email is required',
//   phone: 'Phone is required'
// }
```

 

## Common Pitfalls

### Pitfall 1: Thinking 0 or false is Invalid

```javascript
const form = Forms.create(
  {
    age: 0,
    newsletter: false
  },
  {
    age: Forms.v.required('Age is required'),
    newsletter: Forms.v.required('Newsletter preference required')
  }
);

// ❌ Incorrect assumption - these ARE valid
form.validate();
console.log(form.hasError('age')); // false (0 is valid!)
console.log(form.hasError('newsletter')); // false (false is valid!)

// ✅ Only empty/null/undefined/whitespace are invalid
```

 

### Pitfall 2: Not Handling Whitespace

```javascript
const form = Forms.create(
  { name: '' },
  { name: Forms.v.required('Name is required') }
);

// ❌ User enters only spaces
nameInput.value = '    ';
form.handleChange({ target: nameInput });

form.validateField('name');
console.log(form.hasError('name')); // true (whitespace trimmed)

// ✅ Validators.required() automatically trims whitespace
```

 

### Pitfall 3: Using Wrong Message Type

```javascript
// ❌ Passing non-string message
const form = Forms.create(
  { email: '' },
  { email: Forms.v.required(null) } // Should be string
);

// ✅ Always use string messages
const form = Forms.create(
  { email: '' },
  { email: Forms.v.required('Email is required') }
);
```

 

### Pitfall 4: Not Validating on Submit

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.required('Email is required') }
);

// ❌ Submitting without validation
submitButton.addEventListener('click', () => {
  submitToAPI(form.values); // Might send invalid data!
});

// ✅ Validate before submitting
submitButton.addEventListener('click', async () => {
  const result = await form.submit(submitToAPI);
  // submit() validates automatically
});
```

 

### Pitfall 5: Forgetting to Show Errors

```javascript
const form = Forms.create(
  { email: '' },
  { email: Forms.v.required('Email is required') }
);

// ❌ Validation runs but errors not displayed
form.validate();

// ✅ Display errors to user
effect(() => {
  if (form.shouldShowError('email')) {
    errorDiv.textContent = form.getError('email');
    errorDiv.style.display = 'block';
  } else {
    errorDiv.style.display = 'none';
  }
});
```

 

## Summary

### Key Takeaways

1. **`Validators.required()` ensures field has value** - returns error if empty.

2. **Trims whitespace** - `'   '` is treated as empty.

3. **Zero and false are valid** - only empty/null/undefined fail.

4. **Custom error messages** - provide user-friendly messages.

5. **Most common validator** - almost every form uses it.

6. **Composable** - combine with other validators using `Validators.combine()`.

### When to Use Validators.required()

✅ **Use Validators.required() for:**
- Mandatory form fields
- Fields that must have a value
- Ensuring user input is provided
- Preventing empty submissions

❌ **Don't use Validators.required() when:**
- Field is optional
- Empty value is valid (use custom validator)
- Need complex conditional logic (use custom function)

### Validation Results

| Value | Valid? | Reason |
|  -|  --|  --|
| `''` | ❌ No | Empty string |
| `'  '` | ❌ No | Whitespace trimmed to empty |
| `null` | ❌ No | Null value |
| `undefined` | ❌ No | Undefined value |
| `0` | ✅ Yes | Zero is a valid number |
| `false` | ✅ Yes | Boolean false is valid |
| `'text'` | ✅ Yes | Has content |
| `[]` | ✅ Yes | Empty array is truthy |
| `{}` | ✅ Yes | Empty object is truthy |

### Related Validators

- **`Validators.email()`** - Validate email format
- **`Validators.minLength()`** - Minimum length (implies required)
- **`Validators.combine()`** - Combine with other validators
- **Custom validator** - Create your own required logic

### One-Line Rule

> **`Validators.required(message)` creates a validator that ensures a field has a non-empty value, returning a custom error message when the field is empty, null, undefined, or contains only whitespace.**

 

**What's Next?**

- Combine with `Validators.email()` for email fields
- Use `Validators.combine()` for multiple validations
- Create conditional required validators
