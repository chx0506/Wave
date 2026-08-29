import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { installDevApi } from './server/devApi.mjs'

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), '')
  process.env.OPENAI_NEXT_API_KEY ??= serverEnv.OPENAI_NEXT_API_KEY
  process.env.OPENAI_NEXT_MODEL ??= serverEnv.OPENAI_NEXT_MODEL

  return {
    plugins: [
      {
        name: 'wave-dev-api',
        configureServer(server) {
          installDevApi(server)
        },
      },
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
