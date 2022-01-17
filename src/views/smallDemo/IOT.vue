<template>
    <div id="container"></div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let controls
    let raycaster
    let mouse
    var chooseMesh = null
    var granaryArr = [];//所有粮仓模型对象的集合，export导出用于射线拾取
    let labelRenderer = null
    let fireMesh 

    export default {
        data() {
            return {
                imgUrlPreix: process.env.BASE_URL + 'static/solarSystem/UI/按钮/',
                imgUrlPreix1: process.env.BASE_URL + 'static/solarSystem/UI/标签/',

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
                let container = document.getElementById('container');

                // 创建场景
                scene = new THREE.Scene();

                // 设置雾化效果，雾的颜色和背景颜色相近，这样远处网格线和背景颜色融为一体
                scene.fog = new THREE.Fog(0x005577, -100, 1000);

                // 创建相机
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);  //透视投影相机
                camera.position.set(174, 87, 152); //相机在Three.js坐标系中的位置

                // 平行光1
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight.position.set(400, 200, 300);
                scene.add(directionalLight);
                // 平行光2
                var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight2.position.set(-400, -200, -300);
                scene.add(directionalLight2);
                //环境光
                var ambient = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambient);


                // Three.js三维坐标轴 三个坐标轴颜色RGB分别对应xyz轴
                var axesHelper = new THREE.AxesHelper(250);
                // scene.add(axesHelper);

                // 加载模型
                that.loadModel()

                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);//设置设备像素比率,防止Canvas画布输出模糊。
                renderer.setClearColor(0x005577);
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;
                renderer.outputEncoding = THREE.sRGBEncoding;//解决加载gltf格式模型纹理贴图和原图不一样问题

                /*  拾取模型事件 */
                raycaster = new THREE.Raycaster();
                mouse = new THREE.Vector2();
                window.addEventListener('click', this.onDocumentMouseDown, false);

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);

                // 创建一个CSS2渲染器CSS2DRenderer
                labelRenderer = new CSS2DRenderer();
                labelRenderer.setSize(window.innerWidth, window.innerHeight);
                labelRenderer.domElement.style.position = 'absolute';
                // 避免renderer.domElement影响HTMl标签定位，设置top为0px
                labelRenderer.domElement.style.top = '0px';
                labelRenderer.domElement.style.left = '0px';
                //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
                labelRenderer.domElement.style.pointerEvents = 'none';
                document.body.appendChild(labelRenderer.domElement);


                this.renders()

            },
            // 加载模型
            loadModel() {
                var loader = new GLTFLoader(); //创建一个GLTF加载器
                loader.load(process.env.BASE_URL + 'static/IOT/model.glb', function (gltf) {//gltf加载成功后返回一个对象
                    console.log('控制台查看gltf对象结构', gltf);
                    // 递归遍历gltf.scene
                    gltf.scene.traverse(function (object) {
                        if (object.type === 'Mesh') {
                            // 批量更改所有Mesh的材质---如果材质共享   点击模型改变材质属性的时候所有模型材质都会变  所以要把材质重新生成材质对象
                            object.material = new THREE.MeshLambertMaterial({
                                map: object.material.map, //获取原来材质的颜色贴图属性值
                                color: object.material.color, //读取原来材质的颜色
                            })
                        }
                    })
                    // 所有粮仓模型的父对象名称：'粮仓'
                    var group = gltf.scene.getObjectByName('粮仓');
                    //console.log('粮仓', group);
                    group.traverse(function (obj) {
                        if (obj.type === 'Mesh') {
                            granaryArr.push(obj);
                        }
                    })
                    scene.add(gltf.scene)
                })

            },
            addFire(name) {
                // 矩形平面网格模型，用来渲染火焰的动画效果
                var w = 25;//火焰宽度  通过参数w可以快速调节火焰大小，以便于适应对应的三维场景
                var h = 1.6 * w;//火焰高度
                var geometry = new THREE.PlaneBufferGeometry(w, h); //矩形平面
                geometry.translate(0, h / 2, 0);//火焰底部中点和局部坐标系坐标原点重合

                var textureLoader = new THREE.TextureLoader();//纹理贴图加载器
                var texture = textureLoader.load(process.env.BASE_URL + 'static/IOT/火焰.png');//创建一个纹理对象
                var num = 15; //火焰多少帧图
                // .repeat方法设置uv两个方向纹理重复数量
                texture.repeat.set(1 / num, 1);// 1/num：从图像上截图一帧火焰
                // texture.offset.x = 0 / num;//选择第1帧火焰
                // texture.offset.x = 1 / num;//选择第2帧火焰
                // texture.offset.x = (num-1) / num;//选择第一帧火焰
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.4,//整体调节透明度 和三维场景相融合
                    side: THREE.DoubleSide, //双面可见
                    depthWrite: false,//是否对深度缓冲区有任何的影响
                });
                var mesh = new THREE.Mesh(geometry, material);// 火焰网格模型
                var flame = new THREE.Group();//火焰组对象
                // 两个火焰mesh交叉叠加
                // flame.add(mesh, mesh.clone().rotateY(Math.PI / 2))
                // 四个火焰mesh交叉叠加
                flame.add(mesh, mesh.clone().rotateY(Math.PI / 2), mesh.clone().rotateY(Math.PI / 4), mesh.clone().rotateY(Math.PI / 4 * 3))


                var t = 0;
                var stopAnimationFrame = null;
                // 火焰动画生成
                function UpdateLoop() {
                    t += 0.1;//调节火焰切换速度
                    if (t > num) t = 0;
                    //  Math.floor(t)取整 保证一帧一帧切换
                    texture.offset.x = Math.floor(t) / num;// 动态更新纹理偏移 播放关键帧动画 产生火焰然后效果
                    stopAnimationFrame = window.requestAnimationFrame(UpdateLoop); //请求再次执行函数UpdateLoop
                }
                UpdateLoop();

                // 火焰停止
                flame.stop = function () {
                    window.cancelAnimationFrame(stopAnimationFrame);//取消动画
                }

                // 火焰上方标签
                var messageTag = this.tag("粮仓 " + name + " 失火了 ！！！");
                messageTag.name = 'fireMesh'
                flame.add(messageTag);//id"messageTag"对应的HTML元素作为three.js标签
                messageTag.position.y += 40;//考虑火焰高度 向上适当偏移
                flame.tag = messageTag;//火焰自定义一个属性指向自己的HTML标签
                flame.name = Math.random()
                // flame.stop()
                return flame;
            },
            tag(name) {
                // 创建div元素(作为标签)
                var div = document.createElement('div');
                div.innerHTML = name;
                div.classList.add('tag');
                //div元素包装为CSS2模型对象CSS2DObject
                var label = new CSS2DObject(div);
                console.log(label)
                div.style.pointerEvents = 'none';//避免HTML标签遮挡三维场景的鼠标事件
                // 设置HTML元素标签在three.js世界坐标中位置
                // label.position.set(x, y, z);
                return label;//返回CSS2模型标签      
            },
            onDocumentMouseDown(event) {
                if (chooseMesh) {
                    // 把上次选中的mesh设置为原来的颜色
                    chooseMesh.material.color.set(0xffffff);
                }

                if(fireMesh){
                    fireMesh.remove(fireMesh.getObjectByName('fireMesh'))
                    scene.remove(fireMesh);
                }
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(granaryArr);
                console.log(intersects)
                if (intersects.length > 0) {
                    chooseMesh = intersects[0].object;
                    chooseMesh.material.color.set(0x00ffff);//选中改变颜色

                    fireMesh = this.addFire(chooseMesh.name)
                    var pos = new THREE.Vector3();
                    chooseMesh.getWorldPosition(pos);//获取粮仓granary世界坐标设置火焰位置
                    fireMesh.position.copy(pos)
                    if (chooseMesh.parent.name == "立筒仓") {
                        fireMesh.position.y += 36;//加上粮仓顶部高度
                    } else if (chooseMesh.parent.name == "浅圆仓") {
                        fireMesh.position.y += 20;
                    } else if (chooseMesh.parent.name == "平房仓") {
                        fireMesh.position.y += 17;
                    }

                    fireMesh.position.y += -4;//适当向下偏移

                    scene.add(fireMesh)
                }
            },
            renders() {
                let that = this
                // console.log(camera.position)
                labelRenderer.render(scene, camera);
                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
            }

        },
    };

</script>

<style >
    .labelstyle {
        height: 20px;
        background: rgba(0, 0, 0, 0.3);
        color: white;
        position: absolute;
        /* padding: 5px; */
        border-radius: 8px;
        visibility: hidden;
    }

    #container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;

    }

    .tag {
      /* border:solid #009999 1px; */
      background: linear-gradient(#00ffff, #00ffff) left top,
        linear-gradient(#00ffff, #00ffff) left top,
        linear-gradient(#00ffff, #00ffff) right bottom,
        linear-gradient(#00ffff, #00ffff) right bottom;
      background-repeat: no-repeat;
      background-size: 1px 6px, 6px 1px;
      background-color: rgba(0, 0, 0, 0.4);
      color: #ffffff;
      font-size:18px;
      padding:8px 12px;     
    }
</style>