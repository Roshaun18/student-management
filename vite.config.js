import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // dev server must run on a different port than the API (which listens on 3001)
  // 3000 is conventional; Vite will default to 5173 if this port is taken.
  server: {
    port: 5173, // cannot be 3001 while the Express backend is running
    proxy: {
      '/api': 'http://localhost:3001',
      '/health': 'http://localhost:3001'
    }
  }
})
