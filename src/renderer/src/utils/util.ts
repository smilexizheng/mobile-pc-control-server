import { Message } from '@arco-design/web-vue'

const copyText = (text): void => {
  if (window.api.copyText(text)) {
    Message.success('复制完成')
  } else {
    Message.error('复制文字失败')
  }
}

export { copyText }
