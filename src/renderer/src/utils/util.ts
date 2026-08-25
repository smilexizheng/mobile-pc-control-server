import { Message } from '@arco-design/web-vue'

const copyText = (text): void => {
  if (window.api.copyText(text)) {
    Message.success('已复制')
  } else {
    Message.error('复制文字失败')
  }
}

const chooseFile = async (name: string, extensions: string[]) => {
  const path = await window.api.chooseFile(name, extensions)
  return path || ''
}

const imageExts = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg',
  'tiff',
  'ico',
  'avif',
  'heic',
  'heif'
]

/**
 * 简易判断 是否为图片
 * @param path
 */
const isImage = (extName) => {
  if (!extName) return false
  const clean = extName.split('?')[0].split('#')[0]
  const ext = clean.split('.').pop()?.toLowerCase() || ''
  return imageExts.includes(ext)
}

export { copyText, chooseFile, isImage }
