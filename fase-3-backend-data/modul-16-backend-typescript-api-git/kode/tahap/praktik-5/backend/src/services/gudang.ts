// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data hilang saat server dimatikan; Modul 17 menggantinya dengan database.
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

export interface Perangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  status: Status | "belum-diketahui";
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0 };

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = { device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
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
