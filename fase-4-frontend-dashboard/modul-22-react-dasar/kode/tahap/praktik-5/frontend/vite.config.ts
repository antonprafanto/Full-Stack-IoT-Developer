import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Modul 22: selalu di port 5173 (alamat yang diizinkan CORS_ORIGIN backend).
  // Kalau port itu sedang dipakai, berhenti dengan galat, jangan pindah diam-diam ke 5174.
  server: { port: 5173, strictPort: true },
})
