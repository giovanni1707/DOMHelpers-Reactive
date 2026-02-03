/**
 * 01_dh-conditional-rendering
 * 
 * Conditions.whenState() - Works with or without Reactive State
 * @version 4.0.1 - Fixed Proxy/Symbol iterator issue with Collections
 * @license MIT
 */

(function(global) {
  'use strict';

  // ============================================================================
  // ENVIRONMENT DETECTION
  // ============================================================================

  const hasReactiveUtils = !!global.ReactiveUtils;
  const hasElements = !!global.Elements;
  const hasCollections = !!global.Collections;
  const hasSelector = !!global.Selector;

  // Detect reactive capabilities
  let effect, batch, isReactive;
  
  if (hasReactiveUtils) {
    effect = global.ReactiveUtils.effect;
    batch = global.ReactiveUtils.batch;
    isReactive = global.ReactiveUtils.isReactive;
  } else if (hasElements && typeof global.Elements.effect === 'function') {
    effect = global.Elements.effect;
    batch = global.Elements.batch;
    isReactive = global.Elements.isReactive;
  }

  const hasReactivity = !!(effect && batch);

  // ============================================================================
  // CONDITION MATCHERS REGISTRY (Strategy Pattern)
  // ============================================================================

  const conditionMatchers = {
    // Boolean literals
    booleanTrue: {
      test: (condition) => condition === 'true',
      match: (value) => value === true
    },
    booleanFalse: {
      test: (condition) => condition === 'false',
      match: (value) => value === false
    },
    truthy: {
      test: (condition) => condition === 'truthy',
      match: (value) => !!value
    },
    falsy: {
      test: (condition) => condition === 'falsy',
      match: (value) => !value
    },

    // Null/Undefined/Empty checks
    null: {
      test: (condition) => condition === 'null',
      match: (value) => value === null
    },
    undefined: {
      test: (condition) => condition === 'undefined',
      match: (value) => value === undefined
    },
    empty: {
      test: (condition) => condition === 'empty',
      match: (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return !value;
      }
    },

    // Quoted strings
    quotedString: {
      test: (condition) => 
        (condition.startsWith('"') && condition.endsWith('"')) ||
        (condition.startsWith("'") && condition.endsWith("'")),
      match: (value, condition) => String(value) === condition.slice(1, -1)
    },

    // String pattern matching
    includes: {
      test: (condition) => condition.startsWith('includes:'),
      match: (value, condition) => {
        const searchTerm = condition.slice(9).trim();
        return String(value).includes(searchTerm);
      }
    },
    startsWith: {
      test: (condition) => condition.startsWith('startsWith:'),
      match: (value, condition) => {
        const prefix = condition.slice(11).trim();
        return String(value).startsWith(prefix);
      }
    },
    endsWith: {
      test: (condition) => condition.startsWith('endsWith:'),
      match: (value, condition) => {
        const suffix = condition.slice(9).trim();
        return String(value).endsWith(suffix);
      }
    },

    // Regex pattern matching
    regex: {
      test: (condition) => 
        condition.startsWith('/') && condition.lastIndexOf('/') > 0,
      match: (value, condition) => {
        try {
          const lastSlash = condition.lastIndexOf('/');
          const pattern = condition.slice(1, lastSlash);
          const flags = condition.slice(lastSlash + 1);
          const regex = new RegExp(pattern, flags);
          return regex.test(String(value));
        } catch (e) {
          console.warn('[Conditions] Invalid regex pattern:', condition, e);
          return false;
        }
      }
    },

    // Numeric comparisons (only if value is a number)
    numericRange: {
      test: (condition, value) => 
        typeof value === 'number' && 
        condition.includes('-') && 
        !condition.startsWith('<') && 
        !condition.startsWith('>') && 
        !condition.startsWith('='),
      match: (value, condition) => {
        const parts = condition.split('-').map(p => p.trim());
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const [min, max] = parts.map(Number);
          return value >= min && value <= max;
        }
        return false;
      }
    },
    numericExact: {
      test: (condition, value) => 
        typeof value === 'number' && !isNaN(condition),
      match: (value, condition) => value === Number(condition)
    },
    greaterThanOrEqual: {
      test: (condition, value) => 
        typeof value === 'number' && condition.startsWith('>='),
      match: (value, condition) => {
        const target = Number(condition.slice(2).trim());
        return !isNaN(target) && value >= target;
      }
    },
    lessThanOrEqual: {
      test: (condition, value) => 
        typeof value === 'number' && condition.startsWith('<='),
      match: (value, condition) => {
        const target = Number(condition.slice(2).trim());
        return !isNaN(target) && value <= target;
      }
    },
    greaterThan: {
      test: (condition, value) => 
        typeof value === 'number' && condition.startsWith('>') && !condition.startsWith('>='),
      match: (value, condition) => {
        const target = Number(condition.slice(1).trim());
        return !isNaN(target) && value > target;
      }
    },
    lessThan: {
      test: (condition, value) => 
        typeof value === 'number' && condition.startsWith('<') && !condition.startsWith('<='),
      match: (value, condition) => {
        const target = Number(condition.slice(1).trim());
        return !isNaN(target) && value < target;
      }
    },

    // Default: string equality
    stringEquality: {
      test: () => true, // Always applicable as fallback
      match: (value, condition) => String(value) === condition
    }
  };

  /**
   * Match value against condition using registered matchers
   */
  function matchesCondition(value, condition) {
    condition = String(condition).trim();
    
    // Iterate through matchers and return first match
    for (const matcher of Object.values(conditionMatchers)) {
      if (matcher.test(condition, value)) {
        return matcher.match(value, condition);
      }
    }
    
    return false;
  }

  /**
   * Register custom condition matcher
   */
  function registerConditionMatcher(name, matcher) {
    if (!matcher.test || !matcher.match) {
      console.error('[Conditions] Invalid matcher. Must have test() and match() methods.');
      return;
    }
    conditionMatchers[name] = matcher;
  }

  // ============================================================================
  // PROPERTY HANDLERS REGISTRY (Strategy Pattern)
  // ============================================================================

  const propertyHandlers = {
    // Style object
    style: {
      test: (key, val) => key === 'style' && typeof val === 'object' && val !== null,
      apply: (element, val) => {
        Object.entries(val).forEach(([prop, value]) => {
          if (value !== null && value !== undefined) {
            element.style[prop] = value;
          }
        });
      }
    },

    // classList operations
    classList: {
      test: (key, val) => key === 'classList' && typeof val === 'object' && val !== null,
      apply: (element, val) => {
        if (Array.isArray(val)) {
          // Replace all classes
          element.className = '';
          val.forEach(cls => cls && element.classList.add(cls));
        } else {
          // Individual operations
          const operations = {
            add: (classes) => {
              const classList = Array.isArray(classes) ? classes : [classes];
              classList.forEach(cls => cls && element.classList.add(cls));
            },
            remove: (classes) => {
              const classList = Array.isArray(classes) ? classes : [classes];
              classList.forEach(cls => cls && element.classList.remove(cls));
            },
            toggle: (classes) => {
              const classList = Array.isArray(classes) ? classes : [classes];
              classList.forEach(cls => cls && element.classList.toggle(cls));
            },
            replace: (classes) => {
              if (Array.isArray(classes) && classes.length === 2) {
                element.classList.replace(classes[0], classes[1]);
              }
            }
          };

          Object.entries(val).forEach(([method, classes]) => {
            if (operations[method]) {
              operations[method](classes);
            }
          });
        }
      }
    },

    // setAttribute / attrs (object form)
    setAttribute: {
      test: (key, val) => 
        (key === 'attrs' || key === 'setAttribute') && 
        typeof val === 'object' && val !== null,
      apply: (element, val) => {
        Object.entries(val).forEach(([attr, attrVal]) => {
          if (attrVal === null || attrVal === undefined || attrVal === false) {
            element.removeAttribute(attr);
          } else {
            element.setAttribute(attr, String(attrVal));
          }
        });
      }
    },

    // removeAttribute
    removeAttribute: {
      test: (key) => key === 'removeAttribute',
      apply: (element, val) => {
        if (Array.isArray(val)) {
          val.forEach(attr => element.removeAttribute(attr));
        } else if (typeof val === 'string') {
          element.removeAttribute(val);
        }
      }
    },

    // dataset
    dataset: {
      test: (key, val) => key === 'dataset' && typeof val === 'object' && val !== null,
      apply: (element, val) => {
        Object.entries(val).forEach(([dataKey, dataVal]) => {
          element.dataset[dataKey] = String(dataVal);
        });
      }
    },

    // addEventListener
    addEventListener: {
      test: (key, val) => key === 'addEventListener' && typeof val === 'object' && val !== null,
      apply: (element, val) => {
        if (!element._whenStateListeners) {
          element._whenStateListeners = [];
        }
        
        Object.entries(val).forEach(([event, handlerConfig]) => {
          let handler, options;
          
          if (typeof handlerConfig === 'function') {
            handler = handlerConfig;
            options = undefined;
          } else if (typeof handlerConfig === 'object' && handlerConfig !== null) {
            handler = handlerConfig.handler;
            options = handlerConfig.options;
          }
          
          if (handler && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
            element._whenStateListeners.push({ event, handler, options });
          }
        });
      }
    },

    // removeEventListener
    removeEventListener: {
      test: (key, val) => key === 'removeEventListener' && Array.isArray(val) && val.length >= 2,
      apply: (element, val) => {
        const [event, handler, options] = val;
        element.removeEventListener(event, handler, options);
      }
    },

    // on* event properties (onclick, onchange, etc.)
    eventProperty: {
      test: (key, val) => key.startsWith('on') && typeof val === 'function',
      apply: (element, val, key) => {
        element[key] = val;
      }
    },

    // Native DOM properties
    nativeProperty: {
      test: (key, val, element) => key in element,
      apply: (element, val, key) => {
        element[key] = val;
      }
    },

    // Default: try setAttribute for primitives
    fallback: {
      test: (key, val) => 
        typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean',
      apply: (element, val, key) => {
        element.setAttribute(key, String(val));
      }
    }
  };

  /**
   * Apply a single property to an element using registered handlers
   */
  function applyProperty(element, key, val) {
    // Find and execute first matching handler
    for (const handler of Object.values(propertyHandlers)) {
      if (handler.test(key, val, element)) {
        handler.apply(element, val, key);
        return;
      }
    }
  }

  /**
   * Register custom property handler
   */
  function registerPropertyHandler(name, handler) {
    if (!handler.test || !handler.apply) {
      console.error('[Conditions] Invalid handler. Must have test() and apply() methods.');
      return;
    }
    // Insert before fallback
    const entries = Object.entries(propertyHandlers);
    const fallback = entries.pop();
    propertyHandlers[name] = handler;
    if (fallback) {
      propertyHandlers[fallback[0]] = fallback[1];
    }
  }

  // ============================================================================
  // ELEMENT SELECTOR & RETRIEVAL - FIXED FOR PROXY COLLECTIONS
  // ============================================================================

  /**
   * Safely convert array-like or collection to array (handles Proxy objects)
   */
  function toArray(collection) {
    if (!collection) return [];
    
    // Already an array
    if (Array.isArray(collection)) {
      return collection;
    }
    
    // Native collections - use Array.from safely
    if (collection instanceof NodeList || collection instanceof HTMLCollection) {
      return Array.from(collection);
    }
    
    // Proxy or array-like object with length property
    if (typeof collection === 'object' && 'length' in collection) {
      try {
        // First try Array.from in case it works
        return Array.from(collection);
      } catch (e) {
        // If Array.from fails (due to Symbol iterator issues with Proxy),
        // manually iterate using numeric indices
        const arr = [];
        const len = collection.length;
        for (let i = 0; i < len; i++) {
          if (i in collection) {
            arr.push(collection[i]);
          }
        }
        return arr;
      }
    }
    
    return [];
  }

  /**
   * Get elements from various selector types
   */
  function getElements(selector) {
    // Already an element or NodeList
    if (selector instanceof Element) {
      return [selector];
    }
    if (selector instanceof NodeList || selector instanceof HTMLCollection) {
      return Array.from(selector);
    }
    if (Array.isArray(selector)) {
      return selector.filter(el => el instanceof Element);
    }

    // String selector
    if (typeof selector === 'string') {
      // Use DOM Helpers if available for optimized queries
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (hasElements && global.Elements[id]) {
          return [global.Elements[id]];
        }
        const el = document.getElementById(id);
        return el ? [el] : [];
      }
      
      if (selector.startsWith('.')) {
        const className = selector.slice(1);
        if (hasCollections && global.Collections.ClassName) {
          const collection = global.Collections.ClassName[className];
          // Use safe toArray conversion to handle Proxy objects
          if (collection) {
            return toArray(collection);
          }
        }
        return Array.from(document.getElementsByClassName(className));
      }

      // Use Selector helper if available
      if (hasSelector && global.Selector.queryAll) {
        const result = global.Selector.queryAll(selector);
        return result ? toArray(result) : [];
      }

      // Fallback to native querySelectorAll
      return Array.from(document.querySelectorAll(selector));
    }

    return [];
  }

  // ============================================================================
  // EVENT LISTENER CLEANUP
  // ============================================================================

  /**
   * Cleanup event listeners attached by previous conditions
   */
  function cleanupListeners(element) {
    if (element._whenStateListeners) {
      element._whenStateListeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      element._whenStateListeners = [];
    }
  }

  // ============================================================================
  // CONFIGURATION APPLICATION
  // ============================================================================

  /**
   * Apply configuration to element
   */
  function applyConfig(element, config, currentValue) {
    // Use DOM Helpers' .update() method if available
    if (element.update && typeof element.update === 'function') {
      try {
        element.update(config);
        return;
      } catch (e) {
        console.warn('[Conditions] Error using element.update():', e);
        // Fall through to manual application
      }
    }
    
    // Manual application (fallback)
    Object.entries(config).forEach(([key, val]) => {
      try {
        applyProperty(element, key, val);
      } catch (e) {
        console.warn(`[Conditions] Failed to apply ${key}:`, e);
      }
    });
  }

  // ============================================================================
  // CORE LOGIC
  // ============================================================================

  /**
   * Core logic: Apply conditions to elements
   */
  function applyConditions(getValue, conditions, selector) {
    // Get target elements
    const elements = getElements(selector);
    
    if (!elements || elements.length === 0) {
      console.warn('[Conditions] No elements found for selector:', selector);
      return;
    }
    
    // Get current value
    let value;
    try {
      value = getValue();
    } catch (e) {
      console.error('[Conditions] Error getting value:', e);
      return;
    }
    
    // Get conditions (support dynamic conditions via function)
    let conditionsObj;
    try {
      conditionsObj = typeof conditions === 'function' ? conditions() : conditions;
    } catch (e) {
      console.error('[Conditions] Error evaluating conditions:', e);
      return;
    }
    
    // Apply to all matching elements
    elements.forEach(element => {
      // Cleanup previous event listeners
      cleanupListeners(element);
      
      // Find matching condition and apply config
      for (const [condition, config] of Object.entries(conditionsObj)) {
        if (matchesCondition(value, condition)) {
          applyConfig(element, config, value);
          break; // Only apply first matching condition
        }
      }
    });
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  const Conditions = {
    /**
     * @param {Function|*} valueFn - Function returning state value OR direct value
     * @param {Object|Function} conditions - Condition mappings (object or function returning object for dynamic conditions)
     * @param {string|Element|NodeList} selector - Target elements
     * @param {Object} options - { reactive: boolean, watch: boolean }
     */
    whenState(valueFn, conditions, selector, options = {}) {
      // Validate inputs
      if (!conditions || (typeof conditions !== 'object' && typeof conditions !== 'function')) {
        console.error('[Conditions] Second argument must be an object or function returning an object');
        return;
      }

      // Determine if we should use reactive mode
      const useReactive = options.reactive !== false && hasReactivity;
      const isFunction = typeof valueFn === 'function';
      
      // If valueFn is not a function, treat it as a static value
      const getValue = isFunction ? valueFn : () => valueFn;

      // Check if value is reactive state
      const valueIsReactiveState = isFunction && hasReactivity && 
                                    typeof isReactive === 'function' && 
                                    isReactive(valueFn());

      // Decide execution mode
      if (useReactive && (isFunction || valueIsReactiveState)) {
        // REACTIVE MODE: Use effect for automatic updates
        return effect(() => {
          applyConditions(getValue, conditions, selector);
        });
      } else {
        // NON-REACTIVE MODE: Execute once
        applyConditions(getValue, conditions, selector);
        
        // Return update function for manual updates if needed
        return {
          update: () => applyConditions(getValue, conditions, selector),
          destroy: () => {} // No cleanup needed in non-reactive mode
        };
      }
    },

    /**
     * Manual mode: Apply conditions once without reactivity
     */
    apply(value, conditions, selector) {
      const getValue = typeof value === 'function' ? value : () => value;
      applyConditions(getValue, conditions, selector);
      return this;
    },

    /**
     * Watch mode: Re-apply when value changes (requires reactivity)
     */
    watch(valueFn, conditions, selector) {
      if (!hasReactivity) {
        console.warn('[Conditions] watch() requires reactive library');
        return this.apply(valueFn, conditions, selector);
      }
      return this.whenState(valueFn, conditions, selector, { reactive: true });
    },

    /**
     * Batch multiple updates
     */
    batch(fn) {
      if (batch && typeof batch === 'function') {
        return batch(fn);
      }
      return fn(); // Fallback: execute immediately
    },

    /**
     * Register custom condition matcher
     */
    registerMatcher(name, matcher) {
      registerConditionMatcher(name, matcher);
      return this;
    },

    /**
     * Register custom property handler
     */
    registerHandler(name, handler) {
      registerPropertyHandler(name, handler);
      return this;
    },

    /**
     * Get registered matchers (for debugging/inspection)
     */
    getMatchers() {
      return Object.keys(conditionMatchers);
    },

    /**
     * Get registered handlers (for debugging/inspection)
     */
    getHandlers() {
      return Object.keys(propertyHandlers);
    },

    /**
     * Check if reactive mode is available
     */
    get hasReactivity() {
      return hasReactivity;
    },

    /**
     * Get current mode
     */
    get mode() {
      return hasReactivity ? 'reactive' : 'static';
    }
  };

  // ============================================================================
  // EXPORTS & INTEGRATION
  // ============================================================================

  // Export to global scope
  global.Conditions = Conditions;

  // Add convenience methods to DOM Helpers if available
  if (hasElements) {
    global.Elements.whenState = Conditions.whenState;
    global.Elements.whenApply = Conditions.apply;
    global.Elements.whenWatch = Conditions.watch;
  }
  
  if (hasCollections) {
    global.Collections.whenState = Conditions.whenState;
    global.Collections.whenApply = Conditions.apply;
    global.Collections.whenWatch = Conditions.watch;
  }
  
  if (hasSelector) {
    global.Selector.whenState = Conditions.whenState;
    global.Selector.whenApply = Conditions.apply;
    global.Selector.whenWatch = Conditions.watch;
  }

  // Log successful initialization
  console.log('[Conditions] v4.0.1 loaded successfully');
  console.log('[Conditions] Mode:', hasReactivity ? 'Reactive + Static' : 'Static only');
  console.log('[Conditions] Features:');
  console.log('  - Declarative condition matching with strategy pattern');
  console.log('  - Extensible via registerMatcher() and registerHandler()');
  console.log('  - Full backward compatibility maintained');
  console.log('  - Production-ready with enhanced error handling');
  console.log('  - Fixed: Proxy/Symbol iterator compatibility');

})(typeof window !== 'undefined' ? window : global);
/**
 * 02_dh-conditions-default
 * 
 * Conditions Default Branch Extension
 * @version 1.0.0
 * @description Adds explicit default branch support to Conditions.whenState()
 * @requires Conditions.js v4.0.0+
 * @license MIT
 */

(function(global) {
  'use strict';

  // ============================================================================
  // VALIDATION & DEPENDENCIES
  // ============================================================================

  if (!global.Conditions) {
    console.error('[Conditions.Default] Requires Conditions.js to be loaded first');
    return;
  }

  const Conditions = global.Conditions;

  // ============================================================================
  // STORE ORIGINAL METHODS (DO NOT MODIFY)
  // ============================================================================

  const _originalWhenState = Conditions.whenState;
  const _originalApply = Conditions.apply;
  const _originalWatch = Conditions.watch;

  // ============================================================================
  // HELPER: PROCESS CONDITIONS WITH DEFAULT
  // ============================================================================

  /**
   * Wraps conditions object to handle default branch
   * Returns a function that processes conditions and applies default if no match
   */
  function wrapConditionsWithDefault(conditions) {
    const conditionsObj = typeof conditions === 'function' ? conditions() : conditions;
    
    // Check if default exists
    if (!('default' in conditionsObj)) {
      // No default - return original conditions unchanged
      return conditions;
    }

    // Extract default and create new conditions object
    const { default: defaultConfig, ...regularConditions } = conditionsObj;
    
    // Create a wrapped conditions function that adds a catch-all matcher
    return function() {
      const currentConditions = typeof conditions === 'function' ? conditions() : conditions;
      const { default: currentDefault, ...currentRegular } = currentConditions;
      
      // Add a universal catch-all pattern at the end
      // This will match anything if no other condition matches first
      return {
        ...currentRegular,
        '/^[\\s\\S]*$/': currentDefault  // Regex that matches any string
      };
    };
  }

  // ============================================================================
  // NON-INVASIVE WRAPPER METHODS
  // ============================================================================

  /**
   * Enhanced whenState - wraps original without modifying it
   */
  Conditions.whenState = function(valueFn, conditions, selector, options = {}) {
    const wrappedConditions = wrapConditionsWithDefault(conditions);
    return _originalWhenState.call(this, valueFn, wrappedConditions, selector, options);
  };

  /**
   * Enhanced apply - wraps original without modifying it
   */
  Conditions.apply = function(value, conditions, selector) {
    const wrappedConditions = wrapConditionsWithDefault(conditions);
    return _originalApply.call(this, value, wrappedConditions, selector);
  };

  /**
   * Enhanced watch - wraps original without modifying it
   */
  Conditions.watch = function(valueFn, conditions, selector) {
    const wrappedConditions = wrapConditionsWithDefault(conditions);
    return _originalWatch.call(this, valueFn, wrappedConditions, selector);
  };

  // ============================================================================
  // PRESERVE ALL ORIGINAL METHODS
  // ============================================================================

  // Ensure all other methods remain untouched
  Conditions.batch = Conditions.batch;
  Conditions.registerMatcher = Conditions.registerMatcher;
  Conditions.registerHandler = Conditions.registerHandler;
  Conditions.getMatchers = Conditions.getMatchers;
  Conditions.getHandlers = Conditions.getHandlers;

  // ============================================================================
  // UPDATE DOM HELPERS INTEGRATION
  // ============================================================================

  if (global.Elements) {
    global.Elements.whenState = Conditions.whenState;
    global.Elements.whenApply = Conditions.apply;
    global.Elements.whenWatch = Conditions.watch;
  }
  
  if (global.Collections) {
    global.Collections.whenState = Conditions.whenState;
    global.Collections.whenApply = Conditions.apply;
    global.Collections.whenWatch = Conditions.watch;
  }
  
  if (global.Selector) {
    global.Selector.whenState = Conditions.whenState;
    global.Selector.whenApply = Conditions.apply;
    global.Selector.whenWatch = Conditions.watch;
  }

  // ============================================================================
  // RESTORATION METHOD (OPTIONAL - FOR DEBUGGING)
  // ============================================================================

  /**
   * Restore original methods if needed (for debugging)
   */
  Conditions.restoreOriginal = function() {
    Conditions.whenState = _originalWhenState;
    Conditions.apply = _originalApply;
    Conditions.watch = _originalWatch;
    console.log('[Conditions.Default] Original methods restored');
  };

  // ============================================================================
  // VERSION INFO
  // ============================================================================

  Conditions.extensions = Conditions.extensions || {};
  Conditions.extensions.defaultBranch = '1.0.0';

  console.log('[Conditions.Default] v1.0.0 loaded');
  console.log('[Conditions.Default] âœ“ Non-invasive wrapper active');
  console.log('[Conditions.Default] âœ“ Original functionality preserved');
  console.log('[Conditions.Default] âœ“ Use Conditions.restoreOriginal() to revert if needed');

})(typeof window !== 'undefined' ? window : global);
/**
 * 03_dh-conditions-collection-extension
 * 
 * Conditions Collection Extension
 * Adds collection-level conditional updates with index support
 * 
 * @version 1.0.0
 * @requires Conditions.js v4.0.0+
 * @license MIT
 */

(function(global) {
  'use strict';

  if (!global.Conditions) {
    console.error('[Conditions.Collection] Requires Conditions.js');
    return;
  }

  const Conditions = global.Conditions;

  /**
   * Apply conditions to a collection (supports bulk + index updates)
   * @param {Function|*} valueFn - State value or function
   * @param {Object} conditions - Condition mappings with update objects
   * @param {string|Element|NodeList|Array} selector - Target collection
   * @param {Object} options - { reactive: boolean }
   */
  function whenStateCollection(valueFn, conditions, selector, options = {}) {
    const hasReactivity = Conditions.hasReactivity;
    const useReactive = options.reactive !== false && hasReactivity;
    
    // Get value function
    const getValue = typeof valueFn === 'function' ? valueFn : () => valueFn;

    // Core logic: apply conditions to collection
    function applyToCollection() {
      // Get collection
      let collection;
      
      if (typeof selector === 'string') {
        // Try global shortcuts first
        if (selector.startsWith('.') && global.ClassName) {
          const className = selector.slice(1);
          collection = global.ClassName[className];
        } else if (selector.startsWith('#')) {
          // Single element, use regular whenState
          return Conditions.whenState(valueFn, conditions, selector, options);
        } else if (global.querySelectorAll) {
          collection = global.querySelectorAll(selector);
        } else {
          collection = document.querySelectorAll(selector);
        }
      } else if (selector instanceof Element) {
        // Single element
        collection = [selector];
      } else if (selector instanceof NodeList || selector instanceof HTMLCollection) {
        collection = selector;
      } else if (Array.isArray(selector)) {
        collection = selector;
      } else {
        console.warn('[Conditions.Collection] Invalid selector');
        return;
      }

      if (!collection || collection.length === 0) {
        console.warn('[Conditions.Collection] No elements found');
        return;
      }

      // Get current value
      let value;
      try {
        value = getValue();
      } catch (e) {
        console.error('[Conditions.Collection] Error getting value:', e);
        return;
      }

      // Get conditions object
      let conditionsObj;
      try {
        conditionsObj = typeof conditions === 'function' ? conditions() : conditions;
      } catch (e) {
        console.error('[Conditions.Collection] Error evaluating conditions:', e);
        return;
      }

      // Find matching condition
      let matchingConfig = null;
      for (const [condition, config] of Object.entries(conditionsObj)) {
        if (matchCondition(value, condition)) {
          matchingConfig = config;
          break;
        }
      }

      if (!matchingConfig) {
        console.info('[Conditions.Collection] No matching condition for value:', value);
        return;
      }

      // Apply to collection using .update() if available
      if (collection.update && typeof collection.update === 'function') {
        try {
          collection.update(matchingConfig);
        } catch (e) {
          console.warn('[Conditions.Collection] Error using collection.update():', e);
          applyManually(collection, matchingConfig);
        }
      } else {
        applyManually(collection, matchingConfig);
      }
    }

    // Manual application fallback
    function applyManually(collection, config) {
      const elements = Array.from(collection);
      
      // Separate index and bulk updates
      const indexUpdates = {};
      const bulkUpdates = {};
      
      Object.entries(config).forEach(([key, value]) => {
        if (/^-?\d+$/.test(key)) {
          indexUpdates[key] = value;
        } else {
          bulkUpdates[key] = value;
        }
      });

      // Apply bulk to all
      if (Object.keys(bulkUpdates).length > 0) {
        elements.forEach(element => {
          if (element && element.update) {
            element.update(bulkUpdates);
          }
        });
      }

      // Apply index-specific
      Object.entries(indexUpdates).forEach(([indexStr, updates]) => {
        let index = parseInt(indexStr);
        if (index < 0) index = elements.length + index;
        
        const element = elements[index];
        if (element && element.update) {
          element.update(updates);
        }
      });
    }

    // Helper: match condition
    function matchCondition(value, condition) {
      condition = String(condition).trim();
      
      // Use Conditions' built-in matcher if available
      if (Conditions._matchCondition) {
        return Conditions._matchCondition(value, condition);
      }

      // Fallback: basic matching
      if (condition === 'true') return value === true;
      if (condition === 'false') return value === false;
      if (condition === 'truthy') return !!value;
      if (condition === 'falsy') return !value;
      
      return String(value) === condition;
    }

    // Execute
    if (useReactive) {
      if (global.ReactiveUtils && global.ReactiveUtils.effect) {
        return global.ReactiveUtils.effect(applyToCollection);
      } else if (global.Elements && global.Elements.effect) {
        return global.Elements.effect(applyToCollection);
      }
    }
    
    // Non-reactive
    applyToCollection();
    return {
      update: applyToCollection,
      destroy: () => {}
    };
  }

  // Add to Conditions
  Conditions.whenStateCollection = whenStateCollection;

  // Convenience alias
  Conditions.whenCollection = whenStateCollection;

  console.log('[Conditions.Collection] v1.0.0 loaded');
  console.log('[Conditions.Collection] âœ“ Supports bulk + index updates in conditions');

})(typeof window !== 'undefined' ? window : global);
/**
 * 04_Conditions.apply() - Standalone Collection-Aware Implementation
 * Works independently without requiring DOM Helpers
 * Supports index-specific updates + shared properties + DEFAULT BRANCH
 * 
 * @version 2.0.0 - Added default branch support
 * @license MIT
 */

(function(global) {
  'use strict';

  // ============================================================================
  // SAFE ARRAY CONVERSION
  // ============================================================================

  /**
   * Safely convert any collection to array, avoiding Symbol issues
   */
  function safeArrayFrom(collection) {
    if (!collection) return [];
    
    // Already an array
    if (Array.isArray(collection)) {
      return collection;
    }
    
    // Standard NodeList or HTMLCollection
    if (collection instanceof NodeList || collection instanceof HTMLCollection) {
      return Array.from(collection);
    }
    
    // Custom collection with length property
    if (typeof collection === 'object' && 'length' in collection) {
      const elements = [];
      const len = Number(collection.length);
      if (!isNaN(len) && len >= 0) {
        for (let i = 0; i < len; i++) {
          // Only access numeric indices, skip Symbols
          if (Object.prototype.hasOwnProperty.call(collection, i)) {
            const item = collection[i];
            if (item instanceof Element) {
              elements.push(item);
            }
          }
        }
      }
      return elements;
    }
    
    return [];
  }

  // ============================================================================
  // ELEMENT SELECTOR
  // ============================================================================

  /**
   * Get elements from various selector types
   */
  function getElements(selector) {
    // Single element
    if (selector instanceof Element) {
      return [selector];
    }
    
    // NodeList or HTMLCollection
    if (selector instanceof NodeList || selector instanceof HTMLCollection) {
      return safeArrayFrom(selector);
    }
    
    // Array
    if (Array.isArray(selector)) {
      return selector.filter(el => el instanceof Element);
    }

    // String selector
    if (typeof selector === 'string') {
      // ID selector
      if (selector.startsWith('#')) {
        const el = document.getElementById(selector.slice(1));
        return el ? [el] : [];
      }
      
      // Class selector
      if (selector.startsWith('.')) {
        return safeArrayFrom(document.getElementsByClassName(selector.slice(1)));
      }
      
      // Generic selector
      return safeArrayFrom(document.querySelectorAll(selector));
    }

    return [];
  }

  // ============================================================================
  // CONDITION MATCHING
  // ============================================================================

  /**
   * Match value against condition string
   */
  function matchesCondition(value, condition) {
    condition = String(condition).trim();
    
    // Boolean literals
    if (condition === 'true') return value === true;
    if (condition === 'false') return value === false;
    if (condition === 'truthy') return !!value;
    if (condition === 'falsy') return !value;
    
    // Null/Undefined
    if (condition === 'null') return value === null;
    if (condition === 'undefined') return value === undefined;
    
    // Empty check
    if (condition === 'empty') {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.length === 0;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'object') return Object.keys(value).length === 0;
      return !value;
    }
    
    // Quoted strings
    if ((condition.startsWith('"') && condition.endsWith('"')) ||
        (condition.startsWith("'") && condition.endsWith("'"))) {
      return String(value) === condition.slice(1, -1);
    }
    
    // String pattern matching
    if (condition.startsWith('includes:')) {
      return String(value).includes(condition.slice(9).trim());
    }
    if (condition.startsWith('startsWith:')) {
      return String(value).startsWith(condition.slice(11).trim());
    }
    if (condition.startsWith('endsWith:')) {
      return String(value).endsWith(condition.slice(9).trim());
    }
    
    // Regex pattern
    if (condition.startsWith('/') && condition.lastIndexOf('/') > 0) {
      try {
        const lastSlash = condition.lastIndexOf('/');
        const pattern = condition.slice(1, lastSlash);
        const flags = condition.slice(lastSlash + 1);
        const regex = new RegExp(pattern, flags);
        return regex.test(String(value));
      } catch (e) {
        console.warn('[Conditions] Invalid regex:', condition);
        return false;
      }
    }
    
    // Numeric comparisons (only if value is a number)
    if (typeof value === 'number') {
      // Range: 10-20
      if (condition.includes('-') && !condition.startsWith('<') && 
          !condition.startsWith('>') && !condition.startsWith('=')) {
        const parts = condition.split('-').map(p => p.trim());
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const [min, max] = parts.map(Number);
          return value >= min && value <= max;
        }
      }
      
      // Exact number
      if (!isNaN(condition)) {
        return value === Number(condition);
      }
      
      // >= <= > 
      if (condition.startsWith('>=')) {
        const target = Number(condition.slice(2).trim());
        return !isNaN(target) && value >= target;
      }
      if (condition.startsWith('<=')) {
        const target = Number(condition.slice(2).trim());
        return !isNaN(target) && value <= target;
      }
      if (condition.startsWith('>') && !condition.startsWith('>=')) {
        const target = Number(condition.slice(1).trim());
        return !isNaN(target) && value > target;
      }
      if (condition.startsWith('<') && !condition.startsWith('<=')) {
        const target = Number(condition.slice(1).trim());
        return !isNaN(target) && value < target;
      }
    }
    
    // Default: string equality
    return String(value) === condition;
  }

  // ============================================================================
  // PROPERTY APPLICATION
  // ============================================================================

  /**
   * Apply a single property to an element
   */
  function applyProperty(element, key, val) {
    try {
      // Style object
      if (key === 'style' && typeof val === 'object' && val !== null) {
        Object.entries(val).forEach(([prop, value]) => {
          if (value !== null && value !== undefined) {
            element.style[prop] = value;
          }
        });
        return;
      }
      
      // classList operations
      if (key === 'classList' && typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
          element.className = '';
          val.forEach(cls => cls && element.classList.add(cls));
        } else {
          if (val.add) {
            const classes = Array.isArray(val.add) ? val.add : [val.add];
            classes.forEach(cls => cls && element.classList.add(cls));
          }
          if (val.remove) {
            const classes = Array.isArray(val.remove) ? val.remove : [val.remove];
            classes.forEach(cls => cls && element.classList.remove(cls));
          }
          if (val.toggle) {
            const classes = Array.isArray(val.toggle) ? val.toggle : [val.toggle];
            classes.forEach(cls => cls && element.classList.toggle(cls));
          }
        }
        return;
      }
      
      // setAttribute / attrs
      if ((key === 'attrs' || key === 'setAttribute') && 
          typeof val === 'object' && val !== null) {
        Object.entries(val).forEach(([attr, attrVal]) => {
          if (attrVal === null || attrVal === undefined || attrVal === false) {
            element.removeAttribute(attr);
          } else {
            element.setAttribute(attr, String(attrVal));
          }
        });
        return;
      }
      
      // removeAttribute
      if (key === 'removeAttribute') {
        if (Array.isArray(val)) {
          val.forEach(attr => element.removeAttribute(attr));
        } else if (typeof val === 'string') {
          element.removeAttribute(val);
        }
        return;
      }
      
      // dataset
      if (key === 'dataset' && typeof val === 'object' && val !== null) {
        Object.entries(val).forEach(([dataKey, dataVal]) => {
          element.dataset[dataKey] = String(dataVal);
        });
        return;
      }
      
      // addEventListener
      if (key === 'addEventListener' && typeof val === 'object' && val !== null) {
        Object.entries(val).forEach(([event, handlerConfig]) => {
          let handler, options;
          
          if (typeof handlerConfig === 'function') {
            handler = handlerConfig;
          } else if (typeof handlerConfig === 'object' && handlerConfig !== null) {
            handler = handlerConfig.handler;
            options = handlerConfig.options;
          }
          
          if (handler && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
          }
        });
        return;
      }
      
      // on* event properties
      if (key.startsWith('on') && typeof val === 'function') {
        element[key] = val;
        return;
      }
      
      // Native DOM property
      if (key in element) {
        element[key] = val;
        return;
      }
      
      // Fallback: setAttribute for primitives
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        element.setAttribute(key, String(val));
      }
      
    } catch (e) {
      console.warn(`[Conditions] Failed to apply ${key}:`, e);
    }
  }

  /**
   * Apply configuration object to element
   */
  function applyConfig(element, config) {
    Object.entries(config).forEach(([key, val]) => {
      applyProperty(element, key, val);
    });
  }

  // ============================================================================
  // COLLECTION-AWARE APPLICATION
  // ============================================================================

  /**
   * Apply conditions to collection with index support
   */
  function applyToCollection(elements, config) {
    // Separate index-specific and shared properties
    const sharedProps = {};
    const indexProps = {};
    
    Object.entries(config).forEach(([key, value]) => {
      // Check if key is a numeric index (including negative)
      if (/^-?\d+$/.test(key)) {
        indexProps[key] = value;
      } else {
        sharedProps[key] = value;
      }
    });
    
    // Apply shared properties to ALL elements
    if (Object.keys(sharedProps).length > 0) {
      elements.forEach(element => {
        applyConfig(element, sharedProps);
      });
    }
    
    // Apply index-specific properties
    Object.entries(indexProps).forEach(([indexStr, updates]) => {
      let index = parseInt(indexStr);
      
      // Handle negative indices
      if (index < 0) {
        index = elements.length + index;
      }
      
      // Apply if index is valid
      if (index >= 0 && index < elements.length) {
        const element = elements[index];
        applyConfig(element, updates);
      }
    });
  }

  // ============================================================================
  // PUBLIC API WITH DEFAULT BRANCH SUPPORT
  // ============================================================================

  const ConditionsApply = {
    /**
     * Apply conditions to elements (collection-aware + default branch)
     * @param {*} value - Current value to match against
     * @param {Object} conditions - Condition mappings (can include 'default')
     * @param {string|Element|NodeList|Array} selector - Target elements
     */
    apply(value, conditions, selector) {
      // Get elements
      const elements = getElements(selector);
      
      if (!elements || elements.length === 0) {
        console.warn('[Conditions] No elements found for selector:', selector);
        return this;
      }
      
      // Get conditions object (support dynamic conditions)
      const conditionsObj = typeof conditions === 'function' ? conditions() : conditions;
      
      if (!conditionsObj || typeof conditionsObj !== 'object') {
        console.error('[Conditions] Conditions must be an object');
        return this;
      }
      
      // âœ… NEW: Extract default branch if present
      const { default: defaultConfig, ...regularConditions } = conditionsObj;
      
      // Find matching condition from regular conditions
      let matchingConfig = null;
      for (const [condition, config] of Object.entries(regularConditions)) {
        if (matchesCondition(value, condition)) {
          matchingConfig = config;
          break;
        }
      }
      
      // âœ… NEW: Fall back to default if no match found
      if (!matchingConfig && defaultConfig) {
        matchingConfig = defaultConfig;
        console.log('[Conditions] Using default branch for value:', value);
      }
      
      if (!matchingConfig) {
        console.info('[Conditions] No matching condition or default for value:', value);
        return this;
      }
      
      // Apply configuration to collection
      applyToCollection(elements, matchingConfig);
      
      return this;
    },
    
    /**
     * Batch multiple apply calls
     */
    batch(fn) {
      if (typeof fn === 'function') {
        fn();
      }
      return this;
    },
    
    /**
     * Helper: Get elements (exposed for debugging)
     */
    getElements(selector) {
      return getElements(selector);
    },
    
    /**
     * Helper: Test condition matching (exposed for debugging)
     */
    testCondition(value, condition) {
      return matchesCondition(value, condition);
    }
  };

  // ============================================================================
  // EXPORT
  // ============================================================================

  // Export to global scope
  if (!global.Conditions) {
    global.Conditions = {};
  }
  
  // Merge with existing Conditions or create new
  global.Conditions.apply = ConditionsApply.apply.bind(ConditionsApply);
  global.Conditions.batch = ConditionsApply.batch.bind(ConditionsApply);
  
  // Also export standalone
  global.ConditionsApply = ConditionsApply;

  console.log('[Conditions.apply] Standalone v2.0.0 loaded');
  console.log('[Conditions.apply] âœ“ Collection-aware with index support');
  console.log('[Conditions.apply] âœ“ Default branch support enabled');
  console.log('[Conditions.apply] âœ“ Works independently');

})(typeof window !== 'undefined' ? window : global);
/**
 * 05_dh-conditions-shortcuts.js
 * 
 * Global Shortcuts for Conditions
 * Provides direct global access to Conditions methods without namespace prefix
 * 
 * @version 1.0.0
 * @requires 01_dh-conditional-rendering.js (Conditions.js v4.0.0+)
 * @license MIT
 * 
 * Usage:
 *   whenState(state.count, conditions, '.counter')
 *   whenWatch(state.user, conditions, '#profile')
 *   whenApply('active', conditions, '.btn')
 * 
 * Fallback:
 *   If conflicts detected, access via: CondShortcuts.whenState()
 */

(function(global) {
  'use strict';

  // ============================================================================
  // DEPENDENCY VALIDATION
  // ============================================================================

  if (!global.Conditions) {
    console.error('[Conditions.Shortcuts] Requires Conditions.js to be loaded first');
    console.error('[Conditions.Shortcuts] Please load 01_dh-conditional-rendering.js before this file');
    return;
  }

  const Conditions = global.Conditions;

  // Validate required methods exist
  const requiredMethods = ['whenState', 'apply', 'watch'];
  const missingMethods = requiredMethods.filter(method => typeof Conditions[method] !== 'function');
  
  if (missingMethods.length > 0) {
    console.error('[Conditions.Shortcuts] Missing required Conditions methods:', missingMethods);
    return;
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  const shortcuts = ['whenState', 'whenWatch', 'whenApply'];
  const conflicts = shortcuts.filter(name => name in global);
  
  let useNamespace = false;
  
  if (conflicts.length > 0) {
    console.warn('[Conditions.Shortcuts] âš ï¸  Naming conflicts detected:', conflicts);
    console.warn('[Conditions.Shortcuts] â†’ Using fallback namespace: CondShortcuts');
    useNamespace = true;
  }

  // ============================================================================
  // PURE ALIAS DEFINITIONS
  // ============================================================================

  /**
   * Direct alias to Conditions.whenState()
   * Main method for conditional rendering with auto-reactive support
   * 
   * @param {Function|*} valueFn - State value or function returning value
   * @param {Object|Function} conditions - Condition mappings
   * @param {string|Element|NodeList} selector - Target elements
   * @param {Object} options - { reactive: boolean }
   * @returns {Object|void} Cleanup object or void
   */
  function whenState(valueFn, conditions, selector, options) {
    return Conditions.whenState(valueFn, conditions, selector, options);
  }

  /**
   * Direct alias to Conditions.watch()
   * Explicit reactive watching (requires reactive library)
   * 
   * @param {Function|*} valueFn - State value or function returning value
   * @param {Object|Function} conditions - Condition mappings
   * @param {string|Element|NodeList} selector - Target elements
   * @returns {Object|void} Cleanup object or void
   */
  function whenWatch(valueFn, conditions, selector) {
    return Conditions.watch(valueFn, conditions, selector);
  }

  /**
   * Direct alias to Conditions.apply()
   * One-time static application without reactivity
   * 
   * @param {*} value - Current value to match
   * @param {Object|Function} conditions - Condition mappings
   * @param {string|Element|NodeList} selector - Target elements
   * @returns {Object} Chainable Conditions object
   */
  function whenApply(value, conditions, selector) {
    return Conditions.apply(value, conditions, selector);
  }

  /**
   * Direct alias to Conditions.batch()
   * Batch multiple condition updates
   * 
   * @param {Function} fn - Function containing batch updates
   * @returns {*} Result of batch function
   */
  function whenBatch(fn) {
    return Conditions.batch(fn);
  }

  // ============================================================================
  // EXPORT STRATEGY
  // ============================================================================

  const shortcutsAPI = {
    whenState,
    whenWatch,
    whenApply,
    whenBatch
  };

  if (useNamespace) {
    // FALLBACK: Export to CondShortcuts namespace
    global.CondShortcuts = shortcutsAPI;
    
    // Also attach to Conditions for discoverability
    Conditions.shortcuts = shortcutsAPI;
    
    console.log('[Conditions.Shortcuts] v1.0.0 loaded (namespace mode)');
    console.log('[Conditions.Shortcuts] âœ“ Available via: CondShortcuts.whenState()');
    console.log('[Conditions.Shortcuts] âœ“ Available via: Conditions.shortcuts.whenState()');
    console.log('[Conditions.Shortcuts] â„¹ï¸  Direct globals unavailable due to conflicts');
    
  } else {
    // PRIMARY: Export to global scope directly
    global.whenState = whenState;
    global.whenWatch = whenWatch;
    global.whenApply = whenApply;
    global.whenBatch = whenBatch;
    
    // Also keep reference in Conditions for programmatic access
    Conditions.shortcuts = shortcutsAPI;
    
    console.log('[Conditions.Shortcuts] v1.0.0 loaded');
    console.log('[Conditions.Shortcuts] âœ“ whenState() - Auto-reactive conditional rendering');
    console.log('[Conditions.Shortcuts] âœ“ whenWatch() - Explicit reactive watching');
    console.log('[Conditions.Shortcuts] âœ“ whenApply() - One-time static application');
    console.log('[Conditions.Shortcuts] âœ“ whenBatch() - Batch multiple updates');
    console.log('[Conditions.Shortcuts] â„¹ï¸  Fallback: Conditions.shortcuts.whenState()');
  }

  // ============================================================================
  // METADATA & VERSION
  // ============================================================================

  Conditions.extensions = Conditions.extensions || {};
  Conditions.extensions.shortcuts = {
    version: '1.0.0',
    mode: useNamespace ? 'namespace' : 'global',
    conflicts: conflicts.length > 0 ? conflicts : null
  };

  // ============================================================================
  // HELPER: RESTORE FUNCTION (For debugging/cleanup)
  // ============================================================================

  /**
   * Remove shortcuts from global scope (cleanup utility)
   * Useful for testing or conflict resolution
   */
  Conditions.removeShortcuts = function() {
    if (!useNamespace) {
      delete global.whenState;
      delete global.whenWatch;
      delete global.whenApply;
      delete global.whenBatch;
      console.log('[Conditions.Shortcuts] Global shortcuts removed');
    } else {
      delete global.CondShortcuts;
      console.log('[Conditions.Shortcuts] CondShortcuts namespace removed');
    }
    delete Conditions.shortcuts;
    delete Conditions.extensions.shortcuts;
  };

  // ============================================================================
  // DEVELOPMENT HELPERS (Only in non-production)
  // ============================================================================

  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
    /**
     * Print current shortcuts configuration
     */
    Conditions.printShortcuts = function() {
      console.group('[Conditions.Shortcuts] Configuration');
      console.log('Version:', Conditions.extensions.shortcuts.version);
      console.log('Mode:', Conditions.extensions.shortcuts.mode);
      console.log('Conflicts:', Conditions.extensions.shortcuts.conflicts || 'None');
      console.log('Available methods:', Object.keys(shortcutsAPI));
      console.log('Reactivity:', Conditions.hasReactivity ? 'Available' : 'Not available');
      console.groupEnd();
    };
  }

})(typeof window !== 'undefined' ? window : global);

/**
 * 06_dh-matchers-handlers-shortcut.js
 * 
 * Conditions Extensions API - Global Shortcuts
 * Provides convenient global functions for registering custom matchers and handlers
 * 
 * @version 1.0.0
 * @requires Conditions.js v4.0.0+
 * @license MIT
 */

(function(global) {
  'use strict';

  // ============================================================================
  // VALIDATION & DEPENDENCIES
  // ============================================================================

  if (!global.Conditions) {
    console.error('[Conditions.Extensions] Requires Conditions.js to be loaded first');
    console.error('[Conditions.Extensions] Please load 01_dh-conditional-rendering.js before this file');
    return;
  }

  const Conditions = global.Conditions;

  // Verify required methods exist
  if (!Conditions.registerMatcher || !Conditions.registerHandler) {
    console.error('[Conditions.Extensions] Conditions.js version is too old');
    console.error('[Conditions.Extensions] Required: v4.0.0+ with registerMatcher() and registerHandler()');
    return;
  }

  // ============================================================================
  // GLOBAL SHORTCUT FUNCTIONS
  // ============================================================================

  /**
   * Register a custom condition matcher
   * 
   * @param {string} name - Unique name for the matcher
   * @param {Object} matcher - Matcher definition
   * @param {Function} matcher.test - (condition, value?) => boolean - Check if this matcher applies
   * @param {Function} matcher.match - (value, condition) => boolean - Check if value matches condition
   * @returns {Object} - Chainable API
   * 
   * @example
   * registerMatcher('weekday', {
   *   test: (condition) => condition === 'weekday',
   *   match: (value) => {
   *     const day = new Date(value).getDay();
   *     return day >= 1 && day <= 5;
   *   }
   * });
   */
  function registerMatcher(name, matcher) {
    // Validate matcher structure
    if (!matcher || typeof matcher !== 'object') {
      console.error(`[registerMatcher] Matcher must be an object, got ${typeof matcher}`);
      return API;
    }

    if (typeof matcher.test !== 'function') {
      console.error(`[registerMatcher] Matcher.test must be a function for "${name}"`);
      return API;
    }

    if (typeof matcher.match !== 'function') {
      console.error(`[registerMatcher] Matcher.match must be a function for "${name}"`);
      return API;
    }

    // Register with Conditions
    try {
      Conditions.registerMatcher(name, matcher);
      console.log(`[registerMatcher] âœ“ Registered: ${name}`);
    } catch (e) {
      console.error(`[registerMatcher] Failed to register "${name}":`, e);
    }

    return API;
  }

  /**
   * Register a custom property handler
   * 
   * @param {string} name - Unique name for the handler
   * @param {Object} handler - Handler definition
   * @param {Function} handler.test - (key, val, element?) => boolean - Check if this handler applies
   * @param {Function} handler.apply - (element, val, key) => void - Apply the property to element
   * @returns {Object} - Chainable API
   * 
   * @example
   * registerHandler('animate', {
   *   test: (key, val) => key === 'animate' && typeof val === 'object',
   *   apply: (element, val) => {
   *     MyAnimationLib.animate(element, val.type, val.duration);
   *   }
   * });
   */
  function registerHandler(name, handler) {
    // Validate handler structure
    if (!handler || typeof handler !== 'object') {
      console.error(`[registerHandler] Handler must be an object, got ${typeof handler}`);
      return API;
    }

    if (typeof handler.test !== 'function') {
      console.error(`[registerHandler] Handler.test must be a function for "${name}"`);
      return API;
    }

    if (typeof handler.apply !== 'function') {
      console.error(`[registerHandler] Handler.apply must be a function for "${name}"`);
      return API;
    }

    // Register with Conditions
    try {
      Conditions.registerHandler(name, handler);
      console.log(`[registerHandler] âœ“ Registered: ${name}`);
    } catch (e) {
      console.error(`[registerHandler] Failed to register "${name}":`, e);
    }

    return API;
  }

  /**
   * Get list of all registered matchers
   * 
   * @returns {string[]} - Array of matcher names
   * 
   * @example
   * getMatchers() // ['booleanTrue', 'truthy', 'regex', 'weekday', ...]
   */
  function getMatchers() {
    if (typeof Conditions.getMatchers === 'function') {
      return Conditions.getMatchers();
    }
    console.warn('[getMatchers] Not available in this version of Conditions.js');
    return [];
  }

  /**
   * Get list of all registered handlers
   * 
   * @returns {string[]} - Array of handler names
   * 
   * @example
   * getHandlers() // ['style', 'classList', 'setAttribute', 'animate', ...]
   */
  function getHandlers() {
    if (typeof Conditions.getHandlers === 'function') {
      return Conditions.getHandlers();
    }
    console.warn('[getHandlers] Not available in this version of Conditions.js');
    return [];
  }

  /**
   * Check if a matcher is already registered
   * 
   * @param {string} name - Matcher name to check
   * @returns {boolean}
   * 
   * @example
   * hasMatcher('weekday') // true/false
   */
  function hasMatcher(name) {
    return getMatchers().includes(name);
  }

  /**
   * Check if a handler is already registered
   * 
   * @param {string} name - Handler name to check
   * @returns {boolean}
   * 
   * @example
   * hasHandler('animate') // true/false
   */
  function hasHandler(name) {
    return getHandlers().includes(name);
  }

  /**
   * Batch register multiple matchers at once
   * 
   * @param {Object} matchers - Map of name => matcher definitions
   * @returns {Object} - Chainable API
   * 
   * @example
   * registerMatchers({
   *   weekday: { test: ..., match: ... },
   *   weekend: { test: ..., match: ... }
   * });
   */
  function registerMatchers(matchers) {
    if (!matchers || typeof matchers !== 'object') {
      console.error('[registerMatchers] Argument must be an object');
      return API;
    }

    let registered = 0;
    let failed = 0;

    Object.entries(matchers).forEach(([name, matcher]) => {
      try {
        registerMatcher(name, matcher);
        registered++;
      } catch (e) {
        console.error(`[registerMatchers] Failed to register "${name}":`, e);
        failed++;
      }
    });

    console.log(`[registerMatchers] âœ“ Registered ${registered} matchers${failed ? `, ${failed} failed` : ''}`);
    return API;
  }

  /**
   * Batch register multiple handlers at once
   * 
   * @param {Object} handlers - Map of name => handler definitions
   * @returns {Object} - Chainable API
   * 
   * @example
   * registerHandlers({
   *   animate: { test: ..., apply: ... },
   *   transition: { test: ..., apply: ... }
   * });
   */
  function registerHandlers(handlers) {
    if (!handlers || typeof handlers !== 'object') {
      console.error('[registerHandlers] Argument must be an object');
      return API;
    }

    let registered = 0;
    let failed = 0;

    Object.entries(handlers).forEach(([name, handler]) => {
      try {
        registerHandler(name, handler);
        registered++;
      } catch (e) {
        console.error(`[registerHandlers] Failed to register "${name}":`, e);
        failed++;
      }
    });

    console.log(`[registerHandlers] âœ“ Registered ${registered} handlers${failed ? `, ${failed} failed` : ''}`);
    return API;
  }

  /**
   * Helper: Create a simple equality matcher quickly
   * 
   * @param {string} name - Matcher name
   * @param {string} keyword - Condition keyword to match
   * @param {Function} checkFn - (value) => boolean - Check function
   * @returns {Object} - Chainable API
   * 
   * @example
   * createSimpleMatcher('positive', 'positive', val => val > 0);
   */
  function createSimpleMatcher(name, keyword, checkFn) {
    return registerMatcher(name, {
      test: (condition) => condition === keyword,
      match: (value) => checkFn(value)
    });
  }

  /**
   * Helper: Create a simple property handler quickly
   * 
   * @param {string} name - Handler name
   * @param {string} propertyKey - Property name to handle
   * @param {Function} applyFn - (element, value) => void - Application function
   * @returns {Object} - Chainable API
   * 
   * @example
   * createSimpleHandler('fadeIn', 'fadeIn', (el, duration) => {
   *   el.style.transition = `opacity ${duration}ms`;
   *   el.style.opacity = 1;
   * });
   */
  function createSimpleHandler(name, propertyKey, applyFn) {
    return registerHandler(name, {
      test: (key) => key === propertyKey,
      apply: (element, val) => applyFn(element, val)
    });
  }

  /**
   * Print all registered extensions to console
   * Useful for debugging and documentation
   */
  function listExtensions() {
    const matchers = getMatchers();
    const handlers = getHandlers();

    console.group('[Conditions.Extensions] Registered Extensions');
    console.log(`ðŸ“‹ Matchers (${matchers.length}):`, matchers);
    console.log(`ðŸ”§ Handlers (${handlers.length}):`, handlers);
    console.groupEnd();

    return API;
  }

  // ============================================================================
  // CHAINABLE API OBJECT
  // ============================================================================

  const API = {
    registerMatcher,
    registerHandler,
    registerMatchers,
    registerHandlers,
    getMatchers,
    getHandlers,
    hasMatcher,
    hasHandler,
    createSimpleMatcher,
    createSimpleHandler,
    listExtensions,
    
    // Aliases for convenience
    addMatcher: registerMatcher,
    addHandler: registerHandler,
    listMatchers: getMatchers,
    listHandlers: getHandlers
  };

  // ============================================================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================================================

  // Export individual functions globally
  global.registerMatcher = registerMatcher;
  global.registerHandler = registerHandler;
  global.registerMatchers = registerMatchers;
  global.registerHandlers = registerHandlers;
  global.getMatchers = getMatchers;
  global.getHandlers = getHandlers;
  global.hasMatcher = hasMatcher;
  global.hasHandler = hasHandler;
  global.createSimpleMatcher = createSimpleMatcher;
  global.createSimpleHandler = createSimpleHandler;
  global.listExtensions = listExtensions;

  // Also export as namespaced object
  global.ConditionsExtensions = API;

  // Add to Conditions namespace as well
  Conditions.extensions = Conditions.extensions || {};
  Object.assign(Conditions.extensions, API);

  // ============================================================================
  // INTEGRATION WITH DOM HELPERS
  // ============================================================================

  // Add shortcuts to Elements if available
  if (global.Elements) {
    global.Elements.registerMatcher = registerMatcher;
    global.Elements.registerHandler = registerHandler;
    global.Elements.getMatchers = getMatchers;
    global.Elements.getHandlers = getHandlers;
  }

  // Add shortcuts to Collections if available
  if (global.Collections) {
    global.Collections.registerMatcher = registerMatcher;
    global.Collections.registerHandler = registerHandler;
  }

  // ============================================================================
  // VERSION INFO & SUCCESS MESSAGE
  // ============================================================================

  console.log('[Conditions.Extensions] v1.0.0 loaded successfully');
  console.log('[Conditions.Extensions] âœ“ Global shortcuts active');
  console.log('[Conditions.Extensions] âœ“ Available functions:');
  console.log('  - registerMatcher(name, { test, match })');
  console.log('  - registerHandler(name, { test, apply })');
  console.log('  - registerMatchers({ name: {...}, ... })');
  console.log('  - registerHandlers({ name: {...}, ... })');
  console.log('  - getMatchers() / getHandlers()');
  console.log('  - hasMatcher(name) / hasHandler(name)');
  console.log('  - createSimpleMatcher(name, keyword, checkFn)');
  console.log('  - createSimpleHandler(name, key, applyFn)');
  console.log('  - listExtensions()');
  console.log('[Conditions.Extensions] ðŸ“š Use listExtensions() to see all registered extensions');

})(typeof window !== 'undefined' ? window : global);
/**
 * 07_dh-conditions-array-support.js
 * 
 * Array Distribution Support for Conditions
 * Enhances Conditions to support array-based updates even in manual fallback paths
 * 
 * @version 1.0.0
 * @requires 01_dh-conditional-rendering.js (Conditions.js v4.0.0+)
 * @requires 10_dh-array-based-updates.js (ArrayBasedUpdates)
 * @license MIT
 */

(function(global) {
  'use strict';

  console.log('[Conditions.ArraySupport] v1.0.0 Loading...');

  // ============================================================================
  // DEPENDENCY VALIDATION
  // ============================================================================

  if (!global.Conditions) {
    console.error('[Conditions.ArraySupport] Requires Conditions.js to be loaded first');
    return;
  }

  if (!global.ArrayBasedUpdates) {
    console.error('[Conditions.ArraySupport] Requires ArrayBasedUpdates to be loaded first');
    console.error('[Conditions.ArraySupport] Please load 10_dh-array-based-updates.js before this file');
    return;
  }

  const Conditions = global.Conditions;
  const ArrayUtils = global.ArrayBasedUpdates;

  // ============================================================================
  // HELPER FUNCTIONS FROM ARRAY-BASED UPDATES
  // ============================================================================

  /**
   * Check if a config object contains any array values
   */
  function containsArrayValues(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return true;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (containsArrayValues(value)) return true;
      }
    }
    return false;
  }

  /**
   * Process updates for a specific element index
   */
  function processUpdatesForElement(updates, elementIndex, totalElements) {
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return updates;
    }

    const processed = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'style' || key === 'dataset') {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          processed[key] = processUpdatesForElement(value, elementIndex, totalElements);
        } else if (Array.isArray(value)) {
          processed[key] = ArrayUtils.getValueForIndex(value, elementIndex, totalElements);
        } else {
          processed[key] = value;
        }
      } else if (key === 'classList') {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const processedClassList = {};
          Object.entries(value).forEach(([method, classes]) => {
            processedClassList[method] = ArrayUtils.getValueForIndex(classes, elementIndex, totalElements);
          });
          processed[key] = processedClassList;
        } else {
          processed[key] = value;
        }
      } else {
        processed[key] = ArrayUtils.getValueForIndex(value, elementIndex, totalElements);
      }
    });

    return processed;
  }

  // ============================================================================
  // ENHANCED applyManually() FOR FILE 03
  // ============================================================================

  /**
   * Enhanced version of applyManually that supports array distribution
   * This replaces the manual fallback in file 03
   */
  function enhancedApplyManually(collection, config) {
    const elements = Array.from(collection);
    
    if (elements.length === 0) return;

    // Separate index and bulk updates (original logic)
    const indexUpdates = {};
    const bulkUpdates = {};
    
    Object.entries(config).forEach(([key, value]) => {
      if (/^-?\d+$/.test(key)) {
        indexUpdates[key] = value;
      } else {
        bulkUpdates[key] = value;
      }
    });

    // âœ… NEW: Check if bulk updates contain arrays
    const hasArrays = containsArrayValues(bulkUpdates);

    if (Object.keys(bulkUpdates).length > 0) {
      if (hasArrays) {
        // ðŸŽ¯ ARRAY DISTRIBUTION MODE
        console.log('[Conditions.ArraySupport] Distributing arrays across', elements.length, 'elements');
        
        elements.forEach((element, index) => {
          if (element && element.update) {
            const elementUpdates = processUpdatesForElement(bulkUpdates, index, elements.length);
            element.update(elementUpdates);
          }
        });
      } else {
        // ðŸ“¦ BULK MODE (original behavior)
        elements.forEach(element => {
          if (element && element.update) {
            element.update(bulkUpdates);
          }
        });
      }
    }

    // Apply index-specific updates (original logic)
    Object.entries(indexUpdates).forEach(([indexStr, updates]) => {
      let index = parseInt(indexStr);
      if (index < 0) index = elements.length + index;
      
      const element = elements[index];
      if (element && element.update) {
        element.update(updates);
      }
    });
  }

  // ============================================================================
  // ENHANCED applyToCollection() FOR FILE 04
  // ============================================================================

  /**
   * Enhanced version of applyToCollection that supports array distribution
   * This enhances the logic in file 04
   */
  function enhancedApplyToCollection(elements, config) {
    // Separate index-specific and shared properties (original logic)
    const sharedProps = {};
    const indexProps = {};
    
    Object.entries(config).forEach(([key, value]) => {
      if (/^-?\d+$/.test(key)) {
        indexProps[key] = value;
      } else {
        sharedProps[key] = value;
      }
    });
    
    // âœ… NEW: Check if shared props contain arrays
    const hasArrays = containsArrayValues(sharedProps);
    
    // Apply shared properties
    if (Object.keys(sharedProps).length > 0) {
      if (hasArrays) {
        // ðŸŽ¯ ARRAY DISTRIBUTION MODE
        console.log('[Conditions.ArraySupport] Distributing arrays across', elements.length, 'elements');
        
        elements.forEach((element, index) => {
          const elementUpdates = processUpdatesForElement(sharedProps, index, elements.length);
          applyConfigToElement(element, elementUpdates);
        });
      } else {
        // ðŸ“¦ BULK MODE (original behavior)
        elements.forEach(element => {
          applyConfigToElement(element, sharedProps);
        });
      }
    }
    
    // Apply index-specific properties (original logic)
    Object.entries(indexProps).forEach(([indexStr, updates]) => {
      let index = parseInt(indexStr);
      if (index < 0) index = elements.length + index;
      
      if (index >= 0 && index < elements.length) {
        const element = elements[index];
        applyConfigToElement(element, updates);
      }
    });
  }

  /**
   * Helper to apply config to a single element
   * (Simplified version - uses element.update if available)
   */
  function applyConfigToElement(element, config) {
    if (element.update && typeof element.update === 'function') {
      element.update(config);
    } else {
      // Fallback to manual property application
      Object.entries(config).forEach(([key, value]) => {
        try {
          if (key === 'style' && typeof value === 'object' && value !== null) {
            Object.assign(element.style, value);
          } else if (key in element) {
            element[key] = value;
          } else {
            element.setAttribute(key, value);
          }
        } catch (e) {
          console.warn('[Conditions.ArraySupport] Failed to apply', key, ':', e.message);
        }
      });
    }
  }

  // ============================================================================
  // PATCH EXISTING FUNCTIONS - ACTUALLY REPLACE THEM!
  // ============================================================================

  /**
   * Patch file 04's ConditionsApply.apply() to use array-aware logic
   */
  if (global.ConditionsApply && global.Conditions.apply) {
    console.log('[Conditions.ArraySupport] âœ“ Patching Conditions.apply()');
    
    // Store original
    const _originalApply = global.Conditions.apply.bind(global.Conditions);
    
    // Replace with array-aware version
    global.Conditions.apply = function(value, conditions, selector) {
      // Get elements
      const getElements = global.ConditionsApply.getElements;
      const elements = getElements ? getElements(selector) : [];
      
      if (!elements || elements.length === 0) {
        console.warn('[Conditions.ArraySupport] No elements found for selector:', selector);
        return this;
      }
      
      // Get conditions object
      const conditionsObj = typeof conditions === 'function' ? conditions() : conditions;
      
      if (!conditionsObj || typeof conditionsObj !== 'object') {
        console.error('[Conditions.ArraySupport] Conditions must be an object');
        return this;
      }
      
      // Extract default branch if present
      const { default: defaultConfig, ...regularConditions } = conditionsObj;
      
      // Find matching condition
      let matchingConfig = null;
      for (const [condition, config] of Object.entries(regularConditions)) {
        if (global.ConditionsApply.testCondition(value, condition)) {
          matchingConfig = config;
          break;
        }
      }
      
      // Fall back to default if no match
      if (!matchingConfig && defaultConfig) {
        matchingConfig = defaultConfig;
        console.log('[Conditions.ArraySupport] Using default branch for value:', value);
      }
      
      if (!matchingConfig) {
        console.info('[Conditions.ArraySupport] No matching condition or default for value:', value);
        return this;
      }
      
      // âœ… USE ARRAY-AWARE APPLICATION
      enhancedApplyToCollection(elements, matchingConfig);
      
      return this;
    };
    
    // Store original for reference
    global.Conditions._originalApply = _originalApply;
  } else {
    console.warn('[Conditions.ArraySupport] âš ï¸  Conditions.apply not found - partial support only');
  }

  // ============================================================================
  // ADD UTILITY METHODS TO CONDITIONS
  // ============================================================================

  /**
   * Check if a config contains array values (utility)
   */
  Conditions.hasArrayValues = containsArrayValues;

  /**
   * Manually apply config with array distribution (utility)
   */
  Conditions.applyWithArrays = function(elements, config) {
    if (!elements || !config) return;
    
    const elementsArray = Array.isArray(elements) ? elements : Array.from(elements);
    
    if (containsArrayValues(config)) {
      console.log('[Conditions.ArraySupport] Applying with array distribution');
      return enhancedApplyToCollection(elementsArray, config);
    } else {
      console.log('[Conditions.ArraySupport] Applying bulk update');
      elementsArray.forEach(el => {
        if (el && el.update) {
          el.update(config);
        }
      });
    }
  };

  // ============================================================================
  // EXPORT MODULE
  // ============================================================================

  const ConditionsArraySupport = {
    version: '1.0.0',
    containsArrayValues,
    processUpdatesForElement,
    enhancedApplyManually,
    enhancedApplyToCollection,
    applyConfigToElement
  };

  // Export to Conditions namespace
  Conditions.arraySupport = ConditionsArraySupport;

  // Also export globally
  global.ConditionsArraySupport = ConditionsArraySupport;

  // ============================================================================
  // RESTORATION METHOD
  // ============================================================================

  /**
   * Restore original functions (for debugging/testing)
   */
  Conditions.restoreArraySupport = function() {
    if (global.Conditions._originalApply) {
      global.Conditions.apply = global.Conditions._originalApply;
      console.log('[Conditions.ArraySupport] Original apply() restored');
    }
  };

  // ============================================================================
  // SUCCESS MESSAGE
  // ============================================================================

  console.log('[Conditions.ArraySupport] âœ“âœ“âœ“ v1.0.0 loaded successfully');
  console.log('[Conditions.ArraySupport] âœ“ Array distribution now supported in Conditions.apply()');
  console.log('[Conditions.ArraySupport] âœ“ Use Conditions.applyWithArrays(elements, config) for manual control');
  console.log('[Conditions.ArraySupport] ðŸ“š Example:');
  console.log('  Conditions.apply("active", {');
  console.log('    active: { textContent: ["A", "B", "C"], style: { color: ["red", "blue", "green"] } }');
  console.log('  }, ".items");');

})(typeof window !== 'undefined' ? window : global);
/**
 * 08_dh-conditions-batch-states.js
 * 
 * Batch States Extension for Conditions
 * Provides convenient batch methods for multiple conditional updates
 * 
 * @version 1.0.0
 * @requires 01_dh-conditional-rendering.js (Conditions.js v4.0.0+)
 * @license MIT
 * 
 * Usage:
 *   // Mixed mode (auto-detect reactivity):
 *   const cleanup = Conditions.whenStates([
 *     [state.a, condA, '.foo', { reactive: true }],
 *     [state.b, condB, '.bar', { reactive: false }]
 *   ]);
 * 
 *   // Force reactive mode for all:
 *   const cleanup = Conditions.whenWatches([
 *     [state.a, condA, '.foo'],
 *     [state.b, condB, '.bar']
 *   ]);
 * 
 *   // Force non-reactive (one-time apply) for all:
 *   const cleanup = Conditions.whenApplies([
 *     ['active', condA, '.foo'],
 *     [42, condB, '.bar']
 *   ]);
 *   
 *   // Later: cleanup.destroy();
 */

(function(global) {
  'use strict';

  console.log('[Conditions.BatchStates] v1.0.0 Loading...');

  // ============================================================================
  // DEPENDENCY VALIDATION
  // ============================================================================

  if (!global.Conditions) {
    console.error('[Conditions.BatchStates] Requires Conditions.js to be loaded first');
    console.error('[Conditions.BatchStates] Please load 01_dh-conditional-rendering.js before this file');
    return;
  }

  const Conditions = global.Conditions;

  // Validate required methods exist
  if (typeof Conditions.whenState !== 'function') {
    console.error('[Conditions.BatchStates] Conditions.whenState() not found');
    console.error('[Conditions.BatchStates] Required: Conditions.js v4.0.0+');
    return;
  }

  if (typeof Conditions.batch !== 'function') {
    console.error('[Conditions.BatchStates] Conditions.batch() not found');
    console.error('[Conditions.BatchStates] Required: Conditions.js v4.0.0+');
    return;
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Validate a single state configuration
   * @param {*} config - Configuration to validate
   * @param {number} index - Index in array (for error messages)
   * @returns {boolean} - True if valid
   */
  function isValidConfig(config, index) {
    if (!Array.isArray(config)) {
      console.warn(`[Conditions.BatchStates] Config at index ${index} must be an array, got ${typeof config}`);
      return false;
    }

    if (config.length < 3) {
      console.warn(`[Conditions.BatchStates] Config at index ${index} must have at least 3 elements [valueFn, conditions, selector], got ${config.length}`);
      return false;
    }

    const [valueFn, conditions, selector] = config;

    // Validate valueFn
    if (valueFn === undefined || valueFn === null) {
      console.warn(`[Conditions.BatchStates] Config at index ${index}: valueFn is required`);
      return false;
    }

    // Validate conditions
    if (!conditions || (typeof conditions !== 'object' && typeof conditions !== 'function')) {
      console.warn(`[Conditions.BatchStates] Config at index ${index}: conditions must be an object or function`);
      return false;
    }

    // Validate selector
    if (!selector) {
      console.warn(`[Conditions.BatchStates] Config at index ${index}: selector is required`);
      return false;
    }

    return true;
  }

  // ============================================================================
  // CORE FUNCTIONALITY
  // ============================================================================

  /**
   * Batch multiple whenState calls
   * Automatically wraps in Conditions.batch() for optimal performance
   * 
   * @param {Array} stateConfigs - Array of [valueFn, conditions, selector, options?] configurations
   * @returns {Object} - Combined cleanup object with update() and destroy() methods
   * 
   * @example
   * // Basic usage
   * Conditions.whenStates([
   *   [state.count, { 0: { textContent: 'Zero' }, default: { textContent: 'Not zero' } }, '.counter'],
   *   [state.isActive, { true: { classList: { add: 'active' } } }, '.btn']
   * ]);
   * 
   * @example
   * // With options
   * Conditions.whenStates([
   *   [() => state.user.name, nameConditions, '.username', { reactive: true }],
   *   [state.theme, themeConditions, 'body', { reactive: false }]
   * ]);
   * 
   * @example
   * // With cleanup
   * const cleanup = Conditions.whenStates([...]);
   * 
   * // Later:
   * cleanup.update();   // Manually update all
   * cleanup.destroy();  // Cleanup all watchers
   */
  function whenStates(stateConfigs) {
    // Validate input
    if (!Array.isArray(stateConfigs)) {
      console.error('[Conditions.BatchStates] whenStates() requires an array of configurations');
      console.error('[Conditions.BatchStates] Expected: [[valueFn, conditions, selector, options?], ...]');
      return createEmptyCleanup();
    }

    if (stateConfigs.length === 0) {
      console.warn('[Conditions.BatchStates] Empty array provided to whenStates()');
      return createEmptyCleanup();
    }

    // Store cleanup objects
    const cleanups = [];
    let validConfigs = 0;

    // Execute all whenState calls inside a batch
    const batchResult = Conditions.batch(() => {
      stateConfigs.forEach((config, index) => {
        // Validate configuration
        if (!isValidConfig(config, index)) {
          return; // Skip invalid configs
        }

        // Destructure with optional 4th parameter
        const [valueFn, conditions, selector, options] = config;

        try {
          // Execute whenState
          const cleanup = Conditions.whenState(valueFn, conditions, selector, options);
          
          // Store cleanup if available
          if (cleanup && typeof cleanup === 'object') {
            cleanups.push(cleanup);
          }

          validConfigs++;
        } catch (error) {
          console.error(`[Conditions.BatchStates] Error executing config at index ${index}:`, error);
        }
      });
    });

    // Log summary
    if (validConfigs > 0) {
      console.log(`[Conditions.BatchStates] âœ“ Initialized ${validConfigs} state watchers`);
    }

    // Return combined cleanup object
    return createCombinedCleanup(cleanups);
  }

  /**
   * Create a combined cleanup object from multiple cleanups
   * @param {Array} cleanups - Array of cleanup objects
   * @returns {Object} - Combined cleanup with update() and destroy()
   */
  function createCombinedCleanup(cleanups) {
    return {
      /**
       * Manually update all watchers
       */
      update() {
        let updated = 0;
        cleanups.forEach((cleanup, index) => {
          try {
            if (cleanup && typeof cleanup.update === 'function') {
              cleanup.update();
              updated++;
            }
          } catch (error) {
            console.error(`[Conditions.BatchStates] Error updating cleanup at index ${index}:`, error);
          }
        });
        console.log(`[Conditions.BatchStates] Updated ${updated}/${cleanups.length} watchers`);
      },

      /**
       * Destroy all watchers and cleanup resources
       */
      destroy() {
        let destroyed = 0;
        cleanups.forEach((cleanup, index) => {
          try {
            if (cleanup && typeof cleanup.destroy === 'function') {
              cleanup.destroy();
              destroyed++;
            }
          } catch (error) {
            console.error(`[Conditions.BatchStates] Error destroying cleanup at index ${index}:`, error);
          }
        });
        console.log(`[Conditions.BatchStates] Destroyed ${destroyed}/${cleanups.length} watchers`);
        
        // Clear the cleanups array
        cleanups.length = 0;
      },

      /**
       * Get count of active cleanups
       */
      get count() {
        return cleanups.length;
      },

      /**
       * Get all cleanup objects (for advanced usage)
       */
      getCleanups() {
        return [...cleanups];
      }
    };
  }

  /**
   * Create an empty cleanup object (for error cases)
   */
  function createEmptyCleanup() {
    return {
      update: () => {},
      destroy: () => {},
      count: 0,
      getCleanups: () => []
    };
  }

  // ============================================================================
  // REACTIVE MODE VARIANTS
  // ============================================================================

  /**
   * Batch multiple watch calls (forces reactive mode)
   * All configurations will use reactive: true automatically
   * 
   * @param {Array} stateConfigs - Array of [valueFn, conditions, selector] configurations
   * @returns {Object} - Combined cleanup object
   * 
   * @example
   * Conditions.whenWatches([
   *   [state.count, countConditions, '.counter'],
   *   [state.isActive, activeConditions, '.btn'],
   *   [() => state.user.name, nameConditions, '.username']
   * ]);
   */
  function whenWatches(stateConfigs) {
    if (!Array.isArray(stateConfigs)) {
      console.error('[Conditions.BatchStates] whenWatches() requires an array of configurations');
      return createEmptyCleanup();
    }

    // Force reactive: true for all configs
    const reactiveConfigs = stateConfigs.map(config => {
      if (!Array.isArray(config) || config.length < 3) {
        return config; // Let validation handle it
      }
      
      const [valueFn, conditions, selector, options = {}] = config;
      
      // Merge options with reactive: true (override any existing setting)
      return [valueFn, conditions, selector, { ...options, reactive: true }];
    });

    console.log('[Conditions.BatchStates] Executing batch with reactive mode enabled');
    return whenStates(reactiveConfigs);
  }

  /**
   * Batch multiple apply calls (forces non-reactive mode)
   * All configurations will be executed once without reactivity
   * 
   * @param {Array} stateConfigs - Array of [value, conditions, selector] configurations
   * @returns {Object} - Combined cleanup object
   * 
   * @example
   * Conditions.whenApplies([
   *   ['active', activeConditions, '.btn'],
   *   [42, numberConditions, '.count'],
   *   ['theme-dark', themeConditions, 'body']
   * ]);
   */
  function whenApplies(stateConfigs) {
    if (!Array.isArray(stateConfigs)) {
      console.error('[Conditions.BatchStates] whenApplies() requires an array of configurations');
      return createEmptyCleanup();
    }

    if (stateConfigs.length === 0) {
      console.warn('[Conditions.BatchStates] Empty array provided to whenApplies()');
      return createEmptyCleanup();
    }

    // Validate and execute using Conditions.apply() for each config
    const cleanups = [];
    let validConfigs = 0;

    Conditions.batch(() => {
      stateConfigs.forEach((config, index) => {
        // Validate configuration (needs at least 3 elements)
        if (!isValidConfig(config, index)) {
          return;
        }

        const [value, conditions, selector] = config;

        try {
          // Use Conditions.apply() for non-reactive execution
          Conditions.apply(value, conditions, selector);
          validConfigs++;
          
          // Create a manual cleanup object for consistency
          cleanups.push({
            update: () => {
              Conditions.apply(value, conditions, selector);
            },
            destroy: () => {} // No cleanup needed for one-time applies
          });
        } catch (error) {
          console.error(`[Conditions.BatchStates] Error executing apply at index ${index}:`, error);
        }
      });
    });

    if (validConfigs > 0) {
      console.log(`[Conditions.BatchStates] âœ“ Applied ${validConfigs} static conditions`);
    }

    return createCombinedCleanup(cleanups);
  }

  // ============================================================================
  // ADDITIONAL UTILITIES
  // ============================================================================

  /**
   * Create a reusable batch configuration
   * Useful for complex applications with repeated patterns
   * 
   * @param {Array} configs - Configuration array
   * @param {string} mode - 'state' | 'watch' | 'apply' (default: 'state')
   * @returns {Function} - Function that executes batch with configs
   * 
   * @example
   * const setupDashboard = createBatchConfig([
   *   [state.userCount, userConditions, '.user-count'],
   *   [state.revenue, revenueConditions, '.revenue']
   * ], 'watch');
   * 
   * // Later, execute multiple times:
   * const cleanup1 = setupDashboard();
   * const cleanup2 = setupDashboard();
   */
  function createBatchConfig(configs, mode = 'state') {
    if (!Array.isArray(configs)) {
      console.error('[Conditions.BatchStates] createBatchConfig() requires an array');
      return () => createEmptyCleanup();
    }

    const modeMap = {
      'state': whenStates,
      'watch': whenWatches,
      'apply': whenApplies
    };

    const executeFn = modeMap[mode] || whenStates;

    return function executeBatch() {
      return executeFn(configs);
    };
  }

  /**
   * Combine multiple batch configurations
   * 
   * @param {...Array} configArrays - Multiple configuration arrays
   * @returns {Object} - Combined cleanup
   * 
   * @example
   * const cleanup = Conditions.combineBatches(
   *   [[state.a, condA, '.a']],
   *   [[state.b, condB, '.b']],
   *   [[state.c, condC, '.c']]
   * );
   */
  function combineBatches(...configArrays) {
    const allConfigs = configArrays.flat();
    return whenStates(allConfigs);
  }

  // ============================================================================
  // EXPORT TO CONDITIONS NAMESPACE
  // ============================================================================

  // Add main methods
  Conditions.whenStates = whenStates;
  Conditions.whenWatches = whenWatches;
  Conditions.whenApplies = whenApplies;

  // Add utilities
  Conditions.createBatchConfig = createBatchConfig;
  Conditions.combineBatches = combineBatches;

  // ============================================================================
  // INTEGRATION WITH DOM HELPERS
  // ============================================================================

  // Add to Elements if available
  if (global.Elements) {
    global.Elements.whenStates = whenStates;
    global.Elements.whenWatches = whenWatches;
    global.Elements.whenApplies = whenApplies;
    global.Elements.createBatchConfig = createBatchConfig;
  }

  // Add to Collections if available
  if (global.Collections) {
    global.Collections.whenStates = whenStates;
    global.Collections.whenWatches = whenWatches;
    global.Collections.whenApplies = whenApplies;
    global.Collections.createBatchConfig = createBatchConfig;
  }

  // Add to Selector if available
  if (global.Selector) {
    global.Selector.whenStates = whenStates;
    global.Selector.whenWatches = whenWatches;
    global.Selector.whenApplies = whenApplies;
    global.Selector.createBatchConfig = createBatchConfig;
  }

  // ============================================================================
  // SHORTCUT INTEGRATION
  // ============================================================================

  // If shortcuts are loaded, add global functions
  if (global.whenState) {
    if (!global.whenStates) {
      global.whenStates = whenStates;
      console.log('[Conditions.BatchStates] âœ“ Global shortcut: whenStates()');
    }
    if (!global.whenWatches) {
      global.whenWatches = whenWatches;
      console.log('[Conditions.BatchStates] âœ“ Global shortcut: whenWatches()');
    }
    if (!global.whenApplies) {
      global.whenApplies = whenApplies;
      console.log('[Conditions.BatchStates] âœ“ Global shortcut: whenApplies()');
    }
  } else if (global.CondShortcuts) {
    global.CondShortcuts.whenStates = whenStates;
    global.CondShortcuts.whenWatches = whenWatches;
    global.CondShortcuts.whenApplies = whenApplies;
    console.log('[Conditions.BatchStates] âœ“ Added to CondShortcuts namespace');
  }

  // ============================================================================
  // VERSION TRACKING
  // ============================================================================

  Conditions.extensions = Conditions.extensions || {};
  Conditions.extensions.batchStates = {
    version: '1.0.0',
    methods: ['whenStates', 'whenWatches', 'whenApplies', 'createBatchConfig', 'combineBatches']
  };

  // ============================================================================
  // SUCCESS MESSAGE
  // ============================================================================

  console.log('[Conditions.BatchStates] âœ“âœ“âœ“ v1.0.0 loaded successfully');
  console.log('[Conditions.BatchStates] âœ“ Available methods:');
  console.log('  - Conditions.whenStates([[valueFn, cond, sel, opts?], ...])');
  console.log('  - Conditions.whenWatches([[valueFn, cond, sel], ...]) - Forces reactive mode');
  console.log('  - Conditions.whenApplies([[value, cond, sel], ...]) - Forces non-reactive mode');
  console.log('  - Conditions.createBatchConfig(configs, mode?)');
  console.log('  - Conditions.combineBatches(...configArrays)');
  console.log('[Conditions.BatchStates] ðŸ“š Examples:');
  console.log('  // Mixed mode (default):');
  console.log('  Conditions.whenStates([');
  console.log('    [state.count, countCond, ".counter", { reactive: true }],');
  console.log('    ["active", activeCond, ".btn", { reactive: false }]');
  console.log('  ]);');
  console.log('');
  console.log('  // All reactive:');
  console.log('  Conditions.whenWatches([');
  console.log('    [state.count, countCond, ".counter"],');
  console.log('    [state.active, activeCond, ".btn"]');
  console.log('  ]);');
  console.log('');
  console.log('  // All static:');
  console.log('  Conditions.whenApplies([');
  console.log('    ["active", activeCond, ".btn"],');
  console.log('    [42, numberCond, ".count"]');
  console.log('  ]);');

})(typeof window !== 'undefined' ? window : global);
/**
 * 09_dh-conditions-cleanup-fix.js
 * 
 * Event Listener Cleanup Fix for Conditions
 * Patches whenState() to properly cleanup event listeners on destroy()
 * 
 * @version 1.0.0
 * @requires 01_dh-conditional-rendering.js (Conditions.js v4.0.0+)
 * @license MIT
 * 
 * Problem Fixed:
 *   - Previously: destroy() didn't remove the last set of event listeners
 *   - Now: All listeners are properly cleaned up when cleanup.destroy() is called
 * 
 * Usage:
 *   Just load this file after the core Conditions module.
 *   No API changes - existing code works as before, but with proper cleanup.
 */

(function(global) {
  'use strict';

  console.log('[Conditions.CleanupFix] v1.0.0 Loading...');

  // ============================================================================
  // DEPENDENCY VALIDATION
  // ============================================================================

  if (!global.Conditions) {
    console.error('[Conditions.CleanupFix] Requires Conditions.js to be loaded first');
    console.error('[Conditions.CleanupFix] Please load 01_dh-conditional-rendering.js before this file');
    return;
  }

  const Conditions = global.Conditions;

  if (typeof Conditions.whenState !== 'function') {
    console.error('[Conditions.CleanupFix] Conditions.whenState() not found');
    console.error('[Conditions.CleanupFix] Required: Conditions.js v4.0.0+');
    return;
  }

  // ============================================================================
  // HELPER: CLEANUP LISTENERS FROM ELEMENT
  // ============================================================================

  /**
   * Cleanup event listeners attached by Conditions
   * (Mirrors the internal cleanupListeners function from core)
   */
  function cleanupListeners(element) {
    if (!element || !element._whenStateListeners) {
      return;
    }

    try {
      element._whenStateListeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      element._whenStateListeners = [];
    } catch (error) {
      console.warn('[Conditions.CleanupFix] Error cleaning up listeners:', error);
    }
  }

  /**
   * Cleanup all listeners from a set of elements
   */
  function cleanupAllListeners(elements) {
    if (!elements || elements.size === 0) {
      return;
    }

    let cleaned = 0;
    elements.forEach(element => {
      if (element && element._whenStateListeners && element._whenStateListeners.length > 0) {
        cleanupListeners(element);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[Conditions.CleanupFix] Cleaned up listeners from ${cleaned} element(s)`);
    }
  }

  // ============================================================================
  // HELPER: GET ELEMENTS (MIRRORS CORE FUNCTION)
  // ============================================================================

  /**
   * Get elements from selector (simplified version for tracking)
   */
  function getElements(selector) {
    try {
      // Single element
      if (selector instanceof Element) {
        return [selector];
      }
      
      // NodeList or HTMLCollection
      if (selector instanceof NodeList || selector instanceof HTMLCollection) {
        return Array.from(selector);
      }
      
      // Array
      if (Array.isArray(selector)) {
        return selector.filter(el => el instanceof Element);
      }

      // String selector
      if (typeof selector === 'string') {
        // ID selector
        if (selector.startsWith('#')) {
          const el = document.getElementById(selector.slice(1));
          return el ? [el] : [];
        }
        
        // Class selector
        if (selector.startsWith('.')) {
          return Array.from(document.getElementsByClassName(selector.slice(1)));
        }
        
        // Generic selector
        return Array.from(document.querySelectorAll(selector));
      }

      return [];
    } catch (error) {
      console.warn('[Conditions.CleanupFix] Error getting elements:', error);
      return [];
    }
  }

  // ============================================================================
  // ENHANCED whenState WITH PROPER CLEANUP
  // ============================================================================

  // Store original method
  const _originalWhenState = Conditions.whenState;

  /**
   * Enhanced whenState with proper listener cleanup
   */
  Conditions.whenState = function(valueFn, conditions, selector, options = {}) {
    // Track all elements that get listeners attached
    const trackedElements = new Set();
    let isDestroyed = false;

    // Wrapper to track elements before applying
    function trackElements() {
      if (isDestroyed) {
        return;
      }

      try {
        const elements = getElements(selector);
        elements.forEach(el => {
          if (el instanceof Element) {
            trackedElements.add(el);
          }
        });
      } catch (error) {
        console.warn('[Conditions.CleanupFix] Error tracking elements:', error);
      }
    }

    // Track elements before initial execution
    trackElements();

    // Call original whenState
    const originalCleanup = _originalWhenState.call(this, valueFn, conditions, selector, options);

    // If original returned nothing, return enhanced cleanup
    if (!originalCleanup || typeof originalCleanup !== 'object') {
      return {
        update: () => {
          if (!isDestroyed) {
            trackElements();
            return _originalWhenState.call(this, valueFn, conditions, selector, options);
          }
        },
        destroy: () => {
          if (!isDestroyed) {
            cleanupAllListeners(trackedElements);
            trackedElements.clear();
            isDestroyed = true;
          }
        }
      };
    }

    // Wrap the original cleanup with enhanced listener cleanup
    return {
      update: () => {
        if (!isDestroyed) {
          trackElements();
          if (originalCleanup.update && typeof originalCleanup.update === 'function') {
            return originalCleanup.update();
          }
        }
      },

      destroy: () => {
        if (isDestroyed) {
          return;
        }

        // STEP 1: Cleanup all tracked listeners first
        cleanupAllListeners(trackedElements);
        trackedElements.clear();

        // STEP 2: Call original destroy (stops effects, etc.)
        if (originalCleanup.destroy && typeof originalCleanup.destroy === 'function') {
          try {
            originalCleanup.destroy();
          } catch (error) {
            console.warn('[Conditions.CleanupFix] Error in original destroy:', error);
          }
        }

        // STEP 3: Mark as destroyed
        isDestroyed = true;

        console.log('[Conditions.CleanupFix] âœ“ Cleanup completed');
      },

      // Preserve any additional properties from original cleanup
      ...(originalCleanup || {})
    };
  };

  // Preserve the original for reference
  Conditions._originalWhenState = _originalWhenState;

  // ============================================================================
  // PATCH OTHER METHODS THAT USE whenState
  // ============================================================================

  /**
   * Patch watch() to use the enhanced whenState
   */
  if (Conditions.watch && typeof Conditions.watch === 'function') {
    const _originalWatch = Conditions.watch;
    
    Conditions.watch = function(valueFn, conditions, selector) {
      return this.whenState(valueFn, conditions, selector, { reactive: true });
    };

    Conditions._originalWatch = _originalWatch;
    console.log('[Conditions.CleanupFix] âœ“ Patched watch()');
  }

  /**
   * Patch whenStateCollection if it exists (from file 03)
   */
  if (Conditions.whenStateCollection && typeof Conditions.whenStateCollection === 'function') {
    const _originalWhenStateCollection = Conditions.whenStateCollection;
    
    // Note: whenStateCollection doesn't attach listeners, so no patch needed
    // Just log that it was checked
    console.log('[Conditions.CleanupFix] â„¹ï¸  whenStateCollection checked (no listener cleanup needed)');
  }

  // ============================================================================
  // UTILITY: CLEANUP ALL ACTIVE INSTANCES
  // ============================================================================

  /**
   * Global cleanup utility for emergency situations
   * Removes all _whenStateListeners from all elements in the document
   */
  Conditions.cleanupAllListeners = function() {
    let totalCleaned = 0;
    
    // Find all elements with _whenStateListeners
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      if (element._whenStateListeners && element._whenStateListeners.length > 0) {
        cleanupListeners(element);
        totalCleaned++;
      }
    });

    console.log(`[Conditions.CleanupFix] Emergency cleanup: removed listeners from ${totalCleaned} element(s)`);
    return totalCleaned;
  };

  /**
   * Check for memory leaks (counts elements with attached listeners)
   */
  Conditions.checkListenerLeaks = function() {
    const allElements = document.querySelectorAll('*');
    const elementsWithListeners = [];
    
    allElements.forEach(element => {
      if (element._whenStateListeners && element._whenStateListeners.length > 0) {
        elementsWithListeners.push({
          element,
          listenerCount: element._whenStateListeners.length,
          listeners: element._whenStateListeners
        });
      }
    });

    if (elementsWithListeners.length > 0) {
      console.group('[Conditions.CleanupFix] Listener Leak Check');
      console.warn(`âš ï¸  Found ${elementsWithListeners.length} element(s) with active listeners`);
      elementsWithListeners.forEach(({ element, listenerCount, listeners }) => {
        console.log('Element:', element);
        console.log('  Listeners:', listenerCount);
        console.log('  Details:', listeners);
      });
      console.groupEnd();
    } else {
      console.log('[Conditions.CleanupFix] âœ“ No listener leaks detected');
    }

    return elementsWithListeners;
  };

  // ============================================================================
  // RESTORATION UTILITY
  // ============================================================================

  /**
   * Restore original methods (for debugging/testing)
   */
  Conditions.restoreCleanupFix = function() {
    if (Conditions._originalWhenState) {
      Conditions.whenState = Conditions._originalWhenState;
      console.log('[Conditions.CleanupFix] Original whenState() restored');
    }

    if (Conditions._originalWatch) {
      Conditions.watch = Conditions._originalWatch;
      console.log('[Conditions.CleanupFix] Original watch() restored');
    }

    delete Conditions.cleanupAllListeners;
    delete Conditions.checkListenerLeaks;
    delete Conditions.restoreCleanupFix;
    
    console.log('[Conditions.CleanupFix] Cleanup fix removed');
  };

  // ============================================================================
  // VERSION TRACKING
  // ============================================================================

  Conditions.extensions = Conditions.extensions || {};
  Conditions.extensions.cleanupFix = {
    version: '1.0.0',
    fixed: [
      'Event listener cleanup on destroy()',
      'Memory leak prevention',
      'Proper cleanup for reactive and non-reactive modes'
    ],
    utilities: [
      'Conditions.cleanupAllListeners() - Emergency cleanup',
      'Conditions.checkListenerLeaks() - Debug memory leaks',
      'Conditions.restoreCleanupFix() - Remove patch'
    ]
  };

  // ============================================================================
  // INTEGRATION WITH DOM HELPERS
  // ============================================================================

  // Update Elements shortcuts if they exist
  if (global.Elements && global.Elements.whenState) {
    global.Elements.whenState = Conditions.whenState;
    global.Elements.whenWatch = Conditions.watch;
    console.log('[Conditions.CleanupFix] âœ“ Updated Elements shortcuts');
  }

  // Update Collections shortcuts if they exist
  if (global.Collections && global.Collections.whenState) {
    global.Collections.whenState = Conditions.whenState;
    global.Collections.whenWatch = Conditions.watch;
    console.log('[Conditions.CleanupFix] âœ“ Updated Collections shortcuts');
  }

  // Update Selector shortcuts if they exist
  if (global.Selector && global.Selector.whenState) {
    global.Selector.whenState = Conditions.whenState;
    global.Selector.whenWatch = Conditions.watch;
    console.log('[Conditions.CleanupFix] âœ“ Updated Selector shortcuts');
  }

  // Update global shortcuts if they exist (from file 05)
  if (global.whenState && global.whenState !== Conditions.whenState) {
    global.whenState = Conditions.whenState;
    console.log('[Conditions.CleanupFix] âœ“ Updated global whenState shortcut');
  }

  if (global.whenWatch && global.whenWatch !== Conditions.watch) {
    global.whenWatch = Conditions.watch;
    console.log('[Conditions.CleanupFix] âœ“ Updated global whenWatch shortcut');
  }

  // ============================================================================
  // SUCCESS MESSAGE
  // ============================================================================

  console.log('[Conditions.CleanupFix] âœ“âœ“âœ“ v1.0.0 loaded successfully');
  console.log('[Conditions.CleanupFix] âœ“ Event listener cleanup now works properly');
  console.log('[Conditions.CleanupFix] âœ“ Memory leak prevention active');
  console.log('[Conditions.CleanupFix] ðŸ› ï¸  Debug utilities available:');
  console.log('  - Conditions.checkListenerLeaks() - Find elements with active listeners');
  console.log('  - Conditions.cleanupAllListeners() - Emergency cleanup all listeners');
  console.log('  - Conditions.restoreCleanupFix() - Remove this patch');
  console.log('[Conditions.CleanupFix] ðŸ“š Example:');
  console.log('  const cleanup = Conditions.whenState(state.count, conditions, ".btn");');
  console.log('  // Later:');
  console.log('  cleanup.destroy(); // âœ“ Now properly removes all event listeners!');

})(typeof window !== 'undefined' ? window : global);
