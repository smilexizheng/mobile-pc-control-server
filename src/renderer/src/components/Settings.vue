<script setup lang="ts">
import { ref } from 'vue'
import { Setting } from '../env'
import { useAppStore } from '../store/app'
import Versions from '@renderer/components/Versions.vue'

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
</script>

<template>
  <a-button type="text" @click="appStore.toggleTheme()">
    <template #icon>
      <icon-moon-fill v-if="appStore.isDark" />
      <icon-sun-fill v-else />
    </template>
  </a-button>

  <a-dropdown>
    <a-button type="text">
      <template #icon>
        <icon-menu />
      </template>
    </a-button>
    <template #content>
      <a-doption @click="appStore.settingsVisible = true">系统设置</a-doption>
      <a-doption :value="{ value: 'about' }" @click="appStore.aboutVisible = true">关于</a-doption>
    </template>
  </a-dropdown>
  <a-modal
    v-model:visible="appStore.settingsVisible"
    width="600px"
    title="系统设置"
    :footer="false"
    :unmount-on-close="true"
    title-align="start"
    @before-open="() => (settingForm = { ...appStore.settings } as Setting)"
  >
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
  </a-modal>

  <a-modal
    v-model:visible="appStore.aboutVisible"
    width="auto"
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
