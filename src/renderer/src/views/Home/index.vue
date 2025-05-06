<script setup lang="ts">
import { useRemoteStore } from '@renderer/store/remote'

const remoteStore = useRemoteStore()
</script>

<template>
  <div class="main-view">
    <img alt="logo" class="logo" src="@renderer/assets/logo.svg" />
    <div class="text">
      Control Server Electron
      <span class="vue">CSE</span>
    </div>
    <p class="tip">在同一局域网内，您可以通过浏览器访问下列地址</p>
    <p class="tip">任务自动化、定时任务、远程控制</p>
    <a-space wrap>
      <template #split>
        <a-divider direction="vertical" />
      </template>
      <a-button
        v-for="ip in remoteStore.ips"
        :key="ip"
        type="primary"
        class="action"
        @click="
          remoteStore.openWindow({
            id: 'self',
            url: `http://localhost:${remoteStore.serverPort}`
          })
        "
        >访问http://{{ ip }}:{{ remoteStore.serverPort }}
      </a-button>
    </a-space>
    <a-input-group>
      <a-typography-text> 远程设备： </a-typography-text>
      <a-input
        v-model="remoteStore.deviceCode"
        :style="{ width: '150px' }"
        placeholder="请输入IP地址"
        allow-clear
      />
      <a-input-number
        v-model="remoteStore.devicePort"
        :style="{ width: '90px' }"
        placeholder="端口"
        allow-clear
      />
      <a-button
        type="primary"
        :loading="remoteStore.isLoading"
        @click="
          remoteStore.openWindow({
            id: `remote_${remoteStore.deviceCode}`,
            title: `远程设备_${remoteStore.deviceCode}`,
            url: `http://${remoteStore.deviceCode}:${remoteStore.devicePort}`
          })
        "
        >连接
      </a-button>
    </a-input-group>
  </div>
</template>

<style scoped>
.main-view {
  display: flex;
  align-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.logo {
  margin-bottom: 20px;
  -webkit-user-drag: none;
  height: 128px;
  width: 128px;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 1.2em #6988e6aa);
}

.text {
  font-size: 28px;
  color: var(--color-text-1);
  font-weight: 700;
  line-height: 32px;
  text-align: center;
  margin: 0 10px;
}

.tip {
  font-size: 16px;
  line-height: 24px;
  color: var(--color-text-2);
  font-weight: 600;
}

.vue {
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.action {
  flex-shrink: 0;
  padding: 6px;
}
</style>
