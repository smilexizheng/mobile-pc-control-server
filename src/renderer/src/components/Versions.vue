<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
const appVersion = ref('')
onMounted(async () => {
  appVersion.value = await window.api.getAppVersion()
})
</script>

<template>
  <ul class="versions">
    <li class="electron-version">Core v{{ appVersion }}</li>
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
  </ul>
</template>

<style scoped>
.versions {
  //position: absolute;
  //bottom: 30px;
  margin: 0 auto;
  padding: 15px 0;
  font-family: 'Menlo', 'Lucida Console', monospace;
  display: inline-flex;
  overflow: hidden;
  align-items: center;
  border-radius: 22px;
  background-color: var(--color-fill-4);
  backdrop-filter: blur(24px);
}

.versions li {
  display: block;
  float: left;
  border-right: 1px solid var(--color-border-4);
  padding: 0 20px;
  font-size: 14px;
  line-height: 14px;
  opacity: 0.8;

  & :last-child {
    border: none;
  }
}
</style>
