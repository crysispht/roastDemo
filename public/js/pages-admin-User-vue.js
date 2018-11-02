webpackJsonp([16],{

/***/ 101:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(308)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(310)
/* template */
var __vue_template__ = __webpack_require__(311)
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
Component.options.__file = "resources/js/pages/admin/User.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-bed1c158", Component.options)
  } else {
    hotAPI.reload("data-v-bed1c158", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

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

/***/ 308:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(309);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("7e4b0ba7", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-bed1c158\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./User.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-bed1c158\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./User.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 309:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#admin-users label {\n  font-weight: bold;\n  color: black;\n  font-size: 16px;\n  margin-top: 15px;\n}\ndiv#admin-users img.large-avatar {\n  display: block;\n  width: 50px;\n  height: 50px;\n  border-radius: 50px;\n}\ndiv#admin-users a.update-user {\n  display: block;\n  width: 150px;\n  color: white;\n  background-color: #CCC;\n  text-align: center;\n  border-radius: 5px;\n  margin-top: 20px;\n  height: 45px;\n  line-height: 45px;\n}\ndiv#admin-users div.company {\n  padding-top: 10px;\n  padding-bottom: 10px;\n  border-bottom: 1px solid black;\n}\ndiv#admin-users div.company a.remove-company {\n    text-decoration: underline;\n    color: red;\n    float: right;\n}\ndiv#admin-users input[type=\"text\"].company-owner-input {\n  margin-top: 30px;\n}\ndiv#admin-users div.company-selection-container {\n  position: relative;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container {\n    border-radius: 3px;\n    border: 1px solid #BABABA;\n    background-color: white;\n    margin-top: -17px;\n    width: 80%;\n    position: absolute;\n    z-index: 9999;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container div.company-autocomplete {\n      cursor: pointer;\n      padding-left: 12px;\n      padding-right: 12px;\n      padding-top: 8px;\n      padding-bottom: 8px;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container div.company-autocomplete span.company-name {\n        display: block;\n        color: #0D223F;\n        font-size: 16px;\n        font-family: \"Lato\", sans-serif;\n        font-weight: bold;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container div.company-autocomplete span.company-locations {\n        display: block;\n        font-size: 14px;\n        color: #676767;\n        font-family: \"Lato\", sans-serif;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container div.company-autocomplete:hover {\n        background-color: #F2F2F2;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container div.new-company {\n      cursor: pointer;\n      padding-left: 12px;\n      padding-right: 12px;\n      padding-top: 8px;\n      padding-bottom: 8px;\n      font-family: \"Lato\", sans-serif;\n      color: #054E7A;\n      font-style: italic;\n}\ndiv#admin-users div.company-selection-container div.company-autocomplete-container div.new-company:hover {\n        background-color: #F2F2F2;\n}\n", ""]);

// exports


/***/ }),

/***/ 310:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_bus_js__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__config_js__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            companyName: '',
            companyResults: [],
            showAutocomplete: false,
            permission: 0,
            companies: []
        };
    },
    created: function created() {
        this.$store.dispatch('loadAdminUser', { id: this.$route.params.id });
    },


    computed: {
        user: function user() {
            return this.$store.getters.getUser;
        },
        adminUser: function adminUser() {
            return this.$store.getters.getAdminUser;
        },
        adminUserLoadStatus: function adminUserLoadStatus() {
            return this.$store.getters.getAdminUserLoadStatus;
        },
        adminUserUpdateStatus: function adminUserUpdateStatus() {
            return this.$store.getters.getAdminUserUpdateStatus;
        }
    },

    watch: {

        'adminUserLoadStatus': function adminUserLoadStatus() {
            if (this.adminUserLoadStatus === 2) {
                this.syncUserToModel();
            }
        },

        'adminUserUpdateStatus': function adminUserUpdateStatus() {
            if (this.adminUserUpdateStatus === 2) {
                this.syncUserToModel();
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: '更新用户成功!'
                });
            }
        }
    },

    methods: {
        syncUserToModel: function syncUserToModel() {
            this.permission = this.adminUser.permission;
            this.companies = this.adminUser.companies_owned;
        },
        updateProfile: function updateProfile() {
            this.$store.dispatch('updateAdminUser', {
                id: this.adminUser.id,
                permission: this.permission,
                companies: this.companies
            });
        },


        searchCompanies: __WEBPACK_IMPORTED_MODULE_1_lodash___default.a.debounce(function (e) {

            if (this.companyName.length > 1) {
                this.showAutocomplete = true;
                axios.get(__WEBPACK_IMPORTED_MODULE_2__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/companies', {
                    params: {
                        search: this.companyName
                    }
                }).then(function (response) {
                    this.companyResults = response.data;
                }.bind(this));
            }
        }, 300),

        selectCompany: function selectCompany(company) {
            this.showAutocomplete = false;
            this.companies.push(company);
            this.companyResults = [];
            this.companyName = '';
        },
        removeCompany: function removeCompany(index) {
            this.companies.splice(index, 1);
        }
    }
});

/***/ }),

/***/ 311:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "admin-users" } }, [
    _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-12 medium-12 cell" }, [
          _c(
            "h3",
            { staticClass: "page-header" },
            [
              _c("router-link", { attrs: { to: { name: "admin-users" } } }, [
                _vm._v("所有用户")
              ]),
              _vm._v(
                "\n                    > " +
                  _vm._s(_vm.adminUser.name) +
                  "\n                "
              )
            ],
            1
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c("label", [_vm._v("头像")]),
          _vm._v(" "),
          _c("img", {
            staticClass: "large-avatar",
            attrs: { src: _vm.adminUser.avatar }
          })
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c("label", [_vm._v("姓名")]),
          _vm._v(
            "\n                " + _vm._s(_vm.adminUser.name) + "\n            "
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c("label", [_vm._v("邮箱")]),
          _vm._v(
            "\n                " +
              _vm._s(_vm.adminUser.email) +
              "\n            "
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c("label", [_vm._v("权限级别")]),
          _vm._v(" "),
          _c(
            "select",
            {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.permission,
                  expression: "permission"
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
                  _vm.permission = $event.target.multiple
                    ? $$selectedVal
                    : $$selectedVal[0]
                }
              }
            },
            [
              _c("option", { attrs: { value: "0" } }, [_vm._v("普通用户")]),
              _vm._v(" "),
              _c("option", { attrs: { value: "1" } }, [_vm._v("商家用户")]),
              _vm._v(" "),
              _c("option", { attrs: { value: "2" } }, [_vm._v("管理员")]),
              _vm._v(" "),
              _vm.user.permission === 3
                ? _c("option", { attrs: { value: "3" } }, [
                    _vm._v("超级管理员")
                  ])
                : _vm._e()
            ]
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c(
          "div",
          { staticClass: "large-8 medium-12 cell company-selection-container" },
          [
            _c("label", [_vm._v("拥有的公司")]),
            _vm._v(" "),
            _vm.companies.length === 0
              ? _c("span", { staticClass: "no-companies-owned" }, [
                  _vm._v("N/A")
                ])
              : _vm._e(),
            _vm._v(" "),
            _vm._l(_vm.companies, function(company, key) {
              return _c(
                "div",
                { staticClass: "company" },
                [
                  _c(
                    "router-link",
                    {
                      attrs: {
                        to: {
                          name: "admin-company",
                          params: { id: company.id }
                        }
                      }
                    },
                    [_vm._v(_vm._s(company.name) + "\n                    ")]
                  ),
                  _vm._v(" "),
                  _c(
                    "a",
                    {
                      staticClass: "remove-company",
                      on: {
                        click: function($event) {
                          _vm.removeCompany(key)
                        }
                      }
                    },
                    [_vm._v("移除")]
                  )
                ],
                1
              )
            }),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.companyName,
                  expression: "companyName"
                }
              ],
              staticClass: "form-input company-owner-input",
              attrs: { type: "text" },
              domProps: { value: _vm.companyName },
              on: {
                keyup: function($event) {
                  _vm.searchCompanies()
                },
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.companyName = $event.target.value
                }
              }
            }),
            _vm._v(" "),
            _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.companyName.length > 0 && _vm.showAutocomplete,
                    expression: "companyName.length > 0 && showAutocomplete"
                  }
                ],
                staticClass: "company-autocomplete-container"
              },
              _vm._l(_vm.companyResults, function(companyResult) {
                return _c(
                  "div",
                  {
                    staticClass: "company-autocomplete",
                    on: {
                      click: function($event) {
                        _vm.selectCompany(companyResult)
                      }
                    }
                  },
                  [
                    _c("span", { staticClass: "company-name" }, [
                      _vm._v(_vm._s(companyResult.name))
                    ]),
                    _vm._v(" "),
                    _c("span", { staticClass: "company-locations" }, [
                      _vm._v(_vm._s(companyResult.cafes_count) + " location"),
                      companyResult.cafes_count > 1
                        ? _c("span", [_vm._v("s")])
                        : _vm._e()
                    ])
                  ]
                )
              })
            )
          ],
          2
        )
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-8 medium-12 cell" }, [
          _c(
            "a",
            {
              staticClass: "update-user",
              on: {
                click: function($event) {
                  _vm.updateProfile()
                }
              }
            },
            [_vm._v("更新")]
          )
        ])
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
    require("vue-hot-reload-api")      .rerender("data-v-bed1c158", module.exports)
  }
}

/***/ })

});