// 存储上传文件信息
import * as fs from "fs";
import upath from "upath";
import {existsSync} from "fs";
import {CLIENT_EMIT_EVENTS as CE} from "./constant/client-emit.js";
import {app, Notification,shell} from "electron";
import {getAppIcon} from "../../utils/common";

const uploads = new Map();
const downloadDir = app.getPath('downloads');
const TransferFile = (socket) => {
  // 处理文件开始传输
  socket.on(CE.FILE_START, ({fileName, fileSize, fileId}) => {
    // const fileId = crypto.randomUUID();

    let filePath = upath.join(downloadDir, `${fileName}`);
    if (existsSync(filePath)) {
      filePath = upath.join(downloadDir, `${fileId.at(2)}_${fileName}`);
    }

    uploads.set(fileId, {
      fileName,
      filePath,
      bytesReceived: 0,
      fileSize,
      writeStream: fs.createWriteStream(filePath)
    });

    socket.emit(CE.FIlE_ACK, {fileId});
  });

  // 处理文件数据块
  socket.on(CE.FIlE_CHUNK, ({fileId, chunk}) => {
    const upload = uploads.get(fileId);
    if (!upload) return;

    upload.writeStream.write(chunk);
    upload.bytesReceived += chunk.length;

    // 计算进度
    const progress = (upload.bytesReceived / upload.fileSize) * 100;
    socket.emit(CE.FIlE_PROGRESS, {fileId, progress: progress.toFixed(1)});
  });

  // 处理文件传输完成
  socket.on(CE.FIlE_END, ({fileId}) => {
    const upload = uploads.get(fileId);
    if (!upload) return;

    const notification = new Notification({
      title: `上传完成`,
      body: `${upload.fileName}已上传到系统下载目录`,
      icon: getAppIcon()
    });
    notification.show()
    notification.on('click', () => {
      shell.openPath(downloadDir).then()
    });

    upload.writeStream.end();
    uploads.delete(fileId);
    socket.emit(CE.FIlE_COMPLETE, fileId);
  });

}

export {TransferFile}
