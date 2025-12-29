import Konva from 'konva'
import { useDrawStore } from '@renderer/store/draw/index'

/**
 * 根据Draw ID 返回解析的数据
 * @param id
 */
const getDrawInfo = (id: string) => {
  if (id.indexOf('draw') > -1) {
    const ids = id.split('_')
    return { isDraw: true, id, type: ids[1], index: ids[2] }
  }

  return { isDraw: false, id }
}

const getChildrenById = (layer: Konva.Layer | null | undefined, ids: number[]) => {
  if (layer && ids) {
    const children = layer.getChildren()
    return children?.filter((child) => ids.includes(child._id))
  }
  return []
}

/**
 * 获取指针在 图像中的绝对坐标位置
 * @param e
 */
const getPos = <T>(
  e: Konva.KonvaPointerEvent | Konva.KonvaEventObject<T>
): { x: number; y: number } => {
  const drawStore = useDrawStore()
  const layer = e.target.getLayer()
  const pos = e.target.getStage()!.getPointerPosition()!
  const posX = pos.x ?? 0
  const posY = pos.y ?? 0
  const x = layer?.position().x ?? 0
  const y = layer?.position().y ?? 0
  const offsetX = layer?.offsetX() ?? 0
  const offsetY = layer?.offsetY() ?? 0

  return {
    x: (posX - x) / drawStore.realScale + offsetX,
    y: (posY - y) / drawStore.realScale + offsetY
  }
}

/**
 * 字体大小 = 容器高度 × 比例系数（推荐 0.4-0.6）
 * @param boxHeight
 */
const dynamicFontSize = (boxHeight: number): number => {
  return Math.max(
    Math.min(Math.trunc(boxHeight * 0.4), 30), // 最大24px
    12 // 最小8px
  )
}

export { getPos, getChildrenById, getDrawInfo, dynamicFontSize }
