<script setup lang="ts">
import TitleBar from './TitleBar.vue'
import LeftMenu from './LeftMenu.vue'
</script>

<template>
  <a-layout>
    <a-layout-header><TitleBar /> </a-layout-header>
    <a-layout>
      <LeftMenu />
      <a-layout-content>
        <RouterView />
      </a-layout-content>
    </a-layout>
    <a-layout-footer></a-layout-footer>
  </a-layout>
</template>

<style scoped></style>
