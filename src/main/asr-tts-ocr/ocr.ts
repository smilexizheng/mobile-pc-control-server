import path from 'path'
import { ChildProcess, spawn } from 'child_process'

interface IOCRConfig {
  lang?: 'zhCN' | 'zhTW' | 'ko' | 'ja' | 'en' // Add other supported languages as needed
}

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
      },
      zhTW: {
        det: 'ch_PP-OCRv3_det_infer.onnx',
        cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
        rec: 'rec_chinese_cht_PP-OCRv3_infer.onnx',
        keys: 'dict_chinese_cht.txt'
      },
      en: {
        det: 'ch_PP-OCRv3_det_infer.onnx',
        cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
        rec: 'rec_en_PP-OCRv3_infer.onnx',
        keys: 'dict_chinese.txt'
      },
      ko: {
        det: 'ch_PP-OCRv3_det_infer.onnx',
        cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
        rec: 'rec_korean_PP-OCRv3_infer.onnx',
        keys: 'dict_korean.txt'
      },
      ja: {
        det: 'ch_PP-OCRv3_det_infer.onnx',
        cls: 'ch_ppocr_mobile_v2.0_cls_infer.onnx',
        rec: 'rec_japan_PP-OCRv3_infer.onnx',
        keys: 'dict_japan.txt'
      }
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
    this.ocrEnginePath = this.getEnginePath()
    const args = this.getModelArgs()
    const executablePath = path.join(this.ocrEnginePath, './RapidOCR-json.exe')
    console.log(executablePath, args)
    this.ocrEngine = spawn(executablePath, args)
    this.ocrEngine.stdout?.on('data', this.handleStdout.bind(this))
    this.ocrEngine.stderr?.on('data', this.handleStderr.bind(this))
    this.ocrEngine.on('close', this.handleClose.bind(this))
    this.ocrEngine.on('error', this.handleError.bind(this))
  }

  private handleStdout(data: Buffer): void {
    const result = data.toString().trim()
    console.log(`OCR引擎输出: ${result}`)

    try {
      const parsed = JSON.parse(result)
      if (parsed.code === 100) {
        console.log('Parsed OCR result:', parsed)
      }
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

  public ocr(imagePath): void {
    if (this.ocrEngine) {
      this.ocrEngine.stdin?.write(JSON.stringify({ image_path: imagePath }) + '\n')
    } else {
      console.log('OCE 引擎没有初始化')
    }
  }
}

export default OCRService
