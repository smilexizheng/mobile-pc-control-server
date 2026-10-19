<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import { useSocketStore } from '@renderer/store/socket'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit'
import { ref } from 'vue'

const socketStore = useSocketStore()

const event = ref([
  {
    name: '关机',
    color: '#ff2256',
    events: [{ event: CE.SYS_SHUTDOWN, eventData: { type: 'now' } }]
  },
  {
    name: '重启',
    color: '#fd9b1b',
    events: [{ event: CE.SYS_SHUTDOWN, eventData: { type: 'reboot' } }]
  }
])
</script>

<template>
  <div style="padding: 0 1rem; height: 45%; overflow-y: auto" v-if="socketStore.isConnected">
    <div>
      <div class="title">
        {{
          socketStore.customEvents.length === 0
            ? '连接后 使用[我的指令] 进行自定义添加'
            : '我的指令'
        }}
      </div>
      <a-row class="fun-grid" :gutter="[20, 20]">
        <a-col
          :lg="3"
          :xxl="2"
          v-for="module in event"
          :title="module.name"
          @click="socketStore.eventHandler(module)"
        >
          <div class="text-icon" :style="{ backgroundColor: module.color }">
            {{ module.name.slice(0, 4) }}
          </div>
        </a-col>

        <!--自定义的功能-->
        <a-col
          :lg="3"
          :xxl="2"
          :title="module.name"
          v-for="module in socketStore.customEvents"
          @click="socketStore.eventHandler(module)"
        >
          <div v-if="module.logo">
            <img :src="module.logo" alt="logo" :title="module.name" style="height: 80%" />
            <div>{{ module.name.slice(0, 5) }}</div>
          </div>
          <div v-else>
            <div class="text-icon" :style="{ backgroundColor: module.color }">
              {{ module.name.slice(0, 4) }}
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<style scoped>
.fun-grid .arco-col {
  height: 90px;
  cursor: pointer;
  color: var(--color-text-1);
}

.fun-grid .arco-col > div {
  height: 100%;
}

.title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 16px;
}

.text-span {
  align-items: center;
  justify-content: center;
}

.text-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  /*margin-bottom: 2px;*/
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.text-icon:hover {
  transform: scale(0.9);
}
</style>
