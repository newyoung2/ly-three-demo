<template>
    <div id="container">

    </div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import Delaunator from 'delaunator';
    import polygonData from './polygonData.js'
    var pointInPolygon = require('point-in-polygon');
    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let ambientLight  //自然光
    let spotLight   //聚光
    let raycaster
    let mouse
    let controls
    let mapGroup = new THREE.Group()
    let lineGroup = new THREE.Group()
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
                camera.position.set(0, 0, 250); //相机在Three.js坐标系中的位置


                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setClearColor('black');
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;



                this.addEarth()  //添加地球
                this.addCountryMesh()  //添加国家网格模型




                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);

                this.renders()

            },
             //添加地球
            addEarth() {
                // 创建网格模型
                let sphereOption = [R, 32, 32]

                let materialOption = {
                    color: new THREE.Color('black')
                }
                let mesh = this.addSphere(sphereOption, materialOption)
                mapGroup.add(mesh);
                scene.add(mapGroup);
                scene.add(this.addSprite());
            },
            // 添加国家多边形网格模型
            addCountryMesh() {
                let that = this
                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                /* 通过生成多个线条模型的方式生成轮廓    这样比较占用cpu计算资源 */
                loader.load(process.env.BASE_URL + 'static/earth3D/world.json', function (data) {
                    data.features.forEach((e, i) => {

                        // 将两种类型的数据结构组装成一样的  
                        if (e.geometry.type == 'Polygon') {
                            e.geometry.coordinates = [e.geometry.coordinates]
                        }

                        let oneCountryGroup = new THREE.Group()

                        e.geometry.coordinates.forEach(e => {
                            // let pointArr = []

                            oneCountryGroup.add(that.addMeshPoints(e[0]))
                            let pointArr = []
                            e[0].forEach(e1 => {
                                let obj = that.lon2xyz(R, e1[0], e1[1])
                                pointArr.push(obj.x, obj.y, obj.z)
                            })
                            lineGroup.add(that.addline(pointArr))

                        })
                        oneCountryGroup.name = data.features[i].properties.name
                        scene.add(oneCountryGroup)

                        // lineGroup.position.z += 1;//适当偏移解决深度冲突
                        scene.add(lineGroup);
                    })

                })
            },
            //在国家多边形内添加等间距网格点
            addMeshPoints(data) {
                let that = this
                let latArr = []
                let lngArr = []
                data.forEach(e => {
                    lngArr.push(e[0])
                    latArr.push(e[1])
                })

                let [lngMin, lngMax] = minMax(lngArr) // [lngArr[0],lngArr[lngArr.length-1]]
                let [latMin, latMax] = minMax(latArr) //[latArr[0],latArr[latArr.length-1]]
                let row = Math.ceil((lngMax - lngMin) / 1)
                let col = Math.ceil((latMax - latMin) / 1)
                console.log(lngArr)
                // console.log(col)
                let rectPointsArr = []
                for (let i = 0; i < row; i++) {
                    for (let j = 0; j < col; j++) {

                        if (pointInPolygon([lngMin + i, latMin + j], data)) {  //只取在边界线内的等间距网格点
                            rectPointsArr.push([lngMin + i, latMin + j])
                        }
                    }
                }


                var pointArr = [];//处理点阵顶点坐标，用于生成几何体顶点坐标
                rectPointsArr.forEach(function (elem) {
                    let position = that.lon2xyz(R, elem[0], elem[1])
                    pointArr.push(position.x, position.y, position.z)
                })
                var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
                // 设置几何体attributes属性的位置属性

                geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(pointArr), 3); //3个为一组，表示一个顶点的xyz坐标
                var pointsMaterial = new THREE.PointsMaterial({
                    color: 0x00ffff,
                    size: 1,
                });//点材质
                var points = new THREE.Points(geometry, pointsMaterial);// 点模型
                return points

            },
            // ********************************************************end***************************
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
                        // e.rotation.y += 0.005;
                    }
                });

                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
            }

        },
    };

    //   经纬度坐标进行排序
    function minMax(arr) {
        // 数组元素排序
        arr.sort(compareNum);
        // 通过向两侧取整，把经纬度的方位稍微扩大
        return [Math.floor(arr[0]), Math.ceil(arr[arr.length - 1])]
    }
    // 数组排序规则
    function compareNum(num1, num2) {
        if (num1 < num2) {
            return -1;
        } else if (num1 > num2) {
            return 1;
        } else {
            return 0;
        }
    }
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