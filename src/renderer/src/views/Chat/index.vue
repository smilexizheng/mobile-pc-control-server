<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { IconFaceSmileFill, IconFolderAdd, IconImage } from '@arco-design/web-vue/es/icon'
import { useSocketStore } from '@renderer/store/socket'
import dayjs from 'dayjs'
import { copyText } from '@renderer/utils/util'
import { Copy, FolderOpen } from 'lucide-vue-next'
import FileLoader from './FileLoader.vue'
import { Message } from '@arco-design/web-vue'
const socketStore = useSocketStore()

const emojis = reactive(['😀', '😂', '😅', '😘', '🏸', '😎', '❤️', '👍', '🎉'])
const chatContent = ref<HTMLDivElement>()
const isDragover = ref(false)
// Auto-scroll to bottom when messages
watch(socketStore.userMessage, () => {
  nextTick(() => {
    chatContent.value?.scrollIntoView({ block: 'end', behavior: 'instant' })
  })
})

onMounted(() => {})

const inputMessage = ref('')

const triggerFileInput = async (extensions: string[]): Promise<void> => {
  const filePath = await window.api.chooseFile('选择文件', extensions)
  if (filePath) {
    await sharedFile(filePath)
  }
}

const sharedFile = async (filePath) => {
  const fileId = await window.electron.ipcRenderer.invoke('addAllowDownFile', {
    filePath,
    fileName: filePath.split('/').pop()
  })
  socketStore.sendMessage({
    msgType: 'file',
    fileId,
    fileName: filePath.split('/').pop()
  })
}

const insertEmoji = (emoji): void => {
  inputMessage.value += emoji
}

// 方法
const selectChat = (id): void => {
  socketStore.activeClient = socketStore.onlineSocketUser[id]
}

const sendMessage = (): void => {
  if (!socketStore.activeClient || !inputMessage.value.trim()) return

  socketStore.sendMessage({ msgType: 'txt', content: inputMessage.value.trim() })
  inputMessage.value = ''
}

const handleKeyDown = (event) => {
  // 监听 Enter 键（key 值为 'Enter'）
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止换行
    sendMessage()
  }
}

const showItemInFolder = (fileId) => {
  window.api.showItemInFolder(fileId)
}

const handleDrop = (event) => {
  isDragover.value = false
  if (!socketStore.activeClient) {
    Message.error('请先扫描连接平台！')
    return
  }
  // 获取拖拽的文件列表（DataTransfer）
  const files = event.dataTransfer.files

  if (files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const absolutePath = window.api.getPathForFile(file)
    sharedFile(absolutePath)
  }
}
</script>
<template>
  <a-layout
    class="chat-container"
    @dragover.prevent="isDragover = true"
    @dragenter.prevent="isDragover = true"
    @dragleave.prevent="isDragover = false"
    @drop.prevent="handleDrop"
  >
    <!-- 左侧消息列表 -->
    <a-layout-sider :width="221" class="left-sider">
      <div class="message-header">在线设备</div>
      <a-list :bordered="false" class="message-list" :style="{ width: `220px` }">
        <template #empty></template>
        <template v-for="id in socketStore.onlineSocketIds" :key="id">
          <a-list-item
            v-if="id !== socketStore.socket?.id"
            :class="{ 'active-item ': id === socketStore.activeClient?.id }"
            @click="selectChat(id)"
          >
            <template #extra>
              <span class="message-time"
                >{{ dayjs(socketStore.onlineSocketUser[id].connectTime).format('HH:mm') }}
              </span>
            </template>

            <a-list-item-meta>
              <template #avatar>
                <a-avatar :size="40" :style="{ backgroundColor: '#14a9f8' }">
                  {{ socketStore.onlineSocketUser[id].userAgent.os.name }}
                  <!--                <img :src="msg.avatar" />-->
                </a-avatar>
              </template>
              <template #title>
                <span>{{
                  socketStore.onlineSocketUser[id].name ||
                  socketStore.onlineSocketUser[id].userAgent.device.model ||
                  socketStore.onlineSocketUser[id].userAgent.os.name
                }}</span>
              </template>

              <template #description>
                <div class="message-preview">
                  {{ socketStore.onlineSocketUser[id].clientIp }}
                </div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-layout-sider>

    <!-- 右侧聊天区域 -->
    <a-layout v-if="socketStore.activeClient" style="background: var(--color-fill-1)">
      <a-layout-content>
        <a-scrollbar style="height: calc(100vh - 260px); overflow: auto">
          <div ref="chatContent" class="chat-messages">
            <div
              v-for="(message, index) in socketStore.userMessage[socketStore.activeClient.clientIp]"
              :key="index"
              :class="['message-bubble', { 'self-message': message.isSelf }]"
            >
              <!--              <a-avatar v-if="!message.isSelf">A</a-avatar>-->
              <div v-if="message.msgType === 'txt'" class="bubble-content">
                <div class="message-time">{{ message.time }}</div>
                <div class="message-text">{{ message.content }}</div>

                <a-space>
                  <a-link @click="copyText(message.content)">
                    <template #icon> <Copy :size="12" /> </template>复制
                  </a-link>
                </a-space>
              </div>
              <!--文件类型-->
              <div v-if="message.msgType === 'file'" class="bubble-content">
                <div class="message-time">{{ message.time }}</div>
                <div>
                  <FileLoader :fileId="message.fileId" />
                </div>
                <a-space>
                  <a-link @click.stop="showItemInFolder(message.fileId)">
                    <template #icon> <FolderOpen :size="12" /> </template>打开文件夹
                  </a-link>
                </a-space>
              </div>
            </div>
          </div>
        </a-scrollbar>
      </a-layout-content>

      <!-- 输入区域 -->
      <a-layout-footer class="toolbar-footer">
        <div class="toolbar">
          <a-trigger position="top" auto-fit-position :unmount-on-close="false">
            <a-button type="text" class="toolbar-btn">
              <icon-face-smile-fill />
            </a-button>
            <template #content>
              <div class="emoji-picker">
                <!-- 这里可以接入表情库 -->
                <span
                  v-for="emoji in emojis"
                  :key="emoji"
                  class="emoji-item"
                  @click="insertEmoji(emoji)"
                  >{{ emoji }}</span
                >
              </div>
            </template>
          </a-trigger>

          <a-button type="text" class="toolbar-btn" @click="triggerFileInput(['*'])">
            <icon-folder-add />
          </a-button>
          <a-button
            type="text"
            class="toolbar-btn"
            @click="triggerFileInput(['png', 'jpg', 'jpeg'])"
          >
            <icon-image />
          </a-button>
        </div>

        <!-- 输入区域 -->
        <div>
          <a-textarea
            v-model="inputMessage"
            placeholder="支持文件拖拽，请输入消息..."
            allow-clear
            :auto-size="{
              minRows: 6,
              maxRows: 6
            }"
            @keydown="handleKeyDown"
          />
        </div>
        <a-row justify="end">
          <a-space>
            <span style="color: var(--color-fill-4)">Enter发送，Shift+Enter 换行</span>
            <a-button
              type="primary"
              class="send-btn"
              @click="sendMessage"
              :disabled="!socketStore.activeClient"
            >
              <!--            <template #icon>-->
              <!--              <icon-send />-->
              <!--            </template>-->
              发送
            </a-button>
          </a-space>
        </a-row>
      </a-layout-footer>
    </a-layout>
    <div v-else class="empty-chat">暂无设备连接，请扫码/浏览器 连接助手</div>
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
  overflow-y: auto;
}

.active-item {
  background-color: var(--color-fill-2);

  animation: headShake; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 1s; /* don't forget to set a duration! */
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

.chat-messages {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px;
}

.message-bubble {
  display: flex;
  gap: 6px;
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
  user-select: text;
  color: var(--color-text-1);
  white-space: break-spaces;
  word-break: break-all;
}

.toolbar-footer {
  height: 260px;
  padding: 2px 6px;
  border-top: 1px solid var(--color-border);
}

.toolbar {
  display: flex;
}

.toolbar-btn {
  padding: 4px 8px;
  font-size: 18px;
}

.emoji-picker {
  display: flex;
  gap: 8px;
  padding: 8px;
  margin: 0 10%;
  background: var(--color-bg-4);
  border-radius: 4px;
  flex-wrap: wrap;
  max-height: 160px;
  width: 80%;
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

.send-btn {
  margin-bottom: 4px;
}

.empty-chat {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--color-text-3);
}
</style>
