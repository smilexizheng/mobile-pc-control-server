import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Rectangle } from '@renderer/store/draw/type'
import { getPos } from '@renderer/store/draw/utils'
import Konva from 'konva'

export const useDrawRectStore = defineStore('draw-rect', () => {
  const TYPE = 'draw_rect'
  const rectangles = ref<Rectangle[]>([])
  const currentRect = ref<Rectangle | null>(null)

  const error = ref<string | null>(null)
  const setShapeType = (_): void => {}

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
      const newWidth = pos.x - startX
      const newHeight = pos.y - startY

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
      if (currentRect.value.width > 10 && currentRect.value.height > 10) {
        rectangles.value.push({ ...currentRect.value })
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
    rectangles.value.splice(index, 1)
  }

  function removeAll(): void {
    resetDrawing()
    rectangles.value = []
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
    rectangles,
    currentRect,
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
