// sandi.ts - aturan kata sandi dan "sidik jari"-nya (hash bcrypt), Modul 20. Database hanya menyimpan sidik jari:
// dari sidik jari, sandi aslinya tidak bisa dihitung balik, tetapi sandi yang diketik bisa dicocokkan dengannya.
import bcrypt from "bcrypt";
import { z } from "zod";

// cost 12 = 2^12 putaran: sekitar 0,3 detik di laptop i5 tahun 2021. Naik 1 = dua kali lebih lama (OWASP: minimal 10, < 1 detik).
export const COST = 12;

// Aturan sandi baru (NIST SP 800-63B-4): yang penting PANJANG, bukan campuran huruf besar-angka-simbol.
// bcrypt hanya membaca 72 byte pertama, jadi sandi yang lebih panjang ditolak (bukan diam-diam dipotong).
export const Sandi = z.string()
  .min(15, "sandi minimal 15 karakter; pakai kalimat sandi: beberapa kata yang hanya kamu yang tahu")
  .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "sandi maksimal 72 byte (batas bcrypt; satu emoji = 4 byte)");

export function buatSidikJari(sandi: string): Promise<string> {
  return bcrypt.hash(sandi, COST); // garam (salt) acak dibuat otomatis dan ikut tersimpan di dalam hasilnya
}

// Sidik jari palsu untuk email yang tidak terdaftar: bcrypt.compare tetap dijalankan, jadi jawaban "email salah" sama
// lamanya dengan "sandi salah" dan penyerang tidak bisa menebak email mana yang terdaftar dari lamanya jawaban.
// Dibuat SEKALI saat server mulai (bukan saat pertama dibutuhkan: itu membuat percobaan pertama dua kali lebih lama).
const sidikPalsu = bcrypt.hash("bukan sandi siapa pun", COST);

// Hasilnya true kalau sandi cocok. sidikJari undefined/null = akun tidak ada atau belum punya sandi (tetap dihitung).
export async function cocokkanSandi(sandi: string, sidikJari: string | null | undefined): Promise<boolean> {
  if (sidikJari === null || sidikJari === undefined) {
    await bcrypt.compare(sandi, await sidikPalsu); // hasilnya dibuang: hanya supaya waktunya sama
    return false;
  }
  return bcrypt.compare(sandi, sidikJari);
}
