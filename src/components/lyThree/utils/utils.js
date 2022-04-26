export default {
    // 遍历对象并对相应的属性赋值
    traverseObj(org,ent){
        if(ent){
            Object.keys(ent).map(key=>{
                if(org[key] && ent[key] &&  org[key] instanceof Object && ent[key] instanceof Object){
                    console.log('111',key)
                    console.log('222',org[key],ent[key])
                    this.traverseObj(org[key],ent[key])
                }else{
                    org[key] = ent[key]
                }
            })
        }
        return org
    },

    // 经纬度转世界坐标
    /**
     * 
     * @param {*} R 球半径
     * @param {*} longitude 精度
     * @param {*} latitude 维度
     * @returns 
     */
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
    maxFun(coord) {
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
      },
      // 数组排序规则
     compareNum(num1, num2) {
        if (num1 < num2) {
            return -1;
        } else if (num1 > num2) {
            return 1;
        } else {
            return 0;
        }
    },
    //   经纬度坐标进行排序
    minMax(arr) {
        // 数组元素排序
        arr.sort(compareNum);
        // 通过向两侧取整，把经纬度的方位稍微扩大
        return [Math.floor(arr[0]), Math.ceil(arr[arr.length - 1])]
    }
}