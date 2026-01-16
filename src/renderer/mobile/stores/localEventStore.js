import { defineStore } from 'pinia'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { useSocketStore } from '@mobile/stores/socket.js'
import { ref } from 'vue'

export const LocalEventStore = defineStore('LocalEventStore', () => {
  const socketStore = useSocketStore()
  const customEvents = ref([])

  const defaultEvent = () => {
    return {
      name: '控制键鼠',
      color: '#3069e5',
      events: []
    }
  }

  const defaultSchedule = () => {
    return {
      name: '计划任务',
      color: '#3069e5',
      cron: '',
      events: [],
      runOnCreate: true,
      runOnStart: false
    }
  }

  const putEvent = (data) => {
    socketStore.emit(CE.EVENTS_PUT, data)
  }
  const delEvent = (key) => {
    socketStore.emit(CE.EVENTS_DELETE, key)
  }

  return {
    customEvents,
    defaultEvent,
    defaultSchedule,
    putEvent,
    delEvent
  }
})
