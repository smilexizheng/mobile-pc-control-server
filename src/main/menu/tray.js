import {app, Menu, Tray} from 'electron'
import {getAppIcon} from "../utils/common";

let tray = null;
const  InitTray = (MainWindow) => {
  tray = new Tray(getAppIcon())
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开面板',
      click: () => {
        MainWindow.isMinimized()? MainWindow.show() : MainWindow.maximize();MainWindow.focus()
      }
    },
    // { label: '选项1', type: 'separator' },
    // { label: '预设操作', type: 'submenu' ,submenu:[ { label: '测试1', type: 'radio', checked: true },
    //     { label: '测试2', type: 'radio', checked: false },]},
    { label: '退出', click: () => { app.quit() } }
  ])
  tray.setToolTip('Control Service')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    MainWindow.show()
  })
  // 监听鼠标右键信息
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
}

export {InitTray}

