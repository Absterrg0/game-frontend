import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
// Note: No proxy for /api - session cookies require requests to go directly to backend
// so the browser sends the cookie (same-site: backend domain)
export default defineConfig({
  envPrefix: ['VITE_', 'REACT_APP_'], // REACT_APP_ for backward compat with CRA .env
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
