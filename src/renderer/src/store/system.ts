import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const ipcRenderer = window.electron.ipcRenderer

  const showItemInFolder = (fileId): void => {
    ipcRenderer.send('showItemInFolder', fileId)
  }

  const shellOpen = (fileId): void => {
    ipcRenderer.send('shellOpen', fileId)
  }

  /**
   * 选择文件
   * @param name 标题名曾
   * @param extensions 文件后置
   */
  const chooseFile = async (name: string, extensions: string[]): Promise<string | null> => {
    const result = await ipcRenderer.invoke('chooseFile', {
      name,
      extensions
    })
    if (result) {
      return result.file
    }
    return null
  }

  /**
   * 选择文件夹
   */
  const chooseFolder = async (): Promise<string | null> => {
    const result = await ipcRenderer.invoke('chooseFolder')
    if (result) {
      return result.folderPath as string
    }
    return null
  }

  return { chooseFile, chooseFolder, showItemInFolder, shellOpen }
})
