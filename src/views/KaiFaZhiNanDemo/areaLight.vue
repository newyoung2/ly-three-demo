<template>
    <div class="unit2_example1"  id="container1">
    </div>
</template>

<script>
import * as THREE from 'THREE'
import dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
export default {
    props: {

    },
    data() {
        return {
          camera: null,
          scene: null,
          renderer: null,
          mesh: null,
          spotLight:null,
          plane:null,
          cube:[],
          sphere:null,
          ambientLight:null,
          spotLight:null,
          gui:null,
          rectLight:null,
          rectLightHelper:null,
          plane1:null


        };
    },
    computed: {

    },
    watch: {

    },
    components: {

    },
    created() {

    },
    mounted() {
       this.init()
    },
    beforeDestroy(){
        this.gui.destroy();
    },
    methods: {
      init() {
        

          let that = this
          let container = document.getElementById('container1');
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(-350,150,150)
        this.camera.lookAt(new THREE.Vector3(150, 0, 50))

        // create a render and set the size
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor('#333333');
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMapEnabled = true;
        // create the ground plane
        let planeGeometry = new THREE.PlaneGeometry(3000, 3000);
        let planeMaterial = new THREE.MeshStandardMaterial( { color: 0x808080, roughness: 0, metalness: 0 } );
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.receiveShadow = true;
        
        
        this.plane.rotation.x = -0.5 * Math.PI;
        // this.plane.rotation.set(0.3 * Math.PI,1,1);
        this.plane.position.x = 150;
        this.plane.position.y = 0;
        this.plane.position.z = 150;

        this.scene.add(this.plane);

        // var axes = new THREE.AxisHelper(1000);
        // this.scene.add(axes);

        // add subtle ambient lighting
        this.ambientLight = new THREE.AmbientLight(new THREE.Color("#666666"));
        this.scene.add(this.ambientLight);

        // RectAreaLightUniformsLib.init();

        this.rectLight = new THREE.RectAreaLight( 0xffffff, 1, 400, 300 );
        this.rectLight.position.set( 150, 0, 150 );
        this.rectLight.rotation.set( 0, 0.25*Math.PI, 0 );
		this.scene.add( this.rectLight );

		this.rectLightHelper = new RectAreaLightHelper( this.rectLight );
        this.rectLight.add( this.rectLightHelper );
        
        let planeGeometry1 = new THREE.BoxGeometry(400, 300, 0);
        let planeGeometry1Mat = new THREE.MeshBasicMaterial({color: new THREE.Color("#ffffff")});
        this.plane1 = new THREE.Mesh(planeGeometry1, planeGeometry1Mat);
        this.plane1.position.copy(this.rectLight.position);
        this.plane1.rotation.copy(this.rectLight.rotation);
        this.scene.add(this.plane1);

        this.controls = {
            color1:'#ffffff',
            intensity1:2.7
        };

        this.gui = new dat.GUI();
        this.gui.addColor(this.controls, 'color1').onChange(function (e) {
            that.rectLight.color = new THREE.Color(e);
            planeGeometry1Mat.color = new THREE.Color(e);
            that.scene.remove(that.plane1);
            that.plane1 = new THREE.Mesh(planeGeometry1, planeGeometry1Mat);
            that.plane1.position.copy(that.rectLight.position);
            that.plane1.rotation.copy(that.rectLight.rotation);
            that.scene.add(that.plane1);

        });

        this.gui.add(this.controls, 'intensity1', 0, 5).onChange(function (e) {
            that.rectLight.intensity = e;
        });

        // add the output of the renderer to the html element
        container.appendChild(this.renderer.domElement);
        this.renders()
    },
    renders() {
            let that = this
            requestAnimationFrame(this.renders);
            this.renderer.render(this.scene, this.camera);
        }

    },
};
</script>

<style scoped>
   .unit2_example1{
       width: 100%;
       height: 100%;
        
   }

   .gl{
       width: 100%;
       height: 100%;
   }
</style>
