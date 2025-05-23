import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@react-pdf/renderer', '@react-email/render'] })],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/main/index.ts'),
          renderWorker: resolve('src/main/core/render/renderWorker.ts')
        }
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'src/shared')
      }
    },
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          mainPreload: resolve(__dirname, 'src/preload/main/mainPreload.ts'),
          editorPreload: resolve(__dirname, 'src/preload/editor/editorPreload.ts'),
          sendPreload: resolve(__dirname, 'src/preload/send/sendPreload.ts')
        }
      }
    }
  },
  renderer: {
    worker: {
      format: 'es'
    },
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
          mainWindow: resolve(__dirname, 'src/renderer/index.html'),
          editorWindow: resolve(__dirname, 'src/renderer/editor.html'),
          sendWindow: resolve(__dirname, 'src/renderer/send.html'),
          aboutWindow: resolve(__dirname, 'src/renderer/about.html'),
          onboardWindow: resolve(__dirname, 'src/renderer/onboarding.html')
        }
      }
    }
  }
})
