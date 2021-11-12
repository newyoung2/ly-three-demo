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
