import { ipcMain, BrowserWindow } from 'electron'
import upath, { join } from 'upath'
import { createHexDigest, objectToParam } from '../utils/common'
import { is, platform } from '@electron-toolkit/utils'
import { APP_WINDOW_SIZE } from '../config'
import icon from '../../../build/icon.png?asset'
/**
 * 应用样式的窗口
 * html 切换多页应用
 * hash  路由
 * title 标题
 * option 窗口参数 Electron.BaseWindowConstructorOptions
 * query 连接调整附带参数  route.query
 * titleBar 使用原生窗口
 */
ipcMain.on('openAppWindow', (event, { html, hash, title, option, query, titleBar }) => {
  const id = createHexDigest(title + hash)
  html = html ? html : 'index'
  hash = hash ? hash : ''
  if (global.childWindow[id]) {
    global.childWindow[id].show()
  } else {
    const window = createWindow(event, id, {
      ...APP_WINDOW_SIZE,
      ...option,
      ...(platform.isWindows ? { frame: !!titleBar } : {})
      // titleBarStyle: titleBar ? 'default' : 'hidden'
    })

    query = { id, title, ...query }

    const queryParams = objectToParam(query)

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window
        .loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${html}.html#/${hash}?${queryParams}`)
        .then(() => {})
    } else {
      window
        .loadFile(join(__dirname, `../renderer/${html}.html`), {
          hash: `${hash}?${queryParams}`
        })
        .then(() => {})
    }
  }
})

/**
 * 系统原生窗口
 */
ipcMain.on('openUrlWindow', (event, { url, title, option }) => {
  const id = createHexDigest(title + url)
  if (global.childWindow[id]) {
    global.childWindow[id].show()
  } else {
    const window = createWindow(event, id, option)
    window.setTitle(title)
    window.loadURL(url).then()
  }
})

const createWindow = (
  event: Electron.IpcMainEvent,
  id: string,
  option?: Electron.BaseWindowConstructorOptions
): BrowserWindow => {
  const childWindow = new BrowserWindow({
    width: 430,
    height: 830,
    minWidth: 200,
    minHeight: 300,
    // maxWidth: 430,
    // maxHeight: 830,
    ...option,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' || platform.isWindows ? { icon } : {}),
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: upath.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  childWindow.setMenu(null)
  // 窗口始终 在最上层级
  // childWindow.setAlwaysOnTop(true, 'status')

  childWindow.once('closed', () => {
    global.childWindow[id] = undefined
  })
  childWindow.once('unresponsive', () => {
    console.log('childWindow unresponsive')
  })

  childWindow.on('ready-to-show', () => {
    childWindow?.show()
  })

  childWindow.on('show', () => {
    event.reply('openWindow-resp', true)
  })

  childWindow.once('closed', () => {
    console.log('childWindow closed')
    delete global.childWindow[id]
  })

  childWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    console.error('无法加载窗口', errorCode, errorDescription, validatedURL)
    event.reply('openWindow-resp', false)
    childWindow.close()
  })

  global.childWindow[id] = childWindow

  return childWindow
}
