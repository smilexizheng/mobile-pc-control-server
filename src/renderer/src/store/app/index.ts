import {defineStore} from 'pinia';
import {ref} from "vue";
import {Setting} from "../../env";

export const useAppStore = defineStore('app', () => {
  const settings = ref<Setting>({token:"ssss",port:3000})
  // window.electron.ipcRenderer.sendSync('get-settings')


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


  return {settings,initSetting,updateSettings}
})
