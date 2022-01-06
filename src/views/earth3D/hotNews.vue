<template>
    <div id="container">

    </div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import hotNewsData from './hotNewsData.js'

    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let ambientLight  //自然光
    let spotLight   //聚光
    let raycaster
    let mouse
    let controls
    let mapGroup = new THREE.Group()
    let markGroup = new THREE.Group()
    let WaveMeshArr = []
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

                // 创建一个基本的地球  包含（地球、国家轮廓、光圈）
                that.addBasicEarth()

                /*  拾取模型事件 */
                raycaster = new THREE.Raycaster();
                mouse = new THREE.Vector2();
                window.addEventListener('click', this.onDocumentMouseDown, false);

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);
                this.renders()

            },
            onDocumentMouseDown(event) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                // 环行星是group包含两个mesh子对象，intersectObjects方法第二个参数设置为true，可以检测子对象
                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length > 0) {
                    intersects.forEach(e=>{
                        if(e.object && e.object.name == 'ringMark'){
                            window.open(e.object.busiData.herf)
                        }
                    })
                } 
            },
            addBasicEarth() {
                let that = this
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

                    that.addMark()  //添加标注

                })
            },
            //添加标注
            addMark() {
                hotNewsData.map((e, i) => {
                    e.position = this.lon2xyz(R, e.E, e.N)
                    e.index = i
                    markGroup.add(this.addCircleMark(e))
                    markGroup.add(this.addLightBarMark(e))
                    let ringMark = this.addRingMark(e)
                    markGroup.add(ringMark)
                    WaveMeshArr.push(ringMark)

                })
                scene.add(markGroup)

            },
            addRingMark(data) {
                // 矩形平面网格模型设置背景透明的png贴图
                var geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
                var textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/标注光圈.png');
                var material = new THREE.MeshBasicMaterial({
                    color: this.getColorValue(data.index),
                    map: texture,
                    transparent: true, //使用背景透明的png贴图，注意开启透明计算
                    // side: THREE.DoubleSide, //双面可见
                    opacity: 1.0,
                    depthWrite: false,//禁止写入深度缓冲区数据
                });


                var mesh = new THREE.Mesh(geometry, material);
                var size = R * 0.12;//矩形平面Mesh的尺寸
                mesh.size = size;
                mesh.scale.set(size, size, size);//设置mesh大小
                mesh._s = Math.random() * 1.0 + 1.0;//自定义属性._s表示mesh在原始大小基础上放大倍数  光圈在原来mesh.size基础上1~2倍之间变化
                mesh.position.set(data.position.x, data.position.y, data.position.z);//设置mesh位置

                // mesh姿态设置
                // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
                var coordVec3 = new THREE.Vector3(data.position.x, data.position.y, data.position.z).normalize();
                // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
                var meshNormal = new THREE.Vector3(0, 0, 1);
                // 四元数属性.quaternion表示mesh的角度状态
                //.setFromUnitVectors();计算两个向量之间构成的四元数值
                mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
                mesh.name = 'ringMark';
                mesh.busiData = data;
                return mesh;
            },
            //添加圆形
            addCircleMark(data) {

                // 矩形平面网格模型设置背景透明的png贴图
                var geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
                var textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/标注.png');
                var material = new THREE.MeshBasicMaterial({
                    color: this.getColorValue(data.index),
                    map: texture,
                    transparent: true, //使用背景透明的png贴图，注意开启透明计算
                    // side: THREE.DoubleSide, //双面可见
                });


                var mesh = new THREE.Mesh(geometry, material);
                var size = R * 0.05;//矩形平面Mesh的尺寸
                mesh.scale.set(size, size, size);//设置mesh大小
                mesh.position.set(data.position.x, data.position.y, data.position.z);//设置mesh位置

                // mesh姿态设置
                // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
                var coordVec3 = new THREE.Vector3(data.position.x, data.position.y, data.position.z).normalize();
                // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
                var meshNormal = new THREE.Vector3(0, 0, 1);
                // 四元数属性.quaternion表示mesh的角度状态
                //.setFromUnitVectors();计算两个向量之间构成的四元数值
                mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
                mesh.busiData = data;
                return mesh;

            },
            addLightBarMark(data) {
                // 矩形平面网格模型设置背景透明的png贴图
                let height = 5 + R * 0.3 * (hotNewsData.length - 1 - data.index) / (hotNewsData.length - 1)
                var geometry = new THREE.PlaneBufferGeometry(R * 0.05, height); //默认在XOY平面上
                geometry.rotateX(Math.PI / 2);//光柱高度方向旋转到z轴上
                geometry.translate(0, 0, height / 2);//平移使光柱底部与XOY平面重合
                var textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
                var material = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(process.env.BASE_URL + 'static/earth3D/光柱.png'),
                    color: this.getColorValue(data.index), //光柱颜色，光柱map贴图是白色，可以通过color调节颜色   
                    transparent: true, //使用背景透明的png贴图，注意开启透明计算
                    side: THREE.DoubleSide, //双面可见
                    depthWrite: false,//是否对深度缓冲区有任何的影响
                });
                var mesh = new THREE.Mesh(geometry, material);
                var group = new THREE.Group();
                group.add(mesh, mesh.clone().rotateZ(Math.PI / 2))
                group.position.set(data.position.x, data.position.y, data.position.z);
                // mesh姿态设置
                // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
                var coordVec3 = new THREE.Vector3(data.position.x, data.position.y, data.position.z).normalize();
                // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
                var meshNormal = new THREE.Vector3(0, 0, 1);
                // 四元数属性.quaternion表示mesh的角度状态
                //.setFromUnitVectors();计算两个向量之间构成的四元数值
                group.quaternion.setFromUnitVectors(meshNormal, coordVec3);
                group.busiData = data;
                return group
            },
            // 根据索引排名获取对应热点应该显示的颜色
            getColorValue(index) {
                if (index == 0) {
                    return 0xff6666
                } else if (index > 0 && index <= 6) {
                    return 0xffff66
                } else {
                    return 0x44ffaa
                }
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
                scene.traverse(function (mesh) {
                    if (mesh instanceof THREE.Mesh && mesh.name == 'ringMark') {
                        mesh._s += 0.007;
                        mesh.scale.set(mesh.size * mesh._s, mesh.size * mesh._s, mesh.size * mesh._s);
                        if (mesh._s <= 1.5) {
                            mesh.material.opacity = (mesh._s - 1) * 2;//2等于1/(1.5-1.0)，保证透明度在0~1之间变化
                        } else if (mesh._s > 1.5 && mesh._s <= 2) {
                            mesh.material.opacity = 1 - (mesh._s - 1.5) * 2;//2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
                        } else {
                            mesh._s = 1.0;
                        }
                        // mapGroup.rotation.y += 0.003;
                    }
                });
                
                // 所有波动光圈都有自己的透明度和大小状态
                // 一个波动光圈透明度变化过程是：0~1~0反复循环
                // if (WaveMeshArr.length) {
                //     WaveMeshArr.forEach(function (mesh) {
                //         mesh._s += 0.007;
                //         mesh.scale.set(mesh.size * mesh._s, mesh.size * mesh._s, mesh.size * mesh._s);
                //         if (mesh._s <= 1.5) {
                //             mesh.material.opacity = (mesh._s - 1) * 2;//2等于1/(1.5-1.0)，保证透明度在0~1之间变化
                //         } else if (mesh._s > 1.5 && mesh._s <= 2) {
                //             mesh.material.opacity = 1 - (mesh._s - 1.5) * 2;//2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
                //         } else {
                //             mesh._s = 1.0;
                //         }
                //     })
                // }
                mapGroup.rotation.y += 0.003;
                markGroup.rotation.y += 0.003;
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