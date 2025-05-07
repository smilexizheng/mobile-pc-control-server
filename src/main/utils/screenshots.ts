import { globalShortcut } from 'electron'
import Screenshots from 'electron-screenshots'

const screenshots = new Screenshots()
globalShortcut.register('ctrl+shift+s', () => {
  screenshots.startCapture()
})
// 点击确定按钮回调事件
screenshots.on('ok', (_, buffer, bounds) => {
  console.log('capture', buffer, bounds)
})
// 点击取消按钮回调事件
screenshots.on('cancel', () => {
  console.log('capture', 'cancel1')
})
screenshots.on('cancel', (e) => {
  // 执行了preventDefault
  // 点击取消不会关闭截图窗口
  e.preventDefault()
  console.log('capture', 'cancel2')
})
// 点击保存按钮回调事件
screenshots.on('save', (_, buffer, bounds) => {
  console.log('capture', buffer, bounds)
})
// 保存后的回调事件
screenshots.on('afterSave', (_, buffer, bounds, isSaved) => {
  console.log('capture', buffer, bounds)
  console.log('isSaved', isSaved) // 是否保存成功
})
