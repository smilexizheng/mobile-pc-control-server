import { ipcMain, app } from 'electron'
import { getLocalIPs } from '../utils/common'
import { db } from '../sever/src/database'
import { disconnectSockets, sendMessage } from '../sever/main'

ipcMain.on('ping', () => console.log('pong'))
ipcMain.on('pc-socket-message', (_, { id, message }: { id: string; message: string }): void => {
  sendMessage(id, message)
})
ipcMain.on('window-minimize', () => global.mainWindow.minimize())
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
    global.setting = settings
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
