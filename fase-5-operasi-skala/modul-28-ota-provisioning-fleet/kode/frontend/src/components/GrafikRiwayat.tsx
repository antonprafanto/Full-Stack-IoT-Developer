// GrafikRiwayat.tsx - grafik riwayat satu besaran: garis rata-rata (untuk suhu ditambah terendah dan tertinggi),
// dengan celah yang jujur. Jam-jam tanpa data tampak sebagai celah, bukan garis lurus yang seolah-olah ada datanya.
import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { DataRiwayat, Jenis, Rentang } from "../types";
import { HARI, hariTanggalWib, JAM, jamMenitWib, jamWib, MENIT, tanggalJamWib, ticksTiap } from "../waktu";
import Pemilih from "./Pemilih";

// Hanya empat besaran ini yang diringkas backend per 15 menit dan per jam.
type Besaran = "suhu" | "kelembapan" | "tanah" | "cahaya";
type Aturan = {
  nama: string;
  judul: string;
  satuan: string;
  kolom: "suhu_rata" | "kelembapan_rata" | "tanah_rata" | "cahaya_rata";
  domain: [number | "auto", number | "auto"];
  warna: string;
};
// Skala suhu mengikuti datanya (satuannya tertulis di judul); besaran lain punya batas alami, jadi skalanya tetap.
const BESARAN: Record<Besaran, Aturan> = {
  suhu: { nama: "Suhu", judul: "Suhu (°C)", satuan: " °C", kolom: "suhu_rata", domain: ["auto", "auto"], warna: "var(--color-sky-500)" },
  kelembapan: {
    nama: "Kelembapan",
    judul: "Kelembapan udara (%)",
    satuan: " %",
    kolom: "kelembapan_rata",
    domain: [0, 100],
    warna: "var(--color-teal-500)",
  },
  tanah: { nama: "Tanah", judul: "Kelembapan tanah (%)", satuan: " %", kolom: "tanah_rata", domain: [0, 100], warna: "var(--color-lime-600)" },
  cahaya: {
    nama: "Cahaya",
    judul: "Cahaya (0 = gelap, 4095 = terang)",
    satuan: "",
    kolom: "cahaya_rata",
    domain: [0, 4095],
    warna: "var(--color-amber-500)",
  },
};

const PILIHAN: { nilai: Besaran; teks: string }[] = [
  { nilai: "suhu", teks: "Suhu" },
  { nilai: "kelembapan", teks: "Kelembapan" },
  { nilai: "tanah", teks: "Tanah" },
  { nilai: "cahaya", teks: "Cahaya" },
];

// Untuk tiap rentang: jarak terbesar antara dua titik yang masih dianggap bersambung (lebih dari ini = ada data yang
// hilang), jarak antarlabel sumbu waktu, dan bentuk labelnya.
const SUMBU: Record<Rentang, { celah: number; langkah: number; label: (t: number) => string }> = {
  "1jam": { celah: 25 * 1000, langkah: 10 * MENIT, label: jamMenitWib }, // bacaan tiap 10 detik: 2 kiriman hilang = celah
  "24jam": { celah: 1.5 * 15 * MENIT, langkah: 3 * JAM, label: jamMenitWib }, // ember 15 menit
  "7hari": { celah: 1.5 * JAM, langkah: HARI, label: hariTanggalWib }, // ember 1 jam; label tiap pukul 00.00 WIB
};

type Baris = { t: number; rata: number | null; min: number | null; maks: number | null };

// sisipkanCelah - kalau dua titik berjauhan lebih dari "celah", sisipkan satu titik kosong (null) di antaranya.
// Recharts memutus garis di titik null (connectNulls bawaannya false). Cara kerjanya sama dengan sisipkanCelah di
// GrafikLive.tsx (Praktik 4); bedanya hanya bentuk barisnya.
function sisipkanCelah(baris: Baris[], celah: number): Baris[] {
  const hasil: Baris[] = [];
  for (const b of baris) {
    const sebelum = hasil.at(-1); // titik terakhir yang sudah masuk (undefined untuk titik pertama)
    if (sebelum !== undefined && b.t - sebelum.t > celah) {
      hasil.push({ t: sebelum.t + 1, rata: null, min: null, maks: null });
    }
    hasil.push(b);
  }
  return hasil;
}

type Props = {
  data: DataRiwayat;
  rentang: Rentang;
  jenis: Jenis; // Node 2 tidak punya sensor cahaya
};

export default function GrafikRiwayat({ data, rentang, jenis }: Props) {
  const [besaran, setBesaran] = useState<Besaran>("suhu");
  const b = BESARAN[besaran];
  const sumbu = SUMBU[rentang];
  const dari = Date.parse(data.dari);
  const sampai = Date.parse(data.sampai);
  // terendah dan tertinggi hanya ada di ringkasan suhu (bacaan mentah 1 jam tidak punya)
  const minMaks = besaran === "suhu" && rentang !== "1jam";
  const baris = sisipkanCelah(
    data.titik.map((p) => ({
      t: Date.parse(p.waktu),
      rata: p[b.kolom],
      min: minMaks ? p.suhu_min : null,
      maks: minMaks ? p.suhu_maks : null,
    })),
    sumbu.celah,
  );

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{b.judul}</h3>
        <Pemilih
          label="Besaran riwayat"
          pilihan={jenis === "node2" ? PILIHAN.filter((p) => p.nilai !== "cahaya") : PILIHAN}
          dipilih={besaran}
          onPilih={setBesaran}
        />
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <LineChart responsive data={baris} style={{ width: "100%", height: 260 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--warna-garis)" />
          {/* domain = rentang yang ditanyakan (dari … sampai): bagian tanpa data di awal atau akhir tetap kelihatan kosong */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[dari, sampai]}
            ticks={ticksTiap(dari, sampai, sumbu.langkah)}
            tickFormatter={sumbu.label}
            tick={{ fill: "currentColor" }}
            stroke="var(--warna-garis)"
          />
          <YAxis domain={b.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--warna-garis)" />
          <Tooltip
            labelFormatter={(t) => (rentang === "1jam" ? jamWib(Number(t)) : tanggalJamWib(Number(t)))}
            contentStyle={{ backgroundColor: "var(--warna-panel)", borderColor: "var(--warna-garis)", borderRadius: 8 }}
          />
          {minMaks ? (
            <Line dataKey="maks" name="Tertinggi" unit={b.satuan} stroke={b.warna} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
          <Line
            dataKey="rata"
            name={rentang === "1jam" ? b.nama : b.nama + " rata-rata"}
            unit={b.satuan}
            stroke={b.warna}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {minMaks ? (
            <Line dataKey="min" name="Terendah" unit={b.satuan} stroke={b.warna} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
        </LineChart>
      </div>
      {minMaks ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Garis tebal = rata-rata; garis putus-putus = terendah dan tertinggi.</p>
      ) : null}
    </section>
  );
}
