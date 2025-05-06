import { clipboard, ipcMain } from 'electron'
import OCRService from '../asr-tts-ocr/ocr'
import * as fs from 'fs'
import upath from 'upath'
const ocrService = new OCRService({ lang: 'zhCN' })

ipcMain.on('ocr-recognition', (_, imgPath) => {
  ocrService.ocr(imgPath)
})

ipcMain.handle('cor-clipboard-readImage', async () => {
  const nativeImage = clipboard.readImage()
  if (!nativeImage.isEmpty()) {
    const enginePath = upath.join(__dirname, '../../resources/ocr/ocrImage')
    const outputDir = enginePath.replace('app.asar', 'app.asar.unpacked')
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const savePath = upath.join(outputDir, Date.now() + '.png')
    fs.writeFileSync(savePath, nativeImage.toPNG())
    return savePath
  }
  return null
})
