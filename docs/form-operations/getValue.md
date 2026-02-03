# form.getValue()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  username: 'alice',
  email: 'alice@example.com',
  age: 25,
  profile: {
    bio: 'Developer',
    location: 'NYC'
  }
});

// Get individual field values
console.log(form.getValue('username')); // 'alice'
console.log(form.getValue('email')); // 'alice@example.com'
console.log(form.getValue('age')); // 25

// Get nested values
console.log(form.getValue('profile')); // { bio: 'Developer', location: 'NYC' }

// Also works with direct access
console.log(form.values.username); // 'alice' (same result)
```

**What just happened?** `getValue()` retrieves individual field values with a clean method call!

 

## What is form.getValue()?

`form.getValue()` is a **convenience method** for retrieving individual form field values.

Simply put, it's a clean way to read field values without directly accessing `form.values.fieldName`.

**Key characteristics:**
- ✅ Retrieves single field value
- ✅ Works with nested objects
- ✅ Returns undefined for non-existent fields
- ✅ Cleaner than direct property access in some contexts
- ✅ Useful for programmatic field access

 

## Syntax

```javascript
// Basic usage
const value = form.getValue(fieldName)

// Get nested values
const nested = form.getValue('parent.child')

// Use in expressions
if (form.getValue('email').includes('@')) {
  // ...
}
```

**Parameters:**
- `fieldName` (string) - The name of the field to retrieve

**Returns:** The current value of the specified field (any type)

 

## Why Does This Exist?

### Providing a Consistent API

While you can access values directly via `form.values.fieldName`, `getValue()` provides a method-based API that's especially useful in certain contexts.

```javascript
const form = Forms.create({
  username: 'alice',
  email: 'alice@example.com'
});

// Both approaches work:
console.log(form.values.username);    // Direct access
console.log(form.getValue('username')); // Method call

// They return the same value
```

**When getValue() shines:**
✅ **Dynamic field access** - When field name is in a variable
✅ **Consistency** - Pairs with `setValue()` for symmetry
✅ **Abstraction** - Hides internal structure
✅ **Null safety** - Returns undefined for missing fields
✅ **Programmatic access** - Easier in loops and utilities

 

## Mental Model

Think of `getValue()` as a **safe accessor** for form field values.

### Direct Access Pattern
```
form.values.fieldName
     ↓
Access property directly
     ↓
Returns value or throws if form.values doesn't exist
```

### Method Access Pattern
```
form.getValue('fieldName')
     ↓
Call method with field name
     ↓
Safely returns value or undefined
     ↓
Consistent API across all operations
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.getValue('email')

// Here's what happens internally:
1️⃣ Access the field from values object
   const value = form.values[field]

2️⃣ Return the value
   return value

// It's essentially syntactic sugar for:
form.values[field]
```

### Comparison with Direct Access

```javascript
const form = Forms.create({
  username: 'alice',
  email: 'alice@example.com'
});

// These are equivalent:
form.getValue('username')  // 'alice'
form.values.username       // 'alice'
form.values['username']    // 'alice'

// getValue() is most useful when field name is dynamic:
const fieldName = 'email';
form.getValue(fieldName)   // Clean
form.values[fieldName]     // Also works, but less explicit
```

 

## Basic Usage

### Example 1: Simple Retrieval

```javascript
const form = Forms.create({
  firstName: 'Alice',
  lastName: 'Johnson',
  age: 25
});

console.log(form.getValue('firstName')); // 'Alice'
console.log(form.getValue('lastName'));  // 'Johnson'
console.log(form.getValue('age'));       // 25
```

 

### Example 2: Dynamic Field Access

```javascript
const form = Forms.create({
  field1: 'value1',
  field2: 'value2',
  field3: 'value3'
});

// Access fields programmatically
const fields = ['field1', 'field2', 'field3'];

fields.forEach(fieldName => {
  const value = form.getValue(fieldName);
  console.log(`${fieldName}: ${value}`);
});

// Output:
// field1: value1
// field2: value2
// field3: value3
```

 

### Example 3: Conditional Logic

```javascript
const form = Forms.create({
  accountType: 'business',
  companyName: 'Acme Corp',
  personalName: ''
});

// Use getValue in conditions
if (form.getValue('accountType') === 'business') {
  console.log('Company:', form.getValue('companyName'));
} else {
  console.log('Name:', form.getValue('personalName'));
}
```

 

### Example 4: Display Current Values

```javascript
const form = Forms.create({
  username: 'alice',
  email: 'alice@example.com',
  bio: 'Software developer'
});

function displayProfile() {
  const username = form.getValue('username');
  const email = form.getValue('email');
  const bio = form.getValue('bio');

  document.getElementById('profile').innerHTML = `
    <h3>${username}</h3>
    <p>Email: ${email}</p>
    <p>Bio: ${bio}</p>
  `;
}

displayProfile();
```

 

### Example 5: Validation Helper

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
    confirmPassword: (value, allValues) => {
      // Using getValue here would also work
      if (value !== allValues.password) {
        return 'Passwords must match';
      }
      return '';
    }
  }
);

// Check if specific field is valid
function isFieldValid(fieldName) {
  const value = form.getValue(fieldName);
  const error = form.errors[fieldName];

  return value && !error;
}

console.log(isFieldValid('email')); // false (empty)

form.setValue('email', 'user@example.com');
console.log(isFieldValid('email')); // true
```

 

## Advanced Patterns

### Pattern 1: Field Comparison

```javascript
const form = Forms.create({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

function validatePasswordChange() {
  const oldPwd = form.getValue('oldPassword');
  const newPwd = form.getValue('newPassword');
  const confirmPwd = form.getValue('confirmPassword');

  if (oldPwd === newPwd) {
    return 'New password must be different from old password';
  }

  if (newPwd !== confirmPwd) {
    return 'Passwords do not match';
  }

  return '';
}
```

 

### Pattern 2: Build Display Object

```javascript
const form = Forms.create({
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice@example.com',
  phone: '555-0123',
  internal_id: '12345',
  internal_token: 'abc123'
});

// Get only display-friendly fields
function getDisplayData() {
  const displayFields = ['firstName', 'lastName', 'email', 'phone'];

  return displayFields.reduce((acc, field) => {
    acc[field] = form.getValue(field);
    return acc;
  }, {});
}

console.log(getDisplayData());
// {
//   firstName: 'Alice',
//   lastName: 'Johnson',
//   email: 'alice@example.com',
//   phone: '555-0123'
// }
// (internal fields excluded)
```

 

### Pattern 3: Generate Summary

```javascript
const form = Forms.create({
  productName: 'Laptop',
  quantity: 2,
  price: 999.99,
  taxRate: 0.08
});

function generateOrderSummary() {
  const name = form.getValue('productName');
  const qty = form.getValue('quantity');
  const price = form.getValue('price');
  const taxRate = form.getValue('taxRate');

  const subtotal = qty * price;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    productName: name,
    quantity: qty,
    unitPrice: price,
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2)
  };
}

console.log(generateOrderSummary());
// {
//   productName: 'Laptop',
//   quantity: 2,
//   unitPrice: 999.99,
//   subtotal: '1999.98',
//   tax: '159.99',
//   total: '2159.97'
// }
```

 

### Pattern 4: Field Dependency Check

```javascript
const form = Forms.create({
  shippingRequired: true,
  address: '',
  city: '',
  zipCode: ''
});

function getRequiredShippingFields() {
  const shippingRequired = form.getValue('shippingRequired');

  if (!shippingRequired) {
    return [];
  }

  const requiredFields = ['address', 'city', 'zipCode'];
  const emptyFields = requiredFields.filter(field => {
    const value = form.getValue(field);
    return !value || value.trim() === '';
  });

  return emptyFields;
}

console.log(getRequiredShippingFields());
// ['address', 'city', 'zipCode']

form.setValue('address', '123 Main St');
console.log(getRequiredShippingFields());
// ['city', 'zipCode']
```

 

### Pattern 5: Export to Different Format

```javascript
const form = Forms.create({
  title: 'My Document',
  content: 'Lorem ipsum...',
  author: 'Alice',
  tags: ['tech', 'tutorial']
});

// Export as JSON
function exportAsJSON() {
  return JSON.stringify({
    title: form.getValue('title'),
    content: form.getValue('content'),
    author: form.getValue('author'),
    tags: form.getValue('tags')
  }, null, 2);
}

// Export as CSV
function exportAsCSV() {
  const title = form.getValue('title');
  const author = form.getValue('author');
  const tags = form.getValue('tags').join(';');

  return `"${title}","${author}","${tags}"`;
}

// Export as XML
function exportAsXML() {
  const title = form.getValue('title');
  const content = form.getValue('content');
  const author = form.getValue('author');

  return `
    <document>
      <title>${title}</title>
      <author>${author}</author>
      <content>${content}</content>
    </document>
  `.trim();
}
```

 

### Pattern 6: Computed Display Value

```javascript
const form = Forms.create({
  rawPrice: 1999,
  currency: 'USD',
  locale: 'en-US'
});

function getFormattedPrice() {
  const price = form.getValue('rawPrice');
  const currency = form.getValue('currency');
  const locale = form.getValue('locale');

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(price);
}

console.log(getFormattedPrice()); // '$1,999.00'

form.setValue('locale', 'de-DE');
form.setValue('currency', 'EUR');
console.log(getFormattedPrice()); // '1.999,00 €'
```

 

### Pattern 7: Field Aggregation

```javascript
const form = Forms.create({
  q1Score: 85,
  q2Score: 90,
  q3Score: 78,
  q4Score: 92
});

function calculateAverage() {
  const fields = ['q1Score', 'q2Score', 'q3Score', 'q4Score'];

  const total = fields.reduce((sum, field) => {
    return sum + form.getValue(field);
  }, 0);

  return (total / fields.length).toFixed(2);
}

console.log(calculateAverage()); // '86.25'

function getHighestScore() {
  const fields = ['q1Score', 'q2Score', 'q3Score', 'q4Score'];

  return Math.max(...fields.map(field => form.getValue(field)));
}

console.log(getHighestScore()); // 92
```

 

### Pattern 8: Safe Nested Access

```javascript
const form = Forms.create({
  user: {
    profile: {
      name: 'Alice',
      settings: {
        theme: 'dark'
      }
    }
  }
});

// Get nested value safely
function getNestedValue(path) {
  const parts = path.split('.');
  let value = form.getValue(parts[0]);

  for (let i = 1; i < parts.length; i++) {
    if (value && typeof value === 'object') {
      value = value[parts[i]];
    } else {
      return undefined;
    }
  }

  return value;
}

console.log(getNestedValue('user.profile.name')); // 'Alice'
console.log(getNestedValue('user.profile.settings.theme')); // 'dark'
console.log(getNestedValue('user.profile.nonexistent')); // undefined
```

 

### Pattern 9: Conditional Field Display

```javascript
const form = Forms.create({
  showAdvanced: false,
  basicOption1: '',
  basicOption2: '',
  advancedOption1: '',
  advancedOption2: ''
});

function getVisibleFields() {
  const showAdvanced = form.getValue('showAdvanced');

  const visibleFields = ['basicOption1', 'basicOption2'];

  if (showAdvanced) {
    visibleFields.push('advancedOption1', 'advancedOption2');
  }

  return visibleFields;
}

function renderForm() {
  const fields = getVisibleFields();

  fields.forEach(field => {
    const value = form.getValue(field);
    console.log(`${field}: ${value}`);
  });
}

renderForm();
// basicOption1:
// basicOption2:

form.setValue('showAdvanced', true);
renderForm();
// basicOption1:
// basicOption2:
// advancedOption1:
// advancedOption2:
```

 

### Pattern 10: Data Transformation Pipeline

```javascript
const form = Forms.create({
  rawInput: '  HELLO WORLD  ',
  processedOutput: ''
});

// Transform pipeline using getValue
function processInput() {
  let value = form.getValue('rawInput');

  // Step 1: Trim whitespace
  value = value.trim();

  // Step 2: Convert to lowercase
  value = value.toLowerCase();

  // Step 3: Replace spaces with hyphens
  value = value.replace(/\s+/g, '-');

  // Step 4: Remove special characters
  value = value.replace(/[^a-z0-9-]/g, '');

  return value;
}

const processed = processInput();
console.log(processed); // 'hello-world'

form.setValue('processedOutput', processed);
```

 

## Common Pitfalls

### Pitfall 1: Assuming getValue() is Required

```javascript
const form = Forms.create({
  username: 'alice'
});

// Both work equally well:
console.log(form.getValue('username')); // 'alice'
console.log(form.values.username);      // 'alice'

// ✅ Use getValue() when:
// - Field name is dynamic
// - You want consistent method-based API
// - Working with utility functions

// ✅ Use direct access when:
// - Field name is static
// - Code is clearer with property access
// - Accessing multiple fields
```

 

### Pitfall 2: Not Handling Undefined Fields

```javascript
const form = Forms.create({
  field1: '',
  field2: ''
});

// ❌ Risky - field doesn't exist
const value = form.getValue('nonExistent');
console.log(value.toUpperCase()); // Error: Cannot read property 'toUpperCase' of undefined

// ✅ Safe - check first
const value = form.getValue('nonExistent');
if (value) {
  console.log(value.toUpperCase());
}

// ✅ Or provide default
const value = form.getValue('nonExistent') || '';
console.log(value.toUpperCase()); // Works
```

 

### Pitfall 3: Overusing getValue() for Multiple Fields

```javascript
const form = Forms.create({
  field1: 'value1',
  field2: 'value2',
  field3: 'value3'
});

// ❌ Verbose when accessing many fields
const f1 = form.getValue('field1');
const f2 = form.getValue('field2');
const f3 = form.getValue('field3');
console.log(f1, f2, f3);

// ✅ Cleaner with destructuring
const { field1, field2, field3 } = form.values;
console.log(field1, field2, field3);
```

 

### Pitfall 4: Expecting Reactivity from getValue()

```javascript
const form = Forms.create({
  counter: 0
});

// ❌ This doesn't create a reactive reference
const count = form.getValue('counter');

form.setValue('counter', 5);
console.log(count); // Still 0 (not reactive)

// ✅ Access directly when needed for current value
console.log(form.getValue('counter')); // 5

// ✅ Or use in reactive effect
effect(() => {
  const currentCount = form.getValue('counter');
  console.log('Count:', currentCount);
});
```

 

### Pitfall 5: Complex Path Syntax

```javascript
const form = Forms.create({
  user: {
    profile: {
      name: 'Alice'
    }
  }
});

// ❌ This doesn't work (no path traversal built-in)
const name = form.getValue('user.profile.name'); // Returns undefined

// ✅ Access nested objects
const user = form.getValue('user');
const name = user.profile.name;

// ✅ Or use direct access
const name = form.values.user.profile.name;

// ✅ Or implement helper (see Pattern 8)
```

 

## Summary

### Key Takeaways

1. **`getValue()` retrieves individual field values** - clean method-based API.

2. **Equivalent to `form.values[field]`** - syntactic sugar for consistency.

3. **Most useful with dynamic field names** - when field is in a variable.

4. **Returns undefined for missing fields** - no errors thrown.

5. **Not reactive by itself** - returns current value snapshot.

6. **Pairs with `setValue()`** - symmetric API for get/set operations.

### When to Use getValue()

✅ **Use getValue() when:**
- Field name is stored in a variable
- Building utility functions for field access
- Want consistent method-based API
- Accessing fields programmatically in loops
- Building abstractions over form internals

❌ **Don't use getValue() when:**
- Accessing static fields (direct access is cleaner)
- Need to access many fields (destructuring is better)
- Field definitely exists (direct access is fine)

### Comparison Table

| Scenario | getValue() | Direct Access |
|   -|   --|     |
| Static field name | `form.getValue('email')` | `form.values.email` ⭐ |
| Dynamic field name | `form.getValue(fieldName)` ⭐ | `form.values[fieldName]` |
| Multiple fields | Less convenient | `{ a, b } = form.values` ⭐ |
| Utility functions | More consistent ⭐ | Also works |
| Nested objects | `getValue('user').profile.name` | `values.user.profile.name` ⭐ |

### One-Line Rule

> **`form.getValue(field)` retrieves a single field value - it's most useful when the field name is dynamic or you want a consistent method-based API.**

 

**What's Next?**

- Learn about `form.setValue()` for updating values
- Explore `form.setValues()` for batch updates
- Master reactive patterns with `effect()`
