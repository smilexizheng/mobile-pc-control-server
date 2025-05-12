<script setup lang="ts">
import { useRemoteStore } from '@renderer/store/remote'
import { onMounted, ref, watch } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { Message, Notification } from '@arco-design/web-vue'
import { useAppStore } from '@renderer/store/app'
const appStore = useAppStore()
const remoteStore = useRemoteStore()
const qrContainer = ref<HTMLDivElement>()
const qrCode = ref(new QRCodeStyling(remoteStore.qrOptions))
onMounted(async () => {
  qrCode.value.append(qrContainer.value as HTMLDivElement)
  await appStore.initSetting()
  if (appStore.ips && appStore.ips.length) {
    qrCode.value.update({ data: `http://${appStore.ips![0]}:${remoteStore.devicePort}` })
  } else {
    Message.error('获取本机的网卡信息识别！')
  }
})

const copyQrImg = async (): Promise<void> => {
  qrCode.value.update({ backgroundOptions: { round: 0, color: '#fff' } })
  const rawData = await qrCode.value.getRawData('png')
  window.api.copyImage(rawData as Blob)
  Notification.info({
    content: '二维码 已复制到剪切板'
  })
}

watch(
  () => appStore.isDark,
  (v) => {
    qrCode.value.update({
      backgroundOptions: { round: 0, color: v ? 'rgba(253,252,252,0.2)' : 'none' }
    })
  }
)
</script>

<template>
  <div class="main-view">
    <div class="text">
      Control Server Electron
      <span class="vue">CSE</span>
    </div>
    <p class="tip">在局域网内，扫描二维码，远程控制、任务自动化、定时任务等操作</p>
    <a-tooltip content="点击将二维码图片复制到剪切板，快速分享">
      <div ref="qrContainer" class="qr-container" @click="copyQrImg()"></div>
    </a-tooltip>

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

.qr-container {
  will-change: filter;
  transition: filter 300ms;
}
.qr-container:hover {
  filter: drop-shadow(0 0 1.2em rgba(246, 72, 243, 0.3));
}

.text {
  font-size: 22px;
  color: var(--color-text-1);
  font-weight: 700;
  line-height: 32px;
  text-align: center;
  margin: 0 10px;
}

.tip {
  font-size: 14px;
  line-height: 18px;
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
</style>
