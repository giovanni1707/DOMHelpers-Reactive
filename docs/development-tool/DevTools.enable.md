# `DevTools.enable()` - Enable Development Tools

## Quick Start (30 seconds)

```javascript
// Enable DevTools
DevTools.enable();
// Console: "[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__"

// Now DevTools is active
console.log(DevTools.enabled); // true

// Access globally in browser console
window.__REACTIVE_DEVTOOLS__.getStates();

// Track states and effects
const state = state({ count: 0 });
DevTools.trackState(state, 'Counter');

// All changes now logged ✨
```

**What just happened?** You turned on the debugging system and made it globally accessible!

  

## What is `DevTools.enable()`?

`DevTools.enable()` is a method that **activates the development tools and exposes them globally on the window object**.

Simply put: it turns on the debugging system so you can track state changes and inspect them from the browser console.

Think of it as **flipping the power switch** for your debugging tools.

  

## Syntax

```javascript
DevTools.enable()
```

**Parameters:** None

**Returns:** Nothing (void)

**Side Effects:**
- Sets `DevTools.enabled` to `true`
- Exposes `window.__REACTIVE_DEVTOOLS__`
- Logs confirmation message to console

  

## Why Does This Exist?

### The Problem: DevTools Off by Default

DevTools is disabled by default to avoid performance overhead:

```javascript
// DevTools is off
console.log(DevTools.enabled); // false

// Tracking doesn't work
const state = state({ count: 0 });
DevTools.trackState(state, 'Counter'); // No effect

// Can't inspect
window.__REACTIVE_DEVTOOLS__; // undefined

// No debugging possible ❌
```

**What's the Real Issue?**

```
Need to debug
        |
        v
DevTools disabled
        |
        v
Can't track changes
        |
        v
No debugging ❌
```

**Problems:**
❌ **Can't track** - Changes not logged  
❌ **Can't inspect** - Not globally accessible  
❌ **No visibility** - State changes invisible  

### The Solution with `DevTools.enable()`

```javascript
// Enable DevTools
DevTools.enable();
// "[DevTools] Enabled"

// Now tracking works
const state = state({ count: 0 });
DevTools.trackState(state, 'Counter'); // ✅ Works

// Can inspect globally
window.__REACTIVE_DEVTOOLS__.getStates(); // ✅ Works

// Full debugging available ✅
```

**What Just Happened?**

```
Call enable()
        |
        v
DevTools activated
        |
        v
Global access enabled
        |
        v
Debugging ready ✅
```

**Benefits:**
✅ **Activates tracking** - State changes logged  
✅ **Global access** - Available in console  
✅ **Full debugging** - All features enabled  

  

## Mental Model

Think of DevTools as **a camera**:

```
DevTools Disabled (Camera Off)
┌─────────────────────┐
│  Camera exists      │
│                     │
│  But it's OFF       │
│                     │
│  No recording       │
│                     │
│  Can't see photos ❌│
└─────────────────────┘
```

Think of enable() as **turning camera on**:

```
DevTools.enable() (Camera On)
┌─────────────────────┐
│  Camera ON          │
│       ↓             │
│  Recording starts   │
│       ↓             │
│  Photos accessible  │
│       ↓             │
│  Can review ✅      │
└─────────────────────┘
```

**Key Insight:** enable() turns on the debugging system.

  

## How Does It Work?

Calling enable() sets up the debugging system:

### Activation Process

```
DevTools.enable()
        |
        v
Set enabled flag to true
        |
        v
Expose on window object
        |
        v
Log confirmation message
        |
        v
Ready to track ✨
```

### Implementation

```javascript
// Simplified implementation
DevTools.enable = function() {
  // Set flag
  this.enabled = true;
  
  // Make globally accessible
  window.__REACTIVE_DEVTOOLS__ = this;
  
  // Log confirmation
  console.log('[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__');
  
  return this;
};
```

  

## Basic Usage

### Example 1: Simple Enable

```javascript
// Enable DevTools
DevTools.enable();

// Check if enabled
console.log(DevTools.enabled); // true

// Access globally
console.log(window.__REACTIVE_DEVTOOLS__); // DevTools object
```

  

### Example 2: Enable Then Track

```javascript
// Enable first
DevTools.enable();

// Then track states
const user = state({ name: 'Alice' });
DevTools.trackState(user, 'User');

const cart = state({ items: [] });
DevTools.trackState(cart, 'Cart');

// Changes now logged ✨
```

  

### Example 3: Check Before Enable

```javascript
// Avoid enabling twice
if (!DevTools.enabled) {
  DevTools.enable();
  console.log('DevTools activated');
} else {
  console.log('DevTools already enabled');
}
```

  

## Real-World Examples

### Example 1: Development Mode Only

```javascript
// Only enable in development
if (process.env.NODE_ENV === 'development') {
  DevTools.enable();
  console.log('🔧 DevTools enabled (development mode)');
} else {
  console.log('⚡ DevTools disabled (production mode)');
}
```

  

### Example 2: Localhost Detection

```javascript
// Auto-enable on localhost
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1') {
  DevTools.enable();
  console.log('🔧 DevTools enabled (localhost)');
}
```

  

### Example 3: URL Parameter Trigger

```javascript
// Enable with ?debug query parameter
const params = new URLSearchParams(window.location.search);

if (params.has('debug')) {
  DevTools.enable();
  console.log('🔧 DevTools enabled (debug mode)');
  
  // Also show debug panel
  document.getElementById('debug-panel').style.display = 'block';
}
```

  

### Example 4: Conditional Enable with Logging

```javascript
function initializeApp() {
  // Check conditions
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = window.location.hostname === 'localhost';
  const hasDebugFlag = localStorage.getItem('enableDebug') === 'true';
  
  if (isDev || isLocalhost || hasDebugFlag) {
    DevTools.enable();
    
    console.log('%c DevTools Enabled ', 
      'background: #4CAF50; color: white; font-weight: bold; padding: 4px');
    console.log('Access via: window.__REACTIVE_DEVTOOLS__');
  }
}

initializeApp();
```

  

### Example 5: Enable with Auto-Tracking

```javascript
// Enable and auto-track all states
DevTools.enable();

// Wrap state creation to auto-track
const originalCreateState = state;

window.state = function(initialState, name) {
  const s = originalCreateState(initialState);
  
  if (name && DevTools.enabled) {
    DevTools.trackState(s, name);
    console.log(`📊 Tracking state: ${name}`);
  }
  
  return s;
};

// Now all states auto-tracked
const user = state({ name: 'Alice' }, 'User');
const cart = state({ items: [] }, 'Cart');
```

  

## Common Patterns

### Pattern 1: One-Time Initialization

```javascript
// Ensure enable() called only once
let initialized = false;

function initDevTools() {
  if (!initialized) {
    DevTools.enable();
    initialized = true;
    console.log('DevTools initialized');
  }
}

// Safe to call multiple times
initDevTools();
initDevTools(); // No effect second time
```

  

### Pattern 2: Environment-Based Enable

```javascript
const config = {
  development: true,
  staging: true,
  production: false
};

const env = process.env.NODE_ENV || 'development';

if (config[env]) {
  DevTools.enable();
}
```

  

### Pattern 3: User Preference

```javascript
// Check user preference
const userWantsDebug = localStorage.getItem('devtools') === 'enabled';

if (userWantsDebug) {
  DevTools.enable();
}

// Provide toggle
function toggleDevTools() {
  if (DevTools.enabled) {
    DevTools.disable();
    localStorage.setItem('devtools', 'disabled');
  } else {
    DevTools.enable();
    localStorage.setItem('devtools', 'enabled');
  }
}
```

  

### Pattern 4: Delayed Enable

```javascript
// Enable after app loads
window.addEventListener('load', () => {
  if (process.env.NODE_ENV === 'development') {
    DevTools.enable();
    console.log('DevTools enabled after load');
  }
});
```

  

### Pattern 5: Enable with Setup

```javascript
function setupDevTools() {
  DevTools.enable();
  
  // Increase history size
  DevTools.maxHistory = 100;
  
  // Add helper to window
  window.dumpState = () => {
    console.table(DevTools.getStates());
  };
  
  window.dumpHistory = () => {
    console.table(DevTools.getHistory());
  };
  
  console.log('DevTools ready!');
  console.log('Use: window.dumpState() or window.dumpHistory()');
}

setupDevTools();
```

  

### Pattern 6: Keyboard Shortcut

```javascript
// Enable with Ctrl+Shift+D
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    if (!DevTools.enabled) {
      DevTools.enable();
      alert('DevTools enabled! Open console to inspect.');
    }
  }
});
```

  

## What Happens When Enabled

### Immediate Effects

```javascript
DevTools.enable();

// 1. enabled flag set
console.log(DevTools.enabled); // true

// 2. Global exposure
console.log(window.__REACTIVE_DEVTOOLS__); // DevTools object

// 3. Console message
// "[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__"

// 4. Tracking now works
DevTools.trackState(state, 'MyState'); // ✅ Works

// 5. History starts recording
state.value = 'new';
DevTools.getHistory(); // Shows change
```

  

## Console Access

After enabling, use from browser console:

```javascript
// Enable in your code
DevTools.enable();

// Then in browser console:
const dt = window.__REACTIVE_DEVTOOLS__;

dt.getStates();      // List tracked states
dt.getHistory();     // View change history
dt.clearHistory();   // Clear history
dt.enabled;          // Check status
```

  

## Production Safeguards

### Always Disable in Production

```javascript
// ✅ Good: Environment check
if (process.env.NODE_ENV !== 'production') {
  DevTools.enable();
}

// ✅ Good: Build-time removal
if (__DEV__) { // Removed by bundler in production
  DevTools.enable();
}

// ❌ Bad: Always enabled
DevTools.enable(); // Runs in production!
```

  

## Summary

**What is `DevTools.enable()`?**  
A method that activates the development tools and exposes them globally on the window object.

**Why use it?**
- ✅ Turn on debugging system
- ✅ Enable state tracking
- ✅ Make DevTools globally accessible
- ✅ Start logging changes

**Key Takeaway:**

```
Before enable()         After enable()
      |                      |
DevTools off           DevTools on
      |                      |
Can't track ❌         Can track ✅
```

**One-Line Rule:** Call `enable()` to turn on the debugging system.

**Best Practices:**
- Only enable in development
- Check environment before enabling
- Enable early in app lifecycle
- Use with auto-tracking for best results
- Provide console access instructions

**When to Enable:**
- Development environment
- Localhost
- Staging servers  
- Debug mode
- Never in production

**Remember:** Always enable DevTools before tracking states! 🎉