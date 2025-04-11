<script setup lang="ts">
import Versions from '@renderer/components/Versions.vue'
import {onMounted, ref} from 'vue'
import TitleBar from '@renderer/components/TitleBar.vue'
import {Message} from "@arco-design/web-vue";

const deviceCode = ref<string>()
const devicePort = ref<number>(3000)
const isLoading = ref<boolean>(false)

const serverPort = ref<number>()
const ips = ref<string[]>()

onMounted(async () => {
  serverPort.value = await window.api.getControlServerPort()
  ips.value = await window.api.getLocalIPs()
  window.electron.ipcRenderer.on('openWindow-resp', (_, success) => {
    isLoading.value = false
    success? Message.success('正在连接中...') :
    Message.error('无法连接对方设备')
  })
})


const openWindow = (data) => {
  isLoading.value = true
  window.electron.ipcRenderer.send('openWindow', data)
}
</script>

<template>
  <TitleBar/>
  <img alt="logo" class="logo" src="@renderer/assets/logo.svg"/>
  <div class="text">
    Control Server Electron
    <span class="vue">CSE</span>
  </div>
  <p class="tip">在同一局域网内，您可以通过浏览器访问下列地址</p>
  <p class="tip">创建自动化、定时任务、远程控制鼠标、键盘、桌面</p>
  <a-space direction="vertical" fill>
    <div class="actions">
      <a-button v-for="ip in ips" :key="ip" class="action" @click="openWindow({
    id: 'self',
    url: `http://localhost:${serverPort}`
  })" type="primary">访问http://{{
          ip
        }}:{{ serverPort }}
      </a-button>
    </div>

    <a-typography-text>
      远程协助设备
    </a-typography-text>
    <a-input-group>
      <a-input v-model="deviceCode" :style="{width:'150px'}" placeholder="请输入IP地址" allow-clear/>
      <a-input-number v-model="devicePort" :style="{width:'90px'}"  placeholder="端口"
                      allow-clear/>
      <a-button type="primary"
                :loading="isLoading"
                @click="openWindow({
    id: `remote_${deviceCode}`,
    title: `远程设备_${deviceCode}`,
    url: `http://${deviceCode}:${devicePort}`
  })">连接
      </a-button>
    </a-input-group>
    <!--    <a-input :style="{width:'240px'}"  placeholder="请输入令牌" allow-clear />-->
  </a-space>
  <Versions/>
</template>
