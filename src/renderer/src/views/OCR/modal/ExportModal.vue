<script lang="ts" setup>
import { ref, watch } from 'vue'
import {
  Modal as AModal,
  Form as AForm,
  Select as ASelect,
  Option as AOption,
  InputNumber as AInputNumber,
  Slider as ASlider
} from '@arco-design/web-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { useOcrStore } from '@renderer/store/ocr'
const ocrStore = useOcrStore()

// 表单数据
const formData = ref({
  exportType: 'full' as 'full' | 'current',
  resolution: 'original' as string,
  customWidth: 1920,
  customHeight: 1080,
  quality: 0.95,
  pixelRatio: 2,
  mimeType: 'image/png'
})

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 处理分辨率变化
const handleResolutionChange = (value: string) => {
  if (value !== 'custom') {
    formData.value.customWidth = ocrStore.stageConfig.width
    formData.value.customHeight = ocrStore.stageConfig.height
  }
}

// 获取目标宽高
const getTargetDimensions = () => {
  if (formData.value.resolution === 'original') {
    return {
      targetWidth: ocrStore.image.width,
      targetHeight: ocrStore.image.height
    }
  } else if (formData.value.resolution === 'custom') {
    return { targetWidth: formData.value.customWidth, targetHeight: formData.value.customHeight }
  } else {
    const [targetWidth, targetHeight] = formData.value.resolution.split('x').map(Number)
    return { targetWidth, targetHeight }
  }
}

// 处理导出
const handleExport = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const options = {
      quality: formData.value.quality,
      mimeType: formData.value.mimeType,
      exportType: formData.value.exportType,
      resolution: formData.value.resolution,
      pixelRatio: formData.value.pixelRatio,
      ...getTargetDimensions()
    }

    await ocrStore.handleExport(options)
  } finally {
    loading.value = false
  }
}

// 监听 visible 变化，重置表单
watch(
  () => ocrStore.exportModalVisible,
  (newVal) => {
    if (newVal) {
      formData.value = {
        exportType: 'full',
        resolution: 'original',
        customWidth: 1920,
        customHeight: 1080,
        quality: 1,
        pixelRatio: 1,
        mimeType: 'image/png'
      }
    }
  }
)
</script>
<template>
  <a-modal
    v-model:visible="ocrStore.exportModalVisible"
    auto-label-width
    title="导出图像"
    :ok-loading="loading"
    :mask-closable="false"
    @ok="handleExport"
  >
    <a-form ref="formRef" :model="formData" layout="horizontal">
      <!-- 导出类型选择 -->
      <a-form-item
        label="导出类型"
        field="exportType"
        extra="完整区域：按分辨率导出，图像可能变形；可见区域：按分辨率自动适配 高清倍数"
        :rules="[{ required: true, message: '请选择导出类型' }]"
      >
        <a-select v-model="formData.exportType" placeholder="请选择">
          <a-option value="full">完整区域</a-option>
          <a-option value="current">可见区域</a-option>
        </a-select>
      </a-form-item>

      <!-- 分辨率选择 -->
      <a-form-item
        label="分辨率"
        field="resolution"
        :rules="[{ required: true, message: '请选择或输入分辨率' }]"
      >
        <a-select
          v-model="formData.resolution"
          placeholder="选择预设或自定义"
          allow-clear
          @change="handleResolutionChange"
        >
          <a-option v-if="formData.exportType === 'full'" value="original">
            原图({{ ocrStore.image?.width || 500 }}x{{ ocrStore.image?.height || 500 }})</a-option
          >
          <a-option v-else value="original">
            当前窗口({{ ocrStore.mainLayerWH.width }}x{{ ocrStore.mainLayerWH.height }})</a-option
          >
          <a-option value="1920x1080">Full HD (1920x1080)</a-option>
          <a-option value="2560x1440">2K (2560x1440)</a-option>
          <a-option value="3840x2160">4K (3840x2160)</a-option>
          <a-option value="custom">自定义</a-option>
        </a-select>
      </a-form-item>

      <!-- 自定义分辨率输入（当选择自定义时显示） -->
      <a-form-item
        v-if="formData.resolution === 'custom'"
        label="自定义宽度"
        field="customWidth"
        :rules="[{ required: true, type: 'number', min: 1, message: '请输入有效宽度' }]"
      >
        <a-input-number v-model="formData.customWidth" placeholder="宽度 (px)" :min="1" />
      </a-form-item>
      <a-form-item
        v-if="formData.resolution === 'custom'"
        label="自定义高度"
        field="customHeight"
        :rules="[{ required: true, type: 'number', min: 1, message: '请输入有效高度' }]"
      >
        <a-input-number v-model="formData.customHeight" placeholder="高度 (px)" :min="1" />
      </a-form-item>

      <!-- Pixel Ratio (高清倍数) -->
      <a-form-item
        label="高清倍数"
        v-if="formData.resolution === 'original'"
        field="pixelRatio"
        extra="像素比 提升图像质量，如原图500x500，设置为 2，那么生成的尺寸为 1000x1000"
      >
        <a-select v-model="formData.pixelRatio" placeholder="选择高清倍数">
          <a-option :value="1">1x (标准)</a-option>
          <a-option :value="2">2x (高清)</a-option>
          <a-option :value="3">3x (超高清)</a-option>
        </a-select>
      </a-form-item>

      <!-- 输出格式 -->
      <a-form-item label="输出格式" field="mimeType">
        <a-select v-model="formData.mimeType" placeholder="选择格式">
          <a-option value="image/png">PNG (推荐，透明支持)</a-option>
          <a-option value="image/jpeg">JPEG (压缩，适合照片)</a-option>
        </a-select>
      </a-form-item>

      <!-- 图像质量 -->
      <a-form-item label="图像质量" field="quality">
        <a-slider
          v-model="formData.quality"
          :min="0.1"
          :max="1"
          :step="0.05"
          :marks="{ 0.1: '低', 1: '高' }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style></style>
