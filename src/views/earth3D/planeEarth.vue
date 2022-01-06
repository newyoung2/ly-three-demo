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
    let lineGroup

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
                lineGroup = new THREE.Group()

                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                loader.load(process.env.BASE_URL + 'static/earth3D/world.json', function (data) {
                    data.features.forEach(e => {

                        /* 将两种类型的数据结构组装成一样的  */
                        if (e.geometry.type == 'Polygon') {
                            e.geometry.coordinates = [e.geometry.coordinates]
                        }

                        
                        e.geometry.coordinates.forEach(e => {
                           let pointArr = []
                           let vector2Arr = [];
                           e[0].forEach(e1 => {
                              pointArr.push(e1[0], e1[1], 0)
                              vector2Arr.push(new THREE.Vector2(e1[0], e1[1]))
                            })
                            lineGroup.add(that.addline(pointArr))
                            mapGroup.add(that.addshape(vector2Arr))
                          })
                          
                    })

                        scene.add(mapGroup);
                        
                        lineGroup.position.z += 1;//适当偏移解决深度冲突
                        scene.add(lineGroup);
                })

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);
                this.renders()

            },
            addshape(vector2Arr){

                var material = new THREE.MeshBasicMaterial({
                    color: 0x004444,
                    side: THREE.DoubleSide, //两面可见
                }); //材质对象
                var shape = new THREE.Shape(vector2Arr);
                var geometry = new THREE.ShapeBufferGeometry(shape);
                var mesh = new THREE.Mesh(geometry, material); //网格模型对象
                return mesh

            },
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