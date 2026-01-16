<script setup>
import { ref } from 'vue'
import { useSocketStore } from '@mobile/stores/socket'
import { useTextareaAutosize } from '@vueuse/core'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'

const { textarea, input: inputMessage } = useTextareaAutosize()
const inputContainer = ref(null)

const socketStore = useSocketStore()

// 发送消息
const sendMessage = (enter) => {
  window.scrollTo(0, 0)
  if (inputMessage.value.trim()) {
    socketStore.emit(CE.TYPING, { val: inputMessage.value, enter })
    inputMessage.value = ''
  } else if (enter) {
    socketStore.emit(CE.KEYPRESS, { key: 'enter' })
  }
}
</script>

<template>
  <!-- 吸底输入框 -->
  <div class="input-container" ref="inputContainer">
    <!-- 文本输入区域 -->
    <textarea ref="textarea" v-model="inputMessage" class="input-text" placeholder="请输入内容" />
    <img
      src="@mobile/assets/icons/enter_key.svg"
      style="width: 40px"
      alt="回车按键"
      @click="sendMessage(true)"
    />

    <button class="send-btn" @click="sendMessage(false)">发送</button>
  </div>
</template>

<style scoped lang="less">
.input-container {
  width: 100%;
  position: fixed;
  bottom: 10px;
  padding: 8px 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;

  * {
    touch-action: manipulation;
    // 新增禁止选中样式
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

.input-text {
  width: 65%;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 6px;
  font-size: 16px;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.send-btn {
  height: 40px;
  background: #07c160;
  color: white;
  border: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.send-btn:hover {
  background: #06ad54;
}
</style>
