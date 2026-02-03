[![Sponsor](https://img.shields.io/badge/Sponsor-💖-pink)](https://github.com/sponsors/giovanni1707)

[![Sponsor](https://img.shields.io/badge/Sponsor-PayPal-blue?logo=paypal)](https://paypal.me/GiovanniSylvain)

 

## **State Creation**

### **State**
- `state(initialState)` - Create a reactive state object
- `createState(initialState, bindingDefs)` - Create state with auto-bindings
- `builder(initialState)` - Fluent builder pattern for state

### **References**
- `ref(value)` - Create a reactive reference with `.value` property
- `refs(defs)` - Create multiple refs from object definition

### **Collections**
- `createCollection(items)` - Create collection with extended methods 
- `computedCollection(items, computed)` - Create collection with computed properties 
- `filteredCollection(collection, predicate)` - Create filtered view that syncs with source

### **Forms**
- `createForm(initialValues, options)` - Create reactive form with full features

### **Async State**
- `asyncState(initialValue, options)` - Create enhanced async state with race condition prevention

### **Advanced State**
- `store(initialState, options)` - Create a store with getters/actions
- `component(config)` - Create a component with full lifecycle

 

## **Reactivity Functions**

### **Computed Properties**
- `computed(state, defs)` - Add multiple computed properties to state

### **Watchers**
- `watch(state, defs)` - Add multiple watchers to state
- `safeWatch(state, keyOrFn, callback, options)` - Watch with error boundary 

### **Effects**
- `effect(fn)` - Create single reactive effect
- `effects(defs)` - Create multiple effects from object
- `safeEffect(fn, options)` - Create effect with error boundary 
- `asyncEffect(fn, options)` - Create async effect with AbortSignal support 

### **DOM Bindings**
- `bindings(defs)` - Create DOM bindings with selectors

 

## **State Updates And Modification**

### **Direct Updates**
- `updateAll(state, updates)` - Unified state + DOM updates
- `set(state, updates)` - Set state values with functional updates 

### **Manual Notifications**
- `notify(state, key)` - Manually notify dependencies

 

## **Batch Operations**

### **Core Batch**
- `batch(fn)` - Batch updates manually
- `pause()` - Pause reactivity
- `resume(flush)` - Resume reactivity
- `untrack(fn)` - Run function without tracking dependencies

### **Enhanced Batch**
- `ReactiveEnhancements.batch(fn)` - Enhanced batch function with better control 
- `ReactiveEnhancements.queueUpdate(fn, priority)` - Queue update with priority 

 

## **Collection Operations** - PROPERTIES

- `collection.items` - Property containing the reactive array

### **Collection Methods**
- `add(item)` - Add item to collection (chainable) 
- `remove(predicate)` - Remove first item by predicate/value (chainable) 
- `update(predicate, updates)` - Update first item by predicate/value (chainable) 
- `clear()` - Clear all items (chainable) 

### **Bulk operations on collection**
- `removeWhere(predicate)` - Remove ALL matching items 
- `updateWhere(predicate, updates)` - Update ALL matching items 
- `toggle(predicate, field)` - Toggle boolean field on single item 
- `toggleAll(predicate, field)` - Toggle boolean field on all matching items 
- `reset(newItems)` - Reset collection with new items 

### **Find Methods**
- `find(predicate)` - Find first item in collection 
- `indexOf(item)` - Get index of item 
- `at(index)` - Get item at specific index 
- `includes(item)` - Check if collection includes item 

### **Iteration Methods**
- `forEach(fn)` - Iterate over items 
- `map(fn)` - Map over items and return new array 

### **Query Methods**
- `length` - Get collection length (getter)   - **PROPERTIES**
- `first` - Get first item (getter)  - **PROPERTIES**
- `last` - Get last item (getter)  - **PROPERTIES**
- `isEmpty()` - Check if collection is empty

### **Addition and Removal Methods**
- `push(...items)` - Add items to end (triggers reactivity) 
- `unshift(...items)` - Add items to start (triggers reactivity) 
- `pop()` - Remove item from end (triggers reactivity) 
- `shift()` - Remove item from start (triggers reactivity) 

### **Filter And Ordering Methods**
- `filter(predicate)` - Filter items and return new array
- `sort(compareFn)` - Sort array in place (triggers reactivity) 
- `reverse()` - Reverse array in place (triggers reactivity) 

### **Other Methods**
- `fill(value, start, end)` - Fill array with value (triggers reactivity) 
- `copyWithin(target, start, end)` - Copy array elements within array (triggers reactivity)
- `toArray()` - Convert to plain array
- `splice(start, deleteCount, ...items)` - Add/remove items at position (triggers reactivity)
- `slice(start, end)` - Get slice of items

### **Manual Patching Functions**
- `patchArray(state, key)` - Manually patch array property 
- `patchReactiveArray(state, key)` - Legacy global function

 

## **Form Operations**

### **Value Management**
- `setValue(field, value)` - Set single field value 
- `getValue(field)` - Get field value 
- `setValues(values)` - Set multiple field values in batch 

### **Error Management**
- `setError(field, error)` - Set field error 
- `setErrors(errors)` - Set multiple errors in batch 
- `clearError(field)` - Clear field error 
- `clearErrors()` - Clear all errors 
- `hasError(field)` - Check if field has error 
- `getError(field)` - Get field error message 

### **Touched State**
- `setTouched(field, touched)` - Mark field as touched 
- `setTouchedFields(fields)` - Mark multiple fields as touched 
- `touchAll()` - Mark all fields as touched 
- `isTouched(field)` - Check if field is touched 
- `shouldShowError(field)` - Check if should show error 

### **Validation**
- `validateField(field)` - Validate single field 
- `validate()` - Validate all fields 

### **Reset**
- `reset(newValues)` - Reset form to initial or new values 
- `resetField(field)` - Reset single field 

### **Submission**
- `submit(customHandler)` - Handle form submission 

### **Event Handlers**
- `handleChange(event)` - Handle input change event 
- `handleBlur(event)` - Handle input blur event 
- `getFieldProps(field)` - Get field props for binding 

### **DOM Binding**
- `bindToInputs(selector)` - Bind form to DOM inputs 

### **Serialization**
- `toObject()` - Convert to plain object 

### **Form Computed Properties**
- `form.isValid` - Computed property for form validity - **PROPERTIES**
- `form.isDirty` - Computed property for form dirty state - **PROPERTIES**
- `isValid` - Check if form is valid  - **PROPERTIES**
- `isDirty` - Check if form is dirty  - **PROPERTIES**
- `hasErrors` - Check if has errors  - **PROPERTIES**
- `touchedFields` - Get touched fields array  - **PROPERTIES**
- `errorFields` - Get error fields array  - **PROPERTIES**

### **Form State Properties**
- `form.values` - Property containing form values - **PROPERTIES**
- `form.errors` - Property containing form errors - **PROPERTIES**
- `form.touched` - Property containing touched fields - **PROPERTIES**
- `form.isSubmitting` - Property for submission state - **PROPERTIES**

### **Form Validation**
- `Forms.v` - Shorthand alias for validators 
- `validators` - Access validators via ReactiveUtils 
- `Validators.required(message)` - Required field validator 
- `Validators.email(message)` - Email format validator 
- `Validators.minLength(min, message)` - Minimum length validator 
- `Validators.maxLength(max, message)` - Maximum length validator 
- `Validators.min(min, message)` - Minimum value validator 
- `Validators.max(max, message)` - Maximum value validator 
- `Validators.pattern(regex, message)` - Pattern/regex validator 
- `Validators.match(fieldName, message)` - Match field validator 
- `Validators.custom(validatorFn)` - Custom validator function 
- `Validators.combine(...validators)` - Combine multiple validators 

## **Async State Operations - ENHANCED**
- `execute(asyncState, fn)` - Execute async operation 
- `abort(asyncState)` - Abort current async operation 
- `reset(asyncState)` - Reset async state to initial values 
- `refetch(asyncState)` - Refetch with last async function 
- `data` - Property containing async data  - **PROPERTIES**
- `loading` - Property for loading state  - **PROPERTIES**
- `error` - Property containing error  - **PROPERTIES**
- `requestId` - Property tracking request sequence  - **PROPERTIES**
- `abortController` - Property containing current AbortController  - **PROPERTIES**
- `isSuccess` - Computed property (data loaded, no error)  - **PROPERTIES**
- `isError` - Computed property (has error, not loading)  - **PROPERTIES**
- `isIdle` - Computed property (no data, no error, not loading)  - **PROPERTIES**

## **Error Handling**
- `ErrorBoundary` - Error boundary class constructor  - **PROPERTIES**
- `errorBoundary.wrap(fn, context)` - Wrap function with error handling  

## **CleanUp System**
- `collector()` - Create cleanup collector via ReactiveUtils 
- `scope(fn)` - Create cleanup scope via ReactiveUtils 
- `collector.add(cleanup)` - Add cleanup function to collector  
- `collector.size` - Get number of cleanup functions  - **PROPERTIES**
- `collector.disposed` - Check if collector is disposed  - **PROPERTIES**
- `cleanup(state)` - Clean up all effects and watchers from state 

## **Development Tool**
- `DevTools` - Development tools object 
- `DevTools.enable()` - Enable DevTools and expose globally 
- `DevTools.disable()` - Disable DevTools and remove global reference 
- `DevTools.trackState(state, name)` - Register state for tracking 
- `DevTools.trackEffect(effect, name)` - Register effect for tracking 
- `DevTools.getStates()` - Get array of all tracked states 
- `DevTools.getHistory()` - Get array of all logged state changes 
- `DevTools.clearHistory()` - Clear DevTools history 
- `DevTools.enabled` - Property indicating if DevTools is enabled  - **PROPERTIES**
- `DevTools.states` - Map of tracked states  - **PROPERTIES**
- `DevTools.effects` - Map of tracked effects  - **PROPERTIES**
- `DevTools.history` - Array of change history  - **PROPERTIES**
- `DevTools.maxHistory` - Maximum history size  - **PROPERTIES**

## **Component And Builder methods**
- `destroy(component)` - Destroy component and clean up resources 
- `builder.state` - Access to the created reactive state
- `builder.computed(defs)` - Add computed properties
- `builder.watch(defs)` - Add watchers
- `builder.effect(fn)` - Add effect
- `builder.bind(defs)` - Add bindings
- `builder.action(name, fn)` - Add single action
- `builder.actions(defs)` - Add multiple actions
- `builder.build()` - Build and return state with destroy method
- `builder.destroy()` - Clean up all effects

## **Utility Functions**
- `isReactive(value)` - Check if value is reactive
- `toRaw(value)` - Get raw non-reactive value
- `getRaw(state)` - Get raw (non-reactive) object from state 

## **Storage integration** ⭐ NEW
- `autoSave(reactiveObj, key, options)` - Access via ReactiveUtils 
- `reactiveStorage(storageType, namespace)` - Access via ReactiveUtils 
- `watchStorage(key, callback, options)` - Access via ReactiveUtils 

- `save(state)` - Force save state to storage immediately 
- `load(state)` - Load state from storage 
- `clear(state)` - Clear state from storage 
- `exists(state)` - Check if state exists in storage 

- `stopAutoSave(state)` - Stop automatic saving for state 
- `startAutoSave(state)` - Start automatic saving for state 
- `storageInfo(state)` - Get storage information for state 
- `isStorageAvailable(type)` - Check if storage type is available 
- `hasLocalStorage` - Boolean flag for localStorage availability  - **PROPERTIES**
- `hasSessionStorage` - Boolean flag for sessionStorage availability  - **PROPERTIES**

### **Reactive Storage Proxy Methods**
Methods available on reactive storage proxy created by reactiveStorage()

- `proxy.set(key, value, options)` - Set value in storage (triggers reactivity) 
- `proxy.get(key)` - Get value from storage (tracks dependency) 
- `proxy.remove(key)` - Remove value from storage (triggers reactivity) 
- `proxy.has(key)` - Check if key exists (tracks dependency) 
- `proxy.keys()` - Get all keys in namespace (tracks dependency) 
- `proxy.clear()` - Clear all keys in namespace (triggers reactivity) 

### **autoSave() Options**
Configuration options for autoSave function:

- `options.storage` - Storage type ('localStorage' or 'sessionStorage')  - **PROPERTIES**
- `options.namespace` - Namespace prefix for keys    - **PROPERTIES**
- `options.debounce` - Debounce time in milliseconds  - **PROPERTIES**
- `options.autoLoad` - Auto-load on creation (default: true)  - **PROPERTIES**
- `options.autoSave` - Auto-save on changes (default: true)  - **PROPERTIES**
- `options.sync` - Enable cross-tab sync (default: false)  - **PROPERTIES**
- `options.expires` - Expiration time in seconds  - **PROPERTIES**
- `options.onSave` - Transform before saving callback  - **PROPERTIES**
- `options.onLoad` - Transform after loading callback  - **PROPERTIES**
- `options.onSync` - Called when synced from another tab  - **PROPERTIES**
- `options.onError` - Error handler callback  - **PROPERTIES**

### **watchStorage() Options**
Configuration options for watchStorage function:

- `options.storage` - Storage type ('localStorage' or 'sessionStorage')  - **PROPERTIES**
- `options.namespace` - Namespace prefix for keys  - **PROPERTIES**
- `options.immediate` - Call callback immediately with current value  - **PROPERTIES**

 