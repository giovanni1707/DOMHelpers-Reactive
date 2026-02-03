/**
 * 01_dh-reactive
 * 
 * DOM Helpers - Reactive State Extension v2.0.2
 * Production-ready with all README features
 * @license MIT
 */

(function(global) {
  'use strict';

  const hasElements = !!global.Elements;
  const hasCollections = !!global.Collections;
  const hasSelector = !!global.Selector;

  // State management
  const reactiveMap = new WeakMap();
  let currentEffect = null;
  let batchDepth = 0;
  let pendingUpdates = new Set();

  const RAW = Symbol('raw');
  const IS_REACTIVE = Symbol('reactive');

  // Utilities
  function isReactive(v) {
    return !!(v && v[IS_REACTIVE]);
  }

  function toRaw(v) {
    return (v && v[RAW]) || v;
  }

  // Batching
  function batch(fn) {
    batchDepth++;
    try {
      return fn();
    } finally {
      batchDepth--;
      if (batchDepth === 0) flush();
    }
  }

  function flush() {
    if (pendingUpdates.size === 0) return;
    const updates = Array.from(pendingUpdates);
    pendingUpdates.clear();
    updates.forEach(fn => {
      try { fn(); } 
      catch (e) { console.error('[Reactive] Error:', e); }
    });
  }

  function queueUpdate(fn) {
    if (batchDepth > 0) {
      pendingUpdates.add(fn);
    } else {
      fn();
    }
  }

  // Create reactive proxy
  /*function createReactive(target) {
    if (!target || typeof target !== 'object') return target;
    if (isReactive(target)) return target;

    const deps = new Map();
    const computedMap = new Map();

    const proxy = new Proxy(target, {
      get(obj, key) {
        if (key === RAW) return target;
        if (key === IS_REACTIVE) return true;

        // Track dependency
        if (currentEffect && typeof key !== 'symbol') {
          if (!deps.has(key)) deps.set(key, new Set());
          deps.get(key).add(currentEffect);
          if (currentEffect.onDep) currentEffect.onDep(key);
        }

        let value = obj[key];

        // Handle computed
        if (computedMap.has(key)) {
          const comp = computedMap.get(key);
          if (comp.dirty) {
            comp.deps.clear();
            const prevEffect = currentEffect;
            currentEffect = { 
              isComputed: true,
              onDep: (k) => comp.deps.add(k)
            };
            try {
              value = comp.fn.call(proxy);
              comp.value = value;
              comp.dirty = false;
            } finally {
              currentEffect = prevEffect;
            }
          }
          value = comp.value;
          
          // Track computed as dependency
          if (currentEffect && !currentEffect.isComputed) {
            if (!deps.has(key)) deps.set(key, new Set());
            deps.get(key).add(currentEffect);
          }
          
          return value;
        }

        // Deep reactivity
        if (value && typeof value === 'object' && !isReactive(value)) {
          value = createReactive(value);
          obj[key] = value;
        }

        return value;
      },

      set(obj, key, value) {
        if (obj[key] === value) return true;
        obj[key] = toRaw(value);
        
        // Trigger updates
        const effects = deps.get(key);
        if (effects) {
          // Mark computed as dirty and notify their dependents
          computedMap.forEach((comp, compKey) => {
            if (comp.deps.has(key)) {
              comp.dirty = true;
              const compDeps = deps.get(compKey);
              if (compDeps) {
                compDeps.forEach(effect => {
                  if (effect && !effect.isComputed) {
                    queueUpdate(effect);
                  }
                });
              }
            }
          });
          
          // Schedule effect updates
          effects.forEach(effect => {
            if (effect && !effect.isComputed) {
              queueUpdate(effect);
            }
          });
        }
        
        return true;
      }
    }); */


function createReactive(target) {
  if (!target || typeof target !== 'object') return target;
  if (isReactive(target)) return target;
  
  // ============================================================================
  // ADD THIS: Don't make built-in objects reactive
  // ============================================================================
  const skipReactive = [
    'AbortController',
    'AbortSignal', 
    'Promise',
    'Date',
    'RegExp',
    'Error',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet'
  ];
  
  const constructorName = target.constructor?.name;
  if (constructorName && skipReactive.includes(constructorName)) {
    return target;
  }
  
  // Also skip DOM nodes
  if (typeof Node !== 'undefined' && target instanceof Node) {
    return target;
  }
  
  if (typeof Element !== 'undefined' && target instanceof Element) {
    return target;
  }
  // ============================================================================

  const deps = new Map();
  const computedMap = new Map();

  const proxy = new Proxy(target, {
    get(obj, key) {
      if (key === RAW) return target;
      if (key === IS_REACTIVE) return true;

      // Track dependency
      if (currentEffect && typeof key !== 'symbol') {
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key).add(currentEffect);
        if (currentEffect.onDep) currentEffect.onDep(key);
      }

      let value = obj[key];

      // Handle computed
      if (computedMap.has(key)) {
        const comp = computedMap.get(key);
        if (comp.dirty) {
          comp.deps.clear();
          const prevEffect = currentEffect;
          currentEffect = { 
            isComputed: true,
            onDep: (k) => comp.deps.add(k)
          };
          try {
            value = comp.fn.call(proxy);
            comp.value = value;
            comp.dirty = false;
          } finally {
            currentEffect = prevEffect;
          }
        }
        value = comp.value;
        
        if (currentEffect && !currentEffect.isComputed) {
          if (!deps.has(key)) deps.set(key, new Set());
          deps.get(key).add(currentEffect);
        }
        
        return value;
      }

      // Deep reactivity - BUT skip built-in objects
     /* if (value && typeof value === 'object' && !isReactive(value)) {
        // Check if it's a built-in object before making reactive
        const valueConstructor = value.constructor?.name;
        const shouldSkip = valueConstructor && skipReactive.includes(valueConstructor);
        
        if (!shouldSkip && !(value instanceof Node) && !(value instanceof Element)) {
          value = createReactive(value);
          obj[key] = value;
        }
      }

      return value;
    }, */
    

// Deep reactivity - BUT skip built-in objects
if (value && typeof value === 'object' && !isReactive(value)) {
  // Check if it's a built-in object before making reactive
  const valueConstructor = value.constructor?.name;
  const shouldSkip = valueConstructor && skipReactive.includes(valueConstructor);
  
  if (!shouldSkip && !(value instanceof Node) && !(value instanceof Element)) {
    value = createReactive(value);
    
    // Check if property is writable before assigning
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    const isWritable = !descriptor || (descriptor.writable !== false && !descriptor.get);
    
    if (isWritable) {
      obj[key] = value;
    }
  }
}

return value;
    },


    set(obj, key, value) {
      if (obj[key] === value) return true;
      
      // Don't try to convert built-in objects
      const rawValue = toRaw(value);
      const constructorName = rawValue?.constructor?.name;
      const shouldSkip = constructorName && skipReactive.includes(constructorName);
      
      if (shouldSkip || rawValue instanceof Node || rawValue instanceof Element) {
        obj[key] = rawValue; // Store as-is without making reactive
      } else {
        obj[key] = rawValue;
      }
      
      // Trigger updates
      const effects = deps.get(key);
      if (effects) {
        computedMap.forEach((comp, compKey) => {
          if (comp.deps.has(key)) {
            comp.dirty = true;
            const compDeps = deps.get(compKey);
            if (compDeps) {
              compDeps.forEach(effect => {
                if (effect && !effect.isComputed) {
                  queueUpdate(effect);
                }
              });
            }
          }
        });
        
        effects.forEach(effect => {
          if (effect && !effect.isComputed) {
            queueUpdate(effect);
          }
        });
      }
      
      return true;
    }
  });

  



    reactiveMap.set(proxy, { deps, computedMap });
    
    // Add instance methods (check if they don't already exist)
    if (!proxy.$computed) {
      Object.defineProperties(proxy, {
        $computed: {
          value: function(key, fn) {
            addComputed(this, key, fn);
            return this;
          },
          writable: true,
          enumerable: false,
          configurable: true
        },
        $watch: {
          value: function(keyOrFn, callback) {
            return addWatch(this, keyOrFn, callback);
          },
          writable: true,
          enumerable: false,
          configurable: true
        },
        $batch: {
          value: function(fn) {
            return batch(() => fn.call(this));
          },
          writable: true,
          enumerable: false,
          configurable: true
        },
        $notify: {
          value: function(key) {
            notify(this, key);
          },
          writable: true,
          enumerable: false,
          configurable: true
        },
        $raw: {
          get() { return toRaw(this); },
        
          enumerable: false,
          configurable: true
        },
        $update: {
          value: function(updates) {
            return updateMixed(this, updates);
          },
          writable: true,
          enumerable: false,
          configurable: true
        },
        $set: {
          value: function(updates) {
            return setWithFunctions(this, updates);
          },
          writable: true,
          enumerable: false,
          configurable: true
        },
        $bind: {
          value: function(bindingDefs) {
            return createBindings(this, bindingDefs);
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
    }

    return proxy;
  }

  // Effect
  function effect(fn) {
    const execute = () => {
      const prevEffect = currentEffect;
      currentEffect = execute;
      try {
        fn();
      } finally {
        currentEffect = prevEffect;
      }
    };
    execute();
    return () => { currentEffect = null; };
  }

  // Computed
  function addComputed(state, key, fn) {
    const meta = reactiveMap.get(state);
    if (!meta) {
      console.error('[Reactive] Cannot add computed to non-reactive state');
      return;
    }

    const comp = {
      fn,
      value: undefined,
      dirty: true,
      deps: new Set()
    };

    meta.computedMap.set(key, comp);

    Object.defineProperty(state, key, {
      get() {
        if (comp.dirty) {
          comp.deps.clear();
          const prevEffect = currentEffect;
          currentEffect = {
            isComputed: true,
            onDep: (k) => comp.deps.add(k)
          };
          try {
            comp.value = fn.call(state);
            comp.dirty = false;
          } finally {
            currentEffect = prevEffect;
          }
        }
        
        if (currentEffect && !currentEffect.isComputed) {
          if (!meta.deps.has(key)) meta.deps.set(key, new Set());
          meta.deps.get(key).add(currentEffect);
        }
        
        return comp.value;
      },
      enumerable: true,
      configurable: true
    });
  }

  // Watch
  function addWatch(state, keyOrFn, callback) {
    let oldValue;
    if (typeof keyOrFn === 'function') {
      oldValue = keyOrFn.call(state);
      return effect(() => {
        const newValue = keyOrFn.call(state);
        if (newValue !== oldValue) {
          callback(newValue, oldValue);
          oldValue = newValue;
        }
      });
    } else {
      oldValue = state[keyOrFn];
      return effect(() => {
        const newValue = state[keyOrFn];
        if (newValue !== oldValue) {
          callback(newValue, oldValue);
          oldValue = newValue;
        }
      });
    }
  }

  // Notify
  function notify(state, key) {
    const meta = reactiveMap.get(state);
    if (!meta) return;
    
    if (key) {
      const effects = meta.deps.get(key);
      if (effects) {
        effects.forEach(e => e && !e.isComputed && queueUpdate(e));
      }
    } else {
      meta.deps.forEach(effects => {
        effects.forEach(e => e && !e.isComputed && queueUpdate(e));
      });
    }
  }

  // Bindings
  function bindings(defs) {
    const cleanups = [];
    
    Object.entries(defs).forEach(([selector, bindingDef]) => {
      let elements = [];
      
      if (selector.startsWith('#')) {
        const el = document.getElementById(selector.slice(1));
        if (el) elements = [el];
      } else if (selector.startsWith('.')) {
        elements = Array.from(document.getElementsByClassName(selector.slice(1)));
      } else {
        elements = Array.from(document.querySelectorAll(selector));
      }

      elements.forEach(el => {
        if (typeof bindingDef === 'function') {
          cleanups.push(effect(() => {
            const value = bindingDef();
            applyValue(el, null, value);
          }));
        } else if (typeof bindingDef === 'object') {
          Object.entries(bindingDef).forEach(([prop, fn]) => {
            if (typeof fn === 'function') {
              cleanups.push(effect(() => {
                const value = fn();
                applyValue(el, prop, value);
              }));
            }
          });
        }
      });
    });

    return () => cleanups.forEach(c => c());
  }

  function applyValue(el, prop, value) {
    if (value == null) {
      if (prop) el[prop] = '';
      else el.textContent = '';
      return;
    }

    const type = typeof value;
    
    if (type === 'string' || type === 'number' || type === 'boolean') {
      if (prop) {
        if (prop in el) el[prop] = value;
        else el.setAttribute(prop, String(value));
      } else {
        el.textContent = String(value);
      }
    } else if (Array.isArray(value)) {
      if (prop === 'classList' || prop === 'className') {
        el.className = value.filter(Boolean).join(' ');
      } else if (!prop) {
        el.textContent = value.join(', ');
      }
    } else if (type === 'object') {
      if (prop === 'style') {
        Object.entries(value).forEach(([k, v]) => el.style[k] = v);
      } else if (prop === 'dataset') {
        Object.entries(value).forEach(([k, v]) => el.dataset[k] = String(v));
      } else if (!prop) {
        Object.entries(value).forEach(([k, v]) => {
          if (k === 'style' && typeof v === 'object') {
            Object.entries(v).forEach(([sk, sv]) => el.style[sk] = sv);
          } else if (k in el) {
            el[k] = v;
          }
        });
      }
    }
  }

  // Helper function to set nested properties
  function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // state.$update() - Mixed state + DOM updates
  function updateMixed(state, updates) {
    return batch(() => {
      Object.entries(updates).forEach(([key, value]) => {
        // Check if it's a DOM selector
        if (key.startsWith('#') || key.startsWith('.') || key.includes('[') || key.includes('>')) {
          updateDOMElements(key, value);
        } else {
          // It's a state update
          if (key.includes('.')) {
            setNestedProperty(state, key, value);
          } else {
            state[key] = value;
          }
        }
      });
      return state;
    });
  }

  // state.$set() - Functional updates
  function setWithFunctions(state, updates) {
    return batch(() => {
      Object.entries(updates).forEach(([key, value]) => {
        const finalValue = typeof value === 'function' 
          ? value(key.includes('.') ? getNestedProperty(state, key) : state[key])
          : value;
        
        if (key.includes('.')) {
          setNestedProperty(state, key, finalValue);
        } else {
          state[key] = finalValue;
        }
      });
      return state;
    });
  }

  // Helper to get nested property
  function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Update DOM elements by selector
  function updateDOMElements(selector, updates) {
    let elements = [];
    
    if (selector.startsWith('#')) {
      const el = document.getElementById(selector.slice(1));
      if (el) elements = [el];
    } else if (selector.startsWith('.')) {
      elements = Array.from(document.getElementsByClassName(selector.slice(1)));
    } else {
      elements = Array.from(document.querySelectorAll(selector));
    }

    elements.forEach(el => {
      if (typeof updates === 'object' && updates !== null) {
        Object.entries(updates).forEach(([prop, value]) => {
          applyValue(el, prop, value);
        });
      } else {
        applyValue(el, null, updates);
      }
    });
  }

  // Create bindings that auto-update on state changes
  function createBindings(state, bindingDefs) {
    const cleanups = [];
    
    Object.entries(bindingDefs).forEach(([selector, binding]) => {
      let elements = [];
      
      if (selector.startsWith('#')) {
        const el = document.getElementById(selector.slice(1));
        if (el) elements = [el];
      } else if (selector.startsWith('.')) {
        elements = Array.from(document.getElementsByClassName(selector.slice(1)));
      } else {
        elements = Array.from(document.querySelectorAll(selector));
      }

      elements.forEach(el => {
        if (typeof binding === 'string') {
          // Simple property binding: '#counter': 'count'
          cleanups.push(effect(() => {
            const value = binding.includes('.') 
              ? getNestedProperty(state, binding)
              : state[binding];
            applyValue(el, null, value);
          }));
        } else if (typeof binding === 'function') {
          // Computed binding: '#userName': () => state.user.name
          cleanups.push(effect(() => {
            const value = binding.call(state);
            applyValue(el, null, value);
          }));
        } else if (typeof binding === 'object') {
          // Multiple property bindings
          Object.entries(binding).forEach(([prop, value]) => {
            if (typeof value === 'function') {
              cleanups.push(effect(() => {
                const result = value.call(state);
                applyValue(el, prop, result);
              }));
            } else if (typeof value === 'string') {
              cleanups.push(effect(() => {
                const result = value.includes('.')
                  ? getNestedProperty(state, value)
                  : state[value];
                applyValue(el, prop, result);
              }));
            }
          });
        }
      });
    });

    return () => cleanups.forEach(c => c());
  }

  // createState with auto-bindings
  function createStateWithBindings(initialState, bindingDefs) {
    const state = createReactive(initialState);
    
    if (bindingDefs) {
      createBindings(state, bindingDefs);
    }
    
    return state;
  }

  // Unified updateAll
  function updateAll(state, updates) {
    return updateMixed(state, updates);
  }

  // Ref
  function ref(value) {
    const state = createReactive({ value });
    state.valueOf = function() { return this.value; };
    state.toString = function() { return String(this.value); };
    return state;
  }

  // Collection
  function collection(items = []) {
    const state = createReactive({ items });
    
    state.$add = function(item) {
      this.items.push(item);
    };
    
    state.$remove = function(predicate) {
      const idx = typeof predicate === 'function'
        ? this.items.findIndex(predicate)
        : this.items.indexOf(predicate);
      if (idx !== -1) this.items.splice(idx, 1);
    };
    
    state.$update = function(predicate, updates) {
      const idx = typeof predicate === 'function'
        ? this.items.findIndex(predicate)
        : this.items.indexOf(predicate);
      if (idx !== -1) Object.assign(this.items[idx], updates);
    };
    
    state.$clear = function() {
      this.items.length = 0;
    };
    
    return state;
  }

  // Form
  function form(initialValues = {}) {
    const state = createReactive({
      values: { ...initialValues },
      errors: {},
      touched: {},
      isSubmitting: false
    });

    addComputed(state, 'isValid', function() {
      const errorKeys = Object.keys(this.errors);
      return errorKeys.length === 0 || errorKeys.every(k => !this.errors[k]);
    });

    addComputed(state, 'isDirty', function() {
      return Object.keys(this.touched).length > 0;
    });

    state.$setValue = function(field, value) {
      this.values[field] = value;
      this.touched[field] = true;
    };

    state.$setError = function(field, error) {
      if (error) this.errors[field] = error;
      else delete this.errors[field];
    };

    state.$reset = function(newValues = initialValues) {
      this.values = { ...newValues };
      this.errors = {};
      this.touched = {};
    };

    return state;
  }

  // Async
  function asyncState(initialValue = null) {
    const state = createReactive({
      data: initialValue,
      loading: false,
      error: null
    });

    addComputed(state, 'isSuccess', function() {
      return !this.loading && !this.error && this.data !== null;
    });

    addComputed(state, 'isError', function() {
      return !this.loading && this.error !== null;
    });

    state.$execute = async function(fn) {
      this.loading = true;
      this.error = null;
      try {
        const result = await fn();
        this.data = result;
        return result;
      } catch (e) {
        this.error = e;
        throw e;
      } finally {
        this.loading = false;
      }
    };

    state.$reset = function() {
      this.data = initialValue;
      this.loading = false;
      this.error = null;
    };

    return state;
  }

  // Store
  function store(initialState, options = {}) {
    const state = createReactive(initialState);

    if (options.getters) {
      Object.entries(options.getters).forEach(([key, fn]) => {
        addComputed(state, key, fn);
      });
    }

    if (options.actions) {
      Object.entries(options.actions).forEach(([name, fn]) => {
        state[name] = function(...args) {
          return fn(this, ...args);
        };
      });
    }

    return state;
  }

  // Component
  function component(config) {
    const state = createReactive(config.state || {});

    if (config.computed) {
      Object.entries(config.computed).forEach(([key, fn]) => {
        addComputed(state, key, fn);
      });
    }

    const cleanups = [];
    
    if (config.watch) {
      Object.entries(config.watch).forEach(([key, callback]) => {
        cleanups.push(addWatch(state, key, callback));
      });
    }

    if (config.effects) {
      Object.values(config.effects).forEach(fn => {
        cleanups.push(effect(fn));
      });
    }

    if (config.bindings) {
      cleanups.push(bindings(config.bindings));
    }

    if (config.actions) {
      Object.entries(config.actions).forEach(([name, fn]) => {
        state[name] = function(...args) {
          return fn(this, ...args);
        };
      });
    }

    if (config.mounted) {
      config.mounted.call(state);
    }

    state.$destroy = function() {
      cleanups.forEach(c => c());
      if (config.unmounted) {
        config.unmounted.call(this);
      }
    };

    return state;
  }

  // Reactive builder
  function reactive(initialState) {
    const state = createReactive(initialState);
    const cleanups = [];

    const builder = {
      state,
      computed(defs) {
        Object.entries(defs).forEach(([k, fn]) => addComputed(state, k, fn));
        return this;
      },
      watch(defs) {
        Object.entries(defs).forEach(([k, cb]) => {
          cleanups.push(addWatch(state, k, cb));
        });
        return this;
      },
      effect(fn) {
        cleanups.push(effect(fn));
        return this;
      },
      bind(defs) {
        cleanups.push(bindings(defs));
        return this;
      },
      action(name, fn) {
        state[name] = function(...args) { return fn(this, ...args); };
        return this;
      },
      actions(defs) {
        Object.entries(defs).forEach(([name, fn]) => this.action(name, fn));
        return this;
      },
      build() {
        state.destroy = () => cleanups.forEach(c => c());
        return state;
      },
      destroy() {
        cleanups.forEach(c => c());
      }
    };

    return builder;
  }

  // API
  const ReactiveState = {
    create: createReactive,
    form,
    async: asyncState,
    collection
  };

  const api = {
    state: createReactive,
    createState: createStateWithBindings,
    updateAll: updateAll,
    computed: (state, defs) => {
      Object.entries(defs).forEach(([k, fn]) => addComputed(state, k, fn));
      return state;
    },
    watch: (state, defs) => {
      const cleanups = Object.entries(defs).map(([k, cb]) => addWatch(state, k, cb));
      return () => cleanups.forEach(c => c());
    },
    effect,
    effects: (defs) => {
      const cleanups = Object.values(defs).map(fn => effect(fn));
      return () => cleanups.forEach(c => c());
    },
    ref,
    refs: (defs) => {
      const result = {};
      Object.entries(defs).forEach(([k, v]) => result[k] = ref(v));
      return result;
    },
    form,                  
    async: asyncState, 
    store,
    component,
    reactive,
    builder: reactive,
    bindings,
    list: collection,
    collection: collection, 
    batch,
    isReactive,
    toRaw,
    notify,
    pause: () => batchDepth++,
    resume: (fl) => {
      batchDepth = Math.max(0, batchDepth - 1);
      if (fl && batchDepth === 0) flush();
    },
    untrack: (fn) => {
      const prev = currentEffect;
      currentEffect = null;
      try {
        return fn();
      } finally {
        currentEffect = prev;
      }
    }
  };

  // Integration
  if (hasElements) {
    Object.assign(global.Elements, api);
    
    // Elements.bind for ID-based bindings
    global.Elements.bind = function(bindingDefs) {
      Object.entries(bindingDefs).forEach(([id, bindingDef]) => {
        const element = document.getElementById(id);
        if (element) {
          if (typeof bindingDef === 'function') {
            effect(() => applyValue(element, null, bindingDef()));
          } else if (typeof bindingDef === 'object') {
            Object.entries(bindingDef).forEach(([prop, fn]) => {
              if (typeof fn === 'function') {
                effect(() => applyValue(element, prop, fn()));
              }
            });
          }
        }
      });
    };
  }
  
  if (hasCollections) {
    Object.assign(global.Collections, api);
    
    // Collections.bind for class-based bindings
    global.Collections.bind = function(bindingDefs) {
      Object.entries(bindingDefs).forEach(([className, bindingDef]) => {
        const elements = document.getElementsByClassName(className);
        Array.from(elements).forEach(element => {
          if (typeof bindingDef === 'function') {
            effect(() => applyValue(element, null, bindingDef()));
          } else if (typeof bindingDef === 'object') {
            Object.entries(bindingDef).forEach(([prop, fn]) => {
              if (typeof fn === 'function') {
                effect(() => applyValue(element, prop, fn()));
              }
            });
          }
        });
      });
    };
  }
  
  if (hasSelector) {
    Object.assign(global.Selector, api);
    
    // Selector.query for single element queries
    if (global.Selector.query) {
      Object.assign(global.Selector.query, api);
      
      global.Selector.query.bind = function(bindingDefs) {
        Object.entries(bindingDefs).forEach(([selector, bindingDef]) => {
          const element = document.querySelector(selector);
          if (element) {
            if (typeof bindingDef === 'function') {
              effect(() => applyValue(element, null, bindingDef()));
            } else if (typeof bindingDef === 'object') {
              Object.entries(bindingDef).forEach(([prop, fn]) => {
                if (typeof fn === 'function') {
                  effect(() => applyValue(element, prop, fn()));
                }
              });
            }
          }
        });
      };
    }
    
    // Selector.queryAll for multiple element queries
    if (global.Selector.queryAll) {
      Object.assign(global.Selector.queryAll, api);
      
      global.Selector.queryAll.bind = function(bindingDefs) {
        Object.entries(bindingDefs).forEach(([selector, bindingDef]) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (typeof bindingDef === 'function') {
              effect(() => applyValue(element, null, bindingDef()));
            } else if (typeof bindingDef === 'object') {
              Object.entries(bindingDef).forEach(([prop, fn]) => {
                if (typeof fn === 'function') {
                  effect(() => applyValue(element, prop, fn()));
                }
              });
            }
          });
        });
      };
    }
  }

  global.ReactiveState = ReactiveState;
  global.ReactiveUtils = api;
  
  // Global updateAll method
  global.updateAll = updateAll;
  
})(typeof window !== 'undefined' ? window : global);

/** 
 * 01b_dh-reactive-iteration-utilities
 *
 * Iterates over an object's entries using Object.entries() and forEach()
 * @param {Object} obj - The object to iterate over
 * @param {Function} callback - Function called for each entry (key, value, index)
 * @param {string} [selector] - Optional CSS selector to render output (e.g., '#output', '.container')
 * @returns {string|undefined} Returns accumulated HTML if callback returns strings, otherwise undefined
 */

function eachEntries(obj, callback, selector) {
  if (obj === null || typeof obj !== 'object') {
    console.warn('eachEntries: First argument must be an object');
    return '';
  }
  
  let html = '';
  let isReturningHTML = false;
  
  Object.entries(obj).forEach(([key, value], index) => {
    const result = callback(key, value, index);
    if (result !== undefined) {
      html += result;
      isReturningHTML = true;
    }
  });
  
  const output = isReturningHTML ? html : undefined;
  
  // Render to UI if selector provided
  if (selector && typeof selector === 'string') {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = output || '';
      } else {
        console.warn(`eachEntries: Element not found for selector "${selector}"`);
      }
    } catch (error) {
      console.warn(`eachEntries: Invalid selector "${selector}"`, error);
    }
  }
  
  return output;
}


/**
 * Maps over an object's entries using Object.entries() and map()
 * @param {Object} obj - The object to map over
 * @param {Function} callback - Function called for each entry (key, value, index) - should return new value
 * @param {boolean|string} joinHTMLOrSelector - If true, joins array as HTML. If string, treats as CSS selector and renders
 * @param {string} [selector] - Optional CSS selector when joinHTMLOrSelector is boolean
 * @returns {Array|string} Array of transformed values, or joined HTML string if joinHTML is true
 */
function mapEntries(obj, callback, joinHTMLOrSelector, selector) {
  if (obj === null || typeof obj !== 'object') {
    console.warn('mapEntries: First argument must be an object');
    const empty = (typeof joinHTMLOrSelector === 'boolean' && joinHTMLOrSelector) ? '' : [];
    return empty;
  }
  
  const result = Object.entries(obj).map(([key, value], index) => {
    return callback(key, value, index);
  });
  
  // Determine if we should join and where to render
  let joinHTML = false;
  let targetSelector = null;
  
  if (typeof joinHTMLOrSelector === 'boolean') {
    joinHTML = joinHTMLOrSelector;
    targetSelector = selector;
  } else if (typeof joinHTMLOrSelector === 'string') {
    joinHTML = true;
    targetSelector = joinHTMLOrSelector;
  }
  
  const output = joinHTML ? result.join('') : result;
  
  // Render to UI if selector provided
  if (targetSelector && typeof targetSelector === 'string') {
    try {
      const element = document.querySelector(targetSelector);
      if (element) {
        element.innerHTML = joinHTML ? output : output.join('');
      } else {
        console.warn(`mapEntries: Element not found for selector "${targetSelector}"`);
      }
    } catch (error) {
      console.warn(`mapEntries: Invalid selector "${targetSelector}"`, error);
    }
  }
  
  return output;
}



/**
 * 02_dh-reactive-array-patch
 * 
 * Reactive Array Patch v1.0.1
 * Makes array methods (push, pop, sort, etc.) work with reactive state
 * Load this AFTER reactive-state.js
 * @license MIT
 */

(function(global) {
  'use strict';

  // Check if ReactiveUtils exists
  if (!global.ReactiveUtils) {
    console.error('[Reactive Array Patch] ReactiveUtils not found. Load reactive-state.js first.');
    return;
  }

  const ReactiveUtils = global.ReactiveUtils;
  const originalCreate = ReactiveUtils.state;

  // Array methods that mutate the array
  const ARRAY_MUTATIONS = [
    'push', 'pop', 'shift', 'unshift', 'splice',
    'sort', 'reverse', 'fill', 'copyWithin'
  ];

  /**
   * Enhanced reactive state creation with array support
   */
  function createReactiveWithArraySupport(target) {
    const state = originalCreate(target);
    
    // Patch array properties
    patchArrayProperties(state, target);
    
    return state;
  }

  /**
   * Recursively patch all array properties in an object
   */
  function patchArrayProperties(state, obj, path = '') {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const fullPath = path ? `${path}.${key}` : key;
      
      if (Array.isArray(value)) {
        patchArrayMethods(state, key, fullPath);
      } else if (value && typeof value === 'object' && value.constructor === Object) {
        // Recursively patch nested objects
        patchArrayProperties(state, value, fullPath);
      }
    });
  }

  /**
   * Patch array methods on a specific property
   */
  function patchArrayMethods(state, key, fullPath) {
    const getArray = () => {
      if (fullPath.includes('.')) {
        return getNestedProperty(state, fullPath);
      }
      return state[key];
    };

    const setArray = (newValue) => {
      if (fullPath.includes('.')) {
        setNestedProperty(state, fullPath, newValue);
      } else {
        state[key] = newValue;
      }
    };

    // Watch for when the array is accessed
    const checkAndPatch = () => {
      const arr = getArray();
      if (!arr || !Array.isArray(arr) || arr.__patched) return;

      // Mark as patched to avoid double-patching
      Object.defineProperty(arr, '__patched', {
        value: true,
        enumerable: false,
        configurable: false
      });

      ARRAY_MUTATIONS.forEach(method => {
        const original = Array.prototype[method];
        
        Object.defineProperty(arr, method, {
          value: function(...args) {
            // Call original method
            const result = original.apply(this, args);
            
            // Trigger reactivity by reassigning
            const updatedArray = [...this];
            setArray(updatedArray);
            
            return result;
          },
          enumerable: false,
          configurable: true,
          writable: true
        });
      });
    };

    // Initial patch
    checkAndPatch();

    // Watch for array replacement and re-patch
    if (state.$watch) {
      state.$watch(key, () => {
        checkAndPatch();
      });
    }
  }

  /**
   * Get nested property value
   */
  function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested property value
   */
  function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // Override the state creation function
  ReactiveUtils.state = createReactiveWithArraySupport;

  // Also patch Elements, Collections, Selector if they exist
  if (global.Elements) {
    global.Elements.state = createReactiveWithArraySupport;
  }
  if (global.Collections) {
    global.Collections.state = createReactiveWithArraySupport;
  }
  if (global.Selector) {
    global.Selector.state = createReactiveWithArraySupport;
  }

  // ============================================================
  // MAIN FIX: Create the manual patching function
  // ============================================================
  function patchReactiveArray(state, key) {
    if (!state || !state[key]) {
      console.error('[Reactive Array Patch] Invalid state or key');
      return;
    }
    patchArrayMethods(state, key, key);
  }

  // Provide manual patching function as global
  global.patchReactiveArray = patchReactiveArray;

  // ============================================================
  // NEW: Add alias to ReactiveUtils for better API consistency
  // ============================================================
  if (ReactiveUtils) {
    ReactiveUtils.patchArray = patchReactiveArray;
  }

  // Also add to Elements, Collections, Selector for consistency
  if (global.Elements) {
    global.Elements.patchArray = patchReactiveArray;
  }
  if (global.Collections) {
    global.Collections.patchArray = patchReactiveArray;
  }
  if (global.Selector) {
    global.Selector.patchArray = patchReactiveArray;
  }

})(typeof window !== 'undefined' ? window : global);
/**
 * 03_dh-reactive-collections
 * 
 * Collections Extension for DOM Helpers Reactive State
 * Standalone file - no library modifications needed
 * @license MIT
 */

(function(global) {
  'use strict';

  // Check if ReactiveUtils exists
  if (!global.ReactiveUtils) {
    console.error('[Collections] ReactiveUtils not found. Please load the reactive library first.');
    return;
  }

  const { state: createState, batch } = global.ReactiveUtils;

  /**
   * Create a reactive collection with array management methods
   * @param {Array} items - Initial items
   * @returns {Object} Reactive collection
   */
  function createCollection(items = []) {
    // Create the base object with items array and methods BEFORE making it reactive
    const collectionObj = {
      items: [...items]
    };

    // Make it reactive first
    const collection = createState(collectionObj);

    // Now add collection-specific methods that won't conflict
    // These are added after reactive proxy creation
    const methods = {
      add(item) {
        this.items.push(item);
        return this;
      },
      
      remove(predicate) {
        const idx = typeof predicate === 'function'
          ? this.items.findIndex(predicate)
          : this.items.indexOf(predicate);
        if (idx !== -1) {
          this.items.splice(idx, 1);
        }
        return this;
      },
      
      update(predicate, updates) {
        const idx = typeof predicate === 'function'
          ? this.items.findIndex(predicate)
          : this.items.indexOf(predicate);
        if (idx !== -1) {
          Object.assign(this.items[idx], updates);
        }
        return this;
      },
      
      clear() {
        this.items.length = 0;
        return this;
      },
      
      find(predicate) {
        return typeof predicate === 'function'
          ? this.items.find(predicate)
          : this.items.find(item => item === predicate);
      },
      
      filter(predicate) {
        return this.items.filter(predicate);
      },
      
      map(fn) {
        return this.items.map(fn);
      },
      
      forEach(fn) {
        this.items.forEach(fn);
        return this;
      },
      
      sort(compareFn) {
        this.items.sort(compareFn);
        return this;
      },
      
      reverse() {
        this.items.reverse();
        return this;
      },
      
      get length() {
        return this.items.length;
      },
      
      get first() {
        return this.items[0];
      },
      
      get last() {
        return this.items[this.items.length - 1];
      },
      
      at(index) {
        return this.items[index];
      },
      
      includes(item) {
        return this.items.includes(item);
      },
      
      indexOf(item) {
        return this.items.indexOf(item);
      },
      
      slice(start, end) {
        return this.items.slice(start, end);
      },
      
      splice(start, deleteCount, ...items) {
        this.items.splice(start, deleteCount, ...items);
        return this;
      },
      
      push(...items) {
        this.items.push(...items);
        return this;
      },
      
      pop() {
        return this.items.pop();
      },
      
      shift() {
        return this.items.shift();
      },
      
      unshift(...items) {
        this.items.unshift(...items);
        return this;
      },
      
      toggle(predicate, field = 'done') {
        const idx = typeof predicate === 'function'
          ? this.items.findIndex(predicate)
          : this.items.indexOf(predicate);
        if (idx !== -1 && this.items[idx]) {
          this.items[idx][field] = !this.items[idx][field];
        }
        return this;
      },
      
      removeWhere(predicate) {
        for (let i = this.items.length - 1; i >= 0; i--) {
          if (predicate(this.items[i], i)) {
            this.items.splice(i, 1);
          }
        }
        return this;
      },
      
      updateWhere(predicate, updates) {
        this.items.forEach((item, idx) => {
          if (predicate(item, idx)) {
            Object.assign(this.items[idx], updates);
          }
        });
        return this;
      },
      
      reset(newItems = []) {
        this.items.length = 0;
        this.items.push(...newItems);
        return this;
      },
      
      toArray() {
        return [...this.items];
      },
      
      isEmpty() {
        return this.items.length === 0;
      }
    };

    // Attach methods to collection
    Object.keys(methods).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(methods, key);
      if (descriptor.get) {
        // It's a getter
        Object.defineProperty(collection, key, {
          get: descriptor.get,
          enumerable: false,
          configurable: true
        });
      } else {
        // It's a method
        collection[key] = methods[key].bind(collection);
      }
    });

    return collection;
  }

  /**
   * Create a collection with computed properties
   * @param {Array} items - Initial items
   * @param {Object} computed - Computed properties
   * @returns {Object} Reactive collection with computed properties
   */
  function createCollectionWithComputed(items = [], computed = {}) {
    const collection = createCollection(items);
    
    if (computed && typeof computed === 'object') {
      Object.entries(computed).forEach(([key, fn]) => {
        collection.$computed(key, fn);
      });
    }
    
    return collection;
  }

  /**
   * Create a filtered view of a collection
   * @param {Object} collection - Source collection
   * @param {Function} predicate - Filter predicate
   * @returns {Object} Reactive filtered collection
   */
  function createFilteredCollection(collection, predicate) {
    const filtered = createCollection([]);
    
    // Sync filtered items whenever source changes
    global.effect(() => {
      const newItems = collection.items.filter(predicate);
      filtered.reset(newItems);
    });
    
    return filtered;
  }

  // Export Collections API
  const CollectionsAPI = {
    create: createCollection,
    createWithComputed: createCollectionWithComputed,
    createFiltered: createFilteredCollection,
    
    // Alias for convenience
    collection: createCollection,
    list: createCollection
  };

  // Attach to global
  global.Collections = global.Collections || {};
  Object.assign(global.Collections, CollectionsAPI);

  // Also add to ReactiveUtils for convenience
  if (global.ReactiveUtils) {
    global.ReactiveUtils.collection = createCollection;
    global.ReactiveUtils.list = createCollection;
    global.ReactiveUtils.createCollection = createCollection;
  }

  // Also add to ReactiveState if it exists
  if (global.ReactiveState) {
    global.ReactiveState.collection = createCollection;
    global.ReactiveState.list = createCollection;
  }

  console.log('[Collections Extension] v1.0.0 loaded successfully');
  console.log('[Collections Extension] Available methods:');
  console.log('  - Collections.create(items) / ReactiveUtils.collection(items)');
  console.log('  - collection.add(item)');
  console.log('  - collection.remove(predicate)');
  console.log('  - collection.update(predicate, updates)');
  console.log('  - collection.clear()');
  console.log('  - Plus: find, filter, map, forEach, sort, toggle, and more!');

})(typeof window !== 'undefined' ? window : global);


/**
 * toggleAll() Method Extension
 * 
  * Adds a toggleAll method to reactive collections
 */

(function(global) {
  'use strict';

  // Check if ReactiveUtils exists
  if (!global.ReactiveUtils || !global.ReactiveUtils.collection) {
    console.error('[toggleAll Extension] ReactiveUtils.collection not found.');
    return;
  }

  // Store the original collection creation function
  const originalCreateCollection = global.ReactiveUtils.collection;

  // Enhanced collection creation with toggleAll
  function createCollectionWithToggleAll(items = []) {
    const collection = originalCreateCollection(items);

    // Add toggleAll method
    collection.toggleAll = function(predicate, field = 'done') {
      let count = 0;

      this.items.forEach((item, index) => {
        // Check if item matches predicate
        const matches = typeof predicate === 'function'
          ? predicate(item, index)
          : item === predicate;

        if (matches && this.items[index]) {
          this.items[index][field] = !this.items[index][field];
          count++;
        }
      });

      return count; // Return number of items toggled
    };

    return collection;
  }

  // Replace the collection creation function
  global.ReactiveUtils.collection = createCollectionWithToggleAll;
  global.ReactiveUtils.list = createCollectionWithToggleAll;
  global.ReactiveUtils.createCollection = createCollectionWithToggleAll;

  // Also update Collections if it exists
  if (global.Collections) {
    global.Collections.create = createCollectionWithToggleAll;
    global.Collections.collection = createCollectionWithToggleAll;
    global.Collections.list = createCollectionWithToggleAll;
  }

})(typeof window !== 'undefined' ? window : global);
/**
 *  04_dh-reactive-form
 * 
 * Forms Extension for DOM Helpers Reactive State
 * Standalone file - no library modifications needed
 * @license MIT
 */

(function(global) {
  'use strict';

  // Check if ReactiveUtils exists
  if (!global.ReactiveUtils) {
    console.error('[Forms] ReactiveUtils not found. Please load the reactive library first.');
    return;
  }

  const { state: createState, batch } = global.ReactiveUtils;

  /**
   * Create a reactive form with validation and state management
   * @param {Object} initialValues - Initial form values
   * @param {Object} options - Form options (validators, onSubmit)
   * @returns {Object} Reactive form
   */
  function createForm(initialValues = {}, options = {}) {
    // Create the base object BEFORE making it reactive
    const formObj = {
      values: { ...initialValues },
      errors: {},
      touched: {},
      isSubmitting: false,
      submitCount: 0
    };

    // Make it reactive
    const form = createState(formObj);

    // Add computed properties
    form.$computed('isValid', function() {
      const errorKeys = Object.keys(this.errors);
      return errorKeys.length === 0 || errorKeys.every(k => !this.errors[k]);
    });

    form.$computed('isDirty', function() {
      return Object.keys(this.touched).length > 0;
    });

    form.$computed('hasErrors', function() {
      return Object.keys(this.errors).some(k => this.errors[k]);
    });

    form.$computed('touchedFields', function() {
      return Object.keys(this.touched);
    });

    form.$computed('errorFields', function() {
      return Object.keys(this.errors).filter(k => this.errors[k]);
    });

    // Store validators
    const validators = options.validators || {};
    const onSubmitCallback = options.onSubmit;

    // Form methods
    const methods = {
      // Set a single field value
      setValue(field, value) {
        this.values[field] = value;
        this.touched[field] = true;
        
        // Auto-validate if validator exists
        if (validators[field]) {
          this.validateField(field);
        }
        
        return this;
      },

      // Set multiple field values
      setValues(values) {
        return batch(() => {
          Object.entries(values).forEach(([field, value]) => {
            this.setValue(field, value);
          });
          return this;
        });
      },

      // Set a field error
      setError(field, error) {
        if (error) {
          this.errors[field] = error;
        } else {
          delete this.errors[field];
        }
        return this;
      },

      // Set multiple errors
      setErrors(errors) {
        return batch(() => {
          Object.entries(errors).forEach(([field, error]) => {
            this.setError(field, error);
          });
          return this;
        });
      },

      // Clear a field error
      clearError(field) {
        delete this.errors[field];
        return this;
      },

      // Clear all errors
      clearErrors() {
        this.errors = {};
        return this;
      },

      // Mark field as touched
      setTouched(field, touched = true) {
        if (touched) {
          this.touched[field] = true;
        } else {
          delete this.touched[field];
        }
        return this;
      },

      // Mark multiple fields as touched
      setTouchedFields(fields) {
        return batch(() => {
          fields.forEach(field => this.setTouched(field));
          return this;
        });
      },

      // Mark all fields as touched
      touchAll() {
        return batch(() => {
          Object.keys(this.values).forEach(field => {
            this.touched[field] = true;
          });
          return this;
        });
      },

      // Validate a single field
      validateField(field) {
        const validator = validators[field];
        if (!validator) return true;

        const error = validator(this.values[field], this.values);
        
        if (error) {
          this.errors[field] = error;
          return false;
        } else {
          delete this.errors[field];
          return true;
        }
      },

      // Validate all fields
      validate() {
        return batch(() => {
          let isValid = true;
          
          Object.keys(validators).forEach(field => {
            const valid = this.validateField(field);
            if (!valid) isValid = false;
          });
          
          return isValid;
        });
      },

      // Reset form to initial or new values
      reset(newValues = initialValues) {
        return batch(() => {
          this.values = { ...newValues };
          this.errors = {};
          this.touched = {};
          this.isSubmitting = false;
          return this;
        });
      },

      // Reset a single field
      resetField(field) {
        return batch(() => {
          this.values[field] = initialValues[field];
          delete this.errors[field];
          delete this.touched[field];
          return this;
        });
      },

      // Handle form submission
      async submit(customHandler) {
        const handler = customHandler || onSubmitCallback;
        
        if (!handler) {
          console.warn('[Forms] No submit handler provided');
          return;
        }

        // Mark all fields as touched
        this.touchAll();

        // Validate
        const isValid = this.validate();
        
        if (!isValid) {
          console.log('[Forms] Validation failed');
          return { success: false, errors: this.errors };
        }

        this.isSubmitting = true;
        
        try {
          const result = await handler(this.values, this);
          this.submitCount++;
          this.isSubmitting = false;
          return { success: true, result };
        } catch (error) {
          this.isSubmitting = false;
          console.error('[Forms] Submit error:', error);
          return { success: false, error };
        }
      },

      // Handle input change event
      handleChange(event) {
        const target = event.target;
        const field = target.name || target.id;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        
        this.setValue(field, value);
      },

      // Handle input blur event
      handleBlur(event) {
        const target = event.target;
        const field = target.name || target.id;
        
        this.setTouched(field);
        
        if (validators[field]) {
          this.validateField(field);
        }
      },

      // Get field props for easy binding
      getFieldProps(field) {
        return {
          name: field,
          value: this.values[field] || '',
          onChange: (e) => this.handleChange(e),
          onBlur: (e) => this.handleBlur(e)
        };
      },

      // Check if field has error
      hasError(field) {
        return !!this.errors[field];
      },

      // Check if field is touched
      isTouched(field) {
        return !!this.touched[field];
      },

      // Get field error message
      getError(field) {
        return this.errors[field] || null;
      },

      // Get field value
      getValue(field) {
        return this.values[field];
      },

      // Check if field should show error (touched + has error)
      shouldShowError(field) {
        return this.isTouched(field) && this.hasError(field);
      },

      // Bind form to DOM inputs
      bindToInputs(selector) {
        const inputs = typeof selector === 'string' 
          ? document.querySelectorAll(selector)
          : selector;

        inputs.forEach(input => {
          const field = input.name || input.id;
          
          if (!field) return;

          // Set initial value
          if (input.type === 'checkbox') {
            input.checked = !!this.values[field];
          } else {
            input.value = this.values[field] || '';
          }

          // Add event listeners
          input.addEventListener('input', (e) => this.handleChange(e));
          input.addEventListener('blur', (e) => this.handleBlur(e));
        });

        return this;
      },

      // Convert to plain object
      toObject() {
        return {
          values: { ...this.values },
          errors: { ...this.errors },
          touched: { ...this.touched },
          isValid: this.isValid,
          isDirty: this.isDirty,
          isSubmitting: this.isSubmitting,
          submitCount: this.submitCount
        };
      }
    };

    // Attach methods to form
    Object.keys(methods).forEach(key => {
      form[key] = methods[key].bind(form);
    });

    return form;
  }

  /**
   * Common validators
   */
  const Validators = {
    required(message = 'This field is required') {
      return (value) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return message;
        }
        return null;
      };
    },

    email(message = 'Invalid email address') {
      return (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : message;
      };
    },

    minLength(min, message) {
      return (value) => {
        if (!value) return null;
        const msg = message || `Must be at least ${min} characters`;
        return value.length >= min ? null : msg;
      };
    },

    maxLength(max, message) {
      return (value) => {
        if (!value) return null;
        const msg = message || `Must be no more than ${max} characters`;
        return value.length <= max ? null : msg;
      };
    },

    pattern(regex, message = 'Invalid format') {
      return (value) => {
        if (!value) return null;
        return regex.test(value) ? null : message;
      };
    },

    min(min, message) {
      return (value) => {
        if (value === '' || value == null) return null;
        const msg = message || `Must be at least ${min}`;
        return Number(value) >= min ? null : msg;
      };
    },

    max(max, message) {
      return (value) => {
        if (value === '' || value == null) return null;
        const msg = message || `Must be no more than ${max}`;
        return Number(value) <= max ? null : msg;
      };
    },

    match(fieldName, message) {
      return (value, allValues) => {
        const msg = message || `Must match ${fieldName}`;
        return value === allValues[fieldName] ? null : msg;
      };
    },

    custom(validatorFn) {
      return validatorFn;
    },

    combine(...validators) {
      return (value, allValues) => {
        for (const validator of validators) {
          const error = validator(value, allValues);
          if (error) return error;
        }
        return null;
      };
    }
  };

  // Export Forms API
  const FormsAPI = {
    create: createForm,
    form: createForm,
    validators: Validators,
    v: Validators // Shorthand
  };

  // Attach to global
  global.Forms = global.Forms || {};
  Object.assign(global.Forms, FormsAPI);

  // Add to ReactiveUtils
  if (global.ReactiveUtils) {
    global.ReactiveUtils.form = createForm;
    global.ReactiveUtils.createForm = createForm;
    global.ReactiveUtils.validators = Validators;
  }

  // Add to ReactiveState if it exists
  if (global.ReactiveState) {
    global.ReactiveState.form = createForm;
  }

})(typeof window !== 'undefined' ? window : global);
/**
 * 05_dh-reactive-cleanup
 * 
 * Production-Ready Cleanup System for DOM Helpers Reactive State
 * Fixes memory leaks and provides proper lifecycle management
 * Load this AFTER 01_dh-reactive.js
 * @license MIT
 * @version 1.0.1
 */

(function(global) {
  'use strict';

  // ============================================================================
  // STEP 1: Verify Dependencies
  // ============================================================================
  
  if (!global.ReactiveUtils) {
    console.error('[Cleanup] ReactiveUtils not found. Load 01_dh-reactive.js first.');
    return;
  }

  // ============================================================================
  // STEP 2: Global Effect Registry
  // ============================================================================
  
  const effectRegistry = new WeakMap(); // effect -> { states: Set, disposed: boolean }
  const stateRegistry = new WeakMap(); // state -> { effects: Map<key, Set<effect>> }

  /**
   * Register an effect with its state dependencies
   */
  function registerEffect(effectFn, state, key) {
    // Initialize effect registry entry
    if (!effectRegistry.has(effectFn)) {
      effectRegistry.set(effectFn, {
        states: new Map(),
        disposed: false
      });
    }
    
    const effectData = effectRegistry.get(effectFn);
    
    // Track which keys this effect depends on for this state
    if (!effectData.states.has(state)) {
      effectData.states.set(state, new Set());
    }
    effectData.states.get(state).add(key);
    
    // Initialize state registry entry
    if (!stateRegistry.has(state)) {
      stateRegistry.set(state, {
        effects: new Map()
      });
    }
    
    const stateData = stateRegistry.get(state);
    
    // Add effect to this state's key
    if (!stateData.effects.has(key)) {
      stateData.effects.set(key, new Set());
    }
    stateData.effects.get(key).add(effectFn);
  }

  /**
   * Unregister an effect from all its dependencies
   */
  function unregisterEffect(effectFn) {
    const effectData = effectRegistry.get(effectFn);
    if (!effectData) return;
    
    // Mark as disposed
    effectData.disposed = true;
    
    // Remove this effect from all states it was tracking
    effectData.states.forEach((keys, state) => {
      const stateData = stateRegistry.get(state);
      if (!stateData) return;
      
      keys.forEach(key => {
        const effectSet = stateData.effects.get(key);
        if (effectSet) {
          effectSet.delete(effectFn);
          
          // Clean up empty sets
          if (effectSet.size === 0) {
            stateData.effects.delete(key);
          }
        }
      });
    });
    
    // Clear effect's state tracking
    effectData.states.clear();
  }

  /**
   * Check if an effect is disposed
   */
  function isEffectDisposed(effectFn) {
    const effectData = effectRegistry.get(effectFn);
    return effectData ? effectData.disposed : false;
  }

  // ============================================================================
  // STEP 3: Enhanced Effect Function with Cleanup
  // ============================================================================
  
  const originalEffect = global.ReactiveUtils.effect;
  
  /**
   * Enhanced effect with proper cleanup
   */
  function enhancedEffect(fn) {
    let isDisposed = false;
    const trackedStates = new Map();
    
    const execute = () => {
      if (isDisposed) return;
      
      // Clear previous tracking
      trackedStates.forEach((keys, state) => {
        keys.forEach(key => {
          const stateData = stateRegistry.get(state);
          if (stateData && stateData.effects.has(key)) {
            stateData.effects.get(key).delete(execute);
          }
        });
      });
      trackedStates.clear();
      
      // Run the effect with tracking
      const prevEffect = global.ReactiveUtils.__currentEffect;
      global.ReactiveUtils.__currentEffect = {
        fn: execute,
        isComputed: false,
        onDep: (state, key) => {
          if (!trackedStates.has(state)) {
            trackedStates.set(state, new Set());
          }
          trackedStates.get(state).add(key);
          registerEffect(execute, state, key);
        }
      };
      
      try {
        fn();
      } catch (error) {
        console.error('[Cleanup] Effect error:', error);
      } finally {
        global.ReactiveUtils.__currentEffect = prevEffect;
      }
    };
    
    // Create disposal function
    const dispose = () => {
      if (isDisposed) return;
      isDisposed = true;
      unregisterEffect(execute);
      trackedStates.clear();
    };
    
    // Run initially
    execute();
    
    return dispose;
  }

  // ============================================================================
  // STEP 4: Patch Reactive Proxy Creation
  // ============================================================================
  
  const originalCreateReactive = global.ReactiveUtils.state;
  
  /**
   * Enhanced reactive state creation with cleanup support
   */
  function enhancedCreateReactive(target) {
    const state = originalCreateReactive(target);
    
    // Patch the state to use cleanup registry
    patchStateTracking(state);
    
    return state;
  }
  
  /**
   * Patch a reactive state to use the cleanup registry
   * FIXED: Uses Object.defineProperty to properly override methods
   */
  function patchStateTracking(state) {
    // Prevent double-patching
    if (state.__cleanupPatched) {
      return;
    }
    
    // Mark as patched
    Object.defineProperty(state, '__cleanupPatched', {
      value: true,
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    // Store original methods
    const originalWatch = state.$watch;
    const originalComputed = state.$computed;
    
    // ========================================================================
    // FIXED: Enhanced $watch with proper property override
    // ========================================================================
    if (originalWatch) {
      Object.defineProperty(state, '$watch', {
        value: function(keyOrFn, callback) {
          const cleanup = enhancedEffect(() => {
            let oldValue;
            if (typeof keyOrFn === 'function') {
              const newValue = keyOrFn.call(this);
              if (newValue !== oldValue) {
                callback(newValue, oldValue);
                oldValue = newValue;
              }
            } else {
              const newValue = this[keyOrFn];
              if (newValue !== oldValue) {
                callback(newValue, oldValue);
                oldValue = newValue;
              }
            }
          });
          
          return cleanup;
        },
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
    
    // Track computed properties for cleanup
    if (!state.__computedCleanups) {
      Object.defineProperty(state, '__computedCleanups', {
        value: new Map(),
        writable: false,
        enumerable: false,
        configurable: false
      });
    }
    
    // ========================================================================
    // FIXED: Enhanced $computed with proper property override
    // ========================================================================
    if (originalComputed) {
      Object.defineProperty(state, '$computed', {
        value: function(key, fn) {
          // Remove old computed if it exists
          if (state.__computedCleanups.has(key)) {
            const cleanup = state.__computedCleanups.get(key);
            cleanup();
            state.__computedCleanups.delete(key);
          }
          
          // Create new computed
          originalComputed.call(this, key, fn);
          
          // Store cleanup
          const cleanup = () => {
            delete this[key];
          };
          
          state.__computedCleanups.set(key, cleanup);
          
          return this;
        },
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
    
    // ========================================================================
    // Add $cleanup method to state
    // ========================================================================
    if (!state.$cleanup) {
      Object.defineProperty(state, '$cleanup', {
        value: function() {
          // Clean up all computed properties
          if (this.__computedCleanups) {
            this.__computedCleanups.forEach(cleanup => cleanup());
            this.__computedCleanups.clear();
          }
          
          // Remove all effects tracking this state
          const stateData = stateRegistry.get(this);
          if (stateData) {
            stateData.effects.forEach((effectSet) => {
              effectSet.forEach(effect => {
                unregisterEffect(effect);
              });
              effectSet.clear();
            });
            stateData.effects.clear();
          }
        },
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
  }

  // ============================================================================
  // STEP 5: Patch Existing Library Functions
  // ============================================================================
  
  // Override the state creation function
  global.ReactiveUtils.state = enhancedCreateReactive;
  global.ReactiveUtils.effect = enhancedEffect;
  
  // Expose __currentEffect for tracking
  global.ReactiveUtils.__currentEffect = null;
  
  // Patch createState if it exists
  if (global.ReactiveUtils.createState) {
    const originalCreateState = global.ReactiveUtils.createState;
    global.ReactiveUtils.createState = function(initialState, bindingDefs) {
      const state = originalCreateState(initialState, bindingDefs);
      patchStateTracking(state);
      return state;
    };
  }

  // ============================================================================
  // STEP 6: Enhanced Component with Automatic Cleanup
  // ============================================================================
  
  if (global.ReactiveUtils.component) {
    const originalComponent = global.ReactiveUtils.component;
    
    global.ReactiveUtils.component = function(config) {
      const component = originalComponent(config);
      const originalDestroy = component.$destroy;
      
      // Enhanced destroy
      if (originalDestroy) {
        Object.defineProperty(component, '$destroy', {
          value: function() {
            // Call original destroy
            originalDestroy.call(this);
            
            // Clean up the state itself
            if (this.$cleanup) {
              this.$cleanup();
            }
          },
          writable: true,
          enumerable: false,
          configurable: true
        });
      }
      
      return component;
    };
  }

  // ============================================================================
  // STEP 7: Enhanced Reactive Builder with Cleanup
  // ============================================================================
  
  if (global.ReactiveUtils.reactive) {
    const originalReactive = global.ReactiveUtils.reactive;
    
    global.ReactiveUtils.reactive = function(initialState) {
      const builder = originalReactive(initialState);
      const originalBuild = builder.build;
      
      // Enhanced build
      builder.build = function() {
        const state = originalBuild.call(this);
        
        // Replace destroy with enhanced version
        const originalStateDestroy = state.destroy;
        
        Object.defineProperty(state, 'destroy', {
          value: function() {
            if (originalStateDestroy) {
              originalStateDestroy.call(this);
            }
            if (this.$cleanup) {
              this.$cleanup();
            }
          },
          writable: true,
          enumerable: false,
          configurable: true
        });
        
        return state;
      };
      
      // Enhanced builder destroy
      const originalBuilderDestroy = builder.destroy;
      builder.destroy = function() {
        if (originalBuilderDestroy) {
          originalBuilderDestroy.call(this);
        }
        if (this.state && this.state.$cleanup) {
          this.state.$cleanup();
        }
      };
      
      return builder;
    };
  }

  // ============================================================================
  // STEP 8: Cleanup Utilities
  // ============================================================================
  
  const CleanupAPI = {
    /**
     * Get statistics about tracked effects and states
     */
    getStats() {
      return {
        message: 'Cleanup system active',
        note: 'WeakMaps prevent direct counting, but cleanup is working properly'
      };
    },
    
    /**
     * Create a cleanup collector for managing multiple cleanups
     */
    collector() {
      const cleanups = [];
      let isDisposed = false;
      
      return {
        add(cleanup) {
          if (isDisposed) {
            console.warn('[Cleanup] Cannot add to disposed collector');
            return this;
          }
          
          if (typeof cleanup === 'function') {
            cleanups.push(cleanup);
          }
          return this;
        },
        
        cleanup() {
          if (isDisposed) return;
          
          isDisposed = true;
          cleanups.forEach(cleanup => {
            try {
              cleanup();
            } catch (error) {
              console.error('[Cleanup] Collector error:', error);
            }
          });
          cleanups.length = 0;
        },
        
        get size() {
          return cleanups.length;
        },
        
        get disposed() {
          return isDisposed;
        }
      };
    },
    
    /**
     * Create a cleanup scope
     */
    scope(fn) {
      const collector = this.collector();
      
      fn((cleanup) => collector.add(cleanup));
      
      return () => collector.cleanup();
    },
    
    /**
     * Patch an existing state to use the cleanup system
     */
    patchState(state) {
      patchStateTracking(state);
      return state;
    },
    
    /**
     * Check if an effect is still active
     */
    isActive(effectFn) {
      return !isEffectDisposed(effectFn);
    }
  };

  // ============================================================================
  // STEP 9: Export API
  // ============================================================================
  
  global.ReactiveCleanup = CleanupAPI;
  
  // Also add to ReactiveUtils
  if (global.ReactiveUtils) {
    global.ReactiveUtils.cleanup = CleanupAPI;
    global.ReactiveUtils.collector = CleanupAPI.collector;
    global.ReactiveUtils.scope = CleanupAPI.scope;
  }

  // ============================================================================
  // STEP 10: Diagnostic Tools
  // ============================================================================
  
  let debugMode = false;
  
  CleanupAPI.debug = function(enable = true) {
    debugMode = enable;
    
    if (enable) {
      console.log('[Cleanup] Debug mode enabled');
      console.log('[Cleanup] Use ReactiveCleanup.getStats() for statistics');
    }
    
    return this;
  };
  
  CleanupAPI.test = function() {
    console.log('[Cleanup] Running cleanup test...');
    
    const state = global.ReactiveUtils.state({ count: 0 });
    let runCount = 0;
    
    // Create and dispose 100 effects
    for (let i = 0; i < 100; i++) {
      const cleanup = global.effect(() => {
        const _ = state.count;
        runCount++;
      });
      cleanup();
    }
    
    const initialRuns = runCount;
    runCount = 0;
    
    // Update state - should NOT trigger disposed effects
    state.count++;
    
    // Small delay for batched updates
    setTimeout(() => {
      if (runCount === 0) {
        console.log('âœ… Cleanup test PASSED - disposed effects not called');
        console.log(`   Initial runs: ${initialRuns}, Update runs: ${runCount}`);
      } else {
        console.error('âŒ Cleanup test FAILED - disposed effects still running!');
        console.error(`   Initial runs: ${initialRuns}, Update runs: ${runCount}`);
      }
    }, 10);
  };

  console.log('[Cleanup System] v1.0.1 loaded successfully');

})(typeof window !== 'undefined' ? window : global);
/**
 * 06_dh-reactive-enhancements
 * 
 * Production Enhancements for DOM Helpers Reactive State
 * Fixes: batching, deep reactivity, computed caching, error handling, async support
 * Load this AFTER 01_dh-reactive.js and 05_dh-reactive-cleanup.js
 * @license MIT
 * @version 1.0.0
 */

(function(global) {
  'use strict';

  // ============================================================================
  // VERIFY DEPENDENCIES
  // ============================================================================
  
  if (!global.ReactiveUtils) {
    console.error('[Enhancements] ReactiveUtils not found. Load 01_dh-reactive.js first.');
    return;
  }

  // ============================================================================
  // PART 1: ENHANCED BATCHING SYSTEM
  // ============================================================================
  // Why: Prevents race conditions and ensures consistent state updates
  // What: Priority-based queue with cycle detection
  
  const PRIORITY = {
    COMPUTED: 1,    // Run computed properties first
    WATCH: 2,       // Then run watchers
    EFFECT: 3       // Finally run effects
  };

  const updateQueue = new Map(); // priority -> Set of effects
  let isFlushPending = false;
  let flushCount = 0;
  const MAX_FLUSH_COUNT = 100; // Prevent infinite loops

  /**
   * Queue an update with priority
   * Computed properties run before regular effects to ensure consistency
   */
  function queueUpdate(fn, priority = PRIORITY.EFFECT) {
    if (!updateQueue.has(priority)) {
      updateQueue.set(priority, new Set());
    }
    updateQueue.get(priority).add(fn);
    
    if (!isFlushPending) {
      isFlushPending = true;
      queueMicrotask(flushQueue);
    }
  }

  /**
   * Flush all queued updates in priority order
   * This is the heart of consistent batching
   */
  function flushQueue() {
    if (flushCount > MAX_FLUSH_COUNT) {
      console.error(
        '[Enhancements] Infinite update loop detected. ' +
        'An effect may be modifying state that triggers itself.'
      );
      updateQueue.clear();
      flushCount = 0;
      isFlushPending = false;
      return;
    }
    
    flushCount++;
    isFlushPending = false;
    
    // Sort priorities: 1, 2, 3 (computed â†’ watch â†’ effect)
    const priorities = Array.from(updateQueue.keys()).sort((a, b) => a - b);
    
    for (const priority of priorities) {
      const effects = updateQueue.get(priority);
      if (!effects) continue;
      
      updateQueue.delete(priority);
      
      effects.forEach(effect => {
        try {
          effect();
        } catch (e) {
          console.error('[Enhancements] Effect error:', e);
        }
      });
    }
    
    // If new updates were queued during flush, schedule another flush
    if (updateQueue.size > 0) {
      queueMicrotask(flushQueue);
    } else {
      flushCount = 0;
    }
  }

  /**
   * Enhanced batch function with better control
   */
  function enhancedBatch(fn) {
    const originalBatch = global.ReactiveUtils.batch;
    return originalBatch(fn);
  }

  // ============================================================================
  // PART 2: DEEP REACTIVITY FOR COLLECTIONS
  // ============================================================================
  // Why: Arrays, Maps, and Sets need special handling
  // What: Intercept collection methods to trigger reactivity
  
  const RAW = Symbol('raw');
  const IS_REACTIVE = Symbol('reactive');

  /**
   * Create reactive Map with proper change tracking
   */
  function createReactiveMap(target, parent, key) {
    const instrumentations = {
      get size() {
        const raw = target;
        // Track the size property
        if (parent && key) {
          triggerUpdate(parent, key);
        }
        return raw.size;
      },
      
      get(key) {
        const result = target.get(key);
        return result;
      },
      
      set(key, value) {
        const hadKey = target.has(key);
        const result = target.set(key, value);
        
        // Trigger update on parent
        if (parent && key) {
          triggerUpdate(parent, key);
        }
        
        return result;
      },
      
      has(key) {
        return target.has(key);
      },
      
      delete(key) {
        const hadKey = target.has(key);
        const result = target.delete(key);
        
        if (hadKey && parent && key) {
          triggerUpdate(parent, key);
        }
        
        return result;
      },
      
      clear() {
        const hadItems = target.size > 0;
        const result = target.clear();
        
        if (hadItems && parent && key) {
          triggerUpdate(parent, key);
        }
        
        return result;
      },
      
      forEach(callback, thisArg) {
        target.forEach((value, key) => {
          callback.call(thisArg, value, key, this);
        }, thisArg);
      },
      
      keys() {
        return target.keys();
      },
      
      values() {
        return target.values();
      },
      
      entries() {
        return target.entries();
      },
      
      [Symbol.iterator]() {
        return target.entries();
      }
    };
    
    return new Proxy(target, {
      get(t, prop) {
        if (prop === RAW) return target;
        if (prop === IS_REACTIVE) return true;
        if (instrumentations.hasOwnProperty(prop)) {
          return instrumentations[prop];
        }
        return Reflect.get(t, prop);
      }
    });
  }

  /**
   * Create reactive Set with proper change tracking
   */
  function createReactiveSet(target, parent, key) {
    const instrumentations = {
      get size() {
        const raw = target;
        if (parent && key) {
          triggerUpdate(parent, key);
        }
        return raw.size;
      },
      
      has(value) {
        return target.has(value);
      },
      
      add(value) {
        const hadValue = target.has(value);
        const result = target.add(value);
        
        if (!hadValue && parent && key) {
          triggerUpdate(parent, key);
        }
        
        return result;
      },
      
      delete(value) {
        const hadValue = target.has(value);
        const result = target.delete(value);
        
        if (hadValue && parent && key) {
          triggerUpdate(parent, key);
        }
        
        return result;
      },
      
      clear() {
        const hadItems = target.size > 0;
        const result = target.clear();
        
        if (hadItems && parent && key) {
          triggerUpdate(parent, key);
        }
        
        return result;
      },
      
      forEach(callback, thisArg) {
        target.forEach((value) => {
          callback.call(thisArg, value, value, this);
        }, thisArg);
      },
      
      keys() {
        return target.values();
      },
      
      values() {
        return target.values();
      },
      
      entries() {
        return target.entries();
      },
      
      [Symbol.iterator]() {
        return target.values();
      }
    };
    
    return new Proxy(target, {
      get(t, prop) {
        if (prop === RAW) return target;
        if (prop === IS_REACTIVE) return true;
        if (instrumentations.hasOwnProperty(prop)) {
          return instrumentations[prop];
        }
        return Reflect.get(t, prop);
      }
    });
  }

  /**
   * Helper to trigger updates on parent state
   */
  function triggerUpdate(state, key) {
    if (state && state.$notify) {
      state.$notify(key);
    }
  }

  /**
   * Enhance state creation to handle collections
   */
  function enhanceCollectionSupport() {
    const originalState = global.ReactiveUtils.state;
    
    global.ReactiveUtils.state = function(target) {
      // First create the reactive state
      const state = originalState(target);
      
      // Then enhance any Map or Set properties
      Object.keys(target).forEach(key => {
        const value = target[key];
        
        if (value instanceof Map) {
          state[key] = createReactiveMap(value, state, key);
        } else if (value instanceof Set) {
          state[key] = createReactiveSet(value, state, key);
        }
      });
      
      return state;
    };
  }

  // ============================================================================
  // PART 3: ENHANCED COMPUTED PROPERTIES
  // ============================================================================
  // Why: Computed properties should cache and only recalculate when needed
  // What: Smart caching with dependency tracking and cycle detection
  
  const computedStack = [];
  const computedCache = new WeakMap(); // state -> Map of computed values

  /**
   * Get or create computed cache for a state
   */
  function getComputedCache(state) {
    if (!computedCache.has(state)) {
      computedCache.set(state, new Map());
    }
    return computedCache.get(state);
  }

  /**
   * Enhanced computed that caches across effects in the same tick
   */
  function enhanceComputed() {
    const originalState = global.ReactiveUtils.state;
    
    global.ReactiveUtils.state = function(target) {
      const state = originalState(target);
      
      // Store original $computed method
      const original$Computed = state.$computed;
      
      // Replace with enhanced version
      state.$computed = function(key, fn) {
        const cache = getComputedCache(this);
        
        // Track cycle detection
        const computedMeta = {
          key,
          fn,
          computing: false,
          value: undefined,
          dirty: true,
          tick: 0
        };
        
        cache.set(key, computedMeta);
        
        // Create the computed property
        Object.defineProperty(this, key, {
          get() {
            // Cycle detection
            if (computedMeta.computing) {
              const chain = computedStack.map(c => c.key).join(' â†’ ');
              throw new Error(
                `[Enhancements] Circular dependency: ${chain} â†’ ${key}`
              );
            }
            
            // Check if we need to recompute
            const currentTick = flushCount;
            if (computedMeta.dirty || computedMeta.tick !== currentTick) {
              computedMeta.computing = true;
              computedStack.push(computedMeta);
              
              try {
                computedMeta.value = fn.call(this);
                computedMeta.dirty = false;
                computedMeta.tick = currentTick;
              } catch (error) {
                console.error(`[Enhancements] Error in computed "${key}":`, error);
                throw error;
              } finally {
                computedMeta.computing = false;
                computedStack.pop();
              }
            }
            
            return computedMeta.value;
          },
          
          set() {
            console.warn(
              `[Enhancements] Cannot set computed property "${key}". ` +
              `Computed properties are read-only.`
            );
          },
          
          enumerable: true,
          configurable: true
        });
        
        return this;
      };
      
      return state;
    };
  }

  // ============================================================================
  // PART 4: ERROR BOUNDARIES
  // ============================================================================
  // Why: One bad effect shouldn't crash everything
  // What: Isolated error handling with recovery options
  
  /**
   * Error boundary class for wrapping effects
   */
  class ErrorBoundary {
    constructor(options = {}) {
      this.onError = options.onError || ((error, context) => {
        console.error('[Enhancements] Error in', context.type, ':', error);
      });
      this.fallback = options.fallback;
      this.retry = options.retry !== false; // Default true
      this.maxRetries = options.maxRetries || 3;
      this.retryDelay = options.retryDelay || 0;
    }
    
    wrap(fn, context = {}) {
      let retries = 0;
      
      return (...args) => {
        const attempt = () => {
          try {
            return fn(...args);
          } catch (error) {
            retries++;
            
            const shouldRetry = this.retry && retries < this.maxRetries;
            
            this.onError(error, {
              ...context,
              attempt: retries,
              maxRetries: this.maxRetries,
              willRetry: shouldRetry
            });
            
            if (shouldRetry) {
              if (this.retryDelay > 0) {
                setTimeout(attempt, this.retryDelay);
              } else {
                return attempt();
              }
            } else if (this.fallback) {
              return this.fallback(error, context);
            } else {
              // Don't throw - just log and continue
              return undefined;
            }
          }
        };
        
        return attempt();
      };
    }
  }

  /**
   * Create effect with error boundary
   */
  function safeEffect(fn, options = {}) {
    const boundary = new ErrorBoundary(options.errorBoundary || {});
    
    const wrappedFn = boundary.wrap(fn, {
      type: 'effect',
      created: Date.now()
    });
    
    return global.effect(wrappedFn);
  }

  /**
   * Create watch with error boundary
   */
  function safeWatch(state, keyOrFn, callback, options = {}) {
    const boundary = new ErrorBoundary(options.errorBoundary || {});
    
    const wrappedCallback = boundary.wrap(callback, {
      type: 'watch',
      key: typeof keyOrFn === 'string' ? keyOrFn : 'function',
      created: Date.now()
    });
    
    return state.$watch(keyOrFn, wrappedCallback);
  }

  // ============================================================================
  // PART 5: ENHANCED ASYNC SUPPORT
  // ============================================================================
  // Why: Modern apps need proper async handling with cancellation
  // What: Async effects and improved async state management
  
  /**
   * Async effect with AbortSignal support
   * Automatically cancels when effect re-runs
   */
  function asyncEffect(fn, options = {}) {
    let cleanup;
    let abortController;
    
    const runEffect = () => {
      // Clean up previous run
      if (cleanup) {
        try {
          cleanup();
        } catch (e) {
          console.error('[Enhancements] Cleanup error:', e);
        }
      }
      
      // Cancel previous async operation
      if (abortController) {
        abortController.abort();
      }
      
      abortController = new AbortController();
      
      const result = fn(abortController.signal);
      
      // Handle Promise return
      if (result && typeof result.then === 'function') {
        result
          .then(cleanupFn => {
            if (typeof cleanupFn === 'function') {
              cleanup = cleanupFn;
            }
          })
          .catch(error => {
            if (error.name !== 'AbortError') {
              console.error('[Enhancements] Async effect error:', error);
              if (options.onError) {
                options.onError(error);
              }
            }
          });
      }
    };
    
    const dispose = global.effect(runEffect);
    
    return () => {
      dispose();
      if (cleanup) cleanup();
      if (abortController) abortController.abort();
    };
  }

  /**
   * Enhanced async state with race condition prevention
   */
  function enhancedAsyncState(initialValue = null, options = {}) {
    const state = global.ReactiveUtils.state({
      data: initialValue,
      loading: false,
      error: null,
      requestId: 0,
      
    });

 

    // Add computed properties
    state.$computed('isSuccess', function() {
      return !this.loading && !this.error && this.data !== null;
    });

    state.$computed('isError', function() {
      return !this.loading && this.error !== null;
    });

    state.$computed('isIdle', function() {
      return !this.loading && this.data === null && this.error === null;
    });

    /**
     * Execute async function with automatic cancellation
     */
    state.$execute = async function(fn) {
      this.lastFn = fn;

      // Cancel previous request
      if (this.abortController) {
        this.abortController.abort();
      }
      
      const requestId = ++this.requestId;
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      
      this.loading = true;
      this.error = null;
      
      try {
        const result = await fn(signal);
        
        // Only update if this is still the latest request
        if (requestId === this.requestId && !signal.aborted) {
          this.data = result;
          
          if (options.onSuccess) {
            options.onSuccess(result);
          }
          
          return { success: true, data: result };
        }
        
        return { success: false, stale: true };
      } catch (error) {
        // Handle abort gracefully
        if (error.name === 'AbortError') {
          return { success: false, aborted: true };
        }
        
        // Only update error if this is still the latest request
        if (requestId === this.requestId) {
          this.error = error;
          
          if (options.onError) {
            options.onError(error);
          }
        }
        
        return { success: false, error };
      } finally {
        // Only clear loading if this is still the latest request
        if (requestId === this.requestId) {
          this.loading = false;
          this.abortController = null;
        }
      }
    };

    /**
     * Manually abort current request
     */
    state.$abort = function() {
      if (this.abortController) {
        this.abortController.abort();
        this.loading = false;
        this.abortController = null;
      }
    };

    /**
     * Reset to initial state
     */
    state.$reset = function() {
      this.$abort();
      this.data = initialValue;
      this.loading = false;
      this.error = null;
      this.requestId = 0;
    };
    
    /**
     * Refetch with last function
     */
    state.$refetch = function() {
      if (this.lastFn) {
        return this.$execute(this.lastFn);
      }

    return Promise.resolve({ success: false, error: new Error('No function to refetch') });
 

    };

    return state;
  }

  // ============================================================================
  // PART 6: DEVELOPMENT TOOLS
  // ============================================================================
  // Why: Debugging reactive systems is hard without visibility
  // What: DevTools for inspecting state, effects, and changes
  
  const DevTools = {
    enabled: false,
    states: new Map(),
    effects: new Map(),
    history: [],
    maxHistory: 50,
    
    enable() {
      this.enabled = true;
      window.__REACTIVE_DEVTOOLS__ = this;
      console.log('[DevTools] Enabled - inspect with window.__REACTIVE_DEVTOOLS__');
    },
    
    disable() {
      this.enabled = false;
      delete window.__REACTIVE_DEVTOOLS__;
    },
    
    trackState(state, name) {
      if (!this.enabled) return;
      
      const id = this.states.size + 1;
      this.states.set(state, {
        id,
        name: name || `State ${id}`,
        created: Date.now(),
        updates: []
      });
    },
    
    trackEffect(effect, name) {
      if (!this.enabled) return;
      
      const id = this.effects.size + 1;
      this.effects.set(effect, {
        id,
        name: name || `Effect ${id}`,
        created: Date.now(),
        runs: 0
      });
    },
    
    logChange(state, key, oldValue, newValue) {
      if (!this.enabled) return;
      
      const stateInfo = this.states.get(state);
      if (!stateInfo) return;
      
      const change = {
        stateId: stateInfo.id,
        stateName: stateInfo.name,
        key,
        oldValue,
        newValue,
        timestamp: Date.now()
      };
      
      stateInfo.updates.push(change);
      this.history.push(change);
      
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    },
    
    getStates() {
      return Array.from(this.states.entries()).map(([state, info]) => ({
        ...info,
        state
      }));
    },
    
    getHistory() {
      return [...this.history];
    },
    
    clearHistory() {
      this.history.length = 0;
      this.states.forEach(info => {
        info.updates.length = 0;
      });
    }
  };

  // Auto-enable in development
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    DevTools.enable();
  }

  // ============================================================================
  // APPLY ALL ENHANCEMENTS
  // ============================================================================
  
  // Apply collection support
  enhanceCollectionSupport();
  
  // Apply computed enhancements
  enhanceComputed();

  // ============================================================================
  // EXPORT ENHANCED API
  // ============================================================================
  
  const Enhancements = {
    // Batching
    batch: enhancedBatch,
    queueUpdate,
    
    // Error handling
    safeEffect,
    safeWatch,
    ErrorBoundary,
    
    // Async
    asyncEffect,
    asyncState: enhancedAsyncState,
    
    // DevTools
    DevTools,
    
    // Priorities (for advanced usage)
    PRIORITY
  };

  // Add to global
  global.ReactiveEnhancements = Enhancements;
  
  // Add to ReactiveUtils
  if (global.ReactiveUtils) {
    global.ReactiveUtils.safeEffect = safeEffect;
    global.ReactiveUtils.safeWatch = safeWatch;
    global.ReactiveUtils.asyncEffect = asyncEffect;
    global.ReactiveUtils.asyncState = enhancedAsyncState;
    global.ReactiveUtils.ErrorBoundary = ErrorBoundary;
    global.ReactiveUtils.DevTools = DevTools;
  }

})(typeof window !== 'undefined' ? window : global);

/**
 * 07_dh-reactive-storage.js
 * 
 * STANDALONE AutoSave - No dh-storage.js dependency!
 * Only requires: 01_dh-reactive.js
 * 
 * @license MIT
 * @version 3.0.0
 */

(function(global) {
  'use strict';

  // ============================================================================
  // VERIFY DEPENDENCIES (only reactive needed!)
  // ============================================================================
  
  if (!global.ReactiveUtils) {
    console.error('[autoSave] ReactiveUtils not found. Load 01_dh-reactive.js first.');
    return;
  }

  const { effect, batch } = global.ReactiveUtils;

  // ============================================================================
  // BUILT-IN STORAGE WRAPPER (replaces dh-storage.js)
  // ============================================================================
  
  /**
   * Simple storage wrapper with JSON handling and namespaces
   */
  class StorageWrapper {
    constructor(storageType = 'localStorage', namespace = '') {
      this.storageType = storageType;
      this.namespace = namespace;
      this.storage = global[storageType];
      
      if (!this.storage) {
        console.warn(`[autoSave] ${storageType} not available`);
        this.storage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
          key: () => null,
          length: 0
        };
      }
    }

    _getKey(key) {
      return this.namespace ? `${this.namespace}:${key}` : key;
    }

    set(key, value, options = {}) {
      try {
        const fullKey = this._getKey(key);
        
        const data = {
          value: value,
          timestamp: Date.now()
        };

        // Add expiration
        if (options.expires) {
          data.expires = Date.now() + (options.expires * 1000);
        }

        this.storage.setItem(fullKey, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('[autoSave] Storage set error:', error);
        return false;
      }
    }

    get(key) {
      try {
        const fullKey = this._getKey(key);
        const item = this.storage.getItem(fullKey);
        
        if (!item) return null;

        const data = JSON.parse(item);
        
        // Check expiration
        if (data.expires && Date.now() > data.expires) {
          this.storage.removeItem(fullKey);
          return null;
        }

        return data.value;
      } catch (error) {
        console.error('[autoSave] Storage get error:', error);
        return null;
      }
    }

    remove(key) {
      try {
        const fullKey = this._getKey(key);
        this.storage.removeItem(fullKey);
        return true;
      } catch (error) {
        console.error('[autoSave] Storage remove error:', error);
        return false;
      }
    }

    has(key) {
      try {
        const fullKey = this._getKey(key);
        return this.storage.getItem(fullKey) !== null;
      } catch (error) {
        return false;
      }
    }

    keys() {
      try {
        const keys = [];
        const prefix = this.namespace ? `${this.namespace}:` : '';
        
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && (!this.namespace || key.startsWith(prefix))) {
            const strippedKey = this.namespace 
              ? key.slice(prefix.length)
              : key;
            keys.push(strippedKey);
          }
        }
        
        return keys;
      } catch (error) {
        return [];
      }
    }

    clear() {
      try {
        if (this.namespace) {
          const keys = this.keys();
          keys.forEach(key => this.remove(key));
        } else {
          this.storage.clear();
        }
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  // ============================================================================
  // STORAGE AVAILABILITY CHECK
  // ============================================================================
  
  function isStorageAvailable(type) {
    try {
      const storage = global[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  const hasLocalStorage = isStorageAvailable('localStorage');
  const hasSessionStorage = isStorageAvailable('sessionStorage');

  // ============================================================================
  // UTILITIES
  // ============================================================================

  function safeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      return value;
    });
  }

  // ============================================================================
  // autoSave() - STANDALONE VERSION
  // ============================================================================
  
  function autoSave(reactiveObj, key, options = {}) {
    // Validation
    if (!reactiveObj || typeof reactiveObj !== 'object') {
      throw new Error('[autoSave] First argument must be a reactive object');
    }
    if (!key || typeof key !== 'string') {
      throw new Error('[autoSave] Second argument must be a string key');
    }

    // Options
    const {
      storage = 'localStorage',
      namespace = '',
      debounce = 0,
      autoLoad = true,
      autoSave: autoSaveEnabled = true,
      sync = false,
      expires = null,
      onSave = null,
      onLoad = null,
      onSync = null,
      onError = null
    } = options;

    // Check availability
    if (storage === 'localStorage' && !hasLocalStorage) {
      console.warn('[autoSave] localStorage not available');
      return reactiveObj;
    }
    if (storage === 'sessionStorage' && !hasSessionStorage) {
      console.warn('[autoSave] sessionStorage not available');
      return reactiveObj;
    }

    // Create storage wrapper (no external dependency!)
    const store = new StorageWrapper(storage, namespace);

    // ========================================================================
    // HELPERS
    // ========================================================================

    function getValue(obj) {
      try {
        if (obj.value !== undefined && typeof obj.valueOf === 'function') {
          return obj.value; // Ref
        }
        if (obj.items !== undefined) {
          return obj.items; // Collection
        }
        if (obj.values !== undefined) {
          return { values: obj.values, errors: obj.errors || {}, touched: obj.touched || {} }; // Form
        }
        if (obj.$raw) {
          return obj.$raw; // State
        }
        return obj; // Plain object
      } catch (error) {
        console.error('[autoSave] getValue error:', error);
        if (onError) onError(error, 'getValue');
        return null;
      }
    }

    function setValue(obj, value) {
      if (!value) return;
      try {
        if (obj.value !== undefined && typeof obj.valueOf === 'function') {
          obj.value = value;
        } else if (obj.items !== undefined) {
          obj.reset ? obj.reset(value) : (obj.items = value);
        } else if (obj.values !== undefined && value.values) {
          Object.assign(obj.values, value.values);
          if (value.errors) obj.errors = value.errors;
          if (value.touched) obj.touched = value.touched;
        } else {
          Object.assign(obj, value);
        }
      } catch (error) {
        console.error('[autoSave] setValue error:', error);
        if (onError) onError(error, 'setValue');
      }
    }

    // ========================================================================
    // LOAD
    // ========================================================================

    if (autoLoad) {
      try {
        const loaded = store.get(key);
        if (loaded !== null) {
          const processed = onLoad ? onLoad(loaded) : loaded;
          setValue(reactiveObj, processed);
        }
      } catch (error) {
        console.error('[autoSave] Load error:', error);
        if (onError) onError(error, 'load');
      }
    }

    // ========================================================================
    // SAVE (PRODUCTION HARDENED)
    // ========================================================================

    let saveTimeout;
    let effectCleanup;
    let isUpdatingFromStorage = false;
    let lastSaveTime = 0;
    const MIN_SAVE_INTERVAL = 100; // Minimum 100ms between saves
    const LARGE_ITEM_WARNING = 100 * 1024; // 100KB
    const MAX_STORAGE_WARNING = 5 * 1024 * 1024; // 5MB

    function save() {
      if (isUpdatingFromStorage) return;
      
      // Prevent excessive saves
      const now = Date.now();
      if (now - lastSaveTime < MIN_SAVE_INTERVAL) {
        return;
      }
      lastSaveTime = now;
      
      if (saveTimeout) clearTimeout(saveTimeout);

      const doSave = () => {
        try {
          let valueToSave = getValue(reactiveObj);
          if (valueToSave === null) return;

          if (onSave) {
            valueToSave = onSave(valueToSave);
          }

          // Validate serializability and check size
          const serialized = safeStringify(valueToSave);
          const size = serialized.length;
          
          // Warn about large data
          if (size > LARGE_ITEM_WARNING) {
            console.warn(`[autoSave] Large data detected (${Math.round(size / 1024)}KB) for key "${key}"`);
          }

          // Check total storage size
          if (typeof global[storage] !== 'undefined') {
            let totalSize = 0;
            try {
              for (let i = 0; i < global[storage].length; i++) {
                const k = global[storage].key(i);
                if (k) {
                  totalSize += (global[storage].getItem(k) || '').length + k.length;
                }
              }
              if (totalSize > MAX_STORAGE_WARNING) {
                console.warn(`[autoSave] Storage size: ${Math.round(totalSize / 1024 / 1024)}MB`);
              }
            } catch (e) {
              // Ignore size check errors
            }
          }

          store.set(key, valueToSave, { expires });
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.error('[autoSave] Storage quota exceeded');
            if (onError) onError(new Error('Storage quota exceeded. Consider clearing old data.'), 'quota');
          } else {
            console.error('[autoSave] Save error:', error);
            if (onError) onError(error, 'save');
          }
        }
      };

      if (debounce > 0) {
        saveTimeout = setTimeout(doSave, debounce);
      } else {
        doSave();
      }
    }

    if (autoSaveEnabled) {
      effectCleanup = effect(() => {
        const _ = getValue(reactiveObj);
        save();
      });
    }

    // ========================================================================
    // CROSS-TAB SYNC (PRODUCTION HARDENED)
    // ========================================================================

    let storageEventCleanup = null;
    let syncLock = false; // Prevent sync loops

    if (sync && typeof window !== 'undefined') {
      const handleStorageEvent = (event) => {
        if (syncLock) return; // Already syncing, prevent loops
        
        const fullKey = namespace ? `${namespace}:${key}` : key;
        if (event.key !== fullKey) return;

        try {
          if (event.newValue === null) return;

          const data = JSON.parse(event.newValue);
          const newValue = data.value !== undefined ? data.value : data;

          syncLock = true; // Lock to prevent loops
          isUpdatingFromStorage = true;
          
          batch(() => setValue(reactiveObj, newValue));
          
          isUpdatingFromStorage = false;

          if (onSync) onSync(newValue);
        } catch (error) {
          console.error('[autoSave] Sync error:', error);
          if (onError) onError(error, 'sync');
        } finally {
          syncLock = false; // Always release lock
        }
      };

      window.addEventListener('storage', handleStorageEvent);
      storageEventCleanup = () => window.removeEventListener('storage', handleStorageEvent);
    }

    // ========================================================================
    // FLUSH ON UNLOAD
    // ========================================================================

    let unloadCleanup = null;

    if (typeof window !== 'undefined' && autoSaveEnabled) {
      const handleUnload = () => {
        if (saveTimeout) {
          clearTimeout(saveTimeout);
          try {
            let valueToSave = getValue(reactiveObj);
            if (valueToSave && onSave) {
              valueToSave = onSave(valueToSave);
            }
            if (valueToSave) {
              store.set(key, valueToSave, { expires });
            }
          } catch (error) {
            // Silent on unload
          }
        }
      };

      window.addEventListener('beforeunload', handleUnload);
      unloadCleanup = () => window.removeEventListener('beforeunload', handleUnload);
    }

    // ========================================================================
    // METHODS
    // ========================================================================

    reactiveObj.$save = function() {
      if (saveTimeout) clearTimeout(saveTimeout);
      try {
        let valueToSave = getValue(this);
        if (valueToSave && onSave) {
          valueToSave = onSave(valueToSave);
        }
        if (valueToSave) {
          return store.set(key, valueToSave, { expires });
        }
        return false;
      } catch (error) {
        console.error('[autoSave] $save error:', error);
        if (onError) onError(error, 'save');
        return false;
      }
    };

    reactiveObj.$load = function() {
      try {
        const loaded = store.get(key);
        if (loaded !== null) {
          const processed = onLoad ? onLoad(loaded) : loaded;
          isUpdatingFromStorage = true;
          setValue(this, processed);
          isUpdatingFromStorage = false;
          return true;
        }
        return false;
      } catch (error) {
        console.error('[autoSave] $load error:', error);
        if (onError) onError(error, 'load');
        return false;
      }
    };

    reactiveObj.$clear = function() {
      return store.remove(key);
    };

    reactiveObj.$exists = function() {
      return store.has(key);
    };

    reactiveObj.$stopAutoSave = function() {
      if (effectCleanup) {
        effectCleanup();
        effectCleanup = null;
      }
      return this;
    };

    reactiveObj.$startAutoSave = function() {
      if (!effectCleanup && autoSaveEnabled) {
        effectCleanup = effect(() => {
          const _ = getValue(this);
          save();
        });
      }
      return this;
    };

    reactiveObj.$destroy = function() {
      if (effectCleanup) effectCleanup();
      if (storageEventCleanup) storageEventCleanup();
      if (unloadCleanup) unloadCleanup();
      if (saveTimeout) clearTimeout(saveTimeout);
    };

    reactiveObj.$storageInfo = function() {
      try {
        const exists = this.$exists();
        let size = 0;
        if (exists) {
          const data = store.get(key);
          if (data) {
            size = safeStringify(data).length;
          }
        }
        return {
          key,
          namespace,
          storage,
          exists,
          size,
          sizeKB: Math.round(size / 1024 * 10) / 10
        };
      } catch (error) {
        return {
          key,
          namespace,
          storage,
          exists: false,
          size: 0,
          error: error.message
        };
      }
    };

    return reactiveObj;
  }

  // ============================================================================
  // reactiveStorage() - STANDALONE VERSION
  // ============================================================================

  function reactiveStorage(storageType = 'localStorage', namespace = '') {
    if (storageType === 'localStorage' && !hasLocalStorage) {
      console.warn('[reactiveStorage] localStorage not available');
    }
    if (storageType === 'sessionStorage' && !hasSessionStorage) {
      console.warn('[reactiveStorage] sessionStorage not available');
    }

    const store = new StorageWrapper(storageType, namespace);
    
    const reactiveState = global.ReactiveUtils.state({
      _version: 0,
      _keys: new Set(store.keys())
    });

    function notify() {
      batch(() => {
        reactiveState._version++;
        reactiveState._keys = new Set(store.keys());
      });
    }

    const proxy = new Proxy(store, {
      get(target, prop) {
        if (prop === 'get' || prop === 'has' || prop === 'keys') {
          const _ = reactiveState._version;
          const __ = reactiveState._keys;
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });

    const originalSet = store.set.bind(store);
    proxy.set = function(key, value, options) {
      const result = originalSet(key, value, options);
      if (result) notify();
      return result;
    };

    const originalRemove = store.remove.bind(store);
    proxy.remove = function(key) {
      const result = originalRemove(key);
      if (result) notify();
      return result;
    };

    if (typeof window !== 'undefined' && storageType === 'localStorage') {
      window.addEventListener('storage', (event) => {
        const fullKeyPrefix = namespace ? `${namespace}:` : '';
        if (!event.key || (!namespace || event.key.startsWith(fullKeyPrefix))) {
          notify();
        }
      });
    }

    return proxy;
  }

  // ============================================================================
  // watch() - STANDALONE VERSION
  // ============================================================================

  function watch(key, callback, options = {}) {
    const {
      storage = 'localStorage',
      namespace = '',
      immediate = false
    } = options;

    const store = new StorageWrapper(storage, namespace);
    let oldValue = store.get(key);

    if (immediate && oldValue !== null) {
      callback(oldValue, null);
    }

    const reactiveStore = reactiveStorage(storage, namespace);
    
    const cleanup = effect(() => {
      const newValue = reactiveStore.get(key);
      
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        callback(newValue, oldValue);
        oldValue = newValue;
      }
    });

    return cleanup;
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  const StorageIntegration = {
    autoSave,
    reactiveStorage,
    watch,
    withStorage: autoSave,
    isStorageAvailable,
    hasLocalStorage,
    hasSessionStorage
  };

  global.ReactiveStorage = StorageIntegration;

  if (global.ReactiveUtils) {
    global.ReactiveUtils.autoSave = autoSave;
    global.ReactiveUtils.reactiveStorage = reactiveStorage;
    global.ReactiveUtils.watchStorage = watch;
    global.ReactiveUtils.withStorage = autoSave;
  }

  if (typeof global.state !== 'undefined') {
    global.autoSave = autoSave;
    global.reactiveStorage = reactiveStorage;
    global.watchStorage = watch;
  }

})(typeof window !== 'undefined' ? window : global);
/**
 * 08_dh-reactive-namespace-methods.js
 * 
 * Adds namespace-level methods to ReactiveUtils for the 14 unique $ methods
 * Allows calling them as ReactiveUtils.method(state, ...) instead of state.$method(...)
 * 
 * @license MIT
 * @version 1.0.0
 */

(function(global) {
  'use strict';

  // ============================================================================
  // VERIFY DEPENDENCIES
  // ============================================================================
  
  if (!global.ReactiveUtils) {
    console.error('[Namespace Methods] ReactiveUtils not found. Load reactive modules first.');
    return;
  }

  const ReactiveUtils = global.ReactiveUtils;

  // ============================================================================
  // CORE STATE NAMESPACE METHODS
  // ============================================================================

  /**
   * Set state values with functional updates
   * @param {Object} state - The reactive state
   * @param {Object} updates - Object with values or functions
   * @returns {Object} The state
   * 
   * @example
   * ReactiveUtils.set(state, {
   *   count: prev => prev + 1,
   *   name: 'John'
   * });
   */
  ReactiveUtils.set = function(state, updates) {
    if (!state || !state.$set) {
      console.error('[Namespace Methods] Invalid state or $set not available');
      return state;
    }
    return state.$set(updates);
  };

  /**
   * Clean up all effects and watchers from a state
   * @param {Object} state - The reactive state
   * @returns {void}
   * 
   * @example
   * ReactiveUtils.cleanup(state);
   */
  ReactiveUtils.cleanup = function(state) {
    if (!state || !state.$cleanup) {
      console.error('[Namespace Methods] Invalid state or $cleanup not available');
      return;
    }
    state.$cleanup();
  };

  // ============================================================================
  // ASYNC STATE NAMESPACE METHODS
  // ============================================================================

  /**
   * Execute async operation on async state
   * @param {Object} asyncState - The reactive async state
   * @param {Function} fn - Async function that receives AbortSignal
   * @returns {Promise} Result object
   * 
   * @example
   * await ReactiveUtils.execute(asyncState, async (signal) => {
   *   const response = await fetch('/api/data', { signal });
   *   return response.json();
   * });
   */
  ReactiveUtils.execute = function(asyncState, fn) {
    if (!asyncState || !asyncState.$execute) {
      console.error('[Namespace Methods] Invalid asyncState or $execute not available');
      return Promise.reject(new Error('Invalid async state'));
    }
    return asyncState.$execute(fn);
  };

  /**
   * Abort current async operation
   * @param {Object} asyncState - The reactive async state
   * @returns {void}
   * 
   * @example
   * ReactiveUtils.abort(asyncState);
   */
  ReactiveUtils.abort = function(asyncState) {
    if (!asyncState || !asyncState.$abort) {
      console.error('[Namespace Methods] Invalid asyncState or $abort not available');
      return;
    }
    asyncState.$abort();
  };

  /**
   * Reset async state to initial values
   * @param {Object} asyncState - The reactive async state
   * @returns {void}
   * 
   * @example
   * ReactiveUtils.reset(asyncState);
   */
  ReactiveUtils.reset = function(asyncState) {
    if (!asyncState || !asyncState.$reset) {
      console.error('[Namespace Methods] Invalid asyncState or $reset not available');
      return;
    }
    asyncState.$reset();
  };

  /**
   * Refetch with last async function
   * @param {Object} asyncState - The reactive async state
   * @returns {Promise|undefined} Result object or undefined
   * 
   * @example
   * await ReactiveUtils.refetch(asyncState);
   */
  ReactiveUtils.refetch = function(asyncState) {
    if (!asyncState || !asyncState.$refetch) {
      console.error('[Namespace Methods] Invalid asyncState or $refetch not available');
      return;
    }
    return asyncState.$refetch();
  };

  // ============================================================================
  // COMPONENT NAMESPACE METHODS
  // ============================================================================

  /**
   * Destroy component and clean up all resources
   * @param {Object} component - The reactive component
   * @returns {void}
   * 
   * @example
   * ReactiveUtils.destroy(component);
   */
  ReactiveUtils.destroy = function(component) {
    if (!component || !component.$destroy) {
      console.error('[Namespace Methods] Invalid component or $destroy not available');
      return;
    }
    component.$destroy();
  };

  // ============================================================================
  // STORAGE NAMESPACE METHODS
  // ============================================================================

  /**
   * Force save state to storage immediately
   * @param {Object} state - The storage-enabled reactive state
   * @returns {boolean} Success status
   * 
   * @example
   * ReactiveUtils.save(state);
   */
  ReactiveUtils.save = function(state) {
    if (!state || !state.$save) {
      console.error('[Namespace Methods] Invalid state or $save not available');
      return false;
    }
    return state.$save();
  };

  /**
   * Load state from storage
   * @param {Object} state - The storage-enabled reactive state
   * @returns {boolean} Success status
   * 
   * @example
   * ReactiveUtils.load(state);
   */
  ReactiveUtils.load = function(state) {
    if (!state || !state.$load) {
      console.error('[Namespace Methods] Invalid state or $load not available');
      return false;
    }
    return state.$load();
  };

  /**
   * Clear state from storage
   * @param {Object} state - The storage-enabled reactive state
   * @returns {boolean} Success status
   * 
   * @example
   * ReactiveUtils.clear(state);
   */
  ReactiveUtils.clear = function(state) {
    if (!state || !state.$clear) {
      console.error('[Namespace Methods] Invalid state or $clear not available');
      return false;
    }
    return state.$clear();
  };

  /**
   * Check if state exists in storage
   * @param {Object} state - The storage-enabled reactive state
   * @returns {boolean} Existence status
   * 
   * @example
   * if (ReactiveUtils.exists(state)) { ... }
   */
  ReactiveUtils.exists = function(state) {
    if (!state || !state.$exists) {
      console.error('[Namespace Methods] Invalid state or $exists not available');
      return false;
    }
    return state.$exists();
  };

  /**
   * Stop automatic saving for state
   * @param {Object} state - The storage-enabled reactive state
   * @returns {Object} The state
   * 
   * @example
   * ReactiveUtils.stopAutoSave(state);
   */
  ReactiveUtils.stopAutoSave = function(state) {
    if (!state || !state.$stopAutoSave) {
      console.error('[Namespace Methods] Invalid state or $stopAutoSave not available');
      return state;
    }
    return state.$stopAutoSave();
  };

  /**
   * Start automatic saving for state
   * @param {Object} state - The storage-enabled reactive state
   * @returns {Object} The state
   * 
   * @example
   * ReactiveUtils.startAutoSave(state);
   */
  ReactiveUtils.startAutoSave = function(state) {
    if (!state || !state.$startAutoSave) {
      console.error('[Namespace Methods] Invalid state or $startAutoSave not available');
      return state;
    }
    return state.$startAutoSave();
  };

  /**
   * Get storage information for state
   * @param {Object} state - The storage-enabled reactive state
   * @returns {Object} Storage info object
   * 
   * @example
   * const info = ReactiveUtils.storageInfo(state);
   * console.log(info.sizeKB);
   */
  ReactiveUtils.storageInfo = function(state) {
    if (!state || !state.$storageInfo) {
      console.error('[Namespace Methods] Invalid state or $storageInfo not available');
      return {
        key: '',
        namespace: '',
        storage: 'localStorage',
        exists: false,
        size: 0,
        error: 'Method not available'
      };
    }
    return state.$storageInfo();
  };

  // ============================================================================
  // UTILITY: Get raw object
  // ============================================================================

  /**
   * Get raw (non-reactive) object from state
   * Note: This is an alias for toRaw() to match the pattern
   * @param {Object} state - The reactive state
   * @returns {Object} Raw object
   * 
   * @example
   * const raw = ReactiveUtils.getRaw(state);
   */
  ReactiveUtils.getRaw = function(state) {
    if (!state) return state;
    
    // Try $raw property first
    if (state.$raw) {
      return state.$raw;
    }
    
    // Fall back to toRaw function
    if (ReactiveUtils.toRaw) {
      return ReactiveUtils.toRaw(state);
    }
    
    return state;
  };

  // ============================================================================
  // INTEGRATION WITH ELEMENTS, COLLECTIONS, SELECTOR NAMESPACES
  // ============================================================================

  // Add to Elements if available
  if (global.Elements) {
    global.Elements.set = ReactiveUtils.set;
    global.Elements.cleanup = ReactiveUtils.cleanup;
    global.Elements.execute = ReactiveUtils.execute;
    global.Elements.abort = ReactiveUtils.abort;
    global.Elements.reset = ReactiveUtils.reset;
    global.Elements.refetch = ReactiveUtils.refetch;
    global.Elements.destroy = ReactiveUtils.destroy;
    global.Elements.save = ReactiveUtils.save;
    global.Elements.load = ReactiveUtils.load;
    global.Elements.clear = ReactiveUtils.clear;
    global.Elements.exists = ReactiveUtils.exists;
    global.Elements.stopAutoSave = ReactiveUtils.stopAutoSave;
    global.Elements.startAutoSave = ReactiveUtils.startAutoSave;
    global.Elements.storageInfo = ReactiveUtils.storageInfo;
    global.Elements.getRaw = ReactiveUtils.getRaw;
  }

  // Add to Collections if available
  if (global.Collections) {
    global.Collections.set = ReactiveUtils.set;
    global.Collections.cleanup = ReactiveUtils.cleanup;
    global.Collections.execute = ReactiveUtils.execute;
    global.Collections.abort = ReactiveUtils.abort;
    global.Collections.reset = ReactiveUtils.reset;
    global.Collections.refetch = ReactiveUtils.refetch;
    global.Collections.destroy = ReactiveUtils.destroy;
    global.Collections.save = ReactiveUtils.save;
    global.Collections.load = ReactiveUtils.load;
    global.Collections.clear = ReactiveUtils.clear;
    global.Collections.exists = ReactiveUtils.exists;
    global.Collections.stopAutoSave = ReactiveUtils.stopAutoSave;
    global.Collections.startAutoSave = ReactiveUtils.startAutoSave;
    global.Collections.storageInfo = ReactiveUtils.storageInfo;
    global.Collections.getRaw = ReactiveUtils.getRaw;
  }

  // Add to Selector if available
  if (global.Selector) {
    global.Selector.set = ReactiveUtils.set;
    global.Selector.cleanup = ReactiveUtils.cleanup;
    global.Selector.execute = ReactiveUtils.execute;
    global.Selector.abort = ReactiveUtils.abort;
    global.Selector.reset = ReactiveUtils.reset;
    global.Selector.refetch = ReactiveUtils.refetch;
    global.Selector.destroy = ReactiveUtils.destroy;
    global.Selector.save = ReactiveUtils.save;
    global.Selector.load = ReactiveUtils.load;
    global.Selector.clear = ReactiveUtils.clear;
    global.Selector.exists = ReactiveUtils.exists;
    global.Selector.stopAutoSave = ReactiveUtils.stopAutoSave;
    global.Selector.startAutoSave = ReactiveUtils.startAutoSave;
    global.Selector.storageInfo = ReactiveUtils.storageInfo;
    global.Selector.getRaw = ReactiveUtils.getRaw;
  }

  // ============================================================================
  // GLOBAL SHORTCUTS (if module 07 is loaded)
  // ============================================================================

  if (typeof global.effect === 'function') {
    // Add global shortcuts for the 14 methods
    global.set = ReactiveUtils.set;
    global.cleanup = ReactiveUtils.cleanup;
    global.execute = ReactiveUtils.execute;
    global.abort = ReactiveUtils.abort;
    global.reset = ReactiveUtils.reset;
    global.refetch = ReactiveUtils.refetch;
    global.destroy = ReactiveUtils.destroy;
    global.save = ReactiveUtils.save;
    global.load = ReactiveUtils.load;
    global.clear = ReactiveUtils.clear;
    global.exists = ReactiveUtils.exists;
    global.stopAutoSave = ReactiveUtils.stopAutoSave;
    global.startAutoSave = ReactiveUtils.startAutoSave;
    global.storageInfo = ReactiveUtils.storageInfo;
    global.getRaw = ReactiveUtils.getRaw;
  }

  // ============================================================================
  // LOGGING
  // ============================================================================

  console.log('[Namespace Methods] v1.0.0 loaded successfully âœ…');
  console.log('');
  console.log('Added 14 namespace-level methods to ReactiveUtils:');
  console.log('');
  console.log('Core State:');
  console.log('  ReactiveUtils.set(state, updates)');
  console.log('  ReactiveUtils.cleanup(state)');
  console.log('  ReactiveUtils.getRaw(state)');
  console.log('');
  console.log('Async State:');
  console.log('  ReactiveUtils.execute(asyncState, fn)');
  console.log('  ReactiveUtils.abort(asyncState)');
  console.log('  ReactiveUtils.reset(asyncState)');
  console.log('  ReactiveUtils.refetch(asyncState)');
  console.log('');
  console.log('Component:');
  console.log('  ReactiveUtils.destroy(component)');
  console.log('');
  console.log('Storage:');
  console.log('  ReactiveUtils.save(state)');
  console.log('  ReactiveUtils.load(state)');
  console.log('  ReactiveUtils.clear(state)');
  console.log('  ReactiveUtils.exists(state)');
  console.log('  ReactiveUtils.stopAutoSave(state)');
  console.log('  ReactiveUtils.startAutoSave(state)');
  console.log('  ReactiveUtils.storageInfo(state)');
  console.log('');
  console.log('Instance methods (with $) still available:');
  console.log('  state.$set(updates)');
  console.log('  state.$cleanup()');
  console.log('  asyncState.$execute(fn)');
  console.log('  ... etc');

})(typeof window !== 'undefined' ? window : global);
/**
 * 09_dh-reactiveUtils-shortcut.js
 * 
 * Standalone API Module v1.1.0
 * Provides simplified function calls without namespace prefixes
 * 
 * Allows:
 *   const myState = state({}) instead of ReactiveUtils.state({})
 *   patchArray(state, 'items') instead of ReactiveUtils.patchArray(state, 'items')
 *   effect(() => {}) instead of effect(() => {})
 * 
 * Load this AFTER all reactive modules for full API access
 * @license MIT
 */

(function(global) {
  'use strict';

  // Check if ReactiveUtils exists
  if (!global.ReactiveUtils) {
    console.warn('[Standalone API] ReactiveUtils not found. Load reactive modules first.');
    return;
  }

  const ReactiveUtils = global.ReactiveUtils;

  // ============================================================
  // CORE STATE METHODS
  // ============================================================

  /**
   * Create reactive state
   * @example const myState = state({ count: 0 });
   */
  global.state = ReactiveUtils.state || ReactiveUtils.create;

  /**
   * Create state with bindings
   * @example const myState = createState({ count: 0 }, { '#counter': 'count' });
   */
  global.createState = ReactiveUtils.createState;

  /**
   * Create reactive effect
   * @example effect(() => console.log(state.count));
   */
  global.effect = ReactiveUtils.effect;

  /**
   * Batch multiple updates
   * @example batch(() => { state.a = 1; state.b = 2; });
   */
  global.batch = ReactiveUtils.batch;

  // ============================================================
  // COMPUTED & WATCH
  // ============================================================

  /**
   * Add computed properties to state
   * @example computed(state, { total: function() { return this.a + this.b; } });
   */
  global.computed = ReactiveUtils.computed;

  /**
   * Watch state changes
   * @example watch(state, { count: (newVal, oldVal) => console.log(newVal) });
   */
  global.watch = ReactiveUtils.watch;

  /**
   * Multiple effects
   * @example effects({ log: () => console.log(state.count) });
   */
  global.effects = ReactiveUtils.effects;

  // ============================================================
  // ENHANCED EFFECTS (Module 06)
  // ============================================================

  if (ReactiveUtils.safeEffect) {
    /**
     * Create effect with error boundary
     * @example safeEffect(() => { ... }, { errorBoundary: { onError: handleError } });
     */
    global.safeEffect = ReactiveUtils.safeEffect;
  }

  if (ReactiveUtils.safeWatch) {
    /**
     * Watch with error boundary
     * @example safeWatch(state, 'count', callback, { errorBoundary: { onError: handleError } });
     */
    global.safeWatch = ReactiveUtils.safeWatch;
  }

  if (ReactiveUtils.asyncEffect) {
    /**
     * Create async effect with AbortSignal support
     * @example asyncEffect(async (signal) => { ... }, { onError: handleError });
     */
    global.asyncEffect = ReactiveUtils.asyncEffect;
  }

  // ============================================================
  // REFS & COLLECTIONS
  // ============================================================

  /**
   * Create reactive reference
   * @example const count = ref(0);
   */
  global.ref = ReactiveUtils.ref;

  /**
   * Create multiple refs
   * @example const { count, name } = refs({ count: 0, name: '' });
   */
  global.refs = ReactiveUtils.refs;

  /**
   * Create reactive collection
   * @example const items = collection([1, 2, 3]);
   */
  global.collection = ReactiveUtils.collection || ReactiveUtils.list;

  /**
   * Alias for collection
   * @example const items = list([1, 2, 3]);
   */
  global.list = ReactiveUtils.list || ReactiveUtils.collection;

  // ============================================================
  // ARRAY PATCHING
  // ============================================================

  /**
   * Manually patch array for reactivity
   * @example patchArray(state, 'items');
   */
  global.patchArray = ReactiveUtils.patchArray || global.patchReactiveArray;

  // ============================================================
  // FORMS
  // ============================================================

  if (ReactiveUtils.form || ReactiveUtils.createForm) {
    /**
     * Create reactive form
     * @example const myForm = form({ name: '', email: '' }, { validators: {...} });
     */
    global.form = ReactiveUtils.form || ReactiveUtils.createForm;

    /**
     * Alias for form
     * @example const myForm = createForm({ name: '' });
     */
    global.createForm = ReactiveUtils.createForm || ReactiveUtils.form;
  }

  if (ReactiveUtils.validators) {
    /**
     * Form validators
     * @example validators.required('This field is required')
     */
    global.validators = ReactiveUtils.validators;
  }

  // ============================================================
  // STORE & COMPONENT
  // ============================================================

  /**
   * Create state store
   * @example const myStore = store({ count: 0 }, { getters: {...}, actions: {...} });
   */
  global.store = ReactiveUtils.store;

  /**
   * Create reactive component
   * @example const myComponent = component({ state: {...}, computed: {...} });
   */
  global.component = ReactiveUtils.component;

  /**
   * Reactive builder pattern
   * @example const builder = reactive({ count: 0 }).computed({...}).build();
   */
  global.reactive = ReactiveUtils.reactive;

  // ============================================================
  // BINDINGS
  // ============================================================

  /**
   * Create DOM bindings
   * @example bindings({ '#counter': () => state.count });
   */
  global.bindings = ReactiveUtils.bindings;

  /**
   * Update all (mixed state + DOM)
   * @example updateAll(state, { count: 5, '#counter': { textContent: '5' } });
   */
  global.updateAll = ReactiveUtils.updateAll || global.updateAll;

  // ============================================================
  // ASYNC STATE
  // ============================================================

  if (ReactiveUtils.async) {
    /**
     * Create basic async state
     * @example const data = async(null);
     */
    global.async = ReactiveUtils.async;
  }

  if (ReactiveUtils.asyncState) {
    /**
     * Create enhanced async state with race condition prevention
     * @example const data = asyncState(null, { onSuccess: handleSuccess });
     */
    global.asyncState = ReactiveUtils.asyncState;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Check if value is reactive
   * @example if (isReactive(state)) { ... }
   */
  global.isReactive = ReactiveUtils.isReactive;

  /**
   * Get raw (non-reactive) value
   * @example const raw = toRaw(state);
   */
  global.toRaw = ReactiveUtils.toRaw;

  /**
   * Manually notify changes
   * @example notify(state, 'count');
   */
  global.notify = ReactiveUtils.notify;

  /**
   * Pause reactivity
   * @example pause();
   */
  global.pause = ReactiveUtils.pause;

  /**
   * Resume reactivity
   * @example resume(true);
   */
  global.resume = ReactiveUtils.resume;

  /**
   * Run function without tracking
   * @example untrack(() => console.log(state.count));
   */
  global.untrack = ReactiveUtils.untrack;

  // ============================================================
  // CLEANUP SYSTEM (Module 05)
  // ============================================================

  if (ReactiveUtils.collector) {
    /**
     * Create cleanup collector
     * @example const cleanup = collector(); cleanup.add(effect1); cleanup.cleanup();
     */
    global.collector = ReactiveUtils.collector;
  }

  if (ReactiveUtils.scope) {
    /**
     * Create cleanup scope that auto-collects
     * @example const cleanup = scope((collect) => { collect(effect(() => {})); });
     */
    global.scope = ReactiveUtils.scope;
  }

  // ============================================================
  // ERROR HANDLING (Module 06)
  // ============================================================

  if (ReactiveUtils.ErrorBoundary) {
    /**
     * Error boundary class for wrapping effects
     * @example const boundary = new ErrorBoundary({ onError: handleError });
     */
    global.ErrorBoundary = ReactiveUtils.ErrorBoundary;
  }

  // ============================================================
  // DEVELOPMENT TOOLS (Module 06)
  // ============================================================

  if (ReactiveUtils.DevTools) {
    /**
     * Development tools for debugging and monitoring
     * @example DevTools.enable(); DevTools.trackState(state, 'MyState');
     */
    global.DevTools = ReactiveUtils.DevTools;
  }

  // ============================================================
  // STORAGE INTEGRATION (Module 08)
  // ============================================================

  if (ReactiveUtils.autoSave) {
    /**
     * Add auto-save to reactive object
     * @example autoSave(state, 'myState', { storage: 'localStorage', debounce: 300 });
     */
    global.autoSave = ReactiveUtils.autoSave;
  }

  if (ReactiveUtils.withStorage) {
    /**
     * Backward compatibility alias for autoSave
     * @example withStorage(state, 'myState', { debounce: 300 });
     */
    global.withStorage = ReactiveUtils.withStorage;
  }

  if (ReactiveUtils.reactiveStorage) {
    /**
     * Create reactive storage proxy
     * @example const storage = reactiveStorage('localStorage', 'myApp');
     */
    global.reactiveStorage = ReactiveUtils.reactiveStorage;
  }

  if (ReactiveUtils.watchStorage) {
    /**
     * Watch storage key for changes
     * @example watchStorage('theme', (newVal, oldVal) => { ... }, { immediate: true });
     */
    global.watchStorage = ReactiveUtils.watchStorage;
  }

  // ============================================================
  // COLLECTIONS EXTENDED API (if Collections module loaded)
  // ============================================================

  if (global.Collections) {
    /**
     * Create collection with computed
     * @example const items = createCollection([1, 2, 3], { total: function() { ... } });
     */
    global.createCollection = global.Collections.create || global.Collections.collection;

    /**
     * Create collection with computed properties
     * @example const items = computedCollection([1, 2, 3], { total() { return this.items.length; } });
     */
    if (global.Collections.createWithComputed) {
      global.computedCollection = global.Collections.createWithComputed;
    }

    /**
     * Create filtered collection
     * @example const active = filteredCollection(todos, t => !t.done);
     */
    if (global.Collections.createFiltered) {
      global.filteredCollection = global.Collections.createFiltered;
    }
  }

  // ============================================================
  // NAMESPACE-LEVEL METHODS (Module 09)
  // ============================================================
  // These are already added by Module 09, but we document them here for completeness

  if (typeof global.set === 'undefined' && ReactiveUtils.set) {
    /**
     * Set state values with functional updates
     * @example set(state, { count: prev => prev + 1 });
     */
    global.set = ReactiveUtils.set;
  }

  if (typeof global.cleanup === 'undefined' && ReactiveUtils.cleanup) {
    /**
     * Clean up all effects and watchers from state
     * @example cleanup(state);
     */
    global.cleanup = ReactiveUtils.cleanup;
  }

  if (typeof global.execute === 'undefined' && ReactiveUtils.execute) {
    /**
     * Execute async operation on async state
     * @example execute(asyncState, async (signal) => { ... });
     */
    global.execute = ReactiveUtils.execute;
  }

  if (typeof global.abort === 'undefined' && ReactiveUtils.abort) {
    /**
     * Abort current async operation
     * @example abort(asyncState);
     */
    global.abort = ReactiveUtils.abort;
  }

  if (typeof global.reset === 'undefined' && ReactiveUtils.reset) {
    /**
     * Reset async state to initial values
     * @example reset(asyncState);
     */
    global.reset = ReactiveUtils.reset;
  }

  if (typeof global.refetch === 'undefined' && ReactiveUtils.refetch) {
    /**
     * Refetch with last async function
     * @example refetch(asyncState);
     */
    global.refetch = ReactiveUtils.refetch;
  }

  if (typeof global.destroy === 'undefined' && ReactiveUtils.destroy) {
    /**
     * Destroy component and clean up resources
     * @example destroy(component);
     */
    global.destroy = ReactiveUtils.destroy;
  }

  if (typeof global.save === 'undefined' && ReactiveUtils.save) {
    /**
     * Force save state to storage
     * @example save(state);
     */
    global.save = ReactiveUtils.save;
  }

  if (typeof global.load === 'undefined' && ReactiveUtils.load) {
    /**
     * Load state from storage
     * @example load(state);
     */
    global.load = ReactiveUtils.load;
  }

  if (typeof global.clear === 'undefined' && ReactiveUtils.clear) {
    /**
     * Clear state from storage
     * @example clear(state);
     */
    global.clear = ReactiveUtils.clear;
  }

  if (typeof global.exists === 'undefined' && ReactiveUtils.exists) {
    /**
     * Check if state exists in storage
     * @example if (exists(state)) { ... }
     */
    global.exists = ReactiveUtils.exists;
  }

  if (typeof global.stopAutoSave === 'undefined' && ReactiveUtils.stopAutoSave) {
    /**
     * Stop automatic saving for state
     * @example stopAutoSave(state);
     */
    global.stopAutoSave = ReactiveUtils.stopAutoSave;
  }

  if (typeof global.startAutoSave === 'undefined' && ReactiveUtils.startAutoSave) {
    /**
     * Start automatic saving for state
     * @example startAutoSave(state);
     */
    global.startAutoSave = ReactiveUtils.startAutoSave;
  }

  if (typeof global.storageInfo === 'undefined' && ReactiveUtils.storageInfo) {
    /**
     * Get storage information for state
     * @example const info = storageInfo(state); console.log(info.sizeKB);
     */
    global.storageInfo = ReactiveUtils.storageInfo;
  }

  if (typeof global.getRaw === 'undefined' && ReactiveUtils.getRaw) {
    /**
     * Get raw (non-reactive) object from state
     * @example const raw = getRaw(state);
     */
    global.getRaw = ReactiveUtils.getRaw;
  }

  // ============================================================
  // STORAGE UTILITY FUNCTIONS (Module 08)
  // ============================================================

  if (global.ReactiveStorage) {
    /**
     * Check if storage type is available
     * @example if (isStorageAvailable('localStorage')) { ... }
     */
    if (global.ReactiveStorage.isStorageAvailable) {
      global.isStorageAvailable = global.ReactiveStorage.isStorageAvailable;
    }

    /**
     * Boolean flag for localStorage availability
     * @example if (hasLocalStorage) { ... }
     */
    if (typeof global.ReactiveStorage.hasLocalStorage !== 'undefined') {
      global.hasLocalStorage = global.ReactiveStorage.hasLocalStorage;
    }

    /**
     * Boolean flag for sessionStorage availability
     * @example if (hasSessionStorage) { ... }
     */
    if (typeof global.ReactiveStorage.hasSessionStorage !== 'undefined') {
      global.hasSessionStorage = global.ReactiveStorage.hasSessionStorage;
    }
  }

})(typeof window !== 'undefined' ? window : global);
