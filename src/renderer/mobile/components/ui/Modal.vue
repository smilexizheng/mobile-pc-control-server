<script setup>

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '默认标题'
  },
  width: {
    type: [String, Number],
    default: '90%'
  },
  maxHeight: {
    type: [String, Number],
    default: '80vh'
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  backgroundNone: {
    type: Boolean,
    default: false
  }


})

const emit = defineEmits(['update:modelValue'])

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>


<template>
  <transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="handleClose"
         :style="{ backdropFilter:  backgroundNone ? 'none':'blur(2px)', background: backgroundNone ? 'none' : 'rgba(0, 0, 0, 0.5)' }">
      <div
          class="modal"
          :style="{ height:  typeof maxHeight === 'number' ? `${width}px` : maxHeight, width: typeof width === 'number' ? `${width}px` : width,background: backgroundNone ? 'none' : '#fff' }">
        <!-- 头部 -->
        <div class="modal-header" v-if="showHeader">
          <h3>{{ title }}</h3>
          <button class="close-button" @click="handleClose">&times;</button>
        </div>

        <!-- 内容插槽 -->
        <div class="scroll-content">
          <slot></slot>
        </div>

        <!-- 底部操作插槽（可选） -->
        <div class="modal-actions" v-if="$slots.actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>


<style scoped lang="less">
/* 保持原有样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0 10px;
  min-height: 30vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #86868b;
  padding: 8px;
  -webkit-tap-highlight-color: transparent;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  margin: 10px 0;
}

.modal-actions {
  border: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  background: white;
  /*padding-top: 12px;*/
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}
</style>