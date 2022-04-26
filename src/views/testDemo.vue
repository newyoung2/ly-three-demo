<template>
  <div id="container">
        <div id="c1"></div>
        <div id="c2"></div>
        <div id="c3"></div>
        <div id="c4"></div>
    </div>
</template>

<script>
import * as THREE from 'THREE'
import LyThree from '../components/lyThree'
let lyt1 = null
let lyt2 = null
let lyt3 = null
let lyt4 = null
export default {
        data() {
            return {

            };
        },
        mounted() {
           let option = {
               camera:{
                   position:[183, 88, -284]
               }
           }
           lyt1 = new LyThree.global3D('c1',option)
           lyt2 = new LyThree.global3D('c2',option)
           lyt3 = new LyThree.global3D('c3',option)
           lyt4 = new LyThree.global3D('c4',option)
           this.renders()

           // 自适应 onresize 事件会在窗口被调整大小时发生
             window.onresize = function () {
                lyt1.resize()
                lyt2.resize()
                lyt3.resize()
                lyt4.resize()
            };
        },
        methods:{
            renders(){
                lyt1.scene.traverse(function (e) {
                    if (e instanceof THREE.Group) {
                        e.rotation.y += 0.005;
                    }
                });
                lyt2.scene.traverse(function (e) {
                    if (e instanceof THREE.Group) {
                        e.rotation.y += 0.005;
                    }
                });
                lyt3.scene.traverse(function (e) {
                    if (e instanceof THREE.Group) {
                        e.rotation.y += 0.005;
                    }
                });
                lyt4.scene.traverse(function (e) {
                    if (e instanceof THREE.Group) {
                        e.rotation.y += 0.005;
                    }
                });
                requestAnimationFrame(this.renders)
                lyt1.renders()
                lyt2.renders()
                lyt3.renders()
                lyt4.renders()
            }
        }
    };
</script>

<style scoped>
  #container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;

    }
    #c1,#c2,#c3,#c4{
        width: 50%;
        height: 50%;
    }
</style>