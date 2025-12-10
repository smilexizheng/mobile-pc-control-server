import { createRouter, createWebHistory } from 'vue-router'
import Home from '@renderer/views/Home/index.vue'
import Draw from '@renderer/views/Draw/index.vue'
import Chat from '@renderer/views/Chat/index.vue'
import Game from '@renderer/views/Game/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: '首页',
      component: Home
    },
    {
      path: '/draw',
      name: 'Draw',
      component: Draw
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    },
    {
      path: '/game',
      name: 'game',
      component: Game
    }
  ]
})

export default router
