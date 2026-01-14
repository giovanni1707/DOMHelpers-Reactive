# form.touchedFields

## Quick Start (30 seconds)

```javascript
const form = Forms.create({
  email: '',
  password: '',
  username: ''
});

console.log(form.touchedFields); // [] (no fields touched)

form.setValue('email', 'user@example.com');
console.log(form.touchedFields); // ['email']

form.setValue('password', 'secret123');
console.log(form.touchedFields); // ['email', 'password']

form.setValue('username', 'alice');
console.log(form.touchedFields); // ['email', 'password', 'username']
```

**What just happened?** `form.touchedFields` gives you an array of field names that the user has interacted with!

 

## What is form.touchedFields?

`form.touchedFields` is a **computed array property** that returns the names of all fields the user has touched.

Simply put, it converts `form.touched` object into an array of field names.

 

## Syntax

```javascript
// Get array of touched field names
const touched = form.touchedFields;

// Iterate over touched fields
form.touchedFields.forEach(field => {
  console.log(`${field} was touched`);
});

// Check count
console.log(`${form.touchedFields.length} fields touched`);
```

**Type:** `Array<string>` (read-only, computed)

**Computation:** `Object.keys(form.touched)`

 

## Why Does This Exist?

### Converting Object to Array

```javascript
// Without touchedFields (manual conversion)
const touchedArray = Object.keys(form.touched);

// With touchedFields (automatic)
const touchedArray = form.touchedFields;
```

**Benefits:**
✅ Cleaner code
✅ Array methods available (map, filter, forEach)
✅ Easy to count: `form.touchedFields.length`
✅ Reactive - updates automatically

 

## Basic Usage

### Example 1: Display Touched Count

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

effect(() => {
  const statusEl = document.getElementById('status');

  const total = Object.keys(form.values).length;
  const touched = form.touchedFields.length;

  statusEl.textContent = `Filled ${touched}/${total} fields`;
});
```

 

### Example 2: Iterate Touched Fields

```javascript
const form = Forms.create({
  name: '',
  email: '',
  phone: ''
});

form.setValue('name', 'Alice');
form.setValue('email', 'alice@example.com');

// Show which fields were touched
form.touchedFields.forEach(field => {
  console.log(`User filled: ${field}`);
});
// "User filled: name"
// "User filled: email"
```

 

### Example 3: Conditional Validation

```javascript
const form = Forms.create(
  { email: '', password: '' },
  { /* validators */ }
);

// Only validate touched fields
form.touchedFields.forEach(field => {
  form.validateField(field);
});
```

 

## Advanced Patterns

### Pattern 1: Progress Indicator

```javascript
const form = Forms.create({
  step1: '',
  step2: '',
  step3: '',
  step4: ''
});

effect(() => {
  const progressEl = document.getElementById('progress');

  const totalSteps = Object.keys(form.values).length;
  const completedSteps = form.touchedFields.length;
  const percentage = (completedSteps / totalSteps) * 100;

  progressEl.style.width = `${percentage}%`;
  progressEl.textContent = `${completedSteps}/${totalSteps}`;
});
```

 

### Pattern 2: Touched Fields Report

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

function getTouchedReport() {
  return {
    touchedCount: form.touchedFields.length,
    touchedFields: form.touchedFields,
    untouchedFields: Object.keys(form.values).filter(
      field => !form.touchedFields.includes(field)
    )
  };
}

form.setValue('field1', 'value');
form.setValue('field2', 'value');

console.log(getTouchedReport());
// {
//   touchedCount: 2,
//   touchedFields: ['field1', 'field2'],
//   untouchedFields: ['field3']
// }
```

 

## Summary

### Key Takeaways

1. **`form.touchedFields` is an array** of field names that have been touched.

2. **Computed from `form.touched`** - `Object.keys(form.touched)`.

3. **Use `.length` for count** - how many fields touched.

4. **Array methods available** - map, filter, forEach, etc.

5. **Reactive** - updates automatically when fields are touched.

### One-Line Rule

> **`form.touchedFields` converts the touched object to an array of field names - use it when you need to iterate or count touched fields.**

 

**What's Next?**

- Learn about `form.errorFields` for fields with errors
- Explore array manipulation patterns
- Master field iteration techniques
