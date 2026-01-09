<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@renderer/store/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const onClickMenuItem = (key): void => {
  if (key.includes('/')) {
    router.push(key)
    return
  }
  switch (key) {
    case 'sys-setting':
      appStore.openAppWindow({
        id: `sys-setting`,
        title: `设置`,
        hash: `setting`
      })
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
      :selected-keys="[route.path]"
      @menuItemClick="onClickMenuItem"
    >
      <a-menu-item key="/home">
        <IconHome />
        远程连接
      </a-menu-item>
      <a-menu-item key="/chat">
        <icon-message />
        消息互传
      </a-menu-item>
      <a-menu-item key="/draw">
        <icon-image />
        绘画涂鸦/OCR
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
        <!--        <a-menu-item key="/game"><icon-send />EmulatorJS</a-menu-item>-->
        <!--        <a-sub-menu key="config" title="配置">-->
        <a-menu-item key="sys-setting">
          <icon-settings />
          系统设置
        </a-menu-item>
        <!--        </a-sub-menu>-->
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>

<style scoped></style>
