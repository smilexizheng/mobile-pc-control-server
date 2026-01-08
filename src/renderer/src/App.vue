<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { useAppStore } from '@renderer/store/app'

import TitleBar from '@renderer/layout/TitleBar.vue'
import LeftMenu from '@renderer/layout/LeftMenu.vue'
import { useResizeObserver } from '@vueuse/core'
const appStore = useAppStore()

const mainLayout = useTemplateRef<HTMLDivElement>('mainLayout')
useResizeObserver(mainLayout, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  appStore.setMainLayoutWH(width, height)
})

onMounted(async () => {
  appStore.initTheme()
})
</script>

<template>
  <a-layout>
    <a-layout-header><TitleBar /> </a-layout-header>
    <a-layout>
      <LeftMenu />
      <a-layout-content ref="mainLayout">
        <RouterView />
      </a-layout-content>
    </a-layout>
    <a-layout-footer></a-layout-footer>
  </a-layout>
</template>

<style scoped>
.logo {
  height: 32px;
  margin: 0 auto;
}
</style>
