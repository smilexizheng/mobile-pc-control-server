<script setup lang="ts">
import { computed, ref } from 'vue'

export interface ShortcutItem {
  key: string
  keys: string[]
  desc: string
}

// 默认快捷键列表
const defaultShortcuts = ref<ShortcutItem[]>([
  { key: '1', keys: ['Ctrl', 'V'], desc: '粘贴图片' },
  { key: '2', keys: ['Delete'], desc: '删除涂鸦' },
  { key: '3', keys: ['Ctrl', 'I'], desc: '截屏' }
])

const props = withDefaults(
  defineProps<{
    visible?: boolean
    title?: string
    shortcuts?: ShortcutItem[]
  }>(),
  {
    visible: false,
    title: '功能介绍',
    shortcuts: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val)
    if (!val) emit('close')
  }
})

const handleClose = () => {
  visible.value = false
}
</script>
<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :footer="false"
    :width="520"
    @cancel="handleClose"
  >
    <div class="shortcut-content">
      <div class="shortcut-grid">
        <div v-for="item in shortcuts || defaultShortcuts" :key="item.key" class="shortcut-item">
          <div class="shortcut-keys">
            <span v-for="(key, index) in item.keys" :key="index" class="key-badge">
              {{ key }}
            </span>
          </div>
          <span class="shortcut-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.shortcut-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.15s ease;
  cursor: default;
}

.shortcut-item:hover {
  background: var(--color-fill-2);
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.key-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: -apple-system, 'SF Mono', 'Fira Code', monospace;
  color: var(--color-text-2);
  background: var(--color-fill-2);
  border-radius: 4px;
  border: 1px solid var(--color-border-2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  letter-spacing: 0.3px;
  transition: all 0.15s ease;
}

.shortcut-item:hover .key-badge {
  background: var(--color-fill-3);
  border-color: var(--color-border-3);
}

.shortcut-desc {
  font-size: 13px;
  color: var(--color-text-2);
  margin-left: 12px;
  white-space: nowrap;
  font-weight: 450;
}

.hint kbd {
  display: inline-block;
  padding: 0 6px;
  font-family: -apple-system, 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-3);
  background: var(--color-fill-2);
  border-radius: 3px;
  border: 1px solid var(--color-border-2);
  line-height: 18px;
  margin: 0 2px;
}
</style>
