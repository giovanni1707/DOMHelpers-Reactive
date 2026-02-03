# `watchStorage() options.namespace` - Namespace Filter Configuration

## Quick Start (30 seconds)

```javascript
// Without namespace - watch exact key
watchStorage('settings', (value) => {
  console.log('Settings changed:', value);
});

// With namespace - automatically add prefix
watchStorage('settings', (value) => {
  console.log('App settings changed:', value);
}, {
  namespace: 'myApp'
});
// Actually watches 'myApp:settings' ✨

// Multiple apps can coexist safely!
```

**What just happened?** You added namespace filtering so the watcher automatically handles prefixed keys!

  

## What is `options.namespace`?

`options.namespace` is a configuration option for `watchStorage()` that **automatically adds a namespace prefix to the watched key**.

Simply put: it lets you watch keys with a specific prefix without manually typing it every time.

Think of it as **filtering for your app's labeled folder**.

  

## Syntax

```javascript
watchStorage(key, callback, {
  namespace: string
})
```

**Value:**
- Any string (typically your app name)
- Automatically prefixed with colon: `namespace:key`

**Default:** `''` (empty string - no namespace)

  

## Why Does This Exist?

### The Problem: Namespace Prefix Duplication

When using namespaced storage, you need to repeat the prefix:

```javascript
// App uses 'myApp' namespace for all storage
const NAMESPACE = 'myApp';

// Without namespace option
watchStorage('myApp:settings', (value) => {
  console.log(value);
});

watchStorage('myApp:theme', (value) => {
  console.log(value);
});

watchStorage('myApp:language', (value) => {
  console.log(value);
});

// Problems:
// - Repetitive prefix ❌
// - Easy to make typos ❌
// - Hard to change namespace ❌
```

**What's the Real Issue?**

```
Watch namespaced keys
        |
        v
Must type full prefix every time
        |
        v
Repetitive and error-prone ❌
```

**Problems:**
❌ **Repetition** - Type prefix for every watcher  
❌ **Typo risk** - Easy to misspell prefix  
❌ **Hard to refactor** - Changing namespace is tedious  
❌ **No consistency** - Manual prefix management  

### The Solution with `options.namespace`

```javascript
const NAMESPACE = 'myApp';

// With namespace option - cleaner!
watchStorage('settings', (value) => {
  console.log(value);
}, { namespace: NAMESPACE });

watchStorage('theme', (value) => {
  console.log(value);
}, { namespace: NAMESPACE });

watchStorage('language', (value) => {
  console.log(value);
}, { namespace: NAMESPACE });

// Benefits:
// - No prefix repetition ✅
// - Consistent namespace ✅
// - Easy to refactor ✅
```

**What Just Happened?**

```
Specify namespace once
        |
        v
Automatically prefixed
        |
        v
'settings' → 'myApp:settings'
        |
        v
Clean, consistent code ✅
```

**Benefits:**
✅ **Cleaner code** - No prefix repetition  
✅ **Consistency** - Same namespace everywhere  
✅ **Easy refactoring** - Change namespace in one place  
✅ **Less errors** - No typos in prefixes  

  

## Mental Model

Think of watching without namespace as **manually typing addresses**:

```
No Namespace (Manual Addresses)
┌─────────────────────┐
│  Watch:             │
│  'myApp:settings'   │
│  'myApp:theme'      │
│  'myApp:lang'       │
│  'myApp:prefs'      │
│                     │
│  Repetitive! ❌     │
└─────────────────────┘
```

Think of namespace as **automatic address prefix**:

```
With Namespace (Auto-Prefix)
┌─────────────────────┐
│  namespace: 'myApp' │
│                     │
│  Watch:             │
│  'settings'  →      │
│    'myApp:settings' │
│  'theme'  →         │
│    'myApp:theme'    │
│                     │
│  Automatic! ✅      │
└─────────────────────┘
```

**Key Insight:** Namespace option eliminates prefix repetition.

  

## How Does It Work?

The namespace option automatically prefixes the key:

### Key Construction

```
watchStorage('settings', callback, { namespace: 'myApp' })
        |
        v
Construct full key: 'myApp:settings'
        |
        v
Watch for changes to 'myApp:settings'
        |
        v
Call callback when it changes ✨
```

### Implementation

```javascript
function watchStorage(key, callback, options = {}) {
  const { namespace = '', storage = 'localStorage' } = options;
  
  // Construct full key with namespace
  const fullKey = namespace ? `${namespace}:${key}` : key;
  
  // Watch the full key
  window.addEventListener('storage', (event) => {
    if (event.key === fullKey) {
      callback(event.newValue, event.oldValue);
    }
  });
}
```

  

## Basic Usage

### Example 1: Without Namespace

```javascript
// Watch exact key
watchStorage('settings', (value) => {
  console.log('Settings:', value);
});

// Watches 'settings' (no prefix)
```

  

### Example 2: With Namespace

```javascript
// Watch namespaced key
watchStorage('settings', (value) => {
  console.log('App settings:', value);
}, {
  namespace: 'myApp'
});

// Actually watches 'myApp:settings'
```

  

### Example 3: Multiple Keys, Same Namespace

```javascript
const APP_NAMESPACE = 'myApp';

// Clean, consistent watchers
watchStorage('theme', applyTheme, {
  namespace: APP_NAMESPACE
});

watchStorage('language', updateLanguage, {
  namespace: APP_NAMESPACE
});

watchStorage('fontSize', updateFontSize, {
  namespace: APP_NAMESPACE
});
```

  

## Real-World Examples

### Example 1: Application-Wide Namespace

```javascript
const APP_NS = 'todoApp';

// Watch all app settings
watchStorage('userPreferences', (prefs) => {
  applyPreferences(JSON.parse(prefs));
}, {
  namespace: APP_NS
});

watchStorage('savedTodos', (todos) => {
  renderTodos(JSON.parse(todos));
}, {
  namespace: APP_NS
});

watchStorage('filters', (filters) => {
  applyFilters(JSON.parse(filters));
}, {
  namespace: APP_NS
});

// All watch 'todoApp:*' keys
```

  

### Example 2: Multi-Tenant Application

```javascript
// Different customer watching their own data
function setupCustomerWatchers(customerId) {
  const namespace = `customer_${customerId}`;
  
  watchStorage('preferences', (prefs) => {
    console.log(`Customer ${customerId} prefs:`, prefs);
  }, {
    namespace
  });
  
  watchStorage('data', (data) => {
    console.log(`Customer ${customerId} data:`, data);
  }, {
    namespace
  });
}

setupCustomerWatchers('123'); // Watches 'customer_123:*'
setupCustomerWatchers('456'); // Watches 'customer_456:*'
```

  

### Example 3: Feature Module Isolation

```javascript
// Auth module
const authModule = {
  namespace: 'auth',
  
  init() {
    watchStorage('token', this.handleTokenChange, {
      namespace: this.namespace
    });
    
    watchStorage('user', this.handleUserChange, {
      namespace: this.namespace
    });
  },
  
  handleTokenChange(token) {
    console.log('Auth token changed');
  },
  
  handleUserChange(user) {
    console.log('User changed');
  }
};

// Cart module
const cartModule = {
  namespace: 'cart',
  
  init() {
    watchStorage('items', this.handleItemsChange, {
      namespace: this.namespace
    });
  },
  
  handleItemsChange(items) {
    console.log('Cart items changed');
  }
};

authModule.init(); // Watches 'auth:*'
cartModule.init(); // Watches 'cart:*'
```

  

### Example 4: Version-Based Namespace

```javascript
const APP_VERSION = '2.0';
const namespace = `myApp_v${APP_VERSION}`;

// Watch version-specific data
watchStorage('settings', (settings) => {
  // Only responds to v2.0 settings
  applySettings(JSON.parse(settings));
}, {
  namespace
});

// v1.0 data: 'myApp_v1.0:settings'
// v2.0 data: 'myApp_v2.0:settings'
// No conflicts!
```

  

### Example 5: Environment-Specific Namespace

```javascript
const ENV = process.env.NODE_ENV; // 'development' or 'production'
const namespace = `myApp_${ENV}`;

watchStorage('config', (config) => {
  console.log(`${ENV} config changed:`, config);
}, {
  namespace
});

// Development: watches 'myApp_development:config'
// Production: watches 'myApp_production:config'
```

  

## Common Patterns

### Pattern 1: Helper Function

```javascript
const APP_NAMESPACE = 'myApp';

function watchAppStorage(key, callback) {
  return watchStorage(key, callback, {
    namespace: APP_NAMESPACE
  });
}

// Usage
watchAppStorage('theme', applyTheme);
watchAppStorage('language', updateLanguage);
```

  

### Pattern 2: Watch Multiple Keys

```javascript
function watchNamespacedKeys(namespace, keys, callback) {
  const cleanups = keys.map(key => {
    return watchStorage(key, (value, oldValue) => {
      callback(key, value, oldValue);
    }, {
      namespace
    });
  });
  
  // Return cleanup function
  return () => cleanups.forEach(c => c());
}

// Usage
const cleanup = watchNamespacedKeys(
  'myApp',
  ['theme', 'language', 'fontSize'],
  (key, value) => {
    console.log(`${key} changed to ${value}`);
  }
);
```

  

### Pattern 3: Dynamic Namespace

```javascript
function createModuleWatcher(moduleName) {
  return {
    watch(key, callback) {
      return watchStorage(key, callback, {
        namespace: `modules:${moduleName}`
      });
    }
  };
}

// Usage
const authWatcher = createModuleWatcher('auth');
authWatcher.watch('token', handleTokenChange);
// Watches 'modules:auth:token'

const cartWatcher = createModuleWatcher('cart');
cartWatcher.watch('items', handleItemsChange);
// Watches 'modules:cart:items'
```

  

### Pattern 4: Namespace from Config

```javascript
const config = {
  appName: 'MyApp',
  version: '2.0'
};

const namespace = `${config.appName}_v${config.version}`;

function watchConfig(key, callback) {
  return watchStorage(key, callback, {
    namespace
  });
}
```

  

### Pattern 5: User-Specific Namespace

```javascript
let currentUser = null;

function setupUserWatchers(userId) {
  currentUser = userId;
  const namespace = `user_${userId}`;
  
  // Watch user-specific data
  watchStorage('preferences', (prefs) => {
    applyUserPreferences(JSON.parse(prefs));
  }, {
    namespace
  });
  
  watchStorage('savedData', (data) => {
    loadUserData(JSON.parse(data));
  }, {
    namespace
  });
}

// Login
function login(userId) {
  setupUserWatchers(userId);
}
```

  

### Pattern 6: Nested Namespaces

```javascript
function createNestedNamespace(...parts) {
  return parts.join(':');
}

const baseNamespace = 'myApp';
const featureNamespace = createNestedNamespace(baseNamespace, 'features');

watchStorage('darkMode', handleDarkMode, {
  namespace: featureNamespace
});
// Watches 'myApp:features:darkMode'
```

  

## Combining with autoSave

### Pattern: Consistent Namespace

```javascript
const NAMESPACE = 'myApp';

// Save with namespace
const state = state({ theme: 'light' });
autoSave(state, 'settings', {
  namespace: NAMESPACE
});
// Saves as 'myApp:settings'

// Watch with same namespace
watchStorage('settings', (value) => {
  console.log('Settings changed:', value);
}, {
  namespace: NAMESPACE
});
// Watches 'myApp:settings'

// Perfect match! ✅
```

  

## Summary

**What is `watchStorage() options.namespace`?**  
A configuration option that automatically adds a namespace prefix to the watched storage key.

**Why use it?**
- ✅ Eliminate prefix repetition
- ✅ Consistent namespace usage
- ✅ Easy to refactor
- ✅ Reduce typo errors
- ✅ Cleaner code

**Key Takeaway:**

```
Without Namespace        With Namespace
       |                       |
Manual prefix           Auto-prefix
       |                       |
'myApp:settings'        'settings'
       |                + namespace: 'myApp'
Repetitive ❌           Clean ✅
```

**One-Line Rule:** Use namespace option to avoid typing prefixes repeatedly.

**Best Practices:**
- Use same namespace as your autoSave configuration
- Store namespace in constant
- Use descriptive namespaces (app name, version)
- Consider user/customer-specific namespaces
- Document namespace convention

**Remember:** Namespaces keep your code clean and organized! 🎉