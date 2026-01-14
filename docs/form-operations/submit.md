# form.submit()

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

// Define submit handler
async function handleLogin(values) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    throw { errors }; // Return server errors
  }

  return await response.json();
}

// Submit the form
submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(handleLogin);

  if (result.success) {
    console.log('Login successful!', result.data);
    navigateToDashboard();
  } else {
    console.log('Login failed:', result.errors);
    // Errors already set on form
  }
});
```

**What just happened?** `submit()` handles the complete submission lifecycle - validation, loading state, error handling, and more!

 

## What is form.submit()?

`form.submit()` is the **complete form submission handler** that manages the entire submission lifecycle automatically.

Simply put, it's a one-call solution for form submission that handles validation, loading states, error handling, and result processing.

**Key characteristics:**
- ✅ Validates form before submitting
- ✅ Manages `isSubmitting` state automatically
- ✅ Increments `submitCount`
- ✅ Handles errors gracefully
- ✅ Returns standardized result object
- ✅ Async/await support
- ✅ Prevents duplicate submissions

 

## Syntax

```javascript
// Submit with async handler
const result = await form.submit(async (values) => {
  // Your submission logic
  return await apiCall(values);
});

// Access result
if (result.success) {
  console.log('Success!', result.data);
} else {
  console.log('Failed!', result.errors);
}
```

**Parameters:**
- `customHandler` (function) - Async function that handles submission. Receives `values` and `form` as arguments.

**Returns:** `Promise<{ success: boolean, data?: any, errors?: object }>` - Result object with submission outcome

 

## Why Does This Exist?

### The Challenge with Manual Submission

Handling form submission manually requires managing many states and edge cases.

```javascript
const form = Forms.create({ email: '', password: '' });

// ❌ Manual submission - lots of boilerplate
submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  // 1. Validate
  form.validate();
  form.touchAll();

  if (!form.isValid) {
    alert('Please fix errors');
    return;
  }

  // 2. Set loading state
  form.isSubmitting = true;
  submitButton.disabled = true;

  // 3. Increment counter
  form.submitCount++;

  try {
    // 4. Submit
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(form.values)
    });

    // 5. Handle response
    if (!response.ok) {
      const { errors } = await response.json();
      form.setErrors(errors);
      return;
    }

    // 6. Success
    const data = await response.json();
    navigateTo('/dashboard');

  } catch (error) {
    // 7. Handle errors
    form.setError('email', error.message);
  } finally {
    // 8. Clean up
    form.isSubmitting = false;
    submitButton.disabled = false;
  }
});

// ✅ With submit() - one call handles everything
submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(async (values) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const { errors } = await response.json();
      throw { errors };
    }

    return await response.json();
  });

  if (result.success) {
    navigateTo('/dashboard');
  }
});
```

**Benefits of submit():**
✅ **Automatic validation** - Validates before submitting
✅ **State management** - Handles `isSubmitting`, `submitCount`
✅ **Error handling** - Catches and sets errors automatically
✅ **Duplicate prevention** - Blocks concurrent submissions
✅ **Standardized results** - Consistent return format
✅ **Less boilerplate** - One method does it all

 

## Mental Model

Think of `submit()` as a **smart submission orchestrator** - it coordinates all the moving parts of form submission.

### Visual Flow

```
User clicks submit
         ↓
   form.submit(handler)
         ↓
    1. Validate form
         ↓
    Valid? ──NO──> Show errors, return { success: false }
         │
        YES
         ↓
    2. Set isSubmitting = true
    3. Increment submitCount
         ↓
    4. Call customHandler(values, form)
         ↓
    Handler succeeds? ──NO──> Catch error, set errors
         │                    return { success: false, errors }
        YES
         ↓
    5. Return { success: true, data }
         ↓
    6. Set isSubmitting = false
         ↓
    Done!
```

 

## How Does It Work?

### Internal Process

```javascript
// When you call:
await form.submit(async (values) => {
  return await apiCall(values);
});

// Here's what happens internally:
1️⃣ Validate the form
   form.validate()
   form.touchAll()

2️⃣ Check if valid
   if (!form.isValid) {
     return { success: false, errors: form.errors }
   }

3️⃣ Prevent duplicate submissions
   if (form.isSubmitting) {
     return { success: false, error: 'Already submitting' }
   }

4️⃣ Set submitting state
   form.isSubmitting = true
   form.submitCount++

5️⃣ Call custom handler
   try {
     const data = await customHandler(form.values, form)

     // Success
     form.isSubmitting = false
     return { success: true, data }

   } catch (error) {
     // Handle errors
     if (error.errors) {
       form.setErrors(error.errors)
     } else {
       form.setError('_general', error.message)
     }

     form.isSubmitting = false
     return { success: false, errors: form.errors }
   }
```

### Reactivity Flow Diagram

```
submit(handler)
    ↓
Validate → touchAll()
    ↓
isValid? ──NO──> Return error result
    ↓
   YES
    ↓
isSubmitting = true
submitCount++
    ↓
UI updates (loading state)
    ↓
Call handler(values, form)
    ↓
Handler result
    ↓
isSubmitting = false
    ↓
UI updates (done loading)
    ↓
Return result object
```

 

## Basic Usage

### Example 1: Simple Form Submission

```javascript
const form = Forms.create({
  email: '',
  message: ''
});

async function sendMessage(values) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return await response.json();
}

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(sendMessage);

  if (result.success) {
    showNotification('Message sent successfully!');
    form.reset();
  }
});
```

 

### Example 2: Login Form

```javascript
const form = Forms.create(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => !value ? 'Email required' : '',
    password: (value) => !value ? 'Password required' : ''
  }
);

async function login(values) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    throw { errors }; // submit() will set these on form
  }

  return await response.json();
}

loginButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(login);

  if (result.success) {
    localStorage.setItem('token', result.data.token);
    window.location.href = '/dashboard';
  }
});
```

 

### Example 3: Form with Server Validation

```javascript
const form = Forms.create({
  username: '',
  email: '',
  password: ''
});

async function register(values) {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  const data = await response.json();

  if (!response.ok) {
    // Server returns field-specific errors
    throw { errors: data.errors };
  }

  return data;
}

registerButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(register);

  if (result.success) {
    showNotification('Registration successful!');
    navigateTo('/login');
  } else {
    // Errors already displayed (set on form automatically)
    focusFirstError();
  }
});
```

 

### Example 4: Multi-Step Form Final Submit

```javascript
const form = Forms.create({
  // Step 1
  firstName: '',
  lastName: '',

  // Step 2
  email: '',
  phone: '',

  // Step 3
  address: '',
  city: ''
});

async function submitApplication(values) {
  const response = await fetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors, step } = await response.json();

    // Return which step has errors
    throw { errors, meta: { step } };
  }

  return await response.json();
}

finalSubmitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(submitApplication);

  if (result.success) {
    showSuccessModal(result.data);
  } else {
    // Go to step with errors
    const errorStep = result.meta?.step || 1;
    goToStep(errorStep);
  }
});
```

 

### Example 5: Form with Loading UI

```javascript
const form = Forms.create({
  email: '',
  password: ''
});

// Reactive loading UI
effect(() => {
  if (form.isSubmitting) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    loadingSpinner.style.display = 'block';
  } else {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit';
    loadingSpinner.style.display = 'none';
  }
});

async function handleSubmit(values) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  return { message: 'Success!' };
}

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(handleSubmit);

  if (result.success) {
    showNotification(result.data.message);
  }
});
```

 

## Advanced Patterns

### Pattern 1: Retry Logic with Exponential Backoff

```javascript
const form = Forms.create({ email: '' });

async function submitWithRetry(values, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(values)
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status >= 500) {
        // Server error - retry
        attempt++;

        if (attempt < maxRetries) {
          showNotification(`Retrying... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      }

      // Client error - don't retry
      const { errors } = await response.json();
      throw { errors };

    } catch (error) {
      if (attempt >= maxRetries - 1) {
        throw error;
      }
      attempt++;
    }
  }

  throw new Error('Max retries exceeded');
}

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit((values) => submitWithRetry(values, 3));

  if (result.success) {
    showNotification('Submitted successfully!');
  }
});
```

 

### Pattern 2: Optimistic Updates

```javascript
const form = Forms.create({ comment: '' });

let optimisticId = 0;

async function submitComment(values) {
  // Optimistically add comment to UI
  const tempComment = {
    id: `temp-${optimisticId++}`,
    text: values.comment,
    pending: true,
    timestamp: Date.now()
  };

  addCommentToUI(tempComment);

  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      // Remove optimistic comment
      removeCommentFromUI(tempComment.id);

      const { errors } = await response.json();
      throw { errors };
    }

    const savedComment = await response.json();

    // Replace optimistic with real
    replaceCommentInUI(tempComment.id, savedComment);

    return savedComment;

  } catch (error) {
    removeCommentFromUI(tempComment.id);
    throw error;
  }
}

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(submitComment);

  if (result.success) {
    form.reset();
  }
});
```

 

### Pattern 3: File Upload with Progress

```javascript
const form = Forms.create({
  file: null,
  description: ''
});

let uploadProgress = 0;

async function uploadFile(values) {
  const formData = new FormData();
  formData.append('file', values.file);
  formData.append('description', values.description);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress = (e.loaded / e.total) * 100;
        updateProgressBar(uploadProgress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject({ errors: JSON.parse(xhr.responseText).errors });
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

uploadButton.addEventListener('click', async (e) => {
  e.preventDefault();

  uploadProgress = 0;

  const result = await form.submit(uploadFile);

  if (result.success) {
    showNotification('File uploaded successfully!');
    form.reset();
  }
});
```

 

### Pattern 4: Confirmation Before Submit

```javascript
const form = Forms.create({
  amount: 0,
  recipient: ''
});

async function processPayment(values) {
  // Show confirmation dialog
  const confirmed = await showConfirmDialog({
    title: 'Confirm Payment',
    message: `Send $${values.amount} to ${values.recipient}?`,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  if (!confirmed) {
    throw { cancelled: true };
  }

  const response = await fetch('/api/payments', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    throw { errors };
  }

  return await response.json();
}

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(processPayment);

  if (result.success) {
    showNotification('Payment processed!');
    form.reset();
  } else if (result.errors?.cancelled) {
    showNotification('Payment cancelled');
  }
});
```

 

### Pattern 5: Offline Queue

```javascript
const form = Forms.create({ message: '' });
const offlineQueue = [];

async function submitMessage(values) {
  if (!navigator.onLine) {
    // Queue for later
    offlineQueue.push({
      values,
      timestamp: Date.now()
    });

    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));

    throw { offline: true, message: 'Queued for when online' };
  }

  const response = await fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    throw { errors };
  }

  return await response.json();
}

// Process queue when online
window.addEventListener('online', async () => {
  if (offlineQueue.length > 0) {
    showNotification(`Processing ${offlineQueue.length} queued messages...`);

    for (const item of offlineQueue) {
      try {
        await submitMessage(item.values);
      } catch (error) {
        console.error('Failed to process queued item:', error);
      }
    }

    offlineQueue.length = 0;
    localStorage.removeItem('offlineQueue');
  }
});

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(submitMessage);

  if (result.success) {
    showNotification('Message sent!');
    form.reset();
  } else if (result.errors?.offline) {
    showNotification(result.errors.message, 'info');
    form.reset();
  }
});
```

 

### Pattern 6: Analytics Tracking

```javascript
const form = Forms.create({ email: '', password: '' });

async function loginWithAnalytics(values) {
  const startTime = Date.now();

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(values)
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const { errors } = await response.json();

      analytics.track('login_failed', {
        duration,
        errorCount: Object.keys(errors).length,
        errors: Object.keys(errors)
      });

      throw { errors };
    }

    const data = await response.json();

    analytics.track('login_success', {
      duration,
      userId: data.userId
    });

    return data;

  } catch (error) {
    analytics.track('login_error', {
      duration: Date.now() - startTime,
      error: error.message
    });

    throw error;
  }
}

loginButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(loginWithAnalytics);

  if (result.success) {
    navigateTo('/dashboard');
  }
});
```

 

### Pattern 7: Debounced Auto-Submit

```javascript
const form = Forms.create({
  searchQuery: ''
});

let submitTimeout;

function debouncedSubmit(values) {
  return new Promise((resolve) => {
    clearTimeout(submitTimeout);

    submitTimeout = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${values.searchQuery}`);
      const results = await response.json();
      resolve(results);
    }, 500);
  });
}

searchInput.addEventListener('input', async (e) => {
  form.setValue('searchQuery', e.target.value);

  if (e.target.value.length >= 3) {
    const result = await form.submit(debouncedSubmit);

    if (result.success) {
      displayResults(result.data);
    }
  }
});
```

 

### Pattern 8: Multi-Endpoint Submission

```javascript
const form = Forms.create({
  profile: {},
  preferences: {},
  avatar: null
});

async function submitMultiEndpoint(values) {
  const results = {};

  // Submit to multiple endpoints
  const [profileRes, prefsRes, avatarRes] = await Promise.all([
    fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(values.profile)
    }),
    fetch('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(values.preferences)
    }),
    values.avatar ? uploadAvatar(values.avatar) : Promise.resolve(null)
  ]);

  // Check for errors
  if (!profileRes.ok) {
    const { errors } = await profileRes.json();
    throw { errors: { profile: errors } };
  }

  if (!prefsRes.ok) {
    const { errors } = await prefsRes.json();
    throw { errors: { preferences: errors } };
  }

  results.profile = await profileRes.json();
  results.preferences = await prefsRes.json();

  if (avatarRes) {
    results.avatar = avatarRes;
  }

  return results;
}

saveButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(submitMultiEndpoint);

  if (result.success) {
    showNotification('All settings saved!');
  }
});
```

 

### Pattern 9: Undo After Submit

```javascript
const form = Forms.create({ task: '' });

let lastSubmittedData = null;

async function submitWithUndo(values) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    throw { errors };
  }

  const data = await response.json();

  lastSubmittedData = data;

  // Show undo notification
  showNotification('Task added', {
    action: 'Undo',
    onAction: async () => {
      await fetch(`/api/tasks/${data.id}`, { method: 'DELETE' });
      showNotification('Task removed');
    },
    duration: 5000
  });

  return data;
}

addButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(submitWithUndo);

  if (result.success) {
    form.reset();
  }
});
```

 

### Pattern 10: Smart Error Recovery

```javascript
const form = Forms.create({ email: '', password: '' });

async function submitWithRecovery(values) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const { errors, code } = await response.json();

      // Handle specific error codes
      if (code === 'EMAIL_NOT_VERIFIED') {
        const resend = await showConfirmDialog({
          title: 'Email Not Verified',
          message: 'Would you like to resend verification email?',
          confirmText: 'Resend',
          cancelText: 'Cancel'
        });

        if (resend) {
          await fetch('/api/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email: values.email })
          });

          throw { errors: { email: 'Verification email sent. Please check your inbox.' } };
        }
      }

      throw { errors };
    }

    return await response.json();

  } catch (error) {
    // Network error - suggest offline mode
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const useOffline = await showConfirmDialog({
        title: 'Connection Error',
        message: 'Unable to connect. Use offline mode?'
      });

      if (useOffline) {
        // Switch to offline mode
        enableOfflineMode();
      }
    }

    throw error;
  }
}

loginButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const result = await form.submit(submitWithRecovery);

  if (result.success) {
    navigateTo('/dashboard');
  }
});
```

 

## Common Pitfalls

### Pitfall 1: Not Handling Errors in Custom Handler

```javascript
const form = Forms.create({ email: '' });

async function badHandler(values) {
  // ❌ Not throwing errors - submit() won't know it failed
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    return null; // Don't do this!
  }

  return await response.json();
}

// ✅ Throw errors so submit() can handle them
async function goodHandler(values) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    const { errors } = await response.json();
    throw { errors }; // submit() will catch and set errors
  }

  return await response.json();
}
```

 

### Pitfall 2: Not Using Returned Result

```javascript
const form = Forms.create({ email: '' });

// ❌ Ignoring result
submitButton.addEventListener('click', async () => {
  await form.submit(handler);
  // Don't know if it succeeded or failed!
});

// ✅ Check result
submitButton.addEventListener('click', async () => {
  const result = await form.submit(handler);

  if (result.success) {
    handleSuccess(result.data);
  } else {
    handleError(result.errors);
  }
});
```

 

### Pitfall 3: Calling submit() Multiple Times Concurrently

```javascript
const form = Forms.create({ email: '' });

// ❌ Multiple concurrent submissions
submitButton.addEventListener('click', async () => {
  form.submit(handler); // First call
  form.submit(handler); // Second call - blocked!
});

// submit() prevents duplicate submissions
// Second call returns immediately with error

// ✅ Wait for first to complete
submitButton.addEventListener('click', async () => {
  const result = await form.submit(handler);
  // Only one submission at a time
});
```

 

### Pitfall 4: Forgetting async/await

```javascript
const form = Forms.create({ email: '' });

// ❌ Not awaiting - result is a Promise
submitButton.addEventListener('click', () => {
  const result = form.submit(handler); // Promise, not result!
  console.log(result.success); // undefined
});

// ✅ Use async/await
submitButton.addEventListener('click', async () => {
  const result = await form.submit(handler);
  console.log(result.success); // true or false
});
```

 

### Pitfall 5: Not Validating Before Custom Logic

```javascript
const form = Forms.create({ email: '' });

async function handler(values) {
  // ❌ submit() already validated - don't do it again
  form.validate(); // Redundant!

  return await apiCall(values);
}

// ✅ submit() validates automatically
async function handler(values) {
  // Just do your submission logic
  return await apiCall(values);
}
```

 

## Summary

### Key Takeaways

1. **`submit()` handles complete submission lifecycle** - validation, states, errors, results.

2. **Validates automatically** - runs `validate()` and `touchAll()` before submission.

3. **Manages submission state** - sets `isSubmitting`, increments `submitCount`.

4. **Standardized results** - returns `{ success, data?, errors? }` object.

5. **Error handling** - catches errors, sets them on form automatically.

6. **Prevents duplicates** - blocks concurrent submissions.

### When to Use submit()

✅ **Use submit() for:**
- Form submission handlers
- API calls with form data
- Complex submission workflows
- Automatic state management
- Standardized error handling

❌ **Don't use submit() when:**
- Not actually submitting (use `validate()`)
- Need custom validation flow (manual is better)
- Want to skip validation (shouldn't happen)

### Result Object Structure

```javascript
// Success result
{
  success: true,
  data: { /* returned from handler */ }
}

// Error result (validation failed)
{
  success: false,
  errors: { /* form.errors */ }
}

// Error result (handler threw)
{
  success: false,
  errors: { /* thrown error.errors or form.errors */ }
}
```

### One-Line Rule

> **`form.submit(handler)` orchestrates the complete form submission lifecycle - validating, managing states, calling your handler, and returning a standardized result object.**

 

**What's Next?**

- Explore advanced submission patterns
- Master error recovery strategies
- Learn form lifecycle management
