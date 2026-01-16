<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { useChatStore } from '@mobile/stores/chatStore'
import { useSocketStore } from '@mobile/stores/socket.js'
import { Uploader } from '@nutui/icons-vue'
import { useRouter } from 'vue-router'
const chatStore = useChatStore()
const inputMessage = ref('')
const messageList = ref(null)
const socketStore = useSocketStore()
const router = useRouter()

onMounted(() => {
  if (!chatStore.currentChat) {
    router.back()
  }
  scrollToBottom()
})

const send = () => {
  if (inputMessage.value.trim()) {
    chatStore.sendMessage({ content: inputMessage.value, msgType: 'txt' })
    socketStore.emit('chat-message', { to: chatStore.currentChat.id, content: inputMessage.value })
    inputMessage.value = ''
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

watch(chatStore.messages, () => {
  scrollToBottom()
})

const handleFileSelect = async (files) => {
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      socketStore.handleUpload(files[i], chatStore.currentChat.id)
    }
  }
  return files
}

const downloadFile = (data) => {
  const link = document.createElement('a')
  link.href = `/downloadFile?fileId=${data.fileId}`
  // link.target='_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
<template>
  <div class="chat-window" v-if="chatStore.currentChat">
    <div class="message-list" ref="messageList">
      <div
        v-for="message in chatStore.messages[chatStore.currentChat.id]"
        :key="message.id"
        :class="['message', message.sender === 'me' ? 'sent' : 'received']"
      >
        <div v-if="message.msgType === 'txt'" class="message-content">
          {{ message.content }}
        </div>
        <div
          v-if="message.msgType === 'file'"
          class="message-content"
          @click="downloadFile(message)"
        >
          {{ message.fileName }}
        </div>
        <div class="message-time">
          {{ message.time }}
        </div>
      </div>
    </div>

    <div class="input-area">
      <nut-input v-model="inputMessage" placeholder="输入消息..." @keyup.enter="send" clearable>
        <template #left>
          <nut-uploader :auto-upload="false" :before-upload="handleFileSelect" multiple>
            <nut-button icon="plus" type="success">
              <template #icon>
                <Uploader />
              </template>
            </nut-button>
          </nut-uploader>
        </template>
        <template #right>
          <nut-button type="primary" @click="send">发送</nut-button>
        </template>
      </nut-input>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-list {
  height: calc(100% - 100px);
  padding: 10px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message-content {
  max-width: 70%;
  padding: 10px;
  border-radius: 5px;
  word-wrap: break-word;
}

.sent .message-content {
  align-self: flex-end;
  background-color: #95ec69;
}

.received .message-content {
  align-self: flex-start;
  background-color: white;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.sent .message-time {
  align-self: flex-end;
}

.received .message-time {
  align-self: flex-start;
}

.input-area {
  height: 50px;
}
</style>
