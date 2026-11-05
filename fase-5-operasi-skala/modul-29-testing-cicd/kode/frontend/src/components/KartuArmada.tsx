// KartuArmada.tsx - satu perangkat di layar Armada (Modul 28): versi firmware, kesehatan dari vitals terakhir (sinyal WiFi,
// RAM, lama menyala, alasan menyala ulang), pembaruan terakhir, dan (khusus admin) tombol-tombolnya.
// Seperti kartu di daftar perangkat (Modul 23), setiap kartu memilih datanya SENDIRI dari toko: status, versi dari
// telemetry terbaru, dan kabar pembaruan (acara Socket.IO "ota") berubah sendiri tanpa memuat ulang halaman.
import type { ReactNode } from "react";
import { ARTI_RESET, teksLamaMenyala, teksRam, teksSinyal, TEKS_PEMBARUAN } from "../armada";
import { useAdmin, useToko } from "../toko";
import type { BarisArmada, Jenis, KabarOta, Pembaruan, RilisLengkap, StatusPerangkat } from "../types";
import { tanggalJamWib } from "../waktu";
import { LencanaStatus } from "./Lencana";
import RiwayatPembaruan from "./RiwayatPembaruan";
import TerakhirDilihat from "./TerakhirDilihat";
import TindakanArmada from "./TindakanArmada";

const BENTUK = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

// garis tebal di tepi kiri kartu mengikuti status (seperti kartu daftar perangkat)
const TEPI: Record<StatusPerangkat, string> = {
  online: "border-l-green-500 dark:border-l-green-500",
  offline: "border-l-red-500 dark:border-l-red-500",
  "offline-mode": "border-l-sky-400 dark:border-l-sky-400",
  "belum-diketahui": "border-l-slate-300 dark:border-l-slate-600",
};

// Pembaruan terakhir = yang paling baru di antara dua sumber: baris dari GET /armada, atau kabar live dari acara "ota".
// Waktunya sama-sama UTC berformat kontrak (2026-10-31T01:02:03Z), jadi bisa dibandingkan sebagai teks.
function pembaruanTerkini(dariServer: Pembaruan | null, kabar: KabarOta | undefined): Pembaruan | null {
  if (kabar === undefined) return dariServer;
  // >= : pada detik yang sama, baris server (yang sudah lengkap) menang atas kabar live
  if (dariServer !== null && dariServer.diperbarui >= kabar.waktu) return dariServer;
  const selesai = ["dikirim", "diterima", "mengunduh"].includes(kabar.status) ? null : kabar.waktu;
  return {
    id: kabar.id,
    status: kabar.status,
    dari: kabar.dari,
    ke: kabar.ke,
    pesan: kabar.pesan,
    dibuat: dariServer?.id === kabar.id ? dariServer.dibuat : kabar.waktu,
    diperbarui: kabar.waktu,
    selesai,
  };
}

function teksJenis(jenis: Jenis, penghubung: string | null): string {
  if (jenis === "node1") return "Node 1";
  if (jenis === "node2") return "Node 2" + (penghubung === null ? "" : " lewat " + penghubung);
  return "jenis belum diketahui";
}

// satu pasang "judul: isi" di dalam kartu
function Isian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{judul}</dt>
      <dd className="break-words text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

type Props = {
  p: BarisArmada; // satu baris GET /armada
  rilis: RilisLengkap[]; // daftar rilis (untuk pilihan versi tombol Perbarui)
  terbaru: string | null; // rilis terbaru Node 1
  otaSiap: boolean; // ALAMAT_SERVER sudah diisi di server
  onBerubah: () => void; // minta layar mengambil ulang data armada
};

export default function KartuArmada({ p, rilis, terbaru, otaSiap, onBerubah }: Props) {
  const id = p.device_id;
  const admin = useAdmin();
  const nonaktif = p.kunci === "dicabut";
  // perangkat yang dinonaktifkan: status live-nya diabaikan (broker bisa masih menyimpan "online" lama, kontrak 1.6)
  const statusLive = useToko((s) => s.status[id]);
  const status: StatusPerangkat = nonaktif ? "offline" : (statusLive ?? p.status);
  const bacaan = useToko((s) => s.terbaru[id]); // telemetry terakhir (live); undefined = belum ada
  // Versi firmware: dari telemetry (live, tiap 10 detik) HANYA kalau telemetry itu lebih baru daripada catatan fw di
  // database. Sesudah pembaruan berhasil, database lebih dulu tahu versi baru (dari vitals perangkat yang baru menyala)
  // daripada telemetry berikutnya, dan telemetry lama di toko masih membawa versi LAMA.
  const telemetryLebihBaru = bacaan !== undefined && (p.fw_dilihat === null || Date.parse(bacaan.ts) >= Date.parse(p.fw_dilihat));
  const fw = !nonaktif && telemetryLebihBaru ? bacaan.fw : p.fw;
  // Jenis: perangkat yang baru mendaftar lewat kode klaim masih "belum-diketahui" di GET /armada sampai kiriman pertamanya.
  // Begitu telemetry-nya tiba, jenisnya dibaca dari kiriman itu (hanya Node 2 yang punya tekanan udara), seperti di
  // DetailPerangkat (Modul 24); tanpa ini tombol Perbarui tetap mati sampai halaman dimuat ulang.
  const jenis: Jenis = p.jenis !== "belum-diketahui" || bacaan === undefined ? p.jenis : "tekanan" in bacaan ? "node2" : "node1";
  const baris = jenis === p.jenis ? p : { ...p, jenis }; // untuk TindakanArmada: baris yang sama dengan jenis terkini
  const terakhirLive = useToko((s) => s.terakhirDilihat[id]);
  const terakhir = terakhirLive ?? (p.terakhir_dilihat === null ? undefined : Date.parse(p.terakhir_dilihat));
  const kabar = useToko((s) => s.ota[id]);
  const pembaruan = pembaruanTerkini(p.pembaruan, kabar);
  // "perlu diperbarui" dihitung server terhadap fw di database; versi live yang sudah sama dengan rilis terbaru menutupnya
  const perluUpdate = p.perlu_update && fw !== terbaru;
  const k = p.kesehatan;

  return (
    <article
      aria-labelledby={"armada-" + id}
      className={
        "rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 " +
        (nonaktif ? "border-l-slate-300 dark:border-l-slate-600" : TEPI[status])
      }
    >
      {/* judul + lencana; flex-wrap: lencana turun baris di HP, tidak mendorong nama keluar layar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 id={"armada-" + id} className="min-w-0 font-semibold break-words text-slate-800 dark:text-slate-100">
          {p.nama ?? id}
        </h4>
        {nonaktif ? (
          <span className={BENTUK + " bg-red-600 text-white"}>nonaktif</span>
        ) : (
          <LencanaStatus status={status} />
        )}
        {p.canary && !nonaktif ? (
          <span className={BENTUK + " bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100"}>canary</span>
        ) : null}
        {perluUpdate && !nonaktif ? (
          <span className={BENTUK + " bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"}>perlu diperbarui</span>
        ) : null}
      </div>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
        {teksJenis(jenis, p.penghubung)} · {p.lokasi ?? "lokasi belum diisi"} · <span className="font-mono text-xs">{id}</span> ·{" "}
        <TerakhirDilihat t={terakhir} jenis={jenis} periksaBasi={!nonaktif} />
      </p>

      {/* dl = daftar "judul: isi". Dua kolom di HP, tiga kolom mulai 640 px */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <Isian judul="Versi firmware">
          <span className="font-mono">{fw ?? "—"}</span>
          {perluUpdate && !nonaktif ? <span className="text-slate-600 dark:text-slate-400"> → {terbaru}</span> : null}
        </Isian>
        {k === null ? (
          <Isian judul="Kesehatan">
            {jenis === "node2" ? "Node 2 tidak mengirim vitals" : "belum ada vitals"}
          </Isian>
        ) : (
          <>
            <Isian judul="Menyala ulang karena">
              {k.reset_reason === null ? (
                <span className="text-slate-600 dark:text-slate-400">— (firmware lama belum melaporkan)</span>
              ) : (
                <>
                  <span className={BENTUK + " " + ARTI_RESET[k.reset_reason].warna}>{k.reset_reason}</span>{" "}
                  <span className="text-xs text-slate-600 dark:text-slate-400">{ARTI_RESET[k.reset_reason].arti}</span>
                </>
              )}
            </Isian>
            <Isian judul="Sinyal WiFi">{teksSinyal(k.rssi)}</Isian>
            <Isian judul="RAM">{teksRam(k.heap_free)}</Isian>
            <Isian judul="Lama menyala">{teksLamaMenyala(k.uptime_s)}</Isian>
          </>
        )}
      </dl>
      {k !== null ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Kesehatan dari vitals terakhir, {tanggalJamWib(Date.parse(k.ts))}; vitals dikirim setiap{" "}
          {p.jeda_vitals_s === null ? "300 detik (bawaan firmware)" : p.jeda_vitals_s + " detik (diatur admin)"}.
        </p>
      ) : null}

      {/* pembaruan terakhir: berubah sendiri lewat acara "ota" (diterima -> mengunduh -> berhasil / rollback / gagal).
          Node 2 tidak pernah diperbarui lewat udara: cukup satu kalimat */}
      {jenis === "node2" ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">OTA tidak tersedia untuk Node 2: perbarui lewat kabel.</p>
      ) : (
        <div className="mt-3 text-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Pembaruan terakhir: </span>
          {pembaruan === null ? (
            <span className="text-slate-600 dark:text-slate-400">belum pernah lewat udara</span>
          ) : (
            <>
              <span className={BENTUK + " " + TEKS_PEMBARUAN[pembaruan.status].warna}>{TEKS_PEMBARUAN[pembaruan.status].teks}</span>{" "}
              <span className="font-mono text-slate-800 dark:text-slate-100">
                {pembaruan.dari ?? "?"} → {pembaruan.ke}
              </span>
              <span className="text-slate-600 dark:text-slate-400"> · {tanggalJamWib(Date.parse(pembaruan.diperbarui))}</span>
              {pembaruan.pesan !== null ? (
                <span className="block break-words text-slate-600 dark:text-slate-400">{pembaruan.pesan}</span>
              ) : null}
            </>
          )}
        </div>
      )}
      {nonaktif ? (
        <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          Dinonaktifkan: kuncinya dicabut dan kirimannya diabaikan. Hidup lagi hanya dengan kunci baru atau kode klaim baru.
        </p>
      ) : null}

      {jenis === "node1" ? <RiwayatPembaruan deviceId={id} versi={pembaruan === null ? "" : pembaruan.id + pembaruan.status} /> : null}

      {/* tombol-tombol armada: digambar HANYA kalau peran admin sudah pasti (pola Modul 24). Untuk perangkat yang sudah
          dinonaktifkan, TindakanArmada hanya menampilkan langkah tangan sesudah Nonaktifkan (bila ada) */}
      {admin ? (
        <TindakanArmada p={baris} status={status} fw={fw} pembaruan={pembaruan} rilis={rilis} terbaru={terbaru} otaSiap={otaSiap} onBerubah={onBerubah} />
      ) : null}
    </article>
  );
}
