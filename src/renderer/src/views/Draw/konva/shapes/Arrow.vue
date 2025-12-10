<script setup lang="ts">
import { useDrawArrowStore } from '@renderer/store/draw/DrawArrowStore'
const drawStore = useDrawArrowStore()
</script>

<template>
  <!-- 已完成的矩形 -->
  <k-arrow
    v-for="(config, index) in drawStore.shapes"
    :key="`${drawStore.TYPE}_` + index"
    :config="{
      draggable: true,
      id: `${drawStore.TYPE}_` + index,
      pointerLength: 5,
      pointerWidth: 5,
      fill: '#0da7fa',
      stroke: '#0da7fa',
      strokeWidth: 1.5,
      ...config
    }"
  />
  <!-- 正在绘制的矩形 -->
  <k-arrow
    v-if="drawStore.currentShape"
    :config="{
      ...drawStore.currentShape,
      fill: '#0da7fa',
      stroke: '#0da7fa',
      pointerLength: 5,
      pointerWidth: 5,
      strokeWidth: 1.5,
      dash: [4, 4]
    }"
  />
</template>

<style scoped></style>
