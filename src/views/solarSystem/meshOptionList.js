import * as THREE from 'THREE'
let publicPath = process.env.BASE_URL
let gap = 40
let meshOptionList = [
    {
        
        name: 'sun',
        text: '太阳',
        geometryOption: [20, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/太阳.jpg`,
        },
        position: [0, 0, 0],
        mesh: null,
        index: 0,
        otherOption: {  //其他配置
            speed: 0.01,   //太阳自转速度
        }
    },
    {
        
        name: 'waterStar',
        text: '水星',
        geometryOption: [5, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/水星.jpg`
        },
        position: [40, 0, 0],
        mesh: null,
        index: 1,
        tourOption: {  //轨迹线相关配置
            geometryOption: [40, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        otherOption: {  //其他配置
            speed: 0.01,   //地球自转速度
            angle: 0,    //地球角度
            angleSpeed: 0.005, //公转速度
            radius: 40,  //地球公转半径
        }
    },
    {
        
        name: 'goldStar',
        text: '金星',
        geometryOption: [7, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/金星.jpg`
        },
        position: [80, 0, 0],
        mesh: null,
        index: 2,
        tourOption: {  //轨迹线相关配置
            geometryOption: [80, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 50,    //角度
            angleSpeed: 0.001, //公转速度
            radius: 80,  //公转半径
        }
    },
    {
        
        name: 'earth',
        text: '地球',
        geometryOption: [10, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/地球.jpg`
        },
        position: [120, 0, 0],
        mesh: null,
        index: 3,
        tourOption: {  //轨迹线相关配置
            geometryOption: [120, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 10,    //角度
            angleSpeed: 0.002, //公转速度
            radius: 120,  //公转半径
        }
    },
    {
        
        name: 'fireStar',
        text: '火星',
        geometryOption: [9, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/火星.jpg`
        },
        position: [160, 0, 0],
        mesh: null,
        index: 4,
        tourOption: {  //轨迹线相关配置
            geometryOption: [160, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 120,    //角度
            angleSpeed: 0.004, //公转速度
            radius: 160,  //公转半径
        }
    },
    {
        
        name: 'woodStar',
        text: '木星',
        geometryOption: [15, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/木星.jpg`
        },
        position: [200, 0, 0],
        mesh: null,
        index: 5,
        tourOption: {  //轨迹线相关配置
            geometryOption: [200, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 80,    //角度
            angleSpeed: 0.003, //公转速度
            radius: 200,  //公转半径
        }
    },
    {
        
        name: 'landStar',
        text: '土星',
        geometryOption: [12, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/土星.jpg`
        },
        position: [240, 0, 0],
        mesh: null,
        index: 6,
        tourOption: {  //轨迹线相关配置
            geometryOption: [240, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        ringOption:{  //轨迹线相关配置
            geometryOption: [15,25, 30],
            materialOption: {
                map: new THREE.TextureLoader().load(`${publicPath}static/solarSystem/土星环.png`),
                side: THREE.DoubleSide,
            }
        },
        lightRing:true, //是否开启星环光圈
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 40,    //角度
            angleSpeed: 0.001, //公转速度
            radius: 240,  //公转半径
        }
    },
    {
        
        name: 'skyKingStar',
        text: '天王星',
        geometryOption: [12, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/天王星.jpg`
        },
        position: [280, 0, 0],
        mesh: null,
        index: 7,
        tourOption: {  //轨迹线相关配置
            geometryOption: [280, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        ringOption:{  //轨迹线相关配置
            geometryOption: [15,25,30],
            materialOption: {
                map: new THREE.TextureLoader().load(`${publicPath}static/solarSystem/天王星环.png`),
                side: THREE.DoubleSide,
            }
        },
        lightRing:true, //是否开启星环光圈
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 180,    //角度
            angleSpeed: 0.004, //公转速度
            radius: 280,  //公转半径
        }
    },
    {
        
        name: 'seaKingStar',
        text: '海王星',
        geometryOption: [10, 32, 32],
        materialOption: {
            map: `${publicPath}static/solarSystem/海王星.jpg`
        },
        position: [320, 0, 0],
        mesh: null,
        index: 8,
        tourOption: {  //轨迹线相关配置
            geometryOption: [320, 0.2, 16, 100],
            materialOption: {
                color: 0x006666
            }
        },
        tourMesh: null,
        otherOption: {  //其他配置
            speed: 0.01,   //自转速度
            angle: 100,    //角度
            angleSpeed: 0.002, //公转速度
            radius: 320,  //公转半径
        }
    }
]

export default meshOptionList