import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { useIntervalFn } from '@vueuse/core'
import { useSocketStore } from '@mobile/stores/socket.js'

// 点按某个事件
// @touchstart.passive="keyBoard.startIntervalPress({event:CE.KEY_TOGGLE,eventData:{key:[Key.PageUp]}})"
// 全局监听抬起 会自动释放 emit 键盘up
export const useKeyBoardStore = defineStore('keyboardStore', () => {
  const socket = useSocketStore()
  // 持续快速按键
  const keyboardData = ref(null)
  const keyToggleData = ref(null)
  const isToggle = ref(false)
  const {
    pause: intervalPressPause,
    resume: intervalPressResume,
    isActive: intervalPressIsRun
  } = useIntervalFn(() => {
    if (keyboardData.value && socket.isConnected) {
      socket.emit(keyboardData.value.event, keyboardData.value.eventData)
    } else {
      intervalPressPause()
    }
  }, 50)

  /**
   * 键盘事件
   * @param params
   */
  function keypress(params) {
    socket.emit(CE.KEYPRESS, params)
  }

  /**
   * 长按 抬起事件
   * <img src="@mobile/assets/icons/quick_menu.svg" alt="快捷操作" @touchstart.passive="keyBoard.keyToggle({key:[Key.A]})">
   *     效果不是人为按下键盘那样一直键入，可以使用下面方法 @startIntervalPress 定时一直发送事件
   * @param params
   */
  function keyToggle(params) {
    if (isToggle.value) {
      socket.emit(CE.KEY_TOGGLE, { ...keyToggleData.value, down: false })
      isToggle.value = false
    }
    if (params) {
      keyToggleData.value = { ...params }
      socket.emit(CE.KEY_TOGGLE, { ...params, down: true })
      isToggle.value = true
    }
  }

  /**
   * 连续点按
   * @touchstart.passive="keyBoard.startIntervalPress({event:CE.KEY_TOGGLE,eventData:{key:[Key.PageUp]}})"
   * @param data
   */
  const startIntervalPress = (data) => {
    keyboardData.value = { ...data }
    intervalPressResume()
  }

  const clearKeyEvent = () => {
    if (intervalPressIsRun) {
      keyboardData.value = null
      intervalPressPause()
    }

    keyToggle(null)
  }

  return { keypress, keyToggle, startIntervalPress, clearKeyEvent, intervalPressIsRun }
})
