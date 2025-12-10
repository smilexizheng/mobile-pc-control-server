<script setup lang="ts">
import HeadToolBar from '@renderer/views/Draw/layout/HeadToolBar.vue'
import GraffitiConfig from '@renderer/views/Draw/layout/GraffitiConfig.vue'
import DrawMain from '@renderer/views/Draw/konva/index.vue'
import ShapeConfig from '@renderer/views/Draw/konva/ShapeConfig.vue'
</script>

<template>
  <div class="main-layout">
    <a-layout>
      <a-layout-header> <GraffitiConfig /> <HeadToolBar /> </a-layout-header>
      <a-layout>
        <a-layout-sider :resize-directions="['right']">
          <ShapeConfig />
        </a-layout-sider>
        <a-layout-content> <DrawMain /></a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-layout :deep(.arco-layout-content) {
  display: flex;
}

.layout-demo :deep(.arco-layout-header),
.layout-demo :deep(.arco-layout-footer) {
  height: 70px;
}

.main-layout :deep(.arco-layout-sider) {
  width: 300px;
  min-width: 200px;
  max-width: 300px;
  height: 100%;
}
</style>
