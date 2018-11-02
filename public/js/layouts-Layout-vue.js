webpackJsonp([2,26,27,28,29,30,31],{

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

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(145);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("75237530", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-b96ff15c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ErrorNotification.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-b96ff15c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ErrorNotification.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 145:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.error-notification-container {\n  position: fixed;\n  z-index: 999999;\n  left: 0;\n  right: 0;\n  top: 0;\n}\ndiv.error-notification-container div.error-notification {\n    background: #FFFFFF;\n    -webkit-box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12), 0 4px 4px 0 rgba(0, 0, 0, 0.24);\n            box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12), 0 4px 4px 0 rgba(0, 0, 0, 0.24);\n    border-left: 5px solid #FF0000;\n    height: 50px;\n    line-height: 50px;\n    margin: auto;\n    width: 400px;\n    margin-top: 150px;\n    color: #242E38;\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n}\ndiv.error-notification-container div.error-notification img {\n      margin-right: 20px;\n      margin-left: 20px;\n      height: 20px;\n}\n", ""]);

// exports


/***/ }),

/***/ 146:
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



/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            errorMessage: '',
            show: false
        };
    },
    mounted: function mounted() {
        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('show-error', function (data) {
            this.errorMessage = data.notification;
            this.show = true;

            setTimeout(function () {
                this.show = false;
            }.bind(this), 3000);
        }.bind(this));
    }
});

/***/ }),

/***/ 147:
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
            value: _vm.show,
            expression: "show"
          }
        ],
        staticClass: "error-notification-container"
      },
      [
        _c("div", { staticClass: "error-notification" }, [
          _c("img", { attrs: { src: "/storage/img/error.svg" } }),
          _vm._v(" " + _vm._s(_vm.errorMessage) + "\n        ")
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
    require("vue-hot-reload-api")      .rerender("data-v-b96ff15c", module.exports)
  }
}

/***/ }),

/***/ 148:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(149);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("55d1d6a6", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-39c7228e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./PopOut.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-39c7228e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./PopOut.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 149:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.pop-out {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  background-color: rgba(55, 44, 12, 0.29);\n  z-index: 9999;\n}\ndiv.pop-out div.pop-out-side-bar {\n    position: fixed;\n    right: 0;\n    bottom: 0;\n    top: 0;\n    width: 250px;\n    background-color: white;\n    -webkit-box-shadow: -2px 0 4px 0 rgba(3, 27, 78, 0.1);\n            box-shadow: -2px 0 4px 0 rgba(3, 27, 78, 0.1);\n    padding: 30px;\n}\ndiv.pop-out div.pop-out-side-bar div.side-bar-link {\n      border-bottom: 1px solid #BABABA;\n      font-size: 16px;\n      font-weight: bold;\n      font-family: \"Lato\", sans-serif;\n      text-transform: uppercase;\n      padding-top: 25px;\n      padding-bottom: 25px;\n}\ndiv.pop-out div.pop-out-side-bar div.side-bar-link a {\n        color: black;\n}\ndiv.pop-out div.pop-out-side-bar img.close-menu-icon {\n      float: right;\n      cursor: pointer;\n}\ndiv.pop-out div.pop-out-side-bar div.ssu-container {\n      position: absolute;\n      bottom: 30px;\n}\ndiv.pop-out div.pop-out-side-bar div.ssu-container span.ssu-built-on {\n        color: black;\n        font-size: 14px;\n        font-family: \"Lato\", sans-serif;\n        display: block;\n        margin-bottom: 10px;\n}\ndiv.pop-out div.pop-out-side-bar div.ssu-container img {\n        margin: auto;\n        max-width: 190px;\n}\n", ""]);

// exports


/***/ }),

/***/ 150:
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



/* harmony default export */ __webpack_exports__["default"] = ({

    computed: {
        showPopOut: function showPopOut() {
            return this.$store.getters.getShowPopOut;
        },
        showRightNav: function showRightNav() {
            return this.showPopOut;
        },
        user: function user() {
            return this.$store.getters.getUser;
        },
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        }
    },

    methods: {
        hideNav: function hideNav() {
            this.$store.dispatch('toggleShowPopOut', { showPopOut: false });
        },
        login: function login() {
            this.$store.dispatch('toggleShowPopOut', { showPopOut: false });
            __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('prompt-login');
        },
        logout: function logout() {
            this.$store.dispatch('logoutUser');
            window.location = '/logout';
        }
    }
});

/***/ }),

/***/ 151:
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
          value: _vm.showPopOut,
          expression: "showPopOut"
        }
      ],
      staticClass: "pop-out",
      on: {
        click: function($event) {
          _vm.hideNav()
        }
      }
    },
    [
      _c("transition", { attrs: { name: "slide-in-right" } }, [
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.showRightNav,
                expression: "showRightNav"
              }
            ],
            staticClass: "pop-out-side-bar",
            on: {
              click: function($event) {
                $event.stopPropagation()
              }
            }
          },
          [
            _c("img", {
              staticClass: "close-menu-icon",
              attrs: { src: "/storage/img/close-menu.svg" },
              on: {
                click: function($event) {
                  _vm.hideNav()
                }
              }
            }),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "side-bar-link" },
              [
                _c(
                  "router-link",
                  {
                    attrs: { to: { name: "cafes" } },
                    nativeOn: {
                      click: function($event) {
                        _vm.hideNav()
                      }
                    }
                  },
                  [_vm._v("\n                    咖啡店\n                ")]
                )
              ],
              1
            ),
            _vm._v(" "),
            _vm.user != "" && _vm.userLoadStatus === 2
              ? _c(
                  "div",
                  { staticClass: "side-bar-link" },
                  [
                    _c(
                      "router-link",
                      {
                        attrs: { to: { name: "newcafe" } },
                        nativeOn: {
                          click: function($event) {
                            _vm.hideNav()
                          }
                        }
                      },
                      [
                        _vm._v(
                          "\n                    新增咖啡店\n                "
                        )
                      ]
                    )
                  ],
                  1
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.user != "" && _vm.userLoadStatus === 2
              ? _c(
                  "div",
                  { staticClass: "side-bar-link" },
                  [
                    _c(
                      "router-link",
                      {
                        attrs: { to: { name: "profile" } },
                        nativeOn: {
                          click: function($event) {
                            _vm.hideNav()
                          }
                        }
                      },
                      [
                        _vm._v(
                          "\n                    个人信息\n                "
                        )
                      ]
                    )
                  ],
                  1
                )
              : _vm._e(),
            _vm._v(" "),
            _vm.user != "" &&
            _vm.userLoadStatus === 2 &&
            _vm.user.permission >= 1
              ? _c(
                  "div",
                  { staticClass: "side-bar-link" },
                  [
                    _c(
                      "router-link",
                      {
                        attrs: { to: { name: "admin" } },
                        nativeOn: {
                          click: function($event) {
                            _vm.hideNav()
                          }
                        }
                      },
                      [_vm._v("\n                    后台\n                ")]
                    )
                  ],
                  1
                )
              : _vm._e(),
            _vm._v(" "),
            _c("div", { staticClass: "side-bar-link" }, [
              _vm.user != "" && _vm.userLoadStatus === 2
                ? _c(
                    "a",
                    {
                      directives: [
                        {
                          name: "show",
                          rawName: "v-show",
                          value: _vm.userLoadStatus === 2,
                          expression: "userLoadStatus === 2"
                        }
                      ],
                      on: {
                        click: function($event) {
                          _vm.logout()
                        }
                      }
                    },
                    [_vm._v("退出")]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.user == ""
                ? _c(
                    "a",
                    {
                      on: {
                        click: function($event) {
                          _vm.login()
                        }
                      }
                    },
                    [_vm._v("登录")]
                  )
                : _vm._e()
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "side-bar-link" }, [
              _c(
                "a",
                {
                  attrs: {
                    href: "https://github.com/nonfu/roastapp/issues/new/choose",
                    target: "_blank"
                  }
                },
                [_vm._v("\n                    提交bug\n                ")]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "side-bar-link" }, [
              _c(
                "a",
                {
                  attrs: {
                    href:
                      "https://laravelacademy.org/api-driven-development-laravel-vue",
                    target: "_blank"
                  }
                },
                [_vm._v("\n                    项目文档\n                ")]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "side-bar-link" }, [
              _c(
                "a",
                {
                  attrs: {
                    href: "https://github.com/nonfu/roastapp",
                    target: "_blank"
                  }
                },
                [
                  _vm._v(
                    "\n                    在Github上查看\n                "
                  )
                ]
              )
            ])
          ]
        )
      ])
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
    require("vue-hot-reload-api")      .rerender("data-v-39c7228e", module.exports)
  }
}

/***/ }),

/***/ 152:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(153);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("501784c6", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7f4af18d\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./SuccessNotification.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7f4af18d\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./SuccessNotification.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 153:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.success-notification-container {\n  position: fixed;\n  z-index: 999999;\n  left: 0;\n  right: 0;\n  top: 0;\n}\ndiv.success-notification-container div.success-notification {\n    background: #FFFFFF;\n    -webkit-box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12), 0 4px 4px 0 rgba(0, 0, 0, 0.24);\n            box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12), 0 4px 4px 0 rgba(0, 0, 0, 0.24);\n    border-left: 5px solid #00C853;\n    height: 50px;\n    line-height: 50px;\n    margin: auto;\n    width: 400px;\n    margin-top: 150px;\n    color: #242E38;\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n}\ndiv.success-notification-container div.success-notification img {\n      margin-right: 20px;\n      margin-left: 20px;\n}\n", ""]);

// exports


/***/ }),

/***/ 154:
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




/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            successMessage: '',
            show: false
        };
    },
    mounted: function mounted() {
        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('show-success', function (data) {
            this.successMessage = data.notification;
            this.show = true;

            setTimeout(function () {
                this.show = false;
            }.bind(this), 3000);
        }.bind(this));
    }
});

/***/ }),

/***/ 155:
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
            value: _vm.show,
            expression: "show"
          }
        ],
        staticClass: "success-notification-container"
      },
      [
        _c("div", { staticClass: "success-notification" }, [
          _c("img", { attrs: { src: "/storage/img/success.svg" } }),
          _vm._v(" " + _vm._s(_vm.successMessage) + "\n        ")
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
    require("vue-hot-reload-api")      .rerender("data-v-7f4af18d", module.exports)
  }
}

/***/ }),

/***/ 208:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(209);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("7c81a764", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4e64ee0c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Filters.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4e64ee0c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Filters.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 209:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.filters-container {\n  background-color: white;\n  position: fixed;\n  left: 0;\n  bottom: 0;\n  top: 75px;\n  max-width: 550px;\n  width: 100%;\n  padding-top: 50px;\n  -webkit-box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.1);\n          box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.1);\n  z-index: 99;\n}\ndiv.filters-container span.clear-filters {\n    font-size: 16px;\n    color: #054E7A;\n    font-family: \"Lato\", sans-serif;\n    cursor: pointer;\n    display: block;\n    float: left;\n    margin-bottom: 20px;\n}\ndiv.filters-container span.clear-filters img {\n      margin-right: 10px;\n      float: left;\n      margin-top: 6px;\n}\ndiv.filters-container span.filters-header {\n    display: block;\n    font-family: \"Lato\", sans-serif;\n    font-weight: bold;\n    margin-bottom: 10px;\n}\ndiv.filters-container input[type=\"text\"].search {\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    border-radius: 3px;\n    color: #BABABA;\n    font-size: 16px;\n    font-family: \"Lato\", sans-serif;\n    background-image: url(\"/storage/img/search-icon.svg\");\n    background-repeat: no-repeat;\n    background-position: 6px;\n    padding-left: 35px;\n    padding-top: 5px;\n    padding-bottom: 5px;\n}\ndiv.filters-container label.filter-label {\n    font-family: \"Lato\", sans-serif;\n    text-transform: uppercase;\n    font-weight: bold;\n    color: black;\n    margin-top: 20px;\n    margin-bottom: 10px;\n}\ndiv.filters-container div.location-filter {\n    text-align: center;\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n    color: #FFBE54;\n    border-bottom: 1px solid #FFBE54;\n    border-top: 1px solid #FFBE54;\n    border-left: 1px solid #FFBE54;\n    border-right: 1px solid #FFBE54;\n    width: 33%;\n    display: inline-block;\n    height: 55px;\n    line-height: 55px;\n    cursor: pointer;\n    margin-bottom: 5px;\n}\ndiv.filters-container div.location-filter.active {\n      color: white;\n      background-color: #FFBE54;\n}\ndiv.filters-container div.location-filter.all-locations {\n      border-top-left-radius: 3px;\n      border-bottom-left-radius: 3px;\n}\ndiv.filters-container div.location-filter.roasters {\n      border-top-right-radius: 3px;\n      border-bottom-right-radius: 3px;\n}\ndiv.filters-container div.location-filter.cafes {\n      border-top-right-radius: 3px;\n      border-bottom-right-radius: 3px;\n}\ndiv.filters-container span.liked-location-label {\n    color: #666666;\n    font-size: 16px;\n    font-family: \"Lato\", sans-serif;\n    margin-left: 10px;\n}\ndiv.filters-container div.close-filters {\n    height: 90px;\n    width: 23px;\n    position: absolute;\n    right: -20px;\n    background-color: white;\n    border-top-right-radius: 3px;\n    border-bottom-right-radius: 3px;\n    line-height: 90px;\n    top: 50%;\n    cursor: pointer;\n    margin-top: -82px;\n    text-align: center;\n}\ndiv.filters-container div.close-filters .arrow-left {\n      -webkit-transition: all 1s;\n      transition: all 1s;\n      -webkit-transform: rotate(180deg);\n              transform: rotate(180deg);\n}\ndiv.filters-container div.close-filters .arrow-right {\n      -webkit-transition: all 1s;\n      transition: all 1s;\n      -webkit-transform: rotate(0deg);\n              transform: rotate(0deg);\n}\ndiv.filters-container span.no-results {\n    display: block;\n    text-align: center;\n    margin-top: 50px;\n    color: #666666;\n    text-transform: uppercase;\n    font-weight: 600;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv.filters-container {\n    padding-top: 25px;\n    overflow-y: auto;\n}\ndiv.filters-container span.clear-filters {\n      display: block;\n}\ndiv.filters-container div.close-filters {\n      display: none;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 210:
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



/* harmony default export */ __webpack_exports__["default"] = ({
    mounted: function mounted() {
        // 显示过滤器
        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('show-filters', function () {
            this.show = true;
        }.bind(this));
        // 清除过滤器
        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('clear-filters', function () {
            this.clearFilters();
        }.bind(this));
    },

    watch: {
        'cityFilter': function cityFilter() {
            if (this.cityFilter != '') {
                var slug = '';

                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].id === this.cityFilter) {
                        slug = this.cities[i].slug;
                    }
                }

                if (slug == '') {
                    this.$router.push({ name: 'cafes' });
                } else {
                    this.$router.push({ name: 'city', params: { slug: slug } });
                }
            } else {
                this.$router.push({ name: 'cafes' });
            }
        },
        'citiesLoadStatus': function citiesLoadStatus() {
            if (this.citiesLoadStatus === 2 && this.$route.name === 'city') {
                var id = '';
                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].slug === this.$route.params.slug) {
                        this.cityFilter = this.cities[i].id;
                    }
                }
            }
        }
    },

    computed: {
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

        showFilters: function showFilters() {
            return this.$store.getters.getShowFilters;
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
        }
    },

    methods: {
        setActiveLocationFilter: function setActiveLocationFilter(filter) {
            this.$store.dispatch('updateActiveLocationFilter', filter);
        },
        toggleBrewMethodFilter: function toggleBrewMethodFilter(id) {
            var localBrewMethodsFilter = this.brewMethodsFilter;
            /*
              If the filter is in the selected filter, we remove it, otherwise
              we add it.
            */
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
        }
    }
});

/***/ }),

/***/ 211:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("transition", { attrs: { name: "slide-in-left" } }, [
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.showFilters && _vm.cafesView === "map",
            expression: "showFilters && cafesView === 'map'"
          }
        ],
        staticClass: "filters-container",
        attrs: { id: "filters-container" }
      },
      [
        _c(
          "div",
          {
            staticClass: "close-filters",
            on: {
              click: function($event) {
                _vm.toggleShowFilters()
              }
            }
          },
          [
            _c("div", { staticClass: "arrow-left" }, [
              _c("img", { attrs: { src: "/storage/img/grey-left.svg" } })
            ])
          ]
        ),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x grid-padding-x" }, [
          _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
            _c("span", { staticClass: "filters-header" }, [_vm._v("城市")]),
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
          _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
            _c("span", { staticClass: "filters-header" }, [
              _vm._v("查找你寻找的咖啡店类型")
            ])
          ])
        ]),
        _vm._v(" "),
        _c(
          "div",
          {
            staticClass: "grid-x grid-padding-x",
            attrs: { id: "text-container" }
          },
          [
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
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
                  _vm._v(" 清除过滤器\n                ")
                ]
              ),
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
                attrs: { type: "text", placeholder: "通过名称查找位置" },
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
            ])
          ]
        ),
        _vm._v(" "),
        _c("div", { attrs: { id: "location-type-container" } }, [
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
              _c("label", { staticClass: "filter-label" }, [_vm._v("位置类型")])
            ])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
              _c(
                "div",
                {
                  staticClass: "location-filter all-locations",
                  class: { active: _vm.activeLocationFilter === "all" },
                  on: {
                    click: function($event) {
                      _vm.setActiveLocationFilter("all")
                    }
                  }
                },
                [
                  _vm._v(
                    "\n                        所有位置\n                    "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "location-filter roasters",
                  class: { active: _vm.activeLocationFilter === "roasters" },
                  on: {
                    click: function($event) {
                      _vm.setActiveLocationFilter("roasters")
                    }
                  }
                },
                [
                  _vm._v(
                    "\n                        烘焙店\n                    "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "location-filter cafes",
                  class: { active: _vm.activeLocationFilter === "cafes" },
                  on: {
                    click: function($event) {
                      _vm.setActiveLocationFilter("cafes")
                    }
                  }
                },
                [
                  _vm._v(
                    "\n                        咖啡店\n                    "
                  )
                ]
              )
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
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
              _c("label", { staticClass: "filter-label" }, [
                _vm._v("是否提供订购服务")
              ])
            ])
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
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
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
            ])
          ]
        ),
        _vm._v(" "),
        _c("div", { attrs: { id: "brew-methods-container" } }, [
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
              _c("label", { staticClass: "filter-label" }, [_vm._v("冲泡方法")])
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
                          active: _vm.brewMethodsFilter.indexOf(method.id) >= 0
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
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
              _c("label", { staticClass: "filter-label" }, [_vm._v("饮料选项")])
            ])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
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
                    _c("span", { staticClass: "option-name" }, [_vm._v("抹茶")])
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
                    _c("span", { staticClass: "option-name" }, [_vm._v("茶包")])
                  ])
                ]
              )
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
    require("vue-hot-reload-api")      .rerender("data-v-4e64ee0c", module.exports)
  }
}

/***/ }),

/***/ 212:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(213);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("0a05eea8", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-79a10015\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./LoginModal.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-79a10015\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./LoginModal.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 213:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#login-modal {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background-color: rgba(0, 0, 0, 0.6);\n  z-index: 99999;\n}\ndiv#login-modal div.login-box {\n    width: 100%;\n    max-width: 530px;\n    min-width: 320px;\n    padding: 20px;\n    background-color: #fff;\n    border: 1px solid #ddd;\n    -webkit-box-shadow: 0 1px 3px rgba(50, 50, 50, 0.08);\n    box-shadow: 0 1px 3px rgba(50, 50, 50, 0.08);\n    border-radius: 4px;\n    font-size: 16px;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n}\ndiv#login-modal div.login-box a.social-link {\n      display: block;\n      margin: auto;\n      width: 230px;\n      margin-top: 10px;\n      margin-bottom: 10px;\n}\ndiv#login-modal div.login-box div.login-label {\n      color: black;\n      font-family: \"Lato\", sans-serif;\n      font-weight: bold;\n      text-transform: uppercase;\n      text-align: center;\n      margin-top: 40px;\n      margin-bottom: 20px;\n}\ndiv#login-modal div.login-box p.learn-more-description {\n      color: #666666;\n      text-align: center;\n}\ndiv#login-modal div.login-box a.learn-more-button {\n      border: 2px solid #FFBE54;\n      border-radius: 3px;\n      text-transform: uppercase;\n      font-family: \"Lato\", sans-serif;\n      color: #FFBE54;\n      width: 360px;\n      font-size: 16px;\n      text-align: center;\n      padding: 10px;\n      margin-top: 20px;\n      display: block;\n      margin: auto;\n}\ndiv#login-modal div.login-box a.learn-more-button:hover {\n        color: white;\n        background-color: #FFBE54;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv#login-modal div.login-box {\n    width: 95%;\n}\ndiv#login-modal div.login-box a.learn-more-button {\n      width: 300px;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 214:
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




/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            show: false
        };
    },
    mounted: function mounted() {
        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('prompt-login', function () {
            this.show = true;
        }.bind(this));
    }
});

/***/ }),

/***/ 215:
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
      attrs: { id: "login-modal" },
      on: {
        click: function($event) {
          _vm.show = false
        }
      }
    },
    [
      _c(
        "div",
        {
          staticClass: "login-box",
          on: {
            click: function($event) {
              $event.stopPropagation()
            }
          }
        },
        [
          _c("div", { staticClass: "login-label" }, [
            _vm._v("使用第三方服务登录")
          ]),
          _vm._v(" "),
          _c(
            "a",
            {
              attrs: { href: "/auth/github" },
              on: {
                click: function($event) {
                  $event.stopPropagation()
                }
              }
            },
            [_c("img", { attrs: { src: "/storage/img/github-login.jpg" } })]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "login-label" }, [_vm._v("关于本项目")]),
          _vm._v(" "),
          _vm._m(0),
          _vm._v(" "),
          _c(
            "a",
            {
              staticClass: "learn-more-button",
              attrs: {
                href:
                  "https://laravelacademy.org/api-driven-development-laravel-vue",
                target: "_blank"
              }
            },
            [_vm._v("关于本项目的构建教程，可以在这里看到")]
          )
        ]
      )
    ]
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("p", { staticClass: "learn-more-description" }, [
      _vm._v("Roast 项目由 "),
      _c(
        "a",
        { attrs: { href: "https://laravelacademy.org", target: "_blank" } },
        [_vm._v("Laravel\n            学院")]
      ),
      _vm._v("提供，Laravel 学院致力于提供优质 Laravel 中文学习资源。")
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-79a10015", module.exports)
  }
}

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

/***/ 244:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(245);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("2e6dc998", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-41da8f8e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Layout.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-41da8f8e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Layout.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 245:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#app-layout div.show-filters {\n  height: 90px;\n  width: 23px;\n  position: absolute;\n  left: 0px;\n  background-color: white;\n  border-top-right-radius: 3px;\n  border-bottom-right-radius: 3px;\n  line-height: 90px;\n  top: 50%;\n  cursor: pointer;\n  margin-top: -45px;\n  z-index: 9;\n  text-align: center;\n}\n", ""]);

// exports


/***/ }),

/***/ 246:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_Navigation_vue__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_Navigation_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_global_Navigation_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_global_LoginModal_vue__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_global_LoginModal_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_global_LoginModal_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_global_SuccessNotification_vue__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_global_SuccessNotification_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_global_SuccessNotification_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_global_ErrorNotification_vue__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_global_ErrorNotification_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_global_ErrorNotification_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_global_Filters_vue__ = __webpack_require__(79);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_global_Filters_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_global_Filters_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_global_PopOut_vue__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_global_PopOut_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__components_global_PopOut_vue__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
        Navigation: __WEBPACK_IMPORTED_MODULE_0__components_global_Navigation_vue___default.a,
        LoginModal: __WEBPACK_IMPORTED_MODULE_1__components_global_LoginModal_vue___default.a,
        SuccessNotification: __WEBPACK_IMPORTED_MODULE_2__components_global_SuccessNotification_vue___default.a,
        ErrorNotification: __WEBPACK_IMPORTED_MODULE_3__components_global_ErrorNotification_vue___default.a,
        Filters: __WEBPACK_IMPORTED_MODULE_4__components_global_Filters_vue___default.a,
        PopOut: __WEBPACK_IMPORTED_MODULE_5__components_global_PopOut_vue___default.a
    },
    created: function created() {
        this.$store.dispatch('loadCafes');
        this.$store.dispatch('loadUser');
        this.$store.dispatch('loadBrewMethods');
        this.$store.dispatch('loadCities');
        if (this.$store._modules.get(['admin'])) {
            this.$store.unregisterModule('admin', {});
        }
    },

    computed: {
        showFilters: function showFilters() {
            return this.$store.getters.getShowFilters;
        },
        addedCafe: function addedCafe() {
            return this.$store.getters.getAddedCafe;
        },
        addCafeStatus: function addCafeStatus() {
            return this.$store.getters.getCafeAddStatus;
        },
        cafesView: function cafesView() {
            return this.$store.getters.getCafesView;
        }
    },

    watch: {
        'addCafeStatus': function addCafeStatus() {
            if (this.addCafeStatus === 2) {
                EventBus.$emit('show-success', {
                    notification: this.addedCafe.name + ' 已经添加成功!'
                });
            }
        }
    },

    methods: {
        toggleShowFilters: function toggleShowFilters() {
            this.$store.dispatch('toggleShowFilters', { showFilters: !this.showFilters });
        }
    }
});

/***/ }),

/***/ 247:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "app-layout" } },
    [
      _c(
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
          staticClass: "show-filters",
          on: {
            click: function($event) {
              _vm.toggleShowFilters()
            }
          }
        },
        [_c("img", { attrs: { src: "/storage/img/grey-right.svg" } })]
      ),
      _vm._v(" "),
      _c("success-notification"),
      _vm._v(" "),
      _c("error-notification"),
      _vm._v(" "),
      _c("navigation"),
      _vm._v(" "),
      _c("router-view"),
      _vm._v(" "),
      _c("login-modal"),
      _vm._v(" "),
      _c("filters"),
      _vm._v(" "),
      _c("pop-out")
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
    require("vue-hot-reload-api")      .rerender("data-v-41da8f8e", module.exports)
  }
}

/***/ }),

/***/ 63:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(144)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(146)
/* template */
var __vue_template__ = __webpack_require__(147)
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
Component.options.__file = "resources/js/components/global/ErrorNotification.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b96ff15c", Component.options)
  } else {
    hotAPI.reload("data-v-b96ff15c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 64:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(148)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(150)
/* template */
var __vue_template__ = __webpack_require__(151)
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
Component.options.__file = "resources/js/components/global/PopOut.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-39c7228e", Component.options)
  } else {
    hotAPI.reload("data-v-39c7228e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 65:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(152)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(154)
/* template */
var __vue_template__ = __webpack_require__(155)
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
Component.options.__file = "resources/js/components/global/SuccessNotification.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7f4af18d", Component.options)
  } else {
    hotAPI.reload("data-v-7f4af18d", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 79:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(208)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(210)
/* template */
var __vue_template__ = __webpack_require__(211)
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
Component.options.__file = "resources/js/components/global/Filters.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4e64ee0c", Component.options)
  } else {
    hotAPI.reload("data-v-4e64ee0c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(212)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(214)
/* template */
var __vue_template__ = __webpack_require__(215)
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
Component.options.__file = "resources/js/components/global/LoginModal.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-79a10015", Component.options)
  } else {
    hotAPI.reload("data-v-79a10015", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


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


/***/ }),

/***/ 85:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(244)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(246)
/* template */
var __vue_template__ = __webpack_require__(247)
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
Component.options.__file = "resources/js/layouts/Layout.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-41da8f8e", Component.options)
  } else {
    hotAPI.reload("data-v-41da8f8e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});