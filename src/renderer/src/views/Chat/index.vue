<script setup lang="ts">
import { ref, reactive } from 'vue'
import { IconSend, IconFaceSmileFill, IconFolderAdd, IconImage } from '@arco-design/web-vue/es/icon'
import { useAppStore } from '@renderer/store/app'
import dayjs from 'dayjs'
const appStore = useAppStore()

// 新增状态
const showEmojiPicker = ref(false)
const fileInput = ref<HTMLInputElement>()
const imageInput = ref<HTMLInputElement>()
const emojis = reactive(['😀', '😎', '❤️', '👍', '🎉']) // 示例表情

// 模拟数据
// const messageList = reactive([
//   {
//     id: 1,
//     name: '张三',
//     avatar: 'https://example.com/avatar1.png',
//     lastMessage: '你好，最近怎么样？',
//     time: '10:30'
//   },
//   {
//     id: 2,
//     name: '李四',
//     avatar: 'https://example.com/avatar2.png',
//     lastMessage: '项目文档已发送',
//     time: '09:15'
//   }
// ])

// const chatData = reactive({
//   abcd: {
//     avatar: 'https://example.com/avatar1.png',
//     messages: [
//       {
//         content: '你好，最近怎么样？',
//         time: '10:30',
//         isSelf: false
//       },
//       {
//         content: '还不错，项目进展顺利',
//         time: '10:31',
//         isSelf: true
//       }
//     ]
//   },
//   efg: {
//     avatar: 'https://example.com/avatar2.png',
//     messages: [
//       {
//         content: '项目文档已发送',
//         time: '09:15',
//         isSelf: false
//       }
//     ]
//   }
// })

// 响应式状态
const activeId = ref(null)
const inputMessage = ref('')

// 新增方法
const toggleEmojiPicker = (): void => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const triggerFileInput = (): void => {
  fileInput.value?.click()
}

const triggerImageInput = (): void => {
  imageInput.value?.click()
}

const handleFileSelect = (e): void => {
  const file = e.target.files[0]
  if (file) {
    // 处理文件上传逻辑
    console.log('Selected file:', file)
  }
}

const handleImageSelect = (e): void => {
  const file = e.target.files[0]
  if (file) {
    // 处理图片上传逻辑
    console.log('Selected image:', file)
  }
}

const insertEmoji = (emoji): void => {
  inputMessage.value += emoji
  showEmojiPicker.value = false
}

// 方法
const selectChat = (id): void => {
  activeId.value = id
}

const sendMessage = (): void => {
  if (!activeId.value || !inputMessage.value.trim()) return

  appStore.sendMessage(activeId.value, inputMessage.value.trim())
  inputMessage.value = ''
}
</script>
<template>
  <a-layout class="chat-container">
    <!-- 左侧消息列表 -->
    <a-layout-sider :width="221" class="left-sider">
      <div class="message-header">消息列表</div>
      <a-list :bordered="false" class="message-list" :style="{ width: `220px` }">
        <a-list-item
          v-for="id in appStore.onlineSocketIds"
          :key="id"
          :class="{ 'active-item': id === activeId }"
          @click="selectChat(id)"
        >
          <template #extra>
            <span class="message-time"
              >{{ dayjs(appStore.onlineSocketUser[id].connectTime).format('HH:mm') }}
            </span>
          </template>
          <a-list-item-meta>
            <template #avatar>
              <a-avatar :size="40" :style="{ backgroundColor: '#14a9f8' }">
                {{ appStore.onlineSocketUser[id].userAgent.os.name }}
                <!--                <img :src="msg.avatar" />-->
              </a-avatar>
            </template>
            <template #title>
              <span>{{ appStore.onlineSocketUser[id].userAgent.device.model }}</span>
            </template>
            <template #description>
              <div class="message-preview">
                {{ appStore.onlineSocketUser[id].clientIp }}
              </div>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </a-list>
    </a-layout-sider>

    <!-- 右侧聊天区域 -->
    <a-layout class="right-layout">
      <a-layout-content class="chat-content">
        <div v-if="activeId" class="chat-messages">
          <div
            v-for="(message, index) in appStore.userMessage[activeId]"
            :key="index"
            :class="['message-bubble', { 'self-message': message.isSelf }]"
          >
            <a-avatar v-if="!message.isSelf">A</a-avatar>
            <div class="bubble-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-chat">请选择聊天</div>
      </a-layout-content>

      <!-- 输入区域 -->
      <a-layout-footer class="toolbar-footer">
        <div class="toolbar">
          <a-button type="text" class="toolbar-btn" @click="toggleEmojiPicker">
            <icon-face-smile-fill />
          </a-button>
          <a-button type="text" class="toolbar-btn" @click="triggerFileInput">
            <icon-folder-add />
          </a-button>
          <a-button type="text" class="toolbar-btn" @click="triggerImageInput">
            <icon-image />
          </a-button>
          <input ref="fileInput" type="file" style="display: none" @change="handleFileSelect" />
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageSelect"
          />
        </div>

        <!-- 表情选择面板 -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <!-- 这里可以接入表情库 -->
          <span
            v-for="emoji in emojis"
            :key="emoji"
            class="emoji-item"
            @click="insertEmoji(emoji)"
            >{{ emoji }}</span
          >
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <a-textarea
            v-model="inputMessage"
            placeholder="输入消息..."
            :auto-size="{ minRows: 1, maxRows: 4 }"
            @press-enter="sendMessage"
          />
          <a-button type="primary" class="send-btn" @click="sendMessage">
            <template #icon>
              <icon-send />
            </template>
          </a-button>
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
:deep(.arco-list-medium .arco-list-content-wrapper .arco-list-content > .arco-list-item) {
  padding: 5px 10px;
}

.chat-container {
  height: 100%;
}

.left-sider {
  background-color: var(--color-bg-2);
  border-right: 1px solid var(--color-border);
}

.message-header {
  padding: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
}

.message-list {
  height: calc(100vh - 100px);
  overflow-y: auto;
}

.active-item {
  background-color: var(--color-fill-2);
}

.message-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.message-preview {
  width: 100px;
  font-size: 12px;
  color: var(--color-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  padding: 16px;
  overflow-y: auto;
}

.chat-messages {
  height: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-bubble {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.self-message {
  flex-direction: row-reverse;
  margin-left: auto;
}

.bubble-content {
  background-color: var(--color-fill-2);
  padding: 8px 12px;
  border-radius: 8px;
}

.self-message .bubble-content {
  background-color: var(--color-primary-light-1);
}

.message-text {
  color: var(--color-text-1);
}

.input-footer {
  height: 80px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}

/* 新增工具栏样式 */
.toolbar-footer {
  height: auto;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
}

.toolbar {
  display: flex;
  gap: 4px;
  padding-bottom: 8px;
}

.toolbar-btn {
  padding: 4px 8px;
  font-size: 18px;
}

.emoji-picker {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--color-bg-2);
  border-radius: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  max-height: 120px;
  overflow-y: auto;
}

.emoji-item {
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  transition: transform 0.2s;
}

.emoji-item:hover {
  transform: scale(1.2);
}

/* 调整输入区域布局 */
.input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.send-btn {
  margin-bottom: 4px;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--color-text-3);
}
</style>
