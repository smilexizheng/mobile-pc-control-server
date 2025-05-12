<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useAppStore } from '@renderer/store/app'

import TitleBar from '@renderer/layout/TitleBar.vue'
import LeftMenu from '@renderer/layout/LeftMenu.vue'
const appStore = useAppStore()
const router = useRouter()

onMounted(async () => {
  router.replace('/')
  appStore.initTheme()
})
</script>

<template>
  <a-layout>
    <a-layout-header><TitleBar /> </a-layout-header>
    <a-layout>
      <LeftMenu />
      <a-layout-content ref="mainLayout"> <RouterView /></a-layout-content>
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
