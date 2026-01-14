# `DevTools Lifecycle` - Enable & Disable

## Quick Start (30 seconds)

```javascript
// Basic lifecycle
DevTools.enable();   // Turn on
DevTools.disable();  // Turn off
DevTools.enable();   // Turn on again

// Check status
console.log(DevTools.enabled);  // true

// With tracking
DevTools.enable();

const state = ReactiveUtils.state({ count: 0 });
DevTools.trackState(state, 'Counter');

state.count = 5;
console.log(DevTools.getHistory());  // [{ ... }]

DevTools.disable();

state.count = 10;  // Not tracked
console.log(DevTools.history.length);  // Still 1 (preserved)

// Clean restart
DevTools.enable();
DevTools.clearHistory();
// Fresh start! ✨
```

**What just happened?** You controlled the DevTools lifecycle - turning debugging on/off while preserving data!

 

## Overview

The DevTools lifecycle consists of **two simple methods** that control the entire debugging system:

```
enable()  →  Active State  →  disable()
   ↓                             ↓
Tracking ON              Tracking OFF
   ↓                             ↓
Recording                No Recording
   ↓                             ↓
Console Access           No Console Access
```

Think of it as **a power switch** - everything either works (enabled) or doesn't (disabled).

 

## enable() Method

### What It Does

`DevTools.enable()` **activates the debugging system** and makes it available for tracking.

```javascript
DevTools.enable()
```

**Parameters:** None  
**Returns:** `undefined`  
**Side Effects:**
- Sets `DevTools.enabled = true`
- Exposes `window.__REACTIVE_DEVTOOLS__`
- Starts accepting tracking calls
- Logs confirmation message

### When enable() Runs

```
1️⃣ Set enabled flag
   DevTools.enabled = true
        ↓
2️⃣ Expose globally
   window.__REACTIVE_DEVTOOLS__ = DevTools
        ↓
3️⃣ Initialize registries
   states = new Map()
   effects = new Map()
   history = []
        ↓
4️⃣ Log confirmation
   console.log('[DevTools] Enabled...')
        ↓
5️⃣ Ready for tracking
```

### Basic Usage

```javascript
// Enable at app start
DevTools.enable();

// Now tracking works
const state = ReactiveUtils.state({ value: 0 });
DevTools.trackState(state, 'MyState');

state.value = 10;
// Tracked ✓
```

### enable() Examples

**Example 1: Simple Enable**
```javascript
// Check before enabling
if (!DevTools.enabled) {
  DevTools.enable();
  console.log('DevTools now active');
}
```

**Example 2: Environment-Based**
```javascript
// Enable in development only
if (process.env.NODE_ENV === 'development') {
  DevTools.enable();
}

// Or with Vite
if (import.meta.env.DEV) {
  DevTools.enable();
}
```

**Example 3: URL Parameter**
```javascript
// Enable via ?debug in URL
const params = new URLSearchParams(window.location.search);

if (params.has('debug')) {
  DevTools.enable();
  console.log('Debug mode enabled');
}
```

**Example 4: Auto-Enable on Localhost**
```javascript
function autoEnableLocal() {
  const isLocal = 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  
  if (isLocal) {
    DevTools.enable();
    return true;
  }
  return false;
}

autoEnableLocal();
```

**Example 5: With Callback**
```javascript
function enableWithSetup(setupFn) {
  DevTools.enable();
  
  if (setupFn) {
    setupFn(DevTools);
  }
}

enableWithSetup((dt) => {
  console.log('DevTools ready');
  dt.maxHistory = 100;
});
```

 

## disable() Method

### What It Does

`DevTools.disable()` **deactivates the debugging system** while preserving collected data.

```javascript
DevTools.disable()
```

**Parameters:** None  
**Returns:** `undefined`  
**Side Effects:**
- Sets `DevTools.enabled = false`
- Removes `window.__REACTIVE_DEVTOOLS__`
- Stops accepting tracking calls
- **Preserves** existing history and data

### When disable() Runs

```
1️⃣ Set enabled flag
   DevTools.enabled = false
        ↓
2️⃣ Remove global reference
   delete window.__REACTIVE_DEVTOOLS__
        ↓
3️⃣ Stop tracking
   New trackState/trackEffect calls ignored
        ↓
4️⃣ Preserve data
   history, states, effects kept
        ↓
5️⃣ Inactive
```

### Basic Usage

```javascript
// Disable when done debugging
DevTools.enable();
// ... debugging ...

const history = DevTools.getHistory();
console.log('Captured', history.length, 'changes');

DevTools.disable();

// Tracking stops
DevTools.trackState(state, 'Test');  // Ignored
```

### disable() Examples

**Example 1: Simple Disable**
```javascript
// Stop tracking
if (DevTools.enabled) {
  DevTools.disable();
  console.log('DevTools deactivated');
}
```

**Example 2: Temporary Debug Session**
```javascript
// Debug for limited time
DevTools.enable();
console.log('Debug session started');

setTimeout(() => {
  console.log('Changes:', DevTools.getHistory().length);
  DevTools.disable();
  console.log('Session ended');
}, 30000);  // 30 seconds
```

**Example 3: Conditional Disable**
```javascript
// Disable after N changes
function trackWithLimit(state, name, maxChanges = 50) {
  DevTools.enable();
  DevTools.trackState(state, name);
  
  const check = setInterval(() => {
    if (DevTools.history.length >= maxChanges) {
      DevTools.disable();
      console.log(`Reached ${maxChanges} changes - stopped`);
      clearInterval(check);
    }
  }, 100);
}
```

**Example 4: Production Guard**
```javascript
// Ensure disabled in production
function ensureProductionSafe() {
  if (process.env.NODE_ENV === 'production') {
    if (DevTools.enabled) {
      console.warn('DevTools enabled in production!');
      DevTools.disable();
    }
  }
}
```

**Example 5: Clean Shutdown**
```javascript
// Disable and clear on app exit
window.addEventListener('beforeunload', () => {
  if (DevTools.enabled) {
    DevTools.disable();
    DevTools.clearHistory();
  }
});
```

 

## Lifecycle Patterns

### Pattern 1: Toggle Function

```javascript
function toggleDevTools() {
  if (DevTools.enabled) {
    console.log('Disabling DevTools');
    DevTools.disable();
  } else {
    console.log('Enabling DevTools');
    DevTools.enable();
  }
  
  return DevTools.enabled;
}

// Usage
toggleDevTools();  // Enable
toggleDevTools();  // Disable
```

 

### Pattern 2: Scoped Debugging

```javascript
function withDevTools(fn) {
  const wasEnabled = DevTools.enabled;
  
  if (!wasEnabled) {
    DevTools.enable();
  }
  
  try {
    return fn();
  } finally {
    if (!wasEnabled) {
      DevTools.disable();
    }
  }
}

// Usage
withDevTools(() => {
  // DevTools active here
  const state = ReactiveUtils.state({ count: 0 });
  DevTools.trackState(state, 'Temp');
  state.count = 5;
});
// DevTools disabled after
```

 

### Pattern 3: Lazy Enable

```javascript
let devToolsInitialized = false;

function ensureDevTools() {
  if (!devToolsInitialized) {
    DevTools.enable();
    devToolsInitialized = true;
    console.log('DevTools lazy-loaded');
  }
  return DevTools;
}

// Only enables when first needed
function debugState(state, name) {
  ensureDevTools();
  DevTools.trackState(state, name);
}
```

 

### Pattern 4: Session Management

```javascript
class DebugSession {
  constructor() {
    this.active = false;
    this.startTime = null;
  }
  
  start() {
    if (this.active) {
      console.warn('Session already active');
      return;
    }
    
    DevTools.enable();
    DevTools.clearHistory();
    this.active = true;
    this.startTime = Date.now();
    
    console.log('Debug session started');
  }
  
  end() {
    if (!this.active) {
      console.warn('No active session');
      return;
    }
    
    const duration = Date.now() - this.startTime;
    const changes = DevTools.getHistory();
    
    console.log('Session Summary:');
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Changes: ${changes.length}`);
    
    DevTools.disable();
    this.active = false;
  }
}

// Usage
const session = new DebugSession();
session.start();
// ... debugging ...
session.end();
```

 

## Real-World Examples

### Example 1: Development Dashboard

```javascript
class DevDashboard {
  constructor() {
    this.container = null;
    this.updateInterval = null;
  }
  
  show() {
    // Enable DevTools
    if (!DevTools.enabled) {
      DevTools.enable();
    }
    
    // Create UI
    this.container = document.createElement('div');
    this.container.id = 'dev-dashboard';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #000;
      color: #0f0;
      padding: 15px;
      font-family: monospace;
      z-index: 99999;
    `;
    
    document.body.appendChild(this.container);
    
    // Update display
    this.updateInterval = setInterval(() => this.update(), 1000);
    this.update();
  }
  
  update() {
    if (!this.container) return;
    
    const states = DevTools.getStates();
    const history = DevTools.getHistory();
    
    this.container.innerHTML = `
      <h3>DevTools Monitor</h3>
      <div>Status: ${DevTools.enabled ? 'ON' : 'OFF'}</div>
      <div>States: ${states.length}</div>
      <div>History: ${history.length}/${DevTools.maxHistory}</div>
      <button onclick="DevTools.clearHistory()">Clear</button>
      <button onclick="DevTools.disable(); this.closest('#dev-dashboard').remove()">
        Close
      </button>
    `;
  }
  
  hide() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.container) {
      this.container.remove();
    }
    
    DevTools.disable();
  }
}

// Usage
const dashboard = new DevDashboard();
dashboard.show();
```

 

### Example 2: Feature Flag Control

```javascript
// Feature flag system
const features = {
  get devTools() {
    return localStorage.getItem('feature_devtools') === 'true';
  },
  
  set devTools(value) {
    localStorage.setItem('feature_devtools', value.toString());
    
    if (value) {
      DevTools.enable();
      console.log('DevTools enabled via feature flag');
    } else {
      DevTools.disable();
      console.log('DevTools disabled via feature flag');
    }
  }
};

// Check on app init
if (features.devTools) {
  DevTools.enable();
}

// User can toggle via console:
// > features.devTools = true
// > features.devTools = false
```

 

### Example 3: Error-Triggered Enable

```javascript
// Auto-enable on errors
let errorCount = 0;
const MAX_ERRORS_BEFORE_DEBUG = 3;

window.addEventListener('error', (event) => {
  errorCount++;
  
  if (errorCount >= MAX_ERRORS_BEFORE_DEBUG && !DevTools.enabled) {
    console.error(`${errorCount} errors detected - enabling DevTools`);
    DevTools.enable();
    
    // Track main states
    if (window.appState) {
      DevTools.trackState(window.appState, 'AppState');
    }
    
    console.log('Use window.__REACTIVE_DEVTOOLS__ to inspect');
  }
});
```

 

### Example 4: Performance Comparison

```javascript
async function comparePerformance() {
  const state = ReactiveUtils.state({ count: 0 });
  const iterations = 10000;
  
  // Test with DevTools
  DevTools.enable();
  DevTools.trackState(state, 'Counter');
  
  console.time('with-devtools');
  for (let i = 0; i < iterations; i++) {
    state.count = i;
  }
  console.timeEnd('with-devtools');
  
  // Test without DevTools
  DevTools.disable();
  state.count = 0;
  
  console.time('without-devtools');
  for (let i = 0; i < iterations; i++) {
    state.count = i;
  }
  console.timeEnd('without-devtools');
  
  console.log('DevTools overhead: ~1-2%');
}
```

 

### Example 5: Secure Production Debug

```javascript
// Secure debug mode for production
class SecureDebug {
  static PASSWORD = 'debug_2024';  // Use secure method in real app
  
  static enable(password) {
    if (password !== this.PASSWORD) {
      console.error('Invalid password');
      return false;
    }
    
    DevTools.enable();
    console.log('Secure debug mode enabled');
    
    // Auto-disable after 10 minutes
    setTimeout(() => {
      DevTools.disable();
      console.log('Debug session expired');
    }, 10 * 60 * 1000);
    
    return true;
  }
}

// Admin can enable:
// > SecureDebug.enable('debug_2024')
```

 

## Advanced Usage

### 1. Conditional Auto-Enable

```javascript
function smartEnable() {
  const reasons = [];
  
  // Check environment
  if (import.meta.env.DEV) {
    reasons.push('development environment');
  }
  
  // Check URL
  if (window.location.search.includes('debug')) {
    reasons.push('debug parameter');
  }
  
  // Check localStorage
  if (localStorage.getItem('debug_mode') === 'true') {
    reasons.push('debug mode flag');
  }
  
  if (reasons.length > 0) {
    DevTools.enable();
    console.log('DevTools enabled:', reasons.join(', '));
    return true;
  }
  
  return false;
}
```

 

### 2. Lifecycle Events

```javascript
class DevToolsWithEvents {
  static listeners = {
    enabled: [],
    disabled: []
  };
  
  static enable() {
    if (DevTools.enabled) return;
    
    DevTools.enable();
    this.listeners.enabled.forEach(fn => fn());
  }
  
  static disable() {
    if (!DevTools.enabled) return;
    
    DevTools.disable();
    this.listeners.disabled.forEach(fn => fn());
  }
  
  static on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
}

// Usage
DevToolsWithEvents.on('enabled', () => {
  console.log('DevTools turned on!');
});

DevToolsWithEvents.on('disabled', () => {
  console.log('DevTools turned off!');
});
```

 

## Best Practices

### ✅ Do This

```javascript
// 1. Enable early in development
if (import.meta.env.DEV) {
  DevTools.enable();
}

// 2. Check before tracking
if (DevTools.enabled) {
  DevTools.trackState(state, 'MyState');
}

// 3. Disable in production
if (import.meta.env.PROD) {
  DevTools.disable();
}

// 4. Use environment detection
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  DevTools.enable();
}

// 5. Provide manual controls
window.enableDebug = () => DevTools.enable();
window.disableDebug = () => DevTools.disable();
```

### ❌ Don't Do This

```javascript
// 1. Don't enable in production
DevTools.enable();  // Always enabled - bad!

// 2. Don't assume it's enabled
DevTools.trackState(state, 'Test');  // May be ignored

// 3. Don't forget to disable
// Memory buildup over time

// 4. Don't enable repeatedly
for (let i = 0; i < 100; i++) {
  DevTools.enable();  // Wasteful
}
```

 

## Common Pitfalls

### Pitfall 1: Forgetting to Enable

```javascript
// ❌ Won't work
DevTools.trackState(state, 'MyState');  // Ignored!

// ✅ Correct
DevTools.enable();
DevTools.trackState(state, 'MyState');  // Works
```

 

### Pitfall 2: Not Disabling in Production

```javascript
// ❌ Performance overhead in production
// DevTools always enabled

// ✅ Correct
if (process.env.NODE_ENV === 'production') {
  DevTools.disable();
}
```

 

### Pitfall 3: Assuming Data is Cleared

```javascript
// ❌ History still exists after disable
DevTools.disable();
console.log(DevTools.history.length);  // Still has data!

// ✅ Clear explicitly if needed
DevTools.disable();
DevTools.clearHistory();
```

 

## Summary

**Lifecycle Methods:**
- `enable()` - Turn on debugging
- `disable()` - Turn off debugging

**Key Points:**
- ✅ Enable before tracking
- ✅ Disable preserves data
- ✅ Can toggle anytime
- ✅ Check `enabled` property
- ✅ Use environment detection

**Lifecycle Flow:**

```
App Start
    ↓
enable() [Development only]
    ↓
Track states/effects
    ↓
Make changes
    ↓
Review history
    ↓
disable() [When done]
    ↓
App continues
```

**One-Line Rule:** Call `enable()` in development, `disable()` when done or in production.

**Remember:** DevTools lifecycle is simple - on or off, with data preserved! 🎉