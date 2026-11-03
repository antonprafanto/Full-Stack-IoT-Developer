// BuatKodeKlaim.tsx - "Perangkat baru" di layar Armada (Modul 28, khusus admin): membuat kode klaim sekali pakai
// (POST /provision/kode). Kode itu diketik di portal WiFi perangkat baru; perangkat menukarnya sendiri dengan kunci
// perangkatnya, akun brokernya dibuat backend, lalu ia muncul di Armada. Kodenya hanya tampil SEKALI: database hanya
// menyimpan sidik jarinya, dan layar ini menyimpannya di memori komponen saja (hilang saat ditutup atau pindah layar).
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ambilKodeKlaim, buatKodeKlaim, GalatApi } from "../api";
import { laporGalat } from "../armada";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";
import type { KodeKlaim, KodeKlaimBaru } from "../types";
import { jamWib, tanggalJamWib } from "../waktu";

const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
const LABEL = "mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200";
const BENTUK = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const LENCANA_KEADAAN: Record<KodeKlaim["keadaan"], string> = {
  berlaku: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  dipakai: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
  kedaluwarsa: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export default function BuatKodeKlaim() {
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [menit, setMenit] = useState("30");
  const [sibuk, setSibuk] = useState(false);
  const [kode, setKode] = useState<KodeKlaimBaru | null>(null); // kode yang baru dibuat: tampil sekali
  const [tersalin, setTersalin] = useState(false);
  const [daftar, setDaftar] = useState<KodeKlaim[] | null>(null);
  const [nomorDaftar, setNomorDaftar] = useState(0); // naik sesudah membuat kode: daftar diambil ulang
  const kolomKode = useRef<HTMLInputElement>(null);
  // kode yang dipakai perangkat menimbulkan kejadian "provisioning", yang menaikkan versiArmada: daftar ikut diambil ulang
  const versiArmada = useToko((s) => s.versiArmada);

  useEffect(() => {
    let ignore = false;
    ambilKodeKlaim()
      .then((d) => {
        if (!ignore) setDaftar(d);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) sesiHabis();
        // gagal membaca daftar tidak menghalangi membuat kode: daftarnya saja yang tidak tampil
      });
    return () => {
      ignore = true;
    };
  }, [nomorDaftar, versiArmada]);

  async function buat(e: FormEvent) {
    e.preventDefault();
    const m = Number(menit);
    if (!Number.isInteger(m) || m < 5 || m > 60) {
      toast("Masa berlaku kode 5 sampai 60 menit.", "galat");
      return;
    }
    setSibuk(true);
    setKode(null);
    setTersalin(false);
    try {
      // kolom yang dikosongkan tidak dikirim sama sekali (backend menolak teks kosong)
      const baru = await buatKodeKlaim({
        menit: m,
        ...(nama.trim() === "" ? {} : { nama: nama.trim() }),
        ...(lokasi.trim() === "" ? {} : { lokasi: lokasi.trim() }),
      });
      setKode(baru);
      setNama("");
      setLokasi("");
      setNomorDaftar((n) => n + 1);
    } catch (err) {
      laporGalat(err, "Kode klaim gagal dibuat.");
    } finally {
      setSibuk(false);
    }
  }

  async function salin() {
    if (kode === null) return;
    try {
      // navigator.clipboard hanya ada di alamat aman (https:// atau localhost). Di http://<IP> ia tidak ada: kodenya
      // dipilih (disorot) saja, lalu disalin sendiri dengan Ctrl + C (atau tahan lalu Salin di HP).
      await navigator.clipboard.writeText(kode.kode);
      setTersalin(true);
    } catch {
      kolomKode.current?.select();
      toast("Tidak bisa menyalin otomatis di alamat ini: kodenya sudah disorot, salin dengan Ctrl + C.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Buat kode klaim</h4>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Kode sekali pakai untuk mendaftarkan perangkat baru: ketik di portal WiFi perangkat itu (kolom Kode klaim), bersama alamat
        server dan alamat broker. Tanpa kunci yang disalin tangan, tanpa mosquitto_passwd.
      </p>

      <form onSubmit={buat} noValidate>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <div>
            <label htmlFor="klaim-nama" className={LABEL}>
              Nama perangkat (tidak wajib)
            </label>
            <input id="klaim-nama" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={60} placeholder="Node 1 garasi" className={KOTAK} />
          </div>
          <div>
            <label htmlFor="klaim-lokasi" className={LABEL}>
              Lokasi (tidak wajib)
            </label>
            <input id="klaim-lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} maxLength={60} placeholder="garasi" className={KOTAK} />
          </div>
        </div>
        <label htmlFor="klaim-menit" className={LABEL}>
          Berlaku (menit, 5-60)
        </label>
        <input
          id="klaim-menit"
          type="number"
          inputMode="numeric"
          min={5}
          max={60}
          step={1}
          value={menit}
          onChange={(e) => setMenit(e.target.value)}
          className={KOTAK + " sm:w-32"}
        />
        <div>
          <button
            type="submit"
            disabled={sibuk}
            className="mt-3 min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {sibuk ? "Membuat…" : "Buat kode"}
          </button>
        </div>
      </form>

      {kode !== null ? (
        <div role="status" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">
            Kode klaim{kode.nama === null ? "" : " untuk " + kode.nama}, berlaku sampai {jamWib(kode.kedaluwarsa)} ({kode.menit} menit):
          </p>
          {/* kotak baca-saja: tetap bisa disorot dan disalin tangan di browser yang tidak mengizinkan salin otomatis */}
          <input
            ref={kolomKode}
            readOnly
            value={kode.kode}
            aria-label="Kode klaim"
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 w-full max-w-xs rounded-lg border border-amber-400 bg-white px-3 py-2 text-center font-mono text-2xl tracking-widest text-slate-900 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <p className="mt-2">
            Kode ini hanya tampil <b>sekali</b>: catat sekarang. Sesudah ditutup, kode tidak bisa dilihat lagi; buat kode baru bila hilang.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={salin}
              className="min-h-11 rounded-lg bg-amber-700 px-4 font-medium text-white hover:bg-amber-800"
            >
              {tersalin ? "Tersalin ✓" : "Salin"}
            </button>
            <button
              type="button"
              onClick={() => setKode(null)}
              className="min-h-11 rounded-lg border border-amber-400 px-4 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}

      {daftar !== null && daftar.length > 0 ? (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-200">Kode terakhir (tanpa kodenya)</h5>
          <ul className="mt-1 space-y-1 text-sm">
            {daftar.slice(0, 5).map((k, i) => (
              // key: waktu dibuat + urutan (dua kode bisa dibuat dalam detik yang sama)
              <li key={k.dibuat + "-" + i} className="break-words text-slate-700 dark:text-slate-300">
                <span className={BENTUK + " " + LENCANA_KEADAAN[k.keadaan]}>{k.keadaan}</span> {k.nama ?? "tanpa nama"}
                {k.lokasi === null ? "" : " (" + k.lokasi + ")"}
                <span className="text-slate-600 dark:text-slate-400">
                  {k.keadaan === "dipakai" && k.dipakai !== null
                    ? " · dipakai " + (k.device_id ?? "") + ", " + tanggalJamWib(Date.parse(k.dipakai))
                    : (k.keadaan === "berlaku" ? " · berlaku sampai " : " · habis ") + tanggalJamWib(Date.parse(k.kedaluwarsa))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
