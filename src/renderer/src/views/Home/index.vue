<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { Notification } from '@arco-design/web-vue'
import { useAppStore } from '@renderer/store/app'
import { copyText } from '@renderer/utils/util'
import { motion } from 'motion-v'
import { useSocketStore } from '@renderer/store/socket'
import { Copy, TriangleAlert } from 'lucide-vue-next'
import MyFun from '@renderer/views/Home/MyFun.vue'
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
      <div v-if="!socketStore.isConnected">
        <TriangleAlert :size="16" color="#ff0000" />功能受限,请检查IP网络配置/尝试重启
      </div>
      <div class="text">
        <span class="vue">扫一扫/复制链接 远控PC、设备互联、消息文件共享、快捷指令</span>
      </div>

      <div class="tip" @click="copyText(appStore.mobileHtml)">
        {{ appStore.mobileHtml }}
        <span style="font-size: 14px"> <Copy :size="12" />复制</span>
      </div>
      <a-tooltip content="复制二维码，分享给朋友">
        <motion.div :whileHover="{ scale: 1.1 }">
          <div ref="qrContainer" class="qr-container" @click="copyQrImg()"></div
        ></motion.div>
      </a-tooltip>

      <a-input-group>
        <a-typography-text> 本地/远控设备： </a-typography-text>
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
  <MyFun />
</template>

<style scoped>
.main-view {
  display: flex;
  align-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 1rem 0;
}

.qr-container {
  will-change: filter;
  transition: filter 300ms;
}
.qr-container:hover {
  filter: drop-shadow(0 0 1.2em rgba(246, 72, 243, 0.3));
}

.text {
  font-size: 20px;
  color: var(--color-text-1);
  font-weight: bold;
  line-height: 32px;
  text-align: center;
  margin: 0 10px;
}

.tip {
  font-size: 16px;
  line-height: 22px;
  color: var(--color-text-2);
  text-align: center;
}

.vue {
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
</style>
