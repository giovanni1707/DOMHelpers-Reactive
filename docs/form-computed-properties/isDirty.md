# form.isDirty

Computed property for form dirty state (read-only)

## Quick Start (30 seconds)

```javascript
const form = ReactiveUtils.form({
  name: '',
  email: ''
});

// Initially pristine (no fields touched)
console.log(form.isDirty);  // false

// Mark a field as touched
form.touched.name = true;
console.log(form.isDirty);  // true (has touched fields)

// Or use helper to set value + mark as touched
form.setValue('email', 'alice@example.com');
console.log(form.isDirty);  // true

// Reset clears touched state
form.reset();
console.log(form.isDirty);  // false (pristine again)

// Use in effects
effect(() => {
  if (form.isDirty) {
    console.log('Form has unsaved changes');
  }
});
```

**Key insight:** `form.isDirty` is a read-only computed property that returns `true` when any field has been touched (user has interacted with the form), and `false` when the form is pristine. It's computed from `form.touched`.

 

## Why Does This Exist?

### The Problem with Manual Dirty State Tracking

```javascript
// Plain JavaScript - manual dirty tracking
const formData = { name: '', email: '' };
const touched = {};
let isDirty = false;

function markAsTouched(field) {
  touched[field] = true;
  // Must manually update isDirty
  isDirty = Object.keys(touched).length > 0;
  updateWarnings();  // Update UI manually
}

function updateWarnings() {
  if (isDirty) {
    window.onbeforeunload = () => 'Unsaved changes';
  } else {
    window.onbeforeunload = null;
  }
}

// Must remember to call markAsTouched
document.getElementById('name').addEventListener('input', (e) => {
  formData.name = e.target.value;
  markAsTouched('name');  // Easy to forget!
});
```

**Problems:**
- ❌ Manual dirty state calculation
- ❌ Must update UI manually
- ❌ Easy to forget to track touches
- ❌ State and UI can get out of sync
- ❌ Lots of boilerplate code

### The Solution: form.isDirty

```javascript
const form = ReactiveUtils.form({
  name: '',
  email: ''
});

// Automatic dirty state tracking
effect(() => {
  if (form.isDirty) {
    window.onbeforeunload = () => 'Unsaved changes';
  } else {
    window.onbeforeunload = null;
  }
});

// Just use $setValue - isDirty updates automatically
document.getElementById('name').addEventListener('input', (e) => {
  formsetValue('name', e.target.value);
  // isDirty automatically becomes true
});
```

**Benefits:**
- ✅ Automatic dirty state computation
- ✅ Always in sync with touched fields
- ✅ Automatic UI updates
- ✅ Single source of truth
- ✅ Zero boilerplate

 

## Mental Model

Think of `form.isDirty` like a **"Has Been Used" sticker**:

```
┌────────────────────────────────────────┐
│       "HAS BEEN USED" ANALOGY          │
├────────────────────────────────────────┤
│                                        │
│  Pristine Form (isDirty = false):      │
│  ┌──────────────────────────┐          │
│  │ Name:     [          ]   │          │
│  │ Email:    [          ]   │          │
│  │ Password: [          ]   │          │
│  └──────────────────────────┘          │
│  ✨ Fresh, untouched                   │
│  touched = {}                          │
│                                        │
│  User Touches Name (isDirty = true):   │
│  ┌──────────────────────────┐          │
│  │ Name:     [Alice     ] 👆│          │
│  │ Email:    [          ]   │          │
│  │ Password: [          ]   │          │
│  └──────────────────────────┘          │
│  🏷️ "HAS BEEN USED" sticker appears    │
│  touched = { name: true }              │
│                                        │
│  User Also Touches Email:              │
│  ┌──────────────────────────┐          │
│  │ Name:     [Alice     ] 👆│          │
│  │ Email:    [alice@... ] 👆│          │
│  │ Password: [          ]   │          │
│  └──────────────────────────┘          │
│  🏷️ Still has "HAS BEEN USED" sticker  │
│  touched = { name: true, email: true } │
│                                        │
│  Once touched, sticker stays until     │
│  form is reset                         │
│                                        │
└────────────────────────────────────────┘
```

**Key principles:**
1. **Read-only** - Never set isDirty directly
2. **Computed** - Automatically calculated from touched
3. **One-way toggle** - Once dirty, stays dirty until reset
4. **User interaction** - Reflects whether user has touched the form

 

## How It Works

### 1. Computation Logic

```javascript
// Under the hood (simplified):
addComputed(state, 'isDirty', function() {
  // Dirty if touched object has any keys
  return Object.keys(this.touched).length > 0;
});
```

### 2. Automatic Updates

```javascript
const form = ReactiveUtils.form({
  name: '',
  email: ''
});

// Initially pristine
console.log(form.touched);   // {}
console.log(form.isDirty);   // false

// Touch first field
form.touched.name = true;
console.log(form.touched);   // { name: true }
console.log(form.isDirty);   // true (computed automatically)

// Touch second field
form.touched.email = true;
console.log(form.touched);   // { name: true, email: true }
console.log(form.isDirty);   // true (still dirty)

// Reset clears touched
formreset();
console.log(form.touched);   // {}
console.log(form.isDirty);   // false (pristine again)
```

### 3. Using $setValue

```javascript
const form = ReactiveUtils.form({ email: '' });

// setValue marks as touched AND sets value
formsetValue('email', 'alice@example.com');

console.log(form.values.email);  // "alice@example.com"
console.log(form.touched.email); // true
console.log(form.isDirty);       // true (automatically)
```

### 4. Multiple Fields

```javascript
const form = ReactiveUtils.form({
  field1: '',
  field2: '',
  field3: ''
});

// Touch just one field
form.touched.field1 = true;
console.log(form.isDirty);  // true

// Even one touched field makes form dirty
```

 

## Examples

### Example 1: Warn on Page Leave

```javascript
const form = ReactiveUtils.form({
  content: ''
});

// Warn if user tries to leave with unsaved changes
effect(() => {
  if (form.isDirty) {
    window.onbeforeunload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Leave anyway?';
    };
  } else {
    window.onbeforeunload = null;
  }
});

// User types something
formsetValue('content', 'Hello');
// Now leaving triggers warning
```

### Example 2: Show "Unsaved Changes" Indicator

```javascript
const form = ReactiveUtils.form({
  title: '',
  content: ''
});

effect(() => {
  const indicator = document.getElementById('unsaved-indicator');

  if (form.isDirty) {
    indicator.textContent = '● Unsaved changes';
    indicator.style.display = 'inline';
  } else {
    indicator.style.display = 'none';
  }
});
```

### Example 3: Enable Save Button When Dirty

```javascript
const form = ReactiveUtils.form({ data: '' });

effect(() => {
  const saveBtn = document.getElementById('save');
  saveBtn.disabled = !form.isDirty;
  // Only enable save if user made changes
});
```

### Example 4: Track Form Interaction

```javascript
const form = ReactiveUtils.form({
  email: '',
  password: ''
});

effect(() => {
  if (form.isDirty) {
    console.log('User has started filling out the form');
    // Send analytics event
  }
});
```

### Example 5: Reset After Save

```javascript
const form = ReactiveUtils.form({ note: '' });

async function handleSave() {
  if (!form.isDirty) {
    console.log('No changes to save');
    return;
  }

  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  // Reset makes form pristine again
  formreset();
  console.log(form.isDirty);  // false
}
```

### Example 6: Dirty State Badge

```javascript
const form = ReactiveUtils.form({ message: '' });

effect(() => {
  const badge = document.getElementById('status-badge');

  if (form.isDirty) {
    badge.textContent = 'Modified';
    badge.className = 'badge badge-warning';
  } else {
    badge.textContent = 'Saved';
    badge.className = 'badge badge-success';
  }
});
```

### Example 7: Disable Navigation When Dirty

```javascript
const form = ReactiveUtils.form({ content: '' });

effect(() => {
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    link.onclick = (e) => {
      if (form.isDirty) {
        const confirm = window.confirm('Discard unsaved changes?');
        if (!confirm) {
          e.preventDefault();
        }
      }
    };
  });
});
```

### Example 8: Show Dirty Field Count

```javascript
const form = ReactiveUtils.form({
  field1: '',
  field2: '',
  field3: ''
});

effect(() => {
  const dirtyCount = Object.keys(form.touched).length;
  const display = document.getElementById('dirty-count');

  if (form.isDirty) {
    display.textContent = `${dirtyCount} field(s) modified`;
  } else {
    display.textContent = 'No changes';
  }
});
```

### Example 9: Auto-Save When Dirty

```javascript
const form = ReactiveUtils.form({ content: '' });

let autoSaveTimer;

effect(() => {
  if (form.isDirty) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(async () => {
      await fetch('/api/autosave', {
        method: 'POST',
        body: JSON.stringify(form.values)
      });
      console.log('Auto-saved');
    }, 2000);
  }
});
```

### Example 10: Combine with isValid

```javascript
const form = ReactiveUtils.form({
  email: '',
  password: ''
});

effect(() => {
  const submitBtn = document.getElementById('submit');

  // Enable only if dirty AND valid
  submitBtn.disabled = !form.isDirty || !form.isValid;

  if (form.isDirty && form.isValid) {
    submitBtn.textContent = 'Save Changes';
  } else if (!form.isDirty) {
    submitBtn.textContent = 'No Changes';
  } else {
    submitBtn.textContent = 'Fix Errors';
  }
});
```

### Example 11: Form State Indicator

```javascript
const form = ReactiveUtils.form({ data: '' });

effect(() => {
  const state = document.getElementById('form-state');

  if (!form.isDirty) {
    state.textContent = '✓ Saved';
    state.className = 'state-saved';
  } else if (form.isDirty && form.isValid) {
    state.textContent = '● Unsaved';
    state.className = 'state-dirty';
  } else {
    state.textContent = '✗ Errors';
    state.className = 'state-error';
  }
});
```

### Example 12: Prompt Before Discard

```javascript
const form = ReactiveUtils.form({ content: '' });

function handleDiscard() {
  if (form.isDirty) {
    const confirm = window.confirm('Discard unsaved changes?');
    if (!confirm) return;
  }

  formreset();
  console.log('Changes discarded');
}
```

### Example 13: Track Time Since Last Change

```javascript
const form = ReactiveUtils.form({ note: '' });

let lastChangeTime;

effect(() => {
  if (form.isDirty) {
    lastChangeTime = Date.now();
  }
});

setInterval(() => {
  if (form.isDirty && lastChangeTime) {
    const elapsed = Math.floor((Date.now() - lastChangeTime) / 1000);
    document.getElementById('time-since').textContent =
      `Last change: ${elapsed}s ago`;
  }
}, 1000);
```

### Example 14: Multi-Form Dirty State

```javascript
const form1 = ReactiveUtils.form({ data1: '' });
const form2 = ReactiveUtils.form({ data2: '' });

effect(() => {
  const anyDirty = form1.isDirty || form2.isDirty;

  if (anyDirty) {
    console.log('At least one form has changes');
  }
});
```

### Example 15: Reset Confirmation

```javascript
const form = ReactiveUtils.form({
  name: '',
  email: ''
});

function handleReset() {
  if (form.isDirty) {
    const confirm = window.confirm('Reset form and lose changes?');
    if (!confirm) return;
  }

  formreset();
  console.log(form.isDirty);  // false
}
```

 

## Common Pitfalls

### ❌ Pitfall 1: Trying to Set isDirty Directly

```javascript
const form = ReactiveUtils.form({ name: '' });

// Wrong - isDirty is read-only (computed property)
form.isDirty = true;  // Has no effect or will error
```

**✅ Solution:**
```javascript
// Set touched fields instead - isDirty updates automatically
form.touched.name = true;  // isDirty becomes true
```

### ❌ Pitfall 2: Assuming isDirty Means Values Changed

```javascript
const form = ReactiveUtils.form({ email: '' });

// User focuses on field but doesn't type anything
formsetValue('email', '');  // Same value, but marks as touched

console.log(form.isDirty);  // true (field was touched)
console.log(form.values.email);  // "" (value didn't change)
```

**✅ Understanding:**
```javascript
// isDirty means "user interacted", NOT "values changed"
// If you need to track actual value changes, compare with initial state
const initialValues = { email: '' };
const form = ReactiveUtils.form({ ...initialValues });

effect(() => {
  const hasChanges = JSON.stringify(form.values) !== JSON.stringify(initialValues);
  console.log('Has actual changes:', hasChanges);
});
```

### ❌ Pitfall 3: Forgetting isDirty Persists Until Reset

```javascript
const form = ReactiveUtils.form({ name: '' });

formsetValue('name', 'Alice');
console.log(form.isDirty);  // true

// User clears the field back to original value
form.values.name = '';
console.log(form.isDirty);  // Still true! (touched persists)
```

**✅ Solution:**
```javascript
// Use $reset to clear dirty state
formreset();
console.log(form.isDirty);  // false (pristine again)
```

### ❌ Pitfall 4: Not Clearing Dirty State After Save

```javascript
const form = ReactiveUtils.form({ data: '' });

async function handleSave() {
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  // Wrong - forgot to reset
  // Form still appears dirty
}

console.log(form.isDirty);  // Still true after save
```

**✅ Solution:**
```javascript
async function handleSave() {
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  // Reset to clear dirty state
  formreset();
  console.log(form.isDirty);  // false
}
```

### ❌ Pitfall 5: Confusing isDirty with isValid

```javascript
const form = ReactiveUtils.form({ email: '' });

// Wrong - these are different concepts
if (form.isDirty) {
  console.log('Form is valid');  // NO! Dirty ≠ Valid
}
```

**✅ Solution:**
```javascript
// isDirty = user has touched fields
// isValid = form has no errors
// They are independent!

console.log('Dirty:', form.isDirty);   // Has user interacted?
console.log('Valid:', form.isValid);   // Are there errors?

// You might want both:
if (form.isDirty && form.isValid) {
  console.log('User made valid changes');
}
```

 

## Common Patterns

### Pattern 1: Warn Before Leave

```javascript
effect(() => {
  if (form.isDirty) {
    window.onbeforeunload = () => 'Unsaved changes';
  } else {
    window.onbeforeunload = null;
  }
});
```

### Pattern 2: Enable Save Only When Dirty

```javascript
effect(() => {
  document.getElementById('save').disabled = !form.isDirty;
});
```

### Pattern 3: Show Unsaved Indicator

```javascript
effect(() => {
  const indicator = document.getElementById('unsaved');
  indicator.style.display = form.isDirty ? 'block' : 'none';
});
```

### Pattern 4: Reset After Successful Save

```javascript
async function handleSave() {
  if (!form.isDirty) return;

  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(form.values)
  });

  formreset();  // Clear dirty state
}
```

### Pattern 5: Combine with isValid

```javascript
effect(() => {
  const btn = document.getElementById('submit');
  btn.disabled = !form.isDirty || !form.isValid;
});
```

### Pattern 6: Confirm Before Reset

```javascript
function handleReset() {
  if (form.isDirty) {
    const ok = confirm('Discard changes?');
    if (!ok) return;
  }
  formreset();
}
```

### Pattern 7: Track User Engagement

```javascript
effect(() => {
  if (form.isDirty) {
    console.log('Analytics: User engaged with form');
  }
});
```

 

## Summary

### Key Takeaways

1. **Read-Only**: `form.isDirty` is a computed property - never set it directly
2. **Automatic**: Updates automatically when `form.touched` changes
3. **Computed Logic**: Returns `true` when any field has been touched
4. **One-Way**: Once dirty, stays dirty until form is reset
5. **User Interaction**: Tracks whether user has interacted with form, not whether values changed

### When to Use form.isDirty

✅ **Use when you want:**
- Warn users before leaving page with unsaved changes
- Enable/disable save buttons based on interaction
- Show "unsaved changes" indicators
- Track user engagement with forms
- Prevent accidental data loss

❌ **Avoid when:**
- You need to track actual value changes (compare values instead)
- You want per-field dirty state (use `form.touched` directly)

### Quick Reference

```javascript
// Create form
const form = ReactiveUtils.form({
  name: '',
  email: ''
});

// isDirty is computed from touched
console.log(form.isDirty);  // false (initially)

// Mark field as touched
form.touched.name = true;
console.log(form.isDirty);  // true

// Or use helper
formsetValue('email', 'alice@example.com');
console.log(form.isDirty);  // true

// Reset clears dirty state
formreset();
console.log(form.isDirty);  // false

// Use in effects
effect(() => {
  if (form.isDirty) {
    window.onbeforeunload = () => 'Unsaved changes';
  } else {
    window.onbeforeunload = null;
  }
});
```

**Remember:** `form.isDirty` tracks user interaction (touched fields), not actual value changes. Reset the form to clear the dirty state!
