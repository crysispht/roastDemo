<style>

</style>

<template>
    <div id="home">
        <span v-show="cafesLoadStatus == 1">Loading...</span>
        <span v-show="cafesLoadStatus == 2">Cafes loaded successfully!</span>
        <span v-show="cafesLoadStatus == 3">Cafes loaded unsuccessfully!</span>

        <!--<ul v-for="cafe in cafes">{{ cafe.name }}</ul>-->
    </div>
</template>

<script>
    export default {
        created() {
            this.$store.dispatch('loadCafes')
        },

        computed: {
            // 获取 cafes 加载状态
            cafesLoadStatus() {
                return this.$store.getters.getCafesLoadStatus
            },

            // 获取 cafes
            cafes() {
                return this.$store.getters.getCafes
            }
        }
    }
</script>
