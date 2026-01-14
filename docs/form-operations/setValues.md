# form.setValues()

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  username: '',
  email: '',
  age: 0,
  bio: ''
});

// Update multiple fields at once
form.setValues({
  username: 'alice',
  email: 'alice@example.com',
  age: 25,
  bio: 'Software developer'
});

console.log(form.values);
// {
//   username: 'alice',
//   email: 'alice@example.com',
//   age: 25,
//   bio: 'Software developer'
// }

console.log(form.touched);
// { username: true, email: true, age: true, bio: true }
```

**What just happened?** `setValues()` updated multiple fields in one call - perfect for loading data or batch updates!

 

## What is form.setValues()?

`form.setValues()` is the **batch update method** for updating multiple form field values at once.

Simply put, it's like calling `setValue()` multiple times, but more efficient and cleaner.

**Key characteristics:**
- ✅ Updates multiple fields in one operation
- ✅ Marks all updated fields as touched
- ✅ Triggers validation once (not per field)
- ✅ More performant than multiple setValue() calls
- ✅ Returns the form instance for chaining

 

## Syntax

```javascript
// Basic usage
form.setValues(valuesObject)

// Update subset of fields
form.setValues({
  field1: 'value1',
  field2: 'value2'
})

// With chaining
form
  .setValues({ field1: 'value1', field2: 'value2' })
  .setValues({ field3: 'value3' });
```

**Parameters:**
- `valuesObject` (object) - An object containing field-value pairs to update

**Returns:** The form instance (`this`) for method chaining

 

## Why Does This Exist?

### The Challenge with Multiple Updates

When you need to update several fields at once, calling `setValue()` repeatedly is inefficient.

```javascript
// ❌ Inefficient - multiple validation cycles
form.setValue('username', 'alice');
form.setValue('email', 'alice@example.com');
form.setValue('age', 25);
form.setValue('bio', 'Developer');
// Validation runs 4 times!
// Effects fire 4 times!

// ✅ Efficient - single validation cycle
form.setValues({
  username: 'alice',
  email: 'alice@example.com',
  age: 25,
  bio: 'Developer'
});
// Validation runs once!
// Effects fire once!
```

**Benefits of setValues():**
✅ **Performance** - Single validation cycle instead of multiple
✅ **Cleaner code** - One call instead of many
✅ **Atomic updates** - All fields update together
✅ **Better UX** - UI updates once instead of flickering
✅ **Less verbose** - Especially for many fields

 

## Mental Model

Think of `setValues()` as **batch processing** for form updates.

### Individual Updates (setValue)
```
Update field1 → Validate → Update UI
Update field2 → Validate → Update UI
Update field3 → Validate → Update UI
Update field4 → Validate → Update UI

Total: 4 validation cycles, 4 UI updates
```

### Batch Update (setValues)
```
Update field1 ┐
Update field2 ├─→ Validate once → Update UI once
Update field3 │
Update field4 ┘

Total: 1 validation cycle, 1 UI update
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
form.setValues({
  username: 'alice',
  email: 'alice@example.com'
});

// Here's what happens internally:
1️⃣ Loop through provided values
   for (const [field, value] of Object.entries(values)) {
     form.values[field] = value
     form.touched[field] = true
   }

2️⃣ Trigger validation once for all fields
   Object.keys(values).forEach(field => {
     if (validators[field]) {
       form.errors[field] = validators[field](form.values[field], form.values)
     }
   })

3️⃣ Reactive effects fire once (not per field)
   - form.isValid recalculates once
   - form.isDirty recalculates once
   - form.errorFields updates once
   - All UI updates happen in one batch

4️⃣ Return form instance for chaining
   return this
```

### Reactivity Flow Diagram

```
setValues({ username: 'alice', email: 'alice@...' })
         ↓
    [Batch Update]
         ↓
    Update all values ──→ Mark all as touched
         ↓
    Validate all fields (once)
         ↓
    Update all computed properties
         ↓
    Fire all reactive effects (once)
         ↓
    Return form (for chaining)
```

 

## Basic Usage

### Example 1: Load Form Data

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

// Load data from API
async function loadUserProfile(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const userData = await response.json();

  // Populate form with all data at once
  form.setValues(userData);
  // {
  //   firstName: 'Alice',
  //   lastName: 'Johnson',
  //   email: 'alice@example.com',
  //   phone: '555-0123'
  // }
}

loadUserProfile(123);
```

 

### Example 2: Partial Updates

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: ''
});

// Update only some fields
form.setValues({
  field1: 'value1',
  field3: 'value3'
});

console.log(form.values);
// {
//   field1: 'value1',
//   field2: '',         // Unchanged
//   field3: 'value3',
//   field4: ''          // Unchanged
// }

console.log(form.touched);
// {
//   field1: true,
//   field3: true
//   // field2 and field4 remain untouched
// }
```

 

### Example 3: Reset to Defaults

```javascript
const form = Forms.create({
  username: '',
  email: '',
  preferences: {
    theme: 'light',
    notifications: true
  }
});

// User makes changes
form.setValues({
  username: 'alice',
  email: 'alice@example.com',
  preferences: { theme: 'dark', notifications: false }
});

// Reset to defaults
const defaults = {
  username: '',
  email: '',
  preferences: {
    theme: 'light',
    notifications: true
  }
};

resetButton.addEventListener('click', () => {
  form.setValues(defaults);
});
```

 

### Example 4: Form Prefill from URL Params

```javascript
const form = Forms.create({
  search: '',
  category: '',
  minPrice: 0,
  maxPrice: 1000
});

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Prefill form
form.setValues({
  search: urlParams.get('search') || '',
  category: urlParams.get('category') || '',
  minPrice: parseInt(urlParams.get('minPrice')) || 0,
  maxPrice: parseInt(urlParams.get('maxPrice')) || 1000
});

// URL: ?search=laptop&category=electronics&minPrice=500
// Form is now prefilled with these values
```

 

### Example 5: Clone Form State

```javascript
const form1 = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

form1.setValues({
  field1: 'value1',
  field2: 'value2',
  field3: 'value3'
});

// Create another form with same values
const form2 = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Clone the state
form2.setValues(form1.values);

console.log(form2.values); // Same as form1.values
```

 

## Advanced Patterns

### Pattern 1: Load with Transformation

```javascript
const form = Forms.create({
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  emailDomain: ''
});

async function loadAndTransformData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();

  // Transform data before setting
  form.setValues({
    firstName: data.first_name,      // snake_case → camelCase
    lastName: data.last_name,
    fullName: `${data.first_name} ${data.last_name}`,
    email: data.email.toLowerCase(),
    emailDomain: data.email.split('@')[1]
  });
}
```

 

### Pattern 2: Merge with Existing Values

```javascript
const form = Forms.create({
  profile: {
    name: '',
    age: 0
  },
  settings: {
    theme: 'light',
    notifications: true
  }
});

// Initial values
form.setValues({
  profile: { name: 'Alice', age: 25 },
  settings: { theme: 'dark', notifications: true }
});

// Later: merge new values (keep existing)
function updateFormPartial(updates) {
  form.setValues({
    ...form.values,
    ...updates
  });
}

updateFormPartial({
  profile: { name: 'Alice Johnson', age: 26 }
});
// settings remain unchanged
```

 

### Pattern 3: Auto-save Draft

```javascript
const form = Forms.create({
  title: '',
  content: '',
  tags: []
});

let saveTimeout;

// Watch for changes and auto-save
effect(() => {
  const currentValues = { ...form.values };

  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    localStorage.setItem('draft', JSON.stringify(currentValues));
    console.log('Draft saved');
  }, 1000);
});

// Load draft on page load
const savedDraft = localStorage.getItem('draft');
if (savedDraft) {
  form.setValues(JSON.parse(savedDraft));
}
```

 

### Pattern 4: Multi-Step Form Navigation

```javascript
const form = Forms.create({
  // Step 1
  firstName: '',
  lastName: '',

  // Step 2
  email: '',
  phone: '',

  // Step 3
  address: '',
  city: ''
});

const stepData = {
  1: { firstName: '', lastName: '' },
  2: { email: '', phone: '' },
  3: { address: '', city: '' }
};

let currentStep = 1;

function goToStep(stepNumber) {
  // Save current step data
  stepData[currentStep] = {
    ...stepData[currentStep],
    ...getCurrentStepValues()
  };

  // Load new step data
  currentStep = stepNumber;
  form.setValues(stepData[currentStep]);
}

function getCurrentStepValues() {
  const fields = Object.keys(stepData[currentStep]);
  const values = {};
  fields.forEach(field => {
    values[field] = form.values[field];
  });
  return values;
}
```

 

### Pattern 5: Conditional Default Values

```javascript
const form = Forms.create({
  accountType: '',
  companyName: '',
  taxId: '',
  personalId: ''
});

function setAccountType(type) {
  const defaults = {
    business: {
      accountType: 'business',
      companyName: '',
      taxId: '',
      personalId: '' // Clear personal fields
    },
    personal: {
      accountType: 'personal',
      companyName: '', // Clear business fields
      taxId: '',
      personalId: ''
    }
  };

  form.setValues(defaults[type]);
}

accountTypeSelect.addEventListener('change', (e) => {
  setAccountType(e.target.value);
});
```

 

### Pattern 6: Bulk Data Import

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: ''
});

// Import from CSV
function importFromCSV(csvString) {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',');
  const values = lines[1].split(',');

  const data = {};
  headers.forEach((header, index) => {
    data[header.trim()] = values[index].trim();
  });

  form.setValues(data);
}

// Import from JSON
function importFromJSON(jsonString) {
  const data = JSON.parse(jsonString);
  form.setValues(data);
}

// Import from URL
async function importFromURL(url) {
  const response = await fetch(url);
  const data = await response.json();
  form.setValues(data);
}
```

 

### Pattern 7: Template System

```javascript
const form = Forms.create({
  subject: '',
  body: '',
  recipients: '',
  cc: ''
});

const templates = {
  welcome: {
    subject: 'Welcome to Our Service',
    body: 'Thank you for joining us!',
    recipients: '',
    cc: 'support@company.com'
  },
  reminder: {
    subject: 'Reminder: Action Required',
    body: 'This is a friendly reminder...',
    recipients: '',
    cc: ''
  },
  newsletter: {
    subject: 'Monthly Newsletter',
    body: 'Here are this month\'s updates...',
    recipients: '',
    cc: 'marketing@company.com'
  }
};

function loadTemplate(templateName) {
  form.setValues(templates[templateName]);
}

templateSelect.addEventListener('change', (e) => {
  loadTemplate(e.target.value);
});
```

 

### Pattern 8: Form Versioning

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

const versions = [];
let currentVersion = -1;

function saveVersion() {
  // Remove future versions if we're not at the end
  versions.splice(currentVersion + 1);

  // Save current state
  versions.push({ ...form.values });
  currentVersion++;
}

function restoreVersion(index) {
  if (index >= 0 && index < versions.length) {
    currentVersion = index;
    form.setValues(versions[index]);
  }
}

function goToPreviousVersion() {
  restoreVersion(currentVersion - 1);
}

function goToNextVersion() {
  restoreVersion(currentVersion + 1);
}

// Auto-save version on significant changes
let changeCount = 0;
effect(() => {
  // Track changes
  JSON.stringify(form.values);

  changeCount++;
  if (changeCount % 10 === 0) {
    saveVersion();
  }
});
```

 

### Pattern 9: A/B Testing Prefills

```javascript
const form = Forms.create({
  name: '',
  email: '',
  message: ''
});

// A/B test different default messages
const variants = {
  A: {
    name: '',
    email: '',
    message: 'I would like to learn more about...'
  },
  B: {
    name: '',
    email: '',
    message: 'I am interested in...'
  },
  C: {
    name: '',
    email: '',
    message: '' // No prefill
  }
};

// Randomly assign variant
const variant = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];

// Track variant
analytics.track('form_variant', { variant });

// Load variant defaults
form.setValues(variants[variant]);
```

 

### Pattern 10: Server-Sync State

```javascript
const form = Forms.create({
  title: '',
  content: '',
  tags: []
});

let serverState = null;

// Load from server
async function loadFromServer(documentId) {
  const response = await fetch(`/api/documents/${documentId}`);
  const data = await response.json();

  serverState = data;
  form.setValues(data);
}

// Check if form differs from server
function hasUnsavedChanges() {
  return JSON.stringify(form.values) !== JSON.stringify(serverState);
}

// Sync with server
async function syncWithServer() {
  const response = await fetch('/api/documents/123', {
    method: 'PUT',
    body: JSON.stringify(form.values)
  });

  if (response.ok) {
    serverState = { ...form.values };
    console.log('Synced!');
  }
}

// Warn before leaving
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '';
  }
});
```

 

## Common Pitfalls

### Pitfall 1: Forgetting setValues() Updates All Fields

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

form.setValues({
  field1: 'value1',
  field2: 'value2',
  field3: 'value3'
});

// Later...
// ❌ This only updates field1, doesn't clear field2 and field3
form.setValues({
  field1: 'new value'
});

// ✅ Better - be explicit about what you want
form.setValues({
  field1: 'new value',
  field2: '', // Explicitly clear
  field3: ''  // Explicitly clear
});

// OR use setValue for single field
form.setValue('field1', 'new value');
```

 

### Pitfall 2: Mutating Objects Before Setting

```javascript
const form = Forms.create({
  settings: {
    theme: 'light',
    notifications: true
  }
});

const newSettings = form.values.settings;

// ❌ WRONG - Mutates the reactive object
newSettings.theme = 'dark';
form.setValues({ settings: newSettings });

// ✅ CORRECT - Create new object
const newSettings = { ...form.values.settings, theme: 'dark' };
form.setValues({ settings: newSettings });
```

 

### Pitfall 3: Not Handling Missing Fields

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// API returns incomplete data
const apiData = {
  field1: 'value1'
  // field2 and field3 missing
};

// ❌ This leaves field2 and field3 with old values
form.setValues(apiData);

// ✅ Better - provide defaults
form.setValues({
  field1: apiData.field1 || '',
  field2: apiData.field2 || '',
  field3: apiData.field3 || ''
});

// ✅ Or use spreading with defaults
const defaults = { field1: '', field2: '', field3: '' };
form.setValues({ ...defaults, ...apiData });
```

 

### Pitfall 4: Using setValues in Tight Loops

```javascript
const form = Forms.create({
  items: []
});

// ❌ Inefficient - updates form 1000 times
for (let i = 0; i < 1000; i++) {
  form.setValues({
    items: [...form.values.items, i]
  });
}

// ✅ Better - build array first, update once
const items = [];
for (let i = 0; i < 1000; i++) {
  items.push(i);
}
form.setValues({ items });
```

 

### Pitfall 5: Not Preserving Nested Objects

```javascript
const form = Forms.create({
  user: {
    name: 'Alice',
    settings: {
      theme: 'light',
      language: 'en'
    }
  }
});

// ❌ This replaces entire user object, losing settings
form.setValues({
  user: { name: 'Bob' }
});
console.log(form.values.user.settings); // undefined!

// ✅ Correct - preserve nested structure
form.setValues({
  user: {
    ...form.values.user,
    name: 'Bob'
  }
});
console.log(form.values.user.settings); // { theme: 'light', language: 'en' }
```

 

## Summary

### Key Takeaways

1. **`setValues()` updates multiple fields** in a single efficient operation.

2. **More performant than multiple setValue() calls** - validation runs once.

3. **Marks all updated fields as touched** - just like setValue().

4. **Perfect for loading data** from APIs, localStorage, or URL params.

5. **Supports partial updates** - only provide fields you want to change.

6. **Returns form instance** - enables method chaining.

### When to Use setValues()

✅ **Use setValues() when:**
- Loading form data from an API
- Resetting form to default values
- Updating multiple fields at once
- Importing data from external sources
- Switching between form templates
- Restoring saved/cached state

❌ **Don't use setValues() when:**
- Updating only one field (use `setValue()`)
- In tight loops (build data first, then setValues once)
- You need granular control over touch state per field

### One-Line Rule

> **`form.setValues(object)` is the batch update method - use it when you need to update multiple fields efficiently in a single operation.**

 

**What's Next?**

- Learn about `form.getValue()` for retrieving individual values
- Explore `form.resetForm()` for complete form resets
- Master data loading patterns with async/await
