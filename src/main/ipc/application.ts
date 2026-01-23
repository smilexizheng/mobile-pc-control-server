import { ipcMain, app } from 'electron'
import { getLocalIPs } from '../utils/common'
import { db } from '../utils/database'
import { disconnectSockets } from '../sever/main'
import Update from '../utils/Update'
import { electronApp, is, platform } from '@electron-toolkit/utils'

ipcMain.on('ping', () => console.log('pong'))
ipcMain.on('window-minimize', (_, windowId) => {
  getWindow(windowId).minimize()
})
ipcMain.handle('window-maximize', (_, windowId) => {
  const window = getWindow(windowId)

  if (window.isMaximized()) {
    window.restore() // 或 unmaximize()，恢复窗口
  } else {
    window.maximize() // 最大化
  }
  return window.isMaximized()
})

ipcMain.on('window-close', (_, windowId) => {
  getWindow(windowId).close()
})

ipcMain.on('appRelaunch', () => {
  app.relaunch()
  app.exit(0)
})

function getWindow(windowId) {
  return windowId ? global.childWindow[windowId] : global.mainWindow
}

ipcMain.handle('update-settings', (_, { settings }) => {
  db.app.put('app:settings', settings)
  let restart = false
  // 改变端口和ip需要重启
  if (global.controlServerPort !== settings.port || global.setting.hostname !== settings.hostname) {
    restart = true
  }
  // 断开socket
  if (global.setting.token !== settings.token) {
    disconnectSockets()
  }
  //应用自启动
  if (global.setting.autoStart !== settings.autoStart && !is.dev) {
    electronApp.setAutoLaunch(settings.autoStart)
  }

  global.setting = settings
  console.log(global.setting)
  return { restart }
})
ipcMain.handle('get-settings', async () => {
  return { settings: { ...db.getSettings() }, platform: { ...platform, isDev: is.dev } }
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
