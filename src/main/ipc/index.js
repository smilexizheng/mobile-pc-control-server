import {ipcMain,app} from "electron";
import {getLocalIPs} from "../utils/common";

ipcMain.on('ping', () => console.log('pong'))

ipcMain.on('window-minimize', () => mainWindow.hide())
ipcMain.on('window-close', () => mainWindow.close())


ipcMain.handle('get-control-server-port', () => {
  return controlServerPort
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-local-ips', () => {
  return getLocalIPs()
})
