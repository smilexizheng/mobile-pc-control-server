<script setup lang="ts">
import { useOcrStore } from '@renderer/store/ocr'
import { onMounted, onUnmounted } from 'vue'
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
    <div style="height: 50px; padding: 10px">
      <a-space>
        <a-input-number
          v-model="ocrStore.scale"
          :style="{ width: '130px' }"
          :step="5"
          :min="10"
          :max="2000"
          mode="button"
        />
        <a-button type="primary" :loading="ocrStore.isLoading" @click="ocrStore.chooseFile()"
          >打开图片
        </a-button>

        <a-button type="primary" :loading="ocrStore.isLoading" @click="ocrStore.ocrScreenshots()"
          >截取屏幕
        </a-button>

        <a-button :disabled="ocrStore.isLoading" @click="ocrStore.toggle()"
          >{{ ocrStore.showOcr ? '隐藏结果' : '显示结果' }}
        </a-button>

        <a-button :disabled="ocrStore.isLoading" @click="ocrStore.copyAllText()"
          >复制全部
        </a-button>
      </a-space>
    </div>

    <div :ref="(r: any) => ocrStore.setMainLayer(r)" class="layer-2">
      <a-spin :loading="ocrStore.isLoading" dot>
        <div
          :ref="(r: any) => ocrStore.setScrollDivRef(r)"
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
        </div>
        <div
          :style="{
            position: 'absolute',
            top: 0
          }"
          @wheel="ocrStore.wheelHandler"
        >
          <k-stage
            :config="{
              width: ocrStore.mainLayerWH.width - 16,
              height: ocrStore.mainLayerWH.height - 16
            }"
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
                  image: ocrStore.image
                }"
              />

              <k-group
                v-for="(data, i) in ocrStore.ocrResult"
                :key="`index_${i}`"
                @click="ocrStore.copyText(data.text)"
              >
                <k-rect
                  v-if="ocrStore.showOcr"
                  :config="{
                    x: data.box[0][0],
                    y: data.box[0][1],
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
                    x: data.box[0][0],
                    y: data.box[0][1],
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
  height: calc(100% - 50px);
  background-color: var(--color-fill-3);
  position: absolute;
  overflow: hidden;
}
</style>
