# `options.onLoad` - Post-Load Transform Callback

## Quick Start (30 seconds)

```javascript
const userData = state({ name: '', preferences: {} });

// Without onLoad - loads raw data as-is
autoSave(userData, 'user');

// With onLoad - transform after loading
autoSave(userData, 'user', {
  onLoad: (data) => {
    // Decrypt or transform loaded data
    return {
      ...data,
      name: data.name.toUpperCase(),
      loadedAt: Date.now()
    };
  }
});

// Loaded data is automatically transformed ✨
```

**What just happened?** You transformed data right after loading - decrypting, upgrading, or modifying it before use!

  

## What is `options.onLoad`?

`options.onLoad` is a callback function that **transforms or migrates data right after it's loaded from storage**.

Simply put: it's like unpacking a box and organizing items before using them. You can decrypt, upgrade, or modify data as it comes out of storage.

Think of it as **a processing station** that handles incoming data.

  

## Syntax

```javascript
autoSave(state, key, {
  onLoad: (data) => {
    // Transform loaded data
    return modifiedData;
  }
});
```

**Parameters:**
- `data` - The raw data loaded from storage

**Returns:**
- Modified data to use in state
- Original data if no changes needed
- `null` to reject/ignore loaded data

**Default:** `null` (no transformation)

  

## Why Does This Exist?

### The Problem: Incompatible or Encrypted Data

Sometimes stored data needs processing before use:

```javascript
// Version 1.0 stored data
localStorage.setItem('settings', JSON.stringify({
  color: 'blue',
  size: 'medium'
}));

// Version 2.0 expects different format
const settings = state({
  theme: { primary: '', secondary: '' },
  dimensions: { width: 0, height: 0 }
});

autoSave(settings, 'settings');
// Loads old format ❌
// App breaks! Fields don't match!
```

**What's the Real Issue?**

```
Load data from storage
        |
        v
Data in old/wrong format
        |
        v
Use directly in app
        |
        v
App crashes ❌
```

**Problems:**
❌ **Format mismatches** - Old data structure doesn't match new  
❌ **Encrypted data** - Can't use without decryption  
❌ **Missing fields** - Old data lacks new required fields  
❌ **No migration path** - Can't upgrade old data  

### The Solution with `options.onLoad`

```javascript
const settings = state({
  theme: { primary: '', secondary: '' },
  dimensions: { width: 0, height: 0 }
});

autoSave(settings, 'settings', {
  onLoad: (data) => {
    // Migrate old format to new format
    if (data.color && data.size) {
      // Old format detected
      return {
        theme: {
          primary: data.color,
          secondary: 'white'
        },
        dimensions: {
          width: data.size === 'large' ? 100 : 50,
          height: data.size === 'large' ? 100 : 50
        }
      };
    }
    
    // Already new format
    return data;
  }
});
```

**What Just Happened?**

```
Load from storage
        |
        v
onLoad callback
        |
        v
Detect format version
        |
        v
Migrate if needed
        |
        v
Return compatible data ✅
```

**Benefits:**
✅ **Data migration** - Upgrade old formats automatically  
✅ **Decryption** - Decrypt data after loading  
✅ **Validation** - Ensure data quality  
✅ **Defaults** - Add missing fields  

  

## Mental Model

Think of loading without onLoad as **opening a box blindly**:

```
No onLoad (Direct Use)
┌─────────────────────┐
│  Open box           │
│                     │
│  Use contents       │
│  as-is              │
│                     │
│  Hope it's correct  │
│  format ❌          │
└─────────────────────┘
```

Think of onLoad as **inspecting and preparing**:

```
With onLoad (Process First)
┌─────────────────────┐
│  Open box           │
│       ↓             │
│  Inspect contents   │
│       ↓             │
│  Decrypt if needed  │
│       ↓             │
│  Upgrade format     │
│       ↓             │
│  Add missing parts  │
│       ↓             │
│  Ready to use ✅    │
└─────────────────────┘
```

**Key Insight:** onLoad ensures loaded data is ready to use.

  

## How Does It Work?

The onLoad callback processes data after loading:

### The Load Pipeline

```
1. Read from localStorage
        |
        v
2. Parse JSON
        |
        v
3. onLoad callback ✨
        |
        v
4. Transform data
        |
        v
5. Populate state
```

### Implementation Flow

```javascript
// Inside autoSave
function load() {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  
  let data = JSON.parse(raw);
  
  // Call onLoad if provided
  if (options.onLoad) {
    data = options.onLoad(data);
  }
  
  // Populate state with transformed data
  Object.assign(state, data);
}
```

  

## Basic Usage

### Example 1: Decrypt Data

```javascript
const privateNotes = state({ content: '' });

autoSave(privateNotes, 'notes', {
  onSave: (data) => encrypt(data),
  onLoad: (data) => decrypt(data)
});

// Data encrypted in storage
// Automatically decrypted when loaded ✅
```

  

### Example 2: Add Default Values

```javascript
const userPrefs = state({
  theme: 'light',
  language: 'en',
  notifications: true  // New field in v2.0
});

autoSave(userPrefs, 'prefs', {
  onLoad: (data) => {
    // Add new fields with defaults if missing
    return {
      theme: data.theme || 'light',
      language: data.language || 'en',
      notifications: data.notifications ?? true  // Default to true
    };
  }
});
```

  

### Example 3: Parse Dates

```javascript
const events = state({ items: [] });

autoSave(events, 'events', {
  onLoad: (data) => {
    // Convert date strings to Date objects
    return {
      items: data.items.map(item => ({
        ...item,
        date: new Date(item.date)
      }))
    };
  }
});
```

  

## Real-World Examples

### Example 1: Version Migration

```javascript
const APP_VERSION = '3.0';

const appState = state({
  version: APP_VERSION,
  settings: {},
  data: []
});

autoSave(appState, 'app', {
  onLoad: (data) => {
    if (!data.version) {
      // Migrate from v1.0 to v3.0
      console.log('Migrating from v1.0...');
      return {
        version: APP_VERSION,
        settings: migrateSettingsV1toV3(data.settings),
        data: migrateDataV1toV3(data.data)
      };
    }
    
    if (data.version === '2.0') {
      // Migrate from v2.0 to v3.0
      console.log('Migrating from v2.0...');
      return {
        version: APP_VERSION,
        settings: migrateSettingsV2toV3(data.settings),
        data: data.data
      };
    }
    
    // Already v3.0
    return data;
  }
});
```

  

### Example 2: Sanitize User Input

```javascript
const userContent = state({ posts: [] });

autoSave(userContent, 'posts', {
  onLoad: (data) => {
    // Sanitize HTML in posts
    return {
      posts: data.posts.map(post => ({
        ...post,
        content: sanitizeHTML(post.content),
        title: escapeHTML(post.title)
      }))
    };
  }
});
```

  

### Example 3: Repair Corrupted Data

```javascript
const listState = state({ items: [] });

autoSave(listState, 'list', {
  onLoad: (data) => {
    // Ensure items is always an array
    if (!Array.isArray(data.items)) {
      console.warn('Corrupted data detected, resetting to empty array');
      return { items: [] };
    }
    
    // Remove invalid items
    return {
      items: data.items.filter(item => 
        item && typeof item === 'object' && item.id
      )
    };
  }
});
```

  

### Example 4: Hydrate References

```javascript
const docState = state({
  content: '',
  attachments: []
});

autoSave(docState, 'document', {
  onSave: (data) => {
    // Save only attachment IDs
    return {
      content: data.content,
      attachments: data.attachments.map(a => a.id)
    };
  },
  onLoad: async (data) => {
    // Load full attachment objects
    const attachments = await Promise.all(
      data.attachments.map(id => fetchAttachment(id))
    );
    
    return {
      content: data.content,
      attachments
    };
  }
});
```

  

### Example 5: Environment-Specific Loading

```javascript
const config = state({
  apiUrl: '',
  debugMode: false
});

autoSave(config, 'config', {
  onLoad: (data) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    return {
      ...data,
      apiUrl: isDev 
        ? 'http://localhost:3000'
        : data.apiUrl,
      debugMode: isDev || data.debugMode
    };
  }
});
```

  

## Common Patterns

### Pattern 1: Schema Validation

```javascript
const schema = {
  name: 'string',
  age: 'number',
  email: 'string'
};

autoSave(state, 'user', {
  onLoad: (data) => {
    // Validate against schema
    Object.keys(schema).forEach(key => {
      const expectedType = schema[key];
      const actualType = typeof data[key];
      
      if (actualType !== expectedType) {
        console.warn(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
        data[key] = getDefaultValue(expectedType);
      }
    });
    
    return data;
  }
});
```

  

### Pattern 2: Deep Merge Defaults

```javascript
const defaults = {
  theme: 'light',
  settings: {
    notifications: true,
    sound: true
  }
};

autoSave(state, 'prefs', {
  onLoad: (data) => {
    return deepMerge(defaults, data);
  }
});
```

  

### Pattern 3: Transform Field Names

```javascript
autoSave(state, 'data', {
  onSave: (data) => {
    // Snake_case for storage
    return {
      user_name: data.userName,
      email_address: data.emailAddress
    };
  },
  onLoad: (data) => {
    // CamelCase for app
    return {
      userName: data.user_name,
      emailAddress: data.email_address
    };
  }
});
```

  

### Pattern 4: Conditional Loading

```javascript
autoSave(state, 'data', {
  onLoad: (data) => {
    // Don't load if data is too old
    if (data.timestamp < Date.now() - 30 * 24 * 60 * 60 * 1000) {
      console.log('Data too old, ignoring');
      return null;  // Don't load
    }
    
    // Don't load if wrong user
    if (data.userId !== currentUserId) {
      console.log('Wrong user data, ignoring');
      return null;
    }
    
    return data;
  }
});
```

  

### Pattern 5: Async Hydration

```javascript
autoSave(state, 'data', {
  autoLoad: false  // Manual load for async
});

// Load and hydrate asynchronously
async function loadData() {
  const raw = localStorage.getItem('data');
  if (!raw) return;
  
  let data = JSON.parse(raw);
  
  // Async transformation
  data = await enrichWithAPIData(data);
  data = await validateWithServer(data);
  
  Object.assign(state, data);
}

loadData();
```

  

## Advanced Techniques

### Technique 1: Multi-Version Migration Chain

```javascript
const migrations = {
  '1.0': (data) => ({ ...data, version: '2.0', newField: 'default' }),
  '2.0': (data) => ({ ...data, version: '3.0', anotherField: [] }),
  '3.0': (data) => ({ ...data, version: '4.0', renamedField: data.oldField })
};

autoSave(state, 'app', {
  onLoad: (data) => {
    let current = data;
    let version = data.version || '1.0';
    
    // Apply migrations in sequence
    while (version !== APP_VERSION && migrations[version]) {
      current = migrations[version](current);
      version = current.version;
    }
    
    return current;
  }
});
```

  

### Technique 2: Rollback on Error

```javascript
autoSave(state, 'data', {
  onLoad: (data) => {
    try {
      // Attempt transformation
      return complexTransform(data);
    } catch (error) {
      console.error('Load transform failed, using defaults', error);
      
      // Fallback to defaults
      return getDefaultState();
    }
  }
});
```

  

### Technique 3: Progressive Enhancement

```javascript
autoSave(state, 'data', {
  onLoad: (data) => {
    // Start with basic data
    const enhanced = { ...data };
    
    // Add computed fields
    enhanced.fullName = `${data.firstName} ${data.lastName}`;
    enhanced.age = calculateAge(data.birthDate);
    
    // Add cached API data if available
    if (sessionStorage.getItem('apiCache')) {
      enhanced.apiData = JSON.parse(sessionStorage.getItem('apiCache'));
    }
    
    return enhanced;
  }
});
```

  

## Combining with onSave

### Pattern: Round-Trip Transformation

```javascript
autoSave(state, 'data', {
  onSave: (data) => {
    // Compress before saving
    return {
      compressed: compress(JSON.stringify(data)),
      timestamp: Date.now()
    };
  },
  onLoad: (data) => {
    // Decompress after loading
    if (data.compressed) {
      return JSON.parse(decompress(data.compressed));
    }
    return data;
  }
});
```

  

## Summary

**What is `options.onLoad`?**  
A callback function that transforms or validates data right after it's loaded from storage.

**Why use it?**
- ✅ Migrate old data formats
- ✅ Decrypt encrypted data
- ✅ Add default values for new fields
- ✅ Validate and sanitize data
- ✅ Hydrate references from IDs

**Key Takeaway:**

```
Without onLoad          With onLoad
      |                      |
Load raw data          Transform first
      |                      |
Use as-is ❌          Ready to use ✅
```

**One-Line Rule:** Use onLoad to prepare data for use after loading from storage.

**Common Use Cases:**
- **Migration**: Upgrade old data formats
- **Decryption**: Decrypt encrypted storage
- **Defaults**: Add missing fields
- **Validation**: Ensure data quality
- **Hydration**: Resolve IDs to objects

**Best Practices:**
- Handle missing fields gracefully
- Migrate data progressively through versions
- Validate data types and structure
- Return null to reject invalid data
- Log migration steps for debugging

**Remember:** onLoad ensures your data is ready to use! 🎉