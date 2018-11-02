webpackJsonp([1,26,27,31,45,46],{

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

/***/ 156:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(157);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("091a8a80", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-b828d9be\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./AdminHeader.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-b828d9be\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./AdminHeader.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\nheader {\n  background-color: #FFFFFF;\n  height: 75px;\n  z-index: 9999;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n}\nheader img.logo {\n    margin: auto;\n    margin-top: 22.5px;\n    margin-bottom: 22.5px;\n    display: block;\n}\nheader img.hamburger {\n    float: right;\n    margin-right: 18px;\n    margin-top: 30px;\n    cursor: pointer;\n}\nheader img.avatar {\n    float: right;\n    margin-right: 20px;\n    width: 40px;\n    height: 40px;\n    border-radius: 20px;\n    margin-top: 18px;\n}\nheader:after {\n    content: \"\";\n    display: table;\n    clear: both;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\nnav.top-navigation span.login {\n    display: none;\n}\nnav.top-navigation img.hamburger {\n    margin-top: 26px;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 158:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        },
        user: function user() {
            return this.$store.getters.getUser;
        }
    },

    methods: {
        setShowPopOut: function setShowPopOut() {
            this.$store.dispatch('toggleShowPopOut', { showPopOut: true });
        }
    }
});

/***/ }),

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("header", { staticClass: "admin-header" }, [
    _c("div", { staticClass: "grid-x" }, [
      _c("div", { staticClass: "large-4 medium-4 small-4 cell" }),
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
        _vm.user !== "" && _vm.userLoadStatus === 2
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
        _vm.user === ""
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
              [_vm._v("Sign In")]
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
    require("vue-hot-reload-api")      .rerender("data-v-b828d9be", module.exports)
  }
}

/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(161);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("7a21dc24", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5268a13f\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Navigation.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5268a13f\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Navigation.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 161:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\nnav.admin-navigation div.admin-link {\n  font-size: 16px;\n  font-weight: bold;\n  font-family: \"Lato\", sans-serif;\n  text-transform: uppercase;\n  padding-top: 15px;\n  padding-bottom: 15px;\n}\nnav.admin-navigation div.admin-link a {\n    color: black;\n}\nnav.admin-navigation div.admin-link a.router-link-active {\n      color: #FFBE54;\n}\n", ""]);

// exports


/***/ }),

/***/ 162:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
        user: function user() {
            return this.$store.getters.getUser;
        }
    }
});

/***/ }),

/***/ 163:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("nav", { staticClass: "admin-navigation" }, [
    _c(
      "div",
      { staticClass: "admin-link" },
      [
        _c("router-link", { attrs: { to: { name: "admin-actions" } } }, [
          _vm._v("\n            审核列表\n        ")
        ])
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "admin-link" },
      [
        _c("router-link", { attrs: { to: { name: "admin-companies" } } }, [
          _vm._v("\n            公司列表\n        ")
        ])
      ],
      1
    ),
    _vm._v(" "),
    _vm.user.permission >= 2
      ? _c(
          "div",
          { staticClass: "admin-link" },
          [
            _c("router-link", { attrs: { to: { name: "admin-users" } } }, [
              _vm._v("\n            用户列表\n        ")
            ])
          ],
          1
        )
      : _vm._e(),
    _vm._v(" "),
    _vm.user.permission === 3
      ? _c(
          "div",
          { staticClass: "admin-link" },
          [
            _c(
              "router-link",
              { attrs: { to: { name: "admin-brew-methods" } } },
              [_vm._v("\n            冲泡方法\n        ")]
            )
          ],
          1
        )
      : _vm._e(),
    _vm._v(" "),
    _vm.user.permission === 3
      ? _c(
          "div",
          { staticClass: "admin-link" },
          [
            _c("router-link", { attrs: { to: { name: "admin-cities" } } }, [
              _vm._v("\n            城市列表\n        ")
            ])
          ],
          1
        )
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5268a13f", module.exports)
  }
}

/***/ }),

/***/ 228:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(229);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("74090c6e", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-c0c833ca\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Admin.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-c0c833ca\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Admin.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 229:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#admin-layout div#page-container {\n  margin-top: 75px;\n}\n", ""]);

// exports


/***/ }),

/***/ 230:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_SuccessNotification_vue__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_SuccessNotification_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_global_SuccessNotification_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_global_ErrorNotification_vue__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_global_ErrorNotification_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_global_ErrorNotification_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_admin_AdminHeader_vue__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_admin_AdminHeader_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_admin_AdminHeader_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_admin_Navigation_vue__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_admin_Navigation_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__components_admin_Navigation_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_global_PopOut_vue__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_global_PopOut_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__components_global_PopOut_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__modules_admin_actions_js__ = __webpack_require__(231);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__modules_admin_companies_js__ = __webpack_require__(233);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__modules_admin_cafes_js__ = __webpack_require__(235);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__modules_admin_users_js__ = __webpack_require__(237);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__modules_admin_brewMethods_js__ = __webpack_require__(239);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__modules_admin_cities_js__ = __webpack_require__(241);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//








// Import admin Vuex modules







/* harmony default export */ __webpack_exports__["default"] = ({
    components: {
        SuccessNotification: __WEBPACK_IMPORTED_MODULE_0__components_global_SuccessNotification_vue___default.a,
        ErrorNotification: __WEBPACK_IMPORTED_MODULE_1__components_global_ErrorNotification_vue___default.a,
        AdminHeader: __WEBPACK_IMPORTED_MODULE_2__components_admin_AdminHeader_vue___default.a,
        Navigation: __WEBPACK_IMPORTED_MODULE_3__components_admin_Navigation_vue___default.a,
        PopOut: __WEBPACK_IMPORTED_MODULE_4__components_global_PopOut_vue___default.a
    },

    created: function created() {
        this.$store.dispatch("loadBrewMethods");

        if (!this.$store._modules.get(["admin"])) {
            this.$store.registerModule("admin", {});
        }

        if (!this.$store._modules.get(["admin", "actions"])) {
            this.$store.registerModule(["admin", "actions"], __WEBPACK_IMPORTED_MODULE_5__modules_admin_actions_js__["a" /* actions */]);
        }

        if (!this.$store._modules.get(['admin', 'companies'])) {
            this.$store.registerModule(['admin', 'companies'], __WEBPACK_IMPORTED_MODULE_6__modules_admin_companies_js__["a" /* companies */]);
        }

        if (!this.$store._modules.get(['admin', 'cafes'])) {
            this.$store.registerModule(['admin', 'cafes'], __WEBPACK_IMPORTED_MODULE_7__modules_admin_cafes_js__["a" /* cafes */]);
        }

        if (!this.$store._modules.get(['admin', 'users']) && this.user.permission >= 2) {
            this.$store.registerModule(['admin', 'users'], __WEBPACK_IMPORTED_MODULE_8__modules_admin_users_js__["a" /* users */]);
        }

        if (!this.$store._modules.get(['admin', 'brewMethods']) && this.user.permission === 3) {
            this.$store.registerModule(['admin', 'brewMethods'], __WEBPACK_IMPORTED_MODULE_9__modules_admin_brewMethods_js__["a" /* brewMethods */]);
        }

        if (!this.$store._modules.get(['admin', 'cities']) && this.user.permission === 3) {
            this.$store.registerModule(['admin', 'cities'], __WEBPACK_IMPORTED_MODULE_10__modules_admin_cities_js__["a" /* cities */]);
        }
    },


    computed: {
        user: function user() {
            return this.$store.getters.getUser;
        }
    }
});

/***/ }),

/***/ 231:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return actions; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_admin_actions_js__ = __webpack_require__(232);
/*
|-------------------------------------------------------------------------------
| VUEX modules/admin/actions.js
|-------------------------------------------------------------------------------
| The Vuex data store for the admin actions
*/


var actions = {
    /*
      Defines the state being monitored for the module.
    */
    state: {
        actions: [],
        actionsLoadStatus: 0,

        actionApproveStatus: 0,
        actionDeniedStatus: 0
    },

    actions: {
        loadAdminActions: function loadAdminActions(_ref) {
            var commit = _ref.commit;

            commit('setActionsLoadStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_actions_js__["a" /* default */].getActions().then(function (response) {
                commit('setActions', response.data);
                commit('setActionsLoadStatus', 2);
            }).catch(function () {
                commit('setActions', []);
                commit('setActionsLoadStatus', 3);
            });
        },
        approveAction: function approveAction(_ref2, data) {
            var commit = _ref2.commit,
                state = _ref2.state,
                dispatch = _ref2.dispatch;

            commit('setActionApproveStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_actions_js__["a" /* default */].putApproveAction(data.id).then(function (response) {
                commit('setActionApproveStatus', 2);
                dispatch('loadAdminActions');
            }).catch(function () {
                commit('setActionApproveStatus', 3);
            });
        },
        denyAction: function denyAction(_ref3, data) {
            var commit = _ref3.commit,
                state = _ref3.state,
                dispatch = _ref3.dispatch;

            commit('setActionDeniedStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_actions_js__["a" /* default */].putDenyAction(data.id).then(function (response) {
                commit('setActionDeniedStatus', 2);
                dispatch('loadAdminActions');
            }).catch(function () {
                commit('setActionDeniedStatus', 3);
            });
        }
    },

    mutations: {
        setActionsLoadStatus: function setActionsLoadStatus(state, status) {
            state.actionsLoadStatus = status;
        },
        setActions: function setActions(state, actions) {
            state.actions = actions;
        },
        setActionApproveStatus: function setActionApproveStatus(state, status) {
            state.actionApproveStatus = status;
        },
        setActionDeniedStatus: function setActionDeniedStatus(state, status) {
            state.actionDeniedStatus = status;
        }
    },

    getters: {
        getActions: function getActions(state) {
            return state.actions;
        },
        getActionsLoadStatus: function getActionsLoadStatus(state) {
            return state.actionsLoadStatus;
        },
        getActionApproveStatus: function getActionApproveStatus(state) {
            return state.actionApproveStatus;
        },
        getActionDeniedStatus: function getActionDeniedStatus(state) {
            return state.actionDeniedStatus;
        }
    }
};

/***/ }),

/***/ 232:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/*
  Imports the Roast API URL from the config.
*/


/* harmony default export */ __webpack_exports__["a"] = ({
  /*
    GET   /api/v1/admin/actions
  */
  getActions: function getActions() {
    return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/actions');
  },

  /*
    PUT   /api/v1/admin/actions/{action}/approve
  */
  putApproveAction: function putApproveAction(id) {
    return axios.put(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/actions/' + id + '/approve');
  },

  /*
    PUT   /api/v1/admin/actions/{action}/deny
  */
  putDenyAction: function putDenyAction(id) {
    return axios.put(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/actions/' + id + '/deny');
  }
});

/***/ }),

/***/ 233:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return companies; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_admin_companies_js__ = __webpack_require__(234);
/*
|-------------------------------------------------------------------------------
| VUEX modules/admin/companies.js
|-------------------------------------------------------------------------------
| The Vuex data store for the admin companies
*/


var companies = {
    state: {
        companies: [],
        companiesLoadStatus: 0,

        company: {},
        companyLoadStatus: 0,

        companyEditStatus: 0
    },

    actions: {
        loadAdminCompanies: function loadAdminCompanies(_ref) {
            var commit = _ref.commit;

            commit('setCompaniesLoadStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_companies_js__["a" /* default */].getCompanies().then(function (response) {
                commit('setCompanies', response.data);
                commit('setCompaniesLoadStatus', 2);
            }).catch(function () {
                commit('setCompanies', []);
                commit('setCompaniesLoadStatus', 3);
            });
        },
        loadAdminCompany: function loadAdminCompany(_ref2, data) {
            var commit = _ref2.commit;

            commit('setCompanyLoadStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_companies_js__["a" /* default */].getCompany(data.id).then(function (response) {
                commit('setCompany', response.data);
                commit('setCompanyLoadStatus', 2);
            }).catch(function () {
                commit('setCompany', {});
                commit('setCompanyLoadStatus', 3);
            });
        },
        updateAdminCompany: function updateAdminCompany(_ref3, data) {
            var commit = _ref3.commit;

            commit('setCompanyEditStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_companies_js__["a" /* default */].putUpdateCompany(data.id, data.name, data.type, data.website, data.instagram_url, data.facebook_url, data.twitter_url, data.subscription, data.owners, data.deleted).then(function (response) {
                commit('setCompany', response.data);
                commit('setCompanyEditStatus', 2);
            }).catch(function () {
                commit('setCompanyEditStatus', 3);
            });
        }
    },

    mutations: {
        setCompaniesLoadStatus: function setCompaniesLoadStatus(state, status) {
            state.companiesLoadStatus = status;
        },
        setCompanies: function setCompanies(state, companies) {
            state.companies = companies;
        },
        setCompanyLoadStatus: function setCompanyLoadStatus(state, status) {
            state.companyLoadStatus = status;
        },
        setCompany: function setCompany(state, company) {
            state.company = company;
        },
        setCompanyEditStatus: function setCompanyEditStatus(state, status) {
            state.companyEditStatus = status;
        }
    },

    getters: {
        getCompanies: function getCompanies(state) {
            return state.companies;
        },
        getCompaniesLoadStatus: function getCompaniesLoadStatus(state) {
            return state.companiesLoadStatus;
        },
        getCompany: function getCompany(state) {
            return state.company;
        },
        getCompanyLoadStatus: function getCompanyLoadStatus(state) {
            return state.companyLoadStatus;
        },
        getCompanyEditStatus: function getCompanyEditStatus(state) {
            return state.companyEditStatus;
        }
    }
};

/***/ }),

/***/ 234:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/*
  Imports the Roast API URL from the config.
*/


/* harmony default export */ __webpack_exports__["a"] = ({
    /*
      GET   /api/v1/admin/companies/{id}
    */
    getCompany: function getCompany(id) {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/companies/' + id);
    },

    /*
      GET   /api/v1/admin/companies
    */
    getCompanies: function getCompanies() {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/companies');
    },

    /*
      PUT   /api/v1/admin/companies/{id}
    */
    putUpdateCompany: function putUpdateCompany(id, name, type, website, instagramURL, facebookURL, twitterURL, subscription, owners, deleted) {
        return axios.put(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/companies/' + id, {
            name: name,
            type: type,
            website: website,
            instagram_url: instagramURL,
            facebook_url: facebookURL,
            twitter_url: twitterURL,
            subscription: subscription,
            owners: owners,
            deleted: deleted
        });
    }
});

/***/ }),

/***/ 235:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return cafes; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_admin_cafes_js__ = __webpack_require__(236);
/*
|-------------------------------------------------------------------------------
| VUEX modules/admin/cafes.js
|-------------------------------------------------------------------------------
| The Vuex data store for the admin companies
*/


var cafes = {
    /*
      Defines the state monitored for the module.
    */
    state: {
        cafe: {},
        cafeLoadStatus: 0,

        cafeEditStatus: 0
    },

    /*
      Defines the actions that can mutate the state.
    */
    actions: {
        /*
          Loads the cafe from the admin side
        */
        loadAdminCafe: function loadAdminCafe(_ref, data) {
            var commit = _ref.commit;

            commit('setAdminCafeLoadStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_cafes_js__["a" /* default */].getCafe(data.company_id, data.cafe_id).then(function (response) {
                /*
                  Commits a successful response with the cafe.
                */
                commit('setAdminCafe', response.data);
                commit('setAdminCafeLoadStatus', 2);
            }).catch(function () {
                /*
                  Commit a failed response and clear the data.
                */
                commit('setAdminCafe', {});
                commit('setAdminCafeLoadStatus', 3);
            });
        },

        /*
          Updates an admin cafe
        */
        updateAdminCafe: function updateAdminCafe(_ref2, data) {
            var commit = _ref2.commit;

            commit('setAdminCafeEditStatus', 1);

            /*
              Calls the API to update an admin cafe.
            */
            __WEBPACK_IMPORTED_MODULE_0__api_admin_cafes_js__["a" /* default */].putUpdateCafe(data.company_id, data.id, data.city_id, data.location_name, data.address, data.city, data.state, data.zip, data.tea, data.matcha, data.brew_methods, data.deleted).then(function (response) {
                commit('setAdminCafe', response.data);
                commit('setAdminCafeEditStatus', 2);
            }).catch(function () {
                commit('setAdminCafeEditStatus', 3);
            });
        }
    },

    /*
      Defines the mutations used by the Vuex module.
    */
    mutations: {
        /*
          Sets the cafe load status.
        */
        setAdminCafeLoadStatus: function setAdminCafeLoadStatus(state, status) {
            state.cafeLoadStatus = status;
        },

        /*
          Sets the cafe.
        */
        setAdminCafe: function setAdminCafe(state, cafe) {
            state.cafe = cafe;
        },

        /*
          Sets the cafe edit status
        */
        setAdminCafeEditStatus: function setAdminCafeEditStatus(state, status) {
            state.cafeEditStatus = status;
        }
    },

    /*
      Defines the getters used by the Vuex module.
    */
    getters: {
        /*
          Returns the cafe load status.
        */
        getAdminCafeLoadStatus: function getAdminCafeLoadStatus(state) {
            return state.cafeLoadStatus;
        },

        /*
          Returns the cafe
        */
        getAdminCafe: function getAdminCafe(state) {
            return state.cafe;
        },

        /*
          Returns the edit status.
        */
        getAdminCafeEditStatus: function getAdminCafeEditStatus(state) {
            return state.cafeEditStatus;
        }
    }
};

/***/ }),

/***/ 236:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/*
  Imports the Roast API URL from the config.
*/


/* harmony default export */ __webpack_exports__["a"] = ({
    /*
      GET   /api/v1/admin/companies/{companyID}/cafes/{cafeID}
    */
    getCafe: function getCafe(companyID, cafeID) {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/companies/' + companyID + '/cafes/' + cafeID);
    },

    /*
        PUT 	/api/v1/admin/companies/{companyID/cafes/{cafeID}
      */
    putUpdateCafe: function putUpdateCafe(companyID, cafeID, cityID, locationName, address, city, state, zip, tea, matcha, brewMethods, deleted) {
        /*
            Initialize the form data
        */
        var formData = new FormData();

        /*
            Add the form data we need to submit
        */
        formData.append('company_id', companyID);
        formData.append('city_id', cityID);
        formData.append('location_name', locationName);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('zip', zip);
        formData.append('brew_methods', JSON.stringify(brewMethods));
        formData.append('matcha', matcha);
        formData.append('tea', tea);
        formData.append('deleted', deleted);
        formData.append('_method', 'PUT');

        return axios.post(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/companies/' + companyID + '/cafes/' + cafeID, formData);
    }
});

/***/ }),

/***/ 237:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return users; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_admin_users_js__ = __webpack_require__(238);
/*
|-------------------------------------------------------------------------------
| VUEX modules/admin/users.js
|-------------------------------------------------------------------------------
| The Vuex data store for the admin users
*/


var users = {
  /*
    Defines the state monitored for the module.
  */
  state: {
    users: [],
    usersLoadStatus: 0,

    user: {},
    userLoadStatus: 0,

    userUpdateStatus: 0
  },

  /*
    Define the actions that can mutate the state.
  */
  actions: {
    /*
      Loads the users.
    */
    loadAdminUsers: function loadAdminUsers(_ref) {
      var commit = _ref.commit;

      commit('setAdminUsersLoadStatus', 1);

      /*
        Calls the API to load the admin users.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_users_js__["a" /* default */].getUsers().then(function (response) {
        /*
          Commit a successful response with the users.
        */
        commit('setAdminUsers', response.data);
        commit('setAdminUsersLoadStatus', 2);
      }).catch(function () {
        /*
          Commit a failed response and clear the data.
        */
        commit('setAdminUsers', []);
        commit('setAdminUsersLoadStatus', 3);
      });
    },

    /*
      Loads a user.
    */
    loadAdminUser: function loadAdminUser(_ref2, data) {
      var commit = _ref2.commit;

      commit('setAdminUserLoadStatus', 1);

      /*
        Calls the API to load the admin user.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_users_js__["a" /* default */].getUser(data.id).then(function (response) {
        /*
          Commits a successful response with the user.
        */
        commit('setAdminUser', response.data);
        commit('setAdminUserLoadStatus', 2);
      }).catch(function () {
        /*
          Commit a failed response and clear the data.
        */
        commit('setAdminUser', {});
        commit('setAdminUserLoadStatus', 3);
      });
    },

    /*
      Updates a user.
    */
    updateAdminUser: function updateAdminUser(_ref3, data) {
      var commit = _ref3.commit;

      commit('setAdminUserUpdateStatus', 1);

      /*
        Calls the API to update the admin user.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_users_js__["a" /* default */].putUpdateUser(data.id, data.permission, data.companies).then(function (response) {
        commit('setAdminUser', response.data);
        commit('setAdminUserUpdateStatus', 2);
      }).catch(function () {
        /*
          Commit a failed response.
        */
        commit('setAdminUserUpdateStatus', 3);
      });
    }
  },

  /*
    Defines the mutations used by the Vuex module.
  */
  mutations: {
    /*
      Sets the users load status.
    */
    setAdminUsersLoadStatus: function setAdminUsersLoadStatus(state, status) {
      state.usersLoadStatus = status;
    },

    /*
      Sets the users
    */
    setAdminUsers: function setAdminUsers(state, users) {
      state.users = users;
    },

    /*
      Sets the user load status.
    */
    setAdminUserLoadStatus: function setAdminUserLoadStatus(state, status) {
      state.userLoadStatus = status;
    },

    /*
      Sets the user.
    */
    setAdminUser: function setAdminUser(state, user) {
      state.user = user;
    },

    /*
      Sets the admin user update status.
    */
    setAdminUserUpdateStatus: function setAdminUserUpdateStatus(state, status) {
      state.userUpdateStatus = status;
    }
  },

  /*
    Defines the getters used by the Vuex module.
  */
  getters: {
    /*
      Returns the users.
    */
    getAdminUsers: function getAdminUsers(state) {
      return state.users;
    },

    /*
      Return the users load status.
    */
    getAdminUsersLoadStatus: function getAdminUsersLoadStatus(state) {
      return state.usersLoadStatus;
    },

    /*
      Return the user.
    */
    getAdminUser: function getAdminUser(state) {
      return state.user;
    },

    /*
      Return the user load status.
    */
    getAdminUserLoadStatus: function getAdminUserLoadStatus(state) {
      return state.userLoadStatus;
    },

    /*
      Return the user update status.
    */
    getAdminUserUpdateStatus: function getAdminUserUpdateStatus(state) {
      return state.userUpdateStatus;
    }
  }
};

/***/ }),

/***/ 238:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/*
  Imports the Roast API URL from the config.
*/


/* harmony default export */ __webpack_exports__["a"] = ({
    /*
      GET   /api/v1/admin/users
    */
    getUsers: function getUsers() {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/users');
    },

    /*
      GET   /api/v1/admin/users/{id}
    */
    getUser: function getUser(id) {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/users/' + id);
    },

    /*
      PUT   /api/v1/admin/users/{id}
    */
    putUpdateUser: function putUpdateUser(id, permission, companies) {
        return axios.put(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/users/' + id, {
            permission: permission,
            companies: companies
        });
    }
});

/***/ }),

/***/ 239:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return brewMethods; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_admin_brewMethods_js__ = __webpack_require__(240);
/*
|-------------------------------------------------------------------------------
| VUEX modules/admin/brewMethods.js
|-------------------------------------------------------------------------------
| The Vuex data store for the admin brew methods
*/


var brewMethods = {
  /*
    Defines the state monitored for the module.
  */
  state: {
    brewMethods: [],
    brewMethodsLoadStatus: 0,

    brewMethod: {},
    brewMethodLoadStatus: 0,

    brewMethodAddStatus: 0,
    brewMethodUpdateStatus: 0
  },

  /*
    Defines the actions that can mutate the state.
  */
  actions: {
    /*
      Loads the brew methods.
    */
    loadAdminBrewMethods: function loadAdminBrewMethods(_ref) {
      var commit = _ref.commit;

      commit('setAdminBrewMethodsLoadStatus', 1);

      /*
        Calls the API to load the admin brew methods.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_brewMethods_js__["a" /* default */].getBrewMethods().then(function (response) {
        /*
          Commit a successful response with the brew methods.
        */
        commit('setAdminBrewMethods', response.data);
        commit('setAdminBrewMethodsLoadStatus', 2);
      }).catch(function () {
        /*
          Commit a failed response and clear the data.
        */
        commit('setAdminBrewMethods', []);
        commit('setAdminBrewMethodsLoadStatus', 3);
      });
    },

    /*
      Loads a brew method.
    */
    loadAdminBrewMethod: function loadAdminBrewMethod(_ref2, data) {
      var commit = _ref2.commit;

      commit('setAdminBrewMethodLoadStatus', 1);

      /*
        Calls the API to load the brew method.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_brewMethods_js__["a" /* default */].getBrewMethod(data.id).then(function (response) {
        /*
          Commits a successful response with the brew method.
        */
        commit('setAdminBrewMethod', response.data);
        commit('setAdminBrewMethodLoadStatus', 2);
      }).catch(function () {
        /*
          Commits a failed response and clear the data.
        */
        commit('setAdminBrewMethod', {});
        commit('setAdminBrewMethodLoadStatus', 3);
      });
    },

    /*
      Updates a brew method.
    */
    updateAdminBrewMethod: function updateAdminBrewMethod(_ref3, data) {
      var commit = _ref3.commit;

      commit('setAdminBrewMethodUpdateStatus', 1);

      /*
        Calls the API to update a brew method.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_brewMethods_js__["a" /* default */].putUpdateBrewMethod(data.id, data.method, data.icon).then(function (response) {
        /*
          Commits a successful response.
        */
        commit('setAdminBrewMethod', response.data);
        commit('setAdminBrewMethodUpdateStatus', 2);
      }).catch(function () {
        /*
          Commits a failed response.
        */
        commit('setAdminBrewMethod', {});
        commit('setAdminBrewMethodUpdateStatus', 3);
      });
    },

    /*
      Adds a brew method.
    */
    addAdminBrewMethod: function addAdminBrewMethod(_ref4, data) {
      var commit = _ref4.commit,
          state = _ref4.state,
          dispatch = _ref4.dispatch;

      commit('setAdminBrewMethodAddedStatus', 1);

      /*
        Calls the API to add a brew method.
      */
      __WEBPACK_IMPORTED_MODULE_0__api_admin_brewMethods_js__["a" /* default */].postAddBrewMethod(data.method, data.icon).then(function (response) {
        commit('setAdminBrewMethodAddedStatus', 2);
        dispatch('loadAdminBrewMethods');
      }).catch(function () {
        commit('setAdminBrewMethodAddedStatus', 3);
      });
    }
  },

  /*
    Defines the mutations used by the Vuex module.
  */
  mutations: {
    /*
      Sets the admin brew methods load status.
    */
    setAdminBrewMethodsLoadStatus: function setAdminBrewMethodsLoadStatus(state, status) {
      state.brewMethodsLoadStatus = status;
    },

    /*
      Sets the admin brew methods.
    */
    setAdminBrewMethods: function setAdminBrewMethods(state, methods) {
      state.brewMethods = methods;
    },

    /*
      Set the brew method load status.
    */
    setAdminBrewMethodLoadStatus: function setAdminBrewMethodLoadStatus(state, status) {
      state.brewMethodLoadStatus = status;
    },

    /*
      Sets the admin brew method.
    */
    setAdminBrewMethod: function setAdminBrewMethod(state, method) {
      state.brewMethod = method;
    },

    /*
      Sets the admin brew method update status.
    */
    setAdminBrewMethodUpdateStatus: function setAdminBrewMethodUpdateStatus(state, status) {
      state.brewMethodUpdateStatus = status;
    },

    /*
      Sets the admin brew method add status.
    */
    setAdminBrewMethodAddedStatus: function setAdminBrewMethodAddedStatus(state, status) {
      state.brewMethodAddStatus = status;
    }
  },

  /*
    Defines the getters used by the Vuex module.
  */
  getters: {
    /*
      Gets the admin brew method load status
    */
    getAdminBrewMethodLoadStatus: function getAdminBrewMethodLoadStatus(state) {
      return state.brewMethodLoadStatus;
    },

    /*
      Gets the admin brew method load status
    */
    getAdminBrewMethodsLoadStatus: function getAdminBrewMethodsLoadStatus(state) {
      return state.brewMethodsLoadStatus;
    },

    /*
      Gets the admin brew methods
    */
    getAdminBrewMethods: function getAdminBrewMethods(state) {
      return state.brewMethods;
    },

    /*
      Gets the admin brew method.
    */
    getAdminBrewMethod: function getAdminBrewMethod(state) {
      return state.brewMethod;
    },

    /*
      Gets the admin brew method update status.
    */
    getAdminBrewMethodUpdateStatus: function getAdminBrewMethodUpdateStatus(state) {
      return state.brewMethodUpdateStatus;
    },

    /*
      Gets the admin brew method added status.
    */
    getAdminBrewMethodAddedStatus: function getAdminBrewMethodAddedStatus(state) {
      return state.brewMethodAddStatus;
    }
  }
};

/***/ }),

/***/ 240:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/*
  Imports the Roast API URL from the config.
*/


/* harmony default export */ __webpack_exports__["a"] = ({
    /*
      GET   /api/v1/admin/brew-methods
    */
    getBrewMethods: function getBrewMethods() {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/brew-methods');
    },

    /*
      GET   /api/v1/admin/brew-methods/{method}
    */
    getBrewMethod: function getBrewMethod(id) {
        return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/brew-methods/' + id);
    },

    /*
      POST  /api/v1/admin/brew-methods
    */
    postAddBrewMethod: function postAddBrewMethod(method, icon) {
        return axios.post(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/brew-methods', {
            method: method,
            icon: icon
        });
    },

    /*
      PUT   /api/v1/admin/brew-methods/{method}
    */
    putUpdateBrewMethod: function putUpdateBrewMethod(id, method, icon) {
        return axios.put(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/brew-methods/' + id, {
            method: method,
            icon: icon
        });
    }
});

/***/ }),

/***/ 241:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return cities; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_admin_cities_js__ = __webpack_require__(242);
/*
|-------------------------------------------------------------------------------
| VUEX modules/admin/cities.js
|-------------------------------------------------------------------------------
| The Vuex data store for the admin cities
*/


var cities = {
    /*
      Defines the state monitored for the module.
    */
    state: {
        cities: [],
        citiesLoadStatus: 0,

        city: {},
        cityLoadStatus: 0,

        cityEditStatus: 0,
        cityAddStatus: 0,
        cityDeleteStatus: 0
    },

    /*
      Defines the actions that can mutate the state.
    */
    actions: {
        /*
          Loads all of the cities.
        */
        loadAdminCities: function loadAdminCities(_ref) {
            var commit = _ref.commit;

            commit('setAdminCitiesLoadStatus', 1);

            /*
              Call the admin cities API route.
            */
            __WEBPACK_IMPORTED_MODULE_0__api_admin_cities_js__["a" /* default */].getCities().then(function (response) {
                /*
                  Commits a successful response with the cities.
                */
                commit('setAdminCities', response.data);
                commit('setAdminCitiesLoadStatus', 2);
            }).catch(function () {
                /*
                  Commits a failed response and clear the data.
                */
                commit('setAdminCities', []);
                commit('setAdminCitiesLoadStatus', 3);
            });
        },

        /*
          Load an individual city.
        */
        loadAdminCity: function loadAdminCity(_ref2, data) {
            var commit = _ref2.commit;

            commit('setAdminCityLoadStatus', 1);

            /*
              Calls the API to load an individual city.
            */
            __WEBPACK_IMPORTED_MODULE_0__api_admin_cities_js__["a" /* default */].getCity(data.id).then(function (response) {
                commit('setAdminCity', response.data);
                commit('setAdminCityLoadStatus', 2);
            }).catch(function () {
                commit('setAdminCity', {});
                commit('setAdminCityLoadStatus', 3);
            });
        },

        /*
          Submits a request to add a city.
        */
        addAdminCity: function addAdminCity(_ref3, data) {
            var commit = _ref3.commit,
                state = _ref3.state,
                dispatch = _ref3.dispatch;

            commit('setAdminCityAddStatus', 1);

            /*
              Calls the API to add a city.
            */
            __WEBPACK_IMPORTED_MODULE_0__api_admin_cities_js__["a" /* default */].postAddCity(data.name, data.state, data.country, data.latitude, data.longitude).then(function (response) {
                commit('setAdminCityAddStatus', 2);

                dispatch('loadAdminCities');
            }).catch(function (response) {
                commit('setAdminCityAddStatus', 3);
            });
        },

        /*
          Update an individual admin city.
        */
        updateAdminCity: function updateAdminCity(_ref4, data) {
            var commit = _ref4.commit,
                state = _ref4.state,
                dispatch = _ref4.dispatch;

            commit('setAdminCityEditStatus', 1);

            /*
              Calls the API to update an individual city.
            */
            __WEBPACK_IMPORTED_MODULE_0__api_admin_cities_js__["a" /* default */].putUpdateCity(data.id, data.name, data.state, data.country, data.latitude, data.longitude).then(function (response) {
                commit('setAdminCityEditStatus', 2);
            }).catch(function (response) {
                commit('setAdminCityEditStatus', 3);
            });
        },

        /*
          Deletes a city.
        */
        deleteAdminCity: function deleteAdminCity(_ref5, data) {
            var commit = _ref5.commit,
                state = _ref5.state,
                dispatch = _ref5.dispatch;

            commit('setAdminCityDeleteStatus', 1);

            __WEBPACK_IMPORTED_MODULE_0__api_admin_cities_js__["a" /* default */].deleteCity(data.id).then(function (response) {
                commit('setAdminCityDeleteStatus', 2);
            }).catch(function (response) {
                commit('setAdminCityDeleteStatus', 3);
            });
        }
    },

    /*
      Defines the mutations used by the Vuex module.
    */
    mutations: {
        /*
          Set the admin cities load status.
        */
        setAdminCitiesLoadStatus: function setAdminCitiesLoadStatus(state, status) {
            state.citiesLoadStatus = status;
        },

        /*
          Sets the admin cities.
        */
        setAdminCities: function setAdminCities(state, cities) {
            state.cities = cities;
        },

        /*
          Set the admin city load status.
        */
        setAdminCityLoadStatus: function setAdminCityLoadStatus(state, status) {
            state.cityLoadStatus = status;
        },

        /*
          Sets the admin city.
        */
        setAdminCity: function setAdminCity(state, city) {
            state.city = city;
        },

        /*
          Sets the admin city add status.
        */
        setAdminCityAddStatus: function setAdminCityAddStatus(state, status) {
            state.cityAddStatus = status;
        },

        /*
          Sets the admin city edit status.
        */
        setAdminCityEditStatus: function setAdminCityEditStatus(state, status) {
            state.cityEditStatus = status;
        },

        /*
          Sets the admin city delete status.
        */
        setAdminCityDeleteStatus: function setAdminCityDeleteStatus(state, status) {
            state.cityDeleteStatus = status;
        }
    },

    /*
      Defines the getters used by the Vuex module.
    */
    getters: {
        /*
          Get all admin cities.
        */
        getAdminCities: function getAdminCities(state) {
            return state.cities;
        },

        /*
          Gets the admin cities load status.
        */
        getAdminCitiesLoadStatus: function getAdminCitiesLoadStatus(state) {
            return state.citiesLoadStatus;
        },

        /*
          Gets the admin city.
        */
        getAdminCity: function getAdminCity(state) {
            return state.city;
        },

        /*
          Gets the admin city load status.
        */
        getAdminCityLoadStatus: function getAdminCityLoadStatus(state) {
            return state.cityLoadStatus;
        },

        /*
          Gets the admin city edit status.
        */
        getAdminCityEditStatus: function getAdminCityEditStatus(state) {
            return state.cityEditStatus;
        },

        /*
          Gets the admin city add status.
        */
        getAdminCityAddStatus: function getAdminCityAddStatus(state) {
            return state.cityAddStatus;
        },

        /*
          Gets the admin city delete status.
        */
        getAdminCityDeleteStatus: function getAdminCityDeleteStatus(state) {
            return state.cityDeleteStatus;
        }
    }
};

/***/ }),

/***/ 242:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/*
  Imports the Roast API URL from the config.
*/


/* harmony default export */ __webpack_exports__["a"] = ({
  /*
    GET   /api/v1/admin/cities
  */
  getCities: function getCities() {
    return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/cities');
  },

  /*
    GET   /api/v1/admin/cities/{id}
  */
  getCity: function getCity(id) {
    return axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/cities/' + id);
  },

  /*
    POST  /api/v1/admin/cities
  */
  postAddCity: function postAddCity(name, state, country, latitude, longitude) {
    return axios.post(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/cities', {
      name: name,
      state: state,
      country: country,
      latitude: latitude,
      longitude: longitude
    });
  },

  /*
    PUT   /api/v1/admin/cities/{id}
  */
  putUpdateCity: function putUpdateCity(id, name, state, country, latitude, longitude) {
    return axios.put(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/cities/' + id, {
      name: name,
      state: state,
      country: country,
      latitude: latitude,
      longitude: longitude
    });
  },

  /*
    DELETE /api/v1/admin/cities/{id}
  */
  deleteCity: function deleteCity(id) {
    return axios.delete(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/cities/' + id);
  }
});

/***/ }),

/***/ 243:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "admin-layout" } },
    [
      _c("admin-header"),
      _vm._v(" "),
      _c("success-notification"),
      _vm._v(" "),
      _c("error-notification"),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "grid-container", attrs: { id: "page-container" } },
        [
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-3 medium-4 cell" },
              [_c("navigation")],
              1
            ),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "large-9 medium-8 cell" },
              [_c("router-view")],
              1
            )
          ])
        ]
      ),
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
    require("vue-hot-reload-api")      .rerender("data-v-c0c833ca", module.exports)
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

/***/ 66:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(156)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(158)
/* template */
var __vue_template__ = __webpack_require__(159)
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
Component.options.__file = "resources/js/components/admin/AdminHeader.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b828d9be", Component.options)
  } else {
    hotAPI.reload("data-v-b828d9be", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 67:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(160)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(162)
/* template */
var __vue_template__ = __webpack_require__(163)
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
Component.options.__file = "resources/js/components/admin/Navigation.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5268a13f", Component.options)
  } else {
    hotAPI.reload("data-v-5268a13f", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 84:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(228)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(230)
/* template */
var __vue_template__ = __webpack_require__(243)
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
Component.options.__file = "resources/js/layouts/Admin.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c0c833ca", Component.options)
  } else {
    hotAPI.reload("data-v-c0c833ca", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});