<script setup>
import { useChatStore } from '@mobile/stores/chatStore'
import { useSocketStore } from '@mobile/stores/socket.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const chatStore = useChatStore()
const socketStore = useSocketStore()

const selectClient = (client) => {
  chatStore.setCurrentChat(client)
  router.push('/chat')
}
</script>

<template>
  <template v-for="client in chatStore.clients" :key="client.id">
    <nut-cell
      size="large"
      v-if="client.id !== socketStore.socket?.id"
      :title="
        (client.name || client.userAgent.device.model || client.userAgent.os.name) +
        ' ' +
        client.clientIp
      "
      @click="selectClient(client)"
    >
      <!--      <template #icon>-->
      <!--        <nut-avatar size="large"></nut-avatar>-->
      <!--      </template>-->
      <!--      <template #title>-->
      <!--        <span>{{ client.name }}</span>-->
      <!--      </template>-->
      <!--      <template #desc>-->
      <!--        <div class="client-desc">-->
      <!--          <span>{{ client.lastMessage }}</span>-->
      <!--          <span class="time">{{ client.time }}</span>-->
      <!--        </div>-->
      <!--      </template>-->
    </nut-cell>
  </template>
</template>

<style scoped>
.client-desc {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.time {
  color: #999;
  font-size: 12px;
}
</style>
