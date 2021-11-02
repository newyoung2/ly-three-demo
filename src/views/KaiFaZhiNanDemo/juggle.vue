<template>
    <div class="unit2_example1"  id="container1">
    </div>
</template>

<script>
import * as THREE from 'THREE'
import dat from 'dat.gui'

export default {
    props: {

    },
    data() {
        return {
          camera: null,
          scene: null,
          renderer: null,
          rollOverMesh:null,
          cubeGeo:null,
          cubeMaterial:null,
          raycaster:null,
          mouse:null,
          objects:[],

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
    },
    methods: {
     init(){
         const that = this

         const container = document.getElementById( 'container1' );
         that.camera = new THREE.PerspectiveCamera( 45, container.clientWidth / container.clientHeight, 1, 10000 );
				 that.camera.position.set( 500, 800, 1300 );
				 that.camera.lookAt( 0, 0, 0 );

				 that.scene = new THREE.Scene();
				 that.scene.background = new THREE.Color( 0xf0f0f0 );

				// roll-over helpers

				const rollOverGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
				const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
				 that.rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
				 that.scene.add(  that.rollOverMesh );

				// cubes

				 that.cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
				 that.cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( 'textures/square-outline-textured.png' ) } );

				// grid

				const gridHelper = new THREE.GridHelper( 1000, 20 );
				that.scene.add( gridHelper );

				//

				 that.raycaster = new THREE.Raycaster();
				 that.mouse = new THREE.Vector2();

				const geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
				geometry.rotateX( - Math.PI / 2 );

				const plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
				// scene.add( plane );

				that.objects.push( plane );

				// lights

				const ambientLight = new THREE.AmbientLight( 0x606060 );
				 that.scene.add( ambientLight );

				const directionalLight = new THREE.DirectionalLight( 0xffffff );
				directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
				 that.scene.add( directionalLight );

				 that.renderer = new THREE.WebGLRenderer( { antialias: true } );
				 that.renderer.setPixelRatio( window.devicePixelRatio );
                 that.renderer.setSize( container.clientWidth, container.clientHeight );
                
				container.appendChild(  that.renderer.domElement );

				document.addEventListener( 'mousemove',  that.onDocumentMouseMove, false );
                document.addEventListener( 'mousedown',  that.onDocumentMouseDown, false );
                window.addEventListener( 'resize', that.onWindowResize, false );
     },
     onWindowResize() {
                const container = document.getElementById( 'container1' );
				this.camera.aspect = container.clientWidth / container.clientHeight;
				this.camera.updateProjectionMatrix();

				this.renderer.setSize( container.clientWidth, container.clientHeight );

			},
      onDocumentMouseMove( event ) {
                let that = this
				event.preventDefault();
                const container = document.getElementById( 'container1' );
				that.mouse.set( ( event.clientX / container.clientWidth ) * 1.55 - 1, - ( event.clientY / container.clientHeight ) * 1.8 + 1 );

				that.raycaster.setFromCamera( that.mouse, that.camera );

				const intersects = that.raycaster.intersectObjects( that.objects );

				if ( intersects.length > 0 ) {

					const intersect = intersects[ 0 ];
              
					that.rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
					that.rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

				}

				that.render();

			},

			 onDocumentMouseDown( event ) {
                const that = this
				event.preventDefault();
                const container = document.getElementById( 'container1' );
				that.mouse.set( ( event.clientX / container.clientWidth ) * 1.55 - 1, - ( event.clientY / container.clientHeight ) * 1.8 + 1 );

				that.raycaster.setFromCamera( that.mouse, that.camera );

				const intersects = that.raycaster.intersectObjects( that.objects );

				if ( intersects.length > 0 ) {

					const intersect = intersects[ 0 ];

					// delete cube
						const voxel = new THREE.Mesh( that.cubeGeo, that.cubeMaterial );
						voxel.position.copy( intersect.point ).add( intersect.face.normal );
						voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
						that.scene.add( voxel );

						that.objects.push( voxel );
					that.render();

				}

            },
            render() {

				this.renderer.render( this.scene, this.camera );

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
