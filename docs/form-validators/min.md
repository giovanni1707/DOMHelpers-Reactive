# Validators.min()

## Quick Start (30 seconds)

```javascript
const form = Forms.create(
  {
    age: 0,
    quantity: 0,
    price: 0
  },
  {
    age: Forms.v.min(18, 'You must be at least 18 years old'),
    quantity: Forms.v.min(1, 'Quantity must be at least 1'),
    price: Forms.v.min(0.01, 'Price must be at least $0.01')
  }
);

// Too low
form.setValue('age', 16);
form.validateField('age');
console.log(form.getError('age')); // "You must be at least 18 years old"

// Valid
form.setValue('age', 18);
form.validateField('age');
console.log(form.hasError('age')); // false
```

**What just happened?** `Validators.min()` ensured the numeric value is at least the minimum required!

 

## What is Validators.min()?

`Validators.min()` is a **built-in validator that enforces minimum numeric values**.

Simply put, it ensures numbers meet a minimum threshold, returning an error when too low.

**Key characteristics:**
- ✅ Validates minimum numeric value
- ✅ Works with numbers, not strings
- ✅ Custom error message
- ✅ Allows empty values
- ✅ Commonly used for age, quantity, price

 

## Syntax

```javascript
// Create min validator
const validator = Forms.v.min(18, 'Must be at least 18');

// Use in form
const form = Forms.create(
  { age: 0 },
  { age: Forms.v.min(18, 'You must be 18 or older') }
);

// Default message
const validator = Forms.v.min(0); // "Must be at least 0"
```

**Parameters:**
- `min` (number) - Minimum allowed value (inclusive)
- `message` (string, optional) - Custom error message

**Returns:** `function(value) => string` - Validator function

 

## Why Does This Exist?

### The Challenge

```javascript
// ❌ Manual minimum validation - repetitive
const form = Forms.create(
  {
    age: 0,
    quantity: 0,
    rating: 0
  },
  {
    age: (value) => {
      if (value !== '' && value < 18) {
        return 'Must be at least 18';
      }
      return '';
    },
    quantity: (value) => {
      if (value !== '' && value < 1) {
        return 'Must be at least 1';
      }
      return '';
    },
    rating: (value) => {
      if (value !== '' && value < 1) {
        return 'Must be at least 1';
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
    age: 0,
    quantity: 0,
    rating: 0
  },
  {
    age: Forms.v.min(18, 'Must be at least 18'),
    quantity: Forms.v.min(1, 'Must be at least 1'),
    rating: Forms.v.min(1, 'Must be at least 1')
  }
);
```

 

## How Does It Work?

```javascript
function min(minValue, message) {
  const defaultMessage = `Must be at least ${minValue}`;

  return function(value) {
    if (value === '' || value === null || value === undefined) {
      return ''; // Allow empty
    }

    const numValue = Number(value);

    if (numValue < minValue) {
      return message || defaultMessage;
    }

    return '';
  };
}
```

 

## Basic Usage

### Example 1: Age Validation

```javascript
const form = Forms.create(
  { age: 0 },
  { age: Forms.v.min(18, 'You must be 18 or older') }
);

form.setValue('age', 16);
console.log(form.hasError('age')); // true

form.setValue('age', 18);
console.log(form.hasError('age')); // false
```

 

### Example 2: Quantity Validation

```javascript
const form = Forms.create(
  { quantity: 0 },
  { quantity: Forms.v.min(1, 'Quantity must be at least 1') }
);

effect(() => {
  const qty = form.values.quantity;
  totalPrice.textContent = `$${(qty * unitPrice).toFixed(2)}`;
});
```

 

### Example 3: Price Validation

```javascript
const form = Forms.create(
  { price: 0 },
  { price: Forms.v.min(0.01, 'Price must be at least $0.01') }
);
```

 

### Example 4: Rating System

```javascript
const form = Forms.create(
  { rating: 0 },
  { rating: Forms.v.min(1, 'Rating must be at least 1 star') }
);

// Star rating UI
stars.forEach((star, index) => {
  star.addEventListener('click', () => {
    form.setValue('rating', index + 1);
  });
});
```

 

### Example 5: Percentage Validation

```javascript
const form = Forms.create(
  { discount: 0 },
  {
    discount: Forms.v.combine(
      Forms.v.min(0, 'Discount cannot be negative'),
      Forms.v.max(100, 'Discount cannot exceed 100%')
    )
  }
);
```

 

## Advanced Patterns

### Pattern 1: Dynamic Minimum Based on Other Field

```javascript
const form = Forms.create(
  {
    minPrice: 0,
    maxPrice: 0
  },
  {
    minPrice: Forms.v.min(0, 'Minimum price must be positive'),
    maxPrice: (value, allValues) => {
      if (value === '' || value === null) return '';

      const minError = Forms.v.min(0, 'Maximum price must be positive')(value);
      if (minError) return minError;

      if (Number(value) < Number(allValues.minPrice)) {
        return 'Maximum price must be greater than minimum price';
      }

      return '';
    }
  }
);
```

 

### Pattern 2: Age Gate with Visual Feedback

```javascript
const form = Forms.create(
  { age: 0 },
  { age: Forms.v.min(18, 'You must be 18 or older to proceed') }
);

effect(() => {
  const age = form.values.age;

  if (age >= 18) {
    ageGate.classList.add('valid');
    continueButton.disabled = false;
  } else if (age > 0) {
    ageGate.classList.add('invalid');
    continueButton.disabled = true;
  } else {
    ageGate.classList.remove('valid', 'invalid');
    continueButton.disabled = true;
  }
});
```

 

### Pattern 3: Stock Quantity Validation

```javascript
const availableStock = 50;

const form = Forms.create(
  { quantity: 0 },
  {
    quantity: (value) => {
      if (!value) return '';

      const minError = Forms.v.min(1, 'Quantity must be at least 1')(value);
      if (minError) return minError;

      if (Number(value) > availableStock) {
        return `Only ${availableStock} items available`;
      }

      return '';
    }
  }
);

effect(() => {
  const qty = form.values.quantity;
  stockIndicator.textContent = `${availableStock - qty} remaining`;
});
```

 

### Pattern 4: Sliding Scale Validator

```javascript
const form = Forms.create(
  { score: 0 },
  { score: Forms.v.min(0, 'Score cannot be negative') }
);

sliderInput.addEventListener('input', (e) => {
  form.setValue('score', Number(e.target.value));

  const percentage = (e.target.value / e.target.max) * 100;

  sliderTrack.style.background = `linear-gradient(to right,
    #4CAF50 0%,
    #4CAF50 ${percentage}%,
    #ddd ${percentage}%,
    #ddd 100%
  )`;
});
```

 

### Pattern 5: Minimum with Currency Formatting

```javascript
const form = Forms.create(
  { donation: 0 },
  { donation: Forms.v.min(5, 'Minimum donation is $5') }
);

donationInput.addEventListener('blur', (e) => {
  const value = Number(e.target.value);

  if (value) {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);

    formattedDisplay.textContent = formatted;
  }
});
```

 

### Pattern 6: Progressive Discount Based on Minimum

```javascript
const form = Forms.create(
  { orderAmount: 0 },
  { orderAmount: Forms.v.min(0, 'Amount cannot be negative') }
);

effect(() => {
  const amount = form.values.orderAmount;
  let discount = 0;

  if (amount >= 100) {
    discount = 20;
  } else if (amount >= 50) {
    discount = 10;
  } else if (amount >= 25) {
    discount = 5;
  }

  discountBadge.textContent = discount > 0 ? `${discount}% OFF` : 'No discount';

  const total = amount - (amount * discount / 100);
  totalDisplay.textContent = `$${total.toFixed(2)}`;
});
```

 

### Pattern 7: Bidding Minimum Increment

```javascript
const currentBid = 100;
const minIncrement = 5;

const form = Forms.create(
  { bid: 0 },
  {
    bid: (value) => {
      if (!value) return '';

      const minBid = currentBid + minIncrement;
      const minError = Forms.v.min(minBid, `Bid must be at least $${minBid}`)(value);

      return minError;
    }
  }
);

effect(() => {
  const bid = form.values.bid;

  if (bid >= currentBid + minIncrement) {
    bidButton.disabled = false;
    bidButton.textContent = `Place Bid: $${bid}`;
  } else {
    bidButton.disabled = true;
    bidButton.textContent = `Minimum Bid: $${currentBid + minIncrement}`;
  }
});
```

 

### Pattern 8: Temperature Range Validator

```javascript
const form = Forms.create(
  {
    temperature: 0,
    unit: 'celsius'
  },
  {
    temperature: (value, allValues) => {
      if (!value && value !== 0) return '';

      const limits = {
        celsius: { min: -273.15, max: 1000 },
        fahrenheit: { min: -459.67, max: 1832 },
        kelvin: { min: 0, max: 1273.15 }
      };

      const { min, max } = limits[allValues.unit];

      if (Number(value) < min) {
        return `Temperature cannot be below ${min}°${allValues.unit[0].toUpperCase()}`;
      }

      if (Number(value) > max) {
        return `Temperature cannot exceed ${max}°${allValues.unit[0].toUpperCase()}`;
      }

      return '';
    }
  }
);
```

 

### Pattern 9: Real-Time Minimum Indicator

```javascript
const form = Forms.create(
  { amount: 0 },
  { amount: Forms.v.min(10, 'Minimum amount is $10') }
);

effect(() => {
  const amount = form.values.amount;
  const min = 10;
  const percentage = Math.min(100, (amount / min) * 100);

  progressBar.style.width = `${percentage}%`;

  if (amount >= min) {
    progressBar.classList.add('reached');
    statusText.textContent = 'Minimum reached ✓';
  } else if (amount > 0) {
    progressBar.classList.remove('reached');
    const needed = min - amount;
    statusText.textContent = `$${needed.toFixed(2)} more needed`;
  } else {
    progressBar.classList.remove('reached');
    statusText.textContent = `Minimum: $${min}`;
  }
});
```

 

### Pattern 10: Multi-Tier Validation

```javascript
function tieredMinValidator(tiers, fieldName) {
  return (value) => {
    if (!value && value !== 0) return '';

    const numValue = Number(value);

    for (const tier of tiers) {
      if (numValue < tier.min) {
        return tier.message || `${fieldName} must be at least ${tier.min}`;
      }

      if (tier.max && numValue <= tier.max) {
        return tier.warning || '';
      }
    }

    return '';
  };
}

const form = Forms.create(
  { investment: 0 },
  {
    investment: tieredMinValidator([
      { min: 0, message: 'Investment cannot be negative' },
      { min: 100, max: 999, warning: 'Consider investing more for better returns' },
      { min: 1000 }
    ], 'Investment')
  }
);
```

 

## Common Pitfalls

### Pitfall 1: Validating String Length Instead of Number

```javascript
// ❌ Wrong validator - min() is for numbers
const form = Forms.create(
  { username: '' },
  { username: Forms.v.min(3, 'Too short') }
);
// This won't work correctly!

// ✅ Use minLength for strings
const form = Forms.create(
  { username: '' },
  { username: Forms.v.minLength(3, 'Too short') }
);
```

 

### Pitfall 2: Not Handling Empty Values

```javascript
// ❌ min() allows empty by default
const form = Forms.create(
  { age: '' },
  { age: Forms.v.min(18) }
);

form.validate();
console.log(form.isValid); // true! Empty is allowed

// ✅ Combine with required
const form = Forms.create(
  { age: '' },
  {
    age: Forms.v.combine(
      Forms.v.required('Age is required'),
      Forms.v.min(18, 'Must be 18+')
    )
  }
);
```

 

### Pitfall 3: Inclusive vs Exclusive Minimum

```javascript
// ❌ Confusing message
Forms.v.min(18, 'Must be over 18')
// User enters 18 - is that valid? YES (min is inclusive)

// ✅ Clear message
Forms.v.min(18, 'Must be 18 or older')
// or
Forms.v.min(19, 'Must be over 18')
```

 

### Pitfall 4: Comparing Strings as Numbers

```javascript
// ❌ Form stores strings
const form = Forms.create({ age: '16' });

form.setValue('age', '5'); // String '5'
// String comparison: '5' > '16' is false, but Number('5') < 16

// ✅ Convert to number
ageInput.addEventListener('input', (e) => {
  form.setValue('age', Number(e.target.value));
});
```

 

### Pitfall 5: Wrong Error Message Context

```javascript
// ❌ Generic message
Forms.v.min(1, 'Too low')

// ✅ Contextual message
Forms.v.min(1, 'Quantity must be at least 1')
Forms.v.min(18, 'You must be 18 or older')
Forms.v.min(0.01, 'Price must be at least $0.01')
```

 

## Summary

### Key Takeaways

1. **Validates minimum numeric values** - ensures numbers meet threshold
2. **Inclusive minimum** - value can equal the minimum
3. **Allows empty values** - combine with `required()` if needed
4. **For numbers only** - use `minLength()` for strings
5. **Common for business rules** - age, quantity, price constraints

### When to Use min()

✅ **Use for:**
- Age verification
- Quantity minimums
- Price floors
- Rating systems
- Numeric thresholds

❌ **Don't use when:**
- Validating string length (use `minLength()`)
- Need exclusive minimum (value > min, not >=)
- Non-numeric values

### Common Use Cases

| Field | Minimum | Reason |
|  -|   |  --|
| Age | 18 | Legal requirement |
| Quantity | 1 | Must order at least 1 |
| Price | 0.01 | Cannot be free |
| Rating | 1 | Minimum 1 star |
| Discount | 0 | Cannot be negative |
| Stock | 0 | Cannot have negative inventory |

### Related Validators

- **`Validators.max()`** - Maximum numeric value
- **`Validators.minLength()`** - Minimum string length
- **`Validators.required()`** - Ensure value exists
- **`Validators.combine()`** - Min + Max range

### One-Line Rule

> **`Validators.min(minValue, message)` creates a validator that ensures a numeric value is at least the specified minimum (inclusive), allowing empty values unless combined with `required()`.**

 

**What's Next?**

- Combine with `max()` for numeric ranges
- Add visual indicators for minimum thresholds
- Implement progressive pricing/discounts
