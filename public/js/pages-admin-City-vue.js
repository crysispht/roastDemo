webpackJsonp([17],{

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

/***/ 296:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(297);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("3bb213ed", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5bbefcf4\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./City.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5bbefcf4\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./City.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 297:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\na.save-edits {\n  display: inline-block;\n  width: 150px;\n  color: white;\n  background-color: #CCC;\n  text-align: center;\n  border-radius: 5px;\n  margin-top: 20px;\n  height: 45px;\n  line-height: 45px;\n  margin-right: 10px;\n  margin-bottom: 20px;\n}\na.delete-city {\n  display: inline-block;\n  width: 150px;\n  color: white;\n  background-color: #E8635F;\n  text-align: center;\n  border-radius: 5px;\n  margin-top: 20px;\n  height: 45px;\n  line-height: 45px;\n  margin-right: 10px;\n  margin-bottom: 20px;\n}\n", ""]);

// exports


/***/ }),

/***/ 298:
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




/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            name: '',
            state: '',
            country: '',
            latitude: '',
            longitude: '',
            validations: {
                name: true,
                state: true,
                country: true,
                latitude: true,
                longitude: true
            }
        };
    },
    created: function created() {
        this.$store.dispatch('loadAdminCity', { id: this.$route.params.id });
    },


    computed: {
        city: function city() {
            return this.$store.getters.getAdminCity;
        },
        cityLoadStatus: function cityLoadStatus() {
            return this.$store.getters.getAdminCityLoadStatus;
        },
        cityEditStatus: function cityEditStatus() {
            return this.$store.getters.getAdminCityEditStatus;
        },
        cityDeleteStatus: function cityDeleteStatus() {
            return this.$store.getters.getAdminCityDeleteStatus;
        }
    },

    watch: {
        'cityLoadStatus': function cityLoadStatus() {
            this.syncCityToModel();
        },

        'cityDeleteStatus': function cityDeleteStatus() {
            if (this.cityDeleteStatus === 2) {
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: this.name + ' deleted successfully!'
                });
                this.$router.push({ name: 'admin-cities' });
            }
        },

        'cityEditStatus': function cityEditStatus() {
            if (this.cityEditStatus === 2) {
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: this.name + ' updated successfully!'
                });
            }
        }
    },

    methods: {
        syncCityToModel: function syncCityToModel() {
            this.name = this.city.name;
            this.state = this.city.state;
            this.country = this.city.country;
            this.latitude = this.city.latitude;
            this.longitude = this.city.longitude;
        },
        saveEdits: function saveEdits() {
            if (this.validateEditCity()) {
                this.$store.dispatch('updateAdminCity', {
                    id: this.city.id,
                    name: this.name,
                    state: this.state,
                    country: this.country,
                    latitude: this.latitude,
                    longitude: this.longitude
                });
            }
        },
        deleteCity: function deleteCity() {
            this.$store.dispatch('deleteAdminCity', {
                id: this.city.id
            });
        },
        validateEditCity: function validateEditCity() {
            var validEditCityForm = true;
            if (this.name.trim() === '') {
                validEditCityForm = false;
                this.validations.name = false;
            } else {
                this.validations.name = true;
            }
            if (this.state === '') {
                validEditCityForm = false;
                this.validations.state = false;
            } else {
                this.validations.state = true;
            }
            if (this.country === '') {
                validEditCityForm = false;
                this.validations.country = false;
            } else {
                this.validations.country = true;
            }
            if (this.latitude === '') {
                validEditCityForm = false;
                this.validations.latitude = false;
            } else {
                this.validations.latitude = true;
            }
            if (this.longitude === '') {
                validEditCityForm = false;
                this.validations.longitude = false;
            } else {
                this.validations.longitude = true;
            }
            return validEditCityForm;
        }
    }
});

/***/ }),

/***/ 299:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "admin-city" } }, [
    _c(
      "div",
      { staticClass: "grid-container" },
      [
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c(
              "h3",
              { staticClass: "page-header" },
              [
                _c("router-link", { attrs: { to: { name: "admin-cities" } } }, [
                  _vm._v("所有城市")
                ]),
                _vm._v(
                  "\n                    >\n                    " +
                    _vm._s(_vm.city.name) +
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
            _c("label", [_vm._v("名称")]),
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
              [_vm._v("请输入城市名称!")]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("省份")]),
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
                class: { invalid: !_vm.validations.state },
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
                _c("option", { attrs: { value: "北京" } }, [_vm._v("北京")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "上海" } }, [_vm._v("上海")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "天津" } }, [_vm._v("天津")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "重庆" } }, [_vm._v("重庆")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "江苏" } }, [_vm._v("江苏")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "浙江" } }, [_vm._v("浙江")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "安徽" } }, [_vm._v("安徽")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "广东" } }, [_vm._v("广东")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "山东" } }, [_vm._v("山东")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "四川" } }, [_vm._v("四川")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "湖北" } }, [_vm._v("湖北")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "湖南" } }, [_vm._v("湖南")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "山西" } }, [_vm._v("山西")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "陕西" } }, [_vm._v("陕西")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "辽宁" } }, [_vm._v("辽宁")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "吉林" } }, [_vm._v("吉林")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "黑龙江" } }, [
                  _vm._v("黑龙江")
                ]),
                _vm._v(" "),
                _c("option", { attrs: { value: "内蒙古" } }, [
                  _vm._v("内蒙古")
                ]),
                _vm._v(" "),
                _c("option", { attrs: { value: "河南" } }, [_vm._v("河南")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "河北" } }, [_vm._v("河北")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "广西" } }, [_vm._v("广西")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "贵州" } }, [_vm._v("贵州")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "云南" } }, [_vm._v("云南")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "西藏" } }, [_vm._v("西藏")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "青海" } }, [_vm._v("青海")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "新疆" } }, [_vm._v("新疆")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "甘肃" } }, [_vm._v("甘肃")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "宁夏" } }, [_vm._v("宁夏")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "江西" } }, [_vm._v("江西")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "海南" } }, [_vm._v("海南")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "福建" } }, [_vm._v("福建")]),
                _vm._v(" "),
                _c("option", { attrs: { value: "台湾" } }, [_vm._v("台湾")])
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
                    value: !_vm.validations.name,
                    expression: "!validations.name"
                  }
                ],
                staticClass: "validation"
              },
              [_vm._v("请选择城市所在省份!")]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("国家")]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.country,
                  expression: "country"
                }
              ],
              attrs: { type: "text" },
              domProps: { value: _vm.country },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.country = $event.target.value
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
                    value: !_vm.validations.country,
                    expression: "!validations.country"
                  }
                ],
                staticClass: "validation"
              },
              [_vm._v("请输入城市所在国家!")]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("纬度")]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.latitude,
                  expression: "latitude"
                }
              ],
              attrs: { type: "text" },
              domProps: { value: _vm.latitude },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.latitude = $event.target.value
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
                    value: !_vm.validations.latitude,
                    expression: "!validations.latitude"
                  }
                ],
                staticClass: "validation"
              },
              [_vm._v("请输入该城市纬度!")]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-8 medium-12 cell" }, [
            _c("label", [_vm._v("经度")]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.longitude,
                  expression: "longitude"
                }
              ],
              attrs: { type: "text" },
              domProps: { value: _vm.longitude },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.longitude = $event.target.value
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
                    value: !_vm.validations.longitude,
                    expression: "!validations.longitude"
                  }
                ],
                staticClass: "validation"
              },
              [_vm._v("请输入该城市经度!")]
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
              [_vm._v("更新城市")]
            ),
            _vm._v(" "),
            _c(
              "a",
              {
                staticClass: "delete-city",
                on: {
                  click: function($event) {
                    _vm.deleteCity()
                  }
                }
              },
              [_vm._v("删除城市")]
            )
          ])
        ]),
        _vm._v(" "),
        _vm._m(0),
        _vm._v(" "),
        _vm._m(1),
        _vm._v(" "),
        _vm._l(_vm.city.cafes, function(cafe) {
          return _c("div", { staticClass: "grid-x listing" }, [
            _c("div", { staticClass: "large-3 medium-3 cell" }, [
              _vm._v(
                "\n                " +
                  _vm._s(cafe.company.name) +
                  "\n            "
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "large-3 medium-3 cell" }, [
              _vm._v(
                "\n                " +
                  _vm._s(cafe.location_name) +
                  "\n            "
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "large-3 medium-3 cell" }, [
              _vm._v(
                "\n                " + _vm._s(cafe.address) + "\n            "
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
                        params: { id: cafe.company.id, cafeID: cafe.id }
                      }
                    }
                  },
                  [_vm._v("编辑\n                ")]
                )
              ],
              1
            )
          ])
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
    return _c("div", { staticClass: "grid-x" }, [
      _c("div", { staticClass: "large-8 medium-12 cell" }, [
        _c("h3", { staticClass: "page-header" }, [
          _vm._v("该城市中的所有咖啡店")
        ])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "grid-x list-header" }, [
      _c("div", { staticClass: "large-3 medium-3 cell" }, [
        _vm._v("\n                公司\n            ")
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "large-3 medium-3 cell" }, [
        _vm._v("\n                咖啡店\n            ")
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "large-3 medium-3 cell" }, [
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
    require("vue-hot-reload-api")      .rerender("data-v-5bbefcf4", module.exports)
  }
}

/***/ }),

/***/ 98:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(296)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(298)
/* template */
var __vue_template__ = __webpack_require__(299)
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
Component.options.__file = "resources/js/pages/admin/City.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5bbefcf4", Component.options)
  } else {
    hotAPI.reload("data-v-5bbefcf4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});