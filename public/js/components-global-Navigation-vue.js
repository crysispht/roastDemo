webpackJsonp([28],{

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

/***/ 216:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(217);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("cefa7456", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-9652e536\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Navigation.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-9652e536\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Navigation.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 217:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\nnav.top-navigation {\n  background-color: #FFFFFF;\n  height: 75px;\n  -webkit-box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.1);\n          box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.1);\n  z-index: 9999;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n}\nnav.top-navigation a.filters {\n    cursor: pointer;\n    color: #FFBE54;\n    width: 140px;\n    height: 45px;\n    border: 2px solid #FFBE54;\n    border-radius: 3px;\n    text-transform: uppercase;\n    display: block;\n    float: left;\n    text-align: center;\n    line-height: 41px;\n    margin-top: 15px;\n    margin-left: 20px;\n    font-family: \"Lato\", sans-serif;\n    font-weight: bold;\n    font-size: 16px;\n}\nnav.top-navigation a.filters img {\n      display: inline-block;\n      vertical-align: middle;\n      margin-right: 10px;\n      height: 13px;\n}\nnav.top-navigation a.filters img.list {\n        -webkit-transform: rotate(-90deg);\n                transform: rotate(-90deg);\n}\nnav.top-navigation a.filters img.chevron-active {\n      display: none;\n}\nnav.top-navigation a.filters.active {\n      background-color: #FFBE54;\n      color: white;\n}\nnav.top-navigation a.filters.active img.chevron {\n        display: none;\n}\nnav.top-navigation a.filters.active img.chevron-active {\n        display: inline-block;\n}\nnav.top-navigation a.filters.active img.chevron-active.list {\n          -webkit-transform: rotate(-90deg);\n                  transform: rotate(-90deg);\n}\nnav.top-navigation a.filters span.filter-count-active {\n      display: inline-block;\n      margin-left: 5px;\n}\nnav.top-navigation span.clear-filters {\n    font-size: 16px;\n    color: #054E7A;\n    font-family: \"Lato\", sans-serif;\n    cursor: pointer;\n    margin-left: 15px;\n    display: block;\n    float: left;\n    margin-top: 25px;\n}\nnav.top-navigation span.clear-filters img {\n      margin-right: 10px;\n      float: left;\n      margin-top: 6px;\n}\nnav.top-navigation img.logo {\n    margin: auto;\n    margin-top: 22.5px;\n    margin-bottom: 22.5px;\n    display: block;\n}\nnav.top-navigation img.hamburger {\n    float: right;\n    margin-right: 18px;\n    margin-top: 30px;\n    cursor: pointer;\n}\nnav.top-navigation img.avatar {\n    float: right;\n    margin-right: 20px;\n    width: 40px;\n    height: 40px;\n    border-radius: 20px;\n    margin-top: 18px;\n}\nnav.top-navigation:after {\n    content: \"\";\n    display: table;\n    clear: both;\n}\nnav.top-navigation span.login {\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n    text-transform: uppercase;\n    color: black;\n    font-weight: bold;\n    float: right;\n    margin-top: 27px;\n    margin-right: 15px;\n    cursor: pointer;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\nnav.top-navigation a.filters {\n    line-height: 31px;\n    margin-top: 20px;\n    width: 75px;\n    height: 35px;\n}\nnav.top-navigation a.filters img {\n      display: none;\n}\nnav.top-navigation a.filters.active img.chevron-active {\n      display: none;\n}\nnav.top-navigation span.clear-filters {\n    display: none;\n}\nnav.top-navigation span.login {\n    display: none;\n}\nnav.top-navigation img.hamburger {\n    margin-top: 26px;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 218:
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




/* harmony default export */ __webpack_exports__["default"] = ({
    // 定义组件的计算属性
    computed: {
        // 从 Vuex 中获取用户加载状态
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        },


        // 从 Vuex 中获取用户信息
        user: function user() {
            return this.$store.getters.getUser;
        },
        showFilters: function showFilters() {
            return this.$store.getters.getShowFilters;
        },
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
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
        brewMethods: function brewMethods() {
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
        activeFilterCount: function activeFilterCount() {
            var activeCount = 0;
            if (this.textSearch !== '') {
                activeCount++;
            }
            if (this.activeLocationFilter !== 'all') {
                activeCount++;
            }
            if (this.onlyLiked) {
                activeCount++;
            }
            if (this.brewMethods.length !== 0) {
                activeCount++;
            }
            if (this.hasMatcha) {
                activeCount++;
            }
            if (this.hasTea) {
                activeCount++;
            }
            if (this.hasSubscription) {
                activeCount++;
            }
            if (this.cityFilter !== '') {
                activeCount++;
            }
            return activeCount;
        }
    },

    methods: {
        login: function login() {
            __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('prompt-login');
        },
        logout: function logout() {
            this.$store.dispatch('logoutUser');
            window.location = '/logout';
        },
        toggleShowFilters: function toggleShowFilters() {
            this.$store.dispatch('toggleShowFilters', { showFilters: !this.showFilters });
        },
        setShowPopOut: function setShowPopOut() {
            this.$store.dispatch('toggleShowPopOut', { showPopOut: true });
        },
        clearFilters: function clearFilters() {
            __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('clear-filters');
        }
    }
});

/***/ }),

/***/ 219:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("nav", { staticClass: "top-navigation" }, [
    _c("div", { staticClass: "grid-x" }, [
      _c("div", { staticClass: "large-4 medium-4 small-4 cell" }, [
        _c(
          "a",
          {
            staticClass: "filters",
            class: { active: _vm.showFilters },
            on: {
              click: function($event) {
                _vm.toggleShowFilters()
              }
            }
          },
          [
            _c("img", {
              staticClass: "chevron",
              class: { list: _vm.cafesView === "list" },
              attrs: { src: "/storage/img/chevron-right.svg" }
            }),
            _vm._v(" "),
            _c("img", {
              staticClass: "chevron-active",
              class: { list: _vm.cafesView === "list" },
              attrs: { src: "/storage/img/chevron-right-active.svg" }
            }),
            _vm._v(" 过滤器\n                "),
            _c(
              "span",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.activeFilterCount > 0,
                    expression: "activeFilterCount > 0"
                  }
                ],
                staticClass: "filter-count-active"
              },
              [_vm._v("(" + _vm._s(_vm.activeFilterCount) + ")")]
            )
          ]
        ),
        _vm._v(" "),
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
            _vm._v(" 清除过滤器\n            ")
          ]
        )
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "large-4 medium-4 small-4 cell" },
        [
          _c("router-link", { attrs: { to: { name: "cafes" } } }, [
            _c("img", {
              staticClass: "logo",
              attrs: { src: "/storage/img/logo.svg" }
            })
          ])
        ],
        1
      ),
      _vm._v(" "),
      _c("div", { staticClass: "large-4 medium-4 small-4 cell" }, [
        _c("img", {
          staticClass: "hamburger",
          attrs: { src: "/storage/img/hamburger.svg" },
          on: {
            click: function($event) {
              _vm.setShowPopOut()
            }
          }
        }),
        _vm._v(" "),
        _vm.user != "" && _vm.userLoadStatus === 2
          ? _c("img", {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.userLoadStatus === 2,
                  expression: "userLoadStatus === 2"
                }
              ],
              staticClass: "avatar",
              attrs: { src: _vm.user.avatar }
            })
          : _vm._e(),
        _vm._v(" "),
        _vm.user == ""
          ? _c(
              "span",
              {
                staticClass: "login",
                on: {
                  click: function($event) {
                    _vm.login()
                  }
                }
              },
              [_vm._v("登录")]
            )
          : _vm._e()
      ])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-9652e536", module.exports)
  }
}

/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(216)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(218)
/* template */
var __vue_template__ = __webpack_require__(219)
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
Component.options.__file = "resources/js/components/global/Navigation.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-9652e536", Component.options)
  } else {
    hotAPI.reload("data-v-9652e536", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});