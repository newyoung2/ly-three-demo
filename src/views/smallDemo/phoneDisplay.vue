<template>
    <div id="container" style="position: relative;">
        <div id="color" style="">
            <div class="colorChoose" id="map1"><img  @click="changeColor('极光紫.png')" src="../../../public//static/phoneDisplay/model/极光紫.png"></div>
            <div class="colorChoose" id="map2"><img  @click="changeColor('幻夜黑.png')" src="../../../public//static/phoneDisplay/model/幻夜黑.png"></div>
            <div class="colorChoose" id="map3"><img  @click="changeColor('珊瑚红.png')" src="../../../public//static/phoneDisplay/model/珊瑚红.png"></div>
            <div class="colorChoose" id="map4"><img  @click="changeColor('极光蓝.png')" src="../../../public//static/phoneDisplay/model/极光蓝.png"></div>
          </div>

          <div id="camera" style="visibility:visible;">
            <div>
              <div style="height:1px;width:130px;background: #00ffff;margin-top:68px"></div>
            </div>
            <div id="message" style="width:350px;height:120px;">
              <div style="padding: 10px 4px;font-size:18px;">双摄像头</div>
              <div style="padding: 10px 24px;font-size:16px;">后置主摄像头——1300万像素(F/1.8光圈)</div>
              <div style="padding: 10px 24px;font-size:16px;">后置副摄像头——200万像素的</div>
            </div>
            <div style="position:relative;">
              <div style="position: absolute;left: -30px;top: 10px;">
              </div>
            </div>
          </div>
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
    var chooseMesh = null
    var CircleLine = new THREE.Group();//线模型和720符号父对象
    let labelRenderer = null
    let sprite
    var s = 0.0;
    var mesh

    export default {
        data() {
            return {
                showDiv:false,
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
            this.clearScene()
            next()    //允许跳转页面
        },
        methods: {
            async init() {
                let that = this
                let container = document.getElementById('container');
                console.log(container)
                // 创建场景
                scene = new THREE.Scene();

                // 创建相机
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);  //透视投影相机
                camera.position.set(292, 223, 185);//相机在Three.js三维坐标系中的位置
                camera.lookAt(0, 0, 0);//相机指向Three.js坐标系原点

                /**
* 光源设置
*/
                // 平行光1
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(100, 75, 30);
                scene.add(directionalLight);
                // 平行光2
                var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight2.position.set(-100, -75, -30);
                scene.add(directionalLight2);
                //环境光
                var ambient = new THREE.AmbientLight(0xffffff, 1.6);
                scene.add(ambient);


                // Three.js三维坐标轴 三个坐标轴颜色RGB分别对应xyz轴
                var axesHelper = new THREE.AxesHelper(250);
                // scene.add(axesHelper);

                // 加载模型
                that.loadModel()
                that.addCurve()

                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);//设置设备像素比率,防止Canvas画布输出模糊。
                // renderer.setClearColor(0x005577);
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
                // labelRenderer.domElement.style.width = '1000px'
                // labelRenderer.domElement.style.width = '50vh'
                labelRenderer.domElement.style.position = 'absolute';
                // 避免renderer.domElement影响HTMl标签定位，设置top为0px
                labelRenderer.domElement.style.top = '0px';
                labelRenderer.domElement.style.left = '252px';//HTML标签尺寸宽度一半
                labelRenderer.domElement.style.pointerEvents = 'none';//避免HTML标签遮挡三维场景的鼠标事件
                document.body.appendChild(labelRenderer.domElement);


                this.renders()

            },
             //改变手机壳颜色
            changeColor(val){
                var texLoader = new THREE.TextureLoader();//纹理贴图加载器
                let map = texLoader.load(process.env.BASE_URL + "static/phoneDisplay/model/" + val)
                map.flipY = false;// 纹理朝向texture.flipY
                mesh.material.map = map
            },
            // 加载模型
            loadModel() {
                let that = this
                var loader = new GLTFLoader(); //创建一个GLTF加载器
                let group = new THREE.Group()
                // 加载环境贴图
                var textureCube = new THREE.CubeTextureLoader()
                    .setPath(process.env.BASE_URL + 'static/phoneDisplay/model/envMap/')
                    .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
                loader.load(process.env.BASE_URL + 'static/phoneDisplay/model/手机.glb', function (gltf) {//gltf加载成功后返回一个对象
                    console.log('控制台查看gltf对象结构', gltf);
                    group.add(gltf.scene)


                    // 模型中包含两个空对象分别对应手机前后摄像头的位置，主要是为了方便读取摄像头的世界坐标
                    var frontObject3D = gltf.scene.getObjectByName('后置摄像头位置');
                    sprite = that.CreatePointsTag(frontObject3D)
                    sprite.position.x -= 6;//向右侧稍微偏移，不要叠加在相机上
                    sprite.position.z -= 4;//根据sprite大小平移，避免任意观察角度精灵插入到相机内
                    // 多个半透明对象叠加，three.js渲染的时候很可能出现问题，可以尝试手动排序解决

                    sprite.renderOrder = 1;
                    group.add(sprite);

                    
                    group.add(that.addTag(sprite));
                    scene.add(group)

                    //根据手机节点名称.name找到对应模型对象
                     mesh = gltf.scene.getObjectByName('手机');//找到手机Mesh
                    // console.log('mesh', mesh);
                    var texLoader = new THREE.TextureLoader();//纹理贴图加载器
                    // mesh.material：设置手机Mesh材质
                    mesh.material = new THREE.MeshStandardMaterial({
                        // color:0xffffff,
                        metalness: 1.0,//Mesh表面金属度，默认值0.5
                        roughness: 1.0,//Mesh表面粗糙度，默认值0.5
                        map: texLoader.load(process.env.BASE_URL + "static/phoneDisplay/model/极光蓝.png"), //颜色贴图
                        // 金属度、粗糙度贴图表示的值会和金属度、粗糙度分别相乘
                        roughnessMap: texLoader.load(process.env.BASE_URL + "static/phoneDisplay/model/roughness.png"), //粗糙度贴图
                        metalnessMap: texLoader.load(process.env.BASE_URL + "static/phoneDisplay/model/metallic.png"), //金属度贴图
                        // 相机镜头等位置需要设置半透明效果(设置alphaMap和transparent属性)
                        alphaMap: texLoader.load(process.env.BASE_URL + "static/phoneDisplay/model/opacity.png"),//alpha贴图

                        normalMap: texLoader.load(process.env.BASE_URL + "static/phoneDisplay/model/normal.png"), //法线贴图
                        transparent: true, //使用alphaMap，注意开启透明计算
                        envMap: textureCube, //设置pbr材质环境贴图，渲染效果更好
                        envMapIntensity: 0.5, //设置环境贴图对模型表面影响程度
                    })
                    // 纹理朝向texture.flipY
                    mesh.material.map.flipY = false;
                    mesh.material.normalMap.flipY = false;
                    mesh.material.metalnessMap.flipY = false;
                    mesh.material.roughnessMap.flipY = false;
                    mesh.material.alphaMap.flipY = false;
                    mesh.renderOrder = 0; //renderOrder小的先渲染
                })

            },
            // 添加摄像头信息框
            addTag(sprite){
                // 创建div元素(作为标签)
                var div = document.getElementById("camera")
                var label = new CSS2DObject(div);
                label.position.copy(sprite.position);
                
                // 设置HTML元素标签在three.js世界坐标中位置
                // label.position.set(x, y, z);
                return label;//返回CSS2模型标签 
            },
            //创建摄像头精灵粒子原点
            CreatePointsTag(obj) {
                // 精灵模型+背景透明png贴图实现光点效果
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: new THREE.TextureLoader().load(process.env.BASE_URL + "static/phoneDisplay/model/光点.png"), //设置精灵纹理贴图
                    transparent: true,
                });
                var sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(6, 6, 1); //大小设置

                var pos = new THREE.Vector3();
                obj.getWorldPosition(pos);//获取参数obj的世界坐标
                sprite.position.copy(pos); //光点位置设置
                
                return sprite
            },
            //创建圆弧
            addCurve() {
                /**
                  * 创建圆弧线条模型
                */
                var geometry = new THREE.BufferGeometry(); //声明一个几何体对象BufferGeometry
                //参数：0, 0圆弧坐标原点x，y  100：圆弧半径    0, 2 * Math.PI：圆弧起始角度
                var R = 50;//半径
                var arc = new THREE.ArcCurve(0, 0, R, Math.PI / 2 + Math.PI / 6, Math.PI / 2 - Math.PI / 6);
                //getPoints是基类Curve的方法，返回一个vector2对象作为元素组成的数组
                var points = arc.getPoints(50);//分段数50，返回51个顶点
                // setFromPoints方法从points中提取数据改变几何体的顶点位置数据.attributes.position
                geometry.setFromPoints(points);
                // console.log(geometry.attributes.position);
                //材质对象
                var material = new THREE.LineBasicMaterial({
                    color: 0xffffff,//线条颜色
                });
                //线条模型对象
                var line = new THREE.Line(geometry, material);
                line.rotateX(Math.PI / 2);//绕x轴旋转90度

                CircleLine.add(line);
                CircleLine.position.y -= 78;//平移到产品的底部

                var loader = new THREE.FontLoader();
                // THREE.FontLoader加载字体
                loader.load(process.env.BASE_URL + 'static/phoneDisplay/model/helvetiker_bold.typeface.json', function (font) {
                    var material = new THREE.MeshLambertMaterial({
                        color: 0xffffff,
                        side: THREE.DoubleSide,
                    });
                    // .generateShapes()：获得字符'720°'的轮廓顶点坐标
                    var Shapes = font.generateShapes('HUAWEI', 10);//10)控制字符大小
                    var geometry = new THREE.ShapeGeometry(Shapes);//通过多个多边形轮廓生成字体
                    var textMesh = new THREE.Mesh(geometry, material);
                    textMesh.position.z = R;
                    textMesh.position.x = -28;
                    CircleLine.add(textMesh)
                    scene.add(CircleLine)
                });
            },
            onDocumentMouseDown(event) {
                
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects([sprite]);
                if (intersects.length > 0) {
                    if(labelRenderer.domElement.children[0].style.visibility == 'hidden'){
                        labelRenderer.domElement.children[0].style.visibility = 'visible'
                    }else{
                        labelRenderer.domElement.children[0].style.visibility = 'hidden'
                       
                    }
                    console.log(labelRenderer.domElement.children[0].id)
                    
                }
            },
             // 销毁对象释放内存
            clearScene() {
                window.removeEventListener('click', this.onDocumentMouseDown, false);
                
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
                labelRenderer.domElement.innerHTML = ''
                labelRenderer = null
                console.log('clearScene');
            },
            
            renders() {
                let that = this

                // 设置标注精灵Sprite波动，提示用户点击
                if (sprite) {
                    s += 0.01;
                    if (s < 0.5) {
                        sprite.scale.x = 6 * (1 + s);
                        sprite.scale.y = 6 * (1 + s);
                    } else if (s >= 0.5 && s < 1.0) {
                        sprite.scale.x = 6 * (2 - s);
                        sprite.scale.y = 6 * (2 - s);
                    } else {
                        s = 0.0;
                    }
                }

                labelRenderer?labelRenderer.render(scene, camera):''
                requestAnimationFrame(this.renders);
                renderer?renderer.render(scene, camera):''
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
        font-size: 18px;
        padding: 8px 12px;
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

    #message {
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      padding: 0px;
      /* 边框 */
      background: linear-gradient(#00ffff, #00ffff) left top,
        linear-gradient(#00ffff, #00ffff) left top,
        linear-gradient(#00ffff, #00ffff) right bottom,
        linear-gradient(#00ffff, #00ffff) right bottom;
      background-repeat: no-repeat;
      background-size: 1px 20px, 36px 1px;
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-size: 18px;
      padding: 8px 12px;
    }

    #color {
      width: 314px;
      position: absolute;
      /* top: 30px; */
      bottom: 12px;
      left: calc(50% - 150px);
      /* background:rgba(255,255,255,0.1); */
    }
    

    .colorChoose {
      display: inline-block;
      margin-left: 20px;
      cursor: pointer;
    }

    .colorChoose img {
      width: 50px;
    }
</style>