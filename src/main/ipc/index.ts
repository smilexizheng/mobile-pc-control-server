import { ipcMain, app } from 'electron'
import { getLocalIPs } from '../utils/common'

ipcMain.on('ping', () => console.log('pong'))

ipcMain.on('window-minimize', () => global.mainWindow.minimize())
ipcMain.on('window-close', () => global.mainWindow.close())

ipcMain.handle('get-control-server-port', (): number => {
  return global.controlServerPort
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-local-ips', (): string[] => {
  return getLocalIPs()
})
