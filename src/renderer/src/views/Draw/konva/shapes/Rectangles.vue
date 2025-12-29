<script setup lang="ts">
import { useDrawRectStore } from '@renderer/store/draw/DrawRectStore'
const rectStore = useDrawRectStore()
</script>

<template>
  <!-- 已完成的矩形 -->
  <k-rect
    v-for="(rect, index) in rectStore.rectangles"
    :key="`${rectStore.TYPE}_` + index"
    :config="{
      id: `${rectStore.TYPE}_` + index,
      ...rect
    }"
    @onDragStart="rectStore.handleDragStart"
    @onDragEnd="rectStore.handleDragEnd"
  />
  <!-- 正在绘制的矩形 -->
  <k-rect
    v-if="rectStore.currentRect"
    :config="{
      ...rectStore.currentRect,
      fill: '#00D2FF40',
      stroke: '#0da7fa',
      strokeWidth: 1.5,
      dash: [4, 4]
    }"
  />
</template>

<style scoped></style>
