<script setup>
import { ref } from 'vue'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { useSocketStore } from '@mobile/stores/socket.js'
import { generateUUID, parseJson } from '@mobile/utils/common.js'
const socketStore = useSocketStore()
import { showNotify } from '@nutui/nutui'

const val = ref('')

const handleAdd = () => {
  const jsonObj = parseJson(val.value)
  if (jsonObj && jsonObj.name) {
    jsonObj.id = generateUUID()
    socketStore.emit(CE.EVENTS_PUT, jsonObj)
  } else {
    showNotify.warn('指令格式错误，请检查！')
  }
}
</script>

<template>
  <nut-textarea placeholder="请粘贴指令" :rows="10" autosize autofocus v-model="val" />
  <nut-button block type="primary" @click="handleAdd">创建指令</nut-button>
</template>

<style scoped></style>
