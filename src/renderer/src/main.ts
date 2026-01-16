import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import router from './router'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'
import '@arco-design/web-vue/dist/arco.css'
import 'animate.css'

if (!window.electron) {
  window.location.href = '/mobile.html#/'
} else {
  createApp(App)
    .use(ArcoVue)
    .use(router)
    .use(createPinia())
    .use(VueKonva, { prefix: 'k' })
    .use(ArcoVueIcon)
    .mount('#app')
}
