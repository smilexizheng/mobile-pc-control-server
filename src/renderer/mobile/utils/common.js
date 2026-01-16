import { useWindowSize } from '@vueuse/core'
import { showNotify } from '@nutui/nutui'
import { useClipboard } from '@vueuse/core'
const { text, copy, copied, isSupported } = useClipboard()
const documentEvent = () => {
  // const {width, height} = useWindowSize()
  //
  // function setRealViewportHeight() {
  //     const vh = height.value * 0.01
  //     document.documentElement.style.setProperty('--vh', `${vh}px`)
  // }

  // 初始化设置
  // setRealViewportHeight()
  // 监听窗口变化
  // window.addEventListener('resize', setRealViewportHeight)
  // window.addEventListener('orientationchange', setRealViewportHeight)

  // IOS 默认浏览器事件，网页放大缩小等事件
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault()
  })
  document.addEventListener('dblclick', function (e) {
    e.preventDefault()
  })
  document.addEventListener('touchstart', function (event) {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  })
  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    function (event) {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false
  )
}

const posThreshold = (x, y, threshold) => {
  return Math.abs(x) > threshold || Math.abs(y) > threshold
}

// 自定义 UUID 生成函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const parseJson = (str) => {
  try {
    if (typeof str === 'string') {
      return JSON.parse(str)
    } else if (typeof str === 'object') {
      return new Function('"use strict"; return ' + str)()
    } else {
      return null
    }
  } catch (e) {
    console.error(e)
    return null
  }
}

/**
 * 是否已经超出文件限制
 * @param file
 * @returns {boolean}
 */
const overSize = (file) => {
  const maxSize = 1024 * 1024 * 50000
  const isOverSize = file.size >= maxSize
  if (isOverSize) {
    showNotify.danger(file.name + '超过50GB!')
  }
  return isOverSize
}

const useCopyToClipboard = async (val) => {
  if (!isSupported) {
    copy(val)
  } else {
    //创建input标签
    const input = document.createElement('input')
    //将input的值设置为需要复制的内容
    input.value = val
    //添加input标签
    document.body.appendChild(input)
    //选中input标签
    input.select()
    //执行复制
    document.execCommand('copy')
    //移除input标签
    document.body.removeChild(input)
  }
}

export { documentEvent, posThreshold, generateUUID, parseJson, overSize, useCopyToClipboard }
