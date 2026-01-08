import { app, BrowserWindow, net, protocol, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { join } from 'upath'
import { InitWinControlServer } from './sever/main'
import { getAppIcon } from './utils/common'
import { InitTray } from './menu/tray'
import './utils/log'
import { initProtocol, handleArgv } from './utils/protocol'
import { pathToFileURL, URL } from 'url'
import { db } from './sever/src/database'
// import { InitAsrTts } from './asr-tts-ocr'

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    show: false,
    backgroundColor: 'rgb(32, 32, 32)',
    titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#fcfcfc',
    //   symbolColor: '#e80ba3',
    //   height: 26
    // },
    icon: getAppIcon(),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  console.log('启动control-server')
  global.setting = await db.getSettings()
  global.mainWindow = mainWindow
  global.controlServerPort = await InitWinControlServer(
    global.setting.port,
    global.setting.hostname
  )
  global.childWindow = {}
  // InitAsrTts()
  // IPC
  import('./ipc')
  // tray 系统托盘
  InitTray()
  // 注册协议
  initProtocol()
  // 开机自启
  if (!is.dev && global.setting.autoStart) {
    electronApp.setAutoLaunch(global.setting.autoStart)
  }
  // todo win11 bugs titleBarOverlay冲突  https://github.com/electron/electron/issues/42409  createWindow setTimeout 100ms  正常
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!app.willQuitApp) {
      mainWindow.hide()
      e.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then()
    // mainWindow.loadURL('app-cse://./index.html/#/draw')
  }
}
app.commandLine.appendSwitch('lang', 'zh-CN')
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
} else {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('PC-CSE')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('second-instance', (_, commandLine) => {
      if (global.mainWindow) {
        if (global.mainWindow.isMinimized()) global.mainWindow.restore()
        if (global.mainWindow.isClosable()) global.mainWindow.show()
        global.mainWindow.focus()
      }
      // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
      if (process.platform === 'win32') {
        handleArgv(commandLine)
      }
    })

    protocol.handle('app-cse', (request) => {
      let pathName = new URL(request.url).pathname
      pathName = decodeURI(pathName)
      return net.fetch(pathToFileURL(join(__dirname, '../renderer', pathName)).toString())
    })

    await createWindow()
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    app.willQuitApp = true
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
}
