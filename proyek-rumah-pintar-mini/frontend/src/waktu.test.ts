// waktu.test.ts - uji pembantu jam di layar (Modul 29). Jam dashboard selalu WIB, apa pun zona waktu laptop, HP, atau
// komputer robot yang menjalankan tes ini (robot GitHub Actions memakai jam UTC). Jalankan dari folder frontend: npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { jamRelatif, jamWib, MENIT } from "./waktu";

describe("jam di layar (waktu.ts)", () => {
  // sesudah setiap tes: kembalikan zona waktu asli komputer ini (vi.stubEnv di bawah hanya meminjamnya)
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("jamWib: jam WIB, apa pun zona waktu komputernya", () => {
    // UTC (robot), WIB, WITA, WIT. vi.stubEnv("TZ", …) = seolah-olah komputer ini diatur ke zona waktu itu. Hanya berlaku
    // untuk format yang dibuat SAAT dipanggil (toLocaleTimeString di jamWib). Pembentuk Intl.DateTimeFormat yang dibuat sekali
    // saat waktu.ts dimuat (JAM_MENIT dan kawan-kawan) memakai zona waktu saat dimuat: itu dijaga robot yang berjam UTC.
    for (const zona of ["UTC", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]) {
      vi.stubEnv("TZ", zona);
      // Z di ujung = jam UTC. WIB = UTC + 7 jam.
      expect(jamWib("2026-10-24T09:27:10Z")).toBe("16.27.10 WIB");
      expect(jamWib("2026-10-24T17:05:00Z")).toBe("00.05.00 WIB"); // sudah lewat tengah malam di Indonesia
    }
  });

  it("jamRelatif: di bawah 5 detik 'baru saja' (juga bila jam server sedikit lebih cepat), sesudahnya '… yang lalu'", () => {
    const sekarang = Date.parse("2026-10-24T09:30:00Z");
    expect(jamRelatif(sekarang - 3000, sekarang)).toBe("baru saja");
    // jam server 2 detik lebih cepat daripada jam HP: tetap "baru saja", bukan "dalam waktu 2 detik"
    expect(jamRelatif(sekarang + 2000, sekarang)).toBe("baru saja");
    expect(jamRelatif(sekarang - 45 * 1000, sekarang)).toBe("45 detik yang lalu");
    expect(jamRelatif(sekarang - 3 * MENIT, sekarang)).toBe("3 menit yang lalu");
  });
});
