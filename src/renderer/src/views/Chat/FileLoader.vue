<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'
import { isImage } from '@renderer/utils/util'
import { FileSpreadsheet } from 'lucide-vue-next'
const props = defineProps(['fileId'])
const isImg = ref(false)
const fileDiskUrl = ref('')
const fileInfo = ref<{ filePath: string; fileName: string; extName: string; size: string }>({
  fileName: '',
  filePath: '',
  extName: '',
  size: ''
})

const getLocalPath = async (fileId) => {
  fileInfo.value = await window.api.getAllowFileById(fileId)
  isImg.value = isImage(fileInfo.value.extName)
  fileDiskUrl.value = `disk:///${fileInfo.value!.filePath}`
}

// 监听 id 变化，立即执行
watch(
  () => props.fileId,
  async (newId) => {
    if (!newId) return
    await getLocalPath(newId)
  },
  { immediate: true }
)

const openFile = (fileId) => {
  window.api.shellOpen(fileId)
}
</script>
<template>
  <div>
    <div v-if="isImg">
      <a-image
        width="500"
        footerPosition="outer"
        :alt="fileInfo.fileName"
        fit="cover"
        :title="fileInfo.fileName"
        :description="fileInfo.size"
        :src="fileDiskUrl"
        style="white-space: break-spaces; word-break: break-all"
      />
    </div>
    <a-list-item-meta
      v-else
      @click="openFile(fileId)"
      :title="fileInfo.fileName || '未命名'"
      :description="fileInfo.size"
      style="white-space: break-spaces; word-break: break-all"
    >
      <template #avatar>
        <FileSpreadsheet color="#66a5f3" :size="30" />
      </template>
    </a-list-item-meta>
  </div>
</template>

<style scoped></style>
