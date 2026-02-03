# Building a Todo App: Complete Hands-On Tutorial

## What We're Building 🎯

In this tutorial, we'll build a **fully functional Todo App** from scratch using everything you've learned:

- ✅ Add new todos
- ✅ Mark todos as complete
- ✅ Delete todos
- ✅ Filter by status (All, Active, Completed)
- ✅ Show remaining count
- ✅ Clear all completed
- ✅ Persist to localStorage

By the end, you'll have a real, working app and the confidence to build your own projects!

 

## Prerequisites

Make sure you've completed:
- [Getting Started](getting-started.md)
- [Reactive with Core](reactive-with-core.md)
- [Reactive with Enhancers](reactive-with-enhancers.md)
- [Reactive with Conditions](reactive-with-conditions.md)

Ready? Let's build something awesome! 🚀

 

## Step 1: Setting Up the HTML

First, let's create our page structure. Every todo app needs:
- An input to add new todos
- A list to display todos
- Controls to filter and clear

**Create this HTML:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Todo App</title>
  <style>
    /* We'll add styles later */
  </style>
</head>
<body>
  <div id="app">
    <!-- Header with input -->
    <header id="header">
      <h1>📝 My Todos</h1>
      <div class="input-group">
        <input
          type="text"
          id="newTodoInput"
          placeholder="What needs to be done?"
          autofocus
        >
        <button id="addTodoBtn">Add</button>
      </div>
    </header>

    <!-- Todo list -->
    <main id="main">
      <ul id="todoList">
        <!-- Todos will be rendered here -->
      </ul>
    </main>

    <!-- Footer with filters and info -->
    <footer id="footer">
      <span id="todoCount">0 items left</span>

      <div id="filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="active">Active</button>
        <button class="filter-btn" data-filter="completed">Completed</button>
      </div>

      <button id="clearCompleted">Clear Completed</button>
    </footer>

    <!-- Empty state message -->
    <div id="emptyState">
      <p>🎉 No todos yet! Add one above.</p>
    </div>
  </div>

  <!-- Scripts will go here -->
</body>
</html>
```

**What each part does:**
- **Header** — Title and input for adding todos
- **Main** — The list where todos appear
- **Footer** — Count, filters, and clear button
- **Empty State** — Message when there are no todos

 

## Step 2: Adding Basic Styles

Let's make it look nice. Add this CSS inside the `<style>` tag:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

#app {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
#header {
  background: #667eea;
  padding: 30px;
  color: white;
}

#header h1 {
  font-size: 28px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
}

#newTodoInput {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  outline: none;
}

#addTodoBtn {
  padding: 12px 24px;
  font-size: 16px;
  background: #764ba2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

#addTodoBtn:hover {
  background: #5a3a7e;
}

/* Todo List */
#main {
  max-height: 400px;
  overflow-y: auto;
}

#todoList {
  list-style: none;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #aaa;
}

.todo-checkbox {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.todo-delete {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 20px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item:hover .todo-delete {
  opacity: 1;
}

/* Footer */
#footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

#filters {
  display: flex;
  gap: 5px;
}

.filter-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

#clearCompleted {
  padding: 6px 12px;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
}

#clearCompleted:hover {
  text-decoration: underline;
}

/* Empty State */
#emptyState {
  padding: 60px 20px;
  text-align: center;
  color: #888;
}

/* Hidden elements */
.hidden {
  display: none !important;
}
```

**Try it:** Open your HTML file in a browser. You should see a beautiful purple app shell!

 

## Step 3: Creating the State

Now let's add JavaScript. We'll start with our reactive state.

**Add this script before `</body>`:**

```html
<script src="path/to/dom-helpers.js"></script>
<script src="path/to/dom-helpers-reactive.js"></script>
<script>
// ============================================
// STEP 3: CREATE THE STATE
// ============================================

// Our app's data
const todoApp = state({
  todos: [],           // Array of todo objects
  filter: 'all',       // Current filter: all, active, completed
  newTodoText: ''      // Text in the input field
});

// Let's test it!
console.log('App state created:', todoApp);
</script>
```

**What we defined:**
- `todos` — An array to hold all our todo items
- `filter` — Which todos to show (all, active, or completed)
- `newTodoText` — What the user is typing

**Check:** Open browser console. You should see "App state created" with our state object!

 

## Step 4: Adding Computed Properties

We need some calculated values that update automatically:
- How many todos are left?
- Which todos should we show based on the filter?
- Are there any completed todos to clear?

**Add computed properties:**

```javascript
// ============================================
// STEP 4: ADD COMPUTED PROPERTIES
// ============================================

computed(todoApp, {
  // Count of incomplete todos
  remainingCount: function() {
    return this.todos.filter(todo => !todo.completed).length;
  },

  // Todos that match the current filter
  filteredTodos: function() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  },

  // Are there any completed todos?
  hasCompleted: function() {
    return this.todos.some(todo => todo.completed);
  },

  // Is the list empty?
  isEmpty: function() {
    return this.todos.length === 0;
  }
});

// Test computed values
console.log('Remaining:', todoApp.remainingCount);
console.log('Is empty:', todoApp.isEmpty);
```

**What each computed does:**
- `remainingCount` — Counts todos where `completed` is false
- `filteredTodos` — Returns todos based on current filter
- `hasCompleted` — True if at least one todo is done
- `isEmpty` — True if no todos at all

**Key insight:** These values automatically recalculate when `todos` or `filter` changes!

 

## Step 5: Rendering the Todo List

Now let's make the todos appear on screen. We'll create an effect that renders the list whenever the filtered todos change.

**Add the rendering effect:**

```javascript
// ============================================
// STEP 5: RENDER THE TODO LIST
// ============================================

effect(() => {
  const todoList = Elements.todoList;

  // If no todos to show, clear the list
  if (todoApp.filteredTodos.length === 0) {
    todoList.innerHTML = '';
    return;
  }

  // Build HTML for each todo
  const html = todoApp.filteredTodos.map(todo => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <input
        type="checkbox"
        class="todo-checkbox"
        ${todo.completed ? 'checked' : ''}
      >
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="todo-delete">×</button>
    </li>
  `).join('');

  todoList.innerHTML = html;
});

// Helper function to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

**What's happening:**
1. Effect runs whenever `filteredTodos` changes
2. We map each todo to an HTML string
3. We join them together and set as innerHTML
4. `escapeHtml` prevents security issues with user input

**Note:** The list won't show anything yet because `todos` is empty. That's next!

 

## Step 6: Adding New Todos

Let's wire up the input and button to add todos.

**Add these functions and event handlers:**

```javascript
// ============================================
// STEP 6: ADD NEW TODOS
// ============================================

// Function to add a todo
function addTodo() {
  const text = todoApp.newTodoText.trim();

  // Don't add empty todos
  if (text === '') return;

  // Create new todo object
  const newTodo = {
    id: Date.now(),        // Unique ID
    text: text,
    completed: false,
    createdAt: new Date()
  };

  // Add to the array
  todoApp.todos.push(newTodo);

  // Clear the input
  todoApp.newTodoText = '';
  Elements.newTodoInput.value = '';

  // Focus back on input for quick adding
  Elements.newTodoInput.focus();

  console.log('Added todo:', newTodo);
}

// Handle input changes
Elements.newTodoInput.addEventListener('input', (e) => {
  todoApp.newTodoText = e.target.value;
});

// Handle Enter key
Elements.newTodoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

// Handle Add button click
Elements.addTodoBtn.addEventListener('click', addTodo);
```

**Try it now!**
1. Type something in the input
2. Press Enter or click Add
3. Your todo should appear in the list! 🎉

**What's happening:**
1. User types → `newTodoText` updates
2. User presses Enter or clicks Add → `addTodo()` runs
3. New todo object is created and pushed to `todos` array
4. Effect detects `todos` changed → re-renders the list

 

## Step 7: Toggling and Deleting Todos

Now let's make the checkboxes and delete buttons work.

**Add event delegation for the list:**

```javascript
// ============================================
// STEP 7: TOGGLE AND DELETE TODOS
// ============================================

// Function to toggle a todo's completed status
function toggleTodo(id) {
  const todo = todoApp.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    // Trigger reactivity by notifying
    todoApp.todos = [...todoApp.todos];
  }
}

// Function to delete a todo
function deleteTodo(id) {
  const index = todoApp.todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todoApp.todos.splice(index, 1);
    // Trigger reactivity
    todoApp.todos = [...todoApp.todos];
  }
}

// Event delegation on the todo list
Elements.todoList.addEventListener('click', (e) => {
  // Find the todo item
  const todoItem = e.target.closest('.todo-item');
  if (!todoItem) return;

  const id = Number(todoItem.dataset.id);

  // Check if checkbox was clicked
  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  }

  // Check if delete button was clicked
  if (e.target.classList.contains('todo-delete')) {
    deleteTodo(id);
  }
});
```

**Try it!**
- Click a checkbox → Todo gets a strikethrough
- Click the × button → Todo disappears

**Why event delegation?**
Instead of adding listeners to each checkbox/button (which would need to be redone every render), we add ONE listener to the list and check what was clicked. More efficient!

 

## Step 8: Updating the Footer

Let's make the footer show correct info and hide when there are no todos.

**Add footer effects:**

```javascript
// ============================================
// STEP 8: UPDATE THE FOOTER
// ============================================

// Update the remaining count
effect(() => {
  const count = todoApp.remainingCount;
  const text = count === 1 ? '1 item left' : `${count} items left`;
  Elements.todoCount.textContent = text;
});

// Show/hide the Clear Completed button
effect(() => {
  Elements.clearCompleted.style.display =
    todoApp.hasCompleted ? 'block' : 'none';
});

// Show/hide main and footer based on todos
effect(() => {
  const hasAnyTodos = !todoApp.isEmpty;

  Elements.main.style.display = hasAnyTodos ? 'block' : 'none';
  Elements.footer.style.display = hasAnyTodos ? 'flex' : 'none';
  Elements.emptyState.style.display = hasAnyTodos ? 'none' : 'block';
});
```

**Now test:**
- Add a todo → Footer appears, "1 item left"
- Add another → "2 items left"
- Complete one → "1 item left", Clear button appears
- Delete all → Empty state shows

 

## Step 9: Filter Functionality

Let's make the filter buttons work.

**Add filter functionality:**

```javascript
// ============================================
// STEP 9: FILTER FUNCTIONALITY
// ============================================

// Update filter button styles
effect(() => {
  Collections.ClassName.filterBtn.forEach(btn => {
    const isActive = btn.dataset.filter === todoApp.filter;
    btn.classList.toggle('active', isActive);
  });
});

// Handle filter button clicks
Collections.ClassName.filterBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    todoApp.filter = btn.dataset.filter;
  });
});
```

**Try it:**
- Add some todos, complete some
- Click "Active" → Only incomplete todos show
- Click "Completed" → Only completed todos show
- Click "All" → All todos show

**The magic:** When `filter` changes, the computed `filteredTodos` recalculates, and the render effect runs!

 

## Step 10: Clear Completed

Let's add the clear completed functionality.

**Add clear completed:**

```javascript
// ============================================
// STEP 10: CLEAR COMPLETED
// ============================================

function clearCompleted() {
  todoApp.todos = todoApp.todos.filter(todo => !todo.completed);
}

Elements.clearCompleted.addEventListener('click', clearCompleted);
```

**Test it:**
- Complete a few todos
- Click "Clear Completed"
- Completed todos disappear!

 

## Step 11: Saving to localStorage

Let's make todos persist between page refreshes!

**Add localStorage functionality:**

```javascript
// ============================================
// STEP 11: SAVE TO LOCALSTORAGE
// ============================================

const STORAGE_KEY = 'my-todos-app';

// Save todos whenever they change
effect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todoApp.todos));
  console.log('Saved to localStorage');
});

// Load todos on startup
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        todoApp.todos = parsed;
        console.log('Loaded', parsed.length, 'todos from localStorage');
      }
    }
  } catch (e) {
    console.error('Error loading todos:', e);
  }
}

// Load on page start
loadTodos();
```

**Test persistence:**
1. Add some todos
2. Refresh the page
3. Todos are still there! 🎉

 

## Step 12: Final Polish

Let's add a few nice touches.

**Add these final improvements:**

```javascript
// ============================================
// STEP 12: FINAL POLISH
// ============================================

// Double-click to edit (bonus feature!)
Elements.todoList.addEventListener('dblclick', (e) => {
  if (!e.target.classList.contains('todo-text')) return;

  const todoItem = e.target.closest('.todo-item');
  const id = Number(todoItem.dataset.id);
  const todo = todoApp.todos.find(t => t.id === id);

  if (!todo) return;

  const newText = prompt('Edit todo:', todo.text);

  if (newText !== null && newText.trim() !== '') {
    todo.text = newText.trim();
    todoApp.todos = [...todoApp.todos];
  }
});

// Show helpful hint
console.log('💡 Tip: Double-click a todo to edit it!');

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+A to show all
  if (e.ctrlKey && e.key === 'a' && e.target !== Elements.newTodoInput) {
    e.preventDefault();
    todoApp.filter = 'all';
  }
});
```

 

## The Complete Code

Here's everything together:

```javascript
// ============================================
// COMPLETE TODO APP
// ============================================

// === STATE ===
const todoApp = state({
  todos: [],
  filter: 'all',
  newTodoText: ''
});

// === COMPUTED ===
computed(todoApp, {
  remainingCount: function() {
    return this.todos.filter(todo => !todo.completed).length;
  },
  filteredTodos: function() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  },
  hasCompleted: function() {
    return this.todos.some(todo => todo.completed);
  },
  isEmpty: function() {
    return this.todos.length === 0;
  }
});

// === HELPERS ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === ACTIONS ===
function addTodo() {
  const text = todoApp.newTodoText.trim();
  if (text === '') return;

  todoApp.todos.push({
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date()
  });

  todoApp.newTodoText = '';
  Elements.newTodoInput.value = '';
  Elements.newTodoInput.focus();
}

function toggleTodo(id) {
  const todo = todoApp.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todoApp.todos = [...todoApp.todos];
  }
}

function deleteTodo(id) {
  const index = todoApp.todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todoApp.todos.splice(index, 1);
    todoApp.todos = [...todoApp.todos];
  }
}

function clearCompleted() {
  todoApp.todos = todoApp.todos.filter(todo => !todo.completed);
}

// === EFFECTS ===

// Render todo list
effect(() => {
  const todoList = Elements.todoList;

  if (todoApp.filteredTodos.length === 0) {
    todoList.innerHTML = '';
    return;
  }

  todoList.innerHTML = todoApp.filteredTodos.map(todo => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="todo-delete">×</button>
    </li>
  `).join('');
});

// Update count
effect(() => {
  const count = todoApp.remainingCount;
  Elements.todoCount.textContent = count === 1 ? '1 item left' : `${count} items left`;
});

// Show/hide clear button
effect(() => {
  Elements.clearCompleted.style.display = todoApp.hasCompleted ? 'block' : 'none';
});

// Show/hide main sections
effect(() => {
  const hasAnyTodos = !todoApp.isEmpty;
  Elements.main.style.display = hasAnyTodos ? 'block' : 'none';
  Elements.footer.style.display = hasAnyTodos ? 'flex' : 'none';
  Elements.emptyState.style.display = hasAnyTodos ? 'none' : 'block';
});

// Update filter buttons
effect(() => {
  Collections.ClassName.filterBtn.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === todoApp.filter);
  });
});

// Save to localStorage
effect(() => {
  localStorage.setItem('my-todos-app', JSON.stringify(todoApp.todos));
});

// === EVENT HANDLERS ===

// Input handling
Elements.newTodoInput.addEventListener('input', (e) => {
  todoApp.newTodoText = e.target.value;
});

Elements.newTodoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});

Elements.addTodoBtn.addEventListener('click', addTodo);

// Todo item interactions
Elements.todoList.addEventListener('click', (e) => {
  const todoItem = e.target.closest('.todo-item');
  if (!todoItem) return;

  const id = Number(todoItem.dataset.id);

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  }

  if (e.target.classList.contains('todo-delete')) {
    deleteTodo(id);
  }
});

// Filter buttons
Collections.ClassName.filterBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    todoApp.filter = btn.dataset.filter;
  });
});

// Clear completed
Elements.clearCompleted.addEventListener('click', clearCompleted);

// === INITIALIZATION ===

// Load from localStorage
try {
  const saved = localStorage.getItem('my-todos-app');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      todoApp.todos = parsed;
    }
  }
} catch (e) {
  console.error('Error loading todos:', e);
}

console.log('✅ Todo App Ready!');
```

 

## What You Built! 🎉

Congratulations! You've built a complete Todo app with:

| Feature | How It Works |
|---------|--------------|
| Add todos | State + effect rendering |
| Toggle complete | Event delegation + state update |
| Delete todos | Array manipulation + reactivity |
| Filter views | Computed property + filter state |
| Item count | Computed property + effect |
| Clear completed | Array filter + state update |
| Persistence | Effect + localStorage |

 

## Key Concepts Recap

### State
```javascript
const app = state({ data: [] });
```
Holds your data and makes it reactive.

### Computed
```javascript
computed(app, {
  derived: function() { return this.data.length; }
});
```
Values calculated from state that auto-update.

### Effect
```javascript
effect(() => {
  // Runs when dependencies change
  Elements.count.textContent = app.data.length;
});
```
Side effects that react to state changes.

### DOM Helpers
```javascript
Elements.myId             // Access by ID
Collections.ClassName.cls // Access by class
```
Clean, easy DOM access.

 

## Challenge: Extend the App! 🚀

Ready to practice more? Try adding:

1. **Due dates** — Add a date picker and show overdue items in red
2. **Categories** — Let users organize todos into groups
3. **Search** — Filter todos by text
4. **Priority** — High/Medium/Low priority with sorting
5. **Drag & drop** — Reorder todos by dragging

Each feature is a chance to practice what you've learned!

 

## You Did It! 🏆

You've completed the entire tutorial series! You now know how to:

- ✅ Create reactive state
- ✅ Use computed properties
- ✅ Create effects for DOM updates
- ✅ Work with Elements, Collections, and Selector
- ✅ Use Enhancers for bulk updates
- ✅ Handle conditions and show/hide logic
- ✅ Build a complete, functional application

**What's next?**
- Build your own projects!
- Explore the API reference for more features
- Share what you build!

Happy coding! 🎊
