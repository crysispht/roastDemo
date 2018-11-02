webpackJsonp([11,25],{

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

/***/ 184:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(185);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("55f3bf48", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1aefd850\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./TagsInput.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1aefd850\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./TagsInput.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 185:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.tags-input-container {\n  position: relative;\n  margin-bottom: 20px;\n}\ndiv.tags-input-container div.tags-input {\n    display: table;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n    width: 100%;\n    height: auto;\n    min-height: 100px;\n    padding-top: 4px;\n    border: 1px solid #cacaca;\n    border-radius: 0;\n    background-color: #FFFFFF;\n    -webkit-box-shadow: inset 0 1px 2px rgba(17, 17, 17, 0.1);\n    box-shadow: inset 0 1px 2px rgba(17, 17, 17, 0.1);\n    font-family: inherit;\n    font-size: 1rem;\n    font-weight: normal;\n    line-height: 1.5;\n    color: #111111;\n}\ndiv.tags-input-container div.tags-input div.selected-tag {\n      border: 1px solid #7F5F2A;\n      background: #FFDBA0;\n      font-size: 18px;\n      color: #7F5F2A;\n      padding: 3px;\n      margin: 5px;\n      float: left;\n      border-radius: 3px;\n}\ndiv.tags-input-container div.tags-input div.selected-tag span.remove-tag {\n        margin: 0 0 0 5px;\n        padding: 0;\n        border: none;\n        background: none;\n        cursor: pointer;\n        vertical-align: middle;\n        color: #7F5F2A;\n}\ndiv.tags-input-container div.tags-input input[type=\"text\"].new-tag-input {\n      border: 0px;\n      margin: 0px;\n      float: left;\n      width: auto;\n      min-width: 100px;\n      -webkit-box-shadow: none;\n      box-shadow: none;\n      margin: 5px;\n}\ndiv.tags-input-container div.tags-input input[type=\"text\"].new-tag-input.duplicate-warning {\n        color: red;\n}\ndiv.tags-input-container div.tags-input input[type=\"text\"].new-tag-input:focus {\n        -webkit-box-shadow: none;\n                box-shadow: none;\n}\ndiv.tags-input-container div.tag-autocomplete {\n    position: absolute;\n    background-color: white;\n    width: 100%;\n    padding: 5px 0;\n    z-index: 99999;\n    border: 1px solid rgba(0, 0, 0, 0.2);\n    -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n}\ndiv.tags-input-container div.tag-autocomplete div.tag-search-result {\n      padding: 5px 10px;\n      cursor: pointer;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      color: #7F5F2A;\n      font-size: 14px;\n      background-color: white;\n}\ndiv.tags-input-container div.tag-autocomplete div.tag-search-result:hover {\n        background-color: #FFDBA0;\n}\ndiv.tags-input-container div.tag-autocomplete div.tag-search-result.selected-search-index {\n        background-color: #FFDBA0;\n}\n", ""]);

// exports


/***/ }),

/***/ 186:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event_bus_js__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_lodash__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    props: ['unique'],
    data: function data() {
        return {
            currentTag: '',
            tagsArray: [],
            tagSearchResults: [],
            duplicateFlag: false,
            searchSelectedIndex: -1,
            pauseSearch: false
        };
    },
    mounted: function mounted() {
        __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$on('clear-tags', function (unique) {
            this.currentTag = '';
            this.tagsArray = [];
            this.tagSearchResults = [];
            this.duplicateFlag = false;
            this.searchSelectedIndex = -1;
            this.pauseSearch = false;
        }.bind(this));
    },

    computed: {
        showAutocomplete: function showAutocomplete() {
            return this.tagSearchResults.length !== 0;
        }
    },
    methods: {
        // 标签自动补全
        selectTag: function selectTag(tag) {
            // 检查数组中是否有重复数据
            if (!this.checkDuplicates(tag)) {
                tag = this.cleanTagName(tag);
                this.tagsArray.push(tag);

                __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$emit('tags-edited', { unique: this.unique, tags: this.tagsArray });

                this.resetInputs();
            } else {
                this.duplicateFlag = true;
            }
        },


        // 新增标签
        addNewTag: function addNewTag() {
            if (!this.checkDuplicates(this.currentTag)) {
                var newTagName = this.cleanTagName(this.currentTag);
                this.tagsArray.push(newTagName);

                __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$emit('tags-edited', { unique: this.unique, tags: this.tagsArray });
                this.resetInputs();
            } else {
                this.duplicateFlag = true;
            }
        },


        // 删除标签
        removeTag: function removeTag(tagIndex) {
            this.tagsArray.splice(tagIndex, 1);

            __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$emit('tags-edited', { unique: this.unique, tags: this.tagsArray });
        },


        // 从下拉列表中选择自动完成的标签
        changeIndex: function changeIndex(direction) {
            this.pauseSearch = true;

            if (direction === 'up' && this.searchSelectedIndex - 1 > -1) {
                this.searchSelectedIndex = this.searchSelectedIndex - 1;
                this.currentTag = this.tagSearchResults[this.searchSelectedIndex].name;
            }

            if (direction === 'down' && this.searchSelectedIndex + 1 <= this.tagSearchResults.length - 1) {
                this.searchSelectedIndex = this.searchSelectedIndex + 1;
                this.currentTag = this.tagSearchResults[this.searchSelectedIndex].name;
            }
        },


        // 引入防抖动函数，在 300ms 后执行匿名函数内代码
        searchTags: __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.debounce(function (e) {
            if (this.currentTag.length > 2 && !this.pauseSearch) {
                this.searchSelectedIndex = -1;
                axios.get(__WEBPACK_IMPORTED_MODULE_0__config_js__["a" /* ROAST_CONFIG */].API_URL + '/tags', {
                    params: {
                        search: this.currentTag
                    }
                }).then(function (response) {
                    this.tagSearchResults = response.data;
                }.bind(this));
            }
        }, 300),

        // 检查标签是否重复
        checkDuplicates: function checkDuplicates(tagName) {
            tagName = this.cleanTagName(tagName);
            return this.tagsArray.indexOf(tagName) > -1;
        },


        // 清理标签，移除不必要的空格和字符
        cleanTagName: function cleanTagName(tagName) {
            var cleanTag = tagName.trim();
            return cleanTag;
        },


        // 重置标签输入框
        resetInputs: function resetInputs() {
            this.currentTag = '';
            this.tagSearchResults = [];
            this.duplicateFlag = false;
            this.searchSelectedIndex = -1;
            this.pauseSearch = false;
        },


        // 将焦点移到标签输入框
        focusTagInput: function focusTagInput() {
            document.getElementById(this.unique).focus();
        },


        // 处理标签删除
        handleDelete: function handleDelete() {
            this.duplicateFlag = false;
            this.pauseSearch = false;
            this.searchSelectedIndex = -1;

            // 如果当前标签没有任何数据则移除最后一个标签
            if (this.currentTag.length === 0) {
                this.tagsArray.splice(this.tagsArray.length - 1, 1);
                __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$emit('tags-edited', { unique: this.unique, tags: this.tagsArray });
            }
        }
    }
});

/***/ }),

/***/ 187:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "tags-input-container" }, [
    _c("label", [_vm._v("Tags")]),
    _vm._v(" "),
    _c(
      "div",
      {
        staticClass: "tags-input",
        on: {
          click: function($event) {
            _vm.focusTagInput()
          }
        }
      },
      [
        _vm._l(_vm.tagsArray, function(selectedTag, key) {
          return _c("div", { staticClass: "selected-tag" }, [
            _vm._v("\n            " + _vm._s(selectedTag) + "\n            "),
            _c(
              "span",
              {
                staticClass: "remove-tag",
                on: {
                  click: function($event) {
                    _vm.removeTag(key)
                  }
                }
              },
              [_vm._v("×")]
            )
          ])
        }),
        _vm._v(" "),
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.currentTag,
              expression: "currentTag"
            }
          ],
          staticClass: "new-tag-input",
          class: { "duplicate-warning": _vm.duplicateFlag },
          attrs: { type: "text", id: _vm.unique, placeholder: "Add a tag" },
          domProps: { value: _vm.currentTag },
          on: {
            keyup: [
              _vm.searchTags,
              function($event) {
                if (
                  !("button" in $event) &&
                  _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                ) {
                  return null
                }
                return _vm.addNewTag($event)
              }
            ],
            keydown: [
              function($event) {
                if (
                  !("button" in $event) &&
                  _vm._k($event.keyCode, "up", 38, $event.key, [
                    "Up",
                    "ArrowUp"
                  ])
                ) {
                  return null
                }
                _vm.changeIndex("up")
              },
              function($event) {
                if (
                  !("button" in $event) &&
                  _vm._k($event.keyCode, "delete", [8, 46], $event.key, [
                    "Backspace",
                    "Delete"
                  ])
                ) {
                  return null
                }
                return _vm.handleDelete($event)
              },
              function($event) {
                if (
                  !("button" in $event) &&
                  _vm._k($event.keyCode, "down", 40, $event.key, [
                    "Down",
                    "ArrowDown"
                  ])
                ) {
                  return null
                }
                _vm.changeIndex("down")
              }
            ],
            input: function($event) {
              if ($event.target.composing) {
                return
              }
              _vm.currentTag = $event.target.value
            }
          }
        })
      ],
      2
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.showAutocomplete,
            expression: "showAutocomplete"
          }
        ],
        staticClass: "tag-autocomplete"
      },
      _vm._l(_vm.tagSearchResults, function(tag, key) {
        return _c(
          "div",
          {
            staticClass: "tag-search-result",
            class: { "selected-search-index": _vm.searchSelectedIndex === key },
            on: {
              click: function($event) {
                _vm.selectTag(tag.name)
              }
            }
          },
          [_vm._v(_vm._s(tag.name) + "\n        ")]
        )
      })
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1aefd850", module.exports)
  }
}

/***/ }),

/***/ 220:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(221);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(103)("6ceb4471", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-155bfc19\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeFilter.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-155bfc19\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./CafeFilter.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 221:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(55)(false);
// imports


// module
exports.push([module.i, "\ndiv.filter-brew-method {\n  display: inline-block;\n  height: 35px;\n  text-align: center;\n  border: 1px solid #ededed;\n  border-radius: 5px;\n  padding-left: 10px;\n  padding-right: 10px;\n  padding-top: 5px;\n  padding-bottom: 5px;\n  margin-right: 10px;\n  margin-top: 10px;\n  cursor: pointer;\n  color: #7F5F2A;\n  font-family: 'Josefin Sans', sans-serif;\n}\ndiv.filter-brew-method.active {\n    border-bottom: 4px solid #7F6D50;\n}\nspan.show-filters {\n  display: block;\n  margin: auto;\n  color: #7F5F2A;\n  font-family: 'Josefin Sans', sans-serif;\n  cursor: pointer;\n  font-size: 14px;\n}\n", ""]);

// exports


/***/ }),

/***/ 222:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global_forms_TagsInput_vue__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global_forms_TagsInput_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__global_forms_TagsInput_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event_bus_js__ = __webpack_require__(106);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// 引入标签输入组件


// 引入事件总线


/* harmony default export */ __webpack_exports__["default"] = ({
    data: function data() {
        return {
            textSearch: '',
            tags: [],
            isRoaster: false,
            brewMethods: [],
            show: true
        };
    },

    computed: {
        cafeBrewMethods: function cafeBrewMethods() {
            return this.$store.getters.getBrewMethods;
        }
    },
    components: {
        TagsInput: __WEBPACK_IMPORTED_MODULE_0__global_forms_TagsInput_vue___default.a
    },
    mounted: function mounted() {
        __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$on('tags-edited', function (tagsEdited) {
            if (tagsEdited.unique === 'cafe-search') {
                this.tags = tagsEdited.tags;
            }
        }.bind(this));
    },

    methods: {
        toggleBrewMethodFilter: function toggleBrewMethodFilter(method) {
            if (this.brewMethods.indexOf(method) > -1) {
                this.brewMethods.splice(this.brewMethods.indexOf(method), 1);
            } else {
                this.brewMethods.push(method);
            }
        },
        updateFilterDisplay: function updateFilterDisplay() {
            __WEBPACK_IMPORTED_MODULE_1__event_bus_js__["a" /* EventBus */].$emit('filters-updated', {
                text: this.textSearch,
                tags: this.tags,
                roaster: this.isRoaster,
                brew_methods: this.brewMethods
            });
        }
    },
    watch: {
        textSearch: function textSearch() {
            this.updateFilterDisplay();
        },
        tags: function tags() {
            this.updateFilterDisplay();
        },
        isRoaster: function isRoaster() {
            this.updateFilterDisplay();
        },
        brewMethods: function brewMethods() {
            this.updateFilterDisplay();
        }
    }
});

/***/ }),

/***/ 223:
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "cafe-filter" } }, [
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
        staticClass: "grid-container"
      },
      [
        _c("div", { staticClass: "grid-x grid-padding-x" }, [
          _c("div", { staticClass: "large-6 medium-6 small-12 cell" }, [
            _c("label", [_vm._v("搜索")]),
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
              attrs: { type: "text", placeholder: "搜索" },
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
          _c(
            "div",
            { staticClass: "large-6 medium-6 small-12 cell" },
            [_c("tags-input", { attrs: { unique: "cafe-search" } })],
            1
          ),
          _vm._v(" "),
          _c("div", { staticClass: "is-roaster-container" }, [
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.isRoaster,
                  expression: "isRoaster"
                }
              ],
              attrs: { type: "checkbox" },
              domProps: {
                checked: Array.isArray(_vm.isRoaster)
                  ? _vm._i(_vm.isRoaster, null) > -1
                  : _vm.isRoaster
              },
              on: {
                change: function($event) {
                  var $$a = _vm.isRoaster,
                    $$el = $event.target,
                    $$c = $$el.checked ? true : false
                  if (Array.isArray($$a)) {
                    var $$v = null,
                      $$i = _vm._i($$a, $$v)
                    if ($$el.checked) {
                      $$i < 0 && (_vm.isRoaster = $$a.concat([$$v]))
                    } else {
                      $$i > -1 &&
                        (_vm.isRoaster = $$a
                          .slice(0, $$i)
                          .concat($$a.slice($$i + 1)))
                    }
                  } else {
                    _vm.isRoaster = $$c
                  }
                }
              }
            }),
            _vm._v(" "),
            _c("label", [_vm._v("是否是烘焙店?")])
          ]),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "brew-methods-container" },
            _vm._l(_vm.cafeBrewMethods, function(method) {
              return _c(
                "div",
                {
                  staticClass: "filter-brew-method",
                  class: {
                    active: _vm.brewMethods.indexOf(method.method) > -1
                  },
                  on: {
                    click: function($event) {
                      _vm.toggleBrewMethodFilter(method.method)
                    }
                  }
                },
                [
                  _vm._v(
                    "\n                    " +
                      _vm._s(method.method) +
                      "\n                "
                  )
                ]
              )
            })
          )
        ])
      ]
    ),
    _vm._v(" "),
    _c("div", { staticClass: "grid-container" }, [
      _c("div", { staticClass: "grid-x grid-padding-x" }, [
        _c(
          "span",
          {
            staticClass: "show-filters",
            on: {
              click: function($event) {
                _vm.show = !_vm.show
              }
            }
          },
          [_vm._v(_vm._s(_vm.show ? "隐藏过滤器 ↑" : "显示过滤器 ↓"))]
        )
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
    require("vue-hot-reload-api")      .rerender("data-v-155bfc19", module.exports)
  }
}

/***/ }),

/***/ 73:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(184)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(186)
/* template */
var __vue_template__ = __webpack_require__(187)
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
Component.options.__file = "resources/js/components/global/forms/TagsInput.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1aefd850", Component.options)
  } else {
    hotAPI.reload("data-v-1aefd850", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),

/***/ 82:
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(220)
}
var normalizeComponent = __webpack_require__(104)
/* script */
var __vue_script__ = __webpack_require__(222)
/* template */
var __vue_template__ = __webpack_require__(223)
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
Component.options.__file = "resources/js/components/cafes/CafeFilter.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-155bfc19", Component.options)
  } else {
    hotAPI.reload("data-v-155bfc19", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ })

});