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
  import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
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
        knot1: null,
        step: 0,
        manager: null,
        mouseX: 0,
        mouseY: 0,
        windowHalfX: 0,
        windowHalfY: 0,
        controls: null,
        raycaster:null,
        mouse:null,
        posSrc:null,
        loadedGeometry:null,
        publicPath: process.env.BASE_URL
  
      };
    },
    computed: {},
    watch: {},
    components: {},
    created() {},
    mounted() {
        let that = this
      this.init();
      this.animate();
    },
    beforeDestroy() {
      // this.gui.destroy();
    },
    methods: {
      
      init() {
        let that = this;
        
        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;
  
        var container = document.getElementById("container1");
        
        that.camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          1,
          3000
        );
        that.camera.position.set(0, 800, -2000);
  
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
        // that.texture = new THREE.TextureLoader( that.manager ).load(`${that.publicPath}textures/brick_diffuse.jpg`)
        
        //将模型渲染成点精灵模型
        that.getSpireModel()
        
        //正常加载ply模型
        that.getNormalModel()
        
        that.raycaster = new THREE.Raycaster();
        that.mouse = new THREE.Vector2();
  
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setPixelRatio(window.devicePixelRatio);
        that.renderer.setSize(container.clientWidth, container.clientHeight);
  
        container.appendChild(that.renderer.domElement);
        that.controls = new OrbitControls(that.camera, that.renderer.domElement);
        document.addEventListener('mousedown', that.onDocumentMouseDown, false);
  
        //
  
        // window.addEventListener( 'resize', that.onWindowResize, false );
      },
      loadModel(){
      
        // object.traverse( function ( child ) {
  
              // 			if ( child.isMesh ) child.material.map = texture;
  
              // 		} );
  
              // 		object.position.y = - 95;
              // 		scene.add( object );
      },
      onUpdate(){
        let that = this
         let count = 0;
              let pos = this.posSrc.pos;
              let points = that.knot.geometry.attributes.position.array
          for(let i=0;i<points.length;i++){
               if(points[i]%2 == 1){
                     points[i] = ((points[i] + 3.22544) * pos) - 3.22544
               }
          }
            //  that.knot.geometry.setFromPoints( points);
             that.knot.sortParticles = true;
              // console.log(this.loadedGeometry.attributes)
              // console.log(pos)
              // loadedGeometry.vertices.forEach(function (e) {
              //     var newY = ((e.y + 3.22544) * pos) - 3.22544;
              //     pointCloud.geometry.vertices[count++].set(e.x, newY, e.z);
              // });
  
              // that.knot.sortParticles = true;
      },
      onDocumentMouseDown(event){
         let that = this;
        event.preventDefault();
        that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
        that.raycaster.setFromCamera(that.mouse, that.camera);
        const intersects = that.raycaster.intersectObjects(that.knot1);
        console.log(intersects);
        if (intersects.length > 0) {
          
          intersects[0].object.material.transparent = true;
          intersects[0].object.material.opacity = 0.1;
        }
  
      },
      getSpireModel(){
          let that = this
          new PLYLoader(that.manager).load(
          `${that.publicPath}static/model/ply/binary/Lucy100k.ply`,
          function (geometry) {
            //   geometry.computeVertexNormals();
            
            that.loadedGeometry = geometry.clone();
            geometry.computeVertexNormals();
  
            let material = new THREE.PointsMaterial({
              color: 0xffffff,
              size: 3,
              transparent: true,
              blending: THREE.AdditiveBlending,
              map: that.generateSprite(),
            });
            that.knot = new THREE.Points(geometry, material);
            that.knot.sortParticles = true;
            that.knot.position.x = 800;
            that.scene.add(that.knot);
          }
        );
  
      },
      async getNormalModel(){
          let that = this
          // that.texture = await that.getTexture()
          new PLYLoader(that.manager).load(
          `${that.publicPath}static/model/ply/binary/Lucy100k.ply`,
          function (geometry) {
            //   geometry.computeVertexNormals();
  
            geometry.computeVertexNormals();
           
            const material = new THREE.MeshStandardMaterial({
              color: 0x0055ff,
              flatShading: true
            });
            const mesh = new THREE.Mesh(geometry, material);
  
            mesh.position.x = -800;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            that.knot1 = mesh;
          
            that.scene.add(that.knot1);
          }
        );
  
      },
      getTexture(){
        return new Promise((resolve,reject)=>{
              new THREE.TextureLoader().load( `${that.publicPath}static/carbon/Carbon_Normal.png`,(texture)=>{
                         resolve(texture)
              },undefined,undefined );
        })
        
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
        that.knot?that.knot.rotation.y += 0.02:null
        that.knot1?that.knot1.rotation.y -= 0.02:null
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
  