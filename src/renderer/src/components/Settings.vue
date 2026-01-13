<script setup lang="ts">
import { useAppStore } from '../store/app'
import { CircleArrowUp } from 'lucide-vue-next'
import { Notification } from '@arco-design/web-vue'

const appStore = useAppStore()

const checkUpdate = async () => {
  Notification.info({
    id: 'updateNotion',
    content: '检查更新中',
    duration: 0
  })
  await window.api.checkForUpdate()
}
</script>

<template>
  <button class="control-btn" @click="checkUpdate">
    <CircleArrowUp :size="16" />
  </button>

  <button class="control-btn" @click="appStore.toggleTheme()">
    <icon-moon-fill v-if="appStore.isDark" />
    <icon-sun-fill v-else />
  </button>

  <a-dropdown>
    <button class="control-btn">
      <icon-menu />
    </button>
    <template #content>
      <a-doption
        @click="
          appStore.openAppWindow({
            title: `设置`,
            hash: `setting`
          })
        "
        >系统设置
      </a-doption>
      <a-doption
        :value="{ value: 'about' }"
        @click="
          appStore.openAppWindow({
            title: `关于`,
            hash: `about`,
            option: { width: 520, height: 200 },
            query: { open: true }
          })
        "
        >关于
      </a-doption>
    </template>
  </a-dropdown>
</template>

<style scoped></style>
