import { defineStore } from 'pinia'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { OcrResult } from '@renderer/env'
import { createKeybindingsHandler } from 'tinykeys'
import { useResizeObserver, useToggle, useMouseInElement, useScroll } from '@vueuse/core'
import { useSystemStore } from '@renderer/store/system'
import { Message } from '@arco-design/web-vue'
import Konva from 'konva'
import { useDrawRectStore } from '@renderer/store/ocr/DrawRectStore'
import { copyText } from '@renderer/utils/util'

import { DrawMode, WH, IChildDrawStore, ShapeType } from '@renderer/store/ocr/type'
import { useDrawCircleStore } from '@renderer/store/ocr/DrawCircleStore'
import { useDrawArrowStore } from '@renderer/store/ocr/DrawArrowStore'

type ChildStoreGetter = () => IChildDrawStore

export const useOcrStore = defineStore('ocr', () => {
  const transformer = useTemplateRef<Konva.Transformer>('transformer')
  const stageRef = useTemplateRef<Konva.Stage>('stage')
  const selectShapeId = ref<Array<number>>([])
  const layerRef = ref<Konva.Layer | null>()

  const modeType: Array<DrawMode> = [
    {
      shape: 'rect',
      label: '矩形'
    },
    {
      shape: 'circle',
      label: '圆圈'
    },
    {
      shape: 'arrow',
      type: 'straight',
      label: '直线箭头'
    },
    {
      shape: 'arrow',
      type: 'curved',
      label: '曲线箭头'
    }
  ]
  // 开启涂鸦
  const graffitiMode = ref(true)
  // 涂鸦绘制模式
  const currentMode = ref<DrawMode>(modeType[0])
  const storeMap: Record<ShapeType, ChildStoreGetter> = {
    rect: () => useDrawRectStore() as IChildDrawStore,
    circle: () => useDrawCircleStore() as IChildDrawStore,
    arrow: () => useDrawArrowStore() as IChildDrawStore
  }
  const drawStore = ref<IChildDrawStore | null>(storeMap[currentMode.value.shape]())
  const setDrawMode = (newMode: DrawMode): void => {
    currentMode.value = newMode
    drawStore.value = storeMap[newMode.shape]()

    if (newMode.type) {
      drawStore.value?.setShapeType(newMode!.type)
    }
  }

  const ipcRenderer = window.electron.ipcRenderer

  ipcRenderer.on('ocr-result', (_, result) => {
    toggleLoading()
    const box = JSON.parse(result)
    if (box.code === 100) {
      ocrResult.value = box.data
    } else if (showOcr.value) {
      Message.error(box.data)
    }
  })

  ipcRenderer.on('ocr-screenshots-success', (_, path) => {
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
    },
    delete: () => {
      if (layerRef.value && selectShapeId.value) {
        const children = layerRef.value.getChildren()
        const nodes = children?.filter((child) => selectShapeId.value.includes(child._id))
        nodes.forEach((node) => {
          const id = node.attrs.id
          if (id.indexOf('draw') > -1) {
            drawStore.value?.remove(+id.match(/\d+$/)?.[0] || 0)
          }
          node.destroy()
        })
        selectShapeId.value = []
        layerRef.value.draw()
      }
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
      image.value = img
      calcScale()
      ocrResult.value = []
      drawStore.value?.removeAll()
    }
    img.src = imgSrc
  }

  /**
   * 选择ocr的图片
   */
  const chooseFile = async (): Promise<void> => {
    const systemStore = useSystemStore()
    const img = await systemStore.chooseFile('打开图片', ['png', 'jpg', 'jpeg'])
    if (img) {
      ocrImage(img)
    }
  }

  /**
   * canvas外层div滚轮事件
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

  // 鼠标按下
  const stageMouseDown = (e: Konva.KonvaPointerEvent): void => {
    console.log('stageMouseDown', e)
    // 开启涂鸦模式
    if (graffitiMode.value) {
      drawStore.value?.startDrawing(e)
    }
  }
  // 鼠标移动
  const stageMouseMove = (e: Konva.KonvaPointerEvent): void => {
    // console.log('stageMouseMove', e)
    if (graffitiMode.value) {
      drawStore.value?.updateDrawing(e)
    }
  }
  //鼠标抬起
  const stageMouseUp = (e: Konva.KonvaPointerEvent): void => {
    console.log('stageMouseUp', e)
    if (graffitiMode.value) {
      // 结束绘制
      drawStore.value?.endDrawing(e)
      //
      drawStore.value?.resetDrawing()
    }
  }
  // 鼠标点击
  const stageClick = (e: Konva.KonvaPointerEvent): void => {
    const layer = e.target.getLayer()
    console.log(e.target.attrs.id)
    // if clicked  on  rectangles
    if (e.target.attrs.id && e.target.attrs.id.indexOf('draw') > -1) {
      layerRef.value = layer
      // do we pressed shift or ctrl?
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey
      const clickedId = e.target._id
      const isSelected = selectShapeId.value.includes(clickedId)
      // console.log(selectShapeId.value, clickedId, metaPressed, isSelected)
      if (!metaPressed && !isSelected) {
        // if no key pressed and the node is not selected
        // select just one
        selectShapeId.value = [clickedId]
      } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        selectShapeId.value = selectShapeId.value.filter((id) => id !== clickedId)
      } else if (metaPressed && !isSelected) {
        // add the node into selection
        selectShapeId.value = [...selectShapeId.value, clickedId]
      }
    } else {
      // if click on empty area - remove all selections
      if (e.target === e.target.getStage() || e.target.attrs.id === 'ocrImg') {
        selectShapeId.value = []
        return
      }
    }
  }

  watch(selectShapeId, () => {
    if (!transformer.value || !layerRef.value) return
    // 获取图层中所有节点
    const children = layerRef.value.getChildren()
    const nodes = children?.filter((child) => selectShapeId.value.includes(child._id))
    const tf = transformer.value?.getNode() as Konva.Transformer

    if (nodes) {
      tf.nodes(nodes)
    }
  })

  // 鼠标离开
  const stageMouseLeave = (e: Konva.KonvaPointerEvent): void => {
    console.log('stageMouseLeave', e)
    if (graffitiMode.value) {
      drawStore.value?.resetDrawing()
    }
  }

  const stageWheel = (e: Konva.KonvaPointerEvent): void => {
    console.log('stageWheel', e)
  }

  const stageDragStart = (e: Konva.KonvaPointerEvent): void => {
    console.log('stageDragStart', e)
    if (graffitiMode.value) {
      drawStore.value?.resetDrawing()
    }
  }

  const stageDragEnd = (e: Konva.KonvaPointerEvent): void => {
    console.log('stageDragEnd', e)
  }

  const transformStart = (e: Konva.KonvaPointerEvent): void => {
    console.log(e.evt.button)
    if (e.evt.button !== 0) {
      transformer.value?.stopTransform()
    }
  }

  // 监听变换，矩形框和旋转框和关键点框
  const transformEnd = (e: Konva.KonvaPointerEvent): void => {
    // 标注中不处理
    if (!graffitiMode.value) {
      return
    }
    console.log('transformEnd', e)
  }

  const copyImg = async () => {
    const stage = stageRef.value?.getStage()
    if (stage) {
      const base64 = (await stage.toImage({
        mimeType: 'image/png',
        pixelRatio: 2,
        quality: 1
      })) as HTMLImageElement
      ;(await window.api.copyImage(base64.src))
        ? Message.success('已复制到粘贴板')
        : Message.error('复制图片异常')
    }
  }

  const exportImg = async () => {
    const stage = stageRef.value?.getStage()
    if (stage) {
      const base64 = (await stage.toImage({
        mimeType: 'image/png',
        pixelRatio: 2,
        quality: 1
      })) as HTMLImageElement
      ;(await window.api.saveAsImg(Date.now() + '.png', base64.src))
        ? Message.success('保存成功')
        : Message.error('保存图片异常')
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
    shortcutKeyHandler,
    graffitiMode,
    modeType,
    currentMode,
    setDrawMode,
    stageMouseDown,
    stageClick,
    stageMouseLeave,
    stageMouseUp,
    stageMouseMove,
    stageDragStart,
    stageDragEnd,
    stageWheel,
    transformStart,
    transformEnd,
    exportImg,
    copyImg
  }
})
