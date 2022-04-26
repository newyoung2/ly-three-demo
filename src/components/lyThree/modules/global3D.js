import * as THREE from 'THREE'
import lyThree from "./base.js";
import utils from '../utils/utils'
import earthPic from '../img/global3d/earth.png'
import earthRing from '../img/global3d/地球光圈.png'
import population from '../data/global3D/人口密度.json'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
let initOption = {
    earth:{
        R:80, //地球半径
        widthSegments:32,
        heightSegments:32
    },
    camera:{
        position:[0,0,250]
    },
}

class globalLyThree extends lyThree {
     constructor(id,options){
         // 判断是否传入配置  如果传入了使用传入配置  如果没传使用，默认配置
         console.log('utils',initOption,options)
         if(options){
            utils.traverseObj(initOption,options)
         }
         super(id,initOption)
        
         
         this.addEarth()
         this.addLightRing()
         this.add3DBar()
         this.scene.add(this.group)
         this.renders()
        //  this.repeatRender()
     }

     async addEarth(){
        // 创建网格模型
        let earth = this.option.earth
        let sphereOption = [earth.R, earth.widthSegments, earth.heightSegments]
        let texture = await this.loadTextureSync(earthPic)
        console.log('texture',texture)
        let materialOption = {
            map: texture
        }
        let mesh = this.addSphere(sphereOption, materialOption)
        this.group.add(mesh);
        
     }
     
     //添加地球光圈
     async addLightRing(){
        let texture = await this.loadTextureSync(earthRing)
        // 创建精灵材质对象SpriteMaterial
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture, //设置精灵纹理贴图
            transparent: true,//开启透明
            // opacity: 0.5,//可以通过透明度整体调节光圈
        });
        // 创建表示地球光圈的精灵模型
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(this.option.earth.R * 3.0, this.option.earth.R * 3.0, 1);//适当缩放精灵
        this.group.add(sprite);
        return sprite
     }
     

     add3DBar(val) {

            let data = val || population
            let R = this.option.earth.R

            let geoArr = []  //几何体数组   存储生成的几何体对象
            let group = new THREE.Group()
            
            var Max = utils.maxFun(data.population) * 0.05;  //计算出当前数据中的最大值
            data.population.forEach(e => {
                var PopulationDensity = e[2];
                // 创建一个柱子几何体
                var height = PopulationDensity / 80;//柱子高度
                var geometry = new THREE.BoxBufferGeometry(0.5, 0.5, height);//柱子长宽0.5 0.5 尺寸最好不要过大或过小

                /* 通过插值计算 计算出每个顶点的顶点颜色 */
                let color = this.colorInterpolation(e[2],Max,0x00aa88,0x00ff88)
                let pos = geometry.attributes.position
                let colorArr = []
                for(let i=0;i<pos.count;i++){
                    if(pos.getZ(i)<0){
                        colorArr.push(color.r * 0.0, color.g * 0.1, color.b * 0.1);
                    }else{
                        colorArr.push(color.r * 0.0, color.g * 1.0, color.b * 1.0);
                    }
                }
                //设置几何体 顶点颜色数据
                geometry.attributes.color = new THREE.BufferAttribute(new Float32Array(colorArr), 3);

                
                /* 调整柱子姿态 */
                // 经纬度转球面坐标
                var SphereCoord = utils.lon2xyz(R, e[0], e[1]);//SphereCoord球面坐标
                // 沿着z轴也就是柱子高度方向平移R+height / 2
                geometry.translate(0, 0, R + height / 2);
                // 通过lookAt调整几何体姿态角度
                geometry.lookAt(new THREE.Vector3(SphereCoord.x, SphereCoord.y, SphereCoord.z));

                /* 当前几何体添加到几何体数组 */
                geoArr.push(geometry);
            })
            

            /* 合并几何体提高性能 */
            // 所有几何体合并为一个几何体
            var BfferGeometry = BufferGeometryUtils.mergeBufferGeometries(geoArr);
            // console.log('柱子顶点数量接近百万',BfferGeometry.attributes.position.count)
            // console.log('柱子三角形索引量约140万',BfferGeometry.index.count)
            var material = new THREE.MeshLambertMaterial({
                // color: 0x00ff88,
                vertexColors: THREE.VertexColors, //使用顶点颜色渲染
            });
            var mesh = new THREE.Mesh(BfferGeometry, material);
            this.group.add(mesh)
            this.scene.add(group)

        
    }
}

export default globalLyThree