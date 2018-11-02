webpackJsonp([32],{

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

/***/ 135:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(136);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("12e22f90", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-61843689\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ListFilters.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-61843689\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./ListFilters.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 136:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.list-filters-container {\n  border-bottom: 1px solid #BABABA;\n  margin-bottom: 30px;\n  padding-bottom: 20px;\n  padding-top: 20px;\n}\ndiv.list-filters-container span.clear-filters {\n    font-size: 16px;\n    color: #054E7A;\n    font-family: \"Lato\", sans-serif;\n    cursor: pointer;\n    display: block;\n    float: left;\n    margin-bottom: 20px;\n    display: none;\n}\ndiv.list-filters-container span.clear-filters img {\n      margin-right: 10px;\n      float: left;\n      margin-top: 6px;\n}\ndiv.list-filters-container span.filters-header {\n    display: block;\n    font-family: \"Lato\", sans-serif;\n    font-weight: bold;\n    margin-bottom: 10px;\n}\ndiv.list-filters-container input[type=\"text\"].search {\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    border-radius: 3px;\n    color: #BABABA;\n    font-size: 16px;\n    font-family: \"Lato\", sans-serif;\n    background-image: url(\"/storage/img/search-icon.svg\");\n    background-repeat: no-repeat;\n    background-position: 6px;\n    padding-left: 35px;\n    padding-top: 5px;\n    padding-bottom: 5px;\n}\ndiv.list-filters-container label.filter-label {\n    font-family: \"Lato\", sans-serif;\n    text-transform: uppercase;\n    font-weight: bold;\n    color: black;\n    margin-top: 20px;\n    margin-bottom: 10px;\n}\ndiv.list-filters-container div.location-filter {\n    text-align: center;\n    font-family: \"Lato\", sans-serif;\n    font-size: 16px;\n    color: #FFBE54;\n    border-bottom: 1px solid #FFBE54;\n    border-top: 1px solid #FFBE54;\n    border-left: 1px solid #FFBE54;\n    border-right: 1px solid #FFBE54;\n    width: 33%;\n    display: inline-block;\n    height: 55px;\n    line-height: 55px;\n    cursor: pointer;\n    margin-bottom: 5px;\n}\ndiv.list-filters-container div.location-filter.active {\n      color: white;\n      background-color: #FFBE54;\n}\ndiv.list-filters-container div.location-filter.all-locations {\n      border-top-left-radius: 3px;\n      border-bottom-left-radius: 3px;\n}\ndiv.list-filters-container div.location-filter.roasters {\n      border-left: none;\n      border-right: none;\n}\ndiv.list-filters-container div.location-filter.cafes {\n      border-top-right-radius: 3px;\n      border-bottom-right-radius: 3px;\n}\ndiv.list-filters-container span.order-direction {\n    cursor: pointer;\n    display: inline-block;\n    padding: 5px 20px;\n    background-color: white;\n    font-family: \"Lato\", sans-serif;\n    text-align: center;\n    border: 1px solid #FFBE54;\n    color: #FFBE54;\n}\ndiv.list-filters-container span.order-direction.asc {\n      border-top-left-radius: 5px;\n      border-bottom-left-radius: 5px;\n}\ndiv.list-filters-container span.order-direction.asc.active {\n        color: white;\n        background-color: #FFBE54;\n}\ndiv.list-filters-container span.order-direction.desc {\n      border-top-right-radius: 5px;\n      border-bottom-right-radius: 5px;\n}\ndiv.list-filters-container span.order-direction.desc.active {\n        color: white;\n        background-color: #FFBE54;\n}\n\n/* Small only */\n@media screen and (max-width: 39.9375em) {\ndiv.list-filters-container span.clear-filters {\n    display: block;\n}\ndiv.list-filters-container div.close-filters {\n    display: none;\n}\n}\n\n/* Medium only */\n/* Large only */\n", ""]);

// exports


/***/ }),

/***/ 137:
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



/* harmony default export */ __webpack_exports__["default"] = ({
    mounted: function mounted() {

        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('show-filters', function () {
            this.show = true;
        }.bind(this));

        __WEBPACK_IMPORTED_MODULE_0__event_bus_js__["a" /* EventBus */].$on('clear-filters', function () {
            this.clearFilters();
        }.bind(this));
    },


    watch: {

        'cityFilter': function cityFilter() {

            if (this.cityFilter !== '') {
                var id = '';

                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].id === this.cityFilter) {
                        id = this.cities[i].id;
                    }
                }
                if (id === '') {
                    this.$router.push({ name: 'cafes' });
                } else {
                    this.$router.push({ name: 'city', params: { id: id } });
                }
            } else {
                this.$router.push({ name: 'cafes' });
            }
        },

        'citiesLoadStatus': function citiesLoadStatus() {

            if (this.citiesLoadStatus === 2 && this.$route.name === 'city') {
                var id = '';
                for (var i = 0; i < this.cities.length; i++) {
                    if (this.cities[i].id === this.$route.params.id) {
                        this.cityFilter = this.cities[i].id;
                    }
                }
            }
        }
    },

    computed: {
        showFilters: function showFilters() {
            return this.$store.getters.getShowFilters;
        },
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
        },


        orderBy: {
            set: function set(orderBy) {
                this.$store.dispatch('updateOrderBy', orderBy);
            },
            get: function get() {
                return this.$store.getters.getOrderBy;
            }
        },

        orderDirection: function orderDirection() {
            return this.$store.getters.getOrderDirection;
        }
    },

    methods: {
        setActiveLocationFilter: function setActiveLocationFilter(filter) {
            this.$store.dispatch('updateActiveLocationFilter', filter);
        },
        toggleBrewMethodFilter: function toggleBrewMethodFilter(id) {
            var localBrewMethodsFilter = this.brewMethodsFilter;
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
        },
        setOrderDirection: function setOrderDirection(direction) {
            this.$store.dispatch('updateOrderDirection', direction);
        }
    }
});

/***/ }),

/***/ 138:
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
            value: _vm.showFilters && _vm.cafesView === "list",
            expression: "showFilters && cafesView === 'list'"
          }
        ],
        staticClass: "large-12 medium-12 small-12 cell list-filters-container"
      },
      [
        _c("div", { staticClass: "grid-x cafe-grid-container" }, [
          _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                _c("label", { staticClass: "filter-label" }, [_vm._v("城市")]),
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
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
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
                    _vm._v(" 清除过滤器\n          ")
                  ]
                ),
                _vm._v(" "),
                _c("div", { staticClass: "grid-x grid-padding-x" }, [
                  _c(
                    "div",
                    { staticClass: "large-12 medium-12 small-12 cell" },
                    [
                      _c("label", { staticClass: "filter-label" }, [
                        _vm._v("通过名称或位置搜索")
                      ])
                    ]
                  )
                ]),
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
                  attrs: { type: "text", placeholder: "通过名称或位置搜索" },
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
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c("div", { attrs: { id: "location-type-container" } }, [
                  _c("div", { staticClass: "grid-x grid-padding-x" }, [
                    _c(
                      "div",
                      { staticClass: "large-12 medium-12 small-12 cell" },
                      [
                        _c("label", { staticClass: "filter-label" }, [
                          _vm._v("咖啡店类型")
                        ])
                      ]
                    )
                  ]),
                  _vm._v(" "),
                  _c("div", { staticClass: "grid-x grid-padding-x" }, [
                    _c(
                      "div",
                      { staticClass: "large-12 medium-12 small-12 cell" },
                      [
                        _c(
                          "div",
                          {
                            staticClass: "location-filter all-locations",
                            class: {
                              active: _vm.activeLocationFilter === "all"
                            },
                            on: {
                              click: function($event) {
                                _vm.setActiveLocationFilter("all")
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                        所有类型\n                                    "
                            )
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "location-filter roasters",
                            class: {
                              active: _vm.activeLocationFilter === "roasters"
                            },
                            on: {
                              click: function($event) {
                                _vm.setActiveLocationFilter("roasters")
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                        烘焙店\n                                    "
                            )
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "location-filter cafes",
                            class: {
                              active: _vm.activeLocationFilter === "cafes"
                            },
                            on: {
                              click: function($event) {
                                _vm.setActiveLocationFilter("cafes")
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                        咖啡店\n                                    "
                            )
                          ]
                        )
                      ]
                    )
                  ])
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
            _c("div", { staticClass: "grid-x grid-padding-x" }, [
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c("label", { staticClass: "filter-label" }, [_vm._v("排序")]),
                _vm._v(" "),
                _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.orderBy,
                        expression: "orderBy"
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
                        _vm.orderBy = $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      }
                    }
                  },
                  [
                    _c("option", { attrs: { value: "name" } }, [
                      _vm._v("名称")
                    ]),
                    _vm._v(" "),
                    _c("option", { attrs: { value: "most-liked" } }, [
                      _vm._v("最多喜欢")
                    ])
                  ]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                _c("label", { staticClass: "filter-label" }, [_vm._v("顺序")]),
                _vm._v(" "),
                _c(
                  "span",
                  {
                    staticClass: "asc order-direction",
                    class: { active: _vm.orderDirection === "asc" },
                    on: {
                      click: function($event) {
                        _vm.setOrderDirection("asc")
                      }
                    }
                  },
                  [_vm._v("升序")]
                ),
                _vm._v(" "),
                _c(
                  "span",
                  {
                    staticClass: "desc order-direction",
                    class: { active: _vm.orderDirection === "desc" },
                    on: {
                      click: function($event) {
                        _vm.setOrderDirection("desc")
                      }
                    }
                  },
                  [_vm._v("降序")]
                )
              ])
            ]),
            _vm._v(" "),
            _c("div", { attrs: { id: "brew-methods-container" } }, [
              _c("div", { staticClass: "grid-x grid-padding-x" }, [
                _c("div", { staticClass: "large-12 medium-12 small-12 cell" }, [
                  _c("label", { staticClass: "filter-label" }, [
                    _vm._v("冲泡方法")
                  ])
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
                              active:
                                _vm.brewMethodsFilter.indexOf(method.id) >= 0
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
                _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
                  _c("label", { staticClass: "filter-label" }, [
                    _vm._v("饮料选项")
                  ]),
                  _vm._v(" "),
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
                        _c("span", { staticClass: "option-name" }, [
                          _vm._v("茶包")
                        ])
                      ])
                    ]
                  )
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
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
                      _c(
                        "div",
                        { staticClass: "large-12 medium-12 small-12 cell" },
                        [
                          _c("label", { staticClass: "filter-label" }, [
                            _vm._v("是否提供订购服务")
                          ])
                        ]
                      )
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
                      _c(
                        "div",
                        { staticClass: "large-12 medium-12 small-12 cell" },
                        [
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
                        ]
                      )
                    ]
                  )
                ])
              ])
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
    require("vue-hot-reload-api")      .rerender("data-v-61843689", module.exports)
  }
}

/***/ }),

/***/ 61:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(135)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(137)
/* template */
var __vue_template__ = __webpack_require__(138)
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
Component.options.__file = "resources/js/components/cafes/ListFilters.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-61843689", Component.options)
  } else {
    hotAPI.reload("data-v-61843689", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});