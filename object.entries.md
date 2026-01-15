# `Object.entries()` - Convert Object to Key-Value Pairs

## Quick Start (30 seconds)

```javascript
// Basic usage - object to array of pairs
const user = {
  name: 'Alice',
  age: 30,
  city: 'Paris'
};

const entries = Object.entries(user);
console.log(entries);
// [
//   ['name', 'Alice'],
//   ['age', 30],
//   ['city', 'Paris']
// ]

// Loop through entries
entries.forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});
// Output:
// name: Alice
// age: 30
// city: Paris

// Convert back to object
const original = Object.fromEntries(entries);
console.log(original);
// { name: 'Alice', age: 30, city: 'Paris' }

// Transform values
const doubled = Object.fromEntries(
  Object.entries({ a: 1, b: 2, c: 3 })
    .map(([key, value]) => [key, value * 2])
);
console.log(doubled);
// { a: 2, b: 4, c: 6 } ✨
```

**What just happened?** You converted an object into an array of [key, value] pairs, making it easy to loop, transform, and manipulate!

---

## What is `Object.entries()`?

`Object.entries()` is a **built-in JavaScript method** that converts an object into an array of key-value pairs.

Simply put: it takes an object and gives you an array where each element is a `[key, value]` pair.

Think of it as **unpacking a dictionary** - instead of the whole book, you get individual page entries you can work with one at a time.

### What It Returns

```javascript
// Input: object
{ name: 'Bob', age: 25 }

// Output: array of [key, value] pairs
[
  ['name', 'Bob'],
  ['age', 25]
]
```

---

## Syntax

```javascript
Object.entries(obj)
```

**Parameters:**
- `obj` (Object) - The object whose enumerable properties you want as pairs

**Returns:**
- Array of `[key, value]` pairs

**Example:**
```javascript
const result = Object.entries({ a: 1, b: 2 });
// result = [['a', 1], ['b', 2]]
```

---

## Why Does This Exist?

### The Challenge: Objects Aren't Iterable Like Arrays

Before `Object.entries()`, working with object data was awkward:

```javascript
const scores = {
  math: 95,
  english: 88,
  science: 92
};

// How do you loop through this?

// ❌ This doesn't work
scores.forEach((score) => {
  console.log(score);  // TypeError: scores.forEach is not a function
});

// ❌ This is clunky
for (let key in scores) {
  console.log(key, scores[key]);  // Works but verbose
}

// ❌ This is even worse
Object.keys(scores).forEach(key => {
  console.log(key, scores[key]);  // Two lookups!
});
```

At first glance, these approaches work. But there's a better way.

**What's the Real Issue?**

```
Object Data
     ↓
Need both keys AND values
     ↓
No direct way to get pairs
     ↓
Awkward workarounds
     ↓
Code becomes verbose ❌
```

**Problems:**
❌ **Can't use array methods** - forEach, map, filter won't work  
❌ **Verbose syntax** - for...in loops are clunky  
❌ **Multiple lookups** - Getting key, then looking up value  
❌ **Hard to transform** - Converting or filtering is tedious  

---

### The Solution with `Object.entries()`

```javascript
const scores = {
  math: 95,
  english: 88,
  science: 92
};

// ✅ Clean and simple
Object.entries(scores).forEach(([subject, score]) => {
  console.log(`${subject}: ${score}`);
});
// Output:
// math: 95
// english: 88
// science: 92

// ✅ Easy to transform
const passedSubjects = Object.entries(scores)
  .filter(([subject, score]) => score >= 90)
  .map(([subject, score]) => subject);

console.log(passedSubjects);
// ['math', 'science']

// ✅ Convert to different format
const formattedScores = Object.entries(scores)
  .map(([subject, score]) => `${subject.toUpperCase()}: ${score}%`)
  .join('\n');

console.log(formattedScores);
// MATH: 95%
// ENGLISH: 88%
// SCIENCE: 92%
```

**What Just Happened?**

```
Object.entries(obj)
        ↓
Array of [key, value] pairs
        ↓
Use all array methods
        ↓
forEach, map, filter, reduce
        ↓
Clean, powerful code ✅
```

**Benefits:**
✅ **Use array methods** - forEach, map, filter, reduce all work  
✅ **Clean syntax** - Destructuring makes code readable  
✅ **One lookup** - Get key and value together  
✅ **Easy transforms** - Chain methods naturally  

---

## Mental Model

Think of `Object.entries()` as **converting a filing cabinet into a list**:

### Object (Filing Cabinet)
```
Filing Cabinet
┌─────────────────────┐
│ Drawer: "name"      │ ← Contains "Alice"
├─────────────────────┤
│ Drawer: "age"       │ ← Contains 30
├─────────────────────┤
│ Drawer: "city"      │ ← Contains "Paris"
└─────────────────────┘

To access: Open each drawer individually
```

### Object.entries() Result (List)
```
List of Contents
┌─────────────────────┐
│ 1. ["name", "Alice"]│
│ 2. ["age", 30]      │
│ 3. ["city", "Paris"]│
└─────────────────────┘

To access: Loop through the list
```

**Key Insight:** Objects are like filing cabinets (organized but not sequential). Arrays are like lists (easy to process one by one). `Object.entries()` converts the cabinet into a list!

---

## How Does It Work?

### Internal Process

```
1️⃣ Start with object
   { name: 'Bob', age: 25, city: 'NYC' }
        ↓
2️⃣ Get enumerable own properties
   ['name', 'age', 'city']
        ↓
3️⃣ For each property, create pair
   [
     ['name', 'Bob'],
     ['age', 25],
     ['city', 'NYC']
   ]
        ↓
4️⃣ Return array of pairs
```

### What Gets Included

```javascript
const obj = {
  own: 'included',          // ✅ Own property
  enumerable: 'included'    // ✅ Enumerable
};

// Non-enumerable property
Object.defineProperty(obj, 'hidden', {
  value: 'not included',
  enumerable: false         // ❌ Not enumerable
});

console.log(Object.entries(obj));
// [['own', 'included'], ['enumerable', 'included']]
// 'hidden' is not included!
```

### Order Guarantee

The order is predictable:

```javascript
const obj = {
  z: 1,      // String keys in insertion order
  a: 2,
  5: 3,      // Numeric keys first (sorted)
  1: 4
};

console.log(Object.entries(obj));
// [
//   ['1', 4],    // Numeric keys sorted
//   ['5', 3],
//   ['z', 1],    // Then string keys in insertion order
//   ['a', 2]
// ]
```

---

## Basic Usage

### Example 1: Simple Loop

```javascript
const person = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30
};

Object.entries(person).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Output:
// firstName: John
// lastName: Doe
// age: 30
```

---

### Example 2: Count Properties

```javascript
const product = {
  name: 'Laptop',
  price: 999,
  brand: 'TechCo',
  inStock: true
};

const count = Object.entries(product).length;
console.log(`Product has ${count} properties`);
// Product has 4 properties
```

---

### Example 3: Find Specific Entry

```javascript
const settings = {
  theme: 'dark',
  fontSize: 14,
  autoSave: true
};

const found = Object.entries(settings)
  .find(([key, value]) => key === 'theme');

console.log(found);
// ['theme', 'dark']

if (found) {
  console.log(`Theme is set to: ${found[1]}`);
  // Theme is set to: dark
}
```

---

## Real-World Examples

### Example 1: Form Data Processing

```javascript
const formData = {
  username: 'alice123',
  email: 'alice@example.com',
  password: 'secret123',
  confirmPassword: 'secret123'
};

// Validate all fields
const errors = {};

Object.entries(formData).forEach(([field, value]) => {
  if (!value || value.trim() === '') {
    errors[field] = 'This field is required';
  }
  
  if (field === 'email' && !value.includes('@')) {
    errors[field] = 'Invalid email format';
  }
  
  if (field === 'password' && value.length < 8) {
    errors[field] = 'Password must be at least 8 characters';
  }
});

console.log('Validation errors:', errors);

// Display errors
if (Object.entries(errors).length > 0) {
  console.log('Form has errors:');
  Object.entries(errors).forEach(([field, message]) => {
    console.log(`  - ${field}: ${message}`);
  });
}
```

---

### Example 2: API Response Transformation

```javascript
// API returns data in one format
const apiResponse = {
  user_name: 'john_doe',
  user_email: 'john@example.com',
  user_age: 28,
  is_active: true
};

// Transform to camelCase
const transformed = Object.fromEntries(
  Object.entries(apiResponse).map(([key, value]) => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => 
      letter.toUpperCase()
    );
    return [camelKey, value];
  })
);

console.log(transformed);
// {
//   userName: 'john_doe',
//   userEmail: 'john@example.com',
//   userAge: 28,
//   isActive: true
// }
```

---

### Example 3: Filtering Object Properties

```javascript
const userData = {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'hashed_password',
  role: 'admin',
  internalNotes: 'VIP customer'
};

// Remove sensitive fields before sending to frontend
const safeData = Object.fromEntries(
  Object.entries(userData)
    .filter(([key]) => !['password', 'internalNotes'].includes(key))
);

console.log(safeData);
// {
//   id: 123,
//   name: 'Alice',
//   email: 'alice@example.com',
//   role: 'admin'
// }
```

---

### Example 4: Configuration Merging

```javascript
const defaultConfig = {
  theme: 'light',
  language: 'en',
  notifications: true,
  autoSave: true
};

const userConfig = {
  theme: 'dark',
  language: 'es'
};

// Merge configs, user values override defaults
const finalConfig = Object.fromEntries(
  Object.entries(defaultConfig).map(([key, defaultValue]) => {
    // Use user value if exists, otherwise use default
    const value = key in userConfig ? userConfig[key] : defaultValue;
    return [key, value];
  })
);

console.log(finalConfig);
// {
//   theme: 'dark',        // From user
//   language: 'es',       // From user
//   notifications: true,  // From default
//   autoSave: true        // From default
// }
```

---

### Example 5: URL Query String Builder

```javascript
const params = {
  search: 'javascript',
  category: 'books',
  minPrice: 10,
  maxPrice: 50,
  inStock: true
};

// Build query string
const queryString = Object.entries(params)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');

console.log(queryString);
// search=javascript&category=books&minPrice=10&maxPrice=50&inStock=true

const fullUrl = `https://api.example.com/products?${queryString}`;
console.log(fullUrl);
// https://api.example.com/products?search=javascript&category=books&minPrice=10&maxPrice=50&inStock=true
```

---

### Example 6: Object to HTML Table

```javascript
const student = {
  name: 'Emma Wilson',
  grade: 'A',
  score: 95,
  attendance: '98%'
};

// Generate HTML table
const tableRows = Object.entries(student)
  .map(([key, value]) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    return `<tr><td>${label}</td><td>${value}</td></tr>`;
  })
  .join('\n');

const table = `
<table>
  ${tableRows}
</table>
`;

console.log(table);
// <table>
//   <tr><td>Name</td><td>Emma Wilson</td></tr>
//   <tr><td>Grade</td><td>A</td></tr>
//   <tr><td>Score</td><td>95</td></tr>
//   <tr><td>Attendance</td><td>98%</td></tr>
// </table>
```

---

### Example 7: Statistics Calculator

```javascript
const grades = {
  math: 85,
  english: 92,
  science: 88,
  history: 90,
  art: 95
};

// Calculate statistics
const entries = Object.entries(grades);
const values = entries.map(([_, grade]) => grade);

const stats = {
  total: values.reduce((sum, grade) => sum + grade, 0),
  average: values.reduce((sum, grade) => sum + grade, 0) / values.length,
  highest: Math.max(...values),
  lowest: Math.min(...values),
  count: entries.length
};

console.log('Grade Statistics:');
console.log(`  Total: ${stats.total}`);
console.log(`  Average: ${stats.average.toFixed(2)}`);
console.log(`  Highest: ${stats.highest}`);
console.log(`  Lowest: ${stats.lowest}`);
console.log(`  Subjects: ${stats.count}`);

// Output:
// Grade Statistics:
//   Total: 450
//   Average: 90.00
//   Highest: 95
//   Lowest: 85
//   Subjects: 5

// Find subject with highest grade
const [bestSubject, bestGrade] = entries.reduce((max, current) => 
  current[1] > max[1] ? current : max
);

console.log(`Best subject: ${bestSubject} (${bestGrade})`);
// Best subject: art (95)
```

---

### Example 8: Deep Object Comparison

```javascript
const obj1 = {
  name: 'Alice',
  age: 30,
  city: 'Paris'
};

const obj2 = {
  name: 'Alice',
  age: 31,
  city: 'Paris'
};

// Find differences
const differences = Object.entries(obj1)
  .filter(([key, value]) => obj2[key] !== value)
  .map(([key, value]) => ({
    property: key,
    oldValue: value,
    newValue: obj2[key]
  }));

console.log('Differences found:', differences);
// [
//   {
//     property: 'age',
//     oldValue: 30,
//     newValue: 31
//   }
// ]

if (differences.length === 0) {
  console.log('Objects are identical');
} else {
  console.log('Changes:');
  differences.forEach(diff => {
    console.log(`  ${diff.property}: ${diff.oldValue} → ${diff.newValue}`);
  });
}
```

---

### Example 9: Inventory Management

```javascript
const inventory = {
  apples: 50,
  bananas: 30,
  oranges: 0,
  grapes: 15,
  mangoes: 0
};

// Find out-of-stock items
const outOfStock = Object.entries(inventory)
  .filter(([_, quantity]) => quantity === 0)
  .map(([item]) => item);

console.log('Out of stock:', outOfStock);
// ['oranges', 'mangoes']

// Find low stock (less than 20)
const lowStock = Object.entries(inventory)
  .filter(([_, quantity]) => quantity > 0 && quantity < 20)
  .map(([item, quantity]) => ({ item, quantity }));

console.log('Low stock items:', lowStock);
// [{ item: 'grapes', quantity: 15 }]

// Generate reorder list
const reorderList = Object.entries(inventory)
  .filter(([_, quantity]) => quantity < 20)
  .map(([item, current]) => {
    const needed = 50 - current;
    return `${item}: order ${needed} units`;
  });

console.log('Reorder list:');
reorderList.forEach(item => console.log(`  - ${item}`));
// Output:
//   - oranges: order 50 units
//   - grapes: order 35 units
//   - mangoes: order 50 units
```

---

### Example 10: CSV Export

```javascript
const employees = [
  { id: 1, name: 'Alice', department: 'Engineering', salary: 90000 },
  { id: 2, name: 'Bob', department: 'Sales', salary: 75000 },
  { id: 3, name: 'Carol', department: 'Marketing', salary: 80000 }
];

// Convert to CSV
function toCSV(data) {
  if (data.length === 0) return '';
  
  // Get headers from first object
  const headers = Object.keys(data[0]).join(',');
  
  // Convert each row
  const rows = data.map(obj => 
    Object.values(obj).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

const csv = toCSV(employees);
console.log(csv);
// id,name,department,salary
// 1,Alice,Engineering,90000
// 2,Bob,Sales,75000
// 3,Carol,Marketing,80000

// Alternative using entries for more control
function toCSVAdvanced(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  
  const dataRows = data.map(obj =>
    Object.entries(obj)
      .map(([_, value]) => {
        // Quote strings containing commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      })
      .join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}
```

---

## Common Patterns

### Pattern 1: Object to Map

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3
};

const map = new Map(Object.entries(obj));
console.log(map);
// Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 }

console.log(map.get('a'));  // 1
```

---

### Pattern 2: Swap Keys and Values

```javascript
const original = {
  name: 'Alice',
  role: 'admin',
  status: 'active'
};

const swapped = Object.fromEntries(
  Object.entries(original).map(([key, value]) => [value, key])
);

console.log(swapped);
// { Alice: 'name', admin: 'role', active: 'status' }
```

---

### Pattern 3: Group By Property

```javascript
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Carol', role: 'admin' },
  { name: 'Dave', role: 'user' }
];

const grouped = users.reduce((acc, user) => {
  if (!acc[user.role]) {
    acc[user.role] = [];
  }
  acc[user.role].push(user.name);
  return acc;
}, {});

console.log(grouped);
// { admin: ['Alice', 'Carol'], user: ['Bob', 'Dave'] }

// Display grouped results
Object.entries(grouped).forEach(([role, names]) => {
  console.log(`${role}: ${names.join(', ')}`);
});
// admin: Alice, Carol
// user: Bob, Dave
```

---

### Pattern 4: Pick Specific Properties

```javascript
const user = {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret',
  role: 'admin',
  createdAt: '2024-01-01'
};

// Pick only specific fields
const picked = Object.fromEntries(
  Object.entries(user)
    .filter(([key]) => ['id', 'name', 'email'].includes(key))
);

console.log(picked);
// { id: 123, name: 'Alice', email: 'alice@example.com' }
```

---

### Pattern 5: Rename Keys

```javascript
const data = {
  first_name: 'John',
  last_name: 'Doe',
  email_address: 'john@example.com'
};

const keyMap = {
  first_name: 'firstName',
  last_name: 'lastName',
  email_address: 'email'
};

const renamed = Object.fromEntries(
  Object.entries(data).map(([key, value]) => {
    const newKey = keyMap[key] || key;
    return [newKey, value];
  })
);

console.log(renamed);
// { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
```

---

## Advanced Usage

### 1. Deep Clone with Transformation

```javascript
function deepTransform(obj, transformer) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return [key, deepTransform(value, transformer)];
      }
      return transformer(key, value);
    })
  );
}

const data = {
  user: {
    name: 'alice',
    email: 'ALICE@EXAMPLE.COM'
  },
  status: 'active'
};

// Normalize all strings to lowercase
const normalized = deepTransform(data, (key, value) => {
  if (typeof value === 'string') {
    return [key, value.toLowerCase()];
  }
  return [key, value];
});

console.log(normalized);
// {
//   user: {
//     name: 'alice',
//     email: 'alice@example.com'
//   },
//   status: 'active'
// }
```

---

### 2. Conditional Property Addition

```javascript
const baseConfig = {
  host: 'localhost',
  port: 3000
};

const isDevelopment = true;
const enableDebug = true;

// Add properties conditionally
const config = Object.fromEntries([
  ...Object.entries(baseConfig),
  ...(isDevelopment ? [['env', 'development']] : []),
  ...(enableDebug ? [['debug', true]] : [])
]);

console.log(config);
// { host: 'localhost', port: 3000, env: 'development', debug: true }
```

---

### 3. Object Diff Tool

```javascript
function diffObjects(obj1, obj2) {
  const allKeys = new Set([
    ...Object.keys(obj1),
    ...Object.keys(obj2)
  ]);
  
  const changes = {
    added: {},
    removed: {},
    modified: {}
  };
  
  allKeys.forEach(key => {
    const inObj1 = key in obj1;
    const inObj2 = key in obj2;
    
    if (!inObj1 && inObj2) {
      changes.added[key] = obj2[key];
    } else if (inObj1 && !inObj2) {
      changes.removed[key] = obj1[key];
    } else if (obj1[key] !== obj2[key]) {
      changes.modified[key] = {
        old: obj1[key],
        new: obj2[key]
      };
    }
  });
  
  return changes;
}

const before = { a: 1, b: 2, c: 3 };
const after = { a: 1, b: 5, d: 4 };

const diff = diffObjects(before, after);
console.log(diff);
// {
//   added: { d: 4 },
//   removed: { c: 3 },
//   modified: { b: { old: 2, new: 5 } }
// }
```

---

## Important Notes

### 1. Only Enumerable Properties

```javascript
const obj = { visible: 'yes' };

Object.defineProperty(obj, 'hidden', {
  value: 'no',
  enumerable: false
});

console.log(Object.entries(obj));
// [['visible', 'yes']]
// 'hidden' is not included
```

---

### 2. Only Own Properties (Not Inherited)

```javascript
const parent = { inherited: 'parent value' };
const child = Object.create(parent);
child.own = 'child value';

console.log(Object.entries(child));
// [['own', 'child value']]
// 'inherited' is not included
```

---

### 3. Symbol Keys Are Ignored

```javascript
const sym = Symbol('mySymbol');
const obj = {
  string: 'value',
  [sym]: 'symbol value'
};

console.log(Object.entries(obj));
// [['string', 'value']]
// Symbol key is not included
```

---

### 4. Works with Arrays Too

```javascript
const arr = ['a', 'b', 'c'];

console.log(Object.entries(arr));
// [['0', 'a'], ['1', 'b'], ['2', 'c']]
// Array indices become string keys
```

---

### 5. Primitives Are Converted to Objects

```javascript
console.log(Object.entries('hello'));
// [['0', 'h'], ['1', 'e'], ['2', 'l'], ['3', 'l'], ['4', 'o']]

console.log(Object.entries(123));
// []

console.log(Object.entries(true));
// []
```

---

## Summary

**What is `Object.entries()`?**  
A method that converts an object into an array of `[key, value]` pairs.

**Why use it?**
- ✅ Makes objects iterable with array methods
- ✅ Clean syntax with destructuring
- ✅ Easy to transform object data
- ✅ Perfect for loops and filters
- ✅ Works with Object.fromEntries() for round-trips

**Common Use Cases:**
- Looping through objects
- Transforming object data
- Filtering properties
- Converting objects to other formats
- Building query strings
- Form validation

**Key Takeaway:**

```
Object                Array of Pairs
   ↓                        ↓
{ a: 1, b: 2 }  →  [['a', 1], ['b', 2]]
                           ↓
                    Use array methods
                           ↓
                  forEach, map, filter ✅
```

**One-Line Rule:** Use `Object.entries()` whenever you need to loop through or transform an object's properties.

**Remember:** It's the bridge from objects to arrays - unlocking all the power of array methods! 🎉