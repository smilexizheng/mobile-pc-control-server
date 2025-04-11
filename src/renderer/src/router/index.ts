import {createRouter, createWebHistory} from 'vue-router'
import Home from '@renderer/views/Home/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: '首页',
      component: Home
    },

  ]
})

export default router
