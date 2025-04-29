import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getControlServerPort: (): Promise<number> => ipcRenderer.invoke('get-control-server-port'),
  getLocalIPs: (): Promise<string[]> => ipcRenderer.invoke('get-local-ips'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  ocrImg: (img): void => ipcRenderer.send('ocr-recognition', img)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
