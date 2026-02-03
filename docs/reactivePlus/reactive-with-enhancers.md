# Reactive with Enhancers: Bulk Updates & Shortcuts

## What You'll Learn 🎯

In this tutorial, you'll discover how **Enhancers** supercharge your DOM manipulation:

- **Bulk Property Updaters** — Update many elements at once
- **Property Shortcuts** — `textContent()`, `style()`, `classes()`, and more
- **Indexed Updates** — Target specific items in collections by index
- **Chainable Methods** — Smooth, readable code

When combined with reactive state, these tools make your code incredibly clean and powerful!

---

## Prerequisites

Before starting, make sure you understand:
- Creating state with `state()`
- Using effects with `effect()`
- Basic Elements and Collections (from [Reactive with Core](reactive-with-core.md))

---

## What Are Enhancers?

**Enhancers** are add-ons that give your DOM Helpers superpowers. They add:

1. **Shortcut methods** like `textContent()`, `style()`, `classes()`
2. **Bulk operations** to update multiple elements in one call
3. **Index-based updates** for collections
4. **Chainable syntax** for cleaner code

Think of them as **power tools** — you can still use a regular screwdriver (basic DOM), but a power drill (Enhancers) is faster and easier!

---

## Part 1: Bulk Text Updates

### The Basic Way

Without enhancers, updating text on multiple elements looks like this:

```javascript
const user = state({ name: 'Alice', role: 'Developer', status: 'Active' });

effect(() => {
  Elements.userName.textContent = user.name;
  Elements.userRole.textContent = user.role;
  Elements.userStatus.textContent = user.status;
});
```

It works, but it's repetitive.

### The Enhanced Way

With the `textContent()` enhancer:

```javascript
const user = state({ name: 'Alice', role: 'Developer', status: 'Active' });

effect(() => {
  Elements.textContent({
    userName: user.name,
    userRole: user.role,
    userStatus: user.status
  });
});
```

**What changed?**
- One method call instead of three
- Cleaner, more scannable code
- Same result!

---

### Understanding the Pattern

The pattern is always:

```javascript
Elements.propertyName({
  elementId: value,
  anotherElementId: anotherValue
});
```

**Available text properties:**
| Method | What It Updates |
|--------|-----------------|
| `textContent()` | Text content |
| `innerHTML()` | HTML content |
| `innerText()` | Visible text |
| `value()` | Input/textarea values |
| `placeholder()` | Placeholder text |

---

### Real Example: Dashboard Stats

Let's build a stats display that updates from reactive state:

**HTML:**
```html
<div class="dashboard">
  <div class="stat">
    <span class="stat-label">Users</span>
    <span id="userCount" class="stat-value">0</span>
  </div>
  <div class="stat">
    <span class="stat-label">Revenue</span>
    <span id="revenueAmount" class="stat-value">$0</span>
  </div>
  <div class="stat">
    <span class="stat-label">Orders</span>
    <span id="orderCount" class="stat-value">0</span>
  </div>
</div>
```

**Reactive Code:**
```javascript
const stats = state({
  users: 1250,
  revenue: 45780,
  orders: 328
});

effect(() => {
  Elements.textContent({
    userCount: stats.users.toLocaleString(),
    revenueAmount: `$${stats.revenue.toLocaleString()}`,
    orderCount: stats.orders.toLocaleString()
  });
});

// Simulate live updates
setInterval(() => {
  stats.users += Math.floor(Math.random() * 10);
  stats.revenue += Math.floor(Math.random() * 100);
  stats.orders += Math.floor(Math.random() * 3);
}, 3000);
```

**What happens:**
1. State holds our data
2. Effect uses bulk `textContent()` to update all displays
3. When state changes, all three stats update automatically

---

## Part 2: Bulk Style Updates

### Updating Styles Reactively

The `style()` enhancer lets you update CSS properties on multiple elements:

```javascript
const theme = state({
  primaryColor: '#3498db',
  textColor: '#333',
  fontSize: 16
});

effect(() => {
  Elements.style({
    header: {
      backgroundColor: theme.primaryColor,
      color: 'white'
    },
    mainContent: {
      color: theme.textColor,
      fontSize: `${theme.fontSize}px`
    },
    footer: {
      borderTopColor: theme.primaryColor
    }
  });
});
```

**The pattern:**
```javascript
Elements.style({
  elementId: {
    cssProperty: value,
    anotherProperty: anotherValue
  }
});
```

---

### Real Example: Dark Mode Toggle

Let's build a theme switcher:

**HTML:**
```html
<div id="app">
  <header id="appHeader">My App</header>
  <main id="appMain">Content here...</main>
  <button id="themeToggle">Toggle Theme</button>
</div>
```

**Reactive Code:**
```javascript
const ui = state({ darkMode: false });

// Define theme colors
const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    headerBg: '#3498db',
    headerText: '#ffffff'
  },
  dark: {
    background: '#1a1a2e',
    text: '#eaeaea',
    headerBg: '#16213e',
    headerText: '#eaeaea'
  }
};

effect(() => {
  // Pick the right theme
  const colors = ui.darkMode ? themes.dark : themes.light;

  // Apply to elements
  Elements.style({
    app: {
      backgroundColor: colors.background,
      color: colors.text,
      transition: 'all 0.3s ease'
    },
    appHeader: {
      backgroundColor: colors.headerBg,
      color: colors.headerText
    }
  });
});

// Toggle handler
Elements.themeToggle.addEventListener('click', () => {
  ui.darkMode = !ui.darkMode;
});
```

**The magic:**
- One boolean (`darkMode`) controls the entire theme
- Effect recalculates colors and applies them
- CSS transition makes it smooth!

---

## Part 3: Bulk Class Updates

### Managing CSS Classes

The `classes()` enhancer handles class manipulation:

```javascript
Elements.classes({
  elementId: {
    add: 'new-class',           // Add a class
    remove: 'old-class',        // Remove a class
    toggle: 'active',           // Toggle a class
    replace: ['old', 'new']     // Replace one class with another
  }
});
```

Or replace all classes at once:

```javascript
Elements.classes({
  elementId: 'completely new class-list'
});
```

---

### Real Example: Form Validation States

Let's show validation feedback with classes:

**HTML:**
```html
<form>
  <div class="form-group">
    <input type="email" id="emailInput" class="input">
    <span id="emailIcon" class="icon">○</span>
  </div>
  <div class="form-group">
    <input type="password" id="passwordInput" class="input">
    <span id="passwordIcon" class="icon">○</span>
  </div>
  <button id="submitBtn" class="btn">Submit</button>
</form>
```

**CSS:**
```css
.input.valid { border-color: green; }
.input.invalid { border-color: red; }
.icon.valid::before { content: '✓'; color: green; }
.icon.invalid::before { content: '✗'; color: red; }
.btn.ready { background: green; }
.btn.not-ready { background: gray; }
```

**Reactive Code:**
```javascript
const form = state({
  email: '',
  password: '',
  emailValid: false,
  passwordValid: false
});

// Validate email
effect(() => {
  form.emailValid = form.email.includes('@') && form.email.includes('.');
});

// Validate password
effect(() => {
  form.passwordValid = form.password.length >= 8;
});

// Update email styling
effect(() => {
  const isValid = form.emailValid;
  const isEmpty = form.email === '';

  Elements.classes({
    emailInput: {
      remove: isEmpty ? ['valid', 'invalid'] : [],
      add: isEmpty ? [] : (isValid ? 'valid' : 'invalid')
    },
    emailIcon: {
      toggle: isEmpty ? [] : (isValid ? 'valid' : 'invalid')
    }
  });
});

// Update password styling
effect(() => {
  const isValid = form.passwordValid;
  const isEmpty = form.password === '';

  Elements.classes({
    passwordInput: {
      remove: isEmpty ? ['valid', 'invalid'] : [],
      add: isEmpty ? [] : (isValid ? 'valid' : 'invalid')
    }
  });
});

// Update submit button
effect(() => {
  const canSubmit = form.emailValid && form.passwordValid;

  Elements.classes({
    submitBtn: canSubmit ? 'btn ready' : 'btn not-ready'
  });

  Elements.submitBtn.disabled = !canSubmit;
});

// Connect inputs to state
Elements.emailInput.addEventListener('input', (e) => {
  form.email = e.target.value;
});

Elements.passwordInput.addEventListener('input', (e) => {
  form.password = e.target.value;
});
```

**What's happening:**
1. State tracks input values and validation status
2. Validation effects compute `emailValid` and `passwordValid`
3. Styling effects update classes based on validation
4. Submit button reflects overall form validity

All reactive, all automatic! 🎉

---

## Part 4: Bulk Dataset Updates

### Working with data-* Attributes

The `dataset()` enhancer updates `data-*` attributes:

```javascript
const item = state({
  id: 123,
  category: 'electronics',
  inStock: true
});

effect(() => {
  Elements.dataset({
    productCard: {
      id: item.id,
      category: item.category,
      available: item.inStock
    }
  });
});
```

**Result in HTML:**
```html
<div id="productCard"
     data-id="123"
     data-category="electronics"
     data-available="true">
```

---

### Real Example: Sortable List

Data attributes are great for storing state information:

**HTML:**
```html
<ul id="sortableList">
  <li id="item1" class="list-item">First Item</li>
  <li id="item2" class="list-item">Second Item</li>
  <li id="item3" class="list-item">Third Item</li>
</ul>
<p>Sorted by: <span id="sortMethod">position</span></p>
```

**Reactive Code:**
```javascript
const list = state({
  sortBy: 'position',
  items: [
    { id: 'item1', position: 1, priority: 'high' },
    { id: 'item2', position: 2, priority: 'low' },
    { id: 'item3', position: 3, priority: 'medium' }
  ]
});

effect(() => {
  // Update data attributes for each item
  list.items.forEach(item => {
    Elements.dataset({
      [item.id]: {
        position: item.position,
        priority: item.priority,
        sortValue: list.sortBy === 'position' ? item.position : item.priority
      }
    });
  });

  Elements.textContent({
    sortMethod: list.sortBy
  });
});
```

---

## Part 5: Attribute Updates

### Setting HTML Attributes

The `attrs()` enhancer handles standard HTML attributes:

```javascript
const link = state({
  url: 'https://example.com',
  isExternal: true,
  isDisabled: false
});

effect(() => {
  Elements.attrs({
    myLink: {
      href: link.url,
      target: link.isExternal ? '_blank' : '_self',
      rel: link.isExternal ? 'noopener noreferrer' : null,
      'aria-disabled': link.isDisabled
    }
  });
});
```

**Note:** Setting an attribute to `null` or `false` removes it!

---

### Real Example: Accessible Toggle Button

Let's build an accessible toggle:

**HTML:**
```html
<button id="menuToggle" aria-expanded="false" aria-controls="menu">
  Menu
</button>
<nav id="menu" hidden>
  <a href="#">Link 1</a>
  <a href="#">Link 2</a>
</nav>
```

**Reactive Code:**
```javascript
const menu = state({ isOpen: false });

effect(() => {
  Elements.attrs({
    menuToggle: {
      'aria-expanded': menu.isOpen,
      'aria-label': menu.isOpen ? 'Close menu' : 'Open menu'
    },
    menu: {
      hidden: !menu.isOpen ? '' : null  // '' adds attribute, null removes
    }
  });
});

Elements.menuToggle.addEventListener('click', () => {
  menu.isOpen = !menu.isOpen;
});
```

---

## Part 6: Collection Index Updates

### Targeting Specific Items by Index

When working with Collections, you can update specific items by their index:

```javascript
// Update item at index 0
Collections.ClassName.card.textContent({
  0: 'First card content'
});

// Update multiple items by index
Collections.ClassName.card.style({
  0: { backgroundColor: 'red' },
  1: { backgroundColor: 'blue' },
  2: { backgroundColor: 'green' }
});
```

---

### Real Example: Highlight Active Step

Let's build a step indicator:

**HTML:**
```html
<div class="steps">
  <div class="step">Step 1</div>
  <div class="step">Step 2</div>
  <div class="step">Step 3</div>
  <div class="step">Step 4</div>
</div>
<button id="prevBtn">Previous</button>
<button id="nextBtn">Next</button>
```

**Reactive Code:**
```javascript
const wizard = state({ currentStep: 0 });

effect(() => {
  const current = wizard.currentStep;

  // Update all steps based on their index
  Collections.ClassName.step.forEach((step, index) => {
    // Determine step state
    const isCompleted = index < current;
    const isCurrent = index === current;
    const isUpcoming = index > current;

    // Apply appropriate classes
    step.className = 'step';
    if (isCompleted) step.classList.add('completed');
    if (isCurrent) step.classList.add('current');
    if (isUpcoming) step.classList.add('upcoming');
  });

  // Update button states
  Elements.prevBtn.disabled = current === 0;
  Elements.nextBtn.disabled = current === 3;
});

// Navigation
Elements.prevBtn.addEventListener('click', () => {
  if (wizard.currentStep > 0) wizard.currentStep--;
});

Elements.nextBtn.addEventListener('click', () => {
  if (wizard.currentStep < 3) wizard.currentStep++;
});
```

---

## Part 7: Chaining Methods

### Fluent API

Many enhancer methods return `this`, allowing you to chain them:

```javascript
effect(() => {
  Elements
    .textContent({
      title: app.title,
      subtitle: app.subtitle
    })
    .style({
      container: { opacity: app.visible ? '1' : '0' }
    })
    .classes({
      wrapper: { toggle: 'active' }
    });
});
```

**Why chain?**
- ✅ Groups related updates together
- ✅ Single statement for multiple operations
- ✅ Clear flow of updates

---

## Combining Everything: Complete Example

Let's build a **product card** with all the enhancers:

**HTML:**
```html
<div id="productCard" class="card">
  <img id="productImage" src="" alt="">
  <h2 id="productName"></h2>
  <p id="productPrice"></p>
  <span id="stockBadge"></span>
  <button id="buyButton">Add to Cart</button>
</div>
```

**Reactive Code:**
```javascript
const product = state({
  name: 'Wireless Headphones',
  price: 99.99,
  image: 'headphones.jpg',
  inStock: true,
  quantity: 15
});

// Main display effect
effect(() => {
  // Update text content
  Elements.textContent({
    productName: product.name,
    productPrice: `$${product.price.toFixed(2)}`,
    stockBadge: product.inStock
      ? `${product.quantity} in stock`
      : 'Out of stock'
  });

  // Update image
  Elements.attrs({
    productImage: {
      src: product.image,
      alt: product.name
    }
  });

  // Update classes for visual state
  Elements.classes({
    stockBadge: product.inStock ? 'badge badge-success' : 'badge badge-danger',
    buyButton: product.inStock ? 'btn btn-primary' : 'btn btn-disabled'
  });

  // Update button state
  Elements.attrs({
    buyButton: {
      disabled: !product.inStock ? '' : null
    }
  });

  // Update data attributes for tracking
  Elements.dataset({
    productCard: {
      productId: 'WH-001',
      category: 'audio',
      available: product.inStock
    }
  });
});

// Style effect for animations
effect(() => {
  Elements.style({
    stockBadge: {
      transform: product.quantity < 5 ? 'scale(1.1)' : 'scale(1)',
      transition: 'transform 0.2s'
    }
  });
});

// Buy button handler
Elements.buyButton.addEventListener('click', () => {
  if (product.inStock && product.quantity > 0) {
    product.quantity--;

    if (product.quantity === 0) {
      product.inStock = false;
    }
  }
});
```

**What we used:**
- `textContent()` for text displays
- `attrs()` for image and button attributes
- `classes()` for visual states
- `style()` for animations
- `dataset()` for tracking data

All working together, all reactive! ✨

---

## Quick Reference Card

```javascript
// TEXT UPDATES
Elements.textContent({ id: 'text' })
Elements.innerHTML({ id: '<b>html</b>' })
Elements.value({ inputId: 'value' })

// STYLE UPDATES
Elements.style({
  id: { property: 'value' }
})

// CLASS UPDATES
Elements.classes({
  id: {
    add: 'class',
    remove: 'class',
    toggle: 'class',
    replace: ['old', 'new']
  }
})

// ATTRIBUTE UPDATES
Elements.attrs({
  id: {
    attribute: 'value',
    boolAttr: true/false/null
  }
})

// DATASET UPDATES
Elements.dataset({
  id: { key: 'value' }
})

// COLLECTION INDEX UPDATES
Collections.ClassName.name.textContent({
  0: 'first',
  1: 'second'
})
```

---

## Best Practices

### 📌 Group Related Updates

```javascript
// ✅ Good: Related updates together
effect(() => {
  Elements.textContent({
    userName: user.name,
    userEmail: user.email,
    userRole: user.role
  });
});

// ⚠️ Less ideal: Scattered updates
effect(() => {
  Elements.textContent({ userName: user.name });
});
effect(() => {
  Elements.textContent({ userEmail: user.email });
});
```

### 📌 Use Appropriate Method for the Task

```javascript
// ✅ Use classes() for class operations
Elements.classes({
  button: { toggle: 'active' }
});

// ❌ Don't use attrs() for classes
Elements.attrs({
  button: { class: 'active' }  // Replaces ALL classes!
});
```

### 📌 Keep Effects Focused

```javascript
// ✅ Separate concerns
effect(() => {
  // Visual updates
  Elements.style({ card: { opacity: visible ? 1 : 0 } });
});

effect(() => {
  // Accessibility updates
  Elements.attrs({ card: { 'aria-hidden': !visible } });
});
```

---

## What You've Learned 🎓

| Enhancer | Purpose |
|----------|---------|
| `textContent()` | Update text on multiple elements |
| `style()` | Update CSS styles |
| `classes()` | Add, remove, toggle classes |
| `attrs()` | Set HTML attributes |
| `dataset()` | Set data-* attributes |
| Index updates | Target collection items by index |
| Chaining | Combine multiple operations |

---

## Practice Challenge 🚀

Build a **notification system** with these features:

1. State tracks: type (success/error/info), message, visible
2. When visible, show the notification with appropriate styling
3. Use `classes()` for type-based colors
4. Use `style()` for slide-in animation
5. Use `textContent()` for the message
6. Auto-hide after 3 seconds

Give it a try with what you've learned!

---

## Next Steps

You're becoming a DOM Helpers expert! Continue to:

- [Reactive with Conditions](reactive-with-conditions.md) — Show/hide and conditional rendering
- [Building a Todo App](building-a-todo-app.md) — Complete hands-on project

Keep going! 💪
