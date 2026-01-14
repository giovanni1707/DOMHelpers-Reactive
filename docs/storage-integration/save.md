#  `save(state)`

## Quick Start (30 seconds)

**Force save your state to localStorage right now:**

```javascript
const settings = state({ theme: 'dark', fontSize: 14 });

// Enable auto-save
autoSave(settings, 'appSettings');

// Change something
settings.theme = 'light';
// (Normally saves after debounce delay)

// But save RIGHT NOW
save(settings);
console.log('Saved immediately!');
```

**That's it!** Your state is saved to localStorage instantly.

 

## What is save()?

`save()` is a function that **immediately saves your state to localStorage** without waiting.

Simply put: **It's the "save now" button.**

```javascript
const userPrefs = state({ lang: 'en' });
autoSave(userPrefs, 'prefs', { debounce: 1000 });

userPrefs.lang = 'fr';
// Normally waits 1 second before saving...

// But I want to save NOW
save(userPrefs);
// Saved instantly!
```

 

## Syntax

### Shorthand (Recommended)
```javascript
save(state)
```

### Full Namespace
```javascript
ReactiveUtils.save(state)
```

### Parameters
- **`state`** - A reactive state object with auto-save enabled

### Returns
- **`boolean`** - `true` if saved successfully, `false` if failed

 

## Why Does This Exist?

### The Challenge with Auto-Save

When you use `autoSave()`, it waits before saving (debouncing):

```javascript
const form = state({ name: '', email: '' });
autoSave(form, 'formData', { debounce: 500 });

// User types fast
form.name = 'J';
form.name = 'Jo';
form.name = 'Joh';
form.name = 'John';
// Waits 500ms after last change before saving
```

**Problem:** What if the user **closes the browser** before those 500ms?

```javascript
form.email = 'john@example.com';
// Waiting 500ms...
// User closes tab → Data LOST! ❌
```

### The Solution with save()

```javascript
const form = state({ name: '', email: '' });
autoSave(form, 'formData', { debounce: 500 });

// User clicks "Save" button
document.querySelector('#saveBtn').addEventListener('click', () => {
  save(form); // Saves immediately!
  alert('Saved!');
});

// Or save before closing
window.addEventListener('beforeunload', () => {
  save(form); // Ensures data is saved
});
```

**What's better about this?**

✅ No data loss  
✅ Save on demand  
✅ Instant feedback to user  
✅ Control when data is persisted  

This method is **especially useful when** you need guaranteed saves (form submissions, before navigation, critical data).

 

## Mental Model

Think of `save()` as the **save button** in a video game.

### Auto-Save (Background)
```
Playing game...
   ↓
Every 5 minutes → Auto-saves
   ↓
Continue playing
```

### Manual Save (save())
```
About to fight boss
   ↓
Press [SAVE] button
   ↓
Saved immediately! ✅
   ↓
Now ready for boss fight
```

**Key Insight:** Auto-save is convenient, manual save is for important moments.

 

## How Does It Work?

When you call `save()`, here's what happens:

```
Step 1: Check
   ↓
[Does state have $save method?]
   ↓
   Yes → Continue
   No  → Return false
   ↓
Step 2: Cancel Pending
   ↓
[Cancel any debounced save]
   ↓
Step 3: Save Now
   ↓
[Get current state data]
[Serialize to JSON]
[Write to localStorage]
   ↓
Step 4: Return
   ↓
[Return true if success]
[Return false if error]
```

**Behind the scenes:**
```javascript
// Simplified
function save(state) {
  if (!state.$save) {
    return false;
  }
  
  // Cancel pending auto-save
  clearTimeout(state.saveTimeout);
  
  // Save immediately
  try {
    const data = state.data || state;
    localStorage.setItem(state.storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
}
```

 

## Basic Usage

### Example 1: Save Button

```javascript
const document = state({
  title: '',
  content: ''
});

autoSave(document, 'myDocument', { debounce: 1000 });

// User clicks save
document.querySelector('#saveBtn').addEventListener('click', () => {
  const success = save(document);
  
  if (success) {
    alert('Document saved!');
  } else {
    alert('Failed to save');
  }
});
```

 

### Example 2: Before Closing

```javascript
const editor = state({ text: '' });
autoSave(editor, 'editor', { debounce: 2000 });

// Save before user leaves
window.addEventListener('beforeunload', (e) => {
  save(editor);
});
```

 

### Example 3: Form Submission

```javascript
const formData = state({
  name: '',
  email: '',
  message: ''
});

autoSave(formData, 'draftMessage', { debounce: 500 });

document.querySelector('#submitForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Save immediately before submitting
  save(formData);
  
  // Then submit
  submitForm(formData);
});
```

 

### Example 4: Critical Changes

```javascript
const gameState = state({
  level: 1,
  lives: 3,
  score: 0
});

autoSave(gameState, 'savegame', { debounce: 5000 });

// Save immediately on important events
function playerDied() {
  gameState.lives--;
  save(gameState); // Don't wait - save now!
}

function levelComplete() {
  gameState.level++;
  save(gameState); // Save milestone immediately
}
```

 

## Deep Dive

### Return Value

`save()` returns `true` or `false`:

```javascript
const data = state({ value: 42 });
autoSave(data, 'myData');

const success = save(data);

if (success) {
  console.log('✅ Saved successfully');
} else {
  console.log('❌ Save failed');
}
```

**Common failure reasons:**
- localStorage quota exceeded
- Browser in private mode
- localStorage disabled
- Serialization error

 

### Checking Success

```javascript
const settings = state({ theme: 'dark' });
autoSave(settings, 'settings');

function saveSettings() {
  const saved = save(settings);
  
  if (saved) {
    // Success - show confirmation
    showNotification('Settings saved!');
  } else {
    // Failure - show error
    showError('Could not save settings. Check storage space.');
  }
}
```

 

### save() with Large Data

```javascript
const bigData = state({
  items: Array(10000).fill({ name: 'Item', data: '...' })
});

autoSave(bigData, 'largeDataset');

// Check storage before saving
const info = storageInfo(bigData);
console.log('Size:', info.sizeKB, 'KB');

if (info.sizeKB > 1000) {
  console.warn('Data is very large!');
}

const success = save(bigData);
if (!success) {
  console.error('Save failed - data too large');
}
```

 

### save() Cancels Debounce

```javascript
const data = state({ value: 0 });
autoSave(data, 'data', { debounce: 5000 });

// Start changing data
data.value = 1; // Will save in 5 seconds
data.value = 2; // Reset timer - will save in 5 seconds
data.value = 3; // Reset timer - will save in 5 seconds

// User clicks save - saves immediately
save(data);
// ✅ Saved now, debounce timer cancelled
```

 

### Multiple States

```javascript
const user = state({ name: 'John' });
const settings = state({ theme: 'dark' });
const cart = state({ items: [] });

autoSave(user, 'user');
autoSave(settings, 'settings');
autoSave(cart, 'cart');

// Save all at once
function saveAll() {
  const results = [
    save(user),
    save(settings),
    save(cart)
  ];
  
  const allSuccess = results.every(r => r === true);
  
  if (allSuccess) {
    console.log('All saved!');
  } else {
    console.log('Some saves failed');
  }
}
```

 

## Common Patterns

### Pattern 1: Save with Visual Feedback

```javascript
const notes = state({ text: '' });
autoSave(notes, 'notes');

function saveWithFeedback() {
  // Show saving indicator
  document.querySelector('#status').textContent = 'Saving...';
  
  const success = save(notes);
  
  if (success) {
    document.querySelector('#status').textContent = '✓ Saved';
    setTimeout(() => {
      document.querySelector('#status').textContent = '';
    }, 2000);
  } else {
    document.querySelector('#status').textContent = '✗ Failed';
  }
}
```

 

### Pattern 2: Save on Navigation

```javascript
const formData = state({ fields: {} });
autoSave(formData, 'form');

// Save before navigating away
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    save(formData); // Save before leaving page
  });
});
```

 

### Pattern 3: Periodic Manual Saves

```javascript
const editor = state({ document: '' });
autoSave(editor, 'editor', { debounce: 2000 });

// Also save every 30 seconds regardless
setInterval(() => {
  save(editor);
  console.log('Auto-saved at', new Date().toLocaleTimeString());
}, 30000);
```

 

### Pattern 4: Save After Validation

```javascript
const form = state({
  email: '',
  password: ''
});

autoSave(form, 'form');

function submitForm() {
  // Validate
  if (!form.email.includes('@')) {
    alert('Invalid email');
    return;
  }
  
  // Save only if valid
  if (save(form)) {
    console.log('Valid form saved');
    // Proceed with submission
  }
}
```

 

### Pattern 5: Retry on Failure

```javascript
const data = state({ important: true });
autoSave(data, 'critical');

async function saveWithRetry(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    if (save(data)) {
      console.log('Saved on attempt', i + 1);
      return true;
    }
    
    console.log('Save failed, retrying...');
    await delay(1000);
  }
  
  console.error('Failed after', maxAttempts, 'attempts');
  return false;
}
```

 

## Summary

**What is save()?**  
A function that immediately saves your state to localStorage without waiting.

**Key Features:**
- ✅ Instant save (no debounce delay)
- ✅ Returns success/failure status
- ✅ Cancels pending auto-saves
- ✅ Works with any auto-saved state

**When to use it:**
- Save button clicks
- Before navigation
- Form submissions
- Critical milestones
- Before closing app

**Remember:**
```javascript
// Setup auto-save
autoSave(state, 'key');

// Save immediately when needed
save(state); // Returns true/false
```

**Related Methods:**
- `autoSave()` - Enable automatic saving
- `load()` - Load from storage
- `exists()` - Check if saved
- `storageInfo()` - Get storage details

 
