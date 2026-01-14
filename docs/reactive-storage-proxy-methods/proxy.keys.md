# `proxy.keys()` - Reactive Storage Proxy Keys Method

## Quick Start (30 seconds)

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Store some values
storage.set('username', 'Alice');
storage.set('theme', 'dark');
storage.set('language', 'en');

// Get all keys
const keys = storage.keys();
console.log(keys); // ['username', 'theme', 'language']

// Use reactively - automatic tracking!
effect(() => {
  const allKeys = storage.keys();
  console.log('Storage has', allKeys.length, 'items');
});

storage.set('score', 100);      // Logs: "Storage has 4 items" ✨
storage.remove('username');     // Logs: "Storage has 3 items" ✨
```

**What just happened?** You listed all storage keys AND automatically tracked changes - code updates when keys are added or removed!

  

## What is `proxy.keys()`?

`proxy.keys()` is a method that **returns an array of all storage keys in the namespace and automatically tracks that list for reactivity**.

Simply put: it's like getting a directory listing, but reactive. When you call it inside an effect, your code will automatically re-run when keys are added or removed from storage.

Think of it as a **smart inventory system** that not only tells you what's in storage but also watches for when items come and go.

  

## Syntax

```javascript
// Get all keys
const keys = proxy.keys()
```

**Parameters:**
- None

**Returns:** 
- `Array<string>` - Array of all storage keys in the namespace

  

## Why Does This Exist?

### The Problem with Regular Storage Enumeration

Here's the traditional way:

```javascript
// Get all keys from localStorage
const keys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('myApp:')) {
    keys.push(key.replace('myApp:', ''));
  }
}

console.log('Keys:', keys);

// Later, add a new item
localStorage.setItem('myApp:newItem', 'value');

// Problem: keys array doesn't update! ❌
console.log('Keys:', keys); // Still old list!

// Must manually rebuild the entire list
const updatedKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('myApp:')) {
    updatedKeys.push(key.replace('myApp:', ''));
  }
}
console.log('Keys:', updatedKeys); // Now updated
```

**What's the Real Issue?**

```
Get list of keys
        |
        v
Store in variable
        |
        v
Add/remove keys from storage
        |
        v
    [NOTHING HAPPENS] ❌
        |
        v
Variable still has old list
        |
        v
Must manually rebuild list everywhere
```

**Problems:**
❌ **Stale lists** - Key array doesn't update when storage changes  
❌ **Manual enumeration** - Complex loop logic to filter by namespace  
❌ **No change tracking** - Can't detect when keys are added/removed  
❌ **Performance** - Must loop through ALL localStorage keys  

### The Solution with `proxy.keys()`

```javascript
const storage = reactiveStorage('localStorage', 'myApp');

// Reactive key tracking
effect(() => {
  const keys = storage.keys();
  console.log('Current keys:', keys);
  console.log('Total items:', keys.length);
});
// Logs: "Current keys: []"
// Logs: "Total items: 0"

// Add a key
storage.set('username', 'Alice');
// Effect automatically re-runs!
// Logs: "Current keys: ['username']"
// Logs: "Total items: 1" ✨

// Add another
storage.set('theme', 'dark');
// Logs: "Current keys: ['username', 'theme']"
// Logs: "Total items: 2" ✨

// Remove one
storage.remove('username');
// Logs: "Current keys: ['theme']"
// Logs: "Total items: 1" ✨
```

**What Just Happened?**

```
storage.keys() inside effect
        |
        v
Tracks _keys set
        |
        v
storage.set() or remove() called
        |
        v
Detects key list changed
        |
        v
Re-runs all effects watching keys
        |
        v
They call keys() again
        |
        v
Get updated list! ✅
```

**Benefits:**
✅ **Automatic tracking** - Key list changes trigger dependent code  
✅ **Always current** - List always reflects current storage state  
✅ **Namespace filtering** - Automatically filters by your namespace  
✅ **Simple API** - No loops, no manual filtering  

  

## Mental Model

Think of regular localStorage enumeration as **manually counting files in a folder**:

```
Regular localStorage enumeration
┌─────────────────────┐
│  Open folder        │
│                     │
│  Count files        │
│  (manual loop)      │
│                     │
│  Write down list    │
│                     │
│  [DONE]             │
│                     │
│  If files added/    │
│  removed, list      │
│  is outdated        │
└─────────────────────┘
```

Now think of `proxy.keys()` as **a smart file system with live updates**:

```
proxy.keys() (Smart Directory)
┌─────────────────────┐
│  Get file list      │
│                     │
│  Install watcher 📡 │
│                     │
│  File added?        │
│       |             │
│       v             │
│  List updates ✨    │
│                     │
│  File removed?      │
│       |             │
│       v             │
│  List updates ✨    │
└─────────────────────┘
```

**Key Insight:** `proxy.keys()` doesn't just list - it **monitors** for when keys come and go.

  

## How Does It Work?

Let's look under the hood at what happens when you call `proxy.keys()`:

### Step-by-Step Process

**1️⃣ Enumerate Storage**
```javascript
const keys = storage.keys();
```

First, it gets all keys from storage:

```
Browser Storage (localStorage)
        |
        v
Get all keys matching namespace
        |
        v
Filter to 'myApp:*'
        |
        v
Strip namespace prefix
        |
        v
Return array: ['username', 'theme', ...]
```

**2️⃣ Track Dependency (if in effect)**
```
Is this call inside an effect?
        |
    YES |  NO
        |   └──> Just return array
        v
Track dependency on _keys
        |
        v
Store reference to current effect
        |
        v
Return array
```

**3️⃣ Automatic Re-run on Change**
```
Later: storage.set() or remove() called
        |
        v
_keys set updated
        |
        v
Effects tracking _keys re-run
        |
        v
They call keys() again
        |
        v
Get new list! ✨
```

### The Magic: Keys Set Tracking

Here's how it works internally:

```javascript
// Inside reactiveStorage()
const reactiveState = state({
  _version: 0,
  _keys: new Set(store.keys())  // Set of all current keys
});

// When you call keys()
proxy.keys = function() {
  // ✨ This line tracks the _keys set!
  const _ = reactiveState._keys;
  
  // Now get the actual keys
  return store.keys();
}

// When keys change
function notify() {
  batch(() => {
    reactiveState._version++;
    reactiveState._keys = new Set(store.keys());  // ✨ Triggers watchers!
  });
}
```

**What's happening?**
- `keys()` reads `_keys` set to track it
- When `set()` or `remove()` changes keys, `_keys` updates
- All effects that read `_keys` automatically re-run
- They call `keys()` again and get the updated list

  

## Basic Usage

### Example 1: List All Keys

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Store some data
storage.set('username', 'Alice');
storage.set('email', 'alice@example.com');
storage.set('theme', 'dark');

// Get all keys
const keys = storage.keys();
console.log(keys);
// ['username', 'email', 'theme']

// Check count
console.log('Total keys:', keys.length); // 3
```

  

### Example 2: Iterate Over Keys

```javascript
const storage = reactiveStorage('localStorage', 'app');

storage.set('firstName', 'Alice');
storage.set('lastName', 'Johnson');
storage.set('age', 25);

// Loop through all keys
const keys = storage.keys();
keys.forEach(key => {
  const value = storage.get(key);
  console.log(`${key}:`, value);
});
// firstName: Alice
// lastName: Johnson
// age: 25
```

  

### Example 3: Check If Empty

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Check if storage is empty
const keys = storage.keys();

if (keys.length === 0) {
  console.log('Storage is empty');
} else {
  console.log('Storage has', keys.length, 'items');
}
```

  

## Reactive Key Lists

### Example 1: Display Storage Contents

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Display all storage contents
effect(() => {
  const keys = storage.keys();
  const list = document.getElementById('storage-list');
  
  if (keys.length === 0) {
    list.innerHTML = '<li>No items in storage</li>';
    return;
  }
  
  list.innerHTML = keys.map(key => {
    const value = storage.get(key);
    return `<li><strong>${key}:</strong> ${value}</li>`;
  }).join('');
});

// Add items - list updates automatically!
storage.set('username', 'Alice');  // List updates ✨
storage.set('theme', 'dark');      // List updates ✨
storage.remove('username');        // List updates ✨
```

  

### Example 2: Storage Size Indicator

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Show storage size
effect(() => {
  const keys = storage.keys();
  const indicator = document.getElementById('storage-size');
  
  indicator.textContent = `${keys.length} items in storage`;
  
  // Color code based on size
  if (keys.length === 0) {
    indicator.className = 'empty';
  } else if (keys.length < 10) {
    indicator.className = 'normal';
  } else {
    indicator.className = 'full';
  }
});

storage.set('item1', 'value1');  // Updates to "1 items" ✨
storage.set('item2', 'value2');  // Updates to "2 items" ✨
```

  

### Example 3: Filter and Display

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Display only settings keys
effect(() => {
  const keys = storage.keys();
  const settingsKeys = keys.filter(key => key.startsWith('setting_'));
  
  const list = document.getElementById('settings-list');
  list.innerHTML = settingsKeys.map(key => {
    const value = storage.get(key);
    return `<div>${key}: ${value}</div>`;
  }).join('');
  
  console.log('Settings count:', settingsKeys.length);
});

storage.set('setting_theme', 'dark');        // Shows in list ✨
storage.set('setting_language', 'en');       // Shows in list ✨
storage.set('userData', { name: 'Alice' });  // Doesn't show (filtered out)
```

  

### Example 4: Real-time Search

```javascript
const storage = reactiveStorage('localStorage', 'app');
const searchState = state({ query: '' });

// Search through storage keys
effect(() => {
  const keys = storage.keys();
  const query = searchState.query.toLowerCase();
  
  const results = keys.filter(key => 
    key.toLowerCase().includes(query)
  );
  
  const resultsEl = document.getElementById('search-results');
  resultsEl.innerHTML = results.map(key => 
    `<div>${key}: ${storage.get(key)}</div>`
  ).join('');
  
  document.getElementById('result-count').textContent = 
    `${results.length} results`;
});

// Search updates automatically
document.getElementById('search').oninput = (e) => {
  searchState.query = e.target.value;
};
```

  

## Real-World Examples

### Example 1: Storage Manager UI

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Build storage manager
effect(() => {
  const keys = storage.keys();
  const manager = document.getElementById('storage-manager');
  
  if (keys.length === 0) {
    manager.innerHTML = '<p>No data stored</p>';
    return;
  }
  
  manager.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${keys.map(key => {
          const value = JSON.stringify(storage.get(key));
          return `
            <tr>
              <td>${key}</td>
              <td>${value}</td>
              <td>
                <button onclick="deleteItem('${key}')">Delete</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    <p>Total: ${keys.length} items</p>
  `;
});

function deleteItem(key) {
  storage.remove(key);
  // Table updates automatically! ✨
}
```

  

### Example 2: Backup and Export

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Export all data
function exportData() {
  const keys = storage.keys();
  const data = {};
  
  keys.forEach(key => {
    data[key] = storage.get(key);
  });
  
  const json = JSON.stringify(data, null, 2);
  downloadFile('backup.json', json);
}

// Import data
function importData(json) {
  const data = JSON.parse(json);
  
  batch(() => {
    Object.entries(data).forEach(([key, value]) => {
      storage.set(key, value);
    });
  });
  // UI updates with all imported data! ✨
}

// Show export button only when data exists
effect(() => {
  const keys = storage.keys();
  const exportBtn = document.getElementById('export-btn');
  
  exportBtn.disabled = keys.length === 0;
  exportBtn.textContent = keys.length > 0 
    ? `Export ${keys.length} items`
    : 'No data to export';
});
```

  

### Example 3: Namespace Browser

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Browse storage by prefix
const prefixes = ['user_', 'setting_', 'cache_', 'temp_'];

effect(() => {
  const keys = storage.keys();
  const browser = document.getElementById('namespace-browser');
  
  browser.innerHTML = prefixes.map(prefix => {
    const matching = keys.filter(k => k.startsWith(prefix));
    
    return `
      <div class="namespace">
        <h3>${prefix} (${matching.length})</h3>
        <ul>
          ${matching.map(key => 
            `<li>${key.replace(prefix, '')}</li>`
          ).join('')}
        </ul>
      </div>
    `;
  }).join('');
});

storage.set('user_name', 'Alice');       // Appears under user_ ✨
storage.set('setting_theme', 'dark');    // Appears under setting_ ✨
```

  

### Example 4: Storage Quota Monitor

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Monitor storage usage
effect(() => {
  const keys = storage.keys();
  
  // Calculate approximate size
  let totalSize = 0;
  keys.forEach(key => {
    const value = storage.get(key);
    totalSize += JSON.stringify(value).length;
    totalSize += key.length;
  });
  
  const sizeKB = (totalSize / 1024).toFixed(2);
  const quotaMB = 5; // Typical localStorage limit
  const usedPercent = ((totalSize / (quotaMB * 1024 * 1024)) * 100).toFixed(1);
  
  const monitor = document.getElementById('quota-monitor');
  monitor.innerHTML = `
    <div class="quota-bar">
      <div class="quota-used" style="width: ${usedPercent}%"></div>
    </div>
    <p>${keys.length} items · ${sizeKB} KB · ${usedPercent}% used</p>
  `;
  
  // Warn if getting full
  if (usedPercent > 80) {
    monitor.classList.add('warning');
  }
});
```

  

### Example 5: Recent Items List

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Track items with timestamps
function addItem(key, value) {
  storage.set(key, {
    value,
    timestamp: Date.now()
  });
}

// Show recent items
effect(() => {
  const keys = storage.keys();
  
  // Get items with timestamps
  const items = keys
    .map(key => ({
      key,
      data: storage.get(key)
    }))
    .filter(item => item.data && item.data.timestamp)
    .sort((a, b) => b.data.timestamp - a.data.timestamp)
    .slice(0, 5); // Top 5 recent
  
  const list = document.getElementById('recent-items');
  list.innerHTML = items.map(item => {
    const ago = timeAgo(item.data.timestamp);
    return `
      <div class="recent-item">
        <strong>${item.key}</strong>
        <span>${ago}</span>
      </div>
    `;
  }).join('');
});
```

  

## Common Patterns

### Pattern 1: Check If Empty

```javascript
const storage = reactiveStorage('localStorage', 'app');

const isEmpty = storage.keys().length === 0;

if (isEmpty) {
  console.log('Storage is empty');
}
```

  

### Pattern 2: Find Keys by Pattern

```javascript
const storage = reactiveStorage('localStorage', 'app');

// Find all cache keys
const cacheKeys = storage.keys().filter(key => 
  key.startsWith('cache_')
);

console.log('Cache keys:', cacheKeys);
```

  

### Pattern 3: Count by Prefix

```javascript
const storage = reactiveStorage('localStorage', 'app');

function countByPrefix(prefix) {
  return storage.keys().filter(key => 
    key.startsWith(prefix)
  ).length;
}

const userCount = countByPrefix('user_');
const settingCount = countByPrefix('setting_');
```

  

### Pattern 4: Export All Data

```javascript
const storage = reactiveStorage('localStorage', 'app');

function exportAll() {
  const data = {};
  
  storage.keys().forEach(key => {
    data[key] = storage.get(key);
  });
  
  return data;
}

const backup = exportAll();
```

  

### Pattern 5: Clear by Pattern

```javascript
const storage = reactiveStorage('localStorage', 'app');

function clearByPattern(pattern) {
  const keys = storage.keys().filter(key => 
    key.includes(pattern)
  );
  
  batch(() => {
    keys.forEach(key => storage.remove(key));
  });
  
  return keys.length;
}

const cleared = clearByPattern('temp_');
console.log('Cleared', cleared, 'temporary items');
```

  

### Pattern 6: Key Statistics

```javascript
const storage = reactiveStorage('localStorage', 'app');

function getStats() {
  const keys = storage.keys();
  
  return {
    total: keys.length,
    prefixes: {
      user: keys.filter(k => k.startsWith('user_')).length,
      setting: keys.filter(k => k.startsWith('setting_')).length,
      cache: keys.filter(k => k.startsWith('cache_')).length
    },
    oldest: keys[0],
    newest: keys[keys.length - 1]
  };
}

const stats = getStats();
console.log(stats);
```

  

## Summary

**What is `proxy.keys()`?**  
A method that returns an array of all storage keys in the namespace and automatically tracks that list for reactivity.

**Why use it?**
- ✅ Automatic tracking of key additions/removals
- ✅ Always returns current list
- ✅ Automatic namespace filtering
- ✅ Simple array interface
- ✅ Perfect for storage management UIs

**Key Takeaway:**

```
Regular Enumeration         proxy.keys()
         |                       |
Loop through storage       Get key array
         |                       |
Filter manually           Auto-filtered
         |                       |
     Get array             Track changes
         |                       |
      [DONE]              Auto-update! ✨
```

**One-Line Rule:** `proxy.keys()` = get current storage keys + automatic tracking of list changes.

**When to use `proxy.keys()`:**
- Building storage management UIs
- Monitoring storage size
- Implementing search/filter features
- Export/backup functionality
- Storage quota monitoring
- Displaying recent items

**Remember:** List once, stay updated forever! 🎉