import { contextBridge, ipcRenderer, clipboard } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { copyImage, toImage } from '../main/utils/img'

// Custom APIs for renderer
const api = {
  showItemInFolder: (fileId): void => {
    ipcRenderer.send('showItemInFolder', fileId)
  },

  shellOpen: (fileId): void => {
    ipcRenderer.send('shellOpen', fileId)
  },
  /**
   * 选择文件
   * @param name 标题名曾
   * @param extensions 文件后置
   */
  chooseFile: async (name: string, extensions: string[]): Promise<string | null> => {
    const result = await ipcRenderer.invoke('chooseFile', {
      name,
      extensions
    })
    if (result) {
      return result.file
    }
    return null
  },

  /**
   * 选择文件夹
   */
  chooseFolder: async (): Promise<string | null> => {
    const result = await ipcRenderer.invoke('chooseFolder')
    if (result) {
      return result.folderPath as string
    }
    return null
  },

  handleMinimize: () => ipcRenderer.send('window-minimize'),
  handleMaximize: () => ipcRenderer.invoke('window-maximize'),
  handleClose: () => ipcRenderer.send('window-close'),

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
  copyImage: async (buffer: Buffer | Blob | string | ArrayBuffer): Promise<boolean> => {
    // if (buffer) {
    //   if (buffer instanceof Blob) {
    //     const arrayBuffer = await buffer.arrayBuffer()
    //     buffer = Buffer.from(arrayBuffer)
    //   }
    //   clipboard.writeImage(nativeImage.createFromBuffer(buffer))
    //   return true
    // }
    // return false
    return await copyImage(buffer)
  },
  saveAsImg: async (fileName, buffer): Promise<boolean> => {
    return await ipcRenderer.invoke('saveFile', {
      defaultPath: fileName,
      filters: { name: '图片', extensions: ['png', 'jpg'] },
      fileData: await toImage(buffer)
    })
  },
  saveFile: async (defaultPath, fileData): Promise<boolean> => {
    return await ipcRenderer.invoke('saveFile', {
      defaultPath,
      fileData
    })
  },
  writeClipboard: (data: Electron.Data): void => {
    clipboard.write(data)
  },
  readText: (): string => clipboard.readText(),
  readImage: (): Buffer => clipboard.readImage().toPNG(),
  checkForUpdate: () => ipcRenderer.invoke('checkForUpdate'),
  quitAndInstall: () => ipcRenderer.invoke('quitAndInstall'),
  cancelDownload: () => ipcRenderer.invoke('cancelDownload')
}
export type WindowApi = typeof api

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
