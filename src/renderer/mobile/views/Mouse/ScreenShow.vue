<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useSocketStore } from '@mobile/stores/socket'
import { useThrottleFn } from '@vueuse/core'
import Message from '@mobile/components/Message/UseMessage.js'

const socketStore = useSocketStore()

const props = defineProps(['isPaused', 'showAirView'])

const showScreenRef = ref(null)
const screenMainStyle = ref({})

let ctx
// 鸟瞰图
const aerialStyle = ref({
  bgWidth: 0,
  bgHeight: 0,
  boxWidth: 0,
  boxHeight: 0,
  boxLeft: 0,
  boxTop: 0
})

/**
 * 防止频繁更新导致肉眼模糊
 */
const updateScreenImg =
  // useThrottleFn(
  (data) => {
    if (props.isPaused) return
    const blob = new Blob([data.image])
    createImageBitmap(blob)
      .then((img) => {
        showScreenRef.value.width = img.width
        showScreenRef.value.height = img.height
        ctx.clearRect(0, 0, img.width, img.height)
        ctx.drawImage(img, 0, 0)
      })
      .catch((err) => {
        Message.error(`图片加载失败${err}`)
      })
    // showScreenRef.value = URL.createObjectURL(blob);

    screenMainStyle.value = {
      width: `${data.width}px`,
      height: `${data.height}px`,
      left: `${data.left}px`,
      right: `${data.right}px`,
      top: `${data.top}px`,
      bottom: `${data.bottom}px`
    }

    // 451-["screen-data",{"left":0,"right":0,"top":67,"bottom":0,"screenWidth":2560,"screenHeight":1440,"x":1519,"y":0,"image":{"_placeholder":true,"num":0},"time":62,"width":410,"height":912}]
    if (props.showAirView) {
      const ratio = data.screenWidth / data.width
      aerialStyle.value = {
        bgHeight: data.screenHeight / ratio + 'px',
        boxWidth: data.width / ratio + 'px',
        boxHeight: data.height / ratio + 'px',
        boxLeft: data.x / ratio + 'px',
        boxTop: data.y / ratio + 'px'
      }
    }
  }
// , 16,true)

onMounted(() => {
  ctx = showScreenRef.value.getContext('2d')
  socketStore.on('screen-data', (data) => {
    updateScreenImg(data)
  })
})

onUnmounted(() => {
  socketStore.off('screen-data')
})
</script>

<template>
  <div class="screen-bg" :style="{ width: screenMainStyle.width, height: screenMainStyle.height }">
    <!--鸟瞰图-->
    <div class="aerial-view" v-show="props.showAirView">
      <div class="aerial-view-bg" :style="{ height: aerialStyle.bgHeight }"></div>
      <div
        class="aerial-view-box"
        :style="{
          width: aerialStyle.boxWidth,
          height: aerialStyle.boxHeight,
          left: aerialStyle.boxLeft,
          top: aerialStyle.boxTop
        }"
      ></div>
    </div>
    <div class="screen-show" :style="screenMainStyle">
      <canvas ref="showScreenRef"></canvas>
      <!--    <img alt="screen" :src="showScreenRef" class="screen-img"/>-->
    </div>
  </div>
</template>

<style scoped lang="less">
.screen-bg {
  background-color: rgb(0, 0, 0);
  position: absolute;
  width: 373px;
  height: 639px;
  overflow: hidden;
  border-radius: 10px;
}

.aerial-view {
  position: absolute;
  background-color: #af3636;
  width: 100%;
  z-index: 2;
  .aerial-view-bg {
    width: 100%;
    position: absolute;
    //background-color: rgba(13, 229, 13, 0.1);
    border-bottom: #8ff3a7 1px solid;
  }

  .aerial-view-box {
    position: absolute;
    background-color: rgba(18, 218, 18, 0.3);
  }
}

.screen-show {
  position: absolute;
  z-index: 1;
  overflow: hidden;

  * {
    user-select: none;
    touch-action: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

.screen-img {
  width: 100%;
}
</style>
