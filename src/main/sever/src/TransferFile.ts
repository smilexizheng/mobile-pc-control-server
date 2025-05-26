// 存储上传文件信息
import * as fs from 'fs'
import { existsSync } from 'fs'
import upath from 'upath'
import { CLIENT_EMIT_EVENTS as CE } from './constant/client-emit.js'
import { app, Notification, shell } from 'electron'
import { getAppIcon } from '../../utils/common'
import { is } from '@electron-toolkit/utils'

const uploads = new Map()
const downloadDir = !is.dev
  ? upath.join(upath.dirname(process.execPath), 'downloads')
  : app.getPath('downloads')
global.downloadDir = downloadDir
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir)
  console.log('已创建：' + downloadDir)
}
// 记录已上传文件
global.allowDownFiles = {}
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

const TransferFile = (io, socket): void => {
  // 处理文件开始传输
  socket.on(CE.FILE_START, ({ fileName, fileSize, fileId, to }) => {
    let filePath = upath.join(downloadDir, `${fileName}`)
    if (existsSync(filePath)) {
      filePath = upath.join(downloadDir, `${fileId.at(2)}_${fileName}`)
    }
    filePath += `_pending`

    uploads.set(fileId, {
      fileName,
      filePath,
      to,
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
    uploads.delete(fileId)
    upload.writeStream.end()
    const filePath = upload.filePath.replace('_pending', '')
    fs.renameSync(upload.filePath, filePath)
    socket.emit(CE.FILE_COMPLETE, fileId)
    // 聊天文件传输
    if (upload.to) {
      global.allowDownFiles[upload.id] = {
        filePath,
        fileName: upload.fileName
      }
      io.to(upload.to).emit('chat-message', {
        form: socket.id,
        msgType: 'file',
        fileId: upload.id,
        fileName: upload.fileName
      })
    } else {
      // 系统通知
      const notification = new Notification({
        title: `上传完成`,
        body: `${upload.fileName}点击查看`,
        icon: getAppIcon()
      })
      notification.on('click', () => {
        console.log(filePath)
        shell.showItemInFolder(filePath)
      })
      notification.show()
    }
  })
}

export { TransferFile }
