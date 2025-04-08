import {ipcMain,  BrowserWindow} from 'electron'
import upath from "upath";
import {getAppIcon} from "../utils/common";
import {is} from "@electron-toolkit/utils";

ipcMain.on('openWindow', (_, {id, url}) => {
  // console.log(args)
  // const id =args[0]
  // const url =args[1]
  console.log(`openRemoteWindow ${id} ${url}`);

  if (global.childWindow[id]) {
    global.childWindow[id].show();
    return
  }
  const childWindow = new BrowserWindow({
    title: id,
    width: 430,
    height: 830,
    minWidth: 430,
    minHeight: 830,
    maxWidth: 430,
    maxHeight: 830,
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

  childWindow.on('ready-to-show', () => {
    global.childWindow[id] = childWindow
    childWindow.setTitle("我的控制");
    childWindow?.show()
  })


  childWindow.once('closed', () => {
    global.childWindow[id] = undefined
  })
  childWindow.setAlwaysOnTop(true, "status");

  if(is.dev){
    childWindow.loadURL("http://localhost:3002/")
  }else {
    childWindow.loadURL(url)
  }


})
