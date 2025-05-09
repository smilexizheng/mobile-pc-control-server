<script setup lang="ts">
import { useRemoteStore } from '@renderer/store/remote'
import { onMounted, ref } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { Message } from '@arco-design/web-vue'
const remoteStore = useRemoteStore()
const qrContainer = ref<HTMLDivElement>()
onMounted(async () => {
  const qrCode = new QRCodeStyling(remoteStore.qrOptions)
  qrCode.append(qrContainer.value as HTMLDivElement)
  remoteStore.serverPort = await window.api.getControlServerPort()
  remoteStore.ips = await window.api.getLocalIPs()

  console.log(remoteStore.ips)
  if (remoteStore.ips && remoteStore.ips.length) {
    qrCode.update({ data: `http://${remoteStore.ips![0]}:${remoteStore.devicePort}` })
  } else {
    Message.error('获取本机的网卡信息识别！')
  }
})
</script>

<template>
  <div class="main-view">
    <div class="text">
      Control Server Electron
      <span class="vue">CSE</span>
    </div>
    <p class="tip">在局域网内，手机扫描二维码</p>
    <p class="tip">即可PC远程控制、任务自动化、定时任务等操作</p>
    <div ref="qrContainer" class="qr-container"></div>
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
          remoteStore.openRemoteWindow({
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
}

.logo:hover {
  filter: drop-shadow(0 0 1.2em #6988e6aa);
}

.qr-container {
  will-change: filter;
  transition: filter 300ms;
}
.qr-container:hover {
  filter: drop-shadow(0 0 1.2em rgb(246, 72, 97, 0.3));
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
