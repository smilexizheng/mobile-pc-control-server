import { clipboard, ipcMain, globalShortcut, nativeImage } from 'electron'
import OCRService from '../asr-tts-ocr/ocr'
import * as fs from 'fs'
import upath from 'upath'
import Screenshots from 'electron-screenshots'
import { platform } from '@electron-toolkit/utils'

const ocrService = new OCRService({ lang: 'zhCN' })

ipcMain.on('ocr-recognition', (_, imgPath) => {
  if (platform.isWindows) {
    ocrService.ocr(imgPath)
  } else {
    global.mainWindow.webContents.send('ocr-result', '{ "data":"此平台暂不支持OCR" }')
  }
})

ipcMain.on('ocr-screenshots', () => {
  isShortcut = false
  global.mainWindow.minimize()
  setTimeout(() => {
    screenshots.startCapture().then()
  }, 200)
})

ipcMain.handle('cor-clipboard-readImage', async () => {
  const nativeImage = clipboard.readImage()
  if (!nativeImage.isEmpty()) {
    return saveLocalPng(nativeImage.toPNG())
  }
  return null
})

// 实现截屏ocr
let isShortcut = false
const screenshots = new Screenshots({ singleWindow: true })
// 快捷键使用
globalShortcut.register('ctrl+shift+s', () => {
  isShortcut = true
  screenshots.startCapture()
})

// 点击确定按钮回调事件
screenshots.on('ok', (_, buffer, bounds) => {
  console.log('screenshots', bounds.bounds)
  global.mainWindow.show()
  clipboard.writeImage(nativeImage.createFromBuffer(buffer))
  if (!isShortcut) {
    const path = saveLocalPng(buffer)
    global.mainWindow.webContents.send('ocr-screenshots-success', path)
  }
})
// 点击取消按钮回调事件
screenshots.on('cancel', () => {
  console.log('screenshots', 'cancel')
  global.mainWindow.show()
})

// 点击保存按钮回调事件
// screenshots.on('save', (_, buffer, bounds) => {
//   console.log('capture', buffer, bounds)
// })
// // 保存后的回调事件
// screenshots.on('afterSave', (_, buffer, bounds, isSaved) => {
//   console.log('capture', buffer, bounds)
//   console.log('isSaved', isSaved) // 是否保存成功
// })
screenshots.on('windowCreated', () => {
  console.log('screenshots', 'windowCreated')
})
screenshots.on('windowClosed', () => {
  console.log('screenshots', 'windowClosed')
})
const saveLocalPng = (buffer) => {
  const enginePath = upath.join(__dirname, '../../resources/ocr/ocrImage')
  const outputDir = enginePath.replace('app.asar', 'app.asar.unpacked')
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const savePath = upath.join(outputDir, Date.now() + '.png')
  fs.writeFileSync(savePath, buffer)
  return savePath
}
