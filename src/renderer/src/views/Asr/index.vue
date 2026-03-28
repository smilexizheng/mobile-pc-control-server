<template>
  <div class="asr-page">
    <a-row class="asr-grid" justify="start" :gutter="[16, 16]">
      <a-col class="asr-col asr-col--left" :xs="24" :sm="24" :md="24" :lg="9" :xl="9">
        <a-card class="left-panel" :bordered="false" :body-style="{ padding: '10px' }">
          <div class="panel-header panel-header--left">
            <span class="panel-title">音频文件</span>
            <a-tag color="arcoblue" size="small" class="panel-tag"
              >WAV / MP3（设置中配置 ffmpeg）</a-tag
            >
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
              search-button
              @search="chooseModelFile"
            />
            <a-input-search
              v-model="models.vad_model"
              placeholder="vad模型文件"
              button-text="选择"
              search-button
              @search="chooseVadFile"
            />
          </div>
        </a-card>
      </a-col>
      <a-col class="asr-col asr-col--right" :xs="24" :sm="24" :md="24" :lg="15" :xl="15">
        <a-card class="right-panel" :bordered="false" :body-style="{ padding: '10px' }">
          <div class="panel-header panel-header--actions">
            <div class="panel-header__title-row">
              <span class="panel-title">转换结果</span>
            </div>
            <a-space class="panel-header__actions" :size="12" wrap>
              <a-button
                type="outline"
                size="small"
                :disabled="!resultPlain || loading"
                @click="copyPlainText"
              >
                <template #icon><icon-copy /></template>
                复制纯文本
              </a-button>
              <a-button
                type="outline"
                size="small"
                :disabled="!resultTimeline || loading"
                @click="copyTimelineText"
              >
                <template #icon><icon-copy /></template>
                复制时间轴
              </a-button>
              <a-button
                type="outline"
                size="small"
                :disabled="!resultPlain || loading"
                @click="saveAsText"
              >
                <template #icon><icon-download /></template>
                另存为文本
              </a-button>
            </a-space>
          </div>

          <div class="result-area">
            <a-spin :loading="loading" tip="正在识别语音，请稍候..." style="width: 100%">
              <a-row class="result-split" :gutter="[12, 12]">
                <a-col class="asr-col asr-col--timeline" :xs="24" :sm="24" :md="24" :lg="9">
                  <div class="result-block-label">时间轴</div>
                  <a-textarea
                    :model-value="resultTimeline"
                    read-only
                    :auto-size="{ minRows: 8, maxRows: 22 }"
                    placeholder="带时间戳分段时，每行显示一段的起止时间…"
                    :disabled="loading"
                    class="result-textarea result-textarea--timeline"
                  />
                </a-col>
                <a-col class="asr-col asr-col--plain" :xs="24" :sm="24" :md="24" :lg="15">
                  <div class="result-block-label">纯文本</div>
                  <a-textarea
                    v-model="resultPlain"
                    :auto-size="{ minRows: 8, maxRows: 22 }"
                    placeholder="仅转写文字，便于阅读与复制…"
                    :disabled="loading"
                    class="result-textarea"
                  />
                </a-col>
              </a-row>
            </a-spin>
            <div v-if="resultSummaryLine" class="result-meta">{{ resultSummaryLine }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <div class="hint-links hint-links--scroll">
      <div
        v-for="(item, index) in COPY_LINKS"
        :key="index"
        class="hint-line word-count"
        role="button"
        tabindex="0"
        @click="copyHintLine(item.text)"
        @keydown.enter.prevent="copyHintLine(item.text)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconCopy, IconDownload } from '@arco-design/web-vue/es/icon'

const { copy } = useClipboard()

const audioPath = ref('')
/** 每行形如 [00:00:00,100 → 00:00:03,260]（只读展示） */
const resultTimeline = ref('')
/** 仅台词/转写内容，可编辑 */
const resultPlain = ref('')
const loading = ref(false)
/** 本次 transcribe 耗时（毫秒） */
const statsProcessMs = ref(null)

const models = ref({ model: '', vad_model: '' })

const COPY_LINKS = [
  {
    label: '点击复制 ggml 模型下载页 https://huggingface.co/ggerganov/whisper.cpp',
    text: 'https://huggingface.co/ggerganov/whisper.cpp'
  },
  {
    label: '复制 VAD 模型下载页 https://huggingface.co/ggml-org/whisper-vad/tree/main',
    text: 'https://huggingface.co/ggml-org/whisper-vad/tree/main'
  },
  {
    label:
      'MP3 时会自动转为 WAV（设置里配置 ffmpeg）；手动命令：ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav',
    text: 'ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav'
  }
]

function applyStatsFromRes(res) {
  if (res?.meta?.processMs != null) {
    statsProcessMs.value = Number(res.meta.processMs)
  } else {
    statsProcessMs.value = null
  }
}

function formatProcessMs(ms) {
  if (ms == null || Number.isNaN(ms)) return '—'
  const n = Number(ms)
  if (n < 1000) return `${Math.round(n)} 毫秒`
  return `${(n / 1000).toFixed(2)} 秒`
}

const resultSummaryLine = computed(() => {
  const parts = []
  if (statsProcessMs.value != null) {
    parts.push(`处理耗时：${formatProcessMs(statsProcessMs.value)}`)
  }
  if (resultPlain.value) {
    parts.push(`纯文本 ${resultPlain.value.length} 字符`)
  }
  if (resultTimeline.value) {
    const n = resultTimeline.value.split('\n').filter(Boolean).length
    if (n) parts.push(`${n} 个时间片`)
  }
  return parts.length ? parts.join(' · ') : ''
})

function filePathBaseName(filePath) {
  if (!filePath) return ''
  const normalized = filePath.replace(/\\/g, '/')
  const i = normalized.lastIndexOf('/')
  return i >= 0 ? normalized.slice(i + 1) : normalized
}

const openFileDialog = async () => {
  const path = await window.api.chooseFile('选择音频', ['wav', 'mp3'])
  if (!path) return
  audioPath.value = path
  await convertToText(path)
}

const persistWhisperConfig = () => {
  window.api.whisperConfig({ ...models.value })
}

const chooseModelFile = async () => {
  const path = await window.api.chooseFile('选择模型', ['bin'])
  if (!path) return
  models.value.model = path
  persistWhisperConfig()
}

const chooseVadFile = async () => {
  const path = await window.api.chooseFile('选择 VAD 模型', ['bin'])
  if (!path) return
  models.value.vad_model = path
  persistWhisperConfig()
}

const copyHintLine = async (text) => {
  try {
    await copy(text)
    Message.success('已复制到剪贴板')
  } catch {
    Message.error('复制失败，请手动复制')
  }
}

/**
 * whisper 返回：字符串 / { err } / { transcription: string | [[start,end,text], ...] }
 */
function normalizeSegments(res) {
  if (res == null) return { kind: 'empty' }
  if (typeof res === 'string') {
    const text = res.trim()
    return text ? { kind: 'plain', text } : { kind: 'empty' }
  }
  if (res.err != null && String(res.err).trim() !== '') {
    return { kind: 'error', text: String(res.err).trim() }
  }
  const t = res.transcription
  if (t == null) return { kind: 'empty' }
  if (typeof t === 'string') {
    const text = t.trim()
    return text ? { kind: 'plain', text } : { kind: 'empty' }
  }
  if (Array.isArray(t)) {
    const rows = []
    for (const seg of t) {
      if (!Array.isArray(seg) || seg.length < 3) continue
      const [start, end, text] = seg
      const body = text != null ? String(text).trim() : ''
      if (!body) continue
      rows.push({ start, end, text: body })
    }
    return rows.length ? { kind: 'segments', rows } : { kind: 'empty' }
  }
  return { kind: 'empty' }
}

function applyNormalizedResult(norm) {
  resultTimeline.value = ''
  resultPlain.value = ''
  if (norm.kind === 'error') {
    resultPlain.value = norm.text
    return
  }
  if (norm.kind === 'plain') {
    resultPlain.value = norm.text
    return
  }
  if (norm.kind === 'segments') {
    resultTimeline.value = norm.rows.map((r) => `[${r.start} → ${r.end}]`).join('\n')
    resultPlain.value = norm.rows.map((r) => r.text).join('\n')
  }
}

const convertToText = async (filePath) => {
  if (!filePath) return
  loading.value = true
  resultTimeline.value = ''
  resultPlain.value = ''
  statsProcessMs.value = null

  try {
    const res = await window.api.whisperAsync(filePath)
    applyStatsFromRes(res)
    const norm = normalizeSegments(res)

    if (norm.kind === 'error') {
      Message.error(norm.text)
      applyNormalizedResult(norm)
      return
    }
    if (norm.kind === 'empty') {
      Message.warning('未得到转写结果，请检查模型与音频（WAV 为 16-bit PCM；MP3 需 ffmpeg）')
      return
    }
    applyNormalizedResult(norm)
  } catch (error) {
    console.error('转写失败:', error)
    Message.error('转写失败，请检查模型路径与音频格式')
    resultTimeline.value = ''
    resultPlain.value = ''
    statsProcessMs.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  models.value = await window.api.getWhisperConfig()
})

const copyPlainText = async () => {
  if (!resultPlain.value) return
  try {
    await copy(resultPlain.value)
    Message.success('已复制纯文本')
  } catch (err) {
    Message.error('复制失败，请手动复制')
  }
}

const copyTimelineText = async () => {
  if (!resultTimeline.value) return
  try {
    await copy(resultTimeline.value)
    Message.success('已复制时间轴')
  } catch (err) {
    Message.error('复制失败，请手动复制')
  }
}

// 另存为：默认只保存纯文本
const saveAsText = () => {
  if (!resultPlain.value) return
  const blob = new Blob([resultPlain.value], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  let fileName = '语音转写结果.txt'
  const base = filePathBaseName(audioPath.value)
  if (base) {
    fileName = `${base.replace(/\.[^/.]+$/, '')}_语音文本.txt`
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
/* 页面容器：限高 + 本页纵向滚动（不改全局 / layout） */
.asr-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 8px 12px 20px;
  overflow-x: hidden;
  overflow-y: auto;
  /* 约等于：窗口高度 − 顶栏 / 边距，保证小窗可滚完整页；顶栏高度变化时仍可接受 */
  max-height: calc(100vh - 72px);
  max-height: calc(100dvh - 72px);
}

.asr-grid {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.asr-col {
  min-width: 0;
}

/* 卡片样式 */
.left-panel,
.right-panel {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
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

.panel-header--left {
  align-items: center;
}

.panel-header--actions {
  flex-direction: column;
  align-items: stretch;
}

.panel-header__actions {
  width: 100%;
  justify-content: flex-start;
}

.panel-header__actions :deep(.arco-space-item) {
  margin-bottom: 0;
}

@media (min-width: 576px) {
  .panel-header--actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .panel-header__actions {
    width: auto;
    justify-content: flex-end;
  }
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
  min-width: 0;
  width: 100%;
}

.file-area :deep(.arco-input-search) {
  width: 100%;
  max-width: 100%;
}

.file-area :deep(.arco-input-wrapper) {
  min-width: 0;
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

.result-split {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.result-textarea {
  width: 100%;
  max-width: 100%;
}

.result-block-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 8px;
}

.result-textarea :deep(textarea) {
  background: var(--color-border-2);
  font-size: 14px;
  line-height: 1.6;
  padding: 10px;
  transition: all 0.2s;
  max-width: 100%;
  box-sizing: border-box;
}

.result-textarea :deep(textarea):focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.result-textarea--timeline :deep(textarea) {
  color: var(--color-text-2);
  font-family: ui-monospace, monospace;
  font-size: 13px;
}

.result-meta {
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-3);
  text-align: right;
  overflow-wrap: anywhere;
  word-break: break-word;
  padding-right: 6px;
}

@media (max-width: 575px) {
  .result-meta {
    text-align: left;
    padding-right: 0;
  }
}

.hint-links {
  margin-top: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.hint-line {
  cursor: pointer;
  text-align: left;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.5;
}

.hint-line:hover {
  color: var(--color-primary-6);
}
</style>
