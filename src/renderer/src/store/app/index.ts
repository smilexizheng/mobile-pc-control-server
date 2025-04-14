import {defineStore} from 'pinia';
import {computed, ref} from "vue";
import {Setting, ThemeType} from "../../env";
import {useStorage} from "@vueuse/core";

export const useAppStore = defineStore('app', () => {
  const settings = ref<Setting>({token: "ssss", port: 3000})
  const theme = useStorage<ThemeType>('arco-theme', 'light')


  const initSetting = async () => {
    const value = await window.electron.ipcRenderer.invoke('get-settings')
    console.info('init setting', value)
    settings.value = value
  }

  const updateSettings = (value: Setting) => {
    window.electron.ipcRenderer.send('update-settings', {
      settings: {...value}
    })
  }


  /**
   * 主题类型
   */

  /**
   * 切换应用主题
   * @param theme 主题类型 ('light' 或 'dark')，如果不传则自动切换当前主题
   */
  const toggleTheme = (t?: ThemeType): void => {
    let newTheme: ThemeType = t ? t : theme.value === 'dark' ? 'light' : 'dark';
    theme.value = newTheme;
    document.body.setAttribute('arco-theme', newTheme);
  }

  /**
   * 初始化主题（从本地存储中读取用户偏好）
   */
  const initTheme = (): void => {
    toggleTheme(theme.value);
  }

  const isDark = computed(() => theme.value === 'dark');


  return {settings, isDark, initSetting, updateSettings, toggleTheme, initTheme}
})
