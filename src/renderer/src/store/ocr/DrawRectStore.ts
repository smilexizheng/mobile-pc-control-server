import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Rectangle } from '@renderer/store/ocr/type'
import { getPos } from '@renderer/store/ocr/utils'
import Konva from 'konva'

export const useDrawRectStore = defineStore('draw-rect', () => {
  const rectangles = ref<Rectangle[]>([])
  const currentRect = ref<Rectangle | null>(null)
  const isDrawing = ref(false)
  const error = ref<string | null>(null)

  function startDrawing(e: Konva.KonvaPointerEvent): void {
    const pos = getPos(e)
    try {
      if (isDrawing.value) {
        return
      }
      isDrawing.value = true
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
      if (!isDrawing.value || currentRect.value === null) {
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
      if (!isDrawing.value || !currentRect.value) {
        return
      }
      if (currentRect.value.width > 30 && currentRect.value.height > 30) {
        rectangles.value.push({ ...currentRect.value })
      }

      resetDrawing()
      error.value = null
    } catch (err) {
      handleError(err)
    }
  }

  function resetDrawing(): void {
    isDrawing.value = false
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

  return {
    rectangles,
    currentRect,
    isDrawing,
    error,
    startDrawing,
    updateDrawing,
    endDrawing,
    resetDrawing,
    handleError,
    remove,
    removeAll
  }
})
