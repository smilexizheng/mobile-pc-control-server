import {ipcMain, app} from 'electron'
import {getLocalIPs} from '../utils/common'
import {db} from "../sever/src/database";

ipcMain.on('ping', () => console.log('pong'))

ipcMain.on('window-minimize', () => global.mainWindow.minimize())
ipcMain.on('window-close', () => global.mainWindow.close())
ipcMain.on('update-settings', (_, {settings}) => {
  db.app.put('app:settings', settings).then()
  app.relaunch()
  app.exit(0)
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
