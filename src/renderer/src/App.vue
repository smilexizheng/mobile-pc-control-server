<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useAppStore } from '@renderer/store/app'
import { Message } from '@arco-design/web-vue'
import TitleBar from '@renderer/components/TitleBar.vue'

const router = useRouter()
const appStore = useAppStore()

const onClickMenuItem = (key): void => {
  Message.info({ content: `You select ${key}`, showIcon: true })
}
onMounted(() => {
  appStore.initTheme()
  router.replace('/')
})
</script>

<template>
  <a-layout>
    <a-layout-header><TitleBar /> </a-layout-header>

    <a-layout>
      <a-layout-sider collapsible>
        <!--        <div class="logo">-->
        <!--          <img alt="logo" class="min-logo" src="./assets/logo.svg" />-->
        <!--        </div>-->
        <!--        <a-button shape="round" @click="onCollapse">-->
        <!--          <IconCaretRight v-if="collapsed" />-->
        <!--          <IconCaretLeft v-else />-->
        <!--        </a-button>-->
        <!-- trigger -->
        <template #trigger="{ collapsed }">
          <IconCaretRight v-if="collapsed"></IconCaretRight>
          <IconCaretLeft v-else></IconCaretLeft>
        </template>
        <a-menu
          :defaultOpenKeys="['1']"
          :defaultSelectedKeys="['0_1']"
          :style="{ width: '100%' }"
          @menuItemClick="onClickMenuItem"
        >
          <a-menu-item key="0_1">
            <IconHome />
            远程连接
          </a-menu-item>
          <a-menu-item key="0_2">
            <IconCalendar />
            语音转文字
          </a-menu-item>
          <a-menu-item key="0_3">
            <IconCalendar />
            文字转语音
          </a-menu-item>
          <a-sub-menu key="1">
            <template #title>
              <span><IconCalendar />更多</span>
            </template>
            <a-menu-item key="1_1">工具箱</a-menu-item>
            <a-sub-menu key="3" title="配置">
              <a-menu-item key="3_1">系统设置</a-menu-item>
            </a-sub-menu>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout-content> <RouterView /></a-layout-content>
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
