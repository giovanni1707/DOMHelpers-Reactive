# Validators.maxLength()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    username: '',
    bio: '',
    tweet: ''
  },
  {
    username: Forms.v.maxLength(20, 'Username must be 20 characters or less'),
    bio: Forms.v.maxLength(500, 'Bio must be 500 characters or less'),
    tweet: Forms.v.maxLength(280, 'Tweet must be 280 characters or less')
  }
);

// Too long
form.setValue('username', 'thisusernameiswaytoolong');
form.validateField('username');
console.log(form.getError('username')); // "Username must be 20 characters or less"

// Valid length
form.setValue('username', 'validuser');
form.validateField('username');
console.log(form.hasError('username')); // false
```

**What just happened?** `Validators.maxLength()` ensured the field doesn't exceed the maximum character limit!

 

## What is Validators.maxLength()?

`Validators.maxLength()` is a **built-in validator that enforces maximum length constraints**.

Simply put, it prevents users from entering more than N characters, returning an error when exceeded.

**Key characteristics:**
- ✅ Validates maximum length
- ✅ Works with strings, arrays
- ✅ Custom error message
- ✅ Allows empty values
- ✅ Commonly used for character limits

 

## Syntax

```javascript
// Create maxLength validator
const validator = Forms.v.maxLength(100, 'Must be 100 characters or less');

// Use in form
const form = Forms.create(
  { bio: '' },
  { bio: Forms.v.maxLength(500, 'Bio too long (max 500 chars)') }
);

// Default message
const validator = Forms.v.maxLength(50); // "Must be 50 characters or less"
```

**Parameters:**
- `max` (number) - Maximum allowed length
- `message` (string, optional) - Custom error message

**Returns:** `function(value) => string` - Validator function

 

## Why Does This Exist?

### The Challenge

```javascript
// ❌ Manual max length validation - repetitive
const form = Forms.create(
  {
    username: '',
    bio: '',
    comment: ''
  },
  {
    username: (value) => {
      if (value && value.length > 20) {
        return 'Username too long';
      }
      return '';
    },
    bio: (value) => {
      if (value && value.length > 500) {
        return 'Bio too long';
      }
      return '';
    },
    comment: (value) => {
      if (value && value.length > 1000) {
        return 'Comment too long';
      }
      return '';
    }
  }
);
```

### The Solution

```javascript
// ✅ Clean and consistent
const form = Forms.create(
  {
    username: '',
    bio: '',
    comment: ''
  },
  {
    username: Forms.v.maxLength(20, 'Username too long'),
    bio: Forms.v.maxLength(500, 'Bio too long'),
    comment: Forms.v.maxLength(1000, 'Comment too long')
  }
);
```

 

## How Does It Work?

```javascript
function maxLength(max, message) {
  const defaultMessage = `Must be ${max} characters or less`;

  return function(value) {
    if (!value) return ''; // Allow empty

    const length = value.length;

    if (length > max) {
      return message || defaultMessage;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Twitter-Style Character Limit

```javascript
const form = Forms.create(
  { tweet: '' },
  { tweet: Forms.v.maxLength(280, 'Tweet must be 280 characters or less') }
);

effect(() => {
  const length = form.values.tweet.length;
  const remaining = 280 - length;

  charCounter.textContent = remaining;
  charCounter.className = remaining < 0 ? 'over-limit' : '';
});
```

 

### Example 2: Username Length Limit

```javascript
const form = Forms.create(
  { username: '' },
  { username: Forms.v.maxLength(15, 'Username too long (max 15 characters)') }
);
```

 

### Example 3: Bio with Min and Max

```javascript
const form = Forms.create(
  { bio: '' },
  {
    bio: Forms.v.combine(
      Forms.v.minLength(10, 'Bio must be at least 10 characters'),
      Forms.v.maxLength(500, 'Bio must be 500 characters or less')
    )
  }
);
```

 

### Example 4: Text Input with Hard Limit

```javascript
const form = Forms.create(
  { description: '' },
  { description: Forms.v.maxLength(200) }
);

// Prevent typing beyond limit
descriptionInput.addEventListener('input', (e) => {
  if (e.target.value.length > 200) {
    e.target.value = e.target.value.substring(0, 200);
  }
  form.handleChange(e);
});
```

 

### Example 5: Array Size Limit

```javascript
const form = Forms.create(
  { tags: [] },
  {
    tags: (value) => {
      if (value && value.length > 5) {
        return 'Maximum 5 tags allowed';
      }
      return '';
    }
  }
);
```

 

## Advanced Patterns

### Pattern 1: Character Counter with Warning Zones

```javascript
const form = Forms.create(
  { message: '' },
  { message: Forms.v.maxLength(500) }
);

effect(() => {
  const length = form.values.message.length;
  const max = 500;
  const remaining = max - length;

  charCounter.textContent = `${length} / ${max}`;

  if (remaining < 0) {
    charCounter.className = 'over-limit';
  } else if (remaining < 50) {
    charCounter.className = 'warning';
  } else if (remaining < 100) {
    charCounter.className = 'caution';
  } else {
    charCounter.className = 'safe';
  }
});
```

 

### Pattern 2: Auto-Truncate on Paste

```javascript
const form = Forms.create(
  { bio: '' },
  { bio: Forms.v.maxLength(500) }
);

bioInput.addEventListener('paste', (e) => {
  e.preventDefault();

  const pastedText = e.clipboardData.getData('text');
  const truncated = pastedText.substring(0, 500);

  form.setValue('bio', truncated);
  bioInput.value = truncated;

  if (pastedText.length > 500) {
    showNotification(`Text truncated to ${500} characters`);
  }
});
```

 

### Pattern 3: Progressive Warning System

```javascript
const form = Forms.create(
  { comment: '' },
  { comment: Forms.v.maxLength(1000) }
);

effect(() => {
  const length = form.values.comment.length;
  const max = 1000;
  const percentage = (length / max) * 100;

  warningDiv.style.display = 'none';

  if (percentage >= 100) {
    warningDiv.textContent = '⛔ Maximum length reached';
    warningDiv.className = 'error';
    warningDiv.style.display = 'block';
  } else if (percentage >= 90) {
    warningDiv.textContent = '⚠️ Approaching character limit';
    warningDiv.className = 'warning';
    warningDiv.style.display = 'block';
  } else if (percentage >= 75) {
    warningDiv.textContent = 'ℹ️ Getting close to limit';
    warningDiv.className = 'info';
    warningDiv.style.display = 'block';
  }
});
```

 

### Pattern 4: Max Length with Word Count

```javascript
function maxWords(maxCount, message) {
  return (value) => {
    if (!value) return '';

    const words = value.trim().split(/\s+/).filter(w => w.length > 0);

    if (words.length > maxCount) {
      return message || `Maximum ${maxCount} words allowed`;
    }

    return '';
  };
}

const form = Forms.create(
  { essay: '' },
  { essay: maxWords(500, 'Essay must be 500 words or less') }
);

effect(() => {
  const words = form.values.essay.trim().split(/\s+/).filter(w => w.length > 0);
  wordCounter.textContent = `${words.length} / 500 words`;
});
```

 

### Pattern 5: Contextual Max Length Messages

```javascript
function smartMaxLength(max, fieldName) {
  return (value) => {
    if (!value) return '';

    const length = value.length;

    if (length > max) {
      const over = length - max;

      if (over === 1) {
        return `${fieldName} is 1 character too long`;
      } else if (over <= 10) {
        return `${fieldName} is ${over} characters too long`;
      } else {
        return `${fieldName} exceeds maximum by ${over} characters (max ${max})`;
      }
    }

    return '';
  };
}

const form = Forms.create(
  { bio: '' },
  { bio: smartMaxLength(200, 'Bio') }
);
```

 

### Pattern 6: Visual Progress Bar

```javascript
const form = Forms.create(
  { description: '' },
  { description: Forms.v.maxLength(300) }
);

effect(() => {
  const length = form.values.description.length;
  const max = 300;
  const percentage = Math.min(100, (length / max) * 100);

  progressBar.style.width = `${percentage}%`;

  if (percentage > 100) {
    progressBar.classList.add('over-limit');
  } else if (percentage > 90) {
    progressBar.classList.add('warning');
  } else {
    progressBar.classList.remove('over-limit', 'warning');
  }
});
```

 

### Pattern 7: Soft Limit with Hard Limit

```javascript
const SOFT_LIMIT = 200;
const HARD_LIMIT = 250;

const form = Forms.create(
  { post: '' },
  { post: Forms.v.maxLength(HARD_LIMIT, `Maximum ${HARD_LIMIT} characters`) }
);

effect(() => {
  const length = form.values.post.length;

  if (length > SOFT_LIMIT && length <= HARD_LIMIT) {
    softWarning.textContent = `⚠️ Recommended limit is ${SOFT_LIMIT} characters`;
    softWarning.style.display = 'block';
  } else {
    softWarning.style.display = 'none';
  }
});
```

 

### Pattern 8: Disable Submit When Over Limit

```javascript
const form = Forms.create(
  { message: '' },
  { message: Forms.v.maxLength(500) }
);

effect(() => {
  const isOverLimit = form.values.message.length > 500;

  submitButton.disabled = isOverLimit;

  if (isOverLimit) {
    submitButton.title = 'Message exceeds character limit';
  } else {
    submitButton.title = '';
  }
});
```

 

### Pattern 9: Emoji-Aware Length Validation

```javascript
function maxLengthUnicode(max, message) {
  return (value) => {
    if (!value) return '';

    // Count Unicode code points (handles emojis correctly)
    const length = Array.from(value).length;

    if (length > max) {
      return message || `Must be ${max} characters or less`;
    }

    return '';
  };
}

const form = Forms.create(
  { status: '' },
  { status: maxLengthUnicode(140, 'Status too long') }
);

// "Hello 👋🌍" = 8 code points (not 10)
```

 

### Pattern 10: Dynamic Max Length Based on Plan

```javascript
const characterLimits = {
  free: 100,
  basic: 500,
  premium: 2000,
  enterprise: Infinity
};

function createFormForPlan(planType) {
  const maxChars = characterLimits[planType];

  return Forms.create(
    { bio: '' },
    {
      bio: maxChars === Infinity
        ? () => '' // No limit for enterprise
        : Forms.v.maxLength(maxChars, `Bio limit: ${maxChars} characters`)
    }
  );
}

const freeUserForm = createFormForPlan('free'); // 100 char limit
const premiumUserForm = createFormForPlan('premium'); // 2000 char limit
```

 

## Common Pitfalls

### Pitfall 1: Not Preventing Input Beyond Limit

```javascript
// ❌ Validation only, user can still type beyond limit
const form = Forms.create(
  { tweet: '' },
  { tweet: Forms.v.maxLength(280) }
);

// ✅ Enforce hard limit on input
tweetInput.addEventListener('input', (e) => {
  if (e.target.value.length > 280) {
    e.target.value = e.target.value.substring(0, 280);
  }
  form.handleChange(e);
});
```

 

### Pitfall 2: Not Showing Remaining Characters

```javascript
// ❌ User doesn't know how many characters left
errorDiv.textContent = 'Too long';

// ✅ Show helpful counter
effect(() => {
  const remaining = 280 - form.values.tweet.length;
  counter.textContent = `${remaining} characters remaining`;
});
```

 

### Pitfall 3: Inconsistent Limits Across Platform

```javascript
// ❌ Different limits in different places
// Frontend: 500 chars
// Backend API: 300 chars

// ✅ Use shared constant
const MAX_BIO_LENGTH = 500;

// Frontend
Forms.v.maxLength(MAX_BIO_LENGTH)

// Backend should use same constant
```

 

### Pitfall 4: Not Handling Emoji/Unicode

```javascript
// ❌ Regular length counts UTF-16 units
'👨‍👩‍👧‍👦'.length // 11 (not 1!)

// ✅ Use Unicode-aware counting
Array.from('👨‍👩‍👧‍👦').length // 7 (better, but still complex)

// For accurate emoji counting, use library like grapheme-splitter
```

 

### Pitfall 5: No Visual Feedback

```javascript
// ❌ Silent validation, user confused
Forms.v.maxLength(100)

// ✅ Always show character counter
effect(() => {
  const length = form.values.field.length;
  charCounter.textContent = `${length} / 100`;
});
```

 

## Summary

### Key Takeaways

1. **Enforces maximum length** - prevents exceeding character/item limit
2. **Allows empty values** - combine with `required()` if needed
3. **Works with strings and arrays** - checks `.length` property
4. **Should show counter** - users need to know their limit
5. **Common for UX** - prevents data truncation

### When to Use maxLength()

✅ **Use for:**
- Tweet/post character limits
- Username length constraints
- Bio/description fields
- Comment sections
- SMS-length messages

❌ **Don't use when:**
- No practical length limit
- Need exact length (use pattern)
- Validating numbers (use `max()` instead)

### Common Max Length Values

| Field | Max Length | Reason |
|  -|    |  --|
| Username | 15-20 | Display/readability |
| Tweet | 280 | Platform standard |
| Bio | 500-2000 | Meaningful content |
| Comment | 1000-5000 | Discussion depth |
| SMS | 160 | Technical limit |
| Email subject | 78 | Email standard |

### Related Validators

- **`Validators.minLength()`** - Minimum length
- **`Validators.pattern()`** - Exact length with regex
- **`Validators.combine()`** - Min + Max range
- **`Validators.custom()`** - Complex length rules

### One-Line Rule

> **`Validators.maxLength(max, message)` creates a validator that ensures a value doesn't exceed the specified number of characters or items, preventing data loss and enforcing UX constraints.**

 

**What's Next?**

- Combine with `minLength()` for length ranges
- Add visual character counters
- Implement auto-truncation on paste
