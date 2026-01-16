import { resolve } from 'path'
import { defineConfig, UserConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import NutUIResolver from '@nutui/auto-import-resolver'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }): UserConfig => {
  return {
    main: {},
    preload: {},
    renderer: {
      server: { host: true },
      build: {
        rollupOptions: {
          input: {
            browser: resolve(__dirname, 'src/renderer/index.html'),
            mobile: resolve(__dirname, 'src/renderer/mobile.html')
          }
        },
        isolatedEntries: true //启用隔离构建可以减少生成的 chunk 数量
      },

      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@mobile': resolve('src/renderer/mobile')
        }
      },
      plugins: [
        vue(), // 开启 unplugin 插件，自动引入 NutUI 组件
        Components({
          resolvers: [NutUIResolver()]
        }),
        mode === 'development' ? vueDevTools() : null
      ]
    }
  }
})
