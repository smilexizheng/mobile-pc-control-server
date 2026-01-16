import { createApp } from 'vue'
import MessageComponent from './index.vue'
let instance = null

const createMessage = () => {
    if (instance) return instance

    const messageApp = createApp(MessageComponent)
    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
    instance = messageApp.mount(wrapper)

    return instance
}

/**
 * const {proxy} = getCurrentInstance()
 * proxy.$message.success('操作成功')
 * @param options
 * @constructor
 */
const Message = (options) => {
    const { addMessage } = createMessage()
    addMessage(options)
}

// 添加类型方法
const types = ['success', 'warning', 'error']
types.forEach(type => {
    Message[type] = (text, duration = 1000) => {
        Message({ type, text, duration })
    }
})

export default Message