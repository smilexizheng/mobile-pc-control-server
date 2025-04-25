<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Setting } from '../env'
import { useAppStore } from '../store/app'
import Versions from '@renderer/components/Versions.vue'

const visible = ref(false)
const about = ref(false)
const appStore = useAppStore()
const settingForm = ref<Setting>({ token: '', port: 0 })

onMounted(async () => {
  await appStore.initSetting()
  settingForm.value = { ...appStore.settings }
})

const handleSubmit = () => {
  appStore.updateSettings(settingForm.value)
  visible.value = false
}

const handleSelect = (v) => {
  console.log(v)
}
</script>

<template>
  <a-button type="text" @click="appStore.toggleTheme()">
    <template #icon>
      <icon-moon-fill v-if="appStore.isDark" />
      <icon-sun-fill v-else />
    </template>
  </a-button>

  <a-dropdown @select="handleSelect">
    <a-button type="text">
      <template #icon>
        <icon-list />
      </template>
    </a-button>
    <template #content>
      <a-doption @click="visible = true">系统设置</a-doption>
      <a-doption @click="about = true" :value="{ value: 'about' }">关于</a-doption>
    </template>
  </a-dropdown>
  <a-modal
    v-model:visible="visible"
    title="系统设置"
    :footer="false"
    :unmount-on-close="true"
    title-align="start"
  >
    <a-form :model="settingForm" @submit="handleSubmit">
      <a-form-item field="port" tooltip="启动端口" label="启动端口">
        <a-input-number v-model="settingForm.port" placeholder="端口号" />
      </a-form-item>
      <a-form-item field="name" tooltip="连接的令牌" label="访问令牌">
        <a-input-password v-model="settingForm.token" placeholder="请输入连接令牌" allow-clear />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit">确认</a-button>
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:visible="about"
    title="关于"
    :footer="false"
    :unmount-on-close="true"
    title-align="start"
  >
    <Versions />
  </a-modal>
</template>

<style scoped>
/deep/ .arco-btn-text,
.arco-btn-text[type='button'],
.arco-btn-text[type='submit'] {
  color: var(--color-text-3);
}
</style>
