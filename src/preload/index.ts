import { contextBridge, ipcRenderer, clipboard, nativeImage } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getControlServerPort: (): Promise<number> => ipcRenderer.invoke('get-control-server-port'),
  getLocalIPs: (): Promise<string[]> => ipcRenderer.invoke('get-local-ips'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  ocrImg: (img): void => ipcRenderer.send('ocr-recognition', img),
  copyText: (str: string): boolean => {
    if (str) {
      clipboard.writeText(str)
      return true
    }
    return false
  },
  copyImage: async (buffer: Buffer | Blob): boolean => {
    if (buffer) {
      if (buffer instanceof Blob) {
        const arrayBuffer = await buffer.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      }
      clipboard.writeImage(nativeImage.createFromBuffer(buffer))
      return true
    }
    return false
  },
  writeClipboard: (data: Electron.Data): void => {
    clipboard.write(data)
  },
  readText: (): string => clipboard.readText(),
  readImage: (): Buffer => clipboard.readImage().toPNG()
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
