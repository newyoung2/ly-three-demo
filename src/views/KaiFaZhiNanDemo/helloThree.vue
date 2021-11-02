<template>
    <div class="unit2_example1" id="container1">
        <!-- <video id="video" style="position: absolute; left: 15px; top: 75px;z-index:-1;"
       :src="videoUrl" controls="true" autoplay="true"  ref="video"></video> -->
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
                videoUrl: '',
                camera: null,
                scene: null,
                renderer: null,
                mesh: null,
                spotLight: null,
                plane: null,
                cube: [],
                sphere: null,
                ambientLight: null,
                spotLight: null,
                gui: null,
                vector: null,
                raycaster: null,
                texture: null

            };
        },
        computed: {

        },
        watch: {

        },
        components: {

        },
        created() {
            this.videoUrl = `${window.location.protocol}//${window.location.host}/textures/Big_Buck_Bunny_small.ogv`
        },
        mounted() {
            this.init()
        },
        beforeDestroy() {
            this.gui.destroy();

            // this.gui.add(this.controls, 'clearPlan');
            // this.gui.add(this.controls, 'rotationSpeed', 0, 0.5);
        },
        methods: {
            async init() {
                let that = this
                let container = document.getElementById('container1');
                // create a scene, that will hold all our elements such as objects, cameras and lights.
                this.scene = new THREE.Scene();

                this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
                this.camera.position.set(-25, 25, 25)
                this.camera.lookAt(new THREE.Vector3(15, 0, 15))

                // create a render and set the size
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setClearColor('#FFFAFA');
                this.renderer.setSize(container.clientWidth, container.clientHeight);
                this.renderer.shadowMapEnabled = true;
                // create the ground plane
                let planeGeometry = new THREE.PlaneGeometry(30, 30);
                that.texture = await that.getTexture()
                let planeMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color("#666666"), map: that.texture });
                this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
                this.plane.receiveShadow = true;


                this.plane.rotation.x = -0.5 * Math.PI;
                // this.plane.rotation.set(0.3 * Math.PI,1,1);
                this.plane.position.x = 15;
                this.plane.position.y = 0;
                this.plane.position.z = 15;

                this.scene.add(this.plane);

                // var axes = new THREE.AxisHelper(100);
                // this.scene.add(axes);

                // add subtle ambient lighting
                this.ambientLight = new THREE.AmbientLight(new THREE.Color("#666666"));
                this.scene.add(this.ambientLight);
               
                this.spotLight = new THREE.SpotLight(new THREE.Color("#ffffff"));
                this.spotLight.position.set(25, 25, 25);
                this.spotLight.castShadow = true;
                this.scene.add(this.spotLight);

                console.log(this.scene)

                this.controls = {
                    rotationSpeed: 0.02,
                    addPlan() {
                        // console.log(that.scene)
                        let cubeSize = Math.ceil((Math.random() * 3));
                        let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                        let cubeMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
                        that.cube.push(new THREE.Mesh(cubeGeometry, cubeMaterial));
                        that.cube[that.cube.length - 1].name = "cube-" + (that.cube.length - 1);
                        that.cube[that.cube.length - 1].castShadow = true;

                        // position the cube randomly in the scene

                        that.cube[that.cube.length - 1].position.x = Math.floor(Math.random() * (30 - 1)) + 1
                        that.cube[that.cube.length - 1].position.y = Math.floor(Math.random() * (10 - 1)) + 1
                        that.cube[that.cube.length - 1].position.z = Math.floor(Math.random() * (30 - 1)) + 1
                        // add the cube to the scene
                        that.scene.add(that.cube[that.cube.length - 1]);
                        

                        // 添加扩散圆环特效
                        // let mesh = that.scatterCircle(1, 0.1, 0.3, new THREE.Vector3(0, 1, 1), 0.02);
                        // mesh.position.x = Math.floor(Math.random() * (30 - 1)) + 1
                        // mesh.position.y = Math.floor(Math.random() * (10 - 1)) + 1
                        // mesh.position.z = Math.floor(Math.random() * (30 - 1)) + 1
                        // that.scene.add(mesh);
                        
                        
                    },
                    clearPlan() {
                        if (that.scene.children[that.scene.children.length - 1].name.startsWith('cube')) {
                            that.scene.remove(that.scene.children[that.scene.children.length - 1])
                        }
                    }
                };

                this.gui = new dat.GUI();
                this.gui.add(this.controls, 'addPlan');
                this.gui.add(this.controls, 'clearPlan');
                this.gui.add(this.controls, 'rotationSpeed', 0, 0.5);
                console.log(this.gui)

                // add the output of the renderer to the html element
                container.appendChild(this.renderer.domElement);

                // call the render function
                // this.renderer.render(this.scene, this.camera);
                // this.$refs.video.play()
                this.renders()

                //   document.addEventListener('mousedown', this.onDocumentMouseDown, false);
                // this.renderer.render(this.scene, this.camera);
            },

            //r 圆半径
//init 初始圆半径
//ring 圆环大小
//color 颜色 THREE.Vector3
//speed 速度
 scatterCircle(r, init, ring, color, speed) {
	var uniform = {
		u_color: { value: color },
		u_r: { value: init },
		u_ring: {
			value: ring,
		},
	};

	var vs = `
		varying vec3 vPosition;
		void main(){
			vPosition=position;
			gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;
	var fs = `
		varying vec3 vPosition;
		uniform vec3 u_color;
		uniform float u_r;
		uniform float u_ring;

		void main(){
			float pct=distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
			if(pct>u_r || pct<(u_r-u_ring)){
				gl_FragColor = vec4(1.0,0.0,0.0,0);
			}else{
				float dis=(pct-(u_r-u_ring))/(u_r-u_ring);
				gl_FragColor = vec4(u_color,dis);
			}
		}
	`;
	const geometry = new THREE.CircleGeometry(r, 120);
	var material = new THREE.ShaderMaterial({
		vertexShader: vs,
		fragmentShader: fs,
		side: THREE.DoubleSide,
		uniforms: uniform,
		transparent: true,
		depthWrite: false,
	});
	const circle = new THREE.Mesh(geometry, material);

	function render() {
		uniform.u_r.value += speed || 0.1;
		if (uniform.u_r.value >= r) {
			uniform.u_r.value = init;
		}
		requestAnimationFrame(render);
	}
	render();

	return circle;
},
            onDocumentMouseDown(event) {
                let that = this
                event.preventDefault();
                that.vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
                that.vector = that.vector.unproject(that.camera);

                that.raycaster = new THREE.Raycaster(that.camera.position, that.vector.sub(that.camera.position).normalize());

                var intersects = that.raycaster.intersectObjects(that.scene.children);

                if (intersects.length > 0) {

                    console.log(intersects[0]);

                    intersects[0].object.material.transparent = true;
                    intersects[0].object.material.opacity = 0.1;
                }
            },
            getTexture() {
                return new Promise((resolve, reject) => {
                    new THREE.TextureLoader().load(`${window.location.protocol}//${window.location.host}/textures/brick_diffuse.jpg`, (texture) => {

                        resolve(texture)
                    }, undefined, undefined);
                })

            },
            getVideoTexture() {
                const video = document.getElementById('video');

                const texture = new THREE.VideoTexture(video);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBFormat;
                return texture
            },
            renders() {
                let that = this
                this.scene.traverse(function (e) {
                    if (e instanceof THREE.Mesh && e != that.plane) {

                        e.rotation.x += that.controls.rotationSpeed;
                        e.rotation.y += that.controls.rotationSpeed;
                        e.rotation.z += that.controls.rotationSpeed;
                    }
                });

                requestAnimationFrame(this.renders);
                this.renderer.render(this.scene, this.camera);
            }

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