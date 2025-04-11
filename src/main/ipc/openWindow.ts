import {ipcMain, BrowserWindow} from 'electron'
import upath from "upath";
import {getAppIcon} from "../utils/common";
import {is} from "@electron-toolkit/utils";

ipcMain.on('openWindow', (event, {id, url, title}) => {
  console.log(`openRemoteWindow ${id} ${url}`);

  if (global.childWindow[id]) {
    global.childWindow[id].show();
    return
  }
  fetch(`${url}/getInfo`)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      event.reply('openWindow-resp', true)
      createWindow(id, url, title)
    })
    .catch(err => {
      console.error(err)
      event.reply('openWindow-resp', false)
    });


})


const createWindow = (id: string, url: string, title: string) => {

  const childWindow = new BrowserWindow({
    title: id,
    width: 430,
    height: 830,
    minWidth: 430,
    minHeight: 830,
    // maxWidth: 430,
    // maxHeight: 830,
    show: false,
    icon: getAppIcon(),
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      preload: upath.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  childWindow.setMenu(null)
  childWindow.setAlwaysOnTop(true, "status");
  childWindow.on('ready-to-show', () => {
    childWindow.setTitle(title || "我的控制");
    childWindow?.show()
  })

  childWindow.once('closed', () => {
    global.childWindow[id] = undefined
  })
  childWindow.once('unresponsive', () => {
    console.log('childWindow unresponsive')
  })

  childWindow.once('closed', () => {
    global.childWindow[id] = undefined
  })

  childWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    console.error("无法加载窗口", url, errorCode, errorDescription, validatedURL)
    childWindow.close()

  })


  if (is.dev && id === "self") {
    childWindow.loadURL("http://localhost:3002/")
  } else {
    console.log("openWindow", url)
    childWindow.loadURL(url)
  }
  global.childWindow[id] = childWindow

}
