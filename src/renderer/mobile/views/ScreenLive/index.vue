<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import flvjs from 'flv.js'
import { useSocketStore } from '@mobile/stores/socket.js'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import SocketIoLoader from '@mobile/views/ScreenLive/socket-io-loader.js'

const socketStore = useSocketStore()
const videoPlayer = ref(null)
let flvPlayer = null

onMounted(() => {
  // 初始化FLV播放器
  if (flvjs.isSupported()) {
    // 注册自定义 loader

    flvPlayer = flvjs.createPlayer(
      {
        type: 'flv',
        isLive: true,
        hasAudio: false, // 根据实际需要调整
        url: { socket: socketStore, roomName: 'screenlive' } // 伪URL，实际通过websocket传输
      },
      {
        // 对于直播，关掉 stashBuffer 或调小缓存
        enableStashBuffer: false,
        // 或者 stashInitialSize: 128 (默认 384KB 可能略大)
        lazyLoad: false,
        autoCleanupSourceBuffer: true,
        debug: true,

        enableWorker: false, // 关闭分线程防止跨域问题
        stashInitialSize: 128, // 减少初始缓冲
        // 指定我们的自定义 loader
        customLoader: SocketIoLoader
      }
    )

    flvPlayer.attachMediaElement(videoPlayer.value)
    flvPlayer.load()

    try {
      flvPlayer.play()
    } catch (err) {
      console.error('播放错误:', err)
    }
  }
})

// 清理资源
onBeforeUnmount(() => {
  if (flvPlayer) {
    flvPlayer.pause()
    flvPlayer.unload()
    flvPlayer.destroy()
  }
})
</script>

<!-- 前端部分 (Vue3组件) -->
<template>
  <div>
    <video ref="videoPlayer" controls autoplay style="width: 100%"></video>
  </div>
</template>
