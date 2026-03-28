import { ipcMain } from 'electron'
import path from 'path'
import whisper from '../../../resources/whisper/whisper.node'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import crypto from 'crypto'
import { spawnSync } from 'child_process'
import { db } from '../utils/database'

const whisperAsync = promisify(whisper.whisper)

type WhisperStore = {
  model: string | null
  vad_model: string | null
  vad?: boolean
}

/** 与 whisper.node 约定一致的公共字段（每次调用拷贝，避免改写到共享模块状态） */
const SHARED_WHISPER_FIELDS = {
  language: 'auto',
  use_gpu: true,
  flash_attn: false,
  no_prints: false,
  comma_in_time: true,
  translate: false,
  no_timestamps: false,
  detect_language: false,
  audio_ctx: 0,
  max_len: 0,
  initial_prompt: '这是中文简体 普通话。'
} as const

const VAD_EXTRA_FIELDS = {
  vad: true,
  vad_threshold: 0.5,
  vad_min_speech_duration_ms: 250,
  vad_min_silence_duration_ms: 100,
  vad_max_speech_duration_s: 30.0,
  vad_speech_pad_ms: 30,
  vad_samples_overlap: 0.1
} as const

function defaultWhisperStore(): WhisperStore {
  return {
    model: null,
    vad_model: null,
    vad: true
  }
}

function attachMeta<T extends Record<string, unknown>>(
  payload: T,
  processMs: number
): T & { meta: { processMs: number } } {
  return {
    ...payload,
    meta: { processMs }
  }
}

function runFfmpegMp3To16kWavMono(
  ffmpegExe: string,
  inputMp3: string,
  outputWav: string
): { ok: true } | { ok: false; detail: string } {
  const r = spawnSync(
    ffmpegExe,
    ['-y', '-i', inputMp3, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', outputWav],
    {
      encoding: 'utf-8',
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, LC_ALL: 'C' }
    }
  )
  if (r.status === 0) {
    return { ok: true }
  }
  const errText = [r.stderr, r.stdout].filter(Boolean).join('\n').trim().slice(-2500)
  return { ok: false, detail: errText || `ffmpeg 退出码 ${r.status ?? 'unknown'}` }
}

function whisperParamsForJob(fname_inp: string, modelPath: string, cfg: WhisperStore) {
  const vadPath = cfg.vad_model?.trim() ?? ''
  const vadAllowed = cfg.vad !== false && vadPath.length > 0 && fs.existsSync(vadPath)

  const progress = (label: string) => (p: number) => console.log(`${label}: ${p}%`)

  const base = {
    ...SHARED_WHISPER_FIELDS,
    model: modelPath.trim(),
    fname_inp,
    progress_callback: progress(vadAllowed ? 'VAD transcription' : 'Transcription')
  }

  if (vadAllowed) {
    return { ...base, ...VAD_EXTRA_FIELDS, vad_model: vadPath }
  }

  if (cfg.vad !== false && vadPath && !fs.existsSync(vadPath)) {
    console.warn('[whisper] VAD 模型未找到，已回退为非 VAD 转写:', vadPath || '(empty)')
  }

  return { ...base, vad: false }
}

const transcribeAudio = async (fname_inp: string) => {
  if (typeof fname_inp !== 'string' || !fname_inp.trim()) {
    return { err: '无效音频路径' }
  }
  const audioPath = fname_inp.trim()
  if (!fs.existsSync(audioPath)) {
    return { err: '音频文件不存在' }
  }

  const modelsConfig = db.app.get('whisper', defaultWhisperStore()) as WhisperStore
  const modelPath = modelsConfig.model?.trim()

  if (!modelPath) {
    return {
      err: '请先在 ASR 页面选择有效的 ggml 模型（.bin）'
    }
  }
  if (!fs.existsSync(modelPath)) {
    return { err: '模型文件不存在，请重新选择路径' }
  }

  const ext = path.extname(audioPath).toLowerCase()
  let tempWav: string | null = null
  let wavPathForWhisper = audioPath

  if (ext === '.mp3') {
    const ffmpegExe = global.setting?.ffmpegPath?.trim()
    if (!ffmpegExe || !fs.existsSync(ffmpegExe)) {
      return {
        err: 'MP3 需要先转换：请在「设置」中配置有效的 ffmpeg 可执行文件路径'
      }
    }
    tempWav = path.join(
      os.tmpdir(),
      `cse-asr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.wav`
    )
    console.log(tempWav)
    const conv = runFfmpegMp3To16kWavMono(ffmpegExe, audioPath, tempWav)
    if (!conv.ok) {
      if (fs.existsSync(tempWav)) {
        try {
          fs.unlinkSync(tempWav)
        } catch {
          /* ignore */
        }
      }
      return { err: `MP3 转 WAV 失败：${conv.detail}` }
    }
    wavPathForWhisper = tempWav
  } else if (ext !== '.wav') {
    return { err: '仅支持 WAV 或 MP3 文件' }
  }

  const params = whisperParamsForJob(wavPathForWhisper, modelPath, modelsConfig)
  const mode = params.vad ? 'VAD' : 'non-VAD'
  console.log(`[whisper] start (${mode})`, path.basename(audioPath))

  const t0 = Date.now()

  try {
    const raw = await whisperAsync(params)
    console.log(raw)
    const processMs = Date.now() - t0
    console.log(`[whisper] done in ${processMs}ms`)

    if (raw === null || raw === undefined) {
      return attachMeta({ err: '转写无返回' }, processMs)
    }
    if (typeof raw === 'string') {
      return attachMeta({ transcription: raw }, processMs)
    }
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      return attachMeta({ ...(raw as Record<string, unknown>) }, processMs)
    }

    return attachMeta({ transcription: String(raw) }, processMs)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const processMs = Date.now() - t0
    console.error('[whisper] failed:', msg)
    return attachMeta({ err: msg }, processMs)
  } finally {
    if (tempWav && fs.existsSync(tempWav)) {
      try {
        fs.unlinkSync(tempWav)
        console.log('[whisper] removed temp wav', path.basename(tempWav))
      } catch (err) {
        console.warn('[whisper] temp wav cleanup failed:', err)
      }
    }
  }
}

ipcMain.handle('whisper-async', async (_, fname_inp) => {
  return await transcribeAudio(fname_inp)
})

ipcMain.handle('whisper-config', async (_, config) => {
  db.app.put('whisper', {
    model: config.model,
    vad_model: config.vad_model,
    vad: true
  })
})

ipcMain.handle('get-whisper-config', async (_) => {
  return db.app.get('whisper', {
    model: '',
    vad_model: '',
    vad: true
  })
})
