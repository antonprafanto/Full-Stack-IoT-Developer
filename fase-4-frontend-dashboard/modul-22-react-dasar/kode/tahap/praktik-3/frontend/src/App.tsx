// App.tsx - komponen paling atas dashboard. Praktik 3: kartu-kartu sensor dari SATU bacaan contoh
// (belum dari API: Praktik 4 menyambung ke backend untuk login, bacaan sungguhan baru datang di Praktik 6).
import KartuSensor from "./components/KartuSensor";
import type { TelemetryNode1 } from "./types";

// Bacaan ini DISALIN dari keluaran `node generate-dummy.js` (folder alat, Modul 4), baris "Contoh bacaan pertama".
// generate-dummy.js sengaja tidak di-import: ia memakai node:fs (khusus Node.js) yang tidak ada di browser.
// Label tipe TelemetryNode1 membuat TypeScript memeriksa setiap kolomnya: salah ketik langsung ditandai.
const bacaan: TelemetryNode1 = {
  ts: "2026-10-23T09:56:59Z",
  fw: "0.1.0",
  suhu: 28.1,
  kelembapan: 71,
  cahaya: 473,
  tanah: 38,
  gerak: false,
  level_air: 57,
};

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-teal-700">Rumah Pintar Mini</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bacaan contoh dari generate-dummy.js (belum dari API) · firmware {bacaan.fw} · ts {bacaan.ts}
        </p>
        {/* satu cetakan KartuSensor dipakai enam kali; yang berbeda hanya props-nya */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <KartuSensor label="Suhu" nilai={bacaan.suhu} satuan="°C" warna="text-teal-600" />
          <KartuSensor label="Kelembapan" nilai={bacaan.kelembapan} satuan="%" />
          <KartuSensor label="Cahaya" nilai={bacaan.cahaya} satuan="/4095" />
          <KartuSensor label="Kelembapan tanah" nilai={bacaan.tanah} satuan="%" />
          <KartuSensor label="Gerakan" nilai={bacaan.gerak ? "Ada" : "Tidak ada"} />
          <KartuSensor label="Air tandon" nilai={bacaan.level_air} satuan="%" />
        </div>
      </div>
    </main>
  );
}
