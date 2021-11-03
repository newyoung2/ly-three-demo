<template>
    <div
      class="unit2_example1"
      id="container1"
    >
    <video id="video" style="z-index:-1; position: absolute; left: 15px; top: 75px;"
         :src="videoUrl" controls="true" autoplay="true" ref="video"></video>
    </div>
  </template>
  
  <script>
  import * as THREE from "THREE";
  import dat from "dat.gui";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader.js";
  import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
  export default {
    props: {},
    data() {
      return {
        videoUrl:'',
        camera: null,
        scene: null,
        renderer: null,
        mesh: null,
        ambientLight: null,
        spotLight: null,
        gui: null,
        knot: null,
        step: 0,
        manager: null,
        mouseX: 0,
        mouseY: 0,
        windowHalfX: 0,
        windowHalfY: 0,
        controls: null,
        raycaster: null,
        mouse: null,
        mouseVector: null,
        group: null,
        texture: null,
        textureBump: null,
        textureVideo:null,
        cubeCamera1: null,
        cubeRenderTarget1: null,
        material: null,
        sphere: null,
        pointLight: null,
        publicPath: process.env.BASE_URL
      };
    },
    computed: {},
    watch: {},
    components: {},
    created() {
      this.videoUrl = `${this.publicPath}static/Big_Buck_Bunny_small.ogv`
    },
    mounted() {
      this.init();
    },
    beforeDestroy() {},
    methods: {
      async init() {
          let that = this
        var container = document.getElementById("container1");
  
        that.camera = new THREE.PerspectiveCamera(
          50,
          container.clientWidth / container.clientHeight,
          1,
          5000
        );
        that.camera.position.z = 2000;
  
        //cubemap
        const path = `${that.publicPath}static/cube/SwedishRoyalCastle/`;
        const format = ".jpg";
        const urls = [
          path + "px" + format,
          path + "nx" + format,
          path + "py" + format,
          path + "ny" + format,
          path + "pz" + format,
          path + "nz" + format,
        ];
  
        const reflectionCube = new THREE.CubeTextureLoader().load(urls);
        const refractionCube = new THREE.CubeTextureLoader().load(urls);
        refractionCube.mapping = THREE.CubeRefractionMapping;
  
        that.scene = new THREE.Scene();
        that.scene.background = reflectionCube;
  
        //lights
        that.ambient = new THREE.AmbientLight(0xffffff);
        that.scene.add(that.ambient);
  
        that.pointLight = new THREE.PointLight(0xffffff, 2);
        that.scene.add(that.pointLight);
        
        // that.textureVideo = that.getVideoTexture()
        //  that.$refs.video.play()
        //materials
        const cubeMaterial3 = new THREE.MeshLambertMaterial({
          color: 0xff6600,
          envMap: reflectionCube,
          combine: THREE.MixOperation,
          reflectivity: 0.3,
          // map:that.textureVideo
        });
        const cubeMaterial2 = new THREE.MeshLambertMaterial({
          color: 0xffee00,
          envMap: refractionCube,
          refractionRatio: 0.98,
        });
        const cubeMaterial1 = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          envMap: reflectionCube,
        });
        
  
        that.sphere = new THREE.SphereGeometry(400, 150, 150);
        that.knot = new THREE.Mesh(that.sphere,cubeMaterial1)
        that.scene.add(that.knot)
  
        const sphere1 = that.sphere.clone()
        const mesh1 = new THREE.Mesh(sphere1,cubeMaterial2)
        mesh1.position.x = -1000
        that.scene.add(mesh1)
  
        const sphere2 = that.sphere.clone()
        const mesh2 = new THREE.Mesh(sphere2,cubeMaterial3)
        mesh2.position.x = 1000
        that.scene.add(mesh2)
      //   models
      //   const objLoader = new OBJLoader();
  
      //   objLoader.setPath(`${that.publicPath}models1/obj/walt/`);
      //   objLoader.load("WaltHead.obj", function (object) {
      //     const head = object.children[0];
  
      //     head.scale.multiplyScalar(15);
      //     head.position.y = -500;
      //     head.material = cubeMaterial1;
  
      //     const head2 = head.clone();
      //     head2.position.x = -900;
      //     head2.material = cubeMaterial2;
  
      //     const head3 = head.clone();
      //     head3.position.x = 900;
      //     head3.material = cubeMaterial3;
  
      //     that.scene.add(head, head2, head3);
      //   });
  
        //renderer
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setPixelRatio(window.devicePixelRatio);
        that.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(that.renderer.domElement);
  
        //controls
        new OrbitControls(that.camera, that.renderer.domElement);
      //   that.controls.enableZoom = false;
      //   that.controls.enablePan = false;
      //   that.controls.minPolarAngle = Math.PI / 4;
      //   that.controls.maxPolarAngle = Math.PI / 1.5;
       
        that.animate()
      },
      getVideoTexture(){
        const video = document.getElementById( 'video' );
  
  const texture = new THREE.VideoTexture( video );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
        return texture
      },
  
      animate() {
          let that = this
        requestAnimationFrame(that.animate);
        that.renderer.render(that.scene, that.camera);
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
  