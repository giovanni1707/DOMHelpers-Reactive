# `computedCollection(items, computed)` - Collection with Computed Properties

## Quick Start (30 seconds)

```javascript
// Create collection with computed properties
const cart = computedCollection(
  [
    { name: 'Widget', price: 10, qty: 2 },
    { name: 'Gadget', price: 20, qty: 1 }
  ],
  {
    // Computed properties auto-update
    subtotal() {
      return this.items.reduce((sum, item) => 
        sum + (item.price * item.qty), 0
      );
    },
    
    tax() {
      return this.subtotal * 0.08;
    },
    
    total() {
      return this.subtotal + this.tax;
    },
    
    itemCount() {
      return this.items.reduce((sum, item) => sum + item.qty, 0);
    }
  }
);

console.log(cart.subtotal);   // 40
console.log(cart.tax);        // 3.2
console.log(cart.total);      // 43.2
console.log(cart.itemCount);  // 3

// Add item - computed values update automatically!
cart.add({ name: 'Tool', price: 15, qty: 1 });

console.log(cart.subtotal);   // 55 (auto-updated!)
console.log(cart.total);      // 59.4 (auto-updated!)
console.log(cart.itemCount);  // 4 (auto-updated!) ✨
```

**What just happened?** You created a collection where calculated values automatically update when items change!

 

## What is `computedCollection(items, computed)`?

`computedCollection()` creates a **reactive collection with derived values** that automatically recalculate when the underlying data changes.

Simply put: it's a collection where you define calculations once, and they stay up-to-date forever.

Think of it as **a smart spreadsheet** - you define formulas (computed properties), and they automatically update when the data changes, just like Excel!

 

## Syntax

```javascript
computedCollection(items = [], computed = {})
```

**Available as:**
```javascript
// Global function (if available)
const collection = computedCollection(items, computed);

// Collections namespace
const collection = Collections.createWithComputed(items, computed);
```

**Parameters:**
- `items` (Array, optional) - Initial items. Default: `[]`
- `computed` (Object, optional) - Computed property definitions. Default: `{}`

**Computed Object Structure:**
```javascript
{
  propertyName() {
    // Use this.items to access the items
    return calculated value;
  }
}
```

**Returns:** 
- Reactive collection with `.items` array, all collection methods, and computed properties

 
## Why Does This Exist?

### Two Approaches to Derived Values in Collections

The Reactive library offers flexible ways to work with calculated values from collections, each suited to different scenarios.

### Function-Based Calculations

When you need **on-demand calculations** and want explicit control over when values are computed:
```javascript
// Create a collection
const cart = createCollection([
  { name: 'Widget', price: 10, qty: 2 },
  { name: 'Gadget', price: 20, qty: 1 }
]);

// Define calculation functions
function calculateTotal() {
  return cart.items.reduce((sum, item) => 
    sum + (item.price * item.qty), 0
  );
}

let total = calculateTotal();
console.log(total);  // 40

// Add item
cart.add({ name: 'Tool', price: 15, qty: 1 });

// Recalculate when needed
total = calculateTotal();
console.log(total);  // 55

// Use in effects
effect(() => {
  const currentTotal = calculateTotal();
  document.getElementById('total').textContent = currentTotal;
});
```

**This approach is great when you need:**
✅ Explicit control over when calculations run
✅ On-demand computation for performance
✅ Calculations that depend on external factors
✅ Standard function-based patterns

### When Auto-Updating Derived Values Fit Your Workflow

In scenarios where you want **derived values that stay synchronized automatically** with collection changes, `computedCollection()` provides a more direct approach:
```javascript
// Collection with computed properties
const cart = computedCollection(
  [
    { name: 'Widget', price: 10, qty: 2 },
    { name: 'Gadget', price: 20, qty: 1 }
  ],
  {
    total() {
      return this.items.reduce((sum, item) => 
        sum + (item.price * item.qty), 0
      );
    }
  }
);

console.log(cart.total);  // 40

// Add item - total updates automatically
cart.add({ name: 'Tool', price: 15, qty: 1 });

console.log(cart.total);  // 55 (auto-updated!)

// In effects, use as a property
effect(() => {
  document.getElementById('total').textContent = cart.total;
  // Always current, reactively updates
});
```

**This method is especially useful when:**
```
computedCollection Flow:
┌──────────────────────┐
│ Define computed      │
│ properties once      │
└──────────┬───────────┘
           │
           ▼
   Collection changes
           │
           ▼
   Computed values
   auto-recalculate
           │
           ▼
  ✅ Always synchronized
```

**Where computedCollection() shines:**
✅ **Automatic synchronization** - Derived values stay current with changes
✅ **Property-based access** - Use `cart.total` instead of `calculateTotal()`
✅ **Centralized logic** - Calculations defined with the collection
✅ **Reactive by default** - Works seamlessly with effects and watchers
✅ **Clean syntax** - Access computed values like regular properties

**The Choice is Yours:**
- Use function-based calculations when you need explicit control over when values compute
- Use `computedCollection()` when you want auto-synchronized derived values
- Both approaches work with reactive collections

**Benefits of the computedCollection approach:**
✅ **Define once, use everywhere** - Computed logic in one place
✅ **Automatic recalculation** - Values update when collection changes
✅ **Property syntax** - Access like `cart.total`, not `calculateTotal()`
✅ **Reactive integration** - Works seamlessly with effects and watchers
✅ **Consistent state** - Derived values never out of sync
## Mental Model

Think of computed collections as **a smart spreadsheet with live formulas**:

### Without Computed (Manual Calculator)
```
Items                     Total
[Widget: $20]        →    Must calculate manually
[Gadget: $20]        →    Must recalculate each time
                          Must remember to update
                          ❌ Easy to forget
```

### With Computed (Smart Spreadsheet)
```
Items                     Total (auto-calculated)
[Widget: $20]        →    =SUM(items)
[Gadget: $20]        →    Always current
Add [Tool: $15]      →    Automatically updates to $55
                          ✅ Never out of sync
```

**Key Insight:** Computed properties are like spreadsheet formulas - define them once, and they auto-update forever.

 

## How Does It Work?

### Creation Process

```
1️⃣ Create base collection
   createCollection(items)
        ↓
2️⃣ Add computed properties
   For each computed definition:
   - Create reactive property
   - Set up auto-recalculation
        ↓
3️⃣ Return enhanced collection
   {
     items: [...],
     add(), remove(), ...
     computedProp1,  // Auto-updating
     computedProp2   // Auto-updating
   }
```

### Auto-Update Mechanism

```
When you access cart.total:
     ↓
System checks if recalculation needed
     ↓
If items changed: Recalculate
If items same: Return cached value
     ↓
Return current value
```

### Dependency Tracking

```
Computed Property
       ↓
Uses this.items
       ↓
Tracks items array
       ↓
When items changes
       ↓
Marks computed as "dirty"
       ↓
Next access recalculates ✨
```

 

## Basic Usage

### Example 1: Simple Statistics

```javascript
const scores = computedCollection(
  [85, 92, 78, 95, 88],
  {
    average() {
      if (this.items.length === 0) return 0;
      const sum = this.items.reduce((a, b) => a + b, 0);
      return sum / this.items.length;
    },
    
    highest() {
      return Math.max(...this.items);
    },
    
    lowest() {
      return Math.min(...this.items);
    },
    
    range() {
      return this.highest - this.lowest;
    }
  }
);

console.log('Average:', scores.average);   // 87.6
console.log('Highest:', scores.highest);   // 95
console.log('Lowest:', scores.lowest);     // 78
console.log('Range:', scores.range);       // 17

// Add new score
scores.add(100);

console.log('Average:', scores.average);   // 89.67 (updated!)
console.log('Highest:', scores.highest);   // 100 (updated!)
```

**What's happening?**
- Computed properties recalculate automatically
- No manual updates needed
- Statistics always current

 

### Example 2: Todo Statistics

```javascript
const todos = computedCollection(
  [
    { text: 'Task 1', done: false },
    { text: 'Task 2', done: true },
    { text: 'Task 3', done: false }
  ],
  {
    completedCount() {
      return this.items.filter(t => t.done).length;
    },
    
    pendingCount() {
      return this.items.filter(t => !t.done).length;
    },
    
    progress() {
      if (this.items.length === 0) return 0;
      return (this.completedCount / this.items.length) * 100;
    },
    
    isAllDone() {
      return this.items.length > 0 && 
             this.items.every(t => t.done);
    }
  }
);

console.log('Completed:', todos.completedCount);  // 1
console.log('Pending:', todos.pendingCount);      // 2
console.log('Progress:', todos.progress);         // 33.33%
console.log('All done?', todos.isAllDone);        // false

// Complete a task
todos.update(t => t.text === 'Task 1', { done: true });

console.log('Completed:', todos.completedCount);  // 2 (updated!)
console.log('Progress:', todos.progress);         // 66.67% (updated!)
```

 

### Example 3: Shopping Cart with Tax

```javascript
const cart = computedCollection([], {
  subtotal() {
    return this.items.reduce((sum, item) => 
      sum + (item.price * item.qty), 0
    );
  },
  
  tax() {
    return this.subtotal * 0.08;
  },
  
  shipping() {
    return this.subtotal > 50 ? 0 : 5.99;
  },
  
  total() {
    return this.subtotal + this.tax + this.shipping;
  },
  
  itemCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }
});

cart.add({ name: 'Widget', price: 10, qty: 2 });
cart.add({ name: 'Gadget', price: 20, qty: 1 });

console.log('Subtotal:', cart.subtotal);    // 40
console.log('Tax:', cart.tax);              // 3.2
console.log('Shipping:', cart.shipping);    // 5.99
console.log('Total:', cart.total);          // 49.19

// Add more to get free shipping
cart.add({ name: 'Tool', price: 15, qty: 1 });

console.log('Subtotal:', cart.subtotal);    // 55
console.log('Shipping:', cart.shipping);    // 0 (free!)
console.log('Total:', cart.total);          // 59.4
```

 

## Real-World Examples

### Example 1: Student Grade Book

```javascript
const grades = computedCollection([], {
  totalPoints() {
    return this.items.reduce((sum, g) => sum + g.points, 0);
  },
  
  maxPoints() {
    return this.items.reduce((sum, g) => sum + g.maxPoints, 0);
  },
  
  percentage() {
    if (this.maxPoints === 0) return 0;
    return (this.totalPoints / this.maxPoints) * 100;
  },
  
  letterGrade() {
    const pct = this.percentage;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  },
  
  isPassing() {
    return this.percentage >= 60;
  }
});

// Add assignments
grades.add({ name: 'Homework 1', points: 90, maxPoints: 100 });
grades.add({ name: 'Quiz 1', points: 18, maxPoints: 20 });
grades.add({ name: 'Midterm', points: 85, maxPoints: 100 });

console.log('Total:', grades.totalPoints, '/', grades.maxPoints);
console.log('Percentage:', grades.percentage.toFixed(1), '%');
console.log('Grade:', grades.letterGrade);
console.log('Passing?', grades.isPassing);

// Reactive display
effect(() => {
  document.getElementById('grade-display').innerHTML = `
    <div>Points: ${grades.totalPoints}/${grades.maxPoints}</div>
    <div>Percentage: ${grades.percentage.toFixed(1)}%</div>
    <div>Grade: ${grades.letterGrade}</div>
  `;
});
```

 

### Example 2: Inventory Dashboard

```javascript
const inventory = computedCollection([], {
  totalValue() {
    return this.items.reduce((sum, p) => 
      sum + (p.price * p.stock), 0
    );
  },
  
  totalItems() {
    return this.items.reduce((sum, p) => sum + p.stock, 0);
  },
  
  lowStockCount() {
    return this.items.filter(p => p.stock < 10).length;
  },
  
  outOfStockCount() {
    return this.items.filter(p => p.stock === 0).length;
  },
  
  needsReorder() {
    return this.items.filter(p => p.stock < p.reorderPoint);
  },
  
  categories() {
    const cats = new Set(this.items.map(p => p.category));
    return Array.from(cats);
  }
});

// Load products
inventory.add({ name: 'Widget', price: 10, stock: 5, reorderPoint: 10, category: 'Tools' });
inventory.add({ name: 'Gadget', price: 20, stock: 15, reorderPoint: 5, category: 'Electronics' });
inventory.add({ name: 'Tool', price: 15, stock: 0, reorderPoint: 8, category: 'Tools' });

console.log('Total Value:', inventory.totalValue);
console.log('Total Items:', inventory.totalItems);
console.log('Low Stock:', inventory.lowStockCount);
console.log('Out of Stock:', inventory.outOfStockCount);
console.log('Needs Reorder:', inventory.needsReorder.length);

// Dashboard updates automatically
effect(() => {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = `
    <div class="stat">
      <h3>Inventory Value</h3>
      <p>$${inventory.totalValue}</p>
    </div>
    <div class="stat">
      <h3>Total Items</h3>
      <p>${inventory.totalItems}</p>
    </div>
    <div class="stat ${inventory.lowStockCount > 0 ? 'warning' : ''}">
      <h3>Low Stock</h3>
      <p>${inventory.lowStockCount}</p>
    </div>
  `;
});
```

 

### Example 3: Time Tracker

```javascript
const timeEntries = computedCollection([], {
  totalMinutes() {
    return this.items.reduce((sum, entry) => sum + entry.minutes, 0);
  },
  
  totalHours() {
    return this.totalMinutes / 60;
  },
  
  formattedTime() {
    const hours = Math.floor(this.totalHours);
    const minutes = this.totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  },
  
  byProject() {
    const grouped = {};
    this.items.forEach(entry => {
      if (!grouped[entry.project]) {
        grouped[entry.project] = 0;
      }
      grouped[entry.project] += entry.minutes;
    });
    return grouped;
  },
  
  todaysHours() {
    const today = new Date().toDateString();
    return this.items
      .filter(e => new Date(e.date).toDateString() === today)
      .reduce((sum, e) => sum + e.minutes, 0) / 60;
  }
});

// Add time entries
timeEntries.add({ project: 'Website', minutes: 120, date: new Date() });
timeEntries.add({ project: 'App', minutes: 90, date: new Date() });
timeEntries.add({ project: 'Website', minutes: 60, date: new Date() });

console.log('Total Time:', timeEntries.formattedTime);
console.log('Today:', timeEntries.todaysHours, 'hours');
console.log('By Project:', timeEntries.byProject);
// { Website: 180, App: 90 }

// Live timer display
effect(() => {
  document.getElementById('total-time').textContent = 
    timeEntries.formattedTime;
  
  document.getElementById('today-time').textContent = 
    `${timeEntries.todaysHours.toFixed(1)} hours today`;
});
```

 

### Example 4: Budget Tracker

```javascript
const transactions = computedCollection([], {
  income() {
    return this.items
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },
  
  expenses() {
    return this.items
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },
  
  balance() {
    return this.income - this.expenses;
  },
  
  expensesByCategory() {
    const grouped = {};
    this.items
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!grouped[t.category]) {
          grouped[t.category] = 0;
        }
        grouped[t.category] += t.amount;
      });
    return grouped;
  },
  
  largestExpense() {
    const expenses = this.items.filter(t => t.type === 'expense');
    if (expenses.length === 0) return null;
    return expenses.reduce((max, t) => 
      t.amount > max.amount ? t : max
    );
  }
});

// Add transactions
transactions.add({ type: 'income', amount: 5000, category: 'Salary' });
transactions.add({ type: 'expense', amount: 1200, category: 'Rent' });
transactions.add({ type: 'expense', amount: 500, category: 'Food' });
transactions.add({ type: 'expense', amount: 200, category: 'Utilities' });

console.log('Income:', transactions.income);
console.log('Expenses:', transactions.expenses);
console.log('Balance:', transactions.balance);
console.log('By Category:', transactions.expensesByCategory);

// Financial summary
effect(() => {
  const summary = document.getElementById('summary');
  const balance = transactions.balance;
  const status = balance >= 0 ? 'positive' : 'negative';
  
  summary.innerHTML = `
    <div class="balance ${status}">
      <h2>Balance: $${balance.toFixed(2)}</h2>
    </div>
    <div class="details">
      <p>Income: $${transactions.income.toFixed(2)}</p>
      <p>Expenses: $${transactions.expenses.toFixed(2)}</p>
    </div>
  `;
});
```

 

### Example 5: Team Performance Metrics

```javascript
const teamMembers = computedCollection([], {
  averageScore() {
    if (this.items.length === 0) return 0;
    const sum = this.items.reduce((s, m) => s + m.score, 0);
    return sum / this.items.length;
  },
  
  topPerformer() {
    if (this.items.length === 0) return null;
    return this.items.reduce((top, m) => 
      m.score > top.score ? m : top
    );
  },
  
  activeMembers() {
    return this.items.filter(m => m.active).length;
  },
  
  totalTasksCompleted() {
    return this.items.reduce((sum, m) => sum + m.tasksCompleted, 0);
  },
  
  teamStatus() {
    const avg = this.averageScore;
    if (avg >= 90) return 'Excellent';
    if (avg >= 75) return 'Good';
    if (avg >= 60) return 'Needs Improvement';
    return 'Critical';
  }
});

// Add team members
teamMembers.add({ name: 'Alice', score: 95, active: true, tasksCompleted: 24 });
teamMembers.add({ name: 'Bob', score: 82, active: true, tasksCompleted: 18 });
teamMembers.add({ name: 'Charlie', score: 88, active: false, tasksCompleted: 20 });

console.log('Average Score:', teamMembers.averageScore);
console.log('Top Performer:', teamMembers.topPerformer.name);
console.log('Active Members:', teamMembers.activeMembers);
console.log('Total Tasks:', teamMembers.totalTasksCompleted);
console.log('Team Status:', teamMembers.teamStatus);

// Live metrics dashboard
effect(() => {
  const metrics = document.getElementById('metrics');
  const top = teamMembers.topPerformer;
  
  metrics.innerHTML = `
    <div class="metric">
      <h3>Team Average</h3>
      <p class="score">${teamMembers.averageScore.toFixed(1)}</p>
      <p class="status">${teamMembers.teamStatus}</p>
    </div>
    <div class="metric">
      <h3>Top Performer</h3>
      <p>${top ? top.name : 'N/A'}</p>
      <p class="score">${top ? top.score : 0}</p>
    </div>
    <div class="metric">
      <h3>Tasks Completed</h3>
      <p>${teamMembers.totalTasksCompleted}</p>
    </div>
  `;
});
```

 

## Common Patterns

### Pattern 1: Dependent Computed Properties

```javascript
const data = computedCollection(items, {
  step1() {
    return /* calculation */;
  },
  
  step2() {
    return this.step1 * 2;  // Uses step1
  },
  
  final() {
    return this.step2 + 10;  // Uses step2
  }
});
```

 

### Pattern 2: Conditional Computed

```javascript
const items = computedCollection(data, {
  status() {
    if (this.items.length === 0) return 'Empty';
    if (this.items.every(i => i.done)) return 'Complete';
    return 'In Progress';
  }
});
```

 

### Pattern 3: Grouping Data

```javascript
const transactions = computedCollection(data, {
  byCategory() {
    return this.items.reduce((groups, item) => {
      const cat = item.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
      return groups;
    }, {});
  }
});
```

 

## Important Notes

### 1. Use `this.items` to Access Items

```javascript
// ✅ Correct
{
  total() {
    return this.items.reduce(...);
  }
}

// ❌ Wrong - won't work
{
  total() {
    return items.reduce(...);  // 'items' not defined
  }
}
```

 

### 2. Computed Properties are Read-Only

```javascript
const collection = computedCollection(items, {
  total() { return /* ... */; }
});

// ✅ Can read
console.log(collection.total);

// ❌ Can't write
collection.total = 100;  // Won't work, value is computed
```

 

### 3. Computed Properties Cache Values

```javascript
// Only recalculates when items change
const first = collection.total;  // Calculates
const second = collection.total; // Returns cached value
const third = collection.total;  // Returns cached value

collection.add(item);            // Items changed
const fourth = collection.total; // Recalculates
```

 

## Summary

**What is `computedCollection()`?**  
Creates a collection with auto-updating calculated properties.

**Why use it?**
- ✅ Automatic recalculation
- ✅ Define once, stay updated
- ✅ Clean code
- ✅ No manual updates

**Key Takeaway:**

```
Manual Calculation      Computed Properties
        |                       |
Update manually          Auto-updates
        |                       |
Call functions          Access properties
        |                       |
Easy to forget          Never out of sync ✅
```

**One-Line Rule:** Use `computedCollection()` when you need calculated values that automatically stay current as items change.

**Remember:** Computed properties are like spreadsheet formulas - define them once and they update forever! 🎉