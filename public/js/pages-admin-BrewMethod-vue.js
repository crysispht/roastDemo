webpackJsonp([21],{

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

/***/ 280:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(281);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("2dc9028e", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-868b1168\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./BrewMethod.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-868b1168\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./BrewMethod.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 281:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#admin-brew-method label {\n  font-weight: bold;\n  color: black;\n  font-size: 16px;\n  margin-top: 15px;\n}\ndiv#admin-brew-method a.update-brew-method {\n  display: block;\n  width: 150px;\n  color: white;\n  background-color: #CCC;\n  text-align: center;\n  border-radius: 5px;\n  margin-top: 20px;\n  height: 45px;\n  line-height: 45px;\n  margin-bottom: 100px;\n}\ndiv#admin-brew-method img.brew-method-icon {\n  width: 50px;\n}\ndiv#admin-brew-method a.change-icon {\n  display: block;\n  margin-top: 10px;\n  color: #FFBE54;\n}\ndiv#admin-brew-method div.change-icon-modal {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background-color: rgba(0, 0, 0, 0.6);\n  z-index: 99999;\n}\ndiv#admin-brew-method div.change-icon-modal div.modal-box {\n    width: 100%;\n    max-width: 530px;\n    min-width: 320px;\n    padding: 20px;\n    background-color: #fff;\n    border: 1px solid #ddd;\n    -webkit-box-shadow: 0 1px 3px rgba(50, 50, 50, 0.08);\n    box-shadow: 0 1px 3px rgba(50, 50, 50, 0.08);\n    border-radius: 4px;\n    font-size: 16px;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n    max-height: 500px;\n    overflow-y: auto;\n}\ndiv#admin-brew-method div.change-icon-modal div.modal-box label {\n      font-weight: bold;\n}\ndiv#admin-brew-method div.change-icon-modal div.modal-box div.icon-selection-container {\n      margin-top: 10px;\n}\ndiv#admin-brew-method div.change-icon-modal div.modal-box div.new-icon-container {\n      text-align: center;\n      cursor: pointer;\n      margin-bottom: 20px;\n      border-radius: 5px;\n      padding: 5px;\n}\ndiv#admin-brew-method div.change-icon-modal div.modal-box div.new-icon-container.active {\n        background-color: #FFBE54;\n        color: white;\n}\ndiv#admin-brew-method div.change-icon-modal div.modal-box div.new-icon-container img.new-icon {\n        display: block;\n        margin: auto;\n        margin-bottom: 10px;\n        height: 30px;\n}\n", ""]);

// exports


/***/ }),

/***/ 282:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            method: '',
            icon: '',
            showChangeIcon: false,
            validations: {
                method: true
            }
        };
    },
    created: function created() {
        this.$store.dispatch('loadAdminBrewMethod', {
            id: this.$route.params.id
        });
    },


    computed: {
        brewMethod: function brewMethod() {
            return this.$store.getters.getAdminBrewMethod;
        },
        brewMethodLoadStatus: function brewMethodLoadStatus() {
            return this.$store.getters.getAdminBrewMethodLoadStatus;
        },
        brewMethodUpdateStatus: function brewMethodUpdateStatus() {
            return this.$store.getters.getAdminBrewMethodUpdateStatus;
        }
    },

    watch: {

        'brewMethodLoadStatus': function brewMethodLoadStatus() {
            if (this.brewMethodLoadStatus === 2) {
                this.syncBrewMethodToModel();
            }
        },

        'brewMethodUpdateStatus': function brewMethodUpdateStatus() {
            if (this.brewMethodUpdateStatus === 2) {
                this.syncBrewMethodToModel();
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: '冲泡方法更新成功!'
                });
            }
        }
    },

    methods: {
        syncBrewMethodToModel: function syncBrewMethodToModel() {
            this.method = this.brewMethod.method;
            this.icon = this.brewMethod.icon;
        },
        updateBrewMethod: function updateBrewMethod() {
            if (this.validateEditBrewMethod()) {
                this.$store.dispatch('updateAdminBrewMethod', {
                    id: this.brewMethod.id,
                    method: this.method,
                    icon: this.icon
                });
            }
        },
        validateEditBrewMethod: function validateEditBrewMethod() {
            var validEditBrewMethodForm = true;

            if (this.method.trim() === '') {
                validEditBrewMethodForm = false;
                this.validations.method = false;
            } else {
                this.validations.method = true;
            }
            return validEditBrewMethodForm;
        },
        promptChangeIcon: function promptChangeIcon() {
            this.showChangeIcon = true;
        },
        hideChangeIcon: function hideChangeIcon() {
            this.showChangeIcon = false;
        },
        selectIcon: function selectIcon(url) {
            this.icon = url;
            this.hideChangeIcon();
        }
    }
});

/***/ }),

/***/ 283:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "admin-brew-method" } }, [
    _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-12 medium-12 cell" }, [
          _c(
            "h3",
            { staticClass: "page-header" },
            [
              _c(
                "router-link",
                { attrs: { to: { name: "admin-brew-methods" } } },
                [_vm._v("所有冲泡方法")]
              ),
              _vm._v(
                "\n                    > " +
                  _vm._s(_vm.brewMethod.method) +
                  "\n                "
              )
            ],
            1
          )
        ])
      ])
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c("label", [_vm._v("方法名")]),
          _vm._v(" "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.method,
                expression: "method"
              }
            ],
            attrs: { type: "text" },
            domProps: { value: _vm.method },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.method = $event.target.value
              }
            }
          }),
          _vm._v(" "),
          _c(
            "span",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: !_vm.validations.method,
                  expression: "!validations.method"
                }
              ],
              staticClass: "validation"
            },
            [_vm._v("请输入冲泡方法名称")]
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c("label", [_vm._v("图标")]),
          _vm._v(" "),
          _c("img", {
            staticClass: "brew-method-icon",
            attrs: { src: _vm.icon !== "" ? _vm.icon : "" }
          }),
          _vm._v(" "),
          _c(
            "a",
            {
              staticClass: "change-icon",
              on: {
                click: function($event) {
                  _vm.promptChangeIcon()
                }
              }
            },
            [_vm._v("修改图标")]
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c(
            "a",
            {
              staticClass: "update-brew-method",
              on: {
                click: function($event) {
                  _vm.updateBrewMethod()
                }
              }
            },
            [_vm._v("更新")]
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
            value: _vm.showChangeIcon,
            expression: "showChangeIcon"
          }
        ],
        staticClass: "change-icon-modal",
        on: {
          click: function($event) {
            _vm.hideChangeIcon()
          }
        }
      },
      [
        _c(
          "div",
          {
            staticClass: "modal-box",
            on: {
              click: function($event) {
                $event.stopPropagation()
              }
            }
          },
          [
            _c("div", { staticClass: "grid-x icon-selection-container" }, [
              _vm._m(0),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/aeropress.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/aeropress.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/aeropress.svg" }
                  }),
                  _vm._v("\n                    Aeropress\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/biscuit.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/biscuit.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/biscuit.svg" }
                  }),
                  _vm._v("\n                    Biscuit\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/bottle-of-water.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/bottle-of-water.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/bottle-of-water.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Bottle of Water\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/chemex.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/chemex.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/chemex.svg" }
                  }),
                  _vm._v("\n                    Chemex\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/chocolate.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/chocolate.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/chocolate.svg" }
                  }),
                  _vm._v("\n                    Chocolate\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/cinnamon.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/cinnamon.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/cinnamon.svg" }
                  }),
                  _vm._v("\n                    Cinnamon\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/clover.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/clover.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/clover.svg" }
                  }),
                  _vm._v("\n                    Clover\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-app.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/coffee-app")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-app.svg" }
                  }),
                  _vm._v("\n                    Coffee App\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-beans.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/coffee-beans")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-beans.svg" }
                  }),
                  _vm._v("\n                    Coffee Beans\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/coffee-capsules.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-capsules"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/coffee-capsules.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Coffee Capsules\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/coffee-coctail.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-coctail.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/coffee-cocktail.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Coffee Cocktail\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-cup.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/coffee-cup.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-cup.svg" }
                  }),
                  _vm._v("\n                    Coffee Cup\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/coffee-is-love.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-is-love.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/coffee-is-love.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Coffee Is Love\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-mill.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-mill.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-mill.svg" }
                  }),
                  _vm._v("\n                    Coffee Mill\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-pack.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-pack.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-pack.svg" }
                  }),
                  _vm._v("\n                    Coffee Pack\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-pods.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-pods.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-pods.svg" }
                  }),
                  _vm._v("\n                    Coffee Pods\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-pot.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/coffee-pot.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-pot.svg" }
                  }),
                  _vm._v("\n                    Coffee Pot\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-scoop.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-scoop.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-scoop.svg" }
                  }),
                  _vm._v("\n                    Coffee Scoop\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-shake.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-shake.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-shake.svg" }
                  }),
                  _vm._v("\n                    Coffee Shake\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/coffee-shop-sign.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-shop-sign.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/coffee-shop-sign.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Coffee Shop Sign\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-shop.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-shop.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-shop.svg" }
                  }),
                  _vm._v("\n                    Coffee Shop\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-to-go.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-to-go.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-to-go.svg" }
                  }),
                  _vm._v("\n                    Coffee To Go\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffee-tree.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-tree.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffee-tree.svg" }
                  }),
                  _vm._v("\n                    Coffee Tree\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/coffee-with-cream.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-with-cream.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/coffee-with-cream.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Coffee With Cream\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/coffee-with-ice-cream.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffee-with-ice-cream.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/coffee-with-ice-cream.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Coffee With Ice Cream\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/coffeemaker.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/coffeemaker.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/coffeemaker.svg" }
                  }),
                  _vm._v("\n                    Coffee Maker\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/cold-brew.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/cold-brew.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/cold-brew.svg" }
                  }),
                  _vm._v("\n                    Cold Brew\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/croissant.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/croissant.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/croissant.svg" }
                  }),
                  _vm._v("\n                    Croissant\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/cupcake.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/cupcake.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/cupcake.svg" }
                  }),
                  _vm._v("\n                    Cupcake\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/donut.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/donut.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/donut.svg" }
                  }),
                  _vm._v("\n                    Donut\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/drip-brew.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/drip-brew.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/drip-brew.svg" }
                  }),
                  _vm._v("\n                    Drip Brew\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/drip-kettle.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/drip-kettle.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/drip-kettle.svg" }
                  }),
                  _vm._v("\n                    Drip Kettle\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/electric-kettle.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/electric-kettle.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/electric-kettle.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Electric Kettle\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/espresso-cup.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/espresso-cup.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/espresso-cup.svg" }
                  }),
                  _vm._v("\n                    Espresso Cup\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/espresso-tamper.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/espresso-tamper.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/espresso-tamper.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Espresso Tamper\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/espresso.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/espresso.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/espresso.svg" }
                  }),
                  _vm._v("\n                    Espresso\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/eva-solo.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/eva-solo.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/eva-solo.svg" }
                  }),
                  _vm._v("\n                    Eva Solo\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/fizzy-water.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/fizzy-water.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/fizzy-water.svg" }
                  }),
                  _vm._v("\n                    Fizzy Water\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/frappe.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/frappe.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/frappe.svg" }
                  }),
                  _vm._v("\n                    Frappe\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/french-press.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/french-press.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/french-press.svg" }
                  }),
                  _vm._v("\n                    French Press\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/frozen-frappe.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/frozen-frappe.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/frozen-frappe.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Frozen Frappe\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/green-tea.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/green-tea.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/green-tea.svg" }
                  }),
                  _vm._v("\n                    Green Tea\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/hario.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/hario.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/hario.svg" }
                  }),
                  _vm._v("\n                    Hario\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/hot-chocolate.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/hot-chocolate.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/hot-chocolate.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Hot Chocolate\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/i-love-coffee.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/i-love-coffee.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/i-love-coffee.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    I Love Coffee\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/iced-coffee_2.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/iced-coffee_2.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/iced-coffee_2.svg"
                    }
                  }),
                  _vm._v("\n                    Iced Coffee\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/iced-tea.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/iced-tea.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/iced-tea.svg" }
                  }),
                  _vm._v("\n                    Iced Tea\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/instant-coffee.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/instant-coffee.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/instant-coffee.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Instant Coffee\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/kalita-wave.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/kalita-wave.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/kalita-wave.svg" }
                  }),
                  _vm._v("\n                    Kalita Wave\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/kettle.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/kettle.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/kettle.svg" }
                  }),
                  _vm._v("\n                    Kettle\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/latte_2.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/latte_2.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/latte_2.svg" }
                  }),
                  _vm._v("\n                    Latte\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/latte.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/latte.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/latte.svg" }
                  }),
                  _vm._v("\n                    Latte\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/matcha-latte.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/matcha-latte.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/matcha-latte.svg" }
                  }),
                  _vm._v("\n                    Matcha Latte\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/milk-pitcher.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/milk-pitcher.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/milk-pitcher.svg" }
                  }),
                  _vm._v("\n                    Milk Pitcher\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/milk-product.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/milk-product.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/milk-product.svg" }
                  }),
                  _vm._v("\n                    Milk Product\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/moka-pot.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/moka-pot.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/moka-pot.svg" }
                  }),
                  _vm._v("\n                    Moka Pot\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/nitrous.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/nitrous.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/nitrous.svg" }
                  }),
                  _vm._v("\n                    Nitrous\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/percolator.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/percolator.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/percolator.svg" }
                  }),
                  _vm._v("\n                    Percolator\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/porcelain-teapot.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/porcelain-teapot.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/porcelain-teapot.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Porcelain Teapot\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/portafilter.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/portafilter.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/portafilter.svg" }
                  }),
                  _vm._v("\n                    Portafilter\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/sack-of-coffee-beans.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/sack-of-coffee-beans.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/sack-of-coffee-beans.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Sack of Coffee Beans\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/sugar-and-milk.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/sugar-and-milk.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/sugar-and-milk.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Sugar and Milk\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/sugar.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/sugar.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/sugar.svg" }
                  }),
                  _vm._v("\n                    Sugar\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/syphon.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/syphon.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/syphon.svg" }
                  }),
                  _vm._v("\n                    Syphon\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/take-away.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/take-away.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/take-away.svg" }
                  }),
                  _vm._v("\n                    Take Away\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/tea-bag-cup.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/tea-bag-cup.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/tea-bag-cup.svg" }
                  }),
                  _vm._v("\n                    Tea Bag Cup\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/tea-bag.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/tea-bag.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/tea-bag.svg" }
                  }),
                  _vm._v("\n                    Tea Bag\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/tea-ceremony.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/tea-ceremony.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/tea-ceremony.svg" }
                  }),
                  _vm._v("\n                    Tea Ceremony\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/turkish-gezve.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/turkish-gezve.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/turkish-gezve.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Turkish Gezve\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon === "/storage/img/brew_methods/vacuum-pot.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/vacuum-pot.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/vacuum-pot.svg" }
                  }),
                  _vm._v("\n                    Vacuum Pot\n                ")
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/vending-machine.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/vending-machine.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/vending-machine.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Vending Machine\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/vietnamese-hot.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/vietnamese-hot.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/vietnamese-hot.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Vietnamese Hot\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active:
                      _vm.icon ===
                      "/storage/img/brew_methods/vintage-coffee-pot.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon(
                        "/storage/img/brew_methods/vintage-coffee-pot.svg"
                      )
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: {
                      src: "/storage/img/brew_methods/vintage-coffee-pot.svg"
                    }
                  }),
                  _vm._v(
                    "\n                    Vintage Coffee Pot\n                "
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass: "large-3 medium-3 new-icon-container cell",
                  class: {
                    active: _vm.icon === "/storage/img/brew_methods/wifi.svg"
                  },
                  on: {
                    click: function($event) {
                      _vm.selectIcon("/storage/img/brew_methods/wifi.svg")
                    }
                  }
                },
                [
                  _c("img", {
                    staticClass: "new-icon",
                    attrs: { src: "/storage/img/brew_methods/wifi.svg" }
                  }),
                  _vm._v("\n                    Wifi\n                ")
                ]
              )
            ])
          ]
        )
      ]
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "large-12 medium-12 cell" }, [
      _c("label", [_vm._v("图标")])
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-868b1168", module.exports)
  }
}

/***/ }),

/***/ 94:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(280)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(282)
/* template */
var __vue_template__ = __webpack_require__(283)
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
Component.options.__file = "resources/js/pages/admin/BrewMethod.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-868b1168", Component.options)
  } else {
    hotAPI.reload("data-v-868b1168", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});