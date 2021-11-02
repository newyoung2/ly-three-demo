import * as Cesium from "cesium/Cesium";
import widget from "cesium/Widgets/widgets.css";

export default {
    
  //测量空间直线距离 
  /******************************************* */
  measureLineSpace(viewer, handler) {
    // 取消双击事件-追踪该位置
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
    var positions = [];
    var poly = null;
    // var tooltip = document.getElementById("toolTip");
    var distance = 0;
    var cartesian = null;
    var floatingPoint;
    // tooltip.style.display = "block";

    handler.setInputAction(function (movement) {
      // tooltip.style.left = movement.endPosition.x + 3 + "px";
      // tooltip.style.top = movement.endPosition.y - 25 + "px";
      // tooltip.innerHTML = '<p>单击开始，右击结束</p>';
      // cartesian = viewer.scene.pickPosition(movement.endPosition);
      let ray = viewer.camera.getPickRay(movement.endPosition);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if (positions.length >= 2) {
        if (!Cesium.defined(poly)) {
          poly = new PolyLinePrimitive(positions);
        } else {
          positions.pop();
          // cartesian.y += (1 + Math.random());
          positions.push(cartesian);
        }
        distance = getSpaceDistance(positions);
        // console.log("distance: " + distance);
        // tooltip.innerHTML='<p>'+distance+'米</p>';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (movement) {
      // tooltip.style.display = "none";
      // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      // cartesian = viewer.scene.pickPosition(movement.position);
      let ray = viewer.camera.getPickRay(movement.position);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (positions.length == 0) {
        positions.push(cartesian.clone());
      }
      positions.push(cartesian);
      //在三维场景中添加Label
      //   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      var textDisance = distance + "米";
      // console.log(textDisance + ",lng:" + cartographic.longitude/Math.PI*180.0);
      floatingPoint = viewer.entities.add({
        name: '空间直线距离',
        // position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: textDisance,
          font: '18px sans-serif',
          fillColor: Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20),
        }
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function (movement) {
    //   handler.destroy(); //关闭事件句柄
       positions.pop(); //最后一个点无效
       positions = [];
       poly = null;
       distance = 0;
       cartesian = null;
       floatingPoint;
      // viewer.entities.remove(floatingPoint);
      // tooltip.style.display = "none";

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    
    // 清除已画的线段
    function clear() {
        positions = [];
       poly = null;
       distance = 0;
       cartesian = null;
       floatingPoint;
        viewer.entities.removeAll()
    }

    var PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          name: '直线',
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 5,
            clampToGround: true
          }
        };
        this.positions = positions;
        this._init();
      }

      _.prototype._init = function () {
        var _self = this;
        var _update = function () {
          return _self.positions;
        };
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
        viewer.entities.add(this.options);
      };

      return _;
    })();

    //空间两点距离计算函数
    function getSpaceDistance(positions) {
      var distance = 0;
      for (var i = 0; i < positions.length - 1; i++) {

        var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
        distance = distance + s;
      }
      return distance.toFixed(2);
    }

    return {clear}
  },

  //****************************测量空间面积************************************************//
  measureAreaSpace(viewer, handler){  
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 鼠标事件
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
    var positions = [];
    var tempPoints = [];
    var polygon = null;
    // var tooltip = document.getElementById("toolTip");
    var cartesian = null;
    var floatingPoint;//浮动点
    // tooltip.style.display = "block";
    
    handler.setInputAction(function(movement){
        // tooltip.style.left = movement.endPosition.x + 3 + "px";
        // tooltip.style.top = movement.endPosition.y - 25 + "px";
    // tooltip.innerHTML ='<p>单击开始，右击结束</p>';
        // cartesian = viewer.scene.pickPosition(movement.endPosition); 
      // let ray = viewer.camera.getPickRay(movement.endPosition);
      // cartesian = viewer.scene.globe.pick(ray, viewer.scene);
     
        cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if(positions.length >= 2){
            
            if (!Cesium.defined(polygon)) {
                console.log(positions)
                polygon = new PolygonPrimitive(positions);
            }else{
                positions.pop();
                // cartesian.y += (1 + Math.random());
                positions.push(cartesian);
            }
            // tooltip.innerHTML='<p>'+distance+'米</p>';
        }
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
    handler.setInputAction(function(movement){
        // tooltip.style.display = "none";
        // cartesian = viewer.scene.pickPosition(movement.position); 
      //   console.log(movement)
      // let ray = viewer.camera.getPickRay(movement.position);
      // cartesian = viewer.scene.globe.pick(ray, viewer.scene);

      // cartesian = viewer.scene.pickPosition(movement.position)
        cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        if(positions.length == 0) {
            positions.push(cartesian.clone());
        }
        //positions.pop();
        positions.push(cartesian);
        console.log(cartesian)
        //在三维场景中添加点
        var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        var heightString = cartographic.height;
        tempPoints.push({ lng: longitudeString, lat: latitudeString ,hei:heightString});
        console.log(tempPoints)
        floatingPoint = viewer.entities.add({
            name : '多边形面积',
            position : positions[positions.length - 1],         
            point : {
                pixelSize : 5,
                color : Cesium.Color.RED,
                outlineColor : Cesium.Color.WHITE,
                outlineWidth : 2,
                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND 
            }
        }); 
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
     
    handler.setInputAction(function(movement){
        // handler.destroy();
        positions.pop();
        
        //tempPoints.pop();
        // viewer.entities.remove(floatingPoint);
        // tooltip.style.display = "none";
        //在三维场景中添加点
        // var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        // var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        // var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        // var heightString = cartographic.height;
        // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});
 
        var textArea = computeSignedArea(tempPoints);
        viewer.entities.add({
            name : '多边形面积',
            position : positions[positions.length - 1],
            // point : {
            //  pixelSize : 5,
            //  color : Cesium.Color.RED,
            //  outlineColor : Cesium.Color.WHITE,
            //  outlineWidth : 2,
            //  heightReference:Cesium.HeightReference.CLAMP_TO_GROUND 
            // },
            label : {
                text : textArea,
                font : '18px sans-serif',
                fillColor : Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth : 2,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
        pixelOffset : new Cesium.Cartesian2(20, -40),
        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });     

        positions = [];
        tempPoints = [];
        polygon = null;
        // var tooltip = document.getElementById("toolTip");
        cartesian = null;
        floatingPoint;//浮动点

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK );   

    // 清除已画的线段
    function clear() {
        positions = [];
        tempPoints = [];
        polygon = null;
        // var tooltip = document.getElementById("toolTip");
        cartesian = null;
        floatingPoint;//浮动点
        viewer.entities.removeAll()
    }
    
    var PolygonPrimitive = (function(){
        function _(positions){
            this.options = {
                name:'多边形',
                polygon : {
                    hierarchy : [],
                    // perPositionHeight : true,
                    material : Cesium.Color.GREEN.withAlpha(0.5),
          // heightReference:20000
                }
            };
            this.hierarchy = new Cesium.PolygonHierarchy(positions);
            this._init();
        }
    
        _.prototype._init = function(){
            var _self = this;
            var _update = function(){
                return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update,false);
            viewer.entities.add(this.options);
        };
    
        return _;
    })();
 
    // js根据经纬度计算水平面积
    function computeSignedArea(path) {
        // //传入path：{
        //     [{lat:,lng:}],[{lat:,lng:}],[{lat:,lng:}]
        // }
            let radius= 6371009
            let len = path.length;
            if (len < 3) return 0; 
            let total = 0;
            let  prev = path[len - 1];
            let prevTanLat = Math.tan(((Math.PI / 2 - prev.lat/180*Math.PI) / 2));
            let prevLng = (prev.lng)/180*Math.PI;
            for (let i in path) {
                let tanLat = Math.tan((Math.PI / 2 -
                    (path[i].lat)/180*Math.PI) / 2);
                let lng = (path[i].lng)/180*Math.PI;
                total += polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
                prevTanLat = tanLat;
                prevLng = lng;
            }
            if(Math.abs(total * (radius * radius))>100000){
                return `${(Math.abs(total * (radius * radius))/1000000.0).toFixed(4)}平方公里`   //平方公里
            }else{
                return `${Math.abs(total * (radius * radius)).toFixed(4)}平方米`;   //平方米
            }
            
            
        }

        function polarTriangleArea(tan1,lng1,tan2,lng2) {
                let deltaLng = lng1 - lng2;
                let t = tan1 * tan2;
                return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
        }

    return {clear}
  }

}