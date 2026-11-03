// TindakanArmada.tsx - tombol admin di kartu Armada (Modul 28): Perbarui firmware satu perangkat, tanda Canary, jeda
// vitals, dan Nonaktifkan. Hanya digambar untuk admin (KartuArmada memakai useAdmin), tetapi itu kenyamanan layar saja:
// satpam backend tetap menjawab 403 untuk akun viewer, dan backend memeriksa ulang semua syaratnya (409).
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { aturCanary, aturJedaVitals, nonaktifkan, perbaruiPerangkat } from "../api";
import { alasanTidakBisaPerbarui, pesanGalat, teksUkuran } from "../armada";
import { toast } from "../toast";
import type { BarisArmada, Pembaruan, RilisLengkap, StatusPerangkat } from "../types";
import KotakGalat from "./KotakGalat";
import TombolKonfirmasi from "./TombolKonfirmasi";

const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

// label pilihan versi, misalnya "1.7.1 (terbaru, sedang dipakai)" atau "1.7.2 (uji)"
function labelVersi(r: RilisLengkap, terbaru: string | null, fw: string | null): string {
  const tanda = [r.uji ? "uji" : "", r.versi === terbaru ? "terbaru" : "", r.versi === fw ? "sedang dipakai" : ""].filter((t) => t !== "");
  return r.versi + (tanda.length > 0 ? " (" + tanda.join(", ") + ")" : "");
}

type Props = {
  p: BarisArmada;
  status: StatusPerangkat; // status LIVE (toko)
  fw: string | null; // versi yang sedang berjalan (live)
  pembaruan: Pembaruan | null; // pembaruan terakhir (live)
  rilis: RilisLengkap[];
  terbaru: string | null;
  otaSiap: boolean;
  onBerubah: () => void;
};

export default function TindakanArmada({ p, status, fw, pembaruan, rilis, terbaru, otaSiap, onBerubah }: Props) {
  const id = p.device_id;
  const nama = p.nama ?? id;
  const kolom = useId(); // id unik untuk label + kolom (satu layar berisi banyak kartu)
  // Pilihan versi: rilis yang belum ditarik, terbaru di atas. Bawaannya rilis terbaru (bukan uji); rilis uji tetap bisa
  // dipilih, karena memang hanya boleh dikirim lewat tombol per perangkat ini.
  const opsi = rilis.filter((r) => r.ditarik === null).reverse();
  const bawaan = terbaru ?? opsi[0]?.versi ?? "";
  // null = admin belum memilih sendiri: ikut rilis terbaru, juga sesudah rilis baru diunggah. Pilihan yang sudah ditarik
  // (tidak ada lagi di daftar) kembali ke bawaan.
  const [pilihan, setPilihan] = useState<string | null>(null);
  const versi = pilihan !== null && opsi.some((r) => r.versi === pilihan) ? pilihan : bawaan;
  const rilisDipilih = opsi.find((r) => r.versi === versi);
  const [paksa, setPaksa] = useState(false); // izinkan turun versi
  const [simpanCanary, setSimpanCanary] = useState(false);
  const [jeda, setJeda] = useState(String(p.jeda_vitals_s ?? 300));
  const [simpanJeda, setSimpanJeda] = useState(false);
  const [langkah, setLangkah] = useState<string[]>([]); // pekerjaan tangan sesudah Nonaktifkan (bila ada)
  const [galat, setGalat] = useState<string | null>(null); // galat tombol terakhir, tetap tampil sampai Tutup (KotakGalat)
  const tutupLangkah = useRef<HTMLButtonElement>(null);
  // Sesudah Nonaktifkan, tombol-tombol kartu ini hilang: fokus pindah ke Tutup kotak langkah (juga sesudah kartu digambar
  // ulang sebagai "nonaktif"), supaya pengguna keyboard dan pembaca layar tidak terlempar ke awal halaman.
  useEffect(() => {
    if (langkah.length > 0) tutupLangkah.current?.focus();
  }, [langkah, p.kunci]);

  const gagal = (err: unknown, cadangan: string) => setGalat(pesanGalat(err, cadangan));

  const alasan =
    alasanTidakBisaPerbarui(p, status, pembaruan, otaSiap, opsi.length > 0) ?? (versi === fw ? "Perangkat sudah memakai versi ini." : null);

  // 202 = perangkat MENERIMA perintahnya (ack), BELUM selesai. Toast "menerima perintah pembaruan" datang dari kejadian
  // "ota" (ke semua dashboard), jadi di sini tidak diulang; tahap berikutnya tampil sendiri di kartu (acara "ota").
  async function perbarui() {
    try {
      const hasil = await perbaruiPerangkat(id, versi, paksa);
      if (hasil.status === "tanpa-ack") {
        toast(nama + ": perintah terkirim, tetapi perangkat belum menjawab dalam 5 detik. Hasilnya menyusul bila perangkat melapor.");
      }
      setPaksa(false);
      setGalat(null);
      onBerubah();
    } catch (err) {
      gagal(err, "Perintah pembaruan gagal dikirim.");
    }
  }

  async function ubahCanary(nilai: boolean) {
    setSimpanCanary(true);
    try {
      await aturCanary(id, nilai);
      toast(nilai ? nama + " kini perangkat canary." : nama + " bukan perangkat canary lagi.", "sukses");
      setGalat(null);
      onBerubah();
    } catch (err) {
      gagal(err, "Tanda canary gagal disimpan.");
    } finally {
      setSimpanCanary(false);
    }
  }

  async function simpanJedaVitals(e: FormEvent) {
    e.preventDefault(); // jangan biarkan browser memuat ulang halaman (perilaku bawaan formulir)
    const detik = Number(jeda);
    if (!Number.isInteger(detik) || detik < 60 || detik > 3600) {
      setGalat("Jeda vitals harus bilangan bulat 60 sampai 3600 detik.");
      return;
    }
    setSimpanJeda(true);
    try {
      const hasil = await aturJedaVitals(id, detik);
      // catatan terisi kalau firmware perangkat masih lama (belum mengenal jeda): tersimpan, berlaku sesudah diperbarui
      toast("Jeda vitals " + nama + " = " + hasil.jeda_vitals_s + " detik." + (hasil.catatan === null ? "" : " " + hasil.catatan), "sukses");
      setGalat(null);
      onBerubah();
    } catch (err) {
      gagal(err, "Jeda vitals gagal disimpan.");
    } finally {
      setSimpanJeda(false);
    }
  }

  async function matikan() {
    try {
      const hasil = await nonaktifkan(id);
      toast(nama + " dinonaktifkan.", "sukses");
      setGalat(null);
      setLangkah(hasil.langkah); // tetap tampil sesudah kartu berganti menjadi "nonaktif"
      onBerubah();
    } catch (err) {
      // 503 = database belum berubah, tetapi perintah yang tertahan di jembatan bisa tetap dikerjakan broker: kalimat
      // backend menyuruh MENGULANG langkah ini, jadi galatnya tetap tampil di kartu (bukan toast 4 detik)
      gagal(err, "Gagal menonaktifkan perangkat.");
    }
  }

  // Sesudah dinonaktifkan: tombol hilang, tinggal langkah tangan yang masih perlu dikerjakan (bila ada).
  const kotakLangkah =
    langkah.length > 0 ? (
      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-medium">Sesudah menonaktifkan:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 break-words">
          {langkah.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <button
          ref={tutupLangkah}
          type="button"
          onClick={() => setLangkah([])}
          className="mt-2 min-h-11 rounded-lg border border-amber-400 px-4 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
        >
          Tutup
        </button>
      </div>
    ) : null;
  if (p.kunci === "dicabut") return kotakLangkah;

  return (
    <section aria-label={"Tindakan admin untuk " + nama} className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
      {p.jenis !== "node2" ? (
        <>
          {/* satu baris mulai 640 px: [pilihan versi] [Perbarui]; alasan tombol mati dan kotak "yakin?" turun ke bawahnya */}
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            <div className="w-full sm:w-72">
              <label htmlFor={kolom + "-versi"} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Perbarui ke versi
              </label>
              <select
                id={kolom + "-versi"}
                value={versi}
                onChange={(e) => setPilihan(e.target.value)}
                disabled={opsi.length === 0}
                className={KOTAK}
              >
                {opsi.length === 0 ? <option value="">belum ada rilis</option> : null}
                {opsi.map((r) => (
                  <option key={r.versi} value={r.versi}>
                    {labelVersi(r, terbaru, fw)}
                  </option>
                ))}
              </select>
            </div>
            <TombolKonfirmasi
              bungkus="contents"
              label="Perbarui"
              judul={"Perbarui " + nama + " dari " + (fw ?? "?") + " ke " + versi + "?"}
              labelYa="Ya, perbarui"
              onYa={perbarui}
              alasanMati={alasan}
            >
              <p>
                Perangkat menerima perintahnya, berhenti sengaja, mengunduh{" "}
                {rilisDipilih === undefined ? "berkasnya" : teksUkuran(rilisDipilih.ukuran)}, lalu menyala ulang (±1 menit). Kalau
                firmware baru tidak tersambung ke broker dalam 60 detik, perangkat kembali sendiri ke {fw ?? "versi lamanya"}{" "}
                (rollback). Jangan cabut listriknya selama itu.
              </p>
              {rilisDipilih?.uji ? (
                <p className="mt-1 font-medium">Ini rilis UJI: sengaja dibuat untuk latihan rollback.</p>
              ) : null}
              <label className="mt-2 flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={paksa} onChange={(e) => setPaksa(e.target.checked)} className="size-5 accent-teal-700" />
                Izinkan turun versi (bila versi tujuan lebih lama)
              </label>
            </TombolKonfirmasi>
          </div>
          <label className="mt-2 flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={p.canary}
              disabled={simpanCanary}
              onChange={(e) => ubahCanary(e.target.checked)}
              className="size-5 accent-violet-700"
            />
            Canary: perangkat uji yang diperbarui lebih dulu{simpanCanary ? " (menyimpan…)" : ""}
          </label>
        </>
      ) : null}

      <details className="mt-1 text-sm">
        {/* py-3: tinggi ±44 px, mudah diketuk jempol */}
        <summary className="cursor-pointer py-3 font-medium text-teal-700 dark:text-teal-300">Pengaturan lain</summary>
        {p.jenis !== "node2" ? (
          <form onSubmit={simpanJedaVitals} className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor={kolom + "-jeda"} className="block font-medium text-slate-700 dark:text-slate-200">
                Jeda vitals (detik, 60-3600)
              </label>
              <input
                id={kolom + "-jeda"}
                type="number"
                inputMode="numeric"
                min={60}
                max={3600}
                step={1}
                value={jeda}
                onChange={(e) => setJeda(e.target.value)}
                className={KOTAK + " sm:w-32"}
              />
            </div>
            <button
              type="submit"
              disabled={simpanJeda}
              className="min-h-11 rounded-lg border border-slate-300 px-4 text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {simpanJeda ? "Menyimpan…" : "Simpan jeda"}
            </button>
            <p className="basis-full text-xs text-slate-600 dark:text-slate-400">
              Hanya vitals (kesehatan). telemetry tetap setiap 10 detik. WiFi, alamat server, dan kunci tidak bisa diubah dari jauh.
            </p>
          </form>
        ) : null}
        <div className="mt-3">
          <TombolKonfirmasi label="Nonaktifkan" judul={"Nonaktifkan " + nama + "?"} labelYa="Ya, nonaktifkan" onYa={matikan} bahaya>
            <p>
              Untuk perangkat yang hilang, dicuri, atau tidak dipakai lagi. Kuncinya dicabut dan akun brokernya dihapus: perangkat
              langsung terputus, kirimannya diabaikan, dan tidak bisa diperbarui atau dikendalikan. Menghidupkannya lagi hanya dengan
              kunci baru atau kode klaim baru.
            </p>
          </TombolKonfirmasi>
        </div>
      </details>
      <KotakGalat pesan={galat} onTutup={() => setGalat(null)} />
      {kotakLangkah}
    </section>
  );
}
