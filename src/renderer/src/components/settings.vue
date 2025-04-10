<script setup lang="ts">
import { ref } from "vue";
import {Setting} from "../env";
const settingForm = ref<Setting>({token:""});

const handleSubmit = () => {
  console.log(settingForm.value)
  window.electron.ipcRenderer.send('update-settings', {
    settings: {...settingForm.value}
  })
}
</script>

<template>
  <a-form :model="settingForm"  @submit="handleSubmit" >
    <a-form-item field="name" tooltip="输入连接令牌" label="令牌">
      <a-input
        v-model="settingForm.token"
        placeholder="请输入连接令牌"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">确认</a-button>
    </a-form-item>
  </a-form>
</template>


<style scoped>

</style>
