import * as THREE from 'THREE'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import utils from '../utils/utils'

// 初始化默认配置 -------如需自定义初始化配置   可配置项及数据结构如下
let initOption = {
    /* 相机 */
    camera:{
        type:'per',//相机类型  正视投影相机和透视投影相机两种  --暂时不支持正投影  未封装正投影相机
        position:[-150, 0, 0],  //相机位置
        angle: 45,  //相机可视范围
        near:0.1,  //近面
        far:1000, //远面
    },
    /* 光源 */
    ambientLight:{  //环境光
        show:true,  //初始化是否添加环境光
        color:'#666666'  //环境光颜色
    },
    spotLight:{  //聚光
       show:true,  //初始化时候是否添加聚光
       color:'#ffffff',  //聚光颜色
       castShadow:true   //是否显示阴影投影
    },
    /* 相机视角控制器 */
    controls:{
      show:true,
      limitDistance:false,  //是否限制相机的可移动范围
      minDistance:50,   //可移动最小范围  只在limitDistance=true时生效
      maxDistance:150   //可移动最大范围   只在limitDistance=true时生效
    },
    /* 渲染器配置 */
    render:{
        bgColor:'black',
        shadowMapEnabled:true

    }

}

class lyThree {
    container  //画布容器
    scene  //场景
    camera  //相机
    ambientLight  //自然光
    spotLight   //聚光
    raycaster
    controls
    renderer   //渲染器
    option = initOption
    group
    
    /**
     * 
     * @param {*} id 容器id   div元素id属性
     * @param {*} options 初始化配置
     */
    constructor(id, options) {
        this.group = new THREE.Group()
        // 判断是否传入配置  如果传入了使用传入配置  如果没传使用，默认配置
       
        if(options){
            utils.traverseObj(this.option,options)
        }
        
        this.container = document.getElementById(id);
        // 创建场景
        this.scene = new THREE.Scene();

        // 创建相机
        this.initCamera()

        //创建渲染器
        this.initRenderer()

        // 初始化光源
        this.initLight()

        // 初始化initControls
        this.initControls() 
 
        this.container.appendChild(this.renderer.domElement);

        // 渲染场景
        this.renders()

    }
    
    /* 初始化相关函数 */
    // 初始化相机
    initCamera(){
        let camera = this.option.camera
        this.camera = new THREE.PerspectiveCamera(camera.angle, this.container.clientWidth / this.container.clientHeight, camera.near, camera.far);  //透视投影相机
        this.camera.position.set(...camera.position)
    }

    // 初始化渲染器
    initRenderer(){
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(this.option.render.bgColor);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMapEnabled = this.option.render.bgColor.shadowMapEnabled || false;
    }
    
    // 初始化光源
    initLight(){

        if(this.option.ambientLight.show){   
          // 创建环境光
          this.ambientLight = new THREE.AmbientLight(new THREE.Color(this.option.ambientLight.color));
          this.scene.add(this.ambientLight);
        }


        if(this.option.spotLight.show){   
            // 创建聚光
           this.spotLight = new THREE.SpotLight(new THREE.Color(this.option.spotLight.color));
           // spotLight.position.set(50, 50, 50);
           this.spotLight.castShadow = this.option.spotLight.castShadow;
           this.scene.add(this.spotLight);
        }
        
    }
    
    // 初始化initControls
    initControls(){
        if(this.option.controls.show){
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);

            if(this.option.controls.limitDistance){
                //透视投影相机：相机距离目标观察点距离越远显示越小，距离越近显示越大
               //相机距离观察目标点极小距离——模型最大状态
               this.controls.minDistance = this.option.controls.minDistance;
               //相机距离观察目标点极大距离——模型最小状态
               this.controls.maxDistance = this.option.controls.maxDistance;
            }
            
        }
        
    }
    

    /* 其它函数 */
    // 渲染场景
    renders(){
        this.renderer.render(this.scene, this.camera);
    }
    
    // 销毁所有对象 释放内存
    destoryAll(){
        scene.traverse(function (e) {
            if (e instanceof THREE.Group) {
                this.clearGroup(e)
            }
        })
        
        this.clearScene()
    }
    
    // 清除group
    clearGroup(group) {
        const clearCache = (item) => {
          item.geometry.dispose();
          item.material.dispose();
        };
        const removeObj = (obj) => {
          let arr = obj.children.filter((x) => x);
          arr.forEach((item) => {
            if (item.children.length) {
              removeObj(item);
            } else {
              clearCache(item);
              item.clear();
            }
          });
          obj.clear();
          arr = null;
        };
        removeObj(group);
      }

      
    //清除场景
    clearScene() {
        // cancelAnimationFrame(this.animationId);
        this.scene.traverse((child) => {
          if (child.material) {
            child.material.dispose();
          }
          if (child.geometry) {
            child.geometry.dispose();
          }
          child = null;
        });
        this.renderer.forceContextLoss();
        this.renderer.dispose();
        this.scene.clear();
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.renderer.domElement = null;
        this.renderer = null;
        console.log('clearScene');
      }
    
    // 当窗口发生改变  可调用resize() 自适应
    resize(){
        // 重置渲染器输出画布canvas尺寸
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
        // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
        // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
        this.camera.updateProjectionMatrix();
    }

    // 加载贴图同步
    loadTextureSync(url){
        return new Promise((resolve,reject)=>{
            var textureLoader = new THREE.TextureLoader();
            console.log('url',url)
            textureLoader.load(url,(texture)=>{
                resolve(texture)
            },(err)=>{
                console.log('err',err)
            });//加载纹理贴图
        })
    }

    // 加载贴图异步
    loadTextureAsync(url){
            var textureLoader = new THREE.TextureLoader();
            var texture = textureLoader.load(url)
            return texture
    }
    
    // 文件加载器
    fileLoader(type='json'){
        var loader = new THREE.FileLoader();
        loader.setResponseType(type);
        return loader
    }
    
    /**
     * 颜色插值
     * @param {*} curVal 当前值
     * @param {*} maxVal 最大值
     * @param {*} minValColor 最小值对应颜色
     * @param {*} maxValColor 最大值对应颜色
     * @returns 
     */
    colorInterpolation(curVal,maxVal,minValColor,maxValColor){
        var color1 = new THREE.Color(minValColor);
        var color2 = new THREE.Color(maxValColor);//最大数值对应柱子颜色
        let color = color1.clone().lerp(color2.clone(),curVal/maxVal)
        return color
    }


    // 创建一个球体
    addSphere(geometryOption, materialOption) {
        var geometry = new THREE.SphereGeometry(...geometryOption);
        var material = new THREE.MeshBasicMaterial(materialOption);
        var sphere = new THREE.Mesh(geometry, material);
        return sphere
    }

}

export default lyThree