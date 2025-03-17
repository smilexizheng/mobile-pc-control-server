<script setup>
import {ref} from "vue";

const title = ref(window.document.title)

</script>

<template>
  <div class="title-bar">
    <img alt="logo" class="min-logo" src="../assets/logo.svg" />
    {{title}}
  </div>
</template>

<style scoped>
.title-bar {
  user-select: none;
  app-region: drag;
  height: 26px;
  width: 100%;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: #333;
  gap: 8px;
  font-size: 14px;
}

.min-logo {
  height: 24px;
  width: 24px;
}
</style>
