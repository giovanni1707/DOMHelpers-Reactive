# `options.onSave` - Pre-Save Transform Callback

## Quick Start (30 seconds)

```javascript
const userData = state({
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret123'
});

// Without onSave - saves everything as-is
autoSave(userData, 'user');
// Saves password to storage ❌ Security risk!

// With onSave - transform before saving
autoSave(userData, 'user', {
  onSave: (data) => {
    // Remove sensitive data before saving
    const { password, ...safeData } = data;
    return safeData;  // Only save safe data ✨
  }
});
```

**What just happened?** You transformed data before saving - removing sensitive fields and customizing what gets stored!

  

## What is `options.onSave`?

`options.onSave` is a callback function that **transforms or validates data right before it's saved to storage**.

Simply put: it's like a security checkpoint or filter. Data passes through this function, and you can modify, clean, or even reject it before it goes to storage.

Think of it as **a gatekeeper** that inspects and transforms data on its way to storage.

  

## Syntax

```javascript
autoSave(state, key, {
  onSave: (data) => {
    // Transform data
    return modifiedData;
  }
});
```

**Parameters:**
- `data` - The current state object being saved

**Returns:**
- Modified data to save
- Original data if no changes needed
- Throw error to prevent save

**Default:** `null` (no transformation)

  

## Why Does This Exist?

### The Problem: Unwanted Data in Storage

Sometimes you need to filter or transform data before saving:

```javascript
const appState = state({
  user: { name: 'Alice', password: 'secret' },
  cache: { /* 10MB of data */ },
  tempData: { /* temporary info */ }
});

// Without onSave - everything saved
autoSave(appState, 'app');

// Problems:
// - Password saved to localStorage ❌ Security risk!
// - Huge cache bloats storage ❌ Performance issue!
// - Temporary data persisted ❌ Not needed!
```

**What's the Real Issue?**

```
State → Storage
  |
  v
Everything saved as-is
  |
  v
Sensitive data exposed ❌
Large data bloats storage ❌
Unnecessary data persisted ❌
```

**Problems:**
❌ **Security risks** - Sensitive data in storage  
❌ **Storage bloat** - Unnecessary data takes space  
❌ **Privacy issues** - Personal data persisted  
❌ **No validation** - Invalid data can be saved  

### The Solution with `options.onSave`

```javascript
const appState = state({
  user: { name: 'Alice', password: 'secret' },
  cache: { /* data */ },
  tempData: { /* temp */ }
});

autoSave(appState, 'app', {
  onSave: (data) => {
    return {
      // Remove password
      user: { name: data.user.name },
      // Don't save cache
      // Don't save tempData
      
      // Only save what's needed ✅
    };
  }
});
```

**What Just Happened?**

```
State → onSave → Storage
         |
         v
    Transform data
         |
         v
Remove sensitive info ✅
Exclude large data ✅
Add metadata ✅
```

**Benefits:**
✅ **Security** - Filter sensitive data  
✅ **Privacy** - Control what persists  
✅ **Optimization** - Save only necessary data  
✅ **Validation** - Ensure data quality  

  

## Mental Model

Think of saving without onSave as **packing everything in a box**:

```
No onSave (Pack Everything)
┌─────────────────────┐
│  All your stuff:    │
│  ├─ Important docs  │
│  ├─ Trash          │
│  ├─ Passwords      │
│  └─ Junk           │
│                     │
│  Everything goes in │
│  the box ❌         │
└─────────────────────┘
```

Think of onSave as **carefully selecting what to pack**:

```
With onSave (Selective Packing)
┌─────────────────────┐
│  Review items:      │
│  ✅ Important docs  │
│  ❌ Trash (skip)    │
│  ❌ Passwords (skip)│
│  ❌ Junk (skip)     │
│                     │
│  Only pack what's   │
│  needed ✅          │
└─────────────────────┘
```

**Key Insight:** onSave lets you control exactly what gets stored.

  

## How Does It Work?

The onSave callback intercepts data before storage:

### The Save Pipeline

```
1. State changes
        |
        v
2. Debounce timer (if configured)
        |
        v
3. onSave callback ✨
        |
        v
4. Transform data
        |
        v
5. Save to localStorage
```

### Implementation Flow

```javascript
// Inside autoSave
function save() {
  let dataToSave = getCurrentStateData();
  
  // Call onSave if provided
  if (options.onSave) {
    dataToSave = options.onSave(dataToSave);
  }
  
  // Save transformed data
  localStorage.setItem(key, JSON.stringify(dataToSave));
}
```

  

## Basic Usage

### Example 1: Remove Sensitive Fields

```javascript
const user = state({
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret',
  ssn: '123-45-6789'
});

autoSave(user, 'user', {
  onSave: (data) => {
    // Remove sensitive fields
    const { password, ssn, ...safe } = data;
    return safe;
  }
});

// Storage only has: { name, email }
// Password and SSN never saved ✅
```

  

### Example 2: Add Metadata

```javascript
const docState = state({ content: '' });

autoSave(docState, 'document', {
  onSave: (data) => {
    // Add save timestamp
    return {
      ...data,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };
  }
});
```

  

### Example 3: Compress Large Data

```javascript
const largeState = state({ items: [] });

autoSave(largeState, 'data', {
  onSave: (data) => {
    // Only save summary for large arrays
    if (data.items.length > 100) {
      return {
        itemCount: data.items.length,
        summary: 'Large dataset'
      };
    }
    return data;
  }
});
```

  

## Real-World Examples

### Example 1: Form with Sensitive Data

```javascript
const paymentForm = state({
  cardNumber: '',
  cvv: '',
  expiry: '',
  name: '',
  billingAddress: {}
});

autoSave(paymentForm, 'payment', {
  onSave: (data) => {
    // Never save card number or CVV
    return {
      name: data.name,
      billingAddress: data.billingAddress,
      // Card info excluded ✅
      lastFour: data.cardNumber.slice(-4)  // Only last 4 digits
    };
  },
  expires: 300  // Also expire quickly
});
```

  

### Example 2: Validate Before Save

```javascript
const settingsState = state({
  theme: 'light',
  fontSize: 16,
  language: 'en'
});

autoSave(settingsState, 'settings', {
  onSave: (data) => {
    // Validate fontSize
    if (data.fontSize < 10 || data.fontSize > 24) {
      console.error('Invalid fontSize, using default');
      data.fontSize = 16;
    }
    
    // Validate theme
    const validThemes = ['light', 'dark'];
    if (!validThemes.includes(data.theme)) {
      data.theme = 'light';
    }
    
    return data;
  }
});
```

  

### Example 3: Compress JSON for Storage

```javascript
const chatHistory = state({ messages: [] });

autoSave(chatHistory, 'chat', {
  onSave: (data) => {
    // Keep only last 50 messages
    return {
      messages: data.messages.slice(-50),
      totalCount: data.messages.length
    };
  }
});
```

  

### Example 4: Encrypt Before Storage

```javascript
const privateData = state({
  notes: '',
  secrets: []
});

autoSave(privateData, 'private', {
  onSave: (data) => {
    // Encrypt sensitive data
    return {
      notes: encrypt(data.notes),
      secrets: data.secrets.map(s => encrypt(s)),
      encrypted: true
    };
  }
});
```

  

### Example 5: Delta Storage

```javascript
let previousState = null;

const docState = state({ content: '', title: '' });

autoSave(docState, 'document', {
  onSave: (data) => {
    if (!previousState) {
      // First save - save everything
      previousState = JSON.parse(JSON.stringify(data));
      return data;
    }
    
    // Subsequent saves - only save changes
    const changes = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== previousState[key]) {
        changes[key] = data[key];
      }
    });
    
    previousState = JSON.parse(JSON.stringify(data));
    
    return {
      ...changes,
      isPartial: true,
      timestamp: Date.now()
    };
  }
});
```

  

## Common Patterns

### Pattern 1: Whitelist Fields

```javascript
const ALLOWED_FIELDS = ['name', 'email', 'preferences'];

autoSave(state, 'data', {
  onSave: (data) => {
    const filtered = {};
    ALLOWED_FIELDS.forEach(field => {
      if (field in data) {
        filtered[field] = data[field];
      }
    });
    return filtered;
  }
});
```

  

### Pattern 2: Blacklist Fields

```javascript
const EXCLUDED_FIELDS = ['password', 'secret', 'temp'];

autoSave(state, 'data', {
  onSave: (data) => {
    const filtered = { ...data };
    EXCLUDED_FIELDS.forEach(field => {
      delete filtered[field];
    });
    return filtered;
  }
});
```

  

### Pattern 3: Deep Clean

```javascript
autoSave(state, 'data', {
  onSave: (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      // Remove functions
      if (typeof value === 'function') return undefined;
      
      // Remove null values
      if (value === null) return undefined;
      
      // Remove empty arrays
      if (Array.isArray(value) && value.length === 0) return undefined;
      
      return value;
    }));
  }
});
```

  

### Pattern 4: Size Limit

```javascript
const MAX_SIZE = 5000; // 5KB

autoSave(state, 'data', {
  onSave: (data) => {
    const json = JSON.stringify(data);
    
    if (json.length > MAX_SIZE) {
      console.warn('Data too large, saving summary only');
      return {
        summary: 'Data truncated',
        size: json.length
      };
    }
    
    return data;
  }
});
```

  

### Pattern 5: Versioning

```javascript
let saveCount = 0;

autoSave(state, 'data', {
  onSave: (data) => {
    return {
      ...data,
      _meta: {
        version: saveCount++,
        savedAt: Date.now(),
        userAgent: navigator.userAgent
      }
    };
  }
});
```

  

### Pattern 6: Prevent Save on Condition

```javascript
autoSave(state, 'data', {
  onSave: (data) => {
    // Don't save if data is invalid
    if (!validateData(data)) {
      throw new Error('Invalid data - save prevented');
    }
    
    // Don't save empty data
    if (Object.keys(data).length === 0) {
      throw new Error('Empty data - save prevented');
    }
    
    return data;
  },
  onError: (error) => {
    console.log('Save prevented:', error.message);
  }
});
```

  

## Advanced Techniques

### Technique 1: Conditional Transformation

```javascript
autoSave(state, 'data', {
  onSave: (data) => {
    // Different transforms based on data type
    if (data.type === 'public') {
      return data;  // Save everything
    }
    
    if (data.type === 'private') {
      return encrypt(data);  // Encrypt private data
    }
    
    if (data.type === 'temporary') {
      return null;  // Don't save temporary data
    }
    
    return data;
  }
});
```

  

### Technique 2: Multi-Stage Pipeline

```javascript
const transforms = [
  (data) => removeSensitiveFields(data),
  (data) => validateData(data),
  (data) => compressLargeFields(data),
  (data) => addMetadata(data)
];

autoSave(state, 'data', {
  onSave: (data) => {
    return transforms.reduce((current, transform) => {
      return transform(current);
    }, data);
  }
});
```

  

### Technique 3: Diff-Based Saving

```javascript
let lastSaved = null;

autoSave(state, 'data', {
  onSave: (data) => {
    if (!lastSaved) {
      lastSaved = data;
      return { full: data };
    }
    
    const diff = computeDiff(lastSaved, data);
    lastSaved = data;
    
    return { diff, timestamp: Date.now() };
  }
});
```

  

## Summary

**What is `options.onSave`?**  
A callback function that transforms or validates data right before it's saved to storage.

**Why use it?**
- ✅ Remove sensitive data
- ✅ Add metadata (timestamps, versions)
- ✅ Validate data before saving
- ✅ Compress large data
- ✅ Control what gets persisted

**Key Takeaway:**

```
Without onSave          With onSave
      |                      |
Save everything        Transform first
      |                      |
Sensitive data ❌      Filtered data ✅
```

**One-Line Rule:** Use onSave to control and transform what gets saved to storage.

**Common Use Cases:**
- **Security**: Remove passwords, tokens, PII
- **Optimization**: Compress or truncate large data
- **Validation**: Ensure data quality before save
- **Metadata**: Add timestamps, versions, checksums
- **Privacy**: Filter personal information

**Best Practices:**
- Always remove sensitive fields
- Validate data before saving
- Keep transforms simple and fast
- Return original data if no changes needed
- Throw error to prevent invalid saves

**Remember:** onSave is your data guardian before storage! 🎉