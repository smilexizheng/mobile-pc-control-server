import { createServer } from 'http'
import { Server } from 'socket.io'
import { registerSocketHandlers } from './src/socketEvent.js'
import startWebServer from './src/webServer.js'
import express from 'express'
import { getJobList, runJob } from './src/eventSchedule'
import { db } from './src/database'
import { ExtendedError } from 'socket.io/dist/namespace'

let io: Server
const InitWinControlServer = (port: number, hostname: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const webExpress = express()
    const httpServer = createServer(webExpress)
    startWebServer(webExpress)
    io = new Server(httpServer, {
      path: '/win-control.io',
      maxHttpBufferSize: 1024 * 1024 * 50
      // options
    })

    io.use((socket, next) => {
      const token = socket.handshake.auth.token
      const decoded = token === global.setting.token
      if (!decoded || !token) {
        const error: ExtendedError = new Error('令牌验证失败')
        error.data = { code: 401 }
        return next(error)
      }
      // 将用户信息附加到socket对象
      // socket.user = decoded;
      next()
    })

    registerSocketHandlers(io)

    // 启动定时任务
    getJobList().then((jobs) => {
      jobs.forEach((job) => {
        if (job.runOnStart) {
          runJob(job)
        }
      })
    })

    db.app.get('app:LaunchNum').then((num) => {
      num = num && typeof num === 'number' ? num : 0
      if (num < 1) {
        console.log('首次启动，初始化默认指令...')
        db.events
          .put('f6749f0c-d95b-40e8-8f9f-40ecb38b623e', {
            name: '腾旭视频',
            color: '#22bdff',
            events: [{ event: 'open-url', eventData: { url: 'https://v.qq.com/' }, delay: 0 }],
            id: 'f6749f0c-d95b-40e8-8f9f-40ecb38b623e'
          })
          .then()
        db.events
          .put('f7749f0c-d95b-40e8-8f9f-40ecb38b623e', {
            name: '移动鼠标',
            color: '#22bdff',
            events: [{ event: 'sys-pointer-move', eventData: { x: 500, y: 500 }, delay: 0 }],
            id: 'f7749f0c-d95b-40e8-8f9f-40ecb38b623e'
          })
          .then()
      }
      db.app.put('app:LaunchNum', num + 1).then()
    })

    httpServer.on('error', (err: NodeJS.ErrnoException) => {
      console.error(`Server code ${err.code}`, err)
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is occupied, trying ${port + 1}...`)
        resolve(InitWinControlServer(port + 1, hostname))
      } else if (err.code === 'EADDRNOTAVAIL') {
        resolve(InitWinControlServer(port + 1, '0.0.0.0'))
      } else {
        // process.exit(1);
        reject(err)
      }
    })

    // 启动服务器
    httpServer.listen(port, hostname, () => {
      console.log(`WinControl service running on port ${port}`)
      resolve(port)
    })
  })
}

const disconnectSockets = (): void => {
  if (!io) {
    console.error('disconnectSockets:socket.io is not running')
    return
  }
  io.emit('reconnected')
}

export { InitWinControlServer, disconnectSockets }
