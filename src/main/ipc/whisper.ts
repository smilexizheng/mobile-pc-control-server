import { ipcMain } from 'electron'
import path from 'path'
import whisper from '../../../resources/whisper/whisper.node'
import { promisify } from 'util'
import fs from 'fs'
import { getResourcePath } from '../utils/common'
import { db } from '../utils/database'
const whisperAsync = promisify(whisper.whisper)
const vadParams = {
  language: 'auto',
  model: path.join(getResourcePath(), '../models/ggml-base.bin'),
  fname_inp: path.join(__dirname, 'jfk.wav'),
  use_gpu: true,
  flash_attn: false,
  no_prints: false,
  comma_in_time: true,
  translate: false,
  no_timestamps: false,
  detect_language: false,
  audio_ctx: 0,
  max_len: 0,
  // VAD parameters
  vad: true,
  vad_model: path.join(getResourcePath(), '../models/ggml-silero-v6.2.0.bin'), // You need to download this model
  vad_threshold: 0.5,
  vad_min_speech_duration_ms: 250,
  vad_min_silence_duration_ms: 100,
  vad_max_speech_duration_s: 30.0,
  vad_speech_pad_ms: 30,
  vad_samples_overlap: 0.1,
  initial_prompt: '这是中文简体 普通话。',
  progress_callback: (progress) => {
    console.log(`VAD Transcription progress: ${progress}%`)
  }
}

// Example without VAD (traditional approach)
const traditionalParams = {
  language: 'auto',
  model: path.join(getResourcePath(), '../models/ggml-base.bin'),
  fname_inp: path.join(__dirname, 'jfk.wav'),
  use_gpu: true,
  flash_attn: false,
  no_prints: false,
  comma_in_time: true,
  translate: false,
  no_timestamps: false,
  detect_language: false,
  audio_ctx: 0,
  initial_prompt: '这是中文简体 普通话。',
  max_len: 0,
  vad: false, // Explicitly disable VAD
  progress_callback: (progress) => {
    console.log(`Traditional transcription progress: ${progress}%`)
  }
}

const transcribeAudio = async (fname_inp) => {
  const modelsConfig = db.app.get('whisper', {
    model: null,
    vad_model: null,
    vad: true
  })
  if (!modelsConfig.model) {
    return { err: '请先下载模型 Model not found,Please download the VAD model first' }
  }
  vadParams.model = modelsConfig.model
  vadParams.vad_model = modelsConfig.vad_model
  traditionalParams.model = modelsConfig.model
  vadParams.fname_inp = fname_inp
  traditionalParams.fname_inp = fname_inp
  if (!fs.existsSync(vadParams.vad_model)) {
    console.log('⚠️  VAD model not found. Please download the VAD model first:')
    console.log('   ./models/download-vad-model.sh silero-v6.2.0')
    console.log('   Or run: python models/convert-silero-vad-to-ggml.py')
    console.log('\n   Falling back to traditional transcription without VAD...\n')

    // Run without VAD
    console.log('🎵 Running traditional transcription...')
    const traditionalResult = await whisperAsync(traditionalParams)
    console.log('\n📝 Traditional transcription result:')
    console.log(traditionalResult)
    return
  }

  console.log('🎵 Running transcription with VAD enabled...')
  // console.log('VAD Parameters:')
  // console.log(`  - Threshold: ${vadParams.vad_threshold}`)
  // console.log(`  - Min speech duration: ${vadParams.vad_min_speech_duration_ms}ms`)
  // console.log(`  - Min silence duration: ${vadParams.vad_min_silence_duration_ms}ms`)
  // console.log(`  - Max speech duration: ${vadParams.vad_max_speech_duration_s}s`)
  // console.log(`  - Speech padding: ${vadParams.vad_speech_pad_ms}ms`)
  // console.log(`  - Samples overlap: ${vadParams.vad_samples_overlap}\n`)

  const startTime = Date.now()
  const vadResult = await whisperAsync(vadParams)
  const vadDuration = Date.now() - startTime

  console.log('\n✅ VAD transcription completed!')
  console.log(`⏱️  Processing time: ${vadDuration}ms`)
  console.log('\n📝 VAD transcription result:')
  console.log(vadResult)

  return vadResult
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
