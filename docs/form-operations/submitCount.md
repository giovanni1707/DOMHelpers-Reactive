# form.submitCount

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  { email: '', password: '' },
  {
    onSubmit: async (values) => {
      await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
    }
  }
);

console.log(form.submitCount); // 0 (not submitted yet)

await form.submit();
console.log(form.submitCount); // 1

await form.submit();
console.log(form.submitCount); // 2

await form.submit();
console.log(form.submitCount); // 3
```

**What just happened?** `form.submitCount` tracks how many times the form has been submitted. Use it for analytics, retry logic, or displaying submission history!

 

## What is form.submitCount?

`form.submitCount` is a **reactive number property** that counts how many times the form has been successfully submitted.

Simply put, it starts at `0` and increments by `1` each time `submit()` completes (whether it succeeds or fails).

Think of `form.submitCount` as a **trip odometer** - it keeps a running total of submission attempts.

 

## Syntax

```javascript
// Read the count
const count = form.submitCount;

// Use in conditions
if (form.submitCount > 0) {
  console.log('Form has been submitted before');
}

// Display to user
console.log(`Submitted ${form.submitCount} time(s)`);
```

**Type:** `Number` (read-only, auto-incremented)

**Initial Value:** `0`

 

## Why Does This Exist?

### Use Cases

**1. Analytics & Tracking**
```javascript
// Track how many times users retry
console.log(`User submitted ${form.submitCount} times`);
// Send to analytics service
```

**2. Retry Logic**
```javascript
// Limit retry attempts
if (form.submitCount >= 3) {
  alert('Too many attempts. Please contact support.');
  return;
}
```

**3. User Feedback**
```javascript
// Show different messages based on attempts
if (form.submitCount === 0) {
  message = 'Ready to submit';
} else if (form.submitCount === 1) {
  message = 'Submitting again...';
} else {
  message = `Retry #${form.submitCount}`;
}
```

 

## Mental Model

Think of `form.submitCount` like a **punch card** or **loyalty card**:

```
Submit Card
┌─────────────────────┐
│ Submissions:        │
│ ☑ 1st submit        │
│ ☑ 2nd submit        │
│ ☑ 3rd submit        │
│ ☐ 4th submit        │
├─────────────────────┤
│ Total: 3            │
└─────────────────────┘
```

Each successful submit adds a "punch" to the card!

 

## How Does It Work?

### Auto-Increment

```
form.submit() is called
         ↓
Form validates
         ↓
onSubmit executes
         ↓
onSubmit completes (success or error)
         ↓
form.submitCount++ (incremented!)
```

**Note:** The count increments when submit completes, regardless of success or failure.

 

## Basic Usage

### Example 1: Display Submit History

```javascript
const form = Forms.create(
  { feedback: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

effect(() => {
  const statusEl = document.getElementById('status');

  if (form.submitCount === 0) {
    statusEl.textContent = 'Not submitted yet';
  } else {
    statusEl.textContent = `Submitted ${form.submitCount} time(s)`;
  }
});
```

 

### Example 2: Limit Retries

```javascript
const form = Forms.create(
  { email: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

async function handleSubmit() {
  if (form.submitCount >= 3) {
    alert('Maximum attempts reached. Please try again later.');
    return;
  }

  const result = await form.submit();

  if (!result.success) {
    alert(`Attempt ${form.submitCount} failed. Please try again.`);
  }
}
```

 

### Example 3: Conditional Messaging

```javascript
const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

effect(() => {
  const button = document.getElementById('submit');

  if (form.submitCount === 0) {
    button.textContent = 'Submit';
  } else if (form.submitCount === 1) {
    button.textContent = 'Submit Again';
  } else {
    button.textContent = `Retry (${form.submitCount} attempts)`;
  }
});
```

 

## Advanced Patterns

### Pattern 1: Retry with Exponential Backoff

```javascript
const form = Forms.create(
  { data: '' },
  {
    onSubmit: async (values) => {
      // Calculate delay based on submit count
      const delay = Math.min(1000 * Math.pow(2, form.submitCount), 10000);

      if (form.submitCount > 0) {
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(r => setTimeout(r, delay));
      }

      return fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(values)
      });
    }
  }
);
```

 

### Pattern 2: Analytics Tracking

```javascript
const form = Forms.create(
  { email: '' },
  {
    onSubmit: async (values) => {
      const result = await apiCall(values);

      // Track submission attempts
      analytics.track('Form Submitted', {
        attemptNumber: form.submitCount + 1,
        success: result.ok
      });

      return result;
    }
  }
);
```

 

### Pattern 3: Progressive Hints

```javascript
const form = Forms.create(
  { answer: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

effect(() => {
  const hintEl = document.getElementById('hint');

  if (form.submitCount === 0) {
    hintEl.textContent = '';
  } else if (form.submitCount === 1) {
    hintEl.textContent = 'Hint: Try checking your spelling';
  } else if (form.submitCount === 2) {
    hintEl.textContent = 'Hint: The answer starts with "R"';
  } else {
    hintEl.textContent = 'Hint: The answer is "Reactive"';
  }
});
```

 

### Pattern 4: Rate Limiting

```javascript
const MAX_SUBMITS_PER_MINUTE = 3;
const submitTimestamps = [];

const form = Forms.create(
  { data: '' },
  { onSubmit: async (values) => { /* ... */ } }
);

async function rateLimitedSubmit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Remove old timestamps
  const recentSubmits = submitTimestamps.filter(t => t > oneMinuteAgo);

  if (recentSubmits.length >= MAX_SUBMITS_PER_MINUTE) {
    alert('Too many requests. Please wait a minute.');
    return;
  }

  const result = await form.submit();

  if (result.success) {
    submitTimestamps.push(now);
  }
}
```

 

## Summary

### Key Takeaways

1. **`form.submitCount` tracks total submissions** starting from `0`.

2. **Increments automatically** when `submit()` completes.

3. **Counts both successes and failures** - any completed submission increments it.

4. **Useful for retry logic** - limit attempts, show appropriate messages.

5. **Great for analytics** - track user behavior and submission patterns.

6. **Resets with `form.reset()`** - back to `0`.

7. **Reactive property** - changes trigger effects and UI updates.

### One-Line Rule

> **`form.submitCount` counts total submission attempts - use it for retry limits, analytics, and progressive user feedback.**

 

**What's Next?**

- Learn about `form.isValid` to check form validity
- Explore `form.isDirty` to detect changes
- Master `form.hasErrors` to check error state
