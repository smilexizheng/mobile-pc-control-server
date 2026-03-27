<template>
  <a-row class="grid" justify="center" :gutter="24">
    <a-col :span="9">
      <a-card class="left-panel" :bordered="false" :body-style="{ padding: '10px' }">
        <div class="panel-header">
          <span class="panel-title">音频文件</span>
          <a-tag color="arcoblue" size="small">仅支持 16-bit WAV</a-tag>
        </div>

        <div class="file-area">
          <div class="upload-trigger" @click="openFileDialog">
            <a-button type="primary" size="small" :loading="loading">
              <template #icon>
                <icon-upload />
              </template>
              选择音频
            </a-button>
          </div>

          <a-divider />
          <a-input-search
            placeholder="ggml模型文件"
            v-model="models.model"
            button-text="选择"
            @click="chooseModelFile()"
            search-button
          />
          <a-input-search
            v-model="models.vad_model"
            placeholder="vad模型文件"
            button-text="选择"
            @click="chooseVadFile()"
            search-button
          />
        </div>
      </a-card>
    </a-col>
    <a-col :span="14">
      <a-card class="right-panel" :bordered="false" :body-style="{ padding: '10px' }">
        <div class="panel-header">
          <span class="panel-title">转换结果</span>
          <a-space :size="12">
            <a-button
              type="outline"
              size="small"
              :disabled="!resultText || loading"
              @click="copyText"
            >
              <template #icon><icon-copy /></template>
              复制文本
            </a-button>
            <a-button
              type="outline"
              size="small"
              :disabled="!resultText || loading"
              @click="saveAsText"
            >
              <template #icon><icon-download /></template>
              另存为文本
            </a-button>
          </a-space>
        </div>

        <div class="result-area">
          <a-spin :loading="loading" tip="正在识别语音，请稍候..." style="width: 100%">
            <a-textarea
              v-model="resultText"
              :auto-size="{ minRows: 14, maxRows: 14 }"
              placeholder="语音转写结果将显示在这里..."
              :disabled="loading"
              class="resul. t-textarea"
            />
          </a-spin>
          <div class="word-count" v-if="resultText">字数统计: {{ resultText.length }} 字符</div>
        </div>
      </a-card>
    </a-col>
  </a-row>
  <div>
    <div
      class="word-count"
      @click="Message.success('复制成功') && copy('https://huggingface.co/ggerganov/whisper.cpp ')"
    >
      点击复制gglm模型下载地址 https://huggingface.co/ggerganov/whisper.cpp
    </div>
    <div
      class="word-count"
      @click="
        Message.success('复制成功') && copy('https://huggingface.co/ggml-org/whisper-vad/tree/main')
      "
    >
      复制vad模型下载地址 https://huggingface.co/ggml-org/whisper-vad/tree/main
    </div>
    <div
      class="word-count"
      @click="
        Message.success('复制成功') &&
        copy('ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav')
      "
    >
      MP3 转 WAV：ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconSync, IconCopy, IconDownload } from '@arco-design/web-vue/es/icon'

// 状态管理
const selectedFile = ref(null)
const resultText = ref('')
const loading = ref(false)

const models = ref({ model: '', vad_model: '' })

const openFileDialog = async () => {
  const selectedFile = await window.api.chooseFile('选择音频', ['wav'])
  await convertToText(selectedFile)
}

const chooseModelFile = async () => {
  models.value.model = await window.api.chooseFile('选择模型', ['bin'])
  window.api.whisperConfig({ ...models.value })
}
const chooseVadFile = async () => {
  models.value.vad_model = await window.api.chooseFile('选择模型', ['bin'])
  window.api.whisperConfig({ ...models.value })
}

// 模拟语音转文本 (实际项目可替换为真实 API 调用)
const simulateSpeechToText = async (file) => {
  console.log(file)
  const res = await window.api.whisperAsync(file)
  return `\n${res.err || res.transcription}\n`
}

// 执行语音转文本
const convertToText = async (file) => {
  if (!file) return
  loading.value = true
  resultText.value = ''

  try {
    resultText.value = await simulateSpeechToText(file)
  } catch (error) {
    console.error('转写失败:', error)
    Message.error('转写失败，请稍后重试')
    resultText.value = '转换失败，请检查网络或音频文件格式。'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log(await window.api.getWhisperConfig())
  models.value = await window.api.getWhisperConfig()
})

// 复制文本到剪贴板 (VueUse)
const { copy } = useClipboard()
const copyText = async () => {
  if (!resultText.value) return
  try {
    await copy(resultText.value)
    Message.success('已复制到剪贴板')
  } catch (err) {
    Message.error('复制失败，请手动复制')
  }
}

// 另存为文本文件
const saveAsText = () => {
  if (!resultText.value) return
  const blob = new Blob([resultText.value], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  // 生成文件名: 原音频名(无后缀)_语音文本.txt 或默认时间戳
  let fileName = '语音转写结果.txt'
  if (selectedFile.value) {
    const baseName = selectedFile.value.name.replace(/\.[^/.]+$/, '')
    fileName = `${baseName}_语音文本.txt`
  } else {
    fileName = `语音文本_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  }
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  Message.success('文件保存成功')
}
</script>

<style scoped>
.grid {
  height: 80%;
}

/* 卡片样式 */
.left-panel,
.right-panel {
  border-radius: 24px;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.03),
    0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  background: var(--color-fill-2);
  backdrop-filter: blur(0px);
}

.left-panel:hover,
.right-panel:hover {
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  background: var(--color-fill-2);
  background-clip: text;
  -webkit-background-clip: text;
  letter-spacing: -0.2px;
}

/* 左侧文件区域 */
.file-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-trigger {
  text-align: center;
  cursor: pointer;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.file-name span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5b6e8c;
  font-size: 12px;
}

.clear-btn {
  color: #94a3b8;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #ef4444;
}

.empty-tip {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  font-size: 14px;
  padding: 20px 0;
}

.empty-tip svg {
  font-size: 32px;
  opacity: 0.6;
}

.action-tip {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #4b5563;
  border-left: 3px solid #3b82f6;
}

.retry-btn {
  align-self: flex-start;
  margin-top: 4px;
}

/* 右侧结果区域 */
.result-area {
  width: 100%;
  position: relative;
}

.result-textarea :deep(textarea) {
  background: var(--color-border-2);
  font-size: 14px;
  line-height: 1.6;
  padding: 10px;
  transition: all 0.2s;
}

.result-textarea :deep(textarea):focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 12px;
  padding-right: 6px;
}
</style>
