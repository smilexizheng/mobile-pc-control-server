<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { IconSend, IconFaceSmileFill, IconFolderAdd, IconImage } from '@arco-design/web-vue/es/icon'
import { useSocketStore } from '@renderer/store/socket'
import dayjs from 'dayjs'
import { useSystemStore } from '@renderer/store/system'
import { copyText } from '@renderer/utils/util'

const socketStore = useSocketStore()
const systemStore = useSystemStore()

const emojis = reactive(['😀', '😂', '😅', '😘', '🏸', '😎', '❤️', '👍', '🎉'])
const chatContent = ref<HTMLDivElement>()

// Auto-scroll to bottom when messages
watch(socketStore.userMessage, () => {
  // console.log('更新了')
  nextTick(() => {
    chatContent.value?.scrollIntoView({ block: 'end', behavior: 'instant' })
  })
})

onMounted(() => {})

const inputMessage = ref('')

const triggerFileInput = async (extensions: string[]): Promise<void> => {
  const filePath = await systemStore.chooseFile('选择文件', extensions)
  if (filePath) {
    const fileId = await window.electron.ipcRenderer.invoke('addAllowDownFile', {
      filePath,
      fileName: filePath.split('/').pop()
    })
    socketStore.sendMessage({ msgType: 'file', fileId, fileName: filePath.split('/').pop() })
  }
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
</script>
<template>
  <a-layout class="chat-container">
    <!-- 左侧消息列表 -->
    <a-layout-sider :width="221" class="left-sider">
      <div class="message-header">消息列表</div>
      <a-list :bordered="false" class="message-list" :style="{ width: `220px` }">
        <template v-for="id in socketStore.onlineSocketIds" :key="id">
          <a-list-item
            v-if="id !== socketStore.socket?.id"
            :class="{ 'active-item': id === socketStore.activeClient?.id }"
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
    <a-layout class="right-layout">
      <a-layout-content class="chat-content">
        <a-scrollbar style="height: calc(100vh - 116px); overflow: auto">
          <div v-if="socketStore.activeClient" ref="chatContent" class="chat-messages">
            <div
              v-for="(message, index) in socketStore.userMessage[socketStore.activeClient.clientIp]"
              :key="index"
              :class="['message-bubble', { 'self-message': message.isSelf }]"
            >
              <!--              <a-avatar v-if="!message.isSelf">A</a-avatar>-->
              <div v-if="message.msgType === 'txt'" class="bubble-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ message.time }}</div>
                <a-space>
                  <a-button type="primary" size="mini" @click="copyText(message.content)"
                    >复制
                  </a-button>
                </a-space>
              </div>

              <div v-if="message.msgType === 'file'" class="bubble-content">
                <div class="message-text">{{ message.fileName }}</div>
                <a-space>
                  <a-button
                    type="primary"
                    size="mini"
                    @click="systemStore.shellOpen(message.fileId)"
                    >打开</a-button
                  >
                  <a-button
                    type="primary"
                    size="mini"
                    @click="systemStore.showItemInFolder(message.fileId)"
                    >打开文件夹</a-button
                  >
                </a-space>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-chat">请选择聊天</div>
        </a-scrollbar>
      </a-layout-content>

      <!-- 输入区域 -->
      <a-layout-footer class="toolbar-footer">
        <div class="toolbar">
          <a-trigger position="top" auto-fit-position :unmount-on-close="false">
            <a-button class="toolbar-btn">
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

          <a-button class="toolbar-btn" @click="triggerFileInput(['*'])">
            <icon-folder-add />
          </a-button>
          <a-button class="toolbar-btn" @click="triggerFileInput(['png', 'jpg', 'jpeg'])">
            <icon-image />
          </a-button>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <a-textarea
            v-model="inputMessage"
            placeholder="输入消息..."
            :auto-size="{ minRows: 1, maxRows: 4 }"
            @press-enter="sendMessage"
          />
          <a-button
            type="primary"
            class="send-btn"
            @click="sendMessage"
            :disabled="!socketStore.activeClient"
          >
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

.chat-messages {
  display: flex;
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

.input-footer {
  height: 80px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}

/* 新增工具栏样式 */
.toolbar-footer {
  height: auto;
  padding: 2px 16px 8px 16px;
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
