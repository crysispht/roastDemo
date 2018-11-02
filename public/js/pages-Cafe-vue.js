webpackJsonp([5,13,35,38],{

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

/***/ 192:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(193);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("b64a3fd8", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-24d5a19c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./IndividualCafeMap.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-24d5a19c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./IndividualCafeMap.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 193:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#individual-cafe-map {\n  width: 700px;\n  height: 500px;\n  margin: auto;\n  margin-bottom: 200px;\n}\n", ""]);

// exports


/***/ }),

/***/ 194:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(2);
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    computed: {
        cafeLoadStatus: function cafeLoadStatus() {
            return this.$store.getters.getCafeLoadStatus;
        },
        cafe: function cafe() {
            return this.$store.getters.getCafe;
        }
    },
    watch: {
        cafeLoadStatus: function cafeLoadStatus() {
            if (this.cafeLoadStatus === 2) {
                this.displayIndividualCafeMap();
            }
        }
    },
    methods: {
        displayIndividualCafeMap: function displayIndividualCafeMap() {
            this.map = new AMap.Map('individual-cafe-map', {
                center: [parseFloat(this.cafe.latitude), parseFloat(this.cafe.longitude)],
                zoom: 13
            });
            var image = __WEBPACK_IMPORTED_MODULE_0__config__["a" /* ROAST_CONFIG */].APP_URL + '/svg/coffee-marker.svg';
            var icon = new AMap.Icon({
                image: image, // Icon的图像
                imageSize: new AMap.Size(19, 33)
            });
            var marker = new AMap.Marker({
                position: new AMap.LngLat(parseFloat(this.cafe.latitude), parseFloat(this.cafe.longitude)),
                icon: icon
            });

            this.map.add(marker);
        }
    }
});

/***/ }),

/***/ 195:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "individual-cafe-map" } })
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-24d5a19c", module.exports)
  }
}

/***/ }),

/***/ 204:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(205);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("2c06d192", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-0b0c8eaf\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ToggleLike.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-0b0c8eaf\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ToggleLike.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 205:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\nspan.toggle-like span.like-toggle {\n  display: inline-block;\n  cursor: pointer;\n  color: #8E8E8E;\n  font-size: 18px;\n  margin-bottom: 5px;\n}\nspan.toggle-like span.like-toggle span.image-container {\n    width: 35px;\n    text-align: center;\n    display: inline-block;\n}\nspan.toggle-like span.like-count {\n  font-family: \"Lato\", sans-serif;\n  font-size: 12px;\n  margin-left: 10px;\n  color: #8E8E8E;\n}\n", ""]);

// exports


/***/ }),

/***/ 206:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
        Loader: __WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue___default.a
    },
    computed: {
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        },
        user: function user() {
            return this.$store.getters.getUser;
        },
        cafeLoadStatus: function cafeLoadStatus() {
            return this.$store.getters.getCafeLoadStatus;
        },
        cafe: function cafe() {
            return this.$store.getters.getCafe;
        },
        liked: function liked() {
            return this.$store.getters.getCafeLikedStatus;
        },
        cafeLikeActionStatus: function cafeLikeActionStatus() {
            return this.$store.getters.getCafeLikeActionStatus;
        },
        cafeUnlikeActionStatus: function cafeUnlikeActionStatus() {
            return this.$store.getters.getCafeUnlikeActionStatus;
        }
    },
    methods: {
        likeCafe: function likeCafe(cafeID) {
            this.$store.dispatch('likeCafe', {
                id: this.cafe.id
            });
        },
        unlikeCafe: function unlikeCafe(cafeID) {
            this.$store.dispatch('unlikeCafe', {
                id: this.cafe.id
            });
        }
    }
});

/***/ }),

/***/ 207:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "span",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.userLoadStatus === 2 && _vm.user != "",
          expression: "userLoadStatus === 2 && user != ''"
        }
      ],
      staticClass: "toggle-like"
    },
    [
      !_vm.liked &&
      _vm.cafeLoadStatus === 2 &&
      _vm.cafeLikeActionStatus !== 1 &&
      _vm.cafeUnlikeActionStatus !== 1
        ? _c(
            "span",
            {
              staticClass: "like like-toggle",
              on: {
                click: function($event) {
                  _vm.likeCafe(_vm.cafe.id)
                }
              }
            },
            [_vm._m(0), _vm._v(" 喜欢?\n  ")]
          )
        : _vm._e(),
      _vm._v(" "),
      _vm.liked &&
      _vm.cafeLoadStatus === 2 &&
      _vm.cafeLikeActionStatus !== 1 &&
      _vm.cafeUnlikeActionStatus !== 1
        ? _c(
            "span",
            {
              staticClass: "un-like like-toggle",
              on: {
                click: function($event) {
                  _vm.unlikeCafe(_vm.cafe.id)
                }
              }
            },
            [_vm._m(1), _vm._v(" 已喜欢\n  ")]
          )
        : _vm._e(),
      _vm._v(" "),
      _c("loader", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value:
              _vm.cafeLikeActionStatus === 1 ||
              _vm.cafeUnlikeActionStatus === 1 ||
              _vm.cafeLoadStatus !== 2,
            expression:
              "cafeLikeActionStatus === 1 || cafeUnlikeActionStatus === 1 || cafeLoadStatus !== 2"
          }
        ],
        attrs: { width: 23, height: 23, display: "inline-block" }
      }),
      _vm._v(" "),
      _c("span", { staticClass: "like-count" }, [
        _vm._v("\n    " + _vm._s(_vm.cafe.likes_count) + " likes\n  ")
      ])
    ],
    1
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "image-container" }, [
      _c("img", { attrs: { src: "/storage/img/unliked.svg" } })
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "image-container" }, [
      _c("img", { attrs: { src: "/storage/img/liked.svg" } })
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-0b0c8eaf", module.exports)
  }
}

/***/ }),

/***/ 248:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(249);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("ccf8fc98", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a3a3e3b4\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Cafe.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a3a3e3b4\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Cafe.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 249:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv#cafe-page {\n  position: absolute;\n  right: 30px;\n  top: 125px;\n  background: #FFFFFF;\n  -webkit-box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.1);\n          box-shadow: 0 2px 4px 0 rgba(3, 27, 78, 0.1);\n  width: 100%;\n  max-width: 480px;\n  padding: 20px;\n  padding-top: 10px;\n}\ndiv#cafe-page img.close-icon {\n    float: right;\n    cursor: pointer;\n    margin-top: 10px;\n}\ndiv#cafe-page h2.cafe-title {\n    color: #342C0C;\n    font-size: 36px;\n    line-height: 44px;\n    font-family: \"Lato\", sans-serif;\n    font-weight: bolder;\n}\ndiv#cafe-page span.location-number {\n    display: inline-block;\n    color: #8E8E8E;\n    font-size: 18px;\n}\ndiv#cafe-page span.location-number span.location-image-container {\n      width: 35px;\n      text-align: center;\n      display: inline-block;\n}\ndiv#cafe-page label.cafe-label {\n    font-family: \"Lato\", sans-serif;\n    text-transform: uppercase;\n    font-weight: bold;\n    color: black;\n    margin-top: 20px;\n    margin-bottom: 10px;\n}\ndiv#cafe-page div.address-container {\n    color: #666666;\n    font-size: 18px;\n    line-height: 23px;\n    font-family: \"Lato\", sans-serif;\n    margin-bottom: 5px;\n}\ndiv#cafe-page div.address-container span.address {\n      display: block;\n}\ndiv#cafe-page div.address-container span.city-state {\n      display: block;\n}\ndiv#cafe-page div.address-container span.zip {\n      display: block;\n}\ndiv#cafe-page a.cafe-website {\n    font-family: \"Lato\", sans-serif;\n    color: #543729;\n    font-size: 18px;\n}\ndiv#cafe-page img.social-icon {\n    margin-top: 10px;\n    margin-right: 10px;\n}\ndiv#cafe-page a.suggest-cafe-edit {\n    font-family: \"Lato\", sans-serif;\n    color: #054E7A;\n    font-size: 14px;\n    display: inline-block;\n    margin-top: 30px;\n    text-decoration: underline;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv#cafe-page {\n    position: fixed;\n    right: 0px;\n    left: 0px;\n    top: 0px;\n    bottom: 0px;\n    z-index: 99999;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 250:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_cafes_IndividualCafeMap_vue__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_cafes_IndividualCafeMap_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_cafes_IndividualCafeMap_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_cafes_ToggleLike_vue__ = __webpack_require__(78);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_cafes_ToggleLike_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_cafes_ToggleLike_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__event_bus_js__ = __webpack_require__(106);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    // 定义页面使用的组件
    components: {
        Loader: __WEBPACK_IMPORTED_MODULE_0__components_global_Loader_vue___default.a,
        IndividualCafeMap: __WEBPACK_IMPORTED_MODULE_1__components_cafes_IndividualCafeMap_vue___default.a,
        ToggleLike: __WEBPACK_IMPORTED_MODULE_2__components_cafes_ToggleLike_vue___default.a
    },

    // 页面创建时通过路由中的参数ID加载咖啡店数据
    created: function created() {
        this.$store.dispatch('toggleShowFilters', { showFilters: false });
        this.$store.dispatch('changeCafesView', 'map');
        this.$store.dispatch('loadCafe', {
            id: this.$route.params.id
        });
    },


    // 定义计算属性
    watch: {
        '$route.params.id': function $routeParamsId() {
            this.$store.dispatch('clearLikeAndUnlikeStatus');
            this.$store.dispatch('loadCafe', {
                id: this.$route.params.id
            });
        },
        cafeLoadStatus: function cafeLoadStatus() {
            if (this.cafeLoadStatus === 2) {
                __WEBPACK_IMPORTED_MODULE_3__event_bus_js__["a" /* EventBus */].$emit('location-selected', {
                    lat: parseFloat(this.cafe.latitude),
                    lng: parseFloat(this.cafe.longitude)
                });
            }

            if (this.cafeLoadStatus === 3) {
                __WEBPACK_IMPORTED_MODULE_3__event_bus_js__["a" /* EventBus */].$emit('show-error', { notification: 'Cafe Not Found!' });
                this.$router.push({ name: 'cafes' });
            }
        }
    },

    computed: {
        cities: function cities() {
            return this.$store.getters.getCities;
        },
        cityFilter: function cityFilter() {
            return this.$store.getters.getCityFilter;
        },
        cafeLoadStatus: function cafeLoadStatus() {
            return this.$store.getters.getCafeLoadStatus;
        },
        cafeLikeActionStatus: function cafeLikeActionStatus() {
            return this.$store.getters.getCafeLikeActionStatus;
        },
        cafeUnlikeActionStatus: function cafeUnlikeActionStatus() {
            return this.$store.getters.getCafeUnlikeActionStatus;
        },
        cafe: function cafe() {
            return this.$store.getters.getCafe;
        },
        user: function user() {
            return this.$store.getters.getUser;
        },
        userLoadStatus: function userLoadStatus() {
            return this.$store.getters.getUserLoadStatus();
        }
    },

    methods: {
        loginToEdit: function loginToEdit() {
            __WEBPACK_IMPORTED_MODULE_3__event_bus_js__["a" /* EventBus */].$emit('prompt-login');
        },
        leaveCafe: function leaveCafe() {
            if (this.cityFilter !== '') {
                var slug = '';
                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].id === this.cityFilter) {
                        slug = this.cities[i].slug;
                    }
                }
                this.$router.push({ name: 'city', params: { slug: slug } });
            } else {
                this.$router.push({ name: 'cafes' });
            }
        }
    }
});

/***/ }),

/***/ 251:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.cafeLoadStatus === 2 ||
    (_vm.cafeLoadStatus !== 2 &&
      (_vm.cafeLikeActionStatus === 1 ||
        _vm.cafeLikeActionStatus === 2 ||
        _vm.cafeUnlikeActionStatus === 1 ||
        _vm.cafeUnlikeActionStatus === 2))
    ? _c("div", { attrs: { id: "cafe-page" } }, [
        _c(
          "a",
          {
            on: {
              click: function($event) {
                _vm.leaveCafe()
              }
            }
          },
          [
            _c("img", {
              staticClass: "close-icon",
              attrs: { src: "/storage/img/close-icon.svg" }
            })
          ]
        ),
        _vm._v(" "),
        _c("h2", { staticClass: "cafe-title" }, [
          _vm._v(_vm._s(_vm.cafe.company.name))
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c(
            "div",
            { staticClass: "large-12 medium-12 small-12 cell" },
            [_c("toggle-like")],
            1
          )
        ]),
        _vm._v(" "),
        _vm.cafe.company.cafes_count > 1
          ? _c("div", { staticClass: "grid-x" }, [
              _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                _c("span", { staticClass: "location-number" }, [
                  _vm._m(0),
                  _vm._v(
                    " " +
                      _vm._s(_vm.cafe.company.cafes_count) +
                      " other locations\n    "
                  )
                ])
              ])
            ])
          : _vm._e(),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
            _c("label", { staticClass: "cafe-label" }, [_vm._v("类型")]),
            _vm._v(" "),
            _vm.cafe.company.roaster === 1
              ? _c("div", { staticClass: "location-type roaster" }, [
                  _c("img", {
                    attrs: { src: "/storage/img/roaster-logo.svg" }
                  }),
                  _vm._v(" Roaster\n            ")
                ])
              : _vm._e(),
            _vm._v(" "),
            _vm.cafe.company.roaster === 0
              ? _c("div", { staticClass: "location-type cafe" }, [
                  _c("img", { attrs: { src: "/storage/img/cafe-logo.svg" } }),
                  _vm._v(" Cafe\n            ")
                ])
              : _vm._e()
          ])
        ]),
        _vm._v(" "),
        _vm.cafe.company.subscription === 1
          ? _c("div", { staticClass: "grid-x" }, [_vm._m(1)])
          : _vm._e(),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c(
            "div",
            { staticClass: "large-12 medium-12 small-12 cell" },
            [
              _c("label", { staticClass: "cafe-label" }, [_vm._v("冲泡方法")]),
              _vm._v(" "),
              _vm._l(_vm.cafe.brew_methods, function(method) {
                return _c("div", { staticClass: "brew-method option" }, [
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
                ])
              })
            ],
            2
          )
        ]),
        _vm._v(" "),
        _vm.cafe.matcha === 1 || _vm.cafe.tea === 1
          ? _c("div", { staticClass: "grid-x" }, [
              _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                _c("label", { staticClass: "cafe-label" }, [
                  _vm._v("Drink Options")
                ]),
                _vm._v(" "),
                _vm.cafe.matcha === 1
                  ? _c("div", { staticClass: "drink-option option" }, [
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
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _vm.cafe.tea === 1
                  ? _c("div", { staticClass: "drink-option option" }, [
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
                    ])
                  : _vm._e()
              ])
            ])
          : _vm._e(),
        _vm._v(" "),
        _c("div", { staticClass: "grid-x" }, [
          _c(
            "div",
            { staticClass: "large-12 medium-12 small-12 cell" },
            [
              _c("label", { staticClass: "cafe-label" }, [_vm._v("位置信息")]),
              _vm._v(" "),
              _c("div", { staticClass: "address-container" }, [
                _c("span", { staticClass: "address" }, [
                  _vm._v(_vm._s(_vm.cafe.address))
                ]),
                _vm._v(" "),
                _c("span", { staticClass: "city-state" }, [
                  _vm._v(_vm._s(_vm.cafe.city) + ", " + _vm._s(_vm.cafe.state))
                ]),
                _vm._v(" "),
                _c("span", { staticClass: "zip" }, [
                  _vm._v(_vm._s(_vm.cafe.zip))
                ])
              ]),
              _vm._v(" "),
              _c(
                "a",
                {
                  staticClass: "cafe-website",
                  attrs: { target: "_blank", href: _vm.cafe.company.website }
                },
                [_vm._v(_vm._s(_vm.cafe.company.website))]
              ),
              _vm._v(" "),
              _c("br"),
              _vm._v(" "),
              _c(
                "router-link",
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: _vm.userLoadStatus === 2 && _vm.user != "",
                      expression: "userLoadStatus === 2 && user != ''"
                    }
                  ],
                  staticClass: "suggest-cafe-edit",
                  attrs: {
                    to: { name: "editcafe", params: { slug: _vm.cafe.slug } }
                  }
                },
                [_vm._v("\n                编辑\n            ")]
              ),
              _vm._v(" "),
              _vm.userLoadStatus === 2 && _vm.user == ""
                ? _c(
                    "a",
                    {
                      staticClass: "suggest-cafe-edit",
                      on: {
                        click: function($event) {
                          _vm.loginToEdit()
                        }
                      }
                    },
                    [_vm._v("\n                登录后编辑\n            ")]
                  )
                : _vm._e()
            ],
            1
          )
        ])
      ])
    : _vm._e()
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "location-image-container" }, [
      _c("img", { attrs: { src: "/storage/img/location.svg" } })
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c(
      "div",
      { staticClass: "large-12 medium-12 small-12 cell centered" },
      [
        _c("label", { staticClass: "cafe-label" }, [_vm._v("提供咖啡订购")]),
        _vm._v(" "),
        _c("div", { staticClass: "subscription-option option" }, [
          _c("div", { staticClass: "option-container" }, [
            _c("img", {
              staticClass: "option-icon",
              attrs: { src: "/storage/img/coffee-pack.svg" }
            }),
            _vm._v(" "),
            _c("span", { staticClass: "option-name" }, [_vm._v("咖啡订购")])
          ])
        ])
      ]
    )
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-a3a3e3b4", module.exports)
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

/***/ 75:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(192)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(194)
/* template */
var __vue_template__ = __webpack_require__(195)
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
Component.options.__file = "resources/js/components/cafes/IndividualCafeMap.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-24d5a19c", Component.options)
  } else {
    hotAPI.reload("data-v-24d5a19c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 78:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(204)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(206)
/* template */
var __vue_template__ = __webpack_require__(207)
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
Component.options.__file = "resources/js/components/cafes/ToggleLike.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0b0c8eaf", Component.options)
  } else {
    hotAPI.reload("data-v-0b0c8eaf", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 86:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(248)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(250)
/* template */
var __vue_template__ = __webpack_require__(251)
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
Component.options.__file = "resources/js/pages/Cafe.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a3a3e3b4", Component.options)
  } else {
    hotAPI.reload("data-v-a3a3e3b4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});