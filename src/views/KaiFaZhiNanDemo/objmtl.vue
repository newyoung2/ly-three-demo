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
  import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader.js";
  import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
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
        raycaster:null,
        mouse:null,
        mouseVector:null,
        group:null,
        texture:null,
        textureBump:null,
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
      this.gui.destroy();
    },
    methods: {
      async init() {
        let that = this;

        var container = document.getElementById("container1");
        that.camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          1,
          2000
        );
        that.camera.position.z = 250;
        // scene
        that.scene = new THREE.Scene();
        that.ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        that.scene.add(that.ambientLight);
        that.pointLight = new THREE.PointLight(0xffffff, 0.8);
        that.camera.add(that.pointLight);
        that.scene.add(that.camera);
        that.manager = new THREE.LoadingManager();
        that.manager.addHandler(/\.dds$/i, new DDSLoader());
        // comment in the following line and import TGALoader if your asset uses TGA textures
        // manager.addHandler( /\.tga$/i, new TGALoader() );
        that.texture = await that.getTexture()
         that.textureBump = await that.getTextureBump()
        new MTLLoader(that.manager)
          .setPath(
            `${that.publicPath}static/model/male02/`
          )
          .load("male02_dds.mtl", function (materials) {
            console.log(materials)
            materials.preload();
            new OBJLoader(that.manager)
              .setMaterials(materials)
              .setPath(
                `${that.publicPath}static/model/male02/`
              )
              .load(
                "male02.obj",
                function (object) {
                  object.traverse( function ( child ) {
                                  if ( child.isMesh ) {
                           child.material.map = that.texture;
                           child.material.bumpMap = that.textureBump;
                            child.material.bumpScale = 5;
                      }
                            } );
                  object.position.y = -95;
                  that.knot = object;
                  that.scene.add(that.knot);
                },
                that.onProgress,
                that.onError
              );
          });
        //
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setPixelRatio(window.devicePixelRatio);
        that.renderer.setSize(container.clientWidth, container.clientHeight);
         
        // this.raycaster = new THREE.Raycaster();
        //       this.mouseVector = new THREE.Vector3();
        //       this.group = new THREE.Group();
        //       this.scene.add(this.group)
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector3();
        this.mouse = new THREE.Vector2();
          container.addEventListener('mousedown', that.onDocumentMouseDown, false );     
        // window.addEventListener( 'resize', that.onWindowResize, false );
        container.appendChild(that.renderer.domElement);
        // that.controls = new OrbitControls(that.camera, that.renderer.domElement);
        
        document.addEventListener( 'mousemove', that.onDocumentMouseMove, false );
        //
        // window.addEventListener( 'resize', that.onWindowResize, false );
      },
      getTexture(){
        let that = this
        return new Promise((resolve,reject)=>{
              new THREE.TextureLoader().load( `${that.publicPath}static/brick_diffuse.jpg`,(texture)=>{
                         resolve(texture)
              },undefined,undefined );
        })
        
      },
      getTextureBump(){
        let that = this
        return new Promise((resolve,reject)=>{
              new THREE.TextureLoader().load( `${that.publicPath}static/brick_bump.jpg`,(texture)=>{
                         resolve(texture)
              },undefined,undefined );
        })
        
      },
      onDocumentMouseDown(event){
         let that = this;
        event.preventDefault();
        that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        that.raycaster.setFromCamera(that.mouse, that.camera);
        const intersects = that.raycaster.intersectObjects(that.knot.children);
        console.log(intersects);
        if (intersects.length > 0) {
          
          intersects[0].object.material.transparent = true;
          intersects[0].object.material.opacity = 0.5;
        }
      },
      getIntersects( x, y ) {
              
              x = ( x / window.innerWidth ) * 2 - 1;
              y = - ( y / window.innerHeight ) * 2 + 1;
              this.mouseVector.set( x, y, 0.5 );
              this.raycaster.setFromCamera( this.mouseVector, this.camera );
              return this.raycaster.intersectObject( this.group, true );
          },
      onWindowResize(){
          this.camera.aspect = window.innerWidth / window.innerHeight;
              this.camera.updateProjectionMatrix();
   
              this.renderer.setSize( window.innerWidth, window.innerHeight );
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
      // onWindowResize() {
      //   let that = this;
      //   that.windowHalfX = window.innerWidth / 2;
      //   that.windowHalfY = window.innerHeight / 2;
      //   that.camera.aspect = window.innerWidth / window.innerHeight;
      //   that.camera.updateProjectionMatrix();
      //   that.renderer.setSize(window.innerWidth, window.innerHeight);
      // },
      // onDocumentMouseMove(event) {
      //   let that = this;
      //   that.mouseX = (event.clientX - that.windowHalfX) / 2;
      //   that.mouseY = (event.clientY - that.windowHalfY) / 2;
      // },
      //
      animate() {
        let that = this;
        // that.controls.update();
        requestAnimationFrame(that.animate);
        that.render();
      },
      render() {
        let that = this;
        //   that.camera.position.x += (that.mouseX - that.camera.position.x) * 0.05;
        //   that.camera.position.y += (-that.mouseY - that.camera.position.y) * 0.05;
        //   that.camera.lookAt(that.scene.position);
        //   console.log(that.knot)
        if(that.knot){
          that.knot.rotation.y += 0.02
          console.log(that.knot)
          if(that.knot.children[0].material.map.offset.y >= 0.5){
            that.knot.children[0].material.map.offset.y = 0
          }
          that.knot.children[0].material.map.offset.y += 0.005
          // that.knot.children.forEach(e=>{
          //     e.material.map.offset.y += 0.00005
          // })
        }
        that.knot?that.knot.rotation.y += 0.02:""
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