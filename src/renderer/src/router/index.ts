import { createRouter, createWebHistory } from 'vue-router'
import Home from '@renderer/views/Home/index.vue'
import Ocr from '@renderer/views/OCR/index.vue'
import Chat from '@renderer/views/Chat/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: '首页',
      component: Home
    },
    {
      path: '/ocr',
      name: 'ocr',
      component: Ocr
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    }
  ]
})

export default router
