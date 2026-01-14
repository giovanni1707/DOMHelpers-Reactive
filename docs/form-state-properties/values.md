# form.values

## Quick Start (30 seconds)

```javascript
// Create a form
const form = Forms.create({
  username: '',
  email: '',
  age: ''
});

// Read values
console.log(form.values);
// { username: '', email: '', age: '' }

// Update a value (use setValue method!)
form.setValue('username', 'alice');

console.log(form.values);
// { username: 'alice', email: '', age: '' }

// Access individual values
console.log(form.values.username); // 'alice'
console.log(form.values.email);    // ''
```

**What just happened?** `form.values` is a reactive object containing all your form field values. Read from it anytime, but update through `setValue()` to trigger validation!

 

## What is form.values?

`form.values` is a **reactive object property** that stores the current values of all your form fields.

Simply put, it's where the actual form data lives. When you type into a field, that data is stored in `form.values`. When you submit the form, you send `form.values` to your server.

Think of `form.values` as the **data container** for your form - like a basket holding all the information the user has entered.

 

## Syntax

### Reading Values

```javascript
// Read the entire values object
const allValues = form.values;

// Read a specific field
const username = form.values.username;
const email = form.values.email;
```

### Updating Values (Don't Do This!)

```javascript
// ❌ WRONG - Don't mutate directly
form.values.username = 'alice';

// ✅ CORRECT - Use setValue()
form.setValue('username', 'alice');
```

**Type:** `Object` (read/write, but use methods to write)

 

## Why Does This Exist?

### The Problem Without a Central Values Store

Imagine managing form data without a central object:

```javascript
// Manual form data management (messy!)
let username = '';
let email = '';
let password = '';
let age = '';
let bio = '';

// Update manually
function updateUsername(value) {
  username = value;
  validateUsername(value);
  updateUI();
}

function updateEmail(value) {
  email = value;
  validateEmail(value);
  updateUI();
}

// Submit manually
function handleSubmit() {
  const data = {
    username: username,
    email: email,
    password: password,
    age: age,
    bio: bio
  };

  sendToServer(data);
}

// Get current values manually
function getCurrentValues() {
  return {
    username: username,
    email: email,
    password: password,
    age: age,
    bio: bio
  };
}
```

**What's the Real Issue?**

```
Scattered Variables
       ↓
Hard to Track
       ↓
Manual Serialization
       ↓
Easy to Forget Fields
       ↓
Bugs Everywhere
```

**Problems:**
❌ Values scattered across multiple variables
❌ Have to manually collect them for submission
❌ Easy to forget a field when submitting
❌ Hard to inspect all values at once
❌ Can't pass "all values" to functions easily
❌ No single source of truth

### The Solution with form.values

```javascript
// Reactive form with centralized values
const form = Forms.create({
  username: '',
  email: '',
  password: '',
  age: '',
  bio: ''
});

// Update using methods
form.setValue('username', 'alice');
form.setValue('email', 'alice@example.com');

// All values in one place
console.log(form.values);
// {
//   username: 'alice',
//   email: 'alice@example.com',
//   password: '',
//   age: '',
//   bio: ''
// }

// Submit is easy
const result = await form.submit();
// Automatically uses form.values

// Or access directly
await fetch('/api/profile', {
  method: 'POST',
  body: JSON.stringify(form.values)
});
```

**What Just Happened?**

```
form.values
     ↓
Single Source of Truth
     ↓
Easy to Read/Inspect
     ↓
Automatic Serialization
     ↓
Clean, Bug-Free Code
```

**Benefits:**
✅ All values in one object
✅ Single source of truth
✅ Easy to inspect entire form state
✅ Automatic serialization for submission
✅ Can pass to validators that need multiple fields
✅ Reactive - updates automatically trigger effects

 

## Mental Model

Think of `form.values` like a **form clipboard** that holds all the user's answers:

### Without form.values (Sticky Notes Everywhere)
```
Question 1: Name?
[Sticky note on desk: "Alice"]

Question 2: Email?
[Sticky note on wall: "alice@example.com"]

Question 3: Age?
[Sticky note on monitor: "25"]

You: "What were all the answers again?"
     *Frantically collects sticky notes from everywhere*
```

### With form.values (Single Clipboard)
```
[Clipboard with all answers:]
┌─────────────────────────┐
│ Name:  Alice            │
│ Email: alice@example.com│
│ Age:   25               │
└─────────────────────────┘

You: "What were all the answers?"
     *Glances at clipboard - done!*
```

**Key Insight:** `form.values` keeps all your form data organized in one central, easily accessible location.

 

## How Does It Work?

### Under the Hood

When you create a form, `form.values` is initialized with your initial values:

```
Forms.create({ username: '', email: '' })
              ↓
    Creates reactive state
              ↓
    {
      values: { username: '', email: '' },  ← form.values
      errors: {},
      touched: {},
      isSubmitting: false
    }
              ↓
    Returns form object with values property
```

### Visual Structure

```
form (reactive object)
├── values
│   ├── username: ''
│   ├── email: ''
│   └── password: ''
├── errors
│   └── (error messages)
├── touched
│   └── (touched flags)
└── methods
    ├── setValue()
    ├── setValues()
    └── submit()
```

### Reactivity

`form.values` is **reactive**, meaning:

```javascript
// Create effect that watches values
effect(() => {
  console.log('Values changed:', form.values);
});

// When you update...
form.setValue('username', 'alice');
// Console logs: "Values changed: { username: 'alice', ... }"

// The effect runs automatically!
```

 

## Basic Usage

### Example 1: Reading All Values

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

// Fill out the form
form.setValue('firstName', 'Alice');
form.setValue('lastName', 'Smith');
form.setValue('email', 'alice@example.com');

// Read all values
console.log(form.values);
// {
//   firstName: 'Alice',
//   lastName: 'Smith',
//   email: 'alice@example.com'
// }

// Stringify for API
const json = JSON.stringify(form.values);
console.log(json);
// '{"firstName":"Alice","lastName":"Smith","email":"alice@example.com"}'
```

 

### Example 2: Reading Individual Values

```javascript
const form = Forms.create({
  username: 'alice',
  email: 'alice@example.com',
  bio: 'Hello world'
});

// Access specific values
const username = form.values.username;
console.log(username); // 'alice'

const email = form.values.email;
console.log(email); // 'alice@example.com'

// Use in expressions
if (form.values.bio.length > 100) {
  console.log('Bio is too long!');
}
```

 

### Example 3: Displaying Values in UI

```javascript
const form = Forms.create({
  name: '',
  email: ''
});

// Bind to DOM with reactivity
effect(() => {
  document.getElementById('name-display').textContent = form.values.name;
  document.getElementById('email-display').textContent = form.values.email;
});

// When values change, UI updates automatically
form.setValue('name', 'Alice');
// DOM updates: "Alice"

form.setValue('email', 'alice@example.com');
// DOM updates: "alice@example.com"
```

 

### Example 4: Checking if Form is Empty

```javascript
const form = Forms.create({
  search: '',
  filter: ''
});

// Check if all values are empty
function isFormEmpty() {
  return Object.values(form.values).every(val => !val);
}

console.log(isFormEmpty()); // true

form.setValue('search', 'hello');
console.log(isFormEmpty()); // false
```

 

## Reading Values

### Pattern 1: Destructure Values

```javascript
const form = Forms.create({
  username: 'alice',
  email: 'alice@example.com',
  age: 25
});

// Destructure for easier access
const { username, email, age } = form.values;

console.log(username); // 'alice'
console.log(email);    // 'alice@example.com'
console.log(age);      // 25
```

 

### Pattern 2: Iterate Over Values

```javascript
const form = Forms.create({
  name: 'Alice',
  email: 'alice@example.com',
  phone: '555-1234'
});

// Log all field names and values
Object.entries(form.values).forEach(([field, value]) => {
  console.log(`${field}: ${value}`);
});
// name: Alice
// email: alice@example.com
// phone: 555-1234
```

 

### Pattern 3: Check Specific Values

```javascript
const form = Forms.create({
  termsAccepted: false,
  newsletter: false,
  age: ''
});

// Check boolean values
if (form.values.termsAccepted) {
  console.log('Terms accepted!');
}

// Check if field has value
if (form.values.age) {
  console.log('Age provided:', form.values.age);
}
```

 

### Pattern 4: Use in Computed Properties

```javascript
const form = Forms.create({
  firstName: '',
  lastName: ''
});

// Compute full name from values
form.computed('fullName', function() {
  return `${this.values.firstName} ${this.values.lastName}`.trim();
});

form.setValue('firstName', 'Alice');
form.setValue('lastName', 'Smith');

console.log(form.fullName); // 'Alice Smith'
```

 

## Updating Values

### ✅ Correct Way: Use setValue()

```javascript
const form = Forms.create({
  username: '',
  email: ''
});

// Use setValue method
form.setValue('username', 'alice');
form.setValue('email', 'alice@example.com');

console.log(form.values);
// { username: 'alice', email: 'alice@example.com' }

// Benefits:
// ✅ Triggers validation
// ✅ Marks field as touched
// ✅ Updates errors automatically
// ✅ Reactive - triggers effects
```

 

### ✅ Correct Way: Use setValues() for Multiple

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

// Update multiple values at once
form.setValues({
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com'
});

console.log(form.values);
// All three fields updated!
```

 

### ❌ Wrong Way: Direct Mutation

```javascript
const form = Forms.create({
  username: '',
  email: ''
});

// DON'T DO THIS!
form.values.username = 'alice';
form.values.email = 'alice@example.com';

// Problems:
// ❌ Doesn't trigger validation
// ❌ Doesn't mark as touched
// ❌ Errors won't update
// ❌ May not trigger effects properly
```

**Always use the methods (`setValue`, `setValues`) to update values!**

 

## Advanced Patterns

### Pattern 1: Pre-fill Form from API

```javascript
// Fetch user data from API
const userData = await fetch('/api/user/123').then(r => r.json());
// { name: 'Alice', email: 'alice@example.com', bio: 'Developer' }

// Create form with API data
const form = Forms.create({
  name: userData.name,
  email: userData.email,
  bio: userData.bio
});

console.log(form.values);
// { name: 'Alice', email: 'alice@example.com', bio: 'Developer' }
// Form is pre-filled!
```

 

### Pattern 2: Transform Values Before Submission

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

form.setValues({
  firstName: 'alice',
  lastName: 'smith',
  email: 'ALICE@EXAMPLE.COM'
});

// Transform values before sending
const transformedValues = {
  firstName: form.values.firstName.charAt(0).toUpperCase() +
             form.values.firstName.slice(1),
  lastName: form.values.lastName.charAt(0).toUpperCase() +
            form.values.lastName.slice(1),
  email: form.values.email.toLowerCase()
};

console.log(transformedValues);
// {
//   firstName: 'Alice',
//   lastName: 'Smith',
//   email: 'alice@example.com'
// }
```

 

### Pattern 3: Partial Updates

```javascript
const form = Forms.create({
  name: 'Alice',
  email: 'alice@example.com',
  phone: '555-1234',
  address: '123 Main St'
});

// Update only changed fields
const changedFields = {
  email: 'newemail@example.com'
};

form.setValues(changedFields);

console.log(form.values);
// {
//   name: 'Alice',            ← unchanged
//   email: 'newemail@example.com', ← updated
//   phone: '555-1234',        ← unchanged
//   address: '123 Main St'    ← unchanged
// }
```

 

### Pattern 4: Watch Values for Changes

```javascript
const form = Forms.create({
  search: '',
  filter: ''
});

// Watch for any value change
effect(() => {
  console.log('Form values:', JSON.stringify(form.values));

  // Could trigger search API call
  if (form.values.search) {
    searchAPI(form.values.search, form.values.filter);
  }
});

// Triggers effect
form.setValue('search', 'hello');
// Console: 'Form values: {"search":"hello","filter":""}'
```

 

### Pattern 5: Compare with Initial Values

```javascript
const initialData = {
  name: 'Alice',
  email: 'alice@example.com'
};

const form = Forms.create(initialData);

// User makes changes
form.setValue('email', 'newemail@example.com');

// Check what changed
function getChangedFields() {
  const changed = {};

  Object.keys(form.values).forEach(key => {
    if (form.values[key] !== initialData[key]) {
      changed[key] = form.values[key];
    }
  });

  return changed;
}

console.log(getChangedFields());
// { email: 'newemail@example.com' }
// Only email changed!
```

 

### Pattern 6: Conditional Fields Based on Values

```javascript
const form = Forms.create({
  accountType: 'personal',
  companyName: '',
  taxId: ''
});

// Show/hide fields based on accountType
effect(() => {
  const showCompanyFields = form.values.accountType === 'business';

  document.getElementById('company-fields').style.display =
    showCompanyFields ? 'block' : 'none';
});

// Switch to business
form.setValue('accountType', 'business');
// Company fields now visible!
```

 

### Pattern 7: Auto-save on Value Change

```javascript
const form = Forms.create({
  title: '',
  content: ''
});

// Auto-save draft after any change
let saveTimeout;

effect(() => {
  // Watch all values
  const _ = form.values;

  // Debounce save
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await fetch('/api/save-draft', {
      method: 'POST',
      body: JSON.stringify(form.values)
    });
    console.log('Draft saved!');
  }, 1000);
});

form.setValue('title', 'My Post');
// Saves after 1 second of inactivity
```

 

## Common Pitfalls

### Pitfall 1: Direct Mutation Instead of Using Methods

❌ **Wrong:**
```javascript
const form = Forms.create({ username: '' });

// Direct mutation
form.values.username = 'alice';

// Validation doesn't run!
console.log(form.touched.username); // undefined
console.log(form.errors.username);  // Not validated
```

✅ **Correct:**
```javascript
const form = Forms.create({ username: '' });

// Use setValue
form.setValue('username', 'alice');

// Validation runs automatically
console.log(form.touched.username); // true ✅
console.log(form.errors.username);  // Validated ✅
```

 

### Pitfall 2: Expecting Values to be Undefined

❌ **Wrong:**
```javascript
const form = Forms.create({
  username: '',
  email: ''
});

if (form.values.age) {
  // This never runs!
  console.log('Age exists');
}
```

**Why?** `form.values` only contains fields defined in `initialValues`. The field `age` doesn't exist!

✅ **Correct:**
```javascript
const form = Forms.create({
  username: '',
  email: '',
  age: '' // Define it!
});

if (form.values.age) {
  console.log('Age exists');
}
```

 

### Pitfall 3: Modifying Values Object Directly

❌ **Wrong:**
```javascript
const form = Forms.create({ tags: [] });

// Mutating array directly
form.values.tags.push('javascript');

// May not trigger reactivity properly!
```

✅ **Correct:**
```javascript
const form = Forms.create({ tags: [] });

// Create new array
const newTags = [...form.values.tags, 'javascript'];
form.setValue('tags', newTags);

// Reactivity works correctly ✅
```

 

### Pitfall 4: Forgetting Values are Reactive

❌ **Wrong:**
```javascript
const form = Forms.create({ count: 0 });

// Capture value
const count = form.values.count;

// Later...
form.setValue('count', 5);

console.log(count); // Still 0!
```

**Why?** You captured the value, not a reference to the reactive property.

✅ **Correct:**
```javascript
const form = Forms.create({ count: 0 });

form.setValue('count', 5);

// Read when needed
console.log(form.values.count); // 5 ✅
```

 

### Pitfall 5: Assuming Nested Objects are Deep

❌ **Wrong:**
```javascript
const form = Forms.create({
  user: {
    name: '',
    email: ''
  }
});

// This won't work as expected
form.setValue('user.name', 'Alice');
```

**Current implementation** works best with flat structures.

✅ **Workaround:**
```javascript
const form = Forms.create({
  userName: '',
  userEmail: ''
});

form.setValue('userName', 'Alice');
form.setValue('userEmail', 'alice@example.com');
```

Or update the entire object:
```javascript
const form = Forms.create({
  user: { name: '', email: '' }
});

form.setValue('user', {
  name: 'Alice',
  email: 'alice@example.com'
});
```

 

## Summary

### Key Takeaways

1. **`form.values` is a reactive object** containing all your form field values in one place.

2. **It's the single source of truth** for your form data - everything you need is in one object.

3. **Read from it freely** - access individual values or the entire object anytime.

4. **Update using methods** - always use `setValue()` or `setValues()`, never mutate directly.

5. **It's initialized from the initial values** passed to `Forms.create()` - only defined fields exist.

6. **It's reactive** - changes automatically trigger validation, effects, and UI updates.

7. **Perfect for submission** - `form.values` is exactly what you send to your API.

8. **Use it in validators** - cross-field validation receives all values as a parameter.

9. **Watch it for auto-save** - changes to values can trigger automatic persistence.

10. **It serializes easily** - `JSON.stringify(form.values)` works perfectly.

### One-Line Rule

> **`form.values` is your form's data container - read from it anytime, but always update through `setValue()` to maintain reactivity and validation.**

 

**What's Next?**

- Learn about `form.errors` to track validation errors
- Explore `form.touched` to know which fields the user interacted with
- Master `form.isValid` to check overall form validity
- Discover form methods like `setValue()`, `setValues()`, and `submit()`
