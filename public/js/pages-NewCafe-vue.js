webpackJsonp([22],{

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

/***/ 268:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(269);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("7f8e7a30", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-32b4e964\",\"scoped\":true,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./NewCafe.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-32b4e964\",\"scoped\":true,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./NewCafe.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 269:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#new-cafe-page[data-v-32b4e964] {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background-color: white;\n  z-index: 99999;\n  overflow: auto;\n}\ndiv#new-cafe-page img#back[data-v-32b4e964] {\n    float: right;\n    margin-top: 20px;\n    margin-right: 20px;\n}\ndiv#new-cafe-page .centered[data-v-32b4e964] {\n    margin: auto;\n}\ndiv#new-cafe-page h2.page-title[data-v-32b4e964] {\n    color: #342C0C;\n    font-size: 36px;\n    font-weight: 900;\n    font-family: \"Lato\", sans-serif;\n    margin-top: 60px;\n}\ndiv#new-cafe-page label.form-label[data-v-32b4e964] {\n    font-family: \"Lato\", sans-serif;\n    text-transform: uppercase;\n    font-weight: bold;\n    color: black;\n    margin-top: 10px;\n    margin-bottom: 10px;\n}\ndiv#new-cafe-page input[type=\"text\"].form-input[data-v-32b4e964] {\n    border: 1px solid #BABABA;\n    border-radius: 3px;\n}\ndiv#new-cafe-page input[type=\"text\"].form-input.invalid[data-v-32b4e964] {\n      border: 1px solid #D0021B;\n}\ndiv#new-cafe-page div.validation[data-v-32b4e964] {\n    color: #D0021B;\n    font-family: \"Lato\", sans-serif;\n    font-size: 14px;\n    margin-top: -15px;\n    margin-bottom: 15px;\n}\ndiv#new-cafe-page div.location-type[data-v-32b4e964] {\n    text-align: center;\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n    width: 25%;\n    display: inline-block;\n    height: 55px;\n    line-height: 55px;\n    cursor: pointer;\n    margin-bottom: 5px;\n    margin-right: 10px;\n    background-color: #EEE;\n    color: #111111;\n}\ndiv#new-cafe-page div.location-type.active[data-v-32b4e964] {\n      color: white;\n      background-color: #FFBE54;\n}\ndiv#new-cafe-page div.location-type.roaster[data-v-32b4e964] {\n      border-top-left-radius: 3px;\n      border-bottom-left-radius: 3px;\n      border-right: 0px;\n}\ndiv#new-cafe-page div.location-type.cafe[data-v-32b4e964] {\n      border-top-right-radius: 3px;\n      border-bottom-right-radius: 3px;\n}\ndiv#new-cafe-page div.company-selection-container[data-v-32b4e964] {\n    position: relative;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container[data-v-32b4e964] {\n      border-radius: 3px;\n      border: 1px solid #BABABA;\n      background-color: white;\n      margin-top: -17px;\n      width: 80%;\n      position: absolute;\n      z-index: 9999;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container div.company-autocomplete[data-v-32b4e964] {\n        cursor: pointer;\n        padding-left: 12px;\n        padding-right: 12px;\n        padding-top: 8px;\n        padding-bottom: 8px;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container div.company-autocomplete span.company-name[data-v-32b4e964] {\n          display: block;\n          color: #0D223F;\n          font-size: 16px;\n          font-family: \"Lato\", sans-serif;\n          font-weight: bold;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container div.company-autocomplete span.company-locations[data-v-32b4e964] {\n          display: block;\n          font-size: 14px;\n          color: #676767;\n          font-family: \"Lato\", sans-serif;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container div.company-autocomplete[data-v-32b4e964]:hover {\n          background-color: #F2F2F2;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container div.new-company[data-v-32b4e964] {\n        cursor: pointer;\n        padding-left: 12px;\n        padding-right: 12px;\n        padding-top: 8px;\n        padding-bottom: 8px;\n        font-family: \"Lato\", sans-serif;\n        color: #054E7A;\n        font-style: italic;\n}\ndiv#new-cafe-page div.company-selection-container div.company-autocomplete-container div.new-company[data-v-32b4e964]:hover {\n          background-color: #F2F2F2;\n}\ndiv#new-cafe-page a.add-location-button[data-v-32b4e964] {\n    display: block;\n    text-align: center;\n    height: 50px;\n    color: white;\n    border-radius: 3px;\n    font-size: 18px;\n    font-family: \"Lato\", sans-serif;\n    background-color: #A7BE4D;\n    line-height: 50px;\n    margin-bottom: 50px;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv#new-cafe-page div.location-type[data-v-32b4e964] {\n    width: 50%;\n}\n}\n", ""]);

// exports


/***/ }),

/***/ 270:
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            companyResults: [],
            showAutocomplete: true,
            companyName: '',
            companyID: '',
            newCompany: false,
            companyType: 'roaster',
            subscription: 0,
            website: '',
            locationName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            brewMethodsSelected: [],
            matcha: 0,
            tea: 0,

            validations: {
                companyName: {
                    is_valid: true,
                    text: ''
                },
                website: {
                    is_valid: true,
                    text: ''
                },
                address: {
                    is_valid: true,
                    text: ''
                },
                city: {
                    is_valid: true,
                    text: ''
                },
                state: {
                    is_valid: true,
                    text: ''
                },
                zip: {
                    is_valid: true,
                    text: ''
                }
            }
        };
    },

    methods: {
        setCompanyType: function setCompanyType(type) {
            this.companyType = type;
        },
        toggleSelectedBrewMethod: function toggleSelectedBrewMethod(id) {
            if (this.brewMethodsSelected.indexOf(id) >= 0) {
                this.brewMethodsSelected.splice(this.brewMethodsSelected.indexOf(id), 1);
            } else {
                this.brewMethodsSelected.push(id);
            }
        },

        searchCompanies: __WEBPACK_IMPORTED_MODULE_1_lodash___default.a.debounce(function (e) {
            if (this.companyName.length > 1) {
                this.showAutocomplete = true;
                axios.get(__WEBPACK_IMPORTED_MODULE_2__config_js__["a" /* ROAST_CONFIG */].API_URL + '/companies/search', {
                    params: {
                        search: this.companyName
                    }
                }).then(function (response) {
                    this.companyResults = response.data.companies;
                }.bind(this));
            }
        }, 300),
        submitNewCafe: function submitNewCafe() {
            if (this.validateNewCafe()) {
                this.$store.dispatch('addCafe', {
                    company_name: this.companyName,
                    company_id: this.companyID,
                    company_type: this.companyType,
                    subscription: this.subscription,
                    website: this.website,
                    location_name: this.locationName,
                    address: this.address,
                    city: this.city,
                    state: this.state,
                    zip: this.zip,
                    brew_methods: this.brewMethodsSelected,
                    matcha: this.matcha,
                    tea: this.tea
                });
            }
        },
        validateNewCafe: function validateNewCafe() {
            var validNewCafeForm = true;

            // 确保 name 字段不为空
            if (this.companyName.trim() === '') {
                validNewCafeForm = false;
                this.validations.companyName.is_valid = false;
                this.validations.companyName.text = '请输入咖啡店的名字';
            } else {
                this.validations.companyName.is_valid = true;
                this.validations.companyName.text = '';
            }

            // 确保网址是有效的 URL
            if (this.website.trim !== '' && !this.website.match(/^((https?):\/\/)?([w|W]{3}\.)?[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/)) {
                validNewCafeForm = false;
                this.validations.website.is_valid = false;
                this.validations.website.text = '请输入有效的咖啡店网址';
            } else {
                this.validations.website.is_valid = true;
                this.validations.website.text = '';
            }

            if (this.address.trim() === '') {
                validNewCafeForm = false;
                this.validations.address.is_valid = false;
                this.validations.address.text = '地址字段不能为空';
            } else {
                this.validations.address.is_valid = true;
                this.validations.address.text = '';
            }

            if (this.city.trim() === '') {
                validNewCafeForm = false;
                this.validations.city.is_valid = false;
                this.validations.city.text = '城市字段不能为空';
            } else {
                this.validations.city.is_valid = true;
                this.validations.city.text = '';
            }

            if (this.state.trim() === '') {
                validNewCafeForm = false;
                this.validations.state.is_valid = false;
                this.validations.state.text = '省份字段不能为空';
            } else {
                this.validations.state.is_valid = true;
                this.validations.state.text = '';
            }

            if (this.zip.trim() === '' || !this.zip.match(/(^\d{6}$)/)) {
                validNewCafeForm = false;
                this.validations.zip.is_valid = false;
                this.validations.zip.text = '请输入有效的邮政编码';
            } else {
                this.validations.zip.is_valid = true;
                this.validations.zip.text = '';
            }

            return validNewCafeForm;
        },
        addNewCompany: function addNewCompany() {
            this.showAutocomplete = false;
            this.newCompany = true;
            this.companyResults = [];
        },
        selectCompany: function selectCompany(company) {
            this.showAutocomplete = false;
            this.companyName = company.name;
            this.companyID = company.id;
            this.newCompany = false;
            this.companyResults = [];
            this.website = company.website;
        },
        clearForm: function clearForm() {
            this.companyResults = [];
            this.companyName = '';
            this.companyID = '';
            this.newCompany = false;
            this.companyType = 'roaster';
            this.subscription = 0;
            this.website = '';
            this.locationName = '';
            this.address = '';
            this.city = '';
            this.state = '';
            this.zip = '';
            this.brewMethodsSelected = [];
            this.matcha = 0;
            this.tea = 0;
            this.validations = {
                companyName: {
                    is_valid: true,
                    text: ''
                },
                website: {
                    is_valid: true,
                    text: ''
                },
                address: {
                    is_valid: true,
                    text: ''
                },
                city: {
                    is_valid: true,
                    text: ''
                },
                state: {
                    is_valid: true,
                    text: ''
                },
                zip: {
                    is_valid: true,
                    text: ''
                }
            };
        }
    },
    computed: {
        brewMethods: function brewMethods() {
            return this.$store.getters.getBrewMethods;
        },
        addCafeStatus: function addCafeStatus() {
            return this.$store.getters.getCafeAddStatus;
        },
        addCafeText: function addCafeText() {
            return this.$store.getters.getCafeAddText;
        }
    },
    watch: {
        addCafeStatus: function addCafeStatus() {
            if (this.addCafeStatus === 2) {
                // 显示添加成功通知
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: this.addCafeText
                });
                this.clearForm();
                // 返回列表页
                this.$router.push({ name: 'cafes' });
            }
        }
    }
});

/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("transition", { attrs: { name: "scale-in-center" } }, [
    _c(
      "div",
      { attrs: { id: "new-cafe-page" } },
      [
        _c("router-link", { attrs: { to: { name: "cafes" } } }, [
          _c("img", {
            attrs: { src: "/storage/img/close-modal.svg", id: "back" }
          })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-container" }, [
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [_c("h2", { staticClass: "page-title" }, [_vm._v("新增咖啡店")])]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              {
                staticClass:
                  "large-8 medium-9 small-12 cell centered company-selection-container"
              },
              [
                _c("label", { staticClass: "form-label" }, [
                  _vm._v("公司名称")
                ]),
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
                  staticClass: "form-input",
                  class: { invalid: !_vm.validations.companyName.is_valid },
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
                        value: !_vm.validations.companyName.is_valid,
                        expression: "!validations.companyName.is_valid"
                      }
                    ],
                    staticClass: "validation"
                  },
                  [
                    _vm._v(
                      _vm._s(_vm.validations.companyName.text) +
                        "\n                    "
                    )
                  ]
                ),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.companyID,
                      expression: "companyID"
                    }
                  ],
                  attrs: { type: "hidden" },
                  domProps: { value: _vm.companyID },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.companyID = $event.target.value
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
                          _vm.companyName.length > 0 && _vm.showAutocomplete,
                        expression: "companyName.length > 0 && showAutocomplete"
                      }
                    ],
                    staticClass: "company-autocomplete-container"
                  },
                  [
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
                            _vm._v(
                              _vm._s(companyResult.cafes_count) + " location"
                            ),
                            companyResult.cafes_count > 1
                              ? _c("span", [_vm._v("s")])
                              : _vm._e()
                          ])
                        ]
                      )
                    }),
                    _vm._v(" "),
                    _c(
                      "div",
                      {
                        staticClass: "new-company",
                        on: {
                          click: function($event) {
                            _vm.addNewCompany()
                          }
                        }
                      },
                      [
                        _vm._v(
                          '\n                            Add new company called "' +
                            _vm._s(_vm.companyName) +
                            '"\n                        '
                        )
                      ]
                    )
                  ],
                  2
                )
              ]
            )
          ]),
          _vm._v(" "),
          _vm.newCompany
            ? _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c(
                  "div",
                  { staticClass: "large-8 medium-9 small-12 cell centered" },
                  [
                    _c("label", { staticClass: "form-label" }, [
                      _vm._v("网站")
                    ]),
                    _vm._v(" "),
                    _c(
                      "input",
                      _vm._b(
                        {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.website,
                              expression: "website"
                            }
                          ],
                          staticClass: "form-input",
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
                        },
                        "input",
                        { invalid: !_vm.validations.website.is_valid },
                        false
                      )
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: !_vm.validations.website.is_valid,
                            expression: "!validations.website.is_valid"
                          }
                        ],
                        staticClass: "validation"
                      },
                      [
                        _vm._v(
                          _vm._s(_vm.validations.website.text) +
                            "\n                    "
                        )
                      ]
                    )
                  ]
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.newCompany
            ? _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c(
                  "div",
                  { staticClass: "large-8 medium-9 small-12 cell centered" },
                  [_c("label", { staticClass: "form-label" }, [_vm._v("类型")])]
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.newCompany
            ? _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c(
                  "div",
                  { staticClass: "large-8 medium-9 small-12 cell centered" },
                  [
                    _c(
                      "div",
                      {
                        staticClass: "location-type roaster",
                        class: { active: _vm.companyType === "roaster" },
                        on: {
                          click: function($event) {
                            _vm.setCompanyType("roaster")
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
                        staticClass: "location-type cafe",
                        class: { active: _vm.companyType === "cafe" },
                        on: {
                          click: function($event) {
                            _vm.setCompanyType("cafe")
                          }
                        }
                      },
                      [
                        _vm._v(
                          "\n                        咖啡店\n                    "
                        )
                      ]
                    )
                  ]
                )
              ])
            : _vm._e(),
          _vm._v(" "),
          _vm.newCompany
            ? _c(
                "div",
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: _vm.companyType === "roaster",
                      expression: "companyType === 'roaster'"
                    }
                  ],
                  staticClass: "grid-x grid-padding-x"
                },
                [
                  _c(
                    "div",
                    { staticClass: "large-8 medium-9 small-12 cell centered" },
                    [
                      _c("label", { staticClass: "form-label" }, [
                        _vm._v("是否提供订购服务？")
                      ])
                    ]
                  )
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.newCompany
            ? _c(
                "div",
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: _vm.companyType === "roaster",
                      expression: "companyType === 'roaster'"
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
            : _vm._e(),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c("label", { staticClass: "form-label" }, [
                  _vm._v("支持的冲泡方法")
                ])
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              _vm._l(_vm.brewMethods, function(method) {
                return _c(
                  "div",
                  {
                    staticClass: "brew-method option",
                    class: {
                      active: _vm.brewMethodsSelected.indexOf(method.id) >= 0
                    },
                    on: {
                      click: function($event) {
                        _vm.toggleSelectedBrewMethod(method.id)
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
              })
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c("label", { staticClass: "form-label" }, [
                  _vm._v("支持的饮料选项")
                ])
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c(
                  "div",
                  {
                    staticClass: "drink-option option",
                    class: { active: _vm.matcha === 1 },
                    on: {
                      click: function($event) {
                        _vm.matcha === 0 ? (_vm.matcha = 1) : (_vm.matcha = 0)
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
                    class: { active: _vm.tea === 1 },
                    on: {
                      click: function($event) {
                        _vm.tea === 0 ? (_vm.tea = 1) : (_vm.tea = 0)
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
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c("label", { staticClass: "form-label" }, [
                  _vm._v("位置名称")
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.locationName,
                      expression: "locationName"
                    }
                  ],
                  staticClass: "form-input",
                  attrs: { type: "text" },
                  domProps: { value: _vm.locationName },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.locationName = $event.target.value
                    }
                  }
                })
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c("label", { staticClass: "form-label" }, [
                  _vm._v("街道地址")
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.address,
                      expression: "address"
                    }
                  ],
                  staticClass: "form-input",
                  class: { invalid: !_vm.validations.address.is_valid },
                  attrs: { type: "text" },
                  domProps: { value: _vm.address },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.address = $event.target.value
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
                        value: !_vm.validations.address.is_valid,
                        expression: "!validations.address.is_valid"
                      }
                    ],
                    staticClass: "validation"
                  },
                  [
                    _vm._v(
                      _vm._s(_vm.validations.address.text) +
                        "\n                    "
                    )
                  ]
                )
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c("label", { staticClass: "form-label" }, [_vm._v("城市")]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.city,
                      expression: "city"
                    }
                  ],
                  staticClass: "form-input",
                  class: { invalid: !_vm.validations.city.is_valid },
                  attrs: { type: "text" },
                  domProps: { value: _vm.city },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.city = $event.target.value
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
                        value: !_vm.validations.city.is_valid,
                        expression: "!validations.city.is_valid"
                      }
                    ],
                    staticClass: "validation"
                  },
                  [_vm._v(_vm._s(_vm.validations.city.text))]
                )
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c("div", { staticClass: "grid-x grid-padding-x" }, [
                  _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                    _c("label", { staticClass: "form-label" }, [
                      _vm._v("省份")
                    ]),
                    _vm._v(" "),
                    _c(
                      "select",
                      {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.state,
                            expression: "state"
                          }
                        ],
                        class: { invalid: !_vm.validations.state.is_valid },
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
                            _vm.state = $event.target.multiple
                              ? $$selectedVal
                              : $$selectedVal[0]
                          }
                        }
                      },
                      [
                        _c("option", { attrs: { value: "" } }),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "北京" } }, [
                          _vm._v("北京")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "上海" } }, [
                          _vm._v("上海")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "天津" } }, [
                          _vm._v("天津")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "重庆" } }, [
                          _vm._v("重庆")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "江苏" } }, [
                          _vm._v("江苏")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "浙江" } }, [
                          _vm._v("浙江")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "安徽" } }, [
                          _vm._v("安徽")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "广东" } }, [
                          _vm._v("广东")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "山东" } }, [
                          _vm._v("山东")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "四川" } }, [
                          _vm._v("四川")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "湖北" } }, [
                          _vm._v("湖北")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "湖南" } }, [
                          _vm._v("湖南")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "山西" } }, [
                          _vm._v("山西")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "陕西" } }, [
                          _vm._v("陕西")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "辽宁" } }, [
                          _vm._v("辽宁")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "吉林" } }, [
                          _vm._v("吉林")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "黑龙江" } }, [
                          _vm._v("黑龙江")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "内蒙古" } }, [
                          _vm._v("内蒙古")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "河南" } }, [
                          _vm._v("河南")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "河北" } }, [
                          _vm._v("河北")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "广西" } }, [
                          _vm._v("广西")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "贵州" } }, [
                          _vm._v("贵州")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "云南" } }, [
                          _vm._v("云南")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "西藏" } }, [
                          _vm._v("西藏")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "青海" } }, [
                          _vm._v("青海")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "新疆" } }, [
                          _vm._v("新疆")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "甘肃" } }, [
                          _vm._v("甘肃")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "宁夏" } }, [
                          _vm._v("宁夏")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "江西" } }, [
                          _vm._v("江西")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "海南" } }, [
                          _vm._v("海南")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "福建" } }, [
                          _vm._v("福建")
                        ]),
                        _vm._v(" "),
                        _c("option", { attrs: { value: "台湾" } }, [
                          _vm._v("台湾")
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
                            value: !_vm.validations.state.is_valid,
                            expression: "!validations.state.is_valid"
                          }
                        ],
                        staticClass: "validation"
                      },
                      [
                        _vm._v(
                          _vm._s(_vm.validations.state.text) +
                            "\n                            "
                        )
                      ]
                    )
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                    _c("label", { staticClass: "form-label" }, [
                      _vm._v("邮编")
                    ]),
                    _vm._v(" "),
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.zip,
                          expression: "zip"
                        }
                      ],
                      staticClass: "form-input",
                      class: { invalid: !_vm.validations.zip.is_valid },
                      attrs: { type: "text" },
                      domProps: { value: _vm.zip },
                      on: {
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.zip = $event.target.value
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
                            value: !_vm.validations.zip.is_valid,
                            expression: "!validations.zip.is_valid"
                          }
                        ],
                        staticClass: "validation"
                      },
                      [
                        _vm._v(
                          _vm._s(_vm.validations.zip.text) +
                            "\n                            "
                        )
                      ]
                    )
                  ])
                ])
              ]
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "grid-x grid-padding-x" }, [
            _c(
              "div",
              { staticClass: "large-8 medium-9 small-12 cell centered" },
              [
                _c(
                  "a",
                  {
                    staticClass: "add-location-button",
                    on: {
                      click: function($event) {
                        _vm.submitNewCafe()
                      }
                    }
                  },
                  [_vm._v("添加")]
                )
              ]
            )
          ])
        ])
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
    require("vue-hot-reload-api")      .rerender("data-v-32b4e964", module.exports)
  }
}

/***/ }),

/***/ 91:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(268)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(270)
/* template */
var __vue_template__ = __webpack_require__(271)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-32b4e964"
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
Component.options.__file = "resources/js/pages/NewCafe.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-32b4e964", Component.options)
  } else {
    hotAPI.reload("data-v-32b4e964", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});