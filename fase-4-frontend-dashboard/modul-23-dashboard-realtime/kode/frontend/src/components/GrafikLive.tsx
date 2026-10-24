// GrafikLive.tsx - grafik garis 5 menit terakhir satu perangkat. Isi awalnya dari database (GET …/readings?from=…),
// lalu bertambah sendiri setiap kali acara telemetry tiba (lihat terima() di toko.ts). Sumbu waktunya bergeser tiap detik.
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ambilBacaanSejak, GalatApi } from "../api";
import { KOSONG, useToko } from "../toko";
import type { Titik } from "../types";
import { jamMenitWib, jamWib, MENIT, ticksTiap, useSekarang } from "../waktu";
import Pemilih from "./Pemilih";

type Besaran = "suhu" | "cahaya" | "kelembapan";

// Judul, satuan, skala, dan warna tiap besaran. Skala suhu mengikuti datanya (tidak mulai dari 0), karena
// perubahan 1-2 °C itu penting dan satuannya tertulis di judul. Cahaya dan kelembapan punya batas alami, jadi skalanya tetap.
type Aturan = { nama: string; judul: string; satuan: string; domain: [number | "auto", number | "auto"]; warna: string };
const BESARAN: Record<Besaran, Aturan> = {
  suhu: { nama: "Suhu", judul: "Suhu (°C)", satuan: " °C", domain: ["auto", "auto"], warna: "var(--color-sky-500)" },
  cahaya: { nama: "Cahaya", judul: "Cahaya (0 = gelap, 4095 = terang)", satuan: "", domain: [0, 4095], warna: "var(--color-amber-500)" },
  kelembapan: { nama: "Kelembapan", judul: "Kelembapan udara (%)", satuan: " %", domain: [0, 100], warna: "var(--color-teal-500)" },
};

const PILIHAN: { nilai: Besaran; teks: string }[] = [
  { nilai: "suhu", teks: "Suhu" },
  { nilai: "cahaya", teks: "Cahaya" },
  { nilai: "kelembapan", teks: "Kelembapan" },
];

// sisipkanCelah - kalau dua titik berjauhan lebih dari "celah", sisipkan satu titik kosong (null) di antaranya.
// Recharts memutus garis di titik null (connectNulls bawaannya false), jadi bacaan yang hilang tampak sebagai celah,
// bukan garis lurus yang seolah-olah ada datanya.
function sisipkanCelah(titik: Titik[], celah: number): Titik[] {
  const hasil: Titik[] = [];
  for (const p of titik) {
    const sebelum = hasil.at(-1); // titik terakhir yang sudah masuk (undefined untuk titik pertama)
    if (sebelum !== undefined && p.t - sebelum.t > celah) {
      hasil.push({ t: sebelum.t + 1, suhu: null, kelembapan: null, cahaya: null });
    }
    hasil.push(p);
  }
  return hasil;
}

export default function GrafikLive({ deviceId }: { deviceId: string }) {
  const [besaran, setBesaran] = useState<Besaran>("suhu");
  const [galat, setGalat] = useState<string | null>(null);
  const titik = useToko((s) => s.jendela[deviceId] ?? KOSONG); // ?? KOSONG, bukan ?? [] (lihat toko.ts)
  const live = useToko((s) => s.koneksi === "live");
  const isiJendela = useToko((s) => s.isiJendela);
  const sekarang = useSekarang();

  // Isi awal: bacaan 5 menit terakhir dari database. Diulang setiap kali sambungan kembali Live, karena kiriman yang
  // lewat selama terputus tidak dikirim ulang server (titik yang sama tidak tercatat dua kali: lihat gabung()).
  useEffect(() => {
    if (!live) return;
    let ignore = false;
    ambilBacaanSejak(deviceId, 5)
      .then((jawaban) => {
        if (ignore) return;
        isiJendela(deviceId, jawaban.bacaan);
        setGalat(null);
      })
      .catch((err) => {
        if (!ignore) setGalat(err instanceof GalatApi ? err.message : "Gagal mengisi grafik.");
      });
    return () => {
      ignore = true;
    };
  }, [deviceId, live, isiJendela]);

  const b = BESARAN[besaran];
  const awal = sekarang - 5 * MENIT;
  // lebih dari 25 detik tanpa bacaan = paling sedikit 2 kiriman 10 detik terlewat: garisnya diputus di situ
  const data = sisipkanCelah(titik, 25 * 1000);
  // titik lama baru dibuang toko saat titik baru datang, jadi hitung titik yang masih masuk 5 menit terakhir
  const adaTerlihat = titik.some((p) => p.t >= awal);
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{b.judul} · 5 menit terakhir</h3>
        <Pemilih label="Besaran grafik" pilihan={PILIHAN} dipilih={besaran} onPilih={setBesaran} />
      </div>
      {/* warna teks wadah ini dipakai label sumbu (fill: currentColor), jadi ikut berganti di mode gelap */}
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {/* responsive + style: lebar mengikuti wadah (rapi di HP), tinggi tetap 240 px */}
        <LineChart responsive data={data} style={{ width: "100%", height: 240 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--warna-garis)" />
          {/* Sumbu waktu berupa ANGKA (milidetik), bukan kategori: jarak antartitik sesuai selisih waktunya.
              domain = tepat 5 menit terakhir; ticks = label di setiap menit bulat, supaya tidak melompat-lompat. */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[awal, sekarang]}
            allowDataOverflow
            ticks={ticksTiap(awal, sekarang, MENIT)}
            tickFormatter={jamMenitWib}
            tick={{ fill: "currentColor" }}
            stroke="var(--warna-garis)"
          />
          <YAxis domain={b.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--warna-garis)" />
          <Tooltip
            labelFormatter={(t) => jamWib(Number(t))}
            contentStyle={{ backgroundColor: "var(--warna-panel)", borderColor: "var(--warna-garis)", borderRadius: 8 }}
          />
          {/* isAnimationActive={false}: animasi bawaan 1,5 detik membuat titik baru tampak terlambat */}
          <Line
            dataKey={besaran}
            name={b.nama}
            unit={b.satuan}
            stroke={b.warna}
            strokeWidth={2}
            dot={{ r: 2, fill: b.warna }}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
      {adaTerlihat ? null : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {live ? "Belum ada bacaan dalam 5 menit terakhir." : "Menunggu sambungan live…"}
        </p>
      )}
      {galat !== null ? <p className="mt-2 text-sm text-red-700 dark:text-red-300">{galat}</p> : null}
    </section>
  );
}
