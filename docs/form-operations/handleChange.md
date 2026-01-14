# form.handleChange()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  username: ''
});

// Bind to input - automatic value updates
emailInput.addEventListener('input', form.handleChange);
usernameInput.addEventListener('input', form.handleChange);

// That's it! Form updates automatically when user types
effect(() => {
  console.log('Email:', form.values.email);
  console.log('Username:', form.values.username);
});
```

**What just happened?** `handleChange()` automatically extracts the field name and value from the event and updates the form!

 

## What is form.handleChange()?

`form.handleChange()` is an **event handler that automatically updates form values** when bound to input elements.

Simply put, it's a ready-to-use function that connects your HTML inputs to reactive form state without manual wiring.

**Key characteristics:**
- ✅ Reads field name from `event.target.name`
- ✅ Reads value from `event.target.value`
- ✅ Handles checkboxes automatically (`checked` property)
- ✅ Marks field as touched
- ✅ Triggers validation if validators exist
- ✅ Updates UI reactively
- ✅ Works with all input types

 

## Syntax

```javascript
// Bind to input element
inputElement.addEventListener('input', form.handleChange);
inputElement.addEventListener('change', form.handleChange);

// Or inline in HTML
<input name="email" oninput="form.handleChange(event)" />

// Works with any event that has target.name and target.value
textInput.addEventListener('input', form.handleChange);
selectInput.addEventListener('change', form.handleChange);
checkboxInput.addEventListener('change', form.handleChange);
```

**Parameters:**
- `event` (Event) - DOM event object with `target.name` and `target.value`

**Returns:** `void` - Updates form state

**Requirements:**
- Input must have a `name` attribute matching a field in form
- Event must have `target.name` and `target.value` (or `target.checked` for checkboxes)

 

## Why Does This Exist?

### The Challenge with Manual Updates

Without `handleChange()`, you need to manually wire every input to form state.

```javascript
const form = Forms.create({
  email: '',
  username: '',
  password: ''
});

// ❌ Manual wiring - repetitive and error-prone
emailInput.addEventListener('input', (e) => {
  form.setValue('email', e.target.value);
});

usernameInput.addEventListener('input', (e) => {
  form.setValue('username', e.target.value);
});

passwordInput.addEventListener('input', (e) => {
  form.setValue('password', e.target.value);
});

// What if you have 20 fields? 50 fields?
```

**Problems:**
❌ **Repetitive code** - Same pattern for every input
❌ **Manual name mapping** - Easy to mistype field names
❌ **Boilerplate** - Event handler for every field
❌ **Maintenance burden** - Add handler when adding fields
❌ **Error-prone** - Easy to forget a field

### The Solution with handleChange()

```javascript
const form = Forms.create({
  email: '',
  username: '',
  password: ''
});

// ✅ One-line binding per field
emailInput.addEventListener('input', form.handleChange);
usernameInput.addEventListener('input', form.handleChange);
passwordInput.addEventListener('input', form.handleChange);

// Or even simpler with getFieldProps (covered separately)
```

**Benefits:**
✅ **Zero boilerplate** - No custom event handlers needed
✅ **Automatic field detection** - Reads name from `event.target.name`
✅ **Convention-based** - Just match `name` attribute to form field
✅ **Less code** - One function handles all inputs
✅ **Less error-prone** - No manual field name typing

 

## Mental Model

Think of `handleChange()` as a **smart event router** - it automatically figures out which field to update based on the input's name.

### Visual Flow

```
User types in input
         ↓
Input fires 'input' event
         ↓
   handleChange(event)
         ↓
1. Read event.target.name → 'email'
2. Read event.target.value → 'user@example.com'
         ↓
3. Call form.setValue('email', 'user@example.com')
         ↓
4. Mark field as touched
5. Trigger validation
         ↓
Form updates reactively
         ↓
UI updates automatically
```

### Real-World Analogy

**Without handleChange** (Individual Operators):
```
Each input has its own dedicated operator
Input 1 → Operator 1 → Form field 1
Input 2 → Operator 2 → Form field 2
Input 3 → Operator 3 → Form field 3

Need to hire more operators for more inputs!
```

**With handleChange** (Smart Switchboard):
```
All inputs connect to one smart switchboard
Input 1 ──┐
Input 2 ──┼──→ handleChange (reads name tag) ──→ Routes to correct field
Input 3 ──┘

One switchboard handles unlimited inputs!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
inputElement.addEventListener('input', form.handleChange);

// And user types, here's what happens internally:
function handleChange(event) {
  1️⃣ Extract field name from event
     const fieldName = event.target.name; // 'email'

  2️⃣ Extract value based on input type
     let value;
     if (event.target.type === 'checkbox') {
       value = event.target.checked; // true/false
     } else {
       value = event.target.value; // 'user@example.com'
     }

  3️⃣ Update form value
     form.setValue(fieldName, value);
     // This also marks as touched and validates

  4️⃣ Reactivity triggers
     - form.values.email updates
     - Validators run
     - form.errors updates if needed
     - UI re-renders automatically
}
```

### Reactivity Flow Diagram

```
handleChange(event)
         ↓
Extract name and value
         ↓
form.setValue(name, value)
         ↓
┌────────────────────────┐
│  Reactive Updates      │
│  - values[name] = val  │
│  - touched[name] = true│
│  - Validate field      │
└────────────────────────┘
         ↓
Effects detect changes
         ↓
UI updates automatically
```

 

## Basic Usage

### Example 1: Simple Text Inputs

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: ''
});

// Bind inputs
document.querySelector('[name="firstName"]').addEventListener('input', form.handleChange);
document.querySelector('[name="lastName"]').addEventListener('input', form.handleChange);
document.querySelector('[name="email"]').addEventListener('input', form.handleChange);

// Display values reactively
effect(() => {
  console.log('Form values:', form.values);
  // Updates as user types!
});

// HTML:
// <input name="firstName" type="text" />
// <input name="lastName" type="text" />
// <input name="email" type="email" />
```

 

### Example 2: With Validation

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

// Bind inputs
emailInput.addEventListener('input', form.handleChange);
passwordInput.addEventListener('input', form.handleChange);

// Show errors reactively
effect(() => {
  if (form.shouldShowError('email')) {
    emailError.textContent = form.getError('email');
    emailError.style.display = 'block';
  } else {
    emailError.style.display = 'none';
  }
});

effect(() => {
  if (form.shouldShowError('password')) {
    passwordError.textContent = form.getError('password');
    passwordError.style.display = 'block';
  } else {
    passwordError.style.display = 'none';
  }
});
```

 

### Example 3: Checkbox Handling

```javascript
const form = Forms.create({
  newsletter: false,
  terms: false,
  notifications: false
});

// handleChange automatically reads 'checked' for checkboxes
newsletterCheckbox.addEventListener('change', form.handleChange);
termsCheckbox.addEventListener('change', form.handleChange);
notificationsCheckbox.addEventListener('change', form.handleChange);

// Display state
effect(() => {
  console.log('Newsletter:', form.values.newsletter); // true/false
  console.log('Terms:', form.values.terms);
  console.log('Notifications:', form.values.notifications);
});

// HTML:
// <input name="newsletter" type="checkbox" />
// <input name="terms" type="checkbox" />
// <input name="notifications" type="checkbox" />
```

 

### Example 4: Select Dropdown

```javascript
const form = Forms.create({
  country: '',
  plan: ''
});

// Works with select elements
countrySelect.addEventListener('change', form.handleChange);
planSelect.addEventListener('change', form.handleChange);

effect(() => {
  console.log('Selected country:', form.values.country);
  console.log('Selected plan:', form.values.plan);
});

// HTML:
// <select name="country">
//   <option value="us">United States</option>
//   <option value="uk">United Kingdom</option>
// </select>
```

 

### Example 5: Textarea

```javascript
const form = Forms.create({
  bio: '',
  comments: ''
});

// Works with textarea
bioTextarea.addEventListener('input', form.handleChange);
commentsTextarea.addEventListener('input', form.handleChange);

// Character count
effect(() => {
  charCount.textContent = `${form.values.bio.length} / 500`;
});
```

 

## Advanced Patterns

### Pattern 1: Dynamic Field Registration

```javascript
const form = Forms.create({});

// Dynamically add fields and bind inputs
function addField(fieldName, defaultValue = '') {
  form.values[fieldName] = defaultValue;

  const input = document.createElement('input');
  input.name = fieldName;
  input.type = 'text';
  input.value = defaultValue;

  // handleChange works with dynamically added fields
  input.addEventListener('input', form.handleChange);

  fieldsContainer.appendChild(input);
}

addFieldButton.addEventListener('click', () => {
  const fieldName = prompt('Field name:');
  if (fieldName) {
    addField(fieldName);
  }
});
```

 

### Pattern 2: Delegated Event Handling

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Use event delegation - one listener for all inputs
formElement.addEventListener('input', (e) => {
  if (e.target.matches('input, select, textarea')) {
    form.handleChange(e);
  }
});

// Works for dynamically added fields too!
function addNewField() {
  const input = document.createElement('input');
  input.name = `field${Date.now()}`;
  formElement.appendChild(input);
  // Automatically handled by delegated listener
}
```

 

### Pattern 3: Conditional Validation Triggers

```javascript
const form = Forms.create(
  {
    email: '',
    confirmEmail: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    confirmEmail: (value, allValues) =>
      value !== allValues.email ? 'Emails must match' : ''
  }
);

emailInput.addEventListener('input', (e) => {
  form.handleChange(e);

  // Also revalidate confirmEmail when email changes
  if (form.touched.confirmEmail) {
    form.validateField('confirmEmail');
  }
});

confirmEmailInput.addEventListener('input', form.handleChange);
```

 

### Pattern 4: Debounced Updates

```javascript
const form = Forms.create({
  search: ''
});

let debounceTimeout;

searchInput.addEventListener('input', (e) => {
  // Update form immediately for responsive UI
  form.handleChange(e);

  // Debounce expensive operations
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    performSearch(form.values.search);
  }, 500);
});
```

 

### Pattern 5: Custom Value Transformation

```javascript
const form = Forms.create({
  phone: '',
  price: 0,
  username: ''
});

phoneInput.addEventListener('input', (e) => {
  // Transform value before updating
  const formatted = formatPhoneNumber(e.target.value);
  e.target.value = formatted;
  form.handleChange(e);
});

priceInput.addEventListener('input', (e) => {
  // Convert to number
  const numValue = parseFloat(e.target.value) || 0;
  form.setValue('price', numValue);
});

usernameInput.addEventListener('input', (e) => {
  // Lowercase transformation
  e.target.value = e.target.value.toLowerCase();
  form.handleChange(e);
});

function formatPhoneNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return value;
}
```

 

### Pattern 6: Auto-Save on Change

```javascript
const form = Forms.create({
  title: '',
  content: '',
  status: 'draft'
});

let saveTimeout;

// Bind with auto-save
[titleInput, contentInput, statusSelect].forEach(input => {
  input.addEventListener('input', (e) => {
    form.handleChange(e);

    // Auto-save after 2 seconds of inactivity
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await saveToServer(form.values);
      showNotification('Draft saved');
    }, 2000);
  });
});
```

 

### Pattern 7: Multi-Checkbox Groups

```javascript
const form = Forms.create({
  interests: []
});

// Handle checkbox groups
checkboxGroup.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox' && e.target.name === 'interests') {
    const value = e.target.value;
    const currentInterests = form.values.interests || [];

    if (e.target.checked) {
      form.setValue('interests', [...currentInterests, value]);
    } else {
      form.setValue('interests', currentInterests.filter(i => i !== value));
    }
  }
});

// HTML:
// <input type="checkbox" name="interests" value="sports" />
// <input type="checkbox" name="interests" value="music" />
// <input type="checkbox" name="interests" value="art" />
```

 

### Pattern 8: File Input Handling

```javascript
const form = Forms.create({
  avatar: null,
  documents: []
});

avatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  form.setValue('avatar', file);

  // Show preview
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

documentsInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  form.setValue('documents', files);

  // Show file list
  updateFileList(files);
});
```

 

### Pattern 9: Masked Input

```javascript
const form = Forms.create({
  creditCard: '',
  ssn: ''
});

creditCardInput.addEventListener('input', (e) => {
  // Apply credit card mask
  let value = e.target.value.replace(/\D/g, '');
  value = value.substring(0, 16);

  const parts = [];
  for (let i = 0; i < value.length; i += 4) {
    parts.push(value.substring(i, i + 4));
  }

  e.target.value = parts.join(' ');

  // Store unmasked value in form
  form.setValue('creditCard', value);
});

ssnInput.addEventListener('input', (e) => {
  // Apply SSN mask: XXX-XX-XXXX
  let value = e.target.value.replace(/\D/g, '');
  value = value.substring(0, 9);

  if (value.length > 5) {
    e.target.value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
  } else if (value.length > 3) {
    e.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    e.target.value = value;
  }

  form.setValue('ssn', value);
});
```

 

### Pattern 10: Composite Fields

```javascript
const form = Forms.create({
  fullName: '',
  dateOfBirth: null
});

// Split full name input
firstNameInput.addEventListener('input', (e) => {
  const lastName = lastNameInput.value;
  const fullName = `${e.target.value} ${lastName}`.trim();
  form.setValue('fullName', fullName);
});

lastNameInput.addEventListener('input', (e) => {
  const firstName = firstNameInput.value;
  const fullName = `${firstName} ${e.target.value}`.trim();
  form.setValue('fullName', fullName);
});

// Composite date picker
daySelect.addEventListener('change', updateDate);
monthSelect.addEventListener('change', updateDate);
yearSelect.addEventListener('change', updateDate);

function updateDate() {
  const day = daySelect.value;
  const month = monthSelect.value;
  const year = yearSelect.value;

  if (day && month && year) {
    const date = new Date(year, month - 1, day);
    form.setValue('dateOfBirth', date);
  }
}
```

 

## Common Pitfalls

### Pitfall 1: Missing name Attribute

```javascript
const form = Forms.create({ email: '' });

// ❌ Input missing name attribute
<input type="email" />
emailInput.addEventListener('input', form.handleChange);
// Won't work - handleChange doesn't know which field to update

// ✅ Include name attribute matching form field
<input name="email" type="email" />
emailInput.addEventListener('input', form.handleChange);
```

 

### Pitfall 2: Name Mismatch

```javascript
const form = Forms.create({
  emailAddress: '',
  userPassword: ''
});

// ❌ Name doesn't match form field
<input name="email" /> <!-- Should be "emailAddress" -->
<input name="password" /> <!-- Should be "userPassword" -->

// ✅ Match exact field names
<input name="emailAddress" />
<input name="userPassword" />
```

 

### Pitfall 3: Using on Wrong Event Type

```javascript
const form = Forms.create({ email: '' });

// ❌ Using 'click' event - doesn't have value
emailInput.addEventListener('click', form.handleChange);

// ✅ Use 'input' or 'change' events
emailInput.addEventListener('input', form.handleChange); // Real-time
emailInput.addEventListener('change', form.handleChange); // On blur
```

 

### Pitfall 4: Binding to Non-Input Elements

```javascript
const form = Forms.create({ message: '' });

// ❌ Binding to a div - no name or value
<div onclick="form.handleChange(event)">Click me</div>

// ✅ Bind to actual input elements
<input name="message" oninput="form.handleChange(event)" />
```

 

### Pitfall 5: Forgetting Event Parameter

```javascript
const form = Forms.create({ email: '' });

// ❌ Manually calling without event
emailInput.addEventListener('input', () => {
  form.handleChange(); // Missing event!
});

// ✅ Pass the event
emailInput.addEventListener('input', (e) => {
  form.handleChange(e);
});

// ✅ Or use direct binding
emailInput.addEventListener('input', form.handleChange);
```

 

## Summary

### Key Takeaways

1. **`handleChange()` automates input binding** - reads `name` and `value` from events.

2. **Convention-based** - matches `event.target.name` to form fields.

3. **Handles all input types** - text, checkbox, select, textarea automatically.

4. **Marks fields as touched** - sets `touched[field] = true` on change.

5. **Triggers validation** - runs validators automatically when value changes.

6. **Reduces boilerplate** - one function handles all inputs.

### When to Use handleChange()

✅ **Use handleChange() for:**
- Binding HTML inputs to form state
- Standard input handling
- Reducing event handler boilerplate
- Convention-based form binding
- When input `name` matches form field

❌ **Don't use handleChange() when:**
- Input name doesn't match form field
- Need custom value transformation before setting
- Handling non-standard events
- Need complex logic before updating

### Comparison: Manual vs handleChange()

| Aspect | Manual | handleChange() |
|  --|  --|     -|
| **Code** | Custom handler per field | One function for all |
| **Boilerplate** | High (3+ lines each) | Low (1 line each) |
| **Error-prone** | Easy to mistype names | Name comes from HTML |
| **Maintenance** | Update handler + HTML | Update HTML only |
| **Flexibility** | Full control | Convention-based |
| **Touch tracking** | Manual | Automatic |
| **Validation** | Manual | Automatic |

### Related Methods

- **`handleBlur(event)`** - Handle blur events for touched state
- **`getFieldProps(field)`** - Get all props (value, onChange, onBlur) at once
- **`setValue(field, value)`** - Manual value updates

### One-Line Rule

> **`form.handleChange(event)` automatically updates form state by reading the field name from `event.target.name` and value from `event.target.value`, eliminating boilerplate input binding code.**

 

**What's Next?**

- Learn `handleBlur()` for touch state management
- Explore `getFieldProps()` for complete field binding
- Master form binding patterns
