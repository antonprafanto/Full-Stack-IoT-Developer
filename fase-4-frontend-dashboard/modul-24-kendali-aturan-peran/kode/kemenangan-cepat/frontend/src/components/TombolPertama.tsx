// TombolPertama.tsx - Kemenangan Cepat Modul 24: SATU tombol sementara yang menyuruh backend menyalakan lampu.
// Tanpa paket baru: hanya fetch POST /devices/:id/command, lalu jawaban backend ditulis apa adanya di bawah tombol.
// Akun admin: 200 + ack dari perangkat. Akun viewer: 403, karena backend yang menjaga peran, bukan tombolnya.
// Sesudah selesai mencoba, HAPUS berkas ini dan dua baris TombolPertama di DetailPerangkat.tsx. Tombol yang sesungguhnya
// (dengan "Menunggu konfirmasi perangkat…") dibuat di Praktik 5.
import { useState } from "react";
import { BASE } from "../api";

export default function TombolPertama({ deviceId }: { deviceId: string }) {
  const [hasil, setHasil] = useState(""); // jawaban backend, ditulis apa adanya

  async function nyalakanLampu() {
    setHasil("Mengirim… (backend menunggu jawaban perangkat, paling lama 5 detik)");
    try {
      const res = await fetch(BASE + "/devices/" + deviceId + "/command", {
        method: "POST",
        credentials: "include", // bawa cookie login: dari situ backend tahu siapa kita dan apa perannya
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "lampu", nilai: true }), // perintah yang sama dengan Bruno "nyalakan lampu"
      });
      // 401 = gelang 15 menit sudah habis (tombol percobaan ini tidak memperbaruinya): muat ulang halaman, lalu coba lagi
      setHasil(res.status + " " + (await res.text()));
    } catch {
      setHasil("Tidak bisa menghubungi backend: apakah backend menyala?");
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-amber-500 bg-white p-3 dark:bg-slate-800">
      <button
        type="button"
        onClick={nyalakanLampu}
        className="min-h-11 rounded-lg bg-amber-400 px-4 font-medium text-slate-900 hover:bg-amber-300"
      >
        Nyalakan lampu (percobaan)
      </button>
      <p className="mt-2 font-mono text-xs break-all text-slate-700 dark:text-slate-200">{hasil}</p>
    </div>
  );
}
