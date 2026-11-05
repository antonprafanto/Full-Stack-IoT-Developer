// versi-server.ts - versi server Rumah Pintar Mini yang SEDANG berjalan, dibaca dari package.json (Modul 29).
// Sejak 2.0.0 proyek memakai SATU nomor versi untuk backend dan dashboard (sama dengan tag image dan tag Git v2.0.0). Nomor
// itu ditulis sekali di package.json, dinaikkan lewat pull request (robot memeriksanya dengan skrip/cek-versi.mjs), lalu
// dibaca di sini saat server menyala. Dipakai dua tempat: GET /health (kolom versi: siapa pun bisa memeriksa versi yang
// terpasang di produksi tanpa SSH) dan dokumentasi API /docs (OpenAPI info.version). Tidak ada lagi versi yang ditulis
// tangan di kode, jadi tidak ada yang bisa lupa diubah.
// Di image Docker, package.json ikut disalin ke /app (Dockerfile), jadi jalur ../../package.json sama di laptop dan di
// kontainer. Bukan services/versi.ts: berkas itu membandingkan versi FIRMWARE perangkat (Modul 28), urusan yang lain.
import { readFileSync } from "node:fs";

const paket = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string };

export const VERSI_SERVER: string = paket.version; // misalnya "2.0.0"
