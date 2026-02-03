
# Best Practices: Patterns & Common Mistakes

## Welcome! 🎯

This guide will help you write better reactive code. You'll learn:

- ✅ **Best Practices** — Patterns that work well
- ❌ **Common Mistakes** — Traps to avoid
- 💡 **Pro Tips** — Level up your skills
- 🔧 **Debugging** — How to fix common issues

Whether you're just starting or have been using the library for a while, these tips will help you write cleaner, faster, and more maintainable code.





## 1. State Management

### ✅ DO: Keep State Flat When Possible

**Good — Flat structure:**
```javascript
const user = state({
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
});
```

**Avoid — Deeply nested structure:**
```javascript
const app = state({
  data: {
    users: {
      current: {
        profile: {
          name: 'Alice'  // Hard to track and update
        }
      }
    }
  }
});
```

**Why?** Flat state is easier to read, update, and debug. Deep nesting makes it harder to track what changed.

 

### ✅ DO: Use Descriptive State Property Names

**Good:**
```javascript
const cart = state({
  items: [],
  isCheckoutInProgress: false,
  selectedShippingMethod: 'standard',
  appliedCouponCode: null
});
```

**Avoid:**
```javascript
const cart = state({
  arr: [],           // What array?
  flag: false,       // What flag?
  opt: 'standard',   // What option?
  code: null         // What code?
});
```

**Why?** Clear names make code self-documenting. You (and others) will thank yourself later!

 

### ✅ DO: Initialize All Properties

**Good — All properties initialized:**
```javascript
const form = state({
  username: '',
  email: '',
  password: '',
  errors: {},
  isSubmitting: false,
  isValid: false
});
```

**Avoid — Missing initial values:**
```javascript
const form = state({
  username: '',
  email: ''
  // password added later... causes confusion
});

// Later in code...
form.password = 'secret';  // Where did this come from?
```

**Why?** Seeing all properties upfront makes the data structure clear. Adding properties later can cause unexpected behavior.

 

### ❌ AVOID: Storing DOM Elements in State

**Bad:**
```javascript
const app = state({
  buttonElement: document.getElementById('myBtn'),  // ❌ Don't do this
  inputRef: document.querySelector('.input')        // ❌ Don't do this
});
```

**Good — Use DOM Helpers instead:**
```javascript
const app = state({
  buttonId: 'myBtn',    // Store the ID if needed
  inputClass: 'input'   // Store the class name
});

// Access elements when needed
Elements.myBtn.click();
Collections.ClassName.input.forEach(/* ... */);
```

**Why?** DOM elements don't need reactivity — they're already in the DOM! Use DOM Helpers to access them when needed.

 

### ✅ DO: Use Separate States for Separate Concerns

**Good — Separated by concern:**
```javascript
// User authentication
const auth = state({
  isLoggedIn: false,
  user: null,
  token: null
});

// Shopping cart
const cart = state({
  items: [],
  total: 0
});

// UI state
const ui = state({
  theme: 'light',
  sidebarOpen: true,
  modalVisible: false
});
```

**Avoid — Everything in one giant state:**
```javascript
const everything = state({
  isLoggedIn: false,
  user: null,
  token: null,
  cartItems: [],
  cartTotal: 0,
  theme: 'light',
  sidebarOpen: true,
  modalVisible: false,
  // ... 50 more properties
});
```

**Why?** Separated states are:
- Easier to understand
- More reusable
- Better for performance (fewer unnecessary updates)

 

## 2. Effects & Reactivity

### ✅ DO: Keep Effects Focused on One Task

**Good — Single responsibility:**
```javascript
// Effect for user display
effect(() => {
  Elements.userName.textContent = user.name;
  Elements.userAvatar.src = user.avatar;
});

// Separate effect for theme
effect(() => {
  document.body.className = ui.theme;
});

// Separate effect for notifications
effect(() => {
  Elements.notifBadge.textContent = notifications.count;
});
```

**Avoid — One effect doing everything:**
```javascript
effect(() => {
  // User stuff
  Elements.userName.textContent = user.name;
  Elements.userAvatar.src = user.avatar;

  // Theme stuff
  document.body.className = ui.theme;

  // Notification stuff
  Elements.notifBadge.textContent = notifications.count;

  // Cart stuff
  Elements.cartTotal.textContent = cart.total;

  // ... 20 more things
});
```

**Why?** Focused effects:
- Only run when their specific data changes
- Are easier to debug
- Can be stopped individually if needed

 

### ❌ AVOID: Modifying State Inside Effects

**Bad — Causes infinite loops or unexpected behavior:**
```javascript
effect(() => {
  console.log(counter.value);
  counter.value++;  // ❌ DANGER! This triggers the effect again!
});
```

**Good — Read only, or use conditions:**
```javascript
// Read-only effect
effect(() => {
  console.log(counter.value);  // Just reading, no writing
});

// If you must update, use conditions to prevent loops
effect(() => {
  if (user.name && !user.greeting) {
    // Only set once when name exists but greeting doesn't
    user.greeting = `Hello, ${user.name}!`;
  }
});
```

**Why?** Modifying state in an effect triggers the effect again, potentially causing infinite loops.

 

### ✅ DO: Store Cleanup Functions When Needed

**Good — Storing cleanup for later:**
```javascript
// Store the cleanup function
const stopUserEffect = effect(() => {
  Elements.userName.textContent = user.name;
});

const stopThemeEffect = effect(() => {
  document.body.className = ui.theme;
});

// Later, when component unmounts or user navigates away
function cleanup() {
  stopUserEffect();
  stopThemeEffect();
}
```

**Avoid — Creating effects without storing cleanup:**
```javascript
// No way to stop these later!
effect(() => {
  Elements.userName.textContent = user.name;
});

effect(() => {
  document.body.className = ui.theme;
});

// Memory leak if these keep running after the component is gone
```

**Why?** Without cleanup functions, effects keep running forever, causing memory leaks and unexpected behavior.

 

### ✅ DO: Use `effects()` for Related Effects

**Good — Grouped effects with single cleanup:**
```javascript
const stopAllEffects = effects({
  userName: () => {
    Elements.userName.textContent = user.name;
  },
  userEmail: () => {
    Elements.userEmail.textContent = user.email;
  },
  userAvatar: () => {
    Elements.userAvatar.src = user.avatar;
  }
});

// Single cleanup stops all
stopAllEffects();
```

**Less ideal — Multiple separate effects:**
```javascript
const stop1 = effect(() => { /* ... */ });
const stop2 = effect(() => { /* ... */ });
const stop3 = effect(() => { /* ... */ });

// Must remember to stop all three
function cleanup() {
  stop1();
  stop2();
  stop3();
}
```

 

## 3. Computed Properties

### ✅ DO: Use Regular Functions, Not Arrow Functions

**Good — Regular function with correct `this`:**
```javascript
computed(cart, {
  total: function() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },
  itemCount: function() {
    return this.items.length;
  }
});
```

**Bad — Arrow function with wrong `this`:**
```javascript
computed(cart, {
  total: () => {
    return this.items.reduce(/* ... */);  // ❌ `this` is wrong!
  }
});
```

**Why?** Arrow functions don't have their own `this` — they inherit it from the surrounding scope. Regular functions get `this` bound to the state object.

 

### ✅ DO: Keep Computed Properties Pure

**Good — Pure calculation, no side effects:**
```javascript
computed(cart, {
  total: function() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },
  formattedTotal: function() {
    return `$${this.total.toFixed(2)}`;
  }
});
```

**Bad — Side effects in computed:**
```javascript
computed(cart, {
  total: function() {
    console.log('Calculating total...');  // ❌ Side effect
    localStorage.setItem('lastTotal', sum);  // ❌ Side effect
    document.title = `Cart: $${sum}`;  // ❌ Side effect
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
});
```

**Why?** Computed properties can run multiple times (for caching). Side effects in them cause unpredictable behavior. Put side effects in `effect()` instead.

 

### ✅ DO: Chain Computed Properties

**Good — Building on other computed:**
```javascript
computed(order, {
  subtotal: function() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },
  tax: function() {
    return this.subtotal * this.taxRate;  // Uses subtotal
  },
  shipping: function() {
    return this.subtotal > 50 ? 0 : 5.99;  // Uses subtotal
  },
  total: function() {
    return this.subtotal + this.tax + this.shipping;  // Uses all three
  }
});
```

**Why?** Chained computed properties are:
- More maintainable (change one, others update)
- Self-documenting
- Efficiently cached

 

## 4. DOM Helpers Usage

### ✅ DO: Choose the Right Helper

| Situation | Use This |
|-----------|----------|
| Single element by ID | `Elements.myId` |
| Multiple elements by class | `Collections.ClassName.myClass` |
| Multiple elements by tag | `Collections.TagName.div` |
| Complex CSS selector (single) | `Selector.query('.parent > .child')` |
| Complex CSS selector (multiple) | `Selector.queryAll('.parent > .child')` |

**Good — Right tool for the job:**
```javascript
// Single element by ID
Elements.submitBtn.disabled = true;

// All elements with a class
Collections.ClassName.menuItem.forEach(item => {
  item.classList.remove('active');
});

// Complex selector
Selector.queryAll('nav.main > ul > li > a').forEach(link => {
  link.classList.add('nav-link');
});
```

 

### ✅ DO: Use Batch Updates

**Good — Single batch update:**
```javascript
effect(() => {
  Elements.update({
    userName: { textContent: user.name },
    userEmail: { textContent: user.email },
    userAvatar: { src: user.avatar },
    userBio: { innerHTML: user.bio }
  });
});
```

**Less efficient — Multiple individual updates:**
```javascript
effect(() => {
  Elements.userName.textContent = user.name;
  Elements.userEmail.textContent = user.email;
  Elements.userAvatar.src = user.avatar;
  Elements.userBio.innerHTML = user.bio;
});
```

**Why?** Batch updates are more readable and may be more efficient.

 

### ❌ AVOID: Querying DOM in Loops Without Caching

**Bad — Queries DOM every iteration:**
```javascript
for (let i = 0; i < 100; i++) {
  document.getElementById('counter').textContent = i;  // ❌ 100 DOM lookups!
}
```

**Good — Cache the reference:**
```javascript
const counter = Elements.counter;  // One lookup, cached

for (let i = 0; i < 100; i++) {
  counter.textContent = i;  // Uses cached reference
}
```

**Why?** DOM lookups are relatively expensive. DOM Helpers automatically cache, but be mindful in loops.

 

## 5. Performance Optimization

### ✅ DO: Use `batch()` for Multiple State Changes

**Good — Batched updates:**
```javascript
function processOrder(orderData) {
  batch(() => {
    cart.items = orderData.items;
    cart.subtotal = orderData.subtotal;
    cart.tax = orderData.tax;
    cart.total = orderData.total;
    cart.status = 'processed';
  });
  // Effects run ONCE after all changes
}
```

**Less efficient — Unbatched updates:**
```javascript
function processOrder(orderData) {
  cart.items = orderData.items;      // Effects run
  cart.subtotal = orderData.subtotal; // Effects run again
  cart.tax = orderData.tax;           // Effects run again
  cart.total = orderData.total;       // Effects run again
  cart.status = 'processed';          // Effects run again
  // 5 effect runs instead of 1!
}
```

**Why?** Without batching, effects run after each state change. Batching groups changes so effects only run once.

 

### ✅ DO: Be Specific About What You Read

**Good — Only reads what's needed:**
```javascript
// This effect only tracks 'name'
effect(() => {
  Elements.greeting.textContent = `Hello, ${user.name}`;
});

// Changing user.email won't trigger this effect
```

**Less efficient — Reads entire object:**
```javascript
// This effect tracks EVERY property
effect(() => {
  console.log(user);  // Logs entire object
  Elements.greeting.textContent = `Hello, ${user.name}`;
});

// Changing ANY property triggers this effect
```

**Why?** Effects only re-run when properties they actually READ change. Reading the whole object tracks all properties.

 

### ✅ DO: Debounce Rapid Updates

**Good — Debounced input:**
```javascript
let searchTimeout;

Elements.searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    search.query = e.target.value;  // State updates after delay
  }, 300);
});
```

**Bad — Updates on every keystroke:**
```javascript
Elements.searchInput.addEventListener('input', (e) => {
  search.query = e.target.value;  // Updates immediately, very rapid
});
```

**Why?** Rapid state changes cause rapid effect runs. Debouncing waits for the user to pause typing.

 

### ❌ AVOID: Large Arrays in Effects Without Optimization

**Bad — Re-renders entire list:**
```javascript
effect(() => {
  // Rebuilds entire HTML every time ANY item changes
  Elements.todoList.innerHTML = todos.items
    .map(item => `<li>${item.text}</li>`)
    .join('');
});
```

**Better — Consider virtualization for large lists:**
```javascript
// For very large lists, consider:
// 1. Pagination
// 2. Virtual scrolling
// 3. Only rendering visible items

effect(() => {
  const visible = todos.items.slice(
    todos.scrollPosition,
    todos.scrollPosition + 20
  );

  Elements.todoList.innerHTML = visible
    .map(item => `<li>${item.text}</li>`)
    .join('');
});
```

 

## 6. Code Organization

### ✅ DO: Group Related Code Together

**Good — Organized by feature:**
```javascript
// ===== USER FEATURE =====

// State
const user = state({
  name: '',
  email: '',
  isLoggedIn: false
});

// Computed
computed(user, {
  displayName: function() {
    return this.name || 'Guest';
  }
});

// Effects
effect(() => {
  Elements.userName.textContent = user.displayName;
});

// Actions
function login(credentials) { /* ... */ }
function logout() { /* ... */ }


// ===== CART FEATURE =====

// State
const cart = state({ items: [] });

// Computed
computed(cart, { /* ... */ });

// Effects
effect(() => { /* ... */ });

// Actions
function addToCart(item) { /* ... */ }
```

 

### ✅ DO: Use Consistent Naming Conventions

**Good — Consistent naming:**
```javascript
// States: noun describing the data
const user = state({ /* ... */ });
const cart = state({ /* ... */ });
const settings = state({ /* ... */ });

// Computed: descriptive of the derived value
computed(cart, {
  totalPrice: function() { /* ... */ },
  itemCount: function() { /* ... */ },
  isEmpty: function() { /* ... */ }
});

// Actions: verbs describing the action
function addItem(item) { /* ... */ }
function removeItem(id) { /* ... */ }
function clearCart() { /* ... */ }

// Effects: describe what they update
effects({
  updateCartBadge: () => { /* ... */ },
  updateTotalDisplay: () => { /* ... */ },
  syncWithServer: () => { /* ... */ }
});
```

 

### ✅ DO: Create Reusable Patterns

**Good — Reusable toggle pattern:**
```javascript
function createToggle(initialValue = false) {
  const toggle = state({ value: initialValue });

  return {
    state: toggle,
    on: () => toggle.value = true,
    off: () => toggle.value = false,
    toggle: () => toggle.value = !toggle.value,
    get isOn() { return toggle.value; }
  };
}

// Usage
const darkMode = createToggle(false);
const sidebar = createToggle(true);

darkMode.toggle();
console.log(darkMode.isOn);  // true
```

 

## 7. Debugging Tips

### 💡 TIP: Add Logging Effects During Development

```javascript
// Debug effect — remove in production!
effect(() => {
  console.log('🔍 User state:', {
    name: user.name,
    email: user.email,
    isLoggedIn: user.isLoggedIn
  });
});
```

 

### 💡 TIP: Use `watch()` to Debug Specific Changes

```javascript
// Watch specific properties
watch(cart, {
  items: (newItems, oldItems) => {
    console.log('📦 Cart items changed:');
    console.log('  Old:', oldItems);
    console.log('  New:', newItems);
  }
});
```

 

### 💡 TIP: Check If State Is Reactive

```javascript
import { isReactive } from 'your-reactive-lib';

const myObj = { count: 0 };
const myState = state({ count: 0 });

console.log(isReactive(myObj));    // false
console.log(isReactive(myState));  // true
```

 

### 💡 TIP: Isolate Problems

When something isn't working:

1. **Check the state** — Is it updating?
   ```javascript
   console.log('State:', myState);
   ```

2. **Check the effect** — Is it running?
   ```javascript
   effect(() => {
     console.log('Effect ran!');
     // ... rest of effect
   });
   ```

3. **Check the DOM** — Is the element there?
   ```javascript
   console.log('Element:', Elements.myElement);
   ```

 

## 8. Memory Management

### ✅ DO: Clean Up When Components Unmount

**Good — Proper cleanup:**
```javascript
function createUserCard() {
  const user = state({ name: '', avatar: '' });

  const cleanup = effects({
    name: () => Elements.cardName.textContent = user.name,
    avatar: () => Elements.cardAvatar.src = user.avatar
  });

  // Return cleanup function
  return {
    state: user,
    destroy: cleanup
  };
}

// Usage
const card = createUserCard();

// When done with the card
card.destroy();  // Stops all effects
```

 

### ✅ DO: Remove Event Listeners

**Good — Track and remove listeners:**
```javascript
function setupInteractions() {
  const handleClick = () => console.log('Clicked!');
  const handleScroll = () => console.log('Scrolled!');

  Elements.myButton.addEventListener('click', handleClick);
  window.addEventListener('scroll', handleScroll);

  // Return cleanup function
  return () => {
    Elements.myButton.removeEventListener('click', handleClick);
    window.removeEventListener('scroll', handleScroll);
  };
}

const cleanup = setupInteractions();

// When done
cleanup();
```

 

### ❌ AVOID: Creating Effects in Loops

**Bad — Creates new effects every render:**
```javascript
effect(() => {
  items.forEach(item => {
    // ❌ Creates a new effect for each item, every time!
    effect(() => {
      console.log(item.name);
    });
  });
});
```

**Good — Single effect handles all items:**
```javascript
effect(() => {
  items.forEach(item => {
    console.log(item.name);  // Just do the work directly
  });
});
```

 

## Quick Reference Checklist

### Before You Ship ✅

- [ ] All state properties are initialized
- [ ] Effects are focused and single-purpose
- [ ] Computed properties use regular functions
- [ ] Cleanup functions are stored and called
- [ ] No state modifications inside effects (unless guarded)
- [ ] Batch updates used for multiple changes
- [ ] Event listeners are removed when done
- [ ] No console.logs left in production code
- [ ] Large lists are optimized (pagination/virtualization)

### Common Mistakes to Avoid ❌

- [ ] Arrow functions in computed properties
- [ ] Deeply nested state
- [ ] Storing DOM elements in state
- [ ] Modifying state in effects without guards
- [ ] Forgetting to clean up effects
- [ ] Creating effects inside loops
- [ ] Not using batch for multiple updates

 

## Summary

**The Golden Rules:**

1. **State** — Keep it flat, descriptive, and separate by concern
2. **Effects** — Keep them focused, read-only, and clean them up
3. **Computed** — Use regular functions, keep them pure
4. **DOM Helpers** — Use the right tool, batch when possible
5. **Performance** — Batch updates, debounce inputs, be specific
6. **Organization** — Group by feature, use consistent naming
7. **Memory** — Always clean up effects and event listeners

Follow these practices, and you'll write reactive code that's:
- ✅ Easy to understand
- ✅ Easy to debug
- ✅ Performant
- ✅ Memory-safe
- ✅ Maintainable

Happy coding! 🎉
