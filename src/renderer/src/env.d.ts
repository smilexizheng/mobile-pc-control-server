/// <reference types="vite/client" />
import { ElectronAPI } from '@electron-toolkit/preload'

type CustomAPI = {
  getControlServerPort: () => Promise<number>
  getLocalIPs: () => Promise<string[]>
  getAppVersion: () => Promise<string>
}

type ThemeType = 'light' | 'dark';


declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

type Setting = {
  token:string
  port:number
}
