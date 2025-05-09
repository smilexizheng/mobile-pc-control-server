import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'

export const useRemoteStore = defineStore('remote', () => {
  const deviceCode = ref<string>('127.0.0.1')
  const devicePort = ref<number>(3000)
  const isLoading = ref<boolean>(false)

  const serverPort = ref<number>()
  const ips = ref<string[]>()

  onMounted(async () => {
    serverPort.value = await window.api.getControlServerPort()
    ips.value = await window.api.getLocalIPs()
    window.electron.ipcRenderer.on('openWindow-resp', (_, success: boolean) => {
      isLoading.value = false
      if (success) {
        Message.success('正在连接中...')
      } else {
        Message.error('无法连接对方设备')
      }
    })
  })

  const openRemoteWindow = (data): void => {
    isLoading.value = true
    window.electron.ipcRenderer.send('openRemoteWindow', data)
  }

  return { deviceCode, devicePort, isLoading, ips, serverPort, openRemoteWindow }
})
