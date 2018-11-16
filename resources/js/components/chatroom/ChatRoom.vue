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

            Echo.channel('chat.public').listen('PublicChatMessageWasReceived', (e) => {
                // 如果有广播过来你可以进行逻辑操作，比如给用户一个通知
                console.log('[公共频道]：   ' + e.chatMessage);
            });
            // window.chatroom = this;
        },
        methods: {
            publicSendMessage(message) {
                this.$store.dispatch('publicSendMessage', {message: message})
            }
        },
        watch: {}
    }

</script>
