// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data hilang saat server dimatikan; Modul 17 menggantinya dengan database.
import type { Ack, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

export interface Perangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  status: Status | "belum-diketahui";
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
  riwayat: (TelemetryNode1 | TelemetryNode2)[]; // paling banyak 20 telemetry terakhir, yang terlama di depan
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0 };

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = { device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null, riwayat: [] };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
}

export function simpanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const p = ambilAtauBuat(deviceId);
  p.jenis = "tekanan" in isi ? "node2" : "node1";
  p.telemetry = isi;
  p.riwayat.push(isi);
  if (p.riwayat.length > 20) p.riwayat.shift(); // buang yang terlama
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
