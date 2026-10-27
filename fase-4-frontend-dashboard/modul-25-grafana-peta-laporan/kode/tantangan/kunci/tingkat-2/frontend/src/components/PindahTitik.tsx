// PindahTitik.tsx - Tantangan 2 Modul 25: admin memindah titik perangkat di Peta. Klik peta di letak baru -> kotak kecil
// berisi lintang dan bujur titik itu (masih boleh diketik ulang) -> Simpan titik -> PUT /devices/:id/lokasi.
// Dipasang PetaPerangkat DI DALAM <MapContainer> (useMapEvents butuh peta), hanya untuk admin dan hanya selama "mode pindah".
import { zodResolver } from "@hookform/resolvers/zod";
import type { LatLng } from "leaflet";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Popup, useMapEvents } from "react-leaflet";
import { z } from "zod";
import { ambilPerangkat, GalatApi, ubahLokasi } from "../api";
import { toast } from "../toast";
import { useToko } from "../toko";
import type { Perangkat } from "../types";

// Aturan yang sama dengan skema Lokasi di backend (routes/perangkat.ts), termasuk kalimat galatnya. Backend tetap memeriksa
// ulang; skema di sini hanya supaya kesalahan terlihat sebelum dikirim.
const Titik = z.object({
  lat: z.number({ error: "Isi dengan angka" }).min(-90, "lintang paling kecil -90").max(90, "lintang paling besar 90"),
  lng: z.number({ error: "Isi dengan angka" }).min(-180, "bujur paling kecil -180").max(180, "bujur paling besar 180"),
});
type Titik = z.infer<typeof Titik>;

const KOTAK = "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-600 dark:bg-slate-900";

// Formulir satu titik. key={…} di pemanggilnya: setiap klik baru = formulir baru dengan isi awal titik klik itu.
function FormTitik({ p, awal, selesai }: { p: Perangkat; awal: LatLng; selesai: () => void }) {
  const bulat = (n: number) => Math.round(n * 1e6) / 1e6; // 6 angka di belakang titik = sekitar 10 cm, cukup untuk rumah
  const { register, handleSubmit, setError, formState } = useForm<Titik>({
    resolver: zodResolver(Titik),
    defaultValues: { lat: bulat(awal.lat), lng: bulat(awal.lng) },
  });
  const { errors, isSubmitting } = formState;

  async function simpan(isi: Titik) {
    try {
      await ubahLokasi(p.device_id, isi.lat, isi.lng);
      useToko.getState().setPerangkat(await ambilPerangkat()); // daftar baru: penanda pindah, peta dipaskan ulang
      toast("Titik " + (p.nama ?? p.device_id) + " dipindah.", "sukses");
      selesai();
    } catch (err) {
      setError("root.server", { message: err instanceof GalatApi ? err.message : "Titik gagal disimpan." });
    }
  }

  return (
    <form onSubmit={handleSubmit(simpan)} className="flex min-w-52 flex-col gap-2 font-sans text-sm">
      <strong>Pindahkan {p.nama ?? p.device_id} ke sini?</strong>
      {(["lat", "lng"] as const).map((kolom) => (
        <label key={kolom} className="block">
          {kolom === "lat" ? "Lintang (lat)" : "Bujur (lng)"}
          <input type="number" step="any" inputMode="decimal" {...register(kolom, { valueAsNumber: true })} className={KOTAK} />
          {errors[kolom] ? <span className="text-red-700 dark:text-red-300">{errors[kolom]?.message}</span> : null}
        </label>
      ))}
      {errors.root?.server ? <span role="alert" className="text-red-700 dark:text-red-300">{errors.root.server.message}</span> : null}
      <span className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-lg bg-teal-700 px-3 font-medium text-white disabled:opacity-60">
          {isSubmitting ? "Menyimpan…" : "Simpan titik"}
        </button>
        <button type="button" onClick={selesai} className="min-h-11 rounded-lg border border-slate-300 px-3 dark:border-slate-600">
          Batal
        </button>
      </span>
    </form>
  );
}

export default function PindahTitik({ p, selesai }: { p: Perangkat; selesai: () => void }) {
  const [klik, setKlik] = useState<LatLng | null>(null);
  useMapEvents({ click: (e) => setKlik(e.latlng) }); // klik di peta (bukan di penanda atau popup) = letak baru
  if (klik === null) return null;
  return (
    // popup di letak klik. Ditutup dengan ✕ = batal memilih titik ini saja; klik di tempat lain membuka kotak baru.
    <Popup position={klik}>
      <FormTitik key={klik.toString()} p={p} awal={klik} selesai={selesai} />
    </Popup>
  );
}
