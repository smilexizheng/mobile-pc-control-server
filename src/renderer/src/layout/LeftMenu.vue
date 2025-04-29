<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const onClickMenuItem = (key): void => {
  switch (key) {
    case 'home':
      router.push('/')
      break
    case 'ocr':
      router.push('/ocr')
      break
    default:
      break
  }
}
</script>

<template>
  <a-layout-sider collapsible>
    <!--        <div class="logo">-->
    <!--          <img alt="logo" class="min-logo" src="./assets/logo.svg" />-->
    <!--        </div>-->
    <!--        <a-button shape="round" @click="onCollapse">-->
    <!--          <IconCaretRight v-if="collapsed" />-->
    <!--          <IconCaretLeft v-else />-->
    <!--        </a-button>-->
    <template #trigger="{ collapsed }">
      <IconCaretRight v-if="collapsed"></IconCaretRight>
      <IconCaretLeft v-else></IconCaretLeft>
    </template>
    <a-menu
      :defaultOpenKeys="['more']"
      :defaultSelectedKeys="['home']"
      @menuItemClick="onClickMenuItem"
    >
      <a-menu-item key="home">
        <IconHome />
        远程连接
      </a-menu-item>
      <a-menu-item key="ocr">
        <IconCalendar />
        OCR识别
      </a-menu-item>
      <a-menu-item key="asr">
        <IconCalendar />
        ASR语音识别
      </a-menu-item>
      <a-menu-item key="tts">
        <IconCalendar />
        TTS文字转换
      </a-menu-item>
      <a-sub-menu key="more">
        <template #title>
          <span><IconCalendar />更多</span>
        </template>
        <a-menu-item key="tools">工具箱</a-menu-item>
        <a-sub-menu key="config" title="配置">
          <a-menu-item key="sys-setting">系统设置</a-menu-item>
        </a-sub-menu>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<style scoped></style>
