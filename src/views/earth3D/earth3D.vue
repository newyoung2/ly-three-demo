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
    let controls
    let mapGroup
    let R = 80  //地球半径

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
                camera.position.set(0, 0, 250)


                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setClearColor('black');
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;

                // // 创建环境光
                // ambientLight = new THREE.AmbientLight(new THREE.Color("#666666"));
                // scene.add(ambientLight);

                // // 创建聚光
                // spotLight = new THREE.SpotLight(new THREE.Color("#ffffff"));
                // // spotLight.position.set(50, 50, 50);
                // spotLight.castShadow = true;
                // scene.add(spotLight);

                // 添加坐标轴
                // var axes = new THREE.AxisHelper(500);
                // scene.add(axes);

                mapGroup = new THREE.Group()
                // 创建网格模型
                let sphereOption = [R, 32, 32]

                var textureLoader = new THREE.TextureLoader();
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/earth.png');//加载纹理贴图
                let materialOption = {
                    map: texture,//设置地球0颜色贴图map
                    // color: new THREE.Color('#333333')
                }
                let mesh = this.addSphere(sphereOption, materialOption)
                mapGroup.add(mesh);
                

                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                /* lineData为计算后的数据  这样节省cpu的计算  并将多个线条合并为一个 */
                loader.load(process.env.BASE_URL + 'static/earth3D/lineData.json', function (data) {
                    console.log(data)
                    mapGroup.add(that.addLineSegment(data))
                    scene.add(mapGroup);
                    scene.add(that.addSprite());
                    
                })
                /* 通过生成多个线条模型的方式生成轮廓    这样比较占用cpu计算资源 */       
                /*  loader.load(process.env.BASE_URL + 'static/earth3D/world.json', function (data) {
                    data.features.forEach(e => {

                        // 将两种类型的数据结构组装成一样的  
                        if (e.geometry.type == 'Polygon') {
                            e.geometry.coordinates = [e.geometry.coordinates]
                        }

                        e.geometry.coordinates.forEach(e => {
                            let pointArr = []
                            let vector2Arr = [];
                            e[0].forEach(e1 => {
                                let obj = that.lon2xyz(R, e1[0], e1[1])
                                pointArr.push(obj.x, obj.y, obj.z)

                                vector2Arr.push(new THREE.Vector2(e1[0], e1[1]))
                            })
                            mapGroup.add(that.addline(pointArr))
                        })
                    })
                    mapGroup.add(mesh);
                    scene.add(mapGroup);
                    scene.add(that.addSprite());
                }) */

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);
                this.renders()

            },
            addLineSegment(pointArr) {
                /**
                 * 通过BufferGeometry构建一个几何体，传入顶点数据
                 * 通过Line模型渲染几何体，连点成线
                 * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合
                 * 如果使用LineSegments连线，需要把顶点多复制一份
                 */
                var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
                //类型数组创建顶点数据
                var vertices = new Float32Array(pointArr);
                // 创建属性缓冲区对象
                var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
                // 设置几何体attributes属性的位置属性
                geometry.attributes.position = attribue;
                // 线条渲染几何体顶点数据
                var material = new THREE.LineBasicMaterial({
                    color: 0x00aaaa //线条颜色
                });//材质对象
                // var line = new THREE.Line(geometry, material);//线条模型对象
                // var line = new THREE.LineLoop(geometry, material);//首尾顶点连线，轮廓闭合
                var line = new THREE.LineSegments(geometry, material);//间隔绘制直线
                line.scale.set(R,R,R)
                return line;

            },
            /* 添加点精灵光圈效果 */
            addSprite() {
                var textureLoader = new THREE.TextureLoader();
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/地球光圈.png');//加载纹理贴图
                // 创建精灵材质对象SpriteMaterial
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: texture, //设置精灵纹理贴图
                    transparent: true,//开启透明
                    // opacity: 0.5,//可以通过透明度整体调节光圈
                });
                // 创建表示地球光圈的精灵模型
                var sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(R * 3.0, R * 3.0, 1);//适当缩放精灵
                return sprite
            },
            //生成球模型
            addSphere(sphereOption, materialOption) {
                var geometry = new THREE.SphereGeometry(...sphereOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var sphere = new THREE.Mesh(geometry, material);
                return sphere
            },
            /* 添加轮廓线 */
            addline(pointArr) {
                /**
                  * 通过BufferGeometry构建一个几何体，传入顶点数据
                  * 通过Line模型渲染几何体，连点成线
                  * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合
                */
                var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
                //类型数组创建顶点数据
                var vertices = new Float32Array(pointArr);
                // 创建属性缓冲区对象
                var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
                // 设置几何体attributes属性的位置属性
                geometry.attributes.position = attribue;
                // 线条渲染几何体顶点数据
                var material = new THREE.LineBasicMaterial({
                    color: 0x00ffff //线条颜色
                });//材质对象
                var line = new THREE.Line(geometry, material);//线条模型对象
                // var line = new THREE.LineLoop(geometry, material);//首尾顶点连线，轮廓闭合
                return line;

            },
            // 经纬度转世界坐标
            lon2xyz(R, longitude, latitude) {
                var lon = longitude * Math.PI / 180;//转弧度值
                var lat = latitude * Math.PI / 180;//转弧度值
                lon = -lon;// three.js坐标系z坐标轴对应经度-90度，而不是90度

                // 经纬度坐标转球面坐标计算公式
                var x = R * Math.cos(lat) * Math.cos(lon);
                var y = R * Math.sin(lat);
                var z = R * Math.cos(lat) * Math.sin(lon);
                // 返回球面坐标
                return {
                    x: x,
                    y: y,
                    z: z,
                };
            },
            renders() {
                let that = this
                scene.traverse(function (e) {
                    if (e instanceof THREE.Group) {
                        e.rotation.y += 0.005;
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