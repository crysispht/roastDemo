/*
 |-------------------------------------------------------------------------------
 | routes.js
 |-------------------------------------------------------------------------------
 | Contains all of the routes for the application
 */

/**
 * Imports Vue and VueRouter to extend with the routes.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store.js';

/**
 * Extends Vue to use Vue Router
 */
Vue.use(VueRouter);

// 对需要认证才能访问的路由调用该方法实现 Vue Router 导航守卫
function requireAuth(to, from, next) {
    function proceed() {
        // 如果用户信息已经加载并且不为空则说明该用户已登录，可以继续访问路由，否则跳转到首页
        // 这个功能类似 Laravel 中的 auth 中间件
        if (store.getters.getUserLoadStatus() === 2) {
            if (store.getters.getUser !== '') {
                switch (to.meta.permission) {
                    // 如果权限级别是普通用户则继续
                    case 'user':
                        next();
                        break;

                    // 如果权限级别是商家则需要判断用户角色是否满足
                    case 'owner':
                        if (store.getters.getUser.permission >= 1) {
                            next();
                        } else {
                            next('/cafes');
                        }
                        break;

                    // 如果权限级别是管理员则需要判断用户角色是否满足
                    case 'admin':
                        if (store.getters.getUser.permission >= 2) {
                            next();
                        } else {
                            next('/cafes');
                        }
                        break;

                    // 如果权限级别是超级管理员则需要判断用户角色是否满足
                    case 'super-admin':
                        if (store.getters.getUser.permission === 3) {
                            next();
                        } else {
                            next('/cafes');
                        }
                        break;
                }
            } else {
                next('/');
            }
        }
    }

    if (store.getters.getUserLoadStatus() !== 2) {
        // 如果用户信息未加载完毕则先加载
        store.dispatch('loadUser');

        // 监听用户信息加载状态，加载完成后调用 proceed 方法继续后续操作
        store.watch(store.getters.getUserLoadStatus, function () {
            if (store.getters.getUserLoadStatus() === 2) {
                proceed();
            }
        });
    } else {
        // 如果用户信息加载完毕直接调用 proceed 方法
        proceed()
    }
}

// 基于 Vue 异步组件 + Webpack 实现路由懒加载
function loadView(dir, view) {
    // 注释不要去掉，对应上面 webpack 编译后的文件名
    // return () => import(/* webpackChunkName: "[request]" */ './' + dir + '/' + view + '.vue');
    return Vue.component(view, require('./' + dir + '/' + view + '.vue'))
}


/**
 * Makes a new VueRouter that we will use to run all of the routes for the app.
 */
// 前端路由定义
export default new VueRouter({
    routes: [
        {
            path: '/',
            redirect: {name: 'cafes'},
            name: 'layout',
            component: loadView('layouts', 'Layout'),
            children: [
                {
                    path: 'cafes',
                    name: 'cafes',
                    component: loadView('pages', 'Home'),
                    children: [
                        {
                            path: 'new',
                            name: 'newcafe',
                            component: loadView('pages', 'NewCafe'),
                            beforeEnter: requireAuth,
                            meta: {
                                permission: 'user'
                            }
                        },
                        {
                            path: ':id',
                            name: 'cafe',
                            component: loadView('pages', 'Cafe')
                        },
                        {
                            path: 'cities/:id',
                            name: 'city',
                            component: loadView('pages', 'City')
                        }
                    ]
                },
                {
                    path: 'cafes/:id/edit',
                    name: 'editcafe',
                    component: loadView('pages', 'EditCafe'),
                    beforeEnter: requireAuth,
                    meta: {
                        permission: 'user'
                    }
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: loadView('pages', 'Profile'),
                    beforeEnter: requireAuth,
                    meta: {
                        permission: 'user'
                    }
                },
                {
                    path: '_=_',
                    redirect: '/'
                }
            ]
        },
        {
            path: '/admin',
            name: 'admin',
            component: loadView('layouts', 'Admin'),
            beforeEnter: requireAuth,
            meta: {
                permission: 'owner'
            },
            children: [
                {
                    path: 'actions',
                    name: 'admin-actions',
                    component: loadView('pages/admin', 'Actions'),
                    meta: {
                        permission: 'owner'
                    }
                },
                {
                    path: 'companies',
                    name: 'admin-companies',
                    component: loadView('pages/admin', 'Companies'),
                    meta: {
                        permission: 'owner'
                    }
                },
                {
                    path: 'companies/:id',
                    name: 'admin-company',
                    component: loadView('pages/admin', 'Company'),
                    meta: {
                        permission: 'owner'
                    }
                },
                {
                    path: 'companies/:id/cafe/:cafeID',
                    name: 'admin-cafe',
                    component: loadView('pages/admin', 'Cafe'),
                    meta: {
                        permission: 'owner'
                    }
                },
                {
                    path: 'users',
                    name: 'admin-users',
                    component: loadView('pages/admin', 'Users'),
                    meta: {
                        permission: 'admin'
                    }
                },
                {
                    path: 'users/:id',
                    name: 'admin-user',
                    component: loadView('pages/admin', 'User'),
                    meta: {
                        permission: 'admin'
                    }
                },
                {
                    path: 'brew-methods',
                    name: 'admin-brew-methods',
                    component: loadView('pages/admin', 'BrewMethods'),
                    meta: {
                        permission: 'super-admin'
                    }
                },
                {
                    path: 'brew-methods/:id',
                    name: 'admin-brew-method',
                    component: loadView('pages/admin', 'BrewMethod'),
                    meta: {
                        permission: 'super-admin'
                    }
                },
                {
                    path: 'cities',
                    name: 'admin-cities',
                    component: loadView('pages/admin', 'Cities'),
                    meta: {
                        permission: 'super-admin'
                    }
                },
                {
                    path: 'cities/:id',
                    name: 'admin-city',
                    component: loadView('pages/admin', 'City'),
                    meta: {
                        permission: 'super-admin'
                    }
                },
                {
                    path: '_=_',
                    redirect: '/'
                }
            ]
        }
    ]
});
