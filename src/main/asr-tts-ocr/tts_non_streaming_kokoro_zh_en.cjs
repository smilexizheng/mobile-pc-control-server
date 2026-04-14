const sherpa_onnx = require('sherpa-onnx')
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createOfflineTts = () => {
  const offlineTtsKokoroModelConfig = {
    model: 'D:\\models\\kokoro-multi-lang-v1_1\\model.onnx',
    voices: 'D:\\models\\kokoro-multi-lang-v1_1\\voices.bin',
    tokens: 'D:\\models\\kokoro-multi-lang-v1_1\\tokens.txt',
    dataDir: 'D:\\models\\kokoro-multi-lang-v1_1\\espeak-ng-data',
    dictDir: 'D:\\models\\kokoro-multi-lang-v1_1\\dict',
    lexicon:
      'D:\\models\\kokoro-multi-lang-v1_1\\lexicon-us-en.txt,D:\\models\\kokoro-multi-lang-v1_1\\lexicon-zh.txt',
    lengthScale: 1.0
  }
  const offlineTtsModelConfig = {
    offlineTtsKokoroModelConfig: offlineTtsKokoroModelConfig,
    numThreads: 1,
    debug: 0,
    provider: 'cpu'
  }

  const offlineTtsConfig = {
    offlineTtsModelConfig: offlineTtsModelConfig,
    maxNumSentences: 1
  }

  return sherpa_onnx.createOfflineTts(offlineTtsConfig)
}

const tts = createOfflineTts()
const speakerId = 49
const speed = 1.0

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ttsHandel = (text) => {
  console.log('文字转语音')
  const start = Date.now()
  const audio = tts.generate({ text: text, sid: speakerId, speed: speed })
  const stop = Date.now()
  const elapsed_seconds = (stop - start) / 1000
  const duration = audio.samples.length / audio.sampleRate
  const real_time_factor = elapsed_seconds / duration
  console.log('Wave duration', duration.toFixed(3), 'seconds')
  console.log('Elapsed', elapsed_seconds.toFixed(3), 'seconds')
  console.log(
    `RTF = ${elapsed_seconds.toFixed(3)}/${duration.toFixed(3)} =`,
    real_time_factor.toFixed(3)
  )

  tts.save(`./${start}.wav`, audio)
  console.log(`Saved to ${start} successfully.`)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function stop() {
  tts.free()
}

// process.on('message', (message) => {
process.parentPort.on('message', (message) => {
  console.log('tts service>>>>', message)
  const data = message.data
  switch (data.cmd) {
    case 'tts':
      ttsHandel(data.text || '')
      break
    case 'stop':
      stop()
      break
    default:
      console.error(`tts no supper ${JSON.stringify(message)}`)
      break
  }
})
