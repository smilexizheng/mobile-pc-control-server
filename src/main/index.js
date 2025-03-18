import {app, BrowserWindow, nativeImage, shell} from 'electron'
import {electronApp, is, optimizer} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import upath, {join} from "upath";
import {InitWinControlServer} from "./sever/main";
import {getAppIcon} from "./utils/common";
import {InitTray} from "./menu/tray";
import './utils/log'

let mainWindow = null;

let willQuitApp = false

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    backgroundColor: 'rgb(32, 32, 32)',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#fcfcfc',
      symbolColor: '#e80ba3',
      height: 26
    },
    icon: getAppIcon(),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? {icon} : {}),
    // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // todo win11 bugs titleBarOverlay冲突  https://github.com/electron/electron/issues/42409  createWindow setTimeout 100ms  正常
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!willQuitApp) {
      mainWindow.hide()
      e.preventDefault()
    }
  })

  // mainWindow.setMenu(null)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {action: 'deny'}
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.win.control.electron')

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

  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
    })
  }

  createWindow()
  console.log("启动control-server")
  global.controlServerPort = await InitWinControlServer(3000)
  // IPC
  import("./ipc");
  // tray 系统托盘
  InitTray(mainWindow)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  willQuitApp = true
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
