import { BrowserWindow, dialog, shell, ipcMain } from 'electron'
import upath from 'upath'
import * as fs from 'fs'

ipcMain.handle('addAllowDownFile', async (_, { filePath, fileName }) => {
  const fileId = crypto.randomUUID().toString()
  global.allowDownFiles[fileId] = {
    filePath,
    fileName
  }
  return fileId
})
ipcMain.on('showItemInFolder', async (_, fileId) => {
  shell.showItemInFolder(global.allowDownFiles[fileId].filePath)
})

ipcMain.on('openExternal', async (_, url) => {
  shell.openExternal(url).then()
})
ipcMain.on('shellOpen', async (_, fileId) => {
  shell.openPath(global.allowDownFiles[fileId].filePath)
})
ipcMain.handle('chooseFolder', async (event) => {
  // 获取当前窗口作为父窗口
  const parentWindow = BrowserWindow.fromWebContents(event.sender)!

  const result = await dialog.showOpenDialog(parentWindow, {
    properties: ['openDirectory']
  })

  if (!result.canceled) {
    const folderPath = upath.normalize(result.filePaths[0])
    return {
      folderPath
    }
  }

  return null
})

ipcMain.handle(
  'chooseFile',
  async (event, { name, extensions }: { name: string; extensions: string[] }) => {
    // 获取当前窗口作为父窗口
    const parentWindow = BrowserWindow.fromWebContents(event.sender)!

    const result = await dialog.showOpenDialog(parentWindow, {
      properties: ['openFile'],
      filters: [
        {
          name,
          extensions
        }
      ]
    })

    if (!result.canceled) {
      const file = upath.normalize(result.filePaths[0])
      return {
        file
      }
    }

    return null
  }
)

ipcMain.handle('saveFile', async (_, { title, defaultPath, filters, fileData }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(global.mainWindow, {
    title: title || '另存为',
    defaultPath: defaultPath,
    filters: [filters]
  })

  if (canceled) {
    return false
  } else {
    try {
      fs.writeFileSync(filePath, fileData)
      shell.showItemInFolder(filePath)
      return true
    } catch (error) {
      console.error('保存文件失败:', error)
      return false
    }
  }
})
