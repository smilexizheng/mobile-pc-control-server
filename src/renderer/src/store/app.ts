import { defineStore } from 'pinia'
import { computed, ref, useTemplateRef } from 'vue'
import { Setting, ThemeType } from '../env'
import { useResizeObserver, useStorage } from '@vueuse/core'
import { useSocketStore } from '@renderer/store/socket'

export const useAppStore = defineStore('app', () => {
  // 主区域ref
  const mainLayout = useTemplateRef<HTMLDivElement>('mainLayout')
  // 主区域大小
  const mainLayoutWH = ref<{ width: number; height: number }>({
    width: mainLayout.value?.offsetWidth || 600,
    height: mainLayout.value?.offsetHeight || 500
  })
  useResizeObserver(mainLayout, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    mainLayoutWH.value = { width, height }
  })

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

    initSetting,
    updateSettings,
    toggleTheme,
    initTheme
  }
})
