import { createServer } from 'http'
import { Server } from 'socket.io'
import { registerSocketHandlers } from './src/socketEvent.js'
import startWebServer from './src/webServer.js'
import express from 'express'
import { getJobList, runJob } from './src/eventSchedule'

const InitWinControlServer = (port: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const webExpress = express()
    const httpServer = createServer(webExpress)
    startWebServer(webExpress)
    const io = new Server(httpServer, {
      path: '/win-control.io',
      maxHttpBufferSize: 1024 * 1024 * 50
      // options
    })

    io.use((socket, next) => {
      const token = socket.handshake.auth.token
      const decoded = token === global.ssss
      if (!decoded || !token) {
        return next(new Error('认证失败：无效的令牌'))
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

    httpServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is occupied, trying ${port + 1}...`)
        resolve(InitWinControlServer(port + 1))
      } else {
        console.error('Server error:', err)
        // process.exit(1);
        reject(err)
      }
    })

    // 启动服务器
    httpServer.listen(port, () => {
      console.log(`WinControl service running on port ${port}`)
      resolve(port)
    })
  })
}

export { InitWinControlServer }
