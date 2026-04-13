const Decibri = require('decibri')
// 列出可用设备调试
// console.log('Available devices:', Decibri.devices())
const sherpa_onnx = require('sherpa-onnx')
// 语音 转文字 流式识别
// https://github.com/csukuangfj/sherpa-onnx/blob/master/nodejs-addon-examples/test_asr_streaming_paraformer_microphone.js
function createOnlineRecognizer() {
  let onlineParaformerModelConfig = {
    encoder: 'D:\\models\\sherpa-onnx-streaming-paraformer-bilingual-zh-en\\encoder.int8.onnx',
    decoder: 'D:\\models\\sherpa-onnx-streaming-paraformer-bilingual-zh-en\\decoder.int8.onnx'
  }

  let onlineModelConfig = {
    paraformer: onlineParaformerModelConfig,
    tokens: 'D:\\models\\sherpa-onnx-streaming-paraformer-bilingual-zh-en\\tokens.txt'
  }

  let recognizerConfig = {
    modelConfig: onlineModelConfig,
    enableEndpoint: 1,
    rule1MinTrailingSilence: 2.4,
    rule2MinTrailingSilence: 1.2,
    rule3MinUtteranceLength: 20
  }
  return sherpa_onnx.createOnlineRecognizer(recognizerConfig)
}

// 关键词识别
function createKeywordSpotter() {
  // https://github.com/k2-fsa/sherpa-onnx/releases/tag/kws-models
  const config = {
    featConfig: {
      sampleRate: 16000,
      featureDim: 80
    },
    modelConfig: {
      transducer: {
        encoder:
          'D:\\models\\sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20\\encoder-epoch-13-avg-2-chunk-16-left-64.onnx',
        decoder:
          'D:\\models\\sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20\\decoder-epoch-13-avg-2-chunk-16-left-64.onnx',
        joiner:
          'D:\\models\\sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20\\joiner-epoch-13-avg-2-chunk-16-left-64.onnx'
      },
      tokens: 'D:\\models\\sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20\\tokens.txt'
    },
    keywords: 'w én s ēn t è k ǎ s uǒ  @文森特卡索\n' + 'f ǎ g uó @法国'
  }
  return sherpa_onnx.createKws(config)
}

const recognizer = createOnlineRecognizer()
const stream = recognizer.createStream()
//
const kws = createKeywordSpotter()
const kwsStream = kws.createStream()
console.log(kwsStream)

let lastText = ''
let segmentIndex = 0
console.log(recognizer.config)
const mic = new Decibri({
  sampleRate: recognizer.config.featConfig.sampleRate || 16000,
  channels: 1,
  deviceId: -1 // -1 = 默认麦克风
  // format: 'float32'
})
process.parentPort.postMessage({ cmd: 'txt', data: '开始进行语音识别' })
mic.on('data', (chunk) => {
  try {
    if (!chunk || chunk.length === 0) {
      console.warn('收到空音频块，跳过')
      return
    }
    if (chunk.length % 2 !== 0) {
      console.warn(`异常长度: ${chunk.length} bytes`)
      return
    }

    // ===  decibri 的 Int16 Buffer ===
    const int16 = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2)
    const samples = new Float32Array(int16.length)

    for (let i = 0; i < int16.length; i++) {
      samples[i] = int16[i] / 32768.0
    }

    if (!samples || samples.length === 0) return
    kwsStream.acceptWaveform(kws.config.featConfig.sampleRate, samples)
    //
    while (kws.isReady(kwsStream)) {
      kws.decode(kwsStream)
      const keyword = kws.getResult(stream).keyword

      if (keyword != '') {
        console.log(keyword)
        process.parentPort.postMessage({ cmd: 'txt', data: keyword })
        // remember to reset the stream right after detecting a keyword
        kws.reset(kwsStream)
      }
    }

    stream.acceptWaveform(recognizer.config.featConfig.sampleRate, samples)

    while (recognizer.isReady(stream)) {
      recognizer.decode(stream)
    }

    const isEndpoint = recognizer.isEndpoint(stream)
    let text = recognizer.getResult(stream).text

    if (isEndpoint) {
      // Add tail padding for Paraformer models to ensure the last word/character is recognized
      const tailPaddingLength = 0.4 // Adjust if needed (0.3-0.5 seconds often works well)
      const tailPadding = new Float32Array(
        recognizer.config.featConfig.sampleRate * tailPaddingLength
      )
      stream.acceptWaveform(recognizer.config.featConfig.sampleRate, tailPadding)

      while (recognizer.isReady(stream)) {
        recognizer.decode(stream)

        text = recognizer.getResult(stream).text // Get the updated result after padding
      }
    }

    if (text.length > 0 && lastText !== text) {
      lastText = text
      console.log(segmentIndex, lastText)
    }
    if (isEndpoint) {
      if (text.length > 0) {
        lastText = text
        segmentIndex += 1
        process.parentPort.postMessage({ cmd: 'txt', data: lastText })
        handleCommand(lastText)
      }
      recognizer.reset(stream)
    }
  } catch (err) {
    console.error('处理音频帧异常:', err)
  }
})

mic.on('close', () => {
  console.log('mic is close ,Free resources')
})
mic.on('error', (err) => {
  console.error('Microphone error:', err)
})

let isAwake = false // 是否已唤醒

let wakeTimeout = null // 用于控制超时的定时器

// 重置唤醒状态定时器
function resetWakeTimeout() {
  // 清除之前的定时器（避免重复触发）
  if (wakeTimeout) {
    clearTimeout(wakeTimeout)
    wakeTimeout = null
  }
  // 设置新的 5 秒超时定时器
  wakeTimeout = setTimeout(() => {
    isAwake = false
    console.log('唤醒超时，已退出指令模式')
  }, 5000) // 5000 毫秒 = 5 秒
}

function handleCommand(text) {
  // 检测唤醒词 "小爱同学"
  console.log('监听语音' + text)
  if (!isAwake && text.includes('小爱同学')) {
    isAwake = true
    console.log('唤醒成功，请说出指令...')
    resetWakeTimeout() // 唤醒后启动超时定时器
    return
  }

  // 如果已唤醒，处理命令
  if (isAwake) {
    // 重置超时定时器（每次交互后重新计时5秒）
    resetWakeTimeout()
    if (text.includes('打开空调')) {
      execCommand('turn_on_ac')
    } else if (text.includes('关闭空调')) {
      execCommand('turn_off_ac')
    } else if (text.includes('打开窗帘')) {
      execCommand('open_curtain')
    } else if (text.includes('关闭窗帘')) {
      execCommand('close_curtain')
    } else {
      console.log('未识别的指令')
    }
  }
}

// 模拟执行设备操作
function execCommand(command) {
  console.log(`执行命令: ${command}`)
  global.ttsProcess?.send({ cmd: 'tts', text: command })
}

console.log('Started! Please speak')

process.on('message', (message) => {
  console.log('asr service>>>>', message)
  switch (message.cmd) {
    case 'stop':
      mic.stop()
      stream.free()
      recognizer.free()
      break
    default:
      console.error(`tts no supper ${message}`)
      break
  }
})
