import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@mobile/router/index.js'

export const useAppStore = defineStore('app', () => {
  const title = ref('PC-CSE')
  const navBarVisible = ref(false)
  const backVisible = ref(true)

  router.beforeEach((to, from) => {
    if (to.path == '/' || to.path == '/mouse' || to.path == '/game') {
      hideNavBar()
    } else {
      showNavBar()
    }
    title.value = to.name

    return true
  })

  const setTitle = (title) => {
    title.value = title
  }
  const hideNavBar = () => {
    navBarVisible.value = false
  }

  const showNavBar = () => {
    navBarVisible.value = true
  }

  const showBackBtn = () => {
    backVisible.value = true
  }

  const hideBackBtn = () => {
    backVisible.value = true
  }

  return {
    title,
    navBarVisible,
    backVisible,
    hideNavBar,
    showNavBar,
    showBackBtn,
    hideBackBtn,
    setTitle
  }
})
