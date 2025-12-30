import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RectangleConfig } from '@renderer/store/draw/type'
import { getPos } from '@renderer/store/draw/utils'
import Konva from 'konva'

export const useDrawRectStore = defineStore('draw-rect', () => {
  const TYPE = 'draw_rect'
  const shapes = ref<RectangleConfig[]>([])
  const currentRect = ref<RectangleConfig | null>(null)

  const error = ref<string | null>(null)
  const setShapeParams = (_): void => {}
  const defaultShapeConfig = ref({
    draggable: true,
    fill: 'rgba(255,255,255,0.25)',
    stroke: '#ED4034',
    strokeWidth: 2
  })
  function startDrawing(e: Konva.KonvaPointerEvent): void {
    const pos = getPos(e)
    try {
      currentRect.value = {
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0
      }
      error.value = null
    } catch (err) {
      handleError(err)
    }
  }

  function updateDrawing(e: Konva.KonvaPointerEvent): void {
    try {
      if (currentRect.value === null) {
        return
      }
      const pos = getPos(e)
      const { x: startX, y: startY } = currentRect.value
      const newWidth = pos.x - startX!
      const newHeight = pos.y - startY!

      currentRect.value = {
        x: newWidth > 0 ? startX : pos.x,
        y: newHeight > 0 ? startY : pos.y,
        width: Math.abs(newWidth),
        height: Math.abs(newHeight)
      }
      error.value = null
    } catch (err) {
      handleError(err)
    }
  }

  function endDrawing(): void {
    try {
      if (!currentRect.value) {
        return
      }
      if (currentRect.value.width! > 10 && currentRect.value.height! > 10) {
        shapes.value.push({ ...defaultShapeConfig.value, ...currentRect.value })
      }
      resetDrawing()
    } catch (err) {
      handleError(err)
    }
  }

  function resetDrawing(): void {
    currentRect.value = null
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
    currentRect,
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
