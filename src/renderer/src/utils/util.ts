import { Message } from '@arco-design/web-vue'

const copyText = (text): void => {
  if (window.api.copyText(text)) {
    Message.success('已复制到剪切板')
  } else {
    Message.error('复制文字失败')
  }
}

export { copyText }
