import path from 'path'
import { ChildProcess, spawn } from 'child_process'

interface IOCRConfig {
  lang?: 'zhCN' | 'zhTW' | 'ko' | 'ja' | 'en' // Add other supported languages as needed
}
type ImageSourceType = 'base64' | 'path' | 'base64-raw' | 'invalid' | 'unknown'

class OCRService {
  private ocrEngine?: ChildProcess
  private ocrEnginePath: string = ''
  private config: IOCRConfig

  constructor(config: IOCRConfig = {}) {
    this.config = config
    this.initializeEngine()
  }

  private getEnginePath(): string {
    const enginePath = path.join(__dirname, '../../resources/ocr')
    return enginePath.replace('app.asar', 'app.asar.unpacked')
  }

  private getModelArgs(): string[] {
    const args = [`--models=${path.join(this.ocrEnginePath, './models')}`]

    // Language-specific configurations
    const langConfigs = {
      zhCN: {
        det: 'ch_PP-OCRv4_det_infer.onnx',
        cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
        rec: 'rec_ch_PP-OCRv4_infer.onnx',
        keys: 'dict_chinese.txt'
      }
      // zhTW: {
      //   det: 'ch_PP-OCRv3_det_infer.onnx',
      //   cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
      //   rec: 'rec_chinese_cht_PP-OCRv3_infer.onnx',
      //   keys: 'dict_chinese_cht.txt'
      // },
      // en: {
      //   det: 'ch_PP-OCRv3_det_infer.onnx',
      //   cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
      //   rec: 'rec_en_PP-OCRv3_infer.onnx',
      //   keys: 'dict_chinese.txt'
      // }
      // ko: {
      //   det: 'ch_PP-OCRv3_det_infer.onnx',
      //   cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
      //   rec: 'rec_korean_PP-OCRv3_infer.onnx',
      //   keys: 'dict_korean.txt'
      // },
      // ja: {
      //   det: 'ch_PP-OCRv3_det_infer.onnx',
      //   cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
      //   rec: 'rec_japan_PP-OCRv3_infer.onnx',
      //   keys: 'dict_japan.txt'
      // }
      // Add other languages as needed
    }

    if (this.config.lang && langConfigs[this.config.lang]) {
      const config = langConfigs[this.config.lang]
      args.push(`--det=${config.det}`)
      args.push(`--cls=${config.cls}`)
      args.push(`--rec=${config.rec}`)
      args.push(`--keys=${config.keys}`)
    }

    return args
  }

  private initializeEngine(): void {
    console.log(`OCR[${this.config.lang}] 引擎启动`)
    this.ocrEnginePath = this.getEnginePath()
    const args = this.getModelArgs()
    const executablePath = path.join(this.ocrEnginePath, './RapidOCR-json.exe')
    this.ocrEngine = spawn(executablePath, args)
    this.ocrEngine.stdout?.on('data', this.handleStdout.bind(this))
    this.ocrEngine.stderr?.on('data', this.handleStderr.bind(this))
    this.ocrEngine.on('close', this.handleClose.bind(this))
    this.ocrEngine.on('error', this.handleError.bind(this))
  }

  private handleStdout(data: Buffer): void {
    const result = data.toString().trim()
    try {
      // JSON.parse(result)
      global.mainWindow.webContents.send('ocr-result', result)
    } catch (e) {
      console.error('Failed to parse OCR output:', e)
    }
  }

  private handleStderr(data: Buffer): void {
    console.error(`OCR引擎错误: ${data.toString().trim()}`)
  }

  private handleClose(code: number): void {
    console.log(`OCR引擎进程退出, 退出码 ${code}`)
  }

  private handleError(error: Error): void {
    console.error('OCR引擎进程错误:', error)
  }

  public shutdown(): void {
    if (this.ocrEngine) {
      this.ocrEngine.kill()
    }
  }

  public ocr(image): void {
    const imageType = this.getImageSourceType(image)
    if (this.ocrEngine && imageType !== 'invalid') {
      if (imageType === 'base64') {
        this.ocrEngine.stdin?.write(JSON.stringify({ image_base64: image }) + '\n')
      } else if (imageType === 'path') {
        this.ocrEngine.stdin?.write(JSON.stringify({ image_path: image }) + '\n')
      }
    } else {
      console.log('OCR 引擎没有初始化')
    }
  }

  public getImageSourceType(str): ImageSourceType {
    if (!str) return 'invalid'

    // 快速检查Base64
    if (str.startsWith('data:image/')) {
      return 'base64'
    }

    // 快速检查常见图片扩展名
    if (/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(str)) {
      return 'path'
    }

    // 检查是否是URL（无扩展名情况）
    if (/^(https?:)?\/\//.test(str)) {
      return 'path'
    }

    // 可能是无前缀的Base64 暂不处理
    // if (/^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0) {
    //   try {
    //     atob(str)
    //     return 'base64-raw'
    //   } catch (e) {
    //     console.error(e)
    //   }
    // }

    return 'invalid'
  }
}

export default OCRService
