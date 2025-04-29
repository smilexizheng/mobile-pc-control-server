import { ipcMain } from 'electron'
import OCRService from '../asr-tts-ocr/ocr'
const ocrService = new OCRService({ lang: 'zhCN' })

ipcMain.on('ocr-recognition', (_, imgPath) => {
  ocrService.ocr(
    imgPath || 'D:\\IdeaProjects\\win-control-serve-electron\\resources\\ocr\\test.png'
  )
})
