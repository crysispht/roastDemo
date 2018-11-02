webpackJsonp([9],{

/***/ 103:
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(105)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 104:
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ 105:
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),

/***/ 106:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return EventBus; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);


var EventBus = new __WEBPACK_IMPORTED_MODULE_0_vue___default.a();

/***/ }),

/***/ 107:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeTypeFilter; });
var CafeTypeFilter = {
    methods: {
        processCafeTypeFilter: function processCafeTypeFilter(cafe, type) {
            switch (type) {
                case 'roasters':
                    if (cafe.company.roaster === 1) {
                        return true;
                    } else {
                        return false;
                    }
                    break;

                case 'cafes':
                    if (cafe.company.roaster === 0) {
                        return true;
                    } else {
                        return false;
                    }
                    break;

                case 'all':
                    return true;
                    break;
            }
        }
    }
};

/***/ }),

/***/ 108:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeBrewMethodsFilter; });
var CafeBrewMethodsFilter = {
    methods: {
        processCafeBrewMethodsFilter: function processCafeBrewMethodsFilter(cafe, brewMethods) {
            // 如果冲泡方法不为空，则进行处理
            if (brewMethods.length > 0) {
                var cafeBrewMethods = [];

                // 将咖啡店所有冲泡方法都推送到 cafeBrewMethods 数组
                for (var i = 0; i < cafe.brew_methods.length; i++) {
                    cafeBrewMethods.push(cafe.brew_methods[i].method);
                }

                // 遍历所有待处理冲泡方法，如果在 cafeBrewMethods 数组中则返回 true
                for (var i = 0; i < brewMethods.length; i++) {
                    if (cafeBrewMethods.indexOf(brewMethods[i]) > -1) {
                        return true;
                    }
                }

                // 如果都不在 cafeBrewMethods 数组中则返回 false
                return false;
            } else {
                return true;
            }
        }
    }
};

/***/ }),

/***/ 109:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeTextFilter; });
var CafeTextFilter = {
    methods: {
        processCafeTextFilter: function processCafeTextFilter(cafe, text) {
            // 文本不为空时才会处理
            if (text.length > 0) {
                // 如果咖啡店名称、位置、地址或城市与给定文本匹配，则返回 true，否则返回 false
                if (cafe.company.name.match('[^,]*' + text + '[,$]*') || cafe.location_name.match('[^,]*' + text + '[,$]*') || cafe.address.match('[^,]*' + text + '[,$]*') || cafe.city.match('[^,]*' + text + '[,$]*')) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }
    }
};

/***/ }),

/***/ 110:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeUserLikeFilter; });
var CafeUserLikeFilter = {
    methods: {
        processCafeUserLikeFilter: function processCafeUserLikeFilter(cafe) {
            if (cafe.user_like_count === 1) {
                return true;
            } else {
                return false;
            }
        }
    }
};

/***/ }),

/***/ 111:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeHasMatchaFilter; });
var CafeHasMatchaFilter = {
    methods: {
        processCafeHasMatchaFilter: function processCafeHasMatchaFilter(cafe) {
            /*
              Checks to see if the cafe has matcha
            */
            if (cafe.matcha === 1) {
                return true;
            } else {
                return false;
            }
        }
    }
};

/***/ }),

/***/ 112:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeHasTeaFilter; });
var CafeHasTeaFilter = {
    methods: {
        processCafeHasTeaFilter: function processCafeHasTeaFilter(cafe) {
            /*
              Checks to see if the cafe has tea
            */
            if (cafe.tea === 1) {
                return true;
            } else {
                return false;
            }
        }
    }
};

/***/ }),

/***/ 113:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeSubscriptionFilter; });
var CafeSubscriptionFilter = {
    methods: {
        /*
          Determines if the cafe has a subscription or not.
        */
        processCafeSubscriptionFilter: function processCafeSubscriptionFilter(cafe) {
            if (cafe.company.subscription === 1) {
                return true;
            } else {
                return false;
            }
        }
    }
};

/***/ }),

/***/ 114:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeInCityFilter; });
var CafeInCityFilter = {
    methods: {
        processCafeInCityFilter: function processCafeInCityFilter(cafe, cityID) {
            /*
              Checks to see if the cafe has tea
            */
            return cafe.city_id === cityID;
        }
    }
};

/***/ }),

/***/ 131:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(132);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("5ecfb915", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-27c90df1\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeCard.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-27c90df1\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeCard.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 132:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.cafe-card {\n  border-radius: 5px;\n  -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);\n          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);\n  padding: 15px 5px 5px 5px;\n  margin-top: 20px;\n  cursor: pointer;\n  -webkit-transform: scaleX(1) scaleY(1);\n  transform: scaleX(1) scaleY(1);\n  -webkit-transition: .2s;\n  transition: .2s;\n}\ndiv.cafe-card span.title {\n    display: block;\n    text-align: center;\n    color: black;\n    font-size: 18px;\n    font-weight: bold;\n    font-family: 'Lato', sans-serif;\n}\ndiv.cafe-card span.address {\n    display: block;\n    text-align: center;\n    margin-top: 5px;\n    color: #A0A0A0;\n    font-family: 'Lato', sans-serif;\n}\ndiv.cafe-card span.address span.street {\n      font-size: 14px;\n      display: block;\n}\ndiv.cafe-card span.address span.city {\n      font-size: 14px;\n}\ndiv.cafe-card span.address span.state {\n      font-size: 14px;\n}\ndiv.cafe-card span.address span.zip {\n      font-size: 14px;\n      display: block;\n}\ndiv.cafe-card span.liked-meta {\n    color: #A0A0A0;\n    font-size: 10px;\n    margin-left: 5px;\n    margin-right: 3px;\n}\ndiv.cafe-card span.liked-meta img {\n      width: 10px;\n}\ndiv.cafe-card:hover {\n    -webkit-transform: scaleX(1.041) scaleY(1.041);\n    transform: scaleX(1.041) scaleY(1.041);\n    -webkit-transition: .2s;\n    transition: .2s;\n}\n", ""]);

// exports


/***/ }),

/***/ 133:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_filters_CafeTypeFilter_js__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_filters_CafeBrewMethodsFilter_js__ = __webpack_require__(108);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__mixins_filters_CafeTextFilter_js__ = __webpack_require__(109);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__mixins_filters_CafeUserLikeFilter_js__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__mixins_filters_CafeHasMatchaFilter_js__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__mixins_filters_CafeHasTeaFilter_js__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__mixins_filters_CafeSubscriptionFilter_js__ = __webpack_require__(113);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__mixins_filters_CafeInCityFilter_js__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__event_bus_js__ = __webpack_require__(106);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//













/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_filters_CafeTypeFilter_js__["a" /* CafeTypeFilter */], __WEBPACK_IMPORTED_MODULE_1__mixins_filters_CafeBrewMethodsFilter_js__["a" /* CafeBrewMethodsFilter */], __WEBPACK_IMPORTED_MODULE_2__mixins_filters_CafeTextFilter_js__["a" /* CafeTextFilter */], __WEBPACK_IMPORTED_MODULE_3__mixins_filters_CafeUserLikeFilter_js__["a" /* CafeUserLikeFilter */], __WEBPACK_IMPORTED_MODULE_4__mixins_filters_CafeHasMatchaFilter_js__["a" /* CafeHasMatchaFilter */], __WEBPACK_IMPORTED_MODULE_5__mixins_filters_CafeHasTeaFilter_js__["a" /* CafeHasTeaFilter */], __WEBPACK_IMPORTED_MODULE_6__mixins_filters_CafeSubscriptionFilter_js__["a" /* CafeSubscriptionFilter */], __WEBPACK_IMPORTED_MODULE_7__mixins_filters_CafeInCityFilter_js__["a" /* CafeInCityFilter */]],
    props: ['cafe'],
    data: function data() {
        return {
            show: true
        };
    },
    mounted: function mounted() {
        __WEBPACK_IMPORTED_MODULE_8__event_bus_js__["a" /* EventBus */].$on('filters-updated', function (filters) {
            this.processFilters(filters);
        }.bind(this));
        this.processFilters();
    },

    computed: {
        city: function city() {
            return this.$store.getters.getCity;
        },
        cityFilter: function cityFilter() {
            return this.$store.getters.getCityFilter;
        },
        textSearch: function textSearch() {
            return this.$store.getters.getTextSearch;
        },
        activeLocationFilter: function activeLocationFilter() {
            return this.$store.getters.getActiveLocationFilter;
        },
        onlyLiked: function onlyLiked() {
            return this.$store.getters.getOnlyLiked;
        },
        brewMethodsFilter: function brewMethodsFilter() {
            return this.$store.getters.getBrewMethodsFilter;
        },
        hasMatcha: function hasMatcha() {
            return this.$store.getters.getHasMatcha;
        },
        hasTea: function hasTea() {
            return this.$store.getters.getHasTea;
        },
        hasSubscription: function hasSubscription() {
            return this.$store.getters.getHasSubscription;
        }
    },
    watch: {
        cityFilter: function cityFilter() {
            this.processFilters();
        },
        textSearch: function textSearch() {
            this.processFilters();
        },
        activeLocationFilter: function activeLocationFilter() {
            this.processFilters();
        },
        onlyLiked: function onlyLiked() {
            this.processFilters();
        },
        brewMethodsFilter: function brewMethodsFilter() {
            this.processFilters();
        },
        hasMatcha: function hasMatcha() {
            this.processFilters();
        },
        hasTea: function hasTea() {
            this.processFilters();
        },
        hasSubscription: function hasSubscription() {
            this.processFilters();
        }
    },
    methods: {
        processFilters: function processFilters() {
            // 如果过滤器为空，则显示所有咖啡店
            if (this.textSearch === '' && this.activeLocationFilter === 'all' && this.brewMethodsFilter.length === 0 && !this.onlyLiked && !this.hasMatcha && !this.hasTea && !this.hasSubscription && this.cityFilter === '') {
                this.show = true;
            } else {
                // 初始化过滤器条件
                var textPassed = false;
                var brewMethodsPassed = false;
                var typePassed = false;
                var likedPassed = false;
                var matchaPassed = false;
                var teaPassed = false;
                var subscriptionPassed = false;
                var cityPassed = false;

                if (this.processCafeTypeFilter(this.cafe, this.activeLocationFilter)) {
                    typePassed = true;
                }

                if (this.textSearch !== '' && this.processCafeTextFilter(this.cafe, this.textSearch)) {
                    textPassed = true;
                } else if (this.textSearch === '') {
                    textPassed = true;
                }

                if (this.brewMethodsFilter.length !== 0 && this.processCafeBrewMethodsFilter(this.cafe, this.brewMethodsFilter)) {
                    brewMethodsPassed = true;
                } else if (this.brewMethodsFilter.length === 0) {
                    brewMethodsPassed = true;
                }

                if (this.onlyLiked && this.processCafeUserLikeFilter(this.cafe)) {
                    likedPassed = true;
                } else if (!this.onlyLiked) {
                    likedPassed = true;
                }

                if (this.hasMatcha && this.processCafeHasMatchaFilter(this.cafe)) {
                    matchaPassed = true;
                } else if (!this.hasMatcha) {
                    matchaPassed = true;
                }

                if (this.hasTea && this.processCafeHasTeaFilter(this.cafe)) {
                    teaPassed = true;
                } else if (!this.hasTea) {
                    teaPassed = true;
                }

                if (this.hasSubscription && this.processCafeSubscriptionFilter(this.cafe)) {
                    subscriptionPassed = true;
                } else if (!this.hasSubscription) {
                    subscriptionPassed = true;
                }

                if (this.cityFilter !== '' && this.processCafeInCityFilter(this.cafe, this.cityFilter)) {
                    cityPassed = true;
                } else if (this.cityFilter === '') {
                    cityPassed = true;
                }

                if (typePassed && textPassed && brewMethodsPassed && likedPassed && matchaPassed && teaPassed && subscriptionPassed && cityPassed) {
                    this.show = true;
                } else {
                    this.show = false;
                }
            }
        },
        panToLocation: function panToLocation(cafe) {
            __WEBPACK_IMPORTED_MODULE_8__event_bus_js__["a" /* EventBus */].$emit('location-selected', { lat: parseFloat(cafe.latitude), lng: parseFloat(cafe.longitude) });
        }
    }
});

/***/ }),

/***/ 134:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      directives: [
        { name: "show", rawName: "v-show", value: _vm.show, expression: "show" }
      ],
      staticClass: "large-3 medium-4 small-6 cell cafe-card-container"
    },
    [
      _c(
        "router-link",
        { attrs: { to: { name: "cafe", params: { id: _vm.cafe.id } } } },
        [
          _c("div", { staticClass: "cafe-card" }, [
            _c("span", { staticClass: "title" }, [
              _vm._v(_vm._s(_vm.cafe.name))
            ]),
            _vm._v(" "),
            _c("span", { staticClass: "address" }, [
              _c("span", { staticClass: "street" }, [
                _vm._v(_vm._s(_vm.cafe.address))
              ]),
              _vm._v(" "),
              _c("span", { staticClass: "city" }, [
                _vm._v(_vm._s(_vm.cafe.city))
              ]),
              _vm._v(" "),
              _c("span", { staticClass: "state" }, [
                _vm._v(_vm._s(_vm.cafe.state))
              ]),
              _vm._v(" "),
              _c("span", { staticClass: "zip" }, [_vm._v(_vm._s(_vm.cafe.zip))])
            ])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "meta-data" }, [
            _c("span", { staticClass: "liked-meta" }, [
              _c("img", {
                attrs: {
                  src:
                    _vm.cafe.user_like_count > 0
                      ? "/storage/img/liked.svg"
                      : "/storage/img/unliked.svg"
                }
              }),
              _vm._v(
                "\n                " +
                  _vm._s(_vm.cafe.likes_count) +
                  "\n            "
              )
            ])
          ])
        ]
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-27c90df1", module.exports)
  }
}

/***/ }),

/***/ 60:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(131)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(133)
/* template */
var __vue_template__ = __webpack_require__(134)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/js/components/cafes/CafeCard.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-27c90df1", Component.options)
  } else {
    hotAPI.reload("data-v-27c90df1", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});