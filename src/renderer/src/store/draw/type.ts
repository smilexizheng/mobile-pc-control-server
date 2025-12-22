import Konva from 'konva'

export type WH = { width: number; height: number }
export type ShapeType = 'rect' | 'circle' | 'arrow'

export type DrawMode = {
  shape: 'rect' | 'circle' | 'arrow'
  label: string
  shapeParam?: string | object
}

/**
 * 涂鸦画板其他 图像实现接口
 */
export interface IChildDrawStore {
  startDrawing(e: Konva.KonvaPointerEvent): void
  updateDrawing(e: Konva.KonvaPointerEvent): void
  endDrawing(e: Konva.KonvaPointerEvent): void
  resetDrawing(): void
  remove(i: number): void
  removeAll(): void
  // 使同个store实现不同的绘制特性， 例如 箭头  直线箭头  曲线箭头，矩形  正方形  长方形
  setShapeParams(type: string | object): void
}

// 矩形框参数
export interface RectangleConfig extends Konva.RectConfig {
  // x: number
  // y: number
  // width: number
  // height: number
}

export interface CircleConfig extends Konva.CircleConfig {
  // x: number
  // y: number
  // radius: number
}
export interface ArrowConfig extends Konva.ArrowConfig {}
