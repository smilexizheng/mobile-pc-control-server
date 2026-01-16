import { createRouter, createWebHashHistory } from 'vue-router'
import EventConfig from '../views/EventConfig/index.vue'
import ImportEvent from '../views/ImportEvent/index.vue'
import Mouse from '../views/Mouse/index.vue'
import ScreenLive from '../views/ScreenLive/index.vue'
import MonitorWindow from '../views/MonitorWindow/index.vue'
import Transfer from '../views/Transfer/index.vue'
import Chat from '../views/Transfer/Chat.vue'
import ChatList from '../views/Transfer/ChatList.vue'
import Schedule from '../views/Schedule/index.vue'
import Game from '../views/Game/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: '首页',
      // @ts-ignore
      component: () => import('../views/Home/index.vue')
    },
    {
      path: '/mouse',
      name: '远程控制',
      component: Mouse
    },
    {
      path: '/screen-live',
      name: '屏幕监视',
      component: ScreenLive
    },
    {
      path: '/event-config',
      name: '我的指令',
      component: EventConfig
    },
    {
      path: '/import-event',
      name: '导入指令',
      component: ImportEvent
    },
    {
      path: '/monitor-window',
      name: '窗口监控',
      component: MonitorWindow
    },
    {
      path: '/transfer',
      name: '文件上传',
      component: Transfer
    },
    {
      path: '/chat',
      name: '消息互传',
      component: Chat
    },
    {
      path: '/chatList',
      name: '在线列表',
      component: ChatList
    },
    {
      path: '/schedule',
      name: '任务计划',
      component: Schedule
    },
    {
      path: '/game',
      name: 'EmulatorJS',
      component: Game
    }
  ]
})

export default router
