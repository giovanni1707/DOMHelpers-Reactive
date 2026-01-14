# form.handleBlur()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

// Bind blur events - marks field as touched
emailInput.addEventListener('blur', form.handleBlur);
passwordInput.addEventListener('blur', form.handleBlur);

// Show errors only after user leaves field (touched)
effect(() => {
  if (form.shouldShowError('email')) {
    emailError.textContent = form.getError('email');
  }
});
```

**What just happened?** `handleBlur()` marks fields as touched when users leave them, enabling smart error display!

 

## What is form.handleBlur()?

`form.handleBlur()` is an **event handler that marks form fields as touched** when users leave (blur) an input.

Simply put, it tracks which fields the user has interacted with, enabling better UX by showing errors only after user interaction.

**Key characteristics:**
- ✅ Reads field name from `event.target.name`
- ✅ Marks field as touched (`touched[field] = true`)
- ✅ Triggers validation for the field
- ✅ Enables `shouldShowError()` logic
- ✅ Improves UX - errors appear at the right time
- ✅ Works with all focusable elements

 

## Syntax

```javascript
// Bind to input element
inputElement.addEventListener('blur', form.handleBlur);

// Or inline in HTML
<input name="email" onblur="form.handleBlur(event)" />

// Works with any focusable element
textInput.addEventListener('blur', form.handleBlur);
selectInput.addEventListener('blur', form.handleBlur);
textareaInput.addEventListener('blur', form.handleBlur);
```

**Parameters:**
- `event` (Event) - DOM blur event object with `target.name`

**Returns:** `void` - Updates touched state

**Requirements:**
- Input must have a `name` attribute matching a field in form
- Event must have `target.name` property

 

## Why Does This Exist?

### The Challenge: When to Show Errors?

Without touched state tracking, you have two bad choices:

**Option 1: Show errors immediately**
```javascript
const form = Forms.create(
  { email: '' },
  { email: (value) => !value ? 'Email required' : '' }
);

// ❌ Shows error before user even starts typing
effect(() => {
  if (form.hasErrors) {
    errorDiv.textContent = form.getError('email');
    // "Email required" appears immediately - bad UX!
  }
});
```

**Option 2: Show errors only on submit**
```javascript
// ❌ User doesn't see errors until they submit
submitButton.addEventListener('click', () => {
  form.validate();
  form.touchAll();

  // User filled out 10 fields wrong, only finds out at the end!
});
```

### The Solution: Touch Tracking with handleBlur()

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

// ✅ Mark as touched when user leaves field
emailInput.addEventListener('blur', form.handleBlur);
passwordInput.addEventListener('blur', form.handleBlur);

// ✅ Show error only after field is touched
effect(() => {
  if (form.shouldShowError('email')) {
    emailError.textContent = form.getError('email');
    // Only shows after user leaves the field!
  }
});
```

**Benefits:**
✅ **Better UX** - Errors appear at the right moment
✅ **No premature errors** - User can start typing freely
✅ **Immediate feedback** - Errors show when leaving field
✅ **Progressive disclosure** - Errors appear one field at a time
✅ **Professional feel** - Matches user expectations

 

## Mental Model

Think of `handleBlur()` as a **field interaction tracker** - it remembers which fields the user has visited.

### Visual Flow

```
User focuses on email field
         ↓
User types: "user@"
         ↓
User clicks outside (blur event fires)
         ↓
   handleBlur(event)
         ↓
1. Read event.target.name → 'email'
         ↓
2. Set touched.email = true
         ↓
3. Validate field
         ↓
4. shouldShowError('email') → true
         ↓
Error displays in UI
```

### Real-World Analogy

**Without Touch Tracking** (Annoying Teacher):
```
Teacher yells at student before they even pick up the pencil
"Wrong! Wrong! You haven't started and it's already wrong!"

Result: Student feels discouraged
```

**With handleBlur** (Patient Teacher):
```
Student picks up pencil, writes answer, puts pencil down
Teacher looks at the answer and provides feedback
"This part needs work, here's how to fix it"

Result: Student learns from feedback
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
inputElement.addEventListener('blur', form.handleBlur);

// And user leaves the field, here's what happens:
function handleBlur(event) {
  1️⃣ Extract field name from event
     const fieldName = event.target.name; // 'email'

  2️⃣ Mark field as touched
     form.setTouched(fieldName, true);
     // Sets touched.email = true

  3️⃣ Validate the field
     form.validateField(fieldName);
     // Runs validator, updates errors

  4️⃣ Reactivity triggers
     - form.touched.email updates
     - form.errors.email updates
     - form.touchedFields updates
     - shouldShowError() can now return true
     - UI updates automatically
}
```

### Reactivity Flow Diagram

```
handleBlur(event)
         ↓
Extract field name
         ↓
form.setTouched(field, true)
         ↓
┌────────────────────────┐
│  Reactive Updates      │
│  - touched[field]=true │
│  - touchedFields array │
└────────────────────────┘
         ↓
form.validateField(field)
         ↓
┌────────────────────────┐
│  Validation Updates    │
│  - errors[field]       │
│  - isValid             │
│  - hasErrors           │
└────────────────────────┘
         ↓
shouldShowError() returns true
         ↓
UI shows error message
```

 

## Basic Usage

### Example 1: Simple Error Display

```javascript
const form = Forms.create(
  {
    email: '',
    username: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    username: (value) => value.length < 3 ? 'Too short' : ''
  }
);

// Bind change and blur
emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', form.handleBlur);

usernameInput.addEventListener('input', form.handleChange);
usernameInput.addEventListener('blur', form.handleBlur);

// Show errors after blur
effect(() => {
  emailError.textContent = form.shouldShowError('email')
    ? form.getError('email')
    : '';
});

effect(() => {
  usernameError.textContent = form.shouldShowError('username')
    ? form.getError('username')
    : '';
});
```

 

### Example 2: Visual Feedback on Blur

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  // Add visual indicator
  if (form.shouldShowError('email')) {
    emailInput.classList.add('error');
  } else if (form.values.email) {
    emailInput.classList.add('success');
  }
});

passwordInput.addEventListener('input', form.handleChange);
passwordInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  if (form.shouldShowError('password')) {
    passwordInput.classList.add('error');
  } else if (form.values.password) {
    passwordInput.classList.add('success');
  }
});
```

 

### Example 3: Progressive Validation

```javascript
const form = Forms.create(
  {
    step1: '',
    step2: '',
    step3: ''
  },
  {
    step1: (value) => !value ? 'Required' : '',
    step2: (value) => !value ? 'Required' : '',
    step3: (value) => !value ? 'Required' : ''
  }
);

// User sees validation errors one field at a time
step1Input.addEventListener('blur', form.handleBlur);
step2Input.addEventListener('blur', form.handleBlur);
step3Input.addEventListener('blur', form.handleBlur);

// Display touched fields count
effect(() => {
  progressText.textContent =
    `${form.touchedFields.length} / 3 fields completed`;
});
```

 

### Example 4: Conditional Next Button

```javascript
const form = Forms.create(
  {
    email: '',
    phone: ''
  },
  {
    email: (value) => !value.includes('@') ? 'Invalid email' : '',
    phone: (value) => !/^\d{10}$/.test(value) ? 'Invalid phone' : ''
  }
);

emailInput.addEventListener('blur', form.handleBlur);
phoneInput.addEventListener('blur', form.handleBlur);

// Enable next button only when both fields touched and valid
effect(() => {
  const bothTouched = form.isTouched('email') && form.isTouched('phone');
  const bothValid = !form.hasError('email') && !form.hasError('phone');

  nextButton.disabled = !(bothTouched && bothValid);
});
```

 

### Example 5: Focus Trap for Errors

```javascript
const form = Forms.create(
  { email: '' },
  { email: (value) => !value.includes('@') ? 'Invalid email' : '' }
);

emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  // Prevent leaving field if invalid
  if (form.shouldShowError('email')) {
    const shouldStay = confirm(
      'Email is invalid. Fix it now?'
    );

    if (shouldStay) {
      setTimeout(() => emailInput.focus(), 10);
    }
  }
});
```

 

## Advanced Patterns

### Pattern 1: Delayed Validation on Blur

```javascript
const form = Forms.create(
  { username: '' },
  {
    username: async (value) => {
      // Check if username exists (expensive)
      const response = await fetch(`/api/check-username?u=${value}`);
      const { available } = await response.json();
      return available ? '' : 'Username taken';
    }
  }
);

usernameInput.addEventListener('blur', async (e) => {
  form.handleBlur(e);

  if (form.isTouched('username')) {
    usernameLoading.style.display = 'block';
    await form.validateField('username');
    usernameLoading.style.display = 'none';
  }
});
```

 

### Pattern 2: Cross-Field Validation on Blur

```javascript
const form = Forms.create(
  {
    password: '',
    confirmPassword: ''
  },
  {
    password: (value) => value.length < 8 ? 'Too short' : '',
    confirmPassword: (value, allValues) =>
      value !== allValues.password ? 'Passwords must match' : ''
  }
);

passwordInput.addEventListener('blur', form.handleBlur);

confirmPasswordInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  // Revalidate password if confirmPassword touched
  if (form.isTouched('password')) {
    form.validateField('password');
  }
});
```

 

### Pattern 3: Smart Refocus After Blur

```javascript
const form = Forms.create(
  {
    field1: '',
    field2: '',
    field3: ''
  },
  {
    field1: (value) => !value ? 'Required' : '',
    field2: (value) => !value ? 'Required' : '',
    field3: (value) => !value ? 'Required' : ''
  }
);

[field1Input, field2Input, field3Input].forEach((input, index, arr) => {
  input.addEventListener('blur', (e) => {
    form.handleBlur(e);

    // Auto-focus next field if current is valid
    const fieldName = input.name;
    if (!form.hasError(fieldName) && form.values[fieldName]) {
      const nextInput = arr[index + 1];
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 10);
      }
    }
  });
});
```

 

### Pattern 4: Blur with Analytics

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    email: (value) => !value.includes('@') ? 'Invalid' : '',
    password: (value) => value.length < 8 ? 'Too short' : ''
  }
);

function trackBlur(fieldName) {
  const hasError = form.hasError(fieldName);
  const hasValue = !!form.values[fieldName];

  analytics.track('field_blur', {
    field: fieldName,
    hasError,
    hasValue,
    errorCount: form.touchedFields.filter(f => form.hasError(f)).length
  });
}

emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e);
  trackBlur('email');
});

passwordInput.addEventListener('blur', (e) => {
  form.handleBlur(e);
  trackBlur('password');
});
```

 

### Pattern 5: Conditional Blur Behavior

```javascript
const form = Forms.create(
  { amount: 0 },
  { amount: (value) => value <= 0 ? 'Must be positive' : '' }
);

let userWarnedAboutAmount = false;

amountInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  const value = form.values.amount;

  // Warn about large amounts
  if (value > 10000 && !userWarnedAboutAmount) {
    const confirmed = confirm(
      `Are you sure you want to transfer $${value}?`
    );

    if (!confirmed) {
      amountInput.focus();
      form.setValue('amount', 0);
    }

    userWarnedAboutAmount = true;
  }
});
```

 

### Pattern 6: Blur with Tooltip

```javascript
const form = Forms.create(
  { email: '' },
  { email: (value) => !value.includes('@') ? 'Invalid email format' : '' }
);

emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  if (form.shouldShowError('email')) {
    showTooltip(emailInput, form.getError('email'), {
      type: 'error',
      position: 'bottom'
    });
  }
});

emailInput.addEventListener('focus', () => {
  hideTooltip(emailInput);
});
```

 

### Pattern 7: Touch All on First Blur

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

let firstBlurHandled = false;

formElement.addEventListener('blur', (e) => {
  if (!firstBlurHandled && e.target.matches('input')) {
    // On first blur, touch all fields to show comprehensive errors
    const touchAll = confirm(
      'Validate all fields now?'
    );

    if (touchAll) {
      form.touchAll();
      form.validate();
      firstBlurHandled = true;
    }
  }

  form.handleBlur(e);
}, true); // Use capture phase
```

 

### Pattern 8: Debounced Blur Validation

```javascript
const form = Forms.create(
  { search: '' },
  {
    search: async (value) => {
      // Expensive server-side validation
      const response = await fetch(`/api/validate-search?q=${value}`);
      const { valid, message } = await response.json();
      return valid ? '' : message;
    }
  }
);

let blurTimeout;

searchInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  // Debounce validation
  clearTimeout(blurTimeout);
  blurTimeout = setTimeout(() => {
    form.validateField('search');
  }, 500);
});

// Cancel debounce if user refocuses
searchInput.addEventListener('focus', () => {
  clearTimeout(blurTimeout);
});
```

 

### Pattern 9: Blur with Field History

```javascript
const form = Forms.create({ email: '' });
const fieldHistory = {};

emailInput.addEventListener('focus', (e) => {
  const fieldName = e.target.name;
  if (!fieldHistory[fieldName]) {
    fieldHistory[fieldName] = {
      focusCount: 0,
      blurCount: 0,
      values: []
    };
  }
  fieldHistory[fieldName].focusCount++;
});

emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e);

  const fieldName = e.target.name;
  const value = form.values[fieldName];

  fieldHistory[fieldName].blurCount++;
  fieldHistory[fieldName].values.push(value);

  // Track if user keeps changing mind
  if (fieldHistory[fieldName].values.length > 3) {
    console.log('User struggling with this field');
    showHelpTooltip(emailInput);
  }
});
```

 

### Pattern 10: Global Blur Handler

```javascript
const form = Forms.create({
  field1: '',
  field2: '',
  field3: ''
});

// Single blur handler for entire form
formElement.addEventListener('blur', (e) => {
  if (e.target.matches('input, select, textarea')) {
    form.handleBlur(e);

    // Global blur logic
    updateFormProgress();
    saveFormState();

    // Field-specific logic
    const fieldName = e.target.name;
    if (form.shouldShowError(fieldName)) {
      highlightError(e.target);
    } else {
      clearHighlight(e.target);
    }
  }
}, true); // Use capture phase

function updateFormProgress() {
  const totalFields = Object.keys(form.values).length;
  const touchedCount = form.touchedFields.length;
  const validTouchedCount = form.touchedFields.filter(
    field => !form.hasError(field)
  ).length;

  progressBar.style.width = `${(validTouchedCount / totalFields) * 100}%`;
}
```

 

## Common Pitfalls

### Pitfall 1: Missing name Attribute

```javascript
const form = Forms.create({ email: '' });

// ❌ Input without name attribute
<input type="email" />
emailInput.addEventListener('blur', form.handleBlur);
// Won't work - handleBlur doesn't know which field

// ✅ Include name attribute
<input name="email" type="email" />
emailInput.addEventListener('blur', form.handleBlur);
```

 

### Pitfall 2: Not Combining with handleChange

```javascript
const form = Forms.create({ email: '' });

// ❌ Only blur, no change handler
emailInput.addEventListener('blur', form.handleBlur);
// Field gets marked as touched but value never updates!

// ✅ Use both
emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', form.handleBlur);
```

 

### Pitfall 3: Showing Errors Without Checking Touched

```javascript
const form = Forms.create(
  { email: '' },
  { email: (value) => !value ? 'Required' : '' }
);

emailInput.addEventListener('blur', form.handleBlur);

// ❌ Always showing errors
effect(() => {
  if (form.hasError('email')) {
    emailError.textContent = form.getError('email');
    // Shows "Required" immediately - bad UX!
  }
});

// ✅ Check touched state
effect(() => {
  if (form.shouldShowError('email')) {
    emailError.textContent = form.getError('email');
    // Shows only after user leaves field
  }
});
```

 

### Pitfall 4: Using on Non-Focusable Elements

```javascript
const form = Forms.create({ selection: '' });

// ❌ Div can't receive focus/blur
<div name="selection" onblur="form.handleBlur(event)">Option</div>

// ✅ Use focusable elements
<select name="selection">
  <option>Option 1</option>
</select>
selectElement.addEventListener('blur', form.handleBlur);
```

 

### Pitfall 5: Race Conditions with Async Validation

```javascript
const form = Forms.create(
  { email: '' },
  {
    email: async (value) => {
      const response = await fetch(`/api/check-email?e=${value}`);
      return response.ok ? '' : 'Invalid';
    }
  }
);

// ❌ handleBlur triggers validation but doesn't wait
emailInput.addEventListener('blur', (e) => {
  form.handleBlur(e); // Starts async validation

  // This runs before validation completes!
  if (form.shouldShowError('email')) {
    console.log(form.getError('email')); // Might be stale
  }
});

// ✅ Wait for validation
emailInput.addEventListener('blur', async (e) => {
  form.handleBlur(e);
  await form.validateField('email'); // Wait for completion

  if (form.shouldShowError('email')) {
    console.log(form.getError('email')); // Current error
  }
});
```

 

## Summary

### Key Takeaways

1. **`handleBlur()` marks fields as touched** - tracks user interaction.

2. **Enables smart error display** - errors show after interaction, not before.

3. **Improves UX** - prevents premature error messages.

4. **Triggers field validation** - validates when user leaves field.

5. **Works with `shouldShowError()`** - perfect combination for error display.

6. **Combines with `handleChange()`** - blur for touch, change for value.

### When to Use handleBlur()

✅ **Use handleBlur() for:**
- Tracking field interaction
- Smart error display timing
- Progressive validation
- Better form UX
- Touch state management

❌ **Don't use handleBlur() when:**
- Not showing errors conditionally
- Touch tracking not needed
- Using custom touch logic

### Comparison: Without vs With handleBlur()

| Aspect | Without | With handleBlur() |
|  --|   |      -|
| **Error timing** | Immediate or on submit | After field interaction |
| **UX** | Premature errors | Progressive feedback |
| **Touch tracking** | Manual | Automatic |
| **shouldShowError()** | Always true if error | True only if touched |
| **User experience** | Frustrating | Professional |
| **Code** | Complex conditions | One-line binding |

### Typical Pattern

```javascript
// 1. Create form with validators
const form = Forms.create(
  { email: '' },
  { email: (value) => !value.includes('@') ? 'Invalid' : '' }
);

// 2. Bind both change and blur
emailInput.addEventListener('input', form.handleChange);
emailInput.addEventListener('blur', form.handleBlur);

// 3. Show errors conditionally
effect(() => {
  if (form.shouldShowError('email')) {
    emailError.textContent = form.getError('email');
  } else {
    emailError.textContent = '';
  }
});
```

### Related Methods

- **`handleChange(event)`** - Update field values on input
- **`setTouched(field, touched)`** - Manually set touched state
- **`isTouched(field)`** - Check if field is touched
- **`shouldShowError(field)`** - Check if error should display
- **`touchAll()`** - Mark all fields as touched

### One-Line Rule

> **`form.handleBlur(event)` marks a field as touched when the user leaves it, enabling smart error display that appears only after user interaction.**

 

**What's Next?**

- Learn `getFieldProps()` for complete field binding
- Master touched state management
- Explore progressive validation patterns
