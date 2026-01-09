<script setup lang="ts">
import TitleBar from './TitleBar.vue'
</script>

<template>
  <a-layout>
    <a-layout-header>
      <TitleBar />
    </a-layout-header>
    <a-layout>
      <a-layout-content>
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped></style>
