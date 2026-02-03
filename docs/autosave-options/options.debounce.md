# `options.debounce` - Debounce Save Delay Configuration

## Quick Start (30 seconds)

```javascript
const searchState = state({ query: '' });

// Without debounce - saves on every keystroke
autoSave(searchState, 'search');

// With debounce - waits 500ms after user stops typing
autoSave(searchState, 'search', {
  debounce: 500
});

// User types "hello"
// Without debounce: 5 saves (h, he, hel, hell, hello)
// With debounce: 1 save (hello) ✨
```

**What just happened?** You added a delay so saving only happens after the user stops making changes!

  

## What is `options.debounce`?

`options.debounce` is a configuration option that **delays saving to storage until a specified time has passed with no changes**.

Simply put: it's like waiting for someone to finish talking before you write down what they said. Instead of writing every word, you wait for them to pause.

Think of it as **batching rapid changes into a single save operation**.

  

## Syntax

```javascript
autoSave(state, key, {
  debounce: milliseconds
})
```

**Value:**
- Number of milliseconds to wait (e.g., `300`, `500`, `1000`)
- `0` means no debounce (save immediately)

**Default:** `0` (no debounce)

  

## Why Does This Exist?

### The Problem: Too Many Saves

Without debouncing, every tiny change triggers a save:

```javascript
const formState = state({ email: '' });
autoSave(formState, 'form');

// User types their email: "alice@example.com"
// Each keystroke triggers a save:

formState.email = 'a';        // Save #1
formState.email = 'al';       // Save #2
formState.email = 'ali';      // Save #3
formState.email = 'alic';     // Save #4
formState.email = 'alice';    // Save #5
formState.email = 'alice@';   // Save #6
// ... 19 saves total! ❌

// Problems:
// - Wasted CPU cycles
// - Excessive localStorage writes
// - Battery drain on mobile
// - Performance degradation
```

**What's the Real Issue?**

```
User types fast
        |
        v
Each keystroke triggers save
        |
        v
Dozens of saves per second
        |
        v
Performance problems ❌
```

**Problems:**
❌ **Performance overhead** - Too many save operations  
❌ **Battery drain** - Constant storage writes on mobile  
❌ **Unnecessary work** - Saving intermediate states  
❌ **Slower UI** - Blocking operations slow down typing  

### The Solution with `options.debounce`

```javascript
const formState = state({ email: '' });

autoSave(formState, 'form', {
  debounce: 500  // Wait 500ms after last change
});

// User types "alice@example.com"
// Waits 500ms after last keystroke
// Saves once: "alice@example.com" ✨

// Benefits:
// - 1 save instead of 19 saves
// - Better performance
// - Same user experience
```

**What Just Happened?**

```
User types fast
        |
        v
Changes accumulate
        |
        v
User pauses > 500ms
        |
        v
Save once with final value ✨
```

**Benefits:**
✅ **Better performance** - Fewer save operations  
✅ **Battery friendly** - Reduces storage writes  
✅ **Smoother UI** - No blocking during rapid input  
✅ **Same result** - Final state is saved correctly  

  

## Mental Model

Think of saving without debounce as **writing down every word as someone speaks**:

```
No Debounce (Write Every Word)
┌─────────────────────┐
│  Person: "I..."     │
│  You: [writes "I"]  │
│                     │
│  Person: "I am..." │
│  You: [writes "am"] │
│                     │
│  Person: "I am h.." │
│  You: [writes "h"]  │
│                     │
│  Exhausting! ❌     │
└─────────────────────┘
```

Think of debouncing as **waiting for them to finish**:

```
With Debounce (Wait for Pause)
┌─────────────────────┐
│  Person talks...    │
│  You: [listening]   │
│                     │
│  Person pauses      │
│  You: [wait 500ms]  │
│                     │
│  Still paused?      │
│  You: [writes once] │
│                     │
│  Efficient! ✨      │
└─────────────────────┘
```

**Key Insight:** Debouncing waits for a quiet moment before saving.

  

## How Does It Work?

Debouncing uses a timer that resets on every change:

### Step-by-Step Process

**1️⃣ State Changes**
```javascript
formState.email = 'a';
```

**2️⃣ Timer Starts**
```
Change detected
        |
        v
Start 500ms timer
        |
        v
Wait...
```

**3️⃣ Another Change (Timer Resets)**
```
formState.email = 'al';
        |
        v
Cancel previous timer
        |
        v
Start new 500ms timer
        |
        v
Wait...
```

**4️⃣ User Stops (Timer Completes)**
```
No changes for 500ms
        |
        v
Timer completes
        |
        v
Save to storage ✨
```

### Visual Timeline

```
Time:  0ms   100ms  200ms  300ms  400ms  500ms  600ms  700ms  800ms
       |      |      |      |      |      |      |      |      |
Type:  a      l      i      c      e                    [SAVE]
       |      |      |      |      |
Timer: Start  Reset  Reset  Reset  Reset    500ms-->  Complete!
```

  

## Basic Usage

### Example 1: Form Input Debouncing

```javascript
const formState = state({
  name: '',
  email: '',
  message: ''
});

// Save 300ms after user stops typing
autoSave(formState, 'contactForm', {
  debounce: 300
});

// User types quickly - only saves once after they pause
formState.name = 'Alice Johnson';  // Starts timer
formState.email = 'alice@...';     // Resets timer
// User stops typing...
// [300ms passes]
// Saves both changes together ✨
```

  

### Example 2: Search Query Debouncing

```javascript
const searchState = state({ query: '' });

// Wait 500ms after user stops typing to save
autoSave(searchState, 'lastSearch', {
  debounce: 500
});

// User types "javascript frameworks"
// Only saves after they finish typing
// Prevents saving "j", "ja", "jav", etc.
```

  

### Example 3: No Debounce (Immediate Save)

```javascript
const toggleState = state({ darkMode: false });

// No debounce for simple toggles
autoSave(toggleState, 'theme', {
  debounce: 0  // Save immediately
});

// User toggles dark mode
toggleState.darkMode = true;
// Saves immediately (no delay needed) ✨
```

  

## Real-World Examples

### Example 1: Text Editor Auto-Save

```javascript
const editorState = state({
  content: '',
  title: '',
  lastSaved: null
});

// Save 1 second after user stops typing
autoSave(editorState, 'draft', {
  debounce: 1000,
  onSave: (data) => {
    data.lastSaved = new Date().toISOString();
    return data;
  }
});

// Display save indicator
effect(() => {
  const indicator = document.getElementById('save-status');
  indicator.textContent = editorState.lastSaved 
    ? `Saved at ${new Date(editorState.lastSaved).toLocaleTimeString()}`
    : 'Not saved yet';
});

// User types paragraph...
// Saves once after they pause typing ✨
```

  

### Example 2: Settings Panel

```javascript
const settings = state({
  fontSize: 16,
  theme: 'light',
  language: 'en',
  autoSave: true
});

// Save 500ms after user stops adjusting settings
autoSave(settings, 'preferences', {
  debounce: 500
});

// User moves fontSize slider: 16 → 17 → 18 → 19 → 20
// Only saves final value: 20 ✨

// Benefits:
// - Smooth slider experience
// - One save operation
// - No performance hit
```

  

### Example 3: Shopping Cart

```javascript
const cart = state({ items: [] });

// Debounce cart saves (user might adjust quantities quickly)
autoSave(cart, 'shoppingCart', {
  debounce: 500
});

function updateQuantity(itemId, quantity) {
  const item = cart.items.find(i => i.id === itemId);
  if (item) {
    item.quantity = quantity;
  }
}

// User adjusts quantity: 1 → 2 → 3 → 4 → 5
// Only saves once with final quantity ✨
```

  

### Example 4: Live Filtering

```javascript
const filterState = state({
  category: '',
  priceMin: 0,
  priceMax: 1000,
  search: ''
});

// Save filter state with debouncing
autoSave(filterState, 'productFilters', {
  debounce: 300,
  storage: 'sessionStorage'  // Temporary filters
});

// User quickly adjusts multiple filters
filterState.category = 'electronics';
filterState.priceMax = 500;
filterState.search = 'laptop';

// Saves once after user finishes adjusting ✨
```

  

### Example 5: Canvas/Drawing App

```javascript
const drawingState = state({
  strokes: [],
  currentStroke: null
});

// Debounce saving strokes
autoSave(drawingState, 'drawing', {
  debounce: 2000  // Save 2 seconds after user stops drawing
});

canvas.onmousedown = (e) => {
  drawingState.currentStroke = { points: [] };
};

canvas.onmousemove = (e) => {
  if (drawingState.currentStroke) {
    drawingState.currentStroke.points.push([e.x, e.y]);
    // Changes happen rapidly - debouncing prevents saving each point
  }
};

canvas.onmouseup = () => {
  if (drawingState.currentStroke) {
    drawingState.strokes.push(drawingState.currentStroke);
    drawingState.currentStroke = null;
    // Saves 2 seconds after user stops drawing ✨
  }
};
```

  

## Common Patterns

### Pattern 1: Different Debounce for Different Data

```javascript
// Fast-changing data - longer debounce
const searchState = state({ query: '' });
autoSave(searchState, 'search', {
  debounce: 500  // User types fast
});

// Slow-changing data - short debounce
const toggleState = state({ enabled: true });
autoSave(toggleState, 'toggle', {
  debounce: 100  // Quick response
});
```

  

### Pattern 2: Adaptive Debouncing

```javascript
function createAdaptiveSave(state, key, baseDebounce = 300) {
  let debounceTime = baseDebounce;
  let changeCount = 0;
  
  setInterval(() => {
    if (changeCount > 10) {
      // Many rapid changes - increase debounce
      debounceTime = baseDebounce * 2;
    } else {
      // Few changes - use base debounce
      debounceTime = baseDebounce;
    }
    changeCount = 0;
  }, 1000);
  
  return autoSave(state, key, {
    debounce: debounceTime
  });
}
```

  

### Pattern 3: Save on Idle

```javascript
// Long debounce for "save on idle"
const workState = state({ data: {} });

autoSave(workState, 'work', {
  debounce: 5000  // 5 seconds of inactivity
});

// Saves only when user takes a break
```

  

### Pattern 4: Immediate + Debounced Save

```javascript
const docState = state({ content: '' });

// Immediate save for critical data
autoSave(docState, 'document', {
  debounce: 0
});

// Debounced save for backup
autoSave(docState, 'documentBackup', {
  debounce: 5000
});

// Critical data: Saved immediately
// Backup: Saved less frequently
```

  

### Pattern 5: Manual Flush

```javascript
const formState = state({ data: {} });

let saveTimeout;

autoSave(formState, 'form', {
  debounce: 1000
});

// Force save immediately (override debounce)
function forceSave() {
  formState.$save();  // Bypass debounce
}

// On form submit
form.onsubmit = () => {
  forceSave();  // Save immediately before submit
};
```

  

### Pattern 6: Debounce Based on Data Size

```javascript
function smartDebounce(data) {
  const size = JSON.stringify(data).length;
  
  if (size < 1000) return 100;      // Small data - quick save
  if (size < 10000) return 500;     // Medium data - moderate delay
  return 2000;                       // Large data - longer delay
}

const state = state({ content: '' });

autoSave(state, 'data', {
  debounce: smartDebounce(state)
});
```

  

## Choosing the Right Debounce Value

### Guidelines by Use Case

```
┌────────────────────┬──────────────┬─────────────────┐
│ Use Case           │ Debounce     │ Reason          │
├────────────────────┼──────────────┼─────────────────┤
│ Text input         │ 300-500ms    │ Typing speed    │
│ Search box         │ 500-800ms    │ Wait for query  │
│ Sliders/ranges     │ 200-300ms    │ Dragging        │
│ Toggle switches    │ 0-100ms      │ Instant         │
│ Color picker       │ 300-500ms    │ Adjusting       │
│ Canvas/drawing     │ 1000-2000ms  │ Stroke complete │
│ Rich text editor   │ 1000-2000ms  │ Paragraph done  │
│ Settings panel     │ 500-1000ms   │ Multiple adj.   │
│ Form validation    │ 500-800ms    │ Complete field  │
└────────────────────┴──────────────┴─────────────────┘
```

### Rules of Thumb

**Short Debounce (100-300ms):**
- Single value changes
- Simple toggles
- Slider adjustments
- When user expects immediate feedback

**Medium Debounce (300-800ms):**
- Text input fields
- Search boxes
- Multiple related changes
- Form fields

**Long Debounce (1000-2000ms+):**
- Rich content editors
- Canvas/drawing apps
- When saving is expensive
- "Save on idle" behavior

  

## Performance Impact

### Without Debouncing

```javascript
const state = state({ text: '' });
autoSave(state, 'doc', { debounce: 0 });

// User types 100 characters
// Result: 100 saves
// Time: ~500ms (5ms per save × 100)
// Impact: Noticeable lag ❌
```

### With Debouncing

```javascript
const state = state({ text: '' });
autoSave(state, 'doc', { debounce: 500 });

// User types 100 characters
// Result: 1 save
// Time: ~5ms (one save)
// Impact: No lag ✨
```

### Performance Comparison

```
Operation          | No Debounce | 300ms Debounce | 1000ms Debounce
            -|        -|          -|          -
Saves per minute   | 60+         | ~10            | ~3
CPU usage          | High        | Low            | Very Low
Battery impact     | Significant | Minimal        | Negligible
User experience    | Laggy       | Smooth         | Very Smooth
Data loss risk     | Lowest      | Low            | Higher*
```

*Risk can be mitigated with beforeunload save

  

## Summary

**What is `options.debounce`?**  
A configuration option that delays saving to storage until a specified time has passed with no state changes.

**Why use it?**
- ✅ Better performance (fewer saves)
- ✅ Smoother user experience
- ✅ Battery efficient on mobile
- ✅ Reduces storage wear
- ✅ Same final result

**Key Takeaway:**

```
No Debounce               With Debounce
     |                         |
Save on every change     Wait for pause
     |                         |
Many saves                   Few saves
     |                         |
Performance hit ❌        Smooth UI ✨
```

**One-Line Rule:** Use debouncing to batch rapid changes into a single save operation.

**Recommended Values:**
- Text input: `300-500ms`
- Search: `500-800ms`
- Toggles: `0-100ms`
- Editors: `1000-2000ms`

**Remember:** Debounce saves performance and battery while maintaining data integrity! 🎉