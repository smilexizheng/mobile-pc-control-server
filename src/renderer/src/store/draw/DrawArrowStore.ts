import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ArrowConfig } from '@renderer/store/draw/type'
import { getPos } from '@renderer/store/draw/utils'
import Konva from 'konva'

type ArrowType = 'straight' | 'curved' | 'polyline'
export const useDrawArrowStore = defineStore('draw-arrow', () => {
  const TYPE = 'draw_arrow'

  const arrowType = ref<ArrowType>('straight')
  const shapes = ref<ArrowConfig[]>([])
  const currentShape = ref<ArrowConfig | null>(null)

  const defaultShapeConfig = ref({
    draggable: true,
    pointerLength: 5,
    pointerWidth: 5,
    fill: '#0da7fa',
    stroke: '#0da7fa',
    strokeWidth: 1.5
  })

  const error = ref<string | null>(null)

  const setShapeParams = (type: ArrowType): void => {
    arrowType.value = type
  }

  function startDrawing(e: Konva.KonvaPointerEvent): void {
    const pos = getPos(e)
    try {
      currentShape.value = {
        points: [pos.x, pos.y]
      }
      error.value = null
    } catch (err) {
      handleError(err)
    }
  }

  function updateDrawing(e: Konva.KonvaPointerEvent): void {
    try {
      if (currentShape.value === null) {
        return
      }
      // // 详细运动轨迹
      const pos = getPos(e)
      const { points } = currentShape.value
      currentShape.value = {
        points: [...points, pos.x, pos.y]
      }
      error.value = null
    } catch (err) {
      handleError(err)
    }
  }

  function endDrawing(e: Konva.KonvaPointerEvent): void {
    try {
      if (!currentShape.value) {
        return
      }

      const { points } = currentShape.value
      if (points.length > 4) {
        const pos = getPos(e)
        switch (arrowType.value) {
          // 直线箭头
          case 'straight':
            currentShape.value = {
              points: [points[0], points[1], pos.x, pos.y]
            }
            break
          // 曲线箭头
          case 'curved':
            break
        }

        shapes.value.push({ ...defaultShapeConfig.value, ...currentShape.value })
      }
      resetDrawing()
    } catch (err) {
      handleError(err)
    }
  }

  function resetDrawing(): void {
    currentShape.value = null
  }

  function remove(index: number): void {
    resetDrawing()
    shapes.value.splice(index, 1)
  }

  function removeAll(): void {
    resetDrawing()
    shapes.value = []
  }

  function handleError(err: unknown): void {
    const errorMessage = err instanceof Error ? err.message : 'Unknown drawing error'
    console.error('Drawing Error:', errorMessage)
    error.value = errorMessage
    resetDrawing()
  }

  const handleDragStart = (e) => {
    const id = e.target.id()
    console.log(id)
  }

  const handleDragEnd = (e) => {
    console.log(e)
  }
  function updateConfig(index: number, config): void {
    if (index >= shapes.value.length) return
    shapes.value[index] = { ...shapes.value[index], ...config }
  }

  function getShapeConfig(index: number): Konva.ShapeConfig {
    if (index >= shapes.value.length) return {}
    return shapes.value[index]
  }
  return {
    TYPE,
    shapes,
    currentShape,
    error,
    setShapeParams,
    startDrawing,
    updateDrawing,
    endDrawing,
    resetDrawing,
    handleError,
    getShapeConfig,
    updateConfig,
    remove,
    removeAll,
    handleDragStart,
    handleDragEnd
  }
})
