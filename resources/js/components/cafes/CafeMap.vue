<template>
    <div id="cafe-map">

    </div>
</template>

<script>

    import {ROAST_CONFIG} from '../../config'

    export default {
        props: {
            'latitude': {  // 经度
                type: Number,
                default: function () {
                    return 116.397026
                }
            },
            'longitude': {  // 纬度
                type: Number,
                default: function () {
                    return 39.918058
                }
            },
            'zoom': {   // 缩放级别
                type: Number,
                default: function () {
                    return 10
                }
            }
        },
        data() {
            return {
                markers: [],
                infoWindows: []
            }
        },
        mounted() {
            this.map = new AMap.Map('cafe-map', {
                center: [this.latitude, this.longitude],
                zoom: this.zoom
            })
            // 清除并重构点标记
            this.clearMarkers()
            this.buildMarkers()
        },
        computed: {
            cafes() {
                return this.$store.getters.getCafes
            }
        },
        methods: {
            // 为所有咖啡店创建点标记
            buildMarkers() {
                // 清空点标记数组
                this.markers = []

                // 自定义点标记图标
                let image = ROAST_CONFIG.APP_URL + '/svg/coffee-marker.svg';
                let icon = new AMap.Icon({
                    image: image,  // 图像 URL
                    imageSize: new AMap.Size(19, 33)  // 设置图标尺寸
                })
                // 遍历所有咖啡店并为每个咖啡店创建点标记
                for (let i = 0; i < this.cafes.length; i++) {
                    // 通过高德地图 API 为每个咖啡店创建点标记并设置经纬度
                    let marker = new AMap.Marker({
                        position: new AMap.LngLat(parseFloat(this.cafes[i].latitude), parseFloat(this.cafes[i].longitude)),
                        title: this.cafes[i].name,
                        icon: icon,  // 通过 icon 对象设置自定义点标记图标来替代默认蓝色图标
                        map: this.map
                    })

                    var infoWindow = new AMap.InfoWindow({
                        content:this.cafes[i].name
                    })

                    this.infoWindows.push(infoWindow)

                    // 绑定点击事件到点标记对象，点击打开上面创建的信息窗体
                    marker.on('click',function () {
                        let map = this.getMap()
                        let position = this.getPosition()
                        infoWindow.open(map,position)
                    })

                    //将每个点标记放到点标记数组中
                    this.markers.push(marker)
                }
                
                // 将所有点标记显示到地图上
                this.map.add(this.markers)
            },

            // 从地图上清理点标记
            clearMarkers() {
                // 遍历所有点标记并将其设置为 null 从而从地图上将其清除
                for (let i = 0; i < this.markers.length; i++) {
                    this.markers[i].setMap(null)
                }
            }
        },
        watch: {
            // 一旦 cafes 有更新立即重构地图点标记
            cafes() {
                this.clearMarkers()
                this.buildMarkers()
            }
        }
    }
</script>

<style scoped lang="scss">
    div#cafe-map {
        width: 100%;
        height: 400px;
    }
</style>
