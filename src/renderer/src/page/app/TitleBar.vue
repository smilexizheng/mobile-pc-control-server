<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Minus, X, Square, Copy } from 'lucide-vue-next'
import logo from '@renderer/assets/logo.svg'
const title = ref(window.document.title)
const isMaximize = ref(false)
const windowId = ref('')
import { useRoute } from 'vue-router'
const route = useRoute()
const handleMinimize = () => window.api.handleMinimize(windowId.value)
const handleClose = () => window.api.handleClose(windowId.value)
const handleMaximize = async () => {
  isMaximize.value = await window.api.handleMaximize(windowId.value)
}

onMounted(() => {
  windowId.value = route.query.id as string
  title.value = route.query.title as string
})
</script>

<template>
  <div class="title-bar">
    <img alt="logo" class="min-logo" :src="logo" />
    {{ title }}
    <div class="window-controls">
      <button class="control-btn minimize" @click="handleMinimize">
        <Minus :size="22" />
      </button>
      <button class="control-btn maximize" @click="handleMaximize">
        <Copy v-if="isMaximize" :size="16" />
        <Square v-else :size="16" />
      </button>
      <button class="control-btn close" @click="handleClose"><X :size="22" /></button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  user-select: none;
  /*electron drag window*/
  app-region: drag;
  height: 40px;
  width: 100%;
  font-size: 12px;
  color: var(--color-text-3);
  /*background: #fcfcfc;*/
  display: flex;
  align-items: center;
  gap: 8px;
}

.min-logo {
  height: 24px;
  width: 24px;
}

.window-controls {
  app-region: no-drag;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.maximize {
  transform: rotate(90deg);
}

/* Windows 风格悬停效果 */
@media (hover: hover) {
  .minimize:hover {
    background: var(--color-border-3);
  }

  .close:hover {
    background: #e81123;
  }
}
</style>
