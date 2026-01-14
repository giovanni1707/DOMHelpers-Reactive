
#  `storageInfo(state)`

## Quick Start (30 seconds)

**Get information about your saved data:**

```javascript
const settings = state({ theme: 'dark', fontSize: 14 });
autoSave(settings, 'appSettings');

const info = storageInfo(settings);

console.log(info);
// {
//   key: 'appSettings',
//   namespace: '',
//   storage: 'localStorage',
//   exists: true,
//   size: 156,
//   sizeKB: 0.2
// }
```

**That's it!** You get all the storage metadata.

 

## What is storageInfo()?

`storageInfo()` is a function that **returns detailed information** about your saved data.

Simply put: **It's the "file properties" dialog for your saved data.**

```javascript
const data = state({ items: [] });
autoSave(data, 'myData', { namespace: 'app' });

const info = storageInfo(data);
console.log(`Stored in: ${info.storage}`);
console.log(`Key: ${info.key}`);
console.log(`Size: ${info.sizeKB} KB`);
```

 

## Syntax

### Shorthand (Recommended)
```javascript
storageInfo(state)
```

### Full Namespace
```javascript
ReactiveUtils.storageInfo(state)
```

### Parameters
- **`state`** - A reactive state object with storage enabled

### Returns
- **`Object`** - Information object with these properties:
  ```javascript
  {
    key: string,        // Storage key
    namespace: string,  // Namespace (if any)
    storage: string,    // 'localStorage' or 'sessionStorage'
    exists: boolean,    // Does data exist?
    size: number,       // Size in bytes
    sizeKB: number      // Size in kilobytes (rounded)
  }
  ```

 

## Why Does This Exist?

### The Challenge

You need to know details about your saved data:

**Without storageInfo():**
```javascript
const data = state({ value: 0 });
autoSave(data, 'myData');

// How much space is it using?
const saved = localStorage.getItem('myData');
const size = saved ? saved.length : 0;
console.log('Size:', size, 'bytes');

// What key was it saved under?
// What namespace?
// Is it in localStorage or sessionStorage?
// Manual detective work!
```

**What's tedious about this?**

❌ Manual localStorage access  
❌ Size calculation  
❌ Remembering configuration details  
❌ No easy overview  

### The Solution with storageInfo()

```javascript
const data = state({ value: 0 });
autoSave(data, 'myData');

const info = storageInfo(data);
console.log(info); // Everything you need!
```

**What's better about this?**

✅ Complete information in one call  
✅ Formatted sizes (bytes + KB)  
✅ All metadata included  
✅ Easy to use  

This method is **especially useful when** debugging storage issues, monitoring storage usage, or displaying storage stats to users.

 

## Mental Model

Think of `storageInfo()` as **right-clicking a file to see "Properties"**.

### File Properties Dialog
```
Name: document.txt
Location: C:\Users\Documents
Size: 1,234 bytes (1.2 KB)
Created: 2024-01-05
```

### storageInfo() Output
```
Key: myData
Storage: localStorage
Namespace: app
Size: 1,234 bytes (1.2 KB)
Exists: true
```

**Key Insight:** All the metadata about your saved data in one place.

 

## How Does It Work?

When you call `storageInfo()`:

```
Step 1: Check State
   ↓
[Does state have $storageInfo method?]
   ↓
   Yes → Continue
   No  → Return error object
   ↓
Step 2: Check Existence
   ↓
[Does data exist in storage?]
   ↓
Step 3: Calculate Size
   ↓
[Get data, measure bytes]
[Convert to KB]
   ↓
Step 4: Gather Info
   ↓
[Collect key, namespace, storage type]
   ↓
Step 5: Return Object
   ↓
[Return complete info object]
```

 

## Basic Usage

### Example 1: Display Storage Stats

```javascript
const userData = state({ name: 'John', email: 'john@example.com' });
autoSave(userData, 'user');

const info = storageInfo(userData);

console.log('=== Storage Info ===');
console.log('Key:', info.key);
console.log('Size:', info.sizeKB, 'KB');
console.log('Exists:', info.exists ? 'Yes' : 'No');
console.log('Storage:', info.storage);
```

 

### Example 2: Check Before Saving

```javascript
const bigData = state({ items: Array(1000).fill({}) });
autoSave(bigData, 'data');

const info = storageInfo(bigData);

if (info.sizeKB > 500) {
  console.warn('Data is very large:', info.sizeKB, 'KB');
  
  if (!confirm('Data is large. Continue saving?')) {
    stopAutoSave(bigData);
  }
}
```

 

### Example 3: Storage Dashboard

```javascript
const user = state({ name: '' });
const settings = state({ theme: 'dark' });
const cache = state({ data: null });

autoSave(user, 'user');
autoSave(settings, 'settings');
autoSave(cache, 'cache');

function showStorageDashboard() {
  const states = [
    { name: 'User', state: user },
    { name: 'Settings', state: settings },
    { name: 'Cache', state: cache }
  ];
  
  console.log('=== Storage Dashboard ===');
  states.forEach(({ name, state }) => {
    const info = storageInfo(state);
    console.log(`${name}: ${info.sizeKB} KB (${info.exists ? '✓' : '✗'})`);
  });
}
```

 

### Example 4: Debug Storage Issues

```javascript
const problematic = state({ data: '' });
autoSave(problematic, 'problem');

const info = storageInfo(problematic);

console.log('Debugging storage...');
console.log('Key:', info.key);
console.log('Namespace:', info.namespace || 'none');
console.log('Storage type:', info.storage);
console.log('Exists:', info.exists);
console.log('Size:', info.size, 'bytes');

if (info.error) {
  console.error('Error:', info.error);
}
```

 

## Deep Dive

### Return Object Structure

Complete object with all properties:

```javascript
const data = state({ value: 'test' });
autoSave(data, 'myKey', {
  storage: 'localStorage',
  namespace: 'myApp'
});

const info = storageInfo(data);

console.log(info);
// {
//   key: 'myKey',              // Storage key
//   namespace: 'myApp',        // Namespace
//   storage: 'localStorage',   // Storage type
//   exists: true,              // Data exists
//   size: 142,                 // Bytes
//   sizeKB: 0.1                // Kilobytes (rounded to 1 decimal)
// }
```

 

### When Data Doesn't Exist

```javascript
const empty = state({ value: 0 });
autoSave(empty, 'empty', { autoLoad: false });

clear(empty); // Remove from storage

const info = storageInfo(empty);

console.log(info);
// {
//   key: 'empty',
//   namespace: '',
//   storage: 'localStorage',
//   exists: false,  // ← Not in storage
//   size: 0,
//   sizeKB: 0
// }
```

 

### Size Calculation

```javascript
const small = state({ a: 1 });
const medium = state({ data: 'x'.repeat(1000) });
const large = state({ items: Array(1000).fill({ name: 'Item' }) });

autoSave(small, 'small');
autoSave(medium, 'medium');
autoSave(large, 'large');

console.log('Small:', storageInfo(small).sizeKB, 'KB');
console.log('Medium:', storageInfo(medium).sizeKB, 'KB');
console.log('Large:', storageInfo(large).sizeKB, 'KB');
```

 

### With Namespace

```javascript
const data = state({ value: 0 });
autoSave(data, 'data', { namespace: 'myApp' });

const info = storageInfo(data);

console.log(info.key);       // 'data'
console.log(info.namespace); // 'myApp'
// Actual storage key is: 'myApp:data'
```

 

## Common Patterns

### Pattern 1: Storage Usage Monitor

```javascript
const states = new Map();
states.set('user', autoSave(state({ name: '' }), 'user'));
states.set('settings', autoSave(state({ theme: '' }), 'settings'));
states.set('cache', autoSave(state({ data: null }), 'cache'));

function getTotalStorage() {
  let total = 0;
  
  states.forEach((state, name) => {
    const info = storageInfo(state);
    total += info.size;
    console.log(`${name}: ${info.sizeKB} KB`);
  });
  
  console.log('Total:', (total / 1024).toFixed(1), 'KB');
}
```

 

### Pattern 2: Quota Warning

```javascript
const bigData = state({ items: [] });
autoSave(bigData, 'data');

function checkQuota() {
  const info = storageInfo(bigData);
  const quotaLimit = 5 * 1024; // 5 MB
  
  if (info.sizeKB > quotaLimit) {
    alert(`Warning: Data size (${info.sizeKB} KB) exceeds limit!`);
    return false;
  }
  
  return true;
}
```

 

### Pattern 3: Storage Report

```javascript
function generateStorageReport() {
  const report = [];
  
  [user, settings, cart, cache].forEach(state => {
    const info = storageInfo(state);
    report.push({
      key: info.key,
      size: info.sizeKB,
      exists: info.exists
    });
  });
  
  return report.sort((a, b) => b.size - a.size);
}

console.table(generateStorageReport());
```

 

### Pattern 4: Cleanup Old Data

```javascript
const states = [data1, data2, data3];

function cleanupLargeData(maxSizeKB) {
  states.forEach(state => {
    const info = storageInfo(state);
    
    if (info.sizeKB > maxSizeKB) {
      console.log(`Clearing ${info.key} (${info.sizeKB} KB)`);
      clear(state);
    }
  });
}

cleanupLargeData(100); // Clear anything over 100 KB
```

 

### Pattern 5: Debug Panel

```javascript
function showDebugPanel(state) {
  const info = storageInfo(state);
  
  const panel = `
    === Storage Debug ===
    Key: ${info.key}
    Namespace: ${info.namespace || 'none'}
    Storage: ${info.storage}
    Exists: ${info.exists ? 'Yes' : 'No'}
    Size: ${info.size} bytes (${info.sizeKB} KB)
    ${info.error ? `Error: ${info.error}` : ''}
  `;
  
  console.log(panel);
}
```

 

## Summary

**What is storageInfo()?**  
A function that returns detailed information about your saved data.

**Key Features:**
- ✅ Complete storage metadata
- ✅ Size in bytes and KB
- ✅ Existence check
- ✅ Storage type and namespace
- ✅ Easy to use

**When to use it:**
- Monitoring storage usage
- Debugging storage issues
- Displaying stats to users
- Checking before large saves
- Building storage dashboards

**Remember:**
```javascript
const info = storageInfo(state);

console.log('Key:', info.key);
console.log('Size:', info.sizeKB, 'KB');
console.log('Exists:', info.exists);
```

**Returns:**
```javascript
{
  key: 'storageKey',
  namespace: 'namespace',
  storage: 'localStorage',
  exists: true,
  size: 1234,
  sizeKB: 1.2
}
```

**Related Methods:**
- `autoSave()` - Enable storage
- `save()` - Save to storage
- `exists()` - Quick existence check
- `clear()` - Remove from storage

 
