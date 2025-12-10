import Konva from 'konva'

/**
 * KonvaExportUtil 工具类，用于处理 Konva Stage 的 toImage 方法，
 * 确保无论 Layer 是否放大缩小，都能完整导出内容或按当前状态导出。
 * 支持自定义导出分辨率（如 1920x1080、2K、4K 等），并将内容适应到指定大小。
 *
 * - exportFullContent: 导出 Layer 的完整内容（忽略 Stage 边界，计算缩放后边界）。
 *   支持自定义目标分辨率，将内容缩放（stretch）以填充目标大小。
 * - exportCurrentView: 导出 Stage 当前可见状态（默认 toImage 行为，但处理潜在问题）。
 *   支持自定义目标分辨率，使用 pixelRatio 实现高清导出（保持原比例，若目标比例不同可能拉伸）。
 */
export class KonvaExportUtil {
  static copyLayer(tempStage: Konva.Stage, stage: Konva.Stage, layer: Konva.Layer, options): void {
    // 计算实际宽度和高度（确保正值）
    // 计算 Layer 的实际边界矩形
    const rect = layer.getClientRect({ relativeTo: stage, skipTransform: false })
    let width = Math.abs(rect.width)
    let height = Math.abs(rect.height)

    if (width <= 1 && height < 1) return

    // 克隆原 Layer 并添加到临时 Stage
    const clonedLayer = layer.clone()
    tempStage.add(clonedLayer)
    // 如果指定目标分辨率，应用缩放以填充目标大小（stretch）
    if (options.targetWidth || options.targetHeight) {
      // 计算 现图层 缩放目标大小的比例
      const scaleX = options.targetWidth / options.bgWidth
      const scaleY = options.targetHeight / options.bgHeight
      // 调整 clonedLayer 的位置，使其从 (0,0) 开始（抵消原偏移）
      clonedLayer.position({
        x: (options.layerConfig.left / options.realScale) * scaleX,
        y: (options.layerConfig.top / options.realScale) * scaleY
      })
      clonedLayer.scale({ x: scaleX, y: scaleY })
    }

    // 强制绘制以确保内容更新
    clonedLayer.draw()
  }

  /**
   * 导出 Layer 的完整内容，无论缩放如何，都计算实际边界并导出完整图像。
   * 这会临时创建一个 offscreen Stage 来避免修改原 Stage。
   * 如果提供 targetWidth 和 targetHeight，会将内容缩放（stretch）以适应目标大小。
   *
   * @param layer 要导出的 Konva.Layer
   * @param options 可选配置，包括自定义分辨率
   * @returns Promise<Blob> Blob数据
   */
  static async exportFullContent(
    stage: Konva.Stage,
    layer: Array<Konva.Layer>,
    options: Partial<KonvaExportOptions> = {}
  ): Promise<Blob> {
    // 如果指定目标分辨率，使用目标宽高；否则使用计算的宽高
    const targetWidth = options.targetWidth
    const targetHeight = options.targetHeight

    // 创建一个临时 offscreen Stage
    const tempStage = new Konva.Stage({
      container: document.createElement('div'), // offscreen，不添加到 DOM
      width: targetWidth,
      height: targetHeight
    })

    layer.forEach((l) => this.copyLayer(tempStage, stage, l, options))

    return (await tempStage.toBlob({
      mimeType: options.mimeType,
      quality: options.quality,
      pixelRatio: options.resolution === 'original' ? options.pixelRatio : 1, // 可选高清倍数
      x: 0,
      y: 0,
      width: targetWidth,
      height: targetHeight,
      callback: () => {
        tempStage.destroy()
      }
    })) as Blob
  }

  /**
   * 导出 Stage 的当前可见状态（按当前 Stage 大小和 Layer 状态）。
   * 如果提供 targetWidth 和 targetHeight，使用 pixelRatio 实现自定义分辨率导出。
   * 注意：如果目标宽高比例与原 Stage 不同，图像可能被拉伸。
   *
   * @param stage 要导出的 Konva.Stage
   * @param options 可选配置，包括自定义分辨率
   * @returns Promise<Blob> Blob数据
   */
  static async exportCurrentView(
    stage: Konva.Stage,
    options: Partial<KonvaExportOptions> = {}
  ): Promise<Blob> {
    // 默认使用 Stage 的宽度和高度
    const originalWidth = stage.width()
    const originalHeight = stage.height()

    // 如果指定目标分辨率，计算 pixelRatio（取平均以近似）
    let pixelRatio = options.pixelRatio ?? 2

    //不选择原图
    if (options.resolution !== 'original') {
      let targetWidth = options.targetWidth ?? originalWidth
      let targetHeight = options.targetHeight ?? originalHeight
      if (options.targetWidth || options.targetHeight) {
        // 计算等效 pixelRatio（基于宽度和高度的平均，以处理比例差异）
        const scaleX = targetWidth / originalWidth
        const scaleY = targetHeight / originalHeight
        pixelRatio = (scaleX + scaleY) / 2 // 平均缩放，可能导致轻微拉伸
        // 或者使用 min/max 以保持比例，但这里允许拉伸以匹配目标大小
      }
    }

    return (await stage.toBlob({
      mimeType: options.mimeType,
      quality: options.quality,
      pixelRatio
      // width: targetWidth,
      // height: targetHeight,
    })) as Blob
  }
}

/**
 * KonvaExportOptions 接口，扩展 Konva.ToImageConfig 以支持自定义分辨率。
 */
interface KonvaExportOptions {
  targetWidth?: number // 自定义导出宽度（e.g., 1920 for Full HD）
  targetHeight?: number // 自定义导出高度（e.g., 1080）
  x?: number
  y?: number
  bgWidth?: number
  bgHeight?: number
  width?: number
  height?: number
  pixelRatio?: number
  resolution?: string
  mimeType?: string
  quality?: number
}
