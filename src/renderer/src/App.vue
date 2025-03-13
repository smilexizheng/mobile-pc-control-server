<script setup>
import Versions from './components/Versions.vue'
import {onMounted, ref} from "vue";

const ipcHandle = () => window.electron.ipcRenderer.send('ping')

const serverUrl = ref('')

  onMounted(async ()=>{
    serverUrl.value = await window.api.getControlServerUrl()
    console.log(serverUrl.value)
  })

</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">a server to control your computer</div>
  <div class="text">
    Control Server Electron
    <span class="vue">CSE</span>
  </div>
  <p class="tip">Connect to the local area network and use a mobile web interface to</p>
  <p class="tip">control the computer mouse, keyboard, and desktop</p>
  <div class="actions">
    <div class="action">
      <a :href=serverUrl target="_blank" rel="noreferrer">网页端访问</a>
    </div>
<!--    <div class="action">-->
<!--      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>-->
<!--    </div>-->
  </div>
  <Versions />
</template>
