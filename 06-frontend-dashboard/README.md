# 📊 06 - Real-time Web Dashboard & Digital Twin

Folder ini berisi antarmuka dashboard modern berbasis Next.js 15, visualisasi performa tinggi 60 FPS, dan integrasi peta GIS (**Fase 9**):

## 📂 Struktur Direktori:
- `nextjs-dashboard/` : Aplikasi web modern Next.js 15 + TypeScript + Tailwind CSS + Lucide Icons.
- `web-workers/` : Background worker thread browser untuk parsing dataset sensor masif (>100k points).
- `echarts-components/` : Komponen grafik interaktif real-time berbasis Apache ECharts / uPlot (Canvas/WebGL).
- `gis-tracking/` : Peta pelacakan armada GPS Mapbox GL JS / Leaflet dengan animasi poligon Geofencing.

---

## 🎯 Target Pembelajaran:
1. Mengimplementasikan pola sinkronisasi status **Digital Twin (Desired vs Reported State)**.
2. Membangun antarmuka monitoring live telemetry bebas lag (60 FPS) dengan WebSockets.
3. Menampilkan rute armada aset bergerak di peta interaktif secara real-time.
