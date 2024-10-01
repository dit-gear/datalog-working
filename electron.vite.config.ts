import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@components': resolve(__dirname, './src/renderer/src/components'),
        '@shared': resolve('src/shared'),
        '@workers': resolve('src/renderer/src/workers')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          browser: resolve(__dirname, 'src/renderer/index.html'),
          editor: resolve(__dirname, 'src/renderer/editor.html')
        }
      }
    }
  }
})
