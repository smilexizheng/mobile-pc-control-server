<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Setting } from '@renderer/env'
import { useAppStore } from '@renderer/store/app'
const appStore = useAppStore()
const settingForm = ref<Setting>({
  token: '',
  port: 0,
  hostname: '',
  quality: 50,
  autoStart: true
})

const handleSubmit = (): void => {
  appStore.updateSettings(settingForm.value)
  appStore.settingsVisible = false
}

onMounted(() => {
  settingForm.value = { ...appStore.settings } as Setting
})
</script>

<template>
  <a-form :model="settingForm" @submit="handleSubmit">
    <a-form-item field="hostname" tooltip="默认绑定所有网络IP接口" label="主机IP">
      <a-select v-model="settingForm.hostname" placeholder="主机IP">
        <a-option value="0.0.0.0">所有</a-option>
        <a-option v-for="ip in appStore.ips" :key="ip" :value="ip">{{ ip }}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="port" tooltip="项目端口" label="端口">
      <a-input-number v-model="settingForm.port" :max="65535" placeholder="端口号" />
    </a-form-item>
    <a-form-item field="token" tooltip="远程时的令牌,用于身份验证" label="访问令牌">
      <a-input-password v-model="settingForm.token" placeholder="请输入连接令牌" allow-clear />
    </a-form-item>
    <a-form-item field="quality" tooltip="远程屏幕画质10-100" label="屏幕画质">
      <a-input-number
        v-model="settingForm.quality"
        :min="10"
        :max="100"
        placeholder="请输入10-100"
        allow-clear
      />
    </a-form-item>
    <a-form-item field="autoStart" tooltip="开机自启" label="开机自启">
      <a-switch v-model="settingForm.autoStart" />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit">确认</a-button>
    </a-form-item>
  </a-form>
</template>

<style scoped></style>
