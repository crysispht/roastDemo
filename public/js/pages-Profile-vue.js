webpackJsonp([10,35],{

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

/***/ 115:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(116);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("645ad134", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-e42e3f38\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Loader.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-e42e3f38\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Loader.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 116:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.loader {\n  margin: auto;\n  vertical-align: middle;\n}\nsvg path,\nsvg rect {\n  fill: #FFBE54;\n}\n", ""]);

// exports


/***/ }),

/***/ 117:
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

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        'width': Number,
        'height': Number,
        'display': {
            default: 'block'
        }
    }
});

/***/ }),

/***/ 118:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "loader loader--style3",
      style:
        "width: " +
        _vm.width +
        "px; height: " +
        _vm.height +
        "px; display: " +
        _vm.display +
        "",
      attrs: { title: "2" }
    },
    [
      _c(
        "svg",
        {
          staticStyle: { "enable-background": "new 0 0 50 50" },
          attrs: {
            version: "1.1",
            id: "loader-1",
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            x: "0px",
            y: "0px",
            width: _vm.width + "px",
            height: _vm.height + "px",
            viewBox: "0 0 50 50",
            "xml:space": "preserve"
          }
        },
        [
          _c(
            "path",
            {
              attrs: {
                fill: "#000",
                d:
                  "M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
              }
            },
            [
              _c("animateTransform", {
                attrs: {
                  attributeType: "xml",
                  attributeName: "transform",
                  type: "rotate",
                  from: "0 25 25",
                  to: "360 25 25",
                  dur: "0.6s",
                  repeatCount: "indefinite"
                }
              })
            ],
            1
          )
        ]
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
    require("vue-hot-reload-api")      .rerender("data-v-e42e3f38", module.exports)
  }
}

/***/ }),

/***/ 272:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(273);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("1920efea", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-074da5b0\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Profile.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-074da5b0\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Profile.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 273:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#profile-page {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background-color: white;\n  z-index: 99999;\n  overflow: auto;\n}\ndiv#profile-page img#back {\n    float: right;\n    margin-top: 20px;\n    margin-right: 20px;\n}\ndiv#profile-page div.centered {\n    margin: auto;\n}\ndiv#profile-page h2.page-title {\n    color: #342C0C;\n    font-size: 36px;\n    font-weight: 900;\n    font-family: \"Lato\", sans-serif;\n    margin-top: 60px;\n}\ndiv#profile-page label.form-label {\n    font-family: \"Lato\", sans-serif;\n    text-transform: uppercase;\n    font-weight: bold;\n    color: black;\n    margin-top: 10px;\n    margin-bottom: 10px;\n}\ndiv#profile-page a.update-profile-button {\n    display: block;\n    text-align: center;\n    height: 50px;\n    color: white;\n    border-radius: 3px;\n    font-size: 18px;\n    font-family: \"Lato\", sans-serif;\n    background-color: #A7BE4D;\n    line-height: 50px;\n    margin-bottom: 50px;\n}\n", ""]);

// exports


/***/ }),

/***/ 274:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_bus_js__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_global_Loader_vue__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_global_Loader_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_global_Loader_vue__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
        Loader: __WEBPACK_IMPORTED_MODULE_1__components_global_Loader_vue___default.a
    },
    data: function data() {
        return {
            favorite_coffee: '',
            flavor_notes: '',
            profile_visibility: 0,
            city: '',
            state: ''
        };
    },

    watch: {
        'userLoadStatus': function userLoadStatus() {
            if (this.userLoadStatus === 2) {
                this.setFields();
            }
        },

        'userUpdateStatus': function userUpdateStatus() {
            if (this.userUpdateStatus === 2) {
                __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$emit('show-success', {
                    notification: '个人信息更新成功!'
                });
            }
        }
    },
    created: function created() {
        if (this.userLoadStatus === 2) {
            this.setFields();
        }
    },

    computed: {
        user: function user() {
            return this.$store.getters.getUser;
        },
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        },
        userUpdateStatus: function userUpdateStatus() {
            return this.$store.getters.getUserUpdateStatus;
        }
    },
    methods: {
        setFields: function setFields() {
            this.profile_visibility = this.user.profile_visibility;
            this.favorite_coffee = this.user.favorite_coffee;
            this.flavor_notes = this.user.flavor_notes;
            this.city = this.user.city;
            this.state = this.user.state;
        },
        updateProfile: function updateProfile() {
            if (this.validateProfile()) {
                this.$store.dispatch('editUser', {
                    profile_visibility: this.profile_visibility,
                    favorite_coffee: this.favorite_coffee,
                    flavor_notes: this.flavor_notes,
                    city: this.city,
                    state: this.state
                });
            }
        },
        validateProfile: function validateProfile() {
            return true;
        }
    }
});

/***/ }),

/***/ 275:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("transition", { attrs: { name: "scale-in-center" } }, [
    _c(
      "div",
      { attrs: { id: "profile-page" } },
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
              [_c("h2", { staticClass: "page-title" }, [_vm._v("个人信息")])]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-container" }, [
          _c(
            "div",
            { staticClass: "grid-x grid-padding-x" },
            [
              _c("loader", {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.userLoadStatus === 1,
                    expression: "userLoadStatus === 1"
                  }
                ],
                attrs: { width: 100, height: 100 }
              })
            ],
            1
          )
        ]),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.userLoadStatus === 2,
                expression: "userLoadStatus === 2"
              }
            ],
            staticClass: "grid-container"
          },
          [
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c(
                "div",
                { staticClass: "large-8 medium-10 small-12 cell centered" },
                [
                  _c("label", { staticClass: "form-label" }, [
                    _vm._v("最喜欢的咖啡")
                  ]),
                  _vm._v(" "),
                  _c("textarea", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.favorite_coffee,
                        expression: "favorite_coffee"
                      }
                    ],
                    domProps: { value: _vm.favorite_coffee },
                    on: {
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.favorite_coffee = $event.target.value
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
                { staticClass: "large-8 medium-10 small-12 cell centered" },
                [
                  _c("label", { staticClass: "form-label" }, [
                    _vm._v("口味记录")
                  ]),
                  _vm._v(" "),
                  _c("textarea", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.flavor_notes,
                        expression: "flavor_notes"
                      }
                    ],
                    domProps: { value: _vm.flavor_notes },
                    on: {
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.flavor_notes = $event.target.value
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
                { staticClass: "large-8 medium-10 small-12 cell centered" },
                [
                  _c("label", { staticClass: "form-label" }, [
                    _vm._v("是否公开")
                  ]),
                  _vm._v(" "),
                  _c(
                    "select",
                    {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.profile_visibility,
                          expression: "profile_visibility"
                        }
                      ],
                      attrs: { id: "public-visibility" },
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
                          _vm.profile_visibility = $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0]
                        }
                      }
                    },
                    [
                      _c("option", { attrs: { value: "0" } }, [
                        _vm._v("仅自己可见")
                      ]),
                      _vm._v(" "),
                      _c("option", { attrs: { value: "1" } }, [
                        _vm._v("所有人可见")
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
                { staticClass: "large-8 medium-10 small-12 cell centered" },
                [
                  _c("label", { staticClass: "form-label" }, [
                    _vm._v("所在城市")
                  ]),
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
                  })
                ]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c(
                "div",
                { staticClass: "large-8 medium-10 small-12 cell centered" },
                [
                  _c("label", { staticClass: "form-label" }, [
                    _vm._v("所在省份")
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
                  )
                ]
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c(
                "div",
                { staticClass: "large-8 medium-10 small-12 cell centered" },
                [
                  _c(
                    "a",
                    {
                      staticClass: "update-profile-button",
                      on: {
                        click: function($event) {
                          _vm.updateProfile()
                        }
                      }
                    },
                    [_vm._v("更新")]
                  )
                ]
              )
            ])
          ]
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
    require("vue-hot-reload-api")      .rerender("data-v-074da5b0", module.exports)
  }
}

/***/ }),

/***/ 56:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(115)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(117)
/* template */
var __vue_template__ = __webpack_require__(118)
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
Component.options.__file = "resources/js/components/global/Loader.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-e42e3f38", Component.options)
  } else {
    hotAPI.reload("data-v-e42e3f38", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 92:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(272)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(274)
/* template */
var __vue_template__ = __webpack_require__(275)
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
Component.options.__file = "resources/js/pages/Profile.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-074da5b0", Component.options)
  } else {
    hotAPI.reload("data-v-074da5b0", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});