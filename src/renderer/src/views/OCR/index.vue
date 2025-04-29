<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from '@renderer/store/app'
import { useToggle } from '@vueuse/core'
import { OcrResult } from '@renderer/env'

const appStore = useAppStore()
const drawImage = ref()
const ocrTextBox = ref<OcrResult>([])
const [showOcr, toggle] = useToggle(true)
// const showOcr = ref(true)
const configKonva = ref({
  width: appStore.contentWH.width,
  height: appStore.contentWH.height
})

const ocrRecognition = (img): void => window.electron.ipcRenderer.send('ocr-recognition', img)
onMounted(() => {
  window.electron.ipcRenderer.on('ocr-result', (_, result) => {
    // console.log(result)
    const boxs = JSON.parse(result)
    console.log(boxs)
    ocrTextBox.value = boxs.data
  })

  ocrImage('D:/IdeaProjects/win-control-serve-electron/resources/ocr/test.png')
})

const ocrImage = (path): void => {
  const imgSrc = `disk:///${path}`
  if (imgSrc) {
    const img = new Image()
    img.onload = (): void => {
      drawImage.value = img
      configKonva.value = { width: drawImage.value.width, height: drawImage.value.height }
    }
    img.src = imgSrc
  }
  ocrRecognition(path)
}
</script>

<template>
  <div class="layer-1">
    <div style="height: 50px; padding: 10px">
      <a-space>
        <a-button type="primary">选择图片</a-button>
        <a-button type="primary" @click="toggle()">{{
          showOcr ? '隐藏结果' : '显示结果'
        }}</a-button>
      </a-space>
    </div>
    <div class="layer-2">
      <v-stage :config="configKonva">
        <v-layer>
          <v-image
            v-show="drawImage"
            :config="{
              x: 0,
              y: 0,
              image: drawImage
            }"
          />

          <v-rect
            v-if="showOcr"
            v-for="data in ocrTextBox"
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

          <v-text
            v-if="showOcr"
            v-for="data in ocrTextBox"
            :config="{
              x: data.box[0][0],
              y: data.box[0][1],
              fontSize: 14,
              fill: 'red',

              text: data.text
            }"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<style scoped>
.layer-1 {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  position: relative;
}

.layer-2 {
  width: 100%;
  height: calc(100% - 50px);
  background-color: #e0e0e0;
  position: absolute;
  overflow: auto;
}
</style>
