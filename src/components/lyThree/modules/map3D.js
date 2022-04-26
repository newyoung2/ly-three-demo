import * as THREE from 'THREE'
import lyThree from "./base.js";

class mapLyThree extends lyThree {
     constructor(id,options){
         super(id,options)
         this.addOneBall()
         this.renders()
     }

     addOneBall(){
        let sphereOption = [200, 32, 32]
        // let texture = new THREE.TextureLoader().load(`${process.env.BASE_URL}static/solarSystem/全景图.jpg`)
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        let materialOption = { color: new THREE.Color("red"), side: THREE.DoubleSide }
        let mesh = this.addSphere(sphereOption, materialOption)
        console.log()
        this.scene.add(mesh)
     }

     addSphere(sphereOption, materialOption) {
        var geometry = new THREE.SphereGeometry(...sphereOption);
        var material = new THREE.MeshBasicMaterial(materialOption);
        var sphere = new THREE.Mesh(geometry, material);
        // sphere.position.set(...data.position)

        return sphere
    }
}

export default mapLyThree