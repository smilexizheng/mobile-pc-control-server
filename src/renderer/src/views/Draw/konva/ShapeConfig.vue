<script setup>
import { ref } from 'vue'
import { useDrawStore } from '@renderer/store/draw'
const drawStore = useDrawStore()
//
// const drawStore.shapeConfig = ref({
//   x: 0,
//   y: 0,
//   width: 100,
//   height: 100,
//   fill: '#ffffff',
//   stroke: '#000000',
//   strokeWidth: 1,
//   opacity: 1,
//   rotation: 0,
//   scaleX: 1,
//   scaleY: 1,
//   lineJoin: 'miter',
//   lineCap: 'butt',
//   shadowColor: '#000000',
//   shadowBlur: 0,
//   shadowOffsetX: 0,
//   shadowOffsetY: 0,
//   shadowOpacity: 1,
//   dash: '',
//   dashOffset: 0,
//   draggable: false,
//   visible: true,
//   cornerRadius: 0,
//   fillPatternRepeat: 'repeat',
//   strokeScaleEnabled: true,
//   shadowEnabled: true
// })

const lineJoinOptions = [
  { label: 'Miter', value: 'miter' },
  { label: 'Round', value: 'round' },
  { label: 'Bevel', value: 'bevel' }
]

const lineCapOptions = [
  { label: 'Butt', value: 'butt' },
  { label: 'Round', value: 'round' },
  { label: 'Square', value: 'square' }
]

const fillPatternRepeatOptions = [
  { label: 'Repeat', value: 'repeat' },
  { label: 'Repeat-X', value: 'repeat-x' },
  { label: 'Repeat-Y', value: 'repeat-y' },
  { label: 'No-Repeat', value: 'no-repeat' }
]

const history = ref(['#FFFFFF00'])
const addHistory = (visible, color) => {
  if (!visible) {
    const index = history.value.indexOf(color)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
    history.value.unshift(color)
  }
}
</script>

<template>
  <a-form
    :model="drawStore.shapeConfig"
    layout="horizontal"
    auto-label-width
    size="mini"
    :style="{ width: '200px' }"
  >
    <a-form-item label="背景/边框">
      <a-color-picker
        v-model="drawStore.shapeConfig.fill"
        :historyColors="history"
        showHistory
        showPreset
        @popup-visible-change="addHistory"
      />
      <a-color-picker
        v-model="drawStore.shapeConfig.stroke"
        :historyColors="history"
        showHistory
        showPreset
        @popup-visible-change="addHistory"
      />
    </a-form-item>
    <a-form-item label="描边宽度" field="strokeWidth">
      <a-input-number
        v-model="drawStore.shapeConfig.strokeWidth"
        :step="1"
        :min="0"
        mode="button"
      />
    </a-form-item>
    <a-form-item label="不透明度" field="opacity">
      <a-slider v-model="drawStore.shapeConfig.opacity" :min="0" :max="1" :step="0.01" />
    </a-form-item>
    <a-form-item label="可拖拽" field="draggable">
      <a-switch v-model="drawStore.shapeConfig.draggable" />
    </a-form-item>
    <a-form-item label="可见性" field="visible">
      <a-switch v-model="drawStore.shapeConfig.visible" disabled />
    </a-form-item>
    <a-form-item label="X 位置" field="x">
      <a-input-number v-model="drawStore.shapeConfig.x" :step="1" mode="button" />
    </a-form-item>
    <a-form-item label="Y 位置" field="y">
      <a-input-number v-model="drawStore.shapeConfig.y" :step="1" mode="button" />
    </a-form-item>
    <!--    <a-form-item label="宽度" field="width">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.width" :step="1" :min="0" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="高度" field="height">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.height" :step="1" :min="0" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="旋转角度 (度)" field="rotation">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.rotation" :step="1" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="X 缩放" field="scaleX">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.scaleX" :step="0.1" :min="0" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="Y 缩放" field="scaleY">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.scaleY" :step="0.1" :min="0" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="线连接方式" field="lineJoin">-->
    <!--      <a-select v-model="drawStore.shapeConfig.lineJoin" :options="lineJoinOptions" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="线端点方式" field="lineCap">-->
    <!--      <a-select v-model="drawStore.shapeConfig.lineCap" :options="lineCapOptions" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="阴影颜色" field="shadowColor">-->
    <!--      <a-color-picker v-model="drawStore.shapeConfig.shadowColor" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="阴影模糊" field="shadowBlur">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.shadowBlur" :step="1" :min="0" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="阴影偏移 X" field="shadowOffsetX">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.shadowOffsetX" :step="1" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="阴影偏移 Y" field="shadowOffsetY">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.shadowOffsetY" :step="1" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="阴影不透明度" field="shadowOpacity">-->
    <!--      <a-slider v-model="drawStore.shapeConfig.shadowOpacity" :min="0" :max="1" :step="0.01" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="虚线" field="dash">-->
    <!--      <a-input v-model="drawStore.shapeConfig.dash" placeholder="例如: 5,10" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="虚线偏移" field="dashOffset">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.dashOffset" :step="1" />-->
    <!--    </a-form-item>-->

    <!--    <a-form-item label="角半径" field="cornerRadius">-->
    <!--      <a-input-number v-model="drawStore.shapeConfig.cornerRadius" :step="1" :min="0" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="填充模式" field="fillPatternRepeat">-->
    <!--      <a-select-->
    <!--        v-model="drawStore.shapeConfig.fillPatternRepeat"-->
    <!--        :options="fillPatternRepeatOptions"-->
    <!--      />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="描边缩放启用" field="strokeScaleEnabled">-->
    <!--      <a-switch v-model="drawStore.shapeConfig.strokeScaleEnabled" />-->
    <!--    </a-form-item>-->
    <!--    <a-form-item label="阴影启用" field="shadowEnabled">-->
    <!--      <a-switch v-model="drawStore.shapeConfig.shadowEnabled" />-->
    <!--    </a-form-item>-->
  </a-form>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
