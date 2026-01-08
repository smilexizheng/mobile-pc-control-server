import { ipcMain, BrowserWindow } from 'electron'
import upath from 'upath'
import { getAppIcon } from '../utils/common'
import { is } from '@electron-toolkit/utils'

ipcMain.on('openWindow', (event, { id, url, title, option }) => {
  createWindow(event, id, url, title, option)
})

ipcMain.on('openRemoteWindow', (event, { id, url, title, option }) => {
  console.log(`openRemoteWindow ${id} ${url}`)
  console.error(`openRemoteWindow ${id} ${url}`)

  fetch(`${url}/getInfo`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      if (is.dev && id === 'self') {
        url = 'http://localhost:3002/'
      }
      createWindow(event, id, url, title, option)
    })
    .catch((err) => {
      console.error(err)
      event.reply('openWindow-resp', false)
    })
})

const createWindow = (
  event: Electron.IpcMainEvent,
  id: string,
  url: string,
  title: string,
  option?: Electron.BaseWindowConstructorOptions
): void => {
  if (global.childWindow[id]) {
    global.childWindow[id].show()
    event.reply('openWindow-resp', true)
    return
  }
  const childWindow = new BrowserWindow({
    width: 430,
    height: 830,
    minWidth: 200,
    minHeight: 300,
    // maxWidth: 430,
    // maxHeight: 830,
    ...option,
    show: false,
    icon: getAppIcon(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: upath.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  childWindow.setMenu(null)
  // 窗口始终 在最上层级
  // childWindow.setAlwaysOnTop(true, 'status')
  childWindow.on('ready-to-show', () => {
    childWindow.setTitle(title)
    childWindow?.show()
  })

  childWindow.once('closed', () => {
    global.childWindow[id] = undefined
  })
  childWindow.once('unresponsive', () => {
    console.log('childWindow unresponsive')
  })

  childWindow.once('closed', () => {
    delete global.childWindow[id]
  })

  childWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    console.error('无法加载窗口', url, errorCode, errorDescription, validatedURL)
    event.reply('openWindow-resp', false)
    childWindow.close()
  })
  console.log('openWindow', url)
  childWindow.loadURL(url).then(() => {
    event.reply('openWindow-resp', true)
  })

  global.childWindow[id] = childWindow
}
