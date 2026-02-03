# form.touched

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Initially, no fields are touched
console.log(form.touched);
// {}

// User interacts with email field
form.setValue('email', 'user@example.com');

console.log(form.touched);
// { email: true }

// User interacts with password
form.setValue('password', 'secret123');

console.log(form.touched);
// { email: true, password: true }

// Check if field was touched
if (form.touched.email) {
  console.log('User interacted with email field');
}
```

**What just happened?** `form.touched` tracks which fields the user has interacted with. This helps you show validation errors only after the user has engaged with a field!

 

## What is form.touched?

`form.touched` is a **reactive object property** that tracks whether the user has interacted with each form field.

Simply put, when a field is "touched," it means the user has focused on it, typed in it, or otherwise engaged with it. `form.touched` keeps a record of which fields have been touched.

Think of `form.touched` as a **visitor log** - it records which fields the user has "visited" or interacted with.

 

## Syntax

### Reading Touched State

```javascript
// Read all touched fields
const allTouched = form.touched;

// Check if specific field is touched
if (form.touched.email) {
  console.log('Email field was touched');
}

// Check using method
if (form.isTouched('email')) {
  console.log('Email field was touched');
}
```

### Setting Touched State

```javascript
// Mark field as touched (using setValue)
form.setValue('email', 'value'); // Automatically marks as touched

// Mark field as touched explicitly
form.setTouched('email', true);

// Mark as untouched
form.setTouched('email', false);

// Mark multiple fields as touched
form.setTouchedFields(['email', 'password']);

// Mark all fields as touched
form.touchAll();
```

**Type:** `Object` (read/write via methods)

**Structure:** `{ fieldName: true, ... }`

 

## Why Does This Exist?

### The Problem: Showing Errors Too Early

Without tracking touched state, you might show errors immediately:

```javascript
// Without touched tracking (bad UX!)
const form = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: (v) => v ? null : 'Email required',
      password: (v) => v ? null : 'Password required'
    }
  }
);

// Show errors immediately
function updateUI() {
  if (form.errors.email) {
    showError('email', form.errors.email);
  }
  if (form.errors.password) {
    showError('password', form.errors.password);
  }
}

updateUI();
// 😫 Shows "Email required" and "Password required"
// BEFORE the user has even touched the form!
```

**What's the Real Issue?**

```
Empty Form Loads
       ↓
All Fields Invalid (empty)
       ↓
Show All Errors Immediately
       ↓
User Sees Red Errors Everywhere
       ↓
Bad User Experience 😫
```

**Problems:**
❌ Shows errors before user interaction
❌ Overwhelming for users (red errors everywhere)
❌ Poor user experience (feels like being yelled at)
❌ Can't distinguish between "not filled" and "incorrectly filled"

### The Solution with form.touched

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

// Show errors ONLY for touched fields
function updateUI() {
  if (form.touched.email && form.errors.email) {
    showError('email', form.errors.email);
  } else {
    hideError('email');
  }

  if (form.touched.password && form.errors.password) {
    showError('password', form.errors.password);
  } else {
    hideError('password');
  }
}

// Form loads - no errors shown (fields not touched yet)
updateUI(); // Clean form ✅

// User types in email
form.setValue('email', 'invalid');
updateUI(); // Shows email error only ✅

// User types in password
form.setValue('password', 'short');
updateUI(); // Shows both errors now ✅
```

**What Just Happened?**

```
Empty Form Loads
       ↓
No Errors Shown (fields not touched)
       ↓
User Interacts with Email
       ↓
Email Marked as Touched
       ↓
Show Email Error (if invalid)
       ↓
Better User Experience ✅
```

**Benefits:**
✅ Clean form on initial load
✅ Errors appear progressively as user interacts
✅ Less overwhelming for users
✅ Better user experience (guidance, not punishment)
✅ Can distinguish between "not attempted" and "attempted but wrong"

 

## Mental Model

Think of `form.touched` like a **guest book at a museum**:

### Without form.touched (No Guest Book)
```
Museum opens

Guard: "Has anyone visited the Egyptian exhibit?"
       "Has anyone visited the Art gallery?"
       "Has anyone visited the Science room?"

       *No way to tell - must ask everyone*
```

### With form.touched (Guest Book)
```
Museum with Guest Book
┌────────────────────────┐
│ Exhibit Visited? Log   │
├────────────────────────┤
│ ✓ Egyptian Exhibit     │
│ ✓ Art Gallery          │
│   Science Room         │
└────────────────────────┘

Guard: "Has anyone visited the Egyptian exhibit?"
       *Checks book* "Yes! ✓"

       "Has anyone visited the Science room?"
       *Checks book* "No"
```

**Key Insight:** `form.touched` tracks user interaction history so you know which fields deserve feedback and which are still waiting for the user's attention.

 

## How Does It Work?

### Automatic Tracking

```
User calls form.setValue('email', value)
              ↓
     Updates form.values.email
              ↓
  form.touched.email = true (automatically!)
              ↓
      Runs validation
              ↓
   Updates form.errors if needed
```

### Touch Lifecycle

```
Field Created
form.touched.field = undefined

         ↓ User interacts (setValue)

Field Touched
form.touched.field = true

         ↓ Stays true until reset

Still Touched
form.touched.field = true

         ↓ form.reset()

Field Reset
form.touched.field = undefined
```

### Visual Structure

```
form
├── values
│   ├── email: 'user@example.com'
│   └── password: 'secret'
├── touched            ← form.touched
│   ├── email: true    (user interacted)
│   └── password: true (user interacted)
└── errors
    └── (any errors)
```

 

## Basic Usage

### Example 1: Check if Field is Touched

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Before interaction
console.log(form.touched.email); // undefined

// After interaction
form.setValue('email', 'user@example.com');
console.log(form.touched.email); // true

// Check with method
console.log(form.isTouched('email')); // true
console.log(form.isTouched('password')); // false
```

 

### Example 2: Show Errors Only for Touched Fields

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

// Helper function
function shouldShowError(field) {
  return form.touched[field] && form.errors[field];
}

// Initially - no errors shown
console.log(shouldShowError('email')); // false

// User types invalid email
form.setValue('email', 'invalid');
console.log(shouldShowError('email')); // true ✅
```

 

### Example 3: Get All Touched Fields

```javascript
const form = Forms.create({
  name: '',
  email: '',
  phone: '',
  address: ''
});

form.setValue('name', 'Alice');
form.setValue('email', 'alice@example.com');

// Get array of touched field names
const touchedFields = Object.keys(form.touched);
console.log(touchedFields);
// ['name', 'email']

// Or use computed property
console.log(form.touchedFields);
// ['name', 'email']
```

 

### Example 4: Check if Any Field is Touched

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Check if form has been interacted with
function hasBeenTouched() {
  return Object.keys(form.touched).length > 0;
}

console.log(hasBeenTouched()); // false

form.setValue('email', 'user@example.com');
console.log(hasBeenTouched()); // true

// Or use computed property
console.log(form.isDirty); // true
```

 

## Reading Touched State

### Pattern 1: Conditional Error Display

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: v.email('Invalid email')
    }
  }
);

// Bind error display to touched state
effect(() => {
  const errorEl = document.getElementById('email-error');

  if (form.touched.email && form.errors.email) {
    errorEl.textContent = form.errors.email;
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});
```

 

### Pattern 2: Field Status Indicator

```javascript
const form = Forms.create({
  email: ''
});

function getFieldStatus(field) {
  if (!form.touched[field]) {
    return 'pristine'; // Not touched yet
  }

  if (form.errors[field]) {
    return 'invalid'; // Touched with error
  }

  return 'valid'; // Touched and valid
}

console.log(getFieldStatus('email')); // 'pristine'

form.setValue('email', 'invalid');
console.log(getFieldStatus('email')); // 'invalid'

form.setValue('email', 'user@example.com');
console.log(getFieldStatus('email')); // 'valid'
```

 

### Pattern 3: Touched Fields Counter

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

function getTouchedCount() {
  return Object.keys(form.touched).length;
}

function getTotalFields() {
  return Object.keys(form.values).length;
}

console.log(`${getTouchedCount()} of ${getTotalFields()} fields touched`);
// "0 of 4 fields touched"

form.setValue('field1', 'value');
form.setValue('field2', 'value');

console.log(`${getTouchedCount()} of ${getTotalFields()} fields touched`);
// "2 of 4 fields touched"
```

 

### Pattern 4: Progress Indicator

```javascript
const form = Forms.create({
  step1: '',
  step2: '',
  step3: ''
});

function getProgress() {
  const total = Object.keys(form.values).length;
  const touched = Object.keys(form.touched).length;
  return Math.round((touched / total) * 100);
}

console.log(`Progress: ${getProgress()}%`); // "Progress: 0%"

form.setValue('step1', 'done');
console.log(`Progress: ${getProgress()}%`); // "Progress: 33%"

form.setValue('step2', 'done');
console.log(`Progress: ${getProgress()}%`); // "Progress: 67%"

form.setValue('step3', 'done');
console.log(`Progress: ${getProgress()}%`); // "Progress: 100%"
```

 

## Setting Touched State

### Pattern 1: Mark on Blur Event

```javascript
const form = Forms.create({
  email: ''
});

// Mark field as touched when user leaves it
const emailInput = document.getElementById('email');

emailInput.addEventListener('blur', () => {
  form.setTouched('email', true);
});

// Or use handleBlur method
emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e); // Automatically marks as touched
});
```

 

### Pattern 2: Touch All on Submit

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '', password: '', username: '' },
  { /* validators */ }
);

// On submit, touch all fields
async function handleSubmit() {
  // Mark all fields as touched
  form.touchAll();

  // Now validate
  const isValid = form.validate();

  if (!isValid) {
    // All errors will now show (all fields touched)
    console.log('Please fix errors:', form.errors);
    return;
  }

  // Submit
  await form.submit();
}
```

 

### Pattern 3: Reset Touched State

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// User fills form
form.setValue('email', 'user@example.com');
form.setValue('password', 'secret123');

console.log(form.touched);
// { email: true, password: true }

// Reset form (clears touched state)
form.reset();

console.log(form.touched);
// {}
```

 

### Pattern 4: Manually Control Touched

```javascript
const form = Forms.create({
  terms: false
});

// Don't mark as touched automatically
// (setValue marks as touched, so we unmark it)
form.setValue('terms', false);
form.setTouched('terms', false);

console.log(form.touched.terms); // undefined

// Later, when user actually clicks
document.getElementById('terms').addEventListener('change', () => {
  form.setValue('terms', true);
  // Now it's touched
  console.log(form.touched.terms); // true
});
```

 

## Advanced Patterns

### Pattern 1: Smart Error Display

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

// Show error only if:
// 1. Field is touched
// 2. Field has error
function smartErrorDisplay(field) {
  const shouldShow = form.touched[field] && form.errors[field];

  const errorEl = document.getElementById(`${field}-error`);
  const inputEl = document.getElementById(field);

  if (shouldShow) {
    errorEl.textContent = form.errors[field];
    errorEl.style.display = 'block';
    inputEl.classList.add('error');
  } else {
    errorEl.style.display = 'none';
    inputEl.classList.remove('error');
  }
}

// Bind to each field
effect(() => {
  smartErrorDisplay('email');
  smartErrorDisplay('password');
});
```

 

### Pattern 2: Validation Timing Control

```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  {
    validators: {
      email: v.email('Invalid')
    }
  }
);

// Validate on blur, not on change
const emailInput = document.getElementById('email');

emailInput.addEventListener('input', (e) => {
  // Update value but don't validate yet
  form.values.email = e.target.value;
  // (Not using setValue to avoid validation)
});

emailInput.addEventListener('blur', (e) => {
  // Now validate
  form.setValue('email', e.target.value);
  // Marks as touched and validates
});
```

 

### Pattern 3: Field Visit Tracking

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

// Track visit order
const visitOrder = [];

const originalSetValue = form.setValue.bind(form);
form.setValue = function(field, value) {
  if (!form.touched[field]) {
    visitOrder.push(field);
  }
  return originalSetValue(field, value);
};

form.setValue('email', 'value');
form.setValue('username', 'value');
form.setValue('password', 'value');

console.log('User visited fields in order:', visitOrder);
// ['email', 'username', 'password']
```

 

### Pattern 4: Required Field Completion

```javascript
const form = Forms.create({
  name: '',
  email: '',
  phone: '',
  message: ''
});

const requiredFields = ['name', 'email', 'message'];

function getUntouchedRequired() {
  return requiredFields.filter(field => !form.touched[field]);
}

function areRequiredFieldsTouched() {
  return requiredFields.every(field => form.touched[field]);
}

console.log('Untouched required:', getUntouchedRequired());
// ['name', 'email', 'message']

form.setValue('name', 'Alice');
form.setValue('email', 'alice@example.com');

console.log('Untouched required:', getUntouchedRequired());
// ['message']

console.log('All required touched?', areRequiredFieldsTouched());
// false
```

 

### Pattern 5: Touched State Analytics

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Track how long before each field is touched
const touchTimestamps = {};
const formLoadTime = Date.now();

const originalSetTouched = form.setTouched.bind(form);
form.setTouched = function(field, value) {
  if (value && !touchTimestamps[field]) {
    touchTimestamps[field] = Date.now() - formLoadTime;
  }
  return originalSetTouched(field, value);
};

// Analyze later
function getTouchAnalytics() {
  return Object.entries(touchTimestamps).map(([field, ms]) => ({
    field,
    secondsToTouch: ms / 1000
  }));
}

// User interacts...
form.setValue('field1', 'value'); // After 2 seconds
form.setValue('field3', 'value'); // After 5 seconds

console.log(getTouchAnalytics());
// [
//   { field: 'field1', secondsToTouch: 2 },
//   { field: 'field3', secondsToTouch: 5 }
// ]
```

 

## Common Pitfalls

### Pitfall 1: Showing Errors Without Checking Touched

❌ **Wrong:**
```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.required('Required') } }
);

// Show error immediately
if (form.errors.email) {
  showError(form.errors.email);
  // Shows "Required" before user even touches form!
}
```

✅ **Correct:**
```javascript
const { v } = Forms;

const form = Forms.create(
  { email: '' },
  { validators: { email: v.required('Required') } }
);

// Show error only if touched
if (form.touched.email && form.errors.email) {
  showError(form.errors.email);
  // Only shows after user interacts ✅
}
```

 

### Pitfall 2: Not Touching All Fields on Submit

❌ **Wrong:**
```javascript
const form = Forms.create(
  { email: '', password: '' },
  { /* validators */ }
);

async function handleSubmit() {
  const isValid = form.validate();

  if (!isValid) {
    // Errors exist but may not show
    // (untouched fields won't display errors)
    return;
  }

  await form.submit();
}
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { email: '', password: '' },
  { /* validators */ }
);

async function handleSubmit() {
  // Touch all fields first
  form.touchAll();

  const isValid = form.validate();

  if (!isValid) {
    // Now all errors will show ✅
    return;
  }

  await form.submit();
}
```

 

### Pitfall 3: Manually Setting touched = {}

❌ **Wrong:**
```javascript
const form = Forms.create({ email: '' });

// Don't mutate directly!
form.touched = {};
```

✅ **Correct:**
```javascript
const form = Forms.create({ email: '' });

// Use reset method
form.reset();
// Or reset individual field
form.setTouched('email', false);
```

 

### Pitfall 4: Assuming touched Means Valid

❌ **Wrong:**
```javascript
const form = Forms.create({ email: '' });

form.setValue('email', 'invalid');

if (form.touched.email) {
  console.log('Email is valid!'); // NO! Just touched, not valid
}
```

✅ **Correct:**
```javascript
const form = Forms.create({ email: '' });

form.setValue('email', 'invalid');

if (form.touched.email && !form.errors.email) {
  console.log('Email is valid!'); // ✅
}
```

 

### Pitfall 5: Not Considering Blur Events

❌ **Wrong:**
```javascript
// Only tracking setValue
const form = Forms.create({ email: '' });

// User focuses and leaves without typing
// Field should be marked as touched but isn't!
```

✅ **Correct:**
```javascript
const form = Forms.create({ email: '' });

// Also handle blur
document.getElementById('email').addEventListener('blur', (e) => {
  form.handleBlur(e); // Marks as touched even if no input
});
```

 

## Summary

### Key Takeaways

1. **`form.touched` tracks which fields the user has interacted with** - it's a record of user engagement.

2. **Fields are marked as touched automatically** when you use `setValue()`.

3. **Use it to show errors progressively** - only display errors for fields the user has engaged with.

4. **Improves user experience** - avoids overwhelming users with errors on page load.

5. **Touch all fields on submit** with `touchAll()` to ensure all errors display.

6. **Reset clears touched state** - `form.reset()` returns all fields to untouched.

7. **Combine with errors for smart display** - `if (touched && error) showError()`.

8. **Use `isTouched()` method** for cleaner checks.

9. **`form.touchedFields` computed property** gives you an array of touched field names.

10. **`form.isDirty` computed property** tells you if any field has been touched.

### One-Line Rule

> **`form.touched` tracks user interaction - use it to show validation errors only for fields the user has engaged with, creating a better user experience.**

 

**What's Next?**

- Learn about `form.isSubmitting` to track submission state
- Explore `form.isValid` to check overall form validity
- Master `form.isDirty` to detect form changes
- Discover advanced error display patterns
