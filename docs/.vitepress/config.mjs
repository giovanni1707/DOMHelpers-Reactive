import { defineConfig } from "vitepress";

// Shared sidebar for form-related routes
const formSidebar = [
  {
    text: "Value Management",
    collapsed: true,
    items: [
      { text: "setValue", link: "/form-operations/setValue" },
      { text: "getValue", link: "/form-operations/getValue" },
      { text: "setValues", link: "/form-operations/setValues" },
    ],
  },

  {
    text: "Error Management",
    collapsed: true,
    items: [
      { text: "setError", link: "/error-management/setError" },
      { text: "setErrors", link: "/error-management/setErrors" },
      { text: "clearError", link: "/error-management/clearError" },
      { text: "clearErrors", link: "/error-management/clearErrors" },
      { text: "hasError", link: "/error-management/hasError" },
      { text: "getError", link: "/error-management/getError" },
    ],
  },

  {
    text: "Touched State",
    collapsed: true,
    items: [
      { text: "setTouched", link: "/touched-state/setTouched" },
      { text: "setTouchedFields", link: "/touched-state/setTouchedFields" },
      { text: "touchAll", link: "/touched-state/touchAll" },
      { text: "isTouched", link: "/touched-state/isTouched" },
      { text: "shouldShowError", link: "/touched-state/shouldShowError" },
    ],
  },

  {
    text: "Validation",
    collapsed: true,
    items: [
      { text: "validateField", link: "/form-validators/validateField" },
      { text: "validate", link: "/form-validators/validate" },
    ],
  },

  {
    text: "Reset",
    collapsed: true,
    items: [
      { text: "reset", link: "/form-operations/reset" },
      { text: "resetField", link: "/form-operations/resetField" },
    ],
  },

  {
    text: "Submission",
    collapsed: true,
    items: [{ text: "submit", link: "/form-operations/submit" }],
  },

  {
    text: "Event Handlers",
    collapsed: true,
    items: [
      { text: "handleChange", link: "/form-operations/handleChange" },
      { text: "handleBlur", link: "/form-operations/handleBlur" },
      { text: "getFieldProps", link: "/form-operations/getFieldProps" },
    ],
  },

  {
    text: "DOM Binding",
    collapsed: true,
    items: [{ text: "bindToInputs", link: "/form-operations/bindToInputs" }],
  },

  {
    text: "Serialization",
    collapsed: true,
    items: [{ text: "toObject", link: "/form-operations/toObject" }],
  },

  {
    text: "Form Computed Properties",
    collapsed: true,
    items: [
      { text: "isValid", link: "/form-computed-properties/isValid" },
      { text: "isDirty", link: "/form-computed-properties/isDirty" },
      { text: "hasErrors", link: "/form-computed-properties/hasErrors" },
      {
        text: "touchedFields",
        link: "/form-computed-properties/touchedFields",
      },
      { text: "errorFields", link: "/form-computed-properties/errorFields" },
    ],
  },

  {
    text: "Form State Properties",
    collapsed: true,
    items: [
      { text: "form.values", link: "/form-state-properties/values" },
      { text: "form.errors", link: "/form-state-properties/errors" },
      { text: "form.touched", link: "/form-state-properties/touched" },
      {
        text: "form.isSubmitting",
        link: "/form-state-properties/isSubmitting",
      },
    ],
  },

  {
    text: "Form Validation",
    collapsed: true,
    items: [
      { text: "Forms.v", link: "/form-validators/v" },
      { text: "validators", link: "/form-validators/validators" },
      { text: "Validators.required", link: "/form-validators/required" },
      { text: "Validators.email", link: "/form-validators/email" },
      { text: "Validators.minLength", link: "/form-validators/minLength" },
      { text: "Validators.maxLength", link: "/form-validators/maxLength" },
      { text: "Validators.min", link: "/form-validators/min" },
      { text: "Validators.max", link: "/form-validators/max" },
      { text: "Validators.pattern", link: "/form-validators/pattern" },
      { text: "Validators.match", link: "/form-validators/match" },
      { text: "Validators.custom", link: "/form-validators/custom" },
      { text: "Validators.combine", link: "/form-validators/combine" },
    ],
  },
];

// Shared sidebar for all routes under getting-started family
const sharedSidebar = [
  {
    text: "State Creation",
    collapsed: true,
    items: [
      { text: "state", link: "/reactive-state/state" },
      { text: "createState", link: "/reactive-state/createState" },
      { text: "ref", link: "/reactive-state/ref" },
      { text: "refs", link: "/reactive-state/refs" },
      { text: "createCollection", link: "/reactive-state/createCollection" },
      {
        text: "computedCollection",
        link: "/reactive-state/computedCollection",
      },
      {
        text: "filteredCollection",
        link: "/reactive-state/filteredCollection",
      },
      { text: "createForm", link: "/reactive-state/createForm" },
      { text: "asyncState", link: "/reactive-state/asyncState" },
      { text: "store", link: "/reactive-state/store" },
      { text: "component", link: "/reactive-state/component" },
      { text: "reactive", link: "/reactive-state/reactive" },
    ],
  },

  {
    text: "Reactivity Functions",
    collapsed: true,
    items: [
      { text: "computed", link: "/reactivity-function/computed" },
      { text: "watch", link: "/reactivity-function/watch" },
      { text: "safeWatch", link: "/reactivity-function/safeWatch" },
      { text: "effect", link: "/reactivity-function/effect" },
      { text: "effects", link: "/reactivity-function/effects" },
      { text: "safeEffect", link: "/reactivity-function/safeEffect" },
      { text: "asyncEffect", link: "/reactivity-function/asyncEffect" },
      { text: "bindings", link: "/reactivity-function/bindings" },
    ],
  },

  {
    text: "State Updates And Modification",
    collapsed: true,
    items: [
      { text: "updateAll", link: "/state-update/updateAll" },
      { text: "set", link: "/state-update/set" },
      { text: "notify", link: "/state-update/notify" },
    ],
  },

  {
    text: "Batch Operations",
    collapsed: true,
    items: [
      { text: "batch", link: "/batching/batch" },
      { text: "pause", link: "/batching/pause" },
      { text: "resume", link: "/batching/resume" },
      { text: "untrack", link: "/batching/untrack" },
    ],
  },

  {
    text: "Builder Pattern",
    collapsed: true,
    items: [
      { text: "action", link: "/builder-pattern/builder-action" },
      { text: "actions", link: "/builder-pattern/builder-actions" },
      { text: "bind", link: "/builder-pattern/builder-bind" },
      { text: "build", link: "/builder-pattern/builder-build" },
      { text: "computed", link: "/builder-pattern/builder-computed" },
      { text: "destroy", link: "/builder-pattern/builder-destroy" },
      { text: "effect", link: "/builder-pattern/builder-effect" },
      { text: "watch", link: "/builder-pattern/builder-watch" },
    ],
  },

  {
    text: "Component Control",
    collapsed: true,
    items: [{ text: "destroy", link: "/component-control/destroy" }],
  },

  {
    text: "Utility Functions",
    collapsed: true,
    items: [
      { text: "isReactive", link: "/utility-functions/isReactive" },
      { text: "toRaw", link: "/utility-functions/toRaw" },
      { text: "getRaw", link: "/utility-functions/getRaw" },
    ],
  },
];

const otherSidebar = [

  {
    text: "CleanUp System",
    collapsed: true,
    items: [
      { text: "collector", link: "/cleanup-system/collector" },
      { text: "scope", link: "/cleanup-system/scope" },
      { text: "add", link: "/cleanup-system/add" },
      { text: "size", link: "/cleanup-system/size" },
      { text: "disposed", link: "/cleanup-system/disposed" },
      { text: "cleanup", link: "/cleanup-system/cleanup" },
    ],
  },

  {
    text: "Error Handling",
    collapsed: true,
    items: [
      { text: "ErrorBoundary", link: "/error-handling/ErrorBoundary" },
      { text: "wrap", link: "/error-handling/wrap" },
    ],
  },

  {
    text: "Reactivity Engine",
    collapsed: true,
    items: [
      {
        text: "Under The Hood",
        link: "/reactivity-engine/under-the-hood",
      },
      { text: "proxy", link: "/reactivity-engine/proxy" },
      { text: "weakMap", link: "/reactivity-engine/weakMap" },
      { text: "set", link: "/reactivity-engine/set" },
      { text: "closures", link: "/reactivity-engine/closures" },
      {
        text: "microtaskQueue",
        link: "/reactivity-engine/microtaskQueue",
      },
      { text: "symbol", link: "/reactivity-engine/symbol" },
    ],
  },

  {
    text: "Development Tool",
    collapsed: true,
    items: [
      {
        text: "DevTools overview",
        link: "/development-tool/DevTools-overview",
      },
      {
        text: "DevTools lifecycle",
        link: "/development-tool/DevTools-lifecycle",
      },
      {
        text: "DevTools tracking",
        link: "/development-tool/DevTools-tracking",
      },
      {
        text: "DevTools inspection",
        link: "/development-tool/DevTools-inspection",
      },
      {
        text: "DevTools guides",
        link: "/development-tool/DevTools-guides",
      },
    ],
  },
];

const storageSidebar = [
            {
    text: "Storage Integration",
    collapsed: true,
    items: [
      { text: "autoSave", link: "/storage-integration/autoSave" },
      { text: "reactiveStorage", link: "/storage-integration/reactiveStorage" },
      { text: "watchStorage", link: "/storage-integration/watchStorage" },
      { text: "save", link: "/storage-integration/save" },
      { text: "load", link: "/storage-integration/load" },
      { text: "clear", link: "/storage-integration/clear" },
      { text: "exists", link: "/storage-integration/exists" },
      { text: "startAutoSave", link: "/storage-integration/startAutoSave" },
      { text: "stopAutoSave", link: "/storage-integration/stopAutoSave" },
      { text: "storageInfo", link: "/storage-integration/storageInfo" },
      {
        text: "Storage Availability",
        link: "/storage-integration/storage-availability",
      },
    ],
  },

  {
    text: "Reactive Storage Proxy Methods",
    collapsed: true,
    items: [
      { text: "set", link: "/reactive-storage-proxy-methods/proxy.set" },
      { text: "get", link: "/reactive-storage-proxy-methods/proxy.get" },
      { text: "remove", link: "/reactive-storage-proxy-methods/proxy.remove" },
      { text: "has", link: "/reactive-storage-proxy-methods/proxy.has" },
      { text: "keys", link: "/reactive-storage-proxy-methods/proxy.keys" },
      { text: "clear", link: "/reactive-storage-proxy-methods/proxy.clear" },
    ],
  },

  {
    text: "AutoSave Options",
    collapsed: true,
    items: [
      { text: "storage", link: "/autosave-options/options.storage" },
      { text: "namespace", link: "/autosave-options/options.namespace" },
      { text: "debounce", link: "/autosave-options/options.debounce" },
      { text: "autoLoad", link: "/autosave-options/options.autoLoad" },
      { text: "autoSave", link: "/autosave-options/options.autoSave" },
      { text: "sync", link: "/autosave-options/options.sync" },
      { text: "expires", link: "/autosave-options/options.expires" },
      { text: "onSave", link: "/autosave-options/options.onSave" },
      { text: "onLoad", link: "/autosave-options/options.onLoad" },
      { text: "onSync", link: "/autosave-options/options.onSync" },
      { text: "onError", link: "/autosave-options/options.onError" },
    ],
  },

  {
    text: "WatchStorage Options",
    collapsed: true,
    items: [
      { text: "storage", link: "/watchstorage-options/options.storage" },
      { text: "namespace", link: "/watchstorage-options/options.namespace" },
      { text: "immediate", link: "/watchstorage-options/options.immediate" },
    ],
  },
]

export default defineConfig({
  title: "DOM Helpers ",
  description: "A JavaScript-first DOM utility library",
  base: "/DOMHelpers-Reactive-Documentation/",
  ignoreDeadLinks: true,

  themeConfig: {

    socialLinks: [
      { icon: 'github', link: 'https://github.com/giovanni1707/DOMHelpers-Reactive-System' }
    ],

    nav: [
      {
        text: "Getting Started",
        link: "/getting-started/what-is-dom-helpers-reactive",
      },
      { text: "Fundamentals", link: "/reactive-state/state" },
      // UPDATED: Created a dropdown for Collection, Form, Async, and Storage
      {
        text: "Features",
        items: [
          { text: "Collection", link: "/collection-operations/items" },
          { text: "Form", link: "/form-operations/setValue" },
          { text: "Async", link: "/async-operations/asyncState" },
          { text: "Storage", link: "/storage-integration/autoSave" },
        ],
      },
      // UPDATED: Created a dropdown for More... section
      {
        text: "More...",
        items: [
          { text: "Cleanup System", link: "/cleanup-system/collector" },
          { text: "Error Handling", link: "/error-handling/ErrorBoundary" },
          { text: "Reactivity Engine", link: "/reactivity-engine/under-the-hood" },
          { text: "Development Tools", link: "/development-tool/DevTools-overview" },
        ],
      },
      // UPDATED: Created a dropdown for About section
      {
        text: "About",
        items: [
          { text: "The Creator", link: "/creator/creator" },
          { text: "Sponsor", link: "/sponsor/sponsor" },
        ],
      },

      { text: "ReactivePlus", link: "https://giovanni1707.github.io/DOMHelpers-ReactivePlus" },

      { text: "Core", link: "https://example" },
    ],

    sidebar: {
      "/getting-started/": [
        {
          text: "Getting Started",
          collapsed: true,
          items: [
            {
              text: "What Is DOM Helpers Reactive",
              link: "/getting-started/what-is-dom-helpers-reactive",
            },
            {
              text: "What Is Reactivity",
              link: "/getting-started/what-is-reactivity",
            },
            {
              text: "Learning Philosophy",
              link: "/getting-started/learning-philosophy",
            },

            { text: "Installation", link: "/getting-started/installation" },
          ],
        },

        {
          text: "Reactivity With Core Integration",
          collapsed: true,
          items: [
            {
              text: "Core Integration",
              link: "/getting-started/core-integration",
            },
          ],
        },
        
        { text: "ReactivePlus", link: "https://giovanni1707.github.io/DOMHelpers-ReactivePlus" },
        { text: "Core", link: "https://example" },

        {
          text: "Methods Learning Guide",
          collapsed: true,
          items: [
            {
              text: "methods guide",
              link: "/getting-started/methods-learning-guide",
            },
          ],
        },

      ],

      // All these routes share the same sidebar
      "/reactive-state/": sharedSidebar,
      "/reactivity-function/": sharedSidebar,
      "/state-update/": sharedSidebar,
      "/batching/": sharedSidebar,
      "/builder-pattern/": sharedSidebar,
      "/component-control/": sharedSidebar,
      "/utility-functions/": sharedSidebar,

      "/collection-operations/": [
        {
          text: "Collection Operations",
          collapsed: true,
          items: [{ text: "items", link: "/collection-operations/items" }],
        },

        {
          text: "Collection Methods",
          collapsed: true,
          items: [
            { text: "add", link: "/collection-operations/add" },
            { text: "remove", link: "/collection-operations/remove" },
            { text: "update", link: "/collection-operations/update" },
            { text: "clear", link: "/collection-operations/clear" },
          ],
        },

        {
          text: "Bulk Collection Operations",
          collapsed: true,
          items: [
            { text: "removeWhere", link: "/collection-operations/removeWhere" },
            { text: "updateWhere", link: "/collection-operations/updateWhere" },
            { text: "toggle", link: "/collection-operations/toggle" },
            { text: "toggleAll", link: "/collection-operations/toggleAll" },
            { text: "reset", link: "/collection-operations/reset" },
          ],
        },

        {
          text: "Find Methods",
          collapsed: true,
          items: [
            { text: "find", link: "/collection-operations/find" },
            { text: "indexOf", link: "/collection-operations/indexOf" },
            { text: "at", link: "/collection-operations/at" },
            { text: "includes", link: "/collection-operations/includes" },
          ],
        },

        {
          text: "Iteration Methods",
          collapsed: true,
          items: [
            { text: "forEach", link: "/collection-operations/forEach" },
            { text: "map", link: "/collection-operations/map" },
            { text: "eachEntries", link: "/collection-operations/eachEntries" },
            { text: "mapEntries", link: "/collection-operations/mapEntries" },
          ],
        },

        {
          text: "Query Methods",
          collapsed: true,
          items: [
            { text: "length", link: "/collection-operations/length" },
            { text: "first", link: "/collection-operations/first" },
            { text: "last", link: "/collection-operations/last" },
            { text: "isEmpty", link: "/collection-operations/isEmpty" },
          ],
        },

        {
          text: "Addition and Removal Methods",
          collapsed: true,
          items: [
            { text: "push", link: "/collection-operations/push" },
            { text: "unshift", link: "/collection-operations/unshift" },
            { text: "pop", link: "/collection-operations/pop" },
            { text: "shift", link: "/collection-operations/shift" },
          ],
        },

        {
          text: "Filter And Ordering Methods",
          collapsed: true,
          items: [
            { text: "filter", link: "/collection-operations/filter" },
            { text: "sort", link: "/collection-operations/sort" },
            { text: "reverse", link: "/collection-operations/reverse" },
          ],
        },

        {
          text: "Other Methods",
          collapsed: true,
          items: [
            { text: "fill", link: "/collection-operations/fill" },
            { text: "copyWithin", link: "/collection-operations/copyWithin" },
            { text: "toArray", link: "/collection-operations/toArray" },
            { text: "splice", link: "/collection-operations/splice" },
            { text: "slice", link: "/collection-operations/slice" },
          ],
        },

        {
          text: "Manual Patching Functions",
          collapsed: true,
          items: [
            {
              text: "patchArray",
              link: "/collection-operations/patchArray",
            },
          ],
        },
      ],

      // Shared sidebar for form-related routes
      "/form-operations/": formSidebar,
      "/form-validators/": formSidebar,
      "/error-management/": formSidebar,
      "/touched-state/": formSidebar,
      "/form-computed-properties/": formSidebar,
      "/form-state-properties/": formSidebar,

      // shared sidebar for storage
      "/storage-integration/": storageSidebar,

       "/async-operations/": [
      {
    text: "Async State Operations",
    collapsed: true,
    items: [
      { text: "asyncState", link: "/async-operations/asyncState" },
      { text: "execute", link: "/async-operations/execute" },
      { text: "abort", link: "/async-operations/abort" },
      { text: "reset", link: "/async-operations/reset" },
      { text: "refetch", link: "/async-operations/refetch" },
      { text: "data", link: "/async-operations/data" },
      { text: "loading", link: "/async-operations/loading" },
      { text: "error", link: "/async-operations/error" },
      { text: "requestId", link: "/async-operations/requestId" },
      { text: "abortController", link: "/async-operations/abortController" },
      { text: "isSuccess", link: "/async-operations/isSuccess" },
      { text: "isError", link: "/async-operations/isError" },
      { text: "isIdle", link: "/async-operations/isIdle" },
    ],
  },
       ],

      //shared sidebar for otherSidebar
      "/error-handling/": otherSidebar,
      "/cleanup-system/": otherSidebar,
      "/reactivity-engine/": otherSidebar,
      "/development-tool/": otherSidebar,
      "/reactive-core/": otherSidebar,

      "/creator/": [
        {
          text: "The Creator",
          collapsed: true,
          items: [
            { text: "About Me", link: "/creator/creator" },
            { text: "Approach & Philosophy", link: "/creator/approach-and-philosophy" },
            { text: "Contact And Support", link: "/creator/contact-info" },
          ],
        },
      ],

      "/sponsor/": [
        {
          text: "Sponsor The Project",
          collapsed: true,
          items: [
            { text: "sponsor", link: "/sponsor/sponsor" },
            { text: "developer note", link: "/sponsor/note" },
          ],
        },
      ],
    },
  },
});