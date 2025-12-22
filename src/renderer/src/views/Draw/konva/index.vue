<script setup lang="ts">
import { useDrawStore } from '@renderer/store/draw'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { dynamicFontSize } from '@renderer/store/draw/utils'
import Rectangles from '@renderer/views/Draw/konva/shapes/Rectangles.vue'
import Circle from '@renderer/views/Draw/konva/shapes/Circle.vue'
import Arrow from '@renderer/views/Draw/konva/shapes/Arrow.vue'
import Konva from 'konva'

const drawStore = useDrawStore()
const transformer = useTemplateRef<Konva.Transformer>('transformer')
const stageRef = useTemplateRef<Konva.Stage>('stage')
const mainLayerRef = useTemplateRef<HTMLDivElement>('mainLayer')
const scrollRef = useTemplateRef<HTMLDivElement>('scrollRef')

onMounted(() => {
  drawStore.setRefs(stageRef.value, transformer.value, mainLayerRef.value, scrollRef.value)
  window.addEventListener('keydown', drawStore.shortcutKeyHandler)
})

onUnmounted(() => {
  window.removeEventListener('keydown', drawStore.shortcutKeyHandler)
})
</script>

<template>
  <div class="layer-1">
    <div ref="mainLayer" class="layer-2">
      <a-spin :loading="drawStore.isLoading" dot>
        <a-scrollbar
          ref="scrollRef"
          :style="{
            width: `${drawStore.mainLayerWH.width}px`,
            height: `${drawStore.mainLayerWH.height}px`,
            overflow: 'auto'
          }"
        >
          <div
            :style="{
              width: `${drawStore.stageConfig.width + 16}px`,
              height: `${drawStore.stageConfig.height + 16}px`
            }"
          ></div>
        </a-scrollbar>
        <div
          :style="{
            position: 'absolute',
            top: 0
          }"
          @wheel="drawStore.wheelHandler"
        >
          <k-stage
            ref="stage"
            :config="{
              width: drawStore.mainLayerWH.width - 16,
              height: drawStore.mainLayerWH.height - 16
            }"
            @mousedown="drawStore.stageMouseDown"
            @mousemove="drawStore.stageMouseMove"
            @mouseup="drawStore.stageMouseUp"
            @mouseleave="drawStore.stageMouseLeave"
            @dragstart="drawStore.stageDragStart"
            @dragend="drawStore.stageDragEnd"
            @wheel="drawStore.stageWheel"
            @click="drawStore.stageClick"
          >
            <k-layer
              :config="{
                scaleX: drawStore.realScale,
                scaleY: drawStore.realScale,
                x: drawStore.layerConfig.x,
                y: drawStore.layerConfig.y,
                offsetX: drawStore.layerConfig.offsetX,
                offsetY: drawStore.layerConfig.offsetY
              }"
            >
              <k-image
                v-show="drawStore.image"
                :config="{
                  id: 'ocrImg',
                  image: drawStore.image
                }"
              />

              <k-group
                v-for="(data, i) in drawStore.ocrResult"
                :key="`index_${i}`"
                :config="{
                  x: data.box[0][0],
                  y: data.box[0][1]
                }"
                @click="!drawStore.graffitiMode && drawStore.copyText(data.text)"
              >
                <k-rect
                  v-if="drawStore.showOcr"
                  :config="{
                    width: data.box[2][0] - data.box[0][0],
                    height: data.box[2][1] - data.box[0][1],
                    fill: '#ffffff', // 背景色（白色）
                    // stroke: '#3366ff', // 边框颜色（蓝色）
                    strokeWidth: 2, // 边框粗细
                    cornerRadius: 5, // 圆角
                    shadowColor: 'black', // 阴影（可选）
                    shadowBlur: 5,
                    shadowOpacity: 0.2
                  }"
                />

                <k-text
                  v-if="drawStore.showOcr"
                  :config="{
                    width: data.box[2][0] - data.box[0][0],
                    height: data.box[2][1] - data.box[0][1],
                    fontSize: dynamicFontSize(data.box[2][1] - data.box[0][1]),
                    fill: 'red',
                    text: data.text,
                    verticalAlign: 'middle',
                    align: 'left'
                  }"
                />
              </k-group>
            </k-layer>
            <k-layer
              :config="{
                scaleX: drawStore.realScale,
                scaleY: drawStore.realScale,
                x: drawStore.layerConfig.x,
                y: drawStore.layerConfig.y,
                offsetX: drawStore.layerConfig.offsetX,
                offsetY: drawStore.layerConfig.offsetY
              }"
            >
              <Rectangles />
              <Circle />
              <Arrow />
              <k-transformer
                id="transformer"
                ref="transformer"
                :config="{
                  flipEnabled: false, //禁止翻转
                  keepRatio: false,
                  borderStrokeWidth: 2,
                  anchorSize: 12,
                  anchorCornerRadius: 6, // 圆角半径
                  anchorStrokeWidth: 1, // 设置Handle的边框宽度
                  rotateEnabled: true, //角度旋转
                  enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] // 只显示四个点
                }"
                @transformstart="drawStore.transformStart"
                @transformend="drawStore.transformEnd"
              />
            </k-layer>
          </k-stage>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<style scoped>
.layer-1 {
  width: 100%;
  height: 100%;
  background-color: var(--color-fill-2);
  position: relative;
}

.layer-2 {
  width: calc(100%);
  height: calc(100%);
  background-color: var(--color-fill-3);
  position: absolute;
  overflow: hidden;
}
</style>
