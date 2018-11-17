<template>

</template>

<style>

</style>

<script>

    export default {
        mounted() {

            let socket = Echo.connector.socket;
            socket.on('connect_error', function (data) {
                Echo.disconnect();
            });

            Echo.join('chat.public')
                .here((members) => {
                    console.log(members);
                })
                .joining((joiningMember, members) => {
                    console.log(joiningMember, members);
                })
                .leaving((leavingMember, members) => {
                    console.log(leavingMember, members);
                })
                .listen('PublicChatMessageWasReceived', (e) => {
                    // 如果有广播过来你可以进行逻辑操作，比如给用户一个通知
                    let userInfo = e.user;
                    let nick = userInfo ? userInfo.name : '游客' + e.socket;
                    console.log('[公共频道]：   ' + nick + ' 说: ' + e.chatMessage);
                });

            window.chatroom = this;
        },
        methods: {
            publicSendMessage(message) {
                this.$store.dispatch('publicSendMessage', {message: message})
            }
        },
        watch: {}
    }

</script>
