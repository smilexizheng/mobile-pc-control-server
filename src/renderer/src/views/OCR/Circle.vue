<script setup lang="ts">
import { useDrawCircleStore } from '@renderer/store/ocr/DrawCircleStore'
const drawStore = useDrawCircleStore()
</script>

<template>
  <!-- 已完成的矩形 -->
  <k-circle
    v-for="(rect, index) in drawStore.shapes"
    :key="`${drawStore.TYPE}_` + index"
    :config="{
      ...rect,
      draggable: true,
      id: `${drawStore.TYPE}_` + index,
      fill: '#00D2FF40',
      stroke: '#0da7fa',
      strokeWidth: 1.5
    }"
  />
  <!-- 正在绘制的矩形 -->
  <k-circle
    v-if="drawStore.currentShape"
    :config="{
      ...drawStore.currentShape,
      fill: '#00D2FF40',
      stroke: '#0da7fa',
      strokeWidth: 1.5,
      dash: [4, 4]
    }"
  />
</template>

<style scoped></style>
