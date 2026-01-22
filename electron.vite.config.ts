import { resolve } from 'path'
import { defineConfig, UserConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import NutUIResolver from '@nutui/auto-import-resolver'
import vueDevTools from 'vite-plugin-vue-devtools'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export default defineConfig((): UserConfig => {
  return {
    main: {
      build: {
        minify: isProd ? 'esbuild' : false,
        sourcemap: isDev
      }
    },
    preload: {
      build: {
        minify: isProd ? 'esbuild' : false,
        sourcemap: isDev
      }
    },
    renderer: {
      server: { host: true },
      build: {
        minify: isProd ? 'oxc' : false,
        rolldownOptions: {
          output: {
            minify: isProd
          },
          input: {
            browser: resolve(__dirname, 'src/renderer/index.html'),
            mobile: resolve(__dirname, 'src/renderer/mobile.html')
          }
        }
        // bugs github actions release   [[plugin vite:transform-reporter] TypeError: process.stdout.clearLine is not a function
        // isolatedEntries: true, //启用隔离构建可以减少生成的 chunk 数量,
        // externalizeDeps: false
      },
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@mobile': resolve('src/renderer/mobile')
        }
      },
      plugins: [
        vue(),
        Components({
          resolvers: [NutUIResolver()] // 开启 unplugin 插件，自动引入 NutUI 组件
        }),
        ...(isDev ? [vueDevTools()] : [])
      ]
    }
  }
})
