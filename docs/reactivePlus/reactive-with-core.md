# Reactive with Core: Elements, Collections & Selector

## What You'll Learn 🎯

In this tutorial, you'll master how to combine **reactive state** with the **Core DOM Helpers**:

- **Elements** — Access single elements by ID
- **Collections** — Access multiple elements by class name
- **Selector** — Access elements using CSS selectors

By the end, you'll be able to build dynamic UIs that update themselves beautifully.

 

## Prerequisites

Make sure you're comfortable with:
- Creating state with `state()`
- Using effects with `effect()`

If not, check out the [Getting Started](getting-started.md) guide first!

 

## Part 1: Elements — Your Single Element Friend

### What is Elements?

`Elements` is a helper that gives you instant access to any element by its ID. No more typing `document.getElementById()` everywhere!

```javascript
// ❌ The old way
document.getElementById('myButton').textContent = 'Click me';

// ✅ The Elements way
Elements.myButton.textContent = 'Click me';
```

Same result, cleaner code. But here's where it gets interesting...

 

### Elements + Reactive State = Magic

Let's build a **profile card** that updates when data changes:

**The HTML:**
```html
<div class="profile-card">
  <img id="avatar" src="default.png" alt="Avatar">
  <h2 id="userName">Loading...</h2>
  <p id="userBio">Loading bio...</p>
  <span id="userStatus" class="status">offline</span>
</div>
```

**The Reactive Code:**
```javascript
// Step 1: Create state for the user
const user = state({
  name: 'Alice Johnson',
  bio: 'Developer & Coffee Enthusiast',
  avatar: 'alice.png',
  status: 'online'
});

// Step 2: Set up effects to sync UI with state
effect(() => {
  Elements.userName.textContent = user.name;
});

effect(() => {
  Elements.userBio.textContent = user.bio;
});

effect(() => {
  Elements.avatar.src = user.avatar;
});

effect(() => {
  Elements.userStatus.textContent = user.status;
  Elements.userStatus.className = `status status-${user.status}`;
});
```

**What happens:**
- Each effect watches specific data
- When that data changes, only that effect runs
- The UI stays perfectly in sync

**Try it:**
```javascript
user.status = 'away';
// ✨ Only the status effect runs, updates both text and class

user.name = 'Alice Smith';
// ✨ Only the name effect runs
```

 

### Elements.update() — The Batch Updater

When you need to update multiple properties at once, `Elements.update()` is your friend:

```javascript
effect(() => {
  Elements.update({
    userName: {
      textContent: user.name
    },
    userBio: {
      textContent: user.bio
    },
    avatar: {
      src: user.avatar,
      alt: `${user.name}'s avatar`
    },
    userStatus: {
      textContent: user.status,
      className: `status status-${user.status}`
    }
  });
});
```

**The structure is simple:**
```javascript
Elements.update({
  elementId: {
    property: value,
    anotherProperty: anotherValue
  },
  anotherElementId: {
    property: value
  }
});
```

**Why use it?**
- ✅ All updates in one place
- ✅ Easier to read and maintain
- ✅ One effect instead of many

 

### Real Example: A Counter with Multiple Displays

Let's build a counter that appears in several places:

**HTML:**
```html
<header>
  <span>Items: <strong id="headerCount">0</strong></span>
</header>

<main>
  <h1>Your Cart</h1>
  <p id="cartMessage">Your cart is empty</p>
  <p>Total items: <span id="mainCount">0</span></p>
</main>

<footer>
  <button id="addBtn">Add Item</button>
  <button id="removeBtn">Remove Item</button>
  <button id="clearBtn" style="display: none;">Clear All</button>
</footer>
```

**Reactive Code:**
```javascript
const cart = state({ count: 0 });

effect(() => {
  const count = cart.count;

  Elements.update({
    // Update all count displays
    headerCount: { textContent: count },
    mainCount: { textContent: count },

    // Update the message
    cartMessage: {
      textContent: count === 0
        ? 'Your cart is empty'
        : `You have ${count} item${count === 1 ? '' : 's'}`
    },

    // Show/hide clear button
    clearBtn: {
      style: { display: count > 0 ? 'inline-block' : 'none' }
    }
  });
});

// Button handlers just update state
Elements.addBtn.addEventListener('click', () => {
  cart.count++;
});

Elements.removeBtn.addEventListener('click', () => {
  if (cart.count > 0) cart.count--;
});

Elements.clearBtn.addEventListener('click', () => {
  cart.count = 0;
});
```

**The beautiful part:** All three buttons just modify `cart.count`. The effect handles ALL the UI updates automatically!

 

## Part 2: Collections — Working with Groups

### What is Collections?

While `Elements` handles single elements, `Collections` handles **groups of elements** — typically elements that share a class name.

```javascript
// Get all elements with class "card"
Collections.ClassName.card

// Get all elements with class "menu-item"
Collections.ClassName.menuItem
```

**Note:** Class names with hyphens become camelCase: `menu-item` → `menuItem`

 

### Collections + Reactive State

Let's build a **notification badge system** where multiple badges show the same count:

**HTML:**
```html
<nav>
  <a href="#">Home</a>
  <a href="#">
    Messages
    <span class="badge notification-count">0</span>
  </a>
  <a href="#">
    Profile
    <span class="badge notification-count">0</span>
  </a>
</nav>

<div class="widget">
  <h3>Notifications</h3>
  <span class="notification-count">0</span> unread
</div>
```

**Reactive Code:**
```javascript
const notifications = state({ unread: 0 });

effect(() => {
  // Update ALL elements with class "notification-count"
  Collections.ClassName.notificationCount.forEach(element => {
    element.textContent = notifications.unread;
  });
});

// Simulate receiving notifications
function receiveNotification() {
  notifications.unread++;
  // ✨ All badges update automatically!
}
```

**What's happening:**
1. `Collections.ClassName.notificationCount` gives us all matching elements
2. We loop through them with `forEach`
3. Each one gets updated with the new count

 

### Collections.update() — Batch Update for Groups

Just like `Elements.update()`, Collections has a batch method:

```javascript
effect(() => {
  Collections.ClassName.notificationCount.update({
    textContent: notifications.unread,
    style: {
      display: notifications.unread > 0 ? 'inline-flex' : 'none'
    }
  });
});
```

This updates **ALL** elements with that class in one go!

 

### Real Example: A Tab System

Let's build tabs where clicking highlights the active one:

**HTML:**
```html
<div class="tabs">
  <button class="tab" data-tab="home">Home</button>
  <button class="tab" data-tab="profile">Profile</button>
  <button class="tab" data-tab="settings">Settings</button>
</div>

<div class="tab-content" data-tab="home">Welcome home!</div>
<div class="tab-content" data-tab="profile">Your profile info</div>
<div class="tab-content" data-tab="settings">Settings panel</div>
```

**Reactive Code:**
```javascript
const tabs = state({ active: 'home' });

// Update tab buttons
effect(() => {
  Collections.ClassName.tab.forEach(button => {
    const isActive = button.dataset.tab === tabs.active;
    button.classList.toggle('active', isActive);
  });
});

// Update tab content
effect(() => {
  Collections.ClassName.tabContent.forEach(panel => {
    const isVisible = panel.dataset.tab === tabs.active;
    panel.style.display = isVisible ? 'block' : 'none';
  });
});

// Handle tab clicks
Collections.ClassName.tab.forEach(button => {
  button.addEventListener('click', () => {
    tabs.active = button.dataset.tab;
    // ✨ Both effects run, UI updates perfectly!
  });
});
```

**The flow:**
```
User clicks "Profile" tab
        ↓
tabs.active = 'profile'
        ↓
Both effects run:
├── Tab buttons: "Profile" gets 'active' class, others lose it
└── Tab panels: "Profile" panel shows, others hide
        ↓
User sees the switch instantly ✨
```

 

### Iterating with Collections

Collections works great with `forEach`, but you have other options too:

```javascript
// forEach - do something to each element
Collections.ClassName.card.forEach(card => {
  card.style.opacity = '1';
});

// Convert to array for array methods
const cards = Array.from(Collections.ClassName.card);

// Filter, map, etc.
const visibleCards = cards.filter(card => card.dataset.visible === 'true');
```

 

## Part 3: Selector — CSS Power

### What is Selector?

`Selector` lets you use **CSS selectors** to find elements — perfect for complex queries.

```javascript
// Single element (like querySelector)
Selector.query('.sidebar .active-link')

// Multiple elements (like querySelectorAll)
Selector.queryAll('nav > a')
```

 

### When to Use Each Helper

| Use This | When You Need |
|----------|--------------|
| `Elements.id` | A single element by ID |
| `Collections.ClassName.name` | All elements sharing a class |
| `Selector.query()` | Complex CSS selector (single result) |
| `Selector.queryAll()` | Complex CSS selector (multiple results) |

 

### Selector + Reactive State

Let's build a **theme-aware navigation** that highlights based on the current page:

**HTML:**
```html
<nav class="main-nav">
  <a href="/" data-page="home">Home</a>
  <a href="/about" data-page="about">About</a>
  <a href="/contact" data-page="contact">Contact</a>
</nav>

<nav class="footer-nav">
  <a href="/" data-page="home">Home</a>
  <a href="/about" data-page="about">About</a>
</nav>
```

**Reactive Code:**
```javascript
const app = state({ currentPage: 'home' });

effect(() => {
  // Select all navigation links across different navs
  Selector.queryAll('nav a[data-page]').forEach(link => {
    const isActive = link.dataset.page === app.currentPage;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
});

// Handle navigation
Selector.queryAll('nav a[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    app.currentPage = link.dataset.page;
  });
});
```

**Why Selector here?**
- We need links from multiple `<nav>` elements
- We need links with a specific attribute
- CSS selector `nav a[data-page]` captures exactly what we need

 

### Real Example: Form with Validation Styling

Let's style form inputs based on validation state:

**HTML:**
```html
<form id="signupForm">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" class="form-input" required>
    <span class="error-message"></span>
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" id="password" class="form-input" required>
    <span class="error-message"></span>
  </div>

  <button type="submit">Sign Up</button>
</form>
```

**Reactive Code:**
```javascript
const form = state({
  email: '',
  password: '',
  errors: {
    email: '',
    password: ''
  }
});

// Validate and update error states
effect(() => {
  // Email validation
  const emailInput = Selector.query('#signupForm #email');
  const emailError = Selector.query('#signupForm #email + .error-message');

  if (form.email && !form.email.includes('@')) {
    form.errors.email = 'Please enter a valid email';
    emailInput.classList.add('invalid');
  } else {
    form.errors.email = '';
    emailInput.classList.remove('invalid');
  }
  emailError.textContent = form.errors.email;
});

effect(() => {
  // Password validation
  const passwordInput = Selector.query('#signupForm #password');
  const passwordError = Selector.query('#signupForm #password + .error-message');

  if (form.password && form.password.length < 8) {
    form.errors.password = 'Password must be at least 8 characters';
    passwordInput.classList.add('invalid');
  } else {
    form.errors.password = '';
    passwordInput.classList.remove('invalid');
  }
  passwordError.textContent = form.errors.password;
});

// Connect inputs to state
Selector.query('#email').addEventListener('input', (e) => {
  form.email = e.target.value;
});

Selector.query('#password').addEventListener('input', (e) => {
  form.password = e.target.value;
});
```

 

## Combining All Three

Here's a complete example using Elements, Collections, AND Selector together:

**Building a Product Filter:**

```html
<div id="productPage">
  <!-- Header with count -->
  <header>
    <h1>Products</h1>
    <span id="productCount">0 products</span>
  </header>

  <!-- Filter buttons -->
  <div class="filters">
    <button class="filter-btn" data-category="all">All</button>
    <button class="filter-btn" data-category="electronics">Electronics</button>
    <button class="filter-btn" data-category="clothing">Clothing</button>
  </div>

  <!-- Product grid -->
  <div class="product-grid">
    <div class="product" data-category="electronics">Phone</div>
    <div class="product" data-category="electronics">Laptop</div>
    <div class="product" data-category="clothing">T-Shirt</div>
    <div class="product" data-category="clothing">Jeans</div>
  </div>
</div>
```

**Reactive Code:**
```javascript
const filters = state({ category: 'all' });

// Update product count (using Elements)
effect(() => {
  const visible = filters.category === 'all'
    ? Collections.ClassName.product.length
    : Selector.queryAll(`.product[data-category="${filters.category}"]`).length;

  Elements.productCount.textContent = `${visible} products`;
});

// Update filter buttons (using Collections)
effect(() => {
  Collections.ClassName.filterBtn.forEach(btn => {
    const isActive = btn.dataset.category === filters.category;
    btn.classList.toggle('active', isActive);
  });
});

// Update product visibility (using Selector)
effect(() => {
  Selector.queryAll('.product').forEach(product => {
    const show = filters.category === 'all' ||
                 product.dataset.category === filters.category;
    product.style.display = show ? 'block' : 'none';
  });
});

// Handle filter clicks
Collections.ClassName.filterBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.category = btn.dataset.category;
  });
});
```

**What we used:**
- **Elements** for the unique `#productCount`
- **Collections** for the `.filter-btn` group
- **Selector** for complex queries like `.product[data-category="electronics"]`

 

## Best Practices Summary

### 📌 Choose the Right Tool

```
Need ONE element by ID?
    → Elements.elementId

Need ALL elements with a class?
    → Collections.ClassName.className

Need a complex CSS selection?
    → Selector.query() or Selector.queryAll()
```

### 📌 Keep Effects Focused

```javascript
// ✅ Good: One effect, one responsibility
effect(() => {
  Elements.counter.textContent = state.count;
});

effect(() => {
  Elements.total.textContent = state.count * state.price;
});

// ⚠️ Okay: Related updates together
effect(() => {
  Elements.update({
    counter: { textContent: state.count },
    total: { textContent: state.count * state.price }
  });
});
```

### 📌 Use Batch Updates for Multiple Properties

```javascript
// ❌ Verbose
effect(() => {
  Elements.card.textContent = state.title;
  Elements.card.className = state.type;
  Elements.card.style.opacity = state.visible ? '1' : '0';
});

// ✅ Clean
effect(() => {
  Elements.update({
    card: {
      textContent: state.title,
      className: state.type,
      style: { opacity: state.visible ? '1' : '0' }
    }
  });
});
```

 

## What You've Learned 🎓

| Concept | What It Does |
|---------|--------------|
| `Elements.id` | Quick access to elements by ID |
| `Elements.update({})` | Batch update multiple elements |
| `Collections.ClassName.name` | Access groups of elements |
| `Collections.update({})` | Batch update all in group |
| `Selector.query()` | CSS selector for one element |
| `Selector.queryAll()` | CSS selector for multiple elements |

 

## Practice Challenge 🚀

Build a **shopping list** with these features:

1. Input to add items
2. Display shows all items (use Collections)
3. Total count in header (use Elements)
4. "Clear completed" removes checked items (use Selector)

**Starter HTML:**
```html
<div id="shoppingList">
  <header>
    <h1>Shopping List</h1>
    <span id="itemCount">0 items</span>
  </header>

  <input type="text" id="newItem" placeholder="Add item...">
  <button id="addBtn">Add</button>

  <ul id="list">
    <!-- Items will be added here -->
  </ul>

  <button id="clearCompleted">Clear Completed</button>
</div>
```

Give it a try! Use what you've learned about Elements, Collections, and Selector.

 

## Next Steps

Ready to add more interactivity? Continue to:

- [Reactive with Enhancers](reactive-with-enhancers.md) — Events, animations, and attributes
- [Reactive with Conditions](reactive-with-conditions.md) — Show/hide and conditional rendering
- [Building a Todo App](building-a-todo-app.md) — Put it all together!

You're doing great! 🌟
