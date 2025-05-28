import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { Options } from 'qr-code-styling'
import logo from '@renderer/assets/logo.svg'
export const useRemoteStore = defineStore('remote', () => {
  const deviceCode = ref<string>('127.0.0.1')
  const devicePort = ref<number>(3000)
  const isLoading = ref<boolean>(false)

  window.electron.ipcRenderer.on('openWindow-resp', (_, success: boolean) => {
    isLoading.value = false
    if (success) {
      Message.success('正在连接中...')
    } else {
      Message.error('无法连接对方设备')
    }
  })

  const openRemoteWindow = (data): void => {
    isLoading.value = true
    window.electron.ipcRenderer.send('openRemoteWindow', data)
  }
  const openCustomWindow = (data): void => {
    window.electron.ipcRenderer.send('openCustomWindow', data)
  }

  // 配置二维码参数
  const qrOptions: Partial<Options> = {
    type: 'svg',
    shape: 'square',
    width: 200,
    height: 200,
    data: 'loading...',
    image: logo,
    margin: 10,
    qrOptions: { mode: 'Byte', errorCorrectionLevel: 'Q' },
    imageOptions: { saveAsBlob: true, hideBackgroundDots: true, imageSize: 0.5, margin: 5 },
    dotsOptions: { type: 'square', color: '#f5aa29', roundSize: true },
    backgroundOptions: { round: 0, color: 'rgba(255,255,255,0.9)' },
    cornersSquareOptions: { type: 'dot', color: '#f08928' },
    cornersDotOptions: { type: 'dot', color: '#f75802' }
  }

  return { deviceCode, devicePort, isLoading, openRemoteWindow, openCustomWindow, qrOptions }
})
