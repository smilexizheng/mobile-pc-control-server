<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useAppStore } from '../store/app'
const router = useRouter()
const appStore = useAppStore()

const onClickMenuItem = (key): void => {
  switch (key) {
    case 'home':
      router.push('/')
      break
    case 'ocr':
      router.push('/ocr')
      break
    case 'chat':
      router.push('/chat')
      break
    case 'game':
      router.push('/game')
      break
    case 'sys-setting':
      appStore.settingsVisible = true
      break
    default:
      Message.info('功能测试中')
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
      <a-menu-item key="chat">
        <icon-message />
        消息互传
      </a-menu-item>
      <a-menu-item key="ocr">
        <icon-image />
        OCR/涂鸦
      </a-menu-item>
      <!--      <a-menu-item key="asr"> <iconVoice /> ASR语音识别 </a-menu-item>-->
      <!--      <a-menu-item key="tts">-->
      <!--        <icon-chinese-fill />-->
      <!--        TTS文字转换-->
      <!--      </a-menu-item>-->
      <a-sub-menu key="more">
        <template #title>
          <span><icon-more />更多</span>
        </template>
        <!--        <a-menu-item key="game"><icon-send />EmulatorJS</a-menu-item>-->
        <!--        <a-sub-menu key="config" title="配置">-->
        <a-menu-item key="sys-setting"><icon-settings />系统设置</a-menu-item>
        <!--        </a-sub-menu>-->
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<style scoped></style>
