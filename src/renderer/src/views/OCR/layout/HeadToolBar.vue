<script setup lang="ts">
import { Menu, Circle, MoveUpRight, RectangleHorizontal, Redo } from 'lucide-vue-next'
import { useOcrStore } from '@renderer/store/ocr'
import { ref } from 'vue'
import ExportModal from '@renderer/views/OCR/modal/ExportModal.vue'

const ocrStore = useOcrStore()

const size = ref<'mini' | 'medium' | 'large' | 'small'>('mini')

const operation = ref([
  {
    value: 'open',
    label: '打开图片',
    event: () => {
      ocrStore.chooseFile()
    }
  },
  {
    value: 'screenshot',
    label: '截取屏幕',
    event: () => {
      ocrStore.ocrScreenshots()
    }
  },
  {
    value: 'copyOcrText',
    label: '复制ocr全文',
    event: () => {
      ocrStore.copyAllText()
    }
  },
  {
    value: 'copyImg',
    label: '复制可见图',
    event: () => {
      ocrStore.copyImg()
    }
  },

  {
    value: 'export',
    label: '导出',
    event: () => {
      ocrStore.exportModalVisible = true
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
      <a-switch :disabled="ocrStore.isLoading" v-model="ocrStore.showOcr" size="small" />
      涂鸦
      <a-switch v-model="ocrStore.graffitiMode" size="small" />

      <a-input-number
        v-model="ocrStore.scale"
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
        :loading="ocrStore.isLoading"
        @click="ocrStore.chooseFile()"
        >打开
      </a-button>

      <a-button
        type="primary"
        :size="size"
        :loading="ocrStore.isLoading"
        @click="ocrStore.ocrScreenshots()"
        >截屏
      </a-button>

      <!--        <a-button :size="size" :disabled="ocrStore.isLoading" @click="ocrStore.toggle()"-->
      <!--          >{{ ocrStore.showOcr ? '隐藏结果' : '显示结果' }}-->
      <!--        </a-button>-->
    </a-space>
    <a-divider margin="0" />
    <a-space :size="size" style="margin-top: 5px">
      <template #split>
        <a-divider margin="0" direction="vertical" />
      </template>
      <a-select
        :disabled="!ocrStore.graffitiMode"
        v-model="ocrStore.currentMode.shape"
        :style="{ width: '100px' }"
        :size="size"
      >
        <a-option
          v-for="item of ocrStore.modeType"
          @click="ocrStore.setDrawMode(item)"
          :value="item.shape"
          :label="item.label"
        />
      </a-select>
      <a-button
        :size="size"
        v-for="item of ocrStore.modeType"
        @click="ocrStore.setDrawMode(item)"
        :type="item.label === ocrStore.currentMode.label ? 'primary' : 'secondary'"
        :disabled="!ocrStore.graffitiMode"
      >
        <template #icon>
          <Circle v-if="item.shape === 'circle'" />
          <MoveUpRight v-else-if="item.shape === 'arrow' && item.type === 'straight'" />
          <Redo v-else-if="item.shape === 'arrow' && item.type === 'curved'" />
          <RectangleHorizontal v-else /> </template
      ></a-button>
    </a-space>
  </div>
</template>

<style scoped></style>
