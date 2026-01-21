import { defineStore } from 'pinia'
import { computed, h, onMounted, ref, watch } from 'vue'
import { Setting, ThemeType } from '../env'
import { useStorage } from '@vueuse/core'
import { Message, Modal, Notification } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import { Options } from 'qr-code-styling'
import logo from '@renderer/assets/logo.svg'

export const useAppStore = defineStore('app', () => {
  const deviceIp = ref<string>('127.0.0.1')
  const devicePort = ref<number>(3000)
  const isLoading = ref<boolean>(false)
  const isMaximize = ref(false)
  const isDev = ref(import.meta.env.DEV)
  const ipcRenderer = window.electron?.ipcRenderer
  if (ipcRenderer) {
    window.electron.ipcRenderer.on('openWindow-resp', (_, success: boolean) => {
      isLoading.value = false
      if (!success) Message.error('打开窗口失败')
    })

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
  }
  // 主区域大小
  const mainLayoutWH = ref<{ width: number; height: number }>({
    width: 0,
    height: 0
  })

  const setMainLayoutWH = (width, height) => {
    mainLayoutWH.value = { width, height }
  }

  // 系统设置参数
  const settings = ref<Setting>()

  const serverPort = ref<number>()
  const ips = ref<string[]>([])

  // 主题
  const theme = useStorage<ThemeType>('arco-theme', 'light')

  const initSetting = async (): Promise<void> => {
    settings.value = await window.electron.ipcRenderer.invoke('get-settings')
    serverPort.value = await window.api.getControlServerPort()
    ips.value = await window.api.getLocalIPs()

    devicePort.value = isDev.value ? Number.parseInt(location.port) : serverPort.value
    deviceIp.value = realHost.value || '127.0.0.1'
  }

  onMounted(() => {
    setTheme(theme.value)
    initSetting().then()
  })

  const updateSettings = (value: Setting): void => {
    window.electron.ipcRenderer
      .invoke('update-settings', {
        settings: { ...value }
      })
      .then((r) => {
        settings.value = value
        if (r.restart) {
          Modal.success({
            title: '设置成功',
            content: `此项修改需要重启生效！`,
            okText: '立即重启',
            onOk: () => {
              window.api.appRelaunch()
            }
          })
        } else {
          Notification.success({
            content: '配置已更新'
          })
        }
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
    theme.value = t ? t : theme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (v) => {
    document.body.setAttribute('arco-theme', v)
  }

  watch(theme, (v) => {
    setTheme(v)
  })

  const isDark = computed(() => theme.value === 'dark')
  const realHost = computed(() => {
    return settings.value?.hostname !== '0.0.0.0' ? settings.value?.hostname : ips.value[0]
  })

  const contentWH = computed(() => {
    return { width: mainLayoutWH.value.width, height: mainLayoutWH.value.height }
  })

  const mobileHtml = computed(() => {
    return `http://${realHost.value}:${isDev.value ? document.location.port : devicePort.value}/mobile.html#/`
  })

  const handleMinimize = () => window.api.handleMinimize()
  const handleClose = () => window.api.handleClose()
  const handleMaximize = async () => {
    isMaximize.value = await window.api.handleMaximize()
  }

  const openUrlWindow = (data): void => {
    isLoading.value = true
    window.electron.ipcRenderer.send('openUrlWindow', data)
  }
  const openAppWindow = (data): void => {
    window.electron.ipcRenderer.send('openAppWindow', data)
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
    backgroundOptions: { round: 0, color: 'none' },
    cornersSquareOptions: { type: 'dot', color: '#f08928' },
    cornersDotOptions: { type: 'dot', color: '#f75802' }
  }

  return {
    isDev,
    mobileHtml,
    mainLayoutWH,
    contentWH,
    settings,
    realHost,
    serverPort,
    ips,
    isDark,
    isMaximize,
    setMainLayoutWH,
    handleMaximize,
    handleClose,
    handleMinimize,
    initSetting,
    updateSettings,
    toggleTheme,
    deviceIp,
    devicePort,
    isLoading,
    openUrlWindow,
    openAppWindow,
    qrOptions
  }
})
