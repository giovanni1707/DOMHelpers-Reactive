# form.isValid

## Quick Start (30 seconds)

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: v.email('Invalid email'),
      password: v.minLength(8, 'Min 8 chars')
    }
  }
);

console.log(form.isValid); // true (initially, fields empty = optional)

form.setValue('email', 'invalid');
console.log(form.isValid); // false (email has error)

form.setValue('email', 'user@example.com');
console.log(form.isValid); // true (no errors)

form.setValue('password', 'short');
console.log(form.isValid); // false (password too short)

form.setValue('password', 'secret123');
console.log(form.isValid); // true ✅ (all valid!)
```

**What just happened?** `form.isValid` automatically tells you if the entire form is valid. It's a computed property that checks if there are any errors!

 

## What is form.isValid?

`form.isValid` is a **computed boolean property** that indicates whether the entire form is valid (has no validation errors).

Simply put, it's `true` when no fields have errors, and `false` when at least one field has an error.

Think of `form.isValid` as a **green light** - it tells you whether it's safe to proceed with submission.

 

## Syntax

```javascript
// Read the validity state
if (form.isValid) {
  console.log('Form is valid!');
}

// Enable/disable submit button
submitButton.disabled = !form.isValid;

// Show status
statusText.textContent = form.isValid ? 'Ready to submit' : 'Please fix errors';
```

**Type:** `Boolean` (read-only, computed)

**Values:**
- `true` - No validation errors exist
- `false` - One or more validation errors exist

 

## Why Does This Exist?

### The Problem: Manual Validity Checking

Without a computed property, you'd check validity manually:

```javascript
// Manual validity checking (tedious!)
function isFormValid() {
  // Check each field manually
  if (form.errors.email) return false;
  if (form.errors.password) return false;
  if (form.errors.username) return false;
  if (form.errors.age) return false;
  // ... check every field
  return true;
}

// Or check if errors object is empty
function isFormValid() {
  return Object.keys(form.errors).length === 0;
}

// Have to call this function everywhere
if (isFormValid()) {
  enableSubmitButton();
}
```

**Problems:**
❌ Repetitive validity checks
❌ Easy to forget to check new fields
❌ Not reactive - have to call manually
❌ Verbose code everywhere

### The Solution with form.isValid

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '', username: '' },
  {
    validators: {
      email: v.email('Invalid'),
      password: v.minLength(8, 'Too short'),
      username: v.minLength(3, 'Too short')
    }
  }
);

// Just check the computed property!
if (form.isValid) {
  console.log('All valid!');
}

// Reactive - updates automatically
effect(() => {
  const button = document.getElementById('submit');
  button.disabled = !form.isValid;
  // Updates whenever any validation changes ✅
});
```

**Benefits:**
✅ Single source of truth for validity
✅ Automatically updates when errors change
✅ No manual validity checks needed
✅ Reactive - triggers effects automatically
✅ Concise and readable code

 

## Mental Model

Think of `form.isValid` like a **quality control inspector**:

### Manual Checking (Inspector Checks Every Item)
```
Inspector: "Let me check each item..."
          *Checks email* "OK"
          *Checks password* "OK"
          *Checks username* "OK"
          "All items passed!"

New item added:
Inspector: "Let me check EVERYTHING again..."
          *Repeats entire process*
```

### form.isValid (Automated Quality System)
```
Quality System:
┌────────────────────────┐
│ Items to Check:        │
│ ✓ Email: Valid         │
│ ✓ Password: Valid      │
│ ✓ Username: Valid      │
├────────────────────────┤
│ Status: ✅ ALL VALID   │
└────────────────────────┘

New item added:
Quality System: *Automatically recalculates*
Status: ❌ HAS ERRORS

(Instant, automatic!)
```

**Key Insight:** `form.isValid` is computed automatically - it always reflects the current validity state without manual checking.

 

## How Does It Work?

### Computation Logic

```javascript
// Internal computation (simplified):
get isValid() {
  const errorKeys = Object.keys(this.errors);

  // No error keys? Valid!
  if (errorKeys.length === 0) return true;

  // Has error keys? Check if any have actual errors
  return errorKeys.every(key => !this.errors[key]);
}
```

### Automatic Updates

```
User calls form.setValue('email', 'invalid')
              ↓
      Validator runs
              ↓
   form.errors.email = 'Invalid email'
              ↓
   form.isValid recomputes (automatically!)
              ↓
   form.isValid = false
              ↓
   Effects that depend on isValid run
```

 

## Basic Usage

### Example 1: Enable/Disable Submit Button

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: v.combine(v.required('Required'), v.email('Invalid')),
      password: v.combine(v.required('Required'), v.minLength(8, 'Too short'))
    }
  }
);

const submitButton = document.getElementById('submit');

// Disable button if form is invalid
effect(() => {
  submitButton.disabled = !form.isValid;
});

// Try it
form.setValue('email', 'invalid');
// submitButton.disabled = true (form invalid)

form.setValue('email', 'user@example.com');
form.setValue('password', 'secret123');
// submitButton.disabled = false (form valid) ✅
```

 

### Example 2: Show Validation Status

```javascript
const { v } = Forms;

const form = Forms.create(
  { username: '', email: '' },
  {
    validators: {
      username: v.required('Required'),
      email: v.email('Invalid')
    }
  }
);

effect(() => {
  const statusEl = document.getElementById('status');

  if (form.isValid) {
    statusEl.textContent = '✅ Form is ready to submit';
    statusEl.className = 'status-success';
  } else {
    statusEl.textContent = '❌ Please fix errors';
    statusEl.className = 'status-error';
  }
});
```

 

### Example 3: Conditional Submit

```javascript
const form = Forms.create(
  { data: '' },
  { /* validators */ }
);

async function handleSubmit() {
  // Only submit if valid
  if (!form.isValid) {
    alert('Please fix all errors before submitting');
    return;
  }

  await form.submit();
}
```

 

### Example 4: Progress Indicator

```javascript
const { v } = Forms;

const form = Forms.create(
  { step1: '', step2: '', step3: '' },
  {
    validators: {
      step1: v.required('Required'),
      step2: v.required('Required'),
      step3: v.required('Required')
    }
  }
);

effect(() => {
  const progressBar = document.getElementById('progress');

  // Calculate valid fields
  const totalFields = Object.keys(form.values).length;
  const validFields = totalFields - Object.keys(form.errors).length;
  const percentage = (validFields / totalFields) * 100;

  progressBar.style.width = `${percentage}%`;
  progressBar.textContent = form.isValid ? 'Complete!' : `${Math.round(percentage)}%`;
});
```

 

## Advanced Patterns

### Pattern 1: Multi-Step Form Validation

```javascript
const { v } = Forms;

// Step 1 form
const step1 = Forms.create(
  { name: '', email: '' },
  {
    validators: {
      name: v.required('Required'),
      email: v.email('Invalid')
    }
  }
);

// Step 2 form
const step2 = Forms.create(
  { address: '', phone: '' },
  {
    validators: {
      address: v.required('Required'),
      phone: v.pattern(/^\d{10}$/, 'Invalid phone')
    }
  }
);

function canProceedToNextStep() {
  return step1.isValid;
}

function canSubmitFinalForm() {
  return step1.isValid && step2.isValid;
}

// Next button
effect(() => {
  document.getElementById('next').disabled = !canProceedToNextStep();
});

// Submit button
effect(() => {
  document.getElementById('submit').disabled = !canSubmitFinalForm();
});
```

 

### Pattern 2: Conditional Field Requirements

```javascript
const { v } = Forms;

const form = Forms.create(
  {
    accountType: 'personal',
    companyName: '',
    taxId: ''
  },
  {
    validators: {
      companyName: (value, allValues) => {
        if (allValues.accountType === 'business' && !value) {
          return 'Required for business accounts';
        }
        return null;
      },
      taxId: (value, allValues) => {
        if (allValues.accountType === 'business' && !value) {
          return 'Required for business accounts';
        }
        return null;
      }
    }
  }
);

// form.isValid adapts to account type
effect(() => {
  console.log('Form valid?', form.isValid);
  // true for personal (no company fields required)
  // false for business (company fields required but empty)
});
```

 

### Pattern 3: Partial Validation

```javascript
const form = Forms.create(
  { email: '', password: '', newsletter: false },
  { /* validators for email and password */ }
);

// Check if critical fields are valid
function areCriticalFieldsValid() {
  const criticalFields = ['email', 'password'];

  return criticalFields.every(field => !form.errors[field]);
}

// Allow save draft even if not fully valid
function canSaveDraft() {
  return areCriticalFieldsValid();
}

// Require full validity for submit
function canSubmit() {
  return form.isValid;
}
```

 

### Pattern 4: Validation Warning System

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
  const warningEl = document.getElementById('warning');

  if (!form.isValid && form.isDirty) {
    const errorCount = Object.keys(form.errors).length;
    warningEl.textContent = `⚠️ ${errorCount} error(s) found`;
    warningEl.style.display = 'block';
  } else {
    warningEl.style.display = 'none';
  }
});
```

 

## Common Pitfalls

### Pitfall 1: Checking isValid Before Validation

❌ **Wrong:**
```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.required('Required') } }
);

// Check immediately - validators haven't run yet!
if (form.isValid) {
  console.log('Valid!'); // true, but misleading!
}
```

✅ **Correct:**
```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.required('Required') } }
);

// Trigger validation first
form.validate();

// Or set a value (triggers validation)
form.setValue('email', '');

// Now check
if (form.isValid) {
  console.log('Valid!');
}
```

 

### Pitfall 2: Assuming Empty Form is Invalid

❌ **Wrong:**
```javascript
const form = Forms.create(
  { email: '' },
  { validators: { email: v.email('Invalid') } }
);

console.log(form.isValid);
// true! (email validator allows empty by default)
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: v.combine(
        v.required('Required'), // Add required!
        v.email('Invalid')
      )
    }
  }
);

console.log(form.isValid); // false (required field empty)
```

 

### Pitfall 3: Not Validating Before Checking isValid

❌ **Wrong:**
```javascript
const form = Forms.create(
  { data: '' },
  { /* validators */ }
);

// Just checking, without triggering validation
if (form.isValid) {
  await form.submit();
}
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { data: '' },
  { /* validators */ }
);

// Validate first
const isValid = form.validate();

if (isValid) {
  await form.submit();
}

// Or use submit() which validates automatically
const result = await form.submit();
```

 

## Summary

### Key Takeaways

1. **`form.isValid` is a computed property** that checks if the form has no errors.

2. **It's read-only** - you can't set it directly; it updates automatically.

3. **Updates automatically** when errors change (after validation).

4. **Perfect for submit button state** - `button.disabled = !form.isValid`.

5. **Reactive** - triggers effects when validity changes.

6. **Checks all fields** - `true` only if no field has errors.

7. **Returns `true` for empty optional fields** - combine validators with `required()` for mandatory fields.

8. **Use `validate()` first** if you need to check validity before user interaction.

### One-Line Rule

> **`form.isValid` automatically tells you if the form is error-free - use it to enable/disable submit buttons and show validation status.**

 

**What's Next?**

- Learn about `form.isDirty` to detect form changes
- Explore `form.hasErrors` to check error existence
- Master `form.errorFields` to get fields with errors
- Discover advanced validation patterns
