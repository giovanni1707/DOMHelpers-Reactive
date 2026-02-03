# `startAutoSave(state)` - Start Automatic Saving

## Quick Start (30 seconds)

```javascript
const formState = state({ name: '', email: '' });

// Initially disabled auto-save
autoSave(formState, 'form', { autoSave: false });

formState.name = 'Alice'; // Doesn't save

// Start auto-saving
startAutoSave(formState);

// Now changes save automatically
formState.email = 'alice@example.com'; // Auto-saves! ✨
```

**What just happened?** You activated automatic saving for a state that had it disabled!

  

## What is `startAutoSave(state)`?

`startAutoSave(state)` is a function that **enables automatic saving for a state object**.

Simply put: it activates the auto-save feature, making all changes automatically persist to storage.

Think of it as **turning on automatic pilot** for your state persistence.

  

## Syntax

```javascript
startAutoSave(state)

```

**Parameters:**
- `state` - The reactive state object to enable auto-save for

**Returns:** The state object (for chaining)

  

## Why Does This Exist?

### The Problem: Need Dynamic Control

Sometimes you need to enable auto-save after initialization:

```javascript
// Start without auto-save
autoSave(state, 'data', { autoSave: false });

// Later, user enables "Auto-save" feature
// How to turn it on? ❌

// Without startAutoSave:
// - Must recreate entire state ❌
// - Lose all current data ❌
// - Complex workaround needed ❌
```

**Problems:**
❌ **No dynamic control** - Can't enable after init  
❌ **Must recreate state** - Lose data  
❌ **Poor UX** - Can't toggle auto-save  

### The Solution

```javascript
// Start without auto-save
autoSave(state, 'data', { autoSave: false });

// User enables auto-save
startAutoSave(state);

// Now it saves automatically! ✅
```

**Benefits:**
✅ **Dynamic control** - Enable anytime  
✅ **Keep data** - No need to recreate  
✅ **Better UX** - Toggle feature easily  

  

## How Does It Work?

```
State without auto-save
        |
        v
startAutoSave(state) called
        |
        v
Effect watcher created
        |
        v
Watches for changes
        |
        v
Saves automatically ✨
```

  

## Basic Usage

### Example 1: Enable After Init

```javascript
const state = state({ count: 0 });

// No auto-save initially
autoSave(state, 'counter', { autoSave: false });

state.count = 1; // Doesn't save
save(state);     // Manual save

// Enable auto-save
startAutoSave(state);

state.count = 2; // Auto-saves now!
```

  

### Example 2: Toggle Auto-Save

```javascript
const settings = state({ theme: 'light' });
autoSave(settings, 'settings', { autoSave: false });

// Checkbox to toggle auto-save
document.getElementById('auto-save-toggle').onchange = (e) => {
  if (e.target.checked) {
    startAutoSave(settings);
    console.log('Auto-save enabled');
  } else {
    stopAutoSave(settings);
    console.log('Auto-save disabled');
  }
};
```

  

### Example 3: Resume After Pause

```javascript
const data = state({ items: [] });
autoSave(data, 'data', { autoSave: true });

// Pause for bulk operation
stopAutoSave(data);

for (let i = 0; i < 100; i++) {
  data.items.push({ id: i });
}

save(data); // Save once

// Resume auto-save
startAutoSave(data);
```

  

## Real-World Examples

### Example 1: User Preference

```javascript
const documentState = state({ content: '' });

// Check user preference
const autoSaveEnabled = localStorage.getItem('autoSaveEnabled') === 'true';

autoSave(documentState, 'document', {
  autoSave: autoSaveEnabled,
  debounce: 1000
});

// User toggles preference
function setAutoSavePreference(enabled) {
  localStorage.setItem('autoSaveEnabled', enabled);
  
  if (enabled) {
    startAutoSave(documentState);
    showToast('Auto-save enabled');
  } else {
    stopAutoSave(documentState);
    showToast('Auto-save disabled');
  }
}
```

  

### Example 2: Network Status

```javascript
const formState = state({ fields: {} });

// Start without auto-save
autoSave(formState, 'form', { autoSave: false });

// Enable when online
if (navigator.onLine) {
  startAutoSave(formState);
}

// Network status handlers
window.addEventListener('online', () => {
  startAutoSave(formState);
  showToast('Auto-save enabled (online)');
});

window.addEventListener('offline', () => {
  stopAutoSave(formState);
  showToast('Auto-save paused (offline)');
});
```

  

### Example 3: Trial Mode

```javascript
const appState = state({ data: [] });

// Free users: manual save only
autoSave(appState, 'app', { autoSave: false });

// When user upgrades to premium
function upgradeToPremium() {
  startAutoSave(appState);
  
  showNotification('Premium feature unlocked: Auto-save enabled!');
}

// Downgrade
function downgradeToPremium() {
  stopAutoSave(appState);
  
  showNotification('Auto-save disabled. Save manually to keep changes.');
}
```

  

### Example 4: Editor Modes

```javascript
const editorState = state({ content: '' });
autoSave(editorState, 'editor', { autoSave: false });

let currentMode = 'edit';

function setMode(mode) {
  currentMode = mode;
  
  if (mode === 'edit') {
    // Enable auto-save in edit mode
    startAutoSave(editorState);
    showStatus('Edit mode - auto-saving');
  } else if (mode === 'preview') {
    // Disable in preview mode
    stopAutoSave(editorState);
    showStatus('Preview mode - auto-save paused');
  }
}
```

  

### Example 5: Battery Saver

```javascript
const state = state({ data: {} });
autoSave(state, 'data', { autoSave: true });

// Monitor battery
if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {
    function updateAutoSave() {
      if (battery.charging || battery.level > 0.2) {
        // Good battery - enable auto-save
        startAutoSave(state);
      } else {
        // Low battery - disable to save power
        stopAutoSave(state);
        showToast('Auto-save paused (low battery)');
      }
    }
    
    battery.addEventListener('levelchange', updateAutoSave);
    battery.addEventListener('chargingchange', updateAutoSave);
    
    updateAutoSave();
  });
}
```

  

## Common Patterns

### Pattern 1: Lazy Auto-Save Activation

```javascript
// Start with auto-save off
const state = state({ value: 0 });
autoSave(state, 'data', { autoSave: false });

// Enable after user makes first change
let hasChanges = false;

watch(state, () => {
  if (!hasChanges) {
    hasChanges = true;
    startAutoSave(state);
    console.log('Auto-save activated');
  }
});
```

  

### Pattern 2: Conditional Enable

```javascript
function enableAutoSaveIfNeeded(state) {
  const canAutoSave = 
    navigator.onLine &&
    hasLocalStorage &&
    !isLowMemory();
  
  if (canAutoSave) {
    startAutoSave(state);
    return true;
  }
  
  return false;
}
```

  

### Pattern 3: Toggle with State

```javascript
const settings = state({ autoSaveEnabled: false });
const data = state({ content: '' });

autoSave(data, 'data', { autoSave: false });

// Watch settings
watch(settings, () => {
  if (settings.autoSaveEnabled) {
    startAutoSave(data);
  } else {
    stopAutoSave(data);
  }
});
```

  

### Pattern 4: Gradual Activation

```javascript
// Wait for user inactivity before enabling
let inactivityTimer;

document.addEventListener('mousemove', () => {
  clearTimeout(inactivityTimer);
  
  inactivityTimer = setTimeout(() => {
    // User inactive - safe to enable auto-save
    startAutoSave(state);
  }, 5000);
});
```

  

## Alternative: Namespace Functions

You can use namespace functions for all storage operations:

```javascript
const myState = state({ value: 0 });
autoSave(myState, 'data', { autoSave: false });

// Using namespace function
startAutoSave(myState);

// Changes now auto-save
myState.value = 10; // Saves automatically
```

  

## Important Notes

### Can Be Called Multiple Times

```javascript
startAutoSave(state);
startAutoSave(state); // Safe - no error
startAutoSave(state); // No effect if already started
```

### Respects Debounce

```javascript
autoSave(state, 'data', {
  autoSave: false,
  debounce: 500
});

startAutoSave(state);

// Debounce still applies
state.value = 1; // Saves after 500ms
state.value = 2; // Resets debounce timer
```

### Requires autoSave() First

```javascript
// ❌ Wrong: No autoSave setup
const state = state({ value: 0 });
startAutoSave(state); // Won't work

// ✅ Correct: Setup first
const state = state({ value: 0 });
autoSave(state, 'data', { autoSave: false });
startAutoSave(state); // Works
```

  

## When to Use

### Use `startAutoSave()` For:

✅ **User preference** - Toggle auto-save feature  
✅ **Network recovery** - Resume after offline  
✅ **Performance** - Enable after bulk operations  
✅ **Premium features** - Unlock for paid users  
✅ **Mode switching** - Different modes need different behavior  

### Don't Use For:

❌ **Initial setup** - Use `autoSave: true` option  
❌ **One-time enable** - Use option in autoSave()  
❌ **Already active** - Check state first  

  

## Comparison with Options

### Using startAutoSave()

```javascript
// Dynamic control
autoSave(state, 'data', { autoSave: false });

if (userPreference) {
  startAutoSave(state);
}
```

### Using autoSave Option

```javascript
// Static setup
autoSave(state, 'data', { 
  autoSave: true  // Always on
});
```

**Choose `startAutoSave()` when:** Need dynamic enable/disable  
**Choose `autoSave: true` when:** Always want auto-save from start  

  

## Combined with stopAutoSave()

Perfect for toggling:

```javascript
let autoSaveActive = false;

function toggleAutoSave() {
  autoSaveActive = !autoSaveActive;
  
  if (autoSaveActive) {
    startAutoSave(state);
    console.log('Auto-save: ON');
  } else {
    stopAutoSave(state);
    console.log('Auto-save: OFF');
  }
}

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    
    if (!autoSaveActive) {
      // Manual save
      save(state);
      console.log('Saved manually');
    } else {
      console.log('Auto-save active');
    }
  }
});
```

  

## Status Indicators

Show auto-save status to users:

```javascript
function updateAutoSaveIndicator() {
  const indicator = document.getElementById('auto-save-status');
  
  if (/* auto-save active */) {
    indicator.textContent = '✓ Auto-save ON';
    indicator.className = 'status-active';
  } else {
    indicator.textContent = '○ Auto-save OFF';
    indicator.className = 'status-inactive';
  }
}

// Update when toggling
function enableAutoSave() {
  startAutoSave(state);
  updateAutoSaveIndicator();
}

function disableAutoSave() {
  stopAutoSave(state);
  updateAutoSaveIndicator();
}
```

  

## Summary

**What is `startAutoSave(state)`?**  
A function that enables automatic saving for a state object.

**Why use it?**
- ✅ Enable auto-save dynamically
- ✅ Resume after pause
- ✅ User preference control
- ✅ Network-aware behavior
- ✅ Feature gating (premium)

**Key Takeaway:**

```
Manual Save             Start Auto-Save
     |                        |
No auto-save           Automatic saves
     |                        |
User control           Convenience ✅
```

**Remember:** Gives users control over when auto-save is active! 🎉