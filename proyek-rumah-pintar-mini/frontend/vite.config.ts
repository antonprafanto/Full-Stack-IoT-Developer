import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Modul 29: SATU nomor versi untuk seluruh proyek (backend, dashboard, image, dan tag Git v2.0.0). Nomor itu dibaca dari
// "version" di package.json di sebelah berkas ini setiap kali Vite berjalan, lalu ditulis ke JavaScript sebagai __VERSI_WEB__
// (lihat src/versi.d.ts): layar Masuk dan kepala dashboard menampilkannya, jadi siapa pun bisa melihat versi yang sedang
// terpasang tanpa SSH. Sengaja tidak memakai process.env.npm_package_version: variabel itu hanya ada bila Vite dijalankan
// lewat "npm run ...".
const paket: { version: string } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// https://vite.dev/config/
// Modul 29: npm test (Vitest) juga membaca berkas ini. Tes dashboard hanya menguji fungsi murni (src/*.test.ts) di Node.js,
// tanpa browser; plugin di bawah ikut dimuat tetapi tidak mengubah apa pun untuk tes itu.
export default defineConfig({
  // Vite mengganti setiap __VERSI_WEB__ di kode dengan teksnya, misalnya "2.0.0" (JSON.stringify menambah tanda petiknya)
  define: { __VERSI_WEB__: JSON.stringify(paket.version) },
  plugins: [
    react(),
    tailwindcss(),
    // Modul 27: dashboard bisa DIPASANG sebagai aplikasi di HP dan laptop (PWA). Plugin ini menulis dua berkas saat
    // npm run build: manifest.webmanifest (nama, ikon, warna aplikasi) dan sw.js (service worker = petugas kecil di
    // browser yang menyimpan cangkang dashboard). Browser hanya memakainya di alamat aman: https://... atau localhost.
    // Di npm run dev tidak ada service worker (hanya hasil build yang punya).
    VitePWA({
      // versi baru dashboard dipakai tanpa bertanya: sesudah image web dibangun ulang, browser mengambil sw.js baru dan
      // memakainya di pembukaan berikutnya (lihat README "Aplikasi di HP")
      registerType: 'autoUpdate',
      manifest: {
        name: 'Rumah Pintar Mini',
        // nama pendek di bawah ikon layar utama (sama dengan apple-mobile-web-app-title di index.html)
        short_name: 'Rumah Pintar',
        description: 'Dashboard Rumah Pintar Mini: sensor, kendali, dan riwayat rumahmu',
        lang: 'id',
        // halaman pertama saat ikon diketuk, dan batas alamat yang dianggap "di dalam aplikasi"
        start_url: '/',
        scope: '/',
        // jendela sendiri tanpa bilah alamat, seperti aplikasi biasa
        display: 'standalone',
        // warna layar pembuka (= latar halaman, bg-slate-100) dan warna bilah atas (sama dengan theme-color di index.html)
        background_color: '#f1f5f9',
        theme_color: '#1d293d',
        // ikon di folder public/, dibuat dari favicon.svg (rumah garis yang sama dengan apple-touch-icon.png Modul 24).
        // 192 dan 512 = ukuran yang diminta Chrome untuk tombol Install. "maskable" = versi berlatar penuh yang boleh
        // dipotong peluncur Android menjadi lingkaran atau kotak bulat: gambar rumahnya di tengah, di dalam zona aman.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // CANGKANG saja yang disimpan service worker: berkas hasil build (HTML, JavaScript, CSS, favicon.svg); ikon di
        // manifest ikut disimpan sendiri oleh plugin. Data rumah (/api/...) dan sambungan live tidak pernah disimpan:
        // selalu diminta ke server, jadi angka di layar tidak pernah basi diam-diam.
        globPatterns: ['**/*.{js,css,html,svg}'],
        // alamat layar seperti /peta atau /perangkat/f00d00000001 dijawab index.html dari simpanan (React Router memilih
        // layarnya), juga saat internet putus: aplikasi tetap terbuka dan menulis pesan bahwa server tidak terjangkau
        navigateFallback: '/index.html',
        // ...KECUALI alamat yang bukan layar dashboard: API (/api), Grafana (/grafana/, Modul 27), Socket.IO
        // (/socket.io bila VITE_API_BASE=/), dan unduhan firmware perangkat (/fw/, Modul 28). Alamat itu selalu diteruskan
        // ke server, tidak pernah diganti index.html. (Jawabannya juga tidak pernah disimpan: hanya berkas globPatterns.)
        navigateFallbackDenylist: [/^\/api(\/|$)/, /^\/grafana(\/|$)/, /^\/socket\.io(\/|$)/, /^\/fw(\/|$)/],
      },
    }),
  ],
  // Modul 22: selalu di port 5173 (alamat yang diizinkan CORS_ORIGIN backend).
  // Kalau port itu sedang dipakai, berhenti dengan galat, jangan pindah diam-diam ke 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Modul 23 Praktik 8) juga di 5173: port bawaannya (4173) tidak ada di CORS_ORIGIN, jadi login pasti ditolak.
  // Hentikan npm run dev dulu sebelum menjalankan preview.
  preview: { port: 5173, strictPort: true },
})
