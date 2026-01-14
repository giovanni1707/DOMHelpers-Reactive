# `collection.includes(item)` - Check if Item Exists

## Quick Start (30 seconds)

```javascript
const fruits = createCollection(['apple', 'banana', 'orange']);

// Check if item exists
const hasApple = fruits.includes('apple');
console.log(hasApple);  // true

const hasGrape = fruits.includes('grape');
console.log(hasGrape);  // false

// Use in conditionals
if (fruits.includes('banana')) {
  console.log('We have bananas!');
}

// Check before adding
if (!fruits.includes('mango')) {
  fruits.add('mango');
  console.log('Added mango');
}

// With numbers
const numbers = createCollection([1, 2, 3, 4, 5]);
console.log(numbers.includes(3));   // true
console.log(numbers.includes(10));  // false ✨
```

**What just happened?** You checked if items exist in the collection with a simple boolean result!

 

## What is `collection.includes(item)`?

`includes(item)` returns `true` if the item exists in the collection, `false` otherwise.

Simply put: it answers "is this item in the collection?" with yes or no.

Think of it as **checking if a book is on the shelf** - you get a clear yes/no answer.

 

## Syntax

```javascript
collection.includes(item)
```

**Parameters:**
- `item` (any) - The item to search for (uses strict equality `===`)

**Returns:** 
- `true` if item exists
- `false` if not found

 

## Why Does This Exist?

### The Problem: Verbose Existence Checks

Without `includes()`, checking existence is verbose:

```javascript
const items = createCollection([...]);

// Verbose indexOf check
if (items.items.indexOf('apple') !== -1) {
  console.log('Found');
}

// Or use array includes
if (items.items.includes('apple')) {
  console.log('Found');
}

// Must access .items
```

**Problems:**
❌ **Break abstraction** - Must use `.items`  
❌ **indexOf confusion** - Need to check !== -1  
❌ **Inconsistent API** - Mix collection and array methods  

### The Solution with `includes()`

```javascript
const items = createCollection([...]);

// Clean boolean check
if (items.includes('apple')) {
  console.log('Found');
}

// Clear and concise ✅
```

**Benefits:**
✅ **Boolean result** - Clear true/false  
✅ **Clean API** - No `.items` needed  
✅ **Readable** - Intent is obvious  

 

## Mental Model

Think of `includes()` as **a membership test**:

```
Collection Items        Check Membership      Result
┌──────────────┐       ┌──────────────┐      ┌──────────┐
│ 'apple'      │       │ Is 'banana'  │      │          │
│ 'banana'  ←──┼──────→│ in here?     │─────→│   true   │
│ 'orange'     │       │ Yes! ✓       │      │          │
└──────────────┘       └──────────────┘      └──────────┘
```

**Key Insight:** Returns boolean, uses strict equality (===).

 

## How It Works

The complete flow:

```
fruits.includes('banana')
        |
        ▼
Loop through items
        |
        ▼
For each item:
  If item === 'banana'
    → return true
        |
        ▼
No match found
        |
        ▼
Return false
```

### Implementation

```javascript
// From 03_dh-reactive-collections.js
includes(item) {
  return this.items.includes(item);
}
```

Simple wrapper:
- Calls native array includes
- Returns boolean
- Uses strict equality

 

## Basic Usage

### Example 1: Simple Check

```javascript
const colors = createCollection(['red', 'green', 'blue']);

console.log(colors.includes('red'));     // true
console.log(colors.includes('yellow'));  // false
console.log(colors.includes('RED'));     // false (case-sensitive)
```

 

### Example 2: Use in Conditionals

```javascript
const tags = createCollection(['js', 'react', 'node']);

if (tags.includes('react')) {
  console.log('React project detected');
}

if (!tags.includes('vue')) {
  console.log('Vue not used');
}
```

 

### Example 3: Prevent Duplicates

```javascript
const items = createCollection([1, 2, 3]);

function addUnique(item) {
  if (!items.includes(item)) {
    items.add(item);
    return true;
  }
  return false;
}

addUnique(4);  // true - added
addUnique(2);  // false - already exists
```

 

### Example 4: Filter Based on Membership

```javascript
const allowedUsers = createCollection(['alice', 'bob', 'charlie']);

function canAccess(username) {
  return allowedUsers.includes(username);
}

console.log(canAccess('alice'));  // true
console.log(canAccess('david'));  // false
```

 

## Real-World Examples

### Example 1: Validate Input

```javascript
const validStatuses = createCollection(['pending', 'approved', 'rejected']);

function setStatus(item, newStatus) {
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  item.status = newStatus;
}

// Usage
setStatus(order, 'approved');  // ✓ Works
setStatus(order, 'invalid');   // ✗ Throws error
```

 

### Example 2: Check Permissions

```javascript
const userPermissions = createCollection(['read', 'write', 'delete']);

function hasPermission(action) {
  if (!userPermissions.includes(action)) {
    console.error(`Permission denied: ${action}`);
    return false;
  }
  return true;
}

if (hasPermission('write')) {
  saveData();
}
```

 

### Example 3: Feature Flags

```javascript
const enabledFeatures = createCollection(['dark-mode', 'notifications', 'beta-ui']);

function isFeatureEnabled(feature) {
  return enabledFeatures.includes(feature);
}

// Conditional rendering
if (isFeatureEnabled('dark-mode')) {
  document.body.classList.add('dark');
}

if (isFeatureEnabled('beta-ui')) {
  loadBetaInterface();
}
```

 

### Example 4: Filter Array by Whitelist

```javascript
const allowedCategories = createCollection(['electronics', 'books', 'clothing']);

const allProducts = [
  { name: 'Laptop', category: 'electronics' },
  { name: 'Novel', category: 'books' },
  { name: 'Chair', category: 'furniture' },
  { name: 'Shirt', category: 'clothing' }
];

const filtered = allProducts.filter(product => 
  allowedCategories.includes(product.category)
);

console.log(filtered);
// [{ name: 'Laptop', ... }, { name: 'Novel', ... }, { name: 'Shirt', ... }]
```

 

### Example 5: Shopping Cart Check

```javascript
const cart = createCollection([
  { productId: 'A', name: 'Widget' },
  { productId: 'B', name: 'Gadget' }
]);

function isInCart(productId) {
  return cart.items.some(item => item.productId === productId);
}

// Better: extract IDs to collection
const cartIds = createCollection(cart.items.map(i => i.productId));

function isInCartSimple(productId) {
  return cartIds.includes(productId);
}

console.log(isInCartSimple('A'));  // true
console.log(isInCartSimple('C'));  // false
```

 

### Example 6: Blacklist Check

```javascript
const bannedWords = createCollection(['spam', 'fake', 'scam']);

function containsBannedWords(text) {
  const words = text.toLowerCase().split(' ');
  
  return words.some(word => bannedWords.includes(word));
}

console.log(containsBannedWords('This is spam'));      // true
console.log(containsBannedWords('Normal message'));    // false
```

 

### Example 7: Role-Based Access

```javascript
const adminRoles = createCollection(['admin', 'super-admin', 'moderator']);

function isAdmin(user) {
  return adminRoles.includes(user.role);
}

function showAdminPanel(user) {
  if (isAdmin(user)) {
    document.getElementById('admin-panel').style.display = 'block';
  }
}
```

 

### Example 8: Multi-Select Form

```javascript
const selectedIds = createCollection([1, 3, 5]);

function renderCheckbox(item) {
  const checked = selectedIds.includes(item.id);
  
  return `
    <label>
      <input type="checkbox" 
             value="${item.id}" 
             ${checked ? 'checked' : ''}
             onchange="toggleSelection(${item.id})">
      ${item.name}
    </label>
  `;
}

function toggleSelection(id) {
  if (selectedIds.includes(id)) {
    selectedIds.remove(id);
  } else {
    selectedIds.add(id);
  }
}
```

 

### Example 9: Supported File Types

```javascript
const supportedTypes = createCollection([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
]);

function validateFile(file) {
  if (!supportedTypes.includes(file.type)) {
    alert(`Unsupported file type: ${file.type}`);
    return false;
  }
  
  return true;
}

// File input handler
document.getElementById('upload').onchange = (e) => {
  const file = e.target.files[0];
  if (validateFile(file)) {
    uploadFile(file);
  }
};
```

 

### Example 10: Active Filters

```javascript
const activeFilters = createCollection([]);

function toggleFilter(filterName) {
  if (activeFilters.includes(filterName)) {
    activeFilters.remove(filterName);
  } else {
    activeFilters.add(filterName);
  }
  
  updateFilterUI();
  applyFilters();
}

function updateFilterUI() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filterName = btn.dataset.filter;
    btn.classList.toggle('active', activeFilters.includes(filterName));
  });
}
```

 

## Common Patterns

### Pattern 1: Toggle Membership

```javascript
function toggle(item) {
  if (collection.includes(item)) {
    collection.remove(item);
  } else {
    collection.add(item);
  }
}
```

 

### Pattern 2: Validate Against List

```javascript
function validate(value, validValues) {
  if (!validValues.includes(value)) {
    throw new Error(`Invalid value: ${value}`);
  }
  return true;
}
```

 

### Pattern 3: Conditional Add

```javascript
function addIfNotExists(item) {
  if (!collection.includes(item)) {
    collection.add(item);
  }
}
```

 

### Pattern 4: Check Multiple Items

```javascript
function hasAny(items) {
  return items.some(item => collection.includes(item));
}

function hasAll(items) {
  return items.every(item => collection.includes(item));
}
```

 

## Important Notes

### 1. Uses Strict Equality

```javascript
const numbers = createCollection([1, 2, 3]);

numbers.includes(2);    // true
numbers.includes('2');  // false (string !== number)
numbers.includes(2.0);  // true (2.0 === 2)
```

 

### 2. Case Sensitive for Strings

```javascript
const items = createCollection(['Apple', 'Banana']);

items.includes('Apple');   // true
items.includes('apple');   // false
items.includes('APPLE');   // false
```

 

### 3. Works with Primitives Only

```javascript
const objects = createCollection([
  { id: 1, name: 'A' },
  { id: 2, name: 'B' }
]);

// ❌ Won't work - different object references
objects.includes({ id: 1, name: 'A' });  // false

// ✓ Use find() for objects
const found = objects.find(obj => obj.id === 1);  // Works!
```

 

### 4. NaN Handling

```javascript
const numbers = createCollection([1, 2, NaN, 4]);

numbers.includes(NaN);  // true ✓ (unlike indexOf)
```

 

## When to Use

### Use `includes()` For:

✅ **Boolean check** - Is item present?  
✅ **Primitive values** - Numbers, strings, booleans  
✅ **Conditionals** - if/else logic  
✅ **Validation** - Check against whitelist  
✅ **Prevent duplicates** - Check before add  

### Don't Use For:

❌ **Object comparison** - Use `find()` instead  
❌ **Get item** - Use `find()` or `at()`  
❌ **Get index** - Use `indexOf()`  
❌ **Complex search** - Use `find()` with predicate  

 

## Comparison with Related Methods

```javascript
const items = createCollection([1, 2, 3, 4, 5]);

// includes() - Returns boolean
items.includes(3);  // true

// indexOf() - Returns index or -1
items.indexOf(3);   // 2

// find() - Returns item or undefined
items.find(n => n === 3);  // 3

// Some equivalences:
items.includes(3) === (items.indexOf(3) !== -1)  // true
items.includes(3) === (items.find(n => n === 3) !== undefined)  // true
```

**Choose `includes()` when:** You only need a yes/no answer  
**Choose `indexOf()` when:** You need the position  
**Choose `find()` when:** You need the actual item or complex search  

 

## Performance

`includes()` is efficient:

```javascript
// Best case: O(1) - first item matches
collection.includes(collection.first);

// Worst case: O(n) - last item or not found
collection.includes(999);

// Average: O(n/2)
```

For frequent lookups, consider using a Set:
```javascript
const lookupSet = new Set(collection.items);
lookupSet.has(item);  // O(1) lookup
```

 

## Summary

**What is `collection.includes(item)`?**  
A method that returns `true` if item exists, `false` otherwise.

**Why use it?**
- ✅ Clean boolean result
- ✅ Clear intent
- ✅ No `.items` needed
- ✅ Works like Array.includes()
- ✅ NaN handling (unlike indexOf)

**Key Takeaway:**

```
indexOf() !== -1        includes()
      |                     |
Numeric check          Boolean ✓
      |                     |
Less readable          Clear intent ✅
```

**One-Line Rule:** Use `includes()` for clean boolean existence checks.

**Best Practices:**
- Use for primitive values only
- Use `find()` for objects
- Remember it's case-sensitive
- Use strict equality (===)
- Great for validation and conditionals
- Returns boolean, not index

**Remember:** `includes()` gives you a simple yes/no answer! 🎉