<template>
    <div id="container"></div>
</template>

<script>
    import * as THREE from 'THREE'
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
    import flyLineData from './flyLineData.js'
    import Delaunator from 'delaunator';
    import polygonData from './polygonData.js'
    var pointInPolygon = require('point-in-polygon');
    let scene  //场景
    let camera   //相机
    let renderer  //渲染器
    let controls
    let mapGroup = new THREE.Group()
    let lineGroup = new THREE.Group()
    var flyArr = [];//所有飞线的集合，用来在渲染循环中设置飞线动画
    let R = 80  //地球半径

    export default {
        data() {
            return {
                imgUrlPreix: process.env.BASE_URL + 'static/solarSystem/UI/按钮/',
                imgUrlPreix1: process.env.BASE_URL + 'static/solarSystem/UI/标签/',

            };
        },
        mounted() { 
            this.init()

             // 自适应 onresize 事件会在窗口被调整大小时发生
             window.onresize = function () {
                // 重置渲染器输出画布canvas尺寸
                renderer.setSize(container.clientWidth, container.clientHeight);
                // 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
                camera.aspect = container.clientWidth / container.clientHeight;
                // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
                // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
                // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
                camera.updateProjectionMatrix();
            };
        },
        methods: {
            async init() {
                let that = this
                let container = document.getElementById('container');

                // 创建场景
                scene = new THREE.Scene();

                // 创建相机
                camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);  //透视投影相机
                camera.position.set(125, 81, -316); //相机在Three.js坐标系中的位置

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
                this.addFlyLine()

                container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);

                this.renders()

            },
            /* *****************添加飞线相关代码**start************************ */
            addFlyLine() {
                let startPoint = this.lon2xyz(R + 1.1, flyLineData.start.E, flyLineData.start.N)  //加1.1因为怕被国家多边形mesh遮挡住  看起来起点不是在一个点上
                let startPointVector3 = new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z)
                let group = new THREE.Group()
                let ringMarkGroup = new THREE.Group()
                flyLineData.endArr.forEach(e => {
                    let endPoint = this.lon2xyz(R + 1.1, e.E, e.N)

                    //计算绘制圆弧需要的关于y轴对称的起点、结束点和旋转四元数
                    let startEndQua = this.startEndQuaternion(startPointVector3, new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z))
                    var arcline = this.arcXOY(startEndQua.startPoint, startEndQua.endPoint);
                    arcline.quaternion.multiply(startEndQua.quaternion)
                    flyArr.push(arcline.flyLine);//获取飞线段
                    group.add(arcline)

                    //添加原点和波动光圈
                    ringMarkGroup.add(this.addCircleMark({ position: endPoint }))
                    ringMarkGroup.add(this.addRingMark({ position: endPoint }))



                })
                // 添加棱锥
                group.add(this.createConeMesh(R + 1.1, flyLineData.start.E, flyLineData.start.N))
                group.add(this.addCircleMark({ position: startPoint }))

                let startPoint1 = this.lon2xyz(R + (R + 1.1) / 18 * 4, flyLineData.start.E, flyLineData.start.N)
                group.add(this.addRingMark({ position: startPoint1 }))

                scene.add(group)
                scene.add(ringMarkGroup)

            },
            createFlyLine(r, startAngle, endAngle) {
                var geometry = new THREE.BufferGeometry(); //声明一个几何体对象BufferGeometry
                // THREE.ArcCurve创建圆弧曲线
                var arc = new THREE.ArcCurve(0, 0, r, startAngle, endAngle, false);
                //getSpacedPoints是基类Curve的方法，返回一个vector2对象作为元素组成的数组
                var pointsArr = arc.getSpacedPoints(50); //分段数50，返回51个顶点
                geometry.setFromPoints(pointsArr);// setFromPoints方法从pointsArr中提取数据改变几何体的顶点属性vertices
                // 每个顶点对应一个百分比数据attributes.percent 用于控制点的渲染大小
                var percentArr = []; //attributes.percent的数据
                for (var i = 0; i < pointsArr.length; i++) {
                    percentArr.push(i / pointsArr.length * 0.8);
                }
                var percentAttribue = new THREE.BufferAttribute(new Float32Array(percentArr), 1);
                // 通过顶点数据percent点模型从大到小变化，产生小蝌蚪形状飞线
                geometry.attributes.percent = percentAttribue;
                // 批量计算所有顶点颜色数据
                var colorArr = [];
                for (var i = 0; i < pointsArr.length; i++) {
                    var color1 = new THREE.Color(0x009999); //轨迹线颜色 青色
                    var color2 = new THREE.Color(0xffff00); //黄色
                    var color = color1.lerp(color2, i / pointsArr.length)
                    colorArr.push(color.r, color.g, color.b);
                }
                // 设置几何体顶点颜色数据
                geometry.attributes.color = new THREE.BufferAttribute(new Float32Array(colorArr), 3);
                // 点模型渲染几何体每个顶点
                var material = new THREE.PointsMaterial({
                    // color: 0xffff00,
                    size: 3.0, //点大小
                    vertexColors: THREE.VertexColors, //使用顶点颜色渲染
                });
                // 修改点材质的着色器源码(注意：不同版本细节可能会稍微会有区别，不过整体思路是一样的)
                material.onBeforeCompile = function (shader) {
                    // 顶点着色器中声明一个attribute变量:百分比
                    shader.vertexShader = shader.vertexShader.replace(
                        'void main() {',
                        [
                            'attribute float percent;', //顶点大小百分比变量，控制点渲染大小
                            'void main() {',
                        ].join('\n') // .join()把数组元素合成字符串
                    );
                    // 调整点渲染大小计算方式
                    shader.vertexShader = shader.vertexShader.replace(
                        'gl_PointSize = size;',
                        [
                            'gl_PointSize = percent * size;',
                        ].join('\n') // .join()把数组元素合成字符串
                    );
                };
                var FlyLine = new THREE.Points(geometry, material);
                // var material = new THREE.LineBasicMaterial({color: 0xffff00,});//线条材质
                // var line = new THREE.Line(geometry, material);//线条模型对象
                return FlyLine;
            },
            /*把球面上任意两点坐标转化到XOY平面内，且关于y轴对称*/
            startEndQuaternion(startSphere, endSphere) {
                /*计算第一次旋转的四元数：表示从一个平面如何旋转到另一个平面*/
                var origin = new THREE.Vector3(0, 0, 0);//球心坐标
                var startDir = startSphere.clone().sub(origin);//飞线起点与球心构成方向向量
                var endDir = endSphere.clone().sub(origin);//飞线结束点与球心构成方向向量
                // dir1和dir2构成一个三角形，.cross()叉乘计算该三角形法线normal
                var normal = startDir.clone().cross(endDir).normalize();
                var xoyNormal = new THREE.Vector3(0, 0, 1);//XOY平面的法线
                //.setFromUnitVectors()计算从normal向量旋转达到xoyNormal向量所需要的四元数
                // quaternion表示把球面飞线旋转到XOY平面上需要的四元数
                var quaternion3D_XOY = new THREE.Quaternion().setFromUnitVectors(normal, xoyNormal);
                /*第一次旋转：飞线起点、结束点从3D空间第一次旋转到XOY平面*/
                var startSphereXOY = startSphere.clone().applyQuaternion(quaternion3D_XOY);
                var endSphereXOY = endSphere.clone().applyQuaternion(quaternion3D_XOY);

                /*计算第二次旋转的四元数*/
                // middleV3：startSphereXOY和endSphereXOY的中点
                var middleV3 = startSphereXOY.clone().add(endSphereXOY).multiplyScalar(0.5);
                var midDir = middleV3.clone().sub(origin).normalize();// 旋转前向量midDir，中点middleV3和球心构成的方向向量
                var yDir = new THREE.Vector3(0, 1, 0);// 旋转后向量yDir，即y轴
                // .setFromUnitVectors()计算从midDir向量旋转达到yDir向量所需要的四元数
                // quaternion2表示让第一次旋转到XOY平面的起点和结束点关于y轴对称需要的四元数
                var quaternionXOY_Y = new THREE.Quaternion().setFromUnitVectors(midDir, yDir);

                /*第二次旋转：使旋转到XOY平面的点再次旋转，实现关于Y轴对称*/
                var startSpherXOY_Y = startSphereXOY.clone().applyQuaternion(quaternionXOY_Y);
                var endSphereXOY_Y = endSphereXOY.clone().applyQuaternion(quaternionXOY_Y);

                /*一个四元数表示一个旋转过程
                .invert()方法表示四元数的逆，简单说就是把旋转过程倒过来
                两次旋转的四元数执行.invert()求逆，然后执行.multiply()相乘*/
                var quaternionInverse = quaternion3D_XOY.clone().invert().multiply(quaternionXOY_Y.clone().invert())

                return {
                    // 返回两次旋转四元数的逆四元数
                    quaternion: quaternionInverse,
                    // 范围两次旋转后在XOY平面上关于y轴对称的圆弧起点和结束点坐标
                    startPoint: startSpherXOY_Y,
                    endPoint: endSphereXOY_Y,
                }
            },
            /*通过函数arcXOY()可以在XOY平面上绘制一个关于y轴对称的圆弧曲线
        startPoint, endPoint：表示圆弧曲线的起点和结束点坐标值，起点和结束点关于y轴对称*/
            arcXOY(startPoint, endPoint) {
                // 计算两点的中点
                var middleV3 = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
                // 弦垂线的方向dir(弦的中点和圆心构成的向量)
                var dir = middleV3.clone().normalize()
                // 计算球面飞线的起点、结束点和球心构成夹角的弧度值
                var earthRadianAngle = this.radianAOB(startPoint, endPoint, new THREE.Vector3(0, 0, 0))
                /*设置飞线轨迹圆弧的中间点坐标
                弧度值 * R * 0.2：表示飞线轨迹圆弧顶部距离地球球面的距离
                起点、结束点相聚越远，构成的弧线顶部距离球面越高*/
                var arcTopCoord = dir.multiplyScalar(R + earthRadianAngle * R * 0.2)
                //求三个点的外接圆圆心(飞线圆弧轨迹的圆心坐标)
                var flyArcCenter = this.threePointCenter(startPoint, endPoint, arcTopCoord)
                // 飞线圆弧轨迹半径flyArcR
                var flyArcR = Math.abs(flyArcCenter.y - arcTopCoord.y);
                /*坐标原点和飞线起点构成直线和y轴负半轴夹角弧度值
                参数分别是：飞线圆弧起点、y轴负半轴上一点、飞线圆弧圆心*/
                var flyRadianAngle = this.radianAOB(startPoint, new THREE.Vector3(0, -1, 0), flyArcCenter);
                var startAngle = -Math.PI / 2 + flyRadianAngle;//飞线圆弧开始角度
                var endAngle = Math.PI - startAngle;//飞线圆弧结束角度
                // 调用圆弧线模型的绘制函数
                var arcline = this.circleLine(flyArcCenter.x, flyArcCenter.y, flyArcR, startAngle, endAngle)
                arcline.center = flyArcCenter;//飞线圆弧自定一个属性表示飞线圆弧的圆心
                arcline.topCoord = arcTopCoord;//飞线圆弧自定一个属性表示飞线圆弧中间也就是顶部坐标

                // var flyAngle = Math.PI/ 10; //飞线圆弧固定弧度
                var flyAngle = (endAngle - startAngle) / 7; //飞线圆弧的弧度和轨迹线弧度相关
                // 绘制一段飞线，圆心做坐标原点
                var flyLine = this.createFlyLine(flyArcR, startAngle, startAngle + flyAngle);
                flyLine.position.y = flyArcCenter.y;//平移飞线圆弧和飞线轨迹圆弧重合
                //飞线段flyLine作为飞线轨迹arcLine子对象，继承飞线轨迹平移旋转等变换
                arcline.add(flyLine);
                //飞线段运动范围startAngle~flyEndAngle
                flyLine.flyEndAngle = endAngle - startAngle - flyAngle;
                flyLine.startAngle = startAngle;
                // arcline.flyEndAngle：飞线段当前角度位置，这里设置了一个随机值用于演示
                flyLine.AngleZ = flyLine.flyEndAngle * Math.random();
                // flyLine.rotation.z = flyLine.AngleZ;
                // arcline.flyLine指向飞线段,便于设置动画是访问飞线段
                arcline.flyLine = flyLine;

                return arcline
            },
            /*计算球面上两点和球心构成夹角的弧度值
            参数point1, point2:表示地球球面上两点坐标Vector3
            计算A、B两点和顶点O构成的AOB夹角弧度值*/
            radianAOB(A, B, O) {
                // dir1、dir2：球面上两个点和球心构成的方向向量
                var dir1 = A.clone().sub(O).normalize();
                var dir2 = B.clone().sub(O).normalize();
                //点乘.dot()计算夹角余弦值
                var cosAngle = dir1.clone().dot(dir2);
                var radianAngle = Math.acos(cosAngle);//余弦值转夹角弧度值,通过余弦值可以计算夹角范围是0~180度
                // console.log('夹角度数',THREE.Math.radToDeg(radianAngle));
                return radianAngle
            },
            //求三个点的外接圆圆心，p1, p2, p3表示三个点的坐标Vector3。
            threePointCenter(p1, p2, p3) {
                var L1 = p1.lengthSq();//p1到坐标原点距离的平方
                var L2 = p2.lengthSq();
                var L3 = p3.lengthSq();
                var x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y;
                var S = x1 * y2 + x2 * y3 + x3 * y1 - x1 * y3 - x2 * y1 - x3 * y2;
                var x = (L2 * y3 + L1 * y2 + L3 * y1 - L2 * y1 - L3 * y2 - L1 * y3) / S / 2;
                var y = (L3 * x2 + L2 * x1 + L1 * x3 - L1 * x2 - L2 * x3 - L3 * x1) / S / 2;
                // 三点外接圆圆心坐标
                var center = new THREE.Vector3(x, y, 0);
                return center
            },
            /*绘制一条圆弧曲线模型Line
            5个参数含义：(圆心横坐标, 圆心纵坐标, 飞线圆弧轨迹半径, 开始角度, 结束角度)*/
            circleLine(x, y, r, startAngle, endAngle) {
                var geometry = new THREE.Geometry(); //声明一个几何体对象Geometry
                // THREE.ArcCurve创建圆弧曲线
                var arc = new THREE.ArcCurve(x, y, r, startAngle, endAngle, false);
                //getSpacedPoints是基类Curve的方法，返回一个vector2对象作为元素组成的数组
                var points = arc.getSpacedPoints(50); //分段数50，返回51个顶点
                geometry.setFromPoints(points);// setFromPoints方法从points中提取数据改变几何体的顶点属性vertices
                var material = new THREE.LineBasicMaterial({ color: 0x00ffff, });//线条材质
                var line = new THREE.Line(geometry, material);//线条模型对象
                return line;
            },
            /* *****************添加飞线相关代码**end************************ */
            createConeMesh(R, lon, lat) {
                var radius = R / 18;//圆锥半径  和地球半径建立尺寸关系
                var height = radius * 4;//棱锥高度
                // 圆锥体几何体API(ConeGeometry)圆周方向四等分实现四棱锥效果
                var geometry = new THREE.ConeGeometry(radius, height, 4);
                // 缓冲类型几何体BufferGeometry没有computeFlatVertexNormals方法
                geometry.computeFlatVertexNormals();//一种计算顶点法线方式，非光滑渲染
                // 可以根据需要旋转到特定角度
                // geometry.rotateX(Math.PI);
                geometry.rotateX(-Math.PI / 2);
                geometry.translate(0, 0, height / 2);
                // MeshBasicMaterial MeshLambertMaterial
                var material = new THREE.MeshLambertMaterial({
                    color: 0x00ffff,
                });
                var mesh = new THREE.Mesh(geometry, material);

                // 棱锥上在叠加一个棱锥
                var mesh2 = mesh.clone();
                mesh2.scale.z = 0.5;
                mesh2.position.z = height * (1 + mesh2.scale.z);
                mesh2.rotateX(Math.PI);
                mesh.add(mesh2);

                // 经纬度转球面坐标
                var coord = this.lon2xyz(R, lon, lat)

                //设置mesh位置
                mesh.position.set(coord.x, coord.y, coord.z);
                // mesh姿态设置
                // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
                var coordVec3 = new THREE.Vector3(coord.x, coord.y, coord.z).normalize();
                // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
                var meshNormal = new THREE.Vector3(0, 0, 1);
                // 四元数属性.quaternion表示mesh的角度状态
                //.setFromUnitVectors();计算两个向量之间构成的四元数值
                mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
                mesh.name = 'cone'

                return mesh;
            },
            addRingMark(data) {
                // 矩形平面网格模型设置背景透明的png贴图
                var geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
                var textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/标注光圈.png');
                var material = new THREE.MeshBasicMaterial({
                    color: 0x44ffaa,
                    map: texture,
                    transparent: true, //使用背景透明的png贴图，注意开启透明计算
                    // side: THREE.DoubleSide, //双面可见
                    opacity: 1.0,
                    depthWrite: false,//禁止写入深度缓冲区数据
                });


                var mesh = new THREE.Mesh(geometry, material);
                var size = R * 0.12;//矩形平面Mesh的尺寸
                mesh.size = size;
                mesh.scale.set(size, size, size);//设置mesh大小
                mesh._s = Math.random() * 1.0 + 1.0;//自定义属性._s表示mesh在原始大小基础上放大倍数  光圈在原来mesh.size基础上1~2倍之间变化
                mesh.position.set(data.position.x, data.position.y, data.position.z);//设置mesh位置

                // mesh姿态设置
                // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
                var coordVec3 = new THREE.Vector3(data.position.x, data.position.y, data.position.z).normalize();
                // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
                var meshNormal = new THREE.Vector3(0, 0, 1);
                // 四元数属性.quaternion表示mesh的角度状态
                //.setFromUnitVectors();计算两个向量之间构成的四元数值
                mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
                mesh.name = 'ringMark';
                mesh.busiData = data;
                return mesh;
            },
            //添加圆形
            addCircleMark(data) {

                // 矩形平面网格模型设置背景透明的png贴图
                var geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
                var textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
                var texture = textureLoader.load(process.env.BASE_URL + 'static/earth3D/标注1.png');
                var material = new THREE.MeshBasicMaterial({
                    // color: 0x44ffaa,
                    map: texture,
                    transparent: true, //使用背景透明的png贴图，注意开启透明计算
                    // side: THREE.DoubleSide, //双面可见
                });


                var mesh = new THREE.Mesh(geometry, material);
                var size = R * 0.05;//矩形平面Mesh的尺寸
                mesh.scale.set(size, size, size);//设置mesh大小
                mesh.position.set(data.position.x, data.position.y, data.position.z);//设置mesh位置

                // mesh姿态设置
                // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
                var coordVec3 = new THREE.Vector3(data.position.x, data.position.y, data.position.z).normalize();
                // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
                var meshNormal = new THREE.Vector3(0, 0, 1);
                // 四元数属性.quaternion表示mesh的角度状态
                //.setFromUnitVectors();计算两个向量之间构成的四元数值
                mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
                mesh.busiData = data;
                return mesh;

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

                        let meshGroup = new THREE.Group()
                        meshGroup.add(that.addCountryMesh(e.geometry.coordinates, e))
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
                return mesh
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
                scene.traverse(function (mesh) {
                    if (mesh instanceof THREE.Group) {
                        mesh.rotation.y += 0.005;
                    }


                    if (mesh.name == 'cone') {
                        mesh.rotateZ(-0.02);//棱锥自转
                    }

                    if (mesh instanceof THREE.Mesh && mesh.name == 'ringMark') {
                        mesh._s += 0.007;
                        mesh.scale.set(mesh.size * mesh._s, mesh.size * mesh._s, mesh.size * mesh._s);
                        if (mesh._s <= 1.5) {
                            mesh.material.opacity = (mesh._s - 1) * 2;//2等于1/(1.5-1.0)，保证透明度在0~1之间变化
                        } else if (mesh._s > 1.5 && mesh._s <= 2) {
                            mesh.material.opacity = 1 - (mesh._s - 1.5) * 2;//2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
                        } else {
                            mesh._s = 1.0;
                        }
                        // mapGroup.rotation.y += 0.003;
                    }
                });

                // 批量设置所有飞线的运动动画
                flyArr.forEach((fly) => {
                    fly.rotation.z += 0.015; //调节飞线速度
                    if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = fly.startAngle;
                });
                requestAnimationFrame(this.renders);
                renderer.render(scene, camera);
            }

        },
    };

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