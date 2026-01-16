<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { Message, Notification } from '@arco-design/web-vue'
import { useAppStore } from '@renderer/store/app'
import { copyText } from '@renderer/utils/util'
import { motion } from 'motion-v'
import { useSocketStore } from '@renderer/store/socket'
const appStore = useAppStore()
const qrContainer = ref<HTMLDivElement>()
const qrCode = ref(new QRCodeStyling(appStore.qrOptions))
const socketStore = useSocketStore()

onMounted(async () => {
  await appStore.initSetting()
  qrCode.value.update({ data: appStore.mobileHtml })
  qrCode.value.append(qrContainer.value as HTMLDivElement)
  socketStore.connect()
})

const copyQrImg = async (): Promise<void> => {
  const rawData = await qrCode.value.getRawData('png')
  window.api.copyImage(rawData as Blob)
  Notification.info({
    content: '二维码 已复制到剪切板'
  })
}
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
      <p class="tip" @click="copyText(appStore.mobileHtml)">
        浏览器\微信\支付宝 扫一扫体验手机远控吧 （复制链接分享）
      </p>
      <a-tooltip content="复制二维码，分享给朋友">
        <motion.div :whileHover="{ scale: 1.1 }">
          <div ref="qrContainer" class="qr-container" @click="copyQrImg()"></div
        ></motion.div>
      </a-tooltip>

      <a-input-group>
        <a-typography-text> 预览体验/远程设备： </a-typography-text>
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
            appStore.openUrlWindow({
              title: `本地助手`,
              url: `http://${appStore.deviceIp}:${appStore.devicePort}/mobile.html#/`
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
