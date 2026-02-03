# form.setValue()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  username: '',
  email: '',
  age: 0
});

// Set a single field value
form.setValue('username', 'alice');

console.log(form.values.username); // 'alice'
console.log(form.touched.username); // true

// Chain multiple calls
form
  .setValue('email', 'alice@example.com')
  .setValue('age', 25);

console.log(form.values); // { username: 'alice', email: 'alice@example.com', age: 25 }
console.log(form.touched); // { username: true, email: true, age: true }
```

**What just happened?** `setValue()` updates a field's value AND marks it as touched, all while maintaining reactivity!

 

## What is form.setValue()?

`form.setValue()` is the **primary method for updating individual form field values** in the Reactive Forms system.

Simply put, it's how you tell the form "the user changed this field to this value."

**Key characteristics:**
- ✅ Updates the field value
- ✅ Marks the field as touched
- ✅ Triggers validation automatically
- ✅ Updates all reactive UI automatically
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Basic usage
form.setValue(field, value)

// With chaining
form
  .setValue('field1', 'value1')
  .setValue('field2', 'value2');
```

**Parameters:**
- `field` (string) - The name of the field to update
- `value` (any) - The new value for the field

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Direct Mutation

When building reactive forms, you need a way to update values that:
1. Maintains reactivity
2. Tracks user interaction (touched state)
3. Triggers validation
4. Updates all dependent UI

```javascript
// ❌ This doesn't work properly
form.values.username = 'alice'; // Breaks reactivity, no touch tracking

// ✅ This handles everything correctly
form.setValue('username', 'alice'); // Reactive, tracked, validated
```

**Benefits of setValue():**
✅ Single method that handles all update concerns
✅ Consistent API across your application
✅ Automatic touch tracking for better UX
✅ Chainable for batch updates
✅ Triggers validation at the right time

 

## Mental Model

Think of `form.setValue()` as a **smart update system** rather than simple assignment.

### Regular Assignment (Dumb Update)
```
User types → value = 'text' → Done
                                 ↓
                          (Nothing else happens)
```

### form.setValue() (Smart Update)
```
User types → setValue('field', 'text')
                      ↓
              ┌───────┴────────┐
              ↓                ↓
         Update value    Mark as touched
              ↓                ↓
         Run validator   Update UI
              ↓                ↓
         Update errors   Show feedback
              ↓                ↓
         All reactive effects fire automatically
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.setValue('email', 'user@example.com');

// Here's what happens internally:
1️⃣ Update the reactive value
   form.values.email = 'user@example.com'

2️⃣ Mark field as touched
   form.touched.email = true

3️⃣ Trigger validation (if validator exists)
   const error = validators.email('user@example.com', form.values)
   form.errors.email = error

4️⃣ All reactive effects update automatically
   - form.isValid recalculates
   - form.isDirty recalculates
   - form.errorFields updates
   - form.touchedFields updates
   - Any effect() callbacks fire

5️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
setValue('email', 'user@example.com')
         ↓
    [Proxy Handler]
         ↓
    Update value ──→ Notify subscribers
         ↓                    ↓
    Mark touched        [Effect 1] Update UI
         ↓                    ↓
    Run validator       [Effect 2] Enable/disable submit
         ↓                    ↓
    Update error        [Effect 3] Show/hide error message
         ↓
    Return form (for chaining)
```

 

## Basic Usage

### Example 1: Single Field Update

```javascript
const form = Forms.create({
  username: '',
  email: ''
});

// Update username
form.setValue('username', 'alice');

console.log(form.values.username); // 'alice'
console.log(form.touched.username); // true
```

 

### Example 2: With Input Event

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Connect to input field
const emailInput = document.getElementById('email');

emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
});

// Now typing in the input automatically:
// - Updates form.values.email
// - Marks form.touched.email as true
// - Triggers any validators
// - Updates all reactive UI
```

 

### Example 3: Method Chaining

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

// Chain multiple updates
form
  .setValue('firstName', 'Alice')
  .setValue('lastName', 'Johnson')
  .setValue('email', 'alice@example.com');

console.log(form.values);
// {
//   firstName: 'Alice',
//   lastName: 'Johnson',
//   email: 'alice@example.com'
// }

console.log(form.touchedFields);
// ['firstName', 'lastName', 'email']
```

 

### Example 4: Reactive UI Update

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: (value) => value.length < 3 ? 'Too short' : ''
  }
);

// Set up reactive display
effect(() => {
  const displayEl = document.getElementById('username-display');
  displayEl.textContent = form.values.username || '(empty)';
});

// Set up reactive error display
effect(() => {
  const errorEl = document.getElementById('username-error');
  if (form.touched.username && form.errors.username) {
    errorEl.textContent = form.errors.username;
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
});

// Update the value
form.setValue('username', 'ab');
// UI automatically updates:
// - Display shows: 'ab'
// - Error shows: 'Too short'

form.setValue('username', 'alice');
// UI automatically updates:
// - Display shows: 'alice'
// - Error hides
```

 

### Example 5: With Validation

```javascript
const form = Forms.create(
  {
    email: '',
    age: 0
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    age: (value) => value < 18 ? 'Must be 18+' : ''
  }
);

// Set invalid email
form.setValue('email', 'not-an-email');
console.log(form.errors.email); // 'Invalid email'

// Fix the email
form.setValue('email', 'user@example.com');
console.log(form.errors.email); // ''

// Set invalid age
form.setValue('age', 15);
console.log(form.errors.age); // 'Must be 18+'

// Fix the age
form.setValue('age', 25);
console.log(form.errors.age); // ''
```

 

## Advanced Patterns

### Pattern 1: Conditional Updates

```javascript
const form = Forms.create({
  country: '',
  state: '',
  zipCode: ''
});

// When country changes, clear dependent fields
function updateCountry(newCountry) {
  form.setValue('country', newCountry);

  // Clear state if not US
  if (newCountry !== 'US') {
    form.setValue('state', '');
  }

  // Adjust zip code format
  if (newCountry === 'US') {
    // US zip codes are 5 digits
    form.setValue('zipCode', '');
  } else if (newCountry === 'Canada') {
    // Canadian postal codes are different format
    form.setValue('zipCode', '');
  }
}

updateCountry('US');
```

 

### Pattern 2: Debounced Updates

```javascript
const form = Forms.create({
  searchQuery: ''
});

let debounceTimeout;

function handleSearchInput(value) {
  // Clear previous timeout
  clearTimeout(debounceTimeout);

  // Update immediately (for display)
  form.setValue('searchQuery', value);

  // Debounce the search request
  debounceTimeout = setTimeout(() => {
    performSearch(form.values.searchQuery);
  }, 300);
}

searchInput.addEventListener('input', (e) => {
  handleSearchInput(e.target.value);
});
```

 

### Pattern 3: Computed Field Updates

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  fullName: '' // Computed from first + last
});

// Update full name whenever first or last changes
effect(() => {
  const { firstName, lastName } = form.values;
  const fullName = `${firstName} ${lastName}`.trim();

  // Only update if different to avoid infinite loop
  if (form.values.fullName !== fullName) {
    form.setValue('fullName', fullName);
  }
});

form.setValue('firstName', 'Alice');
// fullName automatically becomes 'Alice'

form.setValue('lastName', 'Johnson');
// fullName automatically becomes 'Alice Johnson'
```

 

### Pattern 4: Multi-Field Validation

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: (value) => value.length < 8 ? 'Too short' : '',
    confirmPassword: (value, allValues) => {
      if (value !== allValues.password) {
        return 'Passwords must match';
      }
      return '';
    }
  }
);

// When password changes, revalidate confirm
effect(() => {
  const { password } = form.values;

  // If confirm has been touched, revalidate it
  if (form.touched.confirmPassword) {
    form.validateField('confirmPassword');
  }
});

form.setValue('password', 'secret123');
form.setValue('confirmPassword', 'secret456');
console.log(form.errors.confirmPassword); // 'Passwords must match'

form.setValue('confirmPassword', 'secret123');
console.log(form.errors.confirmPassword); // ''
```

 

### Pattern 5: Formatted Input

```javascript
const form = Forms.create({
  phoneNumber: '',
  creditCard: '',
  ssn: ''
});

// Phone number formatter
function formatPhoneNumber(value) {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

phoneInput.addEventListener('input', (e) => {
  const formatted = formatPhoneNumber(e.target.value);
  form.setValue('phoneNumber', formatted);

  // Update input display
  e.target.value = formatted;
});

// User types: "5551234567"
// Form stores: "(555) 123-4567"
```

 

### Pattern 6: Undo/Redo System

```javascript
const form = Forms.create({
  content: ''
});

const history = [];
let historyIndex = -1;

function recordHistory(field, value) {
  // Remove any future history if we're not at the end
  history.splice(historyIndex + 1);

  // Add new state
  history.push({ field, value });
  historyIndex++;

  // Limit history size
  if (history.length > 50) {
    history.shift();
    historyIndex--;
  }
}

// Wrap setValue to record history
const originalSetValue = form.setValue.bind(form);
form.setValue = function(field, value) {
  recordHistory(field, value);
  return originalSetValue(field, value);
};

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const { field, value } = history[historyIndex];
    originalSetValue(field, value);
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    const { field, value } = history[historyIndex];
    originalSetValue(field, value);
  }
}

// Usage
form.setValue('content', 'Hello');
form.setValue('content', 'Hello World');
form.setValue('content', 'Hello World!');

undo(); // back to 'Hello World'
undo(); // back to 'Hello'
redo(); // forward to 'Hello World'
```

 

### Pattern 7: Batch Updates with Progress

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
});

async function loadFormData(data) {
  const fields = Object.keys(data);
  let progress = 0;

  for (const field of fields) {
    // Simulate async data processing
    await new Promise(resolve => setTimeout(resolve, 100));

    form.setValue(field, data[field]);

    progress++;
    updateProgressBar((progress / fields.length) * 100);
  }
}

function updateProgressBar(percentage) {
  const progressEl = document.getElementById('progress');
  progressEl.style.width = `${percentage}%`;
  progressEl.textContent = `${Math.round(percentage)}%`;
}

// Load data
loadFormData({
  field1: 'value1',
  field2: 'value2',
  field3: 'value3',
  field4: 'value4',
  field5: 'value5'
});
```

 

### Pattern 8: Smart Autocomplete

```javascript
const form = Forms.create({
  email: '',
  domain: ''
});

const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];

emailInput.addEventListener('input', (e) => {
  const value = e.target.value;
  form.setValue('email', value);

  // Auto-suggest domain
  if (value.includes('@')) {
    const [username, partialDomain] = value.split('@');

    if (partialDomain) {
      const match = commonDomains.find(domain =>
        domain.startsWith(partialDomain)
      );

      if (match) {
        showSuggestion(`${username}@${match}`);
      }
    }
  }
});

function acceptSuggestion(suggestion) {
  form.setValue('email', suggestion);
  emailInput.value = suggestion;
  hideSuggestion();
}
```

 

## Common Pitfalls

### Pitfall 1: Direct Mutation Instead of setValue()

```javascript
const form = Forms.create({
  username: ''
});

// ❌ WRONG - Direct mutation
form.values.username = 'alice';

// Problems:
// - Field is NOT marked as touched
// - Validation might not run
// - Some reactive updates might not fire

// ✅ CORRECT - Use setValue()
form.setValue('username', 'alice');

// Benefits:
// - Field marked as touched ✓
// - Validation runs automatically ✓
// - All reactive updates fire ✓
```

 

### Pitfall 2: Forgetting Method Returns Form

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

// ❌ Less efficient - separate calls
form.setValue('field1', 'value1');
form.setValue('field2', 'value2');

// ✅ Better - use chaining
form
  .setValue('field1', 'value1')
  .setValue('field2', 'value2');
```

 

### Pitfall 3: Setting Non-Existent Fields

```javascript
const form = Forms.create({
  username: '',
  email: ''
});

// ❌ This will set a field that wasn't in initial values
form.setValue('password', 'secret');

// The field exists but wasn't part of the initial form structure
console.log(form.values.password); // 'secret'

// ✅ Better - define all fields upfront
const form2 = Forms.create({
  username: '',
  email: '',
  password: '' // Explicitly defined
});

form2.setValue('password', 'secret'); // Now it's clear this field exists
```

 

### Pitfall 4: Infinite Loops with Computed Fields

```javascript
const form = Forms.create({
  value: 0,
  doubled: 0
});

// ❌ WRONG - Infinite loop!
effect(() => {
  form.setValue('doubled', form.values.value * 2);
  // This triggers the effect again because doubled changed!
});

// ✅ CORRECT - Guard against unnecessary updates
effect(() => {
  const newDoubled = form.values.value * 2;

  if (form.values.doubled !== newDoubled) {
    form.setValue('doubled', newDoubled);
  }
});
```

 

### Pitfall 5: Overusing setValue() in Loops

```javascript
const form = Forms.create({
  field1: '', field2: '', field3: '', field4: '', field5: ''
});

const data = {
  field1: 'value1',
  field2: 'value2',
  field3: 'value3',
  field4: 'value4',
  field5: 'value5'
};

// ❌ Less efficient - triggers validation for each field
Object.entries(data).forEach(([field, value]) => {
  form.setValue(field, value);
});

// ✅ Better for batch updates - use setValues()
form.setValues(data);
// Only triggers validation once at the end
```

 

## Summary

### Key Takeaways

1. **`setValue()` is the primary method** for updating individual form field values.

2. **Automatically marks field as touched** - tracks user interaction.

3. **Triggers validation** - errors update automatically.

4. **Maintains reactivity** - all dependent UI updates automatically.

5. **Returns form instance** - enables method chaining.

6. **Use for single field updates** - use `setValues()` for batch updates.

### When to Use setValue()

✅ **Use setValue() when:**
- User types in an input field
- You need to update a single field value
- You want to mark a field as touched
- You want validation to run immediately
- You need to chain multiple single updates

❌ **Don't use setValue() when:**
- Updating multiple fields at once (use `setValues()`)
- You need to update without marking as touched (rare case)
- You're in a tight loop updating many fields

### One-Line Rule

> **`form.setValue(field, value)` is the smart way to update a single field - it updates the value, marks it as touched, triggers validation, and maintains reactivity.**

 

**What's Next?**

- Learn about `form.setValues()` for batch updates
- Explore `form.getValue()` for retrieving values
- Master reactive form patterns with effects
