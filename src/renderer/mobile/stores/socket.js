import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useIntervalFn, useStorage } from '@vueuse/core'
import router from '@mobile/router/index.js'
import { useDebounceFn } from '@vueuse/core'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { showNotify, showToast } from '@nutui/nutui'
import { LocalEventStore } from '@mobile/stores/localEventStore.js'
import { useChatStore } from '@mobile/stores/chatStore.js'
import { generateUUID, overSize } from '@mobile/utils/common.js'

/**
 *  持续触发 任意socket某个事件
 *  startEventInterval({event:CE.KEYPRESS,eventData:{key:'pageup'}})"
 *
 */
export const useSocketStore = defineStore('socket', () => {
  const localEventStore = LocalEventStore()
  const socket = ref(null)
  const isConnected = ref(false)
  const token = useStorage('socket-token', 'ssss') // returns Ref<number>

  const intervalData = ref(null)
  const interval = ref(50)

  const tokenExpire = ref(false)
  // 待上传的文件
  const uploadFiles = ref({})

  const {
    pause: intervalPause,
    resume: intervalResume,
    isActive: intervalIsRun
  } = useIntervalFn((event, eventData) => {
    if (intervalData.value && isConnected.value) {
      emit(intervalData.value.event, intervalData.value.eventData)
    } else {
      intervalPause()
    }
  }, interval)

  function connect() {
    if (!isConnected.value) {
      socket.value = io(import.meta.env.RENDERER_VITE_SOCKET_URL, {
        autoConnect: false,
        path: '/win-control.io',
        transports: ['polling', 'websocket'],
        timeout: 5000,
        auth: {
          token: token.value
        }
      })

      socket.value.on('connect', () => {
        isConnected.value = true
        tokenExpire.value = false
      })

      socket.value.on('disconnect', (reason) => {
        showNotify.warn('断开连接' + reason)
        isConnected.value = false
      })

      socket.value.on('error', (error) => {
        showNotify.danger('服务异常：' + error)
      })

      socket.value.on('connect_error', (err) => {
        showNotify.warn('连接异常：' + err.message)
        if (err?.data?.code === 401) {
          tokenExpire.value = true
        }
      })

      socket.value.on(CE.RESPONSE, (data) => {
        if (data.success) {
          // todo 某些事件不需要提示
          // if (data.event?.charAt(0) !== 's') {
          showToast.text(data.msg || data.event + '操作成功')
          // }
        } else {
          showNotify.warn(data.msg || data.event + '操作失败')
        }
      })

      socket.value.on(CE.EVENTS_GET, (data) => {
        localEventStore.customEvents = data
      })

      // 聊天相关
      socket.value?.on('client-list', (data) => {
        const chatStore = useChatStore()
        chatStore.clients = Object.values(data)
      })
      socket.value?.on('client-leave', (data) => {
        const chatStore = useChatStore()
        if (chatStore.messages[data]) {
          delete chatStore[data]
        }
      })

      socket.value?.on('chat-message', (message) => {
        showNotify.success(`收到消息${message.content || message.fileName}`)
        const { addMessage } = useChatStore()
        addMessage(message)
      })

      // socket文件上传
      socket.value?.on(CE.FILE_PROGRESS, ({ fileId, progress }) => {
        const target = uploadFiles.value[fileId]
        if (target) target.progress = progress
        if (parseInt(progress) === 100) emit(CE.FILE_END, { fileId })
      })

      socket.value?.on(CE.FILE_ACK, async ({ fileId }) => {
        const fileObj = uploadFiles.value[fileId]
        if (!fileObj) return
        const { sendMessage, currentChat } = useChatStore()
        if (currentChat) {
          sendMessage({
            fileId,
            fileName: fileObj.file.name,
            to: currentChat.id,
            sender: 'me',
            msgType: 'file'
          })
        }

        const CHUNK_SIZE = 1024 * 1024 * (navigator.connection?.downlink || 10) // 10MB 分片大小
        const file = fileObj.file

        if (fileObj.offset === undefined) {
          fileObj.offset = 0
          fileObj.chunkIndex = 0
          fileObj.totalChunks = Math.ceil(file.size / CHUNK_SIZE)
        }
        const reader = new FileReader()
        const end = Math.min(fileObj.offset + CHUNK_SIZE, file.size)
        reader.onload = (e) => {
          emit(CE.FILE_CHUNK, {
            fileId,
            chunk: e.target.result,
            chunkIndex: fileObj.chunkIndex,
            totalChunks: fileObj.totalChunks,
            fileName: file.name,
            fileType: file.type
          })
          fileObj.offset = end
          fileObj.chunkIndex++
          if (fileObj.chunkIndex < fileObj.totalChunks) {
            readAsArrayBuffer(fileObj.chunkIndex * CHUNK_SIZE)
          }
        }

        reader.onerror = (error) => {
          showToast.text(`文件[${fileId}]分片读取失败:`, error)
        }

        function readAsArrayBuffer(start) {
          const chunk = file.slice(start, start + CHUNK_SIZE)
          reader.readAsArrayBuffer(chunk)
        }

        readAsArrayBuffer(0)
      })

      // 传输完成
      socket.value?.on(CE.FILE_COMPLETE, (fileId) => {
        // const target = uploadFiles.value[fileId];
        uploadFiles.value[fileId].file = null
        showToast.text('上传完成')
      })

      socket.value.on('reconnected', () => {
        socket.value.disconnect()
        connect()
      })

      socket.value.connect()
    }
  }

  function on(event, callback) {
    socket.value?.on(event, callback)
  }

  function off(event, callback) {
    socket.value?.off(event)
  }

  function emit(event, data) {
    socket.value?.emit(event, data)
  }

  function once(event, data) {
    socket.value?.once(event, data)
  }

  const setToken = (val) => {
    if (!val) return
    token.value = val
    connect()
  }

  const startEventInterval = (data) => {
    intervalData.value = { ...data }
    intervalResume()
  }

  const stopEventInterval = () => {
    if (intervalIsRun) {
      intervalData.value = null
      intervalPause()
    }
  }

  function setInterval(val) {
    interval.value = val
  }

  function disconnect() {
    socket.value?.disconnect()
    socket.value = null
  }
  // 文件上传
  const handleUpload = (file, to) => {
    if (overSize(file)) return
    const fileData = {
      id: generateUUID(),
      name: file.name,
      size: file.size,
      file: file,
      to,
      progress: 0
    }

    uploadFiles.value[fileData.id] = fileData
    // 开始传输
    emit(CE.FILE_START, {
      fileId: fileData.id,
      fileName: file.name,
      fileSize: file.size,
      to
    })
  }

  // 处理自定义指令事件
  const eventHandler = useDebounceFn((item) => {
    if (item.events) {
      // socket事件
      item.events.forEach((event) => {
        setTimeout(() => {
          emit(event.event, event.eventData)
        }, event.delay || 0)
      })
    } else if (item.action) {
      // 其他动作
      switch (item.action) {
        case 'router':
          router.push(item.toLink).then()
          break
        default:
          break
      }
    } else {
      switch (item.name) {
        case 'A':
          emit(CE.KEYPRESS, { key: [72] })
          break
        case '播放/暂停':
          emit(CE.KEYPRESS, { key: [109] })
          break
        default:
          alert(item.name + '没有符合定义的事件')
          break
      }
    }
  }, 100)

  return {
    socket,
    tokenExpire,
    isConnected,
    setToken,
    connect,
    disconnect,
    uploadFiles,
    handleUpload,
    on,
    off,
    emit,
    once,
    eventHandler,
    startIntervalPress: startEventInterval,
    clearKeyEvent: stopEventInterval,
    intervalIsRun
  }
})
