/// <reference types="vite/client" />
import { ElectronAPI } from '@electron-toolkit/preload'
import { platform } from '@electron-toolkit/utils'

type ThemeType = 'light' | 'dark'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

type Platform = {
  isWindows: boolean
  isMacOS: boolean
  isLinux: boolean
  isDev: boolean
}

type Setting = {
  token: string
  port: number
  hostname: string
  quality: number
  autoStart: boolean
  ffmpegPath: string
}

type AppSettings = {
  settings: Setting
  platform: Platform
}

type UserMessage = {
  isSelf: boolean
  content: string
  time: string
  form?: string
  to?: string
  group?: string
  msgType?: 'txt' | 'file' | 'image'
  fileName?: string
  fileId?: string
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
  mean: number

  /**
   * 识别出的文本内容
   */
  text: string
}

type OcrResult = DetectedBox[]
