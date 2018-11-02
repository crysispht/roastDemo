webpackJsonp([15,40],{

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

/***/ 172:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(173);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("29bc54c8", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-490ff724\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Company.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-490ff724\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Company.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 173:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.company {\n  font-family: \"Lato\", sans-serif;\n  border-bottom: 1px solid black;\n  padding-bottom: 15px;\n  padding-top: 15px;\n  color: black;\n}\ndiv.company:hover {\n    background-color: #EEEEEE;\n    cursor: pointer;\n}\n", ""]);

// exports


/***/ }),

/***/ 174:
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

/* harmony default export */ __webpack_exports__["default"] = ({
    props: ['company', 'search'],

    computed: {
        searchValidated: function searchValidated() {

            if (this.search === '') {
                return true;
            }

            if (this.search !== '' && this.company.name.search(this.search) > -1) {
                return true;
            }

            return false;
        }
    }
});

/***/ }),

/***/ 175:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "router-link",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.searchValidated,
          expression: "searchValidated"
        }
      ],
      attrs: { to: { name: "admin-company", params: { id: _vm.company.id } } }
    },
    [
      _c("div", { staticClass: "company" }, [
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-3 medium-3 cell" }, [
            _vm._v(
              "\n                " + _vm._s(_vm.company.name) + "\n            "
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "large-5 medium-5 cell" }, [
            _vm._v(
              "\n                " +
                _vm._s(_vm.company.website) +
                "\n            "
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "large-2 medium-2 cell" }, [
            _vm._v(
              "\n                " +
                _vm._s(_vm.company.cafes_count) +
                "\n            "
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "large-2 medium-2 cell" }, [
            _vm._v(
              "\n                " +
                _vm._s(_vm.company.actions_count) +
                "\n            "
            )
          ])
        ])
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-490ff724", module.exports)
  }
}

/***/ }),

/***/ 300:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(301);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("286a5774", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4c2a2f22\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Companies.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4c2a2f22\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Companies.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 301:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#admin-companies div.companies-header {\n  font-family: \"Lato\", sans-serif;\n  border-bottom: 1px solid black;\n  font-weight: bold;\n  padding-bottom: 10px;\n}\ndiv#admin-companies div.companies-header img.sort-icon {\n    display: inline-block;\n    margin-left: 10px;\n}\ndiv#admin-companies div.companies-header div.sortable-header {\n    cursor: pointer;\n}\ndiv#admin-companies div.no-companies-available {\n  text-align: center;\n  font-family: \"Lato\", sans-serif;\n  font-size: 20px;\n  padding-top: 20px;\n  padding-bottom: 20px;\n}\n", ""]);

// exports


/***/ }),

/***/ 302:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Company_vue__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Company_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Company_vue__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            sortBy: 'name',
            sortDirection: 'ASC',
            search: ''
        };
    },


    components: {
        Company: __WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Company_vue___default.a
    },

    created: function created() {
        this.$store.dispatch('loadAdminCompanies');
    },


    computed: {
        companies: function companies() {
            return this.$store.getters.getCompanies;
        },
        companiesLoadStatus: function companiesLoadStatus() {
            return this.$store.getters.getCompaniesLoadStatus;
        }
    },

    watch: {
        'companiesLoadStatus': function companiesLoadStatus() {
            this.resortCafes('name');
        }
    },

    methods: {
        resortCafes: function resortCafes(by) {
            if (by === this.sortBy) {
                if (this.sortDirection === 'ASC') {
                    this.sortDirection = 'DESC';
                } else {
                    this.sortDirection = 'ASC';
                }
            }

            if (by !== this.sortBy) {
                this.sortDirection = 'ASC';
                this.sortBy = by;
            }

            switch (this.sortBy) {
                case 'name':
                    this.sortCompaniesByName();
                    break;
                case 'cafes':
                    this.sortCompaniesByCafes();
                    break;
                case 'pending-actions':
                    this.sortCompaniesByPendingActions();
                    break;
            }
        },
        sortCompaniesByName: function sortCompaniesByName() {
            this.companies.sort(function (a, b) {
                if (this.sortDirection === 'ASC') {
                    return a.name === b.name ? 0 : a.name > b.name ? 1 : -1;
                }
                if (this.sortDirection === 'DESC') {
                    return a.name === b.name ? 0 : a.name < b.name ? 1 : -1;
                }
            }.bind(this));
        },
        sortCompaniesByCafes: function sortCompaniesByCafes() {
            this.companies.sort(function (a, b) {
                if (this.sortDirection === 'ASC') {
                    return parseInt(a.cafes_count) < parseInt(b.cafes_count) ? 1 : -1;
                }
                if (this.sortDirection === 'DESC') {
                    return parseInt(a.cafes_count) > parseInt(b.cafes_count) ? 1 : -1;
                }
            }.bind(this));
        },
        sortCompaniesByPendingActions: function sortCompaniesByPendingActions() {
            this.companies.sort(function (a, b) {
                if (this.sortDirection === 'ASC') {
                    return parseInt(a.actions_count) < parseInt(b.actions_count) ? 1 : -1;
                }
                if (this.sortDirection === 'DESC') {
                    return parseInt(a.actions_count) > parseInt(b.actions_count) ? 1 : -1;
                }
            }.bind(this));
        }
    }
});

/***/ }),

/***/ 303:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "admin-companies" } }, [
    _vm._m(0),
    _vm._v(" "),
    _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x" }, [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.search,
              expression: "search"
            }
          ],
          attrs: { type: "text", placeholder: "通过公司名称搜索" },
          domProps: { value: _vm.search },
          on: {
            input: function($event) {
              if ($event.target.composing) {
                return
              }
              _vm.search = $event.target.value
            }
          }
        })
      ])
    ]),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "grid-container" },
      [
        _c("div", { staticClass: "grid-x companies-header" }, [
          _c(
            "div",
            {
              staticClass: "large-3 medium-3 cell sortable-header",
              on: {
                click: function($event) {
                  _vm.resortCafes("name")
                }
              }
            },
            [
              _vm._v("\n                公司名称\n                "),
              _c("img", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.sortBy === "name" && _vm.sortDirection === "ASC",
                    expression: "sortBy === 'name' && sortDirection === 'ASC'"
                  }
                ],
                staticClass: "sort-icon",
                attrs: { src: "/storage/img/sort-asc.svg" }
              }),
              _vm._v(" "),
              _c("img", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value:
                      _vm.sortBy === "name" && _vm.sortDirection === "DESC",
                    expression: "sortBy === 'name' && sortDirection === 'DESC'"
                  }
                ],
                staticClass: "sort-icon",
                attrs: { src: "/storage/img/sort-desc.svg" }
              })
            ]
          ),
          _vm._v(" "),
          _c("div", { staticClass: "large-5 medium-5 cell" }, [
            _vm._v("\n                网站\n            ")
          ]),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass: "large-2 medium-2 cell sortable-header",
              on: {
                click: function($event) {
                  _vm.resortCafes("cafes")
                }
              }
            },
            [
              _vm._v("\n                咖啡店\n                "),
              _c("img", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value:
                      _vm.sortBy === "cafes" && _vm.sortDirection === "ASC",
                    expression: "sortBy === 'cafes' && sortDirection === 'ASC'"
                  }
                ],
                staticClass: "sort-icon",
                attrs: { src: "/storage/img/sort-asc.svg" }
              }),
              _vm._v(" "),
              _c("img", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value:
                      _vm.sortBy === "cafes" && _vm.sortDirection === "DESC",
                    expression: "sortBy === 'cafes' && sortDirection === 'DESC'"
                  }
                ],
                staticClass: "sort-icon",
                attrs: { src: "/storage/img/sort-desc.svg" }
              })
            ]
          ),
          _vm._v(" "),
          _c(
            "div",
            {
              staticClass: "large-2 medium-2 cell sortable-header",
              on: {
                click: function($event) {
                  _vm.resortCafes("pending-actions")
                }
              }
            },
            [
              _vm._v("\n                待审核动作\n                "),
              _c("img", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value:
                      _vm.sortBy === "pending-actions" &&
                      _vm.sortDirection === "ASC",
                    expression:
                      "sortBy === 'pending-actions' && sortDirection === 'ASC'"
                  }
                ],
                staticClass: "sort-icon",
                attrs: { src: "/storage/img/sort-asc.svg" }
              }),
              _vm._v(" "),
              _c("img", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value:
                      _vm.sortBy === "pending-actions" &&
                      _vm.sortDirection === "DESC",
                    expression:
                      "sortBy === 'pending-actions' && sortDirection === 'DESC'"
                  }
                ],
                staticClass: "sort-icon",
                attrs: { src: "/storage/img/sort-desc.svg" }
              })
            ]
          )
        ]),
        _vm._v(" "),
        _vm._l(_vm.companies, function(company) {
          return _c("company", {
            key: company.id,
            attrs: { company: company, search: _vm.search }
          })
        }),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.companies.length === 0,
                expression: "companies.length === 0"
              }
            ],
            staticClass: "large-12 medium-12 cell no-companies-available"
          },
          [_vm._v("\n            No companies available\n        ")]
        )
      ],
      2
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-12 medium-12 cell" }, [
          _c("h3", { staticClass: "page-header" }, [_vm._v("所有公司")])
        ])
      ])
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4c2a2f22", module.exports)
  }
}

/***/ }),

/***/ 70:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(172)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(174)
/* template */
var __vue_template__ = __webpack_require__(175)
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
Component.options.__file = "resources/js/components/admin/companies/Company.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-490ff724", Component.options)
  } else {
    hotAPI.reload("data-v-490ff724", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 99:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(300)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(302)
/* template */
var __vue_template__ = __webpack_require__(303)
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
Component.options.__file = "resources/js/pages/admin/Companies.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4c2a2f22", Component.options)
  } else {
    hotAPI.reload("data-v-4c2a2f22", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});