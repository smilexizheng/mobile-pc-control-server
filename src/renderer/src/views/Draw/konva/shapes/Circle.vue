<script setup lang="ts">
import { useDrawCircleStore } from '@renderer/store/draw/DrawCircleStore'
const drawStore = useDrawCircleStore()
</script>

<template>
  <!-- 已完成的矩形 -->
  <k-circle
    v-for="(config, index) in drawStore.shapes"
    :key="`${drawStore.TYPE}_` + index"
    :config="{
      draggable: true,
      fill: '#00D2FF40',
      id: `${drawStore.TYPE}_` + index,
      stroke: '#0da7fa',
      strokeWidth: 1.5,
      ...config
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
