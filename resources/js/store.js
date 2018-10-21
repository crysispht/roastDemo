/**
 * Adds the promise polyfill for IE 11
 */

require('es6-promise').polyfill()

/**
 * Import Vue and Vuex
 */

import Vue from 'vue'

import Vuex from 'vuex'

/**
 * Initializes Vuex on Vue.
 */

Vue.use(Vuex)


/**
 * Imports all of the modules used in the application to build the data store.
 */
import {cafes} from './modules/cafes'

import {users} from './modules/users'

import {brewMethods} from "./modules/brewMethods"

/**
 * Export the data store.
 */
export default new Vuex.Store({
    modules: {
        cafes,
        users,
        brewMethods
    }
})
