<script setup>
import {onMounted, reactive, ref} from 'vue'

const versions = reactive({...window.electron.process.versions})

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
