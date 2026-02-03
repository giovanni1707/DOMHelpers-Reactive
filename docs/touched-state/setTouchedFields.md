# `form.setTouchedFields(fields)` - Mark Multiple Fields as Touched

## Quick Start (30 seconds)

```javascript
const form = createForm({
  email: '',
  password: '',
  username: '',
  confirmPassword: ''
});

// Mark multiple fields as touched at once
form.setTouchedFields(['email', 'password']);

console.log(form.touched);
// { email: true, password: true }

console.log(form.isTouched('email'));     // true
console.log(form.isTouched('username'));  // false

// Perfect for showing errors on submit
function handleSubmit(e) {
  e.preventDefault();
  
  // Touch all fields to show validation errors
  form.setTouchedFields(['email', 'password', 'username', 'confirmPassword']);
  
  if (!form.isValid) {
    console.log('Please fix errors');
    return;
  }
  
  submitData(form.values);
}

// Or touch specific sections
function goToNextStep() {
  // Mark step 1 fields as touched
  form.setTouchedFields(['email', 'password']);
  
  if (hasStepErrors()) {
    return; // Show errors, don't advance
  }
  
  showStep2();
} ✨
```

**What just happened?** You marked multiple fields as touched in one call, perfect for validation on submit or multi-step forms!

 

## What is `form.setTouchedFields(fields)`?

`setTouchedFields()` is a **bulk operation** that marks multiple form fields as "touched" simultaneously.

Simply put: it's a fast way to mark many fields at once, rather than marking them one by one.

Think of it as **a bulk highlighter** - instead of highlighting words one at a time, you select multiple and highlight them all in one action.

 

## Syntax

```javascript
form.setTouchedFields(fields)
```

**Parameters:**
- `fields` (Array of strings) - Field names to mark as touched

**Returns:** 
- The form object (for chaining)

**Example:**
```javascript
form.setTouchedFields(['email', 'password', 'username']);
```

 

## Why Does This Exist?

### The Challenge: Marking Multiple Fields Individually

When you need to mark several fields as touched (like on form submit), doing it one by one is tedious:

```javascript
// Without setTouchedFields
const form = createForm({
  email: '',
  password: '',
  username: '',
  phone: '',
  address: ''
});

function handleSubmit() {
  // Must mark each field individually
  form.setTouched('email');
  form.setTouched('password');
  form.setTouched('username');
  form.setTouched('phone');
  form.setTouched('address');
  
  if (!form.isValid) {
    console.log('Please fix errors');
    return;
  }
  
  submitData(form.values);
}

// Multi-step forms are even worse
function validateStep1() {
  form.setTouched('email');
  form.setTouched('password');
  form.setTouched('username');
  // ...more fields
}

function validateStep2() {
  form.setTouched('phone');
  form.setTouched('address');
  form.setTouched('city');
  // ...more fields
}
```

At first glance, this works. But the repetition creates problems.

**What's the Real Issue?**

```
Need to mark 5 fields as touched
        ↓
Call setTouched 5 times
        ↓
Verbose, repetitive code
        ↓
Easy to miss fields
        ↓
Maintenance burden ❌
```

**Problems:**
❌ **Verbose** - One call per field  
❌ **Repetitive** - Same pattern over and over  
❌ **Error-prone** - Easy to miss a field  
❌ **Hard to maintain** - Changes require updating multiple lines  

### The Solution with `setTouchedFields()`

```javascript
// With setTouchedFields
const form = createForm({
  email: '',
  password: '',
  username: '',
  phone: '',
  address: ''
});

function handleSubmit() {
  // Mark all fields at once
  form.setTouchedFields([
    'email', 
    'password', 
    'username', 
    'phone', 
    'address'
  ]);
  
  if (!form.isValid) {
    console.log('Please fix errors');
    return;
  }
  
  submitData(form.values);
}

// Multi-step forms are cleaner
const step1Fields = ['email', 'password', 'username'];
const step2Fields = ['phone', 'address', 'city'];

function validateStep1() {
  form.setTouchedFields(step1Fields);
}

function validateStep2() {
  form.setTouchedFields(step2Fields);
}
```

**What Just Happened?**

```
Need to mark 5 fields as touched
        ↓
One call with array of fields
        ↓
All marked simultaneously
        ↓
Clean, maintainable code ✅
```

**Benefits:**
✅ **Concise** - One call marks many fields  
✅ **Clear intent** - Obvious what's being touched  
✅ **Maintainable** - Easy to add/remove fields  
✅ **Chainable** - Returns form for method chaining  

 

## Mental Model

Think of `setTouchedFields()` as **a multi-select checkbox operation**:

### Without setTouchedFields (One at a Time)
```
Field Selection
┌─────────────────────┐
│ ☐ Email             │  ← Click
│ ☐ Password          │  ← Click
│ ☐ Username          │  ← Click
│ ☐ Phone             │  ← Click
│ ☐ Address           │  ← Click
└─────────────────────┘
5 individual clicks ❌
```

### With setTouchedFields (Bulk Select)
```
Field Selection
┌─────────────────────┐
│ ☑ Email             │
│ ☑ Password          │  ← One operation
│ ☑ Username          │     selects all
│ ☑ Phone             │
│ ☑ Address           │
└─────────────────────┘
One operation ✅
```

**Key Insight:** Bulk operations are more efficient than individual operations repeated multiple times.

 

## How Does It Work?

### Internal Process

```
1️⃣ Receive array of field names
   ['email', 'password', 'username']
        ↓
2️⃣ Loop through each field name
   For each field:
        ↓
3️⃣ Mark field as touched
   form.touched[fieldName] = true
        ↓
4️⃣ Return form for chaining
   return this
```

### Behind the Scenes

```javascript
// Simplified internal implementation
setTouchedFields(fields) {
  fields.forEach(fieldName => {
    this.touched[fieldName] = true;
  });
  return this;  // For chaining
}
```

### State Changes

```
Before
form.touched = {}

↓ setTouchedFields(['email', 'password'])

After
form.touched = {
  email: true,
  password: true
}

↓ form.isDirty now returns true
```

 

## Basic Usage

### Example 1: Touch All Fields

```javascript
const form = createForm({
  name: '',
  email: '',
  phone: ''
});

// Get all field names
const allFields = Object.keys(form.values);

// Touch all at once
form.setTouchedFields(allFields);

console.log(form.touchedFields);
// ['name', 'email', 'phone']

console.log(form.isDirty);  // true
```

**What's happening?**
- Get all field names from form.values
- Pass to setTouchedFields
- All fields marked as touched

 

### Example 2: Touch Specific Fields

```javascript
const form = createForm({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: ''
});

// Touch only contact info
form.setTouchedFields(['email', 'phone']);

console.log(form.isTouched('email'));      // true
console.log(form.isTouched('firstName'));  // false
```

 

### Example 3: Method Chaining

```javascript
const form = createForm({ email: '', password: '' });

// Chain with other methods
form
  .setTouchedFields(['email', 'password'])
  .setError('email', 'Invalid email')
  .setError('password', 'Too short');

console.log(form.touched);
console.log(form.errors);
```

 

## Real-World Examples

### Example 1: Form Submit Validation

```javascript
const registrationForm = createForm(
  {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  {
    validators: {
      username: (value) => value.length < 3 ? 'Too short' : null,
      email: (value) => !value.includes('@') ? 'Invalid email' : null,
      password: (value) => value.length < 8 ? 'Min 8 characters' : null,
      confirmPassword: (value, all) => 
        value !== all.password ? 'Passwords must match' : null
    }
  }
);

function handleSubmit(e) {
  e.preventDefault();
  
  // Touch all fields to show errors
  const fields = ['username', 'email', 'password', 'confirmPassword'];
  registrationForm.setTouchedFields(fields);
  
  // Check if valid
  if (!registrationForm.isValid) {
    // Show first error
    const firstError = fields.find(f => registrationForm.errors[f]);
    alert(`Please fix: ${registrationForm.errors[firstError]}`);
    return;
  }
  
  // Submit
  submitRegistration(registrationForm.values);
}
```

 

### Example 2: Multi-Step Form

```javascript
const checkoutForm = createForm({
  // Step 1: Contact
  email: '',
  phone: '',
  
  // Step 2: Shipping
  address: '',
  city: '',
  zipCode: '',
  
  // Step 3: Payment
  cardNumber: '',
  cvv: '',
  expiryDate: ''
});

const steps = {
  contact: ['email', 'phone'],
  shipping: ['address', 'city', 'zipCode'],
  payment: ['cardNumber', 'cvv', 'expiryDate']
};

let currentStep = 'contact';

function goToNextStep() {
  // Touch current step fields
  checkoutForm.setTouchedFields(steps[currentStep]);
  
  // Check for errors in current step
  const hasErrors = steps[currentStep].some(field => 
    checkoutForm.errors[field]
  );
  
  if (hasErrors) {
    alert('Please fix errors before continuing');
    return;
  }
  
  // Advance to next step
  if (currentStep === 'contact') {
    currentStep = 'shipping';
    showShippingForm();
  } else if (currentStep === 'shipping') {
    currentStep = 'payment';
    showPaymentForm();
  } else {
    submitOrder();
  }
}
```

 

### Example 3: Partial Validation

```javascript
const profileForm = createForm({
  // Basic info (required)
  name: '',
  email: '',
  
  // Optional info
  phone: '',
  website: '',
  bio: ''
});

const requiredFields = ['name', 'email'];
const optionalFields = ['phone', 'website', 'bio'];

function validateRequired() {
  // Touch only required fields
  profileForm.setTouchedFields(requiredFields);
  
  const hasRequiredErrors = requiredFields.some(field => 
    !profileForm.values[field]
  );
  
  if (hasRequiredErrors) {
    alert('Please fill in all required fields');
    return false;
  }
  
  return true;
}

function handleSubmit() {
  // Touch all fields on submit
  profileForm.setTouchedFields([...requiredFields, ...optionalFields]);
  
  if (!validateRequired()) {
    return;
  }
  
  saveProfile(profileForm.values);
}
```

 

## Common Patterns

### Pattern 1: Touch All Fields

```javascript
function touchAll(form) {
  const allFields = Object.keys(form.values);
  form.setTouchedFields(allFields);
}
```

 

### Pattern 2: Touch by Condition

```javascript
function touchRequiredFields(form, requiredFields) {
  form.setTouchedFields(requiredFields);
  
  return requiredFields.every(f => form.values[f]);
}
```

 

### Pattern 3: Touch and Validate

```javascript
function touchAndValidate(form, fields) {
  form.setTouchedFields(fields);
  return fields.every(f => !form.errors[f]);
}
```

 

## Important Notes

### 1. Only Marks as Touched, Not Untouched

```javascript
// Marks fields as touched
form.setTouchedFields(['email', 'password']);

// To untouch, use setTouched individually
form.setTouched('email', false);
```

 

### 2. Returns Form for Chaining

```javascript
form
  .setTouchedFields(['email', 'password'])
  .setError('email', 'Invalid')
  .setError('password', 'Too short');
```

 

### 3. Ignores Non-Existent Fields

```javascript
form.setTouchedFields(['email', 'nonexistent', 'password']);
// Only 'email' and 'password' are marked
// 'nonexistent' is silently ignored
```

 

## Summary

**What is `setTouchedFields()`?**  
A method that marks multiple form fields as touched in one call.

**Why use it?**
- ✅ Bulk operation
- ✅ Less code
- ✅ Chainable
- ✅ Maintainable

**Key Takeaway:**

```
Individual setTouched()    setTouchedFields()
         |                         |
Multiple calls              One call
         |                         |
Verbose                     Concise
         |                         |
Repetitive                  Efficient ✅
```

**One-Line Rule:** Use `setTouchedFields()` when you need to mark multiple fields as touched at once, like on form submit or step validation.

**Remember:** It's the bulk highlighter for form fields - select many, mark all at once! 🎉