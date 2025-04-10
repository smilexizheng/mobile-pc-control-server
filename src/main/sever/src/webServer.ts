import express, { Express } from 'express'
import upath from 'upath'
import { app } from 'electron'

const startWebServer = (webExpress: Express): void => {
  // const webPath = app.isPackaged
  //  ? upath.join(process.resourcesPath, 'app.asar.unpacked', 'resources','web') : upath.join(process.cwd(), 'resources','web')

  const webPath = app.isPackaged
    ? upath.join(__dirname, '../web')
    : upath.join(process.cwd(), 'out', 'web')

  // 托管静态文件（public 目录）
  webExpress.use(express.static(webPath))

  // 根路由指向 index.html
  webExpress.get(/.*/, (_, res): void => {
    res.sendFile(upath.join(webPath, 'index.html'))
  })
}

export default startWebServer
