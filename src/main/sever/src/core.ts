import { Key, keyboard, mouse, Point } from '@nut-tree-fork/nut-js'

import { Monitor } from 'node-screenshots'
import sharp from 'sharp'
import { clipboard } from 'electron'
import { spawn } from 'child_process'
import { CLIENT_EMIT_EVENTS as CE } from './constant/client-emit'
import { shutdown } from './system'
// import { WinApi } from './utils/win-api'
// import screenshot  from 'screenshot-desktop'
// import indexNode from './index.node'
// console.log(indexNode)
// indexNode.captureScreen()

mouse.config.autoDelayMs = 10
keyboard.config.autoDelayMs = 10

// 参数校验函数
const validateParams = (data, fields): void => {
  const missingParams = fields.filter((field) => !data[field])
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`)
  }
}

const keyPressHandle = async (data): Promise<void> => {
  validateParams(data, ['key']) // 假设需要key参数
  // console.log(typeof  data.key)
  // if (typeof data.key === 'number') {
  //   await keyboard.type(data.key)
  // } else {
  await keyboard.pressKey(...data.key)
  await keyboard.releaseKey(...data.key)
  // }
}

const keyToggleHandle = async (data): Promise<void> => {
  console.log(data)
  validateParams(data, ['key']) // 假设需要key参数
  if (data.down) {
    await keyboard.pressKey(...data.key)
  } else {
    await keyboard.releaseKey(...data.key)
  }
}

const openUrlHandler = (data): void => {
  validateParams(data, ['url'])
  openUrl(data.url) // 假设open返回Promise
}

const openAppHandler = async (): Promise<void> => {
  // todo 打开系统应用
  console.error('暂不支持打开系统应用')
  // validateParams(data, ['name']);
  // await openApp(data.name);  // 假设openApp返回Promise
}

/**
 * 自动输入前端输出内容
 * <p>
 * now use Electron clipboard
 * \node_modules\@nut-tree-fork\default-clipboard-provider\node_modules\clipboardy\lib\windows.js
 * const windowBinaryPath = arch() === 'x64' ?(app.isPackaged ? path.join(process.resourcesPath, '\\app.asar.unpacked\\node_modules\\@nut-tree-fork\\default-clipboard-provider\\node_modules\\clipboardy\\fallbacks\\windows\\clipboard_x86_64.exe') : path.join(__dirname, '../fallbacks/windows/clipboard_x86_64.exe'))	 : (app.isPackaged ? path.join(process.resourcesPath, '\\app.asar.unpacked\\node_modules\\@nut-tree-fork\\default-clipboard-provider\\node_modules\\clipboardy\\fallbacks\\windows\\clipboard_i686.exe') : path.join(__dirname, '../fallbacks/windows/clipboard_i686.exe'));
 *
 *
 * @param data
 * @returns {Promise<void>}
 */
const typeString = async (data): Promise<void> => {
  clipboard.writeText(data.val.toString())
  await keyPressHandle({ key: [Key.LeftControl, Key.V] })
  if (data.enter) {
    await keyPressHandle({ key: [Key.Enter] })
  }
  clipboard.writeText('')
}

const openUrl = (url): void => {
  const subprocess = spawn('cmd.exe', ['/c', 'start', '""', url], {
    detached: true, // 让子进程独立
    stdio: 'ignore', // 忽略 IO
    windowsHide: true
  })
  subprocess.unref()
}

const getMousePos = async (): Promise<Point> => {
  return await mouse.getPosition()
}

const mouseClick = async (button, doubleClick): Promise<void> => {
  if (!doubleClick) {
    await mouse.click(button)
  } else {
    await mouse.doubleClick(button)
  }
}

const mouseToggle = async (isPress, button): Promise<void> => {
  if (isPress) {
    await mouse.pressButton(button)
  } else {
    await mouse.releaseButton(button)
  }
}

const moveMouse = async (point: Point[]): Promise<void> => {
  await mouse.move(point)
  // WinApi.moveMouse(point[0].x, point[0].y)
}

const grabRegion = async (mouseX, mouseY, captureWidth, captureHeight): Promise<object> => {
  // 确定鼠标所在的显示器
  const monitor = Monitor.fromPoint(mouseX, mouseY)
  if (!monitor) {
    throw new Error('鼠标不在任何已知显示器区域内')
  }
  // 解析显示器参数（根据实际数据结构调整属性名）
  const displayX = monitor.x
  const displayY = monitor.y
  const displayWidth = monitor.width
  const displayHeight = monitor.height

  // 检查显示器是否足够大
  if (displayWidth < captureWidth || displayHeight < captureHeight) {
    throw new Error('显示器分辨率不足以截取指定大小的区域')
  }

  // 计算初始截图区域的左上角坐标
  let startX = mouseX - captureWidth / 2
  let startY = mouseY - captureHeight / 2
  const beforeX = startX
  const beforeY = startY
  // 计算截图区域的边界坐标
  // console.log(startX, startY, currentDisplay)
  // 调整坐标确保在显示器范围内
  startX = Math.max(startX, displayX)
  startX = Math.min(startX, displayX + displayWidth - captureWidth)

  startY = Math.max(startY, displayY)
  startY = Math.min(startY, displayY + displayHeight - captureHeight)

  const img = monitor.captureImageSync()

  let left = 0,
    top = 0
  if (startX !== beforeX || startY !== beforeY) {
    if (beforeX > startX) {
      left = startX + captureWidth / 2 - mouseX
    } else {
      left = startX + captureWidth / 2 - mouseX
    }

    if (beforeY > startY) {
      top = startY + captureHeight / 2 - mouseY
    } else {
      top = startY + captureHeight / 2 - mouseY
    }
  }

  // return {left,right,top,bottom
  //     ,buffer: (await img.crop(startX < 0 ? monitor.width - (Math.abs(startX)) : startX, startY, captureWidth, captureHeight)).toJpegSync()};

  startX = Math.round(startX < 0 ? monitor.width - Math.abs(startX) : startX)
  startY = Math.round(startY)
  return {
    left,
    right: 0,
    top,
    bottom: 0,
    screenWidth: img.width,
    screenHeight: img.height,
    x: startX,
    y: startY,
    image: await sharp(img.toRawSync(), {
      raw: { width: img.width, height: img.height, channels: 4 }
    })
      .extract({
        left: startX,
        top: startY,
        width: captureWidth,
        height: captureHeight
      })
      .toFormat('webp', { quality: 30 })
      .toBuffer()
  }
}

const eventHandler = (e: SocketEvent): void => {
  const data: EventData | undefined = e.eventData
  if (!data) return
  switch (e.event) {
    case CE.KEYPRESS:
      keyPressHandle(data).then()
      break
    case CE.SYS_POINTER_MOVE:
      if (!data.x || !data.y) break
      mouse.move([{ x: data.x, y: data.y }]).then()
      break
    case CE.SYS_MOUSE_CLICK:
      mouseClick(data.button, data.double).then()
      break
    case CE.TYPING:
      typeString(data).then()
      break
    case CE.OPEN_URL:
      openUrlHandler(data)
      break
    case CE.SYS_SHUTDOWN:
      shutdown(data, null)
      break
    default:
      console.log(`schedule event type ${e.event} is not supported`)
      break
  }
}

export {
  eventHandler,
  getMousePos,
  moveMouse,
  mouseClick,
  mouseToggle,
  grabRegion,
  openAppHandler,
  openUrlHandler,
  keyPressHandle,
  typeString,
  keyToggleHandle
}
