import './assets/main.css'
import '@nutui/nutui/dist/packages/toast/style/css'
import '@nutui/nutui/dist/packages/notify/style/css'
import '@nutui/nutui/dist/packages/dialog/style/css'
import '@nutui/nutui/dist/packages/imagepreview/style/css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Message from '@mobile/components/Message/useMessage'

const app = createApp(App).use(router).use(createPinia())
app.config.globalProperties.$message = Message

app.mount('#app')
