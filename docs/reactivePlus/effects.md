# `effects()` - Batch Multiple Reactive Effects

## Quick Start (30 seconds)

```javascript
const app = state({
  count: 0,
  theme: 'light',
  user: { name: 'Alice' }
});

// Define multiple named effects at once
const stopAll = effects({
  updateCounter: () => {
    Elements.counter.textContent = app.count;
  },
  updateTheme: () => {
    document.body.className = app.theme;
  },
  updateUser: () => {
    Elements.userName.textContent = app.user.name;
  }
});

app.count = 5;       // ✨ Only updateCounter runs
app.theme = 'dark';  // ✨ Only updateTheme runs

// Stop all effects at once
stopAll();
```

**That's it.** Define multiple effects in one call, get a single cleanup function to stop them all.

---

## What is `effects()`?

`effects()` is **the batch version of `effect()`**. Instead of creating effects one at a time, you define multiple named effects in a single object and get back a unified cleanup function.

Think of it as **setting up multiple automated systems at once**. Instead of configuring each sensor individually, you define all your automations in one place.

**In practical terms:** When you have multiple related effects, `effects()` keeps them organized and makes cleanup simple.

---

## Syntax

```javascript
// Define multiple effects at once
const stopAllEffects = effects({
  effectName1: () => {
    // First effect logic
  },
  effectName2: () => {
    // Second effect logic
  },
  effectName3: () => {
    // Third effect logic
  }
});

// Stop all effects with one call
stopAllEffects();
```

**Parameters:**
- `definitions` - Object where keys are effect names and values are effect functions

**Returns:**
- A cleanup function that stops ALL effects when called

---

## Why Does This Exist?

### Approach 1: Multiple Individual effect() Calls

When using individual `effect()` calls:

```javascript
const app = state({ count: 0, theme: 'light', status: 'active' });

// Multiple separate effect calls
const stopCounter = effect(() => {
  Elements.counter.textContent = app.count;
});

const stopTheme = effect(() => {
  document.body.className = app.theme;
});

const stopStatus = effect(() => {
  Elements.statusBadge.textContent = app.status;
});

// Cleanup requires tracking all functions
function cleanupAll() {
  stopCounter();
  stopTheme();
  stopStatus();
}
```

This approach is **great when you need**:
✅ Fine-grained control over individual effects
✅ Ability to stop specific effects independently
✅ Effects that are created at different times

### When Batch Definition Is Your Goal

In scenarios where you have **multiple related effects** that should be managed together, `effects()` provides a cleaner approach:

```javascript
const app = state({ count: 0, theme: 'light', status: 'active' });

// All effects defined together
const stopAll = effects({
  counter: () => {
    Elements.counter.textContent = app.count;
  },
  theme: () => {
    document.body.className = app.theme;
  },
  status: () => {
    Elements.statusBadge.textContent = app.status;
  }
});

// Single cleanup for all
stopAll();
```

**This approach is especially useful when:**
✅ Effects are logically related (same component/feature)
✅ You want organized, self-documenting code
✅ You need simple cleanup of all effects at once
✅ You're building component-like structures

**The Choice is Yours:**
- Use `effect()` for individual, standalone effects
- Use `effects()` for groups of related effects
- Both approaches work well and can be combined

**Benefits of effects():**
✅ Organized, named effects in one place
✅ Single cleanup function for all
✅ Self-documenting code structure
✅ Easier component lifecycle management
✅ Cleaner initialization code

---

## Mental Model: The Control Panel

Think of `effects()` like **a control panel with multiple switches**:

**Individual effect() Calls (Separate Switches):**
```
┌─────────────────────────────────┐
│  Separate Switches              │
│                                 │
│  [Counter Switch] → effect()    │
│  [Theme Switch]   → effect()    │
│  [Status Switch]  → effect()    │
│                                 │
│  Turn off all:                  │
│  - Find counter switch, flip    │
│  - Find theme switch, flip      │
│  - Find status switch, flip     │
│                                 │
│  Multiple steps needed ⚠️       │
└─────────────────────────────────┘
```

**effects() (Unified Control Panel):**
```
┌─────────────────────────────────┐
│  Unified Control Panel          │
│                                 │
│  effects({                      │
│    counter: () => {...},        │
│    theme:   () => {...},        │
│    status:  () => {...}         │
│  })                             │
│                                 │
│  Turn off all:                  │
│  [MASTER SWITCH] → stopAll()    │
│                                 │
│  One step! ✅                   │
└─────────────────────────────────┘
```

**Key Insight:** `effects()` groups related effects under one master control.

---

## How Does It Work?

Under the hood, `effects()` creates multiple effects and collects their cleanup functions:

```
effects({ a: fn1, b: fn2, c: fn3 })
              ↓
┌─────────────────────────────────────────────────────┐
│ 1. For each entry in the object:                    │
│    - Call effect(fn1) → get cleanup1                │
│    - Call effect(fn2) → get cleanup2                │
│    - Call effect(fn3) → get cleanup3                │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ 2. Store all cleanups in an array:                  │
│    cleanups = [cleanup1, cleanup2, cleanup3]        │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ 3. Return master cleanup function:                  │
│    () => cleanups.forEach(c => c())                 │
└─────────────────────────────────────────────────────┘
```

**Internal Implementation:**

```javascript
// Simplified version of how effects() works
function effects(definitions) {
  const cleanups = Object.values(definitions).map(fn => effect(fn));
  return () => cleanups.forEach(cleanup => cleanup());
}
```

**Key Points:**
- Each effect runs immediately (just like individual `effect()` calls)
- Each effect tracks its own dependencies
- The returned function stops ALL effects

---

## Basic Usage

### Example 1: UI Component Effects

```javascript
const userCard = state({
  name: 'Alice',
  avatar: '/default.png',
  status: 'online'
});

const stopEffects = effects({
  displayName: () => {
    Elements.cardName.textContent = userCard.name;
  },
  displayAvatar: () => {
    Elements.cardAvatar.src = userCard.avatar;
  },
  displayStatus: () => {
    Elements.cardStatus.className = `status status-${userCard.status}`;
  }
});

// Update any property - only relevant effect runs
userCard.name = 'Bob';     // ✨ Only displayName runs
userCard.status = 'away';  // ✨ Only displayStatus runs
```

---

### Example 2: Dashboard Widgets

```javascript
const dashboard = state({
  visitors: 1250,
  revenue: 45000,
  orders: 328,
  conversionRate: 0.042
});

const stopDashboard = effects({
  visitors: () => {
    Elements.visitorCount.textContent = dashboard.visitors.toLocaleString();
    Elements.visitorChart.update(dashboard.visitors);
  },
  revenue: () => {
    Elements.revenueAmount.textContent = `$${dashboard.revenue.toLocaleString()}`;
    Elements.revenueChart.update(dashboard.revenue);
  },
  orders: () => {
    Elements.orderCount.textContent = dashboard.orders;
  },
  conversion: () => {
    const percent = (dashboard.conversionRate * 100).toFixed(2);
    Elements.conversionRate.textContent = `${percent}%`;
  }
});
```

---

### Example 3: Form State Management

```javascript
const form = state({
  email: '',
  password: '',
  rememberMe: false,
  isSubmitting: false
});

const stopFormEffects = effects({
  emailSync: () => {
    Elements.emailInput.value = form.email;
  },
  passwordSync: () => {
    Elements.passwordInput.value = form.password;
  },
  rememberSync: () => {
    Elements.rememberCheckbox.checked = form.rememberMe;
  },
  submitState: () => {
    Elements.submitBtn.disabled = form.isSubmitting;
    Elements.submitBtn.textContent = form.isSubmitting ? 'Submitting...' : 'Submit';
  }
});
```

---

### Example 4: Theme and Layout Effects

```javascript
const ui = state({
  theme: 'light',
  sidebarOpen: true,
  fontSize: 16
});

const stopUIEffects = effects({
  applyTheme: () => {
    document.body.dataset.theme = ui.theme;
    document.documentElement.style.colorScheme = ui.theme;
  },
  toggleSidebar: () => {
    Elements.sidebar.classList.toggle('collapsed', !ui.sidebarOpen);
    Elements.mainContent.classList.toggle('expanded', !ui.sidebarOpen);
  },
  applyFontSize: () => {
    document.documentElement.style.fontSize = `${ui.fontSize}px`;
  }
});
```

---

### Example 5: Cleanup on Component Unmount

```javascript
function createUserProfile(userId) {
  const profile = state({
    user: null,
    posts: [],
    isLoading: true
  });

  // Load data
  fetchUser(userId).then(user => {
    profile.user = user;
    profile.isLoading = false;
  });

  // Set up all effects
  const cleanup = effects({
    loading: () => {
      Elements.spinner.style.display = profile.isLoading ? 'block' : 'none';
    },
    userInfo: () => {
      if (profile.user) {
        Elements.update({
          profileName: { textContent: profile.user.name },
          profileBio: { textContent: profile.user.bio },
          profileAvatar: { src: profile.user.avatar }
        });
      }
    },
    postsList: () => {
      Elements.postContainer.innerHTML = profile.posts
        .map(post => `<div class="post">${post.title}</div>`)
        .join('');
    }
  });

  // Return cleanup for when component is removed
  return {
    state: profile,
    destroy: cleanup
  };
}

// Usage
const profile = createUserProfile(123);

// Later, when removing the component
profile.destroy(); // Stops all effects at once
```

---

## Effects with DOM Helpers

### Example 1: Elements.update Integration

```javascript
const product = state({
  name: 'Widget Pro',
  price: 99.99,
  stock: 50,
  rating: 4.5
});

const stopProductEffects = effects({
  basicInfo: () => {
    Elements.update({
      productName: { textContent: product.name },
      productPrice: { textContent: `$${product.price.toFixed(2)}` }
    });
  },
  stockStatus: () => {
    const inStock = product.stock > 0;
    Elements.update({
      stockBadge: {
        textContent: inStock ? `${product.stock} in stock` : 'Out of stock',
        className: inStock ? 'badge-success' : 'badge-danger'
      },
      buyButton: {
        disabled: !inStock
      }
    });
  },
  ratingDisplay: () => {
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;

    Elements.ratingStars.innerHTML =
      '★'.repeat(fullStars) +
      (halfStar ? '½' : '') +
      '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
  }
});
```

---

### Example 2: Collections Integration

```javascript
const notification = state({
  message: '',
  type: 'info',
  visible: false
});

const stopNotificationEffects = effects({
  updateAllBadges: () => {
    Collections.ClassName.notificationBadge.update({
      textContent: notification.message
    });
  },
  updateAllTypes: () => {
    Collections.ClassName.notification.forEach(el => {
      el.className = `notification notification-${notification.type}`;
    });
  },
  toggleVisibility: () => {
    Collections.ClassName.notification.update({
      style: { display: notification.visible ? 'flex' : 'none' }
    });
  }
});
```

---

### Example 3: Mixed DOM Helpers

```javascript
const app = state({
  currentPage: 'home',
  isMenuOpen: false,
  searchQuery: ''
});

const stopNavEffects = effects({
  pageHighlight: () => {
    // Update navigation highlights using Collections
    Collections.ClassName.navLink.forEach(link => {
      const isActive = link.dataset.page === app.currentPage;
      link.classList.toggle('active', isActive);
    });
  },
  menuState: () => {
    // Update menu state using Elements
    Elements.update({
      menuOverlay: {
        style: { display: app.isMenuOpen ? 'block' : 'none' }
      },
      menuButton: {
        className: app.isMenuOpen ? 'menu-btn open' : 'menu-btn'
      }
    });
  },
  searchSync: () => {
    // Sync search input using Selector
    Selector.query('input[type="search"]').value = app.searchQuery;
  }
});
```

---

## Real-World Examples

### Example 1: E-Commerce Product Page

```javascript
const productPage = state({
  product: null,
  selectedVariant: null,
  quantity: 1,
  isAddingToCart: false
});

const stopProductPage = effects({
  productDetails: () => {
    if (!productPage.product) return;

    Elements.update({
      productTitle: { textContent: productPage.product.name },
      productDescription: { innerHTML: productPage.product.description },
      productImage: { src: productPage.product.images[0] }
    });
  },

  variantSelector: () => {
    const variant = productPage.selectedVariant;
    if (!variant) return;

    Elements.update({
      variantPrice: { textContent: `$${variant.price.toFixed(2)}` },
      variantSku: { textContent: `SKU: ${variant.sku}` }
    });

    // Highlight selected variant button
    Collections.ClassName.variantBtn.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.variantId === variant.id);
    });
  },

  quantityDisplay: () => {
    Elements.quantityInput.value = productPage.quantity;
    Elements.decreaseBtn.disabled = productPage.quantity <= 1;
    Elements.increaseBtn.disabled = productPage.quantity >= 10;
  },

  addToCartButton: () => {
    const btn = Elements.addToCartBtn;
    btn.disabled = productPage.isAddingToCart || !productPage.selectedVariant;
    btn.textContent = productPage.isAddingToCart ? 'Adding...' : 'Add to Cart';
  }
});
```

---

### Example 2: Real-Time Chat Interface

```javascript
const chat = state({
  messages: [],
  typingUsers: [],
  isConnected: true,
  unreadCount: 0
});

const stopChatEffects = effects({
  messageList: () => {
    const container = Elements.messageContainer;
    container.innerHTML = chat.messages
      .map(msg => `
        <div class="message ${msg.isOwn ? 'own' : ''}">
          <span class="author">${msg.author}</span>
          <span class="text">${msg.text}</span>
          <span class="time">${msg.time}</span>
        </div>
      `)
      .join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  },

  typingIndicator: () => {
    const typing = chat.typingUsers;
    let text = '';

    if (typing.length === 1) {
      text = `${typing[0]} is typing...`;
    } else if (typing.length === 2) {
      text = `${typing[0]} and ${typing[1]} are typing...`;
    } else if (typing.length > 2) {
      text = `${typing.length} people are typing...`;
    }

    Elements.typingIndicator.textContent = text;
    Elements.typingIndicator.style.display = typing.length > 0 ? 'block' : 'none';
  },

  connectionStatus: () => {
    Elements.update({
      connectionDot: {
        className: chat.isConnected ? 'status-dot online' : 'status-dot offline'
      },
      connectionText: {
        textContent: chat.isConnected ? 'Connected' : 'Reconnecting...'
      }
    });
  },

  unreadBadge: () => {
    Elements.unreadBadge.textContent = chat.unreadCount;
    Elements.unreadBadge.style.display = chat.unreadCount > 0 ? 'flex' : 'none';

    // Update page title
    document.title = chat.unreadCount > 0
      ? `(${chat.unreadCount}) Chat`
      : 'Chat';
  }
});
```

---

### Example 3: Settings Panel

```javascript
const settings = state({
  notifications: true,
  sound: true,
  volume: 80,
  theme: 'auto',
  language: 'en'
});

const stopSettingsEffects = effects({
  notificationToggle: () => {
    Elements.notificationSwitch.checked = settings.notifications;
    Elements.notificationStatus.textContent = settings.notifications ? 'On' : 'Off';
  },

  soundControls: () => {
    Elements.soundSwitch.checked = settings.sound;
    Elements.volumeSlider.disabled = !settings.sound;
    Elements.volumeSlider.value = settings.volume;
    Elements.volumeValue.textContent = `${settings.volume}%`;
  },

  themeSelector: () => {
    Collections.ClassName.themeOption.forEach(option => {
      option.classList.toggle('selected', option.dataset.theme === settings.theme);
    });

    // Apply theme
    if (settings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      document.body.dataset.theme = settings.theme;
    }
  },

  languageSelector: () => {
    Elements.languageSelect.value = settings.language;
    document.documentElement.lang = settings.language;
  }
});
```

---

### Example 4: Data Table with Filters

```javascript
const table = state({
  data: [],
  sortBy: 'name',
  sortOrder: 'asc',
  filterText: '',
  currentPage: 1,
  pageSize: 10
});

// Add computed properties
computed(table, {
  filteredData: function() {
    return this.data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(this.filterText.toLowerCase())
      )
    );
  },
  sortedData: function() {
    const data = [...this.filteredData];
    const mult = this.sortOrder === 'asc' ? 1 : -1;
    return data.sort((a, b) => {
      return String(a[this.sortBy]).localeCompare(String(b[this.sortBy])) * mult;
    });
  },
  pageData: function() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedData.slice(start, start + this.pageSize);
  },
  totalPages: function() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }
});

const stopTableEffects = effects({
  renderRows: () => {
    Elements.tableBody.innerHTML = table.pageData
      .map(row => `<tr><td>${row.name}</td><td>${row.email}</td><td>${row.role}</td></tr>`)
      .join('');
  },

  updateHeaders: () => {
    Collections.ClassName.sortHeader.forEach(header => {
      const column = header.dataset.column;
      const isActive = column === table.sortBy;
      header.classList.toggle('sort-active', isActive);
      header.dataset.order = isActive ? table.sortOrder : '';
    });
  },

  updatePagination: () => {
    Elements.pageInfo.textContent = `Page ${table.currentPage} of ${table.totalPages}`;
    Elements.prevBtn.disabled = table.currentPage <= 1;
    Elements.nextBtn.disabled = table.currentPage >= table.totalPages;
  },

  updateResultCount: () => {
    Elements.resultCount.textContent = `${table.filteredData.length} results`;
  }
});
```

---

## Common Patterns

### Pattern 1: Component-Style Organization

```javascript
function createComponent(initialState) {
  const state = state(initialState);

  const cleanup = effects({
    render: () => { /* main render */ },
    events: () => { /* event binding */ },
    sync: () => { /* external sync */ }
  });

  return {
    state,
    destroy: cleanup
  };
}
```

---

### Pattern 2: Feature Modules

```javascript
// Each feature has its own effects group
const authEffects = effects({
  loginButton: () => { /* ... */ },
  userMenu: () => { /* ... */ }
});

const cartEffects = effects({
  badge: () => { /* ... */ },
  dropdown: () => { /* ... */ }
});

const searchEffects = effects({
  input: () => { /* ... */ },
  results: () => { /* ... */ }
});

// Cleanup all on app shutdown
function shutdown() {
  authEffects();
  cartEffects();
  searchEffects();
}
```

---

### Pattern 3: Conditional Effect Groups

```javascript
let currentEffects = null;

function initializeMode(mode) {
  // Cleanup previous effects
  if (currentEffects) {
    currentEffects();
  }

  // Initialize new effects based on mode
  if (mode === 'edit') {
    currentEffects = effects({
      toolbar: () => { /* ... */ },
      canvas: () => { /* ... */ },
      properties: () => { /* ... */ }
    });
  } else if (mode === 'preview') {
    currentEffects = effects({
      viewer: () => { /* ... */ },
      navigation: () => { /* ... */ }
    });
  }
}
```

---

### Pattern 4: Debug Logging

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

const stopEffects = effects({
  mainEffect: () => {
    // Main logic
    updateUI(app.data);
  },
  debugLog: () => {
    if (DEBUG) {
      console.log('State changed:', {
        count: app.count,
        theme: app.theme,
        timestamp: Date.now()
      });
    }
  }
});
```

---

## Important Notes

### 1. All Effects Run Immediately

```javascript
const data = state({ value: 0 });

effects({
  first: () => console.log('First effect'),
  second: () => console.log('Second effect'),
  third: () => console.log('Third effect')
});

// Console immediately logs:
// "First effect"
// "Second effect"
// "Third effect"
```

---

### 2. Each Effect Tracks Its Own Dependencies

```javascript
const data = state({ a: 1, b: 2, c: 3 });

effects({
  watchA: () => console.log('A:', data.a),
  watchB: () => console.log('B:', data.b),
  watchC: () => console.log('C:', data.c)
});

data.a = 10; // Only "A: 10" logged
data.b = 20; // Only "B: 20" logged
```

---

### 3. Single Cleanup Stops All

```javascript
const data = state({ value: 0 });

const stopAll = effects({
  effect1: () => console.log('E1:', data.value),
  effect2: () => console.log('E2:', data.value),
  effect3: () => console.log('E3:', data.value)
});

data.value = 1; // All three log

stopAll(); // Stops ALL effects

data.value = 2; // Nothing logged
```

---

### 4. Names Are for Documentation Only

```javascript
// The names don't affect behavior, but help with code organization
effects({
  // Good: Descriptive names
  updateUserDisplay: () => { /* ... */ },
  syncWithServer: () => { /* ... */ },

  // Works but less clear
  a: () => { /* ... */ },
  x: () => { /* ... */ }
});
```

---

## Summary

**What is `effects()`?**
A way to define multiple named effects in one call with unified cleanup.

**Why use it?**
- ✅ Organized, grouped effects in one place
- ✅ Single cleanup function for all effects
- ✅ Self-documenting with named effects
- ✅ Perfect for component-like patterns
- ✅ Cleaner initialization code

**Key Takeaway:**

```
Multiple effect() calls        effects({...})
         |                          |
Separate cleanup functions    Single cleanup function
         |                          |
Must track each one           One call stops all
         |                          |
More flexible                 More organized
```

**One-Line Rule:** Use `effects()` when you have multiple related effects that should be managed together.

**The Magic Formula:**
```
effects({
  name1: () => {...},
  name2: () => {...},
  name3: () => {...}
})
──────────────────────
Returns: stopAll()
```

**Best Practices:**
- Use descriptive names for effects
- Group effects by feature or component
- Store the cleanup function for lifecycle management
- Use for component initialization patterns
- Combine with computed values for complex UI updates

**Remember:** `effects()` is just `effect()` with better organization — same power, cleaner code!
