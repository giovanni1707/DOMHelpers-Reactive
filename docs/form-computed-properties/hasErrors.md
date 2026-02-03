# form.hasErrors

## Quick Start (30 seconds)

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.email('Invalid') } }
);

console.log(form.hasErrors); // false (no errors yet)

form.setValue('email', 'invalid');

console.log(form.hasErrors); // true (has validation error!)

form.setValue('email', 'user@example.com');

console.log(form.hasErrors); // false (error cleared)
```

**What just happened?** `form.hasErrors` checks if any validation errors exist. It's the opposite of `form.isValid`!

 

## What is form.hasErrors?

`form.hasErrors` is a **computed boolean property** that checks if one or more validation errors exist in the form.

Simply put:
- `form.hasErrors = true` → At least one field has an error
- `form.hasErrors = false` → No fields have errors

Think of it as the **"any problems?" indicator** - quick way to check if something is wrong.

 

## Syntax

```javascript
// Check if form has any errors
if (form.hasErrors) {
  console.log('Form has validation errors!');
}

// Show error summary
if (form.hasErrors) {
  showErrorSummary(form.errors);
}
```

**Type:** `Boolean` (read-only, computed)

**Computation:** `Object.keys(form.errors).some(k => form.errors[k])`

 

## Comparison with form.isValid

### They're Opposites!

```javascript
// hasErrors is the inverse of isValid
form.hasErrors === !form.isValid  // Always true!

// If no errors:
form.hasErrors === false
form.isValid === true

// If has errors:
form.hasErrors === true
form.isValid === false
```

### When to Use Which?

**Use `form.isValid` when thinking positively:**
```javascript
// Enable submit when form is good
submitButton.disabled = !form.isValid;

// Show success message
if (form.isValid) {
  showSuccess('Form is ready!');
}
```

**Use `form.hasErrors` when thinking negatively:**
```javascript
// Show error banner
if (form.hasErrors) {
  showErrorBanner('Please fix errors');
}

// Prevent submission
if (form.hasErrors) {
  alert('Form has errors!');
  return;
}
```

 

## Basic Usage

### Example 1: Error Banner

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: v.email('Invalid'),
      password: v.minLength(8, 'Too short')
    }
  }
);

effect(() => {
  const banner = document.getElementById('error-banner');

  if (form.hasErrors) {
    const errorCount = Object.keys(form.errors).length;
    banner.textContent = `⚠️ ${errorCount} error(s) found`;
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
});
```

 

### Example 2: Prevent Submission

```javascript
async function handleSubmit() {
  // Validate all fields
  form.touchAll();
  form.validate();

  if (form.hasErrors) {
    alert('Please fix all errors before submitting');
    return;
  }

  await form.submit();
}
```

 

### Example 3: Conditional Styling

```javascript
const form = Forms.create(
  { data: '' },
  { /* validators */ }
);

effect(() => {
  const formEl = document.getElementById('myForm');

  if (form.hasErrors) {
    formEl.classList.add('has-errors');
    formEl.classList.remove('valid');
  } else {
    formEl.classList.remove('has-errors');
    formEl.classList.add('valid');
  }
});
```

 

## Advanced Patterns

### Pattern 1: Error Summary Panel

```javascript
const form = Forms.create(
  { field1: '', field2: '', field3: '' },
  { /* validators */ }
);

effect(() => {
  const summaryEl = document.getElementById('error-summary');

  if (form.hasErrors) {
    const errorList = Object.entries(form.errors)
      .map(([field, message]) => `<li>${field}: ${message}</li>`)
      .join('');

    summaryEl.innerHTML = `
      <h3>Errors Found:</h3>
      <ul>${errorList}</ul>
    `;
    summaryEl.style.display = 'block';
  } else {
    summaryEl.style.display = 'none';
  }
});
```

 

### Pattern 2: Smart Submit Button

```javascript
const form = Forms.create(
  { email: '', password: '' },
  { /* validators */ }
);

effect(() => {
  const button = document.getElementById('submit');

  // Button text based on state
  if (form.hasErrors && form.isDirty) {
    button.textContent = 'Fix Errors First';
    button.disabled = true;
  } else if (!form.isDirty) {
    button.textContent = 'No Changes';
    button.disabled = true;
  } else {
    button.textContent = 'Submit';
    button.disabled = false;
  }
});
```

 

## Summary

### Key Takeaways

1. **`form.hasErrors` checks if any errors exist** - opposite of `form.isValid`.

2. **Returns `true` when errors present** - at least one field has a validation error.

3. **Use for error-focused UI** - showing error banners, preventing submission.

4. **Computed property** - automatically updates when errors change.

5. **Prefer `isValid` for positive checks** - `hasErrors` for negative checks.

### One-Line Rule

> **`form.hasErrors` is the inverse of `form.isValid` - use it when you need to check if problems exist rather than if everything is okay.**

 

**What's Next?**

- Learn about `form.touchedFields` array
- Explore `form.errorFields` array
- Master error display patterns
