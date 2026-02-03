# form.errorFields

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    username: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 6 ? 'Too short' : '',
    username: (value) => value.length < 3 ? 'Too short' : ''
  }
);

console.log(form.errorFields); // [] (no errors yet)

form.setValue('email', 'bad-email');
console.log(form.errorFields); // ['email']

form.setValue('password', '123');
console.log(form.errorFields); // ['email', 'password']

form.setValue('username', 'ab');
console.log(form.errorFields); // ['email', 'password', 'username']

form.setValue('email', 'user@example.com');
console.log(form.errorFields); // ['password', 'username']
```

**What just happened?** `form.errorFields` gives you an array of field names that currently have validation errors!

 

## What is form.errorFields?

`form.errorFields` is a **computed array property** that returns the names of all fields that currently have validation errors.

Simply put, it converts the `form.errors` object into an array of field names that have non-empty error messages.

 

## Syntax

```javascript
// Get array of fields with errors
const fieldsWithErrors = form.errorFields;

// Iterate over error fields
form.errorFields.forEach(field => {
  console.log(`${field} has an error`);
});

// Check count
console.log(`${form.errorFields.length} fields have errors`);
```

**Type:** `Array<string>` (read-only, computed)

**Computation:** `Object.keys(form.errors).filter(key => form.errors[key])`

 

## Why Does This Exist?

### Converting Error Object to Array

```javascript
// Without errorFields (manual conversion)
const errorFieldsArray = Object.keys(form.errors).filter(
  key => form.errors[key]
);

// With errorFields (automatic)
const errorFieldsArray = form.errorFields;
```

**Benefits:**
✅ Cleaner code
✅ Array methods available (map, filter, forEach)
✅ Easy to count: `form.errorFields.length`
✅ Reactive - updates automatically when validation changes

 

## Basic Usage

### Example 1: Display Error Count

```javascript
const form = Forms.create(
  {
    name: '',
    email: '',
    phone: ''
  },
  {
    name: (value) => !value ? 'Required' : '',
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    phone: (value) => !value ? 'Required' : ''
  }
);

effect(() => {
  const errorCountEl = document.getElementById('error-count');

  const errorCount = form.errorFields.length;

  if (errorCount === 0) {
    errorCountEl.textContent = 'All fields valid!';
    errorCountEl.style.color = 'green';
  } else {
    errorCountEl.textContent = `${errorCount} field(s) have errors`;
    errorCountEl.style.color = 'red';
  }
});
```

 

### Example 2: List Error Fields

```javascript
const form = Forms.create(
  {
    field1: '',
    field2: '',
    field3: ''
  },
  {
    field1: (value) => !value ? 'Required' : '',
    field2: (value) => !value ? 'Required' : '',
    field3: (value) => !value ? 'Required' : ''
  }
);

form.setValue('field1', 'valid');

// Show which fields have errors
console.log('Fields with errors:', form.errorFields);
// ['field2', 'field3']

form.errorFields.forEach(field => {
  console.log(`❌ ${field}: ${form.errors[field]}`);
});
// ❌ field2: Required
// ❌ field3: Required
```

 

### Example 3: Disable Submit Until Valid

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 6 ? 'Too short' : ''
  }
);

const submitButton = document.getElementById('submit');

effect(() => {
  // Disable if any fields have errors
  submitButton.disabled = form.errorFields.length > 0;

  if (form.errorFields.length > 0) {
    submitButton.textContent = `Fix ${form.errorFields.length} error(s)`;
  } else {
    submitButton.textContent = 'Submit';
  }
});
```

 

### Example 4: Iterate and Display Errors

```javascript
const form = Forms.create(
  {
    username: '',
    email: '',
    password: ''
  },
  {
    username: (value) => value.length < 3 ? 'Too short' : '',
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Must be 8+ chars' : ''
  }
);

form.setValue('username', 'ab');
form.setValue('email', 'bad-email');

effect(() => {
  const errorListEl = document.getElementById('error-list');

  if (form.errorFields.length === 0) {
    errorListEl.innerHTML = '<p>No errors!</p>';
    return;
  }

  const errorItems = form.errorFields.map(field => {
    return `<li><strong>${field}:</strong> ${form.errors[field]}</li>`;
  }).join('');

  errorListEl.innerHTML = `<ul>${errorItems}</ul>`;
});

// Renders:
// <ul>
//   <li><strong>username:</strong> Too short</li>
//   <li><strong>email:</strong> Invalid email</li>
// </ul>
```

 

## Advanced Patterns

### Pattern 1: Error Summary Report

```javascript
const form = Forms.create(
  {
    field1: '',
    field2: '',
    field3: '',
    field4: ''
  },
  {
    field1: (value) => !value ? 'Required' : '',
    field2: (value) => !value ? 'Required' : '',
    field3: (value) => !value ? 'Required' : '',
    field4: (value) => !value ? 'Required' : ''
  }
);

function getErrorReport() {
  const totalFields = Object.keys(form.values).length;
  const errorCount = form.errorFields.length;
  const validCount = totalFields - errorCount;

  return {
    totalFields,
    errorCount,
    validCount,
    errorFields: form.errorFields,
    validFields: Object.keys(form.values).filter(
      field => !form.errorFields.includes(field)
    ),
    errorMessages: form.errorFields.map(field => ({
      field,
      message: form.errors[field]
    }))
  };
}

form.setValue('field1', 'valid');
form.setValue('field2', 'valid');

console.log(getErrorReport());
// {
//   totalFields: 4,
//   errorCount: 2,
//   validCount: 2,
//   errorFields: ['field3', 'field4'],
//   validFields: ['field1', 'field2'],
//   errorMessages: [
//     { field: 'field3', message: 'Required' },
//     { field: 'field4', message: 'Required' }
//   ]
// }
```

 

### Pattern 2: Focus First Error Field

```javascript
const form = Forms.create(
  {
    name: '',
    email: '',
    password: ''
  },
  {
    name: (value) => !value ? 'Required' : '',
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

function focusFirstError() {
  if (form.errorFields.length === 0) return;

  const firstErrorField = form.errorFields[0];
  const inputEl = document.querySelector(`[name="${firstErrorField}"]`);

  if (inputEl) {
    inputEl.focus();
    inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// On form submission attempt
submitButton.addEventListener('click', (e) => {
  e.preventDefault();

  if (form.errorFields.length > 0) {
    focusFirstError();
    alert(`Please fix ${form.errorFields.length} error(s)`);
  } else {
    form.handleSubmit();
  }
});
```

 

### Pattern 3: Progressive Validation Indicator

```javascript
const form = Forms.create(
  {
    step1: '',
    step2: '',
    step3: '',
    step4: ''
  },
  {
    step1: (value) => !value ? 'Required' : '',
    step2: (value) => !value ? 'Required' : '',
    step3: (value) => !value ? 'Required' : '',
    step4: (value) => !value ? 'Required' : ''
  }
);

effect(() => {
  const totalSteps = Object.keys(form.values).length;
  const validSteps = totalSteps - form.errorFields.length;
  const percentage = (validSteps / totalSteps) * 100;

  const progressEl = document.getElementById('progress');
  progressEl.style.width = `${percentage}%`;

  const statusEl = document.getElementById('status');
  statusEl.textContent = `${validSteps}/${totalSteps} steps valid`;

  if (form.errorFields.length === 0) {
    statusEl.textContent += ' ✅ Ready to submit!';
  }
});
```

 

### Pattern 4: Field-Specific Error Highlighting

```javascript
const form = Forms.create(
  {
    username: '',
    email: '',
    password: ''
  },
  {
    username: (value) => value.length < 3 ? 'Too short' : '',
    email: (value) => !value.includes('@') ? 'Invalid' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

effect(() => {
  // Update all field visuals
  Object.keys(form.values).forEach(field => {
    const inputEl = document.querySelector(`[name="${field}"]`);
    const errorEl = document.querySelector(`#${field}-error`);

    if (form.errorFields.includes(field)) {
      // Field has error
      inputEl.classList.add('error');
      inputEl.classList.remove('valid');
      errorEl.textContent = form.errors[field];
      errorEl.style.display = 'block';
    } else {
      // Field is valid
      inputEl.classList.add('valid');
      inputEl.classList.remove('error');
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  });
});
```

 

### Pattern 5: Smart Validation Messages

```javascript
const form = Forms.create(
  {
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: ''
  },
  {
    field1: (value) => !value ? 'Required' : '',
    field2: (value) => !value ? 'Required' : '',
    field3: (value) => !value ? 'Required' : '',
    field4: (value) => !value ? 'Required' : '',
    field5: (value) => !value ? 'Required' : ''
  }
);

effect(() => {
  const messageEl = document.getElementById('validation-message');
  const errorCount = form.errorFields.length;

  if (errorCount === 0) {
    messageEl.textContent = '✅ All fields are valid!';
    messageEl.className = 'success';
  } else if (errorCount === 1) {
    messageEl.textContent = `⚠️ Please fix the ${form.errorFields[0]} field`;
    messageEl.className = 'warning';
  } else if (errorCount <= 3) {
    messageEl.textContent = `⚠️ Please fix: ${form.errorFields.join(', ')}`;
    messageEl.className = 'warning';
  } else {
    messageEl.textContent = `❌ ${errorCount} fields need attention`;
    messageEl.className = 'error';
  }
});
```

 

### Pattern 6: Conditional Field Validation

```javascript
const form = Forms.create(
  {
    requiresAddress: false,
    street: '',
    city: '',
    zipCode: ''
  },
  {
    street: (value, allValues) => {
      if (!allValues.requiresAddress) return '';
      return !value ? 'Required when address is needed' : '';
    },
    city: (value, allValues) => {
      if (!allValues.requiresAddress) return '';
      return !value ? 'Required when address is needed' : '';
    },
    zipCode: (value, allValues) => {
      if (!allValues.requiresAddress) return '';
      return !value ? 'Required when address is needed' : '';
    }
  }
);

effect(() => {
  const addressErrorsEl = document.getElementById('address-errors');

  if (form.values.requiresAddress) {
    const addressFields = ['street', 'city', 'zipCode'];
    const addressErrors = form.errorFields.filter(field =>
      addressFields.includes(field)
    );

    if (addressErrors.length > 0) {
      addressErrorsEl.textContent =
        `Address incomplete: ${addressErrors.length} field(s) missing`;
    } else {
      addressErrorsEl.textContent = 'Address complete!';
    }
  } else {
    addressErrorsEl.textContent = 'Address not required';
  }
});
```

 

### Pattern 7: Error Field Analytics

```javascript
const form = Forms.create(
  {
    email: '',
    password: '',
    confirmPassword: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : '',
    confirmPassword: (value, allValues) =>
      value !== allValues.password ? 'Passwords must match' : ''
  }
);

// Track error history
const errorHistory = [];

effect(() => {
  const timestamp = new Date().toISOString();

  errorHistory.push({
    timestamp,
    errorCount: form.errorFields.length,
    errorFields: [...form.errorFields],
    errors: form.errorFields.map(field => ({
      field,
      message: form.errors[field]
    }))
  });

  // Keep last 100 entries
  if (errorHistory.length > 100) {
    errorHistory.shift();
  }
});

// Later: analyze error patterns
function getMostCommonErrors() {
  const fieldErrorCounts = {};

  errorHistory.forEach(entry => {
    entry.errorFields.forEach(field => {
      fieldErrorCounts[field] = (fieldErrorCounts[field] || 0) + 1;
    });
  });

  return Object.entries(fieldErrorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([field, count]) => ({ field, count }));
}

console.log(getMostCommonErrors());
// [
//   { field: 'confirmPassword', count: 15 },
//   { field: 'password', count: 8 },
//   { field: 'email', count: 3 }
// ]
```

 

### Pattern 8: Multi-Step Form Validation

```javascript
const form = Forms.create(
  {
    // Step 1
    firstName: '',
    lastName: '',

    // Step 2
    email: '',
    phone: '',

    // Step 3
    address: '',
    city: ''
  },
  {
    firstName: (value) => !value ? 'Required' : '',
    lastName: (value) => !value ? 'Required' : '',
    email: (value) => !value.includes('@') ? 'Invalid' : '',
    phone: (value) => !value ? 'Required' : '',
    address: (value) => !value ? 'Required' : '',
    city: (value) => !value ? 'Required' : ''
  }
);

const steps = [
  ['firstName', 'lastName'],
  ['email', 'phone'],
  ['address', 'city']
];

let currentStep = 0;

function canProceedToNextStep() {
  const currentStepFields = steps[currentStep];
  const currentStepErrors = form.errorFields.filter(field =>
    currentStepFields.includes(field)
  );

  return currentStepErrors.length === 0;
}

nextButton.addEventListener('click', () => {
  if (canProceedToNextStep()) {
    currentStep++;
    showStep(currentStep);
  } else {
    const stepErrors = form.errorFields.filter(field =>
      steps[currentStep].includes(field)
    );
    alert(`Please fix ${stepErrors.length} error(s) before proceeding`);
  }
});

effect(() => {
  nextButton.disabled = !canProceedToNextStep();

  const currentStepErrors = form.errorFields.filter(field =>
    steps[currentStep].includes(field)
  );

  if (currentStepErrors.length > 0) {
    nextButton.textContent = `Fix ${currentStepErrors.length} error(s)`;
  } else {
    nextButton.textContent = 'Next Step';
  }
});
```

 

## Summary

### Key Takeaways

1. **`form.errorFields` is an array** of field names that currently have validation errors.

2. **Computed from `form.errors`** - filters out fields with empty error messages.

3. **Use `.length` for count** - how many fields have errors.

4. **Array methods available** - map, filter, forEach, find, etc.

5. **Reactive** - updates automatically when validation changes.

6. **Opposite of valid fields** - all fields NOT in this array are valid.

### One-Line Rule

> **`form.errorFields` converts the errors object to an array of field names with errors - use it when you need to iterate, count, or identify which fields are invalid.**

 

**What's Next?**

- Learn about `form.touchedFields` for user interaction tracking
- Explore validation timing strategies
- Master error display patterns
