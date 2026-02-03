# Understanding `watch()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to run code when specific state properties change? Here's how:

```js
// Create reactive state
const user = state({
  name: 'John',
  age: 25
});

// Watch for changes and react to them
watch(user, {
  name(newValue, oldValue) {
    console.log(`Name changed from "${oldValue}" to "${newValue}"`);
  },
  age(newValue, oldValue) {
    console.log(`Age changed from ${oldValue} to ${newValue}`);
  }
});

// Make changes—watchers automatically execute!
user.name = 'Jane';
// Logs: Name changed from "John" to "Jane"

user.age = 26;
// Logs: Age changed from 25 to 26
```

**That's it!** The `watch()` function lets you respond to specific property changes with custom callbacks.

 

## What is `watch()`?

`watch()` is a function that **monitors specific properties in reactive state** and executes callback functions when those properties change. It's designed for responding to changes with side effects or custom logic.

**A watcher:**
- Monitors specific properties you choose
- Executes your callback when the property changes
- Provides both old and new values
- Can track multiple properties at once
- Returns a cleanup function to stop watching

Think of it as **setting up custom notifications** for state changes - whenever specific data changes, your code automatically runs.

 

## Syntax

```js
// Using the full namespace
watch(state, definitions)

// Or using ReactiveUtils namespace
ReactiveUtils.watch(state, definitions)
```

**Parameters:**
- `state` - The reactive state object to watch
- `definitions` - An object where each key is a property name to watch, and each value is a callback function

**Returns:**
- A cleanup function that stops all watchers when called

**Example:**
```js
const cleanup = watch(user, {
  name(newValue, oldValue) {
    console.log(`Name: ${oldValue} → ${newValue}`);
  }
});

// Later, stop watching
cleanup();
```

 

## Why Does This Exist?

### The Challenge with Plain JavaScript

In vanilla JavaScript, there's no built-in way to detect when a variable changes:

```javascript
// Plain JavaScript approach
let userName = 'John';
let loggedChanges = [];

// You have to manually call a function after every change
function updateUserName(newName) {
  const oldName = userName;
  userName = newName;

  // Manually execute side effects
  console.log(`Name changed: ${oldName} → ${newName}`);
  loggedChanges.push({ old: oldName, new: newName });
  saveToServer(newName);
}

// You must remember to use the function
updateUserName('Jane'); // ✅ Logged and saved

// But direct changes are silent
userName = 'Bob'; // ❌ No logging, no saving, no side effects!
```

**Problems with this approach:**
❌ Must manually wrap every change in a function
❌ Easy to forget and modify directly, causing missed side effects
❌ Cannot watch changes made by other code
❌ Tedious to maintain multiple notification callbacks
❌ Code becomes scattered and hard to follow

### What Situation Is This Designed For?

Applications frequently need to respond to specific data changes:
- Logging changes for debugging or audit trails
- Saving data to a server when it changes
- Updating related state when a property changes
- Triggering animations or UI updates
- Validating data when input changes
- Synchronizing data between different parts of the app

Manually coordinating these responses is error-prone and tedious. `watch()` is designed specifically to make this automatic and reliable.

### How Does `watch()` Help?

With `watch()`, you declare what should happen when properties change:

```javascript
const user = state({
  name: 'John',
  email: 'john@example.com'
});

// Set up watchers
watch(user, {
  name(newValue, oldValue) {
    console.log(`Name changed: ${oldValue} → ${newValue}`);
    logChanges.push({ property: 'name', old: oldValue, new: newValue });
  },
  email(newValue, oldValue) {
    console.log(`Email changed: ${oldValue} → ${newValue}`);
    validateEmail(newValue);
    saveToServer({ email: newValue });
  }
});

// Just change the values—watchers execute automatically! ✨
user.name = 'Jane';
// Automatically logs and records the change

user.email = 'jane@example.com';
// Automatically validates and saves to server
```

**Benefits:**
✅ Changes are automatically detected
✅ Side effects execute automatically
✅ No manual function wrappers needed
✅ Impossible to forget to trigger callbacks
✅ Centralized change handling
✅ Clean separation of concerns

### When Does `watch()` Shine?

This method is particularly well-suited when:
- You need to respond to specific property changes with custom logic
- Side effects should run when data changes (logging, API calls, etc.)
- You want to track old and new values
- You need fine-grained control over which properties trigger which actions
- You're building features like auto-save, validation, or synchronization

 

## Mental Model

Think of `watch()` like **motion-activated security cameras**:

```
Regular Variables (No Surveillance):
┌─────────────────┐
│  name: "John"   │ ← Changes happen silently
└─────────────────┘
   No detection
   No alerts
   No recording

Reactive State with Watchers (Monitored Area):
┌─────────────────────────┐
│  name: "John"           │ ←─── Watcher installed
└─────────────────────────┘
         │
         ▼
   ┌─────────────┐
   │  Watcher    │
   │  Callback   │
   └──────┬──────┘
          │
          ▼
When name changes to "Jane":
  ✓ Change detected
  ✓ Old value: "John"
  ✓ New value: "Jane"
  ✓ Callback executes
  ✓ Side effects run
  ✓ Everything is logged
```

**Key Insight:** Just like security cameras automatically record when they detect motion, watchers automatically execute your code when they detect property changes. You set them up once, and they monitor continuously.

 

## How Does It Work?

### The Magic: Reactive Tracking

When you set up a watcher, the reactive system monitors the specific property:

```
1️⃣ Set up watcher
   ↓
watch(user, {
  name(newValue, oldValue) {
    console.log(`${oldValue} → ${newValue}`);
  }
});
   ↓
System registers: "Watch user.name"
Stores current value: "John"

2️⃣ Property changes
   ↓
user.name = 'Jane';
   ↓
Proxy detects change to 'name'
   ↓
Old value: "John"
New value: "Jane"
   ↓
Callback executes automatically!

3️⃣ Subsequent changes
   ↓
user.name = 'Bob';
   ↓
Old value: "Jane" (previous value)
New value: "Bob"
   ↓
Callback executes again!
```

### Under the Hood

```
watch(state, { name(new, old) {...} })
         │
         ▼
┌────────────────────────┐
│  Create Effect That    │
│  Reads the Property    │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Store Current Value   │
│  as "old"              │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  When Property Changes │
│  Effect Re-runs        │
└───────────┬────────────┘
            │
            ▼
Compare old vs new:
  → If different, call callback
  → Update stored "old" value
  → Ready for next change
```

**What happens:**

1️⃣ When you call `watch()`, it creates an effect for each property
2️⃣ The effect reads the property and stores its current value
3️⃣ When the property changes, the effect automatically re-runs
4️⃣ It compares old vs new values
5️⃣ If they're different, your callback executes with both values
6️⃣ The new value becomes the old value for the next change

This is completely automatic - you just define what should happen, and the reactive system handles the monitoring!

 

## Basic Usage

### Watching a Single Property

The simplest way to use `watch()` is to watch one property:

```js
const counter = state({
  count: 0
});

watch(counter, {
  count(newValue, oldValue) {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
  }
});

counter.count = 5;
// Logs: Count changed from 0 to 5

counter.count = 10;
// Logs: Count changed from 5 to 10
```

### Understanding the Callback Parameters

The callback receives two parameters:

```js
const user = state({
  name: 'John'
});

watch(user, {
  name(newValue, oldValue) {
    // newValue: the current (new) value
    // oldValue: the previous (old) value
    console.log(`Old: ${oldValue}, New: ${newValue}`);
  }
});

user.name = 'Jane';
// Logs: Old: John, New: Jane

user.name = 'Bob';
// Logs: Old: Jane, New: Bob
```

### Watchers Execute on Change, Not on Setup

Watchers only execute when the property *changes*, not when you set them up:

```js
const user = state({
  name: 'John'
});

watch(user, {
  name(newValue, oldValue) {
    console.log('Name changed!');
  }
});

// Nothing logged yet - watcher is just set up

user.name = 'Jane';
// NOW it logs: "Name changed!"
```

 

## Watching Multiple Properties

You can watch multiple properties with one call:

```js
const form = state({
  username: '',
  email: '',
  password: ''
});

watch(form, {
  username(newValue, oldValue) {
    console.log(`Username: ${oldValue} → ${newValue}`);
  },
  email(newValue, oldValue) {
    console.log(`Email: ${oldValue} → ${newValue}`);
  },
  password(newValue, oldValue) {
    console.log(`Password changed`);
    // Don't log password values for security
  }
});

form.username = 'john_doe';
// Logs: Username:  → john_doe

form.email = 'john@example.com';
// Logs: Email:  → john@example.com

form.password = 'secret123';
// Logs: Password changed
```

Each watcher is independent and only executes for its specific property:

```js
const settings = state({
  theme: 'light',
  fontSize: 14,
  notifications: true
});

watch(settings, {
  theme(newValue) {
    document.body.className = `theme-${newValue}`;
  },
  fontSize(newValue) {
    document.body.style.fontSize = `${newValue}px`;
  },
  notifications(newValue) {
    console.log(`Notifications: ${newValue ? 'enabled' : 'disabled'}`);
  }
});

// Only the theme watcher executes
settings.theme = 'dark';

// Only the fontSize watcher executes
settings.fontSize = 16;
```

 

## Accessing Old and New Values

### Using Both Values

Watchers provide both old and new values, which is useful for comparisons:

```js
const inventory = state({
  stockLevel: 100
});

watch(inventory, {
  stockLevel(newValue, oldValue) {
    const change = newValue - oldValue;

    if (change > 0) {
      console.log(`Stock increased by ${change} units`);
    } else if (change < 0) {
      console.log(`Stock decreased by ${Math.abs(change)} units`);
    }

    if (newValue < 10 && oldValue >= 10) {
      console.log('⚠️ LOW STOCK ALERT!');
    }
  }
});

inventory.stockLevel = 120;
// Logs: Stock increased by 20 units

inventory.stockLevel = 5;
// Logs: Stock decreased by 115 units
// Logs: ⚠️ LOW STOCK ALERT!
```

### Conditional Logic Based on Changes

```js
const userStatus = state({
  isOnline: false
});

watch(userStatus, {
  isOnline(newValue, oldValue) {
    if (newValue && !oldValue) {
      console.log('User came online');
      sendNotification('Welcome back!');
    } else if (!newValue && oldValue) {
      console.log('User went offline');
      saveCurrentWork();
    }
  }
});

userStatus.isOnline = true;
// Logs: User came online
// Sends notification

userStatus.isOnline = false;
// Logs: User went offline
// Saves work
```

### Tracking Change History

```js
const document = state({
  content: ''
});

const changeHistory = [];

watch(document, {
  content(newValue, oldValue) {
    changeHistory.push({
      timestamp: new Date(),
      old: oldValue,
      new: newValue,
      changeSize: newValue.length - oldValue.length
    });

    console.log(`Document edited. History: ${changeHistory.length} changes`);
  }
});

document.content = 'Hello';
document.content = 'Hello World';
document.content = 'Hello World!';

console.log(changeHistory);
// Array of 3 change records with timestamps and values
```

 

## Watching Computed Properties

You can watch computed properties just like regular properties:

```js
const cart = state({
  items: [
    { price: 10, quantity: 2 },
    { price: 25, quantity: 1 }
  ]
});

computed(cart, {
  total() {
    return this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
});

watch(cart, {
  total(newValue, oldValue) {
    console.log(`Total changed: $${oldValue} → $${newValue}`);

    if (newValue > 100) {
      console.log('🎉 You qualify for free shipping!');
    }
  }
});

// Add an item
cart.items.push({ price: 50, quantity: 1 });
// Logs: Total changed: $45 → $95

// Add another item
cart.items.push({ price: 20, quantity: 1 });
// Logs: Total changed: $95 → $115
// Logs: 🎉 You qualify for free shipping!
```

 

## Watching with Custom Functions

In addition to watching property names, you can watch custom expressions:

```js
const user = state({
  firstName: 'John',
  lastName: 'Doe',
  age: 25
});

// Watch a computed expression
watch(user, {
  // This watches any change to firstName or lastName
  fullName(newValue, oldValue) {
    console.log(`Full name: ${oldValue} → ${newValue}`);
  }
});

// If you need to watch a custom function, use a different approach
// with the functional form (see advanced patterns)
```

**Note:** The standard `watch()` syntax watches specific property names. For watching custom expressions or multiple properties together, you may want to use `effect()` instead (covered in the effect documentation).

 

## Cleanup and Disposal

### Stopping Watchers

`watch()` returns a cleanup function that stops all the watchers:

```js
const user = state({
  name: 'John'
});

// Set up watcher and save cleanup function
const stopWatching = watch(user, {
  name(newValue, oldValue) {
    console.log(`Name: ${oldValue} → ${newValue}`);
  }
});

user.name = 'Jane';
// Logs: Name: John → Jane

// Stop watching
stopWatching();

user.name = 'Bob';
// Nothing logged - watcher is stopped
```

### Cleanup in Components

This is useful when creating components that should clean up after themselves:

```js
function createUserComponent(userData) {
  const user = state(userData);

  const cleanup = watch(user, {
    name(newValue) {
      document.getElementById('userName').textContent = newValue;
    },
    email(newValue) {
      document.getElementById('userEmail').textContent = newValue;
    }
  });

  return {
    state: user,
    destroy() {
      cleanup(); // Stop all watchers
      console.log('Component destroyed');
    }
  };
}

const component = createUserComponent({ name: 'John', email: 'john@example.com' });

// Later, when removing the component
component.destroy();
```

### Multiple Cleanup Functions

If you set up watchers in multiple places, collect the cleanup functions:

```js
const app = state({
  theme: 'light',
  language: 'en',
  notifications: true
});

const cleanups = [];

cleanups.push(watch(app, {
  theme(newValue) {
    applyTheme(newValue);
  }
}));

cleanups.push(watch(app, {
  language(newValue) {
    loadTranslations(newValue);
  }
}));

cleanups.push(watch(app, {
  notifications(newValue) {
    toggleNotifications(newValue);
  }
}));

// Later, stop all watchers
function cleanup() {
  cleanups.forEach(fn => fn());
}
```

 

## Real-World Examples

### Example 1: Auto-Save to Server

```js
const document = state({
  title: '',
  content: '',
  lastSaved: null
});

let saveTimeout;

watch(document, {
  title(newValue) {
    debouncedSave();
  },
  content(newValue) {
    debouncedSave();
  }
});

function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    console.log('Saving to server...');
    await saveToServer({
      title: document.title,
      content: document.content
    });
    document.lastSaved = new Date();
    console.log('Saved successfully!');
  }, 1000); // Wait 1 second after last change
}

// User types...
document.title = 'My Document';
document.content = 'Hello world';
// After 1 second of inactivity, automatically saves
```

### Example 2: Form Validation

```js
const form = state({
  email: '',
  password: '',
  confirmPassword: ''
});

const errors = state({
  email: '',
  password: '',
  confirmPassword: ''
});

watch(form, {
  email(newValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newValue) {
      errors.email = '';
    } else if (!emailRegex.test(newValue)) {
      errors.email = 'Please enter a valid email address';
    } else {
      errors.email = '';
    }
  },

  password(newValue) {
    if (!newValue) {
      errors.password = '';
    } else if (newValue.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else {
      errors.password = '';
    }

    // Re-validate confirm password when password changes
    if (form.confirmPassword) {
      validateConfirmPassword();
    }
  },

  confirmPassword(newValue) {
    validateConfirmPassword();
  }
});

function validateConfirmPassword() {
  if (!form.confirmPassword) {
    errors.confirmPassword = '';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    errors.confirmPassword = '';
  }
}

// Auto-update error messages in UI
effect(() => {
  document.getElementById('emailError').textContent = errors.email;
  document.getElementById('passwordError').textContent = errors.password;
  document.getElementById('confirmError').textContent = errors.confirmPassword;
});
```

### Example 3: Analytics and Tracking

```js
const analytics = state({
  currentPage: '/home',
  searchQuery: '',
  filterSettings: {
    category: 'all',
    priceRange: 'any'
  }
});

const eventLog = [];

watch(analytics, {
  currentPage(newValue, oldValue) {
    const event = {
      type: 'page_view',
      timestamp: new Date(),
      from: oldValue,
      to: newValue
    };

    eventLog.push(event);
    sendToAnalytics(event);
    console.log(`Page view: ${oldValue} → ${newValue}`);
  },

  searchQuery(newValue, oldValue) {
    if (newValue) {
      const event = {
        type: 'search',
        timestamp: new Date(),
        query: newValue,
        previousQuery: oldValue
      };

      eventLog.push(event);
      sendToAnalytics(event);
      console.log(`Search: "${newValue}"`);
    }
  }
});

// User navigates
analytics.currentPage = '/products';
// Logs and tracks page view

// User searches
analytics.searchQuery = 'laptop';
// Logs and tracks search
```

### Example 4: State Synchronization

```js
const localSettings = state({
  theme: 'light',
  fontSize: 14,
  language: 'en'
});

// Sync to localStorage whenever settings change
watch(localSettings, {
  theme(newValue) {
    localStorage.setItem('theme', newValue);
    console.log(`Theme saved: ${newValue}`);
  },

  fontSize(newValue) {
    localStorage.setItem('fontSize', newValue.toString());
    console.log(`Font size saved: ${newValue}`);
  },

  language(newValue) {
    localStorage.setItem('language', newValue);
    console.log(`Language saved: ${newValue}`);
  }
});

// Load from localStorage on startup
localSettings.theme = localStorage.getItem('theme') || 'light';
localSettings.fontSize = parseInt(localStorage.getItem('fontSize')) || 14;
localSettings.language = localStorage.getItem('language') || 'en';

// Changes automatically sync
localSettings.theme = 'dark';
// Automatically saved to localStorage
```

### Example 5: Notification System

```js
const notifications = state({
  unreadCount: 0,
  lastNotification: null
});

watch(notifications, {
  unreadCount(newValue, oldValue) {
    // Update badge
    const badge = document.getElementById('notificationBadge');
    badge.textContent = newValue;
    badge.style.display = newValue > 0 ? 'block' : 'none';

    // Update page title
    if (newValue > 0) {
      document.title = `(${newValue}) Messages - MyApp`;
    } else {
      document.title = 'MyApp';
    }

    // Play sound for new notifications
    if (newValue > oldValue) {
      playNotificationSound();
    }

    console.log(`Unread notifications: ${oldValue} → ${newValue}`);
  },

  lastNotification(newValue) {
    if (newValue) {
      showToast(newValue.message);
      notifications.unreadCount++;
    }
  }
});

// Simulate receiving notifications
function receiveNotification(message) {
  notifications.lastNotification = {
    id: Date.now(),
    message: message,
    timestamp: new Date()
  };
}

receiveNotification('You have a new message!');
// Updates badge, title, shows toast, plays sound
```

### Example 6: Debug Logger

```js
const appState = state({
  user: { name: 'John', role: 'admin' },
  session: { token: 'abc123', expiresAt: null },
  ui: { loading: false, error: null }
});

// Development mode: log all changes
if (process.env.NODE_ENV === 'development') {
  watch(appState, {
    user(newValue, oldValue) {
      console.log('👤 User changed:', { old: oldValue, new: newValue });
    },
    session(newValue, oldValue) {
      console.log('🔐 Session changed:', { old: oldValue, new: newValue });
    },
    ui(newValue, oldValue) {
      console.log('🎨 UI changed:', { old: oldValue, new: newValue });
    }
  });
}
```

 

## Common Pitfalls

### Pitfall #1: Infinite Loops (Modifying Watched Property in Watcher)

❌ **Wrong:**
```js
const counter = state({
  count: 0
});

watch(counter, {
  count(newValue) {
    // ❌ This creates an infinite loop!
    counter.count = newValue + 1;
  }
});

counter.count = 1;
// Infinite loop: change triggers watcher, which changes it again, etc.
```

✅ **Correct:**
```js
const counter = state({
  count: 0
});

const derived = state({
  doubled: 0
});

watch(counter, {
  count(newValue) {
    // ✅ Modify a different property
    derived.doubled = newValue * 2;
  }
});

counter.count = 1;
// derived.doubled becomes 2 (no loop)
```

**What's happening:**
- Never modify the same property you're watching inside the watcher
- This creates infinite loops
- Modify different properties or use computed properties instead

 

### Pitfall #2: Forgetting That Watchers Don't Run on Setup

❌ **Wrong Expectation:**
```js
const user = state({
  name: 'John'
});

watch(user, {
  name(newValue) {
    updateUI(newValue);
  }
});

// ❌ UI not updated yet - watcher hasn't run
```

✅ **Correct:**
```js
const user = state({
  name: 'John'
});

watch(user, {
  name(newValue) {
    updateUI(newValue);
  }
});

// ✅ Manually trigger initial update
updateUI(user.name);

// Or change the value to trigger the watcher
user.name = user.name; // Forces watcher to run
```

**What's happening:**
- Watchers only execute when values *change*
- They don't run during setup
- If you need immediate execution, call your function manually or use `effect()` instead

 

### Pitfall #3: Not Cleaning Up Watchers

❌ **Wrong:**
```js
function createComponent() {
  const state = ReactiveUtils.state({ data: [] });

  // Set up watcher but never clean it up
  watch(state, {
    data(newValue) {
      renderUI(newValue);
    }
  });

  return state;
}

// Create many components
for (let i = 0; i < 100; i++) {
  createComponent();
}
// ❌ Memory leak: 100 watchers still running!
```

✅ **Correct:**
```js
function createComponent() {
  const state = ReactiveUtils.state({ data: [] });

  // Save cleanup function
  const cleanup = watch(state, {
    data(newValue) {
      renderUI(newValue);
    }
  });

  return {
    state,
    destroy: cleanup  // Expose cleanup
  };
}

// Create and destroy properly
const components = [];
for (let i = 0; i < 100; i++) {
  components.push(createComponent());
}

// Later, clean up
components.forEach(comp => comp.destroy());
```

**What's happening:**
- Always clean up watchers when they're no longer needed
- Save and call the cleanup function returned by `watch()`
- This prevents memory leaks in long-running applications

 

### Pitfall #4: Watching Non-Existent Properties

❌ **Wrong:**
```js
const user = state({
  name: 'John'
});

watch(user, {
  email(newValue) {
    console.log('Email changed:', newValue);
  }
});

user.email = 'john@example.com';
// ❌ May not work as expected - property didn't exist initially
```

✅ **Correct:**
```js
const user = state({
  name: 'John',
  email: ''  // ✅ Initialize the property
});

watch(user, {
  email(newValue) {
    console.log('Email changed:', newValue);
  }
});

user.email = 'john@example.com';
// ✅ Works correctly
```

**What's happening:**
- It's best to initialize all properties you plan to watch
- While the reactive system can handle dynamic properties, explicitly initializing them is clearer and more reliable

 

### Pitfall #5: Complex Logic in Watchers

❌ **Wrong:**
```js
const app = state({
  user: null,
  products: [],
  cart: []
});

watch(app, {
  user(newValue) {
    // ❌ Too much logic in watcher
    if (newValue) {
      fetchUserPreferences(newValue.id);
      loadUserOrders(newValue.id);
      updateRecommendations(newValue.id);
      syncCartWithServer(newValue.id);
      initializeAnalytics(newValue.id);
      // ... more logic
    }
  }
});
```

✅ **Correct:**
```js
const app = state({
  user: null,
  products: [],
  cart: []
});

watch(app, {
  user(newValue) {
    // ✅ Delegate to clear, focused functions
    if (newValue) {
      onUserLogin(newValue);
    } else {
      onUserLogout();
    }
  }
});

function onUserLogin(user) {
  fetchUserPreferences(user.id);
  loadUserOrders(user.id);
  updateRecommendations(user.id);
  syncCartWithServer(user.id);
  initializeAnalytics(user.id);
}

function onUserLogout() {
  // Clear user-specific data
}
```

**What's happening:**
- Keep watcher callbacks simple and focused
- Delegate complex logic to separate functions
- This makes code more readable and testable

 

## Summary

**What is `watch()`?**

`watch()` monitors specific properties in reactive state and executes callback functions when those properties change, providing both old and new values.

 

**Why use `watch()` instead of manual callbacks?**

- Automatic detection of property changes
- No manual function wrappers needed
- Access to both old and new values
- Centralized change handling
- Impossible to forget to trigger callbacks
- Clean separation of concerns

 

**Key Points to Remember:**

1️⃣ **Watchers run on change, not setup** - They execute when values change, not when defined

2️⃣ **Returns cleanup function** - Always save and call it when done

3️⃣ **Provides old and new values** - Both are passed to your callback

4️⃣ **Avoid infinite loops** - Don't modify the watched property inside its watcher

5️⃣ **Initialize properties** - Define properties before watching them

6️⃣ **Keep callbacks simple** - Delegate complex logic to separate functions

7️⃣ **Clean up when done** - Prevent memory leaks by stopping watchers

 

**Mental Model:** Think of `watch()` like **motion-activated security cameras** - they monitor specific areas (properties) and automatically record (execute callbacks) when they detect changes. You install them once, and they work continuously until you remove them.

 

**Quick Reference:**

```js
// Create state
const user = state({
  name: 'John',
  email: 'john@example.com'
});

// Set up watchers
const cleanup = watch(user, {
  name(newValue, oldValue) {
    console.log(`Name: ${oldValue} → ${newValue}`);
  },
  email(newValue, oldValue) {
    console.log(`Email: ${oldValue} → ${newValue}`);
    saveToServer(newValue);
  }
});

// Changes trigger watchers automatically
user.name = 'Jane';
user.email = 'jane@example.com';

// Stop watching when done
cleanup();
```

 

**Remember:** `watch()` is your tool for responding to specific property changes with custom side effects. It provides automatic change detection and gives you access to both old and new values! ✨
