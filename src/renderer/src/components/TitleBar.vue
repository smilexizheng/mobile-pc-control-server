<script setup lang="ts">
import { ref } from 'vue'
import Settings from './Settings.vue'

const title = ref(window.document.title)
const handleMinimize = () => window.electron.ipcRenderer.send('window-minimize')
const handleClose = () => window.electron.ipcRenderer.send('window-close')
</script>

<template>
  <div class="title-bar">
    <!--    <img alt="logo" class="min-logo" src="../assets/logo.svg" />-->
    {{ title }}
    <div class="window-controls">
      <Settings />
      <button class="control-btn minimize" @click="handleMinimize">一</button>
      <!--      <button class="control-btn minimize">-->
      <!--        ❏❑-->
      <!--      </button>-->
      <button class="control-btn close" @click="handleClose">✖</button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  user-select: none;
  /*electron drag window*/
  app-region: drag;
  height: 30px;
  width: 100%;
  font-size: 12px;
  color: var(--color-text-3);
  /*background: #fcfcfc;*/
  display: flex;
  align-items: center;
  padding-left: 8px;
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
  color: var(--color-text-3);
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
  color: #fff;
  background: rgba(0, 0, 0, 0.05);
}

/* Windows 风格悬停效果 */
@media (hover: hover) {
  .control-btn.minimize:hover {
    background: var(--color-border-3);
  }

  .control-btn.close:hover {
    background: #e81123;
  }
}
</style>
