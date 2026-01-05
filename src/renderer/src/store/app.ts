import { defineStore } from 'pinia'
import { computed, ref, h } from 'vue'
import { Setting, ThemeType } from '../env'
import { useStorage } from '@vueuse/core'
import { useSocketStore } from '@renderer/store/socket'
import { Message, Modal, Notification } from '@arco-design/web-vue'
import dayjs from 'dayjs'

export const useAppStore = defineStore('app', () => {
  const ipcRenderer = window.electron.ipcRenderer
  const isMaximize = ref(false)
  ipcRenderer.on('updateNotAvailable', () => {
    Notification.success({
      id: 'updateNotion',
      content: '当前为最新版本',
      duration: 2000
    })
  })
  ipcRenderer.on('updateError', () => {
    Notification.error({
      id: 'updateNotion',
      content: '检查更新失败，稍后重试...',
      duration: 2000
    })
  })
  ipcRenderer.on('updateAvailable', (_, info) => {
    Notification.success({
      id: 'updateNotion',
      title: `新版本 v${info.version}`,
      content: () =>
        h(
          'div',
          { style: { whiteSpace: 'pre-line' } },
          `${info.releaseNotes} \n发布时间： ${dayjs(info.releaseDate).format('YYYY-MM-DD HH:mm')}`
        ),
      closable: true,
      duration: 10000
    })
  })
  ipcRenderer.on('downloadProgress', (_, info) => {
    // 1. 文件大小换算
    // const totalMB = info.total / (1024 * 1024) // ≈ 157.7 MB
    // const transferredMB = info.transferred / (1024 * 1024) // ≈ 17.9 MB

    // 2. 剩余下载量
    // const remainingBytes = info.total - info.transferred // 146,602,321 字节
    // const remainingMB = remainingBytes / (1024 * 1024) // ≈ 139.8 MB

    // 3. 预计剩余时间
    // const remainingSeconds = remainingBytes / info.bytesPerSecond // ≈ 640 秒
    // const remainingMinutes = (remainingSeconds / 60).toFixed(2) // ≈ 10.7 分钟

    // 4. 当前下载速度
    // const speedKBps = info.bytesPerSecond / 1024 // ≈ 223.7 KB/s
    const speedMBps = info.bytesPerSecond / (1024 * 1024) // ≈ 0.218 MB/s

    // 5. 下载进度百分比（精确计算）
    const calculatedPercent = ((info.transferred / info.total) * 100).toFixed(2) // 11.35%
    Message.info({
      id: 'updateDownloadProgress',
      content: `下载更新 ${calculatedPercent}%   ${speedMBps.toFixed(2)}MB/s`,
      duration: 2000
    })
  })
  ipcRenderer.on('updateDownloaded', (_, info) => {
    Modal.success({
      title: '安装',
      content: `新版本 v${info.version}准备就绪，点击确认开始安装`,
      onOk: () => {
        window.api.quitAndInstall()
      }
    })
  })

  // 主区域大小
  const mainLayoutWH = ref<{ width: number; height: number }>({
    width: 0,
    height: 0
  })

  const setMainLayoutWH = (width, height) => {
    mainLayoutWH.value = { width, height }
  }

  // 系统设置参数
  const settingsVisible = ref(false)
  const settings = ref<Setting>()

  const serverPort = ref<number>()
  const ips = ref<string[]>([])

  // 关于显隐
  const aboutVisible = ref(false)
  // 主题
  const theme = useStorage<ThemeType>('arco-theme', 'light')

  const initSetting = async (): Promise<void> => {
    settings.value = await window.electron.ipcRenderer.invoke('get-settings')
    serverPort.value = await window.api.getControlServerPort()
    ips.value = await window.api.getLocalIPs()
    const socketStore = useSocketStore()
    socketStore.connect()
  }

  const updateSettings = (value: Setting): void => {
    settings.value = value
    window.electron.ipcRenderer.send('update-settings', {
      settings: { ...value }
    })
  }

  /**
   * 主题类型
   */

  /**
   * 切换应用主题
   * @param t 主题类型 ('light' 或 'dark')，如果不传则自动切换当前主题
   */
  const toggleTheme = (t?: ThemeType): void => {
    const newTheme: ThemeType = t ? t : theme.value === 'dark' ? 'light' : 'dark'
    theme.value = newTheme
    document.body.setAttribute('arco-theme', newTheme)
  }

  /**
   * 初始化主题（从本地存储中读取用户偏好）
   */
  const initTheme = (): void => {
    toggleTheme(theme.value)
  }

  const isDark = computed(() => theme.value === 'dark')
  const realUrl = computed(() => {
    return `http://${settings.value?.hostname !== '0.0.0.0' ? settings.value?.hostname : ips.value[0]}:${serverPort.value}`
  })

  const contentWH = computed(() => {
    return { width: mainLayoutWH.value.width, height: mainLayoutWH.value.height }
  })

  const handleMinimize = () => window.api.handleMinimize()
  const handleClose = () => window.api.handleClose()
  const handleMaximize = async () => {
    isMaximize.value = await window.api.handleMaximize()
  }

  return {
    mainLayoutWH,
    contentWH,
    settings,
    realUrl,
    serverPort,
    ips,
    settingsVisible,
    aboutVisible,
    isDark,
    isMaximize,
    setMainLayoutWH,
    handleMaximize,
    handleClose,
    handleMinimize,
    initSetting,
    updateSettings,
    toggleTheme,
    initTheme
  }
})
