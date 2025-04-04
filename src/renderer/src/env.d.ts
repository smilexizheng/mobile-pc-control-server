/// <reference types="vite/client" />
import { ElectronAPI } from '@electron-toolkit/preload'

type CustomAPI = {
  getControlServerPort: () => Promise<number>
  getLocalIPs: () => Promise<string[]>
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
