<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { documentEvent } from '@mobile/utils/common'
import { useEventListener } from '@vueuse/core'
import { useKeyBoardStore } from '@mobile/stores/keyboardStore.js'
import { useSocketStore } from '@mobile/stores/socket'
import { useRouter } from 'vue-router'
import { useAppStore } from '@mobile/stores/appStore.js'
import Modal from './components/ui/Modal.vue'

const socketStore = useSocketStore()
const keyBoard = useKeyBoardStore()
const appStore = useAppStore()
const router = useRouter()

const inputToken = ref('')

onMounted(() => {
  documentEvent()
  socketStore.connect()
  useEventListener(document, ['mouseup', 'touchend', 'dragend'], () => {
    keyBoard.clearKeyEvent()
  })
})

onUnmounted(() => {
  console.log('断开连接')
  socketStore.disconnect()
})

const back = () => {
  router.back()
}
</script>

<template>
  <nut-sticky v-if="appStore.navBarVisible">
    <nut-navbar
      :title="appStore.title"
      :left-show="appStore.backVisible"
      @click-back="back"
    ></nut-navbar>
  </nut-sticky>
  <RouterView v-if="socketStore.isConnected" />
  <div v-else @click="socketStore.connect()">
    <img src="@mobile/assets/images/network.png" style="width: 100%" />
    <Modal v-model="socketStore.tokenExpire" :title="`令牌无效`" :max-height="`60px`">
      <nut-input v-model="inputToken" placeholder="请输入令牌" />
      <nut-button block type="primary" @click="socketStore.setToken(inputToken)">确认</nut-button>
    </Modal>
  </div>
</template>

<style scoped></style>
