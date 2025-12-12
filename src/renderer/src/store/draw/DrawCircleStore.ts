import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CircleConfig } from '@renderer/store/draw/type'
import { getPos } from '@renderer/store/draw/utils'
import Konva from 'konva'

export const useDrawCircleStore = defineStore('draw-circle', () => {
  const TYPE = 'draw_circle'

  const shapes = ref<CircleConfig[]>([])
  const currentShape = ref<CircleConfig | null>(null)
  const error = ref<string | null>(null)

  const setShapeType = (_): void => {}

  function startDrawing(e: Konva.KonvaPointerEvent): void {
    const pos = getPos(e)
    try {
      currentShape.value = {
        x: pos.x,
        y: pos.y,
        radius: 0
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
      const pos = getPos(e)
      const { x: startX, y: startY } = currentShape.value
      const newWidth = pos.x - startX!
      const newHeight = pos.y - startY!

      currentShape.value = {
        x: newWidth > 0 ? startX : pos.x,
        y: newHeight > 0 ? startY : pos.y,
        radius: Math.abs(newWidth)
      }
      error.value = null
    } catch (err) {
      handleError(err)
    }
  }

  function endDrawing(): void {
    try {
      if (!currentShape.value) {
        return
      }
      if (currentShape.value.radius! > 10) {
        shapes.value.push({ ...currentShape.value })
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
  return {
    TYPE,
    shapes,
    currentShape,
    error,
    setShapeType,
    startDrawing,
    updateDrawing,
    endDrawing,
    resetDrawing,
    handleError,
    remove,
    removeAll,
    handleDragStart,
    handleDragEnd
  }
})
