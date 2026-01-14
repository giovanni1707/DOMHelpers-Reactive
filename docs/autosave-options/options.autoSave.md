# `options.autoSave` - Automatic Saving Configuration

## Quick Start (30 seconds)

```javascript
const userState = state({ name: 'Alice', email: 'alice@example.com' });

// With autoSave (default) - saves automatically on changes
autoSave(userState, 'user', {
  autoSave: true  // Default behavior
});

userState.name = 'Bob';  // Automatically saves ✨

// Without autoSave - manual control only
const manualState = state({ data: {} });
autoSave(manualState, 'data', {
  autoSave: false  // Disable automatic saving
});

manualState.data = { foo: 'bar' };  // Doesn't save
manualState.$save();  // Save manually when ready ✨
```

**What just happened?** You controlled whether changes automatically save or require manual saving!

  

## What is `options.autoSave`?

`options.autoSave` is a configuration option that **determines whether state changes automatically trigger saves to storage**.

Simply put: it's like choosing between auto-save in Google Docs (saves every change) vs manual save in traditional apps (save button required).

Think of it as **automatic vs manual transmission** for your data persistence.

  

## Syntax

```javascript
autoSave(state, key, {
  autoSave: boolean
})
```

**Value:**
- `true` - Automatically save on every state change
- `false` - Only save when manually triggered

**Default:** `true` (automatic saving enabled)

  

## Why Does This Exist?

### The Challenge: Not All Changes Should Save Immediately

Sometimes you want to batch changes or validate before saving:

```javascript
const formState = state({
  name: '',
  email: '',
  age: 0
});

// With autoSave enabled
autoSave(formState, 'form');

// User fills out form
formState.name = 'Alice';      // Saves immediately
formState.email = 'invalid';   // Saves invalid data! ❌
formState.age = -5;            // Saves invalid age! ❌

// Problems:
// - Invalid data saved to storage
// - No validation before save
// - Can't cancel changes
// - No transaction-like behavior
```

**What's the Real Issue?**

```
Every change saves immediately
        |
        v
Invalid data saved
        |
        v
Can't batch changes
        |
        v
No control ❌
```

**Problems:**
❌ **Invalid data saved** - No validation gate  
❌ **Can't batch changes** - Each change triggers save  
❌ **No undo option** - Changes persist immediately  
❌ **Performance overhead** - Too many save operations  

### The Solution with `options.autoSave`

```javascript
const formState = state({
  name: '',
  email: '',
  age: 0
});

autoSave(formState, 'form', {
  autoSave: false  // Manual control
});

// User fills out form
formState.name = 'Alice';
formState.email = 'alice@example.com';
formState.age = 25;

// Validate before saving
function submitForm() {
  if (validateForm(formState)) {
    formState.$save();  // Save only if valid ✨
    console.log('Form saved!');
  } else {
    console.log('Form has errors');
  }
}
```

**What Just Happened?**

```
Disable auto-save
        |
        v
Make multiple changes
        |
        v
Validate data
        |
        v
Save manually when ready ✅
```

**Benefits:**
✅ **Validation control** - Save only valid data  
✅ **Batch changes** - Save multiple changes together  
✅ **Cancel option** - Discard changes if needed  
✅ **Better performance** - Fewer save operations  

  

## Mental Model

Think of `autoSave: true` as **Google Docs auto-save**:

```
autoSave: true (Auto-Save)
┌─────────────────────┐
│  Type a letter      │
│       ↓             │
│  [Saves]            │
│                     │
│  Type another       │
│       ↓             │
│  [Saves]            │
│                     │
│  Every change saves │
│  No control needed  │
└─────────────────────┘
```

Think of `autoSave: false` as **Microsoft Word manual save**:

```
autoSave: false (Manual Save)
┌─────────────────────┐
│  Make changes       │
│  Make more changes  │
│  Review your work   │
│                     │
│  Click "Save"       │
│       ↓             │
│  [Saves all]        │
│                     │
│  You control when   │
└─────────────────────┘
```

**Key Insight:** Choose automatic for convenience, manual for control.

  

## How Does It Work?

The autoSave option controls whether changes trigger saves:

### With autoSave: true (Default)

```
State changes
        |
        v
Effect detects change
        |
        v
Debounce timer starts (if configured)
        |
        v
Timer completes
        |
        v
Save to storage automatically ✨
```

### With autoSave: false

```
State changes
        |
        v
Effect is paused (not watching)
        |
        v
No automatic save
        |
        v
Wait for manual $save() call
        |
        v
Save only when explicitly called ✨
```

  

## Basic Usage

### Example 1: Auto-Save (Default)

```javascript
const preferences = state({
  theme: 'light',
  fontSize: 16
});

autoSave(preferences, 'prefs', {
  autoSave: true  // Default
});

// Changes save automatically
preferences.theme = 'dark';  // Saves ✨
preferences.fontSize = 18;   // Saves ✨
```

  

### Example 2: Manual Save

```javascript
const formData = state({
  name: '',
  email: ''
});

autoSave(formData, 'form', {
  autoSave: false
});

// Changes don't save automatically
formData.name = 'Alice';
formData.email = 'alice@example.com';

// Save manually when ready
document.getElementById('save-btn').onclick = () => {
  formData.$save();
  console.log('Saved!');
};
```

  

### Example 3: Toggle Auto-Save

```javascript
const docState = state({ content: '' });

let autoSaveEnabled = true;

autoSave(docState, 'document', {
  autoSave: autoSaveEnabled
});

// Toggle auto-save
document.getElementById('toggle-autosave').onchange = (e) => {
  if (e.target.checked) {
    docState.$startAutoSave();
  } else {
    docState.$stopAutoSave();
  }
};
```

  

## Real-World Examples

### Example 1: Form with Validation

```javascript
const registrationForm = state({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Disable auto-save - validate first
autoSave(registrationForm, 'registration', {
  autoSave: false
});

function validateAndSave() {
  const errors = [];
  
  if (registrationForm.username.length < 3) {
    errors.push('Username too short');
  }
  
  if (!registrationForm.email.includes('@')) {
    errors.push('Invalid email');
  }
  
  if (registrationForm.password !== registrationForm.confirmPassword) {
    errors.push('Passwords don\'t match');
  }
  
  if (errors.length === 0) {
    registrationForm.$save();
    console.log('Registration saved!');
    return true;
  } else {
    console.log('Errors:', errors);
    return false;
  }
}

document.getElementById('submit').onclick = validateAndSave;
```

  

### Example 2: Multi-Step Form

```javascript
const wizard = state({
  step: 1,
  step1Data: {},
  step2Data: {},
  step3Data: {}
});

// Manual save - only after completion
autoSave(wizard, 'wizardProgress', {
  autoSave: false
});

function nextStep() {
  wizard.step++;
  
  // Save progress at each step
  wizard.$save();
}

function completeWizard() {
  if (validateAllSteps(wizard)) {
    wizard.$save();
    console.log('Wizard completed!');
    wizard.$clear();  // Clear saved progress
  }
}
```

  

### Example 3: Drafts with Explicit Save

```javascript
const editor = state({
  title: '',
  content: '',
  lastSaved: null
});

// Manual save for explicit control
autoSave(editor, 'draft', {
  autoSave: false
});

// Save button
document.getElementById('save-btn').onclick = () => {
  editor.lastSaved = new Date().toISOString();
  editor.$save();
  
  showToast('Draft saved!');
};

// Auto-save every 30 seconds
setInterval(() => {
  if (editor.content.length > 0) {
    editor.lastSaved = new Date().toISOString();
    editor.$save();
    console.log('Auto-saved at', editor.lastSaved);
  }
}, 30000);
```

  

### Example 4: Settings with Apply Button

```javascript
const settings = state({
  theme: 'light',
  notifications: true,
  language: 'en'
});

// Manual save - user must click Apply
autoSave(settings, 'settings', {
  autoSave: false,
  autoLoad: true  // Load on start
});

// Preview changes without saving
effect(() => {
  applyTheme(settings.theme);
  setLanguage(settings.language);
});

// Apply button saves permanently
document.getElementById('apply').onclick = () => {
  settings.$save();
  showToast('Settings saved!');
};

// Cancel button discards changes
document.getElementById('cancel').onclick = () => {
  settings.$load();  // Reload from storage
  showToast('Changes discarded');
};
```

  

### Example 5: Transaction-Like Behavior

```javascript
const shoppingCart = state({ items: [] });

// Manual save for transaction control
autoSave(shoppingCart, 'cart', {
  autoSave: false
});

function addToCart(item) {
  shoppingCart.items.push(item);
  // Don't save yet
}

async function checkout() {
  try {
    // Process payment
    await processPayment(shoppingCart.items);
    
    // Success - clear cart and save empty state
    shoppingCart.items = [];
    shoppingCart.$save();
    
    console.log('Order completed!');
  } catch (error) {
    // Error - reload cart (rollback)
    shoppingCart.$load();
    console.log('Payment failed, cart restored');
  }
}
```

  

## Common Patterns

### Pattern 1: Conditional Auto-Save

```javascript
const state = state({ data: {} });

const shouldAutoSave = localStorage.getItem('autoSaveEnabled') === 'true';

autoSave(state, 'data', {
  autoSave: shouldAutoSave
});
```

  

### Pattern 2: Save on Specific Events

```javascript
const formState = state({ fields: {} });

autoSave(formState, 'form', {
  autoSave: false
});

// Save on blur (field loses focus)
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('blur', () => {
    formState.$save();
  });
});
```

  

### Pattern 3: Batch Save

```javascript
const bulkData = state({ items: [] });

autoSave(bulkData, 'bulk', {
  autoSave: false
});

function bulkUpdate(updates) {
  batch(() => {
    updates.forEach(update => {
      bulkData.items.push(update);
    });
  });
  
  // Save once after all updates
  bulkData.$save();
}
```

  

### Pattern 4: Save with Confirmation

```javascript
const importantData = state({ value: '' });

autoSave(importantData, 'important', {
  autoSave: false
});

function saveWithConfirm() {
  if (confirm('Save changes?')) {
    importantData.$save();
    return true;
  }
  return false;
}
```

  

### Pattern 5: Periodic Manual Save

```javascript
const liveData = state({ metrics: {} });

autoSave(liveData, 'metrics', {
  autoSave: false
});

// Save every 5 seconds
setInterval(() => {
  liveData.$save();
}, 5000);
```

  

### Pattern 6: Save on Window Close

```javascript
const sessionData = state({ data: {} });

autoSave(sessionData, 'session', {
  autoSave: false
});

// Save before page unload
window.addEventListener('beforeunload', () => {
  sessionData.$save();
});
```

  

## When to Use Each

### Use autoSave: true (Default) For:

✅ **User preferences** - Want immediate persistence  
✅ **Simple forms** - No complex validation  
✅ **Auto-draft** - Continuous saving  
✅ **Settings panels** - Instant feedback  
✅ **Small data** - Low save overhead  

### Use autoSave: false For:

✅ **Forms with validation** - Save only valid data  
✅ **Multi-step processes** - Save at checkpoints  
✅ **Large data** - Batch saves for performance  
✅ **Transactional operations** - All-or-nothing saves  
✅ **Explicit user control** - Save/Apply button UX  
✅ **Drafts with save button** - User decides when to save  

  

## Combining with Other Options

### Pattern: Manual Save with Debouncing

```javascript
// Doesn't make sense - debounce needs auto-save
autoSave(state, 'data', {
  autoSave: false,
  debounce: 500  // ❌ Ignored when autoSave is false
});

// Better: Use manual save with setInterval
autoSave(state, 'data', {
  autoSave: false
});

let saveTimeout;
watch(state, () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    state.$save();
  }, 500);
});
```

  

### Pattern: Auto-Save with Validation

```javascript
const state = state({ data: {} });

autoSave(state, 'data', {
  autoSave: true,
  onSave: (data) => {
    if (validate(data)) {
      return data;  // Save valid data
    }
    throw new Error('Validation failed');  // Prevent save
  }
});
```

  

## Summary

**What is `options.autoSave`?**  
A configuration option that determines whether state changes automatically trigger saves to storage.

**Why use it?**
- ✅ Control when saves happen
- ✅ Validate before saving
- ✅ Batch multiple changes
- ✅ Transaction-like behavior
- ✅ Better performance control

**Key Takeaway:**

```
autoSave: true           autoSave: false
      |                        |
Auto-save changes       Manual control
      |                        |
No control needed       Call $save() explicitly
      |                        |
Convenient ✅           More control ✅
```

**One-Line Rule:** Use `autoSave: false` when you need control over when data is saved.

**Best Practices:**
- Use `true` for preferences and simple data
- Use `false` for forms requiring validation
- Use `false` for transactional operations
- Combine with `onSave` for validation
- Remember to call `$save()` when disabled

**Remember:** Choose automatic for convenience, manual for control! 🎉