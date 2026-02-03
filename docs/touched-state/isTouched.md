# form.isTouched()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Check if fields are touched
console.log(form.isTouched('email')); // false (not touched yet)
console.log(form.isTouched('password')); // false
console.log(form.isTouched('username')); // false

// User interacts with email field
form.setValue('email', 'user@example.com');

console.log(form.isTouched('email')); // true (automatically touched by setValue)
console.log(form.isTouched('password')); // false (still untouched)

// Manually mark username as touched
form.setTouched('username', true);

console.log(form.isTouched('username')); // true

// Use in conditional logic
if (form.isTouched('email')) {
  console.log('Email field has been touched!');
}
```

**What just happened?** `isTouched()` checks if a specific field has been touched - perfect for conditional error display!

 

## What is form.isTouched()?

`form.isTouched()` is a **field touch state checking method** that returns true if a specific field has been touched by the user.

Simply put, it's a clean way to ask "has the user interacted with this field?"

**Key characteristics:**
- ✅ Returns boolean (true/false)
- ✅ Checks a single field
- ✅ Cleaner than accessing `form.touched[field]` directly
- ✅ Perfect for conditional error display
- ✅ Works great in reactive effects

 

## Syntax

```javascript
// Check if field is touched
const isTouched = form.isTouched(fieldName)

// Use in conditions
if (form.isTouched('email')) {
  // Show error if exists
}

// Use in reactive effects
effect(() => {
  if (form.isTouched('password') && form.hasError('password')) {
    showPasswordError();
  }
});
```

**Parameters:**
- `fieldName` (string) - The name of the field to check

**Returns:** `boolean` - `true` if field is touched, `false` otherwise

 

## Why Does This Exist?

### Providing Clean Boolean Checks

While you can check touched state directly, `isTouched()` provides a cleaner, more explicit API.

```javascript
const form = Forms.create({
  email: ''
});

form.setValue('email', 'user@example.com');

// Both work, but isTouched() is cleaner:
if (form.touched.email) { }           // Direct access
if (form.isTouched('email')) { }      // ✅ Explicit boolean check

// Also handles edge cases better:
form.setTouched('email', false);      // Mark as untouched
console.log(!!form.touched.email);    // false
console.log(form.isTouched('email')); // false (consistent)
```

**When to use isTouched():**
✅ **Conditional error display** - Show errors only after user touches field
✅ **UI state management** - Change styling based on touch state
✅ **Validation timing** - Control when validation runs
✅ **Form logic** - Branch based on touch state
✅ **Cleaner code** - More readable than `!!form.touched[field]`

 

## Mental Model

Think of `isTouched()` as a **yes/no question** about whether the user has interacted with a field.

### Visual Representation

```
Form State:
┌──────────────────────────┐
│ email: touched = true    │ → isTouched('email') → true
│ password: touched = false│ → isTouched('password') → false
│ username: touched = true │ → isTouched('username') → true
└──────────────────────────┘

Simple yes/no answer for each field!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.isTouched('email');

// Here's what happens internally:
1️⃣ Get the touched value for the field
   const touched = form.touched[field]

2️⃣ Convert to boolean (if needed)
   return !!touched

3️⃣ Return boolean result
   // true if touched, false otherwise
```

### Equivalent Check

```javascript
// These are equivalent:
form.isTouched('email')
!!form.touched.email
Boolean(form.touched.email)
form.touched.email === true
```

 

## Basic Usage

### Example 1: Show Error Only When Touched

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : ''
  }
);

effect(() => {
  const errorEl = document.getElementById('email-error');

  // Only show error if field is touched
  if (form.isTouched('email') && form.hasError('email')) {
    errorEl.textContent = form.getError('email');
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});
```

 

### Example 2: Conditional Field Styling

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

effect(() => {
  const emailInput = document.getElementById('email');

  if (form.isTouched('email')) {
    if (form.hasError('email')) {
      emailInput.classList.add('error');
      emailInput.classList.remove('valid');
    } else {
      emailInput.classList.add('valid');
      emailInput.classList.remove('error');
    }
  } else {
    emailInput.classList.remove('error', 'valid');
  }
});
```

 

### Example 3: Progressive Validation

```javascript
const form = Forms.create({
  password: '',
  confirmPassword: ''
});

effect(() => {
  const confirmErrorEl = document.getElementById('confirm-error');

  // Only validate confirmPassword if both fields are touched
  if (form.isTouched('password') && form.isTouched('confirmPassword')) {
    if (form.getValue('password') !== form.getValue('confirmPassword')) {
      confirmErrorEl.textContent = 'Passwords must match';
      confirmErrorEl.style.display = 'block';
    } else {
      confirmErrorEl.style.display = 'none';
    }
  }
});
```

 

### Example 4: Track Form Progress

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

function getFormProgress() {
  const fields = Object.keys(form.values);
  const touchedCount = fields.filter(field => form.isTouched(field)).length;
  const percentage = (touchedCount / fields.length) * 100;

  return {
    touchedCount,
    totalFields: fields.length,
    percentage
  };
}

effect(() => {
  const progress = getFormProgress();
  const progressEl = document.getElementById('progress');

  progressEl.textContent = `${progress.touchedCount}/${progress.totalFields} fields reviewed`;
  progressEl.style.width = `${progress.percentage}%`;
});
```

 

### Example 5: Enable Submit When All Touched

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const submitButton = document.getElementById('submit');

effect(() => {
  const allTouched = Object.keys(form.values).every(field =>
    form.isTouched(field)
  );

  submitButton.disabled = !allTouched;

  if (allTouched) {
    submitButton.textContent = 'Submit';
  } else {
    submitButton.textContent = 'Please review all fields';
  }
});
```

 

## Advanced Patterns

### Pattern 1: Smart Error Display Logic

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

function shouldShowError(field) {
  return form.isTouched(field) && form.hasError(field);
}

effect(() => {
  Object.keys(form.values).forEach(field => {
    const errorEl = document.getElementById(`${field}-error`);

    if (shouldShowError(field)) {
      errorEl.textContent = form.getError(field);
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  });
});
```

 

### Pattern 2: Field Status Indicator

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function getFieldStatus(field) {
  if (!form.isTouched(field)) {
    return { status: 'untouched', icon: '⚪', class: 'untouched' };
  }

  if (form.hasError(field)) {
    return { status: 'error', icon: '❌', class: 'error' };
  }

  return { status: 'valid', icon: '✅', class: 'valid' };
}

effect(() => {
  Object.keys(form.values).forEach(field => {
    const status = getFieldStatus(field);
    const indicatorEl = document.getElementById(`${field}-indicator`);

    indicatorEl.textContent = status.icon;
    indicatorEl.className = `indicator ${status.class}`;
  });
});
```

 

### Pattern 3: Conditional Required Fields

```javascript
const form = Forms.create({
  accountType: 'personal',
  companyName: '',
  taxId: ''
});

effect(() => {
  const isBusiness = form.getValue('accountType') === 'business';

  // Only show errors for business fields if business account
  if (isBusiness) {
    if (form.isTouched('companyName') && !form.getValue('companyName')) {
      showError('companyName', 'Company name required');
    }

    if (form.isTouched('taxId') && !form.getValue('taxId')) {
      showError('taxId', 'Tax ID required');
    }
  } else {
    // Hide business field errors for personal accounts
    hideError('companyName');
    hideError('taxId');
  }
});
```

 

### Pattern 4: Touch Analytics

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const touchTimestamps = {};

// Track when fields are touched
effect(() => {
  Object.keys(form.values).forEach(field => {
    if (form.isTouched(field) && !touchTimestamps[field]) {
      touchTimestamps[field] = Date.now();

      // Send analytics
      analytics.track('field_touched', {
        field,
        timestamp: touchTimestamps[field]
      });
    }
  });
});

function getTouchAnalytics() {
  const fields = Object.keys(form.values);

  return {
    touchedCount: fields.filter(f => form.isTouched(f)).length,
    untouchedCount: fields.filter(f => !form.isTouched(f)).length,
    firstTouchedField: Object.entries(touchTimestamps)
      .sort((a, b) => a[1] - b[1])[0]?.[0],
    lastTouchedField: Object.entries(touchTimestamps)
      .sort((a, b) => b[1] - a[1])[0]?.[0]
  };
}
```

 

### Pattern 5: Cascading Touch Validation

```javascript
const form = Forms.create({
  country: '',
  state: '',
  city: '',
  zipCode: ''
});

const fieldHierarchy = ['country', 'state', 'city', 'zipCode'];

effect(() => {
  fieldHierarchy.forEach((field, index) => {
    if (form.isTouched(field)) {
      // If this field is touched, show errors for all previous fields too
      for (let i = 0; i <= index; i++) {
        const prevField = fieldHierarchy[i];

        if (form.hasError(prevField)) {
          showError(prevField, form.getError(prevField));
        }
      }
    }
  });
});
```

 

### Pattern 6: Multi-Step Touch Tracking

```javascript
const form = Forms.create({
  step1_field1: '',
  step1_field2: '',
  step2_field1: '',
  step2_field2: '',
  step3_field1: ''
});

const steps = {
  1: ['step1_field1', 'step1_field2'],
  2: ['step2_field1', 'step2_field2'],
  3: ['step3_field1']
};

function isStepTouched(stepNumber) {
  const fields = steps[stepNumber];
  return fields.some(field => form.isTouched(field));
}

function getStepProgress(stepNumber) {
  const fields = steps[stepNumber];
  const touchedCount = fields.filter(f => form.isTouched(f)).length;

  return {
    touched: touchedCount,
    total: fields.length,
    percentage: (touchedCount / fields.length) * 100,
    allTouched: touchedCount === fields.length
  };
}

effect(() => {
  [1, 2, 3].forEach(stepNumber => {
    const progress = getStepProgress(stepNumber);
    const stepEl = document.getElementById(`step-${stepNumber}-progress`);

    stepEl.textContent = `${progress.percentage}% reviewed`;

    if (progress.allTouched) {
      stepEl.classList.add('complete');
    }
  });
});
```

 

### Pattern 7: Touch-Based Field Visibility

```javascript
const form = Forms.create({
  wantNewsletter: false,
  email: ''
});

effect(() => {
  const wantsNewsletter = form.getValue('wantNewsletter');
  const emailFieldEl = document.getElementById('email-field');

  if (wantsNewsletter) {
    emailFieldEl.style.display = 'block';

    // Show email error only if email field was touched
    if (form.isTouched('email') && form.hasError('email')) {
      showError('email', form.getError('email'));
    }
  } else {
    emailFieldEl.style.display = 'none';
    hideError('email');
  }
});
```

 

### Pattern 8: Validation Priority System

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const validationPriority = ['field1', 'field2', 'field3'];

function getNextFieldToValidate() {
  // Find first untouched field in priority order
  return validationPriority.find(field => !form.isTouched(field));
}

function getFirstTouchedErrorField() {
  // Find first touched field with error
  return validationPriority.find(field =>
    form.isTouched(field) && form.hasError(field)
  );
}

submitButton.addEventListener('click', () => {
  const firstError = getFirstTouchedErrorField();

  if (firstError) {
    // Focus first error in priority order
    document.querySelector(`[name="${firstError}"]`)?.focus();
  } else {
    const nextField = getNextFieldToValidate();

    if (nextField) {
      // Focus next untouched field
      document.querySelector(`[name="${nextField}"]`)?.focus();
    } else {
      // All fields touched and valid
      handleSubmit();
    }
  }
});
```

 

### Pattern 9: Touch-Based Auto-Save

```javascript
const form = Forms.create({
  title: '',
  content: '',
  tags: []
});

let saveTimeout;

effect(() => {
  const allFields = Object.keys(form.values);
  const anyTouched = allFields.some(field => form.isTouched(field));

  if (anyTouched) {
    // Debounce auto-save
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      autoSaveDraft(form.values);
    }, 2000);
  }
});

function autoSaveDraft(data) {
  localStorage.setItem('draft', JSON.stringify(data));
  showNotification('Draft saved');
}
```

 

### Pattern 10: Smart Help Text Display

```javascript
const form = Forms.create({
  password: '',
  email: ''
});

const helpText = {
  password: 'Password must be at least 8 characters',
  email: 'We\'ll never share your email'
};

effect(() => {
  Object.keys(helpText).forEach(field => {
    const helpEl = document.getElementById(`${field}-help`);

    // Show help text only if field is NOT touched yet
    if (!form.isTouched(field)) {
      helpEl.textContent = helpText[field];
      helpEl.style.display = 'block';
    } else {
      // Once touched, hide help and potentially show errors
      helpEl.style.display = 'none';

      if (form.hasError(field)) {
        const errorEl = document.getElementById(`${field}-error`);
        errorEl.textContent = form.getError(field);
        errorEl.style.display = 'block';
      }
    }
  });
});
```

 

## Common Pitfalls

### Pitfall 1: Confusing with isDirty

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

form.setTouched('email', true);

// ❌ Different concepts
console.log(form.isTouched('email')); // true (this field touched)
console.log(form.isDirty); // true (form has touched fields)

// isTouched = specific field touched
// isDirty = at least one field touched

// ✅ Use correctly
if (form.isTouched('email')) {
  // This specific field was touched
}

if (form.isDirty) {
  // Some field was touched
}
```

 

### Pitfall 2: Not Combining with Error Check

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: (value) => !value ? 'Required' : ''
  }
);

// ❌ Shows error even if not touched (poor UX)
effect(() => {
  if (form.hasError('email')) {
    showError(form.getError('email'));
  }
});

// ✅ Only show error when touched
effect(() => {
  if (form.isTouched('email') && form.hasError('email')) {
    showError(form.getError('email'));
  }
});
```

 

### Pitfall 3: Checking Non-Existent Fields

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// ❌ Field doesn't exist
console.log(form.isTouched('username')); // false (but misleading)

// ✅ Check if field exists first
if ('username' in form.values && form.isTouched('username')) {
  // Only runs if field exists
}
```

 

### Pitfall 4: Assuming Touch Means Valid

```javascript
const form = Forms.create({
  email: ''
});

form.setTouched('email', true);

// ❌ Touched doesn't mean valid
if (form.isTouched('email')) {
  submitForm(); // Might submit invalid data!
}

// ✅ Check both touched and valid
if (form.isTouched('email') && !form.hasError('email')) {
  // Field is touched AND valid
}
```

 

### Pitfall 5: Using Instead of shouldShowError()

```javascript
const form = Forms.create({
  email: ''
});

// ❌ Manual check every time
if (form.isTouched('email') && form.hasError('email')) {
  showError(form.getError('email'));
}

// ✅ Use shouldShowError() for cleaner code
if (form.shouldShowError('email')) {
  showError(form.getError('email'));
}

// shouldShowError() combines both checks automatically!
```

 

## Summary

### Key Takeaways

1. **`isTouched()` returns boolean** - true if field touched, false otherwise.

2. **Checks single field** - not the whole form (that's `isDirty` property).

3. **Cleaner than `!!form.touched[field]`** - explicit and readable.

4. **Perfect for conditional logic** - error display, field styling, validation timing.

5. **Combine with hasError()** - for smart error display UX.

6. **Works with any field** - returns false for non-existent fields.

### When to Use isTouched()

✅ **Use isTouched() for:**
- Conditional error display (show only when touched)
- Field styling based on interaction
- Form progress tracking
- Validation timing control
- Touch-based UI logic

❌ **Don't use isTouched() when:**
- You need touched + error check (use `shouldShowError()`)
- Checking if form has any touched fields (use `isDirty`)
- Already accessing touched for other purposes (direct access is fine)

### Comparison Table

| Check | Method/Property | Returns | Use Case |
|  -|     -|   |   -|
| Specific field | `isTouched('email')` | `boolean` | Field-specific check ✅ |
| Has error | `hasError('email')` | `boolean` | Error check ✅ |
| Should show error | `shouldShowError('email')` | `boolean` | Combined check ✅ |
| Form touched | `isDirty` | `boolean` | Overall state ✅ |

### One-Line Rule

> **`form.isTouched(field)` checks if a specific field has been touched - use it to control when errors and validation feedback appear based on user interaction.**

 

**What's Next?**

- Learn about `form.shouldShowError()` for combined touch + error checks
- Explore touch state management best practices
- Master progressive validation patterns
