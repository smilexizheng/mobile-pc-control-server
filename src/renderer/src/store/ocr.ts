import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { OcrResult } from '@renderer/env'
import { createKeybindingsHandler } from 'tinykeys'
import { useResizeObserver, useToggle, useMouseInElement, useScroll } from '@vueuse/core'
import { useSystemStore } from '@renderer/store/system'
import { Message } from '@arco-design/web-vue'

type WH = { width: number; height: number }

export const useOcrStore = defineStore('ocr', () => {
  const systemStore = useSystemStore()

  window.electron.ipcRenderer.on('ocr-result', (_, result) => {
    toggleLoading()
    toggle()
    const box = JSON.parse(result)
    if (box.code === 100) {
      ocrResult.value = box.data
    } else {
      Message.error(box.data)
    }
  })

  window.electron.ipcRenderer.on('ocr-screenshots-success', (_, path) => {
    ocrImage(path)
  })

  const mainLayerDiv = ref<HTMLDivElement | null>(null)
  const scrollDiv = ref<HTMLDivElement | null>(null)
  const { elementX: layerDivX, elementY: layerDivY } = useMouseInElement(mainLayerDiv)
  const { x: divScrollX, y: divScrollY } = useScroll(scrollDiv)

  const mainLayerWH = ref<WH>({ width: 0, height: 0 })
  // 缩放倍数
  const scale = ref<number>(100)
  const realScale = computed(() => {
    return scale.value / 100
  })

  useResizeObserver(document.documentElement, (): void => {
    calcScale()
  })

  const calcScale = (): void => {
    if (mainLayerDiv.value) {
      const { clientWidth, clientHeight } = mainLayerDiv.value
      mainLayerWH.value = { width: clientWidth, height: clientHeight }
    }

    if (image.value && mainLayerWH.value) {
      const { width, height } = mainLayerWH.value
      // 计算宽度缩放比例
      const widthScale = width / image.value.width
      // 计算高度缩放比例
      const heightScale = height / image.value.height
      // 选择较小的缩放比例，以确保图像适应画布比例
      const newScale = Math.round(Math.min(widthScale, heightScale) * 100)
      // 设置缩放比例
      setScale(newScale)
    }
  }

  /**
   * 快捷键处理
   */
  const shortcutKeyHandler = createKeybindingsHandler({
    '$mod+KeyV': async () => {
      const path = await window.electron.ipcRenderer.invoke('cor-clipboard-readImage')
      // console.log(imageBase64)
      // if (imageBase64) {
      //   loadImage(imageBase64)
      //   ocrRecognition(imageBase64)
      // }
      console.log(path)
      ocrImage(path)
    }
  })

  /**
   * 设置缩放比例
   * @param newScale 新的缩放比例
   */
  const setScale = (newScale: number): void => {
    // 当前缩放比例
    const prevScale = scale.value
    const { x, y } = layerConfig.value
    // 限制缩放比例在合理范围内
    scale.value = Math.max(10, Math.min(2000, newScale))

    if (image.value) {
      // 计算鼠标在图像中的绝对位置
      const mouseX = layerDivX.value
      const mouseY = layerDivY.value
      const mouseImageX = (mouseX - x + divScrollX.value) / prevScale
      const mouseImageY = (mouseY - y + divScrollY.value) / prevScale

      // 计算新的滚动位置
      const newScrollX = mouseImageX * scale.value - (mouseX - layerConfig.value.x)
      const newScrollY = mouseImageY * scale.value - (mouseY - layerConfig.value.y)
      // console.log(newScrollX, newScrollY)
      nextTick(() => {
        divScrollX.value = newScrollX
        divScrollY.value = newScrollY
      }).then()
    }
  }

  const setMainLayer = (ref: HTMLDivElement): void => {
    mainLayerDiv.value = ref
  }

  const setScrollDivRef = (ref: HTMLDivElement): void => {
    scrollDiv.value = ref
  }

  //ocr的处理的图片
  const image = ref()

  // ocr结果
  const ocrResult = ref<OcrResult>([])
  // 显示ocr的结果
  const [showOcr, toggle] = useToggle(true)
  // 是否正在处理ocr图片
  const [isLoading, toggleLoading] = useToggle(false)

  // 图片放大缩小的实际宽高
  const ocrImageWH = computed<WH>(() => {
    return {
      width: image.value ? image.value.width * realScale.value : 0,
      height: image.value ? image.value.height * realScale.value : 0
    }
  })

  const stageConfig = computed<WH>(() => {
    if (!image.value) {
      return { ...mainLayerWH.value }
    }

    return {
      width: Math.max(ocrImageWH.value.width, mainLayerWH.value.width) || 0,
      height: Math.max(ocrImageWH.value.height, mainLayerWH.value.height) || 0
    }
  })

  const layerConfig = computed(() => {
    let offsetX = divScrollX.value / realScale.value
    let offsetY = divScrollY.value / realScale.value
    // console.log(divScrollX.value, divScrollY.value, realScale.value, offsetY, offsetX)
    if (isNaN(offsetX)) {
      offsetX = 0
    }
    if (isNaN(offsetY)) {
      offsetY = 0
    }

    const x =
      ocrImageWH.value.width >= stageConfig.value.width
        ? 0
        : (stageConfig.value.width - ocrImageWH.value.width) / 2

    const y =
      ocrImageWH.value.height >= stageConfig.value.height
        ? 0
        : (stageConfig.value.height - ocrImageWH.value.height) / 2

    return {
      x,
      y,
      offsetX: offsetX,
      offsetY: offsetY,
      width: ocrImageWH.value.width,
      height: ocrImageWH.value.height,
      left: divScrollX.value,
      top: divScrollY.value
    } as {
      x: number
      y: number
      offsetX: number
      offsetY: number
      width: number
      height: number
      left: number
      top: number
    }
  })

  /**
   * 字体大小 = 容器高度 × 比例系数（推荐 0.4-0.6）
   * @param boxHeight
   */
  const dynamicFontSize = (boxHeight: number): number => {
    return Math.max(
      Math.min(Math.trunc(boxHeight * 0.4), 30), // 最大24px
      12 // 最小8px
    )
  }

  // 发送ocr识别
  const ocrRecognition = (img): void => window.electron.ipcRenderer.send('ocr-recognition', img)
  // 截取屏幕
  const ocrScreenshots = (): void => window.electron.ipcRenderer.send('ocr-screenshots')
  const copyText = (text): void => {
    if (window.api.copyText(text)) {
      Message.success('已复制到粘贴板')
    } else {
      Message.error('复制文字失败')
    }
  }

  const copyAllText = (): void => {
    copyText(ocrResult.value.map((item) => item.text).join('\n'))
  }

  /**
   * 加载图片，并开始ocr识别
   * @param path
   */
  const ocrImage = (path: string): void => {
    const imgSrc = `disk:///${path}`
    if (imgSrc) {
      loadImage(imgSrc)
      ocrRecognition(path)
    }
  }

  const loadImage = (imgSrc): void => {
    const img = new Image()
    img.onload = (): void => {
      toggleLoading()
      showOcr.value = false
      image.value = img
      calcScale()
      ocrResult.value = []
    }
    img.src = imgSrc
  }

  /**
   * 选择ocr的图片
   */
  const chooseFile = async (): Promise<void> => {
    const img = await systemStore.chooseFile('打开图片', ['png', 'jpg', 'jpeg'])
    if (img) {
      ocrImage(img)
    }
  }

  /**
   * 滚轮事件
   * @param e
   */
  const wheelHandler = (e: WheelEvent): void => {
    //  todo 某些情况 禁止滚动条滚动
    // if () {e.preventDefault()return}

    const up = e.deltaY < 0
    // ctrl+滚轮 缩放大小
    if (e.ctrlKey || e.metaKey) {
      setScale(up ? scale.value + 10 : scale.value - 10)
    } else {
      divScrollX.value = divScrollX.value + e.deltaX
      divScrollY.value = divScrollY.value + e.deltaY
    }
  }

  return {
    scale,
    realScale,
    mainLayerWH,
    setMainLayer,
    setScrollDivRef,
    stageConfig,
    image,
    ocrResult,
    showOcr,
    isLoading,
    layerConfig,
    copyText,
    ocrScreenshots,
    copyAllText,
    toggle,
    toggleLoading,
    chooseFile,
    wheelHandler,
    dynamicFontSize,
    shortcutKeyHandler
  }
})
