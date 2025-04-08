<script setup lang="ts">
import Versions from './components/Versions.vue'
import { onMounted, ref } from 'vue'
import TitleBar from './components/TitleBar.vue'

const serverPort = ref<number>()
const ips = ref<string[]>()

onMounted(async () => {
  serverPort.value = await window.api.getControlServerPort()
  ips.value = await window.api.getLocalIPs()
})

const openWindow = () => {
  window.electron.ipcRenderer.send('openWindow', {
    id: 1,
    url: `http://localhost:${serverPort.value}`
  })
}
</script>

<template>
  <TitleBar />
  <img alt="logo" class="logo" src="./assets/logo.svg" />
  <!--  <div class="creator">a server to control your computer</div>-->
  <div class="text">
    Control Server Electron
    <span class="vue">CSE</span>
  </div>
  <p class="tip">在同一局域网内，您可以通过浏览器访问下列地址</p>
  <p class="tip">创建自动化、定时任务、远程控制鼠标、键盘、桌面</p>
  <div class="actions">
    <div v-for="ip in ips" :key="ip" class="action" @click="openWindow">
      <span>访问地址: http://{{ ip }}:{{ serverPort }}</span>
    </div>
    <!--    <div class="action">-->
    <!--      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>-->
    <!--    </div>-->
  </div>
  <Versions />
</template>
