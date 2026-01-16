<script setup>
import { onMounted, ref } from 'vue'
import VolumeControl from '@mobile/views/Home/VolumeControl.vue'
import { useSocketStore } from '@mobile/stores/socket'
import { useRouter } from 'vue-router'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { Key } from '@mobile/enums/key.enum.js'
import { LocalEventStore } from '@mobile/stores/localEventStore.js'
import Modal from '@mobile/components/ui/Modal.vue'

const router = useRouter()

const socketStore = useSocketStore()

const localEventStore = LocalEventStore()
// 模拟应用数据
const apps = ref([
  // {
  //   categoryName: "快捷指令", modules: [
  //
  //     // {name: "视频全屏", color: "#2196F3", events:[
  //     //     {event: CE.SYS_POINTER_MOVE, eventData: {x: 1230, y: 850}},
  //     //     {event: CE.SYS_POINTER_MOVE, eventData: {x: 1438, y: 966},delay:10},
  //     //     {event: CE.SYS_MOUSE_CLICK, eventData: {button: 0, double: false},delay:20}
  //     //   ]},
  //     // {name: "刷新", color: "#2196F3", events:[ {event: CE.KEYPRESS, eventData: {key: [Key.F5]}}]},
  //
  //     // {name: "音乐上一首", color: "#4CAF50", events:[ {event: CE.KEYPRESS, eventData: {key: [Key.LeftControl,Key.LeftAlt,Key.Left]}}]},
  //     // {name: "音乐下一首", color: "#2196F3", events:[ {event: CE.KEYPRESS, eventData: {key: [Key.LeftControl,Key.LeftAlt,Key.Right]}}]},
  //      // {name: "+音量", color: "#4CAF50", events:[ {event: CE.KEYPRESS, eventData: {key: [Key.LeftControl,Key.LeftAlt,Key.Up]}}]},
  //     // {name: "-音量", color: "#2196F3", events:[ {event: CE.KEYPRESS, eventData: {key:[Key.LeftControl,Key.LeftAlt,Key.Down]}}]},
  //     // {name: "歌词显隐", color: "#2196F3", events:[ {event: CE.KEYPRESS, eventData: {key: [Key.LeftControl,Key.LeftAlt,Key.W]}}]},
  //     // {name: "B站", color: "#4CAF50", events: [{event: CE.OPEN_URL, eventData: {url: "https://www.bilibili.com/"}}]},
  //   ]
  // },

  {
    categoryName: '快捷指令',
    modules: [
      // {name: "复制", color: "#2196F3", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.C]}}]},
      // {name: "粘贴", color: "#2196F3", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.V]}}]},
      // {name: "撤回", color: "#FF5722", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.Z]}}]},
      // {name: "休眠", color: "#22bdff", events: [{event: CE.SYS_SHUTDOWN, eventData: {type: "sleep"}}]},
      {
        name: '关机',
        color: '#ff2256',
        events: [{ event: CE.SYS_SHUTDOWN, eventData: { type: 'now' } }]
      },
      {
        name: '重启',
        color: '#2195f3',
        events: [{ event: CE.SYS_SHUTDOWN, eventData: { type: 'reboot' } }]
      },
      {
        name: '返回桌面',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftWin, Key.D] } }]
      },

      {
        name: '网页全屏',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.F11] } }]
      },
      {
        name: 'Esc',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.Escape] } }]
      }
      // {name: "空格", color: "#2196F3", events: [{event: CE.KEYPRESS, eventData: {key: [Key.Space]}}]},
      // {name: "回车", color: "#2196F3", events: [{event: CE.KEYPRESS, eventData: {key: [Key.Enter]}}]},
    ],
    showSysVolume: true
  },
  {
    categoryName: '应用',
    modules: [
      { name: '鼠标键盘', color: '#9217e4', action: 'router', toLink: '/mouse' },
      {
        name: '浏览器',
        color: '#f16b3a',
        events: [{ event: CE.OPEN_URL, eventData: { url: 'https://' } }]
      },
      { name: '文件上传', color: '#2196F3', action: 'router', toLink: '/transfer' },
      { name: '消息互传', color: '#28f321', action: 'router', toLink: '/chatList' },
      { name: '窗口', color: '#2196F3', action: 'router', toLink: '/monitor-window' },
      { name: '桌面', color: '#2196F3', action: 'router', toLink: '/screen-live' },
      { name: '我的指令', color: '#f34021', action: 'router', toLink: '/event-config' },
      { name: '导入指令', color: '#2196F3', action: 'router', toLink: '/import-event' },
      { name: '任务计划', color: '#f34021', action: 'router', toLink: '/schedule' }
    ]
  }
])

// 触控反馈效果
const handleTouchStart = (e) => {
  e.currentTarget.style.transform = 'scale(0.9)'
}

const handleTouchEnd = (e) => {
  e.currentTarget.style.transform = 'scale(1)'
}
</script>

<template>
  <div class="home-screen">
    <div class="app-area" v-for="m in apps">
      <div class="area-title">{{ m.categoryName }}</div>
      <nut-grid :column-num="5" :border="false">
        <nut-grid-item
          :text="module.name"
          v-for="module in m.modules"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          @click="socketStore.eventHandler(module)"
        >
          <nut-row class="text-icon" :style="{ backgroundColor: module.color }">
            {{ module.name.charAt(0) }}
          </nut-row>
        </nut-grid-item>
      </nut-grid>
      <VolumeControl v-if="m.showSysVolume" />
    </div>

    <div class="app-area">
      <div class="area-title">我的指令</div>
      <nut-grid :column-num="5" :border="false">
        <nut-grid-item
          :text="module.name"
          v-for="module in localEventStore.customEvents"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          @click="socketStore.eventHandler(module)"
        >
          <nut-row class="text-icon" :style="{ backgroundColor: module.color }">
            {{ module.name.charAt(0) }}
          </nut-row>
        </nut-grid-item>
      </nut-grid>
    </div>
  </div>
</template>

<style scoped>
.home-screen {
  user-select: none;
  overflow: auto;
  /* 移除点击高亮 */
  -webkit-tap-highlight-color: transparent;
}

.app-area {
  background: #fff;
  border-radius: 10px;
  padding: 5px;
  margin-bottom: 8px;
}

.area-title {
  font-weight: bold;
  font-size: 16px;
}

.text-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  /*margin-bottom: 2px;*/
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.app-icon:active .text-icon {
  transform: scale(0.92);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 375px) {
  .text-icon {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
}

@media (min-width: 768px) {
  .text-icon {
    width: 72px;
    height: 72px;
    font-size: 28px;
  }
}
</style>
