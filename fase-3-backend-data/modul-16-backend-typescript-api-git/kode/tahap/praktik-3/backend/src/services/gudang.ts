// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data hilang saat server dimatikan; Modul 17 menggantinya dengan database.

export interface Perangkat {
  device_id: string;
  status: string;
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: unknown; // belum diperiksa sama sekali (Praktik 4 memasang pemeriksanya)
  vitals: unknown;
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0 };

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = { device_id: deviceId, status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
}

export function simpanTelemetry(deviceId: string, isi: unknown): void {
  ambilAtauBuat(deviceId).telemetry = isi;
}

export function simpanStatus(deviceId: string, status: string): void {
  ambilAtauBuat(deviceId).status = status;
}

export function simpanVitals(deviceId: string, isi: unknown): void {
  ambilAtauBuat(deviceId).vitals = isi;
}

export function semuaPerangkat(): Perangkat[] {
  return [...daftar.values()];
}

export function cariPerangkat(deviceId: string): Perangkat | undefined {
  return daftar.get(deviceId);
}
