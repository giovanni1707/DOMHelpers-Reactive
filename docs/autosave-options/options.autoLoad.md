# `options.autoLoad` - Automatic Loading Configuration

## Quick Start (30 seconds)

```javascript
const userState = state({ name: '', email: '' });

// With autoLoad (default) - loads saved data immediately
autoSave(userState, 'user', {
  autoLoad: true  // Default behavior
});
console.log(userState.name); // 'Alice' (loaded from storage)

// Without autoLoad - starts empty
const freshState = state({ name: '', email: '' });
autoSave(freshState, 'user', {
  autoLoad: false
});
console.log(freshState.name); // '' (not loaded)

// Load manually later
freshState.$load();
console.log(freshState.name); // 'Alice' (now loaded) ✨
```

**What just happened?** You controlled whether saved data loads automatically or waits for manual loading!

  

## What is `options.autoLoad`?

`options.autoLoad` is a configuration option that **determines whether saved data is automatically loaded from storage when autoSave is initialized**.

Simply put: it's like choosing whether your app opens your last saved file automatically or shows a blank page.

Think of it as **auto-resume vs fresh start**.

  

## Syntax

```javascript
autoSave(state, key, {
  autoLoad: boolean
})
```

**Value:**
- `true` - Automatically load saved data on initialization
- `false` - Don't load, start with initial state

**Default:** `true` (auto-load enabled)

  

## Why Does This Exist?

### The Challenge: Not Always Want Previous Data

Sometimes you want a fresh start, not the previous session's data:

```javascript
// User closed app with unsaved draft
const draftState = state({ content: '' });
autoSave(draftState, 'draft');  // autoLoad: true by default

// App reopens
// Draft automatically loads
// User sees unfinished work from yesterday ❌

// But maybe they wanted to:
// - Start a new document
// - Discard the old draft
// - Have a choice to resume or start fresh
```

**What's the Real Issue?**

```
App starts
        |
        v
Auto-loads previous data
        |
        v
User might not want it
        |
        v
No choice given ❌
```

**Problems:**
❌ **Forced resume** - Can't start fresh without manual clearing  
❌ **Stale data** - Old data might be outdated or unwanted  
❌ **No user choice** - Automatic behavior can't be controlled  
❌ **Testing difficulty** - Hard to test with clean state  

### The Solution with `options.autoLoad`

```javascript
// Give user choice to resume
const draftState = state({ content: '' });

autoSave(draftState, 'draft', {
  autoLoad: false  // Don't auto-load
});

// App starts with blank slate
console.log(draftState.content); // ''

// Show "Resume draft?" prompt
if (draftState.$exists() && confirm('Resume previous draft?')) {
  draftState.$load();  // Load only if user wants it ✨
}
```

**What Just Happened?**

```
App starts
        |
        v
autoLoad: false
        |
        v
Start with initial state
        |
        v
User chooses to load or not
        |
        v
Better UX ✅
```

**Benefits:**
✅ **User control** - Choice to resume or start fresh  
✅ **Clean testing** - Easy to test with initial state  
✅ **Conditional loading** - Load based on logic  
✅ **Better UX** - Don't force old data on users  

  

## Mental Model

Think of `autoLoad: true` as **auto-opening your last document**:

```
autoLoad: true (Auto-Resume)
┌─────────────────────┐
│  App starts         │
│                     │
│  Finds saved data   │
│                     │
│  Opens it           │
│  automatically      │
│                     │
│  User sees previous │
│  session's data     │
│                     │
│  No choice given    │
└─────────────────────┘
```

Think of `autoLoad: false` as **showing a "New/Open" dialog**:

```
autoLoad: false (User Choice)
┌─────────────────────┐
│  App starts         │
│                     │
│  Shows blank slate  │
│                     │
│  "Resume draft?"    │
│  [Yes] [No]         │
│                     │
│  User decides ✨    │
│                     │
│  Better experience  │
└─────────────────────┘
```

**Key Insight:** autoLoad gives you control over when and whether to load saved data.

  

## How Does It Work?

The autoLoad option controls the initialization sequence:

### With autoLoad: true (Default)

```
autoSave() called
        |
        v
Check if data exists in storage
        |
    YES |  NO
        |   └──> Continue with initial state
        v
Load data from storage
        |
        v
Populate state object
        |
        v
State ready with saved data ✨
```

### With autoLoad: false

```
autoSave() called
        |
        v
Skip loading step
        |
        v
Keep initial state as-is
        |
        v
State ready with initial values ✨
        |
        v
Can load manually later with $load()
```

  

## Basic Usage

### Example 1: Auto-Load (Default)

```javascript
// Save user preferences
const prefs = state({ theme: 'dark', lang: 'en' });

autoSave(prefs, 'preferences', {
  autoLoad: true  // Default - loads immediately
});

// If 'preferences' exists in storage:
// prefs.theme === 'dark' (loaded value)
// prefs.lang === 'en' (loaded value)

// If 'preferences' doesn't exist:
// prefs.theme === 'dark' (initial value)
// prefs.lang === 'en' (initial value)
```

  

### Example 2: Disable Auto-Load

```javascript
const formState = state({ name: '', email: '' });

autoSave(formState, 'form', {
  autoLoad: false  // Don't load automatically
});

// State starts with initial values
console.log(formState.name);  // ''
console.log(formState.email); // ''

// Load manually when needed
if (confirm('Restore previous form data?')) {
  formState.$load();
  console.log(formState.name); // 'Alice' (loaded)
}
```

  

### Example 3: Conditional Loading

```javascript
const draftState = state({ content: '', timestamp: null });

autoSave(draftState, 'draft', {
  autoLoad: false
});

// Check if saved draft exists and is recent
if (draftState.$exists()) {
  draftState.$load();
  
  const age = Date.now() - draftState.timestamp;
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (age > oneDay) {
    // Draft too old - discard it
    console.log('Draft expired, starting fresh');
    draftState.content = '';
    draftState.timestamp = null;
  }
}
```

  

## Real-World Examples

### Example 1: Document Editor with Resume Prompt

```javascript
const editor = state({
  content: '',
  lastModified: null
});

autoSave(editor, 'document', {
  autoLoad: false,
  debounce: 1000
});

// Show resume prompt on app start
window.onload = () => {
  if (editor.$exists()) {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <h3>Resume Previous Draft?</h3>
      <p>You have an unsaved draft.</p>
      <button id="resume">Resume</button>
      <button id="discard">Start Fresh</button>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('resume').onclick = () => {
      editor.$load();
      dialog.remove();
      showEditor(editor.content);
    };
    
    document.getElementById('discard').onclick = () => {
      editor.$clear();
      dialog.remove();
      showEditor('');
    };
  } else {
    showEditor('');
  }
};
```

  

### Example 2: Game Save System

```javascript
const gameState = state({
  level: 1,
  score: 0,
  playerName: ''
});

autoSave(gameState, 'saveGame', {
  autoLoad: false
});

// Main menu
function showMainMenu() {
  const hasSave = gameState.$exists();
  
  const menu = `
    <h1>My Game</h1>
    <button onclick="newGame()">New Game</button>
    ${hasSave ? '<button onclick="continueGame()">Continue</button>' : ''}
  `;
  
  document.getElementById('menu').innerHTML = menu;
}

function newGame() {
  gameState.level = 1;
  gameState.score = 0;
  gameState.playerName = prompt('Enter your name:');
  startGame();
}

function continueGame() {
  gameState.$load();
  startGame();
}
```

  

### Example 3: Settings with Migration

```javascript
const settings = state({
  version: '2.0',
  theme: 'light',
  features: []
});

autoSave(settings, 'settings', {
  autoLoad: false
});

// Load and migrate if needed
if (settings.$exists()) {
  settings.$load();
  
  // Check version
  if (!settings.version || settings.version < '2.0') {
    console.log('Migrating settings from old version...');
    
    // Perform migration
    settings.version = '2.0';
    settings.features = settings.features || [];
    
    // Save migrated settings
    settings.$save();
  }
} else {
  // No settings - use defaults
  console.log('Using default settings');
}
```

  

### Example 4: Multi-User Application

```javascript
let currentUser = null;

const userData = state({
  name: '',
  preferences: {}
});

autoSave(userData, 'userData', {
  autoLoad: false  // Don't auto-load - user not logged in yet
});

function login(userId) {
  currentUser = userId;
  
  // Load user-specific data
  const key = `user_${userId}`;
  
  if (localStorage.getItem(key)) {
    // User has data - load it
    userData.$load();
    console.log(`Welcome back, ${userData.name}!`);
  } else {
    // New user - setup account
    userData.name = prompt('Enter your name:');
    userData.$save();
  }
}
```

  

### Example 5: Testing and Development

```javascript
const appState = state({
  debug: false,
  testMode: false,
  data: []
});

// Disable auto-load in development
const isDev = process.env.NODE_ENV === 'development';

autoSave(appState, 'appState', {
  autoLoad: !isDev  // Load in production, not in development
});

// In development, always start with clean state
if (isDev) {
  console.log('Dev mode: Starting with clean state');
  appState.debug = true;
  appState.testMode = true;
}
```

  

## Common Patterns

### Pattern 1: Prompt Before Loading

```javascript
const state = state({ data: {} });

autoSave(state, 'data', {
  autoLoad: false
});

// Check if user wants to restore
if (state.$exists()) {
  const shouldLoad = confirm('Restore previous session?');
  
  if (shouldLoad) {
    state.$load();
  }
}
```

  

### Pattern 2: Load After Authentication

```javascript
const userPrefs = state({ theme: 'light' });

autoSave(userPrefs, 'prefs', {
  autoLoad: false
});

async function authenticate() {
  const user = await login();
  
  if (user) {
    // Now load user preferences
    userPrefs.$load();
  }
}
```

  

### Pattern 3: Selective Loading

```javascript
const appData = state({
  critical: {},
  temporary: {}
});

autoSave(appData, 'data', {
  autoLoad: false,
  onLoad: (data) => {
    // Only load critical data
    return {
      critical: data.critical,
      temporary: {}  // Always start fresh
    };
  }
});

// Load with filter
appData.$load();
```

  

### Pattern 4: Lazy Loading

```javascript
const heavyData = state({ items: [] });

autoSave(heavyData, 'items', {
  autoLoad: false  // Don't load immediately
});

// Load when needed
document.getElementById('show-items').onclick = () => {
  if (heavyData.items.length === 0) {
    heavyData.$load();
  }
  
  displayItems(heavyData.items);
};
```

  

### Pattern 5: Version-Based Loading

```javascript
const APP_VERSION = '2.0';

const state = state({
  version: APP_VERSION,
  data: {}
});

autoSave(state, 'data', {
  autoLoad: false
});

// Only load if versions match
if (state.$exists()) {
  state.$load();
  
  if (state.version !== APP_VERSION) {
    console.log('Version mismatch - starting fresh');
    state.data = {};
    state.version = APP_VERSION;
  }
}
```

  

### Pattern 6: Performance Optimization

```javascript
const largeState = state({ items: [] });

// Don't auto-load large data on mobile
const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);

autoSave(largeState, 'data', {
  autoLoad: !isMobile
});

if (isMobile) {
  // Load on user action instead
  document.getElementById('load-data').onclick = () => {
    showSpinner();
    largeState.$load();
    hideSpinner();
  };
}
```

  

## When to Use Each

### Use autoLoad: true (Default) For:

✅ **User preferences** - Always want saved settings  
✅ **Authentication tokens** - Need them immediately  
✅ **Shopping cart** - User expects cart to persist  
✅ **App configuration** - Required for app to work  
✅ **Recent activity** - Show user what they were doing  

### Use autoLoad: false For:

✅ **Drafts** - Give user choice to resume  
✅ **Temporary data** - Might be stale  
✅ **Large datasets** - Improve startup performance  
✅ **Multi-user apps** - Load after authentication  
✅ **Testing** - Need clean state  
✅ **Version migrations** - Need to check/transform data first  

  

## Summary

**What is `options.autoLoad`?**  
A configuration option that determines whether saved data is automatically loaded from storage during initialization.

**Why use it?**
- ✅ User choice to resume or start fresh
- ✅ Better UX with prompts
- ✅ Conditional loading based on logic
- ✅ Performance optimization
- ✅ Testing with clean state

**Key Takeaway:**

```
autoLoad: true           autoLoad: false
      |                        |
Auto-load data          Start with defaults
      |                        |
No user choice          User/logic decides
      |                        |
Quick resume ✅         More control ✅
```

**One-Line Rule:** Use `autoLoad: false` when you need control over when/whether to load saved data.

**Best Practices:**
- Use `true` for essential data (preferences, auth)
- Use `false` for drafts and temporary data
- Always check `$exists()` before loading
- Show prompts to give users choice

**Remember:** autoLoad gives you control over the loading experience! 🎉