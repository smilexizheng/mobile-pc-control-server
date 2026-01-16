<script setup>
import { onMounted, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import VolumeControl from '@mobile/views/Home/VolumeControl.vue'
import { useSocketStore } from '@mobile/stores/socket'
import { useRouter } from 'vue-router'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { Key } from '@mobile/enums/key.enum.js'
import EventModal from '@mobile/components/event/EventModal.vue'
import { LocalEventStore } from '@mobile/stores/localEventStore.js'

const localEventStore = LocalEventStore()

const router = useRouter()

const socketStore = useSocketStore()

// 模拟应用数据
const apps = ref([
  {
    categoryName: '系统',
    modules: [
      {
        name: '回桌面',
        color: '#4CAF50',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftWin, Key.D] } }]
      },
      {
        name: '复制',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftControl, Key.C] } }]
      },
      {
        name: '粘贴',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftControl, Key.V] } }]
      },
      {
        name: '撤回',
        color: '#FF5722',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftControl, Key.Z] } }]
      }
    ],
    showSysVolume: true
  },
  {
    categoryName: '放大镜',
    modules: [
      {
        name: '开启',
        color: '#4CAF50',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftWin, Key.Add] } }]
      },
      {
        name: '关闭',
        color: '#FF5722',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftWin, Key.Escape] } }]
      },
      {
        name: '放大',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftWin, Key.Add] } }]
      },
      {
        name: '缩小',
        color: '#2196F3',
        events: [{ event: CE.KEYPRESS, eventData: { key: [Key.LeftWin, Key.Subtract] } }]
      }
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
      <nut-grid :column-num="4" :border="false">
        <nut-grid-item
          :text="module.name"
          v-for="module in m.modules"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          @click="socketStore.eventHandler(module)"
        >
          <nut-row class="text-icon" :style="{ backgroundColor: module.color }">
            {{ module.name }}
          </nut-row>
        </nut-grid-item>
      </nut-grid>
      <VolumeControl v-if="m.showSysVolume" />
    </div>

    <div class="app-area">
      <div class="area-title">我的</div>
      <nut-grid :column-num="4" :border="false">
        <nut-grid-item
          :text="module.name"
          v-for="module in localEventStore.customEvents"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          @click="socketStore.eventHandler(module)"
        >
          <nut-row class="text-icon" :style="{ backgroundColor: module.color }">
            {{ module.name }}
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
  touch-action: auto;
}

.app-area {
  border-radius: 10px;
  padding: 5px;
  margin-bottom: 8px;
}

.area-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
  color: #59fd06;
}

.text-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  /*font-weight: 500;*/
  /*box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);*/
  /*transition: transform 0.2s,*/
  /*box-shadow 0.2s;*/
}

.app-icon:active .text-icon {
  transform: scale(0.92);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
