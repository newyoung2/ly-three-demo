export default /* glsl */`
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

// https://github.com/mrdoob/three.js/pull/22425
#ifdef USE_TRANSMISSION
diffuseColor.a *= transmissionAlpha + 0.1;
#endif

float x0 = 121.46887207031+time*0.01;
float w = 0.001;//光带宽度一半，单位米

if(vPosition.x>x0&&vPosition.x<x0+2.0*w){
    // 渐变色光带
    float per = 0.0;
    if(vPosition.x<x0+w){
        per = (vPosition.x-x0)/w;
        outgoingLight = mix( outgoingLight, vec3(1.0,1.0,1.0),per);
    }else{
        per = (vPosition.x-x0-w)/w;
        outgoingLight = mix( vec3(1.0,1.0,1.0),outgoingLight,per);
    }
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
}else{
    // 非线性渐变  小部分楼层太高，不同高度矮楼层颜色对比不明显,可以采用非线性渐变方式调节
   vec3 gradient = mix(vec3(0.0,0.1,0.1), vec3(0.0,1.0,1.0), sqrt(vPosition.z/0.001));

// 在光照影响明暗的基础上，设置渐变   (避免模型材质color属性影响渐变色，设置为默认的纯白色即可)
outgoingLight = outgoingLight*gradient;
gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}

`;
