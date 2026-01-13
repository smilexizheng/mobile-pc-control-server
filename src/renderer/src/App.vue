<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { useAppStore } from '@renderer/store/app'

import { useResizeObserver } from '@vueuse/core'
const appStore = useAppStore()
const mainLayout = useTemplateRef<HTMLDivElement>('mainLayout')
useResizeObserver(mainLayout, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  appStore.setMainLayoutWH(width, height)
})

onMounted(() => {})
</script>

<template>
  <div class="app">
    <!--       :style="{ borderRadius: appStore.isMaximize ? '0px' : '10px' }"-->
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: var(--color-bg-1);
  border: 1px solid var(--color-border-1);
  -electron-corner-smoothing: system-ui;
  padding: 0 6px 6px 6px;
}
</style>
