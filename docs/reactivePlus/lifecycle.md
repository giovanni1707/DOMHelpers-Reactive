# Lifecycle & Cleanup - Managing Memory and Resources

## Quick Start (30 seconds)

```javascript
const counter = state({ value: 0 });

// Effects return a cleanup function
const stopEffect = effect(() => {
  Elements.count.textContent = counter.value;
});

// Later, when you're done:
stopEffect(); // Effect stops running, no memory leak!

// Or use cleanup for state
cleanup(counter); // Removes all effects watching this state
```

**That's it.** Every effect returns a cleanup function. Call it when you're done to prevent memory leaks.

 

## What is Lifecycle Management?

**Lifecycle management** is about properly creating and destroying reactive resources. Just like closing a file after reading it, you need to "close" effects and watchers when they're no longer needed.

Think of it as **cleaning up after yourself**. When a component unmounts, a modal closes, or a page changes — you need to stop effects and free memory.

**In practical terms:** Without cleanup, effects keep running forever, consuming memory and CPU even when they're no longer visible or needed.

 

## Why Does This Exist?

### The Problem Without Cleanup

```javascript
// ❌ Memory leak - effect never stops
function showModal() {
  const modalState = state({ isOpen: true, content: '' });

  effect(() => {
    Elements.modalContent.textContent = modalState.content;
    // This effect runs FOREVER, even after modal is closed!
  });

  modalState.isOpen = true;
}

// Call this 100 times and you have 100 effects running!
for (let i = 0; i < 100; i++) {
  showModal();
  closeModal(); // Effects still running in background!
}
```

**What's happening:**

```
Modal opened → Effect created
       ↓
Modal closed → Effect still running!
       ↓
Modal opened → Another effect created
       ↓
Modal closed → Two effects running!
       ↓
Repeat 100x → 100 effects consuming memory!
```

**Problems:**
- ❌ Memory keeps growing
- ❌ Old effects still run on state changes
- ❌ Performance degrades over time
- ❌ Potential bugs from stale effects

### The Solution with Cleanup

```javascript
// ✅ Proper cleanup - no memory leaks
function showModal() {
  const modalState = state({ isOpen: true, content: '' });

  const stopEffect = effect(() => {
    Elements.modalContent.textContent = modalState.content;
  });

  // Return cleanup function
  return () => {
    stopEffect(); // Stop the effect
    cleanup(modalState); // Clean up state
  };
}

// Usage
const closeModal = showModal();
// ... user interacts with modal ...
closeModal(); // All effects stopped, memory freed! ✨
```

**Benefits:**
- ✅ No memory leaks
- ✅ Effects properly disposed
- ✅ Performance stays consistent
- ✅ Clean resource management

 

## Mental Model: Hotel Room Checkout

Think of lifecycle like **a hotel stay**:

**Without Checkout (Memory Leak):**
```
┌─────────────────────────────────────┐
│  Guest 1 checks in                  │
│  Guest 1 leaves... but room still   │
│    booked!                          │
│                                     │
│  Guest 2 checks in                  │
│  Guest 2 leaves... another room     │
│    still booked!                    │
│                                     │
│  100 guests later:                  │
│  100 rooms "occupied" but empty!    │
│  Hotel at "capacity" with no guests │
└─────────────────────────────────────┘
```

**With Checkout (Proper Cleanup):**
```
┌─────────────────────────────────────┐
│  Guest 1 checks in                  │
│  Guest 1 checks out → Room freed!   │
│                                     │
│  Guest 2 checks in                  │
│  Guest 2 checks out → Room freed!   │
│                                     │
│  100 guests later:                  │
│  All rooms available, no waste! ✨   │
└─────────────────────────────────────┘
```

**Cleanup = Checkout**: Free resources when done.

 

## Syntax

### Effect Cleanup

```javascript
// effect() returns a cleanup function
const stopEffect = effect(() => {
  // Your reactive code
});

// Call to stop the effect
stopEffect();
```

### Watch Cleanup

```javascript
// watch() returns a cleanup function
const stopWatch = watch(myState, 'property', (newValue, oldValue) => {
  console.log('Changed:', oldValue, '→', newValue);
});

// Call to stop watching
stopWatch();
```

### State Cleanup

```javascript
// Clean up all effects for a state
cleanup(myState);
```

### Component Cleanup

```javascript
// Destroy a component and its resources
destroy(myComponent);
```

### Cleanup Collector

```javascript
// Collect multiple cleanups
const collector = ReactiveCleanup.collector();

collector.add(effect(() => { /* ... */ }));
collector.add(watch(state, 'prop', () => { /* ... */ }));

// Clean up all at once
collector.cleanup();
```

 

## Basic Usage

### Example 1: Single Effect Cleanup

```javascript
const counter = state({ value: 0 });

// Create effect and save cleanup function
const stopCounting = effect(() => {
  console.log('Count:', counter.value);
  Elements.count.textContent = counter.value;
});

// Effect runs when state changes
counter.value = 1; // Logs "Count: 1"
counter.value = 2; // Logs "Count: 2"

// Stop the effect
stopCounting();

// Effect no longer runs
counter.value = 3; // Nothing logged, no DOM update
```

 

### Example 2: Watch Cleanup

```javascript
const user = state({ name: 'John', email: 'john@example.com' });

// Watch specific property
const stopWatchingName = watch(user, 'name', (newName, oldName) => {
  console.log(`Name changed: ${oldName} → ${newName}`);
  notifyNameChange(newName);
});

// Watch runs on changes
user.name = 'Jane'; // Logs "Name changed: John → Jane"

// Stop watching
stopWatchingName();

// Watch no longer runs
user.name = 'Bob'; // Nothing logged
```

 

### Example 3: State Cleanup

```javascript
const formState = state({
  email: '',
  password: '',
  errors: {}
});

// Multiple effects watching this state
effect(() => {
  Elements.emailInput.value = formState.email;
});

effect(() => {
  Elements.passwordInput.value = formState.password;
});

effect(() => {
  Elements.errorDisplay.textContent = JSON.stringify(formState.errors);
});

// Clean up ALL effects watching this state
cleanup(formState);

// None of the effects run anymore
formState.email = 'test@test.com'; // No DOM updates
```

 

### Example 4: Component Destroy

```javascript
const userCard = component({
  state: { name: '', avatar: '' },

  onMount() {
    effect(() => {
      Elements.userName.textContent = this.name;
    });
  },

  onDestroy() {
    console.log('UserCard destroyed');
  }
});

// Use the component
userCard.name = 'Alice';

// Destroy when done
destroy(userCard);
// Calls onDestroy, stops all effects, frees memory
```

 

### Example 5: Cleanup Collector

```javascript
function createDashboard() {
  const collector = ReactiveCleanup.collector();

  const stats = state({ users: 0, orders: 0, revenue: 0 });

  // Add all cleanups to collector
  collector.add(effect(() => {
    Elements.userCount.textContent = stats.users;
  }));

  collector.add(effect(() => {
    Elements.orderCount.textContent = stats.orders;
  }));

  collector.add(effect(() => {
    Elements.revenueDisplay.textContent = `$${stats.revenue}`;
  }));

  collector.add(watch(stats, 'revenue', (newRev) => {
    if (newRev > 10000) {
      showCelebration();
    }
  }));

  // Return single cleanup function
  return () => collector.cleanup();
}

// Usage
const closeDashboard = createDashboard();
// ... user interacts with dashboard ...
closeDashboard(); // All effects and watches stopped!
```

 

## Real-World Examples

### Example 1: Modal with Cleanup

```javascript
function createModal(content) {
  const collector = ReactiveCleanup.collector();

  const modal = state({
    isOpen: true,
    content: content,
    isClosing: false
  });

  // Effect for visibility
  collector.add(effect(() => {
    Elements.style({
      modalOverlay: { display: modal.isOpen ? 'flex' : 'none' }
    });
  }));

  // Effect for content
  collector.add(effect(() => {
    Elements.modalContent.innerHTML = modal.content;
  }));

  // Effect for closing animation
  collector.add(effect(() => {
    if (modal.isClosing) {
      Elements.modalBox.classList.add('closing');
    }
  }));

  // Keyboard listener for Escape
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // Add keyboard cleanup
  collector.add(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  // Close function
  function closeModal() {
    modal.isClosing = true;

    setTimeout(() => {
      modal.isOpen = false;
      collector.cleanup(); // Clean up everything!
    }, 300); // After animation
  }

  return {
    close: closeModal,
    setContent: (c) => { modal.content = c; }
  };
}

// Usage
const modal = createModal('<h2>Welcome!</h2>');
// ... user interaction ...
modal.close(); // Properly cleaned up!
```

 

### Example 2: Tab Component with Cleanup

```javascript
function createTabs(tabConfigs) {
  const collector = ReactiveCleanup.collector();

  const tabs = state({
    activeTab: tabConfigs[0].id,
    tabs: tabConfigs
  });

  // Effect for tab buttons
  collector.add(effect(() => {
    tabs.tabs.forEach(tab => {
      const btn = Elements[`${tab.id}TabBtn`];
      if (btn) {
        btn.classList.toggle('active', tabs.activeTab === tab.id);
      }
    });
  }));

  // Effect for tab content
  collector.add(effect(() => {
    tabs.tabs.forEach(tab => {
      const content = Elements[`${tab.id}TabContent`];
      if (content) {
        content.style.display = tabs.activeTab === tab.id ? 'block' : 'none';
      }
    });
  }));

  // Set up click handlers
  tabs.tabs.forEach(tab => {
    const btn = Elements[`${tab.id}TabBtn`];
    if (btn) {
      const handler = () => { tabs.activeTab = tab.id; };
      btn.addEventListener('click', handler);

      // Add cleanup for event listener
      collector.add(() => {
        btn.removeEventListener('click', handler);
      });
    }
  });

  return {
    switchTo: (tabId) => { tabs.activeTab = tabId; },
    destroy: () => collector.cleanup()
  };
}

// Usage
const tabs = createTabs([
  { id: 'home', label: 'Home' },
  { id: 'settings', label: 'Settings' },
  { id: 'help', label: 'Help' }
]);

// Later, when tabs are no longer needed
tabs.destroy();
```

 

### Example 3: Real-Time Data Feed

```javascript
function createDataFeed(endpoint) {
  const collector = ReactiveCleanup.collector();

  const feed = state({
    data: [],
    isConnected: false,
    error: null
  });

  // WebSocket connection
  const ws = new WebSocket(endpoint);

  ws.onopen = () => {
    feed.isConnected = true;
  };

  ws.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    feed.data = [...feed.data.slice(-99), newData]; // Keep last 100
  };

  ws.onerror = (error) => {
    feed.error = error.message;
  };

  ws.onclose = () => {
    feed.isConnected = false;
  };

  // Add WebSocket cleanup
  collector.add(() => {
    ws.close();
  });

  // Effect for connection status
  collector.add(effect(() => {
    Elements.connectionStatus.textContent = feed.isConnected ? 'Connected' : 'Disconnected';
    Elements.connectionStatus.className = feed.isConnected ? 'status-online' : 'status-offline';
  }));

  // Effect for data display
  collector.add(effect(() => {
    Elements.feedList.innerHTML = feed.data
      .map(item => `<li>${item.timestamp}: ${item.value}</li>`)
      .join('');
  }));

  // Effect for errors
  collector.add(effect(() => {
    Elements.errorMessage.textContent = feed.error || '';
    Elements.errorMessage.style.display = feed.error ? 'block' : 'none';
  }));

  return {
    getData: () => feed.data,
    disconnect: () => collector.cleanup()
  };
}

// Usage
const feed = createDataFeed('wss://api.example.com/feed');

// When navigating away
feed.disconnect(); // WebSocket closed, effects stopped
```

 

### Example 4: Page Router with Cleanup

```javascript
const routeCleanup = { current: null };

function navigateTo(route) {
  // Clean up previous page
  if (routeCleanup.current) {
    routeCleanup.current();
    routeCleanup.current = null;
  }

  // Mount new page
  switch (route) {
    case '/home':
      routeCleanup.current = mountHomePage();
      break;
    case '/dashboard':
      routeCleanup.current = mountDashboardPage();
      break;
    case '/settings':
      routeCleanup.current = mountSettingsPage();
      break;
  }
}

function mountDashboardPage() {
  const collector = ReactiveCleanup.collector();

  const dashboard = state({
    stats: null,
    isLoading: true
  });

  // Fetch data
  fetch('/api/stats')
    .then(r => r.json())
    .then(data => {
      dashboard.stats = data;
      dashboard.isLoading = false;
    });

  // Effects
  collector.add(effect(() => {
    Elements.dashboardSpinner.style.display = dashboard.isLoading ? 'block' : 'none';
  }));

  collector.add(effect(() => {
    if (dashboard.stats) {
      Elements.statsDisplay.innerHTML = `
        <div>Users: ${dashboard.stats.users}</div>
        <div>Revenue: $${dashboard.stats.revenue}</div>
      `;
    }
  }));

  // Auto-refresh interval
  const refreshInterval = setInterval(() => {
    fetch('/api/stats').then(r => r.json()).then(data => {
      dashboard.stats = data;
    });
  }, 30000);

  // Add interval cleanup
  collector.add(() => {
    clearInterval(refreshInterval);
  });

  return () => collector.cleanup();
}

// Navigation
navigateTo('/dashboard');
// ... user clicks settings link ...
navigateTo('/settings'); // Dashboard properly cleaned up!
```

 

### Example 5: Form with Async Validation

```javascript
function createForm() {
  const collector = ReactiveCleanup.collector();

  const form = state({
    username: '',
    email: '',
    errors: {},
    isValidating: false,
    isValid: false
  });

  // Debounced username validation
  let usernameTimeout;
  collector.add(watch(form, 'username', async (username) => {
    clearTimeout(usernameTimeout);

    if (username.length < 3) {
      form.errors.username = 'Username must be at least 3 characters';
      return;
    }

    usernameTimeout = setTimeout(async () => {
      form.isValidating = true;
      const available = await checkUsernameAvailable(username);
      form.errors.username = available ? '' : 'Username already taken';
      form.isValidating = false;
    }, 500);
  }));

  // Cleanup timeout
  collector.add(() => {
    clearTimeout(usernameTimeout);
  });

  // Email validation
  collector.add(watch(form, 'email', (email) => {
    form.errors.email = email.includes('@') ? '' : 'Invalid email address';
  }));

  // Overall validity
  collector.add(effect(() => {
    form.isValid = !form.errors.username &&
                   !form.errors.email &&
                   form.username.length > 0 &&
                   form.email.length > 0;
  }));

  // UI bindings
  collector.add(effect(() => {
    Elements.usernameError.textContent = form.errors.username || '';
    Elements.emailError.textContent = form.errors.email || '';
    Elements.submitBtn.disabled = !form.isValid || form.isValidating;
    Elements.validatingSpinner.style.display = form.isValidating ? 'inline' : 'none';
  }));

  return {
    setUsername: (v) => { form.username = v; },
    setEmail: (v) => { form.email = v; },
    isValid: () => form.isValid,
    destroy: () => collector.cleanup()
  };
}

// Usage
const form = createForm();
// ... user fills form ...
form.destroy(); // All validation stopped, timeouts cleared
```

 

## Common Patterns

### Pattern 1: Return Cleanup from Functions

```javascript
// ✅ Good pattern - return cleanup
function setupFeature() {
  const collector = ReactiveCleanup.collector();

  // Set up effects, watches, listeners...

  return () => collector.cleanup();
}

const cleanupFeature = setupFeature();
// Later...
cleanupFeature();
```

 

### Pattern 2: Cleanup on Component Unmount

```javascript
function mountComponent(container) {
  const collector = ReactiveCleanup.collector();

  // Set up component...

  // Return object with destroy method
  return {
    // Component methods...
    destroy() {
      collector.cleanup();
      container.innerHTML = '';
    }
  };
}
```

 

### Pattern 3: Cleanup Event Listeners

```javascript
function setupEventListener(element, event, handler) {
  element.addEventListener(event, handler);

  // Return cleanup function
  return () => {
    element.removeEventListener(event, handler);
  };
}

const collector = ReactiveCleanup.collector();

collector.add(setupEventListener(button, 'click', handleClick));
collector.add(setupEventListener(input, 'input', handleInput));
collector.add(setupEventListener(document, 'keydown', handleKeydown));

// Clean up all listeners
collector.cleanup();
```

 

### Pattern 4: Cleanup Timers

```javascript
function setupAutoRefresh(interval, callback) {
  const timer = setInterval(callback, interval);

  return () => {
    clearInterval(timer);
  };
}

const collector = ReactiveCleanup.collector();

collector.add(setupAutoRefresh(5000, fetchData));
collector.add(setupAutoRefresh(1000, updateClock));

// Clean up all timers
collector.cleanup();
```

 

### Pattern 5: Scope-Based Cleanup

```javascript
function withCleanupScope(fn) {
  const collector = ReactiveCleanup.collector();

  // Run function with add helper
  fn((cleanup) => collector.add(cleanup));

  // Return scope cleanup
  return () => collector.cleanup();
}

// Usage
const cleanupScope = withCleanupScope((addCleanup) => {
  addCleanup(effect(() => { /* ... */ }));
  addCleanup(watch(state, 'prop', () => { /* ... */ }));
  addCleanup(() => clearInterval(myInterval));
});

// Later...
cleanupScope();
```

 

## Important Notes

### 1. Always Store Cleanup Functions

```javascript
// ❌ Bad - cleanup function lost
effect(() => {
  Elements.count.textContent = counter.value;
});

// ✅ Good - cleanup function stored
const stopEffect = effect(() => {
  Elements.count.textContent = counter.value;
});
```

 

### 2. Clean Up in Reverse Order

```javascript
// Effects might depend on each other
const cleanup1 = effect(() => { /* A */ });
const cleanup2 = effect(() => { /* B depends on A */ });

// Clean up in reverse order
cleanup2(); // B first
cleanup1(); // Then A
```

 

### 3. Don't Forget External Resources

```javascript
const collector = ReactiveCleanup.collector();

// WebSocket
const ws = new WebSocket(url);
collector.add(() => ws.close());

// Event listeners
const handler = (e) => { /* ... */ };
document.addEventListener('scroll', handler);
collector.add(() => document.removeEventListener('scroll', handler));

// Timers
const interval = setInterval(tick, 1000);
collector.add(() => clearInterval(interval));

// Clean everything
collector.cleanup();
```

 

### 4. Cleanup Idempotency

```javascript
// Cleanup functions should be safe to call multiple times
let isCleanedUp = false;

const cleanup = () => {
  if (isCleanedUp) return; // Guard against double cleanup
  isCleanedUp = true;

  // Actual cleanup...
};
```

 

## Summary

**What is Lifecycle Management?**
Properly creating and destroying reactive resources to prevent memory leaks.

**Key Functions:**
- `effect()` returns a cleanup function
- `watch()` returns a cleanup function
- `cleanup(state)` removes all effects for a state
- `destroy(component)` destroys a component
- `ReactiveCleanup.collector()` collects multiple cleanups

**The Pattern:**
```javascript
const collector = ReactiveCleanup.collector();

collector.add(effect(() => { /* ... */ }));
collector.add(watch(state, 'prop', () => { /* ... */ }));
collector.add(() => clearInterval(myTimer));

// When done:
collector.cleanup();
```

**Key Takeaway:**
Every effect returns a cleanup function — use it! Collect cleanups with `ReactiveCleanup.collector()` and call `cleanup()` when components unmount or features are disabled. This prevents memory leaks and keeps your app performant.

**Remember:** Cleanup is like checking out of a hotel — always free your resources when you're done using them!
