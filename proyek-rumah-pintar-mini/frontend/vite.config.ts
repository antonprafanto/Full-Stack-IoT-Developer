import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Modul 22: selalu di port 5173 (alamat yang diizinkan CORS_ORIGIN backend).
  // Kalau port itu sedang dipakai, berhenti dengan galat, jangan pindah diam-diam ke 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Praktik 8) juga di 5173: port bawaannya (4173) tidak ada di CORS_ORIGIN, jadi login pasti ditolak.
  // Hentikan npm run dev dulu sebelum menjalankan preview.
  preview: { port: 5173, strictPort: true },
})
