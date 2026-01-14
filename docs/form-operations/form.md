# Forms.form()

## Quick Start (30 seconds)

```javascript
// Forms.form() is an alias for Forms.create()
// They do exactly the same thing!

const myForm = Forms.form(
  { username: '', email: '' },
  {
    validators: {
      username: (v) => v ? null : 'Required',
      email: (v) => v ? null : 'Required'
    }
  }
);

// Use it exactly like Forms.create()
myForm.setValue('username', 'alice');
myForm.setValue('email', 'alice@example.com');

console.log(myForm.isValid); // true
```

**What just happened?** You created a reactive form using `Forms.form()` - it works identically to `Forms.create()`. Use whichever name you prefer!

 

## What is Forms.form()?

`Forms.form()` is an **alias** (alternative name) for `Forms.create()`.

Simply put, calling `Forms.form()` is **exactly the same** as calling `Forms.create()` - they're two names for the same function.

Think of it like this:
- Some people say "soda" 🥤
- Other people say "pop" 🥤
- Same drink, different word!

Similarly:
- Some developers prefer `Forms.create()` (more explicit)
- Other developers prefer `Forms.form()` (shorter, more direct)
- Same function, different name!

 

## Syntax

All of these work identically:

### Forms Namespace
```javascript
Forms.form(initialValues, options)
Forms.create(initialValues, options)
```

### ReactiveUtils Namespace
```javascript
ReactiveUtils.form(initialValues, options)
ReactiveUtils.createForm(initialValues, options)
```

### Global Shortcuts (Module 07)
```javascript
form(initialValues, options)
createForm(initialValues, options)
```

**Parameters:**
- `initialValues` (Object) - Initial form field values
- `options` (Object, optional) - Configuration object

**Returns:** A reactive form object

 

## Why Does This Exist?

### The Philosophy Behind Aliases

Different developers have different preferences for naming. The library provides both options to accommodate various coding styles.

**Some prefer explicit factory names:**
```javascript
const userForm = Forms.create({ name: '', email: '' });
//                      ^^^^^^ Clearly a factory function
```

This style emphasizes that you're **creating** something new.

**Others prefer direct, concise names:**
```javascript
const userForm = Forms.form({ name: '', email: '' });
//                     ^^^^ Short and clear - making a form
```

This style emphasizes **what** you're making (a form).

 

### Real-World Analogy

Think about ordering coffee:

**Explicit Style (Forms.create):**
```
"I'd like to create a large coffee order with milk and sugar"
```

**Direct Style (Forms.form):**
```
"Large coffee with milk and sugar, please"
```

Both get you the same coffee. One is more formal, one is more direct.

 

## How Does It Work?

### Under the Hood

Here's what actually happens in the code:

```javascript
// In the library source code (simplified):

function createForm(initialValues, options) {
  // ... all the form creation logic ...
  return reactiveFormObject;
}

// Create the alias
const form = createForm;

// Export both
export const Forms = {
  create: createForm,  // Original name
  form: form,          // Alias name
  // ... other methods
};
```

When you call `Forms.form()`, JavaScript literally runs the exact same function as `Forms.create()`.

### Visual Representation

```
Forms.create ────┐
                 ├──→ Same Function ──→ Reactive Form Object
Forms.form ──────┘
```

Both names point to the same function in memory!

 

## Basic Usage

### Example 1: Using Forms.form()

```javascript
// Create with Forms.form()
const loginForm = Forms.form(
  { email: '', password: '' },
  {
    validators: {
      email: (v) => v.includes('@') ? null : 'Invalid email',
      password: (v) => v.length >= 8 ? null : 'Too short'
    }
  }
);

loginForm.setValue('email', 'user@example.com');
loginForm.setValue('password', 'secret123');

console.log(loginForm.isValid); // true
```

 

### Example 2: Using Forms.create()

```javascript
// Create with Forms.create() - identical result!
const loginForm = Forms.create(
  { email: '', password: '' },
  {
    validators: {
      email: (v) => v.includes('@') ? null : 'Invalid email',
      password: (v) => v.length >= 8 ? null : 'Too short'
    }
  }
);

loginForm.setValue('email', 'user@example.com');
loginForm.setValue('password', 'secret123');

console.log(loginForm.isValid); // true
```

Both examples produce the exact same form object with the same functionality!

 

### Example 3: They're Interchangeable

```javascript
// Mix and match - doesn't matter!
const form1 = Forms.create({ name: '' });
const form2 = Forms.form({ email: '' });

// Both work exactly the same way
form1.setValue('name', 'Alice');
form2.setValue('email', 'alice@example.com');

console.log(typeof form1.setValue); // "function"
console.log(typeof form2.setValue); // "function"

console.log(form1.isValid); // Computed property works
console.log(form2.isValid); // Computed property works
```

 

## Comparison: Forms.form() vs Forms.create()

### Side-by-Side Comparison

```javascript
// Using Forms.form()
const formA = Forms.form(
  { username: '' },
  { validators: { username: (v) => v ? null : 'Required' } }
);

// Using Forms.create()
const formB = Forms.create(
  { username: '' },
  { validators: { username: (v) => v ? null : 'Required' } }
);

// Test equality
console.log(typeof formA === typeof formB); // true
console.log(formA.hasOwnProperty('setValue')); // true
console.log(formB.hasOwnProperty('setValue')); // true

// Both have identical capabilities
console.log(Object.keys(formA).sort());
console.log(Object.keys(formB).sort());
// Exact same keys!
```

 

### Feature Parity Table

| Feature | Forms.form() | Forms.create() |
|   |    --|     -|
| Creates reactive form | ✅ | ✅ |
| Accepts initial values | ✅ | ✅ |
| Accepts validators | ✅ | ✅ |
| Accepts onSubmit | ✅ | ✅ |
| Returns same object | ✅ | ✅ |
| Has all methods | ✅ | ✅ |
| Has computed properties | ✅ | ✅ |
| Performance | ✅ Identical | ✅ Identical |

**Conclusion:** They're 100% identical!

 

## When to Use Which

### Use Forms.create() When:

✅ **You prefer explicit factory function names**
```javascript
const user = Forms.create({ name: '' });
//                  ^^^^^^ Clear: I'm creating something
```

✅ **Your codebase uses "create" pattern**
```javascript
const store = Redux.createStore(reducer);
const element = React.createElement('div');
const form = Forms.create({ email: '' }); // Consistent!
```

✅ **You're teaching beginners**
```javascript
// More self-documenting for learners
const myForm = Forms.create(initialValues, options);
//                  ^^^^^^ "Oh, this creates a form!"
```

 

### Use Forms.form() When:

✅ **You prefer shorter, more concise code**
```javascript
const user = Forms.form({ name: '' });
//                 ^^^^ Shorter, still clear
```

✅ **Your codebase uses direct naming**
```javascript
const state = ReactiveUtils.state({ count: 0 });
const ref = ReactiveUtils.ref(0);
const form = Forms.form({ email: '' }); // Consistent!
```

✅ **You want to emphasize "what" not "how"**
```javascript
// Focus on the thing being made
const contactForm = Forms.form(values);
//                        ^^^^ It's a form
```

 

### Personal Preference Examples

**Developer A (Prefers "create"):**
```javascript
const loginForm = Forms.create({ email: '', password: '' });
const signupForm = Forms.create({ username: '', email: '', password: '' });
const profileForm = Forms.create({ name: '', bio: '', avatar: '' });
```

**Developer B (Prefers "form"):**
```javascript
const loginForm = Forms.form({ email: '', password: '' });
const signupForm = Forms.form({ username: '', email: '', password: '' });
const profileForm = Forms.form({ name: '', bio: '', avatar: '' });
```

**Both are perfectly valid!** Choose what reads better to you and stay consistent.

 

## Common Patterns

### Pattern 1: Consistent Naming with Other APIs

If you're using the shorthand style elsewhere, use `form()`:

```javascript
// Shorthand style throughout
const count = ref(0);
const items = collection([]);
const myForm = Forms.form({ name: '' }); // ✅ Consistent

// vs

const count = ref(0);
const items = collection([]);
const myForm = Forms.create({ name: '' }); // ❌ Inconsistent
```

 

### Pattern 2: Consistent with Factory Pattern

If you're using factory pattern elsewhere, use `create()`:

```javascript
// Factory pattern throughout
const store = createStore(initialState);
const component = createComponent(config);
const myForm = Forms.create({ name: '' }); // ✅ Consistent

// vs

const store = createStore(initialState);
const component = createComponent(config);
const myForm = Forms.form({ name: '' }); // ❌ Inconsistent
```

 

### Pattern 3: Team Conventions

Choose one and stick to it across your team:

```javascript
// Team A: "create" everywhere
const formA = Forms.create({ email: '' });
const formB = Forms.create({ username: '' });
const formC = Forms.create({ password: '' });

// Team B: "form" everywhere
const formA = Forms.form({ email: '' });
const formB = Forms.form({ username: '' });
const formC = Forms.form({ password: '' });

// Team C: Mixed (confusing!) ❌
const formA = Forms.create({ email: '' });
const formB = Forms.form({ username: '' });
const formC = Forms.create({ password: '' });
// Why the inconsistency? Pick one!
```

 

### Pattern 4: Using Global Shortcuts

With Module 07 loaded, you can use even shorter names:

```javascript
// Both are available globally
const formA = form({ email: '' });        // Short form
const formB = createForm({ name: '' });   // Longer form

// Pick one and be consistent
```

 

## Summary

### Key Takeaways

1. **`Forms.form()` and `Forms.create()` are the exact same function** - they're aliases.

2. **Use whichever name fits your coding style** - there's no performance difference or functional difference.

3. **Be consistent within your project** - pick one naming convention and stick to it.

4. **`Forms.form()` is shorter and more direct** - good for concise code.

5. **`Forms.create()` is more explicit** - good for clarity and teaching.

6. **Both have identical capabilities** - all methods, properties, and behaviors are the same.

7. **The choice is purely stylistic** - like choosing between "color" and "colour" (if both were valid in code).

### One-Line Rule

> **`Forms.form()` is a shorter alias for `Forms.create()` - use whichever name you prefer, just be consistent.**

 

### Quick Decision Guide

**Choose `Forms.create()` if:**
- You like explicit names ✅
- Your codebase uses factory patterns ✅
- You're teaching or documenting ✅

**Choose `Forms.form()` if:**
- You prefer concise code ✅
- Your codebase uses direct names ✅
- You want to emphasize the form itself ✅

**Remember:** There's no wrong choice - both are valid!

 

**What's Next?**

- Learn about `Forms.validators` for built-in validation functions
- Explore form methods in depth (`setValue`, `validate`, `submit`)
- Master form properties (`isValid`, `isDirty`, `touchedFields`)
- Discover advanced form patterns and techniques
