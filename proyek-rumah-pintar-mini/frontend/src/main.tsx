import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// Modul 24: BrowserRouter membaca alamat di browser (misalnya /perangkat/f00d00000001) dan memberikannya ke <Routes> di App
// Modul 24 Praktik 5: useTransitions={false} = pindah layar tidak boleh menunggu tombol. Tanpanya, pindah menu dan tombol yang
// masih "Menunggu konfirmasi perangkat…" (useTransition) sama-sama transisi React yang saling menunggu, sehingga layar lama
// tertahan sampai perangkat menjawab (bisa ±5 detik). Dengan false, layar baru langsung tampil; hasil perintahnya tetap masuk.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
