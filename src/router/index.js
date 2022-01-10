import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect:"/helloThree",
    children:[
      {
        path: '/test',
        name: 'test',
        component: () => import( '../views/KaiFaZhiNanDemo/test.vue')
      },
      {
        path: '/helloThree',
        name: 'helloThree',
        component: () => import( '../views/KaiFaZhiNanDemo/helloThree.vue')
      },
      {
        path: '/areaLight',
        name: 'areaLight',
        component: () => import( '../views/KaiFaZhiNanDemo/areaLight.vue')
      },
      {
        path: '/convex',
        name: 'convex',
        component: () => import( '../views/KaiFaZhiNanDemo/convex.vue')
      },
      {
        path: '/particle',
        name: 'particle',
        component: () => import( '../views/KaiFaZhiNanDemo/particle.vue')
      },
      {
        path: '/collada',
        name: 'collada',
        component: () => import( '../views/KaiFaZhiNanDemo/collada.vue')
      },
      {
        path: '/ply',
        name: 'ply',
        component: () => import( '../views/KaiFaZhiNanDemo/ply.vue')
      },
      {
        path: '/envMap',
        name: 'envMap',
        component: () => import( '../views/KaiFaZhiNanDemo/envMap.vue')
      },
      {
        path: '/juggle',
        name: 'juggle',
        component: () => import( '../views/KaiFaZhiNanDemo/juggle.vue')
      },
      {
        path: '/outlinePass',
        name: 'outlinePass',
        component: () => import( '../views/KaiFaZhiNanDemo/outlinePass.vue')
      },
      {
        path: 'sea',
        name: 'sea',
        component: () => import( '../views/KaiFaZhiNanDemo/sea.vue')
      },
      {
        path: 'bloom',
        name: 'bloom',
        component: () => import( '../views/KaiFaZhiNanDemo/bloom.vue')
      },
      {
        path: 'objmtl',
        name: 'objmtl',
        component: () => import( '../views/KaiFaZhiNanDemo/objmtl.vue')
      },
      {
        path: 'solarSystem',
        name: 'solarSystem',
        component: () => import( '../views/solarSystem/solarSystem.vue')
      },
      {
        path: 'lookRoom',
        name: 'lookRoom',
        component: () => import( '../views/smallDemo/lookRoom.vue')
      },
      {
        path: 'tubeFly',
        name: 'tubeFly',
        component: () => import( '../views/smallDemo/tubeFly.vue')
      },
      {
        path: 'earth3D',
        name: 'earth3D',
        component: () => import( '../views/earth3D/earth3D.vue')
      },
      {
        path: 'airportPoints',
        name: 'airportPoints',
        component: () => import( '../views/earth3D/airportPoints.vue')
      },
      {
        path: 'colorPercent',
        name: 'colorPercent',
        component: () => import( '../views/earth3D/colorPercent.vue')
      },
      {
        path: 'subwayLine',
        name: 'subwayLine',
        component: () => import( '../views/earth3D/subwayLine.vue')
      },
      {
        path: 'planeEarth',
        name: 'planeEarth',
        component: () => import( '../views/earth3D/planeEarth.vue')
      },
      {
        path: 'hotNews',
        name: 'hotNews',
        component: () => import( '../views/earth3D/hotNews.vue')
      },
      {
        path: 'countryMesh',
        name: 'countryMesh',
        component: () => import( '../views/earth3D/countryMesh.vue')
      },
      {
        path: 'countryMeshPoints',
        name: 'countryMeshPoints',
        component: () => import( '../views/earth3D/countryMeshPoints.vue')
      },
      {
        path: 'countryMeshColorLerp',
        name: 'countryMeshColorLerp',
        component: () => import( '../views/earth3D/countryMeshColorLerp.vue')
      },
      {
        path: 'population',
        name: 'population',
        component: () => import( '../views/earth3D/population.vue')
      },
      {
        path: 'flyLine',
        name: 'flyLine',
        component: () => import( '../views/earth3D/flyLine.vue')
      },
    ]
  }
]

const router = new VueRouter({
  routes
})


const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
