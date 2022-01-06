<template>
    <div id="container">

    </div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    /* 后期处理相关库 */
    import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
    import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
    import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
    import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
    import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js"


    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let ambientLight  //自然光
    let spotLight   //聚光
    let raycaster
    let mouse
    let controls

    let composer
    let outlinePass
    let renderPass
    let effectFXAA
    let mesh
    let meshCenter

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
                camera.position.set(550, 0, 0)


                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: false });
                renderer.setClearColor('black');
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;

                // 创建环境光
                ambientLight = new THREE.AmbientLight(new THREE.Color("#666666"));
                scene.add(ambientLight);

                // 创建聚光
                spotLight = new THREE.SpotLight(new THREE.Color("#ffffff"));
                // spotLight.position.set(50, 50, 50);
                spotLight.castShadow = true;
                scene.add(spotLight);

                // 添加坐标轴
                // var axes = new THREE.AxisHelper(500);
                // scene.add(axes);

                // 创建网格模型
                let sphereOption = [200, 132, 132]
                let texture = new THREE.TextureLoader().load(`${process.env.BASE_URL}static/solarSystem/全景图.jpg`)
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                let materialOption = {
                     map: texture, 
                     side: THREE.DoubleSide ,
                    // color: Math.random() * 0xffffff
                }
                 mesh = this.addSphere(sphereOption, materialOption)
                scene.add(mesh)
               
                meshCenter = mesh.position
               


                /* 后期渲染--点击高亮 */
                // 创建一个渲染器通道，场景和相机作为参数
                renderPass = new RenderPass(scene, camera);
                // 创建OutlinePass通道,显示外轮廓边框
                outlinePass = new OutlinePass(new THREE.Vector2(container.clientWidth, container.clientHeight), scene,
                    camera);
                // 后处理完成，设置renderToScreen为true，后处理结果在Canvas画布上显示
                outlinePass.renderToScreen = true;

                //设置要显示边框的网格模型
                //交互的时候可以设置一个鼠标事件，点击选中了某个模型，就直接把某个网格模型作为值的元素
                // OutlinePass.selectedObjects = [mesh];


                //OutlinePass相关属性设置
                outlinePass.selectedObjects = [mesh]
                outlinePass.visibleEdgeColor.set(0xffffff);//模型描边颜色，默认白色          
                outlinePass.edgeThickness = 4.0;//轮廓边缘描边厚度
                outlinePass.edgeStrength = 160.0;//边缘发光强度,数值大，更亮一些
                // OutlinePass.pulsePeriod = 2;//模型闪烁频率控制，默认0表示不闪烁
                // OutlinePass.hiddenEdgeColor.set(0x220101);//模型被遮挡部分描边颜色控制        
                // OutlinePass.edgeGlow = 0.0;//边缘发光，默认0.0
                // OutlinePass.downSampleRatio = 2;//下采样比,默认2
                // OutlinePass.usePatternTexture = true;//纹理,默认false

                // 创建后处理对象EffectComposer，WebGL渲染器作为参数
                composer = new EffectComposer(renderer);
                // 设置renderPass通道
                composer.addPass(renderPass);
                // 设置OutlinePass通道
                composer.addPass(outlinePass);

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);
                //透视投影相机：相机距离目标观察点距离越远显示越小，距离越近显示越大
                //相机距离观察目标点极小距离——模型最大状态
                // controls.minDistance = 0;
                //相机距离观察目标点极大距离——模型最小状态
                // controls.maxDistance = 150;


                this.renders()

            },
            //生成球模型
            addSphere(sphereOption, materialOption) {
                var geometry = new THREE.SphereGeometry(...sphereOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var sphere = new THREE.Mesh(geometry, material);
                // sphere.position.set(...data.position)

                return sphere
            },
            renders() {
                /* 相机朝着物体方向移动 */
                var dir = new THREE.Vector3();
                camera.getWorldDirection(dir);   // 获得相机当前视线方向
                if( meshCenter.distanceTo(camera.position) > 400){
                    camera.position.add(dir.clone().multiplyScalar(2));
                }
                
                renderer.render(scene, camera);
                composer.render(); //必须在renderer.render(scene, camera);之后执行才有效果
                requestAnimationFrame(this.renders);
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