<script setup lang="ts">

import {useRouter} from 'vue-router'
import {onMounted} from "vue";
import {useAppStore} from "@renderer/store/app";

const router = useRouter()
const appStore = useAppStore()


onMounted(() => {
  appStore.initTheme()
  router.replace('/')
})
</script>

<template>
  <RouterView/>
</template>
