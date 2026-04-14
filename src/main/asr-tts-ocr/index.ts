import ChildProcessManager from './child_process_manager'
import ASRPath from './asr_streaming_paraformer.cjs?asset'
import TTSPath from './tts_non_streaming_kokoro_zh_en.cjs?asset'
// import test from './test.js?asset'

// 关键词识别
// https://github.com/k2-fsa/sherpa-onnx/releases/tag/kws-models

// https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
// https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
const InitAsrTts = (): void => {
  // 麦克风流式语音监听
  const asrProcess = new ChildProcessManager(ASRPath)
  // asrProcess.start()
  asrProcess.on('started', () => {
    console.log('asr启动')
  })

  asrProcess.on('message', (e) => {
    // TODO 语音唤醒，其他指令动作
    console.error('语音响应', e)
  })
  global.asrProcess = asrProcess
  // 文字转语音
  const ttsProcess = new ChildProcessManager(TTSPath)
  // ttsProcess.start()
  // ttsProcess.send({ cmd: 'tts', text: '这是中文，this is a dog,你觉得效果如何？' })
  global.ttsProcess = ttsProcess
}

export { InitAsrTts }
