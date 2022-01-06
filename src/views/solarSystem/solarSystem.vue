<template>
    <div id="container">
        <div class="toolBox" @mouseover="isMouseEnter =true" @mouseleave="isMouseEnter=false">
            <div class="toolBox-item" v-for="(item,index) in meshOptionList1" :key="index"
                @click="clickImg(item,index)">
                <img :src="`${imgUrlPreix + item.text}.png`" :class="{'activeImg':index == curIndex}" alt="">
                <span>{{item.text}}</span>
            </div>
        </div>

        <template v-for="(item,index) in meshOptionList1">
            <div class='labelDiv' :class="getClass(item)" v-show="index == curIndex" :key="index"
                style="position: absolute;">
                <img :src="`${imgUrlPreix1 + item.text}.png`" alt="" :key="index">
            </div>
        </template>

    </div>
</template>

<script>
    import * as THREE from 'THREE'
    import Stats from "stats.js";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import meshOptionList from './meshOptionList.js'

    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let container
    let ambientLight  //自然光
    let spotLight   //聚光
    let raycaster
    let mouse
    let stats

    export default {
        data() {
            return {
                curIndex: -1,
                isMouseEnter: false,
                imgUrlPreix: process.env.BASE_URL + 'static/solarSystem/UI/按钮/',
                imgUrlPreix1: process.env.BASE_URL + 'static/solarSystem/UI/标签/',
                meshOptionList1: JSON.parse(JSON.stringify(meshOptionList))

            };
        },
        mounted() {
            this.init()

            // 自适应 onresize 事件会在窗口被调整大小时发生
            window.onresize = function () {
                // 重置渲染器输出画布canvas尺寸
                renderer.setSize(container.clientWidth, container.clientHeight);
                // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
                camera.aspect = container.clientWidth / container.clientHeight;
                // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
                // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
                // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
                camera.updateProjectionMatrix();
            };
        },
        methods: {
            async init() {
                let that = this

                /* 性能监控 */
                //创建stats对象
                 stats = new Stats();
                 stats.domElement.style.left = '467px';
                 //Stats.domElement:web页面上输出计算结果,一个div元素
                 document.body.appendChild(stats.domElement);


                container = document.getElementById('container');

                /*  创建场景 */
                scene = new THREE.Scene();

                /* 创建相机 */
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);  //透视投影相机
                /*   //正投影相机
                var width = window.innerWidth; //窗口宽度
                var height = window.innerHeight; //窗口高度
                var k = width / height; //窗口宽高比
                //可以根据最外围的海王星公转半径100 * 5设置改参数
                var s = 360;//s参数影响相机渲染的上下左右范围
                //创建相机对象
                // 注意相机参数6远裁界面可以包含全部星体在内
                camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1500);*/
                camera.position.set(400, 400, 400)
               


                /* 创建渲染器 */
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setClearColor('black');
                // renderer.setPixelRatio(window.devicePixelRatio)  // 设置设备像素比( 本质原理：修正canvas画布尺寸 )
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;
                
                /* 添加光源 */
                // 创建环境光
                ambientLight = new THREE.AmbientLight(new THREE.Color("#666666"));
                scene.add(ambientLight);

                // 创建聚光
                spotLight = new THREE.SpotLight(new THREE.Color("#ffffff"));
                // spotLight.position.set(50, 50, 50);
                spotLight.castShadow = true;
                scene.add(spotLight);

                /*  添加坐标轴 */
                // var axes = new THREE.AxisHelper(500);
                // scene.add(axes);

                /* 创建网格模型 */
                meshOptionList.forEach(e => {
                    var group = new THREE.Group();
                    let geometryOption = e.geometryOption  //太阳几何体配置
                    // 设置重复的作用是：能够让一个效果循环
                    let texture = new THREE.TextureLoader().load(e.materialOption.map)
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    let materialOption = { map: texture, side: THREE.DoubleSide }  //太阳材质
                    group.add(this.addSphere(geometryOption, materialOption, e))

                    if (e.ringOption) {  //添加星环
                        group.add(this.addRing(e.ringOption.geometryOption, e.ringOption.materialOption, e))
                    }

                    if (e.lightRing) { //添加星环光圈
                        group.add(this.addLightRing(e))
                    }

                    group.add(this.createSprite(e)) //添加光圈
                    group.name = e.text
                    group.data = e
                    group.position.set(...e.position)
                    e.mesh = group
                    console.log(group)
                    scene.add(group);

                    // let position = this.coordinateExchange(group)
                    // this.addLabelDiv(position, e)

                    // 创建轨迹线 
                    if (e.tourOption) {  //太阳不需要生成轨迹线
                        let geometryOption = e.tourOption.geometryOption  //太阳几何体配置
                        let materialOption = e.tourOption.materialOption  //太阳材质
                        e.tourMesh = this.addTour(geometryOption, materialOption, e)
                        scene.add(e.tourMesh);
                    }
                })


               /*  拾取模型事件 */
                raycaster = new THREE.Raycaster();
                mouse = new THREE.Vector2();
                window.addEventListener('click', this.onDocumentMouseDown, false);

                /* 开始循环渲染 */
                container.appendChild(renderer.domElement);
                new OrbitControls(camera, renderer.domElement);
                camera.lookAt(scene.position)
                this.renders()



            },
            getClass(item) {
                let obj = {}
                this.meshOptionList1.map(e => {
                    obj[e.name] = item.name == e.name ? true : false
                })
                return obj
            },
            clickImg(item, index) {
                this.curIndex = index

            },
            onDocumentMouseDown(event) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                // 环行星是group包含两个mesh子对象，intersectObjects方法第二个参数设置为true，可以检测子对象
                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length > 0 && !this.isMouseEnter) {
                    intersects.forEach(e => {
                        if (e.object.data) {
                            this.curIndex = e.object.data.index
                        }
                    })
                } else if (intersects.length == 0 && !this.isMouseEnter) {
                    this.curIndex = -1
                }
            },

            //生成球模型
            addSphere(sphereOption, materialOption, data) {
                var geometry = new THREE.SphereGeometry(...sphereOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var sphere = new THREE.Mesh(geometry, material);
                // sphere.position.set(...data.position)
                sphere.name = data.text
                sphere.data = data
                sphere.meshType = 'sphere'
                return sphere
            },
            // 生成轨迹线
            addTour(geoOption, materialOption, data) {
                var geometry = new THREE.TorusGeometry(...geoOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var torus = new THREE.Mesh(geometry, material);
                torus.rotation.x = Math.PI / 2
                torus.data = data
                torus.meshType = 'line'
                return torus
            },
            // 生成圆环
            addRing(geoOption, materialOption, data) {
                var geometry = new THREE.RingGeometry(...geoOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var mesh = new THREE.Mesh(geometry, material);
                // mesh.position.set(...data.position)
                mesh.rotation.x = Math.PI / 2
                return mesh
            },
            addLightRing(data) {
                let R_huan = data.geometryOption[0]
                // 创建土星环光圈
                //CnavasCir()函数返回一个canvas对象
                var texture = new THREE.CanvasTexture(this.CnavasCir());
                // 通过矩形平面创建光圈
                var lightgeometry = new THREE.PlaneGeometry(1, 1);
                var lightmaterial = new THREE.MeshBasicMaterial({ //MeshLambertMaterial
                    color: 0xC8A15C, //给canvas默认白色光圈设置特定颜色
                    transparent: true, //注意开启透明，这样canvas画布的透明背景才会透明
                    map: texture,
                    side: THREE.DoubleSide,//双面显示
                }); //材质对象
                var lightMesh = new THREE.Mesh(lightgeometry, lightmaterial); //网格模型对象
                //缩放倍数比星球直径略大，在直径基础上缩放1.2倍
                lightMesh.scale.set(2 * R_huan * 2.5, 2 * R_huan * 2.5, 1); //// 只需要设置x、y两个分量就可以
                // scene.add(lightMesh)
                //与星环在同一平面内
                lightMesh.rotateX(Math.PI / 2);
                // 光圈和环稍微错开
                lightMesh.position.y += 0.01
                return lightMesh
            },
            // 生成贴图
            getTexture(imgUrl) {
                let that = this
                return new Promise((resolve, reject) => {
                    new THREE.TextureLoader().load(imgUrl, (texture) => {
                        resolve(texture)
                    }, undefined, undefined);
                })

            },
            createSprite(data) {
                let R = data.geometryOption[0]
                var texture = new THREE.CanvasTexture(this.CnavasCir());
                var spriteMaterial = new THREE.SpriteMaterial({
                    color: new THREE.Color("rgb(255, 255, 255)"), //给canvas默认白色光圈设置特定颜色
                    transparent: true, //注意开启透明，这样canvas画布的透明背景才会透明
                    map: texture,
                });
                var sprite = new THREE.Sprite(spriteMaterial);
                //缩放倍数比星球直径略大，在直径基础上缩放1.2倍
                sprite.scale.set(2 * R * 1.2 + 1.3, 2 * R * 1.2 + 1.3, 1); //// 只需要设置x、y两个分量就可以
                return sprite;
            },
            CnavasCir() {
                // 半径
                var R = 400
                var canvas = document.createElement('canvas');
                // document.body.appendChild(canvas)
                canvas.width = R;
                canvas.height = R;
                canvas.style.background = 'rgba(255, 0, 0, 0)'
                //    获取canvas元素上下文
                var c = canvas.getContext('2d');
                //    坐标原点居中
                c.translate(R / 2, R / 2);

                //线宽
                c.lineWidth = R / 10;
                // 通过渐变色设置一个透明度渐变的光圈
                var grd = c.createRadialGradient(0, 0, R / 2 - c.lineWidth, 0, 0, R / 2);
                grd.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
                grd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                //径向渐变
                c.strokeStyle = grd;
                // c.strokeStyle = '#00ffff';
                c.arc(0, 0, (R - c.lineWidth) / 2, 0, Math.PI * 2, true);
                c.stroke();
                return canvas
            },
            //世界坐标转屏幕坐标
            coordinateExchange(mesh) {
                //创建一个三维向量作为世界坐标
                var worldVector = new THREE.Vector3();
                //获取网格模型boxMesh的世界坐标，赋值给worldVector
                mesh.getWorldPosition(worldVector);
                // 特殊情况下，局部坐标等于世界坐标
                // var worldVector = boxMesh.position.clone();
                //世界坐标转标准设备坐标，standardVector是WebGL标准设备坐标
                // .project()方法提取相机参数的视图矩阵、投影矩阵对世界坐标进行变换
                var standardVector = worldVector.project(camera);

                // 根据WebGL标准设备坐标standardVector计算div标签在浏览器页面的屏幕坐标
                // 标准设备坐标转屏幕坐标
                var a = window.innerWidth / 2;
                var b = window.innerHeight / 2;
                var x = Math.round(standardVector.x * a + a); //模型标签x坐标，单位像素
                var y = Math.round(-standardVector.y * b + b); //模型标签y坐标，单位像素
                return [x, y]
            },
            renders() {
                let that = this
                stats.update();
                scene.traverse(function (e) {

                    if (e instanceof THREE.Group && e.name == '太阳') {
                        e.rotation.y += e.data.otherOption.speed;
                        e.children[0].material.map.offset.x -= 0.003;
                        e.children[0].material.map.offset.y += 0.003;


                        if (document.querySelectorAll('.' + e.data.name) && document.querySelectorAll('.' + e.data.name)[0]) {
                            let position = that.coordinateExchange(e)
                            document.querySelectorAll('.' + e.data.name)[0].style.left = position[0] + 'px';
                            document.querySelectorAll('.' + e.data.name)[0].style.top = position[1] - 300 + 'px';
                        }

                    }

                    if (e instanceof THREE.Group && e.name != '太阳') {
                        e.data.otherOption.angle += e.data.otherOption.angleSpeed
                        var x = e.data.otherOption.radius * Math.sin(e.data.otherOption.angle);//地球x坐标计算
                        var z = e.data.otherOption.radius * Math.cos(e.data.otherOption.angle);//地球z坐标计算
                        e.position.set(x, 0, z);
                        e.rotation.y += e.data.otherOption.speed;

                        if (document.querySelectorAll('.' + e.data.name) && document.querySelectorAll('.' + e.data.name)[0]) {
                            let position = that.coordinateExchange(e)
                            document.querySelectorAll('.' + e.data.name)[0].style.left = position[0] + 'px';
                            document.querySelectorAll('.' + e.data.name)[0].style.top = position[1] - 300 + 'px';
                        }
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