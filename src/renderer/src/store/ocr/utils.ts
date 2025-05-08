import Konva from 'konva'
import { useOcrStore } from '@renderer/store/ocr/index'

/**
 * 获取缩放的坐标位置
 * @param e
 */
const getPos = <T>(
  e: Konva.KonvaPointerEvent | Konva.KonvaEventObject<T>
): { x: number; y: number } => {
  const ocrStroe = useOcrStore()
  const layer = e.target.getLayer()
  const pos = e.target.getStage()!.getPointerPosition()!
  const posX = pos.x ?? 0
  const posY = pos.y ?? 0
  const x = layer?.position().x ?? 0
  const y = layer?.position().y ?? 0
  const offsetX = layer?.offsetX() ?? 0
  const offsetY = layer?.offsetY() ?? 0

  return {
    x: (posX - x) / ocrStroe.realScale + offsetX,
    y: (posY - y) / ocrStroe.realScale + offsetY
  }
}

export { getPos }
