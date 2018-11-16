window._ = require("lodash");

try {
    window.$ = window.jQuery = require("jquery");
    require("foundation-sites");
} catch (e) {
}

window.axios = require("axios");

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
} else {
    console.error(
        "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
    );
}

/**
 *  Import Laravel Echo
 */
import Echo from "laravel-echo"

window.io = require('socket.io-client');

window.Echo = new Echo({
    broadcaster: 'socket.io',
    host: '127.0.0.1:6001'
});

import Vue from 'vue';

import router from './routes'

import store from './store'

new Vue({
    router,
    store
}).$mount('#app');

gtag('set', 'page_path', router.currentRoute.path);
gtag('event', 'page_view');

router.afterEach((to, from) => {
    gtag('set', 'page_path', to.path);
    gtag('event', 'page_view');
});
