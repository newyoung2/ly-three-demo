<template>
    <div
      class="unit2_example1"
      id="container1"
    >
    </div>
  </template>
  
  <script>
  import * as THREE from "THREE";
  import dat from "dat.gui";
  import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
  
  export default {
    props: {},
    data() {
      return {
        camera: null,
        scene: null,
        renderer: null,
        controls: null,
        gui: null,
        publicPath: process.env.BASE_URL,
        clock: null,
        composer: null,
        mixer: null,
      };
    },
    computed: {},
    watch: {},
    components: {},
    created() {},
    mounted() {
      this.init();
      this.animate();
      // console.log(navigator)
      
    },
    beforeDestroy() {
         this.gui.destroy();
    },
    methods: {
      init() {
        let that = this;
        const container = document.getElementById("container1");
  
        const params = {
          exposure: 1,
          bloomStrength: 1.5,
          bloomThreshold: 0,
          bloomRadius: 0,
        };
  
        that.clock = new THREE.Clock();
  
        that.renderer = new THREE.WebGLRenderer({ antialias: true });
        that.renderer.setPixelRatio(window.devicePixelRatio);
        that.renderer.setSize(container.clientWidth, container.clientHeight);
        that.renderer.toneMapping = THREE.ReinhardToneMapping;
        container.appendChild(that.renderer.domElement);
  
        that.scene = new THREE.Scene();
  
        that.camera = new THREE.PerspectiveCamera(
          40,
          container.clientWidth / container.clientHeight,
          1,
          100
        );
        that.camera.position.set(-5, 2.5, -3.5);
        that.scene.add(that.camera);
  
        that.controls = new OrbitControls(that.camera, that.renderer.domElement);
        that.controls.maxPolarAngle = Math.PI * 0.5;
        that.controls.minDistance = 1;
        that.controls.maxDistance = 10;
  
        that.scene.add(new THREE.AmbientLight(0x404040));
  
        const pointLight = new THREE.PointLight(0xffffff, 1);
        that.camera.add(pointLight);
       
          /*  加入后期泛光bloom特效 */
        const renderScene = new RenderPass(that.scene, that.camera);
  
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(container.clientWidth, container.clientHeight),
          1.5,
          0.4,
          0.85
        );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;
  
        that.composer = new EffectComposer(that.renderer);
        that.composer.addPass(renderScene);
        that.composer.addPass(bloomPass);
       
      /*   加载模型 */
        new GLTFLoader().load("static/model/PrimaryIonDrive.glb", function (
          gltf
        ) {
          const model = gltf.scene;
  
          that.scene.add(model);
  
          that.mixer = new THREE.AnimationMixer(model);
          const clip = gltf.animations[0];
          that.mixer.clipAction(clip.optimize()).play();
  
          that.animate();
        });
        
        
      /* 添加gui控件 */  
        that.gui = new GUI();
  
        that.gui.add(params, "exposure", 0.1, 2).onChange(function (value) {
          that.renderer.toneMappingExposure = Math.pow(value, 4.0);
        });
  
        that.gui
          .add(params, "bloomThreshold", 0.0, 1.0)
          .onChange(function (value) {
            bloomPass.threshold = Number(value);
          });
  
        that.gui
          .add(params, "bloomStrength", 0.0, 3.0)
          .onChange(function (value) {
            bloomPass.strength = Number(value);
          });
  
        that.gui
          .add(params, "bloomRadius", 0.0, 1.0)
          .step(0.01)
          .onChange(function (value) {
            bloomPass.radius = Number(value);
          });
        
        //窗口尺寸监听
        window.addEventListener("resize", that.onWindowResize);
      },
      onWindowResize() {
        const container = document.getElementById("container1");
        const width = container.clientWidth;
        const height = container.clientHeight;
  
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
  
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
      },
      animate() {
        requestAnimationFrame(this.animate);
  
        const delta = this.clock.getDelta();
  
        this.mixer?this.mixer.update(delta):''
  
        this.composer.render();
      },
    },
  };
  </script>
  
  <style scoped>
  .unit2_example1 {
    width: 100%;
    height: 100%;
  }
  
  .gl {
    width: 100%;
    height: 100%;
  }
  </style>
  