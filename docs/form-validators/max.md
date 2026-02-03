# Validators.max()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    age: 0,
    quantity: 0,
    discount: 0
  },
  {
    age: Forms.v.max(120, 'Age must be 120 or less'),
    quantity: Forms.v.max(99, 'Maximum quantity is 99'),
    discount: Forms.v.max(100, 'Discount cannot exceed 100%')
  }
);

// Too high
form.setValue('discount', 150);
form.validateField('discount');
console.log(form.getError('discount')); // "Discount cannot exceed 100%"

// Valid
form.setValue('discount', 50);
form.validateField('discount');
console.log(form.hasError('discount')); // false
```

**What just happened?** `Validators.max()` ensured the numeric value doesn't exceed the maximum allowed!

 

## What is Validators.max()?

`Validators.max()` is a **built-in validator that enforces maximum numeric values**.

Simply put, it prevents numbers from exceeding a threshold, returning an error when too high.

**Key characteristics:**
- ✅ Validates maximum numeric value
- ✅ Works with numbers, not strings
- ✅ Custom error message
- ✅ Allows empty values
- ✅ Commonly used for limits and caps

 

## Syntax

```javascript
// Create max validator
const validator = Forms.v.max(100, 'Must be 100 or less');

// Use in form
const form = Forms.create(
  { discount: 0 },
  { discount: Forms.v.max(100, 'Discount cannot exceed 100%') }
);

// Default message
const validator = Forms.v.max(99); // "Must be 99 or less"
```

**Parameters:**
- `max` (number) - Maximum allowed value (inclusive)
- `message` (string, optional) - Custom error message

**Returns:** `function(value) => string` - Validator function

 

## Why Does This Exist?

### The Challenge

```javascript
// ❌ Manual maximum validation
const form = Forms.create(
  {
    discount: 0,
    quantity: 0,
    rating: 0
  },
  {
    discount: (value) => {
      if (value !== '' && value > 100) {
        return 'Cannot exceed 100%';
      }
      return '';
    },
    quantity: (value) => {
      if (value !== '' && value > 99) {
        return 'Max 99';
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
    discount: 0,
    quantity: 0,
    rating: 0
  },
  {
    discount: Forms.v.max(100, 'Cannot exceed 100%'),
    quantity: Forms.v.max(99, 'Max 99'),
    rating: Forms.v.max(5, 'Max 5 stars')
  }
);
```

 

## How Does It Work?

```javascript
function max(maxValue, message) {
  const defaultMessage = `Must be ${maxValue} or less`;

  return function(value) {
    if (value === '' || value === null || value === undefined) {
      return '';
    }

    const numValue = Number(value);

    if (numValue > maxValue) {
      return message || defaultMessage;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Discount Cap

```javascript
const form = Forms.create(
  { discount: 0 },
  { discount: Forms.v.max(100, 'Discount cannot exceed 100%') }
);
```

 

### Example 2: Quantity Limit

```javascript
const form = Forms.create(
  { quantity: 0 },
  { quantity: Forms.v.max(99, 'Maximum 99 items per order') }
);
```

 

### Example 3: Age Limit

```javascript
const form = Forms.create(
  { age: 0 },
  {
    age: Forms.v.combine(
      Forms.v.min(0, 'Age cannot be negative'),
      Forms.v.max(120, 'Please enter a valid age')
    )
  }
);
```

 

### Example 4: Rating System

```javascript
const form = Forms.create(
  { rating: 0 },
  {
    rating: Forms.v.combine(
      Forms.v.min(1, 'Minimum 1 star'),
      Forms.v.max(5, 'Maximum 5 stars')
    )
  }
);
```

 

### Example 5: Percentage Input

```javascript
const form = Forms.create(
  { percentage: 0 },
  {
    percentage: Forms.v.combine(
      Forms.v.min(0, 'Cannot be negative'),
      Forms.v.max(100, 'Cannot exceed 100%')
    )
  }
);
```

 

## Advanced Patterns

### Pattern 1: Stock Limit Enforcement

```javascript
const MAX_STOCK = 50;

const form = Forms.create(
  { quantity: 0 },
  {
    quantity: Forms.v.max(MAX_STOCK, `Only ${MAX_STOCK} items in stock`)
  }
);

effect(() => {
  const qty = form.values.quantity;
  const remaining = MAX_STOCK - qty;

  stockIndicator.textContent = remaining > 0
    ? `${remaining} remaining`
    : 'Out of stock';

  if (remaining < 5 && remaining > 0) {
    stockIndicator.classList.add('low-stock');
  }
});
```

 

### Pattern 2: Dynamic Maximum Based on Plan

```javascript
const planLimits = {
  free: 5,
  basic: 25,
  premium: 100,
  enterprise: Infinity
};

function createFormForPlan(plan) {
  const maxItems = planLimits[plan];

  return Forms.create(
    { items: 0 },
    {
      items: maxItems === Infinity
        ? () => ''
        : Forms.v.max(maxItems, `${plan} plan: max ${maxItems} items`)
    }
  );
}

const userForm = createFormForPlan(currentUserPlan);
```

 

### Pattern 3: Progressive Warning System

```javascript
const form = Forms.create(
  { temperature: 0 },
  { temperature: Forms.v.max(100, 'Temperature too high!') }
);

effect(() => {
  const temp = form.values.temperature;
  const max = 100;
  const percentage = (temp / max) * 100;

  if (percentage >= 100) {
    tempIndicator.className = 'critical';
    tempIndicator.textContent = '🔴 CRITICAL';
  } else if (percentage >= 90) {
    tempIndicator.className = 'danger';
    tempIndicator.textContent = '🟠 DANGER';
  } else if (percentage >= 75) {
    tempIndicator.className = 'warning';
    tempIndicator.textContent = '🟡 WARNING';
  } else {
    tempIndicator.className = 'normal';
    tempIndicator.textContent = '🟢 NORMAL';
  }
});
```

 

### Pattern 4: File Size Limit

```javascript
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const form = Forms.create(
  { fileSize: 0 },
  {
    fileSize: Forms.v.max(
      MAX_FILE_SIZE_BYTES,
      `File size cannot exceed ${MAX_FILE_SIZE_MB}MB`
    )
  }
);

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];

  if (file) {
    form.setValue('fileSize', file.size);

    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    sizeDisplay.textContent = `${sizeMB}MB / ${MAX_FILE_SIZE_MB}MB`;
  }
});
```

 

### Pattern 5: Bid Maximum

```javascript
const MAX_BID = 10000;

const form = Forms.create(
  { bid: 0 },
  {
    bid: Forms.v.combine(
      Forms.v.min(1, 'Minimum bid is $1'),
      Forms.v.max(MAX_BID, `Maximum bid is $${MAX_BID}`)
    )
  }
);

effect(() => {
  const bid = form.values.bid;

  if (bid > MAX_BID * 0.9) {
    warningDiv.textContent = '⚠️ Approaching maximum bid limit';
    warningDiv.style.display = 'block';
  } else {
    warningDiv.style.display = 'none';
  }
});
```

 

### Pattern 6: Capacity Gauge

```javascript
const form = Forms.create(
  { attendees: 0 },
  { attendees: Forms.v.max(100, 'Event capacity is 100 people') }
);

effect(() => {
  const count = form.values.attendees;
  const capacity = 100;
  const percentage = (count / capacity) * 100;

  capacityBar.style.width = `${Math.min(100, percentage)}%`;

  if (percentage >= 100) {
    capacityBar.classList.add('full');
    statusText.textContent = 'FULL';
  } else if (percentage >= 90) {
    capacityBar.classList.add('almost-full');
    statusText.textContent = `${capacity - count} spots left`;
  } else {
    capacityBar.classList.remove('full', 'almost-full');
    statusText.textContent = `${count} / ${capacity}`;
  }
});
```

 

### Pattern 7: Credit Limit Checker

```javascript
const CREDIT_LIMIT = 5000;

const form = Forms.create(
  { purchaseAmount: 0 },
  {
    purchaseAmount: (value) => {
      if (!value) return '';

      const currentBalance = 2000; // Fetch from backend
      const availableCredit = CREDIT_LIMIT - currentBalance;

      const maxError = Forms.v.max(
        availableCredit,
        `Purchase exceeds available credit: $${availableCredit}`
      )(value);

      return maxError;
    }
  }
);
```

 

### Pattern 8: Time Slot Duration Limit

```javascript
const MAX_DURATION_HOURS = 4;

const form = Forms.create(
  { duration: 0 },
  {
    duration: Forms.v.max(
      MAX_DURATION_HOURS,
      `Booking cannot exceed ${MAX_DURATION_HOURS} hours`
    )
  }
);

durationSlider.addEventListener('input', (e) => {
  const hours = Number(e.target.value);
  form.setValue('duration', hours);

  const endTime = addHours(startTime, hours);
  endTimeDisplay.textContent = formatTime(endTime);
});
```

 

### Pattern 9: Slider with Max Constraint

```javascript
const form = Forms.create(
  { brightness: 100 },
  {
    brightness: Forms.v.combine(
      Forms.v.min(0, 'Minimum brightness is 0%'),
      Forms.v.max(100, 'Maximum brightness is 100%')
    )
  }
);

brightnessSlider.max = 100;

brightnessSlider.addEventListener('input', (e) => {
  const value = Number(e.target.value);
  form.setValue('brightness', value);

  displayElement.style.opacity = value / 100;
  valueDisplay.textContent = `${value}%`;
});
```

 

### Pattern 10: Multi-Field Maximum Constraint

```javascript
const TOTAL_BUDGET = 1000;

const form = Forms.create(
  {
    marketing: 0,
    development: 0,
    operations: 0
  },
  {
    marketing: (value, allValues) => {
      if (!value) return '';

      const total =
        Number(value) +
        Number(allValues.development || 0) +
        Number(allValues.operations || 0);

      if (total > TOTAL_BUDGET) {
        return `Total budget cannot exceed $${TOTAL_BUDGET}`;
      }

      return '';
    },
    // Same validator for other fields
    development: (value, allValues) => {
      if (!value) return '';

      const total =
        Number(allValues.marketing || 0) +
        Number(value) +
        Number(allValues.operations || 0);

      if (total > TOTAL_BUDGET) {
        return `Total budget cannot exceed $${TOTAL_BUDGET}`;
      }

      return '';
    }
  }
);

effect(() => {
  const total =
    (form.values.marketing || 0) +
    (form.values.development || 0) +
    (form.values.operations || 0);

  totalDisplay.textContent = `$${total} / $${TOTAL_BUDGET}`;
  remainingDisplay.textContent = `$${TOTAL_BUDGET - total} remaining`;
});
```

 

## Common Pitfalls

### Pitfall 1: Using max() for String Length

```javascript
// ❌ Wrong validator
const form = Forms.create(
  { bio: '' },
  { bio: Forms.v.max(500) }
);
// This validates numeric value, not string length!

// ✅ Use maxLength for strings
const form = Forms.create(
  { bio: '' },
  { bio: Forms.v.maxLength(500) }
);
```

 

### Pitfall 2: Not Enforcing on Input

```javascript
// ❌ Validation only, user can still enter 999
const form = Forms.create(
  { quantity: 0 },
  { quantity: Forms.v.max(99) }
);

// ✅ Enforce limit on input
quantityInput.max = 99;
quantityInput.addEventListener('input', (e) => {
  if (Number(e.target.value) > 99) {
    e.target.value = 99;
  }
  form.handleChange(e);
});
```

 

### Pitfall 3: Inclusive vs Exclusive Maximum

```javascript
// ❌ Confusing message
Forms.v.max(100, 'Must be under 100')
// User enters 100 - is that valid? YES (max is inclusive)

// ✅ Clear message
Forms.v.max(100, 'Must be 100 or less')
// or
Forms.v.max(99, 'Must be under 100')
```

 

### Pitfall 4: Not Showing Maximum to User

```javascript
// ❌ Hidden limit, user frustrated
Forms.v.max(99, 'Quantity too high')

// ✅ Show the limit
Forms.v.max(99, 'Maximum quantity is 99')

// ✅ Even better - show in UI
<input type="number" max="99" />
<span>Max: 99</span>
```

 

### Pitfall 5: Hardcoded Maximum Values

```javascript
// ❌ Hardcoded everywhere
Forms.v.max(100, 'Max is 100')
Forms.v.max(100, 'Cannot exceed 100')

// ✅ Use constant
const MAX_DISCOUNT = 100;
Forms.v.max(MAX_DISCOUNT, `Maximum discount is ${MAX_DISCOUNT}%`)
```

 

## Summary

### Key Takeaways

1. **Validates maximum numeric values** - prevents exceeding limits
2. **Inclusive maximum** - value can equal the maximum
3. **Allows empty values** - combine with `required()` if needed
4. **For numbers only** - use `maxLength()` for strings
5. **Common for limits** - caps, quotas, constraints

### When to Use max()

✅ **Use for:**
- Discount caps
- Quantity limits
- Age limits
- Rating ceilings
- Percentage limits

❌ **Don't use when:**
- Validating string length (use `maxLength()`)
- Need exclusive maximum (value < max, not <=)
- Non-numeric values

### Common Maximum Values

| Field | Maximum | Reason |
|  -|   |  --|
| Discount | 100 | Cannot exceed 100% |
| Rating | 5 | 5-star system |
| Age | 120 | Reasonable limit |
| Quantity | 99 | Cart limit |
| Percentage | 100 | By definition |
| Temperature (°C) | 100 | Water boiling point |

### Related Validators

- **`Validators.min()`** - Minimum numeric value
- **`Validators.maxLength()`** - Maximum string length
- **`Validators.required()`** - Ensure value exists
- **`Validators.combine()`** - Min + Max range

### One-Line Rule

> **`Validators.max(maxValue, message)` creates a validator that ensures a numeric value doesn't exceed the specified maximum (inclusive), allowing empty values unless combined with `required()`.**

 

**What's Next?**

- Combine with `min()` for numeric ranges
- Add visual limit indicators
- Implement progressive warnings
