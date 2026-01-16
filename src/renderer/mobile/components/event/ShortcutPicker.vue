<template>
  <div class="shortcut-picker">
    <!-- 显示已选按键 -->
    <div class="selected-keys">
      <div v-for="keyCode in selectedKeys" :key="keyCode" class="key-item">
        {{ keyCodeToName(keyCode) }}
        <span class="remove-btn" @click="removeKey(keyCode)">×</span>
      </div>
      <button @click="showPicker = true" class="select-btn">
        {{ selectedKeys.length ? '编辑' : '添加快捷键' }}
      </button>
    </div>

    <!-- 按键选择弹窗 -->
    <div v-if="showPicker" class="key-picker-modal">
      <div class="modal-header">
        <h3>选择组合键</h3>
        <button @click="confirmSelection">完成</button>
      </div>

      <div class="key-list">
        <button
            v-for="key in availableKeys"
            :key="key.code"
            class="key-btn"
            :class="{ active: isKeySelected(key.code) }"
            @click="toggleKey(key.code)"
        >
          {{ key.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {Key} from "../../enums/key.enum.js";
// 示例键位映射表（需要补充完整）
const KEY_MAP = {...Key}


const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const tempSelected = ref([...props.modelValue])

// 可用按键列表（按需组织）
const availableKeys = computed(() => {
  return Object.entries(KEY_MAP)
      .filter(([k, v]) => typeof v === 'number')
      .map(([name, code]) => ({ name, code }))


})

// 当前选中键
const selectedKeys = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 转换键码为名称
const keyCodeToName = (code) => {
  return KEY_MAP[code] || 'Unknown'
}

// 切换按键选择
const toggleKey = (code) => {
  const index = tempSelected.value.indexOf(code)
  if (index > -1) {
    tempSelected.value.splice(index, 1)
  } else if (tempSelected.value.length < 3) { // 限制最大组合数
    tempSelected.value.push(code)
  }
}

// 移除按键
const removeKey = (code) => {
  selectedKeys.value = selectedKeys.value.filter(k => k !== code)
}

// 确认选择
const confirmSelection = () => {
  selectedKeys.value = [...tempSelected.value]
  showPicker.value = false
}

// 检查是否选中
const isKeySelected = (code) => {
  return tempSelected.value.includes(code)
}
</script>

<style scoped>
/* 移动端优化样式 */
.shortcut-picker {
  position: relative;
}

.selected-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.key-item {
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 4px;
  position: relative;
}

.remove-btn {
  margin-left: 4px;
  color: #ff4444;
  cursor: pointer;
}

.select-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

/* 选择弹窗样式 */
.key-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
}

.key-list {
  flex: 1;
  background: white;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  overflow-y: auto;
}

.key-btn {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  touch-action: manipulation;
}

.key-btn.active {
  background: #007bff;
  color: white;
  border-color: transparent;
}

/*@media (max-width: 480px) {*/
/*  .key-list {*/
/*    grid-template-columns: repeat(3, 1fr);*/
/*  }*/
/*}*/
</style>