
<script setup>
import { ref} from 'vue'
import Success from './icons/Success.vue'
import Warning from './icons/Warning.vue'
import Error from './icons/Error.vue'

const messages = ref([])
let id = 0

const addMessage = (options) => {
  const message = {
    id: id++,
    type: options.type || 'success',
    text: options.text,
    top: 0
  }

  messages.value = [...messages.value, message].slice(-5)
  calculatePosition()

  setTimeout(() => {
    removeMessage(message)
  }, options.duration || 1000)
}

const removeMessage = (message) => {
  messages.value = messages.value.filter(m => m.id !== message.id)
  calculatePosition()
}

const calculatePosition = () => {
  messages.value.forEach((message, index) => {
    message.top = 50 * index // 只需要设置初始位置
  })
}

defineExpose({
  addMessage
})
</script>
<template>
  <transition-group name="message">
    <div
        v-for="item in messages"
        :key="item.id"
        :id="`message-${item.id}`"
        class="message-item"
        :class="[item.type]"
        :style="{ top: item.top + 'px' }"
    >
      <span class="icon">
        <success v-if="item.type === 'success'" />
        <warning v-if="item.type === 'warning'" />
        <error v-if="item.type === 'error'" />
      </span>
      <div class="text">{{ item.text }}</div>
    </div>
  </transition-group>
</template>


<style scoped>
/* message-item 基础样式 */
.message-item {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 10px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  margin-top: 20px;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
  z-index: 10000;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: all;
}

/* 入场出场动画 */
.message-enter-from {
  opacity: 0;
  transform: translateY(-20px) translateX(-50%);
}
.message-leave-to {
  opacity: 0;
  transform: translateY(-10px) translateX(-50%);
}

/* 图标容器 */
.icon {
  display: inline-flex;
  margin-right: 8px;
  font-size: 16px;
}

/* 类型配色方案 */
.success {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.warning {
  color: #faad14;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.error {
  color: #ff4d4f;
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

/* 内容区域优化 */
.text {
  flex: 1;
  word-break: break-word;
}

</style>