import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Module 22: always on port 5173 (the address the backend's CORS_ORIGIN allows).
  // If that port is in use, stop with an error, don't quietly move to 5174.
  server: { port: 5173, strictPort: true },
})
