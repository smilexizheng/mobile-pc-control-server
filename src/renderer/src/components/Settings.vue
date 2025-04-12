<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Setting} from "../env";
import {useAppStore} from "../store/app";
const visible = ref(false)
const appStore = useAppStore();
const settingForm = ref<Setting>({token: "", port: 0});

onMounted(async () => {
  await appStore.initSetting()
  settingForm.value ={...appStore.settings}
})

const handleSubmit = () => {
 appStore.updateSettings(settingForm.value);
 visible.value = false;
}
</script>

<template>

  <icon-settings class="settings-btn" @click="visible=true"/>
  <a-modal v-model:visible="visible" title="系统设置" :footer="false" :unmount-on-close="true" title-align="start">

  <a-form :model="settingForm"  @submit="handleSubmit" >
    <a-form-item field="port" tooltip="启动端口" label="启动端口">
      <a-input-number
        v-model="settingForm.port"
        placeholder="端口号"
      />
    </a-form-item>
    <a-form-item field="name" tooltip="连接的令牌" label="访问令牌">
      <a-input-password
        v-model="settingForm.token"
        placeholder="请输入连接令牌"
        allow-clear
      />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit">确认</a-button>
    </a-form-item>
  </a-form>
  </a-modal>
</template>


<style scoped>

</style>
