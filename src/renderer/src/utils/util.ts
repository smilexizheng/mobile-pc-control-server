import { Message } from '@arco-design/web-vue'

const copyText = (text): void => {
  if (window.api.copyText(text)) {
    Message.success('复制完成')
  } else {
    Message.error('复制文字失败')
  }
}

const chooseFile = async (name: string, extensions: string[]) => {
  const path = await window.api.chooseFile(name, extensions)
  return path || ''
}

export { copyText, chooseFile }
