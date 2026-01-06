import { ipcMain, app } from 'electron'
import { getLocalIPs } from '../utils/common'
import { db } from '../sever/src/database'
import { disconnectSockets } from '../sever/main'
import Update from '../utils/Update'
import { electronApp, is } from '@electron-toolkit/utils'

ipcMain.on('ping', () => console.log('pong'))
ipcMain.on('window-minimize', () => global.mainWindow.minimize())
ipcMain.handle('window-maximize', () => {
  if (global.mainWindow.isMaximized()) {
    global.mainWindow.restore() // 或 unmaximize()，恢复窗口
  } else {
    global.mainWindow.maximize() // 最大化
  }
  return global.mainWindow.isMaximized()
})

ipcMain.on('window-close', () => global.mainWindow.close())
ipcMain.on('update-settings', (_, { settings }) => {
  db.app.put('app:settings', settings).then(() => {
    if (
      global.controlServerPort !== settings.port ||
      global.setting.hostname !== settings.hostname
    ) {
      app.relaunch()
      app.exit(0)
    }
    if (global.setting.token !== settings.token) {
      disconnectSockets()
    }
    if (global.setting.autoStart !== settings.autoStart && !is.dev) {
      electronApp.setAutoLaunch(global.setting.autoStart)
    }

    global.setting = settings
    console.log(global.setting)
  })
})
ipcMain.handle('get-settings', async () => {
  return db.getSettings()
})

ipcMain.handle('get-control-server-port', (): number => {
  return global.controlServerPort
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-local-ips', (): string[] => {
  return getLocalIPs()
})
const appUpdater = new Update()
ipcMain.handle('checkForUpdate', () => appUpdater.checkForUpdates())
ipcMain.handle('quitAndInstall', () => appUpdater.quitAndInstall())
ipcMain.handle('cancelDownload', () => appUpdater.cancelDownload())

ipcMain.handle('setAutoUpdate', (_, isActive: boolean) => {
  appUpdater.setAutoUpdate(isActive)
  // configManager.setAutoUpdate(isActive)
})
