// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data ini hilang saat server dimatikan; salinan permanennya disimpan ke database oleh arsip.ts (Modul 17).
import type { Ack, Keadaan, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

export interface Perangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  status: Status | "belum-diketahui";
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
  reported: Keadaan | null; // Modul 19: keadaan aktuator yang terakhir dilaporkan perangkat (telemetry.state atau ack.state)
  reported_ts: string | null; // Modul 19: ts laporan itu, menurut jam perangkat
  reported_pada: string | null; // Modul 19: waktu server (UTC) saat laporan itu tiba
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0, diabaikan: 0 }; // Modul 21: diabaikan = pengirim belum terdaftar/dicabut

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = {
      device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null,
      vitals: null, reported: null, reported_ts: null, reported_pada: null,
    };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
}

// Modul 19: simpan laporan keadaan aktuator, kecuali laporan itu lebih tua daripada yang sudah tersimpan (ts perangkat).
// Waktu berformat kontrak (2026-10-21T06:10:12Z) bisa dibandingkan langsung sebagai teks. Hasilnya true kalau dipakai.
export function simpanLaporan(deviceId: string, keadaan: Keadaan, ts: string | null): boolean {
  const p = ambilAtauBuat(deviceId);
  if (ts !== null && p.reported_ts !== null && ts < p.reported_ts) return false;
  p.reported = keadaan;
  p.reported_ts = ts ?? p.reported_ts; // ack.ts boleh null (jam perangkat belum disetel)
  p.reported_pada = new Date().toISOString();
  return true;
}

export function simpanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const p = ambilAtauBuat(deviceId);
  p.jenis = "tekanan" in isi ? "node2" : "node1";
  p.telemetry = isi;
}

export function simpanStatus(deviceId: string, status: Status): void {
  ambilAtauBuat(deviceId).status = status;
}

export function simpanVitals(deviceId: string, isi: Vitals): void {
  ambilAtauBuat(deviceId).vitals = isi;
}

export function semuaPerangkat(): Perangkat[] {
  return [...daftar.values()];
}

export function cariPerangkat(deviceId: string): Perangkat | undefined {
  return daftar.get(deviceId);
}

// Perintah yang sedang menunggu ack, menurut id perintah.
const menunggu = new Map<string, (ack: Ack) => void>();

export function tungguAck(idPerintah: string, batasMs: number): Promise<Ack | null> {
  return new Promise((selesai) => {
    const pengatur = setTimeout(() => {
      menunggu.delete(idPerintah);
      selesai(null); // tidak ada jawaban sampai batas waktu
    }, batasMs);
    menunggu.set(idPerintah, (ack) => {
      clearTimeout(pengatur);
      menunggu.delete(idPerintah);
      selesai(ack);
    });
  });
}

// Dipanggil saat ack tiba; false kalau tidak ada perintah yang menunggunya.
export function serahkanAck(ack: Ack): boolean {
  const serahkan = menunggu.get(ack.id);
  if (serahkan === undefined) return false;
  serahkan(ack);
  return true;
}
