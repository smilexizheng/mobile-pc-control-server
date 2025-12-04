<script setup lang="ts">
import { useOcrStore } from '@renderer/store/ocr'
import { onMounted, onUnmounted } from 'vue'
import Rectangles from '@renderer/views/OCR/Rectangles.vue'
import Circle from '@renderer/views/OCR/Circle.vue'
import Arrow from '@renderer/views/OCR/Arrow.vue'
import HeadToolBar from '@renderer/views/OCR/layout/HeadToolBar.vue'
import GraffitiConfig from '@renderer/views/OCR/layout/GraffitiConfig.vue'

const ocrStore = useOcrStore()

onMounted(() => {
  window.addEventListener('keydown', ocrStore.shortcutKeyHandler)
})

onUnmounted(() => {
  window.removeEventListener('keydown', ocrStore.shortcutKeyHandler)
})
</script>

<template>
  <div class="layer-1">
    <GraffitiConfig />

    <HeadToolBar />

    <div :ref="(r: any) => ocrStore.setMainLayer(r)" class="layer-2">
      <a-spin :loading="ocrStore.isLoading" dot>
        <a-scrollbar
          :ref="(r: any) => ocrStore.setScrollDivRef(r?.containerRef)"
          :style="{
            width: `${ocrStore.mainLayerWH.width}px`,
            height: `${ocrStore.mainLayerWH.height}px`,
            overflow: 'auto'
          }"
        >
          <div
            :style="{
              width: `${ocrStore.stageConfig.width}px`,
              height: `${ocrStore.stageConfig.height}px`
            }"
          ></div>
        </a-scrollbar>
        <div
          :style="{
            position: 'absolute',
            top: 0
          }"
          @wheel="ocrStore.wheelHandler"
        >
          <k-stage
            ref="stage"
            :config="{
              width: ocrStore.mainLayerWH.width - 16,
              height: ocrStore.mainLayerWH.height - 16
            }"
            @mousedown="ocrStore.stageMouseDown"
            @mousemove="ocrStore.stageMouseMove"
            @mouseup="ocrStore.stageMouseUp"
            @mouseleave="ocrStore.stageMouseLeave"
            @dragstart="ocrStore.stageDragStart"
            @dragend="ocrStore.stageDragEnd"
            @wheel="ocrStore.stageWheel"
            @click="ocrStore.stageClick"
          >
            <k-layer
              :config="{
                scaleX: ocrStore.realScale,
                scaleY: ocrStore.realScale,
                x: ocrStore.layerConfig.x,
                y: ocrStore.layerConfig.y,
                offsetX: ocrStore.layerConfig.offsetX,
                offsetY: ocrStore.layerConfig.offsetY
              }"
            >
              <k-image
                v-show="ocrStore.image"
                :config="{
                  id: 'ocrImg',
                  image: ocrStore.image
                }"
              />

              <k-group
                v-for="(data, i) in ocrStore.ocrResult"
                :key="`index_${i}`"
                :config="{
                  x: data.box[0][0],
                  y: data.box[0][1]
                }"
                @click="!ocrStore.graffitiMode && ocrStore.copyText(data.text)"
              >
                <k-rect
                  v-if="ocrStore.showOcr"
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
                  v-if="ocrStore.showOcr"
                  :config="{
                    width: data.box[2][0] - data.box[0][0],
                    height: data.box[2][1] - data.box[0][1],
                    fontSize: ocrStore.dynamicFontSize(data.box[2][1] - data.box[0][1]),
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
                scaleX: ocrStore.realScale,
                scaleY: ocrStore.realScale,
                x: ocrStore.layerConfig.x,
                y: ocrStore.layerConfig.y,
                offsetX: ocrStore.layerConfig.offsetX,
                offsetY: ocrStore.layerConfig.offsetY
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
                @transformstart="ocrStore.transformStart"
                @transformend="ocrStore.transformEnd"
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
  height: calc(100% - 70px);
  background-color: var(--color-fill-3);
  position: absolute;
  overflow: hidden;
}
</style>
