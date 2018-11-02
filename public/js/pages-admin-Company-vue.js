webpackJsonp([12,41],{

/***/ 100:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(304)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(306)
/* template */
var __vue_template__ = __webpack_require__(307)
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
Component.options.__file = "resources/js/pages/admin/Company.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-17c5a884", Component.options)
  } else {
    hotAPI.reload("data-v-17c5a884", Component.options)
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

/***/ 168:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(169);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("7ce47aca", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-616ab07c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Cafe.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-616ab07c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Cafe.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 169:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.cafe-listing {\n  padding-top: 10px;\n  padding-bottom: 10px;\n}\n", ""]);

// exports


/***/ }),

/***/ 170:
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

/* harmony default export */ __webpack_exports__["default"] = ({
    props: ['cafe']
});

/***/ }),

/***/ 171:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "grid-x cafe-listing" }, [
    _c("div", { staticClass: "large-3 medium-3 cell" }, [
      _vm._v("\n        " + _vm._s(_vm.cafe.location_name) + "\n    ")
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "large-6 medium-6 cell" }, [
      _vm._v(
        "\n        " +
          _vm._s(_vm.cafe.address) +
          " " +
          _vm._s(_vm.cafe.city) +
          ", " +
          _vm._s(_vm.cafe.state) +
          "\n    "
      )
    ]),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "large-3 medium-3 cell" },
      [
        _c(
          "router-link",
          {
            attrs: {
              to: {
                name: "admin-cafe",
                params: { id: _vm.cafe.company_id, cafeID: _vm.cafe.id }
              }
            }
          },
          [_vm._v("\n            更多信息\n        ")]
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-616ab07c", module.exports)
  }
}

/***/ }),

/***/ 304:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(305);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("0f7e5dad", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-17c5a884\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Company.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-17c5a884\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Company.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 305:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#admin-company label {\n  font-weight: bold;\n  color: black;\n  font-size: 16px;\n  margin-top: 15px;\n}\ndiv#admin-company div.cafes-header {\n  font-family: \"Lato\", sans-serif;\n  border-bottom: 1px solid black;\n  font-weight: bold;\n  padding-bottom: 10px;\n}\ndiv#admin-company div.user-selection-container {\n  position: relative;\n  margin-top: 20px;\n}\ndiv#admin-company div.user-selection-container div.user-autocomplete-container {\n    border-radius: 3px;\n    border: 1px solid #BABABA;\n    background-color: white;\n    margin-top: -17px;\n    width: 80%;\n    position: absolute;\n    z-index: 9999;\n}\ndiv#admin-company div.user-selection-container div.user-autocomplete-container div.user-autocomplete {\n      cursor: pointer;\n      padding-left: 12px;\n      padding-right: 12px;\n      padding-top: 8px;\n      padding-bottom: 8px;\n}\ndiv#admin-company div.user-selection-container div.user-autocomplete-container div.user-autocomplete span.user-name {\n        display: block;\n        color: #0D223F;\n        font-size: 16px;\n        font-family: \"Lato\", sans-serif;\n        font-weight: bold;\n}\ndiv#admin-company div.user-selection-container div.user-autocomplete-container div.user-autocomplete:hover {\n        background-color: #F2F2F2;\n}\ndiv#admin-company div.location-type {\n  display: inline-block;\n  margin-right: 10px;\n  cursor: pointer;\n  background-color: #CCC;\n}\ndiv#admin-company div.location-type.active {\n    color: white;\n    background-color: #FFBE54;\n}\ndiv#admin-company div.owner {\n  padding-top: 10px;\n  padding-bottom: 10px;\n  border-bottom: 1px solid black;\n}\ndiv#admin-company div.owner a.remove-owner {\n    text-decoration: underline;\n    color: red;\n    float: right;\n}\ndiv#admin-company a.save-edits {\n  display: block;\n  width: 150px;\n  color: white;\n  background-color: #CCC;\n  text-align: center;\n  border-radius: 5px;\n  margin-top: 20px;\n  height: 45px;\n  line-height: 45px;\n}\n", ""]);

// exports


/***/ }),

/***/ 306:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Cafe_vue__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Cafe_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Cafe_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event_bus_js__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__config_js__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            tab: 'information',
            newOwner: '',
            newOwnerResults: [],
            showAutocomplete: true,
            name: '',
            type: '',
            subscription: 0,
            website: '',
            instagram_url: '',
            facebook_url: '',
            twitter_url: '',
            owners: [],
            deleted: 0,
            validations: {
                name: true,
                type: true,
                website: true,
                owners: true
            }
        };
    },


    components: {
        Cafe: __WEBPACK_IMPORTED_MODULE_0__components_admin_companies_Cafe_vue___default.a
    },

    created: function created() {
        this.$store.dispatch('loadAdminCompany', { id: this.$route.params.id });
    },


    computed: {
        user: function user() {
            return this.$store.getters.getUser;
        },
        company: function company() {
            return this.$store.getters.getCompany;
        },
        companyLoadStatus: function companyLoadStatus() {
            return this.$store.getters.getCompanyLoadStatus;
        },
        companyEditStatus: function companyEditStatus() {
            return this.$store.getters.getCompanyEditStatus;
        }
    },

    watch: {

        'companyLoadStatus': function companyLoadStatus() {
            if (this.companyLoadStatus === 2) {
                this.syncCompanyToModel();
            }
        },

        'companyEditStatus': function companyEditStatus() {
            if (this.companyEditStatus === 2) {
                this.syncCompanyToModel();
                __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: '更新公司信息成功!'
                });
            }
        }
    },

    methods: {
        setCompanyType: function setCompanyType(type) {
            this.type = type;
        },
        removeOwner: function removeOwner(index) {
            this.owners.splice(index, 1);
        },
        saveEdits: function saveEdits() {
            if (this.validateEditCompany()) {
                this.$store.dispatch('updateAdminCompany', {
                    id: this.company.id,
                    name: this.name,
                    type: this.type,
                    website: this.website,
                    instagram_url: this.instagram_url,
                    facebook_url: this.facebook_url,
                    twitter_url: this.twitter_url,
                    subscription: this.subscription,
                    owners: this.owners,
                    deleted: this.deleted
                });
            }
        },
        validateEditCompany: function validateEditCompany() {
            var validCompanyForm = true;

            if (this.name.trim() === '') {
                validCompanyForm = false;
                this.validations.name = false;
            } else {
                this.validations.name = true;
            }

            if (this.website.trim !== '' && !this.website.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/)) {
                validNewCafeForm = false;
                this.validations.website = false;
            } else {
                this.validations.website = true;
            }
            return validCompanyForm;
        },
        syncCompanyToModel: function syncCompanyToModel() {
            this.name = this.company.name;
            this.type = this.company.roaster === 1 ? 'roaster' : 'cafe';
            this.subscription = this.company.subscription;
            this.website = this.company.website;
            this.instagram_url = this.company.instagram_url;
            this.facebook_url = this.company.facebook_url;
            this.twitter_url = this.company.twitter_url;
            this.owners = this.company.owned_by;
            this.deleted = this.company.deleted_at === null ? 0 : 1;
        },


        searchUsers: __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.debounce(function (e) {

            if (this.newOwner.length > 1) {
                this.showAutocomplete = true;

                axios.get(__WEBPACK_IMPORTED_MODULE_3__config_js__["a" /* ROAST_CONFIG */].API_URL + '/admin/users', {
                    params: {
                        search: this.newOwner
                    }
                }).then(function (response) {
                    this.newOwnerResults = response.data;
                }.bind(this));
            }
        }, 300),

        selectUser: function selectUser(user) {
            this.owners.push(user);
            this.newOwner = '';
            this.showAutocomplete = false;
        }
    }
});

/***/ }),

/***/ 307:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "admin-company" } }, [
    _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x" }, [
        _c("div", { staticClass: "large-12 medium-12 cell" }, [
          _c(
            "h3",
            { staticClass: "page-header" },
            [
              _c(
                "router-link",
                { attrs: { to: { name: "admin-companies" } } },
                [_vm._v("所有公司")]
              ),
              _vm._v(
                "\n                    > " +
                  _vm._s(_vm.company.name) +
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
      _c("div", { staticClass: "grid-x admin-tabs" }, [
        _c(
          "div",
          {
            staticClass: "tab",
            class: { "active-tab": _vm.tab === "information" },
            on: {
              click: function($event) {
                _vm.tab = "information"
              }
            }
          },
          [_vm._v("\n                信息\n            ")]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            staticClass: "tab",
            class: { "active-tab": _vm.tab === "cafes" },
            on: {
              click: function($event) {
                _vm.tab = "cafes"
              }
            }
          },
          [_vm._v("\n                咖啡店\n            ")]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            staticClass: "tab",
            class: { "active-tab": _vm.tab === "history" },
            on: {
              click: function($event) {
                _vm.tab = "history"
              }
            }
          },
          [_vm._v("\n                历史\n            ")]
        )
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
            value: _vm.tab === "information",
            expression: "tab === 'information'"
          }
        ],
        staticClass: "grid-container"
      },
      [
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("公司名称")]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.name,
                  expression: "name"
                }
              ],
              attrs: { type: "text" },
              domProps: { value: _vm.name },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.name = $event.target.value
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
                    value: !_vm.validations.name,
                    expression: "!validations.name"
                  }
                ],
                staticClass: "validation"
              },
              [_vm._v("请输入公司名称")]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("类型")]),
            _vm._v(" "),
            _c(
              "div",
              {
                staticClass: "location-type roaster",
                class: { active: _vm.type === "roaster" },
                on: {
                  click: function($event) {
                    _vm.setCompanyType("roaster")
                  }
                }
              },
              [_vm._v("\n                    烘焙店\n                ")]
            ),
            _vm._v(" "),
            _c(
              "div",
              {
                staticClass: "location-type cafe",
                class: { active: _vm.type === "cafe" },
                on: {
                  click: function($event) {
                    _vm.setCompanyType("cafe")
                  }
                }
              },
              [_vm._v("\n                    专卖店\n                ")]
            )
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
                value: _vm.type === "roaster",
                expression: "type === 'roaster'"
              }
            ],
            staticClass: "grid-x grid-padding-x"
          },
          [_vm._m(0)]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.type === "roaster",
                expression: "type === 'roaster'"
              }
            ],
            staticClass: "grid-x grid-padding-x"
          },
          [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c(
                  "div",
                  {
                    staticClass: "subscription-option option",
                    class: { active: _vm.subscription === 1 },
                    on: {
                      click: function($event) {
                        _vm.subscription === 0
                          ? (_vm.subscription = 1)
                          : (_vm.subscription = 0)
                      }
                    }
                  },
                  [_vm._m(1)]
                )
              ]
            )
          ]
        ),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("网站")]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.website,
                  expression: "website"
                }
              ],
              attrs: { type: "text" },
              domProps: { value: _vm.website },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.website = $event.target.value
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
                    value: !_vm.validations.website,
                    expression: "!validations.website"
                  }
                ],
                staticClass: "validation"
              },
              [_vm._v("请输入有效的网站地址")]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c(
            "div",
            { staticClass: "large-8 medium-12 cell" },
            [
              _c("label", [_vm._v("所有人")]),
              _vm._v(" "),
              _c(
                "div",
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: _vm.owners.length === 0,
                      expression: "owners.length === 0"
                    }
                  ],
                  staticClass: "no-owners"
                },
                [_vm._v("N/A")]
              ),
              _vm._v(" "),
              _vm._l(_vm.owners, function(owner, key) {
                return _c(
                  "div",
                  { staticClass: "owner" },
                  [
                    _vm.user.permission > 1
                      ? _c(
                          "router-link",
                          {
                            attrs: {
                              to: {
                                name: "admin-user",
                                params: { id: owner.id }
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                        " +
                                _vm._s(owner.name) +
                                "\n                    "
                            )
                          ]
                        )
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.user.permission === 1
                      ? _c("span", [_vm._v(_vm._s(owner.name))])
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.user.permission > 1
                      ? _c(
                          "a",
                          {
                            staticClass: "remove-owner",
                            on: {
                              click: function($event) {
                                _vm.removeOwner(key)
                              }
                            }
                          },
                          [_vm._v("移除")]
                        )
                      : _vm._e()
                  ],
                  1
                )
              }),
              _vm._v(" "),
              _vm.user.permission > 1
                ? _c("div", { staticClass: "user-selection-container" }, [
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.newOwner,
                          expression: "newOwner"
                        }
                      ],
                      staticClass: "new-owner",
                      attrs: { type: "text", placeholder: "添加所有人" },
                      domProps: { value: _vm.newOwner },
                      on: {
                        keyup: function($event) {
                          _vm.searchUsers()
                        },
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.newOwner = $event.target.value
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
                            value:
                              _vm.newOwner.length > 0 && _vm.showAutocomplete,
                            expression:
                              "newOwner.length > 0 && showAutocomplete"
                          }
                        ],
                        staticClass: "user-autocomplete-container"
                      },
                      _vm._l(_vm.newOwnerResults, function(user) {
                        return _c(
                          "div",
                          {
                            staticClass: "user-autocomplete",
                            on: {
                              click: function($event) {
                                _vm.selectUser(user)
                              }
                            }
                          },
                          [
                            _c("span", { staticClass: "user-name" }, [
                              _vm._v(_vm._s(user.name))
                            ])
                          ]
                        )
                      })
                    )
                  ])
                : _vm._e()
            ],
            2
          )
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("状态")]),
            _vm._v(" "),
            _c(
              "select",
              {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.deleted,
                    expression: "deleted"
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
                    _vm.deleted = $event.target.multiple
                      ? $$selectedVal
                      : $$selectedVal[0]
                  }
                }
              },
              [
                _c("option", { attrs: { value: "0" } }, [_vm._v("有效")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "1" } }, [_vm._v("删除")])
              ]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-12 medium-12 cell" }, [
            _c(
              "a",
              {
                staticClass: "save-edits",
                on: {
                  click: function($event) {
                    _vm.saveEdits()
                  }
                }
              },
              [_vm._v("更新")]
            )
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
            value: _vm.tab === "cafes",
            expression: "tab === 'cafes'"
          }
        ],
        staticClass: "grid-container"
      },
      [
        _vm._m(2),
        _vm._v(" "),
        _vm._l(_vm.company.cafes, function(cafe) {
          return _c("cafe", { key: cafe.id, attrs: { cafe: cafe } })
        })
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
    return _c(
      "div",
      { staticClass: "large-8 medium-9 small-12 cell centered" },
      [_c("label", [_vm._v("烘焙店提供订购服务吗?")])]
    )
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "option-container" }, [
      _c("img", {
        staticClass: "option-icon",
        attrs: { src: "/storage/img/coffee-pack.svg" }
      }),
      _vm._v(" "),
      _c("span", { staticClass: "option-name" }, [_vm._v("咖啡订购")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "grid-x cafes-header" }, [
      _c("div", { staticClass: "large-3 medium-3 cell" }, [
        _vm._v("\n                位置名称\n            ")
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "large-6 medium-6 cell" }, [
        _vm._v("\n                地址\n            ")
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "large-3 medium-3 cell" })
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-17c5a884", module.exports)
  }
}

/***/ }),

/***/ 69:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(168)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(170)
/* template */
var __vue_template__ = __webpack_require__(171)
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
Component.options.__file = "resources/js/components/admin/companies/Cafe.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-616ab07c", Component.options)
  } else {
    hotAPI.reload("data-v-616ab07c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});