<template>
    <div id="container" style="position: relative;">
    </div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
    import output_fragment from './output_fragment.glsl.js'
    import Stats from "stats.js";
    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let controls
    let raycaster
    let mouse
    var mesh
    var model = new THREE.Group(); //声明一个组对象，用来添加城市三场场景的模型对象
    var texture
    let stats
    let materialShader
    // 创建一个时钟对象Clock
    var clock = new THREE.Clock();
    // 流动动画 最简单方式就是使用texture的offset属性实现  也可以用更麻烦的shader实现
    var t = 0;

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

                /* 性能监控 */
                //创建stats对象
                stats = new Stats();
                stats.domElement.style.left = '467px';
                //Stats.domElement:web页面上输出计算结果,一个div元素
                document.body.appendChild(stats.domElement);

                let container = document.getElementById('container');
                // 创建场景
                scene = new THREE.Scene();

                // 创建相机
                camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.001, 10000);  //透视投影相机
                camera.position.set(121.49537501716102, 31.197166974577133, 0.01721725807906459);///相机在Three.js三维坐标系中的位置
                var x = 121.49526536464691;//东方明珠经纬度坐标
                var y = 31.24189350905988;

                camera.lookAt(x, y, 0);//根据黄浦江几何中心坐标或附近某个经纬度坐标设置

                /**
                 * 光源设置
                */
                // 平行光1
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(200, 400, 300);
                scene.add(directionalLight);
                // 平行光2
                var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight2.position.set(-200, -400, 300);
                scene.add(directionalLight2);
                //环境光
                var ambient = new THREE.AmbientLight(0xffffff, 0.3);
                scene.add(ambient);

                // Three.js三维坐标轴 三个坐标轴颜色RGB分别对应xyz轴
                // var axesHelper = new THREE.AxesHelper(250);
                // scene.add(axesHelper)


                that.addRiver()
                that.addCityBuilding()


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
                // 相机控件与.lookAt()无效( .target属性 )
                controls.target.set(x, y, 0);
                controls.update(); //update()函数内会执行camera.lookAt(controls.targe)


                this.renders()

            },
            renders() {
                let that = this

                stats.update();

                // 黄浦江流动动画
                t += 0.02;
                var y = 0.05 * Math.sin(t);
                if (texture) {
                    texture.offset.x = y;
                    texture.offset.y = y;
                }


                // 发光带动画
                // 获得两次scanAnimation执行的时间间隔deltaTime
                var deltaTime = clock.getDelta();
                // console.log(deltaTime)
                // 更新uniforms中时间，这样就可以更新着色器中time变量的值
                if (materialShader) {
                    materialShader.uniforms.time.value += deltaTime;
                    if (materialShader.uniforms.time.value > 6) materialShader.uniforms.time.value = 0;
                }


                renderer.render(scene, camera); //执行渲染操作
                requestAnimationFrame(this.renders); //请求再次执行渲染函数render，渲染下一帧
            },
            // 添加城市建族群
            addCityBuilding() {
                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                /* lineData为计算后的数据  这样节省cpu的计算  并将多个线条合并为一个 */
                loader.load(process.env.BASE_URL + 'static/wisdomCity/上海外滩.json', (data) => {
                    console.log(data)
                    var material = new THREE.MeshLambertMaterial({
                        color: 0x009999,
                    }); //材质对象

                    // GPU执行material对应的着色器代码前，通过.onBeforeCompile()插入新的代码，修改已有的代码
                    material.onBeforeCompile = function (shader) {
                        materialShader = shader;
                        shader.uniforms.time = {
                            value: 0.0,
                        };
                        // 浏览器控制台打印着色器代码
                        // console.log('shader.fragmentShader', shader.fragmentShader)
                        // 顶点位置坐标position类似uv坐标进行插值计算，用于在片元着色器中控制片元像素
                        shader.vertexShader = shader.vertexShader.replace(
                            'void main() {',
                            ['varying vec3 vPosition;',
                                'void main() {',
                                'vPosition = position;',
                            ].join('\n') // .join()把数组元素合成字符串
                        );
                        shader.fragmentShader = shader.fragmentShader.replace(
                            'void main() {',
                            ['varying vec3 vPosition;',
                                'uniform float time;',
                                'void main() {',
                            ].join('\n')
                        );

                        shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', output_fragment);
                        console.log(shader)
                    };

                    var buildGroup = null; //作为所有每栋楼Mesh的父对象
                    let buildingArr = []
                    data.features.map((e, i) => {
                        if (e.geometry) {

                            let vecArr = e.geometry.coordinates[0].map(e1 => {
                                return new THREE.Vector2(e1[0], e1[1])
                            })
                            let shape = new THREE.Shape(vecArr)
                            var geometry = new THREE.ExtrudeBufferGeometry( //拉伸造型
                                shape, //多个多边形二维轮廓
                                //拉伸参数
                                {
                                    depth: this.xy2lon(e.properties.Floor * 3), //拉伸高度
                                    bevelEnabled: false, //无倒角
                                }
                            );

                            buildingArr.push(geometry)
                            // buildGroup.add(mesh)
                        }


                    })
                    buildGroup = BufferGeometryUtils.mergeBufferGeometries(buildingArr);
                    var mesh = new THREE.Mesh(buildGroup, material); //网格模型对象
                    this.CenterAll(mesh)
                    scene.add(mesh)

                })
            },
            // 如果整个场景中建筑、河流、道路等都是采用经纬度数据渲染，这时候设置楼的高度，大家比较熟悉的往往是多少米
            // 为了方便，可以考虑写一个专门的函数，按照一定比例，把楼的高度米,当做地球赤道上一段弧长，计算该弧长对应多少经度 
            // 比例计算：不一定严格遵循下面楼高和经度比例，视觉上大概正确即可
            xy2lon(height) {
                // 20037508.34对应地球经度的180度
                var newHeight = height / 20037508.34 * 180;
                // 返回球面坐标
                return newHeight;
            },
            //经纬度转墨卡托坐标系
            lon2xy(longitude, latitude) {
                var E = longitude;
                var N = latitude;
                var x = E * 20037508.34 / 180;
                var y = Math.log(Math.tan((90 + N) * Math.PI / 360)) / (Math.PI / 180);
                y = y * 20037508.34 / 180;
                return {
                    x: x, //墨卡托x坐标——对应经度
                    y: y, //墨卡托y坐标——对应维度
                }
            },
            CenterAll(group) {
                // 包围盒计算模型对象的大小和位置
                var box3 = new THREE.Box3();
                box3.expandByObject(group); // 计算模型包围盒
                console.log('查看包围盒box3', box3);
                var size = new THREE.Vector3();
                box3.getSize(size); // 计算包围盒尺寸
                console.log('查看返回的包围盒尺寸', size);
                var center = new THREE.Vector3();
                box3.getCenter(center); // 计算一个层级模型对应包围盒的几何体中心坐标
                console.log('几何中心', center);
            },
            // 添加黄浦江模型
            addRiver() {
                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                /* lineData为计算后的数据  这样节省cpu的计算  并将多个线条合并为一个 */
                loader.load(process.env.BASE_URL + 'static/wisdomCity/黄浦江.json', (data) => {

                    let riverData = data.features[0].geometry.coordinates[0]
                    let riverDataVec2 = riverData.map(e => {
                        return new THREE.Vector2(e[0], e[1])
                    })
                    let mesh = this.getShapeGeometry(riverDataVec2)
                    scene.add(mesh);
                })
            },
            getShapeGeometry(v) {
                let shape = new THREE.Shape(v)
                // console.log(shape)
                var geometry = new THREE.ShapeBufferGeometry(shape);
                console.log(geometry)
                var pos = geometry.attributes.position; //顶点位置坐标
                var uv = geometry.attributes.uv; //顶点UV坐标
                var count = pos.count; //顶点数量
                var xArr = []; //多边形polygon的所有x坐标
                var yArr = []; //多边形polygon的所有y坐标
                for (var i = 0; i < count; i++) {
                    xArr.push(pos.getX(i));
                    yArr.push(pos.getY(i));
                }
                // minMax()计算polygon所有坐标,返回的极大值、极小值
                var [xMin, xMax] = this.minMax(xArr);
                var [yMin, yMax] = this.minMax(yArr);
                var xL = xMax - xMin;
                var yL = yMax - yMin;
                // 根据多边形顶点坐标与最小值差值占最大值百分比，设置UV坐标大小 把UV坐标范围控制在[0,1]范围
                for (var i = 0; i < count; i++) {
                    var uvx = (pos.getX(i) - xMin) / xL;
                    var uvy = (pos.getY(i) - yMin) / yL;
                    uv.setXY(i, uvx, uvy)
                }



                // 水面颜色贴图
                texture = new THREE.TextureLoader().load(process.env.BASE_URL + 'static/wisdomCity/水面.jpg');
                // 水面法线贴图
                var normalTexture = new THREE.TextureLoader().load(process.env.BASE_URL + 'static/wisdomCity/normal.jpg');
                // 设置阵列模式为 RepeatWrapping
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                // 水面区域比较大的话，纹理贴图不能无限大，一般可以通过阵列解决。
                texture.repeat.set(20, 20); // x和y方向阵列纹理贴图
                normalTexture.wrapS = THREE.RepeatWrapping
                normalTexture.wrapT = THREE.RepeatWrapping
                normalTexture.repeat.set(20, 20);

                // lambert不支持法线 使用高光材质Phong
                var material = new THREE.MeshPhongMaterial({
                    // color: 0x0099ff,
                    map: texture,
                    normalMap: normalTexture,
                    normalScale: new THREE.Vector2(5, 5)
                }); //材质对象
                let mesh = new THREE.Mesh(geometry, material);
                return mesh
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
            //   多边形坐标进行排序
            minMax(arr) {
                // 数组元素排序
                arr.sort(this.compareNum);
                // 返回极小值和极大值
                return [arr[0], arr[arr.length - 1]]
            },
            // 数组排序规则
            compareNum(num1, num2) {
                if (num1 < num2) {
                    return -1;
                } else if (num1 > num2) {
                    return 1;
                } else {
                    return 0;
                }
            }



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