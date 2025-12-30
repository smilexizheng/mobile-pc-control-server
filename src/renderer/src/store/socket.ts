import { defineStore } from 'pinia'
import io from 'socket.io-client'
import { ref, computed } from 'vue'
import { useAppStore } from './app'
import { Message } from '@arco-design/web-vue'
import Socket = SocketIOClient.Socket
import { Notification } from '@arco-design/web-vue'
import { UserMessage } from '../env'
import { useRouter } from 'vue-router'
export const useSocketStore = defineStore('socket-io', () => {
  const router = useRouter()
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  // 在线的socket用户对象
  const onlineSocketUser = ref({})
  const userMessage = ref<Record<string, Array<UserMessage>>>({})
  const onlineSocketIds = computed(() => {
    return Object.keys(onlineSocketUser.value)
  })
  const activeClient = ref()

  const connect = (): void => {
    const { settings, realUrl } = useAppStore()
    if (!socket.value) {
      socket.value = io(realUrl, {
        autoConnect: true,
        path: '/win-control.io',
        transports: ['websocket'],
        auth: {
          token: settings?.token,
          isServer: true
        }
      })
      if (socket.value) {
        socket.value.on('connect', () => {
          isConnected.value = true

          socket.value?.on('client-list', (data) => {
            onlineSocketUser.value = data
            if (data) {
              activeClient.value = null
            }
          })
          socket.value?.on('client-leave', () => {
            Message.info('客户端离线')
            // if (userMessage.value[data]) {
            // delete userMessage.value[data]
            // }
          })

          socket.value?.on('chat-message', (data) => {
            const { form } = data
            activeClient.value = onlineSocketUser.value[form]
            router.push('/chat')
            Notification.info({
              content: `收到消息 ${data.content || data.fileName}`
            })
            const ip = onlineSocketUser.value[form].clientIp
            if (!userMessage.value[ip]) {
              userMessage.value[ip] = []
            }
            userMessage.value[ip].push({
              isSelf: false,
              ...data,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
          })
        })

        socket.value.on('disconnect', (reason) => {
          console.error(reason)
          isConnected.value = false
        })

        socket.value.on('error', (error) => {
          console.error(error)
        })

        socket.value.on('reconnected', () => {
          socket.value?.disconnect()
          socket.value = null
          connect()
        })
      }
    }
  }

  function on(event, callback): void {
    socket.value?.on(event, callback)
  }

  function off(event, callback): void {
    socket.value?.off(event, callback)
  }

  function emit(event, data): void {
    socket.value?.emit(event, data)
  }

  function once(event, data): void {
    socket.value?.once(event, data)
  }

  const sendMessage = (data): void => {
    if (activeClient.value) {
      const ip = activeClient.value.clientIp
      if (!userMessage.value[ip]) {
        userMessage.value[ip] = []
      }
      userMessage.value[ip].push({
        isSelf: true,
        ...data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      emit('chat-message', { to: activeClient.value.id, ...data })
    }
  }

  return {
    socket,
    activeClient,
    isConnected,
    connect,
    on,
    off,
    emit,
    once,
    onlineSocketUser,
    onlineSocketIds,
    userMessage,
    sendMessage
  }
})
