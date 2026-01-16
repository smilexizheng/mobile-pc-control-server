<script setup>
import { useSocketStore } from '@mobile/stores/socket.js'
import { Uploader } from '@nutui/icons-vue'

const socket = useSocketStore()

const handleFileSelect = async (files) => {
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      socket.handleUpload(files[i])
    }
  }
  return files
}
</script>

<template>
  <div class="upload-container">
    <nut-uploader :auto-upload="false" :before-upload="handleFileSelect" multiple>
      <nut-button icon="plus" type="success"
        >上传文件
        <template #icon>
          <Uploader />
        </template>
      </nut-button>
    </nut-uploader>

    <div v-for="file in Object.values(socket.uploadFiles)" :key="file.id" class="file-item">
      <nut-cell :title="file.name" :desc="`${file.progress}%`" />
      <nut-progress :percentage="file.progress" stroke-width="4" />
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  padding: 16px;
}

.file-item {
  margin-top: 12px;
}
</style>
