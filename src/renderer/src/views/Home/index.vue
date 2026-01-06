<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { Message, Notification } from '@arco-design/web-vue'
import { useAppStore } from '@renderer/store/app'
import { motion } from 'motion-v'
const appStore = useAppStore()
const qrContainer = ref<HTMLDivElement>()
const qrCode = ref(new QRCodeStyling(appStore.qrOptions))
onMounted(async () => {
  qrCode.value.append(qrContainer.value as HTMLDivElement)
  await appStore.initSetting()
  if (appStore.ips && appStore.ips.length) {
    qrCode.value.update({ data: `http://${appStore.realHost}:${appStore.devicePort}` })
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
  <motion.div
    :initial="{ opacity: 0, scale: 0 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{
      duration: 0.4,
      scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 }
    }"
  >
    <div class="main-view">
      <div class="text">
        Control Server Electron
        <span class="vue">CSE</span>
      </div>
      <p class="tip">浏览器\微信\支付宝 扫一扫 远程控制、任务自动化、定时任务等操作</p>
      <a-tooltip content="点击将二维码复制到剪切板，分享给朋友">
        <motion.div :whileHover="{ scale: 1.1 }">
          <div ref="qrContainer" class="qr-container" @click="copyQrImg()"></div
        ></motion.div>
      </a-tooltip>

      <a-input-group>
        <a-typography-text> 本地查看/远程设备： </a-typography-text>
        <a-input
          v-model="appStore.deviceIp"
          :style="{ width: '150px' }"
          placeholder="请输入IP地址"
          allow-clear
        />
        <a-input-number
          v-model="appStore.devicePort"
          :style="{ width: '90px' }"
          placeholder="端口"
          allow-clear
        />
        <a-button
          type="primary"
          :loading="appStore.isLoading"
          @click="
            appStore.openRemoteWindow({
              id: `remote_${appStore.deviceIp}`,
              title: `远程设备_${appStore.deviceIp}`,
              url: `http://${appStore.deviceIp}:${appStore.devicePort}`
            })
          "
          >连接
        </a-button>
      </a-input-group>
    </div>
  </motion.div>
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
