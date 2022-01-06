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
    let pointsGroup
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

                mapGroup = new THREE.Group()
                pointsGroup = new THREE.Group()
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

                    mapGroup.add(that.addLineSegment(data))
                    scene.add(mapGroup);
                    scene.add(that.addSprite());
                    that.addPoints()

                })

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);
                this.renders()

            },
            addPoints() {
                let that = this
                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                loader.load(process.env.BASE_URL + 'static/earth3D/数据.json', function (data) {
                    console.log(data)

                    var coordArr = data.points;//所有经纬度坐标数据
                    var numArr = data.num;//所有点对应周边点数
                    var numMax = numArr.slice().sort(compareNum)[numArr.length - 1];//数组复制并排序，然后获得最大值

                    var verticesArr = [];//所有顶点数据，三个元素为一组
                    var colorArr = [];//所有顶点颜色数据，三个元素为一组
                    var color1 = new THREE.Color(0x00aaaa);
                    var color2 = new THREE.Color(0x99ffff);//周边点最多点对应顶点颜色
                    for (var i = 0; i < coordArr.length; i+=2) {
                        // var lon = coordArr[i].longitude_deg;//经度
                        // var lat = coordArr[i].latitude_deg//纬度
                        // // 经纬度转球面坐标
                        // var coord = that.lon2xyz(R * 1.001, lon, lat)
                        // verticesArr.push(coord.x, coord.y, coord.z);

                        //实际开发中遇到几何体顶点坐标NaN报错问题
                        if(!coordArr[i])console.log('存在空数据')
                        if(coordArr[i]){
                          var coord = that.lon2xyz(R*1.001, coordArr[i], coordArr[i+1])
                          verticesArr.push(coord.x, coord.y, coord.z);  
                        }

                        var percent = numArr[i / 2] / numMax * 100;
                        if (percent > 1.0) percent = 1.0;
                        var color = color1.clone().lerp(color2.clone(), percent);
                        colorArr.push(color.r, color.g, color.b);
                    }
                    var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
                    //3个为一组，表示一个顶点的xyz坐标
                    var attribute = new THREE.BufferAttribute(new Float32Array(verticesArr), 3);
                    
                    // 设置几何体attributes属性的位置属性
                    geometry.attributes.position = attribute;
                    // console.log('顶点数据',attribute.count);//接近6万个点
                    geometry.attributes.color = new THREE.BufferAttribute(new Float32Array(colorArr), 3);
                    // 点渲染模式
                    var material = new THREE.PointsMaterial({
                        // color: 0x33ffcc,
                        // color: 0xffff00,
                        vertexColors: THREE.VertexColors, //使用顶点颜色插值计算
                        size: 0.1, //点尺寸
                        // size: 1.5, //点尺寸
                    }); //材质对象
                    var points = new THREE.Points(geometry, material); //点模型对象
                    pointsGroup.add(points);
                    scene.add(pointsGroup)

                })
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
                line.scale.set(R, R, R)
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
                        // e.rotation.y += 0.005;
                    }
                });

                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
            }

        },
    };

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