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
  import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
  import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
  export default {
    props: {},
    data() {
      return {
        camera: null,
        scene: null,
        renderer: null,
        mesh: null,
        ambientLight: null,
        gui: null,
        knot:null,
        step: 0,
      };
    },
    computed: {},
    watch: {},
    components: {},
    created() {},
    mounted() {
      this.init();
    },
    beforeDestroy() {
      this.gui.destroy();
    },
    methods: {
      init() {
        let that = this;
  
        let container = document.getElementById("container1");
        // 创建一个场景对象
        this.scene = new THREE.Scene();
  
        //创建一个相机对象
        this.camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        this.camera.position.set(-35, 35, 35);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  
        // 创建一个渲染器并设置背景色以及渲染大小
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor("#333333");
        this.renderer.setSize(container.clientWidth, container.clientHeight);
  
        // var axes = new THREE.AxisHelper(1000);
        // this.scene.add(axes);
  
        this.createMesh();
     
  
        this.controls = {
          isPaticle:false,
          geomToPaticle() {
             that.scene.remove(that.knot)
             if(that.controls.isPaticle){
                 that.createPointCloud()
             }else{
                 that.createMesh()
             }
             
          },
        };
  
        this.gui = new dat.GUI();
        this.gui.add(this.controls, "isPaticle").onChange(this.controls.geomToPaticle)
  
        // 将渲染器添加到需要展示的dom容器对象
        container.appendChild(this.renderer.domElement);
        // 渲染
        this.renders();
      },
      //创建一个凸面体模型
      createMesh() {
        // assign two materials
         let geom = new THREE.TorusKnotGeometry(15, 1,100,8, 4, 6, 1);
          console.log('几何体对象',geom)
         let meshMaterial = new THREE.MeshNormalMaterial({});
         console.log('材质对象',meshMaterial)
         meshMaterial.side = THREE.DoubleSide;
  
        // create a multimaterial
         this.knot = SceneUtils.createMultiMaterialObject(geom, [meshMaterial]);
         console.log('网格模型对象',this.knot )
         this.scene.add(this.knot)
         
      },
      generateSprite() {
  
              var canvas = document.createElement('canvas');
              canvas.width = 16;
              canvas.height = 16;
  
              var context = canvas.getContext('2d');
              var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
              gradient.addColorStop(0, 'rgba(255,255,255,1)');
              gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
              gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
              gradient.addColorStop(1, 'rgba(0,0,0,1)');
  
              context.fillStyle = gradient;
              context.fillRect(0, 0, canvas.width, canvas.height);
  
              var texture = new THREE.Texture(canvas);
              texture.needsUpdate = true;
              return texture;
  
          },
          createPointCloud() {
              let geom = new THREE.TorusKnotGeometry(15, 1,100,8, 4, 6, 1);
              let material = new THREE.PointsMaterial({
                  color: 0xffffff,
                  size: 3,
                  transparent: true,
                  blending: THREE.AdditiveBlending,
                  map: this.generateSprite()
              });
  
              this.knot = new THREE.Points(geom, material);
              this.knot.sortParticles = true;
              this.scene.add(this.knot)
          },
      renders() {
          this.knot.rotation.y +=0.005
        requestAnimationFrame(this.renders);
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
  