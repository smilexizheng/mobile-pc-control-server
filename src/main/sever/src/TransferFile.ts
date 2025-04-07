// 存储上传文件信息
import * as fs from 'fs'
import { existsSync } from 'fs'
import upath from 'upath'
import { CLIENT_EMIT_EVENTS as CE } from './constant/client-emit.js'
import { app, Notification, shell } from 'electron'
import { getAppIcon } from '../../utils/common'

const uploads = new Map()
const downloadDir = app.getPath('downloads')

// 心跳检测清理僵尸任务
setInterval(
  () => {
    const now = Date.now()
    for (const [fileId, upload] of uploads) {
      if (now - upload.lastModified > 30 * 60 * 1000) {
        // 30分钟无活动
        upload.writeStream.destroy()
        fs.unlinkSync(upload.filePath)
        uploads.delete(fileId)
      }
    }
  },
  5 * 60 * 1000
) // 每5分钟检查一次

const TransferFile = (socket): void => {
  // 处理文件开始传输
  socket.on(CE.FILE_START, ({ fileName, fileSize, fileId }) => {
    // const fileId = crypto.randomUUID();

    let filePath = upath.join(downloadDir, `${fileName}`)
    if (existsSync(filePath)) {
      filePath = upath.join(downloadDir, `${fileId.at(2)}_${fileName}`)
    }
    filePath += `_pending`

    uploads.set(fileId, {
      fileName,
      filePath,
      bytesReceived: 0,
      fileSize,
      lastModified: Date.now(),
      writeStream: fs.createWriteStream(filePath)
    })

    socket.emit(CE.FILE_ACK, { fileId })
  })

  // 处理文件数据块
  socket.on(CE.FILE_CHUNK, ({ fileId, chunk }) => {
    const upload = uploads.get(fileId)
    if (!upload) return

    upload.writeStream.write(chunk)
    upload.bytesReceived += chunk.length
    upload.lastModified = Date.now()

    // 计算进度
    const progress = (upload.bytesReceived / upload.fileSize) * 100
    socket.emit(CE.FILE_PROGRESS, { fileId, progress: progress.toFixed(1) })
  })

  // 处理文件传输完成
  socket.on(CE.FILE_END, ({ fileId }) => {
    const upload = uploads.get(fileId)
    if (!upload) return

    const notification = new Notification({
      title: `上传完成`,
      body: `${upload.fileName}已上传到系统下载目录`,
      icon: getAppIcon()
    })
    notification.show()
    notification.on('click', () => {
      shell.showItemInFolder(downloadDir)
    })

    upload.writeStream.end()
    fs.renameSync(upload.filePath, upload.filePath.replace('_pending', ''))
    uploads.delete(fileId)
    socket.emit(CE.FILE_COMPLETE, fileId)
  })
}

export { TransferFile }
