<template>
    <div id="container" style="position: relative;">
    </div>
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
    var mesh
    var model = new THREE.Group(); //声明一个组对象，用来添加城市三场场景的模型对象
    var texture

    export default {
        data() {
            return {
                showDiv: false,
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
        beforeRouteLeave(to, from, next) {
            // 导航离开该组件的对应路由时调用
            // this.clearScene()
            next()    //允许跳转页面
        },
        methods: {
            async init() {
                let that = this
                let container = document.getElementById('container');
                // 创建场景
                scene = new THREE.Scene();

                // 创建相机
                camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.001, 10000);  //透视投影相机
                camera.position.set(292, 223, 185);//相机在Three.js三维坐标系中的位置
                camera.lookAt(0, 0, 0);//相机指向Three.js坐标系原点

                /**
 * 光源设置
 */
                // 平行光1
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(400, 200, 300);
                scene.add(directionalLight);
                // 平行光2
                var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight2.position.set(-400, -200, -300);
                scene.add(directionalLight2);
                //环境光
                var ambient = new THREE.AmbientLight(0xffffff, 0.3);
                scene.add(ambient);

                // Three.js三维坐标轴 三个坐标轴颜色RGB分别对应xyz轴
                var axesHelper = new THREE.AxesHelper(250);
                scene.add(axesHelper)

                this.addCustomShape()

                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);//设置设备像素比率,防止Canvas画布输出模糊。
                // renderer.setClearColor(0x005577);
                renderer.setSize(container.clientWidth, container.clientHeight);
                // renderer.shadowMapEnabled = true;
                // renderer.outputEncoding = THREE.sRGBEncoding;//解决加载gltf格式模型纹理贴图和原图不一样问题

                /*  拾取模型事件 */
                // raycaster = new THREE.Raycaster();
                // mouse = new THREE.Vector2();
                // window.addEventListener('click', this.onDocumentMouseDown, false);

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);  //执行new OrbitControls   会默认执行camera.lookAt(0,0,0)



                this.renders()

            },
            addCustomShape() {
                var c = [
                    0, 0, //顶点1坐标
                    60, 0, //顶点2坐标
                    60, 80, //顶点3坐标
                    40, 120, //顶点4坐标
                    -20, 80, //顶点5坐标
                    0, 0, //顶点6坐标  和顶点1重合
                ]
                var posArr = [];
                var uvArr = []
                var h = 20; //围墙拉伸高度
                for (var i = 0; i < c.length - 2; i += 2) {
                    // 顶点坐标
                    posArr.push(c[i], c[i + 1], 0, c[i + 2], c[i + 3], 0, c[i + 2], c[i + 3], h);
                    posArr.push(c[i], c[i + 1], 0, c[i + 2], c[i + 3], h, c[i], c[i + 1], h)
                    // uv映射坐标
                    uvArr.push(0, 0, 1, 0, 1, 1)
                    uvArr.push(0, 0, 1, 1, 0, 1)
                }

                let geometry = new THREE.BufferGeometry()
                // 设置几何体attributes属性的位置position属性
                geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(posArr), 3);
                geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(uvArr), 2);
                geometry.computeVertexNormals();
                var material = new THREE.MeshLambertMaterial({
                    color: 0x00ffff, //三角面颜色
                    map: new THREE.TextureLoader().load(process.env.BASE_URL + 'static/wisdomCity/渐变.png'),
                    side: THREE.DoubleSide, //两面可见
                    transparent: true,
                    depthTest: false,
                    // wireframe:true,//查看三角形结构
                });
                var mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                mesh.rotateX(-Math.PI / 2);
                scene.add(mesh)


                let geometry2 = new THREE.BufferGeometry()
                // 设置几何体attributes属性的位置position属性
                geometry2.attributes.position = new THREE.BufferAttribute(new Float32Array(posArr), 3);
                geometry2.attributes.uv = new THREE.BufferAttribute(new Float32Array(uvArr), 2);
                geometry2.computeVertexNormals();
                texture = new THREE.TextureLoader().load(process.env.BASE_URL + 'static/wisdomCity/流动.png');
                // 设置阵列模式为 RepeatWrapping
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                texture.repeat.x = 2;// x方向阵列
                var material2 = new THREE.MeshLambertMaterial({
                    color: 0x00ffff, //三角面颜色
                    map: texture,
                    side: THREE.DoubleSide, //两面可见
                    transparent: true,
                    depthTest: false,
                    // wireframe:true,//查看三角形结构
                });
                var mesh2 = new THREE.Mesh(geometry2, material2); //网格模型对象Mesh
                mesh2.rotateX(-Math.PI / 2);
                mesh2.scale.set(1.01, 1.01, 1.01)
                scene.add(mesh2)


            },
            renders() {
                let that = this
                texture.offset.y -= 0.02
                renderer.render(scene, camera); //执行渲染操作
                requestAnimationFrame(this.renders); //请求再次执行渲染函数render，渲染下一帧
            },
            // 销毁对象释放内存
            clearScene() {

                cancelAnimationFrame(this.renders);
                scene.traverse((child) => {
                    if (child.material) {
                        child.material.dispose();
                    }
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    child = null;
                });
                renderer.forceContextLoss();
                renderer.dispose();
                scene.clear();
                scene = null;
                camera = null;
                controls = null;
                renderer.domElement = null;
                renderer = null;
                console.log('clearScene');
            },



        },
    };

</script>

<style>
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

    #camera {
        position: absolute;
        display: flex;
        /* display: none; */
        /* row是flex-direction默认值,可以不设置，表示主轴为水平方向，从左向右排列*/
        flex-direction: row;
        /*space-between表示*/
        justify-content: space-between;
    }
</style>