<script setup>
import { ref, onMounted } from 'vue'
import EventModal from '@mobile/components/event/EventModal.vue'
import { LocalEventStore } from '@mobile/stores/localEventStore.js'
import Modal from '@mobile/components/ui/Modal.vue'
import { showDialog } from '@nutui/nutui'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'
import { useSocketStore } from '@mobile/stores/socket.js'

import { showToast } from '@nutui/nutui'
import { useCopyToClipboard } from '@mobile/utils/common.js'

const socketStore = useSocketStore()
const localEventStore = LocalEventStore()
const eventModalOpen = ref(false)

const editEvent = ref(null)

onMounted(() => {
  socketStore.emit(CE.EVENTS_GET)
})

const handleEdit = (item) => {
  editEvent.value = item
  eventModalOpen.value = true
}

const handleDelete = (item) => {
  showDialog({
    title: '温馨提示',
    content: `确定删除${item.name}吗？`,
    onOk: () => {
      socketStore.emit(CE.EVENTS_DELETE, item.id)
    }
  })
}

const handleAdd = () => {
  eventModalOpen.value = false
  socketStore.emit(CE.EVENTS_PUT, editEvent.value)
  editEvent.value = {}
}

const shareEvent = (item) => {
  useCopyToClipboard(JSON.stringify(item))
  showToast.text(`${item.name}复制完成，在[导入指令]中粘贴`)
}

const addEvent = (item) => {
  editEvent.value = localEventStore.defaultEvent()
  eventModalOpen.value = true
}
</script>

<template>
  <Modal v-model="eventModalOpen" title="编辑指令">
    <EventModal :event="editEvent" :ok="handleAdd" />
  </Modal>
  <div class="mobile-list">
    <div v-for="(item, index) in localEventStore.customEvents" :key="index" class="list-item">
      <div class="item-content" v-if="item">
        <div class="color-block" :style="{ backgroundColor: item.color }"></div>
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.events.length }} 个事件</p>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn edit" @click="handleEdit(item)">编辑</button>
        <button class="btn delete" @click="handleDelete(item)">删除</button>
        <button class="btn edit" @click="shareEvent(item)">分享</button>
      </div>
    </div>
  </div>
  <nut-sticky position="bottom">
    <nut-button block type="primary" @click="addEvent()"> 自定义指令 </nut-button>
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
