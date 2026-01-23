<script setup lang="ts">
import { ref } from 'vue'
import Settings from '@renderer/components/Settings.vue'
import { Minus, X, Square, Copy } from 'lucide-vue-next'
import { useAppStore } from '@renderer/store/app'
import logo from '@renderer/assets/logo.svg'
const title = ref(window.document.title)
const appStore = useAppStore()
</script>

<template>
  <div class="title-bar">
    <img alt="logo" class="min-logo" :src="logo" />
    {{ title }}

    <div class="window-controls">
      <Settings />
      <template v-if="appStore.platform?.isWindows">
        <button class="control-btn minimize" @click="appStore.handleMinimize">
          <Minus :size="22" />
        </button>
        <button class="control-btn maximize" @click="appStore.handleMaximize">
          <Copy v-if="appStore.isMaximize" :size="16" />
          <Square v-else :size="16" />
        </button>
        <button class="control-btn close" @click="appStore.handleClose">
          <X :size="22" />
        </button>
      </template>
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

.control-btn {
  color: var(--color-text-2);
  font-size: 16px;
  width: 32px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.control-btn:hover {
  cursor: pointer;
  color: #fff;
  background: var(--color-border-3);
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
