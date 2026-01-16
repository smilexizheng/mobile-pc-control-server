<script setup>
import { ref, onMounted } from 'vue'
import Modal from '@mobile/components/ui/Modal.vue'
import { useSocketStore } from '@mobile/stores/socket.js'
import { LocalEventStore } from '@mobile/stores/localEventStore.js'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import EventModal from '@mobile/components/event/EventModal.vue'
import dayjs from 'dayjs'

const localEventStore = LocalEventStore()
const socketStore = useSocketStore()
const scheduleList = ref([])
const eventModalOpen = ref(false)
const editEvent = ref(null)
const time = ref(new Date())
const timeSelect = ref(false)
onMounted(() => {
  socketStore.on(CE.SCHEDULE_GET, (data) => {
    scheduleList.value = data
  })
  getScheduleList()
})

const getScheduleList = () => {
  socketStore.emit(CE.SCHEDULE_GET)
}

const handleEdit = (item) => {
  editEvent.value = item
  eventModalOpen.value = true
}

const handleDelete = (id) => {
  socketStore.emit(CE.SCHEDULE_DELETE, id)
}

const handleAdd = () => {
  eventModalOpen.value = false
  socketStore.emit(CE.SCHEDULE_ADD, editEvent.value)
  editEvent.value = {}
}

const confirm = () => {
  editEvent.value.cron = dayjs(time.value).format('YYYY-MM-DD HH:mm:ss')
  timeSelect.value = false
}

const addSchedule = () => {
  editEvent.value = localEventStore.defaultSchedule()
  eventModalOpen.value = true
}
</script>

<template>
  <Modal v-model="eventModalOpen" title="任务计划">
    <nut-input v-model="editEvent.cron" placeholder="执行时间/cron 30 * * * * *" clearable>
      <template #right>
        <nut-button type="primary" size="small" @click="timeSelect = true">时间</nut-button>
      </template>
    </nut-input>
    <nut-popup v-model:visible="timeSelect" position="bottom">
      <nut-date-picker type="datetime" v-model="time" @confirm="confirm"></nut-date-picker>
    </nut-popup>

    <nut-checkbox v-model="editEvent.runOnCreate">立即执行</nut-checkbox>
    <nut-checkbox v-model="editEvent.runOnStart">自启动</nut-checkbox>
    <EventModal :event="editEvent" :ok="handleAdd" />
  </Modal>
  <div class="mobile-list">
    <div v-for="(item, index) in scheduleList" :key="index" class="list-item">
      <div class="item-content" v-if="item">
        <div
          class="color-block"
          :style="{ backgroundColor: item.hasJob ? item.color : '#c2c1c1' }"
        ></div>
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.events?.length }} 个事件</p>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn edit" @click="socketStore.emit(CE.SCHEDULE_TOGGLE_JOB, item.id)">
          {{ item.hasJob ? '停止' : '运行' }}
        </button>
        <button class="btn edit" @click="handleEdit(item)">编辑</button>
        <button class="btn delete" @click="handleDelete(item.id)">删除</button>
      </div>
    </div>
  </div>
  <nut-sticky position="bottom">
    <nut-button block type="primary" @click="addSchedule()"> 添加任务计划 </nut-button>
  </nut-sticky>
</template>

<style scoped>
.mobile-list {
  padding: 12px;
}

.list-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin-right: 12px;
}

.item-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.item-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.edit {
  background-color: #409eff;
  color: white;
}

.delete {
  background-color: #f56c6c;
  color: white;
}

/* 按钮样式 */
.ios-button {
  display: block;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  text-align: center;
  transition: all 0.2s;
  margin: 8px 0;
}
</style>
