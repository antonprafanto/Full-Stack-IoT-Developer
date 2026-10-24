// BandingRiwayat.tsx - Kunci Tantangan Tingkat 3 Modul 23: suhu rata-rata per jam DUA perangkat dalam satu grafik
// 7 hari. Dua permintaan dikirim bersamaan (Promise.all), lalu jawabannya digabung menurut awal ember (kolom waktu).
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ambilRiwayat, GalatApi } from "../api";
import { useToko } from "../toko";
import type { DataRiwayat, Perangkat } from "../types";
import { HARI, hariTanggalWib, JAM, tanggalJamWib, ticksTiap } from "../waktu";

// satu baris grafik: waktu (milidetik) + suhu rata-rata perangkat A dan B; null = tidak ada data jam itu
type Baris = { t: number; a: number | null; b: number | null };

// gabungkan - dua riwayat 7 hari (ember 1 jam) menjadi satu larik baris, urut waktu.
// Jam yang hanya ada di satu perangkat tetap masuk, dengan null untuk perangkat lainnya (garisnya putus di situ).
// Jam yang kosong di KEDUA perangkat diberi satu baris null, supaya garisnya tidak menyambung melewati celah.
function gabungkan(a: DataRiwayat, b: DataRiwayat): Baris[] {
  const peta = new Map<number, Baris>(); // kunci = waktu awal ember dalam milidetik
  for (const p of a.titik) {
    const t = Date.parse(p.waktu);
    peta.set(t, { t, a: p.suhu_rata, b: null });
  }
  for (const p of b.titik) {
    const t = Date.parse(p.waktu);
    const ada = peta.get(t);
    if (ada !== undefined) ada.b = p.suhu_rata; // jam yang sama sudah ada dari perangkat A: lengkapi
    else peta.set(t, { t, a: null, b: p.suhu_rata });
  }
  const urut = [...peta.values()].sort((x, y) => x.t - y.t);
  const hasil: Baris[] = [];
  for (const baris of urut) {
    const sebelum = hasil.at(-1);
    if (sebelum !== undefined && baris.t - sebelum.t > 1.5 * JAM) hasil.push({ t: sebelum.t + 1, a: null, b: null });
    hasil.push(baris);
  }
  return hasil;
}

// kotak pilihan perangkat (elemen <select> bawaan browser)
function PilihPerangkat(props: { label: string; daftar: Perangkat[]; nilai: string; onPilih: (id: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
      {props.label}
      <select
        value={props.nilai}
        onChange={(e) => props.onPilih(e.target.value)}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        {props.daftar.map((p) => (
          <option key={p.device_id} value={p.device_id}>
            {p.nama ?? p.device_id}
          </option>
        ))}
      </select>
    </label>
  );
}

type Props = {
  onKembali: () => void;
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (sesudah refresh pun gagal)
};

export default function BandingRiwayat({ onKembali, onSesiHabis }: Props) {
  const perangkat = useToko((s) => s.perangkat); // daftar dari layar Daftar Perangkat; null = belum dimuat
  // bawaan: dua perangkat pertama di daftar
  const [idA, setIdA] = useState(() => perangkat?.[0]?.device_id ?? "");
  const [idB, setIdB] = useState(() => perangkat?.[1]?.device_id ?? "");
  const [data, setData] = useState<[DataRiwayat, DataRiwayat] | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (idA === "" || idB === "" || idA === idB) return;
    let ignore = false;
    // Dua permintaan BERSAMAAN, bukan satu per satu: Promise.all menunggu keduanya selesai,
    // dan langsung gagal begitu salah satunya gagal.
    Promise.all([ambilRiwayat(idA, "7hari"), ambilRiwayat(idB, "7hari")])
      .then((keduanya) => {
        if (!ignore) setData(keduanya);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat riwayat.");
      });
    return () => {
      ignore = true;
    };
  }, [idA, idB, onSesiHabis]);

  // ganti pilihan: kosongkan grafik lama dulu, supaya tidak tampak seperti milik pasangan yang baru
  function pilihA(id: string) {
    setIdA(id);
    setData(null);
    setGalat(null);
  }
  function pilihB(id: string) {
    setIdB(id);
    setData(null);
    setGalat(null);
  }

  const daftar = perangkat ?? [];
  const nama = (id: string) => daftar.find((p) => p.device_id === id)?.nama ?? id;

  let isi;
  if (daftar.length < 2) {
    isi = <p className="mt-4 text-slate-600 dark:text-slate-300">Butuh paling sedikit dua perangkat di daftar untuk dibandingkan.</p>;
  } else if (idA === idB) {
    isi = <p className="mt-4 text-slate-600 dark:text-slate-300">Pilih dua perangkat yang berbeda.</p>;
  } else if (galat !== null) {
    isi = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  } else if (data === null) {
    isi = <p className="mt-4 text-slate-500 dark:text-slate-400">Memuat riwayat…</p>;
  } else {
    const [a, b] = data;
    const baris = gabungkan(a, b);
    // sumbu X = gabungan kedua rentang (jam "sekarang" kedua jawaban bisa berbeda beberapa milidetik)
    const dari = Math.min(Date.parse(a.dari), Date.parse(b.dari));
    const sampai = Math.max(Date.parse(a.sampai), Date.parse(b.sampai));
    isi = (
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Suhu rata-rata per jam (°C) · 7 hari</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {nama(idA)}: {a.titik.length} titik · {nama(idB)}: {b.titik.length} titik
        </p>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          <LineChart responsive data={baris} style={{ width: "100%", height: 280 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--warna-garis)" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[dari, sampai]}
              ticks={ticksTiap(dari, sampai, HARI)}
              tickFormatter={hariTanggalWib}
              tick={{ fill: "currentColor" }}
              stroke="var(--warna-garis)"
            />
            <YAxis domain={["auto", "auto"]} width={44} tick={{ fill: "currentColor" }} stroke="var(--warna-garis)" />
            <Tooltip
              labelFormatter={(t) => tanggalJamWib(Number(t))}
              contentStyle={{ backgroundColor: "var(--warna-panel)", borderColor: "var(--warna-garis)", borderRadius: 8 }}
            />
            {/* keterangan = nama perangkat di samping contoh garisnya: warna tidak pernah sendirian. Tulisannya memakai
                warna teks biasa, karena tulisan jingga di atas latar putih sulit dibaca. */}
            <Legend formatter={(teks) => <span className="text-slate-700 dark:text-slate-200">{teks}</span>} />
            {/* biru dan jingga: pasangan warna yang tetap bisa dibedakan oleh kebanyakan orang buta warna */}
            <Line dataKey="a" name={nama(idA)} unit=" °C" stroke="var(--color-sky-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="b" name={nama(idB)} unit=" °C" stroke="var(--color-amber-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </div>
        {baris.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Belum ada data 7 hari untuk kedua perangkat ini.</p>
        ) : null}
      </section>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onKembali}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Kembali ke daftar
      </button>
      <h2 className="mb-3 text-xl font-semibold text-slate-800 dark:text-slate-100">Bandingkan riwayat 7 hari</h2>
      {/* mobile first: dua kotak pilihan bertumpuk di HP, berdampingan mulai lebar sm */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PilihPerangkat label="Perangkat pertama (garis biru)" daftar={daftar} nilai={idA} onPilih={pilihA} />
        <PilihPerangkat label="Perangkat kedua (garis jingga)" daftar={daftar} nilai={idB} onPilih={pilihB} />
      </div>
      {isi}
    </div>
  );
}
