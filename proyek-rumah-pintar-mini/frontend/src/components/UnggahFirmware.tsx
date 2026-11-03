// UnggahFirmware.tsx - formulir "Unggah firmware" di layar Armada (Modul 28, khusus admin). Berkas .bin dari folder build
// (Sketch → Export Compiled Binary) dikirim APA ADANYA ke backend (POST /firmware/node1/<versi>); backend menghitung
// SHA-256-nya sendiri, dan layar ini menampilkan hasilnya supaya bisa dibandingkan dengan sidik berkas di laptopmu.
// Pemeriksaan di browser (ukuran, bait pertama 0xE9, nama berkas) hanya supaya galatnya cepat dan jelas: backend tetap
// memeriksa ulang semuanya.
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { GalatApi, unggahFirmware } from "../api";
import { RAK_PROGRAM, teksUkuran } from "../armada";
import { LaporanOta } from "../skema/kontrak";
import { toast } from "../toast";
import { sesiHabis } from "../toko";
import type { Rilis } from "../types";
import { tanggalJamWib } from "../waktu";

const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
const LABEL = "mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200";

// aturan versi yang SAMA dengan kontrak data (x.y.z, misalnya 1.7.1): skema Versi di skema/kontrak.ts, dipinjam lewat
// kolom versi LaporanOta (Versi sendiri tidak diekspor berkas itu)
const Versi = LaporanOta.shape.versi;

// Berkas lain di folder build yang JUGA berakhiran .bin, tetapi bukan berkas aplikasi untuk OTA
const BUKAN_APLIKASI = /\.(merged|bootloader|partitions)\.bin$/i;

// Memeriksa berkas sebelum diunggah. Hasilnya kalimat galat, atau null kalau tampak benar.
async function periksaBerkas(berkas: File): Promise<string | null> {
  if (!berkas.name.toLowerCase().endsWith(".bin")) return "Berkas firmware berakhiran .bin.";
  if (BUKAN_APLIKASI.test(berkas.name)) {
    return "Itu bukan berkas aplikasi: pilih <sketsa>.ino.bin, bukan .merged.bin, .bootloader.bin, atau .partitions.bin.";
  }
  if (berkas.size === 0) return "Berkasnya kosong.";
  if (berkas.size > RAK_PROGRAM) {
    return "Terlalu besar: " + berkas.size.toLocaleString("id-ID") + " byte, satu rak program hanya 1.966.080 byte.";
  }
  // bait pertama semua berkas aplikasi ESP32 = 0xE9 (233). slice(0, 1) = potongan 1 byte saja, tanpa membaca seluruh berkas.
  const awal = new Uint8Array(await berkas.slice(0, 1).arrayBuffer());
  if (awal[0] !== 0xe9) return "Bukan berkas aplikasi ESP32: bait pertamanya harus 0xE9.";
  return null;
}

type Props = {
  onSelesai: () => void; // rilis baru tersimpan: layar mengambil ulang daftar rilis dan armada
};

export default function UnggahFirmware({ onSelesai }: Props) {
  const [berkas, setBerkas] = useState<File | null>(null);
  const [versi, setVersi] = useState("");
  const [catatan, setCatatan] = useState("");
  const [uji, setUji] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<Rilis | null>(null); // rilis yang baru tersimpan (ukuran + sha256 dari server)
  const kolomBerkas = useRef<HTMLInputElement>(null);

  async function kirim(e: FormEvent) {
    e.preventDefault();
    setGalat(null);
    setHasil(null);
    if (berkas === null) return setGalat("Pilih berkas .bin dulu.");
    const salahBerkas = await periksaBerkas(berkas);
    if (salahBerkas !== null) return setGalat(salahBerkas);
    const cekVersi = Versi.safeParse(versi.trim());
    if (!cekVersi.success) return setGalat("Versi harus berbentuk x.y.z, misalnya 1.7.1 (sama dengan VERSI_FIRMWARE).");
    // backend 1.5 menolak versi RILIS dengan nol di depan (1.07.1 sama dengan 1.7.1 sebagai angka, beda sebagai teks)
    if (/(^|\.)0\d/.test(cekVersi.data)) return setGalat("Versi tanpa nol di depan: 1.7.1, bukan 1.07.1.");
    if (catatan.trim().length > 200) return setGalat("Catatan paling panjang 200 huruf.");
    setSibuk(true);
    try {
      const rilis = await unggahFirmware(cekVersi.data, berkas, catatan.trim(), uji);
      setHasil(rilis);
      toast("Firmware " + rilis.versi + " tersimpan di server.", "sukses");
      // kosongkan formulir; kolom berkas tidak bisa dikosongkan lewat state React, jadi lewat ref-nya
      setBerkas(null);
      setVersi("");
      setCatatan("");
      setUji(false);
      if (kolomBerkas.current !== null) kolomBerkas.current.value = "";
      onSelesai();
    } catch (err) {
      if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
      // galat dari backend ditaruh di formulir (bukan toast): biasanya perlu dibaca pelan, misalnya "1.7.1 sudah ada: …"
      setGalat(err instanceof GalatApi ? err.message : "Unggah gagal.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={kirim} noValidate className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Unggah firmware Node 1</h4>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Pilih <span className="font-mono">&lt;sketsa&gt;.ino.bin</span> dari folder <span className="font-mono">build</span> (hasil
        Sketch → Export Compiled Binary). Versi yang sudah ada tidak bisa ditimpa: firmware yang berubah selalu mendapat versi baru.
      </p>

      <label htmlFor="unggah-berkas" className={LABEL}>
        Berkas .bin
      </label>
      <input
        ref={kolomBerkas}
        id="unggah-berkas"
        type="file"
        accept=".bin"
        onChange={(e) => setBerkas(e.target.files?.[0] ?? null)}
        className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:font-medium file:text-teal-800 hover:file:bg-teal-100 dark:text-slate-200 dark:file:bg-teal-950 dark:file:text-teal-200"
      />
      {berkas !== null ? (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {berkas.name}: {teksUkuran(berkas.size)}
        </p>
      ) : null}

      <label htmlFor="unggah-versi" className={LABEL}>
        Versi (sama dengan VERSI_FIRMWARE di berkas itu)
      </label>
      <input
        id="unggah-versi"
        value={versi}
        onChange={(e) => setVersi(e.target.value)}
        placeholder="1.7.1"
        inputMode="decimal"
        autoComplete="off"
        className={KOTAK + " sm:w-40"}
      />

      <label htmlFor="unggah-catatan" className={LABEL}>
        Catatan (tidak wajib)
      </label>
      <input
        id="unggah-catatan"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        maxLength={200}
        placeholder="misalnya: sapaan versi baru"
        className={KOTAK}
      />

      <label className="mt-3 flex min-h-11 items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" checked={uji} onChange={(e) => setUji(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-teal-700" />
        <span>
          Rilis <b>uji</b> (misalnya firmware yang sengaja salah untuk latihan rollback): hanya bisa dikirim ke satu perangkat, tidak pernah
          ke semua, dan tidak dihitung sebagai rilis terbaru.
        </span>
      </label>

      {galat !== null ? (
        // role="alert": pembaca layar langsung membacakan galatnya
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {galat}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sibuk}
        className="mt-3 min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {sibuk ? "Mengunggah…" : "Unggah firmware"}
      </button>

      {hasil !== null ? (
        <div role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-950 dark:bg-green-950 dark:text-green-100">
          <p className="font-medium">
            Tersimpan: Node 1 {hasil.versi}
            {hasil.uji ? " (uji)" : ""}, {tanggalJamWib(Date.parse(hasil.dibuat))}
          </p>
          <p className="mt-1">Ukuran: {teksUkuran(hasil.ukuran)}</p>
          <p className="mt-1">SHA-256 (dihitung server dari berkas yang diterimanya):</p>
          <p className="font-mono text-xs break-all">{hasil.sha256}</p>
          <p className="mt-1">
            Bandingkan dengan sidik berkas di laptopmu (<span className="font-mono">sha256sum</span> atau{" "}
            <span className="font-mono">Get-FileHash</span>): harus sama persis.
          </p>
        </div>
      ) : null}
    </form>
  );
}
