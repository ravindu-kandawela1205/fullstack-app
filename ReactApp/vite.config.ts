import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173, // (optional) default Vite port
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 👈 your Express backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
