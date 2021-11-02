<template>
    <div class="unit2_example1"  id="container1">
    </div>
</template>

<script>
import * as THREE from 'THREE'
import dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils';
export default {
    props: {

    },
    data() {
        return {
          camera: null,
          scene: null,
          renderer: null,
          mesh: null,
          cube:[],
          sphere:null,
          ambientLight:null,
          gui:null,
          spGroup:null,
          hullMesh:null,
          step:0,

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
        // 创建一个场景对象
        this.scene = new THREE.Scene();
        
        //创建一个相机对象
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(-35,35,35)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        // 创建一个渲染器并设置背景色以及渲染大小
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor('#333333');
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        
        // var axes = new THREE.AxisHelper(1000);
        // this.scene.add(axes);

        this.createPoints()
        
        this.controls = {
            redraw(){
                that.scene.remove(that.spGroup);
                that.scene.remove(that.hullMesh);
                that.createPoints();
            }
        };

        this.gui = new dat.GUI();
        this.gui.add(this.controls, 'redraw');

        // 将渲染器添加到需要展示的dom容器对象
        container.appendChild(this.renderer.domElement);
        // 渲染
        this.renders()
    },
    // 随机生成20个点  并用圆几何体渲染   并根据生成的20个点生成一个凸面体
    createPoints(){
        let that = this
         let points = [];
            for (let i = 0; i < 20; i++) {
                let randomX = -15 + Math.round(Math.random() * 30);
                let randomY = -15 + Math.round(Math.random() * 30);
                let randomZ = -15 + Math.round(Math.random() * 30);

                points.push(new THREE.Vector3(randomX, randomY, randomZ));
            }

            that.spGroup = new THREE.Object3D();
            let material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: false});
            points.forEach(function (point) {

                let spGeom = new THREE.SphereGeometry(0.2);
                let spMesh = new THREE.Mesh(spGeom, material);
                spMesh.position.copy(point);
                that.spGroup.add(spMesh);
            });

            console.log(that.spGroup)
            // add the points as a group to the scene
            that.scene.add(that.spGroup);

            // use the same points to create a convexgeometry
            let hullGeometry = new ConvexGeometry(points);
            that.hullMesh = that.createMesh(hullGeometry);
            that.scene.add(that.hullMesh);
    },
    //创建一个凸面体模型
    createMesh(geom) {

            // assign two materials
            let meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.2});
            meshMaterial.side = THREE.DoubleSide;
            let wireFrameMat = new THREE.MeshBasicMaterial();
            wireFrameMat.wireframe = true;

            // create a multimaterial
            let mesh = SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);

            return mesh;
        },
    renders() {
            let that = this
            that.spGroup.rotation.y +=0.005
            that.hullMesh.rotation.y +=0.005
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
