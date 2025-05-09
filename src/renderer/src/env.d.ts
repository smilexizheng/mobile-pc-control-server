/// <reference types="vite/client" />
import { ElectronAPI } from '@electron-toolkit/preload'

type CustomAPI = {
  getControlServerPort: () => Promise<number>
  getLocalIPs: () => Promise<string[]>
  getAppVersion: () => Promise<string>
  copyText: (str: string) => boolean
}

type ThemeType = 'light' | 'dark'

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

type Setting = {
  token: string
  port: number
  hostname: string
}

/**
 * ocr 识别的坐标位置
 */
interface OcrDetectedBox {
  /**
   * 文本框的四个顶点坐标，顺序为：
   * [左上, 右上, 右下, 左下]
   */
  box: [
    [number, number], // 左上点 (x,y)
    [number, number], // 右上点 (x,y)
    [number, number], // 右下点 (x,y)
    [number, number] // 左下点 (x,y)
  ]

  /**
   * 检测置信度分数，范围 0-1
   * @minimum 0
   * @maximum 1
   */
  score: number

  /**
   * 识别出的文本内容
   */
  text: string
}

type OcrResult = DetectedBox[]
