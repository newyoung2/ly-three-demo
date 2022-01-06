<template>
    <div id="container">

    </div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let ambientLight  //自然光
    let spotLight   //聚光
    let raycaster
    let mouse
    let pointArr = [
            new THREE.Vector3(-10, 0, 0),
            new THREE.Vector3(0, 0, 30),
            new THREE.Vector3(10, 0, 0)
    ]

    export default {
        data() {
            return {
                curIndex: -1,
                isMouseEnter: false,
                imgUrlPreix: process.env.BASE_URL + 'static/solarSystem/UI/按钮/',
                imgUrlPreix1: process.env.BASE_URL + 'static/solarSystem/UI/标签/',

            };
        },
        mounted() {
            this.init()
        },
        methods: {
            async init() {
                let that = this
                let container = document.getElementById('container');

                // 创建场景
                scene = new THREE.Scene();

                // 创建相机
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);  //透视投影相机
                camera.position.set(pointArr[0].x, 25, pointArr[0].y)


                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setClearColor('black');
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;

                // 创建环境光
                ambientLight = new THREE.AmbientLight(new THREE.Color("#666666"));
                scene.add(ambientLight);

                // 创建聚光
                spotLight = new THREE.SpotLight(new THREE.Color("#ffffff"));
                // spotLight.position.set(50, 50, 50);
                spotLight.castShadow = true;
                scene.add(spotLight);

                // 添加坐标轴
                // var axes = new THREE.AxisHelper(500);
                // scene.add(axes);

                // 创建网格模型
                var material = new THREE.LineBasicMaterial({
                    color: 0x0000ff
                });

                var geometry = new THREE.Geometry();
                geometry.vertices = pointArr;

                var line = new THREE.Line(geometry, material);
                scene.add(line);
                camera.lookAt(line)


                container.appendChild(renderer.domElement);
                new OrbitControls(camera, renderer.domElement);


                this.renders()

            },
            //生成球模型
            addSphere(sphereOption, materialOption) {
                var geometry = new THREE.SphereGeometry(...sphereOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var sphere = new THREE.Mesh(geometry, material);
                // sphere.position.set(...data.position)

                return sphere
            },
            renders() {
                let that = this
                scene.traverse(function (e) {

                    if (e instanceof THREE.Mesh) {
                        // e.rotation.y += 0.001;  
                    }
                });

                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
            }

        },
    };
</script>

<style scoped>
    #container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;

    }

    .toolBox {
        display: inline-flex;
        position: absolute;
        bottom: 20px;
        left: 30%;
    }

    .toolBox-item {
        position: relative;
        width: 50px;
        height: 80px;
        margin: 0 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        color: white;
    }

    .toolBox-item img {
        width: 50px;
        height: 50px;
    }

    .activeImg {
        transform: scale(1.2);
    }
</style>