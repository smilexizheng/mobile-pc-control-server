import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@renderer/views/Home/index.vue'
import Draw from '@renderer/views/Draw/index.vue'
import Chat from '@renderer/views/Chat/index.vue'
import Game from '@renderer/views/Game/index.vue'
import Layout from '@renderer/page/layout/index.vue'
import AppLayout from '@renderer/page/app/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: 'home',
          component: Home
        },
        {
          path: '/draw',
          name: 'draw',
          component: Draw
        },
        {
          path: '/chat',
          name: 'chat',
          component: Chat
        }
      ]
    },
    {
      path: '/app',
      component: AppLayout,
      children: [
        {
          path: '/setting',
          name: 'setting',
          component: () => import('@renderer/views/Setting/Settings.vue')
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@renderer/views/Setting/Versions.vue')
        },
        {
          path: '/game',
          name: 'game',
          component: Game
        }
      ]
    }
  ]
})

export default router
