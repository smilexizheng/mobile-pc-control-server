<script setup lang="ts">
import { useDrawRectStore } from '@renderer/store/ocr/DrawRectStore'
const rectStore = useDrawRectStore()
</script>

<template>
  <k-group>
    <!-- 已完成的矩形 -->
    <k-rect
      v-for="(rect, index) in rectStore.rectangles"
      :key="'rect-' + index"
      :config="{
        ...rect,
        fill: '#00D2FF80',
        stroke: '#0099CC',
        strokeWidth: 2
      }"
    />

    <!-- 正在绘制的矩形 -->
    <k-rect
      v-if="rectStore.currentRect"
      :config="{
        ...rectStore.currentRect,
        fill: '#00D2FF40',
        stroke: '#006699',
        strokeWidth: 1.5,
        dash: [4, 4]
      }"
    />
  </k-group>
</template>

<style scoped></style>
