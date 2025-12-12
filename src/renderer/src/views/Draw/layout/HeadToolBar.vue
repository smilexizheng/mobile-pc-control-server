<script setup lang="ts">
import { Menu, Circle, MoveUpRight, RectangleHorizontal, Redo } from 'lucide-vue-next'
import { useDrawStore } from '@renderer/store/draw'
import { ref } from 'vue'
import ExportModal from '@renderer/views/Draw/konva/ExportModal.vue'
import ShapeConfig from '@renderer/views/Draw/konva/ShapeConfig.vue'

const drawStore = useDrawStore()

const size = ref<'mini' | 'medium' | 'large' | 'small'>('mini')

const operation = ref([
  {
    value: 'open',
    label: '打开图片',
    event: () => {
      drawStore.chooseImgFile()
    }
  },
  {
    value: 'screenshot',
    label: '截取屏幕',
    event: () => {
      drawStore.ocrScreenshots()
    }
  },
  {
    value: 'copyOcrText',
    label: '复制ocr全文',
    event: () => {
      drawStore.copyAllText()
    }
  },
  {
    value: 'copyImg',
    label: '复制可见图',
    event: () => {
      drawStore.copyImg()
    }
  },

  {
    value: 'export',
    label: '导出',
    event: () => {
      drawStore.exportModalVisible = true
    }
  }
])
</script>

<template>
  <div style="height: 70px; padding: 5px 10px">
    <ExportModal />
    <a-space :size="size">
      <a-dropdown trigger="hover" :popup-max-height="false">
        <a-button :size="size">
          <template #icon> <Menu color="blue" /> </template
        ></a-button>
        <template #content>
          <a-doption v-for="item in operation" @click="item.event">{{ item.label }}</a-doption>
        </template>
      </a-dropdown>

      OCR
      <a-switch :disabled="drawStore.isLoading" v-model="drawStore.showOcr" size="small" />
      涂鸦
      <a-switch v-model="drawStore.graffitiMode" size="small" />

      <a-input-number
        v-model="drawStore.scale"
        :style="{ width: '100px' }"
        :step="5"
        :min="10"
        :size="size"
        :max="2000"
        mode="button"
      />
      <a-button
        type="primary"
        :size="size"
        :loading="drawStore.isLoading"
        @click="drawStore.chooseImgFile()"
        >打开
      </a-button>

      <a-button
        type="primary"
        :size="size"
        :loading="drawStore.isLoading"
        @click="drawStore.ocrScreenshots()"
        >截屏
      </a-button>

      <!--        <a-button :size="size" :disabled="drawStore.isLoading" @click="drawStore.toggle()"-->
      <!--          >{{ drawStore.showOcr ? '隐藏结果' : '显示结果' }}-->
      <!--        </a-button>-->
    </a-space>
    <a-divider margin="0" />
    <a-space :size="size" style="margin-top: 5px">
      <template #split>
        <a-divider margin="0" direction="vertical" />
      </template>
      <a-select
        :disabled="!drawStore.graffitiMode"
        v-model="drawStore.currentMode.shape"
        :style="{ width: '100px' }"
        :size="size"
      >
        <a-option
          v-for="item of drawStore.modeType"
          @click="drawStore.setDrawMode(item)"
          :value="item.shape"
          :label="item.label"
        />
      </a-select>
      <a-button
        :size="size"
        v-for="item of drawStore.modeType"
        @click="drawStore.setDrawMode(item)"
        :type="item.label === drawStore.currentMode.label ? 'primary' : 'secondary'"
        :disabled="!drawStore.graffitiMode"
      >
        <template #icon>
          <Circle v-if="item.shape === 'circle'" />
          <MoveUpRight v-else-if="item.shape === 'arrow' && item.type === 'straight'" />
          <Redo v-else-if="item.shape === 'arrow' && item.type === 'curved'" />
          <RectangleHorizontal v-else /> </template
      ></a-button>

      <a-trigger trigger="click" :unmount-on-close="false">
        <a-button :size="size">配置</a-button>
        <template #content>
          <div class="base-shape-div"><ShapeConfig /></div
        ></template>
      </a-trigger>
    </a-space>
  </div>
</template>

<style scoped>
.base-shape-div {
  width: 240px;
  height: 450px;
  background: var(--color-bg-1);
  overflow-y: auto;
}
</style>
