import Konva from 'konva'

export type WH = { width: number; height: number }
export type DrawMode = 'rect'

/**
 * 涂鸦画板其他 图像实现接口
 */
export interface IChildDrawStore {
  startDrawing(e: Konva.KonvaPointerEvent): void
  updateDrawing(e: Konva.KonvaPointerEvent): void
  endDrawing(e: Konva.KonvaPointerEvent): void
  resetDrawing(e: Konva.KonvaPointerEvent): void
  remove(i: number): void
  removeAll(): void
}

// 矩形框参数
export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}
