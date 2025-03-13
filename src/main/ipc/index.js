import {ipcMain,app} from "electron";
import {getLocalIPs} from "../utils/common";

ipcMain.on('ping', () => console.log('pong'))

ipcMain.handle('get-control-server-port', () => {
  return global.controlServerPort
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-local-ips', () => {
  return getLocalIPs()
})
