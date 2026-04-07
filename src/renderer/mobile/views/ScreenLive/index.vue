<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSocketStore } from '@mobile/stores/socket.js'
import SocketIoLoader from '@mobile/views/ScreenLive/socket-io-loader.js'
import Mpegts from 'mpegts.js'
import { Message } from '@arco-design/web-vue'
const socketStore = useSocketStore()
const videoPlayer = ref(null)
let mpegPlayer = null

onMounted(() => {
  startPlayer()
})

const startPlayer = () => {
  stopPlayer()
  // 初始化FLV播放器
  if (Mpegts.isSupported()) {
    // 注册自定义 loader

    mpegPlayer = Mpegts.createPlayer(
      {
        type: 'mse',
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
        debug: false,

        enableWorker: true, // 关闭分线程防止跨域问题
        stashInitialSize: 128, // 减少初始缓冲
        // 指定我们的自定义 loader
        customLoader: SocketIoLoader
      }
    )

    mpegPlayer.attachMediaElement(videoPlayer.value)
    mpegPlayer.load()

    try {
      mpegPlayer.play()
    } catch (err) {
      console.error('播放错误:', err)
    }
  } else {
    Message.error('当前浏览器 环境不支持播放')
  }
}

const stopPlayer = () => {
  if (mpegPlayer) {
    mpegPlayer.pause()
    mpegPlayer.unload()
    mpegPlayer.destroy()
  }
}

// 清理资源
onBeforeUnmount(() => {
  stopPlayer()
})
</script>

<!-- 前端部分 (Vue3组件) -->
<template>
  <div>
    <video
      ref="videoPlayer"
      controls
      autoplay
      x5-video-player-type="h5-page"
      webkit-playsinline="true"
      playsinline="true"
      style="width: 100%"
    ></video>
  </div>
</template>
