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
  import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
  import { Water } from "three/examples/jsm/objects/Water.js";
  import { Sky } from "three/examples/jsm/objects/Sky.js";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  
  export default {
    props: {},
    data() {
      return {
        camera: null,
        scene: null,
        renderer: null,
        mesh:null,
        water:null,
        pmremGenerator:null,
        sun:null,
        sky:null,
        parameters:null,
        controls:null,
        gui:null
      };
    },
    computed: {},
    watch: {},
    components: {},
    created() {},
    mounted() {
      this.init();
      this.animate()
    },
    beforeDestroy() {
      //   this.gui.destroy();
    },
    methods: {
      init() {
          let that = this
        const container = document.getElementById("container1");
  
        //
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setPixelRatio(window.devicePixelRatio);
        that.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(that.renderer.domElement);
  
        //
  
        that.scene = new THREE.Scene();
  
        that.camera = new THREE.PerspectiveCamera(
          55,
          container.clientWidth / container.clientHeight,
          1,
          20000
        );
        that.camera.position.set(30, 30, 100);
  
        //
  
        that.sun = new THREE.Vector3();
  
        // Water
        that.initWater()
       
        // Skybox
  
       that.sky = new Sky();
        that.sky.scale.setScalar(10000);
        that.scene.add(that.sky);
  
        const skyUniforms = that.sky.material.uniforms;
  
        skyUniforms["turbidity"].value = 0;
        skyUniforms["rayleigh"].value = 2;
        skyUniforms["mieCoefficient"].value = 0.005;
        skyUniforms["mieDirectionalG"].value = 0.8;
  
        that.updateSun();
  
        //
  
        const geometry = new THREE.BoxBufferGeometry(30, 30, 30);
        const material = new THREE.MeshStandardMaterial({ roughness: 0 });
  
        that.mesh = new THREE.Mesh(geometry, material);
        that.scene.add(that.mesh);
  
        //
  
        that.controls = new OrbitControls(that.camera, that.renderer.domElement);
        that.controls.maxPolarAngle = Math.PI * 0.495;
        that.controls.target.set(0, 10, 0);
        that.controls.minDistance = 40.0;
        that.controls.maxDistance = 200.0;
        that.controls.update();
  
     
  
        // GUI
  
      //   that.gui = new GUI();
  
      //   that.folderSky = that.gui.addFolder("Sky");
      //   that.folderSky
      //     .add(that.parameters, "inclination", 0, 0.5, 0.0001)
      //     .onChange(that.updateSun);
      //   that.folderSky.add(that.parameters, "azimuth", 0, 1, 0.0001).onChange(that.updateSun);
      //   that.folderSky.open();
  
      //   const waterUniforms = that.water.material.uniforms;
  
      //   that.folderWater = that.gui.addFolder("Water");
      //   that.folderWater
      //     .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
      //     .name("distortionScale");
      //   that.folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
      //   that.folderWater
      //     .add(waterUniforms.alpha, "value", 0.9, 1, 0.001)
      //     .name("alpha");
      //   that.folderWater.open();
  
        //
  
      //   window.addEventListener("resize", onWindowResize, false);
      },
      initWater(){
          let that = this
           const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
  
        that.water = new Water(waterGeometry, {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new THREE.TextureLoader().load(
            "static/waternormals.jpg",
            function (texture) {
              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
          ),
          alpha: 1.0,
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: that.scene.fog !== undefined,
        });
  
        that.water.rotation.x = -Math.PI / 2;
  
        that.scene.add(that.water);
      },
      updateSun() {
          let that = this
          that.parameters = {
          inclination: 0.49,
          azimuth: 0.205,
        };
  
        that.pmremGenerator = new THREE.PMREMGenerator(that.renderer);
          const theta = Math.PI * (that.parameters.inclination - 0.5);
          const phi = 2 * Math.PI * (that.parameters.azimuth - 0.5);
  
          that.sun.x = Math.cos(phi);
          that.sun.y = Math.sin(phi) * Math.sin(theta);
          that.sun.z = Math.sin(phi) * Math.cos(theta);
  
          that.sky.material.uniforms["sunPosition"].value.copy(that.sun);
          that.water.material.uniforms["sunDirection"].value.copy(that.sun).normalize();
  
          that.scene.environment = that.pmremGenerator.fromScene(that.sky).texture;
        },
      onWindowResize() {
          const container = document.getElementById("container1");
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
  
        renderer.setSize(container.clientWidth, container.clientHeight);
      },
  
      animate() {
        requestAnimationFrame(this.animate);
        this.render();
      },
  
      render() {
        const time = performance.now() * 0.001;
  
        this.mesh.position.y = Math.sin(time) * 5 + 5;
        this.mesh.rotation.x = time * 0.5;
        this.mesh.rotation.z = time * 0.51;
  
        this.water.material.uniforms["time"].value += 1.0 / 60.0;
  
        this.renderer.render(this.scene, this.camera);
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
  