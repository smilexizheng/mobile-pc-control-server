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
</script>

<template>
  <TitleBar />
  <img alt="logo" class="logo" src="./assets/logo.svg" />
  <!--  <div class="creator">a server to control your computer</div>-->
  <div class="text">
    Control Server Electron
    <span class="vue">CSE</span>
  </div>
  <p class="tip">Connect to the local area network and use a mobile web interface to</p>
  <p class="tip">control the computer mouse, keyboard, and desktop</p>
  <div class="actions">
    <div v-for="ip in ips" :key="ip" class="action">
      <a :href="`http://${ip}:${serverPort}`" target="_blank" rel="noreferrer"
        >访问地址: http://{{ ip }}:{{ serverPort }}</a
      >
    </div>
    <!--    <div class="action">-->
    <!--      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>-->
    <!--    </div>-->
  </div>
  <Versions />
</template>
