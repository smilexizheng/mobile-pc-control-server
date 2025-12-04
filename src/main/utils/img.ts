import { clipboard, nativeImage } from 'electron'
import sharp from 'sharp' // 可选：用于图片处理

export const toImage = async (
  imageData: Buffer | Blob | string | ArrayBuffer
): Promise<Buffer | null> => {
  if (!imageData) {
    return null
  }

  try {
    let buffer: Buffer

    // 1. 处理 Buffer
    if (Buffer.isBuffer(imageData)) {
      buffer = imageData
    }
    // 2. 处理 Blob
    else if (imageData instanceof Blob) {
      const arrayBuffer = await imageData.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    }
    // 3. 处理 ArrayBuffer
    else if (imageData instanceof ArrayBuffer) {
      buffer = Buffer.from(imageData)
    }
    // 4. 处理字符串（Base64 或 Data URL）
    else {
      buffer = await convertStringToBuffer(imageData)
    }

    // 验证是否为有效的图片数据
    await validateImageBuffer(buffer)

    return buffer
  } catch (error) {
    console.error('不是有效的图片数据:', error)
    return null
  }
}

/**
 * 复制图片到剪贴板（支持多种格式）
 * 支持的格式：
 * 1. Buffer
 * 2. Blob
 * 3. Base64 字符串
 * 4. Data URL (data:image/png;base64,...)
 * 5. 文件路径
 * 6. ArrayBuffer
 */
export const copyImage = async (
  imageData: Buffer | Blob | string | ArrayBuffer
): Promise<boolean> => {
  const buffer = await toImage(imageData)
  if (buffer != null) {
    const image = nativeImage.createFromBuffer(buffer)
    if (image.isEmpty()) {
      throw new Error('无法从缓冲区创建图片')
    }
    clipboard.writeImage(image)
    return true
  }
  return false
}

/**
 * 将字符串转换为 Buffer
 * 支持：
 * 1. Data URL (data:image/png;base64,...)
 * 2. Base64 字符串（无前缀）
 * 3. 文件路径
 */
const convertStringToBuffer = async (str: string): Promise<Buffer> => {
  // 检查是否是 Data URL
  if (str.startsWith('data:')) {
    return convertDataUrlToBuffer(str)
  }

  // 检查是否是 Base64 字符串（通过简单验证）
  if (isValidBase64(str)) {
    return Buffer.from(str, 'base64')
  }

  // 检查是否是文件路径
  if (await isFilePath(str)) {
    return await convertFileToBuffer(str)
  }

  // 如果都不是，尝试作为普通字符串处理（可能是 base64 但没有验证通过）
  try {
    return Buffer.from(str, 'base64')
  } catch {
    throw new Error('无法识别的图片数据格式')
  }
}

/**
 * 转换 Data URL 为 Buffer
 */
const convertDataUrlToBuffer = (dataUrl: string): Buffer => {
  // 验证 Data URL 格式
  const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,/i
  const match = dataUrl.match(dataUrlRegex)

  if (!match) {
    throw new Error(`不支持的 Data URL 格式: ${dataUrl.substring(0, 50)}...`)
  }

  // 提取 base64 部分
  const base64Data = dataUrl.replace(dataUrlRegex, '')

  // 解码 base64
  try {
    return Buffer.from(base64Data, 'base64')
  } catch (error) {
    throw new Error('Base64 解码失败')
  }
}

/**
 * 检查字符串是否为有效的 Base64
 */
const isValidBase64 = (str: string): boolean => {
  // 基本验证：长度是4的倍数，只包含base64字符
  if (str.length % 4 !== 0) {
    return false
  }

  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str)
}

/**
 * 检查是否为文件路径（异步）
 */
const isFilePath = async (path: string): Promise<boolean> => {
  try {
    const fs = await import('fs/promises')
    const stats = await fs.stat(path).catch(() => null)
    return !!stats && stats.isFile()
  } catch {
    return false
  }
}

/**
 * 读取文件为 Buffer
 */
const convertFileToBuffer = async (filePath: string): Promise<Buffer> => {
  try {
    const fs = await import('fs/promises')
    return await fs.readFile(filePath)
  } catch (error) {
    throw new Error(`无法读取文件: ${filePath}, 错误: ${error}`)
  }
}

/**
 * 验证图片 Buffer 是否有效
 */
const validateImageBuffer = async (buffer: Buffer): Promise<void> => {
  if (!buffer || buffer.length === 0) {
    throw new Error('图片数据为空')
  }

  // 检查最小图片大小（PNG、JPEG等都有最小头部大小）
  if (buffer.length < 8) {
    throw new Error('图片数据过小')
  }

  // 可选：使用 sharp 验证图片格式
  try {
    await sharp(buffer).metadata()
  } catch (error) {
    // 如果 sharp 不可用，进行基本验证
    if (!isLikelyImageBuffer(buffer)) {
      throw new Error('无效的图片数据格式')
    }
  }
}

/**
 * 简单验证 Buffer 是否为图片
 */
const isLikelyImageBuffer = (buffer: Buffer): boolean => {
  const signatures = {
    png: [0x89, 0x50, 0x4e, 0x47],
    jpeg: [0xff, 0xd8, 0xff],
    gif: [0x47, 0x49, 0x46],
    bmp: [0x42, 0x4d],
    webp: [0x52, 0x49, 0x46, 0x46]
  }

  // 检查常见图片格式的魔术数字
  const header = buffer.slice(0, 4)

  for (const [_, signature] of Object.entries(signatures)) {
    if (header.slice(0, signature.length).equals(Buffer.from(signature))) {
      return true
    }
  }

  return false
}
