import Konva from 'konva'

export type WH = { width: number; height: number }
export type DrawMode = 'rect'

export interface IChildDrawStore {
  startDrawing(e: Konva.KonvaPointerEvent): void
  updateDrawing(e: Konva.KonvaPointerEvent): void
  endDrawing(e: Konva.KonvaPointerEvent): void
  resetDrawing(e: Konva.KonvaPointerEvent): void
  remove(i: number): void
  removeAll(): void
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}
