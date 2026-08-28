import { defineStore } from 'pinia'
import io from 'socket.io-client'
import { ref, computed } from 'vue'
import { useAppStore } from './app'
import { Message } from '@arco-design/web-vue'
import Socket = SocketIOClient.Socket
import { UserMessage } from '../env'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
export const useSocketStore = defineStore('socket-io', () => {
  const router = useRouter()
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const isReconnecting = ref(false)
  // 在线的socket用户对象
  const onlineSocketUser = ref({})
  const userMessage = ref<Record<string, Array<UserMessage>>>({})
  const onlineSocketIds = computed(() => {
    return Object.keys(onlineSocketUser.value)
  })
  const activeClient = ref()
  // 自定义事件
  const customEvents = ref<any>([])
  const connect = (): void => {
    const { settings, realHost, serverPort } = useAppStore()
    if (!socket.value && realHost && serverPort) {
      socket.value = io(`http://${realHost}:${serverPort}`, {
        autoConnect: true,
        path: '/win-control.io',
        transports: ['websocket'],
        auth: {
          token: settings?.token,
          isServer: true
        }
      })
      socket.value.on('connect', () => {
        isConnected.value = true
        isReconnecting.value = false

        socket.value?.on('events:get', (data) => {
          customEvents.value = data
        })
        // emit('events:get', '')
        socket.value?.on('client-list', (data) => {
          onlineSocketUser.value = data
        })
        socket.value?.on('latest-online', (id) => {
          activeClient.value = onlineSocketUser.value[id]
        })
        socket.value?.on('client-leave', (data) => {
          Message.info('客户端离线')
          if (data == activeClient.value.id) {
            activeClient.value = onlineSocketUser.value[onlineSocketIds.value[0]]
          }

          // if (userMessage.value[data]) {
          // delete userMessage.value[data]
          // }
        })

        socket.value?.on('chat-message', (data) => {
          const { form } = data
          activeClient.value = onlineSocketUser.value[form]
          router.push('/chat')
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
        isConnected.value = false
        isReconnecting.value = true
      })
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

  // 处理自定义指令事件
  const eventHandler = useDebounceFn((item) => {
    if (isConnected.value) {
      if (item.events) {
        // socket事件
        item.events.forEach((event) => {
          setTimeout(() => {
            emit(event.event, event.eventData)
          }, event.delay || 0)
        })
      }
    } else {
      Message.error('核心服务异常，请检查IP 网络配置')
    }
  })

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
    eventHandler,
    onlineSocketUser,
    onlineSocketIds,
    userMessage,
    sendMessage,
    customEvents
  }
})
