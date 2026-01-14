# form.isSubmitting

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    onSubmit: async (values) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    }
  }
);

console.log(form.isSubmitting); // false

// Start submission
form.submit();

console.log(form.isSubmitting); // true (during submission)

// After 2 seconds...
// form.isSubmitting automatically becomes false
```

**What just happened?** `form.isSubmitting` automatically tracks whether the form is currently being submitted. Use it to disable buttons and show loading states!

 

## What is form.isSubmitting?

`form.isSubmitting` is a **reactive boolean property** that indicates whether the form is currently in the process of being submitted.

Simply put, it's `true` while your form is submitting (waiting for async operations), and `false` otherwise.

Think of `form.isSubmitting` as a **"busy" indicator** - like the loading spinner on your phone when an app is processing.

 

## Syntax

### Reading the Value

```javascript
// Check if form is submitting
if (form.isSubmitting) {
  console.log('Form is submitting...');
}

// Use in UI
const submitButton = document.getElementById('submit');
submitButton.disabled = form.isSubmitting;
submitButton.textContent = form.isSubmitting ? 'Submitting...' : 'Submit';
```

**Type:** `Boolean` (read-only, auto-managed)

**Values:**
- `false` - Form is not submitting (default)
- `true` - Form is currently submitting

 

## Why Does This Exist?

### The Problem: Duplicate Submissions

Without tracking submission state, users can submit multiple times:

```javascript
// Without isSubmitting (dangerous!)
async function handleSubmit() {
  const values = getFormValues();

  // User can click submit button multiple times!
  await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  // Each click = another API call
  // Could create duplicate orders, charges, etc.
}
```

**What's the Real Issue?**

```
User Clicks Submit
       ↓
API Call Starts
       ↓
User Clicks Again (button still enabled!)
       ↓
Another API Call
       ↓
Duplicate Submissions 😱
```

**Problems:**
❌ Duplicate API calls
❌ Duplicate database records
❌ Multiple charges to credit card
❌ Confusing user experience
❌ Server overload from repeated requests

### The Solution with form.isSubmitting

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    onSubmit: async (values) => {
      // form.isSubmitting is automatically set to true here

      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      // form.isSubmitting automatically becomes false when done
      return response.json();
    }
  }
);

// Disable button while submitting
effect(() => {
  const button = document.getElementById('submit');
  button.disabled = form.isSubmitting;
  button.textContent = form.isSubmitting ? 'Submitting...' : 'Submit';
});

// User clicks submit
await form.submit();
// Button disabled during submission ✅
// Only one API call made ✅
```

**Benefits:**
✅ Prevents duplicate submissions
✅ Automatic state management
✅ Easy to disable UI elements
✅ Clear feedback to users
✅ Protects backend from duplicate requests

 

## Mental Model

Think of `form.isSubmitting` like a **traffic light for your form**:

### Without isSubmitting (No Traffic Light)
```
User: *Presses submit*
Car: *Starts driving*

User: "Did it work?" *Presses again*
Car: *Another car starts driving*

User: "Still not sure..." *Presses again*
Car: *Yet another car drives*

Result: Traffic jam! 🚗🚗🚗
```

### With isSubmitting (Traffic Light System)
```
User: *Presses submit*
Light: 🔴 RED (isSubmitting = true)
Button: DISABLED
Car: *Starts driving*

User: *Tries to press again*
Button: "Can't press - I'm disabled!"
Light: Still 🔴 RED

Car: *Arrives safely*
Light: 🟢 GREEN (isSubmitting = false)
Button: ENABLED again

Result: One car, one trip! ✅
```

**Key Insight:** `form.isSubmitting` acts as a safety lock preventing multiple submissions while one is in progress.

 

## How Does It Work?

### Automatic State Management

```
form.submit() is called
         ↓
form.isSubmitting = true (automatic!)
         ↓
Runs onSubmit function
         ↓
Waits for async operation
         ↓
onSubmit completes
         ↓
form.isSubmitting = false (automatic!)
```

### State Timeline

```
Before Submit
isSubmitting: false
submitCount: 0

    ↓ form.submit()

During Submit
isSubmitting: true
submitCount: 0

    ↓ await completes

After Submit
isSubmitting: false
submitCount: 1 (incremented)
```

 

## Basic Usage

### Example 1: Disable Submit Button

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    onSubmit: async (values) => {
      await new Promise(r => setTimeout(r, 2000));
      return { success: true };
    }
  }
);

// Bind button state to isSubmitting
const submitButton = document.getElementById('submit');

effect(() => {
  submitButton.disabled = form.isSubmitting;
});

// Click handler
submitButton.addEventListener('click', () => {
  form.submit();
  // Button automatically disables during submission ✅
});
```

 

### Example 2: Change Button Text

```javascript
const form = Forms.create(
  { data: '' },
  {
    onSubmit: async (values) => {
      await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(values)
      });
    }
  }
);

// Update button text
effect(() => {
  const button = document.getElementById('submit');
  button.textContent = form.isSubmitting ? 'Saving...' : 'Save';
});
```

 

### Example 3: Show Loading Spinner

```javascript
const form = Forms.create(
  { email: '' },
  {
    onSubmit: async (values) => {
      await someAsyncOperation(values);
    }
  }
);

// Toggle loading spinner
effect(() => {
  const spinner = document.getElementById('spinner');
  spinner.style.display = form.isSubmitting ? 'block' : 'none';
});
```

 

### Example 4: Prevent Multiple Submits

```javascript
const form = Forms.create(
  { data: '' },
  {
    onSubmit: async (values) => {
      await longRunningOperation(values);
    }
  }
);

async function handleFormSubmit() {
  // Check if already submitting
  if (form.isSubmitting) {
    console.log('Already submitting, please wait');
    return; // Prevent duplicate
  }

  await form.submit();
}
```

 

## UI Patterns

### Pattern 1: Disabled Form During Submission

```javascript
const form = Forms.create(
  { name: '', email: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

// Disable all inputs while submitting
effect(() => {
  const inputs = document.querySelectorAll('input');

  inputs.forEach(input => {
    input.disabled = form.isSubmitting;
  });
});
```

 

### Pattern 2: Loading Overlay

```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

// Show overlay during submission
effect(() => {
  const overlay = document.getElementById('loading-overlay');

  if (form.isSubmitting) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
});
```

 

### Pattern 3: Submit Button States

```javascript
const form = Forms.create(
  { email: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

effect(() => {
  const button = document.getElementById('submit');

  if (form.isSubmitting) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Submitting...';
    button.classList.add('submitting');
  } else {
    button.disabled = false;
    button.innerHTML = 'Submit';
    button.classList.remove('submitting');
  }
});
```

 

### Pattern 4: Progress Indicator

```javascript
const form = Forms.create(
  { data: '' },
  {
    onSubmit: async (values) => {
      // Simulate multi-step operation
      await step1();
      await step2();
      await step3();
    }
  }
);

// Show indeterminate progress bar
effect(() => {
  const progressBar = document.getElementById('progress');

  progressBar.style.display = form.isSubmitting ? 'block' : 'none';

  if (form.isSubmitting) {
    progressBar.classList.add('indeterminate');
  }
});
```

 

## Advanced Patterns

### Pattern 1: Custom Submit with Manual Control

```javascript
const form = Forms.create({ data: '' });

async function customSubmit() {
  // Manually set isSubmitting (if needed)
  form.isSubmitting = true;

  try {
    await myCustomAsyncOperation(form.values);
    console.log('Success!');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    form.isSubmitting = false;
  }
}
```

 

### Pattern 2: Submission Timeout

```javascript
const form = Forms.create(
  { data: '' },
  {
    onSubmit: async (values) => {
      // Create timeout race
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const request = fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      return Promise.race([request, timeout]);
    }
  }
);

// Watch for timeout
form.submit().catch(error => {
  if (error.message === 'Timeout') {
    alert('Request timed out. Please try again.');
  }
});
// isSubmitting automatically becomes false after timeout
```

 

### Pattern 3: Submission Counter with Feedback

```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

effect(() => {
  const statusText = document.getElementById('status');

  if (form.isSubmitting) {
    statusText.textContent = `Submitting (attempt ${form.submitCount + 1})...`;
  } else if (form.submitCount > 0) {
    statusText.textContent = `Submitted ${form.submitCount} time(s)`;
  } else {
    statusText.textContent = 'Not submitted yet';
  }
});
```

 

### Pattern 4: Debounced Auto-Submit

```javascript
const form = Forms.create(
  { searchQuery: '' },
  {
    onSubmit: async (values) => {
      const response = await fetch(`/api/search?q=${values.searchQuery}`);
      return response.json();
    }
  }
);

let submitTimeout;

effect(() => {
  // Watch search query
  const query = form.values.searchQuery;

  // Don't submit if already submitting
  if (form.isSubmitting) return;

  clearTimeout(submitTimeout);
  submitTimeout = setTimeout(() => {
    if (query) {
      form.submit();
    }
  }, 500);
});
```

 

### Pattern 5: Confirmation Before Submit

```javascript
const form = Forms.create(
  { deleteReason: '' },
  {
    onSubmit: async (values) => {
      await fetch('/api/delete', {
        method: 'DELETE',
        body: JSON.stringify(values)
      });
    }
  }
);

async function handleDelete() {
  if (form.isSubmitting) {
    console.log('Already deleting...');
    return;
  }

  const confirmed = confirm('Are you sure you want to delete?');

  if (confirmed) {
    await form.submit();
    // Button disabled during deletion via isSubmitting
  }
}
```

 

## Common Pitfalls

### Pitfall 1: Not Disabling Submit Button

❌ **Wrong:**
```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* slow operation */ } }
);

// Button always enabled - user can click multiple times!
document.getElementById('submit').addEventListener('click', () => {
  form.submit(); // Multiple clicks = multiple submissions
});
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* slow operation */ } }
);

// Disable button while submitting
const submitButton = document.getElementById('submit');

effect(() => {
  submitButton.disabled = form.isSubmitting;
});

submitButton.addEventListener('click', () => {
  form.submit(); // Only one submission allowed ✅
});
```

 

### Pitfall 2: Manually Setting isSubmitting Incorrectly

❌ **Wrong:**
```javascript
const form = Forms.create({ data: '' });

async function submit() {
  form.isSubmitting = true;

  try {
    await apiCall();
  } catch (error) {
    // Forgot to set false in catch!
  }

  form.isSubmitting = false;
  // isSubmitting stays true if error occurs!
}
```

✅ **Correct:**
```javascript
const form = Forms.create({ data: '' });

async function submit() {
  form.isSubmitting = true;

  try {
    await apiCall();
  } catch (error) {
    console.error(error);
  } finally {
    form.isSubmitting = false; // Always reset ✅
  }
}
```

 

### Pitfall 3: Assuming isSubmitting Means Success

❌ **Wrong:**
```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

await form.submit();

if (!form.isSubmitting) {
  // Assumes success, but could have failed!
  showSuccessMessage();
}
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

const result = await form.submit();

if (result.success) {
  showSuccessMessage(); // Check result, not isSubmitting ✅
} else {
  showErrorMessage(result.error);
}
```

 

### Pitfall 4: Not Checking isSubmitting Before Submit

❌ **Wrong:**
```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

// Can trigger multiple times
async function quickSubmit() {
  await form.submit();
  await form.submit(); // Second call starts before first finishes
}
```

✅ **Correct:**
```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

async function safeSubmit() {
  if (form.isSubmitting) {
    console.log('Already submitting');
    return; // Guard clause ✅
  }

  await form.submit();
}
```

 

## Summary

### Key Takeaways

1. **`form.isSubmitting` is a boolean flag** that indicates whether the form is currently submitting.

2. **It's automatically managed** - set to `true` when `submit()` is called, `false` when complete.

3. **Use it to disable UI elements** - prevent duplicate submissions by disabling buttons.

4. **Perfect for loading states** - show spinners, progress bars, or status messages.

5. **Prevents race conditions** - ensures only one submission happens at a time.

6. **Works with async operations** - automatically waits for `onSubmit` to complete.

7. **Combine with submit button** - `button.disabled = form.isSubmitting`.

8. **Check before submitting** - add `if (form.isSubmitting) return;` guards.

9. **Automatically resets** - becomes `false` whether submission succeeds or fails.

10. **Read-only property** - managed by the form, but can be manually controlled if needed.

### One-Line Rule

> **`form.isSubmitting` automatically tracks submission state - use it to disable buttons and show loading indicators, preventing duplicate submissions.**

 

**What's Next?**

- Learn about `form.submitCount` to track submission attempts
- Explore `form.isValid` to check form validity
- Master `form.isDirty` to detect changes
- Discover advanced submission patterns
