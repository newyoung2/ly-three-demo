<template>
    <div id="container"></div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
    import Delaunator from 'delaunator';
    import polygonData from './polygonData.js'
    var pointInPolygon = require('point-in-polygon');
    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let ambientLight  //自然光
    let spotLight   //聚光
    let raycaster
    let mouse
    let controls
    let mapGroup = new THREE.Group()
    let lineGroup = new THREE.Group()
    let R = 80  //地球半径
    // 鼠标单击射线拾取meshArr中的某个国家Mesh
    var chooseMesh = null
    let labelRenderer = null
    var labelDiv

    export default {
        data() {
            return {
                labelName: '',
                curIndex: -1,
                isMouseEnter: false,
                imgUrlPreix: process.env.BASE_URL + 'static/solarSystem/UI/按钮/',
                imgUrlPreix1: process.env.BASE_URL + 'static/solarSystem/UI/标签/',

            };
        },
        mounted() {
            this.init()
        },
        methods: {
            async init() {
                let that = this
                let container = document.getElementById('container');

                // 创建场景
                scene = new THREE.Scene();

                // 创建相机
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);  //透视投影相机
                camera.position.set(183, 88, -284); //相机在Three.js坐标系中的位置

                
                // 平行光1
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight.position.set(400, 200, 300);
                scene.add(directionalLight);
                // 平行光2
                var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight2.position.set(-400, -200, -300);
                scene.add(directionalLight2);
                //环境光
                var ambient = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambient);


                //创建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setClearColor('black');
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMapEnabled = true;

                this.addEarth()  //添加地球
                this.addCountry()  //添加国家网格模型
                this.addPopulationBar() //添加人口密度可视化柱子

                /*  拾取模型事件 */
                raycaster = new THREE.Raycaster();
                mouse = new THREE.Vector2();
                window.addEventListener('click', this.onDocumentMouseDown, false);


                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);


                labelDiv = this.tag()
                scene.add(labelDiv)

                // 创建一个CSS2渲染器CSS2DRenderer
                labelRenderer = new CSS2DRenderer();
                labelRenderer.setSize(window.innerWidth, window.innerHeight);
                labelRenderer.domElement.style.position = 'absolute';
                // 避免renderer.domElement影响HTMl标签定位，设置top为0px
                labelRenderer.domElement.style.top = '0px';
                labelRenderer.domElement.style.left = '0px';
                //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
                labelRenderer.domElement.style.pointerEvents = 'none';
                document.body.appendChild(labelRenderer.domElement);

                this.renders()

            },
            //添加人口密度可视化柱子
            addPopulationBar() {
                let that = this
                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                /* 通过生成多个线条模型的方式生成轮廓    这样比较占用cpu计算资源 */
                loader.load(process.env.BASE_URL + 'static/earth3D/人口密度.json', function (data) {
                    console.log(data)
                    let geoArr = []
                    let group = new THREE.Group()
                    var Max = maxFun(data.population) * 0.05;
                    var color1 = new THREE.Color(0x00aa88);
                    var color2 = new THREE.Color(0x00ff88);//最大数值对应柱子颜色
                    data.population.forEach(e => {
                        var PopulationDensity = e[2];//经纬度coord[i][0], coord[i][1]对应数值  人口密度
                        // 创建一个柱子几何体
                        // var height = PopulationDensity / 10;//柱子高度
                        var height = PopulationDensity / 80;//柱子高度
                        var geometry = new THREE.BoxBufferGeometry(0.5, 0.5, height);//柱子长宽0.5 0.5 尺寸最好不要过大或过小
                        let color = color1.clone().lerp(color2.clone(),e[2]/Max)
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


                        // 经纬度转球面坐标
                        var SphereCoord = that.lon2xyz(R, e[0], e[1]);//SphereCoord球面坐标
                        // 沿着z轴也就是柱子高度方向平移R+height / 2
                        geometry.translate(0, 0, R + height / 2);
                        // 通过lookAt调整几何体姿态角度
                        geometry.lookAt(new THREE.Vector3(SphereCoord.x, SphereCoord.y, SphereCoord.z));
                        geoArr.push(geometry);
                    })

                    // 所有几何体合并为一个几何体
                    var BfferGeometry = BufferGeometryUtils.mergeBufferGeometries(geoArr);
                    // console.log('柱子顶点数量接近百万',BfferGeometry.attributes.position.count)
                    // console.log('柱子三角形索引量约140万',BfferGeometry.index.count)
                    var material = new THREE.MeshLambertMaterial({
                        // color: 0x00ff88,
                        vertexColors: THREE.VertexColors, //使用顶点颜色渲染
                    });
                    var mesh = new THREE.Mesh(BfferGeometry, material);
                    group.add(mesh)
                    scene.add(group)

                })
            },
            //添加地球
            addEarth() {
                // 创建网格模型
                let sphereOption = [R, 32, 32]

                let materialOption = {
                    color: new THREE.Color('black')
                }
                let mesh = this.addSphere(sphereOption, materialOption)
                mapGroup.add(mesh);
                scene.add(mapGroup);
                scene.add(this.addSprite());
            },
            // 添加国家多边形网格模型
            addCountry() {
                let that = this
                var loader = new THREE.FileLoader();
                loader.setResponseType('json');
                /* 通过生成多个线条模型的方式生成轮廓    这样比较占用cpu计算资源 */
                loader.load(process.env.BASE_URL + 'static/earth3D/world.json', function (data) {
                    data.features.forEach((e, i) => {

                        // 将两种类型的数据结构组装成一样的  
                        if (e.geometry.type == 'Polygon') {
                            e.geometry.coordinates = [e.geometry.coordinates]
                        }

                        let countryLineGroup = that.addCountryLine(e.geometry.coordinates)
                        scene.add(countryLineGroup)

                        let meshGroup = that.addCountryMesh(e.geometry.coordinates, e)
                        scene.add(meshGroup)

                    })

                })
            },
            // 添加国家边界线
            addCountryLine(data) {
                let that = this
                let group = new THREE.Group()
                data.forEach(e => {
                    let linePointsArr = []  //边界点
                    e[0].forEach(e1 => {
                        let obj = that.lon2xyz(R + 1.2, e1[0], e1[1])
                        linePointsArr.push(obj.x, obj.y, obj.z)
                    })
                    group.add(that.addline(linePointsArr))

                })
                return group
            },
            // 添加国家多边形
            addCountryMesh(data, origData) {
                let that = this
                var geometryArr = [];//一个国家多个轮廓，每个轮廓对应的所有几何体
                data.forEach(e => {
                    geometryArr.push(that.addCountryMeshFunc(e[0], origData))
                })

                // 合并几何体
                var newGeometry = null;
                if (geometryArr.length == 1) {
                    newGeometry = geometryArr[0];//如果一个国家只有一个多边形轮廓，不用进行几何体合并操作
                } else {// 所有几何体合并为一个几何体
                    newGeometry = BufferGeometryUtils.mergeBufferGeometries(geometryArr);
                }
                newGeometry.computeVertexNormals();//如果使用受光照影响材质，需要计算生成法线


                var material = new THREE.MeshBasicMaterial({
                    color: 0x002222,
                    side: THREE.DoubleSide, //背面可见，默认正面可见   THREE.DoubleSide：双面可见
                })

                newGeometry.computeVertexNormals();//如果使用受光照影响材质，需要计算生成法线
                var mesh = new THREE.Mesh(newGeometry, material)
                mesh.name = origData.properties.name
                let group = new THREE.Group()
                group.add(mesh)
                return group
            },
            //在国家多边形内添加等间距网格点
            addCountryMeshFunc(data, origData) {
                let that = this

                let finalArr = that.getGridPoints(data)  //获取网格单
                var allPoints = [];//处理点阵顶点坐标，用于生成几何体顶点坐标
                finalArr.forEach(function (elem) {
                    let position = that.lon2xyz(R + 1.1, elem[0], elem[1])
                    allPoints.push(position.x, position.y, position.z)
                })

                let usefulIndexArr = that.delaunay(finalArr, data) // 获取三角剖分的索引

                /* 生成模型 */
                var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
                // 设置几何体attributes属性的位置属性
                geometry.index = new THREE.BufferAttribute(new Uint16Array(usefulIndexArr), 1)

                geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(allPoints), 3); //3个为一组，表示一个顶点的xyz坐标

                return geometry

            },
            // 获取三角剖分的索引
            delaunay(finalArr, data) {
                // 三角剖分
                //.from(pointsArr).triangles：平面上一系列点集三角剖分，并获取三角形索引值
                var indexArr = Delaunator.from(finalArr).triangles;

                var usefulIndexArr = [];
                for (var i = 0; i < indexArr.length; i += 3) {
                    // 三角形三个顶点坐标p1, p2, p3
                    var p1 = finalArr[indexArr[i]];
                    var p2 = finalArr[indexArr[i + 1]];
                    var p3 = finalArr[indexArr[i + 2]];
                    // 三角形重心坐标计算
                    var 三角形重心 = [(p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3];
                    if (pointInPolygon(三角形重心, data)) {//pointInPolygon()函数判断三角形的重心是在多边形polygon内
                        // 保留复合条件三角形对应的索引：indexArr[i], indexArr[i+1],indexArr[i+2]
                        // usefulIndexArr.push(indexArr[i], indexArr[i+1],indexArr[i+2]);//这种情况需要设置three.js材质背面可见THREE.BackSide才能看到球面国家Mesh
                        // 有一点需要注意，一个三角形索引逆时针和顺时针顺序对应three.js三角形法线方向相反，或者说Mesh正面、背面方向不同
                        usefulIndexArr.push(indexArr[i + 2], indexArr[i + 1], indexArr[i]);
                    }
                }
                return usefulIndexArr
            },
            // 获取网格点
            getGridPoints(data) {
                let that = this
                let latArr = []
                let lngArr = []
                data.forEach(e => {
                    lngArr.push(e[0])
                    latArr.push(e[1])
                })

                let [lngMin, lngMax] = minMax(lngArr)
                let [latMin, latMax] = minMax(latArr)
                let gap = 3  //间隔  值越大精细度越高
                let row = Math.ceil((lngMax - lngMin) / gap)
                let col = Math.ceil((latMax - latMin) / gap)

                let rectPointsArr = []
                for (let i = 0; i < row; i++) {
                    for (let j = 0; j < col; j++) {
                        if (pointInPolygon([lngMin + i * gap, latMin + j * gap], data)) {  //只取在边界线内的等间距网格点
                            rectPointsArr.push([lngMin + i * gap, latMin + j * gap])
                        }
                    }
                }

                let finalArr = [...data, ...rectPointsArr]
                return finalArr
            },
            // ********************************************************end***************************
            onDocumentMouseDown(event) {
                if (chooseMesh) {
                    // 把上次选中的mesh设置为原来的颜色
                    chooseMesh.material.color.set(0x002222);
                    labelDiv.element.style.visibility = 'hidden';//隐藏标签
                }
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                // 环行星是group包含两个mesh子对象，intersectObjects方法第二个参数设置为true，可以检测子对象
                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length > 0) {
                    chooseMesh = intersects[0].object;

                    if (chooseMesh.name) {
                        console.log(intersects[0])
                        labelDiv.position.copy(new THREE.Vector3(intersects[0].point.x, intersects[0].point.y + 5, intersects[0].point.z))
                        labelDiv.element.innerHTML = chooseMesh.name;
                        labelDiv.element.style.visibility = 'visible';
                        chooseMesh.material.color.set(0x00cccc);//选中改变颜色


                    } else {
                        labelDiv.element.style.display = 'hidden';
                        labelDiv.element.innerHTML = ''
                        chooseMesh = null
                    }

                }
            },
            tag() {
                // 创建div元素(作为标签)
                var div = document.createElement('div');
                div.style.visibility = 'hidden';
                div.innerHTML = 'GDP';
                div.style.padding = '4px 10px';
                div.style.color = '#fff';
                div.style.fontSize = '16px';
                div.style.position = 'absolute';
                div.style.backgroundColor = 'rgba(25,25,25,0.5)';
                div.style.borderRadius = '5px';
                //div元素包装为CSS2模型对象CSS2DObject
                let label = new CSS2DObject(div);
                div.style.pointerEvents = 'none';//避免HTML标签遮挡三维场景的鼠标事件
                // 设置HTML元素标签在three.js世界坐标中位置
                // label.position.set(x, y, z);   
                return label
            },
            //世界坐标转屏幕坐标
            coordinateExchange(mesh) {
                //创建一个三维向量作为世界坐标
                var worldVector = new THREE.Vector3();
                //获取网格模型boxMesh的世界坐标，赋值给worldVector
                mesh.getWorldPosition(worldVector);
                console.log(mesh)
                console.log(worldVector)
                // 特殊情况下，局部坐标等于世界坐标
                // var worldVector = boxMesh.position.clone();
                //世界坐标转标准设备坐标，standardVector是WebGL标准设备坐标
                // .project()方法提取相机参数的视图矩阵、投影矩阵对世界坐标进行变换
                var standardVector = worldVector.project(camera);

                // 根据WebGL标准设备坐标standardVector计算div标签在浏览器页面的屏幕坐标
                // 标准设备坐标转屏幕坐标
                var a = window.innerWidth / 2;
                var b = window.innerHeight / 2;
                var x = Math.round(standardVector.x * a + a); //模型标签x坐标，单位像素
                var y = Math.round(-standardVector.y * b + b); //模型标签y坐标，单位像素
                return [x, y]
            },
            /* 添加点精灵光圈效果 */
            addSprite() {
                var textureLoader = new THREE.TextureLoader();
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/地球光圈.png');//加载纹理贴图
                // 创建精灵材质对象SpriteMaterial
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: texture, //设置精灵纹理贴图
                    transparent: true,//开启透明
                    // opacity: 0.5,//可以通过透明度整体调节光圈
                });
                // 创建表示地球光圈的精灵模型
                var sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(R * 3.0, R * 3.0, 1);//适当缩放精灵
                return sprite
            },
            //生成球模型
            addSphere(sphereOption, materialOption) {
                var geometry = new THREE.SphereGeometry(...sphereOption);
                var material = new THREE.MeshBasicMaterial(materialOption);
                var sphere = new THREE.Mesh(geometry, material);
                return sphere
            },
            /* 添加轮廓线 */
            addline(pointArr) {
                /**
                  * 通过BufferGeometry构建一个几何体，传入顶点数据
                  * 通过Line模型渲染几何体，连点成线
                  * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合
                */
                var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
                //类型数组创建顶点数据
                var vertices = new Float32Array(pointArr);
                // 创建属性缓冲区对象
                var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
                // 设置几何体attributes属性的位置属性
                geometry.attributes.position = attribue;
                // 线条渲染几何体顶点数据
                var material = new THREE.LineBasicMaterial({
                    color: 0x00aaaa //线条颜色
                });//材质对象
                // var line = new THREE.Line(geometry, material);//线条模型对象
                var line = new THREE.LineLoop(geometry, material);//首尾顶点连线，轮廓闭合
                return line;

            },
            // 经纬度转世界坐标
            lon2xyz(R, longitude, latitude) {
                var lon = longitude * Math.PI / 180;//转弧度值
                var lat = latitude * Math.PI / 180;//转弧度值
                lon = -lon;// three.js坐标系z坐标轴对应经度-90度，而不是90度

                // 经纬度坐标转球面坐标计算公式
                var x = R * Math.cos(lat) * Math.cos(lon);
                var y = R * Math.sin(lat);
                var z = R * Math.cos(lat) * Math.sin(lon);
                // 返回球面坐标
                return {
                    x: x,
                    y: y,
                    z: z,
                };
            },
            renders() {
                let that = this
                scene.traverse(function (e) {
                    if (e instanceof THREE.Group) {
                        e.rotation.y += 0.005;
                        //  console.log(camera.position)
                    }
                });

                //渲染场景中的HTMl元素包装成的CSS2模型对象
                labelRenderer.render(scene, camera);
                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
            }

        },
    };
    // 所有人口密度值提取到一个数组中，然后对数组进行排序，获得最大密度值
    function maxFun(coord) {
  var array = [];
  for (var i = 0; i < coord.length; i++) {
    array.push(coord[i][2]);
  }
  array.sort(compareNum);
  return array[array.length - 1]
  // 数组排序规则
  function compareNum(num1, num2) {
    if (num1 < num2) {
      return -1;
    } else if (num1 > num2) {
      return 1;
    } else {
      return 0;
    }
  }
}

    //   经纬度坐标进行排序
    function minMax(arr) {
        // 数组元素排序
        arr.sort(compareNum);
        // 通过向两侧取整，把经纬度的方位稍微扩大
        return [Math.floor(arr[0]), Math.ceil(arr[arr.length - 1])]
    }
    // 数组排序规则
    function compareNum(num1, num2) {
        if (num1 < num2) {
            return -1;
        } else if (num1 > num2) {
            return 1;
        } else {
            return 0;
        }
    }
</script>

<style scoped>
    .labelstyle {
        height: 20px;
        background: rgba(0, 0, 0, 0.3);
        color: white;
        position: absolute;
        /* padding: 5px; */
        border-radius: 8px;
        visibility: hidden;
    }

    #container {
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;

    }

    .toolBox {
        display: inline-flex;
        position: absolute;
        bottom: 20px;
        left: 30%;
    }

    .toolBox-item {
        position: relative;
        width: 50px;
        height: 80px;
        margin: 0 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        color: white;
    }

    .toolBox-item img {
        width: 50px;
        height: 50px;
    }

    .activeImg {
        transform: scale(1.2);
    }
</style>