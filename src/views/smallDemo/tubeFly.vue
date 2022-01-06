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
    let pointArr = [
        new THREE.Vector3(-500, 200, 900),
        new THREE.Vector3(-100, 400, 400),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(600, -600, 0),
        new THREE.Vector3(900, -400, 600),
        new THREE.Vector3(1200, -200, 300),
    ]
    let points
    let num = 0

    export default {
        data() {
            return {
                curIndex: -1,
                isMouseEnter: false,
                imgUrlPreix: process.env.BASE_URL + 'static/',

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
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100000);  //透视投影相机
                camera.position.set(1500, 1500, 1500)


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

                // 创建管道
                // 三维样条曲线CatmullRomCurve3创建一个曲线路径
                var curve = new THREE.CatmullRomCurve3(pointArr);
                // 从曲线上获得501个顶点，数量根据需要自己设置
                points = curve.getPoints(500);
                console.log(points)
                // 通过曲线生成一个管道几何体
                var geometry = new THREE.TubeGeometry(curve, 200, 30, 30);
                /* // 使用纹理贴图渲染几何体数据
                var textureLoader = new THREE.TextureLoader(); // 纹理加载器
                var texture = textureLoader.load(that.imgUrlPreix + 'brick_diffuse.jpg'); // 加载图片，返回Texture对象
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                // uv两个方向纹理重复数量
                texture.repeat.set(10, 1);
                var material = new THREE.MeshBasicMaterial({
                    // color: 0x0000ff,
                    side: THREE.BackSide,
                    map: texture,
                }); //材质对象Material
                var mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                scene.add(mesh); //网格模型添加到场景中
                camera.lookAt(points[0]) */
                
                // 使用点模式渲染几何体数据
                let material = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 3,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    map: that.generateSprite(),
                });
                var mesh = new THREE.Points(geometry, material);
                scene.add(mesh);
                camera.lookAt(points[0])

                container.appendChild(renderer.domElement);
                new OrbitControls(camera, renderer.domElement);

                this.renders()

            },
            generateSprite() {
                var canvas = document.createElement("canvas");
                canvas.width = 16;
                canvas.height = 16;

                var context = canvas.getContext("2d");
                var gradient = context.createRadialGradient(
                    canvas.width / 2,
                    canvas.height / 2,
                    0,
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2
                );
                gradient.addColorStop(0, "rgba(255,255,255,1)");
                gradient.addColorStop(0.2, "rgba(0,255,255,1)");
                gradient.addColorStop(0.4, "rgba(0,0,64,1)");
                gradient.addColorStop(1, "rgba(0,0,0,1)");

                context.fillStyle = gradient;
                context.fillRect(0, 0, canvas.width, canvas.height);

                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return texture;
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
                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
                if (num >= points.length - 5) {
                    num = 0
                } else {
                    camera.position.set(points[num].x, points[num].y, points[num].z)
                    camera.lookAt(points[num + 1])
                    num += 1
                }


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