import { defineStore } from 'pinia'
import { computed, ref, useTemplateRef } from 'vue'
import { Setting, ThemeType, UserMessage } from '../env'
import { useResizeObserver, useStorage } from '@vueuse/core'

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
  // 在线的socket用户对象
  const onlineSocketUser = ref({})
  window.electron.ipcRenderer.on('online-socket-user', (_, data) => {
    onlineSocketUser.value = data
  })

  window.electron.ipcRenderer.on('web-socket-msg', (_, { id, message }) => {
    if (!userMessage.value[id]) {
      userMessage.value[id] = []
    }
    userMessage.value[id].push({
      isSelf: false,
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  })
  const onlineSocketIds = computed(() => {
    console.log(Object.keys(onlineSocketUser.value))
    return Object.keys(onlineSocketUser.value)
  })

  const userMessage = ref<Record<string, Array<UserMessage>>>({})
  const sendMessage = (socketId: string, message): void => {
    if (!userMessage.value[socketId]) {
      userMessage.value[socketId] = []
    }
    window.electron.ipcRenderer.send('pc-socket-message', {
      id: socketId,
      message
    })
    userMessage.value[socketId].push({
      isSelf: true,
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  // 系统设置参数
  const settingsVisible = ref(false)
  const settings = ref<Setting>()
  // 关于显隐
  const aboutVisible = ref(false)
  // 主题
  const theme = useStorage<ThemeType>('arco-theme', 'light')

  const initSetting = async (): Promise<void> => {
    settings.value = await window.electron.ipcRenderer.invoke('get-settings')
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

  const contentWH = computed(() => {
    return { width: mainLayoutWH.value.width, height: mainLayoutWH.value.height }
  })

  return {
    mainLayoutWH,
    contentWH,
    settings,
    settingsVisible,
    aboutVisible,
    isDark,
    onlineSocketUser,
    onlineSocketIds,
    userMessage,
    sendMessage,
    initSetting,
    updateSettings,
    toggleTheme,
    initTheme
  }
})
