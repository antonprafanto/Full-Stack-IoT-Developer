// log.test.ts - uji saringan log permintaan (Modul 26): ketukan /health yang berhasil dari healthcheck Docker tidak dicatat,
// semua permintaan lain tetap dicatat. Fungsi murni: tanpa server, tanpa database, tanpa jaringan. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { perluDicatat } from "./log.ts";

describe("saringan log permintaan", () => {
  it("GET dan HEAD /health yang berhasil TIDAK dicatat (healthcheck Docker setiap 15 detik)", () => {
    expect(perluDicatat("HEAD", "/health", 200)).toBe(false);
    expect(perluDicatat("GET", "/health", 200)).toBe(false);
    expect(perluDicatat("GET", "/health?asal=uptime-kuma", 200)).toBe(false); // ?… di belakang tidak mengubah alamatnya
  });

  it("/health yang GAGAL tetap dicatat, supaya masalahnya terlihat di docker compose logs", () => {
    expect(perluDicatat("HEAD", "/health", 500)).toBe(true);
    expect(perluDicatat("GET", "/health", 503)).toBe(true);
  });

  it("alamat lain, metode lain, dan alamat yang hanya mirip tetap dicatat", () => {
    expect(perluDicatat("GET", "/devices", 200)).toBe(true);
    expect(perluDicatat("HEAD", "/devices", 200)).toBe(true);
    expect(perluDicatat("POST", "/health", 404)).toBe(true);
    expect(perluDicatat("GET", "/healthz", 404)).toBe(true);
    expect(perluDicatat("GET", "/health/lain", 404)).toBe(true);
    expect(perluDicatat("POST", "/auth/login", 401)).toBe(true);
  });
});
