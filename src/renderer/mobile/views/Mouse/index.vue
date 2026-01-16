<script setup>
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useSocketStore } from '@mobile/stores/socket'
import TextInput from '@mobile/views/Mouse/TextInput.vue'
import { useToggle, useResizeObserver } from '@vueuse/core'
import { posThreshold } from '@mobile/utils/common.js'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import on_screen from '@mobile/assets/icons/on_screen.svg'
import off_screen from '@mobile/assets/icons/off_screen.svg'
import on_air_view from '@mobile/assets/icons/on_air_view.svg'
import off_air_view from '@mobile/assets/icons/off_air_view.svg'
import { useKeyBoardStore } from '@mobile/stores/keyboardStore.js'
import ScreenShow from '@mobile/views/Mouse/ScreenShow.vue'
import Modal from '@mobile/components/ui/Modal.vue'
import QuickMenu from '@mobile/views/Mouse/QuickMenu.vue'
import { Key } from '@mobile/enums/key.enum.js'

const socketStore = useSocketStore()
const keyBoard = useKeyBoardStore()
const leftNavVisible = ref(false)
const rightNavVisible = ref(false)
// 响应式状态
const padRef = ref(null)
// 起点
const touchStartPos = ref({ x: 0, y: 0, time: 0 })
// 鼠标指针位置
const mousePos = ref({ x: 0, y: 0 })
// 移动距离
const moveDistancePos = ref({ x: 0, y: 0 })
// 是否按下
const isTouch = ref(false)
// 是否已经移动
const isMove = ref(false)

const leftDown = ref(false)
// 添加双击相关状态
const lastTapTime = ref(Date.now())
const tapTimeout = ref(null)
const tapCount = ref(0)

//显示屏幕
const [showScreen, toggleShowScreen] = useToggle(false)
// 暂停更新屏幕
const [pausedScreen, togglePausedScreen] = useToggle(false)
const [showAirView, toggleAirView] = useToggle(false)

const showQuickMenu = ref(false)

const connectionStatus = ref('disconnected') // disconnected/connecting/connected/error

useResizeObserver(padRef, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  socketStore.emit(CE.MOBILE_SCREEN_SIZE, {
    screenSize: {
      width: width,
      height: height
    }
  })
})

// 触摸事件处理
const handleStart = (e) => {
  leftNavVisible.value = false
  rightNavVisible.value = false
  // e.preventDefault()
  const touch = e.touches[0]
  touchStartPos.value = {
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now()
  }

  isTouch.value = true
  isMove.value = false
  leftDown.value = false
  socketStore.emit(CE.SYS_POINTER_START)
}

const handleMove = (e) => {
  if (!isTouch.value) return

  const touch = e.touches[0]

  const deltaX =
    showScreen.value && !leftDown.value
      ? touchStartPos.value.x - touch.clientX
      : touch.clientX - touchStartPos.value.x
  const deltaY =
    showScreen.value && !leftDown.value
      ? touchStartPos.value.y - touch.clientY
      : touch.clientY - touchStartPos.value.y

  moveDistancePos.value.x = leftDown.value ? deltaX * 2.5 : deltaX * 3
  moveDistancePos.value.y = leftDown.value ? deltaY * 1.5 : deltaY * 2

  sendCoordinates()
}

// 发送坐标数据
const sendCoordinates =
  // useThrottleFn(
  () => {
    if (
      !socketStore?.isConnected ||
      (moveDistancePos.value.x === 0 && moveDistancePos.value.y === 0)
    )
      return
    if (!isMove.value && posThreshold(moveDistancePos.value.x, moveDistancePos.value.y, 10)) {
      isMove.value = true
      // 左键按下
      if (!leftDown.value && Date.now() - touchStartPos.value.time > 300) {
        socketStore.emit(CE.SYS_MOUSE_TOGGLE, { isPress: true, button: 0 })
        leftDown.value = true
      }
    }

    socketStore.emit(CE.SYS_POINTER_MOVE, {
      x: moveDistancePos.value.x,
      y: moveDistancePos.value.y,
      touchMove: true,
      timestamp: Date.now()
    })
  }
// , 10, true);

const handleEnd = () => {
  // 释放左键
  if (leftDown.value) {
    socketStore.emit(CE.SYS_MOUSE_TOGGLE, { isPress: false, button: 0 })
    leftDown.value = false
  }

  // 操作类型判断
  if (!isMove.value && !leftDown.value) {
    const currentTime = Date.now()
    const tapDuration = currentTime - touchStartPos.value.time

    // 长按右键（500ms）
    if (tapDuration > 500) {
      socketStore.emit(CE.SYS_MOUSE_CLICK, { button: 2, double: false })
    }
    // 单击/双击判断
    else if (tapDuration < 300) {
      if (currentTime - lastTapTime.value < 300) {
        clearTimeout(tapTimeout.value)
        tapCount.value = 0
        // 双击
        socketStore.emit(CE.SYS_MOUSE_CLICK, { button: 0, double: true })
      } else {
        moveToTouchPos()
        // 单击
        tapCount.value = 1
        tapTimeout.value = setTimeout(() => {
          if (tapCount.value === 1) {
            socketStore.emit(CE.SYS_MOUSE_CLICK, { button: 0, double: false })
          }
          tapCount.value = 0
        }, 300)
      }
      lastTapTime.value = currentTime
    }
  }
  isTouch.value = false
  isMove.value = false

  moveDistancePos.value = { x: 0, y: 0 }
  socketStore.emit(CE.SYS_POINTER_END)
}

const moveToTouchPos = () => {
  if (showScreen.value && !pausedScreen.value) {
    togglePausedScreen()
    socketStore.emit(CE.SYS_POINTER_MOVE, {
      x: touchStartPos.value.x - padRef.value.offsetWidth / 2 + mousePos.value.x,
      y: touchStartPos.value.y - padRef.value.offsetHeight / 2 + mousePos.value.y
    })
    const oldPos = { x: mousePos.value.x, y: mousePos.value.y }
    setTimeout(() => {
      socketStore.emit(CE.SYS_POINTER_MOVE, {
        x: oldPos.x,
        y: oldPos.y
      })
      setTimeout(() => {
        togglePausedScreen()
      }, 100)
    }, 500)
  }
}

// 状态显示文本
const statusText = computed(() => {
  connectionStatus.value = socketStore.isConnected ? 'connected' : 'disconnected'
  return {
    disconnected: '未连接',
    connected: '已连接'
  }[connectionStatus.value]
})

// 生命周期
onMounted(() => {
  socketStore.on(CE.SYS_POINTER_POS, (res) => {
    if (!pausedScreen.value) {
      mousePos.value = res
    }
  })
})

const padStyle = ref({
  background: '#e3e2e2'
})

watch(showScreen, (newVal) => {
  socketStore.emit(newVal ? CE.JOIN_ROOM : CE.LEAVE_ROOM, { roomName: 'screen' })
  padStyle.value = {
    background: newVal ? 'none' : '#e3e2e2'
  }
})

onUnmounted(() => {
  showScreen.value = false
  socketStore.off(CE.SYS_POINTER_POS)
})
</script>

<template>
  <ScreenShow :is-paused="pausedScreen" :show-air-view="showAirView" v-show="showScreen" />
  <div class="touchpad-container">
    <!-- 触控板区域 -->
    <div
      ref="padRef"
      class="touch-surface"
      @touchstart="handleStart"
      @touchmove.prevent="handleMove"
      @touchend="handleEnd"
      :style="padStyle"
    >
      <img
        v-show="showScreen && isTouch"
        src="@mobile/assets/icons/pointer.svg"
        class="pointer"
        alt="鼠标指针"
      />
      {{ mousePos.x }},{{ mousePos.y }}
    </div>

    <div class="status" style="left: 10px; top: 20px" @click="$router.push('/')">返回</div>
    <!--连接状态-->
    <!--    <div class="status" style="right:10px;top:20px;">-->
    <!--      <span :class="['indicator', connectionStatus]"></span>-->
    <!--      {{ statusText }}-->
    <!--    </div>-->

    <nut-drag direction="y" :style="{ left: '0px', bottom: '80px' }">
      <nut-fixed-nav
        v-model:visible="leftNavVisible"
        type="left"
        un-active-text="控滚动条"
        active-text="收起功能"
        :overlay="false"
      >
        <template #list>
          <ul class="nut-fixed-nav__list">
            <li
              class="nut-fixed-nav__list-item"
              @touchstart.passive="
                keyBoard.startIntervalPress({ event: CE.SYS_SCROLL_VERTICAL, eventData: true })
              "
            >
              <img
                src="@mobile/assets/icons/roller_down.svg"
                alt="上"
                style="transform: rotate(180deg)"
              />
              <span class="span">向上</span>
            </li>
            <li
              class="nut-fixed-nav__list-item"
              @touchstart.passive="
                keyBoard.startIntervalPress({ event: CE.SYS_SCROLL_VERTICAL, eventData: false })
              "
            >
              <img src="@mobile/assets/icons/roller_down.svg" alt="下" />
              <span class="span">向下</span>
            </li>
            <li
              class="nut-fixed-nav__list-item"
              @touchstart.passive="
                keyBoard.startIntervalPress({ event: CE.SYS_SCROLL_HORIZONTAL, eventData: false })
              "
            >
              <img
                src="@mobile/assets/icons/roller_down.svg"
                alt="左"
                style="transform: rotate(90deg)"
              />
              <span class="span">向左</span>
            </li>
            <li
              class="nut-fixed-nav__list-item"
              @touchstart.passive="
                keyBoard.startIntervalPress({ event: CE.SYS_SCROLL_HORIZONTAL, eventData: true })
              "
            >
              <img
                src="@mobile/assets/icons/roller_down.svg"
                alt="右"
                style="transform: rotate(270deg)"
              />
              <span class="span">向右</span>
            </li>
          </ul>
        </template>
      </nut-fixed-nav>
    </nut-drag>

    <nut-drag direction="y" :style="{ right: '0px', bottom: '120px' }">
      <nut-fixed-nav
        v-model:visible="rightNavVisible"
        un-active-text="快捷功能"
        active-text="收起功能"
        :overlay="false"
      >
        <template #list>
          <ul class="nut-fixed-nav__list">
            <li class="nut-fixed-nav__list-item" @click="showQuickMenu = true">
              <img src="@mobile/assets/icons/quick_menu.svg" alt="快捷操作" />
              <span class="span">快捷功能</span>
            </li>
            <li class="nut-fixed-nav__list-item" @click="toggleShowScreen()">
              <img :src="showScreen ? on_screen : off_screen" alt="显示屏幕" />
              <span class="span">{{ showScreen ? '隐藏屏幕' : '显示屏幕' }}</span>
            </li>
            <li v-show="showScreen" class="nut-fixed-nav__list-item" @click="toggleAirView()">
              <img :src="showAirView ? on_air_view : off_air_view" alt="预览位置" />
              <span class="span">{{ showAirView ? '隐藏轮廓' : '显示轮廓' }}</span>
            </li>
            <li
              class="nut-fixed-nav__list-item"
              @touchstart.passive="
                keyBoard.startIntervalPress({
                  event: CE.KEYPRESS,
                  eventData: { key: [Key.Backspace] }
                })
              "
            >
              <img src="@mobile/assets/icons/backspace.svg" alt="删除" />
              <span class="span">删除</span>
            </li>
          </ul>
        </template>
      </nut-fixed-nav>
    </nut-drag>

    <TextInput />
  </div>
  <Modal
    v-model="showQuickMenu"
    title="快捷功能"
    :showHeader="true"
    :showClose="true"
    max-height="80vh"
  >
    <QuickMenu />
  </Modal>
</template>

<style scoped lang="less">
.touchpad-container {
  z-index: 9;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  * {
    user-select: none;
    touch-action: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

.touch-surface {
  height: 100%;
  border-radius: 10px;
  position: relative;
  color: #00bd7e;
}

.pointer {
  width: 30px;
  position: absolute;
  top: 50%;
  left: 50%;
}

.right-side {
  position: fixed;
  right: 2px;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;

  & img {
    width: 32px;
    height: 32px;
  }
}

.status {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
}

.indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.indicator.disconnected {
  background: #ff3b30;
}

.indicator.connecting {
  background: #ffcc00;
}

.indicator.connected {
  background: #34c759;
}

.indicator.error {
  background: #ff2d55;
}
</style>
