import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Module 27: the dashboard can be INSTALLED as an app on phones and laptops (PWA). This plugin writes two files at
    // npm run build: manifest.webmanifest (the app's name, icons, colors) and sw.js (the service worker = a small helper in
    // the browser that keeps the dashboard's shell). The browser only uses them at a secure address: https://... or localhost.
    // npm run dev has no service worker (only the build result has one).
    VitePWA({
      // a new dashboard version is used without asking: after the web image is rebuilt, the browser fetches the new sw.js and
      // uses it the next time the app is opened (see the README "A phone app")
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mini Smart Home',
        // the short name under the home-screen icon (the same as apple-mobile-web-app-title in index.html)
        short_name: 'Smart Home',
        description: 'Mini Smart Home dashboard: sensors, controls, and history of your home',
        lang: 'en',
        // the first page when the icon is tapped, and the address range that counts as "inside the app"
        start_url: '/',
        scope: '/',
        // its own window without an address bar, like an ordinary app
        display: 'standalone',
        // the splash-screen color (= the page background, bg-slate-100) and the top-bar color (the same as theme-color in index.html)
        background_color: '#f1f5f9',
        theme_color: '#1d293d',
        // icons in the public/ folder, made from favicon.svg (the same line-drawn house as Module 24's apple-touch-icon.png).
        // 192 and 512 = the sizes Chrome asks for its Install button. "maskable" = a full-background version that an Android
        // launcher may cut into a circle or a rounded square: the house sits in the middle, inside the safe zone.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // ONLY the SHELL is kept by the service worker: the build files (HTML, JavaScript, CSS, favicon.svg); the manifest's
        // icons are kept by the plugin itself. The home's data (/api/...) and the live connection are never kept: they
        // are always asked from the server, so the numbers on screen never go stale quietly.
        globPatterns: ['**/*.{js,css,html,svg}'],
        // screen addresses such as /map or /devices/f00d00000001 are answered with index.html from the store (React Router
        // picks the screen), also while the internet is down: the app stays open and says the server can't be reached
        navigateFallback: '/index.html',
        // ...EXCEPT the addresses that aren't dashboard screens: the API (/api), Grafana (/grafana/, Module 27), and Socket.IO
        // (/socket.io when VITE_API_BASE=/). Those addresses always go on to the server, never replaced by index.html.
        navigateFallbackDenylist: [/^\/api(\/|$)/, /^\/grafana(\/|$)/, /^\/socket\.io(\/|$)/],
      },
    }),
  ],
  // Module 22: always on port 5173 (the address the backend's CORS_ORIGIN allows).
  // If that port is in use, stop with an error, don't quietly move to 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Module 23 Practice 8) is on 5173 too: its default port (4173) isn't in CORS_ORIGIN, so login would be refused.
  // Stop npm run dev first before running preview.
  preview: { port: 5173, strictPort: true },
})
