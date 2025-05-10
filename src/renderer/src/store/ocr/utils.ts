import Konva from 'konva'
import { useOcrStore } from '@renderer/store/ocr/index'

/**
 * 获取指针在 图像中的绝对坐标位置
 * @param e
 */
const getPos = <T>(
  e: Konva.KonvaPointerEvent | Konva.KonvaEventObject<T>
): { x: number; y: number } => {
  const ocrStore = useOcrStore()
  const layer = e.target.getLayer()
  const pos = e.target.getStage()!.getPointerPosition()!
  const posX = pos.x ?? 0
  const posY = pos.y ?? 0
  const x = layer?.position().x ?? 0
  const y = layer?.position().y ?? 0
  const offsetX = layer?.offsetX() ?? 0
  const offsetY = layer?.offsetY() ?? 0

  return {
    x: (posX - x) / ocrStore.realScale + offsetX,
    y: (posY - y) / ocrStore.realScale + offsetY
  }
}

export { getPos }
