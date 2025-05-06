import { BrowserWindow, dialog, ipcMain } from 'electron'
import upath from 'upath'
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
