import { spawn } from 'child_process'
import { app } from 'electron'
import upath from 'upath'

// import {createWriteStream} from "fs";

// const file = createWriteStream("capture.flv");

let childProcess

let header = null
const sendHeader = (io, socket): void => {
  console.log(header, childProcess?.pid)
  if (childProcess && header) {
    socket.emit('flv_data', header)
  } else {
    console.log('服务启动中')
    startScreenLive(io)
  }
}

const startScreenLive = (io): void => {
  if (childProcess) return
  const ffmpegPath = app.isPackaged
    ? upath.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'ffmpeg.exe')
    : upath.join(process.cwd(), 'resources', 'ffmpeg.exe')

  childProcess = spawn(
    ffmpegPath,
    [
      '-f',
      'gdigrab',
      '-i',
      'desktop',
      '-vcodec',
      'libx264',
      '-preset',
      'ultrafast',
      '-g',
      '30',
      '-tune',
      'zerolatency',
      '-f',
      'flv', // 指定容器为 FLV
      'pipe:1' // 输出到 stdout
    ],
    { stdio: 'pipe' }
  )

  const stream = childProcess.stdout

  // stream.pipe(file);

  // 处理捕获的流数据
  stream.on('data', (data) => {
    if (!io.sockets.adapter.rooms.has('screenlive')) {
      stopScreenLive()
    }

    if (!header) {
      header = data
    }
    // 处理视频流数据
    // console.log('Received video data:', data.length)
    io.to('screenlive').emit('flv_data', data)
  })

  stream.on('end', () => {
    console.log('Stream ended')
  })

  childProcess.on('error', (error) => {
    console.error('Error:', error)
  })

  childProcess.on('close', (code) => {
    console.log('FFmpeg childProcess exited with code:', code)
  })
}

const stopScreenLive = (): void => {
  if (childProcess) {
    header = null
    childProcess.kill()
    childProcess = null
  }
}

export { stopScreenLive, startScreenLive, sendHeader }
