# Understanding `getRaw()` - A Beginner's Guide

## Quick Start (30 seconds)

Need to get the raw, non-reactive object from reactive state? Here's how:

```js
const reactiveUser = state({
  name: 'John',
  age: 25
});

// Get the raw version
const plainUser = getRaw(reactiveUser);

console.log(isReactive(reactiveUser));  // true
console.log(isReactive(plainUser));     // false
```

**That's it!** `getRaw()` is an alias for [`toRaw()`](../Utility%20Functions/toRaw.md) - it extracts the plain object from a reactive proxy!

 

## What is `getRaw()`?

`getRaw()` is a **namespace method alias** for `toRaw()` that provides a consistent API pattern with other Module 09 methods. It extracts the original, non-reactive object from a reactive proxy.

**Note:** `getRaw()` is simply another way to call `toRaw()`. They do exactly the same thing!

 

## Syntax

```js
// Using the namespace method
ReactiveUtils.getRaw(state)

// Equivalent to
ReactiveUtils.toRaw(state)

// Also available as shortcut
toRaw(state)
```

**All styles are valid!** Choose whichever you prefer:
- **Namespace style** (`ReactiveUtils.getRaw()`) - Matches Module 09 pattern
- **toRaw() function** - More concise
- **Global shortcut** - Cleanest

 

## Why Does This Exist?

`getRaw()` exists to provide API consistency with other Module 09 namespace methods like `set()`, `cleanup()`, etc. It follows the pattern where methods can be called as:
- `ReactiveUtils.methodName(state, ...)`


For `getRaw()`:
- `ReactiveUtils.getRaw(state)` → Namespace style
- `toRaw(state)` → Direct function style

**When to use which:**
- Use `ReactiveUtils.getRaw()` for consistency with other `ReactiveUtils.*` calls
- Use `toRaw()` for conciseness


 

## Basic Usage

All these are equivalent:

```js
const reactive = state({ count: 0 });

// Namespace method (Module 09 style)
const plain1 = ReactiveUtils.getRaw(reactive);

// Direct function
const plain2 = toRaw(reactive);



// All return the same raw object
console.log(plain1 === plain2);  // true
console.log(plain2 === plain3);  // true
```

 

## Documentation Reference

For complete documentation on how to use this function, see the [`toRaw()` documentation](../Utility%20Functions/toRaw.md).

The `toRaw()` docs include:
- Detailed explanations
- Mental models
- 10+ real-world examples
- Common patterns
- Common pitfalls
- Full API reference

 

## Quick Reference

```js
// Get raw object for serialization
const json = JSON.stringify(getRaw(state));

// Save to localStorage
localStorage.setItem('data', JSON.stringify(getRaw(state)));

// Send to API
await fetch('/api/data', {
  method: 'POST',
  body: JSON.stringify(getRaw(state))
});

// Deep equality comparison
const raw1 = getRaw(state1);
const raw2 = getRaw(state2);
console.log(JSON.stringify(raw1) === JSON.stringify(raw2));
```

 

## Summary

**What is `getRaw()`?**

`getRaw()` is a **namespace method alias** for `toRaw()` that extracts the plain object from a reactive proxy. It exists for API consistency with other Module 09 methods.

**Key Points:**
- Alias for `toRaw()`
- Same functionality
- Namespace style: `ReactiveUtils.getRaw()`
- See [`toRaw()` docs](../Utility%20Functions/toRaw.md) for full details

**Remember:** Use `getRaw()` when you want the namespace style, or use `toRaw()` directly for conciseness. Both do exactly the same thing!
