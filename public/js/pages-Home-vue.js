webpackJsonp([0,4,8,9,32,34,36,37],{

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

/***/ 135:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(136);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("12e22f90", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-61843689\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ListFilters.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-61843689\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ListFilters.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 136:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.list-filters-container {\n  border-bottom: 1px solid #BABABA;\n  margin-bottom: 30px;\n  padding-bottom: 20px;\n  padding-top: 20px;\n}\ndiv.list-filters-container span.clear-filters {\n    font-size: 16px;\n    color: #054E7A;\n    font-family: \"Lato\", sans-serif;\n    cursor: pointer;\n    display: block;\n    float: left;\n    margin-bottom: 20px;\n    display: none;\n}\ndiv.list-filters-container span.clear-filters img {\n      margin-right: 10px;\n      float: left;\n      margin-top: 6px;\n}\ndiv.list-filters-container span.filters-header {\n    display: block;\n    font-family: \"Lato\", sans-serif;\n    font-weight: bold;\n    margin-bottom: 10px;\n}\ndiv.list-filters-container input[type=\"text\"].search {\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    border-radius: 3px;\n    color: #BABABA;\n    font-size: 16px;\n    font-family: \"Lato\", sans-serif;\n    background-image: url(\"/storage/img/search-icon.svg\");\n    background-repeat: no-repeat;\n    background-position: 6px;\n    padding-left: 35px;\n    padding-top: 5px;\n    padding-bottom: 5px;\n}\ndiv.list-filters-container label.filter-label {\n    font-family: \"Lato\", sans-serif;\n    text-transform: uppercase;\n    font-weight: bold;\n    color: black;\n    margin-top: 20px;\n    margin-bottom: 10px;\n}\ndiv.list-filters-container div.location-filter {\n    text-align: center;\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n    color: #FFBE54;\n    border-bottom: 1px solid #FFBE54;\n    border-top: 1px solid #FFBE54;\n    border-left: 1px solid #FFBE54;\n    border-right: 1px solid #FFBE54;\n    width: 33%;\n    display: inline-block;\n    height: 55px;\n    line-height: 55px;\n    cursor: pointer;\n    margin-bottom: 5px;\n}\ndiv.list-filters-container div.location-filter.active {\n      color: white;\n      background-color: #FFBE54;\n}\ndiv.list-filters-container div.location-filter.all-locations {\n      border-top-left-radius: 3px;\n      border-bottom-left-radius: 3px;\n}\ndiv.list-filters-container div.location-filter.roasters {\n      border-left: none;\n      border-right: none;\n}\ndiv.list-filters-container div.location-filter.cafes {\n      border-top-right-radius: 3px;\n      border-bottom-right-radius: 3px;\n}\ndiv.list-filters-container span.order-direction {\n    cursor: pointer;\n    display: inline-block;\n    padding: 5px 20px;\n    background-color: white;\n    font-family: \"Lato\", sans-serif;\n    text-align: center;\n    border: 1px solid #FFBE54;\n    color: #FFBE54;\n}\ndiv.list-filters-container span.order-direction.asc {\n      border-top-left-radius: 5px;\n      border-bottom-left-radius: 5px;\n}\ndiv.list-filters-container span.order-direction.asc.active {\n        color: white;\n        background-color: #FFBE54;\n}\ndiv.list-filters-container span.order-direction.desc {\n      border-top-right-radius: 5px;\n      border-bottom-right-radius: 5px;\n}\ndiv.list-filters-container span.order-direction.desc.active {\n        color: white;\n        background-color: #FFBE54;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv.list-filters-container span.clear-filters {\n    display: block;\n}\ndiv.list-filters-container div.close-filters {\n    display: none;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 137:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_bus_js__ = __webpack_require__(106);
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
    mounted: function mounted() {

        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('show-filters', function () {
            this.show = true;
        }.bind(this));

        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('clear-filters', function () {
            this.clearFilters();
        }.bind(this));
    },


    watch: {

        'cityFilter': function cityFilter() {

            if (this.cityFilter !== '') {
                var id = '';

                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].id === this.cityFilter) {
                        id = this.cities[i].id;
                    }
                }
                if (id === '') {
                    this.$router.push({ name: 'cafes' });
                } else {
                    this.$router.push({ name: 'city', params: { id: id } });
                }
            } else {
                this.$router.push({ name: 'cafes' });
            }
        },

        'citiesLoadStatus': function citiesLoadStatus() {

            if (this.citiesLoadStatus === 2 && this.$route.name === 'city') {
                var id = '';
                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].id === this.$route.params.id) {
                        this.cityFilter = this.cities[i].id;
                    }
                }
            }
        }
    },

    computed: {
        showFilters: function showFilters() {
            return this.$store.getters.getShowFilters;
        },
        cities: function cities() {
            return this.$store.getters.getCities;
        },
        citiesLoadStatus: function citiesLoadStatus() {
            return this.$store.getters.getCitiesLoadStatus;
        },

        cityFilter: {
            set: function set(cityFilter) {
                this.$store.commit('setCityFilter', cityFilter);
            },
            get: function get() {
                return this.$store.getters.getCityFilter;
            }
        },

        brewMethods: function brewMethods() {
            return this.$store.getters.getBrewMethods;
        },
        user: function user() {
            return this.$store.getters.getUser;
        },
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        },
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
        },


        textSearch: {
            set: function set(textSearch) {
                this.$store.commit('setTextSearch', textSearch);
            },
            get: function get() {
                return this.$store.getters.getTextSearch;
            }
        },

        activeLocationFilter: function activeLocationFilter() {
            return this.$store.getters.getActiveLocationFilter;
        },


        onlyLiked: {
            set: function set(onlyLiked) {
                this.$store.commit('setOnlyLiked', onlyLiked);
            },
            get: function get() {
                return this.$store.getters.getOnlyLiked;
            }
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
        },


        orderBy: {
            set: function set(orderBy) {
                this.$store.dispatch('updateOrderBy', orderBy);
            },
            get: function get() {
                return this.$store.getters.getOrderBy;
            }
        },

        orderDirection: function orderDirection() {
            return this.$store.getters.getOrderDirection;
        }
    },

    methods: {
        setActiveLocationFilter: function setActiveLocationFilter(filter) {
            this.$store.dispatch('updateActiveLocationFilter', filter);
        },
        toggleBrewMethodFilter: function toggleBrewMethodFilter(id) {
            var localBrewMethodsFilter = this.brewMethodsFilter;
            if (localBrewMethodsFilter.indexOf(id) >= 0) {
                localBrewMethodsFilter.splice(localBrewMethodsFilter.indexOf(id), 1);
            } else {
                localBrewMethodsFilter.push(id);
            }
            this.$store.dispatch('updateBrewMethodsFilter', localBrewMethodsFilter);
        },
        toggleShowFilters: function toggleShowFilters() {
            this.$store.dispatch('toggleShowFilters', { showFilters: !this.showFilters });
        },
        toggleMatchaFilter: function toggleMatchaFilter() {
            this.$store.dispatch('updateHasMatcha', !this.hasMatcha);
        },
        toggleTeaFilter: function toggleTeaFilter() {
            this.$store.dispatch('updateHasTea', !this.hasTea);
        },
        toggleSubscriptionFilter: function toggleSubscriptionFilter() {
            this.$store.dispatch('updateHasSubscription', !this.hasSubscription);
        },
        clearFilters: function clearFilters() {
            this.$store.dispatch('resetFilters');
        },
        setOrderDirection: function setOrderDirection(direction) {
            this.$store.dispatch('updateOrderDirection', direction);
        }
    }
});

/***/ }),

/***/ 138:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("transition", { attrs: { name: "slide-in-top" } }, [
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.showFilters && _vm.cafesView === "list",
            expression: "showFilters && cafesView === 'list'"
          }
        ],
        staticClass: "large-12 medium-12 small-12 cell list-filters-container"
      },
      [
        _c("div", { staticClass: "grid-x cafe-grid-container" }, [
          _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                _c("label", { staticClass: "filter-label" }, [_vm._v("城市")]),
                _vm._v(" "),
                _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.cityFilter,
                        expression: "cityFilter"
                      }
                    ],
                    on: {
                      change: function($event) {
                        var $$selectedVal = Array.prototype.filter
                          .call($event.target.options, function(o) {
                            return o.selected
                          })
                          .map(function(o) {
                            var val = "_value" in o ? o._value : o.value
                            return val
                          })
                        _vm.cityFilter = $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      }
                    }
                  },
                  [
                    _c("option", { attrs: { value: "" } }),
                    _vm._v(" "),
                    _vm._l(_vm.cities, function(city) {
                      return _c("option", { domProps: { value: city.id } }, [
                        _vm._v(_vm._s(city.name))
                      ])
                    })
                  ],
                  2
                )
              ])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c(
                  "span",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.showFilters,
                        expression: "showFilters"
                      }
                    ],
                    staticClass: "clear-filters",
                    on: {
                      click: function($event) {
                        _vm.clearFilters()
                      }
                    }
                  },
                  [
                    _c("img", {
                      attrs: { src: "/storage/img/clear-filters-icon.svg" }
                    }),
                    _vm._v(" 清除过滤器\n          ")
                  ]
                ),
                _vm._v(" "),
                _c("div", { staticClass: "grid-x grid-padding-x" }, [
                  _c(
                    "div",
                    { staticClass: "large-12 medium-12 small-12 cell" },
                    [
                      _c("label", { staticClass: "filter-label" }, [
                        _vm._v("通过名称或位置搜索")
                      ])
                    ]
                  )
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.textSearch,
                      expression: "textSearch"
                    }
                  ],
                  staticClass: "search",
                  attrs: { type: "text", placeholder: "通过名称或位置搜索" },
                  domProps: { value: _vm.textSearch },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.textSearch = $event.target.value
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c("div", { attrs: { id: "location-type-container" } }, [
                  _c("div", { staticClass: "grid-x grid-padding-x" }, [
                    _c(
                      "div",
                      { staticClass: "large-12 medium-12 small-12 cell" },
                      [
                        _c("label", { staticClass: "filter-label" }, [
                          _vm._v("咖啡店类型")
                        ])
                      ]
                    )
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "grid-x grid-padding-x" }, [
                    _c(
                      "div",
                      { staticClass: "large-12 medium-12 small-12 cell" },
                      [
                        _c(
                          "div",
                          {
                            staticClass: "location-filter all-locations",
                            class: {
                              active: _vm.activeLocationFilter === "all"
                            },
                            on: {
                              click: function($event) {
                                _vm.setActiveLocationFilter("all")
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                        所有类型\n                                    "
                            )
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "location-filter roasters",
                            class: {
                              active: _vm.activeLocationFilter === "roasters"
                            },
                            on: {
                              click: function($event) {
                                _vm.setActiveLocationFilter("roasters")
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                        烘焙店\n                                    "
                            )
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "location-filter cafes",
                            class: {
                              active: _vm.activeLocationFilter === "cafes"
                            },
                            on: {
                              click: function($event) {
                                _vm.setActiveLocationFilter("cafes")
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                        咖啡店\n                                    "
                            )
                          ]
                        )
                      ]
                    )
                  ])
                ])
              ])
            ]),
            _vm._v(" "),
            _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.user != "" && _vm.userLoadStatus === 2,
                    expression: "user != '' && userLoadStatus === 2"
                  }
                ],
                staticClass: "grid-x grid-padding-x",
                attrs: { id: "only-liked-container" }
              },
              [
                _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.onlyLiked,
                        expression: "onlyLiked"
                      }
                    ],
                    attrs: { type: "checkbox" },
                    domProps: {
                      checked: Array.isArray(_vm.onlyLiked)
                        ? _vm._i(_vm.onlyLiked, null) > -1
                        : _vm.onlyLiked
                    },
                    on: {
                      change: function($event) {
                        var $$a = _vm.onlyLiked,
                          $$el = $event.target,
                          $$c = $$el.checked ? true : false
                        if (Array.isArray($$a)) {
                          var $$v = null,
                            $$i = _vm._i($$a, $$v)
                          if ($$el.checked) {
                            $$i < 0 && (_vm.onlyLiked = $$a.concat([$$v]))
                          } else {
                            $$i > -1 &&
                              (_vm.onlyLiked = $$a
                                .slice(0, $$i)
                                .concat($$a.slice($$i + 1)))
                          }
                        } else {
                          _vm.onlyLiked = $$c
                        }
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c("span", { staticClass: "liked-location-label" }, [
                    _vm._v("只显示我喜欢过的")
                  ])
                ])
              ]
            ),
            _vm._v(" "),
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c("label", { staticClass: "filter-label" }, [_vm._v("排序")]),
                _vm._v(" "),
                _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.orderBy,
                        expression: "orderBy"
                      }
                    ],
                    on: {
                      change: function($event) {
                        var $$selectedVal = Array.prototype.filter
                          .call($event.target.options, function(o) {
                            return o.selected
                          })
                          .map(function(o) {
                            var val = "_value" in o ? o._value : o.value
                            return val
                          })
                        _vm.orderBy = $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      }
                    }
                  },
                  [
                    _c("option", { attrs: { value: "name" } }, [
                      _vm._v("名称")
                    ]),
                    _vm._v(" "),
                    _c("option", { attrs: { value: "most-liked" } }, [
                      _vm._v("最多喜欢")
                    ])
                  ]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c("label", { staticClass: "filter-label" }, [_vm._v("顺序")]),
                _vm._v(" "),
                _c(
                  "span",
                  {
                    staticClass: "asc order-direction",
                    class: { active: _vm.orderDirection === "asc" },
                    on: {
                      click: function($event) {
                        _vm.setOrderDirection("asc")
                      }
                    }
                  },
                  [_vm._v("升序")]
                ),
                _vm._v(" "),
                _c(
                  "span",
                  {
                    staticClass: "desc order-direction",
                    class: { active: _vm.orderDirection === "desc" },
                    on: {
                      click: function($event) {
                        _vm.setOrderDirection("desc")
                      }
                    }
                  },
                  [_vm._v("降序")]
                )
              ])
            ]),
            _vm._v(" "),
            _c("div", { attrs: { id: "brew-methods-container" } }, [
              _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                  _c("label", { staticClass: "filter-label" }, [
                    _vm._v("冲泡方法")
                  ])
                ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c(
                  "div",
                  { staticClass: "large-12 medium-12 small-12 cell" },
                  _vm._l(_vm.brewMethods, function(method) {
                    return method.cafes_count > 0
                      ? _c(
                          "div",
                          {
                            staticClass: "brew-method option",
                            class: {
                              active:
                                _vm.brewMethodsFilter.indexOf(method.id) >= 0
                            },
                            on: {
                              click: function($event) {
                                _vm.toggleBrewMethodFilter(method.id)
                              }
                            }
                          },
                          [
                            _c("div", { staticClass: "option-container" }, [
                              _c("img", {
                                staticClass: "option-icon",
                                attrs: { src: method.icon }
                              }),
                              _vm._v(" "),
                              _c("span", { staticClass: "option-name" }, [
                                _vm._v(_vm._s(method.method))
                              ])
                            ])
                          ]
                        )
                      : _vm._e()
                  })
                )
              ])
            ]),
            _vm._v(" "),
            _c("div", { attrs: { id: "drink-options-container" } }, [
              _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                  _c("label", { staticClass: "filter-label" }, [
                    _vm._v("饮料选项")
                  ]),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      staticClass: "drink-option option",
                      class: { active: _vm.hasMatcha },
                      on: {
                        click: function($event) {
                          _vm.toggleMatchaFilter()
                        }
                      }
                    },
                    [
                      _c("div", { staticClass: "option-container" }, [
                        _c("img", {
                          staticClass: "option-icon",
                          attrs: { src: "/storage/img/matcha-latte.svg" }
                        }),
                        _vm._v(" "),
                        _c("span", { staticClass: "option-name" }, [
                          _vm._v("抹茶")
                        ])
                      ])
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      staticClass: "drink-option option",
                      class: { active: _vm.hasTea },
                      on: {
                        click: function($event) {
                          _vm.toggleTeaFilter()
                        }
                      }
                    },
                    [
                      _c("div", { staticClass: "option-container" }, [
                        _c("img", {
                          staticClass: "option-icon",
                          attrs: { src: "/storage/img/tea-bag.svg" }
                        }),
                        _vm._v(" "),
                        _c("span", { staticClass: "option-name" }, [
                          _vm._v("茶包")
                        ])
                      ])
                    ]
                  )
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                  _c(
                    "div",
                    {
                      directives: [
                        {
                          name: "show",
                          rawName: "v-show",
                          value:
                            _vm.activeLocationFilter === "roasters" ||
                            _vm.activeLocationFilter === "all",
                          expression:
                            "activeLocationFilter === 'roasters' || activeLocationFilter === 'all'"
                        }
                      ],
                      staticClass: "grid-x grid-padding-x"
                    },
                    [
                      _c(
                        "div",
                        { staticClass: "large-12 medium-12 small-12 cell" },
                        [
                          _c("label", { staticClass: "filter-label" }, [
                            _vm._v("是否提供订购服务")
                          ])
                        ]
                      )
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      directives: [
                        {
                          name: "show",
                          rawName: "v-show",
                          value:
                            _vm.activeLocationFilter === "roasters" ||
                            _vm.activeLocationFilter === "all",
                          expression:
                            "activeLocationFilter === 'roasters' || activeLocationFilter === 'all'"
                        }
                      ],
                      staticClass: "grid-x grid-padding-x"
                    },
                    [
                      _c(
                        "div",
                        { staticClass: "large-12 medium-12 small-12 cell" },
                        [
                          _c(
                            "div",
                            {
                              staticClass: "subscription option",
                              class: { active: _vm.hasSubscription },
                              on: {
                                click: function($event) {
                                  _vm.toggleSubscriptionFilter()
                                }
                              }
                            },
                            [
                              _c("div", { staticClass: "option-container" }, [
                                _c("img", {
                                  staticClass: "option-icon",
                                  attrs: { src: "/storage/img/coffee-pack.svg" }
                                }),
                                _vm._v(" "),
                                _c("span", { staticClass: "option-name" }, [
                                  _vm._v("咖啡订购")
                                ])
                              ])
                            ]
                          )
                        ]
                      )
                    ]
                  )
                ])
              ])
            ])
          ])
        ])
      ]
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-61843689", module.exports)
  }
}

/***/ }),

/***/ 139:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(140);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("5d1c2f15", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5423b48b\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeMap.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5423b48b\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeMap.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 140:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#cafe-map-container {\n  position: absolute;\n  top: 75px;\n  left: 0px;\n  right: 0px;\n  bottom: 0px;\n}\ndiv#cafe-map-container div#cafe-map {\n    position: absolute;\n    top: 0px;\n    left: 0px;\n    right: 0px;\n    bottom: 0px;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-name {\n    display: block;\n    text-align: center;\n    color: #7F5F2A;\n    font-family: 'Josefin Sans', sans-serif;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-address {\n    display: block;\n    text-align: center;\n    margin-top: 5px;\n    color: #A0A0A0;\n    font-family: 'Lato', sans-serif;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-address span.street {\n      font-size: 14px;\n      display: block;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-address span.city {\n      font-size: 12px;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-address span.state {\n      font-size: 12px;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-address span.zip {\n      font-size: 12px;\n      display: block;\n}\ndiv#cafe-map-container div.cafe-info-window div.cafe-address a {\n      color: #FFBE54;\n      font-weight: bold;\n}\n", ""]);

// exports


/***/ }),

/***/ 141:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event_bus_js__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__mixins_filters_CafeTypeFilter_js__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__mixins_filters_CafeBrewMethodsFilter_js__ = __webpack_require__(108);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__mixins_filters_CafeTagsFilter_js__ = __webpack_require__(142);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__mixins_filters_CafeTextFilter_js__ = __webpack_require__(109);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__mixins_filters_CafeUserLikeFilter_js__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__mixins_filters_CafeHasMatchaFilter_js__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__mixins_filters_CafeHasTeaFilter_js__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__mixins_filters_CafeSubscriptionFilter_js__ = __webpack_require__(113);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__mixins_filters_CafeInCityFilter_js__ = __webpack_require__(114);
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
    mixins: [__WEBPACK_IMPORTED_MODULE_2__mixins_filters_CafeTypeFilter_js__["a" /* CafeTypeFilter */], __WEBPACK_IMPORTED_MODULE_3__mixins_filters_CafeBrewMethodsFilter_js__["a" /* CafeBrewMethodsFilter */], __WEBPACK_IMPORTED_MODULE_4__mixins_filters_CafeTagsFilter_js__["a" /* CafeTagsFilter */], __WEBPACK_IMPORTED_MODULE_5__mixins_filters_CafeTextFilter_js__["a" /* CafeTextFilter */], __WEBPACK_IMPORTED_MODULE_6__mixins_filters_CafeUserLikeFilter_js__["a" /* CafeUserLikeFilter */], __WEBPACK_IMPORTED_MODULE_7__mixins_filters_CafeHasMatchaFilter_js__["a" /* CafeHasMatchaFilter */], __WEBPACK_IMPORTED_MODULE_8__mixins_filters_CafeHasTeaFilter_js__["a" /* CafeHasTeaFilter */], __WEBPACK_IMPORTED_MODULE_9__mixins_filters_CafeSubscriptionFilter_js__["a" /* CafeSubscriptionFilter */], __WEBPACK_IMPORTED_MODULE_10__mixins_filters_CafeInCityFilter_js__["a" /* CafeInCityFilter */]],
    props: {
        'latitude': {
            type: Number,
            default: function _default() {
                return 39.918058;
            }
        },
        'longitude': {
            type: Number,
            default: function _default() {
                return 116.397026;
            }
        },
        'zoom': {
            type: Number,
            default: function _default() {
                return 5;
            }
        }
    },
    data: function data() {
        return {
            markers: [],
            infoWindows: []
        };
    },
    mounted: function mounted() {
        this.markers = [];
        this.map = new AMap.Map('cafe-map', {
            center: [this.longitude, this.latitude],
            zoom: this.zoom
        });
        this.clearMarkers();
        this.buildMarkers();

        // 监听位置选择事件
        __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$on('location-selected', function (cafe) {
            var latLng = new AMap.LngLat(cafe.lng, cafe.lat);
            this.map.setZoom(17);
            this.map.panTo(latLng);
        }.bind(this));

        // 监听城市选择事件
        __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$on('city-selected', function (city) {
            var latLng = new AMap.LngLat(city.lng, city.lat);
            this.map.setZoom(11);
            this.map.panTo(latLng);
        }.bind(this));
    },

    computed: {
        cafes: function cafes() {
            return this.$store.getters.getCafes;
        },
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
        },
        previousLat: function previousLat() {
            return this.$store.getters.getLat;
        },
        previousLng: function previousLng() {
            return this.$store.getters.getLng;
        },
        previousZoom: function previousZoom() {
            return this.$store.getters.getZoomLevel;
        }
    },
    methods: {
        // 为所有咖啡店创建点标记
        buildMarkers: function buildMarkers() {
            // 初始化点标记数组
            this.markers = [];

            // 自定义点标记
            /*var image = ROAST_CONFIG.APP_URL + '/storage/img/coffee-marker.png';
            var icon = new AMap.Icon({
                image: image,  // Icon的图像
                imageSize: new AMap.Size(19, 33)
            });*/

            // 遍历所有咖啡店创建点标记
            // var infoWindow = new AMap.InfoWindow();
            for (var i = 0; i < this.cafes.length; i++) {

                if (this.cafes[i].company.roaster === 1) {
                    var image = __WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].APP_URL + '/storage/img/roaster-marker.svg';
                } else {
                    var image = __WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].APP_URL + '/storage/img/cafe-marker.svg';
                }
                var icon = new AMap.Icon({
                    image: image, // Icon的图像
                    imageSize: new AMap.Size(19, 33)
                });

                // 为每个咖啡店创建点标记并设置经纬度
                var marker = new AMap.Marker({
                    position: new AMap.LngLat(parseFloat(this.cafes[i].longitude), parseFloat(this.cafes[i].latitude)),
                    title: this.cafes[i].location_name,
                    icon: icon,
                    extData: {
                        'cafe': this.cafes[i]
                    }
                });

                // 自定义信息窗体
                /*var contentString = '<div class="cafe-info-window">' +
                    '<div class="cafe-name">' + this.cafes[i].name + this.cafes[i].location_name + '</div>' +
                    '<div class="cafe-address">' +
                    '<span class="street">' + this.cafes[i].address + '</span>' +
                    '<span class="city">' + this.cafes[i].city + '</span> ' +
                    '<span class="state">' + this.cafes[i].state + '</span>' +
                    '<span class="zip">' + this.cafes[i].zip + '</span>' +
                    '<a href="/#/cafes/' + this.cafes[i].id + '">Visit</a>' +
                    '</div>' +
                    '</div>';
                marker.content = contentString;*/
                marker.cafeId = this.cafes[i].id;

                // 绑定点击事件到点标记对象，点击跳转到咖啡店详情页
                marker.on('click', mapClick);

                // 将点标记放到数组中
                this.markers.push(marker);
            }

            var store = this.$store;
            var router = this.$router;

            function mapClick(mapEvent) {
                // infoWindow.setContent(mapEvent.target.content);
                // infoWindow.open(this.getMap(), this.getPosition());
                var center = mapEvent.target.getMap().getCenter();
                store.dispatch('applyZoomLevel', mapEvent.target.getMap().getZoom());
                store.dispatch('applyLat', center.getLat());
                store.dispatch('applyLng', center.getLng());
                router.push({ name: 'cafe', params: { id: mapEvent.target.cafeId } });
            }

            // 将所有点标记显示到地图上
            this.map.add(this.markers);
        },

        // 从地图上清理点标记
        clearMarkers: function clearMarkers() {
            // 遍历所有点标记并将其设置为 null 从而从地图上将其清除
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
        },
        processFilters: function processFilters(filters) {
            for (var i = 0; i < this.markers.length; i++) {
                if (this.textSearch === '' && this.activeLocationFilter === 'all' && this.brewMethodsFilter.length === 0 && !this.onlyLiked && !this.hasMatcha && !this.hasTea && !this.hasSubscription && this.cityFilter === '') {
                    this.markers[i].setMap(this.map);
                } else {
                    // 初始化过滤器标识
                    var textPassed = false;
                    var brewMethodsPassed = false;
                    var typePassed = false;
                    var likedPassed = false;
                    var matchaPassed = false;
                    var teaPassed = false;
                    var subscriptionPassed = false;
                    var cityPassed = false;

                    if (this.processCafeTypeFilter(this.markers[i].getExtData().cafe, this.activeLocationFilter)) {
                        typePassed = true;
                    }

                    if (this.textSearch !== '' && this.processCafeTextFilter(this.markers[i].getExtData().cafe, this.textSearch)) {
                        textPassed = true;
                    } else if (this.textSearch === '') {
                        textPassed = true;
                    }

                    if (this.brewMethodsFilter.length !== 0 && this.processCafeBrewMethodsFilter(this.markers[i].getExtData().cafe, this.brewMethodsFilter)) {
                        brewMethodsPassed = true;
                    } else if (this.brewMethodsFilter.length === 0) {
                        brewMethodsPassed = true;
                    }

                    if (this.onlyLiked && this.processCafeUserLikeFilter(this.markers[i].getExtData().cafe)) {
                        likedPassed = true;
                    } else if (!this.onlyLiked) {
                        likedPassed = true;
                    }

                    if (this.hasMatcha && this.processCafeHasMatchaFilter(this.markers[i].getExtData().cafe)) {
                        matchaPassed = true;
                    } else if (!this.hasMatcha) {
                        matchaPassed = true;
                    }

                    if (this.hasTea && this.processCafeHasTeaFilter(this.markers[i].getExtData().cafe)) {
                        teaPassed = true;
                    } else if (!this.hasTea) {
                        teaPassed = true;
                    }

                    if (this.hasSubscription && this.processCafeSubscriptionFilter(this.markers[i].getExtData().cafe)) {
                        subscriptionPassed = true;
                    } else if (!this.hasSubscription) {
                        subscriptionPassed = true;
                    }

                    if (this.cityFilter !== '' && this.processCafeInCityFilter(this.markers[i].getExtData().cafe, this.cityFilter)) {
                        cityPassed = true;
                    } else if (this.cityFilter === '') {
                        cityPassed = true;
                    }

                    if (typePassed && textPassed && brewMethodsPassed && likedPassed && matchaPassed && teaPassed && subscriptionPassed && cityPassed) {
                        this.markers[i].setMap(this.map);
                    } else {
                        this.markers[i].setMap(null);
                    }
                }
            }
        }
    },
    watch: {
        // 一旦 cafes 有更新立即重构地图点标记
        cafes: function cafes() {
            this.clearMarkers();
            this.buildMarkers();
            this.processFilters();
        },

        // 如果路由从咖啡店详情页切换到咖啡店列表，检查之前的经纬度是否设置，
        // 如果设置的话将其作为新绘制地图的定位点
        '$route': function $route(to, from) {
            if (to.name === 'cafes' && from.name === 'cafe') {
                if (this.previousLat !== 0.0 && this.previousLng !== 0.0 && this.previousZoom !== '') {
                    var latLng = new AMap.LngLat(this.previousLng, this.previousLat);
                    this.map.setZoom(this.previousZoom);
                    this.map.panTo(latLng);
                }
            }
        },
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
    }
});

/***/ }),

/***/ 142:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CafeTagsFilter; });
var CafeTagsFilter = {
    methods: {
        processCafeTagsFilter: function processCafeTagsFilter(cafe, tags) {
            // 如果标签不为空则进行处理
            if (tags.length > 0) {
                var cafeTags = [];

                // 将咖啡店所有标签推送到 cafeTags 数组中
                for (var i = 0; i < cafe.tags.length; i++) {
                    cafeTags.push(cafe.tags[i].tag);
                }

                // 遍历所有待处理标签，如果标签在 cafeTags 数组中返回 true
                for (var i = 0; i < tags.length; i++) {
                    if (cafeTags.indexOf(tags[i]) > -1) {
                        return true;
                    }
                }

                // 如果所有待处理标签都不在 cafeTags 数组中则返回 false
                return false;
            } else {
                return true;
            }
        }
    }
};

/***/ }),

/***/ 143:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { attrs: { id: "cafe-map-container" } }, [
      _c("div", { attrs: { id: "cafe-map" } })
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5423b48b", module.exports)
  }
}

/***/ }),

/***/ 180:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(181);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("1c247ec3", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-9b6cc588\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./AddCafeButton.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-9b6cc588\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./AddCafeButton.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 181:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#add-cafe-button {\n  background-color: #FFBE54;\n  width: 56px;\n  height: 56px;\n  border-radius: 50px;\n  -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  text-align: center;\n  z-index: 9;\n  cursor: pointer;\n  position: absolute;\n  right: 60px;\n  bottom: 30px;\n  color: white;\n  line-height: 50px;\n  font-size: 40px;\n}\n", ""]);

// exports


/***/ }),

/***/ 182:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_bus_js__ = __webpack_require__(106);
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({

    computed: {
        user: function user() {
            return this.$store.getters.getUser;
        },
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        }
    },

    methods: {
        // 如果用户已经登录，跳转到新增咖啡店页面，否则弹出登录框
        checkAuth: function checkAuth() {
            if (this.user == '' && this.userLoadStatus === 2) {
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('prompt-login');
            } else {
                this.$router.push({ name: 'newcafe' });
            }
        }
    }
});

/***/ }),

/***/ 183:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      attrs: { id: "add-cafe-button" },
      on: {
        click: function($event) {
          _vm.checkAuth()
        }
      }
    },
    [_vm._v("\n    +\n")]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-9b6cc588", module.exports)
  }
}

/***/ }),

/***/ 188:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(189);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("0eba4914", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-787bcc7f\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeList.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-787bcc7f\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeList.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 189:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#cafe-list-container {\n  position: absolute;\n  top: 75px;\n  left: 0px;\n  right: 0px;\n  bottom: 0px;\n  background-color: white;\n  overflow-y: scroll;\n}\ndiv#cafe-list-container div.cafe-grid-container {\n    max-width: 900px;\n    margin: auto;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv.cafe-grid-container {\n    height: inherit;\n}\n}\n", ""]);

// exports


/***/ }),

/***/ 190:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeCard_vue__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeCard_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeCard_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_cafes_ListFilters_vue__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_cafes_ListFilters_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_cafes_ListFilters_vue__);
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
    data: function data() {
        return {
            shownCount: 1
        };
    },


    components: {
        CafeCard: __WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeCard_vue___default.a,
        ListFilters: __WEBPACK_IMPORTED_MODULE_1__components_cafes_ListFilters_vue___default.a
    },

    computed: {
        cafes: function cafes() {
            return this.$store.getters.getCafes;
        },
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
        }
    }
});

/***/ }),

/***/ 191:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "cafe-list-container" } }, [
    _c(
      "div",
      { staticClass: "grid-x grid-padding-x cafe-grid-container" },
      [_c("list-filters")],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        staticClass: "grid-x grid-padding-x cafe-grid-container",
        attrs: { id: "cafe-grid" }
      },
      [
        _vm._l(_vm.cafes, function(cafe) {
          return _c("cafe-card", { key: cafe.id, attrs: { cafe: cafe } })
        }),
        _vm._v(" "),
        _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
          _vm.shownCount === 0
            ? _c("span", { staticClass: "no-results" }, [_vm._v("No Results")])
            : _vm._e()
        ])
      ],
      2
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-787bcc7f", module.exports)
  }
}

/***/ }),

/***/ 196:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(197);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("561234c2", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-c6613ed6\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./MapLegend.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-c6613ed6\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./MapLegend.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 197:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#map-legend {\n  position: absolute;\n  z-index: 9;\n  left: 15px;\n  bottom: 90px;\n  -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);\n  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);\n  border-radius: 5px;\n  background-color: white;\n  padding: 10px;\n  max-width: 200px;\n  font-family: \"Lato\", sans-serif;\n}\ndiv#map-legend span.legend-title {\n    display: block;\n    text-align: center;\n    font-family: \"Lato\", sans-serif;\n    margin-bottom: 10px;\n    font-size: 18px;\n    font-weight: bold;\n}\ndiv#map-legend div.legend-row {\n    margin-bottom: 5px;\n}\ndiv#map-legend div.legend-row img {\n      margin-right: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 198:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
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
    data: function data() {
        return {};
    },


    computed: {
        showFilters: function showFilters() {
            return this.$store.getters.getShowFilters;
        },
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
        }
    }
});

/***/ }),

/***/ 199:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: !_vm.showFilters && _vm.cafesView === "map",
          expression: "( !showFilters && cafesView === 'map' )"
        }
      ],
      attrs: { id: "map-legend" }
    },
    [_vm._m(0)]
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "grid-x" }, [
      _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
        _c("span", { staticClass: "legend-title" }, [_vm._v("图例")])
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "large-12 medium-12 small-12 cell legend-row" },
        [
          _c("img", { attrs: { src: "/storage/img/roaster-marker.svg" } }),
          _vm._v(" 烘焙店\n        ")
        ]
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "large-12 medium-12 small-12 cell legend-row" },
        [
          _c("img", { attrs: { src: "/storage/img/cafe-marker.svg" } }),
          _vm._v(" 咖啡店\n        ")
        ]
      )
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-c6613ed6", module.exports)
  }
}

/***/ }),

/***/ 200:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(201);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("bd7303c8", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-74c18b53\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ToggleCafesView.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-74c18b53\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ToggleCafesView.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 201:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#toggle-cafes-view {\n  position: absolute;\n  z-index: 9;\n  right: 15px;\n  top: 90px;\n  -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);\n  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);\n  border-radius: 5px;\n}\ndiv#toggle-cafes-view span.toggle-button {\n    cursor: pointer;\n    display: inline-block;\n    padding: 5px 20px;\n    background-color: white;\n    font-family: \"Lato\", sans-serif;\n    text-align: center;\n}\ndiv#toggle-cafes-view span.toggle-button.map-view {\n      border-top-left-radius: 5px;\n      border-bottom-left-radius: 5px;\n}\ndiv#toggle-cafes-view span.toggle-button.map-view.active {\n        color: white;\n        background-color: #FFBE54;\n}\ndiv#toggle-cafes-view span.toggle-button.list-view {\n      border-top-right-radius: 5px;\n      border-bottom-right-radius: 5px;\n}\ndiv#toggle-cafes-view span.toggle-button.list-view.active {\n        color: white;\n        background-color: #FFBE54;\n}\n", ""]);

// exports


/***/ }),

/***/ 202:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
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

    computed: {
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
        }
    },

    methods: {
        displayView: function displayView(type) {
            this.$store.dispatch('changeCafesView', type);
        }
    }
});

/***/ }),

/***/ 203:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.$route.name === "cafes" || _vm.$route.name === "city",
          expression: "$route.name === 'cafes' || $route.name === 'city'"
        }
      ],
      attrs: { id: "toggle-cafes-view" }
    },
    [
      _c(
        "span",
        {
          staticClass: "map-view toggle-button",
          class: { active: _vm.cafesView === "map" },
          on: {
            click: function($event) {
              _vm.displayView("map")
            }
          }
        },
        [_vm._v("地图")]
      ),
      _vm._v(" "),
      _c(
        "span",
        {
          staticClass: "list-view toggle-button",
          class: { active: _vm.cafesView == "list" },
          on: {
            click: function($event) {
              _vm.displayView("list")
            }
          }
        },
        [_vm._v("列表")]
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-74c18b53", module.exports)
  }
}

/***/ }),

/***/ 264:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(265);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("07ea2db9", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-b3c5cf30\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Home.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-b3c5cf30\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Home.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 265:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),

/***/ 266:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeMap_vue__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeMap_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeMap_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_cafes_CafeList_vue__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_cafes_CafeList_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_cafes_CafeList_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_cafes_AddCafeButton_vue__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_cafes_AddCafeButton_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_cafes_AddCafeButton_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_cafes_ToggleCafesView_vue__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_cafes_ToggleCafesView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_cafes_ToggleCafesView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_cafes_MapLegend_vue__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_cafes_MapLegend_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_cafes_MapLegend_vue__);
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
    components: {
        CafeMap: __WEBPACK_IMPORTED_MODULE_0__components_cafes_CafeMap_vue___default.a,
        CafeList: __WEBPACK_IMPORTED_MODULE_1__components_cafes_CafeList_vue___default.a,
        AddCafeButton: __WEBPACK_IMPORTED_MODULE_2__components_cafes_AddCafeButton_vue___default.a,
        ToggleCafesView: __WEBPACK_IMPORTED_MODULE_3__components_cafes_ToggleCafesView_vue___default.a,
        MapLegend: __WEBPACK_IMPORTED_MODULE_4__components_cafes_MapLegend_vue___default.a
    },

    computed: {
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
        }
    }
});

/***/ }),

/***/ 267:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "page", attrs: { id: "cafes" } },
    [
      _c("cafe-map", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.cafesView === "map",
            expression: "cafesView === 'map'"
          }
        ]
      }),
      _vm._v(" "),
      _c("cafe-list", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.cafesView === "list",
            expression: "cafesView === 'list'"
          }
        ]
      }),
      _vm._v(" "),
      _c("add-cafe-button"),
      _vm._v(" "),
      _c("toggle-cafes-view"),
      _vm._v(" "),
      _c("map-legend"),
      _vm._v(" "),
      _c("router-view")
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
    require("vue-hot-reload-api")      .rerender("data-v-b3c5cf30", module.exports)
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


/***/ }),

/***/ 61:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(135)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(137)
/* template */
var __vue_template__ = __webpack_require__(138)
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
Component.options.__file = "resources/js/components/cafes/ListFilters.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-61843689", Component.options)
  } else {
    hotAPI.reload("data-v-61843689", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 62:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(139)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(141)
/* template */
var __vue_template__ = __webpack_require__(143)
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
Component.options.__file = "resources/js/components/cafes/CafeMap.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5423b48b", Component.options)
  } else {
    hotAPI.reload("data-v-5423b48b", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 72:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(180)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(182)
/* template */
var __vue_template__ = __webpack_require__(183)
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
Component.options.__file = "resources/js/components/cafes/AddCafeButton.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-9b6cc588", Component.options)
  } else {
    hotAPI.reload("data-v-9b6cc588", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(188)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(190)
/* template */
var __vue_template__ = __webpack_require__(191)
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
Component.options.__file = "resources/js/components/cafes/CafeList.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-787bcc7f", Component.options)
  } else {
    hotAPI.reload("data-v-787bcc7f", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 76:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(196)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(198)
/* template */
var __vue_template__ = __webpack_require__(199)
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
Component.options.__file = "resources/js/components/cafes/MapLegend.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c6613ed6", Component.options)
  } else {
    hotAPI.reload("data-v-c6613ed6", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 77:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(200)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(202)
/* template */
var __vue_template__ = __webpack_require__(203)
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
Component.options.__file = "resources/js/components/cafes/ToggleCafesView.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-74c18b53", Component.options)
  } else {
    hotAPI.reload("data-v-74c18b53", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 90:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(264)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(266)
/* template */
var __vue_template__ = __webpack_require__(267)
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
Component.options.__file = "resources/js/pages/Home.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b3c5cf30", Component.options)
  } else {
    hotAPI.reload("data-v-b3c5cf30", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});