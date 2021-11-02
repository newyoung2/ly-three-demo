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
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { ColladaLoader  } from "three/examples/jsm/loaders/ColladaLoader.js";
  export default {
    props: {},
    data() {
      return {
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
        publicPath: process.env.BASE_URL
      };
    },
    computed: {},
    watch: {},
    components: {},
    created() {},
    mounted() {
      this.init();
      this.animate();
    },
    beforeDestroy() {
    },
    methods: {
      init() {
        let that = this;
        // var container;
  
        // var camera, scene, renderer;
  
        // var mouseX = 0, mouseY = 0;
  
        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;
  
        let container = document.getElementById("container1");
  
        that.camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          1,
          2000
        );
        that.camera.position.set(0,5,12)
  
        // scene
  
        that.scene = new THREE.Scene();
  
  
        // var axes = new THREE.AxisHelper(100);
        //   this.scene.add(axes);
  
        that.ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        that.scene.add(that.ambientLight);
  
        that.pointLight = new THREE.PointLight(0xffffff, 0.8);
        that.camera.add(that.pointLight);
        that.scene.add(that.camera);
  
        that.manager = new THREE.LoadingManager();
        // that.manager.addHandler(/\.dds$/i, new DDSLoader());
  
        // comment in the following line and import TGALoader if your asset uses TGA textures
        // manager.addHandler( /\.tga$/i, new TGALoader() );
  
        // new MTLLoader(that.manager)
        //   .setPath(
        //     `${that.publicPath}models/male02/`
        //   )
        //   .load("male02_dds.mtl", function (materials) {
        //     materials.preload();
  
        //     new OBJLoader(that.manager)
        //       .setMaterials(materials)
        //       .setPath(
        //         `${that.publicPath}models/male02/`
        //       )
        //       .load(
        //         "male02.obj",
        //         function (object) {
              // 	object.position.y = -95;
              // 	that.knot = object
        //           that.scene.add(that.knot);
        //         },
        //         that.onProgress,
        //         that.onError
        //       );
        //   });
          
          new ColladaLoader( that.manager ).load( `${that.publicPath}static/elf/elf.dae`, function ( collada ) {
            
            that.knot = collada.scene;
            that.knot.position.y = -3
             that.scene.add(that.knot);
                  } );
        //
  
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setPixelRatio(window.devicePixelRatio);
        that.renderer.setSize(container.clientWidth, container.clientHeight);
  
        container.appendChild(that.renderer.domElement);
        that.controls = new OrbitControls(
          that.camera,
          that.renderer.domElement
        );
        // document.addEventListener( 'mousemove', that.onDocumentMouseMove, false );
  
        //
  
        // window.addEventListener( 'resize', that.onWindowResize, false );
      },
      generateSprite() {
        var canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
  
        var context = canvas.getContext("2d");
        var gradient = context.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2
        );
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.2, "rgba(0,255,255,1)");
        gradient.addColorStop(0.4, "rgba(0,0,64,1)");
        gradient.addColorStop(1, "rgba(0,0,0,1)");
  
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
  
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
      },
      onProgress(xhr) {
        if (xhr.lengthComputable) {
          var percentComplete = (xhr.loaded / xhr.total) * 100;
          console.log(Math.round(percentComplete, 2) + "% downloaded");
        }
      },
  
      onError() {},
      onWindowResize() {
        let that = this;
        that.windowHalfX = window.innerWidth / 2;
        that.windowHalfY = window.innerHeight / 2;
  
        that.camera.aspect = window.innerWidth / window.innerHeight;
        that.camera.updateProjectionMatrix();
  
        that.renderer.setSize(window.innerWidth, window.innerHeight);
      },
  
      onDocumentMouseMove(event) {
        let that = this;
        that.mouseX = (event.clientX - that.windowHalfX) / 2;
        that.mouseY = (event.clientY - that.windowHalfY) / 2;
      },
  
      //
  
      animate() {
        let that = this;
        that.controls.update();
        
        requestAnimationFrame(that.animate);
        that.render();
      },
  
      render() {
        let that = this;
      //   that.camera.position.x += (that.mouseX - that.camera.position.x) * 0.05;
      //   that.camera.position.y += (-that.mouseY - that.camera.position.y) * 0.05;
  
      //   that.camera.lookAt(that.scene.position);
        // console.log(that.knot)
        that.knot?that.knot.rotation.z += 0.02:''
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
  