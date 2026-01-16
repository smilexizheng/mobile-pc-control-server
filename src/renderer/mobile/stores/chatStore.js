import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
    const currentChat = ref(null) // 当前聊天对象
    const messages = ref({}) // 所有消息
    const clients = ref([ // 联系人列表
    ])

    // 设置当前聊天对象
    const setCurrentChat = (contact) => {
        currentChat.value = contact
        // 这里可以加载历史消息
    }

    // 发送消息
    const sendMessage = (data) => {
        const newMessage = {
            id: Date.now(),
            sender: 'me',
            ...data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        pushClientMsg(currentChat.value.id,newMessage)

        if (currentChat.value) {
            const contact = clients.value.find(c => c.id === currentChat.value.id)
            if (contact) {
                contact.lastMessage = data.content
                contact.time = '刚刚'
            }
        }
    }

    const addMessage = (data) => {
        const newMessage = {
            id: Date.now(),
            sender: 'received',
            ...data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        pushClientMsg(data.form,newMessage)

    }

    const pushClientMsg = (id,data)=>{
        if(!messages.value[id]){
            messages.value[id]=[]
        }
        messages.value[id].push(data);

    }

    return { currentChat, messages, clients, setCurrentChat, addMessage,sendMessage }
})