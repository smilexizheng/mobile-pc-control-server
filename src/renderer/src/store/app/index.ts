import { defineStore } from 'pinia'
import { computed, ref, useTemplateRef } from 'vue'
import { Setting, ThemeType } from '../../env'
import { useStorage, useResizeObserver } from '@vueuse/core'
export const useAppStore = defineStore('app', () => {
  const mainLayout = useTemplateRef<HTMLDivElement>('main_layout')
  const mainLayoutWH = ref({
    width: mainLayout.value?.offsetWidth,
    height: mainLayout.value?.offsetHeight
  })
  useResizeObserver(mainLayout, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    mainLayoutWH.value = { width, height }
  })

  const settings = ref<Setting>({ token: 'ssss', port: 3000 })
  const theme = useStorage<ThemeType>('arco-theme', 'light')

  const initSetting = async (): Promise<void> => {
    const value = await window.electron.ipcRenderer.invoke('get-settings')
    console.info('init setting', value)
    settings.value = value
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
    contentWH,
    mainLayoutWH,
    settings,
    isDark,
    initSetting,
    updateSettings,
    toggleTheme,
    initTheme
  }
})
