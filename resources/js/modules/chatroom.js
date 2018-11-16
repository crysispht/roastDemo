/*
 |-------------------------------------------------------------------------------
 | VUEX modules/chatroom.js
 |-------------------------------------------------------------------------------
 | The Vuex data store for the cafes
 */

import ChatRoomAPI from '../api/chatroom.js';

export const chatroom = {
    /**
     * Defines the state being monitored for the module.
     */
    state: {
        userInfo: {},
        publicMessage: [],
        publicMessageStatus: 0,
    },
    /**
     * Defines the actions used to retrieve the data.
     */
    actions: {
        publicSendMessage({commit}, data) {
            commit('setPublicMessageStatus', 1);

            /*
              Calls the API to load the cities
            */
            ChatRoomAPI.postPublicMessage(data.message)
                .then(function (response) {
                    commit('setUserInfo', response.user);
                    commit('setPublicMessage', response.chatMessage);
                    commit('setPublicMessageStatus', 2);
                })
                .catch(function () {
                    commit('setUserInfo', {});
                    commit('setPublicMessage', '');
                    commit('setPublicMessageStatus', 3);
                });
        }
    },
    /**
     * Defines the mutations used
     */
    mutations: {
        setPublicMessage(state, message) {
            state.message = cafes;
        },
        setPublicMessageStatus(state, status) {
            state.publicMessageStatus = status;
        },
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },

    },
    /**
     * Defines the getters used by the module
     */
    getters: {
        getUserInfo(state) {
            return state.userInfo;
        },

        getPublicMessage(state) {
            return state.publicMessage;
        },

        getPublicMessageStatus(state) {
            return state.publicMessageStatus;
        },
    }
};
