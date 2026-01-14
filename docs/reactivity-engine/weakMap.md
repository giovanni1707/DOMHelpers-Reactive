# WeakMap (The Invisible Notebook)

## The Invisible Storage Mystery

You've seen this pattern in the reactive code:

```javascript
const reactiveMap = new WeakMap();

function state(data) {
  const proxy = new Proxy(data, { /* ... */ });
  
  // Store secret data about this proxy
  reactiveMap.set(proxy, {
    deps: new Map(),
    computedMap: new Map()
  });
  
  return proxy;
}
```

**Questions that might pop up:**
- Why not just `proxy.deps = new Map()`? 
- What's this WeakMap thing?
- Why is it "weak"?
- Where does this data go?

Let's uncover the mystery! 🔍

 

## What is a WeakMap? (No Jargon)

### Simple Definition

A **WeakMap** is like a **secret notebook** where you can attach hidden notes to objects without anyone seeing them.

Think of it as **invisible sticky notes** that you can put on objects. The object doesn't know the note is there, but you can always look it up later.

### The Key Point

With a WeakMap, you can store **metadata** (extra information) about objects **without modifying the objects themselves**.

```javascript
// Instead of this (modifying the object):
user.__secretData = { tracked: true, visits: 5 };

// You do this (invisible storage):
const secrets = new WeakMap();
secrets.set(user, { tracked: true, visits: 5 });
```

The user object stays clean and doesn't know about the secret data!

 

## Real-World Analogy

### The Library Card Catalog

Imagine a library with two systems:

#### **System 1: Writing in Books** ❌

```
Book: "Harry Potter"
Someone writes inside the cover:
  "Borrowed by: Alice"
  "Return date: Jan 15"
  "Condition: Good"
```

**Problems:**
- ❌ The book itself gets messy
- ❌ Everyone can see the notes
- ❌ Hard to remove the writing later

 

#### **System 2: Separate Card Catalog** ✅

```
Book: "Harry Potter" (stays pristine)

Card Catalog (WeakMap):
┌──────────────────────────────────┐
│ Book: Harry Potter               │
│ ├─ Borrowed by: Alice            │
│ ├─ Return date: Jan 15           │
│ └─ Condition: Good               │
└──────────────────────────────────┘
```

**Benefits:**
- ✅ The book stays clean
- ✅ Only librarians see the catalog
- ✅ Easy to update or remove entries
- ✅ When book is destroyed, the card gets automatically thrown away

**That's exactly what a WeakMap does!**

 

## Regular Objects vs Maps vs WeakMaps

### Option 1: Regular Object (Old School)

```javascript
const userDatabase = {};

const alice = { name: 'Alice' };

// Store data about alice
userDatabase[alice] = { visits: 5 };
// Uh oh! This converts alice to a string: "[object Object]"

console.log(userDatabase);
// { "[object Object]": { visits: 5 } }
```

**Problem:** Objects can only have **string keys**, so your object gets converted to a string! ❌

 

### Option 2: Map (Better)

```javascript
const userDatabase = new Map();

const alice = { name: 'Alice' };
const bob = { name: 'Bob' };

// Store data using objects as keys
userDatabase.set(alice, { visits: 5 });
userDatabase.set(bob, { visits: 3 });

console.log(userDatabase.get(alice)); // { visits: 5 }
console.log(userDatabase.get(bob));   // { visits: 3 }
```

**Better!** Maps can use **objects as keys**. ✅

**But there's a problem:**

```javascript
// Alice leaves the app
alice = null;

// But the Map still holds a reference to the old alice object
console.log(userDatabase.size); // Still 2!

// The data about alice is stuck in memory forever! 😱
```

 

### Option 3: WeakMap (Perfect for Metadata)

```javascript
const userDatabase = new WeakMap();

let alice = { name: 'Alice' };
let bob = { name: 'Bob' };

// Store data using objects as keys
userDatabase.set(alice, { visits: 5 });
userDatabase.set(bob, { visits: 3 });

console.log(userDatabase.get(alice)); // { visits: 5 }

// Alice leaves the app
alice = null;

// The WeakMap automatically removes alice's data! 🎉
// (You can't see this directly, but it happens automatically)
```

**Perfect!** When the object is no longer needed, the WeakMap entry disappears automatically. ✅

 

## How WeakMap Works

### The Basic API

WeakMap has only **4 methods**:

```javascript
const secrets = new WeakMap();

const obj = { name: 'Alice' };

// 1. SET - Store data
secrets.set(obj, { tracked: true, count: 0 });

// 2. GET - Retrieve data
const data = secrets.get(obj);
console.log(data); // { tracked: true, count: 0 }

// 3. HAS - Check if data exists
console.log(secrets.has(obj)); // true

// 4. DELETE - Remove data
secrets.delete(obj);
console.log(secrets.has(obj)); // false
```

**That's it! Super simple.** 🎯

 

### What You CAN'T Do

```javascript
const secrets = new WeakMap();

// ❌ Can't loop through it
for (let item of secrets) { } // Error!

// ❌ Can't get all keys
secrets.keys(); // Doesn't exist!

// ❌ Can't get the size
secrets.size; // undefined!

// ❌ Can't clear everything
secrets.clear(); // Doesn't exist!

// ❌ Can't use primitive values as keys
secrets.set('alice', {}); // Error! Key must be an object
secrets.set(42, {});       // Error! Key must be an object
```

**Why these limitations?** Because WeakMap is designed to be **invisible and automatic**. You can't inspect it because it's meant to be private metadata storage.

 

## Step-by-Step: Building Your First WeakMap

### Example: Secret User Tracking

Let's build a system that tracks user activity **without modifying user objects**.

 

### Step 1: Create the WeakMap

```javascript
const userActivity = new WeakMap();
```

Think of this as creating an **invisible filing cabinet**.

 

### Step 2: Create User Objects

```javascript
const alice = { name: 'Alice', age: 30 };
const bob = { name: 'Bob', age: 25 };
```

Just regular objects. Nothing special yet.

 

### Step 3: Store Hidden Data

```javascript
// Attach invisible data to alice
userActivity.set(alice, {
  visits: 0,
  lastLogin: null,
  preferences: { theme: 'dark' }
});

// Attach invisible data to bob
userActivity.set(bob, {
  visits: 0,
  lastLogin: null,
  preferences: { theme: 'light' }
});
```

**What just happened?**

```
alice (the object)          userActivity (the WeakMap)
┌──────────────────┐       ┌──────────────────────────┐
│ name: 'Alice'    │  ←──  │ alice → {                │
│ age: 30          │       │   visits: 0,             │
└──────────────────┘       │   lastLogin: null,       │
                           │   preferences: {...}     │
                           │ }                        │
                           └──────────────────────────┘
```

The arrow is **invisible**! Alice doesn't know she's being tracked.

 

### Step 4: Update the Hidden Data

```javascript
// User logs in
function login(user) {
  const activity = userActivity.get(user);
  activity.visits++;
  activity.lastLogin = new Date();
}

login(alice);
login(alice);
login(bob);

console.log(userActivity.get(alice));
// { visits: 2, lastLogin: [Date], preferences: {...} }

console.log(userActivity.get(bob));
// { visits: 1, lastLogin: [Date], preferences: {...} }
```

**Notice:** We never modified `alice` or `bob` objects themselves! ✨

 

### Step 5: The Magic Cleanup

```javascript
// Alice deletes her account
alice = null;

// The WeakMap automatically removes alice's tracking data!
// (This happens behind the scenes by JavaScript's garbage collector)

// Bob's data is still there
console.log(userActivity.get(bob)); // Still works!
```

**Visual:**

```
Before (alice exists):
┌────────────────────────────┐
│ userActivity (WeakMap)     │
│ ├─ alice → { visits: 2 }   │
│ └─ bob → { visits: 1 }     │
└────────────────────────────┘

After (alice = null):
┌────────────────────────────┐
│ userActivity (WeakMap)     │
│ └─ bob → { visits: 1 }     │  ← alice's entry automatically removed!
└────────────────────────────┘
```

 

## The "Weak" Part Explained

### What Does "Weak" Mean?

The "weak" in WeakMap means the **reference is weak**, not strong.

### Strong Reference (Normal)

```javascript
const users = [];

let alice = { name: 'Alice' };

users.push(alice); // Strong reference

// Even if you do this:
alice = null;

// The object still exists in memory because users array holds it
console.log(users[0]); // { name: 'Alice' } - Still there!
```

**Strong reference = Keeps object alive** 💪

 

### Weak Reference (WeakMap)

```javascript
const metadata = new WeakMap();

let alice = { name: 'Alice' };

metadata.set(alice, { tracked: true });

// When you do this:
alice = null;

// The WeakMap does NOT keep the object alive
// JavaScript's garbage collector can clean it up
// And the WeakMap entry disappears automatically
```

**Weak reference = Doesn't keep object alive** 🍃

 

### Visual Comparison

#### **Strong Reference (Array/Map)**

```
Code says: alice = null
        ↓
┌────────────────────────────────────┐
│ I want to delete alice             │
└────────────┬───────────────────────┘
             │
             ↓
┌────────────────────────────────────┐
│ Sorry! The array still needs it    │
│ Alice object stays in memory       │
└────────────────────────────────────┘
```

#### **Weak Reference (WeakMap)**

```
Code says: alice = null
        ↓
┌────────────────────────────────────┐
│ I want to delete alice             │
└────────────┬───────────────────────┘
             │
             ↓
┌────────────────────────────────────┐
│ No problem! WeakMap lets go        │
│ Alice object gets cleaned up       │
│ WeakMap entry disappears too       │
└────────────────────────────────────┘
```

 

## Why This Is Perfect for Reactivity

### The Problem: Storing Metadata

In reactive systems, we need to store extra data about objects:

```javascript
// For each reactive state, we need to track:
// - Which effects depend on which properties
// - Which properties are computed
// - Cleanup functions
// Etc.
```

**Bad Solution: Modify the Object** ❌

```javascript
function state(data) {
  const proxy = new Proxy(data, { /* ... */ });
  
  // ❌ This pollutes the object
  proxy.__deps = new Map();
  proxy.__computedMap = new Map();
  proxy.__cleanups = [];
  
  return proxy;
}

const myState = state({ count: 0 });

console.log(Object.keys(myState));
// ['count', '__deps', '__computedMap', '__cleanups'] 😱
```

**Problems:**
- ❌ Pollutes the object with internal properties
- ❌ Users can see and modify internal data
- ❌ Could conflict with user's property names
- ❌ Shows up in loops and Object.keys()

 

### **Good Solution: WeakMap** ✅

```javascript
const reactiveMap = new WeakMap(); // Invisible storage!

function state(data) {
  const proxy = new Proxy(data, { /* ... */ });
  
  // ✅ Store metadata invisibly
  reactiveMap.set(proxy, {
    deps: new Map(),
    computedMap: new Map(),
    cleanups: []
  });
  
  return proxy;
}

const myState = state({ count: 0 });

console.log(Object.keys(myState));
// ['count'] - Clean! ✨
```

**Benefits:**
- ✅ Object stays pristine
- ✅ Metadata is hidden
- ✅ No naming conflicts
- ✅ Automatic cleanup when proxy is destroyed

 

### How It's Used in DOM Helpers Reactive

```javascript
const reactiveMap = new WeakMap();

function createReactive(target) {
  const deps = new Map();
  const computedMap = new Map();
  
  const proxy = new Proxy(target, {
    get(obj, key) {
      // Access metadata
      const meta = reactiveMap.get(proxy);
      
      // Track dependency
      if (currentEffect) {
        if (!meta.deps.has(key)) {
          meta.deps.set(key, new Set());
        }
        meta.deps.get(key).add(currentEffect);
      }
      
      return obj[key];
    },
    
    set(obj, key, value) {
      obj[key] = value;
      
      // Access metadata
      const meta = reactiveMap.get(proxy);
      
      // Trigger effects
      const effects = meta.deps.get(key);
      if (effects) {
        effects.forEach(effect => effect());
      }
      
      return true;
    }
  });
  
  // Store metadata invisibly
  reactiveMap.set(proxy, { deps, computedMap });
  
  return proxy;
}
```

**The flow:**

```
1. Create Proxy
        ↓
2. Store metadata in WeakMap
        ↓
3. When proxy is accessed, look up metadata
        ↓
4. Use metadata to track dependencies
        ↓
5. When proxy is destroyed, metadata auto-cleans up
```

 

## Common Questions

### Q: "Why not just use a regular Map?"

**Answer:** Memory leaks!

```javascript
// ❌ Regular Map
const metadata = new Map();

function createState() {
  const state = { count: 0 };
  metadata.set(state, { deps: [] });
  return state;
}

// Create 1000 states
for (let i = 0; i < 1000; i++) {
  createState();
}

// All 1000 states are still in memory! 😱
console.log(metadata.size); // 1000

// Even though you're not using them anymore!
```

```javascript
// ✅ WeakMap
const metadata = new WeakMap();

function createState() {
  const state = { count: 0 };
  metadata.set(state, { deps: [] });
  return state;
}

// Create 1000 states
for (let i = 0; i < 1000; i++) {
  createState();
}

// States that aren't used get cleaned up automatically! 🎉
// No memory leak!
```

 

### Q: "Can I see what's inside a WeakMap?"

**No!** That's the whole point - it's **invisible**.

```javascript
const secrets = new WeakMap();
const obj = {};
secrets.set(obj, { password: '12345' });

// ❌ Can't inspect it
console.log(secrets); // WeakMap {} - Doesn't show contents

// ✅ Can only get specific entries
console.log(secrets.get(obj)); // { password: '12345' }
```

Think of it like a **safe deposit box** - you can only access it if you have the key (the object).

 

### Q: "Why can't I use strings or numbers as keys?"

**Answer:** Because WeakMap needs to know when to clean up, and primitives never get garbage collected.

```javascript
// ❌ This wouldn't make sense
const map = new WeakMap();
map.set('alice', { data: 'xyz' });

// When would this entry be removed?
// Strings never get garbage collected!
// The entry would exist forever = not "weak"!
```

**Only objects can be garbage collected**, so only objects can be WeakMap keys.

 

### Q: "When should I use WeakMap vs Map?"

**Use WeakMap when:**
- ✅ Storing metadata about objects
- ✅ You want automatic cleanup
- ✅ You don't need to loop through entries
- ✅ The data "belongs" to the object

**Use regular Map when:**
- ✅ You need to iterate through entries
- ✅ You need to get the size
- ✅ You need to clear all entries
- ✅ Keys can be primitives (strings, numbers)

 

## Practice Examples

### Example 1: Object Validator

Store validation rules for objects without modifying them.

```javascript
const validators = new WeakMap();

function addValidation(obj, rules) {
  validators.set(obj, rules);
}

function validate(obj) {
  const rules = validators.get(obj);
  if (!rules) return true; // No rules = valid
  
  for (let [field, rule] of Object.entries(rules)) {
    if (!rule(obj[field])) {
      return false;
    }
  }
  return true;
}

// Create a user
const user = { name: 'Alice', age: 30 };

// Add validation rules (hidden!)
addValidation(user, {
  name: (val) => val.length > 0,
  age: (val) => val >= 18
});

// Validate
console.log(validate(user)); // true

user.age = 10;
console.log(validate(user)); // false

// The user object is still clean!
console.log(user); // { name: 'Alice', age: 10 }
```

 

### Example 2: DOM Element Cache

Store data about DOM elements.

```javascript
const elementData = new WeakMap();

function trackElement(element, data) {
  elementData.set(element, data);
}

function getElementData(element) {
  return elementData.get(element);
}

// Track a button
const button = document.getElementById('myButton');

trackElement(button, {
  clicks: 0,
  created: new Date()
});

button.addEventListener('click', () => {
  const data = getElementData(button);
  data.clicks++;
  console.log(`Clicked ${data.clicks} times`);
});

// If the button is removed from DOM and garbage collected,
// the tracking data automatically disappears!
```

 

### Example 3: Private Data Pattern

Create truly private properties for objects.

```javascript
const privateData = new WeakMap();

class Person {
  constructor(name, ssn) {
    // Public property
    this.name = name;
    
    // Private property (stored in WeakMap)
    privateData.set(this, { ssn });
  }
  
  getSSN() {
    // Only this class can access it
    return privateData.get(this).ssn;
  }
}

const alice = new Person('Alice', '123-45-6789');

console.log(alice.name);      // 'Alice' - public
console.log(alice.ssn);       // undefined - can't access!
console.log(alice.getSSN());  // '123-45-6789' - through method only

// Can't see private data from outside
console.log(Object.keys(alice)); // ['name'] - Clean!
```

 

### Example 4: Build a Simple Dependency Tracker

Track which functions depend on which objects.

```javascript
const dependencies = new WeakMap();

function track(obj, callback) {
  if (!dependencies.has(obj)) {
    dependencies.set(obj, new Set());
  }
  dependencies.get(obj).add(callback);
}

function notify(obj) {
  const callbacks = dependencies.get(obj);
  if (callbacks) {
    callbacks.forEach(fn => fn());
  }
}

// Create an object
const state = { count: 0 };

// Track dependencies
track(state, () => console.log('Callback 1 ran!'));
track(state, () => console.log('Callback 2 ran!'));

// Trigger callbacks
notify(state);
// Callback 1 ran!
// Callback 2 ran!

// The state object is still clean!
console.log(state); // { count: 0 }
```

 

## Summary

### What is WeakMap?

An **invisible storage system** that lets you attach hidden metadata to objects without modifying them.

```
Object (clean)  ←→  WeakMap (hidden metadata)
```

### The 4 Methods

```javascript
const map = new WeakMap();

map.set(obj, data);    // Store
map.get(obj);          // Retrieve
map.has(obj);          // Check
map.delete(obj);       // Remove
```

### The "Weak" Part

WeakMap **doesn't prevent garbage collection**.

```
Regular Map:  Keeps objects alive (strong reference)
WeakMap:      Lets objects be cleaned up (weak reference)
```

### When to Use WeakMap

✅ **Use WeakMap when:**
- Storing private/metadata about objects
- Want automatic memory cleanup
- Don't need to iterate or get size
- Keys are objects

❌ **Don't use WeakMap when:**
- Need to loop through entries
- Need to check size or clear all
- Keys are primitives (strings, numbers)

### Why It's Perfect for Reactive Systems

```javascript
// ✅ WeakMap keeps reactive metadata invisible
const reactiveMap = new WeakMap();

function state(data) {
  const proxy = new Proxy(data, { /* ... */ });
  
  // Store metadata without polluting the object
  reactiveMap.set(proxy, {
    deps: new Map(),
    computed: new Map()
  });
  
  return proxy;
}
```

**Benefits:**
- ✅ Objects stay clean
- ✅ No property name conflicts
- ✅ Automatic cleanup
- ✅ Hidden from users

 

**WeakMap is the secret ingredient that lets reactive systems store data invisibly!** ✨