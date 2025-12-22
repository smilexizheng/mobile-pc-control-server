// Copyright (c)  2023  Xiaomi Corporation (authors: Fangjun Kuang)
//
import portAudio from 'naudiodon2'

// console.log(portAudio.getDevices())

import sherpa_onnx from 'sherpa-onnx'

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

const recognizer = createOnlineRecognizer()
const stream = recognizer.createStream()

let lastText = ''
let segmentIndex = 0

const ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 1,
    closeOnError: true, // Close the stream if an audio error is detected, if
    // set false then just log the error
    deviceId: -1, // Use -1 or omit the deviceId to select the default device
    sampleFormat: portAudio.SampleFormatFloat32,
    sampleRate: recognizer.config.featConfig.sampleRate,
    framesPerBuffer: 4096
  }
})

ai.on('data', (data) => {
  const samples = new Float32Array(data.buffer)

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
    }

    text = recognizer.getResult(stream).text // Get the updated result after padding
  }

  if (text.length > 0 && lastText !== text) {
    lastText = text
    console.log(segmentIndex, lastText)
  }
  if (isEndpoint) {
    if (text.length > 0) {
      lastText = text
      segmentIndex += 1
      handleCommand(lastText)
    }
    recognizer.reset(stream)
  }
})

ai.on('close', () => {
  console.log('ai is close ,Free resources')
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

ai.start()
console.log('Started! Please speak')

process.on('message', (message) => {
  console.log('asr service>>>>', message)
  switch (message.cmd) {
    case 'stop':
      ai.quit()
      stream.free()
      recognizer.free()
      break
    default:
      console.error(`tts no supper ${message}`)
      break
  }
})
