# Reactive with Conditions: Smart Show/Hide & Conditional Rendering

## What You'll Learn 🎯

In this tutorial, you'll master **conditional rendering** — making elements appear, disappear, and change based on your reactive state:

- **Show/Hide Elements** — Display content based on conditions
- **Condition Matching** — True, false, ranges, patterns, and more
- **State-Based Rendering** — Different content for different states
- **Combining with DOM Helpers** — Powerful, reactive UIs

This is where your apps start to feel truly dynamic!

---

## Prerequisites

Make sure you're comfortable with:
- Creating state with `state()`
- Using effects with `effect()`
- Basic DOM Helpers (Elements, Collections)

New here? Start with [Getting Started](getting-started.md)!

---

## What is Conditional Rendering?

**Conditional rendering** means showing or hiding parts of your UI based on data. Think of it like:

- Show the "Login" button when user is **logged out**
- Show the "Welcome, Alice!" message when user is **logged in**
- Show "No items" when cart is **empty**
- Show item list when cart **has items**

Without conditions, your page would show everything at once — chaos! 🙈

---

## Part 1: Basic Show/Hide with Reactive State

### The Simple Approach

The most basic way to conditionally show/hide is with CSS:

```javascript
const modal = state({ isOpen: false });

effect(() => {
  // Show when isOpen is true, hide when false
  Elements.modalDialog.style.display = modal.isOpen ? 'flex' : 'none';
});

// Toggle the modal
Elements.openModalBtn.addEventListener('click', () => {
  modal.isOpen = true;
});

Elements.closeModalBtn.addEventListener('click', () => {
  modal.isOpen = false;
});
```

**What's happening:**
1. State tracks whether modal is open
2. Effect updates the display style when state changes
3. Buttons simply toggle the state

**The key insight:** You never manually show/hide. You just change the data!

---

### Multiple Conditional Elements

Let's handle logged-in vs logged-out views:

**HTML:**
```html
<nav>
  <div id="guestMenu">
    <button id="loginBtn">Log In</button>
    <button id="signupBtn">Sign Up</button>
  </div>
  <div id="userMenu">
    <span id="welcomeMsg">Welcome!</span>
    <button id="logoutBtn">Log Out</button>
  </div>
</nav>
```

**Reactive Code:**
```javascript
const auth = state({
  isLoggedIn: false,
  userName: ''
});

effect(() => {
  // Toggle visibility based on login state
  Elements.guestMenu.style.display = auth.isLoggedIn ? 'none' : 'flex';
  Elements.userMenu.style.display = auth.isLoggedIn ? 'flex' : 'none';
});

effect(() => {
  // Update welcome message when logged in
  if (auth.isLoggedIn) {
    Elements.welcomeMsg.textContent = `Welcome, ${auth.userName}!`;
  }
});

// Login handler
Elements.loginBtn.addEventListener('click', () => {
  // Simulate login
  auth.userName = 'Alice';
  auth.isLoggedIn = true;
});

// Logout handler
Elements.logoutBtn.addEventListener('click', () => {
  auth.userName = '';
  auth.isLoggedIn = false;
});
```

**The flow:**
```
auth.isLoggedIn = false
        ↓
guestMenu: display = 'flex'  ✓ visible
userMenu:  display = 'none'  ✗ hidden

───── User clicks Login ─────

auth.isLoggedIn = true
        ↓
guestMenu: display = 'none'  ✗ hidden
userMenu:  display = 'flex'  ✓ visible
```

---

## Part 2: The Conditions System

### Introducing `whenState()`

DOM Helpers provides a powerful `Conditions.whenState()` method for declarative conditional rendering:

```javascript
Conditions.whenState(stateObject, 'propertyName', {
  'condition': {
    // What to do when condition matches
    style: { display: 'block' }
  },
  'anotherCondition': {
    // What to do for this condition
    style: { display: 'none' }
  }
});
```

Let's see it in action!

---

### Basic whenState Example

```javascript
const status = state({ value: 'loading' });

Conditions.whenState(status, 'value', {
  'loading': {
    '#loadingSpinner': {
      style: { display: 'block' }
    },
    '#content': {
      style: { display: 'none' }
    }
  },
  'ready': {
    '#loadingSpinner': {
      style: { display: 'none' }
    },
    '#content': {
      style: { display: 'block' }
    }
  },
  'error': {
    '#loadingSpinner': {
      style: { display: 'none' }
    },
    '#content': {
      style: { display: 'none' }
    },
    '#errorMessage': {
      style: { display: 'block' }
    }
  }
});

// Change state and UI updates automatically
status.value = 'ready'; // ✨ Content shows, spinner hides
status.value = 'error'; // ✨ Error message shows
```

**The beauty:** One declaration handles all states!

---

## Part 3: Condition Matchers

The Conditions system understands many types of conditions:

### Boolean Conditions

```javascript
Conditions.whenState(user, 'isActive', {
  'true': {
    '#status': { textContent: 'Active', style: { color: 'green' } }
  },
  'false': {
    '#status': { textContent: 'Inactive', style: { color: 'gray' } }
  }
});
```

### Truthy/Falsy

```javascript
Conditions.whenState(cart, 'items', {
  'truthy': {
    // When items array has values
    '#cartBadge': { style: { display: 'flex' } }
  },
  'falsy': {
    // When items is empty/null/undefined
    '#cartBadge': { style: { display: 'none' } }
  }
});
```

### Empty Check

```javascript
Conditions.whenState(search, 'query', {
  'empty': {
    '#searchResults': { style: { display: 'none' } },
    '#searchPlaceholder': { style: { display: 'block' } }
  }
});
```

### Exact String Match

```javascript
Conditions.whenState(theme, 'mode', {
  'light': {
    'body': { classList: { add: 'theme-light' } }
  },
  'dark': {
    'body': { classList: { add: 'theme-dark' } }
  },
  'system': {
    'body': { classList: { add: 'theme-system' } }
  }
});
```

### Numeric Comparisons

```javascript
Conditions.whenState(battery, 'level', {
  '>=80': {
    '#batteryIcon': { textContent: '🔋', style: { color: 'green' } }
  },
  '>=40': {
    '#batteryIcon': { textContent: '🔋', style: { color: 'orange' } }
  },
  '<40': {
    '#batteryIcon': { textContent: '🪫', style: { color: 'red' } }
  }
});
```

### Numeric Ranges

```javascript
Conditions.whenState(score, 'value', {
  '0-49': {
    '#grade': { textContent: 'F', style: { color: 'red' } }
  },
  '50-69': {
    '#grade': { textContent: 'C', style: { color: 'orange' } }
  },
  '70-89': {
    '#grade': { textContent: 'B', style: { color: 'blue' } }
  },
  '90-100': {
    '#grade': { textContent: 'A', style: { color: 'green' } }
  }
});
```

### String Pattern Matching

```javascript
Conditions.whenState(file, 'name', {
  'endsWith:.pdf': {
    '#icon': { textContent: '📄' }
  },
  'endsWith:.jpg': {
    '#icon': { textContent: '🖼️' }
  },
  'endsWith:.mp3': {
    '#icon': { textContent: '🎵' }
  },
  'includes:backup': {
    '#badge': { textContent: 'Backup', style: { display: 'inline' } }
  }
});
```

---

## Part 4: Combining Reactive + Conditions

### The Power Combo

Here's where it gets magical — using reactive state with the Conditions system:

```javascript
const app = state({
  page: 'home',
  user: null,
  notifications: 0
});

// Page-based content
Conditions.whenState(app, 'page', {
  'home': {
    '#homePage': { style: { display: 'block' } },
    '#aboutPage': { style: { display: 'none' } },
    '#contactPage': { style: { display: 'none' } }
  },
  'about': {
    '#homePage': { style: { display: 'none' } },
    '#aboutPage': { style: { display: 'block' } },
    '#contactPage': { style: { display: 'none' } }
  },
  'contact': {
    '#homePage': { style: { display: 'none' } },
    '#aboutPage': { style: { display: 'none' } },
    '#contactPage': { style: { display: 'block' } }
  }
});

// Notification badge
Conditions.whenState(app, 'notifications', {
  '0': {
    '#notifBadge': { style: { display: 'none' } }
  },
  '>0': {
    '#notifBadge': {
      style: { display: 'flex' },
      textContent: app.notifications
    }
  }
});

// Navigate by just changing state
Elements.homeLink.addEventListener('click', () => {
  app.page = 'home';
});

Elements.aboutLink.addEventListener('click', () => {
  app.page = 'about';
});
```

---

## Part 5: Practical Patterns

### Pattern 1: Loading States

A common pattern for async operations:

```javascript
const dataLoader = state({
  status: 'idle', // idle, loading, success, error
  data: null,
  error: null
});

Conditions.whenState(dataLoader, 'status', {
  'idle': {
    '#loader': { style: { display: 'none' } },
    '#content': { style: { display: 'none' } },
    '#error': { style: { display: 'none' } },
    '#placeholder': { style: { display: 'block' } }
  },
  'loading': {
    '#loader': { style: { display: 'flex' } },
    '#content': { style: { display: 'none' } },
    '#error': { style: { display: 'none' } },
    '#placeholder': { style: { display: 'none' } }
  },
  'success': {
    '#loader': { style: { display: 'none' } },
    '#content': { style: { display: 'block' } },
    '#error': { style: { display: 'none' } },
    '#placeholder': { style: { display: 'none' } }
  },
  'error': {
    '#loader': { style: { display: 'none' } },
    '#content': { style: { display: 'none' } },
    '#error': { style: { display: 'block' } },
    '#placeholder': { style: { display: 'none' } }
  }
});

// Fetch data
async function loadData() {
  dataLoader.status = 'loading';

  try {
    const response = await fetch('/api/data');
    dataLoader.data = await response.json();
    dataLoader.status = 'success';
  } catch (err) {
    dataLoader.error = err.message;
    dataLoader.status = 'error';
  }
}
```

---

### Pattern 2: Form Validation Feedback

```javascript
const form = state({
  email: '',
  emailStatus: 'empty' // empty, valid, invalid
});

// Validate on change
effect(() => {
  if (form.email === '') {
    form.emailStatus = 'empty';
  } else if (form.email.includes('@') && form.email.includes('.')) {
    form.emailStatus = 'valid';
  } else {
    form.emailStatus = 'invalid';
  }
});

// Visual feedback
Conditions.whenState(form, 'emailStatus', {
  'empty': {
    '#emailInput': {
      classList: { remove: ['valid', 'invalid'] }
    },
    '#emailFeedback': {
      style: { display: 'none' }
    }
  },
  'valid': {
    '#emailInput': {
      classList: { add: 'valid', remove: 'invalid' }
    },
    '#emailFeedback': {
      style: { display: 'block', color: 'green' },
      textContent: '✓ Valid email'
    }
  },
  'invalid': {
    '#emailInput': {
      classList: { add: 'invalid', remove: 'valid' }
    },
    '#emailFeedback': {
      style: { display: 'block', color: 'red' },
      textContent: '✗ Please enter a valid email'
    }
  }
});
```

---

### Pattern 3: Multi-Step Wizard

```javascript
const wizard = state({
  step: 1,
  maxSteps: 4
});

// Show correct step content
Conditions.whenState(wizard, 'step', {
  '1': {
    '#step1': { style: { display: 'block' } },
    '#step2': { style: { display: 'none' } },
    '#step3': { style: { display: 'none' } },
    '#step4': { style: { display: 'none' } }
  },
  '2': {
    '#step1': { style: { display: 'none' } },
    '#step2': { style: { display: 'block' } },
    '#step3': { style: { display: 'none' } },
    '#step4': { style: { display: 'none' } }
  },
  '3': {
    '#step1': { style: { display: 'none' } },
    '#step2': { style: { display: 'none' } },
    '#step3': { style: { display: 'block' } },
    '#step4': { style: { display: 'none' } }
  },
  '4': {
    '#step1': { style: { display: 'none' } },
    '#step2': { style: { display: 'none' } },
    '#step3': { style: { display: 'none' } },
    '#step4': { style: { display: 'block' } }
  }
});

// Update navigation buttons
effect(() => {
  Elements.prevBtn.disabled = wizard.step === 1;
  Elements.nextBtn.disabled = wizard.step === wizard.maxSteps;

  Elements.nextBtn.textContent =
    wizard.step === wizard.maxSteps ? 'Finish' : 'Next';
});

// Progress indicator
effect(() => {
  const progress = (wizard.step / wizard.maxSteps) * 100;
  Elements.progressBar.style.width = `${progress}%`;
  Elements.stepIndicator.textContent = `Step ${wizard.step} of ${wizard.maxSteps}`;
});

// Navigation
Elements.prevBtn.addEventListener('click', () => {
  if (wizard.step > 1) wizard.step--;
});

Elements.nextBtn.addEventListener('click', () => {
  if (wizard.step < wizard.maxSteps) wizard.step++;
});
```

---

### Pattern 4: Accordion/Collapsible

```javascript
const accordion = state({
  openSection: null // null means all closed
});

// Toggle sections
function toggleSection(sectionId) {
  if (accordion.openSection === sectionId) {
    accordion.openSection = null; // Close if already open
  } else {
    accordion.openSection = sectionId; // Open this one
  }
}

// Update visibility
effect(() => {
  // Get all accordion sections
  Collections.ClassName.accordionContent.forEach((content, index) => {
    const sectionId = `section${index + 1}`;
    const isOpen = accordion.openSection === sectionId;

    content.style.display = isOpen ? 'block' : 'none';
    content.style.maxHeight = isOpen ? '500px' : '0';
  });

  // Update toggle icons
  Collections.ClassName.accordionToggle.forEach((toggle, index) => {
    const sectionId = `section${index + 1}`;
    const isOpen = accordion.openSection === sectionId;

    toggle.textContent = isOpen ? '−' : '+';
    toggle.parentElement.classList.toggle('active', isOpen);
  });
});

// Attach click handlers
Collections.ClassName.accordionHeader.forEach((header, index) => {
  header.addEventListener('click', () => {
    toggleSection(`section${index + 1}`);
  });
});
```

---

### Pattern 5: Tab Interface

```javascript
const tabs = state({ activeTab: 'overview' });

// Tab content visibility
Conditions.whenState(tabs, 'activeTab', {
  'overview': {
    '#overviewTab': { classList: { add: 'active' } },
    '#featuresTab': { classList: { remove: 'active' } },
    '#pricingTab': { classList: { remove: 'active' } },
    '#overviewPanel': { style: { display: 'block' } },
    '#featuresPanel': { style: { display: 'none' } },
    '#pricingPanel': { style: { display: 'none' } }
  },
  'features': {
    '#overviewTab': { classList: { remove: 'active' } },
    '#featuresTab': { classList: { add: 'active' } },
    '#pricingTab': { classList: { remove: 'active' } },
    '#overviewPanel': { style: { display: 'none' } },
    '#featuresPanel': { style: { display: 'block' } },
    '#pricingPanel': { style: { display: 'none' } }
  },
  'pricing': {
    '#overviewTab': { classList: { remove: 'active' } },
    '#featuresTab': { classList: { remove: 'active' } },
    '#pricingTab': { classList: { add: 'active' } },
    '#overviewPanel': { style: { display: 'none' } },
    '#featuresPanel': { style: { display: 'none' } },
    '#pricingPanel': { style: { display: 'block' } }
  }
});

// Tab click handlers
Elements.overviewTab.addEventListener('click', () => tabs.activeTab = 'overview');
Elements.featuresTab.addEventListener('click', () => tabs.activeTab = 'features');
Elements.pricingTab.addEventListener('click', () => tabs.activeTab = 'pricing');
```

---

## Part 6: Combining Effects with Conditions

### When to Use Each

| Use This | When You Need |
|----------|---------------|
| `effect()` alone | Simple show/hide based on boolean |
| `Conditions.whenState()` | Multiple states with different UI |
| Both together | Complex logic + declarative conditions |

### Combined Example

```javascript
const player = state({
  status: 'stopped', // stopped, playing, paused
  volume: 50,
  currentTrack: null
});

// Use Conditions for status-based UI
Conditions.whenState(player, 'status', {
  'stopped': {
    '#playBtn': { style: { display: 'inline-flex' } },
    '#pauseBtn': { style: { display: 'none' } },
    '#stopBtn': { style: { display: 'none' } },
    '#progress': { style: { display: 'none' } }
  },
  'playing': {
    '#playBtn': { style: { display: 'none' } },
    '#pauseBtn': { style: { display: 'inline-flex' } },
    '#stopBtn': { style: { display: 'inline-flex' } },
    '#progress': { style: { display: 'block' } }
  },
  'paused': {
    '#playBtn': { style: { display: 'inline-flex' } },
    '#pauseBtn': { style: { display: 'none' } },
    '#stopBtn': { style: { display: 'inline-flex' } },
    '#progress': { style: { display: 'block' } }
  }
});

// Use effect for volume (continuous value)
effect(() => {
  Elements.volumeSlider.value = player.volume;
  Elements.volumeDisplay.textContent = `${player.volume}%`;

  // Mute icon based on volume
  if (player.volume === 0) {
    Elements.volumeIcon.textContent = '🔇';
  } else if (player.volume < 50) {
    Elements.volumeIcon.textContent = '🔉';
  } else {
    Elements.volumeIcon.textContent = '🔊';
  }
});

// Use effect for track info
effect(() => {
  if (player.currentTrack) {
    Elements.trackTitle.textContent = player.currentTrack.title;
    Elements.trackArtist.textContent = player.currentTrack.artist;
    Elements.trackCover.src = player.currentTrack.cover;
  }
});
```

---

## Quick Reference Card

### Condition Types

```javascript
// Boolean
'true'           // value === true
'false'          // value === false
'truthy'         // !!value
'falsy'          // !value

// Empty/Null
'null'           // value === null
'undefined'      // value === undefined
'empty'          // empty string, array, or object

// Exact Match
'myValue'        // String equality
'"quoted"'       // Exact string with quotes

// Numeric
'42'             // Exact number
'>10'            // Greater than
'>=10'           // Greater than or equal
'<10'            // Less than
'<=10'           // Less than or equal
'10-20'          // Range (inclusive)

// String Patterns
'includes:text'    // Contains substring
'startsWith:pre'   // Starts with prefix
'endsWith:suf'     // Ends with suffix
```

### Property Updates

```javascript
{
  '#selector': {
    textContent: 'Text',
    innerHTML: '<b>HTML</b>',
    style: { property: 'value' },
    classList: { add: 'class', remove: 'other' },
    dataset: { key: 'value' },
    attrs: { attribute: 'value' }
  }
}
```

---

## Best Practices

### 📌 Use Meaningful State Values

```javascript
// ✅ Good: Clear, descriptive states
const page = state({ status: 'loading' }); // loading, ready, error

// ❌ Bad: Cryptic values
const page = state({ status: 1 }); // What does 1 mean?
```

### 📌 Group Related Conditions

```javascript
// ✅ Good: All states in one whenState
Conditions.whenState(app, 'mode', {
  'light': { /* ... */ },
  'dark': { /* ... */ },
  'system': { /* ... */ }
});

// ❌ Less ideal: Separate for each
if (app.mode === 'light') { /* ... */ }
if (app.mode === 'dark') { /* ... */ }
```

### 📌 Keep UI State in State

```javascript
// ✅ Good: UI state in reactive state
const modal = state({ isOpen: false });

// ❌ Bad: UI state scattered
let isModalOpen = false; // Not reactive!
```

---

## What You've Learned 🎓

| Concept | What It Does |
|---------|--------------|
| Show/Hide with effects | Basic conditional display |
| `Conditions.whenState()` | Declarative multi-state rendering |
| Condition matchers | Boolean, numeric, string patterns |
| Combined patterns | Effects + Conditions together |

---

## Practice Challenge 🚀

Build a **notification center** with:

1. State tracks: notifications array, filter (all/unread/read)
2. Show "No notifications" when empty
3. Show notification count badge when > 0
4. Filter tabs switch between all/unread/read
5. Mark as read changes the styling

Use conditions for filter states and effects for dynamic content!

---

## Next Steps

You're almost there! Let's put everything together:

- [Building a Todo App](building-a-todo-app.md) — Complete hands-on project

You've got this! 🚀
