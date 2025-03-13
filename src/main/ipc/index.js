import {ipcMain} from "electron";

ipcMain.on('ping', () => console.log('pong'))

ipcMain.handle('get-control-server-url', () => {
  return `http://localhost:${global.controlServerPort}`
})
